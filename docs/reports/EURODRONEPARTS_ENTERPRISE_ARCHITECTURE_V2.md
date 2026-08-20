# EuroDroneParts — Enterprise Architecture V2

**Generated:** 2026-06-13T10:25:19.965Z
**Mode:** DRY RUN — validation only, no deployment

## Validation gate

| Check | Result |
|-------|--------|
| Validation pass (100%) | **YES — ready for deployment review** |
| Existing collections go empty | PASS |
| Shopify rule compatibility | PASS |
| Menu links resolve | PASS |
| Unexpected shrinkage on existing | PASS |

## Summary

| Metric | Value |
|--------|------:|
| Architecture nodes | 96 |
| Mapped to existing collections | 33 |
| New collections to create (with products) | 41 |
| SEO page only (no products) | 0 |
| Catalog scanned | 9389 |

## Deployment checklist

1. [ ] Review projected counts for all nodes
2. [ ] Create new collections (see create_required list)
3. [ ] Apply smart rules to existing collections (rules-only update)
4. [ ] Deploy navigation structure to main-menu + enterprise-dr-nare
5. [ ] Apply SEO metadata (titles/descriptions only — no handle changes)
6. [ ] Create SEO landing pages for seo_page_only nodes
7. [ ] Run post-deployment validation script
8. [ ] Future: apply product tag standards (separate pass)

## Projected counts by section

### enterprise_dji

| Node | Handle | Action | Projected | Current live |
|---|---|---|---:|---:|
| Matrice 4 Series | `dji-matrice-4-serie` | populate_existing | **22** | 22 |
| Zenmuse P1 | `zenmuse-p1` | create_collection | **20** | — |
| Enterprise Drones Hub | `enterprise-dronare` | populate_existing | **18** | 19 |
| Matrice 4 Accessories | `dji-matrice-4-tillbehor` | populate_existing | **15** | 15 |
| Mavic Enterprise Series | `dji-mavic-serien-enterprise` | populate_existing | **11** | 11 |
| Matrice 30 | `dji-matrice-30-serie-tillbehor` | populate_existing | **9** | 9 |
| Matrice 400 | `dji-matrice-400-serien` | populate_existing | **9** | 9 |
| Matrice 350 RTK | `dji-matrice-350-rtk-tillbehor` | populate_existing | **8** | 8 |
| Mavic 3 Thermal | `mavic-3-thermal` | create_collection | **8** | — |
| Matrice 4T | `matrice-4t` | create_collection | **6** | — |
| Matrice 400 Accessories | `matrice-400-accessories` | create_collection | **5** | — |
| Mavic 3 Enterprise | `dji-mavic-3-enterprise` | populate_existing | **5** | 5 |
| Mavic Enterprise Accessories | `dji-mavic-3m-dronare-tillbehor` | populate_existing | **5** | 5 |
| Agras Series | `dji-agras-dronare` | populate_existing | **4** | 4 |
| DJI Dock 2 | `dji-dock-2` | create_collection | **3** | — |
| Agras T50 | `agras-t50` | create_collection | **3** | — |
| Matrice 30T | `matrice-30t` | create_collection | **2** | — |
| Matrice 3 Series | `matrice-3-series` | create_collection | **2** | — |
| Matrice 3D | `matrice-3d` | create_collection | **2** | — |
| Matrice 3 Accessories | `matrice-3-accessories` | create_collection | **2** | — |
| Matrice 4E | `matrice-4e` | create_collection | **1** | — |
| Matrice 4 Spare Parts | `matrice-4-spare-parts` | create_collection | **1** | — |
| Matrice 300 RTK | `matrice-300-rtk` | create_collection | **1** | — |
| Matrice 3TD | `matrice-3td` | create_collection | **1** | — |
| Agras Accessories | `agras-accessories` | create_collection | **1** | — |
| Matrice 30 Accessories | `matrice-30-accessories` | defer | **0** | — |
| Matrice 30 Spare Parts | `matrice-30-spare-parts` | defer | **0** | — |
| Matrice 300 Batteries | `matrice-300-batteries` | defer | **0** | — |
| Matrice 300 Propellers | `matrice-300-propellers` | defer | **0** | — |
| Matrice 300 Spare Parts | `matrice-300-spare-parts` | defer | **0** | — |
| Zenmuse H20 | `zenmuse-h20` | defer | **0** | — |
| Zenmuse H20T | `zenmuse-h20t` | defer | **0** | — |
| Zenmuse L1 | `zenmuse-l1` | defer | **0** | — |
| Matrice 350 Batteries | `matrice-350-batteries` | defer | **0** | — |
| Matrice 350 Propellers | `matrice-350-propellers` | defer | **0** | — |
| Matrice 350 Spare Parts | `matrice-350-spare-parts` | defer | **0** | — |
| Matrice 400 Spare Parts | `matrice-400-spare-parts` | defer | **0** | — |
| Matrice 3 Spare Parts | `matrice-3-spare-parts` | defer | **0** | — |
| Agras T25 | `agras-t25` | defer | **0** | — |

### flycart

| Node | Handle | Action | Projected | Current live |
|---|---|---|---:|---:|
| FlyCart Payload Systems | `flycart-payload-systems` | create_collection | **3** | — |
| FlyCart Series | `dji-flycart-serien` | populate_existing | **2** | 2 |
| FlyCart 30 | `flycart-30` | create_collection | **2** | — |
| FlyCart 100 | `dji-flycart-100-lastdronare` | populate_existing | **2** | 2 |
| FlyCart Batteries | `flycart-batteries` | create_collection | **1** | — |
| FlyCart Spare Parts | `flycart-spare-parts` | defer | **0** | — |

