#!/usr/bin/env node
/**
 * Generate EURODRONEPARTS_PHASE2_ENTERPRISE_ARCHITECTURE.md
 * Read-only — rule definitions and navigation architecture only.
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RULES = JSON.parse(readFileSync(join(ROOT, "data/edp-smart-collection-rules.json"), "utf8"));
const TAGS = JSON.parse(readFileSync(join(ROOT, "data/edp-product-tag-standards.json"), "utf8"));
const NAV = JSON.parse(readFileSync(join(ROOT, "data/edp-navigation-structure.json"), "utf8"));
const SEO = JSON.parse(readFileSync(join(ROOT, "data/edp-industry-seo-framework.json"), "utf8"));
const OUT = join(ROOT, "EURODRONEPARTS_PHASE2_ENTERPRISE_ARCHITECTURE.md");
const MAP_OUT = join(ROOT, "data/edp-collection-menu-mapping.json");

function esc(s) {
  return String(s ?? "").replace(/\|/g, "\\|");
}

function renderRules(rules) {
  if (!rules?.rules?.length) return "_No rules defined_";
  const logic = rules.appliedDisjunctively ? "OR (any match)" : "AND (all match)";
  return rules.rules.map((r) => `\`${r.column}\` ${r.relation} \`${esc(r.condition)}\``).join(logic === "AND (all match)" ? " **AND** " : " **OR** ") + ` — _${logic}_`;
}

function walkNav(items, menuHandle, path = [], out = []) {
  for (const it of items || []) {
    const p = [...path, it.title];
    const m = it.url?.match(/\/collections\/([^/?#]+)/);
    if (m) {
      out.push({
        collection_handle: m[1],
        menu_handle: menuHandle,
        menu_path: p.join(" › "),
        url: it.url,
        note: it.note || null,
      });
    }
    walkNav(it.children, menuHandle, p, out);
  }
  return out;
}

const mapping = [];
for (const [menuHandle, menu] of Object.entries(NAV.menus)) {
  mapping.push(...walkNav(menu.items, menuHandle));
}

// Dedupe — prefer deepest menu path per collection
const byCol = new Map();
for (const row of mapping) {
  const prev = byCol.get(row.collection_handle);
  if (!prev || row.menu_path.length > prev.menu_path.length) byCol.set(row.collection_handle, row);
}
const uniqueMapping = [...byCol.values()].sort((a, b) => a.collection_handle.localeCompare(b.collection_handle));

writeFileSync(
  MAP_OUT,
  JSON.stringify({ generated_at: new Date().toISOString(), mappings: uniqueMapping, total: uniqueMapping.length }, null, 2),
);

const lines = [
  "# EuroDroneParts — Phase 2 Enterprise Product Architecture",
  "",
  `**Generated:** ${new Date().toISOString()}`,
  "**Status:** Architecture & rule definitions only — **no live changes applied**",
  "**Constraints:** No new collection groups | No product modifications | No URL changes | No deletions",
  "",
  "## Overview",
  "",
  "Phase 2 extends the existing 150-collection architecture with:",
  "",
  "1. Smart collection rule definitions (Enterprise DJI, FlyCart, Sensors & Payloads, Industry)",
  "2. Industry SEO landing page framework (7 verticals incl. Public Safety)",
  "3. Product tag standards (7 dimensions)",
  "4. Complete navigation structure (Main, Enterprise, Footer)",
  "5. Collection-to-menu mapping",
  "",
  "Machine-readable sources:",
  "",
  "| File | Purpose |",
  "|---|---|",
  "| `data/edp-smart-collection-rules.json` | Smart collection rule specs |",
  "| `data/edp-product-tag-standards.json` | Tag taxonomy |",
  "| `data/edp-industry-seo-framework.json` | Industry landing page SEO |",
  "| `data/edp-navigation-structure.json` | Menu trees |",
  "| `data/edp-collection-menu-mapping.json` | Collection → menu lookup |",
  "",
  "---",
  "",
  "## 1. Enterprise DJI — Smart Collection Rules",
  "",
  "| Handle | Hub | Proposed rules | Notes |",
  "|---|:---:|---|---|",
];

for (const [handle, cfg] of Object.entries(RULES.enterprise_dji)) {
  lines.push(`| \`${handle}\` | ${cfg.hub ? "✓" : ""} | ${renderRules(cfg.proposed || cfg.current_live)} | ${esc(cfg.notes || "")} |`);
}

lines.push("", "---", "", "## 2. FlyCart — Smart Collection Rules", "", "| Handle | Hub | Proposed rules |", "|---|:---:|---|");
for (const [handle, cfg] of Object.entries(RULES.flycart)) {
  lines.push(`| \`${handle}\` | ${cfg.hub ? "✓" : ""} | ${renderRules(cfg.proposed || cfg.current_live)} |`);
}

lines.push("", "---", "", "## 3. Sensors & Payloads — Smart Collection Rules", "", "| Handle | Hub | Proposed rules |", "|---|:---:|---|");
for (const [handle, cfg] of Object.entries(RULES.sensors_payloads)) {
  lines.push(`| \`${handle}\` | ${cfg.hub ? "✓" : ""} | ${renderRules(cfg.proposed || cfg.current_live)} |`);
}

lines.push("", "---", "", "## 4. Industry Solutions — Smart Collection Rules", "", "| Handle | Proposed rules |", "|---|---|");
for (const [handle, cfg] of Object.entries(RULES.industry_solutions)) {
  lines.push(`| \`${handle}\` | ${renderRules(cfg.proposed || cfg.current_live)} |`);
}

lines.push("", "---", "", "## 5. Industry SEO Landing Page Framework", "", "### Template structure", "", "Each vertical landing page includes:", "", "1. **SEO title** — `{Vertical} | DJI Enterprise | EuroDroneParts`", "2. **SEO description** — value prop + platform keywords", "3. **descriptionHtml** — hero, recommended platforms, related collections", "4. **Cross-links** — enterprise hub + payloads + sibling verticals", "", "| Vertical | Collection | Status | SEO title |", "|---|---|:---:|---|");

for (const [key, v] of Object.entries(SEO.verticals)) {
  const status = v.status === "framework_only" ? "⚠️ framework" : "✓ live";
  lines.push(`| ${key.replace(/_/g, " ")} | \`${v.collection_handle || v.planned_handle || "—"}\` | ${status} | ${esc(v.seo_title)} |`);
}

lines.push("", "### Public Safety & Rescue (framework only)", "", "> **No collection created.** Interim navigation points to `inspektionsdronare`. Planned handle: `public-safety-raddning` (requires approval).", "", "**Interim collections:** " + SEO.verticals.public_safety_rescue.interim_collections.map((h) => `\`${h}\``).join(", "), "", "**Recommended payloads:** " + SEO.verticals.public_safety_rescue.recommended_payloads.map((h) => `\`${h}\``).join(", "), "");

lines.push("", "---", "", "## 6. Product Tag Standards", "", "| Dimension | Format | Required | Example values |", "|---|---|:---:|---|");
for (const [dim, cfg] of Object.entries(TAGS.dimensions)) {
  const ex = cfg.examples || cfg.values?.enterprise || cfg.values || [];
  const exStr = Array.isArray(ex) ? ex.slice(0, 4).join(", ") : Object.values(cfg.values || {}).flat().slice(0, 4).join(", ");
  lines.push(`| \`${dim}\` | ${cfg.format || "kebab-case"} | ${cfg.required || cfg.required_for ? "✓" : ""} | ${exStr} |`);
}

lines.push("", "### Tag prefix convention", "", "```", "brand:dji", "family:matrice", "model:matrice-4", "payload:thermal", "industry:inspection", "compat:matrice-350-rtk", "```", "", "### Product type standards", "", "| Key | Shopify product_type |", "|---|---|");
for (const [k, v] of Object.entries(TAGS.product_type_standards)) {
  lines.push(`| ${k} | ${v} |`);
}

lines.push("", "---", "", "## 7. Navigation Structure", "");

function renderNavTree(items, depth = 0) {
  const out = [];
  for (const it of items || []) {
    out.push(`${"  ".repeat(depth)}- **${it.title}** → \`${it.url}\`${it.note ? ` _(${it.note})_` : ""}`);
    out.push(...renderNavTree(it.children, depth + 1));
  }
  return out;
}

for (const [key, menu] of Object.entries(NAV.menus)) {
  lines.push(`### ${menu.title} (\`${menu.handle}\`)`, "", "```");
  lines.push(...renderNavTree(menu.items));
  lines.push("```", "");
}

lines.push("---", "", "## 8. Collection-to-Menu Mapping", "", `**${uniqueMapping.length} collections** mapped to navigation paths.`, "", "| Collection | Menu | Path |", "|---|---|---|");
for (const row of uniqueMapping) {
  lines.push(`| \`${row.collection_handle}\` | \`${row.menu_handle}\` | ${esc(row.menu_path)} |`);
}

lines.push("", "---", "", "## 9. Implementation order (Phase 3 — not executed)", "", "1. **Tag backfill** — apply `edp-product-tag-standards.json` to new imports only", "2. **Rule migration** — update smart collections from `current_live` → `proposed` one family at a time", "3. **Industry SEO** — apply `edp-industry-seo-framework.json` descriptions to live vertical collections", "4. **Enterprise menu** — deploy expanded `enterprise-dr-nare` tree from `edp-navigation-structure.json`", "5. **Public Safety** — create collection or page after explicit approval", "6. **Validate** — re-run `collection-inventory-audit.mjs` and confirm product counts", "", "**Phase 2 complete. Awaiting approval to apply rules live.**", "");

writeFileSync(OUT, lines.join("\n"));
console.log(`Wrote ${OUT}`);
console.log(`Wrote ${MAP_OUT} (${uniqueMapping.length} mappings)`);
