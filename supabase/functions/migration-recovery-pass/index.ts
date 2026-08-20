// EuroDroneParts migration recovery pass — menu audit, collection membership recovery,
// quality audit, readiness score. Read-only except collection_recovery (adds missing products).
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { runMigrationRecoveryPass } from "../_shared/migration-recovery-pass.ts";

const MIGRATION_ID = "3d9876af-885c-49e9-a4b0-c4943c06112f";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const migrationId = body.migration_id || MIGRATION_ID;

    const { data: migration } = await admin.from("cloner_migrations").select("*").eq("id", migrationId).single();
    if (!migration) throw new Error(`Migration not found: ${migrationId}`);

    const [{ data: sourceStore }, { data: targetStore }] = await Promise.all([
      admin.from("cloner_stores").select("*").eq("id", migration.source_store_id).single(),
      admin.from("cloner_stores").select("*").eq("id", migration.target_store_id).single(),
    ]);
    if (!sourceStore || !targetStore) throw new Error("Source or target store not found");

    const tasks = Array.isArray(body.tasks) && body.tasks.length
      ? body.tasks
      : ["menu_audit", "collection_recovery", "quality_audit", "readiness"];

    const result = await runMigrationRecoveryPass(admin, {
      migrationId,
      migrationName: migration.name,
      sourceStore,
      targetStore,
      tasks,
      collectionRecoveryDryRun: body.dry_run === true,
      productOffset: body.product_offset,
      productLimit: body.product_limit,
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
