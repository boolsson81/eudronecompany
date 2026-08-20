# TOKEN_MISMATCH_AUDIT.md

**Generated:** 2026-06-11  
**Last live probe:** 2026-06-11T04:58:39Z (`node scripts/token-mismatch-probe.mjs`)  
**Phase:** P0 Clone verification (audit only)  
**Target shop:** `ya1xhg-x6.myshopify.com` (Europe Drone Parts)  
**Secret under audit:** `EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN`

---

## Executive summary

| Finding | Status |
|---------|--------|
| Secret name in code | **Correct** — `EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN` |
| Secret present in Supabase edge runtime | **YES** |
| Target shop domain in code | **Correct** — `ya1xhg-x6.myshopify.com` (hardcoded) |
| Token accepted by Shopify | **NO** — 401 on `shop.json` and `products/count.json` |
| **Root cause** | **Invalid credential value** — the bound token is not a valid Admin API access token for `ya1xhg-x6.myshopify.com` (revoked, wrong shop, malformed, or never rotated after app reinstall) |

This is **not** a secret-name mismatch in application code. The runtime loads the correct variable name against the correct domain; Shopify rejects the **value**.

---

## 1. Every code location that loads `EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN`

| # | File | Function / context | Domain used | Fallback? |
|---|------|-------------------|-------------|-----------|
| 1 | `supabase/functions/_shared/cloner-shopify-access.ts` | `envMappingFor()` → `resolveShopAccess()` | `ya1xhg-x6.myshopify.com` | **No** — cloner audit path |
| 2 | `supabase/functions/shopify-cloner-scan/index.ts` | `envMappingFor()` | `ya1xhg-x6.myshopify.com` | No |
| 3 | `supabase/functions/shopify-cloner-publish/index.ts` | `envMappingFor()` | `ya1xhg-x6.myshopify.com` | No |
| 4 | `supabase/functions/shopify-cloner-import-connected/index.ts` | `envMappingFor()` | `ya1xhg-x6.myshopify.com` | No |
| 5 | `supabase/functions/eudroneparts-set-token/index.ts` | Direct `Deno.env.get()` | `ya1xhg-x6.myshopify.com` | No |
| 6 | `supabase/functions/eudroneparts-token-binding-probe/index.ts` | Candidate probe list | Tests both EU + ActionKing | Diagnostic only |
| 7 | `scripts/run-cloner-audit-local.mjs` | Local Deno runner | Via shared audit modules | Requires local env |

**EU store match rule (all cloner paths):**

```typescript
if (n.includes("eudrone") || d.includes("ya1xhg-x6") || d.includes("eudrone")) {
  return { token: Deno.env.get("EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN"), domain: "ya1xhg-x6.myshopify.com" };
}
```

**Explicitly does NOT read for EU target:**

| Secret name | Used for EU cloner? |
|-------------|:-------------------:|
| `SHOPIFY_ADMIN_ACCESS_TOKEN` | **NO** (ActionKing only) |
| `SHOPIFY_STORE_DOMAIN` | **NO** (EU domain hardcoded) |
| `EU_DRONE_PARTS_SHOPIFY_ADMIN_TOKEN` | **NO** (not in codebase) |
| `shopify_app_installations.access_token` | **Secondary** — `resolveShopAccess` tries env first; DB never synced while 401 |

---

## 2. Secret source chain

```
Shopify Admin (Develop apps)
        │
        │  manual copy of shpat_…
        ▼
Lovable Cloud Secrets  ──sync/publish──►  Supabase Edge Function Secrets
        │                                          │
        │                                          ▼
        │                              Deno.env.get("EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN")
        │                                          │
        └──────────────────────────────────────────┼──► eudroneparts-set-token (probe)
                                                   └──► cloner-shopify-access (audit)
```

| Layer | Source | Verifiable from agent? |
|-------|--------|:----------------------:|
| **Shopify Admin → Develop apps** | Human-generated Admin API token for custom app on `ya1xhg-x6` | **Manual only** |
| **Lovable secret** | Project Settings → Secrets | **Manual only** |
| **Supabase edge secret** | Same value after Lovable publish / `supabase secrets set` | **Indirect** — runtime has *some* value |
| **Database mirror** | `shopify_app_installations.access_token` via `eudroneparts-set-token` upsert | **Stale / empty** — upsert never succeeds while 401 |

