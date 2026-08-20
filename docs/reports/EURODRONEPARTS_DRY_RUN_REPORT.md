# EuroDroneParts — Dry-Run Report

**Generated:** 2026-06-18T16:35:38.387Z
**Migration:** `3d9876af-885c-49e9-a4b0-c4943c06112f`
**Data project:** https://wsncjdajweoujhidlxas.supabase.co
**App project:** https://wsncjdajweoujhidlxas.supabase.co

## Step 1 — Deploy Validation
| Project | PR#23 worker actions | Migrations |
|---------|---------------------|------------|
| Data (wsncjdajweoujhidlxas.supabase.co) | PASS | 4 |
| App (wsncjdajweoujhidlxas.supabase.co) | PASS | 4 |

## Step 2 — Dry Run (no Shopify writes)
**HTTP:** 500 | **PR#23 shape:** FAIL | **dry_run:** true
**Error:** shopify_access_failed: env ya1xhg-x6.myshopify.com vunstable -> 401: {"errors":"[API] Invalid API key or access token (unrecognized login or wrong password)"}

### Smart collection dry-run
| Handle | Result | Rules mapped | Unresolved | Error |
|--------|--------|--------------|------------|-------|
| dji-air-3-tillbehor-omfattande-sortiment | — | 0 | 0 | — |
| dji-avata-2-tillbehor | — | 0 | 0 | — |
| dji-flip-tillbehor | — | 0 | 0 | — |
| dji-mini-3-tillbehor | — | 0 | 0 | — |
| dji-neo-2-tillbehor | — | 0 | 0 | — |
| dji-neo-tillbehor | — | 0 | 0 | — |

**Summary:** total=0, would_fix=0, failed=0, skipped=0

### Menu recovery dry-run
| Menu | Result | Kept | Removed | Deferred | Error |
|------|--------|------|---------|----------|-------|

**Summary:** fixed=0, failed=0, skipped_limit=0

### Menu deletions (dry-run preview)
| Handle | Result | Title | Id |
|--------|--------|-------|----|

**Summary:** would_delete=0 / requested=3

## Step 3 — Current Live Baseline
**Products published (DB):** unknown
**Live collections:** unknown
**Missing collections:** unknown (intentionally excluded — no bulk restore)

| Handle | Exists | Type | Products | URL |
|--------|--------|------|----------|-----|
| dji-air-3-tillbehor-omfattande-sortiment | NO | — | — | /collections/dji-air-3-tillbehor-omfattande-sortiment |
| dji-avata-2-tillbehor | NO | — | — | /collections/dji-avata-2-tillbehor |
| dji-flip-tillbehor | NO | — | — | /collections/dji-flip-tillbehor |
| dji-mini-3-tillbehor | NO | — | — | /collections/dji-mini-3-tillbehor |
| dji-neo-2-tillbehor | NO | — | — | /collections/dji-neo-2-tillbehor |
| dji-neo-tillbehor | NO | — | — | /collections/dji-neo-tillbehor |

## Step 4 — Dry-Run Verdict
| Check | Result |
|-------|--------|
| PR#23 code on data project | FAIL |
| 6/6 collections mapped | FAIL |
| Menus updated via menuUpdate (no menu limit) | PASS (0 updated) |
| 3 menus would_delete | FAIL (0/3) |
| 0 ActionKing references in menus (post-prune) | PASS (0 hits) |
| Unresolved (deferred) links | 0 |
| SEO handles unchanged | PASS |
| No bulk restore triggered | PASS |
| ActionKing-branded collections still live on target (info) | 0 (none) |

**DRY-RUN READY FOR LIVE FIX-PASS:** NO

### Blockers
- Deploy PR#23 functions to data project `wsncjdajweoujhidlxas`
- Smart collection mapping incomplete (failed=0, results=0/6)
- Only 0/3 legacy menus resolvable for deletion