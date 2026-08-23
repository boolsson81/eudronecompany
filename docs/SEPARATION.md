# Separation av EU Drone Company från DigitalSignal

**Status:** Steg 1–4 genomförda — se § 7
**Datum:** 2026-08-20
**Syfte:** Kartlägga vad i `boolsson81/digitalsignal` som är exklusivt för EU Drone Company
(EuroDroneParts, EDP) och beskriva hur det kan brytas ut till ett eget projekt.

---

## 1. Sammanfattning

Repot innehåller idag två i praktiken olika produkter som delar kodbas, databas och deploy:

| | DigitalSignal | EU Drone Company |
|---|---|---|
| Vad | Multi-tenant SaaS för marknad/SEO/ekonomi | Egen e-handel (eurodroneparts.com/.se/.de/.dk) + serviceverksamhet |
| Kunder | Flera tenants | En (oss själva) |
| Kod | `src/pages/*` (SEO, ads, GEO, Fortnox, sälj), `supabase/functions/shopify-app-*` | Shopify-tema, Sunsky-dropship, cloner, servicportal, compliance, ~136 rapportfiler i repo-roten |

Kopplingen mellan dem är inte arkitektonisk utan historisk: EDP byggdes *i* DigitalSignal-repot
för att verktygen fanns där. Det finns i dag **inga importer från DigitalSignal-moduler till
EDP-koden som inte kan brytas** — bindningarna är i stället hårdkodade id:n, delad Supabase och
delad deploy-pipeline.

---

## 2. Inventering

### 2.1 Entydigt EU Drone Company (kategori A)

Detta har inget värde för någon annan tenant och kan flyttas rakt av.

| Yta | Omfattning | Kommentar |
|---|---|---|
| `theme/` | 451 filer | Hela EuroDroneParts Shopify-tema (Dawn 15.4.1 + `edp-*`) |
| `shopify-theme/edp/`, `shopify-theme/eurodroneparts/` | 22 filer | Tema-sektioner för FAQ/jämförelse/industri/header |
| `data/edp-*.json` | 26 filer | Kollektions-, meny-, taxonomi- och fas-arkitektur för EDP |
| `src/data/edp*.ts`, `src/lib/edp*.ts` | 9 filer | Innehållsbundlar + HTML/CSS-generatorer för EDP-sidor |
| `src/lib/edp-hreflang.ts` | 1 fil | Domänmappning eurodroneparts.com/.de/.dk/.se |
| `src/pages/Commercial*.tsx`, `src/pages/Drone*.tsx` | 14 sidor | Publik drönarmarknadsföring (`/kommersiella-dronare/*`) |
| `supabase/functions/_shared/edp-launch/` | 10 filer | Launch-orkestrering |
| `supabase/functions/edp-launch-prep`, `eudroneparts-set-token`, `eudroneparts-token-binding-probe` | 3 functions | EDP-specifik tokenhantering |
| `supabase/functions/*sunsky*` | 13 functions | Sunsky = EDP:s dropship-leverantör |
| `scripts/*edp*`, `*sunsky*`, `*boston*`, `*english*`, `*collection*`, `*menu*` | ~78 av 199 skript | Engångs- och driftskript för EDP-butiken |
| Repo-roten: `EURODRONEPARTS_*.md`, `SUNSKY_*`, `EDP_*`, `DJI_*`, `*_HANDLE_MAPPING.csv` m.fl. | ~136 av 195 rotfiler | Rapporter/planer/CSV från EDP-migreringar |

### 2.2 Gränsfall — kräver beslut (kategori B)

Dessa är byggda *för* EDP men är generiska nog att kunna säljas som DigitalSignal-moduler.
Vilken väg de tar avgör hur stor separationen blir.

| Modul | Var | Idag | Frågan |
|---|---|---|---|
| **Service Management Portal (SMP)** | `src/pages/service-portal/` (22 filer), `src/components/service-portal/` (7), 7 edge functions | Hårdkodad EuroDroneParts-branding (`SMP_BRAND`, `service@eurodroneparts.se`, `EDP_SHOP_ID`) | EDP-verktyg eller SaaS-modul för fler kunder? |
| **Shopify Cloner** | `src/pages/ShopifyCloner.tsx`, `src/pages/admin/ShopifyDroneClone.tsx`, 9 `shopify-cloner-*`/`cloner-*` functions | Byggd för migreringen ActionKing → EuroDroneParts; jobbet är gjort | Engångsverktyg (kan arkiveras) eller produktifieras? |
| **Compliance / HS-kod / GPSR** | `_shared/compliance-engine.ts`, `compliance-sync`, `dji-compatibility.ts`, `product-compliance` | Dokumenterat som "dropshipping Kina → EU" — dvs EDP:s inköpsflöde | Generell EU-importmodul eller EDP-drift? |
| **Lager/inventory + leverantörs-FTP** | 8 `inventory-*`, 7 `*supplier*` functions, `supplier_ftp_*`-migreringar | Boston/Sunsky-leverantörer, EDP-katalog | Följer med EDP eller stannar som SaaS-modul? |

