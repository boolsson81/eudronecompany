# `shopify_products` — Complete Usage Report

**Date:** 2026-06-07  
**Table:** `public.shopify_products`  
**Created:** `supabase/migrations/20260111175813_707f50ad-684b-454f-ab28-151cb2c1a715.sql`  
**Method:** Full-repo grep + file reads. No assumptions about live row counts (requires DB query).

---

## Direct Answers

| # | Question | Evidence-based answer |
|---|----------|----------------------|
| 1 | **Used in production?** | **Read paths are live in code** (9 Edge Functions, 5 UI components, 1 SQL RPC). **No application writer exists.** Whether rows exist in prod DB was not queried here. |
| 2 | **Functions that WRITE?** | **Zero** in TypeScript/SQL application code. Only RLS permits manual INSERT; no code calls it. |
| 3 | **Functions that READ?** | **9 Edge Functions, 5 React files, 1 RPC** — listed below with exact paths. |
| 4 | **Why empty?** | All Shopify sync paths write **`products`** or **`pages`**, never `shopify_products`. No cron, webhook, clone, or publish path targets this table. |
| 5 | **Supposed population source?** | **Shopify import/sync only** (per migration comment). **Not** cloning, **not** publishing, **not** scheduled jobs (for this table), **not** webhooks (today). |
| 6 | **What breaks if empty?** | Feed endpoints using this table return zero offers; intelligence/geo/WMS helpers degrade; UI features fall back to other tables where implemented. |
| 7 | **Critical / optional / legacy?** | **Critical for feed/export subsystem** (code depends on it) but **unimplemented as a data store** — not legacy (readers are current), not optional if price-comparison feeds are enabled. |

---

## Table Schema (from migration + `types.ts`)

```sql
-- supabase/migrations/20260111175813_707f50ad-684b-454f-ab28-151cb2c1a715.sql
CREATE TABLE public.shopify_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  shopify_id TEXT NOT NULL,
  title TEXT NOT NULL,
  handle TEXT,
  description TEXT,
  vendor TEXT,
  product_type TEXT,
  sku TEXT,
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
  images JSONB DEFAULT '[]',
  variants JSONB DEFAULT '[]',
  options JSONB DEFAULT '[]',
  metafields JSONB DEFAULT '{}',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(shop_id, shopify_id)
);
```

**Indexes:** `shop_id`, `sku`, `status`  
**Trigger:** `update_shopify_products_updated_at`  
**RLS (May 2026 fix):** `has_shop_access(auth.uid(), shop_id)` — `supabase/migrations/20260527072000_128a6b4e-170b-4dce-9ca8-1873b373b2c9.sql`

**Migration comment (only stated purpose):** `-- Create shopify_products table for product feed`

---

## 1. Is `shopify_products` Currently Used in Production?

### What the codebase proves

| Evidence | Conclusion |
|----------|------------|
| 9 Edge Functions contain `.from("shopify_products")` SELECT queries | Deployed functions **will query** this table when invoked |
| 5 React components query via Supabase client | UI **will query** when those screens load |
| `price_comparison_feeds` UI (`PriceComparisonFeeds.tsx`) hosts public feed URLs that hit functions reading this table | Feed feature is **wired to** `shopify_products` |
| `ProductMarginsTab.tsx` line 51 comment: *"shopify_products may be empty"* | Developers **expect** empty table |
| Grep for `.from("shopify_products").(insert\|upsert\|update\|delete)` | **0 matches** — nothing populates it in code |

### What we cannot prove without DB access

- Actual row counts per `shop_id`
- Whether any row was inserted manually via SQL or service role

**Verification SQL (run in Supabase):**

```sql
SELECT shop_id, COUNT(*) FROM shopify_products GROUP BY shop_id ORDER BY COUNT(*) DESC;
```

---

## 2. Writers — Complete Inventory

### Application code writers: **NONE**

```bash
# Repo search result:
.from("shopify_products").(insert|upsert|update|delete)  → 0 matches in *.ts / *.tsx
```

