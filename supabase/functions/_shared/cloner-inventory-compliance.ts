// Post-create hook: copy HS code + country of origin onto target InventoryItems.
// REST product create does not accept these fields on variants; requires GraphQL inventoryItemUpdate.

const INVENTORY_ITEM_UPDATE = `
  mutation($id: ID!, $input: InventoryItemInput!) {
    inventoryItemUpdate(id: $id, input: $input) {
      inventoryItem {
        id
        harmonizedSystemCode
        countryCodeOfOrigin
      }
      userErrors { field message }
    }
  }
`;

export type InventoryComplianceResult = {
  matched: number;
  updated: number;
  skippedNoSku: number;
  skippedNoComplianceData: number;
  skippedNoInventoryItemId: number;
  unmatched: string[];
  errors: string[];
};

export type GqlFn = (query: string, variables?: Record<string, unknown>) => Promise<unknown>;

function str(v: unknown): string {
  return v == null ? "" : String(v).trim();
}

/**
 * Match created REST variants to source_payload by SKU and publish customs fields.
 * Never throws — errors are collected in result.errors.
 */
export async function linkVariantInventoryCompliance(
  createdProduct: { variants?: Array<Record<string, unknown>> } | null | undefined,
  sourcePayload: { variants?: { nodes?: Array<Record<string, unknown>> } } | null | undefined,
  gql: GqlFn,
  log: (msg: string) => void = console.log,
): Promise<InventoryComplianceResult> {
  const result: InventoryComplianceResult = {
    matched: 0,
    updated: 0,
    skippedNoSku: 0,
    skippedNoComplianceData: 0,
    skippedNoInventoryItemId: 0,
    unmatched: [],
    errors: [],
  };

  const createdVariants = createdProduct?.variants || [];
  const sourceNodes = sourcePayload?.variants?.nodes || [];

  if (!createdVariants.length) {
    log("[inventory-compliance] No created variants — skip");
    return result;
  }
  if (!sourceNodes.length) {
    log("[inventory-compliance] No source variant nodes — skip");
    return result;
  }

  const bySku = new Map<string, Record<string, unknown>>();
  for (const src of sourceNodes) {
    const sku = str(src.sku);
    if (sku) bySku.set(sku, src);
  }

  log(`[inventory-compliance] Processing ${createdVariants.length} created variant(s), ${bySku.size} source SKU(s)`);

  for (const cv of createdVariants) {
    const createdSku = str(cv.sku);
    const variantId = cv.id ?? "?";

    if (!createdSku) {
      result.skippedNoSku++;
      log(`[inventory-compliance] Skip variant ${variantId}: created variant has no SKU`);
      continue;
    }

    const src = bySku.get(createdSku);
    if (!src) {
      result.unmatched.push(createdSku);
      log(`[inventory-compliance] Unmatched SKU "${createdSku}" (variant ${variantId})`);
      continue;
    }

    result.matched++;

    const inv = src.inventoryItem as Record<string, unknown> | undefined;
    if (!inv) {
      result.skippedNoComplianceData++;
      log(`[inventory-compliance] SKU "${createdSku}": no source inventoryItem`);
      continue;
    }

    const hs = str(inv.harmonizedSystemCode);
    const origin = str(inv.countryCodeOfOrigin);
    if (!hs && !origin) {
      result.skippedNoComplianceData++;
      log(`[inventory-compliance] SKU "${createdSku}": no HS code or country of origin in source`);
      continue;
    }

    const inventoryItemId = cv.inventory_item_id;
    if (inventoryItemId == null || inventoryItemId === "") {
      result.skippedNoInventoryItemId++;
      result.errors.push(`SKU ${createdSku}: missing inventory_item_id on created variant`);
      log(`[inventory-compliance] SKU "${createdSku}": missing inventory_item_id`);
      continue;
    }

    const input: Record<string, string> = {};
    if (origin) input.countryCodeOfOrigin = origin;
    if (hs) input.harmonizedSystemCode = hs;

    const gid = `gid://shopify/InventoryItem/${inventoryItemId}`;

    try {
      const data = await gql(INVENTORY_ITEM_UPDATE, { id: gid, input }) as {
        inventoryItemUpdate?: { userErrors?: Array<{ message: string }> };
      };
      const userErrors = data?.inventoryItemUpdate?.userErrors || [];
      if (userErrors.length > 0) {
        const errMsg = userErrors.map((e) => e.message).join("; ");
        result.errors.push(`SKU ${createdSku}: ${errMsg}`);
        log(`[inventory-compliance] SKU "${createdSku}" update rejected: ${errMsg}`);
      } else {
        result.updated++;
        log(`[inventory-compliance] SKU "${createdSku}" updated: HS=${hs || "(unchanged)"} origin=${origin || "(unchanged)"}`);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      result.errors.push(`SKU ${createdSku}: ${msg}`);
      log(`[inventory-compliance] SKU "${createdSku}" error: ${msg}`);
    }
  }

  log(
    `[inventory-compliance] Summary: matched=${result.matched} updated=${result.updated} ` +
    `skippedNoSku=${result.skippedNoSku} skippedNoData=${result.skippedNoComplianceData} ` +
    `skippedNoInvId=${result.skippedNoInventoryItemId} unmatched=${result.unmatched.length} errors=${result.errors.length}`,
  );

  return result;
}
