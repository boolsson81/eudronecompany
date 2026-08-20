# Produktmall: Drönartillbehör

**Status:** Mallen är skapad men inte tilldelad några produkter ännu. Ingen påverkan på befintliga sidor förrän en produkt eller mall-preset kopplas till den.

## Bakgrund

Konsumenttillbehören till drönare (propellrar, batterier, laddare, väskor, ND-filter, fjärrkontroller m.m.) har idag samma generiska `product.json`-mall som alla andra produkter. Den saknar det en drönarköpare oftast letar efter direkt på produktsidan:

- Vilken/vilka drönarmodeller tillbehöret passar till
- Tekniska specifikationer (mått, vikt, kapacitet, kompatibilitet)
- Vad som faktiskt ingår i paketet
- Tydliga leverans-/returvillkor

Det finns redan en separat `product.enterprise-accessories.json` för B2B-tillbehör till enterprise-plattformar (Matrice, Dock, Agras). Den här mallen är avsedd för de vanliga konsument-/prosumer-tillbehören och innehåller därför inget offertflöde.

## Ny mall

**`theme/templates/product.drone-accessories.json`** — visas som **"Drone accessories"** i mallväljaren i Shopify admin under produktens "Theme template"-inställning. Byggd helt på befintliga sektioner/block, inga nya Liquid-filer krävs.

### Struktur

| Sektion | Typ | Syfte |
|---|---|---|
| `main` | `main-product` (befintlig) | Standardflödet (galleri, pris, varianter, köp-knappar) plus: |
| 　→ `compatibility` | `custom_liquid`-block | Rad direkt under rubriken: *"Passar till: …"* — hämtar och listar värdena från metafältet `dji.compatible_models_display` dynamiskt (samma logik som redan används i `snippets/card-product-compatibility.liquid`, så raden aldrig blir inaktuell) |
| 　→ `collapsible-row-0..3` | `collapsible_tab` | Fyra flikar: **Kompatibla modeller**, **Tekniska specifikationer**, **I paketet ingår**, **Leverans & retur** |
| `trust-badges` | `multicolumn` (befintlig) | Tre korta trygghetsargument: äkta DJI-tillbehör, snabb leverans, 14 dagars öppet köp |
| `related-products` | `related-products` (befintlig) | Rubrik: "Fler tillbehör till din drönare" |

### Metafält som används

- `dji.compatible_models_display` (`list.single_line_text_field`) — redan definierat enligt `DJI_COMPATIBILITY_ARCHITECTURE.md`, samma fält som produktkorten redan använder. Inga nya metafältsdefinitioner krävs.
- `descriptors.subtitle` — samma som övriga mallar, för underrubrik.

**Notera:** Kompatibilitetsraden är byggd som ett `custom_liquid`-block (inte ett vanligt textblock) eftersom Shopify inte tolkar Liquid-taggar som skrivits in i vanliga text-/richtext-fält — de skulle annars visas som ren text på sidan istället för att slå upp metafältets värde.

## Vad som INTE ingår ännu (uppföljningsförslag)

1. **Tekniska specifikationer som strukturerad data.** Specifikationsfliken är idag fritext som innehållsredaktören fyller i manuellt. Ett `specs`-metaobjekt (mått, vikt, kapacitet, IP-klass) skulle vara mer skalbart.
2. **Kollektionsfiltrerade "fler tillbehör".** `related-products` använder Shopifys inbyggda rekommendationer, inte en specifik samling (t.ex. `dji-*-accessories`).

## Så tilldelar ni mallen

Shopify admin → produkt → **Theme template** → välj **`drone-accessories`**. Kan sättas i bulk för en hel samling (t.ex. någon av `dji-*-accessories`-samlingarna) via ett bulk-redigeringsjobb — testa på 2–3 produkter i förhandsvisning först.

## Filer i detta förslag

- `theme/templates/product.drone-accessories.json` — den nya mallen
- Detta dokument
