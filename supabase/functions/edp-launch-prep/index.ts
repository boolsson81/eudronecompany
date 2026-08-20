// EuroDroneParts launch prep — clean English URL structure from day one.
//
// Phase 0 (Category Architecture Lock) MUST complete before handle rename:
//   audit_collections → merge_collections → propose_taxonomy → approve_taxonomy
//
// NO redirects (unless indexed URLs detected). NO SEO migration.
//
// Actions: preflight | audit_collections | propose_taxonomy | merge_collections |
//          approve_taxonomy | validate_markets | rename_handles | wire_menus |
//          wire_theme | validate | final_report | full_prep | preview
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { resolveShopAccess } from "../_shared/cloner-shopify-access.ts";
import { EDP_MIGRATION_ID, EDP_SHOPIFY_DOMAIN } from "../_shared/edp-launch/config.ts";
import {
  formatLaunchPrepMarkdown,
  runLaunchPrep,
  type LaunchPrepAction,
} from "../_shared/edp-launch/index.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

type Body = {
  action?: LaunchPrepAction;
  dry_run?: boolean;
  confirm_delete?: boolean;
  confirm?: boolean;
  approved_by?: string;
  rename_kinds?: Array<"collection" | "page" | "blog">;
  handles?: string[];
  format?: "json" | "markdown";
  migration_id?: string;
  skip_gates?: boolean;
};

async function resolveTargetAccess(migrationId: string) {
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  const { data: mig } = await admin
    .from("cloner_migrations")
    .select("target_store_id")
    .eq("id", migrationId)
    .single();
  if (!mig?.target_store_id) {
    return { access: await resolveShopAccess({ shop_domain: EDP_SHOPIFY_DOMAIN }), admin };
  }
  const { data: store } = await admin
    .from("cloner_stores")
    .select("*")
    .eq("id", mig.target_store_id)
    .single();
  return {
    access: await resolveShopAccess(store || { shop_domain: EDP_SHOPIFY_DOMAIN }),
    admin,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: Body = req.method === "POST" ? await req.json() : {};
    const migrationId = body.migration_id || EDP_MIGRATION_ID;
    const { access, admin } = await resolveTargetAccess(migrationId);

    if (!access.token) {
      return json({ ok: false, error: "No Shopify access token for EuroDroneParts" }, 401);
    }

    const result = await runLaunchPrep(access, {
      action: body.action || "preview",
      dry_run: body.dry_run !== false,
      confirm_delete: body.confirm_delete,
      confirm: body.confirm,
      approved_by: body.approved_by,
      rename_kinds: body.rename_kinds,
      handles: body.handles,
      skip_gates: body.skip_gates,
      migration_id: migrationId,
      admin,
    });

    if (body.format === "markdown") {
      return new Response(formatLaunchPrepMarkdown(result), {
        headers: { ...corsHeaders, "Content-Type": "text/markdown; charset=utf-8" },
      });
    }

    return json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return json({ ok: false, error: msg }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
