# EuroDroneParts — URL Localization Audit

**Generated:** 2026-06-13T13:02:25.924Z
**Target store:** ya1xhg-x6.myshopify.com (Europe Drone Parts)
**Migration:** `3d9876af-885c-49e9-a4b0-c4943c06112f` (ActionKing → EUDroneParts)
**Mode:** Read-only — no Shopify changes, no redirects deployed

## Executive summary

| Metric | Count |
|---|---:|
| Live collections | 204 |
| Source collections (migration DB) | 824 |
| Live pages | 94 |
| Live blogs | 1 |
| Live blog articles | 68 |
| Live products (fetched) | 9389 |
| Live products (store total) | 9389 |
| Live menus | 214 |
| Menu links (all) | 142 |
| **Swedish/mixed handles (live collections)** | **40** |
| Swedish/mixed handles (live pages) | 6 |
| Swedish/mixed handles (live products sample) | 3467 |
| Swedish/mixed handles (blogs/articles) | 36 |
| Swedish menu links | 60 |
| Handles with Swedish chars (å/ä/ö) | 0 |
| Duplicate English alternatives detected | 0 |

### Traffic light: **RED**

More than 500 URLs affected — large-scale handle migration required before credible EN launch.

### Recommendation: **B) Localize before launch**

---

## SECTION 1 — Collections using Swedish handles

**Live target:** 40 of 204 collections have Swedish tokens in the **URL handle**. A further ~120 collections use English handles but retain Swedish **titles** (e.g. `accessories-dji-air-3s` → "Tillbehör DJI Air 3S"). Title localization is out of scope for this URL audit.

### Breakdown by pattern

| Pattern | Count |
|---|---:|
| Swedish ASCII tokens (tillbehor, dronare, reservdelar, etc.) | 13 |
| Mixed Swedish + English brand (e.g. dji-*-tillbehor) | 27 |
| Swedish characters (å/ä/ö) in handle | 0 |

### Top Swedish collection handles (live target)

| Handle | Title | Category | SwedishTokens | SuggestedEN |
| --- | --- | --- | --- | --- |
| amagisn-kameratillbehor-and-dronarutrustning | kameratillbehör - AMagisn Tillbehör för Kamera och Drönare | mixed_swedish_english | tillbehor, dronar, kameratillbehor, utrustning | — |
| bandverktyg | Bändverktyg för Precisionsreparationer | swedish_ascii | bandverktyg, verktyg | pliers |
| belysning-for-drones | Belysning till drönare | mixed_swedish_english | belysning | lighting-for-drones |
| dji-air-3-kablar | DJI Air 3 — Kablar | mixed_swedish_english | kablar | dji-air-3-cables |
| dji-air-3-kameror | DJI Air 3 — Kameror | mixed_swedish_english | kameror | dji-air-3-cameras |
| dji-air-3-landningsstall | DJI Air 3 — Landningsställ | mixed_swedish_english | landningsstall | dji-air-3-landing-gear |
| dji-drones-fjarrkontroller | Fjärrkontroller och Tillbehör för DJI Drönare | mixed_swedish_english | fjarrkontroll, fjarrkontroller | dji-drones-remote-controllers |
| dji-enterprise-fjarrkontroller | Professionella Fjärrkontroller för DJI Enterprise | mixed_swedish_english | fjarrkontroll, fjarrkontroller | dji-enterprise-remote-controllers |
| dji-flycart-100-lastdronare | DJI FlyCart 100: Lastdrönare för Tunga Lyft | mixed_swedish_english | dronare, lastdronare | dji-flycart-100-cargo-drones |
| dji-matrice-4-kablar | DJI Matrice 4 — Kablar | mixed_swedish_english | kablar | dji-matrice-4-cables |
| dji-matrice-4-kameror | DJI Matrice 4 — Kameror | mixed_swedish_english | kameror | dji-matrice-4-cameras |
| dji-mavic-3-enterprise-kameror | DJI Mavic 3 Enterprise — Kameror | mixed_swedish_english | kameror | dji-mavic-3-enterprise-cameras |
| dji-mini-4-pro-kablar | DJI Mini 4 Pro — Kablar | mixed_swedish_english | kablar | dji-mini-4-pro-cables |
| dji-mini-4-pro-kameror | DJI Mini 4 Pro — Kameror | mixed_swedish_english | kameror | dji-mini-4-pro-cameras |
| dji-mini-4-pro-landningsstall | DJI Mini 4 Pro — Landningsställ | mixed_swedish_english | landningsstall | dji-mini-4-pro-landing-gear |
| dji-rc-fjarrkontroller | DJI RC – Smart fjärrkontroll | mixed_swedish_english | fjarrkontroll, fjarrkontroller | dji-rc-remote-controllers |
| dronarelektronik-flight-components | Reservdelar & Komponenter för DJI & FPV | swedish_ascii | dronare, dronar | — |
| dronarmatta-landning-protection | Landningsmattor Drönare – Säker & Stabil Flygning | swedish_ascii | dronar | dronarmatta-landing-protection |
| drone-fjarrkontrollstillbehor | Drönar - fjärrkontrollstillbehör | mixed_swedish_english | tillbehor, fjarrkontroll | — |
| drone-kameror | Professionella Drönar kameror för Flygfoto | mixed_swedish_english | kameror | drone-cameras |
| enterprise-belysning | Enterprise belysning | mixed_swedish_english | belysning | enterprise-lighting |
| enterprise-hogtalarsystem | Enterprise Högtalarsystem | mixed_swedish_english | hogtalarsystem, hogtal | enterprise-speaker-systems |
| enterprise-lyftsystem | Enterprise Lyftsystem | mixed_swedish_english | lyftsystem | enterprise-lifting-system |
| fjarrkontroll-drones | Fjärrkontroll drönare: Precision & kontroll för din flygning | mixed_swedish_english | fjarrkontroll | remote-control-drones |
| inspektionsdronare | Inspektionsdrönare | swedish_ascii | dronare, inspektionsdronare | inspection-drones |
| jordbruksdronare | Jordbruksdrönare | swedish_ascii | dronare, jordbruksdronare | agricultural-drones |
| kamerakablar-actionking | Kamerakablar för Optimal Prestanda | swedish_ascii | kablar | — |
| kartlaggnings-and-matdronare | Kartläggnings- och mätdrönare | mixed_swedish_english | dronare, kartlaggnings, matdronare | mapping-and-survey-drones |
| landningsstall-drones | Landningsställ till drönare – Stabil och säker landning | mixed_swedish_english | landningsstall | landing-gear-drones |
| last-and-transportdronare | Last- och transportdrönare | mixed_swedish_english | dronare | — |
| mounts-adaptrar-action-cameras | Universal Fästen och Adaptrar till actionkameror | mixed_swedish_english | adaptrar | mounts-adapters-action-cameras |
| multiverktyg-friluftsliv | Multiverktyg friluftsliv: Kompakt & Mångsidigt Äventyrsverktyg | swedish_ascii | multiverktyg, friluftsliv, verktyg, friluft | multi-tools-outdoor-life |
| pincetter-actionking | Pincetter | swedish_ascii | pincetter | tweezers-actionking |
| reparera-precisionsverktyg-elektronik | Precisionsverktyg Elektronik: Reparera kamera & drönare enkelt | swedish_ascii | precisionsverktyg, verktyg, reparera | repair-precision-tools-elektronik |
| skogsbruksdronare | Skogsbruksdrönare | swedish_ascii | dronare, skogsbruksdronare | forestry-drones |
| skruvmejsel-set | Skruvmejsel Set – Precisionsverktyg för Alla Behov | swedish_ascii | skruvmejsel | screwdrivers-set |
| tanger-actionking | Tänger Action: Precision och Styrka | swedish_ascii | tanger | pliers-actionking |
| tillbehorskablar-drones | Kablar till drönare | mixed_swedish_english | tillbehor, tillbe, kablar | — |
| usb-kablar-usb-c-for-usb-c | Kraftfulla USB-kablar USB-C till USB-C | mixed_swedish_english | kablar | usb-cables-usb-c-for-usb-c |
| waterproof-kameraskydd | Vattentätt kameraskydd för kamera & drönare | swedish_ascii | skydd | — |


### Notable mixed Swedish/English examples

