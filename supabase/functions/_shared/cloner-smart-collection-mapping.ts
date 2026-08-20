import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { resolveShopAccess, shopifyGraphql, type ShopAccess } from "./cloner-shopify-access.ts";

import { SMART_COLLECTION_RECOVERY_HANDLES } from "./cloner-collection-gap-classifier.ts";

/** Default EuroDroneParts migration (ActionKing → EUDroneParts). */
export const MIGRATION_ID_DEFAULT = "3d9876af-885c-49e9-a4b0-c4943c06112f";

export type CollectionRuleRow = {
  column: string;
  relation: string;
  condition: string;
  metafield_definition_id?: string | null;
  condition_object_id?: string | null;
};

export type MappedRuleAudit = {
  collection_id: string;
  collection_handle: string;
  rule_index: number;
  column: string;
  old_definition_id: string | null;
  new_definition_id: string | null;
  resolution: string;
};

export type SmartCollectionFixResult = {
  collection_id: string;
  collection_handle: string;
  publish_result: "published" | "updated" | "skipped" | "failed";
  error?: string | null;
  rule_mappings: MappedRuleAudit[];
  target_id?: string | null;
};

const METAFIELD_DEF_COLUMNS = new Set([
  "product_metafield_definition",
  "variant_metafield_definition",
  "product_metafield",
  "variant_metafield",
]);

const SOURCE_COLLECTION_RULES_QUERY = `
  query SourceCollectionRules($id: ID!) {
    collection(id: $id) {
      id
      handle
      ruleSet {
        appliedDisjunctively
        rules {
          column
          relation
          condition
          conditionObject {
            ... on CollectionRuleMetafieldCondition {
              metafieldDefinition { id namespace key ownerType }
            }
          }
        }
      }
    }
  }
`;

const TARGET_COLLECTION_BY_HANDLE = `
  query TargetCollection($handle: String!) {
    collectionByHandle(handle: $handle) {
      id
      handle
      ruleSet { rules { column relation condition } }
    }
  }
`;

const COLLECTION_UPDATE_MUTATION = `
  mutation CollectionUpdate($input: CollectionInput!) {
    collectionUpdate(input: $input) {
      collection { id handle ruleSet { rules { column relation condition } } }
      userErrors { field message }
    }
  }
`;

function normalizeColumn(column: string): string {
  return String(column || "").trim().toLowerCase();
}

export function isMetafieldDefinitionRule(column: string): boolean {
  const c = normalizeColumn(column);
  return METAFIELD_DEF_COLUMNS.has(c) || c.includes("metafield_definition");
}

function gidToNumeric(id: string | null | undefined): string | null {
  if (!id) return null;
  const m = String(id).match(/(\d+)$/);
  return m ? m[1] : null;
}

function collectionGidFromId(id: string | null | undefined): string | null {
  if (!id) return null;
  if (String(id).startsWith("gid://")) return String(id);
  const num = gidToNumeric(id);
  return num ? `gid://shopify/Collection/${num}` : null;
}

function rulesFromPayload(payload: any): CollectionRuleRow[] {
  const rules = payload?.ruleSet?.rules || payload?.rules || [];
  if (!Array.isArray(rules)) return [];
  return rules.map((r: any) => ({
    column: String(r.column || ""),
    relation: String(r.relation || ""),
    condition: String(r.condition ?? ""),
    metafield_definition_id: r.metafield_definition_id || r.metafieldDefinitionId || null,
    condition_object_id: r.condition_object_id || r.conditionObjectId || null,
  }));
}

export function rulesFromTransformedOrSource(item: {
  transformed_payload?: any;
  source_payload?: any;
}): CollectionRuleRow[] {
  const fromTransformed = rulesFromPayload(item.transformed_payload);
  if (fromTransformed.length) return fromTransformed;
  return rulesFromPayload(item.source_payload);
}

export function isSmartSourceCollection(item: { source_payload?: any }): boolean {
  const rules = item.source_payload?.ruleSet?.rules;
  return Array.isArray(rules) && rules.length > 0;
}

