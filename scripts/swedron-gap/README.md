# Swedron-gapanalys

Verktyg för att jämföra Swedron.se:s sortiment mot vår Shopify-katalog och
importera saknade produkter som utkast.

Se [`docs/reports/SWEDRON_GAP_2026-09-07.md`](../../docs/reports/SWEDRON_GAP_2026-09-07.md)
för resultatet av första körningen.

| Fil | Vad |
|---|---|
| `match-catalog.py` | Tvåspråkig titel-/slugmatchning mot vår katalog. Hanterar svensk-engelska synonymer och Swedrons trunkerade slugs. |
| `parse-product-pages.py` | Plockar titel, varumärke, USP-punkter, specifikationer och bilder ur hämtade produktsidor. |
| `build-shopify-payloads.py` | Bygger `ProductCreateInput` med produkttyp, taggar och bilder. |
| `copy_sv.py` | Egenförfattad svensk säljtext per produkt. |

## Arbetsflöde

1. **Vår katalog.** `bulkOperationRunQuery` mot Shopify Admin API ger hela
   katalogen som JSONL. Resultat-URL:en ligger på `storage.googleapis.com` som
   är nåbar från miljön.
2. **Swedrons sortiment.** `https://swedron.se/sitemap.xml` ger alla
   produkt-URL:er. Formatet är `/produkt/{shopify_id}/{slug}/`.
3. **Matchning.** `match-catalog.py`. Poäng under ~0,75 betyder sannolikt
   saknad — verifiera alltid mot katalogen innan import, tröskeln är trubbig.
4. **Hämtning.** Nimble Extract med drivern `vx8`; sidorna är JavaScript-renderade.
   Nimble Crawl fungerar inte, länkupptäckten hittar inga produktsidor.
5. **Import.** `productCreate` med GraphQL-alias, sju produkter per anrop.
   `bulkOperationRunMutation` är blockerad av connectorns säkerhetspolicy.

## Viktigt

- Importera alltid med `status: DRAFT`.
- Skriv egen text. Kopiera inte Swedrons brödtext — specifikationer är fakta,
  säljtext är det inte.
- Sätt inte pris från konkurrentens sida.
- Tagga med `swedron-gap-import` så att en körning går att spåra och ångra.
