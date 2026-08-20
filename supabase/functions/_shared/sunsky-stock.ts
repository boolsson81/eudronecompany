/**
 * Sunsky inventory resolution — no synthetic 999 quantities.
 *
 * CN warehouse often lacks numeric stock; we store availability separately.
 *
 * Notera: den här resolvern beskriver LEVERANTÖRENS tillgänglighet och inget
 * annat. Den returnerar medvetet inget `product_status` — den kolumnen i
 * `inventory` betyder "produktens status i Shopify" (active/draft/archived).
 * Att skriva leverantörsstatus dit fick "Lagerställen"-kortet att räkna varje
 * hemtagen men opublicerad Sunsky-artikel som aktiv i butiken.
 */
export type SunskyAvailabilityStatus =
  | "in_stock"
  | "supplier_available"
  | "out_of_stock"
  | "discontinued"
  | "hidden"
  | "unknown";

export type SunskyInventoryResolution = {
  quantity: number;
  availability_status: SunskyAvailabilityStatus;
  inventory_source: "sunsky_api";
  track_quantity: boolean;
  allow_oversell: boolean;
};

function parseWarehouseStocks(raw: any): Array<{ code?: string; name?: string; stock: number }> {
  const rows = raw?.warehouseStocks;
  if (!Array.isArray(rows)) return [];
  return rows.map((w: any) => ({
    code: w.warehouseCode || w.warehouse || w.code,
    name: w.warehouseName || w.name,
    stock: Number(w.stock ?? w.qty ?? 0) || 0,
  }));
}

function bestNumericStock(product: any): number | null {
  const warehouse = String(product?.warehouse || "CN").toUpperCase();
  const direct = product?.stock ?? product?.qty ?? product?.quantity;
  if (direct !== undefined && direct !== null && warehouse !== "CN") {
    const n = Number(direct);
    if (!Number.isNaN(n)) return Math.max(0, n);
  }

  const stocks = parseWarehouseStocks(product);
  if (stocks.length > 0) {
    const china = stocks.find((s) =>
      String(s.code || s.name || "").toUpperCase().includes("CN") ||
      String(s.name || "").toLowerCase().includes("china")
    );
    const pick = china ?? stocks[0];
    return Math.max(0, pick.stock);
  }

  if (warehouse !== "CN" && direct !== undefined && direct !== null) {
    const n = Number(direct);
    if (!Number.isNaN(n)) return Math.max(0, n);
  }

  return null;
}

export function resolveSunskyInventory(product: any): SunskyInventoryResolution {
  const apiStatus = Number(product?.status);
  const leadTime = String(product?.leadTime || "");
  const numeric = bestNumericStock(product);

  if (apiStatus === 2) {
    return {
      quantity: 0,
      availability_status: "discontinued",
      inventory_source: "sunsky_api",
      track_quantity: true,
      allow_oversell: false,
    };
  }
  if (apiStatus === 4) {
    return {
      quantity: 0,
      availability_status: "hidden",
      inventory_source: "sunsky_api",
      track_quantity: true,
      allow_oversell: false,
    };
  }
  if (apiStatus === 3 || leadTime.toLowerCase().includes("out of stock") || leadTime === "1") {
    return {
      quantity: 0,
      availability_status: "out_of_stock",
      inventory_source: "sunsky_api",
      track_quantity: true,
      allow_oversell: false,
    };
  }

  if (numeric !== null && numeric > 0) {
    return {
      quantity: numeric,
      availability_status: "in_stock",
      inventory_source: "sunsky_api",
      track_quantity: true,
      allow_oversell: false,
    };
  }

  if (numeric === 0) {
    return {
      quantity: 0,
      availability_status: "out_of_stock",
      inventory_source: "sunsky_api",
      track_quantity: true,
      allow_oversell: false,
    };
  }

  // CN / unknown numeric — supplier signals available via status=1
  if (apiStatus === 1) {
    return {
      quantity: 0,
      availability_status: "supplier_available",
      inventory_source: "sunsky_api",
      track_quantity: false,
      allow_oversell: false,
    };
  }

  return {
    quantity: 0,
    availability_status: "unknown",
    inventory_source: "sunsky_api",
    track_quantity: true,
    allow_oversell: false,
  };
}

/** @deprecated Use resolveSunskyInventory — kept for gradual migration */
export function resolveSunskyStock(product: any): number {
  return resolveSunskyInventory(product).quantity;
}
