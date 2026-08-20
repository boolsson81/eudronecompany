# CLONER_TOKEN_VALIDATION_REPORT.md

**Generated:** 2026-06-10T18:55:00Z  
**Phase:** Clone verification (audit only)  
**Shop:** Europe Drone Parts — `ya1xhg-x6.myshopify.com`  
**Secret name (code):** `EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN`  
**Migration:** ActionKing → EUDroneParts (`3d9876af-885c-49e9-a4b0-c4943c06112f`)

---

## Verdict

| | |
|---|---|
| **Token validation** | **FAIL** — HTTP 401 on `shop.json` |
| **Audit handlers deployed** | **FAIL** — `collection_reconciliation_audit` / `final_verification_audit` return job-queue response |
| **Clone verification GO** | **NO-GO** |

---

## 1. Which Shopify App generated the token?

### API result (live, 2026-06-10)

| Field | Value |
|-------|-------|
| **App name (API)** | **Not determinable** — Shopify returns 401 before any shop/app metadata |
| **Token prefix (API)** | **Not exposed** — `test-shopify-token` does not probe `EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN`; `eudroneparts-token-binding-probe` not deployed |
| **Secret present in edge runtime** | **YES** — `eudroneparts-set-token` returns `Shopify rejected…` (not `missing token env`) |
| **DB install row (anon REST)** | **Empty** — `shopify_app_installations` for `ya1xhg-x6` returns `[]` (RLS or never synced while token invalid) |

### Expected app paths in this codebase

| Path | App | How token is set | Used for cloner EU target? |
|------|-----|------------------|:--------------------------:|
| **A — Custom Admin API app** | App in **EUDroneParts** Admin → **Develop apps** | Manual `shpat_…` → `EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN` | **YES** |
| **B — DigitalSignal OAuth app** | **DigitalSignal** (`docs/shopify-app-store-config.md`) | OAuth → `shopify_app_installations` | **NO** for cloner audit |

### Cross-reference (ActionKing token — working, wrong store)

| Field | Value |
|-------|-------|
| Secret | `SHOPIFY_ADMIN_ACCESS_TOKEN` |
| Prefix | `shpat_24` |
| `shop.json` on `bvy0b8-0b.myshopify.com` | **200** — shop name **ActionKing** |
| Same token on `ya1xhg-x6.myshopify.com` | **401** (inferred — ActionKing token cannot access EU store) |

**Conclusion:** The bound `EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN` is either stale/revoked, issued for a different shop, or a wrong secret value. App name and created date require manual check in EUDroneParts Admin → Develop apps → API credentials.

---

## 2. Required scopes (clone verification audit)

### 2.1 Scopes required

| Scope | Needed for | Required? |
|-------|------------|:---------:|
| `read_products` | `products/count.json`, product GraphQL deep-verify | **YES** |
| `read_inventory` | variant `inventoryQuantity` | **YES** |
| `read_content` | pages (legacy content API) | **YES** |
| `read_online_store_pages` | pages GraphQL | **YES** |
| `read_online_store_navigation` | menus GraphQL | **YES** |
| `read_metaobjects` | metaobject references | **YES** |
| `read_files` | file/media references | **YES** |

### 2.2 Scopes in repo (`eudroneparts-set-token` → `shopify_app_installations.scopes`)

```
write_products, read_products
write_content, read_content
read_themes, write_themes
write_files, read_files
read_orders, read_customers
read_inventory, write_inventory
read_locales, write_locales, write_translations
write_online_store_navigation, write_online_store_pages, read_online_store_pages
write_publications, read_publications
```

### 2.3 Scope gap analysis (repo expectation vs audit minimum)

| Required scope | In repo scope string? | Status |
|----------------|:---------------------:|--------|
| `read_products` | YES | OK |
| `read_inventory` | YES | OK |
| `read_content` | YES | OK |
| `read_online_store_pages` | YES | OK |
| `read_online_store_navigation` | **NO** (only `write_online_store_navigation`) | **GAP** |
| `read_metaobjects` | **NO** | **GAP** |
| `read_files` | YES | OK |

### 2.4 Live scope verification

| | |
|---|---|
| **Result** | **Not possible** — 401 on all authenticated endpoints |
| **After token fix** | Re-run `POST /functions/v1/eudroneparts-set-token` or deploy `eudroneparts-token-binding-probe` |

**Recommended minimum scope string for custom app:**

```text
read_products,read_inventory,read_content,read_online_store_pages,read_online_store_navigation,read_metaobjects,read_files
```

---

## 3. Token metadata

| Field | Value |
|-------|-------|
| **App name** | **Unknown** (401 — verify in Develop apps) |
| **API scopes (live)** | **Unknown** (401) |
| **Scopes (repo expectation)** | See §2.2 |
| **Token created date** | **Unknown** — check app API credentials in Admin after login |
| **Shop domain (code target)** | `ya1xhg-x6.myshopify.com` |
| **`shops.id`** | `e6ad2afc-e468-49a7-8d33-9b1837419ed8` |
| **Secret env var** | `EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN` |
| **Token present in prod** | **YES** |
| **Token mask (prefix)** | **Not available** from deployed endpoints |

