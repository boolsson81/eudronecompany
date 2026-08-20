import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import {
  productGid,
  resolveShopAccess,
  shopifyGraphql,
  shopifyRest,
  type ShopAccess,
} from "./cloner-shopify-access.ts";

type MigrationItem = {
  id: string;
  object_type: string;
  source_id: string;
  source_handle: string | null;
  source_payload: any;
  publish_status: string;
  target_id: string | null;
  target_handle: string | null;
  error: string | null;
};

type SampleRow = Record<string, string | number | null>;

export type FinalVerificationAudit = {
  ok: true;
  action: "final_verification_audit";
  generated_at: string;
  migration_id: string;
  migration_name: string;
  resolution: string;
  source_store: { id: string; label: string | null; domain: string | null } | null;
  target_store: { id: string; label: string | null; domain: string } | null;
  audit_scope: {
    read_only: true;
    sources: ["cloner_migration_items", "Shopify Admin API", "Shopify GraphQL"];
    writes: false;
  };
  sections: {
    products: SectionSourceTarget;
    collections: SectionSourceTarget;
    metafields: SectionMissingDifferent;
    variants: SectionMissingDifferent;
    inventory: SectionMissingDifferent;
    images: SectionMissingDifferent;
    pages: SectionSourceTarget;
    menus: SectionSourceTarget;
    seo: SectionMissingDifferent;
  };
  verdict: "GO" | "NO-GO";
  blockers: string[];
  product_progress?: { offset: number; limit: number; total_published: number; complete: boolean };
};

type SectionSourceTarget = {
  source_count: number;
  target_count: number;
  matched: number;
  missing: number;
  not_published?: number;
  different: number;
  publish_failed: number;
  samples_missing: SampleRow[];
  samples_different: SampleRow[];
};

type SectionMissingDifferent = {
  missing: number;
  different: number;
  samples_missing: SampleRow[];
  samples_different: SampleRow[];
};

const PRODUCT_AUDIT_QUERY = `
  query ProductAuditNodes($ids: [ID!]!) {
    nodes(ids: $ids) {
      id
      ... on Product {
        handle
        title
        vendor
        productType
        status
        seo { title description }
        metafields(first: 50) { nodes { namespace key value type } }
        media(first: 100) { nodes { ... on MediaImage { id image { url altText } } } }
        variants(first: 100) {
          nodes {
            id
            sku
            barcode
            price
            compareAtPrice
            inventoryQuantity
            inventoryItem { tracked measurement { weight { value unit } } }
            selectedOptions { name value }
          }
        }
      }
    }
  }
`;

const COLLECTIONS_QUERY = `
  query TargetCollections($cursor: String) {
    collections(first: 250, after: $cursor) {
      edges {
        cursor
        node { id handle title productsCount { count } ruleSet { rules { column } } }
      }
      pageInfo { hasNextPage }
    }
  }
`;

const PAGES_QUERY = `
  query TargetPages($cursor: String) {
    pages(first: 250, after: $cursor) {
      edges {
        cursor
        node { id handle title isPublished seo { title description } }
      }
      pageInfo { hasNextPage }
    }
  }
`;

const MENUS_QUERY = `
  query TargetMenus($cursor: String) {
    menus(first: 50, after: $cursor) {
      edges {
        cursor
        node { id handle title items { id title url type } }
      }
      pageInfo { hasNextPage }
    }
  }
`;

async function fetchMigrationItems(
  admin: SupabaseClient,
  migrationId: string,
  objectType?: string,
): Promise<MigrationItem[]> {
  const rows: MigrationItem[] = [];
  const pageSize = 1000;
  for (let from = 0; ; from += pageSize) {
    let q = admin
      .from("cloner_migration_items")
      .select("id,object_type,source_id,source_handle,source_payload,publish_status,target_id,target_handle,error")
      .eq("migration_id", migrationId)
      .order("source_handle", { ascending: true })
      .range(from, from + pageSize - 1);
    if (objectType) q = q.eq("object_type", objectType);
    const { data, error } = await q;
    if (error) throw error;
    rows.push(...((data || []) as MigrationItem[]));
    if (!data || data.length < pageSize) break;
  }
  return rows;
}

