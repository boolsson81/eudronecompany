// Auto-import already connected Shopify shops into cloner_stores
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const API_VERSION = '2025-07';

function normalizeDomain(input: string): string {
  let d = input.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '');
  return d.split('/')[0];
}

async function validateShop(domain: string, token: string) {
  const query = `query { shop { name myshopifyDomain primaryDomain { host url } currencyCode } }`;
  const res = await fetch(`https://${domain}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || (json as any).errors || !(json as any).data?.shop) {
    return { ok: false as const, error: (json as any).errors || `HTTP ${res.status}` };
  }
  return { ok: true as const, shop: (json as any).data.shop };
}

// Map shops to fallback env-secret token + myshopify domain
function envMappingFor(shopName: string | null, domain: string): { token: string | null; domain: string | null } {
  const n = (shopName || '').toLowerCase();
  const d = domain.toLowerCase();
  if (n.includes('eudrone') || d.includes('ya1xhg-x6') || d.includes('eudrone')) {
    return { token: Deno.env.get('EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN') || null, domain: 'ya1xhg-x6.myshopify.com' };
  }
  if (n.includes('actionking') || d.includes('actionking') || d.includes('actinking')) {
    return {
      token: Deno.env.get('EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN') || null,
      domain: Deno.env.get('SHOPIFY_STORE_DOMAIN') || null,
    };
  }
  return { token: null, domain: null };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const authHeader = req.headers.get('Authorization') || '';
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: profile } = await admin.from('profiles').select('tenant_id').eq('user_id', user.id).maybeSingle();
    if (!profile?.tenant_id) {
      return new Response(JSON.stringify({ error: 'no tenant' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // All Shopify shops accessible across tenants (admin/global view)
    // We import every Shopify shop into the current tenant's cloner workspace
    const { data: shops } = await admin
      .from('shops')
      .select('id, name, domain, tenant_id')
      .eq('platform', 'shopify');

    const { data: installs } = await admin
      .from('shopify_app_installations')
      .select('shopify_domain, access_token');

    const tokenByDomain = new Map<string, string>();
    for (const i of installs || []) {
      if ((i as any).access_token && (i as any).access_token.length > 0) {
        tokenByDomain.set(((i as any).shopify_domain as string).toLowerCase(), (i as any).access_token);
      }
    }

    const { data: existing } = await admin
      .from('cloner_stores')
      .select('id, shop_domain')
      .eq('tenant_id', profile.tenant_id);
    const existingDomains = new Set((existing || []).map((s: any) => s.shop_domain));

    const results: any[] = [];

    for (const shop of shops || []) {
      let domain = normalizeDomain((shop as any).domain || '');
      if (!domain) continue;

      // Token resolution + domain override for storefront-only domains
      let token = tokenByDomain.get(domain) || null;
      if (!token) {
        const map = envMappingFor((shop as any).name, domain);
        token = map.token;
        if (map.domain) domain = normalizeDomain(map.domain);
        if (!token && map.domain) token = tokenByDomain.get(domain) || null;
      }
      if (!token) {
        results.push({ shop: (shop as any).name, domain, status: 'skipped', reason: 'no_token' });
        continue;
      }

      const validation = await validateShop(domain, token);
      if (!validation.ok) {
        results.push({ shop: (shop as any).name, domain, status: 'invalid', error: validation.error });
        continue;
      }

      const myshopify = validation.shop.myshopifyDomain
        ? normalizeDomain(validation.shop.myshopifyDomain)
        : domain;

      const recordDomain = myshopify; // Shopify Admin API requires myshopify domain
      if (existingDomains.has(recordDomain)) {
        results.push({ shop: (shop as any).name, domain: recordDomain, status: 'already_imported' });
        continue;
      }

      const record = {
        tenant_id: profile.tenant_id,
        created_by: user.id,
        role: 'source' as const,
        label: (shop as any).name || validation.shop.name || recordDomain,
        shop_domain: recordDomain,
        primary_domain: validation.shop.primaryDomain?.host || null,
        shop_name: validation.shop.name || null,
        currency: validation.shop.currencyCode || null,
        access_token: token,
        api_version: API_VERSION,
        last_validated_at: new Date().toISOString(),
        validation_error: null,
      };

      const { error } = await admin.from('cloner_stores').insert(record);
      if (error) {
        results.push({ shop: (shop as any).name, domain: recordDomain, status: 'error', error: error.message });
      } else {
        existingDomains.add(recordDomain);
        results.push({ shop: (shop as any).name, domain: recordDomain, status: 'imported' });
      }
    }

    const imported = results.filter((r) => r.status === 'imported').length;
    return new Response(JSON.stringify({ imported, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
