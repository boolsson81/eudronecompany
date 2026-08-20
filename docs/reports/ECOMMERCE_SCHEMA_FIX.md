# Ecommerce Schema Fix — Ghost Table References

**Date:** 2026-06-07  
**Issue:** Application code queried three tables that were never created in migrations: `shopify_variants`, `shopify_images`, `shopify_collections`.

**Resolution:** Point all consumers at existing schema (`shopify_products` JSONB columns and `product_type_collections`). No new tables created.

---

## Root Cause

The Jan 2026 `shopify_products` migration denormalized variants and images into JSONB columns (`variants`, `images`) on a single feed-cache table. Feed generators and IA analysis were written against a **normalized** design (`shopify_variants`, `shopify_images`, `shopify_collections`) that was abandoned before migrations shipped.

| Ghost table | Intended role | Actual storage |
|-------------|---------------|----------------|
| `shopify_variants` | Per-variant SKU/price/stock rows | `shopify_products.variants` JSONB |
| `shopify_images` | Per-product image rows | `shopify_products.images` JSONB + `image_url` |
| `shopify_collections` | Shopify collection cache | `product_type_collections` (+ `product_type_collection_items`) |

---

## Files Changed

| File | Change |
|------|--------|
| `supabase/functions/_shared/shopify-product-feed.ts` | **New** — shared parsers and enricher |
| `supabase/functions/prisjakt-api/index.ts` | Remove ghost table queries; use JSONB |
| `supabase/functions/pricerunner-feed/index.ts` | Remove PostgREST nested joins; use JSONB |
| `supabase/functions/pricerunner-api/index.ts` | Related fix: `body_html` → `description` + JSONB variants/images |
| `supabase/functions/ia-analysis/index.ts` | `shopify_collections` → `product_type_collections` with fallbacks |

---

## Query-by-Query Fix Details

### 1. `prisjakt-api` — `shopify_variants`

**Before** (`generateProductFeed`, lines ~143–146):

```typescript
const { data: variants } = await supabase
  .from("shopify_variants")
  .select("id, product_id, price, compare_at_price, sku, barcode, inventory_quantity, title")
  .in("product_id", productIds);
```

**Correct source:** `shopify_products.variants` JSONB column on the same row as the product.

**After:** Single query selects `variants` (and related columns) from `shopify_products`. `enrichProductsForFeed()` parses the JSONB array.

**Fallback handling:**
- If `variants` JSONB is empty/null but top-level `sku`/`price` exist → synthesize one “Default Title” variant from denormalized columns.
- If no variants at all → product omitted from feed (existing `variants.length === 0` guard).

---

### 2. `prisjakt-api` — `shopify_images`

**Before** (lines ~149–152):

```typescript
const { data: images } = await supabase
  .from("shopify_images")
  .select("product_id, src, alt, position")
  .in("product_id", productIds);
```

**Correct source:** `shopify_products.images` JSONB column.

**After:** Parsed by `parseProductImages()` in the shared helper.

**Fallback handling:**
- If `images` JSONB is empty → use `shopify_products.image_url` as a single image at `position: 1`.
- If no image at all → feed emits empty `<image_url>` (existing behavior).

**Additional fix:** Select used non-existent column `body_html`. Replaced with `description` (actual column name); enricher sets `body_html` alias for feed templates.

---

### 3. `pricerunner-feed` — `shopify_variants` (nested join)

**Before** (lines ~72–80):

```typescript
.select(`
  ...
  variants:shopify_variants(id, price, compare_at_price, sku, barcode, inventory_quantity, title),
  ...
`)
```

**Correct source:** `shopify_products.variants` JSONB — PostgREST cannot join to a table that does not exist.

**After:** Flat select via `SHOPIFY_PRODUCT_FEED_SELECT`; `enrichProductsForFeed()` attaches parsed variants.

**Fallback handling:** Same single-variant synthesis from top-level columns as Prisjakt.

---

### 4. `pricerunner-feed` — `shopify_images` (nested join)

**Before** (line ~81):

```typescript
images:shopify_images(src, alt, position)
```

**Correct source:** `shopify_products.images` JSONB.

**After:** Parsed in shared helper; `image_url` fallback.

**Additional fix:** `body_html` in select → `description`.

---

