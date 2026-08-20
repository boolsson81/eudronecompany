# PUBLISH_RULES_AUDIT — evaluatePublishReadiness()

**Datum:** 2026-06-18  
**Källa:** `supabase/functions/_shared/sunsky-publish-rules.ts`  
**Anropas av:** `publish-sunsky-to-shopify` (gated av `ENABLE_SHOPIFY_PUBLISH`)

## Semantik `publish_ready`

| Fält | Betydelse |
|------|-----------|
| `publish_ready` (DB) | **Manuellt godkänd** efter mänsklig granskning |
| `ready_for_publish` (review_flag) | Automatiska kontroller passerade — **klar för granskning** |
| Shopify-publicering | Kräver `ENABLE_SHOPIFY_PUBLISH=true` + `evaluatePublishReadiness().ready` |

Import sätter **inte** `publish_ready=true` automatiskt (fixad i denna iteration).

---

## Blockerande regler

| Villkor | Regel-ID | Blockerar `ready` |
|---------|----------|-------------------|
| HS-kod saknas | `hs_code_required` | ✅ |
| Marginal ≤ 0 % | `positive_margin` | ✅ |
| Marginal < mål (35 %) | `margin_above_target` | ✅ |
| `import_compliance_status ≠ approved` | `import_compliance_approved` | ✅ |
| Blockerande `review_flags` | `no_blocking_review_flags` | ✅ |
| Blockerande `import_compliance_flags` | `no_blocking_compliance_flags` | ✅ |
| `freight_source=estimated` + ordervärde > 150 EUR | `freight_not_estimated_high_value` | ✅ |
| GPSR krävs men ej uppfyllt | `gpsr_satisfied` | ✅ |
| Batterikrav ej uppfyllt | `battery_regulation_satisfied` | ✅ |
| Saknar bild | `has_product_image` | ✅ |
| Lager = 0 | `stock_available` | ✅ |
| Saknar landed cost | `landed_cost_sek_present` | ✅ |
| HS-confidence < 0.8 | `hs_confidence_sufficient` | ✅ |

### Blockerande review_flags

```
missing_hs_code, missing_hs_code_duty_from_profile, low_hs_confidence,
missing_images, freight_source_estimated, estimated_freight,
requires_manual_review, publish_blocked, negative_margin,
missing_gpsr_data, missing_battery_regulation,
missing_digital_product_passport, missing_eu_responsible_person
```

---

## `publish_ready = false` automatiskt

| Händelse | Beteende |
|----------|----------|
| Import/backfill | `publish_ready: false` (alltid) |
| Regler ej uppfyllda | `ready_for_publish` flagga **saknas** i review_flags |
| Regler uppfyllda | `ready_for_publish` läggs i review_flags, men `publish_ready` förblir false |
| Admin godkänner | `publish_ready: true`, `import_compliance_status: approved` |

---

## Shopify-säkerhet

| Kontroll | Status |
|----------|--------|
| `ENABLE_SHOPIFY_PUBLISH=false` (default) | ✅ |
| `publish-drafts` blockerad utan flagga | ✅ |
| `start-background-publish` blockerad utan flagga | ✅ (fixad) |
| `run-background-publish` blockerad utan flagga | ✅ (fixad) |
| Auto-publish efter `write_internal` | ✅ Blockerad (fixad) |
| Nya produkter som DRAFT | ✅ `status: "draft"` i pages-insert |

---

## Testreferens

```typescript
evaluatePublishReadiness: blocks estimated freight over 150 EUR → passed
```
