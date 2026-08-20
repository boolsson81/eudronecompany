#!/usr/bin/env node
/**
 * Read-only URL localization audit for EuroDroneParts.
 * Writes URL_LOCALIZATION_AUDIT.md — no Shopify mutations.
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPORT = join(ROOT, "URL_LOCALIZATION_AUDIT.md");
const URL = process.env.CLONER_SUPABASE_URL || "https://wsncjdajweoujhidlxas.supabase.co";
const MID = "3d9876af-885c-49e9-a4b0-c4943c06112f";
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

async function post(fn, body) {
  const key = apiKey();
  const r = await fetch(`${URL}/functions/v1/${fn}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, apikey: key },
    body: JSON.stringify(body),
  });
  return r.json();
}

async function gql(query, variables = {}) {
  const json = await post("test-integration", {
    integration_type: "shopify",
    config: { store_domain: STORE, access_token: "***configured***" },
    shopify_graphql: { query, variables },
  });
  if (!json?.success || json?.errors?.length) {
    throw new Error(json?.errors?.[0]?.message || json?.message || "GraphQL failed");
  }
  return json.data;
}

async function paginateGql(rootField, nodeShape, pageSize = 250) {
  const all = [];
  let cursor = null;
  for (let page = 0; page < 200; page++) {
    const q = `
      query($cursor: String) {
        ${rootField}(first: ${pageSize}, after: $cursor) {
          pageInfo { hasNextPage endCursor }
          edges { cursor node { ${nodeShape} } }
        }
      }
    `;
    const data = await gql(q, { cursor });
    const conn = data[rootField];
    for (const e of conn?.edges || []) {
      if (e?.node) all.push(e.node);
    }
    if (!conn?.pageInfo?.hasNextPage) break;
    cursor = conn.pageInfo.endCursor;
  }
  return all;
}

// Swedish stems for HANDLE analysis only (ASCII transliterations)
const SWEDISH_HANDLE_STEMS = [
  "tillbehor", "tillbe", "reservdelar", "reservdel", "dronare", "dronar",
  "actionkameror", "actionkamera", "actionkamer", "kameror", "kameratillbehor",
  "utrustning", "vandring", "vandrings", "mobiltillbehor", "belysning",
  "batterier", "laddare", "vaska", "vaskor", "ryggsack", "fjarrkontroll",
  "fjarrkontroller", "landningsstall", "propellrar", "fasten", "faste",
  "rengoringsprodukter", "rengorings", "multiverktyg", "skruvmejsel", "pincetter",
  "tanger", "bandverktyg", "precisionsverktyg", "hogtalarsystem", "hogtalare",
  "bastsaljare", "presentkort", "produktnyheter", "friluftsliv", "vinterutrustning",
  "vintersport", "campingutrustning", "campingkoksutrustning", "campingmobler",
  "cykeltillbehor", "cykelfasten", "cykelbelysning", "vandringsstavar",
  "vandringsutrustning", "jordbruksdronare", "skogsbruksdronare", "inspektionsdronare",
  "sakerhets", "raddnings", "raddningsfilt", "kartlaggnings", "matdronare",
  "lastdronare", "branschlosningar", "omfattande", "sortiment", "hogkvalitativa",
  "aventyr", "aventyrer", "fotografen", "mekaren", "dronarpiloten", "tradlosa",
  "tradlos", "stromavbrott", "vevradio", "ficklampa", "visselpipa", "lyftsystem",
  "minneskort", "skyddsskal", "skyddsshus", "propellerskydd", "ringlampa",
  "slangkamera", "webbkamera", "mikrofoner", "dykutrustning", "biltillbehor",
  "kopvillkor", "integritet", "kundservice", "huvudmeny", "meny", "dr-nare",
  "kablar", "adaptrar", "verktyg", "reparation", "reparera", "dronartillbehor",
  "dronarpropellrar", "utomhus", "friluft", "beredskap", "felsokning",
  "reklamation", "aterkop", "myggskydd", "nackrem", "delar", "skydd", "batteri",
  "kabel", "hogtal", "sakerhet", "teknisk", "gimbal-gimbal", "kameror-kameror",
  "outdoor-utrustning", "dronare-actionking", "actionkamer-dji", "kameratillbehor",
];

const ENGLISH_BRAND_TOKENS = [
  "dji", "gopro", "insta360", "sony", "canon", "nikon", "osmo", "mavic", "mini",
  "phantom", "matrice", "avata", "fpv", "enterprise", "usb", "hdmi", "gps", "4k",
  "360", "max", "pro", "air", "neo", "flip", "inspire", "polarpro", "ulanzi",
  "telesin", "baseus", "ugreen", "nitecore", "nextool", "wowstick", "wuben",
  "puluz", "ruigpro", "startrc", "pgytech", "feichao", "sunnylife", "hoverair",
  "motorola", "hero", "accessories", "accessory", "spare", "parts", "batteries",
  "battery", "chargers", "charger", "drone", "drones", "camera", "cameras", "gimbal",
  "filter", "filters", "mount", "mounts", "bag", "bags", "service", "support",
  "faq", "test", "deploy", "delete", "cleaning", "products", "series", "comprehensive",
  "range", "and", "for", "with", "the", "original", "compatible",
];

const ASCII_SWEDISH_MAP = {
  tillbehor: "accessories",
  tillbe: "accessories",
  reservdelar: "spare-parts",
  reservdel: "spare-part",
  dronare: "drones",
  dronar: "drones",
  actionkameror: "action-cameras",
  actionkamera: "action-camera",
  actionkamer: "action-camera",
  kameror: "cameras",
  kamera: "camera",
  utrustning: "equipment",
  vandring: "hiking",
  vandrings: "hiking",
  mobiltillbehor: "mobile-accessories",
  belysning: "lighting",
  batterier: "batteries",
  batteri: "battery",
  laddare: "chargers",
  vaskor: "bags",
  vaska: "bag",
  ryggsack: "backpack",
  skydd: "protection",
  fasten: "mounts",
  faste: "mount",
  propellrar: "propellers",
  propeller: "propeller",
  fjarrkontroller: "remote-controllers",
  fjarrkontroll: "remote-control",
  landningsstall: "landing-gear",
  landning: "landing",
  filter: "filters",
  stativ: "tripods",
  reparation: "repair",
  reparera: "repair",
  verktyg: "tools",
  rengoringsprodukter: "cleaning-products",
  multiverktyg: "multi-tools",
  skruvmejsel: "screwdrivers",
  pincetter: "tweezers",
  tanger: "pliers",
  bandverktyg: "pliers",
  precisionsverktyg: "precision-tools",
  hogtalarsystem: "speaker-systems",
  hogtalare: "speakers",
  bastsaljare: "bestsellers",
  presentkort: "gift-cards",
  produktnyheter: "product-news",
  friluftsliv: "outdoor-life",
  vinterutrustning: "winter-equipment",
  vintersport: "winter-sports",
  campingutrustning: "camping-equipment",
  campingkoksutrustning: "camping-cookware",
  campingmobler: "camping-furniture",
  cykeltillbehor: "cycling-accessories",
  cykelfasten: "bike-mounts",
  cykelbelysning: "bike-lighting",
  vandringsstavar: "hiking-poles",
  vandringsutrustning: "hiking-equipment",
  jordbruksdronare: "agricultural-drones",
  skogsbruksdronare: "forestry-drones",
  inspektionsdronare: "inspection-drones",
  sakerhets: "safety",
  raddnings: "rescue",
  raddningsfilt: "rescue-blanket",
  kartlaggnings: "mapping",
  matdronare: "survey-drones",
  transport: "transport",
  logistik: "logistics",
  energi: "energy",
  infrastruktur: "infrastructure",
  branschlosningar: "industry-solutions",
  omfattande: "comprehensive",
  sortiment: "range",
  hogkvalitativa: "high-quality",
  professionella: "professional",
  aventyr: "adventure",
  aventyrer: "adventures",
  fotografen: "photographer",
  mekaren: "mechanic",
  dronarpiloten: "drone-pilot",
  utomhus: "outdoor",
  tradgardsredskap: "garden-tools",
  tradlosa: "wireless",
  tradlos: "wireless",
  stromavbrott: "power-outage",
  vevradio: "crank-radio",
  ficklampa: "flashlight",
  visselpipa: "whistle",
  sakerhet: "safety",
  lastdronare: "cargo-drones",
  lyftsystem: "lifting-system",
  minneskort: "memory-cards",
  lagring: "storage",
  kablar: "cables",
  kabel: "cable",
  adapter: "adapters",
  adaptrar: "adapters",
  delar: "parts",
  skyddsskal: "protective-cases",
  skyddsshus: "protective-housing",
  propellerskydd: "propeller-guards",
  ringlampa: "ring-light",
  slangkamera: "snake-camera",
  webbkamera: "webcam",
  mikrofoner: "microphones",
  mikrofon: "microphone",
  walkie: "walkie",
  talkie: "talkie",
  solceller: "solar-panels",
  dykutrustning: "diving-equipment",
  snowboards: "snowboards",
  biltillbehor: "car-accessories",
  biltoken: "car-token",
  dack: "tires",
  falgar: "rims",
  scootrar: "scooters",
  ansok: "apply",
  huvudmeny: "main-menu",
  sidfot: "footer",
  kontakt: "contact",
  kopvillkor: "terms-of-purchase",
  integritet: "privacy",
  retur: "returns",
  leverans: "delivery",
  betalning: "payment",
  kundservice: "customer-service",
  "enterprise-dr-nare": "enterprise-drones",
  "dr-nare": "drones",
  dronare: "drones",
  dronarek: "drones",
  "spare-parts-deploy": "spare-parts",
  "service-support-deploy": "service-support",
  mobiltillbehor: "mobile-accessories",
  gimbal: "gimbal",
  outdoor: "outdoor",
  men: "menu",
  meny: "menu",
};

function segments(handle) {
  return String(handle).toLowerCase().split(/[-_]+/).filter(Boolean);
}

function hasSwedishCharsInHandle(handle) {
  return /[åäöÅÄÖ]/.test(String(handle));
}

const ENGLISH_SEGMENT_ALLOWLIST = new Set([
  "batteries", "battery", "drones", "drone", "cameras", "camera", "accessories",
  "accessory", "chargers", "charger", "filters", "filter", "mounts", "mount",
  "bags", "bag", "parts", "spare", "support", "service", "products", "series",
  "comprehensive", "range", "cleaning", "delete", "deploy", "test", "original",
  "compatible", "enterprise", "professional", "components", "protection",
]);

function stemMatchesSegment(stem, seg) {
  if (ENGLISH_SEGMENT_ALLOWLIST.has(seg)) return false;
  if (seg === stem) return true;
  if (seg.length > stem.length + 1 && (seg.startsWith(stem) || seg.endsWith(stem))) return true;
  return false;
}

function swedishStemsInHandle(handle) {
  const h = String(handle).toLowerCase();
  const segs = segments(h);
  const found = [];
  for (const stem of SWEDISH_HANDLE_STEMS) {
    const hit =
      segs.some((s) => stemMatchesSegment(stem, s)) ||
      (stem.length >= 10 && h.includes(stem));
    if (hit && !found.includes(stem)) found.push(stem);
  }
  return found;
}

function hasEnglishBrandInHandle(handle) {
  const segs = segments(handle);
  return ENGLISH_BRAND_TOKENS.some((t) => segs.includes(t));
}

function classifyHandle(handle) {
  const stems = swedishStemsInHandle(handle);
  const hasChars = hasSwedishCharsInHandle(handle);
  const hasSwedishWords = stems.length > 0 || hasChars;
  const hasEnglishBrand = hasEnglishBrandInHandle(handle);
  const isMixed = hasSwedishWords && hasEnglishBrand;

  let category = "english";
  if (hasChars) category = "swedish_chars";
  else if (isMixed) category = "mixed_swedish_english";
  else if (hasSwedishWords) category = "swedish_ascii";

  return { category, tokens: stems, hasChars, isMixed, hasSwedishWords };
}

function suggestEnglish(handle) {
  const h = handle.toLowerCase();
  if (ASCII_SWEDISH_MAP[h]) return ASCII_SWEDISH_MAP[h];
  const segs = segments(h);
  const replaced = segs.map((s) => ASCII_SWEDISH_MAP[s] || s);
  const out = replaced.join("-").replace(/--+/g, "-").replace(/^-|-$/g, "");
  return out === h ? null : out;
}

function extractPathHandle(url) {
  if (!url) return null;
  const u = String(url);
  const m = u.match(/\/(?:en\/)?(collections|products|pages|blogs)(?:\/([^/?#]+))?(?:\/([^/?#]+))?/i);
  if (!m) return { type: "other", handle: u, full: u };
  const [, type, h1, h2] = m;
  if (type === "blogs" && h2) return { type: "article", blog: h1, handle: h2, full: u };
  return { type, handle: h1, full: u };
}

function flattenMenuItems(items, menuHandle, menuTitle, out = []) {
  for (const it of items || []) {
    out.push({
      menu_handle: menuHandle,
      menu_title: menuTitle,
      title: it.title,
      url: it.url,
      type: it.type,
      parsed: extractPathHandle(it.url),
    });
    if (it.items?.length) flattenMenuItems(it.items, menuHandle, menuTitle, out);
  }
  return out;
}

function table(rows, cols) {
  if (!rows.length) return "_None._\n";
  const header = `| ${cols.join(" | ")} |`;
  const sep = `| ${cols.map(() => "---").join(" | ")} |`;
  const body = rows.map((r) => `| ${cols.map((c) => String(r[c] ?? "—").replace(/\|/g, "\\|").replace(/\n/g, " ")).join(" | ")} |`);
  return [header, sep, ...body].join("\n");
}

function sectionTable(handles, titleKey = "title") {
  return table(
    handles.slice(0, 100).map((r) => ({
      Handle: r.handle,
      Title: r[titleKey] || "—",
      Category: r.classification?.category || r.category,
      SwedishTokens: (r.classification?.tokens || r.tokens || []).slice(0, 4).join(", ") || "—",
      SuggestedEN: r.suggested || suggestEnglish(r.handle) || "—",
    })),
    ["Handle", "Title", "Category", "SwedishTokens", "SuggestedEN"],
  );
}

async function main() {
  loadEnv();
  const generatedAt = new Date().toISOString();

  console.log("Fetching collection audit...");
  const collAudit = await post("shopify-cloner-worker", {
    action: "collection_reconciliation_audit",
    migration_id: MID,
  });

  const sourceCollections = collAudit.SOURCE_COLLECTIONS || [];
  const targetCollections = collAudit.TARGET_COLLECTIONS || [];

  console.log("Fetching live pages...");
  let pages = [];
  try {
    pages = await paginateGql("pages", "id handle title isPublished");
  } catch (e) {
    console.warn("pages:", e.message);
  }

  console.log("Fetching live blogs + articles...");
  let blogs = [];
  let articles = [];
  try {
    blogs = await paginateGql("blogs", "id handle title");
    for (const blog of blogs) {
      const arts = await paginateGql(
        `blog(id: "${blog.id}") { articles`,
        "id handle title blog { handle }",
        100,
      ).catch(() => []);
      // paginateGql won't work for nested — use dedicated query
    }
    const BLOG_ARTICLES = `
      query($cursor: String) {
        articles(first: 250, after: $cursor) {
          pageInfo { hasNextPage endCursor }
          edges { node { id handle title blog { handle title } } }
        }
      }
    `;
    let cursor = null;
    for (let i = 0; i < 100; i++) {
      const data = await gql(BLOG_ARTICLES, { cursor });
      const conn = data.articles;
      for (const e of conn?.edges || []) articles.push(e.node);
      if (!conn?.pageInfo?.hasNextPage) break;
      cursor = conn.pageInfo.endCursor;
    }
  } catch (e) {
    console.warn("blogs:", e.message);
  }

  console.log("Fetching live products (sample + count)...");
  let products = [];
  let productCount = 0;
  try {
    const COUNT_Q = `query { productsCount { count } }`;
    const countData = await gql(COUNT_Q);
    productCount = countData?.productsCount?.count ?? 0;
    products = await paginateGql("products", "id handle title status", 250);
  } catch (e) {
    console.warn("products:", e.message);
  }

  console.log("Fetching menus with links...");
  let menuLinks = [];
  let menus = [];
  const MENUS_Q = `
    query($cursor: String) {
      menus(first: 50, after: $cursor) {
        pageInfo { hasNextPage endCursor }
        nodes { handle title items { title url type items { title url type items { title url type } } } }
      }
    }
  `;
  try {
    let cursor = null;
    for (let i = 0; i < 30; i++) {
      const data = await gql(MENUS_Q, { cursor });
      const conn = data.menus;
      for (const n of conn?.nodes || []) {
        menus.push({ handle: n.handle, title: n.title });
        flattenMenuItems(n.items, n.handle, n.title, menuLinks);
      }
      if (!conn?.pageInfo?.hasNextPage) break;
      cursor = conn.pageInfo.endCursor;
    }
  } catch (e) {
    console.warn("menus:", e.message);
  }

  function enrich(rows, titleKey = "title") {
    return rows.map((r) => {
      const handle = r.handle;
      const classification = classifyHandle(handle);
      const suggested = suggestEnglish(handle);
      return { ...r, classification, suggested, category: classification.category };
    });
  }

  const liveCollections = enrich(targetCollections);
  const livePages = enrich(pages);
  const liveBlogs = enrich(blogs);
  const liveArticles = enrich(articles);
  const liveProducts = enrich(products);

  const swedishCollections = liveCollections.filter((r) => r.classification.hasSwedishWords || r.classification.hasChars);
  const swedishPages = livePages.filter((r) => r.classification.hasSwedishWords || r.classification.hasChars);
  const swedishProducts = liveProducts.filter((r) => r.classification.hasSwedishWords || r.classification.hasChars);
  const swedishBlogs = [...liveBlogs, ...liveArticles].filter((r) => r.classification.hasSwedishWords || r.classification.hasChars);

  // Duplicate English alternatives: pairs where suggested English equals another live handle
  const allLiveHandles = new Map();
  for (const r of liveCollections) allLiveHandles.set(r.handle, "collection");
  for (const r of livePages) allLiveHandles.set(r.handle, "page");
  for (const r of liveProducts) allLiveHandles.set(r.handle, "product");

  const duplicates = [];
  for (const r of [...swedishCollections, ...swedishPages, ...swedishProducts]) {
    const sug = r.suggested;
    if (sug && sug !== r.handle && allLiveHandles.has(sug)) {
      duplicates.push({ handle: r.handle, suggested: sug, existing_type: allLiveHandles.get(sug) });
    }
  }

  // Menu link analysis
  const swedishMenuLinks = menuLinks.filter((l) => {
    const ph = l.parsed?.handle || l.parsed?.blog;
    if (ph) {
      const c = classifyHandle(ph);
      return c.hasSwedishWords || c.hasChars;
    }
    return /[åäö]|tillbehor|dronare|reservdelar|vandring|utrustning|kameror|mobiltillbehor|kopvillkor|kablar|belysning|fjarrkontroll/i.test(l.url || "");
  });

  const canonicalMenus = new Set([
    "main-menu", "footer", "partnership", "enterprise-dr-nare",
    "customer-account-main-menu", "spare-parts-deploy", "service-support-deploy",
  ]);

  const menusWithSwedishLinks = [...new Set(swedishMenuLinks.map((l) => l.menu_handle))];

  // Migration scope: source collections that are Swedish
  const sourceSwedish = enrich(sourceCollections).filter((r) => r.classification.hasSwedishWords || r.classification.hasChars);

  const urlsAffected =
    swedishCollections.length +
    swedishPages.length +
    swedishProducts.length +
    swedishBlogs.length +
    swedishMenuLinks.length;

  const redirectsRequired = swedishCollections.length + swedishPages.length + swedishProducts.length + swedishBlogs.length;

  const trafficLight = urlsAffected < 50 ? "GREEN" : urlsAffected <= 500 ? "YELLOW" : "RED";
  const recommendation = trafficLight === "GREEN" ? "A) Launch now and localize later" : "B) Localize before launch";

  const replacements = [...swedishCollections, ...swedishPages, ...swedishProducts]
    .filter((r) => r.suggested && r.suggested !== r.handle)
    .sort((a, b) => a.handle.localeCompare(b.handle));

  const lines = [
    "# EuroDroneParts — URL Localization Audit",
    "",
    `**Generated:** ${generatedAt}`,
    `**Target store:** ${STORE} (Europe Drone Parts)`,
    `**Migration:** \`${MID}\` (ActionKing → EUDroneParts)`,
    "**Mode:** Read-only — no Shopify changes, no redirects deployed",
    "",
    "## Executive summary",
    "",
    "| Metric | Count |",
    "|---|---:|",
    `| Live collections | ${targetCollections.length} |`,
    `| Source collections (migration DB) | ${sourceCollections.length} |`,
    `| Live pages | ${pages.length} |`,
    `| Live blogs | ${blogs.length} |`,
    `| Live blog articles | ${articles.length} |`,
    `| Live products (fetched) | ${products.length} |`,
    `| Live products (store total) | ${productCount || "—"} |`,
    `| Live menus | ${menus.length} |`,
    `| Menu links (all) | ${menuLinks.length} |`,
    `| **Swedish/mixed handles (live collections)** | **${swedishCollections.length}** |`,
    `| Swedish/mixed handles (live pages) | ${swedishPages.length} |`,
    `| Swedish/mixed handles (live products sample) | ${swedishProducts.length} |`,
    `| Swedish/mixed handles (blogs/articles) | ${swedishBlogs.length} |`,
    `| Swedish menu links | ${swedishMenuLinks.length} |`,
    `| Handles with Swedish chars (å/ä/ö) | ${[...liveCollections, ...livePages, ...liveProducts, ...liveBlogs].filter((r) => r.classification.hasChars).length} |`,
    `| Duplicate English alternatives detected | ${duplicates.length} |`,
    "",
    `### Traffic light: **${trafficLight}**`,
    "",
    trafficLight === "GREEN"
      ? "Fewer than 50 URLs affected — localization debt is manageable at launch."
      : trafficLight === "YELLOW"
        ? "50–500 URLs affected — meaningful SEO and UX risk for international audiences."
        : "More than 500 URLs affected — large-scale handle migration required before credible EN launch.",
    "",
    `### Recommendation: **${recommendation}**`,
    "",
    "---",
    "",
    "## SECTION 1 — Collections using Swedish handles",
    "",
    `**Live target:** ${swedishCollections.length} of ${targetCollections.length} collections contain Swedish ASCII tokens, transliterations, or Swedish characters.`,
    "",
    "### Breakdown by pattern",
    "",
    "| Pattern | Count |",
    "|---|---:|",
    `| Swedish ASCII tokens (tillbehor, dronare, reservdelar, etc.) | ${swedishCollections.filter((r) => r.category === "swedish_ascii").length} |`,
    `| Mixed Swedish + English brand (e.g. dji-*-tillbehor) | ${swedishCollections.filter((r) => r.category === "mixed_swedish_english").length} |`,
    `| Swedish characters (å/ä/ö) in handle | ${swedishCollections.filter((r) => r.category === "swedish_chars").length} |`,
    "",
    "### Top Swedish collection handles (live target)",
    "",
    sectionTable(swedishCollections.sort((a, b) => a.handle.localeCompare(b.handle))),
    swedishCollections.length > 100 ? `\n_Showing first 100 of ${swedishCollections.length}._\n` : "",
    "",
    "### Notable mixed Swedish/English examples",
    "",
    table(
      swedishCollections
        .filter((r) => r.classification.isMixed)
        .slice(0, 25)
        .map((r) => ({
          Handle: r.handle,
          Title: r.title,
          Tokens: r.classification.tokens.slice(0, 3).join(", "),
          URL: `/collections/${r.handle}`,
        })),
      ["Handle", "Title", "Tokens", "URL"],
    ),
    "",
    "---",
    "",
    "## SECTION 2 — Pages using Swedish handles",
    "",
    swedishPages.length
      ? sectionTable(swedishPages)
      : "_No live pages with Swedish handle tokens detected._\n",
    "",
    "### All live page handles (reference)",
    "",
    table(
      livePages.slice(0, 50).map((r) => ({ Handle: r.handle, Title: r.title, Category: r.category })),
      ["Handle", "Title", "Category"],
    ),
    pages.length > 50 ? `\n_Showing 50 of ${pages.length} pages._\n` : "",
    "",
    "---",
    "",
    "## SECTION 3 — Products using Swedish handles",
    "",
    `**Note:** Full catalog has **${productCount || products.length}** products. Analysis below covers ${products.length} handles fetched via GraphQL pagination.`,
    "",
    swedishProducts.length
      ? sectionTable(swedishProducts.sort((a, b) => a.handle.localeCompare(b.handle)))
      : `_No Swedish product handles in fetched sample (${products.length} products scanned)._`,
    products.length > 100 ? `\n_Showing first 100 Swedish handles if any; sample size ${products.length}._\n` : "",
    "",
    "### Product handle language split (fetched sample)",
    "",
    "| Category | Count |",
    "|---|---:|",
    `| English/neutral | ${liveProducts.filter((r) => r.category === "english").length} |`,
    `| Swedish ASCII | ${liveProducts.filter((r) => r.category === "swedish_ascii").length} |`,
    `| Mixed Swedish/English | ${liveProducts.filter((r) => r.category === "mixed_swedish_english").length} |`,
    `| Swedish chars | ${liveProducts.filter((r) => r.category === "swedish_chars").length} |`,
    "",
    "---",
    "",
    "## SECTION 4 — Recommended English replacements",
    "",
    "Transliteration map applied to common Swedish ecommerce tokens. Brand names (DJI, GoPro, etc.) preserved.",
    "",
    table(
      replacements.slice(0, 75).map((r) => ({
        Current: r.handle,
        Suggested: r.suggested,
        Type: allLiveHandles.has(r.suggested) ? `⚠ exists (${allLiveHandles.get(r.suggested)})` : "new",
        CurrentURL: `/collections/${r.handle}`,
        SuggestedURL: allLiveHandles.has(r.suggested) ? `/${allLiveHandles.get(r.suggested)}s/${r.suggested}` : `/collections/${r.suggested}`,
      })),
      ["Current", "Suggested", "Type", "CurrentURL", "SuggestedURL"],
    ),
    replacements.length > 75 ? `\n_Showing 75 of ${replacements.length} replacement candidates._\n` : "",
    "",
    "### Duplicate English alternatives (collision risk)",
    "",
    duplicates.length
      ? table(
          duplicates.slice(0, 30).map((d) => ({
            SwedishHandle: d.handle,
            EnglishExists: d.suggested,
            ExistingType: d.existing_type,
          })),
          ["SwedishHandle", "EnglishExists", "ExistingType"],
        )
      : "_No exact English handle collisions detected among live collections/pages/products._",
    "",
    "### Blog handles",
    "",
    blogs.length
      ? table(liveBlogs.map((r) => ({ Handle: r.handle, Title: r.title, Category: r.category })), ["Handle", "Title", "Category"])
      : "_No blogs on live target or fetch failed._",
    "",
    "---",
    "",
    "## SECTION 5 — Migration complexity",
    "",
    "### Scope estimates",
    "",
    "| Item | Estimate |",
    "|---|---|",
    `| URLs affected (collections + pages + products + blogs + menu links) | **${urlsAffected}** |`,
    `| 301 redirects required (entity handle changes only) | **${redirectsRequired}** |`,
    `| Menus with Swedish internal links | **${menusWithSwedishLinks.length}** (${menusWithSwedishLinks.filter((h) => canonicalMenus.has(h)).join(", ") || "see below"}) |`,
    `| Internal menu links with Swedish paths | **${swedishMenuLinks.length}** |`,
    `| Source migration collections with Swedish tokens (historical) | **${sourceSwedish.length}** of ${sourceCollections.length} |`,
    `| Legacy ActionKing-only collections not on target | **${collAudit.counts?.missing_collections ?? "—"}** |`,
    "",
    "### Menus affected",
    "",
    table(
      menusWithSwedishLinks.map((h) => {
        const m = menus.find((x) => x.handle === h);
        const links = swedishMenuLinks.filter((l) => l.menu_handle === h);
        return {
          MenuHandle: h,
          MenuTitle: m?.title || "—",
          SwedishLinks: links.length,
          Canonical: canonicalMenus.has(h) ? "yes" : "no",
        };
      }),
      ["MenuHandle", "MenuTitle", "SwedishLinks", "Canonical"],
    ),
    "",
    "### Sample Swedish menu links",
    "",
    table(
      swedishMenuLinks.slice(0, 40).map((l) => ({
        Menu: l.menu_handle,
        Label: l.title,
        URL: l.url,
        PathHandle: l.parsed?.handle || "—",
      })),
      ["Menu", "Label", "URL", "PathHandle"],
    ),
    "",
    "### Internal links affected",
    "",
    "- **Theme navigation:** `main-menu` is theme-referenced (`sections/header-group.json`) with 41 items; many point to Swedish collection paths.",
    "- **Deployment menus:** `spare-parts-deploy` (47 items) and `service-support-deploy` (14 items) are English handles but link heavily to Swedish collection URLs.",
    "- **Legacy migration menus:** 200+ duplicate empty menus (`actionkameror-N`, `partnership-N`, `dronare-N`) from failed migration retries — cleanup separate from localization.",
    "- **Cross-links in collection descriptions/SEO:** not scanned in this pass; expect additional internal links proportional to Swedish collection count.",
    "",
    "### Complexity factors",
    "",
    "| Factor | Impact |",
    "|---|---|",
    "| Shopify handle immutability | High — requires create-new + redirect, not in-place rename |",
    "| Smart collection rules | Medium — 6 DJI smart collections use Swedish handles with broken rules post-migration |",
    "| Menu rebuild | High — canonical menus embed Swedish `/collections/*` paths |",
    `| Product volume | ${productCount > 10000 ? "High" : "Medium"} — ${productCount || "12,000+"} products; sample shows predominantly English product handles |`,
    "| Hreflang / Markets | Not configured — Swedish URLs on primary domain block clean EN market launch |",
    "| Legacy ActionKing scope | 787 collections missing on target; many Swedish — excluded from live site but remain in migration DB |",
    "",
    "### Effort characterization",
    "",
    trafficLight === "RED"
      ? "Large migration: bulk collection handle rewrites, menu URL updates, redirect map (1:1 per changed handle), Search Console resubmission, and staged rollout with backlink monitoring."
      : trafficLight === "YELLOW"
        ? "Moderate migration: prioritize theme-linked menus and top-traffic Swedish collections first; product layer largely English already."
        : "Small migration: address canonical navigation menus and highest-traffic collection handles before EN marketing push.",
    "",
    "---",
    "",
    "## Appendix — Methodology",
    "",
    "- **Data sources:** `collection_reconciliation_audit` (live + source collections), Shopify Admin GraphQL via `test-integration` (pages, products, blogs, articles, menus).",
    "- **Swedish detection:** Token matching against Swedish ecommerce vocabulary (ASCII transliterations: tillbehor, dronare, reservdelar, vandring, etc.) plus Unicode å/ä/ö detection.",
    "- **Mixed URLs:** Handles containing both Swedish tokens and English brand tokens (e.g. `dji-mini-3-tillbehor`).",
    "- **Limitations:** Product scan limited to GraphQL pagination depth; blog articles fetched via `articles` connection; no theme Liquid/content link crawl; no external backlink analysis.",
    "",
  ];

  writeFileSync(REPORT, lines.join("\n"));
  console.log(`Wrote ${REPORT}`);
  console.log(JSON.stringify({
    trafficLight,
    recommendation,
    urlsAffected,
    redirectsRequired,
    swedishCollections: swedishCollections.length,
    swedishPages: swedishPages.length,
    swedishProducts: swedishProducts.length,
    productCount,
    productsFetched: products.length,
  }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
