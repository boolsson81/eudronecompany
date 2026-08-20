#!/usr/bin/env node
/**
 * Local read-only cloner audits (no deploy required).
 * Requires in .env or environment:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN
 * Optional: SHOPIFY_ADMIN_ACCESS_TOKEN, SHOPIFY_STORE_DOMAIN (ActionKing)
 *
 * Writes: MISSING_COLLECTIONS.md, CLONER_FINAL_VERIFICATION_REPORT.md
 */
import { spawnSync } from "child_process";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DENO = process.env.DENO_BIN || "/home/ubuntu/.deno/bin/deno";
const MIGRATION_ID = process.env.MIGRATION_ID || "3d9876af-885c-49e9-a4b0-c4943c06112f";
const PRODUCT_BATCH = Number(process.env.PRODUCT_BATCH || 800);

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

function requireEnv(name) {
  if (!process.env[name]) throw new Error(`Missing ${name}`);
}

function denoEval(code) {
  const r = spawnSync(DENO, ["eval", code], {
    cwd: ROOT,
    env: process.env,
    encoding: "utf8",
    maxBuffer: 120 * 1024 * 1024,
  });
  if (r.status !== 0) throw new Error(r.stderr || r.stdout || "deno eval failed");
  return r.stdout.trim();
}

async function main() {
  loadEnv();
  requireEnv("SUPABASE_URL");
  requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  requireEnv("EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN");

  const collection = JSON.parse(denoEval(`
import { createClient } from "npm:@supabase/supabase-js@2";
import { buildCollectionReconciliationAudit } from "./supabase/functions/_shared/collection-reconciliation-audit.ts";
const admin = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
const mid = "${MIGRATION_ID}";
const { data: migration } = await admin.from("cloner_migrations").select("*").eq("id", mid).single();
const { data: source } = await admin.from("cloner_stores").select("*").eq("id", migration.source_store_id).single();
const { data: target } = await admin.from("cloner_stores").select("*").eq("id", migration.target_store_id).single();
console.log(JSON.stringify(await buildCollectionReconciliationAudit(admin, {
  migrationId: migration.id,
  migrationName: migration.name,
  resolution: "local deno runner",
  sourceStore: source,
  targetStore: target,
})));
`));

  let merged = null;
  for (let offset = 0; ; offset += PRODUCT_BATCH) {
    const chunk = JSON.parse(denoEval(`
import { createClient } from "npm:@supabase/supabase-js@2";
import { buildClonerFinalVerificationAudit } from "./supabase/functions/_shared/cloner-final-verification-audit.ts";
const admin = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
const mid = "${MIGRATION_ID}";
const { data: migration } = await admin.from("cloner_migrations").select("*").eq("id", mid).single();
const { data: source } = await admin.from("cloner_stores").select("*").eq("id", migration.source_store_id).single();
const { data: target } = await admin.from("cloner_stores").select("*").eq("id", migration.target_store_id).single();
console.log(JSON.stringify(await buildClonerFinalVerificationAudit(admin, {
  migrationId: migration.id,
  migrationName: migration.name,
  resolution: "local deno runner",
  sourceStore: source,
  targetStore: target,
  productOffset: ${offset},
  productLimit: ${PRODUCT_BATCH},
})));
`));
    if (!merged) merged = chunk;
    else {
      const p = chunk.sections.products;
      const verifyMissing = (p.missing || 0) - (p.not_published || 0);
      merged.sections.products.matched += p.matched || 0;
      merged.sections.products.different += p.different || 0;
      merged.sections.products._verify_missing = (merged.sections.products._verify_missing || 0) + verifyMissing;
      merged.sections.products.samples_missing.push(...(p.samples_missing || []));
      merged.sections.products.samples_different.push(...(p.samples_different || []));
      for (const key of ["metafields", "variants", "inventory", "images", "seo"]) {
        merged.sections[key].missing += chunk.sections[key].missing || 0;
        merged.sections[key].different += chunk.sections[key].different || 0;
        merged.sections[key].samples_missing.push(...(chunk.sections[key].samples_missing || []));
        merged.sections[key].samples_different.push(...(chunk.sections[key].samples_different || []));
      }
      merged.product_progress = chunk.product_progress;
      merged.verdict = chunk.verdict;
      merged.blockers = chunk.blockers;
    }
    if (chunk.product_progress?.complete) break;
  }

  const p = merged.sections.products;
  p.missing = (p.not_published || 0) + (p._verify_missing || 0);

  const { spawnSync } = await import("child_process");
  writeFileSync(join(ROOT, ".audit-collection.json"), JSON.stringify(collection), "utf8");
  writeFileSync(join(ROOT, ".audit-final.json"), JSON.stringify(merged), "utf8");

  spawnSync("node", [join(ROOT, "scripts/collection-reconciliation-audit.mjs")], {
    stdio: "inherit",
    env: { ...process.env, AUDIT_JSON_PATH: join(ROOT, ".audit-collection.json") },
  });
  spawnSync("node", [join(ROOT, "scripts/cloner-final-verification-audit.mjs")], {
    stdio: "inherit",
    env: { ...process.env, AUDIT_JSON_PATH: join(ROOT, ".audit-final.json") },
  });

  console.log("\nSummary:");
  console.log(`SOURCE_COLLECTIONS=${collection.counts.source_collections}`);
  console.log(`TARGET_COLLECTIONS=${collection.counts.target_collections}`);
  console.log(`MISSING_COLLECTIONS=${collection.counts.missing_collections}`);
  console.log(`Products source=${merged.sections.products.source_count} target=${merged.sections.products.target_count} missing=${merged.sections.products.missing}`);
  console.log(`Variants missing=${merged.sections.variants.missing} different=${merged.sections.variants.different}`);
  console.log(`Images missing=${merged.sections.images.missing}`);
  console.log(`Metafields missing=${merged.sections.metafields.missing} different=${merged.sections.metafields.different}`);
  console.log(`Inventory different=${merged.sections.inventory.different}`);
  console.log(`SEO missing=${merged.sections.seo.missing} different=${merged.sections.seo.different}`);
  console.log(`Verdict: ${merged.verdict}`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
