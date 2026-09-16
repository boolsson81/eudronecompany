# Fas 4–7 – Payload Finder, Enterprise Configurator, jämförelse, analytics & datakvalitet

Datum: 2026-09-16
Gren: `claude/quirky-knuth-n12zmd`

Uppföljning till `ENTERPRISE_PAYLOAD_PHASE1_AUDIT.md`, `ENTERPRISE_PAYLOAD_PHASE2_REPORT.md`
och `ENTERPRISE_PAYLOAD_PHASE3_REPORT.md`. Detta dokument täcker fas 4 (Payload
Finder), fas 5 (Enterprise Configurator), fas 6 (produktjämförelse) och fas 7
(analytics + katalog-hälsokontroll).

## 1. CREATED

**Payload Finder (fas 4)** — `/pages/hitta-ratt-payload`:
- `theme/sections/edp-payload-finder.liquid` — 5-stegsguide (uppgift, bransch,
  miljö, sensorteknik, UAV-plattform). Vokabulären (tasks/industries/
  environments/technologies) och de viktade poängen är dupliceringar av
  `data/edp-payload-taxonomy.json`s `finder`-block, inbäddade som fast UI-text
  eftersom det är gränssnittskonfiguration, inte affärsdata — det hör alltså
  inte hemma i ett metaobjekt.
- `theme/assets/edp-payload-finder.js` — poängmodellen (kompatibilitet 30 %,
  uppdrag 25 %, sensor 20 %, miljö 10 %, prestanda 10 %, kundkrav 5 %).
  Uppdrags- och sensorpoäng beräknas från riktiga seedade `mission`- och
  `payload_category`-metaobjekt. Kompatibilitet, prestanda och kundkrav kan
  inte beräknas på kategorinivå i dag (ingen per-plattform- eller produktdata
  finns där ännu), så de använder en tydligt markerad neutral baslinje
  i stället för en påhittad poäng — se **4. DATA MODEL** för den fullständiga
  motiveringen och den verifierade konsekvensen (inget resultat kan nå bandet
  "Utmärkt matchning" förrän riktig kompatibilitetsdata finns).
- `theme/templates/page.payload-finder.json` + Shopify-sidan **Hitta rätt
  payload** (`gid://shopify/Page/156661317960`, handle `hitta-ratt-payload`).

**Enterprise Configurator (fas 5)** — `/pages/bygg-ditt-system`:
- `theme/sections/edp-configurator.liquid` + `theme/assets/edp-configurator.js`
  — 8-stegsguide: bransch → UAV-plattform → primär payload-kategori →
  kompletterande payload-kategorier → miljö/krav → önskad mjukvara →
  önskad installation/utbildning/service → sammanfattning.
- Sista steget bygger en läsbar textsammanfattning och skickar besökaren till
  den **befintliga** `enterprise-quote-form`-sektionen i stället för att bygga
  en ny inskickningsväg (master-promptens regel om att inte återuppfinna
  befintlig funktionalitet). `enterprise-quote-form.liquid` fick ett litet,
  additivt tillägg som läser valfria query-parametrar (`prefill_message`,
  `industry`) för att förifylla meddelande- och bransch-fälten — formulärets
  beteende utan dessa parametrar är oförändrat.
- `theme/templates/page.bygg-ditt-system.json` + Shopify-sidan **Bygg ditt
  drönarsystem** (`gid://shopify/Page/156664103240`).
- Steg 6–7 (mjukvara, service) är kundens **önskemål**, inte påståenden om
  produkttillgänglighet.

**Produktjämförelse (fas 6)** — `/pages/jamfor-payloads`:
- "Lägg till i jämförelse"-knapp på payload-produktsidor
  (`edp-payload-details.liquid`), val sparas i besökarens webbläsare
  (`localStorage`, aldrig i Shopify eller hos Claude).
- `theme/sections/edp-comparison-row.liquid` — hämtas via Shopifys
  **Section Rendering API** (`GET /products/<handle>?section_id=edp-comparison-row`),
  så all data kommer från riktiga `edp.*`-metafält och `edp.specification`
  utan att behöva en Storefront API-token.
