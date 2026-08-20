# ENGLISH_URL_MIGRATION_PLAN

**Store:** EuroDroneParts (`ya1xhg-x6.myshopify.com`)
**Status:** PRE-LAUNCH — read-only analysis, **no store modifications**
**Generated:** 2026-06-13T15:48:38.112Z
**Canonical language:** English
**Domains:** eudroneparts.com · eudroneparts.de · eudroneparts.dk · future EU markets

## Executive summary

| Resource | Live count | Handle changes | 301 redirects | Menu/nav refs |
|---|---:|---:|---:|---:|
| Collections | 204 | 58 | 58 | 27 |
| Pages | 94 | 11 | 11 | 0 |
| Blogs / articles | 1 / 68 | 69 | 69 | 0 |
| Products (all draft) | 9389 | 3606 | 3606 | 0 |
| Production menus | 8 | 5 handle renames | N/A | theme + deploy menus |
| **Total redirect rules** | — | — | **7488** | **27** mapped resources with menu refs |

### Artifacts

- `ENGLISH_HANDLE_MAPPING.csv` — full handle mapping with internal reference impact
- `REDIRECT_MAPPING.csv` — complete 301 redirect map (includes `/en/` legacy prefix rules)

### Preservation guarantees (execution phase — not performed here)

| Requirement | Approach |
|---|---|
| Product assignments | Shopify `collectionUpdate` / handle rename retains product memberships via same collection ID |
| Metafields | Handle rename does not delete metafields; keyed by resource GID |
| Translations | Shopify Markets + Translate & Adapt — translate titles/body, **keep English handles** |
| SEO equity | 301 redirects per `REDIRECT_MAPPING.csv`; canonical on `eudroneparts.com` |
| Internal links | Update 8 production menus + theme after handle migration |

---

## SECTION 1 — Collections

58 of 204 live collections require handle changes.

