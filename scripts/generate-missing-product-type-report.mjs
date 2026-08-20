#!/usr/bin/env node
/**
 * Generate MISSING_PRODUCT_TYPE.md
 * Usage: node scripts/generate-missing-product-type-report.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { suggestProductType } from "./lib/suggest-product-type.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "MISSING_PRODUCT_TYPE.md");
const ACTIONKING_SHOP_ID = "010120e6-6def-431e-8614-905cb69f85b9";

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
loadEnv();

const URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const ANON = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function invoke(fn, body) {
  const r = await fetch(`${URL}/functions/v1/${fn}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ANON}`,
      apikey: ANON,
    },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  let json;
  try { json = text ? JSON.parse(text) : {}; } catch { json = { error: text.slice(0, 400) }; }
  if (!r.ok) throw new Error(`${fn} ${r.status}: ${json.error || text.slice(0, 200)}`);
  return json;
}

async function fetchViaShopifyImagesMissingExport() {
  const all = [];
  let graphqlCursor = null;
  let pages = 0;

  while (pages < 120) {
    pages++;
    const res = await invoke("shopify-images", {
      action: "export-missing-product-types",
      graphqlCursor,
    });
    if (!res.ok || !res.items) {
      throw new Error("shopify-images export-missing-product-types not deployed");
    }
    all.push(...res.items);
    if (!res.has_more || !res.cursor) break;
    graphqlCursor = res.cursor;
  }

  const items = all.map((row) => {
    const suggestion = suggestProductType({
      title: row.title,
      vendor: row.vendor,
      tags: row.tags,
      collections: row.collections ?? [],
    });
    return {
      handle: row.handle,
      title: row.title,
      vendor: row.vendor,
      collections: row.collections ?? [],
      suggested_product_type: suggestion.suggested,
      suggestion_confidence: suggestion.confidence,
      suggestion_reason: suggestion.reason,
    };
  });

  items.sort((a, b) => (a.vendor ?? "").localeCompare(b.vendor ?? "", "sv"));
  const bySuggestion = new Map();
  for (const item of items) {
    bySuggestion.set(item.suggested_product_type, (bySuggestion.get(item.suggested_product_type) ?? 0) + 1);
  }

  return {
    source: "shopify-images → Shopify Admin GraphQL (missing productType)",
    shop_id: ACTIONKING_SHOP_ID,
    total_missing: items.length,
    items,
    suggestion_summary: [...bySuggestion.entries()]
      .map(([suggested_product_type, count]) => ({ suggested_product_type, count }))
      .sort((a, b) => b.count - a.count),
    generated_at: new Date().toISOString(),
  };
}

async function fetchViaShopifyListProducts() {
  const shopDomain = "bvy0b8-0b.myshopify.com";
  const all = [];
  let cursor = `https://${shopDomain}/admin/api/2024-01/products.json?fields=id,handle,title,vendor,product_type,tags,status&limit=250`;
  let pages = 0;

  while (cursor && pages < 200) {
    pages++;
    const res = await invoke("shopify-images", {
      action: "list-products",
      limit: 250,
      cursor,
      includeProducts: true,
    });
    if (!res.products?.length && !res.nextCursor) {
      throw new Error("shopify-images list-products includeProducts not deployed");
    }
    all.push(...(res.products ?? []));
    if (!res.hasMore || !res.nextCursor) break;
    cursor = res.nextCursor;
  }

  let collectionMap = {};
  try {
    const mapRes = await invoke("seo-wizard-sync", {
      shopId: ACTIONKING_SHOP_ID,
      action: "get_product_collection_map",
    });
    collectionMap = mapRes.productCollectionMap ?? {};
  } catch {
    /* optional */
  }

  let collectionTitles = {};
  try {
    const colRes = await invoke("fetch-shopify-collections", {});
    for (const c of colRes.collections ?? []) {
      collectionTitles[String(c.id)] = c.title;
    }
  } catch {
    /* optional */
  }

  const collectionsByProductId = new Map();
  for (const [productId, collectionIds] of Object.entries(collectionMap)) {
    const titles = collectionIds
      .map((id) => collectionTitles[String(id)])
      .filter(Boolean);
    if (titles.length) collectionsByProductId.set(productId, [...new Set(titles)]);
  }

  const items = all
    .filter((row) => !String(row.product_type ?? "").trim())
    .map((row) => {
      const collections = collectionsByProductId.get(row.shopify_id) ?? [];
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
      };
    });

  items.sort((a, b) => (a.vendor ?? "").localeCompare(b.vendor ?? "", "sv"));
  const bySuggestion = new Map();
  for (const item of items) {
    bySuggestion.set(item.suggested_product_type, (bySuggestion.get(item.suggested_product_type) ?? 0) + 1);
  }

  return {
    source: "shopify-images list-products → Shopify Admin REST (paginated)",
    shop_id: ACTIONKING_SHOP_ID,
    total_missing: items.length,
    items,
    suggestion_summary: [...bySuggestion.entries()]
      .map(([suggested_product_type, count]) => ({ suggested_product_type, count }))
      .sort((a, b) => b.count - a.count),
    generated_at: new Date().toISOString(),
  };
}

