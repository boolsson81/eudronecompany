# Leverantörer av tvättutrustning för tak och fasad — 2026-09

**Datum:** 2026-09-10
**Fråga:** Vilken leverantör har utrustning för att tvätta tak och fasader?
**Metod:** Öppna källor — tillverkarnas egna sidor, EU-återförsäljares prislistor och
branschpress. Inga inköpsvillkor är förhandlade, inga priser är offererade till oss.

## Kortsvaret

**Det är två olika affärer och de har olika leverantör.**

Den ena är en **payload** som hängs under en DJI vi ändå säljer. Den kostar
12 000–25 000 EUR, kräver ingen ny plattform i lager och säljs som tillbehör på
varje M400-affär. Där är **Wisson** rätt val — och den importen är redan påbörjad
i butiken.

Den andra är ett **komplett system** med markutrustning: pump, tank,
vattenrening, slangvinda och utbildning. Den kostar från cirka 47 000 EUR och
säljs till städ- och fastighetsbolag som ska bygga en tjänst, inte till
drönarpiloter. Där är **Drone Volt** (Villepinte, Frankrike) rätt val: enda
europeiska tillverkaren i urvalet, säljer via återförsäljarled, har nordiskt
kontor i Köpenhamn och uppger C5-certifiering av EASA för Hercules 20 — vilket
öppnar STS-01 istället för full SORA-prövning.

Det tredje alternativet, **EAUAV** (Hangzhou), är den prisvärda mellanvägen: både
ett komplett system (Vertex C80/C80P) och ett rent PSDK-kit för DJI M400, med
uttalat återförsäljarprogram och CE-dokumentation. Ta in dem som andrahandskälla,
inte som förstahandsval.

## Varför frågan delar sig

Tak och fasad är inte samma tvätt. Fasad är högtryck — 200–250 bar mot glas,
plåt och betong. Tak i Norden är i praktiken *soft wash*: lågt tryck, kemi eller
hetvatten mot alger och mossa, för att inte driva vatten in under pannor. En
leverantör som bara har högtryck täcker halva frågan.

Den andra delningen är var vattnet finns. Alla seriösa system är slangmatade —
drönaren bär munstycket, marken bär pump och tank. Det betyder att
markutrustningen är halva inköpet och hela skillnaden mellan en payload och ett
system.

## Kandidater

| Leverantör | Land | Produkt | Tryck / höjd | Prisnivå (publik) | Återförsäljarled |
|---|---|---|---|---|---|
| Drone Volt | FR | Hercules 20 HIGH-DRA / Spray | 250 bar / 60 m, LP 10 bar / 30 m | från 46 850 EUR ex moms | Ja, egen distributörssida |
| Wisson | CN (HK/Shenzhen) | Orion AP3-P3 (payload) | 13 MPa / ~100 m | 11 736 EUR netto (aeroMind, PL) | Via EU-distributörer |
| EAUAV | CN (Hangzhou) | Vertex C80/C80P + M400-kit | 200 bar / 80–120 m | ej publikt | Ja, uttalat dealerprogram |
| Foxtech | CN (Tianjin) | AeroClean P3 (T50) | uppgifter spretar, se nedan | 13 200 USD | Webbutik, lager |
| Apellix | US | Power Wash B2 / Blue | 4 000 psi / 60 m | 47 000–60 000 USD | Exklusiva landsdistributörer |
| Lucid Bots | US | Sherpa | 4 500 psi / 46 m | 75 000 USD | Direkt |
| KTV Working Drone | NO | KTV-drönare | upp till 300 bar | franchisepaket | Franchise, ej lös försäljning |

### Drone Volt — förstahandsval för komplett system

Hercules 20 HIGH-DRA säljs som en färdig lösning från **46 850 EUR ex moms**, och
då ingår drönare, högtryckssystem, 300-liters tank, 100 m slang, sprutbom, sex
munstycken och ett fem dagars utbildningsprogram. Tillvalen är precis de som
nordiska tak- och fasadjobb kräver: omvänd osmos eller jonbytarfilter,
hetvattenbox 30–150 °C, dubbelinjektor för kemi 0–15 %, tankar upp till 1 000 l
och transportsläp. Systemet väger 430 kg totalt och går på EU-pall.

Två saker gör dem till förstahandsval framför de kinesiska alternativen. Det
första är **regelläget**: bolaget uppger att Hercules 20 är C5-certifierad av
EASA och därmed kan flygas under STS-01, med tillägget att den officiella
publiceringen på EASA:s webbplats "kommer snart". Går det att verifiera är det
den enskilt största säljfördelen i hela urvalet — kunden slipper en
SORA-prövning per uppdrag. Det andra är **lågtrycksvarianten**: Hercules 20 Spray
Low Pressure ligger på 10 bar och 30 meter, vilket är takdelen av frågan. De
marknadsför uttryckligen algbehandling och takrengöring, inte bara fasad.

