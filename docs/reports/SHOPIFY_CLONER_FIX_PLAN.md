# Shopify Cloner — Fix Plan

**Date:** 2026-06-07  
**Migration:** ActionKing → EuroDroneParts  
**Principle:** Low-risk fixes only — no deletes, no live publish, no destructive Shopify operations

---

## Priority Legend

| Priority | Meaning |
|----------|---------|
| **P0** | Blocks production clone without manual Shopify Admin work |
| **P1** | Causes data corruption or SEO breakage |
| **P2** | Operational pain / manual cleanup |
| **P3** | Nice-to-have |

---

## Completed Fixes (This Session)

### P0 — Collection membership

**Problem:** Products scanned without collection handles; publish never called `collects.json`.

**Fix:**

1. `shopify-cloner-scan` — add `collections(first: 50)` to `PRODUCT_QUERY`
2. New `supabase/functions/_shared/cloner-collection-link.ts`
   - `resolveTargetCollectionId()` — mapping table + REST lookup
   - `linkProductToCollections()` — skip smart collections, POST collects
3. `shopify-cloner-publish`
   - Link after each product create
   - `link_collections: true` batch for retroactive linking
   - Publish sort: collections before products

**Verify:** Product in custom collection on source appears in same collection on target after publish.

---

### P1 — Redirect domain rewrite

**Problem:** `buildRedirectPayload()` copied `target` URL with source domain (e.g. `actionking.se`).

**Fix:**

- `rewriteRedirectTarget(target, sourceDomains[], targetDomain)` normalizes hosts
- Source domains from `cloner_stores` + `transformation.old_domain`
- Relative paths (`/products/foo`) unchanged

**Verify:** Redirect target host matches EuroDroneParts primary domain.

---

### P1 — Structured logging

**Problem:** Insufficient audit trail for operator debugging.

**Fix:** `insertClonerLog()` helper; events:

- `clone_started`, `clone_completed`
- `product_cloned`, `product_skipped`, `product_failed`
- `image_failed`, `metafield_failed`
- `collection_link_failed`, `collection_linked`

**Verify:** Logg tab shows events after publish batch.

---

### P1 — Operator safety UX

**Problem:** One-click publish without summary.

**Fix (`ShopifyCloner.tsx`):**

- Confirmation dialog with source/target, pending counts, ETA, mode warning
- Source/target banner on publish tab
- Progress bar for batch runs
- Downloadable JSON clone report
- "Länka kollektioner (retroaktivt)" button

**Verify:** Dry run cannot write; live mode requires dialog confirm.

---

## Already Fixed (Prior Sessions)

| Item | Module |
|------|--------|
| HS code + country of origin | `cloner-inventory-compliance.ts` |
| Draft-only products | `buildProductPayload` + `product-draft-safety.ts` |
| Product scan collections | `shopify-cloner-scan` PRODUCT_QUERY |

---

## Open Items — Recommended Next Steps

### P1 — Rate limit resilience

**Problem:** Large catalogs hit Shopify 429; batch fails mid-run.

**Plan:**

1. Add `retryWithBackoff()` in shared Shopify REST/GQL client (429 + `Retry-After`)
2. Reduce default batch from 25 → 10 for product-heavy migrations
3. Worker: increase delay between `cloner_jobs` batches when `published_failed` spikes

**Risk:** Low — additive retry logic  
**Effort:** 1 day

---

### P2 — Duplicate product detection

**Problem:** Re-run with `create_only` can fail on handle collision; `skip_existing` may skip updates needed.

**Plan:**

1. Pre-publish report: list handles that exist on target
2. UI toggle: "Match by SKU" fallback when handle differs
3. Store `source_id → target_id` in `cloner_object_mappings` on first success; reuse on re-run

**Risk:** Low  
**Effort:** 2 days

---

### P2 — Variant image link failures

**Problem:** `linkVariantImages()` swallows errors with `.catch(() => null)`.

**Plan:**

1. Return `{ linked, failed }` from `linkVariantImages`
2. Log `image_failed` per variant when link fails
3. Optional: second-pass repair job

**Risk:** Low  
**Effort:** 0.5 day

---

### P2 — Metafield reference remap automation

**Problem:** Reference metafields (product/collection GIDs) point at source until manual remap.

**Plan:**

1. Auto-queue `remap_metafields` after product+collection publish completes
2. Surface unmapped GIDs in clone report
3. Document required metafield definitions pre-created on target

**Risk:** Medium (wrong GID remap)  
**Effort:** 2 days

---

### P2 — Cost price

**Problem:** `inventoryItem.unitCost` not in scan query.

**Plan:**

1. Extend `PRODUCT_QUERY` variants: `inventoryItem { unitCost { amount currencyCode } }`
2. Post-create: `inventoryItemUpdate` with cost (same hook as HS code)

**Risk:** Low  
**Effort:** 1 day

---

### P2 — Per-location inventory

**Problem:** Only aggregate `inventoryQuantity` copied; multi-warehouse stock wrong.

**Plan:**

1. Scan `inventoryLevels(first: 10) { location { id } quantities(names: ["available"]) }`
2. After create: `inventoryActivate` + `inventorySetQuantities` per location
3. Map source location names → target locations (config in `migration.transformation`)

**Risk:** Medium — wrong location mapping zeros stock  
**Effort:** 3–5 days  
**Recommendation:** Defer until EuroDroneParts locations configured; use draft + manual stock verify

---

### P3 — Menu URL remap

**Problem:** Menu items may still reference source URLs.

**Plan:** Extend `remap_theme_settings` pattern for `menus.json` link fields using `old_domain` → `new_domain`

**Effort:** 1 day

---

### P3 — Continuous publish rate guard

**Problem:** "Publicera alla (kontinuerligt)" may hammer API.

**Plan:** Add 1–2s delay between batches in frontend loop; expose delay setting

**Effort:** 0.5 day

---

## Deployment Checklist

Changes are **local/uncommitted** until pushed. Deploy order:

1. `git commit` + `git push` (when operator approves)
2. `supabase functions deploy shopify-cloner-scan shopify-cloner-publish`
3. Frontend deploy (`ShopifyCloner.tsx`)
4. Smoke test on staging migration (dry run → 1 product → verify draft + collection + redirect)

**Do not:**

- Delete products on target
- Set `status: active` on clone path
- Run `activate_theme` on production without explicit approval

---

## Success Criteria (ActionKing → EuroDroneParts)

- [ ] All approved products exist on EuroDroneParts as **DRAFT**
- [ ] Custom collection membership matches source (± smart collection rules)
- [ ] Redirects use EuroDroneParts domain
- [ ] HS code visible in Admin → Product → Variant → Customs
- [ ] Clone report downloadable with zero unexplained `product_failed`
- [ ] Operator sign-off before inventory sync / activation
