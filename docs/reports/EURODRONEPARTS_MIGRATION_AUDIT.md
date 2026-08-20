# EuroDroneParts migration fix pass — status report

**Migration:** `3d9876af-885c-49e9-a4b0-c4943c06112f`  
**Target:** `ya1xhg-x6.myshopify.com`  
**Report time:** 2026-06-11  
**PR #23:** merged to `main` (`0faf2aedb`)

## Executive summary

| Step | Status | Notes |
|------|--------|-------|
| Merge PR #23 | **DONE** | Merged to `main`; conflicts resolved with `migration-recovery-pass` |
| CI deploy | **BLOCKED** | GitHub Actions missing `SUPABASE_ACCESS_TOKEN` secret |
| Dry-run (PR #23 code) | **NOT RUN** | Deployed edge functions are still pre-PR code |
| Fix-pass (live) | **NOT RUN** | Requires deploy or `SUPABASE_SERVICE_ROLE_KEY` locally |
| Verification (read-only) | **DONE** | Via `collection_reconciliation_audit` + old `cloner-fix` dry-run |

**Unblock deploy:** Add [Supabase access token](https://supabase.com/dashboard/account/tokens) as GitHub secret `SUPABASE_ACCESS_TOKEN`, then re-run workflow [Deploy shopify-cloner-worker](https://github.com/boolsson81/digitalsignal/actions/workflows/deploy-shopify-cloner-worker.yml).

---

## 1. Six DJI smart collections (pre-fix live state)

All six recovery handles exist on live target but lost smart rules during migration (`custom`, 0 products):

| Handle | Live kind | Live products | Source kind | SEO URL |
|--------|-----------|---------------|-------------|---------|
| `dji-air-3-tillbehor-omfattande-sortiment` | custom | 0 | smart | `/collections/dji-air-3-tillbehor-omfattande-sortiment` |
| `dji-avata-2-tillbehor` | custom | 0 | smart | `/collections/dji-avata-2-tillbehor` |
| `dji-flip-tillbehor` | custom | 0 | smart | `/collections/dji-flip-tillbehor` |
| `dji-mini-3-tillbehor` | custom | 0 | smart | `/collections/dji-mini-3-tillbehor` |
| `dji-neo-2-tillbehor` | custom | 0 | smart | `/collections/dji-neo-2-tillbehor` |
| `dji-neo-tillbehor` | custom | 0 | smart | `/collections/dji-neo-tillbehor` |

**Expected after fix-pass:** `kind=smart`, rules remapped to target metafield definition IDs, `products_count > 0` where source rules match live catalog.

**SEO safety:** Fix uses `collectionUpdate` with `ruleSet` only — handles unchanged; URLs stay `/collections/{handle}`.

---

## 2. Menus (old deployed dry-run)

Dry-run against **old** `cloner-fix-collections-and-menus` (uses `menuCreate`, not PR #23 `menuUpdate`):

| Result | Menus |
|--------|-------|
| fixed | 0 |
| skipped_limit | `partnership`, `dronare`, `actionkameror` |
| failed (menu limit) | `main-menu`, `customer-account-main-menu`, `footer`, `enterprise-dr-nare`, `meny` |
| failed (all links invalid) | `vandring-outdoor` |

**Legacy ActionKing links pruned in dry-run** (examples): `actionking-outlet`, `actionkamer-dji-gopro-insta360`, `account.actionking.se/*`.

**After PR #23 deploy:** `menuUpdate` on existing menus should avoid menu-limit errors; invalid/deferred collection links pruned per `cloner-menu-recovery.ts`.

---

## 3. Deployed worker actions (confirms pre-PR code)

```
pre_250_discover, pre_250_audit, missing_product_types,
collection_reconciliation_audit, final_verification_audit
```

**Not deployed yet:** `smart_collection_mapping_fix`, `menu_recovery_fix`, `migration_audit_report`, `collection_gap_audit`, `migration_recovery_pass`, standalone `migration-recovery-pass` function.

---

## 4. Collection gap (context)

- Source collections in DB: **824**
- Live target collections: **157**
- Missing on live: **671** (mostly intentionally deleted — no bulk restore in PR #23 scope)

---

## 5. Commands after deploy

```bash
# Dry-run
node scripts/run-migration-fix-pass.mjs --dry-run

# Live fix-pass
node scripts/run-migration-fix-pass.mjs

# Re-verify 6 collections
node -e "
const handles=['dji-air-3-tillbehor-omfattande-sortiment','dji-avata-2-tillbehor','dji-flip-tillbehor','dji-mini-3-tillbehor','dji-neo-2-tillbehor','dji-neo-tillbehor'];
// call shopify-cloner-worker action collection_reconciliation_audit and filter TARGET_COLLECTIONS
"
```

Or invoke directly:

```bash
curl -X POST "$SUPABASE_URL/functions/v1/cloner-fix-collections-and-menus" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"dry_run": true, "migration_id": "3d9876af-885c-49e9-a4b0-c4943c06112f"}'
```

---

## Verdict

- **Code on `main`:** ready
- **Deploy:** blocked on `SUPABASE_ACCESS_TOKEN`
- **Go-live:** not until deploy + successful dry-run + fix-pass + post-fix verification
