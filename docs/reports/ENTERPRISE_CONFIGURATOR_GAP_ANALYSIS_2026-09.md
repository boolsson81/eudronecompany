# Gap-analys: enterprise-metadata mot en konfigurator

Datum: 2026-09-30
Gren: `claude/kind-wozniak-vox6pv`
Omfattning: enbart läsning från repot och butiken Europe Drone Company. Inga Shopify-objekt ändrade.
Skiljer sig från `ENTERPRISE_GAP_REPORT.md` (juni), som gäller kollektioner per plattform.

## 1. Sammanfattning

Datamodellen är byggd (fas 1–7), men det finns nästan ingen data i den. Gapet ligger i
innehållet, inte i arkitekturen.

| Mått | Läge |
|---|---|
| `edp.*`-produktfält definierade | 40 |
| Produkter med minst ett `edp.*`-värde | 0 (stickprov + fas 4–7-rapporten) |
| `payload_compatibility`-poster | 0 (räknaren släpar, seedningen skapar inga) |
| `payload_specification`-poster | 0 (samma förbehåll) |
| Seedade metaobjekt (verifierat via listning, inte räknare) | 16 UAV-plattformar, 12 payload-kategorier, 9 lösningspaket |
| Produkter taggade `enterprise` | 82, varav 7 aktiva |
| Leverantör "DJI Enterprise" | 146, varav 7 aktiva, 134 utkast, 5 arkiverade |

`metaobjectsCount` i Shopify visade 1 för plattformar, kategorier och paket trots att listning
gav 16, 12 och 9. Använd aldrig räknaren för verifiering.

## 2. Baslinje: enterprise-produkter per produkttyp och status

Källa: `productsCount` per `product_type` och `status`, 2026-09-30. Typerna kan innehålla
produkter från andra leverantörer än DJI Enterprise, och taggen `enterprise` överlappar delvis.
Summorna ska alltså inte jämföras med leverantörssiffrorna ovan.

| Produkttyp | Aktiv | Utkast | Arkiverad | Totalt |
|---|--:|--:|--:|--:|
| Enterprise Drones | 2 | 48 | 3 | 53 |
| enterprise drone (avvikande stavning) | 0 | 2 | 0 | 2 |
| Enterprise Payload | 9 | 48 | 0 | 57 |
| Enterprise Accessories | 4 | 77 | 1 | 82 |
| Enterprise Tillbehör (svenska varianten) | 0 | 0 | 7 | 7 |
| Enterprise Spareparts | 6 | 53 | 0 | 59 |
| Enterprise Software | 0 | 28 | 0 | 28 |
| Enterprise Drone Batterys | 1 | 8 | 0 | 9 |
| Enterprise Drone Camera | 0 | 14 | 0 | 14 |
| Enterprise Drone Propellers | 0 | 8 | 0 | 8 |
| Enterprise Drone Filter | 0 | 16 | 0 | 16 |
| Fjärrkontroll Enterprise | 0 | 3 | 0 | 3 |
| **Summa** | **22** | **305** | **11** | **338** |

Av 338 produkter i enterprise-typerna är 22 aktiva. En konfigurator kan bara erbjuda aktiva produkter.

## 3. Gap per dimension

Allvarlighet: Kritisk blockerar konfiguratorn, Hög ger fel eller svaga resultat, Medel försämrar kvaliteten.

