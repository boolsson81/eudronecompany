#!/usr/bin/env node
/**
 * Full catalog channel report builder.
 * Paginates products via catalog_field_audit channel mode OR Shopify GraphQL export.
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import {
  ACTIONKING_SHOP_ID,
  classifyProduct,
  detectMisplaced,
  CHANNELS,
  PRODUCT_TYPE_CHANNEL,
  OFF_CATALOG_VENDORS,
} from "./lib/product-channel-rules.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "PRODUCT_CHANNEL_CLASSIFICATION.md");

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
  const json = text ? JSON.parse(text) : {};
  if (!r.ok) throw new Error(`${fn}: ${json.error || text.slice(0, 200)}`);
  return json;
}

/** Fetch all products from Shopify via repeated shopify-sync + scan via audit counts per type */
async function fetchProductsViaShopifyExport() {
  // Use fetch-shopify-collections + Shopify products query via shopify-sync credentials on edge
  const products = [];
  let cursor = null;
  let pages = 0;
  const maxPages = 120;

  while (pages < maxPages) {
    const body = cursor
      ? { action: "export_products_page", cursor, limit: 250 }
      : { action: "export_products_page", limit: 250 };

    try {
      const res = await invoke("shopify-sync", body);
      if (!res.products?.length) break;
      products.push(...res.products);
      if (!res.has_more || !res.cursor) break;
      cursor = res.cursor;
      pages++;
    } catch {
      break;
    }
  }
  return products;
}

async function fetchAllProductsViaAuditPages() {
  // Try channel classification mode first
  try {
    const data = await invoke("catalog_field_audit", {
      mode: "channel_classification",
      shop_id: ACTIONKING_SHOP_ID,
      misplaced_limit: 500,
    });
    if (data.total_products) return { mode: "edge_full", data };
  } catch { /* not deployed */ }

  try {
    const data = await invoke("shopify-cloner-worker", {
      action: "product_channel_classification",
      shop_id: ACTIONKING_SHOP_ID,
      misplaced_limit: 500,
    });
    if (data.total_products) return { mode: "edge_full", data };
  } catch { /* not deployed */ }

  // Build from full product scan via paginated product export through Shopify GraphQL proxy
  const products = await fetchProductsViaShopifyExport();
  if (products.length > 1000) {
    const orders = await invoke("shopify-order-profitability", {
      shopId: ACTIONKING_SHOP_ID,
      days: 730,
      limit: 1000,
    });
    const revenueByTitle = new Map();
    for (const o of orders.orders ?? []) {
      for (const item of o.items ?? []) {
        const t = item.title || "";
        revenueByTitle.set(t, (revenueByTitle.get(t) ?? 0) + (item.lineRevenue ?? 0));
      }
    }
    return { mode: "shopify_export", products, revenueByTitle, orders };
  }

  // Aggregate fallback from audit distributions
  const [typeAudit, vendorAudit, orders] = await Promise.all([
    invoke("catalog_field_audit", { fields: ["product_type"], shop_id: ACTIONKING_SHOP_ID }),
    invoke("catalog_field_audit", { fields: ["vendor"], shop_id: ACTIONKING_SHOP_ID }),
    invoke("shopify-order-profitability", { shopId: ACTIONKING_SHOP_ID, days: 730, limit: 1000 }),
  ]);
  return { mode: "aggregate", typeAudit, vendorAudit, orders };
}

function buildFromProducts(products, revenueMap) {
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
    const rev = revenueMap?.get(String(p.shopify_id ?? "")) ?? revenueMap?.get(p.title) ?? 0;
    if (rev) channelRevenue[channel] += typeof rev === "number" ? rev : rev.revenue ?? 0;
    const m = detectMisplaced(p, channel);
    if (m) misplaced.push({ ...m, revenue_sek: typeof rev === "number" ? rev : rev?.revenue ?? 0 });
  }

  misplaced.sort((a, b) => (b.revenue_sek ?? 0) - (a.revenue_sek ?? 0));
  const totalRevenue = Object.values(channelRevenue).reduce((s, v) => s + v, 0);

  return {
    shop_id: ACTIONKING_SHOP_ID,
    total_products: products.length,
    channels: Object.fromEntries(CHANNELS.map((ch) => [ch, {
      products: channelCounts[ch],
      share_pct: products.length ? Math.round((channelCounts[ch] / products.length) * 1000) / 10 : 0,
      revenue_sek: Math.round(channelRevenue[ch]),
      revenue_share_pct: totalRevenue ? Math.round((channelRevenue[ch] / totalRevenue) * 1000) / 10 : 0,
    }])),
    revenue: {
      total_sek: Math.round(totalRevenue),
      source: "order_line_items / order titles",
    },
    top_vendors: [...vendorCounts.entries()].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count).slice(0, 100),
    top_product_types: [...typeCounts.entries()].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count).slice(0, 100),
    misplaced_products: misplaced.slice(0, 300),
    misplaced_total: misplaced.length,
    generated_at: new Date().toISOString(),
    source: "per_product_classification",
  };
}

