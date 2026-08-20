// Background queue worker for Shopify Cloner. Polled by pg_cron every minute.
// Processes one batch per queued/running job, then re-queues itself until done.
// Calls internal HTTP to scan/transform/publish edge functions so we reuse logic.
//
// PRE-250 audit routes (Lovable runtime SERVICE_ROLE — callable with publishable anon key):
//   POST { "action": "pre_250_discover" }
//   POST { "action": "pre_250_audit", "migration_id"?: uuid, "limit"?: number }
//   POST { "action": "product_channel_classification", "shop_id"?: uuid, "misplaced_limit"?: number }
//   POST { "action": "missing_product_types", "shop_id"?: uuid }
// Collection reconciliation audit (read-only):
//   POST { "action": "collection_reconciliation_audit", "migration_id"?: uuid }
// Final verification audit (read-only):
//   POST { "action": "final_verification_audit", "migration_id"?: uuid, "product_offset"?: number, "product_limit"?: number }
// Migration recovery pass (menu audit, collection recovery, quality audit, readiness):
//   POST { "action": "migration_recovery_pass", "migration_id"?: uuid, "tasks"?: string[], "dry_run"?: boolean, "product_offset"?: number, "product_limit"?: number }
// Smart collection mapping + menu recovery:
//   POST { "action": "smart_collection_mapping_fix", "migration_id"?: uuid, "dry_run"?: boolean, "handles"?: string[] }
//   POST { "action": "menu_recovery_fix", "migration_id"?: uuid, "dry_run"?: boolean }
//   POST { "action": "migration_audit_report", "migration_id"?: uuid, "approved_restore_handles"?: string[] }
//   POST { "action": "collection_gap_audit", "migration_id"?: uuid, "approved_restore_handles"?: string[] }
// Menu cleanup audit (menus only — SAFE by default):
//   POST { "action": "menu_cleanup_pass", "migration_id"?: uuid, "mode"?: "safe"|"execute", "confirm_delete"?: boolean }
// Read-only Shopify menu inventory audit:
//   POST { "action": "menu_inventory_audit", "migration_id"?: uuid }
// Lightweight live menu list (read-only):
//   POST { "action": "list_target_menus", "migration_id"?: uuid }
//   POST { "action": "edp_deploy_industry_pages", "shop_id"?: uuid, "deploy_theme"?: boolean, "dry_run"?: boolean }
//   POST { "action": "edp_deploy_comparison_blog", "shop_id"?: uuid, "deploy_theme"?: boolean, "dry_run"?: boolean }
//   POST { "action": "edp_deploy_faq_blog", "shop_id"?: uuid, "deploy_theme"?: boolean, "dry_run"?: boolean }
// EuroDroneParts launch prep (English URLs, no redirects):
//   POST { "action": "edp_launch_prep", "dry_run"?: boolean, "confirm_delete"?: boolean,
//          "prep_action"?: "audit_collections"|"propose_taxonomy"|"merge_collections"|
//                          "approve_taxonomy"|"preflight"|"preview"|"validate_markets"|
//                          "rename_handles"|"wire_menus"|"wire_theme"|"validate"|
//                          "final_report"|"full_prep", "confirm"?: boolean, "approved_by"?: string }
// Deploy: .github/workflows/deploy-shopify-cloner-worker.yml
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { buildCollectionReconciliationAudit } from '../_shared/collection-reconciliation-audit.ts';
import { buildClonerFinalVerificationAudit } from '../_shared/cloner-final-verification-audit.ts';
import { buildMissingProductTypeReport } from '../_shared/missing-product-type-report.ts';
import { runMigrationRecoveryPass } from '../_shared/migration-recovery-pass.ts';
import { runSmartCollectionMappingPass } from '../_shared/cloner-smart-collection-mapping.ts';
import { runMenuRecoveryPass } from '../_shared/cloner-menu-recovery.ts';
import { buildMigrationAuditReport, formatMigrationAuditMarkdown } from '../_shared/cloner-migration-audit.ts';
import { buildCollectionGapAudit, formatCollectionGapMarkdown } from '../_shared/cloner-collection-gap-classifier.ts';
import { publishMenuDependencyPages } from '../_shared/cloner-menu-dependency-pages.ts';
import { formatMenuCleanupMarkdown, runMenuCleanupAudit } from '../_shared/menu-cleanup-audit.ts';
import { buildShopifyMenuInventoryAudit } from '../_shared/shopify-menu-inventory-audit.ts';
import { resolveShopAccess, shopifyGraphql } from '../_shared/cloner-shopify-access.ts';
import { formatLaunchPrepMarkdown, runLaunchPrep } from '../_shared/edp-launch/index.ts';
import { runEdpIndustryPagesDeploy } from '../_shared/edp-industry-deploy.ts';
import { runEdpComparisonBlogDeploy } from '../_shared/edp-comparison-deploy.ts';
import { runEdpFaqBlogDeploy } from '../_shared/edp-faq-deploy.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const FN_BASE = `${SUPABASE_URL}/functions/v1`;
const MAX_PER_TICK = 3; // process up to N jobs per cron invocation

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
  if (!r.ok) throw new Error(`${name} ${r.status}: ${text.slice(0, 400)}`);
  return json;
}

