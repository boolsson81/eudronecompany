# EuroDroneParts — Recommended Collection Architecture

**Generated:** 2026-06-13T09:19:46.348Z
**Status:** Planning document — no deletions performed
**Source inventory:** 157 live collections

## Target taxonomy (9 groups)

| # | Group | Current collections | Recommended future role |
|---|-------|--------------------:|-------------------------|
| 1 | Consumer DJI | 52 | Model-family tree: drones → accessories per Mavic/Mini/Air/Avata/Neo/Flip |
| 2 | Enterprise DJI | 8 | Matrice, Mavic Enterprise, Agras, enterprise controllers & enterprise accessories |
| 3 | FlyCart | 0 active (+2 empty shells in Delete) | FlyCart 100 platform — recreate one hub after cleanup |
| 4 | Sensors & Payloads | 2 | Thermal cameras, airdrop, enterprise sensors |
| 5 | Industry Solutions | 1 active (+6 empty shells in Delete) | Vertical SEO landing collections |
| 6 | Spare Parts | 5 | Model-specific repair & replacement components |
| 7 | Accessories | 29 | Cross-model consumables: props, filters, bags, batteries, tools, third-party |
| 8 | Legacy DJI models | 17 | Phantom, Inspire, Air 2, Mini 2, ActionKing-era — deprecate over time |
| 9 | Delete candidates | 43 | Empty orphans — remove after final review |

## Recommended final architecture

```
EuroDroneParts Collections
├── Consumer DJI/
│   ├── By model family (Mavic, Mini, Air, Avata, Neo, Flip, FPV)
│   │   ├── Drones (smart collections per model)
│   │   └── Accessories (per-model tillbehör)
│   └── Controllers & RC (RC, RC Pro, consumer FPV)
├── Enterprise DJI/
│   ├── Platform lines (Matrice 4/350/400, Mavic 3E/3M, Agras, Marvic)
│   ├── Enterprise accessories
│   └── Enterprise controllers
├── FlyCart/
│   └── FlyCart 100 + series
├── Sensors & Payloads/
│   ├── Thermal / multispectral
│   └── Airdrop & specialty payloads
├── Industry Solutions/
│   ├── Inspection, Agriculture, Forestry, Surveying
│   └── Energy, Transport & Logistics
├── Spare Parts/
│   └── Per-model reservdelar & repair
├── Accessories/
│   ├── Universal (props, filters, cases, batteries)
│   └── Third-party brands (PolarPro, PGYTech, etc.)
├── Legacy DJI models/  [sunset]
└── Delete candidates/  [remove]
```

## Consolidation recommendations

1. **Merge** `dji-mavic-3-classic-1` → `dji-mavic-3-classic` (duplicate title).
2. **Collapse** empty series shells (Matrice 3/4/400 serien, Phantom serien) — already in Delete candidates.
3. **Consumer hub:** Keep `dji` as brand landing; route `alla-produkter` to catalog or retire in favor of family hubs.
4. **Enterprise hub:** `enterprise-dronare` remains top-level enterprise landing.
5. **Industry Solutions:** Promote 7 vertical collections as SEO landing pages; link from Enterprise hub.
6. **Legacy sunset:** Move ActionKing/GoPro/Osmo collections to Legacy group; no new products.
7. **Post-delete target:** ~114 active collections after removing 43 empty orphans + 1 merge.

## 1. Consumer DJI (52)

