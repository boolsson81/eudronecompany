// Standalone: publish EuroDroneParts menu dependency pages (published: true).
// No migration DB required — writes directly to ya1xhg-x6.myshopify.com.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { resolveShopAccess } from "../_shared/cloner-shopify-access.ts";
import { MENU_PAGE_PLACEHOLDERS, publishMenuDependencyPages } from "../_shared/cloner-menu-dependency-pages.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const TARGET_STORE = {
  shop_domain: "ya1xhg-x6.myshopify.com",
  shop_name: "EuroDroneParts",
  label: "EuroDroneParts",
  api_version: "2025-07",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const dryRun = !!body.dry_run;
    const handles = Array.isArray(body.handles) ? body.handles : Object.keys(MENU_PAGE_PLACEHOLDERS);
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const migrationId = body.migration_id || "3d9876af-885c-49e9-a4b0-c4943c06112f";

    const result = await publishMenuDependencyPages(admin, TARGET_STORE, {
      migrationId,
      dryRun,
      handles,
    });

    return new Response(JSON.stringify({ ok: true, target: TARGET_STORE.shop_domain, ...result }, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
