/**
 * EU Drone Companys butik i den delade Supabase-databasen.
 *
 * Id:t är en identifierare, inte varumärke — se AGENTS.md. Det låg tidigare
 * inline i ShopifyDroneClone; modulen finns för att inköpsvyerna ska slå upp
 * samma butik utan att literalen kopieras en gång till.
 */
export const EDP_SHOP = {
  id: "e6ad2afc-e468-49a7-8d33-9b1837419ed8",
  name: "EUDroneParts",
  domain: "ya1xhg-x6.myshopify.com",
} as const;

export const EDP_SHOP_ID = EDP_SHOP.id;
