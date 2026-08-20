import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { isLegacyActionKingCollection } from "./cloner-collection-gap-classifier.ts";
import { resolveShopAccess, shopifyGraphql, shopifyRest, type ShopAccess } from "./cloner-shopify-access.ts";

const MENUS_DETAIL_QUERY = `
  query MenusDetail($cursor: String) {
    menus(first: 50, after: $cursor) {
      edges {
        cursor
        node {
          id
          handle
          title
          isDefault
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

const LIVE_COLLECTIONS_QUERY = `
  query LiveCollections($cursor: String) {
    collections(first: 250, after: $cursor) {
      edges { cursor node { id handle title productsCount { count } } }
      pageInfo { hasNextPage }
    }
  }
`;

const LIVE_PAGES_QUERY = `
  query LivePages($cursor: String) {
    pages(first: 250, after: $cursor) {
      edges { cursor node { id handle title isPublished } }
      pageInfo { hasNextPage }
    }
  }
`;

const MENU_DELETE_MUTATION = `
  mutation MenuDelete($id: ID!) {
    menuDelete(id: $id) {
      deletedMenuId
      userErrors { field message }
    }
  }
`;

const ESSENTIAL_HANDLES = new Set([
  "main-menu",
  "footer",
  "customer-account-main-menu",
  "customer-account-menu",
]);

const MIGRATION_TEST_HANDLE_PATTERNS = [
  /^test[-_]/i,
  /[-_]test$/i,
  /^copy[-_]/i,
  /[-_]copy$/i,
  /[-_]duplicate$/i,
  /^menu-\d+$/i,
  /^tmp[-_]/i,
];

export type MenuItemSnapshot = {
  title: string;
  url: string;
  type: string;
  items?: MenuItemSnapshot[];
};

export type MenuInventoryRow = {
  id: string;
  title: string;
  handle: string;
  item_count: number;
  is_default: boolean;
  date_created: string | null;
  date_created_note: string;
  in_source_migration: boolean;
  migration_publish_status: string | null;
  referenced_by_theme: boolean;
  theme_reference_locations: string[];
  is_empty: boolean;
  is_orphan: boolean;
  is_migration_test: boolean;
  has_actionking_links: boolean;
  broken_link_count: number;
  structure_fingerprint: string;
  duplicate_groups: {
    by_title: string | null;
    by_handle: string | null;
    by_structure: string | null;
  };
};

export type MenuCleanupDecision = {
  id: string;
  handle: string;
  title: string;
  action: "keep" | "delete";
  reason: string;
  is_canonical: boolean;
  canonical_for?: string;
};

export type MenuCleanupAuditResult = {
  ok: true;
  mode: "safe" | "execute";
  generated_at: string;
  migration_id: string;
  target_domain: string;
  inventory: MenuInventoryRow[];
  decisions: MenuCleanupDecision[];
  rollback: Array<{
    id: string;
    title: string;
    handle: string;
    is_default: boolean;
    items: MenuItemSnapshot[];
  }>;
  integrity: {
    duplicate_handles: string[];
    duplicate_titles: Array<{ title: string; handles: string[] }>;
    broken_links: Array<{ menu_handle: string; menu_title: string; item_title: string; url: string; type: string; reason: string }>;
    actionking_references: Array<{ menu_handle: string; item_title: string; url: string }>;
    missing_collections: string[];
    missing_pages: string[];
    status: "PASS" | "FAIL";
    failures: string[];
  };
  summary: {
    menus_before: number;
    menus_after: number;
    menus_to_delete: number;
    menus_to_keep: number;
    empty_menus: number;
    orphan_menus: number;
    migration_test_menus: number;
    duplicate_title_groups: number;
    duplicate_handle_groups: number;
    duplicate_structure_groups: number;
  };
  deletions?: Array<{ id: string; handle: string; title: string; result: string; errors?: unknown[] }>;
  confirmation_required: boolean;
  note: string;
};

function countMenuItems(items: any[]): number {
  let n = 0;
  for (const it of items || []) {
    n += 1;
    if (it.items?.length) n += countMenuItems(it.items);
  }
  return n;
}

function snapshotItems(items: any[]): MenuItemSnapshot[] {
  return (items || []).map((it) => ({
    title: String(it.title || ""),
    url: String(it.url || ""),
    type: String(it.type || ""),
    items: it.items?.length ? snapshotItems(it.items) : undefined,
  }));
}

function structureFingerprint(items: any[]): string {
  const walk = (nodes: any[]): string =>
    (nodes || [])
      .map((it) => `${it.title}|${it.type}|${it.url}:[${walk(it.items || [])}]`)
      .join(";");
  return walk(items);
}

function menuNumericId(gid: string): number {
  const m = String(gid).match(/(\d+)$/);
  return m ? Number(m[1]) : 0;
}

function urlHandle(url: string, segment: string): string | null {
  const m = String(url || "").match(new RegExp(`/${segment}/([^/?#]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

function hasActionKingReference(items: any[]): boolean {
  for (const it of items || []) {
    const blob = `${it.title || ""} ${it.url || ""}`.toLowerCase();
    if (blob.includes("actionking") || blob.includes("action king") || blob.includes("bvy0b8")) return true;
    if (it.items?.length && hasActionKingReference(it.items)) return true;
  }
  return false;
}

async function paginateGraphql<T>(
  access: ShopAccess,
  query: string,
  extract: (data: any) => { rows: T[]; hasNextPage: boolean; cursor: string | null },
  maxPages = 30,
): Promise<T[]> {
  const all: T[] = [];
  let cursor: string | null = null;
  for (let page = 0; page < maxPages; page++) {
    const data = await shopifyGraphql(access, query, { cursor });
    const { rows, hasNextPage, cursor: next } = extract(data);
    all.push(...rows);
    if (!hasNextPage || !next) break;
    cursor = next;
  }
  return all;
}

async function fetchThemeMenuReferences(access: ShopAccess): Promise<Map<string, string[]>> {
  const refs = new Map<string, string[]>();
  const add = (handle: string, location: string) => {
    const h = String(handle).trim();
    if (!h) return;
    const list = refs.get(h) || [];
    if (!list.includes(location)) list.push(location);
    refs.set(h, list);
  };

  try {
    const themes = await shopifyRest(access, "GET", "themes.json");
    const main = (themes.themes || []).find((t: any) => t.role === "main") || themes.themes?.[0];
    if (!main?.id) return refs;

    const assets = await shopifyRest(access, "GET", `themes/${main.id}/assets.json`);
    const keys: string[] = (assets.assets || [])
      .map((a: any) => String(a.key || ""))
      .filter((k: string) => k.endsWith(".json") || k.includes("settings"));

    for (const key of keys) {
      try {
        const asset = await shopifyRest(
          access,
          "GET",
          `themes/${main.id}/assets.json?asset[key]=${encodeURIComponent(key)}`,
        );
        const value = asset?.asset?.value;
        if (!value || typeof value !== "string") continue;
        const menuProp = value.match(/"menu"\s*:\s*"([^"]+)"/g) || [];
        for (const m of menuProp) {
          const h = m.match(/"menu"\s*:\s*"([^"]+)"/)?.[1];
          if (h) add(h, key);
        }
        const linkList = value.match(/"link_list"\s*:\s*"([^"]+)"/g) || [];
        for (const m of linkList) {
          const h = m.match(/"link_list"\s*:\s*"([^"]+)"/)?.[1];
          if (h) add(h, key);
        }
      } catch {
        /* skip unreadable asset */
      }
    }
  } catch (e) {
    console.warn("[menu-cleanup] theme reference scan failed:", (e as Error).message);
  }
  return refs;
}

