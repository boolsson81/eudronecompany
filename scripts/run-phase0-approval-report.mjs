#!/usr/bin/env node
/**
 * Phase 0 Approval Report — READ-ONLY.
 * Applies operator-approved taxonomy decisions. No Shopify, handle, menu, or redirect changes.
 *
 * Usage:
 *   node scripts/run-phase0-approval-report.mjs
 *
 * Writes: PHASE_0_APPROVAL_REPORT.md
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import {
  ABSORB_HANDLES,
  APPROVED_MENU,
  APPROVED_MERGE_PLAN,
  REJECTED_MERGE_PLAN,
  TAXONOMY_VERSION,
  TOP_LEVEL_CATEGORIES,
  classifyApproved,
  collectApprovedNavHandles,
  ENTERPRISE_ACCESSORY_HANDLES,
  HIDDEN_CATALOG_HANDLES,
  isLegacyHidden,
} from "./lib/taxonomy-approval-config.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPORT = join(ROOT, "PHASE_0_APPROVAL_REPORT.md");
const MISSING = join(ROOT, "MISSING_COLLECTIONS.md");
const SHOP = "ya1xhg-x6.myshopify.com";

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

function renderMenu() {
  const L = [];
  for (const [section, cfg] of Object.entries(APPROVED_MENU)) {
    L.push(`### ${section}`, "");
    if (cfg.landing) L.push(`- Landing: \`/collections/${cfg.landing}\``, "");
    for (const child of cfg.children) {
      const handles = child.handles || (child.handle ? [child.handle] : []);
      if (!handles.length) {
        L.push(`- ${child.label} _(TBD — ${child.note || "manual review"})_`);
        continue;
      }
      if (handles.length === 1) {
        L.push(`- ${child.label} → \`/collections/${handles[0]}\``);
      } else {
        L.push(`- **${child.label}**`);
        for (const h of handles) L.push(`  - \`/collections/${h}\``);
      }
    }
    L.push("");
  }
  return L.join("\n");
}

function buildReport(collections, source) {
  const now = new Date().toISOString();
  const navHandles = collectApprovedNavHandles();
  const byHandle = new Map(collections.map((c) => [c.handle, c]));
  const absorbSet = new Set(APPROVED_MERGE_PLAN.map((m) => m.absorb));

  const enriched = collections.map((c) => {
    const category = classifyApproved(c.handle, c.title);
    const legacy = isLegacyHidden(c.handle, c.title);
    const hiddenCatalog = HIDDEN_CATALOG_HANDLES.includes(c.handle);
    const enterpriseAcc = ENTERPRISE_ACCESSORY_HANDLES.includes(c.handle);
    const excludedFromNav = legacy || hiddenCatalog || absorbSet.has(c.handle);
    return {
      ...c,
      category,
      merge_approved: ABSORB_HANDLES.has(c.handle) ? "yes" : "no",
      in_approved_nav: !excludedFromNav && navHandles.has(c.handle),
      nav_status: hiddenCatalog
        ? "hidden catalog"
        : legacy
          ? "legacy / hidden"
          : absorbSet.has(c.handle)
            ? "pending merge (absorb)"
            : navHandles.has(c.handle)
              ? "in nav"
              : "excluded",
      enterprise_accessory: enterpriseAcc,
    };
  });

  const grouped = Object.fromEntries(TOP_LEVEL_CATEGORIES.map((cat) => [cat, []]));
  for (const c of enriched.sort((a, b) => b.products_count - a.products_count)) {
    grouped[c.category].push(c);
  }

  const mergeRows = APPROVED_MERGE_PLAN.filter((m) => byHandle.has(m.absorb));
  const legacyHidden = enriched.filter((c) => c.category === "Legacy / Hidden");
  const hiddenCatalog = enriched.filter((c) => c.category === "Hidden Catalog");
  const excludedNav = enriched.filter((c) => !c.in_approved_nav && c.nav_status !== "pending merge (absorb)");
  const manualReview = enriched.filter((c) => c.category === "Manual Review");
  const enterpriseAcc = enriched.filter((c) => c.enterprise_accessory);

  const L = [];
  const push = (...lines) => L.push(...lines);

  push(
    "# EuroDroneParts — Phase 0 Approval Report",
    "",
    `**Generated:** ${now}`,
    `**Taxonomy version:** \`${TAXONOMY_VERSION}\``,
    `**Source:** ${source}`,
    `**Store:** ${SHOP}`,
    "",
    "## Status: APPROVED TAXONOMY — EXECUTION GATED",
    "",
    "| Constraint | Status |",
    "| --- | --- |",
    "| Brand-new store (never launched) | YES |",
    "| Redirects | NONE — do not create |",
    "| Legacy URL preservation | NOT REQUIRED |",
    "| Handle renames | BLOCKED until execution phase |",
    "| Menu rewiring | BLOCKED until execution phase |",
    "| Theme reference changes | BLOCKED until execution phase |",
    "| Shopify modifications | NONE in this phase |",
    "",
    "> Operator decisions applied. This report is the approval artifact for Phase 0.",
    "> Merges, menu wiring, and handle renames require a separate execution phase after final sign-off.",
    "",
    "## Executive summary",
    "",
    "| Metric | Count |",
    "| --- | ---: |",
    `| Total collections | ${enriched.length} |`,
    `| Approved merge pairs | ${mergeRows.length} |`,
    `| Rejected merge groups | ${REJECTED_MERGE_PLAN.length} |`,
    `| Legacy / hidden collections | ${legacyHidden.length} |`,
    `| Hidden catalog collections | ${hiddenCatalog.length} |`,
    `| Enterprise accessory collections | ${enterpriseAcc.length} |`,
    `| Manual review required | ${manualReview.length} |`,
    `| Excluded from approved navigation | ${excludedNav.length} |`,
    "",
    "### By approved category",
    "",
    "| Category | Collections |",
    "| --- | ---: |",
  );

  for (const cat of TOP_LEVEL_CATEGORIES) {
    if (grouped[cat]?.length) push(`| ${cat} | ${grouped[cat].length} |`);
  }
  push("");

  push("## 1. Final approved taxonomy", "");
  push("Collections grouped by approved destination category. Handles unchanged.", "");
  for (const cat of TOP_LEVEL_CATEGORIES) {
    const items = grouped[cat];
    if (!items?.length) continue;
    push(`### ${cat} (${items.length})`, "");
    push("| Handle | Title | Products | Merge? | Nav status |");
    push("| --- | --- | ---: | --- | --- |");
    for (const c of items) {
      push(
        `| \`${c.handle}\` | ${c.title.replace(/\|/g, "\\|").slice(0, 65)} | ${c.products_count} | ${c.merge_approved} | ${c.nav_status} |`,
      );
    }
    push("");
  }

  push("## 2. Approved merge pairs", "");
  push("Execute only in merge phase. Absorbing collections remain live until merge is run.", "");
  push("| Absorb (remove) | Into (canonical) | Products | Reason |");
  push("| --- | --- | ---: | --- |");
  for (const m of mergeRows) {
    const abs = byHandle.get(m.absorb);
    push(`| \`${m.absorb}\` | \`${m.canonical}\` | ${abs?.products_count ?? "—"} | ${m.reason} |`);
  }
  push("");

  push("## 3. Rejected merges (keep separate)", "");
  for (const r of REJECTED_MERGE_PLAN) {
    push(`- **Keep separate:** ${r.keep.map((h) => `\`${h}\``).join(", ")}`);
    push(`  - ${r.reason}`);
  }
  push("");

  push("## 4. Collections excluded from navigation", "");
  push("| Handle | Title | Products | Category | Reason |");
  push("| --- | --- | ---: | --- | --- |");
  for (const c of excludedNav.sort((a, b) => b.products_count - a.products_count)) {
    const reason =
      c.nav_status === "hidden catalog"
        ? "Hidden catalog only (`alla-produkter`)"
        : c.nav_status === "legacy / hidden"
          ? "GoPro / action-camera legacy assortment"
          : c.category === "Manual Review"
            ? "Unassigned — manual review"
            : "Not in approved menu structure";
    push(`| \`${c.handle}\` | ${c.title.slice(0, 55)} | ${c.products_count} | ${c.category} | ${reason} |`);
  }
  push("");

  push("## 5. Legacy / hidden (GoPro & action camera)", "");
  push("Collections kept intact. Products unchanged. Excluded from all navigation.", "");
  push("| Handle | Title | Products |");
  push("| --- | --- | ---: |");
  for (const c of legacyHidden.sort((a, b) => b.products_count - a.products_count)) {
    push(`| \`${c.handle}\` | ${c.title.slice(0, 60)} | ${c.products_count} |`);
  }
  push("");

  push("## 6. Hidden catalog", "");
  push("| Handle | Title | Products | Note |");
  push("| --- | --- | ---: | --- |");
  for (const c of hiddenCatalog) {
    push(`| \`${c.handle}\` | ${c.title.slice(0, 60)} | ${c.products_count} | Do not delete, merge, or show in primary nav |`);
  }
  push("");

  push("## 7. Enterprise accessory placement", "");
  push("Under **Enterprise Drones → Enterprise Accessories**. Not grouped with consumer Accessories.", "");
  push("| Handle | Title | Products | Examples mapped |");
  push("| --- | --- | ---: | --- |");
  const examples = {
    "enterprise-tillbehor": "General enterprise accessories",
    "enterprise-dronartillbehor": "Enterprise drone accessories",
    "enterprise-propellrar": "Enterprise propellers",
    "dji-enterprise-fjarrkontroller": "RC Plus / enterprise controllers",
    "dji-matrice-350-rtk-tillbehor": "D-RTK / Matrice RTK accessories",
    "dji-matrice-4-tillbehor": "Matrice 4 accessories",
    "dji-matrice-30-serie-tillbehor": "Matrice 30 arms/accessories",
    "dji-mavic-3m-dronare-tillbehor": "Mavic 3M enterprise",
    "dji-mavic-serien-enterprise": "Mavic enterprise series",
    "tillbehor-dji-mavic-dronare": "Mavic 3E accessories",
  };
  for (const h of ENTERPRISE_ACCESSORY_HANDLES) {
    const c = byHandle.get(h);
    if (!c) continue;
    push(`| \`${h}\` | ${c.title.slice(0, 50)} | ${c.products_count} | ${examples[h] || "—"} |`);
  }
  push("");
  push("_Dock accessories: no dedicated collection on store — manual review._", "");

  push("## 8. Collections requiring manual review", "");
  push("| Handle | Title | Products | Issue |");
  push("| --- | --- | ---: | --- |");
  for (const c of manualReview.sort((a, b) => b.products_count - a.products_count)) {
    let issue = "Category / nav placement undecided";
    if (c.handle === "dronare-actionking") issue = "Overlaps `dronare-med-kamera` (47 products each) — keep separate per approval";
    if (/energi-infrastruktur|transport-logistik/.test(c.handle)) issue = "Solutions collections — removed from top-level nav";
    if (c.handle === "ringlampa") issue = "Payload vs accessory placement";
    if (c.handle === "multiverktyg-friluftsliv") issue = "Support vs exclude";
    if (c.handle === "amagisn-kameratillbehor-och-dronarutrustning") issue = "Mixed camera/drone brand — Brands nav vs review";
    push(`| \`${c.handle}\` | ${c.title.slice(0, 50)} | ${c.products_count} | ${issue} |`);
  }
  push("");
  push("### Nav gaps (approved structure, no matching collection)", "");
  push("| Nav item | Status |");
  push("| --- | --- |");
  push("| Spare Parts → Arms | No dedicated collection |");
  push("| Accessories → Antennas | No dedicated collection |");
  push("| Payloads → LiDAR | No dedicated collection |");
  push("| Payloads → Thermal Payloads | Review vs Enterprise Thermal drones |");
  push("| Brands → CZI | Not on store (source only) |");
  push("| Brands → STARTRC | Not on store (source only) |");
  push("| Support → Warranty | Page/collection TBD |");
  push("| Support → Downloads | Page/collection TBD |");
  push("");

  push("## 9. Final approved menu hierarchy", "");
  push("Current handles only. No redirects. Solutions removed from top-level nav.", "");
  push(renderMenu());

  push("## Full inventory (approved taxonomy)", "");
  push("| Handle | Title | Products | Category | Merge? | Nav |");
  push("| --- | --- | ---: | --- | --- | --- |");
  for (const c of enriched.sort((a, b) => a.handle.localeCompare(b.handle))) {
    push(
      `| \`${c.handle}\` | ${c.title.replace(/\|/g, "\\|").slice(0, 50)} | ${c.products_count} | ${c.category} | ${c.merge_approved} | ${c.nav_status} |`,
    );
  }
  push("");

  push("## Execution gate checklist", "");
  push("- [x] Approved merge pairs defined (5)");
  push("- [x] Rejected merges documented");
  push("- [x] GoPro / action-camera → Legacy / Hidden");
  push("- [x] `alla-produkter` → hidden catalog");
  push("- [x] Enterprise accessories under Enterprise Drones");
  push("- [x] Final 8-category menu hierarchy approved");
  push("- [ ] **Final operator sign-off**");
  push("- [ ] Merge execution phase");
  push("- [ ] English handle rename phase (if applicable)");
  push("- [ ] Menu wiring phase");
  push("- [ ] Theme reference update phase");
  push("");

  return L.join("\n");
}

const collections = parseMissingCollectionsMd();
const source = "MISSING_COLLECTIONS.md (snapshot 2026-06-11)";
writeFileSync(REPORT, buildReport(collections, source));
console.log(`Wrote ${REPORT} (${collections.length} collections, ${TAXONOMY_VERSION})`);
