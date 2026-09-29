# Consumer UX, informationsarkitektur- och länkstrukturrevision

**Datum:** 2026-09-24
**Omfattning:** European Drone Companys Consumer-sektion (privatkund/B2C) i Shopify-butiken
**Butik:** Europe Drone Company (`www.eudronecompany.com`, Basic-plan)
**Tema för ändringar:** EDC Förhandsgranskning (Claude) — opublicerat utkast (`gid://shopify/OnlineStoreTheme/189631627592`)
**Metod:** Kodinventering av `theme/`, `shopify-theme/`, `data/` och tidigare rapporter i `docs/reports/`, kombinerat med **läsning direkt mot den skarpa Shopify-butiken** (menyer, sidor, collections, metafields via Shopify Admin GraphQL) för att verifiera vad som faktiskt är live kontra vad som är gammal planeringsdata i repot. Implementation i den här omgången är **begränsad till temakod** (git → opublicerat förhandsgranskningstema); åtgärder som kräver skrivning mot live butiksdata (Admin: menyer, sidpublicering, metafields på fler produkter) listas som att-göra-punkter i stället för att utföras automatiskt.

---

## 1. Sammanfattning

Butiken har en betydligt mer komplett Consumer-grund än vad temakoden ensam visar — men de bitarna är **inte sammankopplade**:

- Det finns riktiga, väl uppbyggda menyer i Shopify Admin (`spare-parts`, `service-support`, `business`) och riktiga sidobjekt för support/garanti/service (`support`, `service-support`, `warranty-management`, `service-request`, `troubleshooting`, `calibration`, m.fl.) — men **den live konsument-headern (`theme/sections/header.liquid`) länkar bara till `main-menu` + `enterprise`**. Support/service/reservdels-menyerna renderas aldrig för en vanlig besökare.
- Nästan alla dessa sidobjekt är dessutom **opublicerade utkast** i Admin, så även om de länkades in skulle de ge 404/otillgänglig-sida för kunder idag.
- Produkter har redan riktiga metafields för accessoarer (`custom.dronartillbehor`), reservdelar (`custom.reservdelar`), relaterade produkter (`custom.related_products`), manualer och PDF:er (`custom.manual`, `custom.pdf`) och kompatibilitet (`custom.passsar_till`, `custom.kompatibla_dji_system`) — men **ingen av dem renderades någonstans i temat** innan den här sessionen.
- Consumer-startsidan (`page.consumer.json`) länkade till collection-handles som **aldrig existerat** i butiken (`consumer-drones`, `starter-kits`, `mini-flip`, `air-mavic`, `fpv`, `accessories`) — alla knappar/kort på sidan var trasiga.
- Ett verkligt bugg: startsidan (`index`) tvingades till **Enterprise-segmentet** som standard i navigationslogiken, trots att alla andra fallbacks i temat använder Consumer som standard.
- Footern har historiskt bara haft **en enda länk** (Privacy Policy) — bekräftat kvarstående i den live "footer"-menyn — och temats footer-sektion visade den länken **två gånger** (två block som pekade på samma menyhandle).

Se avsnitt 7 för vad som är åtgärdat i temakoden i denna session, och avsnitt 8 för vad som kräver ett beslut/åtgärd i Shopify Admin.

---

## 2. Nulägesbild — vad finns redan (kort per yta)