| current_url | new_url | redirect_required | current_handle | proposed_handle | internal_references_impacted |
| --- | --- | --- | --- | --- | --- |
| /collections/amagisn-kameratillbehor-and-dronarutrustning | /collections/amagisn-camera-accessories-and-drone-equipment | YES | amagisn-kameratillbehor-and-dronarutrustning | amagisn-camera-accessories-and-drone-equipment |  |
| /collections/bandverktyg | /collections/pliers | YES | bandverktyg | pliers |  |
| /collections/belysning-for-drones | /collections/lighting-for-drones | YES | belysning-for-drones | lighting-for-drones |  |
| /collections/dji-air-3-antenner | /collections/dji-air-3-antennas | YES | dji-air-3-antenner | dji-air-3-antennas | spare-parts-deploy → :[];Antenner |
| /collections/dji-air-3-armar | /collections/dji-air-3-arms | YES | dji-air-3-armar | dji-air-3-arms | spare-parts-deploy → :[];Armar |
| /collections/dji-air-3-kablar | /collections/dji-air-3-cables | YES | dji-air-3-kablar | dji-air-3-cables | spare-parts-deploy → :[];Kablar |
| /collections/dji-air-3-kameror | /collections/dji-air-3-cameras | YES | dji-air-3-kameror | dji-air-3-cameras | spare-parts-deploy → :[];Kameror |
| /collections/dji-air-3-landningsstall | /collections/dji-air-3-landing-gear | YES | dji-air-3-landningsstall | dji-air-3-landing-gear | spare-parts-deploy → :[];Landningsställ |
| /collections/dji-air-3-motorer | /collections/dji-air-3-motors | YES | dji-air-3-motorer | dji-air-3-motors | spare-parts-deploy → :[];Motorer |
| /collections/dji-air-3-sensorer | /collections/dji-air-3-sensors | YES | dji-air-3-sensorer | dji-air-3-sensors | spare-parts-deploy → :[];Sensorer |
| /collections/dji-air-3-skal | /collections/dji-air-3-shell | YES | dji-air-3-skal | dji-air-3-shell | spare-parts-deploy → :[];Skal |
| /collections/dji-drones-fjarrkontroller | /collections/dji-drones-remote-controls | YES | dji-drones-fjarrkontroller | dji-drones-remote-controls |  |
| /collections/dji-enterprise-fjarrkontroller | /collections/dji-enterprise-remote-controls | YES | dji-enterprise-fjarrkontroller | dji-enterprise-remote-controls |  |
| /collections/dji-flycart-100-lastdronare | /collections/dji-flycart-100-cargo-drones | YES | dji-flycart-100-lastdronare | dji-flycart-100-cargo-drones | main-menu → FlyCart 100; main-menu → :[FlyCart 100 |
| /collections/dji-matrice-30-serie-accessories | /collections/dji-matrice-30-series-accessories | YES | dji-matrice-30-serie-accessories | dji-matrice-30-series-accessories |  |
| /collections/dji-matrice-350-rtk-antenner | /collections/dji-matrice-350-rtk-antennas | YES | dji-matrice-350-rtk-antenner | dji-matrice-350-rtk-antennas | spare-parts-deploy → :[];Antenner |
| /collections/dji-matrice-4-kablar | /collections/dji-matrice-4-cables | YES | dji-matrice-4-kablar | dji-matrice-4-cables | spare-parts-deploy → :[];Kablar |
| /collections/dji-matrice-4-kameror | /collections/dji-matrice-4-cameras | YES | dji-matrice-4-kameror | dji-matrice-4-cameras | spare-parts-deploy → :[];Kameror |
| /collections/dji-matrice-4-serie | /collections/dji-matrice-4-series | YES | dji-matrice-4-serie | dji-matrice-4-series |  |
| /collections/dji-mavic-3-enterprise-kameror | /collections/dji-mavic-3-enterprise-cameras | YES | dji-mavic-3-enterprise-kameror | dji-mavic-3-enterprise-cameras | spare-parts-deploy → :[];Kameror |
| /collections/dji-mavic-3-enterprise-skal | /collections/dji-mavic-3-enterprise-shell | YES | dji-mavic-3-enterprise-skal | dji-mavic-3-enterprise-shell | spare-parts-deploy → :[];Skal |
| /collections/dji-mini-4-pro-antenner | /collections/dji-mini-4-pro-antennas | YES | dji-mini-4-pro-antenner | dji-mini-4-pro-antennas | spare-parts-deploy → :[];Antenner |
| /collections/dji-mini-4-pro-armar | /collections/dji-mini-4-pro-arms | YES | dji-mini-4-pro-armar | dji-mini-4-pro-arms | spare-parts-deploy → :[];Armar |
| /collections/dji-mini-4-pro-kablar | /collections/dji-mini-4-pro-cables | YES | dji-mini-4-pro-kablar | dji-mini-4-pro-cables | spare-parts-deploy → :[];Kablar |
| /collections/dji-mini-4-pro-kameror | /collections/dji-mini-4-pro-cameras | YES | dji-mini-4-pro-kameror | dji-mini-4-pro-cameras | spare-parts-deploy → :[];Kameror |
| /collections/dji-mini-4-pro-landningsstall | /collections/dji-mini-4-pro-landing-gear | YES | dji-mini-4-pro-landningsstall | dji-mini-4-pro-landing-gear | spare-parts-deploy → :[];Landningsställ |
| /collections/dji-mini-4-pro-motorer | /collections/dji-mini-4-pro-motors | YES | dji-mini-4-pro-motorer | dji-mini-4-pro-motors | spare-parts-deploy → :[];Motorer |
| /collections/dji-mini-4-pro-sensorer | /collections/dji-mini-4-pro-sensors | YES | dji-mini-4-pro-sensorer | dji-mini-4-pro-sensors | spare-parts-deploy → :[];Sensorer |
| /collections/dji-mini-4-pro-skal | /collections/dji-mini-4-pro-shell | YES | dji-mini-4-pro-skal | dji-mini-4-pro-shell | spare-parts-deploy → :[];Skal |
| /collections/dji-rc-fjarrkontroller | /collections/dji-rc-remote-controls | YES | dji-rc-fjarrkontroller | dji-rc-remote-controls |  |
| /collections/dronarelektronik-flight-components | /collections/drone-electronics-flight-components | YES | dronarelektronik-flight-components | drone-electronics-flight-components | main-menu → Elektronik & flight components; main-menu → :[];Elektronik & flight components |
| /collections/dronarmatta-landning-protection | /collections/drone-mat-landing-protection | YES | dronarmatta-landning-protection | drone-mat-landing-protection |  |
| /collections/drone-fjarrkontrollstillbehor | /collections/drone-remote-control-accessories | YES | drone-fjarrkontrollstillbehor | drone-remote-control-accessories |  |
| /collections/drone-kameror | /collections/drone-cameras | YES | drone-kameror | drone-cameras |  |
| /collections/drones-with-varmekamera | /collections/drones-with-thermal-camera | YES | drones-with-varmekamera | drones-with-thermal-camera |  |
| /collections/enterprise-belysning | /collections/enterprise-lighting | YES | enterprise-belysning | enterprise-lighting |  |
| /collections/enterprise-hogtalarsystem | /collections/enterprise-speaker-systems | YES | enterprise-hogtalarsystem | enterprise-speaker-systems |  |
| /collections/enterprise-lyftsystem | /collections/enterprise-lifting-systems | YES | enterprise-lyftsystem | enterprise-lifting-systems |  |
| /collections/enterprise-sensorer | /collections/enterprise-sensors | YES | enterprise-sensorer | enterprise-sensors | main-menu → Sensors & Payloads; main-menu → :[];Sensors & Payloads |
| /collections/fjarrkontroll-drones | /collections/remote-control-drones | YES | fjarrkontroll-drones | remote-control-drones |  |
| /collections/inspektionsdronare | /collections/inspection-drones | YES | inspektionsdronare | inspection-drones | main-menu → Branschlösningar; main-menu → Inspektion; main-menu → :[]];Branschlösningar; main-menu → :[Inspektion |
| /collections/jordbruksdronare | /collections/agricultural-drones | YES | jordbruksdronare | agricultural-drones | main-menu → Jordbruk; main-menu → :[];Jordbruk |
| /collections/kamerakablar-actionking | /collections/kameracables-actionking | YES | kamerakablar-actionking | kameracables-actionking |  |
| /collections/kapor-for-drones | /collections/covers-for-drones | YES | kapor-for-drones | covers-for-drones |  |
| /collections/kartlaggnings-and-matdronare | /collections/mappings-and-survey-drones | YES | kartlaggnings-and-matdronare | mappings-and-survey-drones |  |
| /collections/landningsstall-drones | /collections/landing-gear-drones | YES | landningsstall-drones | landing-gear-drones |  |
| /collections/last-and-transportdronare | /collections/last-and-transport-drones | YES | last-and-transportdronare | last-and-transport-drones |  |
| /collections/mounts-adaptrar-action-cameras | /collections/mounts-adapters-action-cameras | YES | mounts-adaptrar-action-cameras | mounts-adapters-action-cameras |  |
| /collections/multiverktyg-friluftsliv | /collections/multi-tools-outdoor | YES | multiverktyg-friluftsliv | multi-tools-outdoor |  |
| /collections/pincetter-actionking | /collections/tweezers-actionking | YES | pincetter-actionking | tweezers-actionking |  |
| /collections/reparera-precisionsverktyg-elektronik | /collections/repair-precision-tools-electronics | YES | reparera-precisionsverktyg-elektronik | repair-precision-tools-electronics |  |
| /collections/skogsbruksdronare | /collections/forestry-drones | YES | skogsbruksdronare | forestry-drones | main-menu → Skogsbruk; main-menu → :[];Skogsbruk |
| /collections/skruvmejsel-set | /collections/screwdriver-set | YES | skruvmejsel-set | screwdriver-set |  |
| /collections/spare-parts-gimbal-drones-motorer | /collections/spare-parts-gimbal-drones-motors | YES | spare-parts-gimbal-drones-motorer | spare-parts-gimbal-drones-motors |  |
| /collections/tanger-actionking | /collections/pliers-actionking | YES | tanger-actionking | pliers-actionking |  |
| /collections/tillbehorskablar-drones | /collections/accessory-cables-drones | YES | tillbehorskablar-drones | accessory-cables-drones |  |
| /collections/usb-kablar-usb-c-for-usb-c | /collections/usb-cables-usb-c-for-usb-c | YES | usb-kablar-usb-c-for-usb-c | usb-cables-usb-c-for-usb-c |  |
| /collections/waterproof-kameraskydd | /collections/waterproof-camera-protection | YES | waterproof-kameraskydd | waterproof-camera-protection |  |



---

## SECTION 2 — Pages

| current_url | new_url | redirect_required | current_handle | proposed_handle | internal_references_impacted |
| --- | --- | --- | --- | --- | --- |
| /pages/vara-varumarken | /pages/vara-brands | YES | vara-varumarken | vara-brands |  |
| /pages/gopro-faste | /pages/gopro-mount | YES | gopro-faste | gopro-mount |  |
| /pages/retur-reklamation | /pages/retur-claims | YES | retur-reklamation | retur-claims |  |
| /pages/rekalamtioner-aterkop | /pages/rekalamtioner-buyback | YES | rekalamtioner-aterkop | rekalamtioner-buyback |  |
| /pages/gimbal-and-stabilisering | /pages/gimbal-and-stabilization | YES | gimbal-and-stabilisering | gimbal-and-stabilization |  |
| /pages/kopvillkor | /pages/terms-of-sale | YES | kopvillkor | terms-of-sale |  |
| /pages/samarbeta-with-actionking | /pages/partner-with-actionking | YES | samarbeta-with-actionking | partner-with-actionking |  |
| /pages/samarbeta-with-oss | /pages/partner-with-oss | YES | samarbeta-with-oss | partner-with-oss |  |
| /pages/kablar | /pages/cables | YES | kablar | cables |  |
| /pages/ljud | /pages/audio | YES | ljud | audio |  |
| /pages/basta-myggskyddet | /pages/best-mosquito-repellentet | YES | basta-myggskyddet | best-mosquito-repellentet |  |


### Legacy ActionKing pages (exclude from EDP — no redirect to production)

| current_url | new_url | redirect_required | current_handle | proposed_handle | internal_references_impacted |
| --- | --- | --- | --- | --- | --- |
| /pages/actionking-student | (exclude) | EXCLUDE | actionking-student | — | legacy |
| /pages/om-actionking-se | (exclude) | EXCLUDE | om-actionking-se | — | legacy |
| /pages/samarbeta-with-actionking | (exclude) | EXCLUDE | samarbeta-with-actionking | — | legacy |
| /pages/we-buy-drones-actionking | (exclude) | EXCLUDE | we-buy-drones-actionking | — | legacy |
| /pages/cookies-actionking | (exclude) | EXCLUDE | cookies-actionking | — | legacy |
| /pages/all-products-actionking | (exclude) | EXCLUDE | all-products-actionking | — | legacy |


---

## SECTION 3 — Blogs

| current_url | new_url | redirect_required | current_handle | proposed_handle | internal_references_impacted |
| --- | --- | --- | --- | --- | --- |
| /blogs/nyheter | /blogs/news | YES | nyheter | news |  |
| /blogs/nyheter/kop-dronare-med-kamera | /blogs/news/kop-drones-med-kamera | YES | nyheter/kop-dronare-med-kamera | news/kop-drones-med-kamera |  |
| /blogs/nyheter/fpv-drone-kit | /blogs/news/fpv-drone-kit | YES | nyheter/fpv-drone-kit | news/fpv-drone-kit |  |
| /blogs/nyheter/gopro-hero-11-black | /blogs/news/gopro-hero-11-black | YES | nyheter/gopro-hero-11-black | news/gopro-hero-11-black |  |
| /blogs/nyheter/dji-mini-se | /blogs/news/dji-mini-se | YES | nyheter/dji-mini-se | news/dji-mini-se |  |
| /blogs/nyheter/dji-flip-lilla-dronaren | /blogs/news/dji-flip-lilla-dronesn | YES | nyheter/dji-flip-lilla-dronaren | news/dji-flip-lilla-dronesn |  |
| /blogs/nyheter/dronare-regler | /blogs/news/drones-regulations | YES | nyheter/dronare-regler | news/drones-regulations |  |
| /blogs/nyheter/laddningsbara-batterier-aaa | /blogs/news/rechargeable-batteryer-aaa | YES | nyheter/laddningsbara-batterier-aaa | news/rechargeable-batteryer-aaa |  |
| /blogs/nyheter/kamera-for-youtube | /blogs/news/kamera-for-youtube | YES | nyheter/kamera-for-youtube | news/kamera-for-youtube |  |
| /blogs/nyheter/powerbank-usb-c | /blogs/news/powerbank-usb-c | YES | nyheter/powerbank-usb-c | news/powerbank-usb-c |  |
| /blogs/nyheter/mikrofon-mygga-tradlos | /blogs/news/microphone-mygga-wireless | YES | nyheter/mikrofon-mygga-tradlos | news/microphone-mygga-wireless |  |
| /blogs/nyheter/mikrofon-till-mobil | /blogs/news/microphone-till-mobil | YES | nyheter/mikrofon-till-mobil | news/microphone-till-mobil |  |
| /blogs/nyheter/minneskort-micro-sd | /blogs/news/memory-cards-micro-sd | YES | nyheter/minneskort-micro-sd | news/memory-cards-micro-sd |  |
| /blogs/nyheter/uppladdningsbara-batterier-laddare | /blogs/news/upprechargeable-batteryer-charger | YES | nyheter/uppladdningsbara-batterier-laddare | news/upprechargeable-batteryer-charger |  |
| /blogs/nyheter/micro-usb-laddare | /blogs/news/micro-usb-charger | YES | nyheter/micro-usb-laddare | news/micro-usb-charger |  |
| /blogs/nyheter/spela-in-ljud | /blogs/news/spela-in-audio | YES | nyheter/spela-in-ljud | news/spela-in-audio |  |
| /blogs/nyheter/ficklampa | /blogs/news/flashlight | YES | nyheter/ficklampa | news/flashlight |  |
| /blogs/nyheter/powerbank | /blogs/news/powerbank | YES | nyheter/powerbank | news/powerbank |  |
| /blogs/nyheter/reservdelar-dronare | /blogs/news/spare-parts-drones | YES | nyheter/reservdelar-dronare | news/spare-parts-drones |  |
| /blogs/nyheter/gimbal | /blogs/news/gimbal | YES | nyheter/gimbal | news/gimbal |  |
| /blogs/nyheter/sd-kort-till-kamera | /blogs/news/sd-kort-till-kamera | YES | nyheter/sd-kort-till-kamera | news/sd-kort-till-kamera |  |
| /blogs/nyheter/upptack-dji-osmo-action-6-actionkamerans-nya-masterverk | /blogs/news/upptack-dji-osmo-action-6-actionkamerans-nya-masterverk | YES | nyheter/upptack-dji-osmo-action-6-actionkamerans-nya-masterverk | news/upptack-dji-osmo-action-6-actionkamerans-nya-masterverk |  |
| /blogs/nyheter/dji-mini-5-pro | /blogs/news/dji-mini-5-pro | YES | nyheter/dji-mini-5-pro | news/dji-mini-5-pro |  |
| /blogs/nyheter/insta-360 | /blogs/news/insta-360 | YES | nyheter/insta-360 | news/insta-360 |  |
| /blogs/nyheter/stormkok | /blogs/news/stormkok | YES | nyheter/stormkok | news/stormkok |  |
| /blogs/nyheter/nitecore-emr25-myggavskrackaren | /blogs/news/nitecore-emr25-myggavskrackaren | YES | nyheter/nitecore-emr25-myggavskrackaren | news/nitecore-emr25-myggavskrackaren |  |
| /blogs/nyheter/nitecore | /blogs/news/nitecore | YES | nyheter/nitecore | news/nitecore |  |
| /blogs/nyheter/gopro-hero-12 | /blogs/news/gopro-hero-12 | YES | nyheter/gopro-hero-12 | news/gopro-hero-12 |  |
| /blogs/nyheter/dronare | /blogs/news/drones | YES | nyheter/dronare | news/drones |  |
| /blogs/nyheter/kamerastativ | /blogs/news/kamerastativ | YES | nyheter/kamerastativ | news/kamerastativ |  |
| /blogs/nyheter/dronare-bast-i-test-budget | /blogs/news/drones-bast-i-test-budget | YES | nyheter/dronare-bast-i-test-budget | news/drones-bast-i-test-budget |  |
| /blogs/nyheter/dji-osmo | /blogs/news/dji-osmo | YES | nyheter/dji-osmo | news/dji-osmo |  |
| /blogs/nyheter/mic | /blogs/news/mic | YES | nyheter/mic | news/mic |  |
| /blogs/nyheter/dykutrustning | /blogs/news/diving-equipment | YES | nyheter/dykutrustning | news/diving-equipment |  |
| /blogs/nyheter/actionkamera-bast-i-test | /blogs/news/actionkamera-bast-i-test | YES | nyheter/actionkamera-bast-i-test | news/actionkamera-bast-i-test |  |
| /blogs/nyheter/test-av-kameror | /blogs/news/test-av-cameras | YES | nyheter/test-av-kameror | news/test-av-cameras |  |
| /blogs/nyheter/vandringsutrustning | /blogs/news/hiking-equipment | YES | nyheter/vandringsutrustning | news/hiking-equipment |  |
| /blogs/nyheter/mavic-3-pro | /blogs/news/mavic-3-pro | YES | nyheter/mavic-3-pro | news/mavic-3-pro |  |
| /blogs/nyheter/campingutrustning | /blogs/news/camping-equipment | YES | nyheter/campingutrustning | news/camping-equipment |  |
| /blogs/nyheter/fly-dji-drone | /blogs/news/fly-dji-drone | YES | nyheter/fly-dji-drone | news/fly-dji-drone |  |
| /blogs/nyheter/basta-powerbanken | /blogs/news/best-powerbanken | YES | nyheter/basta-powerbanken | news/best-powerbanken |  |
| /blogs/nyheter/gopro-tillbehor-batterier-filter | /blogs/news/gopro-accessories-batteryer-filter | YES | nyheter/gopro-tillbehor-batterier-filter | news/gopro-accessories-batteryer-filter |  |
| /blogs/nyheter/dji-mini-4pro-fragor-svar | /blogs/news/dji-mini-4pro-fragor-svar | YES | nyheter/dji-mini-4pro-fragor-svar | news/dji-mini-4pro-fragor-svar |  |
| /blogs/nyheter/tradlos-mikrofon-bluetooth | /blogs/news/wireless-microphone-bluetooth | YES | nyheter/tradlos-mikrofon-bluetooth | news/wireless-microphone-bluetooth |  |
| /blogs/nyheter/campingkok | /blogs/news/campingkok | YES | nyheter/campingkok | news/campingkok |  |
| /blogs/nyheter/vevradio | /blogs/news/vevradio | YES | nyheter/vevradio | news/vevradio |  |
| /blogs/nyheter/overlevnadsutrustning | /blogs/news/survival-equipment | YES | nyheter/overlevnadsutrustning | news/survival-equipment |  |
| /blogs/nyheter/nodfilt | /blogs/news/nodfilt | YES | nyheter/nodfilt | news/nodfilt |  |
| /blogs/nyheter/dji-pocket-2 | /blogs/news/dji-pocket-2 | YES | nyheter/dji-pocket-2 | news/dji-pocket-2 |  |
| /blogs/nyheter/bast-i-test-actionkamera | /blogs/news/bast-i-test-actionkamera | YES | nyheter/bast-i-test-actionkamera | news/bast-i-test-actionkamera |  |
| /blogs/nyheter/far-man-flyga-dronare-over-annans-tomt | /blogs/news/far-man-flyga-drones-over-annans-tomt | YES | nyheter/far-man-flyga-dronare-over-annans-tomt | news/far-man-flyga-drones-over-annans-tomt |  |
| /blogs/nyheter/dronare-for-nyborjare | /blogs/news/drones-for-nyborjare | YES | nyheter/dronare-for-nyborjare | news/drones-for-nyborjare |  |
| /blogs/nyheter/portabla-solceller | /blogs/news/portabla-solceller | YES | nyheter/portabla-solceller | news/portabla-solceller |  |
| /blogs/nyheter/dronare-med-kamera | /blogs/news/drones-med-kamera | YES | nyheter/dronare-med-kamera | news/drones-med-kamera |  |
| /blogs/nyheter/regler-for-dronare | /blogs/news/regulations-for-drones | YES | nyheter/regler-for-dronare | news/regulations-for-drones |  |
| /blogs/nyheter/kopa-dronare-med-kamera | /blogs/news/kopa-drones-med-kamera | YES | nyheter/kopa-dronare-med-kamera | news/kopa-drones-med-kamera |  |
| /blogs/nyheter/upptack-din-varld-i-360-grader-med-gopro | /blogs/news/upptack-din-varld-i-360-grader-med-gopro | YES | nyheter/upptack-din-varld-i-360-grader-med-gopro | news/upptack-din-varld-i-360-grader-med-gopro |  |
| /blogs/nyheter/actionkamera | /blogs/news/actionkamera | YES | nyheter/actionkamera | news/actionkamera |  |
| /blogs/nyheter/dji-reservdelar | /blogs/news/dji-spare-parts | YES | nyheter/dji-reservdelar | news/dji-spare-parts |  |
| /blogs/nyheter/gopro-reservdelar | /blogs/news/gopro-spare-parts | YES | nyheter/gopro-reservdelar | news/gopro-spare-parts |  |
| /blogs/nyheter/led-lampa-pa-batteri | /blogs/news/led-lampa-pa-battery | YES | nyheter/led-lampa-pa-batteri | news/led-lampa-pa-battery |  |
| /blogs/nyheter/gopro-tillbehor | /blogs/news/gopro-accessories | YES | nyheter/gopro-tillbehor | news/gopro-accessories |  |
| /blogs/nyheter/stativ-till-mobil-for-att-filma | /blogs/news/stativ-till-mobil-for-att-filma | YES | nyheter/stativ-till-mobil-for-att-filma | news/stativ-till-mobil-for-att-filma |  |
| /blogs/nyheter/time-lapse-kamera | /blogs/news/time-lapse-kamera | YES | nyheter/time-lapse-kamera | news/time-lapse-kamera |  |
| /blogs/nyheter/dji-osmo-tillbehor | /blogs/news/dji-osmo-accessories | YES | nyheter/dji-osmo-tillbehor | news/dji-osmo-accessories |  |
| /blogs/nyheter/krislada | /blogs/news/krislada | YES | nyheter/krislada | news/krislada |  |
| /blogs/nyheter/krisberedskap-hemma | /blogs/news/krisberedskap-hemma | YES | nyheter/krisberedskap-hemma | news/krisberedskap-hemma |  |
| /blogs/nyheter/karbinhake | /blogs/news/karbinhake | YES | nyheter/karbinhake | news/karbinhake |  |
| /blogs/nyheter/tradlos-mygga-mikrofon | /blogs/news/wireless-mygga-microphone | YES | nyheter/tradlos-mygga-mikrofon | news/wireless-mygga-microphone |  |


---

## SECTION 4 — Products

3606 products with Swedish/mixed handles (all **DRAFT**). Full list in CSV.

| current_url | new_url | current_handle | proposed_handle |
| --- | --- | --- | --- |
| /products/telesin-t10-fjarrkontroll-silikonskal-skyddande-fo | /products/telesin-t10-remote-control-silicone-case-protective-fo | telesin-t10-fjarrkontroll-silikonskal-skyddande-fo | telesin-t10-remote-control-silicone-case-protective-fo |
| /products/insta360-ace-pro-2-case-silikon-neck-strap | /products/insta360-ace-pro-2-case-silicone-neck-strap | insta360-ace-pro-2-case-silikon-neck-strap | insta360-ace-pro-2-case-silicone-neck-strap |
| /products/insta360-ace-pro-2-metallbur-skyddande-ram | /products/insta360-ace-pro-2-metal-cage-protective-ram | insta360-ace-pro-2-metallbur-skyddande-ram | insta360-ace-pro-2-metal-cage-protective-ram |
| /products/ministativ-tripod | /products/mini-tripod-tripod | ministativ-tripod | mini-tripod-tripod |
| /products/pgytech-96cm-aluminium-selfiepinne-sportkamera | /products/pgytech-96cm-aluminium-selfie-stick-action-camera | pgytech-96cm-aluminium-selfiepinne-sportkamera | pgytech-96cm-aluminium-selfie-stick-action-camera |
| /products/dji-flip-rcstq-linsskydd-dual | /products/dji-flip-rcstq-lens-protector-dual | dji-flip-rcstq-linsskydd-dual | dji-flip-rcstq-lens-protector-dual |
| /products/gopro-hero5-ramfaste | /products/gopro-hero5-rammount | gopro-hero5-ramfaste | gopro-hero5-rammount |
| /products/dji-rc-n3-fjarrkontroll-for-drones | /products/dji-rc-n3-remote-control-for-drones | dji-rc-n3-fjarrkontroll-for-drones | dji-rc-n3-remote-control-for-drones |
| /products/insta360-one-x2-helkroppsskydd-silikon | /products/insta360-one-x2-helkroppsprotection-silicone | insta360-one-x2-helkroppsskydd-silikon | insta360-one-x2-helkroppsprotection-silicone |
| /products/jsr-dronarfilter-4-i-1-uv-cpl-nd-dji-mavic-mini | /products/jsr-dronefilter-4-i-1-uv-cpl-nd-dji-mavic-mini | jsr-dronarfilter-4-i-1-uv-cpl-nd-dji-mavic-mini | jsr-dronefilter-4-i-1-uv-cpl-nd-dji-mavic-mini |
| /products/gp244-b-actionkamera-faste-alu-nvg | /products/gp244-b-actionkamera-mount-alu-nvg | gp244-b-actionkamera-faste-alu-nvg | gp244-b-actionkamera-mount-alu-nvg |
| /products/mjukt-tpu-skyddsfodral-insta360-ace-pro | /products/mjukt-tpu-protectionsfodral-insta360-ace-pro | mjukt-tpu-skyddsfodral-insta360-ace-pro | mjukt-tpu-protectionsfodral-insta360-ace-pro |
| /products/insta360-go-2-laddbox-silikonskydd | /products/insta360-go-2-laddbox-siliconeprotection | insta360-go-2-laddbox-silikonskydd | insta360-go-2-laddbox-siliconeprotection |
| /products/insta360-go-2-skyddsram-with-stativadapter | /products/insta360-go-2-protectionsram-with-stativadapter | insta360-go-2-skyddsram-with-stativadapter | insta360-go-2-protectionsram-with-stativadapter |
| /products/mini-barvaska-dji-osmo-pocket-forvaring | /products/mini-barbag-dji-osmo-pocket-storage | mini-barvaska-dji-osmo-pocket-forvaring | mini-barbag-dji-osmo-pocket-storage |
| /products/waterproof-skyddsfodral-insta360-go-2 | /products/waterproof-protectionsfodral-insta360-go-2 | waterproof-skyddsfodral-insta360-go-2 | waterproof-protectionsfodral-insta360-go-2 |
| /products/puluz-metallbur-dji-osmo-action-5 | /products/puluz-metal-cage-dji-osmo-action-5 | puluz-metallbur-dji-osmo-action-5 | puluz-metal-cage-dji-osmo-action-5 |
| /products/rcgeek-dji-osmo-pocket-2-ministativ-accessories | /products/rcgeek-dji-osmo-pocket-2-mini-tripod-accessories | rcgeek-dji-osmo-pocket-2-ministativ-accessories | rcgeek-dji-osmo-pocket-2-mini-tripod-accessories |
| /products/hjalmfaste-fjarilsfaste-actionkamera-adapter | /products/hjalmmount-fjarilsmount-actionkamera-adapter | hjalmfaste-fjarilsfaste-actionkamera-adapter | hjalmmount-fjarilsmount-actionkamera-adapter |
| /products/osmo-pocket-mobiladapter-8-pins-smartphonefaste | /products/osmo-pocket-mobiladapter-8-pins-smartphonemount | osmo-pocket-mobiladapter-8-pins-smartphonefaste | osmo-pocket-mobiladapter-8-pins-smartphonemount |
| /products/hjalmfaste-actionkamera-faste | /products/hjalmmount-actionkamera-mount | hjalmfaste-actionkamera-faste | hjalmmount-actionkamera-mount |
| /products/sunnylife-magnetiskt-snabbfaste-dji-osmo-action-5 | /products/sunnylife-magnetiskt-snabbmount-dji-osmo-action-5 | sunnylife-magnetiskt-snabbfaste-dji-osmo-action-5 | sunnylife-magnetiskt-snabbmount-dji-osmo-action-5 |
| /products/pgytech-osmo-pocket-mobilfaste | /products/pgytech-osmo-pocket-mobilmount | pgytech-osmo-pocket-mobilfaste | pgytech-osmo-pocket-mobilmount |
| /products/startrc-1108859-vikbart-fjarrkontroll-solskydd-dji | /products/startrc-1108859-vikbart-remote-control-solprotection-dji | startrc-1108859-vikbart-fjarrkontroll-solskydd-dji | startrc-1108859-vikbart-remote-control-solprotection-dji |
| /products/landningsstallsforlangare-dji-spark-saker-landning | /products/landing-gearsforlangare-dji-spark-saker-landing | landningsstallsforlangare-dji-spark-saker-landning | landing-gearsforlangare-dji-spark-saker-landing |
| /products/startrc-magnetisk-sugkopp-universalfaste | /products/startrc-magnetisk-sugkopp-universalmount | startrc-magnetisk-sugkopp-universalfaste | startrc-magnetisk-sugkopp-universalmount |
| /products/insta360-x4-skarmskydd-hartdat-glas | /products/insta360-x4-skarmprotection-hartdat-glas | insta360-x4-skarmskydd-hartdat-glas | insta360-x4-skarmprotection-hartdat-glas |
| /products/heltackande-silikonfodral-instax360-one-x2 | /products/heltackande-siliconefodral-instax360-one-x2 | heltackande-silikonfodral-instax360-one-x2 | heltackande-siliconefodral-instax360-one-x2 |
| /products/hjalmfaste-magic-arm-360-actionkamera | /products/hjalmmount-magic-arm-360-actionkamera | hjalmfaste-magic-arm-360-actionkamera | hjalmmount-magic-arm-360-actionkamera |
| /products/pocket-3-adapterfaste-startrc | /products/pocket-3-adaptermount-startrc | pocket-3-adapterfaste-startrc | pocket-3-adaptermount-startrc |
| /products/amagisn-silikonsockel-insta360-x4-x5 | /products/amagisn-siliconesockel-insta360-x4-x5 | amagisn-silikonsockel-insta360-x4-x5 | amagisn-siliconesockel-insta360-x4-x5 |
| /products/actionkamera-kulledsfaste-metall-snabbfaste | /products/actionkamera-kulledsmount-metall-snabbmount | actionkamera-kulledsfaste-metall-snabbfaste | actionkamera-kulledsmount-metall-snabbmount |
| /products/justerbart-hjalmfaste-360-grader-actionkamera-1 | /products/justerbart-hjalmmount-360-grader-actionkamera-1 | justerbart-hjalmfaste-360-grader-actionkamera-1 | justerbart-hjalmmount-360-grader-actionkamera-1 |
| /products/ryggsacksfaste-360-graders-rotation-j-form | /products/ryggsacksmount-360-graders-rotation-j-form | ryggsacksfaste-360-graders-rotation-j-form | ryggsacksmount-360-graders-rotation-j-form |
| /products/insta360-x5-forvaring-hart-case | /products/insta360-x5-storage-hart-case | insta360-x5-forvaring-hart-case | insta360-x5-storage-hart-case |
| /products/insta360-x4-silikonskydd-with-linsskydd | /products/insta360-x4-siliconeprotection-with-lens-protector | insta360-x4-silikonskydd-with-linsskydd | insta360-x4-siliconeprotection-with-lens-protector |
| /products/insta360-x5-anti-fog-snap-on-linsskydd | /products/insta360-x5-anti-fog-snap-on-lens-protector | insta360-x5-anti-fog-snap-on-linsskydd | insta360-x5-anti-fog-snap-on-lens-protector |
| /products/insta360-x5-plast-skyddsram-magnetisk | /products/insta360-x5-plast-protectionsram-magnetisk | insta360-x5-plast-skyddsram-magnetisk | insta360-x5-plast-protectionsram-magnetisk |
| /products/insta360-x5-silikonskal-kroppsskydd-dammtalig | /products/insta360-x5-silicone-case-kroppsprotection-dammtalig | insta360-x5-silikonskal-kroppsskydd-dammtalig | insta360-x5-silicone-case-kroppsprotection-dammtalig |
| /products/insta360-x5-roterande-linsskydd | /products/insta360-x5-roterande-lens-protector | insta360-x5-roterande-linsskydd | insta360-x5-roterande-lens-protector |


_…and 3566 more in ENGLISH_HANDLE_MAPPING.csv_


---

## SECTION 5 — Menus & navigation

### Production menu handle / title mapping

| current_handle | proposed_handle | current_title | proposed_title | items | theme_linked | redirect_required |
| --- | --- | --- | --- | --- | --- | --- |
| enterprise-expansion-deploy | enterprise-drones | Enterprise Drones | Enterprise Drones | 9 | NO | NAV_ONLY |
| spare-parts-deploy | spare-parts | Spare Parts | Spare Parts | 47 | NO | NAV_ONLY |
| service-support-deploy | service-support | Service & Support | Service & Support | 14 | NO | NAV_ONLY |
| b2b-enterprise-deploy | b2b-enterprise | B2B Enterprise | B2B Enterprise | 20 | NO | NAV_ONLY |
| enterprise-dr-nare | enterprise-drones | Enterprise Drones | Enterprise Drones | 7 | NO | NAV_ONLY |


### High-traffic menu URLs requiring update after collection/page renames

| resource_type | current_url | new_url | internal_references_impacted |
| --- | --- | --- | --- |
| collection | /collections/inspektionsdronare | /collections/inspection-drones | main-menu → Branschlösningar; main-menu → Inspektion; main-menu → :[]];Branschlösningar; main-menu → :[Inspektion |
| collection | /collections/dronarelektronik-flight-components | /collections/drone-electronics-flight-components | main-menu → Elektronik & flight components; main-menu → :[];Elektronik & flight components |
| collection | /collections/enterprise-sensorer | /collections/enterprise-sensors | main-menu → Sensors & Payloads; main-menu → :[];Sensors & Payloads |
| collection | /collections/dji-flycart-100-lastdronare | /collections/dji-flycart-100-cargo-drones | main-menu → FlyCart 100; main-menu → :[FlyCart 100 |
| collection | /collections/skogsbruksdronare | /collections/forestry-drones | main-menu → Skogsbruk; main-menu → :[];Skogsbruk |
| collection | /collections/jordbruksdronare | /collections/agricultural-drones | main-menu → Jordbruk; main-menu → :[];Jordbruk |
| collection | /collections/dji-air-3-landningsstall | /collections/dji-air-3-landing-gear | spare-parts-deploy → :[];Landningsställ |
| collection | /collections/dji-mini-4-pro-landningsstall | /collections/dji-mini-4-pro-landing-gear | spare-parts-deploy → :[];Landningsställ |
| collection | /collections/dji-air-3-antenner | /collections/dji-air-3-antennas | spare-parts-deploy → :[];Antenner |
| collection | /collections/dji-air-3-sensorer | /collections/dji-air-3-sensors | spare-parts-deploy → :[];Sensorer |
| collection | /collections/dji-matrice-350-rtk-antenner | /collections/dji-matrice-350-rtk-antennas | spare-parts-deploy → :[];Antenner |
| collection | /collections/dji-mini-4-pro-antenner | /collections/dji-mini-4-pro-antennas | spare-parts-deploy → :[];Antenner |
| collection | /collections/dji-mini-4-pro-sensorer | /collections/dji-mini-4-pro-sensors | spare-parts-deploy → :[];Sensorer |
| collection | /collections/dji-air-3-kameror | /collections/dji-air-3-cameras | spare-parts-deploy → :[];Kameror |
| collection | /collections/dji-air-3-motorer | /collections/dji-air-3-motors | spare-parts-deploy → :[];Motorer |
| collection | /collections/dji-matrice-4-kameror | /collections/dji-matrice-4-cameras | spare-parts-deploy → :[];Kameror |
| collection | /collections/dji-mavic-3-enterprise-kameror | /collections/dji-mavic-3-enterprise-cameras | spare-parts-deploy → :[];Kameror |
| collection | /collections/dji-mini-4-pro-kameror | /collections/dji-mini-4-pro-cameras | spare-parts-deploy → :[];Kameror |
| collection | /collections/dji-mini-4-pro-motorer | /collections/dji-mini-4-pro-motors | spare-parts-deploy → :[];Motorer |
| collection | /collections/dji-air-3-kablar | /collections/dji-air-3-cables | spare-parts-deploy → :[];Kablar |
| collection | /collections/dji-matrice-4-kablar | /collections/dji-matrice-4-cables | spare-parts-deploy → :[];Kablar |
| collection | /collections/dji-mini-4-pro-kablar | /collections/dji-mini-4-pro-cables | spare-parts-deploy → :[];Kablar |
| collection | /collections/dji-air-3-armar | /collections/dji-air-3-arms | spare-parts-deploy → :[];Armar |
| collection | /collections/dji-mini-4-pro-armar | /collections/dji-mini-4-pro-arms | spare-parts-deploy → :[];Armar |
| collection | /collections/dji-air-3-skal | /collections/dji-air-3-shell | spare-parts-deploy → :[];Skal |
| collection | /collections/dji-mavic-3-enterprise-skal | /collections/dji-mavic-3-enterprise-shell | spare-parts-deploy → :[];Skal |
| collection | /collections/dji-mini-4-pro-skal | /collections/dji-mini-4-pro-shell | spare-parts-deploy → :[];Skal |


### Menu cleanup context (370 menus on store)

Only `main-menu` is theme-linked. PR49 deploy menus (`*-deploy`) hold production IA but are orphans. See `MENU_CLEANUP_FINAL_REPORT.md`.

---

## SECTION 6 — Redirect plan

**7488** redirect rules (3744 primary + 3744 legacy `/en/` prefix).

### Example mappings

| Swedish | English |
|---|---|
| `reservdelar` | `spare-parts` |
| `tillbehor` | `accessories` |
| `dronare` | `drones` |
| `service-och-support` | `service-support` |
| `offertforfragan` | `request-a-quote` |
| `foretagskonto` | `business-account` |
| `nyheter` (blog) | `news` |

### Locale rules (Shopify Markets)

| Pattern | Redirect to |
|---|---|
| `/collections/{sv}` | `/collections/{en}` |
| `/pages/{sv}` | `/pages/{en}` |
| `/products/{sv}` | `/products/{en}` |
| `/blogs/nyheter/{sv}` | `/blogs/news/{en}` |
| `/en/*` | drop prefix → English canonical path |

Full redirect map: **REDIRECT_MAPPING.csv**

---

## SECTION 7 — Shopify Markets readiness

1. English handles on `eudroneparts.com` as global canonical.
2. Market domains (`.de`, `.dk`, `.fi`, `.fr`) use Shopify Markets with translated content, **same handles**.
3. hreflang per market; sitemap per domain after migration.
4. Execute handle renames while products are **DRAFT** (9,389 products, 0 published at audit).
5. Run menu cleanup (360 deletions) + wire 8 production menus before go-live.

---

## Data sources

- `collection_reconciliation_audit` — 204 live collections
- `test-integration` Shopify GraphQL — pages, blogs, products, menu trees
- `menu-cleanup-pass` — 370 menu inventory + structure fingerprints
- `menu_recovery_fix` dry-run — pruned legacy links

## Guardrails (this analysis)

- **No deployment**
- **No store modifications**
- **No redirects created**
- **No publishing**
