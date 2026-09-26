# EDC Collection Engine — generisk Collection Builder

**Datum:** 2026-09-26
**Relaterat:** [DJI_FILTER_SETUP.md](./DJI_FILTER_SETUP.md) (samma mönster, generaliserat till alla produktfamiljer)

---

## 0. Sammanfattning

Temat (`theme/`) är Shopify Dawn-baserat. Dawns egna filtermotor — Shopify
**Search & Discovery** plus `snippets/facets.liquid` — är redan en fullt
generisk collection-filtermotor: den läser `collection.filters` (typ, label,
param_name, värden, antal) och renderar dem utan att något produktnamn,
varumärke eller filternamn är hårdkodat. Det here arbetet **bygger vidare på**
den motorn istället för att ersätta den, och fyller bara i de luckor som
uppgiften pekade på: filtergrupper, ett generiskt guidat filter, per-collection
förvalt filter, en tablet-brytpunkt för layout, samt ikon/CTA/brödsmula i
collection-headern.

Ingen ny admin-app byggdes. Inga metafield- eller metaobject-definitioner
skapades i den skarpa butiken — allt nytt är tema-kod (git, reversibelt) plus
dokumentation av hur man använder befintliga Shopify Admin-ytor
(Search & Discovery, Custom data, Theme Editor).

---

## 1. Vilka befintliga funktioner som återanvändes

- **Shopify Search & Discovery** — hela filtermotorn (typer `list`/`boolean`/
  `price_range`, presentation `text`/`swatch`/`image`, räknade värden,
  AND/OR-operator, prisintervall). Ingen del av detta byggdes om.
- **`snippets/facets.liquid` / `snippets/price-facet.liquid`** — all rendering
  av enskilda filter, mobilvy, drawer-vy, aktiva filter-pillar, "rensa alla".
  Endast desktop/horisontell-loopen bröts ut till en egen snippet (se nedan).
- **`facets.js`** — AJAX-rendering, `history.pushState`/`popstate`, cache av
  redan hämtade filterkombinationer. Orörd.
- **`templates/collection.json` / `collection.drones.json`** — mönstret med
  en generisk JSON-mall + collection-specifika sektionsinställningar är
  precis "Collection Configuration" från uppgiften och återanvänds rakt av.
- **`canonical_url`** (Shopifys globala objekt) — SEO för filterkombinationer.
- **`edp-seo-breadcrumbs.liquid` / `edp-seo-collection.liquid`** — osynlig
  JSON-LD för breadcrumb och CollectionPage, orörda och kompletterar den nu
  tillagda synliga breadcrumben.
- **Befintliga `edp.*`- och `dji.*`-metafields** (se punkt 4) och
  metaobjects (`uav_platform`, `payload_category`, `mission`,
  `payload_compatibility`) — inget nytt behövdes för att exemplifiera
  filtergrupper eller default-overrides.
- **Mönstret i `docs/reports/DJI_FILTER_SETUP.md`** — generaliserat i det här
  dokumentet till alla produktfamiljer istället för att uppfinnas på nytt.

---

## 2. Ändrade filer

| Fil | Ändring |
|---|---|
| `theme/snippets/facets.liquid` | Desktop/horisontell filterloop ersatt med grupperingslogik (bakåtkompatibel — identiskt beteende när inga `filter_group`-block finns) |
| `theme/sections/main-collection-product-grid.liquid` | Skickar `filter_groups` till facets, ny `filter_group`-blocktyp, ny `columns_tablet`-inställning + CSS-klass, ny default-filter-override-script |
| `theme/sections/main-collection-banner.liquid` | Nya inställningar: `show_breadcrumbs`, `icon`, `cta_label`/`cta_url` |
| `theme/assets/component-facets.css` | Stil för `.facets__group` / `.facets__group-heading` |
| `theme/assets/template-collection.css` | Ny tablet-brytpunkt (750–989px) för produktgrid-kolumner |
| `theme/assets/component-collection-hero.css` | Stil för breadcrumb, ikon, CTA i collection-headern |

## 3. Nya filer

