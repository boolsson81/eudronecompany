# Produktpaket / Bundles — analys och teknisk plan

**Status:** Analysfas klar. Fas 0 (API-versionshöjning) genomförd i kod, väntar på deploy
av edge functions. Väntar på beslut/godkännande innan Fas 2.

## 0. Fas 0 — genomfört

- `SHOPIFY_API_VERSION` i `supabase/functions/_shared/shopify-client.ts` höjd från
  `2025-07` till `2026-07` (senaste stabila version).
- Regressionskontroll: samtliga GraphQL-mutationer som redan används i
  `supabase/functions/**` (`articleCreate/Update`, `blogCreate`, `collectionDelete/Update`,
  `deliveryProfileUpdate`, `discountAutomaticBasicCreate`, `discountCodeBasicCreate`,
  `fileCreate`, `inventoryItemUpdate`, `menuCreate/Update/Delete`,
  `metafieldDefinitionCreate`, `metafieldsSet`, `metaobjectCreate/DefinitionCreate`,
  `pageCreate/Update`, `segmentCreate`) verifierade mot det aktuella GraphQL-schemat — alla
  finns kvar oförändrade. Ingen av de kända föråldrade mutationerna
  (`productVariantCreate`/`Update`/`Delete` på variantnivå) används i repot, så ingen
  brytande ändring identifierad.
- De mutationer bundle-arbetet planerar att använda (`productCreate`, `productBundleCreate`,
  `productVariantRelationshipBulkUpdate`, `productVariantsBulkUpdate`) verifierade att de
  finns i samma schema.
- **Kvarstår, kräver ett separat beslut:** flera fristående Node-skript
  (`scripts/audit-edp-storefront-seo.mjs` → `2025-07`, `scripts/run-category-audit.mjs` →
  `2025-10`, `scripts/run-menu-recovery-local.mjs` och
  `scripts/publish-menu-pages-direct.mjs` → `2024-10`) har egna hårdkodade API-versioner,
  oberoende av den delade klienten. De är historiska engångs-/migreringsskript, inte del av
  den löpande edge-function-ytan bundle-arbetet bygger på — lämnade orörda i denna omgång
  för att inte bredda ändringen utanför det som efterfrågades. Flagga om ni vill att de ska
  städas upp separat.
- **Inte gjort (kräver produktionsåtgärd, se nedan):** faktisk deploy av edge functions med
  den nya versionen. Koden är committad men gäller inte live förrän
  `npx supabase functions deploy <namn> --project-ref <ref>` körs mot det delade,
  hostade Supabase-projektet — det gör jag inte utan uttryckligt godkännande eftersom det
  är en produktionsändring mot en miljö som delas med DigitalSignal.
- `npm run typecheck`/`npm test` körs inte för denna ändring — filen ligger under
  `supabase/functions/`, utanför `src/`/`scripts/` som AGENTS.md kräver testkörning för.

## 1. Vad som redan finns

### 1.1 En liknande funktion finns redan — men bara som presentation

`theme/templates/product.paket.json` + `theme/assets/edp-package.js` (dokumenterat i
`docs/reports/PAKET_PRODUCT_TEMPLATE.md`) är en **fristående Shopify-produktmall** kallad
`paket`:

- Paketet är en vanlig Shopify-produkt med eget pris, egna bilder, eget (separat) lager.
- Metafält i namespace `paket` (`etikett`, `sammanfattning`, `innehall` = `list.product_reference`,
  `antal` = `list.number_integer`, `tillval` = `list.product_reference`) styr vad snippetsen
  `edp-package-contents`/`edp-package-addons` renderar: bild, leverantör, namn, radpris,
  lagerstatus per komponent, "Ni sparar X kr", och kryssrutor för valfria tillval.
- `edp-package.js` fångar `<product-form>`-submit och bygger om till Shopifys
  multirad-cart-format (`items[0]…items[n]`) så att paketet + ibockade tillval läggs som
  separata cart-rader i samma anrop.
- Metafälten skapas av `scripts/setup-paket-metafields.mjs`.
- Testas av `scripts/__tests__/paket-product-template.test.ts`.

