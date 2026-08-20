// Publish approved items to target Shopify store.
// Supports modes: dry_run, create_only, update_existing, skip_existing.
// Currently handles: product, collection (custom), page, blog, article, redirect.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { toShopifyBodyHtml } from '../_shared/shopify-product-feed.ts';
import { linkVariantInventoryCompliance } from '../_shared/cloner-inventory-compliance.ts';
import { linkProductToCollections } from '../_shared/cloner-collection-link.ts';
import { logDraftSafetyEvent } from '../_shared/product-draft-safety.ts';
import {
  fetchProductTemplateSuffixesRaw,
  sanitizeProductTemplateSuffix,
} from '../_shared/shopify-product-templates.ts';
import { resolveShopAccess } from '../_shared/cloner-shopify-access.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const FALLBACK_API_VERSION = '2025-10';

function normalizeDomain(input: string): string {
  return input.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '').split('/')[0];
}

interface Body {
  migration_id: string;
  item_ids?: string[];
  limit?: number;
  remap_metafields?: boolean; // run GID remap pass instead of normal publish
  activate_theme?: boolean;   // set a migrated theme as main (publish it)
  remap_theme_settings?: boolean; // rewrite settings_data.json + section templates with target GIDs/handles
  image_test?: boolean;       // dry-run image conversion: filename/alt/size/format checks, no upload
  image_test_sample?: number; // number of products to sample (default 5)
  link_collections?: boolean; // batch pass: link published products to collections
}

const PUBLISH_TYPE_ORDER: Record<string, number> = {
  collection: 0,
  product: 1,
  page: 2,
  blog: 3,
  article: 4,
  redirect: 5,
  menu: 6,
};


function rewriteRedirectTarget(
  target: string,
  sourceDomains: string[],
  targetDomain: string,
): string {
  if (!target?.trim()) return target;
  const tgt = normalizeDomain(targetDomain);
  if (!tgt) return target;

  if (target.startsWith('/') || (!target.includes('://') && !target.includes('.'))) {
    return target;
  }

  try {
    const url = new URL(target.includes('://') ? target : `https://${target}`);
    const host = normalizeDomain(url.host);
    for (const src of sourceDomains) {
      const srcNorm = normalizeDomain(src);
      if (srcNorm && host === srcNorm) {
        url.host = tgt;
        return url.toString();
      }
    }
  } catch {
    for (const src of sourceDomains) {
      const srcNorm = normalizeDomain(src);
      if (srcNorm && target.includes(srcNorm)) {
        return target.replace(new RegExp(srcNorm.replace(/\./g, '\\.'), 'gi'), tgt);
      }
    }
  }
  return target;
}

async function insertClonerLog(
  admin: ReturnType<typeof createClient>,
  migration: { id: string; tenant_id: string | null },
  event: string,
  opts: {
    object_type?: string | null;
    object_id?: string | null;
    message?: string | null;
    level?: string;
    metadata?: Record<string, unknown>;
  } = {},
) {
  await admin.from('cloner_logs').insert({
    migration_id: migration.id,
    tenant_id: migration.tenant_id,
    event,
    level: opts.level ?? 'info',
    object_type: opts.object_type ?? null,
    object_id: opts.object_id ?? null,
    message: opts.message ?? null,
    metadata: opts.metadata ?? null,
  });
}

// ---------- Image optimization (WebP + resize via weserv.nl) ----------
// Shopify Admin API accepts JPG/PNG/GIF/WebP/HEIC source uploads (not AVIF).
// Shopify CDN serves AVIF/WebP automatically to supporting browsers.
type ImageOpts = { enabled: boolean; format: 'webp' | 'jpg'; maxWidth: number; quality: number };
let activeImageOpts: ImageOpts = { enabled: false, format: 'webp', maxWidth: 2048, quality: 82 };

function slugify(s: string): string {
  return String(s || '')
    .toLowerCase()
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[åä]/g, 'a').replace(/ö/g, 'o')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    .slice(0, 60) || 'image';
}

function basenameFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const p = (u.pathname.split('/').pop() || '').split('?')[0];
    return decodeURIComponent(p);
  } catch { return ''; }
}

function extFor(format: 'webp' | 'jpg'): string {
  return format === 'jpg' ? 'jpg' : 'webp';
}

/** Build a clean Shopify-friendly filename from a base label + index + active format. */
function cleanFilename(base: string, idx: number, format?: 'webp' | 'jpg'): string {
  const slug = slugify(base);
  const n = String(idx + 1).padStart(2, '0');
  return `${slug}-${n}.${extFor(format || activeImageOpts.format)}`;
}

/** Suggest alt text when missing — uses parent label (product/collection title). */
function fallbackAlt(parentLabel: string | null | undefined, idx: number): string {
  const p = String(parentLabel || '').trim();
  if (!p) return '';
  return idx === 0 ? p : `${p} – bild ${idx + 1}`;
}

function transformImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const opts = activeImageOpts;
  if (!opts.enabled) return url;
  if (/\.svg(\?|$)/i.test(url) || url.startsWith('data:')) return url;
  const clean = url.replace(/_\d+x\d*(?=\.[a-z0-9]+($|\?))/i, '');
  const enc = encodeURIComponent(clean);
  return `https://wsrv.nl/?url=${enc}&output=${opts.format}&w=${opts.maxWidth}&we&q=${opts.quality}&n=-1`;
}

async function inspectImage(url: string): Promise<{ size: number | null; contentType: string | null; width: number | null; height: number | null; ok: boolean; error?: string }> {
  try {
    const r = await fetch(url, { method: 'GET' });
    if (!r.ok) return { size: null, contentType: null, width: null, height: null, ok: false, error: `http ${r.status}` };
    const ct = r.headers.get('content-type');
    const buf = new Uint8Array(await r.arrayBuffer());
    const dims = sniffDimensions(buf);
    return { size: buf.byteLength, contentType: ct, width: dims.width, height: dims.height, ok: true };
  } catch (e) {
    return { size: null, contentType: null, width: null, height: null, ok: false, error: (e as Error).message };
  }
}

/** Tiny dimension sniffer for PNG/JPEG/WebP/GIF. */
function sniffDimensions(b: Uint8Array): { width: number | null; height: number | null } {
  try {
    if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) {
      const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
      return { width: dv.getUint32(16), height: dv.getUint32(20) };
    }
    if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) {
      const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
      return { width: dv.getUint16(6, true), height: dv.getUint16(8, true) };
    }
    if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45) {
      const fourcc = String.fromCharCode(b[12], b[13], b[14], b[15]);
      if (fourcc === 'VP8X') return { width: 1 + (b[24] | (b[25] << 8) | (b[26] << 16)), height: 1 + (b[27] | (b[28] << 8) | (b[29] << 16)) };
      if (fourcc === 'VP8L') return { width: 1 + (((b[22] & 0x3f) << 8) | b[21]), height: 1 + (((b[24] & 0x0f) << 10) | (b[23] << 2) | ((b[22] & 0xc0) >> 6)) };
      if (fourcc === 'VP8 ') return { width: ((b[27] | (b[28] << 8)) & 0x3fff), height: ((b[29] | (b[30] << 8)) & 0x3fff) };
    }
    if (b[0] === 0xff && b[1] === 0xd8) {
      let i = 2;
      while (i < b.length - 8) {
        if (b[i] !== 0xff) break;
        const marker = b[i + 1];
        const len = (b[i + 2] << 8) | b[i + 3];
        if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
          const h = (b[i + 5] << 8) | b[i + 6];
          const w = (b[i + 7] << 8) | b[i + 8];
          return { width: w, height: h };
        }
        i += 2 + len;
      }
    }
  } catch { /* ignore */ }
  return { width: null, height: null };
}

