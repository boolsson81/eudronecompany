# Inköp → Mässor & Events

Ett inköpsverktyg för EU Drone Company, inte en eventkalender. Sidan ska svara på
fyra frågor i den ordningen:

1. Vilka mässor är värda att besöka?
2. Vilka leverantörer finns där, och vilka måste vi träffa?
3. Vad ska vi köpa, undersöka eller förhandla om?
4. Vad fick vi ut, och vad måste följas upp?

---

## 1. Var modulen hamnade — och varför det behöver läsas

Uppdraget beskriver menyn **Inköp** med sju poster: Inköpsdashboard, Leverantörer,
Produkter, Prisbevakning, EU Drone Company Ecosystem, Mässor & Events och Supplier
Opportunities.

Den här inventeringen gjordes innan något kodades:

| Yta | Var den faktiskt ligger |
|---|---|
| Inköpsmodulen (`Inköp`-sidan, 25+ komponenter under `components/purchases/`) | `boolsson81/digitalsignal` |
| Leverantörsregistret (`public.suppliers`, sidan `/suppliers`) | `digitalsignal` (tabellen är i den **delade** databasen) |
| Produkt- och lagerhantering, CRM, kalenderintegration | `digitalsignal` |
| AI-infrastruktur (Lovable AI Gateway, `_shared/aiUsageLog.ts`, Firecrawl) | `digitalsignal` |
| Alla 1 200+ migreringar | `digitalsignal` |
| EU Drone Companys egen frontend och driftsvyer | `boolsson81/eudronecompany` ← **det här repot** |

Prisbevakning, EU Drone Company Ecosystem och Supplier Opportunities finns inte i
någotdera repot i dag.

**Modulen byggdes i `eudronecompany`** eftersom uppdraget anvisade en utvecklingsgren
där. Det har två följder som är värda att fatta beslut om:

- **Menyn.** `AdminLayout` har fått en `Inköp`-grupp med Mässor & Events. De sex
  övriga posterna länkades medvetet inte — de bor i en annan app på en annan domän,
  och en död länk är sämre än ingen länk. Ska hela Inköp-menyn samlas på ett ställe
  är det ett separat beslut om vilken app som äger inköpsytan.
- **Databasen.** `AGENTS.md` slår fast att migreringar aldrig skapas här. Schemat
  ligger därför som ett förslag i
  [`docs/migrations/20260903120000_tradefair_events.sql`](migrations/20260903120000_tradefair_events.sql)
  och ska kopieras till `digitalsignal/supabase/migrations/` och köras därifrån.

## 2. Arkitektur: katalog i kod, planering i databas

Modulen har två lager, och det är ett medvetet val snarare än en kompromiss.

**Katalogen** (`src/data/tradeFairEvents.ts`) är kurerad referensdata: mässor,
kategorier, poängsättning, kostnadsbudget, källor. Den ligger i kod av samma skäl
som `droneRegulations.ts` och `enterpriseCameraProducts.ts` gör det — den ska
granskas i en diff innan den blir sanning, och den täcks av tester.

**Planeringen** (tabellerna i migreringen) håller allt inköparen skriver:
utställare, möten, agenda, inköpslista, kostnadsutfall, uppföljningar, rapport.

`src/lib/tradeFairCatalog.ts` slår ihop lagren. En rad i `tradefair_events`
kompletterar och åsidosätter katalogen fält för fält; tomma kolumner rör inte den
kurerade datan. Rader utan motsvarighet i katalogen (t.ex. mässor som AI Discover
hittar) läggs till som egna event.

Följden: **modulen fungerar innan migreringen körts.** Mässlistan, poängen,
filtren, kostnadsberäkningen och KPI-korten som går att härleda ur katalogen är
igång direkt. Saknas tabellerna svarar PostgREST `42P01`, och UI:t slår om till
läsläge med en banner i stället för att krascha.

### Filer

| Fil | Innehåll |
|---|---|
| `src/data/tradeFairTaxonomy.ts` | Kategorier, prioriteter, poängmodell, mötesmål, checklista, kostnadsslag, notifieringsschema, källpolicy |
| `src/data/tradeFairEvents.ts` | Mässkatalogen + `opportunityScore`, `totalEstimatedCost`, `upcomingEvents` |
| `src/lib/tradeFairCatalog.ts` | Sammanslagning katalog + databasrader (ren logik, testad) |
| `src/lib/tradeFairDb.ts` | Supabase-åtkomst, tabelltillgänglighet, leverantörsuppslag |
| `src/lib/tradeFairKpis.ts` | KPI-räkningen för dashboarden |
| `src/lib/tradeFairDates.ts` | Datumformat och nedräkning |
| `src/pages/admin/TradeFairs.tsx` | Dashboard + mässlista med sök och filter |
| `src/pages/admin/TradeFairEvent.tsx` | Eventprofil med åtta flikar |
| `src/components/tradefairs/` | Delade byggstenar och flikinnehåll |
| `docs/migrations/20260903120000_tradefair_events.sql` | Schemaförslaget |
| `scripts/__tests__/trade-fair-events.test.ts` | 27 tester över katalog, poäng, sammanslagning och KPI |