**Den avgörande begränsningen står redan dokumenterad i rapporten:** paketet har sitt
**egna** Shopify-lager. Det dras **inte** ifrån komponenternas lager. Rapporten säger
uttryckligen att detta kräver "Shopifys Bundles-app" för att lösas — dvs. exakt det som
efterfrågas i uppgiftens §5. Det finns ingen adminyta för att bygga paketet; allt görs
manuellt i Shopify admin (välj produkter i ett metafält-picker-UI, fyll i antal för hand).

Det finns också en **separat, orelaterad** sak med samma namn: `/kommersiella-dronare/paket`
och `/kommersiella-dronare/paket/:packageSlug` (`src/pages/EnterprisePackages.tsx`,
`src/pages/EnterprisePackage.tsx`, data i `src/data/enterprisePackages.ts`) är
redaktionella landningssidor (statisk TS-data) som länkar vidare till den riktiga
Shopify-produkten. De är marknadsföringssidor, inte köpflödet, och påverkas inte av detta
arbete förutom att de kan länka till de nya paketprodukterna.

### 1.2 Shopify Admin API-koppling

- Delad klient: `supabase/functions/_shared/shopify-client.ts` — GraphQL + REST, retry på
  429/THROTTLED/5xx, loggning till `shopify_api_log`. **`SHOPIFY_API_VERSION = "2025-07"`.**
- Kontext hämtas i tre steg: `shopify_app_installations` (OAuth-app) → `integrations`-tabell
  (custom-app-token) → env-variabler (`SHOPIFY_STORE_DOMAIN` /
  `EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN`).
- Butiken: `ya1xhg-x6.myshopify.com` (EU Drone Company / EuroDroneParts).
- Mönster för admin-drivna funktioner: React-sida i `src/pages/admin/*` → `supabase.functions.invoke("<fn>", { body })` → Supabase edge function i `supabase/functions/<fn>/index.ts` → `shopifyGraphQL(ctx, …)`. Se `ShopifyDroneClone.tsx` + `shopify-drone-clone/index.ts` som referensmönster (status/scan/publish-flöde med polling).
- Node-skript mot samma API har en egen light-klient: `scripts/lib/shopify-admin-client.mjs`.

### 1.3 Admin-UI-konventioner att återanvända

- `AdminLayout.tsx` + `App.tsx`: skyddade rutter under `/admin/*`, kräver roll `admin`/`global_admin` (samma databas som DigitalSignal, via `useAuth.tsx`). Ny sida = ny rad i `NAV_GROUPS` + ny `<Route>`.
- `src/components/ui/*`: endast `accordion, badge, button, card, checkbox, dialog, input, label, select, table, tabs, textarea` finns (shadcn, `components.json` finns så fler kan genereras i samma stil). **Ingen** `command`/`popover`/`dropdown-menu` — behövs för produktsökning och läggs till i samma shadcn-stil, inte som ett nytt designsystem.
- Toaster: `sonner`. Formulär: inga react-hook-form-beroenden i dag — enkel `useState`-baserad formhantering är rådande stil (se `ShopifyDroneClone.tsx`).

### 1.4 Ingenting av följande finns i repot idag (grep bekräftat)

`requiresComponents`, `ProductVariantComponent`, `productVariantRelationshipBulkUpdate`,
`productBundleCreate`, `combinedListing` — noll träffar. Ingen egen bundle-datamodell, ingen
kostnads-/marginalberäkning, ingen bundle-analytics, ingen pick/pack-lista, ingen
retur-hantering för paket. Det här bygger vi från grunden, men vi bygger det **på**
Shopifys natdevelopment snarare än vid sidan om den.

## 2. Shopify API-version — risk som måste åtgärdas oavsett bundles

`SHOPIFY_API_VERSION` i den delade klienten är låst till **2025-07**. Shopify.dev:s
dokumentation (verifierad just nu via Shopify-MCP:n) listar **2026-01, 2026-04, 2026-07**
som stabila versioner och **2026-10** som release candidate, plus `unstable`. Shopify
supportar en version i ungefär 12 månader efter release — **2025-07 är alltså vid eller
förbi sitt utgångsdatum** och bör bytas till **2026-07** (senaste stabila) oavsett
paket-arbetet. Detta är en förutsättning för att kunna använda de GraphQL-fält
(`productVariantComponents`, `productBundleCreate` m.fl.) som paket-lösningen bygger på —
de finns inte garanterat kvar på en så gammal version.

