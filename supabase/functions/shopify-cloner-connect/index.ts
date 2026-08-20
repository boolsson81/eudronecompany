// Validate Shopify Admin API token and upsert cloner store
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface Body {
  role: 'source' | 'target';
  label: string;
  shop_domain: string;          // e.g. mystore.myshopify.com
  access_token: string;
  api_version?: string;
  id?: string;                  // update existing
}

function normalizeDomain(input: string): string {
  let d = input.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '');
  // Strip path
  d = d.split('/')[0];
  return d;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const authHeader = req.headers.get('Authorization') || '';
    const userClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const body = (await req.json()) as Body;
    if (!body.role || !body.shop_domain || !body.access_token || !body.label) {
      return new Response(JSON.stringify({ error: 'missing fields' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: profile } = await admin.from('profiles').select('tenant_id').eq('user_id', user.id).maybeSingle();
    if (!profile?.tenant_id) return new Response(JSON.stringify({ error: 'no tenant' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const domain = normalizeDomain(body.shop_domain);
    const apiVersion = body.api_version || '2025-07';

    // Validate via GraphQL shop query
    const query = `query { shop { name myshopifyDomain primaryDomain { host url } currencyCode } }`;
    const res = await fetch(`https://${domain}/admin/api/${apiVersion}/graphql.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': body.access_token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.errors || !json.data?.shop) {
      return new Response(JSON.stringify({
        error: 'shopify_validation_failed',
        status: res.status,
        details: json.errors || json,
      }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const shop = json.data.shop;

    const record = {
      tenant_id: profile.tenant_id,
      created_by: user.id,
      role: body.role,
      label: body.label,
      shop_domain: domain,
      primary_domain: shop.primaryDomain?.host || null,
      shop_name: shop.name || null,
      currency: shop.currencyCode || null,
      access_token: body.access_token,
      api_version: apiVersion,
      last_validated_at: new Date().toISOString(),
      validation_error: null,
    };

    let saved;
    if (body.id) {
      const { data, error } = await admin.from('cloner_stores').update(record).eq('id', body.id).eq('tenant_id', profile.tenant_id).select().single();
      if (error) throw error;
      saved = data;
    } else {
      const { data, error } = await admin.from('cloner_stores').insert(record).select().single();
      if (error) throw error;
      saved = data;
    }

    // Strip token from response
    const { access_token: _t, ...safe } = saved;
    return new Response(JSON.stringify({ store: safe, shop }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
