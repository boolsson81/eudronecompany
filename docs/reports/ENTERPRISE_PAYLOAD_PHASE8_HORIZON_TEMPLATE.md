# Fas 8 – Horizon-produktmall & säker driftsättning i utkastläge

Datum: 2026-09-17
Gren: `claude/quirky-knuth-n12zmd`

Uppföljning på användarens fråga "Allt klart och fungerar?" (svar: nej, temafilerna
låg bara i git-grenen, inte i det publicerade Horizon-temat) och den efterföljande
begäran: "Skapa en ny mall. Med alla gamla uppdateringar och funktioner. Plus de
nya du gjort." Användaren valde alternativet "Produktmall för Horizon" när jag
frågade vilken mall och för vilket tema.

## 1. CREATED

- **`theme/templates/product.horizon-enterprise-payload.json`** — ny Shopify-
  produktmall byggd för det LIVE Horizon-temats faktiska sektionsschema. `main`-
  sektionen är en exakt kopia av Horizons egen `templates/product.json`
  (`product-information` med `_product-media-gallery`, `_product-details`,
  `disclosures`, titel/pris-grupp, variant-picker, köpknappar, beskrivning) —
  det vill säga **alla gamla uppdateringar och funktioner** som redan finns på
  produktsidan idag. Mellan `main` och `related-products` är en ny
  `payload-details`-sektion inklistrad (`edp-payload-details`) — **de nya
  funktionerna**: enterprise-badge, kompatibilitetsstatus, tekniska
  specifikationer, "Lägg till i jämförelse", CTA:er.
- **Ett nytt utkasttema**: `Horizon + Enterprise Payload (draft)`
  (`gid://shopify/OnlineStoreTheme/189611049288`), skapat med `themeDuplicate`
  av det live Horizon-temat. Rollen är `UNPUBLISHED` — det är en fullständig
  kopia av det som redan är live, plus de nya filerna nedan. Ingenting i det
  publicerade temat har rörts.
- De 6 filerna (mallen + dess 5 beroenden: `sections/edp-payload-details.liquid`,
  `snippets/edp-compatibility-status.liquid`, `assets/edp-payload.css`,
  `assets/edp-payload-comparison.js`, `assets/edp-analytics.js`) är laddade till
  utkasttemat via `themeFilesUpsert` och verifierade med en efterföljande
  filläsning.

## 2. MODIFIED

- `theme/sections/edp-payload-details.liquid`: två fel som bara syns när Horizons
  striktare schemavalidering körs (Dawn accepterar dem tyst):
  - Sektionens schema-`name` var 28 tecken ("Enterprise payload-detaljer");
    Horizon kräver max 25. Kortat till "Payload-detaljer" (gäller nu även
    Dawn-mallen, som delar samma sektionsfil).
  - `quote_link`-inställningens schema-`default` ("/pages/contact-quote")
    avvisades av Horizons validator ("default måste vara en sträng eller en
    åtkomstväg till en datakälla"). Tagit bort schema-defaulten — mallen sätter
    ändå värdet explicit, och Liquid-koden har redan en egen
    `| default: '/pages/contact-quote'`-reserv, så beteendet är oförändrat.

## 3. NOT MODIFIED

- **Det publicerade Horizon-temat är helt orört.** Ett första försök att skriva
  direkt till det (`themeFilesUpsert` mot det live temats ID) blockerades av en
  inbyggd säkerhetsspärr i verktygslagret: *"Theme file writes against the live
  storefront are blocked. Duplicate the theme in Shopify admin, edit the draft,
  and a merchant can publish it manually."* Det är exakt vägen som följdes.
- Inga befintliga produkter har fått mallen tilldelad. Att välja
  "Horizon + Enterprise Payload (draft)"-temat som *live* tema, eller att sätta
  en specifik produkts mall till `horizon-enterprise-payload`, är ett separat,
  synligt beslut som en människa behöver ta i Shopify-admin — det ligger
  utanför den här sessionens mandat att göra åt er.

## 4. DATA MODEL — upptäckt om Horizons filarkitektur

Horizon skiljer sig från Dawn på ett sätt som inte framgick av fas 1-granskningen:
kärnsektioner som `product-information`, `_product-media-gallery`,
`_product-details` och `related-products` finns **inte** som lästa/skrivbara
`.liquid`-filer i `theme.files`-API:t (en explicit filfråga mot dem gav tom
träfflista) — de är inbyggda komponenter i själva temamotorn. En JSON-mall får
ändå referera dem med `"type"`, precis som Horizons egen `templates/product.json`
gör. Den enda praktiska konsekvensen: när en NY mall laddas upp i samma
`themeFilesUpsert`-anrop som en NY sektion den refererar till, validerar
Shopify mallen mot temats redan sparade tillstånd — inte mot andra filer i
samma batch. Lösningen var att ladda upp sektionsfilen (`edp-payload-details.liquid`)
i ett separat anrop FÖRE mallfilen.

## 5. TEST RESULTS

- `themeFilesUpsert` mot utkasttemat: alla 6 filer laddades upp med tomma
  `userErrors`-listor, verifierat med en efterföljande `theme.files`-läsning.
- Två verkliga schemafel (namnlängd, url-default) hittades och åtgärdades genom
  Horizons egen serverside-validering — inget gissat.
- **Inte verifierat**: visuell rendering i webbläsare (samma nätverksbegränsning
  som tidigare faser). En människa bör öppna temaförhandsvisningen och kolla en
  payload-produkt innan mallen tilldelas på riktigt.

## 6. ISSUES

1. Utkasttemat är en ÖGONBLICKSKOPIA av det live temat vid tidpunkten för
   `themeDuplicate`. Om någon redigerar det publicerade Horizon-temat efter
   detta (t.ex. via temaredigeraren) synkas INTE de ändringarna automatiskt
   till utkastet — de två temana divergerar från och med nu.
2. Endast payload-produktmallen flyttades över i den här fasen (vilket var vad
   som efterfrågades: "en ny mall"). Payload Finder-, Configurator- och
   jämförelsesidorna (fas 4–6) finns fortfarande bara som Dawn-orienterade
   sid-mallar i git-grenen — de är INTE laddade till utkasttemat och alltså
   inte förhandsgranskningsbara ännu.

## 7. NEXT STEP

1. Förhandsgranska: öppna Shopify-admin → Theme Library → hitta
   "Horizon + Enterprise Payload (draft)" → Preview, eller besök butiken med
   `?preview_theme_id=189611049288` i URL:en.
2. Tilldela mallen "horizon-enterprise-payload" till en enskild
   enterprise-payload-produkt i utkastet för att se den på riktigt (kräver att
   produkten har minst några `edp.*`-metafält ifyllda för att sektionerna ska
   visa mer än "Ej specificerat" överallt).
3. Om det ser bra ut: en människa publicerar utkasttemat, eller kopierar bara
   den nya mallen/sektionen till det befintliga live-temat via
   temaredigeraren/Shopify CLI.
4. Om ni vill ha samma sak för Payload Finder/Configurator/jämförelse-sidorna
   (fas 4–6) på Horizon, säg till — samma mönster (duplicera → ladda upp →
   förhandsgranska) kan upprepas för dem.