| Candidate path | File | Writes to `shopify_products`? | Actually writes to |
|----------------|------|------------------------------|-------------------|
| `shopify-sync` `sync-products` | `supabase/functions/shopify-sync/index.ts` ~1347 | ❌ | `products` |
| `shopify-sync` background job | same file `processBackgroundSync()` ~1398 | ❌ | `products` (via `syncAllProducts`) |
| `shopify-app-sync-products` | `supabase/functions/shopify-app-sync-products/` | ❌ | `pages` |
| `shopify-app-webhook-products` | `supabase/functions/shopify-app-webhook-products/index.ts` ~66–80 | ❌ | `pages` (create/update/delete) |
| `sync-shopify-pages` | `supabase/functions/sync-shopify-pages/` | ❌ | `pages`, `page_seo_snapshots` |
| `shopify-cloner-publish` | `supabase/functions/shopify-cloner-publish/` | ❌ | Target Shopify store only |
| `shopify-drone-clone` | `supabase/functions/shopify-drone-clone/` | ❌ | Target Shopify store only |
| `publish-sunsky-to-shopify` | `supabase/functions/publish-sunsky-to-shopify/` | ❌ | Shopify API + `pages`/`inventory` |
| `sunsky-sync` / `ftp-import` | respective functions | ❌ | `inventory`, `pages` |
| Frontend `src/` | all files | ❌ | — |

### SQL-only references (read, not write)

| File | Operation |
|------|-----------|
| `supabase/migrations/20260512050041_5458f023-defa-4464-b273-a14ca0357d82.sql` | `INSERT INTO wms_sku_barcodes … SELECT … FROM shopify_products` (backfill **from** table) |
| Same migration | `wms_resolve_barcode()` EXISTS subquery on `shopify_products` (read) |

### Theoretical writers (RLS only, no tooling)

- Authenticated users with `has_shop_access` may INSERT/UPDATE per policy — **no UI or function uses this.**

---

## 3. Readers — Complete Inventory

### Edge Functions (SELECT)

| File | Function / entry | Query purpose | Columns / notes |
|------|------------------|---------------|-----------------|
| `supabase/functions/price-comparison-feed/index.ts` | `Deno.serve` handler ~64 | Public XML feed per `price_comparison_feeds` channel | `shopify_id, title, handle, description, vendor, product_type, sku, barcode, price, inventory_quantity, image_url, tags, status` |
| `supabase/functions/pricerunner-feed/index.ts` | GET handler ~68 | Public PriceRunner crawl URL | `SHOPIFY_PRODUCT_FEED_SELECT` via `_shared/shopify-product-feed.ts` |
| `supabase/functions/pricerunner-api/index.ts` | `generateProductFeed()` ~145 | API action `generate-feed` | Same feed select + JSONB enrich |
| `supabase/functions/prisjakt-api/index.ts` | `generateProductFeed()` ~135 | API action `generate-feed` | Same |
| `supabase/functions/ia-analysis/index.ts` | `fetchProductsForIa()` ~13 | IA product count / orphans | `id, handle, title, product_type`; fallback to `products` if empty |
| `supabase/functions/ia-analysis/index.ts` | `fetchCollectionsForIa()` ~64 | Virtual collections from `product_type` | `SELECT product_type FROM shopify_products` |
| `supabase/functions/intelligence-engine-daily/index.ts` | `gatherShopMetrics()` ~31 | Product quality metrics | `id, status, inventory_quantity, image_url, description` |
| `supabase/functions/geo-product-check/index.ts` | handler ~29 | Products for geo mention checks | `id, shopify_id, title, vendor, product_type, handle` |
| `supabase/functions/google-merchant-sync/index.ts` | `sync_products` ~1793 | Enrich `products.description` | `shopify_id, description` batch by `shopify_id` |
| `supabase/functions/ai-search/index.ts` | handler ~86 | AI context products | `id, title, handle, description, vendor, product_type, tags`; fallback to `products` |

**Shared helper (not a reader itself):** `supabase/functions/_shared/shopify-product-feed.ts` — documents expected JSONB shape for feed consumers.

### Edge Functions that do NOT read `shopify_products` (feed split)

| File | Reads instead |
|------|---------------|
| `supabase/functions/prisjakt-feed/index.ts` ~86 | **`products`** table |
| `supabase/functions/monitor-feeds/index.ts` | HTTP-fetches `prisjakt-feed` / `pricerunner-feed` URLs (indirect) |
| `supabase/functions/shopify-sync/index.ts` | Writes **`products`** only |

### Frontend (`src/`)