async function paginateGraphql<T>(
  access: ShopAccess,
  query: string,
  extract: (data: any) => { rows: T[]; hasNextPage: boolean; cursor: string | null },
  maxPages = 30,
): Promise<T[]> {
  const all: T[] = [];
  let cursor: string | null = null;
  for (let page = 0; page < maxPages; page++) {
    const data = await shopifyGraphql(access, query, { cursor });
    const { rows, hasNextPage, cursor: next } = extract(data);
    all.push(...rows);
    if (!hasNextPage) break;
    cursor = next;
  }
  return all;
}

function metafieldKey(m: { namespace?: string; key?: string }) {
  return `${m.namespace || ""}.${m.key || ""}`;
}

function metafieldsFromPayload(payload: any): Map<string, string> {
  const map = new Map<string, string>();
  const nodes = payload?.metafields?.nodes || payload?.metafields || [];
  for (const m of nodes) {
    const k = metafieldKey(m);
    if (k !== ".") map.set(k, String(m.value ?? ""));
  }
  return map;
}

function variantsFromPayload(payload: any) {
  const nodes = payload?.variants?.nodes || [];
  return nodes.map((v: any) => ({
    sku: String(v.sku || "").trim(),
    barcode: String(v.barcode || "").trim(),
    price: String(v.price || "").trim(),
    compareAtPrice: String(v.compareAtPrice || "").trim(),
    inventoryQuantity: Number(v.inventoryQuantity ?? 0),
    weight: v.inventoryItem?.measurement?.weight?.value ?? null,
    weightUnit: v.inventoryItem?.measurement?.weight?.unit ?? null,
  }));
}

function imageCountFromPayload(payload: any): number {
  const media = payload?.media?.nodes || [];
  return media.filter((m: any) => m?.image?.url).length;
}

function seoFromPayload(payload: any) {
  const seo = payload?.seo || {};
  return {
    title: String(seo.title || "").trim(),
    description: String(seo.description || "").trim(),
  };
}

function pushSample(list: SampleRow[], row: SampleRow, limit = 50) {
  if (list.length < limit) list.push(row);
}

function compareSourceTargetSection(
  sourceItems: MigrationItem[],
  targetByHandle: Map<string, any>,
  getHandle: (item: MigrationItem) => string,
): SectionSourceTarget {
  const section: SectionSourceTarget = {
    source_count: sourceItems.length,
    target_count: targetByHandle.size,
    matched: 0,
    missing: 0,
    different: 0,
    publish_failed: sourceItems.filter((i) => i.publish_status === "failed").length,
    samples_missing: [],
    samples_different: [],
  };

  for (const item of sourceItems) {
    const handle = getHandle(item);
    if (!handle) continue;
    const target = targetByHandle.get(handle);
    if (!target) {
      section.missing++;
      pushSample(section.samples_missing, {
        handle,
        title: String(item.source_payload?.title || ""),
        publish_status: item.publish_status,
        target_id: item.target_id,
        reason: item.publish_status === "failed" ? "publish_failed" : "not_on_target",
      });
      continue;
    }
    section.matched++;
    const srcTitle = String(item.source_payload?.title || "").trim();
    const tgtTitle = String(target.title || "").trim();
    if (srcTitle && tgtTitle && srcTitle !== tgtTitle) {
      section.different++;
      pushSample(section.samples_different, { handle, field: "title", source: srcTitle, target: tgtTitle });
    }
  }
  return section;
}

async function fetchTargetProducts(
  access: ShopAccess,
  gids: string[],
): Promise<Map<string, any>> {
  const byGid = new Map<string, any>();
  const batchSize = 50;
  for (let i = 0; i < gids.length; i += batchSize) {
    const batch = gids.slice(i, i + batchSize);
    const data = await shopifyGraphql(access, PRODUCT_AUDIT_QUERY, { ids: batch });
    const nodes = Array.isArray(data?.nodes) ? data.nodes : [];
    for (let j = 0; j < batch.length; j++) {
      const node = nodes[j];
      byGid.set(batch[j], node?.handle ? node : null);
    }
  }
  return byGid;
}

