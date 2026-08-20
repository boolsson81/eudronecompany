import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import {
  productGid,
  resolveShopAccess,
  shopifyGraphql,
  shopifyRest,
  type ShopAccess,
} from "./cloner-shopify-access.ts";

const MIGRATION_ID_DEFAULT = "3d9876af-885c-49e9-a4b0-c4943c06112f";

export type MenuClassification =
  | "Required"
  | "Legacy"
  | "Empty"
  | "Duplicate"
  | "Candidate for removal";

export type MenuAuditRow = {
  handle: string;
  title: string;
  item_count: number;
  last_updated: string | null;
  classification: MenuClassification;
  classifications: MenuClassification[];
  recommendation: string;
  in_source_migration: boolean;
  migration_publish_status: string | null;
};

export type CollectionRecoveryRow = {
  handle: string;
  title: string;
  source_collection_gid: string;
  target_collection_gid: string | null;
  source_product_count: number;
  target_product_count_before: number;
  added_products: number;
  added_handles_sample: string[];
  final_product_count: number;
  skipped_unmapped: number;
  error: string | null;
};

export type MigrationRecoveryPassResult = {
  ok: true;
  action: string;
  generated_at: string;
  migration_id: string;
  migration_name: string;
  source_domain: string;
  target_domain: string;
  menu_audit?: {
    total_menus: number;
    by_classification: Record<string, number>;
    menus: MenuAuditRow[];
    recommendations: string[];
  };
  collection_recovery?: {
    collections_processed: number;
    total_added: number;
    rows: CollectionRecoveryRow[];
  };
  quality_audit?: {
    products: Record<string, number>;
    collections: Record<string, number>;
    menus: Record<string, number>;
    samples: Record<string, unknown[]>;
    product_progress: { offset: number; limit: number; total: number; complete: boolean };
  };
  readiness?: {
    completion_percent: number;
    critical_blockers: string[];
    recommended_next_actions: string[];
    estimated_effort_remaining: string;
    deferred_items: string[];
  };
};

const TARGET_MENUS_QUERY = `
  query TargetMenusDetail($cursor: String) {
    menus(first: 50, after: $cursor) {
      edges {
        cursor
        node {
          id
          handle
          title
          updatedAt
          isDefault
          items {
            id
            title
            url
            type
            items {
              id
              title
              url
              type
              items { id title url type }
            }
          }
        }
      }
      pageInfo { hasNextPage }
    }
  }
`;

const COLLECTION_PRODUCTS_QUERY = `
  query CollectionProducts($id: ID!, $cursor: String) {
    collection(id: $id) {
      id
      handle
      productsCount { count }
      products(first: 250, after: $cursor) {
        edges { node { id handle } cursor }
        pageInfo { hasNextPage }
      }
    }
  }
`;

const ADD_PRODUCTS_MUTATION = `
  mutation CollectionAddProducts($id: ID!, $productIds: [ID!]!) {
    collectionAddProducts(id: $id, productIds: $productIds) {
      collection { id productsCount { count } }
      userErrors { field message }
    }
  }
`;

const LIVE_COLLECTIONS_QUERY = `
  query LiveCollections($cursor: String) {
    collections(first: 250, after: $cursor) {
      edges {
        cursor
        node { id handle title productsCount { count } ruleSet { rules { column } } }
      }
      pageInfo { hasNextPage }
    }
  }
`;

const LIVE_PAGES_QUERY = `
  query LivePages($cursor: String) {
    pages(first: 250, after: $cursor) {
      edges {
        cursor
        node { id handle title isPublished }
      }
      pageInfo { hasNextPage }
    }
  }
`;

const PRODUCT_SAMPLE_QUERY = `
  query ProductAuditSample($ids: [ID!]!) {
    nodes(ids: $ids) {
      id
      ... on Product {
        handle
        status
        media(first: 5) { nodes { ... on MediaImage { image { url } } } }
        variants(first: 5) { nodes { id sku inventoryQuantity } }
        metafields(first: 10) { nodes { namespace key value } }
      }
    }
  }
`;