| File | Line (approx) | Purpose |
|------|---------------|---------|
| `src/components/warehouse/ProductMarginsTab.tsx` | 63 | SKU selling prices; fallback `order_line_items` + `products` |
| `src/pages/finance/FinanceExpresspackStock.tsx` | 226 | SKU prices from top-level + `variants` JSONB; fallback `products` by title |
| `src/components/ai-visibility/ProductMentionTracker.tsx` | 54 | Product list for mention UI |
| `src/components/intelligence/ThemeSimulationCreator.tsx` | 80 | Sample `handle` for preview URL |
| `src/components/google-ads/search/StructuredSnippetManager.tsx` | 88 | Vendor list (also reads `products`) |

### SQL / RPC

| Object | File | Usage |
|--------|------|-------|
| `wms_resolve_barcode(_shop_id, _code)` | `20260512050041_*.sql` ~78 | Fallback: treat scan as SKU if row exists in `shopify_products` |

### Name-only reference (NOT a table read)

| File | Note |
|------|------|
| `src/components/product-assortment/CuratedCollections.tsx` | Column `product_type_collections.shopify_products_count` — integer set in UI, **not** `COUNT(*)` from table |
| `src/pages/admin/SystemHealthAdmin.tsx` ~443 | Hardcoded demo log string `'Scheduled job: sync_shopify_products started'` — **not a real job** |

---

## 4. Why the Table Can Be Empty

### Proven disconnect: sync writes elsewhere

**`shopify-sync` → `syncAllProducts()`** (`supabase/functions/shopify-sync/index.ts`):

```typescript
// Line ~1347 — upsert target is `products`, not `shopify_products`
const { error: upsertError } = await supabase
  .from('products')
  .upsert(rows, { onConflict: 'shop_id,shopify_id' });
```

**GraphQL query in `syncAllProducts` (~1260)** fetches: title, handle, vendor, tags, status, price ranges, featured image, SEO — **no** variants, SKU, barcode, `descriptionHtml`, metafields.

**Background sync** (`processBackgroundSync` ~1398) calls `syncAllProducts` → still **`products` only**.

### No other population path exists in repo

| Mechanism | Searched | Result |
|-----------|----------|--------|
| pg_cron job named `sync_shopify_products` | All migrations | **Not found** |
| Cron invoking `shopify_products` | All migrations | **Not found** |
| Webhook upsert to `shopify_products` | `shopify-app-webhook-products` | Writes **`pages`** |
| Clone publish local DB write | `shopify-cloner-publish`, `shopify-drone-clone` | **No** `shopify_products` reference |
| Sunsky / FTP publish | `publish-sunsky-to-shopify`, `sunsky-sync` | **No** reference |
| DB trigger mirror `products` → `shopify_products` | Migrations | **None** |

---

## 5. Intended Population Source (Evidence)

| Source | Intended? | Implemented? | Evidence |
|--------|-----------|--------------|----------|
| **Shopify imports / sync** | **Yes** | **No** (wrong table) | Migration comment *"product feed"*; feed functions read `shopify_products`; `shopify-sync` writes `products` |
| **Product cloning** | No | No | `shopify-cloner-*` publish to Shopify API + `cloner_migration_items` only |
| **Product publishing** (Sunsky etc.) | No | No | `publish-sunsky-to-shopify` uses `pages` / Shopify GraphQL |
| **Scheduled sync jobs** | Implied by UI | **No** for this table | `SystemHealthAdmin` fake log; `shopify-sync` background syncs `products` |
| **Webhooks** | Reasonable expectation | **No** | `shopify-app-webhook-products` → `pages` |

**Conclusion:** Data is **designed to be synced from Shopify** into this denormalized cache. It is **not** generated from internal catalogs (`inventory`, Sunsky) or clone pipelines.

---

## 6. What Breaks When Empty

### Hard failure (zero feed output)

| Consumer | File | Symptom |
|----------|------|---------|
| PriceRunner public feed | `pricerunner-feed/index.ts` | Empty `<products>` / CSV |
| PriceRunner API feed | `pricerunner-api/index.ts` | `generate-feed` returns empty |
| Prisjakt API feed | `prisjakt-api/index.ts` | Same |
| Price comparison XML | `price-comparison-feed/index.ts` | Empty RSS `<channel>`; `last_product_count: 0` |
| Feed monitor | `monitor-feeds/index.ts` | Warning/error on zero `<item>`/`<offer>` when checking `pricerunner-feed` |

### Degraded (fallback or silent zero)

