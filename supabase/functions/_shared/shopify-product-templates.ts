import { type ShopifyContext, shopifyRest } from "./shopify-client.ts";

/** Extract alternate product template suffix from a theme asset key, or null for default. */
export function parseProductTemplateAssetKey(key: string): string | null {
  if (!key.startsWith("templates/product.") || !key.endsWith(".json")) return null;
  const suffix = key.replace("templates/product.", "").replace(".json", "");
  return suffix || null;
}

/** List alternate product template suffixes from theme asset keys (excludes default product.json). */
export function listProductTemplateSuffixesFromAssetKeys(keys: string[]): string[] {
  const suffixes = new Set<string>();
  for (const key of keys) {
    const suffix = parseProductTemplateAssetKey(key);
    if (suffix) suffixes.add(suffix);
  }
  return Array.from(suffixes);
}

export function isValidProductTemplateSuffix(
  suffix: string | null | undefined,
  validSuffixes: Set<string> | string[],
): boolean {
  if (!suffix) return true;
  const set = validSuffixes instanceof Set ? validSuffixes : new Set(validSuffixes);
  return set.has(suffix);
}

/** Return suffix when valid, otherwise undefined (use Shopify default product template). */
export function sanitizeProductTemplateSuffix(
  suffix: string | null | undefined,
  validSuffixes: Set<string> | string[],
): string | undefined {
  if (!suffix) return undefined;
  return isValidProductTemplateSuffix(suffix, validSuffixes) ? suffix : undefined;
}

type ThemeAssetsResponse = { assets?: Array<{ key: string }> };
type ThemesResponse = { themes?: Array<{ id: number; role: string }> };

/** Fetch alternate product template suffixes from the store's published theme. */
export async function fetchProductTemplateSuffixes(ctx: ShopifyContext): Promise<Set<string>> {
  const themes = await shopifyRest<ThemesResponse>(ctx, "GET", "themes.json", { skipLog: true });
  const mainTheme = themes.themes?.find((t) => t.role === "main");
  if (!mainTheme?.id) return new Set();

  const assets = await shopifyRest<ThemeAssetsResponse>(
    ctx,
    "GET",
    `themes/${mainTheme.id}/assets.json`,
    { skipLog: true },
  );
  const keys = (assets.assets || []).map((a) => a.key);
  return new Set(listProductTemplateSuffixesFromAssetKeys(keys));
}

/** REST variant for functions that do not use shopify-client context. */
export async function fetchProductTemplateSuffixesRaw(
  storeDomain: string,
  accessToken: string,
  apiVersion = "2025-07",
): Promise<Set<string>> {
  const headers = { "X-Shopify-Access-Token": accessToken, Accept: "application/json" };
  const themesRes = await fetch(`https://${storeDomain}/admin/api/${apiVersion}/themes.json`, { headers });
  if (!themesRes.ok) return new Set();

  const themesData = await themesRes.json() as ThemesResponse;
  const mainTheme = themesData.themes?.find((t) => t.role === "main");
  if (!mainTheme?.id) return new Set();

  const assetsRes = await fetch(
    `https://${storeDomain}/admin/api/${apiVersion}/themes/${mainTheme.id}/assets.json`,
    { headers },
  );
  if (!assetsRes.ok) return new Set();

  const assetsData = await assetsRes.json() as ThemeAssetsResponse;
  const keys = (assetsData.assets || []).map((a) => a.key);
  return new Set(listProductTemplateSuffixesFromAssetKeys(keys));
}
