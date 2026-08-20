# Shopify Cloner — Go-Live Checklist

**Date:** 2026-06-08  
**Route:** ActionKing → EuroDroneParts  
**Review type:** Final production readiness (code verification)  
**Deploy state:** Cloner fixes **local, uncommitted, not deployed** (`HEAD 8fa7aefb`)

---

## Executive verdict

| Scope | Decision |
|-------|----------|
| **Full catalog go-live** | **NO-GO** |
| **Draft pilot clone** | **CONDITIONAL GO** — 20 products after deploy + verification |
| **Sales-channel / ACTIVE go-live** | **NO-GO** — draft safety by design |

**Recommended pilot size:** **20 products** (+ their custom collections, not full catalog)

---

## Remaining blockers (P0)

| # | Blocker | Impact |
|---|---------|--------|
| B1 | **Code not deployed** to Supabase / frontend | Production runs pre-fix cloner (no collection link, no redirect rewrite) |
| B2 | **Variant metafields not scanned or published** | Any variant-level custom data lost |
| B3 | **Metafield definitions** must pre-exist on EuroDroneParts | Product create fails or drops fields |
| B4 | **Reference metafields** need post-publish `remap_metafields` pass | Broken cross-object links until manual step |
| B5 | **Collection link only on product create** — not `update_existing` | Re-runs leave membership broken |
| B6 | **Menus / product HTML** may still contain ActionKing URLs | Redirect rewrite does not cover all surfaces |
| B7 | **Pilot not executed** with service role (`PILOT_CLONE_REPORT.md` = NO-GO) | No live evidence yet |
| B8 | **Inventory is snapshot** — not wired to Sunsky live sync | Wrong stock after go-live without separate sync |

---

## 1. Product images

| Check | Verified | Evidence | Pass for go-live? |
|-------|----------|----------|-------------------|
| All images copied | ⚠️ Partial | `media` scanned; paginated beyond 100 via `PRODUCT_MEDIA_QUERY`; **video/3D excluded** (`MediaImage` only) | Pilot only |
| Image order preserved | ⚠️ Partial | `position: idx + 1` in `buildProductPayload()` follows scan node order | Pilot only |
| Variant-specific images | ⚠️ Partial | Post-create `linkVariantImages()` by position; **errors swallowed** (`.catch(() => null)`) | Manual spot-check |
| Image URL transform | ⚠️ | Optional WebP proxy may change URL; position map uses transformed URL | OK if proxy consistent |
| Alt text | ✅ | Source alt or auto-generated from title | Yes |

**Risks:** Shopify fetch from source CDN can fail → whole product fails. Silent variant-image link loss.

**Pilot verification:**
- [ ] Image count on target = source for each of 20 products
- [ ] First image = same visual order as ActionKing
- [ ] Variant thumbnail matches correct image (multi-variant SKUs)

---

## 2. Variants

| Field | Copied? | Evidence | Limits |
|-------|---------|----------|--------|
| SKU | ✅ | `sku: v.sku` in `buildProductPayload` | — |
| Barcode | ✅ | `barcode: v.barcode` | — |
| Weight | ✅ | `weight` + `weight_unit` from `inventoryItem.measurement` | — |
| Price | ✅ | `price: v.price` | — |
| Compare-at price | ✅ | `compare_at_price: v.compareAtPrice` | — |
| Options (up to 3) | ✅ | `option1/2/3` from `selectedOptions` | — |
| Variant count | ⚠️ | Scanned `variants(first: 100)` | **101+ variants lost** |
| Dimensions (L×W×H) | ❌ | Not in scan or publish | N/A for this checklist |

**Pass for go-live?** ✅ for typical ActionKing SKUs (≤100 variants). Pilot: verify 3 multi-variant products manually.

**Pilot verification:**
- [ ] SKU match source for all variants on 20 products
- [ ] Barcode present where source had barcode
- [ ] Weight unit preserved (g/kg)
- [ ] Price + compare-at match source (or documented transform override)

---

## 3. Collections

| Check | Verified | Evidence | Pass for go-live? |
|-------|----------|----------|-------------------|
| Collection handles preserved | ✅ | `handle: src.handle` in `buildCollectionPayload` | Yes (definitions) |
| Collection definitions copied | ✅ | Custom + smart rules, SEO, image, `published: false` | Yes |
| **Custom collection membership** | ⚠️ Fixed locally | `linkProductToCollections()` → `collects.json` after product create + retroactive batch | **After deploy** |
| Smart collection membership | ⚠️ Rule-driven | Skipped in `collects.json`; depends on rules matching on target | Manual verify |
| Collections per product | ⚠️ | `collections(first: 50)` on product scan | 51+ memberships not scanned |
| Publish order | ✅ | `PUBLISH_TYPE_ORDER` — collections before products | Yes |

**Risks:** Collection not published before product → link fails (logged). `update_existing` path skips collection link.

**Pilot verification:**
- [ ] Each pilot product’s custom collections exist on target (same handles)
- [ ] `collection_linked` events in `cloner_logs`; zero `collection_link_failed`
- [ ] Run **Länka kollektioner (retroaktivt)** if any membership missing

---

## 4. Metafields

| Check | Verified | Evidence | Pass for go-live? |
|-------|----------|----------|-------------------|
| Product metafields copied | ⚠️ Partial | Up to **50** per product in REST create payload | Pilot + defs on target |
| **Variant metafields copied** | ❌ | **Not scanned** — no `variantMetafields` in `PRODUCT_QUERY` | **NO-GO for variant metafields** |
| SEO title (`global.title_tag`) | ✅ | From `seo.title` or transform | Yes |
| SEO description (`global.description_tag`) | ✅ | From `seo.description` or transform | Yes |
| Reference metafields (product/collection GIDs) | ⚠️ | Copied at create with **source GIDs**; fixed by `remap_metafields: true` | Manual step required |
| Metafield definitions on target | ⚠️ | Must exist before publish | Ops prerequisite |