| Consumer | File | Fallback / behavior |
|----------|------|---------------------|
| IA analysis | `ia-analysis/index.ts` | Falls back to `products` for product list |
| AI search | `ai-search/index.ts` | Falls back to `products.meta_description` |
| Intelligence daily | `intelligence-engine-daily/index.ts` | `productCount: 0` → quality scores wrong; wrapped in `safe()` |
| Geo product check | `geo-product-check/index.ts` | Returns `{ checked: 0 }` |
| Google Merchant sync | `google-merchant-sync/index.ts` | Descriptions from `meta_description` only |
| Product margins | `ProductMarginsTab.tsx` | Uses `order_line_items` / `products` |
| Expresspack stock | `FinanceExpresspackStock.tsx` | Falls back to `products` by title |
| Product mention tracker | `ProductMentionTracker.tsx` | Empty product list |
| Structured snippets | `StructuredSnippetManager.tsx` | Still has `products` vendors |
| WMS barcode RPC | `wms_resolve_barcode()` | SKU fallback path never matches |

### Still works (uses `products`, not `shopify_products`)

| Consumer | File |
|----------|------|
| Prisjakt **public** crawl feed | `prisjakt-feed/index.ts` → `products` |
| Dashboards / ads using `products` | Various |
| SEO product registry | `pages` |

---

## 7. Classification

| Label | Applies? | Reason |
|-------|----------|--------|
| **Legacy / unused** | **No** | 14+ active read paths in current code; Jan 2026+ feed features depend on it |
| **Optional** | **No** (if feeds enabled) | `PriceComparisonFeeds.tsx` and integration UIs assume hosted feeds work |
| **Critical** | **Yes** (for feed/export layer) | Required cache for variant-rich price-comparison exports — **but unpopulated** |

**Accurate label:** **Critical schema with zero implementation** — designed, consumed, never filled.

---

## Data Flow Diagrams

### Intended (from migration + feed code)

```
Shopify Admin API (GraphQL products + variants + media)
        │
        ▼  [NOT IMPLEMENTED]
┌───────────────────┐
│  sync-products-feed │  ← expected writer
│  or webhook upsert  │
└─────────┬─────────┘
          ▼
┌───────────────────┐
│  shopify_products  │  UNIQUE(shop_id, shopify_id)
│  variants JSONB    │
│  images JSONB      │
│  description       │
└─────────┬─────────┘
          │
    ┌─────┼─────┬─────────────┬──────────────┐
    ▼     ▼     ▼             ▼              ▼
pricerunner  prisjakt-api  price-comparison  ia-analysis  ProductMarginsTab
-feed        pricerunner-api  -feed
```

### Actual (verified in repo)

```
Shopify Admin API
        │
        ├─ shopify-sync (sync-products / background)
        │       └─► products  ✅ POPULATED
        │
        ├─ shopify-app-webhook-products
        │       └─► pages  ✅ POPULATED
        │
        ├─ sync-shopify-pages (UI sync)
        │       └─► pages  ✅ POPULATED
        │
        └─ shopify-cloner-publish / drone-clone
                └─► Target Shopify store (no local shopify_products write)

shopify_products  ◄── NO WRITER ──►  EMPTY (default)
        │
        └──► 9 Edge Functions + 5 UI components read → empty results / fallbacks
```

### Parallel product tables

```
inventory          ← Sunsky, FTP, warehouse ops
products           ← shopify-sync (analytics summary)
pages              ← SEO editor, webhooks, sync-shopify-pages
shopify_products   ← feed cache (no writer)
```

---

## Population Process

### Designed process (inferred from schema + consumers only)

1. Pull full product catalog from Shopify GraphQL (variants, images, description, barcodes).
2. Map one row per product into `shopify_products`.
3. Upsert on `(shop_id, shopify_id)`.
4. Incremental updates via product webhooks.
5. Feed Edge Functions read locally (no live Shopify call at crawl time).

### Actual process today

1. User or job triggers `shopify-sync` with `action: 'sync-products'` or `background: true`.
2. `syncAllProducts()` maps slim fields → **`products`**.
3. `shopify_products` is never touched.
4. Feed functions querying `shopify_products` return 0 rows.
5. `prisjakt-feed` (separate endpoint) may still work via **`products`**.

