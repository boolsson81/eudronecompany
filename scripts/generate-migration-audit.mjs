#!/usr/bin/env node
/**
 * Read-only migration audit using deployed worker endpoints.
 * Writes EURODRONEPARTS_MIGRATION_AUDIT.md
 *
 * Optional env:
 *   APPROVED_RESTORE_HANDLES=comma,separated,handles
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPORT = join(ROOT, "EURODRONEPARTS_MIGRATION_AUDIT.md");
const GAP_REPORT = join(ROOT, "COLLECTION_GAP_AUDIT.md");
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

function approvedHandles() {
  const raw = process.env.APPROVED_RESTORE_HANDLES || "";
  return raw.split(",").map((h) => h.trim()).filter(Boolean);
}

async function worker(action, body = {}) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  const r = await fetch(`${process.env.SUPABASE_URL}/functions/v1/shopify-cloner-worker`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      apikey: key,
    },
    body: JSON.stringify({ action, migration_id: MIGRATION_ID, ...body }),
  });
  const json = await r.json();
  if (!r.ok && !json.ok && !json.gap) throw new Error(json.error || JSON.stringify(json).slice(0, 300));
  return json;
}

function fallbackMarkdown({ gap, discover, pre250, smartCustom }) {
  const gates = pre250?.gates || {};
  const publishedProducts = discover?.resolved_migration?.published_count ?? null;
  const blockers = [];

  if (gap?.counts?.pending_restore_approval > 0) {
    blockers.push({
      severity: "medium",
      affected: gap.pending_restore_approval.slice(0, 20).map((r) => r.handle).join(", "),
      fix: `${gap.counts.pending_restore_approval} collections need manual restore approval before republish.`,
    });
  }
  if (smartCustom.length) {
    blockers.push({
      severity: "high",
      affected: smartCustom.join(", "),
      fix: "Run smart_collection_mapping_fix for SMART_COLLECTION_RECOVERY_HANDLES (DJI drone collections; in-place rule remapping only).",
    });
  }
  if ((gates.collection_link_failed || 0) > 0) {
    blockers.push({
      severity: "medium",
      affected: `${gates.collection_link_failed} collection_link_failed logs`,
      fix: "Run retroactive link_collections for live collections only.",
    });
  }

  const lines = [
    "# EuroDroneParts Migration Audit",
    "",
    `**Generated:** ${new Date().toISOString()}`,
    `**Migration:** ActionKing → EuroDroneParts (\`${MIGRATION_ID}\`)`,
    "",
    "## Products",
    "",
    "| Metric | Count |",
    "|---|---:|",
    `| Total source | ${publishedProducts ?? "—"} |`,
    `| Published in DB | ${publishedProducts ?? "—"} |`,
    `| Failed | ${gates.target_failed_count || 0} |`,
    "",
    "## Collections (three-way comparison)",
    "",
    "| Metric | Count |",
    "|---|---:|",
    `| Source (migration scan) | ${gap?.comparison?.source_collections ?? "—"} |`,
    `| Migration DB published | ${gap?.comparison?.db_published ?? "—"} |`,
    `| Live target Shopify | ${gap?.comparison?.live_target_collections ?? "—"} |`,
    `| On target | ${gap?.counts?.on_target ?? "—"} |`,
    `| Intentionally deleted / excluded | ${gap?.counts?.intentionally_deleted_excluded ?? "—"} |`,
    `| Should restore | ${gap?.counts?.should_restore ?? "—"} |`,
    `| Unknown | ${gap?.counts?.unknown ?? "—"} |`,
    `| Pending restore approval | ${gap?.counts?.pending_restore_approval ?? "—"} |`,
    `| Smart on source / custom on target (11 DJI) | ${smartCustom.length} |`,
    "",
    "_Missing collections are classified — not all are blockers. Intentionally deleted collections are excluded from auto-restore._",
    "",
    "## Remaining blockers",
    "",
  ];

  for (const b of blockers) {
    lines.push(`### ${b.severity.toUpperCase()}`, "", `**Affected:** ${b.affected}`, "", `**Recommended fix:** ${b.fix}`, "");
  }
  if (!blockers.length) lines.push("_No blockers identified._");

  if (gap?.markdown) {
    lines.push("---", "", gap.markdown);
  }

  return lines.join("\n");
}

async function main() {
  loadEnv();
  const approved = approvedHandles();

  const [gapRes, discover, pre250, collAudit] = await Promise.all([
    worker("collection_gap_audit", { approved_restore_handles: approved }).catch(() => null),
    worker("pre_250_discover").catch(() => null),
    worker("pre_250_audit", { limit: 10 }).catch(() => null),
    worker("collection_reconciliation_audit").catch(() => null),
  ]);

  const gap = gapRes?.gap || null;
  if (gapRes?.markdown) writeFileSync(GAP_REPORT, gapRes.markdown);

  const targetByHandle = new Map((collAudit?.TARGET_COLLECTIONS || []).map((c) => [c.handle, c]));
  const SMART_RECOVERY = [
    "dji-air-3-tillbehor-omfattande-sortiment", "dji-avata-2-tillbehor", "dji-flip-tillbehor",
    "dji-mini-3-tillbehor", "dji-neo-2-tillbehor", "dji-neo-tillbehor",
  ];
  const smartCustom = SMART_RECOVERY.filter((h) => targetByHandle.get(h)?.kind === "custom");

  let markdown = null;
  try {
    const full = await worker("migration_audit_report", { approved_restore_handles: approved });
    markdown = full.markdown;
  } catch {
    markdown = fallbackMarkdown({ gap, discover, pre250, smartCustom });
  }

  writeFileSync(REPORT, markdown);
  console.log(`Wrote ${REPORT}`);
  if (existsSync(GAP_REPORT)) console.log(`Wrote ${GAP_REPORT}`);
  if (gap?.counts) {
    console.log(JSON.stringify({
      intentionally_deleted: gap.counts.intentionally_deleted_excluded,
      should_restore: gap.counts.should_restore,
      pending_approval: gap.counts.pending_restore_approval,
      unknown: gap.counts.unknown,
    }, null, 2));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
