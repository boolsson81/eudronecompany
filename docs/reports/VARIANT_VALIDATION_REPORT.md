# Sunsky Variant Mapper — Live Validation Report

**Date:** 2026-06-08  
**Mapper version:** PR-V0 (fixed `key`/`value` + `optionList.items`)  
**Method:** 20 live Sunsky products via deployed `sunsky-sync` (`search-products` + `get-product-detail`)  
**Raw output:** `scripts/variant-validation-output.json`  
**Re-run:** `node scripts/validate-sunsky-variants.mjs`

---

## Executive Summary

| Metric | Result |
|--------|--------|
| **Products validated** | **20** |
| **Unique variant families (`groupItemNo`)** | **14** |
| **`groupItemNo` populated** | **20 / 20 (100%)** |
| **`modelList` populated (mapper)** | **18 / 20 (90%)** |
| **`optionList` populated (mapper)** | **1 / 20 (5%)** |
| **Parse failures** | **0** |
| **Verdict** | **PASS** — mapper correctly parses all API variant data present |

The two products without `modelList` had **no `modelList` in the raw API** (`raw_modelList_len: 0`). Nineteen products had **no `optionList` in the raw API** — `optionList` is uncommon except on cross-spec product lines (e.g. 12W vs 20W cables).

---

## Validation Criteria

| Check | Pass condition |
|-------|----------------|
| `groupItemNo` | Normalized `group_item_no` non-empty |
| `modelList` | If `raw.modelList.length > 0`, then `model_list` has same count with valid `itemNo` + `label` |
| `optionList` | If `raw.optionList.items.length > 0`, then `option_list.items` parsed with `itemNo` + `keywords` |
| Parse failure | Raw variant data present but normalized output empty |

---

## Aggregate Results

```
Product count:              20
Variant family count:       14  (unique groupItemNo)
Multi-model families:       13  (model_list.length > 1)
Single-SKU (no modelList):   2
Option branches (optionList): 1

groupItemNo populated:      20/20  ████████████████████ 100%
modelList populated:        18/20  ██████████████████░░  90%
optionList populated:        1/20  █░░░░░░░░░░░░░░░░░░   5%
Parse failures:              0/20  ░░░░░░░░░░░░░░░░░░░░   0%
```

### Family overlap (duplicate `groupItemNo` in sample)

Several search hits returned **siblings from the same family** (expected):

| `groupItemNo` | Products in sample | `model_list` size |
|---------------|-------------------|-------------------|
| `EDA0078232` | 2 (EDA007823201C, EDA007823201D) | 4 |
| `EDA0046522` | 2 (EDA004652215A, EDA004652222A) | 0 each |
| `IP6D0894` | 4 (IP6D0894B/CW/D/F/TT…) | 6 |
| `TBD049838601` | 2 (TBD049838601J, TBD049838601Q) | 22 |

This confirms the mapper returns **identical family metadata** regardless of which sibling SKU is fetched.

---

## Per-Product Results

| # | itemNo | groupItemNo | modelLabel | modelList | optionList | Type | Status |
|---|--------|-------------|------------|-----------|------------|------|--------|
| 1 | EDA002324802E | EDA002324802 | Color | 5 | 2 (text) | multi_model + options | OK |
| 2 | TBD0601904301A | TBD0601904301 | Light color | 6 | 0 | multi_model | OK |
| 3 | EDA007823201D | EDA0078232 | Color | 4 | 0 | multi_model | OK |
| 4 | EDA007823201C | EDA0078232 | Color | 4 | 0 | multi_model | OK |
| 5 | CA3220J | CA3220 | Color | 7 | 0 | multi_model | OK |
| 6 | EDA002556701L | EDA002556701 | Color | 18 | 0 | multi_model | OK |
| 7 | EDA004652222A | EDA0046522 | — | 0 | 0 | single_sku | OK (no raw modelList) |
| 8 | EDA004652215A | EDA0046522 | — | 0 | 0 | single_sku | OK (no raw modelList) |
| 9 | EDA006783201I | EDA0067832 | Color | 12 | 0 | multi_model | OK |
| 10 | EDA006833501B | EDA0068335 | Color | 11 | 0 | multi_model | OK |
| 11 | EDA006898901D | EDA0068989 | Color | 4 | 0 | multi_model | OK |
| 12 | EDA007734701F | EDA0077347 | Color | 10 | 0 | multi_model | OK |
| 13 | EDA007775001D | EDA0077750 | Color | 8 | 0 | multi_model | OK |
| 14 | IP6D0894F | IP6D0894 | Color | 6 | 0 | multi_model | OK |
| 15 | IP6D0894TT | IP6D0894 | Color | 6 | 0 | multi_model | OK |
| 16 | IP6D0894D | IP6D0894 | Color | 6 | 0 | multi_model | OK |
| 17 | IP6D0894CW | IP6D0894 | Color | 6 | 0 | multi_model | OK |
| 18 | TBD048885101G | TBD048885101 | Color | 8 | 0 | multi_model | OK |
| 19 | TBD049838601J | TBD049838601 | Color: | 22 | 0 | multi_model | OK |
| 20 | TBD049838601Q | TBD049838601 | Color: | 22 | 0 | multi_model | OK |

