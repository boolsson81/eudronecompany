# Mallrevision — vad som saknades och vad som återställts

**Status:** Alla mallar nedan är tillagda i temat men **inte tilldelade** några produkter eller samlingar av oss. De sid-mallar som återställts träder i kraft direkt, eftersom sidorna redan pekar på dem.

## Metod

Tre källor jämfördes:

1. **Git-historiken** i det här repot.
2. **Det publicerade temat** (`Uppdaterad kopia av EDP Dawn v1 — body-tag fix`) via Admin API — identiskt med repot.
3. **De 15 opublicerade temana** i butiken, som fungerar som arkiv över tidigare temaversioner.
4. **Livedata**: alla 74 sidor, 146 samlingar och produkttyper, för att se vilka `templateSuffix` som faktiskt refereras.

## Huvudfynd: mallar förlorade vid temabytet

Butiken har bytt tema-arkitektur. Äldre temaversioner byggde produktsidan på Shopifys **Horizon**-sektioner (`product-information`, `_product-details`, `variant-picker`); det nuvarande temat är **Dawn**-baserat (`main-product`, `collapsible_tab`). Vid övergången portades tillbehörsmallarna, men flera andra mallar följde inte med.

`templates/product.dronare.json` finns i **samtliga** temaversioner till och med *"Uppdaterad kopia av EDP Dawn v1 — 2026-08-01 08:55"*, men saknas i alla senare — inklusive det publicerade. Det var alltså precis som rapporterat en drönarmall som försvann i en uppdatering. Den kunde inte återställas rakt av eftersom den är byggd på Horizon-sektioner som inte finns i det nuvarande temat; den ersätts av den Dawn-byggda `product.drones.json` (se `DRONE_PRODUCT_TEMPLATE.md`).

Samma sak gäller `product.spare-part.json` (ersatt av `product.drone-spare-parts.json`) och `collection.drones.json` (nybyggd nedan).

## 1. Nya produktmallar

Alla följer samma mönster som de befintliga tillbehörsmallarna: enbart existerande sektioner och block, inga nya Liquid-filer, inga nya metafältsdefinitioner.

| Mall | Visas som | Avsedd för | Produkter i katalogen |
|---|---|---|---|
| `product.enterprise-drones.json` | `enterprise-drones` | Matrice, Agras, Dock, FlyCart — B2B-plattformar | 34 |
| `product.batteries.json` | `batteries` | Flygbatterier, powerbanks, laddhubbar | 221 |
| `product.software-licenses.json` | `software-licenses` | FlightHub, Pix4D och andra licenser | 149 |
| `product.service-plans.json` | `service-plans` | DJI Care Refresh, Maintenance-planer | 104 |

**`enterprise-drones`** — samma uppbyggnad som `product.enterprise-accessories.json`, alltså med `enterprise-quote-form` sist. Flikar: tekniska specifikationer, nyttolaster & sensorer, regler/C-klass/operatörstillstånd, leverans/service/garanti, dokumentation. Trygghetsraden pekar på `/pages/enterprise-offert` och `/pages/training`.

**`batteries`** — har kompatibilitetsraden ("Passar till: …") från `dji.compatible_models_display`, samma som tillbehörsmallen. Flikar: kapacitet & specifikationer, kompatibla modeller, transport & flygregler, säker användning & förvaring, leverans/retur/återvinning. Trygghetsraden tar upp originalbatterier, transport av farligt gods och producentansvar — se `BATTERY_COMPLIANCE.md`.

**`software-licenses`** — inga frakt- eller returflikar, eftersom produkterna levereras digitalt. Flikar: vad som ingår, licenstyp & giltighetstid, systemkrav, aktivering, support & förnyelse.

**`service-plans`** — har också kompatibilitetsraden, eftersom Care-planer är modellspecifika. Flikar: vad planen täcker, vad den inte täcker, aktivering & registrering, vid skada, villkor & giltighetstid.

## 2. Ny samlingsmall

`collection.drones.json` — banner och produktrutnät med filtrering identiskt med `collection.json`, plus en köpguide (`multicolumn`: vikt & C-klass, kamera & flygtid, paket & tillbehör) och tre vanliga frågor (`collapsible-content`: drönarkort, försäkring, Fly More Combo). En enklare variant fanns i de äldre temana men saknades i det publicerade.