async function fetchViaPrisjaktFeed() {
  const URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const ANON = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const r = await fetch(
    `${URL}/functions/v1/prisjakt-feed?shop_id=${ACTIONKING_SHOP_ID}&report=missing_product_types`,
    { headers: { apikey: ANON, Authorization: `Bearer ${ANON}` } },
  );
  const text = await r.text();
  let json;
  try { json = text ? JSON.parse(text) : {}; } catch { json = { error: text.slice(0, 200) }; }
  if (!r.ok || !json.ok || json.total_missing == null) {
    throw new Error(`prisjakt-feed report: ${json.error || text.slice(0, 120)}`);
  }
  return { source: "prisjakt-feed → Supabase DB", ...json };
}

async function fetchViaShopifyListDrafts() {
  const all = [];
  let cursor = null;
  let pages = 0;
  while (pages < 80) {
    pages++;
    const res = await invoke("shopify-list-drafts", {
      mode: "missing_product_types",
      cursor,
    });
    if (!res.ok || res.mode !== "missing_product_types" || !res.items) {
      throw new Error("shopify-list-drafts missing_product_types not deployed");
    }
    all.push(...res.items);
    if (!res.has_more || !res.cursor) break;
    cursor = res.cursor;
  }

  const items = all.map((row) => {
    const suggestion = suggestProductType({
      title: row.title,
      vendor: row.vendor,
      tags: row.tags,
      collections: row.collections ?? [],
    });
    return {
      handle: row.handle,
      title: row.title,
      vendor: row.vendor,
      collections: row.collections ?? [],
      suggested_product_type: suggestion.suggested,
      suggestion_confidence: suggestion.confidence,
      suggestion_reason: suggestion.reason,
    };
  });

  items.sort((a, b) => (a.vendor ?? "").localeCompare(b.vendor ?? "", "sv"));
  const bySuggestion = new Map();
  for (const item of items) {
    bySuggestion.set(item.suggested_product_type, (bySuggestion.get(item.suggested_product_type) ?? 0) + 1);
  }

  return {
    source: "shopify-list-drafts → Shopify Admin GraphQL",
    shop_id: ACTIONKING_SHOP_ID,
    total_missing: items.length,
    items,
    suggestion_summary: [...bySuggestion.entries()]
      .map(([suggested_product_type, count]) => ({ suggested_product_type, count }))
      .sort((a, b) => b.count - a.count),
    generated_at: new Date().toISOString(),
  };
}

async function fetchViaClonerWorkerInline() {
  const data = await invoke("shopify-cloner-worker", {
    action: "missing_product_types",
    shop_id: ACTIONKING_SHOP_ID,
  });
  if (!data.ok || data.total_missing == null || data.processed != null) {
    throw new Error("shopify-cloner-worker missing_product_types not deployed");
  }
  return { source: "shopify-cloner-worker → Supabase DB", ...data };
}

