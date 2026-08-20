# Ecommerce Internal Review — ActionKing / EuroDroneParts

**Date:** 2026-06-07  
**Scope:** Shopify-centric ecommerce only (catalog, inventory, sync, clone)  
**Excluded:** Marketing, CRM, customer service, reporting, AI/intelligence modules  
**Audience:** Internal decision — can ActionKing and EuroDroneParts use this module today?

---

## Executive Summary

DigitalSignal's ecommerce layer is **not a single product module** — it is a collection of **parallel pipelines** built around ActionKing's operational reality (FTP supplier feeds, Sunsky dropshipping, Fortnox-adjacent inventory, WMS fulfillment). The codebase contains **70+ Shopify Edge Functions**, mature store-cloning tooling, and working import→publish flows — but also **broken UI paths**, **orphaned database tables**, and **hardcoded store credentials** for ActionKing and EuroDroneParts.

| Store | Internal readiness | Score |
|-------|-------------------|-------|
| **ActionKing** | Conditional GO — core supplier→inventory→Shopify paths work | **6.5 / 10** |
| **EuroDroneParts** | Limited GO — migration/cloning ready; day-to-day ops immature | **5 / 10** |
| **Ecommerce module overall** | Conditional GO with documented workarounds | **6 / 10** |

### Recommendation: **Conditional GO**

Use internally **today** for ActionKing catalog operations via the **FTP/Sunsky → `inventory` → `publish-inventory-to-shopify`** pipeline and Shopify→local sync. Do **not** treat this as a turnkey, unified ecommerce PIM without fixing the critical gaps listed in Section 12.

For EuroDroneParts, use **`shopify-cloner`** or **`shopify-drone-clone`** for store setup/migration; do not rely on it as a standalone daily operations platform until OAuth tokens and inventory flows are fully wired.

---

## Architecture Context

Ecommerce data flows through **four local tables** that are not kept in sync with each other:

```
                    ┌─────────────┐
   FTP / Sunsky ──► │  inventory  │ ──► publish-inventory-to-shopify ──► Shopify
                    └─────────────┘
                           │
                    ┌─────────────┐
   Shopify sync ──► │  products   │  (analytics mirror, variant detail lost)
                    └─────────────┘
                           │
                    ┌─────────────┐
   App sync/webhook ►│   pages     │  (SEO/editor registry)
                    └─────────────┘
                           │
                    ┌─────────────┐
   (never written)  │shopify_products│  (schema exists, table empty)
                    └─────────────┘
```

**Two Shopify credential paths coexist:**

1. **Legacy env vars** — `SHOPIFY_STORE_DOMAIN` + `SHOPIFY_ADMIN_ACCESS_TOKEN` (ActionKing default)
2. **Per-shop OAuth** — `shopify_app_installations` (newer app path; EuroDroneParts has `eudroneparts-set-token` helper)

Many functions use path 1; newer write APIs use `_shared/shopify-client.ts` with per-`shop_id` resolution.

---

## 1. Shopify Integrations

### Current status: **Production-capable, architecturally fragmented**

~70 `shopify-*` Edge Functions plus 6 `sync-shopify-*` functions. Shared infrastructure in `supabase/functions/_shared/shopify-client.ts`, `shopify-auth.ts`, `shopify-webhook-receiver.ts`.

### What works

| Area | Evidence |
|------|----------|
| **OAuth Shopify App** | `shopify-app-install`, `shopify-app-callback`, `shopify-app-gdpr`, uninstall flow |
| **Webhook registration** | ~30 topics auto-registered on install; HMAC verification via `SHOPIFY_APP_SECRET` |
| **Real-time product sync** | `shopify-app-webhook-products` → `pages` table |
| **Real-time order sync** | `shopify-app-webhook-orders` → `shopify_app_orders` (tracking, line items) |
| **Inventory webhooks** | `shopify-app-webhook-inventory` → `shopify_app_inventory_levels` |
| **Customer webhooks** | `shopify-app-webhook-customers` → `shopify_app_customers` |
| **Legacy order pipeline** | `shopify-webhook-order` with Sunsky dropship logic (IOSS, battery SKU rules) |
| **Write APIs** | `shopify-product-write`, `shopify-order-write`, `shopify-fulfillment`, `shopify-refund`, `shopify-inventory-write`, `shopify-metafield-write` |
| **ActionKing token linking** | `shopify-link-actionking-token` — maps ActionKing domain to `shopify_app_installations` |
| **EuroDroneParts token setup** | `eudroneparts-set-token` — copies `EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN` into `shopify_app_installations` for `ya1xhg-x6.myshopify.com` |
| **UI entry points** | `/integrations/shopify-app`, `/integrations/shopify-api` (API explorer), `/shopify-cloner` |

