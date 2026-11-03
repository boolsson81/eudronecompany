# Produktfilmer från DJI och Wisson — 2026-10-31

**Uppdrag:** hämta in bra videor från DJI och Wisson till system- och produktsidorna.
**Register:** `src/data/product-videos.json` (30 filmer, alla kontrollerade mot
YouTubes oEmbed-svar: titel + kanal).
**Regel:** bara tillverkarens egna kanaler (DJI, DJI Enterprise, DJI Agriculture,
DJI Tutorials, Wisson). Återförsäljares kopior försvinner, byter namn och ger fel
avsändare på vår sida.

## Vad som var fel innan

Fem av de elva film-ID:n som låg i koden var döda eller fel film:

| ID | Låg på | Problem |
|---|---|---|
| `fKkR6D-UGq0` | Zenmuse H30 / H30T | Borttagen från YouTube |
| `g1JmzqBGUKA` | Zenmuse L2 | Borttagen |
| `H_0cEpCdIjw` | Zenmuse P1 | Borttagen |
| `BNEmDcQr6hk` | Mavic 3 Pro | Är "Introducing DJI Mavic 4 Pro" — fel produkt |
| `IwIoeaGim6Q` | Inspire 3 | Privatpersons semesterfilm, inte DJI:s |

Testet `scripts/__tests__/product-videos.test.ts` stoppar dem från att komma tillbaka.

## DJI — produktsidor på React-sajten

Alla `youtubeId` i `enterpriseDroneProducts.ts`, `enterpriseCameraProducts.ts`
och `commercialDroneIndustries.ts` hämtas nu via `videoId()` från registret.

| Produkt | Film | Kanal |
|---|---|---|
| Matrice 400 (ny) | This Is DJI Matrice 400 | DJI Enterprise |
| Matrice 350 RTK | Introducing Matrice 350 RTK | DJI |
| Matrice 4E / 4T (ny) | Introducing DJI Matrice 4 Series | DJI Enterprise |
| Matrice 4D / 4TD (ny) | Matrice 4D Series — IP55 | DJI Enterprise |
| Mavic 3 Enterprise | Everything You Need To Know | DJI Enterprise |
| Mavic 3 Multispectral | Introducing DJI Mavic 3 Multispectral | DJI Enterprise |
| Agras T50 | Meet DJI Agras T50 | DJI |
| Agras T25 (ny) | DJI Agras T25 | DJI Agriculture |
| Inspire 3 (bytt) | Introducing DJI Inspire 3 | DJI |
| Mavic 3 Pro (bytt) | Introducing DJI Mavic 3 Pro | DJI |
| Dock 2 (ny) | This Is DJI Dock 2 | DJI Enterprise |
| Dock 3 (ny på produktsidan) | Introducing DJI Dock 3 | DJI Enterprise |
| Zenmuse H30 / H30T (bytt) | Introducing DJI Zenmuse H30 Series | DJI Enterprise |
| Zenmuse H20 / H20T (ny) | Matrice 300 RTK and Zenmuse H20 Series | DJI |
| Zenmuse H20N (ny) | Zenmuse H20N — Night Vision Hybrid Payload | DJI Enterprise |
| Zenmuse L1 (ny) | Zenmuse L1 — Versatile LiDAR Solution | DJI |
| Zenmuse L2 (bytt) | This is DJI Zenmuse L2 | DJI Enterprise |
| Zenmuse L3 (ny) | This is DJI Zenmuse L3 | DJI Enterprise |
| Zenmuse P1 (bytt) | Zenmuse P1 — Full-Frame Photogrammetry | DJI |
| Zenmuse S1 / V1 (ny) | This is DJI Zenmuse S1 and V1 | DJI Enterprise |

Filmgalleriet på `/kommersiella-dronare` visar nu Matrice 400, Matrice 4-serien,
Matrice 350 RTK, Dock 3, Zenmuse H30 och Zenmuse L3.

**Saknar officiell film:** Agras T100 och FlyCart 30. Alla träffar är
återförsäljares kopior (Aerosmart, Australia Agritech, XDRON, EE Group, Ferntech).
Produktsidorna visar bild tills DJI publicerar en egen.

## Wisson — systemsidor i Shopify-temat

Ny sektion `theme/sections/edp-video.liquid`: visar YouTubes miniatyr och spelar
upp via `youtube-nocookie.com` först när besökaren klickar, så inga
YouTube-cookies sätts av sidvisningen. Etiketterna ligger direkt i sektionens
schema (svenska), så sektionen kan pushas utan att locale-filerna rörs. Stilar i
`section-enterprise.css`.