### sensors_payloads

| Node | Handle | Action | Projected | Current live |
|---|---|---|---:|---:|
| Thermal Cameras | `dronare-med-varmekamera` | populate_existing | **29** | 30 |
| Thermal Systems (SAR) | `thermal-systems-sar` | create_collection | **26** | — |
| Airdrop Systems | `airdrop-system` | populate_existing | **24** | 24 |
| Speakers | `enterprise-hogtalarsystem` | populate_existing | **23** | 23 |
| Searchlights | `enterprise-belysning` | populate_existing | **13** | 13 |
| Zenmuse L2 | `zenmuse-l2` | create_collection | **11** | — |
| Flight Safety Systems | `flight-safety-systems` | create_collection | **11** | — |
| Winch Systems | `enterprise-lyftsystem` | populate_existing | **5** | 5 |
| LiDAR & Mapping | `lidar-mapping` | create_collection | **4** | — |
| LiDAR Sensors | `lidar-sensors` | create_collection | **4** | — |
| Parachute Systems | `parachute-systems` | create_collection | **2** | — |
| Livox | `livox-lidar` | create_collection | **1** | — |
| Zenmuse H30T | `zenmuse-h30t` | create_collection | **1** | — |
| Zenmuse L1 | `zenmuse-l1-payload` | defer | **0** | — |
| Zenmuse H20T | `zenmuse-h20t-payload` | defer | **0** | — |
| Survey Payloads | `survey-payloads` | defer | **0** | — |
| Zenmuse P1 | `zenmuse-p1-payload` | defer | **0** | — |
| Mapping Cameras | `mapping-cameras` | defer | **0** | — |

### industry

| Node | Handle | Action | Projected | Current live |
|---|---|---|---:|---:|
| Surveying & Mapping | `surveying-mapping-drones` | create_collection | **69** | — |
| Public Safety & Rescue | `public-safety-drones` | create_collection | **38** | — |
| Inspection | `inspection-drones` | create_collection | **25** | — |
| Forestry | `forestry-drones` | create_collection | **12** | — |
| Energy & Infrastructure | `energy-infrastructure-drones` | create_collection | **9** | — |
| Agriculture | `agriculture-drones` | create_collection | **4** | — |
| Transport & Logistics | `transport-logistics-drones` | create_collection | **3** | — |

### spare_parts

| Node | Handle | Action | Projected | Current live |
|---|---|---|---:|---:|
| Mini Spare Parts | `dji-mini-3-tillbehor` | populate_existing | **1122** | 43 |
| Mavic Spare Parts | `dji-mavic-3-tillbehor` | populate_existing | **759** | 66 |
| Neo Spare Parts | `reparation-dji-neo-reservdelar` | populate_existing | **595** | 4 |
| Avata Spare Parts | `dji-avata-2-tillbehor` | populate_existing | **525** | 51 |
| Air Spare Parts | `dji-air-3-tillbehor-omfattande-sortiment` | populate_existing | **518** | 66 |
| Flip Spare Parts | `dji-flip-tillbehor` | populate_existing | **495** | 63 |
| Enterprise Spare Parts | `reservdelar-dji-enterprise` | create_collection | **490** | — |
| Propellers | `dronare-propeller-tillbehor` | keep_current | **366** | 366 |
| Gimbals | `reservdelar-gimbal-dronare-motorer` | populate_existing | **233** | 171 |
| Electronics | `dronarelektronik-flight-components` | keep_current | **175** | 175 |
| Motors | `drone-motors-spare-parts` | create_collection | **154** | — |
| Batteries (component) | `drone-batteries-spare-parts` | create_collection | **12** | — |
| Matrice Spare Parts | `matrice-spare-parts-hub` | create_collection | **2** | — |
| FlyCart Spare Parts | `flycart-spare-parts-hub` | defer | **0** | — |
| Agras Spare Parts | `agras-spare-parts` | defer | **0** | — |

### accessories

| Node | Handle | Action | Projected | Current live |
|---|---|---|---:|---:|
| Filters | `filter-till-dronare` | populate_existing | **1034** | 252 |
| Cases & Bags | `dronarryggsack-vaskor` | populate_existing | **1005** | 203 |
| Consumer Accessories | `dronartillbehor-kop` | populate_existing | **944** | 615 |
| Batteries | `batterier` | populate_existing | **399** | 64 |
| Chargers | `batterier` | populate_existing | **190** | 64 |
| DJI Batteries | `dji-batteries` | create_collection | **60** | — |
| Enterprise Accessories | `enterprise-tillbehor` | populate_existing | **31** | 32 |
| Remote Controllers | `dji-enterprise-fjarrkontroller` | populate_existing | **22** | 22 |
| Charging Hubs | `charging-hubs` | create_collection | **20** | — |
| Enterprise Batteries | `enterprise-batteries` | create_collection | **1** | — |
| FlyCart Batteries | `flycart-batteries-acc` | create_collection | **1** | — |

---

Artifacts:
- `data/edp-enterprise-architecture-v2.json`
- `data/edp-smart-collection-rules.json`
- `data/edp-navigation-structure.json`
- `data/edp-collection-menu-mapping.json`
- `data/edp-product-tag-standards.json`
- `data/edp-industry-seo-framework.json`
- `EURODRONEPARTS_SITEMAP_V2.json`
- `.enterprise-architecture-v2-audit.json`