**ActionKing-specific wiring:**
- Env fallback: `SHOPIFY_STORE_DOMAIN` + `SHOPIFY_ADMIN_ACCESS_TOKEN`
- Hardcoded shop reference in `SalesDashboard.tsx` (`010120e6-6def-431e-8614-905cb69f85b9`)
- Cloner functions resolve ActionKing by name/domain → env token

**EuroDroneParts-specific wiring:**
- Domain: `ya1xhg-x6.myshopify.com`
- Env: `EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN`
- Cloner import maps `eudrone` / `ya1xhg-x6` → env token

### What is incomplete

| Gap | Detail |
|-----|--------|
| **Dual integration paths** | Legacy env-based (`shopify-sync`) and OAuth app path (`shopify-app-sync-*`) run in parallel; no unified credential resolver used everywhere |
| **Log-only webhooks** | Collections, draft orders, returns webhooks registered but only write to `shopify_api_log` — no business logic |
| **Shop-to-tenant linking** | OAuth callback expects `shop_id` pre-set on installation; setup is partially manual |
| **Three order stores** | `orders`, `shopify_orders_cache`, `shopify_app_orders` — no single order source of truth |
| **App Store positioning** | Documented as SEO/marketing app (`docs/shopify-app-store-config.md`), not ecommerce PIM |

### Risks

1. Calling the wrong Edge Function hits the **wrong Shopify store** (env vs per-shop token).
2. Webhook handlers that only log create **false confidence** that collections/returns are synced.
3. Uninstall flow may not fully clean cross-table references.
4. `verify_jwt = false` on cloner functions — acceptable for internal cron, risky if URLs are public.

### Recommended improvements

1. **Unify credential resolution** — all functions must use `getShopifyContext(shop_id)` from `_shared/shopify-client.ts`.
2. **Deprecate global env vars** for ActionKing; migrate to `shopify_app_installations` via `shopify-link-actionking-token`.
3. Implement business logic for collection/return/draft-order webhooks or stop registering them.
4. Consolidate order storage into one primary table with source tagging.
5. Document per-store integration path in an internal runbook (ActionKing = env legacy; EuroDroneParts = OAuth token helper).

---

## 2. Product Import

### Current status: **FTP and Sunsky paths production-ready; CSV path is export-only**

### What works

| Channel | UI | Backend | Destination |
|---------|----|---------|-------------|
| **FTP CSV** | `src/components/purchases/FtpProductImporter.tsx` | `ftp-import`, `ftp-auto-sync` | `inventory` |
| **Sunsky API** | `src/components/purchases/ApiProductImporter.tsx` | `sunsky-sync`, `publish-sunsky-to-shopify`, `sync-shopify-sunsky-products` | `inventory` + Shopify drafts |
| **Scheduled launches** | `ProductLaunchManager.tsx` | `activate-product-launch`, `shopify-list-drafts` | Activates drafts on schedule |

**FTP import (most complete path):**
- Configurable field mapping: SKU, title, price, qty, barcode, vendor, type, category, image URL, weight, restock date
- Auto-sync chain: `import_to_inventory` → `publish_to_shopify` → `sync_prices`
- Writes to `inventory` with vendor/type embedded in `notes`
- Cron-capable via `ftp-auto-sync`

**Sunsky import (dropship workflow):**
- Category browse, preview, filters, background publish jobs
- Price sync, collection/channel/market assignment on publish

### What is incomplete

