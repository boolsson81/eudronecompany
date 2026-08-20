# EuroDroneParts — Full Store Audit Report

**Generated:** 2026-06-13T09:29:49.594Z
**Store:** ya1xhg-x6.myshopify.com
**Shop URL:** https://ya1xhg-x6.myshopify.com
**Migration ID:** `3d9876af-885c-49e9-a4b0-c4943c06112f`

> **STATUS: AWAITING APPROVAL** — This is a read-only audit. No collections, menus, pages, or products were modified.

---

## Executive summary

| Metric | Value |
|--------|------:|
| Live products | 9,389 |
| Live pages | 61 |
| Live collections | 157 |
| Live menus | 29 |
| Collections → KEEP | 146 |
| Collections → MERGE | 1 |
| Collections → DELETE | 10 |
| Protected empty (Legacy/Enterprise/FlyCart/Industry) | 34 |
| **Projected collections after cleanup** | **~136** |

### Key findings

1. **Business model is broader than spare parts** — 9,389 products span consumer drones, enterprise platforms, accessories, spare parts, and legacy lines.
2. **No collection is menu-linked today** — `main-menu` points to `/collections/all`; taxonomy must be wired into navigation.
3. **43 empty collection shells exist** — but **only 10 are safe DELETE candidates** under your rules; the rest are protected Legacy DJI, Enterprise, FlyCart, or Industry Solutions.
4. **1 MERGE required** — `dji-mavic-3-classic-1` → `dji-mavic-3-classic`.
5. **Menus were recreated** — 29 live menus (orphan duplicates from migration worker); 24 are safe to remove after theme confirm.
6. **2 page references** — `dji` and `dji-dronare` linked from page `dji-osmo`.

---

## 1. Complete collection inventory

Total: **157** collections (113 with products, 43 empty).

