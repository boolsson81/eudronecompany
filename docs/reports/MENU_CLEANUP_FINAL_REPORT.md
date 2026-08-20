# EuroDroneParts — Menu Cleanup Final Report

**Generated:** 2026-06-13T13:06:47.850Z
**Store:** ya1xhg-x6.myshopify.com (Europe Drone Parts)
**Migration:** `3d9876af-885c-49e9-a4b0-c4943c06112f`
**Audit source:** Live Shopify GraphQL + theme asset scan via `menu-cleanup-pass` (post-PR49)
**Mode:** READ ONLY — no menus deleted

---

## Executive summary

Post-PR49, the store has **217 menus** instead of the **8 production menus** required. A migration retry loop created **204 numbered duplicate menus** (`actionkameror-N`, `dronare-N`, `partnership-N`) when Shopify rejected publishes at the menu slot limit. PR49 successfully deployed `menu-cleanup-pass` with theme probing and added five `*-deploy` submenus with real content, but only **`main-menu`** is wired into the live theme.

| Metric | Count |
| --- | ---: |
| **Total menus** | 217 |
| **Active menus** (items > 0) | 9 |
| **Theme-linked menus** | 1 |
| **Duplicate menus** (non-canonical copies) | 205 |
| **Safe-to-delete menus** | 208 |
| **Target production menus** | 8 |

---

## Findings

### 1. Duplicate menus (4 title groups, 209 extra copies)
- **huvudmeny** — 2 menus; canonical: `main-menu`
- **actionkameror** — 69 menus; canonical: `actionkameror`
- **drönare** — 69 menus; canonical: `dronare`
- **partnership** — 69 menus; canonical: `partnership`

### 2. Empty menus
**208** menus have zero items (204 migration-test artifacts).

### 3. Legacy menus
| Handle | Title | Items | Status |
| --- | --- | ---: | --- |
| `actionkameror` | Actionkameror | 0 | Legacy ActionKing / empty |
| `dronare` | Drönare | 0 | Legacy ActionKing / empty |
| `meny` | Huvudmeny | 0 | Legacy ActionKing / empty |
| `partnership` | Partnership | 0 | Legacy ActionKing / empty |
| `vandring-outdoor` | — | — | Not on live store |

### 4. Test menus
- `_test-menu-delete-me` — **TEST Menu Delete** (1 item(s))

### 5. Menus with no active references
**209** menus have no theme reference and no migration DB row.

### 6. Swedish menu names
71 menus use Swedish titles. Production menus needing English rename:
- `main-menu`: "Huvudmeny" → **Main Menu**
- `enterprise-dr-nare`: "Enterprise Drönare" → **Enterprise Drones**
- `spare-parts-deploy`: "Reservdelar" → **Spare Parts**
- `b2b-enterprise-deploy`: "Enterprise & B2B" → **B2B Enterprise**
- `footer`: "Sidfotsmeny" → **Footer Menu**
- `customer-account-main-menu`: "Huvudmeny för kundkonto" → **Customer Account**

### 7. Menus not linked from theme navigation
Only `main-menu` is referenced in `sections/header-group.json`. Footer, customer account, and all `*-deploy` menus are orphaned from theme navigation.

---

## Target production architecture

| Production menu | Handle | Current title | Items | Theme | Action |
| --- | --- | --- | ---: | --- | --- |
| Main Menu | `main-menu` | Huvudmeny | 41 | YES | KEEP + RENAME |
| Enterprise Drones | `enterprise-dr-nare` | Enterprise Drönare + merge `enterprise-expansion-deploy` (9) | 7+9 | NO | MERGE + RENAME |
| Spare Parts | `spare-parts-deploy` | Reservdelar | 47 | NO | KEEP + RENAME |
| Service & Support | `service-support-deploy` | Service & Support | 14 | NO | KEEP + RENAME |
| Partnership | `partnership` | Partnership | 0 | NO | REBUILD |
| B2B Enterprise | `b2b-enterprise-deploy` | Enterprise & B2B | 20 | NO | KEEP + RENAME |
| Footer Menu | `footer` | Sidfotsmeny | 1 | NO | KEEP + RENAME |
| Customer Account | `customer-account-main-menu` | Huvudmeny för kundkonto | 2 | NO | KEEP + RENAME |

---

## Grouped recommendations

### KEEP (8 production menus after cleanup)
- **Main Menu** — `main-menu` (41 items)
- **Enterprise Drones** — `enterprise-dr-nare` (7 items)
- **Spare Parts** — `spare-parts-deploy` (47 items)
- **Service & Support** — `service-support-deploy` (14 items)
- **Partnership** — `partnership` (0 items)
- **B2B Enterprise** — `b2b-enterprise-deploy` (20 items)
- **Footer Menu** — `footer` (1 items)
- **Customer Account** — `customer-account-main-menu` (2 items)

### MERGE
- `meny` → `main-menu` (empty duplicate of Huvudmeny)
- `enterprise-expansion-deploy` (9 items) → `enterprise-dr-nare` (7 items) → single **Enterprise Drones** menu
- `partnership` is empty — rebuild content from migration source (all 69 partnership copies are empty)

### RENAME
- `main-menu`: "Huvudmeny" → "Main Menu"
- `enterprise-dr-nare`: "Enterprise Drönare" → "Enterprise Drones"
- `spare-parts-deploy`: "Reservdelar" → "Spare Parts"
- `b2b-enterprise-deploy`: "Enterprise & B2B" → "B2B Enterprise"
- `footer`: "Sidfotsmeny" → "Footer Menu"
- `customer-account-main-menu`: "Huvudmeny för kundkonto" → "Customer Account"
- Remove `-deploy` suffix from handles after theme wiring (`spare-parts-deploy` → `spare-parts`, etc.)

### DELETE (208 menus — NOT executed)

Categories:
- Migration-test numbered duplicates: 204
- Legacy empty (actionkameror, dronare, meny): 3
- Test menu: 1
- Post-merge orphan: enterprise-expansion-deploy (after merge into enterprise-dr-nare)

---

## Complete menu inventory (all 217 menus)