| Gap | Detail |
|-----|--------|
| **CSV importer is misleading** | `CsvProductImporter.tsx` parses Shopify CSV and **downloads enriched CSV** — does not publish via API |
| **No direct bulk API upload** | No function consumes multi-row variant CSV for `productSet` bulk create |
| **`shopify_products` never populated** | Rich feed schema exists but no writer — downstream readers get empty data |
| **WooCommerce/custom** | Referenced in UI; implementation is Sunsky-centric |
| **Reseller catalog** | `product_catalog` / `reseller_products` — separate taxonomy, not wired to Shopify |

### Risks

1. Staff using **CsvProductImporter** believe products are imported; they must manually upload CSV to Shopify.
2. **FTP auto-sync** without monitoring can publish bad data at scale.
3. Import writes to `inventory` only — products won't appear in SEO editor until a separate page sync runs.

### Recommended improvements

1. Rename or relabel `CsvProductImporter` to "Export enriched Shopify CSV".
2. Wire CSV import to `shopify-product-write` / `productSet` for direct publish.
3. Populate `shopify_products` on every product sync, or remove the table and update consumers.
4. Add import validation dashboard (row errors, SKU collisions, publish failures).

---

## 3. Product Sync

### Current status: **Multiple one-way syncs; not bidirectional**

### What works

| Direction | Function | Target |
|-----------|----------|--------|
| Shopify → local (catalog/SEO) | `sync-shopify-pages` | `pages`, collections, articles |
| Shopify → local (analytics) | `shopify-sync` `sync-products` | `products` |
| Shopify → local (inventory) | `shopify-inventory` `sync-to-local` | `inventory` |
| Shopify → local (app path) | `shopify-app-sync-products` + webhooks | `pages` |
| Local → Shopify (inventory) | `publish-inventory-to-shopify` | Creates/updates products, stock, images, metafields |
| Local → Shopify (Sunsky) | `publish-sunsky-to-shopify` | Draft/active products |
| Background full sync | `useShopifyDataSync` → `sync_jobs` | Products, orders, customers |
| Nightly cost sync | `nightly-inventory-sync` | Pushes purchase price, HS code to Shopify variants |

`sync-shopify-pages` is the most hardened sync (chunked streaming, progress reporting, used by `useSyncShopify`).

### What is incomplete

| Gap | Detail |
|-----|--------|
| **No bidirectional sync** | No conflict resolution, no single source of truth |
| **No unified sync state** | Different tables updated by different functions |
| **`shopify-inventory` is read-only** | `push-to-shopify` action removed (line 633); UI still calls it (see §5) |
| **Customer/returns sync** | `sync-shopify-customers`, `sync-shopify-returns` use env credentials, not per-shop OAuth |
| **Webhook inventory not merged** | `shopify_app_inventory_levels` written but never updates `inventory` |

### Risks

1. **Data drift** — same SKU can differ across `inventory`, `products`, and `pages`.
2. **Wrong-store sync** if env vars point to ActionKing while UI shows another shop.
3. Staff trigger full sync during business hours → Shopify API rate limits.

### Recommended improvements

1. Define **source of truth per field** (e.g. `inventory` owns stock; Shopify owns live price; `pages` owns SEO).
2. Build a **sync status table** per SKU: last import, last publish, last Shopify pull, hash/checksum.
3. Merge `shopify_app_inventory_levels` webhook data into `inventory`.
4. Remove or fix all references to removed `push-to-shopify` action.

---

## 4. Variant Handling

### Current status: **Read-capable; write paths assume single variant**

### What works

| Capability | Location |
|------------|----------|
| Read up to 20 variants per product | `shopify-inventory` `sync-to-local` |
| Full variant CRUD API | `shopify-product-write` (`variantsBulkCreate/Update/Delete`) — via API explorer only |
| Multi-variant read in cloner | `shopify-cloner-scan` pulls `variants(first: 100)` |
| Drone clone supports variants | `shopify-drone-clone` scans variants with weight, HS code, barcode |
| CSV parser handles multi-row variants | `CsvProductImporter` (export only) |

### What is incomplete

