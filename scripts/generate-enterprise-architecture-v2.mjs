#!/usr/bin/env node
/**
 * EuroDroneParts — Enterprise Architecture V2 generator + validator (DRY RUN ONLY).
 * Produces rules, navigation, SEO inventory, sitemap, validation report.
 * Does NOT create collections, edit products, or deploy to Shopify.
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LIVE_COLS = join(ROOT, ".live-collections-snapshot.json");
const OUT_ARCH = join(ROOT, "data/edp-enterprise-architecture-v2.json");
const OUT_RULES = join(ROOT, "data/edp-smart-collection-rules.json");
const OUT_NAV = join(ROOT, "data/edp-navigation-structure.json");
const OUT_MAP = join(ROOT, "data/edp-collection-menu-mapping.json");
const OUT_TAGS = join(ROOT, "data/edp-product-tag-standards.json");
const OUT_SEO = join(ROOT, "data/edp-industry-seo-framework.json");
const OUT_SITEMAP = join(ROOT, "EURODRONEPARTS_SITEMAP_V2.json");
const OUT_REPORT = join(ROOT, "EURODRONEPARTS_ENTERPRISE_ARCHITECTURE_V2.md");
const OUT_AUDIT = join(ROOT, ".enterprise-architecture-v2-audit.json");
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
function rVendor(c) {
  return { column: "VENDOR", relation: "CONTAINS", condition: c };
}
function or(...rules) {
  return { appliedDisjunctively: true, rules };
}
function and(...rules) {
  return { appliedDisjunctively: false, rules };
}

const PHASE3_RULES = existsSync(join(ROOT, "data/edp-phase3-population-rules.json"))
  ? JSON.parse(readFileSync(join(ROOT, "data/edp-phase3-population-rules.json"), "utf8"))
  : {};

function phase3RuleForHandle(handle) {
  for (const group of Object.values(PHASE3_RULES)) {
    if (group && typeof group === "object" && group[handle]?.rules) return group[handle];
  }
  return null;
}

/** Architecture nodes: existing_handle overrides proposed handle when set */
const ARCHITECTURE = [
  // ── 1. Enterprise DJI ──
  { id: "matrice-4-series", section: "enterprise_dji", label: "Matrice 4 Series", existing: "dji-matrice-4-serie", rules: or(rTitle("Matrice 4"), rTag("DJI Matrice 4"), rTag("DJI Matrice 4 Series")) },
  { id: "matrice-4e", section: "enterprise_dji", label: "Matrice 4E", proposed: "matrice-4e", rules: or(rTitle("Matrice 4E"), rTitle("Matrice 4 E")) },
  { id: "matrice-4t", section: "enterprise_dji", label: "Matrice 4T", proposed: "matrice-4t", rules: or(rTitle("Matrice 4T"), rTag("Matrice 4TD"), rTag("DJI Matrice 4T")) },
  { id: "matrice-4-accessories", section: "enterprise_dji", label: "Matrice 4 Accessories", existing: "dji-matrice-4-tillbehor", rules: and(rType("Enterprise Tillbehör"), rTitle("Matrice 4")) },
  { id: "matrice-4-spare-parts", section: "enterprise_dji", label: "Matrice 4 Spare Parts", proposed: "matrice-4-spare-parts", rules: and(rTypeContains("Reservdel"), rTitle("Matrice 4")) },

  { id: "matrice-30", section: "enterprise_dji", label: "Matrice 30", existing: "dji-matrice-30-serie-tillbehor", rules: or(rTitle("Matrice 30"), rTitle("M30"), rTag("Matrice 30")) },
  { id: "matrice-30t", section: "enterprise_dji", label: "Matrice 30T", proposed: "matrice-30t", rules: or(rTitle("Matrice 30T"), rTag("Matrice 30T")) },
  { id: "matrice-30-accessories", section: "enterprise_dji", label: "Matrice 30 Accessories", proposed: "matrice-30-accessories", rules: and(rType("Enterprise Tillbehör"), rTitle("Matrice 30")) },
  { id: "matrice-30-spare-parts", section: "enterprise_dji", label: "Matrice 30 Spare Parts", proposed: "matrice-30-spare-parts", rules: and(rTypeContains("Reservdel"), rTitle("Matrice 30")) },

  { id: "matrice-300-rtk", section: "enterprise_dji", label: "Matrice 300 RTK", proposed: "matrice-300-rtk", rules: or(rTitle("Matrice 300"), rTag("Matrice 300 RTK")) },
  { id: "matrice-300-batteries", section: "enterprise_dji", label: "Matrice 300 Batteries", proposed: "matrice-300-batteries", rules: and(rTitle("Matrice 300"), rTitle("Batter")) },
  { id: "matrice-300-propellers", section: "enterprise_dji", label: "Matrice 300 Propellers", proposed: "matrice-300-propellers", rules: and(rTitle("Matrice 300"), rTitle("Propell")) },
  { id: "matrice-300-spare-parts", section: "enterprise_dji", label: "Matrice 300 Spare Parts", proposed: "matrice-300-spare-parts", rules: and(rTypeContains("Reservdel"), rTitle("Matrice 300")) },
  { id: "zenmuse-h20", section: "enterprise_dji", label: "Zenmuse H20", proposed: "zenmuse-h20", rules: or(rTitle("Zenmuse H20")) },
  { id: "zenmuse-h20t", section: "enterprise_dji", label: "Zenmuse H20T", proposed: "zenmuse-h20t", rules: or(rTitle("Zenmuse H20T"), rTitle("H20T")) },
  { id: "zenmuse-p1", section: "enterprise_dji", label: "Zenmuse P1", proposed: "zenmuse-p1", rules: or(rTitle("Zenmuse P1"), rTitle("P1")) },
  { id: "zenmuse-l1", section: "enterprise_dji", label: "Zenmuse L1", proposed: "zenmuse-l1", rules: or(rTitle("Zenmuse L1")) },

  { id: "matrice-350-rtk", section: "enterprise_dji", label: "Matrice 350 RTK", existing: "dji-matrice-350-rtk-tillbehor", rules: or(rTitle("Matrice 350"), rTitle("M350"), rTag("DJI Matrice 350 RTK"), rTag("Matrice 350 RTK")) },
  { id: "matrice-350-batteries", section: "enterprise_dji", label: "Matrice 350 Batteries", proposed: "matrice-350-batteries", rules: and(rTitle("Matrice 350"), rTitle("Batter")) },
  { id: "matrice-350-propellers", section: "enterprise_dji", label: "Matrice 350 Propellers", proposed: "matrice-350-propellers", rules: and(rTitle("Matrice 350"), rTitle("Propell")) },
  { id: "matrice-350-spare-parts", section: "enterprise_dji", label: "Matrice 350 Spare Parts", proposed: "matrice-350-spare-parts", rules: and(rTypeContains("Reservdel"), rTitle("Matrice 350")) },

  { id: "matrice-400", section: "enterprise_dji", label: "Matrice 400", existing: "dji-matrice-400-serien", rules: or(rTitle("Matrice 400"), rTitle("M400")) },
  { id: "matrice-400-accessories", section: "enterprise_dji", label: "Matrice 400 Accessories", proposed: "matrice-400-accessories", rules: and(rType("Enterprise Tillbehör"), rTitle("Matrice 400")) },
  { id: "matrice-400-spare-parts", section: "enterprise_dji", label: "Matrice 400 Spare Parts", proposed: "matrice-400-spare-parts", rules: and(rTypeContains("Reservdel"), rTitle("Matrice 400")) },

  { id: "matrice-3-series", section: "enterprise_dji", label: "Matrice 3 Series", proposed: "matrice-3-series", rules: or(rTag("DJI Matrice 3D"), rTag("DJI Matrice 3TD"), rTitle("Matrice 3D"), rTitle("Matrice 3TD")) },
  { id: "matrice-3d", section: "enterprise_dji", label: "Matrice 3D", proposed: "matrice-3d", rules: or(rTitle("Matrice 3D"), rTag("DJI Matrice 3D")) },
  { id: "matrice-3td", section: "enterprise_dji", label: "Matrice 3TD", proposed: "matrice-3td", rules: or(rTitle("Matrice 3TD"), rTag("DJI Matrice 3TD")) },
  { id: "dji-dock-2", section: "enterprise_dji", label: "DJI Dock 2", proposed: "dji-dock-2", rules: or(rTitle("Dock 2"), rTitle("Dock 3"), rTitle("DJI Dock")) },
  { id: "matrice-3-accessories", section: "enterprise_dji", label: "Matrice 3 Accessories", proposed: "matrice-3-accessories", rules: and(rType("Enterprise Tillbehör"), rTitle("Matrice 3")) },
  { id: "matrice-3-spare-parts", section: "enterprise_dji", label: "Matrice 3 Spare Parts", proposed: "matrice-3-spare-parts", rules: and(rTypeContains("Reservdel"), rTitle("Matrice 3")) },

  { id: "mavic-3-enterprise", section: "enterprise_dji", label: "Mavic 3 Enterprise", existing: "dji-mavic-3-enterprise", rules: or(rTitle("Mavic 3 Enterprise"), rTitle("Mavic 3E"), rTag("DJI Mavic 3 Enterprise")) },
  { id: "mavic-3-thermal", section: "enterprise_dji", label: "Mavic 3 Thermal", proposed: "mavic-3-thermal", rules: or(rTitle("Mavic 3T"), rTitle("Mavic 3 Thermal"), rTag("värmekamera")) },
  { id: "mavic-enterprise-series", section: "enterprise_dji", label: "Mavic Enterprise Series", existing: "dji-mavic-serien-enterprise", rules: or(rTitle("Mavic 3 Enterprise"), rTitle("Mavic 3M"), rTitle("Mavic 3T"), rTag("DJI Mavic 3 Enterprise")) },
  { id: "mavic-enterprise-accessories", section: "enterprise_dji", label: "Mavic Enterprise Accessories", existing: "dji-mavic-3m-dronare-tillbehor", rules: or(rTitle("Mavic 3 Enterprise"), rTitle("Mavic 3M"), rType("Enterprise Tillbehör")) },

  { id: "agras-series", section: "enterprise_dji", label: "Agras Series", existing: "dji-agras-dronare", rules: or(rTitle("Agras"), rTag("DJI Agras"), rTypeContains("Jordbruks")) },
  { id: "agras-t25", section: "enterprise_dji", label: "Agras T25", proposed: "agras-t25", rules: or(rTitle("Agras T25"), rTitle("T25")) },
  { id: "agras-t50", section: "enterprise_dji", label: "Agras T50", proposed: "agras-t50", rules: or(rTitle("Agras T50"), rTitle("T50")) },
  { id: "agras-accessories", section: "enterprise_dji", label: "Agras Accessories", proposed: "agras-accessories", rules: and(rType("Enterprise Tillbehör"), rTitle("Agras")) },

  { id: "matrice-family-hub", section: "enterprise_dji", label: "Matrice Family Hub", existing: "dji-matrice-serien", parentOnly: true },
  { id: "enterprise-drones-hub", section: "enterprise_dji", label: "Enterprise Drones Hub", existing: "enterprise-dronare", rules: or(rType("Enterprise Drönare"), rType("Drönare för företag"), rTag("Enterprise Drönare")) },

  // ── 2. FlyCart ──
  { id: "flycart-series", section: "flycart", label: "FlyCart Series", existing: "dji-flycart-serien", rules: or(rTitle("FlyCart"), rTag("DJI FlyCart 30")) },
  { id: "flycart-30", section: "flycart", label: "FlyCart 30", proposed: "flycart-30", rules: or(rTitle("FlyCart 30"), rTag("DJI FlyCart 30"), rTag("FlyCart 30")) },
  { id: "flycart-100", section: "flycart", label: "FlyCart 100", existing: "dji-flycart-100-lastdronare", rules: or(rTitle("FlyCart 100"), rTitle("FlyCart 30"), rTag("DJI FlyCart 30")) },
  { id: "flycart-batteries", section: "flycart", label: "FlyCart Batteries", proposed: "flycart-batteries", rules: and(rTitle("FlyCart"), rTitle("Batter")) },
  { id: "flycart-spare-parts", section: "flycart", label: "FlyCart Spare Parts", proposed: "flycart-spare-parts", rules: and(rTypeContains("Reservdel"), rTitle("FlyCart")) },
  { id: "flycart-payload-systems", section: "flycart", label: "FlyCart Payload Systems", proposed: "flycart-payload-systems", rules: or(rTitle("FlyCart"), rTitle("payload")) },

  // ── 3. Sensors & Payloads ──
  { id: "lidar-mapping", section: "sensors_payloads", label: "LiDAR & Mapping", proposed: "lidar-mapping", rules: or(rTitle("LiDAR"), rTitle("LIDAR"), rTag("LiDAR")) },
  { id: "lidar-sensors", section: "sensors_payloads", label: "LiDAR Sensors", proposed: "lidar-sensors", rules: or(rTitle("LiDAR"), rTitle("LIDAR"), rTag("LiDAR")) },
  { id: "zenmuse-l2", section: "sensors_payloads", label: "Zenmuse L2", proposed: "zenmuse-l2", rules: or(rTitle("Zenmuse L2"), rTitle("L2")) },
  { id: "zenmuse-l1-payload", section: "sensors_payloads", label: "Zenmuse L1", proposed: "zenmuse-l1-payload", rules: or(rTitle("Zenmuse L1")) },
  { id: "livox", section: "sensors_payloads", label: "Livox", proposed: "livox-lidar", rules: or(rTitle("Livox"), rVendor("Livox")) },
  { id: "thermal-cameras", section: "sensors_payloads", label: "Thermal Cameras", existing: "dronare-med-varmekamera", rules: or(rTitle("thermal"), rTitle("värmekamera"), rTitle("H30T"), rTag("värmekamera")) },
  { id: "zenmuse-h20t-payload", section: "sensors_payloads", label: "Zenmuse H20T", proposed: "zenmuse-h20t-payload", rules: or(rTitle("H20T"), rTitle("Zenmuse H20T")) },
  { id: "zenmuse-h30t", section: "sensors_payloads", label: "Zenmuse H30T", proposed: "zenmuse-h30t", rules: or(rTitle("H30T"), rTitle("Zenmuse H30")) },
  { id: "survey-payloads", section: "sensors_payloads", label: "Survey Payloads", proposed: "survey-payloads", rules: or(rTitle("Zenmuse P1"), rTitle("survey"), rTitle("mapping")) },
  { id: "zenmuse-p1-payload", section: "sensors_payloads", label: "Zenmuse P1", proposed: "zenmuse-p1-payload", rules: or(rTitle("Zenmuse P1")) },
  { id: "mapping-cameras", section: "sensors_payloads", label: "Mapping Cameras", proposed: "mapping-cameras", rules: or(rTitle("mapping"), rTitle("kartlägg"), rTag("Kartläggningsdrönare")) },
  { id: "searchlights", section: "sensors_payloads", label: "Searchlights", existing: "enterprise-belysning", rules: or(rTitle("spotlight"), rTitle("searchlight"), rTag("Drönar belysning")) },
  { id: "speakers", section: "sensors_payloads", label: "Speakers", existing: "enterprise-hogtalarsystem", rules: or(rTitle("speaker"), rTitle("högtalare")) },
  { id: "thermal-systems-sar", section: "sensors_payloads", label: "Thermal Systems (SAR)", proposed: "thermal-systems-sar", rules: or(rTitle("thermal"), rTitle("värmekamera"), rTitle("H30T")) },
  { id: "airdrop-systems", section: "sensors_payloads", label: "Airdrop Systems", existing: "airdrop-system", rules: or(rTitle("airdrop"), rTag("airdrop system")) },
  { id: "winch-systems", section: "sensors_payloads", label: "Winch Systems", existing: "enterprise-lyftsystem", rules: or(rTitle("winch"), rTitle("lyft")) },
  { id: "parachute-systems", section: "sensors_payloads", label: "Parachute Systems", proposed: "parachute-systems", rules: or(rTitle("parachute"), rTitle("fallskärm")) },
  { id: "flight-safety-systems", section: "sensors_payloads", label: "Flight Safety Systems", proposed: "flight-safety-systems", rules: or(rTitle("parachute"), rTitle("ADS-B"), rTitle("safety")) },

  // ── 4. Industry Solutions (English handles — new; Swedish aliases kept) ──
  { id: "inspection-drones", section: "industry", label: "Inspection", proposed: "inspection-drones", alias: "inspektionsdronare", rules: or(rTag("Inspektionsdrönare"), rTitle("inspection"), rTitle("Matrice 4"), rTitle("Matrice 30"), rTitle("Matrice 350")) },
  { id: "energy-infrastructure-drones", section: "industry", label: "Energy & Infrastructure", proposed: "energy-infrastructure-drones", alias: "energi-infrastruktur", rules: or(rTitle("infrastruktur"), rTitle("kraftledning"), rTitle("Matrice 350"), rTitle("Matrice 400"), rTitle("Zenmuse L2"), rTitle("H30T")) },
  { id: "agriculture-drones", section: "industry", label: "Agriculture", proposed: "agriculture-drones", alias: "jordbruksdronare", rules: or(rTitle("Agras"), rTag("Jordbruksdrönare"), rTitle("mapping")) },
  { id: "forestry-drones", section: "industry", label: "Forestry", proposed: "forestry-drones", alias: "skogsbruksdronare", rules: or(rTitle("skogs"), rTitle("forestry"), rTitle("L2")) },
  { id: "surveying-mapping-drones", section: "industry", label: "Surveying & Mapping", proposed: "surveying-mapping-drones", alias: "kartlaggnings-och-matdronare", rules: or(rTag("Kartläggningsdrönare"), rTitle("L2"), rTitle("L1"), rTitle("P1"), rTitle("Matrice 350"), rTitle("RTK")) },
  { id: "transport-logistics-drones", section: "industry", label: "Transport & Logistics", proposed: "transport-logistics-drones", alias: "transport-logistik", rules: or(rTitle("FlyCart"), rTag("Transportdrönare"), rTitle("payload")) },
  { id: "public-safety-drones", section: "industry", label: "Public Safety & Rescue", proposed: "public-safety-drones", rules: or(rTitle("thermal"), rTitle("searchlight"), rTitle("speaker"), rTitle("parachute"), rTitle("public safety"), rTitle("räddning")) },

  // ── 5. Spare Parts ──
  { id: "enterprise-spare-parts", section: "spare_parts", label: "Enterprise Spare Parts", proposed: "reservdelar-dji-enterprise", rules: or(rTypeContains("Reservdel"), rType("Enterprise Tillbehör")) },
  { id: "matrice-spare-parts", section: "spare_parts", label: "Matrice Spare Parts", proposed: "matrice-spare-parts-hub", rules: and(rTypeContains("Reservdel"), rTitle("Matrice")) },
  { id: "flycart-spare-parts-hub", section: "spare_parts", label: "FlyCart Spare Parts", proposed: "flycart-spare-parts-hub", rules: and(rTypeContains("Reservdel"), rTitle("FlyCart")) },
  { id: "agras-spare-parts", section: "spare_parts", label: "Agras Spare Parts", proposed: "agras-spare-parts", rules: and(rTypeContains("Reservdel"), rTitle("Agras")) },
  { id: "mini-spare-parts", section: "spare_parts", label: "Mini Spare Parts", existing: "dji-mini-3-tillbehor", rules: or(rTitle("Mini"), rTypeContains("Reservdel")) },
  { id: "air-spare-parts", section: "spare_parts", label: "Air Spare Parts", existing: "dji-air-3-tillbehor-omfattande-sortiment", rules: or(rTitle("Air 3"), rTypeContains("Reservdel")) },
  { id: "mavic-spare-parts", section: "spare_parts", label: "Mavic Spare Parts", existing: "dji-mavic-3-tillbehor", rules: or(rTitle("Mavic"), rTypeContains("Reservdel")) },
  { id: "avata-spare-parts", section: "spare_parts", label: "Avata Spare Parts", existing: "dji-avata-2-tillbehor", rules: or(rTitle("Avata"), rTypeContains("Reservdel")) },
  { id: "neo-spare-parts", section: "spare_parts", label: "Neo Spare Parts", existing: "reparation-dji-neo-reservdelar", rules: or(rTitle("Neo"), rTypeContains("Reservdel")) },
  { id: "flip-spare-parts", section: "spare_parts", label: "Flip Spare Parts", existing: "dji-flip-tillbehor", rules: or(rTitle("Flip"), rTypeContains("Reservdel")) },
  { id: "batteries-spare", section: "spare_parts", label: "Batteries (component)", proposed: "drone-batteries-spare-parts", rules: and(rTypeContains("Reservdel"), rTitle("batteri")) },
  { id: "propellers-spare", section: "spare_parts", label: "Propellers", existing: "dronare-propeller-tillbehor", keepCurrent: true },
  { id: "gimbals-spare", section: "spare_parts", label: "Gimbals", existing: "reservdelar-gimbal-dronare-motorer", rules: or(rTitle("gimbal"), rTypeContains("Gimbal")) },
  { id: "motors-spare", section: "spare_parts", label: "Motors", proposed: "drone-motors-spare-parts", rules: or(rTitle("motor"), rTitle("ESC")) },
  { id: "electronics-spare", section: "spare_parts", label: "Electronics", existing: "dronarelektronik-flight-components", keepCurrent: true },

  // ── 6. Accessories ──
  { id: "batteries-accessories", section: "accessories", label: "Batteries", existing: "batterier", rules: or(rTitle("batteri"), rTypeContains("Batteri")) },
  { id: "dji-batteries", section: "accessories", label: "DJI Batteries", proposed: "dji-batteries", rules: and(rVendor("DJI"), rTitle("Batter")) },
  { id: "enterprise-batteries", section: "accessories", label: "Enterprise Batteries", proposed: "enterprise-batteries", rules: and(rTitle("Enterprise"), rTitle("Batter")) },
  { id: "flycart-batteries-acc", section: "accessories", label: "FlyCart Batteries", proposed: "flycart-batteries-acc", rules: and(rTitle("FlyCart"), rTitle("Batter")) },
  { id: "charging-hubs", section: "accessories", label: "Charging Hubs", proposed: "charging-hubs", rules: or(rTitle("charging hub"), rTitle("laddstation")) },
  { id: "chargers", section: "accessories", label: "Chargers", existing: "batterier", rules: or(rTitle("laddare"), rTitle("charger")) },
  { id: "filters", section: "accessories", label: "Filters", existing: "filter-till-dronare", rules: or(rTitle("filter"), rTypeContains("filter")) },
  { id: "cases-bags", section: "accessories", label: "Cases & Bags", existing: "dronarryggsack-vaskor", rules: or(rTitle("väska"), rTitle("case"), rTitle("bag")) },
  { id: "remote-controllers", section: "accessories", label: "Remote Controllers", existing: "dji-enterprise-fjarrkontroller", rules: or(rTitle("RC Plus"), rTitle("RC Pro"), rType("Fjärrkontroll Enterprise")) },
  { id: "enterprise-accessories-hub", section: "accessories", label: "Enterprise Accessories", existing: "enterprise-tillbehor", rules: and(rType("Enterprise Tillbehör"), rTag("enterprise")) },
  { id: "consumer-accessories-hub", section: "accessories", label: "Consumer Accessories", existing: "dronartillbehor-kop", rules: or(rTypeContains("Tillbehör"), rTitle("tillbehör")) },
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
  let field = col === "TYPE" ? product.productType || "" : col === "VENDOR" ? product.vendor || "" : product.title || "";
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
  const rules = (ruleSet.rules || []).filter((r) => !(String(r.column).toUpperCase() === "TAG" && String(r.relation).toUpperCase() === "CONTAINS"));
  return { ...ruleSet, rules };
}

