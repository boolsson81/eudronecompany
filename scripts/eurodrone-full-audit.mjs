#!/usr/bin/env node
/**
 * EuroDroneParts — FULL read-only audit (collections, products, menus, pages, references).
 * Writes EURODRONEPARTS_FULL_AUDIT.md + .eurodrone-full-audit.json
 * NO deletions. Await approval before any changes.
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const COLL_IN = join(ROOT, ".collection-inventory-audit.json");
const MENU_RAW = join(ROOT, ".menu-audit-raw.json");
const OUT_MD = join(ROOT, "EURODRONEPARTS_FULL_AUDIT.md");
const OUT_JSON = join(ROOT, ".eurodrone-full-audit.json");
const STORE = "ya1xhg-x6.myshopify.com";
const MID = "3d9876af-885c-49e9-a4b0-c4943c06112f";
const URL = process.env.CLONER_SUPABASE_URL || "https://wsncjdajweoujhidlxas.supabase.co";

const TARGET_IA = {
  "Consumer DJI": ["DJI Mini", "DJI Air", "DJI Mavic", "DJI Avata", "DJI Neo", "DJI Flip"],
  "Enterprise DJI": [
    "DJI Matrice",
    "DJI Mavic Enterprise",
    "DJI FlyCart",
    "Enterprise Sensors",
    "Enterprise Payloads",
    "Enterprise Accessories",
    "Enterprise Service",
  ],
  "Industry Solutions": [
    "Inspection",
    "Energy & Infrastructure",
    "Agriculture",
    "Forestry",
    "Surveying & Mapping",
    "Public Safety",
    "Transport & Logistics",
  ],
  "Spare Parts": ["Motors", "Propellers", "Batteries", "Gimbals", "Cameras", "Landing Gear", "Electronics"],
  Accessories: [
    "Batteries",
    "Chargers",
    "Cases",
    "Remote Controllers",
    "Filters",
    "Antennas",
    "Speakers",
    "Lighting",
    "Payload Systems",
  ],
  FlyCart: ["FlyCart 30", "FlyCart 100", "FlyCart Spare Parts", "FlyCart Accessories"],
};

const INDUSTRY_HANDLE_MAP = {
  inspektionsdronare: "Inspection",
  "energi-infrastruktur": "Energy & Infrastructure",
  jordbruksdronare: "Agriculture",
  skogsbruksdronare: "Forestry",
  "kartlaggnings-och-matdronare": "Surveying & Mapping",
  "transport-logistik": "Transport & Logistics",
  "last-och-transportdronare": "Transport & Logistics",
};

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

async function gql(query, variables = {}) {
  const key = apiKey();
  const r = await fetch(`${URL}/functions/v1/test-integration`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, apikey: key },
    body: JSON.stringify({
      integration_type: "shopify",
      config: { store_domain: STORE, access_token: "***configured***" },
      shopify_graphql: { query, variables },
    }),
  });
  const j = await r.json();
  return j?.data ?? j;
}

function esc(s) {
  return String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function isLegacyDji(handle, title) {
  const t = `${handle} ${title}`.toLowerCase();
  return /phantom|inspire|air-2|air-2s|mini-2|mavic-2/.test(t);
}

function isEnterprise(handle, title) {
  const h = handle.toLowerCase();
  const t = `${handle} ${title}`.toLowerCase();
  return (
    /^enterprise-/.test(h) ||
    /^dji-matrice/.test(h) ||
    /^dji-agras/.test(h) ||
    /marvic-enterprise|mavic-3-enterprise|mavic-3m|mavic-serien-enterprise|mavic-3e/.test(t)
  );
}

function isFlyCart(handle) {
  return /flycart/.test(handle.toLowerCase());
}

function isIndustrySolution(handle) {
  return handle.toLowerCase() in INDUSTRY_HANDLE_MAP || /inspektions|jordbruk|skogsbruk|kartlagg|energi-infrastruktur|transport-logistik/.test(handle);
}

function hasRefs(c) {
  return (
    c.referenced_by_menu ||
    c.referenced_by_theme_section ||
    c.referenced_by_page ||
    c.referenced_by_another_collection
  );
}

function taxonomyGroup(handle, title) {
  const h = handle.toLowerCase();
  const t = `${handle} ${title}`.toLowerCase();
  if (isFlyCart(h)) return "FlyCart";
  if (isIndustrySolution(h)) return "Industry Solutions";
  if (/^(enterprise-sensorer|dronare-med-varmekamera|airdrop-system)$/.test(h) || (/sensor|payload|varmekamera|multispektral|lidar/.test(t) && !/filter/.test(t)))
    return "Sensors & Payloads";
  if (isEnterprise(h, title)) return "Enterprise DJI";
  if (isLegacyDji(h, title) || /actionking|gopro|osmo-action|sunnylife/.test(t)) return "Legacy DJI models";
  if (/reservdel|reparation-|flight-components|gimbal-dronare-motorer|dji-dronar-reservdelar/.test(h)) return "Spare Parts";
  if (/^dji-(mavic|mini|air|avata|flip|neo|fpv|dronare|rc)-|^dji$|^dij-air-3|^dronare-med-kamera|^tillbehor-dji-/.test(h)) return "Consumer DJI";
  if (/mavic|mini|air|avata|neo|flip/.test(t)) return "Consumer DJI";
  return "Accessories";
}

function consumerFamily(handle, title) {
  const t = `${handle} ${title}`.toLowerCase();
  if (/mini/.test(t)) return "DJI Mini";
  if (/air/.test(t) && !/air-2/.test(t)) return "DJI Air";
  if (/mavic/.test(t) && !/mavic-2|enterprise|3e|3m/.test(t)) return "DJI Mavic";
  if (/avata|fpv/.test(t)) return "DJI Avata";
  if (/neo/.test(t)) return "DJI Neo";
  if (/flip/.test(t)) return "DJI Flip";
  return "Consumer (general)";
}

function classifyBusiness(c) {
  if (c.group === "MERGE") {
    return { action: "MERGE", reason: c.reason, protected: false };
  }
  if (c.products_count > 0) {
    return { action: "KEEP", reason: "Contains live products", protected: false };
  }
  if (c.products_count < 0) {
    return { action: "KEEP", reason: "Smart collection with negative count — audit rules/tags before any change", protected: true };
  }
  if (hasRefs(c)) {
    return { action: "KEEP", reason: "Referenced in menu, theme, page, or another collection", protected: false };
  }
  if (isLegacyDji(c.handle, c.title)) {
    return { action: "KEEP", reason: "Protected Legacy DJI model — SEO/spare-parts value even when empty", protected: true };
  }
  if (isEnterprise(c.handle, c.title)) {
    return { action: "KEEP", reason: "Protected Enterprise collection — populate rather than delete", protected: true };
  }
  if (isFlyCart(c.handle)) {
    return { action: "KEEP", reason: "Protected FlyCart collection — strategic product line", protected: true };
  }
  if (isIndustrySolution(c.handle)) {
    return { action: "KEEP", reason: "Protected Industry Solutions landing page — SEO value", protected: true };
  }
  if (/enterprise-sensorer/.test(c.handle)) {
    return { action: "KEEP", reason: "Protected Sensors & Payloads hub — populate rather than delete", protected: true };
  }
  return { action: "DELETE", reason: "Empty, unreferenced, no protected category — safe delete candidate", protected: false };
}

function seoScore(c) {
  let score = 0;
  if (c.products_count > 0) score += Math.min(50, Math.log10(c.products_count + 1) * 15);
  if (c.referenced_by_page) score += 25;
  if (c.referenced_by_menu) score += 20;
  if (c.referenced_by_theme_section) score += 15;
  if (isLegacyDji(c.handle, c.title)) score += 10;
  if (isEnterprise(c.handle, c.title) || isIndustrySolution(c.handle)) score += 8;
  if (c.products_count === 0 && !hasRefs(c)) score -= 5;
  return Math.round(score);
}

function mergeTarget(c, allByHandle) {
  const m = c.reason?.match(/merge into (?:canonical )?`([^`]+)`/i);
  if (m) return m[1];
  const prefix = c.handle.replace(/-\d+$/, "");
  if (prefix !== c.handle && allByHandle.has(prefix)) return prefix;
  return null;
}

function proposedMenu() {
  return [
    {
      handle: "main-menu",
      title: "Huvudmeny",
      items: [
        {
          title: "Drönare",
          children: [
            { title: "DJI Mini", url: "/collections/dji-mini-4-serien" },
            { title: "DJI Air", url: "/collections/dji-air-serien" },
            { title: "DJI Mavic", url: "/collections/dji-mavic-serien" },
            { title: "DJI Avata", url: "/collections/dji-avata-serien" },
            { title: "DJI Neo", url: "/collections/dji-neo" },
            { title: "DJI Flip", url: "/collections/dji-flip-dronare" },
            { title: "Alla konsumentdrönare", url: "/collections/dji-dronare" },
          ],
        },
        {
          title: "Enterprise Drönare",
          children: [
            { title: "Enterprise översikt", url: "/collections/enterprise-dronare" },
            { title: "DJI Matrice", url: "/collections/dji-matrice-serien" },
            { title: "Mavic Enterprise", url: "/collections/dji-mavic-serien-enterprise" },
            { title: "DJI Agras", url: "/collections/dji-agras-dronare" },
            { title: "Sensors & Payloads", url: "/collections/enterprise-sensorer" },
            { title: "Enterprise tillbehör", url: "/collections/enterprise-tillbehor" },
          ],
        },
        {
          title: "FlyCart",
          children: [
            { title: "FlyCart 100", url: "/collections/dji-flycart-100-lastdronare" },
            { title: "FlyCart serie", url: "/collections/dji-flycart-serien" },
          ],
        },
        {
          title: "Branschlösningar",
          children: [
            { title: "Inspektion", url: "/collections/inspektionsdronare" },
            { title: "Energi & Infrastruktur", url: "/collections/energi-infrastruktur" },
            { title: "Jordbruk", url: "/collections/jordbruksdronare" },
            { title: "Skogsbruk", url: "/collections/skogsbruksdronare" },
            { title: "Kartläggning", url: "/collections/kartlaggnings-och-matdronare" },
            { title: "Transport & Logistik", url: "/collections/transport-logistik" },
          ],
        },
        {
          title: "Reservdelar",
          url: "/collections/dji-dronar-reservdelar",
          children: [
            { title: "Gimbal & motorer", url: "/collections/reservdelar-gimbal-dronare-motorer" },
            { title: "Elektronik & flight components", url: "/collections/dronarelektronik-flight-components" },
            { title: "Neo reservdelar", url: "/collections/reparation-dji-neo-reservdelar" },
          ],
        },
        {
          title: "Tillbehör",
          url: "/collections/dronartillbehor-kop",
          children: [
            { title: "Propellrar", url: "/collections/dronare-propeller-tillbehor" },
            { title: "Filter", url: "/collections/filter-till-dronare" },
            { title: "Batterier", url: "/collections/batterier" },
            { title: "Väskor & cases", url: "/collections/dronarryggsack-vaskor" },
            { title: "Fjärrkontroller", url: "/collections/fjarrkontroll-dronare" },
            { title: "PolarPro", url: "/collections/polarpro" },
          ],
        },
        {
          title: "Legacy DJI",
          children: [
            { title: "Phantom", url: "/collections/dji-phantom-3-se" },
            { title: "Air 2 / Air 2S", url: "/collections/dji-air-2-serien" },
            { title: "Mini 2", url: "/collections/tillbehor-dji-mini-2-2-se" },
            { title: "Mavic 2", url: "/collections/dji-mavic-2-serien" },
          ],
        },
      ],
    },
    {
      handle: "enterprise-dr-nare",
      title: "Enterprise Drönare",
      items: [
        { title: "Enterprise drönare", url: "/collections/enterprise-dronare" },
        { title: "Matrice", url: "/collections/dji-matrice-serien" },
        { title: "Mavic Enterprise", url: "/collections/dji-mavic-3-enterprise" },
        { title: "Agras", url: "/collections/dji-agras-dronare" },
        { title: "FlyCart", url: "/collections/dji-flycart-serien" },
        { title: "Värmekamera", url: "/collections/dronare-med-varmekamera" },
        { title: "Airdrop", url: "/collections/airdrop-system" },
      ],
    },
    { handle: "footer", title: "Sidfot", items: [{ title: "Alla produkter", url: "/collections/alla-produkter" }] },
    { handle: "customer-account-main-menu", title: "Kundkonto", items: [] },
  ];
}

loadEnv();

if (!existsSync(COLL_IN)) {
  console.error("Missing .collection-inventory-audit.json — run: node scripts/collection-inventory-audit.mjs");
  process.exit(1);
}

console.log("Loading collection audit...");
const collData = JSON.parse(readFileSync(COLL_IN, "utf8"));
const collections = collData.all || [];
const allByHandle = new Map(collections.map((c) => [c.handle, c]));

console.log("Fetching product and page counts...");
const shopData = await gql(`{
  productsCount { count }
  pagesCount { count }
  shop { name primaryDomain { url } }
}`);
const productCount = shopData?.productsCount?.count ?? null;
const pageCount = shopData?.pagesCount?.count ?? null;
const shopUrl = shopData?.shop?.primaryDomain?.url ?? `https://${STORE}`;

const PAGES_GQL = `
  query Pages($cursor: String) {
    pages(first: 250, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      nodes { handle title body }
    }
  }
`;
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
const pages = await paginatePages();
const pagesWithCollectionRefs = pages.filter((p) => /\/collections\//.test(p.body || ""));

const menuData = existsSync(MENU_RAW) ? JSON.parse(readFileSync(MENU_RAW, "utf8")) : null;
const liveMenus = menuData?.menuDry?.live_target_menus || menuData?.inventory?.live_target_menus || [];

const enriched = collections.map((c) => {
  const biz = classifyBusiness(c);
  const tax = taxonomyGroup(c.handle, c.title);
  return {
    ...c,
    business_action: biz.action,
    business_reason: biz.reason,
    protected: biz.protected,
    taxonomy: tax,
    consumer_family: tax === "Consumer DJI" ? consumerFamily(c.handle, c.title) : null,
    industry_vertical: INDUSTRY_HANDLE_MAP[c.handle] || null,
    seo_score: seoScore(c),
    merge_target: c.group === "MERGE" ? mergeTarget(c, allByHandle) : null,
  };
});

const keep = enriched.filter((c) => c.business_action === "KEEP");
const merge = enriched.filter((c) => c.business_action === "MERGE");
const del = enriched.filter((c) => c.business_action === "DELETE");

const taxonomyCounts = {};
for (const c of enriched.filter((x) => x.business_action !== "DELETE")) {
  taxonomyCounts[c.taxonomy] = (taxonomyCounts[c.taxonomy] || 0) + 1;
}

const redirects = [];
for (const c of merge) {
  const target = c.merge_target;
  if (target) redirects.push({ from: c.handle, to: target, reason: "MERGE duplicate", type: "301" });
}
for (const c of del) {
  const tax = c.taxonomy;
  const fallback =
    tax === "Consumer DJI"
      ? "dji-dronare"
      : tax === "Accessories"
        ? "dronartillbehor-kop"
        : tax === "Spare Parts"
          ? "dji-dronar-reservdelar"
          : "alla-produkter";
  redirects.push({ from: c.handle, to: fallback, reason: "DELETE empty orphan", type: "301" });
}

const migrationPlan = [];
for (const c of merge) {
  migrationPlan.push({
    source: c.handle,
    target: c.merge_target,
    products: c.products_count,
    action: "Reassign smart-collection rules / manual product tags to canonical handle",
  });
}
for (const c of keep.filter((x) => x.products_count === 0 && x.protected)) {
  migrationPlan.push({
    source: c.handle,
    target: c.handle,
    products: 0,
    action: `Populate from related taxonomy (${c.taxonomy}) — do not delete`,
  });
}

const finalCount = keep.length + merge.length;
const afterMerge = finalCount - merge.length;
const afterDelete = afterMerge - del.length;

const lines = [
  "# EuroDroneParts — Full Store Audit Report",
  "",
  `**Generated:** ${new Date().toISOString()}`,
  `**Store:** ${STORE}`,
  `**Shop URL:** ${shopUrl}`,
  `**Migration ID:** \`${MID}\``,
  "",
  "> **STATUS: AWAITING APPROVAL** — This is a read-only audit. No collections, menus, pages, or products were modified.",
  "",
  "---",
  "",
  "## Executive summary",
  "",
  "| Metric | Value |",
  "|--------|------:|",
  `| Live products | ${productCount?.toLocaleString() ?? "—"} |`,
  `| Live pages | ${pageCount ?? pages.length} |`,
  `| Live collections | ${collections.length} |`,
  `| Live menus | ${liveMenus.length || menuData?.inventory?.total_live_menus || "—"} |`,
  `| Collections → KEEP | ${keep.length} |`,
  `| Collections → MERGE | ${merge.length} |`,
  `| Collections → DELETE | ${del.length} |`,
  `| Protected empty (Legacy/Enterprise/FlyCart/Industry) | ${keep.filter((c) => c.protected).length} |`,
  `| **Projected collections after cleanup** | **~${afterDelete}** |`,
  "",
  "### Key findings",
  "",
  "1. **Business model is broader than spare parts** — 9,389 products span consumer drones, enterprise platforms, accessories, spare parts, and legacy lines.",
  "2. **No collection is menu-linked today** — `main-menu` points to `/collections/all`; taxonomy must be wired into navigation.",
  "3. **43 empty collection shells exist** — but **only " + del.length + " are safe DELETE candidates** under your rules; the rest are protected Legacy DJI, Enterprise, FlyCart, or Industry Solutions.",
  "4. **1 MERGE required** — `dji-mavic-3-classic-1` → `dji-mavic-3-classic`.",
  "5. **Menus were recreated** — 29 live menus (orphan duplicates from migration worker); 24 are safe to remove after theme confirm.",
  "6. **2 page references** — `dji` and `dji-dronare` linked from page `dji-osmo`.",
  "",
  "---",
  "",
  "## 1. Complete collection inventory",
  "",
  `Total: **${collections.length}** collections (${collData.counts?.keep || 0} with products, ${collData.counts?.empty_collections || 0} empty).`,
  "",
  "| Handle | Title | Products | Taxonomy | Action | SEO | Menu | Page | Theme |",
  "|---|---|---:|---|---|---|---|---|---|",
];

for (const c of [...enriched].sort((a, b) => a.handle.localeCompare(b.handle))) {
  lines.push(
    `| \`${esc(c.handle)}\` | ${esc(c.title)} | ${c.products_count} | ${c.taxonomy} | ${c.business_action} | ${c.seo_score} | ${c.referenced_by_menu ? "yes" : "—"} | ${c.referenced_by_page ? c.page_references.join(",") : "—"} | ${c.referenced_by_theme_section ? "yes" : "—"} |`,
  );
}

lines.push("", "---", "", "## 2. Recommended collection architecture", "", "### Target information architecture", "");

for (const [group, subs] of Object.entries(TARGET_IA)) {
  lines.push(`#### ${group}`);
  lines.push("");
  for (const s of subs) lines.push(`- ${s}`);
  lines.push("");
}

lines.push("### Current → target mapping", "");
lines.push("| Taxonomy | Collections | Top handles |");
lines.push("|---|---:|---|");
for (const [tax, count] of Object.entries(taxonomyCounts).sort((a, b) => b[1] - a[1])) {
  const tops = enriched
    .filter((c) => c.taxonomy === tax && c.business_action !== "DELETE")
    .sort((a, b) => b.products_count - a.products_count)
    .slice(0, 3)
    .map((c) => c.handle)
    .join(", ");
  lines.push(`| ${tax} | ${count} | ${tops || "—"} |`);
}

lines.push("", "### Proposed tree (post-cleanup)", "", "```");
lines.push("EuroDroneParts");
lines.push("├── Consumer DJI/");
for (const fam of TARGET_IA["Consumer DJI"]) lines.push(`│   ├── ${fam}/`);
lines.push("├── Enterprise DJI/");
for (const fam of TARGET_IA["Enterprise DJI"]) lines.push(`│   ├── ${fam}/`);
lines.push("├── Industry Solutions/");
for (const fam of TARGET_IA["Industry Solutions"]) lines.push(`│   ├── ${fam}/`);
lines.push("├── Spare Parts/");
for (const fam of TARGET_IA["Spare Parts"]) lines.push(`│   ├── ${fam}/`);
lines.push("├── Accessories/");
for (const fam of TARGET_IA.Accessories) lines.push(`│   ├── ${fam}/`);
lines.push("├── FlyCart/");
for (const fam of TARGET_IA.FlyCart) lines.push(`│   ├── ${fam}/`);
lines.push("└── Legacy DJI models/ [protected]");
lines.push("```", "", "---", "", "## 3. Collections to KEEP", "", `**${keep.length} collections**`, "");
lines.push("| Handle | Title | Products | Taxonomy | Reason |");
lines.push("|---|---|---:|---|---|");
for (const c of keep.sort((a, b) => b.products_count - a.products_count)) {
  lines.push(`| \`${esc(c.handle)}\` | ${esc(c.title)} | ${c.products_count} | ${c.taxonomy} | ${esc(c.business_reason)} |`);
}

lines.push("", "---", "", "## 4. Collections to MERGE", "", `**${merge.length} collections**`, "");
if (!merge.length) lines.push("_None._");
else {
  lines.push("| Source | Target | Products | Reason |");
  lines.push("|---|---|---:|---|");
  for (const c of merge) {
    lines.push(`| \`${esc(c.handle)}\` | \`${esc(c.merge_target || "?")}\` | ${c.products_count} | ${esc(c.reason)} |`);
  }
}

lines.push("", "---", "", "## 5. Collections to DELETE", "", `**${del.length} collections** (awaiting approval)`, "");
lines.push("> Protected categories (Legacy DJI, Enterprise, FlyCart, Industry Solutions) are **excluded** from this list per your rules.", "");
if (!del.length) lines.push("_None under current rules._");
else {
  lines.push("| Handle | Title | Taxonomy | Reason |");
  lines.push("|---|---|---|---|");
  for (const c of del.sort((a, b) => a.handle.localeCompare(b.handle))) {
    lines.push(`| \`${esc(c.handle)}\` | ${esc(c.title)} | ${c.taxonomy} | ${esc(c.business_reason)} |`);
  }
}

lines.push("", "### Previously flagged DELETE (now protected)", "", "| Handle | Protected as |");
lines.push("|---|---|");
const oldDelete = (collData.groups?.DELETE || []).map((c) => c.handle);
for (const h of oldDelete) {
  const c = enriched.find((x) => x.handle === h);
  if (c && c.business_action === "KEEP") lines.push(`| \`${h}\` | ${c.business_reason} |`);
}

lines.push("", "---", "", "## Pages inventory", "", `Total: **${pages.length}** pages (${pagesWithCollectionRefs.length} reference collections).`, "");
lines.push("| Handle | Title | Collection refs |");
lines.push("|---|---|---|");
for (const p of pages.sort((a, b) => a.handle.localeCompare(b.handle))) {
  const refs = [...(p.body || "").matchAll(/\/collections\/([^/"'\s?#]+)/g)].map((m) => m[1]);
  lines.push(`| \`${esc(p.handle)}\` | ${esc(p.title)} | ${refs.length ? refs.join(", ") : "—"} |`);
}

lines.push("", "---", "", "## 6. New menu structure (proposed)", "", "Replace catalog-only `main-menu` with taxonomy-driven navigation:", "");

function renderMenuTree(items, depth = 0) {
  const out = [];
  for (const it of items || []) {
    const pad = "  ".repeat(depth);
    if (it.children?.length) {
      out.push(`${pad}- **${it.title}**`);
      out.push(...renderMenuTree(it.children, depth + 1));
    } else {
      out.push(`${pad}- ${it.title} → \`${it.url}\``);
    }
  }
  return out;
}

for (const menu of proposedMenu()) {
  lines.push(`### \`${menu.handle}\` — ${menu.title}`, "");
  lines.push(...renderMenuTree(menu.items));
  lines.push("");
}

lines.push("### Menus to remove (24 orphan duplicates)", "");
lines.push("After theme confirmation, remove recreated migration orphans:");
lines.push("");
const orphanMenus = liveMenus.filter((m) => /-\d+$/.test(m.handle) || ["actionkameror", "dronare", "partnership"].includes(m.handle));
for (const m of orphanMenus) {
  lines.push(`- \`${m.handle}\` (${m.title}) — 0 items, duplicate`);
}
lines.push("", "### Menus to keep (5)", "");
for (const h of ["main-menu", "meny", "footer", "enterprise-dr-nare", "customer-account-main-menu"]) {
  const m = liveMenus.find((x) => x.handle === h);
  lines.push(`- \`${h}\`${m ? ` — ${m.item_count ?? countMenuItems(m)} items` : ""}`);
}

function countMenuItems(menu) {
  let n = 0;
  const walk = (items) => {
    for (const it of items || []) {
      n++;
      walk(it.items);
    }
  };
  walk(menu.items);
  return n;
}

lines.push("", "---", "", "## 7. SEO impact analysis", "", "| Risk level | Collections | Impact |");
lines.push("|---|---|---|");
const highSeo = enriched.filter((c) => c.products_count >= 100 || c.referenced_by_page);
const medSeo = enriched.filter((c) => c.products_count >= 10 && c.products_count < 100 && !highSeo.includes(c));
const lowSeo = del;
lines.push(`| **High** (100+ products or page-linked) | ${highSeo.length} | Do not delete; ensure redirects if merged |`);
lines.push(`| **Medium** (10–99 products) | ${medSeo.length} | Monitor rankings; keep canonical URLs |`);
lines.push(`| **Low** (empty, unreferenced) | ${lowSeo.length} | Safe to delete with 301 to parent taxonomy |`);
lines.push(`| **Protected empty** | ${keep.filter((c) => c.protected).length} | Keep for future SEO — populate with curated products |`);

lines.push("", "### Top collections by SEO weight", "", "| Handle | Products | SEO score | Page refs |");
lines.push("|---|---:|---:|---|");
for (const c of [...enriched].sort((a, b) => b.seo_score - a.seo_score).slice(0, 20)) {
  lines.push(`| \`${c.handle}\` | ${c.products_count} | ${c.seo_score} | ${c.page_references?.join(", ") || "—"} |`);
}

lines.push("", "### DELETE impact", "", `Removing ${del.length} empty orphans has **minimal SEO risk** — none have products, menu links, or page references.`, "");

lines.push("", "---", "", "## 8. Redirect recommendations", "", "| From | To | Type | Trigger |");
lines.push("|---|---|---|---|");
for (const r of redirects.slice(0, 60)) {
  lines.push(`| \`/collections/${r.from}\` | \`/collections/${r.to}\` | ${r.type} | ${r.reason} |`);
}
if (redirects.length > 60) lines.push(`| _…${redirects.length - 60} more_ | | | |`);

lines.push("", "---", "", "## 9. Product migration plan", "", "### Phase 1 — Merge duplicates", "");
for (const m of migrationPlan.filter((x) => x.source !== x.target)) {
  lines.push(`- **${m.source}** → **${m.target}** (${m.products} products): ${m.action}`);
}
lines.push("", "### Phase 2 — Populate protected empty shells", "");
for (const m of migrationPlan.filter((x) => x.source === x.target).slice(0, 25)) {
  lines.push(`- \`${m.source}\`: ${m.action}`);
}
if (migrationPlan.filter((x) => x.source === x.target).length > 25) {
  lines.push(`- _…and ${migrationPlan.filter((x) => x.source === x.target).length - 25} more protected shells_`);
}
lines.push("", "### Phase 3 — Taxonomy alignment", "");
lines.push("- Tag products with `product_type` matching target IA (Consumer / Enterprise / Spare Parts / Accessories)");
lines.push("- Use smart collection rules per model family (Mavic 3, Mini 4, Matrice 4, etc.)");
lines.push("- Route `alla-produkter` (841 products) as catalog fallback; deprecate once family hubs are complete");
lines.push("", "### Phase 4 — Menu wiring", "");
lines.push("- Update `main-menu` from `/collections/all` to proposed taxonomy tree (Section 6)");
lines.push("- Populate `enterprise-dr-nare` menu (currently 0 items)");
lines.push("", "---", "", "## 10. Final collection count after cleanup", "", "| Stage | Count |");
lines.push("|---|---:|");
lines.push(`| Current live collections | ${collections.length} |`);
lines.push(`| After MERGE (${merge.length}) | ${afterMerge} |`);
lines.push(`| After DELETE (${del.length}, approved) | **${afterDelete}** |`);
lines.push(`| Protected shells retained | ${keep.filter((c) => c.protected).length} |`);
lines.push("", "---", "", "## Approval checklist", "", "Before executing any changes, confirm:", "", "- [ ] KEEP list approved", "- [ ] MERGE pairs approved", `- [ ] DELETE list approved (${del.length} collections)`, "- [ ] Proposed menu structure approved", "- [ ] Redirect map approved", "- [ ] Protected Legacy DJI / Enterprise / FlyCart / Industry shells to populate (not delete)", "", "**No action will be taken until explicit approval.**", "");

writeFileSync(OUT_MD, lines.join("\n"));

const payload = {
  generated_at: new Date().toISOString(),
  store: STORE,
  migration_id: MID,
  product_count: productCount,
  page_count: pageCount ?? pages.length,
  pages: pages.map((p) => ({ handle: p.handle, title: p.title })),
  menu_count: liveMenus.length || menuData?.inventory?.total_live_menus,
  collections: {
    total: collections.length,
    keep: keep.length,
    merge: merge.length,
    delete: del.length,
    protected: keep.filter((c) => c.protected).length,
    projected_after_cleanup: afterDelete,
  },
  taxonomy_counts: taxonomyCounts,
  keep: keep.map((c) => ({ handle: c.handle, title: c.title, products: c.products_count, taxonomy: c.taxonomy })),
  merge: merge.map((c) => ({ source: c.handle, target: c.merge_target, products: c.products_count })),
  delete: del.map((c) => ({ handle: c.handle, title: c.title, taxonomy: c.taxonomy })),
  redirects,
  migration_plan: migrationPlan,
  proposed_menus: proposedMenu(),
};
writeFileSync(OUT_JSON, JSON.stringify(payload, null, 2));

console.log(`Wrote ${OUT_MD}`);
console.log(`Wrote ${OUT_JSON}`);
console.log(JSON.stringify(payload.collections, null, 2));