| Gap | Detail |
|-----|--------|
| **Publish paths create single variant** | FTP, Sunsky, `publish-inventory-to-shopify` all use `Default Title` option |
| **`products.variants_count` always 1** | `shopify-sync` hardcodes; no variant JSON persisted |
| **`shopify_products.variants` JSONB** | Schema exists; table never written |
| **No variant UI in Purchases** | Variant management only in `ShopifyApiExplorer.tsx` |
| **20-variant sync limit** | Products with >20 variants truncated on inventory pull |

### Risks

1. ActionKing products with size/color variants **cannot be managed** through import/publish flows.
2. Inventory sync undercounts stock for multi-variant products.
3. Cloner can copy variants, but ongoing ops can't maintain them through standard UI.

### Recommended improvements

1. Extend `publish-inventory-to-shopify` to accept variant definitions (or group FTP rows by product handle).
2. Persist variant JSON in `shopify_products` or a dedicated `product_variants` table.
3. Add variant editor to `InventoryManager` or `ProductAssortment` for products with >1 variant.
4. Raise or paginate variant limit in `shopify-inventory` sync.

---

## 5. Inventory Handling

### Current status: **Operational for Purchases; WMS disconnected from Shopify stock**

### What works

**Primary table:** `inventory` (unique on `shop_id` + `sku` + `location`)

Key fields: `quantity`, `purchase_price`, `barcode`, `weight_grams`, `hs_code`, `country_of_origin`, `image_url`, `shelf_location`, `import_duty_rate`, `connection_id` (FTP), `product_status`, `inventory_policy`, `estimated_restock_date`

| Flow | Function | Status |
|------|----------|--------|
| FTP → inventory | `ftp-import` | ✅ Works |
| inventory → Shopify | `publish-inventory-to-shopify` | ✅ Works (via FTP auto-sync chain) |
| Shopify → inventory | `shopify-inventory` `sync-to-local` | ✅ Works |
| Scheduled all-shops pull | `shopify-inventory` `sync-all-shops` | ✅ Works |
| Sunsky stock | `sunsky-sync` `sync-inventory` | ✅ Works |
| Nightly cost/HS push | `nightly-inventory-sync` | ✅ Works |
| WMS order picks | `wms_shopify_create_pick` (from order webhook) | ✅ Works |
| WMS fulfillments | `wms_shopify_fulfill` (from fulfillment webhook) | ✅ Works |

**UI:** `src/components/purchases/InventoryManager.tsx`, `src/pages/Warehouse.tsx`, `src/pages/WMS.tsx`

### What is incomplete

| Gap | Detail |
|-----|--------|
| **🔴 Broken push button** | `InventoryManager.pushToShopify()` calls `shopify-inventory` action `push-to-shopify` — **removed**; returns unknown action. Correct path: `publish-inventory-to-shopify` (used by FTP importer) |
| **WMS stock → Shopify** | `wms_inventory_units.on_hand` never pushed to Shopify |
| **Three inventory silos** | `inventory`, `wms_inventory_units`, `shopify_app_inventory_levels` — no reconciliation |
| **Webhook levels unused** | Real-time Shopify inventory changes don't update `inventory` |
| **Low-level write API unused in UI** | `shopify-inventory-write` (`adjustQuantities`, `setQuantities`) — explorer only |

### Risks

1. **Staff clicking "Push to Shopify" in InventoryManager get silent failure** — critical UX bug.
2. Warehouse physical counts in WMS **don't reflect in Shopify** — overselling risk.
3. Shopify stock changes via POS or other apps **don't update** local `inventory`.

### Recommended improvements

1. **Fix immediately:** Change `InventoryManager` to call `publish-inventory-to-shopify`.
2. Add nightly reconciliation job: Shopify levels → `inventory` (and optionally WMS).
3. Define whether WMS or `inventory` is stock source of truth; wire one → Shopify.
4. Show per-SKU sync status in InventoryManager (last pull, last push, delta).

---

## 6. Metafield Handling

### Current status: **API-complete; UI fragmented**

### What works

