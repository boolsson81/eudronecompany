# Mässor & Events — flyttad till digitalsignal

Modulen byggdes här i september 2026 och ligger inte kvar. Den bor numera i
[`boolsson81/digitalsignal`](https://github.com/boolsson81/digitalsignal),
tillsammans med hela dokumentationen. Se `docs/TRADE_FAIR_MODULE.md` där.

## Varför

Frontenden i det här repot är inte deployad någonstans och har ingen vald värd
— se [`FRONTEND_MIGRATION.md`](FRONTEND_MIGRATION.md). Modulen gick alltså inte
att använda härifrån. Databasen och edge-funktionen låg redan i det delade
Supabase-projektet, som digitalsignal äger, så sidorna hörde hemma där.

## Vad som flyttade

| Yta | Var den ligger nu |
|---|---|
| Inköpsvyn | `digitalsignal` → `/admin/trade-fairs` (menygruppen Inköp) |
| Säljvyn | `digitalsignal` → `/admin/sales/trade-fairs` (menygruppen Försäljning) |
| Eventprofilen | `digitalsignal` → `/admin/trade-fairs/:slug` |
| Edge-funktionen `tradefair-research` | `digitalsignal/supabase/functions/` |
| Migreringen | `digitalsignal/supabase/migrations/20260903220000_tradefair_events.sql` |

Båda vyerna är låsta till EU Drone Companys `shop_id` via menyns `shopIds`, så
ingen annan tenant ser dem.

`_shared/aiUsageLog.ts` togs bort härifrån samtidigt: `tradefair-research` var
den enda funktionen i det här repot som använde den, så den slutade vara en
speglad fil. Listan i `scripts/check-shared-drift.mjs` gick från 17 till 16.