export async function buildClonerFinalVerificationAudit(
  admin: SupabaseClient,
  opts: {
    migrationId: string;
    migrationName: string;
    resolution: string;
    sourceStore: { id: string; label?: string | null; shop_domain?: string | null } | null;
    targetStore: { id: string; label?: string | null; shop_domain?: string | null; access_token?: string | null; api_version?: string | null };
    productOffset?: number;
    productLimit?: number;
  },
): Promise<FinalVerificationAudit> {
  const productOffset = Math.max(0, Number(opts.productOffset) || 0);
  const productLimit = Math.max(1, Math.min(Number(opts.productLimit) || 800, 2000));

  const [allItems, targetAccess] = await Promise.all([
    fetchMigrationItems(admin, opts.migrationId),
    resolveShopAccess(opts.targetStore),
  ]);

  const byType = new Map<string, MigrationItem[]>();
  for (const item of allItems) {
    const list = byType.get(item.object_type) || [];
    list.push(item);
    byType.set(item.object_type, list);
  }

  const productItems = byType.get("product") || [];
  const collectionItems = byType.get("collection") || [];
  const pageItems = byType.get("page") || [];
  const menuItems = byType.get("menu") || [];

  const publishedProducts = productItems.filter((p) => p.publish_status === "published");
  const productSlice = publishedProducts.slice(productOffset, productOffset + productLimit);

  const notPublishedCount = productItems.filter((p) => p.publish_status !== "published").length;

  const [targetCollections, targetPages, targetMenus, targetProductCount] = await Promise.all([
    paginateGraphql(targetAccess, COLLECTIONS_QUERY, (data) => ({
      rows: (data?.collections?.edges || []).map((e: any) => e.node).filter((n: any) => n?.handle),
      hasNextPage: !!data?.collections?.pageInfo?.hasNextPage,
      cursor: data?.collections?.edges?.at(-1)?.cursor ?? null,
    })),
    paginateGraphql(targetAccess, PAGES_QUERY, (data) => ({
      rows: (data?.pages?.edges || []).map((e: any) => e.node).filter((n: any) => n?.handle),
      hasNextPage: !!data?.pages?.pageInfo?.hasNextPage,
      cursor: data?.pages?.edges?.at(-1)?.cursor ?? null,
    })),
    paginateGraphql(targetAccess, MENUS_QUERY, (data) => ({
      rows: (data?.menus?.edges || []).map((e: any) => e.node).filter((n: any) => n?.handle),
      hasNextPage: !!data?.menus?.pageInfo?.hasNextPage,
      cursor: data?.menus?.edges?.at(-1)?.cursor ?? null,
    })),
    shopifyRest(targetAccess, "GET", "products/count.json").then((r) => Number(r?.count ?? 0)).catch(() => 0),
  ]);

  const targetCollectionsByHandle = new Map(targetCollections.map((c: any) => [String(c.handle), c]));
  const targetPagesByHandle = new Map(targetPages.map((p: any) => [String(p.handle), p]));
  const targetMenusByHandle = new Map(targetMenus.map((m: any) => [String(m.handle), m]));

  const collections = compareSourceTargetSection(
    collectionItems,
    targetCollectionsByHandle,
    (i) => String(i.source_handle || i.source_payload?.handle || "").trim(),
  );

  const pages = compareSourceTargetSection(
    pageItems,
    targetPagesByHandle,
    (i) => String(i.source_handle || i.source_payload?.handle || "").trim(),
  );

  const menus = compareSourceTargetSection(
    menuItems,
    targetMenusByHandle,
    (i) => String(i.source_handle || i.source_payload?.handle || "").trim(),
  );

  const metafields: SectionMissingDifferent = { missing: 0, different: 0, samples_missing: [], samples_different: [] };
  const variants: SectionMissingDifferent = { missing: 0, different: 0, samples_missing: [], samples_different: [] };
  const inventory: SectionMissingDifferent = { missing: 0, different: 0, samples_missing: [], samples_different: [] };
  const images: SectionMissingDifferent = { missing: 0, different: 0, samples_missing: [], samples_different: [] };
  const seo: SectionMissingDifferent = { missing: 0, different: 0, samples_missing: [], samples_different: [] };

  const products: SectionSourceTarget = {
    source_count: productItems.length,
    target_count: targetProductCount,
    matched: 0,
    missing: 0,
    not_published: notPublishedCount,
    different: 0,
    publish_failed: productItems.filter((i) => i.publish_status === "failed").length,
    samples_missing: [],
    samples_different: [],
  };

  const gids = productSlice
    .map((p) => productGid(p.target_id))
    .filter((g): g is string => !!g);

  const targetProductsByGid = await fetchTargetProducts(targetAccess, gids);
  const gidByItemId = new Map<string, string>();
  for (const item of productSlice) {
    const gid = productGid(item.target_id);
    if (gid) gidByItemId.set(item.id, gid);
  }

  for (const item of productSlice) {
    const handle = String(item.source_handle || item.source_payload?.handle || "").trim();
    const gid = gidByItemId.get(item.id);
    const target = gid ? targetProductsByGid.get(gid) : null;
    const payload = item.source_payload || {};

    if (!gid || !target) {
      products.missing++;
      pushSample(products.samples_missing, {
        handle,
        publish_status: item.publish_status,
        target_id: item.target_id,
        reason: gid ? "shopify_product_missing" : "missing_target_id",
      });
      continue;
    }

    products.matched++;
    const srcTitle = String(payload.title || "").trim();
    const tgtTitle = String(target.title || "").trim();
    if (srcTitle && tgtTitle && srcTitle !== tgtTitle) {
      products.different++;
      pushSample(products.samples_different, { handle, field: "title", source: srcTitle, target: tgtTitle });
    }

    const srcMf = metafieldsFromPayload(payload);
    const tgtMf = metafieldsFromPayload(target);
    for (const [key, srcVal] of srcMf) {
      if (!tgtMf.has(key)) {
        metafields.missing++;
        pushSample(metafields.samples_missing, { handle, metafield: key, source_value: srcVal });
      } else if (tgtMf.get(key) !== srcVal) {
        metafields.different++;
        pushSample(metafields.samples_different, {
          handle,
          metafield: key,
          source: srcVal,
          target: tgtMf.get(key) || "",
        });
      }
    }

    const srcVars = variantsFromPayload(payload);
    const tgtVars = (target.variants?.nodes || []).map((v: any) => ({
      sku: String(v.sku || "").trim(),
      barcode: String(v.barcode || "").trim(),
      price: String(v.price || "").trim(),
      compareAtPrice: String(v.compareAtPrice || "").trim(),
      inventoryQuantity: Number(v.inventoryQuantity ?? 0),
      weight: v.inventoryItem?.measurement?.weight?.value ?? null,
      weightUnit: v.inventoryItem?.measurement?.weight?.unit ?? null,
    }));
    const tgtBySku = new Map(tgtVars.filter((v) => v.sku).map((v) => [v.sku, v]));

    for (const sv of srcVars) {
      if (!sv.sku) continue;
      const tv = tgtBySku.get(sv.sku);
      if (!tv) {
        variants.missing++;
        pushSample(variants.samples_missing, { handle, sku: sv.sku });
        continue;
      }
      if (sv.price !== tv.price || sv.barcode !== tv.barcode) {
        variants.different++;
        pushSample(variants.samples_different, {
          handle,
          sku: sv.sku,
          source_price: sv.price,
          target_price: tv.price,
        });
      }
      if (sv.inventoryQuantity !== tv.inventoryQuantity) {
        inventory.different++;
        pushSample(inventory.samples_different, {
          handle,
          sku: sv.sku,
          source_qty: sv.inventoryQuantity,
          target_qty: tv.inventoryQuantity,
        });
      }
    }

    const srcImg = imageCountFromPayload(payload);
    const tgtImg = (target.media?.nodes || []).filter((m: any) => m?.image?.url).length;
    if (srcImg > tgtImg) {
      images.missing += srcImg - tgtImg;
      pushSample(images.samples_missing, { handle, source_images: srcImg, target_images: tgtImg });
    } else if (srcImg !== tgtImg) {
      images.different++;
      pushSample(images.samples_different, { handle, source_images: srcImg, target_images: tgtImg });
    }

    const srcSeo = seoFromPayload(payload);
    const tgtSeo = seoFromPayload(target);
    if (srcSeo.title && !tgtSeo.title) {
      seo.missing++;
      pushSample(seo.samples_missing, { handle, field: "seo.title", source: srcSeo.title });
    } else if (srcSeo.title && tgtSeo.title && srcSeo.title !== tgtSeo.title) {
      seo.different++;
      pushSample(seo.samples_different, { handle, field: "seo.title", source: srcSeo.title, target: tgtSeo.title });
    }
    if (srcSeo.description && !tgtSeo.description) {
      seo.missing++;
      pushSample(seo.samples_missing, { handle, field: "seo.description", source: srcSeo.description.slice(0, 80) });
    } else if (srcSeo.description && tgtSeo.description && srcSeo.description !== tgtSeo.description) {
      seo.different++;
      pushSample(seo.samples_different, {
        handle,
        field: "seo.description",
        source: srcSeo.description.slice(0, 80),
        target: tgtSeo.description.slice(0, 80),
      });
    }
  }

  const productComplete = productOffset + productLimit >= publishedProducts.length;
  const blockers: string[] = [];

  const productsMissingTotal = notPublishedCount + products.missing;
  products.missing = productsMissingTotal;

  if (products.publish_failed > 0) blockers.push(`${products.publish_failed} product publish failures in migration`);
  if (collections.missing > 0) blockers.push(`${collections.missing} source collections missing on target`);
  if (pages.missing > 0) blockers.push(`${pages.missing} source pages missing on target`);
  if (menus.missing > 0) blockers.push(`${menus.missing} source menus missing on target`);
  if (productComplete && productsMissingTotal > 0) blockers.push(`${productsMissingTotal} products missing or not published on target`);
  if (productComplete && metafields.missing > 0) blockers.push(`${metafields.missing} product metafields missing on target`);
  if (productComplete && variants.missing > 0) blockers.push(`${variants.missing} variants missing on target`);
  if (productComplete && inventory.different > 0) blockers.push(`${inventory.different} inventory quantity mismatches`);
  if (productComplete && images.missing > 0) blockers.push(`${images.missing} image gaps across verified products`);
  if (productComplete && seo.missing > 0) blockers.push(`${seo.missing} SEO fields missing on target`);
  if (!productComplete) blockers.push(`product deep-verify incomplete (${productOffset + productLimit}/${publishedProducts.length} published products checked)`);

  const verdict: "GO" | "NO-GO" = blockers.length === 0 ? "GO" : "NO-GO";

  return {
    ok: true,
    action: "final_verification_audit",
    generated_at: new Date().toISOString(),
    migration_id: opts.migrationId,
    migration_name: opts.migrationName,
    resolution: opts.resolution,
    source_store: opts.sourceStore
      ? { id: opts.sourceStore.id, label: opts.sourceStore.label ?? null, domain: opts.sourceStore.shop_domain ?? null }
      : null,
    target_store: {
      id: opts.targetStore.id,
      label: opts.targetStore.label ?? null,
      domain: targetAccess.domain,
    },
    audit_scope: {
      read_only: true,
      sources: ["cloner_migration_items", "Shopify Admin API", "Shopify GraphQL"],
      writes: false,
    },
    sections: {
      products,
      collections,
      metafields,
      variants,
      inventory,
      images,
      pages,
      menus,
      seo,
    },
    verdict,
    blockers,
    product_progress: {
      offset: productOffset,
      limit: productLimit,
      total_published: publishedProducts.length,
      complete: productComplete,
    },
  };
}
