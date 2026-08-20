import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import {
  buildCollectionGapAudit,
  formatCollectionGapMarkdown,
  SMART_COLLECTION_RECOVERY_HANDLES,
  type CollectionGapAudit,
} from "./cloner-collection-gap-classifier.ts";
import { buildCollectionReconciliationAudit } from "./collection-reconciliation-audit.ts";

export type MigrationBlocker = {
  severity: "critical" | "high" | "medium" | "low";
  affected_objects: string[];
  recommended_fix: string;
};

export type MigrationAuditReport = {
  generated_at: string;
  migration_id: string;
  migration_name: string;
  products: {
    total_source: number;
    total_target: number;
    missing: number;
    failed: number;
  };
  collections: {
    total_source: number;
    total_target_live: number;
    total_target_db_published: number;
    on_target: number;
    intentionally_deleted_excluded: number;
    legacy_actionking_excluded: number;
    should_restore: number;
    unknown: number;
    pending_restore_approval: number;
    fixed: number;
    failed: number;
    smart_on_source_custom_on_target: number;
  };
  collection_gap: CollectionGapAudit;
  menus: {
    total_source: number;
    total_target: number;
    fixed: number;
    failed: number;
    skipped_limit: number;
  };
  product_validation: {
    missing_products: number;
    missing_variants: number;
    missing_images: number;
    missing_inventory: number;
    missing_metafields: number;
    samples: Record<string, unknown[]>;
  };
  remaining_blockers: MigrationBlocker[];
};

async function countItems(
  admin: SupabaseClient,
  migrationId: string,
  objectType: string,
  extra?: Record<string, string>,
) {
  let q = admin
    .from("cloner_migration_items")
    .select("id", { count: "exact", head: true })
    .eq("migration_id", migrationId)
    .eq("object_type", objectType);
  for (const [k, v] of Object.entries(extra || {})) q = q.eq(k, v);
  const { count } = await q;
  return count ?? 0;
}

async function lightweightProductValidation(
  admin: SupabaseClient,
  migrationId: string,
  limit = 500,
) {
  const { data: products } = await admin
    .from("cloner_migration_items")
    .select("id,source_handle,publish_status,target_id,source_payload,error")
    .eq("migration_id", migrationId)
    .eq("object_type", "product")
    .eq("publish_status", "published")
    .limit(limit);

  let missing_products = 0;
  let missing_variants = 0;
  let missing_images = 0;
  let missing_inventory = 0;
  let missing_metafields = 0;
  const samples: Record<string, unknown[]> = {
    missing_products: [],
    missing_variants: [],
    missing_images: [],
    missing_inventory: [],
    missing_metafields: [],
  };

  for (const p of products || []) {
    if (!p.target_id) {
      missing_products++;
      if (samples.missing_products.length < 20) {
        samples.missing_products.push({ handle: p.source_handle, error: p.error });
      }
      continue;
    }
    const src = p.source_payload || {};
    const variants = src.variants?.nodes || [];
    const images = src.media?.nodes || [];
    const metafields = src.metafields?.nodes || [];

    if (!variants.length) {
      missing_variants++;
      if (samples.missing_variants.length < 20) samples.missing_variants.push({ handle: p.source_handle });
    }
    if (!images.length) {
      missing_images++;
      if (samples.missing_images.length < 20) samples.missing_images.push({ handle: p.source_handle });
    }
    const untracked = variants.filter((v: any) => v.inventoryItem?.tracked && (v.inventoryQuantity ?? 0) === 0);
    if (untracked.length === variants.length && variants.length > 0) {
      missing_inventory++;
      if (samples.missing_inventory.length < 20) samples.missing_inventory.push({ handle: p.source_handle });
    }
    if (!metafields.length) {
      missing_metafields++;
      if (samples.missing_metafields.length < 20) samples.missing_metafields.push({ handle: p.source_handle });
    }
  }

  return { missing_products, missing_variants, missing_images, missing_inventory, missing_metafields, samples };
}