| Handle | Title | Products | Current audit |
|---|---|---:|---|
| `dij-air-3-serien` | DJI Air 3-Serien för Professionell Flygfotografering | 3 | KEEP |
| `dji` | DJI: Innovation inom Drönarteknik | 84 | KEEP |
| `dji-air-3` | DJI AIR 3 | 3 | KEEP |
| `dji-air-3-tillbehor-omfattande-sortiment` | Omfattande Sortiment av DJI Air 3 Tillbehör | 66 | KEEP |
| `dji-air-3s` | DJI Air 3S | 2 | KEEP |
| `dji-air-serien` | DJI AIR-serien | 6 | KEEP |
| `dji-avata-2-tillbehor` | DJI Avata 2 tillbehör – Skydd & batterier till din drönare | 51 | KEEP |
| `dji-avata-pro-fpv-dronare` | Avata Pro FPV-Drönare – Nästa Generations Flygning | 2 | KEEP |
| `dji-avata-serien` | DJI Avata-Serien | 2 | KEEP |
| `dji-avata-tillbehor` | DJI Avata Tillbehör | 6 | KEEP |
| `dji-dronare` | DJI Drönare | 22 | KEEP |
| `dji-dronare-fjarrkontroller` | Fjärrkontroller och Tillbehör för DJI Drönare | 7 | KEEP |
| `dji-flip-batteri-tillbehor` | Optimala DJI Flip tillbehör – Maxa din drönarupplevelse! | 3 | KEEP |
| `dji-flip-dronare` | DJI Flip: Kompakta Vikbara Drönare | 3 | KEEP |
| `dji-flip-tillbehor` | DJI Flip™ tillbehör – Optimal utrustning till din drönare | 63 | KEEP |
| `dji-fpv-tillbehor` | Dji FPV Tillbehör – Optimera Din Flygning Med Kvalitet | 1 | KEEP |
| `dji-mavic-3-cine-dronare` | DJI Mavic 3 Cine: Ultimata Drönaren för Filmskapare | 1 | KEEP |
| `dji-mavic-3-classic` | Tillbehör DJI Mavic 3 Classic | 15 | KEEP |
| `dji-mavic-3-classic-1` | DJI Mavic 3 Classic | 2 | MERGE |
| `dji-mavic-3-pro-avancerad-dronarteknik` | DJI Mavic 3 Pro: Avancerad Drönarteknik | 5 | KEEP |
| `dji-mavic-3-pro-tillbehor` | DJI Mavic 3 Pro tillbehör – Drönartillbehör för proffs | 11 | KEEP |
| `dji-mavic-3-serien` | DJI Mavic 3-serien: Proffsens val av drönare | 11 | KEEP |
| `dji-mavic-3-tillbehor` | DJI Mavic 3 Tillbehör för Optimal Prestanda | 66 | KEEP |
| `dji-mavic-4-pro` | DJI Mavic 4 Tillbehör | 3 | KEEP |
| `dji-mavic-4-serien` | Upptäck DJI Mavic 4-serien för exceptionell flygfotografering | 3 | KEEP |
| `dji-mavic-air-tillbehor` | Komplett utbud av DJI Mavic Air Tillbehör | 39 | KEEP |
| `dji-mavic-pro-batteri-vaska` | dji mavic pro batteri väska - DJI Mavic Pro Batteriväska och Tillbehör | 5 | KEEP |
| `dji-mavic-pro-tillbehor` | Omfattande DJI Mavic Pro Tillbehör | 46 | KEEP |
| `dji-mavic-serien` | DJI Mavic-Serien | 6 | KEEP |
| `dji-mavic-tillbehor` | Dji Mavic Tillbehör för Förbättrad Flygning | 9 | KEEP |
| `dji-mini-3` | DJI Mini 3 Drönare för Professionellt Flygfoto | 5 | KEEP |
| `dji-mini-3-serien` | DJI Mini 3-Serien | 5 | KEEP |
| `dji-mini-3-tillbehor` | DJI Mini 3 Tillbehör | 43 | KEEP |
| `dji-mini-4-pro` | DJI Mini 4 Pro – Frihet, precision och kreativ kontroll i miniformat | 1 | KEEP |
| `dji-mini-4-pro-tillbehor` | DJI Mini 4 Pro | 14 | KEEP |
| `dji-mini-4-serien` | DJI Mini 4-Serien | 2 | KEEP |
| `dji-mini-5-serien` | DJI Mini 5-Serien | 2 | KEEP |
| `dji-mini-tillbehor` | DJI Mini Tillbehör för Din Drönare | 7 | KEEP |
| `dji-neo` | DJI Neo | 3 | KEEP |
| `dji-neo-2-tillbehor` | DJI Neo 2 Tillbehör för din Drönare | 54 | KEEP |
| `dji-neo-tillbehor` | DJI Neo Tillbehör – Batteri & mer för din drönare | 129 | KEEP |
| `dji-rc-fjarrkontroller` | DJI RC – Smart fjärrkontroll | 7 | KEEP |
| `dji-rc-pro-tillbehor` | DJI RC Pro Tillbehör – Optimera Din Fjärrkontroll | 5 | KEEP |
| `dronare-med-kamera` | Drönare med kamera | 47 | KEEP |
| `tillbehor-dji-air-3s` | Tillbehör DJI Air 3S - Tillbehör för DJI Air 3S: Komplettera din dröna | 13 | KEEP |
| `tillbehor-dji-air-serien` | Tillbehör till DJI Air-Serien – Uppgradera din drönare idag! | 12 | KEEP |
| `tillbehor-dji-avata-serien` | DJI Avata tillbehör: FPV-drönarutrustning för proffs & nybörjare | 14 | KEEP |
| `tillbehor-dji-mavic-3-cine` | Tillbehör DJI Mavic 3 Cine för optimal prestanda | 10 | KEEP |
| `tillbehor-dji-mini-4` | DJI Mini 3 Tillbehör: Utforska drönarens fulla potential | 18 | KEEP |
| `tillbehor-dji-mini-4-serien` | Tillbehör till DJI Mini 4-serien – Maxa din drönarupplevelse! | 3 | KEEP |
| `tillbehor-dji-neo` | DJI Neo tillbehör – Batteri & mer för optimal flygning | 20 | KEEP |
| `tillbehor-till-dji-air-3-serien` | Tillbehör till DJI AIR 3-Serien | 14 | KEEP |