**Rekommendation:** höj `SHOPIFY_API_VERSION` till `2026-07` som eget, litet, tidigt steg
(Phase 0) innan bundle-arbetet börjar, med ett snabbt svep genom `shopify-client.ts`-
användarna för att se att inget bygger på ett fält som ändrats. Litet, reversibelt, och
blockerar annars hela resten av planen.

## 3. Rekommenderad arkitektur

### 3.1 Kärnbeslut: använd Shopifys native "Product bundles"-API, inte metafält-lösningen, som sanningskälla för lager

Shopify har (verifierat via shopify.dev, admin-API 2026-xx) en inbyggd bundle-modell:

- **Product fixed bundle** — `productBundleCreate`-mutationen skapar en produkt vars
  komponenter är hela produkter (med optionval, t.ex. "Batteri: Standard/Long Range" om
  komponenten har varianter). Async operation, pollas via `productBundleOperation`.
- **Variant fixed bundle** — `productVariantRelationshipBulkUpdate` kopplar komponent-
  varianter direkt till en specifik variant (`parentProductVariant.productVariantComponents`).
  Bra när **samma produkt** ska ha flera paket-varianter (t.ex. "Starter" vs "Pro" som
  varianter av en och samma paket-produkt).
- **Central mekanik, exakt det uppgiften efterfrågar i §5/§6:**
  paketets **pris sätts fritt** på den överordnade varianten (fritt vs. §7 alternativ A/B/C),
  medan **paketets lager beräknas automatiskt från komponenternas lager**
  (`min(component.available / quantity)` — Shopify räknar ut detta åt oss, ingen egen
  lagerberäkningskod behövs). Köp av paketet drar komponenternas lager, inte paketets eget.
  Detta är precis "Bundle stock = min(component stock / required quantity)" ur uppgiftens §5,
  fast inbyggt.
- **Begränsningar (från Shopifys egen dokumentation, viktiga för riskbilden):**
  - Max 30 komponenter, max 3 (kombinerade) optioner.
  - Inga nästlade paket (en produkt kan inte samtidigt vara komponent i ett paket OCH ha
    egna komponenter) — täcker §16:s krav om att förhindra cirkulära/nästlade paket: Shopify
    stoppar det på API-nivå, vi behöver bara ge ett bra felmeddelande.
  - **"Efter att en app har tilldelat komponenter till ett paket kan bara den appen hantera
    paketets komponenter."** Det betyder: om vi bygger detta med vår befintliga
    custom-app-koppling (`shopify_app_installations`/`integrations`-token), måste **all**
    framtida redigering av paketets komponenter ske genom samma app-identitet. Om någon i
    Shopify admin i stället installerar Shopifys gratis "Bundles"-app och skapar paket där,
    kan vår adminyta **inte** redigera de paketen (och vice versa). → Se Risker §8.
  - Endast "fixed bundle" (fasta komponenter) stöds nativt idag. **Configurable / Build
    Your Own / Mix & Match kräver antingen Shopify Functions (cart/checkout-anpassning)
    eller en tredjeparts bundles-app** — native-API:t räcker inte till det. Vår datamodell
    (§5 nedan) är medvetet byggd så att detta går att lägga till senare utan att riva upp
    grunden (se §9).

### 3.2 Vad vi bygger ovanpå: en egen adminyta, inget nytt lager av "produkter"

Vi bygger **inte** en parallell produktdatabas. Vi bygger:

1. En ny adminsida i den här reponet, `/admin/produktpaket`, i samma mönster som
   `ShopifyDroneClone.tsx` — sök/välj produkter+varianter, ange antal, ordna, förhandsgranska,
   spara som utkast, publicera.
2. Ett litet antal Supabase-tabeller (§5) som **bara** lagrar det Shopify inte har någon
   plats för: paket-typ, prisstrategi, interna anteckningar/lagerplats, ekonomisnapshot vid
   publicering, revisionshistorik, kopplingen mellan vårt utkast och det färdiga Shopify-
   objektet. Själva "vad ingår och i vilket antal" **flyttar till Shopify som sanningskälla**
   så fort paketet är publicerat — vår tabell blir en cache/utkastyta, inte en databas som
   kan hamna i otakt med Shopify permanent.
