# EuroDroneParts — Phase 2 Enterprise Product Architecture

**Generated:** 2026-06-13T09:47:00.857Z
**Status:** Architecture & rule definitions only — **no live changes applied**
**Constraints:** No new collection groups | No product modifications | No URL changes | No deletions

## Overview

Phase 2 extends the existing 150-collection architecture with:

1. Smart collection rule definitions (Enterprise DJI, FlyCart, Sensors & Payloads, Industry)
2. Industry SEO landing page framework (7 verticals incl. Public Safety)
3. Product tag standards (7 dimensions)
4. Complete navigation structure (Main, Enterprise, Footer)
5. Collection-to-menu mapping

Machine-readable sources:

| File | Purpose |
|---|---|
| `data/edp-smart-collection-rules.json` | Smart collection rule specs |
| `data/edp-product-tag-standards.json` | Tag taxonomy |
| `data/edp-industry-seo-framework.json` | Industry landing page SEO |
| `data/edp-navigation-structure.json` | Menu trees |
| `data/edp-collection-menu-mapping.json` | Collection → menu lookup |

---

## 1. Enterprise DJI — Smart Collection Rules

| Handle | Hub | Proposed rules | Notes |
|---|:---:|---|---|
| `enterprise-dronare` | ✓ | `TYPE` EQUALS `Enterprise Drönare` **OR** `TYPE` EQUALS `Drönare för företag` **OR** `TAG` EQUALS `family:enterprise` — _OR (any match)_ | Hub — broadest enterprise drone catch-all |
| `dji-matrice-serien` | ✓ | `TAG` EQUALS `family:matrice` **OR** `TAG` EQUALS `DJI Matrice` **OR** `TITLE` CONTAINS `Matrice` — _OR (any match)_ |  |
| `dji-matrice-3-serien` |  | `TAG` EQUALS `model:matrice-4` **OR** `TAG` EQUALS `DJI Matrice 4` — _OR (any match)_ |  |
| `dji-matrice-4-serie` |  | `TAG` EQUALS `model:matrice-4` **AND** `TYPE` EQUALS `Enterprise Drönare` — _AND (all match)_ |  |
| `dji-matrice-400-serien` |  | `TAG` EQUALS `model:matrice-400` **AND** `TYPE` EQUALS `Enterprise Drönare` — _AND (all match)_ |  |
| `dji-matrice-350-rtk-tillbehor` |  | `TAG` EQUALS `compat:matrice-350-rtk` **OR** `TAG` EQUALS `DJI Matrice 350` **OR** `TITLE` CONTAINS `Matrice 350` — _OR (any match)_ |  |
| `dji-matrice-30-serie-tillbehor` |  | `TAG` EQUALS `compat:matrice-30` **OR** `TAG` EQUALS `DJI Matrice 30` **OR** `TITLE` CONTAINS `Matrice 30` — _OR (any match)_ |  |
| `dji-matrice-4-tillbehor` |  | `TAG` EQUALS `compat:matrice-4` **AND** `TYPE` EQUALS `Enterprise Tillbehör` — _AND (all match)_ |  |
| `dji-mavic-3-enterprise` |  | `TAG` EQUALS `model:mavic-3-enterprise` **AND** `TYPE` EQUALS `Enterprise Drönare` — _AND (all match)_ |  |
| `dji-mavic-serien-enterprise` |  | `TAG` EQUALS `family:mavic-enterprise` **OR** `TAG` EQUALS `DJI Mavic 3 Enterprise` **OR** `TAG` EQUALS `DJI Mavic 3M` — _OR (any match)_ |  |
| `dji-mavic-3m-dronare-tillbehor` |  | `TAG` EQUALS `model:mavic-3m` **OR** `TAG` EQUALS `DJI Mavic 3M` **OR** `TAG` EQUALS `compat:mavic-3m` — _OR (any match)_ |  |
| `dji-agras-dronare` |  | `TAG` EQUALS `family:agras` **AND** `TYPE` EQUALS `Enterprise Drönare` — _AND (all match)_ |  |
| `dji-marvic-enterprise` |  | `TAG` EQUALS `family:marvic` **OR** `TITLE` CONTAINS `Marvic` — _OR (any match)_ | Audit negative product count — fix rules before apply |
| `enterprise-tillbehor` | ✓ | `TYPE` EQUALS `Enterprise Tillbehör` **AND** `TAG` EQUALS `family:enterprise` — _AND (all match)_ |  |
| `enterprise-dronartillbehor` |  | `TYPE` EQUALS `Enterprise Tillbehör` **AND** `TAG` EQUALS `drönartillbehör` — _AND (all match)_ |  |
| `enterprise-propellrar` |  | `TYPE` EQUALS `Propellrar` **AND** `TAG` EQUALS `family:enterprise` — _AND (all match)_ |  |
| `dji-enterprise-fjarrkontroller` |  | `TAG` EQUALS `RC Plus` **OR** `TAG` EQUALS `Enterprise Controller` **OR** `TITLE` CONTAINS `Enterprise` — _OR (any match)_ |  |
| `enterprise-belysning` |  | `TAG` EQUALS `payload:spotlight` **AND** `TYPE` EQUALS `Enterprise Tillbehör` — _AND (all match)_ |  |
| `enterprise-hogtalarsystem` |  | `TAG` EQUALS `payload:speaker` **AND** `TYPE` EQUALS `Enterprise Tillbehör` — _AND (all match)_ |  |
| `enterprise-lyftsystem` |  | `TAG` EQUALS `payload:airdrop` **OR** `TITLE` CONTAINS `lyft` **OR** `TITLE` CONTAINS `winch` — _OR (any match)_ |  |
| `enterprise-service-dronare` |  | `TAG` EQUALS `enterprise-service` **OR** `TITLE` CONTAINS `service` **OR** `PRODUCT_TYPE` EQUALS `Service` — _OR (any match)_ | May remain manual until service SKUs are tagged |