export async function buildMigrationAuditReport(
  admin: SupabaseClient,
  opts: {
    migrationId: string;
    approvedRestoreHandles?: string[];
    collectionFixSummary?: { fixed: number; failed: number };
    menuFixSummary?: { fixed: number; failed: number; skipped_limit: number };
  },
): Promise<MigrationAuditReport> {
  const { data: migration } = await admin.from("cloner_migrations").select("*").eq("id", opts.migrationId).single();
  const { data: source } = await admin.from("cloner_stores").select("*").eq("id", migration!.source_store_id).single();
  const { data: target } = await admin.from("cloner_stores").select("*").eq("id", migration!.target_store_id).single();

  const [collectionGap, collectionAudit] = await Promise.all([
    buildCollectionGapAudit(admin, {
      migrationId: opts.migrationId,
      migrationName: migration!.name,
      sourceStore: source,
      targetStore: target!,
      approvedRestoreHandles: opts.approvedRestoreHandles,
    }),
    buildCollectionReconciliationAudit(admin, {
      migrationId: opts.migrationId,
      migrationName: migration!.name,
      resolution: "migration_audit_report",
      sourceStore: source,
      targetStore: target!,
    }),
  ]);

  const targetByHandle = new Map(collectionAudit.TARGET_COLLECTIONS.map((c) => [c.handle, c]));
  const smartCustomMismatch = SMART_COLLECTION_RECOVERY_HANDLES.filter((h) => {
    const t = targetByHandle.get(h);
    return t && t.kind === "custom";
  });

  const [
    productSource,
    productPublished,
    productFailed,
    menuSource,
    menuPublished,
    menuFailed,
    collectionFailed,
    productValidation,
  ] = await Promise.all([
    countItems(admin, opts.migrationId, "product"),
    countItems(admin, opts.migrationId, "product", { publish_status: "published" }),
    countItems(admin, opts.migrationId, "product", { publish_status: "failed" }),
    countItems(admin, opts.migrationId, "menu"),
    countItems(admin, opts.migrationId, "menu", { publish_status: "published" }),
    countItems(admin, opts.migrationId, "menu", { publish_status: "failed" }),
    countItems(admin, opts.migrationId, "collection", { publish_status: "failed" }),
    lightweightProductValidation(admin, opts.migrationId, 800),
  ]);

  const blockers: MigrationBlocker[] = [];

  if (collectionGap.counts.pending_restore_approval > 0) {
    blockers.push({
      severity: "medium",
      affected_objects: collectionGap.pending_restore_approval.slice(0, 25).map((c) => c.handle),
      recommended_fix:
        `${collectionGap.counts.pending_restore_approval} collection(s) are required by live products, current menus, or approved DJI smart collections but are missing on live target. Review pending_restore_approval list and pass approved_restore_handles before any restore. Legacy ActionKing collections are never restored.`,
    });
  }

  if (collectionGap.counts.unknown > 0) {
    blockers.push({
      severity: "low",
      affected_objects: collectionGap.unknown.slice(0, 15).map((c) => c.handle),
      recommended_fix:
        `${collectionGap.counts.unknown} collection(s) are missing on live target with no restore signal. Classify manually; do not bulk-republish.`,
    });
  }

  if (smartCustomMismatch.length) {
    blockers.push({
      severity: "high",
      affected_objects: [...smartCustomMismatch],
      recommended_fix:
        "Run smart_collection_mapping_fix for SMART_COLLECTION_RECOVERY_HANDLES (DJI drone smart collections; in-place rule remapping via collectionUpdate; not a bulk restore).",
    });
  }

  if (collectionFailed > 0) {
    blockers.push({
      severity: "high",
      affected_objects: [`${collectionFailed} collection migration items`],
      recommended_fix: "Inspect cloner_migration_items.error for failed collections; ensure metafield definitions are mapped on target before re-publish.",
    });
  }

  if (menuFailed > 0) {
    blockers.push({
      severity: "high",
      affected_objects: [`${menuFailed} menu migration items`],
      recommended_fix: "Run menu_recovery_fix to prune invalid links and menuUpdate existing menus. Only live collections or approved_restore_handles are used.",
    });
  }

  if ((opts.menuFixSummary?.skipped_limit || 0) > 0) {
    blockers.push({
      severity: "medium",
      affected_objects: [`${opts.menuFixSummary!.skipped_limit} menus`],
      recommended_fix: "Shopify menu limit reached. Update existing menus via menuUpdate or remove unused menus in Admin.",
    });
  }

  if (productFailed > 0) {
    blockers.push({
      severity: "high",
      affected_objects: [`${productFailed} products`],
      recommended_fix: "Review failed product publish errors; reset publish_status to idle and re-publish after fixing root cause.",
    });
  }

  if (productValidation.missing_products > 0) {
    blockers.push({
      severity: "medium",
      affected_objects: productValidation.samples.missing_products.map((s: any) => s.handle).filter(Boolean) as string[],
      recommended_fix: "Published products missing target_id — re-publish or verify publish batch completed.",
    });
  }

  return {
    generated_at: new Date().toISOString(),
    migration_id: opts.migrationId,
    migration_name: migration!.name,
    products: {
      total_source: productSource,
      total_target: productPublished,
      missing: Math.max(0, productSource - productPublished),
      failed: productFailed,
    },
    collections: {
      total_source: collectionGap.comparison.source_collections,
      total_target_live: collectionGap.comparison.live_target_collections,
      total_target_db_published: collectionGap.comparison.db_published,
      on_target: collectionGap.counts.on_target,
      intentionally_deleted_excluded: collectionGap.counts.intentionally_deleted_excluded,
      legacy_actionking_excluded: collectionGap.counts.legacy_actionking_excluded,
      should_restore: collectionGap.counts.should_restore,
      unknown: collectionGap.counts.unknown,
      pending_restore_approval: collectionGap.counts.pending_restore_approval,
      fixed: opts.collectionFixSummary?.fixed ?? 0,
      failed: opts.collectionFixSummary?.failed ?? collectionFailed,
      smart_on_source_custom_on_target: smartCustomMismatch.length,
    },
    collection_gap: collectionGap,
    menus: {
      total_source: menuSource,
      total_target: menuPublished,
      fixed: opts.menuFixSummary?.fixed ?? 0,
      failed: opts.menuFixSummary?.failed ?? menuFailed,
      skipped_limit: opts.menuFixSummary?.skipped_limit ?? 0,
    },
    product_validation: productValidation,
    remaining_blockers: blockers,
  };
}