Bolaget är franskt och börsnoterat, sitter i Villepinte utanför Paris, har
internationella kontor i bland annat Köpenhamn och Benelux, driver egna
utbildningscenter (Drone Volt Academy) och har en distributörssida — alltså ett
befintligt återförsäljarled att söka sig in i. Demodagar hålls månadsvis utanför
Paris.

Kontakt: +33 (0)1 80 89 44 44, `dronevolt.com/en/`, distributörssidan i sidfoten.

### Wisson — payloaden som redan är påbörjad

Åtta Wisson-produkter ligger redan som utkast i butiken efter importen 2026-09-09,
däribland **AP3-P3** som är fasadtvättsystemet och **AP30-P4H** som är
högtryckssprutan. Landningssidan `fasadtvatt-dronare` finns också, opublicerad.
Sedan importen har Wisson flyttat AP3-P3 från M300/M350 till **DJI M400** på sin
egen produktsida, vilket betyder att produktdatan i `data/wisson-catalog.json`
behöver uppdateras innan publicering.

Systemet arbetar med renat vatten via ett patenterat DIC-vattenreningssteg och en
bionisk "vattenskrapa" med 40 graders solfjäder, alltså strimfri glasrengöring
snarare än rå avspolning. Det är en payload på 1,3 kg för drönare med 3–10 kg
lastkapacitet.

Prisbilden i Europa är känd via två distributörer och en svensk konkurrent:

| Säljare | Land | Artikel | Pris |
|---|---|---|---|
| aeroMind | PL | AP3-P3 Standard (M350) | 11 735,99 EUR netto |
| Pro Fly Center | DE | AP3-P3 | 13 159,53 EUR |
| Swedron | SE | AP3-P3 Standard (M400) | 111 996 SEK |
| Swedron | SE | DJI M400 (samma paket) | 89 368 SEK |
| Swedron | SE | 4 × TB100-batteri | 57 568 SEK |

Swedron säljer alltså hela paketet M400 + AP3-P3 + batterier för knappt 260 000
SEK, och har byggt en egen kategori — "Drönare med tvättsystem" — runt det. Det
är den konkurrent vi mäter oss mot, och de har ett års försprång.

Att Wisson redan har minst två EU-distributörer är lika mycket en möjlighet som
ett hinder: vi kan köpa via aeroMind eller Pro Fly Center och slippa direktimport,
CE-pärm och tull, till priset av tunnare marginal. Direktavtal med Shenzhen ger
bättre marginal men kräver att återförsäljarledet förhandlas.

Kontakt: `bd@wissonrobotics.com` (presales), `support@wissonrobotics.com`,
tel +86 755 8670 5724.

### EAUAV — bredast sortiment, oprövad hos oss

EAUAV i Hangzhou täcker båda produkttyperna. **Vertex C80/C80P** är ett komplett
slangmatat system: drönare under 15 kg med IP65, 200 bar pump, 15 l/min, 100 m
slang, 45 minuters flygtid, munstyckessats med skum och 0/15/25/40 graders
solfjäder, byte mellan skum och sköljning i luften, fjärrstyrd pumpstart och
RTK. C80 räcker till 80 meter, C80P till 120. Uppgiven kapacitet är 500 m²/h vid
djuprengöring och upp till 1 000 m²/h vid underhållstvätt. De säljer också ett
**tillvalskit för tak och takmonterad solel**, vilket är takdelen av frågan.

För oss är det andra kitet mer intressant: **M400 Facade Cleaning Kit**, ett rent
PSDK-tillbehör till en plattform vi redan för. Det gör tvättaffären till en
tillbehörsförsäljning istället för ett nytt lagerfört flygplan.

De uppger CE-dokumentation för levererad konfiguration, Remote ID i 2026-paketet,
fallskärm som tillval, fjärrutbildning och ett uttalat dealer-, distributörs- och
OEM-program. Inga priser är publika.

Kontakt: `support@eauav.com`, +86 193 5717 7328, Hangzhou.

### Foxtech — snabbast att prova, sämst underlag

AeroClean P3 (T50) för DJI M400 ligger i lager i Foxtechs webbutik för **13 200
USD**. Problemet är att specifikationerna spretar mellan deras egna sidor: en
sida säger 20 MPa och 45 meters räckvidd, en annan 40 MPa och 120 meter. Det
duger inte i en offert till ett fastighetsbolag. Användbar som referenspris och
som snabb testköpsväg, inte som leverantör att bygga ett sortiment på utan att
först få ett datablad som håller.

### Apellix, Lucid Bots, KTV — kan avfärdas

