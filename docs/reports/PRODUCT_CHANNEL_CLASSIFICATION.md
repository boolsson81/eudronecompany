# PRODUCT_CHANNEL_CLASSIFICATION

**Genererad:** 2026-06-10 08:29:12
**Källa:** ActionKing Shopify-katalog (`products`, shop_id `010120e6-6def-431e-8614-905cb69f85b9`)
**Analysmotor:** aggregate + order_line_items
**Totalt antal produkter:** 26 242
**Distinct vendors:** 293
**Distinct product types:** 75

> Rapport endast — ingen borttagning, ingen Shopify-ändring.

## Kanaldefinitioner

| Kanal | Avsedd målbutik / roll |
|-------|------------------------|
| **EuroDroneParts** | Drönare, DJI-ekosystem, reservdelar, propellrar, enterprise UAV |
| **EUActionCam** | Actionkameror (GoPro, Insta360, Osmo Action) och direkt tillbehör |
| **Shared** | Korskanal-tillbehör: batterier, kablar, väskor, minneskort, fästen m.m. |
| **Archive** | Arkiverade, utgångna eller off-assortment (t.ex. El-Scooter, EcoFlow, Targus) |

## Produkter per kanal

| Kanal | Produkter | Andel | Omsättning (SEK) | Andel oms. |
|-------|----------:|------:|-----------------:|-----------:|
| EuroDroneParts | 16 863 | 64.3% | 166 055 kr | 83.8% |
| EUActionCam | 804 | 3.1% | 4 664 kr | 2.4% |
| Shared | 6 491 | 24.7% | 27 409 kr | 13.8% |
| Archive | 2 084 | 7.9% | — | — |

## Omsättning per kanal

- **Total omsättning (klassificerad):** 198 129 kr
- **Källa:** shopify-order-profitability (730 dagar, orderrad-titlar)
- Produktantal från product_type-fördelning (topp 25 typer + svans). Deploya catalog_field_audit mode=channel_classification för exakt per-produkt.

## Topp 100 vendors

