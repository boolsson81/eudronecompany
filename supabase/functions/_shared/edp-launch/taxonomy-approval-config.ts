/**
 * Phase 0 — Operator-approved taxonomy (2026-06-13).
 * READ-ONLY until merge/menu/handle phases are explicitly executed.
 * No redirects. Brand-new store — no legacy URL preservation.
 */

export const TAXONOMY_VERSION = "phase0-approved-2026-06-13";

/** Approved absorb → canonical merges (execute only after final sign-off) */
export const APPROVED_MERGE_PLAN = [
  {
    canonical: "dji-air-3-serien",
    absorb: "dij-air-3-serien",
    reason: "Typo duplicate handle (dij vs dji) → canonical DJI Air 3 series",
  },
  {
    canonical: "dronartillbehor-kop",
    absorb: "dronartillbehor-dronar",
    reason: "Overlapping general drone accessories collections",
  },
  {
    canonical: "filter-till-dronare",
    absorb: "filter-dronare-lins",
    reason: "Duplicate drone filter collections",
  },
  {
    canonical: "dji-matrice-serien",
    absorb: "dji-matrice-3-serien",
    reason: "Mislabeled Matrice 4 series handle → Matrice parent",
  },
  {
    canonical: "dji-matrice-serien",
    absorb: "dji-matrice-4-serie",
    reason: "Fragmented Matrice 4 handle → Matrice parent",
  },
] as const;

/** Explicitly rejected merges — keep separate collections */
export const REJECTED_MERGE_PLAN = [
  {
    keep: ["dji-mini-4-serien", "dji-mini-4-pro-tillbehor"],
    reason: "Model series vs accessories serve different customer intents",
  },
  {
    keep: ["dji-mavic-3-serien", "dji-mavic-3-tillbehor"],
    reason: "Model series vs accessories serve different customer intents",
  },
  {
    keep: ["dji-mavic-3-serien", "dji-mavic-3-classic", "dji-mavic-3-classic-1"],
    reason: "Mavic 3 model variants remain separate from series parent",
  },
  {
    keep: ["dji-mavic-3-tillbehor", "tillbehor-dji-mavic-3-cine"],
    reason: "Mavic 3 accessory sub-collections remain separate",
  },
  {
    keep: ["dronare-med-kamera", "dronare-actionking"],
    reason: "Consumer landing collections — review overlap manually, do not auto-merge",
  },
] as const;

/** Hidden catalog — keep collection, exclude from primary navigation */
export const HIDDEN_CATALOG_HANDLES = ["alla-produkter"] as const;

/** Legacy / hidden — GoPro & action-camera; keep products, exclude from nav */
export const LEGACY_HIDDEN_PATTERNS = [
  /^gopro/i,
  /actionkamer/i,
  /action-kamer/i,
  /^fasten-adaptrar-actionkameror$/,
  /^kamerakablar-actionking$/,
] as const;

export const LEGACY_HIDDEN_HANDLES = [
  "gopro-batterier",
  "gopro-hero13-black-skydd",
  "gopro-hero13-vaska",
  "gopro-tillbehor-vendors",
  "fasten-adaptrar-actionkameror",
  "kamerakablar-actionking",
] as const;

/** Enterprise accessory collections — under Enterprise Drones, not consumer Accessories */
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
] as const;