3. Nya Supabase edge functions (samma mönster som `shopify-drone-clone`) som pratar med
   Shopify Admin API via den delade `shopify-client.ts`.

### 3.3 Displaylagret — återanvänd `paket`-mallen, rör inte temat i Phase 1–6

Den redan byggda `product.paket.json`-mallen renderar exakt den UI:n uppgiften efterfrågar i
§14/§15 ("Detta ingår", totalt värde, paketpris, "Ni sparar", lagerstatus per rad) — men
läser idag ur metafälten `paket.innehall`/`paket.antal`, inte ur den nativa bundle-relationen.

**Rekommendation (minskar risk kraftigt):** när vår nya adminyta publicerar ett paket,
skriver den **både**:
- den nativa bundle-relationen (`productBundleCreate` / `productVariantRelationshipBulkUpdate`) — för korrekt lager/pris/order, och
- samma komponentlista till `paket.innehall`/`paket.antal`-metafälten — så att det redan
  byggda temat fortsätter fungera **oförändrat**, direkt.

Det innebär att Phase 1–6 (adminyta, datamodell, lager, pris, order) kan levereras och
testas **utan att röra Liquid-temat alls**. En eventuell senare uppstädning (temat läser
komponenterna direkt från Storefront API:s `product.isBundle`/`components` i stället för
metafält, så vi slipper dubbel datainmatning) blir en egen, valfri Phase 7-uppgift — inte en
förutsättning för att lansera.

Konsekvensen: kryssrutebara **tillval** (§ "Utvalda tillbehör" i den befintliga mallen)
byggs inte om alls. De ligger utanför den nativa bundle-modellen (som bara stödjer fasta,
obligatoriska komponenter) och fortsätter fungera precis som idag via `paket.tillval` +
`edp-package.js`.

## 4. Vad som behöver byggas (sammanfattning)

| Del | Nytt/ändrat | Var |
|---|---|---|
| API-version | Höj `2025-07` → `2026-07` | `supabase/functions/_shared/shopify-client.ts` |
| Datamodell | Nya tabeller `bundles`, `bundle_items`, `bundle_audit_log` | Ny migration **i digitalsignal-repot** (se §8 Risker — databasen delas, migrationer skapas aldrig här) |
| Backend | Nya edge functions: `bundle-search-products`, `bundle-draft-save`, `bundle-publish`, `bundle-inventory-preview`, `bundle-list` | `supabase/functions/bundle-*/index.ts` + delad logik i `supabase/functions/_shared/bundle-*.ts` |
| Admin-UI | Ny sida + rutt | `src/pages/admin/ProductBundles.tsx`, `src/App.tsx`, `src/components/AdminLayout.tsx` (NAV_GROUPS) |
| UI-komponenter | `command`/`popover`/`dropdown-menu` (shadcn, samma stil) för produktsök och drag-reorder | `src/components/ui/*` |
| Metafält | Återanvänd befintliga `paket.*`-definitioner, skriv dem från publiceringsflödet | `scripts/setup-paket-metafields.mjs` (redan klart), ny kod i `bundle-publish` |
| Tema | **Inga ändringar i Phase 1–6.** Ev. Phase 7: läs native bundle-data i stället för metafält | `theme/templates/product.paket.json`, `theme/assets/edp-package.js` |
| Tester | Nya vitest-tester för lagerberäkning, prislogik, validering (cirkulär/dublett/0-antal) | `scripts/__tests__/bundle-*.test.ts` (samma mönster som `paket-product-template.test.ts`) |

## 5. Datamodell

Shopify äger: produkter, varianter, SKU, lager, pris, `productVariantComponents`/
`bundleComponents`, `InventoryItem.unitCost` (självkostnad — återanvänds för §17, byggs
**inte** upp på nytt).

Vi äger (Supabase, delad databas med DigitalSignal — migration skapas i digitalsignal-repot):

