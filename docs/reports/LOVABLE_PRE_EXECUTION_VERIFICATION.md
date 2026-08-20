# Lovable Pre-Execution Verification

**Store:** EuroDroneParts (`ya1xhg-x6.myshopify.com`)
**Generated:** 2026-06-13T17:32:50.262Z
**Status:** VERIFICATION ONLY — **Execute blocked until gaps resolved**

## Executive summary

| # | Verification | Status |
|---|---|---|
| 1 | No products lose collection connections during merge | **BLOCKED_PENDING_EXECUTION_SCRIPT** |
| 2 | All 320 redirects created automatically | **READY — infra exists, execution script missing** |
| 3 | All menus use English handles | **PENDING — live store still has *-deploy handles** |
| 4 | No Swedish handles remain | **PARTIAL — blog articles** |
| 5 | Shopify Markets uses translations, not separate URLs | **ARCHITECTURE_PASS — LIVE_NOT_CONFIGURED** |

**Recommendation:** Do **not** run Execute until merge executor + redirect executor exist and blog hybrid slugs are curated.

---

## 1. Collection merge — product connection safety

**7 merges** affecting **1617** product memberships (smart collection rules).

| merge_from | canonical | source_kind | source_products | canonical_exists | canonical_products | risk |
| --- | --- | --- | --- | --- | --- | --- |
| dij-air-3-series | dji-air-3-series | smart | 3 | NO | 0 | SMART_COLLECTION — union rules or export products before delete |
| dji | dji-drones | smart | 84 | YES | 22 | SMART_COLLECTION — union rules or export products before delete |
| dji-matrice-350-rtk-rtk | dji-matrice-350-rtk | smart | 28 | NO | 0 | SMART_COLLECTION — union rules or export products before delete |
| drone-accessories-buy | drone-accessories | smart | 615 | NO | 0 | SMART_COLLECTION — union rules or export products before delete |
| drone-accessories-drone | drone-accessories | smart | 374 | NO | 0 | SMART_COLLECTION — union rules or export products before delete |
| filter-drones-lins | drone-filters | smart | 261 | NO | 0 | SMART_COLLECTION — union rules or export products before delete |
| filters-for-drones | drone-filters | smart | 252 | NO | 0 | SMART_COLLECTION — union rules or export products before delete |


### Required merge procedure (before delete)

1. For each merge group, pick primary source (largest product count) and **rename handle** to canonical English
2. **Export product GIDs** from all other sources in the group via Admin GraphQL (`collection.products`)
3. **`collectionAddProducts`** into canonical collection (dedupe GIDs)
4. **Verify** canonical count ≥ union of sources (account for overlap e.g. `dji` + `dji-drones`)
5. **Delete** merged source collections only after step 4 passes
6. Deploy **301 redirects** from all old URLs

### Merge groups

| Canonical | Sources | Total products | Canonical exists today? |
|---|---|---:|---|
| `drone-accessories` | buy (615) + drone (374) | 989 | **NO** — rename `drone-accessories-buy` first |
| `drone-filters` | lins (261) + for-drones (252) | 513 | **NO** — rename `filters-for-drones` first |
| `dji-drones` | dji (84) | 84 | **YES** (22 existing) — union overlap expected |
| `dji-air-3-series` | dij-air-3-series (3) | 3 | **NO** — rename typo source |
| `dji-matrice-350-rtk` | rtk-rtk (28) | 28 | **NO** — create/rename required |

**Verdict:** ⚠️ **BLOCKED** — execution script must implement smart-collection product export + verification. Artifacts alone do not guarantee zero product loss.

---

## 2. Redirect automation (320 rules)

| Metric | Value |
|---|---:|
| Rules in REDIRECT_MAPPING.csv | 320 |
| Unique from-paths | 320 |
| Collection redirects | 132 |
| Page redirects | 50 |
| Blog/article redirects | 138 |

### Automation path

- **Generator:** `scripts/generate-execution-approval-pack.mjs` → `REDIRECT_MAPPING.csv`
- **Deployer:** `supabase/functions/shopify-create-redirects` — bulk `urlRedirectCreate`, idempotent on duplicates, supports `dryRun`
- **Missing:** English-migration executor that reads CSV and calls deployer in batches

**Verdict:** ✅ Mapping complete (320/320). ⚠️ **Auto-create not wired** — must be built before Execute.

---

## 3. Menu English handles

### Live state (today)

