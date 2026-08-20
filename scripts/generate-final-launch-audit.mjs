#!/usr/bin/env node
/**
 * EuroDroneParts — Final Launch Audit (READ-ONLY).
 * Scans products, collections, pages, menus. Does not modify the store.
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const URL = process.env.CLONER_SUPABASE_URL || "https://wsncjdajweoujhidlxas.supabase.co";
const STORE = "ya1xhg-x6.myshopify.com";

const OUT = {
  noImages: join(ROOT, "PRODUCTS_WITHOUT_IMAGES.md"),
  noPrices: join(ROOT, "PRODUCTS_WITHOUT_PRICES.md"),
  noDescriptions: join(ROOT, "PRODUCTS_WITHOUT_DESCRIPTIONS.md"),
  emptyCollections: join(ROOT, "EMPTY_COLLECTIONS.md"),
  brokenMenus: join(ROOT, "BROKEN_MENU_LINKS.md"),
  seoGaps: join(ROOT, "SEO_GAPS.md"),
  blockers: join(ROOT, "FINAL_LAUNCH_BLOCKERS.md"),
  audit: join(ROOT, ".final-launch-audit.json"),
};

const CANONICAL_MENUS = new Set([
  "main-menu",
  "footer",
  "partnership",
  "enterprise-dr-nare",
  "customer-account-main-menu",
  "meny",
  "service-support-deploy",
  "spare-parts-deploy",
  "enterprise-expansion-deploy",
  "b2b-enterprise-deploy",
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
  if (j?.errors?.length) throw new Error(JSON.stringify(j.errors));
  return j?.data ?? j;
}

async function paginate(query, path, pageSize = 100, maxPages = 300) {
  const all = [];
  let cursor = null;
  for (let p = 0; p < maxPages; p++) {
    const data = await gql(query, { cursor, first: pageSize });
    const conn = path.split(".").reduce((o, k) => o?.[k], data);
    all.push(...(conn?.nodes || []));
    if (!conn?.pageInfo?.hasNextPage) break;
    cursor = conn.pageInfo.endCursor;
  }
  return all;
}

function walkMenu(menuHandle, items, out = []) {
  for (const it of items || []) {
    out.push({ menu: menuHandle, title: it.title, url: it.url, type: it.type });
    walkMenu(menuHandle, it.items, out);
  }
  return out;
}

function stripHtml(html) {
  return (html || "").replace(/<[^>]+>/g, "").trim();
}

function severity(count, thresholds) {
  if (count >= thresholds.critical) return "CRITICAL";
  if (count >= thresholds.high) return "HIGH";
  if (count >= thresholds.medium) return "MEDIUM";
  return "LOW";
}

loadEnv();

console.error("Final launch audit — scanning store...");

// Products
const products = [];
let pCursor = null;
for (let p = 0; p < 100; p++) {
  const data = await gql(
    `query($c: String) {
      products(first: 100, after: $c) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id handle title status vendor productType
          descriptionHtml
          media(first: 1) { nodes { id } }
          variants(first: 20) { nodes { price compareAtPrice sku } }
          seo { title description }
        }
      }
    }`,
    { c: pCursor },
  );
  products.push(...(data.products?.nodes || []));
  if (!data.products?.pageInfo?.hasNextPage) break;
  pCursor = data.products.pageInfo.endCursor;
  if (p % 10 === 0) console.error(`  products: ${products.length}`);
}

const statusCounts = { ACTIVE: 0, DRAFT: 0, ARCHIVED: 0 };
for (const pr of products) statusCounts[pr.status] = (statusCounts[pr.status] || 0) + 1;

const withoutImages = products.filter((p) => !(p.media?.nodes?.length > 0));
const withoutPrices = products.filter((p) => {
  const prices = (p.variants?.nodes || []).map((v) => parseFloat(v.price || "0"));
  return prices.length === 0 || !prices.some((x) => x > 0);
});
const withoutDescriptions = products.filter((p) => !stripHtml(p.descriptionHtml));

// Collections
console.error("Fetching collections...");
const collections = await paginate(
  `query($cursor: String, $first: Int!) {
    collections(first: $first, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id handle title productsCount { count }
        seo { title description }
        descriptionHtml
        ruleSet { rules { column relation condition } }
      }
    }
  }`,
  "collections",
  50,
  20,
);

const colByHandle = new Map(collections.map((c) => [c.handle, c]));
const emptyCollections = collections.filter((c) => (c.productsCount?.count ?? 0) === 0);

// Pages
console.error("Fetching pages...");
const pages = await paginate(
  `query($cursor: String, $first: Int!) {
    pages(first: $first, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      nodes { id handle title bodySummary }
    }
  }`,
  "pages",
  50,
  10,
);
const pageByHandle = new Map(pages.map((p) => [p.handle, p]));

// Menus
console.error("Fetching menus...");
const menus = await paginate(
  `query($cursor: String, $first: Int!) {
    menus(first: $first, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      nodes { id handle title items { title url type items { title url type items { title url type } } } }
    }
  }`,
  "menus",
  50,
  20,
);

const menuFlat = menus.flatMap((m) => walkMenu(m.handle, m.items));
const brokenLinks = [];
const emptyMenus = [];

for (const m of menus) {
  const items = walkMenu(m.handle, m.items);
  if (items.length === 0) emptyMenus.push({ handle: m.handle, title: m.title });
  for (const it of items) {
    if (!it.url) continue;
    const colM = it.url.match(/\/collections\/([^/?#]+)/);
    const pageM = it.url.match(/\/pages\/([^/?#]+)/);
    if (colM) {
      const h = colM[1];
      if (!colByHandle.has(h)) {
        brokenLinks.push({
          severity: CANONICAL_MENUS.has(m.handle) ? "CRITICAL" : "HIGH",
          menu: m.handle,
          title: it.title,
          url: it.url,
          issue: `missing_collection:${h}`,
        });
      } else if ((colByHandle.get(h).productsCount?.count ?? 0) === 0) {
        brokenLinks.push({
          severity: CANONICAL_MENUS.has(m.handle) ? "HIGH" : "MEDIUM",
          menu: m.handle,
          title: it.title,
          url: it.url,
          issue: `empty_collection:${h}`,
        });
      }
    } else if (pageM) {
      const h = pageM[1];
      if (!pageByHandle.has(h)) {
        brokenLinks.push({
          severity: CANONICAL_MENUS.has(m.handle) ? "HIGH" : "MEDIUM",
          menu: m.handle,
          title: it.title,
          url: it.url,
          issue: `missing_page:${h}`,
        });
      }
    }
  }
}

// SEO gaps
const seoGaps = [];
for (const c of collections) {
  const body = stripHtml(c.descriptionHtml);
  if (!c.seo?.title) seoGaps.push({ severity: "HIGH", type: "collection", handle: c.handle, name: c.title, issue: "missing_meta_title" });
  if (!c.seo?.description) seoGaps.push({ severity: "HIGH", type: "collection", handle: c.handle, name: c.title, issue: "missing_meta_description" });
  if (!body) seoGaps.push({ severity: "MEDIUM", type: "collection", handle: c.handle, name: c.title, issue: "missing_body_description" });
  if (c.seo?.title && c.seo.title.length < 30) seoGaps.push({ severity: "LOW", type: "collection", handle: c.handle, name: c.title, issue: "short_meta_title" });
}

for (const p of pages) {
  if (!stripHtml(p.bodySummary)) seoGaps.push({ severity: "MEDIUM", type: "page", handle: p.handle, name: p.title, issue: "missing_body_content" });
  if (/actionking|360-kamera/i.test(p.handle + p.title)) {
    seoGaps.push({ severity: "LOW", type: "page", handle: p.handle, name: p.title, issue: "legacy_actionking_page" });
  }
}

// Launch scoring
const eligiblePublish = products.filter((p) => {
  const hasImage = (p.media?.nodes?.length || 0) > 0;
  const hasPrice = (p.variants?.nodes || []).some((v) => parseFloat(v.price || "0") > 0);
  return p.title && hasImage && p.vendor && hasPrice && stripHtml(p.descriptionHtml);
}).length;

const criticalBlockers = [];
const highBlockers = [];
const mediumBlockers = [];
const lowBlockers = [];

if (statusCounts.ACTIVE === 0) {
  criticalBlockers.push({
    severity: "CRITICAL",
    issue: "All products are DRAFT — storefront has no purchasable products",
    count: products.length,
  });
}
if (withoutImages.length > 0) {
  const sev = severity(withoutImages.length, { critical: 500, high: 100, medium: 20 });
  (sev === "CRITICAL" ? criticalBlockers : sev === "HIGH" ? highBlockers : mediumBlockers).push({
    severity: sev,
    issue: "Products missing images",
    count: withoutImages.length,
  });
}
if (withoutPrices.length > 0) {
  highBlockers.push({ severity: "HIGH", issue: "Products missing valid price", count: withoutPrices.length });
}
if (withoutDescriptions.length > 0) {
  mediumBlockers.push({ severity: "MEDIUM", issue: "Products missing descriptions", count: withoutDescriptions.length });
}
if (emptyCollections.length > 0) {
  const sev = severity(emptyCollections.length, { critical: 50, high: 20, medium: 10 });
  (sev === "CRITICAL" ? criticalBlockers : sev === "HIGH" ? highBlockers : mediumBlockers).push({
    severity: sev,
    issue: "Empty collections",
    count: emptyCollections.length,
  });
}
const critBroken = brokenLinks.filter((b) => b.severity === "CRITICAL");
const highBroken = brokenLinks.filter((b) => b.severity === "HIGH");
if (critBroken.length) criticalBlockers.push({ severity: "CRITICAL", issue: "Broken links in canonical menus", count: critBroken.length });
if (highBroken.length) highBlockers.push({ severity: "HIGH", issue: "Broken/empty links in key menus", count: highBroken.length });
if (emptyMenus.length > 50) {
  highBlockers.push({ severity: "HIGH", issue: "Empty legacy menus", count: emptyMenus.length });
} else if (emptyMenus.length > 0) {
  mediumBlockers.push({ severity: "MEDIUM", issue: "Empty menus", count: emptyMenus.length });
}

const seoCritical = seoGaps.filter((g) => g.severity === "CRITICAL").length;
const seoHigh = seoGaps.filter((g) => g.severity === "HIGH").length;
if (seoHigh > 20) highBlockers.push({ severity: "HIGH", issue: "SEO gaps (collections)", count: seoHigh });

// Score: start 100, deduct
let launchScore = 100;
launchScore -= statusCounts.ACTIVE === 0 ? 25 : 0;
launchScore -= Math.min(15, Math.round((withoutImages.length / products.length) * 100));
launchScore -= Math.min(10, Math.round((withoutPrices.length / products.length) * 100));
launchScore -= Math.min(8, Math.round((emptyCollections.length / collections.length) * 100));
launchScore -= Math.min(10, critBroken.length * 2 + highBroken.length);
launchScore -= Math.min(5, Math.round(emptyMenus.length / 20));
launchScore = Math.max(0, Math.round(launchScore));

const goNoGo =
  criticalBlockers.length > 0 || statusCounts.ACTIVE === 0
    ? "NO-GO"
    : highBlockers.length > 3
      ? "CONDITIONAL GO"
      : "GO";

// Estimated time (technical effort, not calendar promise)
const hoursEstimate =
  (statusCounts.ACTIVE === 0 ? 8 : 0) +
  Math.ceil(withoutImages.length / 50) * 2 +
  Math.ceil(emptyMenus.length / 30) * 1 +
  (critBroken.length > 0 ? 4 : 0) +
  2;
const timeEstimate =
  hoursEstimate <= 8
    ? `${hoursEstimate}–${hoursEstimate + 4} hours of focused work`
    : hoursEstimate <= 24
      ? `1–2 business days of focused work`
      : `2–4 business days of focused work`;

const top20 = [
  { rank: 1, severity: "CRITICAL", action: "Publish eligible products (bulk publication approval)", area: "Catalog" },
  { rank: 2, severity: "CRITICAL", action: `Fix ${withoutImages.length} products missing images`, area: "Catalog" },
  { rank: 3, severity: "HIGH", action: `Resolve ${withoutPrices.length} products without valid prices`, area: "Catalog" },
  { rank: 4, severity: "HIGH", action: `Populate or hide ${emptyCollections.length} empty collections`, area: "Collections" },
  { rank: 5, severity: "HIGH", action: `Remove ${emptyMenus.length} empty legacy menus`, area: "Navigation" },
  { rank: 6, severity: brokenLinks.length ? "HIGH" : "LOW", action: brokenLinks.length ? `Fix ${critBroken.length + highBroken.length} broken/empty menu links` : "Verify deploy menus linked in theme", area: "Navigation" },
  { rank: 7, severity: "HIGH", action: `Add missing SEO metadata to ${seoGaps.filter((g) => g.issue.includes("meta")).length} assets`, area: "SEO" },
  { rank: 8, severity: "MEDIUM", action: `Add descriptions to ${withoutDescriptions.length} products`, area: "Catalog" },
  { rank: 9, severity: "MEDIUM", action: "Link new deploy menus to theme footer/header", area: "Navigation" },
  { rank: 10, severity: "MEDIUM", action: "Remove legacy ActionKing pages from navigation", area: "Content" },
  { rank: 11, severity: "MEDIUM", action: "Validate smart collection rules post-publication", area: "Collections" },
  { rank: 12, severity: "MEDIUM", action: "Configure payment methods for B2B (invoice/leasing)", area: "B2B" },
  { rank: 13, severity: "MEDIUM", action: "Test checkout flow end-to-end", area: "QA" },
  { rank: 14, severity: "LOW", action: "Standardize product tags across catalog", area: "Data" },
  { rank: 15, severity: "LOW", action: "Schema markup theme audit", area: "SEO" },
  { rank: 16, severity: "LOW", action: "Submit sitemap after publication", area: "SEO" },
  { rank: 17, severity: "LOW", action: "Configure shipping zones for Sweden launch", area: "Operations" },
  { rank: 18, severity: "LOW", action: "Review new service/B2B page content templates", area: "Content" },
  { rank: 19, severity: "LOW", action: "Enable analytics and conversion tracking", area: "Marketing" },
  { rank: 20, severity: "LOW", action: "Plan Phase 2 European market activation", area: "Expansion" },
];

const audit = {
  generated_at: new Date().toISOString(),
  store: STORE,
  mode: "read_only",
  counts: {
    products: products.length,
    product_status: statusCounts,
    collections: collections.length,
    pages: pages.length,
    menus: menus.length,
    without_images: withoutImages.length,
    without_prices: withoutPrices.length,
    without_descriptions: withoutDescriptions.length,
    empty_collections: emptyCollections.length,
    broken_menu_links: brokenLinks.length,
    empty_menus: emptyMenus.length,
    seo_gaps: seoGaps.length,
    eligible_publish: eligiblePublish,
  },
  launch_score: launchScore,
  go_no_go: goNoGo,
  time_estimate: timeEstimate,
  critical_blockers: criticalBlockers,
  high_blockers: highBlockers,
  medium_blockers: mediumBlockers,
  top20,
};

writeFileSync(OUT.audit, JSON.stringify(audit, null, 2));

function productTable(rows, limit = 50) {
  const head = "| Title | Handle | Status | Severity |\n|---|---|---|---|";
  const body = rows
    .slice(0, limit)
    .map((p) => `| ${(p.title || "").slice(0, 55)} | \`${p.handle}\` | ${p.status} | ${p.severity || "—"} |`)
    .join("\n");
  const more = rows.length > limit ? `\n\n_...and ${rows.length - limit} more (see .final-launch-audit.json)_` : "";
  return `${head}\n${body}${more}`;
}

writeFileSync(
  OUT.noImages,
  [
    "# Products Without Images",
    "",
    `**Generated:** ${audit.generated_at}`,
    `**Store:** ${STORE}`,
    `**Total:** ${withoutImages.length} / ${products.length} (${Math.round((withoutImages.length / products.length) * 100)}%)`,
    `**Severity:** ${severity(withoutImages.length, { critical: 500, high: 100, medium: 20 })}`,
    "",
    productTable(withoutImages.map((p) => ({ ...p, severity: "HIGH" }))),
    "",
  ].join("\n"),
);

writeFileSync(
  OUT.noPrices,
  [
    "# Products Without Prices",
    "",
    `**Generated:** ${audit.generated_at}`,
    `**Total:** ${withoutPrices.length} / ${products.length}`,
    `**Severity:** HIGH`,
    "",
    productTable(withoutPrices.map((p) => ({ ...p, severity: "HIGH" }))),
    "",
  ].join("\n"),
);

writeFileSync(
  OUT.noDescriptions,
  [
    "# Products Without Descriptions",
    "",
    `**Generated:** ${audit.generated_at}`,
    `**Total:** ${withoutDescriptions.length} / ${products.length}`,
    `**Severity:** MEDIUM`,
    "",
    productTable(withoutDescriptions.map((p) => ({ ...p, severity: "MEDIUM" }))),
    "",
  ].join("\n"),
);

writeFileSync(
  OUT.emptyCollections,
  [
    "# Empty Collections",
    "",
    `**Generated:** ${audit.generated_at}`,
    `**Total:** ${emptyCollections.length} / ${collections.length}`,
    `**Severity:** ${severity(emptyCollections.length, { critical: 50, high: 20, medium: 10 })}`,
    "",
    "| Collection | Handle | Type |",
    "|---|---|:---:|",
    ...emptyCollections.map((c) => {
      const isSmart = !!(c.ruleSet?.rules?.length);
      return `| ${c.title.slice(0, 50)} | \`${c.handle}\` | ${isSmart ? "Smart" : "Manual"} |`;
    }),
    "",
  ].join("\n"),
);

writeFileSync(
  OUT.brokenMenus,
  [
    "# Broken Menu Links",
    "",
    `**Generated:** ${audit.generated_at}`,
    `**Total issues:** ${brokenLinks.length}`,
    `**Empty menus:** ${emptyMenus.length}`,
    "",
    "## Broken / empty link references",
    "",
    "| Severity | Menu | Title | URL | Issue |",
    "|---|---|---|---|---|",
    ...brokenLinks.slice(0, 100).map((b) => `| ${b.severity} | \`${b.menu}\` | ${b.title} | ${b.url} | ${b.issue} |`),
    "",
    "## Empty menus (sample)",
    "",
    emptyMenus.length
      ? emptyMenus.slice(0, 40).map((m) => `- \`${m.handle}\` — ${m.title}`).join("\n")
      : "- None",
    emptyMenus.length > 40 ? `\n_...and ${emptyMenus.length - 40} more_` : "",
    "",
  ].join("\n"),
);

writeFileSync(
  OUT.seoGaps,
  [
    "# SEO Gaps",
    "",
    `**Generated:** ${audit.generated_at}`,
    `**Total gaps:** ${seoGaps.length}`,
    "",
    "| Severity | Type | Handle | Issue |",
    "|---|---|---|---|",
    ...seoGaps.slice(0, 120).map((g) => `| ${g.severity} | ${g.type} | \`${g.handle}\` | ${g.issue} |`),
    seoGaps.length > 120 ? `\n_...and ${seoGaps.length - 120} more_` : "",
    "",
    "## By severity",
    "",
    `| CRITICAL | ${seoGaps.filter((g) => g.severity === "CRITICAL").length} |`,
    `| HIGH | ${seoGaps.filter((g) => g.severity === "HIGH").length} |`,
    `| MEDIUM | ${seoGaps.filter((g) => g.severity === "MEDIUM").length} |`,
    `| LOW | ${seoGaps.filter((g) => g.severity === "LOW").length} |`,
    "",
  ].join("\n"),
);

writeFileSync(
  OUT.blockers,
  [
    "# Final Launch Blockers",
    "",
    `**Generated:** ${audit.generated_at}`,
    `**Store:** ${STORE}`,
    "**Mode:** Read-only audit",
    "",
    "---",
    "",
    "## Launch score: **" + launchScore + "%**",
    "",
    "## Go / No-Go: **" + goNoGo + "**",
    "",
    goNoGo === "NO-GO"
      ? "> Store is not ready for public launch. Critical blockers must be resolved first."
      : goNoGo === "CONDITIONAL GO"
        ? "> Structure is in place. Resolve high-priority blockers before public launch."
        : "> Store meets minimum launch criteria.",
    "",
    "## Estimated time to launch",
    "",
    timeEstimate,
    "",
    "Breakdown: product publication (~4–8h), image fixes (~" + Math.ceil(withoutImages.length / 50) * 2 + "h), menu cleanup (~2–4h), QA (~2h).",
    "",
    "---",
    "",
    "## Store snapshot",
    "",
    "| Metric | Count |",
    "|--------|------:|",
    `| Products | ${products.length} |`,
    `| Active / Draft / Archived | ${statusCounts.ACTIVE} / ${statusCounts.DRAFT} / ${statusCounts.ARCHIVED || 0} |`,
    `| Eligible to publish | ${eligiblePublish} |`,
    `| Collections | ${collections.length} |`,
    `| Pages | ${pages.length} |`,
    `| Menus | ${menus.length} |`,
    "",
    "---",
    "",
    "## Blockers by severity",
    "",
    "### CRITICAL",
    "",
    criticalBlockers.length ? criticalBlockers.map((b) => `- **${b.issue}** (${b.count})`).join("\n") : "- None",
    "",
    "### HIGH",
    "",
    highBlockers.length ? highBlockers.map((b) => `- **${b.issue}** (${b.count})`).join("\n") : "- None",
    "",
    "### MEDIUM",
    "",
    mediumBlockers.length ? mediumBlockers.map((b) => `- **${b.issue}** (${b.count})`).join("\n") : "- None",
    "",
    "---",
    "",
    "## Top 20 remaining actions",
    "",
    "| # | Severity | Area | Action |",
    "|--:|---|---|---|",
    ...top20.map((a) => `| ${a.rank} | ${a.severity} | ${a.area} | ${a.action} |`),
    "",
    "---",
    "",
    "## Report index",
    "",
    "- [PRODUCTS_WITHOUT_IMAGES.md](PRODUCTS_WITHOUT_IMAGES.md)",
    "- [PRODUCTS_WITHOUT_PRICES.md](PRODUCTS_WITHOUT_PRICES.md)",
    "- [PRODUCTS_WITHOUT_DESCRIPTIONS.md](PRODUCTS_WITHOUT_DESCRIPTIONS.md)",
    "- [EMPTY_COLLECTIONS.md](EMPTY_COLLECTIONS.md)",
    "- [BROKEN_MENU_LINKS.md](BROKEN_MENU_LINKS.md)",
    "- [SEO_GAPS.md](SEO_GAPS.md)",
    "",
  ].join("\n"),
);

console.log(JSON.stringify({ launch_score: launchScore, go_no_go: goNoGo, ...audit.counts }, null, 2));
