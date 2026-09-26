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
| `packages` | `multicolumn` | "Färdiga startpaket" — 3 exempelpaket (text only, inga priser/produkter). Knappen "Se alla paket" pekar på `/collections/startpaket`. |
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
4. **Startpaket-collection**: `/collections/startpaket` måste fyllas med
   riktiga paketprodukter (byggda på `product.paket.json`-mallen och
   metafälten `paket.sammanfattning` / `paket.innehall` / `paket.antal`)
   innan sektionen visar något. Fram tills dess renderas en tom collection
   — det är inte en trasig länk, bara ett tomt läge.
5. **Guider-bloggen**: bloggen `kom-igang-guider` behöver riktiga artiklar
   (3–6 st) innan `guides`-sektionen visar innehåll. Föreslagna ämnen (från
   uppdraget, inte publicerad text): "Så kommer du igång med din första
   drönare", "Vilken drönare ska jag välja?", "Så tar du bättre bilder med
   drönare", "Så sköter du drönarbatterier", "Så transporterar du en
   drönare", "Vanliga misstag för nybörjare", "Vad ska jag tänka på när jag
   köper min första drönare?", "Så förbereder du drönaren inför första
   flygningen".

## Känd, separat brist (upptäckt under analysen, inte åtgärdad här)

De befintliga korten på `/pages/consumer` under "Hitta rätt drönare"
(`category_1`–`category_4`) och "Kom igång-paket" (`feature_1`) länkar till
collection-handles som **inte finns** i butiken: `/collections/mini-flip`,
`/collections/air-mavic`, `/collections/fpv`, `/collections/accessories`,
`/collections/starter-kits`, `/collections/consumer-drones`. Detta är
oberoende av den här ändringen och bör fixas i en separat uppgift — verkliga
handles finns dokumenterade i denna commit-historik (se
`page.kom-igang.json` för exempel på riktiga handles att återanvända).
