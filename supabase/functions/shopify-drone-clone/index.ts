// One-shot drone migration orchestrator.
// Pulls drone-related products + collections from a SOURCE Shopify shop
// (resolved by shop_id) and re-creates them on a TARGET Shopify shop
// (also resolved by shop_id). Media is re-hosted on target by passing
// the source CDN URL to Shopify's product images endpoint (Shopify
// fetches and re-uploads to the target CDN automatically).
//
// Actions:
//   POST { action: 'start',  source_shop_id, target_shop_id, conflict: 'merge'|'skip'|'suffix' }
//   POST { action: 'scan',   migration_id }
//   POST { action: 'publish', migration_id, limit? }
//   POST { action: 'status', migration_id }
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { getShopifyContext, shopifyGraphQL, SHOPIFY_API_VERSION } from '../_shared/shopify-client.ts';
import { linkVariantInventoryCompliance } from '../_shared/cloner-inventory-compliance.ts';
import { canActivateSupplierProduct, logDraftSafetyEvent } from '../_shared/product-draft-safety.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

const DRONE_KEYWORDS = [
  'dron', 'drone', 'drönare', 'dji', 'autel', 'parrot', 'skydio',
  'rtk', 'payload', 'gimbal', 'propeller', 'propellrar', 'batter',
  'fpv', 'multirotor', 'quad', 'mavic', 'matrice', 'phantom',
  'enterprise', 'agras', 'flygtid', 'nyttolast', 'uav', 'aerial',
  'tello', 'avata', 'inspire', 'spark', 'air ', 'mini ',
];

function looksDroney(...parts: (string | null | undefined)[]) {
  const blob = parts.filter(Boolean).join(' ').toLowerCase();
  return DRONE_KEYWORDS.some((k) => blob.includes(k));
}

