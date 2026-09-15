# Produktmall: Paket

**Status:** Mallen, snippets, CSS/JS och metafältskriptet är klara i repot. Inget påverkas i butiken förrän (1) temat pushas, (2) metafältsdefinitionerna skapas och (3) en produkt tilldelas mallen `paket`.

## Bakgrund

Paket som *Matrice 400 + Orion AP3-P3 – Pro* består av flera produkter (drönare, nyttolast, batteristation, 4 st batterier) och säljs till ett paketpris. Dessutom finns tillval kunden ska kunna bocka i på samma sida (fallskärm, säkerhetspaket, extra batteri, landningsplatta, minneskort) och få med i varukorgen tillsammans med paketet.

Ingen av de befintliga produktmallarna (`drones`, `enterprise-drones`, `*-accessories`, `service-plans`) kan visa "det här ingår" som en produktlista med bild, pris och lagerstatus per rad, och ingen kan lägga fler produkter i varukorgen än den egna.

## Ny mall

**`theme/templates/product.paket.json`** — visas som **`paket`** i mallväljaren i Shopify admin ("Webbshopsmall"). Paketet är en vanlig Shopify-produkt med eget pris, egna bilder och lager; mallen läser vad som ingår och vilka tillval som finns från metafält.

### Sidans uppbyggnad (högerkolumnen, uppifrån och ned)

| Block | Typ | Vad |
|---|---|---|
| `package_badge` | `custom_liquid` → `edp-package-badge` | Svart etikett över titeln, t.ex. **TVÄTTPAKET** (`paket.etikett`). Döljs om tom |
| `vendor`, `title`, `caption`, `price` | Dawn-standard | Leverantör, titel, underrubrik (`descriptors.subtitle`) och paketpriset |
| `package_contents` | `custom_liquid` → `edp-package-contents` | Ruta med paketets sammanfattning (`paket.sammanfattning`) + **Det här paketet innehåller**: en rad per produkt med bild, leverantör, namn (med "4 x" när antalet är >1), radpris och lagerstatus. Under listan: värdet om delarna köps separat, paketpriset och **Ni sparar X kr** (visas bara när paketpriset faktiskt är lägre) |
| `package_addons` | `custom_liquid` → `edp-package-addons` | **Utvalda tillbehör**: kryssruta, bild, leverantör, namn, pris och *Se produkt*-länk per tillval. En summering ("2 tillval valda · +15 029 kr" och "Totalt med tillval") visas när något är ibockat. Slutsålda tillval visas nedtonade utan kryssruta |
| `variant_picker`, `quantity_selector`, `buy_buttons` | Dawn-standard | Antal och **Lägg i varukorgen**. Snabbköpsknappar är avstängda eftersom de går förbi tillvalslogiken |
| `description` | Dawn-standard | Produktbeskrivningen |
| `collapsible-row-0..3` | `collapsible_tab` | Fyra flikar: **Tekniska specifikationer**, **Så används paketet**, **Utbildning & driftsättning**, **Leverans, service & garanti** |
| `share` | Dawn-standard | Dela |

Under produkten: `multicolumn` (trygghetsargument anpassade för paket), `related-products` ("Fler tillbehör till paketet") och `enterprise-quote-form` ("Vill ni anpassa paketet?").

Galleriet använder `thumbnail_slider` med miniatyrer synliga även på mobil, så att paketets flera bilder (helhet, drönare, nyttolast, batterier) syns direkt.

### Metafält

Alla i namespace `paket`, definieras av `scripts/setup-paket-metafields.mjs`:

| Nyckel | Typ | Innehåll |
|---|---|---|
| `paket.etikett` | `single_line_text_field` | Etikett över titeln ("Tvättpaket", "Pro-paket") |
| `paket.sammanfattning` | `multi_line_text_field` | Texten i rutan under titeln |
| `paket.innehall` | `list.product_reference` | Produkterna som ingår, i visningsordning |
| `paket.antal` | `list.number_integer` | Antal per rad i `innehall`, samma ordning. Tom post eller tomt fält = 1 |
| `paket.tillval` | `list.product_reference` | Tillbehör med kryssruta |

Snippetarna renderar ingenting om `innehall`/`tillval` är tomma, så mallen kan tilldelas innan metafälten är ifyllda.

### Hur tillvalen hamnar i varukorgen

`theme/assets/edp-package.js` hakar på temats vanliga `<product-form>` i capture-fas, före Dawns egen submit-hanterare. När minst ett tillval är ibockat byts formulärets `id`/`quantity` mot Shopifys flerradiga format `items[0][id]`, `items[0][quantity]` (paketet, med valt antal) och `items[1..n][id]` (ett av varje tillval) i samma anrop till `/cart/add.js`. Fälten återställs direkt efter att händelsen skickats. Cart-notification-panelen patchas så att den visar paketet även när svaret innehåller flera rader.

Utan JavaScript läggs bara paketet i varukorgen — tillvalen är rena kryssrutor utanför formuläret och skickas aldrig av misstag.

### Lagerstatus per rad

| Läge | Visas som |
|---|---|
| Spårat lager, antal > 0 | **62 i lager** |
| Spårat lager, antal ≤ 0 men säljbar (fortsätt sälja) | **Beställningsvara** |
| Ej spårat lager | **I lager** |
| Ej tillgänglig | **Slut i lager** |

### Översättningar

Nya nycklar under `products.package.*` i `theme/locales/sv.json` och `theme/locales/en.default.json` (rubriker, lagerstatus, värde/besparing, summering av tillval).

### Test

`scripts/__tests__/paket-product-template.test.ts` vaktar att mallens blocktyper finns i `main-product`, att `custom_liquid`-blocken renderar snippets som finns, att snippetarna bara läser metafält som setup-skriptet definierar (och att alla definierade används), att alla `products.package.*`-nycklar finns i båda språkfilerna och att CSS/JS-filerna finns och laddas.

## Så tar ni det i drift

1. `node scripts/setup-paket-metafields.mjs --execute` — skapar de fem metafältsdefinitionerna (dry-run utan flaggan).
2. `node scripts/push-edp-theme.mjs --execute` — laddar upp mall, snippets, assets och språkfiler.
3. Skapa paketprodukten i Shopify admin: titel, paketpris, bilder, beskrivning, lager. En variant räcker.
4. **Webbshopsmall** → `paket`.
5. Fyll i metafälten: *Paket: innehåll* (välj produkterna i ordning), *Paket: antal per rad* (t.ex. `1, 1, 1, 4`), *Paket: tillval*, *Paket: sammanfattning*, *Paket: etikett*.
6. Förhandsgranska: kontrollera raderna, "Ni sparar", bocka i ett tillval och lägg i varukorgen — varukorgen ska innehålla paketet + tillvalet som separata rader.

## Kräver manuell kontroll

- Metafältsdefinitionerna måste skapas i butiken innan fälten syns i admin (steg 1).
- Lagerdragning: paketprodukten har eget lager i Shopify. Vill ni att lagret ska dras från de ingående produkterna i stället behöver paketet skapas via Shopifys Bundles-app; mallen fungerar oförändrat i så fall eftersom den bara läser metafälten.
- Snabbköp (Shop Pay/dynamic checkout) är avstängt på mallen med flit.

## Uppföljningsförslag

1. Antal per tillval (i dag alltid 1 st).
2. Lista paketet på de ingående produkternas sidor ("Ingår i paket").
3. Samlingssida `/collections/paket` med egen kortdesign som visar "innehåller N delar".
