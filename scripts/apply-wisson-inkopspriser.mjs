#!/usr/bin/env node
/**
 * Skriver in Wissons inköpspriser som "Cost per item" (inventoryItem.cost) på
 * respektive variant i Shopify.
 *
 * Underlaget ligger i data/wisson-inkopspriser-202607.json och kommer från
 * leverantörens prislista juli 2026, kolumnen "Suggested Dealer Price (EURO)"
 * omräknad till SEK. Butiken handlar i SEK, så cost sätts i SEK.
 *
 * Inköpspriset är landat: varuvärde + frakt + tull. Tullen räknas på varuvärde
 * plus frakt, eftersom det är tullvärdet vid FOB-inköp. Modeller utan angiven
 * frakt hoppas över — ett halvt inköpspris är värre än inget.
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

/** Landat inköpspris: varuvärde + frakt + tull på varuvärde plus frakt. */
export function landatInkopspris(varuvarde, frakt, tullsats) {
  const tull = Math.round((varuvarde + frakt) * tullsats);
  return { tull, total: varuvarde + frakt + tull };
}

function targets(doc) {
  const out = [];
  const utanFrakt = [];
  for (const artikel of doc.artiklar) {
    if (artikel.frakt_sek == null) {
      if (artikel.shopify.length) utanFrakt.push(artikel.modell);
      continue;
    }
    const { tull, total } = landatInkopspris(
      artikel.varuvarde_sek,
      artikel.frakt_sek,
      doc.palagg.tullsats,
    );
    for (const produkt of artikel.shopify) {
      for (const variant of produkt.varianter) {
        out.push({
          modell: artikel.modell,
          handle: produkt.handle,
          status: produkt.status,
          variantTitel: variant.titel,
          inventoryItemId: variant.inventoryItemId,
          varuvarde: artikel.varuvarde_sek,
          frakt: artikel.frakt_sek,
          tull,
          kostnad: total,
        });
      }
    }
  }
  return { rader: out, utanFrakt };
}

async function main() {
  const execute = process.argv.includes("--execute");
  const doc = JSON.parse(readFileSync(DATA, "utf8"));
  const { rader, utanFrakt } = targets(doc);

  console.log(`Källa: ${doc.kalla}`);
  console.log(`Kolumn: ${doc.priskolumn}, kurs ${doc.valuta.kurs} SEK/EUR`);
  console.log(`Tullsats: ${(doc.palagg.tullsats * 100).toFixed(1)} % på varuvärde plus frakt`);
  console.log(`${rader.length} varianter${execute ? "" : " (dry run, inget skrivs)"}\n`);

  if (utanFrakt.length) {
    console.log(`Hoppar över utan angiven frakt: ${utanFrakt.join(", ")}\n`);
  }

  let ok = 0;
  for (const rad of rader) {
    const etikett = `${rad.modell} / ${rad.handle} / ${rad.variantTitel} [${rad.status}]`;
    const delar = `${rad.varuvarde} + frakt ${rad.frakt} + tull ${rad.tull}`;
    if (!execute) {
      console.log(`DRY  ${etikett}: ${delar} = ${rad.kostnad} SEK`);
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