```
bundles
  id                    uuid pk
  shop_id               uuid                 -- samma shop_id-mönster som integrations-tabellen
  internal_name         text                 -- "intern benämning" (§2)
  bundle_type           text                 -- 'fixed_product' | 'fixed_variant' | 'configurable' (framtida) | 'build_your_own' (framtida)
  pricing_strategy      text                 -- 'manual' | 'component_sum' | 'discount_percent'
  discount_percent      numeric null
  manual_price          numeric null
  status                text                 -- 'draft' | 'publishing' | 'published' | 'archived' | 'error'
  shopify_product_gid   text null            -- sätts vid publicering
  shopify_variant_gid   text null            -- för fixed_variant
  internal_notes        text null
  storage_location      text null
  cost_snapshot_total    numeric null        -- komponentkostnad vid publiceringstillfället (för historisk marginal, §17)
  price_snapshot_total   numeric null
  created_by / updated_by  uuid              -- FK mot samma users-tabell som DigitalSignal
  created_at / updated_at  timestamptz

bundle_items
  id                    uuid pk
  bundle_id             uuid fk -> bundles
  role                  text            -- 'component' (obligatorisk, native) | 'addon' (kryssruta, metafält-driven)
  product_gid           text
  variant_gid           text
  quantity              integer         -- check > 0
  sort_order            integer
  -- pris/SKU/lager/bild hämtas alltid live från Shopify vid rendering i adminyta,
  -- lagras inte här (för att undvika drift mot faktisk Shopify-data)

bundle_audit_log
  id, bundle_id, actor_user_id, action, field, old_value, new_value, created_at
  -- "Bengt lade till produkt X", "Bengt ändrade pris" osv (§32)
```

Detta täcker §28:s efterfrågade modell (`Bundle`/`BundleItem`) men anpassat: vi lagrar
**inte** pris/lager/SKU per rad (det vore just den "parallella produktdatabasen" uppgiften
ber oss undvika) — de hämtas live från Shopify varje gång adminytan behöver visa dem, och
cachas bara kort (in-memory/React state) för prestanda.

## 6. API-behov

**Admin API-mutationer** (alla nya, verifieras med `graphql_schema` innan de kodas — enligt
det obligatoriska GraphQL-arbetsflödet):
- `productCreate` / `productUpdate` — själva paketprodukten (titel, beskrivning, bild, SEO,
  tags, vendor).
- `productBundleCreate` (product fixed bundle) eller `productVariantRelationshipBulkUpdate`
  (variant fixed bundle) — komponentkopplingen.
- `productVariantsBulkUpdate` — pris på paketets variant.
- `metafieldsSet` — skriv `paket.innehall`/`paket.antal`/`paket.tillval`/`paket.etikett`/
  `paket.sammanfattning` (samma definitioner som redan finns).
- `inventoryItem`/`productVariant.inventoryItem.unitCost` (query) — självkostnad för §17.

**Admin API-queries:**
- Produktsök (§3): `products(query: …)` med filter på titel/SKU/vendor — Shopifys
  sökoperator på SKU går genom `query: "sku:XYZ*"`. EAN/GTIN ligger normalt i ett metafält
  eller streckkodsfältet på varianten (`barcode`) — sök på det görs klientsidan mot
  resultatet eller via `variants.barcode` om Shopifys sök stödjer det (verifieras i Phase 2).
- `product.variants` (bild, pris, `inventoryQuantity`, `sellableOnlineQuantity` per location)
  för att visa lagerstatus per komponent och location (§24).
- `fulfillmentOrder`/`order.lineItems` — **exakta fältnamn för hur en paketrads komponenter
  syns på en order/fulfillment order är inte bekräftade än** (dokumentationen visar att
  Storefront-sidan har `product.isBundle.components`, men orderradens
  komponent-nedbrytning för pick/pack måste verifieras med `graphql_schema` mot `LineItem`/
  `FulfillmentOrderLineItem` i Phase 6, innan pick-list-vyn byggs). Detta är den enda punkten
  i planen där jag inte kan garantera exakt fältnamn utan att köra det verifieringssteget —
  flaggas explicit i stället för att gissa.

**Storefront API** (om temat senare läser bundle-data direkt, Phase 7):
`product.isBundle { requiresComponents } ... components(first: n) { nodes { quantity productVariant { … } } }` — bekräftat existerande via Hydrogen-dokumentationen, motsvarande Liquid-drop verifieras i Phase 7.

## 7. Lagerhantering (§5, §23, §24)