| Yta | Status | Detaljer |
|---|---|---|
| Consumer-startsida | ✅ Finns (`page.consumer.json` + `consumer-landing.liquid`) | Hero, 4 kategorikort, 3 funktionskort, 3 fördelar, CTA. Länkarna var trasiga (åtgärdat, se §7). |
| Segmentväljare (Privat/Företag) | ✅ Finns | `user-type-selector` på startsidan + "Privat"/"Företag"-toggle i utility bar. |
| Header/mega-meny | ⚠️ Delvis | Konsumentmenyn (`main-menu`, titel "Main menu Privat") är riktig och väl fylld (Drönare per modell, Tillbehör, Reservdelar). Men tre andra riktiga menyer (`spare-parts`, `service-support`, `business`) är **inte kopplade** till den aktiva Swedish header. |
| Kategori → produkt | ✅ Fungerar | Collection-mallar med filtrering/sortering (`main-collection-product-grid`), produktkort med `card-product-compatibility`. |
| Produktsida — grundinfo | ✅ Fungerar | Titel, bilder, pris, lagerstatus, köpknapp, beskrivning, collapsible-flikar. |
| Produktsida → tillbehör/reservdelar | ❌→✅ Åtgärdat i denna session | Metafields fanns (`custom.dronartillbehor`, `custom.reservdelar`) men renderades ingenstans. Ny sektion `edp-product-relations` kopplar in dem. |
| Produktsida → dokumentation | ❌→✅ Åtgärdat i denna session | `custom.manual`/`custom.pdf` fanns men renderades ingenstans; samma nya sektion visar dem när de är ifyllda. |
| Produktsida → relaterade (native) | ✅ Fungerar | `related-products.liquid` använder Shopifys native rekommendations-API. |
| Produkt → kompatibilitet | ⚠️ Två parallella system | Konsument: `dji.compatible_models_display` (textsträng, ej klickbar relation) + `custom.passsar_till`/`kompatibla_dji_system`. Enterprise: `edp.compatibility_records`/`compatible_uav` (metaobject-referenser). Inte konsoliderat. |
| Produkt → bundle/paket | ⚠️ Enkelriktat | `paket.innehall`/`paket.tillval` länkar paket → komponentprodukt. Ingen omvänd länk (komponentprodukt → "ingår i paket X"). |
| Breadcrumbs | ❌→✅ Åtgärdat i denna session | Endast JSON-LD (`edp-seo-breadcrumbs.liquid`) fanns, ingen synlig nav. Ny synlig `edp-breadcrumbs.liquid` tillagd på produkt- och kategorisidor. |
| Sök | ✅ Fungerar | `main-search.liquid` slår redan ihop produkter, artiklar och sidor i ett resultat (native Shopify-sökfunktion). |
| Varukorg → cross-sell | ⚠️ Generiskt | `featured-collection` mot "all"-collection, inte innehållsmedveten. |
| Kundkonto | ⚠️ Minimalt | Orderhistorik + adresser. Ingen länk vidare till support/guider/återköp. Beställningssidan har en AI-leveranschatt som verbalt hänvisar till kontaktsidan men utan klickbar länk. |
| Support & Service-hubb | ⚠️ Finns i Admin, ej live | Menyn `service-support` (DJI Service, RMA/garanti, felsökning, kalibrering, kontakt) och motsvarande sidor finns som objekt i Admin men är **opublicerade** och **inte länkade** från den aktiva headern. |
| Garanti/retur/reklamation | ❌ Saknas som innehåll | Ordet "reklamation" finns inte alls i repot. `warranty-management` (Garantihantering) är en tom, opublicerad sida. Shopifys nativa policy-länkar var avstängda i footern (`show_policy: false` — åtgärdat, se §7). |
| DJI Care Refresh | ⚠️ Säljs, förklaras inte | Finns som produkt (`product.service-plans.json`) men de 5 info-flikarna ("Det här täcker planen" osv.) är tomma placeholders. |
| Guider & kunskap | ❌ Saknas | Ingen "Kom igång"/guide-hubb existerar. FAQ/jämför-bloggmallarna (`edp-faq-blog`, `edp-comparison-blog`) finns men har Enterprise-orienterat standardinnehåll (Zenmuse, DJI Enterprise). |
| Leverans & retur | ⚠️ Bara marknadsföringstext | "Fri frakt över 999 kr", "Snabb leverans"-badges finns, men ingen egentlig frakt/retur-policysida syns (native policy-block var avstängt). |

---

## 3. Kritiska fynd (kräver uppmärksamhet oavsett prioritetsordning)