| # | Krav | Läge idag | Gap | Allv. |
|---|---|---|---|---|
| 1 | Säljbart utbud | 305 av 338 enterprise-produkter är utkast | Nästan hela utbudet är opublicerat; ingen beslutad lista över vad som ska upp | Kritisk |
| 2 | Produktroll (drönare, payload, tillbehör, mjukvara, service) | ~25 splittrade `productType`-värden, ingen roll-dimension | Konfiguratorn kan inte pålitligt skilja drönare från reservdel | Hög |
| 3 | Serie och modell | Serie är fri text på `uav_platform`; produkter refererar inte till serie | Ingen produkt kopplad till serie/modell via referens | Hög |
| 4 | Drone Category | Finns inte. Bara `c_klass` (regelverk, 15 produkter) | Värden och ägare saknas | Hög |
| 5 | Drone Capability | Finns inte för drönare. Payload-sidan har `sensor_type` och `technology` | Ingen gemensam förmåge-vokabulär; krav och utbud kan inte matchas | Kritisk |
| 6 | Bransch och uppdrag | 4 oförenliga listor (`edp.industry`, taggstandarden, `mission.industry`, `mission_groups`) | Vokabulären måste slås ihop; inga produkter kopplade till uppdrag | Hög |
| 7 | Kompatibilitetsmatris | `payload_compatibility` tom; `custom.passsar_till` täcker 1350 produkter med 78 modellvärden; `edp.compatible_uav` tom | Två system för samma sak, olika granularitet (16 grupper mot 78 modeller) | Kritisk |
| 8 | Datahygien | `passsar_till` har stavfel/mellanslag (`" DJI Avata O3"`, `"DJI Marvic 2S"`); `leverantor` har dubbletten "Also Sweden"/"Also Sweden AB" | Felen ärvs vid migrering | Medel |
| 9 | Jämförbara specifikationer | 0 poster; specifika fält tomma | Jämförelsetabellen visar bara "Ej specificerat" | Hög |
| 10 | Plattformsdata | `mount_interface` tomt för 8 av 16 plattformar; `max_payload_weight` ej verifierat ifyllt | Hårda regler (fäste, vikt) kan inte köras | Hög |
| 11 | Kommersiellt | Fält finns, inga värden | Pris/offertkrav/ledtid saknas | Medel |
| 12 | Paket | 9 `solution_package`; tillbehörsreferenser tomma | Paketen saknar produktkopplingar | Hög |
| 13 | Poänglogik | Kompatibilitet, prestanda och krav spärrade vid neutral baslinje | Inget resultat kan nå 90+ förrän data finns (avsiktlig spärr) | Medel |
| 14 | UI och publicering | Finder, konfigurator, jämförelse ligger i repot; ingen browsertest; ej på live-tema | Okänd kvalitet, ingen live-effekt | Medel |
| 15 | Kvalitetsgrind | `check-payload-data-quality.mjs` finns, körs på 0 klassificerade produkter | Kan inte skydda något förrän klassificering finns | Medel |
| 16 | Analytics | Bryggan finns; `payload_filter_used` ej kopplad | Mätning kräver befintlig tag manager | Låg |

## 4. Rotorsaker

1. Arkitekturen byggdes före populeringen (uttalat beslut i fas 1–7). Populeringen återstår.
2. Tre kompatibilitetssystem lever parallellt (`passsar_till`, `edp.compatible_uav`, föreslagna taggar) utan definierad källa.
3. Drone Category och Capability har ingen definition eller ägare.

## 5. Beslut som blockerar Shopify-bygget

Ingen dimension skapas i Shopify förrän dessa är besvarade. Inga värden hittas på.

1. Vilka enterprise-produkter ska vara aktiva? (Baslinjen i avsnitt 2 är underlaget.)
2. Vilka värden ska Drone Category ha?
3. Ska Capability täcka både drönare och payloads?
4. Första steget: bara DJI Enterprise, eller alla 16 plattformar?
5. Var ligger de egna fälten Serie/Category/Capability/Industry i dag (om utanför Shopify och repot)?

## 6. Åtgärdsordning

1. Besluta utbudet (punkt 1 ovan).
2. Definiera Drone Category och Capability (punkt 2–3).
3. Välj källa för kompatibilitet och rensa `custom.passsar_till`.
4. Slå ihop branschlistorna.
5. Klassificera aktiva produkter, fyll matrisen för plattformarna, kör kvalitetsskriptet.
6. Testa i webbläsare och publicera konfiguratorn till live-temat (separat beslut).

## 7. Ej verifierat

