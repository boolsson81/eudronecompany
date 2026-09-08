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

## Importerat: 166 produkter, alla som utkast

Körningen gjordes i tre omgångar. Omgång 1 och 2 stängde drönargapet.
Omgång 3 tog första varumärket ur varumärkesgapet: EcoFlow.

Siffran 114 som rapporterades efter omgång 2 var för låg. Shopifys sökindex
släpar efter direkt efter en import, och räkningen togs för tidigt. Direkt
uppräkning mot katalogen ger 117 produkter efter omgång 2.

### Omgång 1 — 65 produkter

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

### Omgång 2 — 52 produkter

| Produkttyp | Antal |
|---|---|
| Drönarpaket (bransch, mätning, skog, renskötsel) | 27 |
| Drönartillbehör | 4 |
| Filter (Zenmuse X7/X9 ND) | 4 |
| Skärm & fäste | 4 |
| Värmekamera (Hikmicro NEOS) | 3 |
| Signalförstärkning | 3 |
| Drönarpayload | 3 |
| Gimbaltillbehör | 2 |
| Batteri & laddning | 2 |

Leverantörer: DJI (41), JLIDrone (4), Hikmicro (3), 4Hawks (2), PolarPro (1),
LifThor (1). 4Hawks, Hikmicro NEOS, PolarPro och LifThor var helt frånvarande
i vår katalog.

### Omgång 3 — 49 produkter, EcoFlow

Första varumärket ur varumärkesgapet. EcoFlow för fältkraft ligger nära
drönardriften: kraftstationer, solpaneler och snabbladdare avgör hur många
flygpass som ryms på en dag utanför elnätet.

| Produkttyp | Antal |
|---|---|
| Kraftstation | 11 |
| Solpanel | 9 |
| Powerbank | 7 |
| Extrabatteri | 5 |
| Kablar & adaptrar | 5 |
| Solpanelsfäste | 4 |
| Kraftsystem | 4 |
| Laddare | 3 |
| Transport | 1 |

Av EcoFlows 73 produkter hos Swedron importerades 49. Bortvalt:

- **14 produkter utanför sortimentet** — kylboxar (Glacier), luftkonditionering
  (WAVE), duschkit, doppvärmare, uppvärmda mössor och en axelväska. Camping
  snarare än drönardrift.
- **10 rena färgvarianter** av redan importerade powerbanks (Rapid 5000 och
  10000 i blå och silver, Rapid Mag i flera kulörer). De bör läggas som
  varianter på befintlig produkt, inte som egna produkter.

Tyngdpunkten ligger på branschpaket vi inte hade motsvarigheter till:
skogsbrukspaket med Global Forester-licens, mätpaket med Emlid-mottagare,
paket för renskötsel och för projektering av solcellsanläggningar.

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

**Det drönarnära gapet är stängt.** Samtliga 127 kandidater från
matchningen är hanterade: 114 importerade som utkast, 13 avfärdade som
dubbletter eller utanför sortimentet. `data/swedron-gap-remaining.json` är
därmed tom.

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
| EcoFlow | 73 | 49 (importerat) |
| Vallerret | 45 | 0 |
| SeeTec | 33 | 0 |
| NiSi | 29 | 0 |

EcoFlow är avklarat. Kvar ligger omkring 5 400 produkter i varumärken vi inte
för alls, mestadels foto- och videotillbehör snarare än drönarutrustning.

Närmast i tur står de två varumärken som ligger kvar närmast drönardriften:
**Chasing** (133 produkter, undervattensdrönare) och **Hollyland** (123,
trådlös videoöverföring). Resten — SmallRig, Kupo, Nanlite, Peak Design,
Think Tank — är rigg-, ljus- och väskvarumärken där importen bör föregås av
ett inköpsbeslut.

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
python3 scripts/swedron-gap/build-shopify-payloads.py         # omgång 1
python3 scripts/swedron-gap/build-shopify-payloads-round2.py  # omgång 2
python3 scripts/swedron-gap/build-shopify-payloads-ecoflow.py # omgång 3
```

Sidhämtningen görs med Nimble Extract (`vx8`) mot URL:erna i
`data/swedron-product-index.tsv`. Bulkmutationer mot Shopify är blockerade av
connectorns säkerhetspolicy — importen kördes som `productCreate` med
GraphQL-alias, sju produkter per anrop.