## 3. Återställda sid-mallar

**49 av 74 sidor pekade på mallar som inte fanns i temat.** Shopify faller då tillbaka på standardmallen, så sidorna fungerade men förlorade sin avsedda layout.

Nio av dem fanns kvar i arkivtemat *"rev11 — Live sync (templates fix)"* som identiska en-sektionsmallar byggda på `edp-page-content` — en sektion som fortfarande finns i temat. De är återställda oförändrade:

| Mall | Sidor som pekar på den |
|---|---|
| `page.actionking-sida.json` | 19 |
| `page.trakk-page.json` | 7 |
| `page.dronare.json` | 2 (`dji-neo`, `dji-flip`) |
| `page.dji-mavic-3-serien.json` | 2 |
| `page.dji-mavic-serien.json` | 1 |
| `page.dji-air-serien.json` | 1 |
| `page.faq.json` | 1 |
| `page.stativ.json` | 1 |
| `page.reservdelar.json` | 1 |

`page.service-support.json` (1 sida) återställdes från *"EDP Dawn v1 — 2026-08-19 09:42"* — `main-page` + `rich-text` + `contact-form`. Färgschemat är ändrat från `scheme-4` till `scheme-edp` så att sidan följer resten av det nuvarande temat.

## 4. Buggfix i befintlig mall

`page.mission-vision.json` hade CTA-knappar med inställnings-id:n `button_label_1`, `button_link_1` och `button_style_secondary_1`. `rich-text`-sektionens `button`-block använder `button_label`, `button_link` och `button_style_secondary` (utan suffix) för den första knappen. Den första knappen ("Kontakta oss") renderades därför aldrig — bara "Om oss" syntes. Rättat.

## Kvar att göra (kräver ändringar i butiksdata, inte i temat)

1. **13 sidor har `templateSuffix` satt till `page`.** Det pekar på en mall som heter `page.page.json` och som aldrig har funnits i något tema. Suffixet betyder i praktiken "standardmall" och bör nollställas på sidorna: `hoverair-drones`, `hoverair-drone-accessories`, `business-account`, `request-a-quote`, `support-agreement`, `training`, `industry-wind-power`, `industry-solar-parks`, `industry-power-grid`, `industry-mapping`, `industry-transport-logistics`, `information`, `reklamationer-aterkop`. Vi har medvetet **inte** skapat `page.page.json`, eftersom det skulle ändra hur de 13 sidorna renderas idag.

2. **Fem sid-mallar i temat används inte av någon sida:** `page.jordbruk.json`, `page.skogsbruk.json`, `page.raddningstjanst.json`, `page.gis-kartlaggning.json` och `page.mission-vision.json`. Motsvarande sidor (`industry-agriculture`, `industry-forestry`, `industry-security-rescue`, `gis-kartlaggning`) använder istället den generiska `industry`-mallen. Antingen ska sidorna peka om till sina specifika mallar, eller så kan mallarna tas bort.

3. **`page.service-request.json`** finns i arkivtemana men bygger på sektionen `edp-service-repair-form`, som inte finns i det nuvarande temat. Den är därför inte återställd. Ingen livesida pekar på suffixet idag. För att få tillbaka den behöver formulärsektionen byggas om.

4. **Produkttyperna i katalogen är inte normaliserade** — 106 olika värden, med dubbletter som `Batterier`/`Batteries`/`Drone Batterys` och `Enteprise Accessories`/`Enterprise Accessories` (stavfel). Det gör det svårt att masstilldela mallar per produkttyp.

5. **Enterprise-nyttolaster** (`Enterprise Payload`, `Enterprise Drone Camera`, 17 produkter) har ingen egen mall. De täcks rimligt av `enterprise-accessories`; en egen mall är motiverad först om sortimentet växer.

## Så tilldelar ni mallarna

Shopify admin → produkt (eller samling) → **Webbshopsmall** → välj mallen. Går att sätta i bulk för en hel samling via bulk-redigering — testa på 2–3 poster i förhandsvisning först. Sid-mallarna behöver ingen åtgärd; sidorna pekar redan på dem.