| Handle | Title | Tokens | URL |
| --- | --- | --- | --- |
| amagisn-kameratillbehor-and-dronarutrustning | kameratillbehör - AMagisn Tillbehör för Kamera och Drönare | tillbehor, dronar, kameratillbehor | /collections/amagisn-kameratillbehor-and-dronarutrustning |
| belysning-for-drones | Belysning till drönare | belysning | /collections/belysning-for-drones |
| dji-air-3-kablar | DJI Air 3 — Kablar | kablar | /collections/dji-air-3-kablar |
| dji-air-3-kameror | DJI Air 3 — Kameror | kameror | /collections/dji-air-3-kameror |
| dji-air-3-landningsstall | DJI Air 3 — Landningsställ | landningsstall | /collections/dji-air-3-landningsstall |
| dji-drones-fjarrkontroller | Fjärrkontroller och Tillbehör för DJI Drönare | fjarrkontroll, fjarrkontroller | /collections/dji-drones-fjarrkontroller |
| dji-enterprise-fjarrkontroller | Professionella Fjärrkontroller för DJI Enterprise | fjarrkontroll, fjarrkontroller | /collections/dji-enterprise-fjarrkontroller |
| dji-flycart-100-lastdronare | DJI FlyCart 100: Lastdrönare för Tunga Lyft | dronare, lastdronare | /collections/dji-flycart-100-lastdronare |
| dji-matrice-4-kablar | DJI Matrice 4 — Kablar | kablar | /collections/dji-matrice-4-kablar |
| dji-matrice-4-kameror | DJI Matrice 4 — Kameror | kameror | /collections/dji-matrice-4-kameror |
| dji-mavic-3-enterprise-kameror | DJI Mavic 3 Enterprise — Kameror | kameror | /collections/dji-mavic-3-enterprise-kameror |
| dji-mini-4-pro-kablar | DJI Mini 4 Pro — Kablar | kablar | /collections/dji-mini-4-pro-kablar |
| dji-mini-4-pro-kameror | DJI Mini 4 Pro — Kameror | kameror | /collections/dji-mini-4-pro-kameror |
| dji-mini-4-pro-landningsstall | DJI Mini 4 Pro — Landningsställ | landningsstall | /collections/dji-mini-4-pro-landningsstall |
| dji-rc-fjarrkontroller | DJI RC – Smart fjärrkontroll | fjarrkontroll, fjarrkontroller | /collections/dji-rc-fjarrkontroller |
| drone-fjarrkontrollstillbehor | Drönar - fjärrkontrollstillbehör | tillbehor, fjarrkontroll | /collections/drone-fjarrkontrollstillbehor |
| drone-kameror | Professionella Drönar kameror för Flygfoto | kameror | /collections/drone-kameror |
| enterprise-belysning | Enterprise belysning | belysning | /collections/enterprise-belysning |
| enterprise-hogtalarsystem | Enterprise Högtalarsystem | hogtalarsystem, hogtal | /collections/enterprise-hogtalarsystem |
| enterprise-lyftsystem | Enterprise Lyftsystem | lyftsystem | /collections/enterprise-lyftsystem |
| fjarrkontroll-drones | Fjärrkontroll drönare: Precision & kontroll för din flygning | fjarrkontroll | /collections/fjarrkontroll-drones |
| kartlaggnings-and-matdronare | Kartläggnings- och mätdrönare | dronare, kartlaggnings, matdronare | /collections/kartlaggnings-and-matdronare |
| landningsstall-drones | Landningsställ till drönare – Stabil och säker landning | landningsstall | /collections/landningsstall-drones |
| last-and-transportdronare | Last- och transportdrönare | dronare | /collections/last-and-transportdronare |
| mounts-adaptrar-action-cameras | Universal Fästen och Adaptrar till actionkameror | adaptrar | /collections/mounts-adaptrar-action-cameras |

---

## SECTION 2 — Pages using Swedish handles

| Handle | Title | Category | SwedishTokens | SuggestedEN |
| --- | --- | --- | --- | --- |
| gopro-faste | GoPro-fäste för actionkamera - flexibla och säkra monteringslösningar | mixed_swedish_english | faste | gopro-mount |
| retur-reklamation | Retur & Reklamation | swedish_ascii | reklamation | returns-reklamation |
| rekalamtioner-aterkop | Reklamationer & Återköp | swedish_ascii | aterkop | — |
| kopvillkor | Köpvillkor | swedish_ascii | kopvillkor | terms-of-purchase |
| kablar | Kablar | swedish_ascii | kablar | cables |
| basta-myggskyddet | Bästa myggskyddet | swedish_ascii | myggskydd | — |

### All live page handles (reference)

| Handle | Title | Category |
| --- | --- | --- |
| contact | Kontakta oss | english |
| actionking-student | ActionKing söker drivna studenter – SEO, Webbutveckling, Content & Marknadsföring | english |
| 360-camera | 360-kamera - stort utbud av kameror och tillbehör online | english |
| vara-varumarken | Våra Varumärken | english |
| dji-neo | DJI Neo | english |
| filter-action-king | Filter | english |
| faq | Välkommen till ActionKings FAQ! | english |
| dji-osmo | DJI Osmo-kameror och tillbehör för film och äventyr | english |
| dji-accessories | DJI-tillbehör för drönare - stort utbud för alla modeller | english |
| gopro-faste | GoPro-fäste för actionkamera - flexibla och säkra monteringslösningar | mixed_swedish_english |
| home-preparedness-equipment | Hemberedskap: Utrustning för kris, elavbrott och vardagssäkerhet | english |
| camera-tripod | Kamerastativ för actionkameror och drönare - stort utbud online | english |
| waterproof-flashlight | Vattentät ficklampa för friluftsliv och äventyr - stort utbud online | english |
| retur-reklamation | Retur & Reklamation | swedish_ascii |
| rekalamtioner-aterkop | Reklamationer & Återköp | swedish_ascii |
| gimbal-and-stabilisering | Gimbal och stabilisering för mobil, kamera och actionkamera | english |
| drone-accessories-dji-m3pro | Drönartillbehör för DJI Mavic 3 Pro – Höj din flygning! | english |
| drones-action-king | Drönare | english |
| protection | Skydd | english |
| dji-avata-series | DJI Avata-serien | english |
| dji-mini-series | DJI Mini-serien | english |
| dji-mavic-series | DJI Mavic-serien | english |
| dji-drones | DJI-Drönare | english |
| hoverair-drones | HoverAir-Drönare | english |
| hoverair-drone-accessories | HoverAir-Drönartillbehör | english |
| dji-mavic-3-series | DJI Mavic 3-serien | english |
| tripod | Stativ | english |
| spare-parts | Reservdelar till actionkameror | english |
| kopvillkor | Köpvillkor | swedish_ascii |
| om-actionking-se | Om ActionKing | english |
| gopro-accessories-and-spare-parts | GoPro Tillbehör och reservdelar allt till din kamera. | english |
| accessories-for-dji-drones | Tillbehör till DJI-Drönare | english |
| chargers-dji-batteries | Laddare för DJI batterier | english |
| vilken-bilkamera-ar-bast | Vilken bilkamera är bäst? | english |
| neck-strap-for-drones | Nackrem till drönare | english |
| propellers-for-drones | Propeller till drönare | english |
| bag-for-gopro | Väska till GoPro | english |
| memory-cards-for-gopro | Minneskort till GoPro | english |
| batteries-and-chargers-for-gopro | Batterier och laddare till GoPro | english |
| accessories-for-gopro | Tillbehör till GoPro | english |
| faq-motorola-t92 | Motorola T92 Frågor och Svar FAQ | english |
| dji-mic-mini-faq | DJI Mic Mini Frågor och svar FAQ | english |
| dji-flip-faq | DJI Flip Frågor och svar FAQ | english |
| nitecore-innovation-prestanda | Nitecore | english |
| dji-air-series | DJI Air-serien | english |
| samarbeta-with-actionking | Samarbeta med ActionKing | english |
| goulet-ul-gear | Goulet UL Gear | english |
| gunter-andreasson-ultracyklist | Günter Andréasson – Ultracyklist, äventyrare och inspiratör | english |
| samarbeta-with-oss | Samarbeta med oss | english |
| we-buy-drones-actionking | Vi köper din drönare – Snabbt, enkelt och tryggt | english |

