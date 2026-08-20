# EuroDroneParts — Vad återstår att bygga

**Butik:** Europe Drone Parts (`ya1xhg-x6.myshopify.com`)  
**Genererad:** 2026-06-13  
**Språk:** Svenska (statusrapport efter English-first-migrering)

---

## Sammanfattning

English-first-migreringen för **kollektioner, sidor, menyer och redirects** är **genomförd live**. Taxonomin (8 pelare, 11 reservdelsmodeller, Enterprise Software) finns i Shopify admin med engelska handles.

**P0 är genomfört** (2026-06-13) — se `P0_FINISH_REPORT.md`:
- Neo-hub `dji-neo-spare-parts` återskapad (129 produkter)
- Tema kopplat till kanoniska menyer (`enterprise`, `spare-parts`, `service-support`, `business`)
- 369 duplicerade/testmenyer borttagna (592 → 9 produktionsmenyer efter P1)

Det som **återstår** faller i tre spår:

---

## ✅ Klart (genomfört live)

| Område | Resultat |
|---|---|
| **Kollektioner** | 58 svenska handles → engelska; 6 merge-grupper klara; 63 nya reservdelskollektioner skapade |
| **Sidor** | 15 renames; `enterprise-software` skapad |
| **Redirects** | 322 st 301-regler deployade |
| **Menyer** | Engelska URL:er i `main-menu`, `enterprise`, `spare-parts`, `service-support`, `business` + legacy `*-deploy`-menyer uppdaterade parallellt |
| **Taxonomi** | 8 pelare, 11 reservdelsmodellgrupper i menyplan, Enterprise Software i enterprise-menyn |
| **Artefakter** | `ENGLISH_MIGRATION_EXECUTION_REPORT.md`, `ENGLISH_MIGRATION_RECOVERY_REPORT.md`, `PLANNED_COLLECTION_CREATES.csv` |
| **Kod** | `scripts/run-english-migration-execute.mjs`, recovery-script, Shopify Admin-klient med mutationer |

---

## ✅ P0 klart (2026-06-13)

| Uppgift | Resultat |
|---|---|
| Neo-hub `dji-neo-spare-parts` | ✅ Skapad, 129 produkter |
| Tema → kanoniska menyhandles | ✅ `header-group.json` uppdaterad live |
| Meny-städning | ✅ 369 menyer borttagna |
| Legacy `*-deploy`-menyer | ✅ Borttagna |

---

## ✅ P1 klart (2026-06-13)

| Uppgift | Resultat |
|---|---|
| Smart collection-regler | ✅ 143 kollektioner — alla 11 modeller 12/12 komponenter |
| Enterprise Software-sida | ✅ Uppdaterad med Pilot 2, FlightHub 2, Terra, Modify |
| Meny-städning fas 2–3 | ✅ 237 legacy-menyer borttagna (592 → 9 produktionsmenyer) |

Rapporter: `P1_BUILD_REPORT.md`, `P1_RULES_RECOVERY_REPORT.md`  
Script: `scripts/run-p1-build.mjs`, `scripts/run-p1-rules-recovery.mjs`

### Reservdelar — 11 modellgrupper (live-status efter P1)

| Modell | Hub-produkter | Komponenter | Status |
|---|---:|---|---|
| DJI Mini 4 Pro | 127 | 12/12 | **Klar** |
| DJI Air 3 | 6 | 12/12 | **Klar** |
| DJI Air 3S | 122 | 12/12 | **Klar** |
| DJI Neo | 265 | 12/12 | **Klar** (bred hub — kan fintrimmas) |
| DJI Flip | 162 | 12/12 | **Klar** |
| DJI Avata 2 | 155 | 12/12 | **Klar** |
| DJI Mavic 3 Enterprise | 5 | 12/12 | **Klar** |
| DJI Matrice 4 Series | 21 | 12/12 | **Klar** |
| DJI Matrice 30 Series | 91 | 12/12 | **Klar** |
| DJI Matrice 350 RTK | 88 | 12/12 | **Klar** |
| DJI FlyCart 30 | 85 | 12/12 | **Klar** |

---

## ✅ P2 klart (2026-06-13)

