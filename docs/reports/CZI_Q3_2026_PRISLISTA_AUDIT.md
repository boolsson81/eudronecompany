# CZI Q3 2026-prislista — genomgång mot Shopify

Datum: 2026-09-24. Källa: uppladdad PDF "Q3 price_list euro" (CZI, 4 sidor,
daterad 2026 Q3). Jämförd mot `vendor:CZI` i Shopify-butiken **Europe Drone
Company** (samma butik som är kopplad via Shopify MCP i den här sessionen).

## Sammanfattning

| Status | Antal unika modeller |
| --- | --- |
| Aktiv i Shopify och matchar prislistan | 11 |
| Upplagd men DRAFT (opublicerad) | 19 |
| Saknas helt — registrerad som inköpsprospekt | 27 |

Under genomgången hittades och åtgärdades:

- **15 dubbletter/skräpposter arkiverade** (se lista nedan) — samma modell
  importerad flera gånger, ofta med tom beskrivning och taggen `Imported`.
  Två av dem var live (`ACTIVE`) och orsakade att samma produkt visades med
  olika pris på två olika sidor (GL10 V2: 8 999 kr vs 13 740 kr, GL60 Mini:
  20 250 kr vs 41 057,50 kr) — den bristfälliga dubbletten arkiverades i
  båda fallen, den fullständiga SEO-anpassade produkten behölls.
- **1 kritisk prisbugg fixad**: CZI DH100 (multifunktionellt vattensystem)
  var `ACTIVE` med pris **0 kr** — dvs köpbar gratis i butiken. Satt till
  `DRAFT` i väntan på ett riktigt pris.
- **27 nya prospekt registrerade** i `data/inkopsprospekt.json` för modeller
  som saknas helt (se `npm run prospekt:list -- --leverantor CZI`).

## Kvarstående att bestämma (kräver ett pris-/publiceringsbeslut, inte kod)

- **C30N** (DRAFT, 524 999 kr) ser fel ut — DT1K, en jämförbar/dyrare
  nattkamera enligt prislistan (RRP €14 999 vs C30N:s RRP €14 999 — samma
  RRP faktiskt), ligger på 166 999 kr som aktiv produkt. C30N:s pris bör
  kontrolleras innan den publiceras.
- Flera DRAFT-produkter har **pris 0 kr**: ES638/ES838, FS32 (Logistic
  Payloads Kit), FS35 ("Appearance" — trasig titel, är FlyCart 100/FS35
  Delivery System), TH6. Ofarligt så länge de är DRAFT, men de kan inte
  publiceras förrän pris satts.
- 19 modeller ligger som DRAFT och kräver ett aktivt beslut om de ska säljas
  nu (se tabellen nedan) — inget pris har ändrats åt något håll utan
  bekräftelse, i linje med att listpris/dealerpris inte är samma sak som
  butikens säljpris.

## Arkiverade dubbletter/skräpposter

| Shopify-ID | Titel | Anledning |
| --- | --- | --- |
| 10293770846536 | CZI, ML200 (800W) MATRIX LIGHT | Dubblett av aktiv ML200 800W |
| 10159914090824 | CZI Tethered Power System with ML200 Matrix Light Combo | Dubblett av aktiv ML200 800W (samma pris/bild) |
| 10293773205832 | CZI, DT1 K NIGHT VISION CAMERA | Dubblett av aktiv DT1K |
| 10159910420808 | CZI, LP20 SEARCHLIGHT AND BROADCASTING | Dubblett av aktiv LP20 |
| 10159935488328 | CZI, LP20 SEARCHLIGHT BROADCASTING SYSTE | Dubblett av aktiv LP20 |
| 10159955968328 | CZI, LP35 SEARCHLIGHT AND BROADCASTING | Dubblett av aktiv LP35 (identiskt pris) |
| 10159898427720 | CZI TH4 V2 ThrowingHook f DJI M200/300 | Dubblett av aktiv TH4 V2 |
| 10293777137992 | CZI, FT10 V2 FLAME THROWER | Tom dubblett, behöll versionen med beskrivning |
| 10293744730440 | CZI MP140 DIGITAL VOICE BROADCASTING | Tom dubblett, behöll versionen med beskrivning |
| 10293771764040 | CZI, SL60 STROBE SEARCHLIGHT | Tom dubblett, behöll versionen med beskrivning |
| 10159931785544 | CZI GL60 Spotlight Plus f DJI M200/300/3 | Dubblett av aktiv GL60 Plus |
| 10159906783560 | CZI LP12 Speaker & Spotlight for M30 | Tom dubblett, behöll versionen med beskrivning |
| 10282131063112 | Searchlight & Broadcasting System | Trasig import utan namn/pris/beskrivning |
| 10159911076168 | CZI, GL10 V2 GIMBAL SEARCHLIGHT | Live dubblett av GL10 V2 till annat pris (13 740 kr) |
| 10159919104328 | CZI GL60 MINI Gimbal Spotlight for M30 | Live dubblett av GL60 Mini till annat pris (41 057,50 kr) |

