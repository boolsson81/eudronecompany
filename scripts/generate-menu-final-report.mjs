#!/usr/bin/env node
/**
 * Generate MENU_CLEANUP_FINAL_REPORT.md from live audit JSON (read-only).
 */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const audit = JSON.parse(readFileSync(join(ROOT, ".menu-cleanup-audit.json"), "utf8"));

const TARGETS = [
  { name: "Main Menu", handle: "main-menu", rename: "Main Menu" },
  { name: "Enterprise Drones", handle: "enterprise-dr-nare", merge: "enterprise-expansion-deploy", rename: "Enterprise Drones" },
  { name: "Spare Parts", handle: "spare-parts-deploy", rename: "Spare Parts" },
  { name: "Service & Support", handle: "service-support-deploy", rename: "Service & Support" },
  { name: "Partnership", handle: "partnership", rename: "Partnership" },
  { name: "B2B Enterprise", handle: "b2b-enterprise-deploy", rename: "B2B Enterprise" },
  { name: "Footer Menu", handle: "footer", rename: "Footer Menu" },
  { name: "Customer Account", handle: "customer-account-main-menu", rename: "Customer Account" },
];

const PRODUCTION_HANDLES = new Set([
  ...TARGETS.map((t) => t.handle),
  "enterprise-expansion-deploy",
]);

function parseTopItems(fp, max = 12) {
  if (!fp) return "(empty)";
  const tops = [];
  for (const seg of fp.split("];")) {
    const m = seg.match(/(?:^|])?([^|[\]]+)\|/);
    if (m) {
      const t = m[1].trim();
      if (t && !tops.includes(t)) tops.push(t);
    }
  }
  if (!tops.length) return fp.slice(0, 100) + "...";
  const rest = tops.length > max ? ` (+${tops.length - max} more)` : "";
  return tops.slice(0, max).join(", ") + rest;
}

function classifyMenu(m, dec) {
  if (PRODUCTION_HANDLES.has(m.handle)) {
    if (m.handle === "enterprise-expansion-deploy") return "MERGE";
    if (m.handle === "meny") return "DELETE";
    if (["actionkameror", "dronare"].includes(m.handle)) return "DELETE";
    if (m.handle === "_test-menu-delete-me") return "DELETE";
    return "KEEP";
  }
  if (m.handle === "meny") return "DELETE";
  if (m.is_migration_test || /-(?:\d+)$/.test(m.handle)) return "DELETE";
  if (/test/i.test(m.handle) || /test/i.test(m.title)) return "DELETE";
  if (["actionkameror", "dronare"].includes(m.handle) && m.item_count === 0) return "DELETE";
  if (dec?.action === "delete") return "DELETE";
  return dec?.action === "keep" ? "KEEP" : "DELETE";
}

const inv = [...audit.inventory].sort((a, b) => a.handle.localeCompare(b.handle));
const decMap = new Map((audit.decisions || []).map((d) => [d.handle, d]));

const classified = inv.map((m) => ({
  ...m,
  decision: classifyMenu(m, decMap.get(m.handle)),
  referenced:
    m.referenced_by_theme || m.in_source_migration
      ? m.referenced_by_theme
        ? "theme + migration"
        : "migration DB"
      : "none",
}));

const toDelete = classified.filter((m) => m.decision === "DELETE");
const toKeep = classified.filter((m) => m.decision === "KEEP");
const toMerge = classified.filter((m) => m.decision === "MERGE");
const toRename = TARGETS.filter((t) => {
  const m = inv.find((x) => x.handle === t.handle);
  return m && t.rename && m.title !== t.rename;
});

const withItems = inv.filter((m) => m.item_count > 0);
const empty = inv.filter((m) => m.is_empty);
const themeLinked = inv.filter((m) => m.referenced_by_theme);
const testMenus = inv.filter((m) => /test/i.test(m.handle) || /test/i.test(m.title));
const swedish = inv.filter((m) => /[åäöÅÄÖ]/.test(m.title));
const legacy = inv.filter((m) =>
  ["actionkameror", "dronare", "meny", "vandring-outdoor"].includes(m.handle)
);
const dupGroups = audit.integrity?.duplicate_titles || [];
const dupMenuCount = dupGroups.reduce((s, g) => s + g.handles.length - 1, 0);

const L = [];
const push = (s = "") => L.push(s);

