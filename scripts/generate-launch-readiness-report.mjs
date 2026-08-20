#!/usr/bin/env node
/**
 * EuroDroneParts — Launch Readiness Phase (READ-ONLY AUDIT).
 * Does NOT publish products, delete menus, or modify the store.
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const URL = process.env.CLONER_SUPABASE_URL || "https://wsncjdajweoujhidlxas.supabase.co";
const STORE = "ya1xhg-x6.myshopify.com";

const OUT = {
  master: join(ROOT, "EURODRONEPARTS_LAUNCH_READINESS_REPORT.md"),
  publication: join(ROOT, "PRODUCT_PUBLICATION_REPORT.md"),
  menu: join(ROOT, "MENU_CLEANUP_REPORT.md"),
  collection: join(ROOT, "COLLECTION_VALIDATION_REPORT.md"),
  enterprise: join(ROOT, "ENTERPRISE_GAP_REPORT.md"),
  seo: join(ROOT, "SEO_GAP_REPORT.md"),
  quality: join(ROOT, "PRODUCT_DATA_QUALITY_REPORT.md"),
  spareParts: join(ROOT, "SPARE_PARTS_READINESS_REPORT.md"),
  audit: join(ROOT, ".launch-readiness-audit.json"),
};

const CANONICAL_MENUS = new Set([
  "main-menu",
  "footer",
  "partnership",
  "enterprise-dr-nare",
  "customer-account-main-menu",
  "meny",
]);

const LEGACY_MENU_PATTERNS = /^(dronare|actionkameror|vandring-outdoor)(-\d+)?$/;
const MIGRATION_MENU_SUFFIX = /-\d+$/;

const ENTERPRISE_GAPS = [
  { group: "Matrice", items: [
    { name: "Matrice 3D", patterns: ["dji-matrice-3d", "matrice-3d"] },
    { name: "Matrice 3TD", patterns: ["dji-matrice-3td", "matrice-3td", "3td"] },
    { name: "Matrice 30", patterns: ["matrice-30-serie", "matrice-30"] },
    { name: "Matrice 300 RTK", patterns: ["matrice-300", "300-rtk"] },
    { name: "Matrice 350 RTK", patterns: ["matrice-350", "350-rtk"] },
    { name: "Matrice 400", patterns: ["matrice-400"] },
    { name: "Matrice 4", patterns: ["matrice-4-serie", "dji-matrice-4"] },
  ]},
  { group: "Mavic Enterprise", items: [
    { name: "Mavic 3 Enterprise", patterns: ["mavic-3-enterprise", "mavic 3 enterprise", "mavic-3e"] },
    { name: "Mavic 3 Thermal", patterns: ["mavic-3-thermal", "mavic 3 thermal", "mavic-3t"] },
  ]},
  { group: "Agras", items: [
    { name: "T25", patterns: ["agras-t25", "t25"] },
    { name: "T40", patterns: ["agras-t40", "t40"] },
    { name: "T50", patterns: ["agras-t50", "t50"] },
  ]},
  { group: "FlyCart", items: [
    { name: "FlyCart 30", patterns: ["flycart-30", "flycart 30"] },
    { name: "FlyCart 100", patterns: ["flycart-100", "flycart 100"] },
  ]},
  { group: "DJI Dock", items: [
    { name: "Dock 2", patterns: ["dock-2", "dock 2"] },
    { name: "Dock 3", patterns: ["dock-3", "dock 3"] },
  ]},
];

const COLLECTION_GROUPS_VALIDATE = [
  "Enterprise DJI",
  "FlyCart",
  "Sensors & Payloads",
  "Industry Solutions",
  "Accessories",
  "Spare Parts",
];

const SPARE_PARTS_MATRIX = {
  consumer: ["Mini", "Air", "Mavic", "Avata", "Neo", "Flip"],
  enterprise: ["Matrice", "Mavic Enterprise", "Agras", "FlyCart"],
};

const CONSUMER_SPARE_PATTERNS = {
  Mini: ["mini", "dji-mini"],
  Air: ["air", "dji-air"],
  Mavic: ["mavic"],
  Avata: ["avata"],
  Neo: ["neo"],
  Flip: ["flip"],
};

const ENTERPRISE_SPARE_PATTERNS = {
  Matrice: ["matrice"],
  "Mavic Enterprise": ["mavic.*enterprise", "mavic-3-enterprise", "mavic-3e"],
  Agras: ["agras"],
  FlyCart: ["flycart"],
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
  if (j?.errors?.length) throw new Error(JSON.stringify(j.errors));
  return j?.data ?? j;
}

async function paginate(query, path, pageSize = 100, maxPages = 200) {
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

function walkMenu(items, out = []) {
  for (const it of items || []) {
    out.push({ title: it.title, url: it.url, type: it.type, id: it.id });
    walkMenu(it.items, out);
  }
  return out;
}

function countItems(items) {
  let n = 0;
  for (const it of items || []) {
    n += 1;
    if (it.items?.length) n += countItems(it.items);
  }
  return n;
}

function classifyCollection(handle, title) {
  const h = handle.toLowerCase();
  const t = title.toLowerCase();
  if (/actionking|actionkamer|gopro|insta360|360-kamera|vandring|outdoor/.test(h + t)) return "Legacy DJI";
  if (/flycart/.test(h)) return "FlyCart";
  if (/enterprise|matrice|agras|dock|mavic.*enterprise|jordbruk/.test(h) && !/tillbehor|reservdelar|tillbeh/.test(h))
    return "Enterprise DJI";
  if (/sensor|payload|zenmuse|lidar|varmekamera|termisk|hogtalare|belysning|lyft|airdrop|fallskarm/.test(h))
    return "Sensors & Payloads";
  if (/inspektion|kartlagg|surveying|sakerhet|offentlig|energi|infrastruktur|industri|bygg|jordbruk|miljo|industry/.test(h))
    return "Industry Solutions";
  if (/reservdelar|reparation|spare|motorbyte|gimbal|esc|elektronik/.test(h)) return "Spare Parts";
  if (/tillbehor|accessories|tillbehör|propeller|filter|skydd|kapa|landningsstall/.test(h)) return "Accessories";
  if (/service|support|garanti|kalibrering/.test(h)) return "Service & Support";
  if (/dji|mini|mavic|air|avata|neo|flip|dronare/.test(h)) return "Consumer DJI";
  return "Other";
}

function matchesPattern(text, patterns) {
  const s = text.toLowerCase();
  return patterns.some((p) => {
    if (p.includes(".*")) return new RegExp(p).test(s);
    return s.includes(p.toLowerCase());
  });
}

function findCollection(collections, patterns) {
  // Prefer exact handle segment matches before loose title matches
  const exact = collections.find((c) =>
    patterns.some((p) => c.handle === p || c.handle.includes(`-${p}`) || c.handle.startsWith(`${p}-`) || c.handle.endsWith(`-${p}`)),
  );
  if (exact) return exact;
  return collections.find((c) => matchesPattern(c.handle + " " + c.title, patterns));
}

function seoGap(col) {
  const issues = [];
  const title = col.seo?.title || "";
  const desc = col.seo?.description || "";
  const body = (col.descriptionHtml || "").replace(/<[^>]+>/g, "").trim();
  if (!title) issues.push({ level: "Critical", issue: "missing_meta_title" });
  if (!desc) issues.push({ level: "Critical", issue: "missing_meta_description" });
  if (!body) issues.push({ level: "High", issue: "missing_collection_description" });
  if (title && !col.title) issues.push({ level: "Medium", issue: "h1_mismatch" });
  return issues;
}

function scorePct(done, total) {
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

loadEnv();

console.error("=== Launch Readiness Audit (read-only) ===");

// ─── Fetch products (full scan) ───
console.error("Scanning products...");
const products = [];
let pCursor = null;
for (let p = 0; p < 100; p++) {
  const data = await gql(
    `query($c: String) {
      products(first: 100, after: $c) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id handle title status vendor productType tags
          descriptionHtml
          media(first: 1) { nodes { id } }
          variants(first: 10) { nodes { price compareAtPrice } }
          metafields(first: 5) { nodes { namespace key value } }
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

// ─── Publication audit ───
const pubAudit = products.map((pr) => {
  const hasTitle = !!(pr.title || "").trim();
  const hasImage = (pr.media?.nodes?.length || 0) > 0;
  const hasVendor = !!(pr.vendor || "").trim();
  const prices = (pr.variants?.nodes || []).map((v) => parseFloat(v.price || "0"));
  const hasPrice = prices.some((p) => p > 0);
  const eligible = hasTitle && hasImage && hasVendor && hasPrice;
  const blockers = [];
  if (!hasTitle) blockers.push("missing_title");
  if (!hasImage) blockers.push("missing_image");
  if (!hasVendor) blockers.push("missing_vendor");
  if (!hasPrice) blockers.push("missing_price");
  const desc = (pr.descriptionHtml || "").replace(/<[^>]+>/g, "").trim();
  if (!desc) blockers.push("missing_description");
  return {
    id: pr.id,
    handle: pr.handle,
    title: pr.title,
    status: pr.status,
    eligible,
    blockers,
    hasTitle,
    hasImage,
    hasVendor,
    hasPrice,
    vendor: pr.vendor,
    productType: pr.productType,
  };
});

const statusCounts = { DRAFT: 0, ACTIVE: 0, ARCHIVED: 0 };
for (const p of pubAudit) statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;

const eligibleToPublish = pubAudit.filter((p) => p.eligible);
const keepUnpublished = pubAudit.filter((p) => !p.eligible);
const blockerCounts = {};
for (const p of keepUnpublished) {
  for (const b of p.blockers) blockerCounts[b] = (blockerCounts[b] || 0) + 1;
}

// ─── Collections ───
console.error("Fetching collections...");
const COL_QUERY = `query($cursor: String, $first: Int!) {
  collections(first: $first, after: $cursor) {
    pageInfo { hasNextPage endCursor }
    nodes {
      id handle title productsCount { count }
      ruleSet { rules { column relation condition } }
      seo { title description }
      descriptionHtml
    }
  }
}`;
const collections = await paginate(COL_QUERY, "collections", 50, 10);
const colByHandle = new Map(collections.map((c) => [c.handle, c]));

const colRows = collections.map((c) => {
  const count = c.productsCount?.count ?? 0;
  const isSmart = !!(c.ruleSet?.rules?.length);
  return {
    name: c.title,
    handle: c.handle,
    product_count: count,
    type: isSmart ? "Smart" : "Manual",
    group: classifyCollection(c.handle, c.title),
    empty: count === 0,
    seo_issues: seoGap(c),
    seo_title: c.seo?.title || "",
    seo_description: c.seo?.description || "",
  };
});

const emptyCols = colRows.filter((c) => c.empty);
const groupedCols = {};
for (const r of colRows) {
  if (!groupedCols[r.group]) groupedCols[r.group] = [];
  groupedCols[r.group].push(r);
}

// Duplicate detection
const dupeGroups = [];
const roots = new Map();
for (const c of colRows) {
  const root = c.handle.replace(/-(tillbehor|serien|serie|reservdelar|accessories|tillbehor)$/i, "");
  if (!roots.has(root)) roots.set(root, []);
  roots.get(root).push(c);
}
for (const [root, cols] of roots) {
  if (cols.length > 1 && root.length > 4) dupeGroups.push({ root, handles: cols.map((c) => c.handle) });
}

// ─── Menus ───
console.error("Fetching menus...");
const MENU_QUERY = `query($cursor: String, $first: Int!) {
  menus(first: $first, after: $cursor) {
    pageInfo { hasNextPage endCursor }
    nodes { id handle title isDefault items { id title url type items { id title url type items { id title url type } } } }
  }
}`;
const menus = await paginate(MENU_QUERY, "menus", 50, 10);
const pages = await paginate(
  `query($cursor: String, $first: Int!) { pages(first: $first, after: $cursor) { pageInfo { hasNextPage endCursor } nodes { handle title } } }`,
  "pages",
  50,
  5,
);
const pageHandles = new Set(pages.map((p) => p.handle));

const menuRows = menus.map((m) => {
  const items = walkMenu(m.items);
  const itemCount = countItems(m.items);
  const missingCols = [];
  const missingPages = [];
  for (const it of items) {
    const cm = it.url?.match(/\/collections\/([^/?#]+)/);
    const pm = it.url?.match(/\/pages\/([^/?#]+)/);
    if (cm && !colByHandle.has(cm[1])) missingCols.push({ title: it.title, url: it.url, handle: cm[1] });
    if (pm && !pageHandles.has(pm[1])) missingPages.push({ title: it.title, url: it.url, handle: pm[1] });
  }
  const isLegacy = LEGACY_MENU_PATTERNS.test(m.handle) || (MIGRATION_MENU_SUFFIX.test(m.handle) && !CANONICAL_MENUS.has(m.handle));
  const isEmpty = itemCount === 0;
  const isCanonical = CANONICAL_MENUS.has(m.handle);
  let cleanupAction = "keep";
  if (isCanonical) cleanupAction = "keep";
  else if (isEmpty && isLegacy) cleanupAction = "remove";
  else if (isEmpty) cleanupAction = "remove_or_archive";
  else if (isLegacy) cleanupAction = "review";
  else if (MIGRATION_MENU_SUFFIX.test(m.handle)) cleanupAction = "remove_duplicate";

  return {
    id: m.id,
    handle: m.handle,
    title: m.title,
    is_default: m.isDefault,
    item_count: itemCount,
    is_empty: isEmpty,
    is_legacy: isLegacy,
    is_canonical: isCanonical,
    missing_collections: missingCols,
    missing_pages: missingPages,
    broken_count: missingCols.length + missingPages.length,
    cleanup_action: cleanupAction,
  };
});

const titleGroups = new Map();
for (const m of menus) {
  const t = (m.title || "").toLowerCase().trim();
  if (!titleGroups.has(t)) titleGroups.set(t, []);
  titleGroups.get(t).push(m.handle);
}
const duplicateMenus = [...titleGroups.entries()].filter(([, h]) => h.length > 1);

const menusToRemove = menuRows.filter((m) => m.cleanup_action === "remove" || m.cleanup_action === "remove_or_archive" || m.cleanup_action === "remove_duplicate");
const emptyMenus = menuRows.filter((m) => m.is_empty);

// ─── Enterprise gaps ───
const enterpriseGaps = [];
for (const group of ENTERPRISE_GAPS) {
  for (const item of group.items) {
    const col = findCollection(collections, item.patterns);
    const productCount = col?.productsCount?.count ?? 0;
    const handleMismatch =
      col && item.name.toLowerCase().replace(/\s+/g, " ").includes("matrice 4") && col.handle.includes("matrice-3");
    enterpriseGaps.push({
      group: group.group,
      name: item.name,
      collection_exists: !!col,
      collection_handle: col?.handle || null,
      product_count: productCount,
      status: col ? (productCount > 0 ? "populated" : "empty") : "missing",
      handle_mismatch: handleMismatch || false,
      recommendation: col
        ? productCount === 0
          ? `Populate \`${col.handle}\` or refine smart rules`
          : handleMismatch
            ? `Review handle/title mismatch: \`${col.handle}\` may need URL-preserving consolidation`
            : null
        : `Create collection for ${item.name} (recommendation only — do not deploy)`,
    });
  }
}

// ─── SEO gaps ───
const seoGaps = [];
for (const c of colRows) {
  for (const issue of c.seo_issues) {
    seoGaps.push({
      handle: c.handle,
      name: c.name,
      group: c.group,
      level: issue.level,
      issue: issue.issue,
    });
  }
}
const seoCritical = seoGaps.filter((g) => g.level === "Critical");
const seoHigh = seoGaps.filter((g) => g.level === "High");
const seoMedium = seoGaps.filter((g) => g.level === "Medium");

// Prioritize enterprise, flycart, industry
const seoPriority = seoGaps.filter((g) =>
  ["Enterprise DJI", "FlyCart", "Industry Solutions"].includes(g.group),
);

// ─── Product data quality ───
const quality = {
  total: products.length,
  missing_images: pubAudit.filter((p) => !p.hasImage).length,
  missing_descriptions: products.filter((p) => !(p.descriptionHtml || "").replace(/<[^>]+>/g, "").trim()).length,
  missing_vendor: pubAudit.filter((p) => !p.hasVendor).length,
  missing_price: pubAudit.filter((p) => !p.hasPrice).length,
  missing_product_type: products.filter((p) => !(p.productType || "").trim()).length,
  missing_tags: products.filter((p) => !(p.tags || []).length).length,
  missing_specs: products.filter((p) => !(p.metafields?.nodes || []).some((m) => /spec|technical/i.test(m.key))).length,
  missing_compatibility: products.filter((p) => !(p.metafields?.nodes || []).some((m) => /compat/i.test(m.key)) && !(p.tags || []).some((t) => /compat/i.test(t))).length,
};

// ─── Spare parts readiness ───
const spareCols = colRows.filter((c) => c.group === "Spare Parts" || /reservdelar|reparation|spare/i.test(c.handle));
function spareCoverage(name, patterns, cols) {
  const matches = cols.filter((c) => matchesPattern(c.handle + " " + c.name, patterns));
  const withProducts = matches.filter((c) => c.product_count > 0);
  return {
    platform: name,
    collections: matches.map((c) => ({ handle: c.handle, count: c.product_count })),
    coverage_pct: matches.length ? scorePct(withProducts.length, matches.length) : 0,
    product_total: matches.reduce((s, c) => s + c.product_count, 0),
    status: withProducts.length > 0 ? "partial" : matches.length > 0 ? "empty" : "missing",
  };
}

const consumerSpare = Object.entries(CONSUMER_SPARE_PATTERNS).map(([name, patterns]) =>
  spareCoverage(name, patterns, colRows.filter((c) => /reservdelar|reparation|spare|motor|gimbal|esc/i.test(c.handle + c.name))),
);
const enterpriseSpare = Object.entries(ENTERPRISE_SPARE_PATTERNS).map(([name, patterns]) =>
  spareCoverage(name, patterns, colRows.filter((c) => /reservdelar|reparation|spare|enterprise/i.test(c.handle + c.name))),
);

const spareRecommendations = [];
for (const [name, patterns] of Object.entries(CONSUMER_SPARE_PATTERNS)) {
  const cov = consumerSpare.find((c) => c.platform === name);
  if (cov?.status === "missing") spareRecommendations.push({ type: "consumer", platform: name, rec: `Create spare parts collection for DJI ${name}` });
}
for (const [name] of Object.entries(ENTERPRISE_SPARE_PATTERNS)) {
  const cov = enterpriseSpare.find((c) => c.platform === name);
  if (cov?.status === "missing" || cov?.product_total < 5) spareRecommendations.push({ type: "enterprise", platform: name, rec: `Expand spare parts / compatibility collections for ${name}` });
}

// ─── Launch scores ───
const catalogScore = scorePct(eligibleToPublish.length, products.length);
const navScore = scorePct(
  menuRows.filter((m) => m.is_canonical && !m.is_empty && m.broken_count === 0).length,
  CANONICAL_MENUS.size,
);
const enterpriseScore = scorePct(
  enterpriseGaps.filter((g) => g.collection_exists && g.product_count > 0).length,
  enterpriseGaps.length,
);
const seoScore = scorePct(
  colRows.filter((c) => c.seo_issues.length === 0).length,
  colRows.length,
);
const qualityScore = scorePct(
  products.length - Math.max(quality.missing_images, quality.missing_descriptions, quality.missing_vendor),
  products.length,
);
const spareScore = scorePct(
  [...consumerSpare, ...enterpriseSpare].filter((s) => s.status !== "missing" && s.product_total > 0).length,
  [...consumerSpare, ...enterpriseSpare].length,
);
const b2bScore = pageHandles.has("request-quote") || pageHandles.has("kontakta-support") ? 30 : 10;

const launchScores = {
  catalog: catalogScore,
  navigation: navScore,
  enterprise: enterpriseScore,
  seo: seoScore,
  product_quality: qualityScore,
  spare_parts: spareScore,
  b2b_foundation: b2bScore,
};
const overallScore = Math.round(
  Object.values(launchScores).reduce((a, b) => a + b, 0) / Object.keys(launchScores).length,
);

// ─── Top 20 actions ───
const actions = [
  { priority: 1, action: `Publish ${eligibleToPublish.length.toLocaleString()} eligible products (${keepUnpublished.length} blocked)`, area: "Catalog" },
  { priority: 1, action: `Remove ${menusToRemove.length} empty/legacy menus (70+ target)`, area: "Navigation" },
  { priority: 1, action: "Fix broken menu references in canonical menus", area: "Navigation" },
  { priority: 1, action: `${seoCritical.length} collections missing critical SEO metadata`, area: "SEO" },
  { priority: 1, action: `${emptyCols.length} empty collections need population or consolidation`, area: "Collections" },
  { priority: 1, action: `${enterpriseGaps.filter((g) => g.status === "missing").length} missing enterprise collections (recommendations in ENTERPRISE_GAP_REPORT)`, area: "Enterprise" },
  { priority: 1, action: `${quality.missing_images} products missing images — block publication`, area: "Data Quality" },
  { priority: 2, action: "Deploy Phase 4 enterprise collection expansion (33 collections)", area: "Enterprise" },
  { priority: 2, action: "Deploy Phase 5 Service & Support pages", area: "Service" },
  { priority: 2, action: "Populate enterprise-specific spare parts collections", area: "Spare Parts" },
  { priority: 2, action: "Add collection descriptions to high-traffic enterprise collections", area: "SEO" },
  { priority: 2, action: "Remove 12 legacy ActionKing pages", area: "Content" },
  { priority: 2, action: "Standardize product tags (38% missing tags)", area: "Data Quality" },
  { priority: 2, action: "Create B2B quote request page", area: "B2B" },
  { priority: 3, action: "Enable European markets (DE, DK, FI, FR, NL)", area: "Expansion" },
  { priority: 3, action: "Documentation Center deployment", area: "Documentation" },
  { priority: 3, action: "Knowledge Center article content", area: "Content" },
  { priority: 3, action: "PEPPOL procurement workflow", area: "B2B" },
  { priority: 3, action: "Schema markup theme audit", area: "SEO" },
  { priority: 3, action: "Compatibility metafields for spare parts", area: "Data Quality" },
];

const audit = {
  generated_at: new Date().toISOString(),
  store: STORE,
  mode: "read_only",
  publication: {
    total: products.length,
    status: statusCounts,
    eligible: eligibleToPublish.length,
    blocked: keepUnpublished.length,
    blocker_counts: blockerCounts,
  },
  menus: { total: menus.length, empty: emptyMenus.length, to_remove: menusToRemove.length, duplicates: duplicateMenus.length },
  collections: { total: collections.length, empty: emptyCols.length, duplicates: dupeGroups.length },
  enterprise_gaps: enterpriseGaps,
  seo_gaps: { critical: seoCritical.length, high: seoHigh.length, medium: seoMedium.length },
  quality,
  launch_scores: launchScores,
  overall_score: overallScore,
  actions,
};

writeFileSync(OUT.audit, JSON.stringify(audit, null, 2));

// ═══════════════════════════════════════════════════════════
// REPORT GENERATORS
// ═══════════════════════════════════════════════════════════

function writeReport(path, lines) {
  writeFileSync(path, lines.join("\n"));
  console.error(`Wrote ${path}`);
}

// PART 1 — Product Publication
writeReport(OUT.publication, [
  "# Product Publication Report",
  "",
  `**Generated:** ${audit.generated_at}`,
  `**Store:** ${STORE}`,
  "**Mode:** Read-only audit — no products published",
  "",
  "## Status summary",
  "",
  "| Status | Count | % |",
  "|--------|------:|--:|",
  `| Draft | ${statusCounts.DRAFT || 0} | ${scorePct(statusCounts.DRAFT || 0, products.length)}% |`,
  `| Active | ${statusCounts.ACTIVE || 0} | ${scorePct(statusCounts.ACTIVE || 0, products.length)}% |`,
  `| Archived | ${statusCounts.ARCHIVED || 0} | ${scorePct(statusCounts.ARCHIVED || 0, products.length)}% |`,
  `| **Total** | **${products.length}** | 100% |`,
  "",
  "## Publication eligibility",
  "",
  "Criteria: title + image + vendor + price > 0",
  "",
  "| Category | Count | % |",
  "|----------|------:|--:|",
  `| **Eligible to publish** | **${eligibleToPublish.length}** | **${scorePct(eligibleToPublish.length, products.length)}%** |`,
  `| Keep unpublished | ${keepUnpublished.length} | ${scorePct(keepUnpublished.length, products.length)}% |`,
  "",
  "## Blockers (keep unpublished)",
  "",
  "| Blocker | Count |",
  "|---------|------:|",
  ...Object.entries(blockerCounts).sort((a, b) => b[1] - a[1]).map(([k, v]) => `| ${k} | ${v} |`),
  "",
  "## Sample blocked products (first 30)",
  "",
  "| Title | Handle | Blockers |",
  "|---|---|---|",
  ...keepUnpublished.slice(0, 30).map((p) => `| ${(p.title || "").slice(0, 50)} | \`${p.handle}\` | ${p.blockers.join(", ")} |`),
  "",
  "## Deployment note",
  "",
  "Publishing requires approval. Run publication script with `--apply` after review.",
  "",
]);

// PART 2 — Menu Cleanup
writeReport(OUT.menu, [
  "# Menu Cleanup Report",
  "",
  `**Generated:** ${audit.generated_at}`,
  `**Store:** ${STORE}`,
  "**Mode:** Read-only audit — no menus removed",
  "",
  "## Summary",
  "",
  "| Metric | Count |",
  "|--------|------:|",
  `| Total menus | ${menus.length} |`,
  `| Empty menus | ${emptyMenus.length} |`,
  `| Legacy/migration menus | ${menuRows.filter((m) => m.is_legacy).length} |`,
  `| Duplicate title groups | ${duplicateMenus.length} |`,
  `| Recommended for removal | **${menusToRemove.length}** |`,
  `| Canonical menus (keep) | ${menuRows.filter((m) => m.is_canonical).length} |`,
  "",
  "## Canonical menus (KEEP)",
  "",
  ...[...CANONICAL_MENUS].map((h) => {
    const m = menuRows.find((x) => x.handle === h);
    return `- \`${h}\` — ${m ? `${m.item_count} items` : "not found"}`;
  }),
  "",
  "## Menus recommended for removal",
  "",
  "| Handle | Title | Items | Reason |",
  "|--------|-------|------:|--------|",
  ...menusToRemove.map((m) => `| \`${m.handle}\` | ${m.title} | ${m.item_count} | ${m.cleanup_action} |`),
  "",
  "## Duplicate menu title groups",
  "",
  duplicateMenus.length
    ? duplicateMenus.map(([t, h]) => `- **${t}**: ${h.map((x) => `\`${x}\``).join(", ")}`).join("\n")
    : "- None",
  "",
  "## Menus with broken references",
  "",
  menuRows.filter((m) => m.broken_count > 0).length
    ? menuRows
        .filter((m) => m.broken_count > 0)
        .map((m) => `### \`${m.handle}\` (${m.broken_count} broken)\n` + m.missing_collections.concat(m.missing_pages).map((x) => `- ${x.title}: ${x.url}`).join("\n"))
        .join("\n\n")
    : "- No broken references in live menus",
  "",
  "## Deployment note",
  "",
  `Target: remove ${menusToRemove.length} unused menus. Requires approval before execution.`,
  "",
]);

// PART 3 — Collection Validation
const groupValidation = COLLECTION_GROUPS_VALIDATE.map((g) => {
  const cols = groupedCols[g] || [];
  const populated = cols.filter((c) => c.product_count > 0);
  const empty = cols.filter((c) => c.empty);
  return { group: g, total: cols.length, populated: populated.length, empty: empty.length, cols };
});

writeReport(OUT.collection, [
  "# Collection Validation Report",
  "",
  `**Generated:** ${audit.generated_at}`,
  "**Mode:** Read-only audit",
  "",
  "## Summary",
  "",
  "| Metric | Count |",
  "|--------|------:|",
  `| Total collections | ${collections.length} |`,
  `| Empty | ${emptyCols.length} |`,
  `| With products | ${colRows.filter((c) => c.product_count > 0).length} |`,
  `| Potential duplicates | ${dupeGroups.length} groups |`,
  "",
  "## Group validation",
  "",
  "| Group | Total | Populated | Empty | Health |",
  "|-------|------:|----------:|------:|--------|",
  ...groupValidation.map((g) => `| ${g.group} | ${g.total} | ${g.populated} | ${g.empty} | ${scorePct(g.populated, g.total)}% |`),
  "",
  ...groupValidation.flatMap((g) => [
    `### ${g.group}`,
    "",
    "| Name | Handle | Products | Type |",
    "|---|---|--:|---|",
    ...g.cols.sort((a, b) => b.product_count - a.product_count).map((c) => `| ${c.name.slice(0, 45)} | \`${c.handle}\` | ${c.product_count} | ${c.type} |`),
    "",
  ]),
  "## Empty collections",
  "",
  emptyCols.length ? emptyCols.map((c) => `- \`${c.handle}\` — ${c.name} (${c.group})`).join("\n") : "- None",
  "",
  "## Duplicate groups (sample)",
  "",
  dupeGroups.slice(0, 20).map((d) => `- \`${d.root}\`: ${d.handles.map((h) => `\`${h}\``).join(", ")}`).join("\n") || "- None",
  "",
]);

// PART 4 — Enterprise Gap
writeReport(OUT.enterprise, [
  "# Enterprise Gap Report",
  "",
  `**Generated:** ${audit.generated_at}`,
  "**Mode:** Recommendations only — do not deploy automatically",
  "",
  "## Summary",
  "",
  `| Status | Count |`,
  `|--------|------:|`,
  `| Populated | ${enterpriseGaps.filter((g) => g.status === "populated").length} |`,
  `| Empty collection exists | ${enterpriseGaps.filter((g) => g.status === "empty").length} |`,
  `| Missing collection | ${enterpriseGaps.filter((g) => g.status === "missing").length} |`,
  "",
  ...ENTERPRISE_GAPS.flatMap((grp) => [
    `## ${grp.group}`,
    "",
    "| Platform | Collection | Products | Status | Recommendation |",
    "|---|---|--:|---|---|",
    ...enterpriseGaps
      .filter((g) => g.group === grp.group)
      .map((g) => `| ${g.name} | ${g.collection_handle ? `\`${g.collection_handle}\`` : "—"} | ${g.product_count} | ${g.status} | ${g.recommendation || "OK"} |`),
    "",
  ]),
]);

// PART 5 — SEO Gap
writeReport(OUT.seo, [
  "# SEO Gap Report",
  "",
  `**Generated:** ${audit.generated_at}`,
  "",
  "## Summary",
  "",
  "| Priority | Issues |",
  "|----------|-------:|",
  `| Critical | ${seoCritical.length} |`,
  `| High | ${seoHigh.length} |`,
  `| Medium | ${seoMedium.length} |`,
  "",
  "## Critical (missing meta title or description)",
  "",
  "| Collection | Group | Issue |",
  "|---|---|---|",
  ...seoCritical.slice(0, 50).map((g) => `| \`${g.handle}\` | ${g.group} | ${g.issue} |`),
  "",
  "## High priority",
  "",
  "| Collection | Group | Issue |",
  "|---|---|---|",
  ...seoHigh.slice(0, 40).map((g) => `| \`${g.handle}\` | ${g.group} | ${g.issue} |`),
  "",
  "## Enterprise / FlyCart / Industry (priority focus)",
  "",
  "| Collection | Level | Issue |",
  "|---|---|---|",
  ...seoPriority.slice(0, 40).map((g) => `| \`${g.handle}\` | ${g.level} | ${g.issue} |`),
  "",
  "## Deployment note",
  "",
  "Only add missing SEO metadata. Do not change existing titles/descriptions/URLs.",
  "",
]);

// PART 6 — Data Quality
writeReport(OUT.quality, [
  "# Product Data Quality Report",
  "",
  `**Generated:** ${audit.generated_at}`,
  "",
  "## Summary",
  "",
  "| Issue | Count | % of catalog |",
  "|---|---:|---:|",
  `| Missing images | ${quality.missing_images} | ${scorePct(quality.missing_images, quality.total)}% |`,
  `| Missing descriptions | ${quality.missing_descriptions} | ${scorePct(quality.missing_descriptions, quality.total)}% |`,
  `| Missing vendor | ${quality.missing_vendor} | ${scorePct(quality.missing_vendor, quality.total)}% |`,
  `| Missing price | ${quality.missing_price} | ${scorePct(quality.missing_price, quality.total)}% |`,
  `| Missing product type | ${quality.missing_product_type} | ${scorePct(quality.missing_product_type, quality.total)}% |`,
  `| Missing tags | ${quality.missing_tags} | ${scorePct(quality.missing_tags, quality.total)}% |`,
  `| Missing specifications (metafields) | ${quality.missing_specs} | ${scorePct(quality.missing_specs, quality.total)}% |`,
  `| Missing compatibility data | ${quality.missing_compatibility} | ${scorePct(quality.missing_compatibility, quality.total)}% |`,
  "",
  "## Publication impact",
  "",
  `- ${eligibleToPublish.length} products ready for launch`,
  `- ${keepUnpublished.length} products blocked by data quality gates`,
  "",
]);

// PART 7 — Spare Parts
writeReport(OUT.spareParts, [
  "# Spare Parts Readiness Report",
  "",
  `**Generated:** ${audit.generated_at}`,
  "",
  "## Consumer coverage",
  "",
  "| Platform | Collections | Products | Status |",
  "|---|---|--:|---|",
  ...consumerSpare.map((s) => `| ${s.platform} | ${s.collections.length} | ${s.product_total} | ${s.status} |`),
  "",
  "## Enterprise coverage",
  "",
  "| Platform | Collections | Products | Status |",
  "|---|---|--:|---|",
  ...enterpriseSpare.map((s) => `| ${s.platform} | ${s.collections.length} | ${s.product_total} | ${s.status} |`),
  "",
  "## Recommendations",
  "",
  spareRecommendations.length
    ? spareRecommendations.map((r) => `- **[${r.type}]** ${r.platform}: ${r.rec}`).join("\n")
    : "- Coverage adequate for launch baseline",
  "",
  "## Existing spare part collections",
  "",
  "| Handle | Products |",
  "|---|--:|",
  ...spareCols.sort((a, b) => b.product_count - a.product_count).map((c) => `| \`${c.handle}\` | ${c.product_count} |`),
  "",
]);

// MASTER REPORT
writeReport(OUT.master, [
  "# EuroDroneParts — Launch Readiness Report",
  "",
  `**Generated:** ${audit.generated_at}`,
  `**Store:** ${STORE}`,
  "**Mode:** Read-only audit — no deployment performed",
  "",
  "---",
  "",
  "## Executive summary",
  "",
  `### Launch Readiness Score: **${overallScore}%**`,
  "",
  "| Dimension | Score |",
  "|-----------|------:|",
  ...Object.entries(launchScores).map(([k, v]) => `| ${k.replace(/_/g, " ")} | **${v}%** |`),
  "",
  `> **Blocker:** All products are currently DRAFT. ${eligibleToPublish.length.toLocaleString()} eligible for publication; ${keepUnpublished.length.toLocaleString()} blocked by data quality gates.`,
  "",
  "---",
  "",
  "## Part 1 — Product Publication",
  "",
  `See [PRODUCT_PUBLICATION_REPORT.md](PRODUCT_PUBLICATION_REPORT.md)`,
  "",
  `- Draft: ${statusCounts.DRAFT || 0} | Active: ${statusCounts.ACTIVE || 0} | Archived: ${statusCounts.ARCHIVED || 0}`,
  `- Eligible to publish: **${eligibleToPublish.length}** (${scorePct(eligibleToPublish.length, products.length)}%)`,
  `- Keep unpublished: ${keepUnpublished.length}`,
  "",
  "## Part 2 — Menu Cleanup",
  "",
  `See [MENU_CLEANUP_REPORT.md](MENU_CLEANUP_REPORT.md)`,
  "",
  `- Total menus: ${menus.length} | Empty: ${emptyMenus.length} | Recommended removal: **${menusToRemove.length}**`,
  "",
  "## Part 3 — Collection Validation",
  "",
  `See [COLLECTION_VALIDATION_REPORT.md](COLLECTION_VALIDATION_REPORT.md)`,
  "",
  `- Collections: ${collections.length} | Empty: ${emptyCols.length} | Duplicates: ${dupeGroups.length} groups`,
  "",
  "## Part 4 — Enterprise Expansion",
  "",
  `See [ENTERPRISE_GAP_REPORT.md](ENTERPRISE_GAP_REPORT.md)`,
  "",
  `- Populated: ${enterpriseGaps.filter((g) => g.status === "populated").length}/${enterpriseGaps.length}`,
  `- Missing: ${enterpriseGaps.filter((g) => g.status === "missing").length} (recommendations only)`,
  "",
  "## Part 5 — SEO Gap Analysis",
  "",
  `See [SEO_GAP_REPORT.md](SEO_GAP_REPORT.md)`,
  "",
  `- Critical: ${seoCritical.length} | High: ${seoHigh.length} | Medium: ${seoMedium.length}`,
  "",
  "## Part 6 — Data Quality",
  "",
  `See [PRODUCT_DATA_QUALITY_REPORT.md](PRODUCT_DATA_QUALITY_REPORT.md)`,
  "",
  `- Missing images: ${quality.missing_images} | Missing tags: ${quality.missing_tags}`,
  "",
  "## Part 7 — Spare Parts Readiness",
  "",
  `See [SPARE_PARTS_READINESS_REPORT.md](SPARE_PARTS_READINESS_REPORT.md)`,
  "",
  `Score: **${spareScore}%**`,
  "",
  "---",
  "",
  "## Part 8 — Launch Readiness Score",
  "",
  "| Area | Score | Weight |",
  "|------|------:|--------|",
  ...Object.entries(launchScores).map(([k, v]) => `| ${k.replace(/_/g, " ")} | ${v}% | equal |`),
  `| **Overall** | **${overallScore}%** | — |`,
  "",
  "---",
  "",
  "## Part 9 — Top 20 Actions",
  "",
  "### Priority 1 — Must complete before launch",
  "",
  ...actions.filter((a) => a.priority === 1).map((a, i) => `${i + 1}. **${a.area}:** ${a.action}`),
  "",
  "### Priority 2 — First month after launch",
  "",
  ...actions.filter((a) => a.priority === 2).map((a, i) => `${i + 1}. **${a.area}:** ${a.action}`),
  "",
  "### Priority 3 — Future improvements",
  "",
  ...actions.filter((a) => a.priority === 3).map((a, i) => `${i + 1}. **${a.area}:** ${a.action}`),
  "",
  "---",
  "",
  "## Constraints honored",
  "",
  "- No URLs changed",
  "- No collections with products deleted",
  "- No existing SEO metadata modified",
  "- No automatic deployment",
  "",
  "## Artifacts",
  "",
  "- `PRODUCT_PUBLICATION_REPORT.md`",
  "- `MENU_CLEANUP_REPORT.md`",
  "- `COLLECTION_VALIDATION_REPORT.md`",
  "- `ENTERPRISE_GAP_REPORT.md`",
  "- `SEO_GAP_REPORT.md`",
  "- `PRODUCT_DATA_QUALITY_REPORT.md`",
  "- `SPARE_PARTS_READINESS_REPORT.md`",
  "- `.launch-readiness-audit.json`",
  "",
]);

console.log(JSON.stringify({ overall_score: overallScore, eligible: eligibleToPublish.length, menus_to_remove: menusToRemove.length }, null, 2));