async function fetchViaShopifyImagesExport() {
  const all = [];
  let cursor = null;
  let pages = 0;
  while (pages < 120) {
    pages++;
    const res = await invoke("shopify-images", {
      action: "export-products-page",
      limit: 250,
      cursor,
    });
    if (!res.products) throw new Error("shopify-images export-products-page not deployed");
    all.push(...res.products);
    if (!res.hasMore || !res.nextCursor) break;
    cursor = res.nextCursor;
  }

  let collectionMap = {};
  try {
    const mapRes = await invoke("seo-wizard-sync", {
      shopId: ACTIONKING_SHOP_ID,
      action: "get_product_collection_map",
    });
    collectionMap = mapRes.productCollectionMap ?? {};
  } catch {
    /* optional */
  }

  let collectionTitles = {};
  try {
    const colRes = await invoke("fetch-shopify-collections", {});
    for (const c of colRes.collections ?? []) {
      collectionTitles[String(c.id)] = c.title;
    }
  } catch {
    /* optional */
  }

  const collectionsByProductId = new Map();
  for (const [productId, collectionIds] of Object.entries(collectionMap)) {
    const titles = collectionIds
      .map((id) => collectionTitles[String(id)])
      .filter(Boolean);
    if (titles.length) collectionsByProductId.set(productId, [...new Set(titles)]);
  }

  const items = all
    .filter((row) => !String(row.product_type ?? "").trim())
    .map((row) => {
      const collections = collectionsByProductId.get(row.shopify_id) ?? [];
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
      };
    });

  items.sort((a, b) => (a.vendor ?? "").localeCompare(b.vendor ?? "", "sv"));
  const bySuggestion = new Map();
  for (const item of items) {
    bySuggestion.set(item.suggested_product_type, (bySuggestion.get(item.suggested_product_type) ?? 0) + 1);
  }

  return {
    source: "shopify-images → Shopify Admin REST (live)",
    shop_id: ACTIONKING_SHOP_ID,
    total_missing: items.length,
    items,
    suggestion_summary: [...bySuggestion.entries()]
      .map(([suggested_product_type, count]) => ({ suggested_product_type, count }))
      .sort((a, b) => b.count - a.count),
    generated_at: new Date().toISOString(),
  };
}

async function fetchViaBulkTranslate() {
  const data = await invoke("bulk-translate-content", {
    action: "missing_product_types",
    shopId: ACTIONKING_SHOP_ID,
  });
  if (!data.ok || data.total_missing == null) {
    throw new Error("bulk-translate-content missing_product_types not deployed");
  }
  return { source: "bulk-translate-content (DB)", ...data };
}

async function fetchViaLinkActionkingDb() {
  const data = await invoke("shopify-link-actionking-token", {
    action: "missing_product_types_db",
    shop_id: ACTIONKING_SHOP_ID,
  });
  if (!data.ok || data.total_missing == null) {
    throw new Error("shopify-link-actionking-token missing_product_types_db not deployed");
  }
  return { source: "shopify-link-actionking-token → Supabase DB", ...data };
}

async function fetchViaTestShopifyTokenDb() {
  const data = await invoke("test-shopify-token", {
    action: "missing_product_types_db",
    shop_id: ACTIONKING_SHOP_ID,
  });
  if (!data.ok || data.total_missing == null) {
    throw new Error("test-shopify-token missing_product_types_db not deployed");
  }
  return { source: "test-shopify-token → Supabase DB", ...data };
}

async function fetchViaTestShopifyTokenShopify() {
  const all = [];
  let cursor = null;
  let pages = 0;
  while (pages < 80) {
    pages++;
    const res = await invoke("test-shopify-token", {
      action: "missing_product_types_shopify",
      shop_id: ACTIONKING_SHOP_ID,
      cursor,
    });
    if (!res.ok || !res.items) throw new Error("test-shopify-token missing_product_types_shopify not deployed");
    all.push(...res.items);
    if (!res.has_more || !res.cursor) break;
    cursor = res.cursor;
  }

  const items = all.map((row) => {
    const suggestion = suggestProductType({
      title: row.title,
      vendor: row.vendor,
      tags: row.tags,
      collections: row.collections ?? [],
    });
    return {
      handle: row.handle,
      title: row.title,
      vendor: row.vendor,
      collections: row.collections ?? [],
      suggested_product_type: suggestion.suggested,
      suggestion_confidence: suggestion.confidence,
      suggestion_reason: suggestion.reason,
    };
  });

  items.sort((a, b) => (a.vendor ?? "").localeCompare(b.vendor ?? "", "sv"));
  const bySuggestion = new Map();
  for (const item of items) {
    bySuggestion.set(item.suggested_product_type, (bySuggestion.get(item.suggested_product_type) ?? 0) + 1);
  }

  return {
    source: "test-shopify-token → Shopify Admin GraphQL",
    shop_id: ACTIONKING_SHOP_ID,
    total_missing: items.length,
    items,
    suggestion_summary: [...bySuggestion.entries()]
      .map(([suggested_product_type, count]) => ({ suggested_product_type, count }))
      .sort((a, b) => b.count - a.count),
    generated_at: new Date().toISOString(),
  };
}

