/**
 * Run: deno test supabase/functions/_shared/product-draft-safety.test.ts
 */
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  applyDraftSafetyToProductInput,
  canActivateSupplierProduct,
  canPublishToSalesChannels,
  resolveShopifyProductStatus,
} from "./product-draft-safety.ts";

const baseCtx = {
  shopId: "shop-1",
  functionName: "test",
  inventorySource: "sunsky_api",
  supplierOrigin: "sunsky" as const,
};

Deno.test("supplier import defaults to DRAFT", () => {
  assertEquals(resolveShopifyProductStatus({ ...baseCtx, requestedStatus: "DRAFT" }), "DRAFT");
  assertEquals(resolveShopifyProductStatus({ ...baseCtx, requestedStatus: "ACTIVE" }), "DRAFT");
});

Deno.test("ACTIVE blocked without approval and verification", () => {
  const blocked = canActivateSupplierProduct({ ...baseCtx, explicitlyApproved: true });
  assertEquals(blocked.allowed, false);
  assertEquals(blocked.reason, "inventory_source_unverified");
});

Deno.test("ACTIVE allowed when approved and verified", () => {
  const ok = canActivateSupplierProduct({
    ...baseCtx,
    explicitlyApproved: true,
    supplierMetadata: { inventory_flow_verified: true },
  });
  assertEquals(ok.allowed, true);
  assertEquals(
    resolveShopifyProductStatus({
      ...baseCtx,
      requestedStatus: "ACTIVE",
      explicitlyApproved: true,
      supplierMetadata: { inventory_flow_verified: true },
    }),
    "ACTIVE",
  );
});

Deno.test("channel publish blocked for unverified supplier", () => {
  assertEquals(canPublishToSalesChannels(baseCtx), false);
});

Deno.test("applyDraftSafetyToProductInput forces DRAFT", () => {
  const input = { status: "ACTIVE", title: "Test" };
  const result = applyDraftSafetyToProductInput(input, { ...baseCtx, requestedStatus: "ACTIVE" });
  assertEquals(result.status, "DRAFT");
  assertEquals(result.forced, true);
  assertEquals(input.status, "DRAFT");
});