## 2. Enterprise DJI (8)

| Handle | Title | Products | Current audit |
|---|---|---:|---|
| `dji-agras-dronare` | DJI Agras Drönare för Precisionsjordbruk | 1 | KEEP |
| `dji-enterprise-fjarrkontroller` | Professionella Fjärrkontroller för DJI Enterprise | 3 | KEEP |
| `dji-marvic-enterprise` | DJI Marvic Enterprise | -2 | KEEP |
| `enterprise-dronare` | Enterprise Drönare för Industri och Inspektion | 11 | KEEP |
| `enterprise-dronartillbehor` | Professionella Enterprise drönartillbehör | 11 | KEEP |
| `enterprise-propellrar` | Enterprise Propellrar | 1 | KEEP |
| `enterprise-tillbehor` | Enterprise Tillbehör | 26 | KEEP |
| `tillbehor-dji-mavic-dronare` | dji mavic 3e - Tillbehör för DJI Mavic Drönare | 2 | KEEP |

## 3. FlyCart (0)

_No active collections. Future hub: `dji-flycart-serien` or `dji-flycart-100-lastdronare` (currently empty → Delete candidates)._

## 4. Sensors & Payloads (2)

| Handle | Title | Products | Current audit |
|---|---|---:|---|
| `airdrop-system` | Airdrop System | 22 | KEEP |
| `dronare-med-varmekamera` | Drönare med värmekamera | 1 | KEEP |

## 5. Industry Solutions (1)

| Handle | Title | Products | Current audit |
|---|---|---:|---|
| `last-och-transportdronare` | Last- och transportdrönare | 2 | KEEP |

## 6. Spare Parts (5)

| Handle | Title | Products | Current audit |
|---|---|---:|---|
| `dji-dronar-reservdelar` | Hitta DJI-drönar reservdelar av hög kvalitet | 16 | KEEP |
| `dronarelektronik-flight-components` | Reservdelar & Komponenter för DJI & FPV | 175 | KEEP |
| `reparation-dji-neo-reservdelar` | Reparation DJI Neo – Fixa din drönare snabbt och enkelt! | 4 | KEEP |
| `reparera-precisionsverktyg-elektronik` | Precisionsverktyg Elektronik: Reparera kamera & drönare enkelt | 36 | KEEP |
| `reservdelar-gimbal-dronare-motorer` | Reservdelar Gimbal Drönare: Gimbalmotorer för Optimal Stabilisering | 171 | KEEP |

