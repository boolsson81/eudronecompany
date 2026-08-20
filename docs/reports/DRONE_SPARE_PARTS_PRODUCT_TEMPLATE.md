# Produktmall: Drönarreservdelar

**Status:** Mallen är skapad men inte tilldelad några produkter ännu. Ingen påverkan på befintliga sidor förrän en produkt eller mall-preset kopplas till den.

## Bakgrund

Reservdelarna till drönare (propellrar, motorer, gimbal, kameramoduler, armar, skal, landningsställ, kablar, antenner m.m.) använder idag samma generiska `product.json`-mall som alla andra produkter. Reservdelar har ett annat köpbeteende än vanliga tillbehör — kunden vet oftast redan vad som gått sönder och behöver snabbt kunna verifiera:

- Vilken/vilka drönarmodeller reservdelen passar till (avgörande — fel del passar sällan en annan modell)
- Tekniska specifikationer (mått, vikt, materialkod, elektriska värden)
- Hur delen monteras/installeras, och om det krävs verktyg eller teknisk kunskap
- Leverans-, garanti- och returvillkor för en del som redan öppnats/monterats

Det finns redan `product.drone-accessories.json` (konsumenttillbehör) och `product.enterprise-accessories.json` (B2B-tillbehör). Den här mallen kompletterar de två med ett tredje spår specifikt för reservdelar/reparation, byggt på samma mönster.

## Ny mall

**`theme/templates/product.drone-spare-parts.json`** — visas som **"Drone spare parts"** i mallväljaren i Shopify admin under produktens "Theme template"-inställning. Byggd helt på befintliga sektioner/block, inga nya Liquid-filer krävs.

### Struktur

| Sektion | Typ | Syfte |
|---|---|---|
| `main` | `main-product` (befintlig) | Standardflödet (galleri, pris, varianter, köp-knappar) plus: |
| 　→ `compatibility` | `custom_liquid`-block | Rad direkt under rubriken: *"Passar till: …"* — hämtar och listar värdena från metafältet `dji.compatible_models_display` dynamiskt (samma logik som `product.drone-accessories.json` och `snippets/card-product-compatibility.liquid`) |
| 　→ `collapsible-row-0..3` | `collapsible_tab` | Fyra flikar: **Kompatibla modeller**, **Tekniska specifikationer**, **Montering & installation**, **Leverans, garanti & retur** |
| `trust-badges` | `multicolumn` (befintlig) | Tre korta trygghetsargument: originaldelar med tillverkargaranti, snabb leverans, uppmaning att kontrollera kompatibilitet innan köp |
| `related-products` | `related-products` (befintlig) | Rubrik: "Fler reservdelar till din drönare" |

### Skillnad mot `product.drone-accessories.json`

- Flik 3 heter **"Montering & installation"** (ikon `clipboard`) istället för "I paketet ingår" — reservdelar behöver ofta monteringsanvisningar, inte en innehållsförteckning.
- Flik 4 heter **"Leverans, garanti & retur"** (samma ikon `truck`, men rubriken nämner garanti explicit eftersom öppnade/monterade reservdelar ofta har snävare returvillkor).
- Tredje trust-badgen byttes från "14 dagars öppet köp" till **"Kontrollera kompatibilitet"** — uppmanar kunden att dubbelkolla modellen innan köp, eftersom fel reservdel sällan går att returnera efter montering.

### Metafält som används

- `dji.compatible_models_display` (`list.single_line_text_field`) — samma fält som redan används av `product.drone-accessories.json` och produktkorten. Inga nya metafältsdefinitioner krävs.
- `descriptors.subtitle` — samma som övriga mallar, för underrubrik.

## Vad som INTE ingår ännu (uppföljningsförslag)

1. **Tekniska specifikationer och monteringsanvisningar som strukturerad data.** Båda flikarna är idag fritext som innehållsredaktören fyller i manuellt per produkt. Ett `specs`-metaobjekt (mått, vikt, materialkod) och ett gemensamt monteringssnippet per delkategori (propeller/batteri/motor osv.) skulle vara mer skalbart och konsekvent, i linje med uppföljningsförslaget i `DRONE_ACCESSORIES_PRODUCT_TEMPLATE.md`.
2. **Kollektionsfiltrerade "fler reservdelar."** `related-products` använder Shopifys inbyggda rekommendationer, inte en specifik samling (t.ex. någon av `dji-*-reservdelar`-samlingarna från `SPARE_PARTS_ARCHITECTURE_REPORT.md`).
3. **Artikelnummer/OEM-referens som eget fält.** Om reservdelarna har leverantörens originalartikelnummer vore ett synligt fält för det (t.ex. i specifikationsfliken eller som ett eget textblock) användbart för kunder som redan vet exakt vilken del de behöver.

## Så tilldelar ni mallen

Shopify admin → produkt → **Theme template** → välj **`drone-spare-parts`**. Kan sättas i bulk för en hel samling (t.ex. någon av `dji-*-reservdelar`-samlingarna, se `SPARE_PARTS_DEPLOYMENT_REPORT.md`) via ett bulk-redigeringsjobb — testa på 2–3 produkter i förhandsvisning först.

## Filer i detta förslag

- `theme/templates/product.drone-spare-parts.json` — den nya mallen
- Detta dokument