`scripts/wisson/build-pages.mjs` lägger sektionen på alla sju sidorna, mellan
landningsblocket och kontaktrutan, och bevarar det metafältstyrda FAQ-blocket:

| Sida | Film |
|---|---|
| `wisson` (nav) | Wisson General-purpose Soft Robotics Industry Applications |
| `wisson-n-serien` | Orion AP30-N1 Pliable Aerial Operating Robot Platform |
| `wisson-g-serien` | Översiktsfilmen — Wisson har ingen egen film för gripdonen |
| `wisson-p-serien` | DJI M400 & WISSON AP3-P3 (2026) |
| `wisson-d-serien` | Orion Power Grid Applications — visar kontaktarbete, ingen egen D1-film |
| `fasadtvatt-dronare` | WISSON ORION AP3-P3 Pliabot Aerial Tethered Cleaning System (2026) |
| `vindkraftsunderhall-dronare` | Robot-enabled Cleaning Solution for Wind Turbine Maintenance |
| `wisson-ap3-s1` (tillagd 2026-11-03) | DJI M400 & WISSON AP3-P3 (2026) |

Wissons kanal (`@wisson`, 15 filmer i RSS-flödet) har bara egna filmer för
AP30-N1, AP3-P1 och AP3-P3. G1, G2, D1, P2, P4, P4H och P5 saknar film.
Wissons produktsidor exponerar en egen mp4 bara för AP3-P3
(`11918092.s21v.faiusr.com/58/ABUIABA6GAAg4v3yzgYoyabl2AY.mp4`) — den används
inte eftersom den är hotlinkad från Wissons CMS och kan försvinna.

## Wisson — produkter i Shopify

`scripts/wisson/apply-product-videos.mjs` lägger filmerna som extern video
(YouTube) på produkten, styrt av `wissonProducts` i registret. Den här körningen
gjordes via Shopify-kopplingen med samma mutation (`productUpdate` med `media`):

| Produkt | Status | Tillagda filmer |
|---|---|---|
| AP30-N1 (`wisson-orion-ap30-n1-…`) | ACTIVE | 7wde2_BgUL4, RjSeuGAZPSw |
| AP3-P3 (`wisson-orion-ap3-p3-…`) | DRAFT | r3t5Rj9Lth8, AGniMobXasY |

Övriga nio Wisson-produkter i butiken (G1, G2, D1, P2, P4, P4H, P5 m.fl.) har
ingen egen film på Wissons kanal och lämnades utan video.

## Kräver manuell kontroll

1. **Temat är inte deployat.** `edp-video.liquid`, CSS, locales och de sju
   mallarna ligger i repot. Pusha till **EDC Förhandsgranskning (Claude)**
   (`gid://shopify/OnlineStoreTheme/189631627592`) med `node scripts/push-edp-theme.mjs`
   och kontrollera en Wisson-sida innan mallarna går till det publicerade temat.
2. **Typecheck.** `npm run typecheck` har sedan tidigare 8 fel i
   `enterpriseDroneProducts.ts` (fältet `brand` saknas på Matrice 4-, Agras- och
   Dock-posterna). De fanns före den här ändringen och rör inte filmerna.
3. **AP3-P1 finns inte längre i butiken** (ingen produkt med `model:ap3-p1`).
   Mappningen ligger kvar i registret och skriptet hoppar över den.
   **AP3-S1** (`wisson-orion-ap3-s1-komplett-fasadtvattsystem-paket`, DRAFT) finns
   och fick 2026-11-03 taggen `model:ap3-s1` så att `apply-product-videos.mjs`
   hittar den. Filmerna AGniMobXasY och fE9c3WfKW1I lades på produkten via
   Shopify-kopplingen samma dag; en körning av skriptet rapporterar dem som
   redan på plats.
   Sidan `wisson-ap3-s1` saknade mall i både repo och tema; den byggs nu av
   `build-pages.mjs` som åttonde Wisson-sida, med samma film.
4. **Cookie-samtycke.** Sektionen laddar inget från YouTube förrän klick, men
   själva uppspelningen sätter YouTubes cookies. Vill ni knyta den till
   samtyckesrutan behöver `edp-video.liquid` läsa samma consent-flagga som GA4.