| # | Menu name | Handle | Items | Used by theme? | Referenced anywhere? | Decision |
| ---: | --- | --- | ---: | --- | --- | --- |
| 1 | TEST Menu Delete | `_test-menu-delete-me` | 1 | NO | NO | DELETE |
| 2 | Actionkameror | `actionkameror` | 0 | NO | YES | DELETE |
| 3 | Actionkameror | `actionkameror-1` | 0 | NO | NO | DELETE |
| 4 | Actionkameror | `actionkameror-10` | 0 | NO | NO | DELETE |
| 5 | Actionkameror | `actionkameror-11` | 0 | NO | NO | DELETE |
| 6 | Actionkameror | `actionkameror-12` | 0 | NO | NO | DELETE |
| 7 | Actionkameror | `actionkameror-13` | 0 | NO | NO | DELETE |
| 8 | Actionkameror | `actionkameror-14` | 0 | NO | NO | DELETE |
| 9 | Actionkameror | `actionkameror-15` | 0 | NO | NO | DELETE |
| 10 | Actionkameror | `actionkameror-16` | 0 | NO | NO | DELETE |
| 11 | Actionkameror | `actionkameror-17` | 0 | NO | NO | DELETE |
| 12 | Actionkameror | `actionkameror-18` | 0 | NO | NO | DELETE |
| 13 | Actionkameror | `actionkameror-19` | 0 | NO | NO | DELETE |
| 14 | Actionkameror | `actionkameror-2` | 0 | NO | NO | DELETE |
| 15 | Actionkameror | `actionkameror-20` | 0 | NO | NO | DELETE |
| 16 | Actionkameror | `actionkameror-21` | 0 | NO | NO | DELETE |
| 17 | Actionkameror | `actionkameror-22` | 0 | NO | NO | DELETE |
| 18 | Actionkameror | `actionkameror-23` | 0 | NO | NO | DELETE |
| 19 | Actionkameror | `actionkameror-24` | 0 | NO | NO | DELETE |
| 20 | Actionkameror | `actionkameror-25` | 0 | NO | NO | DELETE |
| 21 | Actionkameror | `actionkameror-26` | 0 | NO | NO | DELETE |
| 22 | Actionkameror | `actionkameror-27` | 0 | NO | NO | DELETE |
| 23 | Actionkameror | `actionkameror-28` | 0 | NO | NO | DELETE |
| 24 | Actionkameror | `actionkameror-29` | 0 | NO | NO | DELETE |
| 25 | Actionkameror | `actionkameror-3` | 0 | NO | NO | DELETE |
| 26 | Actionkameror | `actionkameror-30` | 0 | NO | NO | DELETE |
| 27 | Actionkameror | `actionkameror-31` | 0 | NO | NO | DELETE |
| 28 | Actionkameror | `actionkameror-32` | 0 | NO | NO | DELETE |
| 29 | Actionkameror | `actionkameror-33` | 0 | NO | NO | DELETE |
| 30 | Actionkameror | `actionkameror-34` | 0 | NO | NO | DELETE |
| 31 | Actionkameror | `actionkameror-35` | 0 | NO | NO | DELETE |
| 32 | Actionkameror | `actionkameror-36` | 0 | NO | NO | DELETE |
| 33 | Actionkameror | `actionkameror-37` | 0 | NO | NO | DELETE |
| 34 | Actionkameror | `actionkameror-38` | 0 | NO | NO | DELETE |
| 35 | Actionkameror | `actionkameror-39` | 0 | NO | NO | DELETE |
| 36 | Actionkameror | `actionkameror-4` | 0 | NO | NO | DELETE |
| 37 | Actionkameror | `actionkameror-40` | 0 | NO | NO | DELETE |
| 38 | Actionkameror | `actionkameror-41` | 0 | NO | NO | DELETE |
| 39 | Actionkameror | `actionkameror-42` | 0 | NO | NO | DELETE |
| 40 | Actionkameror | `actionkameror-43` | 0 | NO | NO | DELETE |
| 41 | Actionkameror | `actionkameror-44` | 0 | NO | NO | DELETE |
| 42 | Actionkameror | `actionkameror-45` | 0 | NO | NO | DELETE |
| 43 | Actionkameror | `actionkameror-46` | 0 | NO | NO | DELETE |
| 44 | Actionkameror | `actionkameror-47` | 0 | NO | NO | DELETE |
| 45 | Actionkameror | `actionkameror-48` | 0 | NO | NO | DELETE |
| 46 | Actionkameror | `actionkameror-49` | 0 | NO | NO | DELETE |
| 47 | Actionkameror | `actionkameror-5` | 0 | NO | NO | DELETE |
| 48 | Actionkameror | `actionkameror-50` | 0 | NO | NO | DELETE |
| 49 | Actionkameror | `actionkameror-51` | 0 | NO | NO | DELETE |
| 50 | Actionkameror | `actionkameror-52` | 0 | NO | NO | DELETE |
| 51 | Actionkameror | `actionkameror-53` | 0 | NO | NO | DELETE |
| 52 | Actionkameror | `actionkameror-54` | 0 | NO | NO | DELETE |
| 53 | Actionkameror | `actionkameror-55` | 0 | NO | NO | DELETE |
| 54 | Actionkameror | `actionkameror-56` | 0 | NO | NO | DELETE |
| 55 | Actionkameror | `actionkameror-57` | 0 | NO | NO | DELETE |
| 56 | Actionkameror | `actionkameror-58` | 0 | NO | NO | DELETE |
| 57 | Actionkameror | `actionkameror-59` | 0 | NO | NO | DELETE |
| 58 | Actionkameror | `actionkameror-6` | 0 | NO | NO | DELETE |
| 59 | Actionkameror | `actionkameror-60` | 0 | NO | NO | DELETE |
| 60 | Actionkameror | `actionkameror-61` | 0 | NO | NO | DELETE |
| 61 | Actionkameror | `actionkameror-62` | 0 | NO | NO | DELETE |
| 62 | Actionkameror | `actionkameror-63` | 0 | NO | NO | DELETE |
| 63 | Actionkameror | `actionkameror-64` | 0 | NO | NO | DELETE |
| 64 | Actionkameror | `actionkameror-65` | 0 | NO | NO | DELETE |
| 65 | Actionkameror | `actionkameror-66` | 0 | NO | NO | DELETE |
| 66 | Actionkameror | `actionkameror-67` | 0 | NO | NO | DELETE |
| 67 | Actionkameror | `actionkameror-68` | 0 | NO | NO | DELETE |
| 68 | Actionkameror | `actionkameror-7` | 0 | NO | NO | DELETE |
| 69 | Actionkameror | `actionkameror-8` | 0 | NO | NO | DELETE |
| 70 | Actionkameror | `actionkameror-9` | 0 | NO | NO | DELETE |
| 71 | Enterprise & B2B | `b2b-enterprise-deploy` | 20 | NO | NO | KEEP |
| 72 | Huvudmeny för kundkonto | `customer-account-main-menu` | 2 | NO | YES | KEEP |
| 73 | Drönare | `dronare` | 0 | NO | YES | DELETE |
| 74 | Drönare | `dronare-1` | 0 | NO | NO | DELETE |
| 75 | Drönare | `dronare-10` | 0 | NO | NO | DELETE |
| 76 | Drönare | `dronare-11` | 0 | NO | NO | DELETE |
| 77 | Drönare | `dronare-12` | 0 | NO | NO | DELETE |
| 78 | Drönare | `dronare-13` | 0 | NO | NO | DELETE |
| 79 | Drönare | `dronare-14` | 0 | NO | NO | DELETE |
| 80 | Drönare | `dronare-15` | 0 | NO | NO | DELETE |
| 81 | Drönare | `dronare-16` | 0 | NO | NO | DELETE |
| 82 | Drönare | `dronare-17` | 0 | NO | NO | DELETE |
| 83 | Drönare | `dronare-18` | 0 | NO | NO | DELETE |
| 84 | Drönare | `dronare-19` | 0 | NO | NO | DELETE |
| 85 | Drönare | `dronare-2` | 0 | NO | NO | DELETE |
| 86 | Drönare | `dronare-20` | 0 | NO | NO | DELETE |
| 87 | Drönare | `dronare-21` | 0 | NO | NO | DELETE |
| 88 | Drönare | `dronare-22` | 0 | NO | NO | DELETE |
| 89 | Drönare | `dronare-23` | 0 | NO | NO | DELETE |
| 90 | Drönare | `dronare-24` | 0 | NO | NO | DELETE |
| 91 | Drönare | `dronare-25` | 0 | NO | NO | DELETE |
| 92 | Drönare | `dronare-26` | 0 | NO | NO | DELETE |
| 93 | Drönare | `dronare-27` | 0 | NO | NO | DELETE |
| 94 | Drönare | `dronare-28` | 0 | NO | NO | DELETE |
| 95 | Drönare | `dronare-29` | 0 | NO | NO | DELETE |
| 96 | Drönare | `dronare-3` | 0 | NO | NO | DELETE |
| 97 | Drönare | `dronare-30` | 0 | NO | NO | DELETE |
| 98 | Drönare | `dronare-31` | 0 | NO | NO | DELETE |
| 99 | Drönare | `dronare-32` | 0 | NO | NO | DELETE |
| 100 | Drönare | `dronare-33` | 0 | NO | NO | DELETE |
| 101 | Drönare | `dronare-34` | 0 | NO | NO | DELETE |
| 102 | Drönare | `dronare-35` | 0 | NO | NO | DELETE |
| 103 | Drönare | `dronare-36` | 0 | NO | NO | DELETE |
| 104 | Drönare | `dronare-37` | 0 | NO | NO | DELETE |
| 105 | Drönare | `dronare-38` | 0 | NO | NO | DELETE |
| 106 | Drönare | `dronare-39` | 0 | NO | NO | DELETE |
| 107 | Drönare | `dronare-4` | 0 | NO | NO | DELETE |
| 108 | Drönare | `dronare-40` | 0 | NO | NO | DELETE |
| 109 | Drönare | `dronare-41` | 0 | NO | NO | DELETE |
| 110 | Drönare | `dronare-42` | 0 | NO | NO | DELETE |
| 111 | Drönare | `dronare-43` | 0 | NO | NO | DELETE |
| 112 | Drönare | `dronare-44` | 0 | NO | NO | DELETE |
| 113 | Drönare | `dronare-45` | 0 | NO | NO | DELETE |
| 114 | Drönare | `dronare-46` | 0 | NO | NO | DELETE |
| 115 | Drönare | `dronare-47` | 0 | NO | NO | DELETE |
| 116 | Drönare | `dronare-48` | 0 | NO | NO | DELETE |
| 117 | Drönare | `dronare-49` | 0 | NO | NO | DELETE |
| 118 | Drönare | `dronare-5` | 0 | NO | NO | DELETE |
| 119 | Drönare | `dronare-50` | 0 | NO | NO | DELETE |
| 120 | Drönare | `dronare-51` | 0 | NO | NO | DELETE |
| 121 | Drönare | `dronare-52` | 0 | NO | NO | DELETE |
| 122 | Drönare | `dronare-53` | 0 | NO | NO | DELETE |
| 123 | Drönare | `dronare-54` | 0 | NO | NO | DELETE |
| 124 | Drönare | `dronare-55` | 0 | NO | NO | DELETE |
| 125 | Drönare | `dronare-56` | 0 | NO | NO | DELETE |
| 126 | Drönare | `dronare-57` | 0 | NO | NO | DELETE |
| 127 | Drönare | `dronare-58` | 0 | NO | NO | DELETE |
| 128 | Drönare | `dronare-59` | 0 | NO | NO | DELETE |
| 129 | Drönare | `dronare-6` | 0 | NO | NO | DELETE |
| 130 | Drönare | `dronare-60` | 0 | NO | NO | DELETE |
| 131 | Drönare | `dronare-61` | 0 | NO | NO | DELETE |
| 132 | Drönare | `dronare-62` | 0 | NO | NO | DELETE |
| 133 | Drönare | `dronare-63` | 0 | NO | NO | DELETE |
| 134 | Drönare | `dronare-64` | 0 | NO | NO | DELETE |
| 135 | Drönare | `dronare-65` | 0 | NO | NO | DELETE |
| 136 | Drönare | `dronare-66` | 0 | NO | NO | DELETE |
| 137 | Drönare | `dronare-67` | 0 | NO | NO | DELETE |
| 138 | Drönare | `dronare-68` | 0 | NO | NO | DELETE |
| 139 | Drönare | `dronare-7` | 0 | NO | NO | DELETE |
| 140 | Drönare | `dronare-8` | 0 | NO | NO | DELETE |
| 141 | Drönare | `dronare-9` | 0 | NO | NO | DELETE |
| 142 | Enterprise Drönare | `enterprise-dr-nare` | 7 | NO | YES | KEEP |
| 143 | Enterprise Expansion | `enterprise-expansion-deploy` | 9 | NO | NO | MERGE |
| 144 | Sidfotsmeny | `footer` | 1 | NO | YES | KEEP |
| 145 | Huvudmeny | `main-menu` | 41 | YES | YES | KEEP |
| 146 | Huvudmeny | `meny` | 0 | NO | YES | DELETE |
| 147 | Partnership | `partnership` | 0 | NO | YES | KEEP |
| 148 | Partnership | `partnership-1` | 0 | NO | NO | DELETE |
| 149 | Partnership | `partnership-10` | 0 | NO | NO | DELETE |
| 150 | Partnership | `partnership-11` | 0 | NO | NO | DELETE |
| 151 | Partnership | `partnership-12` | 0 | NO | NO | DELETE |
| 152 | Partnership | `partnership-13` | 0 | NO | NO | DELETE |
| 153 | Partnership | `partnership-14` | 0 | NO | NO | DELETE |
| 154 | Partnership | `partnership-15` | 0 | NO | NO | DELETE |
| 155 | Partnership | `partnership-16` | 0 | NO | NO | DELETE |
| 156 | Partnership | `partnership-17` | 0 | NO | NO | DELETE |
| 157 | Partnership | `partnership-18` | 0 | NO | NO | DELETE |
| 158 | Partnership | `partnership-19` | 0 | NO | NO | DELETE |
| 159 | Partnership | `partnership-2` | 0 | NO | NO | DELETE |
| 160 | Partnership | `partnership-20` | 0 | NO | NO | DELETE |
| 161 | Partnership | `partnership-21` | 0 | NO | NO | DELETE |
| 162 | Partnership | `partnership-22` | 0 | NO | NO | DELETE |
| 163 | Partnership | `partnership-23` | 0 | NO | NO | DELETE |
| 164 | Partnership | `partnership-24` | 0 | NO | NO | DELETE |
| 165 | Partnership | `partnership-25` | 0 | NO | NO | DELETE |
| 166 | Partnership | `partnership-26` | 0 | NO | NO | DELETE |
| 167 | Partnership | `partnership-27` | 0 | NO | NO | DELETE |
| 168 | Partnership | `partnership-28` | 0 | NO | NO | DELETE |
| 169 | Partnership | `partnership-29` | 0 | NO | NO | DELETE |
| 170 | Partnership | `partnership-3` | 0 | NO | NO | DELETE |
| 171 | Partnership | `partnership-30` | 0 | NO | NO | DELETE |
| 172 | Partnership | `partnership-31` | 0 | NO | NO | DELETE |
| 173 | Partnership | `partnership-32` | 0 | NO | NO | DELETE |
| 174 | Partnership | `partnership-33` | 0 | NO | NO | DELETE |
| 175 | Partnership | `partnership-34` | 0 | NO | NO | DELETE |
| 176 | Partnership | `partnership-35` | 0 | NO | NO | DELETE |
| 177 | Partnership | `partnership-36` | 0 | NO | NO | DELETE |
| 178 | Partnership | `partnership-37` | 0 | NO | NO | DELETE |
| 179 | Partnership | `partnership-38` | 0 | NO | NO | DELETE |
| 180 | Partnership | `partnership-39` | 0 | NO | NO | DELETE |
| 181 | Partnership | `partnership-4` | 0 | NO | NO | DELETE |
| 182 | Partnership | `partnership-40` | 0 | NO | NO | DELETE |
| 183 | Partnership | `partnership-41` | 0 | NO | NO | DELETE |
| 184 | Partnership | `partnership-42` | 0 | NO | NO | DELETE |
| 185 | Partnership | `partnership-43` | 0 | NO | NO | DELETE |
| 186 | Partnership | `partnership-44` | 0 | NO | NO | DELETE |
| 187 | Partnership | `partnership-45` | 0 | NO | NO | DELETE |
| 188 | Partnership | `partnership-46` | 0 | NO | NO | DELETE |
| 189 | Partnership | `partnership-47` | 0 | NO | NO | DELETE |
| 190 | Partnership | `partnership-48` | 0 | NO | NO | DELETE |
| 191 | Partnership | `partnership-49` | 0 | NO | NO | DELETE |
| 192 | Partnership | `partnership-5` | 0 | NO | NO | DELETE |
| 193 | Partnership | `partnership-50` | 0 | NO | NO | DELETE |
| 194 | Partnership | `partnership-51` | 0 | NO | NO | DELETE |
| 195 | Partnership | `partnership-52` | 0 | NO | NO | DELETE |
| 196 | Partnership | `partnership-53` | 0 | NO | NO | DELETE |
| 197 | Partnership | `partnership-54` | 0 | NO | NO | DELETE |
| 198 | Partnership | `partnership-55` | 0 | NO | NO | DELETE |
| 199 | Partnership | `partnership-56` | 0 | NO | NO | DELETE |
| 200 | Partnership | `partnership-57` | 0 | NO | NO | DELETE |
| 201 | Partnership | `partnership-58` | 0 | NO | NO | DELETE |
| 202 | Partnership | `partnership-59` | 0 | NO | NO | DELETE |
| 203 | Partnership | `partnership-6` | 0 | NO | NO | DELETE |
| 204 | Partnership | `partnership-60` | 0 | NO | NO | DELETE |
| 205 | Partnership | `partnership-61` | 0 | NO | NO | DELETE |
| 206 | Partnership | `partnership-62` | 0 | NO | NO | DELETE |
| 207 | Partnership | `partnership-63` | 0 | NO | NO | DELETE |
| 208 | Partnership | `partnership-64` | 0 | NO | NO | DELETE |
| 209 | Partnership | `partnership-65` | 0 | NO | NO | DELETE |
| 210 | Partnership | `partnership-66` | 0 | NO | NO | DELETE |
| 211 | Partnership | `partnership-67` | 0 | NO | NO | DELETE |
| 212 | Partnership | `partnership-68` | 0 | NO | NO | DELETE |
| 213 | Partnership | `partnership-7` | 0 | NO | NO | DELETE |
| 214 | Partnership | `partnership-8` | 0 | NO | NO | DELETE |
| 215 | Partnership | `partnership-9` | 0 | NO | NO | DELETE |
| 216 | Service & Support | `service-support-deploy` | 14 | NO | NO | KEEP |
| 217 | Reservdelar | `spare-parts-deploy` | 47 | NO | NO | KEEP |

