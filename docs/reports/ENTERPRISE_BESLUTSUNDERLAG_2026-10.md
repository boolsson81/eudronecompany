# Beslutsunderlag: utbud, Drone Category/Capability och omfattning

Datum: 2026-10-01
Underlag för beslut 1–3 i genomgången efter `ENTERPRISE_CONFIGURATOR_GAP_ANALYSIS_2026-09.md`.
Allt nedan är **förslag**: ingenting är aktiverat, skapat eller ändrat i Shopify.

## 1. Utbudet: vad är redo att aktiveras?

### 1.1 Mått

Förslag på minimikrav för att en produkt ska kunna ligga i konfiguratorn:

- K1: pris större än 0
- K2: minst en bild
- K3: beskrivning finns
- K4 (tillbehör och payloads): `custom.passsar_till` är ifyllt

Mätt 2026-10-01 på icke-arkiverade produkter. Pris, bild och beskrivning kommer från Shopify; om en bild är en riktig
produktbild eller en platshållare är inte kontrollerat.

### 1.2 Drönare (50 produkter, typerna Enterprise Drones och enterprise drone)

| Utfall | Antal |
|---|--:|
| Uppfyller K1–K3 | 18 |
| Pris 0 | 7 |
| Pris finns men bild och/eller beskrivning saknas | 25 |

**De två aktiva drönarna** (`dji-matrice-4d-eu-w-o-battery`, `dji-matrice-4td-eu-w-o-battery-1`) saknar både bild och
beskrivning. De är alltså aktiva men uppfyller inte K2–K3. Att de båda är "w/o battery" kräver dessutom att batteri
läggs till i en konfiguration.

**De 18 som uppfyller K1–K3**, grupperade på modell:

| Modell | Produkter |
|---|---|
| Matrice 4D | `dji-matrice-4d-rc-plus-2-enterprise-eu-sp-plus`, `dji-matrice-4d-sp-plus-eu` |
| Matrice 4T | `dji-matrice-4t-eu-termisk-drones` |
| Matrice 4TD | `dji-matrice-4td-sp-plus-eu` |
| Matrice 400 | `dji-matrice-400-eu-sp-plus-combo`, `dji-matrice-400-orion-ap3-p3-standard` (bundle med Wisson) |
| Matrice 30T | `dji-matrice-30t-drones-dockningspaket` |
| Mavic 3 Enterprise | 4 Care-varianter (`...c2-inkl-2-years-care-basic`, `...inkl-2-years-care-basic`, `...sp-eu-c1-inkl-1y-care-basic`, `...sp-2y-eu-c1-inkl-2y-care-basic`) |
| Mavic 3 Multispectral | 2 Care-varianter |
| Mavic 3 Thermal | 2 Care-varianter (Advanced C1) |
| FlyCart | `dji-flycart-100` (titeln säger FlyCart 30) |
| Agras | `dji-t25p-agras` |
| Övrigt | `dji-bambi-kit1-bundle` (oklart vad produkten är) |

**Modeller utan någon produkt som uppfyller K1–K3:** Matrice 4E (2 produkter, 18 i lager på ena), Inspire 2 och 3,
Agras T25/T30/T50/T70P, Matrice 350-bundlen. De Mavic 3-modeller som är klara är bara Care-varianter; baskonfigurationerna
saknar bild.

**Prisavvikelser att kontrollera innan aktivering:** Matrice 4T (EU) 121 150 mot Matrice 4T termisk 84 699 (samma modell,
olika produkter); fyra Matrice 4TD-varianter och flera Mavic 3-varianter har pris 0.

### 1.3 Payloads (50 av 57 hämtade)

| Utfall | Antal |
|---|--:|
| Uppfyller K1–K3 | 23 (varav 8 redan aktiva) |
| Pris 0 | 10 (bl.a. alla sex JLIDrone, CZI DH100/FS32/FS35/TH6) |
| Pris finns men bild och/eller beskrivning saknas | 17 (bl.a. Zenmuse S1, V1, H30, H30T och Tundra) |

Av de 15 utkast som uppfyller K1–K3:

- **8 uppfyller även K4** (har `passar till`): `czi-c30n-thermal-camera`, `czi-ft10-v2-flame-thrower`,
  `czi-ir10-ir-808nmlaser-zoomsptlght`, `czi-lp12-sokljus-dji-m30`, `czi-mp130-pro-digital-voice-broadcasting`,
  `czi-mp140-digital-voice-broadcasting`, `czi-sl60-strobe-searchlight`, `jz-t30-dji-mavic-3e-3t-30w-spotlight`.
- **7 saknar `passar till`**: `czi-pk10-ljudupptagare`, `czi-cz10-tethered-hover-light`, `dji-al1-spotlight-drones`,
  `dji-matrice-as1-speaker`, `lktop-kl340-40w-soklampa-drones`, `lktop-lk340-40w-dronarsoklampa`,
  `dji-zenmuse-x9-l-faste-original`.

