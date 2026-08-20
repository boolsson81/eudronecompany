# Massifyllnad av HS-koder

**Vy:** Lagersaldo (`InventoryManager`) → knappen **Fyll HS-koder**
**Edge-funktion:** `publish-inventory-to-shopify`, action `autofill-hs-codes`
**Klassificering:** `supabase/functions/_shared/hs-autofill.ts` ovanpå
`supabase/functions/_shared/sunsky-hs-map.ts` (samma karta som leverantörsimporten)

---

## Varför

HS-koder gick tidigare bara att fylla i en artikel i taget (identifieringsdialogen)
eller på de rader som råkade vara markerade på den öppna sidan (bulkdialogen,
100 rader åt gången). Med några tusen artiklar utan kod går det inte att bli klar.
Den här funktionen går igenom hela lagret, klassificerar automatiskt och synkar
koderna till Shopify.

## Flöde

1. **Analysera** (`mode: "preview"`) — läser urvalet i skivor och rapporterar hur
   många som kan klassificeras, till vilka koder, och hur många som inte får
   någon träff. Skriver ingenting.
2. **Fyll i HS-koder** (`mode: "apply"`) — samma klassificering, men skriver
   `hs_code` (+ `hs_code_source`, `hs_code_confidence`, `hs_code_last_verified_at`)
   lokalt och sätter `InventoryItem.harmonizedSystemCode` på motsvarande variant
   i Shopify.

Båda lägena körs i skivor med en id-markör (`cursor`). Klienten anropar om med
`nextCursor` tills den är `null`, så hela lagret gås igenom utan att någon enskild
invocation slår i plattformens tidsgräns. Markör i stället för offset är
nödvändigt: rader utan träff ligger kvar i urvalet efter en skrivning, och ett
offsetlöst "hämta nästa 100 som saknar kod" hade snurrat på samma sida i evighet.

## Inställningar

| Inställning | Default | Effekt |
|-------------|---------|--------|
| Lägsta träffsäkerhet | 0,80 | Samma tröskel som `HS_CONFIDENCE_THRESHOLD`. Lägre ger fler ifyllda men osäkrare koder. |
| Reservkod | tom | Sätts på rader motorn inte kan klassificera. Krävs för att komma till 100 % täckning. |
| Synka till Shopify | på | Av = koderna skrivs bara lokalt. |
| Skriv över befintlig kod | av | Av = manuellt satta koder rörs aldrig. |

Reservkoden och alla klassificerade koder valideras som 4–10 siffror — samma
regel som identifieringsdialogen, så massifyllnaden kan inte skriva en kod som
den manuella vägen hade nekat.

## Klassificeringens indata

Per lagerrad: `product_title`, `category`, `brand` samt `product_type`, `tags`
och `vendor` från kopplad produkt (`inventory.page_id → products.id`).
Produktdatan är det som gör att rader med intetsägande titlar ("Reservdel 12")
ändå får en kod.

## Shopify-synk

SKU:erna slås upp 25 åt gången med ett `productVariants(query: "sku:… OR sku:…")`
och uppdateras grupperat per produkt med `productVariantsBulkUpdate`. Ett uppslag
per SKU (som `set-identifiers` gör för enstaka rader) skulle bli tusentals anrop
och slå i Shopifys kostnadsbudget långt innan jobbet blev klart.

Rader vars SKU inte finns i Shopify (ej publicerade ännu) räknas som
`shopifyNotFound` — de sparas lokalt och får rätt kod nästa gång produkten
publiceras.

## Svarsfält

```
scanned, planned, unresolved, skipped        // per skiva
applied, localFailed                         // endast mode=apply
shopifySynced, shopifyFailed, shopifyNotFound
summary: [{ hsCode, label, source, count }]
rows, unresolvedSamples                      // exempel för granskningsvyn
nextCursor, totalCandidates                  // totalen bara på första skivan
```

## Tester

`src/lib/hsCodeAutofill.test.ts` (vitest) täcker både planeringen i
`_shared/hs-autofill.ts` (klassificering, tröskel, reservkod, overwrite,
no-op-skydd) och klientens ackumulering av skivor.
