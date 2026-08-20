#!/usr/bin/env node
/**
 * English-first taxonomy review for EuroDroneParts (read-only).
 * Outputs review report + structure/mapping CSVs for approval before implementation.
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import {
  isLegacyExcludePage,
  isSwedishHandle,
  proposeEnglishHandle,
  writeCsv,
  mdTable,
} from "./lib/english-handle-migration.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = {
  review: join(ROOT, "ENGLISH_FIRST_TAXONOMY_REVIEW.md"),
  collectionStructure: join(ROOT, "FINAL_COLLECTION_STRUCTURE.csv"),
  menuStructure: join(ROOT, "FINAL_MENU_STRUCTURE.csv"),
  collectionMapping: join(ROOT, "COLLECTION_HANDLE_MAPPING.csv"),
  pageMapping: join(ROOT, "PAGE_HANDLE_MAPPING.csv"),
  blogMapping: join(ROOT, "BLOG_HANDLE_MAPPING.csv"),
};

const PILLARS = [
  "Drones",
  "Enterprise",
  "Spare Parts",
  "Accessories",
  "Payloads & Sensors",
  "Brands",
  "Support",
];

const MERGE_INTO = {
  "drone-accessories-drone": "drone-accessories",
  "drone-accessories-buy": "drone-accessories",
  "filters-for-drones": "drone-filters",
  "filter-drones-lins": "drone-filters",
  dji: "dji-drones",
  "dij-air-3-series": "dji-air-3-series",
  "dji-matrice-350-rtk-rtk": "dji-matrice-350-rtk",
  "enterprise-dr-nare": "enterprise-drones",
  "alla-produkter": "all-products",
};

const CANONICAL_OVERRIDES = {
  "dji-dronare": "dji-drones",
  "dji-mini-4-serien": "dji-mini-4-series",
  "dji-air-serien": "dji-air-series",
  "dji-mavic-serien": "dji-mavic-series",
  "dji-avata-serien": "dji-avata-series",
  "dji-flip-dronare": "dji-flip-drones",
  "enterprise-dronare": "enterprise-drones",
  "dronartillbehor-kop": "drone-accessories",
  "dji-dronar-reservdelar": "dji-drone-spare-parts",
  "inspektionsdronare": "inspection-drones",
  "jordbruksdronare": "agriculture-drones",
  "skogsbruksdronare": "forestry-drones",
  "kartlaggnings-and-matdronare": "mapping-survey-drones",
  "last-and-transportdronare": "cargo-transport-drones",
  "energi-infrastruktur": "energy-infrastructure",
  "transport-logistik": "transport-logistics",
  "enterprise-sensorer": "enterprise-sensors",
  "enterprise-belysning": "enterprise-lighting",
  "enterprise-hogtalarsystem": "enterprise-speaker-systems",
  "enterprise-lyftsystem": "enterprise-lifting-systems",
  "bandverktyg": "precision-tools",
  "belysning-for-drones": "drone-lighting",
  "fjarrkontroll-dronare": "drone-remote-controls",
  "dronare-propeller-tillbehor": "drone-propeller-accessories",
  "dronarryggsack-vaskor": "drone-backpacks-bags",
  "filter-till-dronare": "drone-filters",
  "tillbehorskablar-drones": "accessory-cables-drones",
  "dronarelektronik-flight-components": "drone-electronics-flight-components",
  "reparera-precisionsverktyg-elektronik": "repair-precision-tools",
  "kapor-for-drones": "drone-covers",
  "protection-drones": "drone-protection",
  "waterproof-kameraskydd": "waterproof-camera-protection",
  "multiverktyg-friluftsliv": "outdoor-multi-tools",
  "skruvmejsel-set": "screwdriver-sets",
  "vendors-q-sunnylife": "sunnylife",
  "gopro-accessories-vendors": "gopro-accessories",
  "cleaning-products-actionking": "drone-cleaning-products",
  "all-products": "all-products",
};

function loadJson(path) {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8"));
}

function proposeCollectionHandle(handle) {
  if (CANONICAL_OVERRIDES[handle]) return CANONICAL_OVERRIDES[handle];
  if (MERGE_INTO[handle]) return MERGE_INTO[handle];
  return proposeEnglishHandle(handle);
}

function classifyCollection(c) {
  const h = c.handle;
  if (/^_|test-delete|actionking/i.test(h)) return { pillar: "Support", action: "EXCLUDE" };
  if (MERGE_INTO[h]) return { pillar: classifyByHandle(MERGE_INTO[h]), action: "MERGE" };
  return { pillar: classifyByHandle(h), action: "KEEP_OR_RENAME" };
}

function classifyByHandle(h) {
  if (/^gopro|^insta360|polarpro|pgytech|sunnylife|nitecore|brdrc|amagisn|vendors-|master-airscrew/i.test(h))
    return "Brands";
  if (
    /enterprise-sensor|enterprise-lighting|enterprise-speaker|enterprise-lifting|zenmuse|thermal|payload|hogtalar|lyftsystem|varmekamera/i.test(
      h,
    )
  )
    return "Payloads & Sensors";
  if (
    /-(propellers|motors|antennas|arms|shell|cables|cameras|batteries|landing-gear|sensors|gimbal|kablar|kameror|motorer|antenner|armar|skal|landnings)/i.test(
      h,
    ) ||
    /repair|precision-tools|reparera|bandverktyg|skruvmejsel/i.test(h)
  )
    return "Spare Parts";
  if (
    /accessories|filter|bag|case|backpack|remote|propeller|battery|tripod|mount|protection|cover|lighting|belysning|tillbeh|charger|cables|memory-card|storage|cleaning/i.test(
      h,
    ) &&
    !/enterprise-dock|matrice-4-rtk|agras/i.test(h)
  )
    return "Accessories";
  if (
    /enterprise|matrice|agras|flycart|dock|mavic-3-enterprise|mavic-series-enterprise|inspection|agriculture|forestry|mapping|cargo|transport-logistics|energy-infrastructure|industry-|inspire|phantom|legacy/i.test(
      h,
    )
  )
    return "Enterprise";
  if (/dji-|hoverair|consumer|drones|drone-|avata|mavic|mini|air-|neo|flip|fpv/i.test(h)) return "Drones";
  if (/all-products|shop-all/i.test(h)) return "Drones";
  return "Accessories";
}

function englishMenuLabel(sv) {
  const map = {
    Drönare: "Drones",
    "Enterprise Drönare": "Enterprise",
    "Enterprise översikt": "Enterprise Overview",
    FlyCart: "FlyCart",
    Branschlösningar: "Industry Solutions",
    Inspektion: "Inspection",
    "Energi & Infrastruktur": "Energy & Infrastructure",
    Jordbruk: "Agriculture",
    Skogsbruk: "Forestry",
    Kartläggning: "Mapping & Survey",
    "Transport & Logistik": "Transport & Logistics",
    Reservdelar: "Spare Parts",
    "Gimbal & motorer": "Gimbal & Motors",
    "Elektronik & flight components": "Electronics & Flight Components",
    Tillbehör: "Accessories",
    Propellrar: "Propellers",
    Filter: "Filters",
    Batterier: "Batteries",
    "Väskor & cases": "Bags & Cases",
    Fjärrkontroller: "Remote Controls",
    "Legacy DJI": "Legacy DJI",
    "Alla konsumentdrönare": "All Consumer Drones",
    "Alla produkter": "All Products",
    Branscher: "Industries",
    Tjänster: "Services",
    "Service & Support": "Support",
    "DJI Service": "DJI Service",
    "Enterprise Service": "Enterprise Service",
    "FlyCart Service": "FlyCart Service",
    "Matrice Service": "Matrice Service",
    Huvudmeny: "Main Menu",
    Sidfotsmeny: "Footer Menu",
    "Enterprise Expansion": "Enterprise",
    "Enterprise & B2B": "B2B Enterprise",
  };
  return map[sv] || sv.replace(/drönare/gi, "Drones").replace(/tillbehör/gi, "Accessories");
}

function buildFinalMenuStructure(collections) {
  const byHandle = new Map(collections.map((c) => [c.proposed_handle, c]));
  const url = (h) => `/collections/${h}`;

  const drones = {
    pillar: "Drones",
    menu: "main-menu",
    label: "Drones",
    children: [
      { label: "DJI Mini Series", url: url("dji-mini-4-series"), handle: "dji-mini-4-series" },
      { label: "DJI Air Series", url: url("dji-air-series"), handle: "dji-air-series" },
      { label: "DJI Mavic Series", url: url("dji-mavic-series"), handle: "dji-mavic-series" },
      { label: "DJI Avata / FPV", url: url("dji-avata-series"), handle: "dji-avata-series" },
      { label: "DJI Neo", url: url("dji-neo"), handle: "dji-neo" },
      { label: "DJI Flip", url: url("dji-flip-drones"), handle: "dji-flip-drones" },
      { label: "HoverAir", url: url("hoverair-drones"), handle: "hoverair-drones" },
      { label: "All Consumer Drones", url: url("dji-drones"), handle: "dji-drones" },
    ],
  };

  const enterprise = {
    pillar: "Enterprise",
    menu: "enterprise",
    label: "Enterprise",
    children: [
      { label: "Enterprise Overview", url: url("enterprise-drones"), handle: "enterprise-drones" },
      { label: "DJI Matrice", url: url("dji-matrice-series"), handle: "dji-matrice-series" },
      { label: "Mavic Enterprise", url: url("dji-mavic-series-enterprise"), handle: "dji-mavic-series-enterprise" },
      { label: "DJI Agras", url: url("dji-agras-drones"), handle: "dji-agras-drones" },
      { label: "FlyCart", url: url("dji-flycart-series"), handle: "dji-flycart-series" },
      { label: "DJI Dock", url: url("dji-dock-series"), handle: "dji-dock-series" },
      {
        label: "Industry Solutions",
        children: [
          { label: "Inspection", url: url("inspection-drones"), handle: "inspection-drones" },
          { label: "Agriculture", url: url("agriculture-drones"), handle: "agriculture-drones" },
          { label: "Forestry", url: url("forestry-drones"), handle: "forestry-drones" },
          { label: "Mapping & Survey", url: url("mapping-survey-drones"), handle: "mapping-survey-drones" },
          { label: "Energy & Infrastructure", url: url("energy-infrastructure"), handle: "energy-infrastructure" },
          { label: "Transport & Logistics", url: url("transport-logistics"), handle: "transport-logistics" },
        ],
      },
    ],
  };

  const spareParts = {
    pillar: "Spare Parts",
    menu: "spare-parts",
    label: "Spare Parts",
    children: [
      { label: "DJI Mini 4 Pro", url: url("dji-mini-4-pro-spare-parts"), handle: "dji-mini-4-pro-spare-parts", note: "group 12 component collections" },
      { label: "DJI Air 3", url: url("dji-air-3-spare-parts"), handle: "dji-air-3-spare-parts", note: "group 12 component collections" },
      { label: "DJI Matrice 4", url: url("dji-matrice-4-spare-parts"), handle: "dji-matrice-4-spare-parts" },
      { label: "DJI Matrice 350 RTK", url: url("dji-matrice-350-rtk-spare-parts"), handle: "dji-matrice-350-rtk-spare-parts" },
      { label: "DJI Mavic 3 Enterprise", url: url("dji-mavic-3-enterprise-spare-parts"), handle: "dji-mavic-3-enterprise-spare-parts" },
      { label: "Repair & Precision Tools", url: url("repair-precision-tools"), handle: "repair-precision-tools" },
    ],
  };

  const accessories = {
    pillar: "Accessories",
    menu: "main-menu",
    label: "Accessories",
    children: [
      { label: "Drone Filters", url: url("drone-filters"), handle: "drone-filters" },
      { label: "Propellers", url: url("drones-propellers-accessories"), handle: "drones-propellers-accessories" },
      { label: "Batteries", url: url("batteries"), handle: "batteries" },
      { label: "Bags & Cases", url: url("drone-backpack-bags"), handle: "drone-backpack-bags" },
      { label: "Remote Controls", url: url("drone-remote-controls"), handle: "drone-remote-controls" },
      { label: "Mounts & Tripods", url: url("camera-tripod-stand"), handle: "camera-tripod-stand" },
      { label: "Memory Cards & Storage", url: url("memory-card-storage"), handle: "memory-card-storage" },
      { label: "Drone Lighting", url: url("drone-lighting"), handle: "drone-lighting" },
    ],
  };

  const payloads = {
    pillar: "Payloads & Sensors",
    menu: "enterprise",
    label: "Payloads & Sensors",
    children: [
      { label: "Enterprise Sensors", url: url("enterprise-sensors"), handle: "enterprise-sensors" },
      { label: "Thermal Cameras", url: url("thermal-drones"), handle: "thermal-drones" },
      { label: "Speaker Systems", url: url("enterprise-speaker-systems"), handle: "enterprise-speaker-systems" },
      { label: "Lifting Systems", url: url("enterprise-lifting-systems"), handle: "enterprise-lifting-systems" },
      { label: "Enterprise Lighting", url: url("enterprise-lighting"), handle: "enterprise-lighting" },
    ],
  };

  const brands = {
    pillar: "Brands",
    menu: "main-menu",
    label: "Brands",
    children: [
      { label: "DJI", url: url("dji-drones"), handle: "dji-drones" },
      { label: "PolarPro", url: url("polarpro"), handle: "polarpro" },
      { label: "PGYTech", url: url("pgytech"), handle: "pgytech" },
      { label: "Sunnylife", url: url("sunnylife"), handle: "sunnylife" },
      { label: "GoPro", url: url("gopro-accessories"), handle: "gopro-accessories" },
      { label: "BRDRC", url: url("brdrc-accessories"), handle: "brdrc-accessories" },
    ],
  };

  const support = {
    pillar: "Support",
    menu: "service-support",
    label: "Support",
    children: [
      { label: "Service & Support", url: "/pages/service-support", handle: "service-support" },
      { label: "DJI Service", url: "/pages/dji-service", handle: "dji-service" },
      { label: "Enterprise Service", url: "/pages/dji-enterprise-service", handle: "dji-enterprise-service" },
      { label: "Request a Quote", url: "/pages/request-a-quote", handle: "request-a-quote" },
      { label: "Business Account", url: "/pages/business-account", handle: "business-account" },
      { label: "RMA", url: "/pages/rma", handle: "rma" },
      { label: "Training", url: "/pages/training", handle: "training" },
      { label: "Financing", url: "/pages/financing", handle: "financing" },
    ],
  };

  return [drones, enterprise, spareParts, accessories, payloads, brands, support];
}

function flattenMenu(nodes, pillar, menu, path = [], out = []) {
  for (const n of nodes) {
    const p = [...path, n.label];
    if (n.url) {
      out.push({
        pillar,
        menu_handle: menu,
        level: p.length,
        label: n.label,
        path: p.join(" > "),
        url: n.url,
        target_handle: n.handle || "",
        note: n.note || "",
      });
    }
    if (n.children) flattenMenu(n.children, pillar, menu, p, out);
  }
  return out;
}

function main() {
  const collectionsAudit = loadJson(join(ROOT, ".url-audit-collections.json"));
  const live = loadJson(join(ROOT, ".url-audit-live.json"));
  const prodMenus = loadJson(join(ROOT, ".live-prod-menus.json")) || [];

  if (!collectionsAudit?.TARGET_COLLECTIONS || !live) {
    console.error("Missing audit JSON");
    process.exit(1);
  }

  const collectionRows = [];
  const canonicalSet = new Map();

  for (const c of collectionsAudit.TARGET_COLLECTIONS) {
    const { pillar, action: baseAction } = classifyCollection(c);
    const mergeInto = MERGE_INTO[c.handle] || "";
    const proposed = mergeInto ? proposeCollectionHandle(mergeInto) : proposeCollectionHandle(c.handle);
    const action = /^_|test-delete|actionking/i.test(c.handle)
      ? "EXCLUDE"
      : mergeInto
        ? "MERGE"
        : proposed !== c.handle || isSwedishHandle(c.handle)
          ? "RENAME"
          : "KEEP";

    const row = {
      current_handle: c.handle,
      proposed_handle: action === "EXCLUDE" ? "(exclude)" : proposed,
      taxonomy_pillar: pillar,
      action,
      merge_into: mergeInto || "",
      products_count: c.products_count ?? 0,
      swedish_detected: isSwedishHandle(c.handle) ? "YES" : "NO",
      current_url: `/collections/${c.handle}`,
      proposed_url: action === "EXCLUDE" ? "(exclude)" : `/collections/${proposed}`,
      title: (c.title || "").slice(0, 80),
    };
    collectionRows.push(row);

    if (action !== "EXCLUDE" && !mergeInto) {
      if (!canonicalSet.has(proposed)) canonicalSet.set(proposed, { ...row, merged_from: [] });
      else canonicalSet.get(proposed).merged_from.push(c.handle);
    } else if (mergeInto) {
      const canon = proposeCollectionHandle(mergeInto);
      if (!canonicalSet.has(canon)) canonicalSet.set(canon, { proposed_handle: canon, taxonomy_pillar: pillar, products_count: 0, merged_from: [c.handle] });
      else canonicalSet.get(canon).merged_from.push(c.handle);
      canonicalSet.get(canon).products_count += c.products_count || 0;
    }
  }

  const finalCollections = [...canonicalSet.values()]
    .map((c) => ({
      proposed_handle: c.proposed_handle,
      taxonomy_pillar: c.taxonomy_pillar,
      products_count: c.products_count,
      merged_from_count: (c.merged_from || []).length,
      merged_from: (c.merged_from || []).join("; "),
      proposed_url: `/collections/${c.proposed_handle}`,
    }))
    .sort((a, b) => a.taxonomy_pillar.localeCompare(b.taxonomy_pillar) || b.products_count - a.products_count);

  const pageRows = [];
  for (const p of live.pages) {
    if (isLegacyExcludePage(p.handle)) {
      pageRows.push({
        current_handle: p.handle,
        proposed_handle: "(exclude)",
        taxonomy_pillar: "Support",
        action: "EXCLUDE",
        current_url: `/pages/${p.handle}`,
        proposed_url: "(exclude)",
        swedish_detected: "LEGACY",
        title: p.title,
      });
      continue;
    }
    const proposed = proposeEnglishHandle(p.handle);
    let pillar = "Support";
    if (/^industry-/.test(p.handle)) pillar = "Enterprise";
    else if (/^dji-.*series|dji-drones|dji-flip|dji-neo|hoverair|drones-/.test(p.handle)) pillar = "Drones";
    else if (/accessories|filter|propeller|tripod|gimbal|battery|memory|protection|kablar|ljud|gopro|osmo/i.test(p.handle))
      pillar = "Accessories";
    else if (/service|support|repair|calibration|financing|training|warranty|rma|quote|business|partner|contact|feedback/i.test(p.handle))
      pillar = "Support";
    else if (/vara-varumarken|nitecore|brands/i.test(p.handle)) pillar = "Brands";

    pageRows.push({
      current_handle: p.handle,
      proposed_handle: proposed,
      taxonomy_pillar: pillar,
      action: proposed !== p.handle || isSwedishHandle(p.handle) ? "RENAME" : "KEEP",
      current_url: `/pages/${p.handle}`,
      proposed_url: `/pages/${proposed}`,
      swedish_detected: isSwedishHandle(p.handle) ? "YES" : "NO",
      title: p.title,
    });
  }

  const blogRows = [];
  for (const b of live.blogs) {
    const blogProposed = proposeEnglishHandle(b.handle);
    blogRows.push({
      resource_type: "blog",
      current_handle: b.handle,
      proposed_handle: blogProposed,
      action: blogProposed !== b.handle ? "RENAME" : "KEEP",
      current_url: `/blogs/${b.handle}`,
      proposed_url: `/blogs/${blogProposed}`,
      title: b.title,
    });
    for (const a of b.articles) {
      const artProposed = proposeEnglishHandle(a.handle);
      blogRows.push({
        resource_type: "article",
        current_handle: `${b.handle}/${a.handle}`,
        proposed_handle: `${blogProposed}/${artProposed}`,
        action: artProposed !== a.handle || blogProposed !== b.handle ? "RENAME" : "KEEP",
        current_url: `/blogs/${b.handle}/${a.handle}`,
        proposed_url: `/blogs/${blogProposed}/${artProposed}`,
        title: a.title,
      });
    }
  }

  const menuTrees = buildFinalMenuStructure(collectionRows);
  const menuRows = [];
  for (const tree of menuTrees) {
    menuRows.push({ pillar: tree.pillar, menu_handle: tree.menu, level: 1, label: tree.label, path: tree.label, url: "", target_handle: "", note: "top-level" });
    menuRows.push(...flattenMenu(tree.children, tree.pillar, tree.menu, [tree.label]));
  }

  const hybridBlogArticles = blogRows.filter(
    (r) =>
      r.resource_type === "article" &&
      r.action !== "EXCLUDE" &&
      (isSwedishHandle(r.proposed_handle.split("/").pop()) ||
        /till-|batterier|nyborjare|bast-i-test|kopa-|kop-|kamera-for|mygga|spela-in|sd-kort|far-man|avskrackaren/i.test(
          r.proposed_handle,
        )),
  );

  const stats = {
    collections_live: collectionRows.length,
    collections_canonical: finalCollections.length,
    collections_rename: collectionRows.filter((r) => r.action === "RENAME").length,
    collections_merge: collectionRows.filter((r) => r.action === "MERGE").length,
    collections_exclude: collectionRows.filter((r) => r.action === "EXCLUDE").length,
    pages_rename: pageRows.filter((r) => r.action === "RENAME").length,
    blog_rename: blogRows.filter((r) => r.action === "RENAME").length,
    blog_hybrid_handles: hybridBlogArticles.length,
    swedish_handles_remaining: collectionRows.filter((r) => r.action !== "EXCLUDE" && /[åäö]|dronar|tillbeh|reservdel|fjarr|serien$/i.test(r.proposed_handle)).length,
  };

  writeCsv(OUT.collectionStructure, ["proposed_handle", "taxonomy_pillar", "products_count", "merged_from_count", "merged_from", "proposed_url"], finalCollections);
  writeCsv(OUT.menuStructure, ["pillar", "menu_handle", "level", "label", "path", "url", "target_handle", "note"], menuRows);
  writeCsv(
    OUT.collectionMapping,
    ["current_handle", "proposed_handle", "taxonomy_pillar", "action", "merge_into", "products_count", "swedish_detected", "current_url", "proposed_url", "title"],
    collectionRows,
  );
  writeCsv(
    OUT.pageMapping,
    ["current_handle", "proposed_handle", "taxonomy_pillar", "action", "swedish_detected", "current_url", "proposed_url", "title"],
    pageRows,
  );
  writeCsv(
    OUT.blogMapping,
    ["resource_type", "current_handle", "proposed_handle", "action", "current_url", "proposed_url", "title"],
    blogRows,
  );

  const report = [
    "# ENGLISH_FIRST_TAXONOMY_REVIEW",
    "",
    "**Store:** EuroDroneParts (`ya1xhg-x6.myshopify.com`)",
    `**Generated:** ${new Date().toISOString()}`,
    "**Status:** REVIEW ONLY — **no changes executed**",
    "",
    "## Executive summary",
    "",
    "English-first architecture for international EU launch. Swedish URLs, handles, and menu labels are **not preserved**. Shopify Markets will serve translated content on market domains while **English handles remain canonical** across all locales.",
    "",
    "### Target markets",
    "",
    "| Domain | Role |",
    "|---|---|",
    "| eurodroneparts.com | Primary canonical (English) |",
    "| eurodroneparts.de | Germany |",
    "| eurodroneparts.dk | Denmark |",
    "| eurodroneparts.fr | France |",
    "| eurodroneparts.nl | Netherlands |",
    "| eurodroneparts.es | Spain |",
    "| eurodroneparts.it | Italy |",
    "",
    "**Rule:** `eurodroneparts.de/collections/spare-parts` ✓ — never `/collections/reservdelar` ✗",
    "",
    "### Scope statistics",
    "",
    "| Resource | Live | Canonical after merge | Renames | Merges | Excludes |",
    "|---|---:|---:|---:|---:|---:|",
    `| Collections | ${stats.collections_live} | ${stats.collections_canonical} | ${stats.collections_rename} | ${stats.collections_merge} | ${stats.collections_exclude} |`,
    `| Pages | ${pageRows.length} | ${pageRows.filter((p) => p.action !== "EXCLUDE").length} | ${stats.pages_rename} | — | ${pageRows.filter((p) => p.action === "EXCLUDE").length} |`,
    `| Blog/articles | ${blogRows.length} | ${blogRows.length} | ${stats.blog_rename} | — | 0 |`,
    "",
    "---",
    "",
    "## 1. Taxonomy pillars",
    "",
    PILLARS.map((p) => `- **${p}**`).join("\n"),
    "",
    "### Pillar definitions",
    "",
    "| Pillar | Scope |",
    "|---|---|",
    "| **Drones** | Consumer drone series (DJI Mini/Air/Mavic/Avata/Neo/Flip, HoverAir) |",
    "| **Enterprise** | Matrice, Agras, FlyCart, Dock, Mavic Enterprise, industry verticals |",
    "| **Spare Parts** | Model-specific components (motors, gimbals, shells, cables, cameras) + repair tools |",
    "| **Accessories** | Filters, propellers, batteries, bags, remotes, mounts, memory, lighting |",
    "| **Payloads & Sensors** | Enterprise sensors, thermal, speaker/lifting/lighting payloads |",
    "| **Brands** | Brand landing collections (DJI, PolarPro, PGYTech, Sunnylife, GoPro) |",
    "| **Support** | Service pages, RMA, training, financing, business account (pages, not collections) |",
    "",
    "---",
    "",
    "## 2. Final collection structure",
    "",
    `**${finalCollections.length}** canonical collections after merge (from ${stats.collections_live} live).`,
    "",
    ...PILLARS.map((pillar) => {
      const rows = finalCollections.filter((c) => c.taxonomy_pillar === pillar);
      return [
        `### ${pillar} (${rows.length})`,
        "",
        mdTable(rows.slice(0, 20), ["proposed_handle", "products_count", "merged_from_count", "proposed_url"]),
        rows.length > 20 ? `\n_…and ${rows.length - 20} more in FINAL_COLLECTION_STRUCTURE.csv_\n` : "",
        "",
      ].join("\n");
    }),
    "---",
    "",
    "## 3. Collection merges (approval required)",
    "",
    "These duplicate/overlapping collections consolidate into a single canonical English handle:",
    "",
    mdTable(
      Object.entries(MERGE_INTO).map(([from, into]) => ({
        merge_from: from,
        merge_into: into,
        proposed_handle: proposeCollectionHandle(into),
      })),
      ["merge_from", "merge_into", "proposed_handle"],
    ),
    "",
    "---",
    "",
    "## 4. Final menu structure (English labels)",
    "",
    "### Production menus",
    "",
    "| Menu handle | English title | Pillar(s) |",
    "|---|---|---|",
    "| `main-menu` | Main Menu | Drones · Accessories · Brands |",
    "| `enterprise` | Enterprise | Enterprise · Payloads & Sensors |",
    "| `spare-parts` | Spare Parts | Spare Parts |",
    "| `service-support` | Support | Support |",
    "| `footer` | Footer Menu | Support · legal |",
    "",
    "### Navigation tree",
    "",
    ...menuTrees.map((tree) => {
      const lines = [`#### ${tree.label} (\`${tree.menu}\`)`, ""];
      function walk(nodes, depth = 0) {
        for (const n of nodes) {
          lines.push(`${"  ".repeat(depth)}- ${n.label}${n.url ? ` → \`${n.url}\`` : ""}${n.note ? ` _(${n.note})_` : ""}`);
          if (n.children) walk(n.children, depth + 1);
        }
      }
      walk(tree.children);
      return lines.join("\n") + "\n";
    }),
    "",
    "### Menu label migration (Swedish → English)",
    "",
    "| Current (Swedish) | Proposed (English) |",
    "|---|---|",
    "| Huvudmeny | Main Menu |",
    "| Drönare | Drones |",
    "| Enterprise Drönare | Enterprise |",
    "| Branschlösningar | Industry Solutions |",
    "| Reservdelar | Spare Parts |",
    "| Tillbehör | Accessories |",
    "| Fjärrkontroller | Remote Controls |",
    "| Väskor & cases | Bags & Cases |",
    "| Branscher | Industries |",
    "| Tjänster | Services |",
    "",
    "Full menu map: **FINAL_MENU_STRUCTURE.csv**",
    "",
    "---",
    "",
    "## 5. Handle mapping summary",
    "",
    "### Collections requiring rename",
    "",
    `${stats.collections_rename} collections → see **COLLECTION_HANDLE_MAPPING.csv**`,
    "",
    "Examples:",
    "",
    mdTable(
      collectionRows.filter((r) => r.action === "RENAME").slice(0, 15),
      ["current_handle", "proposed_handle", "taxonomy_pillar"],
    ),
    "",
    "### Pages requiring rename",
    "",
    mdTable(
      pageRows.filter((r) => r.action === "RENAME").slice(0, 15),
      ["current_handle", "proposed_handle", "taxonomy_pillar"],
    ),
    "",
    "### Blog migration",
    "",
    "- `nyheter` → `news` (68 articles re-handle)",
    "- Future: `guides`, `knowledge-base` when created",
    "",
    `### Blog articles needing manual English slug review (${stats.blog_hybrid_handles})`,
    "",
    "Automated token translation leaves hybrid Swedish/English slugs on some legacy ActionKing-era articles. These require **manual English slugs** before implementation (e.g. `buy-drones-with-camera`, not `kop-drones-med-kamera`).",
    "",
    mdTable(
      hybridBlogArticles.slice(0, 20).map((r) => ({
        current: r.current_handle,
        proposed_auto: r.proposed_handle,
        note: "manual review",
      })),
      ["current", "proposed_auto", "note"],
    ),
    hybridBlogArticles.length > 20
      ? `\n_…and ${hybridBlogArticles.length - 20} more in BLOG_HANDLE_MAPPING.csv_\n`
      : "",
    "",
    "---",
    "",
    "## 6. Shopify Markets architecture",
    "",
    "1. **Single handle namespace** — all markets use identical URL paths",
    "2. **Translate & Adapt** — translate titles, descriptions, menu labels per locale",
    "3. **hreflang** — per market domain with canonical on `.com`",
    "4. **No Swedish URLs** — 301 redirect map required at implementation (separate phase)",
    "5. **Menu labels** — English in admin; localized via Markets theme translations",
    "",
    "---",
    "",
    "## 7. Exclusions",
    "",
    "ActionKing legacy resources excluded from EuroDroneParts production:",
    "",
    `- ${stats.collections_exclude} collections`,
    `- ${pageRows.filter((p) => p.action === "EXCLUDE").length} pages`,
    "",
    "---",
    "",
    "## 8. Approval checklist",
    "",
    "Before implementation, confirm:",
    "",
    "- [ ] 7 taxonomy pillars approved",
    "- [ ] Collection merge list approved (§3)",
    "- [ ] Final menu tree approved (§4)",
    "- [ ] Canonical collection count acceptable (~" + stats.collections_canonical + ")",
    "- [ ] Spare Parts model-grouping strategy approved",
    "- [ ] ActionKing exclusions confirmed",
    "- [ ] Markets domain list confirmed (.com .de .dk .fr .nl .es .it)",
    "",
    "## 9. Generated artifacts",
    "",
    "| File | Description |",
    "|---|---|",
    "| `ENGLISH_FIRST_TAXONOMY_REVIEW.md` | This review document |",
    "| `FINAL_COLLECTION_STRUCTURE.csv` | Canonical collections post-merge |",
    "| `FINAL_MENU_STRUCTURE.csv` | English menu tree with URLs |",
    "| `COLLECTION_HANDLE_MAPPING.csv` | All 204 collections mapped |",
    "| `PAGE_HANDLE_MAPPING.csv` | All 94 pages mapped |",
    "| `BLOG_HANDLE_MAPPING.csv` | Blog + articles mapped |",
    "",
    "## 10. Implementation guardrails (next phase)",
    "",
    "When approved, execution will:",
    "",
    "1. Rename handles (collections → pages → blog)",
    "2. Merge duplicate collections (preserve product assignments)",
    "3. Update menus with English labels + new URLs",
    "4. Deploy 301 redirects",
    "5. Configure Shopify Markets per domain",
    "",
    "**Not included in this review pass:** handle renames, merges, redirects, or publishing.",
    "",
  ];

  writeFileSync(OUT.review, report.join("\n"), "utf8");

  console.log("Generated English-first taxonomy review:");
  for (const [k, p] of Object.entries(OUT)) console.log(`  ${k}: ${p}`);
  console.log(`collections: ${stats.collections_live} → ${stats.collections_canonical} canonical (${stats.collections_merge} merges, ${stats.collections_rename} renames)`);
}

main();
