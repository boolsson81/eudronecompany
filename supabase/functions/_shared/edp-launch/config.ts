/**
 * EU Drone Company launch configuration — clean English URL structure from day one.
 *
 * Constraints:
 *   - NO 301 redirects
 *   - NO redirect mapping files
 *   - NO legacy URL preservation
 *   - Brand-new store: handles are renamed in place before public launch
 */

export const EDP_SHOPIFY_DOMAIN = "ya1xhg-x6.myshopify.com";
export const EDP_MIGRATION_ID = "3d9876af-885c-49e9-a4b0-c4943c06112f";

/**
 * Publik domän — en enda, efter namnbytet till EU Drone Company. Marknaderna
 * skiljs åt med Shopify Markets-underkataloger i stället för ccTLD:er.
 * Konfigureras i Shopify Admin → Markets → Domains.
 */
export const EDP_DOMAIN = "eudronecompany.com";

/** Marknadernas underkataloger. Tom sträng = rotmarknaden (engelska, ingen /en/). */
export const EDP_MARKET_PATHS = {
  primary: "",
  de: "/de",
  dk: "/dk",
  se: "/se",
} as const;

/** Publik URL-bas per marknad: värd plus eventuell underkatalog. */
export const EDP_DOMAINS = {
  primary: EDP_DOMAIN,
  de: `${EDP_DOMAIN}${EDP_MARKET_PATHS.de}`,
  dk: `${EDP_DOMAIN}${EDP_MARKET_PATHS.dk}`,
  se: `${EDP_DOMAIN}${EDP_MARKET_PATHS.se}`,
} as const;

/** Legacy menus to delete after theme confirms no references */
export const LEGACY_MENU_HANDLES = [
  "dronare",
  "actionkameror",
  "vandring-outdoor",
  "meny",
  "enterprise-dr-nare", // replaced by enterprise-drones
] as const;

/** Canonical menus kept and rewired to English handles */
export const CANONICAL_MENU_HANDLES = [
  "main-menu",
  "footer",
  "partnership",
  "enterprise-drones",
  "customer-account-main-menu",
] as const;

/**
 * Explicit Swedish → English handle overrides.
 * Takes precedence over token-based slug translation.
 */
