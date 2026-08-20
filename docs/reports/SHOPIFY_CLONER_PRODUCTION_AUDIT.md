# Shopify Cloner — Production Readiness Audit

**Date:** 2026-06-08  
**Scope:** Full cloner path (`shopify-cloner-*`) for **ActionKing → EuroDroneParts**  
**Evidence:** Static code review of `shopify-cloner-scan`, `shopify-cloner-publish`, `shopify-cloner-transform`, `shopify-cloner-worker`, `ShopifyCloner.tsx`, shared modules (`cloner-collection-link`, `cloner-inventory-compliance`, `product-draft-safety`)  
**Deploy state:** Fixes are **local and uncommitted** — production still runs pre-fix baseline (`8fa7aefb`)

---

## Verdict

| Scenario | Decision | Rationale |
|----------|----------|-----------|
| **20-product draft pilot** (ActionKing → EuroDroneParts) | **CONDITIONAL GO** | After deploy + dry-run + operator confirmation. Draft safety enforced in code. |
| **Full catalog clone to production** | **NO-GO** | Metafield gaps, inventory decoupling, Search & Discovery absent, no rollback, code not deployed. |
| **Go-live (ACTIVE + sales channels)** | **NO-GO** | Draft safety blocks activation until inventory verified — by design. |

**Overall: CONDITIONAL GO for controlled pilot only. NO-GO for full production migration until P0 fixes land and are verified.**

---

## 1. Clone Workflow

### What works

| Stage | Status | Notes |
|-------|--------|-------|
| Store connect | ✅ | `shopify-cloner-connect`; tokens server-side |
| Scan → `cloner_migration_items` | ✅ | GraphQL pagination; worker queue for large catalogs |
| Optional AI transform | ⚠️ | `shopify-cloner-transform` — rewrites content (not faithful copy) |
| Approve / reject | ✅ | `approval_status` gate on publish |
| Publish batches | ✅ | 25/batch default; sort collections before products |
| Dry run | ✅ | `migration.mode === 'dry_run'` |
| Operator confirmation | ✅ | UI dialog + summary (local, not deployed) |
| Background jobs | ✅ | `cloner_jobs` + `shopify-cloner-worker` cron |

### What can break

- **Transform enabled:** AI invents FAQ/tags — not a 1:1 clone.
- **Partial batches:** Failed items stay `publish_status=failed`; successful items are `published` — migration is resumable but inconsistent mid-run.
- **Worker timeout:** Large scans split by type; products/files still heavy.
- **Token/env fallback:** Hardcoded ActionKing/EuroDroneParts env mapping in scan/publish — breaks if tokens rotate without DB update.

### Data loss risks

- Scan caps: variants ≤100, metafields ≤50, collections per product ≤50, media first page 100 (extra pages fetched via `PRODUCT_MEDIA_QUERY` in scan).
- Products with 101+ variants lose tail variants permanently in scan payload.

---

## 2. Collections

### Cloned

| Item | Status |
|------|--------|
| Custom collection definitions | ✅ title, handle, body, image, SEO metafields, `published: false` |
| Smart collection rules | ✅ rules + disjunctive flag |
| Collection sort order | ✅ |
| **Custom collection membership** | ✅ **Fixed** — `collects.json` on product create + retroactive `link_collections` batch |

### Not cloned / partial

| Item | Status | Risk |
|------|--------|------|
| Smart collection membership | ⚠️ Rule-driven only | Rules may not match if tags/vendor/transform differ |
| Collection >50 per product | ❌ | Membership beyond 50 handles never scanned |
| Collection sales channel publish | ❌ | All collections `published: false` |
| Search & Discovery collection pins | ❌ | Not in API surface used |

### Collection assignment risks

| Risk | Severity | Detail |
|------|----------|--------|
| Collection not published before product | Medium | Mitigated by `PUBLISH_TYPE_ORDER` (collections first) |
| Smart collection skipped in `linkProductToCollections` | Medium | Expected — relies on rules re-evaluating on target |
| `update_existing` path skips collection link | **High** | Linking only runs on **create**, not update |
| Target collection missing | Medium | Logged as `collection_link_failed`; product still created |
| Smart vs custom mis-detect | Low | `ruleSet` on product.collections.nodes triggers smart skip |

---

## 3. Metafields

### Cloned

| Item | Status |
|------|--------|
| Product metafields (≤50) | ✅ In REST create payload |
| Collection/page metafields | ✅ |
| SEO as `global.title_tag` / `description_tag` | ✅ |
| Metafield definitions scan | ✅ Separate scope type |
| Reference GID remap | ⚠️ **Manual step** — `remap_metafields: true` after publish |

