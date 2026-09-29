# Consumer-hub: "Kom igång med drönare"

`theme/templates/page.kom-igang.json` är en ny landningssida för Consumer-delen
av webbplatsen. Den ersätter kortet "Drönarkort & utbildning" på
`/pages/consumer` (nu "Kom igång med drönare") som ingång, och fungerar som en
guide + produktvägledning + SEO-hubb — inte en traditionell blogg.

## Sidstruktur

| Sektion (id) | Typ | Innehåll |
|---|---|---|
| `hero` | `image-banner` | H1 "Kom igång med drönare" + undertext + två CTA:er som skrollar till sidans egna sektioner. |
| `find_drone` | `multicolumn` | "Hitta rätt drönare" — 6 kategorier (Nybörjare, Foto & video, Resor, Hobby, FPV, Avancerad) länkade till riktiga collections. |
| `accessories` | `multicolumn` | "Vad behöver jag?" — 6 tillbehörsgrupper länkade till riktiga collections/sidor. |
| `packages` | `multicolumn` | "Färdiga startpaket" — 3 riktiga DJI-kombopaket (drönare + extra batterier bundlade av tillverkaren, redan i lager): DJI Neo 2, DJI Air 3S Fly More Combo, DJI Avata 2 Fly Smart Combo. Varje kort länkar till den faktiska produkten. Knappen "Se alla paket" pekar på `/collections/kom-igang-paket`, en manuell collection med dessa och ytterligare två combo-produkter. |
| `rules` | `collapsible-content` | "Flyg säkert och lagligt" — generella svar med länkar till Transportstyrelsen, LFV och IMY. Inga hårdkodade viktgränser presenteras som absolut sanning utan källhänvisning. |
| `guides` | `featured-blog` | "Guider & tips" — visar 4 av 5 publicerade artiklar från bloggen `kom-igang-guider` (se nedan). |
| `service` | `multicolumn` | "Behöver du hjälp?" — länkar till felsökning, reservdelar, tillbehör, service, support, kontakt. |
| `faq` | `collapsible-content` | 8 vanliga frågor för SEO (long-tail-sökningar). |

## Shopify Admin-resurser (skapade via Admin API, inte i git)

Följande finns redan live i butiken (skapade i tidigare sessioner, inte
spårade i det här repot eftersom de är Shopify-innehåll, inte temakod):

1. **Sidan** `/pages/kom-igang` — publicerad, kopplad till temamallen
   `kom-igang`, med SEO-titel/metabeskrivning och FAQ-schema
   (`page.metafields.seo.faq_json`, samma frågor som i `faq`-sektionen)
   redan ifyllda.
2. **Bloggen** `kom-igang-guider` — 5 publicerade artiklar: "Så kommer du
   igång med din första drönare", "Vilken drönare ska jag välja?", "Så
   sköter du drönarbatterier", "Så transporterar du en drönare", "Vanliga
   misstag nybörjare gör med drönare". `guides`-sektionen visar de 4
   senaste + en "Se alla guider"-länk.
3. **Collectionen** `kom-igang-paket` — manuell collection med 5 riktiga,
   lagerförda DJI-kombopaket (drönare + extra batterier bundlade av
   tillverkaren): DJI Neo 2, DJI Air 3S Fly More Combo, DJI Air 3S Fly
   Combo RC 2, DJI Avata 2 Fly Smart Combo (tre batterier), DJI Lito X1
   Two-Battery Combo.

**Kvarstår:**

- **Hero-bild**: ingen bild vald i `hero`-sektionens `image`-inställning
  (lämnas tom i temafilen — kräver ett filbibliotek-val i Admin) med
  beskrivande alt-text.
- **Riktig paket-produkttyp**: nuvarande lösning återanvänder DJI:s egna
  fabriksbuntade "Combo"-produkter istället för egna paket byggda på
  `product.paket.json`-mallen (`paket.sammanfattning` / `paket.innehall` /
  `paket.antal`, se `docs/reports/PRODUKTPAKET_BUNDLE_ARKITEKTUR.md`).
  Anledningen: sökning i butiken 2026-09-29 visade inga aktiva, lagerförda
  batteri-, laddar- eller minneskortsprodukter att bygga egna paket av —
  bara enstaka reservdelar och DRAFT-produkter. DJI:s Combo-produkter var
  den enda verifierat riktiga, köpbara motsvarigheten. Byt till egna paket
  när tillbehörssortimentet har publicerat, lagerfört innehåll.
- Den gamla `/collections/starter-package` (133 produkter, regel
  `TYPE EQUALS Drones` — i praktiken "alla drönare", inte kuraterade
  paket) används inte längre av den här sidan, men lämnades orörd på
  `/pages/consumer` (`feature_1` och hero-knappen) eftersom den ägs av en
  annan, redan mergad PR — se separat notering om det nedan.

## Uppdatering: sammanslagning med parallellt arbete på `main`

När den här grenen slogs samman med `main` hade en annan, redan mergad PR
(#86–#88) redan fixat de trasiga collection-länkarna på `/pages/consumer`
(`mini-flip`, `air-mavic`, `fpv`, `accessories`, `starter-kits`,
`consumer-drones` → riktiga handles) **och** döpt om `feature_2` från
"Drönarkort & utbildning" till "Drönarregler" (länkar till
`/pages/service-support`). Den ursprungliga uppgiften i den här PR:n
(byt `feature_2` mot "Kom igång med drönare") kolliderade alltså med det.

Lösning: "Drönarregler"-kortet behölls som `feature_2` (redan mergat, pekar
på riktigt innehåll), och "Kom igång med drönare" lades till som ett nytt
fjärde kort, `feature_4`, i både `page.consumer.json` och presetet i
`consumer-landing.liquid`. Sektionens grid (`consumer-landing__grid--3`)
hanterar fler än tre kort utan kodändring — fjärde kortet radbryts bara till
en ny rad. Ingen ytterligare separat uppgift krävs längre för de gamla
länkarna.
