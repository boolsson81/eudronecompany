# English Execution Approval Pack

**Store:** EuroDroneParts (`ya1xhg-x6.myshopify.com`)
**Generated:** 2026-06-13T17:53:49.091Z
**Status:** APPROVED ARCHITECTURE — **PRE-EXECUTION REVIEW** (no live changes yet)

## Architecture decision (approved)

- **English** is canonical for all handles: collections, pages, blogs, menus, metaobjects
- **No Swedish handles** preserved
- **Shopify Markets translations** for menu labels, collection titles, page titles, product content
- **Markets:** `.com` (default), `.de`, `.dk`, `.fr`, `.nl`, `.es`, `.it`

### Taxonomy pillars (8)

- Drones
- Enterprise
- Spare Parts
- Accessories
- Payloads & Sensors
- Brands
- Support
- Business

### Execution scope

| Resource | Changes | 301 redirects |
|---|---:|---:|
| Collections | 67 | 134 |
| Pages | 15 | 50 |
| Blog/articles | 69 | 138 |
| Menu handles | 4 | — |
| **Total redirect rules** | — | **322** |

Redirect validation: **PASS** (loops=0, duplicate_from=0)

---

## 1. Final collection hierarchy

**195** canonical collections. Full tree: `FINAL_COLLECTION_HIERARCHY.md`

- **Drones:** 30 collections
- **Enterprise:** 35 collections
- **Spare Parts:** 54 collections
- **Accessories:** 61 collections
- **Payloads & Sensors:** 6 collections
- **Brands:** 9 collections
- **Support:** 0 collections
- **Business:** 0 collections

---

## 2. Final menu hierarchy

Full tree: `FINAL_MENU_HIERARCHY.md`

| Menu | Handle | Pillars |
|---|---|---|
| Main Menu | `main-menu` | Drones · Accessories · Brands |
| Enterprise | `enterprise` | Enterprise · Payloads & Sensors |
| Spare Parts | `spare-parts` | Spare Parts |
| Support | `service-support` | Support |
| Business | `business` | Business |

---

## 3. Merge mapping

**8** collection merges. Full map: `MERGE_MAPPING.csv`

| Merge from | Into | Canonical URL | Products |
|---|---|---|---:|
| `dij-air-3-series` | `dji-air-3-series` | /collections/dji-air-3-series | 3 |
| `dji` | `dji-drones` | /collections/dji-drones | 84 |
| `dji-matrice-350-rtk-rtk` | `dji-matrice-350-rtk` | /collections/dji-matrice-350-rtk | 28 |
| `drone-accessories-buy` | `drone-accessories` | /collections/drone-accessories | 615 |
| `drone-accessories-drone` | `drone-accessories` | /collections/drone-accessories | 374 |
| `filter-drones-lins` | `drone-filters` | /collections/drone-filters | 261 |
| `filters-for-drones` | `drone-filters` | /collections/drone-filters | 252 |
| `repair-dji-neo-spare-parts` | `dji-neo-spare-parts` | /collections/dji-neo-spare-parts | 4 |

---

## 4. Redirect mapping

**322** rules (includes legacy `/en` prefix variants). Full map: `REDIRECT_MAPPING.csv`

### Sample redirects

| From | To | Type |
|---|---|---|
| `/collections/amagisn-kameratillbehor-and-dronarutrustning` | `/collections/amagisn-camera-accessories-and-drone-equipment` | collection |
| `/collections/bandverktyg` | `/collections/precision-tools` | collection |
| `/collections/belysning-for-drones` | `/collections/drone-lighting` | collection |
| `/collections/dij-air-3-series` | `/collections/dji-air-3-series` | collection |
| `/collections/dji` | `/collections/dji-drones` | collection |
| `/collections/dji-air-3-antenner` | `/collections/dji-air-3-antennas` | collection |
| `/collections/dji-air-3-armar` | `/collections/dji-air-3-arms` | collection |
| `/collections/dji-air-3-kablar` | `/collections/dji-air-3-cables` | collection |
| `/collections/dji-air-3-kameror` | `/collections/dji-air-3-cameras` | collection |
| `/collections/dji-air-3-landningsstall` | `/collections/dji-air-3-landing-gear` | collection |
| `/collections/dji-air-3-motorer` | `/collections/dji-air-3-motors` | collection |
| `/collections/dji-air-3-sensorer` | `/collections/dji-air-3-sensors` | collection |
| `/collections/dji-air-3-skal` | `/collections/dji-air-3-shell` | collection |
| `/collections/dji-drones-fjarrkontroller` | `/collections/dji-drones-remote-controls` | collection |
| `/collections/dji-enterprise-fjarrkontroller` | `/collections/dji-enterprise-remote-controls` | collection |
| `/collections/dji-flycart-100-lastdronare` | `/collections/dji-flycart-100-cargo-drones` | collection |
| `/collections/dji-matrice-30-serie-accessories` | `/collections/dji-matrice-30-series-accessories` | collection |
| `/collections/dji-matrice-350-rtk-antenner` | `/collections/dji-matrice-350-rtk-antennas` | collection |
| `/collections/dji-matrice-350-rtk-rtk` | `/collections/dji-matrice-350-rtk` | collection |
| `/collections/dji-matrice-4-kablar` | `/collections/dji-matrice-4-cables` | collection |


_…and 302 more in REDIRECT_MAPPING.csv_


---

## 5. Metaobject & menu handles

Full map: `METAOBJECT_HANDLE_MAPPING.csv`

- Menu handles: `*-deploy` → English canonical (`enterprise`, `spare-parts`, `service-support`, `business`)
- Metaobject definitions: `dji_drone_model` → `dji-drone-model` (planned; live audit at execution)

---

## 6. Shopify Markets translation scope

| Content type | Handle language | Display language |
|---|---|---|
| Collection handles | English (all markets) | Translated per market |
| Page handles | English (all markets) | Translated per market |
| Blog handles | English (all markets) | Translated per market |
| Menu labels | English in admin | Translated per market |
| Product content | English canonical | Translated per market |

---

## 7. User-approved taxonomy additions

### Spare Parts (5 model groups)

- **DJI Air 3S** → `dji-air-3s-spare-parts` (+ 12 component collections)
- **DJI Neo** → `dji-neo-spare-parts` (+ 12 component collections)
- **DJI Flip** → `dji-flip-spare-parts` (+ 12 component collections)
- **DJI Avata 2** → `dji-avata-2-spare-parts` (+ 12 component collections)
- **DJI Matrice 30 Series** → `dji-matrice-30-spare-parts` (+ 12 component collections)

**Planned creates:** 66 collections/pages in `PLANNED_COLLECTION_CREATES.csv`

### Enterprise Software (approved)

- Page: `enterprise-software` → /pages/enterprise-software

### Neo merge

- `repair-dji-neo-spare-parts` → `dji-neo-spare-parts` (merge + redirect)

---

## 8. Pre-execution sign-off

Confirm before live execution:

- [ ] Collection hierarchy (`FINAL_COLLECTION_HIERARCHY.md`)
- [ ] Menu hierarchy (`FINAL_MENU_HIERARCHY.md`)
- [ ] Merge mapping (`MERGE_MAPPING.csv`)
- [ ] Redirect mapping (`REDIRECT_MAPPING.csv`)
- [ ] Metaobject/menu handles (`METAOBJECT_HANDLE_MAPPING.csv`)

**No live changes until this checklist is signed off.**