### Not cloned / risks

| Item | Status | Risk |
|------|--------|------|
| Variant-level metafields | ❌ Not scanned | Data loss |
| Metafields 51+ | ❌ | Silent truncation |
| Definitions auto-created on target | ⚠️ | `metafieldDefinitionCreate` exists but must be approved + published first |
| Reference metafields at create time | ❌ | Point at source GIDs until remap pass |
| `dji.*` / custom defs missing on target | **High** | Create fails or metafields dropped if definition absent |
| JSON metafield type mismatches | Medium | Invalid values fail whole product create |

### Metafield mapping risks

- Remap only handles `REFERENCE_TYPES` set; other cross-object refs stay broken.
- Unmapped GIDs silently keep source IDs in remap loop (`remapped.push(gid)`).
- No validation that target definition `type` matches source.

---

## 4. Product Images

### Cloned

| Item | Status |
|------|--------|
| Image URLs (re-hosted by Shopify) | ✅ |
| Alt text | ✅ Fallback generated from title if missing |
| Variant ↔ image link | ⚠️ Post-create by position |
| Optional WebP proxy (weserv.nl) | ⚠️ Optional via `imageOptimization` |
| Image dry-run test | ✅ `image_test` mode |

### Not cloned / risks

| Item | Risk |
|------|------|
| Video / 3D media | ❌ Filtered to `MediaImage` only |
| 100+ images | ⚠️ Extra pagination in scan; failures if pagination incomplete |
| Original filenames | ❌ Renamed to `{handle}-01.webp` |
| Variant image link failures | **Silent** — `.catch(() => null)` in `linkVariantImages` |
| CDN / hotlink blocks | Medium — Shopify fetch from source URL can fail → product create error |
| Image optimization changes bytes | Low — not byte-identical to source |

---

## 5. Variants

### Cloned

| Item | Status |
|------|--------|
| Options, SKU, price, compare-at | ✅ |
| Barcode | ✅ |
| Weight | ✅ |
| Inventory policy | ✅ |
| Aggregate `inventory_quantity` | ✅ |
| Tracked vs untracked | ✅ `inventory_management` |
| HS code + country (post-create) | ✅ `linkVariantInventoryCompliance` by SKU match |

### Not cloned / risks

| Item | Risk |
|------|------|
| Variants 101+ | **Data loss** at scan |
| Cost price (`unitCost`) | ❌ Not scanned |
| Per-location inventory levels | ❌ |
| Variant metafields | ❌ |
| SKU mismatch → compliance skip | Medium — unmatched SKUs logged, no HS/COO |
| Duplicate SKU on source | Medium — Map keeps last SKU in compliance hook |
| Shopify 100-variant REST limit | Low for ActionKing catalog; fatal if exceeded |

---

## 6. SEO Fields

### Cloned

| Field | Mechanism |
|-------|-----------|
| Product SEO title | `seo.title` → `global.title_tag` metafield + transform override |
| Product SEO description | `seo.description` → `global.description_tag` |
| Collection SEO | Same pattern via `seoMetafields()` |
| Handle | ✅ Preserved |
| Tags | ✅ (transform may rewrite) |
| Product taxonomy category | ❌ Scanned (`category { id name }`) but **not published** |
| `hreflang` / market-specific SEO | ❌ Requires translation pass |

### Risks

- AI transform changes titles/descriptions — SEO parity not guaranteed.
- Collection/page SEO fine; product JSON-LD on theme depends on theme + metafields existing on target.

---

## 7. Redirects

### Cloned

| Item | Status |
|------|--------|
| Path + target | ✅ `redirects.json` |
| Domain rewrite | ✅ **Fixed** — `rewriteRedirectTarget()` to target `primary_domain` |

### Risks

| Risk | Detail |
|------|--------|
| `old_domain` not set in transformation | Partial rewrite — relies on store domains only |
| Relative targets | ✅ Preserved (correct) |
| Redirect limit / duplicates | Medium — re-run may 422; not always idempotent |
| Wildcard / regex redirects | ❌ Shopify URL redirects only — no regex support |

---

## 8. Search & Discovery

| Item | Status |
|------|--------|
| Filter definitions | ❌ Not scanned or published |
| Search synonyms | ❌ |
| Complementary products | ❌ |
| Collection facets / pinned filters | ❌ |
| DJI model filters (EuroDroneParts) | ❌ Requires post-clone manual Admin setup or separate `dji-shopify-publish` on Sunsky imports |

