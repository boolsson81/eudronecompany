#!/usr/bin/env node
/**
 * Generate EURODRONEPARTS_FINAL_ARCHITECTURE.md — post-cleanup architecture,
 * hierarchies, sitemap, and navigation map.
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "EURODRONEPARTS_FINAL_ARCHITECTURE.md");
const SITEMAP = join(ROOT, "EURODRONEPARTS_SITEMAP.json");
const URL = process.env.CLONER_SUPABASE_URL || "https://wsncjdajweoujhidlxas.supabase.co";
const STORE = "ya1xhg-x6.myshopify.com";
const SHOP_URL = "https://ya1xhg-x6.myshopify.com";

function loadEnv() {
  const p = join(ROOT, ".env");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
}

async function gql(query, variables = {}) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  const r = await fetch(`${URL}/functions/v1/test-integration`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, apikey: key },
    body: JSON.stringify({
      integration_type: "shopify",
      config: { store_domain: STORE, access_token: "***configured***" },
      shopify_graphql: { query, variables },
    }),
  });
  const j = await r.json();
  return j?.data ?? j;
}

function taxonomy(handle, title) {
  const t = `${handle} ${title}`.toLowerCase();
  if (/flycart/.test(handle)) return "FlyCart";
  if (/inspektions|jordbruk|skogsbruk|kartlagg|energi-infrastruktur|transport-logistik|last-och-transport/.test(handle))
    return "Industry Solutions";
  if (/enterprise-sensorer|varmekamera|airdrop/.test(handle) || (/sensor|payload|varmekamera/.test(t) && !/filter/.test(t)))
    return "Sensors & Payloads";
  if (/^enterprise-|^dji-matrice|^dji-agras|marvic-enterprise|mavic-3-enterprise|mavic-3m|mavic-serien-enterprise/.test(t))
    return "Enterprise DJI";
  if (/phantom|inspire|air-2|mini-2|mavic-2|gopro|actionking|sunnylife/.test(t)) return "Legacy DJI";
  if (/reservdel|reparation-|flight-components|gimbal-dronare-motorer/.test(handle)) return "Spare Parts";
  if (/^dji-|^dij-air|^dronare-med-kamera|^tillbehor-dji-/.test(handle)) return "Consumer DJI";
  return "Accessories";
}

const HIERARCHIES = {
  "Enterprise DJI": {
    hub: "enterprise-dronare",
    children: {
      "DJI Matrice": [
        "dji-matrice-serien",
        "dji-matrice-3-serien",
        "dji-matrice-4-serie",
        "dji-matrice-400-serien",
        "dji-matrice-350-rtk-tillbehor",
        "dji-matrice-30-serie-tillbehor",
        "dji-matrice-4-tillbehor",
      ],
      "DJI Mavic Enterprise": ["dji-mavic-3-enterprise", "dji-mavic-serien-enterprise", "dji-mavic-3m-dronare-tillbehor"],
      "DJI Agras": ["dji-agras-dronare"],
      "DJI Marvic": ["dji-marvic-enterprise"],
      "Enterprise Accessories": [
        "enterprise-tillbehor",
        "enterprise-dronartillbehor",
        "enterprise-propellrar",
        "dji-enterprise-fjarrkontroller",
        "enterprise-belysning",
        "enterprise-hogtalarsystem",
        "enterprise-lyftsystem",
      ],
      "Enterprise Service": ["enterprise-service-dronare"],
    },
  },
  FlyCart: {
    hub: "dji-flycart-serien",
    children: {
      "FlyCart 100": ["dji-flycart-100-lastdronare"],
      "FlyCart Series": ["dji-flycart-serien"],
    },
  },
  "Industry Solutions": {
    hub: "inspektionsdronare",
    children: {
      Inspection: ["inspektionsdronare"],
      "Energy & Infrastructure": ["energi-infrastruktur"],
      Agriculture: ["jordbruksdronare"],
      Forestry: ["skogsbruksdronare"],
      "Surveying & Mapping": ["kartlaggnings-och-matdronare"],
      "Transport & Logistics": ["transport-logistik", "last-och-transportdronare"],
    },
  },
  "Sensors & Payloads": {
    hub: "enterprise-sensorer",
    children: {
      "Enterprise Sensors": ["enterprise-sensorer"],
      "Thermal Cameras": ["dronare-med-varmekamera"],
      "Airdrop & Payloads": ["airdrop-system"],
    },
  },
  "Consumer DJI": {
    hub: "dji-dronare",
    children: {
      "DJI Mini": ["dji-mini-4-serien", "dji-mini-5-serien", "dji-mini-3-serien", "dji-mini-3", "dji-mini-3-tillbehor", "dji-mini-4-pro", "dji-mini-4-pro-tillbehor", "dji-mini-tillbehor"],
      "DJI Air": ["dji-air-serien", "dij-air-3-serien", "dji-air-3", "dji-air-3s", "dji-air-3-tillbehor-omfattande-sortiment"],
      "DJI Mavic": ["dji-mavic-serien", "dji-mavic-3-serien", "dji-mavic-3-classic", "dji-mavic-3-pro-avancerad-dronarteknik", "dji-mavic-4-serien", "dji-mavic-4-pro"],
      "DJI Avata": ["dji-avata-serien", "dji-avata-pro-fpv-dronare", "dji-avata-2-tillbehor", "dji-avata-tillbehor"],
      "DJI Neo": ["dji-neo", "dji-neo-tillbehor", "dji-neo-2-tillbehor"],
      "DJI Flip": ["dji-flip-dronare", "dji-flip-tillbehor", "dji-flip-batteri-tillbehor"],
    },
  },
};

loadEnv();

console.log("Fetching live collections...");
const collections = [];
let cursor = null;
for (let p = 0; p < 30; p++) {
  const data = await gql(
    `query($cursor: String) {
      collections(first: 250, after: $cursor) {
        pageInfo { hasNextPage endCursor }
        edges { node { id handle title productsCount { count } seo { title description } } }
      }
    }`,
    { cursor },
  );
  for (const e of data?.collections?.edges || []) {
    const n = e.node;
    collections.push({
      handle: n.handle,
      title: n.title,
      products: n.productsCount?.count ?? 0,
      seoTitle: n.seo?.title,
      taxonomy: taxonomy(n.handle, n.title),
    });
  }
  if (!data?.collections?.pageInfo?.hasNextPage) break;
  cursor = data.collections.pageInfo.endCursor;
}

const byHandle = new Map(collections.map((c) => [c.handle, c]));
const sitemap = {
  generated_at: new Date().toISOString(),
  shop_url: SHOP_URL,
  collection_count: collections.length,
  collections: collections.map((c) => ({
    handle: c.handle,
    url: `${SHOP_URL}/collections/${c.handle}`,
    title: c.title,
    products: c.products,
    taxonomy: c.taxonomy,
  })),
};

writeFileSync(SITEMAP, JSON.stringify(sitemap, null, 2));

const lines = [
  "# EuroDroneParts — Final Collection Architecture",
  "",
  `**Generated:** ${new Date().toISOString()}`,
  `**Store:** ${STORE}`,
  `**Status:** Post-cleanup live architecture`,
  `**Live collections:** ${collections.length}`,
  "",
  "## Executive summary",
  "",
  "Approved cleanup executed:",
  "- MERGE: `dji-mavic-3-classic-1` → `dji-mavic-3-classic` (301 redirect)",
  "- DELETE: 6 orphan collections (301 redirects applied)",
  "- KEPT: 4 SEO landing pages (`dronare-reservdelar-ovriga`, `ji-mini-5-pro-filter`, `minneskort-lagring`, `kamerastativ-tripod`)",
  "- Menu structure applied to `main-menu`, `enterprise-dr-nare`, `footer`",
  "- SEO metadata applied to hierarchy hub collections",
  "- **No products modified** | **Active collection URLs unchanged**",
  "",
  "## Collection taxonomy (live)",
  "",
  "| Taxonomy | Collections |",
  "|---|---:|",
];

const taxCounts = {};
for (const c of collections) taxCounts[c.taxonomy] = (taxCounts[c.taxonomy] || 0) + 1;
for (const [tax, n] of Object.entries(taxCounts).sort((a, b) => b[1] - a[1])) {
  lines.push(`| ${tax} | ${n} |`);
}

for (const [group, cfg] of Object.entries(HIERARCHIES)) {
  lines.push("", `## ${group} hierarchy`, "", `**Hub:** \`${cfg.hub}\` → /collections/${cfg.hub}`, "");
  for (const [sub, handles] of Object.entries(cfg.children)) {
    lines.push(`### ${sub}`, "");
    lines.push("| Handle | Title | Products | URL |");
    lines.push("|---|---|---:|---|");
    for (const h of handles) {
      const c = byHandle.get(h);
      if (!c) {
        lines.push(`| \`${h}\` | _not found_ | — | — |`);
        continue;
      }
      lines.push(`| \`${h}\` | ${c.title} | ${c.products} | /collections/${h} |`);
    }
    lines.push("");
  }
}

lines.push("## Navigation map", "", "### main-menu (Huvudmeny)", "");
lines.push("```");
lines.push("Huvudmeny");
lines.push("├── Drönare → /collections/dji-dronare");
lines.push("│   ├── DJI Mini → /collections/dji-mini-4-serien");
lines.push("│   ├── DJI Air → /collections/dji-air-serien");
lines.push("│   ├── DJI Mavic → /collections/dji-mavic-serien");
lines.push("│   ├── DJI Avata → /collections/dji-avata-serien");
lines.push("│   ├── DJI Neo → /collections/dji-neo");
lines.push("│   └── DJI Flip → /collections/dji-flip-dronare");
lines.push("├── Enterprise Drönare → /collections/enterprise-dronare");
lines.push("│   ├── DJI Matrice → /collections/dji-matrice-serien");
lines.push("│   ├── Mavic Enterprise → /collections/dji-mavic-serien-enterprise");
lines.push("│   ├── DJI Agras → /collections/dji-agras-dronare");
lines.push("│   ├── Sensors & Payloads → /collections/enterprise-sensorer");
lines.push("│   └── Enterprise tillbehör → /collections/enterprise-tillbehor");
lines.push("├── FlyCart → /collections/dji-flycart-serien");
lines.push("├── Branschlösningar → /collections/inspektionsdronare");
lines.push("├── Reservdelar → /collections/dji-dronar-reservdelar");
lines.push("├── Tillbehör → /collections/dronartillbehor-kop");
lines.push("└── Legacy DJI → /collections/dji-phantom-3-se");
lines.push("```", "");

lines.push("### enterprise-dr-nare", "", "| Item | URL |", "|---|---|");
for (const [label, path] of [
  ["Enterprise drönare", "/collections/enterprise-dronare"],
  ["Matrice", "/collections/dji-matrice-serien"],
  ["Mavic Enterprise", "/collections/dji-mavic-3-enterprise"],
  ["Agras", "/collections/dji-agras-dronare"],
  ["FlyCart", "/collections/dji-flycart-serien"],
  ["Värmekamera", "/collections/dronare-med-varmekamera"],
  ["Airdrop", "/collections/airdrop-system"],
]) {
  lines.push(`| ${label} | ${path} |`);
}

lines.push("", "## SEO metadata structure", "", "Each hierarchy hub collection has:", "", "- `seo.title` — max ~60 chars, brand + category + EuroDroneParts", "- `seo.description` — max ~160 chars, keyword-rich summary", "- `descriptionHtml` — H1-equivalent paragraph with `<strong>` focus keyword", "", "Metadata defined in `data/edp-hierarchy-seo.json` and applied via `scripts/apply-collection-seo.mjs`.", "");

lines.push("## 301 redirects (applied)", "", "| From | To | Reason |", "|---|---|---|");
for (const r of [
  ["dji-mavic-3-classic-1", "dji-mavic-3-classic", "MERGE"],
  ["dji-air-3-serien", "dij-air-3-serien", "DELETE orphan"],
  ["dji-avata", "dji-avata-serien", "DELETE orphan"],
  ["dji-mini-3-pro-dronare-set", "dji-mini-3-serien", "DELETE orphan"],
  ["gopro-batterier", "gopro-tillbehor-vendors", "DELETE orphan"],
  ["osmo-action-6-tillbehor", "alla-produkter", "DELETE orphan"],
  ["ringlampa", "belysning-till-dronare", "DELETE orphan"],
]) {
  lines.push(`| /collections/${r[0]} | /collections/${r[1]} | ${r[2]} |`);
}

lines.push("", "## Sitemap", "", `Machine-readable sitemap: \`EURODRONEPARTS_SITEMAP.json\` (${collections.length} collection URLs).`, "", "### Top collections by product count", "", "| Handle | Products | Taxonomy |", "|---|---:|---|");
for (const c of [...collections].sort((a, b) => b.products - a.products).slice(0, 25)) {
  lines.push(`| \`${c.handle}\` | ${c.products} | ${c.taxonomy} |`);
}

writeFileSync(OUT, lines.join("\n"));
console.log(`Wrote ${OUT}`);
console.log(`Wrote ${SITEMAP} (${collections.length} collections)`);
