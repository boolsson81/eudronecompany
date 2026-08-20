import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { resolveShopAccess, shopifyGraphql, shopifyRest, type ShopAccess } from "./cloner-shopify-access.ts";
import { pruneMenuItems } from "./cloner-menu-recovery.ts";
import { allowedMenuCollectionHandles } from "./cloner-collection-gap-classifier.ts";

const LIVE_MENUS_QUERY = `
  query LiveMenusInventory($cursor: String) {
    menus(first: 50, after: $cursor) {
      edges {
        cursor
        node {
          id
          handle
          title
          items {
            id
            title
            url
            type
            items {
              id
              title
              url
              type
              items { id title url type }
            }
          }
        }
      }
      pageInfo { hasNextPage }
    }
  }
`;

export type MenuInventoryRow = {
  title: string;
  handle: string;
  menu_id: string;
  item_count: number;
  duplicate_status: "unique" | "duplicate_handle" | "duplicate_title" | "duplicate_both";
  duplicate_of_handles: string[];
  in_migration_db: boolean;
  migration_publish_status: string | null;
  migration_error: string | null;
  created_by_migration_attempt: boolean;
  referenced_by_theme: boolean;
  theme_reference_locations: string[];
  dry_run_validation: "pass" | "fail" | "skipped" | "not_in_migration_queue";
  validation_error: string | null;
  removed_links_count: number;
  kept_links_count: number;
  classification: "canonical" | "duplicate_candidate" | "legacy_orphan" | "migration_failed" | "empty_legacy";
  safe_to_remove: "no" | "review" | "yes_after_theme_confirm";
  recommendation: string;
};

function countMenuItems(items: any[]): number {
  let n = 0;
  for (const it of items || []) {
    n += 1;
    if (it.items?.length) n += countMenuItems(it.items);
  }
  return n;
}

async function paginateMenus(access: ShopAccess) {
  const all: any[] = [];
  let cursor: string | null = null;
  for (let page = 0; page < 20; page++) {
    const data = await shopifyGraphql(access, LIVE_MENUS_QUERY, { cursor });
    const edges = data?.menus?.edges || [];
    for (const e of edges) {
      if (e?.node?.handle) all.push(e.node);
    }
    if (!data?.menus?.pageInfo?.hasNextPage) break;
    cursor = edges.length ? edges[edges.length - 1].cursor : null;
  }
  return all;
}

async function fetchTargetHandles(access: ShopAccess) {
  const pages = new Set<string>();
  const liveCollections = new Set<string>();
  for (const ep of ["pages.json?limit=250", "custom_collections.json?limit=250", "smart_collections.json?limit=250"]) {
    const j = await shopifyRest(access, "GET", ep);
    for (const p of j.pages || []) pages.add(p.handle);
    for (const c of j.custom_collections || j.smart_collections || []) liveCollections.add(c.handle);
  }
  return { pages, liveCollections };
}

async function scanThemeMenuReferences(access: ShopAccess): Promise<Map<string, string[]>> {
  const refs = new Map<string, string[]>();
  const themes = await shopifyRest(access, "GET", "themes.json");
  const main = (themes.themes || []).find((t: any) => t.role === "main") || themes.themes?.[0];
  if (!main?.id) return refs;

  const assets = await shopifyRest(access, "GET", `themes/${main.id}/assets.json`);
  const keys = (assets.assets || [])
    .map((a: any) => a.key)
    .filter((k: string) =>
      k === "config/settings_data.json" ||
      k.startsWith("sections/") && k.endsWith(".json") ||
      k.startsWith("templates/") && k.endsWith(".json")
    )
    .slice(0, 80);

  for (const key of keys) {
    try {
      const asset = await shopifyRest(access, "GET", `themes/${main.id}/assets.json?asset[key]=${encodeURIComponent(key)}`);
      const content = asset.asset?.value || "";
      if (!content) continue;
      const menuHandlePattern = /"menu"\s*:\s*"([^"]+)"/g;
      let m;
      while ((m = menuHandlePattern.exec(content)) !== null) {
        const handle = m[1];
        const locs = refs.get(handle) || [];
        locs.push(key);
        refs.set(handle, locs);
      }
      const linkListPattern = /"menu_handle"\s*:\s*"([^"]+)"/g;
      while ((m = linkListPattern.exec(content)) !== null) {
        const handle = m[1];
        const locs = refs.get(handle) || [];
        locs.push(key);
        refs.set(handle, locs);
      }
    } catch (_) {
      /* skip unreadable assets */
    }
  }
  return refs;
}