---

## 2. FlyCart — Smart Collection Rules

| Handle | Hub | Proposed rules |
|---|:---:|---|
| `dji-flycart-serien` | ✓ | `TAG` EQUALS `family:flycart` **AND** `TYPE` EQUALS `Enterprise Drönare` — _AND (all match)_ |
| `dji-flycart-100-lastdronare` |  | `TAG` EQUALS `model:flycart-100` **AND** `TITLE` CONTAINS `FlyCart 100` — _AND (all match)_ |

---

## 3. Sensors & Payloads — Smart Collection Rules

| Handle | Hub | Proposed rules |
|---|:---:|---|
| `enterprise-sensorer` | ✓ | `TAG` EQUALS `payload:thermal` **OR** `TAG` EQUALS `payload:multispectral` **OR** `TAG` EQUALS `payload:lidar` **OR** `TAG` EQUALS `Sensorer` — _OR (any match)_ |
| `dronare-med-varmekamera` |  | `TAG` EQUALS `payload:thermal` **OR** `TAG` EQUALS `värmekamera` **OR** `TITLE` CONTAINS `thermal` — _OR (any match)_ |
| `airdrop-system` |  | `TAG` EQUALS `payload:airdrop` **OR** `TAG` EQUALS `airdrop system` — _OR (any match)_ |

---

## 4. Industry Solutions — Smart Collection Rules

| Handle | Proposed rules |
|---|---|
| `inspektionsdronare` | `TAG` EQUALS `industry:inspection` **AND** `TYPE` EQUALS `Enterprise Drönare` — _AND (all match)_ |
| `energi-infrastruktur` | `TAG` EQUALS `industry:energy-infrastructure` **AND** `TYPE` EQUALS `Enterprise Drönare` — _AND (all match)_ |
| `jordbruksdronare` | `TAG` EQUALS `industry:agriculture` **OR** `TAG` EQUALS `family:agras` **OR** `TAG` EQUALS `DJI Agras` — _OR (any match)_ |
| `skogsbruksdronare` | `TAG` EQUALS `industry:forestry` **AND** `TYPE` EQUALS `Enterprise Drönare` — _AND (all match)_ |
| `kartlaggnings-och-matdronare` | `TAG` EQUALS `industry:surveying-mapping` **OR** `TAG` EQUALS `Kartläggningsdrönare` **OR** `TAG` EQUALS `mätdrönare` — _OR (any match)_ |
| `transport-logistik` | `TAG` EQUALS `industry:transport-logistics` **OR** `TAG` EQUALS `family:flycart` — _OR (any match)_ |
| `last-och-transportdronare` | `TAG` EQUALS `industry:transport-logistics` **OR** `TAG` EQUALS `transportdrönare` **OR** `TAG` EQUALS `family:flycart` — _OR (any match)_ |

