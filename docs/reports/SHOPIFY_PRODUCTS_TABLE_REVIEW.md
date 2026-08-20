# `shopify_products` Table Review

**Date:** 2026-06-07  
**Table:** `public.shopify_products`  
**Created:** `supabase/migrations/20260111175813_707f50ad-684b-454f-ab28-151cb2c1a715.sql`

---

## Executive Summary

`shopify_products` was designed as a **rich, denormalized product feed cache** for price-comparison exports (Prisjakt, PriceRunner, Google Shopping) and downstream features that need SKU-level pricing, barcodes, and variant JSON in one row.

**It is never written to by any application code.** The main Shopify sync (`shopify-sync` → `sync-products`) writes to the separate `products` table instead. Multiple consumers read `shopify_products` and receive **empty results**, with partial fallbacks elsewhere.

**Recommendation:** **Yes, it should be populated** — either by extending `shopify-sync` or a dedicated feed-sync function — **or** consumers should be migrated off it. Leaving the table empty while code depends on it is an active production defect for price-comparison feeds and several intelligence features.

---

## Table Schema

```sql
CREATE TABLE public.shopify_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  shopify_id TEXT NOT NULL,
  title TEXT NOT NULL,
  handle TEXT,
  description TEXT,
  vendor TEXT,
  product_type TEXT,
  sku TEXT,                    -- top-level SKU (typically default variant)
  barcode TEXT,
  price NUMERIC(10,2),
  compare_at_price NUMERIC(10,2),
  cost_price NUMERIC(10,2),
  inventory_quantity INTEGER DEFAULT 0,
  weight NUMERIC(10,2),
  weight_unit TEXT DEFAULT 'kg',
  status TEXT DEFAULT 'active',
  tags TEXT[],
  image_url TEXT,
  images JSONB DEFAULT '[]',   -- gallery
  variants JSONB DEFAULT '[]', -- full variant array
  options JSONB DEFAULT '[]',
  metafields JSONB DEFAULT '{}',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(shop_id, shopify_id)
);
```

**Indexes:** `shop_id`, `sku`, `status`  
**RLS:** `has_shop_access(auth.uid(), shop_id)` (fixed May 2026; original policies incorrectly used `tenant_id = auth.uid()`)

---

## Why It Exists

### Stated purpose (migration comment)

> *"Create shopify_products table for product feed"*

Created alongside `shops.currency` in January 2026 to support **external product feeds** that need more than the analytics-oriented `products` table provides.

### Design intent vs other product tables

DigitalSignal maintains **four parallel product representations**:

| Table | Purpose | Richness | Writer |
|-------|---------|----------|--------|
| **`inventory`** | Operational stock (FTP/Sunsky import, warehouse) | SKU, cost, location, duty | `ftp-import`, `publish-inventory-to-shopify` |
| **`products`** | Analytics mirror (dashboards, ads, SEO targets) | Summary only — no variant JSON, no SKU | `shopify-sync` `sync-products` ✅ |
| **`pages`** | SEO editor registry | Content, meta, handles | `sync-shopify-pages`, app webhooks |
| **`shopify_products`** | **Feed/export cache** | Full feed fields + JSONB variants/images/metafields | **None** ❌ |

`shopify_products` fills the gap between:
- `products` (too thin: no `sku`, `barcode`, `description`, `variants`, `metafields`, `cost_price`)
- Live Shopify API (too slow for batch XML feed generation at crawl time)

It is the **intended source of truth for price-comparison XML/CSV feeds** and features that need per-SKU catalog data without hitting Shopify on every request.

### Abandoned normalization design

`prisjakt-api` and `pricerunner-feed` reference separate tables `shopify_variants` and `shopify_images` that **do not exist** in migrations or `types.ts`. The JSONB columns on `shopify_products` (`variants`, `images`) suggest the design pivoted to denormalized JSONB, but **feed generators were not fully updated**.

---

## Why It Is Not Populated

### Root cause: sync writes to the wrong table

`shopify-sync` action `sync-products` (`supabase/functions/shopify-sync/index.ts`, ~line 1347) upserts into **`products`**, not `shopify_products`:

```typescript
const { error: upsertError } = await supabase
  .from('products')
  .upsert(rows, { onConflict: 'shop_id,shopify_id' });
```

The GraphQL query in `syncAllProducts` fetches rich Shopify data but **maps it to the slim `products` schema** — dropping SKU, barcode, description, variants, metafields, and cost.

### No writer exists anywhere

