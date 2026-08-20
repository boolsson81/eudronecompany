# Battery Compliance — SUNSKY Import Rules

Battery-specific compliance is applied during **internal** landed cost calculation only. No Shopify tags, metafields, or inventory quantities are modified by this engine.

## Triggers

When `inventory.contains_battery = true`:

| Field | Value |
|-------|--------|
| `battery_fee_sek` | Applied if `import_rules.battery_fee_enabled` (default 25 SEK) |
| `digital_product_passport_required` | `true` |
| `extended_producer_responsibility` | `true` |

## Stored metadata

When available from Sunsky `product!detail.do`:

| Column | API sources |
|--------|-------------|
| `battery_type` | `batteryType`, `battery_type` |
| `battery_capacity_wh` | `batteryCapacityWh`, `battery_capacity_wh`, `capacityWh` |
| `battery_chemistry` | `batteryChemistry`, `battery_chemistry` |

## EU_FUTURE rule

From 2027-07-01, `import_rules.digital_product_passport_required` defaults to `true` for **all** products under `EU_FUTURE`, in addition to battery-specific DPP requirements.

## Dashboard filters

**Lagerhantering → EU Import Audit**:

- **Batterier** — `contains_battery = true`
- **Framtida EU-regler** — products with customs review, missing HS, or DPP flags

## Shipping note

Weight-table battery surcharges in `sync-sunsky-prices-background` remain separate from `battery_fee_sek` in the landed cost engine. The engine fee models **import/compliance** cost, not carrier freight.

## Publishing gate

Battery compliance flags are persisted on `inventory` for audit. Shopify publish (`ENABLE_SHOPIFY_PUBLISH`) remains disabled until HS codes and compliance review are complete.
