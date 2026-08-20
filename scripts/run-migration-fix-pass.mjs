#!/usr/bin/env node
/**
 * EuroDroneParts migration fix pass runner.
 * Invokes deployed edge functions (no local Deno required).
 *
 * Requires in .env:
 *   SUPABASE_URL
 *   SUPABASE_PUBLISHABLE_KEY (or SUPABASE_SERVICE_ROLE_KEY)
 *
 * Writes: EURODRONEPARTS_MIGRATION_AUDIT.md
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPORT = join(ROOT, "EURODRONEPARTS_MIGRATION_AUDIT.md");
const MIGRATION_ID = process.env.MIGRATION_ID || "3d9876af-885c-49e9-a4b0-c4943c06112f";

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

async function invokeWorker(action, body = {}) {
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
    body: JSON.stringify({ action, migration_id: MIGRATION_ID, ...body }),
  });
  const text = await r.text();
  const json = text ? JSON.parse(text) : {};
  if (!r.ok) throw new Error(json.error || text.slice(0, 400));
  return json;
}

async function invokeFixPass(body = {}) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  const url = process.env.SUPABASE_URL;
  const r = await fetch(`${url}/functions/v1/cloner-fix-collections-and-menus`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      apikey: key,
    },
    body: JSON.stringify({ migration_id: MIGRATION_ID, include_audit: true, ...body }),
  });
  const text = await r.text();
  const json = text ? JSON.parse(text) : {};
  if (!r.ok) throw new Error(json.error || text.slice(0, 400));
  return json;
}

async function main() {
  loadEnv();
  const dryRun = process.argv.includes("--dry-run");
  const auditOnly = process.argv.includes("--audit-only");

  let result;
  if (auditOnly) {
    result = await invokeWorker("migration_audit_report");
    writeFileSync(REPORT, result.markdown || JSON.stringify(result.audit, null, 2));
    console.log(`Wrote ${REPORT}`);
    return;
  }

  try {
    result = await invokeFixPass({ dry_run: dryRun });
  } catch (e) {
    console.warn("cloner-fix-collections-and-menus not deployed yet, falling back to worker actions:", e.message);
    const collections = await invokeWorker("smart_collection_mapping_fix", { dry_run: dryRun });
    const menus = await invokeWorker("menu_recovery_fix", { dry_run: dryRun });
    const audit = await invokeWorker("migration_audit_report");
    result = { collections, menus, audit: audit.audit, audit_markdown: audit.markdown };
  }

  writeFileSync(REPORT, result.audit_markdown || JSON.stringify(result, null, 2));
  console.log(`Wrote ${REPORT}`);
  console.log(JSON.stringify({
    collections: result.collections?.summary,
    menus: result.menus?.summary,
    blockers: result.audit?.remaining_blockers?.length,
  }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
