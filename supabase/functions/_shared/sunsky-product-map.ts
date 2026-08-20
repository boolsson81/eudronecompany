/**
 * Field mapping layer: Sunsky API → normalized internal model.
 * Preserves raw payload; normalized shape is stable for DB + Shopify.
 */
import { extractDjiCompatibility, type DjiCompatibilityRecord } from "./dji-compatibility.ts";
import { resolveCountryOfOrigin, type OriginResolution, type OriginSource } from "./origin-compliance.ts";
import { resolveSunskyInventory } from "./sunsky-stock.ts";

export type SunskyNormalizedProduct = {
  item_no: string;
  supplier_sku: string;
  title: string;
  description_html: string;
  brand: string | null;
  category_id: string | null;
  category_name: string | null;
  barcode: string | null;
  ean: string | null;
  gtin: string | null;
  hs_code: string | null;
  country_of_origin: string;
  origin_verified: boolean;
  origin_source: OriginSource;
  origin_invalid_raw: string | null;
  weight_grams: number | null;
  unit_length_mm: number | null;
  unit_width_mm: number | null;
  unit_height_mm: number | null;
  price_usd: number | null;
  msrp_usd: number | null;
  moq: number | null;
  contains_battery: boolean;
  lead_time_text: string | null;
  lead_time_level: number | null;
  video_url: string | null;
  image_urls: string[];
  warehouse: string | null;
  warehouse_stocks: Array<{ code?: string; name?: string; stock: number }>;
  price_tiers: Array<{ qty: number; price: number }>;
  specifications: Record<string, string>;
  compatibility: string[];
  included_accessories: string[];
  package_contents: string | null;
  warranty: string | null;
  shipping_notes: string | null;
  gift_items: string[];
  attributes: Record<string, unknown>;
  variant_group: SunskyVariantGroup;
  dji_compatibility: DjiCompatibilityRecord | null;
  gmt_modified: string | null;
  inventory: ReturnType<typeof resolveSunskyInventory>;
};

export type SunskyModelVariant = {
  itemNo: string;
  label?: string;
  price?: number;
};

export type SunskyOptionItem = {
  itemNo: string;
  keywords: string;
};

export type SunskyVariantGroup = {
  group_item_no: string | null;
  model_label: string | null;
  base_img_count: number | null;
  model_list: SunskyModelVariant[];
  /** Official Sunsky optionList (similar product branches). */
  option_list: {
    display: "text" | "picture" | null;
    items: SunskyOptionItem[];
  };
  /**
   * @deprecated Non-standard flat-map optionList payloads only.
   * Prefer option_list.display + option_list.items.
   */
  option_list_legacy?: Record<string, string[]>;
};

export type VariantParseIssue = {
  field: string;
  index: number;
  item_no: string;
  message: string;
  raw: unknown;
};

const variantParseIssues: VariantParseIssue[] = [];

/** Collect parse warnings from the last parseVariantGroup call (cleared each call). */
export function getVariantParseIssues(): VariantParseIssue[] {
  return [...variantParseIssues];
}

function logVariantMalformed(
  field: string,
  index: number,
  raw: unknown,
  contextItemNo: string,
  message: string,
): void {
  const issue: VariantParseIssue = { field, index, item_no: contextItemNo, message, raw };
  variantParseIssues.push(issue);
  console.warn(
    `[Sunsky variant map] ${message} (field=${field}, index=${index}, itemNo=${contextItemNo})`,
  );
}

function pickBarcode(raw: any): string | null {
  const v = raw?.barcode || raw?.barCode || raw?.ean || raw?.gtin || raw?.upc;
  return v ? String(v).trim() : null;
}

function pickOrigin(raw: any, logInvalid?: (msg: string) => void): OriginResolution {
  const v = raw?.madeIn ?? raw?.countryOfOrigin ?? raw?.originCountry ?? raw?.origin;
  return resolveCountryOfOrigin(v, { logInvalid });
}

