import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { buildCollectionReconciliationAudit } from "./collection-reconciliation-audit.ts";
import { resolveShopAccess, shopifyGraphql } from "./cloner-shopify-access.ts";

/**
 * DJI drone accessory smart collections approved for in-place rule recovery.
 * Scoped to EuroDroneParts drone category strategy — non-drone and legacy
 * ActionKing merchandising collections are listed in EXCLUDED_SMART_COLLECTION_RECOVERY_HANDLES.
 */
export const SMART_COLLECTION_RECOVERY_HANDLES = [
  "dji-air-3-tillbehor-omfattande-sortiment",
  "dji-avata-2-tillbehor",
  "dji-flip-tillbehor",
  "dji-mini-3-tillbehor",
  "dji-neo-2-tillbehor",
  "dji-neo-tillbehor",
] as const;

/** Former recovery candidates removed from scope (not EuroDroneParts drone category strategy). */
export const EXCLUDED_SMART_COLLECTION_RECOVERY_HANDLES: ReadonlyArray<{
  handle: string;
  title: string;
  exclusion_reason: string;
}> = [
  {
    handle: "dji-air-2-tillbehor",
    title: "Högkvalitativa DJI Air 2 Tillbehör för Drönare",
    exclusion_reason: "legacy_dji_air_2_not_in_current_eurodroneparts_strategy",
  },
  {
    handle: "dronare-reservdelar-ovriga",
    title: "Drönare reservdelar: Allt för din drönarreparation",
    exclusion_reason: "generic_catch_all_not_model_specific_category",
  },
  {
    handle: "kamerastativ-tripod",
    title: "Kamerastativ & Tripod – Stabilt Mobil- och Kamerastativ",
    exclusion_reason: "non_drone_camera_tripod_merchandising",
  },
  {
    handle: "osmo-action-6-tillbehor",
    title: "Osmo Action 6 tillbehör: Komplett utbud för din actionkamera",
    exclusion_reason: "non_drone_osmo_action_camera_accessories",
  },
  {
    handle: "tillbehor-dji-inspire",
    title: "DJI Inspire Tillbehör",
    exclusion_reason: "legacy_pro_line_not_in_active_dji_product_families_launch",
  },
] as const;

const LIVE_MENUS_QUERY = `
  query LiveMenus($cursor: String) {
    menus(first: 50, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      nodes { id handle title }
    }
  }
`;

/** Legacy ActionKing-era collection handles/titles — never candidates for restore. */
const LEGACY_HANDLE_PATTERNS = [
  /^actionking/i,
  /actionking/i,
  /^alla-produkter-actionking/i,
  /^actionking-/i,
  /^ak-actionkamera/i,
  /^bastsaljare$/i,
  /^actionkamer-dji-gopro-insta360/i,
  /^dronare-actionking/i,
];

export type CollectionGapClassification =
  | "on_target"
  | "intentionally_deleted_excluded"
  | "should_restore"
  | "unknown";

export type ClassifiedCollectionGap = {
  handle: string;
  title: string;
  kind: "custom" | "smart";
  classification: CollectionGapClassification;
  reasons: string[];
  db_publish_status: string | null;
  db_target_id: string | null;
  db_approval_status: string | null;
  required_by: string[];
  approved_for_restore: boolean;
};

export type CollectionGapAudit = {
  generated_at: string;
  migration_id: string;
  restore_policy: {
    allowed_signals: string[];
    excluded: string[];
  };
  comparison: {
    source_collections: number;
    db_published: number;
    live_target_collections: number;
    on_target: number;
    missing_on_live: number;
  };
  counts: {
    on_target: number;
    intentionally_deleted_excluded: number;
    should_restore: number;
    unknown: number;
    pending_restore_approval: number;
    legacy_actionking_excluded: number;
  };
  intentionally_deleted_excluded: ClassifiedCollectionGap[];
  should_restore: ClassifiedCollectionGap[];
  unknown: ClassifiedCollectionGap[];
  /** Subset of should_restore not yet in approved_restore_handles — manual approval required before restore. */
  pending_restore_approval: ClassifiedCollectionGap[];
  on_target_handles: string[];
};

type MigrationCollectionRow = {
  id: string;
  source_handle: string | null;
  source_payload: any;
  publish_status: string | null;
  approval_status: string | null;
  target_id: string | null;
};

