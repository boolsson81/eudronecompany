/**
 * Supplier import draft safety — never publish unverified supplier products to Online Store.
 */
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export const SUPPLIER_INVENTORY_SOURCES = [
  "sunsky_api",
  "ftp",
  "ftp_import",
  "supplier",
  "dropship",
  "clone",
] as const;

export type SupplierOrigin = "sunsky" | "ftp" | "clone" | "supplier" | "unknown";

export type DraftSafetyContext = {
  shopId: string;
  functionName: string;
  sku?: string | null;
  pageId?: string | null;
  inventorySource?: string | null;
  supplierOrigin?: SupplierOrigin;
  requestedStatus?: string | null;
  supplierMetadata?: Record<string, unknown> | null;
  /** Manual launch approval or explicit staff sign-off */
  explicitlyApproved?: boolean;
};

export type DraftSafetyAction =
  | "force_draft"
  | "block_active"
  | "block_channel_publish"
  | "block_launch_activate";

export function isSupplierInventorySource(source?: string | null): boolean {
  if (!source) return false;
  return (SUPPLIER_INVENTORY_SOURCES as readonly string[]).includes(source);
}

export function isSupplierImport(ctx: Pick<DraftSafetyContext, "supplierOrigin" | "inventorySource">): boolean {
  if (ctx.supplierOrigin && ctx.supplierOrigin !== "unknown") return true;
  return isSupplierInventorySource(ctx.inventorySource);
}

export function isInventoryFlowVerified(ctx: Pick<DraftSafetyContext, "supplierMetadata">): boolean {
  const meta = ctx.supplierMetadata ?? {};
  return meta.inventory_flow_verified === true || meta.inventory_verified === true;
}

export function canActivateSupplierProduct(ctx: DraftSafetyContext): { allowed: boolean; reason: string } {
  if (!isSupplierImport(ctx)) {
    return { allowed: true, reason: "not_supplier_import" };
  }
  if (!ctx.explicitlyApproved) {
    return { allowed: false, reason: "manual_approval_required" };
  }
  if (!isInventoryFlowVerified(ctx)) {
    return { allowed: false, reason: "inventory_source_unverified" };
  }
  return { allowed: true, reason: "approved_and_verified" };
}

export function resolveShopifyProductStatus(ctx: DraftSafetyContext): "DRAFT" | "ACTIVE" {
  const requested = String(ctx.requestedStatus ?? "DRAFT").toUpperCase();
  if (!isSupplierImport(ctx)) {
    return requested === "ACTIVE" ? "ACTIVE" : "DRAFT";
  }
  if (requested === "ACTIVE" && canActivateSupplierProduct({ ...ctx, explicitlyApproved: true }).allowed) {
    return "ACTIVE";
  }
  return "DRAFT";
}

export function canPublishToSalesChannels(ctx: DraftSafetyContext): boolean {
  if (!isSupplierImport(ctx)) return true;
  return canActivateSupplierProduct(ctx).allowed;
}

export function applyDraftSafetyToProductInput(
  productInput: Record<string, unknown>,
  ctx: DraftSafetyContext,
): { status: "DRAFT" | "ACTIVE"; forced: boolean; reason?: string } {
  const requested = String(productInput.status ?? ctx.requestedStatus ?? "DRAFT").toUpperCase();
  const resolved = resolveShopifyProductStatus({ ...ctx, requestedStatus: requested });
  const forced = isSupplierImport(ctx) && resolved === "DRAFT" && requested !== "DRAFT";
  productInput.status = resolved;
  return {
    status: resolved,
    forced,
    reason: forced
      ? requested === "ACTIVE"
        ? "active_blocked_pending_approval_or_verification"
        : "supplier_default_draft"
      : undefined,
  };
}

export async function logDraftSafetyEvent(
  supabase: SupabaseClient,
  entry: {
    shopId: string;
    functionName: string;
    sku?: string | null;
    pageId?: string | null;
    action: DraftSafetyAction;
    requestedStatus?: string | null;
    enforcedStatus?: string | null;
    reason: string;
    inventorySource?: string | null;
    metadata?: Record<string, unknown> | null;
  },
): Promise<void> {
  console.log(
    `[draft-safety] ${entry.functionName} ${entry.action} sku=${entry.sku ?? "?"}: ${entry.reason}`,
  );
  try {
    await supabase.from("product_draft_safety_log").insert({
      shop_id: entry.shopId,
      function_name: entry.functionName,
      sku: entry.sku ?? null,
      page_id: entry.pageId ?? null,
      action: entry.action,
      requested_status: entry.requestedStatus ?? null,
      enforced_status: entry.enforcedStatus ?? null,
      reason: entry.reason,
      inventory_source: entry.inventorySource ?? null,
      metadata: entry.metadata ?? null,
    });
  } catch (e) {
    console.warn("[draft-safety] failed to persist log:", e);
  }
}

export async function guardSalesChannelPublish(
  supabase: SupabaseClient,
  ctx: DraftSafetyContext,
  publishFn: () => Promise<void>,
): Promise<boolean> {
  if (canPublishToSalesChannels(ctx)) {
    await publishFn();
    return true;
  }
  const check = canActivateSupplierProduct(ctx);
  await logDraftSafetyEvent(supabase, {
    shopId: ctx.shopId,
    functionName: ctx.functionName,
    sku: ctx.sku,
    pageId: ctx.pageId,
    action: "block_channel_publish",
    requestedStatus: "ACTIVE",
    enforcedStatus: "DRAFT",
    reason: check.reason,
    inventorySource: ctx.inventorySource ?? null,
  });
  return false;
}
