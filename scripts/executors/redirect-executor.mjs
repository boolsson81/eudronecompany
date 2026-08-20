#!/usr/bin/env node
/**
 * Redirect executor — DRY-RUN by default.
 * Validates REDIRECT_MAPPING.csv and optionally checks live Shopify for conflicts.
 *
 * Usage:
 *   node scripts/executors/redirect-executor.mjs           # dry-run
 *   node scripts/executors/redirect-executor.mjs --execute  # live (blocked unless ALLOW_LIVE_MIGRATION=1)
 */
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { writeFileSync } from "fs";
import { loadCsv, writeCsvSync } from "../lib/migration-csv.mjs";
import { loadEnv, lookupRedirect, pingShop, SHOP_DOMAIN, createRedirect, sleep } from "../lib/shopify-admin-client.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const REDIRECT_CSV = join(ROOT, "REDIRECT_MAPPING.csv");
const OUT_JSON = join(ROOT, ".redirect-executor-result.json");
const OUT_CSV = join(ROOT, "REDIRECT_EXECUTOR_REPORT.csv");

const EXECUTE = process.argv.includes("--execute");
const ALLOW_EXECUTE = process.env.ALLOW_LIVE_MIGRATION === "1";
const LIVE_CHECK = !process.argv.includes("--local-only");

function validateRedirects(redirects) {
  const map = new Map();
  const loops = [];
  const duplicates = [];

  for (const r of redirects) {
    if (map.has(r.from_path)) duplicates.push({ from: r.from_path, existing: map.get(r.from_path), duplicate: r.to_path });
    map.set(r.from_path, r.to_path);
  }

  for (const r of redirects) {
    const visited = new Set([r.from_path]);
    let cur = r.to_path;
    for (let i = 0; i < 20 && map.has(cur); i++) {
      if (visited.has(cur)) {
        loops.push({ from: r.from_path, loop_at: cur });
        break;
      }
      visited.add(cur);
      cur = map.get(cur);
    }
  }

  return {
    total: redirects.length,
    unique_from: map.size,
    loops: loops.length,
    loop_samples: loops.slice(0, 5),
    duplicates: duplicates.length,
    duplicate_samples: duplicates.slice(0, 5),
    pass: loops.length === 0 && duplicates.length === 0,
  };
}

async function checkLiveConflicts(redirects, { sampleOnly = false, sampleSize = 40 } = {}) {
  const toCheck = sampleOnly ? redirects.filter((r) => !r.from_path.startsWith("/en")).slice(0, sampleSize) : redirects;
  const conflicts = [];
  const existing_ok = [];
  const would_create = [];

  for (const r of toCheck) {
    const found = await lookupRedirect(r.from_path);
    if (!found.length) {
      would_create.push(r);
      continue;
    }
    const match = found.find((f) => f.target === r.to_path);
    if (match) existing_ok.push({ ...r, existing_id: match.id });
    else {
      conflicts.push({
        type: "TARGET_MISMATCH",
        from_path: r.from_path,
        planned_target: r.to_path,
        existing_target: found[0].target,
        existing_id: found[0].id,
      });
    }
  }

  return { checked: toCheck.length, would_create: would_create.length, existing_ok: existing_ok.length, conflicts };
}

export async function runRedirectExecutor({ execute = false, liveCheck = LIVE_CHECK } = {}) {
  loadEnv();
  const shop = await pingShop();
  const rows = loadCsv(REDIRECT_CSV);
  const redirects = rows.map((r) => ({
    from_path: r.from_path,
    to_path: r.to_path,
    resource_type: r.resource_type,
    redirect_type: r.redirect_type || "301",
    reason: r.reason,
  }));

  const validation = validateRedirects(redirects);
  const byType = {};
  for (const r of redirects) byType[r.resource_type] = (byType[r.resource_type] || 0) + 1;

  let live = { checked: 0, would_create: redirects.length, existing_ok: 0, conflicts: [] };
  if (liveCheck) {
    // Full live scan for non-/en paths; /en paths validated locally only
    const primary = redirects.filter((r) => !r.from_path.startsWith("/en"));
    live = await checkLiveConflicts(primary, { sampleOnly: false });
  }

  const reportRows = redirects.map((r) => ({
    from_path: r.from_path,
    to_path: r.to_path,
    resource_type: r.resource_type,
    reason: r.reason,
    dry_run_action: "CREATE",
    status: "PENDING",
  }));

  const summary = {
    mode: execute ? "EXECUTE" : "DRY_RUN",
    shop: shop?.name,
    domain: SHOP_DOMAIN,
    generated_at: new Date().toISOString(),
    total_rules: redirects.length,
    by_type: byType,
    validation,
    live_check: live,
    would_create: execute ? 0 : redirects.length - live.existing_ok,
    already_exists: live.existing_ok,
    conflicts: live.conflicts,
    pass: validation.pass && live.conflicts.length === 0,
  };

  if (execute) {
    if (!ALLOW_EXECUTE) throw new Error("Live execute blocked. Set ALLOW_LIVE_MIGRATION=1 to enable.");
    const created = [];
    const failed = [];
    for (const r of redirects) {
      try {
        const result = await createRedirect(r.from_path, r.to_path);
        created.push({ ...r, redirect_id: result?.id || "already_exists" });
        await sleep(150);
      } catch (e) {
        failed.push({ ...r, error: e.message });
      }
    }
    summary.execute_results = { created: created.length, failed: failed.length, failures: failed.slice(0, 10) };
    writeFileSync(OUT_JSON, JSON.stringify(summary, null, 2), "utf8");
    return summary;
  }

  writeCsvSync(OUT_CSV, ["from_path", "to_path", "resource_type", "reason", "dry_run_action", "status"], reportRows);
  writeFileSync(OUT_JSON, JSON.stringify(summary, null, 2), "utf8");

  return summary;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runRedirectExecutor({ execute: EXECUTE })
    .then((s) => {
      console.log(`Redirect ${s.mode}: ${s.total_rules} rules, validation=${s.validation.pass ? "PASS" : "FAIL"}, live_conflicts=${s.conflicts.length}`);
      console.log(`  By type:`, s.by_type);
      console.log(`  Live checked: ${s.live_check.checked}, would_create: ${s.would_create}, already_exists: ${s.live_check.existing_ok}`);
      process.exit(s.pass ? 0 : 1);
    })
    .catch((e) => {
      console.error(e.message);
      process.exit(1);
    });
}