### 2.3 Entydigt DigitalSignal (kategori C)

Stannar: SEO-wizard, Google/Meta Ads, GEO/AI-visibility, Intelligence Engine, Fortnox-bokföring
(65 functions), sälj/CRM, telefoni, samt den **publika Shopify-appen** (`shopify-app-*`, 20+
functions) som är DigitalSignals produkt — inte att förväxla med EDP:s butiksdrift.

---

## 3. Hårda kopplingar som måste hanteras

1. **Delad Supabase-instans.** Ett hostat projekt, 1 105 migreringar, RLS via
   `tenant_id = get_user_tenant_id()`. EDP är i praktiken en tenant + ett `shop_id`.
2. **Hårdkodade id:n.** `EDP_SHOP_ID = "e6ad2afc-…"` finns i minst tre filer
   (`src/lib/service-portal/constants.ts`, `src/pages/admin/ShopifyDroneClone.tsx`,
   `_shared/shop-seo-connect.ts`). 49 filer/functions nämner EDP explicit.
3. **Delad SPA + routing.** `src/App.tsx` (492 rutter) blandar `/kommersiella-dronare/*`,
   `/service/*` och `/admin/*` i samma bundle, med värdbaserad routing (`isActionKingHost`).
4. **Delad deploy.** Samma Vercel-projekt, samma edge-function-namnrymd (878 functions),
   samma cron-jobb.
5. **Seedade migreringar.** Flera migreringar seedar EDP-data direkt
   (`20260722130000_seed_edp_public_service_faq.sql`, Boston-FTP-migreringarna m.fl.) —
   de kan inte bara raderas ur historiken.

---

## 4. Tre vägar framåt

### Alternativ 1 — Eget repo, delad databas *(rekommenderas)*

Nytt repo `boolsson81/eudroneparts` (eller liknande) med tema, EDP-sidor, EDP-skript, rapporter
och EDP-specifika edge functions. Supabase-projektet delas fortfarande, men EDP-koden deployas
separat och har egen backlog.

- **Fördel:** Snabbast till "egna uppdateringar i eget projekt". Ingen datamigrering. DigitalSignal-repot krymper rejält (≈600 filer bort direkt bara på kategori A).
- **Nackdel:** Databasen är fortfarande gemensam — migreringar måste fortsatt koordineras.
- **Insats:** Mellan. Kan göras stegvis (tema och rapporter först, kod sedan).

### Alternativ 2 — Eget repo *och* egen Supabase

Full separation: eget Supabase-projekt, egna secrets (Shopify, Sunsky, Fortnox), egna cron.

- **Fördel:** Verklig isolering — inget i DigitalSignal kan gå sönder av EDP-arbete.
- **Nackdel:** Datamigrering av EDP-tabeller, dubbla Fortnox-/Shopify-kopplingar, dubbla kostnader.
- **Insats:** Stor.

### Alternativ 3 — Monorepo med tydliga gränser

Behåll ett repo men flytta till `apps/digitalsignal/`, `apps/eudroneparts/`, `packages/shared/`.

- **Fördel:** Ingen delad-databas-problematik, gemensamma beroenden.
- **Nackdel:** Löser inte "eget projekt" i praktiken — samma PR-flöde, samma CI, samma risk.
- **Insats:** Mellan, men lägre utdelning.

---

## 5. Föreslagen ordning (om alternativ 1 väljs)

| Steg | Innehåll | Risk |
|---|---|---|
| 1 | Nytt repo + flytta `theme/`, `shopify-theme/`, `data/edp-*` | Ingen — inget kod-beroende |
| 2 | Flytta ~136 rapport-/CSV-filer från repo-roten till nya repots `docs/` | Ingen |
| 3 | Flytta EDP-skript (`scripts/*edp*`, `*sunsky*`, `*boston*`) | Låg — fristående `.mjs` |
| 4 | Flytta EDP-edge functions (sunsky, edp-launch, eudroneparts-token) | Mellan — kräver deploy till samma Supabase från nytt repo |
| 5 | Bryt ut publika drönarsidor (`/kommersiella-dronare/*`) till egen frontend | Mellan — SEO/rutter/sitemap måste följa med |
| 6 | Beslut om kategori B (SMP, cloner, compliance, inventory) | — |

