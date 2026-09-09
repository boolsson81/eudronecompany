# Wisson-import

Verktyg för att lägga in Wisson Robotics Orion-sortimentet i Shopify-butiken
och bygga landnings- och systemsidor för det.

Se [`docs/reports/WISSON_IMPORT_2026-09-09.md`](../../docs/reports/WISSON_IMPORT_2026-09-09.md)
för resultatet av första körningen.

| Fil | Vad |
|---|---|
| `copy_sv.py` | Egenförfattad svensk säljtext per modell. |
| `build-payloads.py` | Bygger `ProductCreateInput` av fakta + säljtext → `data/wisson-catalog.json`. |
| `build-pages.mjs` | Genererar temamallar under `theme/templates/` + `data/wisson-pages.json`. |
| `../../data/wisson-images.json` | Bild-URL:er per produkt, med alt-text och verifierad upplösning. |

## Arbetsflöde

1. **Källa.** `https://www.wissonrobotics.com/en/` — sidorna är JavaScript-renderade,
   så hämtningen kräver Nimble Extract med drivern `vx8`. Domänen är blockerad av
   sessionens egress-proxy, så `curl`/`WebFetch` fungerar inte.
2. **Fakta.** Modellnamn, mätvärden och kompatibilitet läggs i
   `data/wisson-source-extract.json` med käll-URL per produkt.
3. **Text.** `copy_sv.py`. Skriv egen brödtext — kopiera inte Wissons.
4. **Payloads.** `python3 scripts/wisson/build-payloads.py`.
5. **Sidor.** `node scripts/wisson/build-pages.mjs`.
6. **Bilder.** Hämta sidan som `simplified_html` — de riktiga bild-URL:erna ligger
   i attributet `data-original`, inte i `src` (sidorna lazy-laddar). Ta bort
   suffixet `!600x600` för originalupplösning. Använd inte sidfotens
   sortimentsrad: de bilderna är 100x70 px.
7. **Publicering.** Produkter och sidor skapas via Shopify Admin API, bilder med
   `productUpdate(media:)` som låter Shopify hämta och lagra en egen kopia.
   Temamallarna måste deployas separat med `node scripts/push-edp-theme.mjs`.

## Viktigt

- Importera alltid med `status: DRAFT` och sidor med `isPublished: false`.
- Sätt inte pris. Sortimentet offereras per uppdrag.
- Tagga med `wisson-import` så att en körning går att spåra och ångra.
- Specifikationer är tillverkarens uppgifter — produkttexten säger det uttryckligen.
