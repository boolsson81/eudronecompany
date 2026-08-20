import type { ShopAccess } from "../cloner-shopify-access.ts";
import { shopifyGraphql } from "../cloner-shopify-access.ts";
import { EDP_DOMAINS, MARKET_DEFINITIONS, TRANSLATION_STRUCTURE } from "./config.ts";
import { checkNoEnSubfolderOnCom } from "./preflight.ts";

const MARKETS_QUERY = `
  query Markets {
    markets(first: 50) {
      nodes {
        id
        name
        enabled
        primary
        webPresences(first: 10) {
          nodes {
            defaultLocale { locale }
            alternateLocales { locale }
            subfolderSuffix
            domain { host url }
            rootUrls { locale url }
          }
        }
      }
    }
  }
`;

export type MarketCheckRow = {
  expected: string;
  domain: string;
  defaultLocale: string;
  alternateLocales: string[];
  status: "ok" | "missing" | "mismatch" | "not_configured";
  live?: {
    name: string;
    enabled: boolean;
    hosts: string[];
    locales: string[];
  };
  notes?: string;
};

/** Validate live Shopify Markets against target architecture */
export async function validateMarkets(access: ShopAccess): Promise<{
  rows: MarketCheckRow[];
  liveMarkets: unknown[];
  adminChecklist: string[];
}> {
  let liveMarkets: any[] = [];
  try {
    const data = await shopifyGraphql(access, MARKETS_QUERY, {});
    liveMarkets = data?.markets?.nodes || [];
  } catch (e) {
    return {
      rows: MARKET_DEFINITIONS.map((m) => ({
        expected: m.name,
        domain: m.domain,
        defaultLocale: m.defaultLocale,
        alternateLocales: m.alternateLocales,
        status: "not_configured" as const,
        notes: `Could not read Markets: ${(e as Error).message}`,
      })),
      liveMarkets: [],
      adminChecklist: buildAdminChecklist(),
    };
  }

  const rows: MarketCheckRow[] = MARKET_DEFINITIONS.map((expected) => {
    const match = liveMarkets.find((lm) => {
      const hosts = (lm.webPresences?.nodes || []).flatMap((wp: any) => {
        const h: string[] = [];
        if (wp.domain?.host) h.push(wp.domain.host.toLowerCase());
        for (const r of wp.rootUrls || []) {
          try { h.push(new URL(r.url).host.toLowerCase()); } catch { /* skip */ }
        }
        return h;
      });
      return hosts.some((h: string) => h === expected.domain || h.endsWith(`.${expected.domain}`));
    });

    if (!match) {
      return {
        expected: expected.name,
        domain: expected.domain,
        defaultLocale: expected.defaultLocale,
        alternateLocales: expected.alternateLocales,
        status: "missing",
        notes: "Domain not found in live Markets — configure in Shopify Admin",
      };
    }

    const hosts: string[] = [];
    const locales: string[] = [];
    for (const wp of match.webPresences?.nodes || []) {
      if (wp.domain?.host) hosts.push(wp.domain.host);
      if (wp.defaultLocale?.locale) locales.push(wp.defaultLocale.locale);
      for (const a of wp.alternateLocales || []) locales.push(a.locale);
    }

    const defaultOk = locales.includes(expected.defaultLocale);
    const status = defaultOk ? "ok" : "mismatch";

    return {
      expected: expected.name,
      domain: expected.domain,
      defaultLocale: expected.defaultLocale,
      alternateLocales: expected.alternateLocales,
      status,
      live: {
        name: match.name,
        enabled: match.enabled,
        hosts: [...new Set(hosts)],
        locales: [...new Set(locales)],
      },
      notes: status === "mismatch"
        ? `Expected default locale ${expected.defaultLocale}, live: ${locales.join(", ")}`
        : undefined,
    };
  });

  return {
    rows,
    liveMarkets,
    adminChecklist: buildAdminChecklist(),
    en_subfolder_check: checkNoEnSubfolderOnCom(liveMarkets),
    markets_ready: rows.every((r) => r.status === "ok") &&
      checkNoEnSubfolderOnCom(liveMarkets).ok,
  };
}

/** Gate: all four domains configured, English canonical on .com, no /en/ subfolder */
export function assertMarketsReady(
  validation: Awaited<ReturnType<typeof validateMarkets>>,
): { ready: boolean; blockers: string[] } {
  const blockers: string[] = [];
  for (const row of validation.rows) {
    if (row.status !== "ok") {
      blockers.push(`Market ${row.expected} (${row.domain}): ${row.status} — ${row.notes || ""}`);
    }
  }
  if (!validation.en_subfolder_check?.ok) {
    blockers.push(validation.en_subfolder_check?.detail || "/en/ subfolder issue on .com");
  }
  return { ready: blockers.length === 0, blockers };
}

function buildAdminChecklist(): string[] {
  return [
    "Shopify Admin → Settings → Markets → create/configure four markets",
    `Primary market: ${EDP_DOMAINS.primary} — default locale en, currency EUR`,
    `Germany: ${EDP_DOMAINS.de} — default locale de, alternate en`,
    `Denmark: ${EDP_DOMAINS.dk} — default locale da, alternate en`,
    `Sweden: ${EDP_DOMAINS.se} — default locale sv, alternate en`,
    "Connect each ccTLD domain under Markets → Domains (not as separate redirects)",
    `English MUST be root locale on ${EDP_DOMAINS.primary} — NO /en/ subfolder`,
    "Configure Markets BEFORE running handle rename or menu wiring",
    "Enable Shopify Translate & Adapt (or bulk-translate-content) per locale",
    "Set x-default hreflang to eurodroneparts.com (English)",
    "Do NOT create URL redirects — this is a pre-launch store",
    "Run edp-launch-prep with --dry-run before live execution",
    "After handle rename: run bulk-translate-content for de, da, sv locales",
  ];
}

export function getTranslationStructure() {
  return {
    canonicalLanguage: "en",
    primaryDomain: EDP_DOMAINS.primary,
    locales: TRANSLATION_STRUCTURE,
    notes: [
      "Handles are English-only across all markets (no /en/ subfolder needed on .com)",
      "ccTLD markets serve translated titles/bodies via Shopify Translations API",
      "Menu link titles are translated per locale; URLs stay English handles",
      "Theme locale JSON files (shopify-theme-locales) cover UI chrome strings",
    ],
  };
}