function isMigrationTestMenu(
  menu: { handle: string; title: string; item_count: number },
  inMigration: boolean,
): boolean {
  if (inMigration) return false;
  const h = menu.handle.toLowerCase();
  if (MIGRATION_TEST_HANDLE_PATTERNS.some((re) => re.test(h))) return true;
  if (/-\d+$/.test(h) && menu.item_count === 0) return true;
  return false;
}

function pickCanonical(
  group: Array<{ menu: any; row: Partial<MenuInventoryRow> }>,
  themeRefs: Map<string, string[]>,
  migrationByHandle: Map<string, { publish_status: string }>,
): { menu: any; reason: string } {
  const scored = group.map(({ menu, row }) => {
    let score = 0;
    const reasons: string[] = [];
    const handle = String(menu.handle);
    const itemCount = row.item_count ?? countMenuItems(menu.items || []);

    if (ESSENTIAL_HANDLES.has(handle)) {
      score += 1000;
      reasons.push("essential handle");
    }
    if (themeRefs.has(handle)) {
      score += 500;
      reasons.push("referenced by theme");
    }
    if (migrationByHandle.has(handle)) {
      score += 300;
      const st = migrationByHandle.get(handle)!.publish_status;
      if (st === "published") {
        score += 200;
        reasons.push("migration published");
      } else {
        reasons.push(`migration status: ${st}`);
      }
    }
    if (menu.isDefault) {
      score += 150;
      reasons.push("default menu");
    }
    score += itemCount * 2;
    if (itemCount > 0) reasons.push(`most complete (${itemCount} items)`);

  return { menu, score, reasons, itemCount, handle };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.itemCount !== a.itemCount) return b.itemCount - a.itemCount;
    return menuNumericId(a.menu.id) - menuNumericId(b.menu.id);
  });

  const winner = scored[0];
  return {
    menu: winner.menu,
    reason: winner.reasons.join("; ") || "highest composite score",
  };
}