---

## 6. Fattade beslut

| Fråga | Beslut |
|---|---|
| Målbild | **Alternativ 1** — eget repo, delad Supabase |
| Service Management Portal (SMP) | Stannar i DigitalSignal som SaaS-modul |
| Shopify Cloner | Följer med EU Drone Company |
| Compliance / HS-kod / GPSR | Följer med EU Drone Company |
| Sunsky-dropship | Stannar i DigitalSignal |
| Lager + leverantörs-FTP (Boston) | Stannar i DigitalSignal |

Följdregel för dokumentationen: **den som äger koden äger rapporterna.** Därför följer
`SUNSKY_*`, `BOSTON_*`, `INVENTORY_*` och servicportalens rapporter med DigitalSignal,
medan tema-, meny-, kollektions-, cloner- och compliancerapporterna flyttar.

## 7. Genomfört

Utfört av `scripts/extract-eudroneparts.mjs` (kör med `--prune` för att också ta bort ur
det här repot). Exakt innehåll: `docs/eudroneparts-extraction-manifest.md`.

| Flyttat till `eudroneparts` | Antal |
|---|---|
| `theme/` + `shopify-theme/` (Shopify-tema och sektioner) | 473 filer |
| `data/edp-*.json` | 26 |
| Edge functions (cloner, edp-launch, meny-/migreringspass, compliance) | 19 |
| Delade moduler som flyttades helt | 30 |
| Drift- och migreringsskript (inkl. `scripts/lib`, `scripts/executors`) | 142 |
| Innehållsmoduler under `src/data` och `src/lib` | 11 |
| Rapporter och revisioner (repo-roten → `docs/reports/`) | 156 |
| `[functions.*]`-block i `supabase/config.toml` | 12 |

**Speglade moduler (16).** `cloner-shopify-access`, `compliance-sync`, `dji-compatibility`,
`edp-launch/config`, `missing-product-type-report`, `origin-compliance`,
`product-compliance`, `product-compliance-shopify`, `product-draft-safety`, `shopify-auth`,
`shopify-client`, `shopify-product-feed`, `shopify-product-templates`,
`suggest-product-type`, `sunsky-product-map`, `sunsky-stock` — de används fortfarande av
Sunsky-, leverantörs- och GEO-funktioner som stannade kvar. **DigitalSignal är källan.**
Ändras någon av dem ska ändringen speglas; `npm run check:shared` i eudroneparts-repot
jämför dem. Om Sunsky senare flyttar med krymper listan till ungefär sju.

## 8. Frontend-flytt (steg 5, genomförd)

eudroneparts fick en egen Vite/React-frontend. Detaljer och cutover-checklista:
`docs/FRONTEND_MIGRATION.md`.

| Flyttat | Detalj |
|---|---|
| Driftsvyer | `/admin/shopify-cloner`, `/admin/shopify-drone-clone`, `/admin/product-compliance` |
| Publika drönarsidor | `/kommersiella-dronare/*` — 14 sidkomponenter |
| Stödfiler | 9 komponenter/datafiler som blev föräldralösa här (`EnterpriseNav`, `DroneAccessories`, `commercialDroneIndustries` m.fl.) |
| Nytt i eudroneparts | Slimmad `useAuth`/`useTenant`, `AdminLayout` med rollguard, `Login`, otypad Supabase-klient |

Ändrat här: 26 filer borttagna, rutterna ur `src/App.tsx`, drönargenereringen ur
`scripts/generate-sitemap.ts` (45 URL:er försvann ur sitemapen), 301-omdirigeringar i
`vercel.json`, och ActionKing-värdarna skickas vidare via `VITE_EUDRONECOMPANY_URL`.

Måldomänen är `https://eudronecompany.com` — bolaget och domänen heter numera EU Drone
Company, inte EuroDroneParts.

**Kvar:** sidorna är ActionKing-brandade (`EnterpriseNav` renderar "ActionKing Enterprise",
FAQ-texterna nämner ActionKing). Innehållet flyttades oförändrat och behöver skrivas om.

`src/data/droneRegulations.ts` finns nu i båda repona eftersom
`src/pages/admin/AdminDroneRegulations.tsx` stannade här. Den ingår i drift-kontrollen
(`npm run check:shared`).

## 9. Namnbytet till EU Drone Company