**Risks:** Type mismatch or missing definition → product create fails. Unmapped GIDs stay broken after remap.

**Pilot verification:**
- [ ] Metafield count ≤50 per pilot product; spot-check 5 namespaces/keys
- [ ] Run **Remappa metafält-GIDs** after publish
- [ ] Confirm variant metafields **not required** for pilot SKUs (or accept loss)

---

## 5. Redirects

| Check | Verified | Evidence | Pass for go-live? |
|-------|----------|----------|-------------------|
| Redirect `target` domain rewritten | ✅ (local) | `rewriteRedirectTarget()` uses source store domains + `transformation.old_domain` | **After deploy** |
| Relative paths preserved | ✅ | `/products/foo` unchanged | Yes |
| **No ActionKing URLs in redirects** | ⚠️ | Rewritten when host matches known source domains | Verify sample of 10 |
| ActionKing in **menus** | ❌ | `menuCreate` copies `url: mi.url` unchanged | Manual fix or remap |
| ActionKing in **product HTML** | ⚠️ | `body_html` copied as-is unless AI transform rewrites | Spot-check descriptions |
| ActionKing in **theme assets** | ⚠️ | Separate `remap_theme_settings` step | If themes in scope |

**Pilot verification:**
- [ ] Publish redirect items in pilot scope (if any)
- [ ] Grep redirect targets in EuroDroneParts Admin — no `actionking` host
- [ ] Check navigation menu URLs if menus published

---

## Pre-go-live operator sequence

```
1. Deploy shopify-cloner-scan + shopify-cloner-publish + ShopifyCloner.tsx
2. Create metafield definitions on EuroDroneParts (match ActionKing pilot SKUs)
3. Scan ActionKing → migration items
4. Select 20 products + required collections → approve
5. Dry run → confirm zero Shopify writes
6. mode = create_only → publish collections → publish 20 products
7. Link collections (retroactive) → remap metafields
8. Download clone report → verify logs
9. Shopify Admin: 20× Draft, spot-check images/variants/metafields/collections
10. Do NOT activate products or publish collections to Online Store
```

**Automation:** `node scripts/run-pilot-clone.mjs` (requires `SUPABASE_SERVICE_ROLE_KEY`)

---

## Go-live gate checklist

### Engineering (must be green)

- [ ] E1 — `shopify-cloner-publish` deployed with collection link + redirect rewrite
- [ ] E2 — `shopify-cloner-scan` deployed with `collections` on product query
- [ ] E3 — Frontend publish confirmation + progress deployed
- [ ] E4 — `product_draft_safety_log` migration applied (if using draft audit)

### Operations (must be green for pilot)

- [ ] O1 — 20 products published, all **Draft** in Shopify Admin
- [ ] O2 — Zero `product_failed` in `cloner_logs` for pilot batch
- [ ] O3 — Image count matches source for 20/20 (or documented exceptions)
- [ ] O4 — Collection membership verified for custom collections on 20/20
- [ ] O5 — `remap_metafields` completed; no broken reference metafields on sample
- [ ] O6 — Redirect sample: no ActionKing domain in redirect targets
- [ ] O7 — `PILOT_CLONE_REPORT.md` verdict upgraded to **GO** or **CONDITIONAL GO**

### Explicitly out of scope for pilot GO

- Variant metafields (not supported — accept loss or defer)
- Full catalog clone
- Search & Discovery / Markets
- ACTIVE status / sales channel publish
- Live Sunsky inventory sync

---

## Scoring summary

| Area | Score (1–10) | Pilot-ready? |
|------|:------------:|:------------:|
| Product images | 7 | ⚠️ |
| Variants | 9 | ✅ |
| Collections | 7 | ⚠️ (after deploy) |
| Metafields | 5 | ⚠️ (no variant metafields) |
| Redirects | 6 | ⚠️ (redirects only; menus/HTML not) |
| Draft safety | 9 | ✅ |
| Deploy / evidence | 2 | ❌ |

**Weighted pilot readiness: 6.5 / 10 — CONDITIONAL GO at 20 products**

---

## Final recommendation

### **NO-GO** for full production migration today

### **CONDITIONAL GO** for **20-product draft pilot** when:

1. Cloner fixes are **committed and deployed**
2. Metafield definitions exist on EuroDroneParts
3. `scripts/run-pilot-clone.mjs` completes with **≥20 published**, **0 failed**
4. Manual Admin verification passes sections 1–5 above
5. Team accepts: **no variant metafields**, **menus/HTML may retain ActionKing links**, **inventory is snapshot only**

### After successful 20-product pilot

| Next step | Size |
|-----------|------|
| Expand to 100 products | Batch of 25–50 with same checks |
| Full catalog | Only after 100-product wave shows &lt;2% failure rate |
| Go-live (ACTIVE) | Separate inventory verification + `activate-product-launch` — not part of cloner |

---

## Related documents

- `SHOPIFY_CLONER_PRODUCTION_AUDIT.md` — full 14-area audit
- `SHOPIFY_CLONER_TEST_PLAN.md` — phased manual tests
- `PILOT_CLONE_REPORT.md` — live pilot results (currently NO-GO)
- `COMMIT_PLAN.md` — deploy commit order

---

*Sign-off: Engineering ___ Operations ___ Date ___*