| Fil | Syfte |
|---|---|
| `theme/snippets/facets-filter-item.liquid` | Per-filter-rendering (list/boolean/price_range), utbruten ur `facets.liquid` för återanvändning i både grupperad och platt vy |
| `theme/sections/collection-finder.liquid` | Generisk guidad filter-sektion (product finder) — steg/etiketter/värden är theme-editor-block, ingen hårdkodad vokabulär |
| `theme/assets/collection-finder.js` | Wizard-logik: kedjar filterval, hämtar riktiga antal från målcollectionen för att gråa ut alternativ som ger 0 träffar, landar på en riktig filtrerad collection-URL |
| `theme/assets/collection-finder.css` | Stil för guidat filter |
| `docs/reports/EDC_COLLECTION_ENGINE.md` | Den här rapporten |

Inga befintliga filer togs bort. `sections/edp-payload-finder.liquid` (det
produktspecifika payload-guidet) lämnades orört — det är en egen, redan
fungerande modul och ska inte skrivas om till det generiska `collection-finder`
utan uttrycklig begäran.

---

## 4. Metafields som används (redan existerande, inga nya skapade)

| Namespace.key | Typ | Exempel på användning |
|---|---|---|
| `edp.sensor_type`, `edp.sensor_resolution`, `edp.optical_zoom`, `edp.digital_zoom`, `edp.thermal_resolution` | text/number | Filter för "Kameror & Payloads" |
| `edp.weight`, `edp.ip_rating`, `edp.lidar_range` | number/text | Filter för "Drönare" / "Payloads" |
| `edp.enterprise_product`, `edp.professional_grade` | boolean | Filter "Enterprise / Consumer" |
| `edp.compatible_uav` | list.metaobject_reference → `uav_platform` | Kompatibilitetsfilter, kompatibilitetspanel på produktsidan |
| `edp.compatibility_records` | list.metaobject_reference → `payload_compatibility` | Detaljerad kompatibilitetsstatus (fully_compatible osv.) |
| `dji.compatible_models_display`, `dji.series`, `dji.accessory_type` | list/text | Filter för DJI-reservdelar/tillbehör (se `DJI_FILTER_SETUP.md`) |
| `custom.default_filter_query` (**ny, valfri, skapas av admin vid behov**) | single_line_text | Collection-specifik förvald filtrering (punkt 20), läses av `main-collection-product-grid.liquid` |

Ingen av dessa metafields skapades eller ändrades av det här arbetet —
`custom.default_filter_query` är dokumenterad här som en **valfri** definition
en admin kan skapa i Shopify Admin → Custom data → Collections när funktionen
ska användas; är den inte skapad är hela mekanismen ett no-op.

## 5. Metaobjects som används (redan existerande)

`uav_platform`, `payload_category`, `mission`, `payload_compatibility`,
`solution_package` — alla orörda. Det generiska guidade filtret
(`collection-finder.liquid`) använder **inte** metaobjects för sin
konfiguration (för att undvika att behöva skapa nya definitioner i den
skarpa butiken) utan hämtar steg/alternativ direkt från theme-editor-block.
Vill man senare driva flera guider från en delad datakälla går det bra att
byta ut blockens `options`-textarea mot en loop över ett metaobject — se
avsnitt 15.

---

## 6. Hur filterdefinitionerna fungerar

Filtermotorn är och förblir Shopify Search & Discovery:

1. Ett metafield (eller tag, pris, lagerstatus) markeras **filtrerbart** i
   Shopify Admin → Inställningar → Anpassad data.
2. Filtret läggs till i **Online Store → Sök & upptäckt → Filter**, med
   etikett, ordning och vilka collections det ska gälla på.
3. Temat gör inget annat än att rendera `collection.filters` som Shopify
   Admin redan har byggt — `type` (list/boolean/price_range) och
   `presentation` (text/swatch/image) styr helt hur filtret ser ut, utan
   någon `if`-sats per filternamn i koden.

Det här är samma tre steg som redan är dokumenterade för DJI i
`DJI_FILTER_SETUP.md`, men gäller för **vilket filtrerbart fält som helst** —
reservdelar, batterier, kameror, framtida produktkategorier.

## 7. Hur en ny collection konfigureras

1. Skapa collection i Shopify Admin som vanligt (manuell eller automatisk).
2. Välj mall `collection` (den generiska `templates/collection.json`) —
   eller en variant om collectionen behöver extra sektioner
   (`collection.drones.json` är ett exempel: samma product-grid-sektion +
   generiska Dawn-sektioner för köpguide/FAQ).
