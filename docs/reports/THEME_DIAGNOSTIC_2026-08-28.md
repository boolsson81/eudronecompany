# Felsökning av temat — 2026-08-28

Utlöst av att startsidan renderar med fel typsnitt, stora tomma svarta ytor och saknad logotyp.

## Rättelse av tidigare slutsats

I ett tidigare skede sa jag att repot och det publicerade temat var "i synk". Det stämde bara för *listan över mallfiler* — filnamnen är desamma. Innehållet i kodfilerna är det inte. Jag sa också att live-temats `settings_data.json` var "en Horizon-fil i ett Dawn-tema". Det är tvärtom.

## Rotorsak: temat är en hybrid av Horizon och Dawn

Det publicerade temat är **Shopify Horizon**. Ovanpå det ligger sektioner och mallar byggda för **Dawn**. De två arkitekturerna delar inga CSS-variabler, färgsystem eller typsnittsvariabler.

Belägg — `layout/theme.liquid` i live-temat (7 742 byte) är Horizons layout:

```liquid
{%- render 'stylesheets' -%}
{%- render 'fonts' -%}
{%- render 'theme-styles-variables' -%}
{%- render 'color-palette' -%}
```

Horizon-kärnan finns i sin helhet: `snippets/theme-styles-variables.liquid` (32 KB), `snippets/color-palette.liquid` (10 KB), `snippets/fonts.liquid`, `snippets/chat-drawer.liquid`, `snippets/search-modal.liquid` och katalogen `blocks/` — som Dawn inte har.

Samtidigt ligger Dawn-sektionerna där: `sections/main-product.liquid` (98 KB), `multicolumn`, `related-products`, `collapsible-content`, `enterprise-quote-form`, `snippets/card-product.liquid` och `assets/base.css`.

**Horizons layout laddar aldrig `base.css`.** `snippets/stylesheets.liquid` är 126 byte och drar in Horizons egen CSS. Dawn-sektionernas grundstilar finns alltså i temat men når aldrig sidan.

### Det förklarar exakt det som syns

| Symptom | Orsak |
|---|---|
| Rubriker i monospace | `base.css` sätter `font-family: var(--font-heading-family)` — en Dawn-variabel som Horizon aldrig definierar. Odefinierad variabel → webbläsarens standardtypsnitt |
| Stora tomma svarta ytor | Varje Dawn-sektion begär `color_scheme: "scheme-edp"`. Horizon har inget färgschemasystem — inga färger appliceras |
| Ingen logotyp | Horizons header läser `settings.logo_*`, Dawn-headern i repot läser `settings.logo`. Ingen av dem är satt |
| Ingen favicon | `settings.favicon` är inte satt |
| Produktsidor utan styling | Samma som ovan — `main-product` är en Dawn-sektion utan Dawns CSS |

### Repot är ett annat tema

`theme/` i det här repot är ett **komplett Dawn-tema**, inte en spegling av det som är live:

| fil | live | repo |
|---|---|---|
| `layout/theme.liquid` | 7 742 (Horizon) | 26 405 (Dawn) |
| `assets/base.css` | 45 323 | 80 382 |
| `sections/header.liquid` | 54 856 (Horizon) | 29 015 (Dawn) |
| `sections/footer.liquid` | 6 255 | 20 856 |
| `sections/main-product.liquid` | 98 659 | 98 659 (identisk) |
| `sections/user-type-selector.liquid` | 23 323 | 23 323 (identisk) |

Vissa filer är alltså kopierade rakt av mellan temana, andra inte. Statisk analys av repot beskriver därför inte tillförlitligt vad som händer live.

### Följd för de nya mallarna

De sex mallar som lades till (och de tre tillbehörsmallar som fanns sedan tidigare) är Dawn-mallar. De renderar med samma saknade grundstilar som allt annat Dawn-byggt i temat. De är inte trasigare än de befintliga — men de vilar på samma trasiga grund.

Den ursprungliga `product.dronare.json` som hittades i temaarkivet var byggd på Horizon-block (`product-information`, `_product-details`, `variant-picker`). Den passade alltså det tema som faktiskt är live.

## Vägval

Det här går inte att lappa styckvis. Två sammanhängande vägar:

**A — Bygg om mallarna för Horizon.** Behåll det publicerade temat, gör om produkt- och samlingsmallarna med Horizons block. Mindre risk, sajten fortsätter fungera som idag, men allt Dawn-arbete i repot måste portas.

**B — Publicera Dawn-temat från repot.** Repot innehåller ett komplett Dawn-tema med allt EDP-specifikt (`user-type-selector`, `edp-utility-bar`, `consumer-landing`, `enterprise-landing`, branschsidorna). Då fungerar mallarna som de är byggda. Kräver full genomgång och test innan publicering, eftersom hela sajtens utseende byts.

Rekommendation: **B**, eftersom allt EDP-specifikt arbete redan är Dawn-byggt och Horizon-kärnan bara är kvarleva. Men det är ett beslut som kräver en planerad driftsättning, inte en snabbfix.