function pickHsCode(raw: any): string | null {
  const v = raw?.hsCode || raw?.hs_code || raw?.hscode;
  return v ? String(v).replace(/[^0-9.]/g, "").trim() || null : null;
}

function parseImages(raw: any): string[] {
  const urls: string[] = [];
  const add = (u: unknown) => {
    if (typeof u === "string" && u.startsWith("http")) urls.push(u);
  };
  if (Array.isArray(raw?.imageList)) raw.imageList.forEach((img: any) => add(img?.url || img?.imageUrl || img));
  if (Array.isArray(raw?.images)) raw.images.forEach(add);
  add(raw?.imageUrl);
  add(raw?.mainImage);
  return [...new Set(urls)];
}

function parseSpecs(raw: any): Record<string, string> {
  const out: Record<string, string> = {};
  const list = raw?.specList || raw?.specifications || raw?.attrs;
  if (Array.isArray(list)) {
    for (const row of list) {
      const k = row?.name || row?.key || row?.label;
      const v = row?.value ?? row?.val;
      if (k && v != null) out[String(k)] = String(v);
    }
  } else if (list && typeof list === "object") {
    for (const [k, v] of Object.entries(list)) {
      if (v != null) out[k] = String(v);
    }
  }
  return out;
}

function parsePriceTiers(raw: any): Array<{ qty: number; price: number }> {
  const tiers = raw?.priceList || raw?.priceTiers;
  if (!Array.isArray(tiers)) return [];
  return tiers
    .map((t: any) => ({
      qty: Number(t.qty ?? t.quantity ?? t.minQty ?? t.key ?? 1),
      price: Number(t.price ?? t.unitPrice ?? t.value ?? 0),
    }))
    .filter((t) => t.qty > 0 && t.price > 0);
}

function parseModelListEntry(
  entry: unknown,
  index: number,
  contextItemNo: string,
): SunskyModelVariant | null {
  if (entry == null) {
    logVariantMalformed("modelList", index, entry, contextItemNo, "modelList entry is null");
    return null;
  }
  if (typeof entry === "string") {
    const sku = entry.trim();
    if (!sku) {
      logVariantMalformed("modelList", index, entry, contextItemNo, "modelList string entry is empty");
      return null;
    }
    return { itemNo: sku };
  }
  if (typeof entry !== "object") {
    logVariantMalformed("modelList", index, entry, contextItemNo, "modelList entry is not an object");
    return null;
  }
  const m = entry as Record<string, unknown>;
  const sku = String(m.key ?? m.itemNo ?? m.item_no ?? "").trim();
  const labelRaw = m.value ?? m.label ?? m.name ?? m.modelName;
  const label = labelRaw != null ? String(labelRaw).trim() : undefined;

  if (!sku) {
    logVariantMalformed(
      "modelList",
      index,
      entry,
      contextItemNo,
      "modelList entry missing key/itemNo",
    );
    return null;
  }

  return {
    itemNo: sku,
    label: label || undefined,
    price: m.price != null ? Number(m.price) : undefined,
  };
}

function parseOptionDisplay(value: unknown, contextItemNo: string): "text" | "picture" | null {
  if (value == null || value === "") return null;
  const s = String(value).toLowerCase();
  if (s === "text" || s === "picture") return s;
  logVariantMalformed(
    "optionList.display",
    0,
    value,
    contextItemNo,
    `Unknown optionList.display value "${value}"`,
  );
  return null;
}