export const HANDLE_OVERRIDES: Record<string, string> = {
  // Navigation anchors
  "alla-produkter": "all-products",
  "konsumentdronare": "consumer-drones",
  "tillbehor-konsumentdronare": "consumer-drone-accessories",
  "enterprise-dronare": "enterprise-drones",
  "energi-infrastruktur": "energy-infrastructure",
  "dronare-actionking": "drones",
  "dronare-med-kamera": "camera-drones",
  "dronare-med-varmekamera": "thermal-camera-drones",
  "dronartillbehor-dronar": "drone-accessories-all",
  "dronartillbehor": "drone-accessories",
  "dronarpropellrar-tysta": "quiet-drone-propellers",
  "dronarryggsack-vaskor": "drone-backpacks-bags",
  "dronar-fjarrkontrollstillbehor": "drone-remote-control-accessories",
  "dronar-kameror": "drone-cameras",
  "dronare-propeller-tillbehor": "drone-propeller-accessories",
  "dronarelektronik-flight-components": "drone-electronics-flight-components",
  "dronarmatta-landning-skydd": "drone-landing-pads",
  "dronartillbehor-kop": "drone-accessories-shop",
  "fjarrkontroll-dronare": "drone-remote-controls",
  "filter-dronare-lins": "drone-lens-filters",
  "filter-till-dronare": "drone-filters",
  "kapor-till-dronare": "drone-covers",
  "landningsstall-dronare": "drone-landing-gear",
  "skydd-dronare": "drone-protection",
  "tillbehorskablar-dronare": "drone-cables",
  "belysning-till-dronare": "drone-lighting",
  "jordbruksdronare": "agricultural-drones",
  "inspektionsdronare": "inspection-drones",
  "kartlaggnings-och-matdronare": "mapping-survey-drones",
  "skogsbruksdronare": "forestry-drones",
  "last-och-transportdronare": "cargo-transport-drones",
  "transport-logistik": "transport-logistics",
  "enterprise-dronartillbehor": "enterprise-drone-accessories",
  "enterprise-tillbehor": "enterprise-accessories",
  "enterprise-belysning": "enterprise-lighting",
  "enterprise-hogtalarsystem": "enterprise-loudspeakers",
  "enterprise-lyftsystem": "enterprise-lifting-systems",
  "enterprise-propellrar": "enterprise-propellers",
  "enterprise-sensorer": "enterprise-sensors",
  "enterprise-service-dronare": "enterprise-service-drones",
  "minneskort-lagring": "memory-cards-storage",
  "rengoringsprodukter-actionking": "electronics-cleaning",
  "reparera-precisionsverktyg-elektronik": "precision-electronics-repair-tools",
  "reservdelar-gimbal-dronare-motorer": "drone-gimbal-spare-parts",
  "reparation-dji-neo-reservdelar": "dji-neo-repair-spare-parts",
  "dji-dronar-reservdelar": "dji-drone-spare-parts",
  "dji-dronare": "dji-drones",
  "dji-dronare-fjarrkontroller": "dji-drone-remote-controls",
  "dji-enterprise-fjarrkontroller": "dji-enterprise-remote-controls",
  "dji-rc-fjarrkontroller": "dji-rc-remote-controls",
  "dji-rc-pro-tillbehor": "dji-rc-pro-accessories",
  "dji-fpv-tillbehor": "dji-fpv-accessories",
  "dji-mavic-tillbehor": "dji-mavic-accessories",
  "dji-mavic-pro-tillbehor": "dji-mavic-pro-accessories",
  "dji-mavic-air-tillbehor": "dji-mavic-air-accessories",
  "dji-mavic-3-tillbehor": "dji-mavic-3-accessories",
  "dji-mavic-3-pro-tillbehor": "dji-mavic-3-pro-accessories",
  "dji-mavic-3-classic": "dji-mavic-3-classic-accessories",
  "dji-mavic-3m-dronare-tillbehor": "dji-mavic-3m-accessories",
  "dji-mavic-4-pro": "dji-mavic-4-accessories",
  "dji-mini-tillbehor": "dji-mini-accessories",
  "dji-avata-tillbehor": "dji-avata-accessories",
  "dji-flip-batteri-tillbehor": "dji-flip-accessories",
  "dji-flip-dronare": "dji-flip-drones",
  "dji-phantom-tillbehor-vaska-reservdelar": "dji-phantom-accessories",
  "dji-air-2s-tillbehor": "dji-air-2s-accessories",
  "dji-matrice-30-serie-tillbehor": "dji-matrice-30-accessories",
  "dji-matrice-350-rtk-tillbehor": "dji-matrice-350-rtk-accessories",
  "dji-matrice-4-tillbehor": "dji-matrice-4-accessories",
  "dji-matrice-serien": "dji-matrice-series",
  "dji-mavic-serien-enterprise": "dji-mavic-enterprise-series",
  "dji-marvic-enterprise": "dji-mavic-enterprise",
  "dji-agras-dronare": "dji-agras-drones",
  "dji-avata-pro-fpv-dronare": "dji-avata-pro-fpv-drones",
  "dji-flycart-100-lastdronare": "dji-flycart-100-cargo-drones",
  "dji-mavic-3-cine-dronare": "dji-mavic-3-cine-drones",
  "dji-mavic-3-enterprise": "dji-mavic-3-enterprise",
  "dji-mavic-3-pro-avancerad-dronarteknik": "dji-mavic-3-pro",
  "dji-mini-3-pro-dronare-set": "dji-mini-3-pro-sets",
  "dji-mini-3": "dji-mini-3-drones",
  "dji-neo": "dji-neo-drones",
  "dji-phantom-3-pro-v1": "dji-phantom-3-pro",
  "dji-phantom-3-se": "dji-phantom-3-se",
  "dji-phantom-4-pro-dronare": "dji-phantom-4-pro",
  "tillbehor-dji-air-3s": "dji-air-3s-accessories",
  "tillbehor-dji-air-serien": "dji-air-series-accessories",
  "tillbehor-dji-avata-serien": "dji-avata-series-accessories",
  "tillbehor-dji-mavic-2": "dji-mavic-2-accessories",
  "tillbehor-dji-mavic-3-cine": "dji-mavic-3-cine-accessories",
  "tillbehor-dji-mavic-dronare": "dji-mavic-drone-accessories",
  "tillbehor-dji-mini-2-2-se": "dji-mini-2-se-accessories",
  "tillbehor-dji-mini-4": "dji-mini-3-accessories",
  "tillbehor-dji-mini-4-serien": "dji-mini-4-series-accessories",
  "tillbehor-dji-neo": "dji-neo-accessories",
  "tillbehor-till-dji-air-3-serien": "dji-air-3-series-accessories",
  "dji-air-3-tillbehor-omfattande-sortiment": "dji-air-3-accessories",
  "dji-avata-2-tillbehor": "dji-avata-2-accessories",
  "dji-flip-tillbehor": "dji-flip-accessories",
  "dji-mini-3-tillbehor": "dji-mini-3-accessories",
  "dji-neo-2-tillbehor": "dji-neo-2-accessories",
  "dji-neo-tillbehor": "dji-neo-accessories",
  "dij-air-3-serien": "dji-air-3-series",
  "dji-air-2-serien": "dji-air-2-series",
  "dji-air-3-serien": "dji-air-3-series",
  "dji-avata-serien": "dji-avata-series",
  "dji-flycart-serien": "dji-flycart-series",
  "dji-inspire-serien": "dji-inspire-series",
  "dji-matrice-3-serien": "dji-matrice-4-series",
  "dji-matrice-4-serie": "dji-matrice-4-series",
  "dji-matrice-400-serien": "dji-matrice-400-series",
  "dji-mavic-2-serien": "dji-mavic-2-series",
  "dji-mavic-3-serien": "dji-mavic-3-series",
  "dji-mavic-4-serien": "dji-mavic-4-series",
  "dji-mavic-serien": "dji-mavic-series",
  "dji-mini-2-serien": "dji-mini-2-series",
  "dji-mini-3-serien": "dji-mini-3-series",
  "dji-mini-4-serien": "dji-mini-4-series",
  "dji-mini-5-serien": "dji-mini-5-series",
  "dji-phantom-serien": "dji-phantom-series",
  "dji-air-serien": "dji-air-series",
  "gopro-batterier": "gopro-batteries",
  "gopro-hero13-black-skydd": "gopro-hero13-black-protection",
  "gopro-hero13-vaska": "gopro-hero13-bags",
  "gopro-tillbehor-vendors": "gopro-accessories-vendors",
  "fasten-adaptrar-actionkameror": "action-camera-mounts-adapters",
  "vattentatt-kameraskydd": "waterproof-camera-protection",
  "vendors-q-sunnylife": "sunnylife-accessories",
  "amagisn-kameratillbehor-och-dronarutrustning": "amagisn-camera-drone-accessories",
  "brdrc-tillbehor": "brdrc-accessories",
  "pgytech-tillbehor": "pgytech-accessories",
  "master-airscrew-dji-propellrar": "master-airscrew-dji-propellers",
  "propellerskydd-1": "propeller-guards",
  "multiverktyg-friluftsliv": "outdoor-multitools",
  "kamerakablar-actionking": "camera-cables",
  "pincetter-actionking": "tweezers",
  "tanger-actionking": "pliers",
  "skruvmejsel-set": "screwdriver-sets",
  "bandverktyg": "pliers-tools",
  "ringlampa": "ring-lights",
  "ji-mini-5-pro-filter": "dji-mini-5-pro-filters",
  "usb-kablar-usb-c-till-usb-c": "usb-c-cables",
  // Pages
  enterprise: "enterprise",
  "energi-infrastruktur": "energy-infrastructure",
  "gis-kartlaggning": "gis-mapping",
  raddningstjanst: "emergency-services",
  // Blogs
  guider: "guides",
  blogg: "blog",
};

