# Mall för landningssidor

`theme/templates/page.landningssida.json` är en återanvändbar sidmall för nya
kampanj- och landningssidor. Den väljs som "Template" (`landningssida`) på en
`page` i Shopify admin och innehåller redan en sektionsstruktur som är byggd
för SEO och tydlig CTA — kopiera filen till en ny `page.<handle>.json` (eller
duplicera sidan i admin) och skriv om innehållet i blocken.

## Sektioner i mallen

| Sektion | Typ | Syfte |
|---|---|---|
| `hero` | `image-banner` | En H1, en kort undertext och två CTA-knappar (primär + sekundär) ovanför vikningen. |
| `trust_bar` | `enterprise-trust-bar` | Fyra korta förtroendepunkter (leverans, support, betalning etc.). |
| `benefits` | `multicolumn` | Tre fördelar/argument med egen H2. |
| `faq` | `collapsible-content` | Vanliga frågor som H2 + ihopfällbara rader — bra för long-tail-sökningar och invändningar innan köp. |
| `cta` | `enterprise-contact` | Avslutande, tydlig CTA med två knappar (kontakt/offert + telefon eller köp). |

## SEO-checklista innan sidan publiceras

1. **Sidtitel och metabeskrivning** sätts i admin under sidans "Search engine
   listing" (`page.metafields` styr inte detta) — skriv en unik titel och
   beskrivning per landningssida, inte samma som andra sidor.
2. **En enda H1** — det är `hero`-sektionens `heading`-block. Ändra inte
   heading-storleken på övriga sektioner till `h1`.
3. **Alt-text på bilden** i hero-sektionen sätts på bildfilen i Shopifys
   filbibliotek (Media), inte i temat.
4. **Beskrivande URL/handle** — undvik generiska handles som `page-1`.
5. **FAQ-schema**: fyll även i sidans metafält `seo.faq_json`
   (samma fråga/svar som i `faq`-sektionen) om du vill att frågorna ska synas
   som FAQ-rich snippet i Google — `edp-seo-faq.liquid` läser det fältet
   automatiskt för alla sidtyper. JSON-LD för breadcrumbs och entity-schema
   läggs redan på av temat (`edp-seo-structured-data.liquid`) och kräver inget
   extra arbete per sida.
6. **Interna länkar** — peka `benefits`- och `cta`-knapparna på riktiga
   collection-/produkt-/kontaktsidor, aldrig `#` eller tomma länkar.

## CTA-checklista

- Samma primära handling (t.ex. "Begär offert" eller "Handla nu") ska
  upprepas i `hero` och i den avslutande `cta`-sektionen — inte olika budskap
  på samma sida.
- Sekundärknappen är alltid ett lägre-tröskel-alternativ (bläddra sortiment,
  ring, läs mer) — aldrig en andra lika stark CTA som konkurrerar med den
  primära.
- `enterprise-contact`-sektionens telefonlänk ska vara ett riktigt
  `tel:`-nummer, inte en platshållare.