**Impact:** Storefront filtering and merchandising blocks will not match ActionKing after clone. Navigation collections may work; faceted search will not.

---

## 9. Shopify Markets

| Item | Status |
|------|--------|
| Market definitions | ❌ Not scanned |
| Market-specific pricing | ❌ |
| Market catalogs | ❌ |
| Locales scan | ✅ `shopLocales` |
| Locale enable on target | ✅ `shopLocaleEnable` |
| Translations scan + publish | ⚠️ `translation` type — requires resource mapped on target first |

**Impact:** Single-market assumption. Multi-market ActionKing config is not reproduced. Translations are best-effort after base resources exist.

---

## 10. Draft Safety

| Rule | Status | Implementation |
|------|--------|----------------|
| Products created as DRAFT | ✅ | `status: 'draft'` hardcoded in `buildProductPayload` |
| Draft safety audit log | ✅ | `logDraftSafetyEvent` on create |
| Channel publish blocked | ✅ | No publish-to-Online-Store in cloner |
| Collections/pages `published: false` | ✅ |
| ACTIVE activation gate | ✅ | `activate-product-launch` requires approval + `inventory_flow_verified` |
| Cloned inventory marked `clone` source | ✅ | Metadata in safety log |

**Residual risk:** Operator manually sets ACTIVE in Shopify Admin — outside cloner control. EuroDroneParts process must enforce review before activation.

---

## 11. Inventory Integration

| Item | Status |
|------|--------|
| Copy source `inventory_quantity` to target | ✅ At create |
| HS / COO on InventoryItem | ✅ Post-create GraphQL |
| Per-location / warehouse mapping | ❌ |
| Tie-in to EuroDroneParts Sunsky sync | ❌ **Separate system** |
| `inventory_flow_verified` on cloned products | ❌ Not set by cloner |
| Real-time stock after clone | ❌ Cloned qty is point-in-time snapshot |

**Impact:** Cloner gives a **static stock snapshot** from ActionKing. EuroDroneParts ongoing inventory requires Sunsky/FTP pipeline (`sunsky-sync`, `publish-inventory-to-shopify`) wired per shop — not automatic after clone.

---

## 12. Sunsky Compatibility

| Question | Answer |
|----------|--------|
| Does cloner run Sunsky API? | **No** — reads ActionKing Shopify only |
| Are `dji.*` metafields preserved? | **If present on source** as product metafields (≤50 limit) |
| Does cloner invoke `dji-compatibility.ts`? | **No** — DJI engine is Sunsky import path only |
| Post-clone Sunsky sync | Manual — match SKUs in `inventory` / `pages` then run sync |

**Impact:** Clone duplicates Shopify state; it does **not** establish Sunsky supplier linkage on EuroDroneParts. Products need separate Sunsky SKU mapping for live stock.

---

## 13. Error Handling

| Area | Status |
|------|--------|
| Scan GraphQL throttling | ✅ Retry + backoff (scan only) |
| Publish REST 429 | ⚠️ 5 retries, linear backoff |
| Publish GraphQL (compliance, remap) | ❌ No retry — single attempt |
| Per-item failure isolation | ✅ Item → `failed`; batch continues |
| Structured logging | ✅ **Fixed locally** — `clone_started`, `product_failed`, etc. |
| Variant image errors | ❌ Swallowed |
| Rate limit on large catalog | **High** — 5 retry cap then batch fails |
| UI error display | ✅ Logs tab + failed items + downloadable report |

---

## 14. Rollback Capability

| Capability | Status |
|------------|--------|
| Automated rollback | ❌ **None** |
| Undo publish | ❌ No delete in cloner (by design — non-destructive) |
| Re-run with `skip_existing` | ✅ Idempotent skip on handle match |
| Re-run with `update_existing` | ⚠️ Updates product; **no collection re-link** |
| DB audit trail | ✅ `cloner_migration_items`, `cloner_logs`, `cloner_object_mappings` |
| Manual recovery | Delete drafts in Shopify Admin; fix items; re-publish failed only |

**Impact:** Mistakes require manual Shopify Admin cleanup. Clone report + mappings support forensic rollback planning, not execution.

---

