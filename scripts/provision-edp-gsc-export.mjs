#!/usr/bin/env node
/**
 * EuroDrone Company — single GSC BigQuery dataset (production).
 *
 * Automates DigitalSignal side only:
 *   - dataset searchconsole_eurodroneparts in digitalsignal-gsc-export (EU)
 *   - shops.gsc_bigquery_* for EUDroneParts
 *
 * Manual (Search Console): Settings → Bulk data export
 *   Project digitalsignal-gsc-export, dataset searchconsole_eurodroneparts, location EU
 *
 * Usage:
 *   SUPABASE_URL=https://wsncjdajweoujhidlxas.supabase.co \
 *   SUPABASE_ANON_KEY=... node scripts/provision-edp-gsc-export.mjs
 */

const SUPABASE_URL = process.env.SUPABASE_URL || "https://wsncjdajweoujhidlxas.supabase.co";
const ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

const EDP_SHOP_ID = "e6ad2afc-e468-49a7-8d33-9b1837419ed8";
const PROJECT_ID = "digitalsignal-gsc-export";
const DATASET = "searchconsole_eurodroneparts";

if (!ANON_KEY) {
  console.error("Set SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_KEY");
  process.exit(1);
}

async function main() {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/gsc-bigquery`, {
    method: "POST",
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "provision_dataset",
      shopId: EDP_SHOP_ID,
      projectId: PROJECT_ID,
      dataset: DATASET,
      location: "EU",
    }),
  });
  const json = await res.json();
  if (!json?.success) {
    console.error(json?.error || res.status);
    process.exit(1);
  }

  console.log("EuroDrone Company — GSC BigQuery");
  console.log(`  shop: ${EDP_SHOP_ID}`);
  console.log(`  ${PROJECT_ID}.${DATASET} (${json.created ? "created" : "ready"})`);
  console.log("\nSearch Console (manual): Bulk data export → same project + dataset, location EU");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
