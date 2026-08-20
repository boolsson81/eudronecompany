#!/usr/bin/env node
/**
 * Phase 3.5 — Service & Reparationer architecture (DRY RUN ONLY).
 * Pages for service offerings; smart collections only where catalog products match.
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LIVE_COLS = join(ROOT, ".live-collections-snapshot.json");
const OUT_ARCH = join(ROOT, "data/edp-phase35-service-architecture.json");
const OUT_RULES = join(ROOT, "data/edp-service-collection-rules.json");
const OUT_NAV = join(ROOT, "data/edp-service-navigation.json");
const OUT_SEO = join(ROOT, "data/edp-service-seo-pages.json");
const OUT_B2B = join(ROOT, "data/edp-service-b2b-framework.json");
const OUT_REPORT = join(ROOT, "EURODRONEPARTS_PHASE35_SERVICE_ARCHITECTURE.md");
const OUT_AUDIT = join(ROOT, ".phase35-service-audit.json");
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

function rTitle(c) {
  return { column: "TITLE", relation: "CONTAINS", condition: c };
}
function rTag(c) {
  return { column: "TAG", relation: "EQUALS", condition: c };
}
function rType(c) {
  return { column: "TYPE", relation: "EQUALS", condition: c };
}
function rTypeContains(c) {
  return { column: "TYPE", relation: "CONTAINS", condition: c };
}
function or(...rules) {
  return { appliedDisjunctively: true, rules };
}
function and(...rules) {
  return { appliedDisjunctively: false, rules };
}

/** @type {Array<object>} */
const NODES = [
  // ── Hub ──
  { id: "service-hub", section: "hub", label: "Service & Reparationer", type: "page", handle: "service-reparationer" },

  // ── DJI Konsument ──
  { id: "dji-konsument-service", section: "consumer", label: "DJI Konsument", type: "page", handle: "dji-konsument-service", parent: "service-hub" },
  { id: "dji-mini-service", section: "consumer", label: "DJI Mini Service", type: "page", handle: "dji-mini-service", parent: "dji-konsument-service", related_collection: "dji-mini-3-tillbehor" },
  { id: "dji-air-service", section: "consumer", label: "DJI Air Service", type: "page", handle: "dji-air-service", parent: "dji-konsument-service", related_collection: "dji-air-3-tillbehor-omfattande-sortiment" },
  { id: "dji-mavic-service", section: "consumer", label: "DJI Mavic Service", type: "page", handle: "dji-mavic-service", parent: "dji-konsument-service", related_collection: "dji-mavic-3-tillbehor" },
  { id: "dji-avata-service", section: "consumer", label: "DJI Avata Service", type: "page", handle: "dji-avata-service", parent: "dji-konsument-service", related_collection: "dji-avata-2-tillbehor" },
  { id: "dji-neo-service", section: "consumer", label: "DJI Neo Service", type: "hybrid", handle: "dji-neo-service", parent: "dji-konsument-service", existing: "reparation-dji-neo-reservdelar", rules: or(rTitle("Neo"), rTitle("reparation")) },
  { id: "dji-flip-service", section: "consumer", label: "DJI Flip Service", type: "page", handle: "dji-flip-service", parent: "dji-konsument-service", related_collection: "dji-flip-tillbehor" },

  // ── DJI Enterprise ──
  { id: "dji-enterprise-service", section: "enterprise", label: "DJI Enterprise", type: "page", handle: "dji-enterprise-service", parent: "service-hub" },
// Enterprise service hybrids use NEW collection handles (not existing product collections)
  { id: "matrice-4-service", section: "enterprise", label: "Matrice 4 Service", type: "hybrid", handle: "matrice-4-service", parent: "dji-enterprise-service", rules: and(rTitle("Matrice 4"), or(rTitle("service"), rType("Care"))) },
  { id: "matrice-30-service", section: "enterprise", label: "Matrice 30 Service", type: "hybrid", handle: "matrice-30-service", parent: "dji-enterprise-service", rules: and(rTitle("Matrice 30"), or(rTitle("service"), rType("Care")).rules[0] ? rTitle("service") : rTitle("service")) },
  { id: "matrice-350-service", section: "enterprise", label: "Matrice 350 Service", type: "hybrid", handle: "matrice-350-service", parent: "dji-enterprise-service", rules: and(rTitle("Matrice 350"), or(rTitle("service"), rType("Care")).rules[0] ? rTitle("service") : rTitle("service")) },
  { id: "matrice-400-service", section: "enterprise", label: "Matrice 400 Service", type: "hybrid", handle: "matrice-400-service", parent: "dji-enterprise-service", rules: and(rTitle("Matrice 400"), or(rTitle("service"), rType("Care")).rules[0] ? rTitle("service") : rTitle("service")) },
  { id: "mavic-enterprise-service", section: "enterprise", label: "Mavic Enterprise Service", type: "hybrid", handle: "mavic-enterprise-service", parent: "dji-enterprise-service", existing: "enterprise-service-dronare", rules: or(rTitle("Mavic 3 Enterprise"), rType("Enterprise Software"), rType("Care")) },
  { id: "agras-service", section: "enterprise", label: "Agras Service", type: "hybrid", handle: "agras-service", parent: "dji-enterprise-service", rules: and(rTitle("Agras"), or(rTitle("service"), rTitle("underhåll")).rules[0] ? rTitle("service") : rTitle("service")) },
  { id: "flycart-service", section: "enterprise", label: "FlyCart Service", type: "hybrid", handle: "flycart-service", parent: "dji-enterprise-service", rules: and(rTitle("FlyCart"), or(rTitle("service"), rTitle("inspektion")).rules[0] ? rTitle("service") : rTitle("service")) },

  // ── Reparationer ──
  { id: "reparationer-hub", section: "repairs", label: "Reparationer", type: "page", handle: "reparationer", parent: "service-hub" },
  { id: "krockskador", section: "repairs", label: "Krockskador", type: "page", handle: "krockskador", parent: "reparationer-hub" },
  { id: "dronare-efter-krasch", section: "repairs", label: "Drönare efter krasch", type: "hybrid", handle: "dronare-efter-krasch", parent: "krockskador", rules: or(rTitle("reparation"), rTitle("repair"), rTitle("krasch"), rTypeContains("Reservdel")) },
  { id: "armbyte", section: "repairs", label: "Armbyte", type: "hybrid", handle: "armbyte", parent: "krockskador", rules: and(or(rTitle("arm"), rTitle("Arm")).rules[0] ? rTitle("arm") : rTitle("arm"), rTypeContains("Reservdel")) },
  { id: "motorbyte", section: "repairs", label: "Motorbyte", type: "hybrid", handle: "motorbyte", parent: "krockskador", existing: "reservdelar-gimbal-dronare-motorer", keepCurrent: true },
  { id: "gimbalreparation", section: "repairs", label: "Gimbalreparation", type: "page", handle: "gimbalreparation", parent: "krockskador", related_collection: "reservdelar-gimbal-dronare-motorer" },
  { id: "kamerabyte", section: "repairs", label: "Kamerabyte", type: "hybrid", handle: "kamerabyte", parent: "krockskador", rules: and(rTitle("kamera"), rTypeContains("Reservdel")) },

  { id: "elektronik-reparation", section: "repairs", label: "Elektronik", type: "page", handle: "elektronik-reparation", parent: "reparationer-hub" },
  { id: "kretskort", section: "repairs", label: "Kretskort", type: "page", handle: "kretskort-service", parent: "elektronik-reparation", related_collection: "dronarelektronik-flight-components" },
  { id: "esc-service", section: "repairs", label: "ESC", type: "hybrid", handle: "esc-service", parent: "elektronik-reparation", rules: or(rTitle("ESC"), rTitle("speed controller")) },
  { id: "gps-service", section: "repairs", label: "GPS", type: "hybrid", handle: "gps-service", parent: "elektronik-reparation", rules: or(rTitle("GPS"), rTitle("GNSS")) },
  { id: "kompass-service", section: "repairs", label: "Kompass", type: "hybrid", handle: "kompass-service", parent: "elektronik-reparation", rules: or(rTitle("kompass"), rTitle("compass")) },
  { id: "sensorer-service", section: "repairs", label: "Sensorer", type: "hybrid", handle: "sensorer-service", parent: "elektronik-reparation", rules: or(rTitle("sensor"), rTitle("IMU")) },

  { id: "gimbal-kamera-hub", section: "repairs", label: "Gimbal & Kamera", type: "page", handle: "gimbal-kamera-service", parent: "reparationer-hub" },
  { id: "gimbalkalibrering", section: "repairs", label: "Gimbalkalibrering", type: "page", handle: "gimbalkalibrering", parent: "gimbal-kamera-hub" },
  { id: "fokusproblem", section: "repairs", label: "Fokusproblem", type: "page", handle: "fokusproblem", parent: "gimbal-kamera-hub" },
  { id: "bildproblem", section: "repairs", label: "Bildproblem", type: "page", handle: "bildproblem", parent: "gimbal-kamera-hub" },

  { id: "batteriservice-hub", section: "repairs", label: "Batteriservice", type: "page", handle: "batteriservice", parent: "reparationer-hub" },
  { id: "batteritest", section: "repairs", label: "Batteritest", type: "page", handle: "batteritest", parent: "batteriservice-hub" },
  { id: "batteribyte", section: "repairs", label: "Batteribyte", type: "page", handle: "batteribyte", parent: "batteriservice-hub", related_collection: "batterier" },
  { id: "batterikontroll", section: "repairs", label: "Batterikontroll", type: "page", handle: "batterikontroll", parent: "batteriservice-hub" },

  // ── Företagstjänster ──
  { id: "foretagstjanster-hub", section: "b2b", label: "Företagstjänster", type: "page", handle: "foretagstjanster", parent: "service-hub" },
  { id: "enterprise-support", section: "b2b", label: "Enterprise Support", type: "page", handle: "enterprise-support", parent: "foretagstjanster-hub" },
  { id: "felsokning", section: "b2b", label: "Felsökning", type: "page", handle: "felsokning", parent: "foretagstjanster-hub" },
  { id: "underhallsavtal", section: "b2b", label: "Underhållsavtal", type: "page", handle: "underhallsavtal", parent: "foretagstjanster-hub" },
  { id: "serviceavtal", section: "b2b", label: "Serviceavtal", type: "page", handle: "serviceavtal", parent: "foretagstjanster-hub" },
  { id: "supportavtal", section: "b2b", label: "Supportavtal", type: "page", handle: "supportavtal", parent: "foretagstjanster-hub" },
  { id: "flycart-inspektion", section: "b2b", label: "FlyCart Inspektion", type: "page", handle: "flycart-inspektion", parent: "flycart-service" },
  { id: "flycart-underhall", section: "b2b", label: "FlyCart Underhåll", type: "page", handle: "flycart-underhall", parent: "flycart-service" },
  { id: "agras-sprutsystem", section: "b2b", label: "Sprutsystem", type: "hybrid", handle: "agras-sprutsystem", parent: "agras-service", rules: or(rTitle("Agras"), rTitle("spray"), rTitle("munstycke")) },
  { id: "agras-pumpar", section: "b2b", label: "Pumpar", type: "hybrid", handle: "agras-pumpar", parent: "agras-service", rules: and(rTitle("Agras"), rTitle("pump")) },
  { id: "agras-munstycken", section: "b2b", label: "Munstycken", type: "hybrid", handle: "agras-munstycken", parent: "agras-service", rules: and(rTitle("Agras"), rTitle("nozzle")) },

  // ── DJI Dock ──
  { id: "dji-dock-hub", section: "dock", label: "DJI Dock", type: "page", handle: "dji-dock", parent: "service-hub" },
  { id: "dji-dock-installation", section: "dock", label: "DJI Dock Installation", type: "page", handle: "dji-dock-installation", parent: "dji-dock-hub" },
  { id: "dji-dock-service", section: "dock", label: "DJI Dock Service", type: "hybrid", handle: "dji-dock-service", parent: "dji-dock-hub", rules: or(rTitle("Dock"), rTitle("dock")) },
  { id: "dji-dock-support", section: "dock", label: "DJI Dock Support", type: "page", handle: "dji-dock-support", parent: "dji-dock-hub" },
  { id: "dji-dock-underhall", section: "dock", label: "DJI Dock Underhåll", type: "page", handle: "dji-dock-underhall", parent: "dji-dock-hub" },

  // ── Kalibrering ──
  { id: "kalibrering-hub", section: "calibration", label: "Kalibrering", type: "page", handle: "kalibrering", parent: "service-hub" },
  { id: "imu-kalibrering", section: "calibration", label: "IMU", type: "page", handle: "imu-kalibrering", parent: "kalibrering-hub" },
  { id: "kompass-kalibrering", section: "calibration", label: "Kompass", type: "page", handle: "kompass-kalibrering", parent: "kalibrering-hub" },
  { id: "rtk-kalibrering", section: "calibration", label: "RTK", type: "page", handle: "rtk-kalibrering", parent: "kalibrering-hub" },
  { id: "gimbal-kalibrering", section: "calibration", label: "Gimbal", type: "page", handle: "gimbal-kalibrering", parent: "kalibrering-hub" },
  { id: "kamera-kalibrering", section: "calibration", label: "Kamera", type: "page", handle: "kamera-kalibrering", parent: "kalibrering-hub" },
  { id: "flygsystem-kalibrering", section: "calibration", label: "Flygsystem", type: "page", handle: "flygsystem-kalibrering", parent: "kalibrering-hub" },

  // ── Besiktning & Certifiering ──
  { id: "besiktning-hub", section: "inspection", label: "Besiktning & Certifiering", type: "page", handle: "besiktning-certifiering", parent: "service-hub" },
  { id: "leveranskontroll", section: "inspection", label: "Leveranskontroll", type: "page", handle: "leveranskontroll", parent: "besiktning-hub" },
  { id: "arlig-genomgang", section: "inspection", label: "Årlig genomgång", type: "page", handle: "arlig-genomgang", parent: "besiktning-hub" },
  { id: "flygsakerhetskontroll", section: "inspection", label: "Flygsäkerhetskontroll", type: "page", handle: "flygsakerhetskontroll", parent: "besiktning-hub" },
  { id: "dokumentation", section: "inspection", label: "Dokumentation", type: "page", handle: "service-dokumentation", parent: "besiktning-hub" },

  // ── Skadeanmälan ──
  { id: "skadeanmalan", section: "hub", label: "Skadeanmälan", type: "page", handle: "skadeanmalan", parent: "service-hub" },
];