- Endast 8 produkter stickprovades på innehåll, inte alla.
- `max_payload_weight` på plattformarna är inte kontrollerat.
- Konfiguratorn är aldrig körd i webbläsare.
- Räknare för `payload_specification` och `payload_compatibility` kan släpa.

## 8. Bilaga: drönarprodukter (radnivå, 2026-09-30)

Källa: alla produkter med `productType` "Enterprise Drones" (53) eller "enterprise drone" (2), 55 rader.
Grupperingen är gjord på titeln; inga fält har ändrats.

| Modell (utläst ur titel) | Rader | Aktiv | Utkast | Arkiverad | Kommentar |
|---|--:|--:|--:|--:|---|
| Mavic 3 Enterprise | 7 | 0 | 7 | 0 | Varianter: C1, C2, SP, Care Basic 1/2 år. En rad har vendor "DJI", övriga "DJI Enterprise" |
| Mavic 3 Thermal | 6 | 0 | 6 | 0 | Inkl. Advanced C1, SP, Universal |
| Mavic 3 Multispectral | 5 | 0 | 5 | 0 | Varianter C2 och Care Basic |
| Mavic 3 Pro CINE Premium Combo | 1 | 0 | 1 | 0 | Bör bedömas: ser inte ut som enterprise-produkt (ej verifierat) |
| Matrice 4TD | 7 | 1 | 6 | 0 | Aktiv: "(EU) w/o battery" (handle `-1`) |
| Matrice 4D | 4 | 1 | 3 | 0 | Aktiv: "(EU) w/o battery" |
| Matrice 4T | 3 | 0 | 3 | 0 | |
| Matrice 4E | 2 | 0 | 2 | 0 | Två nästan identiska rader |
| Matrice 400 | 4 | 0 | 4 | 0 | "SP Plus Combo" förekommer två gånger; en bundle med Orion AP3-P3 |
| Matrice 350 | 1 | 0 | 1 | 0 | Endast som bundle med Orion AP3-P3 |
| Matrice 30T | 3 | 0 | 2 | 1 | Inkl. dockningspaket |
| Agras (T25, T25P, T30, T50, T70P) | 6 | 0 | 5 | 1 | T50 finns två gånger (en arkiverad) |
| FlyCart | 2 | 0 | 1 | 1 | Handle `dji-flycart-100` men titeln säger FlyCart 30 |
| Inspire (2 X7 Kit, 3) | 2 | 0 | 2 | 0 | |
| Bambi Kit1 (bundle) | 1 | 0 | 1 | 0 | Oklart vad produkten är |
| Laddhubb Matrice 4D (Solectric) | 1 | 0 | 1 | 0 | Felklassad: tillbehör med `productType` "enterprise drone" |
| **Summa** | **55** | **2** | **50** | **3** | |

Observationer (bygger på tabellen, ej på gissningar):

1. 55 produktrader motsvarar cirka 16 modeller. Många rader är regionsvarianter (EU, C1, C2, SP) och
   Care-paket som separata produkter. Om konfiguratorn ska välja "modell" krävs ett beslut om varianter
   ska vara Shopify-varianter eller separata produkter.
2. De två aktiva drönarna är båda "w/o battery". En konfiguration av dem kräver att batteri och laddare
   läggs till via `required_accessories`.
3. Handle och titel skiljer sig på flera rader (t.ex. `dji-flycart-100` som heter FlyCart 30), vilket är
   en risk för `legacy_fits_value`-mappningen.
4. Plattformar i `uav_platform` som saknar drönarprodukt i dessa två produkttyper: Matrice 300 RTK,
   Matrice 3D, Freefly, Inspired Flight, Autel, Wisson Orion. Drönare som saknar plattform:
   Agras, FlyCart, Inspire, Dock-paketen. Ej undersökt om produkterna ligger under andra produkttyper.

### Aktiva payloads (9 av 57)

Alla nio är från tredje part: åtta från CZI (ML200, DT1K, GL10V2, GL60 Mini, GL60 Plus, LP35, MP130 V2,
TH4 V2) och en från Wisson Robotics (Orion AP30-N1). Inga DJI-payloads är aktiva i denna produkttyp.
Rader per övriga produkttyper är inte listade i denna bilaga.