## Risk Matrix

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Duplicate products (re-run `create_only`) | Medium | Medium | Use `skip_existing`; pre-flight handle report |
| Wrong collection membership | Medium | High | Publish collections first; run link batch; verify 20-product pilot |
| Broken reference metafields | High | High | Publish defs → products → `remap_metafields` |
| Silent variant image loss | Medium | Medium | Spot-check pilot; add link failure logging (open) |
| Stale inventory on target | High | High | Do not go live until Sunsky sync verified |
| AI transform alters catalog | High | Medium | Disable transform for faithful clone |
| Code not deployed | **Certain** | **Critical** | Commit + deploy before any pilot |
| 100+ variant products | Low | Critical | Pre-scan audit for ActionKing tail variants |

---

## Critical Issues (P0)

| # | Issue | Blocks |
|---|-------|--------|
| C1 | **Ecommerce fixes not committed or deployed** | Any production use of new behavior |
| C2 | **Metafield definitions must exist on target before product publish** | Products with custom metafields fail or drop fields |
| C3 | **Reference metafields require manual remap pass** | Broken cross-links until operator runs remap |
| C4 | **No Search & Discovery migration** | Broken filters/facets on EuroDroneParts |
| C5 | **Inventory is snapshot only — not wired to Sunsky** | Go-live stock wrong without separate sync |
| C6 | **Collection link skipped on `update_existing`** | Re-publish path leaves membership broken |
| C7 | **Pilot only after dry-run + 20-product verification** | Full catalog NO-GO until pilot passes |

---

## Recommended Fixes

| Priority | Fix | Effort |
|----------|-----|--------|
| **P0** | Commit + deploy `shopify-cloner-scan`, `shopify-cloner-publish`, frontend | 0.5 day |
| **P0** | Pre-flight: create metafield definitions on EuroDroneParts (incl. `dji.*` if used) | 1 day ops |
| **P0** | Run 20-product pilot checklist (`SHOPIFY_CLONER_TEST_PLAN.md` Phase 3) | 0.5 day |
| **P1** | Collection link on `update_existing` path | 0.5 day |
| **P1** | Log variant image link failures (stop swallowing) | 0.5 day |
| **P1** | GraphQL retry in publish (match scan backoff) | 1 day |
| **P1** | Auto-queue `remap_metafields` after product+collection publish | 1 day |
| **P1** | Menu URL rewrite (`old_domain` → `new_domain`) | 1 day |
| **P2** | Publish product taxonomy `category` | 1 day |
| **P2** | Scan/publish cost price via `inventoryItemUpdate` | 1 day |
| **P2** | Per-location inventory with location map config | 3–5 days |
| **P2** | Search & Discovery export/import research | 3–5 days |
| **P3** | Markets + pricing migration | 5+ days |
| **P3** | Automated rollback / unpublish tool (draft archive) | 3 days |

**Total P0 effort:** ~2 days engineering + 1 day ops  
**Total to full-catalog GO:** ~15–20 engineering days (excluding Markets)

---

## 20-Product Pilot — Minimum GO Checklist

- [ ] Deploy cloner fixes to Supabase + frontend
- [ ] Metafield definitions on EuroDroneParts match ActionKing namespaces used by pilot SKUs
- [ ] Migration mode: `create_only` after successful dry run
- [ ] Approve exactly 20 products + their collections
- [ ] Publish → link collections → remap metafields
- [ ] Verify: 20× Draft, handles match, images, HS code sample, collection membership
- [ ] Download clone report — zero unexplained `product_failed`
- [ ] **Do not** activate products or publish collections to Online Store

---

## Appendix: Clone Coverage Quick Reference

| Domain | Cloned | Not cloned |
|--------|--------|------------|
| Products (core) | ✅ draft | ACTIVE, taxonomy category |
| Variants | ✅ ≤100 | 101+, cost, variant metafields |
| Images | ✅ | video/3D, silent link failures |
| Metafields | ✅ ≤50 product | refs until remap, variant-level |
| SEO | ✅ title/desc/handle | market-localized |
| Collections | ✅ defs + custom membership | S&D settings, channel publish |
| Redirects | ✅ rewritten | — |
| Menus | ⚠️ URLs unchanged | domain rewrite |
| Translations | ⚠️ after base resources | markets pricing |
| Inventory | ⚠️ snapshot qty | locations, Sunsky live sync |
| Themes | ✅ | activate is manual |
| Draft safety | ✅ | manual Admin override |

---

## Sign-off

| Role | Pilot (20 draft) | Full catalog |
|------|------------------|--------------|
| Engineering | CONDITIONAL GO post-deploy | NO-GO |
| Operations | GO after checklist | NO-GO |
| Go-live sales | NO-GO | NO-GO |

*Next review: after 20-product pilot results + deploy confirmation.*
