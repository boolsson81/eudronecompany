# Wisson Orion — import och landningssidor

**Datum:** 2026-09-09
**Källa:** https://www.wissonrobotics.com/en/
**Körning:** tagg `wisson-import`, granskningstagg `draft-granskas`
**Återförsäljaravtal:** bekräftat med Wisson Technology (Shenzhen) 2026-09-09.
Sortimentet får säljas och leverantörens bildmaterial användas. Kontakt hos Wisson:
`bd@wissonrobotics.com` för försäljning, `support@wissonrobotics.com` för eftermarknad.

## Vad som skapades

### Kollektion

| Handle | Titel | ID |
|---|---|---|
| `wisson-orion` | Wisson Orion — flygburna robotsystem | `671509184840` |

### Produkter — 8 st, samtliga `DRAFT`

| Modell | Handle | Serie | Plattform |
|---|---|---|---|
| AP30-N1 | `wisson-orion-ap30-n1-pliabot-flygburen-manipulator-dji-fc30` | N | DJI FlyCart 30 |
| AP3-G1 | `wisson-orion-ap3-g1-pliabot-flygburet-gripdon-dji-m300-m350` | G | DJI M300/M350 |
| AP30-G2 | `wisson-orion-ap30-g2-flygburen-lastslappare-40-kg-dji-fc30` | G | DJI FlyCart 30 |
| AP3-P1 | `wisson-orion-ap3-p1-pliabot-flygburen-sprutmodul-dji-m300-m350` | P | DJI M300/M350 |
| AP3-P3 | `wisson-orion-ap3-p3-pliabot-fasadtvattsystem-dji-m400` | P | DJI M400 |
| AP30-P4 | `wisson-orion-ap30-p4-pliabot-flygburen-dimspruta` | P | ej angiven av källan |
| AP30-P4H | `wisson-orion-ap30-p4h-pliabot-flygburen-hogtrycksspruta` | P | ej angiven av källan |
| AP3-D1 | `wisson-orion-ap3-d1-flygburen-kontaktinspektionsrobot-dji-m300-m350` | D | DJI M300/M350 |

### Sidor — 7 st, samtliga opublicerade

| Handle | Typ | Temamall |
|---|---|---|
| `wisson` | Varumärkesnav | `page.wisson.json` |
| `wisson-n-serien` | Systemsida | `page.wisson-n-serien.json` |
| `wisson-g-serien` | Systemsida | `page.wisson-g-serien.json` |
| `wisson-p-serien` | Systemsida | `page.wisson-p-serien.json` |
| `wisson-d-serien` | Systemsida | `page.wisson-d-serien.json` |
| `fasadtvatt-dronare` | Lösningssida | `page.fasadtvatt-dronare.json` |
| `vindkraftsunderhall-dronare` | Lösningssida | `page.vindkraftsunderhall-dronare.json` |

Mallarna följer samma mönster som `page.jordbruk.json`: sektionen
`enterprise-industry-landing` med fyra solution- och fyra benefit-block, följd av
`enterprise-contact` som pekar på `/pages/contact-quote` och telefonnumret.

## Kräver manuell kontroll

1. **Utkastsstemat väntar på publicering.** De sju mallarna ligger i temat
   `Wisson-mallar — utkast 2026-09-09` (`189320397128`), en kopia av live-temat.
   Publicering är blockerad för connectorn och görs i Shopify-admin. Se avsnittet
   nedan.
2. **Tre hjältebilder är breda banners.** Samtliga åtta produkter har bild — 15
   totalt, hämtade från wissonrobotics.com och lagrade som egna kopior på Shopifys
   CDN, så butiken hotlänkar inte. AP3-G1, AP3-P1 och AP3-D1 har en hjältebild i
   ungefär 4:1 som blir brevlådeformad i en kvadratisk produktgrid. Var och en av
   dem har en mer kvadratisk detaljbild som kan flyttas först i Shopify-admin.
   Se `data/wisson-images.json`.
3. **Offertflöde i stället för priser.** Beslutat 2026-09-09: sortimentet säljs
   inte i kassan. Se avsnittet nedan.
4. **AP30-P4 och AP30-P4H saknar plattformsuppgift.** Källsidorna säger bara
   "ledande industridrönare" utan modellnamn, och har heller ingen specifikationstabell.
   Produkttexten säger att plattformen bekräftas vid offert.
5. **Navigationen är inte uppdaterad.** Sidorna är inte inlagda i någon meny. Se
   `scripts/apply-edp-menu-structure.mjs`.
