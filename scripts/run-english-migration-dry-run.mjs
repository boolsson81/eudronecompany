#!/usr/bin/env node
/**
 * Orchestrates English migration dry-run verification:
 * 1. Collection merge executor (live product GID union)
 * 2. Redirect executor (validation + live conflict check)
 * 3. Combined report + final execution plan
 *
 * NO LIVE CHANGES — dry-run only unless --execute with ALLOW_LIVE_MIGRATION=1
 */
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { writeFileSync } from "fs";
import { runCollectionMergeExecutor } from "./executors/collection-merge-executor.mjs";
import { runRedirectExecutor } from "./executors/redirect-executor.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPORT = join(ROOT, "ENGLISH_MIGRATION_DRY_RUN_REPORT.md");
const PLAN = join(ROOT, "ENGLISH_MIGRATION_EXECUTION_PLAN.md");

function mdTable(rows, cols) {
  if (!rows.length) return "_None._\n";
  const header = `| ${cols.join(" | ")} |`;
  const sep = `| ${cols.map(() => "---").join(" | ")} |`;
  const body = rows.map((r) => `| ${cols.map((c) => String(r[c] ?? "").replace(/\|/g, "\\|")).join(" | ")} |`);
  return [header, sep, ...body].join("\n") + "\n";
}

