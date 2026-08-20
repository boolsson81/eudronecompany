# Product Draft Safety Rule

**Date:** 2026-06-08  
**Status:** Implemented  
**Related:** [INVENTORY_P0_FIX.md](./INVENTORY_P0_FIX.md), [INVENTORY_ARCHITECTURE_REVIEW.md](./INVENTORY_ARCHITECTURE_REVIEW.md)

---

## Policy

All products imported from **Sunsky**, **FTP/supplier feeds**, or **clone migrations** must be created as **Shopify DRAFT** until:

1. The **inventory flow is verified** for that SKU/shop, and  
2. A staff member **explicitly approves** go-live (product launch).

**Never** auto-publish supplier imports to the Online Store or sales channels.

---

## Rules

| Rule | Enforcement |
|------|-------------|
| Default status `DRAFT` | `applyDraftSafetyToProductInput()` on every supplier `productSet` / REST create |
| No Online Store publish | `guardSalesChannelPublish()` blocks `publishToChannels` / market publish |
| ACTIVE requires approval + verification | `canActivateSupplierProduct()` in launch activation |
| Audit trail | `product_draft_safety_log` table + console |

---

## When ACTIVE is allowed (supplier products)

Both conditions must be true:

| # | Requirement | How to set |
|---|-------------|------------|
| 1 | Manual approval | Product launch item scheduled, or `explicitlyApproved: true` in code path |
| 2 | Inventory verified | `inventory.supplier_metadata.inventory_flow_verified = true` **or** `inventory_verified = true` |

**SQL example (after inventory P0 smoke test):**

```sql
UPDATE inventory
SET supplier_metadata = COALESCE(supplier_metadata, '{}'::jsonb) ||
  '{"inventory_flow_verified": true}'::jsonb
WHERE shop_id = '<shop-uuid>' AND sku = 'TBD0421393001A';
```

Until verified, `activate-product-launch` blocks `status: ACTIVE` and logs `block_launch_activate`.

---

## Module

**`supabase/functions/_shared/product-draft-safety.ts`**

| Export | Purpose |
|--------|---------|
| `isSupplierInventorySource()` | Detects `sunsky_api`, `ftp_import`, `clone`, etc. |
| `isInventoryFlowVerified()` | Reads `supplier_metadata` flags |
| `resolveShopifyProductStatus()` | Returns `DRAFT` unless approved + verified |
| `applyDraftSafetyToProductInput()` | Mutates `productInput.status` |
| `canPublishToSalesChannels()` | Gate for Online Store / channel publish |
| `guardSalesChannelPublish()` | Wraps channel publish with block + log |
| `canActivateSupplierProduct()` | Gate for launch → ACTIVE |
| `logDraftSafetyEvent()` | Writes `product_draft_safety_log` |

---

## Flows covered

| Flow | File | Changes |
|------|------|---------|
| Sunsky publish | `publish-sunsky-to-shopify/index.ts` | DRAFT enforced, channels blocked, logged |
| Sunsky background publish | same (background batch) | same |
| FTP / inventory publish | `publish-inventory-to-shopify/index.ts` | DRAFT on create **and** update, channels blocked |
| Clone migration | `shopify-cloner-publish/index.ts` | `status: draft` + log on create |
| Drone clone | `shopify-drone-clone/index.ts` | Always `draft` (ignores source ACTIVE), log |
| Product launch | `activate-product-launch/index.ts` | Blocks ACTIVE if supplier + unverified |

**Not changed:** `seo-wizard-publish` (owned/catalog products), native WMS products without supplier `inventory_source`.

---

## Logging

**Table:** `product_draft_safety_log` (migration `20260608120000_product_draft_safety_log.sql`)

| Column | Example |
|--------|---------|
| `action` | `force_draft`, `block_channel_publish`, `block_launch_activate` |
| `reason` | `supplier_default_draft`, `inventory_source_unverified`, `manual_approval_required` |
| `requested_status` | `ACTIVE` |
| `enforced_status` | `DRAFT` |
| `inventory_source` | `sunsky_api` |

**Query recent blocks:**

```sql
SELECT created_at, function_name, sku, action, reason
FROM product_draft_safety_log
WHERE shop_id = '<shop-uuid>'
ORDER BY created_at DESC
LIMIT 50;
```

---

## Operator workflow (EuroDroneParts)

1. Import Sunsky SKU → Shopify product created as **Draft** (not on Online Store).
2. Run **Synka från Sunsky** → verify `inventory` + `inventory_log` (see [INVENTORY_P0_FIX.md](./INVENTORY_P0_FIX.md)).
3. Set `inventory_flow_verified` on tested SKUs (SQL or future UI).
4. Schedule **Product Launch** → activation sets **ACTIVE** only for verified SKUs.
5. Review `product_draft_safety_log` for any blocked activations.

---

## Tests

```bash
deno test supabase/functions/_shared/product-draft-safety.test.ts
```

| Test | Validates |
|------|-----------|
| Supplier defaults DRAFT | ACTIVE request → DRAFT |
| Unverified block | Approval without verify → blocked |
| Verified + approved | ACTIVE allowed |
| Channel publish blocked | Unverified supplier |

---

## Files changed

| File | Change |
|------|--------|
| `supabase/functions/_shared/product-draft-safety.ts` | **New** — core rules |
| `supabase/functions/_shared/product-draft-safety.test.ts` | **New** — unit tests |
| `supabase/migrations/20260608120000_product_draft_safety_log.sql` | **New** — audit table |
| `supabase/functions/publish-sunsky-to-shopify/index.ts` | Safety integration |
| `supabase/functions/publish-inventory-to-shopify/index.ts` | Safety integration |
| `supabase/functions/shopify-cloner-publish/index.ts` | Draft + log |
| `supabase/functions/shopify-drone-clone/index.ts` | Force draft + log |
| `supabase/functions/activate-product-launch/index.ts` | Block unverified ACTIVE |
| `PRODUCT_DRAFT_SAFETY_RULE.md` | **New** — this document |

---

## Implementation effort

| Task | Effort | Status |
|------|--------|--------|
| Shared safety module + tests | 3 h | Done |
| Sunsky + FTP publish integration | 2 h | Done |
| Clone flows + launch gate | 1.5 h | Done |
| Migration + documentation | 1 h | Done |
| UI for `inventory_flow_verified` toggle | 4 h | Future |

**Total:** ~1 dev-day

---

## Future enhancements

- Staff UI: “Mark inventory verified” on Inventory Manager row
- Bulk verify after Sunsky sync batch passes QA
- Shop-level kill switch: `integrations.config.supplier_publish_enabled`