function walkBrokenLinks(
  menu: { handle: string; title: string },
  items: any[],
  collectionHandles: Set<string>,
  pageHandles: Set<string>,
  broken: MenuCleanupAuditResult["integrity"]["broken_links"],
  actionking: MenuCleanupAuditResult["integrity"]["actionking_references"],
  missingCollections: Set<string>,
  missingPages: Set<string>,
) {
  for (const it of items || []) {
    const type = String(it.type || "").toUpperCase();
    const blob = `${it.title || ""} ${it.url || ""}`.toLowerCase();
    if (blob.includes("actionking") || blob.includes("action king") || blob.includes("bvy0b8")) {
      actionking.push({ menu_handle: menu.handle, item_title: it.title, url: it.url });
    }
    if (type === "COLLECTION") {
      const h = urlHandle(it.url, "collections");
      if (!h || !collectionHandles.has(h) || isLegacyActionKingCollection(h)) {
        const reason = !h ? "unparseable collection URL" : isLegacyActionKingCollection(h)
          ? "legacy ActionKing collection"
          : "collection not found on target";
        broken.push({
          menu_handle: menu.handle,
          menu_title: menu.title,
          item_title: it.title,
          url: it.url,
          type,
          reason,
        });
        if (h && !collectionHandles.has(h)) missingCollections.add(h);
      }
    } else if (type === "PAGE") {
      const h = urlHandle(it.url, "pages");
      if (!h || !pageHandles.has(h)) {
        broken.push({
          menu_handle: menu.handle,
          menu_title: menu.title,
          item_title: it.title,
          url: it.url,
          type,
          reason: !h ? "unparseable page URL" : "page not found on target",
        });
        if (h) missingPages.add(h);
      }
    }
    if (it.items?.length) {
      walkBrokenLinks(menu, it.items, collectionHandles, pageHandles, broken, actionking, missingCollections, missingPages);
    }
  }
}

