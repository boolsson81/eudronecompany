# HS_ENGINE_VALIDATION — SUNSKY HS-kodsmotor

**Datum:** 2026-06-18  
**Källa:** `supabase/functions/_shared/sunsky-hs-map.ts`  
**Rapport:** `SUNSKY_HS_COVERAGE_REPORT.json`

## Motorverifiering

### Indata (bekräftat i `resolveHsCodeAndDuty`)

| Indata | Används | Implementation |
|--------|---------|----------------|
| Kategori | ✅ | `categoryName` i haystack |
| Titel | ✅ | `title` i haystack |
| Varumärke | ✅ | `brand` i haystack |
| Nyckelord | ✅ | `keywords[]` per mapping + `scoreKeywordMatch()` |

### Confidence

- Varje träff returnerar `confidence` 0.0–1.0
- Produkt-HS från API: `confidence = 1.0`, `source = product_detail`
- Pattern-träff: mapping confidence (0.78–0.92)
- Keyword-träff: `confidence * (0.6 + keywordScore * 0.4)`
- Tröskel för publicering: `HS_CONFIDENCE_THRESHOLD = 0.8`

### Prioriterade kategorier

| Kategori | HS-kod | Confidence | Verifierad |
|----------|--------|------------|------------|
| DJI-batterier | 8507600090 | 0.92 | ✅ 3 samples |
| Filter | 9002200000 | 0.90 | ✅ 3 samples |
| Propellrar | 8803300000 | 0.90 | ✅ 2 samples |
| Laddare | 8504409590 | 0.88 | ✅ 2 samples |
| Kablar | 8544429090 | 0.88 | ✅ 2 samples |
| Reservdelar | 8807300000 | 0.85 | ✅ 2 samples |
| Väskor | 4202929890 | 0.87 | ✅ 2 samples |
| Fästen | 8529909700 | 0.82 | ✅ 2 samples |

Första match vinner (priority-ordered array).

---

## Valideringsresultat (offline, 25 samples)

| Mätvärde | Resultat | Mål |
|----------|----------|-----|
| Täckning | **84 %** | ≥ 80 % |
| Träffsäkerhet | **100 %** | — |
| Falska positiva | **0** | — |
| Olösta (avsiktliga) | 4 (generiska/okända produkter) | flaggas `missing_hs_code` |

Körning: `node scripts/validate-sunsky-hs-engine.mjs`

### `missing_hs_code`-flagga

Produkter utan HS-träff får automatiskt:

- `review_flags: ["missing_hs_code"]` via `buildReviewFlags()` i `sunsky-pricing.ts`
- `import_compliance_flags: ["missing_hs_code"]` via `evaluateImportCompliance()`

`write_internal` blockeras **inte** — flaggan är informativ.

### Manuella överstyrningar

- Befintlig `inventory.hs_code` bevaras vid backfill (`processSunskyProductImport`)
- API `productHsCode` har högsta prioritet (confidence 1.0)
- Admin kan godkänna manuellt i granskningsvyn (`manually_approved`)

---

## Enhetstester

```
deno test supabase/functions/_shared/sunsky-compliance.test.ts
deno test supabase/functions/_shared/sunsky-pricing.test.ts
→ 11 passed, 0 failed
```

---

## Live KPI

Live katalog-KPI kräver:

1. `supabase db push`
2. `node scripts/run-sunsky-internal-backfill.mjs`
3. `node scripts/run-sunsky-compliance-monitor.mjs`

Vid audit: `compliance-report` action ej deployad i prod (`Unknown action`).

**Offline mål uppnått (≥ 80 %). Live KPI väntar på migration + backfill.**
