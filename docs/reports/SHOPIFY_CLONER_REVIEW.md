# Shopify Cloner — Production Readiness Review

**Date:** 2026-06-07  
**URL:** https://app.digitalsignal.io/admin/shopify-cloner  
**Primary migration:** ActionKing → EuroDroneParts  
**Scope:** Full cloner path (`shopify-cloner-*`), not drone subset clone

---

## Executive Summary

The Shopify Cloner is a multi-stage migration tool: connect stores → scan source → optionally AI-transform → approve → publish to target. It is **suitable for a controlled ActionKing → EuroDroneParts catalog migration** when operators follow draft-safety rules, run dry-run first, publish collections before products, and run the collection-link pass after products exist.

**Production blockers addressed in this session (low-risk fixes):**

| Area | Before | After |
|------|--------|-------|
| Collection membership | Not linked on publish | `linkProductToCollections()` on create + retroactive batch |
| Redirect domain rewrite | Source domain in targets | `rewriteRedirectTarget()` rewrites to target domain |
| Publish ordering | Random item order | Collections before products (`PUBLISH_TYPE_ORDER`) |
| Operator safety | Basic dry_run mode | Confirmation dialog + summary before publish |
| Logging | Sparse `created`/`failed` | Structured events: `clone_started`, `product_cloned`, `product_skipped`, `product_failed`, `image_failed`, `metafield_failed`, `collection_link_failed`, `clone_completed` |
| UX | Minimal publish tab | Source/target display, queue stats, ETA, progress, downloadable report |

**Remaining gaps (documented, not auto-fixed):** cost price, per-location inventory, variant metafields, sales-channel publish, rate-limit backoff tuning, duplicate detection beyond handle match.

---

## 1. Page Functionality

### 1.1 What the page does today

`src/pages/ShopifyCloner.tsx` is a single-page admin tool with tabs:

| Tab | Purpose |
|-----|---------|
| **Butiker** | Connect source/target Shopify stores (Admin API token) |
| **Migrationer** | Create migration jobs (source → target, scope types) |
| **Setup** | Scan source, filter products, AI transform, approve items |
| **Preview** | Diff original vs transformed payloads |
| **Publicera** | Publish approved items to target (batch/queue), remap metafields, link collections, image test |
| **Mappning** | Source ID → target ID mapping table |
| **Logg** | `cloner_logs` event stream |
| **Dashboard** | Aggregate scan/publish stats |

**Default migration mode:** `dry_run` — nothing is written to Shopify until operator changes mode and confirms.

### 1.2 Components used

All UI is in one file; shared shadcn/ui primitives only:

- `Tabs`, `Card`, `Button`, `Input`, `Label`, `Textarea`, `Badge`, `Checkbox`, `Select`, `Dialog`, `Table`
- Icons: `lucide-react`
- Data: `@/integrations/supabase/client` + `supabase.functions.invoke()`
- Toasts: `sonner`

No dedicated child components; logic is inline hooks + handlers (~1900 lines).

### 1.3 Edge functions / API calls

| Function | Trigger | Role |
|----------|---------|------|
| `shopify-cloner-connect` | Save store dialog | Validate token, upsert `cloner_stores` |
| `shopify-cloner-import-connected` | Import connected shops button | Pull OAuth-connected shops into cloner |
| `shopify-cloner-scan` | Setup → Scan | GraphQL/REST read from source → `cloner_migration_items` |
| `shopify-cloner-transform` | Setup → Transform | AI rewrite (Lovable/Claude) → `transformed_payload` |
| `shopify-cloner-publish` | Publish tab | REST/GraphQL write to target Shopify |
| `shopify-cloner-worker` | Cron (`cloner_jobs`) | Background scan/transform/publish batches |
| `shopify-drone-clone` | Separate admin page | Keyword-filtered subset clone (not this page) |

**Frontend invoke examples:**

```typescript
supabase.functions.invoke("shopify-cloner-scan", { body: { migration_id } });
supabase.functions.invoke("shopify-cloner-publish", { body: { migration_id, limit: 25 } });
supabase.functions.invoke("shopify-cloner-publish", { body: { migration_id, link_collections: true } });
```

