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

## Arbetsflöde

1. **Källa.** `https://www.wissonrobotics.com/en/` — sidorna är JavaScript-renderade,
   så hämtningen kräver Nimble Extract med drivern `vx8`. Domänen är blockerad av
   sessionens egress-proxy, så `curl`/`WebFetch` fungerar inte.
2. **Fakta.** Modellnamn, mätvärden och kompatibilitet läggs i
   `data/wisson-source-extract.json` med käll-URL per produkt.
3. **Text.** `copy_sv.py`. Skriv egen brödtext — kopiera inte Wissons.
4. **Payloads.** `python3 scripts/wisson/build-payloads.py`.
5. **Sidor.** `node scripts/wisson/build-pages.mjs`.
6. **Publicering.** Produkter och sidor skapas via Shopify Admin API. Temamallarna
   måste deployas separat med `node scripts/push-edp-theme.mjs`.

## Viktigt

- Importera alltid med `status: DRAFT` och sidor med `isPublished: false`.
- Sätt inte pris. Sortimentet offereras per uppdrag.
- Tagga med `wisson-import` så att en körning går att spåra och ångra.
- Specifikationer är tillverkarens uppgifter — produkttexten säger det uttryckligen.

## Produktfilmer

Verifierade filmer från Wissons och DJI:s YouTube-kanaler ligger i
`src/data/product-videos.json` (titel, kanal, kontrolldatum per ID).

| Fil | Vad |
|---|---|
| `build-pages.mjs` | Lägger sektionen `edp-video` på varje system- och lösningssida utifrån registret. |
| `apply-product-videos.mjs` | Lägger filmerna som extern video (YouTube) på Wisson-produkterna i Shopify, styrt av `wissonProducts` i registret. Dry run utan `--execute`. |

Lägg bara till filmer från tillverkarens egen kanal. Kontrollera ID:t mot
`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<id>&format=json`
innan det skrivs in — svaret visar titel och kanal.
