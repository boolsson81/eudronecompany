#!/usr/bin/env node
/**
 * Ensure EuroDroneParts theme pages exist with correct templates and SEO metadata.
 */
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const SHOP = "ya1xhg-x6.myshopify.com";
const BRAND = "Europe Drone Parts";

const PAGES = [
  {
    handle: "enterprise",
    title: "Företag & Enterprise",
    templateSuffix: "enterprise",
    body: "<p>Professionella drönarlösningar för företag och organisationer.</p>",
    seoTitle: `Drönarlösningar för företag | ${BRAND}`,
    seoDescription:
      "Enterprise-drönare, DJI Matrice, Dock och nyttolaster för industri, myndigheter och organisationer. Offert, utbildning och support i Norden.",
  },
  {
    handle: "consumer",
    title: "Konsumentdrönare",
    templateSuffix: "consumer",
    body: "<p>Drönare och tillbehör för privat bruk.</p>",
    seoTitle: `Konsumentdrönare & tillbehör | ${BRAND}`,
    seoDescription:
      "Handla DJI Mini, Air och Mavic för foto, video och fritid. Tillbehör, reservdelar och kom igång-paket med fri frakt över 999 kr.",
  },
  {
    handle: "contact-quote",
    title: "Begär offert",
    templateSuffix: "contact-quote",
    body: "<p>Kontakta vårt enterprise-team för offert och rådgivning.</p>",
    seoTitle: `Begär offert — Enterprise-drönare | ${BRAND}`,
    seoDescription:
      "Få skräddarsydd offert på enterprise-drönare, paket och tillbehör. Vi hjälper företag och organisationer i hela Norden.",
  },
  {
    handle: "jordbruk",
    title: "Drönare för jordbruk",
    templateSuffix: "jordbruk",
    body: "<p>Precisionssprutning, fältkartläggning och växtanalys med UAV.</p>",
    seoTitle: `Drönare för jordbruk | ${BRAND}`,
    seoDescription:
      "Drönarlösningar för jordbruk: precisionsspruta, NDVI-kartläggning, växtanalys och variabel giva. Minska kemikalier och öka skördar.",
  },
  {
    handle: "energi-infrastruktur",
    title: "Drönare för energi & infrastruktur",
    templateSuffix: "energi-infrastruktur",
    body: "<p>Inspektion av kraftledningar, vindkraft och anläggningar.</p>",
    seoTitle: `Drönare för energi & infrastruktur | ${BRAND}`,
    seoDescription:
      "UAV-inspektion av kraftledningar, vindkraftverk och infrastruktur. Termisk kamera, zoom och säkra arbetsflöden för energisektorn.",
  },
  {
    handle: "gis-kartlaggning",
    title: "Drönare för kartläggning & GIS",
    templateSuffix: "gis-kartlaggning",
    body: "<p>Geodata, mätning och GIS-arbetsflöden med UAV.</p>",
    seoTitle: `Drönare för kartläggning & GIS | ${BRAND}`,
    seoDescription:
      "LiDAR, fotogrammetri och GIS med professionella drönare. Högprecision för mätning, modellering och geodata.",
  },
  {
    handle: "raddningstjanst",
    title: "Drönare för räddningstjänst",
    templateSuffix: "raddningstjanst",
    body: "<p>Sök- och räddningsinsatser samt krisledning med UAV.</p>",
    seoTitle: `Drönare för räddningstjänst | ${BRAND}`,
    seoDescription:
      "Termiska sensorer, spotlight och högtalare för sök- och räddningsinsatser. Enterprise-drönare för räddningstjänst och krisledning.",
  },
  {
    handle: "skogsbruk",
    title: "Drönare för skogsbruk",
    templateSuffix: "skogsbruk",
    body: "<p>Inventering och skogsvård med UAV och LiDAR.</p>",
    seoTitle: `Drönare för skogsbruk | ${BRAND}`,
    seoDescription:
      "Skogsinventering, volymberäkning och analys med LiDAR och multispektrala sensorer. Effektiv skogsvård med UAV.",
  },
  {
    handle: "bygg-anlaggning",
    title: "Drönare för bygg & anläggning",
    templateSuffix: "bygg-anlaggning",
    body: "<p>Övervakning av byggarbetsplatser och dokumentation.</p>",
    seoTitle: `Drönare för bygg & anläggning | ${BRAND}`,
    seoDescription:
      "Dokumentera byggprojekt, övervaka framdrift och skapa 3D-modeller med enterprise-drönare för bygg och anläggning.",
  },
  {
    handle: "mission-vision",
    title: "Mission & vision",
    templateSuffix: "mission-vision",
    body: "<p>Vår mission och vision som Nordens DJI-specialist.</p>",
  },
];

