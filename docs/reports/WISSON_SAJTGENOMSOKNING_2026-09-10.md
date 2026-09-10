# Wisson — genomsökning av tillverkarens sajt

**Datum:** 2026-09-10
**Metod:** Nimble Map + Nimble Extract med drivern `vx8`, samt sökmotorindex.
Domänen är blockerad av sessionens egress-proxy, så `curl` och WebFetch fungerar inte.
**Omfattning:** både `wissonrobotics.com/en/` och `wissonrobotics.com/` (kinesiska).

## Det viktigaste fyndet

Den kinesiska produktmenyn är bredare än den engelska. Engelska sajtens meny listar
sju modeller. Den kinesiska listar nio flygburna modeller plus en helt egen
produktfamilj för elbilsladdning. Vår tidigare kartläggning gjordes bara mot den
engelska sajten och missade därför två modeller.

## Upplagt i butiken

Båda är skapade som `DRAFT` med taggen `wisson-import` och utan pris, enligt
[`scripts/wisson/README.md`](../../scripts/wisson/README.md).

| Modell | Produkt | Källa |
|---|---|---|
| AP30-P2 | `wisson-orion-ap30-p2-flygburen-hogtryckstvatt-30-l-dji-fc30` | `/en/products/AP30-P2.html` |
| AP3-P5 | `wisson-orion-ap3-p5-pliabot-flygburen-sprutmodul-med-luftrida-dji-m400` | `/h-col-406.html` |

**AP30-P2** är en högtryckstvätt med 30 liters tank, munstycke som vrids -60 till
+35° i höjdled och ±45° i sidled, 6 meters räckvidd, laser som mäter
arbetsavståndet och sprutbana som körs automatiskt med flygrutten. Modulen fälls
till 1 meter.

**AP3-P5** är en sprutmodul med luftridå runt strålen. Tillverkaren uppger över
80 % lägre sprutspill, automatisk anpassning av färgmängd och lufttryck efter
arbetsavstånd, och kompatibilitet med fler än tio färgmärken. Den lanserades som
komplement till AP30-P4.

## AP3-P2 är AP30-P2

Prislistans **AP3-P2 "Aerial High-pressure Cleaning System", plattform FC30** är
tillverkarens **AP30-P2**. Produktnamnet är ordagrant detsamma på produktsidan och
plattformen stämmer — AP30-serien är FC30-serien. Prislistan har alltså en
felskrivning i modellbeteckningen.

Det gör att förfrågan om datablad inte längre behövs för specifikationerna.
Modellen är upplagd och mappad i `data/wisson-inkopspriser-202607.json`, så den får
sitt inköpspris så snart frakten är ifylld. Kvar att be Wisson om är produktbilder.

## Hittat men inte upplagt

| Vad | Varför inte |
|---|---|
| **Orion CP-C1** repdriven fasadtvättrobot | Ny lansering utan egen produktsida. Ingen drönarprodukt — den hänger i rep längs fasaden, 0–250 m. Egen kategori. |
| **Orion PWS** intelligent arbetsstation | Repdriven fasadplattform, inte en drönarmodul. Lanserad samtidigt som CP-C1. |
| **AP3-P3 系留喷漆系统** (`/h-col-398.html`) | Målningsvariant av AP3-P3. Butiken har tvättvarianten. Oklart om det är en egen artikel eller en konfiguration. |
| **CF1, CS1, hemmaladdare** | Automatiska laddrobotar för elbilar, tillverkarens Monos-serie. En annan bransch än drönare. |

## AP3-S1

Modullistan är bekräftad ur Wissons egen text: AP3-S1 består av **AP3-P3-roboten,
en DJI Matrice 400 och AP-P-seriens DIC-vattenrening**, med vattenhantering och
rengöringsmedel som kringutrustning. Källa `/en/h-nd-305.html`, nu i
`data/wisson-source-extract.json` under `systems`.

Paketet har fått en egen sida, `wisson-ap3-s1`, opublicerad som övriga
Wisson-sidor. Den beskriver de tre kärnmodulerna och kringutrustningen, och säger
uttryckligen att AP3-S1 inte är en egen maskin utan ett namn på ekipaget. Delarna
säljs vidare var för sig; ingen paketprodukt är skapad.

## Sidor

Wisson-startsidan länkar nu AP3-S1 vid sidan av de fyra serierna. P-seriesidan
listar sex system i stället för fyra. Båda sidornas SEO-beskrivningar är
uppdaterade i butiken. Temamallarna under `theme/templates/` är regenererade men
måste deployas separat med `node scripts/push-edp-theme.mjs`.

Inga nya landningssidor är byggda. Om CP-C1 och PWS ska säljas behöver de en egen
sida — de är fasadrobotar, inte drönartillbehör, och passar inte under
Orion-sidorna.

## Att bestämma

1. Ska laddrobotarna (CF1, CS1, hemmaladdare) säljas alls? De ligger utanför
   drönarsortimentet.
2. Ska CP-C1 och PWS läggas upp? Då behövs en egen kategori och egna sidor.
3. Ska AP3-S1 också bli en köpbar paketprodukt, eller räcker sidan plus de
   enskilda artiklarna?
