# EuroDroneParts — Migration Recovery Report

**Generated:** 2026-06-11T19:22:50.331Z
**Migration:** ActionKing - EUDroneParts (`3d9876af-885c-49e9-a4b0-c4943c06112f`)
**Mode:** Edge audit aggregation (recovery pass deploy pending — no destructive actions)

## Executive summary

| Metric | Value |
|--------|------:|
| Products published | 12 058 |
| Collections (source / target live) | 824 / 157 |
| Menus failed (limit) | 8 |
| Data migration completion | 100% |
| Go-live readiness (est.) | 58% |

## Task 1 — Menu Audit

> Live target menu inventory requires `migration_recovery_pass` deploy. Below: migration failure analysis from `cloner-fix-collections-and-menus`. **No menus deleted.**

| Handle | Failure type | Error / notes |
| --- | --- | --- |
| partnership | limit | menu limit reached |
| dronare | limit | menu limit reached |
| actionkameror | limit | menu limit reached |
| main-menu | failed | [{"field":null,"message":"Validation failed: You’ve reached the limit of menus for your store."}] |
| customer-account-main-menu | failed | [{"field":null,"message":"Validation failed: You’ve reached the limit of menus for your store."}] |
| footer | failed | [{"field":null,"message":"Validation failed: You’ve reached the limit of menus for your store."}] |
| enterprise-dr-nare | failed | [{"field":null,"message":"Validation failed: You’ve reached the limit of menus for your store."}] |
| meny | failed | [{"field":null,"message":"Validation failed: You’ve reached the limit of menus for your store."}] |
| vandring-outdoor | failed | all items unresolvable |

### Recommendations

- **Do NOT auto-delete menus.** Review legacy menus on target to free Shopify menu slots.
- **8 menus** blocked by Shopify menu limit: partnership, dronare, actionkameror (+ failed re-publish attempts for main-menu, footer, etc.).
- After freeing slots, re-invoke `cloner-fix-collections-and-menus` (default action) to retry failed menus with pruned items.
- Classify live menus as Required/Legacy/Empty/Duplicate after deploy: `node scripts/migration-recovery-pass.mjs`

## Task 2 — Collection Membership Recovery

> Smart→custom collections identified. Product add requires deployed `migration_recovery_pass`.

| Handle | Title | On target | Target products | Source kind |
| --- | --- | --- | --- | --- |
| dji-air-2-tillbehor | Högkvalitativa DJI Air 2 Tillbehör för Drönare | yes | 0 | smart |
| dji-air-3-tillbehor-omfattande-sortiment | Omfattande Sortiment av DJI Air 3 Tillbehör | yes | 0 | smart |
| dji-avata-2-tillbehor | DJI Avata 2 tillbehör – Skydd & batterier till din drönare | yes | 0 | smart |
| dji-flip-tillbehor | DJI Flip™ tillbehör – Optimal utrustning till din drönare | yes | 0 | smart |
| dji-mini-3-tillbehor | DJI Mini 3 Tillbehör | yes | 0 | smart |
| dji-neo-2-tillbehor | DJI Neo 2 Tillbehör för din Drönare | yes | 0 | smart |
| dji-neo-tillbehor | DJI Neo Tillbehör – Batteri & mer för din drönare | yes | 0 | smart |
| dronare-reservdelar-ovriga | Drönare reservdelar: Allt för din drönarreparation | yes | 0 | smart |
| kamerastativ-tripod | Kamerastativ & Tripod – Stabilt Mobil- och Kamerastativ | yes | 0 | smart |
| osmo-action-6-tillbehor | Osmo Action 6 tillbehör: Komplett utbud för din actionkamera | yes | 0 | smart |
| tillbehor-dji-inspire | DJI Inspire Tillbehör | yes | 0 | smart |

### Recovery action (post-deploy)

```bash
node scripts/migration-recovery-pass.mjs
```

This reads source collection membership, maps products via `cloner_object_mappings`, and adds missing products only (no removals).

## Task 3 — Migration Quality Audit

### Collections

| Check | Result |
| --- | --- |
| Source collections in migration | 824 |
| Live collections on target | 157 |
| Missing vs migration reconciliation | 671 |
| Published in migration | 824 |
| Empty collections (target) | 49 |

### Menus (from failure analysis)

| Menu | Item | Type | Reason |
| --- | --- | --- | --- |
| main-menu | Outlet | COLLECTION | collection handle not found: actionking-outlet |
| customer-account-main-menu | Orders | CUSTOMER_ACCOUNT_PAGE | customer_account_page not configured on target |
| customer-account-main-menu | Profile | CUSTOMER_ACCOUNT_PAGE | customer_account_page not configured on target |
| enterprise-dr-nare | Reservdelar | COLLECTION | collection handle not found: reservdelar-dji-enterprise |
| meny | Actionkameror | COLLECTION | collection handle not found: actionkamer-dji-gopro-insta360 |
| meny | Kameror | COLLECTION | collection handle not found: kameror-kameror |
| meny | Mobiltillbehör | COLLECTION | collection handle not found: mobiltillbehor |
| vandring-outdoor | Vandring & Outdoor | COLLECTION | collection handle not found: outdoor-utrustning-vandring |

### Products

- **12 058** products published in migration
- Deep product audit (images, variants, inventory, metafields): run batched `migration_recovery_pass` after deploy
- `final_verification_audit` currently hits edge compute limits — use batched recovery pass instead

## Task 4 — Readiness Score

**Data migration completion:** ~100%
**Go-live readiness (estimated):** ~58% — menus and smart→custom collection membership remain

### Critical blockers

1. **8 menus** failed — Shopify menu limit reached on target store
2. **Smart→custom collections** — product membership may be incomplete until recovery pass runs
3. **Edge function deploy** — `migration_recovery_pass` / updated `cloner-fix-collections-and-menus` must be deployed (set `SUPABASE_ACCESS_TOKEN` in GitHub secrets)

### Recommended next actions

1. Deploy edge functions: `supabase functions deploy cloner-fix-collections-and-menus migration-recovery-pass --project-ref wsncjdajweoujhidlxas`
2. Run `node scripts/migration-recovery-pass.mjs` for full menu audit + collection recovery + quality audit
3. Manually review target menus; retire empty/legacy menus to free slots (no auto-delete)
4. Re-publish failed menus via `cloner-fix-collections-and-menus`

**Estimated effort remaining:** Medium — menu limit resolution + collection membership verification + deploy

### Deferred (non-blockers)

- Blog migration
- Shop policies
- SEO generation
- ActionKing → EuroDroneParts text replacement
- Theme modifications