**UI sync note:** `useSyncShopify.tsx` calls **`sync-shopify-pages`**, not `shopify-sync` products — so even `products` may lag unless `sync-products` is invoked separately (`ApiProductImporter.tsx` line ~896 does invoke `sync-products`).

---

## Missing Jobs & Triggers

| Expected | Status | Evidence |
|----------|--------|----------|
| `shopify-sync` action `sync-products-feed` | ❌ Missing | No match in `shopify-sync/index.ts` actions |
| pg_cron `sync_shopify_products` | ❌ Missing | Only fake string in `SystemHealthAdmin.tsx` |
| `shopify-app-webhook-products` → upsert `shopify_products` | ❌ Missing | Writes `pages` only |
| Post-`sync-products` mirror to feed table | ❌ Missing | — |
| `intelligence-engine-daily` cron → populate | ❌ | Reads only |
| Backfill script for existing shops | ❌ | — |
| Alert: feeds enabled + row count 0 | ❌ | — |

---

## Recommended Fix

### Primary: Add Shopify feed sync writer

**File:** `supabase/functions/shopify-sync/index.ts`

1. New action `sync-products-feed` (or extend `syncAllProducts` with dual upsert).
2. Richer GraphQL: `descriptionHtml`, variants (≤100), media, barcode, `inventoryItem.unitCost`, metafields.
3. Map to `shopify_products` columns; `tags` as `TEXT[]`.
4. Upsert: `.from('shopify_products').upsert(rows, { onConflict: 'shop_id,shopify_id' })`.
5. Call from `processBackgroundSync` after `syncAllProducts`, or replace dual-table strategy with documented split.

### Secondary

| Task | File(s) |
|------|---------|
| Webhook incremental sync | `shopify-app-webhook-products/index.ts` |
| pg_cron nightly feed sync | New migration |
| Unify or document feed split | `prisjakt-feed` vs `prisjakt-api` |
| Monitoring | `monitor-feeds`, `price_comparison_feeds.last_product_count` |
| Remove fake cron log or implement job | `SystemHealthAdmin.tsx` |

### Alternative (larger)

Merge `shopify_products` columns into `products`, migrate all 14 readers, drop table.

---

## Implementation Checklist

- [ ] Add `sync-products-feed` writer in `shopify-sync/index.ts`
- [ ] Wire `shopify-app-webhook-products` upsert/delete on `shopify_products`
- [ ] Schedule pg_cron per shop with `price_comparison_feeds.enabled = true`
- [ ] One-time backfill for existing shops
- [ ] Run verification SQL below; expect `shopify_products` count ≈ `products` count per shop
- [ ] Decide fate of `prisjakt-feed` (`products`) vs `prisjakt-api` (`shopify_products`)

---

## Verification SQL

```sql
-- Row counts
SELECT shop_id, COUNT(*) AS feed_rows
FROM shopify_products GROUP BY shop_id;

-- Compare to analytics mirror
SELECT p.shop_id,
       COUNT(DISTINCT p.shopify_id) AS products_table,
       COUNT(DISTINCT sp.shopify_id) AS shopify_products_table
FROM products p
LEFT JOIN shopify_products sp
  ON sp.shop_id = p.shop_id AND sp.shopify_id = p.shopify_id
GROUP BY p.shop_id;

-- Enabled feeds with empty cache
SELECT f.shop_id, f.channel, f.enabled, f.last_product_count
FROM price_comparison_feeds f
LEFT JOIN (SELECT shop_id, COUNT(*) n FROM shopify_products GROUP BY shop_id) sp
  ON sp.shop_id = f.shop_id
WHERE f.enabled AND COALESCE(sp.n, 0) = 0;
```

---

## Related Documents

| Document | Topic |
|----------|-------|
| `SHOPIFY_PRODUCTS_TABLE_REVIEW.md` | Earlier schema review |
| `ECOMMERCE_SCHEMA_FIX.md` | JSONB / ghost-table query fixes |
| `BODY_HTML_FIX.md` | `description` column usage |
| `ECOMMERCE_INTERNAL_REVIEW.md` | Ecommerce readiness |

---

## Summary

`shopify_products` is **actively read in production code paths** but **never written by any function in this repository**. The January 2026 migration created it **for Shopify-sourced product feeds**; all sync, webhook, clone, and publish pipelines write to other tables instead. The table is **critical for the price-comparison feed subsystem** and **broken by omission** until a Shopify feed sync is implemented—not legacy and not safely optional where feeds are enabled.
