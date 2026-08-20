/**
 * Link cloned products to target custom collections via collects.json.
 * Smart collections are skipped (membership is rule-driven).
 */
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export type CollectionLinkResult = {
  linked: number;
  skipped: number;
  smart_skipped: number;
  failed: string[];
};

type RestFn = (
  domain: string,
  token: string,
  ver: string,
  method: string,
  path: string,
  body?: unknown,
) => Promise<any>;

export async function resolveTargetCollectionId(
  admin: SupabaseClient,
  migrationId: string,
  collectionHandle: string,
  cache: Map<string, number>,
  rest: RestFn,
  target: { shop_domain: string; access_token: string; api_version: string },
): Promise<number | null> {
  if (cache.has(collectionHandle)) return cache.get(collectionHandle)!;

  const { data: mapped } = await admin
    .from("cloner_object_mappings")
    .select("target_id")
    .eq("migration_id", migrationId)
    .eq("object_type", "collection")
    .eq("source_handle", collectionHandle)
    .maybeSingle();

  if (mapped?.target_id) {
    const id = Number(mapped.target_id);
    if (!Number.isNaN(id)) {
      cache.set(collectionHandle, id);
      return id;
    }
  }

  try {
    const custom = await rest(
      target.shop_domain,
      target.access_token,
      target.api_version,
      "GET",
      `custom_collections.json?handle=${encodeURIComponent(collectionHandle)}&limit=1`,
    );
    const id = custom?.custom_collections?.[0]?.id;
    if (id) {
      cache.set(collectionHandle, Number(id));
      return Number(id);
    }
  } catch {
    /* ignore lookup errors */
  }

  return null;
}

export async function linkProductToCollections(opts: {
  admin: SupabaseClient;
  migrationId: string;
  tenantId: string | null;
  sourcePayload: { collections?: { nodes?: Array<{ handle?: string; ruleSet?: unknown }> } };
  targetProductId: number | string;
  sourceHandle?: string | null;
  sourceId?: string;
  target: { shop_domain: string; access_token: string; api_version: string };
  rest: RestFn;
  collectionHandleCache?: Map<string, number>;
  dryRun?: boolean;
}): Promise<CollectionLinkResult> {
  const result: CollectionLinkResult = { linked: 0, skipped: 0, smart_skipped: 0, failed: [] };
  const cache = opts.collectionHandleCache ?? new Map<string, number>();
  const cols = opts.sourcePayload?.collections?.nodes ?? [];

  if (!cols.length) return result;

  for (const col of cols) {
    const handle = String(col?.handle ?? "").trim();
    if (!handle) {
      result.skipped++;
      continue;
    }
    if (col?.ruleSet) {
      result.smart_skipped++;
      continue;
    }

    const colId = await resolveTargetCollectionId(
      opts.admin,
      opts.migrationId,
      handle,
      cache,
      opts.rest,
      opts.target,
    );
    if (!colId) {
      result.skipped++;
      result.failed.push(`${handle}: collection not found on target`);
      continue;
    }

    if (opts.dryRun) {
      result.linked++;
      continue;
    }

    try {
      await opts.rest(
        opts.target.shop_domain,
        opts.target.access_token,
        opts.target.api_version,
        "POST",
        "collects.json",
        { collect: { product_id: Number(opts.targetProductId), collection_id: colId } },
      );
      result.linked++;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("already") || msg.includes("422")) {
        result.linked++;
      } else {
        result.failed.push(`${handle}: ${msg.slice(0, 120)}`);
      }
    }
  }

  return result;
}