function urlCollectionHandle(url: string): string | null {
  const m = String(url || "").match(/\/collections\/([^/?#]+)/);
  return m ? m[1] : null;
}

export function isLegacyActionKingCollection(handle: string, title = ""): boolean {
  const h = String(handle || "").trim();
  const blob = `${h} ${title}`.toLowerCase();
  if (blob.includes("actionking") || blob.includes("action king")) return true;
  return LEGACY_HANDLE_PATTERNS.some((re) => re.test(h));
}

async function fetchMigrationCollections(admin: SupabaseClient, migrationId: string): Promise<MigrationCollectionRow[]> {
  const rows: MigrationCollectionRow[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await admin
      .from("cloner_migration_items")
      .select("id,source_handle,source_payload,publish_status,approval_status,target_id")
      .eq("migration_id", migrationId)
      .eq("object_type", "collection")
      .order("source_handle", { ascending: true })
      .range(from, from + 999);
    if (error) throw error;
    rows.push(...((data || []) as MigrationCollectionRow[]));
    if (!data || data.length < 1000) break;
  }
  return rows;
}

/** Collection handles referenced by products published live on the target store. */
async function fetchLiveProductCollectionRefs(
  admin: SupabaseClient,
  migrationId: string,
): Promise<Map<string, Set<string>>> {
  const refs = new Map<string, Set<string>>();
  for (let from = 0; ; from += 500) {
    const { data } = await admin
      .from("cloner_migration_items")
      .select("source_payload,publish_status,target_id,source_handle")
      .eq("migration_id", migrationId)
      .eq("object_type", "product")
      .eq("publish_status", "published")
      .not("target_id", "is", null)
      .range(from, from + 499);
    for (const row of data || []) {
      const nodes = row.source_payload?.collections?.nodes || [];
      for (const col of nodes) {
        const h = String(col?.handle || "").trim();
        if (!h) continue;
        if (!refs.has(h)) refs.set(h, new Set());
        refs.get(h)!.add(`live_product:${row.source_handle || "product"}`);
      }
    }
    if (!data || data.length < 500) break;
  }
  return refs;
}

async function fetchLiveTargetMenuHandles(
  targetStore: { shop_domain?: string | null; access_token?: string | null; api_version?: string | null },
): Promise<Set<string>> {
  const access = await resolveShopAccess(targetStore);
  const handles = new Set<string>();
  let cursor: string | null = null;
  for (let page = 0; page < 10; page++) {
    const data = await shopifyGraphql(access, LIVE_MENUS_QUERY, { cursor });
    for (const node of data?.menus?.nodes || []) {
      if (node?.handle) handles.add(String(node.handle));
    }
    if (!data?.menus?.pageInfo?.hasNextPage) break;
    cursor = data.menus.pageInfo.endCursor;
  }
  return handles;
}

/**
 * Collection handles referenced by menus that exist on the live EuroDroneParts target.
 * Uses migration menu payloads only for menus whose handle is present on the target store.
 */
async function fetchCurrentMenuCollectionRefs(
  admin: SupabaseClient,
  migrationId: string,
  liveMenuHandles: Set<string>,
): Promise<Map<string, Set<string>>> {
  const refs = new Map<string, Set<string>>();
  const { data: menus } = await admin
    .from("cloner_migration_items")
    .select("source_payload,source_handle,publish_status,target_id")
    .eq("migration_id", migrationId)
    .eq("object_type", "menu");

  for (const menu of menus || []) {
    const menuHandle = String(menu.source_handle || menu.source_payload?.handle || "").trim();
    if (!menuHandle || !liveMenuHandles.has(menuHandle)) continue;

    for (const item of menu.source_payload?.items || []) {
      if (String(item?.type || "").toUpperCase() !== "COLLECTION") continue;
      const h = urlCollectionHandle(item.url);
      if (!h) continue;
      if (!refs.has(h)) refs.set(h, new Set());
      refs.get(h)!.add(`current_menu:${menuHandle}`);
    }
  }
  return refs;
}

function collectionKind(payload: any): "custom" | "smart" {
  const rules = payload?.ruleSet?.rules;
  return Array.isArray(rules) && rules.length > 0 ? "smart" : "custom";
}

function isApprovedDjiSmartCollection(handle: string): boolean {
  return (SMART_COLLECTION_RECOVERY_HANDLES as readonly string[]).includes(handle);
}

/**
 * Restore eligibility is strict: live products, current live menus, or approved DJI smart collections only.
 * seo_targets and legacy ActionKing collections are never restore triggers.
 */
function buildRestoreRequiredBy(
  handle: string,
  productRefs: Map<string, Set<string>>,
  menuRefs: Map<string, Set<string>>,
): string[] {
  const required = new Set<string>();
  for (const r of productRefs.get(handle) || []) required.add(r);
  for (const r of menuRefs.get(handle) || []) required.add(r);
  if (isApprovedDjiSmartCollection(handle)) required.add("approved_dji_smart_collection");
  return [...required];
}

function classifyMissingGap(
  item: MigrationCollectionRow,
  title: string,
  requiredBy: string[],
): { classification: CollectionGapClassification; reasons: string[] } {
  const publishStatus = String(item.publish_status || "");
  const approvalStatus = String(item.approval_status || "");
  const handle = String(item.source_handle || item.source_payload?.handle || "");

  if (isLegacyActionKingCollection(handle, title)) {
    return { classification: "intentionally_deleted_excluded", reasons: ["legacy_actionking_collection"] };
  }

  if (approvalStatus === "rejected") {
    return { classification: "intentionally_deleted_excluded", reasons: ["approval_status=rejected"] };
  }
  if (publishStatus === "skipped") {
    return { classification: "intentionally_deleted_excluded", reasons: ["publish_status=skipped"] };
  }

  if (requiredBy.length > 0) {
    return {
      classification: "should_restore",
      reasons: requiredBy.map((r) => `required_by:${r}`),
    };
  }

  if (publishStatus === "published" && item.target_id) {
    return {
      classification: "intentionally_deleted_excluded",
      reasons: ["published_in_migration_db_then_removed_from_live_target"],
    };
  }

  if (publishStatus === "failed") {
    return { classification: "unknown", reasons: ["publish_failed_not_referenced_by_live_catalog"] };
  }

  return { classification: "unknown", reasons: ["missing_on_live_no_restore_signal"] };
}

export async function buildCollectionGapAudit(
  admin: SupabaseClient,
  opts: {
    migrationId: string;
    migrationName: string;
    sourceStore: { id: string; label?: string | null; shop_domain?: string | null } | null;
    targetStore: { id: string; label?: string | null; shop_domain?: string | null; access_token?: string | null; api_version?: string | null };
    approvedRestoreHandles?: string[];
  },
): Promise<CollectionGapAudit> {
  const approvedRestore = new Set((opts.approvedRestoreHandles || []).map((h) => h.trim()).filter(Boolean));

  const [reconciliation, migrationCollections, productRefs, liveMenuHandles] = await Promise.all([
    buildCollectionReconciliationAudit(admin, {
      migrationId: opts.migrationId,
      migrationName: opts.migrationName,
      resolution: "collection_gap_audit",
      sourceStore: opts.sourceStore,
      targetStore: opts.targetStore,
    }),
    fetchMigrationCollections(admin, opts.migrationId),
    fetchLiveProductCollectionRefs(admin, opts.migrationId),
    fetchLiveTargetMenuHandles(opts.targetStore),
  ]);

  const menuRefs = await fetchCurrentMenuCollectionRefs(admin, opts.migrationId, liveMenuHandles);

  const liveHandles = new Set(reconciliation.TARGET_COLLECTIONS.map((c) => c.handle));
  const sourceByHandle = new Map(
    reconciliation.SOURCE_COLLECTIONS.map((c) => [c.handle, c]),
  );

  const intentionally_deleted_excluded: ClassifiedCollectionGap[] = [];
  const should_restore: ClassifiedCollectionGap[] = [];
  const unknown: ClassifiedCollectionGap[] = [];
  const on_target_handles: string[] = [];
  let legacy_actionking_excluded = 0;

  for (const item of migrationCollections) {
    const handle = String(item.source_handle || item.source_payload?.handle || "").trim();
    if (!handle) continue;

    const payload = item.source_payload || {};
    const sourceRow = sourceByHandle.get(handle);
    const title = String(payload.title || sourceRow?.title || handle);
    const kind = sourceRow?.kind || collectionKind(payload);

    if (liveHandles.has(handle)) {
      on_target_handles.push(handle);
      continue;
    }

    const requiredList = buildRestoreRequiredBy(handle, productRefs, menuRefs);
    const { classification, reasons } = classifyMissingGap(item, title, requiredList);

    if (reasons.includes("legacy_actionking_collection")) legacy_actionking_excluded++;

    const row: ClassifiedCollectionGap = {
      handle,
      title,
      kind,
      classification,
      reasons,
      db_publish_status: item.publish_status,
      db_target_id: item.target_id,
      db_approval_status: item.approval_status,
      required_by: requiredList,
      approved_for_restore: approvedRestore.has(handle),
    };

    if (classification === "intentionally_deleted_excluded") intentionally_deleted_excluded.push(row);
    else if (classification === "should_restore") should_restore.push(row);
    else unknown.push(row);
  }

  const pending_restore_approval = should_restore.filter((r) => !r.approved_for_restore);

  return {
    generated_at: new Date().toISOString(),
    migration_id: opts.migrationId,
    restore_policy: {
      allowed_signals: [
        "live_product (published on target with target_id)",
        "current_menu (menu handle exists on live EuroDroneParts store)",
        `approved_dji_smart_collection (${SMART_COLLECTION_RECOVERY_HANDLES.length} DJI drone smart collection handles only)`,
      ],
      excluded: [
        "seo_targets (not used for restore eligibility)",
        "legacy ActionKing collections (actionking handles/titles)",
        "bulk republish of intentionally deleted collections",
      ],
    },
    comparison: {
      source_collections: reconciliation.counts.source_collections,
      db_published: reconciliation.counts.published_on_target,
      live_target_collections: reconciliation.counts.target_collections,
      on_target: on_target_handles.length,
      missing_on_live: intentionally_deleted_excluded.length + should_restore.length + unknown.length,
    },
    counts: {
      on_target: on_target_handles.length,
      intentionally_deleted_excluded: intentionally_deleted_excluded.length,
      should_restore: should_restore.length,
      unknown: unknown.length,
      pending_restore_approval: pending_restore_approval.length,
      legacy_actionking_excluded,
    },
    intentionally_deleted_excluded,
    should_restore,
    unknown,
    pending_restore_approval,
    on_target_handles,
  };
}

export function formatCollectionGapMarkdown(audit: CollectionGapAudit): string {
  const lines = [
    "# Collection gap classification",
    "",
    `**Generated:** ${audit.generated_at}`,
    `**Migration:** \`${audit.migration_id}\``,
    "",
    "## Restore policy",
    "",
    "**Allowed restore signals:**",
    ...audit.restore_policy.allowed_signals.map((s) => `- ${s}`),
    "",
    "**Excluded:**",
    ...audit.restore_policy.excluded.map((s) => `- ${s}`),
    "",
    "## Three-way comparison",
    "",
    "| Layer | Count |",
    "|---|---:|",
    `| Source (migration scan) | ${audit.comparison.source_collections} |`,
    `| Migration DB (publish_status=published) | ${audit.comparison.db_published} |`,
    `| Live target Shopify | ${audit.comparison.live_target_collections} |`,
    `| On target (handle match) | ${audit.comparison.on_target} |`,
    `| Missing on live | ${audit.comparison.missing_on_live} |`,
    "",
    "## Classification summary",
    "",
    "| Classification | Count |",
    "|---|---:|",
    `| On target | ${audit.counts.on_target} |`,
    `| Intentionally deleted / excluded | ${audit.counts.intentionally_deleted_excluded} |`,
    `| Legacy ActionKing (forced exclude) | ${audit.counts.legacy_actionking_excluded} |`,
    `| Should restore (required) | ${audit.counts.should_restore} |`,
    `| Unknown | ${audit.counts.unknown} |`,
    `| Pending manual restore approval | ${audit.counts.pending_restore_approval} |`,
    "",
  ];

  if (audit.pending_restore_approval.length) {
    lines.push("## Pending restore approval (manual sign-off required)", "");
    lines.push("| Handle | Title | Required by | DB status |");
    lines.push("| --- | --- | --- | --- |");
    for (const row of audit.pending_restore_approval.slice(0, 100)) {
      lines.push(
        `| ${row.handle} | ${row.title.replace(/\|/g, "\\|")} | ${row.required_by.join(", ")} | ${row.db_publish_status} |`,
      );
    }
    if (audit.pending_restore_approval.length > 100) {
      lines.push("", `_…and ${audit.pending_restore_approval.length - 100} more._`);
    }
    lines.push("");
  } else {
    lines.push("## Pending restore approval", "", "_No collections currently require restore approval._", "");
  }

  if (audit.should_restore.length) {
    lines.push("## Should restore (live product / current menu / approved DJI smart only)", "");
    for (const row of audit.should_restore.slice(0, 30)) {
      lines.push(`- \`${row.handle}\` — ${row.title} (${row.required_by.join(", ")})${row.approved_for_restore ? " ✓ approved" : ""}`);
    }
    if (audit.should_restore.length > 30) lines.push(`- …and ${audit.should_restore.length - 30} more`);
    lines.push("");
  }

  lines.push(
    "## Note",
    "",
    "Collections classified as **intentionally deleted / excluded** were published in the migration DB and later removed from the live target, or are legacy ActionKing collections. They are **not** republished automatically.",
    "",
    `Smart collection rule recovery runs only for DJI drone handles in \`SMART_COLLECTION_RECOVERY_HANDLES\` (${SMART_COLLECTION_RECOVERY_HANDLES.length} collections; in-place rule remapping, not bulk restore).`,
    "",
  );

  return lines.join("\n");
}

/** Collections a menu link may reference: exists on live target OR explicitly approved for restore. */
export function allowedMenuCollectionHandles(
  liveCollections: Set<string>,
  approvedRestoreHandles: Set<string>,
): Set<string> {
  const allowed = new Set(liveCollections);
  for (const h of approvedRestoreHandles) {
    if (!isLegacyActionKingCollection(h)) allowed.add(h);
  }
  return allowed;
}

export function isSmartCollectionRecoveryHandle(handle: string): boolean {
  return isApprovedDjiSmartCollection(handle);
}
