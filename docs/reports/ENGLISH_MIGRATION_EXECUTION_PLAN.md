# English Migration — Final Execution Plan

**Generated:** 2026-06-13T17:55:52.568Z
**Dry-run status:** ✅ PASS
**Awaiting:** Final human approval before `Execute`

## Pre-conditions (verified)

- [x] Collection merge dry-run: all product GIDs fetched, union computed, **0 products would be lost**
- [x] Redirect mapping: 320 rules, validation PASS, no live target conflicts
- [x] Executors built and tested in dry-run mode

## Execution sequence (when approved)

### Phase A — Collection merges (5 groups)

1. **`dji-air-3-series`** — Rename `dij-air-3-series` → `dji-air-3-series`; Delete none merged sources
   - Union: 3 unique products from 1 sources
   - No overlap
2. **`dji-drones`** — Add 65 products to `dji-drones`; Delete dji merged sources
   - Union: 87 unique products from 1 sources
   - No overlap
3. **`dji-matrice-350-rtk`** — Rename `dji-matrice-350-rtk-rtk` → `dji-matrice-350-rtk`; Delete none merged sources
   - Union: 28 unique products from 1 sources
   - No overlap
4. **`drone-accessories`** — Rename `drone-accessories-buy` → `drone-accessories`; Add 194 products to `drone-accessories`; Delete drone-accessories-drone merged sources
   - Union: 809 unique products from 2 sources
   - Overlap: 180 duplicate memberships
5. **`drone-filters`** — Rename `filter-drones-lins` → `drone-filters`; Delete filters-for-drones merged sources
   - Union: 261 unique products from 2 sources
   - Overlap: 252 duplicate memberships
6. **`dji-neo-spare-parts`** — Rename `repair-dji-neo-spare-parts` → `dji-neo-spare-parts`; Delete none merged sources
   - Union: 4 unique products from 1 sources
   - No overlap

### Phase B — Collection handle renames (non-merge)

Rename remaining Swedish collection handles per `COLLECTION_HANDLE_MAPPING.csv` (58 renames).

### Phase C — Page & blog handle renames

- 15 page renames per `PAGE_HANDLE_MAPPING.csv`
- Blog `nyheter` → `news` + 68 article renames (curate 16 hybrid slugs first)

### Phase D — Menu handles & links

| Current | English |
|---|---|
| `enterprise-expansion-deploy` | `enterprise` |
| `spare-parts-deploy` | `spare-parts` |
| `service-support-deploy` | `service-support` |
| `b2b-enterprise-deploy` | `business` |

Rebuild all menu links to English URLs. Labels stay English in admin; localize via Markets.

### Phase E — Redirects (320 rules)

```bash
# Batch deploy from REDIRECT_MAPPING.csv via shopify-create-redirects
# Recommended: dryRun first per batch of 50
```

Dry-run: **322** new redirects to create, **0** already correct.

### Phase F — Shopify Markets

Configure markets: `.com`, `.de`, `.dk`, `.fr`, `.nl`, `.es`, `.it`
Enable Translate & Adapt for menu labels, collection titles, page titles, product content.
**Do not** create locale-specific handles.

### Phase G — Post-execution verification

```bash
node scripts/run-english-migration-dry-run.mjs
node scripts/verify-pre-execution.mjs
```

## Rollback

- Redirects: export `urlRedirects` before Phase E; delete new rules if needed
- Collections: keep deleted merge source handles in CSV for manual restore
- Menus: export menu JSON before Phase D

## Approval

- [ ] Dry-run report reviewed (`ENGLISH_MIGRATION_DRY_RUN_REPORT.md`)
- [ ] Execution plan approved (this document)
- [ ] Blog hybrid slugs curated
- [ ] Maintenance window agreed

**Sign off to proceed:** Reply `Execute` with confirmation.
