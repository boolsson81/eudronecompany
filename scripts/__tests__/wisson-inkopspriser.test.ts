import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// @ts-expect-error — .mjs-skript utan typdeklarationer
import { landatInkopspris } from "../apply-wisson-inkopspriser.mjs";

/**
 * Inköpspriserna skrivs till Shopify som Cost per item och styr bruttomarginalen
 * i all rapportering. Testet vaktar två saker som är lätta att råka ändra:
 * tullen ska räknas på varuvärde plus frakt (tullvärdet vid FOB-inköp), och
 * varuvärdena i datafilen ska följa dealerkolumnen gånger kursen.
 */

const DATA = join(__dirname, "..", "..", "data", "wisson-inkopspriser-202607.json");
const doc = JSON.parse(readFileSync(DATA, "utf8"));

describe("landat inköpspris", () => {
  it("räknar tull på varuvärde plus frakt", () => {
    expect(landatInkopspris(80449, 6000, 0.017)).toEqual({ tull: 1470, total: 87919 });
  });

  it("ger enbart varuvärdet när frakt och tull är noll", () => {
    expect(landatInkopspris(16898, 0, 0)).toEqual({ tull: 0, total: 16898 });
  });
});

describe("datafilen", () => {
  it("har varuvärden som matchar dealerpriset gånger kursen", () => {
    for (const artikel of doc.artiklar) {
      const vantat = Math.round(artikel.listpris_eur.dealer * doc.valuta.kurs);
      expect(artikel.varuvarde_sek, artikel.modell).toBe(vantat);
    }
  });

  it("har frakt angiven som tal eller null, aldrig noll av misstag", () => {
    for (const artikel of doc.artiklar) {
      if (artikel.frakt_sek === null) continue;
      expect(artikel.frakt_sek, artikel.modell).toBeGreaterThan(0);
    }
  });

  it("pekar varje variant på ett inventory item", () => {
    for (const artikel of doc.artiklar) {
      for (const produkt of artikel.shopify) {
        for (const variant of produkt.varianter) {
          expect(variant.inventoryItemId, `${artikel.modell} ${variant.titel}`).toMatch(
            /^gid:\/\/shopify\/InventoryItem\/\d+$/,
          );
        }
      }
    }
  });
});