1. **Consumer-header saknar tre riktiga, redan byggda menyer.** `theme/sections/header-group.json` har bara `menu_consumer`/`menu_enterprise`. Menyerna `spare-parts` (per-modell reservdelar), `service-support` (support/garanti-hubb) och `business` (B2B-tjänster) finns i Admin men renderas aldrig för en Consumer-besökare i det aktiva temat (`theme/sections/`). Den äldre `shopify-theme/eurodroneparts/`-headern *har* stöd för dessa fyra extra menyslottar, men den headern har fortfarande generisk Dawn-platshållartext ("Welcome to our store") och verkar inte vara den som faktiskt är i produktion. **Rekommendation:** bekräfta vilken header som är live, och om det är `theme/sections/`-varianten, lägg till minst `menu_service_support` som en kopplad meny (temakodsändring, kan göras i nästa omgång).
2. ~~Startsidan tvingas till Enterprise-segmentet som standard.~~ **Åtgärdat i denna session** (se §7.1).
3. **Nästan hela support/service/garanti-strukturen existerar redan i Admin men är opublicerad.** Sidorna `support`, `service-support`, `flycart-service`, `matrice-service`, `troubleshooting`, `calibration`, `firmware-update`, `warranty-management`, `service-request` finns som Page-objekt men `isPublished: false`. Att länka till dem (vilket temat redan gör på flera ställen, t.ex. `/pages/support`) fungerar inte förrän de publiceras **och** fylls med innehåll — detta är en Admin-åtgärd, se §8.
4. **Metafield-typo:** `custom.passsar_till` har tre "s" (ska sannolikt vara `passar_till`). Kosmetiskt (syns aldrig för kund) men värt att städa upp vid nästa metafield-migrering eftersom `custom.passar_till_marke_modell` redan existerar som en korrekt stavad variant — sannolikt två överlappande fält som bör konsolideras.
5. **Två parallella per-modell reservdelsstrukturer** lever samtidigt: dels en komponenttyp-baserad gren under `main-menu` → "Spare Parts" (Electronics, Propellers, Gimbal Parts osv.), dels en modellbaserad `spare-parts`-meny (DJI Mini 4 Pro, DJI Air 3, DJI Neo osv.) som inte är kopplad till den aktiva headern. En kund som står på en DJI Mini-produktsida och vill ha reservdelar till just den modellen har idag ingen direkt väg dit via navigationen.

---

## 4. Luckor — A/B/C/D-lista

**A — Finns redan och fungerar**
- Kategori → produkt (collection-mallar, filtrering, sortering)
- Produktkort med kompatibilitetsrad (`card-product-compatibility`)
- Native produktrekommendationer (`related-products`)
- Enhetlig sök över produkter/artiklar/sidor (`main-search`)
- Segmentväljare på startsidan (`user-type-selector`)
- `main-menu` (konsumentnavigationen) — väl fylld med riktiga collection-länkar
- Orderhistorik i kundkonto

**B — Finns men behöver förbättras**
- Consumer-startsidans länkar (åtgärdat i denna session, se §7.2)
- Footerns dubblettinnehåll och avstängda policy-länkar (åtgärdat, se §7.3)
- Segment-default-buggen på startsidan (åtgärdat, se §7.1)
- Produkt → tillbehör/reservdelar/dokumentation (åtgärdat, se §7.4 — kräver att fler produkter faktiskt får värden i `custom.dronartillbehor`/`reservdelar`/`manual`/`pdf` i Admin för att synas)
- Breadcrumbs (åtgärdat, se §7.5)
- Utility bar "Support"-länk (åtgärdat, se §7.1)
- Kundportaler på startsidan ("Serviceportal"/"Utbildningsportal") pekade på `#` (åtgärdat till `/account`, se §7.1) — riktig funktionalitet bakom "Utbildningsportal" saknas dock fortfarande
- Två parallella reservdelsstrukturer (komponenttyp vs. per modell) — bör slås ihop eller korslänkas
- Två parallella kompatibilitetsdatamodeller (`dji.compatible_models_display` vs. `custom.passsar_till`/`passar_till_marke_modell`) — bör konsolideras

**C — Saknas och bör skapas**
- Publicerat, ifyllt innehåll på `support`, `service-support`, `warranty-management` (garanti/reklamation), `service-request` (Admin-åtgärd)
- En riktig "Kom igång"-guide för nya drönarpiloter (registrering, drönarkort, första flygningen)
- Konsumentorienterat innehåll i FAQ/jämför-bloggarna (`vanliga-fragor`, `jamforer`) — idag Enterprise-standardtext
- Ifyllt innehåll i DJI Care Refresh-produktens 5 tomma info-flikar
- Omvänd länk komponentprodukt → paket ("Den här produkten ingår i paket X")
- Menykoppling för `service-support`/`spare-parts` i den aktiva Consumer-headern
- En "reklamation"/returflöde-sida (finns inte alls i repot idag)

