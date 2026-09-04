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
  ligger därför i DigitalSignal, som
  `supabase/migrations/20260903220000_tradefair_events.sql`, och körs därifrån.
  Kopian i [`docs/migrations/`](migrations/20260903220000_tradefair_events.sql) är
  en spegling så att schemat går att läsa bredvid koden — DigitalSignal är källan.

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
| `src/lib/tradeFairRecommendation.ts` | «Bör vi åka?» — omdöme, skäl och invändningar |
| `src/lib/tradeFairResearch.ts` | Guarden mellan AI-researchen och katalogen |
| `supabase/functions/tradefair-research/` | Edge-funktionen som äger prompten och anropar gatewayen |
| `src/lib/tradeFairDates.ts` | Datumformat och nedräkning |
| `src/pages/admin/TradeFairs.tsx` | Dashboard + mässlista med sök och filter |
| `src/pages/admin/TradeFairEvent.tsx` | Eventprofil med åtta flikar |
| `src/components/tradefairs/` | Delade byggstenar och flikinnehåll |
| `docs/migrations/20260903220000_tradefair_events.sql` | Spegling av schemat; källan ligger i DigitalSignal |
| `scripts/__tests__/trade-fair-events.test.ts` | Tester över katalog, poäng, sammanslagning och KPI |
| `scripts/__tests__/trade-fair-recommendation.test.ts` | Tester över sourcingkartan och rekommendationsreglerna |
| `scripts/__tests__/trade-fair-research.test.ts` | Tester över guarden: datum, taxonomi, länkar och rådata |

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
| **4** AI Event Discovery, AI Event Research | **Byggd.** Edge-funktionen `tradefair-research` letar, guarden i `tradeFairResearch.ts` granskar, inköparen godkänner. Se nedan. |
| **4** AI Exhibitor Research | Ligger i researchanropet som `relevantExhibitors`, men skrivs inte till `tradefair_exhibitors` — utställarlistan ska stämmas av mot den officiella katalogen först. |
| **4** Automatiserad mässbevakning | Inte byggd. Kräver ett cron-jobb i det delade Supabase-projektet, vilket koordineras från DigitalSignal. |
| **4** Rekommendationsmotor (§ 27) | **Byggd, men regelbaserad — inte en modellfråga.** Se nedan. |

### Rekommendationsmotorn är regelbaserad med flit

Uppdraget kallar § 27 för en AI-motor. Den är byggd som explicita regler i
`src/lib/tradeFairRecommendation.ts`, och det är ett medvetet avsteg.

Ett inköpsbeslut som kostar en resa, tre dagar och en kalender full av möten ska
gå att ifrågasätta rad för rad. Uppdraget kräver dessutom att motiveringen alltid
följer med (*«Förklara alltid varför»*), och en regel som säger vad den gör är
ett bättre svar på det än en modell som sammanfattar i efterhand. En AI-variant
kan senare förfina bedömningen — men då mot den här stegen som utgångsläge.

Motorn läser bara sådant vi vet: poängen, datumet, kostnaden, statusen och vilka
sourcingbehov mässans ämnesområden täcker. Den gissar aldrig om utställarlistan.

| Steg | Regel |
|---|---|
| Utgångsläge | Opportunity Score: ≥ 90 Must Attend, ≥ 75 Recommended, ≥ 60 Optional, annars Skip |
| Hårt utfall | Inställd eller redan genomförd mässa blir Skip utan vägning |
| Sourcingtäckning | Två strategiska behov höjer ett steg — men aldrig till Must Attend, och aldrig under 70 poäng |
| Obekräftat datum | Sänker ett steg. Går inte att budgetera eller boka möten till |
| Kort varsel | Under sju dagar sänker ett steg. Under 21 dagar en varning |
| Kostnadstak | Över taket sänker ett steg |
| Verifiering | Ej verifierade uppgifter ger en varning, inte en sänkning |

**Strategiskt eller förbrukningsvara.** `SOURCING_GAPS` märker varje behov. Första
utkastet lät alla behov väga lika, och då fick varje drönarmässa fem träffar —
batterier, propellrar och gimbaler finns på ämnet «Drone Technology», som alla
har. Signalen blev värdelös och Drone Show Korea på 65 poäng klättrade till
Recommended. Nu väger bara det som kräver att man träffar tillverkaren:
enterprise-LiDAR, termik, RTK, tunglyft och dockor.

**Taket på höjningen** finns av samma skäl. DroneX täcker två strategiska behov
och har 85 poäng, men stannar på Recommended. Must Attend ska poängen bära själv,
annars klättrar en medelmåttig mässa hela vägen på generisk drönartäckning. Med
katalogen som den ser ut i dag får bara INTERGEO och XPONENTIAL Europe Must Attend
— de två bekräftade A-mässorna.

