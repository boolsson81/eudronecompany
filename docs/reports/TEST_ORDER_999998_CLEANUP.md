# Kvarlämnad testorder #999998 i produktionsdatabasen

**Datum:** 2026-08-19
**Projekt:** `jzqgwsryxmgzcbjjddic` (prod)
**Symptom:** Panelen *Ordrar med lagerproblem* på Lagerhantering visade permanent
`1 ordrar • 1 artiklar` — order **#999998**, 29 juli 2026, **0 SEK**.
**Status:** Utredd och åtgärdad (raderad efter godkännande).

---

## 1. Vad ordern faktiskt var

| Fält | Värde |
|---|---|
| `orders.id` | `e8a493ca-79d5-4d07-b7c6-20692730e046` |
| `shop_id` | `e6ad2afc-e468-49a7-8d33-9b1837419ed8` (European Drone Company) |
| `shopify_id` | **`TEST-VERIFY-ORDER-2`** — inte ett numeriskt Shopify-ID |
| `order_number` | `999998` |
| `total_price` / `items_count` | `0` / `0` |
| kund | ingen (`customer_name`, `customer_email`, adress = `NULL`) |
| `financial_status` / `fulfillment_status` | `paid` / `NULL` (obehandlad) |
| skapad | `2026-07-29 06:52:23+00` |

Orderraden:

| Fält | Värde |
|---|---|
| `order_line_items.id` | `e33415b4-ee3d-4fb6-822e-fbbe8ec19035` |
| `shopify_line_item_id` | **`TEST-LI-2`** |
| produkt / SKU | BOYA BY-DMR7 Mikrofon för DSLR-Kameror / `DCA0322B` |
| antal / pris | `1` / `0` |
| `stock_status` | `backorder` (satt av DB-triggern `2026-08-19 12:10`) |

Ordern är alltså syntetisk: den skapades manuellt (troligen vid verifiering av
`stock_status`-triggern/bristflödet) och blev kvarliggande i prod.

## 2. Varför den syntes i panelen

`src/components/purchases/OrderStockIssues.tsx` gör precis rätt: den listar
obehandlade ordrar (`fulfillment_status is null`) vars rader har
`stock_status = 'backorder'`. SKU `DCA0322B` har saldo **0** på båda lagerplatserna
(`Butiksplats`, `sunsky_Dropshipping_China`), så klassningen `backorder` är korrekt.
Felet låg i datan, inte i logiken.

Extra kontext: `orders` för European Drone Company innehöll **exakt en** rad — den här
testordern — och `order_line_items` likaså. Hela larmet bestod alltså av testdata.
Att butiken saknar riktiga ordrar hör ihop med det avbrutna orderinflödet som beskrivs i
`SHOP_ID_CROSS_TENANT_INVESTIGATION.md` (avsnitt 6 och 8).

## 3. Beroenden kontrollerade före radering

Främmande nycklar mot `orders` / `order_line_items`, samtliga med `0` träffar för ordern:

| tabell | delete-regel | rader |
|---|---|---|
| `order_line_items` | CASCADE | 1 (testraden ovan) |
| `order_notes` | CASCADE | 0 |
| `sendify_shipments` | SET NULL | 0 |
| `marketing_attribution_records` | CASCADE | 0 |
| `order_b2b_details` | CASCADE | 0 |
| `sunsky_order_sync` | — | 0 (tabellen är tom) |

Sökning på testartefakter i övrigt: ordern var den enda raden i `orders` med ett
icke-numeriskt `shopify_id`, och den enda raden i `orders`/`order_line_items` skapad
`2026-07-29`.

## 4. Utförd åtgärd

```sql
-- order_line_items har ON DELETE CASCADE mot orders
delete from orders
where id = 'e8a493ca-79d5-4d07-b7c6-20692730e046'
  and shopify_id = 'TEST-VERIFY-ORDER-2';
```

## 5. Återställning (om raderingen visar sig fel)

```sql
insert into orders (
  id, shop_id, shopify_id, order_number, financial_status, fulfillment_status,
  total_price, subtotal_price, total_discounts, total_tax, currency, items_count,
  has_discount, shopify_created_at, created_at, updated_at, public_chat_token,
  refunded_amount
) values (
  'e8a493ca-79d5-4d07-b7c6-20692730e046', 'e6ad2afc-e468-49a7-8d33-9b1837419ed8',
  'TEST-VERIFY-ORDER-2', 999998, 'paid', null,
  0, 0, 0, 0, 'SEK', 0,
  false, '2026-07-29 06:52:23.647551+00', '2026-07-29 06:52:23.647551+00',
  '2026-07-29 06:52:23.647551+00', 'd87940f4d09dae53e9e5de29343e459b', 0
);

insert into order_line_items (
  id, shop_id, order_id, shopify_line_item_id, product_title, variant_title, sku,
  quantity, price, fulfillment_status, created_at, updated_at, stock_status,
  stock_status_updated_at, fulfillable_quantity
) values (
  'e33415b4-ee3d-4fb6-822e-fbbe8ec19035', 'e6ad2afc-e468-49a7-8d33-9b1837419ed8',
  'e8a493ca-79d5-4d07-b7c6-20692730e046', 'TEST-LI-2',
  'BOYA BY-DMR7 Mikrofon för DSLR-Kameror', null, 'DCA0322B',
  1, 0, null, '2026-07-29 06:52:30.643377+00', '2026-08-19 12:10:06.001655+00',
  'backorder', '2026-08-19 12:10:06.001655+00', null
);
```

Övriga kolumner var `NULL`/default på båda raderna.

## 6. Rekommendation framåt

Testordrar ska inte skapas direkt i prod. Om ett verifieringsflöde behöver en order,
använd en tydlig markör (t.ex. tagg `TESTDATA`) och radera direkt efter verifieringen —
annars hamnar den i driftpanelerna som ett skarpt larm, precis som här.
