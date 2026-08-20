# HS Code & Country of Origin — Publish Loss Analysis

**Date:** 2026-06-07  
**Scope:** Shopify clone publish paths (`shopify-cloner-publish`, `shopify-drone-clone`)  
**Symptom:** HS code and country of origin present on source store variants are empty on the target store after clone publish.

---

## Executive Summary

HS code and country of origin are **captured correctly at scan** and **stored intact** in `cloner_migration_items.source_payload`, but they are **never written at publish**. The publish layer maps variant fields into the legacy REST `products.json` payload, which does not carry `InventoryItem` compliance fields. Shopify stores these values on **InventoryItem**, not on ProductVariant — so a second GraphQL `inventoryItemUpdate` step is required after product create.

**Root cause (two layers):**

1. **Mapping gap:** `buildProductPayload()` omits `harmonizedSystemCode` and `countryCodeOfOrigin` from the outbound variant object.
2. **API mismatch:** Even if mapped onto the REST variant body, Shopify ignores them there. The correct destination is `InventoryItem` via GraphQL.

---

## End-to-End Data Flow

```
Source Shopify (GraphQL Admin API)
  variants.nodes[].inventoryItem.harmonizedSystemCode
  variants.nodes[].inventoryItem.countryCodeOfOrigin
           │
           ▼
┌──────────────────────────────────────────────────────────────┐
│ SOURCE — shopify-cloner-scan                                 │
│ File: supabase/functions/shopify-cloner-scan/index.ts        │
│ Query: PRODUCT_QUERY (line ~141)                             │
│ Storage: cloner_migration_items.source_payload (full JSON)   │
│ Status: ✅ CAPTURED                                          │
└──────────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────┐
│ TRANSFORM — shopify-cloner-transform (optional)              │
│ File: supabase/functions/shopify-cloner-transform/index.ts   │
│ Rewrites: title, body_html, SEO, tags, vendor, FAQ           │
│ HS/origin: NOT read, NOT written, NOT removed                │
│ Status: ⚪ PASS-THROUGH (data remains in source_payload)     │
└──────────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────┐
│ PUBLISH — shopify-cloner-publish                             │
│ File: supabase/functions/shopify-cloner-publish/index.ts     │
│ Function: buildProductPayload() (line ~209)                  │
│ API: REST POST/PUT products.json                             │
│ HS/origin: ❌ NOT MAPPED                                     │
│ Status: ❌ LOST AT PUBLISH                                   │
└──────────────────────────────────────────────────────────────┘
           │
           ▼
Target Shopify
  InventoryItem.harmonizedSystemCode  → empty
  InventoryItem.countryCodeOfOrigin   → empty
```

**Drone clone** (`shopify-drone-clone/index.ts`) follows the same scan → publish pattern with the same gap in its inline `buildProductPayload()` (line ~197).

---

## Layer-by-Layer Identification

### 1. Source Field (Scan)

| Item | Detail |
|------|--------|
| **Function** | `shopify-cloner-scan` |
| **File** | `supabase/functions/shopify-cloner-scan/index.ts` |
| **GraphQL query** | `PRODUCT_QUERY` |
| **Source path (per variant)** | `variants.nodes[].inventoryItem.harmonizedSystemCode` |
| | `variants.nodes[].inventoryItem.countryCodeOfOrigin` |
| **Persistence** | `cloner_migration_items.source_payload` — entire product node JSON, including nested variant `inventoryItem` |
| **Drone clone scan** | Same fields in `PRODUCT_Q` at `shopify-drone-clone/index.ts` line ~69 |

**Example source_payload fragment (after scan):**

```json
{
  "variants": {
    "nodes": [{
      "sku": "AK-12345",
      "inventoryItem": {
        "tracked": true,
        "harmonizedSystemCode": "8806211000",
        "countryCodeOfOrigin": "CN",
        "measurement": { "weight": { "value": 0.15, "unit": "KILOGRAMS" } }
      }
    }]
  }
}
```

Weight from the same `inventoryItem.measurement` object **is** published; HS code and origin from the same object are not.

---

### 2. Transformation Layer

| Item | Detail |
|------|--------|
| **Function** | `shopify-cloner-transform` |
| **File** | `supabase/functions/shopify-cloner-transform/index.ts` |
| **Input** | `cloner_migration_items.source_payload` |
| **Output** | `cloner_migration_items.transformed_payload` (marketing copy only) |
| **HS/origin handling** | None — transform never references `harmonizedSystemCode` or `countryCodeOfOrigin` |
| **Impact** | **No data loss.** Publish reads variant data from `source_payload` (`src`), not from `transformed_payload` |

`summarizeForPrompt()` (line ~132) strips variants down to `{ title, sku, price }` for the AI prompt only; the full `source_payload` in the database is unchanged.

---

### 3. Publish Layer