| Handle | Title | Products | Taxonomy | Action | SEO | Menu | Page | Theme |
|---|---|---:|---|---|---|---|---|---|
| `airdrop-system` | Airdrop System | 22 | Sensors & Payloads | KEEP | 20 | — | — | — |
| `alla-produkter` | Alla produkter Drönare | 841 | Accessories | KEEP | 44 | — | — | — |
| `amagisn-kameratillbehor-och-dronarutrustning` | kameratillbehör - AMagisn Tillbehör för Kamera och Drönare | 149 | Accessories | KEEP | 33 | — | — | — |
| `bandverktyg` | Bändverktyg för Precisionsreparationer | 2 | Accessories | KEEP | 7 | — | — | — |
| `batterier` | Batterier och laddare | 64 | Accessories | KEEP | 27 | — | — | — |
| `belysning-till-dronare` | Belysning till drönare | 28 | Accessories | KEEP | 22 | — | — | — |
| `brdrc-tillbehor` | Kompletta BRDRC Tillbehör för Din Utrustning | 134 | Accessories | KEEP | 32 | — | — | — |
| `dij-air-3-serien` | DJI Air 3-Serien för Professionell Flygfotografering | 3 | Consumer DJI | KEEP | 9 | — | — | — |
| `dji` | DJI: Innovation inom Drönarteknik | 84 | Consumer DJI | KEEP | 54 | — | dji-osmo | — |
| `dji-agras-dronare` | DJI Agras Drönare för Precisionsjordbruk | 1 | Enterprise DJI | KEEP | 13 | — | — | — |
| `dji-air-2-serien` | DJI Air 2 Serien: Drönare och Tillbehör | 1 | Legacy DJI models | KEEP | 15 | — | — | — |
| `dji-air-2-tillbehor` | Högkvalitativa DJI Air 2 Tillbehör för Drönare | 0 | Legacy DJI models | KEEP | 5 | — | — | — |
| `dji-air-2s` | DJI Air 2S | 1 | Legacy DJI models | KEEP | 15 | — | — | — |
| `dji-air-2s-tillbehor` | DJI Air 2S Tillbehör – Optimerad Flygning | 0 | Legacy DJI models | KEEP | 5 | — | — | — |
| `dji-air-3` | DJI AIR 3 | 3 | Consumer DJI | KEEP | 9 | — | — | — |
| `dji-air-3-serien` | DJI Air 3 Serien | 0 | Consumer DJI | DELETE | -5 | — | — | — |
| `dji-air-3-tillbehor-omfattande-sortiment` | Omfattande Sortiment av DJI Air 3 Tillbehör | 66 | Consumer DJI | KEEP | 27 | — | — | — |
| `dji-air-3s` | DJI Air 3S | 2 | Consumer DJI | KEEP | 7 | — | — | — |
| `dji-air-serien` | DJI AIR-serien | 6 | Consumer DJI | KEEP | 13 | — | — | — |
| `dji-avata` | DJI Avata: Framtidens FPV Drönare | 0 | Consumer DJI | DELETE | -5 | — | — | — |
| `dji-avata-2-tillbehor` | DJI Avata 2 tillbehör – Skydd & batterier till din drönare | 51 | Consumer DJI | KEEP | 26 | — | — | — |
| `dji-avata-pro-fpv-dronare` | Avata Pro FPV-Drönare – Nästa Generations Flygning | 2 | Consumer DJI | KEEP | 7 | — | — | — |
| `dji-avata-serien` | DJI Avata-Serien | 2 | Consumer DJI | KEEP | 7 | — | — | — |
| `dji-avata-tillbehor` | DJI Avata Tillbehör | 6 | Consumer DJI | KEEP | 13 | — | — | — |
| `dji-dronar-reservdelar` | Hitta DJI-drönar reservdelar av hög kvalitet | 16 | Spare Parts | KEEP | 18 | — | — | — |
| `dji-dronare` | DJI Drönare | 22 | Accessories | KEEP | 45 | — | dji-osmo | — |
| `dji-dronare-fjarrkontroller` | Fjärrkontroller och Tillbehör för DJI Drönare | 7 | Consumer DJI | KEEP | 14 | — | — | — |
| `dji-enterprise-fjarrkontroller` | Professionella Fjärrkontroller för DJI Enterprise | 3 | Accessories | KEEP | 9 | — | — | — |
| `dji-flip-batteri-tillbehor` | Optimala DJI Flip tillbehör – Maxa din drönarupplevelse! | 3 | Consumer DJI | KEEP | 9 | — | — | — |
| `dji-flip-dronare` | DJI Flip: Kompakta Vikbara Drönare | 3 | Consumer DJI | KEEP | 9 | — | — | — |
| `dji-flip-tillbehor` | DJI Flip™ tillbehör – Optimal utrustning till din drönare | 63 | Consumer DJI | KEEP | 27 | — | — | — |
| `dji-flycart-100-lastdronare` | DJI FlyCart 100: Lastdrönare för Tunga Lyft | 0 | FlyCart | KEEP | -5 | — | — | — |
| `dji-flycart-serien` | DJI FlyCart Serien | 0 | FlyCart | KEEP | -5 | — | — | — |
| `dji-fpv-tillbehor` | Dji FPV Tillbehör – Optimera Din Flygning Med Kvalitet | 1 | Consumer DJI | KEEP | 5 | — | — | — |
| `dji-inspire` | DJI Inspire Serien Professionella Drönare för Kreatörer | 0 | Legacy DJI models | KEEP | 5 | — | — | — |
| `dji-inspire-serien` | DJI Inspire Serien | 0 | Legacy DJI models | KEEP | 5 | — | — | — |
| `dji-marvic-enterprise` | DJI Marvic Enterprise | -2 | Enterprise DJI | KEEP | 8 | — | — | — |
| `dji-matrice-3-serien` | DJI Matrice 4 Serien | 0 | Enterprise DJI | KEEP | 3 | — | — | — |
| `dji-matrice-30-serie-tillbehor` | dji arm - DJI Matrice 30 Serie Tillbehör | 0 | Enterprise DJI | KEEP | 3 | — | — | — |
| `dji-matrice-350-rtk-tillbehor` | DJI Matrice 350 RTK Tillbehör och Skydd | 0 | Enterprise DJI | KEEP | 3 | — | — | — |
| `dji-matrice-4-serie` | dji matrice 4 Serie | 0 | Enterprise DJI | KEEP | 3 | — | — | — |
| `dji-matrice-4-tillbehor` | DJI Matrice 4 Tillbehör för Professionella Drönare | 0 | Enterprise DJI | KEEP | 3 | — | — | — |
| `dji-matrice-400-serien` | DJI Matrice 400 Serien för Professionella Uppdrag | 0 | Enterprise DJI | KEEP | 3 | — | — | — |
| `dji-matrice-serien` | DJI Matrice-serien – Professionella Enterprise-drönare | 0 | Enterprise DJI | KEEP | 3 | — | — | — |
| `dji-mavic-2-pro` | DJI Mavic 2 Pro | 1 | Legacy DJI models | KEEP | 15 | — | — | — |
| `dji-mavic-2-serien` | DJI Mavic 2-serien: Avancerade Drönare | 2 | Legacy DJI models | KEEP | 17 | — | — | — |
| `dji-mavic-3-cine-dronare` | DJI Mavic 3 Cine: Ultimata Drönaren för Filmskapare | 1 | Consumer DJI | KEEP | 5 | — | — | — |
| `dji-mavic-3-classic` | Tillbehör DJI Mavic 3 Classic | 15 | Consumer DJI | KEEP | 18 | — | — | — |
| `dji-mavic-3-classic-1` | DJI Mavic 3 Classic | 2 | Consumer DJI | MERGE | 7 | — | — | — |
| `dji-mavic-3-enterprise` | DJI Mavic 3 Enterprise - Kvalitet & | 0 | Enterprise DJI | KEEP | 3 | — | — | — |
| `dji-mavic-3-pro-avancerad-dronarteknik` | DJI Mavic 3 Pro: Avancerad Drönarteknik | 5 | Consumer DJI | KEEP | 12 | — | — | — |
| `dji-mavic-3-pro-tillbehor` | DJI Mavic 3 Pro tillbehör – Drönartillbehör för proffs | 11 | Consumer DJI | KEEP | 16 | — | — | — |
| `dji-mavic-3-serien` | DJI Mavic 3-serien: Proffsens val av drönare | 11 | Consumer DJI | KEEP | 16 | — | — | — |
| `dji-mavic-3-tillbehor` | DJI Mavic 3 Tillbehör för Optimal Prestanda | 66 | Consumer DJI | KEEP | 27 | — | — | — |
| `dji-mavic-3m-dronare-tillbehor` | DJI Mavic 3M Drönare och Tillbehör | 0 | Enterprise DJI | KEEP | 3 | — | — | — |
| `dji-mavic-4-pro` | DJI Mavic 4 Tillbehör | 3 | Consumer DJI | KEEP | 9 | — | — | — |
| `dji-mavic-4-serien` | Upptäck DJI Mavic 4-serien för exceptionell flygfotografering | 3 | Consumer DJI | KEEP | 9 | — | — | — |
| `dji-mavic-air-tillbehor` | Komplett utbud av DJI Mavic Air Tillbehör | 39 | Consumer DJI | KEEP | 24 | — | — | — |
| `dji-mavic-pro-batteri-vaska` | dji mavic pro batteri väska - DJI Mavic Pro Batteriväska och Tillbehör | 5 | Consumer DJI | KEEP | 12 | — | — | — |
| `dji-mavic-pro-tillbehor` | Omfattande DJI Mavic Pro Tillbehör | 46 | Consumer DJI | KEEP | 25 | — | — | — |
| `dji-mavic-serien` | DJI Mavic-Serien | 6 | Consumer DJI | KEEP | 13 | — | — | — |
| `dji-mavic-serien-enterprise` | DJI Mavic Serien enterprise | 0 | Enterprise DJI | KEEP | 3 | — | — | — |
| `dji-mavic-tillbehor` | Dji Mavic Tillbehör för Förbättrad Flygning | 9 | Consumer DJI | KEEP | 15 | — | — | — |
| `dji-mini-2-serien` | DJI Mini 2-Serien | 0 | Legacy DJI models | KEEP | 5 | — | — | — |
| `dji-mini-3` | DJI Mini 3 Drönare för Professionellt Flygfoto | 5 | Consumer DJI | KEEP | 12 | — | — | — |
| `dji-mini-3-pro-dronare-set` | Komplett Set DJI Mini 3 Pro | 0 | Consumer DJI | DELETE | -5 | — | — | — |
| `dji-mini-3-serien` | DJI Mini 3-Serien | 5 | Consumer DJI | KEEP | 12 | — | — | — |
| `dji-mini-3-tillbehor` | DJI Mini 3 Tillbehör | 43 | Consumer DJI | KEEP | 25 | — | — | — |
| `dji-mini-4-pro` | DJI Mini 4 Pro – Frihet, precision och kreativ kontroll i miniformat | 1 | Consumer DJI | KEEP | 5 | — | — | — |
| `dji-mini-4-pro-tillbehor` | DJI Mini 4 Pro | 14 | Consumer DJI | KEEP | 18 | — | — | — |
| `dji-mini-4-serien` | DJI Mini 4-Serien | 2 | Consumer DJI | KEEP | 7 | — | — | — |
| `dji-mini-5-serien` | DJI Mini 5-Serien | 2 | Consumer DJI | KEEP | 7 | — | — | — |
| `dji-mini-tillbehor` | DJI Mini Tillbehör för Din Drönare | 7 | Consumer DJI | KEEP | 14 | — | — | — |
| `dji-neo` | DJI Neo | 3 | Consumer DJI | KEEP | 9 | — | — | — |
| `dji-neo-2-tillbehor` | DJI Neo 2 Tillbehör för din Drönare | 54 | Consumer DJI | KEEP | 26 | — | — | — |
| `dji-neo-tillbehor` | DJI Neo Tillbehör – Batteri & mer för din drönare | 129 | Consumer DJI | KEEP | 32 | — | — | — |
| `dji-phantom-3-pro-v1` | DJI Phantom 3 Pro v1 Drönare och Tillbehör | 0 | Legacy DJI models | KEEP | 5 | — | — | — |
| `dji-phantom-3-se` | DJI Phantom 3 SE Drönare med Kamera | 43 | Legacy DJI models | KEEP | 35 | — | — | — |
| `dji-phantom-4-pro-dronare` | DJI Phantom 4 Pro Drönare för Professionella | 0 | Legacy DJI models | KEEP | 5 | — | — | — |
| `dji-phantom-serien` | DJI Phantom Serien | 0 | Legacy DJI models | KEEP | 5 | — | — | — |
| `dji-phantom-tillbehor-vaska-reservdelar` | DJI Phantom Tillbehör för Optimal Prestanda | 0 | Legacy DJI models | KEEP | 5 | — | — | — |
| `dji-rc-fjarrkontroller` | DJI RC – Smart fjärrkontroll | 7 | Consumer DJI | KEEP | 14 | — | — | — |
| `dji-rc-pro-tillbehor` | DJI RC Pro Tillbehör – Optimera Din Fjärrkontroll | 5 | Consumer DJI | KEEP | 12 | — | — | — |
| `dronar-fjarrkontrollstillbehor` | Drönar - fjärrkontrollstillbehör | 32 | Accessories | KEEP | 23 | — | — | — |
| `dronar-kameror` | Professionella Drönar kameror för Flygfoto | 3 | Accessories | KEEP | 9 | — | — | — |
| `dronare-actionking` | Drönare | 47 | Legacy DJI models | KEEP | 25 | — | — | — |
| `dronare-med-kamera` | Drönare med kamera | 47 | Consumer DJI | KEEP | 25 | — | — | — |
| `dronare-med-varmekamera` | Drönare med värmekamera | 1 | Sensors & Payloads | KEEP | 5 | — | — | — |
| `dronare-propeller-tillbehor` | Drönare Propeller Tillbehör för Optimal Flygning | 366 | Accessories | KEEP | 38 | — | — | — |
| `dronare-reservdelar-ovriga` | Drönare reservdelar: Allt för din drönarreparation | 0 | Spare Parts | DELETE | -5 | — | — | — |
| `dronarelektronik-flight-components` | Reservdelar & Komponenter för DJI & FPV | 175 | Spare Parts | KEEP | 34 | — | — | — |
| `dronarmatta-landning-skydd` | Landningsmattor Drönare – Säker & Stabil Flygning | 21 | Accessories | KEEP | 20 | — | — | — |
| `dronarpropellrar-tysta` | Hållbara drönarpropellrar för optimal flygning och prestanda | 128 | Accessories | KEEP | 32 | — | — | — |
| `dronarryggsack-vaskor` | Robust drönarryggsäck för säker transport av din drönare | 203 | Accessories | KEEP | 35 | — | — | — |
| `dronartillbehor-dronar` | Drönartillbehör Dronar för Optimal Flygning | 374 | Accessories | KEEP | 39 | — | — | — |
| `dronartillbehor-kop` | Drönartillbehör: Filter för bättre flygfotografering | 615 | Accessories | KEEP | 42 | — | — | — |
| `energi-infrastruktur` | Energi & Infrastruktur | 0 | Industry Solutions | KEEP | 3 | — | — | — |
| `enterprise-belysning` | Enterprise belysning | 0 | Enterprise DJI | KEEP | 3 | — | — | — |
| `enterprise-dronare` | Enterprise Drönare för Industri och Inspektion | 11 | Enterprise DJI | KEEP | 24 | — | — | — |
| `enterprise-dronartillbehor` | Professionella Enterprise drönartillbehör | 11 | Enterprise DJI | KEEP | 24 | — | — | — |
| `enterprise-hogtalarsystem` | Enterprise Högtalarsystem | 0 | Enterprise DJI | KEEP | 3 | — | — | — |
| `enterprise-lyftsystem` | Enterprise Lyftsystem | 0 | Enterprise DJI | KEEP | 3 | — | — | — |
| `enterprise-propellrar` | Enterprise Propellrar | 1 | Enterprise DJI | KEEP | 13 | — | — | — |
| `enterprise-sensorer` | Enterprise Sensorer | 0 | Sensors & Payloads | KEEP | 3 | — | — | — |
| `enterprise-service-dronare` | Enterprise Service för Företagsdrönare | 0 | Enterprise DJI | KEEP | 3 | — | — | — |
| `enterprise-tillbehor` | Enterprise Tillbehör | 26 | Enterprise DJI | KEEP | 29 | — | — | — |
| `fasten-adaptrar-actionkameror` | Universal Fästen och Adaptrar till actionkameror | 5 | Accessories | KEEP | 12 | — | — | — |
| `filter-dronare-lins` | Filter drönare: Skydda din lins med premium glasfilter | 261 | Accessories | KEEP | 36 | — | — | — |
| `filter-till-dronare` | Filter till Drönare för Optimal Bildkvalitet | 252 | Accessories | KEEP | 36 | — | — | — |
| `fjarrkontroll-dronare` | Fjärrkontroll drönare: Precision & kontroll för din flygning | 10 | Accessories | KEEP | 16 | — | — | — |
| `gopro-batterier` | GoPro Batterier för Längre Filmning | 0 | Legacy DJI models | DELETE | -5 | — | — | — |
| `gopro-hero13-black-skydd` | GoPro Hero13 Black skydd - Skydda din GoPro Hero13 Black med rätt skyd | 476 | Legacy DJI models | KEEP | 40 | — | — | — |
| `gopro-hero13-vaska` | GoPro Hero13 väska – Skydda din actionkamera tryggt | 610 | Legacy DJI models | KEEP | 42 | — | — | — |
| `gopro-tillbehor-vendors` | Hitta pålitliga GoPro tillbehör vendors här | 228 | Legacy DJI models | KEEP | 35 | — | — | — |
| `inspektionsdronare` | Inspektionsdrönare | 0 | Industry Solutions | KEEP | 3 | — | — | — |
| `ji-mini-5-pro-filter` | DJI Mini 5 Pro filter | 0 | Consumer DJI | DELETE | -5 | — | — | — |
| `jordbruksdronare` | Jordbruksdrönare | 0 | Industry Solutions | KEEP | 3 | — | — | — |
| `kamerakablar-actionking` | Kamerakablar för Optimal Prestanda | 12 | Legacy DJI models | KEEP | 17 | — | — | — |
| `kamerastativ-tripod` | Kamerastativ & Tripod – Stabilt Mobil- och Kamerastativ | 0 | Accessories | DELETE | -5 | — | — | — |
| `kapor-till-dronare` | Högkvalitativa Kåpor till Drönare | 158 | Accessories | KEEP | 33 | — | — | — |
| `kartlaggnings-och-matdronare` | Kartläggnings- och mätdrönare | 0 | Industry Solutions | KEEP | 3 | — | — | — |
| `landningsstall-dronare` | Landningsställ till drönare – Stabil och säker landning | 42 | Accessories | KEEP | 25 | — | — | — |
| `last-och-transportdronare` | Last- och transportdrönare | 2 | Industry Solutions | KEEP | 15 | — | — | — |
| `master-airscrew-dji-propellrar` | Master Airscrew DJI propellrar – Tysta & Effektiva | 42 | Consumer DJI | KEEP | 25 | — | — | — |
| `minneskort-lagring` | Minneskort & Lagring | 0 | Accessories | DELETE | -5 | — | — | — |
| `multiverktyg-friluftsliv` | Multiverktyg friluftsliv: Kompakt & Mångsidigt Äventyrsverktyg | 14 | Accessories | KEEP | 18 | — | — | — |
| `osmo-action-6-tillbehor` | Osmo Action 6 tillbehör: Komplett utbud för din actionkamera | 0 | Legacy DJI models | DELETE | -5 | — | — | — |
| `pgytech-tillbehor` | Pgytech Tillbehör för Kreativa Skapare | 3 | Accessories | KEEP | 9 | — | — | — |
| `pincetter-actionking` | Pincetter | 1 | Legacy DJI models | KEEP | 5 | — | — | — |
| `polarpro` | Polarpro | 428 | Accessories | KEEP | 39 | — | — | — |
| `propellerskydd-1` | Robusta Propellerskydd för Säkrare Drönarflygning | 56 | Accessories | KEEP | 26 | — | — | — |
| `rengoringsprodukter-actionking` | Rengörning för elektronik | 18 | Legacy DJI models | KEEP | 19 | — | — | — |
| `reparation-dji-neo-reservdelar` | Reparation DJI Neo – Fixa din drönare snabbt och enkelt! | 4 | Spare Parts | KEEP | 10 | — | — | — |
| `reparera-precisionsverktyg-elektronik` | Precisionsverktyg Elektronik: Reparera kamera & drönare enkelt | 36 | Accessories | KEEP | 24 | — | — | — |
| `reservdelar-gimbal-dronare-motorer` | Reservdelar Gimbal Drönare: Gimbalmotorer för Optimal Stabilisering | 171 | Spare Parts | KEEP | 34 | — | — | — |
| `ringlampa` | ringlampa - Ringlampor för Professionell Belysning | 0 | Accessories | DELETE | -5 | — | — | — |
| `skogsbruksdronare` | Skogsbruksdrönare | 0 | Industry Solutions | KEEP | 3 | — | — | — |
| `skruvmejsel-set` | Skruvmejsel Set – Precisionsverktyg för Alla Behov | 6 | Accessories | KEEP | 13 | — | — | — |
| `skydd-dronare` | Skydd till drönare: Propeller, Gimbal & Skal – Skydda din drönare! | 53 | Accessories | KEEP | 26 | — | — | — |
| `tanger-actionking` | Tänger Action: Precision och Styrka | 1 | Legacy DJI models | KEEP | 5 | — | — | — |
| `tillbehor-dji-air-3s` | Tillbehör DJI Air 3S - Tillbehör för DJI Air 3S: Komplettera din dröna | 13 | Consumer DJI | KEEP | 17 | — | — | — |
| `tillbehor-dji-air-serien` | Tillbehör till DJI Air-Serien – Uppgradera din drönare idag! | 12 | Consumer DJI | KEEP | 17 | — | — | — |
| `tillbehor-dji-avata-serien` | DJI Avata tillbehör: FPV-drönarutrustning för proffs & nybörjare | 14 | Consumer DJI | KEEP | 18 | — | — | — |
| `tillbehor-dji-inspire` | DJI Inspire Tillbehör | 0 | Legacy DJI models | KEEP | 5 | — | — | — |
| `tillbehor-dji-mavic-2` | Tillbehör DJI Mavic 2: Utrustning för din drönare | 4 | Legacy DJI models | KEEP | 20 | — | — | — |
| `tillbehor-dji-mavic-3-cine` | Tillbehör DJI Mavic 3 Cine för optimal prestanda | 10 | Consumer DJI | KEEP | 16 | — | — | — |
| `tillbehor-dji-mavic-dronare` | dji mavic 3e - Tillbehör för DJI Mavic Drönare | 2 | Consumer DJI | KEEP | 7 | — | — | — |
| `tillbehor-dji-mini-2-2-se` | Tillbehör DJI Mini 2 / 2 SE - Tillbehör för DJI Mini | 47 | Legacy DJI models | KEEP | 35 | — | — | — |
| `tillbehor-dji-mini-4` | DJI Mini 3 Tillbehör: Utforska drönarens fulla potential | 18 | Consumer DJI | KEEP | 19 | — | — | — |
| `tillbehor-dji-mini-4-serien` | Tillbehör till DJI Mini 4-serien – Maxa din drönarupplevelse! | 3 | Consumer DJI | KEEP | 9 | — | — | — |
| `tillbehor-dji-neo` | DJI Neo tillbehör – Batteri & mer för optimal flygning | 20 | Consumer DJI | KEEP | 20 | — | — | — |
| `tillbehor-till-dji-air-3-serien` | Tillbehör till DJI AIR 3-Serien | 14 | Consumer DJI | KEEP | 18 | — | — | — |
| `tillbehorskablar-dronare` | Kablar till drönare | 10 | Accessories | KEEP | 16 | — | — | — |
| `transport-logistik` | Transport & Logistik | 0 | Industry Solutions | KEEP | 3 | — | — | — |
| `usb-kablar-usb-c-till-usb-c` | Kraftfulla USB-kablar USB-C till USB-C | 23 | Accessories | KEEP | 21 | — | — | — |
| `vattentatt-kameraskydd` | Vattentätt kameraskydd för kamera & drönare | 141 | Accessories | KEEP | 32 | — | — | — |
| `vendors-q-sunnylife` | Sunnylife: Köp vattentäta kameraskydd & actionkamera tillbehör | 377 | Legacy DJI models | KEEP | 39 | — | — | — |

