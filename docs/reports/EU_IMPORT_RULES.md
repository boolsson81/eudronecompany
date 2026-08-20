# EU Import Rules — SUNSKY Landed Cost Engine

Internal pricing engine for SUNSKY dropship imports. **Does not write to Shopify.** `ENABLE_SHOPIFY_PUBLISH` remains `false`.

## Pricing model

```
landed_cost_usd = supplier_price_usd + freight_usd + duty_usd
landed_cost_sek  = (landed_cost_usd × FX) + customs_handling_fee_sek + currency_buffer_sek + battery_fee_sek
```

Import VAT (`import_vat_percent`) is stored for future use but **excluded** from landed cost totals today.

## Configurable rules (`import_rules`)

Rules are selected by **region + date** — thresholds are never hardcoded in application logic.

| Rule key (`notes`) | Valid from | Low-value threshold | Exemption | Duty all shipments | DPP default |
|--------------------|------------|---------------------|-----------|-------------------|-------------|
| `EU_CURRENT` | 2020-01-01 | 150 EUR | Yes | No | No |
| `EU_FUTURE` | 2027-07-01 | 0 EUR | No | Yes | Yes |

SQL helper: `resolve_import_rule('EU', date)`.

## Customs review (replaces `ioss_threshold_exceeded`)

```
customs_review_required =
  duty_required_all_shipments
  OR missing_hs_code
  OR invalid_hs_code
  OR missing country_of_origin
  OR shipment_value_exceeds_threshold
```

`shipment_value_exceeds_threshold` is derived from the active rule's `low_value_threshold_eur` and `low_value_exemption_enabled`.

## HS code validation

| Flag | Meaning |
|------|---------|
| `missing_hs_code` | No HS code on inventory |
| `invalid_hs_code` | HS code fails format check (6–10 digits) |
| `hs_code_duty_profile_used` | Valid HS + non-zero duty rate |

HS codes are **mandatory before Shopify publishing** is ever enabled (`requireHsForEu` in validation).

## Components

| Path | Role |
|------|------|
| `supabase/migrations/20260618180000_eu_import_rules_landed_cost.sql` | Schema + seeds + `sunsky_pricing_audit` view |
| `supabase/functions/_shared/sunsky-landed-cost.ts` | Calculation engine |
| `supabase/functions/_shared/sunsky-import.ts` | Persists landed cost on internal import |
| `scripts/run-import-rule-simulation.mjs` | EU_CURRENT vs EU_FUTURE simulation |
| `src/components/warehouse/SunskyPricingAudit.tsx` | Admin dashboard tab |

## Simulation

```bash
node scripts/run-import-rule-simulation.mjs
# optional: --shop-id <uuid>
```

Outputs `IMPORT_RULE_SIMULATION.json` and `IMPORT_RULE_SIMULATION.md`.

## Tests

```bash
npx deno test supabase/functions/_shared/sunsky-landed-cost.test.ts
```

## Safety

- No calls to `publish-sunsky-to-shopify`
- No Shopify product/price/inventory mutations
- `ENABLE_SHOPIFY_PUBLISH` unchanged
