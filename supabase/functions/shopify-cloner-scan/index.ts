// Scan source Shopify store and populate cloner_migration_items with raw payloads.
// Supports: products, collections, pages, blogs, articles, menus, redirects.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { resolveShopAccess } from '../_shared/cloner-shopify-access.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface Body {
  migration_id: string;
  types?: string[]; // override; otherwise read from migration.scope
  scan_type?: string; // worker mode: scan one resource type incrementally
  cursor?: string | null;
  page_limit?: number;
}

const DEFAULT_TYPES = ['product', 'collection', 'page', 'blog', 'article', 'menu', 'file', 'shopPolicy', 'locale', 'metafieldDefinition', 'metaobjectDefinition', 'metaobject', 'translation', 'shippingZone', 'giftCard', 'checkoutBranding'];

// Translatable resource types we mirror (per locale)
const TRANSLATABLE_TYPES = ['PRODUCT', 'COLLECTION', 'ONLINE_STORE_PAGE', 'ONLINE_STORE_BLOG', 'ONLINE_STORE_ARTICLE', 'SHOP_POLICY', 'LINK'];

const METAFIELD_OWNER_TYPES = ['PRODUCT', 'COLLECTION', 'CUSTOMER', 'ORDER', 'PAGE', 'BLOG', 'ARTICLE', 'COMPANY', 'COMPANY_LOCATION'];

async function gql(domain: string, token: string, apiVersion: string, query: string, variables: Record<string, unknown> = {}) {
  let attempt = 0;
  const maxAttempts = 8;
  while (true) {
    let r: Response;
    try {
      r = await fetch(`https://${domain}/admin/api/${apiVersion}/graphql.json`, {
        method: 'POST',
        headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables }),
      });
    } catch (e) {
      attempt++;
      if (attempt > maxAttempts) throw e;
      await new Promise((res) => setTimeout(res, Math.min(30000, 1500 * 2 ** (attempt - 1))));
      continue;
    }
    if (r.status === 429 || r.status >= 500) {
      attempt++;
      if (attempt > maxAttempts) throw new Error(`shopify ${r.status} after retries`);
      const retryAfter = Number(r.headers.get('retry-after')) * 1000;
      const wait = retryAfter > 0 ? retryAfter : Math.min(30000, 1500 * 2 ** (attempt - 1));
      await new Promise((res) => setTimeout(res, wait));
      continue;
    }
    let j: any;
    try { j = await r.json(); } catch {
      attempt++;
      if (attempt > maxAttempts) throw new Error(`shopify invalid json (${r.status})`);
      await new Promise((res) => setTimeout(res, Math.min(30000, 1500 * 2 ** (attempt - 1))));
      continue;
    }
    // Handle throttling reported inside GraphQL errors (HTTP 200)
    const throttled = Array.isArray(j?.errors) && j.errors.some((e: any) =>
      e?.extensions?.code === 'THROTTLED' || /throttled/i.test(String(e?.message || ''))
    );
    if (throttled) {
      attempt++;
      if (attempt > maxAttempts) throw new Error('graphql: ' + JSON.stringify(j.errors));
      const cost = j?.extensions?.cost?.throttleStatus;
      let wait = Math.min(30000, 2000 * 2 ** (attempt - 1));
      if (cost && cost.currentlyAvailable != null && cost.restoreRate) {
        const needed = (cost.requestedQueryCost || 1000) - cost.currentlyAvailable;
        if (needed > 0) wait = Math.max(wait, Math.ceil((needed / cost.restoreRate) * 1000) + 500);
      }
      await new Promise((res) => setTimeout(res, wait));
      continue;
    }
    if (j.errors) throw new Error('graphql: ' + JSON.stringify(j.errors));
    // Proactive pacing: if bucket is getting low, slow down
    const cost = j?.extensions?.cost?.throttleStatus;
    if (cost && cost.maximumAvailable && cost.currentlyAvailable / cost.maximumAvailable < 0.2) {
      await new Promise((res) => setTimeout(res, 750));
    }
    return j.data;
  }
}

