#!/usr/bin/env node
/**
 * EuroDroneParts — Final Migration Recovery Pass
 *
 * Tasks:
 *   1. Menu audit (read-only, no deletions)
 *   2. Collection membership recovery for smart→custom collections
 *   3. Migration quality audit (batched, read-only)
 *   4. Readiness score
 *
 * Usage:
 *   node scripts/migration-recovery-pass.mjs
 *   node scripts/migration-recovery-pass.mjs --dry-run          # skip collection writes
 *   node scripts/migration-recovery-pass.mjs --menu-only
 *   node scripts/migration-recovery-pass.mjs --fn migration-recovery-pass
 */
import { readFileSync, existsSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPORT = join(ROOT, "EDP_MIGRATION_RECOVERY_REPORT.md");
const MIGRATION_ID = process.env.MIGRATION_ID || "3d9876af-885c-49e9-a4b0-c4943c06112f";
const PRODUCT_BATCH = Number(process.env.PRODUCT_BATCH || 400);

const DRY_RUN = process.argv.includes("--dry-run");
const MENU_ONLY = process.argv.includes("--menu-only");
const FN = process.argv.includes("--fn")
  ? process.argv[process.argv.indexOf("--fn") + 1]
  : process.env.RECOVERY_FN || "cloner-fix-collections-and-menus";

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

async function invokeEdge(body) {
  const url =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    "https://jzqgwsryxmgzcbjjddic.supabase.co";
  const anon =
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!anon) throw new Error("Missing publishable anon key in .env");

  const endpoint = FN === "shopify-cloner-worker"
    ? { fn: "shopify-cloner-worker", payload: { action: "migration_recovery_pass", migration_id: MIGRATION_ID, ...body } }
    : FN === "cloner-fix-collections-and-menus"
    ? { fn: FN, payload: { action: "migration_recovery_pass", migration_id: MIGRATION_ID, ...body } }
    : { fn: FN, payload: { migration_id: MIGRATION_ID, ...body } };

  const r = await fetch(`${url}/functions/v1/${endpoint.fn}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${anon}`,
      apikey: anon,
    },
    body: JSON.stringify(endpoint.payload),
  });
  const text = await r.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { error: text.slice(0, 500) };
  }
  if (!r.ok) throw new Error(`${endpoint.fn} ${r.status}: ${json.error || text.slice(0, 400)}`);
  if (json.ok === false) throw new Error(json.error || "edge function error");
  if (body.tasks && !body.tasks.every((t) => t === "readiness") && json.action !== "migration_recovery_pass" && !json.menu_audit) {
    throw new Error(
      `${endpoint.fn} does not have migration_recovery_pass deployed yet (got legacy fix response). Deploy cloner-fix-collections-and-menus first.`,
    );
  }
  return json;
}

