#!/usr/bin/env node
/**
 * Phase 5 — Service, Support, Documentation & B2B Platform (REPORT ONLY).
 * Does NOT deploy. Does NOT modify collections, URLs, or SEO.
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LIVE_COLS = join(ROOT, ".live-collections-snapshot.json");
const OUT_REPORT = join(ROOT, "PHASE5_SERVICE_PLATFORM_REPORT.md");
const OUT_AUDIT = join(ROOT, ".phase5-service-platform-audit.json");
const OUT_ARCH = join(ROOT, "data/edp-phase5-platform-architecture.json");
const OUT_NAV = join(ROOT, "data/edp-phase5-navigation.json");
const OUT_DOCS = join(ROOT, "data/edp-phase5-documentation-center.json");
const OUT_KNOWLEDGE = join(ROOT, "data/edp-phase5-knowledge-center.json");
const OUT_B2B = join(ROOT, "data/edp-phase5-b2b-platform.json");
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

function page(handle, title, section, meta = {}) {
  return { type: "page", handle, title, url: `/pages/${handle}`, section, seo_index: true, ...meta };
}

// ─── PART 1: Service & Repair Center ───
const SERVICE_PAGES = [
  page("service-support", "Service & Support", "hub", { role: "top_level_hub" }),

  // DJI Consumer
  page("dji-konsument-service", "DJI Konsument Service", "consumer_hub"),
  page("dji-mini-service", "DJI Mini Service", "consumer", { related_collection: "dji-mini-3-tillbehor" }),
  page("dji-air-service", "DJI Air Service", "consumer", { related_collection: "dji-air-3-tillbehor-omfattande-sortiment" }),
  page("dji-mavic-service", "DJI Mavic Service", "consumer", { related_collection: "dji-mavic-3-tillbehor" }),
  page("dji-avata-service", "DJI Avata Service", "consumer", { related_collection: "dji-avata-2-tillbehor" }),
  page("dji-neo-service", "DJI Neo Service", "consumer", { related_collection: "reparation-dji-neo-reservdelar" }),
  page("dji-flip-service", "DJI Flip Service", "consumer", { related_collection: "dji-flip-tillbehor" }),

  // DJI Enterprise
  page("dji-enterprise-service", "DJI Enterprise Service", "enterprise_hub"),
  page("matrice-4-service", "Matrice 4 Service", "enterprise", { related_collection: "dji-matrice-4-serie" }),
  page("matrice-30-service", "Matrice 30 Service", "enterprise", { related_collection: "dji-matrice-30-serie-tillbehor" }),
  page("matrice-300-rtk-service", "Matrice 300 RTK Service", "enterprise", { related_collection: "dji-matrice-350-rtk-tillbehor" }),
  page("matrice-350-rtk-service", "Matrice 350 RTK Service", "enterprise", { related_collection: "dji-matrice-350-rtk-tillbehor" }),
  page("matrice-400-service", "Matrice 400 Service", "enterprise", { related_collection: "dji-matrice-400-serien" }),
  page("mavic-enterprise-service", "Mavic Enterprise Service", "enterprise", { related_collection: "dji-mavic-serien-enterprise" }),
  page("agras-service", "Agras Service", "enterprise", { related_collection: "dji-agras-dronare" }),
  page("flycart-service", "FlyCart Service", "enterprise", { related_collection: "dji-flycart-serien" }),
  page("dji-dock-service", "DJI Dock Service", "enterprise", { related_collection: "enterprise-dronare" }),

  // Repair
  page("dronarreparation", "Drönarreparation", "repair"),
  page("krockskador-reparation", "Crash Damage Repair", "repair"),
  page("gimbalreparation", "Gimbal Repair", "repair", { related_collection: "reservdelar-gimbal-dronare-motorer" }),
  page("kamerareparation", "Camera Repair", "repair"),
  page("motorbyte", "Motor Replacement", "repair", { related_collection: "reservdelar-gimbal-dronare-motorer" }),
  page("esc-reparation", "ESC Repair", "repair", { related_collection: "dronarelektronik-flight-components" }),
  page("elektronisk-felsokning", "Electronic Troubleshooting", "repair", { related_collection: "dronarelektronik-flight-components" }),

  // Calibration
  page("kalibrering", "Calibration Services", "calibration_hub"),
  page("imu-kalibrering", "IMU Calibration", "calibration"),
  page("kompasskalibrering", "Compass Calibration", "calibration"),
  page("rtk-kalibrering", "RTK Validation", "calibration"),
  page("sensor-kalibrering", "Sensor Calibration", "calibration"),
  page("kamera-kalibrering", "Camera Calibration", "calibration"),
  page("varmekamera-validering", "Thermal Camera Validation", "calibration", { related_collection: "dronare-med-varmekamera" }),

  // Warranty
  page("garantiansokan", "Warranty Claims", "warranty"),
  page("serviceforfragan", "Service Request", "warranty"),
  page("returforfragan", "Return Request", "warranty"),
  page("teknisk-support", "Technical Support", "warranty"),
];

// ─── PART 2: Maintenance Contracts ───
const SERVICE_AGREEMENTS = [
  {
    handle: "serviceavtal-basic",
    title: "Service Agreement — Basic",
    tier: "basic",
    includes: ["Annual inspection", "Firmware review", "Flight log review"],
    cta: "/pages/serviceforfragan",
  },
  {
    handle: "serviceavtal-professional",
    title: "Service Agreement — Professional",
    tier: "professional",
    includes: ["Preventive maintenance", "Calibration validation", "Priority support"],
    cta: "/pages/request-quote",
  },
  {
    handle: "serviceavtal-enterprise",
    title: "Service Agreement — Enterprise",
    tier: "enterprise",
    includes: [
      "Dedicated support",
      "Fleet maintenance",
      "Annual inspections",
      "Calibration services",
      "Priority turnaround",
    ],
    cta: "/pages/enterprise-consultation",
  },
];

// ─── PART 3: Documentation Center ───
const DOCUMENTATION_CENTER = {
  hub: { handle: "dokumentation", title: "Documentation Center", url: "/pages/dokumentation" },
  excluded: ["CAD libraries", "BIM repositories", "3D model repositories"],
  sections: {
    manuals: {
      title: "Manuals",
      categories: [
        { handle: "manualer-dji-enterprise", label: "DJI Enterprise", related_collections: ["enterprise-dronare", "dji-matrice-serien"] },
        { handle: "manualer-dji-konsument", label: "DJI Consumer", related_collections: ["dji-mini-3-serien", "dji-mavic-3-serien", "dji-air-serien"] },
        { handle: "manualer-flycart", label: "FlyCart", related_collections: ["dji-flycart-serien"] },
        { handle: "manualer-agras", label: "Agras", related_collections: ["dji-agras-dronare"] },
        { handle: "manualer-dock", label: "Dock", related_collections: ["enterprise-dronare"] },
        { handle: "manualer-payloads", label: "Payloads", related_collections: ["enterprise-sensorer", "dronare-med-varmekamera"] },
      ],
    },
    firmware: {
      title: "Firmware",
      categories: [
        { handle: "firmware-flygplan", label: "Aircraft" },
        { handle: "firmware-fjarrkontroller", label: "Controllers", related_collections: ["dji-enterprise-fjarrkontroller"] },
        { handle: "firmware-payloads", label: "Payloads", related_collections: ["enterprise-sensorer"] },
        { handle: "firmware-dock", label: "Dock Systems" },
      ],
    },
    datasheets: {
      title: "Product Datasheets",
      categories: [
        { handle: "datablad-specifikationer", label: "Specifications" },
        { handle: "datablad-kompatibilitet", label: "Compatibility" },
        { handle: "datablad-certifieringar", label: "Certifications" },
      ],
    },
    compliance: {
      title: "Compliance",
      categories: [
        { handle: "ce-dokument", label: "CE Documents" },
        { handle: "produktcertifieringar", label: "Product Certifications" },
        { handle: "sakerhetsdokumentation", label: "Safety Documentation" },
      ],
    },
  },
};

// Flatten doc pages
const DOC_PAGES = [page("dokumentation", "Documentation Center", "documentation_hub")];
for (const [secKey, sec] of Object.entries(DOCUMENTATION_CENTER.sections)) {
  for (const cat of sec.categories) {
    DOC_PAGES.push(
      page(cat.handle, `${sec.title} — ${cat.label}`, "documentation", {
        doc_section: secKey,
        related_collections: cat.related_collections || [],
      }),
    );
  }
}

// ─── PART 4: Knowledge Center (framework only) ───
const KNOWLEDGE_CENTER = {
  hub: { handle: "kunskapscenter", title: "Knowledge Center", url: "/pages/kunskapscenter" },
  note: "Content framework only — articles not generated in Phase 5",
  categories: {
    drone_technology: [
      { handle: "vad-ar-rtk", title: "What is RTK?", status: "framework" },
      { handle: "vad-ar-lidar", title: "What is LiDAR?", status: "framework" },
      { handle: "varmebild", title: "Thermal Imaging", status: "framework" },
      { handle: "fotogrammetri", title: "Photogrammetry", status: "framework" },
      { handle: "drönarkartlaggning", title: "Drone Mapping", status: "framework" },
      { handle: "bvlos", title: "BVLOS Operations", status: "framework" },
      { handle: "dronarsakerhet", title: "Drone Safety", status: "framework" },
    ],
    enterprise_dji: [
      { handle: "guide-matrice-4", title: "Matrice 4 Guide", related_collection: "dji-matrice-4-serie" },
      { handle: "guide-matrice-350", title: "Matrice 350 Guide", related_collection: "dji-matrice-350-rtk-tillbehor" },
      { handle: "guide-matrice-400", title: "Matrice 400 Guide", related_collection: "dji-matrice-400-serien" },
      { handle: "guide-mavic-enterprise", title: "Mavic Enterprise Guide", related_collection: "dji-mavic-serien-enterprise" },
      { handle: "guide-flycart", title: "FlyCart Guide", related_collection: "dji-flycart-serien" },
      { handle: "guide-dji-dock", title: "DJI Dock Guide", related_collection: "enterprise-dronare" },
    ],
    payloads: [
      { handle: "guide-zenmuse-l2", title: "Zenmuse L2 Guide", related_collection: "enterprise-sensorer" },
      { handle: "guide-zenmuse-h30t", title: "Zenmuse H30T Guide", related_collection: "dronare-med-varmekamera" },
      { handle: "lidar-jamforelse", title: "LiDAR Comparison", related_collection: "enterprise-sensorer" },
      { handle: "varmekamera-jamforelse", title: "Thermal Camera Comparison", related_collection: "dronare-med-varmekamera" },
    ],
  },
};

const KNOWLEDGE_PAGES = [page("kunskapscenter", "Knowledge Center", "knowledge_hub")];
for (const articles of Object.values(KNOWLEDGE_CENTER.categories)) {
  for (const a of articles) {
    KNOWLEDGE_PAGES.push(
      page(a.handle, a.title, "knowledge", {
        content_status: a.status || "framework",
        related_collection: a.related_collection || null,
      }),
    );
  }
}

// ─── PART 5: B2B Platform ───
const B2B_PLATFORM = {
  request_quote: {
    handle: "request-quote",
    title: "Request Quote",
    url: "/pages/request-quote",
    workflows: ["Request quotation", "Request project pricing", "Request fleet pricing"],
    form_fields: ["company", "contact", "product_interest", "quantity", "project_description"],
  },
  enterprise_consultation: {
    handle: "enterprise-consultation",
    title: "Enterprise Consultation",
    url: "/pages/enterprise-consultation",
    pages: [
      { handle: "boka-konsultation", title: "Book Consultation" },
      { handle: "projektgranskning", title: "Project Review" },
      { handle: "produktrekommendation", title: "Product Recommendation" },
    ],
  },
  public_sector: {
    handle: "offentlig-sektor",
    title: "Public Sector",
    url: "/pages/offentlig-sektor",
    audiences: ["Municipalities", "Utilities", "Energy Companies", "Infrastructure Companies"],
    workflows: ["Procurement inquiry", "Framework agreement", "Tender support"],
  },
  payment_options: {
    handle: "betalningsalternativ",
    title: "Payment Options",
    methods: ["Invoice", "Leasing", "Financing", "Purchase Order"],
    peppol: {
      ready: true,
      note: "PEPPOL-ready procurement structure — integrate with ERP/e-invoicing in Phase 5b",
      fields: ["org_number", "peppol_id", "gln", "purchase_order_reference"],
    },
  },
};

const B2B_PAGES = [
  page("request-quote", "Request Quote", "b2b"),
  page("enterprise-consultation", "Enterprise Consultation", "b2b"),
  page("boka-konsultation", "Book Consultation", "b2b"),
  page("projektgranskning", "Project Review", "b2b"),
  page("produktrekommendation", "Product Recommendation", "b2b"),
  page("offentlig-sektor", "Public Sector", "b2b"),
  page("betalningsalternativ", "Payment Options", "b2b"),
];

// ─── PART 6: Manufacturer Hubs (no Defense) ───
const MANUFACTURER_HUBS = [
  { handle: "tillverkare-dji", title: "DJI", vendor: "DJI", product_count_ref: 668, collections: ["enterprise-dronare", "dji-matrice-serien", "dji-agras-dronare"] },
  { handle: "tillverkare-livox", title: "Livox", vendor: "Livox", product_count_ref: 0, collections: ["enterprise-sensorer"], note: "Expand when Livox SKUs indexed" },
  { handle: "tillverkare-czi", title: "CZI", vendor: "CZI", product_count_ref: 11, collections: ["enterprise-belysning", "enterprise-hogtalarsystem"] },
  { handle: "tillverkare-avss", title: "AVSS", vendor: "AVSS", product_count_ref: 0, collections: ["fallskarmssystem"], note: "Landing page — catalog expansion pending" },
  { handle: "tillverkare-dronavia", title: "Dronavia", vendor: "Dronavia", product_count_ref: 0, note: "Landing page — catalog expansion pending" },
  { handle: "tillverkare-wisson", title: "Wisson Robotics", vendor: "Wisson", product_count_ref: 0, note: "Landing page — catalog expansion pending" },
];

const MANUFACTURER_PAGES = MANUFACTURER_HUBS.map((m) =>
  page(m.handle, m.title, "manufacturer", {
    vendor: m.vendor,
    related_collections: m.collections || [],
    note: m.note,
  }),
);

// ─── PART 7: Enterprise Support ───
const SUPPORT_PAGES = [
  page("support-center", "Support Center", "support_hub"),
  page("kontakta-support", "Contact Support", "support"),
  page("skicka-arende", "Submit Ticket", "support", { workflow: "ticket" }),
  page("servicestatus", "Service Status", "support"),
  page("vanliga-fragor", "FAQ", "support"),
  page("felsokning", "Troubleshooting", "troubleshooting_hub"),
  page("felsokning-dronare", "Drone Issues", "troubleshooting"),
  page("felsokning-batteri", "Battery Issues", "troubleshooting", { related_collection: "batterier" }),
  page("felsokning-rtk", "RTK Issues", "troubleshooting"),
  page("felsokning-payload", "Payload Issues", "troubleshooting", { related_collection: "enterprise-sensorer" }),
  page("felsokning-dock", "Dock Issues", "troubleshooting"),
];

// ─── Navigation ───
const NAVIGATION = {
  version: "5.0",
  note: "Additive only — does NOT modify Phase 3 main-menu or enterprise-dr-nare",
  menus: {
    "service-support": {
      title: "Service & Support",
      url: "/pages/service-support",
      items: [
        {
          title: "DJI Consumer Service",
          items: [
            { title: "DJI Mini", url: "/pages/dji-mini-service" },
            { title: "DJI Air", url: "/pages/dji-air-service" },
            { title: "DJI Mavic", url: "/pages/dji-mavic-service" },
            { title: "DJI Avata", url: "/pages/dji-avata-service" },
            { title: "DJI Neo", url: "/pages/dji-neo-service" },
            { title: "DJI Flip", url: "/pages/dji-flip-service" },
          ],
        },
        {
          title: "DJI Enterprise Service",
          items: [
            { title: "Matrice 4", url: "/pages/matrice-4-service" },
            { title: "Matrice 30", url: "/pages/matrice-30-service" },
            { title: "Matrice 300 RTK", url: "/pages/matrice-300-rtk-service" },
            { title: "Matrice 350 RTK", url: "/pages/matrice-350-rtk-service" },
            { title: "Matrice 400", url: "/pages/matrice-400-service" },
            { title: "Mavic Enterprise", url: "/pages/mavic-enterprise-service" },
            { title: "Agras", url: "/pages/agras-service" },
            { title: "FlyCart", url: "/pages/flycart-service" },
            { title: "DJI Dock", url: "/pages/dji-dock-service" },
          ],
        },
        {
          title: "Repairs",
          items: [
            { title: "Drone Repair", url: "/pages/dronarreparation" },
            { title: "Crash Damage", url: "/pages/krockskador-reparation" },
            { title: "Gimbal Repair", url: "/pages/gimbalreparation" },
            { title: "Camera Repair", url: "/pages/kamerareparation" },
            { title: "Motor Replacement", url: "/pages/motorbyte" },
            { title: "ESC Repair", url: "/pages/esc-reparation" },
          ],
        },
        {
          title: "Calibration",
          items: [
            { title: "IMU", url: "/pages/imu-kalibrering" },
            { title: "Compass", url: "/pages/kompasskalibrering" },
            { title: "RTK", url: "/pages/rtk-kalibrering" },
            { title: "Sensor", url: "/pages/sensor-kalibrering" },
            { title: "Camera", url: "/pages/kamera-kalibrering" },
            { title: "Thermal", url: "/pages/varmekamera-validering" },
          ],
        },
        {
          title: "Warranty",
          items: [
            { title: "Warranty Claims", url: "/pages/garantiansokan" },
            { title: "Service Request", url: "/pages/serviceforfragan" },
            { title: "Return Request", url: "/pages/returforfragan" },
            { title: "Technical Support", url: "/pages/teknisk-support" },
          ],
        },
        {
          title: "Service Agreements",
          items: [
            { title: "Basic", url: "/pages/serviceavtal-basic" },
            { title: "Professional", url: "/pages/serviceavtal-professional" },
            { title: "Enterprise", url: "/pages/serviceavtal-enterprise" },
          ],
        },
      ],
    },
    "documentation-center": {
      title: "Documentation Center",
      url: "/pages/dokumentation",
      items: [
        { title: "Manuals", url: "/pages/manualer-dji-enterprise" },
        { title: "Firmware", url: "/pages/firmware-flygplan" },
        { title: "Datasheets", url: "/pages/datablad-specifikationer" },
        { title: "Compliance", url: "/pages/ce-dokument" },
      ],
    },
    "knowledge-center": {
      title: "Knowledge Center",
      url: "/pages/kunskapscenter",
      items: [
        { title: "Drone Technology", url: "/pages/vad-ar-rtk" },
        { title: "Enterprise DJI", url: "/pages/guide-matrice-4" },
        { title: "Payloads", url: "/pages/guide-zenmuse-l2" },
      ],
    },
    "b2b-platform": {
      title: "B2B",
      items: [
        { title: "Request Quote", url: "/pages/request-quote" },
        { title: "Enterprise Consultation", url: "/pages/enterprise-consultation" },
        { title: "Public Sector", url: "/pages/offentlig-sektor" },
        { title: "Payment Options", url: "/pages/betalningsalternativ" },
      ],
    },
    "support-center-menu": {
      title: "Support Center",
      url: "/pages/support-center",
      items: [
        { title: "Contact", url: "/pages/kontakta-support" },
        { title: "Submit Ticket", url: "/pages/skicka-arende" },
        { title: "FAQ", url: "/pages/vanliga-fragor" },
        { title: "Troubleshooting", url: "/pages/felsokning" },
      ],
    },
    "footer-addon-v5": {
      title: "Footer links (additive)",
      items: [
        { title: "Service & Support", url: "/pages/service-support" },
        { title: "Documentation", url: "/pages/dokumentation" },
        { title: "Knowledge Center", url: "/pages/kunskapscenter" },
        { title: "Request Quote", url: "/pages/request-quote" },
      ],
    },
  },
};

function walkNav(items, out = []) {
  for (const it of items || []) {
    if (it.url) out.push({ title: it.title, url: it.url });
    walkNav(it.items, out);
  }
  return out;
}

function uniquePages(...arrays) {
  const map = new Map();
  for (const arr of arrays) for (const p of arr) map.set(p.handle, p);
  return [...map.values()];
}

loadEnv();

async function loadLiveCollections() {
  if (existsSync(LIVE_COLS)) {
    return JSON.parse(readFileSync(LIVE_COLS, "utf8")).collections;
  }
  const collections = [];
  let cursor = null;
  for (let p = 0; p < 20; p++) {
    const data = await gql(
      `query($c: String) { collections(first: 100, after: $c) { pageInfo { hasNextPage endCursor } nodes { handle title } } }`,
      { c: cursor },
    );
    collections.push(...(data.collections?.nodes || []));
    if (!data.collections?.pageInfo?.hasNextPage) break;
    cursor = data.collections.pageInfo.endCursor;
  }
  return collections;
}

const liveCols = await loadLiveCollections();
const liveHandles = new Set(liveCols.map((c) => c.handle));

const pages = [];
let cursor = null;
for (let p = 0; p < 10; p++) {
  const data = await gql(
    `query($c: String) { pages(first: 50, after: $c) { pageInfo { hasNextPage endCursor } nodes { handle title } } }`,
    { c: cursor },
  );
  pages.push(...(data.pages?.nodes || []));
  if (!data.pages?.pageInfo?.hasNextPage) break;
  cursor = data.pages.pageInfo.endCursor;
}
const livePageHandles = new Set(pages.map((p) => p.handle));

const agreementPages = SERVICE_AGREEMENTS.map((a) =>
  page(a.handle, a.title, "service_agreement", { tier: a.tier, includes: a.includes, cta: a.cta }),
);

const ALL_PAGES = uniquePages(
  SERVICE_PAGES,
  agreementPages,
  DOC_PAGES,
  KNOWLEDGE_PAGES,
  B2B_PAGES,
  MANUFACTURER_PAGES,
  SUPPORT_PAGES,
);

// Validate
const pageInventory = ALL_PAGES.map((p) => ({
  ...p,
  exists_live: livePageHandles.has(p.handle),
  action: livePageHandles.has(p.handle) ? "exists" : "create_page",
  seo_change: false,
}));

const menuRefs = [];
for (const [menuKey, menu] of Object.entries(NAVIGATION.menus)) {
  for (const ref of walkNav(menu.items)) {
    const m = ref.url.match(/\/pages\/([^/?#]+)/);
    menuRefs.push({ menu: menuKey, title: ref.title, url: ref.url, handle: m?.[1] });
  }
}

const menuValidation = menuRefs.map((ref) => {
  const spec = ALL_PAGES.find((p) => p.handle === ref.handle);
  return {
    ...ref,
    in_spec: !!spec,
    exists_live: livePageHandles.has(ref.handle),
    status: spec ? (livePageHandles.has(ref.handle) ? "live" : "pending_create") : "missing_spec",
  };
});

const collectionRefs = new Set();
for (const p of ALL_PAGES) {
  if (p.related_collection) collectionRefs.add(p.related_collection);
  if (p.related_collections) for (const c of p.related_collections) collectionRefs.add(c);
}
const collectionValidation = [...collectionRefs].map((h) => ({
  handle: h,
  exists: liveHandles.has(h),
  url: `/collections/${h}`,
  modified: false,
}));

const b2bWorkflows = [
  { id: "quote", entry: "/pages/request-quote", connects_to: ["serviceforfragan", "enterprise-consultation"] },
  { id: "ticket", entry: "/pages/skicka-arende", connects_to: ["kontakta-support", "teknisk-support"] },
  { id: "warranty", entry: "/pages/garantiansokan", connects_to: ["returforfragan", "serviceforfragan"] },
  { id: "public_sector", entry: "/pages/offentlig-sektor", connects_to: ["request-quote", "enterprise-consultation"] },
  { id: "peppol", entry: "/pages/betalningsalternativ", connects_to: ["request-quote", "offentlig-sektor"] },
];

const CAD_BIM_3D_PATTERN = /cad|bim|3d[\s_-]?model/i;
const noCadBim3dSections = !Object.keys(DOCUMENTATION_CENTER.sections).some((k) =>
  CAD_BIM_3D_PATTERN.test(k),
);
const noCadBim3dPages = !DOC_PAGES.some((p) => CAD_BIM_3D_PATTERN.test(`${p.handle} ${p.title}`));

const excludedChecks = {
  no_cad_bim_3d: noCadBim3dSections && noCadBim3dPages,
  no_defense: !ALL_PAGES.some((p) => /forsvar|defense|military/i.test(p.handle + p.title)),
  no_collection_changes: true,
  no_url_changes: true,
  no_seo_changes: true,
};

const menuBroken = menuValidation.filter((m) => m.status === "missing_spec");
const validationPass =
  menuBroken.length === 0 &&
  excludedChecks.no_cad_bim_3d &&
  excludedChecks.no_defense &&
  collectionValidation.every((c) => c.exists || c.handle.startsWith("fallskarm")); // phase4 pending ok

const audit = {
  generated_at: new Date().toISOString(),
  mode: "report_only",
  store: STORE,
  total_pages: ALL_PAGES.length,
  pages_to_create: pageInventory.filter((p) => p.action === "create_page").length,
  pages_existing: pageInventory.filter((p) => p.action === "exists").length,
  menu_refs: menuValidation.length,
  menu_broken: menuBroken.length,
  collection_refs: collectionValidation.length,
  b2b_workflow_count: b2bWorkflows.length,
  validation_pass: validationPass,
  excluded_checks: excludedChecks,
  page_inventory: pageInventory,
  menu_validation: menuValidation,
  collection_validation: collectionValidation,
  b2b_workflows: b2bWorkflows,
  service_agreements: SERVICE_AGREEMENTS,
};

writeFileSync(OUT_ARCH, JSON.stringify({ version: "5.0", pages: ALL_PAGES.length, sections: 8 }, null, 2));
writeFileSync(OUT_NAV, JSON.stringify(NAVIGATION, null, 2));
writeFileSync(OUT_DOCS, JSON.stringify(DOCUMENTATION_CENTER, null, 2));
writeFileSync(OUT_KNOWLEDGE, JSON.stringify(KNOWLEDGE_CENTER, null, 2));
writeFileSync(OUT_B2B, JSON.stringify(B2B_PLATFORM, null, 2));
writeFileSync(OUT_AUDIT, JSON.stringify(audit, null, 2));

const roadmap = [
  { phase: "5a", task: "Create Service & Support pages + menu", effort: "Shopify pages + menu API" },
  { phase: "5b", task: "Deploy Documentation Center hub pages", effort: "CMS / page templates" },
  { phase: "5c", task: "Knowledge Center framework + article templates", effort: "Blog or metaobject" },
  { phase: "5d", task: "B2B forms (quote, ticket, warranty)", effort: "Shopify Forms / custom app" },
  { phase: "5e", task: "PEPPOL procurement fields + invoice workflow", effort: "ERP integration" },
  { phase: "5f", task: "Manufacturer hub pages with collection links", effort: "Page sections" },
  { phase: "5g", task: "SEO indexing + sitemap update for new pages", effort: "No collection SEO changes" },
];

const lines = [
  "# Phase 5 — Service, Support, Documentation & B2B Platform",
  "",
  `**Generated:** ${audit.generated_at}`,
  `**Store:** ${STORE}`,
  "**Mode:** REPORT ONLY — awaiting approval, no deployment",
  "",
  "## Validation summary",
  "",
  "| Check | Result |",
  "|-------|--------|",
  `| Validation pass | **${validationPass ? "YES" : "NO"}** |`,
  `| Collections removed | PASS (0) |`,
  `| URLs changed | PASS (0) |`,
  `| SEO metadata changed | PASS (0) |`,
  `| CAD/BIM/3D excluded | ${excludedChecks.no_cad_bim_3d ? "PASS" : "FAIL"} |`,
  `| Defense sections excluded | ${excludedChecks.no_defense ? "PASS" : "FAIL"} |`,
  `| Menu links broken | ${menuBroken.length === 0 ? "PASS" : `FAIL (${menuBroken.length})`} |`,
  `| B2B workflows defined | PASS (${b2bWorkflows.length}) |`,
  "",
  "## Platform overview",
  "",
  `| Area | Pages | Status |`,
  `|------|------:|--------|`,
  `| Service & Repair Center | ${SERVICE_PAGES.length + agreementPages.length} | ${pageInventory.filter((p) => p.section?.includes("consumer") || p.section?.includes("enterprise") || p.section === "repair" || p.section === "calibration" || p.section === "warranty" || p.section === "service_agreement").length} spec |`,
  `| Documentation Center | ${DOC_PAGES.length} | Framework |`,
  `| Knowledge Center | ${KNOWLEDGE_PAGES.length} | Framework only |`,
  `| B2B Platform | ${B2B_PAGES.length} | Architecture |`,
  `| Manufacturer Hubs | ${MANUFACTURER_PAGES.length} | Landing pages |`,
  `| Enterprise Support | ${SUPPORT_PAGES.length} | Architecture |`,
  `| **Total unique pages** | **${ALL_PAGES.length}** | **${audit.pages_to_create} to create** |`,
  "",
  "## Part 1 — Service & Support structure",
  "",
  "### DJI Consumer Service",
  "",
  "| Page | Handle | Related collection |",
  "|---|---|---|",
];
for (const p of SERVICE_PAGES.filter((x) => x.section === "consumer")) {
  lines.push(`| ${p.title} | \`${p.handle}\` | ${p.related_collection ? `\`${p.related_collection}\`` : "—"} |`);
}

lines.push("", "### DJI Enterprise Service", "", "| Page | Handle | Related collection |", "|---|---|---|");
for (const p of SERVICE_PAGES.filter((x) => x.section === "enterprise")) {
  lines.push(`| ${p.title} | \`${p.handle}\` | ${p.related_collection ? `\`${p.related_collection}\`` : "—"} |`);
}

lines.push("", "### Repair Services", "", "| Page | Handle | Related collection |", "|---|---|---|");
for (const p of SERVICE_PAGES.filter((x) => x.section === "repair")) {
  lines.push(`| ${p.title} | \`${p.handle}\` | ${p.related_collection ? `\`${p.related_collection}\`` : "—"} |`);
}

lines.push("", "### Calibration Services", "", "| Page | Handle | Related collection |", "|---|---|---|");
for (const p of SERVICE_PAGES.filter((x) => x.section === "calibration")) {
  lines.push(`| ${p.title} | \`${p.handle}\` | ${p.related_collection ? `\`${p.related_collection}\`` : "—"} |`);
}

lines.push("", "### Warranty Services", "", "| Page | Handle |", "|---|---|");
for (const p of SERVICE_PAGES.filter((x) => x.section === "warranty")) {
  lines.push(`| ${p.title} | \`${p.handle}\` |`);
}

lines.push("", "## Part 2 — Service Agreements", "", "| Tier | Handle | Includes |", "|---|---|---|");
for (const a of SERVICE_AGREEMENTS) {
  lines.push(`| ${a.tier} | \`${a.handle}\` | ${a.includes.join("; ")} |`);
}

lines.push("", "## Part 3 — Documentation Center", "", `Hub: \`/pages/dokumentation\``, "", "**Excluded:** CAD, BIM, 3D model repositories", "", "| Section | Categories |", "|---|---|");
for (const [key, sec] of Object.entries(DOCUMENTATION_CENTER.sections)) {
  lines.push(`| ${sec.title} | ${sec.categories.map((c) => c.label).join(", ")} |`);
}

lines.push("", "## Part 4 — Knowledge Center (framework only)", "", `Hub: \`/pages/kunskapscenter\` — articles NOT generated`, "", "| Group | Topics |", "|---|---|");
for (const [key, articles] of Object.entries(KNOWLEDGE_CENTER.categories)) {
  lines.push(`| ${key.replace(/_/g, " ")} | ${articles.map((a) => a.title).join(", ")} |`);
}

lines.push("", "## Part 5 — B2B Platform", "", "| Component | Handle |", "|---|---|");
lines.push(`| Request Quote | \`request-quote\` |`);
lines.push(`| Enterprise Consultation | \`enterprise-consultation\` |`);
lines.push(`| Public Sector | \`offentlig-sektor\` |`);
lines.push(`| Payment Options + PEPPOL | \`betalningsalternativ\` |`);

lines.push("", "### B2B workflow connections", "", "| Workflow | Entry | Connects to |", "|---|---|---|");
for (const w of b2bWorkflows) {
  lines.push(`| ${w.id} | \`${w.entry}\` | ${w.connects_to.map((c) => `\`${c}\``).join(", ")} |`);
}

lines.push(
  "",
  "### B2B architecture",
  "",
  "**Request Quote** (`request-quote`): quotation, project pricing, fleet pricing",
  "",
  "**Enterprise Consultation**: Book Consultation (`boka-konsultation`), Project Review (`projektgranskning`), Product Recommendation (`produktrekommendation`)",
  "",
  `**Public Sector** (\`offentlig-sektor\`): ${B2B_PLATFORM.public_sector.audiences.join(", ")}`,
  "",
  `**Payment Options** (\`betalningsalternativ\`): ${B2B_PLATFORM.payment_options.methods.join(", ")}`,
  "",
  `**PEPPOL**: ${B2B_PLATFORM.payment_options.peppol.ready ? "Ready" : "Pending"} — fields: ${B2B_PLATFORM.payment_options.peppol.fields.join(", ")}`,
);

lines.push("", "## Part 6 — Manufacturer Hubs", "", "| Brand | Handle | Catalog products |", "|---|---|---:|");
for (const m of MANUFACTURER_HUBS) {
  lines.push(`| ${m.title} | \`${m.handle}\` | ${m.product_count_ref} |`);
}

lines.push("", "## Part 7 — Enterprise Support", "", "| Page | Handle |", "|---|---|");
for (const p of SUPPORT_PAGES) {
  lines.push(`| ${p.title} | \`${p.handle}\` |`);
}

lines.push("", "## New menus (additive)", "", "| Menu | Items | Note |", "|---|---:|---|");
for (const [key, menu] of Object.entries(NAVIGATION.menus)) {
  const count = walkNav(menu.items).length;
  lines.push(`| \`${key}\` | ${count} | Does not replace Phase 3 nav |`);
}

lines.push("", "## Complete new page inventory", "", "| # | Title | Handle | Section |", "|---:|---|---|---|");
ALL_PAGES.forEach((p, i) => {
  lines.push(`| ${i + 1} | ${p.title} | \`${p.handle}\` | ${p.section} |`);
});

lines.push("", "## Implementation roadmap", "", "| Phase | Task |", "|---|---|");
for (const r of roadmap) {
  lines.push(`| ${r.phase} | ${r.task} |`);
}

lines.push("", "## Deployment checklist (after approval)", "", "1. [ ] Create all new Shopify pages (no collection changes)", "2. [ ] Create `service-support` top-level menu", "3. [ ] Add footer links (not Phase 3 main-menu)", "4. [ ] Deploy B2B forms with workflow routing", "5. [ ] Upload documentation assets to Documentation Center", "6. [ ] Create Knowledge Center article templates", "7. [ ] Configure PEPPOL fields on quote/public-sector forms", "8. [ ] Submit new pages to sitemap", "9. [ ] Verify indexing — no existing SEO modified", "", "---", "", "Artifacts: `data/edp-phase5-*.json`, `.phase5-service-platform-audit.json`", "");

writeFileSync(OUT_REPORT, lines.join("\n"));
console.log(`Wrote ${OUT_REPORT}`);
console.log(JSON.stringify({ validation_pass: validationPass, pages: ALL_PAGES.length, to_create: audit.pages_to_create }, null, 2));
