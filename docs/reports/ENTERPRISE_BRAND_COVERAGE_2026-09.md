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
[Drönare — flygplattformar](#drönare--flygplattformar): **ett** lagerfört
alternativ (Autel), **två** offertvaror som säljs tillsammans med DJI snarare än
istället för (Flyability, Wingtra), och undervattens-ROV som närliggande
segment (Chasing). Varje ytterligare lagerförd plattform kostar ett eget
reservdelslager och en egen servicekedja.

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

Katalogarkitekturen är enmärkes. `data/edp-enterprise-architecture-v2.json` har
97 noder, samtliga DJI. `data/edp-product-tag-standards.json` har exakt ett
brand-värde: `brand:dji`. I kollektionsreglerna finns 428 DJI-träffar mot 3 för
PolarPro och 4 för Livox.

Enda icke-DJI-varumärket med verkligt enterprise-innehåll är **Wisson** — 8
produkter i `data/wisson-catalog.json`, flygburna manipulatorer och
rengöringssystem för FlyCart 30, fortfarande utkast. Via Swedron-gapimporten
tillkom **JLIDrone** (16), **Hikmicro NEOS** (3), **4Hawks** (2), **LifThor** (1)
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
täcker äldre plattformar som DJI slutat stötta.

**Workswell** (Tjeckien) — industriell termografi över Zenmuse-nivå: WIRIS-serien
och optisk gasavbildning (OGI). Europeisk tillverkning, högt snittpris, hög
marginal, och rätt svar när kunden säger att H30T inte räcker.

**EcoFlow** — fältström och laddning för Matrice-, Agras- och FlyCart-kunder.
Låg tröskel, hög attachrate, redan 73 artiklar hos Swedron och partnervarumärke
hos Drone Parts Center.

Dessutom: **slutför Wisson-importen**. Åtta produkter ligger som utkast utan
inköpspris. De är ett unikt sortiment som ingen nordisk konkurrent har.

## Nivå 2 — gör oss konkurrenskraftiga (ytterligare 7)

**Emlid** — RTK-bas och rover (Reach RS3). Nästan obligatorisk följeslagare till
varje Zenmuse P1- eller L2/L3-affär. Lågt pris, hög attachrate, finns hos
Swedron.

**Pix4D** — mjukvarulicenser för fotogrammetri. Både Globe Flight och Swedron
för det. Licensförsäljning är ren marginal utan lagerbindning.

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

**Autel Robotics** är det enda märket som fungerar som lagerförd hyllvara vid
sidan av DJI. EVO Max 4T V2 ligger på cirka 5 700 euro med EU-lager via
etablerad distributör, och konkurrerar direkt med Mavic 3 Enterprise och
Matrice 4T. Autel har återförsäljarkanal, reservdelsförsörjning och en produkt
som en kund kan köpa i en webbutik utan föregående demo.

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
| Wingtra | CH | Fixed-wing VTOL-kartering. Täcker flerdubbelt så stor areal per flygning som M400 med P1. Swedron för 33 artiklar, alltså bevisad svensk efterfrågan. |
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
inte volymen.

**Sky-Watch** (DK) — dansk, omsatte drygt 520 miljoner danska kronor 2025, men
säljer försvars- och säkerhetssystem direkt. Relevant kunskap för
DK-marknaden, inte ett återförsäljarsortiment.

#### Segment vi saknar helt och som ligger nära kunden

- **Undervattens-ROV** — Chasing, QYSEA, Deep Trekker. Inte flygande, men exakt
  samma kund: hamn, energibolag, räddningstjänst, polis. Chasing har 133 artiklar
  hos Swedron och noll hos oss, och förs dessutom av Globe Flight. Det här är
  den lägst hängande frukten på plattformssidan.
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

1. **Lagerför Autel.** Ett märke, som direkt alternativ och andra källa.
2. **Ta in Chasing** som undervattenskomplement — låg risk, bevisad efterfrågan,
   redan identifierat gap.
3. **Teckna offertavtal med Flyability och Wingtra.** Ingen lagerbindning, säljs
   tillsammans med DJI.
4. **Bevaka Quantum Systems och Skydio.** Ta in när en namngiven kundaffär
   betalar för kvalificeringen.
5. **Avstå tills vidare** från Griff, Acecore, XAG, Parrots försvarslinje och
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

1. **Utöka `brand`-dimensionen i `edp-product-tag-standards.json`.** Ett enda
   värde `brand:dji` gör varje icke-DJI-produkt hemlös. Föreslagna värden ligger
   i `data/enterprise-brand-coverage.json`.
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