---

## 4. Read-only REST tests (live)

**Endpoint base:** `https://ya1xhg-x6.myshopify.com/admin/api/2025-07/`  
**Auth:** `X-Shopify-Access-Token: <EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN>` (edge secret)

### 4.1 `GET shop.json`

| Field | Result |
|-------|--------|
| **URL** | `https://ya1xhg-x6.myshopify.com/admin/api/2025-07/shop.json` |
| **Probe** | `POST /functions/v1/eudroneparts-set-token` |
| **HTTP** | **401** |
| **Shop name** | — |
| **Error** | `[API] Invalid API key or access token (unrecognized login or wrong password)` |
| **Secret used** | `EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN` |

### 4.2 `GET products/count.json`

| Field | Result |
|-------|--------|
| **URL** | `https://ya1xhg-x6.myshopify.com/admin/api/2025-07/products/count.json` |
| **HTTP** | **401** *(same auth failure — `jsonld-product-scan` with EU `shop_id` also returns GraphQL 401)* |
| **Product count** | — |

### 4.3 Additional live probes

| Probe | Result |
|-------|--------|
| `jsonld-product-scan` (`shop_id=e6ad2afc-…`) | **401** GraphQL |
| `test-shopify-token` default | ActionKing `SHOPIFY_ADMIN_ACCESS_TOKEN` **200**; EU secret not tested |
| `shopify_app_installations` REST (anon) | `[]` for `ya1xhg-x6` |

---

## 5. Blocker 2 — Deploy status (`shopify-cloner-worker`)

| Action | In repo `main`? | Deployed to prod? | Live response (2026-06-10) |
|--------|:---------------:|:-----------------:|----------------------------|
| `pre_250_discover.actions` | YES | **NO** | `actions: undefined` |
| `collection_reconciliation_audit` | YES | **NO** | `{"ok":true,"processed":1,"results":[…]}` — **job queue** |
| `final_verification_audit` | YES | **NO** | `{"ok":true,"processed":1,"results":[…]}` — **job queue** |

**Deploy blocked:** `SUPABASE_ACCESS_TOKEN` not in agent env; GitHub Actions secret returns 403 to cloud agent.

---

## 6. Audit script results (this run)

```bash
node scripts/collection-reconciliation-audit.mjs   # exit 1
node scripts/cloner-final-verification-audit.mjs # exit 1
```

| Report | Status |
|--------|--------|
| `MISSING_COLLECTIONS.md` | ERROR — handler not deployed |
| `CLONER_FINAL_VERIFICATION_REPORT.md` | ERROR — handler not deployed |

### Metrics (not available until P0 fixed)

| Metric | Source | Target | Missing |
|--------|--------|--------|---------|
| Products | — | — | — |
| Collections | — | — | — |
| Variants | — | — | — |
| Images | — | — | — |
| Inventory | — | — | — |
| Metafields | — | — | — |
| SEO | — | — | — |
| **GO / NO-GO** | | | **NO-GO** |

**Partial (migration tracking only):** `pre_250_discover` reports **12 058** items with `publish_status=published` — not a full source/target reconciliation.

---

## 7. Path to GO (ordered)

### Step 1 — Fix token (Lovable / Supabase)

1. EUDroneParts Admin → **Develop apps** → note **app name** and **token created date**
2. Enable scopes from §2.1 (include `read_online_store_navigation`, `read_metaobjects`)
3. Generate new Admin API access token (`shpat_…`)
4. Set **`EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN`** in Lovable Secrets + Supabase Edge secrets (exact name)
5. **Lovable → Share → Publish**
6. Verify:

   ```bash
   curl -sS -X POST "$SUPABASE_URL/functions/v1/eudroneparts-set-token" \
     -H "Authorization: Bearer $ANON_KEY" -H "apikey: $ANON_KEY" | jq '.ok, .shopify.status'
   # Expect: true, 200
   ```

### Step 2 — Deploy `shopify-cloner-worker`

Add `SUPABASE_ACCESS_TOKEN` to GitHub secrets, then:

```bash
npx supabase functions deploy shopify-cloner-worker --project-ref wsncjdajweoujhidlxas
```

Verify audit actions return `action` + audit payload, **not** `processed` queue response.

### Step 3 — Run audits

```bash
node scripts/collection-reconciliation-audit.mjs
node scripts/cloner-final-verification-audit.mjs
```

### Step 4 — GO criteria

- [ ] `shop.json` → **200** on `ya1xhg-x6`
- [ ] `products/count.json` → **200**
- [ ] `collection_reconciliation_audit` → audit JSON with `SOURCE_COLLECTIONS`
- [ ] `final_verification_audit` → audit JSON with `sections` + `verdict`
- [ ] Reports populated with source vs target metrics
- [ ] **GO** only if verification audit verdict is GO

---

## Guardrails

- NO Shopify updates  
- NO normalization  
- NO publishing  
- NO collection creation  
- Audit only  

---

*Live probes: `eudroneparts-set-token`, `test-shopify-token`, `jsonld-product-scan`, `shopify-cloner-worker`, audit scripts. No secrets modified.*
