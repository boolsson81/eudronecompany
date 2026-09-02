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
fungerar utan att röra butiken. När den är vald står domänen på två ställen och båda måste
peka åt samma håll:

- `vercel.json` → `redirects[].destination` (301:orna från `app.digitalsignal.io`)
- Miljövariabeln `VITE_EUDRONECOMPANY_URL` i digitalsignals Vercel-projekt (fallback i
  koden är `https://eudronecompany.com`, alltså butiken — variabeln måste sättas explicit
  när frontenden hamnar på en subdomän)

`EDP_DOMAIN` i `src/lib/edp-hreflang.ts` och `supabase/functions/_shared/edp-launch/config.ts`
är butikens domän och ska stå kvar som `eudronecompany.com` oavsett vad frontenden får.

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

**10 av dem 404:ar i nuvarande frontend.** Wildcard-redirecten bevarar sökvägen, men
taxonomin har ändrats sedan URL:erna indexerades: fem sidor som var branscher på
`app.digitalsignal.io` är numera lösningar under en annan bransch. Kör man cutovern som den
står nu landar de tio på appens 404-vy i stället för på innehållet.

Verifierat 2026-09-02 genom att köra samtliga 45 mot `vite preview` av nuvarande build.

| Indexerad URL (sökväg) | Innehållet finns nu på |
|---|---|
| `/kommersiella-dronare/faltkartlaggning` | `/kommersiella-dronare/lantbruk/faltkartlaggning` |
| `/kommersiella-dronare/faltkartlaggning/3d-modellering` | `/kommersiella-dronare/kartlaggning/3d-modellering` |
| `/kommersiella-dronare/fasadinspektion` | `/kommersiella-dronare/inspektion/fasadinspektion` |
| `/kommersiella-dronare/fasadinspektion/precisionsspruta` | `/kommersiella-dronare/lantbruk/precisionsspruta` |
| `/kommersiella-dronare/raddningsinsatser` | `/kommersiella-dronare/sakerhet/raddningsinsatser` |
| `/kommersiella-dronare/raddningsinsatser/ledningsinspektion` | `/kommersiella-dronare/energi/ledningsinspektion` |
| `/kommersiella-dronare/transformatorinspektion` | `/kommersiella-dronare/energi/transformatorinspektion` |
| `/kommersiella-dronare/transformatorinspektion/fastighetsfotografi` | `/kommersiella-dronare/film-media/fastighetsfotografi` |
| `/kommersiella-dronare/volymberakning` | `/kommersiella-dronare/kartlaggning/volymberakning` |
| `/kommersiella-dronare/volymberakning/perimetersakerhet` | `/kommersiella-dronare/sakerhet/perimetersakerhet` |

De åtta andranivå-URL:erna parar dessutom ihop en gammal bransch med en lösning som numera
hör till en helt annan bransch — det var alltså inte bara en omflyttning, utan en annan
indelning. Vill man behålla länkkraften behövs explicita 301:or per URL, inte bara
wildcarden. Notera också att en gammal branschsida listade flera lösningar medan målet är en
enskild lösningssida: innehållet är inte identiskt, så det är ett beslut om det är rätt mål
eller om de i stället ska peka på den nya branschsidan.

**Åtgärdat:** `vercel.json` har nu explicita 301:or för alla tio, med målen i tabellen ovan.
`scripts/__tests__/legacy-url-redirects.test.ts` kontrollerar att varje mål fortfarande
motsvarar en sida som finns, så att en framtida taxonomiändring fångas i testet i stället
för i Search Console.

Kvar att avgöra: en gammal branschsida listade flera lösningar medan målet är en enskild
lösningssida. Innehållet är alltså inte identiskt. Bedöm om målen ska vara lösningarna (som
nu) eller de nya branschsidorna — de fem ennivå-URL:erna är de som berörs.

Övriga 35 URL:er svarar korrekt. Listan finns för att kunna verifieras i Search Console
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

0. Välj värd för frontenden (subdomän — apexen är Shopifys, se ovan).
1. Deploya eudronecompany-frontenden och bekräfta att alla 45 sökvägar svarar 200.
2. Sätt `VITE_EUDRONECOMPANY_URL` i digitalsignals Vercel-projekt.
3. Uppdatera `vercel.json` med rätt måldomän och deploya digitalsignal.
4. Verifiera 301 på ett par sökvägar.
5. Lämna in den nya sajtens sitemap i Search Console och bevaka indexeringen.
6. `actionking.se` renderar inte längre drönarsajten — den skickas vidare till den nya
   domänen (`src/App.tsx`, `src/pages/Index.tsx`). Peka hellre om DNS/Vercel-domänen direkt
   när den nya sajten är live, så slipper man dubbelhoppet.
