#!/usr/bin/env node
/**
 * Remove image backgrounds with AI and optionally upload transparent PNG to Shopify Files.
 *
 * Usage:
 *   node scripts/remove-shopify-image-background.mjs --url=https://cdn.shopify.com/... --filename=edp-home-user-type-consumer.png
 *   node scripts/remove-shopify-image-background.mjs --theme-cards --execute
 *   node scripts/remove-shopify-image-background.mjs --theme-cards --execute --update-index
 */
import { readFileSync, existsSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SHOP = "ya1xhg-x6.myshopify.com";
const THEME_GID = "gid://shopify/OnlineStoreTheme/186020200776";
const INDEX_PATH = join(ROOT, "theme/templates/index.json");

const THEME_CARDS = [
  {
    key: "consumer",
    query: "edp-home-user-type-consumer",
    filename: "edp-home-user-type-consumer.png",
    alt: "Konsumentdrönare — EuroDroneParts",
    indexBlock: "consumer_card",
  },
  {
    key: "enterprise",
    query: "edp-home-user-type-enterprise",
    filename: "edp-home-user-type-enterprise.png",
    alt: "Enterprise & Företag — EuroDroneParts",
    indexBlock: "enterprise_card",
  },
];

const EXECUTE = process.argv.includes("--execute");
const UPDATE_INDEX = process.argv.includes("--update-index");
const urlArg = process.argv.find((a) => a.startsWith("--url="))?.split("=")[1];
const filenameArg = process.argv.find((a) => a.startsWith("--filename="))?.split("=")[1];
const altArg = process.argv.find((a) => a.startsWith("--alt="))?.split("=")[1];
const THEME_CARDS_MODE = process.argv.includes("--theme-cards");

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

async function shopifyGql(query, variables = {}) {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const r = await fetch(`${url}/functions/v1/test-integration`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      apikey: key,
    },
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

async function invokeBackgroundMaker(imageBase64, uploadToShopify) {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const r = await fetch(`${url}/functions/v1/image-background-maker`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      apikey: key,
    },
    body: JSON.stringify({
      imageBase64,
      mode: "remove",
      uploadToShopify,
    }),
  });
  const json = await r.json();
  if (!r.ok || json.error) throw new Error(json.error || JSON.stringify(json));
  return json;
}

async function urlToBase64(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Fetch failed ${r.status} for ${url}`);
  const buf = Buffer.from(await r.arrayBuffer());
  const mime = r.headers.get("content-type") || "image/png";
  return `data:${mime};base64,${buf.toString("base64")}`;
}

async function findShopifyFileUrl(query) {
  const data = await shopifyGql(`query {
    files(first: 3, query: "${query}") {
      nodes { alt ... on MediaImage { image { url } } }
    }
  }`);
  const node = data.files.nodes[0];
  if (!node?.image?.url) throw new Error(`No Shopify file found for query: ${query}`);
  return node.image.url;
}

async function processOne({ sourceUrl, filename, alt }) {
  console.log(`\n→ ${filename}`);
  console.log(`  Source: ${sourceUrl}`);

  if (!EXECUTE) {
    console.log("  DRY-RUN — would remove background and upload to Shopify Files");
    return { filename, shopImageRef: `shopify://shop_images/${filename}` };
  }

  const imageBase64 = await urlToBase64(sourceUrl);
  const result = await invokeBackgroundMaker(imageBase64, { filename, alt });
  console.log(`  ✓ Uploaded: ${result.shopifyFile?.url || result.imageUrl}`);
  return result.shopifyFile || { filename, shopImageRef: `shopify://shop_images/${filename}` };
}

function updateLocalIndex(refsByBlock) {
  const index = JSON.parse(readFileSync(INDEX_PATH, "utf8"));
  for (const [blockKey, shopImageRef] of Object.entries(refsByBlock)) {
    if (!index.sections?.user_type_selector?.blocks?.[blockKey]?.settings) continue;
    index.sections.user_type_selector.blocks[blockKey].settings.image = shopImageRef;
    index.sections.user_type_selector.blocks[blockKey].settings.image_has_transparency = true;
  }
  writeFileSync(INDEX_PATH, `${JSON.stringify(index, null, 2)}\n`);
  console.log(`\nUpdated ${INDEX_PATH}`);
}

async function main() {
  loadEnv();
  console.log("# Remove Shopify image backgrounds\n");
  console.log(`Mode: ${EXECUTE ? "EXECUTE" : "DRY-RUN"}`);

  const refsByBlock = {};

  if (THEME_CARDS_MODE) {
    for (const card of THEME_CARDS) {
      const sourceUrl = await findShopifyFileUrl(card.query);
      const uploaded = await processOne({
        sourceUrl,
        filename: card.filename,
        alt: card.alt,
      });
      refsByBlock[card.indexBlock] = uploaded.shopImageRef || `shopify://shop_images/${card.filename}`;
    }
  } else if (urlArg && filenameArg) {
    await processOne({ sourceUrl: urlArg, filename: filenameArg, alt: altArg });
  } else {
    console.log(`
Usage:
  node scripts/remove-shopify-image-background.mjs --url=<image-url> --filename=<name.png> [--alt="..."] [--execute]
  node scripts/remove-shopify-image-background.mjs --theme-cards [--execute] [--update-index]

Examples:
  node scripts/remove-shopify-image-background.mjs --theme-cards --execute --update-index
`);
    return;
  }

  if (UPDATE_INDEX && Object.keys(refsByBlock).length) {
    updateLocalIndex(refsByBlock);
    console.log("Run: node scripts/push-edp-theme.mjs --execute");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
