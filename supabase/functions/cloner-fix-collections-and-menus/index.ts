// Migration fix pass (non-destructive):
//   (1) Smart collection mapping — ONLY SMART_COLLECTION_RECOVERY_HANDLES (DJI drone); remap metafield definition
//       IDs in rules and apply ruleSet via collectionUpdate.
//   (2) Menu recovery — prune invalid links; menuUpdate existing menus; collection links
//       only for live target collections or approved_restore_handles.
//   (3) Collection gap audit — classify missing collections; output restore candidates
//       for manual approval. Does NOT auto-restore deleted collections.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  MIGRATION_ID_DEFAULT,
  runSmartCollectionMappingPass,
} from "../_shared/cloner-smart-collection-mapping.ts";
import { runMenuRecoveryPass } from "../_shared/cloner-menu-recovery.ts";
import {
  buildMigrationAuditReport,
  formatMigrationAuditMarkdown,
} from "../_shared/cloner-migration-audit.ts";
import {
  SMART_COLLECTION_RECOVERY_HANDLES,
  EXCLUDED_SMART_COLLECTION_RECOVERY_HANDLES,
  formatCollectionGapMarkdown,
  buildCollectionGapAudit,
} from "../_shared/cloner-collection-gap-classifier.ts";
import { resolveShopAccess, shopifyGraphql } from "../_shared/cloner-shopify-access.ts";
import { publishMenuDependencyPages } from "../_shared/cloner-menu-dependency-pages.ts";
import { resolveShopAccess, shopifyGraphql, shopifyRest } from "../_shared/cloner-shopify-access.ts";

type Body = {
  migration_id?: string;
  dry_run?: boolean;
  collections_only?: boolean;
  menus_only?: boolean;
  /** Publish missing menu dependency pages (published: true) before menu recovery. */
  publish_menu_pages?: boolean;
  skip_collections?: boolean;
  handles?: string[];
  /** Explicit operator approval before any collection restore (not performed by this function). */
  approved_restore_handles?: string[];
  /** Menu handles to delete on the live target (destructive; operator approval required). */
  delete_menu_handles?: string[];
  include_audit?: boolean;
};

  handles?: string[];
  approved_restore_handles?: string[];
  delete_menu_handles?: string[];
  list_all_menus?: boolean;
  /** Read-only theme-reference probe. Scans main theme JSON assets for each handle. */
  theme_menu_refs?: string[];
  include_audit?: boolean;
  skip_gap_audit?: boolean;
};

async function probeThemeMenuRefs(targetStore: any, handles: string[]) {
  const access = await resolveShopAccess(targetStore);
  const themesRes: any = await shopifyRest(access, "GET", "themes.json");
  const themes = themesRes?.themes || [];
  const mainTheme = themes.find((t: any) => t.role === "main") || themes[0];
  if (!mainTheme) return { error: "no_main_theme_found", themes };

  const assetsRes: any = await shopifyRest(access, "GET", `themes/${mainTheme.id}/assets.json`);
  const allAssets = assetsRes?.assets || [];
  const jsonAssets = allAssets.filter((a: any) =>
    typeof a.key === "string" && a.key.endsWith(".json") &&
    (a.key.startsWith("config/") || a.key.startsWith("templates/") || a.key.startsWith("sections/"))
  );

  const perHandle: Record<string, { matches: Array<{ asset: string; snippet: string }>; total: number }> = {};
  for (const h of handles) perHandle[h] = { matches: [], total: 0 };
  const otherMenuHandles = new Set<string>();
  const menuHandleRegex = /"(?:menu|linklist|main_linklist|footer_linklist|navigation)"\s*:\s*"([a-z0-9-_]+)"/gi;
  const scannedAssets: string[] = [];
  const errors: any[] = [];

  for (const a of jsonAssets) {
    try {
      const r: any = await shopifyRest(access, "GET", `themes/${mainTheme.id}/assets.json?asset[key]=${encodeURIComponent(a.key)}`);
      const content: string = r?.asset?.value || "";
      if (!content) continue;
      scannedAssets.push(a.key);
      for (const h of handles) {
        const needle = `"${h}"`;
        let idx = 0;
        while ((idx = content.indexOf(needle, idx)) !== -1) {
          const start = Math.max(0, idx - 80);
          const end = Math.min(content.length, idx + needle.length + 80);
          perHandle[h].matches.push({ asset: a.key, snippet: content.slice(start, end).replace(/\s+/g, " ") });
          perHandle[h].total++;
          idx = end;
          if (perHandle[h].matches.length >= 20) break;
        }
      }
      let m;
      while ((m = menuHandleRegex.exec(content)) !== null) {
        if (m[1]) otherMenuHandles.add(m[1]);
      }
    } catch (e) {
      errors.push({ asset: a.key, error: (e as Error).message });
    }
  }

  return {
    theme: { id: mainTheme.id, name: mainTheme.name, role: mainTheme.role },
    scanned_asset_count: scannedAssets.length,
    per_handle: perHandle,
    all_menu_handles_referenced_in_theme: [...otherMenuHandles].sort(),
    errors,
  };
}

