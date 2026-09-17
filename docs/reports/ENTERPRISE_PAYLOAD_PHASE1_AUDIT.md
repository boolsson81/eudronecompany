# Enterprise Payload Architecture — Phase 1 Audit

**Date:** 2026-09-15
**Store:** Europe Drone Company (`ya1xhg-x6.myshopify.com`, www.eudronecompany.com), Shopify Basic, SEK
**Scope:** Read-only audit before the payload / mission / compatibility architecture is built. Nothing in the store was modified during this phase.
**Source of truth:** Live Admin GraphQL API queries (2026-09-15) cross-checked against the repo (`theme/`, `data/`, `scripts/`, `docs/reports/`).

---

## 1. Current theme

| Item | Live | Repo |
|---|---|---|
| Published theme | `Uppdaterad kopia av Wisson-mallar — utkast 2026-09-09` (`gid://shopify/OnlineStoreTheme/189338091848`, role MAIN) | `theme/` = Dawn 15.4.1 + `edp-*` |
| Base framework | **Horizon** (`layout/theme.liquid` renders `stylesheets`, `scripts`, `chat-drawer`; `blocks/` directory with `_product-details`, `filters`, `buy-buttons` etc.) | **Dawn** (no `blocks/`, no Horizon sections) |
| Default product template | `product-information` (Horizon) | `main-product` (Dawn) |
| Default collection template | `main-collection-banner` + `main-collection-product-grid` (Dawn, `show_compatibility: true`, `enable_filtering: true`) **and** a Horizon `main-collection` section in the same JSON | Dawn only |
| Enterprise pages (`page.enterprise`, `page.energi-infrastruktur`, …) | EDP sections (`enterprise-hero`, `enterprise-industries`, `enterprise-payloads`, `enterprise-contact`) + Horizon `main-page` | Same EDP sections |
| Files identical repo ↔ live | `sections/main-product.liquid`, `snippets/card-product.liquid`, `sections/main-collection-product-grid.liquid`, `sections/edp-page-content.liquid`, `sections/related-products.liquid` | |
| Files that differ | `sections/header.liquid`, `sections/footer.liquid`, `sections/enterprise-quote-form.liquid`, `sections/enterprise-payloads.liquid`, every `templates/*.json` checked, `config/settings_data.json` | |
| Unpublished themes | 19 copies (rev7 … `Färgfix — vit text på svart (2026-09-11)`) | |

**Conclusion.** The live theme is a hybrid: a Horizon base with the repo's Dawn-era EDP sections copied in. The repo cannot be pushed wholesale (`scripts/push-edp-theme.mjs`) without destroying the live Horizon layout. New storefront work must therefore be **self-contained sections/snippets** (own CSS, no dependency on Dawn `component-*.css` or Horizon `blocks/`) pushed file-by-file with `scripts/push-single-theme-file.mjs`, and templates must be authored for the Horizon base (`product-information`, `main-page`) rather than `main-product`.

## 2. Current product architecture

| Metric | Value |
|---|---|
| Products total / active | 9 841 / 510 |
| `product_type = Enterprise Tillbehör` | 85 |
| `Enterprise Drones` | 34 |
| `Enterprise Spareparts` | 33 |
| `Enterprise Software` | 28 |
| `Enterprise Drone Camera` | 14 |
| `Enterprise Accessories` | 14 |
| `Enterprise Payload` | 5 |
| Title contains "Zenmuse" (total / active) | 49 / 7 (active ones are mounts, cables, X5R/X7/X9 cinema parts — no active Zenmuse H30T/L2/P1 payload) |
| Vendor CZI (active) | 15 (GL60 Plus/Mini searchlights, LP20/LP35 searchlight+broadcast, MP130 V2 speaker, TH4 V2 drop kit) |
| Vendor Wisson Robotics | 31 (Orion N/G/P/D series, all draft) |

Payload-type information lives only in **titles, tags and product_type strings** (`Searchlight`, `Broadcasting`, `LiDAR`, `Sensorer`, `enterprise`). There is no field that says "this is a thermal camera" or "this is a LiDAR". Product types are inconsistent (Swedish and English variants of the same type).