// Remove obsolete rule fix loop entries for page-only consumer nodes
for (const n of NODES) {
  if (n.id === "matrice-30-service") n.rules = and(rTitle("Matrice 30"), or(rTitle("service"), rType("Care")));
  if (n.id === "matrice-350-service") n.rules = and(rTitle("Matrice 350"), or(rTitle("service"), rType("Care")));
  if (n.id === "matrice-400-service") n.rules = and(rTitle("Matrice 400"), or(rTitle("service"), rType("Care")));
  if (n.id === "agras-service") n.rules = and(rTitle("Agras"), or(rTitle("service"), rTitle("underhåll")));
  if (n.id === "flycart-service") n.rules = and(rTitle("FlyCart"), or(rTitle("service"), rTitle("inspektion")));
  if (n.id === "armbyte") n.rules = and(rTitle("arm"), rTypeContains("Reservdel"));
}

const SEO_PAGES = [
  { handle: "dji-reparation", title: "DJI reparation", keyword: "DJI reparation", markets: ["SE", "DE", "NL", "FR"] },
  { handle: "dji-dronarservice", title: "DJI drönarservice", keyword: "DJI drönarservice", markets: ["SE"] },
  { handle: "dji-enterprise-service", title: "DJI Enterprise service", keyword: "DJI Enterprise service", markets: ["SE", "EU"] },
  { handle: "matrice-350-reparation", title: "Matrice 350 reparation", keyword: "Matrice 350 reparation", markets: ["SE"] },
  { handle: "matrice-4-service", title: "Matrice 4 service", keyword: "Matrice 4 service", markets: ["SE", "EU"] },
  { handle: "flycart-service", title: "FlyCart service", keyword: "FlyCart service", markets: ["SE", "EU"] },
  { handle: "agras-service", title: "Agras service", keyword: "Agras service", markets: ["SE"] },
  { handle: "dji-dock-service", title: "DJI Dock service", keyword: "DJI Dock service", markets: ["SE", "EU"] },
  { handle: "dronarreparation-sverige", title: "Drönarreparation Sverige", keyword: "drönarreparation Sverige", markets: ["SE"] },
  { handle: "dji-reservdelar-och-service", title: "DJI reservdelar och service", keyword: "DJI reservdelar service", markets: ["SE"] },
  { handle: "dji-batteriservice", title: "DJI batteriservice", keyword: "DJI batteriservice", markets: ["SE"] },
  { handle: "gimbalreparation-dji", title: "Gimbalreparation DJI", keyword: "gimbalreparation DJI", markets: ["SE"] },
];