| Function | Purpose |
|----------|---------|
| `shopify-metafields` | Read definitions + product metafields; create import-duty definition |
| `shopify-metafield-write` | Generic set/delete/definition CRUD (per-shop auth) |
| `sync-product-market-metafields` | Writes `custom.markets` for market targeting |
| `shopify-product-seo` | Product metafields: short text, specification, FAQ, structured data, OG |
| `publish-inventory-to-shopify` | Pushes product metadata on publish |
| `shopify-inventory` sync | Reads `custom.import_duty` → `inventory.import_duty_rate` |

Cloner handles metafield remapping with GID translation on publish.

### What is incomplete

| Gap | Detail |
|-----|--------|
| **No unified metafield editor** | Scattered across SeoEditor, API explorer, publish functions |
| **No local metafield cache** | `shopify_products.metafields` JSONB unused |
| **Variant metafields** | Supported in API; no product UI |
| **Import duty fragmented** | Definition creator, sync read, manual publish — no single workflow |

### Risks

1. Compliance metafields (GPSR, import duty, markets) may be **set inconsistently** across publish paths.
2. Cloner metafield GID remapping can fail silently for custom namespaces.

### Recommended improvements

1. Add metafield panel to `ProductAssortment` or `InventoryManager` for operational fields (import duty, markets, specs).
2. Include required metafields in FTP field mapping validation.
3. Audit metafield namespaces used by ActionKing theme and lock them in publish templates.

---

## 7. Category / Collection Handling

### Current status: **Two parallel systems; SKU-based sync is slow**

### What works

**System A — SEO collections** (`product_collections` linking `pages`):
- Populated via `sync-shopify-pages`
- Used for internal link counts in editor

**System B — Assortment collections** (`product_type_collections`, `product_type_collection_items`):
- UI: `CuratedCollections.tsx` in `ProductAssortment.tsx`
- Groups collections under product types; items keyed by **SKU**
- Push to Shopify: `sync-collections-to-shopify` (find/create collection, match SKU, update `productType`)
- Also: `fetch-shopify-collections`, `shopify-collection-write`

**Cloner:** Full collection copy with membership remapping (scan → transform → publish).

**Product type taxonomy:** `ProductAssortment.tsx` manages types from `products.product_type` + `seo_targets.product_type`.

### What is incomplete

| Gap | Detail |
|-----|--------|
| **Slow collection sync** | `sync-collections-to-shopify` does sequential SKU lookups with 500ms delay |
| **No reverse sync** | Shopify collection changes don't update `product_type_collection_items` |
| **`shopify_products_count` stale** | Manually/cache-updated, not live |
| **Two systems not linked** | SEO collections and assortment collections can disagree |

### Risks

1. Large catalog collection sync **takes hours** and may hit rate limits.
2. Manual Shopify admin collection edits **overwrite** local assortment state on next one-way push.
3. EuroDroneParts collection structure after clone may drift without reverse sync.

### Recommended improvements

1. Batch collection membership via GraphQL `collectionAddProducts` instead of per-SKU sleep.
2. Add Shopify → local collection webhook handler (currently log-only).
3. Merge or clearly separate SEO collections vs assortment collections in UI.

---

## 8. SEO Data Handling (Product-Specific)

*Product catalog SEO only — not general SEO automation, GSC, or AI modules.*

### Current status: **Mature for products synced to `pages`; disconnected from `inventory`**

### What works

**Primary UI:** `src/pages/SeoEditor.tsx`  
**Backend:** `supabase/functions/shopify-product-seo/index.ts` (~2,600 lines)

| Capability | Actions |
|------------|---------|
| Core SEO | `get`, `update` — title, body, meta title/description, handle |
| Structured content | `update_faq`, `update_structured_data`, `update_og`, `update_short_text`, `update_specification` |
| Images | `update_image_alt`, `upload_image`, `delete_image`, `rename_image` |
| Lookup | `lookup_by_sku`, `get_product_collections`, `get_redirects` |
| Markets | Translation registration via Shopify Translations API |
| Bulk | `bulk-seo-publish`, `seo-wizard-publish` |
| Import prep | `CsvProductImporter` generates `seo_title` / `seo_description` at CSV stage |

**Supporting tables:** `pages`, `seo_targets`, `seo_snapshots`, `product_market_translations`, `pending_seo_changes`

### What is incomplete

