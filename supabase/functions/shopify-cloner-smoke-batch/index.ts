// Server-side 50-product smoke orchestrator for Lovable Cloud production.
// Uses runtime SUPABASE_SERVICE_ROLE_KEY — no local service role required.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const FN_BASE = `${SUPABASE_URL}/functions/v1`;

interface Body {
  migration_id?: string;
  batch_size?: number;
  dry_run?: boolean;
  skip_publish?: boolean;
  migration_name_ilike?: string;
}

async function callFn(name: string, body: unknown) {
  const r = await fetch(`${FN_BASE}/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SERVICE_ROLE}`,
      apikey: SERVICE_ROLE,
    },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  const json = text ? (() => { try { return JSON.parse(text); } catch { return { raw: text }; } })() : {};
  if (!r.ok) throw new Error(`${name} ${r.status}: ${text.slice(0, 500)}`);
  return json;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  const body = (req.method === 'POST' ? await req.json().catch(() => ({})) : {}) as Body;
  const batchSize = Math.max(1, Math.min(Number(body.batch_size) || 50, 50));
  const dryRun = !!body.dry_run;
  const skipPublish = !!body.skip_publish;
  const namePattern = body.migration_name_ilike || '%ActionKing%EuroDrone%';

  const result = {
    executed: false,
    migration_id: null as string | null,
    created: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    published: 0,
    duplicate_detected: 0,
    protected_field_skips: 0,
    skip_sales_channels: 0,
    lookup_failed: 0,
    metafields_written: 0,
    collections_linked: 0,
    draft_safety_events: 0,
    products: [] as Array<{ source_handle: string | null; publish_status: string; error: string | null }>,
    verdict: 'NO-GO',
    verdict_reason: '',
    error: null as string | null,
  };

  try {
    let migrationId = body.migration_id;
    if (!migrationId) {
      const { data: rows, error } = await admin
        .from('cloner_migrations')
        .select('id,name,mode,status')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      const match = (rows || []).find((r) =>
        /actionking/i.test(r.name || '') && /euro|drone/i.test(r.name || '')
      );
      if (!match) throw new Error(`No ActionKing→EuroDroneParts migration (pattern: ${namePattern})`);
      migrationId = match.id;
    }
    result.migration_id = migrationId!;
    let productIds: string[] = [];

    if (!skipPublish) {
      const { data: products } = await admin
        .from('cloner_migration_items')
        .select('id,approval_status')
        .eq('migration_id', migrationId)
        .eq('object_type', 'product')
        .order('source_handle', { ascending: true })
        .limit(500);

      const pending = (products || []).filter((p) => p.approval_status !== 'approved');
      const toApprove = pending.slice(0, batchSize);
      if (toApprove.length && !dryRun) {
        const ids = toApprove.map((p) => p.id);
        for (let i = 0; i < ids.length; i += 50) {
          const chunk = ids.slice(i, i + 50);
          const { error } = await admin
            .from('cloner_migration_items')
            .update({ approval_status: 'approved' })
            .in('id', chunk);
          if (error) throw error;
        }
      }

      if (!dryRun) {
        const { error } = await admin
          .from('cloner_migrations')
          .update({ mode: 'update_existing' })
          .eq('id', migrationId);
        if (error) throw error;
      }

      const { data: approved } = await admin
        .from('cloner_migration_items')
        .select('id')
        .eq('migration_id', migrationId)
        .eq('object_type', 'product')
        .eq('approval_status', 'approved')
        .neq('publish_status', 'published')
        .order('source_handle', { ascending: true })
        .limit(batchSize);

      productIds = (approved || []).map((p) => p.id);
      if (!dryRun) {
        for (let i = 0; i < productIds.length; i += 5) {
          const chunk = productIds.slice(i, i + 5);
          const r: any = await callFn('shopify-cloner-publish', {
            migration_id: migrationId,
            item_ids: chunk,
            limit: chunk.length,
          });
          result.created += r.created || 0;
          result.updated += r.updated || 0;
          result.skipped += r.skipped || 0;
          result.failed += r.failed || 0;
        }

        if (result.created > 0 || result.updated > 0) {
          await callFn('shopify-cloner-publish', {
            migration_id: migrationId,
            link_collections: true,
            limit: batchSize,
          });
        }
      }
      result.executed = !dryRun;
    }

    const { data: items } = await admin
      .from('cloner_migration_items')
      .select('source_handle,publish_status,error')
      .eq('migration_id', migrationId)
      .eq('object_type', 'product')
      .eq('approval_status', 'approved')
      .order('source_handle', { ascending: true })
      .limit(batchSize);

    const { data: logs } = await admin
      .from('cloner_logs')
      .select('event,message')
      .eq('migration_id', migrationId)
      .order('created_at', { ascending: false })
      .limit(500);

    result.products = (items || []).map((i) => ({
      source_handle: i.source_handle,
      publish_status: i.publish_status,
      error: i.error,
    }));
    result.published = (items || []).filter((i) => i.publish_status === 'published').length;
    result.failed = (items || []).filter((i) => i.publish_status === 'failed').length;
    result.duplicate_detected = (logs || []).filter((l) => l.event === 'duplicate_detected').length;
    result.protected_field_skips = (logs || []).filter((l) => l.event === 'protected_field_skipped').length;
    result.skip_sales_channels = (logs || []).filter((l) => l.event === 'skip_sales_channels').length;
    result.metafields_written = (logs || []).filter((l) => l.event === 'data_fidelity').length;
    result.collections_linked = (logs || []).filter((l) => l.event === 'collection_linked').length;
    result.draft_safety_events = (logs || []).filter((l) => l.event === 'draft_safety').length;
    result.lookup_failed = (logs || []).filter(
      (l) =>
        String(l.message || '').includes('product_lookup_failed') ||
        (l.event === 'product_failed' && String(l.message || '').includes('lookup_failed')),
    ).length;

    if (skipPublish) {
      result.verdict = 'NO-GO';
      result.verdict_reason = 'skip_publish=true — metrics only.';
    } else if (!result.executed) {
      result.verdict = 'NO-GO';
      result.verdict_reason = 'dry_run=true — no publish executed.';
    } else if (result.failed > 0) {
      result.verdict = 'NO-GO';
      result.verdict_reason = `Published ${result.published}, failed ${result.failed}.`;
    } else if (result.published < batchSize && productIds.length > 0) {
      result.verdict = 'NO-GO';
      result.verdict_reason = `Only ${result.published}/${batchSize} published.`;
    } else {
      result.verdict = 'GO';
      result.verdict_reason = `50-batch smoke: ${result.published} published, ${result.failed} failed.`;
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    result.error = e instanceof Error ? e.message : String(e);
    result.verdict = 'NO-GO';
    result.verdict_reason = `Smoke batch failed: ${result.error}`;
    return new Response(JSON.stringify(result), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
