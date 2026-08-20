#!/usr/bin/env node
/**
 * Execute Phase 0: approve taxonomy + merge approved collections.
 * Uses deployed shopify-cloner-worker (OAuth token). No redirects.
 *
 * Usage:
 *   node scripts/run-phase0-execute.mjs              # dry-run
 *   EDP_LAUNCH_CONFIRM=1 node scripts/run-phase0-execute.mjs --live
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { APPROVED_MERGE_PLAN } from "./lib/taxonomy-approval-config.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPORT = join(ROOT, "PHASE_0_EXECUTION_REPORT.md");
const MIGRATION_ID = "3d9876af-885c-49e9-a4b0-c4943c06112f";

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

async function worker(body) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  const url = process.env.SUPABASE_URL;
  if (!url || !key) throw new Error("Missing SUPABASE_URL or API key");
  const r = await fetch(`${url}/functions/v1/shopify-cloner-worker`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      apikey: key,
    },
    body: JSON.stringify({ migration_id: MIGRATION_ID, ...body }),
  });
  const text = await r.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`HTTP ${r.status}: ${text.slice(0, 500)}`);
  }
  if (!r.ok && !json.ok) throw new Error(json.error || text.slice(0, 500));
  return json;
}

function renderReport({ live, approval, merge, errors }) {
  const now = new Date().toISOString();
  const L = [
    "# Phase 0 Execution Report",
    "",
    `**Generated:** ${now}`,
    `**Mode:** ${live ? "LIVE" : "dry-run"}`,
    `**Migration:** ${MIGRATION_ID}`,
    "",
    "## Approved merges (plan)",
    "",
    "| Absorb | Canonical |",
    "| --- | --- |",
    ...APPROVED_MERGE_PLAN.map((m) => `| \`${m.absorb}\` | \`${m.canonical}\` |`),
    "",
  ];

  if (approval) {
    L.push("## Taxonomy approval", "");
    L.push(`- Approved: **${approval.approved ? "YES" : "NO"}**`);
    if (approval.approved_at) L.push(`- At: ${approval.approved_at}`);
    if (approval.approved_by) L.push(`- By: ${approval.approved_by}`);
    if (approval.taxonomy_version) L.push(`- Version: \`${approval.taxonomy_version}\``);
    L.push("");
  }

  if (merge?.results?.length) {
    L.push("## Merge results", "");
    L.push("| Canonical | Absorb | Action | Products | Error |");
    L.push("| --- | --- | --- | ---: | --- |");
    for (const r of merge.results) {
      L.push(`| \`${r.canonical_handle}\` | \`${r.absorb_handle}\` | ${r.action} | ${r.products_moved} | ${r.error || "—"} |`);
    }
    L.push("");
    if (merge.summary) {
      L.push("### Summary", "");
      for (const [k, v] of Object.entries(merge.summary)) L.push(`- ${k}: ${v}`);
      L.push("");
    }
  }

  if (errors?.length) {
    L.push("## Errors", "");
    for (const e of errors) L.push(`- ${e}`);
    L.push("");
  }

  return L.join("\n");
}

async function main() {
  loadEnv();
  const live = process.argv.includes("--live");
  const approvedBy = process.argv.find((a) => a.startsWith("--approved-by="))?.split("=")[1] || "operator";

  if (live && !process.env.EDP_LAUNCH_CONFIRM) {
    console.error("Set EDP_LAUNCH_CONFIRM=1 for live execution");
    process.exit(1);
  }

  const errors = [];
  let approval = null;
  let merge = null;

  console.log(`Phase 0 execute — ${live ? "LIVE" : "dry-run"}\n`);

  // Step 1: Approve taxonomy (DB only — no Shopify mutations)
  if (live) {
    try {
      const res = await worker({
        action: "edp_launch_prep",
        prep_action: "approve_taxonomy",
        confirm: true,
        approved_by: approvedBy,
        dry_run: false,
      });
      approval = res.taxonomy?.approval || res.approval;
      if (!res.ok) errors.push(...(res.errors || [res.error || "approve_taxonomy failed"]));
      console.log("approve_taxonomy:", approval?.approved ? "OK" : res);
    } catch (e) {
      errors.push(`approve_taxonomy: ${e.message}`);
      console.error(e.message);
    }
  } else {
    console.log("dry-run: skipping approve_taxonomy (would set approved=true in cloner_migrations.scope)");
  }

  // Step 2: Merge collections
  try {
    const res = await worker({
      action: "edp_launch_prep",
      prep_action: "merge_collections",
      dry_run: !live,
    });
    merge = res.taxonomy?.merges;
    if (!res.ok) errors.push(...(res.errors || []));
    console.log("merge_collections:", merge?.summary || res.error || res);
  } catch (e) {
    if (String(e.message).includes("Unknown action: edp_launch_prep")) {
      errors.push("shopify-cloner-worker not deployed with edp_launch_prep — deploy workflow required");
    } else {
      errors.push(`merge_collections: ${e.message}`);
    }
    console.error(e.message);
  }

  const report = renderReport({ live, approval, merge, errors });
  writeFileSync(REPORT, report);
  console.log(`\nWrote ${REPORT}`);

  if (errors.length && live) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