export function normalizeOwnerType(o: string | null | undefined): string {
  const v = String(o || "").toUpperCase().replace(/[_\s-]/g, "");
  if (v === "VARIANT" || v === "PRODUCTVARIANT") return "PRODUCTVARIANT";
  return v;
}

async function fetchTargetMetafieldDefs(access: ShopAccess): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const owners = ["PRODUCT", "PRODUCTVARIANT", "COLLECTION"];
  for (const owner of owners) {
    let cursor: string | null = null;
    for (let page = 0; page < 20; page++) {
      const data = await shopifyGraphql(access, `
        query($owner: MetafieldOwnerType!, $after: String) {
          metafieldDefinitions(ownerType: $owner, first: 250, after: $after) {
            pageInfo { hasNextPage endCursor }
            nodes { id namespace key ownerType }
          }
        }`, { owner, after: cursor });
      for (const n of data?.metafieldDefinitions?.nodes || []) {
        map.set(`${n.ownerType}::${n.namespace}.${n.key}`, n.id);
        const ot = normalizeOwnerType(n.ownerType);
        map.set(`${ot}::${n.namespace}.${n.key}`, n.id);
        if (ot === "PRODUCTVARIANT") map.set(`VARIANT::${n.namespace}.${n.key}`, n.id);
        map.set(String(n.id), n.id);
      }
      if (!data?.metafieldDefinitions?.pageInfo?.hasNextPage) break;
      cursor = data.metafieldDefinitions.pageInfo.endCursor;
    }
  }
  return map;
}

async function fetchSourceMetafieldDefs(access: ShopAccess): Promise<Map<string, { id: string; namespace: string; key: string; ownerType: string }>> {
  const map = new Map<string, { id: string; namespace: string; key: string; ownerType: string }>();
  const owners = ["PRODUCT", "PRODUCTVARIANT", "COLLECTION"];
  for (const owner of owners) {
    let cursor: string | null = null;
    for (let page = 0; page < 20; page++) {
      const data = await shopifyGraphql(access, `
        query($owner: MetafieldOwnerType!, $after: String) {
          metafieldDefinitions(ownerType: $owner, first: 250, after: $after) {
            pageInfo { hasNextPage endCursor }
            nodes { id namespace key ownerType }
          }
        }`, { owner, after: cursor });
      for (const n of data?.metafieldDefinitions?.nodes || []) {
        map.set(String(n.id), n);
        map.set(`${n.ownerType}::${n.namespace}.${n.key}`, n);
        const ot = normalizeOwnerType(n.ownerType);
        const norm = { id: n.id, namespace: n.namespace, key: n.key, ownerType: ot };
        map.set(String(n.id), norm);
        map.set(`${ot}::${n.namespace}.${n.key}`, norm);
        if (ot === "PRODUCTVARIANT") map.set(`VARIANT::${n.namespace}.${n.key}`, norm);
      }
      if (!data?.metafieldDefinitions?.pageInfo?.hasNextPage) break;
      cursor = data.metafieldDefinitions.pageInfo.endCursor;
    }
  }
  return map;
}

