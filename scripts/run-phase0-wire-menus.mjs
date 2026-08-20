#!/usr/bin/env node
/**
 * Wire Phase 0 approved main-menu via test-integration GraphQL proxy.
 * No redirects. Updates menu items only.
 *
 *   node scripts/run-phase0-wire-menus.mjs
 *   EDP_LAUNCH_CONFIRM=1 node scripts/run-phase0-wire-menus.mjs --live
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { MAIN_MENU } from "./lib/approved-menu-live.mjs";
import { TAXONOMY_VERSION } from "./lib/taxonomy-approval-config.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPORT = join(ROOT, "PHASE_0_MENU_WIRING_REPORT.md");
const SHOP = "ya1xhg-x6.myshopify.com";

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

async function shopifyGql(query, variables = {}) {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  const url = process.env.SUPABASE_URL;
  const r = await fetch(`${url}/functions/v1/test-integration`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      apikey: key,
    },
    body: JSON.stringify({
      integration_type: "shopify",
      config: { store_domain: SHOP, access_token: "***configured***" },
      shopify_graphql: { query, variables },
    }),
  });
  const json = await r.json();
  if (!json.success) throw new Error(JSON.stringify(json.errors || json));
  return json.data;
}

function toShopifyItems(items) {
  return items.map((it) => ({
    title: it.title,
    type: "HTTP",
    url: it.url,
    items: it.items?.length ? toShopifyItems(it.items) : [],
  }));
}

function countItems(items) {
  return items.reduce((n, it) => n + 1 + (it.items?.length ? countItems(it.items) : 0), 0);
}

async function fetchMenus() {
  const data = await shopifyGql(`query {
    menus(first: 50) {
      nodes { id handle title items { title url } }
    }
  }`);
  return new Map(data.menus.nodes.map((m) => [m.handle, m]));
}

function renderTree(items, depth = 0) {
  const lines = [];
  for (const it of items) {
    lines.push(`${"  ".repeat(depth)}- ${it.title} → ${it.url}`);
    if (it.items?.length) lines.push(...renderTree(it.items, depth + 1));
  }
  return lines;
}

async function main() {
  loadEnv();
  const live = process.argv.includes("--live");
  if (live && !process.env.EDP_LAUNCH_CONFIRM) {
    console.error("Set EDP_LAUNCH_CONFIRM=1 for live menu wiring");
    process.exit(1);
  }

  const menus = await fetchMenus();
  const target = menus.get(MAIN_MENU.handle);
  if (!target) throw new Error(`Menu not found: ${MAIN_MENU.handle}`);

  const items = toShopifyItems(MAIN_MENU.items);
  const itemCount = countItems(MAIN_MENU.items);

  console.log(`Phase 0 menu wiring — ${live ? "LIVE" : "dry-run"}`);
  console.log(`Menu: ${MAIN_MENU.handle} (${target.id})`);
  console.log(`Top-level items: ${MAIN_MENU.items.length}, total links: ${itemCount}\n`);

  let action = "dry_run";
  let error = null;

  if (live) {
    try {
      const data = await shopifyGql(
        `mutation MenuUpdate($id: ID!, $title: String!, $items: [MenuItemUpdateInput!]!) {
          menuUpdate(id: $id, title: $title, items: $items) {
            menu { id handle title }
            userErrors { field message }
          }
        }`,
        { id: target.id, title: MAIN_MENU.title, items },
      );
      const errs = data?.menuUpdate?.userErrors || [];
      if (errs.length) throw new Error(errs.map((e) => e.message).join("; "));
      action = "updated";
      console.log("main-menu updated successfully");
    } catch (e) {
      action = "failed";
      error = e.message;
      console.error(error);
    }
  }

  const report = [
    "# Phase 0 Menu Wiring Report",
    "",
    `**Generated:** ${new Date().toISOString()}`,
    `**Taxonomy:** \`${TAXONOMY_VERSION}\``,
    `**Mode:** ${live ? "LIVE" : "dry-run"}`,
    `**Menu:** \`${MAIN_MENU.handle}\``,
    `**Action:** ${action}`,
    error ? `**Error:** ${error}` : "",
    "",
    "## Approved structure",
    "",
    ...renderTree(MAIN_MENU.items),
    "",
    "## Constraints",
    "",
    "- No redirects created",
    "- Collection handles unchanged",
    "- Legacy/hidden collections excluded from nav",
    "",
  ].filter(Boolean).join("\n");

  writeFileSync(REPORT, report);
  console.log(`\nWrote ${REPORT}`);
  if (error) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
