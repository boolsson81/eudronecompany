# EuroDroneParts Theme — Implementation Log

Kronologisk logg över temautveckling i `theme/` (Dawn 15.4.1 + EDP).

---

## 2026-06-10 — Fas 1: Header & navigation

**Branch:** `cursor/eudroneparts-theme-phase1-header-9443`  
**PR:** [#8](https://github.com/boolsson81/digitalsignal/pull/8)

| Fil | Åtgärd |
|-----|--------|
| `sections/edp-utility-bar.liquid` | Ny — Privat/Företag segmentväxling |
| `snippets/edp-mega-menu.liquid` | Ny — desktop megameny per segment |
| `snippets/edp-header-drawer.liquid` | Ny — mobilmeny med segmentflikar |
| `sections/header.liquid` | Ändrad — `menu_consumer`, `menu_enterprise` |
| `sections/header-group.json` | Ändrad — utility bar + mega default |

**Status:** Implementerad, ej deployad till live.

---

## 2026-06-10 — User type selector section

**Branch:** `cursor/eudroneparts-user-type-selector-9443`  
**Syfte:** Två stora kort som hjälper besökaren välja konsument- eller företagsväg.

### Nya filer

| Fil | Beskrivning |
|-----|-------------|
| `theme/sections/user-type-selector.liquid` | OS 2.0-sektion med 2 block (max), theme editor-schema |
| `theme/assets/section-user-type-selector.css` | Mobil-först CSS enligt Dawn-mönster (`section-*.css`) |

### Funktioner

- **Två kort** via blocks (`limit: 2`): Konsumentdrönare / Enterprise & Företag
- **Per kort:** rubrik, beskrivning, exempellista (textarea, en rad per punkt), CTA, bild eller inline SVG-ikon
- **Standardlänkar i preset:**
  - Konsument → `/pages/consumer`
  - Enterprise → `/pages/enterprise`
- **Prestanda:** lazy-load bilder, inga externa bibliotek, en CSS-fil (~2 KB)
- **Mobil först:** 1 kolumn → 2 kolumner från 750px

### Theme editor

Lägg till sektionen via **Customize → Add section → Användartypväljare** (preset fyller båda korten).

Valfria inställningar:
- Sektionsrubrik / underrubrik
- Färgschema, padding
- Per block: bild, texter, exempel, CTA-länk

### Dawn best practice

| Praxis | Implementation |
|--------|----------------|
| CSS i `assets/section-*.css` | `section-user-type-selector.css` |
| Section-scoped padding | `{%- style -%}` med `.section-{{ section.id }}-padding` |
| Blocks + presets | `card` block, preset med defaultinnehåll |
| `disabled_on` header/footer | Ja |
| Översättningar | `en.default.schema.json`, `sv.schema.json` |

### Ej gjort

- Ej tillagd på `templates/index.json` (startsida kommer i senare fas)
- Ej deployad till `ya1xhg-x6.myshopify.com`

### Verifiering (manuell efter `shopify theme push`)

1. Lägg sektionen på en testsida eller startsida i theme editor
2. Kontrollera mobil (375px): kort staplade, CTA min 44px höjd
3. Kontrollera desktop: två kolumner, lazy-load på bilder
4. Klicka CTA → rätt URL
5. Byt bild i theme editor → uppdateras utan kodändring

---

## 2026-06-10 — Enterprise landing section

**Branch:** `cursor/eudroneparts-enterprise-landing-9443`  
**Syfte:** Komplett företagslandningssida för `/pages/enterprise` med hero, branscher, tjänster, fördelar och offert-CTA.

### Nya filer

| Fil | Beskrivning |
|-----|-------------|
| `theme/sections/enterprise-landing.liquid` | OS 2.0-sektion med blocktyper: hero, heading, industry, service, benefit, quote |
| `theme/assets/section-enterprise-landing.css` | Mobil-först CSS enligt Dawn-mönster |
| `theme/templates/page.enterprise.json` | Sidmall `enterprise` — en sektion, ingen `main-page` (hero levererar h1) |

### Funktioner

- **Hero:** överrubrik, h1, text, två CTA-knappar, bild
- **Branscher:** 6 kort i 3-kolumns rutnät desktop (1 kolumn mobil): Energi & Infrastruktur, Kartläggning & GIS, Räddningstjänst, Skogsbruk, Bygg & Anläggning, Jordbruk
- **Tjänster:** 3-kolumns rutnät med servicekort
- **Fördelar:** USP-piller i flex-rad
- **Offert-CTA:** mörk banner med två knappar (offert + telefon)
- **Preset:** svensk enterprise-copy med länkar till bransch- och tjänstesidor
- **Gruppering:** blocks renderas per typ (inte strikt block_order) via `heading.group`

### Theme editor

Sidmall: skapa sida med suffix `enterprise` eller lägg till sektionen via **Add section → Enterprise-landningssida**.

### Dawn best practice

| Praxis | Implementation |
|--------|----------------|
| CSS i `assets/section-*.css` | `section-enterprise-landing.css` |
| Section-scoped padding | `{%- style -%}` med `.section-{{ section.id }}-padding` |
| Blocks + presets | 6 blocktyper, preset med fullständigt innehåll |
| `disabled_on` header/footer | Ja |
| Översättningar | `en.default.schema.json`, `sv.schema.json` |

### Koppling till user-type-selector

Enterprise-kortet i `user-type-selector` länkar till `/pages/enterprise` — matchar denna sidmall.

### Ej gjort

- Ej deployad till `ya1xhg-x6.myshopify.com`
- Branschundersidor (`/pages/energi-infrastruktur` etc.) finns inte ännu

### Verifiering (manuell efter `shopify theme push`)

1. Skapa sida med handle `enterprise` och mall `enterprise`
2. Kontrollera mobil (375px): hero staplad, kort i 1 kolumn
3. Kontrollera desktop: hero 2 kolumner, branscher 4-col, tjänster 3-col
4. Klicka CTA → `/pages/contact-quote`
5. Redigera block i theme editor → uppdateras utan kodändring

---

## 2026-06-10 — Consumer landing section

**Branch:** `cursor/eudroneparts-consumer-landing-9443`  
**Syfte:** Komplett konsumentlandningssida för `/pages/consumer` — motsvarighet till enterprise-landing.

### Nya filer

| Fil | Beskrivning |
|-----|-------------|
| `theme/sections/consumer-landing.liquid` | OS 2.0-sektion med blocktyper: hero, heading, category, feature, benefit, cta |
| `theme/assets/section-consumer-landing.css` | Mobil-först CSS med EDP accent-färg |
| `theme/templates/page.consumer.json` | Sidmall `consumer` — en sektion, ingen `main-page` |

### Funktioner

- **Hero:** överrubrik, h1, text, 2 CTA-knappar (handla / kom igång-paket), bild
- **Kategorier:** 4-kolumns rutnät — Resa & vlog, Foto & video, FPV, Tillbehör
- **Funktioner:** 3-kolumns kort — paket, utbildning, support
- **Fördelar:** USP-piller
- **Handla-CTA:** accentfärgad banner med länkar till kollektioner
- **Preset:** svensk konsument-copy med länkar till kollektioner och support

### Ändrad fil

| Fil | Ändring |
|-----|---------|
| `theme/sections/user-type-selector.liquid` | Konsumentkort länkar nu till `/pages/consumer` (symmetri med enterprise) |

### Koppling till user-type-selector

Konsumentkortet länkar till `/pages/consumer` — matchar denna sidmall.

### Ej gjort

- Ej deployad till `ya1xhg-x6.myshopify.com`
- Kollektioner (`/collections/mini-flip` etc.) måste skapas i Shopify admin

### Verifiering (manuell efter `shopify theme push`)

1. Skapa sida med handle `consumer` och mall `consumer`
2. Kontrollera mobil (375px): hero staplad, kort i 1 kolumn
3. Kontrollera desktop: hero 2 kolumner, kategorier 4-col, funktioner 3-col
4. Klicka CTA → `/collections/consumer-drones`
5. User-type-selector konsumentkort → `/pages/consumer`

---

---

## 2026-06-10 — Enterprise modular sections

**Branch:** `cursor/eudroneparts-enterprise-sections-9443`  
**Syfte:** Dela upp enterprise-sidan i 6 modulära OS 2.0-sektioner (ersätter monolitisk `enterprise-landing` i `page.enterprise.json`).

### Nya filer

| Fil | Beskrivning |
|-----|-------------|
| `theme/sections/enterprise-hero.liquid` | Hero med h1, CTA, bild |
| `theme/sections/enterprise-industries.liquid` | 6 branschkort |
| `theme/sections/enterprise-platforms.liquid` | Matrice 400, Matrice 4, Dock |
| `theme/sections/enterprise-products.liquid` | Drönare, paket, tillbehör |
| `theme/sections/enterprise-payloads.liquid` | Zenmuse H30, L2, P1, spotlight |
| `theme/sections/enterprise-contact.liquid` | Offert-CTA banner |
| `theme/assets/section-enterprise.css` | Delad CSS för alla enterprise-sektioner |

### Ändrad fil

| Fil | Ändring |
|-----|---------|
| `theme/templates/page.enterprise.json` | Komponerar 6 sektioner i ordning |

### `enterprise-landing.liquid`

Behålls för bakåtkompatibilitet — kan fortfarande läggas till manuellt i theme editor.

### Ej gjort

- Ej deployad till live
- Kollektioner och branschsidor måste skapas i Shopify admin

---

## 2026-06-10 — Enterprise trust bar

**Branch:** `cursor/eudroneparts-enterprise-sections-9443`

| Fil | Beskrivning |
|-----|-------------|
| `theme/sections/enterprise-trust-bar.liquid` | 4 förtroendepunkter med check-ikon, direkt under hero |
| `theme/assets/section-enterprise.css` | Trust bar grid (1→2→4 kolumner) |
| `theme/templates/page.enterprise.json` | `enterprise_trust_bar` efter hero |

**Preset-copy:**
- Auktoriserade leverantörer
- Service och support i Sverige
- Enterprise-specialister
- Offert inom 24 timmar

---

*Senast uppdaterad: 2026-06-10*