function parseOptionListItems(
  opts: Record<string, unknown>,
  contextItemNo: string,
): { display: "text" | "picture" | null; items: SunskyOptionItem[]; legacy?: Record<string, string[]> } {
  if (Array.isArray(opts.items)) {
    const items: SunskyOptionItem[] = [];
    opts.items.forEach((entry, index) => {
      if (entry == null || typeof entry !== "object") {
        logVariantMalformed("optionList.items", index, entry, contextItemNo, "option item is not an object");
        return;
      }
      const row = entry as Record<string, unknown>;
      const sku = String(row.itemNo ?? row.item_no ?? row.key ?? "").trim();
      const keywords = String(row.keywords ?? row.label ?? row.name ?? row.value ?? "").trim();
      if (!sku) {
        logVariantMalformed("optionList.items", index, entry, contextItemNo, "option item missing itemNo");
        return;
      }
      items.push({ itemNo: sku, keywords });
    });
    return {
      display: parseOptionDisplay(opts.display, contextItemNo),
      items,
    };
  }

  // Legacy: flat map `{ "Color": ["Red", "Blue"] }` or mistaken `Object.entries` shape
  const legacy: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(opts)) {
    if (k === "display" || k === "items") continue;
    legacy[k] = Array.isArray(v) ? v.map(String) : [String(v)];
  }
  if (Object.keys(legacy).length > 0) {
    logVariantMalformed(
      "optionList",
      0,
      { keys: Object.keys(legacy) },
      contextItemNo,
      "optionList uses legacy flat-map shape; option_list_legacy populated",
    );
    return { display: null, items: [], legacy };
  }

  if (opts.display != null && !Array.isArray(opts.items)) {
    logVariantMalformed(
      "optionList",
      0,
      opts,
      contextItemNo,
      "optionList has display but items is not an array",
    );
  }

  return { display: parseOptionDisplay(opts.display, contextItemNo), items: [] };
}

/** Parse Sunsky variant family fields from a detail/search row. */
export function parseVariantGroup(raw: any): SunskyVariantGroup {
  variantParseIssues.length = 0;
  const contextItemNo = String(raw?.itemNo ?? raw?.item_no ?? "");

  const model_list: SunskyModelVariant[] = [];
  if (Array.isArray(raw?.modelList)) {
    raw.modelList.forEach((entry: unknown, index: number) => {
      const parsed = parseModelListEntry(entry, index, contextItemNo);
      if (parsed) model_list.push(parsed);
    });
  } else if (raw?.modelList != null) {
    logVariantMalformed("modelList", 0, raw.modelList, contextItemNo, "modelList is not an array");
  }

  let option_list: SunskyVariantGroup["option_list"] = { display: null, items: [] };
  let option_list_legacy: Record<string, string[]> | undefined;

  const opts = raw?.optionList;
  if (opts != null) {
    if (typeof opts !== "object" || Array.isArray(opts)) {
      logVariantMalformed("optionList", 0, opts, contextItemNo, "optionList is not an object");
    } else {
      const parsed = parseOptionListItems(opts as Record<string, unknown>, contextItemNo);
      option_list = { display: parsed.display, items: parsed.items };
      option_list_legacy = parsed.legacy;
    }
  }

  const baseImg = raw?.baseImgCount ?? raw?.base_img_count;
  const base_img_count = baseImg != null && Number.isFinite(Number(baseImg)) ? Number(baseImg) : null;

  return {
    group_item_no: raw?.groupItemNo != null ? String(raw.groupItemNo) : null,
    model_label: raw?.modelLabel != null ? String(raw.modelLabel) : null,
    base_img_count,
    model_list,
    option_list,
    ...(option_list_legacy ? { option_list_legacy } : {}),
  };
}

