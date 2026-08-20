# EU Drone Company Shopify Theme

Based on **Shopify Dawn 15.4.1** with EU Drone Company (`edp-*`) customizations.

## Phase 1 — Header (implemented)

- `sections/edp-utility-bar.liquid` — Privat / Företag links (navigate to `/pages/consumer` and `/pages/enterprise`), utility links
- `snippets/edp-mega-menu.liquid` — Desktop mega menu per segment (segment resolved per-page via `snippets/edp-page-segment.liquid`)
- `snippets/edp-dropdown-menu.liquid` — Desktop dropdown fallback per segment
- `snippets/edp-header-drawer.liquid` — Mobile drawer, shows the consumer or enterprise menu depending on the current page's segment
- Extended `sections/header.liquid` — dual menus (`menu_consumer`, `menu_enterprise`)

## Shopify Admin setup

1. **Navigation → Menus:** the header section's `menu_consumer`/`menu_enterprise` settings must point at real linklist handles, or the drawer/mega menu silently falls back to `menu_consumer`/`section.settings.menu` for whichever side is missing. Currently configured as:
   - `menu_consumer` → `main-menu` — Consumer Drones, Accessories, Spare Parts
   - `menu_enterprise` → `enterprise` — Enterprise Overview, DJI Matrice, Mavic Enterprise, DJI Agras, FlyCart, DJI Dock, Industry Solutions, Payloads & Sensors, Enterprise Software
   - `config/edp-enterprise-menu.json` documents an alternate, industry-vertical-focused enterprise menu spec (Energi & Infrastruktur, Kartläggning & GIS, Räddningstjänst, Skogsbruk, Bygg & Anläggning, Jordbruk) that was never created in Shopify admin — not currently wired up
2. **Theme editor → Header:** Assign menus to Consumer menu / Enterprise menu
3. **Utility bar:** Set quote and support page URLs, and optionally override the Privat/Företag link targets (default `/pages/consumer` and `/pages/enterprise`)

Which segment's menu is shown (mega menu, dropdown, or mobile drawer) is resolved per-page in `snippets/edp-page-segment.liquid` — there is no client-side toggle or stored preference.

## Deploy

```bash
cd theme
shopify theme push --store ya1xhg-x6.myshopify.com
```

Or connect this folder as the `eudroneparts-dawn-master` repository.
