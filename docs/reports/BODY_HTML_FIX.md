# Body HTML / Description Field Fix

**Date:** 2026-06-07  
**Issue:** Ecommerce code queried or stored `body_html` on tables that use `description`, causing empty product descriptions in feeds and broken DB selects.

**Convention applied:**

| Layer | Field name |
|-------|------------|
| **Database** (`shopify_products`, `product_market_translations`, cloner `transformed_payload`) | `description` |
| **Shopify REST Admin API** (product/collection create/update) | `body_html` |
| **Shopify GraphQL Admin API** | `descriptionHtml` |
| **Internal tables with their own schema** (`seo_targets`, `shopify_content_pages`, training lessons) | `body_html` unchanged |

---

## Root Cause

The `shopify_products` feed-cache table was created with a `description TEXT` column (migration `20260111175813`). Several feed functions and consumers were written against Shopify’s REST field name `body_html` as if it were a database column. PostgREST silently omitted the non-existent column, so descriptions were always empty in generated feeds.

The `products` catalog table (written by `shopify-sync`) never had `body_html` or `description` — only `meta_description` — yet `ai-search` selected `body_html` and `variants` from it.

---

## Shared Helpers

**File:** `supabase/functions/_shared/shopify-product-feed.ts`

| Function | Purpose |
|----------|---------|
| `productDescription(row)` | Read HTML from `row.description`, fallback to `title` |
| `plainProductDescription(row)` | Strip HTML for XML/CSV feed text fields |
| `toShopifyBodyHtml(transformed, sourceHtml?)` | Map DB/transform `description` → Shopify REST `body_html` at publish time |
| `SHOPIFY_PRODUCT_FEED_SELECT` | Includes `description` (not `body_html`) |

**Publish rule:** Read `description` from storage; write `body_html` only in the outbound Shopify REST JSON body.

---

## Changes by File

### Feed generators (DB read fix)

| File | Before | After |
|------|--------|-------|
| `prisjakt-api/index.ts` | Selected `body_html`; stripped `product.body_html` | Selects `description` via `SHOPIFY_PRODUCT_FEED_SELECT`; uses `plainProductDescription()` |
| `pricerunner-feed/index.ts` | PostgREST select included `body_html` | Same as Prisjakt |
| `pricerunner-api/index.ts` | Selected `body_html`; feed logic read `product.body_html` | Same as Prisjakt |

`price-comparison-feed` was already correct (`description` column).

### Clone pipeline (transform + publish)

| File | Change |
|------|--------|
| `shopify-cloner-transform/index.ts` | AI tool schema field renamed `body_html` → `description`. Legacy `body_html` from AI normalized to `description`. GEO/AEO blocks injected into `description`. |
| `shopify-cloner-publish/index.ts` | All REST payloads use `body_html: toShopifyBodyHtml(t, src.descriptionHtml)` (products/collections) or `toShopifyBodyHtml(t, src.body)` (pages/articles). Reads `t.description` first, falls back to legacy `t.body_html`. |

`shopify-drone-clone` already maps GraphQL `descriptionHtml` → REST `body_html` at publish (correct; no DB involved).

### AI search context

| File | Change |
|------|--------|
| `ai-search/index.ts` | Primary: `shopify_products` with `description`. Fallback: `products` with `meta_description` mapped to `description`. Removed invalid `body_html` and `variants` selects on `products`. |

### Google Merchant Center

| File | Change |
|------|--------|
| `google-merchant-sync/index.ts` | `transformProduct()` uses `product.description \|\| product.meta_description` (removed `body_html`). After loading `products`, enriches rows with `shopify_products.description` by `shopify_id`. Shopify translation key `body_html` kept when reading **from Shopify API** (line ~1592). |

### Frontend CSV importer

| File | Change |
|------|--------|
| `CsvProductImporter.tsx` | Internal model field `body_html` → `description`. CSV export still writes Shopify “Body (HTML)” column using `product.description`. |

---

## Data Flow (After Fix)

```
Shopify store (descriptionHtml / body_html)
        │
        ▼ sync (intended: shopify_products.description)
┌─────────────────────┐
│  shopify_products   │  description TEXT
│  products           │  meta_description only (catalog)
└─────────────────────┘
        │
        ├─► Feed APIs read `description` → plain text in XML/CSV
        │
        ├─► ia-analysis / intelligence-engine-daily (already used description)
        │
        ├─► google-merchant-sync enriches products.description from shopify_products
        │
        └─► Clone transform stores `description` in transformed_payload
                    │
                    ▼ shopify-cloner-publish
              REST { body_html: "..." }  → Target Shopify store
```

---

## Intentionally Unchanged

These use `body_html` on tables or APIs where that name is correct:

| Area | Reason |
|------|--------|
| `seo_targets.body_html` | SEO Wizard internal storage column |
| `seo-wizard-sync` / `seo-wizard-publish` | Shopify REST in/out + `seo_targets` |
| `shopify_content_pages.body_html` | CMS pages table schema |
| `sync-shopify-pages` | Reads `body_html` from Shopify REST API responses |
| `shopify-product-seo` | Reads/writes Shopify REST `body_html` |
| `shopify-strip-invalid-product-jsonld` | Cleans live Shopify REST resources |
| `bulk-translate-content` | Handles both Shopify translation keys `body_html` and `description` |
| Training portal / lessons | `training_lessons.body_html` column |
| `publish-sunsky-to-shopify` | Already uses `descriptionHtml` for GraphQL publish |

---

## Field Mapping Reference

| Source | DB / internal field | Shopify publish field |
|--------|---------------------|----------------------|
| `shopify_products` row | `description` | REST `body_html` or GraphQL `descriptionHtml` |
| Cloner `transformed_payload` | `description` | REST `body_html` via `toShopifyBodyHtml()` |
| Cloner `source_payload` (scan) | `descriptionHtml` (GraphQL) | REST `body_html` (fallback when no transform) |
| `products` catalog row | `meta_description` (short text only) | N/A — use `shopify_products.description` for full HTML |
| `product_market_translations` | `description` | Merchant Center / translated feeds |
| `seo_targets` | `body_html` | GraphQL `descriptionHtml` via SEO Wizard publish |

---

## Verification Checklist

- [ ] Deploy: `prisjakt-api`, `pricerunner-feed`, `pricerunner-api`, `shopify-cloner-transform`, `shopify-cloner-publish`, `ai-search`, `google-merchant-sync`
- [ ] Populate `shopify_products.description` for a test shop (or run future sync feed action)
- [ ] `pricerunner-feed?shop_id=…` — `<description>` nodes contain stripped text, not empty
- [ ] Clone with transform enabled — target product body matches transformed `description`
- [ ] Clone without transform — target product body matches source `descriptionHtml`
- [ ] `ai-search` with `shopId` — no PostgREST column errors in logs
- [ ] Merchant Center sync — product descriptions use `shopify_products.description` when present

---

## Related Documents

- `ECOMMERCE_SCHEMA_FIX.md` — ghost table (`shopify_variants` / `shopify_images`) fixes
- `SHOPIFY_PRODUCTS_TABLE_REVIEW.md` — `shopify_products` population gap (descriptions still empty if table not synced)