---

## 5. Industry SEO Landing Page Framework

### Template structure

Each vertical landing page includes:

1. **SEO title** — `{Vertical} | DJI Enterprise | EuroDroneParts`
2. **SEO description** — value prop + platform keywords
3. **descriptionHtml** — hero, recommended platforms, related collections
4. **Cross-links** — enterprise hub + payloads + sibling verticals

| Vertical | Collection | Status | SEO title |
|---|---|:---:|---|
| inspection | `inspektionsdronare` | ✓ live | Inspektionsdrönare \| Industri & Infrastruktur \| EuroDroneParts |
| energy infrastructure | `energi-infrastruktur` | ✓ live | Energi & Infrastruktur Drönare \| EuroDroneParts |
| agriculture | `jordbruksdronare` | ✓ live | Jordbruksdrönare \| DJI Agras \| EuroDroneParts |
| forestry | `skogsbruksdronare` | ✓ live | Skogsbruksdrönare \| Kartläggning & Inventering \| EuroDroneParts |
| surveying mapping | `kartlaggnings-och-matdronare` | ✓ live | Kartläggnings- & Mätdrönare \| RTK & LiDAR \| EuroDroneParts |
| transport logistics | `transport-logistik` | ✓ live | Transport & Logistik Drönare \| FlyCart \| EuroDroneParts |
| public safety rescue | `public-safety-raddning` | ⚠️ framework | Public Safety & Rescue Drönare \| S&R \| EuroDroneParts |

### Public Safety & Rescue (framework only)

> **No collection created.** Interim navigation points to `inspektionsdronare`. Planned handle: `public-safety-raddning` (requires approval).

**Interim collections:** `inspektionsdronare`, `dronare-med-varmekamera`, `enterprise-dronare`, `airdrop-system`

**Recommended payloads:** `dronare-med-varmekamera`, `enterprise-hogtalarsystem`, `airdrop-system`, `enterprise-belysning`


---

## 6. Product Tag Standards

| Dimension | Format | Required | Example values |
|---|---|:---:|---|
| `brand` | kebab-case | ✓ | dji, polarpro, pgytech, czi |
| `manufacturer` | kebab-case |  | dji, walkera, czi, livox |
| `drone_family` | kebab-case | ✓ | matrice, mavic-enterprise, agras, marvic |
| `drone_model` | kebab-case | ✓ | matrice-4, matrice-400, matrice-350-rtk, matrice-30 |
| `payload_type` | kebab-case |  | thermal, multispectral, lidar, zoom-camera |
| `industry` | kebab-case |  | inspection, energy-infrastructure, agriculture, forestry |
| `compatibility` | kebab-case |  | matrice-350-rtk, matrice-30, matrice-4, mavic-3-enterprise |

### Tag prefix convention

```
brand:dji
family:matrice
model:matrice-4
payload:thermal
industry:inspection
compat:matrice-350-rtk
```

### Product type standards

| Key | Shopify product_type |
|---|---|
| enterprise_drone | Enterprise Drönare |
| enterprise_drone_alt | Drönare för företag |
| enterprise_accessory | Enterprise Tillbehör |
| enterprise_propeller | Propellrar |
| flycart | Enterprise Drönare |
| sensor_payload | Enterprise Tillbehör |
| spare_part | Reservdelar |
| consumer_drone | Drönare |
| consumer_accessory | Drönartillbehör |

---

## 7. Navigation Structure

### Huvudmeny (`main-menu`)