export function formatMigrationAuditMarkdown(report: MigrationAuditReport): string {
  const lines = [
    "# EuroDroneParts Migration Audit",
    "",
    `**Generated:** ${report.generated_at}`,
    `**Migration:** ${report.migration_name} (\`${report.migration_id}\`)`,
    "",
    "## Products",
    "",
    "| Metric | Count |",
    "|---|---:|",
    `| Total source | ${report.products.total_source} |`,
    `| Total target (published in DB) | ${report.products.total_target} |`,
    `| Missing | ${report.products.missing} |`,
    `| Failed | ${report.products.failed} |`,
    "",
    "## Collections (three-way comparison)",
    "",
    "| Metric | Count |",
    "|---|---:|",
    `| Source (migration scan) | ${report.collections.total_source} |`,
    `| Migration DB published | ${report.collections.total_target_db_published} |`,
    `| Live target Shopify | ${report.collections.total_target_live} |`,
    `| On target (handle match) | ${report.collections.on_target} |`,
    `| Intentionally deleted / excluded | ${report.collections.intentionally_deleted_excluded} |`,
    `| Legacy ActionKing (forced exclude) | ${report.collections.legacy_actionking_excluded} |`,
    `| Should restore (live product / menu / DJI smart) | ${report.collections.should_restore} |`,
    `| Unknown | ${report.collections.unknown} |`,
    `| Pending manual restore approval | ${report.collections.pending_restore_approval} |`,
    `| Smart mapping fixed (this pass) | ${report.collections.fixed} |`,
    `| Failed | ${report.collections.failed} |`,
    `| Smart on source / custom on target (DJI recovery scope) | ${report.collections.smart_on_source_custom_on_target} |`,
    "",
    "## Menus",
    "",
    "| Metric | Count |",
    "|---|---:|",
    `| Total source | ${report.menus.total_source} |`,
    `| Published in DB | ${report.menus.total_target} |`,
    `| Fixed (this pass) | ${report.menus.fixed} |`,
    `| Failed | ${report.menus.failed} |`,
    `| Skipped (menu limit) | ${report.menus.skipped_limit} |`,
    "",
    "## Product validation (read-only sample)",
    "",
    "| Check | Missing |",
    "|---|---:|",
    `| Products without target_id | ${report.product_validation.missing_products} |`,
    `| Products without variants in source scan | ${report.product_validation.missing_variants} |`,
    `| Products without images in source scan | ${report.product_validation.missing_images} |`,
    `| Products with zero inventory (tracked) | ${report.product_validation.missing_inventory} |`,
    `| Products without metafields in source scan | ${report.product_validation.missing_metafields} |`,
    "",
    "## Remaining blockers",
    "",
  ];

  if (!report.remaining_blockers.length) {
    lines.push("_No blockers identified._");
  } else {
    for (const b of report.remaining_blockers) {
      lines.push(`### ${b.severity.toUpperCase()}`);
      lines.push("");
      lines.push(`**Affected:** ${b.affected_objects.slice(0, 15).join(", ")}${b.affected_objects.length > 15 ? "…" : ""}`);
      lines.push("");
      lines.push(`**Recommended fix:** ${b.recommended_fix}`);
      lines.push("");
    }
  }

  lines.push("---", "", formatCollectionGapMarkdown(report.collection_gap));

  return lines.join("\n");
}
