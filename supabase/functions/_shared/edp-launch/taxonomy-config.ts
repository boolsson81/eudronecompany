/**
 * Phase 0 — Final category & menu taxonomy (English target handles).
 * Source handles from live store are mapped via HANDLE_OVERRIDES + slug-en.
 *
 * Approve this structure before any handle rename or menu wiring.
 */

export type TaxonomyNode = {
  id: string;
  title: string;
  /** Target English handle after rename */
  target_handle: string;
  /** Live Swedish/source handles that feed this node */
  source_handles?: string[];
  kind?: "collection" | "page";
  url?: string;
  children?: TaxonomyNode[];
  notes?: string;
};

/** Final category hierarchy for EuroDroneParts launch */
export const CATEGORY_HIERARCHY: TaxonomyNode[] = [
  {
    id: "consumer-drones",
    title: "Consumer Drones",
    target_handle: "consumer-drones",
    source_handles: ["konsumentdronare", "dronare-actionking", "dronare-med-kamera", "alla-produkter"],
    children: [
      {
        id: "dji-mini",
        title: "DJI Mini",
        target_handle: "dji-mini-4-series",
        source_handles: ["dji-mini-3-serien", "dji-mini-4-serien", "dji-mini-5-serien", "dji-mini-3", "dji-mini-4-pro"],
      },
      {
        id: "dji-air",
        title: "DJI Air",
        target_handle: "dji-air-3-series",
        source_handles: ["dji-air-3-serien", "dij-air-3-serien", "dji-air-serien", "dji-air-3", "dji-air-3s"],
      },
      {
        id: "dji-mavic",
        title: "DJI Mavic",
        target_handle: "dji-mavic-3-series",
        source_handles: ["dji-mavic-3-serien", "dji-mavic-4-serien", "dji-mavic-serien", "dji-mavic-3-pro-avancerad-dronarteknik"],
      },
      {
        id: "dji-avata",
        title: "DJI Avata / FPV",
        target_handle: "dji-avata-series",
        source_handles: ["dji-avata-serien", "dji-avata", "dji-avata-pro-fpv-dronare", "dji-fpv-tillbehor"],
      },
      {
        id: "dji-flip",
        title: "DJI Flip",
        target_handle: "dji-flip-drones",
        source_handles: ["dji-flip-dronare", "dji-flip-batteri-tillbehor"],
      },
      {
        id: "dji-neo",
        title: "DJI Neo",
        target_handle: "dji-neo-drones",
        source_handles: ["dji-neo"],
      },
    ],
  },
  {
    id: "enterprise-drones",
    title: "Enterprise Drones",
    target_handle: "enterprise-drones",
    source_handles: ["enterprise-dronare", "dji-dronare", "inspektionsdronare", "jordbruksdronare"],
    children: [
      {
        id: "dji-matrice",
        title: "DJI Matrice",
        target_handle: "dji-matrice-series",
        source_handles: ["dji-matrice-serien", "dji-matrice-4-serie", "dji-matrice-3-serien", "dji-matrice-400-serien"],
      },
      {
        id: "dji-agras",
        title: "DJI Agras",
        target_handle: "dji-agras-drones",
        source_handles: ["dji-agras-dronare"],
      },
      {
        id: "dji-dock",
        title: "DJI Dock / FlyCart",
        target_handle: "dji-matrice-400-series",
        source_handles: ["dji-flycart-serien", "dji-flycart-100-lastdronare"],
      },
      {
        id: "enterprise-accessories",
        title: "Enterprise Accessories",
        target_handle: "enterprise-accessories",
        source_handles: ["enterprise-tillbehor", "enterprise-dronartillbehor", "enterprise-sensorer"],
      },
      {
        id: "mapping-survey",
        title: "Mapping & Survey",
        target_handle: "mapping-survey-drones",
        source_handles: ["kartlaggnings-och-matdronare"],
      },
      {
        id: "cargo-transport",
        title: "Cargo & Transport",
        target_handle: "cargo-transport-drones",
        source_handles: ["last-och-transportdronare", "transport-logistik"],
      },
    ],
  },
  {
    id: "accessories",
    title: "Drone Accessories",
    target_handle: "consumer-drone-accessories",
    source_handles: ["tillbehor-konsumentdronare", "dronartillbehor-kop", "dronartillbehor-dronar"],
    children: [
      { id: "filters", title: "Filters", target_handle: "drone-filters", source_handles: ["filter-till-dronare", "filter-dronare-lins"] },
      { id: "propellers", title: "Propellers", target_handle: "drone-propeller-accessories", source_handles: ["dronare-propeller-tillbehor", "dronarpropellrar-tysta"] },
      { id: "batteries", title: "Batteries", target_handle: "batteries", source_handles: ["batterier"] },
      { id: "bags", title: "Bags & Backpacks", target_handle: "drone-backpacks-bags", source_handles: ["dronarryggsack-vaskor", "kapor-till-dronare"] },
      { id: "remote-control", title: "Remote Control", target_handle: "drone-remote-control-accessories", source_handles: ["dronar-fjarrkontrollstillbehor", "fjarrkontroll-dronare"] },
      { id: "spare-parts", title: "Spare Parts", target_handle: "dji-drone-spare-parts", source_handles: ["dji-dronar-reservdelar", "reservdelar-gimbal-dronare-motorer"] },
      { id: "lighting", title: "Lighting", target_handle: "drone-lighting", source_handles: ["belysning-till-dronare"] },
    ],
  },
  {
    id: "dji-accessories-by-model",
    title: "DJI Accessories by Model",
    target_handle: "dji",
    source_handles: ["dji"],
    children: [
      { id: "mavic-3-acc", title: "DJI Mavic 3", target_handle: "dji-mavic-3-accessories", source_handles: ["dji-mavic-3-tillbehor", "dji-mavic-3-pro-tillbehor"] },
      { id: "mini-3-acc", title: "DJI Mini 3", target_handle: "dji-mini-3-accessories", source_handles: ["dji-mini-3-tillbehor", "tillbehor-dji-mini-4"] },
      { id: "air-3-acc", title: "DJI Air 3", target_handle: "dji-air-3-accessories", source_handles: ["dji-air-3-tillbehor-omfattande-sortiment", "tillbehor-till-dji-air-3-serien"] },
      { id: "avata-acc", title: "DJI Avata", target_handle: "dji-avata-accessories", source_handles: ["dji-avata-tillbehor", "dji-avata-2-tillbehor"] },
      { id: "neo-acc", title: "DJI Neo", target_handle: "dji-neo-accessories", source_handles: ["dji-neo-tillbehor", "dji-neo-2-tillbehor", "tillbehor-dji-neo"] },
    ],
  },
  {
    id: "solutions",
    title: "Solutions",
    target_handle: "energy-infrastructure",
    kind: "page",
    children: [
      { id: "energy", title: "Energy & Infrastructure", target_handle: "energy-infrastructure", kind: "page", source_handles: ["energi-infrastruktur"] },
      { id: "gis", title: "GIS & Mapping", target_handle: "gis-mapping", kind: "page", source_handles: ["gis-kartlaggning"] },
      { id: "emergency", title: "Emergency Services", target_handle: "emergency-services", kind: "page", source_handles: ["raddningstjanst"] },
    ],
  },
];