```
- **Drönare** → `/collections/dji-dronare`
  - **DJI Mini** → `/collections/dji-mini-4-serien`
  - **DJI Air** → `/collections/dji-air-serien`
  - **DJI Mavic** → `/collections/dji-mavic-serien`
  - **DJI Avata** → `/collections/dji-avata-serien`
  - **DJI Neo** → `/collections/dji-neo`
  - **DJI Flip** → `/collections/dji-flip-dronare`
  - **Alla konsumentdrönare** → `/collections/dji-dronare`
- **Enterprise Drönare** → `/collections/enterprise-dronare`
  - **Enterprise översikt** → `/collections/enterprise-dronare`
  - **DJI Matrice** → `/collections/dji-matrice-serien`
  - **Mavic Enterprise** → `/collections/dji-mavic-serien-enterprise`
  - **DJI Agras** → `/collections/dji-agras-dronare`
  - **Sensors & Payloads** → `/collections/enterprise-sensorer`
  - **Enterprise tillbehör** → `/collections/enterprise-tillbehor`
- **FlyCart** → `/collections/dji-flycart-serien`
  - **FlyCart 100** → `/collections/dji-flycart-100-lastdronare`
  - **FlyCart serie** → `/collections/dji-flycart-serien`
- **Branschlösningar** → `/collections/inspektionsdronare`
  - **Inspektion** → `/collections/inspektionsdronare`
  - **Energi & Infrastruktur** → `/collections/energi-infrastruktur`
  - **Jordbruk** → `/collections/jordbruksdronare`
  - **Skogsbruk** → `/collections/skogsbruksdronare`
  - **Kartläggning** → `/collections/kartlaggnings-och-matdronare`
  - **Transport & Logistik** → `/collections/transport-logistik`
  - **Public Safety & Rescue** → `/collections/inspektionsdronare` _(Interim — links to inspection hub until public-safety-raddning collection approved)_
- **Reservdelar** → `/collections/dji-dronar-reservdelar`
  - **Gimbal & motorer** → `/collections/reservdelar-gimbal-dronare-motorer`
  - **Elektronik & flight components** → `/collections/dronarelektronik-flight-components`
  - **Neo reservdelar** → `/collections/reparation-dji-neo-reservdelar`
  - **Övriga reservdelar** → `/collections/dronare-reservdelar-ovriga`
- **Tillbehör** → `/collections/dronartillbehor-kop`
  - **Propellrar** → `/collections/dronare-propeller-tillbehor`
  - **Filter** → `/collections/filter-till-dronare`
  - **Batterier** → `/collections/batterier`
  - **Minneskort** → `/collections/minneskort-lagring`
  - **Väskor & cases** → `/collections/dronarryggsack-vaskor`
  - **Fjärrkontroller** → `/collections/fjarrkontroll-dronare`
  - **PolarPro** → `/collections/polarpro`
- **Legacy DJI** → `/collections/dji-phantom-3-se`
  - **Phantom** → `/collections/dji-phantom-3-se`
  - **Air 2 / Air 2S** → `/collections/dji-air-2-serien`
  - **Mini 2** → `/collections/tillbehor-dji-mini-2-2-se`
  - **Mavic 2** → `/collections/dji-mavic-2-serien`
```

### Enterprise Drönare (`enterprise-dr-nare`)

