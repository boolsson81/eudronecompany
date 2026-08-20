# Pilot Clone Report — ActionKing → EuroDroneParts

**Generated:** 2026-06-08  
**Migration:** ActionKing → EuroDroneParts (expected)  
**Pilot size:** 20 products  
**Execution status:** **Not executed** — blocked locally (no `SUPABASE_SERVICE_ROLE_KEY`; anon API returns 401 on `cloner_migrations`)

---

## Summary

| Metric | Count |
|--------|------:|
| Total selected | 0 |
| Total cloned (published) | 0 |
| Failed products | 0 |
| Skipped | 0 |
| Draft safety enforced | ⚠️ Not verified live (enforced in code) |

---

## Field gaps (requirements vs cloner capability)

| Check | Result |
|-------|--------|
| Missing images (publish failures) | **Not measured** — pilot not run |
| Missing metafields | **Not measured** — pilot not run |
| Missing collections (link failures) | **Not measured** — pilot not run |
| Missing variants | **Not measured** — pilot not run |
| Missing HS codes (compliance hook) | **Not measured** — pilot not run |
| Missing barcodes | **Not measured** — pilot not run |
| **Missing dimensions** | **Known gap — cloner does not scan or publish variant dimensions** |
| Missing weight | **Not measured** — weight supported in code when present on source |

### Pre-flight code audit (static)

| Requirement | Cloner support | Risk if not addressed |
|-------------|----------------|----------------------|
| All products **DRAFT** | ✅ `status: 'draft'` hardcoded | Low — verify in Admin after run |
| Copy all **images** | ✅ URL re-host; variant link post-create | Medium — silent image link failures |
| Copy all **variants** | ✅ ≤100 per product | Low for ActionKing typical SKUs |
| Copy all **metafields** | ⚠️ ≤50 product-level; remap pass for refs | High — defs must exist on target |
| Copy **HS code** | ✅ Post-create `inventoryItemUpdate` by SKU | Medium — SKU mismatch skips |
| Copy **barcode** | ✅ In REST variant payload | Low |
| Copy **weight** | ✅ `weight` + `weight_unit` on variant | Low |
| Copy **dimensions** | ❌ **Not implemented** | **High — requirement cannot pass** |
| Copy **collections** | ✅ Custom via `collects.json` (fixed, not deployed) | Medium — publish collections first |
| Copy **vendor** | ✅ | Low |
| Copy **SEO title + meta description** | ✅ `global.title_tag` / `description_tag` | Low |

---

## Per-product results

*No products cloned — execution blocked.*

---

## Recent cloner logs

*Not queried — service role required.*

---

## How to run the pilot

1. **Deploy** `shopify-cloner-scan` + `shopify-cloner-publish` (local fixes not on production yet).
2. Ensure migration **ActionKing → EuroDroneParts** exists and products are scanned.
3. Create metafield definitions on EuroDroneParts matching ActionKing namespaces used by pilot SKUs.
4. Run:

```powershell
cd C:\Users\Bengt-Olof\Projects\digitalsignal
$env:SUPABASE_URL = "https://wsncjdajweoujhidlxas.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "<from Supabase dashboard>"
node scripts/run-pilot-clone.mjs
```

Optional dry run first:

```powershell
$env:DRY_RUN = "1"
node scripts/run-pilot-clone.mjs
```

5. In Shopify Admin (EuroDroneParts): confirm **20 × Draft**.
6. Re-run without `DRY_RUN` — script overwrites `PILOT_CLONE_REPORT.md` with live metrics.

---

## Requirements checklist

- **All products DRAFT:** ✅ Enforced in code — ⚠️ not verified live
- **Copy all images:** ⚠️ Supported — not verified
- **Copy all variants:** ⚠️ ≤100 — not verified
- **Copy all metafields:** ⚠️ ≤50 + remap — not verified
- **Copy HS code:** ⚠️ Post-create hook — not verified
- **Copy barcode:** ⚠️ Supported — not verified
- **Copy weight:** ⚠️ Supported — not verified
- **Copy dimensions:** ❌ **Not supported by cloner**
- **Copy collections:** ⚠️ Custom collections — not verified
- **Copy vendor:** ⚠️ Supported — not verified
- **Copy SEO title + description:** ⚠️ Supported — not verified

---

## Verdict

### **NO-GO**

**Reasons:**

1. **Pilot not executed** — cannot confirm clone results without service role access and deployed cloner fixes.
2. **Dimensions requirement fails** — `shopify-cloner-scan` / `shopify-cloner-publish` do not copy length/width/height (only weight).
3. **Production code not deployed** — collection linking, redirect rewrite, and structured logging exist only in uncommitted local changes.

**Path to CONDITIONAL GO (20-product draft pilot):**

| Step | Owner |
|------|-------|
| Deploy cloner edge functions + frontend | Engineering |
| Run `scripts/run-pilot-clone.mjs` with service role | Operations |
| Verify 20× Draft in EuroDroneParts Admin | Operations |
| Accept dimensions gap OR implement dimension scan/publish (1–2 days) | Engineering |

**Path to GO:** Pilot script reports 20/20 published, zero `product_failed`, zero `collection_link_failed` / `image_failed` / `metafield_failed` in logs, and manual Admin check confirms Draft + images + variants + HS sample.

---

*Report generated statically. Re-run `scripts/run-pilot-clone.mjs` after deploy for live metrics.*