const CANONICAL_HANDLES = new Set([
  "main-menu",
  "meny",
  "footer",
  "partnership",
  "enterprise-dr-nare",
  "customer-account-main-menu",
]);

export async function buildShopifyMenuInventoryAudit(
  admin: SupabaseClient,
  opts: {
    migrationId: string;
    targetStore: { shop_domain?: string | null; access_token?: string | null; api_version?: string | null };
  },
): Promise<{
  generated_at: string;
  migration_id: string;
  target_domain: string;
  total_live_menus: number;
  total_migration_menu_rows: number;
  duplicate_groups: Array<{ key: string; handles: string[] }>;
  failing_validation: MenuInventoryRow[];
  canonical_menus: MenuInventoryRow[];
  duplicate_safe_to_remove: MenuInventoryRow[];
  rows: MenuInventoryRow[];
  recommendations: string[];
}> {
  const targetAccess = await resolveShopAccess(opts.targetStore);

  const [{ data: menuItems }, liveMenus, themeRefs, targetHandles] = await Promise.all([
    admin
      .from("cloner_migration_items")
      .select("id,source_handle,source_payload,publish_status,error,target_id,target_handle")
      .eq("migration_id", opts.migrationId)
      .eq("object_type", "menu"),
    paginateMenus(targetAccess),
    scanThemeMenuReferences(targetAccess),
    fetchTargetHandles(targetAccess),
  ]);

  const migrationByHandle = new Map(
    (menuItems || []).map((m: any) => [String(m.source_handle || (m.source_payload as any)?.handle), m]),
  );
  const failedMigrationHandles = new Set(
    (menuItems || []).filter((m: any) => m.publish_status === "failed").map((m: any) => String(m.source_handle)),
  );

  const handleCounts = new Map<string, number>();
  const titleCounts = new Map<string, string[]>();
  for (const m of liveMenus) {
    handleCounts.set(m.handle, 1);
    const t = String(m.title || "").toLowerCase().trim();
    const arr = titleCounts.get(t) || [];
    arr.push(m.handle);
    titleCounts.set(t, arr);
  }

  const duplicateGroups: Array<{ key: string; handles: string[] }> = [];
  for (const [title, handles] of titleCounts) {
    if (handles.length > 1) duplicateGroups.push({ key: `title:${title}`, handles });
  }

  const allowed = allowedMenuCollectionHandles(targetHandles.liveCollections, new Set());

  const rows: MenuInventoryRow[] = liveMenus.map((m: any) => {
    const handle = String(m.handle);
    const title = String(m.title || handle);
    const item_count = countMenuItems(m.items || []);
    const mig = migrationByHandle.get(handle);
    const themeLocs = themeRefs.get(handle) || [];
    const titleDupes = (titleCounts.get(title.toLowerCase().trim()) || []).filter((h) => h !== handle);

    let duplicate_status: MenuInventoryRow["duplicate_status"] = "unique";
    if (titleDupes.length) duplicate_status = "duplicate_title";

    const migRow = failedMigrationHandles.has(handle) ? migrationByHandle.get(handle) : mig;
    let dry_run_validation: MenuInventoryRow["dry_run_validation"] = "not_in_migration_queue";
    let validation_error: string | null = null;
    let removed_links_count = 0;
    let kept_links_count = 0;

    if (migRow && migRow.publish_status === "failed") {
      const src = migRow.source_payload as any;
      const { kept, removed, deferred } = pruneMenuItems(src?.items || [], {
        pages: targetHandles.pages,
        liveCollections: targetHandles.liveCollections,
        approvedRestoreCollections: new Set(),
      });
      removed_links_count = removed.length;
      kept_links_count = kept.length;
      if (deferred.length) {
        dry_run_validation = "skipped";
        validation_error = "deferred links pending collection restore";
      } else if (kept.length === 0) {
        dry_run_validation = "fail";
        validation_error = themeLocs.length
          ? "all items pruned but menu exists on live store"
          : "all items pruned; no live menu to update (orphan migration row)";
      } else {
        dry_run_validation = "pass";
      }
    } else if (mig?.publish_status === "published") {
      dry_run_validation = "pass";
      kept_links_count = item_count;
    }

    let classification: MenuInventoryRow["classification"] = "canonical";
    if (CANONICAL_HANDLES.has(handle) || (mig && mig.publish_status === "published")) {
      classification = "canonical";
    } else if (duplicate_status !== "unique" || titleDupes.length) {
      classification = "duplicate_candidate";
    } else if (mig?.publish_status === "failed") {
      classification = "migration_failed";
    } else if (item_count === 0 && !mig) {
      classification = "empty_legacy";
    } else if (!mig) {
      classification = "legacy_orphan";
    }

    let safe_to_remove: MenuInventoryRow["safe_to_remove"] = "no";
    if (themeLocs.length) {
      safe_to_remove = "no";
    } else if (classification === "duplicate_candidate" && !CANONICAL_HANDLES.has(handle)) {
      safe_to_remove = "review";
    } else if (classification === "empty_legacy" && !mig) {
      safe_to_remove = "yes_after_theme_confirm";
    } else if (dry_run_validation === "fail" && !themeLocs.length && item_count === 0) {
      safe_to_remove = "yes_after_theme_confirm";
    }

    let recommendation = "Keep — canonical or theme-referenced.";
    if (dry_run_validation === "fail") {
      recommendation = kept_links_count === 0 && themeLocs.length
        ? "Clear menu via menuUpdate([]) after deploy of menu-recovery fix, OR remove from theme first."
        : "Orphan failed migration row — no live menu; mark migration item skipped, no Shopify delete needed.";
    } else if (safe_to_remove === "yes_after_theme_confirm") {
      recommendation = "Candidate for manual deletion in Shopify Admin after confirming theme does not reference handle.";
    } else if (safe_to_remove === "review") {
      recommendation = "Duplicate title/handle group — consolidate to canonical handle, then remove duplicate manually.";
    }

    return {
      title,
      handle,
      menu_id: String(m.id),
      item_count,
      duplicate_status,
      duplicate_of_handles: titleDupes,
      in_migration_db: !!mig,
      migration_publish_status: mig?.publish_status ?? null,
      migration_error: mig?.error ? String(mig.error).slice(0, 200) : null,
      created_by_migration_attempt: !!mig,
      referenced_by_theme: themeLocs.length > 0,
      theme_reference_locations: themeLocs,
      dry_run_validation,
      validation_error,
      removed_links_count,
      kept_links_count,
      classification,
      safe_to_remove,
      recommendation,
    };
  });

  rows.sort((a, b) => a.handle.localeCompare(b.handle));

  const failing_validation = rows.filter((r) => r.dry_run_validation === "fail");
  const canonical_menus = rows.filter((r) => r.classification === "canonical");
  const duplicate_safe_to_remove = rows.filter((r) =>
    r.safe_to_remove === "yes_after_theme_confirm" || (r.safe_to_remove === "review" && !r.referenced_by_theme)
  );

  const recommendations: string[] = [];
  if (failing_validation.length) {
    recommendations.push(
      `${failing_validation.length} menu(s) fail dry-run validation: ${failing_validation.map((m) => m.handle).join(", ")}`,
    );
  }
  if (duplicateGroups.length) {
    recommendations.push(`${duplicateGroups.length} duplicate title group(s) detected — consolidate before live fix-pass.`);
  }
  recommendations.push("Do NOT delete any menu until theme references are verified and dry-run shows 9/9 PASS.");

  return {
    generated_at: new Date().toISOString(),
    migration_id: opts.migrationId,
    target_domain: targetAccess.domain,
    total_live_menus: rows.length,
    total_migration_menu_rows: menuItems?.length ?? 0,
    duplicate_groups: duplicateGroups,
    failing_validation,
    canonical_menus,
    duplicate_safe_to_remove,
    rows,
    recommendations,
  };
}