---

## 2. Recommended collection architecture

### Target information architecture

#### Consumer DJI

- DJI Mini
- DJI Air
- DJI Mavic
- DJI Avata
- DJI Neo
- DJI Flip

#### Enterprise DJI

- DJI Matrice
- DJI Mavic Enterprise
- DJI FlyCart
- Enterprise Sensors
- Enterprise Payloads
- Enterprise Accessories
- Enterprise Service

#### Industry Solutions

- Inspection
- Energy & Infrastructure
- Agriculture
- Forestry
- Surveying & Mapping
- Public Safety
- Transport & Logistics

#### Spare Parts

- Motors
- Propellers
- Batteries
- Gimbals
- Cameras
- Landing Gear
- Electronics

#### Accessories

- Batteries
- Chargers
- Cases
- Remote Controllers
- Filters
- Antennas
- Speakers
- Lighting
- Payload Systems

#### FlyCart

- FlyCart 30
- FlyCart 100
- FlyCart Spare Parts
- FlyCart Accessories

### Current → target mapping

| Taxonomy | Collections | Top handles |
|---|---:|---|
| Consumer DJI | 53 | dji-neo-tillbehor, dji, dji-mavic-3-tillbehor |
| Accessories | 32 | alla-produkter, dronartillbehor-kop, polarpro |
| Legacy DJI models | 26 | gopro-hero13-vaska, gopro-hero13-black-skydd, vendors-q-sunnylife |
| Enterprise DJI | 20 | enterprise-tillbehor, enterprise-dronare, enterprise-dronartillbehor |
| Industry Solutions | 7 | last-och-transportdronare, inspektionsdronare, kartlaggnings-och-matdronare |
| Spare Parts | 4 | dronarelektronik-flight-components, reservdelar-gimbal-dronare-motorer, dji-dronar-reservdelar |
| Sensors & Payloads | 3 | airdrop-system, dronare-med-varmekamera, enterprise-sensorer |
| FlyCart | 2 | dji-flycart-serien, dji-flycart-100-lastdronare |

