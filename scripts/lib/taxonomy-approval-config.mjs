/**
 * Phase 0 approved taxonomy — shared by report scripts (mirrors taxonomy-approval-config.ts).
 */

export const TAXONOMY_VERSION = "phase0-approved-2026-06-13";

export const APPROVED_MERGE_PLAN = [
  { canonical: "dji-air-3-serien", absorb: "dij-air-3-serien", reason: "Typo duplicate (dij vs dji) → DJI Air 3 series" },
  { canonical: "dronartillbehor-kop", absorb: "dronartillbehor-dronar", reason: "Overlapping general drone accessories" },
  { canonical: "filter-till-dronare", absorb: "filter-dronare-lins", reason: "Duplicate drone filter collections" },
  { canonical: "dji-matrice-serien", absorb: "dji-matrice-3-serien", reason: "Mislabeled Matrice 4 series → Matrice parent" },
  { canonical: "dji-matrice-serien", absorb: "dji-matrice-4-serie", reason: "Fragmented Matrice 4 handle → Matrice parent" },
];

/** English handles on live store (when Swedish source handles are already renamed) */
export const LIVE_MERGE_PLAN = [
  { canonical: "dji-matrice-series", absorb: "dji-matrice-3-series", reason: "Mislabeled Matrice 4 series → Matrice parent" },
  { canonical: "dji-matrice-series", absorb: "dji-matrice-4-series", reason: "Fragmented Matrice 4 handle → Matrice parent" },
];

export function resolveMergePlan(collections) {
  const handles = new Set(collections.map((c) => c.handle));
  const plan = [];
  const seen = new Set();
  for (const m of [...APPROVED_MERGE_PLAN, ...LIVE_MERGE_PLAN]) {
    const key = `${m.absorb}→${m.canonical}`;
    if (handles.has(m.absorb) && handles.has(m.canonical) && !seen.has(key)) {
      plan.push(m);
      seen.add(key);
    }
  }
  return plan;
}

export const REJECTED_MERGE_PLAN = [
  { keep: ["dji-mini-4-serien", "dji-mini-4-pro-tillbehor"], reason: "Model series vs accessories — different intents" },
  { keep: ["dji-mavic-3-serien", "dji-mavic-3-tillbehor"], reason: "Model series vs accessories — different intents" },
  { keep: ["dji-mavic-3-serien", "dji-mavic-3-classic", "dji-mavic-3-classic-1"], reason: "Mavic 3 variants stay separate" },
  { keep: ["dji-mavic-3-tillbehor", "tillbehor-dji-mavic-3-cine"], reason: "Mavic 3 accessory sub-collections stay separate" },
  { keep: ["dronare-med-kamera", "dronare-actionking"], reason: "Review overlap manually — no auto-merge" },
];

export const HIDDEN_CATALOG_HANDLES = ["alla-produkter", "all-products"];

export const LEGACY_HIDDEN_HANDLES = [
  "gopro-batterier",
  "gopro-hero13-black-skydd",
  "gopro-hero13-vaska",
  "gopro-tillbehor-vendors",
  "fasten-adaptrar-actionkameror",
  "kamerakablar-actionking",
];

export const LEGACY_HIDDEN_PATTERNS = [
  /^gopro/i,
  /actionkamer/i,
  /action-kamer/i,
  /^fasten-adaptrar-actionkameror$/,
  /^kamerakablar-actionking$/,
];

export const ENTERPRISE_ACCESSORY_HANDLES = [
  "enterprise-tillbehor",
  "enterprise-dronartillbehor",
  "enterprise-propellrar",
  "dji-enterprise-fjarrkontroller",
  "dji-matrice-30-serie-tillbehor",
  "dji-matrice-350-rtk-tillbehor",
  "dji-matrice-4-tillbehor",
  "dji-mavic-3m-dronare-tillbehor",
  "dji-mavic-serien-enterprise",
  "tillbehor-dji-mavic-dronare",
];