**D — Inte nödvändigt just nu**
- Enterprise-sidans B2B-verktyg (payload finder, jämför payloads, bygg ditt system) — redan väl utbyggt för Enterprise-segmentet, ingen konsumentrelevans
- Ytterligare varumärkes-/partnersidor (Aerobright, BRD RC, PGYTECH m.fl.) — fungerar som de är, låg prioritet för denna revision

---

## 5. Länkmatris (urval — de högst prioriterade raderna)

| Från | Till | Typ | Syfte | Prioritet | Status |
|---|---|---|---|---|---|
| Consumer-startsida | `/collections/drones-with-camera` | Hero-CTA | Produktupptäckt | Hög | ✅ Åtgärdat |
| Consumer-startsida | `/collections/dji-mini-4-series`, `/dji-mavic-3-series`, `/dji-avata-series` | Kategorikort | Produktupptäckt per behov | Hög | ✅ Åtgärdat |
| Consumer-startsida | `/collections/drone-accessories` | Kategorikort/CTA | Tillbehör | Hög | ✅ Åtgärdat |
| Consumer-startsida | `/collections/starter-package` | Funktionskort | Kom igång-paket | Hög | ✅ Åtgärdat |
| Consumer-startsida | `/pages/support` | Funktionskort | Trygghet/support | Hög | ✅ Länk korrekt (kräver publicering i Admin) |
| Utility bar | `/pages/service-support` | Support-länk | Efterköpssupport | Hög | ✅ Åtgärdat (saknade helt) |
| Produkt | Tillbehör (`custom.dronartillbehor`) | Ny sektion | Cross-sell | Hög | ✅ Åtgärdat |
| Produkt | Reservdelar (`custom.reservdelar`) | Ny sektion | Cross-sell | Hög | ✅ Åtgärdat |
| Produkt | Dokumentation (`custom.manual`/`pdf`) | Ny sektion | Trygghet/självservice | Medel | ✅ Åtgärdat |
| Produkt/Kategori | Breadcrumb → förälderkategori | Synlig nav | Navigation + SEO | Hög | ✅ Åtgärdat |
| Footer | `main-menu` (Handla) | Länklista | Shop-kategorier i footer | Hög | ✅ Åtgärdat |
| Footer | Shopifys policies (retur/frakt/villkor) | Native block | Trygghet/SEO | Hög | ✅ Åtgärdat (`show_policy: true`) |
| Startsida | `/account` | Portalkort | Orderspårning | Medel | ✅ Åtgärdat |
| Consumer-header | `service-support`-meny | Ny menyslot | Support i huvudnav | Hög | ⏳ Kräver temakodsbeslut (se §6) |
| Consumer-header | `spare-parts`-meny (per modell) | Ny menyslot | Reservdelar per modell | Medel | ⏳ Kräver temakodsbeslut (se §6) |
| `/pages/support` m.fl. | — | Sidpublicering | Innehåll synligt för kund | Hög | ⏳ Admin-åtgärd (se §8) |
| DJI Care Refresh-produkt | Ifylld flikinnehåll | Textinnehåll | Trygghet | Medel | ⏳ Admin-åtgärd (se §8) |

---

## 6. Inte åtgärdat i denna omgång — kräver ett beslut

**Koppla in `service-support`- och `spare-parts`-menyerna i den aktiva Consumer-headern.** Detta är en ren temakodsändring (lägga till fler menyinställningar i `theme/sections/header-group.json` och rendera dem i `header.liquid`/mega-menyn), men rördes inte i den här omgången eftersom det är en synlig navigationsförändring med större blast radius än de punktfixar som gjorts (ändrar hela huvudmenyns struktur för alla besökare). Rekommenderas som nästa steg — hör av dig om du vill att jag går vidare med det.

---

## 7. Vad som ändrades i temakoden i denna session

