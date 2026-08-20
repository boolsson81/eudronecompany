#!/usr/bin/env node
/**
 * Build MISSING_PRODUCT_TYPE.md via get_missing_product_types_report RPC (if migration applied).
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

async function fetchRows() {
  const r = await fetch(`${URL}/rest/v1/rpc/get_missing_product_types_report`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: ANON,
      Authorization: `Bearer ${ANON}`,
    },
    body: JSON.stringify({ p_shop_id: SHOP_ID }),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`RPC ${r.status}: ${text.slice(0, 300)}`);
  return JSON.parse(text);
}

function escCell(s) {
  return String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
}

async function main() {
  const rows = await fetchRows();
  const items = rows.map((row) => {
    const suggestion = suggestProductType({
      title: row.title,
      vendor: row.vendor,
      tags: row.tags,
      collections: [],
    });
    return {
      handle: row.handle,
      title: row.title,
      vendor: row.vendor,
      collections: [],
      suggested_product_type: suggestion.suggested,
    };
  });

  items.sort((a, b) => (a.vendor ?? "").localeCompare(b.vendor ?? "", "sv"));

  const bySuggestion = new Map();
  for (const item of items) {
    bySuggestion.set(item.suggested_product_type, (bySuggestion.get(item.suggested_product_type) ?? 0) + 1);
  }

  const lines = [];
  lines.push("# MISSING_PRODUCT_TYPE");
  lines.push("");
  lines.push(`**Genererad:** ${new Date().toLocaleString("sv-SE")}`);
  lines.push(`**Shop:** ActionKing (\`${SHOP_ID}\`)`);
  lines.push(`**Källa:** Supabase RPC get_missing_product_types_report`);
  lines.push(`**Antal produkter utan product_type:** ${items.length.toLocaleString("sv-SE")}`);
  lines.push("");
  lines.push("> Rapport endast — ingen uppdatering, ingen Shopify-ändring.");
  lines.push("");
  lines.push("## Sammanfattning — föreslagna product_types");
  lines.push("");
  lines.push("| Föreslagen product_type | Antal |");
  lines.push("|-------------------------|------:|");
  for (const [suggested, count] of [...bySuggestion.entries()].sort((a, b) => b[1] - a[1])) {
    lines.push(`| ${escCell(suggested)} | ${count} |`);
  }
  lines.push("");
  lines.push("## Alla produkter utan product_type");
  lines.push("");
  lines.push("| # | handle | title | vendor | collections | föreslagen product_type |");
  lines.push("|--:|--------|-------|--------|-------------|-------------------------|");
  items.forEach((item, i) => {
    lines.push(
      `| ${i + 1} | ${escCell(item.handle)} | ${escCell((item.title ?? "").slice(0, 70))} | ${escCell(item.vendor)} | — | ${escCell(item.suggested_product_type)} |`,
    );
  });
  lines.push("");
  writeFileSync(OUT, lines.join("\n"), "utf8");
  console.log(`Wrote ${OUT} (${items.length} products)`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
