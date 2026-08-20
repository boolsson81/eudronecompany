# ENGLISH_URL_EXECUTION_PLAN

**Store:** EuroDroneParts (`ya1xhg-x6.myshopify.com`)
**Generated:** 2026-06-13T15:59:48.027Z
**Mode:** READ-ONLY AUDIT + EXECUTION ARTIFACTS — **no store modifications in this pass**

**Canonical language:** English
**Domains:** eurodroneparts.com · eurodroneparts.de · eurodroneparts.dk · eurodroneparts.se · future EU

---

## AUDIT FINDINGS (present before execution)

### Resource inventory

| Resource | Live | Handle changes | 301 redirects | Execute |
|---|---:|---:|---:|---|
| Collections | 204 | 58 | 58 | Phase 3 |
| Pages | 94 | 15 | 15 | Phase 4 |
| Blogs / articles | 1 / 68 | 69 | 69 | Phase 5 |
| Products | 9389 | 3601 recommended | 0 (blocked) | Phase 6 review only |
| Menus | 375 | 5 handle renames | N/A | Phases 1–2 |
| **Redirect rules** | — | — | **284** (142 + 142 `/en/`) | Phase 8 |

### Swedish handles detected

- **58** collections with Swedish/mixed handles
- **15** pages requiring handle migration
- **69** blog/article URLs requiring migration
- **3601** products with Swedish handles (recommendations only — **no execution**)
- **372** menus safe to remove after verification

### Critical navigation findings

1. Only `main-menu` is theme-linked; PR49 `*-deploy` menus hold correct IA but are orphans.
2. `main-menu` contains Swedish titles (Huvudmeny, Drönare, Reservdelar, Branschlösningar).
3. 27 collection URLs are referenced from active menus and must be updated after Phase 3.
4. All 9,389 products are **DRAFT** — ideal window for collection/page/blog migration before launch.

### Hard constraints (DO NOT during execution)

| Rule | Status |
|---|---|
| Delete products | BLOCKED |
| Delete collections with products | BLOCKED |
| Modify metafields | BLOCKED |
| Modify SEO metadata | BLOCKED |
| Publish products | BLOCKED |
| Change product assignments | BLOCKED |
| Change theme code | BLOCKED |
| Product handle changes | BLOCKED (Phase 6 review only) |

---

## PHASE 1 — Menu cleanup

Delete **372** menus after verification. See `MENU_CLEANUP_REPORT.md`.

**Keep only (final):** Main Menu · Enterprise Drones · Spare Parts · Service & Support · B2B Enterprise · Partnership · Footer Menu · Customer Account

**Delete categories:** empty menus · migration duplicates · deploy menus (post-merge) · test/retry menus · orphan duplicates (`actionkameror`, `dronare`, `enterprise-dr-nare`)

---

## PHASE 2 — Menu restructure

Replace Swedish menu titles with English. Update all internal URLs to match Phase 3–5 handle changes.

| current_handle | proposed_handle | current_title | proposed_title | action |
| --- | --- | --- | --- | --- |
| main-menu | main-menu | Huvudmeny | Main Menu | KEEP_RESTRUCTURE |
| footer | footer | Sidfotsmeny | Footer Menu | KEEP |
| customer-account-main-menu | customer-account-main-menu | Huvudmeny för kundkonto | Customer Account | KEEP |
| enterprise-dr-nare | enterprise-drones | Enterprise Drönare | Enterprise Drones | DELETE |
| enterprise-expansion-deploy | enterprise-drones | Enterprise Expansion | Enterprise Drones | MERGE_THEN_DELETE |
| spare-parts-deploy | spare-parts | Reservdelar | Spare Parts | MERGE_THEN_DELETE |
| service-support-deploy | service-support | Service & Support | Service & Support | MERGE_THEN_DELETE |
| b2b-enterprise-deploy | b2b-enterprise | Enterprise & B2B | B2B Enterprise | MERGE_THEN_DELETE |


---

## PHASE 3 — Collection handle migration

58 collections require English handles. Full mapping: `COLLECTION_HANDLE_MAPPING.csv`

