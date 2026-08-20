// Copy active published theme from a source Shopify shop to a target shop.
// Uses REST themes + assets endpoints. The new target theme is created as
// "unpublished" so the user can preview and publish manually.
//
// Body: { source_shop_id, target_shop_id, new_theme_name? }
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { getShopifyContext, SHOPIFY_API_VERSION } from '../_shared/shopify-client.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;

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
      await new Promise((res) => setTimeout(res, 1500 * attempt));
      continue;
    }
    const text = await r.text();
    const json = text ? JSON.parse(text) : {};
    if (!r.ok) throw new Error(`shopify ${r.status}: ${text.slice(0, 400)}`);
    return json;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const auth = req.headers.get('Authorization') || '';
    const userClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const body = await req.json();
    const { source_shop_id, target_shop_id, new_theme_name } = body;
    if (!source_shop_id || !target_shop_id) throw new Error('shop ids required');

    const src = await getShopifyContext({ shopId: source_shop_id, fnName: 'shopify-clone-theme:src' });
    const tgt = await getShopifyContext({ shopId: target_shop_id, fnName: 'shopify-clone-theme:tgt' });

    // Find published theme on source
    const srcThemes = await rest(src.shopDomain, src.accessToken, 'GET', 'themes.json');
    const mainSrc = srcThemes.themes.find((t: any) => t.role === 'main');
    if (!mainSrc) throw new Error('source has no published theme');

    // Create new unpublished theme on target
    const themeName = new_theme_name || `${mainSrc.name} (from ${src.shopDomain})`;
    const created = await rest(tgt.shopDomain, tgt.accessToken, 'POST', 'themes.json', { theme: { name: themeName, role: 'unpublished' } });
    const targetThemeId = created.theme.id;

    // List all source assets
    const assetList = await rest(src.shopDomain, src.accessToken, 'GET', `themes/${mainSrc.id}/assets.json`);
    const assets: any[] = assetList.assets || [];

    let copied = 0, failed = 0;
    const errors: { key: string; error: string }[] = [];

    // Upload each asset; throttle to ~2 calls/sec via small awaits.
    for (const a of assets) {
      try {
        // Fetch the asset content
        const single = await rest(src.shopDomain, src.accessToken, 'GET', `themes/${mainSrc.id}/assets.json?asset[key]=${encodeURIComponent(a.key)}`);
        const item = single.asset;
        const payload: any = { asset: { key: item.key } };
        if (item.attachment) payload.asset.attachment = item.attachment;
        else if (item.value !== undefined) payload.asset.value = item.value;
        else if (item.src) payload.asset.src = item.src;
        else { failed++; errors.push({ key: a.key, error: 'no_body' }); continue; }
        await rest(tgt.shopDomain, tgt.accessToken, 'PUT', `themes/${targetThemeId}/assets.json`, payload);
        copied++;
        await new Promise((r) => setTimeout(r, 250));
      } catch (e) {
        failed++;
        errors.push({ key: a.key, error: e instanceof Error ? e.message : String(e) });
      }
    }

    return new Response(JSON.stringify({
      ok: true,
      source_theme: { id: mainSrc.id, name: mainSrc.name },
      target_theme: { id: targetThemeId, name: themeName, preview_url: `https://${tgt.shopDomain}/admin/themes/${targetThemeId}/editor` },
      copied, failed, errors: errors.slice(0, 20),
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('clone-theme error', msg);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