### Proposed tree (post-cleanup)

```
EuroDroneParts
├── Consumer DJI/
│   ├── DJI Mini/
│   ├── DJI Air/
│   ├── DJI Mavic/
│   ├── DJI Avata/
│   ├── DJI Neo/
│   ├── DJI Flip/
├── Enterprise DJI/
│   ├── DJI Matrice/
│   ├── DJI Mavic Enterprise/
│   ├── DJI FlyCart/
│   ├── Enterprise Sensors/
│   ├── Enterprise Payloads/
│   ├── Enterprise Accessories/
│   ├── Enterprise Service/
├── Industry Solutions/
│   ├── Inspection/
│   ├── Energy & Infrastructure/
│   ├── Agriculture/
│   ├── Forestry/
│   ├── Surveying & Mapping/
│   ├── Public Safety/
│   ├── Transport & Logistics/
├── Spare Parts/
│   ├── Motors/
│   ├── Propellers/
│   ├── Batteries/
│   ├── Gimbals/
│   ├── Cameras/
│   ├── Landing Gear/
│   ├── Electronics/
├── Accessories/
│   ├── Batteries/
│   ├── Chargers/
│   ├── Cases/
│   ├── Remote Controllers/
│   ├── Filters/
│   ├── Antennas/
│   ├── Speakers/
│   ├── Lighting/
│   ├── Payload Systems/
├── FlyCart/
│   ├── FlyCart 30/
│   ├── FlyCart 100/
│   ├── FlyCart Spare Parts/
│   ├── FlyCart Accessories/
└── Legacy DJI models/ [protected]
```

---

## 3. Collections to KEEP

**146 collections**

