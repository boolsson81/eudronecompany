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

## Måldomän — inte bekräftad, och apexen är upptagen

Bolaget och domänen heter numera EU Drone Company, inte EuroDroneParts. Men
`eudronecompany.com` kan **inte** vara måldomän för 301:orna, för apexen är Shopifys:

| Namn | Post | Pekar på |
|---|---|---|
| `eudronecompany.com` | `A 23.227.38.65` | Shopify |
| `www.eudronecompany.com` | `CNAME shops.myshopify.com` | Shopify |

Det är rätt DNS för butiken (en domän, marknader via `/se`, `/de`, `/dk` — se
[`SEPARATION.md`](SEPARATION.md) §9). Konsekvensen är att `/kommersiella-dronare/*` inte
finns på den värden: kör man cutovern med apexen som mål blir alla 45 URL:erna nedan 404.

Frontenden i det här repot är inte deployad någonstans. Innan checklistan kan köras behöver
en egen värd väljas — en subdomän (t.ex. `dronare.eudronecompany.com`) är det enda som
fungerar utan att röra butiken. När den är vald ska den sättas på tre ställen:

- `VITE_SITE_ORIGIN` i det här projektets Vercel-inställningar (se nedan)
- `vercel.json` i digitalsignal → `redirects[].destination` (301:orna från
  `app.digitalsignal.io`)
- Miljövariabeln `VITE_EUDRONECOMPANY_URL` i digitalsignals Vercel-projekt (fallback i
  koden är `https://eudronecompany.com`, alltså butiken — variabeln måste sättas explicit
  när frontenden hamnar på en subdomän)

`EDP_DOMAIN` i `src/lib/edp-hreflang.ts` och `supabase/functions/_shared/edp-launch/config.ts`
är butikens domän och ska stå kvar som `eudronecompany.com` oavsett vad frontenden får.

### `VITE_SITE_ORIGIN` — canonical-URL:erna

Efter flytten hit hade nio av tio drönarsidor `https://actionking.se` hårdkodat som
canonical, och samma domän i brödsmulor, JSON-LD och `RelatedPages`. Deployade som de var
hade varje sida sagt åt Google att originalet ligger kvar hos ActionKing — 301:orna hade
inte hjälpt, för sidorna hade pekat bort från sig själva.

Origin läses numera ur `VITE_SITE_ORIGIN` via [`src/lib/site.ts`](../src/lib/site.ts).
Ingen default: `npm run build` avbryts om variabeln saknas (kontrollen ligger i
`vite.config.ts`), medan `npm run dev` faller tillbaka på sidans egen origin.
`BRAND_ORIGIN` i samma modul är butiken, `https://eudronecompany.com`, och används där
JSON-LD ska peka på bolaget — `Organization`, `publisher`, `provider`.

De ~65 produktlänkarna till `actionking.se` är orörda; de är en separat fråga, se nedan.

`src/lib/hreflang.ts` är borttagen i samma veva. Den var DigitalSignals SV/EN-karta
(`/kundcase`, `/moduler`, `/blogg` …) och `SeoHead` föll tillbaka på den när en sida inte
skickade egna alternates — alltså på alla sidor. Av appens rutter matchade exakt en, `/`,
vilket gjorde att startsidan emitterade `<link rel="alternate">` mot
`https://app.digitalsignal.io` — just den domän 301:orna ska leda bort ifrån. `SeoHead`
sätter numera hreflang bara när en sida uttryckligen skickar dem, och den här appen har
ingen SV/EN-uppdelning som behöver det.

**Att göra samtidigt som domänen sätts:** `RelatedPages` slår upp den aktuella sidan i
Supabase-tabellen `pages` på exakt URL. Raderna där innehåller fortfarande
`actionking.se`-URL:er, så avsnittet "Relaterade sidor" kommer tyst att sluta renderas
(komponenten returnerar utan träff — inget fel kastas). Uppdatera `pages.url` till den nya
origin i samma sväng.

### Vercel-projektet `european-drone-company`

Tomt: noll deployments, ingen Git-koppling, `live: false`. Apex och `www` låg tillagda som
domäner där, vilket gav Vercels återkommande "misconfigured domains"-varningar — DNS pekar
ju på Shopify, inte på projektet. Domänerna ska tas bort från projektet (Project → Settings
→ Domains → Remove), eller projektet raderas. Ingen trafik påverkas; butiken har aldrig
gått via Vercel.

## Varumärket: omskrivet, men shoplänkarna kvarstår

Prosan är omskriven från ActionKing till EU Drone Company 2026-08-23 — 145 förekomster i
24 filer: rubriker, FAQ-svar, SEO-titlar, JSON-LD-organisationsnamn, footer och
GDPR-samtycket i kontaktformuläret.

**Kvar: 51 unika länkar till `actionking.se`**, fördelade på
`src/data/droneAccessories.ts` (46), `src/data/enterpriseCameraProducts.ts` (11),
`src/data/droneCameras.ts` (6) och butikslänken i `src/components/DroneAccessories.tsx`.
De pekar på ActionKings produkt- och söksidor, och komponenten renderar dem med etiketten
"Se på ActionKing.se" — sidan säger alltså EU Drone Company i rubrikerna men skickar
köparen till ActionKing.

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

0. Välj värd för frontenden (subdomän — apexen är Shopifys, se ovan) och sätt
   `VITE_SITE_ORIGIN` i Vercel-projektet.
1. Deploya eudronecompany-frontenden och bekräfta att alla 45 sökvägar svarar 200, och att
   deras canonical pekar på samma domän.
2. Sätt `VITE_EUDRONECOMPANY_URL` i digitalsignals Vercel-projekt.
3. Uppdatera `vercel.json` med rätt måldomän och deploya digitalsignal.
4. Verifiera 301 på ett par sökvägar.
5. Lämna in den nya sajtens sitemap i Search Console och bevaka indexeringen.
6. `actionking.se` renderar inte längre drönarsajten — den skickas vidare till den nya
   domänen (`src/App.tsx`, `src/pages/Index.tsx`). Peka hellre om DNS/Vercel-domänen direkt
   när den nya sajten är live, så slipper man dubbelhoppet.