## Navigationen: minst 150 döda länkar

Oberoende av temafrågan. Menyerna pekar på de engelska handtag som planerades i URL-migreringen, men samlingarna fick aldrig de handtagen.

### Meny `spare-parts` — i praktiken helt död

11 modellhubbar (`dji-mini-4-pro-spare-parts`, `dji-air-3-spare-parts`, `dji-air-3s-spare-parts`, `dji-neo-spare-parts`, `dji-flip-spare-parts`, `dji-avata-2-spare-parts`, `dji-mavic-3-enterprise-spare-parts`, `dji-matrice-4-spare-parts`, `dji-matrice-30-spare-parts`, `dji-matrice-350-rtk-spare-parts`, `dji-flycart-30-spare-parts`) — **samtliga 11 saknas**.

Under varje hubb ligger 12 underposter (Propellers, Batteries, Motors, Arms, Cameras, Gimbal, Shell, Landing Gear, Cables, Antennas, Sensors, Accessories) = 132 länkar. Ett stickprov på 10 av dem över 8 olika modeller gav **noll träffar**.

Av menyns 145 länkar fungerar bara `repair-precision-tools`.

### Meny `main-menu` — huvudnavigationen

- **`Spare Parts` (toppnivå) → `/collections/dji-drone-spare-parts` — 404.** Samlingen finns inte.
- `Accessories → Controllers` → `/collections/drone-remote-controls` — 404. Finns som `drone-remote-control-accessories` / `remote-control-drones`.
- `Accessories → Landning gear` → `/collections/drone-landing-gear` — 404. Finns som `landing-gear-drones`. (Rubriken är dessutom felstavad.)

Övriga 15 länkar i menyn fungerar.

### Meny `enterprise`

- `DJI Dock` → `/collections/dji-dock-series` — 404.
- `Payloads & Sensors → Thermal Cameras` → `/collections/thermal-drones` — 404. Finns som `drones-with-thermal-camera`.

### Meny `service-support` — 5 döda sidlänkar

`/pages/dji-service`, `/pages/dji-enterprise-service`, `/pages/rma`, `/pages/repairs`, `/pages/terms-of-sale` — ingen av sidorna finns bland butikens 74 sidor.

### Meny `business`

`/pages/partner-program` finns inte. Sidan heter `ansok-om-partnership`.

### 142 tomma menyer

`docs/reports/BROKEN_MENU_LINKS.md` (genererad 2026-06-13) rapporterar 142 tomma menyer och "Total issues: 0". Rapporten är inaktuell — menyerna kopplades om efter att den kördes.

## Temainställningar

- **Ingen logotyp och ingen favicon** är satt.
- **Sidfoten visar samma meny två gånger.** `footer-0` ("Quick links") och `footer-1` ("Info") pekar båda på menyn `footer`, som innehåller en enda länk (Privacy Policy). Två rubriker, samma länk under båda.
- **Nyhetsbrevsrubriken är på engelska**: "Subscribe to our emails" i en svensk butik.
- `announcement-bar` använder `scheme-3` medan allt annat använder `scheme-edp`.

## Kodkontroll

`scripts/audit-theme.py` validerar repots tema: sektionstyper, blocktyper och inställnings-id mot varje sektions `{% schema %}`, `render`/`include` mot befintliga snippets, `asset_url` mot befintliga assets, översättningsnycklar (med plural) mot `sv.json` och `en.default.json`, samt färgscheman.

Resultat: **3 fynd, alla ofarliga.**

- `settings.media_padding` (`layout/theme.liquid`, `layout/password.liquid`) — inställningen finns inte i `settings_schema.json`, så `--media-padding` blir ogiltig. Variabeln används inte i någon CSS, så den är död kod.
- `settings.color_background` (`templates/gift_card.liquid`) — samma sak, odefinierad.
- `settings.type_heading_font` (`snippets/edp-dawn-compat.liquid`) — avsiktlig fallback-kontroll, inte ett fel.

Tidigare i samma genomgång hittades och rättades en riktig bugg: `page.mission-vision.json` satte `button_label_1` där `rich-text`-blocket vill ha `button_label`, vilket gjorde att den första CTA-knappen aldrig renderades.

## Föreslagen ordning

1. **Besluta A eller B ovan.** Allt utseendearbete är blockerat tills dess.
2. **Laga huvudmenyn** — tre länkar (`Spare Parts`, `Controllers`, `Landning gear`) plus stavfelet. Snabbast möjliga vinst, syns direkt.
3. **Bestäm vad som ska hända med `spare-parts`-menyn** — antingen skapa de 143 samlingarna, eller peka om menyn till de samlingar som faktiskt finns, eller ta bort den tills sortimentet är på plats.
4. **Sidlänkarna i Support och Business** — skapa de 6 sidorna eller peka om länkarna.
5. **Logotyp och favicon.**
6. **Sidfoten** — separat meny för "Info", och svensk nyhetsbrevsrubrik.
7. **Rensa de 142 tomma menyerna.**
