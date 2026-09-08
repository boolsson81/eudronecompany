#!/usr/bin/env node
/**
 * Skriver in Wissons inköpspriser som "Cost per item" (inventoryItem.cost) på
 * respektive variant i Shopify.
 *
 * Underlaget ligger i data/wisson-inkopspriser-202607.json och kommer från
 * leverantörens prislista juli 2026, kolumnen "Suggested Dealer Price (EURO)"
 * omräknad till SEK. Butiken handlar i SEK, så cost sätts i SEK.
 *
 * Usage:
 *   node scripts/apply-wisson-inkopspriser.mjs            # dry run
 *   node scripts/apply-wisson-inkopspriser.mjs --execute  # skriver till Shopify
 */
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { shopifyGraphQL } from "./lib/shopify-admin-client.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA = join(ROOT, "data", "wisson-inkopspriser-202607.json");

const MUTATION = `
  mutation($id: ID!, $input: InventoryItemInput!) {
    inventoryItemUpdate(id: $id, input: $input) {
      inventoryItem { id unitCost { amount currencyCode } }
      userErrors { field message }
    }
  }
`;

function targets(doc) {
  const out = [];
  for (const artikel of doc.artiklar) {
    for (const produkt of artikel.shopify) {
      for (const variant of produkt.varianter) {
        out.push({
          modell: artikel.modell,
          handle: produkt.handle,
          status: produkt.status,
          variantTitel: variant.titel,
          inventoryItemId: variant.inventoryItemId,
          kostnad: artikel.inkopspris_sek,
          eur: artikel.listpris_eur.dealer,
        });
      }
    }
  }
  return out;
}

async function main() {
  const execute = process.argv.includes("--execute");
  const doc = JSON.parse(readFileSync(DATA, "utf8"));
  const rader = targets(doc);

  console.log(`Källa: ${doc.kalla}`);
  console.log(`Kolumn: ${doc.priskolumn}, kurs ${doc.valuta.kurs} SEK/EUR`);
  console.log(`${rader.length} varianter${execute ? "" : " (dry run, inget skrivs)"}\n`);

  let ok = 0;
  for (const rad of rader) {
    const etikett = `${rad.modell} / ${rad.handle} / ${rad.variantTitel} [${rad.status}]`;
    if (!execute) {
      console.log(`DRY  ${etikett}: ${rad.eur} EUR -> ${rad.kostnad} SEK`);
      continue;
    }
    const data = await shopifyGraphQL(MUTATION, {
      id: rad.inventoryItemId,
      input: { cost: String(rad.kostnad) },
    });
    const fel = data?.inventoryItemUpdate?.userErrors ?? [];
    if (fel.length) {
      console.error(`FEL  ${etikett}: ${fel.map((e) => e.message).join("; ")}`);
      continue;
    }
    const satt = data?.inventoryItemUpdate?.inventoryItem?.unitCost;
    console.log(`OK   ${etikett}: ${satt?.amount} ${satt?.currencyCode}`);
    ok++;
  }

  if (execute) console.log(`\n${ok}/${rader.length} varianter uppdaterade.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