_Showing 50 of 94 pages._


---

## SECTION 3 — Products using Swedish handles

**Note:** Full catalog has **9389** products. Analysis below covers 9389 handles fetched via GraphQL pagination.

| Handle | Title | Category | SwedishTokens | SuggestedEN |
| --- | --- | --- | --- | --- |
| 1-4-stativadapter-actionkamera | 1/4 stativadapter action - Justerbar 1/4 Stativadapter | swedish_ascii | actionkamera, actionkamer | 1-4-stativadapter-action-camera |
| 10-i-1-universalladdare-usb-laddkabel | 10-i-1 Universalladdare för Alla Dina Enheter | mixed_swedish_english | laddare, kabel | — |
| 100w-gan-laddare-usb-c | 100W GaN laddare USB-C - Kraftfull 100W GaN Laddare med USB-C | mixed_swedish_english | laddare | 100w-gan-chargers-usb-c |
| 100w-usb-c-flatad-kabel | 100W USB-C Flätad Kabel för Snabbladdning | mixed_swedish_english | kabel | 100w-usb-c-flatad-cable |
| 100w-usb-c-laddkabel | Kraftfull 100W USB-C Laddkabel för Snabbladdning | mixed_swedish_english | kabel | — |
| 120w-usb-c-snabbladdkabel | XJ-91 120W USB-C Snabbladdkabel för Högpresterande Enheter | mixed_swedish_english | kabel | — |
| 1m-3a-flatad-metall-micro-usb-kabel | 1m 3A Woven Style Metal Head - Hållbar 1m 3A Flätad Metall Micro | mixed_swedish_english | kabel | 1m-3a-flatad-metall-micro-usb-cable |
| 1m-flatad-metallhuvud-usb-c-kabel | 1m Wires Woven Metal Head - 1m Flätad Metallhuvud USB-C | mixed_swedish_english | kabel | 1m-flatad-metallhuvud-usb-c-cable |
| 1m-flatad-micro-usb-kabel-led | 1m Woven Style Micro USB - Flätad Micro USB Kabel 1m med LED-Indikator | mixed_swedish_english | kabel | 1m-flatad-micro-usb-cable-led |
| 1m-micro-usb-kabel-metall | 1m Micro USB-kabel Metall för Snabbladdning | mixed_swedish_english | kabel | 1m-micro-usb-cable-metall |
| 1m-usb-c-for-usb-c-flatad-laddkabel | 1m USB-C / Type-C to Type-C - 1m USB-C till USB-C Flätad Laddkabel | mixed_swedish_english | kabel | — |
| 1m-usb-c-kabel | Pålitlig 1m USB-C Kabel för Dina Enheter | mixed_swedish_english | kabel | 1m-usb-c-cable |
| 1m-usb-c-type-c-hane-vinklad-kabel | 1m USB-C / Type-C Male Elbow - Vinklad 1m USB-C till USB 3.0 Datakabel | mixed_swedish_english | kabel | 1m-usb-c-type-c-hane-vinklad-cable |
| 1m-usb-for-usb-c-kabel-nylonflatad | 1m USB till USB-C kabel - Nylonflätad 1m USB till USB-C Laddkabel | mixed_swedish_english | kabel | 1m-usb-for-usb-c-cable-nylonflatad |
| 2-5cm-kulledsklamma-actionkamera | 2.5cm Ball Head Clip - 2.5cm Kulledsklämma för Actionkamera | swedish_ascii | actionkamera, actionkamer | 2-5cm-kulledsklamma-action-camera |
| 2-i-1-skruvmejsel-nyckelring | Praktisk 2-i-1 Skruvmejsel Nyckelring för Vardagsbruk | swedish_ascii | skruvmejsel | 2-i-1-screwdrivers-nyckelring |
| 20-pack-micro-usb-kabel-1m | 20-pack Micro USB Kabel 1m för Laddning och Data | mixed_swedish_english | kabel | 20-pack-micro-usb-cable-1m |
| 20cm-usb-2-0-hogervinklad-kabel | 20cm USB 2.0 Right Turn Elbow - 20cm USB 2.0 Högervinklad | mixed_swedish_english | kabel | 20cm-usb-2-0-hogervinklad-cable |
| 20cm-usb-2-0-male-angle-left-kabel | 20cm USB 2.0 Male Angle Left - Vänstervinklad Micro USB-kabel 20cm | mixed_swedish_english | kabel | 20cm-usb-2-0-male-angle-left-cable |
| 20cm-usb-2-0-vanstervinklad-kabel | 20cm USB 2.0 Left Turn Elbow - 20cm USB 2.0 Vänstervinklad Datakabel | mixed_swedish_english | kabel | 20cm-usb-2-0-vanstervinklad-cable |
| 20cm-usb-c-kabel-vinklad | 20cm USB-C Kabel Vinklad för Optimal Användning | mixed_swedish_english | kabel | 20cm-usb-c-cable-vinklad |
| 20w-usb-c-reseladdare | Effektiv 20W USB-C Reseladdare med PD och QC 3.0 | mixed_swedish_english | laddare | — |
| 21mm-kulledsfaste-bil | 21mm kulledsfäste bil - 21mm Kulledsfäste för Bil och Actionkamera | swedish_ascii | faste | — |
| 22cm-usb-c-for-usb-3-0-adapterkabel | 22cm USB-C / Type-C 3.1 Male - 22cm USB-C till USB 3.0 Adapterkabel | mixed_swedish_english | kabel | — |
| 240w-usb-c-laddkabel-1m-usb4 | Kraftfull 240W USB-C Laddkabel 1m med USB4.0 | mixed_swedish_english | kabel | — |
| 240w-usb-c-thunderbolt-5-kabel | 240W USB-C Thunderbolt 5 Höghastighetskabel | mixed_swedish_english | kabel | 240w-usb-c-thunderbolt-5-cable |
| 24cm-micro-usb-usb-c-laddkabel | 24cm 2A Micro USB + USB-C - Flexibel 24cm Micro USB + USB-C Laddkabel | mixed_swedish_english | kabel | — |
| 25cm-micro-usb-kabel-natstil-metallhuvud | 25cm Net Style Metal Head - 25cm Micro USB Kabel med Metallhuvud | mixed_swedish_english | kabel | 25cm-micro-usb-cable-natstil-metallhuvud |
| 25cm-micro-usb-kabel-smartphones | Kompakt 25cm Micro USB-kabel för Smartphones | mixed_swedish_english | kabel | 25cm-micro-usb-cable-smartphones |
| 25mm-kulfaste-bil-framsate | 25mm Ballhead Car Front Seat - 25mm Kulfäste för Bilens Framsäte | swedish_ascii | faste | — |
| 2m-2a-usb-c-for-usb-c-kabel | 2m 2a usb-c / type-c 3.1 - 2m USB-C till USB-C Ladd- och Datakabel | mixed_swedish_english | kabel | 2m-2a-usb-c-for-usb-c-cable |
| 2m-micro-usb-data-sync-spiralkabel | 2m micro usb data sync - 2m Micro USB Datakabel med Spiraldesign | mixed_swedish_english | kabel | — |
| 2m-micro-usb-datakabel-flatad | 2m micro USB datakabel - 2m Flätad Micro USB Datakabel för Laddning | mixed_swedish_english | kabel | — |
| 2m-micro-usb-kabel-universal | 2m Micro USB-kabel för Många Enheter | mixed_swedish_english | kabel | 2m-micro-usb-cable-universal |
| 2m-usb-c-forlangningskabel | 2m USB-C Förlängningskabel för Flexibel Anslutning | mixed_swedish_english | kabel | — |
| 3-i-1-laddkabel-66w-usb-c-lightning-micro-usb | Mångsidig 3-i-1 Laddkabel 66W för Alla Enheter | mixed_swedish_english | kabel | — |
| 3-i-1-magnetisk-kulled-kamerafaste | 3 In 1 Magnetic Ball Head - 3-i-1 Magnetisk Kulled med Dubbla | swedish_ascii | faste | — |
| 3-i-1-monopod-magic-mount-actionkamera | 3-Way Monopod + Magic Mount - 3-i-1 Monopod med Magic Mount | mixed_swedish_english | actionkamera, actionkamer | 3-i-1-monopod-magic-mount-action-camera |
| 3-i-1-usb-for-double-type-c-laddkabel | 3 in 1 USB till Dual Type-C - 3-i-1 USB Laddkabel för Dubbel Type-C | mixed_swedish_english | kabel | — |
| 360-camera-linsskydd-hartat-glas | Panoramic Camera Tempered Glass Cover Protective Lens Guard, For DJI Osmo 360 | mixed_swedish_english | skydd | — |
| 360-graders-dji-skydd | Original 360 Degree Propeller Skydd till DJI | mixed_swedish_english | skydd | 360-graders-dji-protection |
| 360-roterande-actionkamerafaste-aluminium | 360° actionkamerafäste - 360° Roterande Actionkamerafäste i Aluminium | mixed_swedish_english | actionkamera, actionkamer, faste | — |
| 360-vridbart-magiskt-armfaste | 360 Pivot Magic Arm Mount - Mångsidigt 360 Vridbart Magiskt Armfäste | mixed_swedish_english | faste | — |
| 37cm-sugkoppsfaste-friktionsarm | 37cm Single Suction Cup - 37cm Enkel Sugkoppsfäste med Friktionsarm | swedish_ascii | faste | — |
| 3m-micro-usb-kabel | 3m Micro USB kabel för Smidig Användning | mixed_swedish_english | kabel | 3m-micro-usb-cable |
| 4k-actionkamera-wifi | 4K actionkamera WiFi - 4K Actionkamera med WiFi för Äventyr | mixed_swedish_english | actionkamera, actionkamer | 4k-action-camera-wifi |
| 5-8g-tradlos-in-ear-monitor-system | 5.8G Trådlös In-ear Monitor | swedish_ascii | tradlos | 5-8g-wireless-in-ear-monitor-system |
| 5-nodig-hopfallbar-vandringsstav-aluminiumlegering | 5 Node Portable Foldable - 5-Nodig Hopfällbar Vandringsstav | swedish_ascii | vandring, vandrings | — |
| 5k-actionkamera-anti-shake | 5K Actionkamera Anti-Shake - 5K Actionkamera Anti-Shake för Äventyr | swedish_ascii | actionkamera, actionkamer | 5k-action-camera-anti-shake |
| 5k-actionkamera-mikrofon | 5K actionkamera mikrofon - Avancerad 5K Actionkamera med Mikrofon | swedish_ascii | actionkamera, actionkamer | 5k-action-camera-microphone |
| 5w-monokristallin-solpanel-utomhuskamera-usb-c | 5w monocrystalline - 5W Monokristallin Solpanel för Utomhuskameror | mixed_swedish_english | utomhus | — |
| 67mm-240w-8k-80gbps-type-c-datakabel | Högpresterande 67mm 240W 8K Datakabel | swedish_ascii | kabel | — |
| 6a-usb-c-laddkabel-2m | 6A USB-C Laddkabel 2m för Snabbladdning | mixed_swedish_english | kabel | — |
| 6cm-kopplingsstang-fast-motorcykel-faste | 6cm Connecting Rod Fixed - Motorcykelfäste med 6cm Kopplingsstång | swedish_ascii | faste | 6cm-kopplingsstang-fast-motorcykel-mount |
| 8-pin-myggmikrofon-tradlos-livesandning | 8-pin Myggmikrofon för Professionell Ljudinspelning | swedish_ascii | tradlos | 8-pin-myggmikrofon-wireless-livesandning |
| 85mm-aluminiumforlangare-actionkamera | 85mm Aluminum Alloy Action - 85mm Aluminiumförlängare för Actionkamera | swedish_ascii | actionkamera, actionkamer | 85mm-aluminiumforlangare-action-camera |
| 9cm-kulledsfaste-20mm-actionkamera | 9cm Connecting Rod 20mm Ball - 9cm Kulledsfäste med 20mm Kula | swedish_ascii | actionkamera, actionkamer, faste | 9cm-kulledsfaste-20mm-action-camera |
| a9-100w-usb-c-datakabel-double-vinkel | A9 100W USB-C/Type-C - A9 100W USB-C Laddkabel med Dubbla Vinklar | mixed_swedish_english | kabel | — |
| actionkamera-16-5cm-forlangningsarm-aluminium | Förlängningsarm i Aluminium för Actionkamera Red | swedish_ascii | actionkamera, actionkamer | action-camera-16-5cm-forlangningsarm-aluminium |
| actionkamera-3-i-1-stativ | Actionkamera 3-i-1 Stativ för GoPro och DJI | swedish_ascii | actionkamera, actionkamer | action-camera-3-i-1-tripods |
| actionkamera-bag-22cm-stottalig-waterproof | Actionkamera Väska 22cm för Säker Förvaring | mixed_swedish_english | actionkamera, actionkamer | action-camera-bag-22cm-stottalig-waterproof |
| actionkamera-bag-gopro-bw-outdoor-case | Robust Actionkamera Väska GoPro för Alla Äventyr | mixed_swedish_english | actionkamera, actionkamer | action-camera-bag-gopro-bw-outdoor-case |
| actionkamera-bag-strap | Väska actionkamera fodral med justerbar axelrem | mixed_swedish_english | actionkamera, actionkamer | action-camera-bag-strap |
| actionkamera-bilfaste-aluminium-sugkopp | Pålitligt Actionkamera Bilfäste för Fordon | swedish_ascii | actionkamera, actionkamer, faste | action-camera-bilfaste-aluminium-sugkopp |
| actionkamera-brostsele | Actionkamera Bröstsele för Handsfree Filmning | swedish_ascii | actionkamera, actionkamer | action-camera-brostsele |
| actionkamera-brostsele-360-rotation-sport | 360 Degree Rotary Special - Bröstsele med 360 Graders Rotation | mixed_swedish_english | actionkamera, actionkamer | action-camera-brostsele-360-rotation-sport |
| actionkamera-cykelfaste | Säkra ditt äventyr med ett Actionkamera Cykelfäste | swedish_ascii | actionkamera, actionkamer, faste | action-camera-cykelfaste |
| actionkamera-cykelfaste-universellt-styresfaste | Universal Action Camera Bicycle Handlebar Clamp, S 15.5cm, M 20cm, L 24cm | swedish_ascii | actionkamera, actionkamer, faste | action-camera-cykelfaste-universellt-styresfaste |
| actionkamera-faste-360-flexibelt | Flexibelt Actionkamera Fäste 360 för Äventyr | mixed_swedish_english | actionkamera, actionkamer, faste | action-camera-mount-360-flexibelt |
| actionkamera-faste-skena | FEICHAO Actionkamera Fäste för Skenmontering | swedish_ascii | actionkamera, actionkamer, faste | action-camera-mount-skena |
| actionkamera-faste-st-06 | Actionkamera fäste ST-06 för Stabil Ytmontering | swedish_ascii | actionkamera, actionkamer, faste | action-camera-mount-st-06 |
| actionkamera-fill-light-40m-waterproof | 40 LEDs Fill Light 40m Waterproof Depth for Sports Cameras, SL-105RGB | swedish_ascii | actionkamera, actionkamer | action-camera-fill-light-40m-waterproof |
| actionkamera-fill-light-40m-waterproof-1 | 40 LEDs Fill Light 40m Waterproof Depth for Sports Cameras, SL-105RGB | swedish_ascii | actionkamera, actionkamer | action-camera-fill-light-40m-waterproof-1 |
| actionkamera-filterkit-52mm-11-i-1 | Komplett Actionkamera Filterkit 52mm för Optimal Bildkvalitet | swedish_ascii | actionkamera, actionkamer | action-camera-filterkit-52mm-11-i-1 |
| actionkamera-forlangd-skyddsram | osmo kamera - Förlängd Skyddsram för Actionkamera | swedish_ascii | actionkamera, actionkamer, skydd | action-camera-forlangd-skyddsram |
| actionkamera-forlangningsarm | Actionkamera forlan - Aluminium Förlängningsarm för Actionkamera | swedish_ascii | actionkamera, actionkamer | action-camera-forlangningsarm |
| actionkamera-grepp-aluminium-forlangningsarm | Mångsidigt 3-i-1 Actionkamera Grepp i Aluminium | swedish_ascii | actionkamera, actionkamer | action-camera-grepp-aluminium-forlangningsarm |
| actionkamera-hakfaste-hjalm-telesin-gopro-insta360 | TELESIN Sports Kamera Hakfäste för Motorcykelhjälm | mixed_swedish_english | actionkamera, actionkamer, faste | action-camera-hakfaste-hjalm-telesin-gopro-insta360 |
| actionkamera-hallare-dji-forlangningsram | Actionkamera hållare DJI - Handhållen Actionkamera Hållare för DJI | mixed_swedish_english | actionkamera, actionkamer | action-camera-hallare-dji-forlangningsram |
| actionkamera-handledsrem-360-rotation | Actionkamera Handledsrem med 360 Graders Rotation | mixed_swedish_english | actionkamera, actionkamer | action-camera-handledsrem-360-rotation |
| actionkamera-hattfaste-dji | Action Camera Hat Brim - Hattfäste för Actionkamera med Kepsmontering | mixed_swedish_english | actionkamera, actionkamer, faste | action-camera-hattfaste-dji |
| actionkamera-kepsfaste-j-krok-puluz | Actionkamera Kepsfäste för Handsfree Filmning | mixed_swedish_english | actionkamera, actionkamer, faste | action-camera-kepsfaste-j-krok-puluz |
| actionkamera-klamma-3-klo-sjalvhaftande-faste | Actionkamera klämma 3-klo - Flexibel Actionkamera Klämma | swedish_ascii | actionkamera, actionkamer, faste | action-camera-klamma-3-klo-sjalvhaftande-mount |
| actionkamera-klamma-faste-360-justerbart | Justerbart Actionkamera Klämma Fäste med 360° Rotation | mixed_swedish_english | actionkamera, actionkamer, faste | action-camera-klamma-mount-360-justerbart |
| actionkamera-klamma-forlangd-version-360-rotation | Förlängd Version 360 Rotation - Actionkamera Klämma med 360 Graders | mixed_swedish_english | actionkamera, actionkamer | action-camera-klamma-forlangd-version-360-rotation |
| actionkamera-klamma-mobil | Actionkamera Klämma Mobil med 360° Rotation | swedish_ascii | actionkamera, actionkamer | action-camera-klamma-mobil |
| actionkamera-kulledsfaste-metall-snabbfaste | Actionkamera Kulledsfäste i Metall med Snabbfäste | swedish_ascii | actionkamera, actionkamer, faste | action-camera-kulledsfaste-metall-snabbfaste |
| actionkamera-linsfilter-uv-filter-86mm | uv filter 86mm - Linsfilter för Actionkamera – Optimerad Filmning | mixed_swedish_english | actionkamera, actionkamer | action-camera-linsfilter-uv-filters-86mm |
| actionkamera-mc-faste-360-rotation-justerbart | Actionkamera MC-fäste med Telefonklämma | mixed_swedish_english | actionkamera, actionkamer, faste | action-camera-mc-mount-360-rotation-justerbart |
| actionkamera-mc-faste-9cm-kulled-20mm | Hållbart Actionkamera MC-fäste för Optimal Filmning | swedish_ascii | actionkamera, actionkamer, faste | action-camera-mc-mount-9cm-kulled-20mm |
| actionkamera-nackfaste | Action Camera Neck-hanging - Actionkamera Nackfäste för Handsfree | swedish_ascii | actionkamera, actionkamer, faste | action-camera-nackfaste |
| actionkamera-natfaste-gopro-dji-telesin-te-fm-001 | TELESIN Nätfäste för Gopro11 / 10 / 9 / Action 3 | mixed_swedish_english | actionkamera, actionkamer, faste | action-camera-natfaste-gopro-dji-telesin-te-fm-001 |
| actionkamera-portabel-forvaring | Actionkamera Bärbar Storage - Bärbar Förvaringsväska | swedish_ascii | actionkamera, actionkamer | action-camera-portabel-forvaring |
| actionkamera-skruv-aluminium | Actionkamera Skruv i Aluminiumlegering M5x20mm | swedish_ascii | actionkamera, actionkamer | action-camera-skruv-aluminium |
| actionkamera-skruvnyckel | Actionkamera Skruvnyckel 5-pack för Enkel Montering | swedish_ascii | actionkamera, actionkamer | action-camera-skruvnyckel |
| actionkamera-skyddsfodral-kamouflage-monster | Actionkamera Skyddsfodral med Kamouflage Mönster | swedish_ascii | actionkamera, actionkamer, skydd | action-camera-skyddsfodral-kamouflage-monster |
| actionkamera-st-06-basic-strap-mount-2-pack | 2 PCS ST-06 Basic Strap Mount - 2-pack | mixed_swedish_english | actionkamera, actionkamer | action-camera-st-06-basic-strap-mount-2-pack |
| actionkamera-storag-dji-osmo-nano | Actionkamera Storag för DJI Osmo Nano Flymile Cage Edition | mixed_swedish_english | actionkamera, actionkamer | action-camera-storag-dji-osmo-nano |
| actionkamera-styre-faste-forlangd-version | Justerbart Actionkamera Styre Fäste med 360° Rotation | swedish_ascii | actionkamera, actionkamer, faste | action-camera-styre-mount-forlangd-version |
| actionkamera-styrfaste-360-rotation-cykel-mc | Justerbart Actionkamera Styrfäste med 360° Rotation | mixed_swedish_english | actionkamera, actionkamer, faste | action-camera-styrfaste-360-rotation-cykel-mc |