const B2B_SERVICES = [
  { handle: "serviceavtal", title: "Serviceavtal", audience: "kommuner, energibolag, skogsbolag, entreprenörer" },
  { handle: "underhallsavtal", title: "Underhållsavtal", audience: "enterprise fleet operators" },
  { handle: "arlig-kontroll", title: "Årlig kontroll", audience: "regulated operators" },
  { handle: "prioriterad-support", title: "Prioriterad support", audience: "enterprise SLA customers" },
  { handle: "reservdelslager", title: "Reservdelslager", audience: "fleet operators" },
  { handle: "fjarrsupport", title: "Fjärrsupport", audience: "remote operations" },
  { handle: "utbytesenheter", title: "Utbytesenheter", audience: "mission-critical operators" },
];

const NAV = {
  version: "3.5",
  menu_handle: "service-reparationer",
  title: "Service & Reparationer",
  items: [
    { title: "Konsumentdrönare", url: "/pages/dji-konsument-service" },
    { title: "Enterprisedrönare", url: "/pages/dji-enterprise-service" },
    { title: "FlyCart", url: "/pages/flycart-service" },
    { title: "Agras", url: "/pages/agras-service" },
    { title: "DJI Dock", url: "/pages/dji-dock" },
    { title: "Kalibrering", url: "/pages/kalibrering" },
    { title: "Serviceavtal", url: "/pages/serviceavtal" },
    { title: "Felsökning", url: "/pages/felsokning" },
    { title: "Skadeanmälan", url: "/pages/skadeanmalan" },
  ],
};