---

## 3. Runtime verification (live probes 2026-06-10)

### 3.1 Secret name

| Check | Result |
|-------|--------|
| Code reads `EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN` | **YES** |
| Runtime returns `missing token env` | **NO** — secret is bound |
| Wrong name like `EU_DRONE_PARTS_*` | Not read by cloner |

### 3.2 Token fingerprint (production)

| Field | Value |
|-------|-------|
| **Prefix** | **Pending deploy** — enhanced `eudroneparts-set-token` (this branch) returns `prefix`, `suffix`, `length`, `sha256` |
| **Current deployed endpoint** | Does **not** expose fingerprint |
| **ActionKing reference** | `SHOPIFY_ADMIN_ACCESS_TOKEN` prefix = **`shpat_24`**, length unknown, works on `bvy0b8-0b` only |

**After deploying updated `eudroneparts-set-token`:**

```bash
curl -sS -X POST "$SUPABASE_URL/functions/v1/eudroneparts-set-token" \
  -H "Authorization: Bearer $ANON_KEY" -H "apikey: $ANON_KEY" | jq '.diagnostic.token_fingerprint'
```

Compare `sha256` against token copied from Shopify Admin → Develop apps.

### 3.3 Target shop domain

| Source | Domain | Correct? |
|--------|--------|:--------:|
| `cloner-shopify-access.ts` | `ya1xhg-x6.myshopify.com` | **YES** |
| `eudroneparts-set-token` | `ya1xhg-x6.myshopify.com` | **YES** |
| `shops` table (`shopRow`) | `ya1xhg-x6.myshopify.com` | **YES** |
| `SHOPIFY_STORE_DOMAIN` env | ActionKing (`bvy0b8-0b`) | N/A for EU cloner |

### 3.4 Shopify REST probes (live 2026-06-11)

| Endpoint | API version | Secret | HTTP | Shop name |
|----------|-------------|--------|:----:|-----------|
| `/admin/api/2025-07/shop.json` | 2025-07 | `EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN` | **401** | — |
| `/admin/api/latest/shop.json` | latest | `EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN` | **401** | — |
| `/admin/api/latest/products/count.json` | latest | `EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN` | **401** | — |
| `/admin/api/2025-07/shop.json` | 2025-07 | `SHOPIFY_ADMIN_ACCESS_TOKEN` on `ya1xhg-x6` | **401** | — |
| `/admin/api/2025-07/shop.json` | 2025-07 | `SHOPIFY_ADMIN_ACCESS_TOKEN` on `bvy0b8-0b` | **200** | **ActionKing** |

**Error body (all EU failures):**

```text
[API] Invalid API key or access token (unrecognized login or wrong password)
```

### 3.5 GraphQL probe

| Probe | Result |
|-------|--------|
| `jsonld-product-scan` (`shop_id=e6ad2afc-…`) | **401** GraphQL — DB/env token also invalid |

---

## 4. Three-way comparison

| Source | Expected | Observed | Match? |
|--------|----------|----------|:------:|
| **Shopify Admin → Develop apps** | Valid `shpat_…` for `ya1xhg-x6` custom app | Unknown (no API access) | **Cannot verify** |
| **Lovable secret** | Same `shpat_…` under exact name `EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN` | Unknown (no Lovable UI access) | **Cannot verify** |
| **Supabase edge runtime** | Same value as Lovable after publish | **Present but rejected** — 401 | **Value is wrong or stale** |
| **Supabase `shopify_app_installations`** | Mirror of env after successful `eudroneparts-set-token` | Empty via anon REST; upsert blocked by 401 | **Out of sync** |

### Cross-check: ActionKing token substitution?

| Test | Result | Implication |
|------|--------|-------------|
| `test-integration` on `ya1xhg-x6` with `***configured***` → falls back to `SHOPIFY_ADMIN_ACCESS_TOKEN` | **401** | ActionKing token **cannot** access EU store |
| `SHOPIFY_ADMIN_ACCESS_TOKEN` prefix | `shpat_24` | Known-good token for **different** shop |