- **Ingen egen lagerberäkningskod.** Shopify beräknar `min(component.available/qty)` internt
  för nativa bundles och exponerar det som paketets ordinarie
  `sellableOnlineQuantity`/`inventoryQuantity` — samma fält temat redan läser för vanliga
  produkter. "Endast 2 paket kvar" osv (§15) blir alltså **samma logik som redan finns i
  Dawn-temat för lågt lager**, ingen ny kod.
- **Multi-location (§24):** eftersom paketets lager härleds från komponenternas lager, och
  komponenternas lager redan är per-location i Shopify, ärver paketet detta automatiskt.
  Vi bygger ingen egen location-logik.
- **Delat lager mellan separat försäljning och paket (§10):** automatiskt löst — komponenten
  är samma `InventoryItem` oavsett om den säljs fristående eller som del av ett paket.
- Enda egna arbetet här: en **förhandsgranskningsvy** i adminytan som visar
  "3 kompletta paket möjliga" **innan** publicering (måste beräknas av oss manuellt i draft-
  läget, eftersom den nativa relationen inte finns förrän paketet är publicerat) — enkel
  `min(qty_available / qty_required)`-beräkning över de valda komponenterna, med Shopifys
  live `inventoryQuantity`.

## 8. Prislogik (§7, §17)

- **Alternativ A (manuellt paketpris) / B (komponentsumma) / C (rabatt%)** styrs av
  `bundles.pricing_strategy`. B och C beräknas från komponenternas **aktuella** pris vid
  publicerings-/redigeringstillfället och skrivs som ett fast pris på paketets variant
  (Shopify bundle-pris är alltid ett eget, fritt pris — det finns ingen "räkna om vid varje
  sidladdning"-mekanism nativt, så B/C är en **beräkning vi gör vid publicering**, inte en
  live-formel).
- Visning av "Ordinarie värde / Paketpris / Besparing" (§7, §14) — redan byggd i temat,
  oförändrad.
- Marginal (§17): `cost_snapshot_total` (summan av `unitCost × qty` vid publicering) vs.
  paketpris → bruttovinst/marginal-% visas i adminytan. Kräver att komponenterna har
  `unitCost` ifyllt i Shopify — om det saknas visar vi "Kostnadsdata saknas" i stället för
  att gissa (§31, tydliga felmeddelanden).

## 9. Order, fulfillment, pick/pack, returer (§8, §9, §22, §23)

- Order-/checkoutflödet är **Shopifys eget** — inget att bygga. Paketet syns som en rad,
  precis som vilken produkt som helst.
- Pick/pack-listan (§9) kräver den verifieringen i §6 (exakt fält för komponentnedbrytning
  per order-rad). Tills den är verifierad antar vi **inte** att den finns automatiskt utan
  bygger en fallback: en liten vy i adminytan som, givet ett ordernummer, slår upp paketets
  (från vår `bundle_items`, som för publicerade paket ska vara identisk med Shopifys egen
  relation) komponenter och renderar en kryssbar picklista — även om Shopify redan
  exponerar det nativt är denna vy ändå värdefull som ett enhetligt gränssnitt för lager-
  personalen.
- Returer (§22): dokumenteras som en **känd begränsning** tills Shopifys retur-API:s
  hantering av bundle-komponenter är verifierad (Phase 6) — troligen går en retur av en
  enskild komponent ur ett paket inte att göra via standard-return-flödet eftersom paketets
  variant är den enda line item-referensen kunden köpte; detta flaggas som en risk snarare
  än att jag påstår en lösning jag inte har verifierat.

## 10. Risker

1. **API-versionen är föråldrad** (§2) — måste åtgärdas oavsett, litet men brådskande steg.
2. **"Endast den app som skapade paketet kan hantera dess komponenter."** Om butiken någon
   gång installerar Shopifys gratis Bundles-app eller en tredjepartsapp och skapar paket
   där, blir de paketen osynliga/oredigerbara för vår adminyta. Måste kommuniceras till
   teamet: **all paketskapande ska ske via vår adminyta från och med lansering.**
3. **Configurable / Build Your Own / Mix & Match kräver Shopify Functions eller en
   tredjepartsapp** — native bundle-API:t räcker inte. Om detta blir ett hårt krav senare är
   det ett separat, betydligt större arbete (cart/checkout-transformationer), inte en
   utökning av adminytan. Datamodellen (§5, `bundle_type`-fältet) är förberedd men
   funktionen finns inte i v1.
