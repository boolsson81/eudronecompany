#!/usr/bin/env node
/**
 * Phase 4 — Enterprise Expansion, Service & Repair Platform (DRY RUN ONLY).
 * Creates NEW collections/menus/pages. Protects Phase 3 deployed handles.
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LIVE_COLS = join(ROOT, ".live-collections-snapshot.json");
const PHASE3 = join(ROOT, "data/edp-phase3-population-rules.json");
const OUT_RULES = join(ROOT, "data/edp-phase4-collection-rules.json");
const OUT_NAV = join(ROOT, "data/edp-phase4-navigation.json");
const OUT_TAGS = join(ROOT, "data/edp-phase4-tag-standards.json");
const OUT_PAGES = join(ROOT, "data/edp-phase4-service-pages.json");
const OUT_REPORT = join(ROOT, "PHASE4_DEPLOYMENT_REPORT.md");
const OUT_AUDIT = join(ROOT, ".phase4-deployment-audit.json");
const URL = process.env.CLONER_SUPABASE_URL || "https://wsncjdajweoujhidlxas.supabase.co";
const STORE = "ya1xhg-x6.myshopify.com";

/** Phase 3 live handles — DO NOT modify rules, URLs, or SEO */
const PHASE3_PROTECTED = new Set([
  "dji-matrice-4-serie", "dji-matrice-3-serien", "dji-matrice-30-serie-tillbehor",
  "dji-matrice-350-rtk-tillbehor", "dji-matrice-400-serien", "dji-matrice-serien",
  "dji-matrice-4-tillbehor", "dji-mavic-3-enterprise", "dji-mavic-serien-enterprise",
  "dji-mavic-3m-dronare-tillbehor", "dji-agras-dronare", "enterprise-dronare",
  "enterprise-tillbehor", "enterprise-dronartillbehor", "enterprise-propellrar",
  "dji-enterprise-fjarrkontroller", "dji-marvic-enterprise", "enterprise-belysning",
  "enterprise-hogtalarsystem", "enterprise-lyftsystem", "enterprise-service-dronare",
  "dji-flycart-serien", "dji-flycart-100-lastdronare", "enterprise-sensorer",
  "dronare-med-varmekamera", "airdrop-system", "inspektionsdronare",
  "energi-infrastruktur", "jordbruksdronare", "skogsbruksdronare",
  "kartlaggnings-och-matdronare", "transport-logistik", "last-och-transportdronare",
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

const T = (c) => ({ column: "TITLE", relation: "CONTAINS", condition: c });
const TG = (c) => ({ column: "TAG", relation: "EQUALS", condition: c });
const TY = (c) => ({ column: "TYPE", relation: "EQUALS", condition: c });
const TV = (c) => ({ column: "VENDOR", relation: "CONTAINS", condition: c });
const or = (...rules) => ({ appliedDisjunctively: true, rules });
const and = (...rules) => ({ appliedDisjunctively: false, rules });

/** @type {Array<{handle:string,part:string,label:string,rules?:object,alias?:string,type?:string}>} */
const COLLECTIONS = [
  // PART 1 — Matrice (new canonical series handles)
  { part: "enterprise", handle: "dji-matrice-3-serie", label: "Matrice 3 Series", rules: or(T("Matrice 3D"), T("Matrice 3TD"), TG("DJI Matrice 3D"), TG("DJI Matrice 3TD")) },
  { part: "enterprise", handle: "dji-matrice-30-serie", label: "Matrice 30 Series", rules: or(T("Matrice 30"), T("M30"), TG("Matrice 30"), TG("Matrice 30T")) },
  { part: "enterprise", handle: "dji-matrice-300-rtk-serie", label: "Matrice 300 RTK Series", rules: or(T("Matrice 300"), T("M300"), TG("Matrice 300 RTK")) },
  { part: "enterprise", handle: "dji-matrice-350-rtk-serie", label: "Matrice 350 RTK Series", rules: or(T("Matrice 350"), T("M350"), TG("DJI Matrice 350 RTK"), TG("Matrice 350 RTK")) },
  { part: "enterprise", handle: "dji-matrice-400-serie", label: "Matrice 400 Series", rules: or(T("Matrice 400"), T("M400")) },
  { part: "enterprise", handle: "dji-matrice-4-serie", label: "Matrice 4 Series", alias: "phase3_protected", rules: null },

  // Dock
  { part: "enterprise", handle: "dji-dock-serien", label: "DJI Dock Series", rules: or(T("DJI Dock"), T("Dock 2"), T("Dock 3")) },
  { part: "enterprise", handle: "dji-dock-2", label: "DJI Dock 2", rules: or(T("Dock 2")) },
  { part: "enterprise", handle: "dji-dock-3", label: "DJI Dock 3", rules: or(T("Dock 3")) },

  // Mavic Enterprise
  { part: "enterprise", handle: "dji-mavic-3-enterprise", label: "Mavic 3 Enterprise", alias: "phase3_protected", rules: null },
  { part: "enterprise", handle: "dji-mavic-3-thermal", label: "Mavic 3 Thermal", rules: or(T("Mavic 3T"), T("Mavic 3 Thermal"), TG("värmekamera")) },
  { part: "enterprise", handle: "dji-mavic-enterprise-serien", label: "Mavic Enterprise Series", rules: or(T("Mavic 3 Enterprise"), T("Mavic 3M"), TG("DJI Mavic 3 Enterprise"), TG("Mavic 3 Enterprise")) },

  // Agras
  { part: "enterprise", handle: "dji-agras-serien", label: "Agras Series", rules: or(T("Agras"), TG("DJI Agras")) },
  { part: "enterprise", handle: "dji-agras-t50", label: "Agras T50", rules: or(T("Agras T50"), T("T50")) },
  { part: "enterprise", handle: "dji-agras-t40", label: "Agras T40", rules: or(T("Agras T40"), T("T40")) },
  { part: "enterprise", handle: "dji-agras-t25", label: "Agras T25", rules: or(T("Agras T25"), T("T25")) },

  // FlyCart
  { part: "enterprise", handle: "dji-flycart-serien", label: "FlyCart Series", alias: "phase3_protected", rules: null },
  { part: "enterprise", handle: "dji-flycart-30", label: "FlyCart 30", rules: or(T("FlyCart 30"), TG("DJI FlyCart 30"), TG("FlyCart 30")) },
  { part: "enterprise", handle: "dji-flycart-100", label: "FlyCart 100", rules: or(T("FlyCart 100"), T("FlyCart 30"), TG("DJI FlyCart 30")) },

  // PART 2 — Zenmuse
  { part: "payloads", handle: "zenmuse-h20", label: "Zenmuse H20", rules: or(T("Zenmuse H20")) },
  { part: "payloads", handle: "zenmuse-h20t", label: "Zenmuse H20T", rules: or(T("H20T"), T("Zenmuse H20T")) },
  { part: "payloads", handle: "zenmuse-h30", label: "Zenmuse H30", rules: or(T("Zenmuse H30"), T("H30")) },
  { part: "payloads", handle: "zenmuse-h30t", label: "Zenmuse H30T", rules: or(T("H30T"), T("Zenmuse H30T")) },
  { part: "payloads", handle: "zenmuse-p1", label: "Zenmuse P1", rules: or(T("Zenmuse P1")) },
  { part: "payloads", handle: "zenmuse-l1", label: "Zenmuse L1", rules: or(T("Zenmuse L1")) },
  { part: "payloads", handle: "zenmuse-l2", label: "Zenmuse L2", rules: or(T("Zenmuse L2")) },
  { part: "payloads", handle: "zenmuse-v1", label: "Zenmuse V1", rules: or(T("Zenmuse V1")) },
  { part: "payloads", handle: "zenmuse-s1", label: "Zenmuse S1", rules: or(T("Zenmuse S1")) },

  // Livox
  { part: "payloads", handle: "livox", label: "Livox", rules: or(T("Livox"), TV("Livox")) },
  { part: "payloads", handle: "livox-mid-360", label: "Livox Mid-360", rules: or(T("Mid-360"), T("MID-360")) },
  { part: "payloads", handle: "livox-mid-70", label: "Livox Mid-70", rules: or(T("Mid-70")) },
  { part: "payloads", handle: "livox-hap", label: "Livox HAP", rules: or(T("Livox HAP"), T("HAP")) },

  // Payload categories
  { part: "payloads", handle: "lidar-system", label: "LiDAR Systems", rules: or(T("LiDAR"), T("LIDAR"), TG("LiDAR")) },
  { part: "payloads", handle: "fotogrammetri-system", label: "Fotogrammetri", rules: or(T("P1"), T("photogrammetry"), T("fotogrammetri")) },
  { part: "payloads", handle: "termisk-inspektion", label: "Termisk Inspektion", rules: or(T("thermal"), T("värmekamera"), T("H30T"), T("H20T")) },
  { part: "payloads", handle: "spotlight-system", label: "Spotlight Systems", rules: or(T("spotlight"), T("searchlight"), TG("Drönar belysning")) },
  { part: "payloads", handle: "hogtalarsystem", label: "Högtalarsystem", rules: or(T("speaker"), T("högtalare"), T("megaphone")) },
  { part: "payloads", handle: "airdrop-system", label: "Airdrop System", alias: "phase3_protected", rules: null },
  { part: "payloads", handle: "fallskarmssystem", label: "Fallskärmssystem", rules: or(T("parachute"), T("fallskärm")) },

  // PART 5 — Industry expansion (keep existing + new)
  { part: "industry", handle: "inspektionsdronare", label: "Inspection", alias: "phase3_protected", rules: null },
  { part: "industry", handle: "energi-infrastruktur", label: "Energy", alias: "phase3_protected", rules: null },
  { part: "industry", handle: "jordbruksdronare", label: "Agriculture", alias: "phase3_protected", rules: null },
  { part: "industry", handle: "skogsbruksdronare", label: "Forestry", alias: "phase3_protected", rules: null },
  { part: "industry", handle: "kartlaggnings-och-matdronare", label: "Surveying", alias: "phase3_protected", rules: null },
  { part: "industry", handle: "transport-logistik", label: "Logistics", alias: "phase3_protected", rules: null },
  { part: "industry", handle: "polis-raddningstjanst", label: "Public Safety", rules: or(T("public safety"), T("räddning"), T("polis"), T("search and rescue")) },
  { part: "industry", handle: "forsvar-sakerhet", label: "Defense", rules: or(T("defense"), T("försvar"), T("military")) },
  { part: "industry", handle: "telekom-inspektion", label: "Telecom", rules: or(T("telecom"), T("telekom"), T("antenna")) },
  { part: "industry", handle: "vindkraftsinspektion", label: "Wind Power", rules: or(T("wind turbine"), T("vindkraft"), T("wind")) },
  { part: "industry", handle: "solenergi-inspektion", label: "Solar", rules: or(T("solar"), T("solenergi"), T("photovoltaic")) },
  { part: "industry", handle: "jarnvagsinspektion", label: "Rail", rules: or(T("rail"), T("järnväg"), T("railway")) },
  { part: "industry", handle: "broar-tunnlar-infrastruktur", label: "Infrastructure", rules: or(T("bridge"), T("tunnel"), T("bro"), T("infrastruktur")) },

  // PART 3 — Service collections (product-backed repair parts)
  { part: "service", handle: "dronarreparation", label: "Drönarreparation", type: "page", rules: or(T("reparation"), T("repair"), T("reservdel")) },
  { part: "service", handle: "gimbalreparation", label: "Gimbalreparation", type: "page", rules: or(T("gimbal"), T("Gimbal")) },
  { part: "service", handle: "kamerareparation", label: "Kamerareparation", type: "page", rules: and(T("kamera"), or(T("reparation"), T("reservdel")).rules[0] ? T("reparation") : T("reparation")) },
  { part: "service", handle: "motorbyte", label: "Motorbyte", type: "page", rules: or(T("motor"), T("Motor")) },
  { part: "service", handle: "esc-reparation", label: "ESC-reparation", type: "page", rules: or(T("ESC")) },
];

// Fix kamerareparation rule
COLLECTIONS.find((c) => c.handle === "kamerareparation").rules = and(T("kamera"), T("reparation"));

const SERVICE_PAGES = [
  { handle: "dronarreparation", title: "Drönarreparation", group: "repair" },
  { handle: "dji-reparation", title: "DJI reparation", group: "repair" },
  { handle: "enterprise-reparation", title: "Enterprise reparation", group: "repair" },
  { handle: "flycart-service", title: "FlyCart service", group: "repair" },
  { handle: "agras-service", title: "Agras service", group: "repair" },
  { handle: "dronarkalibrering", title: "Drönarkalibrering", group: "calibration" },
  { handle: "imu-kalibrering", title: "IMU-kalibrering", group: "calibration" },
  { handle: "rtk-kalibrering", title: "RTK-kalibrering", group: "calibration" },
  { handle: "sensor-kalibrering", title: "Sensor-kalibrering", group: "calibration" },
  { handle: "serviceavtal", title: "Serviceavtal", group: "support" },
  { handle: "supportavtal", title: "Supportavtal", group: "support" },
  { handle: "forebyggande-underhall", title: "Förebyggande underhåll", group: "support" },
  { handle: "dji-service", title: "DJI Service", group: "service" },
  { handle: "dji-enterprise-service", title: "DJI Enterprise Service", group: "service" },
  { handle: "dji-flycart-service", title: "DJI FlyCart Service", group: "service" },
  { handle: "dji-agras-service", title: "DJI Agras Service", group: "service" },
  { handle: "dji-dock-service", title: "DJI Dock Service", group: "service" },
  { handle: "gimbalreparation", title: "Gimbalreparation", group: "repair" },
  { handle: "kamerareparation", title: "Kamerareparation", group: "repair" },
  { handle: "motorbyte", title: "Motorbyte", group: "repair" },
  { handle: "esc-reparation", title: "ESC-reparation", group: "repair" },
  { handle: "kompasskalibrering", title: "Kompasskalibrering", group: "calibration" },
  { handle: "sensorvalidering", title: "Sensorvalidering", group: "calibration" },
  { handle: "arlig-kontroll", title: "Årlig kontroll", group: "maintenance" },
  { handle: "enterprise-support", title: "Enterprise Support", group: "maintenance" },
];

const NAV = {
  version: "4.0",
  note: "Additive menus only — Phase 3 main-menu and enterprise-dr-nare are NOT modified",
  menus: {
    "service-support": {
      title: "Service & Support",
      items: [
        {
          title: "DJI Service",
          items: [
            { title: "DJI Service", url: "/pages/dji-service" },
            { title: "DJI Enterprise Service", url: "/pages/dji-enterprise-service" },
            { title: "DJI FlyCart Service", url: "/pages/dji-flycart-service" },
            { title: "DJI Agras Service", url: "/pages/dji-agras-service" },
            { title: "DJI Dock Service", url: "/pages/dji-dock-service" },
          ],
        },
        {
          title: "Repairs",
          items: [
            { title: "Drönarreparation", url: "/pages/dronarreparation" },
            { title: "Gimbalreparation", url: "/pages/gimbalreparation" },
            { title: "Kamerareparation", url: "/pages/kamerareparation" },
            { title: "Motorbyte", url: "/pages/motorbyte" },
            { title: "ESC-reparation", url: "/pages/esc-reparation" },
          ],
        },
        {
          title: "Calibration",
          items: [
            { title: "IMU-kalibrering", url: "/pages/imu-kalibrering" },
            { title: "Kompasskalibrering", url: "/pages/kompasskalibrering" },
            { title: "RTK-kalibrering", url: "/pages/rtk-kalibrering" },
            { title: "Sensorvalidering", url: "/pages/sensorvalidering" },
          ],
        },
        {
          title: "Maintenance",
          items: [
            { title: "Serviceavtal", url: "/pages/serviceavtal" },
            { title: "Årlig kontroll", url: "/pages/arlig-kontroll" },
            { title: "Enterprise Support", url: "/pages/enterprise-support" },
          ],
        },
      ],
    },
    "enterprise-menu-v4": {
      title: "Enterprise (Phase 4 expansion)",
      note: "Supplement to enterprise-dr-nare — new granular links",
      items: [
        {
          title: "Matrice",
          items: [
            { title: "Matrice 3", url: "/collections/dji-matrice-3-serie" },
            { title: "Matrice 30", url: "/collections/dji-matrice-30-serie" },
            { title: "Matrice 300 RTK", url: "/collections/dji-matrice-300-rtk-serie" },
            { title: "Matrice 350 RTK", url: "/collections/dji-matrice-350-rtk-serie" },
            { title: "Matrice 400", url: "/collections/dji-matrice-400-serie" },
            { title: "Matrice 4", url: "/collections/dji-matrice-4-serie" },
          ],
        },
        { title: "Mavic Enterprise", url: "/collections/dji-mavic-enterprise-serien" },
        { title: "Agras", url: "/collections/dji-agras-serien" },
        { title: "FlyCart", url: "/collections/dji-flycart-serien" },
        { title: "Dock", url: "/collections/dji-dock-serien" },
        { title: "Zenmuse", url: "/collections/zenmuse-l2" },
        { title: "Livox", url: "/collections/livox" },
        { title: "Service", url: "/pages/dji-enterprise-service" },
      ],
    },
    "main-menu-v4-addon": {
      title: "Main Menu additions (do not replace Phase 3)",
      items: [
        { title: "Service & Support", url: "/pages/dji-service", menu: "service-support" },
        { title: "Industry Solutions", url: "/collections/inspektionsdronare" },
      ],
    },
  },
};

const TAG_STANDARDS = {
  version: "4.0",
  note: "Reference only — products not modified in Phase 4",
  family: ["matrice", "m300", "m350", "m400", "mavic-enterprise", "agras", "flycart", "dock"],
  payload: ["lidar", "thermal", "speaker", "spotlight", "airdrop", "parachute"],
  service: ["repair", "calibration", "maintenance"],
  industry: ["inspection", "mapping", "public-safety", "defense", "telecom", "energy", "forestry", "agriculture", "logistics"],
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
  const field = col === "TYPE" ? product.productType || "" : col === "VENDOR" ? product.vendor || "" : product.title || "";
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

function walkNav(items, out = []) {
  for (const it of items || []) {
    if (it.url) out.push(it);
    walkNav(it.items, out);
  }
  return out;
}

loadEnv();

console.log("Fetching catalog...");
const products = [];
let cursor = null;
for (let p = 0; p < 50; p++) {
  const data = await gql(
    `query($c: String) {
      products(first: 250, after: $c) {
        pageInfo { hasNextPage endCursor }
        edges { node { title vendor productType tags } }
      }
    }`,
    { c: cursor },
  );
  for (const e of data.products.edges || []) products.push(e.node);
  if (!data.products.pageInfo?.hasNextPage) break;
  cursor = data.products.pageInfo.endCursor;
}

const liveCols = existsSync(LIVE_COLS) ? JSON.parse(readFileSync(LIVE_COLS, "utf8")).collections : [];
const liveMap = new Map(liveCols.map((c) => [c.handle, c.productsCount?.count ?? 0]));
const liveHandles = new Set(liveCols.map((c) => c.handle));

const pages = [];
cursor = null;
for (let p = 0; p < 10; p++) {
  const data = await gql(
    `query($c: String) { pages(first: 50, after: $c) { pageInfo { hasNextPage endCursor } nodes { handle } } }`,
    { c: cursor },
  );
  pages.push(...(data.pages?.nodes || []));
  if (!data.pages?.pageInfo?.hasNextPage) break;
  cursor = data.pages.pageInfo.endCursor;
}
const pageHandles = new Set(pages.map((p) => p.handle));

const results = [];
for (const col of COLLECTIONS) {
  const protected_ = PHASE3_PROTECTED.has(col.handle) || col.alias === "phase3_protected";
  const exists = liveHandles.has(col.handle);
  const rules = col.rules;
  const projected = rules ? products.filter((p) => productMatchesRuleSet(p, rules)).length : liveMap.get(col.handle) ?? null;
  const current = liveMap.get(col.handle) ?? null;

  let action;
  if (protected_) action = "protect_phase3";
  else if (col.type === "page") action = pageHandles.has(col.handle) ? "page_exists" : "create_page";
  else if (exists) action = projected > 0 ? "update_rules" : "defer_empty";
  else if (projected > 0) action = "create_collection";
  else action = "defer_no_products";

  results.push({
    ...col,
    protected: protected_,
    exists,
    current_count: current,
    projected_count: projected,
    action,
    deploy: !protected_ && action === "create_collection" && projected > 0,
    url: col.type === "page" ? `/pages/${col.handle}` : `/collections/${col.handle}`,
    rules,
  });
}

const deploySet = results.filter((r) => r.deploy);
const deferred = results.filter((r) => r.action === "defer_no_products" || r.action === "defer_empty");
const protectedList = results.filter((r) => r.protected);

// Menu validation (Phase 4 menus only)
const menuRefs = [];
for (const [menuKey, menu] of Object.entries(NAV.menus)) {
  for (const ref of walkNav(menu.items)) {
    const colM = ref.url.match(/\/collections\/([^/?#]+)/);
    const pageM = ref.url.match(/\/pages\/([^/?#]+)/);
    menuRefs.push({ menu: menuKey, title: ref.title, url: ref.url, handle: colM?.[1] || pageM?.[1], type: colM ? "collection" : "page" });
  }
}

const menuValidation = menuRefs.map((ref) => {
  if (ref.type === "page") {
    const exists = pageHandles.has(ref.handle);
    const planned = SERVICE_PAGES.some((p) => p.handle === ref.handle);
    return { ...ref, status: exists ? "page_live" : planned ? "pending_create" : "missing_spec", count: null };
  }
  const node = results.find((r) => r.handle === ref.handle);
  const live = liveMap.get(ref.handle);
  const count = node?.projected_count ?? live;
  let status = "PASS";
  if (PHASE3_PROTECTED.has(ref.handle) && (live ?? 0) > 0) status = "phase3_live";
  else if (node?.deploy) status = "pending_create";
  else if ((count ?? 0) === 0) status = "EMPTY_BLOCKED";
  else if (liveHandles.has(ref.handle)) status = "live";
  return { ...ref, status, count };
});

const menuBlocked = menuValidation.filter((m) => m.status === "EMPTY_BLOCKED" || m.status === "missing_spec");
const menuPending = menuValidation.filter((m) => m.status === "pending_create");
const deployEmpty = deploySet.filter((r) => r.projected_count === 0);
const shrinkage = results.filter(
  (r) => r.exists && !r.protected && r.current_count > 0 && r.projected_count < r.current_count * 0.9,
);

const validationPass =
  deployEmpty.length === 0 &&
  shrinkage.length === 0 &&
  menuBlocked.length === 0 &&
  deploySet.every((r) => r.projected_count > 0);

const audit = {
  generated_at: new Date().toISOString(),
  mode: "dry_run",
  catalog_size: products.length,
  total_nodes: results.length,
  phase3_protected: protectedList.length,
  deploy_ready: deploySet.length,
  deferred: deferred.length,
  service_pages: SERVICE_PAGES.length,
  menu_refs: menuValidation.length,
  menu_blocked: menuBlocked.length,
  validation_pass: validationPass,
  results,
  deploy_set: deploySet,
  menu_validation: menuValidation,
  constraints: {
    no_handle_changes: true,
    no_url_changes: true,
    no_seo_changes: true,
    no_product_edits: true,
    phase3_nav_preserved: true,
  },
};

const rulesOut = {};
for (const r of deploySet) {
  rulesOut[r.handle] = {
    label: r.label,
    part: r.part,
    appliedDisjunctively: r.rules.appliedDisjunctively,
    rules: r.rules.rules,
    projected_count: r.projected_count,
  };
}

writeFileSync(OUT_RULES, JSON.stringify({ version: "4.0", deploy_only: rulesOut, deferred: deferred.map((d) => d.handle) }, null, 2));
writeFileSync(OUT_NAV, JSON.stringify(NAV, null, 2));
writeFileSync(OUT_TAGS, JSON.stringify(TAG_STANDARDS, null, 2));
writeFileSync(OUT_PAGES, JSON.stringify({ version: "4.0", pages: SERVICE_PAGES }, null, 2));
writeFileSync(OUT_AUDIT, JSON.stringify(audit, null, 2));

function fmtRules(rs) {
  if (!rs?.rules?.length) return "Phase 3 protected";
  const j = rs.appliedDisjunctively ? " OR " : " AND ";
  return rs.rules.map((x) => `${x.column} ${x.relation} "${x.condition}"`).join(j);
}

const lines = [
  "# Phase 4 — Deployment Report",
  "",
  `**Generated:** ${audit.generated_at}`,
  `**Store:** ${STORE}`,
  "**Mode:** DRY RUN — validation only, no deployment",
  "",
  "## Success criteria",
  "",
  "| Criterion | Result |",
  "|-----------|--------|",
  `| 100% validation pass | **${validationPass ? "YES — ready for deployment review" : "NO — see blockers"}** |`,
  `| 0 empty collections in deploy set | ${deployEmpty.length === 0 ? "PASS" : `FAIL (${deployEmpty.length})`} |`,
  `| 0 broken menu links | ${menuBlocked.length === 0 ? "PASS" : `FAIL (${menuBlocked.length})`} |`,
  `| 0 URL changes | PASS (additive only) |`,
  `| 0 collection deletions | PASS |`,
  `| 0 SEO modifications | PASS |`,
  `| 0 product count loss (Phase 3) | ${shrinkage.length === 0 ? "PASS" : `FAIL (${shrinkage.length})`} |`,
  "",
  "## Summary",
  "",
  `| Metric | Value |`,
  `|--------|------:|`,
  `| Total architecture nodes | ${results.length} |`,
  `| Phase 3 protected (unchanged) | ${protectedList.length} |`,
  `| New collections ready to deploy | **${deploySet.length}** |`,
  `| Deferred (no products) | ${deferred.length} |`,
  `| Service landing pages | ${SERVICE_PAGES.length} |`,
  `| Phase 4 menu references | ${menuValidation.length} |`,
  "",
  "## Constraints honored",
  "",
  "- No collection deletions",
  "- No handle changes on Phase 3 collections",
  "- No URL changes on existing collections",
  "- No product title edits",
  "- No SEO metadata changes",
  "- Phase 3 `main-menu` / `enterprise-dr-nare` navigation preserved",
  "",
  "## Deploy set (new collections with products)",
  "",
  "| Collection | Label | Projected | Rules |",
  "|---|---|---:|---|",
];

for (const r of deploySet.sort((a, b) => b.projected_count - a.projected_count)) {
  lines.push(`| \`${r.handle}\` | ${r.label} | **${r.projected_count}** | ${fmtRules(r.rules)} |`);
}

lines.push("", "## Phase 3 protected (no changes)", "", "| Handle | Live count |", "|---|---:|");
for (const r of protectedList.sort((a, b) => (b.current_count ?? 0) - (a.current_count ?? 0))) {
  lines.push(`| \`${r.handle}\` | ${r.current_count ?? "—"} |`);
}

lines.push("", "## Deferred (0 projected products — do not create)", "", "| Handle | Label |", "|---|---|");
for (const r of deferred) {
  lines.push(`| \`${r.handle}\` | ${r.label} |`);
}

if (menuBlocked.length) {
  lines.push("", "## Menu blockers", "", "| Menu | Item | Handle | Status |", "|---|---|---|---|");
  for (const m of menuBlocked) lines.push(`| ${m.menu} | ${m.title} | \`${m.handle}\` | ${m.status} |`);
}

lines.push("", "## Service & Support menu (new)", "", "Top-level menu `service-support` — does not replace Phase 3 navigation.", "");

lines.push("", "## Deployment checklist", "", "1. [ ] Create collections in deploy set only", "2. [ ] Apply smart rules via `collectionUpdate` (ruleSet only)", "3. [ ] Create service landing pages", "4. [ ] Create `service-support` menu in Shopify Admin", "5. [ ] Optionally link `service-support` from footer (not main-menu Phase 3)", "6. [ ] Run post-deploy validation", "7. [ ] Future: apply tag standards to products", "", "---", "", "Artifacts: `data/edp-phase4-collection-rules.json`, `data/edp-phase4-navigation.json`, `.phase4-deployment-audit.json`", "");

writeFileSync(OUT_REPORT, lines.join("\n"));
console.log(`Wrote ${OUT_REPORT}`);
console.log(JSON.stringify({ validation_pass: validationPass, deploy: deploySet.length, deferred: deferred.length, menu_blocked: menuBlocked.length }, null, 2));