push("# EuroDroneParts — Menu Cleanup Final Report");
push("");
push(`**Generated:** ${new Date().toISOString()}`);
push("**Store:** ya1xhg-x6.myshopify.com (Europe Drone Parts)");
push("**Migration:** `3d9876af-885c-49e9-a4b0-c4943c06112f`");
push("**Audit source:** Live Shopify GraphQL + theme asset scan via `menu-cleanup-pass` (post-PR49)");
push("**Mode:** READ ONLY — no menus deleted");
push("");
push("---");
push("");
push("## Executive summary");
push("");
push(
  "Post-PR49, the store has **217 menus** instead of the **8 production menus** required. A migration retry loop created **204 numbered duplicate menus** (`actionkameror-N`, `dronare-N`, `partnership-N`) when Shopify rejected publishes at the menu slot limit. PR49 successfully deployed `menu-cleanup-pass` with theme probing and added five `*-deploy` submenus with real content, but only **`main-menu`** is wired into the live theme.",
);
push("");
push("| Metric | Count |");
push("| --- | ---: |");
push(`| **Total menus** | ${inv.length} |`);
push(`| **Active menus** (items > 0) | ${withItems.length} |`);
push(`| **Theme-linked menus** | ${themeLinked.length} |`);
push(`| **Duplicate menus** (non-canonical copies) | ${dupMenuCount} |`);
push(`| **Safe-to-delete menus** | ${toDelete.length} |`);
push(`| **Target production menus** | 8 |`);
push("");
push("---");
push("");
push("## Findings");
push("");
push("### 1. Duplicate menus (4 title groups, 209 extra copies)");
for (const g of dupGroups) {
  push(`- **${g.title}** — ${g.handles.length} menus; canonical: \`${g.handles[0]}\``);
}
push("");
push("### 2. Empty menus");
push(`**${empty.length}** menus have zero items (${audit.summary?.migration_test_menus ?? 204} migration-test artifacts).`);
push("");
push("### 3. Legacy menus");
push("| Handle | Title | Items | Status |");
push("| --- | --- | ---: | --- |");
for (const h of ["actionkameror", "dronare", "meny", "partnership", "vandring-outdoor"]) {
  const m = inv.find((x) => x.handle === h);
  if (m) push(`| \`${m.handle}\` | ${m.title} | ${m.item_count} | Legacy ActionKing / empty |`);
  else push(`| \`${h}\` | — | — | Not on live store |`);
}
push("");
push("### 4. Test menus");
for (const m of testMenus) push(`- \`${m.handle}\` — **${m.title}** (${m.item_count} item(s))`);
push("");
push("### 5. Menus with no active references");
push(`**${inv.filter((m) => !m.referenced_by_theme && !m.in_source_migration).length}** menus have no theme reference and no migration DB row.`);
push("");
push("### 6. Swedish menu names");
push(`${swedish.length} menus use Swedish titles. Production menus needing English rename:`);
for (const t of toRename) {
  const m = inv.find((x) => x.handle === t.handle);
  push(`- \`${t.handle}\`: "${m?.title}" → **${t.rename}**`);
}
push("");
push("### 7. Menus not linked from theme navigation");
push("Only `main-menu` is referenced in `sections/header-group.json`. Footer, customer account, and all `*-deploy` menus are orphaned from theme navigation.");
push("");
push("---");
push("");
push("## Target production architecture");
push("");
push("| Production menu | Handle | Current title | Items | Theme | Action |");
push("| --- | --- | --- | ---: | --- | --- |");
for (const t of TARGETS) {
  const m = inv.find((x) => x.handle === t.handle);
  const alt = t.merge ? inv.find((x) => x.handle === t.merge) : null;
  const items = m?.item_count ?? 0;
  const altNote = alt ? ` + merge \`${alt.handle}\` (${alt.item_count})` : "";
  push(
    `| ${t.name} | \`${t.handle}\` | ${m?.title ?? "—"}${altNote} | ${items}${alt ? `+${alt.item_count}` : ""} | ${m?.referenced_by_theme ? "YES" : "NO"} | ${alt ? "MERGE + RENAME" : items === 0 && t.name === "Partnership" ? "REBUILD" : "KEEP + RENAME"} |`,
  );
}
push("");
push("---");
push("");
push("## Grouped recommendations");
push("");
push("### KEEP (8 production menus after cleanup)");
for (const t of TARGETS) {
  const m = inv.find((x) => x.handle === t.handle);
  push(`- **${t.name}** — \`${t.handle}\` (${m?.item_count ?? 0} items)`);
}
push("");
push("### MERGE");
push("- `meny` → `main-menu` (empty duplicate of Huvudmeny)");
push("- `enterprise-expansion-deploy` (9 items) → `enterprise-dr-nare` (7 items) → single **Enterprise Drones** menu");
push("- `partnership` is empty — rebuild content from migration source (all 69 partnership copies are empty)");
push("");
push("### RENAME");
for (const t of toRename) {
  const m = inv.find((x) => x.handle === t.handle);
  push(`- \`${t.handle}\`: "${m?.title}" → "${t.rename}"`);
}
push("- Remove `-deploy` suffix from handles after theme wiring (`spare-parts-deploy` → `spare-parts`, etc.)");
push("");
push("### DELETE (" + toDelete.length + " menus — NOT executed)");
push("");
push("Categories:");
push(`- Migration-test numbered duplicates: ${toDelete.filter((m) => m.is_migration_test).length}`);
push(`- Legacy empty (actionkameror, dronare, meny): ${toDelete.filter((m) => ["actionkameror", "dronare", "meny"].includes(m.handle)).length}`);
push(`- Test menu: ${toDelete.filter((m) => /test/i.test(m.handle)).length}`);
push(`- Post-merge orphan: enterprise-expansion-deploy (after merge into enterprise-dr-nare)`);
push("");
push("---");
push("");
push("## Complete menu inventory (all 217 menus)");
push("");
push("| # | Menu name | Handle | Items | Used by theme? | Referenced anywhere? | Decision |");
push("| ---: | --- | --- | ---: | --- | --- | --- |");
classified.forEach((m, i) => {
  push(
    `| ${i + 1} | ${m.title} | \`${m.handle}\` | ${m.item_count} | ${m.referenced_by_theme ? "YES" : "NO"} | ${m.referenced === "none" ? "NO" : "YES"} | ${m.decision} |`,
  );
});
push("");
push("---");
push("");
push("## Production menu item detail");
push("");
for (const t of TARGETS) {
  const m = inv.find((x) => x.handle === t.handle);
  if (!m || m.item_count === 0) {
    push(`### ${t.name} (\`${t.handle}\`)`);
    push("");
    push("**Items:** (empty — content must be rebuilt)");
    push("");
    continue;
  }
  push(`### ${t.name} (\`${m.handle}\`)`);
  push("");
  push(`**Items (${m.item_count}):** ${parseTopItems(m.structure_fingerprint)}`);
  if (m.theme_reference_locations?.length) {
    push("");
    push(`**Theme:** ${m.theme_reference_locations.join(", ")}`);
  }
  push("");
}
const alt = inv.find((x) => x.handle === "enterprise-expansion-deploy");
if (alt) {
  push(`### Enterprise Expansion (merge into Enterprise Drones)`);
  push("");
  push(`**Items (${alt.item_count}):** ${parseTopItems(alt.structure_fingerprint)}`);
  push("");
}
push("---");
push("");
push("## Final deletion list");
push("");
push("> **DO NOT DELETE** until theme navigation is updated. Rollback: `EURODRONEPARTS_MENU_CLEANUP_ROLLBACK.json`");
push("");
push(`**${toDelete.length} handles** recommended for deletion:`);
push("");
push("```text");
for (const m of toDelete) {
  push(`${m.handle}  # ${m.title}`);
}
push("```");
push("");
push("### Menus to retain after cleanup (12 → consolidate to 8)");
push("");
for (const m of [...toKeep, ...toMerge]) {
  push(`- \`${m.handle}\` — ${m.title} (${m.item_count} items)`);
}
push("");
push("After merge/rename/delete, target state: **8 production menus**.");
push("");
push("---");
push("");
push("## Recommended next steps");
push("");
push("1. Wire theme navigation to production handles (header, footer, mega-menu sections)");
push("2. Merge `enterprise-expansion-deploy` into `enterprise-dr-nare`");
push("3. Rebuild empty `partnership` menu content");
push("4. Rename Swedish titles and remove `-deploy` handle suffixes");
push("5. Execute cleanup: `node scripts/menu-cleanup-audit.mjs --execute --confirm-delete`");
push("6. Verify: store should show **8 menus**");
push("");
push("---");
push("");
push("*Read-only audit. No Shopify mutations performed.*");

writeFileSync(join(ROOT, "MENU_CLEANUP_FINAL_REPORT.md"), L.join("\n"));
console.log("Wrote MENU_CLEANUP_FINAL_REPORT.md");
console.log({ total: inv.length, delete: toDelete.length, keep: toKeep.length, merge: toMerge.length });