| Uppgift | Resultat |
|---|---|
| Blogg `nyheter` → `news` | ✅ 68 artiklar med engelska sluggar |
| Blogg-redirects | ✅ Uppdaterade till kuraterade engelska sluggar |
| Meny-städning | ✅ 9 produktionsmenyer kvar |
| Menytitlar | ⚠️ `customer-account-main-menu` kvar svensk (API blockerar pga trasiga kundkonto-länkar) |
| Markets | ✅ 6 marknader konfigurerade (endast Sverige aktiv) |
| Neo hub | ✅ Regler förfinade (272 produkter) |

Rapport: `P2_REMAINING_REPORT.md`

### Shopify Markets (live-status)

| Marknad | Handle | Aktiv |
|---|---|---|
| Sverige (primary) | `se` | ✅ |
| Tyskland | `tyskland` | ❌ |
| Danmark | `danmark` | ❌ |
| Finland | `finland` | ❌ |
| Frankrike | `frankrike` | ❌ |
| Italien | `italien` | ❌ |

**Manuellt kvar:** Aktivera EU-marknader, koppla domäner (`.de`, `.dk`, etc.), Translate & Adapt.

---

## ⏸️ P3 — Medvetet uppskjutet (separata projekt)

### Produkthandles — ~2 378 svenska

| Metrik | Värde |
|---|---:|
| Totalt produkter | ~9 389 |
| Svenska handles | ~2 378 |
| Blockerad i denna migrering | Ja |

**Åtgärd:** Separat projekt med batch-rename, redirect-karta per produkt, SEO-riskanalys. Påverkar **inte** kollektioner/menyer som redan migrerats.

---

## 📋 Rekommenderad byggordning

```
Vecka 1 (P0)
├── Fixa dji-neo-spare-parts hub + produktkoppling
├── Theme → kanoniska menu-handles
└── Meny-städning (592 → 11)

Vecka 2 (P1)
├── Smart collection-regler för nya reservdelskollektioner (Air 3S, Flip, Avata 2, Matrice 30, Neo)
├── Fyll delvisa modeller (Mavic 3E, Matrice 350, FlyCart 30)
└── Enterprise Software landningssida

Vecka 3 (P2)
├── Shopify Markets + Translate & Adapt
├── Metaobject dji-drone-model
└── Post-migration audit + sign-off

Senare (P3)
├── Blog-migrering (18 hybrid + övriga)
└── Produkthandle-migrering (~2 378 st)
```

---

## Relaterade pågående spår (utanför denna migrering)

Från övriga repo-rapporter — **inte blockerande** för taxonomin men relevanta för butiken:

| Spår | Dokument | Status |
|---|---|---|
| DJI compatibility engine | `DJI_COMPATIBILITY_ARCHITECTURE.md` | Kod i workspace, ej committad/deployad |
| Inventory / HS code | `INVENTORY_COMPLIANCE_FIX.md` | Delvis |
| Cloner / Sunsky publish | `EURODRONEPARTS_FINAL_MIGRATION_REPORT.md` | Supabase-projektsplit blockerar deploy |
| Menu cleanup audit | `EURODRONEPARTS_MENU_CLEANUP_AUDIT.md` | Safe audit klar, execute väntar |

---

## Snabbreferens — filer

| Fil | Innehåll |
|---|---|
| `ENGLISH_MIGRATION_EXECUTION_REPORT.md` | Vad som kördes live |
| `ENGLISH_MIGRATION_RECOVERY_REPORT.md` | Smart-merge + meny-fix |
| `PLANNED_COLLECTION_CREATES.csv` | 68 planerade/skapat kollektioner |
| `FINAL_EXECUTION_SIGNOFF_REPORT.md` | Pre-execution checklist (behöver uppdateras) |
| `FINAL_MENU_HIERARCHY.md` | Mål-menyer |
| `REDIRECT_MAPPING.csv` | 322 redirect-regler |

---

## Slutsats

**Taxonomi-skelettet är live. P0, P1 och P2 är stängda.**

**Nästa steg:**

1. **Aktivera EU-marknader** + Translate & Adapt
2. **Produkthandle-migrering** (~2 378 svenska) — separat godkänt projekt
3. **Metaobject** `dji-drone-model` — skapa när compatibility engine deployas
4. **Merge PR #59** till `main`
