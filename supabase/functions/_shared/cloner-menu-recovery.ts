import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { allowedMenuCollectionHandles, isLegacyActionKingCollection } from "./cloner-collection-gap-classifier.ts";
import { resolveShopAccess, shopifyGraphql, type ShopAccess } from "./cloner-shopify-access.ts";
import { publishMenuDependencyPages } from "./cloner-menu-dependency-pages.ts";

export type MenuRecoveryAudit = {
  menu_name: string;
  menu_handle: string;
  removed_links: Array<{ title: string; type: string; url: string; reason: string }>;
  deferred_links: Array<{ title: string; type: string; url: string; reason: string }>;
  publish_result: "published" | "updated" | "skipped_limit" | "failed" | "skipped";
  error?: string | null;
  kept_count: number;
};

const MENUS_QUERY = `
  query Menus($cursor: String) {
    menus(first: 50, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      nodes { id handle title }
    }
  }
`;

const MENU_UPDATE_MUTATION = `
  mutation MenuUpdate($id: ID!, $title: String!, $items: [MenuItemUpdateInput!]!) {
    menuUpdate(id: $id, title: $title, items: $items) {
      menu { id handle title }
      userErrors { field message }
    }
  }
`;

const MENU_CREATE_MUTATION = `
  mutation MenuCreate($title: String!, $handle: String!, $items: [MenuItemCreateInput!]!) {
    menuCreate(title: $title, handle: $handle, items: $items) {
      menu { id handle title }
      userErrors { field message }
    }
  }
`;

async function rest(access: ShopAccess, path: string) {
  const r = await fetch(`https://${access.domain}/admin/api/${access.apiVersion}/${path}`, {
    headers: { "X-Shopify-Access-Token": access.token, Accept: "application/json" },
  });
  const text = await r.text();
  const json = text ? JSON.parse(text) : {};
  if (!r.ok) throw new Error(`shopify ${r.status}: ${text.slice(0, 300)}`);
  return json;
}