| Gap | Detail |
|-----|--------|
| **FTP products invisible in SeoEditor** | Until `sync-shopify-pages` or app sync creates `pages` row |
| **Dual SEO sources** | `products.meta_title/description` (from Shopify sync) vs `pages` + snapshots (editor) |
| **No SEO on publish** | `publish-inventory-to-shopify` sets basic fields; rich SEO requires separate `shopify-product-seo` call |
| **JSON-LD fix tools** | Admin-only (`JsonLdProductSchemaFixer`); not in standard product workflow |

### Risks

1. New FTP-imported products go live on Shopify **without SEO** until someone runs page sync and edits in SeoEditor.
2. Handle immutability rules (documented in `mem/`) may block fixes if publish paths generate wrong handles.

### Recommended improvements

1. Auto-create `pages` row when `publish-inventory-to-shopify` succeeds.
2. Optionally chain basic SEO (title, meta, alt text) into publish flow.
3. Show SEO status column in `InventoryManager` (synced / pending / published).

---

## 9. Product Image Handling

### Current status: **Publish-time and SEO-time handling; no central media manager**

### What works

| Feature | Location |
|---------|----------|
| Image on FTP import | `image_url` field → `inventory.image_url` → pushed on publish |
| Publish with media | `publish-inventory-to-shopify` (`productCreateMedia`) |
| Sunsky images | `fetch-sunsky-images` |
| SEO image ops | `shopify-product-seo` (alt, upload, delete, rename) |
| List/search images | `shopify-images` |
| Bulk alt text | `bulk-alt-generator` + `AltManager.tsx` |
| Quality audit | `image-quality-audit` + `ImageQualityAudit.tsx` |
| Cloner image rehost | weserv.nl optimization + Shopify CDN re-upload on target |

### What is incomplete

| Gap | Detail |
|-----|--------|
| **No media manager in Purchases** | Images handled at import, SEO, or publish — not in assortment UI |
| **Minimal sync metadata** | `products.image_url` = featured only; `images_count` always 0 |
| **No optimization pipeline** | No automatic compress/resize on FTP import |
| **Multi-image products** | Publish paths typically attach one image URL |

### Risks

1. Supplier FTP feeds with broken `image_url` → products published without images.
2. Cloner image proxy (weserv.nl) is an external dependency for migrations.

### Recommended improvements

1. Validate `image_url` reachability before publish; queue retry for failures.
2. Add image preview column in `InventoryManager`.
3. Support multiple images per SKU in FTP mapping (gallery field).

---

## 10. Clone / Store-Copy Functionality

### Current status: **Most mature ecommerce subsystem — built for ActionKing → EuroDroneParts**

### What works

**UI:** `src/pages/ShopifyCloner.tsx` (~1,900 lines)  
**Admin shortcut:** `src/pages/admin/ShopifyDroneClone.tsx` + `shopify-drone-clone`

| Step | Function | Capability |
|------|----------|------------|
| Connect | `shopify-cloner-connect` | Validate Admin API token → `cloner_stores` |
| Import existing | `shopify-cloner-import-connected` | Auto-import ActionKing/EuroDroneParts from env tokens |
| Scan | `shopify-cloner-scan` | Paginated GraphQL/REST → `cloner_migration_items` |
| Transform | `shopify-cloner-transform` | AI rebrand (optional; can skip for internal copy) |
| Publish | `shopify-cloner-publish` | Create on target; GID remapping; image rehost; theme activation |
| Worker | `shopify-cloner-worker` | pg_cron batch processor |
| Theme | `shopify-clone-theme` | Copy theme assets (unpublished) |
| Drone subset | `shopify-drone-clone` | Keyword-filtered product+collection migration between `shop_id`s |

**Migratable scopes:** products, collections, pages, blogs, articles, menus, redirects, files, metafields, metaobjects, translations, shipping zones, gift cards, checkout branding, themes

**ActionKing → EuroDroneParts is an explicit UI example** (placeholder: "ActionKing → EuroDroneParts" in migration name field).

### What is incomplete

