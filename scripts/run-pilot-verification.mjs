#!/usr/bin/env node
/**
 * Pilot SKU verification — selects 20 representative SUNSKY SKUs and checks DB state.
 *
 *   node scripts/run-pilot-verification.mjs
 *
 * Writes: docs/go-live/evidence/PILOT_VERIFICATION.json
 */
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const EVIDENCE = join(ROOT, "docs/go-live/evidence");
const SHOP_ID = "e6ad2afc-e468-49a7-8d33-9b1837419ed8";

/** 20 pilot SKUs — mix of value tiers and product types (expand after backfill). */
const PILOT_SKUS = [
  { sku: "EDA002324802E", category: "low_value_accessory", notes: "Prod dry-run verified" },
  { sku: "TBD0421393001A", category: "mid_value_accessory", notes: "Prod dry-run verified" },
  { sku: "TBD0422753601A", category: "mid_value_accessory", notes: "Prod dry-run verified" },
  { sku: "TBD06046877", category: "filter", notes: "HS test SKU (ND filter)" },
  { sku: "PILOT_BATTERY_01", category: "battery", placeholder: true },
  { sku: "PILOT_BATTERY_02", category: "battery", placeholder: true },
  { sku: "PILOT_HIGH_VALUE_01", category: "high_value", placeholder: true },
  { sku: "PILOT_HIGH_VALUE_02", category: "high_value", placeholder: true },
  { sku: "PILOT_VARIANT_01", category: "multi_variant", placeholder: true },
  { sku: "PILOT_VARIANT_02", category: "multi_variant", placeholder: true },
  { sku: "PILOT_PROP_01", category: "propeller", placeholder: true },
  { sku: "PILOT_CABLE_01", category: "cable", placeholder: true },
  { sku: "PILOT_CHARGER_01", category: "charger", placeholder: true },
  { sku: "PILOT_BAG_01", category: "bag", placeholder: true },
  { sku: "PILOT_MOUNT_01", category: "mount", placeholder: true },
  { sku: "PILOT_SPARE_01", category: "spare_part", placeholder: true },
  { sku: "PILOT_LOW_02", category: "low_value", placeholder: true },
  { sku: "PILOT_LOW_03", category: "low_value", placeholder: true },
  { sku: "PILOT_ACCESSORY_01", category: "accessory", placeholder: true },
  { sku: "PILOT_ACCESSORY_02", category: "accessory", placeholder: true },
];

const CHECK_FIELDS = [
  "supplier_sku", "product_title", "hs_code", "hs_code_confidence",
  "landed_cost_sek", "landed_cost_usd", "gross_margin_percent",
  "import_compliance_status", "import_compliance_flags", "review_flags",
  "publish_ready", "freight_source", "duty_source", "quantity",
  "country_of_origin", "recommended_price_sek_inc_vat",
];

function loadDotEnv() {
  const envPath = join(ROOT, ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadDotEnv();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const AUTH_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

function evaluateRow(row) {
  if (!row) return { found: false, checks: {}, approved: false };
  const flags = [
    ...(Array.isArray(row.review_flags) ? row.review_flags : []),
    ...(Array.isArray(row.import_compliance_flags) ? row.import_compliance_flags : []),
  ];
  const checks = {
    has_title: Boolean(row.product_title?.trim()),
    has_hs: Boolean(row.hs_code?.trim()),
    hs_confidence_ok: (row.hs_code_confidence ?? 0) >= 0.8,
    has_landed_cost: row.landed_cost_sek != null && row.landed_cost_sek > 0,
    compliance_approved: row.import_compliance_status === "approved",
    positive_margin: (row.gross_margin_percent ?? 0) > 0,
    has_inventory: (row.quantity ?? 0) > 0,
    publish_ready_manual: row.publish_ready === true,
    no_blocking_flags: !flags.some((f) =>
      ["missing_hs_code", "negative_margin", "missing_gpsr_data", "estimated_freight"].includes(f),
    ),
  };
  const approved = Object.values(checks).every(Boolean);
  return { found: true, checks, approved };
}

async function fetchSku(sku) {
  const select = CHECK_FIELDS.join(",");
  const url = `${SUPABASE_URL}/rest/v1/inventory?shop_id=eq.${SHOP_ID}&supplier_sku=eq.${encodeURIComponent(sku)}&select=${select}`;
  const res = await fetch(url, {
    headers: { apikey: AUTH_KEY, Authorization: `Bearer ${AUTH_KEY}` },
  });
  const text = await res.text();
  if (!res.ok) {
    return { error: text.slice(0, 300), row: null };
  }
  const rows = JSON.parse(text);
  return { row: Array.isArray(rows) ? rows[0] : null };
}

async function main() {
  mkdirSync(EVIDENCE, { recursive: true });

  const results = [];
  for (const pilot of PILOT_SKUS) {
    if (pilot.placeholder) {
      results.push({
        ...pilot,
        status: "pending_selection",
        message: "Replace with real SKU after backfill catalog scan",
      });
      continue;
    }
    const { row, error } = await fetchSku(pilot.sku);
    const evaluation = evaluateRow(row);
    results.push({
      ...pilot,
      status: error ? "query_error" : evaluation.found ? (evaluation.approved ? "approved" : "needs_review") : "not_found",
      error,
      evaluation,
      row: row ? {
        product_title: row.product_title,
        hs_code: row.hs_code,
        landed_cost_sek: row.landed_cost_sek,
        import_compliance_status: row.import_compliance_status,
        publish_ready: row.publish_ready,
        gross_margin_percent: row.gross_margin_percent,
      } : null,
    });
  }

  const verified = results.filter((r) => r.status === "approved").length;
  const report = {
    generated_at: new Date().toISOString(),
    shop_id: SHOP_ID,
    target_verified: 20,
    verified_count: verified,
    meets_target: verified >= 20,
    results,
    service_role_available: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  };

  const outPath = join(EVIDENCE, "PILOT_VERIFICATION.json");
  writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`Pilot verification: ${verified}/20 approved`);
  console.log("Written:", outPath);
  process.exit(verified >= 20 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