3. I Theme Editor, på `product-grid`-sektionen, sätt:
   - `enable_filtering`, `filter_type` (horizontal/vertical/drawer),
     `enable_sorting`
   - `columns_desktop`, `columns_tablet` (valfri), `columns_mobile`
   - `show_compatibility`, `show_vendor`, `quick_add` osv.
4. I **Sök & upptäckt**, välj vilka filter som ska gälla för just den
   collectionen och i vilken ordning (native Shopify-funktion — ingen kod).
5. Lägg valfritt till `filter_group`-block på samma sektion för att gruppera
   filtren under rubriker (se punkt 8).
6. Lägg valfritt till sektionen **Guidat filter** (`collection-finder`) om
   collectionen ska ha en produktguide.
7. Justera `banner`-sektionen: beskrivning, bild, ikon, CTA, brödsmula.

Ingen av dessa steg kräver en utvecklare eller en kodändring per collection.

## 8. Hur ett nytt filter skapas

Exakt samma tre steg som i avsnitt 6. Vill man dessutom placera det nya
filtret i en grupp i sidopanelen:

1. Öppna `product-grid`-sektionen i Theme Editor.
2. Lägg till ett block av typen **Filtergrupp**.
3. Ange en rubrik (t.ex. "Specifikationer") och en kommaseparerad lista med
   filtrets exakta `param_name` (synligt i webbadressen när filtret används,
   eller i Sök & upptäckt-förhandsgranskningen), t.ex.
   `filter.p.m.custom.sensor_type,filter.p.m.custom.thermal`.