const SOURCE_PATTERNS = ['actionking', 'action king', 'bvy0b8'];
const TARGET_PATTERNS = ['eurodrone', 'eudrone', 'eu drone', 'ya1xhg', 'euro drone', 'europe drone'];

type StoreRow = {
  id: string;
  tenant_id?: string | null;
  role?: string | null;
  label?: string | null;
  shop_name?: string | null;
  shop_domain?: string | null;
  primary_domain?: string | null;
  created_at?: string | null;
};

/**
 * Resolver priority (per request):
 *   1. store_id (exact match)
 *   2. shop_name (case-insensitive substring)
 *   3. shop_domain (case-insensitive substring)
 *   4. label (case-insensitive substring)
 * Role column is ignored — it is unreliable (both stores may be tagged 'source').
 */
function findStore(stores: StoreRow[], patterns: string[]): { store: StoreRow; matched_by: string } | null {
  // 1. store_id — patterns may include UUIDs
  for (const p of patterns) {
    const hit = stores.find((s) => s.id?.toLowerCase() === p.toLowerCase());
    if (hit) return { store: hit, matched_by: 'store_id' };
  }
  const lc = (v?: string | null) => (v || '').toLowerCase();
  // 2. shop_name
  for (const p of patterns) {
    const hit = stores.find((s) => lc(s.shop_name).includes(p));
    if (hit) return { store: hit, matched_by: 'shop_name' };
  }
  // 3. shop_domain / primary_domain
  for (const p of patterns) {
    const hit = stores.find((s) => lc(s.shop_domain).includes(p) || lc(s.primary_domain).includes(p));
    if (hit) return { store: hit, matched_by: 'shop_domain' };
  }
  // 4. label
  for (const p of patterns) {
    const hit = stores.find((s) => lc(s.label).includes(p));
    if (hit) return { store: hit, matched_by: 'label' };
  }
  return null;
}

async function countPublishedProducts(admin: ReturnType<typeof createClient>, migrationId: string) {
  const { count } = await admin.from('cloner_migration_items').select('id', { count: 'exact', head: true })
    .eq('migration_id', migrationId).eq('object_type', 'product').eq('publish_status', 'published');
  return count ?? 0;
}

async function countMigrationItems(admin: ReturnType<typeof createClient>, migrationId: string, objectType: string) {
  const { count } = await admin.from('cloner_migration_items').select('id', { count: 'exact', head: true })
    .eq('migration_id', migrationId).eq('object_type', objectType);
  return count ?? 0;
}

async function resolveClonerMigration(admin: ReturnType<typeof createClient>, migrationId?: string) {
  if (migrationId) {
    const { data: migration } = await admin.from('cloner_migrations').select('*').eq('id', migrationId).maybeSingle();
    if (!migration) throw new Error(`Migration not found: ${migrationId}`);
    const { data: source } = await admin.from('cloner_stores').select('*').eq('id', migration.source_store_id).maybeSingle();
    const { data: target } = await admin.from('cloner_stores').select('*').eq('id', migration.target_store_id).maybeSingle();
    return { migration, resolution: 'explicit migration_id', publishedCount: await countPublishedProducts(admin, migration.id), stores: { source, target }, matched: { source_by: 'explicit', target_by: 'explicit' } };
  }
  const { data: allStores } = await admin.from('cloner_stores')
    .select('id,tenant_id,role,label,shop_domain,primary_domain,shop_name,created_at')
    .order('created_at', { ascending: false }).limit(200);
  if (!allStores?.length) throw new Error('No rows in cloner_stores');
  const src = findStore(allStores as StoreRow[], SOURCE_PATTERNS);
  const tgt = findStore(allStores as StoreRow[], TARGET_PATTERNS);
  if (!src) throw new Error(`Source store not found (tried shop_name/shop_domain/label patterns: ${SOURCE_PATTERNS.join(', ')})`);
  if (!tgt) throw new Error(`Target store not found (tried shop_name/shop_domain/label patterns: ${TARGET_PATTERNS.join(', ')})`);
  const { data: migrations } = await admin.from('cloner_migrations').select('*')
    .eq('source_store_id', src.store.id).eq('target_store_id', tgt.store.id)
    .order('updated_at', { ascending: false }).limit(50);
  if (!migrations?.length) throw new Error(`No cloner_migrations for source=${src.store.id} target=${tgt.store.id}`);
  let best = migrations[0];
  let bestPublished = -1;
  for (const m of migrations) {
    const published = await countPublishedProducts(admin, m.id);
    if (published > bestPublished) { bestPublished = published; best = m; }
  }
  return {
    migration: best,
    resolution: `source matched by ${src.matched_by} (${src.store.shop_name || src.store.label}) → target matched by ${tgt.matched_by} (${tgt.store.shop_name || tgt.store.label})`,
    publishedCount: bestPublished,
    stores: { source: src.store, target: tgt.store },
    matched: { source_by: src.matched_by, target_by: tgt.matched_by },
  };
}

