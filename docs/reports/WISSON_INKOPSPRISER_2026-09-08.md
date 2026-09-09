# Wisson — inköpspriser i SEK

**Datum:** 2026-09-08
**Källa:** Wisson Robotics Price List 202607
**Kolumn:** Suggested Dealer Price (EURO)
**Kurs:** 11,25 SEK/EUR
**Underlag:** [`data/wisson-inkopspriser-202607.json`](../../data/wisson-inkopspriser-202607.json)

Inköpspriset är landat: **varuvärde + frakt + tull**. Det skrivs som
**Cost per item** (`inventoryItem.cost`) på varje variant i Shopify. Butiken
handlar i SEK, så kostnaden är satt i SEK.

## Val av priskolumn

Prislistan har fem prisnivåer per modell: MSRP, Suggested Dealer Price och tre
distributörsnivåer (5–9 st, ≥10 st, sample). Vi köper som återförsäljare och
betalar dealerpriset. MSRP är slutkundspris och distributörsnivåerna kräver
distributörsavtal med volymåtagande.

Listan är byggd i USD och omräknad till EUR med kursen 0,8668 som ligger i cell
H49 i kalkylbladet. Underliggande USD-priser är jämna tal: MSRP 11 000 USD,
dealer 8 250 USD, distributör 6 500 respektive 5 000 USD för AP3-P3 Standard.

## Frakt och tull

Tullen räknas på varuvärde plus frakt fram till EU-gränsen. Det är tullvärdet
vid FOB-inköp, inte varuvärdet ensamt. Satsen 1,7 % gäller position 8424 och är
**inte verifierad mot TARIC** — bekräfta den innan den används i bokföringen.
HS-numret 8424490000 kommer från leverantörens faktura.

Frakten är faktisk kostnad per modell och sätts i `frakt_sek` i datafilen.
Produkternas vikter i Shopify duger inte som fördelningsnyckel: de flesta står på
noll och AP3-P3-systemet står på 1,3 kg, vilket är nyttolasten och inte
fraktvikten med markutrustning och 70 meter slang.

## Varuvärden

| Modell | Dealer EUR | Varuvärde SEK | Frakt | Varianter |
|---|---:|---:|---:|---:|
| AP3-P3 Standard | 7 151 | 80 449 | — | 3 |
| AP3-P3 Pro | 8 581 | 96 536 | — | 3 |
| AP3-P1 Aerial Sprayer | 7 368 | 82 890 | — | 1 |
| AP30-N1 Aerial Manipulator | 19 594 | 220 433 | — | 1 |
| AP30-G2 Heavy-load Release | 1 502 | 16 898 | — | 1 |
| AP-P DIC Water Treatment System | 3 251 | 36 574 | — | 1 |
| AP3-D1 Contact Inspection (EOL) | 7 366 | 82 868 | — | 1 |

Totalt 11 varianter över 8 produkter, inklusive arkiverade produkter. Modeller
utan angiven frakt skrivs inte till Shopify — skriptet hoppar över dem hellre än
att sätta ett halvt inköpspris.

Butiken innehåller just nu varuvärdet utan frakt och tull. Kör om skriptet när
fraktbeloppen är ifyllda, så skrivs det landade priset över.

## Utan inköpspris

- **AP30-P4** och **AP30-P4H** finns i butiken men saknas i prislistan juli 2026.
- **AP3-P2** (7 366 €), **AP3-G1** (3 647 €) och **AP30-N2** (8 581 €) finns i
  listan men har ingen produkt i butiken. Priserna ligger i datafilen.
- **Tillbehör och reservdelar** (slangar, munstycken, vinschar, kablar,
  dokumentation) har inga priser i listan.
- **DJI-paketen** med Matrice 350 och 400 är buntar och prissätts separat.

## Att tänka på

Moms ingår inte och ska inte göra det — den är avdragsgill och hör inte hemma i
inköpspriset. Kursen 11,25 är satt manuellt och behöver ses över när den rör sig.

## Körning

```
node scripts/apply-wisson-inkopspriser.mjs            # dry run
node scripts/apply-wisson-inkopspriser.mjs --execute  # skriver till Shopify
```