- `theme/sections/edp-payload-comparison.liquid` + `theme/assets/edp-payload-comparison.js`
  — bygger jämförelsetabellen klientsidan; saknade fält visas alltid som
  "Ej specificerat", aldrig gissade.
- `theme/templates/page.jamfor-payloads.json` + Shopify-sidan **Jämför
  payloads** (`gid://shopify/Page/156663906632`).

**Analytics-brygga (fas 7)**:
- `theme/assets/edp-analytics.js` — vidarebefordrar `edp:analytics`
  CustomEvents till `window.dataLayer`, men **bara om en dataLayer redan
  finns** (dvs. en tag manager redan är installerad på butiken). Skapar
  aldrig en egen dataLayer, laddar aldrig gtag.js och fattar inga
  samtyckesbeslut.
- Kopplade händelser: `payload_category_view`, `payload_product_view`,
  `mission_view`, `compatibility_check`, `payload_finder_started`,
  `payload_finder_completed`, `product_comparison_started`,
  `product_added_to_configuration`, `configuration_completed`,
  `enterprise_quote_started`, `enterprise_quote_submitted`,
  `contact_expert_clicked`.

**Katalog-hälsokontroll (fas 7)**:
- `scripts/check-payload-data-quality.mjs` — dry-run som standard, går igenom
  klassificerade payload-produkter och sätter
  `edp.data_quality_status`/`edp.data_quality_notes` utifrån vilka fält som
  faktiskt saknas (`missing_data` / `compatibility_review_required` /
  `needs_review` / `complete`) — gissar aldrig ett värde.
- `scripts/__tests__/check-payload-data-quality.test.ts` — 9 nya enhetstester
  av den rena bedömningslogiken (`evaluate`/`isBlank`).

## 2. MODIFIED

- `theme/sections/edp-payload-category.liquid` — `finder_link`-inställningens
  default pekar nu på `/pages/hitta-ratt-payload`; sidvisningshändelse
  (`payload_category_view`) och `contact_expert_clicked` på "Prata med en
  expert"-länken.
- `theme/sections/edp-mission.liquid` — sidvisningshändelse (`mission_view`).
- `theme/sections/edp-payload-details.liquid` — "Lägg till i jämförelse"-knapp,
  `compatibility_check`-händelse på kompatibilitetsankaret,
  `payload_product_view`-händelse.
- `theme/sections/enterprise-quote-form.liquid` — valfri förifyllning via
  query-parametrar (se ovan), `enterprise_quote_started`/`_submitted`-händelser.
- `theme/assets/edp-payload.css` — nya klasser för Finder-guiden
  (`.edp-finder__*`), jämförelsetray/tabell (`.edp-compare-*`) och
  konfiguratorsammanfattningen (`.edp-configurator__summary`).
- `docs/reports/ENTERPRISE_PAYLOAD_PHASE3_REPORT.md` — rättade URL-mönstret
  för metaobjektsidor (`/pages/<urlHandle>/<handle>`, inte
  `/<urlHandle>/<handle>` som antogs innan det kunde verifieras).

## 3. NOT MODIFIED

- Inga produkter, befintliga collections eller befintlig temakod utanför de
  filer som listas ovan.
- `enterprise-quote-form.liquid`s kärnbeteende (fältnamn, valideringsflöde,
  samtyckeskryssruta, honeypot) är oförändrat — endast additiv förifyllning
  och analyticshändelser tillagda.

## 4. DATA MODEL — Payload Finder-poängmodellens ärlighetsgaranti

Poängmodellen validerades oberoende med en Python-återimplementation körd mot
den riktiga seedade taxonomidatan (`data/edp-payload-taxonomy.json`), inte
bara läst igenom manuellt. Exempel: uppgift "Mäta temperatur" + bransch
"Energi" + miljö "Utomhus" + sensorteknik "Termisk" gav `thermal-cameras`
högst (80 poäng, "Stark matchning"), och det näst högsta resultatet
(`eo-zoom-cameras`, 66 poäng) visade sig bero på att uppdraget
"Solparksinspektion" i verkligheten taggat både `thermal` och `rgb` som
relevanta teknologier — inte ett räknefel.