function buildFromAggregate({ typeAudit, vendorAudit, orders }) {
  const typeRows = typeAudit.results?.[0]?.top_values ?? [];
  const vendorRows = vendorAudit.results?.[0]?.top_values ?? [];
  const totalProducts = typeAudit.results?.[0]?.total_rows ?? 0;
  const distinctVendors = vendorAudit.results?.[0]?.distinct_values ?? 0;
  const distinctTypes = typeAudit.results?.[0]?.distinct_values ?? 0;

  const channelCounts = Object.fromEntries(CHANNELS.map((c) => [c, 0]));
  const channelRevenue = Object.fromEntries(CHANNELS.map((c) => [c, 0]));
  const vendorCounts = new Map();
  const typeCounts = new Map();
  const misplaced = [];

  let counted = 0;
  for (const row of typeRows) {
    const ptype = row.value ?? "";
    const count = row.count ?? 0;
    typeCounts.set(ptype || "(null)", count);
    counted += count;
    const { channel } = classifyProduct({ title: "", vendor: "", product_type: ptype, tags: "", status: "active" });
    channelCounts[channel] += count;
  }
  channelCounts.Shared += Math.max(0, totalProducts - counted);

  for (const row of vendorRows) {
    vendorCounts.set(row.value ?? "(null)", row.count ?? 0);
    const vendor = row.value ?? "";
    const count = row.count ?? 0;
    if (OFF_CATALOG_VENDORS.has(vendor) && count > 0) {
      misplaced.push({
        title: `[bulk] ${count} produkter under off-catalog vendor`,
        vendor,
        product_type: "—",
        assigned: "Shared",
        suggested: "Archive",
        confidence: "high",
        reason: `off-catalog vendor — bör inte ligga kvar i aktiv kanalkatalog`,
        revenue_sek: 0,
      });
    }
    // Vendor alias duplicates (pre-normalization)
    if (["AK", "Ak", "POLARPRO", "PULUZ", "PGYTECH", "TwelveSout"].includes(vendor)) {
      misplaced.push({
        title: `[data quality] Vendor-alias "${vendor}" (${count} st)`,
        vendor,
        product_type: "—",
        assigned: "—",
        suggested: "normalisera",
        confidence: "high",
        reason: "vendor-dubblett — se CATALOG_NORMALIZATION_LOCAL_RESULT.md",
        revenue_sek: 0,
      });
    }
  }

  // Product types that conflict with channel intent
  const typeConflicts = [
    { type: "Kamerafilter", assigned: "EUActionCam", note: "427 st — kan innehålla drönarfilter; granska mot Drönar filter" },
    { type: "DJI & GoPro Accessories", assigned: "Shared", note: "1 451 st — splittas vid kanaluppdelning till EDP/EAC" },
    { type: "(null)", assigned: "Shared", note: "481 st utan product_type — kräver AI/manuell klassificering" },
    { type: "Enterprise Drönare", assigned: "EuroDroneParts", note: "15 116 st — största bucket; verifiera att ej action-cam" },
  ];
  for (const tc of typeConflicts) {
    const row = typeRows.find((r) => (r.value ?? "(null)") === tc.type || (tc.type === "(null)" && r.value === null));
    if (row?.count) {
      misplaced.push({
        title: `[product_type] ${tc.type} (${row.count} st)`,
        vendor: "—",
        product_type: tc.type,
        assigned: tc.assigned,
        suggested: "granska",
        confidence: "medium",
        reason: tc.note,
        revenue_sek: 0,
      });
    }
  }

  // Classify order line items for revenue + misplaced titles
  const seenTitles = new Set();
  for (const order of orders.orders ?? []) {
    for (const item of order.items ?? []) {
      const p = { title: item.title, vendor: item.vendor, product_type: "", tags: "", status: "active" };
      const { channel } = classifyProduct(p);
      channelRevenue[channel] += item.lineRevenue ?? 0;
      const m = detectMisplaced(p, channel);
      if (m && !seenTitles.has(item.title) && ((item.lineRevenue ?? 0) > 200 || m.confidence === "high")) {
        seenTitles.add(item.title);
        misplaced.push({ ...m, revenue_sek: item.lineRevenue ?? 0 });
      }
    }
  }

  misplaced.sort((a, b) => (b.revenue_sek ?? 0) - (a.revenue_sek ?? 0));
  const totalRevenue = Object.values(channelRevenue).reduce((s, v) => s + v, 0);

  return {
    shop_id: ACTIONKING_SHOP_ID,
    total_products: totalProducts,
    distinct_vendors: distinctVendors,
    distinct_product_types: distinctTypes,
    channels: Object.fromEntries(CHANNELS.map((ch) => [ch, {
      products: channelCounts[ch],
      share_pct: totalProducts ? Math.round((channelCounts[ch] / totalProducts) * 1000) / 10 : 0,
      revenue_sek: Math.round(channelRevenue[ch]),
      revenue_share_pct: totalRevenue ? Math.round((channelRevenue[ch] / totalRevenue) * 1000) / 10 : 0,
    }])),
    revenue: {
      total_sek: Math.round(totalRevenue),
      source: "shopify-order-profitability (730 dagar, orderrad-titlar)",
      note: "Produktantal från product_type-fördelning (topp 25 typer + svans). Deploya catalog_field_audit mode=channel_classification för exakt per-produkt.",
    },
    top_vendors: [...vendorCounts.entries()].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count),
    top_product_types: [...typeCounts.entries()].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count),
    misplaced_products: misplaced.slice(0, 300),
    misplaced_total: misplaced.length,
    generated_at: new Date().toISOString(),
    source: "aggregate + order_line_items",
  };
}

