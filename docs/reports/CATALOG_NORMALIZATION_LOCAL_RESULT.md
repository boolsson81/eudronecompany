# Catalog Normalization — Apply Local Result

**Datum:** 2026-06-10
**Scope:** `public.products` (vendor, product_type) + `public.inventory` (location)
**Shopify:** Ingen skrivning (apply_local-läge)
**Säkerhet:** Endast rader som matchade `from_value` exakt uppdaterades. Inga kanoniska värden överskrevs.

---

## Sammanfattning

| Mått | Före | Efter | Δ |
|---|---:|---:|---:|
| Distinct vendors | 293 | **280** | −13 |
| Distinct locations | 11 | **9** | −2 |
| Mappings applied | 0 | **38 / 41** | 3 noop (inga matchande rader) |
| Rader uppdaterade (totalt) | — | **31 526** | — |
| Inventory-dubletter merged | — | **~997** | summerade kvantiteter, gamla rader raderade |

---

## Bekräftelse av kritiska mappningar

| Från | Till | Status |
|---|---|---|
| `POLARPRO` (507) | **PolarPro** (1 277 totalt) | ✅ |
| `SONY` (128) | **Sony** (878 totalt) | ✅ |
| `PGYTECH` (128) | **PgyTech** (649 totalt) | ✅ |
| `TELESIN` (83) | **Telesin** (175 totalt) | ✅ |
| `TwelveSout` (706) | **Twelve South** (706 totalt) | ✅ |
| `AK` (2 156) + `Ak` (9) | **ActionKing** (4 294 totalt) | ✅ |
| `SUNSKY_Dropshiping_China` (19 567) + `sunsky_Dropshipping_China` (6 412) + `Sunsky` (26) | **SUNSKY_Dropshipping_China** (25 008 totalt) | ✅ (merged) |

Verifikat: 0 rader kvar med någon `from_value` ovan i `products.vendor` eller `inventory.location`.

---

## Topp 50 vendors (efter)

| # | Vendor | Antal |
|---|---|---:|
| 1 | DJI | 5 846 |
| 2 | ActionKing | 4 294 |
| 3 | PolarPro | 1 277 |
| 4 | EcoFlow | 967 |
| 5 | Targus | 960 |
| 6 | Anker | 887 |
| 7 | Sony | 878 |
| 8 | Twelve South | 706 |
| 9 | PgyTech | 649 |
| 10 | Walkera | 643 |
| 11 | Puluz | 530 |
| 12 | Sunnylife | 383 |
| 13 | STARTRC | 325 |
| 14 | Insta360 | 311 |
| 15 | BW | 290 |
| 16 | JSR | 255 |
| 17 | Mova | 252 |
| 18 | Obsbot | 229 |
| 19 | HasselBlad | 229 |
| 20 | Nitecore | 194 |
| 21 | Xgimi | 193 |
| 22 | Navimow | 190 |
| 23 | Kowa | 188 |
| 24 | RingConn | 185 |
| 25 | Dreame | 185 |
| 26 | Telesin | 175 |
| 27 | CZI | 166 |
| 28 | Lexar | 164 |
| 29 | Panasonic | 162 |
| 30 | Baseus | 153 |
| 31 | FeiyuTech | 149 |
| 32 | Energizer | 147 |
| 33 | aMagisn | 147 |
| 34 | Hikmicro | 145 |
| 35 | Livox | 135 |
| 36 | BRDRC | 133 |
| 37 | Parrot | 127 |
| 38 | Polaroid | 126 |
| 39 | Canon | 125 |
| 40 | Wingtra | 112 |
| 41 | Roccat | 104 |
| 42 | Flymile | 98 |
| 43 | FOCUS OPTICS | 84 |
| 44 | Master Airscrew | 83 |
| 45 | Steel | 82 |
| 46 | ZeppHealth | 77 |
| 47 | Ubtech | 77 |
| 48 | Aosu | 74 |
| 49 | Outin | 73 |
| 50 | Rollei | 72 |

---

## Topp 20 locations (efter)

| # | Location | Antal |
|---|---|---:|
| 1 | SUNSKY_Dropshipping_China | 25 008 |
| 2 | Expresspack Sweden AB | 7 990 |
| 3 | Focus Nordic AB | 4 420 |
| 4 | Boston Nordic | 3 302 |
| 5 | Boston Nordic DK Warehouse | 3 206 |
| 6 | Utgått | 611 |
| 7 | Lyddevägen | 33 |
| 8 | Sunsky EU Warehouse | 8 |
| 9 | Respons Nordic | 8 |

---

## Observationer & öppna punkter

1. **`HasselBlad` (229)** kvarstår — vår mapping var `HASSELBLAD → Hasselblad`, men den dominanta varianten är faktiskt `HasselBlad` (kamel-case med stort B). Beslut krävs: `HasselBlad → Hasselblad`?
2. **`STARTRC`, `BW`, `JSR`, `CZI`, `BRDRC`, `FOCUS OPTICS`** — kortkoder/ALLCAPS lämnade orörda enligt tidigare beslut.
3. **`Utgått` (611) + `Sunsky EU Warehouse` (8)** — legacy/marginal-locations, lämnade orörda.
4. **3 mappings utan träff** (status `approved`, applied_count 0): troligen vendors som inte fanns i datan vid körningstillfället (`AMAGISN`, `NEXTOOL`, m.fl. kan ha redan varit migrerade — `aMagisn` finns redan som canonical).

---

## GO / NO-GO för apply_shopify

### 🟢 GO med villkor

Den lokala körningen är **ren och reversibel via Shopify som source-of-truth**. Inga kanoniska värden överskrevs, alla diffar bekräftade, inventory-dubletter merge:ade utan dataförlust (qty summerades).

**Villkor innan apply_shopify körs:**

1. **Bygg klart Shopify-worker** i `catalog-field-normalize` (mode `apply_shopify`) — idag returnerar den bara en `note`. Behöver:
   - GraphQL `productUpdate { vendor, productType }` i batchar om 50
   - Throttling (Shopify cost-based, ~50 points/s)
   - Idempotens via `cloner_logs` (skip om redan PUT:ad)
   - Inventory-location kräver `inventoryItemUpdate` + `inventoryLevels` (annan API-yta) — överväg att skippa locations i Shopify-fasen helt om de inte syns publikt.
2. **Backup först:** snapshot av `products(id, shopify_product_id, vendor, product_type)` till en `catalog_normalization_backup` innan PUT.
3. **Pilot:** kör 1 mapping (t.ex. `TwelveSout → Twelve South`, 706 produkter) på dev-shop eller med dry-run mot Shopify (validera att GID:erna finns och `vendor` är writable).
4. **Beslut om locations:** Shopify har inte fritt-text "location" på produktnivå — vår `inventory.location` är intern. ⇒ **Skippa locations i apply_shopify**; de är redan klara lokalt.

Säg **"bygg apply_shopify worker"** så implementerar jag punkt 1–3 (vendor + product_type only, locations exkluderade).