Exhaustive codebase search found:

| Operation | Count |
|-----------|-------|
| `INSERT` / `UPSERT` / `UPDATE` into `shopify_products` in Edge Functions | **0** |
| `INSERT` / `UPSERT` / `UPDATE` into `shopify_products` in `src/` | **0** |
| SQL migrations writing rows (except one-time backfill) | **0** |

The only migration touching rows is `20260512050041_*.sql`, which **reads** `shopify_products` to backfill `wms_sku_barcodes` — and would have inserted zero rows if the table was already empty.

### Related gaps

| Issue | Detail |
|-------|--------|
| No cron named `sync_shopify_products` | `SystemHealthAdmin.tsx` logs a fictional job name — UI placeholder only |
| `shopify-app-sync-products` | Writes to `pages`, not `shopify_products` |
| `sync-shopify-pages` | Same — SEO/pages path |
| No `supabase gen types` sync job | Table exists in DB but no documented population pipeline |

### Historical hypothesis

Development sequence likely was:

1. Dec 2025 — `products` table for analytics sync (working)
2. Jan 2026 — `shopify_products` added for feeds (schema only)
3. Feed Edge Functions written against `shopify_products` (+ planned `shopify_variants`/`shopify_images`)
4. Normalization abandoned → JSONB columns added to `shopify_products`
5. **Population step never implemented** — `shopify-sync` continued writing to `products`
6. Some UI components added fallbacks (`ProductMarginsTab` comment: *"shopify_products may be empty"*)

---

## Should It Be Populated?

### Verdict: **Yes**

| Option | Recommendation |
|--------|----------------|
| **Populate `shopify_products`** | ✅ **Preferred** — matches original design; fixes feeds with minimal consumer changes |
| **Deprecate table, migrate consumers to `products`** | ⚠️ Possible but **insufficient** — `products` lacks `sku`, `barcode`, `description`, `variants`, `metafields`, `cost_price` |
| **Leave empty, query Shopify live** | ❌ Poor for feeds — rate limits, latency, no offline filtering |
| **Remove table** | ❌ Breaks 10+ consumers; requires coordinated refactor |

### Recommended architecture

```
Shopify Admin API
       │
       ▼
┌──────────────────┐     ┌──────────────────┐
│  shopify-sync    │     │ shopify_products   │  ← NEW: sync-products-feed action
│  sync-products   │     │ _sync (or extend   │
│  → products      │     │  sync-products)    │
└──────────────────┘     └────────┬─────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            price-comparison   Prisjakt/      IA / GEO /
            feed XML           PriceRunner    intelligence
```

**One row per Shopify product** (not per variant), with `variants` JSONB holding all variant SKUs/prices/barcodes — matching how `FinanceExpresspackStock.tsx` already reads the table.

### What to sync (minimum viable)

| Field | Source (Shopify GraphQL) |
|-------|--------------------------|
| `shopify_id`, `title`, `handle`, `description` | Product |
| `vendor`, `product_type`, `tags`, `status` | Product |
| `sku`, `barcode`, `price`, `compare_at_price` | Default / first variant |
| `inventory_quantity` | Sum or default variant qty |
| `cost_price` | `inventoryItem.unitCost` |
| `image_url` | `featuredImage.url` |
| `images` | `media` nodes |
| `variants` | Full `variants` array as JSONB |
| `options` | `options` array |
| `metafields` | Product metafields |
| `published_at` | `publishedAt` |

### When to run

- After existing `sync-products` batch (same cron / `ShopifySyncButton`)
- On `shopify-app-webhook-products` create/update (incremental)
- Nightly full refresh for drift correction

---

## What Functionality Depends on It

### Critical — empty table = broken or empty output