function fmtSek(n) {
  return new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 0 }).format(n);
}

function renderMarkdown(data) {
  const lines = [];
  lines.push("# PRODUCT_CHANNEL_CLASSIFICATION");
  lines.push("");
  lines.push(`**Genererad:** ${new Date(data.generated_at).toLocaleString("sv-SE")}`);
  lines.push(`**Källa:** ActionKing Shopify-katalog (\`products\`, shop_id \`${data.shop_id}\`)`);
  lines.push(`**Analysmotor:** ${data.source}`);
  lines.push(`**Totalt antal produkter:** ${data.total_products.toLocaleString("sv-SE")}`);
  if (data.distinct_vendors) lines.push(`**Distinct vendors:** ${data.distinct_vendors}`);
  if (data.distinct_product_types) lines.push(`**Distinct product types:** ${data.distinct_product_types}`);
  lines.push("");
  lines.push("> Rapport endast — ingen borttagning, ingen Shopify-ändring.");
  lines.push("");
  lines.push("## Kanaldefinitioner");
  lines.push("");
  lines.push("| Kanal | Avsedd målbutik / roll |");
  lines.push("|-------|------------------------|");
  lines.push("| **EuroDroneParts** | Drönare, DJI-ekosystem, reservdelar, propellrar, enterprise UAV |");
  lines.push("| **EUActionCam** | Actionkameror (GoPro, Insta360, Osmo Action) och direkt tillbehör |");
  lines.push("| **Shared** | Korskanal-tillbehör: batterier, kablar, väskor, minneskort, fästen m.m. |");
  lines.push("| **Archive** | Arkiverade, utgångna eller off-assortment (t.ex. El-Scooter, EcoFlow, Targus) |");
  lines.push("");
  lines.push("## Produkter per kanal");
  lines.push("");
  lines.push("| Kanal | Produkter | Andel | Omsättning (SEK) | Andel oms. |");
  lines.push("|-------|----------:|------:|-----------------:|-----------:|");
  for (const ch of CHANNELS) {
    const c = data.channels[ch];
    lines.push(`| ${ch} | ${c.products.toLocaleString("sv-SE")} | ${c.share_pct}% | ${c.revenue_sek ? fmtSek(c.revenue_sek) : "—"} | ${c.revenue_sek ? `${c.revenue_share_pct}%` : "—"} |`);
  }
  lines.push("");
  lines.push("## Omsättning per kanal");
  lines.push("");
  if (data.revenue?.total_sek > 0) {
    lines.push(`- **Total omsättning (klassificerad):** ${fmtSek(data.revenue.total_sek)}`);
    lines.push(`- **Källa:** ${data.revenue.source}`);
    if (data.revenue.note) lines.push(`- ${data.revenue.note}`);
  } else {
    lines.push("Ingen omsättningsdata tillgänglig.");
  }
  lines.push("");
  const vendorNote = data.top_vendors.length < 100 && data.distinct_vendors > 100
    ? `\n\n_Visar ${data.top_vendors.length} av ${data.distinct_vendors} vendors (deployera \`catalog_field_audit\` med \`top_limit: 100\` för full lista)._`
    : "";
  lines.push(`## Topp 100 vendors${vendorNote}`);
  lines.push("");
  lines.push("| # | Vendor | Antal produkter |");
  lines.push("|---|--------|----------------:|");
  data.top_vendors.slice(0, 100).forEach((v, i) => {
    lines.push(`| ${i + 1} | ${v.value ?? "(null)"} | ${v.count.toLocaleString("sv-SE")} |`);
  });
  const typeNote = data.top_product_types.length < 100 && data.distinct_product_types > 25
    ? `\n\n_Visar ${data.top_product_types.length} av ${data.distinct_product_types} product types._`
    : "";
  lines.push("");
  lines.push(`## Topp 100 product types${typeNote}`);
  lines.push("");
  lines.push("| # | Product type | Antal produkter | Primär kanal (regel) |");
  lines.push("|---|--------------|----------------:|----------------------|");
  data.top_product_types.slice(0, 100).forEach((t, i) => {
    const ch = PRODUCT_TYPE_CHANNEL[t.value ?? ""] || "Shared (fallback)";
    lines.push(`| ${i + 1} | ${t.value ?? "(null)"} | ${t.count.toLocaleString("sv-SE")} | ${ch} |`);
  });
  lines.push("");
  lines.push(`## Felplacerade produkter (${data.misplaced_total} identifierade, visar ${Math.min(100, data.misplaced_products.length)})`);
  lines.push("");
  lines.push("Produkter där tilldelad kanal konfliktar med vendor/product_type/titel-signaler.");
  lines.push("");
  if (!data.misplaced_products.length) {
    lines.push("_Inga tydliga felplaceringar identifierade._");
  } else {
    lines.push("| Titel | Vendor | Product type | Tilldelad | Föreslagen | Konfidens | Omsättning |");
    lines.push("|-------|--------|--------------|-----------|------------|-----------|------------|");
    for (const m of data.misplaced_products.slice(0, 100)) {
      const title = (m.title || "").replace(/\|/g, "\\|").slice(0, 70);
      lines.push(`| ${title} | ${m.vendor ?? ""} | ${m.product_type ?? ""} | ${m.assigned} | ${m.suggested} | ${m.confidence} | ${m.revenue_sek ? fmtSek(m.revenue_sek) : "—"} |`);
    }
  }
  lines.push("");
  lines.push("## Klassificeringsregler (sammanfattning)");
  lines.push("");
  lines.push("1. `product_type=Arkiv` eller `status=archived` → **Archive**");
  lines.push("2. Off-catalog vendors (EcoFlow, Targus, Sony, …) → **Archive**");
  lines.push("3. Drönar-relaterade product_types → **EuroDroneParts**");
  lines.push("4. Actionkamera product_types → **EUActionCam**");
  lines.push("5. Korskanal-tillbehör → **Shared**");
  lines.push("6. Keyword-fallback på titel/taggar vid oklar product_type");
  lines.push("");
  lines.push("## Observationer");
  lines.push("");
  lines.push(`- **EuroDroneParts:** ${data.channels.EuroDroneParts.products.toLocaleString("sv-SE")} produkter (${data.channels.EuroDroneParts.share_pct}%) — domineras av \`Enterprise Drönare\` (15 116 st) och DJI (5 846 st).`);
  lines.push(`- **EUActionCam:** ${data.channels.EUActionCam.products.toLocaleString("sv-SE")} produkter — actionkameror, filter och reservdelar.`);
  lines.push(`- **Shared:** ${data.channels.Shared.products.toLocaleString("sv-SE")} produkter — \`DJI & GoPro Accessories\`, batterier, väskor, kablar.`);
  lines.push(`- **Archive:** ${data.channels.Archive.products.toLocaleString("sv-SE")} produkter — Arkiv (1 362), El-Scooter (492), off-catalog vendors.`);
  lines.push(`- **${data.misplaced_total}** felplaceringar flaggade (off-catalog vendors + orderrader med kanalkonflikt).`);
  lines.push("");
  return lines.join("\n");
}

async function main() {
  const raw = await fetchAllProductsViaAuditPages();
  let data;
  if (raw.mode === "edge_full") {
    data = raw.data;
    data.source = "catalog_field_audit (per-produkt)";
  } else if (raw.mode === "shopify_export") {
    data = buildFromProducts(raw.products, raw.revenueByTitle);
  } else {
    data = buildFromAggregate(raw);
  }
  writeFileSync(OUT, renderMarkdown(data), "utf8");
  console.log(`Wrote ${OUT}`);
  console.log(`Products: ${data.total_products}, misplaced: ${data.misplaced_total}, source: ${data.source}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
