#!/usr/bin/env node
/**
 * Generate PRODUCT_CHANNEL_CLASSIFICATION.md from live catalog data.
 *
 * Usage:
 *   node scripts/generate-product-channel-report.mjs
 *   node scripts/generate-product-channel-report.mjs --via-edge
 *   SUPABASE_SERVICE_ROLE_KEY=... node scripts/generate-product-channel-report.mjs --local
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
} from "./lib/product-channel-rules.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "PRODUCT_CHANNEL_CLASSIFICATION.md");
const VIA_EDGE = process.argv.includes("--via-edge") || !process.argv.includes("--local");

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

async function invokeEdge(path, body) {
  if (!URL || !ANON) throw new Error("Missing Supabase URL/anon key in .env");
  const r = await fetch(`${URL}/functions/v1/${path}`, {
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
  if (!r.ok) throw new Error(`${path} ${r.status}: ${json.error || text.slice(0, 200)}`);
  return json;
}

async function fetchViaEdge() {
  try {
    const data = await invokeEdge("shopify-cloner-worker", {
      action: "product_channel_classification",
      shop_id: ACTIONKING_SHOP_ID,
      misplaced_limit: 300,
    });
    if (data.total_products) return data;
  } catch (e) {
    console.warn("shopify-cloner-worker:", e.message);
  }

  const data = await invokeEdge("catalog_field_audit", {
    mode: "channel_classification",
    shop_id: ACTIONKING_SHOP_ID,
    misplaced_limit: 300,
  });
  if (data.mode !== "channel_classification" || !data.total_products) {
    throw new Error("Edge function channel_classification not deployed yet");
  }
  return data;
}

async function fetchAllProductsLocal(supabase, shopId) {
  const products = [];
  const pageSize = 1000;
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from("products")
      .select("id, shopify_id, title, vendor, product_type, tags, status, handle")
      .eq("shop_id", shopId)
      .range(from, from + pageSize - 1);
    if (error) throw error;
    if (!data?.length) break;
    products.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return products;
}

async function fetchRevenueLocal(supabase, shopId) {
  const map = new Map();
  const pageSize = 1000;
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from("order_line_items")
      .select("shopify_product_id, price, quantity")
      .eq("shop_id", shopId)
      .range(from, from + pageSize - 1);
    if (error) throw error;
    if (!data?.length) break;
    for (const row of data) {
      const pid = String(row.shopify_product_id ?? "");
      if (!pid) continue;
      const rev = Number(row.price ?? 0) * Number(row.quantity ?? 0);
      const units = Number(row.quantity ?? 0);
      const cur = map.get(pid) ?? { revenue: 0, units: 0 };
      cur.revenue += rev;
      cur.units += units;
      map.set(pid, cur);
    }
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return map;
}

function buildReportFromProducts(products, revenueByProduct) {
  const channelCounts = Object.fromEntries(CHANNELS.map((c) => [c, 0]));
  const channelRevenue = Object.fromEntries(CHANNELS.map((c) => [c, 0]));
  const vendorCounts = new Map();
  const typeCounts = new Map();
  const misplaced = [];

  for (const p of products) {
    const { channel } = classifyProduct(p);
    channelCounts[channel]++;
    const vendor = p.vendor || "(null)";
    const ptype = p.product_type || "(null)";
    vendorCounts.set(vendor, (vendorCounts.get(vendor) ?? 0) + 1);
    typeCounts.set(ptype, (typeCounts.get(ptype) ?? 0) + 1);
    const rev = revenueByProduct.get(String(p.shopify_id ?? ""));
    if (rev) channelRevenue[channel] += rev.revenue;
    const m = detectMisplaced(p, channel);
    if (m) misplaced.push({ ...m, revenue_sek: rev?.revenue ?? 0 });
  }

  misplaced.sort((a, b) => (b.revenue_sek ?? 0) - (a.revenue_sek ?? 0));
  const totalRevenue = Object.values(channelRevenue).reduce((s, v) => s + v, 0);

  return {
    shop_id: ACTIONKING_SHOP_ID,
    total_products: products.length,
    channels: Object.fromEntries(
      CHANNELS.map((ch) => [
        ch,
        {
          products: channelCounts[ch],
          share_pct: products.length ? Math.round((channelCounts[ch] / products.length) * 1000) / 10 : 0,
          revenue_sek: Math.round(channelRevenue[ch]),
          revenue_share_pct: totalRevenue ? Math.round((channelRevenue[ch] / totalRevenue) * 1000) / 10 : 0,
        },
      ]),
    ),
    revenue: {
      total_sek: Math.round(totalRevenue),
      source: "order_line_items",
      note: totalRevenue > 0
        ? "Aggregerat från order_line_items (historisk försäljning per shopify_product_id)."
        : "Ingen omsättningsdata i order_line_items för vald shop.",
    },
    top_vendors: [...vendorCounts.entries()].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count).slice(0, 100),
    top_product_types: [...typeCounts.entries()].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count).slice(0, 100),
    misplaced_products: misplaced.slice(0, 300),
    misplaced_total: misplaced.length,
    generated_at: new Date().toISOString(),
    source: "local_service_role",
  };
}

async function fetchLocal() {
  if (!URL || !SERVICE) throw new Error("SUPABASE_SERVICE_ROLE_KEY required for --local mode");
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(URL, SERVICE);
  const products = await fetchAllProductsLocal(supabase, ACTIONKING_SHOP_ID);
  const revenue = await fetchRevenueLocal(supabase, ACTIONKING_SHOP_ID);
  return buildReportFromProducts(products, revenue);
}

/** Fallback: product_type-level classification from catalog_field_audit + order revenue */
async function fetchAggregateFallback() {
  console.log("Using aggregate fallback (catalog_field_audit + order profitability)…");
  const [typeAudit, vendorAudit, orders] = await Promise.all([
    invokeEdge("catalog_field_audit", { fields: ["product_type"], shop_id: ACTIONKING_SHOP_ID, top_limit: 100 }),
    invokeEdge("catalog_field_audit", { fields: ["vendor"], shop_id: ACTIONKING_SHOP_ID, top_limit: 100 }),
    invokeEdge("shopify-order-profitability", { shopId: ACTIONKING_SHOP_ID, days: 730, limit: 500 }),
  ]);

  const typeRows = typeAudit.results?.[0]?.top_values ?? [];
  const vendorRows = vendorAudit.results?.[0]?.top_values ?? [];
  const totalProducts = typeAudit.results?.[0]?.total_rows ?? 0;

  const channelCounts = Object.fromEntries(CHANNELS.map((c) => [c, 0]));
  const channelRevenue = Object.fromEntries(CHANNELS.map((c) => [c, 0]));
  const typeCounts = new Map();
  const vendorCounts = new Map();
  const misplaced = [];

  let counted = 0;
  for (const row of typeRows) {
    const ptype = row.value ?? "";
    const count = row.count ?? 0;
    typeCounts.set(ptype || "(null)", count);
    counted += count;
    const synthetic = { title: "", vendor: "", product_type: ptype, tags: "", status: "active" };
    const { channel } = classifyProduct(synthetic);
    channelCounts[channel] += count;

    // Flag product_types that conflict with channel assignment
    const mapped = PRODUCT_TYPE_CHANNEL[ptype];
    if (mapped && mapped !== channel) {
      misplaced.push({
        title: `[product_type aggregate] ${ptype || "(null)"}`,
        vendor: "—",
        product_type: ptype,
        assigned: mapped,
        suggested: channel,
        confidence: "medium",
        reason: "product_type-regel vs keyword/vendor-fallback",
        revenue_sek: 0,
      });
    }
    if (!mapped && ptype && ptype !== "Arkiv") {
      const vendorGuess = classifyProduct({ ...synthetic, vendor: "DJI" }).channel;
      if (vendorGuess !== channel) {
        misplaced.push({
          title: `[unmapped type] ${ptype}`,
          vendor: "—",
          product_type: ptype,
          assigned: "Shared",
          suggested: channel,
          confidence: "low",
          reason: "saknar product_type-mapping",
          revenue_sek: 0,
        });
      }
    }
  }

  // Tail products not in top-N distribution
  const tail = Math.max(0, totalProducts - counted);
  if (tail > 0) channelCounts.Shared += tail;

  for (const row of vendorRows) {
    vendorCounts.set(row.value ?? "(null)", row.count ?? 0);
    const vendor = row.value ?? "";
    const { channel } = classifyProduct({ title: "", vendor, product_type: "", tags: "", status: "active" });
    if (channel === "Archive" && row.count > 50) {
      misplaced.push({
        title: `[vendor aggregate] ${vendor}`,
        vendor,
        product_type: "—",
        assigned: "Shared",
        suggested: "Archive",
        confidence: "medium",
        reason: "off-catalog vendor med aktiv katalogstorlek",
        revenue_sek: 0,
      });
    }
  }

  // Revenue from orders — classify line items by title
  for (const order of orders.orders ?? []) {
    for (const item of order.items ?? []) {
      const { channel } = classifyProduct({
        title: item.title,
        vendor: item.vendor,
        product_type: "",
        tags: "",
        status: "active",
      });
      channelRevenue[channel] += item.lineRevenue ?? item.price * item.quantity ?? 0;
    }
  }

  const totalRevenue = Object.values(channelRevenue).reduce((s, v) => s + v, 0);
  const topVendors = [...vendorCounts.entries()].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count).slice(0, 100);
  const topTypes = [...typeCounts.entries()].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count).slice(0, 100);

  return {
    shop_id: ACTIONKING_SHOP_ID,
    total_products: totalProducts,
    channels: Object.fromEntries(
      CHANNELS.map((ch) => [
        ch,
        {
          products: channelCounts[ch],
          share_pct: totalProducts ? Math.round((channelCounts[ch] / totalProducts) * 1000) / 10 : 0,
          revenue_sek: Math.round(channelRevenue[ch]),
          revenue_share_pct: totalRevenue ? Math.round((channelRevenue[ch] / totalRevenue) * 1000) / 10 : 0,
        },
      ]),
    ),
    revenue: {
      total_sek: Math.round(totalRevenue),
      source: "shopify-order-profitability (line items, 730 dagar)",
      note: "Omsättning klassificerad per orderrad-titel (ej shopify_product_id-koppling i aggregate-läge).",
    },
    top_vendors: topVendors,
    top_product_types: topTypes,
    misplaced_products: misplaced.slice(0, 300),
    misplaced_total: misplaced.length,
    generated_at: new Date().toISOString(),
    source: "aggregate_fallback (deploy catalog_field_audit mode=channel_classification för per-produkt)",
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
  lines.push(`**Analysmotor:** ${data.source || "catalog_field_audit / shopify-cloner-worker"}`);
  lines.push(`**Totalt antal produkter:** ${data.total_products.toLocaleString("sv-SE")}`);
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
    lines.push(`- **Total historisk omsättning (order_line_items):** ${fmtSek(data.revenue.total_sek)}`);
    lines.push(`- **Källa:** ${data.revenue.source}`);
    lines.push(`- ${data.revenue.note}`);
  } else {
    lines.push("Ingen tillförlitlig omsättningsdata kopplad till produkt-ID i `order_line_items` för denna shop.");
    lines.push("Klassificeringen baseras på produktmetadata (vendor, product_type, titel, taggar).");
  }
  lines.push("");
  lines.push("## Topp 100 vendors");
  lines.push("");
  lines.push("| # | Vendor | Antal produkter |");
  lines.push("|---|--------|----------------:|");
  data.top_vendors.forEach((v, i) => {
    lines.push(`| ${i + 1} | ${v.value ?? "(null)"} | ${v.count.toLocaleString("sv-SE")} |`);
  });
  lines.push("");
  lines.push("## Topp 100 product types");
  lines.push("");
  lines.push("| # | Product type | Antal produkter | Primär kanal (regel) |");
  lines.push("|---|--------------|----------------:|----------------------|");
  data.top_product_types.forEach((t, i) => {
    const ch = PRODUCT_TYPE_CHANNEL[t.value ?? ""] || "Shared (fallback)";
    lines.push(`| ${i + 1} | ${t.value ?? "(null)"} | ${t.count.toLocaleString("sv-SE")} | ${ch} |`);
  });
  lines.push("");
  lines.push(`## Felplacerade produkter (${data.misplaced_total} identifierade, visar topp ${data.misplaced_products.length})`);
  lines.push("");
  lines.push("Produkter där tilldelad kanal konfliktar med vendor/product_type/titel-signaler.");
  lines.push("");
  if (!data.misplaced_products.length) {
    lines.push("_Inga tydliga felplaceringar identifierade._");
  } else {
    lines.push("| Titel | Vendor | Product type | Tilldelad | Föreslagen | Konfidens | Omsättning |");
    lines.push("|-------|--------|--------------|-----------|------------|-----------|------------|");
    for (const m of data.misplaced_products.slice(0, 100)) {
      const title = (m.title || "").replace(/\|/g, "\\|").slice(0, 60);
      lines.push(`| ${title} | ${m.vendor ?? ""} | ${m.product_type ?? ""} | ${m.assigned} | ${m.suggested} | ${m.confidence} | ${m.revenue_sek ? fmtSek(m.revenue_sek) : "—"} |`);
    }
    if (data.misplaced_total > 100) {
      lines.push("");
      lines.push(`_… och ${data.misplaced_total - 100} ytterligare produkter._`);
    }
  }
  lines.push("");
  lines.push("## Klassificeringsregler (sammanfattning)");
  lines.push("");
  lines.push("1. `product_type=Arkiv` eller `status=archived` → **Archive**");
  lines.push("2. Off-catalog vendors (EcoFlow, Targus, Sony, …) → **Archive**");
  lines.push("3. Drönar-relaterade product_types (Drönare, Reservdelar, Propellrar, …) → **EuroDroneParts**");
  lines.push("4. Actionkamera product_types → **EUActionCam**");
  lines.push("5. Korskanal-tillbehör (Batterier, Väskor, Kablar, DJI & GoPro Accessories) → **Shared**");
  lines.push("6. Keyword-fallback på titel/taggar (DJI, GoPro, Mavic, …) vid oklar product_type");
  lines.push("");
  lines.push("## Observationer");
  lines.push("");
  const edp = data.channels.EuroDroneParts?.products ?? 0;
  const eac = data.channels.EUActionCam?.products ?? 0;
  const shared = data.channels.Shared?.products ?? 0;
  const arch = data.channels.Archive?.products ?? 0;
  lines.push(`- **EuroDroneParts** dominerar med ${edp.toLocaleString("sv-SE")} produkter (${data.channels.EuroDroneParts?.share_pct}%) — driven av \`Enterprise Drönare\` och DJI-sortiment.`);
  lines.push(`- **EUActionCam** har ${eac.toLocaleString("sv-SE")} produkter — actionkameror och direkt tillbehör.`);
  lines.push(`- **Shared** (${shared.toLocaleString("sv-SE")} st) bör granskas vid kanaluppdelning — många DJI/GoPro-tillbehör ligger här medvetet.`);
  lines.push(`- **Archive** (${arch.toLocaleString("sv-SE")} st) inkluderar Arkiv-typ, off-catalog vendors och El-Scooter.`);
  lines.push(`- **${data.misplaced_total}** produkter flaggades med kanalkonflikt — de flesta är Shared-typer med stark drone/cam-signal i titel.`);
  lines.push("");
  return lines.join("\n");
}

async function main() {
  let data;
  if (VIA_EDGE) {
    try {
      console.log("Fetching via edge function…");
      data = await fetchViaEdge();
      data.source = data.action ? "shopify-cloner-worker → catalog_field_audit" : "catalog_field_audit";
    } catch (e) {
      console.warn("Edge:", e.message);
      if (SERVICE) {
        console.log("Falling back to local service role…");
        data = await fetchLocal();
      } else {
        data = await fetchAggregateFallback();
      }
    }
  } else {
    data = await fetchLocal();
  }

  const md = renderMarkdown(data);
  writeFileSync(OUT, md, "utf8");
  console.log(`Wrote ${OUT}`);
  console.log(`Products: ${data.total_products}, misplaced: ${data.misplaced_total}`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
