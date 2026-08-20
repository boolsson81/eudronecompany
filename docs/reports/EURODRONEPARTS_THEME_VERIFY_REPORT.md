# EuroDroneParts — Theme Deploy Verification

**Generated:** 2026-06-14T19:19:47.830Z
**Store:** ya1xhg-x6.myshopify.com

## Themes on store

| Theme | Role | Updated |
|-------|------|---------|
| EDP Dawn v1 — 2026-06-14 19:18 (`186020200776`) | MAIN ← **LIVE** | 2026-06-14T19:19:44Z |
| EDP Dawn v1 — 2026-06-14 16:05 (`186333856072`) | UNPUBLISHED ← **PREVIEW** | 2026-06-14T17:26:02Z |

## Critical files — preview theme

| File | Local | Remote | Status |
|------|------:|-------:|--------|
| `layout/theme.liquid` | 22433 | 22433 | ✅ |
| `sections/header-group.json` | 1708 | 1161 | ⚠️ size diff |
| `snippets/edp-dawn-compat.liquid` | 1200 | 1200 | ✅ |
| `sections/header.liquid` | 26322 | 26322 | ✅ |
| `sections/edp-utility-bar.liquid` | 5586 | 5586 | ✅ |
| `sections/footer-group.json` | 1415 | 749 | ⚠️ size diff |
| `sections/footer.liquid` | 23317 | 23317 | ✅ |
| `assets/component-list-payment.css` | 509 | 509 | ✅ |
| `assets/section-footer.css` | 13208 | 13208 | ✅ |
| `templates/index.json` | 2775 | 2775 | ✅ |
| `templates/page.enterprise.json` | 9018 | 9018 | ✅ |
| `templates/page.consumer.json` | 4806 | 4806 | ✅ |
| `sections/user-type-selector.liquid` | 20400 | 20400 | ✅ |
| `sections/enterprise-hero.liquid` | 5671 | 5671 | ✅ |
| `sections/consumer-landing.liquid` | 24597 | 24597 | ✅ |
| `snippets/edp-mega-menu.liquid` | 6325 | 6325 | ✅ |
| `snippets/edp-header-drawer.liquid` | 8278 | 8278 | ✅ |
| `assets/edp-header.css` | 7800 | 7800 | ✅ |
| `assets/edp-header.js` | 5329 | 5329 | ✅ |

## Header wiring (remote preview)

- menu_consumer_handle: `main-menu`
- menu_enterprise_handle: `enterprise`
- menu_type_desktop: `mega`
- quote_link: `/pages/service-request`
- support_link: `/pages/service-support`

## Homepage template (remote preview)

- Section order: user_type_selector → featured_collection
- Section types: user-type-selector, featured-collection

✅ `user-type-selector` present on homepage

## Preview vs LIVE (main theme)

| Setting | LIVE | PREVIEW |
|---------|------|---------|
| menu_consumer_handle | `main-menu` | `main-menu` |
| menu_enterprise_handle | `enterprise` | `enterprise` |
| menu_type_desktop | `mega` | `mega` |

✅ Preview header wired to production menus

- LIVE homepage sections: user-type-selector…
- PREVIEW homepage sections: user-type-selector, featured-collection
- ✅ Preview has new homepage; LIVE still has Dawn default

## Menu existence check

✅ `main-menu`
✅ `enterprise`
✅ `footer`

## Summary

| Check | Result |
|-------|--------|
| Preview theme exists (unpublished) | ✅ |
| LIVE theme unchanged | ✅ |
| Critical files (19/19) | ✅ |
| Header menu wiring | ✅ |
| Homepage user-type-selector | ✅ |
| Production menus exist | ✅ |

**Overall: PASS**

**Preview:** https://ya1xhg-x6.myshopify.com?preview_theme_id=186020200776
