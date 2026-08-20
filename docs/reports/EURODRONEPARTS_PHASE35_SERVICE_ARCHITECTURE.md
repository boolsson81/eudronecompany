# EuroDroneParts — Phase 3.5 Service Architecture

**Generated:** 2026-06-13T10:30:44.184Z
**Mode:** DRY RUN — no pages/collections deployed

## Validation

| Check | Result |
|-------|--------|
| Validation pass | **YES** |
| Shrinkage on existing collections | PASS |
| Menu structure complete | PASS (9 items) |

## Summary

| Metric | Value |
|--------|------:|
| Service architecture nodes | 66 |
| SEO landing pages | 12 |
| Pages to create | 73 |
| Hybrid nodes with catalog products | 12 |
| New collections recommended | 9 |
| B2B service offerings | 7 |

## Menu: Service & Reparationer

```
Service & Reparationer
├── Konsumentdrönare
├── Enterprisedrönare
├── FlyCart
├── Agras
├── DJI Dock
├── Kalibrering
├── Serviceavtal
├── Felsökning
└── Skadeanmälan
```

## Architecture by section

### hub

| Node | Type | Page | Collection | Projected | Action |
|---|---|---|---|---:|---|
| Service & Reparationer | page | `service-reparationer` | — | — | create_page |
| Skadeanmälan | page | `skadeanmalan` | — | — | create_page |

### consumer

| Node | Type | Page | Collection | Projected | Action |
|---|---|---|---|---:|---|
| DJI Konsument | page | `dji-konsument-service` | — | — | create_page |
| DJI Mini Service | page | `dji-mini-service` | — | — | create_page |
| DJI Air Service | page | `dji-air-service` | — | — | create_page |
| DJI Mavic Service | page | `dji-mavic-service` | — | — | create_page |
| DJI Avata Service | page | `dji-avata-service` | — | — | create_page |
| DJI Neo Service | hybrid | `dji-neo-service` | `reparation-dji-neo-reservdelar` | 229 | create_page_update_collection |
| DJI Flip Service | page | `dji-flip-service` | — | — | create_page |

### enterprise

| Node | Type | Page | Collection | Projected | Action |
|---|---|---|---|---:|---|
| DJI Enterprise | page | `dji-enterprise-service` | — | — | create_page |
| Matrice 4 Service | hybrid | `matrice-4-service` | `matrice-4-service` | 0 | create_page_only |
| Matrice 30 Service | hybrid | `matrice-30-service` | `matrice-30-service` | 0 | create_page_only |
| Matrice 350 Service | hybrid | `matrice-350-service` | `matrice-350-service` | 0 | create_page_only |
| Matrice 400 Service | hybrid | `matrice-400-service` | `matrice-400-service` | 0 | create_page_only |
| Mavic Enterprise Service | hybrid | `mavic-enterprise-service` | `enterprise-service-dronare` | 6 | create_page_update_collection |
| Agras Service | hybrid | `agras-service` | `agras-service` | 0 | create_page_only |
| FlyCart Service | hybrid | `flycart-service` | `flycart-service` | 0 | create_page_only |

### repairs

| Node | Type | Page | Collection | Projected | Action |
|---|---|---|---|---:|---|
| Reparationer | page | `reparationer` | — | — | create_page |
| Krockskador | page | `krockskador` | — | — | create_page |
| Drönare efter krasch | hybrid | `dronare-efter-krasch` | `dronare-efter-krasch` | 439 | create_page_and_collection |
| Armbyte | hybrid | `armbyte` | `armbyte` | 57 | create_page_and_collection |
| Motorbyte | hybrid | `motorbyte` | `reservdelar-gimbal-dronare-motorer` | 171 | create_page_update_collection |
| Gimbalreparation | page | `gimbalreparation` | — | — | create_page |
| Kamerabyte | hybrid | `kamerabyte` | `kamerabyte` | 57 | create_page_and_collection |
| Elektronik | page | `elektronik-reparation` | — | — | create_page |
| Kretskort | page | `kretskort-service` | — | — | create_page |
| ESC | hybrid | `esc-service` | `esc-service` | 33 | create_page_and_collection |
| GPS | hybrid | `gps-service` | `gps-service` | 27 | create_page_and_collection |
| Kompass | hybrid | `kompass-service` | `kompass-service` | 14 | create_page_and_collection |
| Sensorer | hybrid | `sensorer-service` | `sensorer-service` | 28 | create_page_and_collection |
| Gimbal & Kamera | page | `gimbal-kamera-service` | — | — | create_page |
| Gimbalkalibrering | page | `gimbalkalibrering` | — | — | create_page |
| Fokusproblem | page | `fokusproblem` | — | — | create_page |
| Bildproblem | page | `bildproblem` | — | — | create_page |
| Batteriservice | page | `batteriservice` | — | — | create_page |
| Batteritest | page | `batteritest` | — | — | create_page |
| Batteribyte | page | `batteribyte` | — | — | create_page |
| Batterikontroll | page | `batterikontroll` | — | — | create_page |

### b2b