async function fetchViaBookkeeping() {
  const data = await invoke("bookkeeping-shopify-payouts", {
    shop_id: ACTIONKING_SHOP_ID,
    report: "missing_product_types",
  });
  if (!data.success || data.total_missing == null) {
    throw new Error("bookkeeping-shopify-payouts missing_product_types not deployed");
  }
  return { source: "bookkeeping-shopify-payouts (DB)", ...data };
}

async function fetchViaShopifyInventory() {
  const data = await invoke("shopify-inventory", {
    action: "get-missing-product-types",
    shopId: ACTIONKING_SHOP_ID,
  });
  if (!data.success || data.total_missing == null) {
    throw new Error("shopify-inventory get-missing-product-types not deployed");
  }
  return { source: "shopify-inventory (DB)", ...data };
}

async function fetchViaCatalogAudit() {
  const data = await invoke("catalog_field_audit", {
    mode: "missing_product_types",
    shop_id: ACTIONKING_SHOP_ID,
  });
  if (data.mode !== "missing_product_types" || data.total_missing == null) {
    throw new Error("catalog_field_audit missing_product_types not deployed");
  }
  return { source: "catalog_field_audit (DB)", ...data };
}

async function fetchViaClonerWorker() {
  const data = await invoke("shopify-cloner-worker", {
    action: "missing_product_types",
    shop_id: ACTIONKING_SHOP_ID,
  });
  if (data.total_missing == null) throw new Error("cloner worker missing_product_types failed");
  return { source: "shopify-cloner-worker → catalog_field_audit", ...data };
}

async function fetchViaShopifyExport() {
  const all = [];
  let cursor = null;
  let pages = 0;
  while (pages < 60) {
    pages++;
    const res = await invoke("shopify-sync", {
      action: "export-missing-product-types",
      shop_id: ACTIONKING_SHOP_ID,
      cursor,
    });
    if (!res.items) throw new Error("shopify-sync export-missing-product-types not deployed");
    all.push(...res.items);
    if (!res.has_more || !res.cursor) break;
    cursor = res.cursor;
  }

  const items = all.map((row) => {
    const suggestion = suggestProductType({
      title: row.title,
      vendor: row.vendor,
      tags: row.tags,
      collections: row.collections ?? [],
    });
    return {
      handle: row.handle,
      title: row.title,
      vendor: row.vendor,
      collections: row.collections ?? [],
      suggested_product_type: suggestion.suggested,
      suggestion_confidence: suggestion.confidence,
      suggestion_reason: suggestion.reason,
    };
  });

  items.sort((a, b) => (a.vendor ?? "").localeCompare(b.vendor ?? "", "sv"));

  const bySuggestion = new Map();
  for (const item of items) {
    bySuggestion.set(item.suggested_product_type, (bySuggestion.get(item.suggested_product_type) ?? 0) + 1);
  }

  return {
    source: "shopify-sync (Shopify live GraphQL)",
    shop_id: ACTIONKING_SHOP_ID,
    total_missing: items.length,
    items,
    suggestion_summary: [...bySuggestion.entries()]
      .map(([suggested_product_type, count]) => ({ suggested_product_type, count }))
      .sort((a, b) => b.count - a.count),
    generated_at: new Date().toISOString(),
  };
}

async function fetchViaShopifyImagesToAds() {
  const all = [];
  let cursor = null;
  let pages = 0;
  while (pages < 120) {
    pages++;
    const res = await invoke("shopify-images-to-ads", {
      action: "export_missing_product_types",
      shopId: ACTIONKING_SHOP_ID,
      cursor,
    });
    if (!res.ok || !res.items) {
      throw new Error("shopify-images-to-ads export_missing_product_types not deployed");
    }
    all.push(...res.items);
    if (!res.has_more || !res.cursor) break;
    cursor = res.cursor;
  }

  const items = all.map((row) => {
    const suggestion = suggestProductType({
      title: row.title,
      vendor: row.vendor,
      tags: row.tags,
      collections: row.collections ?? [],
    });
    return {
      handle: row.handle,
      title: row.title,
      vendor: row.vendor,
      collections: row.collections ?? [],
      suggested_product_type: suggestion.suggested,
      suggestion_confidence: suggestion.confidence,
      suggestion_reason: suggestion.reason,
    };
  });

  items.sort((a, b) => (a.vendor ?? "").localeCompare(b.vendor ?? "", "sv"));
  const bySuggestion = new Map();
  for (const item of items) {
    bySuggestion.set(item.suggested_product_type, (bySuggestion.get(item.suggested_product_type) ?? 0) + 1);
  }

  return {
    source: "shopify-images-to-ads → Shopify Admin GraphQL (tom productType)",
    shop_id: ACTIONKING_SHOP_ID,
    total_missing: items.length,
    items,
    suggestion_summary: [...bySuggestion.entries()]
      .map(([suggested_product_type, count]) => ({ suggested_product_type, count }))
      .sort((a, b) => b.count - a.count),
    generated_at: new Date().toISOString(),
  };
}