---

## Production menu item detail

### Main Menu (`main-menu`)

**Items (41):** Drönare, DJI Air, DJI Mavic, DJI Avata, DJI Neo, DJI Flip, Alla konsumentdrönare, Enterprise Drönare, DJI Matrice, Mavic Enterprise, DJI Agras, Sensors & Payloads (+22 more)

**Theme:** sections/header-group.json

### Enterprise Drones (`enterprise-dr-nare`)

**Items (7):** Enterprise drönare, Matrice, Mavic Enterprise, Agras, FlyCart, Värmekamera, Airdrop

### Spare Parts (`spare-parts-deploy`)

**Items (47):** Mini 4 Pro, Batterier, Motorer, Armar, Kameror, Gimbal, Skal, Landningsställ, Kablar, Antenner, Sensorer, Tillbehör (+6 more)

### Service & Support (`service-support-deploy`)

**Items (14):** Service & Support, DJI Service, Reparation, Kalibrering, Batteritest, Firmwareuppdatering, Garantihantering, RMA, Serviceanmälan, Support, Enterprise Service, FlyCart Service (+1 more)

### Partnership (`partnership`)

**Items:** (empty — content must be rebuilt)

### B2B Enterprise (`b2b-enterprise-deploy`)

**Items (20):** Branscher, Vindkraft, Solparker, Kraftnät, Skogsbruk, Jordbruk, Kartläggning, Bygg & Anläggning, Säkerhet & Räddning, Transport & Logistik, Tjänster, Offertförfrågan (+6 more)

### Footer Menu (`footer`)

**Items (1):** Alla produkter

### Customer Account (`customer-account-main-menu`)

**Items (2):** Ordrar, Profil

### Enterprise Expansion (merge into Enterprise Drones)

**Items (9):** Matrice 300 RTK, Matrice 3D, Matrice 3TD, Mavic 3 Thermal, Agras T40, Agras T50, FlyCart 30, Dock 2, Dock 3

---

## Final deletion list

> **DO NOT DELETE** until theme navigation is updated. Rollback: `EURODRONEPARTS_MENU_CLEANUP_ROLLBACK.json`

**208 handles** recommended for deletion:

```text
_test-menu-delete-me  # TEST Menu Delete
actionkameror  # Actionkameror
actionkameror-1  # Actionkameror
actionkameror-10  # Actionkameror
actionkameror-11  # Actionkameror
actionkameror-12  # Actionkameror
actionkameror-13  # Actionkameror
actionkameror-14  # Actionkameror
actionkameror-15  # Actionkameror
actionkameror-16  # Actionkameror
actionkameror-17  # Actionkameror
actionkameror-18  # Actionkameror
actionkameror-19  # Actionkameror
actionkameror-2  # Actionkameror
actionkameror-20  # Actionkameror
actionkameror-21  # Actionkameror
actionkameror-22  # Actionkameror
actionkameror-23  # Actionkameror
actionkameror-24  # Actionkameror
actionkameror-25  # Actionkameror
actionkameror-26  # Actionkameror
actionkameror-27  # Actionkameror
actionkameror-28  # Actionkameror
actionkameror-29  # Actionkameror
actionkameror-3  # Actionkameror
actionkameror-30  # Actionkameror
actionkameror-31  # Actionkameror
actionkameror-32  # Actionkameror
actionkameror-33  # Actionkameror
actionkameror-34  # Actionkameror
actionkameror-35  # Actionkameror
actionkameror-36  # Actionkameror
actionkameror-37  # Actionkameror
actionkameror-38  # Actionkameror
actionkameror-39  # Actionkameror
actionkameror-4  # Actionkameror
actionkameror-40  # Actionkameror
actionkameror-41  # Actionkameror
actionkameror-42  # Actionkameror
actionkameror-43  # Actionkameror
actionkameror-44  # Actionkameror
actionkameror-45  # Actionkameror
actionkameror-46  # Actionkameror
actionkameror-47  # Actionkameror
actionkameror-48  # Actionkameror
actionkameror-49  # Actionkameror
actionkameror-5  # Actionkameror
actionkameror-50  # Actionkameror
actionkameror-51  # Actionkameror
actionkameror-52  # Actionkameror
actionkameror-53  # Actionkameror
actionkameror-54  # Actionkameror
actionkameror-55  # Actionkameror
actionkameror-56  # Actionkameror
actionkameror-57  # Actionkameror
actionkameror-58  # Actionkameror
actionkameror-59  # Actionkameror
actionkameror-6  # Actionkameror
actionkameror-60  # Actionkameror
actionkameror-61  # Actionkameror
actionkameror-62  # Actionkameror
actionkameror-63  # Actionkameror
actionkameror-64  # Actionkameror
actionkameror-65  # Actionkameror
actionkameror-66  # Actionkameror
actionkameror-67  # Actionkameror
actionkameror-68  # Actionkameror
actionkameror-7  # Actionkameror
actionkameror-8  # Actionkameror
actionkameror-9  # Actionkameror
dronare  # Drönare
dronare-1  # Drönare
dronare-10  # Drönare
dronare-11  # Drönare
dronare-12  # Drönare
dronare-13  # Drönare
dronare-14  # Drönare
dronare-15  # Drönare
dronare-16  # Drönare
dronare-17  # Drönare
dronare-18  # Drönare
dronare-19  # Drönare
dronare-2  # Drönare
dronare-20  # Drönare
dronare-21  # Drönare
dronare-22  # Drönare
dronare-23  # Drönare
dronare-24  # Drönare
dronare-25  # Drönare
dronare-26  # Drönare
dronare-27  # Drönare
dronare-28  # Drönare
dronare-29  # Drönare
dronare-3  # Drönare
dronare-30  # Drönare
dronare-31  # Drönare
dronare-32  # Drönare
dronare-33  # Drönare
dronare-34  # Drönare
dronare-35  # Drönare
dronare-36  # Drönare
dronare-37  # Drönare
dronare-38  # Drönare
dronare-39  # Drönare
dronare-4  # Drönare
dronare-40  # Drönare
dronare-41  # Drönare
dronare-42  # Drönare
dronare-43  # Drönare
dronare-44  # Drönare
dronare-45  # Drönare
dronare-46  # Drönare
dronare-47  # Drönare
dronare-48  # Drönare
dronare-49  # Drönare
dronare-5  # Drönare
dronare-50  # Drönare
dronare-51  # Drönare
dronare-52  # Drönare
dronare-53  # Drönare
dronare-54  # Drönare
dronare-55  # Drönare
dronare-56  # Drönare
dronare-57  # Drönare
dronare-58  # Drönare
dronare-59  # Drönare
dronare-6  # Drönare
dronare-60  # Drönare
dronare-61  # Drönare
dronare-62  # Drönare
dronare-63  # Drönare
dronare-64  # Drönare
dronare-65  # Drönare
dronare-66  # Drönare
dronare-67  # Drönare
dronare-68  # Drönare
dronare-7  # Drönare
dronare-8  # Drönare
dronare-9  # Drönare
meny  # Huvudmeny
partnership-1  # Partnership
partnership-10  # Partnership
partnership-11  # Partnership
partnership-12  # Partnership
partnership-13  # Partnership
partnership-14  # Partnership
partnership-15  # Partnership
partnership-16  # Partnership
partnership-17  # Partnership
partnership-18  # Partnership
partnership-19  # Partnership
partnership-2  # Partnership
partnership-20  # Partnership
partnership-21  # Partnership
partnership-22  # Partnership
partnership-23  # Partnership
partnership-24  # Partnership
partnership-25  # Partnership
partnership-26  # Partnership
partnership-27  # Partnership
partnership-28  # Partnership
partnership-29  # Partnership
partnership-3  # Partnership
partnership-30  # Partnership
partnership-31  # Partnership
partnership-32  # Partnership
partnership-33  # Partnership
partnership-34  # Partnership
partnership-35  # Partnership
partnership-36  # Partnership
partnership-37  # Partnership
partnership-38  # Partnership
partnership-39  # Partnership
partnership-4  # Partnership
partnership-40  # Partnership
partnership-41  # Partnership
partnership-42  # Partnership
partnership-43  # Partnership
partnership-44  # Partnership
partnership-45  # Partnership
partnership-46  # Partnership
partnership-47  # Partnership
partnership-48  # Partnership
partnership-49  # Partnership
partnership-5  # Partnership
partnership-50  # Partnership
partnership-51  # Partnership
partnership-52  # Partnership
partnership-53  # Partnership
partnership-54  # Partnership
partnership-55  # Partnership
partnership-56  # Partnership
partnership-57  # Partnership
partnership-58  # Partnership
partnership-59  # Partnership
partnership-6  # Partnership
partnership-60  # Partnership
partnership-61  # Partnership
partnership-62  # Partnership
partnership-63  # Partnership
partnership-64  # Partnership
partnership-65  # Partnership
partnership-66  # Partnership
partnership-67  # Partnership
partnership-68  # Partnership
partnership-7  # Partnership
partnership-8  # Partnership
partnership-9  # Partnership
```

### Menus to retain after cleanup (12 → consolidate to 8)

- `b2b-enterprise-deploy` — Enterprise & B2B (20 items)
- `customer-account-main-menu` — Huvudmeny för kundkonto (2 items)
- `enterprise-dr-nare` — Enterprise Drönare (7 items)
- `footer` — Sidfotsmeny (1 items)
- `main-menu` — Huvudmeny (41 items)
- `partnership` — Partnership (0 items)
- `service-support-deploy` — Service & Support (14 items)
- `spare-parts-deploy` — Reservdelar (47 items)
- `enterprise-expansion-deploy` — Enterprise Expansion (9 items)

After merge/rename/delete, target state: **8 production menus**.

---

## Recommended next steps

1. Wire theme navigation to production handles (header, footer, mega-menu sections)
2. Merge `enterprise-expansion-deploy` into `enterprise-dr-nare`
3. Rebuild empty `partnership` menu content
4. Rename Swedish titles and remove `-deploy` handle suffixes
5. Execute cleanup: `node scripts/menu-cleanup-audit.mjs --execute --confirm-delete`
6. Verify: store should show **8 menus**

---

*Read-only audit. No Shopify mutations performed.*
# MENU_CLEANUP_FINAL_REPORT

**Store:** EuroDroneParts (`ya1xhg-x6.myshopify.com`)
**Migration:** `3d9876af-885c-49e9-a4b0-c4943c06112f`
**Generated:** 2026-06-13T15:40:44.952Z
**Context:** Post-PR49 menu deploy audit (`menu-cleanup-pass`)
**Mode:** READ ONLY — no menus deleted

## Executive summary

The store has **370 Shopify menus**. PR49 created four production-quality deploy menus (`*-deploy`) but **only `main-menu` is wired to the theme**. The header still uses a single Swedish mega-menu (`Huvudmeny`, 41 items) that duplicates content now split across deploy menus.

### Counts

| Metric | Count |
|---|---:|
| **Total menus** | 370 |
| **Active menus** (items > 0) | 9 |
| **Duplicate menus** (numbered migration retries) | 359 |
| **Safe-to-delete menus** (not theme-linked) | 360 |
| **Theme-linked menus** | 1 |
| **Empty menus** | 361 |
| **Migration test menus** | 357 |
| **Target production menus** | 8 |
| **Recommended deletion list** | 360 |

### Root cause (why structure looks wrong)

1. **Menu limit retries** during ActionKing → EUDroneParts migration created **357 numbered duplicates** (`actionkameror-1…119`, `dronare-1…119`, `partnership-1…119`).
2. **PR49 deploy menus** exist with correct IA but are **orphans** — not assigned in theme navigation.
3. **`main-menu`** remains the only theme reference and still embeds consumer + enterprise + spare parts + accessories in one Swedish tree.
4. **Legacy empty canonicals** (`actionkameror`, `dronare`, `partnership`, `meny`) were kept by dedup logic but have **0 items**.

---

## Target production architecture (8 menus)

| target_menu | current_handle | proposed_handle | proposed_title | action | notes |
| --- | --- | --- | --- | --- | --- |
| Main Menu | main-menu | main-menu | Main Menu | KEEP | Only menu linked in theme (`sections/header-group.json`). Slim down to consumer drones + top-level links; remove embedded spare-parts/enterprise trees. |
| Enterprise Drones | enterprise-expansion-deploy | enterprise-drones | Enterprise Drones | KEEP | Rename from `enterprise-expansion-deploy`. Merge useful links from legacy `enterprise-dr-nare`. Wire into header mega-menu. |
| Spare Parts | spare-parts-deploy | spare-parts | Spare Parts | KEEP | Rename from `spare-parts-deploy`. 47 items — production-ready model-family tree (PR49). |
| Service & Support | service-support-deploy | service-support | Service & Support | KEEP | Rename from `service-support-deploy`. 14 items incl. DJI service subtree. |
| Partnership | partnership | partnership | Partnership | KEEP | Canonical handle kept but menu is empty — repopulate from `/pages/partnerprogram` + apply pages. |
| B2B Enterprise | b2b-enterprise-deploy | b2b-enterprise | B2B Enterprise | KEEP | Rename from `b2b-enterprise-deploy`. Industry verticals + account/quote/leasing pages. |
| Footer Menu | footer | footer | Footer Menu | KEEP | Rename title from Sidfotsmeny. Expand beyond single All products link. |
| Customer Account | customer-account-main-menu | customer-account-main-menu | Customer Account | KEEP | Shopify customer account menu. Rename title from Swedish. |


### Recommended header wiring (after cleanup)

```
Main Menu          → main-menu              (consumer drones, accessories entry points)
Enterprise Drones  → enterprise-drones      (from enterprise-expansion-deploy)
Spare Parts        → spare-parts            (from spare-parts-deploy)
Service & Support  → service-support        (from service-support-deploy)
Partnership        → partnership
B2B Enterprise     → b2b-enterprise         (from b2b-enterprise-deploy)
Footer Menu        → footer
Customer Account   → customer-account-main-menu
```

---

## SECTION 1 — Full menu inventory

For every live menu:

| menu_name | handle | items | theme | referenced | swedish_name | group | flags | recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Huvudmeny | main-menu | 41 | YES | YES | YES | KEEP | migration-db | Only menu linked in theme (`sections/header-group.json`). Slim down to consumer drones + top-level links; remove embedded spare-parts/enterprise trees. |
| Sidfotsmeny | footer | 1 | NO | YES | YES | KEEP | migration-db | Rename title from Sidfotsmeny. Expand beyond single All products link. |
| Huvudmeny för kundkonto | customer-account-main-menu | 2 | NO | YES | YES | KEEP | migration-db | Shopify customer account menu. Rename title from Swedish. |
| Enterprise Drönare | enterprise-dr-nare | 7 | NO | YES | YES | MERGE | migration-db | Merge into `enterprise-expansion-deploy` → `enterprise-drones` |
| Huvudmeny | meny | 0 | NO | YES | YES | MERGE | empty, migration-db | Duplicate title of `main-menu` — consolidate |
| Actionkameror | actionkameror | 0 | NO | YES | YES | DELETE | empty, migration-db | Legacy/test/duplicate — not in target production set |
| Drönare | dronare | 0 | NO | YES | YES | DELETE | empty, migration-db | Legacy/test/duplicate — not in target production set |
| Partnership | partnership | 0 | NO | YES | NO | KEEP | empty, migration-db | Canonical handle kept but menu is empty — repopulate from `/pages/partnerprogram` + apply pages. |
| Actionkameror | actionkameror-1 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-1 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-1 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-2 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-2 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-2 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-3 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-3 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-3 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-4 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-4 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-4 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-5 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-5 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-5 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-6 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-6 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-6 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-7 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-7 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-7 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-8 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-8 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-8 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-9 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-9 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-9 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-10 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-10 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-10 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-11 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-11 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-11 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-12 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-12 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-12 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-13 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-13 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-13 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-14 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-14 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-14 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-15 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-15 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-15 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-16 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-16 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-16 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-17 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-17 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-17 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-18 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-18 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-18 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-19 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-19 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-19 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-20 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-20 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-20 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-21 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-21 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-21 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-22 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-22 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-22 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-23 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-23 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-23 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-24 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-24 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-24 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-25 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-25 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-25 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-26 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-26 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-26 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-27 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-27 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-27 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-28 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-28 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-28 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-29 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-29 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-29 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-30 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-30 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-30 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-31 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-31 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-31 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-32 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-32 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-32 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-33 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-33 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-33 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-34 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-34 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-34 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-35 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-35 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-35 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-36 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-36 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-36 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-37 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-37 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-37 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-38 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-38 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-38 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-39 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-39 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-39 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| TEST Menu Delete | _test-menu-delete-me | 1 | NO | YES | NO | DELETE | orphan | Legacy/test/duplicate — not in target production set |
| Actionkameror | actionkameror-40 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-40 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-40 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Enterprise Expansion | enterprise-expansion-deploy | 9 | NO | YES | NO | KEEP | orphan | Rename from `enterprise-expansion-deploy`. Merge useful links from legacy `enterprise-dr-nare`. Wire into header mega-menu. |
| Reservdelar | spare-parts-deploy | 47 | NO | YES | YES | KEEP | orphan | Rename from `spare-parts-deploy`. 47 items — production-ready model-family tree (PR49). |
| Service & Support | service-support-deploy | 14 | NO | YES | NO | KEEP | orphan | Rename from `service-support-deploy`. 14 items incl. DJI service subtree. |
| Enterprise & B2B | b2b-enterprise-deploy | 20 | NO | YES | NO | KEEP | orphan | Rename from `b2b-enterprise-deploy`. Industry verticals + account/quote/leasing pages. |
| Actionkameror | actionkameror-41 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-41 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-41 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-42 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-42 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-42 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-43 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-43 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-43 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-44 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-44 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-44 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-45 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-45 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-45 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-46 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-46 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-46 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-47 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-47 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-47 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-48 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-48 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-48 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-49 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-49 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-49 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-50 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-50 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-50 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-51 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-51 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-51 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-52 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-52 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-52 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-53 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-53 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-53 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-54 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-54 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-54 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Drönare | dronare-55 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-55 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-55 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-56 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-56 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-56 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-57 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-57 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-57 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-58 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-58 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-58 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-59 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-59 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-59 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-60 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-60 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-60 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-61 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-61 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-61 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-62 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-62 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-62 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-63 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-63 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-63 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-64 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-64 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-64 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-65 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-65 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-65 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-66 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-66 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-66 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-67 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-67 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-67 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-68 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-68 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-68 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-69 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-69 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-69 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-70 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-70 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-70 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-71 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-71 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-71 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-72 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-72 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-72 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-73 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-73 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-73 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-74 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-74 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-74 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-75 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-75 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-75 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-76 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-76 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-76 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-77 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-77 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-77 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-78 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-78 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-78 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-79 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-79 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-79 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-80 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-80 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-80 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-81 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-81 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-81 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-82 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-82 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-82 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-83 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-83 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-83 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-84 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-84 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-84 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-85 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-85 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-85 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-86 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-86 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-86 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Partnership | partnership-87 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-87 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-87 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-88 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-88 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-88 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-89 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-89 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-89 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-90 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-90 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-90 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-91 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-91 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-91 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-92 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-92 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-92 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-93 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-93 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-93 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-94 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-94 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-94 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-95 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-95 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-95 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-96 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-96 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-96 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-97 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-97 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-97 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-98 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-98 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-98 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-99 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-99 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-99 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-100 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-100 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-100 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-101 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-101 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-101 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-102 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-102 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-102 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-103 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-103 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-103 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-104 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-104 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-104 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-105 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-105 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-105 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-106 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-106 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-106 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-107 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-107 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-107 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-108 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-108 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-108 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-109 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-109 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-109 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-110 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-110 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-110 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-111 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-111 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-111 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-112 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-112 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-112 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-113 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-113 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-113 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-114 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-114 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-114 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-115 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-115 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-115 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-116 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-116 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-116 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-117 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-117 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-117 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-118 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-118 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-118 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |
| Partnership | partnership-119 | 0 | NO | NO | NO | DELETE | empty, orphan, migration-test | Duplicate of canonical `partnership` (duplicate title "partnership") |
| Actionkameror | actionkameror-119 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `actionkameror` (duplicate title "actionkameror") |
| Drönare | dronare-119 | 0 | NO | NO | YES | DELETE | empty, orphan, migration-test | Duplicate of canonical `dronare` (duplicate title "drönare") |


---

## SECTION 2 — KEEP

8 menus map to the production architecture:

| menu_name | handle | items | theme | referenced | recommendation |
| --- | --- | --- | --- | --- | --- |
| Huvudmeny | main-menu | 41 | YES | YES | Only menu linked in theme (`sections/header-group.json`). Slim down to consumer drones + top-level links; remove embedded spare-parts/enterprise trees. |
| Sidfotsmeny | footer | 1 | NO | YES | Rename title from Sidfotsmeny. Expand beyond single All products link. |
| Huvudmeny för kundkonto | customer-account-main-menu | 2 | NO | YES | Shopify customer account menu. Rename title from Swedish. |
| Partnership | partnership | 0 | NO | YES | Canonical handle kept but menu is empty — repopulate from `/pages/partnerprogram` + apply pages. |
| Enterprise Expansion | enterprise-expansion-deploy | 9 | NO | YES | Rename from `enterprise-expansion-deploy`. Merge useful links from legacy `enterprise-dr-nare`. Wire into header mega-menu. |
| Reservdelar | spare-parts-deploy | 47 | NO | YES | Rename from `spare-parts-deploy`. 47 items — production-ready model-family tree (PR49). |
| Service & Support | service-support-deploy | 14 | NO | YES | Rename from `service-support-deploy`. 14 items incl. DJI service subtree. |
| Enterprise & B2B | b2b-enterprise-deploy | 20 | NO | YES | Rename from `b2b-enterprise-deploy`. Industry verticals + account/quote/leasing pages. |


---

## SECTION 3 — MERGE

| menu_name | handle | items | theme | referenced | recommendation |
| --- | --- | --- | --- | --- | --- |
| Enterprise Drönare | enterprise-dr-nare | 7 | NO | YES | Merge into `enterprise-expansion-deploy` → `enterprise-drones` |
| Huvudmeny | meny | 0 | NO | YES | Duplicate title of `main-menu` — consolidate |


---

## SECTION 4 — RENAME

Menus to keep but rename handle and/or title to English production names:

| menu_name | handle | items | theme | referenced | proposed | recommendation |
| --- | --- | --- | --- | --- | --- | --- |
| Huvudmeny | main-menu | 41 | YES | YES |  | Only menu linked in theme (`sections/header-group.json`). Slim down to consumer drones + top-level links; remove embedded spare-parts/enterprise trees. |
| Sidfotsmeny | footer | 1 | NO | YES |  | Rename title from Sidfotsmeny. Expand beyond single All products link. |
| Huvudmeny för kundkonto | customer-account-main-menu | 2 | NO | YES |  | Shopify customer account menu. Rename title from Swedish. |
| Enterprise Expansion | enterprise-expansion-deploy | 9 | NO | YES |  | Rename from `enterprise-expansion-deploy`. Merge useful links from legacy `enterprise-dr-nare`. Wire into header mega-menu. |
| Reservdelar | spare-parts-deploy | 47 | NO | YES |  | Rename from `spare-parts-deploy`. 47 items — production-ready model-family tree (PR49). |
| Service & Support | service-support-deploy | 14 | NO | YES |  | Rename from `service-support-deploy`. 14 items incl. DJI service subtree. |
| Enterprise & B2B | b2b-enterprise-deploy | 20 | NO | YES |  | Rename from `b2b-enterprise-deploy`. Industry verticals + account/quote/leasing pages. |
| Enterprise Expansion | enterprise-expansion-deploy | 9 | NO | YES | enterprise-drones / "Enterprise Drones" | Rename from `enterprise-expansion-deploy`. Merge useful links from legacy `enterprise-dr-nare`. Wire into header mega-menu. |
| Reservdelar | spare-parts-deploy | 47 | NO | YES | spare-parts / "Spare Parts" | Rename from `spare-parts-deploy`. 47 items — production-ready model-family tree (PR49). |
| Service & Support | service-support-deploy | 14 | NO | YES | service-support / "Service & Support" | Rename from `service-support-deploy`. 14 items incl. DJI service subtree. |
| Enterprise & B2B | b2b-enterprise-deploy | 20 | NO | YES | b2b-enterprise / "B2B Enterprise" | Rename from `b2b-enterprise-deploy`. Industry verticals + account/quote/leasing pages. |


---

## SECTION 5 — DELETE

**360 menus** recommended for deletion after rollback export and theme confirmation.

### Final deletion list (handles)

