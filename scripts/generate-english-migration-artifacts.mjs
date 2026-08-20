#!/usr/bin/env node
/**
 * Read-only — generates English migration artifacts for EuroDroneParts.
 * Outputs: ENGLISH_URL_MIGRATION_PLAN.md, ENGLISH_HANDLE_MAPPING.csv, REDIRECT_MAPPING.csv
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PLAN = join(ROOT, "ENGLISH_URL_MIGRATION_PLAN.md");
const HANDLE_CSV = join(ROOT, "ENGLISH_HANDLE_MAPPING.csv");
const REDIRECT_CSV = join(ROOT, "REDIRECT_MAPPING.csv");

const SWEDISH_TOKEN_MAP = [
  ["dronarutrustning", "drone-equipment"], ["dronarelektronik", "drone-electronics"],
  ["dronarmatta", "drone-mat"], ["fjarrkontrollstillbehor", "remote-control-accessories"],
  ["fjärrkontrollstillbehör", "remote-control-accessories"], ["kameratillbehor", "camera-accessories"],
  ["tillbehor", "accessories"], ["tillbehör", "accessories"], ["reservdelar", "spare-parts"],
  ["dronare", "drones"], ["dronar", "drone"], ["drönare", "drones"], ["drönar", "drone"],
  ["propellrar", "propellers"], ["fjarrkontroller", "remote-controls"], ["fjärrkontroller", "remote-controls"],
  ["fjarrkontroll", "remote-control"], ["belysning", "lighting"], ["vaskor", "bags"], ["vaska", "bag"],
  ["väskor", "bags"], ["väska", "bag"], ["kablar", "cables"], ["kabel", "cable"],
  ["rengoringsprodukter", "cleaning-products"], ["reparation", "repair"], ["reparera", "repair"],
  ["precisionsverktyg", "precision-tools"], ["skruvmejsel", "screwdriver"], ["bandverktyg", "pliers"],
  ["bändverktyg", "pliers"], ["pincetter", "tweezers"], ["tanger", "pliers"], ["kapor", "covers"],
  ["kåpor", "covers"], ["landningsstall", "landing-gear"], ["landning", "landing"], ["skydd", "protection"],
  ["minneskort", "memory-cards"], ["lagring", "storage"], ["jordbruksdronare", "agricultural-drones"],
  ["jordbruks", "agriculture"], ["inspektionsdronare", "inspection-drones"], ["inspektions", "inspection"],
  ["kartlaggning", "mapping"], ["kartläggning", "mapping"], ["matdronare", "survey-drones"],
  ["mätdronare", "survey-drones"], ["skogsbruksdronare", "forestry-drones"], ["skogsbruks", "forestry"],
  ["lastdronare", "cargo-drones"], ["last-och-transportdronare", "cargo-transport-drones"],
  ["transportdronare", "transport-drones"], ["alla-produkter", "all-products"], ["alla-konsumentdronare", "all-consumer-drones"],
  ["energi-infrastruktur", "energy-infrastructure"], ["transport-logistik", "transport-logistics"],
  ["hogtalarsystem", "speaker-systems"], ["högtalarsystem", "speaker-systems"], ["lyftsystem", "lifting-systems"],
  ["sensorer", "sensors"], ["foretag", "business"], ["företag", "business"], ["foretagskonto", "business-account"],
  ["företagskonto", "business-account"], ["offertforfragan", "request-a-quote"], ["offertförfrågan", "request-a-quote"],
  ["service-och-support", "service-support"], ["kontakt", "contact"], ["guider", "guides"], ["nyheter", "news"],
  ["raddningstjanst", "emergency-services"], ["räddningstjänst", "emergency-services"],
  ["gis-kartlaggning", "gis-mapping"], ["mobiltillbehor", "mobile-accessories"], ["actionkameror", "action-cameras"],
  ["vandring", "hiking"], ["utrustning", "equipment"], ["ansok", "apply"], ["ansök", "apply"],
  ["dronartillbehor", "drone-accessories"], ["fasten", "mounts"], ["fästen", "mounts"], ["adaptrar", "adapters"],
  ["multiverktyg", "multi-tools"], ["ringlampa", "ring-light"], ["vattentatt", "waterproof"], ["vattentätt", "waterproof"],
  ["kameratillbehor", "camera-accessories"], ["serien", "series"], ["serie", "series"], ["konsumentdronare", "consumer-drones"],
  ["branschlosningar", "industry-solutions"], ["branschlösningar", "industry-solutions"], ["varumarken", "brands"],
  ["kopvillkor", "terms-of-sale"], ["reklamation", "claims"], ["aterkop", "buyback"], ["samarbeta", "partner"],
  ["basta", "best"], ["myggskydd", "mosquito-repellent"], ["ljud", "audio"], ["faste", "mount"],
  ["stabilisering", "stabilization"], ["armar", "arms"], ["antenner", "antennas"], ["motorer", "motors"],
  ["kameror", "cameras"], ["skal", "shell"], ["varmekamera", "thermal-camera"], ["varme", "thermal"],
  ["felsokning", "troubleshooting"], ["felsökning", "troubleshooting"], ["kalibrering", "calibration"],
  ["batteritest", "battery-test"], ["firmwareuppdatering", "firmware-update"], ["garantihantering", "warranty-management"],
  ["serviceanmalan", "service-request"], ["serviceanmälan", "service-request"], ["finansiering", "financing"],
  ["serviceavtal", "service-agreement"], ["supportavtal", "support-agreement"], ["utbildning", "training"],
  ["partnerprogram", "partner-program"], ["vindkraft", "wind-power"], ["solparker", "solar-parks"],
  ["kraftnat", "power-grid"], ["kraftnät", "power-grid"], ["bygg-anlaggning", "construction"],
  ["bygg-anläggning", "construction"], ["sakerhet-raddning", "security-rescue"], ["säkerhet-raddning", "security-rescue"],
  ["sakerhet", "security"], ["säkerhet", "security"], ["laddare", "charger"], ["laddningsbara", "rechargeable"],
  ["uppladdnings", "rechargeable"], ["tradlos", "wireless"], ["trådlös", "wireless"], ["mikrofon", "microphone"],
  ["ficklampa", "flashlight"], ["spela-in", "record-audio"], ["ministativ", "mini-tripod"],
  ["selfiepinne", "selfie-stick"], ["silikonskal", "silicone-case"], ["silikon", "silicone"],
  ["skyddande", "protective"], ["forvaring", "storage"], ["förvaring", "storage"], ["batteri", "battery"],
  ["regler", "regulations"], ["sportkamera", "action-camera"], ["linsskydd", "lens-protector"],
  ["metallbur", "metal-cage"], ["kameraskydd", "camera-protection"], ["tillbehorskablar", "accessory-cables"],
  ["elektronik", "electronics"], ["utrustning", "equipment"], ["ovriga", "other"], ["övriga", "other"], ["meny", "menu"],
  ["huvudmeny", "main-menu"], ["sidfotsmeny", "footer-menu"], ["oversikt", "overview"], ["översikt", "overview"],
  ["omfattande", "comprehensive"], ["omfattande-sortiment", "full-range"], ["konsument", "consumer"],
  ["friluftsliv", "outdoor"], ["dykutrustning", "diving-equipment"], ["vandringsutrustning", "hiking-equipment"],
  ["campingutrustning", "camping-equipment"], ["overlevnadsutrustning", "survival-equipment"],
  ["bransch", "industry"], ["tjänster", "services"], ["tjanster", "services"],
];

const ENGLISH_SEGMENTS = new Set([
  "accessories", "spare", "parts", "drones", "drone", "series", "batteries", "battery", "propellers",
  "propeller", "filters", "filter", "lighting", "remote", "controls", "control", "protection", "storage",
  "memory", "cards", "enterprise", "professional", "inspection", "agricultural", "forestry", "mapping",
  "survey", "cargo", "transport", "logistics", "energy", "infrastructure", "sensors", "speaker", "speakers",
  "lifting", "systems", "system", "mounts", "adapters", "adapter", "cameras", "camera", "cables", "cable",
  "cleaning", "products", "repair", "precision", "tools", "quiet", "other", "with", "for", "and", "the",
  "all", "air", "mini", "mavic", "matrice", "agras", "flycart", "phantom", "inspire", "flip", "neo", "avata",
  "fpv", "rtk", "gimbal", "arms", "antennas", "motors", "shell", "bags", "cases", "bag", "case", "covers",
  "cover", "landings", "landing", "gear", "electronics", "components", "flight", "thermal", "waterproof",
  "industry", "solutions", "guides", "news", "contact", "support", "service", "request", "quote", "business",
  "account", "training", "partner", "program", "warranty", "calibration", "troubleshooting", "firmware",
  "update", "leasing", "financing", "agreement", "dji", "gopro", "insta360", "polarpro", "pgytech",
  "sunnylife", "master", "airscrew", "brdrc", "amagisn", "airdrop", "hoverair", "nitecore", "usb", "faq",
  "feedback", "cookies", "privacy", "terms", "sale", "returns", "claims", "about", "student", "tripod",
  "flashlight", "audio", "brands", "mount", "stabilization", "legacy", "comprehensive", "range", "advanced",
  "technology", "full", "dock", "expansion", "deploy", "quiet", "other", "pro", "max", "hero", "action",
  "gps", "gis", "wifi", "lte", "4k", "360", "cine", "classic", "thermal", "expansion", "b2b", "rma",
  "troubleshooting", "repair", "calibration", "financing", "leasing", "construction", "security", "rescue",
  "wind", "power", "solar", "parks", "grid", "agriculture", "forestry", "mapping", "logistics", "infrastructure",
]);

const ENGLISH_OK = /^(dji|gopro|insta360|polarpro|pgytech|sunnylife|master-airscrew|brdrc|amagisn|airdrop-system|enterprise|partnership|polarpro|usb|cn|eu|fpv|rtk|osmo|neo|avata|mavic|matrice|agras|flycart|phantom|inspire|flip|mini|air|rc|pro|max|hero|action|gps|gis|fpv|wifi|lte|4k|360|3d|2d|v1|v2|pro|dock)$/i;

const MENU_HANDLE_MAP = {
  "enterprise-expansion-deploy": "enterprise-drones",
  "spare-parts-deploy": "spare-parts",
  "service-support-deploy": "service-support",
  "b2b-enterprise-deploy": "b2b-enterprise",
  "enterprise-dr-nare": "enterprise-drones",
  "meny": "main-menu",
};

const MENU_TITLE_MAP = {
  "main-menu": "Main Menu",
  "footer": "Footer Menu",
  "customer-account-main-menu": "Customer Account",
  "enterprise-expansion-deploy": "Enterprise Drones",
  "enterprise-dr-nare": "Enterprise Drones",
  "spare-parts-deploy": "Spare Parts",
  "service-support-deploy": "Service & Support",
  "b2b-enterprise-deploy": "B2B Enterprise",
  "partnership": "Partnership",
};

const SWEDISH_TOKENS = SWEDISH_TOKEN_MAP.map(([sv]) => sv);

function loadJson(path) {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8"));
}

function segments(handle) {
  return String(handle || "").toLowerCase().split("-").filter(Boolean);
}

function segmentIsSwedish(seg) {
  if (!seg || ENGLISH_SEGMENTS.has(seg)) return false;
  if (ENGLISH_OK.test(seg)) return false;
  for (const [sv] of SWEDISH_TOKEN_MAP) if (seg === sv) return true;
  return SWEDISH_TOKENS.some((t) => seg === t || (t.length > 4 && seg.includes(t)));
}

function isSwedishHandle(handle) {
  if (!handle) return false;
  const segs = segments(handle);
  if (segs.some((s) => /[åäö]/.test(s))) return true;
  return segs.some(segmentIsSwedish);
}

function slugify(parts) {
  return parts.filter(Boolean).join("-").replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function proposeEnglishHandle(handle) {
  const original = String(handle || "").trim();
  if (!original) return original;
  if (MENU_HANDLE_MAP[original]) return MENU_HANDLE_MAP[original];
  if (!isSwedishHandle(original)) return original;

  const parts = segments(original);
  const translated = parts.map((p) => {
    if (ENGLISH_SEGMENTS.has(p) || ENGLISH_OK.test(p)) return p;
    for (const [sv, en] of SWEDISH_TOKEN_MAP) if (p === sv) return en;
    let out = p;
    for (const [sv, en] of [...SWEDISH_TOKEN_MAP].sort((a, b) => b[0].length - a[0].length)) {
      if (out.includes(sv)) out = out.split(sv).join(en);
    }
    return out.replace(/å/g, "a").replace(/ä/g, "a").replace(/ö/g, "o");
  });

  return slugify(translated) || original;
}

function csvEscape(v) {
  const s = String(v ?? "");
  return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
}

function csvRow(obj, cols) {
  return cols.map((c) => csvEscape(obj[c])).join(",");
}

function urlPath(type, handle, blogHandle) {
  if (type === "collection") return `/collections/${handle}`;
  if (type === "page") return `/pages/${handle}`;
  if (type === "product") return `/products/${handle}`;
  if (type === "blog") return `/blogs/${handle}`;
  if (type === "article") return `/blogs/${blogHandle}/${handle}`;
  if (type === "menu") return `/admin/menus/${handle}`;
  return `/${handle}`;
}

function parseUrl(url) {
  if (!url) return null;
  const s = String(url);
  for (const kind of ["collections", "pages", "products", "blogs"]) {
    const m = s.match(new RegExp(`/${kind}/([^/?#]+)`));
    if (m) {
      const h = decodeURIComponent(m[1]);
      if (kind === "blogs" && s.match(/\/blogs\/[^/]+\/[^/?#]+/)) {
        const am = s.match(/\/blogs\/([^/]+)\/([^/?#]+)/);
        return { type: "article", handle: decodeURIComponent(am[2]), blogHandle: decodeURIComponent(am[1]) };
      }
      return { type: kind.slice(0, -1) === "collection" ? "collection" : kind.slice(0, -1), handle: h, blogHandle: kind === "blogs" ? h : undefined };
    }
  }
  return null;
}

function walkMenuItems(items, menuHandle, out) {
  for (const it of items || []) {
    out.push({ menu_handle: menuHandle, title: it.title, url: it.url, type: it.type });
    walkMenuItems(it.items, menuHandle, out);
  }
}

function parseFingerprint(fp) {
  const links = [];
  const re = /([^|]+)\|HTTP\|([^:\[]+)/g;
  let m;
  while ((m = re.exec(fp || ""))) links.push({ title: m[1].trim(), url: m[2].trim() });
  return links;
}

function mdTable(rows, cols) {
  if (!rows.length) return "_None._\n";
  const header = `| ${cols.join(" | ")} |`;
  const sep = `| ${cols.map(() => "---").join(" | ")} |`;
  const body = rows.map((r) => `| ${cols.map((c) => String(r[c] ?? "").replace(/\|/g, "\\|")).join(" | ")} |`);
  return [header, sep, ...body].join("\n") + "\n";
}

function main() {
  const collectionsAudit = loadJson(join(ROOT, ".url-audit-collections.json"));
  const live = loadJson(join(ROOT, ".url-audit-live.json"));
  const menuAudit = loadJson(join(ROOT, ".menu-cleanup-audit.json"));
  const menuRecovery = loadJson(join(ROOT, ".url-audit-menu-recovery.json"));

  if (!collectionsAudit?.TARGET_COLLECTIONS || !live) {
    console.error("Missing audit JSON. Run collection audit + live GraphQL fetch first.");
    process.exit(1);
  }

  const mappings = [];
  const handleIndex = new Map();

  function addMapping(row) {
    if (row.current_handle === row.proposed_handle && row.current_url === row.new_url) return;
    const key = `${row.resource_type}:${row.current_handle}`;
    if (!handleIndex.has(key)) {
      handleIndex.set(key, mappings.length);
      mappings.push(row);
    }
  }

  // Collections
  for (const c of collectionsAudit.TARGET_COLLECTIONS) {
    const proposed = proposeEnglishHandle(c.handle);
    addMapping({
      resource_type: "collection",
      current_handle: c.handle,
      proposed_handle: proposed,
      current_url: urlPath("collection", c.handle),
      new_url: urlPath("collection", proposed),
      redirect_required: proposed !== c.handle ? "YES" : "NO",
      title: c.title,
      products_count: c.products_count ?? "",
      swedish_detected: isSwedishHandle(c.handle) ? "YES" : "NO",
      internal_references_impacted: "",
    });
  }

  // Pages
  for (const p of live.pages) {
    if (/actionking/i.test(p.handle) && !isSwedishHandle(p.handle)) continue;
    const proposed = proposeEnglishHandle(p.handle);
    addMapping({
      resource_type: "page",
      current_handle: p.handle,
      proposed_handle: proposed,
      current_url: urlPath("page", p.handle),
      new_url: urlPath("page", proposed),
      redirect_required: proposed !== p.handle ? "YES" : "NO",
      title: p.title,
      products_count: "",
      swedish_detected: isSwedishHandle(p.handle) ? "YES" : "NO",
      internal_references_impacted: "",
    });
  }

  // Blogs & articles
  for (const b of live.blogs) {
    const blogProposed = proposeEnglishHandle(b.handle);
    addMapping({
      resource_type: "blog",
      current_handle: b.handle,
      proposed_handle: blogProposed,
      current_url: urlPath("blog", b.handle),
      new_url: urlPath("blog", blogProposed),
      redirect_required: blogProposed !== b.handle ? "YES" : "NO",
      title: b.title,
      products_count: "",
      swedish_detected: isSwedishHandle(b.handle) ? "YES" : "NO",
      internal_references_impacted: "",
    });
    for (const a of b.articles) {
      const artProposed = proposeEnglishHandle(a.handle);
      addMapping({
        resource_type: "article",
        current_handle: `${b.handle}/${a.handle}`,
        proposed_handle: `${blogProposed}/${artProposed}`,
        current_url: urlPath("article", a.handle, b.handle),
        new_url: urlPath("article", artProposed, blogProposed),
        redirect_required: artProposed !== a.handle || blogProposed !== b.handle ? "YES" : "NO",
        title: a.title,
        products_count: "",
        swedish_detected: isSwedishHandle(a.handle) || isSwedishHandle(b.handle) ? "YES" : "NO",
        internal_references_impacted: "",
      });
    }
  }

  // Products (Swedish handles only)
  for (const p of live.products) {
    if (!isSwedishHandle(p.handle)) continue;
    const proposed = proposeEnglishHandle(p.handle);
    if (proposed === p.handle) continue;
    addMapping({
      resource_type: "product",
      current_handle: p.handle,
      proposed_handle: proposed,
      current_url: urlPath("product", p.handle),
      new_url: urlPath("product", proposed),
      redirect_required: "YES",
      title: p.title,
      products_count: "",
      swedish_detected: "YES",
      internal_references_impacted: "",
    });
  }

  // Production menu handles (navigation)
  const prodMenus = [
    "main-menu", "footer", "customer-account-main-menu", "partnership",
    "enterprise-expansion-deploy", "spare-parts-deploy", "service-support-deploy", "b2b-enterprise-deploy",
    "enterprise-dr-nare",
  ];
  for (const h of prodMenus) {
    const inv = menuAudit?.inventory?.find((m) => m.handle === h);
    const proposed = MENU_HANDLE_MAP[h] || h;
    const title = inv?.title || h;
    addMapping({
      resource_type: "menu",
      current_handle: h,
      proposed_handle: proposed,
      current_url: `(menu handle: ${h})`,
      new_url: `(menu handle: ${proposed})`,
      redirect_required: proposed !== h ? "NAV_ONLY" : "NO",
      title: MENU_TITLE_MAP[h] || title,
      products_count: inv?.item_count ?? "",
      swedish_detected: /[åäö]|huvudmeny|sidfots|drönare|reservdelar/i.test(title) ? "YES" : "NO",
      internal_references_impacted: inv?.referenced_by_theme ? "theme: header-group.json" : "",
    });
  }

  // Build internal reference index from menus
  const menuLinks = [];
  for (const m of live.menus || []) walkMenuItems(m.items, m.handle, menuLinks);
  for (const row of menuAudit?.inventory || []) {
    if (row.item_count > 0 && row.structure_fingerprint) {
      for (const l of parseFingerprint(row.structure_fingerprint)) {
        menuLinks.push({ menu_handle: row.handle, title: l.title, url: l.url, type: "HTTP" });
      }
    }
  }
  for (const m of menuRecovery?.menus || []) {
    for (const l of [...(m.removed_links || []), ...(m.deferred_links || [])]) {
      menuLinks.push({ menu_handle: m.menu_handle, title: l.title, url: l.url, type: l.type });
    }
  }

  const refCounts = new Map();
  for (const link of menuLinks) {
    const parsed = parseUrl(link.url);
    if (!parsed) continue;
    const lookupHandle = parsed.type === "article" ? `${parsed.blogHandle}/${parsed.handle}` : parsed.handle;
    const keys = [
      `${parsed.type === "article" ? "article" : parsed.type}:${lookupHandle}`,
      `collection:${parsed.handle}`,
      `page:${parsed.handle}`,
      `product:${parsed.handle}`,
    ];
    for (const k of keys) {
      if (!refCounts.has(k)) refCounts.set(k, []);
      const arr = refCounts.get(k);
      const label = `${link.menu_handle} → ${link.title}`;
      if (!arr.includes(label)) arr.push(label);
    }
  }

  for (const m of mappings) {
    const keys = [m.resource_type + ":" + m.current_handle];
    if (m.resource_type === "collection" || m.resource_type === "page" || m.resource_type === "product") {
      keys.push(m.resource_type + ":" + m.current_handle.split("/").pop());
    }
    const refs = new Set();
    for (const k of keys) for (const r of refCounts.get(k) || []) refs.add(r);
    m.internal_references_impacted = [...refs].slice(0, 8).join("; ") + (refs.size > 8 ? ` (+${refs.size - 8} more)` : "");
  }

  const redirects = mappings
    .filter((m) => m.redirect_required === "YES")
    .map((m) => ({
      from_path: m.current_url,
      to_path: m.new_url,
      resource_type: m.resource_type,
      current_handle: m.current_handle,
      proposed_handle: m.proposed_handle,
      redirect_type: "301",
      preserve_seo: "YES",
      internal_refs: m.internal_references_impacted,
    }));

  // Legacy /en/ prefix redirects
  const legacyRedirects = [];
  for (const m of mappings.filter((x) => x.redirect_required === "YES" && x.resource_type !== "menu")) {
    legacyRedirects.push({
      from_path: `/en${m.current_url}`,
      to_path: m.new_url,
      resource_type: m.resource_type,
      current_handle: m.current_handle,
      proposed_handle: m.proposed_handle,
      redirect_type: "301",
      preserve_seo: "YES",
      internal_refs: "legacy /en/ prefix",
    });
  }

  const allRedirects = [...redirects, ...legacyRedirects];

  const collMaps = mappings.filter((m) => m.resource_type === "collection");
  const pageMaps = mappings.filter((m) => m.resource_type === "page" && m.redirect_required === "YES");
  const blogMaps = mappings.filter((m) => m.resource_type === "blog" || m.resource_type === "article");
  const productMaps = mappings.filter((m) => m.resource_type === "product");
  const menuMaps = mappings.filter((m) => m.resource_type === "menu");
  const withRefs = mappings.filter((m) => m.internal_references_impacted);

  const handleCols = [
    "resource_type", "current_handle", "proposed_handle", "current_url", "new_url",
    "redirect_required", "swedish_detected", "title", "products_count", "internal_references_impacted",
  ];
  writeFileSync(HANDLE_CSV, [csvRow(Object.fromEntries(handleCols.map((c) => [c, c])), handleCols), ...mappings.map((m) => csvRow(m, handleCols))].join("\n") + "\n");

  const redirCols = ["from_path", "to_path", "resource_type", "current_handle", "proposed_handle", "redirect_type", "preserve_seo", "internal_refs"];
  writeFileSync(REDIRECT_CSV, [csvRow(Object.fromEntries(redirCols.map((c) => [c, c])), redirCols), ...allRedirects.map((r) => csvRow(r, redirCols))].join("\n") + "\n");

  const plan = [
    "# ENGLISH_URL_MIGRATION_PLAN",
    "",
    "**Store:** EuroDroneParts (`ya1xhg-x6.myshopify.com`)",
    "**Status:** PRE-LAUNCH — read-only analysis, **no store modifications**",
    `**Generated:** ${new Date().toISOString()}`,
    "**Canonical language:** English",
    "**Domains:** eudroneparts.com · eudroneparts.de · eudroneparts.dk · future EU markets",
    "",
    "## Executive summary",
    "",
    "| Resource | Live count | Handle changes | 301 redirects | Menu/nav refs |",
    "|---|---:|---:|---:|---:|",
    `| Collections | ${collectionsAudit.TARGET_COLLECTIONS.length} | ${collMaps.filter((m) => m.redirect_required === "YES").length} | ${collMaps.filter((m) => m.redirect_required === "YES").length} | ${collMaps.filter((m) => m.internal_references_impacted).length} |`,
    `| Pages | ${live.pages.length} | ${pageMaps.length} | ${pageMaps.length} | ${pageMaps.filter((m) => m.internal_references_impacted).length} |`,
    `| Blogs / articles | ${live.blogs.length} / ${live.blogs.reduce((n, b) => n + b.articles.length, 0)} | ${blogMaps.filter((m) => m.redirect_required === "YES").length} | ${blogMaps.filter((m) => m.redirect_required === "YES").length} | ${blogMaps.filter((m) => m.internal_references_impacted).length} |`,
    `| Products (all draft) | ${live.products.length} | ${productMaps.length} | ${productMaps.length} | 0 |`,
    `| Production menus | 8 | ${menuMaps.filter((m) => m.redirect_required === "NAV_ONLY").length} handle renames | N/A | theme + deploy menus |`,
    `| **Total redirect rules** | — | — | **${allRedirects.length}** | **${withRefs.length}** mapped resources with menu refs |`,
    "",
    "### Artifacts",
    "",
    "- `ENGLISH_HANDLE_MAPPING.csv` — full handle mapping with internal reference impact",
    "- `REDIRECT_MAPPING.csv` — complete 301 redirect map (includes `/en/` legacy prefix rules)",
    "",
    "### Preservation guarantees (execution phase — not performed here)",
    "",
    "| Requirement | Approach |",
    "|---|---|",
    "| Product assignments | Shopify `collectionUpdate` / handle rename retains product memberships via same collection ID |",
    "| Metafields | Handle rename does not delete metafields; keyed by resource GID |",
    "| Translations | Shopify Markets + Translate & Adapt — translate titles/body, **keep English handles** |",
    "| SEO equity | 301 redirects per `REDIRECT_MAPPING.csv`; canonical on `eudroneparts.com` |",
    "| Internal links | Update 8 production menus + theme after handle migration |",
    "",
    "---",
    "",
    "## SECTION 1 — Collections",
    "",
    `${collMaps.length} of ${collectionsAudit.TARGET_COLLECTIONS.length} live collections require handle changes.`,
    "",
    mdTable(
      collMaps.filter((m) => m.redirect_required === "YES").slice(0, 80),
      ["current_url", "new_url", "redirect_required", "current_handle", "proposed_handle", "internal_references_impacted"],
    ),
    collMaps.filter((m) => m.redirect_required === "YES").length > 80
      ? `\n_Full list in ENGLISH_HANDLE_MAPPING.csv (${collMaps.filter((m) => m.redirect_required === "YES").length} rows)._\n`
      : "",
    "",
    "---",
    "",
    "## SECTION 2 — Pages",
    "",
    mdTable(
      pageMaps,
      ["current_url", "new_url", "redirect_required", "current_handle", "proposed_handle", "internal_references_impacted"],
    ),
    "",
    "### Legacy ActionKing pages (exclude from EDP — no redirect to production)",
    "",
    mdTable(
      live.pages.filter((p) => /actionking/i.test(p.handle)).map((p) => ({
        current_url: urlPath("page", p.handle),
        new_url: "(exclude)",
        redirect_required: "EXCLUDE",
        current_handle: p.handle,
        proposed_handle: "—",
        internal_references_impacted: "legacy",
      })),
      ["current_url", "new_url", "redirect_required", "current_handle", "proposed_handle", "internal_references_impacted"],
    ),
    "",
    "---",
    "",
    "## SECTION 3 — Blogs",
    "",
    mdTable(
      blogMaps.filter((m) => m.redirect_required === "YES"),
      ["current_url", "new_url", "redirect_required", "current_handle", "proposed_handle", "internal_references_impacted"],
    ),
    "",
    "---",
    "",
    "## SECTION 4 — Products",
    "",
    `${productMaps.length} products with Swedish/mixed handles (all **DRAFT**). Full list in CSV.`,
    "",
    mdTable(
      productMaps.slice(0, 40),
      ["current_url", "new_url", "current_handle", "proposed_handle"],
    ),
    productMaps.length > 40 ? `\n_…and ${productMaps.length - 40} more in ENGLISH_HANDLE_MAPPING.csv_\n` : "",
    "",
    "---",
    "",
    "## SECTION 5 — Menus & navigation",
    "",
    "### Production menu handle / title mapping",
    "",
    mdTable(
      menuMaps.map((m) => ({
        current_handle: m.current_handle,
        proposed_handle: m.proposed_handle,
        current_title: m.title,
        proposed_title: MENU_TITLE_MAP[m.current_handle] || m.title,
        items: m.products_count,
        theme_linked: m.internal_references_impacted.includes("theme") ? "YES" : "NO",
        redirect_required: m.redirect_required,
      })),
      ["current_handle", "proposed_handle", "current_title", "proposed_title", "items", "theme_linked", "redirect_required"],
    ),
    "",
    "### High-traffic menu URLs requiring update after collection/page renames",
    "",
    mdTable(
      withRefs
        .filter((m) => m.resource_type !== "product" && m.internal_references_impacted)
        .sort((a, b) => (b.internal_references_impacted?.length || 0) - (a.internal_references_impacted?.length || 0))
        .slice(0, 50),
      ["resource_type", "current_url", "new_url", "internal_references_impacted"],
    ),
    "",
    "### Menu cleanup context (370 menus on store)",
    "",
    "Only `main-menu` is theme-linked. PR49 deploy menus (`*-deploy`) hold production IA but are orphans. See `MENU_CLEANUP_FINAL_REPORT.md`.",
    "",
    "---",
    "",
    "## SECTION 6 — Redirect plan",
    "",
    `**${allRedirects.length}** redirect rules (${redirects.length} primary + ${legacyRedirects.length} legacy \`/en/\` prefix).`,
    "",
    "### Example mappings",
    "",
    "| Swedish | English |",
    "|---|---|",
    "| `reservdelar` | `spare-parts` |",
    "| `tillbehor` | `accessories` |",
    "| `dronare` | `drones` |",
    "| `service-och-support` | `service-support` |",
    "| `offertforfragan` | `request-a-quote` |",
    "| `foretagskonto` | `business-account` |",
    "| `nyheter` (blog) | `news` |",
    "",
    "### Locale rules (Shopify Markets)",
    "",
    "| Pattern | Redirect to |",
    "|---|---|",
    "| `/collections/{sv}` | `/collections/{en}` |",
    "| `/pages/{sv}` | `/pages/{en}` |",
    "| `/products/{sv}` | `/products/{en}` |",
    "| `/blogs/nyheter/{sv}` | `/blogs/news/{en}` |",
    "| `/en/*` | drop prefix → English canonical path |",
    "",
    "Full redirect map: **REDIRECT_MAPPING.csv**",
    "",
    "---",
    "",
    "## SECTION 7 — Shopify Markets readiness",
    "",
    "1. English handles on `eudroneparts.com` as global canonical.",
    "2. Market domains (`.de`, `.dk`, `.fi`, `.fr`) use Shopify Markets with translated content, **same handles**.",
    "3. hreflang per market; sitemap per domain after migration.",
    "4. Execute handle renames while products are **DRAFT** (9,389 products, 0 published at audit).",
    "5. Run menu cleanup (360 deletions) + wire 8 production menus before go-live.",
    "",
    "---",
    "",
    "## Data sources",
    "",
    "- `collection_reconciliation_audit` — 204 live collections",
    "- `test-integration` Shopify GraphQL — pages, blogs, products, menu trees",
    "- `menu-cleanup-pass` — 370 menu inventory + structure fingerprints",
    "- `menu_recovery_fix` dry-run — pruned legacy links",
    "",
    "## Guardrails (this analysis)",
    "",
    "- **No deployment**",
    "- **No store modifications**",
    "- **No redirects created**",
    "- **No publishing**",
    "",
  ];

  writeFileSync(PLAN, plan.join("\n"), "utf8");

  console.log(`Wrote ${PLAN}`);
  console.log(`Wrote ${HANDLE_CSV} (${mappings.length} rows)`);
  console.log(`Wrote ${REDIRECT_CSV} (${allRedirects.length} rows)`);
  console.log(
    `collections=${collMaps.filter((m) => m.redirect_required === "YES").length} pages=${pageMaps.length} products=${productMaps.length} redirects=${allRedirects.length}`,
  );
}

main();