## 3. Opportunity Score

De åtta faktorerna är de som beställdes:

| Faktor | Vikt |
|---|---|
| Supplier relevance | 25 |
| Product relevance | 20 |
| Enterprise UAV relevance | 15 |
| Payload relevance | 10 |
| Reseller opportunities | 10 |
| Service opportunities | 5 |
| Networking | 5 |
| Geographic value | 5 |
| **Summa** | **95** |

**Vikterna summerar till 95, inte 100.** Det är inte rättat på egen hand — i
stället räknas råpoängen 0–95 och skalas till 0–100, så att kolumnen
`opportunity_score` betyder det den heter. Råpoängen visas bredvid i
poänguppdelningen. Vill man hellre ha 100 som rå summa behöver fem poäng läggas
på någon faktor, och det är ett beslut om viktning, inte om kod:
ändra `SCORE_FACTORS` i `tradeFairTaxonomy.ts` så följer allt annat med.

Poängen är **härledd, inte satt**. Varje mässa har en uppdelning per faktor som går
att ifrågasätta i eventprofilen. Relevanstalet ur uppdraget (`statedRelevance`)
sparades för spårbarhet, och ett test håller avvikelsen inom fem poäng.

## 4. Research Source Policy

Prioritetsordning för uppgifter som sparas som verifierade:

1. Arrangörens officiella webbplats
2. Officiell utställarkatalog
3. Officiellt konferensprogram
4. Arrangören direkt
5. Tillförlitlig branschkälla

AI får använda andra källor för att *hitta* mässor. Datum, plats och status ska
verifieras mot officiell källa innan de sparas som verifierade.

**Datum hittas aldrig på.** Är nästa upplaga inte officiellt annonserad står
`dateStatus: "tbc"` och `status: "unconfirmed"`, och listan visar «Datum TBC». Ett
test i `trade-fair-events.test.ts` misslyckas om en TBC-post får ett datum, och om
en post markeras `verified` utan namngiven källa.

### Verifieringsläge

Genomgången mot officiella källor gjordes 2026-09-03. Nio av fjorton mässor har
nu datum bekräftade av arrangören eller mässanläggningen.

| Mässa | Datum | Källa |
|---|---|---|
| INTERGEO 2026 | 15–17 sep 2026, Messe München | Messe München och DVW/INTERGEO |
| XPONENTIAL Europe 2027 | 16–18 mar 2027, Messe Düsseldorf | Arrangörens eventsida |
| IDEX | 25–29 jan 2027, ADNEC Centre Abu Dhabi | ADNEC Groups pressmeddelande och idexuae.ae |
| Drone Show Korea | 24–26 feb 2027, BEXCO Busan | eng.droneshowkorea.com |
| Dronitaly | 7–9 apr 2027, Bologna Congress Center | dronitaly.it |
| Paris Air Show | 14–20 jun 2027, Paris–Le Bourget | siae.fr |
| DSEI | 7–10 sep 2027, ExCeL London | dsei.co.uk |
| DroneX 2026 | 29–30 sep 2026, ExCeL London | ExCeL Londons kalender |
| Commercial UAV Expo (USA) | 1–3 sep 2026, Caesars Forum Las Vegas | Arrangörens eget meddelande |

Kvar att verifiera:

| Mässa | Läge |
|---|---|
| AUVSI XPONENTIAL | 17–20 maj 2027, Miami Beach enligt samstämmiga branschlistningar. `xponential.org` gick inte att nå härifrån — bekräfta innan resa bokas. |
| Eurosatory | Datum lämnat TBC med flit. Branschlistningar anger 19–23 jun 2028, men källpolicyn kräver COGES egen bekräftelse. |
| Amsterdam Drone Week | 2027 inte annonserat. Branschlistningar uppger att mässan går samman med Intertraffic Amsterdam 2028 (7–10 mar 2028) och att ingen 2027-upplaga är satt — obekräftat av RAI Amsterdam. |
| Drone World Congress | Identifierad som World UAV Federations mässa i Futian, samlokaliserad med Shenzhen International UAV Expo. 2027 är elfte upplagan; datum inte publicerade. |

### Commercial UAV Expo Europe är inställd

Arrangören Diversified Communications meddelade 2026-01-09 att **Commercial UAV
Forum ställs in** — Europaupplagan som skulle hållits 22–23 april 2026 på RAI
Amsterdam. Resurserna koncentreras till Las Vegas-upplagan. Ingen ersättare i
Europa är annonserad.