If `EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN` fingerprint (after deploy) shows `prefix: shpat_24` and `same_value_as_eu_secret: true`, root cause is **ActionKing token mistakenly bound under EU secret name**.

If fingerprint differs from `shpat_24` but still 401, root cause is **EU-specific token revoked, wrong app, or malformed**.

---

## 5. Scopes

### Required for clone verification audit

`read_products`, `read_inventory`, `read_content`, `read_online_store_pages`, `read_online_store_navigation`, `read_metaobjects`, `read_files`

### Repo scope string (`eudroneparts-set-token`)

```
write_products,read_products,write_content,read_content,read_themes,write_themes,
write_files,read_files,read_orders,read_customers,read_inventory,write_inventory,
read_locales,write_locales,write_translations,write_online_store_navigation,
write_online_store_pages,read_online_store_pages,write_publications,read_publications
```

| Scope | In repo string? |
|-------|:---------------:|
| `read_online_store_navigation` | **NO** (only write) |
| `read_metaobjects` | **NO** |

**Note:** Scope gaps cause **403** on specific endpoints, not **401**. Current failure is **authentication**, not authorization.

---

## 6. Mismatch analysis

| Hypothesis | Evidence for | Evidence against | Likelihood |
|------------|--------------|------------------|:----------:|
| **A. Revoked / rotated token not updated in secrets** | 401 "unrecognized login"; secret exists | — | **High** |
| **B. ActionKing token under EU secret name** | Common ops mistake; AK token 401 on EU | Prefix unknown until fingerprint deploy | **Medium** |
| **C. Token for wrong Shopify store** | 401 on ya1xhg; AK token also 401 on ya1xhg | Domain hardcoded correctly in code | **Medium** |
| **D. Malformed secret (quotes, newline, truncation)** | Would cause 401 | Length unknown until fingerprint | **Medium** |
| **E. Custom app uninstalled / deleted** | 401 on all endpoints | — | **Medium** |
| **F. Wrong secret name in Lovable** | — | Runtime has value under correct name | **Low** |
| **G. Wrong domain in code** | — | Domain verified `ya1xhg-x6` everywhere | **Ruled out** |

---

## 7. Root cause (determination)

**Primary root cause:** The value bound to `EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN` in the Supabase edge runtime is **not accepted by Shopify** as a valid Admin API access token for `ya1xhg-x6.myshopify.com`.

**What is ruled out:**

- Secret name mismatch in application code
- Missing secret in edge runtime
- Wrong target domain in cloner code paths
- Scope-only issue (would be 403, not 401)

**Most probable sub-cause:** Token was **revoked or rotated** in Shopify Admin (Develop apps) without updating Lovable/Supabase secrets — **or** an **ActionKing / stale token** was stored under the EU secret name.

---

## 8. Fix procedure (manual)

1. **Shopify Admin** (`ya1xhg-x6`) → Settings → Apps and sales channels → **Develop apps**
2. Open (or create) custom app for clone verification
3. Note **app name**, **token created date**, enable required read scopes (§5)
4. **Reveal token once** → copy full `shpat_…`
5. **Lovable** → Secrets → set **`EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN`** = exact token (no quotes/whitespace)
6. **Share → Publish**
7. Verify fingerprint match:

   ```bash
   node scripts/token-mismatch-probe.mjs | jq '.eudroneparts_set_token.json.diagnostic'
   ```

8. Confirm `shop.json` → **200**, `products/count.json` → **200**

---

## 9. Deploy blocker (audit handlers)

| Item | Repo `main` | Production |
|------|:-----------:|:----------:|
| `collection_reconciliation_audit` | YES | **NO** — returns job queue |
| `final_verification_audit` | YES | **NO** — returns job queue |
| `eudroneparts-set-token` fingerprint | **This branch** | Old version (no fingerprint) |

Deploy requires `SUPABASE_ACCESS_TOKEN` in GitHub secrets or Lovable publish of edge functions.

---

## Guardrails

- NO Shopify updates  
- NO normalization  
- NO publishing  
- Audit only  

---

*Probes: `eudroneparts-set-token`, `test-shopify-token`, `test-integration`, `jsonld-product-scan`, `shopify-cloner-worker`. No secrets modified.*