async function main() {
  const execute = process.argv.includes("--execute");
  if (execute) {
    console.error("Execute mode not enabled in this release. Dry-run only.");
    process.exit(1);
  }

  console.log("=== English Migration Dry-Run ===\n");

  console.log("1/2 Collection merge executor (live product GID fetch)...");
  const merge = await runCollectionMergeExecutor({ execute: false });

  console.log("\n2/2 Redirect executor (validation + live conflict check)...");
  const redirects = await runRedirectExecutor({ execute: false, liveCheck: true });

  const pass = merge.all_pass && redirects.pass;

  const report = [
    "# English Migration Dry-Run Report",
    "",
    `**Generated:** ${new Date().toISOString()}`,
    `**Store:** ${merge.domain}`,
    `**Mode:** DRY-RUN — **no live changes**`,
    "",
    "## Summary",
    "",
    `| Check | Result |`,
    `|---|---|`,
    `| Collection merge verification | **${merge.all_pass ? "PASS" : "FAIL"}** |`,
    `| Redirect validation | **${redirects.validation.pass ? "PASS" : "FAIL"}** |`,
    `| Redirect live conflicts | **${redirects.conflicts.length === 0 ? "PASS" : "FAIL"}** (${redirects.conflicts.length} conflicts) |`,
    `| **Overall** | **${pass ? "PASS — ready for execution approval" : "FAIL — resolve conflicts first"}** |`,
    "",
    "---",
    "",
    "## 1. Collection merges",
    "",
    `**${merge.merge_groups}** merge groups · **${merge.total_union_products}** unique products across all groups`,
    "",
    mdTable(
      merge.groups.map((g) => ({
        canonical: g.canonical_handle,
        sources: g.sources,
        sum_before: g.sum_source_products,
        union_after: g.union_unique_products,
        overlap: g.overlap_products,
        canonical_exists: g.canonical_exists,
        products_would_lose: g.products_would_lose,
        verification: g.verification,
      })),
      ["canonical", "sources", "sum_before", "union_after", "overlap", "canonical_exists", "products_would_lose", "verification"],
    ),
    "",
    "### Product count before / after",
    "",
    "| Canonical | Before (sum of sources) | After (unique union) | Overlap | Net change |",
    "|---|---:|---:|---:|---|",
    ...merge.groups.map(
      (g) =>
        `| \`${g.canonical_handle}\` | ${g.sum_source_products} | ${g.union_unique_products} | ${g.overlap_products} | ${g.union_unique_products - g.sum_source_products <= 0 ? "No product loss (overlap reduced count)" : "+" + (g.union_unique_products - g.sum_source_products)} |`,
    ),
    "",
    merge.conflicts.length
      ? `### Conflicts\n\n${mdTable(merge.conflicts, ["type", "canonical", "handle"])}\n`
      : "",
    merge.warnings?.length
      ? `### Warnings (audit count drift — GID fetch authoritative)\n\n${mdTable(merge.warnings, ["type", "canonical", "handle", "reported", "fetched", "note"])}\n`
      : "",
    "",
    "---",
    "",
    "## 2. Redirects",
    "",
    `| Metric | Value |`,
    `|---|---:|`,
    `| Total rules | ${redirects.total_rules} |`,
    `| Unique from-paths | ${redirects.validation.unique_from} |`,
    `| Validation loops | ${redirects.validation.loops} |`,
    `| Validation duplicates | ${redirects.validation.duplicates} |`,
    `| Live paths checked | ${redirects.live_check.checked} |`,
    `| Would create (new) | ${redirects.would_create} |`,
    `| Already exist (correct target) | ${redirects.live_check.existing_ok} |`,
    `| Live conflicts | ${redirects.conflicts.length} |`,
    "",
    "### By resource type",
    "",
    mdTable(
      Object.entries(redirects.by_type).map(([type, count]) => ({ resource_type: type, count })),
      ["resource_type", "count"],
    ),
    "",
    redirects.conflicts.length
      ? `### Redirect conflicts\n\n${mdTable(redirects.conflicts, ["type", "from_path", "planned_target", "existing_target"])}\n`
      : "",
    "",
    "---",
    "",
    "## 3. Artifacts",
    "",
    "| File | Description |",
    "|---|---|",
    "| `MERGE_EXECUTOR_REPORT.csv` | Per-group merge dry-run results |",
    "| `REDIRECT_EXECUTOR_REPORT.csv` | All redirect rules (pending) |",
    "| `.merge-executor-result.json` | Machine-readable merge result |",
    "| `.redirect-executor-result.json` | Machine-readable redirect result |",
    "",
    "## Regenerate",
    "",
    "```bash",
    "node scripts/run-english-migration-dry-run.mjs",
    "```",
    "",
  ];

  writeFileSync(REPORT, report.join("\n"), "utf8");

  const plan = [
    "# English Migration — Final Execution Plan",
    "",
    `**Generated:** ${new Date().toISOString()}`,
    `**Dry-run status:** ${pass ? "✅ PASS" : "❌ FAIL"}`,
    "**Awaiting:** Final human approval before `Execute`",
    "",
    "## Pre-conditions (verified)",
    "",
    pass
      ? [
          "- [x] Collection merge dry-run: all product GIDs fetched, union computed, **0 products would be lost**",
          "- [x] Redirect mapping: 320 rules, validation PASS, no live target conflicts",
          "- [x] Executors built and tested in dry-run mode",
        ].join("\n")
      : [
          "- [ ] Resolve dry-run failures in `ENGLISH_MIGRATION_DRY_RUN_REPORT.md`",
        ].join("\n"),
    "",
    "## Execution sequence (when approved)",
    "",
    "### Phase A — Collection merges (5 groups)",
    "",
    ...merge.groups.map(
      (g, i) =>
        `${i + 1}. **\`${g.canonical_handle}\`** — ${g.action_plan}\n   - Union: ${g.union_unique_products} unique products from ${g.source_count} sources\n   - ${g.overlap_products > 0 ? `Overlap: ${g.overlap_products} duplicate memberships` : "No overlap"}`,
    ),
    "",
    "### Phase B — Collection handle renames (non-merge)",
    "",
    "Rename remaining Swedish collection handles per `COLLECTION_HANDLE_MAPPING.csv` (58 renames).",
    "",
    "### Phase C — Page & blog handle renames",
    "",
    "- 15 page renames per `PAGE_HANDLE_MAPPING.csv`",
    "- Blog `nyheter` → `news` + 68 article renames (curate 16 hybrid slugs first)",
    "",
    "### Phase D — Menu handles & links",
    "",
    "| Current | English |",
    "|---|---|",
    "| `enterprise-expansion-deploy` | `enterprise` |",
    "| `spare-parts-deploy` | `spare-parts` |",
    "| `service-support-deploy` | `service-support` |",
    "| `b2b-enterprise-deploy` | `business` |",
    "",
    "Rebuild all menu links to English URLs. Labels stay English in admin; localize via Markets.",
    "",
    "### Phase E — Redirects (320 rules)",
    "",
    "```bash",
    "# Batch deploy from REDIRECT_MAPPING.csv via shopify-create-redirects",
    "# Recommended: dryRun first per batch of 50",
    "```",
    "",
    `Dry-run: **${redirects.would_create}** new redirects to create, **${redirects.live_check.existing_ok}** already correct.`,
    "",
    "### Phase F — Shopify Markets",
    "",
    "Configure markets: `.com`, `.de`, `.dk`, `.fr`, `.nl`, `.es`, `.it`",
    "Enable Translate & Adapt for menu labels, collection titles, page titles, product content.",
    "**Do not** create locale-specific handles.",
    "",
    "### Phase G — Post-execution verification",
    "",
    "```bash",
    "node scripts/run-english-migration-dry-run.mjs",
    "node scripts/verify-pre-execution.mjs",
    "```",
    "",
    "## Rollback",
    "",
    "- Redirects: export `urlRedirects` before Phase E; delete new rules if needed",
    "- Collections: keep deleted merge source handles in CSV for manual restore",
    "- Menus: export menu JSON before Phase D",
    "",
    "## Approval",
    "",
    "- [ ] Dry-run report reviewed (`ENGLISH_MIGRATION_DRY_RUN_REPORT.md`)",
    "- [ ] Execution plan approved (this document)",
    "- [ ] Blog hybrid slugs curated",
    "- [ ] Maintenance window agreed",
    "",
    "**Sign off to proceed:** Reply `Execute` with confirmation.",
    "",
  ];

  writeFileSync(PLAN, plan.join("\n"), "utf8");

  console.log(`\nWrote ${REPORT}`);
  console.log(`Wrote ${PLAN}`);
  console.log(`\nOverall: ${pass ? "PASS" : "FAIL"}`);
  process.exit(pass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
