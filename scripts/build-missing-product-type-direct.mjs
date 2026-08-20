#!/usr/bin/env node
/**
 * Build MISSING_PRODUCT_TYPE.md directly from Supabase products table.
 * Requires SUPABASE_SERVICE_ROLE_KEY (or pass via --local after setting env).
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { suggestProductType } from "./lib/suggest-product-type.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "MISSING_PRODUCT_TYPE.md");
const SHOP_ID = "010120e6-6def-431e-8614-905cb69f85b9";

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
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

function escCell(s) {
  return String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
}

async function fetchMissingRows(supabase) {
  const pageSize = 1000;
  const missing = [];
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
  return missing;
}

async function loadCollectionsByHandle(supabase, handles) {
  const result = new Map();
  if (!handles.length) return result;

  const chunkSize = 200;
  for (let i = 0; i < handles.length; i += chunkSize) {
    const chunk = handles.slice(i, i + chunkSize);
    const { data: seoRows } = await supabase
      .from("seo_targets")
      .select("handle, collection_title")
      .eq("shop_id", SHOP_ID)
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
    .eq("shop_id", SHOP_ID)
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
  if (!URL || !SERVICE) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY required. Set env or run via edge: node scripts/generate-missing-product-type-report.mjs");
  }

  const supabase = createClient(URL, SERVICE);
  const rows = await fetchMissingRows(supabase);
  const handles = rows.map((r) => r.handle).filter(Boolean);
  const collectionsByHandle = await loadCollectionsByHandle(supabase, handles);

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
    };
  });

  items.sort((a, b) => (a.vendor ?? "").localeCompare(b.vendor ?? "", "sv"));

  const bySuggestion = new Map();
  for (const item of items) {
    bySuggestion.set(item.suggested_product_type, (bySuggestion.get(item.suggested_product_type) ?? 0) + 1);
  }

  const data = {
    shop_id: SHOP_ID,
    source: "Supabase products table (service role)",
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
