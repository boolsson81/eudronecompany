# Shopify Cloner — Test Plan

**Date:** 2026-06-07  
**Migration:** ActionKing → EuroDroneParts  
**Environment:** https://app.digitalsignal.io/admin/shopify-cloner  
**Prerequisites:** Both stores connected in cloner; test migration with small product subset first

---

## Test Principles

1. **Never publish live** — confirm all test products remain `DRAFT` on EuroDroneParts
2. **Dry run first** — every new migration starts in `dry_run` mode
3. **Small batch** — test 1–3 products before full catalog
4. **No deletes** — do not remove products from target during testing
5. **Evidence** — download clone report + screenshot Shopify Admin after each phase

---

## Phase 0 — Environment & Access

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 0.1 | Page loads | Open `/admin/shopify-cloner` | Tabs render; no console errors |
| 0.2 | Stores visible | Butiker tab | ActionKing (source) + EuroDroneParts (target) listed |
| 0.3 | Migration exists | Migrationer tab | `ActionKing → EuroDroneParts` migration selectable |
| 0.4 | Edge functions deployed | Publish 1 item dry run | No 404 from `shopify-cloner-publish` |

---

## Phase 1 — Scan Fidelity

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1.1 | Product scan | Setup → Scan (product scope) | `cloner_migration_items` rows created |
| 1.2 | Collection on product | Inspect scanned product payload | `source_payload.collections.nodes[]` has handles |
| 1.3 | Variant limits | Product with 5+ variants | All variants in payload |
| 1.4 | Metafields | Product with custom metafields | Up to 50 metafields in payload |
| 1.5 | HS / COO | Product with customs data | `harmonizedSystemCode` + `countryCodeOfOrigin` in variant nodes |
| 1.6 | Images | Product with media | `media.nodes[].image.url` present |
| 1.7 | Collection scan | collection in scope | Collection items with rules/handles |

**SQL check (optional):**

```sql
SELECT source_handle, source_payload->'collections' AS cols
FROM cloner_migration_items
WHERE migration_id = '<id>' AND object_type = 'product'
LIMIT 5;
```

---

## Phase 2 — Safety & UX

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 2.1 | Default dry run | New migration | `mode = dry_run` |
| 2.2 | Publish summary | Publicera → Kör publicering | Confirmation dialog shows source/target, counts, ETA |
| 2.3 | Cancel confirm | Dialog → Avbryt | No API publish call |
| 2.4 | Dry run execute | Confirm dry run | Toast: skipped count; no new products in Shopify Admin |
| 2.5 | Source/target display | Publish tab | Labels + domains for both stores |
| 2.6 | Progress bar | Run batch publish | Progress updates; counts increment |
| 2.7 | Download report | Ladda ner rapport | JSON file with items + logs |

---

## Phase 3 — Publish (Staging / Small Batch)

**Setup:** Set mode to `create_only` or `skip_existing`. Approve 3 test products + 2 collections.

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 3.1 | Collection first | Publish batch | Collections created before products (check logs order) |
| 3.2 | Product draft | Shopify Admin → Products | Status = **Draft** |
| 3.3 | Handle preserved | Compare source/target URL handle | Same handle |
| 3.4 | SEO metafields | View product SEO | title_tag + description_tag set |
| 3.5 | Tags/vendor/type | Product fields | Match source (or transformed values) |
| 3.6 | Images | Product media | Images loaded; alt text present |
| 3.7 | Variants | Options/SKU/price | Match source variants |
| 3.8 | HS code | Variant customs | HS code populated (post-create hook) |
| 3.9 | Country of origin | Variant customs | COO populated |
| 3.10 | Collection membership | Custom collection | Product appears in collection |
| 3.11 | Smart collection | Smart collection product | Included if rules match (may differ) |
| 3.12 | Retroactive link | Publish without collections first → Link collections button | Membership repaired |
| 3.13 | Skip duplicate | Re-publish same handle, `skip_existing` | `product_skipped` log; no duplicate |
| 3.14 | Redirect rewrite | Publish redirect item | Target URL uses EuroDroneParts domain |

---

## Phase 4 — Logging

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 4.1 | clone_started | Start publish | Log entry with batch metadata |
| 4.2 | product_cloned | Successful product | Log with target_id |
| 4.3 | product_skipped | Duplicate skip | Log with handle message |
| 4.4 | collection_linked | Product with collections | Log with linked count |
| 4.5 | clone_completed | End batch | Log with created/updated/skipped/failed |
| 4.6 | product_failed | Force bad payload (test env) | `product_failed` + error on item row |
| 4.7 | image_failed | Product with broken image URL | `image_failed` event (if publish fails) |

**SQL check:**

```sql
SELECT event, level, message, created_at
FROM cloner_logs
WHERE migration_id = '<id>'
ORDER BY created_at DESC
LIMIT 50;
```

---

## Phase 5 — Error & Edge Cases

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 5.1 | Unapproved item | Publish without approval | Item not in batch |
| 5.2 | Missing target collection | Product linked to collection not yet published | `collection_link_failed` or skipped with message |
| 5.3 | Image test | Testa 5 bilder | Dialog shows OK/warn/error; no upload |
| 5.4 | Metafield remap | After publish → Remappa metafält | Reference metafields updated where mapped |
| 5.5 | Large batch queue | Kö-publicera alla | `cloner_jobs` row created; worker processes |
| 5.6 | Rate limit | Publish 50+ products | Batches complete or fail gracefully with retry plan |

---

## Phase 6 — ActionKing → EuroDroneParts Acceptance

Run only after Phases 1–5 pass on subset.

| Criterion | Verification |
|-----------|--------------|
| Catalog completeness | Compare product count: approved source vs published target |
| Draft safety | 0 ACTIVE products from cloner |
| Collection IA | Key navigation collections have correct members |
| Redirects | Sample 10 redirects → all target EuroDroneParts |
| Customs data | Sample 10 SKUs → HS + COO in Admin |
| No duplicates | Handle search on target → single product per handle |
| Audit report | JSON report archived |
| Inventory | **Not tested here** — separate inventory P0 workflow |

---

## Rollback / Recovery

| Scenario | Action |
|----------|--------|
| Wrong products created | Leave as DRAFT; archive/delete manually in Shopify (outside cloner) |
| Collection links wrong | Re-run "Länka kollektioner" after fixing collection mappings |
| Bad redirects | Delete redirects in target Admin; fix `old_domain`/`new_domain`; re-publish |
| Partial batch failure | Fix errors; re-run publish (`skip_existing` for successes) |
| Full reset | Create new migration; do not delete DB rows unless necessary |

---

## Sign-off Template

```
Migration ID: _______________
Tester: _______________
Date: _______________

Phase 0: [ ] Pass  [ ] Fail
Phase 1: [ ] Pass  [ ] Fail
Phase 2: [ ] Pass  [ ] Fail
Phase 3: [ ] Pass  [ ] Fail
Phase 4: [ ] Pass  [ ] Fail
Phase 5: [ ] Pass  [ ] Fail

Products published (draft): _______
Failed items: _______
Collection links verified: [ ] Yes

Approved for expanded batch: [ ] Yes  [ ] No
Notes: _________________________________
```

---

## Automated Tests (Future)

| Module | File | Coverage |
|--------|------|----------|
| Redirect rewrite | `shopify-cloner-publish` unit test | `rewriteRedirectTarget()` |
| Collection link | `cloner-collection-link.test.ts` | smart skip, dry run, 422 dedup |
| Draft payload | `buildProductPayload` test | always `status: draft` |

Run when Deno test runner available:

```bash
deno test supabase/functions/_shared/cloner-collection-link.test.ts
```
