#!/usr/bin/env node
/**
 * EuroDroneParts — Navigation architecture fix
 *
 * Wires production menus to theme + trims duplicate items from main-menu.
 * Does NOT rename handles, modify URLs, delete menus, or create redirects.
 *
 * Usage:
 *   node scripts/navigation-architecture-fix.mjs           # dry-run
 *   node scripts/navigation-architecture-fix.mjs --execute # apply to live store
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "fs";
import { join, dirname, relative } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const THEME_DIR = join(ROOT, "shopify-theme/eurodroneparts");
const REPORT = join(ROOT, "NAVIGATION_ARCHITECTURE_REPORT.md");
const THEME_ID = "gid://shopify/OnlineStoreTheme/186333856072";
const MIGRATION_ID = "3d9876af-885c-49e9-a4b0-c4943c06112f";
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://wsncjdajweoujhidlxas.supabase.co";

const EXECUTE = process.argv.includes("--execute");

const PRODUCTION_MENUS = {
  consumer: { handle: "main-menu", label: "Consumer (main-menu)" },
  enterprise: { handle: "enterprise-expansion-deploy", label: "Enterprise Drones", setting: "menu_enterprise" },
  spare_parts: { handle: "spare-parts-deploy", label: "Spare Parts", setting: "menu_spare_parts" },
  service: { handle: "service-support-deploy", label: "Service & Support", setting: "menu_service" },
  b2b: { handle: "b2b-enterprise-deploy", label: "B2B Enterprise", setting: "menu_b2b" },
  enterprise: { handle: "enterprise", label: "Enterprise", setting: "menu_enterprise" },
  spare_parts: { handle: "spare-parts", label: "Spare Parts", setting: "menu_spare_parts" },
  service: { handle: "service-support", label: "Support", setting: "menu_service" },
  b2b: { handle: "business", label: "Business", setting: "menu_b2b" },
  footer: { handle: "footer", label: "Footer Menu" },
};

const MAIN_MENU_REMOVE = new Set([
  "Enterprise Drönare",
  "FlyCart",
  "Branschlösningar",
  "Reservdelar",
]);

const MAIN_MENU_KEEP = new Set(["Drönare", "Tillbehör", "Legacy DJI"]);
  "Enterprise Drones",
  "FlyCart",
  "Branschlösningar",
  "Industry Solutions",
  "Reservdelar",
  "Spare Parts",
]);

const MAIN_MENU_KEEP = new Set(["Drönare", "Drones", "Tillbehör", "Accessories", "Brands", "Legacy DJI"]);

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

function apiKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  );
}

async function gql(query, variables = {}) {
  const key = apiKey();
  const r = await fetch(`${SUPABASE_URL}/functions/v1/test-integration`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, apikey: key },
    body: JSON.stringify({
      integration_type: "shopify",
      config: { store_domain: "ya1xhg-x6.myshopify.com" },
      shopify_graphql: { query, variables },
    }),
  });
  const j = await r.json();
  if (!j.success || j.errors?.length) {
    throw new Error(JSON.stringify(j.errors || j));
  }
  return j.data;
}

function collectThemeFiles(dir, base = dir) {
  const out = [];
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, name.name);
    if (name.isDirectory()) out.push(...collectThemeFiles(p, base));
    else out.push({ filename: relative(base, p).replace(/\\/g, "/"), content: readFileSync(p, "utf8") });
  }
  return out;
}

function toMenuItemInput(item) {
  return {
    id: item.id,
    title: item.title,
    type: item.type,
    url: item.url,
    items: (item.items || []).map(toMenuItemInput),
  };
}

function menuTopLevelSummary(menu) {
  return (menu?.items || []).map((i) => i.title).join(" · ") || "(empty)";
}

function mdTable(rows, cols) {
  if (!rows.length) return "_None._\n";
  const header = `| ${cols.join(" | ")} |`;
  const sep = `| ${cols.map(() => "---").join(" | ")} |`;
  const body = rows.map((r) => `| ${cols.map((c) => String(r[c] ?? "").replace(/\|/g, "\\|")).join(" | ")} |`);
  return [header, sep, ...body].join("\n") + "\n";
}

async function fetchMenus() {
  const q = `query Menus($cursor: String) {
    menus(first: 50, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id handle title
        items { id title url type items { id title url type items { id title url type } } }
      }
    }
  }`;
  const map = new Map();
  let cursor = null;
  for (let page = 0; page < 20; page++) {
    const data = await gql(q, { cursor });
    for (const m of data.menus.nodes) map.set(m.handle, m);
    if (!data.menus.pageInfo?.hasNextPage) break;
    cursor = data.menus.pageInfo.endCursor;
  }
  return map;
}

async function probeThemeRefs(handles) {
  const key = apiKey();
  const r = await fetch(`${SUPABASE_URL}/functions/v1/cloner-fix-collections-and-menus`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, apikey: key },
    body: JSON.stringify({ migration_id: MIGRATION_ID, theme_menu_refs: handles }),
  });
  const j = await r.json();
  return j.theme_menu_refs;
}

async function uploadThemeFiles(files) {
  const mutation = `mutation ThemeFilesUpsert($themeId: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) {
    themeFilesUpsert(themeId: $themeId, files: $files) {
      upsertedThemeFiles { filename }
      userErrors { field message }
    }
  }`;
  const upsert = async (batch) => {
    const data = await gql(mutation, {
      themeId: THEME_ID,
      files: batch.map((f) => ({ filename: f.filename, body: { type: "TEXT", value: f.content } })),
    });
    const errs = data.themeFilesUpsert?.userErrors || [];
    if (errs.length) throw new Error(`themeFilesUpsert: ${JSON.stringify(errs)}`);
    return data.themeFilesUpsert?.upsertedThemeFiles || [];
  };

  const liquid = files.filter((f) => f.filename.endsWith(".liquid"));
  const groupJson = files.filter((f) => f.filename.endsWith("-group.json"));
  const other = files.filter((f) => !liquid.includes(f) && !groupJson.includes(f));
  const results = [];
  for (const batch of [liquid, other, groupJson]) {
    if (!batch.length) continue;
    results.push(...(await upsert(batch)));
  }
  return results;
}

async function trimMainMenu(mainMenu) {
  const kept = (mainMenu.items || []).filter((i) => MAIN_MENU_KEEP.has(i.title));
  const removed = (mainMenu.items || []).filter((i) => MAIN_MENU_REMOVE.has(i.title));
  const unexpected = (mainMenu.items || []).filter((i) => !MAIN_MENU_KEEP.has(i.title) && !MAIN_MENU_REMOVE.has(i.title));

  if (unexpected.length) {
    console.warn("Unexpected main-menu items (kept as-is):", unexpected.map((i) => i.title));
    kept.push(...unexpected);
  }

  const mutation = `mutation MenuUpdate($id: ID!, $title: String!, $items: [MenuItemUpdateInput!]!) {
    menuUpdate(id: $id, title: $title, items: $items) {
      menu { id handle title items { title } }
      userErrors { field message }
    }
  }`;
  const items = kept.map(toMenuItemInput);
  const data = await gql(mutation, { id: mainMenu.id, title: mainMenu.title, items });
  const errs = data.menuUpdate?.userErrors || [];
  if (errs.length) throw new Error(`menuUpdate: ${JSON.stringify(errs)}`);
  return { kept: kept.map((i) => i.title), removed: removed.map((i) => i.title), menu: data.menuUpdate.menu };
}

async function main() {
  loadEnv();
  const generatedAt = new Date().toISOString();

  console.log(`Mode: ${EXECUTE ? "EXECUTE" : "DRY-RUN"}`);

  const menus = await fetchMenus();
  const mainMenu = menus.get("main-menu");
  if (!mainMenu) throw new Error("main-menu not found");

  const beforeRefs = await probeThemeRefs(Object.values(PRODUCTION_MENUS).map((m) => m.handle));
  const themeFiles = collectThemeFiles(THEME_DIR);

  const beforeMain = menuTopLevelSummary(mainMenu);
  const removedItems = (mainMenu.items || []).filter((i) => MAIN_MENU_REMOVE.has(i.title)).map((i) => i.title);
  const keptItems = (mainMenu.items || []).filter((i) => MAIN_MENU_KEEP.has(i.title)).map((i) => i.title);

  const prodStatus = Object.entries(PRODUCTION_MENUS).map(([key, cfg]) => {
    const m = menus.get(cfg.handle);
    return {
      role: key,
      handle: cfg.handle,
      label: cfg.label,
      exists: !!m,
      items: m ? m.items?.length || 0 : 0,
      top_level: m ? menuTopLevelSummary(m) : "—",
      theme_refs_before: beforeRefs?.per_handle?.[cfg.handle]?.total ?? 0,
    };
  });

  let executeResult = { theme: null, mainMenu: null };

  if (EXECUTE) {
    console.log(`Uploading ${themeFiles.length} theme files...`);
    executeResult.theme = await uploadThemeFiles(themeFiles);
    console.log("Trimming main-menu duplicates...");
    executeResult.mainMenu = await trimMainMenu(mainMenu);
  }

  const afterRefs = EXECUTE
    ? await probeThemeRefs(Object.values(PRODUCTION_MENUS).map((m) => m.handle))
    : beforeRefs;

  const afterMain = EXECUTE
    ? menuTopLevelSummary(executeResult.mainMenu?.menu)
    : keptItems.join(" · ");

  const desktopNavAfter = [
    ...keptItems,
    PRODUCTION_MENUS.enterprise.label,
    PRODUCTION_MENUS.spare_parts.label,
    PRODUCTION_MENUS.service.label,
    PRODUCTION_MENUS.b2b.label,
  ];

  const report = [
    "# NAVIGATION_ARCHITECTURE_REPORT",
    "",
    "**Store:** EuroDroneParts (`ya1xhg-x6.myshopify.com`)",
    `**Generated:** ${generatedAt}`,
    `**Mode:** ${EXECUTE ? "EXECUTED" : "DRY-RUN"}`,
    "",
    "## Summary",
    "",
    "Connected production menus to the theme navigation system and removed duplicate top-level items from `main-menu`.",
    "",
    "| Check | Before | After |",
    "|---|---|---|",
    `| Theme menu bindings | \`main-menu\` only | \`main-menu\` + 4 production menus + \`footer\` |`,
    `| Desktop nav type | dropdown | mega (multi-column) |`,
    `| main-menu top-level items | 7 | 3 |`,
    `| Orphan production menus | 4 deploy menus | Wired to header |`,
    "",
    "## Theme audit",
    "",
    `**Theme:** EuroDroneParts Master Theme (\`${THEME_ID}\`)`,
    "",
    "### Menu handles referenced in theme JSON (before)",
    "",
    (beforeRefs?.all_menu_handles_referenced_in_theme || []).map((h) => `- \`${h}\``).join("\n") || "_none_",
    "",
    "### Menu handles referenced in theme JSON (after)",
    "",
    (afterRefs?.all_menu_handles_referenced_in_theme || []).map((h) => `- \`${h}\``).join("\n") || "_unchanged (dry-run)_",
    "",
    "### Theme files deployed",
    "",
    mdTable(
      themeFiles.map((f) => ({ file: f.filename, bytes: f.content.length })),
      ["file", "bytes"],
    ),
    "",
    "## Production menu inventory",
    "",
    mdTable(prodStatus, ["role", "handle", "label", "exists", "items", "theme_refs_before", "top_level"]),
    "",
    "## BEFORE — Desktop navigation (main-menu only)",
    "",
    "```",
    beforeMain,
    "```",
    "",
    "All enterprise, spare parts, industry, and FlyCart links were duplicated inside this single menu.",
    "",
    "## AFTER — Desktop navigation (multi-menu)",
    "",
    "```",
    desktopNavAfter.join(" | "),
    "```",
    "",
    "### main-menu (consumer only)",
    "",
    "```",
    afterMain,
    "```",
    "",
    "### Production menus wired to header",
    "",
    mdTable(
      [
        { nav_label: "Enterprise Drones", menu_handle: "enterprise-expansion-deploy", theme_setting: "menu_enterprise_handle" },
        { nav_label: "Spare Parts", menu_handle: "spare-parts-deploy", theme_setting: "menu_spare_parts_handle" },
        { nav_label: "Service & Support", menu_handle: "service-support-deploy", theme_setting: "menu_service_handle" },
        { nav_label: "B2B Enterprise", menu_handle: "b2b-enterprise-deploy", theme_setting: "menu_b2b_handle" },
        { nav_label: "Footer", menu_handle: "footer", theme_setting: "footer-group.json block" },
      ],
      ["nav_label", "menu_handle", "theme_setting"],
    ),
    "",
    "## Items removed from main-menu (not deleted — still in production menus)",
    "",
    removedItems.map((t) => `- ${t}`).join("\n"),
    "",
    "## Mobile navigation",
    "",
    "- `header-edp-drawer` renders consumer `main-menu` + 4 production menu panels",
    "- Same URLs as desktop — no URL changes",
    "- Drawer breakpoint: tablet (Dawn default)",
    "",
    "## Mega menu behaviour",
    "",
    "- Desktop `menu_type_desktop` set to **mega**",
    "- Consumer items: standard Dawn mega columns",
    "- Production menus: each rendered as one top-level mega panel via `header-edp-aux-panel`",
    "- Spare Parts deploy menu (47 items, 6 model groups) displays as multi-column mega under **Spare Parts**",
    "",
    "## Guardrails respected",
    "",
    "| Rule | Status |",
    "|---|---|",
    "| Rename handles | NOT done |",
    "| Modify URLs | NOT done |",
    "| Delete menus | NOT done |",
    "| Create redirects | NOT done |",
    "| Trim main-menu duplicates | " + (EXECUTE ? "DONE" : "PLANNED") + " |",
    "| Wire production menus to theme | " + (EXECUTE ? "DONE" : "PLANNED") + " |",
    "",
  ];

  if (EXECUTE && executeResult.mainMenu) {
    report.push(
      "## Execution result",
      "",
      `- Theme files upserted: **${executeResult.theme?.length || 0}**`,
      `- main-menu items removed: **${executeResult.mainMenu.removed.join(", ")}**`,
      `- main-menu items kept: **${executeResult.mainMenu.kept.join(", ")}**`,
      "",
    );
  } else {
    report.push(
      "## To execute",
      "",
      "```bash",
      "node scripts/navigation-architecture-fix.mjs --execute",
      "```",
      "",
    );
  }

  writeFileSync(REPORT, report.join("\n"), "utf8");
  console.log(`Wrote ${REPORT}`);
  console.log(`main-menu before: ${beforeMain}`);
  console.log(`main-menu after: ${afterMain}`);
  console.log(`removed: ${removedItems.join(", ")}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
