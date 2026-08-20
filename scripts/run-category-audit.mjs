#!/usr/bin/env node
/**
 * READ-ONLY taxonomy audit — no Shopify changes, no handle/menu/redirect modifications.
 *
 * Usage:
 *   node scripts/run-category-audit.mjs
 *   node scripts/run-category-audit.mjs --live   # if EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN set
 *
 * Writes: EURODRONEPARTS_TAXONOMY_AUDIT.md
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPORT = join(ROOT, "EURODRONEPARTS_TAXONOMY_AUDIT.md");
const MISSING = join(ROOT, "MISSING_COLLECTIONS.md");
const SHOP = "ya1xhg-x6.myshopify.com";

const CATEGORIES = [
  "Consumer Drones",
  "Enterprise Drones",
  "Spare Parts",
  "Accessories",
  "Payloads & Sensors",
  "Solutions",
  "Brands",
  "Support",
  "Orphan / Review",
];

/** Planned merges: absorb → canonical (review only — not executed by this script) */
const MERGE_PLAN = [
  { canonical: "dji-air-3-serien", absorb: "dij-air-3-serien", reason: "Typo duplicate handle (dij vs dji)" },
  { canonical: "dji-mavic-3-serien", absorb: "dji-mavic-3-classic-1", reason: "Duplicate Mavic 3 Classic collection" },
  { canonical: "dji-mavic-3-serien", absorb: "dji-mavic-3-classic", reason: "Mavic 3 Classic listed as accessories title on classic handle" },
  { canonical: "dji-matrice-serien", absorb: "dji-matrice-4-serie", reason: "Fragmented Matrice 4 handle" },
  { canonical: "dji-matrice-serien", absorb: "dji-matrice-3-serien", reason: "Mislabeled Matrice 4 series handle" },
  { canonical: "dronartillbehor-kop", absorb: "dronartillbehor-dronar", reason: "Overlapping general accessories (615 vs 374 products)" },
  { canonical: "filter-till-dronare", absorb: "filter-dronare-lins", reason: "Duplicate drone filter collections" },
  { canonical: "dronare-med-kamera", absorb: "dronare-actionking", reason: "Same product count (47) — likely duplicate smart rules" },
  { canonical: "dji-mavic-3-tillbehor", absorb: "tillbehor-dji-mavic-3-cine", reason: "Overlapping Mavic 3 accessory collections" },
  { canonical: "dji-mini-4-serien", absorb: "dji-mini-4-pro-tillbehor", reason: "Mini 4 Pro accessories vs series parent overlap" },
];

const ABSORB_HANDLES = new Set(MERGE_PLAN.map((m) => m.absorb));

