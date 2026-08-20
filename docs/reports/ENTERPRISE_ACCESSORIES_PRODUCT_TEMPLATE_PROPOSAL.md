# Förslag: Produktmall för Enterprise-tillbehör

**Status:** Förslag — mallen är skapad men inte tilldelad några produkter. Ingen påverkan på befintliga sidor förrän en produkt eller mall-preset kopplas till den.

## Bakgrund

Butiken säljer redan konsument- och enterprise-drönare (Matrice, Mavic 3 Enterprise, Dock, Agras, FlyCart) via egna sektioner (`enterprise-products.liquid`, `enterprise-quote-form.liquid`) och ett B2B-segment i headern (`edp.header.segment_enterprise`). Tillbehören till dessa plattformar — batterier, laddare, docknings-kit, RTK-moduler, väskor, propellrar — använder idag samma generiska `product.json`-mall som konsumentprodukter. Den mallen saknar det som gör en enterprise-köpare (upphandlare, tekniker, flottansvarig) trygg i ett köp:

- Vilken/vilka drönarmodeller passar tillbehöret till (finns som metafältet `dji.compatible_models_display`, men visas idag bara som en rad på produktkortet, inte på produktsidan)
- Tekniska specifikationer (vikt, kapacitet, spänning, certifiering)
- Garanti/service-villkor för företagskunder
- Dokumentation (datablad, manual)
- En väg in till offertflödet som redan finns (`enterprise-quote-form`) istället för att bara hänvisa till en fristående sida

## Förslag

En ny alternativ produktmall: **`theme/templates/product.enterprise-accessories.json`** (visas som "Enterprise accessories" i mallväljaren i Shopify admin under produktens "Theme template"-inställning). Byggd helt på befintliga sektioner/block — inga nya Liquid-filer krävs för att skeppa detta.

### Struktur

| Sektion | Typ | Syfte |
|---|---|---|
| `main` | `main-product` (befintlig) | Standardflödet (galleri, pris, varianter, köp-knappar) plus två nya block: |
|　→ `compatibility` | `text`-block | Rad direkt under rubriken: *"Passar till: {{ dji.compatible_models_display }}"* — gör kompatibilitet synlig utan att kunden behöver scrolla till fliken |
|　→ `collapsible-row-0..3` | `collapsible_tab` | Fyra flikar anpassade för B2B: **Kompatibla modeller**, **Tekniska specifikationer**, **Leverans, garanti & service**, **Dokumentation & nedladdningar** (ersätter konsumentmallens "Materials/Care Instructions") |
| `trust-badges` | `multicolumn` (befintlig) | Tre korta trygghetsargument: officiell DJI-återförsäljare, fakturaköp för företag, service & support |
| `related-products` | `related-products` (befintlig) | Rubrik omdöpt till "Andra tillbehör till din flotta" |
| `enterprise-quote` | `enterprise-quote-form` (befintlig) | Samma formulär som redan används på offertsidan, återanvänt här så en tveksam B2B-köpare kan fråga innan de lägger en order |

### Metafält som används

- `dji.compatible_models_display` (`list.single_line_text_field`) — redan definierat enligt `DJI_COMPATIBILITY_ARCHITECTURE.md`, återanvänds för kompatibilitetsraden.
- `descriptors.subtitle` — samma som konsumentmallen, för underrubrik.

Inga nya metafältsdefinitioner krävs för att lansera mallen.

## Vad som INTE ingår ännu (uppföljningsförslag)

1. **Automatiskt ifylld kompatibilitetsflik.** Just nu måste innehållsredaktören manuellt fylla i fliken "Kompatibla modeller" (`collapsible-row-0`) med text eller en sida, eftersom `collapsible_tab`-blocket bara stödjer statiskt innehåll/sidreferens. En snabb förbättring vore ett nytt lättviktigt block-typ i `main-product.liquid` som renderar `dji.compatible_models_display` direekt i fliken (samma logik som redan finns i `snippets/card-product-compatibility.liquid`), så innehållet aldrig kan bli inaktuellt.
2. **Tekniska specifikationer som strukturerad data.** Idag är specifikationsfliken fritext. På sikt vore en `specs`-metaobjekt (vikt, kapacitet, spänning, IP-klass, certifieringar) mer skalbart, i linje med hur `dji`-namnrymden redan används för kompatibilitet.
3. **Kollektionsfiltrerade "relaterade produkter."** `related-products`-sektionen använder Shopifys inbyggda produktrekommendationer, inte en specifik samling. Om ni vill garantera att endast produkter ur `enterprise-accessories`-samlingen visas krävs en liten anpassning av `related-products.liquid` (utanför scope för detta förslag).

## Så tilldelar ni mallen

I Shopify admin → produkt → sektionen **Theme template** → välj **`enterprise-accessories`**. Kan även sättas som standard för hela `enterprise-accessories`-samlingen via ett bulk-redigeringsjobb om ni vill rulla ut det på alla nuvarande tillbehörsprodukter samtidigt (rekommenderas att testa på 2–3 produkter i förhandsvisning först).

## Filer i detta förslag

- `theme/templates/product.enterprise-accessories.json` — den nya mallen
- Detta dokument