export const APPROVED_MENU = {
  "Consumer Drones": {
    landing: "dronare-med-kamera",
    children: [
      { label: "DJI Mini", handles: ["dji-mini-3-serien", "dji-mini-4-serien", "dji-mini-5-serien", "dji-mini-3", "dji-mini-4-pro"] },
      { label: "DJI Air", handles: ["dji-air-serien", "dji-air-3-serien", "dji-air-3", "dji-air-3s"] },
      { label: "DJI Mavic", handles: ["dji-mavic-serien", "dji-mavic-3-serien", "dji-mavic-4-serien"] },
      { label: "DJI Flip", handles: ["dji-flip-dronare"] },
      { label: "DJI Neo", handles: ["dji-neo"] },
      { label: "DJI Avata", handles: ["dji-avata-serien", "dji-avata-pro-fpv-dronare"] },
    ],
  },
  "Enterprise Drones": {
    landing: "enterprise-dronare",
    children: [
      { label: "Matrice", handles: ["dji-matrice-serien", "dji-matrice-400-serien"] },
      { label: "FlyCart", handles: ["dji-flycart-serien", "dji-flycart-100-lastdronare"] },
      { label: "Agras", handles: ["dji-agras-dronare"] },
      { label: "Mapping", handles: ["kartlaggnings-och-matdronare"] },
      { label: "Thermal", handles: ["dronare-med-varmekamera"] },
      { label: "Enterprise Accessories", handles: [...ENTERPRISE_ACCESSORY_HANDLES] },
    ],
  },
  "Spare Parts": {
    landing: "dji-dronar-reservdelar",
    children: [
      { label: "Motors", handle: "reservdelar-gimbal-dronare-motorer" },
      { label: "Arms", handle: null, note: "No dedicated collection" },
      { label: "Gimbals", handle: "reservdelar-gimbal-dronare-motorer" },
      { label: "Propellers", handles: ["dronare-propeller-tillbehor", "dronarpropellrar-tysta"] },
      { label: "Flight Electronics", handle: "dronarelektronik-flight-components" },
      { label: "Repair Parts", handles: ["dji-dronar-reservdelar", "reparation-dji-neo-reservdelar"] },
    ],
  },
  Accessories: {
    landing: "dronartillbehor-kop",
    children: [
      { label: "Filters", handle: "filter-till-dronare" },
      { label: "Bags & Cases", handles: ["dronarryggsack-vaskor", "kapor-till-dronare"] },
      { label: "Chargers", handle: "batterier" },
      { label: "Landing Gear", handles: ["landningsstall-dronare", "dronarmatta-landning-skydd", "skydd-dronare"] },
      { label: "Controllers", handles: ["fjarrkontroll-dronare", "dronar-fjarrkontrollstillbehor", "dji-rc-fjarrkontroller", "dji-rc-pro-tillbehor"] },
      { label: "Antennas", handle: null, note: "No dedicated collection" },
      { label: "Lighting", handle: "belysning-till-dronare" },
      { label: "DJI Mini 4 Pro Accessories", handle: "dji-mini-4-pro-tillbehor" },
      { label: "DJI Mavic 3 Accessories", handles: ["dji-mavic-3-tillbehor", "tillbehor-dji-mavic-3-cine"] },
    ],
  },
  "Payloads & Sensors": {
    landing: "enterprise-sensorer",
    children: [
      { label: "Cameras", handles: ["dronar-kameror", "enterprise-sensorer"] },
      { label: "LiDAR", handle: null, note: "No dedicated collection" },
      { label: "Thermal Payloads", handle: null, note: "Review vs Enterprise Thermal" },
      { label: "Searchlights", handle: "enterprise-belysning" },
      { label: "Speakers", handle: "enterprise-hogtalarsystem" },
      { label: "Airdrop Systems", handle: "airdrop-system" },
    ],
  },
  Brands: {
    landing: "dji",
    children: [
      { label: "DJI", handle: "dji" },
      { label: "CZI", handle: null, note: "Not on store" },
      { label: "Sunnylife", handle: "vendors-q-sunnylife" },
      { label: "PGYTECH", handle: "pgytech-tillbehor" },
      { label: "PolarPro", handle: "polarpro" },
      { label: "Master Airscrew", handle: "master-airscrew-dji-propellrar" },
      { label: "BRDRC", handle: "brdrc-tillbehor" },
      { label: "STARTRC", handle: null, note: "Not on store" },
    ],
  },
  Support: {
    landing: "reparera-precisionsverktyg-elektronik",
    children: [
      {
        label: "Repair Tools",
        handles: ["reparera-precisionsverktyg-elektronik", "bandverktyg", "skruvmejsel-set", "pincetter-actionking", "tanger-actionking"],
      },
      { label: "Cleaning", handle: "rengoringsprodukter-actionking" },
      { label: "Service", handle: "enterprise-service-dronare" },
      { label: "Warranty", handle: null, note: "Page TBD" },
      { label: "Downloads", handle: null, note: "Page TBD" },
    ],
  },
};