async function fetchData() {
  const attempts = [
    () => fetchViaShopifyImagesToAds(),
    () => fetchViaShopifyImagesMissingExport(),
    () => fetchViaShopifyListProducts(),
    () => fetchViaPrisjaktFeed(),
    () => fetchViaClonerWorkerInline(),
    () => fetchViaBulkTranslate(),
    () => fetchViaLinkActionkingDb(),
    () => fetchViaTestShopifyTokenDb(),
    () => fetchViaBookkeeping(),
    () => fetchViaShopifyInventory(),
    () => fetchViaCatalogAudit(),
    () => fetchViaClonerWorker(),
    () => fetchViaShopifyExport(),
    () => fetchViaTestShopifyTokenShopify(),
    () => fetchViaShopifyImagesExport(),
    () => fetchViaShopifyListDrafts(),
  ];
  const errors = [];
  for (const fn of attempts) {
    try {
      console.log(`Trying ${fn.name}…`);
      return await fn();
    } catch (e) {
      errors.push(e.message);
      console.warn(" ", e.message);
    }
  }
  throw new Error(`All fetch methods failed:\n${errors.join("\n")}`);
}

function escCell(s) {
  return String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function renderMarkdown(data) {
  const lines = [];
  lines.push("# MISSING_PRODUCT_TYPE");
  lines.push("");
  lines.push(`**Genererad:** ${new Date(data.generated_at).toLocaleString("sv-SE")}`);
  lines.push(`**Shop:** ActionKing (\`${data.shop_id}\`)`);
  lines.push(`**Källa:** ${data.source}`);
  lines.push(`**Antal produkter utan product_type:** ${data.total_missing.toLocaleString("sv-SE")}`);
  lines.push("");
  lines.push("> Rapport endast — ingen uppdatering, ingen Shopify-ändring.");
  lines.push("");
  lines.push("## Sammanfattning — föreslagna product_types");
  lines.push("");
  lines.push("| Föreslagen product_type | Antal |");
  lines.push("|-------------------------|------:|");
  for (const row of data.suggestion_summary ?? []) {
    lines.push(`| ${escCell(row.suggested_product_type)} | ${row.count} |`);
  }
  lines.push("");
  lines.push("## Alla produkter utan product_type");
  lines.push("");
  lines.push("| # | handle | title | vendor | collections | föreslagen product_type |");
  lines.push("|--:|--------|-------|--------|-------------|-------------------------|");
  (data.items ?? []).forEach((item, i) => {
    const cols = (item.collections ?? []).join("; ") || "—";
    lines.push(
      `| ${i + 1} | ${escCell(item.handle)} | ${escCell((item.title ?? "").slice(0, 70))} | ${escCell(item.vendor)} | ${escCell(cols.slice(0, 100))} | ${escCell(item.suggested_product_type)} |`,
    );
  });
  lines.push("");
  lines.push("## Klassificeringslogik");
  lines.push("");
  lines.push("Föreslagen `product_type` baseras på (i prioritetsordning):");
  lines.push("");
  lines.push("1. **Collections** — Shopify collection-titlar");
  lines.push("2. **Vendor** — t.ex. DJI → Tillbehör till drönare, GoPro → Actionkameror");
  lines.push("3. **Titel/taggar** — keyword-regler");
  lines.push("4. **Fallback** — `Tillbehör`");
  lines.push("");
  return lines.join("\n");
}

async function main() {
  const data = await fetchData();
  writeFileSync(OUT, renderMarkdown(data), "utf8");
  console.log(`Wrote ${OUT} (${data.total_missing} products)`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