async function fetchTargetHandles(access: ShopAccess) {
  const pages = new Set<string>();
  const liveCollections = new Set<string>();

  for (const ep of ["pages.json?limit=250&fields=handle,published_at", "custom_collections.json?limit=250", "smart_collections.json?limit=250"]) {
    const j = await rest(access, ep);
    for (const p of j.pages || []) {
      if (p.published_at) pages.add(p.handle);
    }
  for (const ep of ["pages.json?limit=250", "custom_collections.json?limit=250", "smart_collections.json?limit=250"]) {
    const j = await rest(access, ep);
    for (const p of j.pages || []) pages.add(p.handle);
    for (const c of j.custom_collections || j.smart_collections || []) liveCollections.add(c.handle);
  }
  return { pages, liveCollections };
}

async function fetchTargetMenus(access: ShopAccess): Promise<Map<string, { id: string; title: string }>> {
  const map = new Map<string, { id: string; title: string }>();
  let cursor: string | null = null;
  for (let page = 0; page < 10; page++) {
    const data = await shopifyGraphql(access, MENUS_QUERY, { cursor });
    for (const node of data?.menus?.nodes || []) {
      if (node?.handle) map.set(String(node.handle), { id: node.id, title: node.title });
    }
    if (!data?.menus?.pageInfo?.hasNextPage) break;
    cursor = data.menus.pageInfo.endCursor;
  }
  return map;
}

function urlHandle(url: string, prefix: string): string | null {
  const m = String(url || "").match(new RegExp(`/${prefix}/([^/?#]+)`));
  return m ? m[1] : null;
}

/** Remap legacy/missing collection handles to live EuroDroneParts targets. */
const COLLECTION_HANDLE_REMAP: Record<string, string> = {
  dronare: "dji-dronare",
};

function rewriteMenuItemUrls(items: any[]): any[] {
  return (items || []).map((it) => {
    let url = String(it.url || "");
    const collectionHandle = urlHandle(url, "collections");
    if (collectionHandle && COLLECTION_HANDLE_REMAP[collectionHandle]) {
      const mapped = COLLECTION_HANDLE_REMAP[collectionHandle];
      url = url.replace(
        new RegExp(`/collections/${collectionHandle}(?=/|$|\\?)`, "i"),
        `/collections/${mapped}`,
      );
    }
    const pageHandle = urlHandle(url, "pages");
    const titleKey = String(it.title || "").trim().toLowerCase();
    const titlePageMap: Record<string, string> = {
      kontakt: "/pages/kontakt",
      information: "/pages/information",
      "ansök om partnership": "/pages/ansok-om-partnership",
      "reklamationer & återköp": "/pages/reklamationer-aterkop",
    };
    if (titlePageMap[titleKey] && (!pageHandle || !url.includes("/pages/"))) {
      url = titlePageMap[titleKey];
    }
    return {
      ...it,
      url,
      items: rewriteMenuItemUrls(it.items),
    };
  });
}

/**
 * Prune menu items for publish. Validates:
 *   - PAGE / HTTP→/pages/<h> against live target pages
 *   - COLLECTION / HTTP→/collections/<h> against live target collections (+ legacy ActionKing block)
 *   - CUSTOMER_ACCOUNT_PAGE always pruned (not configured on target)
 * Recurses into nested submenu items so children are validated the same way.
 * Nested kept items are preserved on the kept structure (Shopify MenuItem*Input supports `items`).
 */
/** Shopify menuUpdate on a new store cannot resolve source COLLECTION/PAGE resourceIds — use HTTP + path. */
function normalizeForMenuUpdate(items: any[]): any[] {
  return (items || []).map((it) => ({
    title: it.title,
    type: "HTTP",
    url: it.url,
    tags: it.tags || [],
    items: normalizeForMenuUpdate(it.items),
  }));
}

export function pruneMenuItems(
  items: any[],
  ctx: {
    pages: Set<string>;
    liveCollections: Set<string>;
    approvedRestoreCollections: Set<string>;
  },
  path: string[] = [],
): {
  kept: any[];
  removed: MenuRecoveryAudit["removed_links"];
  deferred: MenuRecoveryAudit["deferred_links"];
} {
  const kept: any[] = [];
  const removed: MenuRecoveryAudit["removed_links"] = [];
  const deferred: MenuRecoveryAudit["deferred_links"] = [];

  for (const it of items || []) {
    const rawType = String(it.type || "HTTP").toUpperCase();
    const url = String(it.url || "");
    const titlePath = [...path, String(it.title || "")].filter(Boolean).join(" › ");

    // Infer effective resource type from URL even when type=HTTP
    const pageHandle = urlHandle(url, "pages");
    const collectionHandle = urlHandle(url, "collections");
    let effectiveType = rawType;
    if (rawType === "HTTP") {
      if (pageHandle) effectiveType = "PAGE";
      else if (collectionHandle) effectiveType = "COLLECTION";
    }

    let publishable = true;
    let reason = "";

    if (effectiveType === "PAGE") {
      if (!pageHandle || !ctx.pages.has(pageHandle)) {
        publishable = false;
        reason = `page not on live target: ${pageHandle || "(unparseable)"}`;
      }
    } else if (effectiveType === "COLLECTION") {
      if (!collectionHandle) {
        publishable = false;
        reason = "collection handle not parseable from url";
      } else if (isLegacyActionKingCollection(collectionHandle, it.title)) {
        publishable = false;
        reason = "legacy_actionking_collection_not_restored";
      } else if (!ctx.liveCollections.has(collectionHandle)) {
        if (ctx.approvedRestoreCollections.has(collectionHandle)) {
          deferred.push({
            title: titlePath,
            type: effectiveType,
            url,
            reason: "approved_for_restore_but_not_yet_on_live_target",
          });
          continue;
        }
        publishable = false;
        reason = `collection not on live target: ${collectionHandle}`;
      }
    } else if (effectiveType === "CUSTOMER_ACCOUNT_PAGE") {
      publishable = false;
      reason = "customer_account_page not configured on target";
    }

    if (!publishable) {
      removed.push({ title: titlePath, type: effectiveType, url, reason });
      continue;
    }

    // Recurse into nested submenu items
    const child = pruneMenuItems(
      Array.isArray(it.items) ? it.items : [],
      ctx,
      [...path, String(it.title || "")],
    );
    for (const r of child.removed) removed.push(r);
    for (const d of child.deferred) deferred.push(d);

    kept.push({
      title: it.title,
      type: rawType,
      url,
      tags: it.tags || [],
      items: child.kept,
    });
  }

  return { kept, removed, deferred };
}

export async function runMenuRecoveryPass(
  admin: SupabaseClient,
  opts: {
    migrationId: string;
    dryRun?: boolean;
    approvedRestoreHandles?: string[];
    /** Publish missing menu dependency pages (published: true) before menuUpdate. Default true. */
    publishPages?: boolean;
  },
): Promise<{
  menus: MenuRecoveryAudit[];
  summary: { total: number; fixed: number; failed: number; skipped_limit: number };
  allowed_collection_handles: string[];
  menu_pages?: Awaited<ReturnType<typeof publishMenuDependencyPages>>;
  live_target_menus: Array<{ id: string; handle: string; title: string }>;
}> {
  const approvedRestore = new Set((opts.approvedRestoreHandles || []).map((h) => h.trim()).filter(Boolean));

  const { data: mig } = await admin.from("cloner_migrations")
    .select("target_store_id")
    .eq("id", opts.migrationId)
    .single();
  const { data: targetStore } = await admin.from("cloner_stores")
    .select("*")
    .eq("id", mig!.target_store_id)
    .single();

  let menuPages: Awaited<ReturnType<typeof publishMenuDependencyPages>> | undefined;
  if (opts.publishPages !== false && !opts.dryRun) {
    menuPages = await publishMenuDependencyPages(admin, targetStore, {
      migrationId: opts.migrationId,
      dryRun: false,
    });
  }

  const targetAccess = await resolveShopAccess(targetStore);

  const [{ pages, liveCollections }, targetMenus] = await Promise.all([
    fetchTargetHandles(targetAccess),
    fetchTargetMenus(targetAccess),
  ]);

  const allowed = allowedMenuCollectionHandles(liveCollections, approvedRestore);

  const { data: menuItems } = await admin
    .from("cloner_migration_items")
    .select("id,source_handle,source_payload,error,publish_status,target_id")
    .eq("migration_id", opts.migrationId)
    .eq("object_type", "menu")
    .eq("publish_status", "failed");

  const audits: MenuRecoveryAudit[] = [];
  let fixed = 0;
  let failed = 0;
  let skipped_limit = 0;

  for (const item of menuItems || []) {
    const src = item.source_payload as any;
    const handle = String(src.handle || item.source_handle || "");
    const title = String(src.title || handle);
    const errStr = String(item.error || "");
    const normalizedItems = rewriteMenuItemUrls(src.items || []);
    const { kept, removed, deferred } = pruneMenuItems(normalizedItems, {
    const { kept, removed, deferred } = pruneMenuItems(src.items || [], {
      pages,
      liveCollections,
      approvedRestoreCollections: approvedRestore,
    });

    const existing = targetMenus.get(handle);

    const audit: MenuRecoveryAudit = {
      menu_name: title,
      menu_handle: handle,
      removed_links: removed,
      deferred_links: deferred,
      publish_result: "failed",
      kept_count: kept.length,
    };

    if (kept.length === 0) {
      audit.error = deferred.length
        ? "no publishable items; some links deferred pending collection restore"
        : "all items unresolvable after pruning";
      audit.publish_result = deferred.length ? "skipped" : "failed";
      audits.push(audit);
      if (!deferred.length) failed++;
      continue;
    }

    const existing = targetMenus.get(handle);

      if (deferred.length) {
        audit.error = "no publishable items; some links deferred pending collection restore";
        audit.publish_result = "skipped";
        audits.push(audit);
        continue;
      }
      if (existing) {
        audit.error = null;
        audit.publish_result = opts.dryRun ? "updated" : "updated";
        audits.push(audit);
        if (!opts.dryRun) {
          try {
            const data = await shopifyGraphql(targetAccess, MENU_UPDATE_MUTATION, {
              id: existing.id,
              title,
              items: [],
            });
            const errs = data?.menuUpdate?.userErrors || [];
            if (errs.length) throw new Error(JSON.stringify(errs));
            await admin.from("cloner_migration_items").update({
              publish_status: "published",
              target_id: data.menuUpdate.menu.id,
              target_handle: data.menuUpdate.menu.handle,
              error: null,
              updated_at: new Date().toISOString(),
            }).eq("id", item.id);
            await admin.from("cloner_logs").insert({
              migration_id: opts.migrationId,
              event: "menu_cleared_legacy_only",
              level: "warn",
              message: `Menu ${handle} cleared — all source links were legacy or invalid.`,
              metadata: { item_id: item.id, removed },
            });
            fixed++;
          } catch (e) {
            audit.publish_result = "failed";
            audit.error = (e as Error).message;
            failed++;
          }
        }
        continue;
      }
      audit.error = "legacy_menu_no_live_target_to_clear";
      audit.publish_result = "skipped";
      audits.push(audit);
      continue;
    }

    if (!existing && errStr.includes("limit of menus")) {
      audit.publish_result = "skipped_limit";
      audit.error = "menu limit reached and no existing target menu to update";
      audits.push(audit);
      skipped_limit++;
      continue;
    }

    if (opts.dryRun) {
      audit.publish_result = existing ? "updated" : "published";
      audits.push(audit);
      fixed++;
      continue;
    }

    try {
      let menu: { id: string; handle: string; title: string };
      if (existing) {
        const data = await shopifyGraphql(targetAccess, MENU_UPDATE_MUTATION, {
          id: existing.id,
          title,
          items: normalizeForMenuUpdate(kept),
          items: kept,
        });
        const errs = data?.menuUpdate?.userErrors || [];
        if (errs.length) throw new Error(JSON.stringify(errs));
        menu = data.menuUpdate.menu;
        audit.publish_result = "updated";
      } else {
        const data = await shopifyGraphql(targetAccess, MENU_CREATE_MUTATION, {
          title,
          handle,
          items: normalizeForMenuUpdate(kept),
          items: kept,
        });
        const errs = data?.menuCreate?.userErrors || [];
        if (errs.length) throw new Error(JSON.stringify(errs));
        menu = data.menuCreate.menu;
        audit.publish_result = "published";
      }

      await admin.from("cloner_migration_items").update({
        publish_status: "published",
        target_id: menu.id,
        target_handle: menu.handle,
        error: null,
        updated_at: new Date().toISOString(),
      }).eq("id", item.id);

      await admin.from("cloner_logs").insert({
        migration_id: opts.migrationId,
        event: "menu_recovered_with_pruned_items",
        level: removed.length || deferred.length ? "warn" : "info",
        message: `Menu ${handle} ${audit.publish_result}; ${removed.length} removed, ${deferred.length} deferred.`,
        metadata: { item_id: item.id, kept: kept.length, removed, deferred, menu_id: menu.id },
      });

      fixed++;
      audits.push(audit);
    } catch (e) {
      const msg = (e as Error).message;
      if (msg.includes("limit of menus")) {
        audit.publish_result = "skipped_limit";
        audit.error = msg;
        skipped_limit++;
      } else {
        audit.publish_result = "failed";
        audit.error = msg;
        failed++;
      }
      audits.push(audit);
    }
  }

  if (opts.dryRun) {
    fixed = audits.filter((a) => a.publish_result === "updated" || a.publish_result === "published").length;
    failed = audits.filter((a) => a.publish_result === "failed").length;
  }

  return {
    menus: audits,
    summary: { total: audits.length, fixed, failed, skipped_limit },
    allowed_collection_handles: [...allowed].sort(),
    menu_pages: menuPages,
    live_target_menus: [...targetMenus.entries()].map(([handle, m]) => ({
      id: m.id,
      handle,
      title: m.title,
    })).sort((a, b) => a.handle.localeCompare(b.handle)),
  };
}
