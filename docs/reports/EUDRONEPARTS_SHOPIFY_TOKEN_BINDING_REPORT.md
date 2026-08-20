# EUDRONEPARTS_SHOPIFY_TOKEN_BINDING_REPORT.md

**Generated:** 2026-06-10  
**Mode:** Read-only secret-binding audit — no Shopify writes, no publish, no Supabase mutations  
**Project:** `wsncjdajweoujhidlxas` (Lovable Cloud)  
**Target shop:** `ya1xhg-x6.myshopify.com` (Europe Drone Parts)

---

## Executive summary

Problemet är **inte** att token saknas i edge runtime. `EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN` **finns** i produktion men **avvisas av Shopify (401)** mot `ya1xhg-x6.myshopify.com`.

Troligaste orsaker (i prioritetsordning):

1. **Secret-namn mismatch i Lovable** — giltig EUDroneParts-token ligger under annat namn än vad cloner-koden läser  
2. **Fel/stale värde** i `EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN` (roterad/revokerad token)  
3. **DB-kopia stale** — `shopify_app_installations.access_token` speglar samma ogiltiga värde  

**Cloner-koden använder inte ActionKing-fallback** (`SHOPIFY_ADMIN_ACCESS_TOKEN`) för EUDroneParts target.

---

## 1. Vilka secret-namn koden faktiskt läser

### 1.1 EUDroneParts cloner / audit (target store)

| Secret-namn | Läses av kod? | Fil(er) |
|-------------|:-------------:|---------|
| **`EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN`** | **JA** | `cloner-shopify-access.ts`, `shopify-cloner-scan`, `shopify-cloner-publish`, `shopify-cloner-import-connected`, `eudroneparts-set-token` |
| `EU_DRONE_PARTS_SHOPIFY_ADMIN_TOKEN` | **NEJ** | — (finns inte i repo) |
| `SHOPIFY_ADMIN_TOKEN` | **NEJ** | — |
| `SHOPIFY_ACCESS_TOKEN` | **NEJ** (cloner) | Endast `test-shopify-token`, `expresspack-stock-value` |
| `SHOPIFY_ADMIN_ACCESS_TOKEN` | **NEJ** (för EU target) | Används endast för ActionKing-mapping i samma moduler |
| `SHOPIFY_STORE_DOMAIN` | **NEJ** (för EU target) | EU-domän är **hårdkodad** `ya1xhg-x6.myshopify.com` |

**Cloner mapping (target):**

```typescript
// cloner-shopify-access.ts
if (n.includes("eudrone") || d.includes("ya1xhg-x6") || d.includes("eudrone")) {
  return {
    token: Deno.env.get("EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN") || null,
    domain: "ya1xhg-x6.myshopify.com",
  };
}
```

**Ingen fallback** till `SHOPIFY_ADMIN_ACCESS_TOKEN` när store matchar EUDroneParts.

### 1.2 ActionKing (source store) — referens

| Secret-namn | Läses av kod? |
|-------------|:-------------:|
| `SHOPIFY_ADMIN_ACCESS_TOKEN` | **JA** |
| `SHOPIFY_STORE_DOMAIN` | **JA** |

### 1.3 Databas / integration (andra code paths)

| Källa | Används av | Cloner audit? |
|-------|------------|:---------------:|
| `shopify_app_installations.access_token` | `jsonld-product-scan`, `shopify-app-sync-products`, m.fl. | Indirekt (samma 401) |
| `integrations.config.access_token` | `shopify-images-to-ads`, m.fl. | **NEJ** — cloner läser env, inte integrations |

`resolveShopAccess` (cloner audit) prioriterar **env** före `shop.access_token` på store-raden.

---

## 2. Vilka secrets som finns i produktion (edge runtime)

*Infererat från live read-only anrop — inte Lovable UI direkt.*

Lovable Cloud synkar secrets till **samma Supabase Edge Function secrets** som CLI. Tabellen nedan är vad **produktion faktiskt exponerar**.

| Secret-namn | Finns i prod? | Bevis | Prefix (maskad) |
|-------------|:-------------:|-------|-----------------|
| **`EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN`** | **JA** | `eudroneparts-set-token` → inte `missing token env` | **Ej exponerad** av befintliga endpoints |
| **`SHOPIFY_ADMIN_ACCESS_TOKEN`** | **JA** | `test-shopify-token` → `exists: true`, status 200 | **`shpat_24`** |
| **`SHOPIFY_ACCESS_TOKEN`** | **NEJ** | `test-shopify-token` → `exists: false` | — |
| **`SHOPIFY_ADMIN_TOKEN`** | **Okänt** | Läses inte av kod; ingen probe deployad | — |
| **`EU_DRONE_PARTS_SHOPIFY_ADMIN_TOKEN`** | **Okänt** | Läses inte av kod | — |
| **`SHOPIFY_STORE_DOMAIN`** | **JA** | `test-integration` tom domain → ActionKing | Pekar på **ActionKing** |