## 7. Accessories (29)

| Handle | Title | Products | Current audit |
|---|---|---:|---|
| `alla-produkter` | Alla produkter Drönare | 841 | KEEP |
| `amagisn-kameratillbehor-och-dronarutrustning` | kameratillbehör - AMagisn Tillbehör för Kamera och Drönare | 149 | KEEP |
| `bandverktyg` | Bändverktyg för Precisionsreparationer | 2 | KEEP |
| `batterier` | Batterier och laddare | 64 | KEEP |
| `belysning-till-dronare` | Belysning till drönare | 28 | KEEP |
| `brdrc-tillbehor` | Kompletta BRDRC Tillbehör för Din Utrustning | 134 | KEEP |
| `dronar-fjarrkontrollstillbehor` | Drönar - fjärrkontrollstillbehör | 32 | KEEP |
| `dronar-kameror` | Professionella Drönar kameror för Flygfoto | 3 | KEEP |
| `dronare-propeller-tillbehor` | Drönare Propeller Tillbehör för Optimal Flygning | 366 | KEEP |
| `dronarmatta-landning-skydd` | Landningsmattor Drönare – Säker & Stabil Flygning | 21 | KEEP |
| `dronarpropellrar-tysta` | Hållbara drönarpropellrar för optimal flygning och prestanda | 128 | KEEP |
| `dronarryggsack-vaskor` | Robust drönarryggsäck för säker transport av din drönare | 203 | KEEP |
| `dronartillbehor-dronar` | Drönartillbehör Dronar för Optimal Flygning | 374 | KEEP |
| `dronartillbehor-kop` | Drönartillbehör: Filter för bättre flygfotografering | 615 | KEEP |
| `filter-dronare-lins` | Filter drönare: Skydda din lins med premium glasfilter | 261 | KEEP |
| `filter-till-dronare` | Filter till Drönare för Optimal Bildkvalitet | 252 | KEEP |
| `fjarrkontroll-dronare` | Fjärrkontroll drönare: Precision & kontroll för din flygning | 10 | KEEP |
| `kapor-till-dronare` | Högkvalitativa Kåpor till Drönare | 158 | KEEP |
| `landningsstall-dronare` | Landningsställ till drönare – Stabil och säker landning | 42 | KEEP |
| `master-airscrew-dji-propellrar` | Master Airscrew DJI propellrar – Tysta & Effektiva | 42 | KEEP |
| `multiverktyg-friluftsliv` | Multiverktyg friluftsliv: Kompakt & Mångsidigt Äventyrsverktyg | 14 | KEEP |
| `pgytech-tillbehor` | Pgytech Tillbehör för Kreativa Skapare | 3 | KEEP |
| `polarpro` | Polarpro | 428 | KEEP |
| `propellerskydd-1` | Robusta Propellerskydd för Säkrare Drönarflygning | 56 | KEEP |
| `skruvmejsel-set` | Skruvmejsel Set – Precisionsverktyg för Alla Behov | 6 | KEEP |
| `skydd-dronare` | Skydd till drönare: Propeller, Gimbal & Skal – Skydda din drönare! | 53 | KEEP |
| `tillbehorskablar-dronare` | Kablar till drönare | 10 | KEEP |
| `usb-kablar-usb-c-till-usb-c` | Kraftfulla USB-kablar USB-C till USB-C | 23 | KEEP |
| `vattentatt-kameraskydd` | Vattentätt kameraskydd för kamera & drönare | 141 | KEEP |

## 8. Legacy DJI models (17)