**Apellix** (Jacksonville, US) har den mest spridda tvättdrönaren i världen enligt
egen uppgift, 21 länder, B2 för 47 000 USD och NDAA-versionen Blue för 60 000
USD. De bygger exklusiva landsdistributörer och tog Drone Clean UK som exklusiv
brittisk distributör i mars 2026. Norden är alltså formellt ledig, men modellen
är en helt annan affär än att lägga en artikel i butiken — och prisnivån är
dubbel mot Drone Volt utan att ge något extra i EU. Notera också att den
jämförelse i branschpressen som rankar Apellix högst är **sponsrad av Apellix**.

**Lucid Bots** Sherpa ligger på 75 000 USD i "full package" och har kortare
flygtid än alternativen. Ingen EU-närvaro värd namnet.

**KTV Working Drone** (Norge) är intressant tekniskt — filtrerat vatten, värme
och måttligt tryck utan kemi, plus eget fasadmedel — men de säljer inte lös
utrustning. Modellen är franchise med obligatorisk femdagarsutbildning. Det är en
tjänsteaffär, inte en leverantörsaffär.

## Markutrustningen glöms bort

Halva jobbet står på marken och ingen av drönartillverkarna löser hela det.
Kunden behöver renat vatten (RO eller jonbytare) för strimfri fasad, ofta
hetvatten för alger på tak, en pump som orkar hela vägen upp, slangvinda och en
bil eller ett släp som håller ihop det.

Drone Volt är den enda i urvalet som säljer hela kedjan som en artikel, inklusive
hetvattenbox och osmosfilter. För övriga leverantörer behöver vi en andra
leverantör till markdelen. Branschen köper i dag fordonsinredda system från
specialister som Streamline och renvattenpaket från
fönsterputsgrossisterna — värt en egen genomgång om vi väljer payload-vägen.

## Rekommendation

1. **Slutför Wisson.** Åtta produkter ligger redan som utkast. Uppdatera AP3-P3
   till M400, hämta bildmaterial, bestäm offert- eller prisflöde och publicera
   `fasadtvatt-dronare`. Det är den snabbaste vägen till en produkt på hyllan och
   den enda som inte kräver ett nytt leverantörsavtal.
2. **Öppna en dialog med Drone Volt om återförsäljarskap.** Fråga specifikt om
   C5-certifikatets status, nordiska villkor via Köpenhamnskontoret, och om
   lågtrycksvarianten kan säljas separat för takmarknaden.
3. **Begär offert och dealervillkor från EAUAV** på M400-kitet och på C80P. Använd
   det som prispress mot Wisson och som reserv om Drone Volt kräver exklusivitet
   vi inte vill ge.
4. **Avfärda Apellix, Lucid Bots och KTV** tills något av ovanstående faller.

## Kräver manuell kontroll

1. **C5-certifieringen är inte verifierad.** Drone Volt skriver själva att
   publiceringen på EASA:s webbplats kommer senare. Kontrollera i EASA:s register
   innan påståendet används i marknadsföring — det är hela regelargumentet.
2. **DJI:s garanti vid tredjepartslast.** Det förekommer uppgifter i
   branschforum om att monterad tvättlast på M400 upphäver tillverkargarantin.
   Obekräftat, men måste redas ut med DJI innan vi säljer paket där båda delarna
   står på vår faktura.
3. **Wisson-datan är inaktuell.** `data/wisson-catalog.json` anger M300/M350 för
   AP3-P3, tillverkaren anger nu M400. Åtta produkter saknar dessutom bilder och
   inköpspris enligt `WISSON_INKOPSPRIS_LUCKOR_2026-09-09.md`.
4. **Kemi och biocider för takrengöring** är reglerat i EU via
   biocidförordningen och nationellt av Kemikalieinspektionen i Sverige.
   Sprutning från drönare kan omfattas av separata krav. Kontrollera innan vi
   marknadsför takbehandling, inte bara taktvätt.
5. **Alla priser i rapporten är återförsäljares listpriser**, inte våra
   inköpspriser, och det framgår inte alltid om moms ingår. De duger som
   marknadsreferens, inte som marginalunderlag.
6. **Vattenkvalitet.** Wisson och KTV bygger sin kvalitetsargumentation på renat
   vatten. Säljer vi ett system utan renvattensteg får kunden strimmor på glas
   och klagar på oss, inte på vattnet.

## Källor

Drone Volt (`dronevolt.com`), Wisson Robotics (`wissonrobotics.com`), EAUAV
(`eauav.com`), Foxtech (`store.foxtech.com`, `foxtechuav.com`), aeroMind
(`aeromind.pl`), Pro Fly Center (`proflycenter.com`), Power Drone
(`power-drone.eu`), Swedron (`swedron.se`), KTV Working Drone
(`ktvworkingdrone.com`), Apellix via UASweekly 2026-03-17 och DRONELIFE
2026-08-17 (sponsrad av Apellix).
