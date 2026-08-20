// Read-only Shopify token binding audit for EUDroneParts.
// Requires authenticated platform admin caller. Never returns token
// prefixes, lengths, or hashes to the caller.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const EU_DOMAIN = "ya1xhg-x6.myshopify.com";
const EU_SHOP_ID = "e6ad2afc-e468-49a7-8d33-9b1837419ed8";
const API_VERSION = "2025-07";

const CANDIDATE_ENV_NAMES = [
  "EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN",
  "EU_DRONE_PARTS_SHOPIFY_ADMIN_TOKEN",
  "SHOPIFY_ADMIN_ACCESS_TOKEN",
  "SHOPIFY_ADMIN_TOKEN",
  "SHOPIFY_ACCESS_TOKEN",
] as const;

async function requireAdmin(req: Request): Promise<Response | { userId: string }> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const authHeader = req.headers.get("Authorization") ?? "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!bearer) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
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
      headers: { ...corsHeaders, "Content-Type": "application/json" },
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
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  return { userId: userRes.user.id };
}

async function probeShop(domain: string, token: string) {
  const r = await fetch(`https://${domain}/admin/api/${API_VERSION}/shop.json`, {
    headers: { "X-Shopify-Access-Token": token, Accept: "application/json" },
  });
  return { status: r.status, ok: r.ok };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;
  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // For each candidate secret name, only report presence + probe status.
    // Do NOT return prefixes, lengths, or hashes of secret values.
    const envProbes: Array<Record<string, unknown>> = [];
    for (const name of CANDIDATE_ENV_NAMES) {
      const token = Deno.env.get(name) || null;
      const entry: Record<string, unknown> = { secret_name: name, present: !!token };
      if (token) {
        entry.eu_shop_probe = await probeShop(EU_DOMAIN, token);
      }
      envProbes.push(entry);
    }

    const { data: install } = await admin
      .from("shopify_app_installations")
      .select("shopify_domain, access_token, scopes, installed_at, shop_id")
      .eq("shopify_domain", EU_DOMAIN)
      .is("uninstalled_at", null)
      .maybeSingle();

    const { data: integration } = await admin
      .from("integrations")
      .select("config, status")
      .eq("shop_id", EU_SHOP_ID)
      .eq("integration_type", "shopify")
      .maybeSingle();

    const dbToken = install?.access_token || (integration?.config as any)?.access_token || null;
    const dbProbe = dbToken
      ? {
          source: install?.access_token ? "shopify_app_installations" : "integrations.config",
          present: true,
          eu_shop_probe: await probeShop(EU_DOMAIN, dbToken),
          scopes: install?.scopes ?? null,
        }
      : { present: false };

    return new Response(JSON.stringify({
      ok: true,
      action: "eudroneparts_token_binding_probe",
      generated_at: new Date().toISOString(),
      target_domain: EU_DOMAIN,
      env_probes: envProbes,
      database_token: dbProbe,
      install_row: install
        ? { shopify_domain: install.shopify_domain, shop_id: install.shop_id, scopes: install.scopes }
        : null,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