/** Token-level Swedish → English replacements applied left-to-right per slug segment */
export const SLUG_TOKEN_MAP: Record<string, string> = {
  alla: "all",
  produkter: "products",
  dronare: "drones",
  dronar: "drones",
  dronartillbehor: "drone-accessories",
  tillbehor: "accessories",
  tillbehör: "accessories",
  reservdelar: "spare-parts",
  fjarrkontroll: "remote-control",
  fjarrkontroller: "remote-controls",
  propellrar: "propellers",
  propeller: "propellers",
  batterier: "batteries",
  batteri: "battery",
  filter: "filters",
  vaskor: "bags",
  vaska: "bag",
  ryggssack: "backpack",
  skydd: "protection",
  belysning: "lighting",
  inspektion: "inspection",
  inspektions: "inspection",
  jordbruk: "agricultural",
  jordbruks: "agricultural",
  skogsbruk: "forestry",
  skogsbruks: "forestry",
  kartlaggning: "mapping",
  mat: "survey",
  transport: "transport",
  logistik: "logistics",
  energi: "energy",
  infrastruktur: "infrastructure",
  raddningstjanst: "emergency-services",
  raddning: "emergency",
  tjanst: "services",
  konsument: "consumer",
  konsumentdronare: "consumer-drones",
  enterprise: "enterprise",
  serien: "series",
  serie: "series",
  kompletta: "complete",
  komplett: "complete",
  professionella: "professional",
  professionell: "professional",
  hogkvalitativa: "high-quality",
  robusta: "robust",
  robust: "robust",
  reparation: "repair",
  reparera: "repair",
  rengoringsprodukter: "cleaning-products",
  rengoring: "cleaning",
  precisionsverktyg: "precision-tools",
  elektronik: "electronics",
  kablar: "cables",
  kabel: "cable",
  minneskort: "memory-cards",
  lagring: "storage",
  guider: "guides",
  blogg: "blog",
  landning: "landing",
  landningsstall: "landing-gear",
  matta: "pad",
  hogtalarsystem: "loudspeakers",
  lyftsystem: "lifting-systems",
  sensorer: "sensors",
  service: "service",
  kapor: "covers",
  kapa: "cover",
  lins: "lens",
  linser: "lenses",
  tysta: "quiet",
  vattentatt: "waterproof",
  kameraskydd: "camera-protection",
  kameratillbehor: "camera-accessories",
  kameror: "cameras",
  kamera: "camera",
  fasten: "mounts",
  adaptrar: "adapters",
  actionkameror: "action-cameras",
  friluftsliv: "outdoor",
  multiverktyg: "multitools",
  skruvmejsel: "screwdriver",
  pincetter: "tweezers",
  tanger: "pliers",
  bandverktyg: "pliers-tools",
  ringlampa: "ring-light",
  vendors: "vendors",
  last: "cargo",
  och: "and",
  till: "for",
  med: "with",
  for: "for",
  omfattande: "comprehensive",
  sortiment: "range",
  optimal: "optimal",
  optimala: "optimal",
  avancerad: "advanced",
  avancerade: "advanced",
  dronarteknik: "drone-technology",
  lastdronare: "cargo-drones",
  varmekamera: "thermal-camera",
  set: "sets",
  pro: "pro",
  black: "black",
  hero13: "hero13",
  gopro: "gopro",
};

