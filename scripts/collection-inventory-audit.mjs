#!/usr/bin/env node
/**
 * Full live collection inventory audit for EuroDroneParts.
 * Read-only — writes EURODRONEPARTS_COLLECTION_CLEANUP_AUDIT.md + .collection-inventory-audit.json
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPORT = join(ROOT, "EURODRONEPARTS_COLLECTION_CLEANUP_AUDIT.md");
const JSON_OUT = join(ROOT, ".collection-inventory-audit.json");
const URL = process.env.CLONER_SUPABASE_URL || "https://wsncjdajweoujhidlxas.supabase.co";
const MID = process.env.MIGRATION_ID || "3d9876af-885c-49e9-a4b0-c4943c06112f";
const STORE = "ya1xhg-x6.myshopify.com";

const LEGACY_PATTERNS = [/actionking/i, /^alla-produkter-actionking/i, /^bastsaljare$/i];
const APPROVED_DJI_SMART = new Set([
  "dji-air-3-tillbehor-omfattande-sortiment",
  "dji-avata-2-tillbehor",
  "dji-flip-tillbehor",
  "dji-mini-3-tillbehor",
  "dji-neo-2-tillbehor",
  "dji-neo-tillbehor",
]);

function loadEnv() {
  const p = join(ROOT, ".env");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
}

function apiKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
}

async function post(fn, body) {
  const key = apiKey();
  const r = await fetch(`${URL}/functions/v1/${fn}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, apikey: key },
    body: JSON.stringify(body),
  });
  return r.json();
}

async function gql(query, variables = {}) {
  const j = await post("test-integration", {
    integration_type: "shopify",
    config: { store_domain: STORE, access_token: "***configured***" },
    shopify_graphql: { query, variables },
  });
  return j?.data ?? j;
}

function urlCollectionHandle(url) {
  const m = String(url || "").match(/\/collections\/([^/?#]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

function normalizeHandleFromPath(path) {
  if (!path) return null;
  const m = String(path).match(/\/collections\/([^/?#"'\s]+)/i);
  return m ? decodeURIComponent(m[1]) : null;
}

function isLegacy(handle, title = "") {
  const blob = `${handle} ${title}`.toLowerCase();
  if (blob.includes("actionking") || blob.includes("action king")) return true;
  return LEGACY_PATTERNS.some((re) => re.test(handle));
}

function titleKey(title) {
  return String(title || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function handlePrefix(handle) {
  const m = handle.match(/^(.+?)-\d+$/);
  return m ? m[1] : handle;
}

const COLLECTIONS_GQL = `
  query Collections($cursor: String) {
    collections(first: 250, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      edges {
        cursor
        node {
          id handle title
          productsCount { count }
          ruleSet { rules { column } }
          descriptionHtml
        }
      }
    }
  }
`;

const MENUS_GQL = `
  query Menus($cursor: String) {
    menus(first: 50, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      nodes {
        handle
        title
        items {
          title
          url
          type
          items { title url type items { title url type } }
        }
      }
    }
  }
`;

const PAGES_GQL = `
  query Pages($cursor: String) {
    pages(first: 250, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      nodes { handle title body }
    }
  }
`;

async function paginateCollections() {
  const all = [];
  let cursor = null;
  for (let p = 0; p < 30; p++) {
    const data = await gql(COLLECTIONS_GQL, { cursor });
    if (!data?.collections) break;
    for (const e of data.collections.edges || []) {
      const n = e.node;
      if (!n?.handle) continue;
      all.push({
        handle: n.handle,
        title: n.title,
        id: n.id,
        products_count: n.productsCount?.count ?? 0,
        kind: (n.ruleSet?.rules?.length || 0) > 0 ? "smart" : "custom",
        descriptionHtml: n.descriptionHtml || "",
      });
    }
    if (!data.collections.pageInfo?.hasNextPage) break;
    cursor = data.collections.pageInfo.endCursor;
  }
  return all;
}

async function paginateMenus() {
  const all = [];
  let cursor = null;
  for (let p = 0; p < 10; p++) {
    const data = await gql(MENUS_GQL, { cursor });
    if (!data?.menus) break;
    all.push(...(data.menus.nodes || []));
    if (!data.menus.pageInfo?.hasNextPage) break;
    cursor = data.menus.pageInfo.endCursor;
  }
  return all;
}

async function paginatePages() {
  const all = [];
  let cursor = null;
  for (let p = 0; p < 10; p++) {
    const data = await gql(PAGES_GQL, { cursor });
    if (!data?.pages) break;
    all.push(...(data.pages.nodes || []));
    if (!data.pages.pageInfo?.hasNextPage) break;
    cursor = data.pages.pageInfo.endCursor;
  }
  return all;
}

function walkMenuItems(items, fn, menuHandle) {
  for (const it of items || []) {
    fn(it, menuHandle);
    walkMenuItems(it.items, fn, menuHandle);
  }
}

async function scanThemeCollectionRefs(collectionHandles) {
  const refs = new Map();
  const batchSize = 40;
  for (let i = 0; i < collectionHandles.length; i += batchSize) {
    const batch = collectionHandles.slice(i, i + batchSize);
    const probe = await post("cloner-fix-collections-and-menus", {
      migration_id: MID,
      theme_menu_refs: batch,
    });
    const per = probe.theme_menu_refs?.per_handle || {};
    for (const handle of batch) {
      const matches = per[handle]?.matches || [];
      const collectionMatches = matches.filter(
        (m) =>
          /"(?:collection|featured_collection|collection_handle|featured_collection_handle)"\s*:\s*"/.test(m.snippet) ||
          (m.snippet.includes("/collections/") && m.snippet.includes(handle)),
      );
      if (collectionMatches.length) refs.set(handle, collectionMatches.map((m) => m.asset));
    }
  }
  return refs;
}

function classifyCollection(row, dupGroups, collectionsByHandle) {
  const refs =
    row.referenced_by_menu ||
    row.referenced_by_theme_section ||
    row.referenced_by_page ||
    row.referenced_by_another_collection;

  if (refs) {
    return { group: "KEEP", reason: "Referenced in storefront navigation, theme, pages, or other collections" };
  }
  if (APPROVED_DJI_SMART.has(row.handle)) {
    return { group: "KEEP", reason: "Approved DJI smart collection for recovery/mapping" };
  }

  const dup = dupGroups.find((g) => g.handles.includes(row.handle) && g.handles.length > 1);
  if (dup) {
    const canonical =
      dup.handles.find((h) => h === dup.prefix) ||
      dup.handles.find((h) => (collectionsByHandle.get(h)?.products_count || 0) > 0) ||
      dup.handles[0];
    if (row.handle !== canonical) {
      return { group: "MERGE", reason: `Duplicate title group — merge into canonical \`${canonical}\`` };
    }
  }

  const prefix = handlePrefix(row.handle);
  if (prefix !== row.handle && /^.+\-\d+$/.test(row.handle) && collectionsByHandle.has(prefix)) {
    return { group: "MERGE", reason: `Numbered duplicate handle — merge into \`${prefix}\`` };
  }

  if (row.products_count > 0) {
    return { group: "KEEP", reason: "Has live products and no duplicate merge target identified" };
  }

  if (isLegacy(row.handle, row.title)) {
    return { group: "DELETE", reason: "Legacy ActionKing collection — empty and unreferenced" };
  }

  if (row.products_count === 0) {
    return { group: "DELETE", reason: "Empty collection with no menu, theme, page, or collection references" };
  }

  return { group: "KEEP", reason: "Default retain" };
}

function esc(s) {
  return String(s ?? "")
    .replace(/\|/g, "\\|")
    .replace(/\n/g, " ");
}

function renderTable(rows) {
  if (!rows.length) return "| — | — | — | — | — | — | — | — |";
  return rows
    .map(
      (r) =>
        `| \`${esc(r.handle)}\` | ${esc(r.title)} | ${r.products_count} | ${r.referenced_by_menu ? "yes" : "no"} | ${r.referenced_by_theme_section ? "yes" : "no"} | ${r.referenced_by_page ? "yes" : "no"} | ${r.referenced_by_another_collection ? "yes" : "no"} | ${r.group} | ${esc(r.reason)} |`,
    )
    .join("\n");
}

loadEnv();

console.log("Fetching collections...");
const collections = await paginateCollections();
const handleSet = new Set(collections.map((c) => c.handle));

console.log("Scanning menus, pages, theme...");
const collectionsByHandle = new Map(collections.map((c) => [c.handle, c]));
const [menus, pages] = await Promise.all([paginateMenus(), paginatePages()]);
const themeRefs = await scanThemeCollectionRefs(collections.map((c) => c.handle));

const menuRefs = new Map();
for (const menu of menus) {
  walkMenuItems(menu.items, (it, menuHandle) => {
    const h = urlCollectionHandle(it.url);
    if (!h) return;
    const arr = menuRefs.get(h) || [];
    if (!arr.includes(menuHandle)) arr.push(menuHandle);
    menuRefs.set(h, arr);
  }, menu.handle);
}

const pageRefs = new Map();
for (const page of pages) {
  const body = `${page.body || ""} ${page.handle || ""}`;
  for (const h of handleSet) {
    if (body.includes(`/collections/${h}`) || body.includes(`collections/${h}`)) {
      const arr = pageRefs.get(h) || [];
      arr.push(page.handle);
      pageRefs.set(h, arr);
    }
  }
}

const collectionRefs = new Map();
for (const c of collections) {
  const html = c.descriptionHtml || "";
  for (const h of handleSet) {
    if (h === c.handle) continue;
    if (html.includes(`/collections/${h}`) || html.includes(`collections/${h}`)) {
      const arr = collectionRefs.get(h) || [];
      arr.push(c.handle);
      collectionRefs.set(h, arr);
    }
  }
}

const titleGroups = new Map();
for (const c of collections) {
  const tk = titleKey(c.title);
  const arr = titleGroups.get(tk) || [];
  arr.push(c);
  titleGroups.set(tk, arr);
}

const dupGroups = [];
for (const [title, items] of titleGroups) {
  if (items.length < 2) continue;
  const handles = items.map((i) => i.handle).sort();
  dupGroups.push({ title, prefix: handlePrefix(handles[0]), handles });
}

const rows = collections.map((c) => {
  const base = {
    handle: c.handle,
    title: c.title,
    products_count: c.products_count,
    kind: c.kind,
    referenced_by_menu: (menuRefs.get(c.handle) || []).length > 0,
    menu_references: menuRefs.get(c.handle) || [],
    referenced_by_theme_section: (themeRefs.get(c.handle) || []).length > 0,
    theme_references: themeRefs.get(c.handle) || [],
    referenced_by_page: (pageRefs.get(c.handle) || []).length > 0,
    page_references: pageRefs.get(c.handle) || [],
    referenced_by_another_collection: (collectionRefs.get(c.handle) || []).length > 0,
    collection_references: collectionRefs.get(c.handle) || [],
    is_legacy: isLegacy(c.handle, c.title),
  };
  const { group, reason } = classifyCollection(base, dupGroups, collectionsByHandle);
  return { ...base, group, reason };
});

const groups = {
  KEEP: rows.filter((r) => r.group === "KEEP"),
  MERGE: rows.filter((r) => r.group === "MERGE"),
  DELETE: rows.filter((r) => r.group === "DELETE"),
};

const payload = {
  generated_at: new Date().toISOString(),
  store: STORE,
  migration_id: MID,
  total_collections: rows.length,
  counts: {
    keep: groups.KEEP.length,
    merge: groups.MERGE.length,
    delete: groups.DELETE.length,
    referenced_by_menu: rows.filter((r) => r.referenced_by_menu).length,
    referenced_by_theme: rows.filter((r) => r.referenced_by_theme_section).length,
    referenced_by_page: rows.filter((r) => r.referenced_by_page).length,
    referenced_by_collection: rows.filter((r) => r.referenced_by_another_collection).length,
    empty_collections: rows.filter((r) => r.products_count === 0).length,
    legacy_collections: rows.filter((r) => r.is_legacy).length,
  },
  duplicate_title_groups: dupGroups.slice(0, 50),
  groups,
  all: rows,
};

writeFileSync(JSON_OUT, JSON.stringify(payload, null, 2));

const lines = [
  "# EuroDroneParts — Collection Inventory Cleanup Audit",
  "",
  `**Generated:** ${payload.generated_at}`,
  `**Store:** ${STORE}`,
  "**Mode:** Read-only — no deletions",
  "",
  "## Summary",
  "",
  "| Metric | Count |",
  "|---|---:|",
  `| Total live collections | ${rows.length} |`,
  `| KEEP | ${groups.KEEP.length} |`,
  `| MERGE | ${groups.MERGE.length} |`,
  `| DELETE | ${groups.DELETE.length} |`,
  `| Referenced by menu | ${payload.counts.referenced_by_menu} |`,
  `| Referenced by theme section | ${payload.counts.referenced_by_theme} |`,
  `| Referenced by page | ${payload.counts.referenced_by_page} |`,
  `| Referenced by another collection | ${payload.counts.referenced_by_collection} |`,
  `| Empty (0 products) | ${payload.counts.empty_collections} |`,
  `| Legacy ActionKing | ${payload.counts.legacy_collections} |`,
  "",
  "## 1. KEEP",
  "",
  "| Handle | Title | Products | Menu | Theme | Page | Coll | Action | Reason |",
  "|---|---|---:|---|---|---|---|---|---|",
  renderTable(groups.KEEP),
  "",
  "## 2. MERGE",
  "",
  "| Handle | Title | Products | Menu | Theme | Page | Coll | Action | Reason |",
  "|---|---|---:|---|---|---|---|---|---|",
  renderTable(groups.MERGE),
  "",
  "## 3. DELETE",
  "",
  "| Handle | Title | Products | Menu | Theme | Page | Coll | Action | Reason |",
  "|---|---|---:|---|---|---|---|---|---|",
  renderTable(groups.DELETE),
  "",
  "## Duplicate title groups (top 20)",
  "",
];

for (const g of dupGroups.slice(0, 20)) {
  lines.push(`- **${g.title}** (${g.handles.length}): ${g.handles.slice(0, 8).join(", ")}${g.handles.length > 8 ? ", ..." : ""}`);
}

lines.push("", "## Notes", "");
lines.push("- **KEEP**: referenced anywhere, has products, or approved DJI smart collection.");
lines.push("- **MERGE**: duplicate title/handle group — consolidate into canonical collection before delete.");
lines.push("- **DELETE**: empty, unreferenced, legacy ActionKing, or duplicate orphan.");
lines.push("- Menu scan uses 5 post-cleanup canonical menus on live store.");
lines.push("");

writeFileSync(REPORT, lines.join("\n"));
console.log(`Wrote ${REPORT}`);
console.log(`Wrote ${JSON_OUT}`);
console.log(JSON.stringify(payload.counts, null, 2));
