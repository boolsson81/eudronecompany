# Wisson — inköpspriser i SEK

**Datum:** 2026-09-08
**Källa:** Wisson Robotics Price List 202607
**Kolumn:** Suggested Dealer Price (EURO)
**Kurs:** 11,25 SEK/EUR
**Underlag:** [`data/wisson-inkopspriser-202607.json`](../../data/wisson-inkopspriser-202607.json)

Priserna är inlagda som **Cost per item** (`inventoryItem.cost`) på varje variant i
Shopify. Butiken handlar i SEK, så kostnaden är satt i SEK.

## Val av priskolumn

Prislistan har fem prisnivåer per modell: MSRP, Suggested Dealer Price och tre
distributörsnivåer (5–9 st, ≥10 st, sample). Vi köper som återförsäljare och
betalar dealerpriset. MSRP är slutkundspris och distributörsnivåerna kräver
distributörsavtal med volymåtagande.

Listan är byggd i USD och omräknad till EUR med kursen 0,8668 som ligger i cell
H49 i kalkylbladet. Underliggande USD-priser är jämna tal: MSRP 11 000 USD,
dealer 8 250 USD, distributör 6 500 respektive 5 000 USD för AP3-P3 Standard.

## Inlagda priser

| Modell | Dealer EUR | Inköpspris SEK | Varianter |
|---|---:|---:|---:|
| AP3-P3 Standard | 7 151 | 80 449 | 3 |
| AP3-P3 Pro | 8 581 | 96 536 | 3 |
| AP3-P1 Aerial Sprayer | 7 368 | 82 890 | 1 |
| AP30-N1 Aerial Manipulator | 19 594 | 220 433 | 1 |
| AP30-G2 Heavy-load Release | 1 502 | 16 898 | 1 |
| AP-P DIC Water Treatment System | 3 251 | 36 574 | 1 |
| AP3-D1 Contact Inspection (EOL) | 7 366 | 82 868 | 1 |

Totalt 11 varianter över 8 produkter, inklusive arkiverade produkter.

## Utan inköpspris

- **AP30-P4** och **AP30-P4H** finns i butiken men saknas i prislistan juli 2026.
- **AP3-P2** (7 366 €), **AP3-G1** (3 647 €) och **AP30-N2** (8 581 €) finns i
  listan men har ingen produkt i butiken. Priserna ligger i datafilen.
- **Tillbehör och reservdelar** (slangar, munstycken, vinschar, kablar,
  dokumentation) har inga priser i listan.
- **DJI-paketen** med Matrice 350 och 400 är buntar och prissätts separat.

## Att tänka på

Listan är FOB Shenzhen. Frakt, tull och moms ingår inte i inköpspriset, så
bruttomarginalen i Shopify blir för hög i motsvarande grad. Kursen 11,25 är satt
manuellt och behöver ses över när den rör sig.

## Körning

```
node scripts/apply-wisson-inkopspriser.mjs            # dry run
node scripts/apply-wisson-inkopspriser.mjs --execute  # skriver till Shopify
```
