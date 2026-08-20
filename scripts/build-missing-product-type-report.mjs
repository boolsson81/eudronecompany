#!/usr/bin/env node
/**
 * Build MISSING_PRODUCT_TYPE.md — tries deployed DB export endpoints (read-only).
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

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

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const ANON = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

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

async function invoke(fn, body) {
  const r = await fetch(`${supabaseUrl}/functions/v1/${fn}`, {
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

async function tryExports() {
  const attempts = [
    async () => {
      const res = await invoke("seo-wizard-sync", {
        shopId: SHOP_ID,
        action: "export_missing_product_types",
      });
      if (res.action !== "export_missing_product_types" || res.total_missing == null) {
        throw new Error("not deployed");
      }
      return { source: res.source ?? "seo-wizard-sync → Supabase DB", data: res };
    },
    async () => {
      const res = await invoke("sync-shopify-suppliers", {
        shopId: SHOP_ID,
        report: "missing_product_types",
      });
      if (res.report !== "missing_product_types" || res.total_missing == null) {
        throw new Error("not deployed");
      }
      return { source: res.source ?? "sync-shopify-suppliers → Supabase DB", data: res };
    },
    async () => {
      const res = await invoke("jsonld-product-scan", {
        shop_id: SHOP_ID,
        report: "missing_product_types",
      });
      if (res.report !== "missing_product_types" || res.total_missing == null) {
        throw new Error("not deployed");
      }
      return { source: res.source ?? "jsonld-product-scan → Supabase DB", data: res };
    },
    async () => {
      const res = await invoke("catalog_field_audit", {
        mode: "missing_product_types",
        shop_id: SHOP_ID,
      });
      if (res.mode !== "missing_product_types" || res.total_missing == null) {
        throw new Error("not deployed");
      }
      return { source: "catalog_field_audit → Supabase DB", data: res };
    },
    async () => {
      const res = await invoke("shopify-cloner-worker", {
        action: "missing_product_types",
        shop_id: SHOP_ID,
      });
      if (!res.items || res.action !== "missing_product_types") throw new Error("not deployed");
      return { source: res.source ?? "shopify-cloner-worker → Supabase DB", data: res };
    },
    async () => {
      const r = await fetch(`${supabaseUrl}/rest/v1/rpc/get_missing_product_types_report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: ANON,
          Authorization: `Bearer ${ANON}`,
        },
        body: JSON.stringify({ p_shop_id: SHOP_ID }),
      });
      const text = await r.text();
      if (!r.ok) throw new Error(`rpc ${r.status}`);
      const rows = JSON.parse(text);
      if (!Array.isArray(rows)) throw new Error("invalid rpc");
      const { suggestProductType } = await import("./lib/suggest-product-type.mjs");
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
      const bySuggestion = new Map();
      for (const item of items) {
        bySuggestion.set(item.suggested_product_type, (bySuggestion.get(item.suggested_product_type) ?? 0) + 1);
      }
      return {
        source: "Supabase RPC get_missing_product_types_report",
        data: {
          shop_id: SHOP_ID,
          total_missing: items.length,
          items,
          suggestion_summary: [...bySuggestion.entries()]
            .map(([suggested_product_type, count]) => ({ suggested_product_type, count }))
            .sort((a, b) => b.count - a.count),
          generated_at: new Date().toISOString(),
        },
      };
    },
  ];

  const errors = [];
  for (const fn of attempts) {
    try {
      return await fn();
    } catch (e) {
      errors.push(e.message);
    }
  }
  throw new Error(`No export endpoint available. Tried ${attempts.length} methods. Last: ${errors.at(-1)}`);
}

async function main() {
  const { source, data } = await tryExports();
  if (!data.items?.length && data.total_missing > 0) {
    throw new Error(`Export returned total_missing=${data.total_missing} but no items`);
  }
  writeFileSync(
    OUT,
    renderMarkdown({
      source,
      shop_id: data.shop_id ?? SHOP_ID,
      total_missing: data.total_missing,
      items: data.items,
      suggestion_summary: data.suggestion_summary,
      generated_at: data.generated_at ?? new Date().toISOString(),
    }),
    "utf8",
  );
  console.log(`Wrote ${OUT} (${data.total_missing} products) via ${source}`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
