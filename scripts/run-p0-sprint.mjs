#!/usr/bin/env node
/**
 * P0 execution sprint orchestrator.
 *
 *   node scripts/run-p0-sprint.mjs
 *   node scripts/run-p0-sprint.mjs --skip-backfill
 *
 * Requires for full run:
 *   SUPABASE_ACCESS_TOKEN (db push + deploy)
 *   SUPABASE_SERVICE_ROLE_KEY (backfill + monitor)
 */
import { spawnSync } from "child_process";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const EVIDENCE = join(ROOT, "docs/go-live/evidence");
const PROJECT_REF = "jzqgwsryxmgzcbjjddic";

function run(cmd, args, opts = {}) {
  console.log(`\n> ${cmd} ${args.join(" ")}`);
  const r = spawnSync(cmd, args, { cwd: ROOT, stdio: "inherit", shell: false, ...opts });
  return r.status ?? 1;
}

function runNode(script, extraArgs = []) {
  return run("node", [join("scripts", script), ...extraArgs]);
}

async function main() {
  const skipBackfill = process.argv.includes("--skip-backfill");
  mkdirSync(EVIDENCE, { recursive: true });

  const steps = [];
  const pushStatus = { attempted: false, success: false, note: null };

  if (process.env.SUPABASE_ACCESS_TOKEN) {
    pushStatus.attempted = true;
    const linkCode = run("npx", ["supabase", "link", "--project-ref", PROJECT_REF]);
    if (linkCode === 0) {
      const pushCode = run("npx", ["supabase", "db", "push", "--linked"]);
      pushStatus.success = pushCode === 0;
      steps.push({ step: "db_push", success: pushCode === 0 });
    } else {
      pushStatus.note = "link failed";
      steps.push({ step: "db_push", success: false, error: "link failed" });
    }
  } else {
    pushStatus.note = "SUPABASE_ACCESS_TOKEN not set — skipped db push";
    steps.push({ step: "db_push", success: false, skipped: true });
  }

  const schemaCode = runNode("run-p0-schema-validation.mjs");
  steps.push({ step: "schema_validation", success: schemaCode === 0 });

  if (process.env.SUPABASE_ACCESS_TOKEN) {
    const deployCode = run("npx", [
      "supabase", "functions", "deploy", "sunsky-sync", "--project-ref", PROJECT_REF,
    ]);
    steps.push({ step: "deploy_sunsky_sync", success: deployCode === 0 });
  } else {
    steps.push({ step: "deploy_sunsky_sync", success: false, skipped: true });
  }

  if (!skipBackfill && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const backfillCode = runNode("run-sunsky-internal-backfill.mjs", ["--max-pages", "2000"]);
    steps.push({ step: "internal_backfill", success: backfillCode === 0 });
  } else {
    steps.push({ step: "internal_backfill", success: false, skipped: true });
  }

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const monitorCode = runNode("run-sunsky-compliance-monitor.mjs");
    steps.push({ step: "compliance_monitor", success: monitorCode === 0 });
  } else {
    steps.push({ step: "compliance_monitor", success: false, skipped: true });
  }

  const hsCode = runNode("validate-sunsky-hs-engine.mjs");
  steps.push({ step: "hs_engine_validation", success: hsCode === 0 });

  const pilotCode = runNode("run-pilot-verification.mjs");
  steps.push({ step: "pilot_verification", success: pilotCode === 0 });

  const report = {
    generated_at: new Date().toISOString(),
    project_ref: PROJECT_REF,
    db_push: pushStatus,
    steps,
    enable_shopify_publish: process.env.ENABLE_SHOPIFY_PUBLISH ?? "unset",
  };

  writeFileSync(join(EVIDENCE, "P0_SPRINT_EXECUTION.json"), JSON.stringify(report, null, 2));
  console.log("\nP0 sprint log:", join(EVIDENCE, "P0_SPRINT_EXECUTION.json"));

  const allPassed = steps.every((s) => s.success);
  process.exit(allPassed ? 0 : 1);
}

main();
