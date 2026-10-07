# DRS – prisförslag för Shopify-utkasten (2026-10-07)

Underlag: `data/drs-prislista-2026.json` (DRS Price List 2026, EUR, v1.1). Inget är skrivet till Shopify.

## Antaganden som du behöver bekräfta

- **Kurs 11.25 SEK/EUR**, samma som i `data/wisson-inkopspriser-202607.json` (satt 2026-09-08). Ändra om den ska vara en annan.
- **Priserna är exkl. moms.** Listan anger inte moms, och DRS är österrikiskt. Lägg på 25 % om butiken ska visa pris inkl. moms.
- **Förslaget är DRS listpris omräknat till SEK, avrundat till närmaste 100 kr.** Listan verkar vara DRS:s kundpris/MSRP (villkoren talar om MSRP), så ett påslag ovanpå skulle ge högre pris än tillverkaren. Vår marginal kommer då av återförsäljarrabatten, som ännu inte är känd. Fråga DRS om den och om bulknivåerna (3+ enheter).

## Matchade utkast (19 varianter i 18 produkter)

| SKU | Produkt | Prislistans artikel | EUR | Förslag SEK exkl. moms |
| --- | --- | --- | ---: | ---: |
| DRS-5R-V2 | DRS-5R V2 (2–5 kg) | DRS-5R | 2 290 | 25 800 |
| DRS-10R-V2 | DRS-10R V2 (5–10 kg) | DRS-10R | 2 690 | 30 300 |
| DRS-15R-V2 | DRS-15R V2 (10–15 kg) | DRS-15R | 3 490 | 39 300 |
| DRS-25R-V2 | DRS-25R V2 (15–25 kg) | DRS-25R | 4 890 | 55 000 |
| DRS-M400 | DJI Matrice 400 | DRS-M400 | 3 490 | 39 300 |
| DRS-M300-M350 | DJI Matrice 300/350 | DRS-M300 / 350 RTK | 3 190 | 35 900 |
| DRS-ALTAX | Freefly Alta X | DRS-AltaX | 4 790 | 53 900 |
| DRS-ASTRO | Freefly Astro | DRS-Astro | 3 190 | 35 900 |
| DRS-H6 | Harris Aerial H6 | DRS-H6 | 4 890 | 55 000 |
| DRS-HX8 | Harris Aerial HX8 | DRS-HX8 | 4 890 | 55 000 |
| DRS-NOA | Acecore NOA | DRS-NOA | 4 890 | 55 000 |
| DRS-ZOE | Acecore ZOE | DRS-ZOE | 3 190 | 35 900 |
| DRS-X55 | ArcSky X55 | DRS-X55 | 4 890 | 55 000 |
| DRS-TUNDRA2 | Hexadrone Tundra 2 | DRS-Tundra 2 | 2 590 | 29 100 |
| DRS-IF1200 | Inspired Flight IF1200 | DRS-IF1200 | 4 890 | 55 000 |
| DRS-FTS | FTS (MAVLink-set) | DRS-FTS V2 Set MAVLink | 900 | 10 100 |
| DRS-MTD-EU | MTD  EU-variant | Manual Trigger Device | 450 | 5 100 |
| DRS-MTD-NONEU | MTD  icke-EU-variant | Manual Trigger Device | 450 | 5 100 |
| DRS-GEOFENCING | Geofencing | Geofencing | 975 | 11 000 |

## Utkast utan motsvarighet i prislistan

- **DRS-HEAVYLIFT** (25–250 kg): listan har DRS-35R/75R/100R (5 190 / 5 950 / 6 490 EUR) och kundspecifika system, men ingen HeavyLift-post. Behåll *Pris på förfrågan*.
- **DRS-AQ-200FP** (Argosdyne): saknas i listan. Behåll *Pris på förfrågan* och fråga DRS.
- **DRS-WINGTRARAY** (Wingtra): saknas i listan. Behåll *Pris på förfrågan* och fråga DRS.

## Poster i prislistan utan utkast

DRS-M600 (3 190), DRS-M30 (2 290), DRS-X8 (4 890), DRS-X6 (3 490), DRS-SWIFT (1 748,70), DRS-Velos V3 (5 090), DRS-35R/75R/100R, DRS-FTS med PWM-cutter (1 140, ej släppt), Geofencing-ready (250), reservfallskärmar FS-5 till FS-125 (290–1 150) samt service och utbildning.

## Att tänka på innan priserna läggs in

- Utkasten har taggen *Pris på förfrågan*. Den ska tas bort när ett pris sätts, annars säger produkten emot sig själv.
- Utkasten är kvar som DRAFT. Publicering kräver pris, bilder och att DRS gett rätt att använda bilderna.
- DRS-H6 och DRS-Astro hade öppna datafrågor (systemvikt respektive MOC Q3 2026) enligt registret. Kontrollera dem före publicering.
- Prislistan är konfidentiell. Våra *försäljningspriser* är offentliga, men DRS listpris och villkor får inte delas vidare.