async function rest(domain: string, token: string, apiVersion: string, method: string, path: string, body?: unknown) {
  let attempt = 0;
  while (true) {
    const r = await fetch(`https://${domain}/admin/api/${apiVersion}/${path}`, {
      method,
      headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (r.status === 429) {
      attempt++;
      if (attempt > 5) throw new Error('rate_limited');
      await new Promise((res) => setTimeout(res, 1500 * attempt));
      continue;
    }
    const text = await r.text();
    const json = text ? JSON.parse(text) : {};
    if (!r.ok) throw new Error(`shopify ${r.status}: ${text.slice(0, 500)}`);
    return json;
  }
}

async function findExistingByHandle(domain: string, token: string, ver: string, type: string, handle: string): Promise<any | null> {
  if (!handle) return null;
  try {
    if (type === 'product') {
      const j = await rest(domain, token, ver, 'GET', `products.json?handle=${encodeURIComponent(handle)}&limit=1`);
      return j.products?.[0] || null;
    }
    if (type === 'collection') {
      const j = await rest(domain, token, ver, 'GET', `custom_collections.json?handle=${encodeURIComponent(handle)}&limit=1`);
      if (j.custom_collections?.[0]) return { ...j.custom_collections[0], _kind: 'custom' };
      const s = await rest(domain, token, ver, 'GET', `smart_collections.json?handle=${encodeURIComponent(handle)}&limit=1`);
      if (s.smart_collections?.[0]) return { ...s.smart_collections[0], _kind: 'smart' };
      return null;
    }

    if (type === 'page') {
      const j = await rest(domain, token, ver, 'GET', `pages.json?handle=${encodeURIComponent(handle)}&limit=1`);
      return j.pages?.[0] || null;
    }
    if (type === 'blog') {
      const j = await rest(domain, token, ver, 'GET', `blogs.json?handle=${encodeURIComponent(handle)}&limit=1`);
      return j.blogs?.[0] || null;
    }
  } catch { /* ignore */ }
  return null;
}

function buildProductPayload(item: any, validProductTemplateSuffixes?: Set<string>) {
  const src = item.source_payload;
  const t = item.transformed_payload || {};
  const productTitle = t.title || src.title;
  const handleBase = src.handle || slugify(productTitle || 'product');
  // Build images list with stable position so variants can reference by position
  const mediaNodes = (src.media?.nodes || []).filter((m: any) => m.image?.url);
  const images = mediaNodes.map((m: any, idx: number) => ({
    src: transformImageUrl(m.image.url),
    alt: m.image.altText || fallbackAlt(productTitle, idx),
    filename: cleanFilename(handleBase, idx),
    position: idx + 1,
  }));
  // Map variant image URL -> position so we can attach via variants[].position-ref
  const imgUrlToPos = new Map<string, number>();
  images.forEach((img: any) => imgUrlToPos.set(img.src, img.position));
  // Metafields are DECOUPLED — written separately via metafieldsSet after
  // product+variants exist. Avoids 422 "Owner subtype does not match the
  // metafield definition's constraints" failures that otherwise abort the
  // entire product create when a single metafield definition is missing or
  // mismatched on the target store.
  const decoupledMetafields = [
    ...(src.metafields?.nodes || []).map((mf: any) => ({
      namespace: mf.namespace, key: mf.key, value: mf.value, type: mf.type,
    })),
    ...((t.seo_title || src.seo?.title) ? [{ namespace: 'global', key: 'title_tag', value: t.seo_title || src.seo?.title, type: 'single_line_text_field' }] : []),
    ...((t.seo_description || src.seo?.description) ? [{ namespace: 'global', key: 'description_tag', value: t.seo_description || src.seo?.description, type: 'single_line_text_field' }] : []),
    ...(t.faq ? [{ namespace: 'seo', key: 'faq_json', value: JSON.stringify(t.faq), type: 'json' }] : []),
  ];
  return {
    product: {
      title: t.title || src.title,
      body_html: toShopifyBodyHtml(t, src.descriptionHtml),
      vendor: t.vendor || src.vendor,
      product_type: t.product_type || src.productType,
      handle: src.handle,
      template_suffix: validProductTemplateSuffixes
        ? sanitizeProductTemplateSuffix(src.templateSuffix, validProductTemplateSuffixes)
        : (src.templateSuffix || undefined),
      tags: (t.tags && t.tags.length ? t.tags : src.tags || []).join(', '),
      status: 'draft', // supplier/clone safety: never ACTIVE until inventory verified + approved
      published_scope: 'null', // do NOT auto-publish to any sales channel
      options: (src.options || []).map((o: any) => ({ name: o.name, values: o.values })),
      variants: (src.variants?.nodes || []).map((v: any) => {
        const variantImgPos = v.image?.url ? imgUrlToPos.get(v.image.url) : undefined;
        return {
          option1: v.selectedOptions?.[0]?.value,
          option2: v.selectedOptions?.[1]?.value,
          option3: v.selectedOptions?.[2]?.value,
          price: v.price,
          compare_at_price: v.compareAtPrice,
          sku: v.sku,
          barcode: v.barcode,
          inventory_policy: v.inventoryPolicy?.toLowerCase() || 'deny',
          inventory_management: v.inventoryItem?.tracked === false ? null : 'shopify',
          inventory_quantity: typeof v.inventoryQuantity === 'number' ? v.inventoryQuantity : 0,
          weight: v.inventoryItem?.measurement?.weight?.value,
          weight_unit: (() => {
            const u = v.inventoryItem?.measurement?.weight?.unit?.toLowerCase();
            const map: Record<string, string> = { kilograms: 'kg', grams: 'g', pounds: 'lb', ounces: 'oz', kg: 'kg', g: 'g', lb: 'lb', oz: 'oz' };
            return u ? (map[u] || 'kg') : undefined;
          })(),
          // Marker — resolved to variant_ids in a second pass post-create
          _image_position: variantImgPos,
        };
      }),
      images,
      // metafields intentionally OMITTED — see decoupledMetafields and setProductMetafieldsDecoupled()
    },
    metafields: decoupledMetafields,
  };
}

/**
 * Decoupled product-metafield writer.
 *
 * Writes metafields via metafieldsSet AFTER the product and its variants
 * have been created/updated. Strategy:
 *   1. Try in chunks of 25 (Shopify limit).
 *   2. If a chunk returns userErrors, retry one-by-one to isolate which
 *      metafield is the offender (typically: missing definition on target,
 *      or "Owner subtype does not match" when source had a product-level
 *      definition the target lacks).
 *   3. Skip + log offenders, NEVER throw — the product itself stays
 *      successfully created/updated.
 *
 * eudroneparts.protected_fields is NEVER overwritten on target.
 */
async function setProductMetafieldsDecoupled(
  domain: string, token: string, ver: string,
  productId: string | number,
  metafields: Array<{ namespace: string; key: string; type: string; value: string }>,
): Promise<{ set: number; skipped: number; skipped_details: Array<Record<string, unknown>> }> {
  const ownerId = `gid://shopify/Product/${productId}`;
  const filtered = (metafields || [])
    .filter((mf) => !(mf?.namespace === 'eudroneparts' && mf?.key === 'protected_fields'))
    .filter((mf) => mf && mf.namespace && mf.key && mf.type && mf.value != null && mf.value !== '');

  if (!filtered.length) return { set: 0, skipped: 0, skipped_details: [] };

  const mutation = `mutation Set($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields { id key namespace }
      userErrors { field message code }
    }
  }`;

  let set = 0, skipped = 0;
  const skipped_details: Array<Record<string, unknown>> = [];

  const writeOne = async (mf: any) => {
    try {
      const d = await gql(domain, token, ver, mutation, {
        metafields: [{ ownerId, namespace: mf.namespace, key: mf.key, type: mf.type, value: mf.value }],
      });
      const errs = d.metafieldsSet?.userErrors || [];
      if (errs.length === 0) { set++; return; }
      skipped++;
      skipped_details.push({ namespace: mf.namespace, key: mf.key, type: mf.type, errors: errs.slice(0, 3) });
    } catch (err) {
      skipped++;
      skipped_details.push({ namespace: mf.namespace, key: mf.key, type: mf.type, error: String(err).slice(0, 240) });
    }
  };

  for (let i = 0; i < filtered.length; i += 25) {
    const slice = filtered.slice(i, i + 25);
    const chunk = slice.map((mf) => ({
      ownerId, namespace: mf.namespace, key: mf.key, type: mf.type, value: mf.value,
    }));
    try {
      const data = await gql(domain, token, ver, mutation, { metafields: chunk });
      const errs = data.metafieldsSet?.userErrors || [];
      if (errs.length === 0) { set += chunk.length; continue; }
      for (const mf of slice) await writeOne(mf);
    } catch {
      for (const mf of slice) await writeOne(mf);
    }
  }

  return { set, skipped, skipped_details };
}

// After product create, link variants to images by position
async function linkVariantImages(domain: string, token: string, ver: string, product: any, variantsInput: any[]) {
  const images: any[] = product.images || [];
  const variants: any[] = product.variants || [];
  if (!images.length || !variants.length) return;
  const tasks: Promise<any>[] = [];
  for (let i = 0; i < variants.length; i++) {
    const pos = variantsInput[i]?._image_position;
    if (!pos) continue;
    const img = images.find((im) => im.position === pos);
    if (!img?.id) continue;
    tasks.push(rest(domain, token, ver, 'PUT', `variants/${variants[i].id}.json`, {
      variant: { id: variants[i].id, image_id: img.id },
    }).catch(() => null));
  }
  await Promise.all(tasks);
}

async function applyPostCreateVariantHooks(
  admin: ReturnType<typeof createClient>,
  migration: { id: string; tenant_id: string | null },
  item: { source_id: string; source_payload: unknown },
  createdProduct: { variants?: unknown[]; images?: unknown[] },
  variantsInput: unknown[],
  target: { shop_domain: string; access_token: string; api_version: string },
) {
  await linkVariantImages(target.shop_domain, target.access_token, target.api_version, createdProduct, variantsInput);
  const compliance = await linkVariantInventoryCompliance(
    createdProduct,
    item.source_payload as { variants?: { nodes?: unknown[] } },
    (query, variables) => gql(target.shop_domain, target.access_token, target.api_version, query, variables ?? {}),
    (msg) => console.log(msg),
  );
  await admin.from('cloner_logs').insert({
    migration_id: migration.id,
    tenant_id: migration.tenant_id,
    event: 'inventory_compliance',
    object_type: 'product',
    object_id: item.source_id,
    message: `matched=${compliance.matched} updated=${compliance.updated} unmatched=${compliance.unmatched.join(',') || 'none'}`,
  });
}

function seoMetafields(t: any, src: any) {
  const seoTitle = t.seo_title || src?.seo?.title;
  const seoDesc = t.seo_description || src?.seo?.description;
  return [
    ...((src?.metafields?.nodes || []) as any[]).map((mf: any) => ({
      namespace: mf.namespace, key: mf.key, value: mf.value, type: mf.type,
    })),
    ...(seoTitle ? [{ namespace: 'global', key: 'title_tag', value: seoTitle, type: 'single_line_text_field' }] : []),
    ...(seoDesc ? [{ namespace: 'global', key: 'description_tag', value: seoDesc, type: 'single_line_text_field' }] : []),
    ...(t.faq ? [{ namespace: 'seo', key: 'faq_json', value: JSON.stringify(t.faq), type: 'json' }] : []),
  ];
}

function isSmartCollection(src: any, transformed?: any): boolean {
  const tRules = transformed?.ruleSet?.rules;
  if (Array.isArray(tRules) && tRules.length > 0) return true;
  return Array.isArray(src?.ruleSet?.rules) && src.ruleSet.rules.length > 0;
}

function buildCollectionPayload(item: any) {
  const src = item.source_payload;
  const t = item.transformed_payload || {};
  const ruleSet = t.ruleSet?.rules?.length ? t.ruleSet : src.ruleSet;
  const smartRules = ruleSet?.rules;
  if (Array.isArray(smartRules) && smartRules.length > 0) {
    return {
      smart_collection: {
        title: t.title || src.title,
        body_html: toShopifyBodyHtml(t, src.descriptionHtml),
        handle: src.handle,
        template_suffix: src.templateSuffix || undefined,
        sort_order: (src.sortOrder || 'best-selling').toLowerCase().replace(/_/g, '-'),
        published: false,
        rules: smartRules.map((r: any) => {
          const out: Record<string, unknown> = {
            column: String(r.column || '').toLowerCase(),
            relation: String(r.relation || '').toLowerCase(),
            condition: r.condition,
          };
          const defId = r.condition_object_id || r.metafield_definition_id || r.conditionObjectId;
          if (defId) out.condition_object_id = defId;
          return out;
        }),
        disjunctive: !!(ruleSet.appliedDisjunctively ?? src.ruleSet?.appliedDisjunctively),
        image: src.image?.url ? { src: transformImageUrl(src.image.url), alt: src.image.altText || null } : undefined,
        metafields: seoMetafields(t, src),
      },
    };
  }
  return {
    custom_collection: {
      title: t.title || src.title,
      body_html: toShopifyBodyHtml(t, src.descriptionHtml),
      handle: src.handle,
      template_suffix: src.templateSuffix || undefined,
      published: false,
      image: src.image?.url ? { src: transformImageUrl(src.image.url), alt: src.image.altText || null } : undefined,
      metafields: seoMetafields(t, src),
    },
  };
}

function buildPagePayload(item: any) {
  const src = item.source_payload;
  const t = item.transformed_payload || {};
  return {
    page: {
      title: t.title || src.title,
      body_html: toShopifyBodyHtml(t, src.body),
      handle: src.handle,
      template_suffix: src.templateSuffix || undefined,
      published: false,
      metafields: seoMetafields(t, src),
    },
  };
}

function buildBlogPayload(item: any) {
  const src = item.source_payload;
  const t = item.transformed_payload || {};
  return {
    blog: {
      title: t.title || src.title,
      handle: src.handle,
      template_suffix: src.templateSuffix || undefined,
      commentable: src.commentPolicy ? String(src.commentPolicy).toLowerCase() : undefined,
      metafields: seoMetafields(t, src),
    },
  };
}

function buildArticlePayload(item: any, targetBlogId: number) {
  const src = item.source_payload;
  const t = item.transformed_payload || {};
  return {
    article: {
      title: t.title || src.title,
      body_html: toShopifyBodyHtml(t, src.body),
      summary_html: src.summary || '',
      tags: (t.tags && t.tags.length ? t.tags : src.tags || []).join(', '),
      handle: src.handle,
      author: src.author?.name || undefined,
      template_suffix: src.templateSuffix || undefined,
      published: false,
      blog_id: targetBlogId,
      image: src.image?.url ? { src: transformImageUrl(src.image.url), alt: src.image.altText || null } : undefined,
      metafields: seoMetafields(t, src),
    },
  };
}

function buildRedirectPayload(item: any, sourceDomains: string[], targetDomain: string) {
  const src = item.source_payload;
  const rewritten = rewriteRedirectTarget(src.target, sourceDomains, targetDomain);
  return { redirect: { path: src.path, target: rewritten } };
}


async function gql(domain: string, token: string, ver: string, query: string, variables: Record<string, unknown> = {}) {
  const r = await fetch(`https://${domain}/admin/api/${ver}/graphql.json`, {
    method: 'POST',
    headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const j = await r.json();
  if (!r.ok || j.errors) throw new Error(`graphql ${r.status}: ${JSON.stringify(j.errors || j).slice(0, 500)}`);
  return j.data;
}

// Publish menu via GraphQL menuCreate. Items keep their source URLs/handles.
async function publishMenu(domain: string, token: string, ver: string, item: any) {
  const src = item.source_payload;
  const t = item.transformed_payload || {};
  const title = t.title || src.title;
  const handle = src.handle;
  const items = (src.items || []).map((mi: any) => ({
    title: mi.title, type: mi.type || 'HTTP', url: mi.url, tags: mi.tags || [],
  }));
  const mutation = `mutation MenuCreate($title: String!, $handle: String!, $items: [MenuItemCreateInput!]!) {
    menuCreate(title: $title, handle: $handle, items: $items) {
      menu { id handle title }
      userErrors { field message }
    }
  }`;
  const data = await gql(domain, token, ver, mutation, { title, handle, items });
  const errs = data.menuCreate.userErrors;
  if (errs?.length) throw new Error(`menuCreate: ${JSON.stringify(errs)}`);
  return data.menuCreate.menu;
}

// Publish file (image/video/generic) by URL via fileCreate.
async function publishFile(domain: string, token: string, ver: string, item: any) {
  const src = item.source_payload;
  const rawUrl = src.image?.url || src.url || src.sources?.[0]?.url;
  if (!rawUrl) throw new Error('no source URL');
  const contentType = src.__typename === 'MediaImage' ? 'IMAGE' : src.__typename === 'Video' ? 'VIDEO' : 'FILE';
  // Only transform images; never video/generic
  const url = contentType === 'IMAGE' ? (transformImageUrl(rawUrl) || rawUrl) : rawUrl;
  const alt = src.alt || src.image?.altText || null;
  const mutation = `mutation FileCreate($files: [FileCreateInput!]!) {
    fileCreate(files: $files) { files { id alt fileStatus } userErrors { field message } }
  }`;
  const data = await gql(domain, token, ver, mutation, { files: [{ originalSource: url, contentType, alt }] });
  const errs = data.fileCreate.userErrors;
  if (errs?.length) throw new Error(`fileCreate: ${JSON.stringify(errs)}`);
  return data.fileCreate.files[0];
}

// ---------- New publishers ----------

async function publishCustomer(domain: string, token: string, ver: string, item: any) {
  const s = item.source_payload;
  const payload = {
    customer: {
      first_name: s.firstName, last_name: s.lastName, email: s.email, phone: s.phone,
      note: s.note, tags: (s.tags || []).join(', '), tax_exempt: !!s.taxExempt,
      verified_email: !!s.verifiedEmail,
      addresses: (s.addresses || []).map((a: any) => ({
        first_name: a.firstName, last_name: a.lastName, company: a.company,
        address1: a.address1, address2: a.address2, city: a.city, province: a.province,
        country: a.country, zip: a.zip, phone: a.phone,
      })),
      metafields: (s.metafields?.nodes || []).map((mf: any) => ({
        namespace: mf.namespace, key: mf.key, value: mf.value, type: mf.type,
      })),
    },
  };
  const j = await rest(domain, token, ver, 'POST', 'customers.json', payload);
  return { id: String(j.customer.id), handle: null };
}

async function publishSegment(domain: string, token: string, ver: string, item: any) {
  const s = item.source_payload;
  const mutation = `mutation SegmentCreate($name: String!, $query: String!) {
    segmentCreate(name: $name, query: $query) { segment { id name } userErrors { field message } }
  }`;
  const data = await gql(domain, token, ver, mutation, { name: s.name, query: s.query });
  const errs = data.segmentCreate.userErrors;
  if (errs?.length) throw new Error(`segmentCreate: ${JSON.stringify(errs)}`);
  return { id: data.segmentCreate.segment.id, handle: null };
}

async function publishDiscountCode(domain: string, token: string, ver: string, item: any) {
  const s = item.source_payload;
  const d = s.codeDiscount;
  if (d?.__typename !== 'DiscountCodeBasic') throw new Error(`unsupported discount type ${d?.__typename}`);
  const code = d.codes?.nodes?.[0]?.code;
  if (!code) throw new Error('missing code');
  const isPct = d.customerGets?.value?.__typename === 'DiscountPercentage';
  const customerGets: any = {
    items: { all: true },
    value: isPct
      ? { percentage: Number(d.customerGets.value.percentage) }
      : { discountAmount: { amount: d.customerGets.value.amount.amount, appliesOnEachItem: false } },
  };
  const input: any = {
    title: d.title, code, startsAt: d.startsAt, endsAt: d.endsAt,
    customerSelection: { all: true }, customerGets,
    appliesOncePerCustomer: !!d.appliesOncePerCustomer,
    usageLimit: d.usageLimit ?? null,
  };
  const mutation = `mutation Create($input: DiscountCodeBasicInput!) {
    discountCodeBasicCreate(basicCodeDiscount: $input) {
      codeDiscountNode { id }
      userErrors { field message }
    }
  }`;
  const data = await gql(domain, token, ver, mutation, { input });
  const errs = data.discountCodeBasicCreate.userErrors;
  if (errs?.length) throw new Error(`discountCodeBasicCreate: ${JSON.stringify(errs)}`);
  return { id: data.discountCodeBasicCreate.codeDiscountNode.id, handle: code };
}

async function publishAutomaticDiscount(domain: string, token: string, ver: string, item: any) {
  const s = item.source_payload;
  const d = s.automaticDiscount;
  if (d?.__typename !== 'DiscountAutomaticBasic') throw new Error(`unsupported auto discount ${d?.__typename}`);
  const isPct = d.customerGets?.value?.__typename === 'DiscountPercentage';
  const input: any = {
    title: d.title, startsAt: d.startsAt, endsAt: d.endsAt,
    customerGets: {
      items: { all: true },
      value: isPct
        ? { percentage: Number(d.customerGets.value.percentage) }
        : { discountAmount: { amount: d.customerGets.value.amount.amount, appliesOnEachItem: false } },
    },
  };
  const mutation = `mutation Create($input: DiscountAutomaticBasicInput!) {
    discountAutomaticBasicCreate(automaticBasicDiscount: $input) {
      automaticDiscountNode { id }
      userErrors { field message }
    }
  }`;
  const data = await gql(domain, token, ver, mutation, { input });
  const errs = data.discountAutomaticBasicCreate.userErrors;
  if (errs?.length) throw new Error(`discountAutomaticBasicCreate: ${JSON.stringify(errs)}`);
  return { id: data.discountAutomaticBasicCreate.automaticDiscountNode.id, handle: null };
}

async function publishMetaobjectDefinition(domain: string, token: string, ver: string, item: any) {
  const s = item.source_payload;
  const input = {
    type: s.type, name: s.name, description: s.description, displayNameKey: s.displayNameKey,
    fieldDefinitions: (s.fieldDefinitions || []).map((f: any) => ({
      key: f.key, name: f.name, description: f.description, required: !!f.required,
      type: f.type?.name,
      validations: (f.validations || []).map((v: any) => ({ name: v.name, value: v.value })),
    })),
  };
  const mutation = `mutation Create($definition: MetaobjectDefinitionCreateInput!) {
    metaobjectDefinitionCreate(definition: $definition) { metaobjectDefinition { id type } userErrors { field message } }
  }`;
  const data = await gql(domain, token, ver, mutation, { definition: input });
  const errs = data.metaobjectDefinitionCreate.userErrors;
  if (errs?.length) throw new Error(`metaobjectDefinitionCreate: ${JSON.stringify(errs)}`);
  return { id: data.metaobjectDefinitionCreate.metaobjectDefinition.id, handle: s.type };
}

async function publishMetaobject(domain: string, token: string, ver: string, item: any) {
  const s = item.source_payload;
  const input = {
    type: s.type, handle: s.handle,
    fields: (s.fields || []).map((f: any) => ({ key: f.key, value: f.value })),
  };
  const mutation = `mutation Create($metaobject: MetaobjectCreateInput!) {
    metaobjectCreate(metaobject: $metaobject) { metaobject { id handle } userErrors { field message } }
  }`;
  const data = await gql(domain, token, ver, mutation, { metaobject: input });
  const errs = data.metaobjectCreate.userErrors;
  if (errs?.length) throw new Error(`metaobjectCreate: ${JSON.stringify(errs)}`);
  return { id: data.metaobjectCreate.metaobject.id, handle: data.metaobjectCreate.metaobject.handle };
}

async function publishMetafieldDefinition(domain: string, token: string, ver: string, item: any) {
  const s = item.source_payload;
  const input = {
    name: s.name, namespace: s.namespace, key: s.key, description: s.description,
    ownerType: s.ownerType, type: s.type?.name,
    validations: (s.validations || []).map((v: any) => ({ name: v.name, value: v.value })),
  };
  const mutation = `mutation Create($definition: MetafieldDefinitionInput!) {
    metafieldDefinitionCreate(definition: $definition) { createdDefinition { id } userErrors { field message } }
  }`;
  const data = await gql(domain, token, ver, mutation, { definition: input });
  const errs = data.metafieldDefinitionCreate.userErrors;
  if (errs?.length) throw new Error(`metafieldDefinitionCreate: ${JSON.stringify(errs)}`);
  return { id: data.metafieldDefinitionCreate.createdDefinition.id, handle: `${s.ownerType}:${s.namespace}.${s.key}` };
}

async function publishShopPolicy(domain: string, token: string, ver: string, item: any) {
  const s = item.source_payload;
  // REST: PUT /policies.json with body
  const polType = String(s.type || '').toLowerCase(); // e.g. REFUND_POLICY → refund_policy
  const j = await rest(domain, token, ver, 'PUT', `policies/${polType}.json`, {
    policy: { body: s.body, title: s.title },
  });
  return { id: String(j.policy?.id || s.id), handle: polType };
}

async function publishLocale(domain: string, token: string, ver: string, item: any) {
  const s = item.source_payload;
  const mutation = `mutation Enable($locale: String!) {
    shopLocaleEnable(locale: $locale) { shopLocale { locale name primary published } userErrors { field message } }
  }`;
  const data = await gql(domain, token, ver, mutation, { locale: s.locale });
  const errs = data.shopLocaleEnable.userErrors;
  if (errs?.length && !errs.some((e: any) => /already/i.test(e.message))) {
    throw new Error(`shopLocaleEnable: ${JSON.stringify(errs)}`);
  }
  return { id: `locale:${s.locale}`, handle: s.locale };
}

async function publishTheme(domain: string, token: string, ver: string, item: any) {
  const s = item.source_payload;
  const themeMeta = s.theme || {};
  const assets: any[] = s.assets || [];
  // Create unpublished theme (don't auto-publish; user can activate manually)
  const created: any = await rest(domain, token, ver, 'POST', 'themes.json', {
    theme: { name: themeMeta.name || `Migrated theme ${Date.now()}`, role: 'unpublished' },
  });
  const newId = created.theme?.id;
  if (!newId) throw new Error('theme create returned no id');

  let failed = 0;
  for (const a of assets) {
    const payload: any = { key: a.key };
    if (a.attachment) payload.attachment = a.attachment;
    else if (typeof a.value === 'string') payload.value = a.value;
    else if (a.src) payload.src = a.src;
    else continue;
    try {
      await rest(domain, token, ver, 'PUT', `themes/${newId}/assets.json`, { asset: payload });
      await new Promise((r) => setTimeout(r, 80));
    } catch (e) {
      failed++;
      // continue with remaining assets
    }
  }
  return { id: `theme:${newId}`, handle: created.theme.name, assets_failed: failed };
}

// ---------- Translations ----------
// Maps source resourceType -> table prefix used for cloner_object_mappings.object_type
const TRANSLATION_TYPE_TO_OBJECT: Record<string, string> = {
  PRODUCT: 'product',
  COLLECTION: 'collection',
  ONLINE_STORE_PAGE: 'page',
  ONLINE_STORE_BLOG: 'blog',
  ONLINE_STORE_ARTICLE: 'article',
  SHOP_POLICY: 'shopPolicy',
};

// Convert a target REST id + resourceType to a GraphQL GID
function buildTargetGid(resourceType: string, targetId: string | number): string | null {
  if (!targetId) return null;
  // If already a GID (e.g. shopPolicy stored as gid://) pass through
  if (String(targetId).startsWith('gid://')) return String(targetId);
  const map: Record<string, string> = {
    PRODUCT: 'Product',
    COLLECTION: 'Collection',
    ONLINE_STORE_PAGE: 'OnlineStorePage',
    ONLINE_STORE_BLOG: 'OnlineStoreBlog',
    ONLINE_STORE_ARTICLE: 'OnlineStoreArticle',
    SHOP_POLICY: 'ShopPolicy',
  };
  const t = map[resourceType];
  if (!t) return null;
  return `gid://shopify/${t}/${targetId}`;
}

async function publishTranslation(admin: any, migrationId: string, domain: string, token: string, ver: string, item: any) {
  const s = item.source_payload;
  const objType = TRANSLATION_TYPE_TO_OBJECT[s.resourceType];
  if (!objType) throw new Error(`translation: unsupported resourceType ${s.resourceType}`);
  // Find target via mappings using source resourceId
  const { data: mapping } = await admin
    .from('cloner_object_mappings')
    .select('target_id')
    .eq('migration_id', migrationId)
    .eq('object_type', objType)
    .eq('source_id', s.resourceId)
    .maybeSingle();
  if (!mapping?.target_id) throw new Error(`translation: no target mapping for ${s.resourceType} ${s.resourceId}`);
  const targetGid = buildTargetGid(s.resourceType, mapping.target_id);
  if (!targetGid) throw new Error(`translation: cannot build GID for ${s.resourceType}`);

  // We need translatableContent digests from target for translationsRegister
  const digestQuery = `query D($id: ID!) {
    translatableResource(resourceId: $id) {
      translatableContent { key digest locale }
    }
  }`;
  const dData: any = await gql(domain, token, ver, digestQuery, { id: targetGid });
  const digestByKey = new Map<string, string>();
  for (const c of (dData.translatableResource?.translatableContent || [])) {
    if (c.key && c.digest) digestByKey.set(c.key, c.digest);
  }

  const translations = (s.translations || [])
    .filter((t: any) => t.value && digestByKey.has(t.key))
    .map((t: any) => ({
      key: t.key, value: t.value, locale: t.locale,
      translatableContentDigest: digestByKey.get(t.key),
    }));
  if (!translations.length) return { id: `translation:${s.resourceType}:${s.locale}:${s.resourceId}`, handle: null, skipped: true };

  const mutation = `mutation Reg($resourceId: ID!, $translations: [TranslationInput!]!) {
    translationsRegister(resourceId: $resourceId, translations: $translations) {
      translations { key value locale }
      userErrors { field message }
    }
  }`;
  const data = await gql(domain, token, ver, mutation, { resourceId: targetGid, translations });
  const errs = data.translationsRegister.userErrors;
  if (errs?.length) throw new Error(`translationsRegister: ${JSON.stringify(errs)}`);
  return { id: `translation:${s.resourceType}:${s.locale}:${s.resourceId}`, handle: `${s.resourceType}:${s.locale}` };
}

// ---------- Metafield reference GID remap ----------
// Reference metafield types whose value contains a GID pointing at source store
const REFERENCE_TYPES = new Set([
  'file_reference', 'list.file_reference',
  'product_reference', 'list.product_reference',
  'variant_reference', 'list.variant_reference',
  'collection_reference', 'list.collection_reference',
  'page_reference', 'list.page_reference',
  'metaobject_reference', 'list.metaobject_reference',
]);

// Map source object_type from GID host
function objectTypeFromGid(gid: string): string | null {
  const m = gid.match(/^gid:\/\/shopify\/(\w+)\/(\d+|\S+)/);
  if (!m) return null;
  const host = m[1];
  const tbl: Record<string, string> = {
    Product: 'product', ProductVariant: 'variant', Collection: 'collection',
    OnlineStorePage: 'page', MediaImage: 'file', GenericFile: 'file', Video: 'file',
    Metaobject: 'metaobject',
  };
  return tbl[host] || null;
}

async function remapValueGids(admin: any, migrationId: string, value: string, type: string): Promise<string | null> {
  try {
    const isList = type.startsWith('list.');
    const gids: string[] = isList ? JSON.parse(value) : [value];
    const remapped: string[] = [];
    let changed = false;
    for (const gid of gids) {
      if (!gid?.startsWith?.('gid://')) { remapped.push(gid); continue; }
      const objType = objectTypeFromGid(gid);
      if (!objType) { remapped.push(gid); continue; }
      const { data } = await admin
        .from('cloner_object_mappings')
        .select('target_id')
        .eq('migration_id', migrationId)
        .eq('object_type', objType)
        .eq('source_id', gid)
        .maybeSingle();
      if (data?.target_id) {
        // Reconstruct target GID using the same host as source
        const host = gid.split('/')[3];
        const newGid = String(data.target_id).startsWith('gid://')
          ? String(data.target_id)
          : `gid://shopify/${host}/${data.target_id}`;
        if (newGid !== gid) changed = true;
        remapped.push(newGid);
      } else {
        remapped.push(gid);
      }
    }
    if (!changed) return null;
    return isList ? JSON.stringify(remapped) : remapped[0];
  } catch {
    return null;
  }
}

async function remapMetafieldsForItem(admin: any, migrationId: string, domain: string, token: string, ver: string, item: any) {
  const targetGidHostMap: Record<string, string> = {
    product: 'Product', collection: 'Collection', page: 'OnlineStorePage',
    article: 'OnlineStoreArticle', blog: 'OnlineStoreBlog', metaobject: 'Metaobject',
    customer: 'Customer',
  };
  const host = targetGidHostMap[item.object_type];
  if (!host || !item.target_id) return { remapped: 0 };
  const ownerGid = String(item.target_id).startsWith('gid://')
    ? String(item.target_id)
    : `gid://shopify/${host}/${item.target_id}`;

  const srcMetafields: any[] = item.source_payload?.metafields?.nodes || [];
  const toSet: any[] = [];
  for (const mf of srcMetafields) {
    if (!REFERENCE_TYPES.has(mf.type)) continue;
    const newValue = await remapValueGids(admin, migrationId, mf.value, mf.type);
    if (newValue == null) continue;
    toSet.push({ ownerId: ownerGid, namespace: mf.namespace, key: mf.key, type: mf.type, value: newValue });
  }
  if (!toSet.length) return { remapped: 0 };
  const mutation = `mutation Set($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) { metafields { id } userErrors { field message } }
  }`;
  // Shopify allows up to 25 per call
  let done = 0;
  for (let i = 0; i < toSet.length; i += 25) {
    const chunk = toSet.slice(i, i + 25);
    const data = await gql(domain, token, ver, mutation, { metafields: chunk });
    const errs = data.metafieldsSet.userErrors;
    if (errs?.length) throw new Error(`metafieldsSet: ${JSON.stringify(errs).slice(0, 300)}`);
    done += chunk.length;
  }
  return { remapped: done };
}


// ---------- Shipping zones / Gift cards / Checkout branding ----------

async function publishGiftCard(domain: string, token: string, ver: string, item: any) {
  const s = item.source_payload;
  // initial_value is the original value; remaining balance cannot be set on create.
  const payload = {
    gift_card: {
      initial_value: s.initial_value ?? s.balance ?? '0.00',
      code: s.code || undefined, // if undefined Shopify generates one
      note: s.note || undefined,
      expires_on: s.expires_on || undefined,
      template_suffix: s.template_suffix || undefined,
      currency: s.currency || undefined,
    },
  };
  try {
    const j = await rest(domain, token, ver, 'POST', 'gift_cards.json', payload);
    return { id: String(j.gift_card.id), handle: j.gift_card.code || j.gift_card.masked_code || String(j.gift_card.id) };
  } catch (e) {
    // duplicate code → try without code
    if (s.code) {
      delete payload.gift_card.code;
      const j = await rest(domain, token, ver, 'POST', 'gift_cards.json', payload);
      return { id: String(j.gift_card.id), handle: j.gift_card.code || String(j.gift_card.id) };
    }
    throw e;
  }
}

// Shipping zones cannot be created directly via REST in current API.
// Best-effort: attempt deliveryProfileUpdate on the default profile to add zone+rates.
// Falls back to a logged "scanned-only" entry when the API rejects writes.
async function publishShippingZone(admin: any, migration: any, domain: string, token: string, ver: string, item: any) {
  const s = item.source_payload;
  // Find default delivery profile
  const profQ = `query { deliveryProfiles(first: 5) { nodes { id name default } } }`;
  const profData: any = await gql(domain, token, ver, profQ);
  const profile = (profData.deliveryProfiles?.nodes || []).find((p: any) => p.default) || profData.deliveryProfiles?.nodes?.[0];
  if (!profile?.id) throw new Error('no delivery profile on target');

  // Locations on target (required for locationGroupsToUpdate). Pick first.
  const locQ = `query { locations(first: 5) { nodes { id name } } }`;
  const locData: any = await gql(domain, token, ver, locQ);
  const firstLoc = locData.locations?.nodes?.[0];
  if (!firstLoc?.id) throw new Error('no location on target');

  const countries = (s.countries || []).map((c: any) => ({
    code: { countryCode: c.code, restOfWorld: c.code === 'Rest of World' || !c.code },
    provinces: (c.provinces || []).map((p: any) => ({ code: p.code })),
  })).filter((c: any) => c.code.countryCode && c.code.countryCode !== 'Rest of World');

  const priceRates = (s.price_based_shipping_rates || []).map((r: any) => ({
    name: r.name,
    price: { amount: r.price, currencyCode: s.currency || 'USD' },
    conditions: [
      ...(r.min_order_subtotal != null ? [{ conditionCriteria: { amount: parseFloat(r.min_order_subtotal), currencyCode: s.currency || 'USD' }, field: 'TOTAL_PRICE', operator: 'GREATER_THAN_OR_EQUAL_TO' }] : []),
      ...(r.max_order_subtotal != null ? [{ conditionCriteria: { amount: parseFloat(r.max_order_subtotal), currencyCode: s.currency || 'USD' }, field: 'TOTAL_PRICE', operator: 'LESS_THAN_OR_EQUAL_TO' }] : []),
    ],
  }));
  const weightRates = (s.weight_based_shipping_rates || []).map((r: any) => ({
    name: r.name,
    price: { amount: r.price, currencyCode: s.currency || 'USD' },
    conditions: [
      ...(r.weight_low != null ? [{ conditionCriteria: { unit: 'KILOGRAMS', value: parseFloat(r.weight_low) }, field: 'TOTAL_WEIGHT', operator: 'GREATER_THAN_OR_EQUAL_TO' }] : []),
      ...(r.weight_high != null ? [{ conditionCriteria: { unit: 'KILOGRAMS', value: parseFloat(r.weight_high) }, field: 'TOTAL_WEIGHT', operator: 'LESS_THAN_OR_EQUAL_TO' }] : []),
    ],
  }));

  const zone = {
    name: s.name,
    countries,
    methodDefinitionsToCreate: [...priceRates, ...weightRates].map((m: any) => ({
      name: m.name,
      active: true,
      rateDefinition: { price: m.price },
      conditions: m.conditions,
    })),
  };

  const mutation = `mutation Update($id: ID!, $profile: DeliveryProfileInput!) {
    deliveryProfileUpdate(id: $id, profile: $profile) {
      profile { id }
      userErrors { field message }
    }
  }`;
  const input = {
    locationGroupsToUpdate: [{
      id: profile.id,
      zonesToCreate: [zone],
    }],
  };
  try {
    const data: any = await gql(domain, token, ver, mutation, { id: profile.id, profile: input });
    const errs = data.deliveryProfileUpdate.userErrors;
    if (errs?.length) throw new Error(`deliveryProfileUpdate: ${JSON.stringify(errs).slice(0, 400)}`);
    return { id: `shipping_zone:${profile.id}:${s.name}`, handle: s.name };
  } catch (e) {
    // Log + return as best-effort scanned data — manual setup required
    await admin.from('cloner_logs').insert({
      migration_id: migration.id, tenant_id: migration.tenant_id,
      event: 'shipping_zone_manual_required', level: 'warn',
      object_type: 'shippingZone', object_id: item.source_id,
      message: `Zone "${s.name}" must be created manually: ${(e as Error).message}`,
    });
    return { id: `shipping_zone:manual:${s.id}`, handle: s.name, manual: true };
  }
}

async function publishCheckoutBranding(domain: string, token: string, ver: string, item: any) {
  const s = item.source_payload;
  const branding = s.branding;
  if (!branding) throw new Error('no branding payload');
  // Target profile: pick published profile, else first
  const profQ = `query { checkoutProfiles(first: 20) { nodes { id name isPublished } } }`;
  const profData: any = await gql(domain, token, ver, profQ);
  const profiles = profData.checkoutProfiles?.nodes || [];
  const targetProfile = profiles.find((p: any) => p.isPublished) || profiles[0];
  if (!targetProfile?.id) throw new Error('no checkout profile on target');

  // checkoutBrandingUpsert accepts a designSystem + customizations input.
  // We pass the scanned subset through; Shopify ignores unknown fields silently.
  const input: any = {};
  if (branding.designSystem) input.designSystem = branding.designSystem;
  if (branding.customizations) input.customizations = branding.customizations;

  const mutation = `mutation Upsert($id: ID!, $input: CheckoutBrandingInput!) {
    checkoutBrandingUpsert(checkoutProfileId: $id, checkoutBrandingInput: $input) {
      checkoutBranding { designSystem { colors { global { brand } } } }
      userErrors { field message }
    }
  }`;
  const data: any = await gql(domain, token, ver, mutation, { id: targetProfile.id, input });
  const errs = data.checkoutBrandingUpsert.userErrors;
  if (errs?.length) throw new Error(`checkoutBrandingUpsert: ${JSON.stringify(errs).slice(0, 400)}`);
  return { id: `checkout_branding:${targetProfile.id}`, handle: targetProfile.name };
}


Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  try {
    const auth = req.headers.get('Authorization') || '';
    const token = auth.replace(/^Bearer\s+/i, '');
    const isServiceRole = token && token === SERVICE_ROLE;
    if (!isServiceRole) {
      const userClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
      const { data: { user } } = await userClient.auth.getUser();
      if (!user) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const body = (await req.json()) as Body;
    const { data: migration } = await admin.from('cloner_migrations').select('*').eq('id', body.migration_id).maybeSingle();
    if (!migration) throw new Error('migration not found');
    const { data: target } = await admin.from('cloner_stores').select('*').eq('id', migration.target_store_id).maybeSingle();
    if (!target) throw new Error('target store not found');
    const { data: source } = await admin.from('cloner_stores').select('*').eq('id', migration.source_store_id).maybeSingle();
    const sourceDomains = [
      source?.primary_domain,
      source?.shop_domain,
      (migration.transformation as Record<string, string> | null)?.old_domain,
    ].filter(Boolean) as string[];
    const targetPublicDomain = target.primary_domain || target.shop_domain || '';

    const mode = migration.mode as string;
    const dryRun = mode === 'dry_run';

    // Configure image optimization from migration.transformation.imageOptimization
    const imgCfg = (migration.transformation as any)?.imageOptimization || {};
    activeImageOpts = {
      enabled: !!imgCfg.enabled,
      format: imgCfg.format === 'jpg' ? 'jpg' : 'webp',
      maxWidth: Math.max(256, Math.min(4096, Number(imgCfg.maxWidth) || 2048)),
      quality: Math.max(40, Math.min(95, Number(imgCfg.quality) || 82)),
    };

    // ----- Image conversion DRY-RUN: validate filename/alt/size/format, no upload -----
    if (body.image_test) {
      // Force image opts ON for the test so the user sees the converted URL/format
      if (!activeImageOpts.enabled) activeImageOpts = { ...activeImageOpts, enabled: true };
      const sample = Math.max(1, Math.min(20, Number(body.image_test_sample) || 5));
      let q = admin.from('cloner_migration_items').select('*')
        .eq('migration_id', body.migration_id)
        .eq('object_type', 'product');
      if (body.item_ids?.length) q = q.in('id', body.item_ids);
      else q = q.limit(sample);
      const { data: products } = await q;
      const results: any[] = [];
      const summary = { products: 0, images: 0, ok: 0, warnings: 0, errors: 0, savedBytes: 0, originalBytes: 0 };

      for (const p of products || []) {
        summary.products++;
        const src = p.source_payload || {};
        const title = (p.transformed_payload?.title || src.title || '').toString();
        const handleBase = src.handle || slugify(title || 'product');
        const media = (src.media?.nodes || []).filter((m: any) => m.image?.url).slice(0, 3);
        const productImages: any[] = [];
        for (let i = 0; i < media.length; i++) {
          summary.images++;
          const origUrl = media[i].image.url as string;
          const origAlt = (media[i].image.altText || '').toString();
          const newUrl = transformImageUrl(origUrl) || origUrl;
          const newFilename = cleanFilename(handleBase, i);
          const suggestedAlt = origAlt.trim() || fallbackAlt(title, i);

          const [origInfo, newInfo] = await Promise.all([
            inspectImage(origUrl),
            newUrl === origUrl ? Promise.resolve({ size: null, contentType: null, width: null, height: null, ok: true }) : inspectImage(newUrl),
          ]);

          // Validation
          const checks: { label: string; level: 'ok' | 'warn' | 'error'; detail?: string }[] = [];
          // Filename
          const origBase = basenameFromUrl(origUrl);
          if (/[A-ZÅÄÖ\s_]/.test(origBase) || /%[0-9a-f]{2}/i.test(origBase)) {
            checks.push({ label: 'Filnamn', level: 'warn', detail: `Källfil "${origBase}" döps om till "${newFilename}"` });
          } else {
            checks.push({ label: 'Filnamn', level: 'ok', detail: newFilename });
          }
          // Alt
          if (!origAlt.trim()) {
            checks.push({ label: 'Alt-text', level: 'warn', detail: `Saknas – fylls i automatiskt: "${suggestedAlt}"` });
          } else if (origAlt.length < 5 || origAlt.length > 125) {
            checks.push({ label: 'Alt-text', level: 'warn', detail: `${origAlt.length} tecken (rek. 5–125)` });
          } else {
            checks.push({ label: 'Alt-text', level: 'ok', detail: `${origAlt.length} tecken` });
          }
          // Format
          const newCt = newInfo.contentType || '';
          const targetFmt = activeImageOpts.format;
          const formatOk = targetFmt === 'webp' ? /webp/i.test(newCt) : /jpe?g/i.test(newCt);
          if (newUrl === origUrl) {
            checks.push({ label: 'Format', level: 'ok', detail: `Behålls (${origInfo.contentType || 'okänt'})` });
          } else if (formatOk) {
            checks.push({ label: 'Format', level: 'ok', detail: newCt || targetFmt });
          } else if (newInfo.ok) {
            checks.push({ label: 'Format', level: 'error', detail: `Förväntade ${targetFmt}, fick ${newCt || 'okänt'}` });
          } else {
            checks.push({ label: 'Format', level: 'error', detail: newInfo.error || 'konvertering misslyckades' });
          }
          // Storlek
          const targetW = (newInfo.width ?? origInfo.width) || 0;
          const targetH = (newInfo.height ?? origInfo.height) || 0;
          if (targetW && targetW > activeImageOpts.maxWidth + 8) {
            checks.push({ label: 'Bredd', level: 'warn', detail: `${targetW}px > max ${activeImageOpts.maxWidth}px` });
          } else if (targetW && targetW < 600) {
            checks.push({ label: 'Bredd', level: 'warn', detail: `${targetW}px (lågt — rek. ≥ 800px)` });
          } else if (targetW) {
            checks.push({ label: 'Bredd', level: 'ok', detail: `${targetW}×${targetH}px` });
          }
          // Filstorlek
          const newSize = newInfo.size || 0;
          const origSize = origInfo.size || 0;
          if (origSize) summary.originalBytes += origSize;
          if (newSize && origSize) summary.savedBytes += Math.max(0, origSize - newSize);
          if (newSize > 2_000_000) {
            checks.push({ label: 'Filstorlek', level: 'error', detail: `${(newSize / 1024).toFixed(0)} KB (> 2 MB)` });
          } else if (newSize > 500_000) {
            checks.push({ label: 'Filstorlek', level: 'warn', detail: `${(newSize / 1024).toFixed(0)} KB (> 500 KB)` });
          } else if (newSize) {
            checks.push({ label: 'Filstorlek', level: 'ok', detail: `${(newSize / 1024).toFixed(0)} KB` });
          }

          const worst = checks.some((c) => c.level === 'error') ? 'error' : checks.some((c) => c.level === 'warn') ? 'warn' : 'ok';
          summary[worst === 'error' ? 'errors' : worst === 'warn' ? 'warnings' : 'ok']++;

          productImages.push({
            position: i + 1,
            originalUrl: origUrl,
            originalFilename: origBase,
            originalAlt: origAlt,
            originalSize: origSize || null,
            originalContentType: origInfo.contentType,
            originalWidth: origInfo.width,
            originalHeight: origInfo.height,
            newUrl,
            newFilename,
            suggestedAlt,
            newSize: newSize || null,
            newContentType: newCt || null,
            newWidth: newInfo.width,
            newHeight: newInfo.height,
            savingsPercent: origSize && newSize ? Math.round((1 - newSize / origSize) * 100) : null,
            status: worst,
            checks,
          });
        }
        results.push({
          item_id: p.id,
          product_title: title,
          product_handle: src.handle,
          images: productImages,
        });
      }

      await admin.from('cloner_logs').insert({
        migration_id: migration.id, tenant_id: migration.tenant_id,
        event: 'image_test_run',
        metadata: { ...summary, opts: activeImageOpts, sample },
        message: `Bildtest: ${summary.products} produkter, ${summary.images} bilder, ${summary.errors} fel, ${summary.warnings} varningar`,
      });

      return new Response(JSON.stringify({ ok: true, opts: activeImageOpts, summary, results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }


    // ----- Activate (publish) a migrated theme as main -----
    if (body.activate_theme) {
      const targetAccess = await resolveShopAccess(target);
      let q = admin.from('cloner_migration_items').select('*')
        .eq('migration_id', body.migration_id)
        .eq('object_type', 'theme')
        .eq('publish_status', 'published');
      if (body.item_ids?.length) q = q.in('id', body.item_ids);
      const { data: themes } = await q;
      const it = themes?.[0];
      if (!it?.target_id) throw new Error('no published theme item found');
      const themeId = String(it.target_id).replace(/^theme:/, '');
      const r = await rest(targetAccess.domain, targetAccess.token, targetAccess.apiVersion, 'PUT', `themes/${themeId}.json`, { theme: { id: Number(themeId), role: 'main' } });
      await admin.from('cloner_logs').insert({
        migration_id: migration.id, tenant_id: migration.tenant_id,
        event: 'theme_activated', object_type: 'theme', object_id: it.source_id,
        metadata: { theme_id: themeId },
      });
      return new Response(JSON.stringify({ ok: true, theme: r.theme }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ----- Remap theme settings_data.json + section JSON templates with target GIDs/handles -----
    if (body.remap_theme_settings) {
      const targetAccess = await resolveShopAccess(target);
      const { data: themes } = await admin.from('cloner_migration_items').select('*')
        .eq('migration_id', body.migration_id).eq('object_type', 'theme').eq('publish_status', 'published');
      const it = themes?.[0];
      if (!it?.target_id) throw new Error('no published theme item found');
      const themeId = String(it.target_id).replace(/^theme:/, '');

      // Build GID mapping table from cloner_object_mappings (source -> target)
      const { data: maps } = await admin.from('cloner_object_mappings').select('object_type, source_id, target_id, source_handle, target_handle')
        .eq('migration_id', body.migration_id).eq('status', 'published');
      const gidMap = new Map<string, string>();
      const handleMap = new Map<string, string>(); // `${type}:${srcHandle}` -> targetHandle
      for (const m of maps || []) {
        if (m.source_id && m.target_id) gidMap.set(String(m.source_id), String(m.target_id));
        if (m.source_handle && m.target_handle) handleMap.set(`${m.object_type}:${m.source_handle}`, m.target_handle);
      }

      // Fetch all .json assets in theme and rewrite GIDs/handles found in them
      const assetsList: any = await rest(targetAccess.domain, targetAccess.token, targetAccess.apiVersion, 'GET', `themes/${themeId}/assets.json`);
      const jsonKeys = (assetsList.assets || []).map((a: any) => a.key).filter((k: string) => k.endsWith('.json'));
      let updated = 0, scanned = 0;
      for (const key of jsonKeys) {
        scanned++;
        try {
          const a: any = await rest(targetAccess.domain, targetAccess.token, targetAccess.apiVersion, 'GET', `themes/${themeId}/assets.json?asset[key]=${encodeURIComponent(key)}`);
          let val: string = a.asset?.value;
          if (!val || typeof val !== 'string') continue;
          let mutated = false;
          // Replace GIDs (gid://shopify/Product/123 etc.)
          for (const [src, tgt] of gidMap) {
            if (val.includes(src)) { val = val.split(src).join(tgt); mutated = true; }
          }
          if (mutated) {
            await rest(targetAccess.domain, targetAccess.token, targetAccess.apiVersion, 'PUT', `themes/${themeId}/assets.json`, { asset: { key, value: val } });
            updated++;
            await new Promise((r) => setTimeout(r, 60));
          }
        } catch { /* skip */ }
      }
      await admin.from('cloner_logs').insert({
        migration_id: migration.id, tenant_id: migration.tenant_id,
        event: 'theme_settings_remapped', metadata: { scanned, updated },
      });
      return new Response(JSON.stringify({ ok: true, scanned, updated }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }


    // ----- Metafield GID remap pass (post-publish) -----
    if (body.remap_metafields) {
      const targetAccess = await resolveShopAccess(target);
      let q2 = admin.from('cloner_migration_items').select('*')
        .eq('migration_id', body.migration_id)
        .eq('publish_status', 'published')
        .in('object_type', ['product', 'collection', 'page', 'article', 'blog', 'metaobject', 'customer']);
      if (body.item_ids?.length) q2 = q2.in('id', body.item_ids);
      else q2 = q2.limit(body.limit || 50);
      const { data: targetItems, error: tErr } = await q2;
      if (tErr) throw tErr;
      let remapped = 0, remapFailed = 0, remapItems = 0;
      for (const it of targetItems || []) {
        try {
          const r = await remapMetafieldsForItem(admin, body.migration_id, targetAccess.domain, targetAccess.token, targetAccess.apiVersion, it);
          if (r.remapped > 0) {
            remapItems++;
            remapped += r.remapped;
            await admin.from('cloner_logs').insert({
              migration_id: migration.id, tenant_id: migration.tenant_id,
              event: 'metafield_remapped', object_type: it.object_type, object_id: it.source_id,
              message: `${r.remapped} reference(s) remapped`,
            });
          }
        } catch (e) {
          remapFailed++;
          await admin.from('cloner_logs').insert({
            migration_id: migration.id, tenant_id: migration.tenant_id,
            event: 'metafield_remap_failed', level: 'error',
            object_type: it.object_type, object_id: it.source_id,
            message: (e as Error).message,
          });
        }
      }
      return new Response(JSON.stringify({ ok: true, remap_items: remapItems, remap_references: remapped, remap_failed: remapFailed }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }


    if (body.link_collections) {
      const { data: products } = await admin
        .from('cloner_migration_items')
        .select('id, source_id, source_handle, source_payload, target_id')
        .eq('migration_id', body.migration_id)
        .eq('object_type', 'product')
        .eq('publish_status', 'published')
        .not('target_id', 'is', null)
        .limit(body.limit || 100);

      const collectionCache = new Map<string, number>();
      let linked = 0;
      let linkFailed = 0;
      const errors: string[] = [];

      for (const prod of products || []) {
        if (!prod.target_id) continue;
        try {
          const result = await linkProductToCollections({
            admin,
            migrationId: migration.id,
            tenantId: migration.tenant_id,
            sourcePayload: prod.source_payload,
            targetProductId: prod.target_id,
            sourceHandle: prod.source_handle,
            sourceId: prod.source_id,
            target,
            rest,
            collectionHandleCache: collectionCache,
            dryRun,
          });
          linked += result.linked;
          if (result.failed.length) {
            linkFailed++;
            errors.push(...result.failed.slice(0, 3));
            await insertClonerLog(admin, migration, 'collection_link_failed', {
              object_type: 'product',
              object_id: prod.source_id,
              message: result.failed.join('; ').slice(0, 500),
              metadata: { linked: result.linked, skipped: result.skipped, smart_skipped: result.smart_skipped },
            });
          } else if (result.linked > 0) {
            await insertClonerLog(admin, migration, 'collection_linked', {
              object_type: 'product',
              object_id: prod.source_id,
              metadata: { linked: result.linked, smart_skipped: result.smart_skipped },
            });
          }
        } catch (e) {
          linkFailed++;
          errors.push(`${prod.source_handle}: ${e instanceof Error ? e.message : String(e)}`);
        }
      }

      return new Response(JSON.stringify({
        ok: true,
        link_collections: true,
        products_processed: (products || []).length,
        collections_linked: linked,
        link_failed: linkFailed,
        errors: errors.slice(0, 20),
        dry_run: dryRun,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let q = admin.from('cloner_migration_items').select('*').eq('migration_id', body.migration_id).eq('approval_status', 'approved').neq('publish_status', 'published');
    if (body.item_ids?.length) q = q.in('id', body.item_ids);
    else q = q.limit(body.limit || 25);
    const { data: items, error: iErr } = await q;
    if (iErr) throw iErr;

    const sortedItems = [...(items || [])].sort(
      (a, b) => (PUBLISH_TYPE_ORDER[a.object_type] ?? 99) - (PUBLISH_TYPE_ORDER[b.object_type] ?? 99),
    );

    await admin.from('cloner_migrations').update({ status: 'publishing' }).eq('id', migration.id);
    await insertClonerLog(admin, migration, 'clone_started', {
      message: `Publish batch: ${sortedItems.length} items, mode=${mode}`,
      metadata: { limit: body.limit || 25, dry_run: dryRun, target: target.shop_domain },
    });

    const collectionHandleCache = new Map<string, number>();
    let created = 0, updated = 0, skipped = 0, failed = 0;
    let metafields_set = 0, metafields_skipped = 0, collection_link_failed = 0;

    const validProductTemplateSuffixes = await fetchProductTemplateSuffixesRaw(
      target.shop_domain,
      target.access_token,
      target.api_version || FALLBACK_API_VERSION,
    );

    for (const item of sortedItems) {
      try {
        await admin.from('cloner_migration_items').update({ publish_status: 'publishing' }).eq('id', item.id);

        const existing = mode !== 'create_only'
          ? await findExistingByHandle(target.shop_domain, target.access_token, target.api_version, item.object_type, item.source_handle || '')
          : null;

        if (existing && mode === 'skip_existing') {
          await admin.from('cloner_migration_items').update({ publish_status: 'skipped', target_id: String(existing.id), target_handle: existing.handle }).eq('id', item.id);
          await insertClonerLog(admin, migration, 'product_skipped', {
            object_type: item.object_type,
            object_id: item.source_id,
            message: `Exists with handle ${item.source_handle}`,
          });
          skipped++;
          continue;
        }

        if (dryRun) {
          await admin.from('cloner_migration_items').update({ publish_status: 'skipped' }).eq('id', item.id);
          await insertClonerLog(admin, migration, 'dry_run', { object_type: item.object_type, object_id: item.source_id });
          skipped++;
          continue;
        }

        let targetId: string | null = null;
        let targetHandle: string | null = item.source_handle;

        if (item.object_type === 'product') {
          const payload = buildProductPayload(item, validProductTemplateSuffixes);
          // Strip helper markers before sending to Shopify
          const cleanVariants = payload.product.variants.map((v: any) => { const { _image_position, ...rest } = v; return rest; });
          const productBody = { product: { ...payload.product, variants: cleanVariants } };
          if (existing && mode === 'update_existing') {
            const j = await rest(target.shop_domain, target.access_token, target.api_version, 'PUT', `products/${existing.id}.json`, { product: { ...productBody.product, id: existing.id } });
            targetId = String(j.product.id); targetHandle = j.product.handle; updated++;
            await applyPostCreateVariantHooks(admin, migration, item, j.product, payload.product.variants, target);
            // Decoupled metafield write — never fails the product
            const mfRes = await setProductMetafieldsDecoupled(
              target.shop_domain, target.access_token, target.api_version,
              j.product.id, payload.metafields,
            );
            metafields_set += mfRes.set;
            metafields_skipped += mfRes.skipped;
            if (mfRes.skipped > 0) {
              await insertClonerLog(admin, migration, 'metafield_failed', {
                level: 'warn', object_type: 'product', object_id: item.source_id,
                message: `Skipped ${mfRes.skipped} metafields (product still updated)`,
                metadata: { skipped: mfRes.skipped, set: mfRes.set, details: mfRes.skipped_details.slice(0, 10) },
              });
            }
          } else if (!existing) {
            const j = await rest(target.shop_domain, target.access_token, target.api_version, 'POST', 'products.json', productBody);
            targetId = String(j.product.id); targetHandle = j.product.handle; created++;
            await applyPostCreateVariantHooks(admin, migration, item, j.product, payload.product.variants, target);
            const cloneShopId = String(
              (migration.scope as { target_shop_id?: string })?.target_shop_id ?? migration.tenant_id,
            );
            const cloneSku = cleanVariants[0]?.sku ?? item.source_handle;
            await logDraftSafetyEvent(admin, {
              shopId: cloneShopId,
              functionName: 'shopify-cloner-publish',
              sku: cloneSku,
              action: 'force_draft',
              enforcedStatus: 'DRAFT',
              reason: 'clone_supplier_default_draft',
              inventorySource: 'clone',
              metadata: { migration_id: migration.id, source_handle: item.source_handle },
            });
            // Decoupled metafield write — never fails the product
            const mfRes = await setProductMetafieldsDecoupled(
              target.shop_domain, target.access_token, target.api_version,
              j.product.id, payload.metafields,
            );
            metafields_set += mfRes.set;
            metafields_skipped += mfRes.skipped;
            if (mfRes.skipped > 0) {
              await insertClonerLog(admin, migration, 'metafield_failed', {
                level: 'warn', object_type: 'product', object_id: item.source_id,
                message: `Skipped ${mfRes.skipped} metafields (product still created)`,
                metadata: { skipped: mfRes.skipped, set: mfRes.set, details: mfRes.skipped_details.slice(0, 10) },
              });
            }
            const linkResult = await linkProductToCollections({
              admin,
              migrationId: migration.id,
              tenantId: migration.tenant_id,
              sourcePayload: item.source_payload,
              targetProductId: j.product.id,
              sourceHandle: item.source_handle,
              sourceId: item.source_id,
              target,
              rest,
              collectionHandleCache,
              dryRun,
            });
            if (linkResult.failed.length) {
              collection_link_failed += linkResult.failed.length;
              await insertClonerLog(admin, migration, 'collection_link_failed', {
                object_type: 'product',
                object_id: item.source_id,
                message: linkResult.failed.join('; ').slice(0, 500),
              });
            } else if (linkResult.linked > 0) {
              await insertClonerLog(admin, migration, 'collection_linked', {
                object_type: 'product',
                object_id: item.source_id,
                metadata: { linked: linkResult.linked, smart_skipped: linkResult.smart_skipped },
              });
            }
            await insertClonerLog(admin, migration, 'product_cloned', {
              object_type: 'product',
              object_id: item.source_id,
              metadata: { target_id: j.product.id, collections_linked: linkResult.linked, metafields_set: mfRes.set, metafields_skipped: mfRes.skipped },
            });
          } else { skipped++; }
        } else if (item.object_type === 'collection') {
          const payload = buildCollectionPayload(item) as any;
          const isSmart = !!payload.smart_collection;
          const resourceKey = isSmart ? 'smart_collection' : 'custom_collection';
          const resourcePath = isSmart ? 'smart_collections' : 'custom_collections';
          const inner = payload[resourceKey];
          if (existing && mode === 'update_existing') {
            const existingPath = existing._kind === 'smart' ? 'smart_collections' : 'custom_collections';
            const existingKey = existing._kind === 'smart' ? 'smart_collection' : 'custom_collection';
            // If kind mismatches we cannot in-place convert; fall back to updating fields shared by both
            const j = await rest(target.shop_domain, target.access_token, target.api_version, 'PUT', `${existingPath}/${existing.id}.json`, { [existingKey]: { ...inner, id: existing.id } });
            targetId = String((j[existingKey] || {}).id || existing.id); updated++;
          } else if (!existing) {
            const j = await rest(target.shop_domain, target.access_token, target.api_version, 'POST', `${resourcePath}.json`, payload);
            targetId = String(j[resourceKey].id); created++;
          } else { skipped++; }

        } else if (item.object_type === 'page') {
          const payload = buildPagePayload(item);
          if (existing && mode === 'update_existing') {
            const j = await rest(target.shop_domain, target.access_token, target.api_version, 'PUT', `pages/${existing.id}.json`, { page: { ...payload.page, id: existing.id } });
            targetId = String(j.page.id); updated++;
          } else if (!existing) {
            const j = await rest(target.shop_domain, target.access_token, target.api_version, 'POST', 'pages.json', payload);
            targetId = String(j.page.id); created++;
          } else { skipped++; }
        } else if (item.object_type === 'blog') {
          if (!existing) {
            const j = await rest(target.shop_domain, target.access_token, target.api_version, 'POST', 'blogs.json', buildBlogPayload(item));
            targetId = String(j.blog.id); created++;
          } else { targetId = String(existing.id); skipped++; }
        } else if (item.object_type === 'article') {
          // Need a target blog id - try first available blog
          const blogsJson = await rest(target.shop_domain, target.access_token, target.api_version, 'GET', 'blogs.json?limit=1');
          const targetBlogId = blogsJson.blogs?.[0]?.id;
          if (!targetBlogId) throw new Error('no blog on target store; create blog first');
          const j = await rest(target.shop_domain, target.access_token, target.api_version, 'POST', `blogs/${targetBlogId}/articles.json`, buildArticlePayload(item, targetBlogId));
          targetId = String(j.article.id); created++;
        } else if (item.object_type === 'redirect') {
          const j = await rest(target.shop_domain, target.access_token, target.api_version, 'POST', 'redirects.json', buildRedirectPayload(item, sourceDomains, targetPublicDomain));
          targetId = String(j.redirect.id); created++;
        } else if (item.object_type === 'menu') {
          const m = await publishMenu(target.shop_domain, target.access_token, target.api_version, item);
          targetId = m.id; targetHandle = m.handle; created++;
        } else if (item.object_type === 'file') {
          const f = await publishFile(target.shop_domain, target.access_token, target.api_version, item);
          targetId = f.id; created++;
        } else if (item.object_type === 'customer') {
          const r = await publishCustomer(target.shop_domain, target.access_token, target.api_version, item);
          targetId = r.id; created++;
        } else if (item.object_type === 'segment') {
          const r = await publishSegment(target.shop_domain, target.access_token, target.api_version, item);
          targetId = r.id; created++;
        } else if (item.object_type === 'discountCode') {
          const r = await publishDiscountCode(target.shop_domain, target.access_token, target.api_version, item);
          targetId = r.id; targetHandle = r.handle; created++;
        } else if (item.object_type === 'automaticDiscount') {
          const r = await publishAutomaticDiscount(target.shop_domain, target.access_token, target.api_version, item);
          targetId = r.id; created++;
        } else if (item.object_type === 'metaobjectDefinition') {
          const r = await publishMetaobjectDefinition(target.shop_domain, target.access_token, target.api_version, item);
          targetId = r.id; targetHandle = r.handle; created++;
        } else if (item.object_type === 'metaobject') {
          const r = await publishMetaobject(target.shop_domain, target.access_token, target.api_version, item);
          targetId = r.id; targetHandle = r.handle; created++;
        } else if (item.object_type === 'metafieldDefinition') {
          const r = await publishMetafieldDefinition(target.shop_domain, target.access_token, target.api_version, item);
          targetId = r.id; targetHandle = r.handle; created++;
        } else if (item.object_type === 'shopPolicy') {
          const r = await publishShopPolicy(target.shop_domain, target.access_token, target.api_version, item);
          targetId = r.id; targetHandle = r.handle; updated++;
        } else if (item.object_type === 'locale') {
          const r = await publishLocale(target.shop_domain, target.access_token, target.api_version, item);
          targetId = r.id; targetHandle = r.handle; created++;
        } else if (item.object_type === 'theme') {
          const r = await publishTheme(target.shop_domain, target.access_token, target.api_version, item);
          targetId = r.id; targetHandle = r.handle; created++;
        } else if (item.object_type === 'translation') {
          const r = await publishTranslation(admin, migration.id, target.shop_domain, target.access_token, target.api_version, item);
          targetId = r.id; targetHandle = r.handle;
          if ((r as any).skipped) skipped++; else created++;
        } else if (item.object_type === 'giftCard') {
          const r = await publishGiftCard(target.shop_domain, target.access_token, target.api_version, item);
          targetId = r.id; targetHandle = r.handle; created++;
        } else if (item.object_type === 'shippingZone') {
          const r = await publishShippingZone(admin, migration, target.shop_domain, target.access_token, target.api_version, item);
          targetId = r.id; targetHandle = r.handle;
          if ((r as any).manual) skipped++; else created++;
        } else if (item.object_type === 'checkoutBranding') {
          const r = await publishCheckoutBranding(target.shop_domain, target.access_token, target.api_version, item);
          targetId = r.id; targetHandle = r.handle; updated++;
        } else {
          await admin.from('cloner_logs').insert({ migration_id: migration.id, tenant_id: migration.tenant_id, event: 'unsupported', object_type: item.object_type, object_id: item.source_id, level: 'warn' });
          skipped++;
          continue;
        }

        await admin.from('cloner_migration_items').update({
          publish_status: 'published', target_id: targetId, target_handle: targetHandle, error: null,
        }).eq('id', item.id);
        await admin.from('cloner_object_mappings').update({
          target_id: targetId, target_handle: targetHandle, status: 'published',
        }).eq('migration_id', migration.id).eq('object_type', item.object_type).eq('source_id', item.source_id);
        await insertClonerLog(admin, migration, existing ? 'updated' : 'created', {
          object_type: item.object_type,
          object_id: item.source_id,
          metadata: { target_id: targetId },
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        failed++;
        await admin.from('cloner_migration_items').update({ publish_status: 'failed', error: msg }).eq('id', item.id);
        const failEvent = item.object_type === 'product' ? 'product_failed' : 'failed';
        await insertClonerLog(admin, migration, failEvent, {
          level: 'error',
          object_type: item.object_type,
          object_id: item.source_id,
          message: msg,
        });
        const msgLower = msg.toLowerCase();
        if (item.object_type === 'product' && (msgLower.includes('image') || msgLower.includes('media'))) {
          await insertClonerLog(admin, migration, 'image_failed', {
            level: 'error',
            object_type: 'product',
            object_id: item.source_id,
            message: msg.slice(0, 500),
          });
        }
        if (msgLower.includes('metafield')) {
          await insertClonerLog(admin, migration, 'metafield_failed', {
            level: 'error',
            object_type: item.object_type,
            object_id: item.source_id,
            message: msg.slice(0, 500),
          });
        }
      }
    }

    await admin.from('cloner_migrations').update({
      status: 'review',
      stats: {
        ...(migration.stats || {}),
        published_created: (migration.stats?.published_created || 0) + created,
        published_updated: (migration.stats?.published_updated || 0) + updated,
        published_skipped: (migration.stats?.published_skipped || 0) + skipped,
        published_failed: (migration.stats?.published_failed || 0) + failed,
      },
    }).eq('id', migration.id);

    await insertClonerLog(admin, migration, 'clone_completed', {
      message: `Batch done: created=${created} updated=${updated} skipped=${skipped} failed=${failed} mf_set=${metafields_set} mf_skipped=${metafields_skipped} coll_link_failed=${collection_link_failed}`,
      metadata: { created, updated, skipped, failed, metafields_set, metafields_skipped, collection_link_failed, mode },
    });

    const processed = created + updated + failed;
    const fail_rate = processed > 0 ? Math.round((failed / processed) * 10000) / 100 : 0;
    return new Response(JSON.stringify({
      created, updated, skipped, failed,
      metafields_set, metafields_skipped, collection_link_failed,
      fail_rate_pct: fail_rate,
      mode, dry_run: dryRun,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('publish error', msg);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
