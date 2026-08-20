# EUDRONEPARTS_TOKEN_RUNTIME_DIAGNOSTIC.md

**Generated:** 2026-06-11T07:40:46.219Z
**Mode:** Read-only — no Shopify writes, no secret values exposed

## Production runtime

### ⚠ Fingerprint ej tillgängligt i produktion ännu

Edge runtime har en token (401, inte `missing token env`), men **prefix/suffix/sha256** kräver att uppdaterad `eudroneparts-set-token` publiceras.

**Gör så här (ingen ny funktion — befintlig `eudroneparts-set-token`):**
1. Lovable → **Share → Publish** (synkar edge secrets + funktionskod)
2. Kör: `node scripts/eudroneparts-token-runtime-diagnostic.mjs`
3. Jämför sha256 med token från Develop Apps:
   `printf '%s' 'shpat_...' | node scripts/hash-shopify-token-local.mjs`

### Bekräftat i produktion (utan fingerprint)

| Fält | Värde |
|------|-------|
| HTTP | 401 |
| token_exists | true |
| prefix | _kräver publish_ |
| suffix | _kräver publish_ |
| length | _kräver publish_ |
| sha256 | _kräver publish_ |
| secret_name | `EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN` |
| secret_source | `supabase_edge_runtime_env` (Deno.env.get — synkad från Lovable/Supabase Edge secrets) |
| target_shop_domain | `ya1xhg-x6.myshopify.com` |
| shop.json (latest) | 401 |
| products/count.json | 401 (samma auth) |

### Trolig orsak till 401 trots ny token i Shopify

1. **Lovable secret inte uppdaterad** eller **inte Publish** efter ändring
2. **Fel secret-namn** i Lovable (t.ex. bara `SHOPIFY_ADMIN_ACCESS_TOKEN`)
3. **Whitespace/citat** runt token i secret-värdet
4. **Runtime använder fortfarande gammalt värde** tills Publish körs

## Jämför med Shopify-token

```bash
# 1. Hasha token från Develop Apps lokalt
printf '%s' 'shpat_DIN_TOKEN' | node scripts/hash-shopify-token-local.mjs

# 2. Jämför sha256 med production runtime ovan
node scripts/eudroneparts-token-runtime-diagnostic.mjs --compare-local
```
