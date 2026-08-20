#!/usr/bin/env node
/**
 * P0 Closeout — run all validation gates in sequence.
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=sbp_... \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   node scripts/run-p0-closeout-validation.mjs
 *
 * Exit codes:
 *   0 — all gates PASS (GO)
 *   1 — one or more gates FAIL (NO-GO)
 */
import { spawnSync } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CANONICAL = "wsncjdajweoujhidlxas";

function run(name, cmd, args, env = {}) {
  console.log(`\n${"=".repeat(60)}\n▶ ${name}\n${"=".repeat(60)}`);
  const r = spawnSync(cmd, args, {
    cwd: ROOT,
    env: {
      ...process.env,
      CLONER_SUPABASE_URL: `https://${CANONICAL}.supabase.co`,
      SUPABASE_URL: process.env.SUPABASE_URL || `https://${CANONICAL}.supabase.co`,
      ...env,
    },
    encoding: "utf8",
    stdio: "pipe",
  });
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  const pass = r.status === 0;
  console.log(`\n${pass ? "✓ PASS" : "✗ FAIL"}: ${name} (exit ${r.status ?? 1})`);
  return { name, pass, exit: r.status ?? 1 };
}

async function main() {
  const results = [];

  if (!process.env.SUPABASE_ACCESS_TOKEN) {
    console.error("ERROR: SUPABASE_ACCESS_TOKEN is required for P0 closeout validation.");
    console.error("Set in environment or GitHub Actions secrets.");
    process.exit(1);
  }

  // Gate 1 — Shopify OAuth
  results.push(run("1. Shopify OAuth", "node", ["scripts/validate-shopify-oauth.mjs"]));

  // Gate 2 — Migrations (local + remote; exit 2 = local ok, remote pending db push)
  const mig = run("2. Migrations", "node", ["scripts/validate-migrations.mjs"]);
  results.push({ ...mig, pass: mig.exit === 0, name: "2. Migrations (production applied)" });
  if (mig.exit === 2) {
    console.log("  ℹ Local migrations OK; production columns pending db push");
  }

  // Gate 3 — Webhooks
  results.push(run("3. Webhooks", "node", ["scripts/audit-all-shopify-webhooks.mjs"]));

  // Gate 4 — PR #23 dry-run
  results.push(run("4. PR #23 dry-run", "node", ["scripts/run-dry-run-fix-pass.mjs"]));

  // Gate 5 — Schema validation (22 columns + compliance-report)
  results.push(run("5. Schema validation", "node", ["scripts/run-p0-schema-validation.mjs"]));

  // Gate 6 — HS engine (offline, no secrets)
  results.push(run("6. HS engine", "node", ["scripts/validate-sunsky-hs-engine.mjs"]));

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    // Gate 7 — Backfill
    results.push(
      run("7. Internal backfill", "node", ["scripts/run-sunsky-internal-backfill.mjs", "--max-pages", "2000"]),
    );
    // Gate 8 — Compliance monitoring
    results.push(run("8. Compliance monitoring", "node", ["scripts/run-sunsky-compliance-monitor.mjs"]));
    // Gate 9 — Pilot verification
    results.push(run("9. Pilot verification (20 SKUs)", "node", ["scripts/run-pilot-verification.mjs"]));
  } else {
    for (const name of [
      "7. Internal backfill",
      "8. Compliance monitoring",
      "9. Pilot verification (20 SKUs)",
    ]) {
      console.log(`\n${"=".repeat(60)}\n▶ ${name}\n${"=".repeat(60)}`);
      console.error("SKIPPED — SUPABASE_SERVICE_ROLE_KEY not set");
      results.push({ name, pass: false, exit: 1 });
    }
  }

  console.log(`\n${"=".repeat(60)}\nP0 CLOSEOUT SUMMARY\n${"=".repeat(60)}`);
  for (const r of results) {
    console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.name}`);
  }

  const allPass = results.every((r) => r.pass);
  console.log(`\nDecision: ${allPass ? "GO" : "NO-GO"}`);
  console.log("ENABLE_SHOPIFY_PUBLISH must remain false. All products must stay DRAFT.\n");
  process.exit(allPass ? 0 : 1);
}

main();