## Fullständig mappning, prislista → Shopify

RRP i EUR om inget annat anges. "saknas" innebär registrerad i
`data/inkopsprospekt.json` med prefix `czi-`.

| Modell (prislista) | RRP | Shopify-status | Shopify-ID / prospekt-id |
| --- | --- | --- | --- |
| CZ10 Tethered Hover Light | €1 099 | DRAFT | 10159939027272 |
| CZ100 Tethered Lighting System | €12 999 | saknas | czi-cz100-tethered-lighting-system |
| CZ100V Tethered Lighting System (zoom+värme) | €17 999 | saknas | czi-cz100v-tethered-lighting-system-med-zoom-och-varmekamera |
| TK4 Tethered Power System (110m) | €11 999 | DRAFT | 10159918940488 |
| TK4 Tethered Power System (200m) | €12 999 | saknas | czi-tk4-tethered-power-system-200m |
| ML200 Matrix Light (400W) | — | DRAFT | 10159897837896 |
| ML200 Matrix Light (800W) | — | **ACTIVE** | 10280218526024 |
| ML200 Matrix Light (1500W) | €2 899 | saknas | czi-ml200-1500w-matrix-light |
| GL310 High Power Gimbal Spotlight (ny) | €3 899 | saknas | czi-gl310-high-power-gimbal-spotlight |
| GL60 PLUS Gimbal Searchlight | €1 499 | **ACTIVE** | 10089060630856 |
| SL60 Strobe Searchlight | €2 999 | DRAFT | 10159946432840 |
| MP135 Multi-functional Megaphone (ny) | €2 699 | saknas | czi-mp135-multi-functional-megaphone |
| Eload5 M400 Winch System 5kg (ny) | €4 399 | saknas | czi-eload5-m400-winch-system-5kg |
| MP130 PRO Digital Voice Broadcasting | €1 099 | DRAFT | 10159951708488 |
| TH4 V2 Throwing Hook | €1 099 | **ACTIVE** | 10089060794696 |
| TH4 V3 Throwing Hook (endast M400) | $1 099 | saknas | czi-th4-v3-throwing-hook-for-m400 |
| IR10 Infrared Zoom Spotlight | €5 999 | DRAFT | 10159946793288 |
| C30N Night Vision Camera | €14 999 | DRAFT (pris ser fel ut, se ovan) | 10159905538376 |
| FL60 Multi-color Flashing Light | €499 | DRAFT | 10159937323336 |
| ES638/ES838 Electrify Triggering Launcher Set | €3 599 | DRAFT (pris 0 kr) | 10282092888392 |
| FT10 V2 Flame Thrower | €6 199 | DRAFT | 10159948333384 |
| TK3-M4 Tethered Power System 50m (ny) | €10 899 | saknas | czi-tk3-m4-tethered-power-system-50m |
| GL10 V2 Gimbal Searchlight | €799 | **ACTIVE** | 10091727814984 |
| TH2 Throwing Hook (M4E/M4T) | €169 | DRAFT (osäker match) | 10159915204936 ("Throwing Hook - Matrice 4") |
| MF30 Drone Flow Meter (M4/M30) | €5 999 | saknas | czi-mf30-drone-flow-meter |
| TK3-M4D/TD Tethered Power System Set (ny) | €6 500 | saknas | czi-tk3-m4d-td-tethered-power-system-set |
| LP20 Searchlight and Broadcasting System | €1 699 | **ACTIVE** | 10088733770056 |
| MP120 Broadcasting Light | €499 | DRAFT | 10159919726920 |
| MP10E Broadcast and Sound Pickup System | €799 | DRAFT | 10159908684104 |
| PK10 Sound Pickup System | €399 | DRAFT | 10089060696392 |
| TK3-M30 Tethered Power System | €10 999 | saknas | czi-tk3-m30-tethered-power-system |
| TK3-M30 + ML200(400W) Set | €11 999 | saknas | czi-tk3-m30-tether-power-system-och-ml200-400w-matrix-light-set |
| LP12 Searchlight and Broadcasting System | €1 399 | DRAFT | 10089048965448 |
| GL60 MINI Gimbal Spotlight | €1 399 | **ACTIVE** | 10089060729160 |
| IR3 Infrared Zoom Spotlight | €2 299 | DRAFT | 10159898853704 |
| TK3-M350 Tethered Power System | €11 999 | saknas | czi-tk3-m350-tethered-power-system |
| TK3-M350 + ML200(800W) Set | €12 999 | saknas | czi-tk3-m350-tether-power-system-och-ml200-800w-matrix-light-set |
| DT1K Night Vision Camera | €11 999 | **ACTIVE** | 10220802539848 |
| MP140 Digital Voice Broadcasting System | €4 999 | DRAFT | 10159975301448 |
| FC30/FS32 Payload Set | €5 999 | DRAFT | 10159897968968 (även 10282091741512, endast FS32) |
| TH6 (FC100/T100 Delivery System) (ny) | €2 990 | DRAFT (pris 0 kr) | 10282043900232 |
| FlyCart 100 / FS35 Delivery System | €1 099 | DRAFT (pris 0 kr, trasig titel "FS35 Appearance") | 10282032005448 |
| DH100 Water Tank Version | €9 990 | DRAFT (satt från ACTIVE/0kr, se ovan) | 10282010607944 |
| T40/TD40 Material Delivery Dropping Device | €1 199 | saknas | czi-t40-td40-material-delivery-dropping-device |
| TK3 Backpack Set (M30 & M350) | €16 999 | saknas | czi-tk3-backpack-tethered-power-system-set-m30-och-m350 |
| TK3 + Air Module Set (M30 & M350) | €14 999 | saknas | czi-tk3-tethered-power-system-set-med-air-modules-m30-och-m350 |
| TK3-M30 Air Module | €3 600 | saknas | czi-tk3-m30-air-module |
| TK3-M350 Air Module | €4 000 | saknas | czi-tk3-m350-air-module |
| BS16 UAV Battery Charging Cabinet (ny) | — | saknas | czi-bs16-uav-battery-charging-cabinet |
| NV10 Night Vision Binoculars (ny) | €15 999 | saknas | czi-nv10-night-vision-binoculars |
| MT10 Emergency Lighting Power Bank (ny) | €49 | saknas | czi-mt10-emergency-lighting-power-bank |
| MT20 Multi-functional Outdoor Searchlight (ny) | €199 | saknas | czi-mt20-multi-functional-outdoor-searchlight |
| MT60 Multi-functional Handheld Searchlight | €299 | saknas | czi-mt60-multi-functional-handheld-searchlight |
| MT100 High-Power Handheld Searchlight | €329 | saknas | czi-mt100-high-power-handheld-searchlight |
| LL600 360° Automatic Floodlight Work Lamp | €2 999 | saknas | czi-ll600-360-degree-automatic-floodlight-work-lamp |

## Källor

- PDF: "Q3 price_list-euro" (uppladdad av användaren), extraherad med `pypdf`.
- Shopify: `vendor:CZI`-sökning via Shopify MCP mot butiken Europe Drone
  Company, 2026-09-24.
- Registret: `data/inkopsprospekt.json`, se `docs/INKOPSPROSPEKT.md`.