export function isLegacyHidden(handle, title = "") {
  const h = handle.toLowerCase();
  const t = title.toLowerCase();
  const brandNav = ["vendors-q-sunnylife", "polarpro", "pgytech-tillbehor", "brdrc-tillbehor", "master-airscrew-dji-propellrar", "dji"];
  if (brandNav.includes(h)) return false;
  if (LEGACY_HIDDEN_HANDLES.includes(h)) return true;
  if (/^gopro/i.test(h)) return true;
  if (/actionkamer/i.test(h) && /^(fasten-adaptrar|kamerakablar)/.test(h)) return true;
  return false;
}

export function collectApprovedNavHandles() {
  const set = new Set();
  for (const section of Object.values(APPROVED_MENU)) {
    if (section.landing) set.add(section.landing);
    for (const child of section.children) {
      if (child.handle) set.add(child.handle);
      if (child.handles) child.handles.forEach((h) => h && set.add(h));
    }
  }
  return set;
}

export const ABSORB_HANDLES = new Set(APPROVED_MERGE_PLAN.map((m) => m.absorb));

export const TOP_LEVEL_CATEGORIES = [
  "Consumer Drones",
  "Enterprise Drones",
  "Enterprise Accessories",
  "Spare Parts",
  "Accessories",
  "Payloads & Sensors",
  "Brands",
  "Support",
  "Legacy / Hidden",
  "Hidden Catalog",
  "Manual Review",
];

export function classifyApproved(handle, title) {
  const h = handle.toLowerCase();
  const t = title.toLowerCase();

  if (HIDDEN_CATALOG_HANDLES.includes(h)) return "Hidden Catalog";
  if (isLegacyHidden(h, t)) return "Legacy / Hidden";
  if (ENTERPRISE_ACCESSORY_HANDLES.includes(h)) return "Enterprise Accessories";

  if (/^(polarpro|pgytech|brdrc|master-airscrew|vendors-q-sunnylife)/.test(h) || h === "dji") return "Brands";
  if (/^amagisn/.test(h)) return "Manual Review";

  if (/bandverktyg|pincetter|tanger|skruvmejsel|rengoringsprodukter|reparera-precisionsverktyg/.test(h)) return "Support";
  if (h === "enterprise-service-dronare") return "Support";

  if (/reservdelar|reparation-dji|dronarelektronik|gimbal-dronare-motorer/.test(h)) return "Spare Parts";
  if (/dronare-propeller|dronarpropellrar|propellerskydd/.test(h)) return "Spare Parts";

  if (/enterprise-sensorer|enterprise-belysning|enterprise-hogtalarsystem|enterprise-lyftsystem|dronar-kameror|airdrop-system/.test(h)) {
    return "Payloads & Sensors";
  }

  if (
    /enterprise-dronare|inspektionsdronare|jordbruksdronare|skogsbruksdronare|kartlaggnings|last-och-transport|flycart|dji-matrice|dji-agras|dji-inspire|dronare-med-varmekamera|dji-mavic-3-enterprise|dji-marvic-enterprise|dji-mavic-serien-enterprise/.test(h) ||
    h === "dji-dronare"
  ) {
    return "Enterprise Drones";
  }

  if (
    /tillbehor|filter-|filter-dronare|batterier|vaska|vaskor|ryggsack|kapor-till|landnings|skydd-dronare|fjarrkontroll|belysning-till-dronare|kablar|minneskort|dronarmatta|usb-kablar|vattentatt|ji-mini-.*-filter|dji-rc-/.test(h)
  ) {
    return "Accessories";
  }

  if (/dji-mavic-3-classic/.test(h) && /tillbehor/i.test(t)) return "Accessories";
  if (/dji-mavic-4-pro/.test(h) && /tillbehor/i.test(t)) return "Accessories";

  if (/^dronare-med-kamera|^dij-air-3/.test(h)) return "Consumer Drones";

  if (/dji-(mini|air|mavic|avata|flip|neo|phantom|fpv)/.test(h) && !/tillbehor|filter|propeller|batteri|vaska|fjarrkontroll|matrice|agras|inspire|enterprise/.test(h)) {
    return "Consumer Drones";
  }

  if (/dji-air-2|dji-mavic-2/.test(h) && !/tillbehor/.test(h)) return "Consumer Drones";

  if (/energi-infrastruktur|transport-logistik/.test(h)) return "Manual Review";

  if (h === "dronare-actionking") return "Manual Review";

  if (/ringlampa|multiverktyg|fasten-adaptrar/.test(h)) return "Manual Review";

  return "Manual Review";
}