/** Proposed main navigation — current handles only */
const PROPOSED_MENU = {
  "Consumer Drones": {
    landing: "dronare-med-kamera",
    children: [
      { label: "All consumer drones", handle: "dronare-med-kamera" },
      { label: "DJI Mini", handles: ["dji-mini-4-serien", "dji-mini-3-serien", "dji-mini-5-serien"] },
      { label: "DJI Air", handles: ["dji-air-3-serien", "dji-air-serien", "dji-air-3s"] },
      { label: "DJI Mavic", handles: ["dji-mavic-3-serien", "dji-mavic-4-serien", "dji-mavic-serien"] },
      { label: "DJI Avata / FPV", handles: ["dji-avata-serien", "dji-avata-pro-fpv-dronare"] },
      { label: "DJI Flip", handles: ["dji-flip-dronare"] },
      { label: "DJI Neo", handles: ["dji-neo"] },
    ],
  },
  "Enterprise Drones": {
    landing: "enterprise-dronare",
    children: [
      { label: "Enterprise overview", handle: "enterprise-dronare" },
      { label: "DJI Matrice", handles: ["dji-matrice-serien", "dji-matrice-400-serien"] },
      { label: "DJI Agras", handles: ["dji-agras-dronare"] },
      { label: "DJI FlyCart", handles: ["dji-flycart-serien", "dji-flycart-100-lastdronare"] },
      { label: "Inspection", handles: ["inspektionsdronare"] },
      { label: "Agriculture", handles: ["jordbruksdronare"] },
      { label: "Mapping & survey", handles: ["kartlaggnings-och-matdronare"] },
      { label: "Thermal", handles: ["dronare-med-varmekamera"] },
    ],
  },
  "Spare Parts": {
    landing: "dji-dronar-reservdelar",
    children: [
      { label: "DJI spare parts", handle: "dji-dronar-reservdelar" },
      { label: "Gimbal & motors", handle: "reservdelar-gimbal-dronare-motorer" },
      { label: "Flight electronics", handle: "dronarelektronik-flight-components" },
      { label: "DJI Neo repair", handle: "reparation-dji-neo-reservdelar" },
    ],
  },
  Accessories: {
    landing: "dronartillbehor-kop",
    children: [
      { label: "All accessories", handle: "dronartillbehor-kop" },
      { label: "Filters", handle: "filter-till-dronare" },
      { label: "Propellers", handles: ["dronare-propeller-tillbehor", "dronarpropellrar-tysta"] },
      { label: "Batteries & chargers", handle: "batterier" },
      { label: "Bags & cases", handles: ["dronarryggsack-vaskor", "kapor-till-dronare"] },
      { label: "Remote control", handles: ["fjarrkontroll-dronare", "dronar-fjarrkontrollstillbehor"] },
      { label: "Landing & protection", handles: ["landningsstall-dronare", "skydd-dronare", "dronarmatta-landning-skydd"] },
      { label: "DJI Mavic accessories", handle: "dji-mavic-3-tillbehor" },
      { label: "DJI Mini accessories", handles: ["tillbehor-dji-mini-4-serien", "dji-mini-tillbehor"] },
      { label: "Cables & storage", handles: ["tillbehorskablar-dronare", "minneskort-lagring", "usb-kablar-usb-c-till-usb-c"] },
    ],
  },
  "Payloads & Sensors": {
    landing: "enterprise-sensorer",
    children: [
      { label: "Enterprise sensors", handle: "enterprise-sensorer" },
      { label: "Drone cameras", handle: "dronar-kameror" },
      { label: "Enterprise lighting", handle: "enterprise-belysning" },
      { label: "Loudspeakers", handle: "enterprise-hogtalarsystem" },
      { label: "Lifting systems", handle: "enterprise-lyftsystem" },
      { label: "Airdrop systems", handle: "airdrop-system" },
    ],
  },
  Solutions: {
    landing: "energi-infrastruktur",
    children: [
      { label: "Energy & infrastructure", handle: "energi-infrastruktur" },
      { label: "Transport & logistics", handle: "transport-logistik" },
      { label: "GIS / mapping (page TBD)", handle: null },
      { label: "Emergency services (page TBD)", handle: null },
    ],
  },
  Brands: {
    landing: "dji",
    children: [
      { label: "DJI", handle: "dji" },
      { label: "PolarPro", handle: "polarpro" },
      { label: "PGYTECH", handle: "pgytech-tillbehor" },
      { label: "BRDRC", handle: "brdrc-tillbehor" },
      { label: "Master Airscrew", handle: "master-airscrew-dji-propellrar" },
      { label: "Sunnylife", handle: "vendors-q-sunnylife" },
      { label: "AMagisn", handle: "amagisn-kameratillbehor-och-dronarutrustning" },
    ],
  },
  Support: {
    landing: "reparera-precisionsverktyg-elektronik",
    children: [
      { label: "Repair tools", handle: "reparera-precisionsverktyg-elektronik" },
      { label: "Cleaning", handle: "rengoringsprodukter-actionking" },
      { label: "Precision tools", handles: ["bandverktyg", "skruvmejsel-set", "pincetter-actionking", "tanger-actionking"] },
      { label: "Enterprise service", handle: "enterprise-service-dronare" },
    ],
  },
};

function loadEnv() {
  const p = join(ROOT, ".env");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
}

function parseMissingCollectionsMd() {
  const text = readFileSync(MISSING, "utf8");
  const start = text.indexOf("## TARGET_COLLECTIONS");
  const end = text.indexOf("## MISSING_COLLECTIONS");
  const rows = [];
  for (const line of text.slice(start, end).split("\n")) {
    const m = line.match(/^\| ([^|]+) \| ([^|]+) \| (\w+) \| ([^|]+) \|/);
    if (!m || m[1].trim() === "Handle") continue;
    const pc = m[4].trim().replace(/[−–]/g, "-");
    let products_count = 0;
    if (pc !== "—" && pc !== "") {
      const n = parseInt(pc, 10);
      products_count = Number.isNaN(n) ? 0 : Math.max(0, n);
    }
    rows.push({
      handle: m[1].trim(),
      title: m[2].trim(),
      kind: m[3].trim(),
      products_count,
    });
  }
  return rows;
}