/** Explicit merge directives: absorb source → canonical (pre-rename Swedish handles) */
export const COLLECTION_MERGE_PLAN: Array<{
  canonical_handle: string;
  absorb_handles: string[];
  reason: string;
}> = [
  {
    canonical_handle: "dji-air-3-serien",
    absorb_handles: ["dij-air-3-serien"],
    reason: "Typo duplicate of Air 3 series (dij vs dji)",
  },
  {
    canonical_handle: "dronartillbehor-kop",
    absorb_handles: ["dronartillbehor-dronar"],
    reason: "Overlapping drone accessories collections",
  },
  {
    canonical_handle: "filter-till-dronare",
    absorb_handles: ["filter-dronare-lins"],
    reason: "Duplicate drone filter collections",
  },
  {
    canonical_handle: "dji-matrice-serien",
    absorb_handles: ["dji-matrice-3-serien", "dji-matrice-4-serie"],
    reason: "Matrice series fragmented across handles",
  },
];

/** Menu hierarchy mirrors CATEGORY_HIERARCHY — wired after taxonomy approval */
export const MENU_HIERARCHY = {
  main_menu: {
    handle: "main-menu",
    title: "Main menu",
    sections: ["consumer-drones", "enterprise-drones", "solutions", "accessories", "guides"],
  },
  enterprise_menu: {
    handle: "enterprise-drones",
    title: "Enterprise Drones",
    sections: ["enterprise-drones", "dji-matrice", "dji-agras", "enterprise-accessories"],
  },
  footer: {
    handle: "footer",
    title: "Footer menu",
    sections: ["about", "contact", "policies"],
  },
} as const;

/** Flatten taxonomy nodes for lookup */
export function flattenTaxonomy(nodes: TaxonomyNode[] = CATEGORY_HIERARCHY): TaxonomyNode[] {
  const out: TaxonomyNode[] = [];
  for (const n of nodes) {
    out.push(n);
    if (n.children?.length) out.push(...flattenTaxonomy(n.children));
  }
  return out;
}

/** Map every source handle to its taxonomy target */
export function buildTaxonomyHandleMap(): Map<string, TaxonomyNode> {
  const map = new Map<string, TaxonomyNode>();
  for (const node of flattenTaxonomy()) {
    map.set(node.target_handle, node);
    for (const src of node.source_handles || []) {
      map.set(src, node);
    }
  }
  return map;
}