async function rest(domain: string, token: string, method: string, path: string, body?: unknown) {
  let attempt = 0;
  while (true) {
    const r = await fetch(`https://${domain}/admin/api/${SHOPIFY_API_VERSION}/${path}`, {
      method,
      headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (r.status === 429 || r.status >= 500) {
      attempt++;
      if (attempt > 5) throw new Error(`shopify ${r.status}`);
      await new Promise((res) => setTimeout(res, 1200 * attempt));
      continue;
    }
    const text = await r.text();
    const json = text ? JSON.parse(text) : {};
    if (!r.ok) throw new Error(`shopify ${r.status}: ${text.slice(0, 400)}`);
    return json;
  }
}

const PRODUCT_Q = `
query Products($cursor: String) {
  products(first: 25, after: $cursor) {
    pageInfo { hasNextPage endCursor }
    nodes {
      id handle title descriptionHtml vendor productType tags status
      seo { title description }
      collections(first: 25) { nodes { id handle title } }
      media(first: 25) { nodes { ... on MediaImage { image { url altText } } } }
      metafields(first: 50) { nodes { namespace key value type } }
      options { name values }
      variants(first: 100) {
        nodes {
          id title sku barcode price compareAtPrice inventoryPolicy
          inventoryItem { measurement { weight { value unit } } harmonizedSystemCode countryCodeOfOrigin }
          selectedOptions { name value }
        }
      }
    }
  }
}`;

const COLLECTION_Q = `
query Collections($cursor: String) {
  collections(first: 50, after: $cursor) {
    pageInfo { hasNextPage endCursor }
    nodes {
      id handle title descriptionHtml sortOrder
      seo { title description }
      image { url altText }
      metafields(first: 50) { nodes { namespace key value type } }
      ruleSet { rules { column relation condition } appliedDisjunctively }
    }
  }
}`;

interface StartBody {
  action: 'start';
  source_shop_id: string;
  target_shop_id: string;
  conflict?: 'merge' | 'skip' | 'suffix';
}

async function authedUser(req: Request) {
  const auth = req.headers.get('Authorization') || '';
  const client = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
  const { data: { user } } = await client.auth.getUser();
  if (!user) throw new Error('unauthorized');
  return user;
}

async function log(migration_id: string, tenant_id: string | null, event: string, message?: string, extra: Record<string, unknown> = {}) {
  await admin.from('cloner_logs').insert({
    migration_id, tenant_id: tenant_id as any, event, message: message ?? null, ...extra,
  } as any);
}

async function handleStart(req: Request, body: StartBody) {
  const user = await authedUser(req);
  if (!body.source_shop_id || !body.target_shop_id) throw new Error('shop ids required');


  const { data: profile } = await admin.from('profiles').select('tenant_id').eq('user_id', user.id).maybeSingle();
  const tenant_id = profile?.tenant_id ?? null;

  const conflict = body.conflict ?? 'merge';
  const modeByConflict: Record<'merge' | 'skip' | 'suffix', 'update_existing' | 'skip_existing' | 'create_only'> = {
    merge: 'update_existing',
    skip: 'skip_existing',
    suffix: 'create_only',
  };
  const { data: migration, error } = await admin.from('cloner_migrations').insert({
    tenant_id,
    created_by: user.id,
    name: `Drone clone ${new Date().toISOString().slice(0, 16)}`,
    mode: modeByConflict[conflict],
    source_store_id: body.source_shop_id,
    target_store_id: body.target_shop_id,
    scope: { source_shop_id: body.source_shop_id, target_shop_id: body.target_shop_id, conflict, types: ['collection', 'product'] },
    status: 'draft',
  } as any).select().single();
  if (error) throw error;
  await log(migration.id, tenant_id, 'created', `Source=${body.source_shop_id} Target=${body.target_shop_id} conflict=${conflict}`);
  return { migration };
}

async function scanShop(migration_id: string) {
  const { data: migration } = await admin.from('cloner_migrations').select('*').eq('id', migration_id).single();
  if (!migration) throw new Error('migration missing');
  const scope = migration.scope as any;
  const src = await getShopifyContext({ shopId: scope.source_shop_id, fnName: 'shopify-drone-clone:scan' });
  await admin.from('cloner_migrations').update({ status: 'scanning', error: null } as any).eq('id', migration_id);
  await log(migration_id, migration.tenant_id, 'scan_started', `source=${src.shopDomain}`);

  const stats = { collections: 0, products: 0, collections_drone: 0, products_drone: 0 } as Record<string, number>;

  // --- Collections ---
  let cursor: string | null = null;
  const droneCollectionHandles = new Set<string>();
  while (true) {
    const data: any = await shopifyGraphQL(src, COLLECTION_Q, { cursor });
    const conn = data.collections;
    for (const n of conn.nodes) {
      stats.collections++;
      const matches = looksDroney(n.title, n.handle, n.descriptionHtml);
      if (!matches) continue;
      stats.collections_drone++;
      droneCollectionHandles.add(n.handle);
      await admin.from('cloner_migration_items').upsert({
        migration_id, tenant_id: migration.tenant_id, object_type: 'collection',
        source_id: n.id, source_handle: n.handle, source_payload: n, approval_status: 'approved',
      } as any, { onConflict: 'migration_id,object_type,source_id' } as any);
    }
    if (!conn.pageInfo.hasNextPage) break;
    cursor = conn.pageInfo.endCursor;
  }

  // --- Products ---
  cursor = null;
  while (true) {
    const data: any = await shopifyGraphQL(src, PRODUCT_Q, { cursor });
    const conn = data.products;
    for (const n of conn.nodes) {
      stats.products++;
      const inDroneCol = (n.collections?.nodes || []).some((c: any) => droneCollectionHandles.has(c.handle));
      const matches = inDroneCol || looksDroney(n.title, n.productType, n.vendor, (n.tags || []).join(' '));
      if (!matches) continue;
      stats.products_drone++;
      await admin.from('cloner_migration_items').upsert({
        migration_id, tenant_id: migration.tenant_id, object_type: 'product',
        source_id: n.id, source_handle: n.handle, source_payload: n, approval_status: 'approved',
      } as any, { onConflict: 'migration_id,object_type,source_id' } as any);
    }
    if (!conn.pageInfo.hasNextPage) break;
    cursor = conn.pageInfo.endCursor;
  }

  await admin.from('cloner_migrations').update({ status: 'review', stats } as any).eq('id', migration_id);
  await log(migration_id, migration.tenant_id, 'scan_done', `collections=${stats.collections_drone}/${stats.collections} products=${stats.products_drone}/${stats.products}`);
  return { ok: true, stats };
}

function buildProductPayload(src: any, opts: { conflictSuffix?: boolean }) {
  return {
    product: {
      title: src.title,
      body_html: src.descriptionHtml || '',
      vendor: src.vendor || undefined,
      product_type: src.productType || undefined,
      handle: opts.conflictSuffix ? `${src.handle}-copy` : src.handle,
      tags: (src.tags || []).join(', '),
      status: 'draft',
      options: (src.options || []).map((o: any) => ({ name: o.name, values: o.values })),
      variants: (src.variants?.nodes || []).map((v: any) => ({
        option1: v.selectedOptions?.[0]?.value, option2: v.selectedOptions?.[1]?.value, option3: v.selectedOptions?.[2]?.value,
        price: v.price, compare_at_price: v.compareAtPrice, sku: v.sku, barcode: v.barcode,
        inventory_policy: (v.inventoryPolicy || 'deny').toLowerCase(),
        weight: v.inventoryItem?.measurement?.weight?.value,
        weight_unit: (v.inventoryItem?.measurement?.weight?.unit || 'kg').toLowerCase(),
      })),
      images: (src.media?.nodes || []).filter((m: any) => m.image?.url).map((m: any) => ({ src: m.image.url, alt: m.image.altText })),
      metafields: [
        ...(src.metafields?.nodes || []).map((mf: any) => ({ namespace: mf.namespace, key: mf.key, value: mf.value, type: mf.type })),
        ...(src.seo?.title ? [{ namespace: 'global', key: 'title_tag', value: src.seo.title, type: 'single_line_text_field' }] : []),
        ...(src.seo?.description ? [{ namespace: 'global', key: 'description_tag', value: src.seo.description, type: 'single_line_text_field' }] : []),
      ],
    },
  };
}

function buildCollectionPayload(src: any, opts: { conflictSuffix?: boolean }) {
  const handle = opts.conflictSuffix ? `${src.handle}-copy` : src.handle;
  // Smart collection if ruleSet has rules
  if (src.ruleSet?.rules?.length) {
    return {
      smart: true,
      payload: {
        smart_collection: {
          title: src.title, body_html: src.descriptionHtml || '', handle,
          published: false,
          disjunctive: !!src.ruleSet.appliedDisjunctively,
          rules: src.ruleSet.rules.map((r: any) => ({
            column: r.column?.toLowerCase(),
            relation: r.relation?.toLowerCase(),
            condition: r.condition,
          })),
          image: src.image?.url ? { src: src.image.url, alt: src.image.altText } : undefined,
        },
      },
    };
  }
  return {
    smart: false,
    payload: {
      custom_collection: {
        title: src.title, body_html: src.descriptionHtml || '', handle, published: false,
        image: src.image?.url ? { src: src.image.url, alt: src.image.altText } : undefined,
      },
    },
  };
}

async function publishBatch(migration_id: string, limit = 20) {
  const { data: migration } = await admin.from('cloner_migrations').select('*').eq('id', migration_id).single();
  if (!migration) throw new Error('migration missing');
  const scope = migration.scope as any;
  const conflict = (scope.conflict ?? 'merge') as 'merge' | 'skip' | 'suffix';
  const tgt = await getShopifyContext({ shopId: scope.target_shop_id, fnName: 'shopify-drone-clone:publish' });

  await admin.from('cloner_migrations').update({ status: 'publishing' } as any).eq('id', migration_id);

  // Publish collections first, then products
  const collectionHandleToId = new Map<string, number>();

  const { data: pending } = await admin.from('cloner_migration_items')
    .select('*').eq('migration_id', migration_id).eq('approval_status', 'approved')
    .is('publish_status', null)
    .order('object_type', { ascending: true }) // collection before product alphabetically
    .limit(limit);

  let ok = 0, fail = 0, skipped = 0;

  for (const item of pending || []) {
    try {
      if (item.object_type === 'collection') {
        const built = buildCollectionPayload(item.source_payload, { conflictSuffix: conflict === 'suffix' });
        const lookupPath = built.smart ? 'smart_collections.json' : 'custom_collections.json';
        const lookupKey = built.smart ? 'smart_collections' : 'custom_collections';
        let existing: any = null;
        if (conflict !== 'suffix') {
          const found = await rest(tgt.shopDomain, tgt.accessToken, 'GET', `${lookupPath}?handle=${encodeURIComponent(item.source_handle)}&limit=1`).catch(() => ({}));
          existing = found?.[lookupKey]?.[0];
        }
        let resp: any;
        if (existing && conflict === 'skip') {
          await admin.from('cloner_migration_items').update({ publish_status: 'skipped', target_id: String(existing.id), target_handle: existing.handle } as any).eq('id', item.id);
          collectionHandleToId.set(existing.handle, existing.id);
          skipped++; continue;
        } else if (existing && conflict === 'merge') {
          const updatePath = built.smart ? `smart_collections/${existing.id}.json` : `custom_collections/${existing.id}.json`;
          const updateKey = built.smart ? 'smart_collection' : 'custom_collection';
          resp = await rest(tgt.shopDomain, tgt.accessToken, 'PUT', updatePath, { [updateKey]: { id: existing.id, ...(built.payload as any)[updateKey] } });
        } else {
          resp = await rest(tgt.shopDomain, tgt.accessToken, 'POST', lookupPath, built.payload);
        }
        const created = resp?.[lookupKey.replace(/s$/, '')] || resp?.smart_collection || resp?.custom_collection;
        collectionHandleToId.set(created.handle, created.id);
        await admin.from('cloner_migration_items').update({ publish_status: 'published', target_id: String(created.id), target_handle: created.handle } as any).eq('id', item.id);
        await admin.from('cloner_object_mappings').upsert({
          migration_id, tenant_id: migration.tenant_id, object_type: 'collection',
          source_id: item.source_id, source_handle: item.source_handle, target_id: String(created.id), target_handle: created.handle, status: 'published',
        } as any, { onConflict: 'migration_id,object_type,source_id' } as any);
        ok++;
      } else if (item.object_type === 'product') {
        const built = buildProductPayload(item.source_payload, { conflictSuffix: conflict === 'suffix' });
        let existing: any = null;
        if (conflict !== 'suffix') {
          const found = await rest(tgt.shopDomain, tgt.accessToken, 'GET', `products.json?handle=${encodeURIComponent(item.source_handle)}&limit=1`).catch(() => ({}));
          existing = found?.products?.[0];
        }
        let created: any;
        if (existing && conflict === 'skip') {
          await admin.from('cloner_migration_items').update({ publish_status: 'skipped', target_id: String(existing.id), target_handle: existing.handle } as any).eq('id', item.id);
          skipped++; continue;
        } else if (existing && conflict === 'merge') {
          const resp = await rest(tgt.shopDomain, tgt.accessToken, 'PUT', `products/${existing.id}.json`, { product: { id: existing.id, ...built.product, images: built.product.images } });
          created = resp.product;
        } else {
          const resp = await rest(tgt.shopDomain, tgt.accessToken, 'POST', 'products.json', built.product);
          created = resp.product;
        }

        const compliance = await linkVariantInventoryCompliance(
          created,
          item.source_payload,
          (query, variables) => shopifyGraphQL(tgt, query, variables ?? {}),
          (msg) => console.log(msg),
        );
        await log(
          migration_id,
          migration.tenant_id,
          'inventory_compliance',
          `product ${item.source_handle}: matched=${compliance.matched} updated=${compliance.updated} unmatched=${compliance.unmatched.join(',') || 'none'}`,
          { object_type: 'product', object_id: item.source_id },
        );

        const cloneShopId = String((scope as { target_shop_id?: string }).target_shop_id ?? migration.tenant_id);
        const cloneSku = created?.variants?.[0]?.sku ?? item.source_handle;
        await logDraftSafetyEvent(admin, {
          shopId: cloneShopId,
          functionName: 'shopify-drone-clone',
          sku: cloneSku,
          action: 'force_draft',
          enforcedStatus: 'DRAFT',
          reason: 'clone_supplier_default_draft',
          inventorySource: 'clone',
          metadata: { migration_id, source_handle: item.source_handle },
        });

        // Link product to its drone collections that we cloned
        const srcCols = (item.source_payload.collections?.nodes || []) as any[];
        for (const col of srcCols) {
          const tgtColId = collectionHandleToId.get(col.handle);
          if (!tgtColId) {
            const { data: mapped } = await admin.from('cloner_object_mappings').select('target_id').eq('migration_id', migration_id).eq('object_type', 'collection').eq('source_handle', col.handle).maybeSingle();
            if (mapped?.target_id) collectionHandleToId.set(col.handle, Number(mapped.target_id));
          }
          const colId = collectionHandleToId.get(col.handle);
          if (!colId) continue;
          // Try create collect (works for custom collections only; smart collections auto-populate)
          await rest(tgt.shopDomain, tgt.accessToken, 'POST', 'collects.json', { collect: { product_id: created.id, collection_id: colId } }).catch(() => null);
        }

        await admin.from('cloner_migration_items').update({ publish_status: 'published', target_id: String(created.id), target_handle: created.handle } as any).eq('id', item.id);
        await admin.from('cloner_object_mappings').upsert({
          migration_id, tenant_id: migration.tenant_id, object_type: 'product',
          source_id: item.source_id, source_handle: item.source_handle, target_id: String(created.id), target_handle: created.handle, status: 'published',
        } as any, { onConflict: 'migration_id,object_type,source_id' } as any);
        ok++;
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await admin.from('cloner_migration_items').update({ publish_status: 'failed', error: msg } as any).eq('id', item.id);
      await log(migration_id, migration.tenant_id, 'publish_failed', msg, { object_type: item.object_type, object_id: item.source_id, level: 'error' });
      fail++;
    }
  }

  // Update migration counts and final status
  const { data: remaining } = await admin.from('cloner_migration_items')
    .select('id', { count: 'exact', head: true })
    .eq('migration_id', migration_id).eq('approval_status', 'approved').is('publish_status', null);
  const isDone = !(remaining as any)?.count;
  const newStats = { ...(migration.stats || {}), published_ok: (migration.stats?.published_ok || 0) + ok, published_fail: (migration.stats?.published_fail || 0) + fail, published_skipped: (migration.stats?.published_skipped || 0) + skipped };
  await admin.from('cloner_migrations').update({ status: isDone ? 'completed' : 'publishing', stats: newStats, completed_at: isDone ? new Date().toISOString() : null } as any).eq('id', migration_id);
  await log(migration_id, migration.tenant_id, 'publish_batch_done', `ok=${ok} fail=${fail} skipped=${skipped}`);

  return { ok, fail, skipped, done: isDone };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const body = await req.json().catch(() => ({} as any));
    const action = body.action as string;
    if (action === 'start') {
      const out = await handleStart(req, body as StartBody);
      return new Response(JSON.stringify(out), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (action === 'scan') {
      await authedUser(req);
      const out = await scanShop(body.migration_id);
      return new Response(JSON.stringify(out), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (action === 'publish') {
      await authedUser(req);
      const out = await publishBatch(body.migration_id, body.limit ?? 20);
      return new Response(JSON.stringify(out), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (action === 'status') {
      await authedUser(req);
      const { data: m } = await admin.from('cloner_migrations').select('*').eq('id', body.migration_id).single();
      const { data: items } = await admin.from('cloner_migration_items').select('object_type,approval_status,publish_status,error').eq('migration_id', body.migration_id);
      const { data: logs } = await admin.from('cloner_logs').select('*').eq('migration_id', body.migration_id).order('created_at', { ascending: false }).limit(50);
      return new Response(JSON.stringify({ migration: m, items, logs }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ error: 'unknown action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    const msg = e instanceof Error
      ? (e.stack || e.message)
      : (typeof e === 'string' ? e : (() => { try { return JSON.stringify(e); } catch { return String(e); } })());
    console.error('drone-clone error', msg, e);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