export function formatMenuCleanupMarkdown(result: MenuCleanupAuditResult): string {
  const lines: string[] = [];
  lines.push("# EuroDroneParts — Menu Cleanup Audit");
  lines.push("");
  lines.push(`**Generated:** ${result.generated_at}`);
  lines.push(`**Target:** ${result.target_domain}`);
  lines.push(`**Migration:** \`${result.migration_id}\``);
  lines.push(`**Mode:** ${result.mode === "safe" ? "SAFE (audit only — no deletions)" : "EXECUTE"}`);
  lines.push(`**Integrity:** ${result.integrity.status}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push("| Metric | Count |");
  lines.push("| --- | ---: |");
  for (const [k, v] of Object.entries(result.summary)) {
    lines.push(`| ${k.replace(/_/g, " ")} | ${v} |`);
  }
  lines.push("");
  lines.push("## Full inventory");
  lines.push("");
  lines.push("| ID | Title | Handle | Items | Created | Theme ref | Migration | Flags |");
  lines.push("| --- | --- | --- | ---: | --- | --- | --- | --- |");
  for (const m of result.inventory) {
    const flags = [
      m.is_empty ? "empty" : null,
      m.is_orphan ? "orphan" : null,
      m.is_migration_test ? "migration-test" : null,
      m.has_actionking_links ? "actionking" : null,
      m.broken_link_count ? `broken:${m.broken_link_count}` : null,
    ].filter(Boolean).join(", ") || "—";
    lines.push(
      `| \`${m.id}\` | ${m.title} | \`${m.handle}\` | ${m.item_count} | ${m.date_created_note} | ${m.referenced_by_theme ? "yes" : "no"} | ${m.in_source_migration ? m.migration_publish_status || "yes" : "no"} | ${flags} |`,
    );
  }
  lines.push("");
  lines.push("## Cleanup decisions");
  lines.push("");
  lines.push("| Action | Handle | Title | Canonical | Reason |");
  lines.push("| --- | --- | --- | --- | --- |");
  for (const d of result.decisions) {
    lines.push(`| **${d.action}** | \`${d.handle}\` | ${d.title} | ${d.is_canonical ? "yes" : "no"} | ${d.reason} |`);
  }
  lines.push("");
  if (result.integrity.broken_links.length) {
    lines.push("## Broken links");
    lines.push("");
    for (const b of result.integrity.broken_links.slice(0, 50)) {
      lines.push(`- **${b.menu_handle}** / ${b.item_title}: ${b.reason} (\`${b.url}\`)`);
    }
    if (result.integrity.broken_links.length > 50) {
      lines.push(`- … and ${result.integrity.broken_links.length - 50} more`);
    }
    lines.push("");
  }
  if (result.integrity.actionking_references.length) {
    lines.push("## ActionKing references");
    lines.push("");
    for (const a of result.integrity.actionking_references.slice(0, 30)) {
      lines.push(`- **${a.menu_handle}** / ${a.item_title}: \`${a.url}\``);
    }
    lines.push("");
  }
  lines.push("## Integrity checks");
  lines.push("");
  for (const f of result.integrity.failures) lines.push(`- ${f}`);
  if (!result.integrity.failures.length) lines.push("- All checks passed for retained menu set.");
  lines.push("");
  lines.push(`> ${result.note}`);
  return lines.join("\n");
}

