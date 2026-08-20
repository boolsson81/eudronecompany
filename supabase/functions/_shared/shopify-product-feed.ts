// Helpers for reading denormalized product feed data from shopify_products JSONB columns.
// Replaces queries to non-existent shopify_variants / shopify_images tables.

export type FeedVariant = {
  id: string | number;
  title: string;
  sku: string;
  barcode: string;
  price: string | number;
  compare_at_price: string | number | null;
  inventory_quantity: number;
};

export type FeedImage = {
  src: string;
  alt: string;
  position: number;
};

/** Columns to select from shopify_products for multi-variant feeds. */
export const SHOPIFY_PRODUCT_FEED_SELECT =
  "id, shopify_id, title, handle, vendor, product_type, description, sku, barcode, price, compare_at_price, inventory_quantity, image_url, variants, images, status";

function num(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function str(v: unknown, fallback = ""): string {
  return v == null || v === "" ? fallback : String(v);
}

/** Normalize a single variant object from JSONB (REST or GraphQL shapes). */
function normalizeVariant(raw: Record<string, unknown>, index: number): FeedVariant {
  return {
    id: raw.id ?? raw.shopify_id ?? index,
    title: str(raw.title, "Default Title"),
    sku: str(raw.sku),
    barcode: str(raw.barcode),
    price: raw.price ?? "0",
    compare_at_price: (raw.compare_at_price ?? raw.compareAtPrice ?? null) as string | number | null,
    inventory_quantity: num(raw.inventory_quantity ?? raw.inventoryQuantity),
  };
}

/** Parse variants JSONB; fall back to top-level product fields for single-SKU rows. */
export function parseProductVariants(product: Record<string, unknown>): FeedVariant[] {
  const raw = product.variants;
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.map((v, i) => normalizeVariant(v as Record<string, unknown>, i));
  }

  // Single-variant fallback from denormalized columns on shopify_products
  const price = product.price;
  const sku = product.sku;
  if (price != null || sku) {
    return [{
      id: product.shopify_id ?? product.id ?? 0,
      title: "Default Title",
      sku: str(sku),
      barcode: str(product.barcode),
      price: price ?? "0",
      compare_at_price: (product.compare_at_price ?? null) as string | number | null,
      inventory_quantity: num(product.inventory_quantity),
    }];
  }

  return [];
}

/** Normalize a single image object from JSONB. */
function normalizeImage(raw: Record<string, unknown>, index: number): FeedImage | null {
  const src = str(raw.src ?? raw.url);
  if (!src) return null;
  return {
    src,
    alt: str(raw.alt ?? raw.altText),
    position: num(raw.position, index + 1),
  };
}

/** Parse images JSONB; fall back to image_url column. */
export function parseProductImages(product: Record<string, unknown>): FeedImage[] {
  const raw = product.images;
  if (Array.isArray(raw) && raw.length > 0) {
    const parsed = raw
      .map((img, i) => normalizeImage(img as Record<string, unknown>, i))
      .filter((img): img is FeedImage => img != null);
    if (parsed.length > 0) return parsed;
  }

  const imageUrl = str(product.image_url);
  if (imageUrl) {
    return [{ src: imageUrl, alt: "", position: 1 }];
  }

  return [];
}

/** Read product HTML description from DB (`shopify_products.description`). */
export function productDescription(product: Record<string, unknown>): string {
  return str(product.description ?? product.title);
}

/** Strip HTML for plain-text feed fields. */
export function plainProductDescription(product: Record<string, unknown>, maxLen = 5000): string {
  return productDescription(product)
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .substring(0, maxLen);
}

/**
 * Map a DB/transform row to Shopify REST `body_html` for product/collection create.
 * DB and transformed_payload use `description`; Shopify API expects `body_html`.
 */
export function toShopifyBodyHtml(
  transformed: Record<string, unknown> | null | undefined,
  sourceHtml?: string | null,
): string {
  const t = transformed || {};
  return str(t.description ?? t.body_html ?? sourceHtml);
}

/** Attach parsed variants/images for feed generators (description stays on row). */
export function enrichProductForFeed<T extends Record<string, unknown>>(product: T) {
  return {
    ...product,
    variants: parseProductVariants(product),
    images: parseProductImages(product),
  };
}

export function enrichProductsForFeed<T extends Record<string, unknown>>(products: T[]) {
  return products.map(enrichProductForFeed);
}