### 5. `ia-analysis` — `shopify_collections`

**Before** (lines ~26–30):

```typescript
const { data: collections } = await supabase
  .from('shopify_collections')
  .select('id, handle, title, products_count')
  .eq('shop_id', shop_id);
```

**Correct source:** `product_type_collections` — the app's curated assortment collections table (exists since Feb 2026).

| Expected field | Mapped from |
|----------------|-------------|
| `id` | `product_type_collections.id` |
| `handle` | `slugify(product_type + '-' + name)` |
| `title` | `product_type_collections.name` |
| `products_count` | `shopify_products_count` or counted `product_type_collection_items` |

**Fallback chain (in order):**

1. **`product_type_collections`** with `shopify_products_count` when set.
2. **Item counts** from `product_type_collection_items` when `shopify_products_count` is null/0.
3. **Virtual collections** from distinct `product_type` values on `shopify_products`, then `products` table if feed cache is empty.

**Products fallback (added):** If `shopify_products` returns no rows, IA analysis falls back to `products` (the table `shopify-sync` actually writes to).

---

### 6. `pricerunner-api` — related schema mismatch (no ghost tables)

Not a ghost-table query, but the same feed generator pattern was broken:

- Selected `body_html` (column does not exist on `shopify_products`).
- Expected `product.variants` / `product.images` without fetching JSONB columns.

Fixed using the same shared helper as Prisjakt/PriceRunner feed.

---

## New Shared Module

**File:** `supabase/functions/_shared/shopify-product-feed.ts`

| Export | Purpose |
|--------|---------|
| `SHOPIFY_PRODUCT_FEED_SELECT` | Canonical column list for feed queries |
| `parseProductVariants()` | JSONB → normalized variant array |
| `parseProductImages()` | JSONB → normalized image array |
| `productDescription()` | `description` with `body_html` alias fallback |
| `enrichProductForFeed()` | Attach variants, images, body_html to one row |
| `enrichProductsForFeed()` | Batch enricher |

**Variant JSON shapes supported:**

```json
// REST-style
{ "id": "123", "sku": "AK-1", "price": "99.00", "compare_at_price": null, "inventory_quantity": 5, "title": "Default Title" }

// GraphQL-style (camelCase tolerated)
{ "compareAtPrice": "129.00", "inventoryQuantity": 3 }
```

**Image JSON shapes supported:**

```json
{ "src": "https://...", "alt": "...", "position": 1 }
{ "url": "https://...", "altText": "..." }
```

---

## What Was NOT Changed

| Item | Reason |
|------|--------|
| No new `shopify_variants` / `shopify_images` / `shopify_collections` tables | JSONB denormalization is the canonical design |
| `shopify-sync` still writes to `products` only | Out of scope — separate population task (`SHOPIFY_PRODUCTS_TABLE_REVIEW.md`) |
| `price-comparison-feed` | Already uses flat `shopify_products` columns correctly |
| `mem/features/intelligence-engine/ia-and-ai-search-visibility.md` | Documentation only; code is fixed |

---

## Verification Checklist

- [ ] Deploy updated Edge Functions: `prisjakt-api`, `pricerunner-feed`, `pricerunner-api`, `ia-analysis`
- [ ] `pricerunner-feed?shop_id={id}` returns XML without PostgREST join errors
- [ ] `prisjakt-api` action `generate-feed` completes without querying missing tables
- [ ] `ia-analysis` returns non-zero `total_collections` when `product_type_collections` has rows
- [ ] Feed rows appear when `shopify_products.variants` JSONB is populated OR top-level `sku`+`price` exist
- [ ] Primary image appears when only `image_url` is set (no `images` JSONB)

**Note:** Feeds will still be empty if `shopify_products` has zero rows for a shop. This fix removes schema errors; populating the feed cache remains a separate work item.

---

## Summary

| Ghost query | Occurrences | Replacement |
|-------------|-------------|-------------|
| `shopify_variants` | 2 files (3 queries) | `shopify_products.variants` JSONB |
| `shopify_images` | 2 files (3 queries) | `shopify_products.images` JSONB + `image_url` |
| `shopify_collections` | 1 file (1 query) | `product_type_collections` + fallbacks |

All runtime references to non-existent tables are removed from `supabase/functions/`.
