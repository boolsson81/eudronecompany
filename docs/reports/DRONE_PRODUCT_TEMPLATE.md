# Produktmall: Drönare

**Status:** Mallen är skapad men inte tilldelad några produkter ännu. Ingen påverkan på befintliga sidor förrän en produkt kopplas till den.

## Bakgrund

Mallväljaren i Shopify admin ("Webbshopsmall") har hittills bara innehållit `Standardprodukt`, `drone-accessories`, `drone-spare-parts` och `enterprise-accessories` — alltså tre tillbehörs-/reservdelsmallar, men ingen mall för själva drönarna.

Kontroll av både Git-historiken och den publicerade butiksmallen (`templates/product*.json` i det live-satta temat) visar att `product.drones.json` **aldrig har funnits**. Den har alltså inte försvunnit i en uppdatering — den blev aldrig byggd när tillbehörsmallarna togs fram.

Konsekvensen är att alla drönare idag ligger på den generiska `product.json` ("Standardprodukt"), som fortfarande har Dawns engelska standardflikar (*Materials*, *Care Instructions*, *Dimensions*, *Shipping & Returns*). De saknar det en drönarköpare letar efter:

- Flygtid, räckvidd och batteridata
- Vad som ingår i respektive paket (Standard / Fly More Combo)
- Regler, registrering och drönarkort
- Garanti, DJI Care och returvillkor

## Ny mall

**`theme/templates/product.drones.json`** — visas som **`drones`** i mallväljaren i Shopify admin under produktens "Webbshopsmall"/"Theme template". Byggd helt på befintliga sektioner och block, inga nya Liquid-filer krävs.

### Struktur

| Sektion | Typ | Syfte |
|---|---|---|
| `main` | `main-product` (befintlig) | Standardflödet (galleri, pris, varianter, köpknappar) plus: |
| 　→ `series` | `custom_liquid`-block | Rad under underrubriken: *"Serie: …"* — hämtar `dji.series` dynamiskt. Renderas inte alls om metafältet är tomt |
| 　→ `collapsible-row-0..4` | `collapsible_tab` | Fem flikar: **Tekniska specifikationer**, **Flygtid & räckvidd**, **I paketet ingår**, **Regler, drönarkort & registrering**, **Leverans, garanti & retur** |
| `trust-badges` | `multicolumn` (befintlig) | Tre trygghetsargument: auktoriserad DJI-återförsäljare, redo att flyga/snabb leverans, drönarkort & regler (länk till `/pages/training`) |
| `related-products` | `related-products` (befintlig) | Rubrik: "Tillbehör till din drönare" |

### Metafält som används

- `dji.series` (`list.single_line_text_field`) — redan definierat via `scripts/setup-dji-storefront-filters.mjs` och används av storefront-filtret "DJI-serie". Inga nya metafältsdefinitioner krävs.
- `descriptors.subtitle` — samma som övriga produktmallar, för underrubrik.

**Notera:** Serieraden är byggd som ett `custom_liquid`-block (inte ett vanligt textblock), eftersom Shopify inte tolkar Liquid-taggar som skrivits in i vanliga text-/richtext-fält — de skulle annars visas som ren text istället för metafältets värde. Samma mönster som kompatibilitetsraden i `product.drone-accessories.json`.

### Översättningar

`products.product.series_label` tillagd i `theme/locales/sv.json` ("Serie: ") och `theme/locales/en.default.json` ("Series: ") — samma två filer som `compatibility_label` ligger i sedan tidigare.

## Vad som INTE ingår ännu (uppföljningsförslag)

1. **Specifikationer som strukturerad data.** Flikarna *Tekniska specifikationer* och *Flygtid & räckvidd* är fritext som innehållsredaktören fyller i per produkt. Metafält (t.ex. `dji.flight_time`, `dji.max_range`, `dji.takeoff_weight`) eller ett `specs`-metaobjekt skulle vara mer skalbart och gå att filtrera på.
2. **EU-drönarklass (C0/C1/C2) och startvikt** som eget metafält — idag skrivs det in manuellt i regelfliken. Ett fält vore både ett säljargument och ett filter.
3. **Separat enterprise-mall för drönare.** Matrice/Agras-plattformar är offertdrivna och skulle kunna få en `product.enterprise-drones.json` med `enterprise-quote-form`-sektionen, på samma sätt som `product.enterprise-accessories.json`.
4. **Samlingsstyrda "fler tillbehör".** `related-products` använder Shopifys inbyggda rekommendationer, inte en modellspecifik tillbehörssamling.

## Så tilldelar ni mallen

Shopify admin → produkt → **Webbshopsmall** → välj **`drones`**. Kan sättas i bulk för en hel samling (t.ex. `consumer-drones`) via bulk-redigering — testa på 2–3 produkter i förhandsvisning först.

## Filer i detta förslag

- `theme/templates/product.drones.json` — den nya mallen
- `theme/locales/sv.json`, `theme/locales/en.default.json` — `series_label`
- Detta dokument