Bolaget och webbutiken heter numera EU Drone Company och ligger på **eudronecompany.com**.
De fyra ccTLD:erna (`eurodroneparts.com/.se/.de/.dk`) är ersatta av en enda domän där
marknaderna skiljs åt med Shopify Markets-underkataloger — `/de`, `/dk`, `/se`, och
engelska som rotmarknad utan `/en/`.

| Ändrat | Var |
|---|---|
| Varumärkesnamn i UI, mejl, fraktsedlar och AI-prompt | `SMP_BRAND`, `customerPortal.ts`, `shippingLabelPdf.ts`, `smp-*`-functions, e-postmallen |
| `service@eurodroneparts.se` → `service@eudronecompany.com` | Servicportalen, e-postmallen, kolumndefault |
| Hreflang: fyra origins → en domän med marknadsprefix | `edp-hreflang.ts`, `edp-launch/config.ts` |
| `shop_domains`: fyra domäner → en domän med `market_slug` | `shop-seo-connect.ts` + migrering |
| GSC-dataset | `searchconsole_eurodroneparts` → `searchconsole_eudronecompany` |
| Marknadsföringstexter och tema | Innehållsbundlarna i eudroneparts-repot, temats kommentarer |

Databasen ändras av två migreringar, båda applicerade i `digitalsignal-prod`:

| Migrering | Innehåll | Status |
|---|---|---|
| `20260823100822_edp_service_contact_rename.sql` | Portalkonfiguration (returföretag, returmejl) och publika FAQ-svar | Applicerad för hand — **men inte registrerad** i `schema_migrations`, så nästa `db push` kör den igen. Ofarligt: `set default` är idempotent och båda update-satserna matchar noll rader nu. |
| `20260823100823_edp_single_domain_markets.sql` | `shop_domains` och GSC-datasetet | Applicerad och registrerad som version `20260823100823` — `db push` hoppar över den |

Utfall av del 2:

| domain | market_slug | label | primär |
|---|---|---|---|
| `eudronecompany.com` | — | Global (EN) | ✅ |
| `eudronecompany.com` | `se` | Sverige | |
| `eudronecompany.com` | `de` | Tyskland | |
| `eudronecompany.com` | `dk` | Danmark | |
| `euactioncam.com` | — | European Action Cam Company | |

`euactioncam.com` ligger på samma `shop_id` men hör till en annan butiksidentitet och
rördes inte — raderingen träffade bara de fyra `eurodroneparts.*`-domänerna.

**Rollback** om Shopify Markets inte är omlagt än:

```sql
insert into public.shop_domains (shop_id, domain, market_slug, label, is_primary, currency, language)
values
  ('e6ad2afc-e468-49a7-8d33-9b1837419ed8', 'eurodroneparts.com', null, 'Global (EN)', true,  'EUR', 'en'),
  ('e6ad2afc-e468-49a7-8d33-9b1837419ed8', 'eurodroneparts.se',  null, 'Sverige',     false, 'SEK', 'sv'),
  ('e6ad2afc-e468-49a7-8d33-9b1837419ed8', 'eurodroneparts.de',  'de', 'Tyskland',    false, 'EUR', 'de'),
  ('e6ad2afc-e468-49a7-8d33-9b1837419ed8', 'eurodroneparts.dk',  null, 'Danmark',     false, 'DKK', 'da');

delete from public.shop_domains
where shop_id = 'e6ad2afc-e468-49a7-8d33-9b1837419ed8' and domain = 'eudronecompany.com';

update public.shops set gsc_bigquery_dataset = 'searchconsole_eurodroneparts'
where id = 'e6ad2afc-e468-49a7-8d33-9b1837419ed8';
```

Observera att `20260820120000_sunsky_orphan_backfill_resume_watchdog_cron.sql` finns i
repot men **inte** är applicerad — nästa `db push` kommer att köra den.

## 10. Kvar att göra

1. **SMP-branding.** `SMP_BRAND`, `service@eurodroneparts.se` och `EDP_SHOP_ID` i
   `src/lib/service-portal/constants.ts` är hårdkodade mot EuroDroneParts. Ska portalen
   säljas till fler kunder behöver det bli tenant-styrt.
2. **`docs/go-live/`** blandar plattformsmigrering och EDP-drift och är inte uppdelad.
3. **Deploy.** `.github/workflows/deploy-functions.yml` i eudroneparts-repot behöver
   hemligheterna `SUPABASE_ACCESS_TOKEN` och `SUPABASE_PROJECT_REF`.
4. **`AdminDroneRegulations`** ligger kvar här och redigerar innehåll som drönarsidorna
   visar. Antingen följer den med, eller så accepteras `droneRegulations.ts` som speglad.
