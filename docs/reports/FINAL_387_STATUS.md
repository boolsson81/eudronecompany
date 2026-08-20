# FINAL 387 BATCH — SLUTRAPPORT

**Migration:** `3d9876af-885c-49e9-a4b0-c4943c06112f`
**Datum:** 2026-06-09
**Status:** ✅ KLAR

## Måluppfyllnad

| Mål | Värde | Status |
|---|---|---|
| published | 387 / 387 | ✅ |
| pending (idle) | 0 | ✅ |
| queued | 0 | ✅ |
| failed | 0 | ✅ |
| collection_link_failed | 0 | ✅ |

## Verifiering (faktiska siffror för hela migrationen, object_type=product)

| approval_status | publish_status | antal |
|---|---|---|
| approved | published | 9 246 |
| pending  | published | 2 812 |
| rejected | idle      | 1 328 |

- Inga produkter i `idle` förutom rejected (som per regel ej körs).
- Inga produkter i `failed`.
- Sista 24h: 526 produkter uppdaterade → samtliga `published`.
- Sista riktade jobb (`643589ce-…`, 164 item_ids): alla 164 → `published`.

## Aktiva jobb

- Inget produkt-publiceringsjobb i kö.
- 1 äldre worker-job (`5630e179`) kvarstår som `running` men hanterar icke-produktobjekt (collections/pages); påverkar inte 387-batchen.

## Kvarvarande i migrationen

- **Rejected:** 1 328 (oförändrat, ej körda enligt regel)
- **Pending kvar:** 0 produkter i `idle`

## GO/NO-GO

- 🟢 **GO** — Granskning av de 1 328 rejected kan påbörjas.
- 🟢 **GO** — Större batch framöver (1 000+) är säker; 0 % fail rate på senaste körningarna.
- Inga av de 387 pending-produkterna fallerade.
