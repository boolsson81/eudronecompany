# EU Drone Company

Kod och drift för EuroDroneParts (`eurodroneparts.com` / `.se` / `.de` / `.dk`).
Utbrutet ur [`boolsson81/digitalsignal`](https://github.com/boolsson81/digitalsignal)
2026-08-20 — se [`docs/SEPARATION.md`](docs/SEPARATION.md) för gränsdragningen och
[`docs/EXTRACTION_MANIFEST.md`](docs/EXTRACTION_MANIFEST.md) för exakt vad som flyttades.

## Innehåll

| Katalog | Vad |
|---|---|
| `src/` | Frontend (Vite + React + Tailwind): publika drönarsidor och driftsvyer |
| `theme/` | EuroDroneParts Shopify-tema (Dawn 15.4.1 + `edp-*`-anpassningar) |
| `shopify-theme/edp/` | Tema-sektioner för FAQ, jämförelser och industrisidor |
| `shopify-theme/eurodroneparts/` | Header, mega-meny och drawer |
| `data/` | Kollektions-, meny-, taxonomi- och fasarkitektur som JSON |
| `src/data/`, `src/lib/` | Innehållsbundlar och HTML/CSS-generatorer för EDP-sidor |
| `scripts/` | Drift- och migreringsskript mot Shopify Admin API |
| `supabase/functions/` | Edge functions: Shopify Cloner, EDP-launch, meny-/migreringspass, produktcompliance |
| `docs/reports/` | Rapporter och revisioner från migreringen och lanseringen |

## Förutsättningar

Databasen delas fortfarande med DigitalSignal: samma hostade Supabase-projekt, samma
`shop_id` för EuroDroneParts (`e6ad2afc-e468-49a7-8d33-9b1837419ed8`). Migreringar under
`supabase/migrations/` ligger kvar i digitalsignal-repot och ska köras därifrån.

Krävda miljövariabler för skript och deploy:

```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SHOPIFY_STORE_DOMAIN=ya1xhg-x6.myshopify.com
SHOPIFY_ADMIN_TOKEN=
```

## Frontend

| Rutt | Vad |
|---|---|
| `/kommersiella-dronare/*` | Publika drönarsidor (15 sidor) — samma sökvägar som tidigare på `app.digitalsignal.io`, plus `/specialtillverkning` som är ny här |
| `/admin/shopify-cloner` | Shopify Cloner |
| `/admin/shopify-drone-clone` | Drone Clone |
| `/admin/product-compliance` | Produktcompliance (IOSS/GPSR/CE/HS) |
| `/login` | Inloggning med DigitalSignal-kontot |

Driftsvyerna kräver rollen `admin` eller `global_admin`. Rollerna kommer från samma
databas som DigitalSignal, så inga nya konton behöver skapas.

Innan cutover: läs [`docs/FRONTEND_MIGRATION.md`](docs/FRONTEND_MIGRATION.md) — måldomänen
för 301-omdirigeringarna är inte bekräftad än.

## Vanliga kommandon

```sh
npm install
npm run dev                     # Vite på http://localhost:8080
npm run build
npm run typecheck
npm test                        # vitest över scripts/__tests__
npm run check:shared            # jämför speglade filer mot ../digitalsignal
npx supabase functions deploy <namn> --project-ref <ref>
node scripts/push-edp-theme.mjs        # publicera temat
node scripts/verify-edp-theme-menus.mjs
```

Kopiera `.env.example` till `.env.local` och fyll i `VITE_SUPABASE_URL` och
`VITE_SUPABASE_PUBLISHABLE_KEY` innan `npm run dev`.

## Speglade moduler

Ett fåtal moduler under `supabase/functions/_shared/` finns i båda repona, eftersom
funktioner som stannade i DigitalSignal (Sunsky-dropship, leverantörs-FTP, GEO) fortfarande
använder dem. De är markerade i `docs/EXTRACTION_MANIFEST.md`. Ändras någon av dem behöver
ändringen speglas manuellt — kör `node scripts/check-shared-drift.mjs` för att se skillnader.
