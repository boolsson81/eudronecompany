# Fas 3 – Storefront-lager för payload/mission-arkitekturen

Datum: 2026-09-16
Gren: `claude/quirky-knuth-n12zmd`

Detta är uppföljningen till `ENTERPRISE_PAYLOAD_PHASE1_AUDIT.md` (fas 1) och
`ENTERPRISE_PAYLOAD_PHASE2_REPORT.md` (fas 2). Fas 3 bygger det Shopify-native
storefront-lagret ovanpå de metaobjekt och metafält som skapades i fas 2, samt
åtgärdar ett publiceringsfel som upptäcktes i det seedade datat.

## 1. CREATED (nya filer/objekt)

**Tema-filer (committade i `5661c22`):**
- `theme/assets/edp-payload.css` – eget CSS-namespace (`.edp-payload`,
  `.edp-compat`, `.edp-badge`, `.edp-cta-row` m.fl.) som fungerar oberoende av
  om temat är Dawn- eller Horizon-baserat (se fas 1-fyndet om temadivergens).
- `theme/snippets/edp-compatibility-status.liquid` – kompatibilitetsbadge med
  3-stegsfallback (explicit `payload_compatibility`-post → `compatible_uav`-lista
  med brasklapp → "Kompatibilitet behöver bekräftas" + CTA). Påstår aldrig
  kompatibilitet utan verklig data.
- `theme/sections/edp-payload-category.liquid` + `templates/metaobject.payload_category.json`
  – sida för `payload_category`-metaobjekt (underkategorier, typiska uppdrag).
- `theme/sections/edp-mission.liquid` + `templates/metaobject.mission.json`
  – sida för `mission`-metaobjekt (uppgifter, miljöer, teknologier, lösningspaket).
- `theme/sections/edp-solution-package.liquid` + `templates/metaobject.solution_package.json`
  – sida för `solution_package`-metaobjekt (komponenter, kopplade produkter, pris-notis).
- `theme/sections/edp-payload-details.liquid` + `templates/product.enterprise-payload.json`
  – ny produktmall för payload-produkter: enterprise-badge, kompatibilitetsstatus,
  tekniska specifikationer (med "Ej specificerat"-fallback), vad som ingår,
  tillbehör, kompatibel mjukvara, CTA:er ("Begär Enterprise-offert" / "Kontrollera kompatibilitet").

**Shopify-navigation (Admin GraphQL, `menuUpdate` på `enterprise`-menyn):**
- Nytt toppmenyval **"Payloadkategorier"** med 12 undermenyval, ett per
  `payload_category`, länkade via `resourceId` (typ `METAOBJECT`) så att
  Shopify alltid genererar rätt URL oavsett framtida handle-ändringar.
- Nytt toppmenyval **"Uppdragslösningar"** med 9 undermenyval, ett per
  `solution_package`, samma `METAOBJECT`-länkningsmönster.
- Alla 9 befintliga menyval (Enterprise Overview, DJI Matrice, Mavic Enterprise,
  DJI Agras, FlyCart, DJI Dock, Industry Solutions, Payloads & Sensors,
  Enterprise Software) skickades tillbaka oförändrade i samma mutation för att
  inte förlora dem – verifierat efteråt med en läsfråga mot menyn.

## 2. MODIFIED (befintliga Shopify-objekt)

- **Publiceringsstatus på 177 metaobjekt**: samtliga instanser som seedades i
  fas 2 (12 `payload_category`, 96 `payload_subcategory`, 44 `mission`,
  16 `uav_platform`, 9 `solution_package`) skapades ursprungligen med
  `capabilities.publishable.status: DRAFT` (Shopifys standardbeteende för
  `metaobjectUpsert`, oavsett att definitionen har `publishable.enabled: true`).
  DRAFT-instanser exponeras inte på online-store-rutter och riskerar att
  utelämnas ur `shop.metaobjects.<type>.values`-loopar. Samtliga 177 har nu
  republicerats till `ACTIVE` via batchade `metaobjectUpsert`-anrop som bara
  skickar `capabilities` (fält orörda, eftersom upsert gör en partiell merge).