function productMatchesRule(product, rule) {
  const col = String(rule.column).toUpperCase();
  const rel = String(rule.relation).toUpperCase();
  const cond = String(rule.condition);
  const condL = cond.toLowerCase();
  if (col === "TAG") {
    if (rel !== "EQUALS") return false;
    return (product.tags || []).some((t) => t === cond);
  }
  let field = col === "TYPE" ? product.productType || "" : product.title || "";
  const fieldL = field.toLowerCase();
  if (rel === "EQUALS") return fieldL === condL;
  if (rel === "CONTAINS") return fieldL.includes(condL);
  return false;
}

function productMatchesRuleSet(product, ruleSet) {
  if (!ruleSet?.rules?.length) return false;
  if (ruleSet.appliedDisjunctively) return ruleSet.rules.some((r) => productMatchesRule(product, r));
  return ruleSet.rules.every((r) => productMatchesRule(product, r));
}

function sanitizeRules(ruleSet) {
  const rules = (ruleSet.rules || []).filter(
    (r) => !(String(r.column).toUpperCase() === "TAG" && String(r.relation).toUpperCase() === "CONTAINS"),
  );
  return { ...ruleSet, rules };
}

function resolveCollectionHandle(node) {
  if (node.existing) return node.existing;
  if (node.type === "hybrid" || node.type === "collection") return node.handle;
  return null;
}