| Handle | Title | Products | Current audit |
|---|---|---:|---|
| `dji-air-2-serien` | DJI Air 2 Serien: Drönare och Tillbehör | 1 | KEEP |
| `dji-air-2s` | DJI Air 2S | 1 | KEEP |
| `dji-mavic-2-pro` | DJI Mavic 2 Pro | 1 | KEEP |
| `dji-mavic-2-serien` | DJI Mavic 2-serien: Avancerade Drönare | 2 | KEEP |
| `dji-phantom-3-se` | DJI Phantom 3 SE Drönare med Kamera | 43 | KEEP |
| `dronare-actionking` | Drönare | 47 | KEEP |
| `fasten-adaptrar-actionkameror` | Universal Fästen och Adaptrar till actionkameror | 5 | KEEP |
| `gopro-hero13-black-skydd` | GoPro Hero13 Black skydd - Skydda din GoPro Hero13 Black med rätt skyd | 476 | KEEP |
| `gopro-hero13-vaska` | GoPro Hero13 väska – Skydda din actionkamera tryggt | 610 | KEEP |
| `gopro-tillbehor-vendors` | Hitta pålitliga GoPro tillbehör vendors här | 228 | KEEP |
| `kamerakablar-actionking` | Kamerakablar för Optimal Prestanda | 12 | KEEP |
| `pincetter-actionking` | Pincetter | 1 | KEEP |
| `rengoringsprodukter-actionking` | Rengörning för elektronik | 18 | KEEP |
| `tanger-actionking` | Tänger Action: Precision och Styrka | 1 | KEEP |
| `tillbehor-dji-mavic-2` | Tillbehör DJI Mavic 2: Utrustning för din drönare | 4 | KEEP |
| `tillbehor-dji-mini-2-2-se` | Tillbehör DJI Mini 2 / 2 SE - Tillbehör för DJI Mini | 47 | KEEP |
| `vendors-q-sunnylife` | Sunnylife: Köp vattentäta kameraskydd & actionkamera tillbehör | 377 | KEEP |

## 9. Delete candidates (43)

