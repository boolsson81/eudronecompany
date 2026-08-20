# DJI Compatibility Engine

**Date:** 2026-06-08  
**Status:** Implemented (import + publish)  
**Related:** [DJI_COMPATIBILITY_ARCHITECTURE.md](./DJI_COMPATIBILITY_ARCHITECTURE.md), [DJI_COLLECTION_RULES.md](./DJI_COLLECTION_RULES.md), [DJI_FILTER_SETUP.md](./DJI_FILTER_SETUP.md)

---

## Overview

The DJI compatibility engine turns Sunsky **`optionList`** branches and product **titles** into normalized DJI model metadata at import time, then publishes **Shopify `dji.*` metafields**, **search tags**, **SEO compatibility blocks**, and **model collections** on Sunsky publish.

```
Sunsky detail.do
  → normalizeSunskyProduct()
  → extractDjiCompatibility()      [_shared/dji-compatibility.ts]
  → pages.supplier_normalized.dji_compatibility
  → inventory.supplier_metadata.dji_compatibility
  → publish-sunsky-to-shopify
  → metafieldsSet (dji.*) + collectionAddProducts + tags
```

---

## Modules

| File | Purpose |
|------|---------|
| `supabase/functions/_shared/dji-compatibility.ts` | Parse, normalize, classify optionList |
| `supabase/functions/_shared/dji-shopify-publish.ts` | Metafields + collection assignment |
| `supabase/functions/_shared/dji-compatibility.test.ts` | Unit tests (6 cases) |
| `supabase/functions/_shared/sunsky-product-map.ts` | Calls extractor on every normalize |
| `supabase/functions/_shared/sunsky-import.ts` | Persists `dji_compatibility` in metadata |
| `supabase/functions/publish-sunsky-to-shopify/index.ts` | Publishes to Shopify on draft create |

---

## Import pipeline

On every `normalizeSunskyProduct()`:

1. Parse `variant_group.option_list` (PR-V0 shape).
2. Classify each `keywords` string: **model** | **kit** | **spec**.
3. Detect DJI models from **title** + **current SKU branch** (not kit-picker siblings).
4. Infer `accessory_type` from title (propeller, battery, charger_hub, …).
5. Build `DjiCompatibilityRecord` and attach to `supplier_normalized`.

**Stored locations:**

| Location | Field |
|----------|-------|
| `pages.supplier_normalized` | `dji_compatibility` (full record) |
| `inventory.supplier_metadata` | `dji_compatibility` (full record) |

**Non-DJI products:** `dji_compatibility: null` (no overhead on publish).

---

## optionList classification

| `option_list_role` | When | Models extracted? |
|--------------------|------|-------------------|
| `compatibility` | All branches are model keywords | Yes — per branch |
| `kit_picker` | Transmitter, lens cover, hood, etc. | No — kit labels ignored |
| `mixed` | Model + kit branches | Title models only + model branches |
| `none` | Empty optionList | Title only |

**Current SKU rule:** If `item_no` matches an `optionList` branch, models from **that branch's keywords** are merged with title models.

---

## Canonical model IDs

| `model_id` | Display | `series` |
|------------|---------|----------|
| `dji_neo` | DJI Neo | `dji_consumer_mini` |
| `dji_neo_2` | DJI Neo 2 | `dji_consumer_mini` |
| `dji_flip` | DJI Flip | `dji_consumer_mini` |
| `dji_mini_4_pro` | DJI Mini 4 Pro | `dji_consumer_mini` |
| `dji_air_3` | DJI Air 3 | `dji_consumer_air` |
| `dji_air_3s` | DJI Air 3S | `dji_consumer_air` |
| `dji_mavic_4_pro` | DJI Mavic 4 Pro | `dji_consumer_mavic` |
| `dji_avata` / `dji_avata_2` | DJI Avata / Avata 2 | `dji_fpv` |
| `dji_matrice*` | DJI Matrice variants | `dji_enterprise` |

Extended IDs (Mini 3, Mavic 3, Inspire 3, etc.) are detected for metadata but only the **8 launch collections** in [DJI_COLLECTION_RULES.md](./DJI_COLLECTION_RULES.md) are auto-assigned.

---

## Shopify metafields published

Namespace: **`dji`** (product-level)

| Key | Type | Example |
|-----|------|---------|
| `compatible_models` | `list.single_line_text_field` | `["dji_mini_4_pro","dji_mini_3_pro"]` |
| `compatible_models_display` | `list.single_line_text_field` | `["DJI Mini 4 Pro","DJI Mini 3 Pro"]` |
| `series` | `list.single_line_text_field` | `["dji_consumer_mini"]` |
| `accessory_type` | `single_line_text_field` | `propeller` |
| `option_list_role` | `single_line_text_field` | `compatibility` |
| `confidence` | `single_line_text_field` | `high` |