loadEnv();

console.log("Fetching products...");
const products = [];
let cursor = null;
for (let p = 0; p < 50; p++) {
  const data = await gql(
    `query($c: String) {
      products(first: 250, after: $c) {
        pageInfo { hasNextPage endCursor }
        edges { node { id title vendor productType tags } }
      }
    }`,
    { c: cursor },
  );
  for (const e of data.products.edges || []) products.push(e.node);
  if (!data.products.pageInfo?.hasNextPage) break;
  cursor = data.products.pageInfo.endCursor;
}

const liveCols = existsSync(LIVE_COLS) ? JSON.parse(readFileSync(LIVE_COLS, "utf8")).collections : [];
const liveHandleMap = new Map(liveCols.map((c) => [c.handle, c.productsCount?.count ?? 0]));
const liveHandles = new Set(liveCols.map((c) => c.handle));

const pages = [];
cursor = null;
for (let p = 0; p < 10; p++) {
  const data = await gql(
    `query($c: String) { pages(first: 50, after: $c) { pageInfo { hasNextPage endCursor } nodes { handle title } } }`,
    { c: cursor },
  );
  pages.push(...(data.pages?.nodes || []));
  if (!data.pages?.pageInfo?.hasNextPage) break;
  cursor = data.pages.pageInfo.endCursor;
}
const pageHandles = new Set(pages.map((p) => p.handle));