- **`enterprise`-menyn**: fick två nya toppnivåval (se ovan). Inga befintliga
  menyval togs bort, döptes om eller flyttades.

## 3. NOT MODIFIED

- Inga produkter, befintliga collections, befintliga metafält
  (`custom.passsar_till`, `seo.*` etc.) eller befintlig temakod (Horizon-temat
  som faktiskt är publicerat) har ändrats.
- Repo-temats `main-product`-sektion och övriga Dawn-sektioner är oförändrade –
  den nya produktmallen (`product.enterprise-payload.json`) är en helt separat
  mall som måste tilldelas manuellt till payload-produkter, den ersätter inte
  standardmallen.
- `payload_subcategory` och `uav_platform` har fortfarande
  `onlineStore.enabled: false` (som avsett i fas 2-designen – de har ingen egen
  sida, utan visas inbäddat på kategori-/produktsidor).

## 4. DATA MODEL (bekräftade URL-mönster)

Verifierat via `metaobjectDefinitionByType`-introspektion (Admin GraphQL har
inget `onlineStoreUrl`-fält, så detta är den auktoritativa källan):

| Typ | `onlineStore.enabled` | `urlHandle` | Sid-URL |
|---|---|---|---|
| `payload_category` | true | `payloads` | `/payloads/<handle>` |
| `mission` | true | `missions` | `/missions/<handle>` |
| `solution_package` | true | `solutions` | `/solutions/<handle>` |
| `payload_subcategory` | false | – | ingen egen sida |
| `uav_platform` | false | – | ingen egen sida |

## 5. TEST RESULTS

- Samtliga `metaobjectUpsert`-batchar för DRAFT→ACTIVE returnerade tomma
  `userErrors`-listor. Stickprov efteråt (`ais`, `radar`, `custom-payload`,
  `oem-payload`, `research-payload`, 3 kategorier, 3 uppdrag) bekräftar
  `capabilities.publishable.status: ACTIVE` på alla kontrollerade poster.
- `menuUpdate`-mutationen returnerade tom `userErrors`-lista. Efterföljande
  läsfråga mot menyn bekräftar att alla 21 nya undermenyval har rätt
  `resourceId` och att de 9 befintliga toppobjekten är intakta med sina
  ursprungliga underobjekt.
- Liquid-filerna har inte kunnat renderas mot den publicerade butiken i den
  här sandboxen (utgående HTTPS mot butiksdomänen blockeras här), så
  visuell/funktionell verifiering i webbläsare återstår och bör göras i
  Shopify-temagranskaren innan filerna publiceras till det live Horizon-temat.

## 6. ISSUES

1. **Ej åtgärdat i den här fasen**: fas 3-temafilerna ligger i repo:t
   (`theme/...`) men är inte pushade till det *publicerade* Horizon-temat
   (`gid://shopify/OnlineStoreTheme/189338091848`) – enbart till git-grenen.
   Att pusha till det live temat kräver ett separat, medvetet beslut eftersom
   Horizon och repo-temat (Dawn) har olika sektions-/block-scheman (se fas 1).
2. Fas 2-rapportens "ISSUES"-sektion nämnde `metaobjectsCount`-cachning men
   inte DRAFT-statusfyndet, eftersom det upptäcktes efter att den rapporten
   skrevs. Detta dokument är den officiella uppföljningen av det fyndet.
3. Uppdragssidorna (44 `mission`-objekt) är åtkomliga via URL och via
   kategorisidornas "rekommenderade uppdrag"-listor och lösningspaketens
   brödsmulor, men har ännu ingen egen huvudmeny-post (bara `solutions`- och
   `payloads`-menyerna byggdes, för att undvika en 44-post flatmeny). Kan
   läggas till i en framtida fas grupperat per bransch om det efterfrågas.

## 7. NEXT STEP

Fas 4–6: bygg "Hitta rätt payload"-guiden (5-stegsguide med den viktade
poängmodellen som redan finns definierad i `data/edp-payload-taxonomy.json`
under `finder`), Enterprise-konfiguratorn (8-stegsguide) och
produktjämförelsefunktionen. Därefter fas 7: datakvalitetsscript, analytics-
händelser, tester och slutdokumentation.
