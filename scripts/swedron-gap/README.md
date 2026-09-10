# Swedron-gapanalys

Verktyg för att jämföra Swedron.se:s sortiment mot vår Shopify-katalog och
importera saknade produkter som utkast.

Se [`docs/reports/SWEDRON_GAP_2026-09-07.md`](../../docs/reports/SWEDRON_GAP_2026-09-07.md)
för resultatet av första körningen och
[`docs/reports/SWEDRON_GAP_CHASING_HOLLYLAND.md`](../../docs/reports/SWEDRON_GAP_CHASING_HOLLYLAND.md)
för varumärkesimporten av Chasing och Hollyland.

| Fil | Vad |
|---|---|
| `match-catalog.py` | Tvåspråkig titel-/slugmatchning mot vår katalog. Hanterar svensk-engelska synonymer och Swedrons trunkerade slugs. |
| `parse-product-pages.py` | Plockar titel, varumärke, USP-punkter, specifikationer och bilder ur hämtade produktsidor. |
| `build-shopify-payloads.py` | Bygger `ProductCreateInput` med produkttyp, taggar och bilder. |
| `copy_sv.py` | Egenförfattad svensk säljtext, omgång 1. |
| `build-shopify-payloads-round2.py` | Som ovan, med produkttyper för paket, filter och värmekameror. |
| `copy_sv2.py` | Egenförfattad svensk säljtext, omgång 2. |
| `build-shopify-payloads-ecoflow.py` | Payloads för varumärkesimport, med produkttyper för kraft och solel. |
| `copy_ecoflow.py` | Egenförfattad svensk säljtext, EcoFlow. |
| `parse-product-pages-v2.py` | Parser för sidor med en enda H1, där innehållet skiljs av en flikrad i stället för av två rubriker. |
| `classify-chhl.py` | Varumärkesgrindad klassificering för Chasing och Hollyland. Reglerna är separata per varumärke, aldrig en gemensam lista. |
| `copy-chhl.py` | Egenförfattad svensk säljtext, Chasing och Hollyland. |
| `build-shopify-payloads-chhl.py` | Payloads för Chasing och Hollyland, med serietaggar som `Solidcom C1` och `M2 Pro Max`. |

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
5. **Import.** `productCreate` med GraphQL-alias, upp till tjugo produkter
   per anrop. `bulkOperationRunMutation` är blockerad av connectorns
   säkerhetspolicy.

Swedron har två sidlayouter. Den äldre har två H1 och hanteras av
`parse-product-pages.py`. Den nyare har en enda H1 och innehållet avgränsas av
en flikrad — den kräver `parse-product-pages-v2.py`. Kör den gamla parsern mot
den nya layouten och du får noll specifikationer och noll USP:er utan
felmeddelande, så kontrollera alltid räknarna i parserns utskrift.

Kör alltid steg 3 igen på de faktiska produkttitlarna efter hämtning. Slugen
är trunkerad och ger sämre matchning än titeln — flera produkter som såg
saknade ut visade sig finnas när titeln jämfördes.

## Viktigt

- Importera alltid med `status: DRAFT`.
- Skriv egen text. Kopiera inte Swedrons brödtext — specifikationer är fakta,
  säljtext är det inte.
- Sätt inte pris från konkurrentens sida.
- Tagga med `swedron-gap-import` så att en körning går att spåra och ångra.
- Vid varumärkesimport: gå igenom sortimentet först. Varumärken som EcoFlow
  har stora delar som inte hör hemma i en drönarbutik, och rena färgvarianter
  bör bli varianter på en produkt i stället för egna produkter.
- Räkna inte importen med `productsCount` direkt efteråt. Shopifys sökindex
  släpar och ger för låga siffror; lista produkterna i stället. Av samma skäl
  hittar `products(query: "title:...")` inte nyimporterade produkter — sortera
  på `CREATED_AT` och matcha titeln lokalt.
- Vid import av flera varumärken i samma körning: håll klassificeringsreglerna
  åtskilda per varumärke. Nyckelord som `Battery` och `Cable` finns hos alla
  och en gemensam ordnad regellista ger fel varumärke i säljtexten.
- Plocka bara bilder vars alt-text är produkttiteln. Karusellen "Andra tittade
  även på" ligger i samma block som galleriet och ger annars grannproduktens
  foto, ibland som huvudbild. Att begränsa sökningen till ett stycke av sidan
  räcker inte.
- Kontrollera bilderna genom alt-texten, inte genom att jämföra URL:er mellan
  produkter. Källan återanvänder samma foto på flera produkter helt legitimt,
  så URL-jämförelsen ger både falska träffar och missar.
- Rensa bort källans egna kategorifält ur specifikationstabellen. De ser ut som
  specifikationer men innehåller sådant som "Tillbehörstyp (Drönare): Delar",
  och i värsta fall konkurrentens interna artikelkod.
- Ett tomt `userErrors` betyder inte att bilderna gick fram. Media behandlas
  asynkront; kontrollera `status` på `MediaImage` efteråt.
- Jämför de faktiskt skickade payloaderna mot den slutliga genereringen efter
  körningen. Rättningar mitt i en import gör att tidigare batchar hamnar efter,
  och skillnaden syns bara i en sådan diff.
