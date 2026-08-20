// EuroDroneParts menu cleanup — audit + optional deduplication (menus only).
// SAFE MODE (default): inventory, duplicate detection, rollback export — no deletions.
// EXECUTE: requires confirm_delete=true after operator review.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { formatMenuCleanupMarkdown, runMenuCleanupAudit } from "../_shared/menu-cleanup-audit.ts";

const MIGRATION_ID = "3d9876af-885c-49e9-a4b0-c4943c06112f";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const migrationId = body.migration_id || MIGRATION_ID;
    const mode = body.mode === "execute" ? "execute" : "safe";

    const { data: migration } = await admin.from("cloner_migrations").select("*").eq("id", migrationId).single();
    if (!migration) throw new Error(`Migration not found: ${migrationId}`);

    const { data: targetStore } = await admin
      .from("cloner_stores")
      .select("*")
      .eq("id", migration.target_store_id)
      .single();
    if (!targetStore) throw new Error("Target store not found");

    const result = await runMenuCleanupAudit(admin, {
      migrationId,
      targetStore,
      mode,
      confirm_delete: body.confirm_delete === true,
    });

    return new Response(
      JSON.stringify({
        ...result,
        markdown: formatMenuCleanupMarkdown(result),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