4. Filter som inte läggs i någon grupp visas ändå, samlade sist ("Fler
   filter") — inget filter kan av misstag försvinna genom att grupperingen
   glöms bort.

Grupperingen gäller idag desktop/horisontell sidopanel (den layout som visas
i uppgiftens exempel #11). Mobil- och drawer-vyn visar fortfarande en platt
lista (se begränsningar, avsnitt 14).

## 9. Hur samma filter återanvänds i flera collections

Ett filter (t.ex. `edp.compatible_uav` eller `dji.series`) är en enda
definition i Shopify Admin. Att aktivera det på fler collections är att
lägga till det i Sök & upptäckt för respektive collection — ingen
kodduplicering, och ändras filtrets etikett eller värdemängd uppdateras det
överallt samtidigt eftersom det är en och samma definition.

## 10. Hur collection-specifika overrides fungerar

Två olika mekanismer, beroende på om overriden ska vara absolut eller bara
ett förval:

- **Absolut (produkter alltid begränsade)** — rekommenderat, 100 % nativt:
  gör collectionen till en automatisk (smart) collection med ett villkor på
  t.ex. `compatible_model = Matrice 350 RTK`. Kräver ingen tema-kod.
- **Förval (produkter kvar, men ett filter förifyllt)** — ny mekanism:
  skapa metafältet `custom.default_filter_query` på collectionen med värdet
  av querysträngen, t.ex.
  `filter.p.m.custom.compatible_model=Matrice+350+RTK`. Landar besökaren på
  collectionen utan egen filtrering i URL:en, omdirigerar
  `main-collection-product-grid.liquid` (progressiv förbättring, JavaScript)
  till samma URL med filtret tillagt. En delad eller tillbakaknappad
  filtrerad länk skrivs aldrig över. Utan JavaScript visas hela collectionen
  ofiltrerad — därför är den automatiska collection-regeln förstahandsvalet
  när begränsningen ska vara garanterad.

## 11. Hur SEO hanteras

- `canonical_url` (Shopifys globala objekt) pekar redan automatiskt på den
  ofiltrerade collection-URL:en så fort filterparametrar finns i
  querysträngen — filterkombinationer kan alltså inte bli dubblettindexerade
  av misstag, utan att någon kod behövde skrivas.
- `collection.metafields.seo.faq_json`, sidans egna SEO-titel/beskrivning
  (Shopify Admin) och `edp-seo-collection.liquid`/`edp-seo-structured-data.liquid`
  (CollectionPage- och BreadcrumbList-JSON-LD) återanvänds oförändrade.
- Vill man **medvetet** göra en specifik filterkombination indexerbar som en
  egen landningssida (t.ex. "DJI-reservdelar") är standardrekommendationen
  fortfarande en riktig, separat collection (automatisk eller manuell) med
  egen SEO-titel/beskrivning — inte en filtrerad URL. Det hölls utanför den
  här leveransen eftersom det är ett innehålls-/struktur­beslut per
  produktfamilj, inte en temafunktion.

## 12. Hur URL-state fungerar

Oförändrat, native Dawn/Shopify-beteende: varje filterval uppdaterar
querysträngen via `history.pushState`, bakåt/framåt-knappen läses av
`popstate`, och länken är delbar och laddningsbar direkt (servern renderar
samma filtrerade resultat för samma URL). Det guidade filtret
(`collection-finder`) landar besökaren på precis en sådan vanlig, delbar
filtrerad URL efter sista steget — det introducerar inget eget URL-schema.

## 13. Hur systemet fungerar på mobil

- Filtrering/sortering: Dawns befintliga drawer/`mobile-facets`-gränssnitt
  (oförändrat) — "Filtrera"-knapp öppnar ett fullskärmspanel.
- Filtergrupper (avsnitt 8) renderas i dagsläget **inte** i mobilvyn (se
  begränsningar) — mobilanvändare ser samma platta filterlista som idag.
- Det guidade filtret (`collection-finder`) är responsivt (flex-wrap-knappar,
  ingen sidopanel) och fungerar identiskt på mobil och desktop.
- Default-filter-overriden (avsnitt 10) fungerar identiskt på mobil eftersom
  den bara är en klientsidesomdirigering.

## 14. Begränsningar i Shopify / i den här leveransen

- Sök & upptäckt-konfiguration (vilka filter som gäller per collection, i
  vilken ordning) är helt admin-sidan och kan inte läsas eller verifieras
  från tema-kod eller Admin GraphQL på ett tillförlitligt sätt — den här
  rapporten kan bara dokumentera *processen*, inte inspektera den aktuella
  konfigurationen i butiken.
- Filtergrupper gäller idag bara desktop/horisontell sidopanel, inte
  mobil-drawern — en medveten avgränsning för att hålla ändringen i
  `facets.liquid` liten och riskfri (den snippeten delas med sökresultatsidan).
- Default-filter-overriden är en klientsidesomdirigering, inte en
  serverstyrd 301 — det påverkar inte SEO negativt (canonical pekar redan på
  den rena URL:en) men ger ingen förfiltrering till besökare utan JavaScript
  eller till crawlers.
- Det guidade filtret räknar bort nollträff-alternativ genom att hämta hela
  målcollectionens HTML en gång per steg och läsa av de riktiga antalen —
  robust och enkel, men något tyngre än ett dedikerat API-anrop skulle vara.
- "Filter presets" (uppgiftens punkt 18, återanvändbara namngivna
  filteruppsättningar över flera collections) byggdes inte som en egen
  mekanism — Sök & upptäckts egna filterdefinitioner *är* redan
  återanvändbara på det sättet (samma definition, flera collections), men
  ett namngivet "paket" av flera filter i ett klick finns inte nativt och
  byggdes inte här (se nästa steg).
- Ingen ny metafield- eller metaobject-definition skapades i den skarpa
  butiken under det här arbetet.

## 15. Vad som bör byggas i nästa steg

1. **Filtergrupper i mobilvyn** — samma gruppering som desktop, applicerad på
   `mobile-facets__main`-loopen i `facets.liquid`.
2. **Filter-presets** — ett litet Shopify-metaobject `filter_preset`
   (lista av param_names) som `filter_group`-blocken kan referera till med
   ett handle istället för att skriva om samma lista manuellt på varje
   collection.
3. **Data-driven guidad filter** — byt `collection-finder`s
   textarea-baserade steg mot en loop över ett metaobject, så flera guider
   kan dela samma taxonomi (liknande hur `edp-payload-finder.liquid` redan
   använder `uav_platform`/`payload_category`).
4. **Riktiga SEO-landningssidor för populära filterkombinationer** —
   identifiera vilka kombinationer (t.ex. per varumärke) som förtjänar en
   egen collection med egen SEO-text, separat från den generiska
   filtermotorn.
5. **Automatiserad regressionstestning** av `facets.liquid`/
   `facets-filter-item.liquid` mot sökresultatsidan (`main-search.liquid`)
   efter framtida ändringar, eftersom snippeten delas mellan collection och
   sök.