| live_handle | proposed_handle | live_title | action |
| --- | --- | --- | --- |
| main-menu | main-menu | Huvudmeny | KEEP |
| footer | footer | Sidfotsmeny | KEEP |
| partnership | partnership | Partnership | KEEP |
| enterprise-expansion-deploy | enterprise | Enterprise Expansion | RENAME |
| spare-parts-deploy | spare-parts | Reservdelar | RENAME |
| service-support-deploy | service-support | Service & Support | RENAME |
| b2b-enterprise-deploy | business | Enterprise & B2B | RENAME |


**Swedish URLs in live menu links:** 84 (expected — fixed at execution when menus rebuilt with English paths)

**Verdict:** ⚠️ **PENDING** — 4 menu handles still Swedish-era `*-deploy`. English handles defined in plan; not applied live.

---

## 4. Swedish handles — proposed vs live

| Layer | Swedish in proposed mapping | Live store |
|---|---:|---|
| Collection handles | 0 | 58 renames pending |
| Page handles | 0 | 15 renames pending |
| Blog article slugs | 16 hybrid | 68 articles on `nyheter` |
| Menu handles | 0 in target state | 4 `*-deploy` live |
| Menu URLs | 0 in target state | 84 Swedish paths live |

### Blog articles requiring manual English slugs (16)

- `nyheter/kop-dronare-med-kamera` → `news/kop-drones-med-kamera` (needs curation)
- `nyheter/dji-flip-lilla-dronaren` → `news/dji-flip-lilla-dronesn` (needs curation)
- `nyheter/kamera-for-youtube` → `news/kamera-for-youtube` (needs curation)
- `nyheter/mikrofon-mygga-tradlos` → `news/microphone-mygga-wireless` (needs curation)
- `nyheter/mikrofon-till-mobil` → `news/microphone-till-mobil` (needs curation)
- `nyheter/spela-in-ljud` → `news/spela-in-audio` (needs curation)
- `nyheter/sd-kort-till-kamera` → `news/sd-kort-till-kamera` (needs curation)
- `nyheter/nitecore-emr25-myggavskrackaren` → `news/nitecore-emr25-myggavskrackaren` (needs curation)
- `nyheter/dronare-bast-i-test-budget` → `news/drones-bast-i-test-budget` (needs curation)
- `nyheter/actionkamera-bast-i-test` → `news/actionkamera-bast-i-test` (needs curation)
- `nyheter/bast-i-test-actionkamera` → `news/bast-i-test-actionkamera` (needs curation)
- `nyheter/far-man-flyga-dronare-over-annans-tomt` → `news/far-man-flyga-drones-over-annans-tomt` (needs curation)
- `nyheter/dronare-for-nyborjare` → `news/drones-for-nyborjare` (needs curation)
- `nyheter/kopa-dronare-med-kamera` → `news/kopa-drones-med-kamera` (needs curation)
- `nyheter/stativ-till-mobil-for-att-filma` → `news/stativ-till-mobil-for-att-filma` (needs curation)


**Verdict:** ✅ Collections/pages target state is English. ⚠️ **16 blog hybrid slugs** must be fixed manually. ⚠️ Live store still Swedish until Execute.

---

## 5. Shopify Markets — translations not separate URLs

| Principle | Planned | Verified live |
|---|---|---|
| Same URL path on all domains | ✅ English canonical | ❌ Not audited |
| Localized titles via Markets | ✅ Translate & Adapt | ❌ Not configured |
| No `/collections/reservdelar` per locale | ✅ 301 + English handles | N/A pre-execution |
| Market domains | .com .de .dk .fr .nl .es .it | ❌ Not scanned |

**Architecture rule:** `eurodroneparts.de/collections/spare-parts` ✅ — never locale-specific handles.

**Verdict:** ✅ Architecture correct. ⚠️ **Markets must be configured in Shopify Admin** as separate step after handle migration.

---

## Execute gate checklist

- [ ] Build merge executor with product GID export + count verification
- [ ] Build redirect executor (CSV → shopify-create-redirects, 320 rules, dry-run first)
- [ ] Curate 16 blog article slugs to full English
- [ ] Rename 4 menu handles (`*-deploy` → English)
- [ ] Rebuild all menu links to English URLs
- [ ] Configure Shopify Markets + Translate & Adapt per domain
- [ ] Post-execution audit: 0 Swedish handles, 0 broken menu links

## Regenerate

```bash
node scripts/verify-pre-execution.mjs
```
