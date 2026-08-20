# English Migration Dry-Run Report

**Generated:** 2026-06-13T17:55:52.567Z
**Store:** ya1xhg-x6.myshopify.com
**Mode:** DRY-RUN — **no live changes**

## Summary

| Check | Result |
|---|---|
| Collection merge verification | **PASS** |
| Redirect validation | **PASS** |
| Redirect live conflicts | **PASS** (0 conflicts) |
| **Overall** | **PASS — ready for execution approval** |

---

## 1. Collection merges

**6** merge groups · **1192** unique products across all groups

| canonical | sources | sum_before | union_after | overlap | canonical_exists | products_would_lose | verification |
| --- | --- | --- | --- | --- | --- | --- | --- |
| dji-air-3-series | dij-air-3-series | 3 | 3 | 0 | YES | 0 | PASS |
| dji-drones | dji | 84 | 87 | -3 | YES | 0 | PASS |
| dji-matrice-350-rtk | dji-matrice-350-rtk-rtk | 28 | 28 | 0 | YES | 0 | PASS |
| drone-accessories | drone-accessories-buy; drone-accessories-drone | 989 | 809 | 180 | YES | 0 | PASS |
| drone-filters | filter-drones-lins; filters-for-drones | 513 | 261 | 252 | YES | 0 | PASS |
| dji-neo-spare-parts | repair-dji-neo-spare-parts | 4 | 4 | 0 | YES | 0 | PASS |


### Product count before / after

| Canonical | Before (sum of sources) | After (unique union) | Overlap | Net change |
|---|---:|---:|---:|---|
| `dji-air-3-series` | 3 | 3 | 0 | No product loss (overlap reduced count) |
| `dji-drones` | 84 | 87 | -3 | +3 |
| `dji-matrice-350-rtk` | 28 | 28 | 0 | No product loss (overlap reduced count) |
| `drone-accessories` | 989 | 809 | 180 | No product loss (overlap reduced count) |
| `drone-filters` | 513 | 261 | 252 | No product loss (overlap reduced count) |
| `dji-neo-spare-parts` | 4 | 4 | 0 | No product loss (overlap reduced count) |


### Warnings (audit count drift — GID fetch authoritative)

| type | canonical | handle | reported | fetched | note |
| --- | --- | --- | --- | --- | --- |
| AUDIT_COUNT_DRIFT | dji-drones | dji | 84 | 87 | Live product count differs from audit snapshot — GID fetch is authoritative |
| AUDIT_COUNT_DRIFT | drone-accessories | drone-accessories-buy | 615 | 630 | Live product count differs from audit snapshot — GID fetch is authoritative |
| AUDIT_COUNT_DRIFT | drone-accessories | drone-accessories-drone | 374 | 356 | Live product count differs from audit snapshot — GID fetch is authoritative |
| AUDIT_COUNT_DRIFT | drone-filters | filters-for-drones | 252 | 261 | Live product count differs from audit snapshot — GID fetch is authoritative |



---

## 2. Redirects

| Metric | Value |
|---|---:|
| Total rules | 322 |
| Unique from-paths | 322 |
| Validation loops | 0 |
| Validation duplicates | 0 |
| Live paths checked | 161 |
| Would create (new) | 322 |
| Already exist (correct target) | 0 |
| Live conflicts | 0 |

### By resource type

| resource_type | count |
| --- | --- |
| collection | 134 |
| page | 50 |
| blog | 2 |
| article | 136 |




---

## 3. Artifacts

| File | Description |
|---|---|
| `MERGE_EXECUTOR_REPORT.csv` | Per-group merge dry-run results |
| `REDIRECT_EXECUTOR_REPORT.csv` | All redirect rules (pending) |
| `.merge-executor-result.json` | Machine-readable merge result |
| `.redirect-executor-result.json` | Machine-readable redirect result |

## Regenerate

```bash
node scripts/run-english-migration-dry-run.mjs
```