async function listAllTargetMenus(targetStore: any) {
  const access = await resolveShopAccess(targetStore);
  const all: Array<{ id: string; handle: string; title: string; is_default: boolean; item_count: number }> = [];
  let cursor: string | null = null;
  for (let page = 0; page < 30; page++) {
    const data = await shopifyGraphql(access, `
      query($cursor: String) {
        menus(first: 50, after: $cursor) {
          pageInfo { hasNextPage endCursor }
          nodes {
            id handle title isDefault
            items { id items { id items { id } } }
          }
        }
      }`, { cursor });
    for (const n of data?.menus?.nodes || []) {
      if (!n?.handle) continue;
      const countItems = (items: any[]): number => {
        let c = 0;
        for (const it of items || []) {
          c += 1;
          if (it.items?.length) c += countItems(it.items);
        }
        return c;
      };
      all.push({
        id: String(n.id),
        handle: String(n.handle),
        title: String(n.title || n.handle),
        is_default: !!n.isDefault,
        item_count: countItems(n.items || []),
      });
    }
    if (!data?.menus?.pageInfo?.hasNextPage) break;
    cursor = data?.menus?.pageInfo?.endCursor ?? null;
  }
  all.sort((a, b) => a.handle.localeCompare(b.handle));
  return all;
}

