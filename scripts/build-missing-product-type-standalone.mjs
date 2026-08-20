#!/usr/bin/env node
/**
 * Build MISSING_PRODUCT_TYPE.md — tries all endpoints, then Supabase RPC if migrated.
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
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
const ANON = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { error: text.slice(0, 400) };
  }
  if (!r.ok) throw new Error(`${fn} ${r.status}: ${json.error || text.slice(0, 200)}`);
  return json;
}

async function fetchViaReportFn() {
  const json = await invoke("missing-product-type-report", { shop_id: SHOP_ID });
  if (!json.ok || json.total_missing == null) throw new Error("not deployed");
  return { source: json.source, ...json };
}

async function fetchViaRpc() {
  const key = SERVICE || ANON;
  const r = await fetch(`${URL}/rest/v1/rpc/get_missing_product_types_report`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ p_shop_id: SHOP_ID }),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`rpc ${r.status}: ${text.slice(0, 120)}`);
  const rows = JSON.parse(text);
  if (!Array.isArray(rows)) throw new Error("rpc invalid response");

  let collectionMap = {};
  try {
    const mapRes = await invoke("seo-wizard-sync", {
      shopId: SHOP_ID,
      action: "get_product_collection_map",
    });
    collectionMap = mapRes.productCollectionMap ?? {};
    const colRes = await invoke("fetch-shopify-collections", {});
    const titleById = {};
    for (const c of colRes.collections ?? []) titleById[String(c.id)] = c.title;
    const collectionsByShopifyId = new Map();
    for (const [pid, ids] of Object.entries(collectionMap)) {
      const titles = ids.map((id) => titleById[String(id)]).filter(Boolean);
      if (titles.length) collectionsByShopifyId.set(pid, [...new Set(titles)]);
    }
    collectionMap = collectionsByShopifyId;
  } catch {
    /* optional */
  }

  const items = rows.map((row) => {
    const collections = collectionMap.get(String(row.shopify_id ?? "")) ?? [];
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

  return {
    shop_id: SHOP_ID,
    source: "Supabase RPC get_missing_product_types_report",
    total_missing: items.length,
    items,
    suggestion_summary: [...bySuggestion.entries()]
      .map(([suggested_product_type, count]) => ({ suggested_product_type, count }))
      .sort((a, b) => b.count - a.count),
    generated_at: new Date().toISOString(),
  };
}

async function fetchViaClonerWorker() {
  const json = await invoke("shopify-cloner-worker", {
    action: "missing_product_types",
    shop_id: SHOP_ID,
  });
  if (!json.ok || json.total_missing == null || json.processed != null) {
    throw new Error("not deployed");
  }
  return { source: json.source, ...json };
}

async function fetchViaCatalogAudit() {
  const json = await invoke("catalog_field_audit", {
    mode: "missing_product_types",
    shop_id: SHOP_ID,
  });
  if (json.mode !== "missing_product_types" || json.total_missing == null) {
    throw new Error("not deployed");
  }
  return { source: "catalog_field_audit (DB)", ...json };
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
  const attempts = [
    ["missing-product-type-report", fetchViaReportFn],
    ["rpc", fetchViaRpc],
    ["shopify-cloner-worker", fetchViaClonerWorker],
    ["catalog_field_audit", fetchViaCatalogAudit],
  ];
  const errors = [];
  for (const [name, fn] of attempts) {
    try {
      console.log(`Trying ${name}…`);
      const data = await fn();
      writeFileSync(OUT, renderMarkdown(data), "utf8");
      console.log(`Wrote ${OUT} (${data.total_missing} products)`);
      return;
    } catch (e) {
      errors.push(`${name}: ${e.message}`);
      console.warn(" ", e.message);
    }
  }
  throw new Error(`All methods failed:\n${errors.join("\n")}`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
