# AGENTS.md

## Vad detta är

EU Drone Company (EuroDroneParts) — Shopify-tema, butiksdrift, produktcompliance och
migreringsverktyg. Utbrutet ur `boolsson81/digitalsignal` 2026-08-20.

Repot innehåller en Vite/React-frontend (publika drönarsidor + driftsvyer), ett
Liquid-baserat Shopify-tema, Node-skript mot Shopify Admin API och Deno-baserade
Supabase edge functions.

## Språk

Svenska i UI-text, commit-meddelanden och kommunikation. Engelska bara om det efterfrågas.

## Kör / testa

- `npm run dev` — Vite på `http://localhost:8080`. Kräver `VITE_SUPABASE_URL` och
  `VITE_SUPABASE_PUBLISHABLE_KEY` i `.env.local` (se `.env.example`).
- `npm run build` och `npm run typecheck` — båda ska gå igenom rent.
- `npm test` — vitest över `scripts/__tests__/`.
- `npm run check:shared` — jämför speglade `_shared`-moduler mot digitalsignal-repot
  (förväntar sig att det ligger på `../digitalsignal`, annars ange sökväg som argument).
- Edge functions deployas med Supabase CLI mot **samma hostade projekt som DigitalSignal**.
  Det finns ingen lokal Supabase-stack.

## Gränser mot DigitalSignal

- **Databasen delas.** Alla `supabase/migrations/` ligger kvar i digitalsignal-repot och
  körs därifrån. Skapa aldrig migreringar här.
- **Speglade moduler.** Modulerna i `docs/EXTRACTION_MANIFEST.md` under "dupliceras" finns i
  båda repona. DigitalSignal är källan — ändra där först, spegla hit, kör `npm run check:shared`.
- **Stannade kvar i DigitalSignal:** Sunsky-dropship, leverantörs-FTP (Boston),
  lagerhantering, servicportalen (SMP), `/admin/drone-regulations` och
  `/admin/product-compliance/backfill-sunsky`. Se `docs/SEPARATION.md`.
- **Drönarsidorna är ActionKing-brandade.** Texterna flyttades oförändrade. Skriv inte om
  dem till EuroDroneParts utan att fråga — se `docs/FRONTEND_MIGRATION.md`.

## Efter varje ändring

1. Kör `npm run typecheck` och `npm test` om något under `src/` eller `scripts/` ändrats.
2. Deploya och verifiera berörda edge functions.
3. Sammanfatta: **Ändrat** / **Testat** / **Kräver manuell kontroll**.