Alla ändringar är i `theme/`, går via git till det opublicerade förhandsgranskningstemat, påverkar inte live-butiken direkt.

1. **`theme/snippets/edp-page-segment.liquid`** — rättade buggen där startsidan tvingades till `enterprise`-segmentet; sätter nu `consumer` (konsekvent med alla andra fallbacks i temat).
2. **`theme/templates/page.consumer.json`** + motsvarande presets i **`theme/sections/consumer-landing.liquid`** — alla collection-/sidlänkar omdirigerade från obefintliga handles (`consumer-drones`, `starter-kits`, `mini-flip`, `air-mavic`, `fpv`, `accessories`, `/pages/training`) till verifierade, riktiga handles (`drones-with-camera`, `starter-package`, `dji-mini-4-series`, `dji-mavic-3-series`, `dji-avata-series`, `drone-accessories`, `/pages/service-support`).
3. **`theme/templates/index.json`** — "Serviceportal"/"Utbildningsportal"-korten pekade på `#` (ingen länk konfigurerad); satte `/account` som verklig destination.
4. **`theme/sections/header-group.json`** — lade till den saknade `support_link`-inställningen (`/pages/service-support`); "Support"-etiketten renderades tidigare utan att länken någonsin visades.
5. **`theme/sections/footer-group.json`** — footer-0 pekade tidigare på samma tomma `footer`-meny som footer-1 (bokstavligt dubblettinnehåll under två rubriker). footer-0 pekar nu på `main-menu` (riktiga shop-kategorier), footer-1 kvar på `footer`-menyn men med tydligare rubrik ("Kundservice"). Slog även på `show_policy: true` så Shopifys nativa policy-länkar (retur/frakt/villkor, om ifyllda i Admin) syns.
6. **`theme/sections/edp-product-relations.liquid`** (ny sektion) — läser de redan existerande men tidigare oanvända metafields `custom.dronartillbehor`, `custom.reservdelar`, `custom.manual`, `custom.pdf` och renderar dem som "Tillbehör till denna produkt", "Reservdelar" och "Dokumentation & manualer". Wireas in **före** `related-products` i `product.drones.json`, `product.batteries.json`, `product.drone-accessories.json`, `product.drone-spare-parts.json`, `product.paket.json`, `product.service-plans.json` och generiska `product.json`. Renderar ingenting på produkter där fälten är tomma — ingen risk för tomma sektioner.
7. **`theme/snippets/edp-breadcrumbs.liquid`** (ny snippet) — synlig `<nav>`-breadcrumb (Hem → Kategori → Produkt/Sida), separat från den befintliga JSON-LD-varianten (`edp-seo-breadcrumbs.liquid`) som fortsätter att fungera oförändrad. Renderas i `main-product.liquid` och `main-collection-banner.liquid`.
8. **`theme/templates/product.drones.json`, `product.paket.json`** — ytterligare två döda `/pages/training`-länkar (i "Drönarkort & regler"-badges) omdirigerade till `/pages/service-support`.

Inga JSON-mallar bröts — samtliga validerade med `json.tool` efter ändring, och `{% schema %}`-blocket i `consumer-landing.liquid` validerades separat.

---

## 8. Kräver åtgärd i Shopify Admin (utanför denna sessions mandat)

Dessa är innehålls-/konfigurationsändringar på den **skarpa butiken**, medvetet inte utförda här (sessionen begränsades till temakod på användarens uttryckliga val):

