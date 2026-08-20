#!/usr/bin/env node
/**
 * Read-only — generates MENU_CLEANUP_FINAL_REPORT.md from menu-cleanup-pass output.
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const IN = join(ROOT, ".menu-cleanup-audit.json");
const OUT = join(ROOT, "MENU_CLEANUP_FINAL_REPORT.md");

const TARGET_MENUS = [
  {
    target: "Main Menu",
    handle: "main-menu",
    proposed_handle: "main-menu",
    proposed_title: "Main Menu",
    source: "main-menu",
    action: "KEEP",
    notes: "Only menu linked in theme (`sections/header-group.json`). Slim down to consumer drones + top-level links; remove embedded spare-parts/enterprise trees.",
  },
  {
    target: "Enterprise Drones",
    handle: "enterprise-drones",
    proposed_handle: "enterprise-drones",
    proposed_title: "Enterprise Drones",
    source: "enterprise-expansion-deploy",
    action: "KEEP",
    notes: "Rename from `enterprise-expansion-deploy`. Merge useful links from legacy `enterprise-dr-nare`. Wire into header mega-menu.",
  },
  {
    target: "Spare Parts",
    handle: "spare-parts",
    proposed_handle: "spare-parts",
    proposed_title: "Spare Parts",
    source: "spare-parts-deploy",
    action: "KEEP",
    notes: "Rename from `spare-parts-deploy`. 47 items — production-ready model-family tree (PR49).",
  },
  {
    target: "Service & Support",
    handle: "service-support",
    proposed_handle: "service-support",
    proposed_title: "Service & Support",
    source: "service-support-deploy",
    action: "KEEP",
    notes: "Rename from `service-support-deploy`. 14 items incl. DJI service subtree.",
  },
  {
    target: "Partnership",
    handle: "partnership",
    proposed_handle: "partnership",
    proposed_title: "Partnership",
    source: "partnership",
    action: "KEEP",
    notes: "Canonical handle kept but menu is empty — repopulate from `/pages/partnerprogram` + apply pages.",
  },
  {
    target: "B2B Enterprise",
    handle: "b2b-enterprise",
    proposed_handle: "b2b-enterprise",
    proposed_title: "B2B Enterprise",
    source: "b2b-enterprise-deploy",
    action: "KEEP",
    notes: "Rename from `b2b-enterprise-deploy`. Industry verticals + account/quote/leasing pages.",
  },
  {
    target: "Footer Menu",
    handle: "footer",
    proposed_handle: "footer",
    proposed_title: "Footer Menu",
    source: "footer",
    action: "KEEP",
    notes: "Rename title from Sidfotsmeny. Expand beyond single All products link.",
  },
  {
    target: "Customer Account",
    handle: "customer-account-main-menu",
    proposed_handle: "customer-account-main-menu",
    proposed_title: "Customer Account",
    source: "customer-account-main-menu",
    action: "KEEP",
    notes: "Shopify customer account menu. Rename title from Swedish.",
  },
];

const PRODUCTION_SOURCES = new Set(TARGET_MENUS.map((t) => t.source));

const OVERRIDE_DELETE = new Set([
  "_test-menu-delete-me",
  "actionkameror",
  "dronare",
]);

const SWEDISH_TITLE =
  /(huvudmeny|sidfotsmeny|drönare|dronare|actionkameror|reservdelar|företag|för kundkonto|vandring|outdoor|bransch|tjänster|felsökning|reparation|kalibrering|garanti|serviceanmälan|offertförfrågan|företagskonto|utbildning|kartläggning|skogsbruk|jordbruk|energi|infrastruktur|tillbehör|värmekamera|väskor|propellrar|fjärrkontroller|batterier|filter|legacy)/i;

function mdTable(rows, cols) {
  if (!rows.length) return "_None._\n";
  const header = `| ${cols.join(" | ")} |`;
  const sep = `| ${cols.map(() => "---").join(" | ")} |`;
  const body = rows.map((r) => `| ${cols.map((c) => String(r[c] ?? "").replace(/\|/g, "\\|")).join(" | ")} |`);
  return [header, sep, ...body].join("\n") + "\n";
}

function classifyRow(row, decision) {
  const h = row.handle;
  if (PRODUCTION_SOURCES.has(h)) {
    const t = TARGET_MENUS.find((x) => x.source === h);
    return { group: "KEEP", reason: t?.notes || "Target production menu" };
  }
  if (h === "enterprise-dr-nare" || h === "meny") {
    return { group: "MERGE", reason: h === "meny" ? "Duplicate title of `main-menu` — consolidate" : "Merge into `enterprise-expansion-deploy` → `enterprise-drones`" };
  }
  if (OVERRIDE_DELETE.has(h)) {
    return { group: "DELETE", reason: "Legacy/test/duplicate — not in target production set" };
  }
  if (decision?.action === "delete") {
    return { group: "DELETE", reason: decision.reason };
  }
  if (h.endsWith("-deploy") && !PRODUCTION_SOURCES.has(h)) {
    return { group: "DELETE", reason: "Unexpected deploy artifact" };
  }
  if (row.is_migration_test || /^(actionkameror|dronare|partnership)-\d+$/i.test(h)) {
    return { group: "DELETE", reason: "Migration retry duplicate (PR49 menu limit fallout)" };
  }
  if (SWEDISH_TITLE.test(row.title) && row.item_count === 0) {
    return { group: "DELETE", reason: "Empty legacy Swedish menu" };
  }
  if (decision?.action === "keep") {
    return { group: "DELETE", reason: `Automated keep overridden — not in 8-menu production architecture (${decision.reason})` };
  }
  return { group: "DELETE", reason: decision?.reason || "Orphan" };
}

function referencedAnywhere(row) {
  return (
    row.referenced_by_theme ||
    row.in_source_migration ||
    row.is_default ||
    (row.item_count > 0 && !row.is_migration_test && !/^(actionkameror|dronare|partnership)-\d+$/i.test(row.handle))
  );
}

function main() {
  if (!existsSync(IN)) {
    console.error(`Missing ${IN} — run: node scripts/menu-cleanup-audit.mjs`);
    process.exit(1);
  }
  const audit = JSON.parse(readFileSync(IN, "utf8"));
  const inventory = audit.inventory || [];
  const decisions = new Map((audit.decisions || []).map((d) => [d.handle, d]));
  const summary = audit.summary || {};

  const rows = inventory.map((row) => {
    const decision = decisions.get(row.handle);
    const { group, reason } = classifyRow(row, decision);
    const swedish = SWEDISH_TITLE.test(row.title) || /[åäöÅÄÖ]/.test(row.title);
    return {
      menu_name: row.title,
      handle: row.handle,
      items: row.item_count,
      theme: row.referenced_by_theme ? "YES" : "NO",
      referenced: referencedAnywhere(row) ? "YES" : "NO",
      group,
      swedish_name: swedish ? "YES" : "NO",
      flags: [
        row.is_empty ? "empty" : null,
        row.is_orphan ? "orphan" : null,
        row.is_migration_test ? "migration-test" : null,
        row.in_source_migration ? "migration-db" : null,
        row.has_actionking_links ? "actionking" : null,
      ]
        .filter(Boolean)
        .join(", ") || "—",
      recommendation: reason,
    };
  });

  const keep = rows.filter((r) => r.group === "KEEP");
  const merge = rows.filter((r) => r.group === "MERGE");
  const rename = rows.filter(
    (r) => r.group === "KEEP" && (r.swedish_name === "YES" || r.handle.includes("-deploy")),
  );
  const del = rows.filter((r) => r.group === "DELETE");

  const activeMenus = rows.filter((r) => r.items > 0).length;
  const duplicateMenus = rows.filter((r) => /^(actionkameror|dronare|partnership)-\d+$/i.test(r.handle)).length + merge.length;
  const safeToDelete = del.filter((r) => r.theme === "NO").length;

  const lines = [
    "# MENU_CLEANUP_FINAL_REPORT",
    "",
    "**Store:** EuroDroneParts (`ya1xhg-x6.myshopify.com`)",
    "**Migration:** `3d9876af-885c-49e9-a4b0-c4943c06112f`",
    `**Generated:** ${new Date().toISOString()}`,
    "**Context:** Post-PR49 menu deploy audit (`menu-cleanup-pass`)",
    "**Mode:** READ ONLY — no menus deleted",
    "",
    "## Executive summary",
    "",
    "The store has **370 Shopify menus**. PR49 created four production-quality deploy menus (`*-deploy`) but **only `main-menu` is wired to the theme**. The header still uses a single Swedish mega-menu (`Huvudmeny`, 41 items) that duplicates content now split across deploy menus.",
    "",
    "### Counts",
    "",
    "| Metric | Count |",
    "|---|---:|",
    `| **Total menus** | ${rows.length} |`,
    `| **Active menus** (items > 0) | ${activeMenus} |`,
    `| **Duplicate menus** (numbered migration retries) | ${duplicateMenus} |`,
    `| **Safe-to-delete menus** (not theme-linked) | ${safeToDelete} |`,
    `| **Theme-linked menus** | ${rows.filter((r) => r.theme === "YES").length} |`,
    `| **Empty menus** | ${summary.empty_menus ?? rows.filter((r) => r.items === 0).length} |`,
    `| **Migration test menus** | ${summary.migration_test_menus ?? "—"} |`,
    `| **Target production menus** | 8 |`,
    `| **Recommended deletion list** | ${del.length} |`,
    "",
    "### Root cause (why structure looks wrong)",
    "",
    "1. **Menu limit retries** during ActionKing → EUDroneParts migration created **357 numbered duplicates** (`actionkameror-1…119`, `dronare-1…119`, `partnership-1…119`).",
    "2. **PR49 deploy menus** exist with correct IA but are **orphans** — not assigned in theme navigation.",
    "3. **`main-menu`** remains the only theme reference and still embeds consumer + enterprise + spare parts + accessories in one Swedish tree.",
    "4. **Legacy empty canonicals** (`actionkameror`, `dronare`, `partnership`, `meny`) were kept by dedup logic but have **0 items**.",
    "",
    "---",
    "",
    "## Target production architecture (8 menus)",
    "",
    mdTable(
      TARGET_MENUS.map((t) => ({
        target_menu: t.target,
        current_handle: t.source,
        proposed_handle: t.proposed_handle,
        proposed_title: t.proposed_title,
        action: t.action,
        notes: t.notes,
      })),
      ["target_menu", "current_handle", "proposed_handle", "proposed_title", "action", "notes"],
    ),
    "",
    "### Recommended header wiring (after cleanup)",
    "",
    "```",
    "Main Menu          → main-menu              (consumer drones, accessories entry points)",
    "Enterprise Drones  → enterprise-drones      (from enterprise-expansion-deploy)",
    "Spare Parts        → spare-parts            (from spare-parts-deploy)",
    "Service & Support  → service-support        (from service-support-deploy)",
    "Partnership        → partnership",
    "B2B Enterprise     → b2b-enterprise         (from b2b-enterprise-deploy)",
    "Footer Menu        → footer",
    "Customer Account   → customer-account-main-menu",
    "```",
    "",
    "---",
    "",
    "## SECTION 1 — Full menu inventory",
    "",
    "For every live menu:",
    "",
    mdTable(rows, [
      "menu_name",
      "handle",
      "items",
      "theme",
      "referenced",
      "swedish_name",
      "group",
      "flags",
      "recommendation",
    ]),
    "",
    "---",
    "",
    "## SECTION 2 — KEEP",
    "",
    `${keep.length} menus map to the production architecture:`,
    "",
    mdTable(keep, ["menu_name", "handle", "items", "theme", "referenced", "recommendation"]),
    "",
    "---",
    "",
    "## SECTION 3 — MERGE",
    "",
    mdTable(merge, ["menu_name", "handle", "items", "theme", "referenced", "recommendation"]),
    "",
    "---",
    "",
    "## SECTION 4 — RENAME",
    "",
    "Menus to keep but rename handle and/or title to English production names:",
    "",
    mdTable(
      [
        ...rename,
        ...TARGET_MENUS.filter((t) => t.source !== t.proposed_handle).map((t) => ({
          menu_name: inventory.find((i) => i.handle === t.source)?.title || t.source,
          handle: t.source,
          items: inventory.find((i) => i.handle === t.source)?.item_count ?? "—",
          theme: inventory.find((i) => i.handle === t.source)?.referenced_by_theme ? "YES" : "NO",
          referenced: "YES",
          proposed: `${t.proposed_handle} / "${t.proposed_title}"`,
          recommendation: t.notes,
        })),
      ],
      ["menu_name", "handle", "items", "theme", "referenced", "proposed", "recommendation"],
    ),
    "",
    "---",
    "",
    "## SECTION 5 — DELETE",
    "",
    `**${del.length} menus** recommended for deletion after rollback export and theme confirmation.`,
    "",
    "### Final deletion list (handles)",
    "",
    "```",
    ...del.map((r) => r.handle).sort(),
    "```",
    "",
    "### Deletion list (handle + title)",
    "",
    mdTable(
      del.map((r) => ({ handle: r.handle, menu_name: r.menu_name, items: r.items, theme: r.theme })),
      ["handle", "menu_name", "items", "theme"],
    ),
    "",
    "---",
    "",
    "## SECTION 6 — Issue breakdown",
    "",
    "### 1. Duplicate menus",
    "",
    "| Duplicate group | Canonical (automated) | Copies | Production recommendation |",
    "|---|---|---:|---|",
    '| Huvudmeny | `main-menu` | 1 (`meny`) | Keep `main-menu`, delete `meny` |',
    '| Actionkameror | `actionkameror` | 119 | Delete all — EUActionCam scope, not EDP |',
    '| Drönare | `dronare` | 119 | Delete all — legacy ActionKing retry artifacts |',
    '| Partnership | `partnership` | 119 | Keep single `partnership`, delete 119 empty copies |',
    "",
    "### 2. Empty menus",
    "",
    `${rows.filter((r) => r.items === 0).length} menus have 0 items. All are safe to delete except none are required for production.`,
    "",
    "### 3. Legacy menus",
    "",
    "| Handle | Title | Items | Notes |",
    "|---|---|---:|---|",
    "| `actionkameror` | Actionkameror | 0 | ActionKing action-camera scope |",
    "| `dronare` | Drönare | 0 | Legacy ActionKing drone menu |",
    "| `meny` | Huvudmeny | 0 | Duplicate main menu from migration |",
    "| `enterprise-dr-nare` | Enterprise Drönare | 7 | Superseded by `enterprise-expansion-deploy` |",
    "| `vandring-outdoor` | Vandring & outdoor | 0 | Not in current inventory — already pruned |",
    "",
    "### 4. Test menus",
    "",
    "| Handle | Title | Items |",
    "|---|---|---:|",
    "| `_test-menu-delete-me` | TEST Menu Delete | 1 |",
    "",
    "Plus **357** numbered `actionkameror-N`, `dronare-N`, `partnership-N` migration test menus.",
    "",
    "### 5. Menus with no active references",
    "",
    `${rows.filter((r) => r.referenced === "NO").length} menus are not referenced by theme, migration essentials, or meaningful content.`,
    "",
    "Notable orphans with content (PR49 deploy — should be **wired**, not deleted):",
    "",
    "| Handle | Title | Items |",
    "|---|---|---:|",
    "| `enterprise-expansion-deploy` | Enterprise Expansion | 9 |",
    "| `spare-parts-deploy` | Reservdelar | 47 |",
    "| `service-support-deploy` | Service & Support | 14 |",
    "| `b2b-enterprise-deploy` | Enterprise & B2B | 20 |",
    "",
    "### 6. Swedish menu names",
    "",
    `${rows.filter((r) => r.swedish_name === "YES").length} menus use Swedish titles. Production target uses English titles only.`,
    "",
    "| Current title | Handle | Target English title |",
    "|---|---|---|",
    "| Huvudmeny | main-menu | Main Menu |",
    "| Sidfotsmeny | footer | Footer Menu |",
    "| Huvudmeny för kundkonto | customer-account-main-menu | Customer Account |",
    "| Enterprise Drönare | enterprise-dr-nare | Enterprise Drones (merge then delete) |",
    "| Reservdelar | spare-parts-deploy | Spare Parts |",
    "",
    "### 7. Menus not linked from theme navigation",
    "",
    "Only **`main-menu`** is referenced in theme (`sections/header-group.json`).",
    "",
    "All PR49 deploy menus and footer are **not theme-linked** — this is the primary reason navigation appears incorrect.",
    "",
    "---",
    "",
    "## SECTION 7 — PR49 deploy menu content (production-ready)",
    "",
    "### `enterprise-expansion-deploy` → rename `enterprise-drones` (9 items)",
    "",
    "Matrice 300 RTK, Matrice 3D, Matrice 3TD, Mavic 3 Thermal, Agras T40/T50, FlyCart 30, Dock 2, Dock 3",
    "",
    "### `spare-parts-deploy` → rename `spare-parts` (47 items)",
    "",
    "Model-family spare parts trees: Mini 4 Pro, Air 3, Matrice 4, Matrice 350 RTK, Mavic 3 Enterprise, FlyCart 30 — each with propellers, batteries, motors, arms, cameras, gimbal, shells, landing gear, cables, antennas, sensors, accessories.",
    "",
    "### `service-support-deploy` → rename `service-support` (14 items)",
    "",
    "Service hub + DJI Service subtree (troubleshooting, repair, calibration, battery test, firmware, warranty, RMA, service request, support) + Enterprise/FlyCart/Matrice service pages.",
    "",
    "### `b2b-enterprise-deploy` → rename `b2b-enterprise` (20 items)",
    "",
    "Industry verticals (energy, wind, solar, grid, forestry, agriculture, mapping, construction, security/rescue, transport) + B2B services (business account, quote request, leasing, financing, service/support agreements, training, partner program).",
    "",
    "---",
    "",
    "## SECTION 8 — Safe execution order (not performed)",
    "",
    "1. Export rollback: `EURODRONEPARTS_MENU_CLEANUP_ROLLBACK.json` (already generated by SAFE audit).",
    "2. Rename 4 `*-deploy` menus to production handles.",
    "3. Repopulate empty `partnership` menu.",
    "4. Slim `main-menu` to consumer-focused links; link to dedicated menus.",
    "5. Assign all 8 menus in theme header/footer settings.",
    "6. Delete 362 orphan/duplicate menus via `node scripts/menu-cleanup-audit.mjs --execute --confirm-delete` (after review).",
    "",
    "## Data sources",
    "",
    "- `node scripts/menu-cleanup-audit.mjs` → `.menu-cleanup-audit.json`",
    "- `menu-cleanup-pass` edge function (deployed post-PR49)",
    "- Live Shopify Admin GraphQL via `test-integration`",
    "",
    "## Guardrails",
    "",
    "- **No deletion performed**",
    "- **No menu edits performed**",
    "- **No theme changes performed**",
    "",
  ];

  writeFileSync(OUT, lines.join("\n"), "utf8");
  console.log(`Wrote ${OUT}`);
  console.log(`total=${rows.length} keep=${keep.length} merge=${merge.length} delete=${del.length} active=${activeMenus}`);
}

main();