function collectionGid(id: string | null | undefined): string | null {
  if (!id) return null;
  const s = String(id).trim();
  if (!s) return null;
  if (s.startsWith("gid://shopify/Collection/")) return s;
  return `gid://shopify/Collection/${s.replace(/^Collection\//, "")}`;
}

function countMenuItems(items: any[]): number {
  let n = 0;
  for (const it of items || []) {
    n += 1;
    if (it.items?.length) n += countMenuItems(it.items);
  }
  return n;
}

async function paginateGraphql<T>(
  access: ShopAccess,
  query: string,
  extract: (data: any) => { rows: T[]; hasNextPage: boolean; cursor: string | null },
  maxPages = 20,
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

async function fetchCollectionProductGids(access: ShopAccess, collectionGidValue: string): Promise<string[]> {
  const gids: string[] = [];
  let cursor: string | null = null;
  for (let page = 0; page < 40; page++) {
    const data = await shopifyGraphql(access, COLLECTION_PRODUCTS_QUERY, {
      id: collectionGidValue,
      cursor,
    });
    const col = data?.collection;
    if (!col) break;
    const edges = col.products?.edges || [];
    for (const e of edges) {
      if (e?.node?.id) gids.push(String(e.node.id));
    }
    if (!col.products?.pageInfo?.hasNextPage) break;
    cursor = edges.length ? edges[edges.length - 1].cursor : null;
  }
  return gids;
}

async function fetchProductMappings(
  admin: SupabaseClient,
  migrationId: string,
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  for (let from = 0; ; from += 1000) {
    const { data, error } = await admin
      .from("cloner_object_mappings")
      .select("source_id,target_id")
      .eq("migration_id", migrationId)
      .eq("object_type", "product")
      .range(from, from + 999);
    if (error) throw error;
    for (const row of data || []) {
      if (row.source_id && row.target_id) map.set(String(row.source_id), String(row.target_id));
    }
    if (!data || data.length < 1000) break;
  }
  return map;
}

async function fetchSmartToCustomCollections(
  admin: SupabaseClient,
  migrationId: string,
): Promise<Array<{ id: string; source_handle: string; source_id: string; target_id: string | null; title: string; source_gid: string }>> {
  const { data: logs } = await admin
    .from("cloner_logs")
    .select("metadata")
    .eq("migration_id", migrationId)
    .eq("event", "collection_smart_to_custom_fallback");

  const handlesFromLogs = new Set(
    (logs || []).map((l: any) => String(l.metadata?.handle || "")).filter(Boolean),
  );

  const { data: items, error } = await admin
    .from("cloner_migration_items")
    .select("id,source_handle,source_id,target_id,source_payload,publish_status")
    .eq("migration_id", migrationId)
    .eq("object_type", "collection");
  if (error) throw error;

  const out: Array<{ id: string; source_handle: string; source_id: string; target_id: string | null; title: string; source_gid: string }> = [];
  for (const item of items || []) {
    const payload = item.source_payload as any;
    const hasRules = (payload?.ruleSet?.rules?.length || 0) > 0;
    const handle = String(item.source_handle || payload?.handle || "");
    const inLogs = handlesFromLogs.has(handle);
    if (!hasRules && !inLogs) continue;
    if (item.publish_status !== "published" || !item.target_id) continue;
    const sourceGid = collectionGid(item.source_id) || collectionGid(payload?.id) || "";
    if (!sourceGid) continue;
    out.push({
      id: item.id,
      source_handle: handle,
      source_id: String(item.source_id || ""),
      target_id: item.target_id ? String(item.target_id) : null,
      title: String(payload?.title || handle),
      source_gid: sourceGid,
    });
  }
  out.sort((a, b) => a.source_handle.localeCompare(b.source_handle));
  return out;
}

function classifyMenu(
  menu: { handle: string; title: string; item_count: number },
  migrationByHandle: Map<string, { publish_status: string }>,
  titleCounts: Map<string, number>,
): { classification: MenuClassification; classifications: MenuClassification[]; recommendation: string } {
  const classifications: MenuClassification[] = [];
  const mig = migrationByHandle.get(menu.handle);
  const inMigration = !!mig;
  const essentialHandles = new Set([
    "main-menu",
    "footer",
    "customer-account-main-menu",
    "customer-account-menu",
  ]);

  if (menu.item_count === 0) classifications.push("Empty");
  if (inMigration || essentialHandles.has(menu.handle)) classifications.push("Required");
  if (!inMigration) classifications.push("Legacy");
  if ((titleCounts.get(menu.title.toLowerCase()) || 0) > 1) classifications.push("Duplicate");

  if (!classifications.includes("Required") && menu.item_count === 0) {
    classifications.push("Candidate for removal");
  }
  if (classifications.includes("Duplicate") && !classifications.includes("Required")) {
    classifications.push("Candidate for removal");
  }
  if (classifications.includes("Legacy") && menu.item_count === 0) {
    if (!classifications.includes("Candidate for removal")) classifications.push("Candidate for removal");
  }

  const classification = classifications.includes("Required")
    ? "Required"
    : classifications.includes("Candidate for removal")
    ? "Candidate for removal"
    : classifications[0] || "Legacy";

  let recommendation = "Keep — no action required.";
  if (classification === "Candidate for removal") {
    recommendation = "Review for manual removal after confirming theme does not reference this menu. Do NOT auto-delete.";
  } else if (classification === "Duplicate") {
    recommendation = "Consolidate duplicate menus manually; keep the migration-linked or theme-active handle.";
  } else if (classification === "Empty") {
    recommendation = "Populate items or mark for removal during theme cleanup.";
  } else if (classification === "Legacy") {
    recommendation = "Retain until theme/menu strategy is finalized; may be replaced by migrated menus.";
  } else if (mig?.publish_status === "failed") {
    recommendation = "Required menu failed migration — resolve Shopify menu limit or prune items before re-publish.";
  }

  return { classification, classifications: [...new Set(classifications)], recommendation };
}

export async function buildMenuAudit(
  admin: SupabaseClient,
  opts: {
    migrationId: string;
    targetStore: { shop_domain?: string | null; access_token?: string | null; api_version?: string | null };
  },
): Promise<MigrationRecoveryPassResult["menu_audit"]> {
  const targetAccess = await resolveShopAccess(opts.targetStore);

  const { data: menuItems } = await admin
    .from("cloner_migration_items")
    .select("source_handle,publish_status,error")
    .eq("migration_id", opts.migrationId)
    .eq("object_type", "menu");

  const migrationByHandle = new Map(
    (menuItems || []).map((m: any) => [String(m.source_handle), { publish_status: String(m.publish_status), error: m.error }]),
  );

  const liveMenus = await paginateGraphql(targetAccess, TARGET_MENUS_QUERY, (data) => ({
    rows: (data?.menus?.edges || []).map((e: any) => e.node).filter((n: any) => n?.handle),
    hasNextPage: !!data?.menus?.pageInfo?.hasNextPage,
    cursor: data?.menus?.edges?.at(-1)?.cursor ?? null,
  }));

  const titleCounts = new Map<string, number>();
  for (const m of liveMenus) {
    const t = String(m.title || "").toLowerCase();
    titleCounts.set(t, (titleCounts.get(t) || 0) + 1);
  }

  const menus: MenuAuditRow[] = liveMenus.map((m: any) => {
    const item_count = countMenuItems(m.items || []);
    const mig = migrationByHandle.get(String(m.handle));
    const { classification, classifications, recommendation } = classifyMenu(
      { handle: String(m.handle), title: String(m.title || m.handle), item_count },
      migrationByHandle,
      titleCounts,
    );
    return {
      handle: String(m.handle),
      title: String(m.title || m.handle),
      item_count,
      last_updated: m.updatedAt ? String(m.updatedAt) : null,
      last_updated: null,
      classification,
      classifications,
      recommendation,
      in_source_migration: !!mig,
      migration_publish_status: mig?.publish_status ?? null,
    };
  });

  menus.sort((a, b) => a.handle.localeCompare(b.handle));

  const by_classification: Record<string, number> = {};
  for (const m of menus) {
    by_classification[m.classification] = (by_classification[m.classification] || 0) + 1;
  }

  const recommendations: string[] = [];
  const failedMigration = (menuItems || []).filter((m: any) => m.publish_status === "failed");
  const limitFailures = failedMigration.filter((m: any) => String(m.error || "").includes("limit of menus"));
  if (limitFailures.length) {
    recommendations.push(
      `${limitFailures.length} source menu(s) failed due to Shopify menu limit — free a slot or merge legacy menus before re-publishing: ${limitFailures.map((m: any) => m.source_handle).join(", ")}`,
    );
  }
  const removalCandidates = menus.filter((m) => m.classification === "Candidate for removal");
  if (removalCandidates.length) {
    recommendations.push(
      `${removalCandidates.length} menu(s) are candidates for manual removal (empty/duplicate/legacy) — review before deleting.`,
    );
  }
  recommendations.push("Do NOT auto-delete any menu. All removals must be manual after theme verification.");

  return {
    total_menus: menus.length,
    by_classification,
    menus,
    recommendations,
  };
}

export async function runCollectionMembershipRecovery(
  admin: SupabaseClient,
  opts: {
    migrationId: string;
    sourceStore: { shop_domain?: string | null; access_token?: string | null; api_version?: string | null };
    targetStore: { shop_domain?: string | null; access_token?: string | null; api_version?: string | null };
    dryRun?: boolean;
  },
): Promise<MigrationRecoveryPassResult["collection_recovery"]> {
  const [sourceAccess, targetAccess, collections, productMap] = await Promise.all([
    resolveShopAccess(opts.sourceStore),
    resolveShopAccess(opts.targetStore),
    fetchSmartToCustomCollections(admin, opts.migrationId),
    fetchProductMappings(admin, opts.migrationId),
  ]);

  const rows: CollectionRecoveryRow[] = [];
  let totalAdded = 0;

  for (const col of collections) {
    const row: CollectionRecoveryRow = {
      handle: col.source_handle,
      title: col.title,
      source_collection_gid: col.source_gid,
      target_collection_gid: collectionGid(col.target_id),
      source_product_count: 0,
      target_product_count_before: 0,
      added_products: 0,
      added_handles_sample: [],
      final_product_count: 0,
      skipped_unmapped: 0,
      error: null,
    };

    try {
      const [sourceGids, targetGidsBefore] = await Promise.all([
        fetchCollectionProductGids(sourceAccess, col.source_gid),
        col.target_id ? fetchCollectionProductGids(targetAccess, collectionGid(col.target_id)!) : Promise.resolve([]),
      ]);

      row.source_product_count = sourceGids.length;
      row.target_product_count_before = targetGidsBefore.length;

      const targetBeforeSet = new Set(targetGidsBefore);
      const toAdd: string[] = [];
      const addedHandles: string[] = [];

      for (const srcGid of sourceGids) {
        const tgtId = productMap.get(srcGid);
        if (!tgtId) {
          row.skipped_unmapped++;
          continue;
        }
        const tgtGid = productGid(tgtId);
        if (!tgtGid || targetBeforeSet.has(tgtGid)) continue;
        toAdd.push(tgtGid);
      }

      if (!opts.dryRun && toAdd.length > 0 && row.target_collection_gid) {
        const batchSize = 100;
        for (let i = 0; i < toAdd.length; i += batchSize) {
          const batch = toAdd.slice(i, i + batchSize);
          const data = await shopifyGraphql(targetAccess, ADD_PRODUCTS_MUTATION, {
            id: row.target_collection_gid,
            productIds: batch,
          });
          const errs = data?.collectionAddProducts?.userErrors;
          if (errs?.length) throw new Error(JSON.stringify(errs));
        }
      }

      row.added_products = toAdd.length;
      totalAdded += toAdd.length;

      if (toAdd.length > 0 && row.target_collection_gid) {
        const after = await fetchCollectionProductGids(targetAccess, row.target_collection_gid);
        row.final_product_count = after.length;
        const srcHandles = await shopifyGraphql(targetAccess, PRODUCT_SAMPLE_QUERY, {
          ids: toAdd.slice(0, 10),
        });
        for (const n of srcHandles?.nodes || []) {
          if (n?.handle) addedHandles.push(String(n.handle));
        }
      } else {
        row.final_product_count = row.target_product_count_before;
      }
      row.added_handles_sample = addedHandles.slice(0, 10);
    } catch (e) {
      row.error = e instanceof Error ? e.message : String(e);
    }

    rows.push(row);
  }

  return {
    collections_processed: rows.length,
    total_added: totalAdded,
    rows,
  };
}

function urlHandle(url: string, segment: string): string | null {
  const m = String(url || "").match(new RegExp(`/${segment}/([^/?#]+)`));
  return m ? m[1] : null;
}

export async function buildQualityAudit(
  admin: SupabaseClient,
  opts: {
    migrationId: string;
    targetStore: { shop_domain?: string | null; access_token?: string | null; api_version?: string | null };
    productOffset?: number;
    productLimit?: number;
  },
): Promise<MigrationRecoveryPassResult["quality_audit"]> {
  const productOffset = Math.max(0, Number(opts.productOffset) || 0);
  const productLimit = Math.max(1, Math.min(Number(opts.productLimit) || 200, 500));
  const targetAccess = await resolveShopAccess(opts.targetStore);

  const [{ data: publishedProducts, count: publishedTotal }, liveCollections, livePages, liveMenus] = await Promise.all([
    admin
      .from("cloner_migration_items")
      .select("id,target_id,source_handle,source_payload", { count: "exact" })
      .eq("migration_id", opts.migrationId)
      .eq("object_type", "product")
      .eq("publish_status", "published")
      .order("source_handle", { ascending: true })
      .range(productOffset, productOffset + productLimit - 1),
    paginateGraphql(targetAccess, LIVE_COLLECTIONS_QUERY, (data) => ({
      rows: (data?.collections?.edges || []).map((e: any) => e.node).filter((n: any) => n?.handle),
      hasNextPage: !!data?.collections?.pageInfo?.hasNextPage,
      cursor: data?.collections?.edges?.at(-1)?.cursor ?? null,
    })),
    paginateGraphql(targetAccess, LIVE_PAGES_QUERY, (data) => ({
      rows: (data?.pages?.edges || []).map((e: any) => e.node).filter((n: any) => n?.handle),
      hasNextPage: !!data?.pages?.pageInfo?.hasNextPage,
      cursor: data?.pages?.edges?.at(-1)?.cursor ?? null,
    })),
    paginateGraphql(targetAccess, TARGET_MENUS_QUERY, (data) => ({
      rows: (data?.menus?.edges || []).map((e: any) => e.node).filter((n: any) => n?.handle),
      hasNextPage: !!data?.menus?.pageInfo?.hasNextPage,
      cursor: data?.menus?.edges?.at(-1)?.cursor ?? null,
    })),
  ]);

  const collectionHandles = new Set(liveCollections.map((c: any) => String(c.handle)));
  const pageHandles = new Set(livePages.map((p: any) => String(p.handle)));
  const emptyCollections = liveCollections.filter((c: any) => (c.productsCount?.count ?? 0) === 0);

  const products = {
    checked: publishedProducts?.length || 0,
    missing_images: 0,
    missing_variants: 0,
    zero_inventory: 0,
    missing_metafields: 0,
    not_active: 0,
  };
  const samples: Record<string, unknown[]> = {
    missing_images: [],
    missing_variants: [],
    zero_inventory: [],
    missing_metafields: [],
    not_active: [],
    broken_menu_collection_links: [],
    broken_menu_page_links: [],
    broken_menu_account_links: [],
    empty_collections: [],
  };

  const gids = (publishedProducts || [])
    .map((p: any) => productGid(p.target_id))
    .filter((g): g is string => !!g);

  for (let i = 0; i < gids.length; i += 50) {
    const batch = gids.slice(i, i + 50);
    const data = await shopifyGraphql(targetAccess, PRODUCT_SAMPLE_QUERY, { ids: batch });
    for (const node of data?.nodes || []) {
      if (!node?.handle) continue;
      const handle = String(node.handle);
      const media = (node.media?.nodes || []).filter((m: any) => m?.image?.url);
      const variants = node.variants?.nodes || [];
      const mfs = node.metafields?.nodes || [];
      if (media.length === 0) {
        products.missing_images++;
        if (samples.missing_images.length < 20) samples.missing_images.push({ handle });
      }
      if (variants.length === 0) {
        products.missing_variants++;
        if (samples.missing_variants.length < 20) samples.missing_variants.push({ handle });
      }
      if (variants.some((v: any) => Number(v.inventoryQuantity ?? 0) === 0)) {
        products.zero_inventory++;
        if (samples.zero_inventory.length < 20) samples.zero_inventory.push({ handle });
      }
      if (mfs.length === 0) {
        products.missing_metafields++;
        if (samples.missing_metafields.length < 20) samples.missing_metafields.push({ handle });
      }
      if (String(node.status || "").toUpperCase() !== "ACTIVE") {
        products.not_active++;
        if (samples.not_active.length < 20) samples.not_active.push({ handle, status: node.status });
      }
    }
  }

  let brokenCollectionLinks = 0;
  let brokenPageLinks = 0;
  let brokenAccountLinks = 0;

  function walkMenuItems(items: any[]) {
    for (const it of items || []) {
      const type = String(it.type || "").toUpperCase();
      if (type === "COLLECTION") {
        const h = urlHandle(it.url, "collections");
        if (!h || !collectionHandles.has(h)) {
          brokenCollectionLinks++;
          if (samples.broken_menu_collection_links.length < 30) {
            samples.broken_menu_collection_links.push({ menu_item: it.title, url: it.url, handle: h });
          }
        }
      } else if (type === "PAGE") {
        const h = urlHandle(it.url, "pages");
        if (!h || !pageHandles.has(h)) {
          brokenPageLinks++;
          if (samples.broken_menu_page_links.length < 30) {
            samples.broken_menu_page_links.push({ menu_item: it.title, url: it.url, handle: h });
          }
        }
      } else if (type === "CUSTOMER_ACCOUNT_PAGE") {
        brokenAccountLinks++;
        if (samples.broken_menu_account_links.length < 20) {
          samples.broken_menu_account_links.push({ menu_item: it.title, url: it.url });
        }
      }
      if (it.items?.length) walkMenuItems(it.items);
    }
  }

  for (const menu of liveMenus) walkMenuItems(menu.items || []);

  for (const c of emptyCollections.slice(0, 30)) {
    samples.empty_collections.push({ handle: c.handle, title: c.title });
  }

  const { count: migrationCollections } = await admin
    .from("cloner_migration_items")
    .select("id", { count: "exact", head: true })
    .eq("migration_id", opts.migrationId)
    .eq("object_type", "collection")
    .eq("publish_status", "published");

  const total = publishedTotal ?? 0;
  const complete = productOffset + productLimit >= total;

  return {
    products,
    collections: {
      live_on_target: liveCollections.length,
      migration_published: migrationCollections ?? 0,
      empty_on_target: emptyCollections.length,
      missing_vs_migration: Math.max(0, (migrationCollections ?? 0) - liveCollections.length),
    },
    menus: {
      live_on_target: liveMenus.length,
      broken_collection_links: brokenCollectionLinks,
      broken_page_links: brokenPageLinks,
      broken_customer_account_links: brokenAccountLinks,
    },
    samples,
    product_progress: {
      offset: productOffset,
      limit: productLimit,
      total,
      complete,
    },
  };
}

export async function buildReadinessScore(
  admin: SupabaseClient,
  opts: {
    migrationId: string;
    menuAudit?: MigrationRecoveryPassResult["menu_audit"];
    collectionRecovery?: MigrationRecoveryPassResult["collection_recovery"];
    qualityAudit?: MigrationRecoveryPassResult["quality_audit"];
  },
): Promise<MigrationRecoveryPassResult["readiness"]> {
  const counts = await Promise.all([
    admin.from("cloner_migration_items").select("id", { count: "exact", head: true }).eq("migration_id", opts.migrationId).eq("object_type", "product").eq("publish_status", "published"),
    admin.from("cloner_migration_items").select("id", { count: "exact", head: true }).eq("migration_id", opts.migrationId).eq("object_type", "collection").eq("publish_status", "published"),
    admin.from("cloner_migration_items").select("id", { count: "exact", head: true }).eq("migration_id", opts.migrationId).eq("object_type", "customer").eq("publish_status", "published"),
    admin.from("cloner_migration_items").select("id", { count: "exact", head: true }).eq("migration_id", opts.migrationId).eq("object_type", "file").eq("publish_status", "published"),
    admin.from("cloner_migration_items").select("id", { count: "exact", head: true }).eq("migration_id", opts.migrationId).eq("object_type", "page").eq("publish_status", "published"),
    admin.from("cloner_migration_items").select("id", { count: "exact", head: true }).eq("migration_id", opts.migrationId).eq("object_type", "article").eq("publish_status", "published"),
    admin.from("cloner_migration_items").select("id", { count: "exact", head: true }).eq("migration_id", opts.migrationId).eq("object_type", "menu").eq("publish_status", "published"),
    admin.from("cloner_migration_items").select("id", { count: "exact", head: true }).eq("migration_id", opts.migrationId).eq("object_type", "menu").eq("publish_status", "failed"),
  ]);

  const [
    products,
    collections,
    customers,
    files,
    pages,
    articles,
    menusPublished,
    menusFailed,
  ] = counts.map((c) => c.count ?? 0);

  const scopedObjects = products + collections + customers + files + pages + articles + menusPublished;
  const scopedTotal = scopedObjects + menusFailed;
  const completion_percent = scopedTotal > 0 ? Math.round((scopedObjects / scopedTotal) * 1000) / 10 : 0;

  const critical_blockers: string[] = [];
  if (menusFailed > 0) critical_blockers.push(`${menusFailed} menus failed to publish (Shopify menu limit)`);
  const recoveryRows = opts.collectionRecovery?.rows || [];
  if (recoveryRows.some((r) => r.error)) {
    critical_blockers.push(`${recoveryRows.filter((r) => r.error).length} smart→custom collection recovery error(s)`);
  }
  const brokenColl = opts.qualityAudit?.menus.broken_collection_links ?? 0;
  const brokenPage = opts.qualityAudit?.menus.broken_page_links ?? 0;
  const emptyColl = opts.qualityAudit?.collections.empty_on_target ?? 0;
  const brokenAccount = opts.qualityAudit?.menus.broken_customer_account_links ?? 0;
  if (brokenColl > 0) critical_blockers.push(`${brokenColl} broken collection links in live menus`);
  if (brokenPage > 0) critical_blockers.push(`${brokenPage} broken page links in live menus`);
  if (emptyColl > 50) {
    critical_blockers.push(`${emptyColl} empty collections on target (many expected from smart→custom conversion)`);
  }

  const recommended_next_actions: string[] = [];
  if (menusFailed > 0) {
    recommended_next_actions.push("Manually retire or merge legacy menus to free Shopify menu slots, then re-publish failed migration menus.");
  }
  if ((opts.collectionRecovery?.total_added ?? 0) > 0) {
    recommended_next_actions.push("Verify smart→custom collection product counts on storefront after recovery pass.");
  }
  if (brokenAccount > 0) {
    recommended_next_actions.push("Configure customer account navigation or remove CUSTOMER_ACCOUNT_PAGE items from menus.");
  }
  recommended_next_actions.push("Run full batched final_verification_audit locally once edge compute limits are resolved.");
  recommended_next_actions.push("Deferred (non-blockers): blog migration, shop policies, SEO generation, ActionKing text replacement.");

  const recoveryErrors = recoveryRows.filter((r) => r.skipped_unmapped > 0).length;
  let effort = "Low — validation and menu housekeeping only.";
  if (menusFailed >= 3 && recoveryErrors > 0) effort = "Medium — menu limit resolution + collection membership verification.";
  if (menusFailed >= 3 && brokenColl > 20) {
    effort = "Medium–High — menu restructuring and link remediation before go-live.";
  }

  return {
    completion_percent,
    critical_blockers,
    recommended_next_actions,
    estimated_effort_remaining: effort,
    deferred_items: [
      "Blog migration",
      "Shop policies",
      "SEO generation",
      "ActionKing → EuroDroneParts text replacement",
      "Theme modifications",
    ],
  };
}

export async function runMigrationRecoveryPass(
  admin: SupabaseClient,
  opts: {
    migrationId?: string;
    migrationName: string;
    sourceStore: any;
    targetStore: any;
    tasks?: Array<"menu_audit" | "collection_recovery" | "quality_audit" | "readiness">;
    collectionRecoveryDryRun?: boolean;
    productOffset?: number;
    productLimit?: number;
  },
): Promise<MigrationRecoveryPassResult> {
  const migrationId = opts.migrationId || MIGRATION_ID_DEFAULT;
  const tasks = opts.tasks?.length
    ? opts.tasks
    : ["menu_audit", "collection_recovery", "quality_audit", "readiness"];

  const [sourceAccess, targetAccess] = await Promise.all([
    resolveShopAccess(opts.sourceStore),
    resolveShopAccess(opts.targetStore),
  ]);

  const result: MigrationRecoveryPassResult = {
    ok: true,
    action: "migration_recovery_pass",
    generated_at: new Date().toISOString(),
    migration_id: migrationId,
    migration_name: opts.migrationName,
    source_domain: sourceAccess.domain,
    target_domain: targetAccess.domain,
  };

  if (tasks.includes("menu_audit")) {
    result.menu_audit = await buildMenuAudit(admin, { migrationId, targetStore: opts.targetStore });
  }

  if (tasks.includes("collection_recovery")) {
    result.collection_recovery = await runCollectionMembershipRecovery(admin, {
      migrationId,
      sourceStore: opts.sourceStore,
      targetStore: opts.targetStore,
      dryRun: opts.collectionRecoveryDryRun,
    });
  }

  if (tasks.includes("quality_audit")) {
    result.quality_audit = await buildQualityAudit(admin, {
      migrationId,
      targetStore: opts.targetStore,
      productOffset: opts.productOffset,
      productLimit: opts.productLimit,
    });
  }

  if (tasks.includes("readiness")) {
    result.readiness = await buildReadinessScore(admin, {
      migrationId,
      menuAudit: result.menu_audit,
      collectionRecovery: result.collection_recovery,
      qualityAudit: result.quality_audit,
    });
  }

  return result;
}
