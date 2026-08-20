/**
 * Bidirectional Swedish ↔ English path mapping for hreflang.
 *
 * Keys are Swedish (default) paths; values are English equivalents.
 * Both static and dynamic (`:slug`) routes are supported — for dynamic
 * routes the trailing slug segments are preserved when swapping.
 *
 * To add a new translated page: add it to App.tsx routes (both /sv and /en),
 * then add the mapping below. SeoHead picks it up automatically.
 */

const SV_TO_EN: Record<string, string> = {
  "/": "/en/start",
  "/start": "/en/start",
  "/kontakt": "/en/contact",
  "/om-oss": "/en/about",
  "/kundcase": "/en/cases",
  "/blogg": "/en/blog",
  "/blogg/:slug": "/en/blog/:slug",
  "/sakerhet": "/en/security",
  "/changelog": "/en/changelog",
  "/nyheter": "/en/news",
  "/nyhetsbrev": "/en/newsletter",
  "/utbildning": "/en/training",
  "/moduler": "/en/modules",
  "/modul/:slug": "/en/module/:slug",
  "/integrationer": "/en/integrations",
  "/boka-demo": "/en/book-demo",
  "/karriar": "/en/careers",
  "/roi-kalkylator": "/en/roi-calculator",
  "/gratis-seo-scanning": "/en/free-seo-scan",
  "/boka-ads-granskning": "/en/book-ads-review",
  "/shopify-optimization": "/en/shopify-optimization",
  "/shopify-optimering": "/en/shopify-optimization",
  "/gratis-analys": "/en/free-analysis",
  "/boka-analys": "/en/book-analysis",
  "/seo": "/en/seo",
  "/seo-verktyg": "/en/seo-tools",
  "/annonshantering": "/en/ad-management",
  "/crm": "/en/crm",
  "/automatisering": "/en/automation",
  "/faq": "/en/faq",
  "/registrera": "/en/register",
  "/villkor": "/en/terms",
  "/integritet": "/en/privacy",
  "/tack": "/en/thank-you",
  "/tack-lead": "/en/thank-you-lead",
  "/ladda-ner": "/en/download",
  "/platform": "/en/platform",
  "/plattform": "/en/platform",
};

const EN_TO_SV: Record<string, string> = Object.fromEntries(
  Object.entries(SV_TO_EN).map(([sv, en]) => [en, sv]),
);

/** All known hreflang-mapped paths (both SV and EN sides). For debug UI. */
export function getKnownHreflangPaths(): { sv: string; en: string }[] {
  return Object.entries(SV_TO_EN).map(([sv, en]) => ({ sv, en }));
}

export { CROSS_DOMAIN_LOCALES };

const BASE_URL = "https://app.digitalsignal.io";

/**
 * Cross-domain locale alternates på externa ccTLD-domäner.
 *
 * Två varianter stöds:
 *
 *  1. **Shared paths** — domänen serverar exakt samma path som
 *     SV-versionen på app.digitalsignal.io. Använd ENDAST när du har
 *     bekräftat att alla mappade SV-paths också finns på ccTLD-domänen.
 *     ```
 *     { lang: "sv-SE", origin: "https://example.se" }
 *     ```
 *
 *  2. **Explicit path-mapping per locale** — domänen har egen
 *     path-struktur (typiskt Shopify: /collections/..., /products/...).
 *     Mappa varje SV-path som har en motsvarighet. Om en SV-path saknar
 *     mapping i `paths` så **utesluts den locale-raden** ur klustret för
 *     just den routen (säkrare än att länka till en 404).
 *     ```
 *     {
 *       lang: "da-DK",
 *       origin: "https://example.dk",
 *       paths: {
 *         "/sakerhet": "/collections/sikkerhed",
 *         "/blogg": "/blogs/guider",
 *       },
 *     }
 *     ```
 *
 * Bakgrund: actionking.* ccTLD-domänerna togs bort i maj 2026 efter att
 * Semrush-validering visade att de inte använder app.digitalsignal.io:s
 * path-struktur. Lägg tillbaka dem här med `paths`-mapping när
 * motsvarande sidor finns publicerade på respektive ccTLD.
 */
export type CrossDomainLocale =
  | { lang: string; origin: string; paths?: undefined }
  | { lang: string; origin: string; paths: Record<string, string> };

const CROSS_DOMAIN_LOCALES: CrossDomainLocale[] = [];

export interface HreflangAlternate {
  lang: string;
  href: string;
}

/**
 * Given a current pathname, return hreflang alternates for [sv, en,
 * each cross-domain locale, x-default] when a Swedish ↔ English
 * mapping exists. Cross-domain locales kan antingen återanvända
 * SV-pathen eller använda explicit per-locale mapping. Returns null
 * when no translation exists for the current path.
 */
export function getHreflangAlternates(pathname: string): HreflangAlternate[] | null {
  const clean = pathname.replace(/\/+$/, "") || "/";

  // Direct static match (sv side)
  if (SV_TO_EN[clean]) {
    return buildAlternates(clean, SV_TO_EN[clean]);
  }
  // Direct static match (en side)
  if (EN_TO_SV[clean]) {
    return buildAlternates(EN_TO_SV[clean], clean);
  }

  // Dynamic match: try every pattern containing ":slug" / ":token" etc.
  for (const [svPattern, enPattern] of Object.entries(SV_TO_EN)) {
    if (!svPattern.includes(":")) continue;
    const svMatch = matchPattern(svPattern, clean);
    if (svMatch) {
      return buildAlternates(clean, fillPattern(enPattern, svMatch));
    }
    const enMatch = matchPattern(enPattern, clean);
    if (enMatch) {
      return buildAlternates(fillPattern(svPattern, enMatch), clean);
    }
  }

  return null;
}

function buildAlternates(svPath: string, enPath: string): HreflangAlternate[] {
  const out: HreflangAlternate[] = [
    { lang: "sv", href: BASE_URL + svPath },
    { lang: "en", href: BASE_URL + enPath },
  ];
  for (const locale of CROSS_DOMAIN_LOCALES) {
    if (locale.paths) {
      // Explicit per-locale path-mapping. Skippa locale om vi saknar
      // mapping för just denna SV-path — bättre än att länka till 404.
      const mapped = locale.paths[svPath];
      if (!mapped) continue;
      out.push({ lang: locale.lang, href: locale.origin + mapped });
    } else {
      // Shared paths: ccTLD serverar samma path som SV-versionen.
      out.push({ lang: locale.lang, href: locale.origin + svPath });
    }
  }
  out.push({ lang: "x-default", href: BASE_URL + svPath });
  return out;
}

function matchPattern(pattern: string, path: string): Record<string, string> | null {
  const patternParts = pattern.split("/");
  const pathParts = path.split("/");
  if (patternParts.length !== pathParts.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    const p = patternParts[i];
    const v = pathParts[i];
    if (p.startsWith(":")) {
      if (!v) return null;
      params[p.slice(1)] = v;
    } else if (p !== v) {
      return null;
    }
  }
  return params;
}

function fillPattern(pattern: string, params: Record<string, string>): string {
  return pattern
    .split("/")
    .map((part) => (part.startsWith(":") ? params[part.slice(1)] ?? part : part))
    .join("/");
}
