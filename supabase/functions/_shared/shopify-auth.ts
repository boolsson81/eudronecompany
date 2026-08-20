// Auth helper for user-facing edge functions that act on a shop.
// Verifies the Authorization JWT, resolves the shop_id from request input,
// and ensures the user has access to that shop via user_shops.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface AuthorizedShop {
  userId: string;
  shopId: string;
}

export async function requireShopAccess(
  req: Request,
  shopId: string | null | undefined
): Promise<AuthorizedShop> {
  if (!shopId) throw new Error("shop_id is required");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    throw new Error("Missing Authorization header");
  }
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userRes, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userRes?.user) throw new Error("Unauthorized");
  const { data: link, error: linkErr } = await userClient
    .from("user_shops")
    .select("shop_id")
    .eq("user_id", userRes.user.id)
    .eq("shop_id", shopId)
    .maybeSingle();
  if (linkErr) throw new Error(linkErr.message);
  if (!link) throw new Error("Forbidden: user has no access to this shop");
  return { userId: userRes.user.id, shopId };
}

export const jsonHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

export function errorResponse(err: unknown, status = 400) {
  const message = err instanceof Error ? err.message : String(err);
  console.error("[shopify-edge]", message);
  return jsonResponse({ error: message }, status);
}