Uppdraget listade mässan som prioritet A. Den står nu som **D – Not Relevant**
med status **Inställd** och besöksbeslut **Åker inte**, och syns därmed inte i
huvudlistan. Posten är kvar med hela motiveringen, eftersom den förklarar varför
A-listan gick från fyra mässor till tre. Ett test håller inställda event ute ur
huvudlistan och ur besöksplanen.

Det europeiska inköpsbehovet får täckas av INTERGEO och XPONENTIAL Europe, eller
av Las Vegas-upplagan när sortimentet kräver de amerikanska tillverkarna.

### Prioritetsändringar mot uppdraget

| Mässa | Uppdraget | Nu | Varför |
|---|---|---|---|
| DroneX | A | B | Relevanstalet 85 hamnar i B-spannet, tillsammans med Dronitaly och de övriga 85-poängarna |
| Commercial UAV Expo Europe | A | D | Inställd av arrangören |

## 5. Faser

| Fas | Status |
|---|---|
| **1** Event database, dashboard, profil, sök, filter, prioritet, Opportunity Score, kategorier, seed | Klar och körbar utan databas |
| **2** Utställare, leverantörskoppling, mötesplanerare, agenda, inköpslista, kostnader | UI och datalager klara; kräver migreringen för att skriva |
| **3** Rapport, ROI, uppföljningar, kalenderintegration | Rapport, ROI och uppföljningar klara mot schemat. Kalenderexport är **förberedd, inte byggd** — `calendar_provider`, `calendar_event_id` och `calendar_synced_at` finns i `tradefair_meetings`, men uppdraget säger uttryckligen att integrationen inte ska byggas förrän befintlig arkitektur analyserats. Notifieringar likaså: schemat 30/14/7/1 dagar före och 1/7/14/30 efter finns i taxonomin och visas i UI:t, men inget skickas. |
| **4** AI Event Discovery, AI Event Research, AI Exhibitor Research, AI Recommendation | **Arkitektur, inte funktion.** Knapparna finns inaktiverade, `research_payload` finns i schemat. Ingen AI-funktion är skriven — se nedan. |

### Varför fas 4 inte byggdes klart

AI-infrastrukturen ligger i DigitalSignal: Lovable AI Gateway (`LOVABLE_API_KEY`,
OpenAI-kompatibelt), `_shared/aiUsageLog.ts` för kostnadsloggning och Firecrawl för
webbresearch. Inget av det är speglat hit, och `docs/EXTRACTION_MANIFEST.md`
reglerar vilka `_shared`-moduler som får dupliceras.

En AI-funktion som *gissar* mässdatum vore dessutom direkt i strid med källpolicyn
ovan. Vägen framåt, när det byggs:

1. Ny edge function `tradefair-research` i det här repot, deployad mot samma
   Supabase-projekt via `.github/workflows/deploy-functions.yml`.
2. Anropar gatewayen via en kopia av `callLovableAiGateway` — läggs till i
   duplicerings­listan i extraktionsmanifestet så `npm run check:shared` fångar drift.
3. Skriver aldrig direkt till `tradefair_events`. Resultatet landar i
   `research_payload` med `verification: "needs-review"`, och en människa
   godkänner innan det blir katalogdata.
4. Rekommendationsmotorn (§27 i uppdraget) läser sortiment, leverantörer och
   inköpslista och returnerar Must Attend / Recommended / Optional / Skip **med
   motivering** — samma poängmodell som redan finns, men med portföljen som indata.

## 6. Det som medvetet lämnades ogjort

- **Event Map och Supplier Map.** Hall, monter och land finns i schemat och i UI:t,
  men ingen kartrendering är byggd. Det kräver ett kartbibliotek som repot inte har
  och venue-planer som arrangörerna inte publicerar maskinläsbart.
- **Kalenderintegration.** Se fas 3 — uttryckligen avvaktat enligt uppdraget.
- **Notifieringar.** Schemat finns, utskicket saknas: det behöver ett cron-jobb i
  det delade Supabase-projektet, vilket koordineras från DigitalSignal.
- **De sex övriga Inköp-menyposterna.** Se § 1.

## 7. Innan modulen tas i drift

1. Kopiera migreringen till `digitalsignal/supabase/migrations/` och kör den.
2. Verifiera att `EDP_SHOP_ID` (`e6ad2afc-…`) är rätt butik för inköparnas RLS.
3. Bekräfta de fyra kvarvarande posterna i tabellen ovan: AUVSI XPONENTIAL mot
   `xponential.org`, Eurosatory mot COGES, Amsterdam Drone Week mot RAI Amsterdam,
   och Drone World Congress mot `droneworldcongress.com`.
4. Stäm av INTERGEO:s utställarkandidater mot den officiella utställarkatalogen —
   de är kvalificerade gissningar, inte hämtade ur katalogen.
5. Bekräfta kostnadsbudgeten. Siffrorna är planeringsvärden i EUR per person, inte
   offerter.