export type MenuItemDef = {
  title: string;
  type: "HTTP" | "COLLECTION" | "PAGE" | "BLOG";
  /** Path relative to store root, e.g. /collections/consumer-drones */
  url: string;
  items?: MenuItemDef[];
};

export type MenuDef = {
  handle: string;
  title: string;
  items: MenuItemDef[];
};

/** Main navigation — English URLs only */
export const MENU_DEFINITIONS: MenuDef[] = [
  {
    handle: "main-menu",
    title: "Main menu",
    items: [
      {
        title: "Drones",
        type: "HTTP",
        url: "/collections/consumer-drones",
        items: [
          { title: "DJI Mini", type: "HTTP", url: "/collections/dji-mini-4-series" },
          { title: "DJI Air", type: "HTTP", url: "/collections/dji-air-3-series" },
          { title: "DJI Mavic", type: "HTTP", url: "/collections/dji-mavic-3-series" },
          { title: "DJI Avata / FPV", type: "HTTP", url: "/collections/dji-avata-series" },
        ],
      },
      {
        title: "Enterprise",
        type: "HTTP",
        url: "/pages/enterprise",
        items: [
          { title: "DJI Matrice", type: "HTTP", url: "/collections/dji-matrice-series" },
          { title: "DJI Agras", type: "HTTP", url: "/collections/dji-agras-drones" },
          { title: "DJI Dock", type: "HTTP", url: "/collections/dji-matrice-400-series" },
          { title: "Zenmuse / Payload", type: "HTTP", url: "/collections/enterprise-sensors" },
          { title: "Wingtra", type: "HTTP", url: "/collections/enterprise-drones" },
          { title: "Livox", type: "HTTP", url: "/collections/enterprise-drones" },
          { title: "CZI", type: "HTTP", url: "/collections/enterprise-drones" },
        ],
      },
      {
        title: "Solutions",
        type: "HTTP",
        url: "/pages/energy-infrastructure",
        items: [
          { title: "Energy & Infrastructure", type: "HTTP", url: "/pages/energy-infrastructure" },
          { title: "GIS & Mapping", type: "HTTP", url: "/pages/gis-mapping" },
          { title: "Emergency Services", type: "HTTP", url: "/pages/emergency-services" },
        ],
      },
      {
        title: "Accessories",
        type: "HTTP",
        url: "/collections/consumer-drone-accessories",
        items: [
          { title: "Filters", type: "HTTP", url: "/collections/drone-filters" },
          { title: "Propellers", type: "HTTP", url: "/collections/drone-propeller-accessories" },
          { title: "Batteries", type: "HTTP", url: "/collections/batteries" },
          { title: "Bags", type: "HTTP", url: "/collections/drone-backpacks-bags" },
          { title: "Remote Control", type: "HTTP", url: "/collections/drone-remote-control-accessories" },
        ],
      },
      { title: "Guides", type: "HTTP", url: "/blogs/guides" },
    ],
  },
  {
    handle: "footer",
    title: "Footer menu",
    items: [
      { title: "About", type: "HTTP", url: "/pages/about" },
      { title: "Mission & Vision", type: "HTTP", url: "/pages/mission-vision" },
      { title: "Contact", type: "HTTP", url: "/pages/contact" },
      { title: "Shipping", type: "HTTP", url: "/pages/shipping" },
      { title: "Returns", type: "HTTP", url: "/pages/returns" },
      { title: "Privacy Policy", type: "HTTP", url: "/policies/privacy-policy" },
      { title: "Terms of Service", type: "HTTP", url: "/policies/terms-of-service" },
    ],
  },
  {
    handle: "partnership",
    title: "Partnership",
    items: [
      { title: "Become a Partner", type: "HTTP", url: "/pages/partnership" },
      { title: "B2B Inquiry", type: "HTTP", url: "/pages/b2b" },
    ],
  },
  {
    handle: "enterprise-drones",
    title: "Enterprise Drones",
    items: [
      { title: "Enterprise Drones", type: "HTTP", url: "/collections/enterprise-drones" },
      { title: "Enterprise Accessories", type: "HTTP", url: "/collections/enterprise-accessories" },
      { title: "Inspection Drones", type: "HTTP", url: "/collections/inspection-drones" },
      { title: "Agricultural Drones", type: "HTTP", url: "/collections/agricultural-drones" },
    ],
  },
  {
    handle: "customer-account-main-menu",
    title: "Customer account main menu",
    items: [
      { title: "Orders", type: "HTTP", url: "/account" },
    ],
  },
];

