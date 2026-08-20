/**
 * EU Drone Company hreflang-konfiguration.
 *
 * Efter namnbytet ligger alla marknader på en enda domän, eudronecompany.com, och
 * skiljs åt med Shopify Markets-underkataloger. Engelska är rotmarknaden och har
 * ingen /en/-katalog. Handles är engelska överallt; översättningarna levereras via
 * Shopify Translations API, så sökvägen efter marknadsprefixet är identisk
 * (t.ex. /collections/dji-mavic-3-accessories på alla marknader).
 *
 * Används av:
 *   - ShopifyMarketsHreflangSection (genererar tema-Liquid)
 *   - CrossDomainHreflangValidator (admin-UI)
 *   - sync-product-market-metafields
 */

/** Publik domän — håll i synk med supabase/functions/_shared/edp-launch/config.ts */
export const EDP_DOMAIN = "eudronecompany.com";
export const EDP_ORIGIN = `https://${EDP_DOMAIN}`;

/** Marknadernas underkataloger. Tom sträng = rotmarknaden. */
export const EDP_MARKET_PATHS = {
  primary: "",
  de: "/de",
  dk: "/dk",
  se: "/se",
} as const;

export type EdpMarketLocale = {
  lang: string;
  /** Underkatalog på den gemensamma domänen, "" för rotmarknaden. */
  prefix: string;
  /** Explicit sökvägsöversättning när en marknad behöver avvika. */
  paths?: Record<string, string>;
};

export const EDP_MARKET_LOCALES: EdpMarketLocale[] = [
  { lang: "en", prefix: EDP_MARKET_PATHS.primary },
  { lang: "de-DE", prefix: EDP_MARKET_PATHS.de },
  { lang: "da-DK", prefix: EDP_MARKET_PATHS.dk },
  { lang: "sv-SE", prefix: EDP_MARKET_PATHS.se },
];

export const EDP_X_DEFAULT_ORIGIN = EDP_ORIGIN;

export interface EdpHreflangAlternate {
  lang: string;
  href: string;
}

/**
 * Bygger hreflang-alternativ för en sökväg i butiken. Alla marknader delar samma
 * sökvägsstruktur; bara marknadsprefixet skiljer.
 */
export function getEdpHreflangAlternates(pathname: string): EdpHreflangAlternate[] {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const out: EdpHreflangAlternate[] = EDP_MARKET_LOCALES.map((locale) => {
    const resolved = locale.paths?.[path] ?? path;
    // En marknads rot ska bli /de, inte /de/ — annars blir sökvägen densamma som förut.
    const suffix = resolved === "/" && locale.prefix ? "" : resolved;
    return { lang: locale.lang, href: `${EDP_ORIGIN}${locale.prefix}${suffix}` };
  });
  out.push({ lang: "x-default", href: EDP_X_DEFAULT_ORIGIN + path });
  return out;
}

/** Huvudsökvägar för validering av hreflang-klustret */
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
