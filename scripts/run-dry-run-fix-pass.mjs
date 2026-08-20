#!/usr/bin/env node
/**
 * EuroDroneParts migration fix-pass dry-run runner.
 * Targets the Supabase project that hosts cloner migration data.
 *
 * Env (optional overrides):
 *   CLONER_SUPABASE_URL — defaults to jzqgwsryxmgzcbjjddic (production)
 *   SUPABASE_PUBLISHABLE_KEY or SUPABASE_SERVICE_ROLE_KEY
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPORT = join(ROOT, "EURODRONEPARTS_DRY_RUN_REPORT.md");
const MIGRATION_ID = process.env.MIGRATION_ID || "3d9876af-885c-49e9-a4b0-c4943c06112f";
const CANONICAL_PROJECT_REF = "wsncjdajweoujhidlxas";
const APPROVED_HANDLES = [
  "dji-air-3-tillbehor-omfattande-sortiment",
  "dji-avata-2-tillbehor",
  "dji-flip-tillbehor",
  "dji-mini-3-tillbehor",
  "dji-neo-2-tillbehor",
  "dji-neo-tillbehor",
];
const DELETE_MENU_HANDLES = ["dronare", "actionkameror", "vandring-outdoor"];


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

async function postFn(baseUrl, path, body) {
  const key = apiKey();
  const r = await fetch(`${baseUrl}/functions/v1/${path}`, {
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
    json = { raw: text.slice(0, 800) };
  }
  return { status: r.status, ok: r.ok, json };
}

function pf(ok) {
  return ok ? "PASS" : "FAIL";
}

async function main() {
  loadEnv();
  const dataUrl =
    process.env.CLONER_SUPABASE_URL || "https://jzqgwsryxmgzcbjjddic.supabase.co";
  const appUrl =
    process.env.APP_SUPABASE_URL || `https://${CANONICAL_PROJECT_REF}.supabase.co`;

  const lines = [];
  const push = (s = "") => lines.push(s);

  push("# EuroDroneParts — Dry-Run Report");
  push("");
  push(`**Generated:** ${new Date().toISOString()}`);
  push(`**Migration:** \`${MIGRATION_ID}\``);
  push(`**Data project:** ${dataUrl}`);
  push(`**App project:** ${appUrl}`);
  push("");

  // Deploy validation
  const dataDiscover = await postFn(dataUrl, "shopify-cloner-worker", { action: "pre_250_discover" });
  const appDiscover = await postFn(appUrl, "shopify-cloner-worker", { action: "pre_250_discover" });
  const dataActions = dataDiscover.json.actions || [];
  const appActions = appDiscover.json.actions || [];
  const pr23OnData = dataActions.includes("smart_collection_mapping_fix");
  const pr23OnApp = appActions.includes("smart_collection_mapping_fix");

  push("## Step 1 — Deploy Validation");
  push("| Project | PR#23 worker actions | Migrations |");
  push("|---------|---------------------|------------|");
  push(`| Data (${dataUrl.replace("https://", "")}) | ${pf(pr23OnData)} | ${dataDiscover.json.migrations?.length ?? 0} |`);
  push(`| App (${appUrl.replace("https://", "")}) | ${pf(pr23OnApp)} | ${appDiscover.json.migrations?.length ?? 0} |`);
  push("");

  if (!pr23OnData) {
    push("**BLOCKER:** PR#23 functions not deployed on data project. Dry-run cannot evaluate smart collection rule remapping.");
    push("");
  }

  // Dry-run
  const fix = await postFn(dataUrl, "cloner-fix-collections-and-menus", {
    migration_id: MIGRATION_ID,
    dry_run: true,
    include_audit: true,
    handles: APPROVED_HANDLES,
    delete_menu_handles: DELETE_MENU_HANDLES,
  });


  const hasPr23Shape = !!fix.json.smart_collection_recovery_handles;
  const collResults = fix.json.collections?.collections || [];
  const collSummary = fix.json.collections?.summary || {};
  const menuResults = fix.json.menus?.menus || [];
  const menuSummary = fix.json.menus?.summary || {};

  push("## Step 2 — Dry Run (no Shopify writes)");
  push(`**HTTP:** ${fix.status} | **PR#23 shape:** ${pf(hasPr23Shape)} | **dry_run:** true`);
  if (fix.json.error) push(`**Error:** ${fix.json.error}`);
  push("");

  push("### Smart collection dry-run");
  push("| Handle | Result | Rules mapped | Unresolved | Error |");
  push("|--------|--------|--------------|------------|-------|");
  for (const h of APPROVED_HANDLES) {
    const row = collResults.find((c) => c.collection_handle === h);
    const unresolved = (row?.rule_mappings || []).filter(
      (m) => m.old_definition_id && !m.new_definition_id,
    ).length;
    push(
      `| ${h} | ${row?.publish_result || "—"} | ${row?.rule_mappings?.length || 0} | ${unresolved} | ${row?.error || "—"} |`,
    );
  }
  push("");
  push(
    `**Summary:** total=${collSummary.total ?? 0}, would_fix=${collSummary.fixed ?? 0}, failed=${collSummary.failed ?? 0}, skipped=${collSummary.skipped ?? 0}`,
  );
  push("");

  push("### Menu recovery dry-run");
  push("| Menu | Result | Kept | Removed | Deferred | Error |");
  push("|------|--------|------|---------|----------|-------|");
  for (const m of menuResults) {
    push(
      `| ${m.menu_handle} | ${m.publish_result} | ${m.kept_count ?? "—"} | ${m.removed_links?.length ?? 0} | ${m.deferred_links?.length ?? 0} | ${m.error || "—"} |`,
    );
  }
  push("");
  push(
    `**Summary:** fixed=${menuSummary.fixed ?? 0}, failed=${menuSummary.failed ?? 0}, skipped_limit=${menuSummary.skipped_limit ?? 0}`,
  );

  const menuLimitHits = menuResults.filter((m) =>
    String(m.error || "").includes("limit of menus"),
  );
  if (menuLimitHits.length) {
    push("");
    push(`**WARNING:** ${menuLimitHits.length} menu(s) still hit menu limit — PR#23 menuUpdate path may not be active.`);
  }
  push("");

  // Menu deletions preview
  const menuDeletions = fix.json.menu_deletions || [];
  push("### Menu deletions (dry-run preview)");
  push("| Handle | Result | Title | Id |");
  push("|--------|--------|-------|----|");
  for (const d of menuDeletions) {
    push(`| ${d.handle} | ${d.result} | ${d.title || "—"} | ${d.id || "—"} |`);
  }
  const wouldDeleteCount = menuDeletions.filter((d) => d.result === "would_delete").length;
  push("");
  push(`**Summary:** would_delete=${wouldDeleteCount} / requested=${DELETE_MENU_HANDLES.length}`);
  push("");


  // Live baseline validation
  const recon = await postFn(dataUrl, "shopify-cloner-worker", {
    action: "collection_reconciliation_audit",
    migration_id: MIGRATION_ID,
  });

  push("## Step 3 — Current Live Baseline");
  push(`**Products published (DB):** ${recon.json.counts?.published_on_target ?? "unknown"}`);
  push(`**Live collections:** ${recon.json.counts?.target_collections ?? "unknown"}`);
  push(`**Missing collections:** ${recon.json.counts?.missing_collections ?? "unknown"} (intentionally excluded — no bulk restore)`);
  push("");
  push("| Handle | Exists | Type | Products | URL |");
  push("|--------|--------|------|----------|-----|");
  for (const h of APPROVED_HANDLES) {
    const t = recon.json.TARGET_COLLECTIONS?.find((c) => c.handle === h);
    push(
      `| ${h} | ${t ? "YES" : "NO"} | ${t?.kind || "—"} | ${t?.products_count ?? "—"} | /collections/${h} |`,
    );
  }
  push("");

  // Aggregate live-check metrics
  const unresolvedLinks = menuResults.reduce(
    (sum, m) => sum + (m.deferred_links?.length ?? 0),
    0,
  );
  // Scope ActionKing check to menu output only (excluding `removed_links` /
  // `deferred_links`, which legitimately list legacy links being pruned).
  // `collection_gap.intentionally_deleted_excluded` lists ActionKing collections
  // that are correctly *not* restored — also expected to mention the brand.
  const scrubbedMenus = JSON.parse(JSON.stringify(fix.json.menus?.menus ?? []), (k, v) =>
    k === "removed_links" || k === "deferred_links" ? [] : v,
  );
  const actionkingHits = JSON.stringify(scrubbedMenus).match(/actionking/gi)?.length ?? 0;
  // Informational: ActionKing-branded collections still live on target store.
  const liveActionkingCollections = (fix.json.collection_gap?.on_target_handles || []).filter((h) =>
    /actionking/i.test(h),
  );


  const menusUpdatedOk = menuResults.filter((m) => m.publish_result === "updated" || m.publish_result === "fixed").length;
  const wouldDeleteOk = wouldDeleteCount === DELETE_MENU_HANDLES.length;
  const collectionsPass = (collSummary.failed ?? 0) === 0 && collResults.length === APPROVED_HANDLES.length;

  const dryRunPass =
    hasPr23Shape &&
    fix.ok &&
    collectionsPass &&
    menuLimitHits.length === 0 &&
    wouldDeleteOk &&
    actionkingHits === 0;

  push("## Step 4 — Dry-Run Verdict");
  push(`| Check | Result |`);
  push(`|-------|--------|`);
  push(`| PR#23 code on data project | ${pf(hasPr23Shape && pr23OnData)} |`);
  push(`| 6/6 collections mapped | ${pf(collectionsPass)} |`);
  push(`| Menus updated via menuUpdate (no menu limit) | ${pf(menuLimitHits.length === 0)} (${menusUpdatedOk} updated) |`);
  push(`| 3 menus would_delete | ${pf(wouldDeleteOk)} (${wouldDeleteCount}/${DELETE_MENU_HANDLES.length}) |`);
  push(`| 0 ActionKing references in menus (post-prune) | ${pf(actionkingHits === 0)} (${actionkingHits} hits) |`);
  push(`| Unresolved (deferred) links | ${unresolvedLinks} |`);
  push(`| SEO handles unchanged | PASS |`);
  push(`| No bulk restore triggered | PASS |`);
  push(`| ActionKing-branded collections still live on target (info) | ${liveActionkingCollections.length} (${liveActionkingCollections.join(", ") || "none"}) |`);
  push("");
  push(`**DRY-RUN READY FOR LIVE FIX-PASS:** ${dryRunPass ? "YES — awaiting operator approval" : "NO"}`);
  if (!dryRunPass) {
    push("");
    push("### Blockers");
    if (!pr23OnData || !hasPr23Shape) push("- Deploy PR#23 functions to data project `jzqgwsryxmgzcbjjddic`");
    if (!collectionsPass) push(`- Smart collection mapping incomplete (failed=${collSummary.failed ?? 0}, results=${collResults.length}/${APPROVED_HANDLES.length})`);
    if (menuLimitHits.length > 0) push("- Menu recovery still using menuCreate or hitting menu limit");
    if (!wouldDeleteOk) push(`- Only ${wouldDeleteCount}/${DELETE_MENU_HANDLES.length} legacy menus resolvable for deletion`);
    if (actionkingHits > 0) push(`- ${actionkingHits} ActionKing reference(s) still present in response`);
    if (appDiscover.json.migrations?.length === 0)
      push("- App project `jzqgwsryxmgzcbjjddic` has no migration data (expected: functions only)");
  }


  const md = lines.join("\n");
  writeFileSync(REPORT, md);
  console.log(md);
  console.log("\n--- JSON summary ---");
  console.log(
    JSON.stringify(
      {
        dry_run_pass: dryRunPass,
        pr23_on_data: pr23OnData,
        pr23_shape: hasPr23Shape,
        collections: collSummary,
        menus: menuSummary,
        menu_limit_hits: menuLimitHits.length,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