Eftersom kompatibilitet, teknisk prestanda och kundkrav inte kan beräknas
sanningsenligt på kategorinivå i dag, capas de vid neutrala baslinjer
(kompatibilitet 50/100 om en plattform valts, annars 70/100; prestanda och
krav 70/100 vardera). Konsekvensen — verifierad, inte bara avsedd — är att
inget resultat kan nå 90+ poäng ("Utmärkt matchning") förrän riktig
per-plattform-kompatibilitetsdata finns registrerad på produktnivå. Det är en
medveten spärr, inte en bugg.

## 5. TEST RESULTS

- `node --check` på samtliga nya/ändrade JS-filer (finder, comparison,
  configurator, analytics-bryggan, katalog-hälsoscriptet) — alla OK.
- Poängmodellen cross-verifierad mot verklig taxonomidata via en fristående
  Python-implementation (se **4. DATA MODEL**).
- `scripts/__tests__/check-payload-data-quality.test.ts`: 9/9 nya tester
  gröna. Hela repots vitest-svit: **145/145 gröna**, inga regressioner.
- Menyuppdateringarna (Payload Finder, Bygg ditt system, Jämför payloads i
  `enterprise`-menyn) verifierade med en efterföljande läsfråga mot Shopify
  Admin GraphQL — alla länkar pekar rätt, inga befintliga menyval förlorades.
- **Inte verifierat**: visuell/interaktiv testning i webbläsare (utgående
  HTTPS mot butiksdomänen är blockerad i den här sandboxen). Bör köras i
  Shopify-temagranskaren innan filerna publiceras till det live Horizon-temat.

## 6. ISSUES

1. `payload_filter_used` är definierad i händelsekatalogen men **inte
   kopplad** — det kräver ändringar i Dawns befintliga `facets.liquid`, vilket
   ligger utanför den här fasens leverabler (Payload Finder/Configurator/
   Comparison/analytics-brygga/katalog-hälsa).
2. `scripts/check-payload-data-quality.mjs` har **inte körts mot Shopify** i
   den här sandboxen (inga admin-uppgifter finns lokalt) och skulle ändå
   rapportera noll klassificerade produkter i nuläget, eftersom inga produkter
   har taggats med `edp.payload_category` ännu (master-promptens regel:
   bygg arkitektur först, populera produkter separat).
3. Repots git-historik innehåller en helt separat Vercel-hostad React-app
   (`src/`, `api/`, `index.html`) med sin egen samtyckesstyrda GA4-relä
   (`docs/ANALYTICS.md`). Den är inte samma applikation som den här
   Shopify-butiken och har inget med `edp-analytics.js`-bryggan att göra —
   nämns här bara för att undvika framtida sammanblandning.
4. Enterprise Configuratorns steg för mjukvara/service använder en fast,
   generisk lista (flygplanering, fotogrammetri, flotthantering, GIS,
   installation, utbildning, serviceavtal, demo, integration) eftersom ingen
   produktnivådata ännu kopplar specifika mjukvaror/tjänster till payload-
   kategorier. Detta är kundens önskemål i fritext/kryssrutor, inte ett
   påstående om vad som faktiskt finns tillgängligt.

## 7. NEXT STEP

Arkitekturen (fas 1–7) är nu komplett: datamodell, storefront-sidor,
navigation, Payload Finder, Enterprise Configurator, produktjämförelse,
analytics-brygga och katalog-hälsokontroll. Kvarstående arbete är i huvudsak
**datapopulering och driftsättning**, inte fler arkitekturfaser:

1. Klassificera faktiska payload-produkter med `edp.payload_category` och
   fyll i kompatibilitet/tekniska fält — kör därefter
   `scripts/check-payload-data-quality.mjs --execute` för att sätta
   datakvalitetsstatus.
2. Publicera Phase 3–7-temafilerna till det **live Horizon-temat** (ett
   separat, medvetet beslut — se fas 3-rapportens ISSUES-punkt 1).
3. Verifiera visuellt i Shopify-temagranskaren (guiderna, jämförelsetabellen,
   produktsidans nya sektioner) innan publicering.
4. Koppla `payload_filter_used` om/när Search & Discovery-filtrering på
   payload-kategorier/branscher byggs ut.