_Showing first 100 Swedish handles if any; sample size 9389._


### Product handle language split (fetched sample)

| Category | Count |
|---|---:|
| English/neutral | 5922 |
| Swedish ASCII | 656 |
| Mixed Swedish/English | 2811 |
| Swedish chars | 0 |

---

## SECTION 4 — Recommended English replacements

Transliteration map applied to common Swedish ecommerce tokens. Brand names (DJI, GoPro, etc.) preserved.

| Current | Suggested | Type | CurrentURL | SuggestedURL |
| --- | --- | --- | --- | --- |
| 1-4-stativadapter-actionkamera | 1-4-stativadapter-action-camera | new | /collections/1-4-stativadapter-actionkamera | /collections/1-4-stativadapter-action-camera |
| 100w-gan-laddare-usb-c | 100w-gan-chargers-usb-c | new | /collections/100w-gan-laddare-usb-c | /collections/100w-gan-chargers-usb-c |
| 100w-usb-c-flatad-kabel | 100w-usb-c-flatad-cable | new | /collections/100w-usb-c-flatad-kabel | /collections/100w-usb-c-flatad-cable |
| 1m-3a-flatad-metall-micro-usb-kabel | 1m-3a-flatad-metall-micro-usb-cable | new | /collections/1m-3a-flatad-metall-micro-usb-kabel | /collections/1m-3a-flatad-metall-micro-usb-cable |
| 1m-flatad-metallhuvud-usb-c-kabel | 1m-flatad-metallhuvud-usb-c-cable | new | /collections/1m-flatad-metallhuvud-usb-c-kabel | /collections/1m-flatad-metallhuvud-usb-c-cable |
| 1m-flatad-micro-usb-kabel-led | 1m-flatad-micro-usb-cable-led | new | /collections/1m-flatad-micro-usb-kabel-led | /collections/1m-flatad-micro-usb-cable-led |
| 1m-micro-usb-kabel-metall | 1m-micro-usb-cable-metall | new | /collections/1m-micro-usb-kabel-metall | /collections/1m-micro-usb-cable-metall |
| 1m-usb-c-kabel | 1m-usb-c-cable | new | /collections/1m-usb-c-kabel | /collections/1m-usb-c-cable |
| 1m-usb-c-type-c-hane-vinklad-kabel | 1m-usb-c-type-c-hane-vinklad-cable | new | /collections/1m-usb-c-type-c-hane-vinklad-kabel | /collections/1m-usb-c-type-c-hane-vinklad-cable |
| 1m-usb-for-usb-c-kabel-nylonflatad | 1m-usb-for-usb-c-cable-nylonflatad | new | /collections/1m-usb-for-usb-c-kabel-nylonflatad | /collections/1m-usb-for-usb-c-cable-nylonflatad |
| 2-5cm-kulledsklamma-actionkamera | 2-5cm-kulledsklamma-action-camera | new | /collections/2-5cm-kulledsklamma-actionkamera | /collections/2-5cm-kulledsklamma-action-camera |
| 2-i-1-skruvmejsel-nyckelring | 2-i-1-screwdrivers-nyckelring | new | /collections/2-i-1-skruvmejsel-nyckelring | /collections/2-i-1-screwdrivers-nyckelring |
| 20-pack-micro-usb-kabel-1m | 20-pack-micro-usb-cable-1m | new | /collections/20-pack-micro-usb-kabel-1m | /collections/20-pack-micro-usb-cable-1m |
| 20cm-usb-2-0-hogervinklad-kabel | 20cm-usb-2-0-hogervinklad-cable | new | /collections/20cm-usb-2-0-hogervinklad-kabel | /collections/20cm-usb-2-0-hogervinklad-cable |
| 20cm-usb-2-0-male-angle-left-kabel | 20cm-usb-2-0-male-angle-left-cable | new | /collections/20cm-usb-2-0-male-angle-left-kabel | /collections/20cm-usb-2-0-male-angle-left-cable |
| 20cm-usb-2-0-vanstervinklad-kabel | 20cm-usb-2-0-vanstervinklad-cable | new | /collections/20cm-usb-2-0-vanstervinklad-kabel | /collections/20cm-usb-2-0-vanstervinklad-cable |
| 20cm-usb-c-kabel-vinklad | 20cm-usb-c-cable-vinklad | new | /collections/20cm-usb-c-kabel-vinklad | /collections/20cm-usb-c-cable-vinklad |
| 240w-usb-c-thunderbolt-5-kabel | 240w-usb-c-thunderbolt-5-cable | new | /collections/240w-usb-c-thunderbolt-5-kabel | /collections/240w-usb-c-thunderbolt-5-cable |
| 25cm-micro-usb-kabel-natstil-metallhuvud | 25cm-micro-usb-cable-natstil-metallhuvud | new | /collections/25cm-micro-usb-kabel-natstil-metallhuvud | /collections/25cm-micro-usb-cable-natstil-metallhuvud |
| 25cm-micro-usb-kabel-smartphones | 25cm-micro-usb-cable-smartphones | new | /collections/25cm-micro-usb-kabel-smartphones | /collections/25cm-micro-usb-cable-smartphones |
| 2m-2a-usb-c-for-usb-c-kabel | 2m-2a-usb-c-for-usb-c-cable | new | /collections/2m-2a-usb-c-for-usb-c-kabel | /collections/2m-2a-usb-c-for-usb-c-cable |
| 2m-micro-usb-kabel-universal | 2m-micro-usb-cable-universal | new | /collections/2m-micro-usb-kabel-universal | /collections/2m-micro-usb-cable-universal |
| 3-i-1-monopod-magic-mount-actionkamera | 3-i-1-monopod-magic-mount-action-camera | new | /collections/3-i-1-monopod-magic-mount-actionkamera | /collections/3-i-1-monopod-magic-mount-action-camera |
| 360-graders-dji-skydd | 360-graders-dji-protection | new | /collections/360-graders-dji-skydd | /collections/360-graders-dji-protection |
| 3m-micro-usb-kabel | 3m-micro-usb-cable | new | /collections/3m-micro-usb-kabel | /collections/3m-micro-usb-cable |
| 4k-actionkamera-wifi | 4k-action-camera-wifi | new | /collections/4k-actionkamera-wifi | /collections/4k-action-camera-wifi |
| 5-8g-tradlos-in-ear-monitor-system | 5-8g-wireless-in-ear-monitor-system | new | /collections/5-8g-tradlos-in-ear-monitor-system | /collections/5-8g-wireless-in-ear-monitor-system |
| 5k-actionkamera-anti-shake | 5k-action-camera-anti-shake | new | /collections/5k-actionkamera-anti-shake | /collections/5k-action-camera-anti-shake |
| 5k-actionkamera-mikrofon | 5k-action-camera-microphone | new | /collections/5k-actionkamera-mikrofon | /collections/5k-action-camera-microphone |
| 6cm-kopplingsstang-fast-motorcykel-faste | 6cm-kopplingsstang-fast-motorcykel-mount | new | /collections/6cm-kopplingsstang-fast-motorcykel-faste | /collections/6cm-kopplingsstang-fast-motorcykel-mount |
| 8-pin-myggmikrofon-tradlos-livesandning | 8-pin-myggmikrofon-wireless-livesandning | new | /collections/8-pin-myggmikrofon-tradlos-livesandning | /collections/8-pin-myggmikrofon-wireless-livesandning |
| 85mm-aluminiumforlangare-actionkamera | 85mm-aluminiumforlangare-action-camera | new | /collections/85mm-aluminiumforlangare-actionkamera | /collections/85mm-aluminiumforlangare-action-camera |
| 9cm-kulledsfaste-20mm-actionkamera | 9cm-kulledsfaste-20mm-action-camera | new | /collections/9cm-kulledsfaste-20mm-actionkamera | /collections/9cm-kulledsfaste-20mm-action-camera |
| actionkamera-16-5cm-forlangningsarm-aluminium | action-camera-16-5cm-forlangningsarm-aluminium | new | /collections/actionkamera-16-5cm-forlangningsarm-aluminium | /collections/action-camera-16-5cm-forlangningsarm-aluminium |
| actionkamera-3-i-1-stativ | action-camera-3-i-1-tripods | new | /collections/actionkamera-3-i-1-stativ | /collections/action-camera-3-i-1-tripods |
| actionkamera-bag-22cm-stottalig-waterproof | action-camera-bag-22cm-stottalig-waterproof | new | /collections/actionkamera-bag-22cm-stottalig-waterproof | /collections/action-camera-bag-22cm-stottalig-waterproof |
| actionkamera-bag-gopro-bw-outdoor-case | action-camera-bag-gopro-bw-outdoor-case | new | /collections/actionkamera-bag-gopro-bw-outdoor-case | /collections/action-camera-bag-gopro-bw-outdoor-case |
| actionkamera-bag-strap | action-camera-bag-strap | new | /collections/actionkamera-bag-strap | /collections/action-camera-bag-strap |
| actionkamera-bilfaste-aluminium-sugkopp | action-camera-bilfaste-aluminium-sugkopp | new | /collections/actionkamera-bilfaste-aluminium-sugkopp | /collections/action-camera-bilfaste-aluminium-sugkopp |
| actionkamera-brostsele | action-camera-brostsele | new | /collections/actionkamera-brostsele | /collections/action-camera-brostsele |
| actionkamera-brostsele-360-rotation-sport | action-camera-brostsele-360-rotation-sport | new | /collections/actionkamera-brostsele-360-rotation-sport | /collections/action-camera-brostsele-360-rotation-sport |
| actionkamera-cykelfaste | action-camera-cykelfaste | new | /collections/actionkamera-cykelfaste | /collections/action-camera-cykelfaste |
| actionkamera-cykelfaste-universellt-styresfaste | action-camera-cykelfaste-universellt-styresfaste | new | /collections/actionkamera-cykelfaste-universellt-styresfaste | /collections/action-camera-cykelfaste-universellt-styresfaste |
| actionkamera-faste-360-flexibelt | action-camera-mount-360-flexibelt | new | /collections/actionkamera-faste-360-flexibelt | /collections/action-camera-mount-360-flexibelt |
| actionkamera-faste-skena | action-camera-mount-skena | new | /collections/actionkamera-faste-skena | /collections/action-camera-mount-skena |
| actionkamera-faste-st-06 | action-camera-mount-st-06 | new | /collections/actionkamera-faste-st-06 | /collections/action-camera-mount-st-06 |
| actionkamera-fill-light-40m-waterproof | action-camera-fill-light-40m-waterproof | new | /collections/actionkamera-fill-light-40m-waterproof | /collections/action-camera-fill-light-40m-waterproof |
| actionkamera-fill-light-40m-waterproof-1 | action-camera-fill-light-40m-waterproof-1 | new | /collections/actionkamera-fill-light-40m-waterproof-1 | /collections/action-camera-fill-light-40m-waterproof-1 |
| actionkamera-filterkit-52mm-11-i-1 | action-camera-filterkit-52mm-11-i-1 | new | /collections/actionkamera-filterkit-52mm-11-i-1 | /collections/action-camera-filterkit-52mm-11-i-1 |
| actionkamera-forlangd-skyddsram | action-camera-forlangd-skyddsram | new | /collections/actionkamera-forlangd-skyddsram | /collections/action-camera-forlangd-skyddsram |
| actionkamera-forlangningsarm | action-camera-forlangningsarm | new | /collections/actionkamera-forlangningsarm | /collections/action-camera-forlangningsarm |
| actionkamera-grepp-aluminium-forlangningsarm | action-camera-grepp-aluminium-forlangningsarm | new | /collections/actionkamera-grepp-aluminium-forlangningsarm | /collections/action-camera-grepp-aluminium-forlangningsarm |
| actionkamera-hakfaste-hjalm-telesin-gopro-insta360 | action-camera-hakfaste-hjalm-telesin-gopro-insta360 | new | /collections/actionkamera-hakfaste-hjalm-telesin-gopro-insta360 | /collections/action-camera-hakfaste-hjalm-telesin-gopro-insta360 |
| actionkamera-hallare-dji-forlangningsram | action-camera-hallare-dji-forlangningsram | new | /collections/actionkamera-hallare-dji-forlangningsram | /collections/action-camera-hallare-dji-forlangningsram |
| actionkamera-handledsrem-360-rotation | action-camera-handledsrem-360-rotation | new | /collections/actionkamera-handledsrem-360-rotation | /collections/action-camera-handledsrem-360-rotation |
| actionkamera-hattfaste-dji | action-camera-hattfaste-dji | new | /collections/actionkamera-hattfaste-dji | /collections/action-camera-hattfaste-dji |
| actionkamera-kepsfaste-j-krok-puluz | action-camera-kepsfaste-j-krok-puluz | new | /collections/actionkamera-kepsfaste-j-krok-puluz | /collections/action-camera-kepsfaste-j-krok-puluz |
| actionkamera-klamma-3-klo-sjalvhaftande-faste | action-camera-klamma-3-klo-sjalvhaftande-mount | new | /collections/actionkamera-klamma-3-klo-sjalvhaftande-faste | /collections/action-camera-klamma-3-klo-sjalvhaftande-mount |
| actionkamera-klamma-faste-360-justerbart | action-camera-klamma-mount-360-justerbart | new | /collections/actionkamera-klamma-faste-360-justerbart | /collections/action-camera-klamma-mount-360-justerbart |
| actionkamera-klamma-forlangd-version-360-rotation | action-camera-klamma-forlangd-version-360-rotation | new | /collections/actionkamera-klamma-forlangd-version-360-rotation | /collections/action-camera-klamma-forlangd-version-360-rotation |
| actionkamera-klamma-mobil | action-camera-klamma-mobil | new | /collections/actionkamera-klamma-mobil | /collections/action-camera-klamma-mobil |
| actionkamera-kulledsfaste-metall-snabbfaste | action-camera-kulledsfaste-metall-snabbfaste | new | /collections/actionkamera-kulledsfaste-metall-snabbfaste | /collections/action-camera-kulledsfaste-metall-snabbfaste |
| actionkamera-linsfilter-uv-filter-86mm | action-camera-linsfilter-uv-filters-86mm | new | /collections/actionkamera-linsfilter-uv-filter-86mm | /collections/action-camera-linsfilter-uv-filters-86mm |
| actionkamera-mc-faste-360-rotation-justerbart | action-camera-mc-mount-360-rotation-justerbart | new | /collections/actionkamera-mc-faste-360-rotation-justerbart | /collections/action-camera-mc-mount-360-rotation-justerbart |
| actionkamera-mc-faste-9cm-kulled-20mm | action-camera-mc-mount-9cm-kulled-20mm | new | /collections/actionkamera-mc-faste-9cm-kulled-20mm | /collections/action-camera-mc-mount-9cm-kulled-20mm |
| actionkamera-nackfaste | action-camera-nackfaste | new | /collections/actionkamera-nackfaste | /collections/action-camera-nackfaste |
| actionkamera-natfaste-gopro-dji-telesin-te-fm-001 | action-camera-natfaste-gopro-dji-telesin-te-fm-001 | new | /collections/actionkamera-natfaste-gopro-dji-telesin-te-fm-001 | /collections/action-camera-natfaste-gopro-dji-telesin-te-fm-001 |
| actionkamera-portabel-forvaring | action-camera-portabel-forvaring | new | /collections/actionkamera-portabel-forvaring | /collections/action-camera-portabel-forvaring |
| actionkamera-skruv-aluminium | action-camera-skruv-aluminium | new | /collections/actionkamera-skruv-aluminium | /collections/action-camera-skruv-aluminium |
| actionkamera-skruvnyckel | action-camera-skruvnyckel | new | /collections/actionkamera-skruvnyckel | /collections/action-camera-skruvnyckel |
| actionkamera-skyddsfodral-kamouflage-monster | action-camera-skyddsfodral-kamouflage-monster | new | /collections/actionkamera-skyddsfodral-kamouflage-monster | /collections/action-camera-skyddsfodral-kamouflage-monster |
| actionkamera-st-06-basic-strap-mount-2-pack | action-camera-st-06-basic-strap-mount-2-pack | new | /collections/actionkamera-st-06-basic-strap-mount-2-pack | /collections/action-camera-st-06-basic-strap-mount-2-pack |
| actionkamera-storag-dji-osmo-nano | action-camera-storag-dji-osmo-nano | new | /collections/actionkamera-storag-dji-osmo-nano | /collections/action-camera-storag-dji-osmo-nano |
| actionkamera-styre-faste-forlangd-version | action-camera-styre-mount-forlangd-version | new | /collections/actionkamera-styre-faste-forlangd-version | /collections/action-camera-styre-mount-forlangd-version |
| actionkamera-styrfaste-360-rotation-cykel-mc | action-camera-styrfaste-360-rotation-cykel-mc | new | /collections/actionkamera-styrfaste-360-rotation-cykel-mc | /collections/action-camera-styrfaste-360-rotation-cykel-mc |

