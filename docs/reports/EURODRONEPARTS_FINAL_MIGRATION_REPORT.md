# EuroDroneParts — Final Migration Completion Report

**Generated:** 2026-06-12  
**Migration:** `3d9876af-885c-49e9-a4b0-c4943c06112f` (ActionKing → EUDroneParts)  
**Target store:** `ya1xhg-x6.myshopify.com`  
**Mode:** Dry-run only — **no live Shopify changes executed**

---

## Executive Summary

| Question | Answer |
|----------|--------|
| **MIGRATION COMPLETE** | **NO** |
| **READY FOR PRODUCTION** | **NO** |
| **READY FOR GO LIVE** | **NO** |
| **PR#23 dry-run PASS** | **NO** — blocked by project split |
| **Live fix-pass executed** | **NO** — awaiting dry-run PASS + operator approval |

**Root cause:** PR#23 edge functions are deployed on **`jzqgwsryxmgzcbjjddic`**, but all cloner migration data (12,058 products, collections, menus) lives on **`wsncjdajweoujhidlxas`**. The PR#23 dry-run cannot run until code and data are on the same Supabase project.

---

## Step 1 — Merge & Deploy Validation

| Check | Result | Detail |
|-------|--------|--------|
| PR #23 merged to `main` | **PASS** | Merged 2026-06-11 (`0faf2aedb`) |
| GitHub Actions deploy (app project) | **PASS** | Run `27401204572` succeeded → `jzqgwsryxmgzcbjjddic` |
| PR#23 worker actions on app project | **PASS** | All 10 actions including `smart_collection_mapping_fix` |
| PR#23 deploy on data project | **FAIL** | CI token 403 on `wsncjdajweoujhidlxas` (run `27401921879`) |
| Migration data on app project | **FAIL** | 0 migrations / 0 stores |
| Migration data on data project | **PASS** | 4 migrations; primary has 12,058 published products |

### Deployed function versions

Supabase edge functions do not expose semver tags. Validation by action probe:

| Project | `shopify-cloner-worker` | `cloner-fix-collections-and-menus` | `migration-recovery-pass` |
|---------|-------------------------|-----------------------------------|---------------------------|
| `jzqgwsryxmgzcbjjddic` | PR#23 (10 actions) | PR#23 shape (`smart_collection_recovery_handles`) | Deployed |
| `wsncjdajweoujhidlxas` | **Legacy** (5 actions) | **Legacy** (`{collections,menus}` only) | Not deployed |

---

## Step 2 — Dry Run (PR#23 — NOT COMPLETED)

**Status: FAIL** — could not execute PR#23 smart collection + menuUpdate dry-run against migration data.

| Attempt | Result |
|---------|--------|
| `cloner-fix-collections-and-menus` on `jzqgwsryxmgzcbjjddic` | 500 — migration not found |
| `cloner-fix-collections-and-menus` on `wsncjdajweoujhidlxas` | 200 — **legacy code**, no smart collection evaluation |
| Local Deno dry-run (anon key) | FAIL — RLS blocks `cloner_migrations` read |

### Legacy dry-run on data project (old code — reference only)

This used pre-PR#23 `menuCreate` path. **Not valid for go-live approval.**

| Area | Result |
|------|--------|
| Collections fixed | 0 |
| Collections failed | 0 |
| Menus fixed | 0 |
| Menus failed | **6** (menu limit errors) |
| Menus skipped (limit) | 3 |

**Failed menus (old code):** `main-menu`, `customer-account-main-menu`, `footer`, `enterprise-dr-nare`, `meny`, `vandring-outdoor`

### Expected PR#23 dry-run (once unblocked)

| Handle | Expected action | Expected outcome |
|--------|-----------------|------------------|
| `dji-air-3-tillbehor-omfattande-sortiment` | `collectionUpdate` + ruleSet | smart + products > 0 |
| `dji-avata-2-tillbehor` | same | smart + products > 0 |
| `dji-flip-tillbehor` | same | smart + products > 0 |
| `dji-mini-3-tillbehor` | same | smart + products > 0 |
| `dji-neo-2-tillbehor` | same | smart + products > 0 |
| `dji-neo-tillbehor` | same | smart + products > 0 |

**Scope guardrails confirmed in code:** no bulk restore of 671 excluded collections; no legacy ActionKing collection restore; handles/URLs unchanged.

---

## Step 3 — Smart Collection Validation (current live state)

| Handle | Exists | Type | Products | Rules (source) | URL | Flag |
|--------|--------|------|----------|----------------|-----|------|
| `dji-air-3-tillbehor-omfattande-sortiment` | YES | **custom** | **0** | smart | `/collections/dji-air-3-tillbehor-omfattande-sortiment` | EMPTY |
| `dji-avata-2-tillbehor` | YES | **custom** | **0** | smart | `/collections/dji-avata-2-tillbehor` | EMPTY |
| `dji-flip-tillbehor` | YES | **custom** | **0** | smart | `/collections/dji-flip-tillbehor` | EMPTY |
| `dji-mini-3-tillbehor` | YES | **custom** | **0** | smart | `/collections/dji-mini-3-tillbehor` | EMPTY |
| `dji-neo-2-tillbehor` | YES | **custom** | **0** | smart | `/collections/dji-neo-2-tillbehor` | EMPTY |
| `dji-neo-tillbehor` | YES | **custom** | **0** | smart | `/collections/dji-neo-tillbehor` | EMPTY |

