# EuroDroneParts — Theme Deploy Guide

**Store:** `ya1xhg-x6.myshopify.com`  
**Theme source:** `theme/` (Dawn 15.4.1 + EDP customizations)  
**Integration branch:** merges PR #8–#12

---

## Prerequisites

1. **Shopify OAuth** with `read_themes` + **`write_themes`** scopes  
   Re-install if token returns 401:
   ```
   https://<app-domain>/functions/v1/shopify-app-install?shop=ya1xhg-x6.myshopify.com
   ```

2. **Shopify CLI**
   ```bash
   npm install -g @shopify/cli @shopify/theme
   shopify auth login --store ya1xhg-x6.myshopify.com
   ```

3. **Verify live menu handles** (before publish — adjust `theme/sections/header-group.json` if needed):
   ```bash
   node scripts/verify-edp-theme-menus.mjs
   ```

---

## Menu wiring (pre-configured)

| Setting | Handle | Fallback if missing |
|---------|--------|---------------------|
| `menu_consumer` | `main-menu` | — |
| `menu_enterprise` | `enterprise` | `enterprise-drones` |
| Footer block | `footer` | — |

Utility bar links:
- Offert → `/pages/contact-quote`
- Support → `/pages/service-support`

If your store uses `enterprise-drones` instead of `enterprise`, edit `theme/sections/header-group.json` before push.

**Note:** `menu_consumer_handle` and `menu_enterprise_handle` are plain text menu handles (not `link_list` pickers) so the theme works on modern Shopify themes that only allow one `link_list` per section.

### Setup required pages

```bash
node scripts/setup-edp-theme-pages.mjs
```

Creates `/pages/enterprise` and `/pages/consumer` with correct templates if missing.

---

## Deploy (unpublished preview first)

### Option A — Automated push script (recommended)

```bash
# Verify menu handles
node scripts/verify-edp-theme-menus.mjs

# Dry-run (lists files)
node scripts/push-edp-theme.mjs

# Push to unpublished theme (default: Horizon theme id 186020200776)
node scripts/push-edp-theme.mjs --execute
```

Preview URL is printed after push completes.

### Option B — Shopify CLI

```bash
cd theme

# Push as new unpublished theme — does NOT affect live storefront
shopify theme push \
  --store ya1xhg-x6.myshopify.com \
  --unpublished \
  --theme "EDP Dawn v1"

# Local preview
shopify theme dev --store ya1xhg-x6.myshopify.com
```

---

## Post-push checklist

### Header
- [ ] Privat / Företag toggle switches mega menu
- [ ] Mobile drawer shows both segments
- [ ] Offert + Support links work
- [ ] No ActionKing URLs in navigation

### Pages (assign in Admin → Pages → Theme template)
| Page | Template |
|------|----------|
| Enterprise hub | `page.enterprise` |
| Consumer hub | `page.consumer` |

### Homepage
- [ ] User-type selector (Konsument / Enterprise cards)
- [ ] Featured collection renders (requires published products)

---

## Publish (after approval)

```bash
shopify theme publish --store ya1xhg-x6.myshopify.com --theme <THEME_ID>
```

---

## What is NOT included (Phase 2)

- `product.spare-part.json` — compatibility-first PDP
- Custom `index.json` hero beyond user-type-selector
- JSON-LD / DigitalSignal hooks
- English handle migration (separate `edp-launch-prep` flow)

---

## Do NOT use PR #58 patch approach

The `navigation-architecture-fix` branch patches the old ActionKing theme with a conflicting header architecture. This integration branch replaces the entire theme via `shopify theme push`.
