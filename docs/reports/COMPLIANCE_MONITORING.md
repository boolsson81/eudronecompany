# COMPLIANCE_MONITORING — SUNSKY övervakning

**Datum:** 2026-06-18  
**Skript:** `scripts/run-sunsky-compliance-monitor.mjs`  
**Edge action:** `compliance-report` i `sunsky-sync`  
**Monitor-kod:** `supabase/functions/_shared/sunsky-compliance-monitor.ts`

## Genererade rapporter

| Fil | Innehåll |
|-----|----------|
| `SUNSKY_COMPLIANCE_REPORT.json` | Totals, issues, samples |
| `SUNSKY_MARGIN_ALERTS.json` | Produkter med marginal < 35 % eller negativ |
| `SUNSKY_HS_COVERAGE_REPORT.json` | HS-täckning per källa och confidence-band |

## Körning

```bash
node scripts/run-sunsky-compliance-monitor.mjs
```

Kräver: `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`

Offline fallback (HS-engine samples):

```bash
node scripts/validate-sunsky-hs-engine.mjs
```

## Schemalagd körning

**Workflow:** `.github/workflows/sunsky-compliance-monitor.yml`

| Trigger | Tidpunkt |
|---------|----------|
| Cron | Dagligen 06:00 UTC |
| `workflow_dispatch` | Manuellt |
| Efter `Deploy sunsky-sync` | Automatiskt vid lyckad deploy |

Rapporter laddas upp som GitHub Actions-artifacts.

### Rekommenderad driftordning

| Händelse | Åtgärd |
|----------|--------|
| Dagligen | Cron-workflow |
| Efter varje import | Kör monitor efter backfill (steg 4 i driftordning) |
| Vid publicering | Kör monitor före `ENABLE_SHOPIFY_PUBLISH=true` |

## Prod-status (audit)

```
compliance-report failed: Unknown action: compliance-report
```

**Åtgärd:** Deploy `sunsky-sync` till `wsncjdajweoujhidlxas` efter merge.

## Säkerhetsgarantier i rapporter

- `project_scope: wsncjdajweoujhidlxas`
- `shopify_isolated: true`
- `enable_shopify_publish: false` (hårdkodat i rapport-builder)
- Inga Shopify API-anrop

## GitHub Secrets (krävs för live cron)

| Secret | Användning |
|--------|------------|
| `SUPABASE_URL` | REST + edge |
| `SUPABASE_SERVICE_ROLE_KEY` | compliance-report |
| `SUPABASE_ACCESS_TOKEN` | Deploy (befintlig) |