_Showing 75 of 1394 replacement candidates._


### Duplicate English alternatives (collision risk)

_No exact English handle collisions detected among live collections/pages/products._

### Blog handles

| Handle | Title | Category |
| --- | --- | --- |
| nyheter | Nyheter | english |

**Blog articles with Swedish handles:** 28 of 68 articles (`/blogs/nyheter/{handle}`).

| Article handle | Category | Suggested EN |
| --- | --- | --- |
| kop-dronare-med-kamera | swedish_ascii | buy-drone-with-camera |
| dji-flip-lilla-dronaren | swedish_ascii | dji-flip-small-drone |
| dronare-regler | swedish_ascii | drone-regulations |
| mikrofon-mygga-tradlos | swedish_ascii | microphone-lavalier-wireless |
| reservdelar-dronare | swedish_ascii | spare-parts-drones |
| dronare | swedish_ascii | drones |
| dronare-bast-i-test-budget | swedish_ascii | drones-best-in-test-budget |
| dykutrustning | swedish_ascii | diving-equipment |
| actionkamera-bast-i-test | swedish_ascii | action-camera-best-in-test |
| vandringsutrustning | swedish_ascii | hiking-equipment |
| campingutrustning | swedish_ascii | camping-equipment |
| gopro-tillbehor-batterier-filter | mixed_swedish_english | gopro-accessories-batteries-filters |
| tradlos-mikrofon-bluetooth | swedish_ascii | wireless-microphone-bluetooth |