6. **Compat-taggen för FlyCart 30.** AP30-N1 och AP30-G2 taggades `compat:flycart-30`
   enligt `data/edp-product-tag-standards.json`. Kontrollera att det matchar hur
   FlyCart-produkterna i katalogen redan är taggade.

## Kvarstår innan publicering

Avtalet är på plats, men tre saker måste vara klara innan status ändras från
`DRAFT` och sidorna publiceras:

| Steg | Varför |
|---|---|
| Deploya temamallarna (`node scripts/push-edp-theme.mjs`) | Utan dem renderas de sju sidorna med standardmallen och sektionsinnehållet syns inte |
| Sätt priser eller koppla offertflöde | Produkterna har Shopifys standardvariant på 0 kr |
| Lägg in sidorna i menystrukturen | De är inte nåbara från navigationen än |

## Offertflöde

Produkterna har ingen prissättning och ska inte gå att lägga i varukorgen. Det
löses med produkttaggen `offert`, som styr två snippets i temat:

| Fil | Beteende med taggen |
|---|---|
| `snippets/buy-buttons.liquid` | Köpknappen byts mot en länk till `/pages/contact-quote` med texten "Begär offert", plus en rad om att produkten offereras per uppdrag. Hämtningsalternativ döljs. |
| `snippets/price.liquid` | Visar "Pris på förfrågan" i stället för 0 kr. |

Båda ändringarna är strikt villkorade på taggen, så produkter utan den renderas
exakt som förut. Varianten ligger kvar på 0 kr i Shopify eftersom priset aldrig
visas eller används.

Produkterna använder dessutom mallen `enterprise-accessories`, som lägger
`enterprise-quote-form` under produktinformationen. Wisson-systemen är
nyttolaster som monteras på DJI-plattformar, vilket är vad den mallen är gjord
för — `enterprise-drones` är för flygplattformarna själva.

## Temadeploy — vad som faktiskt går

Testat mot butiken 2026-09-09, inte antaget:

| Åtgärd | Utfall |
|---|---|
| `themeFilesUpsert` mot live-temat | Blockerad av connectorns säkerhetspolicy (`category: live_theme`) |
| `themeFilesUpsert` mot opublicerat tema | Fungerar |
| `themeDuplicate` av live-temat | Misslyckas tyst — `newTheme: null`, inga `userErrors` |
| `themeFilesDelete` | Blockerad (`category: destructive`) |
| `themePublish` | Blockerad |

Dupliceringen misslyckas för att butiken har exakt 20 teman, vilket är Shopifys
tak. Ingen slot är ledig, och felet syns inte i svaret — det ser ut som en lyckad
tom körning.

**Genomfört 2026-09-09.** En temaslot frigjordes genom att `FÖRÅLDRAD 2026-08-21`
raderades i admin, vilket också tog med sig probe-filen från kapacitetstestet.
Därefter duplicerades live-temat `AAA NYA MALLAR — publicera denna`
(`188874916168`) till `Wisson-mallar — utkast 2026-09-09` (`189320397128`), och de
sju mallarna skrevs in där. Samtliga verifierade som befintliga filer i temat.

Kopieringen tar flera minuter. Skriver man innan `processing` slår om till false
avvisas filerna med att sektionerna inte existerar, vilket ser ut som ett riktigt
fel men bara betyder att kopian inte är klar.

Utöver de sju mallarna ligger även de två ändrade snippets för offertflödet i
utkaststemat.

**Kvar:** granska i temaredigeraren och publicera temat. Båda görs i admin —
`themePublish` är blockerad för connectorn.

## Om bildhämtningen

Bilderna ligger inte i `<img src>`. Sidorna lazy-laddar: `src` pekar på en
platshållare (`0.ss.508sys.com/image/loading/dot.gif`) och den riktiga URL:en
ligger i attributet `data-original`, protokollrelativt. Markdown-extraktion tappar
dem helt — hämtningen måste ske som `simplified_html`.

Två fällor:

- **Suffixet `!600x600`** i URL:en är CDN:ens omskalning. Tas det bort får man
  originalupplösningen. AP3-P3 gick från 600 px till 5440 px på det viset.
- **Sidfotens sortimentsrad** ser ut som produktbilder men levererar 100x70 px.
  Fyra produkter fick först de bilderna; de byttes mot hjältebilden från
  respektive produktsida.

## Avgränsning

Wisson säljer även lösningarna färgsprutning, avisning och åskskyddsmätning samt en
laddstation (CF1). De är inte importerade — CF1 ligger bara på den kinesiska sajten,
och de tre lösningssidorna saknar produktkoppling.