| Handle | Title | Products | Intended future group |
|---|---|---|---|
| `dji-air-2-tillbehor` | Högkvalitativa DJI Air 2 Tillbehör för Drönare | 0 | Legacy DJI models |
| `dji-air-2s-tillbehor` | DJI Air 2S Tillbehör – Optimerad Flygning | 0 | Legacy DJI models |
| `dji-air-3-serien` | DJI Air 3 Serien | 0 | Consumer DJI |
| `dji-avata` | DJI Avata: Framtidens FPV Drönare | 0 | Consumer DJI |
| `dji-flycart-100-lastdronare` | DJI FlyCart 100: Lastdrönare för Tunga Lyft | 0 | FlyCart |
| `dji-flycart-serien` | DJI FlyCart Serien | 0 | FlyCart |
| `dji-inspire` | DJI Inspire Serien Professionella Drönare för Kreatörer | 0 | Legacy DJI models |
| `dji-inspire-serien` | DJI Inspire Serien | 0 | Legacy DJI models |
| `dji-matrice-3-serien` | DJI Matrice 4 Serien | 0 | Enterprise DJI |
| `dji-matrice-4-serie` | dji matrice 4 Serie | 0 | Enterprise DJI |
| `dji-matrice-4-tillbehor` | DJI Matrice 4 Tillbehör för Professionella Drönare | 0 | Enterprise DJI |
| `dji-matrice-30-serie-tillbehor` | dji arm - DJI Matrice 30 Serie Tillbehör | 0 | Enterprise DJI |
| `dji-matrice-350-rtk-tillbehor` | DJI Matrice 350 RTK Tillbehör och Skydd | 0 | Enterprise DJI |
| `dji-matrice-400-serien` | DJI Matrice 400 Serien för Professionella Uppdrag | 0 | Enterprise DJI |
| `dji-matrice-serien` | DJI Matrice-serien – Professionella Enterprise-drönare | 0 | Enterprise DJI |
| `dji-mavic-3-enterprise` | DJI Mavic 3 Enterprise - Kvalitet & | 0 | Enterprise DJI |
| `dji-mavic-3m-dronare-tillbehor` | DJI Mavic 3M Drönare och Tillbehör | 0 | Enterprise DJI |
| `dji-mavic-serien-enterprise` | DJI Mavic Serien enterprise | 0 | Enterprise DJI |
| `dji-mini-2-serien` | DJI Mini 2-Serien | 0 | Legacy DJI models |
| `dji-mini-3-pro-dronare-set` | Komplett Set DJI Mini 3 Pro | 0 | Consumer DJI |
| `dji-phantom-3-pro-v1` | DJI Phantom 3 Pro v1 Drönare och Tillbehör | 0 | Legacy DJI models |
| `dji-phantom-4-pro-dronare` | DJI Phantom 4 Pro Drönare för Professionella | 0 | Legacy DJI models |
| `dji-phantom-serien` | DJI Phantom Serien | 0 | Legacy DJI models |
| `dji-phantom-tillbehor-vaska-reservdelar` | DJI Phantom Tillbehör för Optimal Prestanda | 0 | Legacy DJI models |
| `dronare-reservdelar-ovriga` | Drönare reservdelar: Allt för din drönarreparation | 0 | Spare Parts |
| `energi-infrastruktur` | Energi & Infrastruktur | 0 | Industry Solutions |
| `enterprise-belysning` | Enterprise belysning | 0 | Enterprise DJI |
| `enterprise-hogtalarsystem` | Enterprise Högtalarsystem | 0 | Enterprise DJI |
| `enterprise-lyftsystem` | Enterprise Lyftsystem | 0 | Enterprise DJI |
| `enterprise-sensorer` | Enterprise Sensorer | 0 | Sensors & Payloads |
| `enterprise-service-dronare` | Enterprise Service för Företagsdrönare | 0 | Enterprise DJI |
| `gopro-batterier` | GoPro Batterier för Längre Filmning | 0 | Legacy DJI models |
| `inspektionsdronare` | Inspektionsdrönare | 0 | Industry Solutions |
| `ji-mini-5-pro-filter` | DJI Mini 5 Pro filter | 0 | Accessories |
| `jordbruksdronare` | Jordbruksdrönare | 0 | Industry Solutions |
| `kamerastativ-tripod` | Kamerastativ & Tripod – Stabilt Mobil- och Kamerastativ | 0 | Legacy DJI models |
| `kartlaggnings-och-matdronare` | Kartläggnings- och mätdrönare | 0 | Industry Solutions |
| `minneskort-lagring` | Minneskort & Lagring | 0 | Accessories |
| `osmo-action-6-tillbehor` | Osmo Action 6 tillbehör: Komplett utbud för din actionkamera | 0 | Legacy DJI models |
| `ringlampa` | ringlampa - Ringlampor för Professionell Belysning | 0 | Accessories |
| `skogsbruksdronare` | Skogsbruksdrönare | 0 | Industry Solutions |
| `tillbehor-dji-inspire` | DJI Inspire Tillbehör | 0 | Legacy DJI models |
| `transport-logistik` | Transport & Logistik | 0 | Industry Solutions |

## Future state after cleanup (projected)

| Metric | Count |
|--------|------:|
| Active collections today | 114 |
| Delete candidates (empty orphans) | 43 |
| Merge operations | 1 (`dji-mavic-3-classic-1` → `dji-mavic-3-classic`) |
| **Projected active after cleanup** | **~113** |

### Empty shells to recreate (currently in Delete candidates)

| Intended group | Empty shells | Action |
|---|---:|---|
| Enterprise DJI | 14 | Merge into `enterprise-dronare` hub or populate Matrice/Mavic Enterprise series |
| Legacy DJI models | 13 | Leave deleted — legacy sunset |
| Industry Solutions | 6 | Populate vertical landing pages with curated products |
| Consumer DJI | 3 | Merge into active family hubs (duplicate shells) |
| Accessories | 3 | Review individually |
| FlyCart | 2 | Recreate one FlyCart hub with products |
| Spare Parts | 1 | Review individually |
| Sensors & Payloads | 1 | Populate `enterprise-sensorer` hub |

## Navigation mapping (future menus)

| Main menu item | Target collection group |
|---|---|
| Drönare (consumer) | Consumer DJI → family hubs |
| Enterprise Drönare | Enterprise DJI + Industry Solutions |
| Reservdelar | Spare Parts |
| Tillbehör | Accessories + model-specific Consumer tillbehör |
| FlyCart | FlyCart |