| Item | Detail |
|------|--------|
| **Function** | `shopify-cloner-publish` |
| **File** | `supabase/functions/shopify-cloner-publish/index.ts` |
| **Builder** | `buildProductPayload(item)` — line 209 |
| **Publish call** | `rest(..., 'POST', 'products.json', productBody)` — line 1261 |
| **Post-create hooks** | `linkVariantImages()` only — line 1263; no inventory compliance hook |

**What `buildProductPayload` maps per variant (line 236–253):**

| Source (`source_payload`) | REST variant field | Mapped? |
|---------------------------|-------------------|---------|
| `selectedOptions` | `option1/2/3` | ✅ |
| `price` | `price` | ✅ |
| `compareAtPrice` | `compare_at_price` | ✅ |
| `sku` | `sku` | ✅ |
| `barcode` | `barcode` | ✅ |
| `inventoryPolicy` | `inventory_policy` | ✅ |
| `inventoryItem.tracked` | `inventory_management` | ✅ |
| `inventoryQuantity` | `inventory_quantity` | ✅ |
| `inventoryItem.measurement.weight` | `weight`, `weight_unit` | ✅ |
| `inventoryItem.harmonizedSystemCode` | — | ❌ **omitted** |
| `inventoryItem.countryCodeOfOrigin` | — | ❌ **omitted** |

**Drone clone** (`shopify-drone-clone/index.ts`, `buildProductPayload` line 208–214): same omission — maps price, SKU, barcode, weight; drops HS code and origin.

**Why REST alone cannot fix this:** The publish path uses Shopify REST Admin `products.json`. Product Variant resources do not accept `harmonizedSystemCode` or `countryCodeOfOrigin` on create/update. Shopify moved customs data to **InventoryItem** (GraphQL). Weight is a legacy exception still accepted on the variant resource.

---

### 4. Shopify Destination Field

| Internal name (GraphQL) | Admin UI label | REST equivalent | Set via clone today? |
|-----------------------|----------------|-----------------|----------------------|
| `InventoryItem.harmonizedSystemCode` | HS code | None on Variant | ❌ |
| `InventoryItem.countryCodeOfOrigin` | Country of origin (ISO 3166-1 alpha-2) | None on Variant | ❌ |

**Correct write API:**

```graphql
mutation($id: ID!, $input: InventoryItemInput!) {
  inventoryItemUpdate(id: $id, input: $input) {
    inventoryItem {
      id
      harmonizedSystemCode
      countryCodeOfOrigin
    }
    userErrors { field message }
  }
}
```

**InventoryItem GID format:** `gid://shopify/InventoryItem/{numeric_id}`

After REST product create, each variant in the response includes `inventory_item_id` (numeric). Convert to GID for GraphQL.

---

## Reference: Working Pattern Elsewhere in Codebase

These functions **do** push HS code and country of origin correctly — use them as the fix template:

| Function | Source DB fields | Shopify API |
|----------|------------------|-------------|
| `test-single-sku-push` | `inventory.hs_code`, `inventory.country_of_origin` | `inventoryItemUpdate` GraphQL |
| `nightly-inventory-sync` | same | `inventoryItemUpdate` GraphQL |
| `sunsky-sync` | Sunsky product `hsCode` | `inventoryItemUpdate` GraphQL |
| `shopify-inventory-write` | action `itemUpdate` | `inventoryItemUpdate` GraphQL |

Example from `test-single-sku-push/index.ts` (lines 125–168):

```typescript
const input: { countryCodeOfOrigin?: string; harmonizedSystemCode?: string } = {};
if (inv.country_of_origin) input.countryCodeOfOrigin = inv.country_of_origin;
if (inv.hs_code) input.harmonizedSystemCode = inv.hs_code;

// inventoryItemUpdate(id: inventoryItemId, input)
```

**Clone equivalent:** Read from `source_payload.variants.nodes[i].inventoryItem` instead of `inventory` table columns.

---

## Proposed Fix

### Option A — Post-create hook in `shopify-cloner-publish` (recommended)

Add `linkVariantInventoryCompliance()` mirroring the existing `linkVariantImages()` pattern.

**Location:** `supabase/functions/shopify-cloner-publish/index.ts`

**Steps:**

1. After `POST products.json` / `PUT products/{id}.json` succeeds, call the new helper with:
   - `j.product.variants` (REST response — has `id`, `sku`, `inventory_item_id`)
   - `item.source_payload.variants.nodes` (scan data — has `inventoryItem.harmonizedSystemCode`, `countryCodeOfOrigin`)

2. Match variants by **SKU** (fallback: index order if SKU empty).

3. For each pair where at least one compliance field is non-null:

```typescript
async function linkVariantInventoryCompliance(
  domain: string, token: string, ver: string,
  createdVariants: any[], sourceVariantNodes: any[],
) {
  const bySku = new Map(sourceVariantNodes.map((v) => [v.sku, v]));
  const mutation = `
    mutation($id: ID!, $input: InventoryItemInput!) {
      inventoryItemUpdate(id: $id, input: $input) {
        userErrors { field message }
      }
    }`;

  for (const cv of createdVariants) {
    const src = bySku.get(cv.sku) ?? sourceVariantNodes[createdVariants.indexOf(cv)];
    const item = src?.inventoryItem;
    if (!item || !cv.inventory_item_id) continue;

    const input: Record<string, string> = {};
    if (item.countryCodeOfOrigin) input.countryCodeOfOrigin = item.countryCodeOfOrigin;
    if (item.harmonizedSystemCode) input.harmonizedSystemCode = item.harmonizedSystemCode;
    if (!Object.keys(input).length) continue;

    const gid = `gid://shopify/InventoryItem/${cv.inventory_item_id}`;
    await gql(domain, token, ver, mutation, { id: gid, input }).catch(() => null);
  }
}
```

4. Invoke after `linkVariantImages` on both create and update paths (lines ~1259 and ~1263).

**Why post-create:** REST product create already provisions InventoryItem records; `inventoryItemUpdate` is the supported mutation. The file already has `gql()` at line 392.

### Option B — Same hook in `shopify-drone-clone`

Duplicate or extract shared helper; call after each `POST products.json` in the drone clone publish loop.

### Option C — GraphQL `productSet` for full product create (larger refactor)

`productSet` can set variant inventory item fields in one mutation. Higher effort; only worth it if migrating the entire publish path off REST.

---

## Field Mapping Reference (Clone Path)

| Stage | HS Code field | Country of Origin field |
|-------|---------------|-------------------------|
| **Source Shopify (GraphQL)** | `ProductVariant.inventoryItem.harmonizedSystemCode` | `ProductVariant.inventoryItem.countryCodeOfOrigin` |
| **Scan storage (`source_payload`)** | `variants.nodes[].inventoryItem.harmonizedSystemCode` | `variants.nodes[].inventoryItem.countryCodeOfOrigin` |
| **Transform** | unchanged in `source_payload` | unchanged in `source_payload` |
| **Publish REST payload** | *(not sent)* | *(not sent)* |
| **Target Shopify (GraphQL)** | `InventoryItem.harmonizedSystemCode` | `InventoryItem.countryCodeOfOrigin` |
| **Target Shopify (Admin UI)** | Product → Variant → Customs information → HS code | Product → Variant → Customs information → Country of origin |

---

## Related Gaps (Out of Clone Scope)

| Path | HS / origin behavior |
|------|---------------------|
| `publish-inventory-to-shopify` | No `harmonizedSystemCode` / `countryCodeOfOrigin` in grep — separate gap for inventory-driven publish |
| `inventory` table | Has `hs_code`, `country_of_origin` columns; synced by `nightly-inventory-sync` / `test-single-sku-push`, not by cloner |
| `shopify_products` feed table | Has `hs_code` column; table never populated (see `SHOPIFY_PRODUCTS_TABLE_REVIEW.md`) |

---

## Verification Plan

After implementing Option A (+ B for drone clone):

1. **Source store:** Pick a product with known HS code and country (e.g. `8806211000`, `CN`). Confirm via Shopify Admin or GraphQL:

```graphql
query {
  product(id: "gid://shopify/Product/...") {
    variants(first: 5) {
      nodes {
        sku
        inventoryItem { harmonizedSystemCode countryCodeOfOrigin }
      }
    }
  }
}
```

2. **Post-scan:** Query `cloner_migration_items` for that product; confirm `source_payload` contains the values under `variants.nodes[].inventoryItem`.

3. **Post-publish:** Re-query target store GraphQL for the cloned product; assert `harmonizedSystemCode` and `countryCodeOfOrigin` match source.

4. **Edge cases:**
   - Variant with HS code but no country → only `harmonizedSystemCode` updated
   - Untracked variant (`inventoryItem.tracked: false`) → InventoryItem still exists; update should work
   - Update-existing mode (`PUT products/{id}.json`) → hook must run on update path too
   - Multi-variant product → each variant matched by SKU

5. **Regression:** Confirm `linkVariantImages` and weight/SKU/barcode still copy correctly.

---

## Priority & Impact

| Priority | Rationale |
|----------|-----------|
| **P0** | Customs/compliance data required for EU GPSR, IOSS, and cross-border shipping |

Documented in `CLONE_VERIFICATION_REPORT.md` as item #8 in the gap list. Fix is localized (~40 lines + two call sites) and follows an established pattern in `test-single-sku-push` and `nightly-inventory-sync`.

---

## Files to Change

| File | Change |
|------|--------|
| `supabase/functions/shopify-cloner-publish/index.ts` | Add `linkVariantInventoryCompliance()`; call after product create/update |
| `supabase/functions/shopify-drone-clone/index.ts` | Same helper (or shared `_shared/cloner-inventory-compliance.ts`) |
| *(optional)* `supabase/functions/_shared/cloner-inventory-compliance.ts` | Extract shared helper if both paths should stay DRY |

**No migration required** — data is already in `source_payload`; only publish logic is missing.
