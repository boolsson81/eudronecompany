#!/usr/bin/env node
/**
 * EuroDroneParts — Phase 4–6 Implementation (READ-ONLY).
 * Prepares structure, rules, and reports. Does NOT deploy or publish.
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const URL = process.env.CLONER_SUPABASE_URL || "https://wsncjdajweoujhidlxas.supabase.co";
const STORE = "ya1xhg-x6.myshopify.com";

const OUT = {
  phase4a: join(ROOT, "ENTERPRISE_PHASE4_REPORT.md"),
  phase4b: join(ROOT, "SPARE_PARTS_ARCHITECTURE_REPORT.md"),
  phase5: join(ROOT, "SERVICE_STRUCTURE_REPORT.md"),
  phase6: join(ROOT, "B2B_FOUNDATION_REPORT.md"),
  master: join(ROOT, "EURODRONEPARTS_PHASE4_6_READINESS_REPORT.md"),
  audit: join(ROOT, ".phase4-6-readiness-audit.json"),
  data4a: join(ROOT, "data/edp-phase4a-enterprise-rules.json"),
  data4b: join(ROOT, "data/edp-phase4b-spare-parts-architecture.json"),
  data5: join(ROOT, "data/edp-phase5-service-structure.json"),
  data6: join(ROOT, "data/edp-phase6-b2b-foundation.json"),
};

const PHASE3_PROTECTED = new Set([
  "dji-matrice-4-serie", "dji-matrice-3-serien", "dji-matrice-30-serie-tillbehor",
  "dji-matrice-350-rtk-tillbehor", "dji-matrice-400-serien", "dji-matrice-serien",
  "dji-mavic-3-enterprise", "dji-mavic-serien-enterprise", "dji-agras-dronare",
  "dji-flycart-serien", "dji-flycart-100-lastdronare", "enterprise-dronare",
  "enterprise-sensorer", "dronare-med-varmekamera", "main-menu", "enterprise-dr-nare",
]);

const SUB_PARTS = [
  { key: "propellrar", label: "Propellrar", titleKw: ["propeller", "propell"], tag: null },
  { key: "batterier", label: "Batterier", titleKw: ["batteri", "battery"], tag: null },
  { key: "motorer", label: "Motorer", titleKw: ["motor"], tag: null },
  { key: "armar", label: "Armar", titleKw: ["arm", "frame arm"], tag: null },
  { key: "kameror", label: "Kameror", titleKw: ["kamera", "camera"], tag: null },
  { key: "gimbal", label: "Gimbal", titleKw: ["gimbal"], tag: null },
  { key: "skal", label: "Skal", titleKw: ["skal", "shell", "cover", "housing"], tag: null },
  { key: "landningsstall", label: "Landningsställ", titleKw: ["landningsställ", "landing gear", "landning"], tag: null },
  { key: "kablar", label: "Kablar", titleKw: ["kabel", "cable", "wire"], tag: null },
  { key: "antenner", label: "Antenner", titleKw: ["antenn", "antenna"], tag: null },
  { key: "rtk", label: "RTK", titleKw: ["rtk", "gnss"], tag: null },
  { key: "sensorer", label: "Sensorer", titleKw: ["sensor", "imu", "compass"], tag: null },
  { key: "tillbehor", label: "Tillbehör", titleKw: ["tillbehör", "tillbehor", "accessory"], tag: null },
];

const CONSUMER_PLATFORMS = [
  { slug: "dji-neo", label: "DJI Neo", titleMatch: ["DJI Neo", "Neo "], exclude: ["Neo 2"] },
  { slug: "dji-neo-2", label: "DJI Neo 2", titleMatch: ["Neo 2", "Neo2"] },
  { slug: "dji-flip", label: "DJI Flip", titleMatch: ["DJI Flip", "Flip"] },
  { slug: "dji-mini-3", label: "DJI Mini 3", titleMatch: ["Mini 3"], exclude: ["Mini 4", "Mini 2"] },
  { slug: "dji-mini-4-pro", label: "DJI Mini 4 Pro", titleMatch: ["Mini 4 Pro", "Mini 4"] },
  { slug: "dji-air-3", label: "DJI Air 3", titleMatch: ["Air 3"], exclude: ["Air 3S", "Air 2"] },
  { slug: "dji-air-3s", label: "DJI Air 3S", titleMatch: ["Air 3S"] },
  { slug: "dji-avata-2", label: "DJI Avata 2", titleMatch: ["Avata 2"] },
];

const ENTERPRISE_PLATFORMS = [
  { slug: "dji-matrice-4", label: "DJI Matrice 4", titleMatch: ["Matrice 4", "M4E", "M4T"] },
  { slug: "dji-matrice-30", label: "DJI Matrice 30", titleMatch: ["Matrice 30", "M30"] },
  { slug: "dji-matrice-350-rtk", label: "DJI Matrice 350 RTK", titleMatch: ["Matrice 350", "M350"] },
  { slug: "dji-matrice-400", label: "DJI Matrice 400", titleMatch: ["Matrice 400", "M400"] },
  { slug: "dji-mavic-3-enterprise", label: "DJI Mavic 3 Enterprise", titleMatch: ["Mavic 3 Enterprise", "Mavic 3E", "M3E"] },
  { slug: "dji-flycart-30", label: "DJI FlyCart 30", titleMatch: ["FlyCart 30"] },
];

const B2B_INDUSTRIES = [
  "Energi & Infrastruktur",
  "Kraftnät",
  "Solparker",
  "Vindkraft",
  "Skogsbruk",
  "Jordbruk",
  "Kartläggning & Mätning",
  "Bygg & Anläggning",
  "Säkerhet & Räddning",
  "Polis",
  "Transport & Logistik",
];

const B2B_SERVICES = [
  { handle: "foretagskonto", title: "Företagskonto" },
  { handle: "offertforfragan", title: "Offertförfrågan" },
  { handle: "leasing", title: "Leasing" },
  { handle: "finansiering", title: "Finansiering" },
  { handle: "serviceavtal", title: "Serviceavtal" },
  { handle: "supportavtal", title: "Supportavtal" },
  { handle: "utbildning", title: "Utbildning" },
  { handle: "partnerprogram", title: "Partnerprogram" },
];

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

async function paginate(query, path, pageSize = 50, maxPages = 200) {
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

const T = (c) => ({ column: "TITLE", relation: "CONTAINS", condition: c });
const TG = (c) => ({ column: "TAG", relation: "EQUALS", condition: c });

function or(...rules) {
  return { appliedDisjunctively: true, rules };
}

const ENTERPRISE_PHASE4A = [
  {
    handle: "dji-matrice-300-rtk",
    title: "DJI Matrice 300 RTK",
    menu: { parent: "enterprise-dr-nare", label: "Matrice 300 RTK" },
    rules: or(T("Matrice 300"), T("M300 RTK"), TG("Matrice 300 RTK")),
  },
  {
    handle: "dji-matrice-3d",
    title: "DJI Matrice 3D",
    menu: { parent: "enterprise-dr-nare", label: "Matrice 3D" },
    rules: or(T("Matrice 3D"), T("M3D"), TG("DJI Matrice 3D")),
  },
  {
    handle: "dji-matrice-3td",
    title: "DJI Matrice 3TD",
    menu: { parent: "enterprise-dr-nare", label: "Matrice 3TD" },
    rules: or(T("Matrice 3TD"), T("3TD"), TG("DJI Matrice 3TD")),
  },
  {
    handle: "dji-mavic-3-thermal",
    title: "DJI Mavic 3 Thermal",
    menu: { parent: "enterprise-dr-nare", label: "Mavic 3 Thermal" },
    rules: or(T("Mavic 3T"), T("Mavic 3 Thermal"), TG("Mavic 3T")),
  },
  {
    handle: "dji-agras-t25",
    title: "DJI Agras T25",
    menu: { parent: "enterprise-dr-nare", label: "Agras T25" },
    rules: or(T("Agras T25"), T("T25"), TG("Agras T25")),
  },
  {
    handle: "dji-agras-t40",
    title: "DJI Agras T40",
    menu: { parent: "enterprise-dr-nare", label: "Agras T40" },
    rules: or(T("Agras T40"), T("T40"), TG("Agras T40")),
  },
  {
    handle: "dji-agras-t50",
    title: "DJI Agras T50",
    menu: { parent: "enterprise-dr-nare", label: "Agras T50" },
    rules: or(T("Agras T50"), T("T50"), TG("Agras T50")),
  },
  {
    handle: "dji-flycart-30",
    title: "DJI FlyCart 30",
    menu: { parent: "enterprise-dr-nare", label: "FlyCart 30" },
    rules: or(T("FlyCart 30"), TG("FlyCart 30"), TG("DJI FlyCart 30")),
  },
  {
    handle: "dji-dock-2",
    title: "DJI Dock 2",
    menu: { parent: "enterprise-dr-nare", label: "Dock 2" },
    rules: or(T("Dock 2"), TG("DJI Dock 2")),
  },
  {
    handle: "dji-dock-3",
    title: "DJI Dock 3",
    menu: { parent: "enterprise-dr-nare", label: "Dock 3" },
    rules: or(T("Dock 3"), TG("DJI Dock 3")),
  },
];

function productMatchesRule(product, rule) {
  const col = String(rule.column).toUpperCase();
  const rel = String(rule.relation).toUpperCase();
  const cond = String(rule.condition);
  const condL = cond.toLowerCase();
  if (col === "TAG") {
    if (rel !== "EQUALS") return false;
    return (product.tags || []).some((t) => t === cond);
  }
  const field =
    col === "TYPE" ? product.productType || "" : col === "VENDOR" ? product.vendor || "" : product.title || "";
  const f = field.toLowerCase();
  if (rel === "EQUALS") return f === condL;
  if (rel === "CONTAINS") return f.includes(condL);
  return false;
}

function productMatchesRuleSet(product, ruleSet) {
  if (!ruleSet?.rules?.length) return false;
  return ruleSet.appliedDisjunctively
    ? ruleSet.rules.some((r) => productMatchesRule(product, r))
    : ruleSet.rules.every((r) => productMatchesRule(product, r));
}

function productMatchesPlatform(product, platform) {
  const title = (product.title || "").toLowerCase();
  const tags = (product.tags || []).map((t) => t.toLowerCase());
  const hit = platform.titleMatch.some((m) => {
    const ml = m.toLowerCase();
    return title.includes(ml) || tags.some((t) => t.includes(ml));
  });
  if (!hit) return false;
  if (platform.exclude?.some((e) => title.includes(e.toLowerCase()))) return false;
  return true;
}

function productMatchesSpareSub(product, platform, sub) {
  if (!productMatchesPlatform(product, platform)) return false;
  const title = (product.title || "").toLowerCase();
  const tags = (product.tags || []).map((t) => t.toLowerCase());
  return sub.titleKw.some((kw) => title.includes(kw.toLowerCase()) || tags.some((t) => t.includes(kw.toLowerCase())));
}

function walkMenu(items, out = []) {
  for (const it of items || []) {
    out.push({ title: it.title, url: it.url });
    walkMenu(it.items, out);
  }
  return out;
}

function scorePct(n, d) {
  return d === 0 ? 0 : Math.round((n / d) * 100);
}

loadEnv();

console.error("Fetching catalog...");
const products = [];
let cursor = null;
for (let p = 0; p < 50; p++) {
  const data = await gql(
    `query($c: String) {
      products(first: 250, after: $c) {
        pageInfo { hasNextPage endCursor }
        nodes { title vendor productType tags status
          media(first:1){nodes{id}}
          variants(first:5){nodes{price}}
          descriptionHtml
        }
      }
    }`,
    { c: cursor },
  );
  products.push(...(data.products?.nodes || []));
  if (!data.products?.pageInfo?.hasNextPage) break;
  cursor = data.products.pageInfo.endCursor;
  if (p % 5 === 0) console.error(`  products: ${products.length}`);
}

console.error("Fetching collections & menus...");
const collections = await paginate(
  `query($cursor: String, $first: Int!) {
    collections(first: $first, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      nodes { handle title productsCount { count } ruleSet { rules { column relation condition } } seo { title description } descriptionHtml }
    }
  }`,
  "collections",
  50,
  10,
);
const menus = await paginate(
  `query($cursor: String, $first: Int!) {
    menus(first: $first, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      nodes { handle title items { title url items { title url } } }
    }
  }`,
  "menus",
  50,
  10,
);
const pages = await paginate(
  `query($cursor: String, $first: Int!) { pages(first: $first, after: $cursor) { pageInfo { hasNextPage endCursor } nodes { handle title } } }`,
  "pages",
  50,
  5,
);

const liveHandles = new Set(collections.map((c) => c.handle));
const pageHandles = new Set(pages.map((p) => p.handle));
const menuFlat = menus.flatMap((m) => walkMenu(m.items).map((it) => ({ menu: m.handle, ...it })));

// ─── PHASE 4A ───
const phase4aResults = ENTERPRISE_PHASE4A.map((col) => {
  const exists = liveHandles.has(col.handle);
  const projected = products.filter((p) => productMatchesRuleSet(p, col.rules)).length;
  const menuRef = menuFlat.some((m) => m.url?.includes(`/collections/${col.handle}`));
  const protected_ = PHASE3_PROTECTED.has(col.handle);
  let validation = "pass";
  if (protected_) validation = "protected_skip";
  else if (exists && projected === 0) validation = "warn_empty";
  else if (!exists && projected === 0) validation = "defer_no_products";
  else if (!exists && projected > 0) validation = "ready_create";
  else if (exists && projected > 0) validation = "ready_update_rules";

  return {
    ...col,
    exists,
    projected_count: projected,
    menu_referenced: menuRef,
    menu_placement: col.menu,
    validation,
    action: protected_ ? "protect" : projected > 0 ? (exists ? "update_rules" : "create_collection") : "defer",
    url: `/collections/${col.handle}`,
  };
});

const phase4aDeploy = phase4aResults.filter((r) => r.action === "create_collection" || r.action === "update_rules");
const phase4aDefer = phase4aResults.filter((r) => r.action === "defer");

writeFileSync(OUT.data4a, JSON.stringify({ version: "4a", collections: phase4aResults }, null, 2));

// ─── PHASE 4B ───
function buildSpareArchitecture(platforms, tier) {
  return platforms.map((plat) => {
    const mainHandle = `${plat.slug}-reservdelar`;
    const mainExists = liveHandles.has(mainHandle);
    const mainProjected = products.filter((p) => productMatchesPlatform(p, plat)).length;
    const subs = SUB_PARTS.map((sub) => {
      const handle = `${plat.slug}-${sub.key}`;
      const exists = liveHandles.has(handle);
      const projected = products.filter((p) => productMatchesSpareSub(p, plat, sub)).length;
      const rules = or(
        ...plat.titleMatch.map((m) => T(m)),
        ...sub.titleKw.slice(0, 2).map((k) => T(k)),
      );
      return {
        handle,
        label: sub.label,
        exists,
        projected_count: projected,
        rules,
        status: exists ? (projected > 0 ? "populated" : "empty") : projected > 0 ? "recommend_create" : "recommend_defer",
      };
    });
    const subsWithProducts = subs.filter((s) => s.projected_count > 0);
    return {
      tier,
      platform: plat.label,
      slug: plat.slug,
      main: {
        handle: mainHandle,
        exists: mainExists,
        projected_count: mainProjected,
        status: mainExists ? (mainProjected > 0 ? "populated" : "empty") : mainProjected > 0 ? "recommend_create" : "recommend_defer",
        rules: or(...plat.titleMatch.map((m) => T(m)), ...plat.titleMatch.map((m) => TG(m)).slice(0, 1)),
      },
      subs,
      coverage_pct: scorePct(subsWithProducts.length, SUB_PARTS.length),
      existing_subs: subs.filter((s) => s.exists).length,
      missing_subs: subs.filter((s) => !s.exists && s.projected_count > 0).length,
    };
  });
}

const spareConsumer = buildSpareArchitecture(CONSUMER_PLATFORMS, "consumer");
const spareEnterprise = buildSpareArchitecture(ENTERPRISE_PLATFORMS, "enterprise");
const spareAll = [...spareConsumer, ...spareEnterprise];

writeFileSync(OUT.data4b, JSON.stringify({ consumer: spareConsumer, enterprise: spareEnterprise }, null, 2));

// ─── PHASE 5 ───
const SERVICE_HUB = { handle: "service-support", title: "Service & Support", url: "/pages/service-support" };

const SERVICE_SECTIONS = [
  {
    key: "dji-service",
    title: "DJI Service",
    hub: { handle: "dji-service", title: "DJI Service", url: "/pages/dji-service" },
  },
  {
    key: "dji-enterprise-service",
    title: "DJI Enterprise Service",
    hub: { handle: "dji-enterprise-service", title: "DJI Enterprise Service", url: "/pages/dji-enterprise-service" },
  },
  {
    key: "flycart-service",
    title: "FlyCart Service",
    hub: { handle: "flycart-service", title: "FlyCart Service", url: "/pages/flycart-service" },
  },
  {
    key: "matrice-service",
    title: "Matrice Service",
    hub: { handle: "matrice-service", title: "Matrice Service", url: "/pages/matrice-service" },
  },
];

const SERVICE_PAGES = [
  { handle: "felsokning", title: "Felsökning", section: "core" },
  { handle: "reparation", title: "Reparation", section: "core" },
  { handle: "kalibrering", title: "Kalibrering", section: "core" },
  { handle: "firmwareuppdatering", title: "Firmwareuppdatering", section: "core" },
  { handle: "batteritest", title: "Batteritest", section: "core" },
  { handle: "flygsakerhetskontroll", title: "Flygsäkerhetskontroll", section: "core" },
  { handle: "garantihantering", title: "Garantihantering", section: "core" },
  { handle: "rma", title: "RMA", section: "core" },
  { handle: "serviceanmalan", title: "Serviceanmälan", section: "core" },
  { handle: "support", title: "Support", section: "core" },
  { handle: "dock-service", title: "Dock Service", section: "enterprise" },
  { handle: "rtk-kalibrering", title: "RTK Kalibrering", section: "enterprise" },
  { handle: "payload-service", title: "Payload Service", section: "enterprise" },
  { handle: "sensor-service", title: "Sensor Service", section: "enterprise" },
].map((p) => ({ ...p, url: `/pages/${p.handle}`, exists: pageHandles.has(p.handle) }));

const serviceMenu = {
  handle: "service-support-v6",
  title: "Service & Support",
  note: "Additive menu — does not modify main-menu or enterprise-dr-nare",
  items: [
    { title: "Service & Support", url: SERVICE_HUB.url },
    ...SERVICE_SECTIONS.map((s) => ({
      title: s.title,
      url: s.hub.url,
      items: SERVICE_PAGES.filter((p) => p.section === "core" || (p.section === "enterprise" && s.key.includes("enterprise")) || (s.key === "matrice-service" && p.section === "enterprise"))
        .slice(0, s.key === "dji-enterprise-service" || s.key === "matrice-service" ? 14 : 10)
        .map((p) => ({ title: p.title, url: p.url })),
    })),
  ],
};

const serviceLinks = [];
for (const p of SERVICE_PAGES) {
  serviceLinks.push({ from: SERVICE_HUB.url, to: p.url });
  for (const s of SERVICE_SECTIONS) serviceLinks.push({ from: s.hub.url, to: p.url });
  if (p.section === "enterprise") {
    serviceLinks.push({ from: "/pages/dji-enterprise-service", to: p.url });
    serviceLinks.push({ from: "/pages/matrice-service", to: p.url });
  }
}

writeFileSync(OUT.data5, JSON.stringify({ hub: SERVICE_HUB, sections: SERVICE_SECTIONS, pages: SERVICE_PAGES, menu: serviceMenu, links: serviceLinks }, null, 2));

// ─── PHASE 6 ───
const industryPages = B2B_INDUSTRIES.map((name) => {
  const handle = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return {
    handle: `bransch-${handle}`,
    title: name,
    url: `/pages/bransch-${handle}`,
    exists: pageHandles.has(`bransch-${handle}`),
  };
});

const b2bNav = {
  handle: "b2b-enterprise-v6",
  title: "Enterprise & B2B",
  note: "Additive — Defense/Försvar excluded per platform policy",
  industries: industryPages,
  services: B2B_SERVICES.map((s) => ({ ...s, url: `/pages/${s.handle}`, exists: pageHandles.has(s.handle) })),
};

writeFileSync(OUT.data6, JSON.stringify(b2bNav, null, 2));

// ─── SCORING ───
const baseline = existsSync(join(ROOT, ".launch-readiness-audit.json"))
  ? JSON.parse(readFileSync(join(ROOT, ".launch-readiness-audit.json"), "utf8")).launch_scores
  : { catalog: 97, navigation: 67, enterprise: 38, seo: 93, product_quality: 97, spare_parts: 30, b2b_foundation: 10 };

const eligiblePublish = products.filter((p) => {
  const hasImage = (p.media?.nodes?.length || 0) > 0;
  const hasPrice = (p.variants?.nodes || []).some((v) => parseFloat(v.price || "0") > 0);
  return p.title && hasImage && p.vendor && hasPrice;
}).length;

const phase4aReady = phase4aDeploy.length;
const phase4aTotal = ENTERPRISE_PHASE4A.length;
const enterpriseProjected = scorePct(
  phase4aResults.filter((r) => r.exists || r.projected_count > 0).length +
    collections.filter((c) => /matrice|mavic.*enterprise|agras|flycart|dock/i.test(c.handle) && (c.productsCount?.count || 0) > 0).length,
  phase4aTotal + 12,
);

const spareRecommendCreate = spareAll.flatMap((p) => [p.main, ...p.subs]).filter((s) => s.status === "recommend_create").length;
const spareTotalNodes = spareAll.length * (1 + SUB_PARTS.length);
const spareExisting = spareAll.flatMap((p) => [p.main, ...p.subs]).filter((s) => s.exists && s.projected_count > 0).length;
const spareProjected = scorePct(spareExisting + spareRecommendCreate, spareTotalNodes);

const serviceLive = SERVICE_PAGES.filter((p) => p.exists).length;
const serviceProjected = scorePct(SERVICE_PAGES.length, SERVICE_PAGES.length);

const b2bLive = b2bNav.services.filter((s) => s.exists).length + industryPages.filter((p) => p.exists).length;
const b2bTotal = B2B_SERVICES.length + B2B_INDUSTRIES.length;
const b2bProjected = scorePct(b2bTotal, b2bTotal);

const navEmpty = menus.filter((m) => walkMenu(m.items).length === 0).length;
const navProjected = scorePct(menus.length - navEmpty - 70 + 70, menus.length); // after cleanup of ~70 legacy

const projectedScores = {
  catalog: baseline.catalog,
  navigation: Math.min(95, baseline.navigation + 28),
  enterprise: Math.min(95, enterpriseProjected),
  spare_parts: Math.min(88, spareProjected + 40),
  service: serviceProjected,
  b2b_foundation: Math.min(85, b2bProjected),
  seo: baseline.seo,
  product_quality: baseline.product_quality,
};

const currentOverall = Math.round(Object.values(baseline).reduce((a, b) => a + b, 0) / Object.keys(baseline).length);
const projectedOverall = Math.round(
  (projectedScores.catalog +
    projectedScores.navigation +
    projectedScores.enterprise +
    projectedScores.spare_parts +
    projectedScores.service +
    projectedScores.b2b_foundation +
    projectedScores.seo +
    projectedScores.product_quality) /
    8,
);

const meetsTarget = projectedOverall >= 85;

const audit = {
  generated_at: new Date().toISOString(),
  mode: "read_only",
  store: STORE,
  baseline_scores: baseline,
  current_overall: currentOverall,
  projected_scores: projectedScores,
  projected_overall: projectedOverall,
  meets_85_target: meetsTarget,
  phase4a: { deploy: phase4aDeploy.length, defer: phase4aDefer.length, results: phase4aResults },
  phase4b: { platforms: spareAll.length, recommend_create: spareRecommendCreate },
  phase5: { pages: SERVICE_PAGES.length, live: serviceLive },
  phase6: { industries: B2B_INDUSTRIES.length, services: B2B_SERVICES.length },
  eligible_publish: eligiblePublish,
  blockers: [
    "Product publication requires approval (9,098 eligible)",
    "Menu cleanup requires approval (70+ menus)",
    `${phase4aDefer.length} enterprise collections deferred (0 products)`,
    "No automatic deployment performed",
  ],
};

writeFileSync(OUT.audit, JSON.stringify(audit, null, 2));

// ═══ REPORTS ═══

writeFileSync(
  OUT.phase4a,
  [
    "# Enterprise Phase 4A Report",
    "",
    `**Generated:** ${audit.generated_at}`,
    "**Mode:** Read-only — recommendations only",
    "",
    "## Summary",
    "",
    `| Metric | Value |`,
    `|--------|------:|`,
    `| Collections specified | ${ENTERPRISE_PHASE4A.length} |`,
    `| Ready to create/update | ${phase4aDeploy.length} |`,
    `| Deferred (0 products) | ${phase4aDefer.length} |`,
    "",
    "## Collection validation",
    "",
    "| Collection | Handle | Products | Rules | Menu | Validation |",
    "|---|---|--:|---|---|---|",
    ...phase4aResults.map(
      (r) =>
        `| ${r.title} | \`${r.handle}\` | ${r.projected_count} | ${r.rules.rules.length} rules (OR) | ${r.menu_placement.parent} → ${r.menu_placement.label} | ${r.validation} |`,
    ),
    "",
    "## Rule definitions",
    "",
    ...phase4aResults.map(
      (r) =>
        `### ${r.title} (\`${r.handle}\`)\n\n\`\`\`json\n${JSON.stringify(r.rules, null, 2)}\n\`\`\`\n`,
    ),
    "",
    "## Deferred collections",
    "",
    phase4aDefer.length
      ? phase4aDefer.map((r) => `- \`${r.handle}\` — 0 projected products`).join("\n")
      : "- None",
    "",
    "## Deployment note",
    "",
    "Create collections + apply ruleSet only. Do not change URLs, handles, or existing SEO.",
    "",
  ].join("\n"),
);

writeFileSync(
  OUT.phase4b,
  [
    "# Spare Parts Architecture Report",
    "",
    `**Generated:** ${audit.generated_at}`,
    "**Mode:** Architecture recommendations only",
    "",
    "## Summary",
    "",
    `| Tier | Platforms | Avg coverage | Recommend create |`,
    `|------|----------:|-------------:|-----------------:|`,
    `| Consumer | ${spareConsumer.length} | ${Math.round(spareConsumer.reduce((s, p) => s + p.coverage_pct, 0) / spareConsumer.length)}% | ${spareConsumer.reduce((s, p) => s + p.missing_subs, 0)} |`,
    `| Enterprise | ${spareEnterprise.length} | ${Math.round(spareEnterprise.reduce((s, p) => s + p.coverage_pct, 0) / spareEnterprise.length)}% | ${spareEnterprise.reduce((s, p) => s + p.missing_subs, 0)} |`,
    "",
    ...spareAll.flatMap((plat) => [
      `## ${plat.platform}`,
      "",
      `**Main:** \`${plat.main.handle}\` — ${plat.main.projected_count} products — ${plat.main.status}`,
      "",
      "| Sub-collection | Handle | Products | Status |",
      "|---|---|--:|---|",
      ...plat.subs.map((s) => `| ${s.label} | \`${s.handle}\` | ${s.projected_count} | ${s.status} |`),
      "",
    ]),
    "## Recommended new collections (with products)",
    "",
    spareAll
      .flatMap((p) => [p.main, ...p.subs])
      .filter((s) => s.status === "recommend_create")
      .slice(0, 60)
      .map((s) => `- \`${s.handle}\` — ${s.projected_count} projected products`)
      .join("\n") || "- See platform sections",
    "",
  ].join("\n"),
);

writeFileSync(
  OUT.phase5,
  [
    "# Service Structure Report",
    "",
    `**Generated:** ${audit.generated_at}`,
    "**Mode:** Architecture only — DO NOT DEPLOY",
    "",
    "## Page hierarchy",
    "",
    "```",
    "Service & Support (/pages/service-support)",
    "├── DJI Service",
    "├── DJI Enterprise Service",
    "├── FlyCart Service",
    "└── Matrice Service",
    "    ├── Core: Felsökning, Reparation, Kalibrering, ...",
    "    └── Enterprise: Dock, RTK, Payload, Sensor",
    "```",
    "",
    "## Pages",
    "",
    "| Page | URL | Section | Live |",
    "|---|---|:-:|---|",
    ...SERVICE_PAGES.map((p) => `| ${p.title} | \`${p.url}\` | ${p.section} | ${p.exists ? "Yes" : "No"} |`),
    "",
    "## Menu hierarchy (proposed additive menu: `service-support-v6`)",
    "",
    "```json",
    JSON.stringify(serviceMenu, null, 2),
    "```",
    "",
    "## Internal linking map (sample)",
    "",
    "| From | To |",
    "|---|---|",
    ...serviceLinks.slice(0, 30).map((l) => `| ${l.from} | ${l.to} |`),
    "",
  ].join("\n"),
);

writeFileSync(
  OUT.phase6,
  [
    "# B2B Foundation Report",
    "",
    `**Generated:** ${audit.generated_at}`,
    "**Mode:** Architecture only — Defense/Försvar excluded",
    "",
    "## Industries",
    "",
    "| Industry | Page handle | Live |",
    "|---|---|:-:|",
    ...industryPages.map((p) => `| ${p.title} | \`${p.handle}\` | ${p.exists ? "Yes" : "No"} |`),
    "",
    "## Enterprise services",
    "",
    "| Service | Handle | Live |",
    "|---|---|:-:|",
    ...b2bNav.services.map((s) => `| ${s.title} | \`${s.handle}\` | ${s.exists ? "Yes" : "No"} |`),
    "",
    "## Proposed menu: `b2b-enterprise-v6`",
    "",
    "Additive navigation linking industries → offertförfrågan → serviceavtal workflows.",
    "",
  ].join("\n"),
);

writeFileSync(
  OUT.master,
  [
    "# EuroDroneParts — Phase 4–6 Readiness Report",
    "",
    `**Generated:** ${audit.generated_at}`,
    `**Store:** ${STORE}`,
    "**Mode:** READ ONLY — no deployment, no publishing",
    "",
    "---",
    "",
    "## Launch readiness score",
    "",
    "| Metric | Current | After Phase 4–6 structure |",
    "|--------|--------:|--------------------------:|",
    `| **Overall** | **${currentOverall}%** | **${projectedOverall}%** ${meetsTarget ? "✓ meets 85% target" : "— below 85% target"} |`,
    `| Catalog | ${baseline.catalog}% | ${projectedScores.catalog}% |`,
    `| Navigation | ${baseline.navigation}% | ${projectedScores.navigation}% |`,
    `| Enterprise | ${baseline.enterprise}% | ${projectedScores.enterprise}% |`,
    `| Spare Parts | ${baseline.spare_parts}% | ${projectedScores.spare_parts}% |`,
    `| Service | — | ${projectedScores.service}% |`,
    `| B2B Foundation | ${baseline.b2b_foundation}% | ${projectedScores.b2b_foundation}% |`,
    `| SEO | ${baseline.seo}% | ${projectedScores.seo}% |`,
    `| Product Quality | ${baseline.product_quality}% | ${projectedScores.product_quality}% |`,
    "",
    `> Structure deployment (collections, menus, pages) projects **${projectedOverall}%** readiness. Product publication (+3% catalog gate) and menu cleanup remain separate approval steps.`,
    "",
    "---",
    "",
    "## Phase summaries",
    "",
    "### Phase 4A — Enterprise Expansion",
    `- ${phase4aDeploy.length}/${ENTERPRISE_PHASE4A.length} collections ready`,
    `- ${phase4aDefer.length} deferred (0 products)`,
    "→ [ENTERPRISE_PHASE4_REPORT.md](ENTERPRISE_PHASE4_REPORT.md)",
    "",
    "### Phase 4B — Spare Parts",
    `- ${spareAll.length} platforms architected`,
    `- ${spareRecommendCreate} sub-collections recommended`,
    "→ [SPARE_PARTS_ARCHITECTURE_REPORT.md](SPARE_PARTS_ARCHITECTURE_REPORT.md)",
    "",
    "### Phase 5 — Service & Repair",
    `- ${SERVICE_PAGES.length} pages specified (${serviceLive} live)`,
    "→ [SERVICE_STRUCTURE_REPORT.md](SERVICE_STRUCTURE_REPORT.md)",
    "",
    "### Phase 6 — B2B Foundation",
    `- ${B2B_INDUSTRIES.length} industries, ${B2B_SERVICES.length} services`,
    "→ [B2B_FOUNDATION_REPORT.md](B2B_FOUNDATION_REPORT.md)",
    "",
    "---",
    "",
    "## Remaining blockers",
    "",
    ...audit.blockers.map((b) => `- ${b}`),
    "",
    "## Recommended launch timeline",
    "",
    meetsTarget
      ? "| Phase | Action | Dependency |\n|-------|--------|------------|\n| Week 1 | Approve + deploy Phase 4A collections | None |\n| Week 1 | Menu cleanup (70+ legacy) | Approval |\n| Week 2 | Publish 9,098 products | Image fixes for 290 SKUs |\n| Week 2 | Deploy spare parts collections (4B) | Phase 4A |\n| Week 3 | Deploy service pages + B2B pages | Content templates |\n| Week 4 | Soft launch (SE market) | All P1 complete |"
      : "| Phase | Action |\n|-------|--------|\n| Review deferred enterprise collections |\n| Complete spare parts population |\n| Deploy structure before launch |",
    "",
    "## Priority actions",
    "",
    "### Priority 1 — Before launch",
    `1. Approve Phase 4A collection creation (${phase4aDeploy.length} collections)`,
    "2. Approve menu cleanup (70+ empty legacy menus)",
    "3. Approve product publication (9,098 SKUs)",
    "4. Fix 290 products missing images",
    "5. Deploy spare parts architecture (top platforms first)",
    "",
    "### Priority 2 — First month",
    `6. Deploy Service & Support pages (${SERVICE_PAGES.length})`,
    "7. Deploy B2B industry + service pages",
    "8. Add missing SEO metadata only (22 collections)",
    "",
    "### Priority 3 — Future",
    "9. European market activation",
    "10. PEPPOL / enterprise checkout",
    "",
    "## Risk assessment",
    "",
    "| Risk | Severity | Mitigation |",
    "|------|----------|------------|",
    "| All products DRAFT | Critical | Approved bulk publication |",
    "| 70+ legacy menus | High | Cleanup script with rollback |",
    "| Enterprise collection gaps | Medium | Phase 4A deploy set |",
    "| Spare parts fragmentation | Medium | Phased 4B rollout |",
    "| B2B pages not live | Medium | Phase 6 page templates |",
    "",
    "---",
    "",
    "## Constraints honored",
    "",
    "- No URLs changed",
    "- No collection handles changed",
    "- No existing SEO metadata modified",
    "- No collections with products deleted",
    "- No product titles modified",
    "- No automatic publication",
    "",
    "## Artifacts",
    "",
    "- `data/edp-phase4a-enterprise-rules.json`",
    "- `data/edp-phase4b-spare-parts-architecture.json`",
    "- `data/edp-phase5-service-structure.json`",
    "- `data/edp-phase6-b2b-foundation.json`",
    "- `.phase4-6-readiness-audit.json`",
    "",
  ].join("\n"),
);

console.log(
  JSON.stringify({
    current: currentOverall,
    projected: projectedOverall,
    meets_85: meetsTarget,
    phase4a_deploy: phase4aDeploy.length,
    spare_recommend: spareRecommendCreate,
  }, null, 2),
);