const PRODUCT_QUERY = `
query Products($cursor: String) {
  products(first: 50, after: $cursor) {
    pageInfo { hasNextPage endCursor }
    nodes {
      id handle title descriptionHtml vendor productType tags status templateSuffix
      seo { title description }
      category { id name }
      collections(first: 50) {
        nodes { id handle title ruleSet { appliedDisjunctively rules { column relation condition } } }
      }
      media(first: 100) {
        pageInfo { hasNextPage endCursor }
        nodes { ... on MediaImage { id image { url altText width height } } }
      }
      metafields(first: 50) { nodes { namespace key value type } }
      variants(first: 100) {
        nodes {
          id title sku barcode price compareAtPrice
          inventoryPolicy inventoryQuantity
          image { url altText }
          inventoryItem { tracked measurement { weight { value unit } } harmonizedSystemCode countryCodeOfOrigin }
          selectedOptions { name value }
        }
      }
      options { name values }
    }
  }
}`;

const PRODUCT_MEDIA_QUERY = `
query ProductMedia($id: ID!, $cursor: String) {
  product(id: $id) {
    media(first: 100, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      nodes { ... on MediaImage { id image { url altText width height } } }
    }
  }
}`;


const COLLECTION_QUERY = `
query Collections($cursor: String) {
  collections(first: 50, after: $cursor) {
    pageInfo { hasNextPage endCursor }
    nodes {
      id handle title descriptionHtml templateSuffix sortOrder
      seo { title description }
      metafields(first: 50) { nodes { namespace key value type } }
      ruleSet {
        appliedDisjunctively
        rules {
          column relation condition
          conditionObject {
            ... on CollectionRuleMetafieldCondition {
              metafieldDefinition { id namespace key ownerType }
            }
          }
        }
      }
      image { url altText }
    }
  }
}`;

const PAGE_QUERY = `
query Pages($cursor: String) {
  pages(first: 50, after: $cursor) {
    pageInfo { hasNextPage endCursor }
    nodes { id handle title body bodySummary isPublished templateSuffix }
  }
}`;

const BLOG_QUERY = `
query Blogs($cursor: String) {
  blogs(first: 50, after: $cursor) {
    pageInfo { hasNextPage endCursor }
    nodes { id handle title templateSuffix commentPolicy }
  }
}`;

const ARTICLE_QUERY = `
query Articles($cursor: String) {
  articles(first: 50, after: $cursor) {
    pageInfo { hasNextPage endCursor }
    nodes { id handle title body summary tags isPublished templateSuffix image { url altText } author { name } blog { id handle title } }
  }
}`;


const MENU_QUERY = `
query Menus($cursor: String) {
  menus(first: 50, after: $cursor) {
    pageInfo { hasNextPage endCursor }
    nodes { id handle title items { id title url type resourceId tags } }
  }
}`;

const REDIRECT_QUERY = `
query Redirects($cursor: String) {
  urlRedirects(first: 100, after: $cursor) {
    pageInfo { hasNextPage endCursor }
    nodes { id path target }
  }
}`;

const FILE_QUERY = `
query Files($cursor: String) {
  files(first: 50, after: $cursor) {
    pageInfo { hasNextPage endCursor }
    nodes {
      __typename id alt createdAt fileStatus
      ... on MediaImage { image { url width height altText } mimeType }
      ... on GenericFile { url mimeType originalFileSize }
      ... on Video { sources { url mimeType format } }
    }
  }
}`;

const CUSTOMER_QUERY = `
query Customers($cursor: String) {
  customers(first: 50, after: $cursor) {
    pageInfo { hasNextPage endCursor }
    nodes {
      id firstName lastName email phone state note tags taxExempt verifiedEmail
      addresses { firstName lastName company address1 address2 city province country zip phone }
      defaultAddress { address1 city country zip }
      metafields(first: 30) { nodes { namespace key value type } }
    }
  }
}`;

const SEGMENT_QUERY = `
query Segments($cursor: String) {
  segments(first: 50, after: $cursor) {
    pageInfo { hasNextPage endCursor }
    nodes { id name query creationDate lastEditDate }
  }
}`;