async function handlePre250Discover(admin: ReturnType<typeof createClient>) {
  const { data: stores } = await admin.from('cloner_stores')
    .select('id,tenant_id,role,label,shop_domain,shop_name,created_at')
    .order('created_at', { ascending: false }).limit(100);
  const { data: migrations } = await admin.from('cloner_migrations')
    .select('id,name,mode,status,tenant_id,source_store_id,target_store_id,created_at,updated_at')
    .order('updated_at', { ascending: false }).limit(50);
  const rows = [];
  for (const m of migrations || []) {
    const src = stores?.find((s) => s.id === m.source_store_id);
    const tgt = stores?.find((s) => s.id === m.target_store_id);
    rows.push({
      ...m,
      source_label: src?.label,
      source_domain: src?.shop_domain,
      target_label: tgt?.label,
      target_domain: tgt?.shop_domain,
      published_products: await countPublishedProducts(admin, m.id),
    });
  }
  let resolved = null;
  let collectionAudit: Awaited<ReturnType<typeof buildCollectionReconciliationAudit>> | null = null;
  try {
    resolved = await resolveClonerMigration(admin);
    const { data: targetStore } = await admin.from('cloner_stores').select('*').eq('id', resolved.migration.target_store_id).maybeSingle();
    if (targetStore) {
      collectionAudit = await buildCollectionReconciliationAudit(admin, {
        migrationId: resolved.migration.id,
        migrationName: resolved.migration.name,
        resolution: resolved.resolution,
        sourceStore: resolved.stores.source,
        targetStore,
      });
    }
  } catch { /* optional */ }

  const sourceCollections = collectionAudit?.counts.source_collections
    ?? (resolved ? await countMigrationItems(admin, resolved.migration.id, 'collection') : null);

  return {
    ok: true,
    action: 'pre_250_discover',
    stores: stores || [],
    migrations: rows,
    resolved_migration: resolved ? {
      id: resolved.migration.id,
      name: resolved.migration.name,
      resolution: resolved.resolution,
      published_count: resolved.publishedCount,
      source_collections: sourceCollections,
    } : null,
    SOURCE_COLLECTIONS: collectionAudit?.SOURCE_COLLECTIONS ?? null,
    TARGET_COLLECTIONS: collectionAudit?.TARGET_COLLECTIONS ?? null,
    MISSING_COLLECTIONS: collectionAudit?.MISSING_COLLECTIONS ?? null,
    collection_counts: collectionAudit?.counts ?? (sourceCollections != null ? {
      source_collections: sourceCollections,
      target_collections: null,
      missing_collections: null,
    } : null),
    actions: ['pre_250_discover', 'pre_250_audit', 'missing_product_types', 'collection_reconciliation_audit', 'final_verification_audit', 'migration_recovery_pass', 'smart_collection_mapping_fix', 'menu_recovery_fix', 'publish_menu_dependency_pages', 'migration_audit_report', 'collection_gap_audit'],
    actions: ['pre_250_discover', 'pre_250_audit', 'missing_product_types', 'collection_reconciliation_audit', 'final_verification_audit', 'migration_recovery_pass', 'smart_collection_mapping_fix', 'menu_recovery_fix', 'migration_audit_report', 'collection_gap_audit', 'menu_cleanup_pass', 'menu_inventory_audit', 'list_target_menus', 'edp_launch_prep', 'edp_deploy_industry_pages', 'edp_deploy_comparison_blog', 'edp_deploy_faq_blog'],
    note: 'clone_migrations does not exist; use cloner_migrations + cloner_stores',
  };
}

