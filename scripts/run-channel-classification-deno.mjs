#!/usr/bin/env node
/**
 * Run full channel classification via Deno + catalog_field_audit edge function code.
 * Requires SUPABASE_SERVICE_ROLE_KEY in environment.
 */
import { spawnSync } from "child_process";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "scripts/.channel-classification-output.json");

const denoScript = `
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  classifyProduct,
  detectMisplaced,
  type Channel,
} from "../_shared/product-channel-classification.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SHOP_ID = "010120e6-6def-431e-8614-905cb69f85b9";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
const pageSize = 1000;
const products = [];
let from = 0;
while (true) {
  const { data, error } = await supabase
    .from("products")
    .select("id, shopify_id, title, vendor, product_type, tags, status, handle")
    .eq("shop_id", SHOP_ID)
    .range(from, from + pageSize - 1);
  if (error) throw error;
  if (!data?.length) break;
  products.push(...data);
  if (data.length < pageSize) break;
  from += pageSize;
}

const revenueMap = new Map();
from = 0;
while (true) {
  const { data, error } = await supabase
    .from("order_line_items")
    .select("shopify_product_id, price, quantity")
    .eq("shop_id", SHOP_ID)
    .range(from, from + pageSize - 1);
  if (error) throw error;
  if (!data?.length) break;
  for (const row of data) {
    const pid = String(row.shopify_product_id ?? "");
    if (!pid) continue;
    const rev = Number(row.price ?? 0) * Number(row.quantity ?? 0);
    const cur = revenueMap.get(pid) ?? { revenue: 0, units: 0 };
    cur.revenue += rev;
    cur.units += Number(row.quantity ?? 0);
    revenueMap.set(pid, cur);
  }
  if (data.length < pageSize) break;
  from += pageSize;
}

const CHANNELS = ["EuroDroneParts", "EUActionCam", "Shared", "Archive"] as Channel[];
const channelCounts = Object.fromEntries(CHANNELS.map((c) => [c, 0]));
const channelRevenue = Object.fromEntries(CHANNELS.map((c) => [c, 0]));
const vendorCounts = new Map();
const typeCounts = new Map();
const misplaced = [];

for (const p of products) {
  const { channel } = classifyProduct(p);
  channelCounts[channel]++;
  vendorCounts.set(p.vendor || "(null)", (vendorCounts.get(p.vendor || "(null)") ?? 0) + 1);
  typeCounts.set(p.product_type || "(null)", (typeCounts.get(p.product_type || "(null)") ?? 0) + 1);
  const rev = revenueMap.get(String(p.shopify_id ?? ""));
  if (rev) channelRevenue[channel] += rev.revenue;
  const m = detectMisplaced(p, channel);
  if (m) misplaced.push({ ...m, revenue_sek: rev?.revenue ?? 0 });
}

misplaced.sort((a, b) => (b.revenue_sek ?? 0) - (a.revenue_sek ?? 0));
const totalRevenue = Object.values(channelRevenue).reduce((s, v) => s + v, 0);

console.log(JSON.stringify({
  shop_id: SHOP_ID,
  total_products: products.length,
  channels: Object.fromEntries(CHANNELS.map((ch) => [ch, {
    products: channelCounts[ch],
    share_pct: products.length ? Math.round((channelCounts[ch] / products.length) * 1000) / 10 : 0,
    revenue_sek: Math.round(channelRevenue[ch]),
    revenue_share_pct: totalRevenue ? Math.round((channelRevenue[ch] / totalRevenue) * 1000) / 10 : 0,
  }])),
  revenue: { total_sek: Math.round(totalRevenue), source: "order_line_items" },
  top_vendors: [...vendorCounts.entries()].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count).slice(0, 100),
  top_product_types: [...typeCounts.entries()].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count).slice(0, 100),
  misplaced_products: misplaced.slice(0, 300),
  misplaced_total: misplaced.length,
  generated_at: new Date().toISOString(),
  source: "deno_local_full",
}));
`;

const r = spawnSync(
  "deno",
  ["run", "--allow-net", "--allow-env", "-"],
  {
    cwd: join(ROOT, "supabase/functions"),
    input: denoScript,
    env: {
      ...process.env,
      SUPABASE_URL: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://jzqgwsryxmgzcbjjddic.supabase.co",
    },
    encoding: "utf8",
    maxBuffer: 50 * 1024 * 1024,
  },
);

if (r.status !== 0) {
  console.error(r.stderr || r.stdout);
  process.exit(r.status || 1);
}

const json = JSON.parse(r.stdout.trim());
writeFileSync(OUT, JSON.stringify(json, null, 2));
console.log(`Wrote ${OUT}`);
console.log(`Products: ${json.total_products}, misplaced: ${json.misplaced_total}`);