| Handle | Title | Products | Taxonomy | Reason |
|---|---|---:|---|---|
| `alla-produkter` | Alla produkter Drönare | 841 | Accessories | Contains live products |
| `dronartillbehor-kop` | Drönartillbehör: Filter för bättre flygfotografering | 615 | Accessories | Contains live products |
| `gopro-hero13-vaska` | GoPro Hero13 väska – Skydda din actionkamera tryggt | 610 | Legacy DJI models | Contains live products |
| `gopro-hero13-black-skydd` | GoPro Hero13 Black skydd - Skydda din GoPro Hero13 Black med rätt skyd | 476 | Legacy DJI models | Contains live products |
| `polarpro` | Polarpro | 428 | Accessories | Contains live products |
| `vendors-q-sunnylife` | Sunnylife: Köp vattentäta kameraskydd & actionkamera tillbehör | 377 | Legacy DJI models | Contains live products |
| `dronartillbehor-dronar` | Drönartillbehör Dronar för Optimal Flygning | 374 | Accessories | Contains live products |
| `dronare-propeller-tillbehor` | Drönare Propeller Tillbehör för Optimal Flygning | 366 | Accessories | Contains live products |
| `filter-dronare-lins` | Filter drönare: Skydda din lins med premium glasfilter | 261 | Accessories | Contains live products |
| `filter-till-dronare` | Filter till Drönare för Optimal Bildkvalitet | 252 | Accessories | Contains live products |
| `gopro-tillbehor-vendors` | Hitta pålitliga GoPro tillbehör vendors här | 228 | Legacy DJI models | Contains live products |
| `dronarryggsack-vaskor` | Robust drönarryggsäck för säker transport av din drönare | 203 | Accessories | Contains live products |
| `dronarelektronik-flight-components` | Reservdelar & Komponenter för DJI & FPV | 175 | Spare Parts | Contains live products |
| `reservdelar-gimbal-dronare-motorer` | Reservdelar Gimbal Drönare: Gimbalmotorer för Optimal Stabilisering | 171 | Spare Parts | Contains live products |
| `kapor-till-dronare` | Högkvalitativa Kåpor till Drönare | 158 | Accessories | Contains live products |
| `amagisn-kameratillbehor-och-dronarutrustning` | kameratillbehör - AMagisn Tillbehör för Kamera och Drönare | 149 | Accessories | Contains live products |
| `vattentatt-kameraskydd` | Vattentätt kameraskydd för kamera & drönare | 141 | Accessories | Contains live products |
| `brdrc-tillbehor` | Kompletta BRDRC Tillbehör för Din Utrustning | 134 | Accessories | Contains live products |
| `dji-neo-tillbehor` | DJI Neo Tillbehör – Batteri & mer för din drönare | 129 | Consumer DJI | Contains live products |
| `dronarpropellrar-tysta` | Hållbara drönarpropellrar för optimal flygning och prestanda | 128 | Accessories | Contains live products |
| `dji` | DJI: Innovation inom Drönarteknik | 84 | Consumer DJI | Contains live products |
| `dji-mavic-3-tillbehor` | DJI Mavic 3 Tillbehör för Optimal Prestanda | 66 | Consumer DJI | Contains live products |
| `dji-air-3-tillbehor-omfattande-sortiment` | Omfattande Sortiment av DJI Air 3 Tillbehör | 66 | Consumer DJI | Contains live products |
| `batterier` | Batterier och laddare | 64 | Accessories | Contains live products |
| `dji-flip-tillbehor` | DJI Flip™ tillbehör – Optimal utrustning till din drönare | 63 | Consumer DJI | Contains live products |
| `propellerskydd-1` | Robusta Propellerskydd för Säkrare Drönarflygning | 56 | Accessories | Contains live products |
| `dji-neo-2-tillbehor` | DJI Neo 2 Tillbehör för din Drönare | 54 | Consumer DJI | Contains live products |
| `skydd-dronare` | Skydd till drönare: Propeller, Gimbal & Skal – Skydda din drönare! | 53 | Accessories | Contains live products |
| `dji-avata-2-tillbehor` | DJI Avata 2 tillbehör – Skydd & batterier till din drönare | 51 | Consumer DJI | Contains live products |
| `dronare-med-kamera` | Drönare med kamera | 47 | Consumer DJI | Contains live products |
| `dronare-actionking` | Drönare | 47 | Legacy DJI models | Contains live products |
| `tillbehor-dji-mini-2-2-se` | Tillbehör DJI Mini 2 / 2 SE - Tillbehör för DJI Mini | 47 | Legacy DJI models | Contains live products |
| `dji-mavic-pro-tillbehor` | Omfattande DJI Mavic Pro Tillbehör | 46 | Consumer DJI | Contains live products |
| `dji-phantom-3-se` | DJI Phantom 3 SE Drönare med Kamera | 43 | Legacy DJI models | Contains live products |
| `dji-mini-3-tillbehor` | DJI Mini 3 Tillbehör | 43 | Consumer DJI | Contains live products |
| `master-airscrew-dji-propellrar` | Master Airscrew DJI propellrar – Tysta & Effektiva | 42 | Consumer DJI | Contains live products |
| `landningsstall-dronare` | Landningsställ till drönare – Stabil och säker landning | 42 | Accessories | Contains live products |
| `dji-mavic-air-tillbehor` | Komplett utbud av DJI Mavic Air Tillbehör | 39 | Consumer DJI | Contains live products |
| `reparera-precisionsverktyg-elektronik` | Precisionsverktyg Elektronik: Reparera kamera & drönare enkelt | 36 | Accessories | Contains live products |
| `dronar-fjarrkontrollstillbehor` | Drönar - fjärrkontrollstillbehör | 32 | Accessories | Contains live products |
| `belysning-till-dronare` | Belysning till drönare | 28 | Accessories | Contains live products |
| `enterprise-tillbehor` | Enterprise Tillbehör | 26 | Enterprise DJI | Contains live products |
| `usb-kablar-usb-c-till-usb-c` | Kraftfulla USB-kablar USB-C till USB-C | 23 | Accessories | Contains live products |
| `airdrop-system` | Airdrop System | 22 | Sensors & Payloads | Contains live products |
| `dji-dronare` | DJI Drönare | 22 | Accessories | Contains live products |
| `dronarmatta-landning-skydd` | Landningsmattor Drönare – Säker & Stabil Flygning | 21 | Accessories | Contains live products |
| `tillbehor-dji-neo` | DJI Neo tillbehör – Batteri & mer för optimal flygning | 20 | Consumer DJI | Contains live products |
| `rengoringsprodukter-actionking` | Rengörning för elektronik | 18 | Legacy DJI models | Contains live products |
| `tillbehor-dji-mini-4` | DJI Mini 3 Tillbehör: Utforska drönarens fulla potential | 18 | Consumer DJI | Contains live products |
| `dji-dronar-reservdelar` | Hitta DJI-drönar reservdelar av hög kvalitet | 16 | Spare Parts | Contains live products |
| `dji-mavic-3-classic` | Tillbehör DJI Mavic 3 Classic | 15 | Consumer DJI | Contains live products |
| `tillbehor-till-dji-air-3-serien` | Tillbehör till DJI AIR 3-Serien | 14 | Consumer DJI | Contains live products |
| `multiverktyg-friluftsliv` | Multiverktyg friluftsliv: Kompakt & Mångsidigt Äventyrsverktyg | 14 | Accessories | Contains live products |
| `tillbehor-dji-avata-serien` | DJI Avata tillbehör: FPV-drönarutrustning för proffs & nybörjare | 14 | Consumer DJI | Contains live products |
| `dji-mini-4-pro-tillbehor` | DJI Mini 4 Pro | 14 | Consumer DJI | Contains live products |
| `tillbehor-dji-air-3s` | Tillbehör DJI Air 3S - Tillbehör för DJI Air 3S: Komplettera din dröna | 13 | Consumer DJI | Contains live products |
| `tillbehor-dji-air-serien` | Tillbehör till DJI Air-Serien – Uppgradera din drönare idag! | 12 | Consumer DJI | Contains live products |
| `kamerakablar-actionking` | Kamerakablar för Optimal Prestanda | 12 | Legacy DJI models | Contains live products |
| `enterprise-dronare` | Enterprise Drönare för Industri och Inspektion | 11 | Enterprise DJI | Contains live products |
| `dji-mavic-3-pro-tillbehor` | DJI Mavic 3 Pro tillbehör – Drönartillbehör för proffs | 11 | Consumer DJI | Contains live products |
| `dji-mavic-3-serien` | DJI Mavic 3-serien: Proffsens val av drönare | 11 | Consumer DJI | Contains live products |
| `enterprise-dronartillbehor` | Professionella Enterprise drönartillbehör | 11 | Enterprise DJI | Contains live products |
| `tillbehor-dji-mavic-3-cine` | Tillbehör DJI Mavic 3 Cine för optimal prestanda | 10 | Consumer DJI | Contains live products |
| `tillbehorskablar-dronare` | Kablar till drönare | 10 | Accessories | Contains live products |
| `fjarrkontroll-dronare` | Fjärrkontroll drönare: Precision & kontroll för din flygning | 10 | Accessories | Contains live products |
| `dji-mavic-tillbehor` | Dji Mavic Tillbehör för Förbättrad Flygning | 9 | Consumer DJI | Contains live products |
| `dji-mini-tillbehor` | DJI Mini Tillbehör för Din Drönare | 7 | Consumer DJI | Contains live products |
| `dji-rc-fjarrkontroller` | DJI RC – Smart fjärrkontroll | 7 | Consumer DJI | Contains live products |
| `dji-dronare-fjarrkontroller` | Fjärrkontroller och Tillbehör för DJI Drönare | 7 | Consumer DJI | Contains live products |
| `dji-avata-tillbehor` | DJI Avata Tillbehör | 6 | Consumer DJI | Contains live products |
| `skruvmejsel-set` | Skruvmejsel Set – Precisionsverktyg för Alla Behov | 6 | Accessories | Contains live products |
| `dji-mavic-serien` | DJI Mavic-Serien | 6 | Consumer DJI | Contains live products |
| `dji-air-serien` | DJI AIR-serien | 6 | Consumer DJI | Contains live products |
| `dji-mavic-3-pro-avancerad-dronarteknik` | DJI Mavic 3 Pro: Avancerad Drönarteknik | 5 | Consumer DJI | Contains live products |
| `dji-rc-pro-tillbehor` | DJI RC Pro Tillbehör – Optimera Din Fjärrkontroll | 5 | Consumer DJI | Contains live products |
| `dji-mavic-pro-batteri-vaska` | dji mavic pro batteri väska - DJI Mavic Pro Batteriväska och Tillbehör | 5 | Consumer DJI | Contains live products |
| `dji-mini-3-serien` | DJI Mini 3-Serien | 5 | Consumer DJI | Contains live products |
| `dji-mini-3` | DJI Mini 3 Drönare för Professionellt Flygfoto | 5 | Consumer DJI | Contains live products |
| `fasten-adaptrar-actionkameror` | Universal Fästen och Adaptrar till actionkameror | 5 | Accessories | Contains live products |
| `reparation-dji-neo-reservdelar` | Reparation DJI Neo – Fixa din drönare snabbt och enkelt! | 4 | Spare Parts | Contains live products |
| `tillbehor-dji-mavic-2` | Tillbehör DJI Mavic 2: Utrustning för din drönare | 4 | Legacy DJI models | Contains live products |
| `dji-flip-dronare` | DJI Flip: Kompakta Vikbara Drönare | 3 | Consumer DJI | Contains live products |
| `dji-flip-batteri-tillbehor` | Optimala DJI Flip tillbehör – Maxa din drönarupplevelse! | 3 | Consumer DJI | Contains live products |
| `dji-mavic-4-pro` | DJI Mavic 4 Tillbehör | 3 | Consumer DJI | Contains live products |
| `dji-air-3` | DJI AIR 3 | 3 | Consumer DJI | Contains live products |
| `dji-mavic-4-serien` | Upptäck DJI Mavic 4-serien för exceptionell flygfotografering | 3 | Consumer DJI | Contains live products |
| `tillbehor-dji-mini-4-serien` | Tillbehör till DJI Mini 4-serien – Maxa din drönarupplevelse! | 3 | Consumer DJI | Contains live products |
| `dij-air-3-serien` | DJI Air 3-Serien för Professionell Flygfotografering | 3 | Consumer DJI | Contains live products |
| `pgytech-tillbehor` | Pgytech Tillbehör för Kreativa Skapare | 3 | Accessories | Contains live products |
| `dji-enterprise-fjarrkontroller` | Professionella Fjärrkontroller för DJI Enterprise | 3 | Accessories | Contains live products |
| `dronar-kameror` | Professionella Drönar kameror för Flygfoto | 3 | Accessories | Contains live products |
| `dji-neo` | DJI Neo | 3 | Consumer DJI | Contains live products |
| `bandverktyg` | Bändverktyg för Precisionsreparationer | 2 | Accessories | Contains live products |
| `dji-avata-serien` | DJI Avata-Serien | 2 | Consumer DJI | Contains live products |
| `dji-mavic-2-serien` | DJI Mavic 2-serien: Avancerade Drönare | 2 | Legacy DJI models | Contains live products |
| `dji-mini-4-serien` | DJI Mini 4-Serien | 2 | Consumer DJI | Contains live products |
| `tillbehor-dji-mavic-dronare` | dji mavic 3e - Tillbehör för DJI Mavic Drönare | 2 | Consumer DJI | Contains live products |
| `dji-mini-5-serien` | DJI Mini 5-Serien | 2 | Consumer DJI | Contains live products |
| `dji-air-3s` | DJI Air 3S | 2 | Consumer DJI | Contains live products |
| `dji-avata-pro-fpv-dronare` | Avata Pro FPV-Drönare – Nästa Generations Flygning | 2 | Consumer DJI | Contains live products |
| `last-och-transportdronare` | Last- och transportdrönare | 2 | Industry Solutions | Contains live products |
| `dji-air-2s` | DJI Air 2S | 1 | Legacy DJI models | Contains live products |
| `tanger-actionking` | Tänger Action: Precision och Styrka | 1 | Legacy DJI models | Contains live products |
| `pincetter-actionking` | Pincetter | 1 | Legacy DJI models | Contains live products |
| `dji-air-2-serien` | DJI Air 2 Serien: Drönare och Tillbehör | 1 | Legacy DJI models | Contains live products |
| `dji-mavic-3-cine-dronare` | DJI Mavic 3 Cine: Ultimata Drönaren för Filmskapare | 1 | Consumer DJI | Contains live products |
| `dji-mavic-2-pro` | DJI Mavic 2 Pro | 1 | Legacy DJI models | Contains live products |
| `dji-mini-4-pro` | DJI Mini 4 Pro – Frihet, precision och kreativ kontroll i miniformat | 1 | Consumer DJI | Contains live products |
| `dji-fpv-tillbehor` | Dji FPV Tillbehör – Optimera Din Flygning Med Kvalitet | 1 | Consumer DJI | Contains live products |
| `dji-agras-dronare` | DJI Agras Drönare för Precisionsjordbruk | 1 | Enterprise DJI | Contains live products |
| `enterprise-propellrar` | Enterprise Propellrar | 1 | Enterprise DJI | Contains live products |
| `dronare-med-varmekamera` | Drönare med värmekamera | 1 | Sensors & Payloads | Contains live products |
| `dji-matrice-serien` | DJI Matrice-serien – Professionella Enterprise-drönare | 0 | Enterprise DJI | Protected Enterprise collection — populate rather than delete |
| `dji-matrice-3-serien` | DJI Matrice 4 Serien | 0 | Enterprise DJI | Protected Enterprise collection — populate rather than delete |
| `dji-matrice-400-serien` | DJI Matrice 400 Serien för Professionella Uppdrag | 0 | Enterprise DJI | Protected Enterprise collection — populate rather than delete |
| `dji-flycart-serien` | DJI FlyCart Serien | 0 | FlyCart | Protected FlyCart collection — strategic product line |
| `dji-inspire-serien` | DJI Inspire Serien | 0 | Legacy DJI models | Protected Legacy DJI model — SEO/spare-parts value even when empty |
| `dji-mini-2-serien` | DJI Mini 2-Serien | 0 | Legacy DJI models | Protected Legacy DJI model — SEO/spare-parts value even when empty |
| `dji-phantom-tillbehor-vaska-reservdelar` | DJI Phantom Tillbehör för Optimal Prestanda | 0 | Legacy DJI models | Protected Legacy DJI model — SEO/spare-parts value even when empty |
| `dji-air-2s-tillbehor` | DJI Air 2S Tillbehör – Optimerad Flygning | 0 | Legacy DJI models | Protected Legacy DJI model — SEO/spare-parts value even when empty |
| `dji-phantom-4-pro-dronare` | DJI Phantom 4 Pro Drönare för Professionella | 0 | Legacy DJI models | Protected Legacy DJI model — SEO/spare-parts value even when empty |
| `dji-phantom-3-pro-v1` | DJI Phantom 3 Pro v1 Drönare och Tillbehör | 0 | Legacy DJI models | Protected Legacy DJI model — SEO/spare-parts value even when empty |
| `dji-inspire` | DJI Inspire Serien Professionella Drönare för Kreatörer | 0 | Legacy DJI models | Protected Legacy DJI model — SEO/spare-parts value even when empty |
| `dji-matrice-4-serie` | dji matrice 4 Serie | 0 | Enterprise DJI | Protected Enterprise collection — populate rather than delete |
| `dji-mavic-3-enterprise` | DJI Mavic 3 Enterprise - Kvalitet & | 0 | Enterprise DJI | Protected Enterprise collection — populate rather than delete |
| `dji-matrice-350-rtk-tillbehor` | DJI Matrice 350 RTK Tillbehör och Skydd | 0 | Enterprise DJI | Protected Enterprise collection — populate rather than delete |
| `dji-matrice-30-serie-tillbehor` | dji arm - DJI Matrice 30 Serie Tillbehör | 0 | Enterprise DJI | Protected Enterprise collection — populate rather than delete |
| `dji-mavic-3m-dronare-tillbehor` | DJI Mavic 3M Drönare och Tillbehör | 0 | Enterprise DJI | Protected Enterprise collection — populate rather than delete |
| `dji-flycart-100-lastdronare` | DJI FlyCart 100: Lastdrönare för Tunga Lyft | 0 | FlyCart | Protected FlyCart collection — strategic product line |
| `dji-matrice-4-tillbehor` | DJI Matrice 4 Tillbehör för Professionella Drönare | 0 | Enterprise DJI | Protected Enterprise collection — populate rather than delete |
| `enterprise-service-dronare` | Enterprise Service för Företagsdrönare | 0 | Enterprise DJI | Protected Enterprise collection — populate rather than delete |
| `enterprise-hogtalarsystem` | Enterprise Högtalarsystem | 0 | Enterprise DJI | Protected Enterprise collection — populate rather than delete |
| `enterprise-belysning` | Enterprise belysning | 0 | Enterprise DJI | Protected Enterprise collection — populate rather than delete |
| `dji-phantom-serien` | DJI Phantom Serien | 0 | Legacy DJI models | Protected Legacy DJI model — SEO/spare-parts value even when empty |
| `dji-mavic-serien-enterprise` | DJI Mavic Serien enterprise | 0 | Enterprise DJI | Protected Enterprise collection — populate rather than delete |
| `enterprise-lyftsystem` | Enterprise Lyftsystem | 0 | Enterprise DJI | Protected Enterprise collection — populate rather than delete |
| `enterprise-sensorer` | Enterprise Sensorer | 0 | Sensors & Payloads | Protected Enterprise collection — populate rather than delete |
| `inspektionsdronare` | Inspektionsdrönare | 0 | Industry Solutions | Protected Industry Solutions landing page — SEO value |
| `kartlaggnings-och-matdronare` | Kartläggnings- och mätdrönare | 0 | Industry Solutions | Protected Industry Solutions landing page — SEO value |
| `skogsbruksdronare` | Skogsbruksdrönare | 0 | Industry Solutions | Protected Industry Solutions landing page — SEO value |
| `jordbruksdronare` | Jordbruksdrönare | 0 | Industry Solutions | Protected Industry Solutions landing page — SEO value |
| `energi-infrastruktur` | Energi & Infrastruktur | 0 | Industry Solutions | Protected Industry Solutions landing page — SEO value |
| `transport-logistik` | Transport & Logistik | 0 | Industry Solutions | Protected Industry Solutions landing page — SEO value |
| `tillbehor-dji-inspire` | DJI Inspire Tillbehör | 0 | Legacy DJI models | Protected Legacy DJI model — SEO/spare-parts value even when empty |
| `dji-air-2-tillbehor` | Högkvalitativa DJI Air 2 Tillbehör för Drönare | 0 | Legacy DJI models | Protected Legacy DJI model — SEO/spare-parts value even when empty |
| `dji-marvic-enterprise` | DJI Marvic Enterprise | -2 | Enterprise DJI | Smart collection with negative count — audit rules/tags before any change |

