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
| `packages` | `multicolumn` | "Färdiga startpaket" — 3 exempelpaket (text only, inga priser/produkter). Knappen "Se alla paket" pekar på `/collections/starter-package` (samma collection som redan används av "Kom igång-paket"-kortet på `/pages/consumer`). |
| `rules` | `collapsible-content` | "Flyg säkert och lagligt" — generella svar med länkar till Transportstyrelsen, LFV och IMY. Inga hårdkodade viktgränser presenteras som absolut sanning utan källhänvisning. |
| `guides` | `featured-blog` | "Guider & tips" — visar 3 senaste artiklar från bloggen `kom-igang-guider`. |
| `service` | `multicolumn` | "Behöver du hjälp?" — länkar till felsökning, reservdelar, tillbehör, service, support, kontakt. |
| `faq` | `collapsible-content` | 8 vanliga frågor för SEO (long-tail-sökningar). |

## Manuellt kvarstående arbete i Shopify Admin

Detta **kan inte** göras enbart via temafiler i git — någon med Admin-access
(eller nästa AI-session med rätt behörighet) behöver:

1. **Sidan i sig**: skapa/sätt en `page` med handle `kom-igang`, tilldela
   temamallen `kom-igang`, och fylla i SEO-titel + metabeskrivning under
   "Search engine listing" (t.ex. SEO title: "Kom igång med drönare – guider,
   tips & startpaket | EuroDroneCompany", meta description i linje med
   sökorden nybörjare/köpa drönare/drönarguide).
2. **FAQ-schema**: kopiera in samma frågor/svar som i `faq`-sektionen i
   metafältet `page.metafields.seo.faq_json` så att `edp-seo-faq.liquid`
   genererar FAQPage-strukturerad data.
3. **Hero-bild**: ladda upp en bild till `hero`-sektionens `image`-inställning
   (lämnas tom i temafilen — kräver ett filbibliotek-val i Admin) med
   beskrivande alt-text.
4. **Startpaket-collection**: `/collections/starter-package` innehåller idag
   133 produkter men bygger på en bred regel (`TYPE EQUALS Drones`) — inga
   riktiga, kuraterade paket ännu. Bör ersättas med riktiga paketprodukter
   (byggda på `product.paket.json`-mallen och metafälten
   `paket.sammanfattning` / `paket.innehall` / `paket.antal`) när
   produktpaket-funktionen (se `docs/reports/PRODUKTPAKET_BUNDLE_ARKITEKTUR.md`)
   är klar.
5. **Guider-bloggen**: bloggen `kom-igang-guider` behöver riktiga artiklar
   (3–6 st) innan `guides`-sektionen visar innehåll. Föreslagna ämnen (från
   uppdraget, inte publicerad text): "Så kommer du igång med din första
   drönare", "Vilken drönare ska jag välja?", "Så tar du bättre bilder med
   drönare", "Så sköter du drönarbatterier", "Så transporterar du en
   drönare", "Vanliga misstag för nybörjare", "Vad ska jag tänka på när jag
   köper min första drönare?", "Så förbereder du drönaren inför första
   flygningen".

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