Omdömet syns som en egen kolumn i listan, är sorterings- och filtrerbart, och
ligger med hela motiveringen överst på eventprofilen.

### AI-researchen: modellen letar, människan godkänner

Uppdraget ville att AI ska kunna hitta nya mässor (§ 16) och fördjupa en befintlig
(§ 17). Båda finns nu, men flödet är byggt så att modellen aldrig kan skriva något
till katalogen på egen hand.

| Led | Var | Vad det gör |
|---|---|---|
| Anropet | `supabase/functions/tradefair-research/` | Äger prompten, kräver butiksåtkomst, anropar Lovable AI Gateway och loggar förbrukningen |
| Guarden | `src/lib/tradeFairResearch.ts` | Granskar svaret fält för fält och tvingar in det i källpolicyn |
| Godkännandet | `ResearchDialog` | Visar fynden, vad guarden kastade och vilken källa som påstås. Inköparen trycker spara |

**Prompten bor i funktionen, inte hos klienten.** En funktion som vidarebefordrar
fritt formulerade meddelanden till gatewayen är både en injektionsyta och ett sätt
att bränna delade AI-krediter på annat än mässresearch. Klienten skickar bara
`action`, en sökfråga och kända fakta om mässan.

**Guarden är den som faktiskt skyddar katalogen**, och den ligger därför i testad
frontend-kod i stället för i en Deno-funktion som testsviten inte når. Den:

- sätter alltid `verification: "needs-review"` — modellen får inte verifiera sig själv,
  inte ens när den påstår `verified`;
- kastar varje datum som inte är ISO-format, som slutar innan det börjar, eller som
  modellen inte själv kallar bekräftat;
- kastar kategorier och ämnen utanför taxonomin, så att filtren fortsätter fungera
  och ett påhittat begrepp inte tyst blir ett nytt;
- kastar webbadresser som inte är http(s);
- redovisar allt den kastade i `dropped`, som visas för granskaren.

Ett sparat fynd blir prioritet **C**, status **Obekräftad** och besöksbeslut
**Övervägs**, med rådata kvar i `research_payload`. Det är en kandidat att granska,
inte en mässa vi bestämt något om.

**Behörighet och kostnad.** Funktionen kräver inloggning (`verify_jwt` är på) och
att användaren har butiken via `user_shops` — krediterna delas med DigitalSignal
och ska inte gå att spendera av vem som helst i det gemensamma projektet. Varje
anrop loggas i `ai_usage_log` via den speglade `_shared/aiUsageLog.ts`, som därmed
också står i `npm run check:shared`.

**Kräver `LOVABLE_API_KEY`** som hemlighet i Supabase-projektet, samma nyckel som
DigitalSignals 147 andra AI-anrop använder. Saknas den svarar funktionen 500 med
det beskedet i klartext.

## 6. Det som medvetet lämnades ogjort

- **Event Map och Supplier Map.** Hall, monter och land finns i schemat och i UI:t,
  men ingen kartrendering är byggd. Det kräver ett kartbibliotek som repot inte har
  och venue-planer som arrangörerna inte publicerar maskinläsbart.
- **Kalenderintegration.** Se fas 3 — uttryckligen avvaktat enligt uppdraget.
- **Notifieringar och automatiserad mässbevakning.** Schemat finns, utskicket
  saknas: båda behöver cron-jobb i det delade Supabase-projektet, vilket
  koordineras från DigitalSignal.
- **AI-skrivna utställarlistor.** Researchen returnerar `relevantExhibitors`, men
  de skrivs inte till `tradefair_exhibitors`. En utställarlista som inte är hämtad
  ur den officiella katalogen ska inte kunna se hämtad ut.
- **De sex övriga Inköp-menyposterna.** Se § 1.

## 7. Avstämning mot databasen 2026-09-03

Läsande kontroll mot `digitalsignal-prod` (`jzqgwsryxmgzcbjjddic`).

**Butiks-id:t stämmer.** `e6ad2afc-e468-49a7-8d33-9b1837419ed8` är butiken
«European Drone Company» under tenanten «Eu Drone Company». RLS-scopingen i
migreringen träffar därmed rätt, och `loadSuppliers()` läser rätt register.

**Mässtabellerna finns inte.** Ingen tabell med prefixet `tradefair_` existerar,
vilket är precis vad UI:ts läsläge bygger på. Migreringen är alltså fortfarande
det som blockerar drift.

**Leverantörsregistret bekräftar inköpstesen.** Sex aktiva leverantörer:

