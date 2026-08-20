# DJI Filter Setup (Shopify Search & Discovery)

**Date:** 2026-06-08  
**Prerequisite:** Metafield definitions + published products with `dji.*` values  
**Related:** [DJI_COMPATIBILITY_ENGINE.md](./DJI_COMPATIBILITY_ENGINE.md)

---

## Overview

Enable storefront filtering and collection sorting using DJI compatibility metafields published by `publish-sunsky-to-shopify`.

**Supported use cases:**

| Feature | Metafields / tags used |
|---------|------------------------|
| Search & Discovery filters | `dji.compatible_models_display`, `dji.series`, `dji.accessory_type` |
| Smart collections | `dji.compatible_models` |
| Internal admin search | `supplier_normalized.dji_compatibility` (Supabase) |
| Product tags (fallback) | `dji:mini-4-pro`, `part:propeller` |

---

## Step 1 — Create metafield definitions

**Shopify Admin:** Settings → Custom data → Products → Add definition

| Name | Namespace & key | Type | Storefront access |
|------|-----------------|------|-------------------|
| Compatible models (canonical) | `dji.compatible_models` | List · Single line text | ✅ Filterable |
| Compatible models (display) | `dji.compatible_models_display` | List · Single line text | ✅ Filterable |
| DJI series | `dji.series` | List · Single line text | ✅ Filterable |
| Accessory type | `dji.accessory_type` | Single line text | ✅ Filterable |
| Option list role | `dji.option_list_role` | Single line text | Optional (internal) |
| Extraction confidence | `dji.confidence` | Single line text | Optional (internal) |

**Canonical ID examples** (`compatible_models`):

```
dji_mini_4_pro
dji_air_3
dji_avata_2
dji_matrice
```

**Display examples** (`compatible_models_display`):

```
DJI Mini 4 Pro
DJI Air 3
DJI Avata 2
```

**Series values** (`series`):

| Value | Meaning |
|-------|---------|
| `dji_consumer_mini` | Neo, Flip, Mini line |
| `dji_consumer_air` | Air 3 / Air 3S |
| `dji_consumer_mavic` | Mavic line |
| `dji_fpv` | Avata / FPV |
| `dji_enterprise` | Matrice, Inspire |
| `dji_legacy` | Phantom, etc. |

**Accessory type values** (`accessory_type`):

`propeller`, `battery`, `charger_hub`, `nd_filter`, `gimbal`, `remote_controller`, `goggles`, `case`, `spare_part`, `camera_lens`, `propeller_guard`

---

## Step 2 — Enable Search & Discovery filters

**Shopify Admin:** Online Store → Search & Discovery → Filters → Add filter

Recommended filter order for EuroDroneParts DJI category:

| # | Filter label (SV) | Source | Notes |
|---|-------------------|--------|-------|
| 1 | Passar till | `dji.compatible_models_display` | Primary shopper filter |
| 2 | Produktserie | `dji.series` | Mini / Air / Mavic / FPV / Enterprise |
| 3 | Deltyp | `dji.accessory_type` | Propeller, battery, etc. |
| 4 | Availability | Shopify default | Stock |
| 5 | Price | Shopify default | |

**Swedish storefront labels:**

| Key | Suggested label |
|-----|-----------------|
| `compatible_models_display` | Passar till |
| `series` | DJI-serie |
| `accessory_type` | Deltyp |

---

## Step 3 — Verify after first publish

1. Publish one Sunsky DJI SKU via `publish-sunsky-to-shopify`.
2. In Shopify Admin → Products → open product → Metafields → confirm `dji.*` populated.
3. Search & Discovery → Filters → confirm values appear in preview.
4. On storefront collection, confirm filter chips render.

**GraphQL check (optional):**

```graphql
query {
  product(id: "gid://shopify/Product/...") {
    metafields(namespace: "dji", first: 10) {
      edges { node { key value type } }
    }
  }
}
```

---

## Step 4 — Theme / collection templates

Theme is wired for DJI filters in `theme/templates/collection.json`:

- `enable_filtering: true` — Dawn facets render `collection.filters` from Search & Discovery
- `filter_type: vertical` — recommended layout for Passar till / DJI-serie / Deltyp
- `show_compatibility: true` — product cards show *Passar till* from `dji.compatible_models_display`

**Automate metafield definitions:**

```bash
node scripts/setup-dji-storefront-filters.mjs --execute
```

**Optional enhancements:**

- Show compatibility under product title from `product.metafields.dji.compatible_models_display` (enabled on collection grid).
- Breadcrumb: *DJI Parts → Mini 4 Pro → Propellers* using `dji.series` + collection.

Example Liquid:

```liquid
{% assign models = product.metafields.dji.compatible_models_display.value %}
{% if models != blank %}
  <p class="compatibility">
    Passar till:
    {% for m in models %}{{ m }}{% unless forloop.last %}, {% endunless %}{% endfor %}
  </p>
{% endif %}
```

---

## Internal search (Supabase / ai-search)

Products store full compatibility at import:

```json
pages.supplier_normalized.dji_compatibility
inventory.supplier_metadata.dji_compatibility
```

**Index fields to add** (when wiring `ai-search`):

| Field | Source |
|-------|--------|
| `compatible_models_display` | Join array as text |
| `compatible_model_ids` | Exact match boost |
| `accessory_type` | Facet |
| `search_tags` | Tag array (`dji:mini-4-pro`, …) |

**Query example:** *"propeller mini 4 pro"* → boost `accessory_type:propeller` AND `dji_mini_4_pro` in model ids.

---

## SEO integration

Published products include:

1. **HTML block** in `descriptionHtml` (`ai-compatibility` section).
2. **`seo_compatibility_text`** in normalized record for `generate-seo`:

```json
{
  "compatibility": "Passar till: DJI Mini 4 Pro, DJI Air 3."
}
```

Pass this in the `bodyText` JSON payload when calling `generate-seo` for body text generation.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `metafieldsSet` errors | Definitions missing | Create definitions (Step 1) |
| Filters empty | No products published yet | Publish DJI SKUs |
| Wrong models | Kit-picker optionList | Expected — see engine doc |
| Product in wrong collection | Title-only detection | Review `compatible_model_ids` in Supabase |
| Flip on Ronin product | False positive | Engine excludes `flip axis` — re-import |

---

## Implementation effort (ops)

| Task | Time |
|------|------|
| Create 4–6 metafield definitions | 15 min |
| Configure 3 storefront filters | 15 min |
| Smoke test 3 products | 15 min |
| Theme compatibility line (optional) | 30 min |
| ai-search index wiring | 4 h (dev) |

**Total ops setup:** ~45 min  
**Total dev (internal search):** ~0.5 day
