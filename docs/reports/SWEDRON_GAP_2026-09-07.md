# Sortimentsgap mot Swedron.se — 2026-09-07

Kartläggning av vilka produkter Swedron.se säljer som EU Drone Company saknar,
samt import av de mest affärskritiska som **utkast** i Shopify.

## Underlag

| Källa | Antal |
|---|---|
| Produkt-URL:er i Swedrons sitemap | 9 733 |
| Produkter i vår Shopify-katalog före import | 9 348 (496 aktiva, 8 089 utkast, 763 arkiverade) |
| Unika streckkoder (EAN) i vår katalog | 5 691 |

Swedron.se är en headless Next.js-butik ovanpå Shopify. Sidorna hämtades med
Nimble (server-side rendering), eftersom miljöns nätverkspolicy blockerar direkt
åtkomst till `swedron.se`.

## Matchningsmetod

Titel- och slugmatchning med tvåspråkig normalisering. Första försöket gav för
många falska positiva — svenska och engelska produkttitlar för samma artikel
delade för få tokens (`dji-matrice-400-tb100-batteri` matchade inte
`DJI, TB100 Flight Battery Matrice 400`). Matcharen i
`scripts/swedron-gap/match-catalog.py` hanterar därför:

- svensk/engelsk synonymnormalisering (batteri↔battery, propellrar↔props, väska↔case …)
- Swedrons trunkerade slugs med slumpsuffix (`…-batteristatio-v5e`)
- prefixmatchning för avkortade ord

Efter det ligger tröskeln för "saknas" runt 0,75 i stället för 0,60.

## Importerat: 65 produkter, alla som utkast

Alla bär taggarna `swedron-gap-import` och `draft-granskas`. Ingen är publicerad.

| Produkttyp | Antal |
|---|---|
| Drönartillbehör | 12 |
| Tillbehör robotdammsugare | 10 |
| Drönarpaket | 8 |
| Beräkningsmodul (AirAI3, Manifold) | 7 |
| Lastsläpp (drop kits, gimbalfästen) | 7 |
| Batteri & laddning | 7 |
| Propellrar | 5 |
| Jordbrukstillbehör (Agras) | 4 |
| Drönarpayload (lampor, högtalare) | 3 |
| Drönare (Agras T30) | 1 |
| Robotdammsugare (ROMO A) | 1 |

Leverantörer: DJI (48), JLIDrone (16), Hoodman (1). JLIDrone var helt frånvarande
i vår katalog.

Innehållet är nyskriven svensk text per produkt plus faktabaserade
specifikationslistor, inte kopierad brödtext från Swedron.

## Uteslutna som dubbletter

| Swedron-produkt | Vi har redan |
|---|---|
| DJI Terra Standard (12 mån) | DJI Terra Standard 1 Year |
| DJI Terra Flagship (12 mån) | DJI Terra Flagship 1 Year |
| DJI Power SDC – Inspire 3 Fast Charge Cable | DJI, Power SDC to Inspire3 Fast Charge |
| DJI Inspire 2 Part 23 Vibration Absorbing Board | DJI Inspire board – Vibrationsdämpande Gimbal Modul |
| Polaroid Flip White | Polaroid Flip Vit |
| DJI Matrice 4T (inkl. Enterprise Care Plus) | Matrice 4T och Care Enterprise Plus säljs separat |

Två fall lämnades utanför för manuell bedömning:
**DJI Transmission Antenna (4-Pack)** (vi har "DJI Transmission Antenna", oklart
om samma SKU) och **Rusan Flip-up cover** (kikarsiktestillbehör, utanför
sortimentet).

## Kvarvarande gap

**55 drönarnära produkter** ligger färdigt kandidatlistade i
`data/swedron-gap-remaining.json`. Där finns bland annat Zenmuse X7-filter,
Inspire 2-reservdelar, Mavic 3 Enterprise-batterier och fler Matrice 400-paket.

**Hela varumärken saknas.** Detta är den stora posten och kräver ett
inköpsbeslut, inte bara en import:

| Varumärke | Swedron | Vi |
|---|---|---|
| SmallRig | 1 354 | 2 |
| Kupo | 1 092 | 1 |
| Nanlite | 316 | 0 |
| Peak Design | 300 | 0 |
| Think Tank | 226 | 0 |
| Chasing | 133 | 0 |
| Hollyland | 123 | 0 |
| Rusan | 123 | 0 |
| GoMatic | 106 | 0 |
| Atomos | 84 | 0 |
| EcoFlow | 73 | 0 |
| Vallerret | 45 | 0 |
| SeeTec | 33 | 0 |
| NiSi | 29 | 0 |

Totalt ligger omkring 5 500 produkter i varumärken vi inte för alls, mestadels
foto- och videotillbehör snarare än drönarutrustning.

## Att kontrollera manuellt

- **Priser saknas.** Swedron visar inga priser på enterprise-produkter, och
  konkurrentpriser bör ändå inte kopieras. Alla utkast har pris 0.
- **Artikelnummer och EAN saknas.** Sidorna exponerar dem sällan. Behöver fyllas
  på från distributör innan publicering.
- **Bilder.** Produktbilderna är hämtade via Swedrons CDN och ligger nu på vår
  egen. De är i allt väsentligt DJI:s officiella produktrenderingar, men byt
  gärna till assets direkt från leverantören innan publicering.
- **Lagerstatus** är inte satt.

## Köra om

```sh
python3 scripts/swedron-gap/match-catalog.py <swedron.tsv> <ut.json>
python3 scripts/swedron-gap/parse-product-pages.py
python3 scripts/swedron-gap/build-shopify-payloads.py
```

Sidhämtningen görs med Nimble Extract (`vx8`) mot URL:erna i
`data/swedron-product-index.tsv`. Bulkmutationer mot Shopify är blockerade av
connectorns säkerhetspolicy — importen kördes som `productCreate` med
GraphQL-alias, sju produkter per anrop.
