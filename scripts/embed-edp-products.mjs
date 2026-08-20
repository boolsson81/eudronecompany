#!/usr/bin/env node
/**
 * Generate/refresh pgvector embeddings for European Drone Company's
 * (shop_id e6ad2afc-e468-49a7-8d33-9b1837419ed8) active product catalog via
 * the storefront-embed-products edge function, powering the AI sales chat's
 * product search (match_storefront_products RPC). The function processes a
 * bounded batch per call and reports how many products remain, so this
 * script loops until remaining is 0.
 *
 * Usage:
 *   node scripts/embed-edp-products.mjs
 */
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SHOP_ID = "e6ad2afc-e468-49a7-8d33-9b1837419ed8";

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

async function main() {
  loadEnv();
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");

  let round = 0;
  while (true) {
    round += 1;
    console.log(`Round ${round}: requesting embedding batch for shop ${SHOP_ID}...`);
    const res = await fetch(`${url}/functions/v1/storefront-embed-products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
        apikey: key,
      },
      body: JSON.stringify({ shopId: SHOP_ID }),
    });
    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch { json = text; }

    if (!res.ok) {
      throw new Error(`storefront-embed-products returned ${res.status}: ${JSON.stringify(json)}`);
    }
    console.log("Result:", JSON.stringify(json, null, 2));

    if (!json.success || !json.remaining) {
      console.log(`\nDone. Total active products: ${json.totalActive ?? "?"}.`);
      break;
    }
  }
}

main().catch((err) => {
  console.error("Error:", err.message || err);
  process.exit(1);
});
