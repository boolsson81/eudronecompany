# Wisson Orion — import och landningssidor

**Datum:** 2026-09-09
**Källa:** https://www.wissonrobotics.com/en/
**Körning:** tagg `wisson-import`, granskningstagg `draft-granskas`

## Vad som skapades

### Kollektion

| Handle | Titel | ID |
|---|---|---|
| `wisson-orion` | Wisson Orion — flygburna robotsystem | `671509184840` |

### Produkter — 8 st, samtliga `DRAFT`

| Modell | Handle | Serie | Plattform |
|---|---|---|---|
| AP30-N1 | `wisson-orion-ap30-n1-pliabot-flygburen-manipulator-dji-fc30` | N | DJI FlyCart 30 |
| AP3-G1 | `wisson-orion-ap3-g1-pliabot-flygburet-gripdon-dji-m300-m350` | G | DJI M300/M350 |
| AP30-G2 | `wisson-orion-ap30-g2-flygburen-lastslappare-40-kg-dji-fc30` | G | DJI FlyCart 30 |
| AP3-P1 | `wisson-orion-ap3-p1-pliabot-flygburen-sprutmodul-dji-m300-m350` | P | DJI M300/M350 |
| AP3-P3 | `wisson-orion-ap3-p3-pliabot-fasadtvattsystem-dji-m400` | P | DJI M400 |
| AP30-P4 | `wisson-orion-ap30-p4-pliabot-flygburen-dimspruta` | P | ej angiven av källan |
| AP30-P4H | `wisson-orion-ap30-p4h-pliabot-flygburen-hogtrycksspruta` | P | ej angiven av källan |
| AP3-D1 | `wisson-orion-ap3-d1-flygburen-kontaktinspektionsrobot-dji-m300-m350` | D | DJI M300/M350 |

### Sidor — 7 st, samtliga opublicerade

| Handle | Typ | Temamall |
|---|---|---|
| `wisson` | Varumärkesnav | `page.wisson.json` |
| `wisson-n-serien` | Systemsida | `page.wisson-n-serien.json` |
| `wisson-g-serien` | Systemsida | `page.wisson-g-serien.json` |
| `wisson-p-serien` | Systemsida | `page.wisson-p-serien.json` |
| `wisson-d-serien` | Systemsida | `page.wisson-d-serien.json` |
| `fasadtvatt-dronare` | Lösningssida | `page.fasadtvatt-dronare.json` |
| `vindkraftsunderhall-dronare` | Lösningssida | `page.vindkraftsunderhall-dronare.json` |

Mallarna följer samma mönster som `page.jordbruk.json`: sektionen
`enterprise-industry-landing` med fyra solution- och fyra benefit-block, följd av
`enterprise-contact` som pekar på `/pages/contact-quote` och telefonnumret.

## Kräver manuell kontroll

1. **Temamallarna är inte deployade.** Shopify-connectorn blockerar skrivningar mot
   det publicerade temat, så de sju `page.*.json` ligger bara i repot. Kör
   `node scripts/push-edp-theme.mjs` innan sidorna publiceras — annars renderas de
   med standardmallen och sektionsinnehållet syns inte.
2. **Inga produktbilder.** Wissons sidor lazy-laddar bilder via
   `0.ss.508sys.com/image/loading/dot.gif` och exponerar inga riktiga URL:er i
   renderad DOM. Samtliga åtta produkter saknar bild och behöver bildmaterial från
   leverantören innan publicering.
3. **Inga priser.** Sortimentet är enterprise och offereras per uppdrag. Produkterna
   har därför Shopifys standardvariant på 0 kr. Bestäm om de ska säljas via
   offertflödet eller få riktiga priser innan status ändras från `DRAFT`.
4. **Återförsäljarledet är inte verifierat.** Att produkterna ligger i butiken
   förutsätter ett avtal med Wisson Technology (Shenzhen). Presales:
   `bd@wissonrobotics.com`.
5. **AP30-P4 och AP30-P4H saknar plattformsuppgift.** Källsidorna säger bara
   "ledande industridrönare" utan modellnamn, och har heller ingen specifikationstabell.
   Produkttexten säger att plattformen bekräftas vid offert.
6. **Navigationen är inte uppdaterad.** Sidorna är inte inlagda i någon meny. Se
   `scripts/apply-edp-menu-structure.mjs`.
7. **Compat-taggen för FlyCart 30.** AP30-N1 och AP30-G2 taggades `compat:flycart-30`
   enligt `data/edp-product-tag-standards.json`. Kontrollera att det matchar hur
   FlyCart-produkterna i katalogen redan är taggade.

## Avgränsning

Wisson säljer även lösningarna färgsprutning, avisning och åskskyddsmätning samt en
laddstation (CF1). De är inte importerade — CF1 ligger bara på den kinesiska sajten,
och de tre lösningssidorna saknar produktkoppling.