function resolveHandle(node, liveHandles) {
  if (node.existing) return { handle: node.existing, status: liveHandles.has(node.existing) ? "existing" : "existing_missing" };
  if (node.proposed) return { handle: node.proposed, status: liveHandles.has(node.proposed) ? "existing" : "create_required" };
  return { handle: null, status: "invalid" };
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
console.log(`Products: ${products.length}`);

const liveCols = existsSync(LIVE_COLS) ? JSON.parse(readFileSync(LIVE_COLS, "utf8")).collections : [];
const liveHandleMap = new Map(liveCols.map((c) => [c.handle, c.productsCount?.count ?? 0]));
const liveHandles = new Set(liveCols.map((c) => c.handle));

const nodes = [];
const handleToNodes = new Map();

for (const node of ARCHITECTURE) {
  if (node.parentOnly) continue;
  const { handle, status } = resolveHandle(node, liveHandles);
  const currentCount = liveHandleMap.get(handle) ?? null;
  const phase3 = status === "existing" ? phase3RuleForHandle(handle) : null;
  const keepCurrent = status === "existing" && (node.keepCurrent || (!phase3 && !node.rules));
  const rules = keepCurrent
    ? null
    : phase3
      ? sanitizeRules({ appliedDisjunctively: phase3.appliedDisjunctively, rules: phase3.rules })
      : node.rules
        ? sanitizeRules(node.rules)
        : null;
  const projected = keepCurrent ? currentCount : rules ? products.filter((p) => productMatchesRuleSet(p, rules)).length : null;
  const action = keepCurrent
    ? "keep_current"
    : status === "existing"
      ? "populate_existing"
      : projected > 0
        ? "create_collection"
        : node.section === "industry"
          ? "seo_page_only"
          : "defer";

  const entry = {
    id: node.id,
    section: node.section,
    label: node.label,
    handle,
    alias_handle: node.alias || null,
    status,
    action,
    projected_count: projected,
    current_count: currentCount,
    rules,
    rules_source: phase3 ? "phase3_deployed" : node.rules ? "v2_proposed" : null,
    shopify_compatible: !(rules?.rules || []).some((r) => r.column === "TAG" && r.relation === "CONTAINS"),
    shrinkage: currentCount != null && projected != null && currentCount > 0 && projected < currentCount * 0.9,
  };
  nodes.push(entry);
  if (handle) {
    if (!handleToNodes.has(handle)) handleToNodes.set(handle, []);
    handleToNodes.get(handle).push(entry.id);
  }
}

const duplicates = [...handleToNodes.entries()].filter(([, ids]) => ids.length > 1);
const emptyExisting = nodes.filter((n) => n.status === "existing" && n.projected_count === 0);
const createWithProducts = nodes.filter((n) => n.action === "create_collection");
const seoOnly = nodes.filter((n) => n.action === "seo_page_only");

// Navigation structure
const NAV = {
  version: "2.0",
  menus: {
    "main-menu": {
      title: "Main Menu",
      items: [
        {
          title: "Drönare",
          items: [
            { title: "Mini", url: "/collections/dji-mini-3-serien" },
            { title: "Air", url: "/collections/dji-air-serien" },
            { title: "Mavic", url: "/collections/dji-mavic-3-serien" },
            { title: "Avata", url: "/collections/dji-avata-serien" },
            { title: "Neo", url: "/collections/dji-neo" },
            { title: "Flip", url: "/collections/dji-flip-dronare" },
          ],
        },
        {
          title: "Enterprise Drönare",
          items: [
            { title: "Matrice 4", url: "/collections/dji-matrice-4-serie" },
            { title: "Matrice 30", url: "/collections/dji-matrice-30-serie-tillbehor" },
            { title: "Matrice 300", url: "/collections/matrice-300-rtk" },
            { title: "Matrice 350", url: "/collections/dji-matrice-350-rtk-tillbehor" },
            { title: "Matrice 400", url: "/collections/dji-matrice-400-serien" },
            { title: "Matrice 3", url: "/collections/matrice-3-series" },
            { title: "Mavic Enterprise", url: "/collections/dji-mavic-serien-enterprise" },
            { title: "Agras", url: "/collections/dji-agras-dronare" },
          ],
        },
        {
          title: "FlyCart",
          items: [
            { title: "FlyCart 30", url: "/collections/flycart-30" },
            { title: "FlyCart 100", url: "/collections/dji-flycart-100-lastdronare" },
          ],
        },
        {
          title: "Sensorer & Payloads",
          items: [
            { title: "LiDAR", url: "/collections/lidar-sensors" },
            { title: "Thermal", url: "/collections/dronare-med-varmekamera" },
            { title: "Mapping", url: "/collections/kartlaggnings-och-matdronare" },
            { title: "Airdrop", url: "/collections/airdrop-system" },
            { title: "Searchlight", url: "/collections/enterprise-belysning" },
            { title: "Speakers", url: "/collections/enterprise-hogtalarsystem" },
          ],
        },
        {
          title: "Branschlösningar",
          items: [
            { title: "Inspection", url: "/collections/inspektionsdronare" },
            { title: "Energy", url: "/collections/energi-infrastruktur" },
            { title: "Agriculture", url: "/collections/jordbruksdronare" },
            { title: "Forestry", url: "/collections/skogsbruksdronare" },
            { title: "Surveying", url: "/collections/kartlaggnings-och-matdronare" },
            { title: "Logistics", url: "/collections/transport-logistik" },
            { title: "Public Safety", url: "/collections/inspektionsdronare" },
          ],
        },
        { title: "Reservdelar", url: "/collections/dji-dronar-reservdelar" },
        { title: "Tillbehör", url: "/collections/dronartillbehor-kop" },
        { title: "Legacy DJI", url: "/collections/dji-mavic-2-serien" },
      ],
    },
  },
};

// Menu validation
function walkNav(items, out = []) {
  for (const it of items || []) {
    if (it.url) {
      const m = it.url.match(/\/collections\/([^/?#]+)/);
      if (m) out.push({ title: it.title, handle: m[1] });
    }
    walkNav(it.items, out);
  }
  return out;
}

const menuRefs = walkNav(NAV.menus["main-menu"].items);
const menuValidation = menuRefs.map((ref) => {
  const node = nodes.find((n) => n.handle === ref.handle);
  const liveCount = liveHandleMap.get(ref.handle);
  const projected = node?.projected_count ?? liveCount;
  const exists = liveHandles.has(ref.handle);
  let status = "PASS";
  if (!exists && node?.action === "create_collection") status = "PENDING_CREATE";
  else if (!exists) status = "MISSING";
  else if ((projected ?? 0) === 0 && (liveCount ?? 0) === 0) status = "EMPTY";
  else if ((liveCount ?? projected ?? 0) > 0) status = "PASS";
  return { ...ref, exists, live_count: liveCount, projected, status };
});

const menuFailures = menuValidation.filter((m) => !["PASS", "PENDING_CREATE"].includes(m.status));

// SEO framework
const SEO_MARKETS = ["SE", "DE", "NL", "FR", "EU"];
const seoInventory = nodes
  .filter((n) => ["industry", "enterprise_dji", "flycart", "sensors_payloads"].includes(n.section))
  .map((n) => ({
    handle: n.handle,
    label: n.label,
    type: n.action === "seo_page_only" ? "page" : "collection",
    markets: SEO_MARKETS,
    seo_title: `${n.label} | DJI Enterprise | EuroDroneParts`,
    seo_description: `Professional ${n.label.toLowerCase()} solutions for European enterprise drone operations. DJI authorized specialist.`,
    internal_links: nodes.filter((x) => x.section === n.section && x.id !== n.id).slice(0, 5).map((x) => x.handle),
  }));

const tagStandards = {
  version: "2.0",
  note: "Reference standard — products NOT modified in this phase. Apply via future tagging pass.",
  dimensions: {
    brand: ["brand:dji"],
    manufacturer: ["manufacturer:dji"],
    family: ["family:matrice", "family:mavic-enterprise", "family:flycart", "family:agras", "family:neo", "family:mini", "family:air", "family:avata"],
    model: ["model:matrice-350", "model:matrice-400", "model:flycart-30", "model:flycart-100"],
    payload: ["payload:lidar", "payload:thermal", "payload:mapping", "payload:airdrop", "payload:speaker", "payload:searchlight"],
    industry: ["industry:inspection", "industry:energy", "industry:agriculture", "industry:forestry", "industry:mapping", "industry:logistics", "industry:public-safety"],
    compat: "compat:[model] — one tag per compatible airframe",
  },
};

const shrinkage = nodes.filter((n) => n.shrinkage);
const validationPass =
  emptyExisting.length === 0 &&
  shrinkage.length === 0 &&
  menuFailures.length === 0 &&
  nodes.every((n) => n.shopify_compatible);

const audit = {
  generated_at: new Date().toISOString(),
  mode: "dry_run",
  catalog_size: products.length,
  live_collections: liveCols.length,
  architecture_nodes: nodes.length,
  existing_mapped: nodes.filter((n) => n.status === "existing").length,
  create_required: createWithProducts.length,
  seo_page_only: seoOnly.length,
  projected_empty_existing: emptyExisting.length,
  shrinkage_warnings: shrinkage.length,
  menu_refs: menuValidation.length,
  menu_failures: menuFailures.length,
  duplicate_handles: duplicates.map(([h, ids]) => ({ handle: h, nodes: ids })),
  validation_pass: validationPass,
  nodes,
  menu_validation: menuValidation,
};

writeFileSync(OUT_ARCH, JSON.stringify({ version: "2.0", nodes: ARCHITECTURE.map((n) => ({ ...n, rules: n.rules || null })) }, null, 2));

const rulesOut = {};
for (const n of nodes) {
  if (!n.rules) continue;
  if (!rulesOut[n.section]) rulesOut[n.section] = {};
  rulesOut[n.section][n.handle] = {
    label: n.label,
    action: n.action,
    appliedDisjunctively: n.rules.appliedDisjunctively,
    rules: n.rules.rules,
    projected_count: n.projected_count,
  };
}
writeFileSync(OUT_RULES, JSON.stringify({ version: "2.0", status: "validated_dry_run", rules: rulesOut }, null, 2));
writeFileSync(OUT_NAV, JSON.stringify(NAV, null, 2));
writeFileSync(
  OUT_MAP,
  JSON.stringify(
    {
      version: "2.0",
      mappings: menuValidation.map((m) => ({
        menu_item: m.title,
        collection_handle: m.handle,
        status: m.status,
        projected_count: m.projected,
      })),
    },
    null,
    2,
  ),
);
writeFileSync(OUT_TAGS, JSON.stringify(tagStandards, null, 2));
writeFileSync(OUT_SEO, JSON.stringify({ version: "2.0", markets: SEO_MARKETS, pages: seoInventory }, null, 2));
writeFileSync(
  OUT_SITEMAP,
  JSON.stringify(
    {
      generated_at: audit.generated_at,
      collections: nodes.filter((n) => n.projected_count > 0 || n.status === "existing").map((n) => ({ handle: n.handle, url: `/collections/${n.handle}`, projected: n.projected_count })),
      pages: seoOnly.map((n) => ({ handle: n.handle, url: `/pages/${n.handle}` })),
    },
    null,
    2,
  ),
);
writeFileSync(OUT_AUDIT, JSON.stringify(audit, null, 2));

const lines = [
  "# EuroDroneParts — Enterprise Architecture V2",
  "",
  `**Generated:** ${audit.generated_at}`,
  "**Mode:** DRY RUN — validation only, no deployment",
  "",
  "## Validation gate",
  "",
  `| Check | Result |`,
  `|-------|--------|`,
  `| Validation pass (100%) | **${validationPass ? "YES — ready for deployment review" : "NO — blockers below"}** |`,
  `| Existing collections go empty | ${emptyExisting.length === 0 ? "PASS" : `FAIL (${emptyExisting.length})`} |`,
  `| Shopify rule compatibility | ${nodes.every((n) => n.shopify_compatible) ? "PASS" : "FAIL"} |`,
  `| Menu links resolve | ${menuFailures.length === 0 ? "PASS" : `FAIL (${menuFailures.length})`} |`,
  `| Unexpected shrinkage on existing | ${shrinkage.length === 0 ? "PASS" : `FAIL (${shrinkage.length})`} |`,
  "",
  "## Summary",
  "",
  `| Metric | Value |`,
  `|--------|------:|`,
  `| Architecture nodes | ${nodes.length} |`,
  `| Mapped to existing collections | ${audit.existing_mapped} |`,
  `| New collections to create (with products) | ${createWithProducts.length} |`,
  `| SEO page only (no products) | ${seoOnly.length} |`,
  `| Catalog scanned | ${products.length} |`,
  "",
  "## Deployment checklist",
  "",
  "1. [ ] Review projected counts for all nodes",
  "2. [ ] Create new collections (see create_required list)",
  "3. [ ] Apply smart rules to existing collections (rules-only update)",
  "4. [ ] Deploy navigation structure to main-menu + enterprise-dr-nare",
  "5. [ ] Apply SEO metadata (titles/descriptions only — no handle changes)",
  "6. [ ] Create SEO landing pages for seo_page_only nodes",
  "7. [ ] Run post-deployment validation script",
  "8. [ ] Future: apply product tag standards (separate pass)",
  "",
  "## Projected counts by section",
  "",
];

for (const section of [...new Set(nodes.map((n) => n.section))]) {
  lines.push(`### ${section}`, "", "| Node | Handle | Action | Projected | Current live |", "|---|---|---|---:|---:|");
  for (const n of nodes.filter((x) => x.section === section).sort((a, b) => b.projected_count - a.projected_count)) {
    lines.push(`| ${n.label} | \`${n.handle}\` | ${n.action} | **${n.projected_count}** | ${n.current_count ?? "—"} |`);
  }
  lines.push("");
}

if (!validationPass) {
  lines.push("## Blockers", "");
  if (emptyExisting.length) {
    lines.push("### Existing collections projected empty", "");
    for (const n of emptyExisting) lines.push(`- \`${n.handle}\` (${n.label})`);
    lines.push("");
  }
  if (shrinkage.length) {
    lines.push("### Existing collections with projected shrinkage", "", "| Handle | Label | Current | Projected |", "|---|---|---:|---:|");
    for (const n of shrinkage) lines.push(`| \`${n.handle}\` | ${n.label} | ${n.current_count} | ${n.projected_count} |`);
    lines.push("");
  }
  if (menuFailures.length) {
    lines.push("### Menu failures", "", "| Item | Handle | Status |", "|---|---|---|");
    for (const m of menuFailures) lines.push(`| ${m.title} | \`${m.handle}\` | ${m.status} |`);
    lines.push("");
  }
}

lines.push(
  "---",
  "",
  "Artifacts:",
  "- `data/edp-enterprise-architecture-v2.json`",
  "- `data/edp-smart-collection-rules.json`",
  "- `data/edp-navigation-structure.json`",
  "- `data/edp-collection-menu-mapping.json`",
  "- `data/edp-product-tag-standards.json`",
  "- `data/edp-industry-seo-framework.json`",
  "- `EURODRONEPARTS_SITEMAP_V2.json`",
  "- `.enterprise-architecture-v2-audit.json`",
  "",
);

writeFileSync(OUT_REPORT, lines.join("\n"));
console.log(`Wrote ${OUT_REPORT}`);
console.log(JSON.stringify({ validation_pass: validationPass, create_required: createWithProducts.length, menu_failures: menuFailures.length }, null, 2));
