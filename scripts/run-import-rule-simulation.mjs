#!/usr/bin/env node
/**
 * Compare EU_CURRENT vs EU_FUTURE import rules across Sunsky inventory.
 *
 * Usage: node scripts/run-import-rule-simulation.mjs [--shop-id UUID]
 *
 * Outputs:
 *   IMPORT_RULE_SIMULATION.json
 *   IMPORT_RULE_SIMULATION.md
 *
 * Internal only — does not call publish-sunsky-to-shopify or modify Shopify.
 */
import { writeFileSync, readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_JSON = join(ROOT, "IMPORT_RULE_SIMULATION.json");
const OUT_MD = join(ROOT, "IMPORT_RULE_SIMULATION.md");

const EU_CURRENT = {
  notes: "EU_CURRENT",
  low_value_threshold_eur: 150,
  low_value_exemption_enabled: true,
  duty_required_all_shipments: false,
  customs_handling_fee_sek: 35,
  battery_fee_enabled: true,
  default_import_vat_percent: 25,
  digital_product_passport_required: false,
};

const EU_FUTURE = {
  notes: "EU_FUTURE",
  low_value_threshold_eur: 0,
  low_value_exemption_enabled: false,
  duty_required_all_shipments: true,
  customs_handling_fee_sek: 35,
  battery_fee_enabled: true,
  default_import_vat_percent: 25,
  digital_product_passport_required: true,
};

const FX = 10.5;
const BUFFER = 5;
const BATTERY_FEE = 25;

function loadEnv() {
  const p = join(ROOT, ".env");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 1) continue;
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[t.slice(0, eq).trim()]) process.env[t.slice(0, eq).trim()] = v;
  }
}

function normalizeHs(hs) {
  if (!hs) return null;
  const c = String(hs).replace(/[^0-9.]/g, "").trim();
  return c || null;
}

function hsFlags(hs, dutyRate) {
  const n = normalizeHs(hs);
  const missing_hs_code = !n;
  const invalid_hs_code = !missing_hs_code && !/^\d{6,10}(\.\d+)?$/.test(n);
  return { missing_hs_code, invalid_hs_code, hs_code_duty_profile_used: !missing_hs_code && !invalid_hs_code && dutyRate > 0 };
}

function customsReview(rule, flags, origin, shipmentEur) {
  if (rule.duty_required_all_shipments) return true;
  if (flags.missing_hs_code || flags.invalid_hs_code) return true;
  if (!origin?.trim()) return true;
  if (!rule.low_value_exemption_enabled) return true;
  return shipmentEur > rule.low_value_threshold_eur;
}

function landedCost(inv, rule) {
  const supplier = Number(inv.supplier_price_usd) || (Number(inv.purchase_price) / FX) || 0;
  const freight = Number(inv.freight_usd) || (Number(inv.shipping_cost) / FX) || 0;
  const dutyRate = Number(inv.import_duty_rate) || 0;
  const dutyUsd = Math.round((dutyRate / 100) * (supplier + freight) * 100) / 100;
  const landedUsd = Math.round((supplier + freight + dutyUsd) * 100) / 100;
  const batteryFee = rule.battery_fee_enabled && inv.contains_battery ? BATTERY_FEE : 0;
  const landedSek = Math.round((landedUsd * FX + rule.customs_handling_fee_sek + BUFFER + batteryFee) * 100) / 100;
  const shipmentEur = Math.round((supplier + freight) * 0.92 * 100) / 100;
  const flags = hsFlags(inv.hs_code, dutyRate);
  const review = customsReview(rule, flags, inv.country_of_origin, shipmentEur);
  const sell = Number(inv.shopify_list_price_sek) || 0;
  const net = sell > 0 ? sell / 1.25 : null;
  const margin = net != null ? Math.round((net - landedSek) * 100) / 100 : null;
  return { landedSek, review, margin, unprofitable: margin != null && margin < 0, flags };
}

