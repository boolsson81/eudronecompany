import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import type { ShopAccess } from "../cloner-shopify-access.ts";
import { shopifyGraphql, shopifyRest } from "../cloner-shopify-access.ts";
import { EDP_MIGRATION_ID } from "./config.ts";
import {
  CATEGORY_HIERARCHY,
  COLLECTION_MERGE_PLAN,
  MENU_HIERARCHY,
  buildTaxonomyHandleMap,
  flattenTaxonomy,
  type TaxonomyNode,
} from "./taxonomy-config.ts";
import { toEnglishHandle } from "./slug-en.ts";
import { MENU_DEFINITIONS } from "./config.ts";
import { TAXONOMY_VERSION } from "./taxonomy-approval-config.ts";

const COLLECTION_RULES_QUERY = `
  query CollectionRules($id: ID!) {
    collection(id: $id) {
      id
      handle
      ruleSet {
        appliedDisjunctively
        rules { column relation condition }
      }
    }
  }
`;

const COLLECTION_UPDATE_MUTATION = `
  mutation CollectionUpdate($input: CollectionInput!) {
    collectionUpdate(input: $input) {
      collection { id handle }
      userErrors { field message }
    }
  }
`;

const COLLECTIONS_AUDIT_QUERY = `
  query CollectionsAudit($cursor: String) {
    collections(first: 250, after: $cursor) {
      edges {
        node {
          id
          handle
          title
          ruleSet { appliedDisjunctively rules { column relation condition } }
          productsCount { count }
          seo { title description }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

function collectionNumericId(gidOrId: string): string {
  return String(gidOrId).replace(/^gid:\/\/shopify\/Collection\//, "");
}

export type CollectionRow = {
  id: string;
  handle: string;
  title: string;
  products_count: number;
  kind: "smart" | "custom";
  rules_count: number;
  taxonomy_node?: string;
  english_handle: string;
  in_taxonomy: boolean;
  orphaned: boolean;
};

export type MergeCandidate = {
  canonical_handle: string;
  absorb_handle: string;
  reason: string;
  canonical_products: number;
  absorb_products: number;
  overlap_detected: boolean;
  planned: boolean;
};

export type TaxonomyProposal = {
  category_hierarchy: typeof CATEGORY_HIERARCHY;
  menu_hierarchy: typeof MENU_HIERARCHY;
  menu_definitions: typeof MENU_DEFINITIONS;
  collection_audit_summary: {
    total: number;
    in_taxonomy: number;
    orphaned: number;
    duplicate_groups: number;
  };
  merge_plan: MergeCandidate[];
  orphaned_collections: CollectionRow[];
  taxonomy_gaps: Array<{ node_id: string; target_handle: string; missing_sources: string[] }>;
  unmapped_live_collections: CollectionRow[];
};

export type TaxonomyApprovalState = {
  approved: boolean;
  approved_at?: string;
  approved_by?: string;
  taxonomy_version: string;
  merge_plan_hash?: string;
  notes?: string;
};

export async function fetchAllCollections(access: ShopAccess): Promise<CollectionRow[]> {
  const handleMap = buildTaxonomyHandleMap();
  const rows: CollectionRow[] = [];
  let cursor: string | null = null;

  for (let page = 0; page < 20; page++) {
    const data = await shopifyGraphql(access, COLLECTIONS_AUDIT_QUERY, { cursor });
    for (const edge of data?.collections?.edges || []) {
      const n = edge.node;
      const rules = n.ruleSet?.rules || [];
      const handle = String(n.handle);
      const taxonomy = handleMap.get(handle);
      rows.push({
        id: n.id,
        handle,
        title: String(n.title || ""),
        products_count: n.productsCount?.count ?? 0,
        kind: rules.length > 0 ? "smart" : "custom",
        rules_count: rules.length,
        taxonomy_node: taxonomy?.id,
        english_handle: toEnglishHandle(handle),
        in_taxonomy: !!taxonomy,
        orphaned: !taxonomy && !isVendorCollection(handle),
      });
    }
    if (!data?.collections?.pageInfo?.hasNextPage) break;
    cursor = data.collections.pageInfo.endCursor;
  }

  return rows.sort((a, b) => a.handle.localeCompare(b.handle));
}

function isVendorCollection(handle: string): boolean {
  return /^(polarpro|pgytech|gopro|vendors-|brdrc|master-airscrew)/.test(handle);
}

/** Normalize title for duplicate detection */
function normTitle(t: string): string {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/** Detect duplicate collections by title similarity and planned merges */
export function detectMergeCandidates(
  collections: CollectionRow[],
): { planned: MergeCandidate[]; detected: MergeCandidate[] } {
  const byHandle = new Map(collections.map((c) => [c.handle, c]));
  const planned: MergeCandidate[] = [];

  for (const plan of COLLECTION_MERGE_PLAN) {
    const canonical = byHandle.get(plan.canonical_handle);
    for (const absorb of plan.absorb_handles) {
      const abs = byHandle.get(absorb);
      if (!abs) continue;
      planned.push({
        canonical_handle: plan.canonical_handle,
        absorb_handle: absorb,
        reason: plan.reason,
        canonical_products: canonical?.products_count ?? 0,
        absorb_products: abs.products_count,
        overlap_detected: false,
        planned: true,
      });
    }
  }

  const detected: MergeCandidate[] = [];
  const titleGroups = new Map<string, CollectionRow[]>();
  for (const c of collections) {
    const key = normTitle(c.title).slice(0, 40);
    if (!key) continue;
    const list = titleGroups.get(key) || [];
    list.push(c);
    titleGroups.set(key, list);
  }

  for (const [, group] of titleGroups) {
    if (group.length < 2) continue;
    const canonical = group.reduce((a, b) =>
      a.products_count >= b.products_count ? a : b,
    );
    for (const other of group) {
      if (other.handle === canonical.handle) continue;
      if (planned.some((p) => p.absorb_handle === other.handle)) continue;
      detected.push({
        canonical_handle: canonical.handle,
        absorb_handle: other.handle,
        reason: `Similar title: "${other.title}"`,
        canonical_products: canonical.products_count,
        absorb_products: other.products_count,
        overlap_detected: true,
        planned: false,
      });
    }
  }

  // English handle collisions (pre-rename preview)
  const enGroups = new Map<string, CollectionRow[]>();
  for (const c of collections) {
    const list = enGroups.get(c.english_handle) || [];
    list.push(c);
    enGroups.set(c.english_handle, list);
  }
  for (const [enHandle, group] of enGroups) {
    if (group.length < 2) continue;
    const canonical = group.reduce((a, b) =>
      a.products_count >= b.products_count ? a : b,
    );
    for (const other of group) {
      if (other.handle === canonical.handle) continue;
      if (planned.some((p) => p.absorb_handle === other.handle)) continue;
      if (detected.some((d) => d.absorb_handle === other.handle)) continue;
      detected.push({
        canonical_handle: canonical.handle,
        absorb_handle: other.handle,
        reason: `Same English handle after rename: ${enHandle}`,
        canonical_products: canonical.products_count,
        absorb_products: other.products_count,
        overlap_detected: true,
        planned: false,
      });
    }
  }

  return { planned, detected };
}

/** Build full taxonomy proposal for operator review */
export async function proposeTaxonomy(access: ShopAccess): Promise<TaxonomyProposal> {
  const collections = await fetchAllCollections(access);
  const { planned, detected } = detectMergeCandidates(collections);
  const merge_plan = [...planned, ...detected];

  const liveHandles = new Set(collections.map((c) => c.handle));
  const taxonomy_gaps: TaxonomyProposal["taxonomy_gaps"] = [];

  for (const node of flattenTaxonomy()) {
    const missing = (node.source_handles || []).filter((h) => !liveHandles.has(h));
    if (missing.length) {
      taxonomy_gaps.push({
        node_id: node.id,
        target_handle: node.target_handle,
        missing_sources: missing,
      });
    }
  }

  const mappedSources = new Set(
    flattenTaxonomy().flatMap((n) => n.source_handles || []),
  );
  const unmapped_live_collections = collections.filter(
    (c) => !c.in_taxonomy && !mappedSources.has(c.handle) && c.orphaned,
  );

  return {
    category_hierarchy: CATEGORY_HIERARCHY,
    menu_hierarchy: MENU_HIERARCHY,
    menu_definitions: MENU_DEFINITIONS,
    collection_audit_summary: {
      total: collections.length,
      in_taxonomy: collections.filter((c) => c.in_taxonomy).length,
      orphaned: collections.filter((c) => c.orphaned).length,
      duplicate_groups: new Set(merge_plan.map((m) => m.canonical_handle)).size,
    },
    merge_plan,
    orphaned_collections: collections.filter((c) => c.orphaned),
    taxonomy_gaps,
    unmapped_live_collections,
  };
}

export type MergeResult = {
  canonical_handle: string;
  absorb_handle: string;
  action: "merged" | "skipped" | "failed" | "dry_run";
  products_moved: number;
  error?: string;
};

type RuleRow = { column: string; relation: string; condition: string };

function ruleKey(r: RuleRow): string {
  return `${r.column}|${r.relation}|${r.condition}`;
}

async function fetchCollectionRules(access: ShopAccess, id: string) {
  const data = await shopifyGraphql(access, COLLECTION_RULES_QUERY, { id });
  const rs = data?.collection?.ruleSet;
  if (!rs?.rules?.length) return null;
  return {
    appliedDisjunctively: !!rs.appliedDisjunctively,
    rules: rs.rules.map((r: RuleRow) => ({
      column: String(r.column || ""),
      relation: String(r.relation || ""),
      condition: String(r.condition ?? ""),
    })),
  };
}

function mergeRuleSets(
  canonical: { appliedDisjunctively: boolean; rules: RuleRow[] } | null,
  absorb: { appliedDisjunctively: boolean; rules: RuleRow[] },
) {
  const merged = new Map<string, RuleRow>();
  for (const r of canonical?.rules || []) merged.set(ruleKey(r), r);
  for (const r of absorb.rules) merged.set(ruleKey(r), r);
  return {
    appliedDisjunctively: true,
    rules: [...merged.values()],
  };
}

async function deleteCollection(access: ShopAccess, id: string) {
  const del = await shopifyGraphql(access, `
    mutation DeleteCollection($input: CollectionDeleteInput!) {
      collectionDelete(input: $input) {
        deletedCollectionId
        userErrors { field message }
      }
    }`, { input: { id } });
  const errs = del?.collectionDelete?.userErrors || [];
  if (errs.length) throw new Error(errs.map((e: { message: string }) => e.message).join("; "));
}

/**
 * Merge duplicate collections.
 * Custom: move product memberships then delete absorb.
 * Smart: merge rule sets into canonical, then delete absorb.
 */
export async function mergeCollections(
  access: ShopAccess,
  mergePlan: MergeCandidate[],
  opts: { dryRun?: boolean; handles?: string[] } = {},
): Promise<{ results: MergeResult[]; summary: Record<string, number> }> {
  const filter = opts.handles?.length ? new Set(opts.handles) : null;
  const collections = await fetchAllCollections(access);
  const byHandle = new Map(collections.map((c) => [c.handle, c]));
  const results: MergeResult[] = [];

  for (const merge of mergePlan) {
    if (filter && !filter.has(merge.absorb_handle)) continue;

    const canonical = byHandle.get(merge.canonical_handle);
    const absorb = byHandle.get(merge.absorb_handle);
    if (!absorb) {
      results.push({
        canonical_handle: merge.canonical_handle,
        absorb_handle: merge.absorb_handle,
        action: "skipped",
        products_moved: 0,
        error: "absorb collection not found on live store",
      });
      continue;
    }
    if (!canonical) {
      results.push({
        canonical_handle: merge.canonical_handle,
        absorb_handle: merge.absorb_handle,
        action: "skipped",
        products_moved: 0,
        error: "canonical collection not found on live store",
      });
      continue;
    }

    if (opts.dryRun !== false) {
      results.push({
        canonical_handle: merge.canonical_handle,
        absorb_handle: merge.absorb_handle,
        action: "dry_run",
        products_moved: absorb.products_count,
      });
      continue;
    }

    try {
      let moved = 0;
      const absorbNumericId = collectionNumericId(absorb.id);
      const canonicalNumericId = collectionNumericId(canonical.id);

      if (absorb.kind === "custom" && absorb.products_count > 0) {
        const collectsRes: any = await shopifyRest(
          access, "GET", `collects.json?collection_id=${absorbNumericId}&limit=250`,
        );
        for (const col of collectsRes?.collects || []) {
          try {
            await shopifyRest(access, "POST", "collects.json", {
              collect: { product_id: col.product_id, collection_id: canonicalNumericId },
            });
            moved++;
          } catch {
            // product may already be in canonical collection
          }
        }
      }

      if (absorb.kind === "smart") {
        const absorbRules = await fetchCollectionRules(access, absorb.id);
        if (absorbRules?.rules.length) {
          const canonicalRules = await fetchCollectionRules(access, canonical.id);
          const merged = mergeRuleSets(canonicalRules, absorbRules);
          const upd = await shopifyGraphql(access, COLLECTION_UPDATE_MUTATION, {
            input: {
              id: canonical.id,
              ruleSet: merged,
            },
          });
          const updErrs = upd?.collectionUpdate?.userErrors || [];
          if (updErrs.length) throw new Error(updErrs.map((e: { message: string }) => e.message).join("; "));
        }
        await deleteCollection(access, absorb.id);
        results.push({
          canonical_handle: merge.canonical_handle,
          absorb_handle: merge.absorb_handle,
          action: "merged",
          products_moved: absorb.products_count,
        });
        continue;
      }

      await deleteCollection(access, absorb.id);

      results.push({
        canonical_handle: merge.canonical_handle,
        absorb_handle: merge.absorb_handle,
        action: "merged",
        products_moved: moved,
      });
    } catch (e) {
      results.push({
        canonical_handle: merge.canonical_handle,
        absorb_handle: merge.absorb_handle,
        action: "failed",
        products_moved: 0,
        error: (e as Error).message,
      });
    }
  }

  const summary: Record<string, number> = {};
  for (const r of results) summary[r.action] = (summary[r.action] || 0) + 1;
  return { results, summary };
}

/** Read taxonomy approval from migration scope JSON */
export async function getTaxonomyApproval(
  admin: SupabaseClient,
  migrationId = EDP_MIGRATION_ID,
): Promise<TaxonomyApprovalState> {
  const { data } = await admin
    .from("cloner_migrations")
    .select("scope")
    .eq("id", migrationId)
    .maybeSingle();

  const scope = (data?.scope || {}) as Record<string, unknown>;
  const edp = (scope.edp_launch || {}) as Record<string, unknown>;
  const approval = (edp.taxonomy_approval || {}) as TaxonomyApprovalState;

  return {
    approved: !!approval.approved,
    approved_at: approval.approved_at,
    approved_by: approval.approved_by,
    taxonomy_version: approval.taxonomy_version || TAXONOMY_VERSION,
    merge_plan_hash: approval.merge_plan_hash,
    notes: approval.notes,
  };
}

/** Record taxonomy approval — unlocks handle rename + menu wiring */
export async function approveTaxonomy(
  admin: SupabaseClient,
  opts: {
    migrationId?: string;
    approvedBy?: string;
    notes?: string;
    mergePlanHash?: string;
  },
): Promise<TaxonomyApprovalState> {
  const migrationId = opts.migrationId || EDP_MIGRATION_ID;
  const { data: row } = await admin
    .from("cloner_migrations")
    .select("scope")
    .eq("id", migrationId)
    .single();

  const scope = { ...((row?.scope || {}) as Record<string, unknown>) };
  const approval: TaxonomyApprovalState = {
    approved: true,
    approved_at: new Date().toISOString(),
    approved_by: opts.approvedBy || "operator",
    taxonomy_version: TAXONOMY_VERSION,
    merge_plan_hash: opts.mergePlanHash,
    notes: opts.notes,
  };

  scope.edp_launch = {
    ...((scope.edp_launch || {}) as Record<string, unknown>),
    taxonomy_approval: approval,
  };

  await admin.from("cloner_migrations").update({ scope }).eq("id", migrationId);
  await admin.from("cloner_logs").insert({
    migration_id: migrationId,
    event: "edp_taxonomy_approved",
    level: "info",
    message: `Taxonomy approved (${TAXONOMY_VERSION}) by ${approval.approved_by}`,
    metadata: approval,
  });

  return approval;
}

export function formatTaxonomyMarkdown(
  audit: CollectionRow[],
  proposal: TaxonomyProposal,
  approval: TaxonomyApprovalState,
): string {
  const lines: string[] = [
    "# Phase 0 — Category Architecture Lock",
    "",
    `**Taxonomy approved:** ${approval.approved ? "YES" : "NO"}`,
    approval.approved_at ? `**Approved at:** ${approval.approved_at}` : "",
    "",
    "> Complete taxonomy approval before handle rename, menu wiring, or theme wiring.",
    "",
    "## 1. Collection audit",
    "",
    `| Metric | Count |`,
    `| --- | ---: |`,
    `| Total collections | ${proposal.collection_audit_summary.total} |`,
    `| In taxonomy | ${proposal.collection_audit_summary.in_taxonomy} |`,
    `| Orphaned (not in taxonomy) | ${proposal.collection_audit_summary.orphaned} |`,
    `| Duplicate merge groups | ${proposal.collection_audit_summary.duplicate_groups} |`,
    "",
  ];

  if (proposal.merge_plan.length) {
    lines.push("## 2. Merge plan", "");
    lines.push("| Canonical | Absorb | Products | Reason | Planned |");
    lines.push("| --- | --- | --- | --- | --- |");
    for (const m of proposal.merge_plan) {
      lines.push(`| \`${m.canonical_handle}\` | \`${m.absorb_handle}\` | ${m.absorb_products} | ${m.reason} | ${m.planned ? "yes" : "detected"} |`);
    }
    lines.push("");
  }

  lines.push("## 3. Category hierarchy", "");
  lines.push(...renderTaxonomyTree(CATEGORY_HIERARCHY, 0));
  lines.push("");

  lines.push("## 4. Menu hierarchy", "");
  lines.push("```");
  lines.push(renderMenuTree(MENU_DEFINITIONS[0]?.items || [], 0));
  lines.push("```");
  lines.push("");

  if (proposal.taxonomy_gaps.length) {
    lines.push("## Taxonomy gaps (missing source collections)", "");
    for (const g of proposal.taxonomy_gaps) {
      lines.push(`- **${g.node_id}** (\`${g.target_handle}\`): missing ${g.missing_sources.join(", ")}`);
    }
    lines.push("");
  }

  if (proposal.unmapped_live_collections.length) {
    lines.push("## Unmapped live collections (review)", "");
    lines.push("| Handle | Title | Products |");
    lines.push("| --- | --- | ---: |");
    for (const c of proposal.unmapped_live_collections.slice(0, 40)) {
      lines.push(`| \`${c.handle}\` | ${c.title} | ${c.products_count} |`);
    }
    if (proposal.unmapped_live_collections.length > 40) {
      lines.push(`\n_…and ${proposal.unmapped_live_collections.length - 40} more_`);
    }
    lines.push("");
  }

  if (!approval.approved) {
    lines.push("## 5. Approve taxonomy", "");
    lines.push("After reviewing merge plan and hierarchy:");
    lines.push("```");
    lines.push('POST edp-launch-prep { "action": "approve_taxonomy", "approved_by": "name", "confirm": true }');
    lines.push("```");
    lines.push("");
  }

  return lines.join("\n");
}

function renderTaxonomyTree(nodes: TaxonomyNode[], depth: number): string[] {
  const lines: string[] = [];
  const indent = "  ".repeat(depth);
  for (const n of nodes) {
    lines.push(`${indent}- **${n.title}** → \`${n.target_handle}\`${n.source_handles?.length ? ` ← ${n.source_handles.join(", ")}` : ""}`);
    if (n.children?.length) lines.push(...renderTaxonomyTree(n.children, depth + 1));
  }
  return lines;
}

function renderMenuTree(items: { title: string; url: string; items?: unknown[] }[], depth: number): string {
  const indent = "  ".repeat(depth);
  return items.map((it) => {
    const sub = it.items?.length
      ? "\n" + renderMenuTree(it.items as typeof items, depth + 1)
      : "";
    return `${indent}${it.title} (${it.url})${sub}`;
  }).join("\n");
}