| Node | Type | Page | Collection | Projected | Action |
|---|---|---|---|---:|---|
| Företagstjänster | page | `foretagstjanster` | — | — | create_page |
| Enterprise Support | page | `enterprise-support` | — | — | create_page |
| Felsökning | page | `felsokning` | — | — | create_page |
| Underhållsavtal | page | `underhallsavtal` | — | — | create_page |
| Serviceavtal | page | `serviceavtal` | — | — | create_page |
| Supportavtal | page | `supportavtal` | — | — | create_page |
| FlyCart Inspektion | page | `flycart-inspektion` | — | — | create_page |
| FlyCart Underhåll | page | `flycart-underhall` | — | — | create_page |
| Sprutsystem | hybrid | `agras-sprutsystem` | `agras-sprutsystem` | 4 | create_page_and_collection |
| Pumpar | hybrid | `agras-pumpar` | `agras-pumpar` | 0 | create_page_only |
| Munstycken | hybrid | `agras-munstycken` | `agras-munstycken` | 0 | create_page_only |

### dock

| Node | Type | Page | Collection | Projected | Action |
|---|---|---|---|---:|---|
| DJI Dock | page | `dji-dock` | — | — | create_page |
| DJI Dock Installation | page | `dji-dock-installation` | — | — | create_page |
| DJI Dock Service | hybrid | `dji-dock-service` | `dji-dock-service` | 8 | create_page_and_collection |
| DJI Dock Support | page | `dji-dock-support` | — | — | create_page |
| DJI Dock Underhåll | page | `dji-dock-underhall` | — | — | create_page |

### calibration

| Node | Type | Page | Collection | Projected | Action |
|---|---|---|---|---:|---|
| Kalibrering | page | `kalibrering` | — | — | create_page |
| IMU | page | `imu-kalibrering` | — | — | create_page |
| Kompass | page | `kompass-kalibrering` | — | — | create_page |
| RTK | page | `rtk-kalibrering` | — | — | create_page |
| Gimbal | page | `gimbal-kalibrering` | — | — | create_page |
| Kamera | page | `kamera-kalibrering` | — | — | create_page |
| Flygsystem | page | `flygsystem-kalibrering` | — | — | create_page |

### inspection

| Node | Type | Page | Collection | Projected | Action |
|---|---|---|---|---:|---|
| Besiktning & Certifiering | page | `besiktning-certifiering` | — | — | create_page |
| Leveranskontroll | page | `leveranskontroll` | — | — | create_page |
| Årlig genomgång | page | `arlig-genomgang` | — | — | create_page |
| Flygsäkerhetskontroll | page | `flygsakerhetskontroll` | — | — | create_page |
| Dokumentation | page | `service-dokumentation` | — | — | create_page |

## SEO landing pages (traffic targets)

| Handle | Title | Markets | Status |
|---|---|---|---|
| `dji-reparation` | DJI reparation | SE, DE, NL, FR | create |
| `dji-dronarservice` | DJI drönarservice | SE | create |
| `dji-enterprise-service` | DJI Enterprise service | SE, EU | create |
| `matrice-350-reparation` | Matrice 350 reparation | SE | create |
| `matrice-4-service` | Matrice 4 service | SE, EU | create |
| `flycart-service` | FlyCart service | SE, EU | create |
| `agras-service` | Agras service | SE | create |
| `dji-dock-service` | DJI Dock service | SE, EU | create |
| `dronarreparation-sverige` | Drönarreparation Sverige | SE | create |
| `dji-reservdelar-och-service` | DJI reservdelar och service | SE | create |
| `dji-batteriservice` | DJI batteriservice | SE | create |
| `gimbalreparation-dji` | Gimbalreparation DJI | SE | create |

## B2B-tjänster

| Service | Handle | Audience |
|---|---|---|
| Serviceavtal | `serviceavtal` | kommuner, energibolag, skogsbolag, entreprenörer |
| Underhållsavtal | `underhallsavtal` | enterprise fleet operators |
| Årlig kontroll | `arlig-kontroll` | regulated operators |
| Prioriterad support | `prioriterad-support` | enterprise SLA customers |
| Reservdelslager | `reservdelslager` | fleet operators |
| Fjärrsupport | `fjarrsupport` | remote operations |
| Utbytesenheter | `utbytesenheter` | mission-critical operators |

## Deployment checklist

1. [ ] Create Shopify pages (all `create_page` / `create_page_only` nodes)
2. [ ] Create `service-reparationer` menu in Shopify Admin
3. [ ] Link menu items per `data/edp-service-navigation.json`
4. [ ] Apply SEO metadata to pages (no handle changes)
5. [ ] Create hybrid collections where `projected_count > 0`
6. [ ] Apply smart rules from `data/edp-service-collection-rules.json`
7. [ ] Add internal links between service pages and product collections
8. [ ] Do NOT modify products

---

Artifacts: `data/edp-phase35-service-architecture.json`, `data/edp-service-navigation.json`,
`data/edp-service-seo-pages.json`, `data/edp-service-b2b-framework.json`, `.phase35-service-audit.json`
