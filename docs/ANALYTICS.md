# Mätning — GA4

Mät-ID: `G-G5KGZ4RKSD`. Sajten är en SPA, så gtag.js egen `page_view` är avstängd
och sidvisningarna skickas från koden vid varje ruttbyte.

## Två vägar in, aldrig båda

| Läge | Väg | Fil |
| --- | --- | --- |
| gtag.js laddades | direkt till Google | `src/lib/analytics.ts` |
| gtag.js blockerades | `/api/collect` → Measurement Protocol | `api/collect.ts` |

`analytics.ts` laddar taggen själv och avgör utfallet på tre signaler: `load`,
`error` och en timeout på 2,5 s. Blockerare svarar ibland med tom 200 i stället
för fel, så det räcker inte att lyssna på `error` — efter `load` kollas att
riktiga gtag.js hunnit sätta `window.google_tag_manager`. Vid minsta tvivel
räknas taggen som blockerad och händelsen går via servern. En händelse skickas
alltid exakt en väg, så trafiken kan inte dubbelräknas.

Besökar-id återanvänds från `_ga`-kakan när den finns, annars sätts `_edc_cid`
med samma form. Det gör att samma besökare hänger ihop mellan besök där taggen
gick fram och besök där den blockerades.

## Samtycke

Ingenting mäts före ett ja. `index.html` sätter Consent Mode till nekat och
laddar ingen tagg; `src/lib/consent.ts` håller valet i localStorage under
`edc:cookie-consent`. Rutan ligger i `src/components/CookieConsent.tsx` och nås
igen via **Cookies** i sidfoten. Tackar besökaren nej efter att ha sagt ja
rensas `_ga*`- och `_edc_cid`-kakorna.

Nyckeln `edc:cookie-consent` står både i `index.html` och i `consent.ts` — det
måste den, för valet ska återställas innan taggen kör.
`scripts/__tests__/analytics-collect.test.ts` vaktar att de två håller ihop.

## Miljövariabler (Vercel)

| Variabel | Krävs | Kommentar |
| --- | --- | --- |
| `GA4_API_SECRET` | ja för serverside | GA4 → Admin → Dataströmmar → webbströmmen → Measurement Protocol API secrets |
| `GA4_MEASUREMENT_ID` | nej | faller tillbaka på `G-G5KGZ4RKSD` |

Utan `GA4_API_SECRET` svarar `/api/collect` 204 och släpper händelsen. Sidan
fungerar, men den blockerade trafiken mäts inte.

`vercel.json` undantar `/api/` från SPA-rewriten. Tas det undantaget bort
serveras `index.html` på endpointen och all serverside-mätning tystnar.

## Kontrollera

1. GA4 → Realtid, med och utan blockerare påslagen. Båda ska ge sidvisningar.
2. Nätverksfliken: utan blockerare går träffen till `google-analytics.com`, med
   blockerare till `/api/collect` som svarar 204.
3. Byt sida i menyn — varje ruttbyte ska ge en ny sidvisning, inte bara första.
