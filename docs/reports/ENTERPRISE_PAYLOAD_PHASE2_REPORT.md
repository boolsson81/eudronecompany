# Enterprise Payload Architecture — Phase 2 Report

**Date:** 2026-09-15/16
**Scope:** Data architecture — metaobject definitions, product metafield definitions, and the payload/mission/platform/package taxonomy. Applied directly to the live store (`ya1xhg-x6.myshopify.com`) via the Shopify Admin GraphQL API, per the Phase 1 audit's recommended architecture.

## CREATED

**Metaobject definitions (7 new types, all `storefront: PUBLIC_READ`):**

| Type | Purpose | Key fields |
|---|---|---|
| `uav_platform` | Canonical UAV airframes | name, manufacturer, series, mount_interface, legacy_fits_value, product, collection, active |
| `payload_category` | Dimension 1, top level (12 seeded) | name/name_en, priority, technology, short_description, typical_customers, seo_title/description, active. `onlineStore` capability with `urlHandle: payloads` |
| `payload_subcategory` | Dimension 1, second level (96 seeded) | name/name_en, parent_category (ref), typical_use_cases, key_specifications, recommended_missions, products, active |
| `mission` | Dimension 2 (44 seeded) | name/name_en, industry, problem_statement, tasks/technologies/environments (finder keys), recommended_uav_types/payloads/accessories/software/services, solution_packages, faq, active. `onlineStore` capability with `urlHandle: missions` |
| `payload_compatibility` | One row per payload × platform | payload_product, platform (ref), status (`fully_compatible` / `compatible_with_adapter` / `compatible_with_integration` / `not_compatible` / `unknown`), adapter_product, notes, source, verified_at |
| `payload_specification` | Grouped technical spec sheet, 1:1 per product | sensor_type, resolutions, zoom, LRF, LiDAR range/accuracy/points-per-second, gimbal, weight, IP rating, interfaces, sdk/rtsp/ethernet/serial |
| `solution_package` | Mission bundle (9 seeded) | name/name_en, mission (ref), uav/payload/accessory/software/training/service products, components_summary, estimated_price_note. `onlineStore` capability with `urlHandle: solutions` |

`mission` and `solution_package` reference each other; the cycle was broken by creating `mission` first without `solution_packages`, creating `solution_package` against it, then patching `mission` with the `solution_packages` field via `metaobjectDefinitionUpdate`.

**Product metafield definitions — 41 fields, namespace `edp`, all `storefront: PUBLIC_READ` except the two data-quality fields (`NONE`, internal only):**

- Classification (5): `payload_category`, `payload_subcategory`, `mission_types`, `industry`, `customer_segment`
- Compatibility (6): `compatible_uav`, `compatibility_records`, `compatible_mount`, `compatible_battery`, `compatible_controller`, `specification`
- Technical (10): `sensor_type`, `sensor_resolution`, `thermal_resolution`, `optical_zoom`, `digital_zoom`, `laser_rangefinder`, `lidar_range`, `accuracy`, `weight`, `ip_rating`, plus `operating_temperature`
- Commercial (10): `enterprise_product`, `professional_grade`, `mission_critical`, `requires_quote`, `lead_time`, `demo_available`, `training_available`, `installation_available`, `integration_available`, `service_available`
- Software (4): `software_required`, `software_compatible`, `sdk_available`, `api_available`
- Bundling (3): `recommended_accessories`, `required_accessories`, `solution_packages`
- Data quality (2, internal): `data_quality_status`, `data_quality_notes` — written only by the Phase 7 catalog-health script

`compatible_platform` and `compatible_gimbal` from the original spec were folded into `compatible_uav` (metaobject reference to `uav_platform`, which already carries mount interface) and `compatible_mount` respectively, to avoid three overlapping free-text fields saying the same thing.

**Taxonomy seeded as metaobjects** (source of truth: `data/edp-payload-taxonomy.json`, version-controlled):

| Entity | Count | Verified live |
|---|---|---|
| Payload categories | 12 | ✅ paginated list, 12 unique handles |
| Payload subcategories | 96 | ✅ paginated list, 96 unique handles |
| Missions | 44 | ✅ paginated list, 44 unique handles |
| UAV platforms | 16 | ✅ paginated list, 16 unique handles |
| Solution packages | 9 | ✅ paginated list, 9 unique handles, each linked to its mission and back-linked from `mission.solution_packages` |

Every mission carries `industry`, `problem_statement`, `tasks`, `technologies`, `environments` — the exact vocabulary the Phase 4 Payload Finder will match against. Every category carries a `technology` finder key and `short_description`. No specifications, prices, or compatibility claims were seeded on individual products in this phase — data quality rule 29 ("never invent") means those stay `Not specified` until real supplier data is entered per SKU.