```
- **Enterprise drönare** → `/collections/enterprise-dronare`
- **DJI Matrice** → `/collections/dji-matrice-serien`
  - **Matrice 4** → `/collections/dji-matrice-4-serie`
  - **Matrice 400** → `/collections/dji-matrice-400-serien`
  - **Matrice 350 RTK tillbehör** → `/collections/dji-matrice-350-rtk-tillbehor`
  - **Matrice 30 tillbehör** → `/collections/dji-matrice-30-serie-tillbehor`
  - **Matrice 4 tillbehör** → `/collections/dji-matrice-4-tillbehor`
- **Mavic Enterprise** → `/collections/dji-mavic-3-enterprise`
  - **Mavic Enterprise serie** → `/collections/dji-mavic-serien-enterprise`
  - **Mavic 3M** → `/collections/dji-mavic-3m-dronare-tillbehor`
- **DJI Agras** → `/collections/dji-agras-dronare`
- **DJI Marvic** → `/collections/dji-marvic-enterprise`
- **FlyCart** → `/collections/dji-flycart-serien`
  - **FlyCart 100** → `/collections/dji-flycart-100-lastdronare`
- **Sensors & Payloads** → `/collections/enterprise-sensorer`
  - **Värmekamera** → `/collections/dronare-med-varmekamera`
  - **Airdrop** → `/collections/airdrop-system`
- **Enterprise tillbehör** → `/collections/enterprise-tillbehor`
  - **Drönartillbehör** → `/collections/enterprise-dronartillbehor`
  - **Propellrar** → `/collections/enterprise-propellrar`
  - **Fjärrkontroller** → `/collections/dji-enterprise-fjarrkontroller`
  - **Belysning** → `/collections/enterprise-belysning`
  - **Högtalarsystem** → `/collections/enterprise-hogtalarsystem`
  - **Lyftsystem** → `/collections/enterprise-lyftsystem`
- **Enterprise Service** → `/collections/enterprise-service-dronare`
- **Branschlösningar** → `/collections/inspektionsdronare`
  - **Inspektion** → `/collections/inspektionsdronare`
  - **Energi & Infrastruktur** → `/collections/energi-infrastruktur`
  - **Jordbruk** → `/collections/jordbruksdronare`
  - **Skogsbruk** → `/collections/skogsbruksdronare`
  - **Kartläggning** → `/collections/kartlaggnings-och-matdronare`
  - **Transport & Logistik** → `/collections/transport-logistik`
```

### Sidfotsmeny (`footer`)

```
- **Alla produkter** → `/collections/alla-produkter`
- **Enterprise drönare** → `/collections/enterprise-dronare`
- **DJI Matrice** → `/collections/dji-matrice-serien`
- **FlyCart** → `/collections/dji-flycart-serien`
- **Reservdelar** → `/collections/dji-dronar-reservdelar`
- **Tillbehör** → `/collections/dronartillbehor-kop`
- **Kontakta oss** → `/pages/contact`
```

### Kundkonto (`customer-account-main-menu`)

```
```

---

## 8. Collection-to-Menu Mapping

**56 collections** mapped to navigation paths.