| Leverantör | Roll |
|---|---|
| ALSO Sweden AB | Distributör |
| Boston Group | Distributör |
| INNPRO | Distributör (B2B) |
| Solectric GmbH | Distributör |
| Sunsky | Sourcingagent, Kina |
| WISSON INTL. LTD. | Sourcingagent, Kina |

Ingen av dem är tillverkare av de payloads sortimentet behöver. Alla enterprise-
sensorer köps i dag genom ett mellanled eller en agent, vilket är exakt den lucka
mässorna ska stänga: INTERGEO och XPONENTIAL Europe är de två ställen där
YellowScan, RIEGL, GeoCue och motsvarande går att träffa direkt. Det motiverar
också varför Supplier relevance väger tyngst i poängmodellen.

Observera att sifferkolumnen «New Suppliers» på dashboarden räknar utställare
utan koppling till registret. Med bara sex leverantörer inlagda kommer nästan
varje utställare att räknas som ny tills registret fyllts på.

### Vad som inte gick att verifiera

**Arrangörssidorna går inte att nå härifrån.** Miljöns nätverkspolicy blockerar
dem, och det gäller all utgående trafik — inte bara hämtverktyget. Kontrollerat
med direktanrop: `eurosatory.com`, `amsterdamdroneweek.com`,
`droneworldcongress.com`, `xponential.org` och `dvw.de` svarar inte alls, och
`intergeo.de` och `expouav.com` blockeras likaså.

Det sätter en gräns för hur långt verifieringen kan drivas i den här miljön. De
uppgifter som står som `verified` kunde beläggas via sökresultat som citerade
arrangörens egen sida; de fyra nedan kräver att någon öppnar sidan.

| Kontrollera | Adress | Vad som saknas |
|---|---|---|
| AUVSI XPONENTIAL | `xponential.org` | Bekräfta 17–20 maj 2027, Miami Beach Convention Center |
| Eurosatory | `eurosatory.com` | Datum för 2028. Uppgivet 19–23 juni, ej bekräftat |
| Amsterdam Drone Week | `amsterdamdroneweek.com` | Finns en 2027-upplaga, eller går mässan upp i Intertraffic Amsterdam 2028? |
| Drone World Congress | `droneworldcongress.com` | Datum för elfte upplagan 2027 |
| INTERGEO:s utställarlista | `dvw.de/intergeo/en/visit/exhibitor-list` | Stäm av de sju utställarkandidaterna |

De sju kandidaterna på INTERGEO är alltså fortfarande kvalificerade gissningar,
markerade som sådana i UI:t. Punkt 4 nedan står kvar.

**Biljettpriser.** INTERGEO säljer separata expo-, konferens- och kombibiljetter,
och utställare delar ut fria tredagarskoder. Budgetens 100 EUR är rimlig för en
expobiljett men bör nollas om en utställarkod finns. Kontrollera innan resa bokas.

## 8. Innan modulen tas i drift

1. Merga migreringen i DigitalSignal (`claude/tradefair-events-schema`) och kör
   `supabase db push`. Versionen `20260903220000` ligger efter `20260903210000`,
   som är den senast bokförda i prod, så den tas i ordning.
2. ~~Verifiera att `EDP_SHOP_ID` är rätt butik för inköparnas RLS.~~ Klart, se § 7.
3. Bekräfta de fyra kvarvarande posterna i tabellen ovan: AUVSI XPONENTIAL mot
   `xponential.org`, Eurosatory mot COGES, Amsterdam Drone Week mot RAI Amsterdam,
   och Drone World Congress mot `droneworldcongress.com`.
4. Stäm av INTERGEO:s utställarkandidater mot den officiella utställarkatalogen —
   de är kvalificerade gissningar, inte hämtade ur katalogen.
5. Bekräfta kostnadsbudgeten. Siffrorna är planeringsvärden i EUR per person, inte
   offerter.
6. **Sätt deployhemligheterna. Det här blockerar AI-researchen just nu.** Första
   körningen av `deploy-functions.yml` (2026-09-04) föll direkt med *«Access token
   not provided»* — både `SUPABASE_ACCESS_TOKEN` och `SUPABASE_PROJECT_REF` är
   tomma i repots Actions-inställningar, precis som `AGENTS.md` förutspådde.
   Arbetsflödet avbryter på första funktionen, så **ingen** edge-funktion
   deployas härifrån. Tills det är åtgärdat svarar AI-knapparna «AI-researchen är
   inte deployad ännu».
7. Kontrollera att `LOVABLE_API_KEY` finns som hemlighet i Supabase-projektet.
   Saknas den svarar funktionen 500, och UI:t säger vilken nyckel som fattas.