4. **Pick/pack- och retur-beteendet för native bundles är inte fullt verifierat** ännu (§6,
   §9) — kräver ett schema-verifieringssteg i Phase 6 innan den vyn byggs, snarare än
   antaganden.
5. **Migrationer skapas aldrig i det här repot** (AGENTS.md/README.md) — databasen delas med
   `digitalsignal`. De nya tabellerna (§5) måste skapas som en migration **där**, speglas hit
   om någon delad modul berörs, och `npm run check:shared` köras. Det här är en process-
   risk, inte en teknisk risk, men den måste hanteras explicit innan Phase 2 kan starta på
   riktigt (jag kan förbereda migrationsfilen och lämna över, men kan inte köra den här).
6. **Dubbel datakälla under övergången** (native relation + `paket.*`-metafält) måste hållas
   i synk av publiceringsflödet. Om en admin redigerar paketet direkt i Shopify admin (t.ex.
   ändrar pris på variantnivå) utan att gå via vår yta, uppdateras inte metafälten — flaggas
   som en känd begränsning, med en "verifiera mot Shopify"-knapp i adminytan som ett enkelt
   motmedel.
7. **Analytics-uppdelning "sålt separat vs. sålt via paket"** (§21) beror på om/hur Shopify
   exponerar komponent-ursprung på orderrader (samma öppna punkt som §6/§9). Tills det är
   verifierat kan vi bara rapportera på paketnivå (paketets egna försäljningssiffror), inte
   ner på "hur många batterier kom från paket vs. separat" utan den bekräftelsen.

## 11. Faserad implementation

| Fas | Innehåll | Beroenden |
|---|---|---|
| 0 | Höj `SHOPIFY_API_VERSION` → `2026-07`, snabb regressionskörning av befintliga edge functions | Inga |
| 1 | Denna analys (klar) | — |
| 2 | Datamodell: migration i digitalsignal-repot (`bundles`, `bundle_items`, `bundle_audit_log`), spegla hit om delad modul | Fas 0 |
| 3 | Backend: edge functions för produktsök, draft-save, lagerförhandsgranskning | Fas 2 |
| 4 | Admin-UI: ny sida, produktsök/variantval, antal, drag-reorder, spara utkast, förhandsgranskning | Fas 3 |
| 5 | Publicering: `productBundleCreate`/`productVariantRelationshipBulkUpdate` + metafältskrivning, validering (cirkulär/dublett/0-antal enligt §16) | Fas 4 |
| 6 | Verifiera order/fulfillment/pick-pack/retur-beteende mot schema, bygg picklista, marginal-vy | Fas 5 |
| 7 (valfri) | Temat läser native bundle-data i stället för metafält; collection `/paket` med "innehåller N delar" | Fas 5 |
| 8 | Test: enligt §33 (skapande, lager, order, pris, edge cases) | Löpande från Fas 3 |
| 9 | Performance/säkerhetsgenomgång (roll-skydd redan finns via `AdminLayout`, granska rate limits på produktsök) | Fas 8 |
| 10 | Produktionssättning, dokumentation uppdaterad (denna fil + README) | Fas 9 |

Varje fas testas och godkänns innan nästa påbörjas, enligt uppgiftens instruktion.

## 12. Öppna beslut innan Fas 2 startar

1. **Product fixed bundle vs. variant fixed bundle som default.** Rekommendation: product
   fixed bundle (enklare mental modell — en paket-titel = en Shopify-produkt). Variant fixed
   bundle sparas för när samma paket ska finnas i flera fasta konfigurationer som varianter.
2. **Migrationen måste skapas i `digitalsignal`-repot**, inte här. Jag behöver bekräftelse på
   hur den overlämningen ska ske (jag kan skriva migrationsfilen och lägga den redo, men
   någon med tillgång till det repot behöver köra/committa den där — eller säg till om jag
   ska försöka nå det repot på annat sätt).
3. Vill ni att jag börjar med **Fas 0 (API-versionshöjning)** direkt, som ett litet fristående
   steg, medan ni tar ställning till punkt 1–2?