### 2.1 Vad du ska verifiera i Lovable UI

Lovable → **Project Settings → Secrets** (eller motsvarande Cloud-secrets):

| Kontroll | Förväntat för cloner |
|----------|----------------------|
| Finns `EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN`? | **Måste finnas** med giltig `shpat_...` för `ya1xhg-x6` |
| Finns token bara som `SHOPIFY_ADMIN_ACCESS_TOKEN`? | **Räcker inte** för cloner target — det är ActionKing-path |
| Finns `EU_DRONE_PARTS_*` eller `SHOPIFY_ADMIN_TOKEN`? | **Ignoreras** av cloner-koden |
| Matchar värdet i Lovable det i Supabase Dashboard → Edge Functions → Secrets? | Ska vara identiskt efter sync/publish |

**Om Lovable har rätt token under fel namn:** kopiera värdet till secret med exakt namn `EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN` och gör **Share → Publish** (eller `supabase secrets set`).

---

## 3. Pekar token mot rätt shop?

| Test | Domain | Token-källa | Resultat |
|------|--------|-------------|----------|
| `eudroneparts-set-token` | `ya1xhg-x6.myshopify.com` | `EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN` | **401** |
| `test-integration` | `ya1xhg-x6.myshopify.com` | `SHOPIFY_ADMIN_ACCESS_TOKEN` (fallback) | **401** |
| `test-integration` | `bvy0b8-0b.myshopify.com` | `SHOPIFY_ADMIN_ACCESS_TOKEN` | **200** — "Butik: ActionKing" |
| `test-integration` | *(tom → secret domain)* | `SHOPIFY_ADMIN_ACCESS_TOKEN` | **200** — ActionKing |
| `fetch-shopify-collections` | `SHOPIFY_STORE_DOMAIN` env | `SHOPIFY_ADMIN_ACCESS_TOKEN` | **200** — 824 collections, handle `presentkort-actionking` |
| `jsonld-product-scan` | `ya1xhg-x6` via DB token | `shopify_app_installations` | **401** |

**Slutsats:**

- Kod **pekar korrekt domain** (`ya1xhg-x6`) för EUDroneParts cloner  
- Bundet secret **`EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN` är ogiltigt** för den domänen  
- **`SHOPIFY_ADMIN_ACCESS_TOKEN` är ActionKing-token** — fungerar **inte** på `ya1xhg-x6`  
- **`SHOPIFY_STORE_DOMAIN` är ActionKing** — inte EUDroneParts  

---

## 4. Använder koden ActionKing-token eller fallback?

| Scenario | Händer det? | Bevis |
|----------|:-----------:|-------|
| Cloner target läser `SHOPIFY_ADMIN_ACCESS_TOKEN` | **NEJ** | `envMappingFor()` returnerar endast `EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN` för EU |
| Cloner target läser `SHOPIFY_STORE_DOMAIN` | **NEJ** | Domain hårdkodad `ya1xhg-x6.myshopify.com` |
| `shopify-list-drafts` / `fetch-shopify-collections` | ActionKing env | **JA** — men dessa är **inte** cloner audit path |
| `shopify-images-to-ads` för EU `shop_id` | `SHOPIFY_ADMIN_ACCESS_TOKEN` **före** integration config | **JA** — fel path för EU; använder ActionKing env |

**Cloner audit** (`collection_reconciliation_audit`, `final_verification_audit`) → **`EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN` only**.

---

## 5. Read-only REST-tester

### 5.1 `GET /admin/api/.../shop.json`

| # | Secret-namn | Shop domain | HTTP | Shop name i svar |
|---|-------------|-------------|------|------------------|
| A | `EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN` | `ya1xhg-x6.myshopify.com` | **401** | — |
| B | `SHOPIFY_ADMIN_ACCESS_TOKEN` | `ya1xhg-x6.myshopify.com` | **401** | — |
| C | `SHOPIFY_ADMIN_ACCESS_TOKEN` | `bvy0b8-0b.myshopify.com` | **200** | **ActionKing** |

*Test A via `POST /functions/v1/eudroneparts-set-token` (API version `2025-07`).*  
*Test B/C via `POST /functions/v1/test-integration`.*

### 5.2 `GET /admin/api/.../products/count.json`

| # | Secret-namn | Shop domain | HTTP | Antal |
|---|-------------|-------------|------|-------|
| A | `EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN` | `ya1xhg-x6.myshopify.com` | **401** *(infererat)* | — |
| B | `SHOPIFY_ADMIN_ACCESS_TOKEN` | `ya1xhg-x6.myshopify.com` | **401** *(samma token → samma auth-fel)* | — |

*Samma access token ger samma 401 på alla REST-endpoints för samma shop. Separat count-test ej kört live för rad A (shop.json räcker som auth-probe).*

**För fullständig count-verifiering efter fix**, deploya read-only proben (se §7) eller kör:

