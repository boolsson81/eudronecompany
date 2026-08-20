#!/usr/bin/env node
/**
 * Trigger a full Shopify product catalog sync for European Drone Company
 * (shop_id e6ad2afc-e468-49a7-8d33-9b1837419ed8) into the `products` table,
 * via the shopify-sync edge function's sync-products action. The function
 * self-paginates (up to ~2000 products per invocation) and self-invokes
 * with a cursor for the rest, so a single call here kicks off the full sync
 * asynchronously - this script does not need to poll or loop.
 *
 * Usage:
 *   node scripts/sync-edp-products.mjs
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

  console.log(`Triggering product sync for shop ${SHOP_ID}...`);
  const res = await fetch(`${url}/functions/v1/shopify-sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      apikey: key,
    },
    body: JSON.stringify({ action: "sync-products", shop_id: SHOP_ID }),
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }

  if (!res.ok) {
    throw new Error(`shopify-sync returned ${res.status}: ${JSON.stringify(json)}`);
  }
  console.log("First batch result:", JSON.stringify(json, null, 2));
  console.log(
    json?.has_more
      ? "\nMore pages remain - the function self-invoked to continue in the background."
      : "\nSync complete (no more pages)."
  );
}

main().catch((err) => {
  console.error("Error:", err.message || err);
  process.exit(1);
});
