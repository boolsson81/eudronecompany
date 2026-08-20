#!/usr/bin/env node
/**
 * Live menu cleanup for EuroDroneParts — deletes orphan/duplicate menus only.
 * Usage: node scripts/execute-menu-cleanup.mjs [--dry-run]
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, ".menu-cleanup-execution.json");
const URL = process.env.CLONER_SUPABASE_URL || "https://wsncjdajweoujhidlxas.supabase.co";
const MID = process.env.MIGRATION_ID || "3d9876af-885c-49e9-a4b0-c4943c06112f";
const DRY_RUN = process.argv.includes("--dry-run");
const BATCH = 40;

const KEEP = new Set([
  "main-menu",
  "footer",
  "meny",
  "menu",
  "customer-account-main-menu",
  "enterprise-dr-nare",
]);

function loadEnv() {
  const p = join(ROOT, ".env");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
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
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
}

async function post(fn, body) {
  const key = apiKey();
  const r = await fetch(`${URL}/functions/v1/${fn}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, apikey: key },
    body: JSON.stringify(body),
  });
  const json = await r.json().catch(() => ({}));
  return { status: r.status, json };
}

const MENUS_GQL = `
  query MenusPage($cursor: String) {
    menus(first: 50, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      nodes { id handle title isDefault items { id } }
    }
  }
`;

function shouldDelete(handle) {
  if (KEEP.has(handle)) return false;
  if (handle === "partnership" || /^partnership-\d+$/.test(handle)) return true;
  if (handle === "actionkameror" || /^actionkameror-\d+$/.test(handle)) return true;
  if (handle === "dronare" || /^dronare-\d+$/.test(handle)) return true;
  if (/^footer-\d+$/.test(handle)) return true;
  if (/^customer-account-main-menu-\d+$/.test(handle)) return true;
  if (/^enterprise-dr-nare-\d+$/.test(handle)) return true;
  if (handle === "meny-1") return true;
  if (handle === "main-menu-1" || handle === "main-menu-2") return true;
  if (["gimbal", "kameror", "shop-by-activity"].includes(handle)) return true;
  return false;
}

async function fetchAllMenus() {
  const all = [];
  let cursor = null;
  for (let page = 0; page < 30; page++) {
    const { json } = await post("test-integration", {
      integration_type: "shopify",
      config: { store_domain: "ya1xhg-x6.myshopify.com", access_token: "***configured***" },
      shopify_graphql: { query: MENUS_GQL, variables: { cursor } },
    });
    if (!json?.data?.menus) break;
    all.push(...(json.data.menus.nodes || []));
    if (!json.data.menus.pageInfo?.hasNextPage) break;
    cursor = json.data.menus.pageInfo.endCursor;
  }
  return all;
}

async function deleteBatch(handles) {
  const { status, json } = await post("cloner-fix-collections-and-menus", {
    migration_id: MID,
    dry_run: DRY_RUN,
    collections_only: true,
    menus_only: true,
    skip_gap_audit: true,
    include_audit: false,
    delete_menu_handles: handles,
  });
  return { status, deletions: json.menu_deletions || [], error: json.error };
}

loadEnv();

const allMenus = await fetchAllMenus();
const toDelete = allMenus.map((m) => m.handle).filter(shouldDelete).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

const blocked = toDelete.filter((h) => KEEP.has(h));
if (blocked.length) {
  console.error("ABORT: delete list intersects keep list:", blocked);
  process.exit(1);
}

console.log(`Mode: ${DRY_RUN ? "DRY RUN" : "LIVE DELETE"}`);
console.log(`Menus on store: ${allMenus.length}`);
console.log(`Menus to delete: ${toDelete.length}`);

const allResults = [];
for (let i = 0; i < toDelete.length; i += BATCH) {
  const batch = toDelete.slice(i, i + BATCH);
  console.log(`Batch ${Math.floor(i / BATCH) + 1}/${Math.ceil(toDelete.length / BATCH)} (${batch.length} handles)...`);
  const { status, deletions, error } = await deleteBatch(batch);
  if (error) console.error("Batch error:", error);
  allResults.push(...deletions);
  const deleted = deletions.filter((d) => d.result === "deleted" || d.result === "would_delete").length;
  const failed = deletions.filter((d) => d.result === "failed").length;
  console.log(`  status=${status} deleted=${deleted} failed=${failed}`);
}

const summary = {
  generated_at: new Date().toISOString(),
  mode: DRY_RUN ? "dry_run" : "live",
  menus_before: allMenus.length,
  delete_requested: toDelete.length,
  deleted: allResults.filter((d) => d.result === "deleted").length,
  would_delete: allResults.filter((d) => d.result === "would_delete").length,
  failed: allResults.filter((d) => d.result === "failed"),
  not_found: allResults.filter((d) => d.result === "not_found_on_target"),
  results: allResults,
};

writeFileSync(OUT, JSON.stringify(summary, null, 2));
console.log("\nSummary:", JSON.stringify({ ...summary, results: undefined, failed: summary.failed.length, not_found: summary.not_found.length }, null, 2));
console.log(`Wrote ${OUT}`);