export function normalizeSunskyProduct(raw: any, detail?: any): SunskyNormalizedProduct {
  const merged = { ...(raw || {}), ...(detail || {}) };
  const itemNo = String(merged.itemNo ?? merged.item_no ?? "");
  const weightKg = Number(merged.weight ?? merged.unitWeight ?? merged.grossWeight);
  const weightGrams = Number.isFinite(weightKg) && weightKg > 0 ? Math.round(weightKg * 1000) : null;

  const len = Number(merged.length ?? merged.unitLength);
  const wid = Number(merged.width ?? merged.unitWidth);
  const ht = Number(merged.height ?? merged.unitHeight);
  const title = String(merged.name ?? merged.title ?? merged.subject ?? itemNo);
  const brand = merged.brandName || merged.brand || (Array.isArray(merged.brands) ? merged.brands[0] : null) || null;
  const variant_group = parseVariantGroup(merged);
  const fitFor = Array.isArray(merged.compatibility)
    ? merged.compatibility.map(String)
    : merged.fitFor
      ? [String(merged.fitFor)]
      : [];

  const dji_compatibility = extractDjiCompatibility({
    title,
    item_no: itemNo,
    brand,
    variant_group,
    fit_for: fitFor,
  });

  const origin = pickOrigin(merged, (msg) => console.warn(msg));

  return {
    item_no: itemNo,
    supplier_sku: String(itemNo || merged.sku || merged.supplierSku || ""),
    title,
    description_html: String(merged.description ?? merged.desc ?? merged.detail ?? ""),
    brand,
    category_id: merged.categoryId != null ? String(merged.categoryId) : merged.catId != null ? String(merged.catId) : null,
    category_name: merged.categoryName || merged.catName || null,
    barcode: pickBarcode(merged),
    ean: merged.ean ? String(merged.ean) : null,
    gtin: merged.gtin ? String(merged.gtin) : null,
    hs_code: pickHsCode(merged),
    country_of_origin: origin.country_of_origin,
    origin_verified: origin.origin_verified,
    origin_source: origin.origin_source,
    origin_invalid_raw: origin.invalid_supplier_value ?? null,
    weight_grams: weightGrams,
    unit_length_mm: Number.isFinite(len) ? len : null,
    unit_width_mm: Number.isFinite(wid) ? wid : null,
    unit_height_mm: Number.isFinite(ht) ? ht : null,
    price_usd: merged.price != null ? Number(merged.price) : null,
    msrp_usd: merged.msrp != null ? Number(merged.msrp) : merged.retailPrice != null ? Number(merged.retailPrice) : null,
    moq: merged.moq != null ? Number(merged.moq) : merged.minOrderQty != null ? Number(merged.minOrderQty) : null,
    contains_battery: Boolean(merged.containsBattery ?? merged.contains_battery),
    lead_time_text: merged.leadTime ? String(merged.leadTime) : null,
    lead_time_level: merged.leadTimeLevel != null ? Number(merged.leadTimeLevel) : null,
    video_url: merged.videoUrl || merged.video || null,
    image_urls: parseImages(merged),
    warehouse: merged.warehouse ? String(merged.warehouse) : "CN",
    warehouse_stocks: Array.isArray(merged.warehouseStocks)
      ? merged.warehouseStocks.map((w: any) => ({
          code: w.warehouseCode || w.code,
          name: w.warehouseName || w.name,
          stock: Number(w.stock ?? 0) || 0,
        }))
      : [],
    price_tiers: parsePriceTiers(merged),
    specifications: parseSpecs(merged),
    compatibility: fitFor,
    included_accessories: Array.isArray(merged.accessories) ? merged.accessories.map(String) : [],
    package_contents: merged.packageContents || merged.package || null,
    warranty: merged.warranty ? String(merged.warranty) : null,
    shipping_notes: merged.shippingDesc || merged.shippingNote || null,
    gift_items: Array.isArray(merged.giftList) ? merged.giftList.map((g: any) => String(g.name ?? g)) : [],
    attributes: {
      status: merged.status,
      currency: merged.currency,
      groupItemNo: merged.groupItemNo,
      modelLabel: merged.modelLabel,
      baseImgCount: merged.baseImgCount,
      withLogo: merged.withLogo,
      withPackage: merged.withPackage,
      isClearance: merged.isClearance,
      isNew: merged.isNew,
      isHot: merged.isHot,
    },
    variant_group,
    dji_compatibility,
    gmt_modified: merged.gmtModified ? String(merged.gmtModified) : null,
    inventory: resolveSunskyInventory(merged),
  };
}