```
_test-menu-delete-me
actionkameror
actionkameror-1
actionkameror-10
actionkameror-100
actionkameror-101
actionkameror-102
actionkameror-103
actionkameror-104
actionkameror-105
actionkameror-106
actionkameror-107
actionkameror-108
actionkameror-109
actionkameror-11
actionkameror-110
actionkameror-111
actionkameror-112
actionkameror-113
actionkameror-114
actionkameror-115
actionkameror-116
actionkameror-117
actionkameror-118
actionkameror-119
actionkameror-12
actionkameror-13
actionkameror-14
actionkameror-15
actionkameror-16
actionkameror-17
actionkameror-18
actionkameror-19
actionkameror-2
actionkameror-20
actionkameror-21
actionkameror-22
actionkameror-23
actionkameror-24
actionkameror-25
actionkameror-26
actionkameror-27
actionkameror-28
actionkameror-29
actionkameror-3
actionkameror-30
actionkameror-31
actionkameror-32
actionkameror-33
actionkameror-34
actionkameror-35
actionkameror-36
actionkameror-37
actionkameror-38
actionkameror-39
actionkameror-4
actionkameror-40
actionkameror-41
actionkameror-42
actionkameror-43
actionkameror-44
actionkameror-45
actionkameror-46
actionkameror-47
actionkameror-48
actionkameror-49
actionkameror-5
actionkameror-50
actionkameror-51
actionkameror-52
actionkameror-53
actionkameror-54
actionkameror-55
actionkameror-56
actionkameror-57
actionkameror-58
actionkameror-59
actionkameror-6
actionkameror-60
actionkameror-61
actionkameror-62
actionkameror-63
actionkameror-64
actionkameror-65
actionkameror-66
actionkameror-67
actionkameror-68
actionkameror-69
actionkameror-7
actionkameror-70
actionkameror-71
actionkameror-72
actionkameror-73
actionkameror-74
actionkameror-75
actionkameror-76
actionkameror-77
actionkameror-78
actionkameror-79
actionkameror-8
actionkameror-80
actionkameror-81
actionkameror-82
actionkameror-83
actionkameror-84
actionkameror-85
actionkameror-86
actionkameror-87
actionkameror-88
actionkameror-89
actionkameror-9
actionkameror-90
actionkameror-91
actionkameror-92
actionkameror-93
actionkameror-94
actionkameror-95
actionkameror-96
actionkameror-97
actionkameror-98
actionkameror-99
dronare
dronare-1
dronare-10
dronare-100
dronare-101
dronare-102
dronare-103
dronare-104
dronare-105
dronare-106
dronare-107
dronare-108
dronare-109
dronare-11
dronare-110
dronare-111
dronare-112
dronare-113
dronare-114
dronare-115
dronare-116
dronare-117
dronare-118
dronare-119
dronare-12
dronare-13
dronare-14
dronare-15
dronare-16
dronare-17
dronare-18
dronare-19
dronare-2
dronare-20
dronare-21
dronare-22
dronare-23
dronare-24
dronare-25
dronare-26
dronare-27
dronare-28
dronare-29
dronare-3
dronare-30
dronare-31
dronare-32
dronare-33
dronare-34
dronare-35
dronare-36
dronare-37
dronare-38
dronare-39
dronare-4
dronare-40
dronare-41
dronare-42
dronare-43
dronare-44
dronare-45
dronare-46
dronare-47
dronare-48
dronare-49
dronare-5
dronare-50
dronare-51
dronare-52
dronare-53
dronare-54
dronare-55
dronare-56
dronare-57
dronare-58
dronare-59
dronare-6
dronare-60
dronare-61
dronare-62
dronare-63
dronare-64
dronare-65
dronare-66
dronare-67
dronare-68
dronare-69
dronare-7
dronare-70
dronare-71
dronare-72
dronare-73
dronare-74
dronare-75
dronare-76
dronare-77
dronare-78
dronare-79
dronare-8
dronare-80
dronare-81
dronare-82
dronare-83
dronare-84
dronare-85
dronare-86
dronare-87
dronare-88
dronare-89
dronare-9
dronare-90
dronare-91
dronare-92
dronare-93
dronare-94
dronare-95
dronare-96
dronare-97
dronare-98
dronare-99
partnership-1
partnership-10
partnership-100
partnership-101
partnership-102
partnership-103
partnership-104
partnership-105
partnership-106
partnership-107
partnership-108
partnership-109
partnership-11
partnership-110
partnership-111
partnership-112
partnership-113
partnership-114
partnership-115
partnership-116
partnership-117
partnership-118
partnership-119
partnership-12
partnership-13
partnership-14
partnership-15
partnership-16
partnership-17
partnership-18
partnership-19
partnership-2
partnership-20
partnership-21
partnership-22
partnership-23
partnership-24
partnership-25
partnership-26
partnership-27
partnership-28
partnership-29
partnership-3
partnership-30
partnership-31
partnership-32
partnership-33
partnership-34
partnership-35
partnership-36
partnership-37
partnership-38
partnership-39
partnership-4
partnership-40
partnership-41
partnership-42
partnership-43
partnership-44
partnership-45
partnership-46
partnership-47
partnership-48
partnership-49
partnership-5
partnership-50
partnership-51
partnership-52
partnership-53
partnership-54
partnership-55
partnership-56
partnership-57
partnership-58
partnership-59
partnership-6
partnership-60
partnership-61
partnership-62
partnership-63
partnership-64
partnership-65
partnership-66
partnership-67
partnership-68
partnership-69
partnership-7
partnership-70
partnership-71
partnership-72
partnership-73
partnership-74
partnership-75
partnership-76
partnership-77
partnership-78
partnership-79
partnership-8
partnership-80
partnership-81
partnership-82
partnership-83
partnership-84
partnership-85
partnership-86
partnership-87
partnership-88
partnership-89
partnership-9
partnership-90
partnership-91
partnership-92
partnership-93
partnership-94
partnership-95
partnership-96
partnership-97
partnership-98
partnership-99
```

### Deletion list (handle + title)

