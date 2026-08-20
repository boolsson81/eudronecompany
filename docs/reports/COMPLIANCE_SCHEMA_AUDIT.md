# COMPLIANCE_SCHEMA_AUDIT — SUNSKY Dataplattform

**Datum:** 2026-06-18  
**Branch:** `cursor/sunsky-operational-pipeline-8472`  
**PR:** [#97](https://github.com/boolsson81/digitalsignal/pull/97)  
**Shop:** `e6ad2afc-e468-49a7-8d33-9b1837419ed8` (EuroDroneParts)  
**Supabase-projekt (intern):** `wsncjdajweoujhidlxas`

## Sammanfattning

| Status | Beskrivning |
|--------|-------------|
| ✅ Kod & migrationer | Alla fält definierade i migrationer + edge-funktioner |
| ⚠️ Produktion | Migrationer **ej applicerade** i prod vid audit (REST returnerade `column does not exist` för `landed_cost_sek`, `import_compliance_status`) |
| ✅ Alias-migration | `20260618160000_sunsky_schema_aliases.sql` tillagd för audit-namn |

**Åtgärd före drift:** `supabase db push` mot `wsncjdajweoujhidlxas`.

---

## Fältverifiering

### Compliance (`inventory`)

| Begärt fält | Status | Faktisk kolumn / källa |
|-------------|--------|------------------------|
| `import_compliance_status` | ✅ Migration | `20260618140000_sunsky_compliance_platform.sql` |
| `import_compliance_flags` | ✅ Migration | jsonb, default `[]` |
| `gpsr_required` | ✅ Migration | boolean |
| `battery_required` | ✅ Alias | `battery_regulation_required` + GENERATED `battery_required` |
| `dpp_required` | ✅ Alias | `digital_product_passport_required` + GENERATED `dpp_required` |
| `product_passport_required` | ✅ Alias | GENERATED från `digital_product_passport_required` |
| `eu_responsible_person_required` | ✅ Migration | boolean |

### HS & tull (`inventory`)

| Begärt fält | Status | Faktisk kolumn |
|-------------|--------|----------------|
| `hs_code` | ✅ Befintlig | `20260201093345` + bevaras vid backfill |
| `hs_code_source` | ✅ Migration | `product_detail \| category_keyword_map \| category_map \| unresolved` |
| `hs_code_confidence` | ✅ Migration | numeric 0–1 |
| `hs_code_last_verified_at` | ✅ Migration | timestamptz, sätts vid import |
| `duty_source` | ✅ Migration | text, speglar HS-källa |

### Ekonomi (`inventory`)

| Begärt fält | Status | Faktisk kolumn |
|-------------|--------|----------------|
| `estimated_freight` | ✅ Migration | numeric USD när `freight_source=estimated` |
| `landed_cost_usd` | ✅ Migration | `20260618140000` |
| `landed_cost_sek` | ✅ Migration | `20260618120000` |
| `recommended_price` | ✅ Alias | GENERATED från `recommended_price_sek_inc_vat` |
| `margin_percent` | ✅ Alias | GENERATED från `gross_margin_percent` |
| `freight_source` | ✅ Migration | `sunsky_api_cart_allocated \| sunsky_api \| stored \| estimated` |

### Publicering

| Begärt fält | Status | Tabell |
|-------------|--------|--------|
| `publish_ready` | ✅ Migration | `inventory` — **endast manuellt godkännande** (ej auto vid import) |
| `review_flags` | ✅ Migration | `inventory` jsonb |
| `supplier_normalized` | ✅ Migration | `pages` (`20260607120000`, `20260617203003`) |
| `supplier_raw` | ✅ Migration | `pages` jsonb |

---

## Migrationer (kronologi)

| Fil | Innehåll |
|-----|----------|
| `20260618120000_sunsky_operational_pipeline.sql` | Landed cost, marginal, freight, review, publish_ready |
| `20260618140000_sunsky_compliance_platform.sql` | `import_regulation_profiles`, compliance/HS-fält, index |
| `20260618160000_sunsky_schema_aliases.sql` | Alias-kolumner, GIN-index på flags, `estimated_freight` |

---

## Index

| Index | Tabell | Kolumner |
|-------|--------|----------|
| `idx_inventory_sunsky_review` | inventory | `(shop_id, publish_ready)` WHERE supplier_sku IS NOT NULL |
| `idx_inventory_freight_source` | inventory | `(shop_id, freight_source)` |
| `idx_inventory_compliance_status` | inventory | `(shop_id, import_compliance_status)` |
| `idx_inventory_hs_coverage` | inventory | `(shop_id, hs_code)` |
| `idx_inventory_review_flags_gin` | inventory | GIN `(review_flags)` |
| `idx_inventory_compliance_flags_gin` | inventory | GIN `(import_compliance_flags)` |

---

## Constraints

| Objekt | Typ | Notering |
|--------|-----|----------|
| `import_regulation_profiles.profile_code` | UNIQUE | `EU_CURRENT`, `EU_FUTURE` seed |
| `inventory` compliance-fält | DEFAULT | `import_compliance_status='pending'`, flags `[]` |
| `publish_ready` | DEFAULT false | Semantik: manuell granskning, ej auto-Shopify |

Inga CHECK-constraints på HS-confidence (valideras i applikationslager).

---

## RLS

| Tabell | Policy | Åtkomst |
|--------|--------|---------|
| `import_regulation_profiles` | Authenticated read | SELECT för authenticated |
| `import_regulation_profiles` | Service role full | ALL för service_role |
| `inventory` | Befintliga shop-policies | SELECT/UPDATE via `has_shop_access` |
| `pages` | Befintliga shop-policies | supplier_* uppdateras via service_role i edge |

`inventory`-RLS ändrades inte av SUNSKY-migrationerna — befintliga editor/admin-policies gäller.

---

## `import_regulation_profiles`

| profile_code | Gäller från | HS | Batteri | DPP | GPSR | EU RP |
|--------------|-------------|-----|---------|-----|------|-------|
| EU_CURRENT | 2021-07-01 | ✓ | ✓ | ✗ | ✗ | ✗ |
| EU_FUTURE | 2026-07-01 | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## Prod-verifiering (2026-06-18)

```
GET /rest/v1/inventory?select=landed_cost_sek → 42703 column does not exist
GET /rest/v1/inventory?select=import_compliance_status → 42703 column does not exist
```

**Slutsats:** Schema finns i repo men kräver `supabase db push` innan backfill/monitor kan köras mot prod.