| Gap | Detail |
|-----|--------|
| **Hardcoded env token fallbacks** | `shopify-cloner-scan`, `shopify-cloner-publish`, `shopify-cloner-import-connected` map ActionKing/EuroDroneParts names to env secrets — not generic multi-tenant |
| **Shipping zones** | Scan-only / best-effort |
| **Some metaobject types** | Partial support |
| **Post-clone ops** | Clone sets up catalog; ongoing inventory/SEO/sync gaps remain (see §§2–9) |
| **JWT disabled** | Cloner functions have `verify_jwt = false` in `config.toml` |

### Risks

1. Clone succeeds but **day-to-day ops** hit the same inventory/sync gaps as any other store.
2. Env token rotation breaks cloner without updating Supabase secrets.
3. AI transform step may alter product data unintentionally — use passthrough mode for internal copies.

### Recommended improvements

1. For internal ActionKing → EuroDroneParts migration: use **clone without AI transform**.
2. After clone, run `eudroneparts-set-token` and verify `shopify_app_installations` row.
3. Execute post-migration checklist: inventory sync, collection verify, SEO audit, test order → WMS pick.
4. Remove hardcoded env mappings; use `cloner_stores` tokens exclusively.

---

## 11. ActionKing / EuroDroneParts — Store-Specific Assessment

### ActionKing

| Workflow | Ready? | Notes |
|----------|--------|-------|
| FTP supplier import → inventory | ✅ | Auto-sync with publish chain |
| Sunsky dropship import → Shopify | ✅ | Background jobs, price sync |
| Inventory → Shopify publish | ✅ | Via FTP path; **not** via InventoryManager button |
| Shopify → local inventory pull | ✅ | Scheduled + manual |
| Order → WMS pick → fulfill | ✅ | Webhook-driven |
| Product SEO editing | ✅ | After page sync |
| Collection management | ⚠️ | Slow SKU-based sync |
| Multi-variant products | ❌ | Single-variant publish only |
| Price comparison feeds | ❌ | `shopify_products` table empty |

### EuroDroneParts (`ya1xhg-x6.myshopify.com`)

| Workflow | Ready? | Notes |
|----------|--------|-------|
| Store clone from ActionKing | ✅ | Cloner + drone-clone purpose-built |
| Token setup | ✅ | `eudroneparts-set-token` one-shot helper |
| FTP/Sunsky import | ⚠️ | Works if `shop_id` configured; no EuroDrone-specific UI |
| Day-to-day inventory ops | ⚠️ | Same gaps as ActionKing; less battle-tested |
| OAuth app webhooks | ⚠️ | Requires token in `shopify_app_installations` |
| Ongoing sync | ⚠️ | Env mapping exists in cloner; daily ops need explicit shop context |

---

## 12. Critical Gaps Blocking "Turnkey" Use

| # | Issue | Impact | Fix effort |
|---|-------|--------|------------|
| 1 | `InventoryManager` push button calls removed action | Staff workflow broken | **Low** — one function call change |
| 2 | `shopify_products` table never written | Price feeds, margin tools empty | **Medium** — add upsert to sync functions |
| 3 | Dual credential paths (env vs OAuth) | Wrong-store operations | **High** — unify `shopify-client.ts` |
| 4 | Three inventory silos, no reconciliation | Stock drift, overselling | **High** |
| 5 | Single-variant assumption in publish | Can't manage variant catalogs | **Medium** |
| 6 | FTP products disconnected from SEO editor | New products lack SEO | **Medium** |
| 7 | WMS stock not pushed to Shopify | Warehouse counts ignored online | **High** |
| 8 | Hardcoded ActionKing/EuroDrone env mappings | Fragile token management | **Medium** |

---

## 13. Score & Recommendation

### Scoring criteria (internal use today)

| Criterion | Weight | Score | Notes |
|-----------|--------|-------|-------|
| Product import (FTP/Sunsky) | 20% | 8/10 | Mature, auto-sync, field mapping |
| Product publish to Shopify | 20% | 7/10 | Works via FTP; InventoryManager broken |
| Inventory accuracy | 15% | 4/10 | Silos, no WMS→Shopify, webhook gap |
| Variant support | 10% | 3/10 | Single-variant only in ops paths |
| Collections/categories | 10% | 5/10 | Works but slow; no reverse sync |
| Clone/migration | 10% | 8/10 | Strong for ActionKing → EuroDroneParts |
| Metafields & images | 10% | 6/10 | API-complete; UI fragmented |
| Operational reliability | 5% | 5/10 | Hardcoded stores, dual paths, empty tables |