---

## 4. Collections to MERGE

**1 collections**

| Source | Target | Products | Reason |
|---|---|---:|---|
| `dji-mavic-3-classic-1` | `dji-mavic-3-classic` | 2 | Numbered duplicate handle — merge into `dji-mavic-3-classic` |

---

## 5. Collections to DELETE

**10 collections** (awaiting approval)

> Protected categories (Legacy DJI, Enterprise, FlyCart, Industry Solutions) are **excluded** from this list per your rules.

| Handle | Title | Taxonomy | Reason |
|---|---|---|---|
| `dji-air-3-serien` | DJI Air 3 Serien | Consumer DJI | Empty, unreferenced, no protected category — safe delete candidate |
| `dji-avata` | DJI Avata: Framtidens FPV Drönare | Consumer DJI | Empty, unreferenced, no protected category — safe delete candidate |
| `dji-mini-3-pro-dronare-set` | Komplett Set DJI Mini 3 Pro | Consumer DJI | Empty, unreferenced, no protected category — safe delete candidate |
| `dronare-reservdelar-ovriga` | Drönare reservdelar: Allt för din drönarreparation | Spare Parts | Empty, unreferenced, no protected category — safe delete candidate |
| `gopro-batterier` | GoPro Batterier för Längre Filmning | Legacy DJI models | Empty, unreferenced, no protected category — safe delete candidate |
| `ji-mini-5-pro-filter` | DJI Mini 5 Pro filter | Consumer DJI | Empty, unreferenced, no protected category — safe delete candidate |
| `kamerastativ-tripod` | Kamerastativ & Tripod – Stabilt Mobil- och Kamerastativ | Accessories | Empty, unreferenced, no protected category — safe delete candidate |
| `minneskort-lagring` | Minneskort & Lagring | Accessories | Empty, unreferenced, no protected category — safe delete candidate |
| `osmo-action-6-tillbehor` | Osmo Action 6 tillbehör: Komplett utbud för din actionkamera | Legacy DJI models | Empty, unreferenced, no protected category — safe delete candidate |
| `ringlampa` | ringlampa - Ringlampor för Professionell Belysning | Accessories | Empty, unreferenced, no protected category — safe delete candidate |

### Previously flagged DELETE (now protected)

| Handle | Protected as |
|---|---|
| `dji-matrice-serien` | Protected Enterprise collection — populate rather than delete |
| `dji-matrice-3-serien` | Protected Enterprise collection — populate rather than delete |
| `dji-matrice-400-serien` | Protected Enterprise collection — populate rather than delete |
| `dji-flycart-serien` | Protected FlyCart collection — strategic product line |
| `dji-inspire-serien` | Protected Legacy DJI model — SEO/spare-parts value even when empty |
| `dji-mini-2-serien` | Protected Legacy DJI model — SEO/spare-parts value even when empty |
| `dji-phantom-tillbehor-vaska-reservdelar` | Protected Legacy DJI model — SEO/spare-parts value even when empty |
| `dji-air-2s-tillbehor` | Protected Legacy DJI model — SEO/spare-parts value even when empty |
| `dji-phantom-4-pro-dronare` | Protected Legacy DJI model — SEO/spare-parts value even when empty |
| `dji-phantom-3-pro-v1` | Protected Legacy DJI model — SEO/spare-parts value even when empty |
| `dji-inspire` | Protected Legacy DJI model — SEO/spare-parts value even when empty |
| `dji-matrice-4-serie` | Protected Enterprise collection — populate rather than delete |
| `dji-mavic-3-enterprise` | Protected Enterprise collection — populate rather than delete |
| `dji-matrice-350-rtk-tillbehor` | Protected Enterprise collection — populate rather than delete |
| `dji-matrice-30-serie-tillbehor` | Protected Enterprise collection — populate rather than delete |
| `dji-mavic-3m-dronare-tillbehor` | Protected Enterprise collection — populate rather than delete |
| `dji-flycart-100-lastdronare` | Protected FlyCart collection — strategic product line |
| `dji-matrice-4-tillbehor` | Protected Enterprise collection — populate rather than delete |
| `enterprise-service-dronare` | Protected Enterprise collection — populate rather than delete |
| `enterprise-hogtalarsystem` | Protected Enterprise collection — populate rather than delete |
| `enterprise-belysning` | Protected Enterprise collection — populate rather than delete |
| `dji-phantom-serien` | Protected Legacy DJI model — SEO/spare-parts value even when empty |
| `dji-mavic-serien-enterprise` | Protected Enterprise collection — populate rather than delete |
| `enterprise-lyftsystem` | Protected Enterprise collection — populate rather than delete |
| `enterprise-sensorer` | Protected Enterprise collection — populate rather than delete |
| `inspektionsdronare` | Protected Industry Solutions landing page — SEO value |
| `kartlaggnings-och-matdronare` | Protected Industry Solutions landing page — SEO value |
| `skogsbruksdronare` | Protected Industry Solutions landing page — SEO value |
| `jordbruksdronare` | Protected Industry Solutions landing page — SEO value |
| `energi-infrastruktur` | Protected Industry Solutions landing page — SEO value |
| `transport-logistik` | Protected Industry Solutions landing page — SEO value |
| `tillbehor-dji-inspire` | Protected Legacy DJI model — SEO/spare-parts value even when empty |
| `dji-air-2-tillbehor` | Protected Legacy DJI model — SEO/spare-parts value even when empty |

