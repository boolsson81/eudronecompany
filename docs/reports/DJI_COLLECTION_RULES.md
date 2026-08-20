# DJI Collection Rules

**Date:** 2026-06-08  
**Engine:** `supabase/functions/_shared/dji-compatibility.ts` → `DJI_COLLECTION_RULES`  
**Publish:** `supabase/functions/_shared/dji-shopify-publish.ts` → `assignDjiModelCollections()`

---

## Purpose

Automatically place DJI accessory products into **model-specific collections** so shoppers can browse *Parts for DJI Mini 4 Pro*, *Parts for DJI Air 3*, etc., without manual merchandising.

---

## Launch collections (8)

| Collection title | Handle | Matching `model_id` values |
|------------------|--------|---------------------------|
| Parts for DJI Neo | `parts-dji-neo` | `dji_neo`, `dji_neo_2` |
| Parts for DJI Flip | `parts-dji-flip` | `dji_flip` |
| Parts for DJI Mini 4 Pro | `parts-dji-mini-4-pro` | `dji_mini_4_pro` |
| Parts for DJI Air 3 | `parts-dji-air-3` | `dji_air_3` |
| Parts for DJI Air 3S | `parts-dji-air-3s` | `dji_air_3s` |
| Parts for DJI Mavic 4 Pro | `parts-dji-mavic-4-pro` | `dji_mavic_4_pro` |
| Parts for DJI Avata | `parts-dji-avata` | `dji_avata`, `dji_avata_2` |
| Parts for DJI Matrice | `parts-dji-matrice` | `dji_matrice`, `dji_matrice_4`, `dji_matrice_400`, `dji_matrice_4d` |

**Rule logic:** A product is added to a collection when **any** of its `compatible_model_ids` intersects the collection's `model_ids` list.

---

## Automation model

### On publish (implemented)

When `publish-sunsky-to-shopify` creates or updates a Shopify product:

1. Read `pages.supplier_normalized.dji_compatibility`.
2. For each matching rule in `DJI_COLLECTION_RULES`:
   - Find collection by **handle** via GraphQL (`collectionByHandle`).
   - If missing, **create** manual collection with that title + handle.
   - Call `collectionAddProducts` to add the product GID.

This is **idempotent** — re-publish adds the product again (Shopify dedupes).

### Optional: Shopify Smart Collections (Admin)

For collections that stay in sync without re-publish, create **automated** collections in Shopify Admin:

**Condition type:** Product metafield  
**Namespace:** `dji`  
**Key:** `compatible_models`  
**Condition:** contains `dji_mini_4_pro` (repeat per model or use OR groups)

| Smart collection | Metafield condition |
|------------------|---------------------|
| Parts for DJI Mini 4 Pro | `dji.compatible_models` contains `dji_mini_4_pro` |
| Parts for DJI Air 3 | `dji.compatible_models` contains `dji_air_3` |
| … | … |

**Note:** `compatible_models` is a **list** metafield — use "contains" / list membership operators in Search & Discovery / smart collection UI.

**Recommendation:** Use **publish-time assignment** for EuroDroneParts launch (already coded). Add smart collections later if you want products from non-Sunsky sources to auto-join.

---

## Shopify setup checklist

1. **Create empty manual collections** (optional — publish auto-creates if missing):
   - Settings → Collections → Create collection
   - Type: Manual (publish path creates manual collections)
   - Set handle exactly as in table above

2. **Navigation:** Add collections under *DJI Parts* or *By Drone Model* menu.

3. **Collection SEO:** Template description example:

   > Original and compatible spare parts for **DJI Mini 4 Pro** — propellers, batteries, chargers, gimbals, and accessories. Filter by part type.

4. **Re-publish** existing Sunsky drafts after backfill to populate collections.

---

## Multi-model products

A propeller for *Mini 4 Pro / Mini 3 Pro* has:

```json
"compatible_model_ids": ["dji_mini_4_pro", "dji_mini_3_pro"]
```

It is added to **Parts for DJI Mini 4 Pro** only (Mini 3 Pro has no launch collection). Extend `DJI_COLLECTION_RULES` when adding Mini 3 Pro or other model landing pages.

---

## Code reference

```63:72:supabase/functions/_shared/dji-compatibility.ts
export const DJI_COLLECTION_RULES = [
  { collection_title: "Parts for DJI Neo", handle: "parts-dji-neo", model_ids: ["dji_neo", "dji_neo_2"] },
  { collection_title: "Parts for DJI Flip", handle: "parts-dji-flip", model_ids: ["dji_flip"] },
  // ...
] as const;
```

---

## Adding a new model collection

1. Add pattern to `DJI_MODEL_PATTERNS` if new model string.
2. Add entry to `DJI_COLLECTION_RULES`.
3. Create collection in Shopify (or let publish auto-create).
4. Add filter in Search & Discovery (see [DJI_FILTER_SETUP.md](./DJI_FILTER_SETUP.md)).
5. Extend unit test with a fixture SKU.

**Effort:** ~30 minutes per new model line.
