# Distributörer för de produkter vi saknar — 2026-09-08

Underlag: [`SWEDRON_SAKNADE_PRODUKTER.md`](SWEDRON_SAKNADE_PRODUKTER.md) och
[`data/swedron-saknade-produkter.csv`](../../data/swedron-saknade-produkter.csv).

## Kort svar

Fyra femtedelar av varumärkesgapet ligger hos **en enda distributör**:
Focus Nordic AB i Göteborg.

| | Produkter | Andel av gapet |
|---|---|---|
| Varumärken Focus Nordic för | 4 723 | 81 % |
| Utanför Focus Nordic | 1 079 | 19 % |

Ett återförsäljaravtal med Focus Nordic öppnar alltså i praktiken hela den del
av Swedrons sortiment vi saknar, utom en spretig svans.

## Focus Nordic AB

| | |
|---|---|
| Adress | Bergsjödalen 48, 415 68 Göteborg |
| Org.nr / VAT | SE556507498501 |
| Telefon | +46 31 336 23 00 |
| E-post | info@focusnordic.se |
| Ansökan | focusnordic.com/become-reseller |

Beskriver sig som Europas ledande distributör inom foto, video och optik, med
över 70 varumärken i 28 marknader. Har lokala sajter för Sverige, Norge,
Danmark, Finland, Baltikum, Polen och flera länder till.

### Våra saknade varumärken som de för

| Varumärke | Produkter | Vad det är |
|---|---|---|
| SmallRig | 1 351 | Kamerarigg, burar, fästen |
| Kupo | 1 092 | Studiostativ, klämmor, C-stands |
| Peak Design | 343 | Väskor, remmar, fästen |
| Nanlite / Nanlux | 317 | Studio- och videobelysning |
| B&W International | 274 | Transportväskor |
| Think Tank | 226 | Fotoväskor |
| Hollyland | 182 | Trådlös video, Lark-mikrofoner |
| Chasing | 133 | Undervattensdrönare |
| Rusan | 122 | Adaptrar för optik |
| GoMatic | 106 | Resväskor |
| Saramonic | 87 | Mikrofoner |
| Atomos | 79 | Monitorer, inspelning |
| Feelworld | 57 | Monitorer |
| Velbon | 48 | Stativ |
| Vallerret | 45 | Fotohandskar |
| SeeTec | 33 | Monitorer |
| NiSi | 29 | Filter |
| Brinno | 13 | Time lapse |

Bekräftat via Focus Nordics egen varumärkessida och deras pressmeddelande om
att de valts till europeisk distributör för Kupo Grip.

### De för också märken vi redan säljer

PolarPro, Insta360, Lexar, Delkin, Energizer, HIKMICRO, Polaroid och Zhiyun.
Det betyder att en stor del av **kategori B**, de 1 876 enskilda luckorna i
märken vi redan för, sannolikt går genom samma avtal. PolarPro ensamt står för
336 av dem, Insta360 för 149.

Focus Nordic finns inte bland de nio leverantörer som är registrerade i
inköpsportalen, så det rör sig om ett nytt avtal.

## Utanför Focus Nordic — 1 079 produkter

Ingen av dessa är stor nog att ensam motivera ett avtal, men två är
drönarnära nog att vara värda ett samtal.

| Varumärke | Produkter | Kanal | Status |
|---|---|---|---|
| Anker | 90 | Egen distribution, breda elektronikgrossister | Ej utrett |
| Emlid Reach | 32 | Emlid Tech Kft, Budapest. Egen återförsäljaransökan på emlid.com/dealership | **Drönarnära.** Ingår redan i våra mätpaket |
| HPRC | 17 | Italiensk tillverkare, egna EU-distributörer | Ej utrett |
| MicaSense | 15 | AgEagle / EagleNXT, distributörssida på eaglenxt.com | **Drönarnära.** Multispektralsensorer |
| LifThor | 14 | Säljs direkt och via drönardistributörer, ingen nordisk distributör hittad | Ej bekräftad |
| Dreame | 14 | Robotdammsugare, egen distribution | Utanför sortimentet |
| 4Hawks | 12 | Polsk tillverkare av riktantenner | Ej utrett |
| Dronavia | 10 | Fransk tillverkare, drönarsäkerhet | Ej utrett |
| AVSS | 10 | Kanadensisk tillverkare, fallskärmssystem | Ej utrett |
| Hasselblad | 7 | Ägs av DJI, går via DJI-kanalen | Vi har DJI-kanal |

Resterande 827 produkter ligger i poster med färre än fem artiklar vardera,
mestadels reservdelar och enskilda tillbehör.

## Inlagt i inköpsportalen

Samtliga distributörer ovan som vi inte redan har är inlagda som **potentiella
distributörer** i inköpsportalen, i tabellen `supplier_prospects` för butiken
European Drone Company. Tabellen var tom innan. Se
[`data/inkopsportal-potentiella-distributorer.json`](../../data/inkopsportal-potentiella-distributorer.json)
för exakt vad som lades in.

| Prospekt | Grupp | Land | Produkter i gapet |
|---|---|---|---|
| Focus Nordic AB | eu-distributor | SE | 4 723 |
| Anker Innovations | accessory | — | 90 |
| Emlid Tech Kft | payload | HU | 32 |
| HPRC | accessory | IT | 17 |
| AgEagle Aerial Systems (EagleNXT) | payload | US | 15 |
| LifThor | accessory | — | 14 |
| 4Hawks | accessory | PL | 12 |
| Dronavia | commercial | FR | 10 |
| AVSS | commercial | CA | 10 |

Webbadress är satt bara där den är verifierad: Focus Nordic, Emlid och AgEagle.
För övriga står fältet tomt hellre än gissat. Alla får status `new` som default.

Dreame och Hasselblad lades medvetet inte in. Dreame är robotdammsugare och
ligger utanför sortimentet, Hasselblad ägs av DJI och går via DJI-kanalen som vi
redan har.

## Rättelse om befintliga leverantörer

Rapportens första version sa att de enda kända leverantörerna var Sunsky och
Boston. Det gällde repot, inte verkligheten. Inköpsportalen har nio registrerade
leverantörer för European Drone Company: ALSO Sweden, Boston Group, ELKO Group,
iFlight Europe, INNPRO, Komsa, Solectric, Sunsky och Wisson. Focus Nordic finns
inte bland dem, så det handlar om ett nytt avtal och inte om att utöka ett
befintligt.

## Vad jag inte kunnat bekräfta

- Nordisk distributör för Anker, HPRC, 4Hawks, Dronavia och AVSS. Sökningarna
  gav inget entydigt svar, och jag har inte gissat.
- Vilka villkor eller marginaler någon av kanalerna ger.

## Förslag

1. **Kontakta Focus Nordic.** Ett avtal täcker 4 723 av 5 802 produkter i
   varumärkesgapet, plus en stor del av de enskilda luckorna.
2. **Emlid direkt.** Vi säljer redan Reach-mottagare i mätpaketen men för dem
   inte som egna artiklar. Återförsäljaransökan finns på deras sajt.
3. **MicaSense via AgEagle** om multispektral kartering är intressant för
   skogs- och jordbrukskunderna.
4. Resten avvaktar tills volymen motiverar arbetet.