---

## Pages inventory

Total: **61** pages (8 reference collections).

| Handle | Title | Collection refs |
|---|---|---|
| `360-kamera` | 360-kamera - stort utbud av kameror och tillbehör online | actionkamer-dji-gopro-insta360 |
| `actionking-student` | ActionKing söker drivna studenter – SEO, Webbutveckling, Content & Marknadsföring | — |
| `alla-produkter-actionking` | Alla produkter | — |
| `basta-myggskyddet` | Bästa myggskyddet | — |
| `batterier-och-laddare-till-gopro` | Batterier och laddare till GoPro | — |
| `contact` | Kontakta oss | — |
| `cookies-actionking` | Cookies hos ActionKing | — |
| `dji-air-serien` | DJI Air-serien | — |
| `dji-avata-serien` | DJI Avata-serien | — |
| `dji-dronare` | DJI-Drönare | — |
| `dji-flip` | DJI Flip | — |
| `dji-flip-faq` | DJI Flip Frågor och svar FAQ | — |
| `dji-mavic-3-classic` | DJI Mavic 3 Classic | — |
| `dji-mavic-3-serien` | DJI Mavic 3-serien | — |
| `dji-mavic-serien` | DJI Mavic-serien | — |
| `dji-mic-mini-faq` | DJI Mic Mini Frågor och svar FAQ | — |
| `dji-mini-serien` | DJI Mini-serien | — |
| `dji-neo` | DJI Neo | — |
| `dji-neo-faq` | DJI Neo Frågor och svar FAQ | — |
| `dji-osmo` | DJI Osmo-kameror och tillbehör för film och äventyr | dji-dronare |
| `dji-tillbehor` | DJI-tillbehör för drönare - stort utbud för alla modeller | actionkamer-dji-gopro-insta360 |
| `dronare-action-king` | Drönare | — |
| `dronartillbehor-dji-m3pro` | Drönartillbehör för DJI Mavic 3 Pro – Höj din flygning! | — |
| `faq` | Välkommen till ActionKings FAQ! | — |
| `faq-motorola-t82-extreme` | Motorola T82 Extreme Frågor och Svar FAQ | — |
| `faq-motorola-t92` | Motorola T92 Frågor och Svar FAQ | — |
| `feedback` | Feedback | — |
| `filter-action-king` | Filter | — |
| `gimbal-och-stabilisering` | Gimbal och stabilisering för mobil, kamera och actionkamera | — |
| `gopro-faste` | GoPro-fäste för actionkamera - flexibla och säkra monteringslösningar | fasten-till-actionkameror |
| `gopro-tillbehor-och-reservdelar` | GoPro Tillbehör och reservdelar allt till din kamera. | skydd-till-actionkameror, kamerastativ-actionking, vaskor-actionkameror |
| `goulet-ul-gear` | Goulet UL Gear | — |
| `gunter-andreasson-ultracyklist` | Günter Andréasson – Ultracyklist, äventyrare och inspiratör | — |
| `hemberedskap-utrustning` | Hemberedskap: Utrustning för kris, elavbrott och vardagssäkerhet | overlevnadsutrustning-actionking |
| `hoverair-dronare` | HoverAir-Drönare | — |
| `hoverair-dronartillbehor` | HoverAir-Drönartillbehör | — |
| `kablar` | Kablar | — |
| `kamerastativ` | Kamerastativ för actionkameror och drönare - stort utbud online | actionkamer-dji-gopro-insta360 |
| `kopvillkor` | Köpvillkor | — |
| `laddare-dji-batterier` | Laddare för DJI batterier | — |
| `ljud` | Ljud | — |
| `minneskort-lagring` | Minneskort & Lagring | — |
| `minneskort-till-gopro` | Minneskort till GoPro | — |
| `nackrem-till-dronare` | Nackrem till drönare | — |
| `nitecore-innovation-prestanda` | Nitecore | — |
| `om-actionking-se` | Om ActionKing | — |
| `propeller-till-dronare` | Propeller till drönare | — |
| `rekalamtioner-aterkop` | Reklamationer & Återköp | — |
| `reservdelar` | Reservdelar till actionkameror | — |
| `retur-reklamation` | Retur & Reklamation | — |
| `samarbeta-med-actionking` | Samarbeta med ActionKing | — |
| `samarbeta-med-oss` | Samarbeta med oss | — |
| `skydd` | Skydd | — |
| `stativ` | Stativ | — |
| `tillbehor-till-dji-dronare` | Tillbehör till DJI-Drönare | — |
| `tillbehor-till-gopro` | Tillbehör till GoPro | — |
| `vara-varumarken` | Våra Varumärken | — |
| `vaska-till-gopro` | Väska till GoPro | — |
| `vattentat-ficklampa` | Vattentät ficklampa för friluftsliv och äventyr - stort utbud online | ficklampor-actionking |
| `vi-koper-dronare-actionking` | Vi köper din drönare – Snabbt, enkelt och tryggt | — |
| `vilken-bilkamera-ar-bast` | Vilken bilkamera är bäst? | — |

---

## 6. New menu structure (proposed)

Replace catalog-only `main-menu` with taxonomy-driven navigation:

### `main-menu` — Huvudmeny

- **Drönare**
  - DJI Mini → `/collections/dji-mini-4-serien`
  - DJI Air → `/collections/dji-air-serien`
  - DJI Mavic → `/collections/dji-mavic-serien`
  - DJI Avata → `/collections/dji-avata-serien`
  - DJI Neo → `/collections/dji-neo`
  - DJI Flip → `/collections/dji-flip-dronare`
  - Alla konsumentdrönare → `/collections/dji-dronare`
- **Enterprise Drönare**
  - Enterprise översikt → `/collections/enterprise-dronare`
  - DJI Matrice → `/collections/dji-matrice-serien`
  - Mavic Enterprise → `/collections/dji-mavic-serien-enterprise`
  - DJI Agras → `/collections/dji-agras-dronare`
  - Sensors & Payloads → `/collections/enterprise-sensorer`
  - Enterprise tillbehör → `/collections/enterprise-tillbehor`
- **FlyCart**
  - FlyCart 100 → `/collections/dji-flycart-100-lastdronare`
  - FlyCart serie → `/collections/dji-flycart-serien`
- **Branschlösningar**
  - Inspektion → `/collections/inspektionsdronare`
  - Energi & Infrastruktur → `/collections/energi-infrastruktur`
  - Jordbruk → `/collections/jordbruksdronare`
  - Skogsbruk → `/collections/skogsbruksdronare`
  - Kartläggning → `/collections/kartlaggnings-och-matdronare`
  - Transport & Logistik → `/collections/transport-logistik`
- **Reservdelar**
  - Gimbal & motorer → `/collections/reservdelar-gimbal-dronare-motorer`
  - Elektronik & flight components → `/collections/dronarelektronik-flight-components`
  - Neo reservdelar → `/collections/reparation-dji-neo-reservdelar`
- **Tillbehör**
  - Propellrar → `/collections/dronare-propeller-tillbehor`
  - Filter → `/collections/filter-till-dronare`
  - Batterier → `/collections/batterier`
  - Väskor & cases → `/collections/dronarryggsack-vaskor`
  - Fjärrkontroller → `/collections/fjarrkontroll-dronare`
  - PolarPro → `/collections/polarpro`
- **Legacy DJI**
  - Phantom → `/collections/dji-phantom-3-se`
  - Air 2 / Air 2S → `/collections/dji-air-2-serien`
  - Mini 2 → `/collections/tillbehor-dji-mini-2-2-se`
  - Mavic 2 → `/collections/dji-mavic-2-serien`

### `enterprise-dr-nare` — Enterprise Drönare

- Enterprise drönare → `/collections/enterprise-dronare`
- Matrice → `/collections/dji-matrice-serien`
- Mavic Enterprise → `/collections/dji-mavic-3-enterprise`
- Agras → `/collections/dji-agras-dronare`
- FlyCart → `/collections/dji-flycart-serien`
- Värmekamera → `/collections/dronare-med-varmekamera`
- Airdrop → `/collections/airdrop-system`

### `footer` — Sidfot

- Alla produkter → `/collections/alla-produkter`

