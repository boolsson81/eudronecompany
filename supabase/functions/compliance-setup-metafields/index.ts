import { getShopifyContext } from "../_shared/shopify-client.ts";
import { requireShopAccess, jsonResponse, errorResponse, jsonHeaders } from "../_shared/shopify-auth.ts";
import { ensureComplianceMetafieldDefinitions } from "../_shared/product-compliance-shopify.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: jsonHeaders });
  try {
    const { shop_id } = await req.json();
    await requireShopAccess(req, shop_id);
    const ctx = await getShopifyContext({ shopId: shop_id, fnName: "compliance-setup-metafields" });
    const result = await ensureComplianceMetafieldDefinitions(ctx);
    return jsonResponse({ success: true, ...result });
  } catch (e) {
    return errorResponse(e, 400);
  }
});