1. **Publicera** sidorna `support`, `service-support`, `warranty-management`, `service-request`, `troubleshooting`, `calibration`, `firmware-update` — och fyll dem med riktigt innehåll (garantivillkor, returprocess, kontaktvägar). Idag är de tomma utkast.
2. **Fyll i** DJI Care Refresh-produktens (`product.service-plans.json`) 5 informationsflikar ("Det här täcker planen" osv.) — för närvarande helt tomma.
3. **Sätt metafield-värden** (`custom.dronartillbehor`, `custom.reservdelar`, `custom.manual`, `custom.pdf`) på fler produkter — den nya sektionen (§7.6) visar dem så fort de är ifyllda, men idag är det oklart hur många produkter som faktiskt har värden i dessa fält.
4. **Koppla in eller slå ihop** `service-support`- och `spare-parts`-menyerna i huvudnavigationen (kräver även en temakodsändring, se §6 — men vilken menystruktur som är rätt är ett innehålls-/UX-beslut som bör tas i Admin/produktledning först).
5. **Rensa/arkivera** de ~50 kvarvarande opublicerade ActionKing-sidorna (`cookies-actionking`, `dji-flip-faq`, `hoverair-drones` m.fl.) — gammalt varumärke, inte kopplat till något aktivt, men skräpar ner sidlistan i Admin.
6. **Konsolidera** `custom.passsar_till` (stavfel) och `custom.passar_till_marke_modell` till ett fält.
7. **Skapa faktiskt innehåll** för en "Kom igång"/guide-hubb — ingen sida eller collection för detta finns någonstans i butiken idag, konsument eller enterprise.

---

## 9. Slutlig Consumer-sitemap

Hierarkin nedan visar **vad som verkligen är live/verifierat** i butiken (✅), vad som är kopplat men opublicerat (⏳) och vad som saknas helt (❌).

```
Consumer (/pages/consumer)
├── Drönare
│   ├── DJI Mini (/collections/dji-mini-4-series) ✅
│   ├── DJI Air (/collections/dji-air-3-series) ✅
│   ├── DJI Mavic (/collections/dji-mavic-3-series) ✅
│   ├── DJI Flip (/collections/dji-flip-drones) ✅
│   ├── DJI Neo (/collections/dji-neo) ✅
│   ├── DJI Avata (/collections/dji-avata-series) ✅
│   └── Alla drönare (/collections/drones-with-camera) ✅
│       └── [Produktsida]
│           ├── Tillbehör (custom.dronartillbehor) ✅ (kräver ifyllda metafields)
│           ├── Reservdelar (custom.reservdelar) ✅ (kräver ifyllda metafields)
│           ├── Dokumentation (custom.manual/pdf) ✅ (kräver ifyllda metafields)
│           ├── Relaterade produkter (native) ✅
│           └── Breadcrumb → förälderkategori ✅
├── Tillbehör (/collections/drone-accessories) ✅
│   ├── Kontroller, Batterier, Filter, Väskor, Laddare, Landningsställ, Belysning ✅
├── Reservdelar (/collections/drone-spare-parts) ✅
│   ├── Efter komponenttyp (Electronics, Propellers, Gimbal m.fl.) ✅
│   └── Efter modell (spare-parts-menyn) ⏳ (finns, ej kopplad till Consumer-header)
├── Paket
│   └── Starter Package (/collections/starter-package) ✅
├── Kom igång ❌ (ingen sida existerar)
├── Guider & kunskap ❌ (FAQ/jämför-mallar finns men Enterprise-orienterat standardinnehåll)
├── Support & Service
│   ├── Service & Support-hubb (/pages/service-support) ⏳ opublicerad
│   ├── DJI Service (/pages/support) ⏳ opublicerad
│   ├── Garantihantering/RMA (/pages/warranty-management) ⏳ opublicerad
│   ├── Serviceanmälan (/pages/service-request) ⏳ opublicerad
│   ├── Felsökning (/pages/troubleshooting) ⏳ opublicerad
│   └── Kalibrering (/pages/calibration) ⏳ opublicerad
├── Kontakt (/pages/contact-us) ✅ publicerad
└── Kundkonto (/account) ✅
    └── Orderhistorik ✅ (ingen vidarelänk till support/guider ännu)
```

---

## 10. Prioriterad lista för nästa omgång

1. Koppla in `service-support`-menyn i Consumer-headern (temakod + Admin-beslut, §6)
2. Publicera och fyll support/garanti/service-sidorna i Admin (§8.1–8.2)
3. Fylla `custom.dronartillbehor`/`reservdelar`/`manual`/`pdf` på fler produkter så den nya sektionen faktiskt syns brett
4. Bygga en riktig "Kom igång"-guide och konsumentorienterat FAQ-innehåll
5. Konsolidera de två kompatibilitetsdatamodellerna och de två reservdelsstrukturerna
6. Bygga omvänd länk komponentprodukt → paket
