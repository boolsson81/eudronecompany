# Varumärkestäckning Enterprise — 2026-09-10

Vilka varumärken som krävs för ett heltäckande enterprise-sortiment: drönare,
payloads, tillbehör och reservdelar. Underlag för inköps- och taxonomibeslut.

## Kortsvaret

**Tyngdpunkten ligger på payload- och säkerhetsmärken ovanpå DJI. Men
flygplattformarna behöver också en plan — bara inte i form av en hylla full av
konkurrerande drönare.**

DJI täcker flygplattform, gimbalkameror, batterier och reservdelar. Det DJI inte
gör — och som kunden idag måste gå till en konkurrent för — är fallskärm/FTS,
gasdetektion, industriell termografi, tether, mät-LiDAR i survey-klass,
RTK-basstationer, väskor och fältström. Varje sådan lucka är en förlorad affär på
en drönare vi redan har på hyllan.

På plattformssidan gäller en annan logik, som utvecklas under
[Drönare — flygplattformar](#drönare--flygplattformar): ett lagerfört
alternativ, ett par offertvaror som säljs tillsammans med DJI snarare än
istället för, och undervattens-ROV som närliggande segment. Varje ytterligare
lagerförd plattform kostar ett eget reservdelslager och en egen servicekedja.

**Och innan något av det: 107 icke-DJI-artiklar ligger redan i databasen med
inköpspris från en distributör vi redan handlar av, opublicerade.** CZI,
Wingtra, Parrot, Pix4D, Tundra, Livox och FlyFire. Det är den billigaste
sortimentsutökningen som finns och den kräver inget inköpsbeslut alls — se
[Distributörer](#distributörer--vem-levererar-vad).

Referenspunkten: **Drone Parts Center** (belgisk DJI Enterprise Gold Partner) når
full enterprise-trovärdighet med DJI plus fyra partnervarumärken — Dronavia,
Soarability/Sniffer4D, Wisson och EcoFlow. Vi har redan två av dem. **Globe
Flight** (störst på DJI Enterprise i DACH) kör 39 varumärken.

Det ger tre nivåer:

| Nivå | Antal varumärken | Vad det ger |
|---|--:|---|
| Gold Partner-paritet | DJI + 5 | Inga uppenbara hål i en enterprise-offert |
| Konkurrenskraftigt | DJI + 12 | Vi vinner jämförelsen mot nordiska konkurrenter |
| Globe Flight-paritet | DJI + 20 | Ingen anledning för kunden att handla någon annanstans |

## Utgångsläget

**Taxonomin** är enmärkes. `data/edp-enterprise-architecture-v2.json` har 97
noder, samtliga DJI. `data/edp-product-tag-standards.json` har exakt ett
brand-värde: `brand:dji`. I kollektionsreglerna finns 428 DJI-träffar mot 3 för
PolarPro och 4 för Livox.

**Sortimentet är det inte.** Databasen innehåller redan CZI, Wingtra, Parrot,
Pix4D, Tundra, Livox och FlyFire med inköpspris från en befintlig distributör.
Se [Distributörer](#distributörer--vem-levererar-vad) — det är den viktigaste
korrigeringen i rapporten. Problemet är alltså inte att varumärkena saknas utan
att de är osynliga: ingen kollektion, ingen varumärkestagg, ingen menyplacering,
och i de flesta fall status `draft`.

**Wisson** — 8 produkter i `data/wisson-catalog.json`, flygburna manipulatorer
och rengöringssystem för FlyCart 30 — är det enda icke-DJI-varumärket med
nyskriven svensk enterprise-text, och ligger som utkast. Via Swedron-gapimporten
tillkom **JLIDrone** (20), **Hikmicro** (145), **4Hawks** (2), **LifThor** (1)
och **Hoodman** (1), också som utkast.

Den tidigare gap-rapporten (`SWEDRON_GAP_2026-09-07.md`) konstaterade att cirka
5 500 produkter ligger i varumärken vi inte för alls, men avfärdade dem i
huvudsak som foto- och videotillbehör. Det stämmer för Swedrons sortiment. Den
här rapporten gäller den andra halvan av samma fråga: enterprise-sidan.

## Nivå 1 — måste in (DJI + 5)

Fem varumärken som stänger de hål som faktiskt kostar affärer. Alla fem är
DJI-anpassade, alla fem förs av minst två av våra jämförelseåterförsäljare.

**Dronavia** (Frankrike) — fallskärmar och Flight Termination Systems, serien
Kronos, plus strobes och positionsljus. Officiell DJI Eco Partner. Det här är
det enskilt viktigaste tillägget: utan fallskärmssystem kan vi inte utrusta en
kund som ska flyga i specifik kategori under SORA, och det är där de
professionella pengarna ligger i EU. Förs av Globe Flight, Drone Parts Center
och Swedron.

**Soarability / Sniffer4D** (EU-kontor Warszawa) — gasdetektion och
gaskartering, Sniffer4D V2, Mini2 och Nano2+, monterbara på M300/M350, M30 och
M400. Energibolag, deponier, räddningstjänst och industrikunder frågar efter
det, och det finns ingen DJI-motsvarighet.

**CZI** (Kina) — strålkastare, högtalare/LRAD och lastsläpp för hela
Matrice- och Mavic Enterprise-linjen. Det mest spridda tredjeparts-payloadmärket
bland DJI-återförsäljare. Bredare och billigare än DJI:s egna motsvarigheter och
täcker äldre plattformar som DJI slutat stötta. **Redan inköpt via Boston
Nordic: 27 artiklar med inköpspris, varav 25 ligger som utkast.** Kräver inget
avtal, bara publicering.

**Workswell** (Tjeckien) — industriell termografi över Zenmuse-nivå: WIRIS-serien
och optisk gasavbildning (OGI). Europeisk tillverkning, högt snittpris, hög
marginal, och rätt svar när kunden säger att H30T inte räcker.

**EcoFlow** — fältström och laddning för Matrice-, Agras- och FlyCart-kunder.
Låg tröskel, hög attachrate, redan 73 artiklar hos Swedron och partnervarumärke
hos Drone Parts Center. **EcoFlow ingår i Boston Groups portfölj**, så det ryms
sannolikt i befintligt avtal — fråga innan ni söker ny leverantör.

Dessutom: **slutför Wisson-importen**. Åtta produkter ligger som utkast utan
inköpspris. De är ett unikt sortiment som ingen nordisk konkurrent har.

## Nivå 2 — gör oss konkurrenskraftiga (ytterligare 7)

**Emlid** — RTK-bas och rover (Reach RS3). Nästan obligatorisk följeslagare till
varje Zenmuse P1- eller L2/L3-affär. Lågt pris, hög attachrate, finns hos
Swedron.

**Pix4D** — mjukvarulicenser för fotogrammetri. Både Globe Flight och Swedron
för det. Licensförsäljning är ren marginal utan lagerbindning. **31 artiklar
ligger redan som utkast med inköpspris från Boston Nordic**, ingen publicerad.
Det är den snabbaste posten i hela rapporten.

**Dronetag** (Tjeckien) — Remote ID-moduler (DRI, Beacon, Mini), EASA-godkända.
EU-förordning 2019/945 kräver Direct Remote ID för allt över 250 g i öppen och
specifik kategori. Billig produkt, obegränsad attachrate, regulatoriskt driven
efterfrågan.

**Elistair** (Frankrike) — tetherade system (Safe-T, Ligh-T) för uthållig
övervakning. Globe Flight har tethering som egen huvudkategori. Polis,
räddningstjänst och evenemangssäkerhet.

**XGRIDS** eller **Emesent Hovermap** — handhållen och drönarburen SLAM-LiDAR.
Globe Flight har "Handheld Lidar" som egen kategori, och det är dit
mätningspengarna flyttar. Emesent finns i DJI:s officiella ekosystemkatalog.

**Väskmärke — välj ett av HPRC, TomCase, B&W eller Peli.** Väska säljs på i
princip varje enterprise-order. Vi behöver ett, inte fyra.

**Minneskort — SanDisk eller Lexar.** V90 och CFexpress är ett reellt
tillbehörsköp till P1 och H30T, inte en konsumentartikel.

## Nivå 3 — Globe Flight-paritet (ytterligare 7)

Tas in när nivå 1 och 2 sitter, eller opportunistiskt när en kundaffär betalar
för det. Chasing och Parrot låg i den här listan i första utgåvan men behandlas
nu under [Drönare — flygplattformar](#drönare--flygplattformar), eftersom de
bedöms på försäljningsmodell snarare än som payloadmärken.

| Varumärke | Vad | Varför |
|---|---|---|
| MicaSense (AgEagle) / Yusense | Multispektralkameror | Jordbruk och skogsbruk; MicaSense finns redan i gapimporten |
| YellowScan | UAV-LiDAR i survey-klass | Franskt, över L2/L3-nivån, mätkonsulter |
| FLARM / uAvionix | Elektronisk synlighet, DAA | Krav vid BVLOS-tillstånd |
| Hikmicro | Handhållen termografi | Redan påbörjat via NEOS-importen; kompletterar drönartermografi |
| Nitecore / Patona | Batterier och laddning | Volymtillbehör, låg risk |
| Roboterwerk / Thor's Drone World | Tyska tillbehörstillverkare | Rehkitzrettung och viltsök är en stor egen kategori på DE-marknaden |

## Per kategori

### Drönare — flygplattformar

Den här sektionen är utökad 2026-09-10 efter påpekande att den första
genomgången avfärdade flygplattformarna för lättvindigt.

#### Vad konkurrenterna faktiskt gör

Ingen av de enterprise-återförsäljare vi jämför oss med säljer en konkurrerande
flygplattform. Globe Flights 39 varumärken innehåller noll icke-DJI-drönare —
Chasing är undervattens-ROV, resten är payloads och tillbehör. Heliguy, störst i
Storbritannien, har `/dji-drones-shop/` som butiksadress och lyfter XGRIDS,
inte en annan drönare, till egen menypost. Drone Parts Center är ren DJI plus
fyra payloadmärken.

Skälet är inte lathet. **Varje extra flygplattform dubblerar reservdels- och
servicebördan** — eget reservdelslager, egen RMA-väg, egen firmwarekunskap, egen
utbildning, eget garantiflöde. Det är den verkliga kostnaden, och den syns inte i
inköpsmarginalen.

Slutsatsen är därför inte att strunta i andra drönarmärken, utan att skilja på
tre helt olika roller.

#### Roll 1 — hyllvara: en (1) direkt DJI-ersättare

**Autel Robotics** är produktmässigt det enda märket som fungerar som lagerförd
hyllvara vid sidan av DJI. EVO Max 4T V2 ligger på cirka 5 700 euro med EU-lager
via etablerad återförsäljare, och konkurrerar direkt med Mavic 3 Enterprise och
Matrice 4T.

Men distributionsledet är svagt i Norden — se
[Autel — rekommendationen behöver en varning](#autel--rekommendationen-behöver-en-varning).
`autel.eu` är fordonsdiagnostik, inte drönare, och Autel Robotics saknar nordisk
distributör. Behåll Autel som mål, men räkna med utredningsarbete först.

Autel löser tre saker på en gång: prispunkt under DJI, en andra källa om
DJI-leveranser störs, och ett svar till kunder som av policyskäl inte får köpa
DJI men inte har budget för Skydio eller Parrot. Det är den enda
flygplattformen jag skulle lagerföra.

#### Roll 2 — offertvaror: säljs tillsammans med DJI, inte istället för

De här plattformarna gör saker DJI inte gör. Kunden köper dem **utöver** sin
DJI-flotta, vilket gör dem till breddning snarare än kannibalisering. Ingen
lagerhållning, demoexemplar och utbildning istället.

| Märke | Land | Jobbet DJI inte klarar |
|---|---|---|
| Flyability (Elios 3) | CH | Slutna utrymmen och GPS-nekade miljöer: pannor, tankar, schakt, gruvor. Kolliderings­tålig bur. DJI har ingen motsvarighet alls. |
| Wingtra | CH | Fixed-wing VTOL-kartering. Täcker flerdubbelt så stor areal per flygning som M400 med P1. **Vi har redan 26 Wingtra-artiklar med inköpspris via Boston Nordic**, varav 9 publicerade. Boston är Wingtras nordiska distributör. |
| Quantum Systems | DE | Samma segment som Wingtra, tysk tillverkning, EASA-certifierad, stark i offentlig sektor och försvar. |
| Griff Aviation | NO | Tunglyft över FlyCart-klassen. Griff 30 lyfter 30 kg nyttolast, större modeller mer. Norsk tillverkning. |
| Acecore | NL | Tunglyft och specialbyggen, europeisk tillverkning, etablerad återförsäljarkanal. |

Av dessa är **Flyability och Wingtra** de två jag skulle prioritera. Flyability
för att den är unik och saknar substitut. Wingtra för att efterfrågan redan är
bevisad hos vår närmaste svenska konkurrent.

#### Roll 3 — kvalificerad kanal: kräver avtal, inte hyllplats

**Skydio** (US) — X10 med dock är den ledande DFR-plattformen och har över 1 000
dockor utplacerade första året. Men försäljningen är enterprise-only via
auktoriserad återförsäljare med tung kvalificering, och vissa EU-länder är
undantagna. Realistiskt först när vi har en namngiven myndighetskund.

**Parrot** (FR) — har pivoterat mot försvar och myndighet. ANAFI UKR ligger runt
15 000 euro och säljs i den kanalen, inte som webbutiksvara. ANAFI USA finns
kvar. Värdet för oss är kryssrutan "icke-kinesisk tillverkare" i upphandling,
inte volymen. **Vi har redan 25 Parrot-artiklar via Boston Nordic**, 13
publicerade — Boston för Parrot vid sidan av DJI.

**Sky-Watch** (DK) — dansk, omsatte drygt 520 miljoner danska kronor 2025, men
säljer försvars- och säkerhetssystem direkt. Relevant kunskap för
DK-marknaden, inte ett återförsäljarsortiment.

#### Segment vi saknar helt och som ligger nära kunden

- **Undervattens-ROV** — Chasing, QYSEA, Deep Trekker. Inte flygande, men exakt
  samma kund: hamn, energibolag, räddningstjänst, polis. Chasing har 133 artiklar
  hos Swedron och noll hos oss, och förs dessutom av Globe Flight. **Svensk
  distributör är Focus Nordic AB i Göteborg**, vilket gör detta till den enklaste
  plattformsutökningen av alla — närmare än Autel.
- **Vattentäta drönare** — Swellpro. Sjöräddning och fiske, nordisk relevans.
- **Drone-in-a-box till befintliga DJI-drönare** — Heisha bygger dockor som
  passar DJI Mavic och Phantom samt Autel, Skydio och Parrot. Det är ett
  *tillbehör* som utökar värdet på drönare vi redan säljer, inte en konkurrent
  till Dock 3. Hextronics gör batteribytande dockor. Azur Drones (FR) och
  Percepto (IL) är helhetssystem i en högre prisklass.
- **Jordbruk** — XAG (P150, V40) är det enda reella Agras-alternativet och
  ligger något under DJI i pris. Men i sprutdrönare avgör servicenätet
  köpbeslutet, och där är DJI ohotat i Norden. Avstå tills en kund efterfrågar det.

#### Om regelläget

Det finns ingen EU-motsvarighet till FCC:s beslut i december 2025. DJI får säljas
och flygas fritt i EU. Det som ändå driver efterfrågan på icke-kinesiska
plattformar är säkerhetspolitik i enskilda upphandlingar: Norges stortingsbehandling
landade i att säkerhetsaspekter ska vägas in vid upphandling snarare än i ett
förbud, och drönarincidenterna i Danmark och Tyskland hösten 2025 har gjort frågan
levande hos myndighetskunder. Det motiverar att ha **ett** icke-kinesiskt
alternativ att erbjuda, inte att bygga om sortimentet.

#### Rekommendation flygplattformar

1. **Publicera Wingtra och Parrot.** Redan inköpta via Boston Nordic, 29
   artiklar ligger som utkast. Detta går före allt annat på plattformssidan.
2. **Ta in Chasing via Focus Nordic AB.** Svensk distributör, låg risk, bevisad
   efterfrågan, redan identifierat gap.
3. **Utred Autel.** Rätt produkt, men ingen nordisk drönardistributör. Kontakta
   Autel Robotics EU-kontor innan något utlovas.
4. **Teckna offertavtal med Flyability.** Kräver åtagande om demo, reservdelar,
   service och utbildning.
5. **Bevaka Quantum Systems och Skydio.** Ta in när en namngiven kundaffär
   betalar för kvalificeringen.
6. **Avstå tills vidare** från Griff, Acecore, XAG, Parrots försvarslinje och
   Sky-Watch. Rätt produkter, fel försäljningsmodell för en webbutik.

Räkna med att varje lagerförd plattform utöver DJI kräver eget reservdelslager
och egen servicekompetens. Det är därför listan slutar på ett märke och inte fem.

### Payloads

Det här är den viktigaste kategorin och den där vi är svagast. En komplett
enterprise-payloadhylla har tio positioner. Så här ser vår täckning ut:

| Position | Idag | Bör vara |
|---|---|---|
| Gimbalkamera, RGB/zoom | DJI Zenmuse | DJI räcker |
| Termisk, standard | DJI Zenmuse H30T | DJI räcker |
| Termisk, industriell/OGI | saknas | Workswell |
| LiDAR, standard | DJI Zenmuse L2/L3 | DJI räcker |
| LiDAR, survey och SLAM | saknas | YellowScan, XGRIDS, Emesent |
| Multispektral | saknas | MicaSense eller Yusense |
| Gasdetektion | saknas | Sniffer4D, AIRINS |
| Högtalare, strålkastare, lastsläpp | delvis DJI | CZI, JLIDrone |
| Fallskärm och FTS | saknas | Dronavia |
| Manipulator och rengöring | Wisson, utkast | slutför Wisson |

Fyra av tio positioner är tomma och två till är halvfyllda.

### Tillbehör

Attachrate-produkter, inte huvudaffärer, men de avgör om ordern läggs hos oss
eller hos någon som har allt. Prioritetsordning: väskor, fältström, minneskort,
RTK-mottagare, Remote ID, landningsplattor, skärmar och fästen
(SWIT, Feelworld, LifThor), antennförstärkning (4Hawks), ND-filter (PolarPro,
Freewell — men det är i huvudsak konsument).

### Reservdelar

**Här är svaret inte fler varumärken utan mer DJI-djup.** Reservdelar till
enterprise-plattformar måste vara OEM: armar, ESC, gimbalmoduler,
flygbatterier. Tredjepartsbatterier till en M350 är en garantifråga och ska inte
in i sortimentet.

`data/edp-phase4b-spare-parts-architecture.json` är redan byggd kring DJI-modell
och komponent, vilket är rätt struktur. Det som saknas är täckningsgrad per
plattform, inte fler leverantörer. De enda meningsfulla
tredjepartstilläggen är förbrukningsartiklar utanför garantin: minneskort,
kablage och skuminsatser till väskor.

## Distributörer — vem levererar vad

Tillagt 2026-09-10. Det här avsnittet **korrigerar en felaktighet i de tidigare
utgåvorna.** Jag skrev att katalogen är enmärkes. Det gäller taxonomin, inte
sortimentet. Frågan om distributörer visade sig till stor del redan vara löst.

### Vi har redan distributören för fem av rekommendationerna

`public.inventory` för EU Drone Company (`shop_id e6ad2afc…`) har fyra aktiva
leverantörsplatser: egen butiksplats, Sunsky (kinesisk dropship), **Boston
Nordic** och **InnPro**.

Boston Nordic levererar 13 varumärken med inköpspris i SEK på varenda rad:

| Varumärke | Rader | Publicerade | Utkast | Inköpspris SEK |
|---|--:|--:|--:|---|
| DJI | 639 | 199 | 388 | 10 – 160 984 |
| PGYTECH | 109 | 70 | 39 | 45 – 1 787 |
| Pix4D | 31 | 0 | 31 | 30 – 74 754 |
| PolarPro | 30 | 3 | 27 | 109 – 3 676 |
| CZI | 27 | 2 | 25 | 1 187 – 212 019 |
| Wingtra | 26 | 9 | 17 | 236 – 322 906 |
| Parrot | 25 | 13 | 12 | 64 – 227 846 |
| Tundra | 12 | 2 | 10 | 3 339 – 44 518 |
| Livox | 9 | 2 | 7 | 135 – 12 740 |
| FlyFire | 7 | 2 | 5 | 512 – 38 846 |
| DBOX | 2 | — | — | 63 493 – 65 958 |
| Arastelle | 1 | 0 | 1 | 24 485 |
| PowerVisio | 1 | 1 | 0 | 872 |

**CZI (nivå 1), Pix4D (nivå 2), Wingtra och Parrot (flygplattformar) och Tundra
Drone (nivå 4) kräver alltså inget nytt distributörsavtal.** De är redan
inköpta, prissatta och ligger som utkast. Det gäller 107 icke-DJI-artiklar med
färdigt inköpspris som bara inte är publicerade.

Det ändrar rekommendationen för de fem från "teckna avtal" till "publicera".
Det är också en helt annan tidsplan: dagar istället för månader.

Boston Group A/S är dansk, ligger i Farum, har säljkontor i Sverige, Norge och
Finland och är Nordens största drönardistributör. Deras varumärkesportfölj är
bredare än vad vi importerat: utöver ovanstående för de **EcoFlow** (vår nivå
1), **Phase One** (kartkameror i toppklass), Sony, Canon, Hasselblad och Obsbot.

**Enskilt högst hävstång: ett mejl till salg@boston.dk med frågan vad mer de kan
leverera.** EcoFlow och Phase One ligger sannolikt inom befintligt avtal.

InnPro (Rybnik, Polen) står för 295 rader, i huvudsak Puluz- och
DJI-tillbehör utan varumärkesfält. InnPro är samtidigt auktoriserad
Dronavia-återförsäljare, vilket gör dem till en möjlig andraväg dit.

### Varumärken som kräver nytt avtal

| Varumärke | Distributionsmodell | Väg in | Nordisk täckning idag |
|---|---|---|---|
| Dronavia | Endast auktoriserade återförsäljare, ingen direktförsäljning | Ansökningsformulär på dronavia.com/partners | SE: AMKVO (Uppsala) och Scandinavian Drone. NO: ROMVESEN. FI: Skydata OY. **DK saknas** |
| Workswell | Direkt från tillverkaren i Prag, partnernätverk utan landsexklusivitet | sales@workswell.eu | Ingen nordisk återförsäljare hittad |
| Soarability / Sniffer4D | Regionala distributörer. TPI (Warszawa) driver sniffer4d.eu för CZ, LT, PL, RO, SK | Direkt till Soarability, eller via TPI | Norden inte täckt av TPI |
| Chasing Innovation | Distributör per marknad | **Focus Nordic AB** (Göteborg) är svensk distributör | Täckt — Focus Nordic |
| Emlid | Återförsäljarnätverk plus egen EU-butik | emlid.com/dealers | Kontrollera aktuell lista |
| Dronetag | Uttalat distributörsprogram med marginal och marknadsstöd | dronetag.com/company/partners | Öppet |
| Flyability | Distributörsnätverk med krav på demo, reservdelar, service och utbildning | flyability.com/distributors | Kräver serviceåtagande |
| Elistair, XGRIDS, Emesent, YellowScan, MicaSense | Distributörsledda | Direktkontakt | Ej undersökt per land |

### Autel — rekommendationen behöver en varning

Jag skrev i förra utgåvan att Autel är den enda plattform som fungerar som
lagerförd hyllvara. Distributionsledet är svagare än jag antog.

`autel.eu` är **Autel Intelligent Technology**, alltså fordonsdiagnostik: ADAS,
TPMS, nyckelprogrammering. Svensk distributör där är Skantz Diagnosverktyg i
Eslöv. Det är inte drönarsidan. Drönarna är **Autel Robotics**, en annan
kanal, och de har ingen nordisk distributör vi kunnat hitta. Vägen in är
antingen Autel Robotics egen EU-kanal (salesoffice.eu@autel.com för länder som
saknas i listan) eller en återförsäljarroll under Autelpilot, som själv är
återförsäljare snarare än tillverkarens distributör.

Autel är alltså fortfarande rätt produktval, men det är inte längre det enkla
alternativet. Rangordna om: **Chasing via Focus Nordic är nu den enklaste
plattformsutökningen**, eftersom distributören finns på plats i Göteborg.

### Reviderad åtgärdsordning

1. **Publicera 107 icke-DJI-utkast från Boston Nordic.** CZI 25, Pix4D 31,
   Wingtra 17, Parrot 12, Tundra 10, Livox 7, FlyFire 5. Inköpspris finns,
   leverantören finns, inget avtal behövs.
2. **Mejla Boston** och fråga vad mer som ryms i befintligt avtal. EcoFlow och
   Phase One först.
3. **Ansök hos Dronavia.** Danmark saknar återförsäljare, vilket passar
   `/dk`-marknaden. Sverige har redan två, så räkna med konkurrens där.
4. **Kontakta Focus Nordic om Chasing.** Svensk distributör, känd motpart.
5. **Kontakta Workswell och Soarability direkt.** Ingen nordisk återförsäljare
   står i vägen för någon av dem.
6. **Autel sist**, när distributionsvägen är utredd.

## Konkurrentunderlag

**Globe Flight** (DE), 39 varumärken: AirInnoX, Akku-King, B&W International,
BLV, CADdy Geomatics, Chasing Innovation, Copteruni, CSD, CZI, DJI (Consumer,
Agricultural, Delivery, Enterprise), Dronavia, DroneControl, Elistair, Extron,
FLARM, GF UltraThin, Globe Protect, Halbig, Hexagon, HPRC, JLIdrone, MicaSense,
Nitecore, Patona, Perspective, PGYTECH, Pix4D, Restube, Roboterwerk, SanDisk,
Scantech, Sony, SWIT, Thor's Drone World, TomCase, UGREEN, WEBARO, Wisson,
XGRIDS, YX.

Deras payloadkategori heter "Payloads und Industriesensoren" och har elva
underkategorier: fallskärmssystem, industrikameror, Wisson-rengöringssystem,
termalkameror, multispektralkameror, LiDAR-sensorer, högtalare, strålkastare,
lastsläpp, SDK-payloads och handhållen LiDAR. Utöver det egna huvudkategorier
för tetheringsystem och för drönardetektion och -avvärjning.

**Drone Parts Center** (BE), DJI Enterprise Gold Partner: DJI plus Dronavia,
Soarability, Wisson och EcoFlow. Kategoriseringen är lösningsbaserad — polis och
blåljus, regelefterlevnad, gasdetektion, drone-in-a-box, energiinspektion,
byggövervakning, vilt och biologisk mångfald, mätning.

**Swedron** (SE): DJI, Parrot, Chasing Innovation och Pix4D som uttalade
varumärken, plus en bred foto- och videohylla (SmallRig 1 354, Kupo 1 092,
Nanlite 316) som inte är enterprise. Enterprise-relevant hos dem och inte hos
oss: Wingtra 33, CZI 22, HPRC 17, MicaSense 16, Emlid 13, Dronavia 10.

**Coptrz** (UK) har gått en annan väg och tagit exklusiva
distributionsavtal — Avy för fixed-wing och drone-in-a-box, Tundra Drone för
modulära payloads. **Heliguy** (UK) partnar med MicaSense, Delair, ParaZero,
Emlid och Pix4D.

**DJI:s egen ekosystemkatalog** listar 68 tredjepartslösningar, bland dem
Emesent Hovermap, Dronavia, AIRINS, Yusense, OFIL Systems, DroneDeploy,
Airhub och DroneHarmony. Medlemskap där är en användbar filtrering: det betyder
att produkten faktiskt monterar och att distributionsavtal går att få.

## Vad som behöver göras i katalogen

0. **Publicera de 107 Boston-utkasten.** Går före allt annat här: inköpspris
   finns, leverantören finns, inget avtal behövs. Se
   [Distributörer](#distributörer--vem-levererar-vad).
1. **Utöka `brand`-dimensionen i `edp-product-tag-standards.json`.** Ett enda
   värde `brand:dji` gör varje icke-DJI-produkt hemlös, vilket är själva orsaken
   till att sju varumärken kunnat ligga osynliga i katalogen. Föreslagna värden
   ligger i `data/enterprise-brand-coverage.json`.
2. **Lägg en varumärkesnivå i enterprise-arkitekturen.** Idag är noderna
   modellbaserade (Matrice 400, Zenmuse L2). Payloadsektionen behöver kunna
   grupperas både på funktion och på tillverkare.
3. **Publicera Wisson.** Åtta produkter, färdig svensk text, ligger som utkast.
   Blockeraren är inköpspris, inte innehåll.
4. **Begär offert från Dronavia och Soarability.** Båda är EU-baserade, båda
   säljer via återförsäljare, båda fyller hål som stoppar affärer idag.
5. **Skilj på lagerförd och offererad plattform i katalogen.** Autel och Chasing
   ska kunna köpas i butiken. Flyability och Wingtra ska ligga som
   offertprodukter med samma mönster som Wisson-produkterna redan använder
   ("Enterprise-produkt som offereras per uppdrag"). Utan den skillnaden ser
   sortimentet ut att lova leveranstider vi inte kan hålla.

## Osäkerheter

- Marginaler och distributionsvillkor per varumärke är inte undersökta. Nivå
  1-listan är sorterad på sortimentshål, inte på lönsamhet.
- Varumärkeslistorna för Globe Flight, Drone Parts Center och DJI:s
  ekosystemkatalog är hämtade 2026-09-10 och är färskvara.
- Swedrons varumärkessida renderas klientsidigt och gick inte att läsa direkt.
  Siffrorna för Swedron är härledda ur `data/swedron-product-index.tsv`
  (9 733 produkt-URL:er) via prefixmatchning på handles och underskattar därför
  varumärken vars artiklar inte bär varumärkesnamnet i sin slug.
- Om ett enskilt varumärke är värt att ta in beror på minsta orderkvantitet och
  lagerbindning, vilket kräver kontakt med respektive leverantör.
- Återförsäljarvillkoren för flygplattformarna är inte verifierade med
  tillverkarna. Bedömningen av vad som går att lagerföra respektive bara
  offerera bygger på hur märkena säljs idag, inte på offerter vi begärt. Autels
  prisuppgift är en butikslistning hos en EU-distributör, inte ett inköpspris.
- Skydios EU-täckning varierar per land och listan över undantagna länder
  ändras. Kontrollera aktuell status innan något utlovas till kund.
- Distributörssiffrorna är avlästa ur `public.inventory` 2026-09-10 och speglar
  vad som importerats, inte nödvändigtvis hela Boston Nordics katalog. Vad
  befintligt avtal täcker utöver de 13 varumärkena är inte bekräftat med dem.
- Återförsäljarlistorna hos Dronavia, Flyability, Emlid och Dronetag är
  färskvara och kan ha ändrats sedan avläsningen.
- Att Danmark saknas i Dronavias lista betyder att ingen dansk återförsäljare är
  publicerad, inte att exklusivitet är utlovad. Kontrollera med dem.

## Källor

- [Globe Flight — Alle unsere Marken](https://www.globe-flight.de/Hersteller)
- [Drone Parts Center](https://drone-parts-center.com/en/)
- [DJI Industry Ecosystem Solutions Catalogue](https://developer.dji.com/ecosystem)
- [Swedron — Varför Swedron](https://swedron.se/varfoer-swedron)
- [Coptrz — exklusiv UK-partner för Avy](https://www.suasnews.com/2026/04/coptrz-named-exclusive-uk-partner-for-avy/)
- [Coptrz lanserar Tundra Drones modulära payloadplattform](https://www.suasnews.com/2026/05/coptrz-launches-tundras-modular-payload-platform-in-the-uk/)
- [Dronavia blir DJI Eco Partner](https://www.dronavia.com/2025/01/07/dji-eco-partner/)
- [Sniffer4D Europe](https://sniffer4d.eu/)
- [Workswell — UAV/UGV Payloads](https://workswell.eu/software-uav-ugv-payloads/)
- [Dronetag DRI — EU retrofit](https://help.dronetag.com/dronetag-dri/integration/eu-retrofit/)
- [DSLRPros — A Complete Guide to the DJI Drone Ban](https://www.dslrpros.com/blogs/drone-trends/a-complete-guide-to-the-dji-drone-ban-2025)
- [SPH Engineering — DJI Alternatives](https://www.sphengineering.com/news/dji-alternatives)
- [Heliguy — DJI drone payload compatibility guide](https://www.heliguy.com/blogs/posts/dji-drone-payload-compatibility-and-maximum-payload-capacity-guide/)

Tillagt för avsnittet om flygplattformar:

- [Autelpilot.eu — EVO Max 4T, EU-lager och pris](https://www.autelpilot.eu/products/autel-robotics-evo-max-4t)
- [Skydio — auktoriserade återförsäljare](https://www.skydio.com/authorized-resellers)
- [The Drone Girl — Skydio 1 000 dockor första året](https://www.thedronegirl.com/2026/07/08/skydio-dock-1000-deployments-one-year-milestone/)
- [UAV Coach — Parrot ANAFI UKR](https://uavcoach.com/parrot-anafi-ukr/)
- [Flyability — Elios](https://www.flyability.com/)
- [Griff Aviation](https://www.griffaviation.com/)
- [Sky-Watch — nästa tillväxtfas](https://www.defencenordic.com/article/view/1231443/skywatch_prepares_for_its_next_phase_of_growth)
- [Montel News — Norges användning av kinesiska drönare](https://montelnews.com/news/a178e32a-1786-4003-bd8c-3b1925bb89b7/norways-use-of-chinese-drones-raises-energy-security-concerns)
- [Drone Trader — drone-in-a-box jämförelse 2026](https://blog.dronetrader.com/drone-in-a-box/)
- [GrabaRobot — DJI Agras mot XAG](https://www.grabarobot.com/blog/china-agricultural-drone-market-2026/)

Tillagt för avsnittet om distributörer:

- [Dronavia — partnernätverk och återförsäljarlista](https://www.dronavia.com/partners/)
- [Workswell — kontakt och partnernätverk](https://workswell.eu/contact/)
- [Sniffer4D Europe (drivs av TPI)](https://sniffer4d.eu/)
- [Boston Group — Commercial Drones](https://www.boston.dk/commercial-drones-en)
- [Boston Group — bli återförsäljare](https://www.boston.dk/become-a-reseller)
- [Wingtra — partnerprogram](https://wingtra.com/partner-program/)
- [Wingtra och Boston Group i Norden](https://wingtra.com/wingtra-partners-with-boston-group-to-bring-more-orange-to-the-nordic-skies/)
- [Autel — officiella EU-distributörer (fordonsdiagnostik)](https://www.autel.eu/official-eu-distributors/)
- [Focus Nordic — Chasing](https://www.focusnordic.com/brands/chasing)
- [Flyability — distributörer](https://www.flyability.com/distributors)
- [Emlid — återförsäljare](https://emlid.com/dealers/)
- [Dronetag — partners](https://www.dronetag.com/company/partners)