_Showing 13 of 28 Swedish article handles._

### Menu handles (Swedish / mixed)

| Menu handle | Title | Swedish in handle? | Items | Notes |
| --- | --- | --- | ---: | --- |
| `main-menu` | Huvudmeny | Title only | 41 | Theme-linked; 24 Swedish collection links |
| `enterprise-dr-nare` | Enterprise Drönare | `dr-nare` (drönare) | 7 | Canonical enterprise nav |
| `spare-parts-deploy` | Reservdelar | Title only | 47 | English handle; 29 Swedish collection links |
| `service-support-deploy` | Service & Support | — | 14 | English handle |
| `dronare` | Drönare | `dronare` | 0 | Legacy orphan menu |
| `actionkameror` | Actionkameror | `actionkameror` | 0 | Legacy orphan (+ 50+ duplicates) |
| `meny` | Huvudmeny | `meny` | 0 | Duplicate of main-menu |
| `vandring-outdoor` | Vandring & outdoor | `vandring` | 0 | Legacy outdoor menu |

**Note:** 200+ duplicate migration menus (`actionkameror-N`, `partnership-N`) are operational debt, not localization blockers.

---

## SECTION 5 — Migration complexity

### Scope estimates

| Item | Estimate |
|---|---|
| URLs affected (collections + pages + products + blogs + menu links) | **3609** |
| 301 redirects required (entity handle changes only) | **3549** |
| Menus with Swedish internal links | **5** (main-menu, enterprise-dr-nare, spare-parts-deploy, service-support-deploy) |
| Internal menu links with Swedish paths | **60** |
| Source migration collections with Swedish tokens (historical) | **585** of 824 |
| Legacy ActionKing-only collections not on target | **787** |

