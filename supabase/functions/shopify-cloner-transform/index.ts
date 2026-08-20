// AI-transform scanned items into target brand using Lovable AI or Claude.
// Uses tool calling for structured output to prevent JSON parse errors.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

interface Body {
  migration_id: string;
  item_ids?: string[];   // transform a subset; otherwise all pending
  limit?: number;
  mode?: 'ai' | 'direct_copy';        // direct_copy = no AI, 1:1 source → target
  selective_ai_for_seo?: boolean;     // in direct_copy: still call AI for SEO when missing
}

/**
 * Build a passthrough transformed_payload from source so publish() sees a non-null
 * value and uses its existing `t.field || src.field` fallbacks. No AI is invoked.
 */
function buildDirectCopyPayload(item: any) {
  const s = item.source_payload || {};
  const base: Record<string, unknown> = { direct_copy: true };
  const seoTitle = s.seo?.title || s.seoTitle || null;
  const seoDesc = s.seo?.description || s.seoDescription || null;
  if (seoTitle) base.seo_title = seoTitle;
  if (seoDesc) base.seo_description = seoDesc;
  // title/description intentionally omitted -> publish falls back to src.*
  return base;
}

function needsSeoFromAi(item: any): boolean {
  if (!['product', 'collection', 'page'].includes(item.object_type)) return false;
  const s = item.source_payload || {};
  const t = s.seo?.title || s.seoTitle;
  const d = s.seo?.description || s.seoDescription;
  return !t || !d;
}

const SEO_TOOL_SCHEMA = {
  name: 'emit_seo_only',
  description: 'Return SEO title and meta description only.',
  parameters: {
    type: 'object',
    properties: {
      seo_title: { type: 'string', description: 'SEO title under 60 chars' },
      seo_description: { type: 'string', description: 'Meta description under 160 chars' },
    },
    required: ['seo_title', 'seo_description'],
  },
};

interface Transformation {
  old_brand?: string;
  new_brand?: string;
  old_domain?: string;
  new_domain?: string;
  language?: string;
  target_market?: string;
  target_customer?: string;
  tone?: string;
  seo_strategy?: string;
  geo_strategy?: string;
}

function buildSystem(t: Transformation, type: string) {
  return [
    `You are an expert Shopify content strategist transforming a store from "${t.old_brand || 'old brand'}" (${t.old_domain || ''}) to "${t.new_brand || 'new brand'}" (${t.new_domain || ''}).`,
    `Target market: ${t.target_market || 'general'}. Target customer: ${t.target_customer || 'general'}. Language: ${t.language || 'English'}.`,
    `Tone of voice: ${t.tone || 'professional'}. SEO strategy: ${t.seo_strategy || 'long-tail commercial intent'}. AI/GEO strategy: ${t.geo_strategy || 'answer-engine optimized, structured Q&A blocks'}.`,
    `You are transforming a Shopify ${type}. Rewrite all fields fully into the new brand voice, target market and language.`,
    `Replace every mention of the old brand or old domain. Do NOT invent technical specifications you cannot infer. Keep handles unchanged unless asked. Output strictly via the provided tool.`,
  ].join(' ');
}

const TOOL_SCHEMA = {
  name: 'emit_transformed_shopify_object',
  description: 'Return the rewritten Shopify object fields and SEO metadata.',
  parameters: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      description: { type: 'string', description: 'Rich HTML product/collection description. Preserve semantic structure.' },
      seo_title: { type: 'string', description: 'SEO title under 60 chars' },
      seo_description: { type: 'string', description: 'Meta description under 160 chars' },
      tags: { type: 'array', items: { type: 'string' } },
      vendor: { type: 'string' },
      product_type: { type: 'string' },
      faq: {
        type: 'array',
        items: {
          type: 'object',
          properties: { question: { type: 'string' }, answer: { type: 'string' } },
          required: ['question', 'answer'],
        },
      },
      ai_qa_blocks: {
        type: 'array',
        description: 'AI-search optimized Q&A pairs for GEO/AEO.',
        items: {
          type: 'object',
          properties: { question: { type: 'string' }, answer: { type: 'string' } },
          required: ['question', 'answer'],
        },
      },
      compatibility_notes: { type: 'string', description: 'Optional compatibility info if inferable.' },
      internal_link_suggestions: { type: 'array', items: { type: 'string' } },
      related_product_suggestions: { type: 'array', items: { type: 'string' } },
      structured_data_suggestions: { type: 'string' },
    },
    required: ['title', 'description', 'seo_title', 'seo_description'],
  },
};

