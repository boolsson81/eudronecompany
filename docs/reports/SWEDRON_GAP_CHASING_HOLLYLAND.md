# Swedron-gap: Chasing och Hollyland

Fjärde importomgången i gapanalysen mot Swedron.se. Två varumärken som helt
saknades i vår katalog importerades som utkast: Chasing Innovation
(undervattensfarkoster med tillbehör) och Hollyland (trådlöst ljud, video,
intercom och tally).

## Resultat

| | Antal |
|---|---|
| Chasing | 133 |
| Hollyland | 182 |
| **Totalt** | **315** |

Samtliga skapade med `status: DRAFT` och taggarna `swedron-gap-import` och
`draft-granskas`. Inga `userErrors` i någon `productCreate`. Antalet är
verifierat genom att lista produkterna i Shopify, inte genom `productsCount`.

Före importen kontrollerades att inget av varumärkena redan fanns i katalogen.
Det gjorde de inte, så det finns ingen dubblettrisk i den här omgången.

## Produkttyper

| Produkttyp | Antal |
|---|---|
| Trådlöst intercom | 45 |
| Trådlös mikrofon | 42 |
| Trådlös videolänk | 38 |
| Batteri och laddning | 36 |
| Reservdelar | 32 |
| Sonar och sensorer | 23 |
| Tally och studiokablage | 22 |
| Undervattensdrönare | 17 |
| Kabel och vinsch | 13 |
| Väska och transport | 13 |
| Manipulatorarm | 11 |
| Fjärrkontroll | 8 |
| Tillbehör | 4 |
| Undervattensbelysning | 4 |
| Antenner | 2 |
| Kablar och adaptrar | 2 |
| Riggtillbehör | 2 |
| Undervattensrobot | 1 |

Av de 17 under Undervattensdrönare är samtliga kompletta farkoster eller
paket. Det bestäms av en explicit vitlista i `classify-chhl.py`, inte av
nyckelord — se nedan.

## Kvar att göra

- **12 produkter saknar bild.** Swedrons sidor har ingen produktbild för dem.
  De behöver bild från tillverkaren innan publicering.
- **Pris saknas på alla 315.** Priser sätts inte från konkurrentens sida.
- **Manuell granskning innan publicering.** Taggen `draft-granskas` markerar
  hela omgången.

## Vad som gick fel under vägen

Tre fel som är värda att komma ihåg för nästa varumärkesimport.

**Fel varumärke i säljtexten.** Klassificeringsreglerna låg först i en enda
ordnad lista med Chasings nyckelord först. Ord som `Battery`, `Cable` och
`Carrying` matchade då även Hollylands titlar, och 39 Hollyland-produkter fick
Chasing-text av typen "hör till kraftförsörjningen för Chasings
undervattensfarkoster". Reglerna delades upp per varumärke och `classify()`
tar nu emot varumärket som argument. Ingen av de redan importerade produkterna
var drabbad — det verifierades genom att jämföra de faktiskt skickade
payloaderna mot den nya genereringen.

**Delar klassade som kompletta farkoster.** "Robot arm connecting cable for M2
PRO MAX" hamnade under Undervattensdrönare. En uteslutningsregel togs fram
först men slog ut äkta paket. Lösningen blev en vitlista över modellnamn som
prövas före alla andra regler. Antalet gick från 27 till 17.

**Specifikationstabellen delade på fel ställe.** `splitspec` delar en
hopslagen sträng vid skiftlägesbytet, vilket gav "Videoupplösning4 | K" i sju
produkter. Delningar där etiketten slutar på siffra eller värdet är kortare än
två tecken förkastas nu.

Efter importen rättades fyra produkter med `productUpdate` som skapats innan
den sista rättningen slog igenom. Två av dem var materiella: laddfodralen till
Lark M2S låg som Trådlös mikrofon och är nu Batteri och laddning.

## Data

`data/swedron-gap-imported-chasing-hollyland.json` innehåller alla 315
produkter som de ser ut i Shopify, med käll-URL per produkt.