### Menus affected

| MenuHandle | MenuTitle | SwedishLinks | Canonical |
| --- | --- | --- | --- |
| main-menu | Huvudmeny | 24 | yes |
| enterprise-dr-nare | Enterprise Drönare | 3 | yes |
| spare-parts-deploy | Reservdelar | 29 | yes |
| service-support-deploy | Service & Support | 3 | yes |
| b2b-enterprise-deploy | Enterprise & B2B | 1 | no |

### Sample Swedish menu links

| Menu | Label | URL | PathHandle |
| --- | --- | --- | --- |
| main-menu | Drönare | /collections/dji-dronare | dji-dronare |
| main-menu | DJI Flip | /collections/dji-flip-dronare | dji-flip-dronare |
| main-menu | Alla konsumentdrönare | /collections/dji-dronare | dji-dronare |
| main-menu | Enterprise Drönare | /collections/enterprise-dronare | enterprise-dronare |
| main-menu | Enterprise översikt | /collections/enterprise-dronare | enterprise-dronare |
| main-menu | DJI Agras | /collections/dji-agras-dronare | dji-agras-dronare |
| main-menu | Enterprise tillbehör | /collections/enterprise-tillbehor | enterprise-tillbehor |
| main-menu | FlyCart 100 | /collections/dji-flycart-100-lastdronare | dji-flycart-100-lastdronare |
| main-menu | Branschlösningar | /collections/inspektionsdronare | inspektionsdronare |
| main-menu | Inspektion | /collections/inspektionsdronare | inspektionsdronare |
| main-menu | Jordbruk | /collections/jordbruksdronare | jordbruksdronare |
| main-menu | Skogsbruk | /collections/skogsbruksdronare | skogsbruksdronare |
| main-menu | Kartläggning | /collections/kartlaggnings-och-matdronare | kartlaggnings-och-matdronare |
| main-menu | Reservdelar | /collections/dji-dronar-reservdelar | dji-dronar-reservdelar |
| main-menu | Gimbal & motorer | /collections/reservdelar-gimbal-dronare-motorer | reservdelar-gimbal-dronare-motorer |
| main-menu | Elektronik & flight components | /collections/dronarelektronik-flight-components | dronarelektronik-flight-components |
| main-menu | Neo reservdelar | /collections/reparation-dji-neo-reservdelar | reparation-dji-neo-reservdelar |
| main-menu | Tillbehör | /collections/dronartillbehor-kop | dronartillbehor-kop |
| main-menu | Propellrar | /collections/dronare-propeller-tillbehor | dronare-propeller-tillbehor |
| main-menu | Filter | /collections/filter-till-dronare | filter-till-dronare |
| main-menu | Batterier | /collections/batterier | batterier |
| main-menu | Väskor & cases | /collections/dronarryggsack-vaskor | dronarryggsack-vaskor |
| main-menu | Fjärrkontroller | /collections/fjarrkontroll-dronare | fjarrkontroll-dronare |
| main-menu | Mini 2 | /collections/tillbehor-dji-mini-2-2-se | tillbehor-dji-mini-2-2-se |
| enterprise-dr-nare | Enterprise drönare | /collections/enterprise-dronare | enterprise-dronare |
| enterprise-dr-nare | Agras | /collections/dji-agras-dronare | dji-agras-dronare |
| enterprise-dr-nare | Värmekamera | /collections/dronare-med-varmekamera | dronare-med-varmekamera |
| spare-parts-deploy | Mini 4 Pro | /collections/dji-mini-4-pro-reservdelar | dji-mini-4-pro-reservdelar |
| spare-parts-deploy | Propellrar | /collections/dji-mini-4-pro-propellrar | dji-mini-4-pro-propellrar |
| spare-parts-deploy | Batterier | /collections/dji-mini-4-pro-batterier | dji-mini-4-pro-batterier |
| spare-parts-deploy | Kameror | /collections/dji-mini-4-pro-kameror | dji-mini-4-pro-kameror |
| spare-parts-deploy | Landningsställ | /collections/dji-mini-4-pro-landningsstall | dji-mini-4-pro-landningsstall |
| spare-parts-deploy | Kablar | /collections/dji-mini-4-pro-kablar | dji-mini-4-pro-kablar |
| spare-parts-deploy | Tillbehör | /collections/dji-mini-4-pro-tillbehor | dji-mini-4-pro-tillbehor |
| spare-parts-deploy | Air 3 | /collections/dji-air-3-reservdelar | dji-air-3-reservdelar |
| spare-parts-deploy | Propellrar | /collections/dji-air-3-propellrar | dji-air-3-propellrar |
| spare-parts-deploy | Batterier | /collections/dji-air-3-batterier | dji-air-3-batterier |
| spare-parts-deploy | Kameror | /collections/dji-air-3-kameror | dji-air-3-kameror |
| spare-parts-deploy | Landningsställ | /collections/dji-air-3-landningsstall | dji-air-3-landningsstall |
| spare-parts-deploy | Kablar | /collections/dji-air-3-kablar | dji-air-3-kablar |