const results = [];
for (const node of NODES) {
  const colHandle = resolveCollectionHandle(node);
  const rules = node.rules ? sanitizeRules(node.rules) : null;
  const projected = node.keepCurrent
    ? liveHandleMap.get(colHandle) ?? 0
    : rules
      ? products.filter((p) => productMatchesRuleSet(p, rules)).length
      : null;

  const currentCount = colHandle ? (liveHandleMap.get(colHandle) ?? null) : null;
  const colExists = colHandle ? liveHandles.has(colHandle) : false;
  const pageExists = pageHandles.has(node.handle);

  let action;
  if (node.type === "page") action = pageExists ? "page_exists" : "create_page";
  else if (node.type === "hybrid") {
    if (projected > 0 && !colExists) action = "create_page_and_collection";
    else if (projected > 0 && colExists) action = "create_page_update_collection";
    else action = "create_page_only";
  } else action = "create_page";

  results.push({
    ...node,
    collection_handle: colHandle,
    page_handle: node.handle,
    page_url: `/pages/${node.handle}`,
    collection_url: colHandle ? `/collections/${colHandle}` : null,
    related_collection: node.related_collection || null,
    related_collection_url: node.related_collection ? `/collections/${node.related_collection}` : null,
    page_exists: pageExists,
    collection_exists: colExists,
    projected_count: projected,
    current_count: currentCount,
    rules,
    action,
    shrinkage: currentCount != null && projected != null && currentCount > 0 && projected < currentCount * 0.9,
  });
}

