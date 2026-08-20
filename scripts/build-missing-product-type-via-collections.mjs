#!/usr/bin/env node
/**
 * Build missing product_type list via Shopify Admin REST pagination (edge proxy)
 * and storefront collection pages. Writes JSON to stdout.
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { suggestProductType } from "./lib/suggest-product-type.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "MISSING_PRODUCT_TYPE.md");
const SHOP_ID = "010120e6-6def-431e-8614-905cb69f85b9";
const SHOP_DOMAIN = "bvy0b8-0b.myshopify.com";

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

async function fetchAllViaAdminRest() {
  const all = [];
  let cursor = `https://${SHOP_DOMAIN}/admin/api/2024-01/products.json?fields=id,handle,title,vendor,product_type,tags,status&limit=250`;
  let pages = 0;

  while (cursor && pages < 250) {
    pages++;
    const res = await invoke("shopify-images", {
      action: "list-products",
      limit: 250,
      cursor,
      includeProducts: true,
    });

    if (res.products?.length) {
      all.push(...res.products);
    } else if (!res.nextCursor) {
      throw new Error("shopify-images includeProducts not deployed");
    }

    if (!res.hasMore || !res.nextCursor) break;
    cursor = res.nextCursor;
    await new Promise((r) => setTimeout(r, 120));
  }

  return all;
}

async function loadCollectionsByProductId() {
  const collectionsByProductId = new Map();
  try {
    const mapRes = await invoke("seo-wizard-sync", {
      shopId: SHOP_ID,
      action: "get_product_collection_map",
    });
    const collectionMap = mapRes.productCollectionMap ?? {};
    const colRes = await invoke("fetch-shopify-collections", {});
    const collectionTitles = {};
    for (const c of colRes.collections ?? []) {
      collectionTitles[String(c.id)] = c.title;
    }
    for (const [productId, collectionIds] of Object.entries(collectionMap)) {
      const titles = collectionIds
        .map((id) => collectionTitles[String(id)])
        .filter(Boolean);
      if (titles.length) collectionsByProductId.set(productId, [...new Set(titles)]);
    }
  } catch {
    /* optional */
  }
  return collectionsByProductId;
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
  const rows = await fetchAllViaAdminRest();
  const collectionsByProductId = await loadCollectionsByProductId();

  const items = rows
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
      };
    });

  items.sort((a, b) => (a.vendor ?? "").localeCompare(b.vendor ?? "", "sv"));

  const bySuggestion = new Map();
  for (const item of items) {
    bySuggestion.set(item.suggested_product_type, (bySuggestion.get(item.suggested_product_type) ?? 0) + 1);
  }

  const data = {
    shop_id: SHOP_ID,
    source: "shopify-images list-products → Shopify Admin REST (paginated)",
    total_missing: items.length,
    items,
    suggestion_summary: [...bySuggestion.entries()]
      .map(([suggested_product_type, count]) => ({ suggested_product_type, count }))
      .sort((a, b) => b.count - a.count),
    generated_at: new Date().toISOString(),
  };

  writeFileSync(OUT, renderMarkdown(data), "utf8");
  console.log(`Wrote ${OUT} (${data.total_missing} products)`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