### Internal links affected

- **Theme navigation:** `main-menu` is theme-referenced (`sections/header-group.json`) with 41 items; many point to Swedish collection paths.
- **Deployment menus:** `spare-parts-deploy` (47 items) and `service-support-deploy` (14 items) are English handles but link heavily to Swedish collection URLs.
- **Legacy migration menus:** 200+ duplicate empty menus (`actionkameror-N`, `partnership-N`, `dronare-N`) from failed migration retries — cleanup separate from localization.
- **Cross-links in collection descriptions/SEO:** not scanned in this pass; expect additional internal links proportional to Swedish collection count.

### Complexity factors

| Factor | Impact |
|---|---|
| Shopify handle immutability | High — requires create-new + redirect, not in-place rename |
| Smart collection rules | Medium — 6 DJI smart collections use Swedish handles with broken rules post-migration |
| Menu rebuild | High — canonical menus embed Swedish `/collections/*` paths |
| Product volume | High — 9,389 products; **3,467 (37%)** have Swedish tokens in URL handles (e.g. `actionkamera-*`, `tradlos-*`, `faste-*`) |
| Hreflang / Markets | Not configured — Swedish URLs on primary domain block clean EN market launch |
| Legacy ActionKing scope | 787 collections missing on target; many Swedish — excluded from live site but remain in migration DB |

### Effort characterization

Large migration: bulk collection handle rewrites, menu URL updates, redirect map (1:1 per changed handle), Search Console resubmission, and staged rollout with backlink monitoring.

---

## Appendix — Methodology

- **Data sources:** `collection_reconciliation_audit` (live + source collections), Shopify Admin GraphQL via `test-integration` (pages, products, blogs, articles, menus).
- **Swedish detection:** Token matching against Swedish ecommerce vocabulary (ASCII transliterations: tillbehor, dronare, reservdelar, vandring, etc.) plus Unicode å/ä/ö detection.
- **Mixed URLs:** Handles containing both Swedish tokens and English brand tokens (e.g. `dji-mini-3-tillbehor`).
- **Limitations:** Product scan limited to GraphQL pagination depth; blog articles fetched via `articles` connection; no theme Liquid/content link crawl; no external backlink analysis.