async function callLovableAI(system: string, userPrompt: string) {
  if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY missing');
  const r = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-3-flash-preview',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userPrompt },
      ],
      tools: [{ type: 'function', function: TOOL_SCHEMA }],
      tool_choice: { type: 'function', function: { name: TOOL_SCHEMA.name } },
    }),
  });
  if (r.status === 429) throw new Error('rate_limited');
  if (r.status === 402) throw new Error('credits_exhausted');
  if (!r.ok) throw new Error(`lovable_ai ${r.status}: ${await r.text()}`);
  const j = await r.json();
  const call = j.choices?.[0]?.message?.tool_calls?.[0];
  if (!call) throw new Error('no tool call');
  return JSON.parse(call.function.arguments);
}

async function callClaude(system: string, userPrompt: string) {
  if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY missing');
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      system,
      tools: [{
        name: TOOL_SCHEMA.name,
        description: TOOL_SCHEMA.description,
        input_schema: TOOL_SCHEMA.parameters,
      }],
      tool_choice: { type: 'tool', name: TOOL_SCHEMA.name },
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });
  if (!r.ok) throw new Error(`claude ${r.status}: ${await r.text()}`);
  const j = await r.json();
  const tool = j.content?.find((c: any) => c.type === 'tool_use');
  if (!tool) throw new Error('no tool use');
  return tool.input;
}

function summarizeForPrompt(item: any) {
  const p = item.source_payload;
  if (item.object_type === 'product') {
    return JSON.stringify({
      title: p.title, vendor: p.vendor, productType: p.productType,
      descriptionHtml: p.descriptionHtml, tags: p.tags,
      seo: p.seo, options: p.options,
      variants: (p.variants?.nodes || []).slice(0, 5).map((v: any) => ({ title: v.title, sku: v.sku, price: v.price })),
    });
  }
  if (item.object_type === 'collection') return JSON.stringify({ title: p.title, descriptionHtml: p.descriptionHtml, seo: p.seo });
  if (item.object_type === 'page') return JSON.stringify({ title: p.title, body: p.body });
  if (item.object_type === 'article') return JSON.stringify({ title: p.title, body: p.body, tags: p.tags, summary: p.summary });
  if (item.object_type === 'blog') return JSON.stringify({ title: p.title });
  return JSON.stringify(p).slice(0, 4000);
}

function buildDiff(original: any, transformed: any, type: string) {
  const fields: Record<string, { before: any; after: any }> = {};
  if (type === 'product' || type === 'collection') {
    if (original.title !== transformed.title) fields.title = { before: original.title, after: transformed.title };
    const afterDesc = transformed.description || transformed.body_html || '';
    if ((original.descriptionHtml || '') !== afterDesc) fields.description = { before: original.descriptionHtml, after: afterDesc };
    if ((original.seo?.title || '') !== (transformed.seo_title || '')) fields.seo_title = { before: original.seo?.title, after: transformed.seo_title };
    if ((original.seo?.description || '') !== (transformed.seo_description || '')) fields.seo_description = { before: original.seo?.description, after: transformed.seo_description };
  } else {
    if (original.title !== transformed.title) fields.title = { before: original.title, after: transformed.title };
    const afterBody = transformed.description || transformed.body_html || '';
    if ((original.body || original.bodySummary || '') !== afterBody) fields.body = { before: original.body, after: afterBody };
  }
  return fields;
}