| Collection | Menu | Path |
|---|---|---|
| `airdrop-system` | `enterprise-dr-nare` | Sensors & Payloads › Airdrop |
| `alla-produkter` | `footer` | Alla produkter |
| `batterier` | `main-menu` | Tillbehör › Batterier |
| `dji-agras-dronare` | `main-menu` | Enterprise Drönare › DJI Agras |
| `dji-air-2-serien` | `main-menu` | Legacy DJI › Air 2 / Air 2S |
| `dji-air-serien` | `main-menu` | Drönare › DJI Air |
| `dji-avata-serien` | `main-menu` | Drönare › DJI Avata |
| `dji-dronar-reservdelar` | `main-menu` | Reservdelar |
| `dji-dronare` | `main-menu` | Drönare › Alla konsumentdrönare |
| `dji-enterprise-fjarrkontroller` | `enterprise-dr-nare` | Enterprise tillbehör › Fjärrkontroller |
| `dji-flip-dronare` | `main-menu` | Drönare › DJI Flip |
| `dji-flycart-100-lastdronare` | `main-menu` | FlyCart › FlyCart 100 |
| `dji-flycart-serien` | `main-menu` | FlyCart › FlyCart serie |
| `dji-marvic-enterprise` | `enterprise-dr-nare` | DJI Marvic |
| `dji-matrice-30-serie-tillbehor` | `enterprise-dr-nare` | DJI Matrice › Matrice 30 tillbehör |
| `dji-matrice-350-rtk-tillbehor` | `enterprise-dr-nare` | DJI Matrice › Matrice 350 RTK tillbehör |
| `dji-matrice-4-serie` | `enterprise-dr-nare` | DJI Matrice › Matrice 4 |
| `dji-matrice-4-tillbehor` | `enterprise-dr-nare` | DJI Matrice › Matrice 4 tillbehör |
| `dji-matrice-400-serien` | `enterprise-dr-nare` | DJI Matrice › Matrice 400 |
| `dji-matrice-serien` | `main-menu` | Enterprise Drönare › DJI Matrice |
| `dji-mavic-2-serien` | `main-menu` | Legacy DJI › Mavic 2 |
| `dji-mavic-3-enterprise` | `enterprise-dr-nare` | Mavic Enterprise |
| `dji-mavic-3m-dronare-tillbehor` | `enterprise-dr-nare` | Mavic Enterprise › Mavic 3M |
| `dji-mavic-serien` | `main-menu` | Drönare › DJI Mavic |
| `dji-mavic-serien-enterprise` | `enterprise-dr-nare` | Mavic Enterprise › Mavic Enterprise serie |
| `dji-mini-4-serien` | `main-menu` | Drönare › DJI Mini |
| `dji-neo` | `main-menu` | Drönare › DJI Neo |
| `dji-phantom-3-se` | `main-menu` | Legacy DJI › Phantom |
| `dronare-med-varmekamera` | `enterprise-dr-nare` | Sensors & Payloads › Värmekamera |
| `dronare-propeller-tillbehor` | `main-menu` | Tillbehör › Propellrar |
| `dronare-reservdelar-ovriga` | `main-menu` | Reservdelar › Övriga reservdelar |
| `dronarelektronik-flight-components` | `main-menu` | Reservdelar › Elektronik & flight components |
| `dronarryggsack-vaskor` | `main-menu` | Tillbehör › Väskor & cases |
| `dronartillbehor-kop` | `main-menu` | Tillbehör |
| `energi-infrastruktur` | `main-menu` | Branschlösningar › Energi & Infrastruktur |
| `enterprise-belysning` | `enterprise-dr-nare` | Enterprise tillbehör › Belysning |
| `enterprise-dronare` | `main-menu` | Enterprise Drönare › Enterprise översikt |
| `enterprise-dronartillbehor` | `enterprise-dr-nare` | Enterprise tillbehör › Drönartillbehör |
| `enterprise-hogtalarsystem` | `enterprise-dr-nare` | Enterprise tillbehör › Högtalarsystem |
| `enterprise-lyftsystem` | `enterprise-dr-nare` | Enterprise tillbehör › Lyftsystem |
| `enterprise-propellrar` | `enterprise-dr-nare` | Enterprise tillbehör › Propellrar |
| `enterprise-sensorer` | `main-menu` | Enterprise Drönare › Sensors & Payloads |
| `enterprise-service-dronare` | `enterprise-dr-nare` | Enterprise Service |
| `enterprise-tillbehor` | `main-menu` | Enterprise Drönare › Enterprise tillbehör |
| `filter-till-dronare` | `main-menu` | Tillbehör › Filter |
| `fjarrkontroll-dronare` | `main-menu` | Tillbehör › Fjärrkontroller |
| `inspektionsdronare` | `main-menu` | Branschlösningar › Public Safety & Rescue |
| `jordbruksdronare` | `main-menu` | Branschlösningar › Jordbruk |
| `kartlaggnings-och-matdronare` | `main-menu` | Branschlösningar › Kartläggning |
| `minneskort-lagring` | `main-menu` | Tillbehör › Minneskort |
| `polarpro` | `main-menu` | Tillbehör › PolarPro |
| `reparation-dji-neo-reservdelar` | `main-menu` | Reservdelar › Neo reservdelar |
| `reservdelar-gimbal-dronare-motorer` | `main-menu` | Reservdelar › Gimbal & motorer |
| `skogsbruksdronare` | `main-menu` | Branschlösningar › Skogsbruk |
| `tillbehor-dji-mini-2-2-se` | `main-menu` | Legacy DJI › Mini 2 |
| `transport-logistik` | `main-menu` | Branschlösningar › Transport & Logistik |

---

## 9. Implementation order (Phase 3 — not executed)

1. **Tag backfill** — apply `edp-product-tag-standards.json` to new imports only
2. **Rule migration** — update smart collections from `current_live` → `proposed` one family at a time
3. **Industry SEO** — apply `edp-industry-seo-framework.json` descriptions to live vertical collections
4. **Enterprise menu** — deploy expanded `enterprise-dr-nare` tree from `edp-navigation-structure.json`
5. **Public Safety** — create collection or page after explicit approval
6. **Validate** — re-run `collection-inventory-audit.mjs` and confirm product counts

**Phase 2 complete. Awaiting approval to apply rules live.**
