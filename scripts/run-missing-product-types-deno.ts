/**
 * Local runner for missing product_type report (requires SUPABASE_SERVICE_ROLE_KEY).
 */
import { createClient } from "npm:@supabase/supabase-js@2";
import { suggestProductType } from "../supabase/functions/_shared/suggest-product-type.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SHOP_ID = Deno.env.get("SHOP_ID") ?? "010120e6-6def-431e-8614-905cb69f85b9";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
const pageSize = 1000;
const missing: Array<{
  handle: string | null;
  title: string | null;
  vendor: string | null;
  tags: string | null;
  shopify_id: string | null;
  status: string | null;
}> = [];
let from = 0;

while (true) {
  const { data, error } = await supabase
    .from("products")
    .select("handle, title, vendor, tags, shopify_id, status, product_type")
    .eq("shop_id", SHOP_ID)
    .or("product_type.is.null,product_type.eq.")
    .range(from, from + pageSize - 1);
  if (error) throw error;
  const rows = data ?? [];
  for (const row of rows) {
    const pt = row.product_type;
    if (pt !== null && String(pt).trim() !== "") continue;
    missing.push(row);
  }
  if (rows.length < pageSize) break;
  from += pageSize;
}

const handles = missing.map((r) => r.handle).filter(Boolean) as string[];
const collectionsByHandle = new Map<string, string[]>();

for (let i = 0; i < handles.length; i += 200) {
  const chunk = handles.slice(i, i + 200);
  const { data: seoRows } = await supabase
    .from("seo_targets")
    .select("handle, collection_title")
    .eq("shop_id", SHOP_ID)
    .eq("target_type", "product")
    .in("handle", chunk);
  for (const row of seoRows ?? []) {
    if (!row.collection_title) continue;
    const list = collectionsByHandle.get(row.handle) ?? [];
    if (!list.includes(row.collection_title)) list.push(row.collection_title);
    collectionsByHandle.set(row.handle, list);
  }
}

const items = missing.map((row) => {
  const handle = row.handle ?? "";
  const collections = collectionsByHandle.get(handle) ?? [];
  const suggestion = suggestProductType({
    title: row.title,
    vendor: row.vendor,
    tags: row.tags,
    collections,
  });
  return {
    handle: row.handle,
    title: row.title,
    vendor: row.vendor,
    collections,
    suggested_product_type: suggestion.suggested,
    suggestion_confidence: suggestion.confidence,
    suggestion_reason: suggestion.reason,
    shopify_id: row.shopify_id,
    status: row.status,
  };
});

items.sort((a, b) => (a.vendor ?? "").localeCompare(b.vendor ?? "", "sv"));

const bySuggestion = new Map<string, number>();
for (const item of items) {
  bySuggestion.set(item.suggested_product_type, (bySuggestion.get(item.suggested_product_type) ?? 0) + 1);
}

console.log(JSON.stringify({
  shop_id: SHOP_ID,
  total_missing: items.length,
  items,
  suggestion_summary: [...bySuggestion.entries()]
    .map(([suggested_product_type, count]) => ({ suggested_product_type, count }))
    .sort((a, b) => b.count - a.count),
  generated_at: new Date().toISOString(),
}));
