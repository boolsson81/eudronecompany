#!/usr/bin/env node
/**
 * Sätter försäljningspriserna för FlyingBasket-produkterna inkl. 25 % moms.
 *
 * Pris = rek. försäljningspris (EUR, exkl. moms) × 11,25 SEK/EUR × 1,25,
 * avrundat till närmaste 100 kr. Inköpspriset (enhetskostnaden) rörs inte.
 * Kursen är samma som i docs/reports/DRS_PRISFORSLAG_2026-10.md.
 *
 * Kör torrt som standard. Skriver bara med --kor, och bara om butiken heter
 * "Europe Drone Company".
 *
 * Kräver SHOPIFY_ADMIN_TOKEN (eller EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN) och
 * SHOPIFY_STORE_DOMAIN i .env — se scripts/lib/shopify-admin-client.mjs.
 *
 * Usage:
 *   node scripts/update-flyingbasket-priser.mjs          # visar vad som skulle ändras
 *   node scripts/update-flyingbasket-priser.mjs --kor    # skriver priserna
 */
import { shopifyGraphQL } from "./lib/shopify-admin-client.mjs";

const KOR = process.argv.includes("--kor");
const FORVANTAD_BUTIK = "Europe Drone Company";
const KURS = 11.25;
const MOMS = 1.25;

/** handle → rek. försäljningspris i EUR exkl. moms (källa: Drone Baskets mejl 2026-11). */
const RRP_EUR = {
  "flyingbasket-fb3-essential": 44900,
  "flyingbasket-fb3-standard": 64900,
  "flyingbasket-fb3-max": 76900,
  "flyingbasket-fb3-battery-set": 11500,
  "flyingbasket-fb4": 130000,
  "flyingbasket-fb4-battery-set": 23000,
  "flyingbasket-battery-charger": 2900,
};

const prisInklMoms = (eur) => Math.round((eur * KURS * MOMS) / 100) * 100;

const shop = (await shopifyGraphQL(`{ shop { name myshopifyDomain } }`)).shop;
console.log(`Butik: ${shop.name} (${shop.myshopifyDomain})`);
if (shop.name !== FORVANTAD_BUTIK) {
  console.error(`Fel butik — förväntade "${FORVANTAD_BUTIK}". Avbryter utan att skriva.`);
  process.exit(1);
}

let fel = 0;
for (const [handle, eur] of Object.entries(RRP_EUR)) {
  const nytt = prisInklMoms(eur);
  const data = await shopifyGraphQL(
    `query($q: String!) { products(first: 1, query: $q) { nodes { id title variants(first: 1) { nodes { id price } } } } }`,
    { q: `handle:${handle}` },
  );
  const produkt = data.products.nodes[0];
  const variant = produkt?.variants.nodes[0];
  if (!variant) {
    console.error(`✗ ${handle}: hittades inte`);
    fel++;
    continue;
  }
  const nuvarande = Number(variant.price);
  if (nuvarande === nytt) {
    console.log(`= ${handle}: redan ${nytt} SEK`);
    continue;
  }
  console.log(`${KOR ? "→" : "~"} ${handle}: ${nuvarande} → ${nytt} SEK inkl. moms`);
  if (!KOR) continue;
  const res = await shopifyGraphQL(
    `mutation($id: ID!, $v: [ProductVariantsBulkInput!]!) {
       productVariantsBulkUpdate(productId: $id, variants: $v) { userErrors { field message } }
     }`,
    { id: produkt.id, v: [{ id: variant.id, price: nytt.toFixed(2) }] },
  );
  const errs = res.productVariantsBulkUpdate.userErrors;
  if (errs.length) {
    console.error(`✗ ${handle}: ${errs.map((e) => e.message).join("; ")}`);
    fel++;
  }
}

if (!KOR) console.log("\nTorrkörning — inget skrevs. Kör med --kor för att skriva.");
process.exit(fel ? 1 : 0);
