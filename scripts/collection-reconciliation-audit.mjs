#!/usr/bin/env node
/**
 * Collection reconciliation audit for ActionKing → EUDroneParts.
 *
 * Read-only:
 * - Invokes shopify-cloner-worker action=collection_reconciliation_audit.
 * - Writes MISSING_COLLECTIONS.md with SOURCE_COLLECTIONS / TARGET_COLLECTIONS / MISSING_COLLECTIONS.
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const REPORT = join(ROOT, "MISSING_COLLECTIONS.md");
const DEFAULT_MIGRATION_ID = "3d9876af-885c-49e9-a4b0-c4943c06112f";

function loadDotEnv() {
  const p = join(ROOT, ".env");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 1) continue;
    const key = t.slice(0, eq).trim();
    let value = t.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function esc(value) {
  return String(value ?? "")
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, " ")
    .trim();
}

function renderCollectionTable(rows = [], columns) {
  if (!rows.length) {
    return ["| Handle | Title | Kind | Products | Publish |", "|---|---|---|---:|---|", "| — | — | — | — | — |"].join("\n");
  }
  const header = `| ${columns.join(" | ")} |`;
  const sep = `| ${columns.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => {
    const cells = columns.map((col) => {
      if (col === "Products") return row.products_count == null ? "—" : Number(row.products_count).toLocaleString("sv-SE");
      if (col === "Publish") return esc(row.publish_status || "—");
      if (col === "Kind") return esc(row.kind || "—");
      if (col === "Title") return esc(row.title || "—");
      return esc(row.handle || "—");
    });
    return `| ${cells.join(" | ")} |`;
  });
  return [header, sep, ...body].join("\n");
}

function buildReport(audit, error = null) {
  const counts = audit?.counts || {};
  const lines = [
    "# MISSING_COLLECTIONS",
    "",
    `**Generated:** ${new Date().toISOString()}`,
    "**Scope:** ActionKing source collections vs live EUDroneParts target collections.",
    "**Guardrails:** Read-only audit. No publish. No clone.",
    "",
    "## Audit source",
    "",
    "| Field | Value |",
    "|---|---|",
    `| Action | \`collection_reconciliation_audit\` |`,
    `| Migration | ${esc(audit?.migration_name || "ActionKing - EUDroneParts")} (\`${esc(audit?.migration_id || DEFAULT_MIGRATION_ID)}\`) |`,
    `| Source | ${esc(audit?.source_store?.label || "ActionKing")} / \`${esc(audit?.source_store?.domain || "bvy0b8-0b.myshopify.com")}\` |`,
    `| Target | ${esc(audit?.target_store?.label || "EUDroneParts")} / \`${esc(audit?.target_store?.domain || "ya1xhg-x6.myshopify.com")}\` |`,
    `| Status | ${error ? "ERROR" : "OK"} |`,
    "",
  ];

  if (error) {
    lines.push(
      "## Result",
      "",
      "The collection reconciliation audit could not be executed from this environment.",
      "",
      `**Error:** \`${esc(error)}\``,
      "",
      "Deploy `shopify-cloner-worker` with `collection_reconciliation_audit` where service-role and EUDroneParts Shopify Admin access are available.",
      "",
      "## Summary",
      "",
      "| Metric | Count |",
      "|---|---:|",
      "| SOURCE_COLLECTIONS | Not available until deploy/run |",
      "| TARGET_COLLECTIONS | Not available until deploy/run |",
      "| MISSING_COLLECTIONS | Not available until deploy/run |",
      "",
    );
    return lines.join("\n");
  }

  lines.push(
    "## Summary",
    "",
    "| Metric | Count |",
    "|---|---:|",
    `| SOURCE_COLLECTIONS | ${Number(counts.source_collections || 0).toLocaleString("sv-SE")} |`,
    `| TARGET_COLLECTIONS | ${Number(counts.target_collections || 0).toLocaleString("sv-SE")} |`,
    `| MISSING_COLLECTIONS | ${Number(counts.missing_collections || 0).toLocaleString("sv-SE")} |`,
    `| Source custom collections | ${Number(counts.custom_collections || 0).toLocaleString("sv-SE")} |`,
    `| Source smart collections | ${Number(counts.smart_collections || 0).toLocaleString("sv-SE")} |`,
    `| Source published to target | ${Number(counts.published_on_target || 0).toLocaleString("sv-SE")} |`,
    "",
    "## SOURCE_COLLECTIONS",
    "",
    "Collections scanned in the cloner migration (ActionKing source).",
    "",
    renderCollectionTable(audit.SOURCE_COLLECTIONS, ["Handle", "Title", "Kind", "Products", "Publish"]),
    "",
    "## TARGET_COLLECTIONS",
    "",
    "Collections currently live on the EUDroneParts Shopify store.",
    "",
    renderCollectionTable(audit.TARGET_COLLECTIONS, ["Handle", "Title", "Kind", "Products"]),
    "",
    "## MISSING_COLLECTIONS",
    "",
    "Source migration collections whose handle is not present on the target store.",
    "",
    renderCollectionTable(audit.MISSING_COLLECTIONS, ["Handle", "Title", "Kind", "Products", "Publish"]),
    "",
  );

  return lines.join("\n");
}

async function main() {
  loadDotEnv();
  if (process.env.AUDIT_JSON_PATH && existsSync(process.env.AUDIT_JSON_PATH)) {
    const audit = JSON.parse(readFileSync(process.env.AUDIT_JSON_PATH, "utf8"));
    writeFileSync(REPORT, buildReport(audit), "utf8");
    console.log(`Wrote ${REPORT} (from ${process.env.AUDIT_JSON_PATH})`);
    if (audit?.counts) {
      console.log(
        `SOURCE_COLLECTIONS=${audit.counts.source_collections} TARGET_COLLECTIONS=${audit.counts.target_collections} MISSING_COLLECTIONS=${audit.counts.missing_collections}`,
      );
    }
    return;
  }

  const URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const KEY = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!URL || !KEY) throw new Error("Missing SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY");

  const migrationId = process.env.MIGRATION_ID || DEFAULT_MIGRATION_ID;
  let audit = null;
  let error = null;

  try {
    const r = await fetch(`${URL}/functions/v1/shopify-cloner-worker`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${KEY}`,
        apikey: KEY,
      },
      body: JSON.stringify({ action: "collection_reconciliation_audit", migration_id: migrationId }),
    });
    const text = await r.text();
    let json;
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(`Invalid JSON (${r.status}): ${text.slice(0, 300)}`);
    }
    if (!r.ok || json.ok === false) throw new Error(json.error || text.slice(0, 300));
    if (json.action !== "collection_reconciliation_audit" || !Array.isArray(json.SOURCE_COLLECTIONS)) {
      throw new Error(
        "collection_reconciliation_audit is not deployed on shopify-cloner-worker yet (got worker queue response instead of audit payload)",
      );
    }
    audit = json;
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  const markdown = buildReport(audit, error);
  writeFileSync(REPORT, markdown, "utf8");
  console.log(`Wrote ${REPORT}`);
  if (audit?.counts) {
    console.log(
      `SOURCE_COLLECTIONS=${audit.counts.source_collections} TARGET_COLLECTIONS=${audit.counts.target_collections} MISSING_COLLECTIONS=${audit.counts.missing_collections}`,
    );
  }
  if (error) process.exit(1);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