/** Approved top-level navigation — current handles only */
export const APPROVED_MENU = {
  "Consumer Drones": {
    landing: "dronare-med-kamera",
    children: [
      {
        label: "DJI Mini",
        handles: ["dji-mini-3-serien", "dji-mini-4-serien", "dji-mini-5-serien", "dji-mini-3", "dji-mini-4-pro"],
      },
      {
        label: "DJI Air",
        handles: ["dji-air-serien", "dji-air-3-serien", "dji-air-3", "dji-air-3s"],
      },
      {
        label: "DJI Mavic",
        handles: ["dji-mavic-serien", "dji-mavic-3-serien", "dji-mavic-4-serien"],
      },
      { label: "DJI Flip", handles: ["dji-flip-dronare"] },
      { label: "DJI Neo", handles: ["dji-neo"] },
      {
        label: "DJI Avata",
        handles: ["dji-avata-serien", "dji-avata-pro-fpv-dronare"],
      },
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
      {
        label: "Enterprise Accessories",
        handles: [...ENTERPRISE_ACCESSORY_HANDLES],
      },
    ],
  },
  "Spare Parts": {
    landing: "dji-dronar-reservdelar",
    children: [
      { label: "Motors", handle: "reservdelar-gimbal-dronare-motorer" },
      { label: "Arms", handle: null, note: "No dedicated collection — manual review" },
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
      {
        label: "Landing Gear",
        handles: ["landningsstall-dronare", "dronarmatta-landning-skydd", "skydd-dronare"],
      },
      {
        label: "Controllers",
        handles: ["fjarrkontroll-dronare", "dronar-fjarrkontrollstillbehor", "dji-rc-fjarrkontroller", "dji-rc-pro-tillbehor"],
      },
      { label: "Antennas", handle: null, note: "No dedicated collection — manual review" },
      { label: "Lighting", handle: "belysning-till-dronare" },
      {
        label: "DJI Mini 4 Pro Accessories",
        handle: "dji-mini-4-pro-tillbehor",
      },
      {
        label: "DJI Mavic 3 Accessories",
        handles: ["dji-mavic-3-tillbehor", "tillbehor-dji-mavic-3-cine"],
      },
    ],
  },
  "Payloads & Sensors": {
    landing: "enterprise-sensorer",
    children: [
      { label: "Cameras", handles: ["dronar-kameror", "enterprise-sensorer"] },
      { label: "LiDAR", handle: null, note: "No dedicated collection — manual review" },
      { label: "Thermal Payloads", handle: null, note: "Review vs Enterprise Thermal drones" },
      { label: "Searchlights", handle: "enterprise-belysning" },
      { label: "Speakers", handle: "enterprise-hogtalarsystem" },
      { label: "Airdrop Systems", handle: "airdrop-system" },
    ],
  },
  Brands: {
    landing: "dji",
    children: [
      { label: "DJI", handle: "dji" },
      { label: "CZI", handle: null, note: "Collection not on store — manual review" },
      { label: "Sunnylife", handle: "vendors-q-sunnylife" },
      { label: "PGYTECH", handle: "pgytech-tillbehor" },
      { label: "PolarPro", handle: "polarpro" },
      { label: "Master Airscrew", handle: "master-airscrew-dji-propellrar" },
      { label: "BRDRC", handle: "brdrc-tillbehor" },
      { label: "STARTRC", handle: null, note: "Collection not on store — manual review" },
    ],
  },
  Support: {
    landing: "reparera-precisionsverktyg-elektronik",
    children: [
      {
        label: "Repair Tools",
        handles: [
          "reparera-precisionsverktyg-elektronik",
          "bandverktyg",
          "skruvmejsel-set",
          "pincetter-actionking",
          "tanger-actionking",
        ],
      },
      { label: "Cleaning", handle: "rengoringsprodukter-actionking" },
      { label: "Service", handle: "enterprise-service-dronare" },
      { label: "Warranty", handle: null, note: "Page/collection TBD — manual review" },
      { label: "Downloads", handle: null, note: "Page/collection TBD — manual review" },
    ],
  },
} as const;

export function isLegacyHidden(handle: string, title = ""): boolean {
  const h = handle.toLowerCase();
  const brandNav = ["vendors-q-sunnylife", "polarpro", "pgytech-tillbehor", "brdrc-tillbehor", "master-airscrew-dji-propellrar", "dji"];
  if (brandNav.includes(h)) return false;
  if ((LEGACY_HIDDEN_HANDLES as readonly string[]).includes(h)) return true;
  if (/^gopro/i.test(h)) return true;
  if (/actionkamer/i.test(h) && /^(fasten-adaptrar|kamerakablar)/.test(h)) return true;
  return false;
}

export function collectApprovedNavHandles(): Set<string> {
  const set = new Set<string>();
  for (const section of Object.values(APPROVED_MENU)) {
    if (section.landing) set.add(section.landing);
    for (const child of section.children) {
      if ("handle" in child && child.handle) set.add(child.handle);
      if ("handles" in child && child.handles) {
        for (const h of child.handles) {
          if (h) set.add(h);
        }
      }
    }
  }
  return set;
}
