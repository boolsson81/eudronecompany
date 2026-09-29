# CZI — produktsidor (serie-/sortimentssidor)

**Datum:** 2026-09-29
**Källor:** butikens `vendor:CZI`-produkter, `data/inkopsprospekt.json` och
`docs/reports/CZI_Q3_2026_PRISLISTA_AUDIT.md`
**Generator:** `node scripts/czi/build-pages.mjs`

## Vad som skapades

Sex sidor, en per produktfamilj, byggda enligt Wisson-mönstret
(`enterprise-industry-landing` + `enterprise-contact` + `edp-metafield-faq`).
Varumärkesnavet `page.czi.json` är kvar och har fått en sektion "Sortiment" som
länkar till dem. Inga priser visas på sidorna — listpris är inte säljpris.

| Handle | Temamall | Innehåll |
|---|---|---|
| `czi-sokljus` | `page.czi-sokljus.json` | GL10 V2, GL60 Mini/Plus, GL300, SL60, IR3, IR10 |
| `czi-sokljus-hogtalare` | `page.czi-sokljus-hogtalare.json` | LP12, LP20, LP35, MP130 V2/Pro, MP140, MP120, PK10 |
| `czi-matrix-tether` | `page.czi-matrix-tether.json` | ML200 (400/800/1500 W), TK3/TK4, CZ10, CZ100/CZ100V |
| `czi-lastslapp` | `page.czi-lastslapp.json` | TH4 V2, Throwing Hook M4, TH6, FS32, FS35 |
| `czi-kameror` | `page.czi-kameror.json` | DT1K, C30N |
| `czi-specialnyttolaster` | `page.czi-specialnyttolaster.json` | DH100, FT10 V2, ES638 |

Siddata (titel, brödtext, SEO) ligger i `data/czi-pages.json`.

## Status i Shopify (butiken Europe Drone Company)

- Mallarna är uppladdade till temat **EDC Förhandsgranskning (Claude)**
  (`gid://shopify/OnlineStoreTheme/189631627592`), inklusive den uppdaterade `page.czi.json`.
- De sex sidorna är skapade som **opublicerade** med respektive `templateSuffix`.
- Navsidan `czi` fanns sedan tidigare, också opublicerad.
- Uppladdningen gjordes via Shopify MCP (`themeFilesUpsert`), inte via
  `scripts/push-edp-theme.mjs` som pekar på en annan butik (`ya1xhg-x6`).

## Så uppdaterar du sidorna

1. Ändra innehållet i `scripts/czi/build-pages.mjs`.
2. Kör `node scripts/czi/build-pages.mjs` — det skriver om mallarna och `data/czi-pages.json`.
3. Ladda upp de ändrade `theme/templates/page.czi*.json` till förhandsgranskningstemat.
4. Sidtitel och brödtext i Shopify ändras separat (sidan, inte mallen).

Mallarna innehåller själva sidtexten, så steg 3 räcker för det som visas på sidan.

## Kräver manuell kontroll

1. **Ingen visuell förhandsgranskning gjord.** Kontrollera alla sju sidorna i temat,
   särskilt "Sortiment"-korten på `/pages/czi`.
2. **Texterna är inte verifierade mot CZI:s datablad.** De bygger på butikens
   produktbeskrivningar och prislistan. Kontrollera särskilt CZ100/CZ100V, GL300 och C30N.
3. **`czi-specialnyttolaster`** innehåller eldkastare (FT10 V2) och en
   ammunitionsutlösare (ES638), som kan omfattas av tillstånds- och exportregler.
   Avgör om sidan ska publiceras eller om de modellerna ska tas bort.
4. **C30N** ligger i Shopify på ett misstänkt pris (524 999 kr). Sidan säger därför
   bara "pris och tillgänglighet bekräftas på förfrågan".
5. **FAQ-sektionen är tom** tills sidorna får FAQ-metafält.
6. **Publicering:** sidorna och navsidan `czi` är opublicerade. Länkarna från hubben
   syns först när båda är publicerade.
7. Produkter med **pris 0 kr** (ES638, FS32, FS35, TH6, DH100) är DRAFT och kan inte
   säljas förrän priser satts. Flera produkter saknar bild (bland annat GL300 och
   Throwing Hook M4).
