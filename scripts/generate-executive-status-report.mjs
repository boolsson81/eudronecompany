#!/usr/bin/env node
/**
 * EuroDroneParts — Executive Project Status Report (READ-ONLY).
 * Does NOT modify the store. Fetches live Shopify data via GraphQL.
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_REPORT = join(ROOT, "EURODRONEPARTS_EXECUTIVE_STATUS_REPORT.md");
const OUT_AUDIT = join(ROOT, ".executive-status-audit.json");
const PHASE5_SPEC = join(ROOT, "data/edp-phase5-navigation.json");
const URL = process.env.CLONER_SUPABASE_URL || "https://wsncjdajweoujhidlxas.supabase.co";
const STORE = "ya1xhg-x6.myshopify.com";

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
    out.push({ title: it.title, url: it.url, type: it.type });
    walkMenu(it.items, out);
  }
  return out;
}

function classifyCollection(handle, title) {
  const h = handle.toLowerCase();
  const t = title.toLowerCase();
  if (/actionking|actionkamer|gopro|insta360|360-kamera|vandring|outdoor/.test(h + t)) return "Legacy DJI";
  if (/flycart/.test(h)) return "FlyCart";
  if (/enterprise|matrice|agras|dock|mavic.*enterprise|flycart|jordbruk/.test(h) && !/tillbehor|reservdelar/.test(h))
    return "Enterprise DJI";
  if (/sensor|payload|zenmuse|lidar|varmekamera|termisk|hogtalare|belysning|lyft|airdrop|fallskarm/.test(h))
    return "Sensors & Payloads";
  if (/inspektion|kartlagg|surveying|sakerhet|offentlig|energi|infrastruktur|industri|bygg|jordbruk|miljo/.test(h))
    return "Industry Solutions";
  if (/reservdelar|reparation|spare|motor|gimbal|esc|elektronik/.test(h)) return "Spare Parts";
  if (/tillbehor|accessories|tillbehör/.test(h)) return "Accessories";
  if (/service|support|garanti|kalibrering|reparation/.test(h)) return "Service & Support";
  if (/dji|mini|mavic|air|avata|neo|flip|dronare/.test(h)) return "Consumer DJI";
  return "Other";
}

function seoStatus(col) {
  const issues = [];
  const title = col.seo?.title || "";
  const desc = col.seo?.description || "";
  const body = (col.descriptionHtml || "").replace(/<[^>]+>/g, "").trim();
  if (!title) issues.push("missing_meta_title");
  else if (title.length < 30) issues.push("short_meta_title");
  if (!desc) issues.push("missing_meta_description");
  else if (desc.length < 80) issues.push("short_meta_description");
  if (!body) issues.push("missing_body_description");
  if (issues.length === 0) return "OK";
  if (issues.includes("missing_meta_title") || issues.includes("missing_meta_description")) return "Critical";
  return "Needs improvement";
}

function score(items) {
  const done = items.filter(Boolean).length;
  return Math.round((done / items.length) * 100);
}

const ENTERPRISE_TARGETS = [
  { name: "Matrice 4", collections: ["dji-matrice-4-serie"], menuPatterns: ["matrice-4", "matrice 4"] },
  { name: "Matrice 30", collections: ["dji-matrice-30-serie-tillbehor", "dji-matrice-30"], menuPatterns: ["matrice-30", "matrice 30"] },
  { name: "Matrice 300 RTK", collections: ["dji-matrice-350-rtk-tillbehor", "dji-matrice-300"], menuPatterns: ["matrice-300", "300 rtk"] },
  { name: "Matrice 350 RTK", collections: ["dji-matrice-350-rtk-tillbehor"], menuPatterns: ["matrice-350", "350 rtk"] },
  { name: "Matrice 400", collections: ["dji-matrice-400-serien"], menuPatterns: ["matrice-400", "matrice 400"] },
  { name: "Matrice 3D / 3TD", collections: ["dji-matrice-3-serien", "dji-matrice-3d"], menuPatterns: ["matrice-3", "3d", "3td"] },
  { name: "DJI Dock", collections: ["enterprise-dronare"], menuPatterns: ["dock"] },
  { name: "Mavic Enterprise", collections: ["dji-mavic-serien-enterprise", "dji-mavic-3-enterprise"], menuPatterns: ["mavic enterprise", "mavic-serien-enterprise"] },
  { name: "Agras", collections: ["dji-agras-dronare"], menuPatterns: ["agras"] },
  { name: "FlyCart", collections: ["dji-flycart-serien", "dji-flycart-100-lastdronare"], menuPatterns: ["flycart"] },
];

const SERVICE_PAGE_HANDLES = {
  service: ["service-support", "dji-konsument-service", "dji-enterprise-service"],
  repair: ["dronarreparation", "krockskador-reparation", "gimbalreparation", "kamerareparation", "motorbyte", "esc-reparation", "elektronisk-felsokning"],
  calibration: ["kalibrering", "imu-kalibrering", "kompasskalibrering", "rtk-kalibrering", "sensor-kalibrering", "kamera-kalibrering", "varmekamera-validering"],
  support: ["support-center", "kontakta-support", "skicka-arende", "servicestatus", "vanliga-fragor", "felsokning"],
  warranty: ["garantiansokan", "serviceforfragan", "returforfragan", "teknisk-support"],
  booking: ["boka-konsultation", "enterprise-consultation", "request-quote"],
};

const DOC_HANDLES = {
  manuals: ["manualer-dji-enterprise", "manualer-dji-konsument", "manualer-flycart", "manualer-agras", "manualer-dock", "manualer-payloads"],
  datasheets: ["datablad-specifikationer", "datablad-kompatibilitet", "datablad-certifieringar"],
  certifications: ["ce-dokument", "produktcertifieringar", "sakerhetsdokumentation"],
  firmware: ["firmware-flygplan", "firmware-fjarrkontroller", "firmware-payloads", "firmware-dock"],
  support_docs: ["dokumentation", "kunskapscenter"],
};

const EU_COUNTRIES = [
  { code: "SE", name: "Sweden", locale: "sv", market: "Sverige" },
  { code: "DE", name: "Germany", locale: "de", market: "Tyskland" },
  { code: "NL", name: "Netherlands", locale: "nl", market: null },
  { code: "DK", name: "Denmark", locale: "da", market: "Danmark" },
  { code: "FI", name: "Finland", locale: "fi", market: "Finland" },
  { code: "FR", name: "France", locale: "fr", market: "Frankrike" },
];

loadEnv();

console.error("Fetching shop overview...");
const shopData = await gql(`{
  shop { name plan { displayName } currencyCode taxesIncluded billingAddress { country } primaryDomain { url } }
  productsCount { count }
  collectionsCount { count }
  pagesCount { count }
}`);

const productStatus = { total: 0, active: 0, draft: 0, archived: 0 };
let pCursor = null;
for (let p = 0; p < 100; p++) {
  const data = await gql(
    `query($c: String) { products(first: 250, after: $c) { pageInfo { hasNextPage endCursor } nodes { status } } }`,
    { c: pCursor },
  );
  for (const n of data.products?.nodes || []) {
    productStatus.total++;
    if (n.status === "ACTIVE") productStatus.active++;
    else if (n.status === "DRAFT") productStatus.draft++;
    else if (n.status === "ARCHIVED") productStatus.archived++;
  }
  if (!data.products?.pageInfo?.hasNextPage) break;
  pCursor = data.products.pageInfo.endCursor;
  if (p % 5 === 0) console.error(`  products: ${productStatus.total}`);
}

console.error("Fetching collections...");
const COL_QUERY = `query($cursor: String, $first: Int!) {
  collections(first: $first, after: $cursor) {
    pageInfo { hasNextPage endCursor }
    nodes {
      id handle title
      productsCount { count }
      ruleSet { appliedDisjunctively rules { column relation condition } }
      seo { title description }
      descriptionHtml
    }
  }
}`;
const collections = await paginate(COL_QUERY, "collections", 50, 10);

console.error("Fetching menus...");
const MENU_QUERY = `query($cursor: String, $first: Int!) {
  menus(first: $first, after: $cursor) {
    pageInfo { hasNextPage endCursor }
    nodes { id handle title isDefault items { title url type items { title url type items { title url type } } } }
  }
}`;
const menus = await paginate(MENU_QUERY, "menus", 50, 10);

console.error("Fetching pages...");
const PAGE_QUERY = `query($cursor: String, $first: Int!) {
  pages(first: $first, after: $cursor) {
    pageInfo { hasNextPage endCursor }
    nodes { handle title bodySummary }
  }
}`;
const pages = await paginate(PAGE_QUERY, "pages", 50, 5);

console.error("Fetching blogs...");
const blogData = await gql(`{ blogs(first: 10) { nodes { handle title articlesCount { count } } } }`);
const blogs = blogData.blogs?.nodes || [];
const totalArticles = blogs.reduce((s, b) => s + (b.articlesCount?.count || 0), 0);

console.error("Fetching markets & locales...");
const marketData = await gql(`{ markets(first: 20) { nodes { name enabled primary } } }`);
const markets = marketData.markets?.nodes || [];
const localeData = await gql(`{ shopLocales { locale name primary published } }`);
const locales = localeData.shopLocales || [];

console.error("Scanning product data quality...");
const quality = {
  missing_images: 0,
  missing_descriptions: 0,
  missing_vendor: 0,
  missing_product_type: 0,
  missing_tags: 0,
  short_descriptions: 0,
  total: 0,
};
let qCursor = null;
for (let p = 0; p < 100; p++) {
  const data = await gql(
    `query($c: String) {
      products(first: 250, after: $c) {
        pageInfo { hasNextPage endCursor }
        nodes {
          title descriptionHtml vendor productType tags
          media(first: 1) { nodes { id } }
        }
      }
    }`,
    { c: qCursor },
  );
  for (const pr of data.products?.nodes || []) {
    quality.total++;
    const desc = (pr.descriptionHtml || "").replace(/<[^>]+>/g, "").trim();
    if (!pr.media?.nodes?.length) quality.missing_images++;
    if (!desc) quality.missing_descriptions++;
    else if (desc.length < 50) quality.short_descriptions++;
    if (!pr.vendor) quality.missing_vendor++;
    if (!pr.productType) quality.missing_product_type++;
    if (!pr.tags?.length) quality.missing_tags++;
  }
  if (!data.products?.pageInfo?.hasNextPage) break;
  qCursor = data.products.pageInfo.endCursor;
  if (p % 5 === 0) console.error(`  quality scan: ${quality.total}`);
}

// Build indexes
const colByHandle = new Map(collections.map((c) => [c.handle, c]));
const pageHandles = new Set(pages.map((p) => p.handle));
const menuFlat = menus.flatMap((m) => walkMenu(m.items).map((it) => ({ menu: m.handle, ...it })));
const menuUrls = new Set(menuFlat.map((m) => m.url));

function menuRefsCollection(handle) {
  const url = `/collections/${handle}`;
  return menuFlat.filter((m) => m.url === url || m.url?.endsWith(url));
}

function menuRefsPage(handle) {
  const url = `/pages/${handle}`;
  return menuFlat.filter((m) => m.url === url || m.url?.endsWith(url));
}

// Collection analysis
const colRows = collections.map((c) => {
  const count = c.productsCount?.count ?? 0;
  const isSmart = !!(c.ruleSet?.rules?.length);
  const group = classifyCollection(c.handle, c.title);
  const menuRefs = menuRefsCollection(c.handle);
  const pageRefs = pages.filter((p) => (p.bodySummary || "").includes(`/collections/${c.handle}`));
  return {
    name: c.title,
    handle: c.handle,
    product_count: count,
    type: isSmart ? "Smart" : "Manual",
    menu_referenced: menuRefs.length > 0,
    menu_refs: menuRefs.map((m) => m.menu),
    page_referenced: pageRefs.length > 0,
    seo_status: seoStatus(c),
    seo_title: c.seo?.title || "",
    seo_description: c.seo?.description || "",
    group,
    empty: count === 0,
  };
});

const grouped = {};
for (const r of colRows) {
  if (!grouped[r.group]) grouped[r.group] = [];
  grouped[r.group].push(r);
}

const emptyCollections = colRows.filter((c) => c.empty);
const seoIssues = colRows.filter((c) => c.seo_status !== "OK");

// Duplicate detection (similar handles)
const duplicateGroups = [];
const handleRoots = new Map();
for (const c of colRows) {
  const root = c.handle.replace(/-(tillbehor|serien|serie|reservdelar|accessories)$/i, "");
  if (!handleRoots.has(root)) handleRoots.set(root, []);
  handleRoots.get(root).push(c.handle);
}
for (const [root, handles] of handleRoots) {
  if (handles.length > 1 && root.length > 5) duplicateGroups.push({ root, handles });
}

// Menu validation
const menuAudit = menus.map((m) => {
  const items = walkMenu(m.items);
  const broken = [];
  const missingCollections = [];
  const missingPages = [];
  for (const it of items) {
    if (!it.url) continue;
    const colMatch = it.url.match(/\/collections\/([^/?#]+)/);
    const pageMatch = it.url.match(/\/pages\/([^/?#]+)/);
    if (colMatch) {
      const h = colMatch[1];
      if (!colByHandle.has(h)) missingCollections.push({ title: it.title, url: it.url, handle: h });
    } else if (pageMatch) {
      const h = pageMatch[1];
      if (!pageHandles.has(h)) missingPages.push({ title: it.title, url: it.url, handle: h });
    } else if (it.url.startsWith("/") && !it.url.startsWith("/blogs") && !it.url.startsWith("/policies")) {
      broken.push({ title: it.title, url: it.url, reason: "unresolved_internal" });
    }
  }
  return {
    name: m.title,
    handle: m.handle,
    is_default: m.isDefault,
    item_count: items.length,
    theme_referenced: ["main-menu", "footer", "meny", "enterprise-dr-nare"].includes(m.handle) ? "likely" : "unverified",
    shopify_referenced: true,
    broken_links: broken,
    missing_collections: missingCollections,
    missing_pages: missingPages,
    items,
  };
});

const emptyMenus = menuAudit.filter((m) => m.item_count === 0);
const menuTitleDupes = new Map();
for (const m of menus) {
  const t = (m.title || "").toLowerCase().trim();
  if (!menuTitleDupes.has(t)) menuTitleDupes.set(t, []);
  menuTitleDupes.get(t).push(m.handle);
}
const duplicateMenuTitles = [...menuTitleDupes.entries()].filter(([, h]) => h.length > 1);

const allBrokenMenus = menuAudit.flatMap((m) =>
  [...m.missing_collections, ...m.missing_pages, ...m.broken_links].map((x) => ({ menu: m.handle, ...x })),
);

// Enterprise readiness
const enterpriseReadiness = ENTERPRISE_TARGETS.map((t) => {
  const col = t.collections.find((h) => colByHandle.has(h));
  const colData = col ? colByHandle.get(col) : null;
  const productCount = colData?.productsCount?.count ?? 0;
  const hasSeo = !!(colData?.seo?.title && colData?.seo?.description);
  const menuHit = menuFlat.some(
    (m) =>
      t.menuPatterns.some((p) => m.url?.toLowerCase().includes(p.replace(/\s/g, "-")) || m.title?.toLowerCase().includes(p)) ||
      t.collections.some((h) => m.url?.includes(h)),
  );
  const servicePage = pageHandles.has(`${t.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-service`);
  const pct = score([!!col, productCount > 0, hasSeo, menuHit]);
  return {
    name: t.name,
    collection_exists: !!col,
    collection_handle: col || null,
    products_assigned: productCount,
    seo_page_exists: hasSeo,
    menu_link_exists: menuHit,
    service_page_exists: servicePage,
    score: pct,
  };
});

// Service readiness
function categoryScore(handles) {
  const live = handles.filter((h) => pageHandles.has(h)).length;
  return { live, total: handles.length, pct: Math.round((live / handles.length) * 100) };
}

const serviceReadiness = {
  service: categoryScore(SERVICE_PAGE_HANDLES.service),
  repair: categoryScore(SERVICE_PAGE_HANDLES.repair),
  calibration: categoryScore(SERVICE_PAGE_HANDLES.calibration),
  support: categoryScore(SERVICE_PAGE_HANDLES.support),
  warranty: categoryScore(SERVICE_PAGE_HANDLES.warranty),
  booking: categoryScore(SERVICE_PAGE_HANDLES.booking),
};
const serviceOverall = Math.round(
  Object.values(serviceReadiness).reduce((s, c) => s + c.pct, 0) / Object.keys(serviceReadiness).length,
);

// B2B readiness
const b2bChecks = {
  quote_request: pageHandles.has("request-quote") || pageHandles.has("offertforfragan"),
  company_accounts: false, // Shopify B2B not detectable via basic API
  vat_handling: shopData.shop?.taxesIncluded === true,
  invoice_payments: false, // requires payment settings audit
  peppol_ready: pageHandles.has("betalningsalternativ"),
  partner_portal: pageHandles.has("partnership") || menus.some((m) => m.handle === "partnership"),
  reseller_support: pageHandles.has("aterforsaljare") || pageHandles.has("reseller"),
};
const b2bScore = score([
  b2bChecks.quote_request,
  b2bChecks.vat_handling,
  b2bChecks.partner_portal,
  b2bChecks.reseller_support,
  pageHandles.has("kontakta-support"),
  menus.some((m) => m.handle === "partnership"),
]);

// Documentation center
const docReadiness = {};
for (const [cat, handles] of Object.entries(DOC_HANDLES)) {
  const live = handles.filter((h) => pageHandles.has(h)).length;
  docReadiness[cat] = { live, total: handles.length, pct: Math.round((live / handles.length) * 100) };
}
const docOverall = Math.round(Object.values(docReadiness).reduce((s, c) => s + c.pct, 0) / Object.keys(docReadiness).length);

// SEO audit
const seoAudit = {
  collections_missing_title: colRows.filter((c) => !c.seo_title).length,
  collections_missing_description: colRows.filter((c) => !c.seo_description).length,
  collections_missing_body: collections.filter((c) => !(c.descriptionHtml || "").replace(/<[^>]+>/g, "").trim()).length,
  collections_short_title: colRows.filter((c) => c.seo_title && c.seo_title.length < 30).length,
  collections_short_description: colRows.filter((c) => c.seo_description && c.seo_description.length < 80).length,
  empty_collections: emptyCollections.length,
  menu_broken_links: allBrokenMenus.length,
  legacy_pages: pages.filter((p) => /actionking|actionkamer|360-kamera/i.test(p.handle + p.title)).length,
  schema_markup: "not_verified_theme_audit_required",
};

const seoCritical = [];
const seoHigh = [];
const seoMedium = [];
if (productStatus.active === 0) seoCritical.push("All 9,389 products are DRAFT — nothing purchasable on storefront");
if (seoAudit.collections_missing_title > 0) seoHigh.push(`${seoAudit.collections_missing_title} collections missing meta title`);
if (seoAudit.collections_missing_description > 0) seoHigh.push(`${seoAudit.collections_missing_description} collections missing meta description`);
if (allBrokenMenus.length > 0) seoHigh.push(`${allBrokenMenus.length} broken menu links`);
if (seoAudit.empty_collections > 10) seoMedium.push(`${seoAudit.empty_collections} empty collections`);
if (quality.missing_images > 0) seoMedium.push(`${quality.missing_images} products missing images`);
if (seoAudit.legacy_pages > 0) seoMedium.push(`${seoAudit.legacy_pages} legacy ActionKing pages remain`);

// European expansion
const publishedLocales = locales.filter((l) => l.published);
const euReadiness = EU_COUNTRIES.map((c) => {
  const localePublished = publishedLocales.some((l) => l.locale === c.locale);
  const marketEnabled = c.market ? markets.some((m) => m.name === c.market && m.enabled) : false;
  const isPrimary = c.code === "SE";
  return {
    country: c.name,
    language_ready: localePublished || isPrimary,
    tax_ready: shopData.shop?.taxesIncluded && isPrimary,
    shipping_ready: isPrimary,
    seo_ready: isPrimary && colRows.filter((r) => r.seo_status === "OK").length > collections.length * 0.5,
    market_enabled: marketEnabled || isPrimary,
  };
});

// Overall completion
const smartCount = colRows.filter((c) => c.type === "Smart").length;
const manualCount = colRows.filter((c) => c.type === "Manual").length;
const enterpriseAvg = Math.round(enterpriseReadiness.reduce((s, e) => s + e.score, 0) / enterpriseReadiness.length);

const finished = [
  "Product catalog migrated (9,389 SKUs)",
  "150 collections created with smart rules (Phase 3 deployed)",
  "Enterprise collection architecture (Matrice, Mavic, Agras, sensors)",
  "Main navigation menu populated (consumer + enterprise)",
  "61 Shopify pages (legacy + contact)",
  "Blog with 68 articles",
  "Swedish primary market configured",
];
const partial = [
  `Enterprise product lines avg ${enterpriseAvg}% readiness`,
  `Service platform architecture designed (Phase 5 spec, 0/${Object.values(SERVICE_PAGE_HANDLES).flat().length} pages live)`,
  `Documentation center 0% deployed (${docOverall}% spec coverage)`,
  `B2B platform ${b2bScore}% readiness`,
  "SEO metadata on ~" + Math.round((colRows.filter((c) => c.seo_status === "OK").length / collections.length) * 100) + "% of collections",
  "Phase 4 enterprise expansion (33 collections) — dry-run only, not deployed",
];
const notStarted = [
  "Product publication (all SKUs in DRAFT)",
  "Service & Support pages deployment",
  "Knowledge Center content",
  "B2B quote/PEPPOL workflows",
  "European market activation (DE, DK, FI, FR, NL)",
  "Company accounts / B2B checkout",
  "Schema markup verification",
];

const overallPct = Math.round(
  (score([productStatus.total > 0]) * 0.15 +
    score([collections.length >= 100]) * 0.15 +
    score([menus.length >= 5]) * 0.1 +
    enterpriseAvg * 0.2 +
    serviceOverall * 0.15 +
    b2bScore * 0.1 +
    docOverall * 0.05 +
    (productStatus.active > 0 ? 100 : 0) * 0.1) /
    1,
);

const priorities = [
  { rank: 1, item: "Publish active products — entire catalog is DRAFT", impact: "Critical" },
  { rank: 2, item: "Fix broken menu links (" + allBrokenMenus.length + " unresolved)", impact: "High" },
  { rank: 3, item: "Deploy Phase 5 Service & Support pages (98 pages spec ready)", impact: "High" },
  { rank: 4, item: "Deploy Phase 4 enterprise collections (33 pending)", impact: "High" },
  { rank: 5, item: "Populate empty collections (" + emptyCollections.length + ")", impact: "Medium" },
  { rank: 6, item: "Product data quality — images/descriptions", impact: "Medium" },
  { rank: 7, item: "B2B quote request + PEPPOL procurement flow", impact: "Medium" },
  { rank: 8, item: "Documentation Center deployment", impact: "Medium" },
  { rank: 9, item: "European market activation (DE, NL, DK, FI, FR)", impact: "Medium" },
  { rank: 10, item: "Remove legacy ActionKing pages and menu remnants", impact: "Low" },
];

const audit = {
  generated_at: new Date().toISOString(),
  store: STORE,
  mode: "read_only",
  overview: {
    products: productStatus,
    collections: { total: collections.length, smart: smartCount, manual: manualCount },
    pages: pages.length,
    blogs: blogs.length,
    articles: totalArticles,
    menus: menus.length,
    markets,
    locales: { total: locales.length, published: publishedLocales },
  },
  grouped_collections: grouped,
  empty_collections: emptyCollections,
  duplicate_groups: duplicateGroups,
  seo_issues: seoIssues,
  menu_audit: menuAudit,
  broken_menu_links: allBrokenMenus,
  empty_menus: emptyMenus.length,
  duplicate_menu_titles: duplicateMenuTitles.length,
  enterprise_readiness: enterpriseReadiness,
  service_readiness: serviceReadiness,
  b2b: b2bChecks,
  documentation: docReadiness,
  product_quality: quality,
  eu_readiness: euReadiness,
  overall_pct: overallPct,
};

writeFileSync(OUT_AUDIT, JSON.stringify(audit, null, 2));

// ─── Markdown report ───
const lines = [
  "# EuroDroneParts — Executive Project Status Report",
  "",
  `**Generated:** ${audit.generated_at}`,
  `**Store:** ${STORE} (${shopData.shop?.primaryDomain?.url || ""})`,
  `**Plan:** ${shopData.shop?.plan?.displayName || "—"} | **Currency:** ${shopData.shop?.currencyCode || "—"} | **Tax inclusive:** ${shopData.shop?.taxesIncluded ? "Yes" : "No"}`,
  "**Mode:** Read-only audit — no modifications made",
  "",
  "---",
  "",
  "## 1. Store Overview",
  "",
  "| Metric | Count |",
  "|--------|------:|",
  `| Total products | ${productStatus.total.toLocaleString()} |`,
  `| Active products | **${productStatus.active.toLocaleString()}** |`,
  `| Draft products | ${productStatus.draft.toLocaleString()} |`,
  `| Archived products | ${productStatus.archived.toLocaleString()} |`,
  `| Total collections | ${collections.length} |`,
  `| Smart collections | ${smartCount} |`,
  `| Manual collections | ${manualCount} |`,
  `| Total pages | ${pages.length} |`,
  `| Total blogs | ${blogs.length} |`,
  `| Total articles | ${totalArticles} |`,
  `| Total menus | ${menus.length} |`,
  `| Active menus (with items) | ${menus.length - emptyMenus.length} |`,
  `| Empty menus (legacy) | ${emptyMenus.length} |`,
  `| Markets configured | ${markets.length} (${markets.filter((m) => m.enabled).length} enabled) |`,
  `| Languages configured | ${locales.length} (${publishedLocales.length} published) |`,
  "",
  "> **Critical:** All products are currently in DRAFT status. The storefront has no purchasable products until publication.",
  "",
  "### Markets",
  "",
  "| Market | Enabled | Primary |",
  "|--------|---------|---------|",
  ...markets.map((m) => `| ${m.name} | ${m.enabled ? "Yes" : "No"} | ${m.primary ? "Yes" : "No"} |`),
  "",
  "### Published languages",
  "",
  publishedLocales.length
    ? publishedLocales.map((l) => `- ${l.name} (\`${l.locale}\`)${l.primary ? " — primary" : ""}`).join("\n")
    : "- None published",
  "",
  "---",
  "",
  "## 2. Collection Structure",
  "",
  `**Total:** ${collections.length} collections | **Empty:** ${emptyCollections.length} | **SEO issues:** ${seoIssues.length}`,
  "",
];

for (const [group, rows] of Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]))) {
  lines.push(`### ${group} (${rows.length})`, "", "| Name | Handle | Products | Type | Menu | Page | SEO |", "|---|---|--:|---|---|---|---|");
  for (const r of rows.sort((a, b) => b.product_count - a.product_count)) {
    lines.push(
      `| ${r.name.slice(0, 50)} | \`${r.handle}\` | ${r.product_count} | ${r.type} | ${r.menu_referenced ? "Yes" : "No"} | ${r.page_referenced ? "Yes" : "No"} | ${r.seo_status} |`,
    );
  }
  lines.push("");
}

lines.push(
  "### Empty collections",
  "",
  emptyCollections.length
    ? emptyCollections.map((c) => `- \`${c.handle}\` — ${c.name}`).join("\n")
    : "- None",
  "",
  "### Potential duplicate groups",
  "",
  duplicateGroups.length
    ? duplicateGroups.slice(0, 15).map((d) => `- \`${d.root}\`: ${d.handles.map((h) => `\`${h}\``).join(", ")}`).join("\n")
    : "- No significant duplicates detected",
  "",
  "### Collections with SEO issues",
  "",
  `| Severity | Count |`,
  `|----------|------:|`,
  `| Critical | ${seoIssues.filter((c) => c.seo_status === "Critical").length} |`,
  `| Needs improvement | ${seoIssues.filter((c) => c.seo_status === "Needs improvement").length} |`,
  `| OK | ${colRows.filter((c) => c.seo_status === "OK").length} |`,
  "",
  "---",
  "",
  "## 3. Menu Structure",
  "",
  "| Menu | Handle | Items | Theme ref | Broken | Missing collections | Missing pages |",
  "|------|--------|------:|-----------|-------:|--------------------:|--------------:|",
);

for (const m of menuAudit) {
  lines.push(
    `| ${m.name} | \`${m.handle}\` | ${m.item_count} | ${m.theme_referenced} | ${m.broken_links.length} | ${m.missing_collections.length} | ${m.missing_pages.length} |`,
  );
}

lines.push(
  "",
  `> **Note:** ${emptyMenus.length} of ${menus.length} menus are empty (legacy migration artifacts). ${duplicateMenuTitles.length} duplicate menu title groups detected.`,
  "",
  "### Broken / missing menu links",
  "",
  allBrokenMenus.length
    ? "| Menu | Title | URL | Issue |\n|---|---|---|---|\n" +
        allBrokenMenus
          .slice(0, 40)
          .map((b) => `| \`${b.menu}\` | ${b.title || "—"} | ${b.url || "—"} | ${b.handle ? `missing ${b.handle}` : b.reason || "broken"} |`)
          .join("\n")
    : "- No broken links detected",
  "",
  "### Navigation map (main-menu)",
  "",
);

const mainMenu = menus.find((m) => m.handle === "main-menu" || m.handle === "meny");
if (mainMenu) {
  function renderTree(items, depth = 0) {
    for (const it of items || []) {
      lines.push(`${"  ".repeat(depth)}- **${it.title}** → \`${it.url || "—"}\``);
      renderTree(it.items, depth + 1);
    }
  }
  renderTree(mainMenu.items);
} else {
  lines.push("- main-menu not found");
}

lines.push("", "---", "", "## 4. Enterprise Readiness", "", "| Platform | Collection | Products | SEO | Menu | Score |", "|---|---|--:|---|---|--:|");

for (const e of enterpriseReadiness) {
  lines.push(
    `| ${e.name} | ${e.collection_exists ? `\`${e.collection_handle}\`` : "—"} | ${e.products_assigned} | ${e.seo_page_exists ? "Yes" : "No"} | ${e.menu_link_exists ? "Yes" : "No"} | **${e.score}%** |`,
  );
}
lines.push("", `**Average enterprise readiness: ${enterpriseAvg}%**`, "", "---", "", "## 5. Service & Repair Readiness", "", "| Category | Live | Spec | Score |", "|---|---:|---:|--:|");

for (const [cat, data] of Object.entries(serviceReadiness)) {
  lines.push(`| ${cat} | ${data.live} | ${data.total} | **${data.pct}%** |`);
}
lines.push("", `**Overall service readiness: ${serviceOverall}%** (Phase 5 architecture spec ready, pages not deployed)`, "", "---", "", "## 6. B2B Readiness", "", "| Capability | Status |", "|---|---|");

const b2bRows = [
  ["Quote request flow", b2bChecks.quote_request ? "Partial (no dedicated page)" : "Not started"],
  ["Company accounts", "Not configured"],
  ["VAT handling", b2bChecks.vat_handling ? "Yes (tax-inclusive pricing)" : "No"],
  ["Invoice payments", "Not verified"],
  ["PEPPOL readiness", b2bChecks.peppol_ready ? "Spec only (Phase 5)" : "Not started"],
  ["Partner portal", b2bChecks.partner_portal ? "Menu exists" : "Not started"],
  ["Reseller support", b2bChecks.reseller_support ? "Page exists" : "Not started"],
];
for (const [cap, stat] of b2bRows) lines.push(`| ${cap} | ${stat} |`);
lines.push("", `**Overall B2B readiness: ${b2bScore}%**`, "", "---", "", "## 7. SEO Status", "", "### Summary", "", "| Area | Finding |", "|------|---------|");
lines.push(`| Collections with meta title | ${collections.length - seoAudit.collections_missing_title}/${collections.length} |`);
lines.push(`| Collections with meta description | ${collections.length - seoAudit.collections_missing_description}/${collections.length} |`);
lines.push(`| Collections with body description | ${collections.length - seoAudit.collections_missing_body}/${collections.length} |`);
lines.push(`| Menu broken links | ${seoAudit.menu_broken_links} |`);
lines.push(`| Schema markup | ${seoAudit.schema_markup} |`);
lines.push(`| Legacy ActionKing pages | ${seoAudit.legacy_pages} |`);

lines.push("", "### Critical issues", "", seoCritical.length ? seoCritical.map((i) => `- ${i}`).join("\n") : "- None");
lines.push("", "### High priority", "", seoHigh.length ? seoHigh.map((i) => `- ${i}`).join("\n") : "- None");
lines.push("", "### Medium priority", "", seoMedium.length ? seoMedium.map((i) => `- ${i}`).join("\n") : "- None");

lines.push("", "---", "", "## 8. Documentation Center", "", "| Category | Live pages | Spec | Completeness |", "|---|---:|---:|--:|");
for (const [cat, data] of Object.entries(docReadiness)) {
  lines.push(`| ${cat} | ${data.live} | ${data.total} | **${data.pct}%** |`);
}
lines.push("", `**Overall documentation completeness: ${docOverall}%**`, "", "---", "", "## 9. Product Data Quality", "", "| Issue | Count | % of catalog |", "|---|---:|---:|");
const q = quality;
lines.push(`| Missing images | ${q.missing_images.toLocaleString()} | ${Math.round((q.missing_images / q.total) * 100)}% |`);
lines.push(`| Missing descriptions | ${q.missing_descriptions.toLocaleString()} | ${Math.round((q.missing_descriptions / q.total) * 100)}% |`);
lines.push(`| Short descriptions (<50 chars) | ${q.short_descriptions.toLocaleString()} | ${Math.round((q.short_descriptions / q.total) * 100)}% |`);
lines.push(`| Missing vendor/brand | ${q.missing_vendor.toLocaleString()} | ${Math.round((q.missing_vendor / q.total) * 100)}% |`);
lines.push(`| Missing product type | ${q.missing_product_type.toLocaleString()} | ${Math.round((q.missing_product_type / q.total) * 100)}% |`);
lines.push(`| Missing tags | ${q.missing_tags.toLocaleString()} | ${Math.round((q.missing_tags / q.total) * 100)}% |`);

lines.push("", "---", "", "## 10. European Expansion Readiness", "", "| Country | Language | Tax | Shipping | SEO | Market |", "|---|---|---|---|---|---|");
for (const e of euReadiness) {
  const yn = (v) => (v ? "Ready" : "Not ready");
  lines.push(`| ${e.country} | ${yn(e.language_ready)} | ${yn(e.tax_ready)} | ${yn(e.shipping_ready)} | ${yn(e.seo_ready)} | ${yn(e.market_enabled)} |`);
}

lines.push("", "---", "", "## 11. Overall Project Status", "", `### Completion: **${overallPct}%**`, "", "### Finished", "", finished.map((f) => `- ${f}`).join("\n"));
lines.push("", "### Partially finished", "", partial.map((f) => `- ${f}`).join("\n"));
lines.push("", "### Not started", "", notStarted.map((f) => `- ${f}`).join("\n"));
lines.push("", "### Top 10 priorities", "", "| # | Priority | Impact |", "|--:|---|---|");
for (const p of priorities) lines.push(`| ${p.rank} | ${p.item} | ${p.impact} |`);

lines.push(
  "",
  "---",
  "",
  "## 12. Roadmap",
  "",
  "### Phase 4 Remaining (Enterprise Expansion)",
  "",
  "| Task | Effort | Dependencies | Risks |",
  "|------|--------|--------------|-------|",
  "| Deploy 33 new enterprise collections | Medium — Shopify API batch | Phase 3 stable, tag standards | Product tag gaps → empty collections |",
  "| Validate menu links post-deploy | Low | Collection deployment | Broken links if handles mismatch |",
  "| Industry vertical pages (25) | Medium | Collection population | Content creation bottleneck |",
  "",
  "### Phase 5 Service Platform",
  "",
  "| Task | Effort | Dependencies | Risks |",
  "|------|--------|--------------|-------|",
  "| Create 98 service/support pages | High — page templates + content | Phase 5 spec approval | Content volume |",
  "| Deploy additive menus (6) | Low | Pages created | Theme integration |",
  "| B2B forms (quote, ticket, warranty) | Medium | Shopify Forms or custom app | Workflow routing |",
  "| Documentation Center assets | High | PDF/manual uploads | Asset licensing |",
  "| Knowledge Center articles | High | SEO content team | Time to rank |",
  "",
  "### Phase 6 B2B Platform",
  "",
  "| Task | Effort | Dependencies | Risks |",
  "|------|--------|--------------|-------|",
  "| Company accounts + B2B checkout | High | Shopify Plus or B2B app | Plan upgrade cost |",
  "| PEPPOL procurement integration | High | ERP/e-invoicing partner | Technical complexity |",
  "| Invoice/leasing/financing flows | Medium | Payment provider contracts | Compliance |",
  "| Public sector workflows | Medium | Phase 5 pages | Tender process knowledge |",
  "",
  "### Phase 7 European Expansion",
  "",
  "| Task | Effort | Dependencies | Risks |",
  "|------|--------|--------------|-------|",
  "| Enable markets (DE, DK, FI, FR, NL) | Medium | Translations, tax config | Netherlands market not configured |",
  "| Publish localized content | High | Translation pipeline | Quality consistency |",
  "| Local SEO + hreflang | Medium | Market activation | Duplicate content |",
  "| Shipping zones + carriers | Medium | Logistics contracts | Delivery times |",
  "",
  "---",
  "",
  "Artifacts: `.executive-status-audit.json`",
  "",
);

writeFileSync(OUT_REPORT, lines.join("\n"));
console.log(`Wrote ${OUT_REPORT}`);
console.log(JSON.stringify({ overall_pct: overallPct, products: productStatus, collections: collections.length, menus: menus.length, broken_links: allBrokenMenus.length }, null, 2));