async function fetchLiveCollections(token) {
  const rows = [];
  let cursor = null;
  for (let i = 0; i < 20; i++) {
    const r = await fetch(`https://${SHOP}/admin/api/2025-10/graphql.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
      body: JSON.stringify({
        query: `query($cursor: String) {
          collections(first: 250, after: $cursor) {
            edges { cursor node { handle title ruleSet { rules { column } } productsCount { count } } }
            pageInfo { hasNextPage endCursor }
          }
        }`,
        variables: { cursor },
      }),
    });
    const data = await r.json();
    if (data.errors) throw new Error(JSON.stringify(data.errors));
    for (const edge of data.data?.collections?.edges || []) {
      const n = edge.node;
      rows.push({
        handle: n.handle,
        title: n.title,
        kind: (n.ruleSet?.rules?.length || 0) > 0 ? "smart" : "custom",
        products_count: n.productsCount?.count ?? 0,
      });
      cursor = edge.cursor;
    }
    if (!data?.data?.collections?.pageInfo?.hasNextPage) break;
    cursor = data.data.collections.pageInfo.endCursor;
  }
  return rows;
}

function classify(handle, title) {
  const h = handle.toLowerCase();
  const t = title.toLowerCase();

  if (/^(polarpro|pgytech|gopro|brdrc|master-airscrew|vendors-|amagisn)/.test(h)) return "Brands";
  if (h === "dji") return "Brands";

  if (/energi-infrastruktur|transport-logistik/.test(h)) return "Solutions";

  if (/bandverktyg|pincetter|tanger|skruvmejsel|rengoringsprodukter|enterprise-service-dronare|reparera-precisionsverktyg/.test(h)) {
    return "Support";
  }

  if (/reservdelar|reparation-dji|dronarelektronik|gimbal-dronare-motorer/.test(h)) return "Spare Parts";

  if (/enterprise-sensorer|enterprise-belysning|enterprise-hogtalarsystem|enterprise-lyftsystem|dronar-kameror|airdrop-system|ringlampa/.test(h)) {
    return "Payloads & Sensors";
  }

  if (
    /enterprise-dronare|inspektionsdronare|jordbruksdronare|skogsbruksdronare|kartlaggnings|last-och-transport|flycart|dji-matrice|dji-agras|dji-inspire|mavic-serien-enterprise|dronare-med-varmekamera/.test(h) ||
    h === "dji-dronare"
  ) {
    return "Enterprise Drones";
  }

  if (
    /tillbehor|filter-|filter-dronare|propeller|batterier|vaska|vaskor|ryggsack|kapor-till|landnings|skydd-dronare|fjarrkontroll|belysning|kablar|minneskort|propellerskydd|dronarmatta|usb-kablar|vattentatt|fasten-adaptrar|enterprise-tillbehor|enterprise-dronartillbehor|enterprise-propellrar|ji-mini-.*-filter/.test(h)
  ) {
    return "Accessories";
  }

  if (/^alla-produkter|dronare-actionking|dronare-med-kamera|dij-air-3/.test(h)) return "Consumer Drones";

  if (/dronarpropellrar|propellerskydd/.test(h)) return "Accessories";

  if (/dji-marvic-enterprise|dji-mavic-3-enterprise/.test(h)) return "Enterprise Drones";

  if (/dji-mavic-3-classic/.test(h) && /tillbehor/i.test(t)) return "Accessories";

  if (/dji-mavic-4-pro/.test(h) && /tillbehor/i.test(t)) return "Accessories";

  if (/multiverktyg/.test(h)) return "Support";

  if (/dji-(mini|air|mavic|avata|flip|neo|phantom|fpv)/.test(h) && !/tillbehor|filter|propeller|batteri|vaska|fjarrkontroll|rc-pro|rc-fjarr|matrice|agras|inspire|enterprise/.test(h)) {
    return "Consumer Drones";
  }

  if (/dji-air-2|dji-mavic-2/.test(h) && !/tillbehor/.test(h)) return "Consumer Drones";

  if (/gopro-hero|actionkamer/.test(h)) return "Orphan / Review";

  if (h === "alla-produkter") return "Consumer Drones";

  return "Orphan / Review";
}

function normTitle(t) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().slice(0, 45);
}

function collectNavHandles() {
  const set = new Set();
  for (const section of Object.values(PROPOSED_MENU)) {
    if (section.landing) set.add(section.landing);
    for (const child of section.children) {
      if (child.handle) set.add(child.handle);
      if (child.handles) child.handles.forEach((h) => set.add(h));
    }
  }
  return set;
}

function buildReport(collections, source) {
  const now = new Date().toISOString();
  const navHandles = collectNavHandles();
  const byHandle = new Map(collections.map((c) => [c.handle, c]));

  const enriched = collections.map((c) => ({
    ...c,
    category: classify(c.handle, c.title),
    merge_recommend: ABSORB_HANDLES.has(c.handle) ? "yes" : "no",
    in_proposed_nav: navHandles.has(c.handle),
  }));

  const mergeGroups = MERGE_PLAN.filter((m) => byHandle.has(m.absorb));
  const absorbSet = new Set(mergeGroups.map((m) => m.absorb));

  const titleGroups = new Map();
  for (const c of enriched) {
    if (absorbSet.has(c.handle)) continue;
    const key = normTitle(c.title);
    if (!key) continue;
    const list = titleGroups.get(key) || [];
    list.push(c);
    titleGroups.set(key, list);
  }
  const titleDuplicates = [...titleGroups.entries()].filter(([, g]) => g.length > 1);

  const orphans = enriched.filter((c) => c.category === "Orphan / Review");
  const missingNav = enriched
    .filter((c) => !c.in_proposed_nav && c.products_count >= 20 && c.category !== "Orphan / Review")
    .sort((a, b) => b.products_count - a.products_count);

  const grouped = Object.fromEntries(CATEGORIES.map((cat) => [cat, []]));
  for (const c of enriched.sort((a, b) => b.products_count - a.products_count)) {
    grouped[c.category].push(c);
  }

  const L = [];
  const push = (...lines) => L.push(...lines);

  push(
    "# EuroDroneParts — Taxonomy Audit Report",
    "",
    `**Generated:** ${now}`,
    `**Source:** ${source}`,
    `**Store:** ${SHOP}`,
    "",
    "## Status: READ-ONLY REVIEW",
    "",
    "| Constraint | Status |",
    "| --- | --- |",
    "| Handles unchanged | YES — all URLs preserved |",
    "| Redirects | DISABLED |",
    "| Menu wiring | UNCHANGED — existing deployment kept |",
    "| Shopify modifications | NONE — report only |",
    "",
    "> **STOP:** Do not rename handles, modify menus, or create redirects until this taxonomy is reviewed and approved.",
    "",
    "## Executive summary",
    "",
    "| Metric | Count |",
    "| --- | ---: |",
    `| Total collections | ${enriched.length} |`,
    `| Merge recommendations | ${enriched.filter((c) => c.merge_recommend === "yes").length} |`,
    `| Planned merge pairs | ${mergeGroups.length} |`,
    `| Title duplicate groups | ${titleDuplicates.length} |`,
    `| Orphan / review | ${orphans.length} |`,
    `| Missing from proposed nav (≥20 products) | ${missingNav.length} |`,
    "",
  );

  push("### By proposed category", "", "| Category | Collections |", "| --- | ---: |");
  for (const cat of CATEGORIES.filter((c) => c !== "Orphan / Review")) {
    push(`| ${cat} | ${grouped[cat].length} |`);
  }
  push("");

  push("## 1. Collections by proposed hierarchy", "");
  for (const cat of CATEGORIES) {
    const items = grouped[cat];
    if (!items.length) continue;
    push(`### ${cat} (${items.length})`, "");
    push("| Handle | Title | Products | Merge? | In nav? |");
    push("| --- | --- | ---: | --- | --- |");
    for (const c of items) {
      push(`| \`${c.handle}\` | ${c.title.replace(/\|/g, "\\|").slice(0, 70)} | ${c.products_count} | ${c.merge_recommend} | ${c.in_proposed_nav ? "yes" : "no"} |`);
    }
    push("");
  }

  push("## 2. Duplicate collections", "");
  if (titleDuplicates.length === 0) {
    push("_No additional title-duplicate groups beyond planned merges._", "");
  } else {
    for (const [title, group] of titleDuplicates) {
      push(`### "${title}…" (${group.length} collections)`, "");
      push("| Handle | Products | Category |");
      push("| --- | ---: | --- |");
      for (const c of group) {
        push(`| \`${c.handle}\` | ${c.products_count} | ${c.category} |`);
      }
      push("");
    }
  }

  push("## 3. Collections recommended for merge", "");
  push("| Absorb (remove) | Into (canonical) | Absorb products | Reason |");
  push("| --- | --- | ---: | --- |");
  for (const m of mergeGroups) {
    const abs = byHandle.get(m.absorb);
    push(`| \`${m.absorb}\` | \`${m.canonical}\` | ${abs?.products_count ?? "—"} | ${m.reason} |`);
  }
  push("");

  push("## 4. Orphan collections (unclassified / legacy review)", "");
  push("| Handle | Title | Products | Merge? | Notes |");
  push("| --- | --- | ---: | --- | --- |");
  for (const c of orphans.sort((a, b) => b.products_count - a.products_count)) {
    const note = /gopro|actionkamer|actionking/i.test(c.handle + c.title)
      ? "Legacy action-camera assortment — exclude from EDP nav"
      : "Assign to category or merge";
    push(`| \`${c.handle}\` | ${c.title.slice(0, 60)} | ${c.products_count} | ${c.merge_recommend} | ${note} |`);
  }
  push("");

  push("## 5. Collections missing from proposed navigation", "");
  push("Collections with ≥20 products not linked in the proposed menu structure below.", "");
  push("| Handle | Title | Products | Proposed category | Merge? |");
  push("| --- | --- | ---: | --- | --- |");
  for (const c of missingNav) {
    push(`| \`${c.handle}\` | ${c.title.slice(0, 60)} | ${c.products_count} | ${c.category} | ${c.merge_recommend} |`);
  }
  push("");

  push("## 6. Proposed final menu structure", "");
  push("Uses **current handles** and `/collections/{handle}` paths. Pages for Solutions TBD.", "");
  for (const [section, cfg] of Object.entries(PROPOSED_MENU)) {
    push(`### ${section}`, "");
    if (cfg.landing) push(`- Landing: \`/collections/${cfg.landing}\``, "");
    for (const child of cfg.children) {
      const handles = child.handles || (child.handle ? [child.handle] : []);
      if (!handles.length) {
        push(`- ${child.label} _(not yet created)_`);
        continue;
      }
      if (handles.length === 1) {
        push(`- ${child.label} → \`/collections/${handles[0]}\``);
      } else {
        push(`- **${child.label}**`);
        for (const h of handles) push(`  - \`/collections/${h}\``);
      }
    }
    push("");
  }

  push("## Full inventory", "");
  push("| Handle | Title | Products | Proposed category | Merge? | In nav? |");
  push("| --- | --- | ---: | --- | --- | --- |");
  for (const c of enriched.sort((a, b) => a.handle.localeCompare(b.handle))) {
    push(`| \`${c.handle}\` | ${c.title.replace(/\|/g, "\\|").slice(0, 55)} | ${c.products_count} | ${c.category} | ${c.merge_recommend} | ${c.in_proposed_nav ? "yes" : "no"} |`);
  }
  push("");

  push("## Approval checklist", "");
  push("- [ ] Category assignments reviewed");
  push("- [ ] Merge pairs approved");
  push("- [ ] Orphan / legacy collections disposition decided");
  push("- [ ] Proposed menu structure approved");
  push("- [ ] Collections missing from nav addressed");
  push("- [ ] **Only then** proceed to handle rename / menu wiring (separate phase)");
  push("");

  return L.join("\n");
}

async function main() {
  loadEnv();
  const live = process.argv.includes("--live");
  const token = process.env.EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN;

  let collections;
  let source;
  if (live && token) {
    collections = await fetchLiveCollections(token);
    source = "live_shopify_admin_api";
  } else {
    if (live) console.warn("No token — using MISSING_COLLECTIONS.md snapshot");
    collections = parseMissingCollectionsMd();
    source = "MISSING_COLLECTIONS.md (snapshot 2026-06-11)";
  }

  writeFileSync(REPORT, buildReport(collections, source));
  console.log(`Wrote ${REPORT} (${collections.length} collections)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