**Overall: FAIL** — all 6 exist with correct handles but are empty custom collections (smart rules dropped during migration).

---

## Step 4 — Menu Validation (current live + legacy dry-run)

| Check | Result |
|-------|--------|
| All menu links resolve | **FAIL** |
| No ActionKing collection refs | **FAIL** |
| No orphan collection links | **FAIL** |
| Valid Shopify menu targets | **FAIL** (menu limit via old `menuCreate`) |
| menuUpdate path (PR#23) | **NOT TESTED** — not deployed on data project |

### Legacy links identified (to be pruned by PR#23 menu recovery)

| Menu | Problem link | Reason |
|------|--------------|--------|
| `main-menu` | `actionking-outlet` | collection not found |
| `meny` | `actionkamer-dji-gopro-insta360` | collection not found |
| `meny` | `kameror-kameror`, `mobiltillbehor`, `gimbal-gimbal` | collections not found |
| `meny` | `outdoor-utrustning-vandring` | collection not found |
| `enterprise-dr-nare` | `reservdelar-dji-enterprise` | collection not found |
| `customer-account-main-menu` | `account.actionking.se/*` | legacy ActionKing account URLs |

**Overall: FAIL**

---

## Step 5 — SEO Validation

| Check | Result |
|-------|--------|
| Collection handles unchanged | **PASS** |
| Collection URLs unchanged (`/collections/{handle}`) | **PASS** |
| SEO metadata preserved (titles on live) | **PASS** |
| Collection templates preserved | Not verified |
| No new redirects required | **PASS** |

**Overall: PASS** — fix-pass uses `collectionUpdate` with `ruleSet` only; no handle/URL changes.

---

## Step 6 — Collection Audit

| Category | Count |
|----------|-------|
| Collections restored | 0 |
| Collections updated | 0 |
| Collections skipped | 0 |
| Collections intentionally excluded | **671** (no bulk restore) |
| Legacy ActionKing collections removed | In scope — not restored |
| Approved smart recovery scope | **6 handles only** |
| Collections requiring manual review | 671 gap (audit-only) |

**Products published:** 12,058 (migration DB)  
**Live collections:** 157  
**Missing on live:** 671 (intentionally deleted)

---

## Step 7 — Store Health Check

| Area | Result | Score impact |
|------|--------|--------------|
| Products | **PASS** (12,058 published) | — |
| Collections (6 approved) | **FAIL** (custom, empty) | −25 |
| Smart collection rules | **FAIL** (not recovered) | −25 |
| Menus / navigation | **FAIL** (legacy + broken links) | −20 |
| PR#23 deploy on data project | **FAIL** | −20 |
| SEO / URLs | **PASS** | — |

**Health score: 10 / 100**

---

## Step 8 — Final Decision

| | |
|---|---|
| **MIGRATION COMPLETE** | **NO** |
| **READY FOR PRODUCTION** | **NO** |
| **READY FOR GO LIVE** | **NO** |

### Remaining blockers (ordered)

1. **Unify code + data on one Supabase project** (choose one):
   - **Option A (recommended):** Deploy PR#23 functions to `wsncjdajweoujhidlxas` manually:
     ```bash
     supabase functions deploy shopify-cloner-worker --project-ref wsncjdajweoujhidlxas
     supabase functions deploy migration-recovery-pass --project-ref wsncjdajweoujhidlxas
     supabase functions deploy cloner-fix-collections-and-menus --project-ref wsncjdajweoujhidlxas
     ```
   - **Option B:** Migrate `cloner_*` tables to `jzqgwsryxmgzcbjjddic`
   - **Option C:** Grant CI `SUPABASE_ACCESS_TOKEN` access to `wsncjdajweoujhidlxas`

2. **Run PR#23 dry-run** (after step 1):
   ```bash
   CLONER_SUPABASE_URL=https://wsncjdajweoujhidlxas.supabase.co \
   node scripts/run-dry-run-fix-pass.mjs
   ```

3. **Review dry-run output** — confirm 6 collections show `skipped`/`would_fix` with rules mapped, menus use `menuUpdate` with 0 menu-limit errors.

4. **Operator approval required** before live fix-pass:
   ```bash
   node scripts/run-migration-fix-pass.mjs   # NO --dry-run
   ```

5. **Post-fix validation** — re-run `node scripts/run-completion-pass.mjs`

---

## Live Fix-Pass — NOT EXECUTED

Per instructions: dry-run did **not** pass. **No destructive changes were made.**  
**Awaiting your approval** after PR#23 dry-run succeeds on the data project.