async function deleteMenusOnTarget(
  admin: any,
  targetStore: any,
  handles: string[],
  dryRun: boolean,
) {
  const access = await resolveShopAccess(targetStore);
  const menusData = await shopifyGraphql(access, `
    query($cursor: String) {
      menus(first: 50, after: $cursor) {
        pageInfo { hasNextPage endCursor }
        nodes { id handle title }
      }
    }`, { cursor: null });
  const byHandle = new Map<string, { id: string; title: string }>();
  for (const n of menusData?.menus?.nodes || []) {
    if (n?.handle) byHandle.set(String(n.handle), { id: n.id, title: n.title });
  }
  const byHandle = new Map<string, { id: string; title: string }>();
  let cursor: string | null = null;
  for (let i = 0; i < 100; i++) {
    const menusData: any = await shopifyGraphql(access, `
      query($cursor: String) {
        menus(first: 250, after: $cursor) {
          pageInfo { hasNextPage endCursor }
          nodes { id handle title }
        }
      }`, { cursor });
    for (const n of menusData?.menus?.nodes || []) {
      if (n?.handle) byHandle.set(String(n.handle), { id: n.id, title: n.title });
    }
    if (!menusData?.menus?.pageInfo?.hasNextPage) break;
    cursor = menusData.menus.pageInfo.endCursor;
  }

  const results: any[] = [];
  for (const h of handles) {
    const m = byHandle.get(h);
    if (!m) { results.push({ handle: h, result: "not_found_on_target" }); continue; }
    if (dryRun) { results.push({ handle: h, id: m.id, title: m.title, result: "would_delete" }); continue; }
    const data = await shopifyGraphql(access, `
      mutation($id: ID!) {
        menuDelete(id: $id) {
          deletedMenuId
          userErrors { field message }
        }
      }`, { id: m.id });
    const errs = data?.menuDelete?.userErrors || [];
    results.push({
      handle: h,
      id: m.id,
      title: m.title,
      result: errs.length ? "failed" : "deleted",
      errors: errs,
    });
  }
  return results;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    // AuthZ: this function performs destructive Shopify mutations
    // (menuUpdate, menuDelete, collectionUpdate). Restrict to service-role
    // or a platform admin caller.
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization") ?? "";
    const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
    let authorized = false;
    if (bearer && bearer === serviceRole) {
      authorized = true;
    } else if (bearer) {
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: `Bearer ${bearer}` } },
      });
      const { data: userRes } = await userClient.auth.getUser();
      if (userRes?.user) {
        const adminClient = createClient(supabaseUrl, serviceRole);
        const { data: isAdmin } = await adminClient.rpc("has_role", {
          _user_id: userRes.user.id,
          _role: "admin",
        });
        if (isAdmin) authorized = true;
      }
    }
    if (!authorized) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: Body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const migrationId = body.migration_id || MIGRATION_ID_DEFAULT;
    const dryRun = !!body.dry_run;
    const approvedRestoreHandles = body.approved_restore_handles || [];
    const admin = createClient(supabaseUrl, serviceRole);

    const { data: migration } = await admin.from("cloner_migrations").select("*").eq("id", migrationId).single();
    const { data: source } = await admin.from("cloner_stores").select("*").eq("id", migration!.source_store_id).single();
    const { data: target } = await admin.from("cloner_stores").select("*").eq("id", migration!.target_store_id).single();

    const collectionGap = await buildCollectionGapAudit(admin, {
      migrationId,
      migrationName: migration!.name,
      sourceStore: source,
      targetStore: target!,
      approvedRestoreHandles,
    });
    if (body.list_all_menus) {
      const all_target_menus = await listAllTargetMenus(target);
      return new Response(JSON.stringify({
        ok: true,
        migration_id: migrationId,
        target_domain: target?.shop_domain,
        all_target_menus,
        total: all_target_menus.length,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (body.theme_menu_refs?.length) {
      const probe = await probeThemeMenuRefs(target, body.theme_menu_refs);
      return new Response(JSON.stringify({
        ok: true,
        migration_id: migrationId,
        target_domain: target?.shop_domain,
        theme_menu_refs: probe,
      }, null, 2), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }


    const runGap = body.skip_gap_audit !== true && body.include_audit !== false;
    const collectionGap = runGap
      ? await buildCollectionGapAudit(admin, {
        migrationId,
        migrationName: migration!.name,
        sourceStore: source,
        targetStore: target!,
        approvedRestoreHandles,
      })
      : null;

    const out: Record<string, unknown> = {
      migration_id: migrationId,
      dry_run: dryRun,
      smart_collection_recovery_handles: [...SMART_COLLECTION_RECOVERY_HANDLES],
      excluded_smart_collection_recovery_handles: [...EXCLUDED_SMART_COLLECTION_RECOVERY_HANDLES],
      collections: null,
      menus: null,
      collection_gap: collectionGap,
      collection_gap_markdown: formatCollectionGapMarkdown(collectionGap),
      restore_approval_required: collectionGap.pending_restore_approval.map((r) => ({
      collection_gap_markdown: collectionGap ? formatCollectionGapMarkdown(collectionGap) : null,
      restore_approval_required: collectionGap?.pending_restore_approval.map((r) => ({
        handle: r.handle,
        title: r.title,
        required_by: r.required_by,
        db_publish_status: r.db_publish_status,
      })),
      note: "No missing collections are auto-restored. Pass approved_restore_handles after manual review.",
    };

    if (body.publish_menu_pages !== false && !body.collections_only) {
      out.menu_pages = await publishMenuDependencyPages(admin, target, {
        migrationId,
        dryRun,
      });
    }

    if (!body.menus_only && !body.skip_collections) {
      })) ?? [],
      note: "No missing collections are auto-restored. Pass approved_restore_handles after manual review.",
    };

    if (!body.menus_only) {
      out.collections = await runSmartCollectionMappingPass(admin, {
        migrationId,
        dryRun,
        handles: body.handles?.length ? body.handles : [...SMART_COLLECTION_RECOVERY_HANDLES],
      });
    }

    if (!body.collections_only) {
      out.menus = await runMenuRecoveryPass(admin, {
        migrationId,
        dryRun,
        approvedRestoreHandles,
      });
    }

    if (body.delete_menu_handles?.length) {
      out.menu_deletions = await deleteMenusOnTarget(admin, target, body.delete_menu_handles, dryRun);
    }

    if (body.include_audit !== false) {
      const collSummary = (out.collections as any)?.summary;
      const menuSummary = (out.menus as any)?.summary;
      const audit = await buildMigrationAuditReport(admin, {
        migrationId,
        approvedRestoreHandles,
        collectionFixSummary: collSummary ? { fixed: collSummary.fixed, failed: collSummary.failed } : undefined,
        menuFixSummary: menuSummary
          ? { fixed: menuSummary.fixed, failed: menuSummary.failed, skipped_limit: menuSummary.skipped_limit }
          : undefined,
      });
      out.audit = audit;
      out.audit_markdown = formatMigrationAuditMarkdown(audit);
    }

    return new Response(JSON.stringify(out, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
