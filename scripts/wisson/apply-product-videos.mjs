#!/usr/bin/env node
/**
 * Lägger tillverkarens produktfilmer som extern video (YouTube) på
 * Wisson-produkterna i Shopify.
 *
 * Vilken film som hör till vilken modell står i src/data/product-videos.json
 * under `wissonProducts`. Produkten slås upp på taggen `model:<modell>` (t.ex.
 * `model:ap3-p3`), så en modell som inte finns i butiken hoppas över.
 *
 * Körningen är idempotent: en film som redan ligger som media på produkten
 * (samma YouTube-ID i originUrl) läggs inte till igen.
 *
 * Usage:
 *   node scripts/wisson/apply-product-videos.mjs            # dry run
 *   node scripts/wisson/apply-product-videos.mjs --execute  # skriver till Shopify
 */
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { shopifyGraphQL } from "../lib/shopify-admin-client.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const REGISTRY = join(ROOT, "src", "data", "product-videos.json");

const PRODUCT_BY_TAG = `
  query ProductByModelTag($q: String!) {
    products(first: 5, query: $q) {
      nodes {
        id
        handle
        title
        status
        media(first: 20) {
          nodes {
            mediaContentType
            ... on ExternalVideo { originUrl }
          }
        }
      }
    }
  }
`;

// productCreateMedia är avvecklad från Admin API 2026-10; productUpdate tar
// samma CreateMediaInput via argumentet media. Klienten i scripts/lib kör
// 2024-10 där produkten pekas ut med input: { id }.
const CREATE_MEDIA = `
  mutation AddVideo($productId: ID!, $media: [CreateMediaInput!]!) {
    productUpdate(input: { id: $productId }, media: $media) {
      product { id media(first: 20) { nodes { mediaContentType } } }
      userErrors { field message }
    }
  }
`;

export function youtubeUrl(id) {
  return `https://www.youtube.com/watch?v=${id}`;
}

/** Filmer som saknas på produkten, i registrets ordning. */
export function missingVideos(product, videos) {
  const present = new Set(
    (product.media?.nodes || [])
      .filter((m) => m.mediaContentType === "EXTERNAL_VIDEO" && m.originUrl)
      // Shopify normaliserar till https://youtu.be/<id>, så matcha båda formerna.
      .map((m) => (m.originUrl.match(/(?:[?&]v=|youtu\.be\/)([A-Za-z0-9_-]{11})/) || [])[1])
      .filter(Boolean)
  );
  return videos.filter((v) => !present.has(v.youtubeId));
}

export function plan(registry) {
  const out = [];
  for (const [model, keys] of Object.entries(registry.wissonProducts)) {
    if (model.startsWith("_")) continue;
    const videos = keys.map((k) => {
      const v = registry.videos[k];
      if (!v) throw new Error(`Okänd videonyckel "${k}" för ${model}`);
      return { key: k, ...v };
    });
    out.push({ model, tag: `model:${model.toLowerCase()}`, videos });
  }
  return out;
}

async function main() {
  const execute = process.argv.includes("--execute");
  const registry = JSON.parse(readFileSync(REGISTRY, "utf8"));

  for (const item of plan(registry)) {
    const data = await shopifyGraphQL(PRODUCT_BY_TAG, { q: `tag:${item.tag}` });
    const products = data?.products?.nodes || [];
    if (!products.length) {
      console.log(`${item.model}: ingen produkt med taggen ${item.tag} — hoppar över`);
      continue;
    }
    for (const product of products) {
      const missing = missingVideos(product, item.videos);
      if (!missing.length) {
        console.log(`${item.model}: ${product.handle} har redan alla ${item.videos.length} filmer`);
        continue;
      }
      console.log(
        `${item.model}: ${product.handle} (${product.status}) — ${execute ? "lägger till" : "skulle lägga till"} ${missing
          .map((v) => v.youtubeId)
          .join(", ")}`
      );
      if (!execute) continue;
      const res = await shopifyGraphQL(CREATE_MEDIA, {
        productId: product.id,
        media: missing.map((v) => ({
          originalSource: youtubeUrl(v.youtubeId),
          mediaContentType: "EXTERNAL_VIDEO",
          alt: v.title,
        })),
      });
      const errs = res?.productUpdate?.userErrors || [];
      if (errs.length) throw new Error(`${product.handle}: ${errs.map((e) => e.message).join("; ")}`);
      console.log(`  → ${missing.length} filmer tillagda`);
    }
  }
  if (!execute) console.log("\nDry run. Kör med --execute för att skriva till Shopify.");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((e) => {
    console.error(e.message || e);
    process.exit(1);
  });
}