## 3. Existing metafields (live)

**Product, `custom` namespace (28 definitions).** Relevant ones:

| Key | Type | Used for | Verdict |
|---|---|---|---|
| `custom.passsar_till` (sic) | list choices, 75 DJI airframes incl. Matrice 400 / 350 RTK / 30 / 30T / 4D / 4TD / 3D / 3TD | "Fits" compatibility; drives smart collections `fits-dji-matrice-400` (21 products) and `fits-dji-matrice-4d` (11) via `PRODUCT_METAFIELD_DEFINITION` rules | **Reuse** as the consumer/legacy compatibility field. Not sufficient for enterprise: no status (adapter / integration / unknown), no non-DJI platforms, typo in key is frozen. |
| `custom.kompatibla_dji_system` | list choices (12 Zenmuse models) | Accessories that fit a Zenmuse camera | Reuse for accessory→payload compatibility. |
| `custom.tillverkare` | single choice (34 brands incl. DJI, CZI, Livox, Wingtra, Wisson Robotics) | Manufacturer filter | **Reuse** for "Manufacturer" filter. |
| `custom.bransch` | list text | Industry | Free text, no choices — superseded by mission/industry references. |
| `custom.leverantor`, `leverantorens_artikelnummer`, `tillverkarens_sku`, `leverantor_2*` | supplier data | purchasing | Untouched. |
| `custom.primary_collection`, `custom.related_products`, `custom.dronartillbehor`, `custom.reservdelar`, `custom.manual`, `custom.pdf`, `custom.video` | references / files | product page | Reuse `manual`/`pdf` for "Documentation". |
| `custom.channel` | `drone` / … | storefront gating (`edp-channel-*` snippets) | Untouched. |
| `seo.kort_text_150`, `seo.specification`, `seo.faq_json`, `seo.related_products`, `seo.related_collections` | SEO/AI | `edp-ai-content`, `edp-seo-faq` | **Reuse** for FAQ and short description on enterprise pages. |
| `shopify--discovery--product_recommendation.related_products` / `complementary_products` | Search & Discovery | related products | **Reuse** for "Related payloads" / "Recommended accessories". |
| `shopify.*` (≈150 standard taxonomy attributes, e.g. `compatible-aircraft-type`, `optical-zoom`, `camera-sensor-type`) | Shopify category metafields | auto-created | Leave; too generic for enterprise specs. |

**Not present live:** the `dji.*` namespace (`dji.compatible_models_display`, `dji.series`, `dji.accessory_type`) that `docs/reports/DJI_FILTER_SETUP.md` and `scripts/setup-dji-storefront-filters.mjs` describe, and that `snippets/card-product-compatibility.liquid` and four product templates read. Those theme references are currently dead code. Also absent: any `edp.*`, `specs.*` or `global.*` product definitions.

**Collection metafields:** `seo.faq_json`, `seo.related_collections`, `custom.seo_text`, `custom.underrubrik`, `custom.dynamisk_produkt_serier`. **Page metafields:** `custom.reservdelar` only.

## 4. Existing metaobjects (live)

Only Shopify's standard taxonomy value objects (`shopify--*`) plus five app/legacy types with no meaningful data: `passar_till_el_scooter` (0), `klassificering` (0), `relaterade_produkter` (0), `faq` (1), `fragor_svar` (0), `seoon-llm-ai-search` (1). **No payload, mission, platform, specification or package metaobjects exist.** The `dji_drone_model` metaobject in the architecture docs was never created.

## 5. Existing collections (147 total)

Enterprise/payload-relevant collections and how they are populated:

| Handle | Products | Rule basis | Note |
|---|---|---|---|
| `enterprise-sensors` | 65 | TITLE contains Zenmuse/LiDAR, TAG `LiDAR`/`Sensorer`, TYPE `Enterprise Payload` | Catches Zenmuse spare parts and cables as "sensors" |
| `enterprise-speaker-systems` | 27 | TITLE contains speaker/högtalare/megaphone | Catches consumer Bluetooth speakers |
| `enterprise-lighting` | **0** | GL60 AND AL1 AND type (conjunctive rule bug) | Broken rule |
| `enterprise-lifting-systems` | 14 | TITLE parachute/winch/lyft | |
| `enterprise-accessories` | 24 | TYPE = Enterprise Tillbehör AND tag enterprise | |
| `enterprise-drone-accessories` | 87 | TYPE/TAG variants | Overlaps previous |
| `all-products-enterprise` | 120 | 8 product types | Umbrella |
| `dji-matrice-series` / `dji-matrice-400-series` / `dji-matrice-300-rtk` / `dji-matrice-3d` / `dji-matrice-3td` | 176 / 42 / 9 / 3 / 3 | TITLE/TAG strings | Platform pages |
| `fits-dji-matrice-400` / `fits-dji-matrice-4d` | 21 / 11 | `custom.passsar_till` metafield | Only two metafield-driven collections |
| `inspection-drones` / `agriculture-drones` / `forestry-drones` / `mapping-survey-drones` / `energy-infrastructure` | 8 / 41 / 7 / **0** / 2 | TITLE/TAG | Linked from the Enterprise menu as "Industry Solutions" |
| `thermal-drones`, `thermal-cameras`, `zenmuse-h30`, `zenmuse-l2`, `zenmuse-p1`, `matrice-400`, `matrice-4`, `dji-dock`, `enterprise-packages` | — | — | **Do not exist**, but are linked from the live Enterprise menu and `page.enterprise.json` (404s) |

## 6. Navigation (live menus)

- `main-menu` ("Main menu Privat"): Consumer Drones / Accessories / Spare Parts.
- `enterprise`: Enterprise Overview, DJI Matrice, Mavic Enterprise, DJI Agras, FlyCart, DJI Dock, Industry Solutions (6 collections), Payloads & Sensors (5 collections incl. the missing `thermal-drones`), Enterprise Software.
- `business`: Industries (10 `/pages/industry-*`, 5 unpublished) + Services (8 pages, all unpublished).
- `service-support`, `spare-parts`, `footer`, `meny`.
- The header section (`sections/header.liquid`) supports two menus (`menu_consumer`, `menu_enterprise`) with a segment switch; `theme/config/edp-enterprise-menu.json` documents an `enterprise-menu` handle that does not exist live.

There is no PAYLOADS / SOLUTIONS / SERVICES top-level structure yet; payload navigation is a sub-item of Enterprise.

## 7. Search & Discovery

Cannot be read via the Admin API. From theme evidence: the Dawn collection grid has `enable_filtering: true` and the Horizon `main-collection` has a `filters` block, so whatever filters are configured in the Search & Discovery app render. The only filterable product metafields with storefront access today are `custom.passsar_till`, `custom.tillverkare`, `custom.kompatibla_dji_system`, `custom.c_klass`, `custom.bransch`. No sensor / resolution / zoom / LiDAR / weight filters can exist because no such fields exist. `docs/reports/DJI_FILTER_SETUP.md` describes filters on `dji.*` fields that are not defined.

## 8. Apps

`appInstallations` is not readable with the connector's scopes. Indirect evidence from metafield namespaces: **Search & Discovery** (`shopify--discovery--*`), **Google & YouTube** (`mm-google-shopping`), **Facebook** (`mc-facebook`), **Globo Filter** (`globo--filter--product_recommendation`, likely uninstalled), **EComposer** (`ecomposer`), **Prestify** (`prestify`, PrestaShop migration), **Smind size chart**, **Lookfy** (`lookfy.gallery_id`), **SEO On LLM AI search** metaobject. A product-reviews app owns `reviews.*`. No B2B quote app: quotes go through the theme's `enterprise-quote-form` (Shopify contact form, `contact[form_type]=enterprise_quote`) and the unpublished page `request-a-quote`.

## 9. Existing Liquid worth reusing