De 8 redan aktiva payloads uppfyller alla K1–K4. Det nionde aktiva (Wisson AP30-N1) ingår inte i de 50 hämtade.

### 1.4 Förslag

1. **Aktivera inget än.** Konfiguratorn är inte testad, så aktivering har ingen nytta förrän den är klar.
2. **Omgång 1 (när konfiguratorn är redo):** de 8 payloads som uppfyller K1–K4 plus de 8 som redan är aktiva
   (totalt 16 payloads). Drönare: ett beslut krävs om varianterna (se nedan).
3. **Före omgång 2:** ge de 7 payloads utan `passar till` ett värde, och sätt pris på de 10 med pris 0.
4. **Beslut för drönarna:** 18 uppfyller kraven, men 13 av dem är Care-paket eller bundlar medan baskonfigurationerna saknar
   bild. Välj mellan att (a) komplettera baskonfigurationerna med bild och beskrivning och göra Care som tillval, eller
   (b) aktivera paketen som de är.
5. **De två aktiva drönarna** saknar bild och beskrivning: besluta om de ska kompletteras eller tillfälligt sättas i utkast.

## 2. Drone Category och Capability

### 2.1 Drone Category (förslag på värden, ej beslutat)

Förslaget bygger på de familjer som finns bland de 55 drönarprodukterna och i plattformsdatan
(`data/edp-payload-taxonomy.json`). Värdena är en indelning efter användning, eftersom det är det konfiguratorn
behöver; de är inte en teknisk standard.

| Förslag | Ingår (enligt katalogen) |
|---|---|
| Modulär plattform (utbytbara payloads) | Matrice 400, 350, 300 |
| Kompakt enterprise (integrerad eller utbytbar sensor) | Matrice 4-serien, Matrice 30, Matrice 3D, Mavic 3 Enterprise/Thermal/Multispectral |
| Jordbruk och sprutning | Agras T25P, T25, T30, T50, T70P |
| Transport och last | FlyCart 30, FlyCart 100 |
| Filmproduktion | Inspire 2, Inspire 3 |
| Dock (automatiserad drift) | DJI Dock 3 och drönarpaket som kopplar till den |

Frågor att avgöra: ska "Dock" vara en kategori eller en egenskap hos en drönare (Matrice 4D/4TD/30T används med dock)?
Ska en drönare kunna ha flera kategorier?

### 2.2 Capability (förslag: ett gemensamt ordförråd, delvis redan definierat)

Taxonomin har redan ordförråd som kan återanvändas, så inga nya värden behöver hittas på för första steget
(`finder` i `data/edp-payload-taxonomy.json`):

- **Sensorteknik (13):** rgb, zoom, thermal, eo-ir, lidar, multispectral, hyperspectral, gas, radiation, spotlight, speaker, mapping, other
- **Miljö (8):** day, night, smoke, low-light, indoor, outdoor, long-distance, difficult-terrain
- **Uppgift (11):** inspect, survey, map, measure-temperature, detect-gas, search, monitor, scan, detect-vegetation, measure-terrain, identify-materials

Förslag: ett `capability`-metaobjekt med dessa tre grupper, som både payloads, drönare och uppdrag pekar på. Då kan
konfiguratorn matcha "uppdraget kräver X" mot "produkten erbjuder X".

**Det som inte bör vara capability:** numeriska specifikationer (flygtid, max nyttolast, IP-klass, drifttemperatur) är
mätvärden, inte kategorier. De hör till typade metafält (`edp.ip_rating`, `edp.weight` m.fl. finns redan definierade).
Dessa är tomma och kräver datablad per modell.

Frågor att avgöra: ska capability gälla både drönare och payloads (rekommenderas), eller bara payloads?
Drönarsidan har inga capability-värden i dag och kräver datablad eller manuell bedömning per modell.

## 3. Omfattning

Mätt 2026-10-01:

- Hela butiken har **0 produkter** för Freefly, Autel och Inspired Flight. Dessa tre tillverkare finns bara som
  plattformar i `uav_platform`.
- Wisson Robotics har 39 produkter (2 aktiva), men Wisson Orion har inget värde i `custom.passsar_till` (medvetet inte tillagt).
- Alla 55 drönarprodukter är DJI. Kompatibilitetsvärden finns för 8 DJI-plattformar.

**Förslag:** fas 1 omfattar de 8 DJI-plattformarna och de tredjepartspayloads (CZI, JLIDrone, JZ, LKTOP) som passar dem.
Freefly, Autel, Inspired Flight och Wisson Orion tas med först när produkter och kompatibilitetsvärden finns.

## 4. Det som behövs för att gå vidare

| Beslut | Förslag ovan |
|---|---|
| Utbud | Avsnitt 1.4: omgångar, krav K1–K4, beslut om drönarvarianter |
| Drone Category | Avsnitt 2.1: sex värden, två frågor |
| Capability | Avsnitt 2.2: återanvänd befintligt ordförråd, numeriska specifikationer som egna fält |
| Omfattning | Avsnitt 3: DJI först |