### Final scores

| Entity | Score | Verdict |
|--------|-------|---------|
| **ActionKing daily operations** | **6.5 / 10** | **Conditional GO** |
| **EuroDroneParts daily operations** | **5 / 10** | **Conditional GO** (post-clone setup) |
| **Ecommerce module as a product** | **6 / 10** | **Conditional GO** |

### Go / No-Go

## ✅ Conditional GO — with constraints

**GO for:**
- ActionKing FTP/Sunsky supplier import and automated publish to Shopify
- ActionKing Shopify→local inventory pull and WMS order fulfillment
- ActionKing → EuroDroneParts store cloning (products, collections, metafields, themes)
- Product SEO editing for products already in `pages`
- Admin-level Shopify API operations via API explorer

**NO-GO for (until fixed):**
- Using `InventoryManager` "Push to Shopify" button (broken — use FTP auto-sync or invoke `publish-inventory-to-shopify` directly)
- Relying on price comparison feeds (`shopify_products` is empty)
- Multi-variant product management through standard import/publish UI
- WMS physical stock as Shopify stock source of truth
- EuroDroneParts as a self-service daily ops platform without completing OAuth setup and post-clone checklist
- Treating this as a unified ecommerce PIM without addressing the four-table data model

### Minimum fixes before full internal GO (estimated 2–4 weeks)

1. Fix `InventoryManager` → `publish-inventory-to-shopify` (**1 day**)
2. Populate `shopify_products` on sync (**3–5 days**)
3. Merge webhook inventory levels into `inventory` (**3–5 days**)
4. Migrate ActionKing to `shopify_app_installations` token; deprecate global env (**1 week**)
5. Auto-create `pages` row on product publish (**2–3 days**)
6. Document internal runbook per store (**2 days**)

### Post-clone checklist for EuroDroneParts

- [ ] Run `eudroneparts-set-token`; verify Shopify API responds
- [ ] Clone catalog via `shopify-cloner` (no AI transform) or `shopify-drone-clone`
- [ ] Run `sync-shopify-pages` on target shop
- [ ] Verify collections and metafields in Shopify admin
- [ ] Configure FTP/Sunsky `shop_id` for EuroDroneParts if using supplier import
- [ ] Test order webhook → WMS pick → fulfillment round-trip
- [ ] Run product SEO pass in SeoEditor for top SKUs

---

## Appendix: Key Files

| Area | Path |
|------|------|
| FTP import UI | `src/components/purchases/FtpProductImporter.tsx` |
| Sunsky import UI | `src/components/purchases/ApiProductImporter.tsx` |
| Inventory UI (broken push) | `src/components/purchases/InventoryManager.tsx` |
| Assortment / collections | `src/pages/ProductAssortment.tsx` |
| Store cloner UI | `src/pages/ShopifyCloner.tsx` |
| Drone clone UI | `src/pages/admin/ShopifyDroneClone.tsx` |
| Shopify client | `supabase/functions/_shared/shopify-client.ts` |
| Publish inventory | `supabase/functions/publish-inventory-to-shopify/index.ts` |
| Inventory sync (read-only) | `supabase/functions/shopify-inventory/index.ts` |
| Product SEO | `supabase/functions/shopify-product-seo/index.ts` |
| ActionKing token | `supabase/functions/shopify-link-actionking-token/index.ts` |
| EuroDroneParts token | `supabase/functions/eudroneparts-set-token/index.ts` |
| Cloner scan/publish | `supabase/functions/shopify-cloner-scan/`, `shopify-cloner-publish/` |
| Inventory table | `inventory` (migration base + ~15 ALTERs) |
| Unused rich feed | `shopify_products` (migration `20260111175813_*.sql`) |

---

*Review based on static code analysis. Runtime store configuration (Supabase secrets, live Shopify API state) was not verified.*
