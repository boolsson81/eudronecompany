import { createClient } from "npm:@supabase/supabase-js@2";
import { suggestProductType } from "./suggest-product-type.ts";

export async function fetchMissingProductTypeRows(
  supabase: ReturnType<typeof createClient>,
  shopId: string,
) {
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
      .eq("shop_id", shopId)
      .or("product_type.is.null,product_type.eq.")
      .range(from, from + pageSize - 1);
    if (error) throw new Error(`products: ${error.message}`);
    const rows = data ?? [];
    for (const row of rows) {
      const pt = row.product_type;
      if (pt !== null && String(pt).trim() !== "") continue;
      missing.push(row);
    }
    if (rows.length < pageSize) break;
    from += pageSize;
    if (from > 200000) break;
  }
  return missing;
}

export async function loadCollectionsByHandle(
  supabase: ReturnType<typeof createClient>,
  shopId: string,
  handles: string[],
): Promise<Map<string, string[]>> {
  const result = new Map<string, string[]>();
  if (handles.length === 0) return result;

  const chunkSize = 200;
  for (let i = 0; i < handles.length; i += chunkSize) {
    const chunk = handles.slice(i, i + chunkSize);
    const { data: seoRows } = await supabase
      .from("seo_targets")
      .select("handle, collection_title")
      .eq("shop_id", shopId)
      .eq("target_type", "product")
      .in("handle", chunk);
    for (const row of seoRows ?? []) {
      if (!row.collection_title) continue;
      const list = result.get(row.handle) ?? [];
      if (!list.includes(row.collection_title)) list.push(row.collection_title);
      result.set(row.handle, list);
    }
  }

  const { data: productPages } = await supabase
    .from("pages")
    .select("id, handle")
    .eq("shop_id", shopId)
    .eq("page_type", "product")
    .in("handle", handles);

  if (!productPages?.length) return result;

  const pageIds = productPages.map((p) => p.id);

  for (let i = 0; i < pageIds.length; i += chunkSize) {
    const chunk = pageIds.slice(i, i + chunkSize);
    const { data: links } = await supabase
      .from("product_collections")
      .select("product_page_id, collection_page_id")
      .in("product_page_id", chunk);
    if (!links?.length) continue;

    const collectionIds = [...new Set(links.map((l) => l.collection_page_id))];
    const { data: collectionPages } = await supabase
      .from("pages")
      .select("id, title")
      .in("id", collectionIds);

    const titleById = new Map((collectionPages ?? []).map((p) => [p.id, p.title]));
    for (const link of links) {
      const handle = productPages.find((p) => p.id === link.product_page_id)?.handle;
      const title = titleById.get(link.collection_page_id);
      if (!handle || !title) continue;
      const list = result.get(handle) ?? [];
      if (!list.includes(title)) list.push(title);
      result.set(handle, list);
    }
  }

  return result;
}

export async function buildMissingProductTypeReport(
  supabase: ReturnType<typeof createClient>,
  shopId: string,
) {
  const rows = await fetchMissingProductTypeRows(supabase, shopId);
  const handles = rows.map((r) => r.handle).filter(Boolean) as string[];
  const collectionsByHandle = await loadCollectionsByHandle(supabase, shopId, handles);

  const items = rows.map((row) => {
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

  return {
    shop_id: shopId,
    total_missing: items.length,
    items,
    suggestion_summary: [...bySuggestion.entries()]
      .map(([suggested_product_type, count]) => ({ suggested_product_type, count }))
      .sort((a, b) => b.count - a.count),
    generated_at: new Date().toISOString(),
  };
}
