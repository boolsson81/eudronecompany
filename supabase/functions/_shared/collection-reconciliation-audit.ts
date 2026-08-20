import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { resolveShopAccess, shopifyGraphql, type ShopAccess } from "./cloner-shopify-access.ts";

export type CollectionRow = {
  handle: string;
  title: string;
  kind: "custom" | "smart";
  products_count: number | null;
  publish_status?: string | null;
  target_id?: string | null;
  mapped_target_id?: string | null;
  source_id?: string | null;
};

export type CollectionReconciliationAudit = {
  ok: true;
  action: "collection_reconciliation_audit";
  generated_at: string;
  migration_id: string;
  migration_name: string;
  resolution: string;
  source_store: { id: string; label: string | null; domain: string | null } | null;
  target_store: { id: string; label: string | null; domain: string } | null;
  counts: {
    source_collections: number;
    target_collections: number;
    missing_collections: number;
    published_on_target: number;
    unpublished_on_target: number;
    smart_collections: number;
    custom_collections: number;
  };
  SOURCE_COLLECTIONS: CollectionRow[];
  TARGET_COLLECTIONS: CollectionRow[];
  MISSING_COLLECTIONS: CollectionRow[];
};

const COLLECTIONS_QUERY = `
  query StoreCollections($cursor: String) {
    collections(first: 250, after: $cursor) {
      edges {
        cursor
        node {
          id
          title
          handle
          productsCount { count }
          ruleSet { rules { column } }
        }
      }
      pageInfo { hasNextPage }
    }
  }
`;

export async function fetchLiveShopifyCollections(access: ShopAccess): Promise<CollectionRow[]> {
  const rows: CollectionRow[] = [];
  let cursor: string | null = null;
  let pages = 0;
  while (pages < 20) {
    pages++;
    const data = await shopifyGraphql(access, COLLECTIONS_QUERY, { cursor });
    const edges = data?.collections?.edges || [];
    for (const edge of edges) {
      const node = edge?.node;
      if (!node?.handle) continue;
      const isSmart = (node.ruleSet?.rules?.length || 0) > 0;
      rows.push({
        handle: String(node.handle),
        title: String(node.title || node.handle),
        kind: isSmart ? "smart" : "custom",
        products_count: node.productsCount?.count ?? null,
      });
      cursor = edge.cursor;
    }
    if (!data?.collections?.pageInfo?.hasNextPage) break;
  }
  rows.sort((a, b) => a.handle.localeCompare(b.handle));
  return rows;
}

type MigrationCollectionItem = {
  id: string;
  source_id: string | null;
  source_handle: string | null;
  target_id: string | null;
  publish_status: string | null;
  source_payload: any;
};

async function fetchMigrationCollections(admin: SupabaseClient, migrationId: string): Promise<MigrationCollectionItem[]> {
  const rows: MigrationCollectionItem[] = [];
  const pageSize = 1000;
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await admin
      .from("cloner_migration_items")
      .select("id,source_id,source_handle,target_id,publish_status,source_payload")
      .eq("migration_id", migrationId)
      .eq("object_type", "collection")
      .order("source_handle", { ascending: true })
      .range(from, from + pageSize - 1);
    if (error) throw error;
    rows.push(...((data || []) as MigrationCollectionItem[]));
    if (!data || data.length < pageSize) break;
  }
  return rows;
}

async function fetchCollectionMappings(admin: SupabaseClient, migrationId: string) {
  const map = new Map<string, string>();
  const pageSize = 1000;
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await admin
      .from("cloner_object_mappings")
      .select("source_handle,target_id")
      .eq("migration_id", migrationId)
      .eq("object_type", "collection")
      .range(from, from + pageSize - 1);
    if (error) throw error;
    for (const row of data || []) {
      if (row.source_handle && row.target_id) map.set(String(row.source_handle), String(row.target_id));
    }
    if (!data || data.length < pageSize) break;
  }
  return map;
}

function collectionKindFromPayload(payload: any): "custom" | "smart" {
  const rules = payload?.ruleSet?.rules;
  return Array.isArray(rules) && rules.length > 0 ? "smart" : "custom";
}

function toSourceCollectionRow(item: MigrationCollectionItem, mappings: Map<string, string>): CollectionRow {
  const handle = String(item.source_handle || item.source_payload?.handle || "").trim();
  const payload = item.source_payload || {};
  return {
    handle,
    title: String(payload.title || handle),
    kind: collectionKindFromPayload(payload),
    products_count: payload.productsCount?.count ?? payload.products_count ?? null,
    publish_status: item.publish_status,
    target_id: item.target_id,
    mapped_target_id: mappings.get(handle) || null,
    source_id: item.source_id,
  };
}

export async function buildCollectionReconciliationAudit(
  admin: SupabaseClient,
  opts: {
    migrationId: string;
    migrationName: string;
    resolution: string;
    sourceStore: { id: string; label?: string | null; shop_domain?: string | null } | null;
    targetStore: { id: string; label?: string | null; shop_domain?: string | null; access_token?: string | null; api_version?: string | null };
  },
): Promise<CollectionReconciliationAudit> {
  const [migrationItems, mappings, targetAccess] = await Promise.all([
    fetchMigrationCollections(admin, opts.migrationId),
    fetchCollectionMappings(admin, opts.migrationId),
    resolveShopAccess(opts.targetStore),
  ]);

  const SOURCE_COLLECTIONS = migrationItems
    .map((item) => toSourceCollectionRow(item, mappings))
    .filter((row) => row.handle)
    .sort((a, b) => a.handle.localeCompare(b.handle));

  const TARGET_COLLECTIONS = await fetchLiveShopifyCollections(targetAccess);
  const targetHandles = new Set(TARGET_COLLECTIONS.map((c) => c.handle));

  const MISSING_COLLECTIONS = SOURCE_COLLECTIONS.filter((row) => !targetHandles.has(row.handle));

  return {
    ok: true,
    action: "collection_reconciliation_audit",
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
    counts: {
      source_collections: SOURCE_COLLECTIONS.length,
      target_collections: TARGET_COLLECTIONS.length,
      missing_collections: MISSING_COLLECTIONS.length,
      published_on_target: SOURCE_COLLECTIONS.filter((c) => c.publish_status === "published").length,
      unpublished_on_target: SOURCE_COLLECTIONS.filter((c) => c.publish_status !== "published").length,
      smart_collections: SOURCE_COLLECTIONS.filter((c) => c.kind === "smart").length,
      custom_collections: SOURCE_COLLECTIONS.filter((c) => c.kind === "custom").length,
    },
    SOURCE_COLLECTIONS,
    TARGET_COLLECTIONS,
    MISSING_COLLECTIONS,
  };
}