_Live audit + normaliserad referens (#26–50 från `CATALOG_NORMALIZATION_LOCAL_RESULT.md`). Totalt 293 distinct vendors._

| # | Vendor | Antal | Kanal |
|---|--------|------:|-------|
| 1 | DJI | 5 846 | EuroDroneParts |
| 2 | ActionKing | 4 294 | Shared |
| 3 | PolarPro | 1 277 | Shared |
| 4 | EcoFlow | 967 | Archive |
| 5 | Targus | 960 | Archive |
| 6 | Anker | 887 | Archive |
| 7 | Sony | 878 | Archive |
| 8 | Twelve South | 706 | Archive |
| 9 | PgyTech | 649 | Shared |
| 10 | Walkera | 643 | EuroDroneParts |
| 11 | Puluz | 530 | EUActionCam |
| 12 | Sunnylife | 383 | Shared |
| 13 | STARTRC | 325 | Shared |
| 14 | Insta360 | 311 | EUActionCam |
| 15 | BW | 290 | Shared |
| 16 | JSR | 255 | Shared |
| 17 | Mova | 252 | Archive |
| 18 | Obsbot | 229 | Archive |
| 19 | Hasselblad | 229 | Archive |
| 20 | Nitecore | 194 | Archive |
| 21 | Xgimi | 193 | Archive |
| 22 | Navimow | 190 | Archive |
| 23 | Kowa | 188 | Shared |
| 24 | RingConn | 185 | Archive |
| 25 | Dreame | 185 | Archive |
| 26 | Telesin | 175 | EUActionCam |
| 27 | CZI | 166 | EuroDroneParts |
| 28 | Lexar | 164 | Shared |
| 29 | Panasonic | 162 | Archive |
| 30 | Baseus | 153 | Archive |
| 31 | FeiyuTech | 149 | EUActionCam |
| 32 | Energizer | 147 | Archive |
| 33 | aMagisn | 147 | Shared |
| 34 | Hikmicro | 145 | Archive |
| 35 | Livox | 135 | EuroDroneParts |
| 36 | BRDRC | 133 | EuroDroneParts |
| 37 | Parrot | 127 | EuroDroneParts |
| 38 | Polaroid | 126 | Archive |
| 39 | Canon | 125 | Archive |
| 40 | Wingtra | 112 | EuroDroneParts |
| 41 | Roccat | 104 | Archive |
| 42 | Flymile | 98 | Shared |
| 43 | FOCUS OPTICS | 84 | Shared |
| 44 | Master Airscrew | 83 | EuroDroneParts |
| 45 | Steel | 82 | Archive |
| 46 | ZeppHealth | 77 | Archive |
| 47 | Ubtech | 77 | Archive |
| 48 | Aosu | 74 | Archive |
| 49 | Outin | 73 | Archive |
| 50 | Rollei | 72 | Archive |
| 51–100 | övriga 243 vendors | ≤ 72 vardera | varierar |

## Topp 100 product types

_Visar 25 av 75 product types._

| # | Product type | Antal produkter | Primär kanal (regel) |
|---|--------------|----------------:|----------------------|
| 1 | Enterprise Drönare | 15 116 | EuroDroneParts |
| 2 | DJI & GoPro Accessories | 1 451 | Shared |
| 3 | Arkiv | 1 362 | Archive |
| 4 | Väskor | 646 | Shared |
| 5 | Tillbehör till drönare | 517 | EuroDroneParts |
| 6 | El-Scooter | 492 | Archive |
| 7 | Skydd | 485 | Shared |
| 8 | (null) | 481 | Shared (fallback) |
| 9 | Ljud | 461 | Shared |
| 10 | Kamerafilter | 427 | EUActionCam |
| 11 | Mobile Accessories | 423 | Shared |
| 12 | Reservdelar till drönare | 418 | EuroDroneParts |
| 13 | Drönar filter | 323 | EuroDroneParts |
| 14 | Fästen | 309 | Shared |
| 15 | Actionkamera filter | 279 | EUActionCam |
| 16 | Kikare | 230 | Archive |
| 17 | Minneskort, Lagring | 225 | Shared |
| 18 | Drönarväska | 206 | EuroDroneParts |
| 19 | Batterier | 198 | Shared |
| 20 | Fjärrkontrollstillbehör | 156 | EuroDroneParts |
| 21 | Mobiltelefontillbehör | 147 | Shared |
| 22 | Kablar | 144 | Shared |
| 23 | Propellrar | 127 | EuroDroneParts |
| 24 | Stativ | 111 | Shared |
| 25 | Reservdel till Actionkameror | 98 | EUActionCam |

## Felplacerade produkter (18 identifierade, visar 18)

Produkter där tilldelad kanal konfliktar med vendor/product_type/titel-signaler.

| Titel | Vendor | Product type | Tilldelad | Föreslagen | Konfidens | Omsättning |
|-------|--------|--------------|-----------|------------|-----------|------------|
| [data quality] Vendor-alias "AK" (2151 st) | AK | — | — | normalisera | high | — |
| [bulk] 967 produkter under off-catalog vendor | EcoFlow | — | Shared | Archive | high | — |
| [bulk] 960 produkter under off-catalog vendor | Targus | — | Shared | Archive | high | — |
| [bulk] 887 produkter under off-catalog vendor | Anker | — | Shared | Archive | high | — |
| [bulk] 878 produkter under off-catalog vendor | Sony | — | Shared | Archive | high | — |
| [bulk] 706 produkter under off-catalog vendor | Twelve South | — | Shared | Archive | high | — |
| [data quality] Vendor-alias "PULUZ" (516 st) | PULUZ | — | — | normalisera | high | — |
| [data quality] Vendor-alias "POLARPRO" (507 st) | POLARPRO | — | — | normalisera | high | — |
| [bulk] 252 produkter under off-catalog vendor | Mova | — | Shared | Archive | high | — |
| [bulk] 229 produkter under off-catalog vendor | HasselBlad | — | Shared | Archive | high | — |
| [bulk] 229 produkter under off-catalog vendor | Obsbot | — | Shared | Archive | high | — |
| [bulk] 194 produkter under off-catalog vendor | Nitecore | — | Shared | Archive | high | — |
| [bulk] 193 produkter under off-catalog vendor | Xgimi | — | Shared | Archive | high | — |
| [bulk] 190 produkter under off-catalog vendor | Navimow | — | Shared | Archive | high | — |
| [product_type] Kamerafilter (427 st) | — | Kamerafilter | EUActionCam | granska | medium | — |
| [product_type] DJI & GoPro Accessories (1451 st) | — | DJI & GoPro Accessories | Shared | granska | medium | — |
| [product_type] (null) (481 st) | — | (null) | Shared | granska | medium | — |
| [product_type] Enterprise Drönare (15116 st) | — | Enterprise Drönare | EuroDroneParts | granska | medium | — |

## Klassificeringsregler (sammanfattning)

1. `product_type=Arkiv` eller `status=archived` → **Archive**
2. Off-catalog vendors (EcoFlow, Targus, Sony, …) → **Archive**
3. Drönar-relaterade product_types → **EuroDroneParts**
4. Actionkamera product_types → **EUActionCam**
5. Korskanal-tillbehör → **Shared**
6. Keyword-fallback på titel/taggar vid oklar product_type

## Observationer

- **EuroDroneParts:** 16 863 produkter (64.3%) — domineras av `Enterprise Drönare` (15 116 st) och DJI (5 846 st).
- **EUActionCam:** 804 produkter — actionkameror, filter och reservdelar.
- **Shared:** 6 491 produkter — `DJI & GoPro Accessories`, batterier, väskor, kablar.
- **Archive:** 2 084 produkter — Arkiv (1 362), El-Scooter (492), off-catalog vendors.
- **~5 700+** produkter under off-catalog vendors (EcoFlow, Targus, Sony m.fl.) bör flyttas till **Archive** vid kanaluppdelning.
- **481** produkter saknar `product_type` — kräver manuell/AI-klassificering innan kanalfördelning.
- **1 362** produkter i `Arkiv` product_type — redan markerade legacy.
- Vendor-dubbletter kvar i live DB (`AK`/`ActionKing`, `POLARPRO`/`PolarPro`) — normalisering applicerad lokalt men ej i denna audit-snapshot.
