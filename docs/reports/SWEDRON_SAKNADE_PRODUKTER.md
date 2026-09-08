# Vad vi saknar mot Swedron — 2026-09-08

Full genomgång av Swedrons 9 729 produkter mot vår katalog på 9 514, efter att
166 utkast importerats.

## Kort svar

Vi har inte de flesta. Ungefär en femtedel av Swedrons sortiment är täckt.

| | Produkter | Andel |
|---|---|---|
| A. Varumärken vi inte för alls | 5 802 | 60 % |
| B. Enskilda luckor i varumärken vi för | 1 876 | 19 % |
| C. Bedöms täckta | 2 051 | 21 % |

Full lista: [`data/swedron-saknade-produkter.csv`](../../data/swedron-saknade-produkter.csv)
med kategori, varumärke, produkt, Swedron-URL och närmaste träff hos oss.

Siffrorna för A är robusta — de bygger på om varumärket över huvud taget finns
i katalogen, inte på fuzzy-matchning. B och C är osäkrare: matchningen jämför
Swedrons trunkerade slugs mot våra titlar, så gränsen mellan dem kan flytta sig
några hundra produkter åt vardera hållet. Stickprov på 50 produkter ur A och B
gav inga falska träffar värda att nämna, utöver enstaka fall där vi har samma
produkt i annan variant.

## A. Varumärken utan täckning — 5 802 produkter

| Varumärke | Swedron | Vi har | Vad det är |
|---|---|---|---|
| SmallRig | 1 351 | 2 | Kamerarigg, burar, fästen |
| Kupo | 1 092 | 0 | Studiostativ, klämmor, C-stands |
| Peak Design | 343 | 0 | Väskor, remmar, fästen |
| Nanlite | 316 | 0 | Studio- och videobelysning |
| B&W | 274 | 0 | Transportväskor |
| Think Tank | 226 | 0 | Fotoväskor |
| Hollyland | 182 | 0 | Trådlös video, Lark-mikrofoner |
| Chasing | 133 | 0 | Undervattensdrönare |
| Rusan | 122 | 0 | Adaptrar för optik |
| GoMatic | 106 | 0 | Resväskor |
| Anker | 90 | 1 | Laddning |
| Saramonic | 87 | 1 | Mikrofoner |
| Atomos | 79 | 0 | Monitorer, inspelning |
| Feelworld | 57 | 4 | Monitorer |
| Velbon | 48 | 1 | Stativ |
| Vallerret | 45 | 0 | Fotohandskar |
| SeeTec | 33 | 0 | Monitorer |
| Emlid Reach | 32 | 0 | GNSS-mottagare |
| NiSi | 29 | 0 | Filter |

Tyngdpunkten är rigg, ljus, väskor och studio — foto- och videosidan, inte
drönare. Tre undantag ligger nära vår verksamhet: **Chasing**
(undervattensdrönare), **Hollyland** (trådlös videoöverföring) och **Emlid
Reach** (GNSS för drönarmätning, som redan ingår i mätpaketen vi importerat).

## B. Enskilda luckor i varumärken vi för — 1 876 produkter

| Varumärke | Luckor |
|---|---|
| DJI | 474 |
| PolarPro | 336 |
| Insta360 | 149 |
| Energizer | 64 |
| Polaroid | 62 |
| HIKMICRO | 56 |
| Lexar | 42 |
| PGYTECH | 36 |
| Delkin | 29 |
| Sunnylife | 24 |

### Rättelse om drönargapet

En tidigare rapport i det här arbetet sa att det drönarnära gapet var stängt.
Det stämmer inte. Matchningen gav 417 kandidater under 0,60 i drönarkärnan.
127 av dem prioriterades och behandlades — **290 blev aldrig genomgångna**.

Exempel på vad som ligger kvar: Ronin-S/SC dubbelhandtag, Mavic 3E/T-propellrar,
Matrice 200 V2 maintenance-plan, Zenmuse X5S-balansringar i fler brännvidder,
Osmo Action Cinema/Vivid-filterkollektioner och Phantom 4 propellerskydd.

## Föreslagen ordning

1. **290 återstående DJI-nära produkter.** Samma sortiment vi redan säljer,
   ingen ny leverantörsrelation krävs.
2. **Chasing och Hollyland**, 315 produkter. Närmast drönardriften av de
   varumärken vi saknar helt.
3. **Resten av varumärkena.** SmallRig och Kupo är ensamma 2 443 produkter.
   Där handlar det om ett inköpsbeslut, inte om en import.

## Köra om

```sh
python3 scripts/swedron-gap/brand-coverage.py
python3 scripts/swedron-gap/match-catalog.py data/swedron-product-index.tsv ut.json
```

Exportera först katalogen med `bulkOperationRunQuery` mot Shopify Admin API och
lägg den som `our_products.jsonl`.