**Prerequisite:** Create definitions in Shopify Admin (see [DJI_FILTER_SETUP.md](./DJI_FILTER_SETUP.md)) before first publish.

---

## Publish side effects

On `publish-sunsky-to-shopify` (create path):

1. **Tags:** `dji:mini-4-pro`, `part:propeller`, etc.
2. **Description:** Appends `<section class="ai-compatibility">` with Swedish *Passar till* text.
3. **Metafields:** `metafieldsSet` for all `dji.*` keys.
4. **Collections:** Auto-add to matching model collections (see collection rules doc).

---

## Search & SEO support

| Consumer | How |
|----------|-----|
| **Shopify Search & Discovery** | Filter on `dji.compatible_models_display`, `dji.series`, `dji.accessory_type` |
| **Storefront tags** | `dji:*` and `part:*` tags on product |
| **SEO / GEO** | Compatibility HTML block in `descriptionHtml`; `seo_compatibility_text` for generate-seo JSON payloads |
| **Internal search (planned)** | Read `supplier_metadata.dji_compatibility` or `supplier_normalized.dji_compatibility` when indexing pages |

**generate-seo:** Pass `compatibility` in product JSON body:

```json
{ "compatibility": "Passar till: DJI Mini 4 Pro, DJI Air 3." }
```

Source: `pages.supplier_normalized.dji_compatibility.seo_compatibility_text`

---

## Tests

```bash
deno test supabase/functions/_shared/dji-compatibility.test.ts
```

| Test | Validates |
|------|-----------|
| Keyword classification | Model vs kit |
| Multi-model title | Avata 2 + Mini 4 Pro + Air 3 |
| Flip axis false positive | Ronin kit excluded |
| Propeller optionList | Mini 4/3 Pro + accessory_type |
| Kit picker | No spurious models |
| Non-DJI | Returns null |

---

## Implementation effort

| Task | Effort | Status |
|------|--------|--------|
| Core extractor + tests | 1 day | ✅ Done |
| Import integration | 0.25 day | ✅ Done |
| Publish metafields + collections | 0.5 day | ✅ Done |
| Shopify metafield definitions (Admin) | 0.25 day | ⏳ Manual setup |
| Smart collection rules (automated) | 0.25 day | ✅ On publish |
| Search & Discovery filter enable | 0.25 day | ⏳ Manual setup |
| ai-search index wiring | 0.5 day | 📋 Documented / future |
| Backfill existing Sunsky pages | 0.5 day | 📋 Re-import or script |

**Total implemented:** ~2 dev-days  
**Remaining ops/setup:** ~0.75 day

---

## Files changed

| File | Change |
|------|--------|
| `supabase/functions/_shared/dji-compatibility.ts` | **New** — engine |
| `supabase/functions/_shared/dji-shopify-publish.ts` | **New** — Shopify publish helpers |
| `supabase/functions/_shared/dji-compatibility.test.ts` | **New** — tests |
| `supabase/functions/_shared/sunsky-product-map.ts` | Added `dji_compatibility` to normalized product |
| `supabase/functions/_shared/sunsky-import.ts` | Persist `dji_compatibility` in metadata |
| `supabase/functions/publish-sunsky-to-shopify/index.ts` | Metafields, collections, tags, SEO block |
| `DJI_COMPATIBILITY_ENGINE.md` | **New** — this doc |
| `DJI_COLLECTION_RULES.md` | **New** — collection automation |
| `DJI_FILTER_SETUP.md` | **New** — filter setup guide |

---

## Backfill

Re-import Sunsky SKUs or run a one-off script:

```typescript
import { normalizeSunskyProduct } from "./sunsky-product-map.ts";
// For each page with supplier_raw:
const normalized = normalizeSunskyProduct(raw, raw);
// UPDATE pages SET supplier_normalized = normalized
// UPDATE inventory SET supplier_metadata = jsonb_set(..., '{dji_compatibility}', ...)
```

Re-publish drafts to push metafields to Shopify.

---

## Limitations

1. **Kit-picker optionList** — no drone models extracted (by design).
2. **Phase V2 variants** — per-branch variant metafields not implemented; whole-product metadata only.
3. **Smart collections in Admin** — publish uses **manual** collections (`collectionAddProducts`); Shopify smart rules are optional parallel (see collection doc).
4. **Metafield definitions** — must exist in Shopify before `metafieldsSet` succeeds.
