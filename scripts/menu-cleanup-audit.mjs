#!/usr/bin/env node
/**
 * EuroDroneParts — Shopify Menu Cleanup & Deduplication
 *
 * SAFE MODE (default): full audit, inventory, duplicate detection, rollback file.
 * No menus are deleted until you explicitly run with --execute --confirm-delete.
 *
 * Usage:
 *   node scripts/menu-cleanup-audit.mjs
 *   node scripts/menu-cleanup-audit.mjs --execute --confirm-delete   # destructive
 */
import { readFileSync, existsSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPORT = join(ROOT, "EURODRONEPARTS_MENU_CLEANUP_AUDIT.md");
const ROLLBACK = join(ROOT, "EURODRONEPARTS_MENU_CLEANUP_ROLLBACK.json");
const JSON_OUT = join(ROOT, ".menu-cleanup-audit.json");
const MIGRATION_ID = process.env.MIGRATION_ID || "3d9876af-885c-49e9-a4b0-c4943c06112f";
const SUPABASE_URL =
  process.env.CLONER_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "https://jzqgwsryxmgzcbjjddic.supabase.co";

const EXECUTE = process.argv.includes("--execute");
const CONFIRM_DELETE = process.argv.includes("--confirm-delete");

const MENUS_GQL = `
  query MenusPage($cursor: String) {
    menus(first: 50, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id handle title isDefault
        items { id title url type items { id title url type items { id title url type } } }
      }
    }
  }
`;

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

async function post(fn, body) {
  const key = apiKey();
  if (!key) throw new Error("Missing Supabase key in .env");
  const r = await fetch(`${SUPABASE_URL}/functions/v1/${fn}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      apikey: key,
    },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { error: text.slice(0, 500) };
  }
  return { status: r.status, json, text };
}

async function fetchMenusViaGraphql() {
  const all = [];
  let cursor = null;
  for (let page = 0; page < 30; page++) {
    const { status, json } = await post("test-integration", {
      integration_type: "shopify",
      config: { store_domain: "ya1xhg-x6.myshopify.com", access_token: "***configured***" },
      shopify_graphql: { query: MENUS_GQL, variables: { cursor } },
    });
    if (!json?.data?.menus) return null;
    all.push(...(json.data.menus.nodes || []));
    if (!json.data.menus.pageInfo?.hasNextPage) break;
    cursor = json.data.menus.pageInfo.endCursor;
  }
  return all;
}

function countItems(items) {
  let n = 0;
  for (const it of items || []) {
    n += 1;
    if (it.items?.length) n += countItems(it.items);
  }
  return n;
}

function fingerprint(items) {
  const walk = (nodes) =>
    (nodes || [])
      .map((it) => `${it.title}|${it.type}|${it.url}:[${walk(it.items)}]`)
      .join(";");
  return walk(items);
}

function buildInterimAudit(liveMenus, migrationMenus) {
  const titleGroups = new Map();
  for (const m of liveMenus) {
    const t = String(m.title || "").toLowerCase();
    titleGroups.set(t, [...(titleGroups.get(t) || []), m]);
  }
  const duplicates = [...titleGroups.entries()].filter(([, g]) => g.length > 1);

  const inventory = liveMenus.map((m) => ({
    id: m.id,
    title: m.title,
    handle: m.handle,
    item_count: countItems(m.items),
    is_default: !!m.isDefault,
    date_created_note: `ID ${String(m.id).replace(/\D/g, "")} (Shopify Menu API has no createdAt)`,
    structure_fingerprint: fingerprint(m.items),
  }));

  const lines = [];
  lines.push("# EuroDroneParts — Menu Cleanup Audit (SAFE MODE)");
  lines.push("");
  lines.push(`**Generated:** ${new Date().toISOString()}`);
  lines.push(`**Target:** ya1xhg-x6.myshopify.com`);
  lines.push(`**Migration:** \`${MIGRATION_ID}\``);
  lines.push(`**Mode:** SAFE — no deletions performed`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`| Metric | Value |`);
  lines.push(`| --- | ---: |`);
  lines.push(`| Live menus on target | ${liveMenus.length} |`);
  lines.push(`| Duplicate title groups | ${duplicates.length} |`);
  lines.push(`| Empty menus | ${inventory.filter((m) => m.item_count === 0).length} |`);
  lines.push(`| Migration menus (DB pass) | ${migrationMenus?.length ?? "—"} |`);
  lines.push("");
  if (duplicates.length) {
    lines.push("## Duplicate titles detected");
    lines.push("");
    for (const [title, group] of duplicates) {
      lines.push(`### "${title}" (${group.length} menus)`);
      lines.push("");
      lines.push("| Handle | ID | Items | Default |");
      lines.push("| --- | --- | ---: | --- |");
      for (const m of group) {
        lines.push(`| \`${m.handle}\` | \`${m.id}\` | ${countItems(m.items)} | ${m.isDefault ? "yes" : "no"} |`);
      }
      lines.push("");
    }
  }
  lines.push("## Full inventory");
  lines.push("");
  lines.push("| ID | Title | Handle | Items | Default |");
  lines.push("| --- | --- | --- | ---: | --- |");
  for (const m of inventory.sort((a, b) => a.handle.localeCompare(b.handle))) {
    lines.push(`| \`${m.id}\` | ${m.title} | \`${m.handle}\` | ${m.item_count} | ${m.is_default ? "yes" : "no"} |`);
  }
  lines.push("");
  lines.push("## Menus to keep / delete (preliminary)");
  lines.push("");
  lines.push("> Full canonical decisions require `menu-cleanup-pass` deploy on the cloner data project.");
  lines.push("> Review duplicate groups above — keep theme-linked / most complete menu per title.");
  lines.push("");
  for (const [title, group] of duplicates) {
    const sorted = [...group].sort((a, b) => countItems(b.items) - countItems(a.items));
    const keep = sorted[0];
    lines.push(`- **Keep** \`${keep.handle}\` (${countItems(keep.items)} items) — canonical for title "${title}"`);
    for (const m of sorted.slice(1)) {
      if (m.isDefault) {
        lines.push(`- **Keep** \`${m.handle}\` — default menu (cannot delete)`);
      } else {
        lines.push(`- **Delete candidate** \`${m.handle}\` — duplicate of \`${keep.handle}\``);
      }
    }
  }
  lines.push("");
  lines.push("## Integrity (preliminary)");
  lines.push("");
  const dupHandles = inventory.length !== new Set(inventory.map((m) => m.handle)).size;
  lines.push(`- Duplicate handles: ${dupHandles ? "FAIL" : "PASS"}`);
  lines.push(`- Duplicate titles among live menus: ${duplicates.length ? `FAIL (${duplicates.length} groups)` : "PASS"}`);
  lines.push(`- ActionKing / broken link scan: run full \`menu-cleanup-pass\` after deploy`);
  lines.push("");
  lines.push("**Final status:** PENDING — deploy cloner functions to \`jzqgwsryxmgzcbjjddic\`, then re-run for PASS/FAIL.");
  return {
    ok: true,
    mode: "safe",
    generated_at: new Date().toISOString(),
    interim: true,
    inventory,
    duplicate_title_groups: duplicates.map(([title, group]) => ({
      title,
      handles: group.map((m) => m.handle),
    })),
    markdown: lines.join("\n"),
    summary: {
      menus_before: liveMenus.length,
      menus_after: liveMenus.length,
      menus_to_delete: 0,
      menus_to_keep: liveMenus.length,
      duplicate_title_groups: duplicates.length,
    },
    rollback: [],
    confirmation_required: duplicates.length > 0,
  };
}

async function invokeFullCleanup(body) {
  for (const fn of ["menu-cleanup-pass", "shopify-cloner-worker"]) {
    const payload =
      fn === "shopify-cloner-worker"
        ? { action: "menu_cleanup_pass", migration_id: MIGRATION_ID, ...body }
        : { migration_id: MIGRATION_ID, ...body };
    const { status, json, text } = await post(fn, payload);
    if (status === 404) continue;
    if (json.ok !== false && json.inventory) return json;
    if (json.ok !== false && json.action === "menu_cleanup_pass" && json.inventory) return json;
    if (status !== 404) throw new Error(`${fn} ${status}: ${json.error || text.slice(0, 400)}`);
  }
  throw new Error("menu-cleanup-pass not deployed");
}

async function main() {
  loadEnv();
  const mode = EXECUTE ? "execute" : "safe";
  console.log(`Menu cleanup — ${mode.toUpperCase()} MODE (${SUPABASE_URL})`);

  if (EXECUTE && !CONFIRM_DELETE) {
    console.error("Refusing to delete menus without --confirm-delete. Run SAFE MODE first.");
    process.exit(1);
  }

  let result;
  try {
    result = await invokeFullCleanup({ mode, confirm_delete: CONFIRM_DELETE });
    console.log("Used full menu-cleanup-pass");
  } catch (e) {
    console.warn(`Full cleanup unavailable (${e.message}) — trying fallbacks…`);
    let liveMenus = null;

    const list = await post("cloner-fix-collections-and-menus", {
      migration_id: MIGRATION_ID,
      list_all_menus: true,
    });
    if (list.json?.all_target_menus?.length) {
      liveMenus = list.json.all_target_menus.map((m) => ({
        id: m.id,
        handle: m.handle,
        title: m.title,
        isDefault: m.is_default,
        items: [],
      }));
      console.log(`Listed ${liveMenus.length} menus via list_all_menus`);
    }

    if (!liveMenus?.length) {
      const gqlMenus = await fetchMenusViaGraphql();
      if (gqlMenus?.length) {
        liveMenus = gqlMenus;
        console.log(`Listed ${liveMenus.length} menus via test-integration GraphQL`);
      }
    }

    if (!liveMenus?.length) {
      const recovery = await post("shopify-cloner-worker", {
        action: "menu_recovery_fix",
        migration_id: MIGRATION_ID,
        dry_run: true,
      });
      if (recovery.json?.menus?.live_target_menus?.length) {
        liveMenus = recovery.json.menus.live_target_menus.map((m) => ({
          id: m.id,
          handle: m.handle,
          title: m.title,
          isDefault: false,
          items: [],
        }));
        console.log(`Listed ${liveMenus.length} menus via menu_recovery live_target_menus`);
      }
    }

    if (!liveMenus?.length) {
      throw new Error(
        "Could not list live menus. Deploy cloner functions to jzqgwsryxmgzcbjjddic:\n" +
          "  export SUPABASE_ACCESS_TOKEN=sbp_... && bash scripts/deploy-cloner-data-project.sh",
      );
    }

    const migrationMenus = (
      await post("shopify-cloner-worker", {
        action: "menu_recovery_fix",
        migration_id: MIGRATION_ID,
        dry_run: true,
      })
    ).json?.menus?.menus;

    result = buildInterimAudit(liveMenus, migrationMenus);
  }

  const md = result.markdown || "# Menu cleanup audit\n\n(no markdown returned)";
  writeFileSync(REPORT, md, "utf8");
  writeFileSync(JSON_OUT, JSON.stringify(result, null, 2), "utf8");
  writeFileSync(
    ROLLBACK,
    JSON.stringify(
      {
        generated_at: result.generated_at,
        migration_id: MIGRATION_ID,
        target_domain: result.target_domain || "ya1xhg-x6.myshopify.com",
        menus_scheduled_for_deletion: result.rollback || [],
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log(`\nWrote ${REPORT}`);
  console.log(`Wrote ${ROLLBACK}`);
  console.log(`Menus before: ${result.summary?.menus_before}`);
  console.log(`Menus to delete: ${result.summary?.menus_to_delete ?? 0}`);
  console.log(`Integrity: ${result.integrity?.status || (result.interim ? "PENDING" : "—")}`);

  if (result.interim) {
    console.log("\nInterim SAFE MODE report — deploy wsnc cloner functions for full audit + rollback structures.");
  } else if (mode === "safe" && result.confirmation_required) {
    console.log("\nSAFE MODE complete. Review report and rollback before:");
    console.log("  node scripts/menu-cleanup-audit.mjs --execute --confirm-delete");
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