| current_url | new_url | products_count | internal_references_impacted |
| --- | --- | --- | --- |
| /collections/amagisn-kameratillbehor-and-dronarutrustning | /collections/amagisn-camera-accessories-and-drone-equipment | 149 |  |
| /collections/bandverktyg | /collections/pliers | 2 |  |
| /collections/belysning-for-drones | /collections/lighting-for-drones | 28 |  |
| /collections/dji-air-3-antenner | /collections/dji-air-3-antennas | 131 | spare-parts-deploy → :[];Antenner |
| /collections/dji-air-3-armar | /collections/dji-air-3-arms | 267 | spare-parts-deploy → :[];Armar |
| /collections/dji-air-3-kablar | /collections/dji-air-3-cables | 713 | spare-parts-deploy → :[];Kablar |
| /collections/dji-air-3-kameror | /collections/dji-air-3-cameras | 1165 | spare-parts-deploy → :[];Kameror |
| /collections/dji-air-3-landningsstall | /collections/dji-air-3-landing-gear | 160 | spare-parts-deploy → :[];Landningsställ |
| /collections/dji-air-3-motorer | /collections/dji-air-3-motors | 245 | spare-parts-deploy → :[];Motorer |
| /collections/dji-air-3-sensorer | /collections/dji-air-3-sensors | 147 | spare-parts-deploy → :[];Sensorer |
| /collections/dji-air-3-skal | /collections/dji-air-3-shell | 345 | spare-parts-deploy → :[];Skal |
| /collections/dji-drones-fjarrkontroller | /collections/dji-drones-remote-controls | 7 |  |
| /collections/dji-enterprise-fjarrkontroller | /collections/dji-enterprise-remote-controls | 22 |  |
| /collections/dji-flycart-100-lastdronare | /collections/dji-flycart-100-cargo-drones | 2 | main-menu → FlyCart 100; main-menu → :[FlyCart 100 |
| /collections/dji-matrice-30-serie-accessories | /collections/dji-matrice-30-series-accessories | 9 |  |
| /collections/dji-matrice-350-rtk-antenner | /collections/dji-matrice-350-rtk-antennas | 17 | spare-parts-deploy → :[];Antenner |
| /collections/dji-matrice-4-kablar | /collections/dji-matrice-4-cables | 618 | spare-parts-deploy → :[];Kablar |
| /collections/dji-matrice-4-kameror | /collections/dji-matrice-4-cameras | 1075 | spare-parts-deploy → :[];Kameror |
| /collections/dji-matrice-4-serie | /collections/dji-matrice-4-series | 22 |  |
| /collections/dji-mavic-3-enterprise-kameror | /collections/dji-mavic-3-enterprise-cameras | 1057 | spare-parts-deploy → :[];Kameror |
| /collections/dji-mavic-3-enterprise-skal | /collections/dji-mavic-3-enterprise-shell | 230 | spare-parts-deploy → :[];Skal |
| /collections/dji-mini-4-pro-antenner | /collections/dji-mini-4-pro-antennas | 130 | spare-parts-deploy → :[];Antenner |
| /collections/dji-mini-4-pro-armar | /collections/dji-mini-4-pro-arms | 264 | spare-parts-deploy → :[];Armar |
| /collections/dji-mini-4-pro-kablar | /collections/dji-mini-4-pro-cables | 715 | spare-parts-deploy → :[];Kablar |
| /collections/dji-mini-4-pro-kameror | /collections/dji-mini-4-pro-cameras | 1165 | spare-parts-deploy → :[];Kameror |


_…and 33 more in COLLECTION_HANDLE_MAPPING.csv_


---

## PHASE 4 — Page handle migration

15 pages require English handles. Full mapping: `PAGE_HANDLE_MAPPING.csv`

| current_url | new_url | current_handle | proposed_handle |
| --- | --- | --- | --- |
| /pages/contact | /pages/contact-us | contact | contact-us |
| /pages/vara-varumarken | /pages/brands | vara-varumarken | brands |
| /pages/gopro-faste | /pages/gopro-mount | gopro-faste | gopro-mount |
| /pages/retur-reklamation | /pages/retur-claims | retur-reklamation | retur-claims |
| /pages/rekalamtioner-aterkop | /pages/claims-buyback | rekalamtioner-aterkop | claims-buyback |
| /pages/gimbal-and-stabilisering | /pages/gimbal-and-stabilization | gimbal-and-stabilisering | gimbal-and-stabilization |
| /pages/kopvillkor | /pages/terms-of-sale | kopvillkor | terms-of-sale |
| /pages/vilken-bilkamera-ar-bast | /pages/which-dash-cam-is-best | vilken-bilkamera-ar-bast | which-dash-cam-is-best |
| /pages/samarbeta-with-oss | /pages/partner-with-us | samarbeta-with-oss | partner-with-us |
| /pages/kablar | /pages/cables | kablar | cables |
| /pages/ljud | /pages/audio | ljud | audio |
| /pages/basta-myggskyddet | /pages/best-mosquito-repellent | basta-myggskyddet | best-mosquito-repellent |
| /pages/repair | /pages/repairs | repair | repairs |
| /pages/enterprise-account | /pages/business-account | enterprise-account | business-account |
| /pages/quote-request | /pages/request-a-quote | quote-request | request-a-quote |


**9** ActionKing legacy pages excluded.

---

## PHASE 5 — Blog handle migration

Blog `nyheter` → `news`. **69** article URL changes. Full mapping: `BLOG_HANDLE_MAPPING.csv`

| current_url | new_url | current_handle | proposed_handle |
| --- | --- | --- | --- |
| /blogs/nyheter | /blogs/news | nyheter | news |
| /blogs/nyheter/kop-dronare-med-kamera | /blogs/news/kop-drones-med-kamera | nyheter/kop-dronare-med-kamera | news/kop-drones-med-kamera |
| /blogs/nyheter/fpv-drone-kit | /blogs/news/fpv-drone-kit | nyheter/fpv-drone-kit | news/fpv-drone-kit |
| /blogs/nyheter/gopro-hero-11-black | /blogs/news/gopro-hero-11-black | nyheter/gopro-hero-11-black | news/gopro-hero-11-black |
| /blogs/nyheter/dji-mini-se | /blogs/news/dji-mini-se | nyheter/dji-mini-se | news/dji-mini-se |
| /blogs/nyheter/dji-flip-lilla-dronaren | /blogs/news/dji-flip-lilla-dronesn | nyheter/dji-flip-lilla-dronaren | news/dji-flip-lilla-dronesn |
| /blogs/nyheter/dronare-regler | /blogs/news/drones-regulations | nyheter/dronare-regler | news/drones-regulations |
| /blogs/nyheter/laddningsbara-batterier-aaa | /blogs/news/rechargeable-batteryer-aaa | nyheter/laddningsbara-batterier-aaa | news/rechargeable-batteryer-aaa |
| /blogs/nyheter/kamera-for-youtube | /blogs/news/kamera-for-youtube | nyheter/kamera-for-youtube | news/kamera-for-youtube |
| /blogs/nyheter/powerbank-usb-c | /blogs/news/powerbank-usb-c | nyheter/powerbank-usb-c | news/powerbank-usb-c |
| /blogs/nyheter/mikrofon-mygga-tradlos | /blogs/news/microphone-mygga-wireless | nyheter/mikrofon-mygga-tradlos | news/microphone-mygga-wireless |
| /blogs/nyheter/mikrofon-till-mobil | /blogs/news/microphone-till-mobil | nyheter/mikrofon-till-mobil | news/microphone-till-mobil |
| /blogs/nyheter/minneskort-micro-sd | /blogs/news/memory-cards-micro-sd | nyheter/minneskort-micro-sd | news/memory-cards-micro-sd |
| /blogs/nyheter/uppladdningsbara-batterier-laddare | /blogs/news/upprechargeable-batteryer-charger | nyheter/uppladdningsbara-batterier-laddare | news/upprechargeable-batteryer-charger |
| /blogs/nyheter/micro-usb-laddare | /blogs/news/micro-usb-charger | nyheter/micro-usb-laddare | news/micro-usb-charger |
| /blogs/nyheter/spela-in-ljud | /blogs/news/spela-in-audio | nyheter/spela-in-ljud | news/spela-in-audio |
| /blogs/nyheter/ficklampa | /blogs/news/flashlight | nyheter/ficklampa | news/flashlight |
| /blogs/nyheter/powerbank | /blogs/news/powerbank | nyheter/powerbank | news/powerbank |
| /blogs/nyheter/reservdelar-dronare | /blogs/news/spare-parts-drones | nyheter/reservdelar-dronare | news/spare-parts-drones |
| /blogs/nyheter/gimbal | /blogs/news/gimbal | nyheter/gimbal | news/gimbal |


_…and 49 more in BLOG_HANDLE_MAPPING.csv_


---

## PHASE 6 — Product URL review (NO EXECUTION)

**3601** products have Swedish/mixed handles. Recommendations in `PRODUCT_RECOMMENDATIONS.csv`.

**Blocked:** No product handle changes in this migration pass.

| current_url | proposed_url | recommendation |
| --- | --- | --- |
| /products/telesin-t10-fjarrkontroll-silikonskal-skyddande-fo | /products/telesin-t10-remote-control-silicone-case-protective-fo | RENAME_POST_LAUNCH |
| /products/insta360-ace-pro-2-case-silikon-neck-strap | /products/insta360-ace-pro-2-case-silicone-neck-strap | RENAME_POST_LAUNCH |
| /products/insta360-ace-pro-2-metallbur-skyddande-ram | /products/insta360-ace-pro-2-metal-cage-protective-ram | RENAME_POST_LAUNCH |
| /products/ministativ-tripod | /products/mini-tripod-tripod | RENAME_POST_LAUNCH |
| /products/pgytech-96cm-aluminium-selfiepinne-sportkamera | /products/pgytech-96cm-aluminium-selfie-stick-action-camera | RENAME_POST_LAUNCH |
| /products/dji-flip-rcstq-linsskydd-dual | /products/dji-flip-rcstq-lens-protector-dual | RENAME_POST_LAUNCH |
| /products/gopro-hero5-ramfaste | /products/gopro-hero5-rammount | RENAME_POST_LAUNCH |
| /products/dji-rc-n3-fjarrkontroll-for-drones | /products/dji-rc-n3-remote-control-for-drones | RENAME_POST_LAUNCH |
| /products/insta360-one-x2-helkroppsskydd-silikon | /products/insta360-one-x2-helkroppsprotection-silicone | RENAME_POST_LAUNCH |
| /products/jsr-dronarfilter-4-i-1-uv-cpl-nd-dji-mavic-mini | /products/jsr-dronefilter-4-i-1-uv-cpl-nd-dji-mavic-mini | RENAME_POST_LAUNCH |
| /products/gp244-b-actionkamera-faste-alu-nvg | /products/gp244-b-actionkamera-mount-alu-nvg | RENAME_POST_LAUNCH |
| /products/mjukt-tpu-skyddsfodral-insta360-ace-pro | /products/mjukt-tpu-protectionsfodral-insta360-ace-pro | RENAME_POST_LAUNCH |
| /products/insta360-go-2-laddbox-silikonskydd | /products/insta360-go-2-laddbox-siliconeprotection | RENAME_POST_LAUNCH |
| /products/insta360-go-2-skyddsram-with-stativadapter | /products/insta360-go-2-protectionsram-with-stativadapter | RENAME_POST_LAUNCH |
| /products/mini-barvaska-dji-osmo-pocket-forvaring | /products/mini-barbag-dji-osmo-pocket-storage | RENAME_POST_LAUNCH |


_…and 3586 more in PRODUCT_RECOMMENDATIONS.csv_


---

## PHASE 7 — Shopify Markets validation

| Domain | Role | URL rule |
|---|---|---|
| eurodroneparts.com | Primary / canonical | English handles |
| eurodroneparts.de | Market domain | Same handles, German content via Markets |
| eurodroneparts.dk | Market domain | Same handles, Danish content via Markets |
| eurodroneparts.se | Market domain | Same handles, Swedish content via Markets |

**GOOD:** `eurodroneparts.de/collections/spare-parts`
**BAD:** `eurodroneparts.de/collections/reservdelar`

### Markets checklist

1. Configure Shopify Markets per EU domain before launch.
2. Use Translate & Adapt for localized titles/body — **not** localized handles.
3. Set hreflang per market; canonical points to `.com` English path.
4. Per-market sitemaps after redirect deployment.
5. Verify no duplicate content across domains (same handle, translated content only).

---

## PHASE 8 — SEO protection

**284** redirect rules in `REDIRECT_MAPPING.csv`.

### Validation results

| Check | Result |
|---|---|
| Redirect rules | 142 |
| Unique from-paths | 142 |
| Redirect chains | 0 |
| Redirect loops | 0 |
| Duplicate from-paths | 0 |
| SEO validation | PASS |

### Orphan / broken link checks

| Check | Count |
|---|---:|
| Missing collections (menu audit) | 0 |
| Missing pages (menu audit) | 0 |
| Broken menu links | 0 |
| Collections with menu refs needing update | 47 |

---

## DELIVERABLES

| File | Description |
|---|---|
| `ENGLISH_URL_EXECUTION_PLAN.md` | This document |
| `COLLECTION_HANDLE_MAPPING.csv` | All 204 collections |
| `PAGE_HANDLE_MAPPING.csv` | All 94 pages |
| `BLOG_HANDLE_MAPPING.csv` | Blog + 68 articles |
| `PRODUCT_RECOMMENDATIONS.csv` | 9,389 products — review only |
| `MENU_CLEANUP_REPORT.md` | Menu audit + deletion plan |
| `REDIRECT_MAPPING.csv` | Complete 301 map |

## Recommended execution order

1. **Approve** this plan and rollback artifacts
2. **Phase 1** — Menu cleanup (364+ deletions)
3. **Phase 2** — Menu restructure + wire 8 production menus to theme
4. **Phase 3** — Collection handle renames (preserves product assignments via GID)
5. **Phase 4** — Page handle renames
6. **Phase 5** — Blog/article handle renames
7. **Deploy** redirects from `REDIRECT_MAPPING.csv`
8. **Phase 7** — Configure Shopify Markets per domain
9. **Phase 6** — Product handle review (post-launch, separate pass)

## Data sources

- `.url-audit-collections.json` — 204 live collections
- `.url-audit-live.json` — pages, blogs, products, menus
- `.menu-cleanup-audit.json` — 375 menu inventory + decisions
- `.url-audit-menu-recovery.json` — pruned legacy links
