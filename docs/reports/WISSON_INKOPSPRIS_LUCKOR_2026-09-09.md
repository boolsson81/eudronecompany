# Wisson — varför saknar produkter inköpspris

**Datum:** 2026-09-09
**Underlag:** [`data/wisson-inkopspriser-202607.json`](../../data/wisson-inkopspriser-202607.json),
avstämt mot butiken ya1xhg-x6 via Admin GraphQL 2026-09-09.
**Bakgrund:** [`WISSON_INKOPSPRISER_2026-09-08.md`](./WISSON_INKOPSPRISER_2026-09-08.md)

Kalkylbladet ligger inte i repot. Avstämningen är gjord mot den utdragna
datafilen, som har tio modellrader från prislistan juli 2026.

## Läget i butiken

Butiken har 39 Wisson-produkter fördelade på två leverantörsnamn. Elva varianter
över åtta produkter har `Cost per item` satt. Samtliga elva ligger under
leverantörsnamnet **Wisson Robotics** och är skrivna vid körningen 2026-09-08.

| Leverantör | Produkter | Med inköpspris |
|---|---:|---:|
| Wisson Robotics | 31 | 8 |
| Wisson | 8 | 0 |

## Fyra orsaker

### 1. Sortimentet finns i två uppsättningar och mappningen pekar på den gamla

Orion-sortimentet lades in på nytt 2026-09-09 med leverantörsnamnet `Wisson`
(åtta produkter, handles `wisson-orion-<modell>-...`). Datafilens `shopify`-block
pekar fortfarande på de äldre produkterna under `Wisson Robotics`. Ingen av de
åtta nya produkterna finns i mappningen, så ingen av dem får ett inköpspris.

Detta är också förklaringen till att **AP3-G1** står som saknad i förra
rapporten. Modellen finns numera i butiken, som
`wisson-orion-ap3-g1-pliabot-flygburet-gripdon-dji-m300-m350`, men saknas i
mappningen och har därför inget pris.

### 2. Skriptet skriver just nu ingenting alls

Efter övergången till landat inköpspris kräver skriptet `frakt_sek` per modell.
Alla tio modeller har `frakt_sek: null`, så en körning ger noll varianter:

```
0 varianter (dry run, inget skrivs)
Hoppar över utan angiven frakt: AP3-P3 - Standard, AP3-P3 - Pro, AP3-P1,
AP30-N1, AP30-G2, AP-P DIC Water Treatment System, AP3-D1
```

Priserna som ligger i butiken är alltså varuvärdet utan frakt och tull från
körningen dagen innan. Inget nytt skrivs förrän fraktbeloppen är ifyllda.

### 3. Tre modeller i prislistan har ingen produkt i butiken

**AP3-P2** (7 366 €), **AP3-G1** (3 647 €, EOL) och **AP30-N2** (8 581 €, EOL).
Sökning i butiken ger noll träffar på AP3-P2 och AP30-N2. AP3-G1 finns numera,
se punkt 1.

Beslut 2026-09-10: **AP3-P2** ska läggas upp, men först när Wisson skickat
datablad och bilder — modellen saknas även på wissonrobotics.com, så vi har inga
fakta att bygga en sida på. Förfrågan ligger som utkast i
[`WISSON_FORFRAGAN_AP3-P2.md`](./WISSON_FORFRAGAN_AP3-P2.md). **AP30-N2** läggs
inte upp; den är utgången och har bara en modellbeteckning i listan. Båda
besluten står i `beslut`-fältet på respektive artikel i datafilen.

### 4. Tillbehör, reservdelar och två sprutmodeller har inga listpriser

Tjugotre produkter under `Wisson Robotics` är tillbehör och förbrukningsmaterial:
slangar, vinschar, munstycken, kablar, verktyg, trälåda, manual, garantibevis och
kvalitetsintyg. Prislistan juli 2026 prissätter bara systemen, så de har inget
underlag att hämta ett inköpspris från.

**AP30-P4** och **AP30-P4H** finns i butiken under båda leverantörsnamnen men
saknas i prislistan.

## Vad som krävs för full täckning

1. Fyll i `frakt_sek` per modell. Utan den skriver skriptet ingenting.
2. Peka om `shopify`-blocken till Orion-produkterna under leverantör `Wisson`,
   eller lägg till dem vid sidan av de gamla. Avgör först vilken uppsättning som
   ska leva vidare — dubbletterna ger annars dubbla lagervärden.
3. Begär pris på AP30-P4 och AP30-P4H samt på tillbehören från Wisson.
4. AP3-P2: skicka förfrågan om datablad och lägg upp modellen när svaret kommer.
   AP30-N2 är avförd.