async function buildDefinitionResolver(
  admin: SupabaseClient,
  migrationId: string,
  targetAccess: ShopAccess,
  sourceAccess?: ShopAccess | null,
) {
  const bySourceGid = new Map<string, string>();
  const targetByKey = await fetchTargetMetafieldDefs(targetAccess);
  let sourceByGid = new Map<string, { id: string; namespace: string; key: string; ownerType: string }>();
  if (sourceAccess) sourceByGid = await fetchSourceMetafieldDefs(sourceAccess);

  // cloner_migration_items metafieldDefinition mappings
  for (let from = 0; ; from += 500) {
    const { data } = await admin
      .from("cloner_migration_items")
      .select("source_id,target_id,source_payload")
      .eq("migration_id", migrationId)
      .eq("object_type", "metafieldDefinition")
      .not("target_id", "is", null)
      .range(from, from + 499);
    for (const row of data || []) {
      if (row.source_id && row.target_id) bySourceGid.set(String(row.source_id), String(row.target_id));
      const p = row.source_payload || {};
      if (p.namespace && p.key && p.ownerType && row.target_id) {
        targetByKey.set(`${p.ownerType}::${p.namespace}.${p.key}`, String(row.target_id));
        const ot = normalizeOwnerType(p.ownerType);
        targetByKey.set(`${ot}::${p.namespace}.${p.key}`, String(row.target_id));
        if (ot === "PRODUCTVARIANT") targetByKey.set(`VARIANT::${p.namespace}.${p.key}`, String(row.target_id));
      }
    }
    if (!data || data.length < 500) break;
  }

  // cloner_object_mappings
  for (let from = 0; ; from += 500) {
    const { data } = await admin
      .from("cloner_object_mappings")
      .select("source_id,target_id,metadata")
      .eq("migration_id", migrationId)
      .eq("object_type", "metafieldDefinition")
      .range(from, from + 499);
    for (const row of data || []) {
      if (row.source_id && row.target_id) bySourceGid.set(String(row.source_id), String(row.target_id));
      const meta = (row.metadata || {}) as Record<string, string>;
      if (meta.ownerType && meta.namespace && meta.key && row.target_id) {
        targetByKey.set(`${meta.ownerType}::${meta.namespace}.${meta.key}`, String(row.target_id));
        const ot = normalizeOwnerType(meta.ownerType);
        targetByKey.set(`${ot}::${meta.namespace}.${meta.key}`, String(row.target_id));
        if (ot === "PRODUCTVARIANT") targetByKey.set(`VARIANT::${meta.namespace}.${meta.key}`, String(row.target_id));
      }
    }
    if (!data || data.length < 500) break;
  }

  // seo_targets: secondary lookup for target product/collection IDs on EuroDroneParts shop
  const { data: targetStore } = await admin
    .from("cloner_migrations")
    .select("target_store_id")
    .eq("id", migrationId)
    .maybeSingle();
  if (targetStore?.target_store_id) {
    const { data: storeRow } = await admin
      .from("cloner_stores")
      .select("shop_domain,primary_domain")
      .eq("id", targetStore.target_store_id)
      .maybeSingle();
    const domain = storeRow?.shop_domain || storeRow?.primary_domain;
    if (domain) {
      const { data: shopRow } = await admin
        .from("shops")
        .select("id")
        .eq("domain", domain)
        .maybeSingle();
      const shopId = shopRow?.id;
      if (shopId) {
        for (let from = 0; ; from += 1000) {
          const { data } = await admin
            .from("seo_targets")
            .select("target_id,handle,target_type")
            .eq("shop_id", shopId)
            .eq("status", "active")
            .range(from, from + 999);
          for (const row of data || []) {
            if (row.target_id) {
              targetByKey.set(`seo_target::${row.target_type}::${row.handle}`, String(row.target_id));
            }
          }
          if (!data || data.length < 1000) break;
        }
      }
    }
  }

  return function resolveDefinitionId(sourceDefId: string | null | undefined, audit: { resolution?: string }): string | null {
    if (!sourceDefId) return null;
    const direct = bySourceGid.get(sourceDefId);
    if (direct) {
      audit.resolution = "cloner_migration_items_or_mappings";
      return direct;
    }
    if (targetByKey.has(sourceDefId)) {
      audit.resolution = "target_shopify_definitions";
      return targetByKey.get(sourceDefId)!;
    }
    const srcDef = sourceByGid.get(sourceDefId);
    if (srcDef) {
      const key = `${srcDef.ownerType}::${srcDef.namespace}.${srcDef.key}`;
      const hit = targetByKey.get(key);
      if (hit) {
        audit.resolution = "namespace_key_match";
        return hit;
      }
    }
    audit.resolution = "unresolved";
    return null;
  };
}

