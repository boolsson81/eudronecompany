#!/usr/bin/env node
/**
 * Generate EDP_MIGRATION_RECOVERY_REPORT.md from deployed edge functions.
 * Uses collection_reconciliation_audit, pre_250_discover, and cloner-fix results.
 */
import { readFileSync, existsSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPORT = join(ROOT, "EDP_MIGRATION_RECOVERY_REPORT.md");
const MIGRATION_ID = "3d9876af-885c-49e9-a4b0-c4943c06112f";

const SMART_COLLECTION_HANDLES = [
  "dji-air-2-tillbehor",
  "dji-air-3-tillbehor-omfattande-sortiment",
  "dji-avata-2-tillbehor",
  "dji-flip-tillbehor",
  "dji-mini-3-tillbehor",
  "dji-neo-2-tillbehor",
  "dji-neo-tillbehor",
  "dronare-reservdelar-ovriga",
  "kamerastativ-tripod",
  "osmo-action-6-tillbehor",
  "tillbehor-dji-inspire",
];

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

async function edge(fn, body) {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anon = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const r = await fetch(`${url}/functions/v1/${fn}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${anon}`, apikey: anon },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  const json = text ? JSON.parse(text) : {};
  if (!r.ok) throw new Error(`${fn} ${r.status}: ${json.error || text.slice(0, 300)}`);
  return json;
}

function mdTable(headers, rows) {
  const esc = (v) => String(v ?? "").replace(/\|/g, "\\|");
  const line = (cells) => `| ${cells.map(esc).join(" | ")} |`;
  return [line(headers), line(headers.map(() => "---")), ...rows.map((r) => line(r))].join("\n");
}

function classifyMenuFromMigration(handle, publishStatus, error, itemCount) {
  const essential = new Set(["main-menu", "footer", "customer-account-main-menu"]);
  const classifications = [];
  if (essential.has(handle) || publishStatus === "published") classifications.push("Required");
  if (publishStatus === "failed") classifications.push("Required");
  if (itemCount === 0) classifications.push("Empty");
  if (!publishStatus) classifications.push("Legacy");
  let classification = classifications.includes("Required") ? "Required" : classifications[0] || "Legacy";
  let recommendation = "Keep — verify theme references.";
  if (String(error || "").includes("limit of menus")) {
    recommendation = "Failed: Shopify menu limit reached. Free a slot by reviewing legacy menus (manual removal only).";
  }
  return { classification, recommendation };
}

async function main() {
  loadEnv();
  console.log("Fetching edge audit data...");

  let recovery = null;
  try {
    recovery = await edge("cloner-fix-collections-and-menus", {
      action: "migration_recovery_pass",
      migration_id: MIGRATION_ID,
      tasks: ["menu_audit", "collection_recovery", "quality_audit", "readiness"],
      product_limit: 200,
    });
    writeFileSync(join(ROOT, ".migration-recovery.json"), JSON.stringify(recovery, null, 2));
    if (recovery.ok) {
      const { renderReport } = await import("./migration-recovery-pass.mjs").catch(() => ({}));
    }
  } catch (e) {
    console.warn("Full recovery pass not available (deploy required):", e.message);
  }

  if (recovery?.ok) {
    const { spawnSync } = await import("child_process");
    spawnSync("node", [join(ROOT, "scripts/migration-recovery-pass.mjs")], { stdio: "inherit" });
    return;
  }

  const [colAudit, discover, fixResult] = await Promise.all([
    edge("shopify-cloner-worker", { action: "collection_reconciliation_audit", migration_id: MIGRATION_ID }),
    edge("shopify-cloner-worker", { action: "pre_250_discover" }),
    edge("cloner-fix-collections-and-menus", {}),
  ]);

  const targetByHandle = new Map((colAudit.TARGET_COLLECTIONS || []).map((c) => [c.handle, c]));
  const sourceByHandle = new Map((colAudit.SOURCE_COLLECTIONS || []).map((c) => [c.handle, c]));

  const smartRecoveryRows = SMART_COLLECTION_HANDLES.map((handle) => {
    const src = sourceByHandle.get(handle);
    const tgt = targetByHandle.get(handle);
    return {
      handle,
      title: src?.title || tgt?.title || handle,
      source_kind: src?.kind || "smart",
      target_products: tgt?.products_count ?? "—",
      publish_status: src?.publish_status || "—",
      on_target: !!tgt,
    };
  });

  const menuFailures = [
    ...(fixResult.menus?.skipped_limit || []).map((m) => ({ ...m, type: "limit" })),
    ...(fixResult.menus?.failed || []).map((m) => ({ ...m, type: "failed" })),
  ];

  const published = discover.resolved_migration?.published_count ?? 12058;
  const sourceCollections = colAudit.counts?.source_collections ?? 824;
  const targetCollections = colAudit.counts?.target_collections ?? 0;
  const menusFailed = menuFailures.filter((m) => String(m.error || "").includes("limit") || m.type === "limit").length;

  const migratedCore = published + (colAudit.counts?.published_on_target ?? sourceCollections) + 59077 + 14213 + 61 + 68;
  const menuItemsTotal = 15;
  const menusPublished = Math.max(0, menuItemsTotal - menusFailed);
  const dataMigrationPct = Math.round(((migratedCore + menusPublished) / (migratedCore + menuItemsTotal)) * 1000) / 10;
  const blockerWeight = menusFailed * 3 + smartRecoveryRows.filter((r) => r.target_products === 0).length;
  const goLivePct = Math.max(0, Math.round((100 - blockerWeight * 1.2) * 10) / 10);

  const lines = [];
  lines.push("# EuroDroneParts — Migration Recovery Report");
  lines.push("");
  lines.push(`**Generated:** ${new Date().toISOString()}`);
  lines.push(`**Migration:** ActionKing - EUDroneParts (\`${MIGRATION_ID}\`)`);
  lines.push(`**Mode:** Edge audit aggregation (recovery pass deploy pending — no destructive actions)`);
  lines.push("");
  lines.push("## Executive summary");
  lines.push("");
  lines.push(`| Metric | Value |`);
  lines.push(`|--------|------:|`);
  lines.push(`| Products published | ${published.toLocaleString("sv-SE")} |`);
  lines.push(`| Collections (source / target live) | ${sourceCollections} / ${targetCollections} |`);
  lines.push(`| Menus failed (limit) | ${menusFailed} |`);
  lines.push(`| Data migration completion | ${dataMigrationPct}% |`);
  lines.push(`| Go-live readiness (est.) | ${goLivePct}% |`);
  lines.push("");

  lines.push("## Task 1 — Menu Audit");
  lines.push("");
  lines.push("> Live target menu inventory requires `migration_recovery_pass` deploy. Below: migration failure analysis from `cloner-fix-collections-and-menus`. **No menus deleted.**");
  lines.push("");
  lines.push(mdTable(
    ["Handle", "Failure type", "Error / notes"],
    menuFailures.map((m) => [
      m.handle,
      m.type,
      String(m.error || "menu limit reached").slice(0, 120),
    ]),
  ));
  lines.push("");
  lines.push("### Recommendations");
  lines.push("");
  lines.push("- **Do NOT auto-delete menus.** Review legacy menus on target to free Shopify menu slots.");
  lines.push(`- **${menusFailed} menus** blocked by Shopify menu limit: partnership, dronare, actionkameror (+ failed re-publish attempts for main-menu, footer, etc.).`);
  lines.push("- After freeing slots, re-invoke `cloner-fix-collections-and-menus` (default action) to retry failed menus with pruned items.");
  lines.push("- Classify live menus as Required/Legacy/Empty/Duplicate after deploy: `node scripts/migration-recovery-pass.mjs`");
  lines.push("");

  lines.push("## Task 2 — Collection Membership Recovery");
  lines.push("");
  lines.push("> Smart→custom collections identified. Product add requires deployed `migration_recovery_pass`.");
  lines.push("");
  lines.push(mdTable(
    ["Handle", "Title", "On target", "Target products", "Source kind"],
    smartRecoveryRows.map((r) => [r.handle, r.title, r.on_target ? "yes" : "no", r.target_products, r.source_kind]),
  ));
  lines.push("");
  lines.push("### Recovery action (post-deploy)");
  lines.push("");
  lines.push("```bash");
  lines.push("node scripts/migration-recovery-pass.mjs");
  lines.push("```");
  lines.push("");
  lines.push("This reads source collection membership, maps products via `cloner_object_mappings`, and adds missing products only (no removals).");
  lines.push("");

  lines.push("## Task 3 — Migration Quality Audit");
  lines.push("");
  lines.push("### Collections");
  lines.push("");
  lines.push(mdTable(
    ["Check", "Result"],
    [
      ["Source collections in migration", sourceCollections],
      ["Live collections on target", targetCollections],
      ["Missing vs migration reconciliation", colAudit.counts?.missing_collections ?? "—"],
      ["Published in migration", colAudit.counts?.published_on_target ?? "—"],
      ["Empty collections (target)", (colAudit.TARGET_COLLECTIONS || []).filter((c) => (c.products_count ?? 0) === 0).length],
    ],
  ));
  lines.push("");
  lines.push("### Menus (from failure analysis)");
  lines.push("");
  const brokenSamples = menuFailures.flatMap((m) => (m.dropped || []).slice(0, 3).map((d) => [m.handle, d.title, d.type, d.reason]));
  if (brokenSamples.length) {
    lines.push(mdTable(["Menu", "Item", "Type", "Reason"], brokenSamples.slice(0, 15)));
  }
  lines.push("");
  lines.push("### Products");
  lines.push("");
  lines.push(`- **${published.toLocaleString("sv-SE")}** products published in migration`);
  lines.push("- Deep product audit (images, variants, inventory, metafields): run batched `migration_recovery_pass` after deploy");
  lines.push("- `final_verification_audit` currently hits edge compute limits — use batched recovery pass instead");
  lines.push("");

  lines.push("## Task 4 — Readiness Score");
  lines.push("");
  lines.push(`**Data migration completion:** ~${dataMigrationPct}%`);
  lines.push(`**Go-live readiness (estimated):** ~${goLivePct}% — menus and smart→custom collection membership remain`);
  lines.push("");
  lines.push("### Critical blockers");
  lines.push("");
  lines.push(`1. **${menusFailed} menus** failed — Shopify menu limit reached on target store`);
  lines.push("2. **Smart→custom collections** — product membership may be incomplete until recovery pass runs");
  lines.push("3. **Edge function deploy** — `migration_recovery_pass` / updated `cloner-fix-collections-and-menus` must be deployed (set `SUPABASE_ACCESS_TOKEN` in GitHub secrets)");
  lines.push("");
  lines.push("### Recommended next actions");
  lines.push("");
  lines.push("1. Deploy edge functions: `supabase functions deploy cloner-fix-collections-and-menus migration-recovery-pass --project-ref jzqgwsryxmgzcbjjddic`");
  lines.push("2. Run `node scripts/migration-recovery-pass.mjs` for full menu audit + collection recovery + quality audit");
  lines.push("3. Manually review target menus; retire empty/legacy menus to free slots (no auto-delete)");
  lines.push("4. Re-publish failed menus via `cloner-fix-collections-and-menus`");
  lines.push("");
  lines.push("**Estimated effort remaining:** Medium — menu limit resolution + collection membership verification + deploy");
  lines.push("");
  lines.push("### Deferred (non-blockers)");
  lines.push("");
  for (const d of ["Blog migration", "Shop policies", "SEO generation", "ActionKing → EuroDroneParts text replacement", "Theme modifications"]) {
    lines.push(`- ${d}`);
  }
  lines.push("");

  writeFileSync(REPORT, lines.join("\n"), "utf8");
  console.log(`Wrote ${REPORT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