/** Shopify Markets target architecture */
export type MarketDef = {
  name: string;
  domain: string;
  defaultLocale: string;
  alternateLocales: string[];
  primary: boolean;
  currency: string;
  country: string;
};

export const MARKET_DEFINITIONS: MarketDef[] = [
  {
    name: "International",
    domain: EDP_DOMAINS.primary,
    defaultLocale: "en",
    alternateLocales: [],
    primary: true,
    currency: "EUR",
    country: "EU",
  },
  {
    name: "Germany",
    domain: EDP_DOMAINS.de,
    defaultLocale: "de",
    alternateLocales: ["en"],
    primary: false,
    currency: "EUR",
    country: "DE",
  },
  {
    name: "Denmark",
    domain: EDP_DOMAINS.dk,
    defaultLocale: "da",
    alternateLocales: ["en"],
    primary: false,
    currency: "DKK",
    country: "DK",
  },
  {
    name: "Sweden",
    domain: EDP_DOMAINS.se,
    defaultLocale: "sv",
    alternateLocales: ["en"],
    primary: false,
    currency: "SEK",
    country: "SE",
  },
];

/**
 * Translation structure: English is the canonical content language (handles + base copy).
 * Locale translations are applied via Shopify Translations API per market.
 */
export type TranslationLocaleDef = {
  locale: string;
  label: string;
  markets: string[];
  resourceTypes: Array<"product" | "collection" | "page" | "article" | "menu" | "theme">;
  fields: string[];
};

export const TRANSLATION_STRUCTURE: TranslationLocaleDef[] = [
  {
    locale: "en",
    label: "English (canonical)",
    markets: [EDP_DOMAINS.primary],
    resourceTypes: ["product", "collection", "page", "article", "menu", "theme"],
    fields: ["title", "body_html", "seo.title", "seo.description"],
  },
  {
    locale: "de",
    label: "German",
    markets: [EDP_DOMAINS.de],
    resourceTypes: ["product", "collection", "page", "article", "menu", "theme"],
    fields: ["title", "body_html", "seo.title", "seo.description"],
  },
  {
    locale: "da",
    label: "Danish",
    markets: [EDP_DOMAINS.dk],
    resourceTypes: ["product", "collection", "page", "article", "menu", "theme"],
    fields: ["title", "body_html", "seo.title", "seo.description"],
  },
  {
    locale: "sv",
    label: "Swedish",
    markets: [EDP_DOMAINS.se],
    resourceTypes: ["product", "collection", "page", "article", "menu", "theme"],
    fields: ["title", "body_html", "seo.title", "seo.description"],
  },
];