export async function runMenuCleanupAudit(
  admin: SupabaseClient,
  opts: {
    migrationId: string;
    targetStore: { shop_domain?: string | null; access_token?: string | null; api_version?: string | null };
    mode?: "safe" | "execute";
    confirm_delete?: boolean;
  },
): Promise<MenuCleanupAuditResult> {
  const mode = opts.mode || "safe";
  const targetAccess = await resolveShopAccess(opts.targetStore);

  const [{ data: menuItems }, liveMenus, themeRefs, liveCollections, livePages] = await Promise.all([
    admin
      .from("cloner_migration_items")
      .select("source_handle,publish_status,error")
      .eq("migration_id", opts.migrationId)
      .eq("object_type", "menu"),
    paginateGraphql(targetAccess, MENUS_DETAIL_QUERY, (data) => ({
      rows: (data?.menus?.edges || []).map((e: any) => e.node).filter((n: any) => n?.handle),
      hasNextPage: !!data?.menus?.pageInfo?.hasNextPage,
      cursor: data?.menus?.edges?.at(-1)?.cursor ?? null,
    })),
    fetchThemeMenuReferences(targetAccess),
    paginateGraphql(targetAccess, LIVE_COLLECTIONS_QUERY, (data) => ({
      rows: (data?.collections?.edges || []).map((e: any) => e.node).filter((n: any) => n?.handle),
      hasNextPage: !!data?.collections?.pageInfo?.hasNextPage,
      cursor: data?.collections?.edges?.at(-1)?.cursor ?? null,
    })),
    paginateGraphql(targetAccess, LIVE_PAGES_QUERY, (data) => ({
      rows: (data?.pages?.edges || []).map((e: any) => e.node).filter((n: any) => n?.handle),
      hasNextPage: !!data?.pages?.pageInfo?.hasNextPage,
      cursor: data?.pages?.edges?.at(-1)?.cursor ?? null,
    })),
  ]);

  const migrationByHandle = new Map(
    (menuItems || []).map((m: any) => [String(m.source_handle), { publish_status: String(m.publish_status), error: m.error }]),
  );

  const collectionHandles = new Set(liveCollections.map((c: any) => String(c.handle)));
  const pageHandles = new Set(livePages.map((p: any) => String(p.handle)));

  const titleGroups = new Map<string, string[]>();
  const handleGroups = new Map<string, string[]>();
  const structureGroups = new Map<string, string[]>();

  const inventory: MenuInventoryRow[] = liveMenus.map((m: any) => {
    const handle = String(m.handle);
    const title = String(m.title || handle);
    const item_count = countMenuItems(m.items || []);
    const fingerprint = structureFingerprint(m.items || []);
    const mig = migrationByHandle.get(handle);
    const themeLocs = themeRefs.get(handle) || [];
    const is_empty = item_count === 0;
    const in_source_migration = !!mig;
    const referenced_by_theme = themeLocs.length > 0;
    const is_orphan = !referenced_by_theme && !ESSENTIAL_HANDLES.has(handle) && !in_source_migration;
    const is_migration_test = isMigrationTestMenu({ handle, title, item_count }, in_source_migration);
    const has_actionking_links = hasActionKingReference(m.items || []);

    const tl = title.toLowerCase();
    titleGroups.set(tl, [...(titleGroups.get(tl) || []), handle]);
    handleGroups.set(handle, [...(handleGroups.get(handle) || []), handle]);
    if (fingerprint) structureGroups.set(fingerprint, [...(structureGroups.get(fingerprint) || []), handle]);

    return {
      id: String(m.id),
      title,
      handle,
      item_count,
      is_default: !!m.isDefault,
      date_created: null,
      date_created_note: `ID ${menuNumericId(m.id)} (Shopify Menu API has no createdAt field)`,
      in_source_migration,
      migration_publish_status: mig?.publish_status ?? null,
      referenced_by_theme,
      theme_reference_locations: themeLocs,
      is_empty,
      is_orphan,
      is_migration_test,
      has_actionking_links,
      broken_link_count: 0,
      structure_fingerprint: fingerprint,
      duplicate_groups: { by_title: null, by_handle: null, by_structure: null },
    };
  });

  for (const row of inventory) {
    const tl = row.title.toLowerCase();
    const tg = titleGroups.get(tl);
    if (tg && tg.length > 1) row.duplicate_groups.by_title = `title:${tl}`;
    const sg = structureGroups.get(row.structure_fingerprint);
    if (sg && sg.length > 1 && row.structure_fingerprint) {
      row.duplicate_groups.by_structure = `structure:${row.structure_fingerprint.slice(0, 40)}…`;
    }
  }

  const menuByHandle = new Map(liveMenus.map((m: any) => [String(m.handle), m]));
  const decisions: MenuCleanupDecision[] = [];
  const toDeleteHandles = new Set<string>();
  const canonicalHandles = new Set<string>();

  const assignGroup = (
    groupHandles: string[],
    groupKey: string,
    extraReason?: string,
  ) => {
    const unique = [...new Set(groupHandles)];
    if (unique.length < 2) return;
    const group = unique
      .map((h) => ({ menu: menuByHandle.get(h), row: inventory.find((r) => r.handle === h) }))
      .filter((g) => g.menu);
    if (group.length < 2) return;

    const { menu: canonical, reason: canonReason } = pickCanonical(
      group as any,
      themeRefs,
      migrationByHandle,
    );
    const cHandle = String(canonical.handle);
    canonicalHandles.add(cHandle);
    decisions.push({
      id: String(canonical.id),
      handle: cHandle,
      title: String(canonical.title),
      action: "keep",
      reason: `Canonical for ${groupKey}: ${canonReason}${extraReason ? `; ${extraReason}` : ""}`,
      is_canonical: true,
      canonical_for: groupKey,
    });

    for (const h of unique) {
      if (h === cHandle) continue;
      const m = menuByHandle.get(h)!;
      if (m.isDefault) {
        decisions.push({
          id: String(m.id),
          handle: h,
          title: String(m.title),
          action: "keep",
          reason: "Default menu — cannot delete via API",
          is_canonical: false,
        });
        continue;
      }
      toDeleteHandles.add(h);
      decisions.push({
        id: String(m.id),
        handle: h,
        title: String(m.title),
        action: "delete",
        reason: `Duplicate of canonical \`${cHandle}\` (${groupKey})`,
        is_canonical: false,
        canonical_for: cHandle,
      });
    }
  };

  for (const [title, handles] of titleGroups) {
    if (handles.length > 1) assignGroup(handles, `duplicate title "${title}"`);
  }
  for (const [fp, handles] of structureGroups) {
    if (!fp || handles.length < 2) continue;
    const already = handles.every((h) => canonicalHandles.has(h) || toDeleteHandles.has(h));
    if (!already) assignGroup(handles, "duplicate structure");
  }

  for (const row of inventory) {
    if (decisions.some((d) => d.handle === row.handle)) continue;
    if (row.is_default) {
      decisions.push({
        id: row.id,
        handle: row.handle,
        title: row.title,
        action: "keep",
        reason: "Default Shopify menu",
        is_canonical: true,
      });
      continue;
    }
    if (row.is_empty && !row.referenced_by_theme && !ESSENTIAL_HANDLES.has(row.handle)) {
      toDeleteHandles.add(row.handle);
      decisions.push({
        id: row.id,
        handle: row.handle,
        title: row.title,
        action: "delete",
        reason: "Empty menu not referenced by theme or migration essentials",
        is_canonical: false,
      });
      continue;
    }
    if (row.is_migration_test && row.is_orphan && !row.referenced_by_theme) {
      toDeleteHandles.add(row.handle);
      decisions.push({
        id: row.id,
        handle: row.handle,
        title: row.title,
        action: "delete",
        reason: "Migration-generated test/orphan menu",
        is_canonical: false,
      });
      continue;
    }
    if (row.is_orphan && row.is_migration_test) {
      toDeleteHandles.add(row.handle);
      decisions.push({
        id: row.id,
        handle: row.handle,
        title: row.title,
        action: "delete",
        reason: "Orphan migration test menu",
        is_canonical: false,
      });
      continue;
    }
    decisions.push({
      id: row.id,
      handle: row.handle,
      title: row.title,
      action: "keep",
      reason: row.referenced_by_theme
        ? "Referenced by theme navigation"
        : row.in_source_migration
        ? "In source migration"
        : ESSENTIAL_HANDLES.has(row.handle)
        ? "Essential navigation handle"
        : "Retained — review manually if unexpected",
      is_canonical: true,
    });
  }

  const broken_links: MenuCleanupAuditResult["integrity"]["broken_links"] = [];
  const actionking_references: MenuCleanupAuditResult["integrity"]["actionking_references"] = [];
  const missingCollections = new Set<string>();
  const missingPages = new Set<string>();

  const keepHandles = new Set(decisions.filter((d) => d.action === "keep").map((d) => d.handle));
  for (const m of liveMenus) {
    const h = String(m.handle);
    if (!keepHandles.has(h)) continue;
    walkBrokenLinks(
      { handle: h, title: String(m.title) },
      m.items || [],
      collectionHandles,
      pageHandles,
      broken_links,
      actionking_references,
      missingCollections,
      missingPages,
    );
  }

  for (const row of inventory) {
    row.broken_link_count = broken_links.filter((b) => b.menu_handle === row.handle).length;
  }

  const duplicate_handles = [...handleGroups.entries()].filter(([, hs]) => hs.length > 1).map(([h]) => h);
  const duplicate_titles = [...titleGroups.entries()]
    .filter(([, hs]) => hs.length > 1)
    .map(([title, handles]) => ({ title, handles }));

  const failures: string[] = [];
  const retainedHandles = [...keepHandles];
  const retainedTitles = retainedHandles.map((h) => inventory.find((r) => r.handle === h)?.title?.toLowerCase()).filter(Boolean);
  if (new Set(retainedHandles).size !== retainedHandles.length) failures.push("Duplicate handles among retained menus");
  if (new Set(retainedTitles).size !== retainedTitles.length) failures.push("Duplicate titles among retained menus");
  if (broken_links.length) failures.push(`${broken_links.length} broken internal link(s) in retained menus`);
  if (actionking_references.length) failures.push(`${actionking_references.length} ActionKing reference(s) in retained menus`);

  const rollback = inventory
    .filter((m) => toDeleteHandles.has(m.handle))
    .map((m) => {
      const live = menuByHandle.get(m.handle);
      return {
        id: m.id,
        title: m.title,
        handle: m.handle,
        is_default: m.is_default,
        items: snapshotItems(live?.items || []),
      };
    });

  const summary = {
    menus_before: inventory.length,
    menus_after: inventory.length - toDeleteHandles.size,
    menus_to_delete: toDeleteHandles.size,
    menus_to_keep: keepHandles.size,
    empty_menus: inventory.filter((m) => m.is_empty).length,
    orphan_menus: inventory.filter((m) => m.is_orphan).length,
    migration_test_menus: inventory.filter((m) => m.is_migration_test).length,
    duplicate_title_groups: duplicate_titles.length,
    duplicate_handle_groups: duplicate_handles.length,
    duplicate_structure_groups: [...structureGroups.values()].filter((hs) => hs.length > 1).length,
  };

  const result: MenuCleanupAuditResult = {
    ok: true,
    mode,
    generated_at: new Date().toISOString(),
    migration_id: opts.migrationId,
    target_domain: targetAccess.domain,
    inventory,
    decisions: decisions.sort((a, b) => a.handle.localeCompare(b.handle)),
    rollback,
    integrity: {
      duplicate_handles,
      duplicate_titles,
      broken_links,
      actionking_references,
      missing_collections: [...missingCollections].sort(),
      missing_pages: [...missingPages].sort(),
      status: failures.length ? "FAIL" : "PASS",
      failures,
    },
    summary,
    confirmation_required: toDeleteHandles.size > 0,
    note: mode === "safe"
      ? "SAFE MODE: No menus deleted. Review decisions and rollback file, then re-run with mode=execute and confirm_delete=true."
      : opts.confirm_delete
      ? "EXECUTE mode with confirmation — deletions applied below."
      : "EXECUTE mode blocked — pass confirm_delete=true after reviewing SAFE MODE report.",
  };

  if (mode === "execute" && opts.confirm_delete && toDeleteHandles.size > 0) {
    const deletions: MenuCleanupAuditResult["deletions"] = [];
    for (const h of toDeleteHandles) {
      const m = menuByHandle.get(h);
      if (!m) {
        deletions.push({ id: "", handle: h, title: "", result: "not_found" });
        continue;
      }
      if (m.isDefault) {
        deletions.push({ id: m.id, handle: h, title: m.title, result: "skipped_default" });
        continue;
      }
      const data = await shopifyGraphql(targetAccess, MENU_DELETE_MUTATION, { id: m.id });
      const errs = data?.menuDelete?.userErrors || [];
      deletions.push({
        id: m.id,
        handle: h,
        title: String(m.title),
        result: errs.length ? "failed" : "deleted",
        errors: errs,
      });
    }
    result.deletions = deletions;
    result.summary.menus_after = inventory.length - deletions.filter((d) => d.result === "deleted").length;
  }

  return result;
}
