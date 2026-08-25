# Frontend-flytt: publika drönarsidor och driftsvyer

**Datum:** 2026-08-20
**Från:** `boolsson81/digitalsignal` (`app.digitalsignal.io`)
**Till:** `boolsson81/eudronecompany`

## Vad som flyttade

| Yta | Rutter |
|---|---|
| Publika drönarsidor | `/kommersiella-dronare` + 13 undersidor (14 sidkomponenter) |
| Shopify Cloner | `/admin/shopify-cloner`, `/admin/shopify-cloner/:migrationId` |
| Drone Clone | `/admin/shopify-drone-clone` |
| Produktcompliance | `/admin/product-compliance` |

Sökvägarna är oförändrade i den nya appen, så omdirigeringarna behöver bara byta domän.

## Måldomän

`https://eudronecompany.com` — bolaget och domänen heter numera EU Drone Company, inte
EuroDroneParts. Domänen står på två ställen och båda måste peka åt samma håll:

- `vercel.json` → `redirects[].destination` (301:orna från `app.digitalsignal.io`)
- Miljövariabeln `VITE_EUDRONECOMPANY_URL` i digitalsignals Vercel-projekt (fallback i
  koden är samma domän, så variabeln behövs bara om ni testar mot något annat)

## Varumärket: omskrivet, men shoplänkarna kvarstår

Prosan är omskriven från ActionKing till EU Drone Company 2026-08-23 — 145 förekomster i
24 filer: rubriker, FAQ-svar, SEO-titlar, JSON-LD-organisationsnamn, footer och
GDPR-samtycket i kontaktformuläret.

**Kvar: 63 unika länkar till `actionking.se`.** De ligger i `src/data/droneAccessories.ts`
(57 tillbehör) och pekar på ActionKings produktsidor. `DroneAccessories`-komponenten
renderar dem med etiketten "Se på ActionKing.se", vilket betyder att sidan säger
EU Drone Company i rubrikerna men skickar köparen till ActionKing.

Länkarna är **inte** omskrivna, och det är avsiktligt: handles i EU Drone Company-butiken
är engelska efter migreringen, ActionKing-URL:erna är svenska, och ingen av
mappningsfilerna under `docs/reports/` täcker dem. En blind omskrivning hade gett 63 döda
länkar i stället för 63 länkar till fel butik.

För att lösa det behövs antingen en handle-mappning från EU Drone Company-butikens katalog,
eller ett beslut att tillbehören ska fortsätta säljas via ActionKing.

## 45 indexerade URL:er som behöver 301

Wildcard-redirecten ovan täcker alla. Listan finns för att kunna verifieras i Search Console
efter cutover:

- https://app.digitalsignal.io/kommersiella-dronare
- https://app.digitalsignal.io/kommersiella-dronare/faltkartlaggning
- https://app.digitalsignal.io/kommersiella-dronare/faltkartlaggning/3d-modellering
- https://app.digitalsignal.io/kommersiella-dronare/fasadinspektion
- https://app.digitalsignal.io/kommersiella-dronare/fasadinspektion/precisionsspruta
- https://app.digitalsignal.io/kommersiella-dronare/inspektion
- https://app.digitalsignal.io/kommersiella-dronare/inspektion/takinspektion
- https://app.digitalsignal.io/kommersiella-dronare/jamfor-kameror
- https://app.digitalsignal.io/kommersiella-dronare/jamforelser
- https://app.digitalsignal.io/kommersiella-dronare/jamforelser/agras-t50-vs-mavic-3-multispectral
- https://app.digitalsignal.io/kommersiella-dronare/jamforelser/inspire-3-vs-mavic-3-pro
- https://app.digitalsignal.io/kommersiella-dronare/jamforelser/mavic-3-enterprise-vs-matrice-350-rtk
- https://app.digitalsignal.io/kommersiella-dronare/kameror
- https://app.digitalsignal.io/kommersiella-dronare/kameror/zenmuse-h20t
- https://app.digitalsignal.io/kommersiella-dronare/kameror/zenmuse-h30
- https://app.digitalsignal.io/kommersiella-dronare/kameror/zenmuse-h30t
- https://app.digitalsignal.io/kommersiella-dronare/kameror/zenmuse-l2
- https://app.digitalsignal.io/kommersiella-dronare/kameror/zenmuse-p1
- https://app.digitalsignal.io/kommersiella-dronare/kameror/zenmuse-s1
- https://app.digitalsignal.io/kommersiella-dronare/kameror/zenmuse-v1
- https://app.digitalsignal.io/kommersiella-dronare/konfiguration/energi
- https://app.digitalsignal.io/kommersiella-dronare/konfiguration/film-media
- https://app.digitalsignal.io/kommersiella-dronare/konfiguration/inspektion
- https://app.digitalsignal.io/kommersiella-dronare/konfiguration/kartlaggning
- https://app.digitalsignal.io/kommersiella-dronare/konfiguration/lantbruk
- https://app.digitalsignal.io/kommersiella-dronare/konfiguration/sakerhet
- https://app.digitalsignal.io/kommersiella-dronare/kontakt
- https://app.digitalsignal.io/kommersiella-dronare/produkter
- https://app.digitalsignal.io/kommersiella-dronare/raddningsinsatser
- https://app.digitalsignal.io/kommersiella-dronare/raddningsinsatser/ledningsinspektion
- https://app.digitalsignal.io/kommersiella-dronare/regelverk
- https://app.digitalsignal.io/kommersiella-dronare/regelverk/open-a1
- https://app.digitalsignal.io/kommersiella-dronare/regelverk/open-a2
- https://app.digitalsignal.io/kommersiella-dronare/regelverk/open-a3
- https://app.digitalsignal.io/kommersiella-dronare/regelverk/specific
- https://app.digitalsignal.io/kommersiella-dronare/transformatorinspektion
- https://app.digitalsignal.io/kommersiella-dronare/transformatorinspektion/fastighetsfotografi
- https://app.digitalsignal.io/kommersiella-dronare/utbildning/energi
- https://app.digitalsignal.io/kommersiella-dronare/utbildning/film-media
- https://app.digitalsignal.io/kommersiella-dronare/utbildning/inspektion
- https://app.digitalsignal.io/kommersiella-dronare/utbildning/kartlaggning
- https://app.digitalsignal.io/kommersiella-dronare/utbildning/lantbruk
- https://app.digitalsignal.io/kommersiella-dronare/utbildning/sakerhet
- https://app.digitalsignal.io/kommersiella-dronare/volymberakning
- https://app.digitalsignal.io/kommersiella-dronare/volymberakning/perimetersakerhet

## Checklista vid cutover

1. Deploya eudronecompany-frontenden och bekräfta att alla 45 sökvägar svarar 200.
2. Sätt `VITE_EUDRONECOMPANY_URL` i digitalsignals Vercel-projekt.
3. Uppdatera `vercel.json` med rätt måldomän och deploya digitalsignal.
4. Verifiera 301 på ett par sökvägar.
5. Lämna in den nya sajtens sitemap i Search Console och bevaka indexeringen.
6. `actionking.se` renderar inte längre drönarsajten — den skickas vidare till den nya
   domänen (`src/App.tsx`, `src/pages/Index.tsx`). Peka hellre om DNS/Vercel-domänen direkt
   när den nya sajten är live, så slipper man dubbelhoppet.
