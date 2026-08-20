#!/usr/bin/env node
/**
 * Read-only generator for ENGLISH_URL_MIGRATION_PLAN.md
 * Uses live Shopify audit JSON captured from shopify-cloner-worker + test-integration.
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "ENGLISH_URL_MIGRATION_PLAN.md");

const SWEDISH_TOKEN_MAP = [
  ["tillbehor", "accessories"],
  ["tillbehör", "accessories"],
  ["reservdelar", "spare-parts"],
  ["dronare", "drones"],
  ["dronar", "drone"],
  ["drönare", "drones"],
  ["drönar", "drone"],
  ["propellrar", "propellers"],
  ["propeller", "propellers"],
  ["fjarrkontroller", "remote-controls"],
  ["fjärrkontroller", "remote-controls"],
  ["fjarrkontroll", "remote-control"],
  ["belysning", "lighting"],
  ["vaskor", "bags"],
  ["vaska", "bag"],
  ["väskor", "bags"],
  ["väska", "bag"],
  ["kablar", "cables"],
  ["kabel", "cable"],
  ["rengoringsprodukter", "cleaning-products"],
  ["rengöringsprodukter", "cleaning-products"],
  ["reparation", "repair"],
  ["reparera", "repair"],
  ["precisionsverktyg", "precision-tools"],
  ["skruvmejsel", "screwdriver"],
  ["bandverktyg", "pliers"],
  ["bändverktyg", "pliers"],
  ["pincetter", "tweezers"],
  ["tanger", "pliers"],
  ["tang", "pliers"],
  ["kapor", "covers"],
  ["kåpor", "covers"],
  ["landningsstall", "landing-gear"],
  ["landning", "landing"],
  ["skydd", "protection"],
  ["filter", "filters"],
  ["minneskort", "memory-cards"],
  ["lagring", "storage"],
  ["jordbruksdronare", "agricultural-drones"],
  ["inspektionsdronare", "inspection-drones"],
  ["kartlaggning", "mapping"],
  ["kartläggning", "mapping"],
  ["matdronare", "survey-drones"],
  ["mätdronare", "survey-drones"],
  ["skogsbruksdronare", "forestry-drones"],
  ["lastdronare", "cargo-drones"],
  ["last-och-transportdronare", "cargo-transport-drones"],
  ["transportdronare", "transport-drones"],
  ["alla-produkter", "all-products"],
  ["alla-konsumentdronare", "all-consumer-drones"],
  ["konsumentdronare", "consumer-drones"],
  ["branschlosningar", "industry-solutions"],
  ["gimbal", "gimbal"],
  ["motorer", "motors"],
  ["varmekamera", "thermal-camera"],
  ["varumarken", "brands"],
  ["kopvillkor", "terms-of-sale"],
  ["reklamation", "claims"],
  ["aterkop", "buyback"],
  ["samarbeta", "partner"],
  ["basta", "best"],
  ["myggskydd", "mosquito-repellent"],
  ["ljud", "audio"],
  ["kablar", "cables"],
  ["faste", "mount"],
  ["stabilisering", "stabilization"],
  ["armar", "arms"],
  ["antenner", "antennas"],
  ["motorer", "motors"],
  ["kameror", "cameras"],
  ["skal", "shell"],
  ["landningsstall", "landing-gear"],
  ["hogtalarsystem", "speaker-systems"],
  ["lyftsystem", "lifting-systems"],
  ["friluftsliv", "outdoor"],
  ["varmekamera", "thermal-camera"],
  ["branschlosningar", "industry-solutions"],
  ["branschlösningar", "industry-solutions"],
  ["matdronare", "survey-drones"],
  ["lastdronare", "cargo-drones"],
  ["inspektionsdronare", "inspection-drones"],
  ["jordbruksdronare", "agricultural-drones"],
  ["skogsbruksdronare", "forestry-drones"],
  ["kartlaggnings", "mapping"],
  ["kameratillbehor", "camera-accessories"],
  ["dronarutrustning", "drone-equipment"],
  ["tillbehorskablar", "accessory-cables"],
  ["kameraskydd", "camera-protection"],
  ["actionking", "actionking"],
  ["laddningsbara", "rechargeable"],
  ["uppladdnings", "rechargeable"],
  ["tradlos", "wireless"],
  ["tradlös", "wireless"],
  ["mikrofon", "microphone"],
  ["ficklampa", "flashlight"],
  ["spela-in", "record-audio"],
  ["ministativ", "mini-tripod"],
  ["selfiepinne", "selfie-stick"],
  ["silikonskal", "silicone-case"],
  ["silikon", "silicone"],
  ["skyddande", "protective"],
  ["forvaring", "storage"],
  ["forvarings", "storage"],
  ["laddare", "charger"],
  ["batteri", "battery"],
  ["regler", "regulations"],
  ["nyheter", "news"],
  ["sportkamera", "action-camera"],
  ["linsskydd", "lens-protector"],
  ["metallbur", "metal-cage"],
  ["oversikt", "overview"],
  ["varme", "thermal"],
  ["elektronik", "electronics"],
  ["flight-components", "flight-components"],
  ["cases", "cases"],
  ["legacy", "legacy"],
  ["guider", "guides"],
  ["foretagskonto", "business-account"],
  ["offertforfragan", "request-a-quote"],
  ["kontakt", "contact"],
  ["om-oss", "about-us"],
  ["integritet", "privacy"],
  ["retur", "returns"],
  ["kop", "buy"],
  ["faste", "mount"],
  ["fäste", "mount"],
  ["stabilisering", "stabilization"],
  ["hoverair", "hoverair"],
  ["nitecore", "nitecore"],
  ["goulet", "goulet"],
  ["gunter", "gunter"],
  ["andreasson", "andreasson"],
  ["ultracyklist", "ultra-cyclist"],
  ["feedback", "feedback"],
  ["cookies", "cookies"],
  ["faq", "faq"],
  ["student", "student"],
  ["leasing", "leasing"],
  ["financing", "financing"],
  ["training", "training"],
  ["warranty", "warranty"],
  ["calibration", "calibration"],
  ["troubleshooting", "troubleshooting"],
  ["repair", "repair"],
  ["support", "support"],
  ["enterprise", "enterprise"],
  ["industry", "industry"],
  ["wind-power", "wind-power"],
  ["solar-parks", "solar-parks"],
  ["power-grid", "power-grid"],
  ["forestry", "forestry"],
  ["agriculture", "agriculture"],
  ["mapping", "mapping"],
  ["construction", "construction"],
  ["security-rescue", "security-rescue"],
  ["transport-logistics", "transport-logistics"],
  ["energi-infrastruktur", "energy-infrastructure"],
  ["transport-logistik", "transport-logistics"],
  ["hogtalarsystem", "speaker-systems"],
  ["högtalarsystem", "speaker-systems"],
  ["lyftsystem", "lifting-systems"],
  ["sensorer", "sensors"],
  ["service-dronare", "service-drones"],
  ["foretag", "business"],
  ["företag", "business"],
  ["foretagskonto", "business-account"],
  ["företagskonto", "business-account"],
  ["offertforfragan", "request-a-quote"],
  ["offertförfrågan", "request-a-quote"],
  ["service-och-support", "service-support"],
  ["kontakt", "contact"],
  ["om-oss", "about-us"],
  ["integritetspolicy", "privacy-policy"],
  ["kopvillkor", "terms-of-sale"],
  ["kopvillkor", "terms-of-sale"],
  ["returpolicy", "return-policy"],
  ["leverans", "shipping"],
  ["frakt", "shipping"],
  ["guider", "guides"],
  ["raddningstjanst", "emergency-services"],
  ["räddningstjänst", "emergency-services"],
  ["gis-kartlaggning", "gis-mapping"],
  ["friluftsliv", "outdoor"],
  ["mobiltillbehor", "mobile-accessories"],
  ["kameror", "cameras"],
  ["actionkameror", "action-cameras"],
  ["vandring", "hiking"],
  ["outdoor", "outdoor"],
  ["utrustning", "equipment"],
  ["ansok", "apply"],
  ["ansök", "apply"],
  ["partnership", "partnership"],
  ["enterprise", "enterprise"],
  ["serien", "series"],
  ["serie", "series"],
  ["dronartillbehor", "drone-accessories"],
  ["dronartillbehör", "drone-accessories"],
  ["fasten", "mounts"],
  ["fästen", "mounts"],
  ["adaptrar", "adapters"],
  ["multiverktyg", "multi-tools"],
  ["ringlampa", "ring-light"],
  ["vattentatt", "waterproof"],
  ["vattentätt", "waterproof"],
  ["kameratillbehor", "camera-accessories"],
  ["kameratillbehör", "camera-accessories"],
  ["dronarutrustning", "drone-equipment"],
  ["omfattande-sortiment", "full-range"],
  ["avancerad-dronarteknik", "advanced-drone-technology"],
  ["hogkvalitativa", "high-quality"],
  ["professionella", "professional"],
  ["konsumentdronare", "consumer-drones"],
  ["last-och-transport", "cargo-transport"],
  ["och", "and"],
  ["for", "for"],
  ["till", "for"],
  ["med", "with"],
  ["och", "and"],
  ["ovriga", "other"],
  ["övriga", "other"],
  ["meny", "menu"],
  ["huvudmeny", "main-menu"],
  ["sidfotsmeny", "footer-menu"],
];

const SWEDISH_TOKENS = [
  "tillbehor", "tillbehör", "tillbehors", "reservdelar", "dronare", "dronar", "drönare", "drönar",
  "propellrar", "propeller", "fjarrkontroller", "fjärrkontroller", "fjarrkontroll", "belysning",
  "vaskor", "vaska", "väskor", "väska", "kablar", "kabel", "rengoringsprodukter", "rengorings",
  "reparation", "reparera", "precisionsverktyg", "skruvmejsel", "bandverktyg", "bändverktyg",
  "pincetter", "tanger", "tang", "kapor", "kåpor", "landningsstall", "landning", "landnings",
  "skydd", "kameraskydd", "filter", "minneskort", "lagring", "jordbruksdronare", "jordbruks",
  "inspektionsdronare", "inspektions", "kartlaggning", "kartläggning", "matdronare", "mätdronare",
  "skogsbruksdronare", "skogsbruks", "lastdronare", "transportdronare", "alla-produkter",
  "energi-infrastruktur", "hogtalarsystem", "högtalarsystem", "lyftsystem", "sensorer",
  "foretag", "företag", "foretagskonto", "företagskonto", "offertforfragan", "offertförfrågan",
  "service-och-support", "raddningstjanst", "räddningstjänst", "gis-kartlaggning",
  "mobiltillbehor", "actionkameror", "vandring", "utrustning", "ansok", "ansök",
  "dronartillbehor", "fasten", "fästen", "adaptrar", "multiverktyg", "ringlampa",
  "vattentatt", "vattentätt", "kameratillbehor", "omfattande", "avancerad", "konsument",
  "friluftsliv", "ovriga", "övriga", "serien", "meny", "huvudmeny", "sidfotsmeny",
  "varumarken", "kopvillkor", "reklamation", "aterkop", "samarbeta", "basta", "myggskydd",
  "laddningsbara", "uppladdnings", "tradlos", "trådlös", "mikrofon", "ficklampa", "spela-in",
  "ministativ", "selfiepinne", "silikonskal", "silikon", "skyddande", "forvaring", "förvaring",
  "laddare", "batteri", "regler", "nyheter", "sportkamera", "linsskydd", "metallbur",
  "oversikt", "översikt", "varme", "värme", "armar", "antenner", "motorer", "kameror",
  "skal", "guider", "kontakt", "om-oss", "integritet", "retur", "faste", "fäste",
  "stabilisering", "branschlosningar", "branschlösningar", "varor", "kop", "köp",
  "antal", "bäst", "bast", "vilken", "är", "ar", "med", "och", "till", "for", "för",
  "arm", "propell", "last", "mat", "inspektion", "jordbruk", "skogsbruk", "kartlaggning",
  "hogtalare", "högtalare", "lyft", "varmekamera", "fjarrkontrollstillbehor", "elektronik",
  "reparations", "rengoring", "rengöring", "tillbehor", "dronartillbehor", "tillbehorskablar",
];

const SWEDISH_REGEX = new RegExp(
  `(${SWEDISH_TOKENS.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")}|[åäö])`,
  "i",
);

const ENGLISH_OK =
  /^(dji|gopro|insta360|polarpro|pgytech|sunnylife|master-airscrew|brdrc|amagisn|airdrop-system|enterprise|partnership|polarpro|usb|cn|eu|fpv|rtk|osmo|neo|avata|mavic|matrice|agras|flycart|phantom|inspire|flip|mini|air|rc|pro|max|hero|action|gps|gis|fpv|wifi|lte|4k|360|3d|2d|v1|v2|pro)$/i;

function loadJson(path) {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8"));
}

function slugify(parts) {
  return parts
    .filter(Boolean)
    .join("-")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function translateSegment(seg) {
  let s = seg.toLowerCase();
  for (const [sv, en] of SWEDISH_TOKEN_MAP) {
    if (s === sv) return en;
    if (s.includes(sv)) s = s.split(sv).join(en);
  }
  return s.replace(/å/g, "a").replace(/ä/g, "a").replace(/ö/g, "o");
}

function proposeEnglishHandle(handle) {
  const original = String(handle || "").trim();
  if (!original) return original;
  if (!isSwedishHandle(original)) return original;

  const parts = segments(original);
  const translated = parts.map((p) => {
    if (ENGLISH_SEGMENTS.has(p) || ENGLISH_OK.test(p)) return p;
    for (const [sv, en] of SWEDISH_TOKEN_MAP) {
      if (p === sv) return en;
    }
    let out = p;
    for (const [sv, en] of [...SWEDISH_TOKEN_MAP].sort((a, b) => b[0].length - a[0].length)) {
      if (out.includes(sv)) out = out.split(sv).join(en);
    }
    return out.replace(/å/g, "a").replace(/ä/g, "a").replace(/ö/g, "o");
  });

  let proposed = slugify(translated);
  proposed = proposed
    .replace(/-for-/g, "-")
    .replace(/-and-/g, "-")
    .replace(/-with-/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return proposed || original;
}

const ENGLISH_SEGMENTS = new Set([
  "accessories", "spare", "parts", "drones", "drone", "series", "batteries", "battery", "propellers",
  "propeller", "filters", "filter", "lighting", "remote", "controls", "control", "protection", "storage",
  "memory", "cards", "enterprise", "professional", "inspection", "agricultural", "forestry", "mapping",
  "survey", "cargo", "transport", "logistics", "energy", "infrastructure", "sensors", "speaker", "speakers",
  "lifting", "systems", "system", "mounts", "adapters", "adapter", "cameras", "camera", "cables", "cable",
  "cleaning", "products", "repair", "precision", "tools", "quiet", "other", "with", "for", "and", "the",
  "all", "products", "air", "mini", "mavic", "matrice", "agras", "flycart", "phantom", "inspire", "flip",
  "neo", "avata", "fpv", "rtk", "gimbal", "arms", "antennas", "motors", "shell", "bags", "cases", "bag",
  "case", "covers", "cover", "landings", "landing", "gear", "electronics", "components", "flight",
  "thermal", "waterproof", "industry", "solutions", "guides", "news", "contact", "support", "service",
  "request", "quote", "business", "account", "training", "partner", "program", "warranty", "repair",
  "calibration", "troubleshooting", "firmware", "update", "leasing", "financing", "agreement", "dji",
  "gopro", "insta360", "polarpro", "pgytech", "sunnylife", "master", "airscrew", "brdrc", "amagisn",
  "airdrop", "hoverair", "nitecore", "polarpro", "usb", "faq", "feedback", "cookies", "privacy", "terms",
  "sale", "returns", "claims", "about", "student", "tripod", "flashlight", "audio", "brands", "mount",
  "stabilization", "legacy", "quiet", "comprehensive", "range", "advanced", "technology", "full",
]);

function segments(handle) {
  return String(handle || "")
    .toLowerCase()
    .split("-")
    .filter(Boolean);
}

function segmentIsSwedish(seg) {
  if (!seg || ENGLISH_SEGMENTS.has(seg)) return false;
  if (/^[a-z0-9]+$/i.test(seg) && ENGLISH_OK.test(seg)) return false;
  for (const [sv] of SWEDISH_TOKEN_MAP) {
    if (seg === sv) return true;
  }
  return SWEDISH_TOKENS.some((t) => seg === t || seg.includes(t));
}

function isSwedishHandle(handle) {
  if (!handle) return false;
  const segs = segments(handle);
  if (segs.some((s) => /[åäö]/.test(s))) return true;
  return segs.some(segmentIsSwedish);
}

function mdTable(rows, cols) {
  if (!rows.length) return "_None identified on live target._\n";
  const header = `| ${cols.join(" | ")} |`;
  const sep = `| ${cols.map(() => "---").join(" | ")} |`;
  const body = rows.map((r) => `| ${cols.map((c) => String(r[c] ?? "").replace(/\|/g, "\\|")).join(" | ")} |`);
  return [header, sep, ...body].join("\n") + "\n";
}

function flattenMenuItems(items, menuHandle, out = []) {
  for (const it of items || []) {
    out.push({
      menu_handle: menuHandle,
      title: it.title,
      type: it.type,
      url: it.url,
    });
    flattenMenuItems(it.items, menuHandle, out);
  }
  return out;
}

function extractHandleFromUrl(url, kind) {
  if (!url) return null;
  const m = String(url).match(new RegExp(`/${kind}/([^/?#]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

async function main() {
  const collectionsAudit = loadJson(join(ROOT, ".url-audit-collections.json"));
  const pagesResp = loadJson(join(ROOT, ".url-audit-pages.json"));
  const blogsResp = loadJson(join(ROOT, ".url-audit-blogs.json"));
  const productsAll = loadJson(join(ROOT, ".url-audit-products-all.json"));
  const menuRecovery = loadJson(join(ROOT, ".url-audit-menu-recovery.json"));
  const keyMenusResp = loadJson(join(ROOT, ".url-audit-key-menus.json"));
  const migrationAudit = loadJson(join(ROOT, ".url-audit-migration.json"));

  const targetCollections = collectionsAudit?.TARGET_COLLECTIONS || [];
  const livePages = pagesResp?.data?.pages?.nodes || [];
  const liveBlogs = blogsResp?.data?.blogs?.nodes || [];
  const liveProducts = productsAll?.all || productsAll?.swedish || [];
  const swedishProductList = productsAll?.swedish || liveProducts.filter((p) => isSwedishHandle(p.handle));

  const keyMenus = keyMenusResp?.success ? keyMenusResp.data?.menus?.nodes || [] : [];
  const menuLinks = [];
  for (const m of keyMenus) menuLinks.push(...flattenMenuItems(m.items, m.handle));

  const migrationMenus = menuRecovery?.menus || [];

  const collectionRows = targetCollections
    .map((c) => ({
      current_handle: c.handle,
      proposed_handle: proposeEnglishHandle(c.handle),
      title: c.title,
      products: c.products_count ?? "—",
      kind: c.kind || "—",
    }))
    .filter((r) => r.current_handle !== r.proposed_handle)
    .sort((a, b) => a.current_handle.localeCompare(b.current_handle));

  const pageRows = livePages
    .filter((p) => !/actionking/i.test(p.handle))
    .map((p) => ({
      current_handle: p.handle,
      proposed_handle: proposeEnglishHandle(p.handle),
      title: p.title,
      published: p.isPublished ? "yes" : "no",
    }))
    .filter((r) => r.current_handle !== r.proposed_handle)
    .sort((a, b) => a.current_handle.localeCompare(b.current_handle));

  const blogRows = [];
  for (const b of liveBlogs) {
    const blogProposed = proposeEnglishHandle(b.handle);
    if (blogProposed !== b.handle) {
      blogRows.push({
        resource: "blog",
        current_handle: b.handle,
        proposed_handle: blogProposed,
        title: b.title,
      });
    }
    for (const a of b.articles?.nodes || []) {
      const articleProposed = proposeEnglishHandle(a.handle);
      if (articleProposed === a.handle) continue;
      blogRows.push({
        resource: "article",
        current_handle: `${b.handle}/${a.handle}`,
        proposed_handle: `${blogProposed}/${articleProposed}`,
        title: a.title,
      });
    }
  }

  const productRows = swedishProductList
    .map((p) => ({
      current_handle: p.handle,
      proposed_handle: proposeEnglishHandle(p.handle),
      title: p.title,
      status: p.status,
    }))
    .filter((r) => r.current_handle !== r.proposed_handle)
    .sort((a, b) => a.current_handle.localeCompare(b.current_handle));

  const menuLinkRows = [];
  const seenUrls = new Set();
  for (const link of menuLinks) {
    if (!link.url || seenUrls.has(link.url)) continue;
    seenUrls.add(link.url);
    const coll = extractHandleFromUrl(link.url, "collections");
    const page = extractHandleFromUrl(link.url, "pages");
    const blog = extractHandleFromUrl(link.url, "blogs");
    const handle = coll || page || blog;
    const swedish =
      (handle && isSwedishHandle(handle)) ||
      /\/en\//.test(link.url) ||
      /actionking/i.test(link.url) ||
      /[åäö]/i.test(link.title || "");
    if (!swedish && !coll && !page && !blog) continue;
    menuLinkRows.push({
      menu: link.menu_handle,
      label: link.title,
      current_url: link.url,
      proposed_url: coll
        ? `/collections/${proposeEnglishHandle(coll)}`
        : page
          ? `/pages/${proposeEnglishHandle(page)}`
          : blog
            ? link.url.replace(/\/blogs\/[^/]+/, `/blogs/${proposeEnglishHandle(blog)}`)
            : link.url,
      type: link.type,
      notes: /actionking/i.test(link.url) ? "legacy ActionKing — remove or remap" : "",
    });
  }

  for (const m of migrationMenus) {
    for (const r of [...(m.removed_links || []), ...(m.deferred_links || [])]) {
      if (!r.url || seenUrls.has(`mig:${r.url}`)) continue;
      seenUrls.add(`mig:${r.url}`);
      menuLinkRows.push({
        menu: m.menu_handle,
        label: r.title,
        current_url: r.url,
        proposed_url: "(remap after English URL migration)",
        type: r.type,
        notes: r.reason || "migration pruned",
      });
    }
  }

  const redirectRows = [
    ...collectionRows.map((r) => ({
      from: `/collections/${r.current_handle}`,
      to: `/collections/${r.proposed_handle}`,
      type: "collection",
    })),
    ...pageRows.map((r) => ({
      from: `/pages/${r.current_handle}`,
      to: `/pages/${r.proposed_handle}`,
      type: "page",
    })),
    ...blogRows
      .filter((r) => r.resource === "blog")
      .map((r) => ({
        from: `/blogs/${r.current_handle}`,
        to: `/blogs/${r.proposed_handle}`,
        type: "blog",
      })),
    ...productRows.map((r) => ({
      from: `/products/${r.current_handle}`,
      to: `/products/${r.proposed_handle}`,
      type: "product",
    })),
  ].filter((r) => r.from !== r.to);

  const counts = collectionsAudit?.counts || {};
  const mig = migrationAudit?.audit || {};

  const lines = [
    "# ENGLISH_URL_MIGRATION_PLAN",
    "",
    "**Store:** EuroDroneParts (`ya1xhg-x6.myshopify.com`)",
    "**Status:** PRE-LAUNCH — read-only audit, no changes applied",
    `**Generated:** ${new Date().toISOString()}`,
    "**Domains (target):** eudroneparts.com · eudroneparts.de · eudroneparts.dk · eudroneparts.fi · eudroneparts.fr · future EU markets",
    "",
    "## Executive summary",
    "",
    "| Resource | Live on target | Swedish/non-English handles flagged |",
    "|---|---:|---:|",
    `| Collections | ${targetCollections.length} | ${collectionRows.length} need rename |`,
    `| Pages | ${livePages.length} | ${pageRows.length} need rename |`,
    `| Blogs / articles | ${liveBlogs.length} blog(s) | ${blogRows.length} need rename |`,
    `| Products (live, all draft) | ${productsAll?.total ?? liveProducts.length} | ${productRows.length} need rename |`,
    `| Menu links (canonical menus) | ${menuLinkRows.length} flagged | — |`,
    "",
    "Swedish handles were detected via token matching (`tillbehor`, `reservdelar`, `dronare`, `fjarrkontroller`, etc.) and diacritics. Proposed English handles preserve brand tokens (`dji`, `gopro`, model names) and apply consistent translations.",
    "",
    "---",
    "",
    "## SECTION 1 — Collections to rename",
    "",
    `Live target collections: **${targetCollections.length}** (source migration: ${counts.source_collections || "—"}).`,
    "",
    mdTable(collectionRows, ["current_handle", "proposed_handle", "title", "kind", "products"]),
    "",
    "### Collections already English (no rename required)",
    "",
    `${targetCollections.length - collectionRows.length} collection handles are brand/model English or contain no Swedish tokens.`,
    "",
    "---",
    "",
    "## SECTION 2 — Pages to rename",
    "",
    mdTable(pageRows, ["current_handle", "proposed_handle", "title", "published"]),
    "",
    livePages.length === 0
      ? "_No pages returned from live Shopify Admin._\n"
      : pageRows.length === 0
        ? "_All live page handles are already English._\n"
        : "",
    "### Legacy ActionKing pages (exclude or remap — not EuroDroneParts IA)",
    "",
    "These pages use `actionking` in the handle and should not ship on eudroneparts.com:",
    "",
    mdTable(
      livePages
        .filter((p) => /actionking/i.test(p.handle))
        .map((p) => ({
          current_handle: p.handle,
          proposed_handle: "(exclude — legacy ActionKing)",
          title: p.title,
          published: p.isPublished ? "yes" : "no",
        })),
      ["current_handle", "proposed_handle", "title", "published"],
    ),
    "",
    "### Blogs to rename",
    "",
    mdTable(
      blogRows,
      ["resource", "current_handle", "proposed_handle", "title"],
    ),
    "",
    "---",
    "",
    "## SECTION 3 — Products to rename",
    "",
    `Products audited: **${productsAll?.total ?? "—"}** live (all **DRAFT** at audit time). Migration DB: **${mig.products?.total_target ?? "—"}** on target.`,
    "",
    mdTable(productRows, ["current_handle", "proposed_handle", "title", "status"]),
    "",
    "---",
    "",
    "## SECTION 4 — Menu links affected",
    "",
    "### Canonical menu handles",
    "",
    "| Menu handle | Live title | Theme-linked | Action |",
    "|---|---|---|---|",
    "| `main-menu` | Huvudmeny | yes (`header-group.json`) | Rename handle → `main-menu` (already English); update child URLs |",
    "| `footer` | Sidfotsmeny | — | Update page/collection links to English handles |",
    "| `enterprise-dr-nare` | Enterprise Drönare | — | Rename menu handle → `enterprise-drones`; remap children |",
    "| `customer-account-main-menu` | Huvudmeny för kundkonto | — | Remove ActionKing account URLs; use Shopify customer accounts |",
    "| `partnership` | Partnership | — | Remap Swedish page links (`ansok-om-partnership` → `apply-for-partnership`) |",
    "| `meny` | Huvudmeny (duplicate) | — | Consolidate into `main-menu`; deprecate |",
    "",
    "### Menu handles with Swedish names (rename)",
    "",
    "| Current menu handle | Proposed menu handle |",
    "|---|---|",
    "| `enterprise-dr-nare` | `enterprise-drones` |",
    "| `meny` | _(merge into `main-menu`)_ |",
    "| `dronare` | `drones` _(legacy — empty, delete after theme confirm)_ |",
    "| `actionkameror` | `action-cameras` _(legacy — empty)_ |",
    "| `vandring-outdoor` | `hiking-outdoor` _(legacy — empty)_ |",
    "",
    "### Links requiring URL updates",
    "",
    mdTable(menuLinkRows, ["menu", "label", "current_url", "proposed_url", "type", "notes"]),
    "",
    "---",
    "",
    "## SECTION 5 — Redirect plan",
    "",
    "Implement **after** handle renames in Shopify Admin, **before** enabling markets/domains. Use Shopify URL redirects (Admin → Online Store → Navigation → URL redirects) or theme-level redirect app.",
    "",
    "### Priority 301 map (collections + pages)",
    "",
    mdTable(redirectRows, ["type", "from", "to"]),
    "",
    "### Locale / market prefix rules",
    "",
    "| Pattern | Redirect |",
    "|---|---|",
    "| `/en/collections/{sv}` | `/collections/{en}` (drop legacy `/en` prefix) |",
    "| `/sv/collections/{sv}` | `/sv-se/collections/{en}` or market subdomain per Shopify Markets config |",
    "| `/collections/{sv}` | `/collections/{en}` |",
    "| `/pages/{sv}` | `/pages/{en}` |",
    "| `/products/{sv}` | `/products/{en}` |",
    "",
    "### Legacy ActionKing URLs (do not restore — redirect to closest English EDP equivalent or home)",
    "",
    "| Legacy URL | Suggested target |",
    "|---|---|",
    "| `/en/collections/actionking-outlet` | `/collections/all-products` |",
    "| `/en/collections/dronare-actionking` | `/collections/drones` |",
    "| `/en/collections/actionkamer-dji-gopro-insta360` | _(exclude — EUActionCam future store)_ |",
    "| `https://account.actionking.se/*` | Shopify customer account (`/account`) |",
    "",
    "### Example mappings (from stakeholder brief)",
    "",
    "| Swedish | English |",
    "|---|---|",
    "| `reservdelar` | `spare-parts` |",
    "| `tillbehor` | `accessories` |",
    "| `dronare` | `drones` |",
    "| `service-och-support` | `service-support` |",
    "| `offertforfragan` | `request-a-quote` |",
    "| `foretagskonto` | `business-account` |",
    "",
    "---",
    "",
    "## SECTION 6 — Shopify Markets readiness",
    "",
    "### Recommended architecture",
    "",
    "1. **Primary URL language:** English handles on primary domain `eudroneparts.com` (canonical for SEO).",
    "2. **Translated content:** Shopify Markets + Translate & Adapt for DE, DK, FI, FR storefront strings; **handles stay English** (Shopify best practice).",
    "3. **Subfolders vs domains:** Use **market domains** (`eudroneparts.de`, etc.) with hreflang; avoid duplicating handles per locale.",
    "4. **Menus:** One English-handle menu set; market-specific menu translations via Shopify Markets localization.",
    "5. **Blogs:** Single blog handle `guides` (migrate from `guider` if present); articles get translated titles, English handles.",
    "",
    "### Pre-launch checklist",
    "",
    "| Step | Status |",
    "|---|---|",
    "| Rename collections/pages/products (Sections 1–3) | **Planned** |",
    "| Update menus (Section 4) | **Planned** |",
    "| Create 301 redirects (Section 5) | **Planned** |",
    "| Remove `/en/` legacy prefix from theme + menus | **Required** |",
    "| Configure Shopify Markets (EU) | **Pending** |",
    "| Connect domains (com, de, dk, fi, fr) | **Pending** |",
    "| hreflang + sitemap per market | **Pending** |",
    "| Smart collection rules referencing handles | **Review** — rules use product tags/metafields, not handles |",
    "",
    "### Markets configuration notes",
    "",
    "- **Catalog:** 204 live collections; 787 source handles intentionally excluded (ActionKing legacy). Do not bulk-restore Swedish ActionKing collections.",
    "- **Products:** Rename handles while **draft**; no published products simplifies redirect surface.",
    "- **Enterprise vs consumer:** Channel split per `EDP_CHANNEL_SPLIT_AUDIT.md` — enterprise landing at `/pages/enterprise`, consumer drones at `/collections/drones` (from `dronare` / `dji-dronare`).",
    "- **Customer accounts:** Migrate off `account.actionking.se` to Shopify New Customer Accounts.",
    "- **SEO:** English handles + translated meta per market; canonical points to `eudroneparts.com` unless market-specific canonical strategy is chosen.",
    "",
    "---",
    "",
    "## Data sources",
    "",
    "- `shopify-cloner-worker` → `collection_reconciliation_audit` (live collections)",
    "- `shopify-cloner-worker` → `menu_recovery_fix` dry-run (migration menu links)",
    "- `test-integration` → Shopify Admin GraphQL (pages, blogs, products sample, key menus)",
    "- `EURODRONEPARTS_MENU_AUDIT.md`, `MISSING_COLLECTIONS.md`, `EDP_CHANNEL_SPLIT_AUDIT.md`",
    "",
    "## Guardrails (this document)",
    "",
    "- **No deployment**",
    "- **No URL changes**",
    "- **No redirects created**",
    "- **No publishing**",
    "",
  ];

  writeFileSync(OUT, lines.join("\n"), "utf8");
  console.log(`Wrote ${OUT}`);
  console.log(
    `collections=${collectionRows.length} pages=${pageRows.length} blogs=${blogRows.length} products=${productRows.length} menuLinks=${menuLinkRows.length} redirects=${redirectRows.length}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