const DISCOUNT_CODE_QUERY = `
query CodeDiscounts($cursor: String) {
  codeDiscountNodes(first: 50, after: $cursor) {
    pageInfo { hasNextPage endCursor }
    nodes {
      id
      codeDiscount {
        __typename
        ... on DiscountCodeBasic {
          title status startsAt endsAt summary
          codes(first: 5) { nodes { code } }
          usageLimit appliesOncePerCustomer
          customerGets {
            value {
              __typename
              ... on DiscountPercentage { percentage }
              ... on DiscountAmount { amount { amount currencyCode } }
            }
          }
          minimumRequirement {
            __typename
            ... on DiscountMinimumQuantity { greaterThanOrEqualToQuantity }
            ... on DiscountMinimumSubtotal { greaterThanOrEqualToSubtotal { amount currencyCode } }
          }
        }
        ... on DiscountCodeBxgy { title status startsAt endsAt summary codes(first: 5) { nodes { code } } }
        ... on DiscountCodeFreeShipping { title status startsAt endsAt summary codes(first: 5) { nodes { code } } }
      }
    }
  }
}`;

const AUTO_DISCOUNT_QUERY = `
query AutoDiscounts($cursor: String) {
  automaticDiscountNodes(first: 50, after: $cursor) {
    pageInfo { hasNextPage endCursor }
    nodes {
      id
      automaticDiscount {
        __typename
        ... on DiscountAutomaticBasic {
          title status startsAt endsAt summary
          customerGets {
            value {
              __typename
              ... on DiscountPercentage { percentage }
              ... on DiscountAmount { amount { amount currencyCode } }
            }
          }
        }
        ... on DiscountAutomaticBxgy { title status startsAt endsAt summary }
        ... on DiscountAutomaticFreeShipping { title status startsAt endsAt summary }
      }
    }
  }
}`;

const METAOBJECT_DEF_QUERY = `
query MetaobjectDefs($cursor: String) {
  metaobjectDefinitions(first: 50, after: $cursor) {
    pageInfo { hasNextPage endCursor }
    nodes {
      id type name description displayNameKey
      fieldDefinitions { key name description required type { name } validations { name value } }
    }
  }
}`;

const METAOBJECTS_BY_TYPE_QUERY = `
query MetaobjectsByType($type: String!, $cursor: String) {
  metaobjects(type: $type, first: 50, after: $cursor) {
    pageInfo { hasNextPage endCursor }
    nodes { id handle type displayName fields { key value type } }
  }
}`;

const METAFIELD_DEF_QUERY = `
query MetafieldDefs($owner: MetafieldOwnerType!, $cursor: String) {
  metafieldDefinitions(first: 50, after: $cursor, ownerType: $owner) {
    pageInfo { hasNextPage endCursor }
    nodes { id name namespace key description ownerType type { name } validations { name value } }
  }
}`;

const SHOP_POLICY_QUERY = `
query Policies { shop { shopPolicies { id type title body url createdAt updatedAt } } }`;

const LOCALE_QUERY = `
query Locales { shopLocales { locale name primary published } }`;

const CHECKOUT_BRANDING_QUERY = `
query Profiles {
  checkoutProfiles(first: 20) { nodes { id name isPublished } }
}`;

const CHECKOUT_BRANDING_DETAIL_QUERY = `
query Branding($id: ID!) {
  checkoutBranding(checkoutProfileId: $id) {
    designSystem {
      colors { global { brand accent background foreground } schemes { scheme1 { base { background text } } scheme2 { base { background text } } } }
      cornerRadius { base small large }
      typography { primary { name base { genericFamilies weight } } secondary { name base { genericFamilies weight } } }
    }
    customizations {
      header { position banner { mediaImageId } }
      footer { position content { visibility } }
      headingLevel1 { typography { font size weight letterCase } }
      headingLevel2 { typography { font size weight letterCase } }
      primaryButton { background blockPadding cornerRadius border typography { font size weight } }
      secondaryButton { background blockPadding cornerRadius border typography { font size weight } }
      global { typography { primary { base { genericFamilies } } } cornerRadius }
    }
  }
}`;

const TRANSLATIONS_QUERY = `
query Translations($type: TranslatableResourceType!, $locale: String!, $cursor: String) {
  translatableResources(resourceType: $type, first: 50, after: $cursor) {
    pageInfo { hasNextPage endCursor }
    nodes {
      resourceId
      translations(locale: $locale) { key value locale outdated }
    }
  }
}`;