export async function fetchLiveSourceRules(
  sourceAccess: ShopAccess,
  sourceCollectionGid: string,
): Promise<{ appliedDisjunctively: boolean; rules: CollectionRuleRow[] } | null> {
  const data = await shopifyGraphql(sourceAccess, SOURCE_COLLECTION_RULES_QUERY, { id: sourceCollectionGid });
  const col = data?.collection;
  if (!col?.ruleSet?.rules?.length) return null;
  const rules: CollectionRuleRow[] = col.ruleSet.rules.map((r: any) => {
    const def = r.conditionObject?.metafieldDefinition;
    const defId = def?.id || null;
    return {
      column: String(r.column || ""),
      relation: String(r.relation || ""),
      condition: String(r.condition ?? ""),
      metafield_definition_id: defId,
      condition_object_id: defId,
    };
  });
  return { appliedDisjunctively: !!col.ruleSet.appliedDisjunctively, rules };
}

export async function mapCollectionRulesForItem(
  admin: SupabaseClient,
  opts: {
    migrationId: string;
    item: { id: string; source_id: string | null; source_handle: string | null; source_payload?: any; transformed_payload?: any };
    targetAccess: ShopAccess;
    sourceAccess?: ShopAccess | null;
  },
): Promise<{ appliedDisjunctively: boolean; rules: CollectionRuleRow[]; audits: MappedRuleAudit[] }> {
  const resolve = await buildDefinitionResolver(admin, opts.migrationId, opts.targetAccess, opts.sourceAccess);
  let appliedDisjunctively = !!opts.item.source_payload?.ruleSet?.appliedDisjunctively;
  let rules = rulesFromTransformedOrSource(opts.item);

  if (opts.sourceAccess && opts.item.source_id) {
    const live = await fetchLiveSourceRules(opts.sourceAccess, opts.item.source_id);
    if (live?.rules?.length) {
      rules = live.rules;
      appliedDisjunctively = live.appliedDisjunctively;
    }
  }

  const audits: MappedRuleAudit[] = [];
  const mappedRules: CollectionRuleRow[] = [];

  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    const audit: MappedRuleAudit = {
      collection_id: opts.item.id,
      collection_handle: String(opts.item.source_handle || ""),
      rule_index: i,
      column: rule.column,
      old_definition_id: rule.metafield_definition_id || rule.condition_object_id || null,
      new_definition_id: null,
      resolution: "unchanged",
    };

    if (isMetafieldDefinitionRule(rule.column)) {
      const sourceDefId = rule.metafield_definition_id || rule.condition_object_id || null;
      const res: { resolution?: string } = {};
      const targetDefId = resolve(sourceDefId, res);
      audit.old_definition_id = sourceDefId;
      audit.new_definition_id = targetDefId;
      audit.resolution = res.resolution || "unresolved";
      mappedRules.push({
        ...rule,
        metafield_definition_id: targetDefId,
        condition_object_id: targetDefId,
      });
    } else {
      mappedRules.push({ ...rule });
    }
    audits.push(audit);
  }

  return { appliedDisjunctively, rules: mappedRules, audits };
}

function toRestRules(rules: CollectionRuleRow[]) {
  return rules.map((r) => {
    const out: Record<string, unknown> = {
      column: normalizeColumn(r.column),
      relation: String(r.relation || "").toLowerCase(),
      condition: r.condition,
    };
    const defId = r.condition_object_id || r.metafield_definition_id;
    if (defId && isMetafieldDefinitionRule(r.column)) {
      out.condition_object_id = defId;
    }
    return out;
  });
}

function toGraphqlRules(rules: CollectionRuleRow[]) {
  return rules.map((r) => {
    const out: Record<string, unknown> = {
      column: String(r.column || "").toUpperCase(),
      relation: String(r.relation || "").toUpperCase(),
      condition: r.condition,
    };
    const defId = r.condition_object_id || r.metafield_definition_id;
    if (defId && isMetafieldDefinitionRule(r.column)) {
      out.conditionObjectId = defId;
    }
    return out;
  });
}