// Inject GEO/AEO blocks (compatibility, FAQ, Q&A) into description for AI-search visibility.
function esc(s: string) { return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string)); }
function injectAiBlocks(html: string, out: any): string {
  const parts: string[] = [html || ''];
  if (out.compatibility_notes && String(out.compatibility_notes).trim()) {
    parts.push(`<section class="ai-compatibility" data-block="compatibility"><h2>Kompatibilitet</h2><div>${out.compatibility_notes}</div></section>`);
  }
  const qa = [
    ...((Array.isArray(out.ai_qa_blocks) ? out.ai_qa_blocks : []) as any[]),
    ...((Array.isArray(out.faq) ? out.faq : []) as any[]),
  ].filter((x) => x && x.question && x.answer);
  if (qa.length) {
    const items = qa.map((q) => `<div class="ai-qa-item" itemscope itemtype="https://schema.org/Question"><h3 itemprop="name">${esc(q.question)}</h3><div itemscope itemtype="https://schema.org/Answer" itemprop="acceptedAnswer"><div itemprop="text">${q.answer}</div></div></div>`).join('');
    parts.push(`<section class="ai-qa-blocks" data-block="qa"><h2>Frågor & svar</h2>${items}</section>`);
  }
  return parts.filter(Boolean).join('\n');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  try {
    const auth = req.headers.get('Authorization') || '';
    const userClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const body = (await req.json()) as Body;
    const { data: migration } = await admin.from('cloner_migrations').select('*').eq('id', body.migration_id).maybeSingle();
    if (!migration) throw new Error('migration not found');

    const transformation = (migration.transformation || {}) as Transformation & { mode?: string; selective_ai_for_seo?: boolean };
    const engine = (migration.ai_engine || 'lovable') as 'lovable' | 'claude';
    const mode: 'ai' | 'direct_copy' = (body.mode || transformation.mode || 'ai') as 'ai' | 'direct_copy';
    const selectiveSeo = body.selective_ai_for_seo ?? transformation.selective_ai_for_seo ?? false;

    let q = admin.from('cloner_migration_items').select('*').eq('migration_id', body.migration_id);
    if (body.item_ids && body.item_ids.length) q = q.in('id', body.item_ids);
    else q = q.is('transformed_payload', null).limit(body.limit || 25);
    const { data: items, error: iErr } = await q;
    if (iErr) throw iErr;

    await admin.from('cloner_migrations').update({ status: 'transforming' }).eq('id', migration.id);

    let ok = 0, fail = 0, ai_calls = 0;
    for (const item of items || []) {
      try {
        let out: any;
        let usedAi = false;

        if (mode === 'direct_copy') {
          out = buildDirectCopyPayload(item);
          // Selective AI: only fill SEO when source is missing it, and only for SEO-relevant types
          if (selectiveSeo && needsSeoFromAi(item) && (LOVABLE_API_KEY || ANTHROPIC_API_KEY)) {
            try {
              const system = `You write concise Swedish SEO metadata for Shopify ${item.object_type}s for brand "${transformation.new_brand || ''}". Return only the tool call.`;
              const userPrompt = `Source ${item.object_type} payload:\n${summarizeForPrompt(item)}`;
              const r = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
                method: 'POST',
                headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  model: 'google/gemini-2.5-flash-lite',
                  messages: [{ role: 'system', content: system }, { role: 'user', content: userPrompt }],
                  tools: [{ type: 'function', function: SEO_TOOL_SCHEMA }],
                  tool_choice: { type: 'function', function: { name: SEO_TOOL_SCHEMA.name } },
                }),
              });
              if (r.status === 402) throw new Error('credits_exhausted');
              if (r.ok) {
                const j = await r.json();
                const args = JSON.parse(j.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments || '{}');
                if (args.seo_title) out.seo_title = args.seo_title;
                if (args.seo_description) out.seo_description = args.seo_description;
                usedAi = true;
                ai_calls++;
              }
            } catch (seoErr) {
              // Soft-fail: keep direct copy without AI SEO
              await admin.from('cloner_logs').insert({
                migration_id: migration.id, tenant_id: migration.tenant_id, event: 'direct_copy_seo_skipped',
                level: 'warn', object_type: item.object_type, object_id: item.source_id,
                message: seoErr instanceof Error ? seoErr.message : String(seoErr),
              });
            }
          }
        } else {
          const system = buildSystem(transformation, item.object_type);
          const userPrompt = `Transform this Shopify ${item.object_type}:\n${summarizeForPrompt(item)}`;
          out = engine === 'claude' ? await callClaude(system, userPrompt) : await callLovableAI(system, userPrompt);
          if (!out.description && out.body_html) out.description = out.body_html;
          if (item.object_type === 'product' || item.object_type === 'collection') {
            out.description = injectAiBlocks(out.description || out.body_html || '', out);
          }
          usedAi = true;
        }

        const diff = buildDiff(item.source_payload, out, item.object_type);
        await admin.from('cloner_migration_items').update({
          transformed_payload: out,
          diff,
          // direct_copy auto-approves so publish can pick it up immediately
          approval_status: mode === 'direct_copy' ? 'approved' : 'pending',
          error: null,
        }).eq('id', item.id);
        await admin.from('cloner_logs').insert({
          migration_id: migration.id, tenant_id: migration.tenant_id,
          event: mode === 'direct_copy' ? (usedAi ? 'direct_copy_with_seo_ai' : 'direct_copy') : 'transformed',
          object_type: item.object_type, object_id: item.source_id,
        });
        ok++;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        await admin.from('cloner_migration_items').update({ error: msg }).eq('id', item.id);
        await admin.from('cloner_logs').insert({
          migration_id: migration.id, tenant_id: migration.tenant_id, event: 'transform_failed',
          level: 'error', object_type: item.object_type, object_id: item.source_id, message: msg,
        });
        fail++;
        if (msg === 'rate_limited') break;
      }
    }

    await admin.from('cloner_migrations').update({
      status: 'review',
      stats: {
        ...(migration.stats || {}),
        transformed_ok: (migration.stats?.transformed_ok || 0) + ok,
        transformed_failed: (migration.stats?.transformed_failed || 0) + fail,
        direct_copy_ai_calls: (migration.stats?.direct_copy_ai_calls || 0) + ai_calls,
      },
    }).eq('id', migration.id);

    return new Response(JSON.stringify({ ok, fail, ai_calls, mode, processed: (items || []).length }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('transform error', msg);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