const QUERIES: Record<string, { query: string; field: string }> = {
  product: { query: PRODUCT_QUERY, field: 'products' },
  collection: { query: COLLECTION_QUERY, field: 'collections' },
  page: { query: PAGE_QUERY, field: 'pages' },
  blog: { query: BLOG_QUERY, field: 'blogs' },
  article: { query: ARTICLE_QUERY, field: 'articles' },
  menu: { query: MENU_QUERY, field: 'menus' },
  redirect: { query: REDIRECT_QUERY, field: 'urlRedirects' },
  file: { query: FILE_QUERY, field: 'files' },
  customer: { query: CUSTOMER_QUERY, field: 'customers' },
  segment: { query: SEGMENT_QUERY, field: 'segments' },
  discountCode: { query: DISCOUNT_CODE_QUERY, field: 'codeDiscountNodes' },
  automaticDiscount: { query: AUTO_DISCOUNT_QUERY, field: 'automaticDiscountNodes' },
  metaobjectDefinition: { query: METAOBJECT_DEF_QUERY, field: 'metaobjectDefinitions' },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  let migrationIdForCatch: string | null = null;
  let tenantIdForCatch: string | null = null;
  try {
    const auth = req.headers.get('Authorization') || '';
    const isInternalWorker = auth === `Bearer ${SERVICE_ROLE}`;
    if (!isInternalWorker) {
      const userClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
      const { data: { user } } = await userClient.auth.getUser();
      if (!user) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const body = (await req.json()) as Body;
    migrationIdForCatch = body.migration_id || null;
    const { data: migration, error: mErr } = await admin.from('cloner_migrations').select('*').eq('id', body.migration_id).maybeSingle();
    if (mErr || !migration) throw new Error('migration not found');
    tenantIdForCatch = migration.tenant_id;

    const { data: source } = await admin.from('cloner_stores').select('*').eq('id', migration.source_store_id).maybeSingle();
    if (!source) throw new Error('source store not found');
    const sourceAccess = await resolveShopAccess(source);
    await admin.from('cloner_logs').insert({
      migration_id: migration.id, tenant_id: migration.tenant_id, event: 'scan_access_ok',
      message: `domain=${sourceAccess.domain} api=${sourceAccess.apiVersion}`,
    });

    const partialMode = Boolean(body.scan_type);
    const types = partialMode
      ? [body.scan_type as string]
      : body.types && body.types.length > 0
        ? body.types
        : (migration.scope?.types as string[] | undefined) || DEFAULT_TYPES;
    const pageLimit = Math.max(1, Math.min(Number(body.page_limit || 8), 20));
    let partialNextCursor: string | null = null;
    let partialDone = true;

    await admin.from('cloner_migrations').update({ status: 'scanning', error: null }).eq('id', migration.id);
    await admin.from('cloner_logs').insert({
      migration_id: migration.id, tenant_id: migration.tenant_id, event: 'scan_started',
      message: `Scanning ${types.join(', ')}`,
    });

    const stats: Record<string, number> = {};

    async function storeNodes(type: string, nodes: any[]) {
      if (!nodes.length) return;
      const rows = nodes.map((n) => ({
        migration_id: migration.id,
        tenant_id: migration.tenant_id,
        object_type: type,
        source_id: n.id || `${type}:${n.handle || n.locale || n.type || crypto.randomUUID()}`,
        source_handle: n.handle ?? n.locale ?? n.type ?? null,
        source_payload: n,
      }));
      const up1 = await admin.from('cloner_migration_items').upsert(rows, { onConflict: 'migration_id,object_type,source_id', ignoreDuplicates: false } as any);
      if (up1.error) {
        await admin.from('cloner_logs').insert({ migration_id: migration.id, tenant_id: migration.tenant_id, event: 'scan_upsert_error', level: 'error', object_type: type, message: `items: ${up1.error.message}` });
        throw up1.error;
      }
      const up2 = await admin.from('cloner_object_mappings').upsert(
        rows.map((r) => ({
          migration_id: migration.id, tenant_id: migration.tenant_id,
          object_type: type, source_id: r.source_id, source_handle: r.source_handle, status: 'pending',
        })),
        { onConflict: 'migration_id,object_type,source_id' } as any,
      );
      if (up2.error) {
        await admin.from('cloner_logs').insert({ migration_id: migration.id, tenant_id: migration.tenant_id, event: 'scan_upsert_error', level: 'warn', object_type: type, message: `mappings: ${up2.error.message}` });
      }
    }

    async function restGet(path: string) {
      let attempt = 0;
      while (true) {
        const r = await fetch(`https://${sourceAccess.domain}/admin/api/${sourceAccess.apiVersion}/${path}`, {
          headers: { 'X-Shopify-Access-Token': sourceAccess.token, Accept: 'application/json' },
        });
        if (r.status === 429 || r.status >= 500) {
          attempt++;
          if (attempt > 5) throw new Error(`shopify ${r.status} after retries`);
          await new Promise((res) => setTimeout(res, 1000 * attempt));
          continue;
        }
        const text = await r.text();
        if (!r.ok) throw new Error(`shopify ${r.status}: ${text.slice(0, 300)}`);
        return text ? JSON.parse(text) : {};
      }
    }

    for (const type of types) {
      let count = 0;
      await admin.from('cloner_logs').insert({
        migration_id: migration.id, tenant_id: migration.tenant_id, event: 'scan_type_started',
        object_type: type, message: `start ${type}`,
      });
      try {

      // Special: shop policies (single query, returns array directly)
      if (type === 'shopPolicy') {
        const data: any = await gql(sourceAccess.domain, sourceAccess.token, sourceAccess.apiVersion, SHOP_POLICY_QUERY);
        const nodes = data.shop?.shopPolicies || [];
        await storeNodes(type, nodes);
        count = nodes.length;
      }
      // Special: themes (REST — list themes + asset metadata only; values fetched lazily during publish)
      else if (type === 'theme') {
        const tJson: any = await restGet('themes.json');
        const themes: any[] = tJson.themes || [];
        await admin.from('cloner_logs').insert({
          migration_id: migration.id, tenant_id: migration.tenant_id, event: 'theme_list', level: 'info',
          object_type: 'theme', message: `found ${themes.length} theme(s)`,
        });
        for (const th of themes) {
          let assetMeta: any[] = [];
          try {
            const assetsList: any = await restGet(`themes/${th.id}/assets.json`);
            assetMeta = (assetsList.assets || []).map((a: any) => ({
              key: a.key,
              content_type: a.content_type,
              size: a.size,
              checksum: a.checksum,
              public_url: a.public_url,
              updated_at: a.updated_at,
            }));
          } catch (e) {
            await admin.from('cloner_logs').insert({
              migration_id: migration.id, tenant_id: migration.tenant_id, event: 'theme_assets_skip', level: 'warn',
              object_type: 'theme', message: `${th.name}: ${(e as Error).message}`,
            });
          }
          const node = {
            id: `theme:${th.id}`,
            handle: th.name,
            theme: { id: th.id, name: th.name, role: th.role, processing: th.processing, theme_store_id: th.theme_store_id, previewable: th.previewable },
            assets: assetMeta,
            assets_count: assetMeta.length,
          };
          await storeNodes(type, [node]);
          count++;
        }
      }

      // Special: locales (single query, no pagination)
      else if (type === 'locale') {
        const data: any = await gql(sourceAccess.domain, sourceAccess.token, sourceAccess.apiVersion, LOCALE_QUERY);
        const nodes = (data.shopLocales || []).map((l: any) => ({ ...l, id: `locale:${l.locale}`, handle: l.locale }));
        await storeNodes(type, nodes);
        count = nodes.length;
      }
      // Special: metafield definitions (iterate over owner types)
      else if (type === 'metafieldDefinition') {
        for (const owner of METAFIELD_OWNER_TYPES) {
          let cursor: string | null = null;
          while (true) {
            try {
              const data: any = await gql(sourceAccess.domain, sourceAccess.token, sourceAccess.apiVersion, METAFIELD_DEF_QUERY, { owner, cursor });
              const conn = data.metafieldDefinitions;
              const nodes: any[] = (conn?.nodes || []).map((n: any) => ({ ...n, handle: `${owner}:${n.namespace}.${n.key}` }));
              await storeNodes(type, nodes);
              count += nodes.length;
              if (!conn?.pageInfo?.hasNextPage) break;
              cursor = conn.pageInfo.endCursor;
            } catch (e) {
              // owner type may not be supported on this store/plan
              break;
            }
          }
        }
      }
      // Special: metaobjects — fetch definitions first, then per type
      else if (type === 'metaobject') {
        // get all definitions to discover types
        let defCursor: string | null = null;
        const moTypes: string[] = [];
        while (true) {
          const d: any = await gql(sourceAccess.domain, sourceAccess.token, sourceAccess.apiVersion, METAOBJECT_DEF_QUERY, { cursor: defCursor });
          const conn = d.metaobjectDefinitions;
          for (const n of (conn?.nodes || [])) moTypes.push(n.type);
          if (!conn?.pageInfo?.hasNextPage) break;
          defCursor = conn.pageInfo.endCursor;
        }
        for (const moType of moTypes) {
          let cursor: string | null = null;
          while (true) {
            try {
              const data: any = await gql(sourceAccess.domain, sourceAccess.token, sourceAccess.apiVersion, METAOBJECTS_BY_TYPE_QUERY, { type: moType, cursor });
              const conn = data.metaobjects;
              await storeNodes(type, conn?.nodes || []);
              count += (conn?.nodes || []).length;
              if (!conn?.pageInfo?.hasNextPage) break;
              cursor = conn.pageInfo.endCursor;
            } catch { break; }
          }
        }
      }
      // Special: translations — iterate over locales (non-primary, published) × resource types
      else if (type === 'translation') {
        const locData: any = await gql(sourceAccess.domain, sourceAccess.token, sourceAccess.apiVersion, LOCALE_QUERY);
        const locales: any[] = (locData.shopLocales || []).filter((l: any) => l.published && !l.primary);
        if (!locales.length) {
          await admin.from('cloner_logs').insert({
            migration_id: migration.id, tenant_id: migration.tenant_id, event: 'scan_type_skip', level: 'warn',
            object_type: type, message: 'no non-primary published locales',
          });
        }
        for (const loc of locales) {
          for (const trType of TRANSLATABLE_TYPES) {
            let cursor: string | null = null;
            while (true) {
              try {
                const data: any = await gql(sourceAccess.domain, sourceAccess.token, sourceAccess.apiVersion, TRANSLATIONS_QUERY, { type: trType, locale: loc.locale, cursor });
                const conn = data.translatableResources;
                const nodes: any[] = (conn?.nodes || [])
                  .filter((n: any) => Array.isArray(n.translations) && n.translations.length > 0)
                  .map((n: any) => ({
                    id: `translation:${trType}:${loc.locale}:${n.resourceId}`,
                    handle: `${trType}:${loc.locale}:${n.resourceId}`,
                    resourceId: n.resourceId,
                    resourceType: trType,
                    locale: loc.locale,
                    translations: n.translations,
                  }));
                await storeNodes(type, nodes);
                count += nodes.length;
                if (!conn?.pageInfo?.hasNextPage) break;
                cursor = conn.pageInfo.endCursor;
              } catch (e) {
                await admin.from('cloner_logs').insert({
                  migration_id: migration.id, tenant_id: migration.tenant_id, event: 'translation_scan_skip', level: 'warn',
                  object_type: 'translation', message: `${trType}/${loc.locale}: ${(e as Error).message}`,
                });
                break;
              }
            }
          }
        }
      }
      // Special: shipping zones via REST
      else if (type === 'shippingZone') {
        const j: any = await restGet('shipping_zones.json');
        const nodes = (j.shipping_zones || []).map((z: any) => ({
          ...z,
          id: `shipping_zone:${z.id}`,
          handle: z.name,
        }));
        await storeNodes(type, nodes);
        count = nodes.length;
      }
      // Special: gift cards via REST (requires read_gift_cards scope)
      else if (type === 'giftCard') {
        let pageInfo = '';
        let page = 1;
        while (true) {
          const j: any = await restGet(`gift_cards.json?limit=50${pageInfo ? `&page_info=${pageInfo}` : ''}`).catch((e: any) => {
            return { _err: String(e.message || e) };
          });
          if (j._err) {
            await admin.from('cloner_logs').insert({
              migration_id: migration.id, tenant_id: migration.tenant_id, event: 'scan_type_skip', level: 'warn',
              object_type: type, message: `gift_cards: ${j._err}`,
            });
            break;
          }
          const nodes = (j.gift_cards || []).map((g: any) => ({
            ...g,
            id: `gift_card:${g.id}`,
            handle: g.code || g.masked_code || String(g.id),
          }));
          await storeNodes(type, nodes);
          count += nodes.length;
          if (!nodes.length || nodes.length < 50) break;
          page++;
          if (page > 50) break; // safety
          pageInfo = ''; // simplified — REST link-header pagination not parsed
          break;
        }
      }
      // Special: checkout branding (per profile)
      else if (type === 'checkoutBranding') {
        const profData: any = await gql(sourceAccess.domain, sourceAccess.token, sourceAccess.apiVersion, CHECKOUT_BRANDING_QUERY);
        const profiles = profData.checkoutProfiles?.nodes || [];
        for (const p of profiles) {
          try {
            const detail: any = await gql(sourceAccess.domain, sourceAccess.token, sourceAccess.apiVersion, CHECKOUT_BRANDING_DETAIL_QUERY, { id: p.id });
            const node = {
              id: `checkout_branding:${p.id}`,
              handle: p.name,
              profile: p,
              branding: detail.checkoutBranding,
            };
            await storeNodes(type, [node]);
            count++;
          } catch (e) {
            await admin.from('cloner_logs').insert({
              migration_id: migration.id, tenant_id: migration.tenant_id, event: 'scan_skip', level: 'warn',
              object_type: type, message: `${p.name}: ${(e as Error).message}`,
            });
          }
        }
      }
      else {
        const def = QUERIES[type];
        if (!def) {
          await admin.from('cloner_logs').insert({
            migration_id: migration.id, tenant_id: migration.tenant_id, event: 'scan_type_skip', level: 'warn',
            object_type: type, message: `no query for type ${type}`,
          });
          continue;
        }
        let cursor: string | null = partialMode ? (body.cursor || null) : null;
        let pagesScanned = 0;
        while (true) {
          const data: any = await gql(sourceAccess.domain, sourceAccess.token, sourceAccess.apiVersion, def.query, { cursor });
          const conn = data[def.field];
          const nodes: any[] = conn?.nodes || [];
          // Paginate product media beyond first 100
          if (type === 'product') {
            for (const n of nodes) {
              let mediaCursor: string | null = n.media?.pageInfo?.endCursor || null;
              let hasNext: boolean = !!n.media?.pageInfo?.hasNextPage;
              while (hasNext && mediaCursor) {
                const md: any = await gql(sourceAccess.domain, sourceAccess.token, sourceAccess.apiVersion, PRODUCT_MEDIA_QUERY, { id: n.id, cursor: mediaCursor });
                const more: any[] = md.product?.media?.nodes || [];
                n.media.nodes = [...(n.media.nodes || []), ...more];
                hasNext = !!md.product?.media?.pageInfo?.hasNextPage;
                mediaCursor = md.product?.media?.pageInfo?.endCursor || null;
              }
            }
          }
          await storeNodes(type, nodes);
          count += nodes.length;
          pagesScanned++;
          if (!conn?.pageInfo?.hasNextPage) break;
          cursor = conn.pageInfo.endCursor;
          if (partialMode && pagesScanned >= pageLimit) {
            partialNextCursor = cursor;
            partialDone = false;
            break;
          }
        }
      }

      const { count: storedCount } = await admin.from('cloner_migration_items')
        .select('id', { count: 'exact', head: true })
        .eq('migration_id', migration.id)
        .eq('object_type', type);
      stats[type] = storedCount ?? count;
      await admin.from('cloner_logs').insert({
        migration_id: migration.id, tenant_id: migration.tenant_id, event: 'scan_type_done',
        object_type: type, message: `${count} ${type}(s)`,
      });
      } catch (typeErr) {
        const msg = typeErr instanceof Error ? typeErr.message : String(typeErr);
        stats[type] = count;
        await admin.from('cloner_logs').insert({
          migration_id: migration.id, tenant_id: migration.tenant_id,
          event: 'scan_type_failed', level: 'error',
          object_type: type, message: `${type}: ${msg}`,
        });
        // Continue with next type instead of aborting whole scan
      }
    }

    await admin.from('cloner_migrations').update({
      status: partialMode ? 'scanning' : 'review',
      stats: { ...(migration.stats || {}), scanned: { ...((migration.stats as any)?.scanned || {}), ...stats } },
    }).eq('id', migration.id);

    return new Response(JSON.stringify({ ok: true, stats, done: partialDone, next_cursor: partialNextCursor }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('scan error', msg);
    try {
      if (migrationIdForCatch) {
        await admin.from('cloner_migrations').update({ status: 'failed', error: msg }).eq('id', migrationIdForCatch);
        await admin.from('cloner_logs').insert({ migration_id: migrationIdForCatch, tenant_id: tenantIdForCatch as any, event: 'scan_failed', level: 'error', message: msg } as any);
      }
    } catch { /* ignore */ }
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