function loadEnv() {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const p = join(root, ".env");
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

async function gql(query, variables = {}) {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const r = await fetch(`${url}/functions/v1/test-integration`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, apikey: key },
    body: JSON.stringify({
      integration_type: "shopify",
      config: { store_domain: SHOP, access_token: "***configured***" },
      shopify_graphql: { query, variables },
    }),
  });
  const json = await r.json();
  if (!json.success) throw new Error(JSON.stringify(json.errors || json));
  return json.data;
}

function buildSeoMetafields(page) {
  return [
    {
      namespace: "global",
      key: "title_tag",
      value: page.seoTitle,
      type: "single_line_text_field",
    },
    {
      namespace: "global",
      key: "description_tag",
      value: page.seoDescription,
      type: "single_line_text_field",
    },
  ];
}

function seoFromMetafields(metafields) {
  const nodes = metafields?.nodes || [];
  const title = nodes.find((m) => m.namespace === "global" && m.key === "title_tag")?.value || "";
  const description = nodes.find((m) => m.namespace === "global" && m.key === "description_tag")?.value || "";
  return { title, description };
}

function pageNeedsUpdate(node, page) {
  if (!node) return false;
  if (node.templateSuffix !== page.templateSuffix) return true;
  const seo = seoFromMetafields(node.metafields);
  return seo.title !== page.seoTitle || seo.description !== page.seoDescription;
}

async function ensurePage(page) {
  const existing = await gql(
    `{ pages(first: 1, query: "handle:${page.handle}") {
      nodes {
        id
        handle
        title
        templateSuffix
        metafields(first: 10, namespace: "global") {
          nodes { namespace key value }
        }
      }
    } }`,
  );
  const node = existing.pages.nodes[0];

  const pageInput = {
    title: page.title,
    templateSuffix: page.templateSuffix,
    isPublished: true,
    metafields: buildSeoMetafields(page),
  };

  if (node) {
    if (!pageNeedsUpdate(node, page)) {
      console.log(`✅ /pages/${page.handle} — template + SEO OK`);
      return;
    }
    const data = await gql(
      `mutation($id: ID!, $page: PageUpdateInput!) {
        pageUpdate(id: $id, page: $page) {
          page { handle title templateSuffix }
          userErrors { message field }
        }
      }`,
      { id: node.id, page: pageInput },
    );
    const errs = data.pageUpdate?.userErrors || [];
    if (errs.length) {
      console.error(`❌ update ${page.handle}:`, errs);
    } else {
      console.log(`✅ Updated /pages/${page.handle} → template "${page.templateSuffix}" + SEO`);
    }
    return;
  }

  const data = await gql(
    `mutation($page: PageCreateInput!) {
      pageCreate(page: $page) {
        page { handle title templateSuffix }
        userErrors { message field }
      }
    }`,
    {
      page: {
        handle: page.handle,
        title: page.title,
        body: page.body,
        templateSuffix: page.templateSuffix,
        isPublished: true,
        metafields: buildSeoMetafields(page),
      },
    },
  );
  const errs = data.pageCreate?.userErrors || [];
  if (errs.length) {
    console.error(`❌ ${page.handle}:`, errs);
  } else {
    console.log(`✅ Created /pages/${page.handle} (template: ${page.templateSuffix}) + SEO`);
  }
}

async function main() {
  loadEnv();
  console.log("# Setup EDP theme pages + SEO\n");
  for (const page of PAGES) {
    await ensurePage(page);
  }
  console.log("\nℹ️  Homepage SEO: set under Shopify Admin → Online Store → Preferences");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