async function fetchInventory(base, key, shopId) {
  const rows = [];
  let from = 0;
  while (true) {
    let url = `${base}/rest/v1/inventory?select=sku,product_title,purchase_price,shipping_cost,import_duty_rate,supplier_price_usd,freight_usd,hs_code,country_of_origin,contains_battery&or=(inventory_source.eq.sunsky_api,location.ilike.*sunsky*)&limit=500&offset=${from}`;
    if (shopId) url += `&shop_id=eq.${shopId}`;
    const res = await fetch(url, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!res.ok) throw new Error(`inventory fetch ${res.status}: ${await res.text()}`);
    const batch = await res.json();
    if (!batch.length) break;
    rows.push(...batch);
    if (batch.length < 500) break;
    from += 500;
  }
  return rows;
}

async function main() {
  loadEnv();
  const shopId = process.argv.includes("--shop-id")
    ? process.argv[process.argv.indexOf("--shop-id") + 1]
    : null;
  const base = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!base || !key) {
    console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or run with .env)");
    process.exit(1);
  }

  const inventory = await fetchInventory(base, key);
  const results = [];
  let totalDelta = 0;
  let affected = 0;
  let newlyUnprofitable = 0;
  let reviewIncrease = 0;

  for (const inv of inventory) {
    const current = landedCost(inv, EU_CURRENT);
    const future = landedCost(inv, EU_FUTURE);
    const delta = Math.round((future.landedSek - current.landedSek) * 100) / 100;
    if (delta !== 0 || future.review !== current.review) affected++;
    if (!current.unprofitable && future.unprofitable) newlyUnprofitable++;
    if (future.review && !current.review) reviewIncrease++;
    totalDelta += delta;
    results.push({
      sku: inv.sku,
      product_title: inv.product_title,
      current_landed_sek: current.landedSek,
      future_landed_sek: future.landedSek,
      delta_sek: delta,
      current_margin_sek: current.margin,
      future_margin_sek: future.margin,
      current_customs_review: current.review,
      future_customs_review: future.review,
      contains_battery: inv.contains_battery,
      missing_hs_code: future.flags.missing_hs_code,
    });
  }

  const avgDelta = results.length ? Math.round((totalDelta / results.length) * 100) / 100 : 0;
  const summary = {
    generated_at: new Date().toISOString(),
    product_count: results.length,
    products_affected: affected,
    average_landed_cost_increase_sek: avgDelta,
    newly_unprofitable: newlyUnprofitable,
    customs_review_increase: reviewIncrease,
    rules: { current: EU_CURRENT, future: EU_FUTURE },
    note: "Internal simulation only. ENABLE_SHOPIFY_PUBLISH unchanged. No Shopify writes.",
  };

  const payload = { summary, products: results.sort((a, b) => b.delta_sek - a.delta_sek).slice(0, 200) };
  writeFileSync(OUT_JSON, JSON.stringify(payload, null, 2));

  const md = `# EU Import Rule Simulation

Generated: ${summary.generated_at}

## Summary

| Metric | Value |
|--------|-------|
| Products analyzed | ${summary.product_count} |
| Products affected | ${summary.products_affected} |
| Avg landed cost increase (SEK) | ${summary.average_landed_cost_increase_sek} |
| Newly unprofitable | ${summary.newly_unprofitable} |
| Additional customs reviews (future) | ${summary.customs_review_increase} |

## Rules compared

- **EU_CURRENT**: 150 EUR low-value threshold, IOSS enabled, exemption active
- **EU_FUTURE**: 0 EUR threshold, duty on all shipments, DPP required

## Top impact products (by SEK delta)

| SKU | Current SEK | Future SEK | Δ SEK | Future review |
|-----|-------------|------------|-------|---------------|
${payload.products.slice(0, 30).map((p) =>
    `| ${p.sku} | ${p.current_landed_sek} | ${p.future_landed_sek} | ${p.delta_sek} | ${p.future_customs_review} |`
  ).join("\n")}

> Full data: IMPORT_RULE_SIMULATION.json
`;

  writeFileSync(OUT_MD, md);
  console.log(JSON.stringify(summary, null, 2));
  console.log(`Wrote ${OUT_JSON} and ${OUT_MD}`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