| Consumer | Location | What it reads | Impact when empty |
|----------|----------|---------------|-------------------|
| **Price comparison XML feeds** | `supabase/functions/price-comparison-feed/index.ts` | Full feed fields: `shopify_id`, `title`, `handle`, `description`, `sku`, `barcode`, `price`, `inventory_quantity`, `image_url`, `tags` | **Empty XML feeds** for Prisjakt, PriceRunner, Google Shopping channels configured in `price_comparison_feeds` |
| **Prisjakt API feed** | `supabase/functions/prisjakt-api/index.ts` | `shopify_products` + **`shopify_variants`** + **`shopify_images`** (tables don't exist) | **Broken** — empty products; variant/image queries fail silently |
| **PriceRunner feed** | `supabase/functions/pricerunner-feed/index.ts` | `shopify_products` with nested join to **`shopify_variants`** / **`shopify_images`** | **Broken** — PostgREST join fails or returns empty |
| **PriceRunner API** | `supabase/functions/pricerunner-api/index.ts` | Selects `body_html` (column **does not exist** — schema has `description`) | **Broken** even if populated unless query fixed |
| **IA analysis** | `supabase/functions/ia-analysis/index.ts` | `shopify_products` + **`shopify_collections`** (table **does not exist**) | IA score based on zero products/collections |
| **GEO product check** | `supabase/functions/geo-product-check/index.ts` | Active products for AI mention testing | Returns `checked: 0` |
| **Intelligence engine daily** | `supabase/functions/intelligence-engine-daily/index.ts` | `shopify_products` for product quality metrics | Degrades silently (`safe()` wrapper returns null) |

**UI surfaces affected:**
- `src/pages/marketing/PriceComparisonFeeds.tsx` — feed URLs return empty XML
- `src/pages/integrations/PrisjaktIntegration.tsx`
- `src/pages/integrations/PriceRunnerIntegration.tsx`

### Degraded — has fallback elsewhere

| Consumer | Location | Fallback when empty |
|----------|----------|---------------------|
| **Product margins** | `src/components/warehouse/ProductMarginsTab.tsx` | Uses `order_line_items` + `products` for selling price; comment acknowledges empty table |
| **Expresspack stock valuation** | `src/pages/finance/FinanceExpresspackStock.tsx` | Falls back to `products` matched by title |
| **Structured snippets (Google Ads)** | `src/components/google-ads/search/StructuredSnippetManager.tsx` | Also reads `products.vendor` |
| **Theme simulation** | `src/components/intelligence/ThemeSimulationCreator.tsx` | Sample product handle — falls back to null URL |
| **Product mention tracker** | `src/components/ai-visibility/ProductMentionTracker.tsx` | Empty product picker |

### Indirect / infrastructure

| Dependency | Location | Impact |
|------------|----------|--------|
| **WMS barcode resolver** | `wms_resolve_barcode()` RPC in `20260512050041_*.sql` | SKU fallback lookup queries `shopify_products` — barcode backfill from table also empty |
| **`wms_sku_barcodes` backfill** | Same migration | One-time `INSERT FROM shopify_products` — no rows to backfill |
| **`product_type_collections.shopify_products_count`** | `CuratedCollections.tsx` | Manually set on collection sync — not auto-derived from table count |
| **Project memory** | `mem/features/intelligence-engine/ia-and-ai-search-visibility.md` | Documents dependency on populated table |

### Does NOT depend on `shopify_products`

| Feature | Uses instead |
|---------|--------------|
| Dashboard product analytics | `products` |
| SEO editor | `pages` |
| FTP/Sunsky import & publish | `inventory` |
| Shopify cloner | Direct API — no local table |
| Order profitability | `orders` / `order_line_items` |
| Google Merchant sync | Live Shopify API |

---

## Schema & Code Defects (Related)

These issues compound the empty-table problem:

| # | Defect | Files |
|---|--------|-------|
| 1 | **`body_html` column referenced** but schema has `description` | `pricerunner-api`, `pricerunner-feed`, `prisjakt-api` |
| 2 | **`shopify_variants` / `shopify_images` tables referenced** but never created | `prisjakt-api`, `pricerunner-feed` |
| 3 | **`shopify_collections` table referenced** but never created | `ia-analysis` |
| 4 | **Original RLS broken** (`tenant_id = auth.uid()`) | Fixed in `20260527072000_*.sql` |
| 5 | **`tags` type mismatch** — `shopify_products` uses `TEXT[]`; `products.tags` is `TEXT` (comma string) | Sync inconsistency |
| 6 | **No service-role bypass policy** | Edge functions use service role — OK; authenticated inserts need `has_shop_access` |

---

## Comparison: `products` vs `shopify_products`

| Field | `products` | `shopify_products` |
|-------|------------|-------------------|
| `shopify_id` | ✅ | ✅ |
| `title`, `handle`, `vendor`, `product_type` | ✅ | ✅ |
| `price`, `compare_at_price` | ✅ (min variant) | ✅ |
| `status` | ✅ | ✅ |
| `total_inventory` / `inventory_quantity` | ✅ / ✅ | ✅ |
| `image_url` | ✅ | ✅ |
| `meta_title`, `meta_description` | ✅ | ❌ (use metafields or description) |
| **`sku`** | ❌ | ✅ |
| **`barcode`** | ❌ | ✅ |
| **`description`** | ❌ | ✅ |
| **`cost_price`** | ❌ | ✅ |
| **`variants` JSONB** | ❌ (hardcoded `variants_count: 1`) | ✅ |
| **`images` JSONB** | ❌ (`images_count: 0`) | ✅ |
| **`metafields` JSONB** | ❌ | ✅ |
| **`options` JSONB** | ❌ | ✅ |
| **`tags`** | TEXT (comma-separated) | TEXT[] (array) |
| **`weight`** | ❌ | ✅ |

**Conclusion:** `products` cannot replace `shopify_products` for feed generation without schema extension or runtime Shopify API calls.

---

## Implementation Options

### Option A — Extend `shopify-sync` (lowest risk)

Add `sync-products-feed` action (or extend `syncAllProducts`) to upsert rich rows into `shopify_products` using the same GraphQL pagination, with a fuller field map including variants JSONB.

**Pros:** Reuses existing credential resolution, pagination, self-invoke pattern  
**Cons:** `shopify-sync` already large (~1,700 lines); uses env-based single-store credentials

### Option B — Webhook-driven incremental sync

Extend `shopify-app-webhook-products` to upsert/delete `shopify_products` rows on product create/update/delete.

**Pros:** Near real-time feed accuracy  
**Cons:** Needs OAuth app path; won't backfill historical catalog alone

### Option C — Dedicated `sync-shopify-products-feed` function

New Edge Function using `_shared/shopify-client.ts` (per-shop tokens), called from `useShopifyDataSync` / cron.

**Pros:** Clean separation; multi-tenant ready  
**Cons:** New function to maintain

### Option D — Deprecate and consolidate (higher effort)

Merge `shopify_products` columns into `products`, migrate all consumers, drop table.

**Pros:** Single product mirror  
**Cons:** Wide `products` table; breaks array tags pattern; large migration

**Recommended:** **Option A + B** — full sync for backfill, webhooks for incremental.

---

## Fix Checklist (if populating)

- [ ] Implement upsert writer in `shopify-sync` or new function
- [ ] Fix `body_html` → `description` in pricerunner-api, pricerunner-feed, prisjakt-api
- [ ] Remove `shopify_variants` / `shopify_images` queries; read from JSONB columns
- [ ] Create `shopify_collections` table OR point `ia-analysis` at `product_type_collections` / live API
- [ ] Wire `shopify-app-webhook-products` to upsert `shopify_products`
- [ ] Add `last_product_count` update in `price_comparison_feeds` after generation
- [ ] Re-run `wms_sku_barcodes` backfill from populated barcodes
- [ ] Verify RLS allows service-role writes (service role bypasses RLS by default)
- [ ] Add monitoring: alert when `shopify_products` row count = 0 for shops with `price_comparison_feeds.enabled`

---

## Decision Matrix

| Question | Answer |
|----------|--------|
| Why does it exist? | Rich denormalized **product feed cache** for price-comparison XML and SKU-level features |
| Why is it empty? | **`shopify-sync` writes to `products` instead**; no writer was ever implemented |
| Should it be populated? | **Yes** — or refactor all consumers (more work, loses feed-optimized schema) |
| Is it safe to ignore? | **No** — price comparison feeds and IA/GEO features are silently broken |
| Can `products` replace it? | **Not without schema changes** — missing SKU, barcode, variants, metafields, description, cost |

---

## Source Files

| File | Role |
|------|------|
| `supabase/migrations/20260111175813_*.sql` | Table creation |
| `supabase/migrations/20260527072000_*.sql` | RLS fix |
| `supabase/migrations/20260512050041_*.sql` | WMS barcode backfill from table |
| `supabase/functions/shopify-sync/index.ts` | Writes to `products` (not `shopify_products`) |
| `supabase/functions/price-comparison-feed/index.ts` | Primary feed consumer |
| `supabase/functions/prisjakt-api/index.ts` | Broken consumer (missing tables) |
| `supabase/functions/pricerunner-feed/index.ts` | Broken consumer (bad joins) |
| `supabase/functions/ia-analysis/index.ts` | IA consumer (+ missing `shopify_collections`) |
| `src/components/warehouse/ProductMarginsTab.tsx` | UI with explicit empty-table fallback |

---

*Analysis based on static code and migration review. Confirm row count in production with:*

```sql
SELECT shop_id, COUNT(*) FROM shopify_products GROUP BY shop_id;
```
