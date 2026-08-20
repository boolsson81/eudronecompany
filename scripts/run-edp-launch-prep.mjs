#!/usr/bin/env node
/**
 * EuroDroneParts launch prep runner.
 *
 * Phase 0 — Category Architecture Lock (before any handle rename):
 *   1. audit_collections
 *   2. merge_collections
 *   3. propose_taxonomy
 *   4. approve_taxonomy  ← unlocks phases 1–7
 *
 * Usage:
 *   node scripts/run-edp-launch-prep.mjs                              # preview
 *   node scripts/run-edp-launch-prep.mjs --action=audit_collections
 *   node scripts/run-edp-launch-prep.mjs --action=propose_taxonomy
 *   node scripts/run-edp-launch-prep.mjs --action=merge_collections   # dry-run
 *   EDP_LAUNCH_CONFIRM=1 node scripts/run-edp-launch-prep.mjs --action=merge_collections --live
 *   node scripts/run-edp-launch-prep.mjs --action=approve_taxonomy --confirm --approved-by="Name"
 *   EDP_LAUNCH_CONFIRM=1 node scripts/run-edp-launch-prep.mjs --live  # after approval
 *
 * Writes: CATEGORY_AUDIT_REPORT.md, EDP_LAUNCH_PREP_REPORT.md, EDP_TAXONOMY_REPORT.md, EDP_FINAL_LAUNCH_REPORT.md
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CATEGORY_REPORT = join(ROOT, "CATEGORY_AUDIT_REPORT.md");
const PREP_REPORT = join(ROOT, "EDP_LAUNCH_PREP_REPORT.md");
const TAXONOMY_REPORT = join(ROOT, "EDP_TAXONOMY_REPORT.md");
const FINAL_REPORT = join(ROOT, "EDP_FINAL_LAUNCH_REPORT.md");

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

function parseArgs() {
  const args = process.argv.slice(2);
  const live = args.includes("--live");
  const deleteMenus = args.includes("--delete");
  const confirm = args.includes("--confirm");
  const actionArg = args.find((a) => a.startsWith("--action="));
  const approvedByArg = args.find((a) => a.startsWith("--approved-by="));
  const action = actionArg ? actionArg.split("=")[1] : live ? "full_prep" : "preview";
  const approved_by = approvedByArg ? approvedByArg.split("=")[1] : undefined;
  return { live, deleteMenus, confirm, action, approved_by };
}

async function invoke(body) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  const url = process.env.SUPABASE_URL;
  const r = await fetch(`${url}/functions/v1/edp-launch-prep`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      apikey: key,
    },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${text.slice(0, 500)}`);
  return body.format === "json" ? JSON.parse(text) : text;
}

async function main() {
  loadEnv();
  const { live, deleteMenus, confirm, action, approved_by } = parseArgs();

  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  const url = process.env.SUPABASE_URL;
  if (!url || !key) {
    console.error("Missing SUPABASE_URL or API key in .env");
    process.exit(1);
  }

  const mutating = ["merge_collections", "approve_taxonomy", "rename_handles", "wire_menus", "wire_theme", "full_prep"];
  if (live && mutating.includes(action)) {
    console.warn("⚠️  LIVE MODE — modifies Shopify / migration state");
    if (!process.env.EDP_LAUNCH_CONFIRM) {
      console.error("Set EDP_LAUNCH_CONFIRM=1 to proceed");
      process.exit(1);
    }
  }

  if (action === "approve_taxonomy" && !confirm) {
    console.error("approve_taxonomy requires --confirm flag");
    process.exit(1);
  }

  console.log(`\nEuroDroneParts Launch Prep — action=${action} dry_run=${!live}\n`);
  console.log("Phase 0: audit → merge → propose → APPROVE");
  console.log("Phase 1+: preflight → markets → rename → wire → validate → report\n");

  if (["audit_collections", "propose_taxonomy", "preview", "full_prep"].includes(action)) {
    spawnSync("node", ["scripts/run-category-audit.mjs"], { cwd: ROOT, stdio: "inherit" });
  }

  const md = await invoke({
    action,
    dry_run: !live,
    confirm_delete: deleteMenus,
    confirm,
    approved_by,
    format: "markdown",
  });
  writeFileSync(PREP_REPORT, md);
  console.log(`Wrote ${PREP_REPORT}`);

  const summary = await invoke({
    action,
    dry_run: !live,
    confirm_delete: deleteMenus,
    confirm,
    approved_by,
    format: "json",
  });

  if (summary.taxonomy?.proposal) {
    writeFileSync(TAXONOMY_REPORT, md);
    console.log(`Wrote ${TAXONOMY_REPORT}`);
    if (existsSync(CATEGORY_REPORT)) console.log(`(also ${CATEGORY_REPORT})`);
  }

  if (summary.final_report) {
    const finalMd = [
      `# EuroDroneParts — Final Launch Report`,
      ``,
      `**Launch ready:** ${summary.final_report.launch_ready ? "YES" : "NO"}`,
      `**Taxonomy approved:** ${summary.gates?.taxonomy_approved ? "YES" : "NO"}`,
      ``,
      `## Active menus (${summary.final_report.active_menus.length})`,
      ...summary.final_report.active_menus.map((m) => `- \`${m.handle}\` — ${m.title}`),
      ``,
      `## Active domains`,
      ...summary.final_report.active_domains.map((d) =>
        `- ${d.domain} (${d.market}) — ${d.locale} — ${d.status}`),
      ``,
      `## Handles`,
      `- Collections: ${summary.final_report.collection_handles.length}`,
      `- Pages: ${summary.final_report.page_handles.length}`,
      `- Blogs: ${summary.final_report.blog_handles.length}`,
      ``,
      `## Unresolved (${summary.final_report.unresolved_references.length})`,
      ...summary.final_report.unresolved_references.slice(0, 30).map((r) =>
        `- [${r.source}] ${r.reference}: ${r.issue}`),
      summary.final_report.blockers.length
        ? `\n## Blockers\n${summary.final_report.blockers.map((b) => `- ${b}`).join("\n")}`
        : "",
    ].join("\n");
    writeFileSync(FINAL_REPORT, finalMd);
    console.log(`Wrote ${FINAL_REPORT}`);
  }

  console.log(JSON.stringify({
    ok: summary.ok,
    action: summary.action,
    gates: summary.gates,
    taxonomy_approved: summary.gates?.taxonomy_approved,
    merge_summary: summary.taxonomy?.merges?.summary,
    launch_ready: summary.final_report?.launch_ready,
    errors: summary.errors,
  }, null, 2));

  process.exit(summary.ok || (!live && action !== "full_prep") ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