---

## Spot Checks (mapper correctness)

### `EDA002324802E` — official OpenAPI fixture

| Field | Raw API | Mapped |
|-------|---------|--------|
| `groupItemNo` | `EDA002324802` | `EDA002324802` |
| `modelLabel` | `Color` | `Color` |
| `modelList[0]` | `{ key: EDA002324802A, value: Pink }` | `{ itemNo: EDA002324802A, label: Pink }` |
| `optionList.display` | `text` | `text` |
| `optionList.items[0]` | `{ keywords: 12W, itemNo: EDA002324801E }` | `{ keywords: 12W, itemNo: EDA002324801E }` |

### `TBD0601904301A` — search API fixture

| Field | Raw | Mapped |
|-------|-----|--------|
| `modelList` | 6 entries (`key`/`value`) | 6 entries with labels White, Yellow, Blue… |
| `groupItemNo` | `TBD0601904301` | `TBD0601904301` |

---

## Products Missing Variant Metadata

### Parse failures (mapper bug)

**None.** Zero products had raw variant data that failed to map.

### No `modelList` in API (not a mapper gap)

| itemNo | groupItemNo | Notes |
|--------|-------------|-------|
| EDA004652222A | EDA0046522 | `raw_modelList_len: 0` — Sunsky returns no siblings on detail |
| EDA004652215A | EDA0046522 | Same shared group prefix; still single-SKU response |

These share `groupItemNo` but Sunsky did not attach a `modelList` array. Import should treat them as **Type A single-SKU** until a sibling SKU is discovered.

### No `optionList` in API (expected rarity)

**19 / 20 products** had `raw_optionList_len: 0`. Only `EDA002324802E` exposed `optionList` (12W vs 20W branches).

This is a **catalog characteristic**, not a mapper failure. EuroDroneParts drone searches may under-sample `optionList`; cable/charger searches would increase hit rate.

---

## Implications for Pipeline

| Layer | Status after V0 |
|-------|-----------------|
| **Mapper** | Production-ready for variant metadata extraction |
| **Import dedup** | Still needed — sample contains 2+ SKUs per family (PR-V1) |
| **Shopify multi-variant** | Still not implemented (PR-V2) |
| **Backfill** | Recommended for existing `supplier_raw` rows imported before V0 |

---

## Search Terms Used

```
drone, USB cable, propeller, battery, gimbal, phone case, charger, LED,
camera, motor, ESC, frame, antenna, connector, adapter
```

Plus seeded SKUs: `EDA002324802E`, `TBD0601904301A` (OpenAPI examples).

---

## Conclusion

**PR-V0 mapper validation: PASS**

- All 20 live products returned valid `groupItemNo`
- 18/18 products with raw `modelList` mapped correctly (100% of applicable)
- 1/1 product with raw `optionList` mapped correctly (100% of applicable)
- 0 parse failures

**Next step:** PR-V1 family dedup on import using `group_item_no` + `model_list[].itemNo`.

---

## Related Documents

- [SUNSKY_VARIANT_MAPPER_FIX.md](./SUNSKY_VARIANT_MAPPER_FIX.md) — Before/after mapper fix
- [SUNSKY_VARIANT_STATUS.md](./SUNSKY_VARIANT_STATUS.md) — Pre-V0 pipeline status
- [SUNSKY_VARIANT_ARCHITECTURE.md](./SUNSKY_VARIANT_ARCHITECTURE.md) — Target variant architecture