### `customer-account-main-menu` — Kundkonto


### Menus to remove (24 orphan duplicates)

After theme confirmation, remove recreated migration orphans:

- `actionkameror` (Actionkameror) — 0 items, duplicate
- `actionkameror-1` (Actionkameror) — 0 items, duplicate
- `actionkameror-2` (Actionkameror) — 0 items, duplicate
- `actionkameror-3` (Actionkameror) — 0 items, duplicate
- `actionkameror-4` (Actionkameror) — 0 items, duplicate
- `actionkameror-5` (Actionkameror) — 0 items, duplicate
- `actionkameror-6` (Actionkameror) — 0 items, duplicate
- `actionkameror-7` (Actionkameror) — 0 items, duplicate
- `dronare` (Drönare) — 0 items, duplicate
- `dronare-1` (Drönare) — 0 items, duplicate
- `dronare-2` (Drönare) — 0 items, duplicate
- `dronare-3` (Drönare) — 0 items, duplicate
- `dronare-4` (Drönare) — 0 items, duplicate
- `dronare-5` (Drönare) — 0 items, duplicate
- `dronare-6` (Drönare) — 0 items, duplicate
- `dronare-7` (Drönare) — 0 items, duplicate
- `partnership` (Partnership) — 0 items, duplicate
- `partnership-1` (Partnership) — 0 items, duplicate
- `partnership-2` (Partnership) — 0 items, duplicate
- `partnership-3` (Partnership) — 0 items, duplicate
- `partnership-4` (Partnership) — 0 items, duplicate
- `partnership-5` (Partnership) — 0 items, duplicate
- `partnership-6` (Partnership) — 0 items, duplicate
- `partnership-7` (Partnership) — 0 items, duplicate

### Menus to keep (5)

- `main-menu` — 0 items
- `meny` — 0 items
- `footer` — 0 items
- `enterprise-dr-nare` — 0 items
- `customer-account-main-menu` — 0 items

---

## 7. SEO impact analysis

| Risk level | Collections | Impact |
|---|---|---|
| **High** (100+ products or page-linked) | 22 | Do not delete; ensure redirects if merged |
| **Medium** (10–99 products) | 43 | Monitor rankings; keep canonical URLs |
| **Low** (empty, unreferenced) | 10 | Safe to delete with 301 to parent taxonomy |
| **Protected empty** | 34 | Keep for future SEO — populate with curated products |

### Top collections by SEO weight

| Handle | Products | SEO score | Page refs |
|---|---:|---:|---|
| `dji` | 84 | 54 | dji-osmo |
| `dji-dronare` | 22 | 45 | dji-osmo |
| `alla-produkter` | 841 | 44 | — |
| `dronartillbehor-kop` | 615 | 42 | — |
| `gopro-hero13-vaska` | 610 | 42 | — |
| `gopro-hero13-black-skydd` | 476 | 40 | — |
| `vendors-q-sunnylife` | 377 | 39 | — |
| `polarpro` | 428 | 39 | — |
| `dronartillbehor-dronar` | 374 | 39 | — |
| `dronare-propeller-tillbehor` | 366 | 38 | — |
| `filter-till-dronare` | 252 | 36 | — |
| `filter-dronare-lins` | 261 | 36 | — |
| `dronarryggsack-vaskor` | 203 | 35 | — |
| `gopro-tillbehor-vendors` | 228 | 35 | — |
| `tillbehor-dji-mini-2-2-se` | 47 | 35 | — |
| `dji-phantom-3-se` | 43 | 35 | — |
| `reservdelar-gimbal-dronare-motorer` | 171 | 34 | — |
| `dronarelektronik-flight-components` | 175 | 34 | — |
| `amagisn-kameratillbehor-och-dronarutrustning` | 149 | 33 | — |
| `kapor-till-dronare` | 158 | 33 | — |

### DELETE impact

Removing 10 empty orphans has **minimal SEO risk** — none have products, menu links, or page references.


---

## 8. Redirect recommendations

| From | To | Type | Trigger |
|---|---|---|---|
| `/collections/dji-mavic-3-classic-1` | `/collections/dji-mavic-3-classic` | 301 | MERGE duplicate |
| `/collections/dji-air-3-serien` | `/collections/dji-dronare` | 301 | DELETE empty orphan |
| `/collections/ji-mini-5-pro-filter` | `/collections/dji-dronare` | 301 | DELETE empty orphan |
| `/collections/dji-avata` | `/collections/dji-dronare` | 301 | DELETE empty orphan |
| `/collections/dji-mini-3-pro-dronare-set` | `/collections/dji-dronare` | 301 | DELETE empty orphan |
| `/collections/minneskort-lagring` | `/collections/dronartillbehor-kop` | 301 | DELETE empty orphan |
| `/collections/gopro-batterier` | `/collections/alla-produkter` | 301 | DELETE empty orphan |
| `/collections/ringlampa` | `/collections/dronartillbehor-kop` | 301 | DELETE empty orphan |
| `/collections/kamerastativ-tripod` | `/collections/dronartillbehor-kop` | 301 | DELETE empty orphan |
| `/collections/osmo-action-6-tillbehor` | `/collections/alla-produkter` | 301 | DELETE empty orphan |
| `/collections/dronare-reservdelar-ovriga` | `/collections/dji-dronar-reservdelar` | 301 | DELETE empty orphan |

---

## 9. Product migration plan

### Phase 1 — Merge duplicates

- **dji-mavic-3-classic-1** → **dji-mavic-3-classic** (2 products): Reassign smart-collection rules / manual product tags to canonical handle

### Phase 2 — Populate protected empty shells

- `dji-matrice-serien`: Populate from related taxonomy (Enterprise DJI) — do not delete
- `dji-matrice-3-serien`: Populate from related taxonomy (Enterprise DJI) — do not delete
- `dji-matrice-400-serien`: Populate from related taxonomy (Enterprise DJI) — do not delete
- `dji-flycart-serien`: Populate from related taxonomy (FlyCart) — do not delete
- `dji-inspire-serien`: Populate from related taxonomy (Legacy DJI models) — do not delete
- `dji-mini-2-serien`: Populate from related taxonomy (Legacy DJI models) — do not delete
- `dji-phantom-tillbehor-vaska-reservdelar`: Populate from related taxonomy (Legacy DJI models) — do not delete
- `dji-air-2s-tillbehor`: Populate from related taxonomy (Legacy DJI models) — do not delete
- `dji-phantom-4-pro-dronare`: Populate from related taxonomy (Legacy DJI models) — do not delete
- `dji-phantom-3-pro-v1`: Populate from related taxonomy (Legacy DJI models) — do not delete
- `dji-inspire`: Populate from related taxonomy (Legacy DJI models) — do not delete
- `dji-matrice-4-serie`: Populate from related taxonomy (Enterprise DJI) — do not delete
- `dji-mavic-3-enterprise`: Populate from related taxonomy (Enterprise DJI) — do not delete
- `dji-matrice-350-rtk-tillbehor`: Populate from related taxonomy (Enterprise DJI) — do not delete
- `dji-matrice-30-serie-tillbehor`: Populate from related taxonomy (Enterprise DJI) — do not delete
- `dji-mavic-3m-dronare-tillbehor`: Populate from related taxonomy (Enterprise DJI) — do not delete
- `dji-flycart-100-lastdronare`: Populate from related taxonomy (FlyCart) — do not delete
- `dji-matrice-4-tillbehor`: Populate from related taxonomy (Enterprise DJI) — do not delete
- `enterprise-service-dronare`: Populate from related taxonomy (Enterprise DJI) — do not delete
- `enterprise-hogtalarsystem`: Populate from related taxonomy (Enterprise DJI) — do not delete
- `enterprise-belysning`: Populate from related taxonomy (Enterprise DJI) — do not delete
- `dji-phantom-serien`: Populate from related taxonomy (Legacy DJI models) — do not delete
- `dji-mavic-serien-enterprise`: Populate from related taxonomy (Enterprise DJI) — do not delete
- `enterprise-lyftsystem`: Populate from related taxonomy (Enterprise DJI) — do not delete
- `enterprise-sensorer`: Populate from related taxonomy (Sensors & Payloads) — do not delete
- _…and 8 more protected shells_

### Phase 3 — Taxonomy alignment

- Tag products with `product_type` matching target IA (Consumer / Enterprise / Spare Parts / Accessories)
- Use smart collection rules per model family (Mavic 3, Mini 4, Matrice 4, etc.)
- Route `alla-produkter` (841 products) as catalog fallback; deprecate once family hubs are complete

### Phase 4 — Menu wiring

- Update `main-menu` from `/collections/all` to proposed taxonomy tree (Section 6)
- Populate `enterprise-dr-nare` menu (currently 0 items)

---

## 10. Final collection count after cleanup

| Stage | Count |
|---|---:|
| Current live collections | 157 |
| After MERGE (1) | 146 |
| After DELETE (10, approved) | **136** |
| Protected shells retained | 34 |

---

## Approval checklist

Before executing any changes, confirm:

- [ ] KEEP list approved
- [ ] MERGE pairs approved
- [ ] DELETE list approved (10 collections)
- [ ] Proposed menu structure approved
- [ ] Redirect map approved
- [ ] Protected Legacy DJI / Enterprise / FlyCart / Industry shells to populate (not delete)

**No action will be taken until explicit approval.**