function mdTable(headers, rows) {
  const esc = (v) => String(v ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
  const line = (cells) => `| ${cells.map(esc).join(" | ")} |`;
  return [line(headers), line(headers.map(() => "---")), ...rows.map((r) => line(r))].join("\n");
}

function renderReport(data) {
  const lines = [];
  lines.push("# EuroDroneParts — Migration Recovery Report");
  lines.push("");
  lines.push(`**Generated:** ${data.generated_at}`);
  lines.push(`**Migration:** ${data.migration_name} (\`${data.migration_id}\`)`);
  lines.push(`**Source:** ${data.source_domain}`);
  lines.push(`**Target:** ${data.target_domain}`);
  lines.push("");
  lines.push("**Guardrails:** No menus/collections/products deleted. Collection recovery adds missing products only.");
  lines.push("");

  if (data.menu_audit) {
    const ma = data.menu_audit;
    lines.push("## Task 1 — Menu Audit");
    lines.push("");
    lines.push(`Total menus on target: **${ma.total_menus}**`);
    lines.push("");
    lines.push("### Classification summary");
    lines.push("");
    lines.push(mdTable(
      ["Classification", "Count"],
      Object.entries(ma.by_classification).sort((a, b) => b[1] - a[1]),
    ));
    lines.push("");
    lines.push("### All menus");
    lines.push("");
    lines.push(mdTable(
      ["Handle", "Title", "Items", "Last updated", "Classification", "In migration", "Recommendation"],
      ma.menus.map((m) => [
        m.handle,
        m.title,
        m.item_count,
        m.last_updated ? m.last_updated.slice(0, 10) : "—",
        m.classification,
        m.in_source_migration ? (m.migration_publish_status || "yes") : "no",
        m.recommendation,
      ]),
    ));
    lines.push("");
    lines.push("### Recommendations");
    lines.push("");
    for (const rec of ma.recommendations) lines.push(`- ${rec}`);
    lines.push("");
  }

  if (data.collection_recovery) {
    const cr = data.collection_recovery;
    lines.push("## Task 2 — Collection Membership Recovery");
    lines.push("");
    lines.push(`Smart→custom collections processed: **${cr.collections_processed}**`);
    lines.push(`Total products added: **${cr.total_added}**${DRY_RUN ? " (dry-run — no writes)" : ""}`);
    lines.push("");
    lines.push(mdTable(
      ["Collection", "Source count", "Target before", "Added", "Final count", "Unmapped", "Error"],
      cr.rows.map((r) => [
        `${r.title} (\`${r.handle}\`)`,
        r.source_product_count,
        r.target_product_count_before,
        r.added_products,
        r.final_product_count,
        r.skipped_unmapped,
        r.error || "—",
      ]),
    ));
    if (cr.rows.some((r) => r.added_handles_sample?.length)) {
      lines.push("");
      lines.push("### Sample added product handles");
      lines.push("");
      for (const r of cr.rows.filter((x) => x.added_handles_sample?.length)) {
        lines.push(`- **${r.handle}:** ${r.added_handles_sample.join(", ")}`);
      }
    }
    lines.push("");
  }

  if (data.quality_audit) {
    const qa = data.quality_audit;
    lines.push("## Task 3 — Migration Quality Audit");
    lines.push("");
    lines.push("### Products (sampled)");
    lines.push("");
    lines.push(mdTable(
      ["Check", "Count in sample"],
      [
        ["Products checked", qa.products.checked],
        ["Missing images", qa.products.missing_images],
        ["Missing variants", qa.products.missing_variants],
        ["Zero inventory variants", qa.products.zero_inventory],
        ["No metafields", qa.products.missing_metafields],
        ["Not ACTIVE status", qa.products.not_active],
      ],
    ));
    lines.push("");
    lines.push(`Product audit progress: ${qa.product_progress.offset + qa.product_progress.limit}/${qa.product_progress.total} (${qa.product_progress.complete ? "complete" : "partial batch"})`);
    lines.push("");
    lines.push("### Collections");
    lines.push("");
    lines.push(mdTable(
      ["Metric", "Value"],
      [
        ["Live on target", qa.collections.live_on_target],
        ["Published in migration", qa.collections.migration_published],
        ["Empty on target", qa.collections.empty_on_target],
        ["Missing vs migration (approx)", qa.collections.missing_vs_migration],
      ],
    ));
    lines.push("");
    lines.push("### Menus — broken links");
    lines.push("");
    lines.push(mdTable(
      ["Link type", "Broken count"],
      [
        ["Collection links", qa.menus.broken_collection_links],
        ["Page links", qa.menus.broken_page_links],
        ["Customer account links", qa.menus.broken_customer_account_links],
      ],
    ));
    lines.push("");
    if (qa.samples.broken_menu_collection_links?.length) {
      lines.push("Sample broken collection links:");
      for (const s of qa.samples.broken_menu_collection_links.slice(0, 10)) {
        lines.push(`- ${s.menu_item}: ${s.url}`);
      }
      lines.push("");
    }
    if (qa.samples.empty_collections?.length) {
      lines.push(`Empty collections (first ${qa.samples.empty_collections.length}):`);
      for (const s of qa.samples.empty_collections.slice(0, 15)) {
        lines.push(`- \`${s.handle}\` — ${s.title}`);
      }
      lines.push("");
    }
  }

  if (data.readiness) {
    const r = data.readiness;
    lines.push("## Task 4 — Readiness Score");
    lines.push("");
    lines.push(`**Migration completion:** ${r.completion_percent}%`);
    lines.push("");
    lines.push("### Critical blockers");
    lines.push("");
    if (!r.critical_blockers.length) lines.push("- None identified in this pass.");
    else for (const b of r.critical_blockers) lines.push(`- ${b}`);
    lines.push("");
    lines.push("### Recommended next actions");
    lines.push("");
    for (const a of r.recommended_next_actions) lines.push(`- ${a}`);
    lines.push("");
    lines.push(`**Estimated effort remaining:** ${r.estimated_effort_remaining}`);
    lines.push("");
    lines.push("### Deferred (non-blockers)");
    lines.push("");
    for (const d of r.deferred_items) lines.push(`- ${d}`);
    lines.push("");
  }

  return lines.join("\n");
}

async function main() {
  loadEnv();
  console.log(`Recovery pass via ${FN} (migration ${MIGRATION_ID})`);

  const tasks = MENU_ONLY
    ? ["menu_audit"]
    : ["menu_audit", "collection_recovery", "quality_audit"];

  let merged = null;
  for (let offset = 0; ; offset += PRODUCT_BATCH) {
    const chunk = await invokeEdge({
      tasks: offset === 0 ? tasks : ["quality_audit"],
      dry_run: DRY_RUN,
      product_offset: offset,
      product_limit: PRODUCT_BATCH,
    });

    if (!merged) {
      merged = chunk;
    } else if (chunk.quality_audit && merged.quality_audit) {
      const p = chunk.quality_audit.products;
      const m = merged.quality_audit.products;
      for (const k of Object.keys(p)) {
        if (typeof p[k] === "number") m[k] = (m[k] || 0) + p[k];
      }
      merged.quality_audit.product_progress = chunk.quality_audit.product_progress;
      for (const [k, v] of Object.entries(chunk.quality_audit.samples || {})) {
        merged.quality_audit.samples[k] = [...(merged.quality_audit.samples[k] || []), ...(v || [])].slice(0, 30);
      }
    }

    const complete = chunk.quality_audit?.product_progress?.complete;
    if (MENU_ONLY || complete || !chunk.quality_audit) break;
  }

  if (!MENU_ONLY) {
    const readiness = await invokeEdge({
      tasks: ["readiness"],
      dry_run: DRY_RUN,
      product_offset: 0,
      product_limit: 1,
    });
    if (readiness.readiness) merged.readiness = readiness.readiness;
  }

  const md = renderReport(merged);
  writeFileSync(REPORT, md, "utf8");
  writeFileSync(join(ROOT, ".migration-recovery.json"), JSON.stringify(merged, null, 2), "utf8");

  console.log(`\nWrote ${REPORT}`);
  if (merged.readiness) {
    console.log(`Completion: ${merged.readiness.completion_percent}%`);
    console.log(`Blockers: ${merged.readiness.critical_blockers.length}`);
  }
  if (merged.collection_recovery) {
    console.log(`Collection products added: ${merged.collection_recovery.total_added}`);
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