### 1.4 Database tables

| Table | Usage |
|-------|-------|
| `cloner_stores` | Source/target credentials, domains, API version |
| `cloner_migrations` | Job config: mode, scope, transformation, stats, status |
| `cloner_migration_items` | Per-object scan payload, transform, approval, publish status |
| `cloner_object_mappings` | Source handle → target Shopify ID (collections, etc.) |
| `cloner_logs` | Audit trail (scan, publish, errors) |
| `cloner_jobs` | Background worker queue |
| `product_draft_safety_log` | Draft enforcement events from publish |

### 1.5 Shopify APIs called

**Source (scan) — GraphQL Admin API:**

- Products (`PRODUCT_QUERY`): variants, media, metafields, SEO, collections
- Collections, pages, blogs, articles, menus, redirects, files, customers, discounts, metaobjects, themes, etc.

**Target (publish) — REST Admin API + GraphQL:**

| Resource | API |
|----------|-----|
| Products | `POST/PUT products.json` |
| Collections | `POST custom_collections.json` / `smart_collections.json` |
| Collection membership | `POST collects.json` |
| Pages, blogs, articles | REST CRUD |
| Redirects | `POST redirects.json` |
| Metafield definitions | GraphQL `metafieldDefinitionCreate` |
| Metafield values (remap) | GraphQL `metafieldsSet` |
| HS code / country of origin | GraphQL `inventoryItemUpdate` (post-create) |
| Theme assets | REST theme APIs |
| Files | GraphQL `fileCreate` |

**Image pipeline:** Source CDN URLs passed to Shopify; optional weserv.nl proxy converts to WebP before upload.

---

## 2. Clone Coverage Matrix

| Data | Scanned | Published | Notes |
|------|---------|-----------|-------|
| **Products** | ✅ | ✅ | Always `status: draft` |
| **Variants** | ✅ ≤100 | ✅ | Variant 101+ lost; SKU-matched compliance hook |
| **Images** | ✅ paginated | ✅ | Re-hosted; optional WebP conversion |
| **Metafields (product)** | ✅ ≤50 | ✅ | In REST payload + SEO globals |
| **Variant metafields** | ❌ | ❌ | Not in scan query |
| **SEO title** | ✅ | ✅ | `global.title_tag` metafield |
| **SEO description** | ✅ | ✅ | `global.description_tag` metafield |
| **Handles** | ✅ | ✅ | Preserved from source |
| **Collections (definitions)** | ✅ | ✅ | `published: false` on target |
| **Collection membership** | ✅ (fixed) | ✅ (fixed) | `collects.json` after product create |
| **Inventory qty** | ✅ aggregate | ✅ `inventory_quantity` | Not per-location |
| **Cost price** | ❌ | ❌ | `unitCost` not scanned |
| **HS code** | ✅ | ✅ | Post-create `inventoryItemUpdate` |
| **Country of origin** | ✅ | ✅ | Post-create `inventoryItemUpdate` |
| **Tags** | ✅ | ✅ | |
| **Vendor** | ✅ | ✅ | Transform may rewrite |
| **Product type** | ✅ | ✅ | |
| **Redirects** | ✅ | ✅ (fixed) | Target URL rewritten to target domain |
| **Menus** | ✅ scanned | ⚠️ partial | URL remap in separate pass |
| **Themes** | ✅ | ✅ | Large; asset failures logged |
| **Smart collection rules** | ✅ | ✅ | Membership rule-driven, not collects |

---

## 3. Safety Rules

| Rule | Status | Implementation |
|------|--------|----------------|
| All cloned products = DRAFT | ✅ Enforced | `buildProductPayload()` → `status: 'draft'` + `logDraftSafetyEvent()` |
| Block live publishing | ✅ | No `ACTIVE` path; collections/pages `published: false` |
| Operator confirmation | ✅ (fixed) | Publish confirmation dialog with summary |
| Dry-run mode | ✅ | `migration.mode === 'dry_run'` skips Shopify writes |
| Clone summary before execution | ✅ (fixed) | Dialog shows counts, stores, ETA, mode |