## 9. Bilaga: payloads i utkast, mjukvara och leverantörsfördelning (2026-09-30)

Källa: Shopify Admin (läsning). Grupperingen är gjord på leverantörsfält och titel; inga fält har ändrats.

### 9.1 Payloads i utkast (48 rader)

| Leverantör (vendor-fältet) | Rader | Exempel ur titlarna |
|---|--:|---|
| CZI | 21 | Sökljus, högtalare/broadcast, matrix-ljus, termisk kamera (C30N), tryckvatten (DH100), airdrop/last (FS32, TH6), IR-laser (IR10) |
| JLIDrone | 6 | Matrix-lampor, högtalare, zoom-spotlight för Matrice 400 och Matrice 4-serien/Dock 3 |
| Wisson Robotics | 5 | Orion AP3-P1, AP3-P3, AP30-N1, AP30-P4, AP30-P4H (spruta, rengöring, manipulator) |
| DJI | 4 | Zenmuse S1, V1, H30, H30T |
| DJI Enterprise | 3 | AL1 sökarlampa, Matrice AS1 högtalare, Zenmuse X9 L-fäste |
| Tundra | 4 | Modulärt payloadsystem (range finder, dropper, IR-ljus; IR-ljus finns två gånger) |
| Solectric | 2 | DJI T25P spridar-/sprinklerpaket |
| LKTOP | 2 | KL340, LK340 40 W söklampor |
| JZ | 1 | T30 matrix-spotlight för Mavic 3E/3T |
| **Summa** | **48** | |

Observationer:

1. DJI:s egna kärnpayloads (Zenmuse H30, H30T, S1, V1) är utkast, och deras vendor är "DJI", inte
   "DJI Enterprise" som övriga DJI-enterprise-produkter. Samma tillverkare har alltså två vendor-värden.
2. Wisson Orion AP30-N1 finns dels som aktiv (kopplad till DJI FC30), dels som utkast (manipulatorarm).
   Ej verifierat om det är samma produkt.
3. Kompatibilitet står i klartext i titlarna (M300/350, M30, M400, Mavic 3E/3T, Dock 3, FlyCart 100/Agras T100,
   Matrice 4E/4T/4D/4TD). Det är ett möjligt underlag till kompatibilitetsmatrisen men måste verifieras mot
   datablad före registrering.
4. Titlarna innehåller M200/M210 och FlyCart 100/Agras T100, men `uav_platform` saknar plattformar för dessa.
5. Titlar blandar svenska och engelska, versaler, och komma-prefix ("CZI, ML200 …").

### 9.2 Mjukvara (28 rader, alla utkast)

- 22 rader är CyberXHub (Solectric): licenser, förnyelser, utökningar, en testversion.
- 6 rader är DJI FlightHub 2 (fyra via Solectric, två via DJI).
- Flera rader är inte mjukvara utan tjänster: on-site- och remote-utbildning, custom development,
  årligt underhåll. De hör till en egen roll (utbildning/service) i konfiguratorns steg 7.
- Inga mjukvaruprodukter är kopplade till payload-kategorier, vilket gör att konfiguratorns mjukvarusteg
  fortfarande är en generisk lista.

### 9.3 Leverantörsfördelning i övriga enterprise-typer

Räknat över de tio icke-drönartyperna (283 rader): DJI Enterprise 86, Solectric 37, CZI 34, Wisson Robotics 32.
Tillsammans 189; resterande 94 rader fördelas på andra leverantörer som inte är uppdelade här.
Av DJI Enterprise-raderna är 3 payloads, 24 tillbehör och 33 reservdelar (60 rader); övriga 26 ligger i
batteri-, kamera-, propeller-, filter-, fjärrkontroll- och tillbehörstyperna.

Raderna för tillbehör, reservdelar, batterier, kameror, propellrar, filter och fjärrkontroller är inte listade.