| handle | menu_name | items | theme |
| --- | --- | --- | --- |
| actionkameror | Actionkameror | 0 | NO |
| dronare | Drönare | 0 | NO |
| actionkameror-1 | Actionkameror | 0 | NO |
| dronare-1 | Drönare | 0 | NO |
| partnership-1 | Partnership | 0 | NO |
| actionkameror-2 | Actionkameror | 0 | NO |
| dronare-2 | Drönare | 0 | NO |
| partnership-2 | Partnership | 0 | NO |
| actionkameror-3 | Actionkameror | 0 | NO |
| dronare-3 | Drönare | 0 | NO |
| partnership-3 | Partnership | 0 | NO |
| actionkameror-4 | Actionkameror | 0 | NO |
| dronare-4 | Drönare | 0 | NO |
| partnership-4 | Partnership | 0 | NO |
| actionkameror-5 | Actionkameror | 0 | NO |
| dronare-5 | Drönare | 0 | NO |
| partnership-5 | Partnership | 0 | NO |
| actionkameror-6 | Actionkameror | 0 | NO |
| dronare-6 | Drönare | 0 | NO |
| partnership-6 | Partnership | 0 | NO |
| actionkameror-7 | Actionkameror | 0 | NO |
| dronare-7 | Drönare | 0 | NO |
| partnership-7 | Partnership | 0 | NO |
| actionkameror-8 | Actionkameror | 0 | NO |
| dronare-8 | Drönare | 0 | NO |
| partnership-8 | Partnership | 0 | NO |
| actionkameror-9 | Actionkameror | 0 | NO |
| dronare-9 | Drönare | 0 | NO |
| partnership-9 | Partnership | 0 | NO |
| actionkameror-10 | Actionkameror | 0 | NO |
| dronare-10 | Drönare | 0 | NO |
| partnership-10 | Partnership | 0 | NO |
| actionkameror-11 | Actionkameror | 0 | NO |
| dronare-11 | Drönare | 0 | NO |
| partnership-11 | Partnership | 0 | NO |
| actionkameror-12 | Actionkameror | 0 | NO |
| dronare-12 | Drönare | 0 | NO |
| partnership-12 | Partnership | 0 | NO |
| actionkameror-13 | Actionkameror | 0 | NO |
| dronare-13 | Drönare | 0 | NO |
| partnership-13 | Partnership | 0 | NO |
| actionkameror-14 | Actionkameror | 0 | NO |
| dronare-14 | Drönare | 0 | NO |
| partnership-14 | Partnership | 0 | NO |
| actionkameror-15 | Actionkameror | 0 | NO |
| dronare-15 | Drönare | 0 | NO |
| partnership-15 | Partnership | 0 | NO |
| actionkameror-16 | Actionkameror | 0 | NO |
| dronare-16 | Drönare | 0 | NO |
| partnership-16 | Partnership | 0 | NO |
| actionkameror-17 | Actionkameror | 0 | NO |
| dronare-17 | Drönare | 0 | NO |
| partnership-17 | Partnership | 0 | NO |
| actionkameror-18 | Actionkameror | 0 | NO |
| dronare-18 | Drönare | 0 | NO |
| partnership-18 | Partnership | 0 | NO |
| actionkameror-19 | Actionkameror | 0 | NO |
| dronare-19 | Drönare | 0 | NO |
| partnership-19 | Partnership | 0 | NO |
| actionkameror-20 | Actionkameror | 0 | NO |
| dronare-20 | Drönare | 0 | NO |
| partnership-20 | Partnership | 0 | NO |
| actionkameror-21 | Actionkameror | 0 | NO |
| dronare-21 | Drönare | 0 | NO |
| partnership-21 | Partnership | 0 | NO |
| actionkameror-22 | Actionkameror | 0 | NO |
| dronare-22 | Drönare | 0 | NO |
| partnership-22 | Partnership | 0 | NO |
| actionkameror-23 | Actionkameror | 0 | NO |
| dronare-23 | Drönare | 0 | NO |
| partnership-23 | Partnership | 0 | NO |
| actionkameror-24 | Actionkameror | 0 | NO |
| dronare-24 | Drönare | 0 | NO |
| partnership-24 | Partnership | 0 | NO |
| actionkameror-25 | Actionkameror | 0 | NO |
| dronare-25 | Drönare | 0 | NO |
| partnership-25 | Partnership | 0 | NO |
| actionkameror-26 | Actionkameror | 0 | NO |
| dronare-26 | Drönare | 0 | NO |
| partnership-26 | Partnership | 0 | NO |
| actionkameror-27 | Actionkameror | 0 | NO |
| dronare-27 | Drönare | 0 | NO |
| partnership-27 | Partnership | 0 | NO |
| actionkameror-28 | Actionkameror | 0 | NO |
| dronare-28 | Drönare | 0 | NO |
| partnership-28 | Partnership | 0 | NO |
| actionkameror-29 | Actionkameror | 0 | NO |
| dronare-29 | Drönare | 0 | NO |
| partnership-29 | Partnership | 0 | NO |
| actionkameror-30 | Actionkameror | 0 | NO |
| dronare-30 | Drönare | 0 | NO |
| partnership-30 | Partnership | 0 | NO |
| actionkameror-31 | Actionkameror | 0 | NO |
| dronare-31 | Drönare | 0 | NO |
| partnership-31 | Partnership | 0 | NO |
| actionkameror-32 | Actionkameror | 0 | NO |
| dronare-32 | Drönare | 0 | NO |
| partnership-32 | Partnership | 0 | NO |
| actionkameror-33 | Actionkameror | 0 | NO |
| dronare-33 | Drönare | 0 | NO |
| partnership-33 | Partnership | 0 | NO |
| actionkameror-34 | Actionkameror | 0 | NO |
| dronare-34 | Drönare | 0 | NO |
| partnership-34 | Partnership | 0 | NO |
| actionkameror-35 | Actionkameror | 0 | NO |
| dronare-35 | Drönare | 0 | NO |
| partnership-35 | Partnership | 0 | NO |
| actionkameror-36 | Actionkameror | 0 | NO |
| dronare-36 | Drönare | 0 | NO |
| partnership-36 | Partnership | 0 | NO |
| actionkameror-37 | Actionkameror | 0 | NO |
| dronare-37 | Drönare | 0 | NO |
| partnership-37 | Partnership | 0 | NO |
| actionkameror-38 | Actionkameror | 0 | NO |
| dronare-38 | Drönare | 0 | NO |
| partnership-38 | Partnership | 0 | NO |
| actionkameror-39 | Actionkameror | 0 | NO |
| dronare-39 | Drönare | 0 | NO |
| partnership-39 | Partnership | 0 | NO |
| _test-menu-delete-me | TEST Menu Delete | 1 | NO |
| actionkameror-40 | Actionkameror | 0 | NO |
| dronare-40 | Drönare | 0 | NO |
| partnership-40 | Partnership | 0 | NO |
| actionkameror-41 | Actionkameror | 0 | NO |
| dronare-41 | Drönare | 0 | NO |
| partnership-41 | Partnership | 0 | NO |
| actionkameror-42 | Actionkameror | 0 | NO |
| dronare-42 | Drönare | 0 | NO |
| partnership-42 | Partnership | 0 | NO |
| actionkameror-43 | Actionkameror | 0 | NO |
| dronare-43 | Drönare | 0 | NO |
| partnership-43 | Partnership | 0 | NO |
| actionkameror-44 | Actionkameror | 0 | NO |
| dronare-44 | Drönare | 0 | NO |
| partnership-44 | Partnership | 0 | NO |
| actionkameror-45 | Actionkameror | 0 | NO |
| dronare-45 | Drönare | 0 | NO |
| partnership-45 | Partnership | 0 | NO |
| actionkameror-46 | Actionkameror | 0 | NO |
| dronare-46 | Drönare | 0 | NO |
| partnership-46 | Partnership | 0 | NO |
| actionkameror-47 | Actionkameror | 0 | NO |
| dronare-47 | Drönare | 0 | NO |
| partnership-47 | Partnership | 0 | NO |
| actionkameror-48 | Actionkameror | 0 | NO |
| dronare-48 | Drönare | 0 | NO |
| partnership-48 | Partnership | 0 | NO |
| actionkameror-49 | Actionkameror | 0 | NO |
| dronare-49 | Drönare | 0 | NO |
| partnership-49 | Partnership | 0 | NO |
| actionkameror-50 | Actionkameror | 0 | NO |
| dronare-50 | Drönare | 0 | NO |
| partnership-50 | Partnership | 0 | NO |
| actionkameror-51 | Actionkameror | 0 | NO |
| dronare-51 | Drönare | 0 | NO |
| partnership-51 | Partnership | 0 | NO |
| actionkameror-52 | Actionkameror | 0 | NO |
| dronare-52 | Drönare | 0 | NO |
| partnership-52 | Partnership | 0 | NO |
| actionkameror-53 | Actionkameror | 0 | NO |
| dronare-53 | Drönare | 0 | NO |
| partnership-53 | Partnership | 0 | NO |
| actionkameror-54 | Actionkameror | 0 | NO |
| dronare-54 | Drönare | 0 | NO |
| partnership-54 | Partnership | 0 | NO |
| dronare-55 | Drönare | 0 | NO |
| partnership-55 | Partnership | 0 | NO |
| actionkameror-55 | Actionkameror | 0 | NO |
| dronare-56 | Drönare | 0 | NO |
| partnership-56 | Partnership | 0 | NO |
| actionkameror-56 | Actionkameror | 0 | NO |
| dronare-57 | Drönare | 0 | NO |
| partnership-57 | Partnership | 0 | NO |
| actionkameror-57 | Actionkameror | 0 | NO |
| dronare-58 | Drönare | 0 | NO |
| partnership-58 | Partnership | 0 | NO |
| actionkameror-58 | Actionkameror | 0 | NO |
| dronare-59 | Drönare | 0 | NO |
| partnership-59 | Partnership | 0 | NO |
| actionkameror-59 | Actionkameror | 0 | NO |
| dronare-60 | Drönare | 0 | NO |
| partnership-60 | Partnership | 0 | NO |
| actionkameror-60 | Actionkameror | 0 | NO |
| dronare-61 | Drönare | 0 | NO |
| partnership-61 | Partnership | 0 | NO |
| actionkameror-61 | Actionkameror | 0 | NO |
| dronare-62 | Drönare | 0 | NO |
| partnership-62 | Partnership | 0 | NO |
| actionkameror-62 | Actionkameror | 0 | NO |
| dronare-63 | Drönare | 0 | NO |
| partnership-63 | Partnership | 0 | NO |
| actionkameror-63 | Actionkameror | 0 | NO |
| dronare-64 | Drönare | 0 | NO |
| partnership-64 | Partnership | 0 | NO |
| actionkameror-64 | Actionkameror | 0 | NO |
| dronare-65 | Drönare | 0 | NO |
| partnership-65 | Partnership | 0 | NO |
| actionkameror-65 | Actionkameror | 0 | NO |
| dronare-66 | Drönare | 0 | NO |
| partnership-66 | Partnership | 0 | NO |
| actionkameror-66 | Actionkameror | 0 | NO |
| dronare-67 | Drönare | 0 | NO |
| partnership-67 | Partnership | 0 | NO |
| actionkameror-67 | Actionkameror | 0 | NO |
| dronare-68 | Drönare | 0 | NO |
| partnership-68 | Partnership | 0 | NO |
| actionkameror-68 | Actionkameror | 0 | NO |
| dronare-69 | Drönare | 0 | NO |
| partnership-69 | Partnership | 0 | NO |
| actionkameror-69 | Actionkameror | 0 | NO |
| dronare-70 | Drönare | 0 | NO |
| partnership-70 | Partnership | 0 | NO |
| actionkameror-70 | Actionkameror | 0 | NO |
| dronare-71 | Drönare | 0 | NO |
| partnership-71 | Partnership | 0 | NO |
| actionkameror-71 | Actionkameror | 0 | NO |
| dronare-72 | Drönare | 0 | NO |
| partnership-72 | Partnership | 0 | NO |
| actionkameror-72 | Actionkameror | 0 | NO |
| dronare-73 | Drönare | 0 | NO |
| partnership-73 | Partnership | 0 | NO |
| actionkameror-73 | Actionkameror | 0 | NO |
| dronare-74 | Drönare | 0 | NO |
| partnership-74 | Partnership | 0 | NO |
| actionkameror-74 | Actionkameror | 0 | NO |
| dronare-75 | Drönare | 0 | NO |
| partnership-75 | Partnership | 0 | NO |
| actionkameror-75 | Actionkameror | 0 | NO |
| dronare-76 | Drönare | 0 | NO |
| partnership-76 | Partnership | 0 | NO |
| actionkameror-76 | Actionkameror | 0 | NO |
| dronare-77 | Drönare | 0 | NO |
| partnership-77 | Partnership | 0 | NO |
| actionkameror-77 | Actionkameror | 0 | NO |
| dronare-78 | Drönare | 0 | NO |
| partnership-78 | Partnership | 0 | NO |
| actionkameror-78 | Actionkameror | 0 | NO |
| dronare-79 | Drönare | 0 | NO |
| partnership-79 | Partnership | 0 | NO |
| actionkameror-79 | Actionkameror | 0 | NO |
| dronare-80 | Drönare | 0 | NO |
| partnership-80 | Partnership | 0 | NO |
| actionkameror-80 | Actionkameror | 0 | NO |
| dronare-81 | Drönare | 0 | NO |
| partnership-81 | Partnership | 0 | NO |
| actionkameror-81 | Actionkameror | 0 | NO |
| dronare-82 | Drönare | 0 | NO |
| partnership-82 | Partnership | 0 | NO |
| actionkameror-82 | Actionkameror | 0 | NO |
| dronare-83 | Drönare | 0 | NO |
| partnership-83 | Partnership | 0 | NO |
| actionkameror-83 | Actionkameror | 0 | NO |
| dronare-84 | Drönare | 0 | NO |
| partnership-84 | Partnership | 0 | NO |
| actionkameror-84 | Actionkameror | 0 | NO |
| dronare-85 | Drönare | 0 | NO |
| partnership-85 | Partnership | 0 | NO |
| actionkameror-85 | Actionkameror | 0 | NO |
| dronare-86 | Drönare | 0 | NO |
| partnership-86 | Partnership | 0 | NO |
| actionkameror-86 | Actionkameror | 0 | NO |
| partnership-87 | Partnership | 0 | NO |
| actionkameror-87 | Actionkameror | 0 | NO |
| dronare-87 | Drönare | 0 | NO |
| partnership-88 | Partnership | 0 | NO |
| actionkameror-88 | Actionkameror | 0 | NO |
| dronare-88 | Drönare | 0 | NO |
| partnership-89 | Partnership | 0 | NO |
| actionkameror-89 | Actionkameror | 0 | NO |
| dronare-89 | Drönare | 0 | NO |
| partnership-90 | Partnership | 0 | NO |
| actionkameror-90 | Actionkameror | 0 | NO |
| dronare-90 | Drönare | 0 | NO |
| partnership-91 | Partnership | 0 | NO |
| actionkameror-91 | Actionkameror | 0 | NO |
| dronare-91 | Drönare | 0 | NO |
| partnership-92 | Partnership | 0 | NO |
| actionkameror-92 | Actionkameror | 0 | NO |
| dronare-92 | Drönare | 0 | NO |
| partnership-93 | Partnership | 0 | NO |
| actionkameror-93 | Actionkameror | 0 | NO |
| dronare-93 | Drönare | 0 | NO |
| partnership-94 | Partnership | 0 | NO |
| actionkameror-94 | Actionkameror | 0 | NO |
| dronare-94 | Drönare | 0 | NO |
| partnership-95 | Partnership | 0 | NO |
| actionkameror-95 | Actionkameror | 0 | NO |
| dronare-95 | Drönare | 0 | NO |
| partnership-96 | Partnership | 0 | NO |
| actionkameror-96 | Actionkameror | 0 | NO |
| dronare-96 | Drönare | 0 | NO |
| partnership-97 | Partnership | 0 | NO |
| actionkameror-97 | Actionkameror | 0 | NO |
| dronare-97 | Drönare | 0 | NO |
| partnership-98 | Partnership | 0 | NO |
| actionkameror-98 | Actionkameror | 0 | NO |
| dronare-98 | Drönare | 0 | NO |
| partnership-99 | Partnership | 0 | NO |
| actionkameror-99 | Actionkameror | 0 | NO |
| dronare-99 | Drönare | 0 | NO |
| partnership-100 | Partnership | 0 | NO |
| actionkameror-100 | Actionkameror | 0 | NO |
| dronare-100 | Drönare | 0 | NO |
| partnership-101 | Partnership | 0 | NO |
| actionkameror-101 | Actionkameror | 0 | NO |
| dronare-101 | Drönare | 0 | NO |
| partnership-102 | Partnership | 0 | NO |
| actionkameror-102 | Actionkameror | 0 | NO |
| dronare-102 | Drönare | 0 | NO |
| partnership-103 | Partnership | 0 | NO |
| actionkameror-103 | Actionkameror | 0 | NO |
| dronare-103 | Drönare | 0 | NO |
| partnership-104 | Partnership | 0 | NO |
| actionkameror-104 | Actionkameror | 0 | NO |
| dronare-104 | Drönare | 0 | NO |
| partnership-105 | Partnership | 0 | NO |
| actionkameror-105 | Actionkameror | 0 | NO |
| dronare-105 | Drönare | 0 | NO |
| partnership-106 | Partnership | 0 | NO |
| actionkameror-106 | Actionkameror | 0 | NO |
| dronare-106 | Drönare | 0 | NO |
| partnership-107 | Partnership | 0 | NO |
| actionkameror-107 | Actionkameror | 0 | NO |
| dronare-107 | Drönare | 0 | NO |
| partnership-108 | Partnership | 0 | NO |
| actionkameror-108 | Actionkameror | 0 | NO |
| dronare-108 | Drönare | 0 | NO |
| partnership-109 | Partnership | 0 | NO |
| actionkameror-109 | Actionkameror | 0 | NO |
| dronare-109 | Drönare | 0 | NO |
| partnership-110 | Partnership | 0 | NO |
| actionkameror-110 | Actionkameror | 0 | NO |
| dronare-110 | Drönare | 0 | NO |
| partnership-111 | Partnership | 0 | NO |
| actionkameror-111 | Actionkameror | 0 | NO |
| dronare-111 | Drönare | 0 | NO |
| partnership-112 | Partnership | 0 | NO |
| actionkameror-112 | Actionkameror | 0 | NO |
| dronare-112 | Drönare | 0 | NO |
| partnership-113 | Partnership | 0 | NO |
| actionkameror-113 | Actionkameror | 0 | NO |
| dronare-113 | Drönare | 0 | NO |
| partnership-114 | Partnership | 0 | NO |
| actionkameror-114 | Actionkameror | 0 | NO |
| dronare-114 | Drönare | 0 | NO |
| partnership-115 | Partnership | 0 | NO |
| actionkameror-115 | Actionkameror | 0 | NO |
| dronare-115 | Drönare | 0 | NO |
| partnership-116 | Partnership | 0 | NO |
| actionkameror-116 | Actionkameror | 0 | NO |
| dronare-116 | Drönare | 0 | NO |
| partnership-117 | Partnership | 0 | NO |
| actionkameror-117 | Actionkameror | 0 | NO |
| dronare-117 | Drönare | 0 | NO |
| partnership-118 | Partnership | 0 | NO |
| actionkameror-118 | Actionkameror | 0 | NO |
| dronare-118 | Drönare | 0 | NO |
| partnership-119 | Partnership | 0 | NO |
| actionkameror-119 | Actionkameror | 0 | NO |
| dronare-119 | Drönare | 0 | NO |