**New files:**

- `data/edp-payload-taxonomy.json` — the versioned source of the whole taxonomy (12 categories/96 subcategories/8 finder mission-groups/44 missions/16 platforms/9 packages/finder vocabulary and scoring weights).
- `scripts/setup-enterprise-payload-architecture.mjs` — idempotent Node script that reproduces this phase from the taxonomy file (definitions are create-if-missing; metaobjects are handle-based upserts). Not run in this session — this session applied the same operations directly via the Shopify Admin GraphQL connector because no local Admin token/Supabase credentials are present in this sandbox (see `scripts/lib/shopify-admin-client.mjs`). The script exists so the team can re-run or extend the taxonomy from a machine that has those credentials, and so a future edit to the taxonomy JSON has a real apply path.
- `docs/reports/ENTERPRISE_PAYLOAD_PHASE1_AUDIT.md` — Phase 1 audit (previous report).

## MODIFIED

Nothing existing was modified. All 6 new metaobject types and all 41 `edp.*` metafields are additive; none collide with existing namespaces (`custom.*`, `seo.*`, `dji.*` placeholders, `shopify.*`) identified in the Phase 1 audit.

## NOT MODIFIED

- No products were classified with the new `edp.*` fields yet (Phase 3+ / catalog population, out of scope for "don't overbuild").
- `custom.passsar_till`, `custom.kompatibla_dji_system`, `custom.tillverkare` and the other reusable `custom.*`/`seo.*` fields — left as-is, to be read alongside the new fields rather than replaced.
- No collections, pages, menus, or theme files were touched.
- The broken `product.enterprise-accessories.json` compatibility block and the 404 links in the live Enterprise menu (Phase 1 findings) — untouched, flagged for Phase 3.

## DATA MODEL (current)

```
payload_category (12)
 └─ payload_subcategory (96, parent_category → payload_category)

mission (44, industry/tasks/technologies/environments = finder vocabulary)
 └─ solution_package (9, mission → mission)  [back-referenced from mission.solution_packages]

uav_platform (16)
 └─ referenced by: payload_compatibility.platform, mission.recommended_uav_types,
                    product metafield edp.compatible_uav

payload_compatibility (0 rows yet — created per product as real compatibility data is confirmed)
payload_specification (0 rows yet — created per product as real specs are entered)

Product (edp.* metafields, 41 fields)
 ├─ edp.payload_category → payload_category
 ├─ edp.payload_subcategory → payload_subcategory (list)
 ├─ edp.mission_types → mission (list)
 ├─ edp.compatible_uav → uav_platform (list)
 ├─ edp.compatibility_records → payload_compatibility (list)
 ├─ edp.specification → payload_specification
 └─ edp.solution_packages → solution_package (list)
```

## TEST RESULTS

- Every `metaobjectDefinitionCreate`/`metafieldDefinitionCreate`/`metaobjectUpsert` call returned an empty `userErrors` array; none were skipped or silently failed.
- Post-hoc verification: paginated `metaobjects(type: …)` listings for all 5 seeded types return exactly the expected counts with no duplicate handles (12/96/44/16/9).
- `metafieldDefinitions(namespace: "edp")` returns all 41 expected keys.
- `node --check scripts/setup-enterprise-payload-architecture.mjs` passes (syntax only — not executed against the live store in this session; no local credentials available).
- `data/edp-payload-taxonomy.json` parses as valid JSON and its category/subcategory/mission counts match the live store (verified with a local Node script before seeding).

## ISSUES

- Shopify's `metaobjectDefinitionByType.metaobjectsCount` field lagged behind the true count during this session (e.g. reported 1 for `payload_category` right after 12 were created). This is a read-side cache/indexing delay in the Admin API, not a data problem — the direct paginated `metaobjects(...)` query is authoritative and confirms all counts.
- `payload_compatibility` and `payload_specification` have zero rows by design: creating them requires real, verifiable product data (rule 29), which is a per-product task for the catalog team, not part of the architecture build.
- The provisioning script cannot be executed from this sandbox (no `SHOPIFY_ADMIN_ACCESS_TOKEN` / Supabase service-role key present); it is provided for the team's own environment.

## NEXT STEP

Phase 3: storefront Liquid — a payload category page template, a mission page template, product-page enhancements (compatibility panel, enterprise CTAs), and navigation wired to the new `payload_category`/`mission` metaobjects. Built as self-contained sections (see Phase 1 finding: the live theme is Horizon-based, not Dawn, so new sections must not depend on Dawn's `component-*.css` or assume `main-product`).
