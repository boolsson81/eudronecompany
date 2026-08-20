#!/usr/bin/env node
/**
 * Cloner final verification audit — read-only.
 * Sources: cloner_migration_items + Shopify Admin API + Shopify GraphQL.
 * Writes CLONER_FINAL_VERIFICATION_REPORT.md (no writes to Shopify or Supabase).
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const REPORT = join(ROOT, "CLONER_FINAL_VERIFICATION_REPORT.md");
const DEFAULT_MIGRATION_ID = "3d9876af-885c-49e9-a4b0-c4943c06112f";
const PRODUCT_BATCH = 800;

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

function fmt(n) {
  return Number(n || 0).toLocaleString("sv-SE");
}

function sampleTable(rows, columns) {
  if (!rows?.length) return "_Inga exempel._";
  const header = `| ${columns.join(" | ")} |`;
  const sep = `| ${columns.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${columns.map((c) => esc(row[c])).join(" | ")} |`);
  return [header, sep, ...body].join("\n");
}

function mergeMissingDifferent(base, chunk) {
  return {
    missing: (base?.missing || 0) + (chunk?.missing || 0),
    different: (base?.different || 0) + (chunk?.different || 0),
    samples_missing: [...(base?.samples_missing || []), ...(chunk?.samples_missing || [])].slice(0, 50),
    samples_different: [...(base?.samples_different || []), ...(chunk?.samples_different || [])].slice(0, 50),
  };
}

function mergeSourceTarget(base, chunk) {
  if (!base) return chunk;
  if (!chunk) return base;
  const notPublished = chunk.not_published ?? base.not_published ?? 0;
  const verifyMissing = (base._verify_missing || 0) + (chunk._verify_missing || 0);
  return {
    source_count: chunk.source_count ?? base.source_count,
    target_count: chunk.target_count ?? base.target_count,
    matched: (base.matched || 0) + (chunk.matched || 0),
    not_published: notPublished,
    _verify_missing: verifyMissing,
    missing: notPublished + verifyMissing,
    different: (base.different || 0) + (chunk.different || 0),
    publish_failed: chunk.publish_failed ?? base.publish_failed,
    samples_missing: [...(base.samples_missing || []), ...(chunk.samples_missing || [])].slice(0, 50),
    samples_different: [...(base.samples_different || []), ...(chunk.samples_different || [])].slice(0, 50),
  };
}

async function invokeAudit(url, key, migrationId, productOffset, productLimit) {
  const r = await fetch(`${url}/functions/v1/shopify-cloner-worker`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      apikey: key,
    },
    body: JSON.stringify({
      action: "final_verification_audit",
      migration_id: migrationId,
      product_offset: productOffset,
      product_limit: productLimit,
    }),
  });
  const text = await r.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Invalid JSON (${r.status}): ${text.slice(0, 300)}`);
  }
  if (!r.ok || json.ok === false) throw new Error(json.error || text.slice(0, 300));
  if (json.action !== "final_verification_audit" || !json.sections) {
    throw new Error("final_verification_audit is not deployed on shopify-cloner-worker yet");
  }
  return json;
}

function buildReport(audit, error = null) {
  const s = audit?.sections || {};
  const lines = [
    "CLONER_FINAL_VERIFICATION_REPORT.md",
    "",
    `Generated: ${audit?.generated_at || new Date().toISOString()}`,
    `Migration: ${esc(audit?.migration_name || "ActionKing - EUDroneParts")} (${esc(audit?.migration_id || DEFAULT_MIGRATION_ID)})`,
    `Source: ${esc(audit?.source_store?.label || "ActionKing")} / ${esc(audit?.source_store?.domain || "")}`,
    `Target: ${esc(audit?.target_store?.label || "EUDroneParts")} / ${esc(audit?.target_store?.domain || "")}`,
    "Mode: read-only audit — cloner_migration_items + Shopify Admin API + Shopify GraphQL",
    "No normalization. No publishing. No updates.",
    "",
  ];

  if (error) {
    const pending = "Not available until shopify-cloner-worker final_verification_audit is deployed";
    lines.push(
      "STATUS: ERROR",
      "",
      `Error: ${esc(error)}`,
      "",
      "Deploy shopify-cloner-worker with final_verification_audit, then run:",
      "node scripts/cloner-final-verification-audit.mjs",
      "",
      "1. Products",
      "   Source vs Target",
      "",
      `   ${pending}`,
      "",
      "2. Collections",
      "   Source vs Target",
      "",
      `   ${pending}`,
      "",
      "3. Metafields",
      "   Missing / Different",
      "",
      `   ${pending}`,
      "",
      "4. Variants",
      "   Missing / Different",
      "",
      `   ${pending}`,
      "",
      "5. Inventory",
      "   Missing / Different",
      "",
      `   ${pending}`,
      "",
      "6. Images",
      "   Missing / Different",
      "",
      `   ${pending}`,
      "",
      "7. Pages",
      "   Missing / Different",
      "",
      `   ${pending}`,
      "",
      "8. Menus",
      "   Missing / Different",
      "",
      `   ${pending}`,
      "",
      "9. SEO",
      "   Missing / Different",
      "",
      `   ${pending}`,
      "",
      "10. GO / NO-GO",
      "",
      "NO-GO — audit could not complete.",
      "",
    );
    return lines.join("\n");
  }

  lines.push(
    "1. Products",
    "   Source vs Target",
    "",
    `   Source (migration items): ${fmt(s.products?.source_count)}`,
    `   Target (Shopify live count): ${fmt(s.products?.target_count)}`,
    `   Matched (verified on target): ${fmt(s.products?.matched)}`,
    `   Missing / not published: ${fmt(s.products?.missing)} (not published: ${fmt(s.products?.not_published)})`,
    `   Different (title sample): ${fmt(s.products?.different)}`,
    `   Publish failed: ${fmt(s.products?.publish_failed)}`,
    "",
    sampleTable(s.products?.samples_missing, ["handle", "reason", "target_id"]),
    "",
    "2. Collections",
    "   Source vs Target",
    "",
    `   Source: ${fmt(s.collections?.source_count)}`,
    `   Target (live): ${fmt(s.collections?.target_count)}`,
    `   Matched: ${fmt(s.collections?.matched)}`,
    `   Missing: ${fmt(s.collections?.missing)}`,
    `   Different: ${fmt(s.collections?.different)}`,
    "",
    sampleTable(s.collections?.samples_missing, ["handle", "title", "reason"]),
    "",
    "3. Metafields",
    "   Missing / Different",
    "",
    `   Missing: ${fmt(s.metafields?.missing)}`,
    `   Different: ${fmt(s.metafields?.different)}`,
    "",
    sampleTable(s.metafields?.samples_missing, ["handle", "metafield", "source_value"]),
    sampleTable(s.metafields?.samples_different, ["handle", "metafield", "source", "target"]),
    "",
    "4. Variants",
    "   Missing / Different",
    "",
    `   Missing: ${fmt(s.variants?.missing)}`,
    `   Different: ${fmt(s.variants?.different)}`,
    "",
    sampleTable(s.variants?.samples_missing, ["handle", "sku"]),
    sampleTable(s.variants?.samples_different, ["handle", "sku", "source_price", "target_price"]),
    "",
    "5. Inventory",
    "   Missing / Different",
    "",
    `   Missing: ${fmt(s.inventory?.missing)}`,
    `   Different (quantity): ${fmt(s.inventory?.different)}`,
    "",
    sampleTable(s.inventory?.samples_different, ["handle", "sku", "source_qty", "target_qty"]),
    "",
    "6. Images",
    "   Missing / Different",
    "",
    `   Missing (image count gaps): ${fmt(s.images?.missing)}`,
    `   Different: ${fmt(s.images?.different)}`,
    "",
    sampleTable(s.images?.samples_missing, ["handle", "source_images", "target_images"]),
    "",
    "7. Pages",
    "   Missing / Different",
    "",
    `   Source: ${fmt(s.pages?.source_count)}`,
    `   Target (live): ${fmt(s.pages?.target_count)}`,
    `   Matched: ${fmt(s.pages?.matched)}`,
    `   Missing: ${fmt(s.pages?.missing)}`,
    `   Different: ${fmt(s.pages?.different)}`,
    "",
    sampleTable(s.pages?.samples_missing, ["handle", "title", "reason"]),
    "",
    "8. Menus",
    "   Missing / Different",
    "",
    `   Source: ${fmt(s.menus?.source_count)}`,
    `   Target (live): ${fmt(s.menus?.target_count)}`,
    `   Matched: ${fmt(s.menus?.matched)}`,
    `   Missing: ${fmt(s.menus?.missing)}`,
    `   Different: ${fmt(s.menus?.different)}`,
    "",
    sampleTable(s.menus?.samples_missing, ["handle", "title", "reason"]),
    "",
    "9. SEO",
    "   Missing / Different",
    "",
    `   Missing: ${fmt(s.seo?.missing)}`,
    `   Different: ${fmt(s.seo?.different)}`,
    "",
    sampleTable(s.seo?.samples_missing, ["handle", "field", "source"]),
    sampleTable(s.seo?.samples_different, ["handle", "field", "source", "target"]),
    "",
    "10. GO / NO-GO",
    "",
    `${audit?.verdict || "NO-GO"}`,
    "",
  );

  if (audit?.blockers?.length) {
    lines.push("Blockers:", "");
    for (const b of audit.blockers) lines.push(`- ${b}`);
    lines.push("");
  }

  if (audit?.product_progress) {
    const p = audit.product_progress;
    lines.push(
      `Product deep-verify: ${fmt(p.offset + p.limit)} / ${fmt(p.total_published)} published products checked (${p.complete ? "complete" : "partial"})`,
      "",
    );
  }

  return lines.join("\n");
}

async function main() {
  loadDotEnv();
  if (process.env.AUDIT_JSON_PATH && existsSync(process.env.AUDIT_JSON_PATH)) {
    const audit = JSON.parse(readFileSync(process.env.AUDIT_JSON_PATH, "utf8"));
    writeFileSync(REPORT, buildReport(audit), "utf8");
    console.log(`Wrote ${REPORT} (from ${process.env.AUDIT_JSON_PATH})`);
    if (audit?.verdict) console.log(`Verdict: ${audit.verdict}`);
    return;
  }

  const URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const KEY = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!URL || !KEY) throw new Error("Missing SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY");

  const migrationId = process.env.MIGRATION_ID || DEFAULT_MIGRATION_ID;
  let merged = null;
  let error = null;

  try {
    let offset = 0;
    let complete = false;
    while (!complete) {
      const chunk = await invokeAudit(URL, KEY, migrationId, offset, PRODUCT_BATCH);
      chunk.sections.products._verify_missing = (chunk.sections.products.missing || 0) - (chunk.sections.products.not_published || 0);
      if (!merged) {
        merged = chunk;
        merged.sections.products._verify_missing = chunk.sections.products._verify_missing;
        merged.sections.products.missing = (merged.sections.products.not_published || 0) + merged.sections.products._verify_missing;
      } else {
        merged.sections.products = mergeSourceTarget(merged.sections.products, chunk.sections.products);
        merged.sections.metafields = mergeMissingDifferent(merged.sections.metafields, chunk.sections.metafields);
        merged.sections.variants = mergeMissingDifferent(merged.sections.variants, chunk.sections.variants);
        merged.sections.inventory = mergeMissingDifferent(merged.sections.inventory, chunk.sections.inventory);
        merged.sections.images = mergeMissingDifferent(merged.sections.images, chunk.sections.images);
        merged.sections.seo = mergeMissingDifferent(merged.sections.seo, chunk.sections.seo);
        merged.product_progress = chunk.product_progress;
        merged.blockers = chunk.blockers;
        merged.verdict = chunk.verdict;
      }
      complete = !!chunk.product_progress?.complete;
      offset += PRODUCT_BATCH;
      if (!complete) await new Promise((r) => setTimeout(r, 500));
    }
    if (merged?.sections?.products) {
      const p = merged.sections.products;
      p.missing = (p.not_published || 0) + (p._verify_missing || 0);
    }
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  const markdown = buildReport(merged, error);
  writeFileSync(REPORT, markdown, "utf8");
  console.log(`Wrote ${REPORT}`);
  if (merged?.verdict) console.log(`Verdict: ${merged.verdict}`);
  if (error) process.exit(1);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