---

## SECTION 6 — Issue breakdown

### 1. Duplicate menus

| Duplicate group | Canonical (automated) | Copies | Production recommendation |
|---|---|---:|---|
| Huvudmeny | `main-menu` | 1 (`meny`) | Keep `main-menu`, delete `meny` |
| Actionkameror | `actionkameror` | 119 | Delete all — EUActionCam scope, not EDP |
| Drönare | `dronare` | 119 | Delete all — legacy ActionKing retry artifacts |
| Partnership | `partnership` | 119 | Keep single `partnership`, delete 119 empty copies |

### 2. Empty menus

361 menus have 0 items. All are safe to delete except none are required for production.

### 3. Legacy menus

| Handle | Title | Items | Notes |
|---|---|---:|---|
| `actionkameror` | Actionkameror | 0 | ActionKing action-camera scope |
| `dronare` | Drönare | 0 | Legacy ActionKing drone menu |
| `meny` | Huvudmeny | 0 | Duplicate main menu from migration |
| `enterprise-dr-nare` | Enterprise Drönare | 7 | Superseded by `enterprise-expansion-deploy` |
| `vandring-outdoor` | Vandring & outdoor | 0 | Not in current inventory — already pruned |

### 4. Test menus

| Handle | Title | Items |
|---|---|---:|
| `_test-menu-delete-me` | TEST Menu Delete | 1 |

Plus **357** numbered `actionkameror-N`, `dronare-N`, `partnership-N` migration test menus.

### 5. Menus with no active references

357 menus are not referenced by theme, migration essentials, or meaningful content.

Notable orphans with content (PR49 deploy — should be **wired**, not deleted):

| Handle | Title | Items |
|---|---|---:|
| `enterprise-expansion-deploy` | Enterprise Expansion | 9 |
| `spare-parts-deploy` | Reservdelar | 47 |
| `service-support-deploy` | Service & Support | 14 |
| `b2b-enterprise-deploy` | Enterprise & B2B | 20 |

### 6. Swedish menu names

246 menus use Swedish titles. Production target uses English titles only.

| Current title | Handle | Target English title |
|---|---|---|
| Huvudmeny | main-menu | Main Menu |
| Sidfotsmeny | footer | Footer Menu |
| Huvudmeny för kundkonto | customer-account-main-menu | Customer Account |
| Enterprise Drönare | enterprise-dr-nare | Enterprise Drones (merge then delete) |
| Reservdelar | spare-parts-deploy | Spare Parts |

### 7. Menus not linked from theme navigation

Only **`main-menu`** is referenced in theme (`sections/header-group.json`).

All PR49 deploy menus and footer are **not theme-linked** — this is the primary reason navigation appears incorrect.

---

## SECTION 7 — PR49 deploy menu content (production-ready)

### `enterprise-expansion-deploy` → rename `enterprise-drones` (9 items)

Matrice 300 RTK, Matrice 3D, Matrice 3TD, Mavic 3 Thermal, Agras T40/T50, FlyCart 30, Dock 2, Dock 3

### `spare-parts-deploy` → rename `spare-parts` (47 items)

Model-family spare parts trees: Mini 4 Pro, Air 3, Matrice 4, Matrice 350 RTK, Mavic 3 Enterprise, FlyCart 30 — each with propellers, batteries, motors, arms, cameras, gimbal, shells, landing gear, cables, antennas, sensors, accessories.

### `service-support-deploy` → rename `service-support` (14 items)

Service hub + DJI Service subtree (troubleshooting, repair, calibration, battery test, firmware, warranty, RMA, service request, support) + Enterprise/FlyCart/Matrice service pages.

### `b2b-enterprise-deploy` → rename `b2b-enterprise` (20 items)

Industry verticals (energy, wind, solar, grid, forestry, agriculture, mapping, construction, security/rescue, transport) + B2B services (business account, quote request, leasing, financing, service/support agreements, training, partner program).

---

## SECTION 8 — Safe execution order (not performed)

1. Export rollback: `EURODRONEPARTS_MENU_CLEANUP_ROLLBACK.json` (already generated by SAFE audit).
2. Rename 4 `*-deploy` menus to production handles.
3. Repopulate empty `partnership` menu.
4. Slim `main-menu` to consumer-focused links; link to dedicated menus.
5. Assign all 8 menus in theme header/footer settings.
6. Delete 362 orphan/duplicate menus via `node scripts/menu-cleanup-audit.mjs --execute --confirm-delete` (after review).

## Data sources

- `node scripts/menu-cleanup-audit.mjs` → `.menu-cleanup-audit.json`
- `menu-cleanup-pass` edge function (deployed post-PR49)
- Live Shopify Admin GraphQL via `test-integration`

## Guardrails

- **No deletion performed**
- **No menu edits performed**
- **No theme changes performed**
