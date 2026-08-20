# AGENTS.md

## Vad detta är

EU Drone Company (EuroDroneParts) — Shopify-tema, butiksdrift, produktcompliance och
migreringsverktyg. Utbrutet ur `boolsson81/digitalsignal` 2026-08-20.

Det här är **inte** en webbapp. Det finns ingen dev-server och ingen frontend att köra.
Repot innehåller Liquid-tema, Node-skript mot Shopify Admin API, och Deno-baserade
Supabase edge functions.

## Språk

Svenska i UI-text, commit-meddelanden och kommunikation. Engelska bara om det efterfrågas.

## Kör / testa

- `npm install` — bara `@supabase/supabase-js`, `pg` och `vitest`.
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
- **Stannade kvar i DigitalSignal:** Sunsky-dropship, leverantörs-FTP (Boston), lagerhantering,
  servicportalen (SMP), publika drönarsidor (`/kommersiella-dronare/*`) och admin-UI:t för
  Shopify Cloner och produktcompliance. Se `docs/SEPARATION.md`.

## Efter varje ändring

1. Kör `npm test` om något under `scripts/` eller `src/` ändrats.
2. Deploya och verifiera berörda edge functions.
3. Sammanfatta: **Ändrat** / **Testat** / **Kräver manuell kontroll**.
