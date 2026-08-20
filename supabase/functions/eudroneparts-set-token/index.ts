// Copies EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN from env into shopify_app_installations
// when Shopify accepts the token.
//
// Requires authenticated platform admin caller. Diagnostic responses no longer
// include token fingerprints (prefix/suffix/length/sha256) — those leaked
// secret-shape information to any caller previously.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SECRET_NAME = "EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN";
const shopifyDomain = "ya1xhg-x6.myshopify.com";
const scopes = "write_products,read_products,write_content,read_content,read_themes,write_themes,write_files,read_files,read_orders,read_customers,read_inventory,write_inventory,read_locales,write_locales,write_translations,write_online_store_navigation,write_online_store_pages,read_online_store_pages,write_publications,read_publications";

async function requireAdmin(req: Request): Promise<Response | { userId: string }> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const authHeader = req.headers.get("Authorization") ?? "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!bearer) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }
  if (bearer === serviceRole) return { userId: "service_role" };
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${bearer}` } },
  });
  const { data: userRes } = await userClient.auth.getUser();
  if (!userRes?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }
  const adminClient = createClient(supabaseUrl, serviceRole);
  const { data: isAdmin } = await adminClient.rpc("has_role", {
    _user_id: userRes.user.id,
    _role: "admin",
  });
  if (!isAdmin) {
    return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
      status: 403,
      headers: { "content-type": "application/json" },
    });
  }
  return { userId: userRes.user.id };
}

async function probeShop(domain: string, token: string) {
  const url = `https://${domain}/admin/api/latest/shop.json`;
  const r = await fetch(url, {
    headers: { "X-Shopify-Access-Token": token, Accept: "application/json" },
  });
  let shopName: string | null = null;
  try {
    const j = await r.json();
    shopName = j?.shop?.name ?? null;
  } catch { /* ignore */ }
  return { status: r.status, ok: r.ok, shop_name: shopName };
}

Deno.serve(async (req) => {
  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;

  const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
  const diagnosticOnly = body?.diagnostic_only === true;

  const token = Deno.env.get(SECRET_NAME);
  if (!token) {
    return new Response(JSON.stringify({
      ok: false,
      error: "missing token env",
      secret_name: SECRET_NAME,
    }), { status: 500, headers: { "content-type": "application/json" } });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const shopProbe = await probeShop(shopifyDomain, token);

  if (diagnosticOnly) {
    return new Response(JSON.stringify({
      ok: shopProbe.ok,
      target_shop_domain: shopifyDomain,
      shopify_probe_status: shopProbe.status,
      shopify_probe_ok: shopProbe.ok,
    }), { headers: { "content-type": "application/json" } });
  }

  if (!shopProbe.ok) {
    return new Response(JSON.stringify({
      ok: false,
      error: "Shopify rejected EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN",
      shopify_probe_status: shopProbe.status,
    }), { status: 401, headers: { "content-type": "application/json" } });
  }

  const { data: shopRow } = await supabase
    .from("shops")
    .select("id, tenant_id, domain")
    .eq("domain", shopifyDomain)
    .maybeSingle();

  const { data, error } = await supabase
    .from("shopify_app_installations")
    .upsert({
      shopify_domain: shopifyDomain,
      access_token: token,
      scopes,
      shop_id: shopRow?.id ?? null,
      tenant_id: shopRow?.tenant_id ?? null,
      webhook_registered: false,
      nonce: null,
      uninstalled_at: null,
      installed_at: new Date().toISOString(),
    }, { onConflict: "shopify_domain" })
    .select("shopify_domain, shop_id, tenant_id, scopes, installed_at")
    .single();
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
  return new Response(JSON.stringify({
    ok: true,
    installation: data,
  }), { headers: { "content-type": "application/json" } });
});