**Not enforced in cloner (by design):** Sales channel publication — products stay draft; operator must run separate inventory verification + `activate-product-launch` workflow before go-live.

---

## 4. Known Problems & Fix Status

| Problem | Severity | Status |
|---------|----------|--------|
| Missing collection membership | P0 | **Fixed** — `cloner-collection-link.ts` + scan `collections(first:50)` |
| Missing HS code publish | P1 | **Already fixed** — `cloner-inventory-compliance.ts` |
| Redirects → source domain | P1 | **Fixed** — `rewriteRedirectTarget()` |
| Inventory mapping (multi-location) | P2 | Open — aggregate qty only |
| Duplicate products | P2 | Partial — handle-based `skip_existing` / `update_existing` |
| Broken variants (image link) | P2 | Partial — position-based link; silent catch on failure |
| Missing metafields (refs) | P2 | Partial — manual remap step required |
| Image failures | P2 | Improved logging — `image_failed` events |
| API rate limits | P2 | Batch size 25; worker cron; no exponential backoff yet |

---

## 5. UX Improvements (This Session)

| Requirement | Implementation |
|-------------|----------------|
| Show source shop | Publish tab + confirmation dialog |
| Show target shop | Publish tab + confirmation dialog |
| Products to clone | `publishQueueStats.pendingProducts` |
| Estimated time | `~N min` heuristic (2.5s/product) |
| Progress | `publishProgress` bar + batch counters |
| Errors | Dashboard + logs tab + report JSON |
| Skipped products | Stats + report |
| Completed products | Stats + mapping tab |
| Downloadable report | `downloadCloneReport()` → JSON |
| Link collections button | Retroactive `link_collections: true` batch |

---

## 6. Logging Events

Written to `cloner_logs` via `insertClonerLog()`:

| Event | When |
|-------|------|
| `clone_started` | Publish batch begins |
| `product_cloned` | Product successfully created |
| `product_skipped` | Duplicate skipped (`skip_existing`) |
| `product_failed` | Product publish error |
| `image_failed` | Error message mentions image/media |
| `metafield_failed` | Error message mentions metafield |
| `collection_link_failed` | `collects.json` or missing collection |
| `collection_linked` | Successful membership links |
| `clone_completed` | Batch finished with counts |
| `dry_run` | Item simulated, not written |
| `inventory_compliance` | HS/country hook summary |

---

## 7. Recommended Operator Sequence (ActionKing → EuroDroneParts)

1. Connect ActionKing (source) + EuroDroneParts (target) stores  
2. Create migration `ActionKing → EuroDroneParts`; scope: product, collection, redirect, menu, metafieldDefinition  
3. **Scan** source (background queue for large catalogs)  
4. **Dry run** publish — verify counts, no Shopify writes  
5. Approve products/collections (filter by vendor/type if needed)  
6. Set mode `skip_existing` or `create_only`  
7. **Publish** — collections publish first (automatic sort), then products  
8. **Link collections** (retroactive pass if needed)  
9. **Remap metafields** (reference GIDs)  
10. Verify draft products in EuroDroneParts Admin  
11. Download clone report for audit  
12. Do **not** activate products until inventory flow verified  

---

## 8. Files Reference

| Path | Role |
|------|------|
| `src/pages/ShopifyCloner.tsx` | Admin UI |
| `supabase/functions/shopify-cloner-scan/index.ts` | Source scan |
| `supabase/functions/shopify-cloner-publish/index.ts` | Target publish |
| `supabase/functions/_shared/cloner-collection-link.ts` | Collection membership |
| `supabase/functions/_shared/cloner-inventory-compliance.ts` | HS code / COO |
| `supabase/functions/_shared/product-draft-safety.ts` | Draft enforcement log |

**Related docs:** `COLLECTION_LINKING_FIX_PLAN.md`, `CLONE_VERIFICATION_REPORT.md`, `INVENTORY_COMPLIANCE_FIX.md`, `PRODUCT_DRAFT_SAFETY_RULE.md`
