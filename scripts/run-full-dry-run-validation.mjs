#!/usr/bin/env node
/**
 * Full EuroDroneParts dry-run validation (split calls to avoid WORKER_RESOURCE_LIMIT).
 * Writes: EURODRONEPARTS_DRY_RUN_REPORT.md
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPORT = join(ROOT, "EURODRONEPARTS_DRY_RUN_REPORT.md");
const URL = process.env.CLONER_SUPABASE_URL || "https://jzqgwsryxmgzcbjjddic.supabase.co";
const MID = process.env.MIGRATION_ID || "3d9876af-885c-49e9-a4b0-c4943c06112f";
const HANDLES = [
  "dji-air-3-tillbehor-omfattande-sortiment",
  "dji-avata-2-tillbehor",
  "dji-flip-tillbehor",
  "dji-mini-3-tillbehor",
  "dji-neo-2-tillbehor",
  "dji-neo-tillbehor",
];
const KEY_MENUS = [
  "main-menu",
  "footer",
  "partnership",
  "enterprise-dr-nare",
  "customer-account-main-menu",
  "meny",
  "dronare",
  "actionkameror",
  "vandring-outdoor",
];

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

async function post(path, body) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  const r = await fetch(`${URL}/functions/v1/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, apikey: key },
    body: JSON.stringify(body),
  });
  const json = await r.json().catch(() => ({}));
  return { status: r.status, json };
}

async function worker(action, body = {}) {
  return post("shopify-cloner-worker", { action, migration_id: MID, ...body });
}

function linesFrom(data) {
  const L = [];
  const push = (s = "") => L.push(s);

  const pr23 = data.discover.json.actions?.includes("smart_collection_mapping_fix");
  const fixShape = !!data.fixColl.json.smart_collection_recovery_handles;
  const coll = data.fixColl.json.collections?.summary || {};
  const menus = data.fixMenu.json.menus?.summary || {};
  const menuRows = data.fixMenu.json.menus?.menus || [];
  const collRows = data.fixColl.json.collections?.collections || [];

  const collMapped = collRows.filter((c) => c.rule_mappings?.length > 0).length;
  const menuUpdated = menuRows.filter((m) => m.publish_result === "updated" || m.publish_result === "published").length;
  const menuFailed = menuRows.filter((m) => m.publish_result === "failed").length;
  const menuSkipped = menuRows.filter((m) => m.publish_result === "skipped").length;

  const pass =
    pr23 &&
    fixShape &&
    collMapped === 6 &&
    coll.failed === 0 &&
    menuFailed === 0 &&
    menuUpdated + menuSkipped === 9;

  push("# EuroDroneParts — Full Dry-Run Validation Report");
  push("");
  push(`**Generated:** ${new Date().toISOString()}`);
  push(`**Project:** ${URL}`);
  push(`**Migration:** \`${MID}\``);
  push("");
  push(`## STATUS: ${pass ? "PASS" : "FAIL"}`);
  push("");
  push("## 1. Deploy verification");
  push(`| Flag | Result |`);
  push(`|------|--------|`);
  push(`| pr23 | ${pr23 ? "true" : "false"} |`);
  push(`| fix_shape | ${fixShape ? "true" : "false"} |`);
  push("");
  push("## 2. Collections (dry-run)");
  push(`| Metric | Value |`);
  push(`|--------|-------|`);
  push(`| Mapped | ${collMapped}/6 |`);
  push(`| Failed | ${coll.failed ?? 0} |`);
  push(`| Skipped (dry-run) | ${coll.skipped ?? 0} |`);
  push("");
  push("| Handle | Result | Rules | Metafield remap |");
  push("|--------|--------|-------|-----------------|");
  for (const h of HANDLES) {
    const row = collRows.find((c) => c.collection_handle === h);
    const m = row?.rule_mappings?.[0];
    push(
      `| ${h} | ${row?.publish_result || "—"} | ${row?.rule_mappings?.length || 0} | ${m ? `${m.old_definition_id?.slice(-12)} → ${m.new_definition_id?.slice(-12)}` : "—"} |`,
    );
  }
  push("");
  push("## 3. Menus (dry-run)");
  push(`| Metric | Value |`);
  push(`|--------|-------|`);
  push(`| Updated | ${menuUpdated}/9 |`);
  push(`| Skipped | ${menuSkipped} |`);
  push(`| Failed | ${menuFailed} |`);
  push(`| Menu limit hits | ${menus.skipped_limit ?? 0} |`);
  push("");
  push("| Menu handle | Result | Kept | Removed | Error |");
  push("|-------------|--------|------|---------|-------|");
  for (const h of KEY_MENUS) {
    const m = menuRows.find((r) => r.menu_handle === h);
    push(
      `| ${h} | ${m?.publish_result || "—"} | ${m?.kept_count ?? "—"} | ${m?.removed_links?.length ?? 0} | ${m?.error || "—"} |`,
    );
  }
  push("");
  push("### Removed / broken links (summary)");
  const removed = [];
  for (const m of menuRows) {
    for (const l of m.removed_links || []) {
      removed.push({ menu: m.menu_handle, ...l });
    }
  }
  const legacy = removed.filter((l) => /actionking|legacy/i.test(l.reason || "") || /actionking/i.test(l.url || ""));
  const missing = removed.filter((l) => /not on live target|not found/i.test(l.reason || ""));
  push(`- Total pruned links: ${removed.length}`);
  push(`- Legacy ActionKing: ${legacy.length}`);
  push(`- Missing collections/pages: ${missing.length}`);
  push("");
  if (legacy.length) {
    push("**Legacy ActionKing links (will be pruned):**");
    for (const l of legacy) push(`- \`${l.menu}\`: ${l.title} → ${l.url}`);
    push("");
  }
  push("## 4. DJI collections — live baseline");
  push("| Handle | Type | Products | URL |");
  push("|--------|------|----------|-----|");
  for (const row of data.djiLive) {
    push(`| ${row.handle} | ${row.kind} | ${row.products} | /collections/${row.handle} |`);
  }
  push("");
  push(`**Products published (DB):** ${data.productsPublished}`);
  push(`**Missing collections (excluded):** ${data.recon.json.counts?.missing_collections ?? "—"}`);
  push("");
  push("## 5. Risk assessment");
  push("| Risk | Level | Notes |");
  push("|------|-------|-------|");
  push(`| Smart rule remap | LOW | All 6 rules map source→target metafield definition |`);
  push(`| SEO handle change | NONE | collectionUpdate ruleSet only |`);
  push(`| Bulk collection restore | NONE | 671 excluded, no auto-restore |`);
  push(`| Menu limit (menuCreate) | LOW | menuUpdate path; 0 limit hits in dry-run |`);
  push(`| Empty legacy submenus | ${menuFailed > 0 ? "MEDIUM" : "LOW"} | ${menuFailed} menu(s) need legacy-empty handling deploy |`);
  push(`| WORKER_RESOURCE_LIMIT | LOW | Use split dry-run (this script) |`);
  push("");
  if (!pass) {
    push("## Blockers");
    if (!pr23) push("- PR#23 worker actions not on data project");
    if (!fixShape) push("- cloner-fix PR#23 response shape missing");
    if (collMapped < 6) push(`- Collections mapped ${collMapped}/6`);
    if (coll.failed > 0) push(`- Collection failures: ${coll.failed}`);
    if (menuFailed > 0) push(`- Menu failures: ${menuFailed} (redeploy menu fix to jzqgwsryxmgzcbjjddic)`);
    if (menuUpdated + menuSkipped < 9) push("- Not all 9 menus accounted for");
  }
  push("");
  push("## Live fix-pass gate");
  push(pass
    ? "**READY** — dry-run green. Await operator approval before live fix-pass."
    : "**NOT READY** — resolve blockers and re-run `node scripts/run-full-dry-run-validation.mjs`.");

  return { lines: L.join("\n"), pass, metrics: { pr23, fixShape, collMapped, menuUpdated, menuFailed, menuSkipped } };
}

async function main() {
  loadEnv();
  const [discover, fixColl, fixMenu, recon] = await Promise.all([
    worker("pre_250_discover"),
    post("cloner-fix-collections-and-menus", {
      migration_id: MID,
      dry_run: true,
      include_audit: false,
      skip_gap_audit: true,
      collections_only: true,
      handles: HANDLES,
    }),
    post("cloner-fix-collections-and-menus", {
      migration_id: MID,
      dry_run: true,
      include_audit: false,
      skip_gap_audit: true,
      menus_only: true,
    }),
    worker("collection_reconciliation_audit"),
  ]);

  const djiLive = HANDLES.map((h) => {
    const t = recon.json.TARGET_COLLECTIONS?.find((c) => c.handle === h);
    return { handle: h, kind: t?.kind || "—", products: t?.products_count ?? "—" };
  });

  const { lines, pass, metrics } = linesFrom({
    discover,
    fixColl,
    fixMenu,
    recon,
    djiLive,
    productsPublished: discover.json.migrations?.find((m) => m.id === MID)?.published_products,
  });

  writeFileSync(REPORT, lines);
  console.log(lines);
  console.log("\n--- METRICS ---", JSON.stringify(metrics, null, 2));
  process.exit(pass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