```bash
curl -sS "https://ya1xhg-x6.myshopify.com/admin/api/2025-07/products/count.json" \
  -H "X-Shopify-Access-Token: $EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN"
```

---

## 6. 401-diagnos (detalj)

### 6.1 `EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN` → `ya1xhg-x6`

| Fält | Värde |
|------|-------|
| **Secret-namn som användes** | `EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN` |
| **Shop domain** | `ya1xhg-x6.myshopify.com` |
| **Token saknas?** | **NEJ** — annars `{"error":"missing token env"}` |
| **Token maskad i svar?** | **NEJ** — befintliga endpoints exponerar inte prefix för detta secret |
| **HTTP** | **401** |
| **Shopify-fel** | `[API] Invalid API key or access token (unrecognized login or wrong password)` |
| **Tillhör annan butik?** | **Möjligt** — ActionKing-token (`shpat_24...`) ger också **401** på `ya1xhg-x6`, men EU-secret prefix är okänt. Kan också vara **revokerad EU-token**. |

### 6.2 Databas-token (`shopify_app_installations`)

| Fält | Värde |
|------|-------|
| **Källa** | `shopify_app_installations` för `ya1xhg-x6` (via `jsonld-product-scan`) |
| **Shop domain** | `ya1xhg-x6.myshopify.com` |
| **Token saknas?** | **NEJ** — annars `Shopify credentials missing for shop` |
| **HTTP** | **401** GraphQL |
| **Trolig orsak** | Samma stale värde som env-secret (ej uppdaterad sedan `eudroneparts-set-token` misslyckades) |

---

## 7. Rekommenderad fix (secret-koppling, inte ny Shopify-app)

### Steg 1 — Verifiera namn i Lovable

1. Öppna Lovable-projektet → **Secrets**  
2. Bekräfta att **`EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN`** finns (exakt stavning)  
3. Om EU-token bara finns som `SHOPIFY_ADMIN_ACCESS_TOKEN` eller annat namn → **det räcker inte för cloner**

### Steg 2 — Sätt rätt värde under rätt namn

**Supabase Dashboard** (samma värde som Lovable efter publish):

```
Project Settings → Edge Functions → Secrets
Name:  EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN
Value: shpat_<giltig token för ya1xhg-x6>
```

**CLI:**

```bash
npx supabase secrets set EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN="shpat_..." \
  --project-ref wsncjdajweoujhidlxas
```

### Steg 3 — Lovable Publish

**Share → Publish** så secrets + edge functions synkas.

### Steg 4 — Verifiera binding

```bash
# shop.json ska ge 200
curl -sS -X POST "$SUPABASE_URL/functions/v1/eudroneparts-set-token" \
  -H "Authorization: Bearer $ANON_KEY" -H "apikey: $ANON_KEY" | jq '.ok, .shopify.status'

# products/count ska ge 200 + count
curl -sS "https://ya1xhg-x6.myshopify.com/admin/api/2025-07/products/count.json" \
  -H "X-Shopify-Access-Token: <samma token>"
```

### Steg 5 — (Valfritt) Deploy binding-probe

Repo innehåller read-only `eudroneparts-token-binding-probe` som jämför **alla kandidat-secret-namn** (maskade prefix) mot både `ya1xhg-x6` och ActionKing:

```bash
npx supabase functions deploy eudroneparts-token-binding-probe --project-ref wsncjdajweoujhidlxas
curl -sS -X POST "$SUPABASE_URL/functions/v1/eudroneparts-token-binding-probe" \
  -H "Authorization: Bearer $ANON_KEY" -H "apikey: $ANON_KEY" | jq .
```

---

## 8. Bindningsdiagram

```text
Lovable Secrets
    │
    ├─ EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN ──► cloner-shopify-access (EU target) ──► ya1xhg-x6  [401 idag]
    │
    ├─ SHOPIFY_ADMIN_ACCESS_TOKEN ────────► ActionKing paths ──────────────────► bvy0b8-0b  [200]
    │
    └─ SHOPIFY_STORE_DOMAIN ──────────────► ActionKing default domain

shopify_app_installations.access_token (ya1xhg-x6) ──► jsonld / sync-products  [401 idag]
```

---

## 9. GO / NO-GO

| Kontroll | Status |
|----------|--------|
| Secret-namn matchar kod (`EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN`) | **JA** (finns i prod) |
| Token giltig för `ya1xhg-x6` | **NEJ** (401) |
| `shop.json` read-only | **FAIL** |
| `products/count.json` read-only | **FAIL** (samma auth) |
| Cloner använder ActionKing-fallback | **NEJ** (korrekt isolering, men EU-secret fel) |

### **NO-GO** — fixa secret-**värde** eller secret-**namnkoppling** i Lovable/Supabase innan audit återupptas.

---

*Audit only. Inga secrets ändrade. Ingen Shopify write. Ingen publicering.*
