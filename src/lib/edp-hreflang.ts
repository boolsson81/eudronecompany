/**
 * EuroDroneParts cross-domain hreflang configuration.
 *
 * English handles are canonical across all ccTLD domains.
 * Each market serves translated content via Shopify Translations API;
 * URLs remain English (e.g. /collections/dji-mavic-3-accessories on all domains).
 *
 * Used by:
 *   - ShopifyMarketsHreflangSection (theme Liquid generation)
 *   - CrossDomainHreflangValidator admin UI
 *   - sync-product-market-metafields
 */

/** Public ccTLD domains — keep in sync with supabase/functions/_shared/edp-launch/config.ts */
export const EDP_DOMAINS = {
  primary: "eurodroneparts.com",
  de: "eurodroneparts.de",
  dk: "eurodroneparts.dk",
  se: "eurodroneparts.se",
} as const;

export type EdpCrossDomainLocale =
  | { lang: string; origin: string; paths?: undefined }
  | { lang: string; origin: string; paths: Record<string, string> };

/**
 * EuroDroneParts ccTLD alternates.
 * Paths are shared (English handles) unless a locale needs explicit remapping.
 */
export const EDP_CROSS_DOMAIN_LOCALES: EdpCrossDomainLocale[] = [
  { lang: "en", origin: `https://${EDP_DOMAINS.primary}` },
  { lang: "de-DE", origin: `https://${EDP_DOMAINS.de}` },
  { lang: "da-DK", origin: `https://${EDP_DOMAINS.dk}` },
  { lang: "sv-SE", origin: `https://${EDP_DOMAINS.se}` },
];

export const EDP_X_DEFAULT_ORIGIN = `https://${EDP_DOMAINS.primary}`;

export interface EdpHreflangAlternate {
  lang: string;
  href: string;
}

/**
 * Build hreflang alternates for a Shopify store path.
 * All domains share the same English path structure.
 */
export function getEdpHreflangAlternates(pathname: string): EdpHreflangAlternate[] {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const out: EdpHreflangAlternate[] = EDP_CROSS_DOMAIN_LOCALES.map((locale) => {
    const mapped = locale.paths?.[path];
    const resolved = mapped ?? path;
    return { lang: locale.lang, href: locale.origin + resolved };
  });
  out.push({ lang: "x-default", href: EDP_X_DEFAULT_ORIGIN + path });
  return out;
}

/** Primary navigation paths for hreflang cluster validation */
export const EDP_KEY_PATHS = [
  "/",
  "/collections/consumer-drones",
  "/collections/enterprise-drones",
  "/collections/dji-mavic-3-accessories",
  "/pages/enterprise",
  "/pages/energy-infrastructure",
  "/pages/gis-mapping",
  "/pages/emergency-services",
  "/blogs/guides",
] as const;
