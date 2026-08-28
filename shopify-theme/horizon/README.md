# Horizon-mallar för det publicerade temat

Det publicerade temat är **Shopify Horizon**. Repots `theme/` är ett **Dawn**-tema och speglar alltså inte butiken — se `docs/reports/THEME_DIAGNOSTIC_2026-08-28.md`.

Filerna här är byggda för Horizon och är avsedda att läggas ovanpå det publicerade temat, på samma sätt som övriga överlägg under `shopify-theme/`.

## Innehåll

`templates/` — åtta produktmallar och en samlingsmall:

| Mall | Visas som | Avsedd för |
|---|---|---|
| `product.drones.json` | `drones` | Konsumentdrönare |
| `product.enterprise-drones.json` | `enterprise-drones` | Matrice, Agras, Dock, FlyCart |
| `product.batteries.json` | `batteries` | Flygbatterier och laddning |
| `product.software-licenses.json` | `software-licenses` | FlightHub, Pix4D m.fl. |
| `product.service-plans.json` | `service-plans` | DJI Care Refresh, Maintenance |
| `product.drone-accessories.json` | `drone-accessories` | Konsumenttillbehör |
| `product.drone-spare-parts.json` | `drone-spare-parts` | Reservdelar |
| `product.enterprise-accessories.json` | `enterprise-accessories` | B2B-tillbehör |
| `collection.drones.json` | `drones` | Drönarsamlingar |

De tre sista ersätter Dawn-mallar med samma namn som redan ligger i det publicerade temat.

## Uppbyggnad

Varje produktmall följer temats egen `templates/product.json`:

- **`product-information`** med de statiska blocken `_product-media-gallery` och `_product-details`
- I detaljkolumnen: `group` (leverantör, rubrik, underrubrik, pris) → `custom-liquid` (kompatibilitet, där det är relevant) → `_divider` → `variant-picker` → `buy-buttons` (med `quantity`, `add-to-cart`, `accelerated-checkout`) → trygghetsrader → produktbeskrivning → `accordion`
- **`accordion`** med `_accordion-row` ersätter Dawns `collapsible_tab`
- **Trygghetsraderna** är en kolumngrupp av radgrupper med `icon` + `text`, samma mönster som Horizons eget preset i `blocks/_product-details.liquid`
- **`product-recommendations`** ersätter Dawns `related-products`-sektion
- Samlingsmallen använder **`main-collection`** (rutnät med filter), inte Dawns banner + grid

Inga nya sektioner, block eller metafältsdefinitioner krävs.

## Metafält

- `dji.compatible_models_display` — raden "Passar till: …" på tillbehör, reservdelar, batterier och serviceplaner
- `dji.series` — raden "Serie: …" på drönarmallen
- `custom.passsar_till` — samma rad på enterprise-tillbehör (befintligt fält, stavas så i butiken)
- `descriptors.subtitle` — underrubrik

Etiketterna är skrivna på svenska direkt i mallarna. Dawns översättningsnycklar (`products.product.compatibility_label`) används inte, eftersom de inte finns i Horizons språkfiler.

## Status

Samtliga nio mallar är uppladdade till och accepterade av Shopifys egen validering i
temat **`AAA HORIZON-MALLAR — test`** (id `188878291272`), en exakt kopia av det
publicerade temat. Förhandsgranska där innan något publiceras.

Shopifys uppladdningsvalidering fångade tre fel som den lokala kontrollen missade —
alla i richtext-fältet `text`, som kräver att varje toppnivånod är `<p>`, `<ul>`,
`<ol>` eller `<h1>`–`<h6>`:

- tomma dragspelsrader satte `text` till `""`; inställningen utelämnas nu helt
- underrubriken var ren Liquid utan omslutande tagg, nu i `<p>`
- produktbeskrivningen var ett `text`-block med ren Liquid; ersatt med Horizons
  `product-description`-block

`scripts/validate-horizon-templates.py` kontrollerar numera den regeln också.

## Att kontrollera före publicering

1. **Trygghetsraderna innehåller påståenden som behöver stämma.** "Auktoriserad DJI-återförsäljare", "Auktoriserad DJI Enterprise-partner", "Spårbar frakt", "Svensk kundsupport" m.fl. är utkast — verifiera eller byt ut dem.
2. **`enterprise-quote-form`** på de två enterprise-mallarna är en Dawn-sektion med egen CSS (`section-enterprise.css`). Den laddar sina egna stilar men sätter `color_scheme: scheme-edp`, som inte finns i Horizon. Kontrollera hur den ser ut innan publicering.
3. **Samlingsmallen visar ingen rubrik eller beskrivning.** Horizons `main-collection` renderar bara rutnätet; en rubriksektion behöver läggas till i temaeditorn.
4. **Tomma dragspelsrader.** Produktspecifika rader (specifikationer, flygtid, vad som ingår, leveransvillkor) är avsiktligt tomma och fylls per produkt. Förifyllda är bara de generella: regler och drönarkort, batteritransport och batterisäkerhet.