async function rest(
  access: ShopAccess,
  method: string,
  path: string,
  body?: unknown,
) {
  const r = await fetch(`https://${access.domain}/admin/api/${access.apiVersion}/${path}`, {
    method,
    headers: {
      "X-Shopify-Access-Token": access.token,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  const json = text ? JSON.parse(text) : {};
  if (!r.ok) throw new Error(`shopify ${r.status}: ${text.slice(0, 400)}`);
  return json;
}

export async function publishSmartCollection(
  targetAccess: ShopAccess,
  item: {
    source_payload?: any;
    transformed_payload?: any;
    target_id?: string | null;
  },
  mapped: { appliedDisjunctively: boolean; rules: CollectionRuleRow[] },
): Promise<{ target_id: string; publish_result: "published" | "updated" }> {
  const src = item.source_payload || {};
  const t = item.transformed_payload || {};
  const handle = String(src.handle || "");
  const title = String(t.title || src.title || handle);
  const bodyHtml = String(t.description || src.descriptionHtml || "");
  const sortOrder = String(src.sortOrder || "best-selling").toLowerCase().replace(/_/g, "-");
  const rules = toRestRules(mapped.rules);
  const gqlRules = toGraphqlRules(mapped.rules);

  // Prefer GraphQL collectionUpdate when we already have a target collection (custom → smart conversion attempt)
  const existingGid = collectionGidFromId(item.target_id);
  if (existingGid) {
    const data = await shopifyGraphql(targetAccess, COLLECTION_UPDATE_MUTATION, {
      input: {
        id: existingGid,
        ruleSet: {
          appliedDisjunctively: mapped.appliedDisjunctively,
          rules: gqlRules,
        },
      },
    });
    const errs = data?.collectionUpdate?.userErrors || [];
    if (!errs.length) {
      const id = data.collectionUpdate.collection.id;
      return { target_id: gidToNumeric(id) || String(item.target_id), publish_result: "updated" };
    }
    // Fall through to REST smart collection create/update if GraphQL conversion blocked
  }

  // REST lookup by handle
  const smartLookup = await rest(targetAccess, "GET", `smart_collections.json?handle=${encodeURIComponent(handle)}&limit=1`);
  if (smartLookup.smart_collections?.[0]) {
    const id = smartLookup.smart_collections[0].id;
    await rest(targetAccess, "PUT", `smart_collections/${id}.json`, {
      smart_collection: {
        id,
        title,
        body_html: bodyHtml,
        handle,
        disjunctive: mapped.appliedDisjunctively,
        rules,
        sort_order: sortOrder,
        published: false,
      },
    });
    return { target_id: String(id), publish_result: "updated" };
  }

  const customLookup = await rest(targetAccess, "GET", `custom_collections.json?handle=${encodeURIComponent(handle)}&limit=1`);
  if (customLookup.custom_collections?.[0]) {
    // Non-destructive path: try GraphQL update on custom collection GID first (handled above).
    // If still here, we cannot safely convert without delete — surface as failure upstream.
    throw new Error(
      `collection_exists_as_custom:${handle} — GraphQL ruleSet update failed; manual conversion required to avoid destructive delete`,
    );
  }

  const created = await rest(targetAccess, "POST", "smart_collections.json", {
    smart_collection: {
      title,
      body_html: bodyHtml,
      handle,
      disjunctive: mapped.appliedDisjunctively,
      rules,
      sort_order: sortOrder,
      published: false,
    },
  });
  return { target_id: String(created.smart_collection.id), publish_result: "published" };
}

export async function runSmartCollectionMappingPass(
  admin: SupabaseClient,
  opts: {
    migrationId: string;
    handles?: string[];
    dryRun?: boolean;
  },
): Promise<{
  collections: SmartCollectionFixResult[];
  summary: { total: number; fixed: number; failed: number; skipped: number };
}> {
  const { data: mig } = await admin.from("cloner_migrations")
    .select("source_store_id,target_store_id")
    .eq("id", opts.migrationId)
    .single();
  const { data: stores } = await admin.from("cloner_stores")
    .select("*")
    .in("id", [mig!.source_store_id, mig!.target_store_id]);
  const sourceStore = stores?.find((s) => s.id === mig!.source_store_id);
  const targetStore = stores?.find((s) => s.id === mig!.target_store_id);
  const [targetAccess, sourceAccess] = await Promise.all([
    resolveShopAccess(targetStore),
    sourceStore ? resolveShopAccess(sourceStore) : Promise.resolve(null),
  ]);

  let query = admin
    .from("cloner_migration_items")
    .select("id,source_id,source_handle,source_payload,transformed_payload,target_id,publish_status,error")
    .eq("migration_id", opts.migrationId)
    .eq("object_type", "collection");

  const targetHandles = opts.handles?.length
    ? opts.handles
    : [...SMART_COLLECTION_RECOVERY_HANDLES];

  query = query.in("source_handle", targetHandles);

  const { data: items, error } = await query;
  if (error) throw error;

  const candidates = (items || []).filter(
    (item) => isSmartSourceCollection(item) && targetHandles.includes(String(item.source_handle)),
  );
  const results: SmartCollectionFixResult[] = [];
  let fixed = 0;
  let failed = 0;
  let skipped = 0;

  for (const item of candidates) {
    try {
      const mapped = await mapCollectionRulesForItem(admin, {
        migrationId: opts.migrationId,
        item,
        targetAccess,
        sourceAccess,
      });

      const unresolved = mapped.audits.filter(
        (a) => isMetafieldDefinitionRule(a.column) && a.old_definition_id && !a.new_definition_id,
      );
      if (unresolved.length) {
        results.push({
          collection_id: item.id,
          collection_handle: String(item.source_handle),
          publish_result: "failed",
          error: `unresolved_metafield_definitions: ${unresolved.map((u) => u.old_definition_id).join(", ")}`,
          rule_mappings: mapped.audits,
          target_id: item.target_id,
        });
        failed++;
        continue;
      }

      const transformedPayload = {
        ...(item.transformed_payload || {}),
        direct_copy: true,
        ruleSet: {
          appliedDisjunctively: mapped.appliedDisjunctively,
          rules: mapped.rules,
        },
      };

      if (opts.dryRun) {
        results.push({
          collection_id: item.id,
          collection_handle: String(item.source_handle),
          publish_result: "skipped",
          rule_mappings: mapped.audits,
          target_id: item.target_id,
        });
        skipped++;
        continue;
      }

      await admin.from("cloner_migration_items").update({
        transformed_payload: transformedPayload,
        updated_at: new Date().toISOString(),
      }).eq("id", item.id);

      const pub = await publishSmartCollection(targetAccess, { ...item, transformed_payload: transformedPayload }, mapped);

      await admin.from("cloner_migration_items").update({
        publish_status: "published",
        target_id: pub.target_id,
        target_handle: item.source_handle,
        error: null,
        transformed_payload: transformedPayload,
        updated_at: new Date().toISOString(),
      }).eq("id", item.id);

      await admin.from("cloner_logs").insert({
        migration_id: opts.migrationId,
        event: "smart_collection_rules_remapped",
        level: "info",
        message: `Smart collection ${item.source_handle} published with remapped metafield definition rules.`,
        metadata: {
          item_id: item.id,
          target_id: pub.target_id,
          rule_mappings: mapped.audits,
          publish_result: pub.publish_result,
        },
      });

      results.push({
        collection_id: item.id,
        collection_handle: String(item.source_handle),
        publish_result: pub.publish_result,
        rule_mappings: mapped.audits,
        target_id: pub.target_id,
      });
      fixed++;
    } catch (e) {
      results.push({
        collection_id: item.id,
        collection_handle: String(item.source_handle || ""),
        publish_result: "failed",
        error: (e as Error).message,
        rule_mappings: [],
        target_id: item.target_id,
      });
      failed++;
    }
  }

  return {
    collections: results,
    summary: { total: results.length, fixed, failed, skipped },
  };
}

export async function isTargetCollectionCustom(
  targetAccess: ShopAccess,
  handle: string,
): Promise<boolean> {
  const data = await shopifyGraphql(targetAccess, TARGET_COLLECTION_BY_HANDLE, { handle });
  const rules = data?.collectionByHandle?.ruleSet?.rules;
  return !rules?.length;
}