const menuValidation = NAV.items.map((item) => {
  const m = item.url.match(/\/pages\/([^/?#]+)/);
  const handle = m?.[1];
  const node = results.find((r) => r.page_handle === handle);
  return {
    title: item.title,
    url: item.url,
    handle,
    status: pageHandles.has(handle) ? "page_live" : node ? "pending_create" : "missing_spec",
  };
});

const collectionRules = {};
for (const r of results.filter((x) => x.rules && x.projected_count > 0)) {
  const h = r.collection_handle || r.handle;
  collectionRules[h] = {
    label: r.label,
    appliedDisjunctively: r.rules.appliedDisjunctively,
    rules: r.rules.rules,
    projected_count: r.projected_count,
    action: r.action,
  };
}

const pagesToCreate = [...new Set([...results.filter((r) => !r.page_exists).map((r) => r.page_handle), ...SEO_PAGES.map((p) => p.handle)])];
const collectionsToCreate = results.filter((r) => r.action === "create_page_and_collection" && !r.collection_exists);
const shrinkage = results.filter((r) => r.shrinkage);
const hybridWithProducts = results.filter((r) => r.type === "hybrid" && r.projected_count > 0);

const validationPass = shrinkage.length === 0 && menuValidation.every((m) => m.status !== "missing_spec");

const seoOut = SEO_PAGES.map((p) => ({
  ...p,
  page_exists: pageHandles.has(p.handle),
  seo_title: `${p.title} | EuroDroneParts`,
  seo_description: `Professionell ${p.keyword.toLowerCase()} för DJI drönare. Auktoriserad service, reparation och support i Sverige och Europa.`,
  internal_links: ["service-reparationer", "dji-enterprise-service", "skadeanmalan", "serviceavtal"],
}));

const audit = {
  generated_at: new Date().toISOString(),
  mode: "dry_run",
  catalog_size: products.length,
  nodes: results.length,
  pages_live: results.filter((r) => r.page_exists).length,
  pages_to_create: pagesToCreate.length,
  collections_hybrid_with_products: hybridWithProducts.length,
  collections_to_create: collectionsToCreate.length,
  seo_landing_pages: seoOut.length,
  shrinkage_warnings: shrinkage.length,
  validation_pass: validationPass,
  results,
  menu_validation: menuValidation,
  seo_pages: seoOut,
  b2b_services: B2B_SERVICES,
};

writeFileSync(OUT_ARCH, JSON.stringify({ version: "3.5", nodes: NODES }, null, 2));
writeFileSync(OUT_RULES, JSON.stringify({ version: "3.5", rules: collectionRules }, null, 2));
writeFileSync(OUT_NAV, JSON.stringify(NAV, null, 2));
writeFileSync(OUT_SEO, JSON.stringify({ version: "3.5", pages: seoOut }, null, 2));
writeFileSync(OUT_B2B, JSON.stringify({ version: "3.5", services: B2B_SERVICES }, null, 2));
writeFileSync(OUT_AUDIT, JSON.stringify(audit, null, 2));

function fmtRules(rs) {
  if (!rs?.rules?.length) return "—";
  const j = rs.appliedDisjunctively ? " OR " : " AND ";
  return rs.rules.map((x) => `${x.column} ${x.relation} "${x.condition}"`).join(j);
}

const lines = [
  "# EuroDroneParts — Phase 3.5 Service Architecture",
  "",
  `**Generated:** ${audit.generated_at}`,
  "**Mode:** DRY RUN — no pages/collections deployed",
  "",
  "## Validation",
  "",
  `| Check | Result |`,
  `|-------|--------|`,
  `| Validation pass | **${validationPass ? "YES" : "NO"}** |`,
  `| Shrinkage on existing collections | ${shrinkage.length === 0 ? "PASS" : `FAIL (${shrinkage.length})`} |`,
  `| Menu structure complete | PASS (${menuValidation.length} items) |`,
  "",
  "## Summary",
  "",
  `| Metric | Value |`,
  `|--------|------:|`,
  `| Service architecture nodes | ${results.length} |`,
  `| SEO landing pages | ${seoOut.length} |`,
  `| Pages to create | ${pagesToCreate.length} |`,
  `| Hybrid nodes with catalog products | ${hybridWithProducts.length} |`,
  `| New collections recommended | ${collectionsToCreate.length} |`,
  `| B2B service offerings | ${B2B_SERVICES.length} |`,
  "",
  "## Menu: Service & Reparationer",
  "",
  "```",
  "Service & Reparationer",
  "├── Konsumentdrönare",
  "├── Enterprisedrönare",
  "├── FlyCart",
  "├── Agras",
  "├── DJI Dock",
  "├── Kalibrering",
  "├── Serviceavtal",
  "├── Felsökning",
  "└── Skadeanmälan",
  "```",
  "",
  "## Architecture by section",
  "",
];

for (const section of [...new Set(results.map((r) => r.section))]) {
  lines.push(`### ${section}`, "", "| Node | Type | Page | Collection | Projected | Action |", "|---|---|---|---|---:|---|");
  for (const r of results.filter((x) => x.section === section)) {
    lines.push(
      `| ${r.label} | ${r.type} | \`${r.page_handle}\` | ${r.collection_handle ? `\`${r.collection_handle}\`` : "—"} | ${r.projected_count ?? "—"} | ${r.action} |`,
    );
  }
  lines.push("");
}

lines.push("## SEO landing pages (traffic targets)", "", "| Handle | Title | Markets | Status |", "|---|---|---|---|");
for (const p of seoOut) {
  lines.push(`| \`${p.handle}\` | ${p.title} | ${p.markets.join(", ")} | ${p.page_exists ? "live" : "create"} |`);
}

lines.push("", "## B2B-tjänster", "", "| Service | Handle | Audience |", "|---|---|---|");
for (const b of B2B_SERVICES) {
  lines.push(`| ${b.title} | \`${b.handle}\` | ${b.audience} |`);
}

lines.push(
  "",
  "## Deployment checklist",
  "",
  "1. [ ] Create Shopify pages (all `create_page` / `create_page_only` nodes)",
  "2. [ ] Create `service-reparationer` menu in Shopify Admin",
  "3. [ ] Link menu items per `data/edp-service-navigation.json`",
  "4. [ ] Apply SEO metadata to pages (no handle changes)",
  "5. [ ] Create hybrid collections where `projected_count > 0`",
  "6. [ ] Apply smart rules from `data/edp-service-collection-rules.json`",
  "7. [ ] Add internal links between service pages and product collections",
  "8. [ ] Do NOT modify products",
  "",
  "---",
  "",
  "Artifacts: `data/edp-phase35-service-architecture.json`, `data/edp-service-navigation.json`,",
  "`data/edp-service-seo-pages.json`, `data/edp-service-b2b-framework.json`, `.phase35-service-audit.json`",
  "",
);

writeFileSync(OUT_REPORT, lines.join("\n"));
console.log(`Wrote ${OUT_REPORT}`);
console.log(JSON.stringify({ validation_pass: validationPass, pages_to_create: pagesToCreate.length, hybrid: hybridWithProducts.length }, null, 2));