async function handlePre250Audit(admin: ReturnType<typeof createClient>, migrationId?: string, limit = 50) {
  const resolved = await resolveClonerMigration(admin, migrationId);
  const mid = resolved.migration.id;
  const sample = Math.max(1, Math.min(limit, 100));
  const storePayload = {
    source_store: resolved.stores.source
      ? { id: resolved.stores.source.id, label: resolved.stores.source.label, domain: resolved.stores.source.shop_domain }
      : null,
    target_store: resolved.stores.target
      ? { id: resolved.stores.target.id, label: resolved.stores.target.label, domain: resolved.stores.target.shop_domain }
      : null,
  };
  try {
    const audit = await callFn('shopify-cloner-publish', { migration_id: mid, pre_250_safety_audit: true, limit: sample });
    return {
      ok: true,
      action: 'pre_250_audit',
      migration_id: mid,
      migration_name: resolved.migration.name,
      migration_mode: resolved.migration.mode,
      tenant_id: resolved.migration.tenant_id,
      resolution: resolved.resolution,
      published_count: resolved.publishedCount,
      ...storePayload,
      ...audit,
      audit_mode: 'publish',
    };
  } catch (e) {
    const logCount = async (event: string) => {
      const { count } = await admin.from('cloner_logs').select('id', { count: 'exact', head: true }).eq('migration_id', mid).eq('event', event);
      return count ?? 0;
    };
    const itemCount = async (extra: Record<string, string>) => {
      let q = admin.from('cloner_migration_items').select('id', { count: 'exact', head: true }).eq('migration_id', mid).eq('object_type', 'product');
      for (const [k, v] of Object.entries(extra)) q = q.eq(k, v);
      const { count } = await q;
      return count ?? 0;
    };
    const gates = {
      source_products: await itemCount({}),
      target_published: await itemCount({ publish_status: 'published' }),
      target_failed_count: await itemCount({ publish_status: 'failed' }),
      collection_link_failed: await logCount('collection_link_failed'),
      skip_sales_channels_logs: await logCount('skip_sales_channels'),
      protected_field_skipped_logs: await logCount('protected_field_skipped'),
      duplicate_detected_logs: await logCount('duplicate_detected'),
      collection_linked_logs: await logCount('collection_linked'),
      draft_safety_logs: await logCount('draft_safety'),
      non_draft_sample: 0,
      metafield_defs_missing: 0,
    };
    const blockers: string[] = [];
    if (gates.collection_link_failed > 0) blockers.push(`${gates.collection_link_failed} collection_link_failed log(s)`);
    if (gates.target_failed_count > 0) blockers.push(`${gates.target_failed_count} failed migration items`);
    if (gates.target_published > 0 && gates.skip_sales_channels_logs === 0) blockers.push('no skip_sales_channels logs for published products');
    return {
      ok: true,
      action: 'pre_250_audit',
      migration_id: mid,
      migration_name: resolved.migration.name,
      migration_mode: resolved.migration.mode,
      tenant_id: resolved.migration.tenant_id,
      resolution: resolved.resolution,
      published_count: resolved.publishedCount,
      ...storePayload,
      verdict: blockers.length === 0 ? 'GO' : 'NO-GO',
      blockers,
      gates,
      audit_mode: 'inline',
      publish_audit_error: e instanceof Error ? e.message : String(e),
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
  const action = typeof body?.action === 'string' ? body.action : '';

  if (action === 'pre_250_discover') {
    try {
      const data = await handlePre250Discover(admin);
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return new Response(JSON.stringify({ ok: false, action: 'pre_250_discover', error: msg }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  if (action === 'pre_250_audit') {
    try {
      const limit = Number(body.limit) || 50;
      const data = await handlePre250Audit(admin, body.migration_id, limit);
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return new Response(JSON.stringify({ ok: false, action: 'pre_250_audit', error: msg }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  if (action === 'product_channel_classification') {
    try {
      const r = await fetch(`${FN_BASE}/catalog_field_audit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SERVICE_ROLE}`,
          apikey: SERVICE_ROLE,
        },
        body: JSON.stringify({
          mode: 'channel_classification',
          shop_id: body.shop_id,
          misplaced_limit: body.misplaced_limit ?? 200,
        }),
      });
      const text = await r.text();
      const json = text ? JSON.parse(text) : {};
      if (!r.ok) throw new Error(json.error || text.slice(0, 400));
      return new Response(JSON.stringify({ ok: true, action, ...json }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return new Response(JSON.stringify({ ok: false, action: 'product_channel_classification', error: msg }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  if (action === 'missing_product_types') {
    try {
      const shopId = body.shop_id ?? '010120e6-6def-431e-8614-905cb69f85b9';
      const report = await buildMissingProductTypeReport(admin, shopId);
      return new Response(JSON.stringify({
        ok: true,
        action,
        mode: 'missing_product_types',
        source: 'shopify-cloner-worker → Supabase DB',
        ...report,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return new Response(JSON.stringify({ ok: false, action: 'missing_product_types', error: msg }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  if (action === 'final_verification_audit') {
    try {
      const resolved = await resolveClonerMigration(admin, body.migration_id);
      const { data: targetStore, error: targetErr } = await admin
        .from('cloner_stores')
        .select('*')
        .eq('id', resolved.migration.target_store_id)
        .maybeSingle();
      if (targetErr) throw targetErr;
      if (!targetStore) throw new Error(`Target store not found: ${resolved.migration.target_store_id}`);

      const audit = await buildClonerFinalVerificationAudit(admin, {
        migrationId: resolved.migration.id,
        migrationName: resolved.migration.name,
        resolution: resolved.resolution,
        sourceStore: resolved.stores.source,
        targetStore,
        productOffset: body.product_offset,
        productLimit: body.product_limit,
      });
      return new Response(JSON.stringify(audit), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return new Response(JSON.stringify({ ok: false, action: 'final_verification_audit', error: msg }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  if (action === 'migration_recovery_pass') {
    try {
      const resolved = await resolveClonerMigration(admin, body.migration_id);
      const { data: sourceStore, error: sourceErr } = await admin
        .from('cloner_stores')
        .select('*')
        .eq('id', resolved.migration.source_store_id)
        .maybeSingle();
      const { data: targetStore, error: targetErr } = await admin
        .from('cloner_stores')
        .select('*')
        .eq('id', resolved.migration.target_store_id)
        .maybeSingle();
      if (sourceErr) throw sourceErr;
      if (targetErr) throw targetErr;
      if (!sourceStore || !targetStore) throw new Error('Source or target store not found');

      const tasks = Array.isArray(body.tasks) && body.tasks.length ? body.tasks : undefined;
      const result = await runMigrationRecoveryPass(admin, {
        migrationId: resolved.migration.id,
        migrationName: resolved.migration.name,
        sourceStore,
        targetStore,
        tasks,
        collectionRecoveryDryRun: body.dry_run === true,
        productOffset: body.product_offset,
        productLimit: body.product_limit,
      });
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return new Response(JSON.stringify({ ok: false, action: 'migration_recovery_pass', error: msg }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  if (action === 'collection_reconciliation_audit') {
    try {
      const resolved = await resolveClonerMigration(admin, body.migration_id);
      const { data: targetStore, error: targetErr } = await admin
        .from('cloner_stores')
        .select('*')
        .eq('id', resolved.migration.target_store_id)
        .maybeSingle();
      if (targetErr) throw targetErr;
      if (!targetStore) throw new Error(`Target store not found: ${resolved.migration.target_store_id}`);

      const audit = await buildCollectionReconciliationAudit(admin, {
        migrationId: resolved.migration.id,
        migrationName: resolved.migration.name,
        resolution: resolved.resolution,
        sourceStore: resolved.stores.source,
        targetStore,
      });
      return new Response(JSON.stringify(audit), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return new Response(JSON.stringify({ ok: false, action: 'collection_reconciliation_audit', error: msg }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  if (action === 'smart_collection_mapping_fix') {
    try {
      const resolved = await resolveClonerMigration(admin, body.migration_id);
      const result = await runSmartCollectionMappingPass(admin, {
        migrationId: resolved.migration.id,
        dryRun: !!body.dry_run,
        handles: Array.isArray(body.handles) ? body.handles : undefined,
      });
      return new Response(JSON.stringify({ ok: true, action, migration_id: resolved.migration.id, ...result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return new Response(JSON.stringify({ ok: false, action: 'smart_collection_mapping_fix', error: msg }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  if (action === 'publish_menu_dependency_pages') {
    try {
      const resolved = await resolveClonerMigration(admin, body.migration_id);
      const { data: target } = await admin.from('cloner_stores').select('*').eq('id', resolved.migration.target_store_id).single();
      if (!target) throw new Error('target store not found');
      const result = await publishMenuDependencyPages(admin, target, {
        migrationId: resolved.migration.id,
        dryRun: !!body.dry_run,
        handles: Array.isArray(body.handles) ? body.handles : undefined,
      });
      return new Response(JSON.stringify({ ok: true, action, migration_id: resolved.migration.id, ...result }), {
  if (action === 'menu_cleanup_pass') {
    try {
      const resolved = await resolveClonerMigration(admin, body.migration_id);
      const { data: target } = await admin.from('cloner_stores').select('*').eq('id', resolved.migration.target_store_id).maybeSingle();
      if (!target) throw new Error(`Target store not found: ${resolved.migration.target_store_id}`);
      const mode = body.mode === 'execute' ? 'execute' : 'safe';
      const result = await runMenuCleanupAudit(admin, {
        migrationId: resolved.migration.id,
        targetStore: target,
        mode,
        confirm_delete: body.confirm_delete === true,
      });
      return new Response(JSON.stringify({
        ok: true,
        action,
        migration_id: resolved.migration.id,
        ...result,
        markdown: formatMenuCleanupMarkdown(result),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return new Response(JSON.stringify({ ok: false, action: 'menu_cleanup_pass', error: msg }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  if (action === 'edp_launch_prep') {
    try {
      const resolved = await resolveClonerMigration(admin, body.migration_id);
      const { data: targetStore } = await admin.from('cloner_stores').select('*').eq('id', resolved.migration.target_store_id).maybeSingle();
      if (!targetStore) throw new Error(`Target store not found: ${resolved.migration.target_store_id}`);
      const access = await resolveShopAccess(targetStore);
      const result = await runLaunchPrep(access, {
        action: body.prep_action || 'preview',
        dry_run: body.dry_run !== false,
        confirm_delete: body.confirm_delete === true,
        confirm: body.confirm === true,
        approved_by: body.approved_by,
        rename_kinds: body.rename_kinds,
        handles: body.handles,
        migration_id: resolved.migration.id,
        admin,
      });
      return new Response(JSON.stringify({
        ok: result.ok,
        action,
        migration_id: resolved.migration.id,
        ...result,
        markdown: formatLaunchPrepMarkdown(result),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return new Response(JSON.stringify({ ok: false, action: 'edp_launch_prep', error: msg }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  if (action === 'edp_deploy_industry_pages') {
    try {
      const result = await runEdpIndustryPagesDeploy(admin, {
        shop_id: body.shop_id,
        deploy_theme: body.deploy_theme !== false,
        dry_run: body.dry_run === true,
      });
      return new Response(JSON.stringify({ action, ...result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return new Response(JSON.stringify({ ok: false, action: 'edp_deploy_industry_pages', error: msg }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  if (action === 'edp_deploy_comparison_blog') {
    try {
      const result = await runEdpComparisonBlogDeploy(admin, {
        shop_id: body.shop_id,
        deploy_theme: body.deploy_theme !== false,
        dry_run: body.dry_run === true,
      });
      return new Response(JSON.stringify({ action, ...result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return new Response(JSON.stringify({ ok: false, action: 'publish_menu_dependency_pages', error: msg }), {
      return new Response(JSON.stringify({ ok: false, action: 'edp_deploy_comparison_blog', error: msg }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  if (action === 'edp_deploy_faq_blog') {
    try {
      const result = await runEdpFaqBlogDeploy(admin, {
        shop_id: body.shop_id,
        deploy_theme: body.deploy_theme !== false,
        dry_run: body.dry_run === true,
      });
      return new Response(JSON.stringify({ action, ...result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return new Response(JSON.stringify({ ok: false, action: 'edp_deploy_faq_blog', error: msg }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  if (action === 'list_target_menus') {
    try {
      let access;
      let migrationId = body.migration_id || null;
      if (body.target_shop_domain) {
        access = await resolveShopAccess({ shop_domain: String(body.target_shop_domain) });
      } else {
        const resolved = await resolveClonerMigration(admin, body.migration_id);
        migrationId = resolved.migration.id;
        const { data: targetStore } = await admin
          .from('cloner_stores')
          .select('*')
          .eq('id', resolved.migration.target_store_id)
          .maybeSingle();
        if (!targetStore) throw new Error(`Target store not found: ${resolved.migration.target_store_id}`);
        access = await resolveShopAccess(targetStore);
      }
      const menus: Array<{ id: string; handle: string; title: string; is_default: boolean; item_count: number }> = [];
      let cursor: string | null = null;
      for (let page = 0; page < 30; page++) {
        const data = await shopifyGraphql(access, `
          query($cursor: String) {
            menus(first: 50, after: $cursor) {
              pageInfo { hasNextPage endCursor }
              nodes {
                id handle title isDefault
                items { id items { id items { id } } }
              }
            }
          }`, { cursor });
        const countItems = (items: any[]): number => {
          let c = 0;
          for (const it of items || []) {
            c += 1;
            if (it.items?.length) c += countItems(it.items);
          }
          return c;
        };
        for (const n of data?.menus?.nodes || []) {
          if (!n?.handle) continue;
          menus.push({
            id: String(n.id),
            handle: String(n.handle),
            title: String(n.title || n.handle),
            is_default: !!n.isDefault,
            item_count: countItems(n.items || []),
          });
        }
        if (!data?.menus?.pageInfo?.hasNextPage) break;
        cursor = data?.menus?.pageInfo?.endCursor ?? null;
      }
      menus.sort((a, b) => a.handle.localeCompare(b.handle));
      return new Response(JSON.stringify({
        ok: true,
        action,
        migration_id: migrationId,
        target_domain: access.domain,
        menus,
        total: menus.length,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return new Response(JSON.stringify({ ok: false, action: 'list_target_menus', error: msg }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  if (action === 'menu_recovery_fix') {
    try {
      const resolved = await resolveClonerMigration(admin, body.migration_id);
      const result = await runMenuRecoveryPass(admin, {
        migrationId: resolved.migration.id,
        dryRun: !!body.dry_run,
        publishPages: body.publish_pages !== false,
        approvedRestoreHandles: Array.isArray(body.approved_restore_handles) ? body.approved_restore_handles : undefined,
      });
      return new Response(JSON.stringify({ ok: true, action, migration_id: resolved.migration.id, ...result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return new Response(JSON.stringify({ ok: false, action: 'menu_recovery_fix', error: msg }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  if (action === 'migration_audit_report') {
    try {
      const resolved = await resolveClonerMigration(admin, body.migration_id);
      const audit = await buildMigrationAuditReport(admin, {
        migrationId: resolved.migration.id,
        approvedRestoreHandles: Array.isArray(body.approved_restore_handles) ? body.approved_restore_handles : undefined,
      });
      return new Response(JSON.stringify({
        ok: true,
        action,
        migration_id: resolved.migration.id,
        audit,
        markdown: formatMigrationAuditMarkdown(audit),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return new Response(JSON.stringify({ ok: false, action: 'migration_audit_report', error: msg }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  if (action === 'menu_inventory_audit') {
    try {
      const resolved = await resolveClonerMigration(admin, body.migration_id);
      const { data: targetStore, error: targetErr } = await admin
        .from('cloner_stores')
        .select('*')
        .eq('id', resolved.migration.target_store_id)
        .maybeSingle();
      if (targetErr) throw targetErr;
      if (!targetStore) throw new Error(`Target store not found: ${resolved.migration.target_store_id}`);
      const audit = await buildShopifyMenuInventoryAudit(admin, {
        migrationId: resolved.migration.id,
        targetStore,
      });
      return new Response(JSON.stringify({ ok: true, action, migration_id: resolved.migration.id, ...audit }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return new Response(JSON.stringify({ ok: false, action: 'menu_inventory_audit', error: msg }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  if (action === 'collection_gap_audit') {
    try {
      const resolved = await resolveClonerMigration(admin, body.migration_id);
      const { data: source } = await admin.from('cloner_stores').select('*').eq('id', resolved.migration.source_store_id).maybeSingle();
      const { data: target } = await admin.from('cloner_stores').select('*').eq('id', resolved.migration.target_store_id).maybeSingle();
      if (!target) throw new Error(`Target store not found: ${resolved.migration.target_store_id}`);
      const gap = await buildCollectionGapAudit(admin, {
        migrationId: resolved.migration.id,
        migrationName: resolved.migration.name,
        sourceStore: source,
        targetStore: target,
        approvedRestoreHandles: Array.isArray(body.approved_restore_handles) ? body.approved_restore_handles : undefined,
      });
      return new Response(JSON.stringify({
        ok: true,
        action,
        migration_id: resolved.migration.id,
        gap,
        markdown: formatCollectionGapMarkdown(gap),
        restore_approval_required: gap.pending_restore_approval,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return new Response(JSON.stringify({ ok: false, action: 'collection_gap_audit', error: msg }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  if (action) {
    return new Response(JSON.stringify({ ok: false, action, error: `Unknown action: ${action}` }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Claim up to MAX_PER_TICK jobs ready to run
  const { data: jobs } = await admin
    .from('cloner_jobs')
    .select('*')
    .in('status', ['queued', 'running'])
    .lte('next_run_at', new Date().toISOString())
    .order('created_at', { ascending: true })
    .limit(MAX_PER_TICK);

  if (!jobs || jobs.length === 0) {
    return new Response(JSON.stringify({ ok: true, processed: 0 }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const results: any[] = [];
  for (const job of jobs) {
    try {
      await admin.from('cloner_jobs').update({
        status: 'running', started_at: job.started_at || new Date().toISOString(),
        attempts: job.attempts + 1, updated_at: new Date().toISOString(),
      }).eq('id', job.id);

      const batch = job.batch_size || 25;
      let done = false;
      let succeeded = job.succeeded;
      let failed = job.failed;
      let processed = job.processed;
      let total = job.total;

      if (job.job_type === 'scan') {
        const scanTypes = Array.isArray(job.payload?.types) && job.payload.types.length > 0 ? job.payload.types : [];
        const typeIndex = Number(job.payload?.type_index || 0);
        const scanType = scanTypes[typeIndex];
        total = scanTypes.length;
        if (!scanType) {
          done = true;
        } else {
          const r: any = await callFn('shopify-cloner-scan', {
            migration_id: job.migration_id,
            scan_type: scanType,
            cursor: job.payload?.cursor || null,
            page_limit: Math.max(1, Math.min(batch, 20)),
          });
          succeeded = Object.values(r.stats || {}).reduce((sum: number, v: any) => sum + Number(v || 0), 0);
          if (r.done) {
            const nextIndex = typeIndex + 1;
            processed = nextIndex;
            done = nextIndex >= scanTypes.length;
            job.payload = { ...job.payload, type_index: nextIndex, cursor: null };
          } else {
            processed = typeIndex;
            job.payload = { ...job.payload, type_index: typeIndex, cursor: r.next_cursor || null };
          }
        }
      } else if (job.job_type === 'transform') {
        const { count: pending } = await admin.from('cloner_migration_items')
          .select('id', { count: 'exact', head: true })
          .eq('migration_id', job.migration_id).is('transformed_payload', null);
        if (total === 0) total = (processed) + (pending || 0);
        if (!pending) {
          done = true;
        } else {
          // Read migration.transformation for direct_copy mode + selective SEO flag
          const { data: mig } = await admin.from('cloner_migrations')
            .select('transformation').eq('id', job.migration_id).maybeSingle();
          const tx = (mig?.transformation || {}) as Record<string, unknown>;
          const transformBody: Record<string, unknown> = { migration_id: job.migration_id, limit: batch };
          if (tx.mode) transformBody.mode = tx.mode;
          if (tx.selective_ai_for_seo !== undefined) transformBody.selective_ai_for_seo = tx.selective_ai_for_seo;
          // Job payload can override the migration-level setting
          if (job.payload?.mode) transformBody.mode = job.payload.mode;
          if (job.payload?.selective_ai_for_seo !== undefined) transformBody.selective_ai_for_seo = job.payload.selective_ai_for_seo;
          const r: any = await callFn('shopify-cloner-transform', transformBody);
          succeeded += r.ok || 0;
          failed += r.fail || 0;
          processed += (r.ok || 0) + (r.fail || 0);
          if (!r.ok && !r.fail) done = true;
        }
      } else if (job.job_type === 'publish') {
        const pl = job.payload || {};
        const itemIds: string[] | undefined = Array.isArray(pl.item_ids) && pl.item_ids.length ? pl.item_ids : undefined;
        let pendingPub = 0;
        if (itemIds) {
          const { count } = await admin.from('cloner_migration_items')
            .select('id', { count: 'exact', head: true })
            .eq('migration_id', job.migration_id)
            .in('id', itemIds)
            .neq('publish_status', 'published');
          pendingPub = count || 0;
        } else {
          const { count } = await admin.from('cloner_migration_items')
            .select('id', { count: 'exact', head: true })
            .eq('migration_id', job.migration_id)
            .eq('approval_status', 'approved')
            .neq('publish_status', 'published');
          pendingPub = count || 0;
        }
        if (total === 0) total = processed + pendingPub;
        if (!pendingPub) {
          done = true;
        } else {
          const publishBody: Record<string, unknown> = { migration_id: job.migration_id, limit: batch };
          if (itemIds) publishBody.item_ids = itemIds;
          if (pl.mode) publishBody.mode = pl.mode;
          if (pl.skip_sales_channels !== undefined) publishBody.skip_sales_channels = pl.skip_sales_channels;
          if (pl.protected_fields !== undefined) publishBody.protected_fields = pl.protected_fields;
          if (pl.max_parallel !== undefined) publishBody.max_parallel = pl.max_parallel;
          const r: any = await callFn('shopify-cloner-publish', publishBody);
          succeeded += (r.created || 0) + (r.updated || 0);
          failed += r.failed || 0;
          processed += (r.created || 0) + (r.updated || 0) + (r.skipped || 0) + (r.failed || 0);
          if (((r.created || 0) + (r.updated || 0) + (r.skipped || 0) + (r.failed || 0)) === 0) done = true;
        }
      }


      const nextDelaySec = done ? 0 : 15;
      await admin.from('cloner_jobs').update({
        status: done ? 'completed' : 'running',
        processed, succeeded, failed, total, payload: job.payload,
        finished_at: done ? new Date().toISOString() : null,
        next_run_at: new Date(Date.now() + nextDelaySec * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        last_error: null,
      }).eq('id', job.id);

      if (job.job_type === 'scan' && done) {
        await admin.from('cloner_migrations').update({ status: 'review' }).eq('id', job.migration_id);
      }

      results.push({ id: job.id, done, processed, total });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const fatal = job.attempts >= 5;
      await admin.from('cloner_jobs').update({
        status: fatal ? 'failed' : 'queued',
        last_error: msg,
        next_run_at: new Date(Date.now() + 60_000 * (job.attempts + 1)).toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('id', job.id);
      await admin.from('cloner_logs').insert({
        migration_id: job.migration_id, tenant_id: job.tenant_id,
        event: `worker_${job.job_type}_error`, level: 'error', message: msg,
      });
      results.push({ id: job.id, error: msg });
    }
  }

  return new Response(JSON.stringify({ ok: true, processed: results.length, results }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});
