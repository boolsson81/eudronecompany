# -*- coding: utf-8 -*-
# Egenförfattad svensk säljtext per produkt (index = ordning i to_import.json).
# Faktauppgifter är hämtade från leverantörs-/tillverkarspecifikation; texten är nyskriven.

AIRAI = ("AirAI3 är en kompakt påbyggnadsdator som ger din DJI Matrice-drönare egen beräkningskraft i luften. "
 "Med NVIDIA Jetson i botten kan du köra objektdetektering, spårning och annan bildanalys ombord i stället för att "
 "skicka rådata till marken. Monteringsfäste för Matrice 30, 300 och 350 ingår, och AIRAISDK gör det snabbt att "
 "komma igång med QGroundControl och egna AI-modeller.")

ROMO = ("Originaltillbehör från DJI till ROMO-serien. Att byta slitdelar med jämna mellanrum håller sugeffekt och "
 "städresultat på samma nivå som när roboten var ny.")

COPY = {
 0:AIRAI, 1:AIRAI, 2:AIRAI, 3:AIRAI, 4:AIRAI, 5:AIRAI,

 6:("Tröskelramp som låter DJI ROMO ta sig över nivåskillnader upp till fyra centimeter utan att fastna. "
    "Rampen byggs modulärt i steg om tio centimeter så att du kan anpassa längden efter din egen tröskel, "
    "och det texturerade spåret ger hjulen fäste även när underlaget är halt."),
 7:("Sidoborste till DJI ROMO som för in damm och smuts från kanter och hörn mot huvudborsten. "
    "Nylonstråna är styva nog att få med sig grus men skonsamma mot golvet. Slitdel som med fördel byts "
    "med jämna mellanrum."),
 8:("T90V2 är en zoombar strålkastare för DJI:s Enterprise-drönare som kombinerar kraftigt vitt arbetsljus med "
    "färgstyrning. Upp till 150 W vitt ljus ger räckvidd vid sök och inspektion, medan RGB-läget på 60 W kan "
    "användas för signalering och markering. Zoomen växlar mellan 9° och 16° så att du kan gå från punktbelysning "
    "till bredare täckning under pågående uppdrag. Styrs via PSDK i DJI Pilot 2."),
 9:("Hybridborste till DJI ROMO där borststrån och gummiblad sitter på samma vals. Kombinationen borstar loss "
    "smuts ur mattor samtidigt som gummit sveper upp damm från hårda golv. De vinklade stråna styr skräpet "
    "in mot sugkanalen."),
 10:("Multi Drop Kit PT2 ger Matrice 300, 350 och 400 möjlighet att leverera last på plats. Två fästen bär "
     "2,5 kg vardera och repet matas ut och in med ett knapptryck, vilket gör det praktiskt vid leverans till "
     "svåråtkomliga platser. Släppen styrs punkt-för-punkt direkt i DJI Pilot 2."),
 11:("Utility Drop Kit UT4 kombinerar lastsläpp med kommunikation. Fyra fästen bär upp till 6 kg vardera och "
     "släppen sker i fyra steg, samtidigt som röstuppspelning, text-till-tal och varningsljus i RGBYW gör "
     "riggen användbar vid räddningsinsatser och avspärrning."),
 12:("T90 Matrix Lamp är en strålkastare för drönare byggd kring en fyr-LED-matris som ger upp till 13 000 lumen. "
     "Den treaxliga gimbalen låter dig rikta ljuset i 360 grader oberoende av hur drönaren står, vilket gör att "
     "du kan hålla ett objekt belyst medan du flyger. En grön laser på 520 nm når över 1 000 meter och används "
     "för att peka ut mål för markpersonal."),
 13:("Drop Kit PT4 ger fyra oberoende släppkrokar med 0,1 till 3 kg kapacitet per krok. Krokarna utlöses var för "
     "sig, så du kan göra flera leveranser under samma flygning. Laserstyrningen hjälper till att träffa rätt "
     "punkt även från högre höjd."),
 14:("Högeffektivt E11-filter till DJI ROMO. Filtret fångar finpartiklar som annars blåses ut i rummet igen och "
     "är tvättbart, så det kan återanvändas flera gånger innan det behöver bytas."),
 15:("Rengöringsvätska framtagen för DJI ROMO. Löser fett och intorkad smuts i moppdynorna så att de blir rena "
     "mellan städpassen. Vätskan är rengörande, inte desinficerande."),
 16:("Moppdyna till DJI ROMO i tre lager med hög-twist frotté. Den extra tjockleken gör att dynan håller mer vatten "
     "och behåller trycket mot golvet under hela passet."),
 17:("Gummivals till DJI ROMO. Ett bra val i hem med husdjur eller långt hår, eftersom gummit inte fastnar och "
     "trasslar in sig på samma sätt som borststrån. Den flexibla profilen följer golvet och håller kontakten "
     "även på ojämna ytor."),
 18:("Golvdeodorant till DJI ROMO P. Neutraliserar lukt i samband med våttorkning och verkar direkt när roboten "
     "passerar."),
 19:("Hopfällbar landningsplatta på 1,5 meter från Hoodman. Storleken är anpassad för större drönare och materialet "
     "ligger stilla även när det blåser, vilket håller grus och damm borta från motorer och sensorer vid start "
     "och landning. Fälls ihop till transportstorlek på några sekunder."),
 20:("Centrerat dubbelfäste för Matrice 400 som låter dig bära två laster samtidigt. Snabbfästet gör monteringen "
     "snabb i fält och lutningen på 15 grader håller nyttolasterna stabila under flygning."),
 21:("Fyrkanalsladdare till DJI Agras T16 och T20 med 2 600 W maxeffekt. I single-mode läggs hela effekten på ett "
     "batteri, vilket kortar väntetiden mellan passen när du kör sprutning på löpande band."),
 22:("Komplett paket för drönarbaserad rengöring där DJI Matrice 350 kombineras med Wisson Orion AP3-P3. "
     "Systemet används för fasad- och glasrengöring på höga byggnader, underhåll av solkraftsanläggningar samt "
     "rengöring av broar, master och annan infrastruktur. I paketet ingår sex drönarbatterier och laddstation "
     "för TB65, så att arbetet kan pågå utan längre avbrott. Standardversionen är avsedd för vertikal rengöring "
     "upp till cirka 50 meter."),
 23:("Four Drop Kit ET4 är den kraftigaste släppriggen i serien med upp till 10 kg per krok. Fyra krokar med "
     "automatisk identifiering håller reda på vilken last som sitter var, och laserassisterad målmarkering gör "
     "att du kan placera lasten exakt där den ska."),
 24:("H150A kombinerar högtalare och arbetsljus i en enhet för DJI Matrice 400. Ljudnivån når 130 dB med en "
     "räckvidd på omkring 1 000 meter, vilket gör den användbar vid utrymning, avspärrning och sökinsatser "
     "där du behöver nå fram både med röst och ljus."),
 25:("Komplett paket för drönarbaserad rengöring med DJI Matrice 400 och Wisson Orion AP3-P3. Används för fasad- "
     "och glasrengöring, underhåll av solkraftsanläggningar samt rengöring av broar, master och infrastruktur. "
     "Fyra drönarbatterier och laddstation för TB100 ingår. Standardversionen är avsedd för vertikal rengöring "
     "upp till cirka 50 meter."),
 26:("Utility Drop Kit UT4A är en vidareutveckling av UT4 med fyrstegs släppsystem och 6 kg per krok. Den "
     "inbyggda sirenen har sex olika larmljud, vilket gör riggen användbar för både leverans och varning."),
 27:("Externt monteringsfäste till DJI Smart Controller Enterprise för Matrice 300 RTK. Med fästet kan du hänga "
     "på en CrystalSky-skärm eller en surfplatta bredvid handkontrollen och köra kartvy och kameravy samtidigt."),
 28:("Snabbladdningskabel från DJI Power till Matrice 4D och Mavic 4 Pro. Matrice 4D laddas med upp till 240 W "
     "och Mavic 4 Pro med upp till 190 W. Kabeln har mini-SDC till SDC-anslutning och används när du behöver "
     "ladda batterier ute i fält från en DJI Power-station."),
 29:("Spridningssystem 3.0 till DJI Agras T10 för torra material som gödsel och utsäde. Behållaren tar 8 kg och "
     "spridningsbredden når upp till sju meter, vilket ger en kapacitet på omkring 5,6 acres i timmen."),
 30:("Laddstation till DJI Agras T30 med 7 200 W laddeffekt. Ett batteri går från tomt till fullt på nio till tolv "
     "minuter, vilket i praktiken innebär att du kan hålla drönaren i luften nästan kontinuerligt med två "
     "batteripaket i rotation. Stationen har skydd mot övertemperatur, överspänning, underspänning och kortslutning."),
 31:("Sprayfäste till DJI Agras T30 anpassat för fruktodling. Munstyckena är riktade för att nå in i trädkronor "
     "från sidan i stället för rakt nedåt, och satsen ersätter originalfästena."),
 32:("Lågbrusiga propellrar med avisningsfunktion till DJI Matrice 4D-serien. Konstruktionen sänker ljudnivån och "
     "motverkar isbildning på bladen, vilket ger stabilare flygning i kall och fuktig väderlek."),
 33:("Relämodul till DJI Agras T40 och T20 som förlänger räckvidden mellan handkontroll och drönare. Praktisk när "
     "du sprutar fält med kuperad terräng eller skogsridåer som annars skymmer signalen. Ihopkopplingen görs "
     "direkt i appen."),
 34:("DJI ROMO A är robotdammsugaren i serien med 25 000 Pa sugkraft och millimeterprecis hinderavkänning. "
     "Dubbelarmen fäller ut sig i hörn och längs socklar där runda robotar annars lämnar smuts kvar."),
 35:("Dammpåse till basstationen för DJI ROMO. Fångar 99,5 procent av partiklarna ned till 0,3 mikrometer och har "
     "stor volym, så att du slipper tömma ofta."),
 36:("Isoleringsdekal till TB50-batteriet för DJI Inspire 2. Sätts över kontaktytorna och skyddar mot kortslutning "
     "och elektriska störningar vid förvaring och transport."),
 37:("Stödrigg till Inspire 2-handkontrollen som vilar mot magen och tar upp vikten. Gör längre flygpass betydligt "
     "bekvämare, särskilt när du flyger med tillsatt skärm."),
 38:("Guldpaket byggt kring DJI Matrice 350 RTK med Zenmuse L2 LiDAR för kartläggning och mätning. Paketet "
     "innehåller drönare, sensor och extrautrustning för att komma igång direkt. Observera att Matrice 350 är på "
     "väg att fasas ut – titta gärna på Matrice 400 om du planerar en långsiktig investering."),
 39:("Batteripaket till DJI Matrice 4-serien med 300 W-laddare. Tre batterier laddas effektivt i följd på omkring "
     "en timme och tolv minuter, vilket ger dig full dags flygning utan att behöva vänta in enskilda batterier."),
 40:("Guldpaket kring DJI Matrice 4T, en C2-klassad enterprise-drönare med 48 MP vidvinkelkamera och högupplöst "
     "värmekamera. Paketet levereras med DJI RC Plus 2 och Matrice 4 Series-batteri på 99 Wh som ger upp till "
     "49 minuters flygtid. Denna version är utan 4G-modul."),
 41:("Centrerat enkelfäste för Matrice 400. Snabbfästet gör monteringen enkel och lutningen på 15 grader ger "
     "precisa släpp. Lasten hamnar nära drönarens tyngdpunkt, vilket ger ett lugnare flygbeteende."),
 42:("Guldpaket med DJI Matrice 350 RTK och Zenmuse P1 för fotogrammetri. Zenmuse P1 har 45 MP fullbildssensor "
     "med utbytbara objektiv och treaxlig stabilisering, medan Matrice 350 RTK ger upp till 55 minuters flygtid "
     "och IP55-klassning."),
 43:("Spridningssystem 3.0 till DJI Agras T30 för torrt material. Tankvolymen är 40 liter och systemet väger "
     "3,9 kg, vilket gör det till ett tydligt lyft i kapacitet jämfört med tidigare generation."),
 44:("Tillbehörssats till DJI ROMO med borstar, moppdynor och dammpåsar samlade i en förpackning. Ett enkelt sätt "
     "att ha slitdelarna hemma innan de behöver bytas."),
 45:("Komplett guldpaket kring DJI Matrice 30T med 4G-uppkoppling. Drönaren är IP55-klassad och har både vidvinkel- "
     "och zoomkamera, och i paketet ingår sex TB30-batterier med laddstation samt 4G Dongle Kit för utökad "
     "räckvidd. Observera att DJI tar ut en prenumerationsavgift, för närvarande 29 EUR per år, för Enhanced "
     "Transmission."),
 46:("DJI Agras T30 är en sprutdrönare för jord- och skogsbruk med 30 liters tank och 16 munstycken. "
     "Spridningsbredden på nio meter ger en kapacitet på omkring 16 hektar i timmen. Radarsensorn känner av "
     "hinder runt om drönaren och IP64-klassningen gör att den tål både damm och vattenstänk i fält. "
     "RTK-mottagaren ger den noggrannhet som krävs för att köra exakta linjer."),
 47:("Spridningssystem 2.0 till DJI Agras T16 och T20. Sprider granulat med en kornstorlek mellan 0,5 och 5 "
     "millimeter och har inbyggd rörlåda som håller flödet jämnt."),
 48:("CCW-propellrar till DJI Agras T30, levereras parvis. Propellrar är slitdelar på en sprutdrönare – byt dem "
     "i par och kontrollera dem inför varje säsong."),
 49:("CW-propellrar till DJI Agras T30, levereras parvis. Se till att montera rätt rotationsriktning på rätt arm "
     "vid byte."),
 50:("DJI Manifold 2G är en påbyggnadsdator för drönare avsedd för bildbehandling ombord. Den används för "
     "objektigenkänning och rörelseanalys direkt i luften, så att slutsatserna finns tillgängliga redan under "
     "flygningen i stället för efter landning."),
 51:("Snabbladdningskabel från DJI Power till Air 3-serien med 125 W effekt. Ett tomt batteri når full laddning på "
     "omkring 44 minuter, och 30 minuter räcker till 95 procent."),
 52:("Snabbladdningskabel från DJI Power till Mavic 3-serien med 150 W effekt. Full laddning tar cirka 58 minuter "
     "och på 32 minuter är batteriet uppe i 95 procent."),
 53:("Nätsladd på 160 W till laddaren för DJI Phantom 4. Reservdel att ha liggande – nätsladdar är ofta det som "
     "kommer bort först i en flightcase."),
 54:("GPS-modul till Inspire 2-handkontrollen. Ger handkontrollen egen positionsbestämning, vilket förbättrar "
     "noggrannheten i funktioner som utgår från pilotens position. Enkel att montera."),
 55:("Monteringsfäste till DJI Inspire 2 för Handwheel 2, Handwheel och Focus. Kopplas till centralenheten och "
     "ger kameraoperatören en stabil arbetsplats vid tvåmanshantering."),
 56:("Propellermonteringsplattor till DJI Inspire 2 i hårdplast. Slitdel som tål upprepad montering och "
     "demontering av propellrar."),
 57:("Propellrar till DJI Inspire 3 anpassade för hög höjd. Bladprofilen ger tillräcklig lyftkraft även när "
     "luften är tunn, vilket ger pålitlig flygning i fjäll- och bergsmiljö."),
 58:("360-graders propellerskydd till DJI Lito X1 som väger endast 94 gram. Skyddar propellrarna och omgivningen "
     "vid flygning inomhus och är ett bra val när någon ovan ska lära sig flyga."),
 59:("Laddpaket till DJI Matrice 4-serien med batterihubb och 100 W USB-C-laddare. Hubben laddar fyra batterier i "
     "sekvens och har både standardläge till full laddning och standbyläge som stannar på 90 procent för "
     "skonsammare långtidsförvaring. Laddaren har två portar med stöd för PD och PPS."),
 60:("Komplett paket kring DJI Matrice 400 framtaget för renskötsel. Zenmuse H30T ger värmekamera för att hitta "
     "djur i mörker och tät terräng, medan Zenmuse V1-högtalaren används för att driva och styra hjorden. "
     "I paketet ingår även BS100 batteristation, TB100-batterier och WB37, samt 4G för uppkoppling i områden "
     "med svag täckning. Matrice 400 är C3-klassad med upp till 59 minuters flygtid. "
     "DJI tar ut en prenumerationsavgift, för närvarande 29 EUR per år, för Enhanced Transmission."),
 61:("Komplett paket med DJI Matrice 400 och Zenmuse L3, DJI:s flaggskeppssensor för drönarburen LiDAR. "
     "Räckvidden på upp till 950 meter gör att du kan skanna stora områden från säker höjd, och drönaren ger "
     "59 minuters flygtid per batteri. Ett självklart val för storskalig kartläggning, skogsinventering och "
     "infrastrukturmätning."),
 62:("Komplett paket med DJI Matrice 400 och Zenmuse L2 LiDAR för mätning med hög precision. Tre batterier ingår, "
     "och drönaren har 59 minuters flygtid, 25 m/s topphastighet och 6 kg nyttolastkapacitet. Matrice 400 är "
     "C3-klassad."),
 63:("Komplett paket med DJI Matrice 400 och Zenmuse H30T för inspektion och räddningsarbete. H30T kombinerar "
     "värmekamera med zoom och vidvinkel, vilket gör att du kan gå från översikt till detalj utan att byta "
     "nyttolast. Tre batterier ingår och drönaren är C3-klassad."),
 64:("Batteristation till DJI Inspire 2 som både förvarar och laddar upp till åtta TB50-batterier samtidigt. "
     "Väskan gör det enkelt att ta med hela batteribanken till inspelningsplatsen och komma igång direkt."),
}