- `sections/enterprise-quote-form.liquid` — contact-form based quote request; extend with hidden product context fields instead of building a new form.
- `sections/enterprise-*` (hero, trust-bar, industries, platforms, matrice-models, docks, products, payloads, contact) — block-based marketing sections; keep for the Enterprise landing page.
- `snippets/edp-seo-faq.liquid`, `snippets/edp-seo-breadcrumbs.liquid`, `snippets/edp-structured-data.liquid`, `snippets/edp-ai-content.liquid` — SEO/JSON-LD; reuse on category and mission pages.
- `snippets/card-product-compatibility.liquid` — reads the non-existent `dji.compatible_models_display`; will be repointed.
- `assets/section-enterprise.css` — shared enterprise styles (`.edp-enterprise__*`).
- React SPA (`src/data/enterpriseCameraProducts.ts`, `enterprisePackages.ts`, `droneConfigurations.ts`) — hard-coded Zenmuse/package content; useful as **seed content** for missions and packages, but it is a second source of truth outside Shopify and links to actionking.se. Not touched in this project.

## 10. Potential conflicts

1. **Theme divergence** (Dawn repo vs Horizon live) — see §1. Full theme pushes are unsafe.
2. **Two compatibility models in flight:** `custom.passsar_till` (live, populated) vs `dji.*` (documented, defined nowhere). A third, `compat:` tags, is documented in `data/edp-product-tag-standards.json` but never applied.
3. **Broken enterprise-accessories template:** the "Passar till" line is a `text` block containing Liquid, which is not evaluated.
4. **404 links** in the live Enterprise menu and `page.enterprise.json` (`thermal-drones`, `zenmuse-h30`, `zenmuse-l2`, `zenmuse-p1`, `matrice-400`, `matrice-4`, `dji-dock`, `enterprise-packages`).
5. **Title-string smart collections** misclassify products (consumer speakers in "Enterprise speaker systems", Zenmuse cables in "Enterprise sensors").
6. **Metafield key typo** `passsar_till` is referenced by the two `fits-*` collections; renaming would break them, so it stays.
7. `data/edp-navigation-structure.json` is invalid JSON (legacy artefact).
8. Analytics: GA4 exists only in the React SPA; the Shopify theme has no event layer, so finder/configurator events must be added without duplicating page views.

## 11. Recommended architecture (implemented in Phase 2 onwards)

**Principle:** one new namespace, `edp`, for enterprise product metafields; six new metaobject types as the reusable entities; existing `custom.*`, `seo.*` and Search & Discovery fields are reused, never replaced.

| Entity | Shopify object | Purpose |
|---|---|---|
| Payload category (12) | metaobject `payload_category` | Dimension 1 top level; renders `/pages/payloads-<handle>` or a collection |
| Payload subcategory (≈100) | metaobject `payload_subcategory` | Dimension 1 second level, references parent |
| Mission (≈45) | metaobject `mission` | Dimension 2; renders mission pages; references recommended products |
| UAV platform (≈14) | metaobject `uav_platform` | Canonical airframes (DJI Matrice 400, Freefly Astro, …) with mount interface |
| Payload compatibility | metaobject `payload_compatibility` | One row per payload × platform with status (fully / adapter / integration / not / unknown), adapter product and source |
| Payload specification | metaobject `payload_specification` | Grouped technical sheet, referenced 1:1 from the product |
| Solution package (9) | metaobject `solution_package` | Mission bundle: UAV + payloads + accessories + software + training + service |
| Product classification / compatibility / technical / commercial / software | product metafields `edp.*` | Filterable, admin-editable per product; technical subset mirrors the spec for Search & Discovery filters |
| Data quality | product metafield `edp.data_quality_status` | Written by the catalog-health script |

Storefront: theme-agnostic `edp-payload-*` sections (own CSS), Horizon-compatible JSON templates, quote form extended with product context, finder/configurator/comparison as one lazily loaded script fed by JSON rendered from metaobjects. Navigation: new menus `payloads`, `solutions`, `services` built from the metaobjects, wired into the existing enterprise header.

## 12. Not modified in Phase 1

No products, collections, metafields, metaobjects, menus, pages or theme files were changed. The only writes were this report and the task list in the repo.
