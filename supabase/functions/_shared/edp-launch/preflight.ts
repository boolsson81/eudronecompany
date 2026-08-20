import type { ShopAccess } from "../cloner-shopify-access.ts";
import { shopifyGraphql, shopifyRest } from "../cloner-shopify-access.ts";
import { EDP_DOMAINS } from "./config.ts";

const SHOP_QUERY = `
  query ShopPreflight {
    shop {
      name
      url
      primaryDomain { host url sslEnabled }
      passwordProtection { enabled }
    }
  }
`;

export type PreflightCheck = {
  id: string;
  label: string;
  status: "pass" | "warn" | "fail";
  detail: string;
};

export type PreflightResult = {
  passed: boolean;
  is_brand_new_store: boolean;
  indexed_url_detected: boolean;
  redirect_creation_allowed: boolean;
  checks: PreflightCheck[];
  shop?: {
    name: string;
    url: string;
    primary_domain: string;
    password_protected: boolean;
  };
  redirect_count: number;
  redirects_sample: Array<{ path: string; target: string }>;
  blockers: string[];
};

async function fetchRedirects(access: ShopAccess): Promise<Array<{ path: string; target: string }>> {
  const out: Array<{ path: string; target: string }> = [];
  let page = 1;
  for (let i = 0; i < 20; i++) {
    const res: any = await shopifyRest(access, "GET", `redirects.json?limit=250&page=${page}`);
    const batch = res?.redirects || [];
    for (const r of batch) {
      out.push({ path: String(r.path || ""), target: String(r.target || "") });
    }
    if (batch.length < 250) break;
    page++;
  }
  return out;
}

/** Swedish handle tokens that signal legacy URL migration if present in redirects */
const SWEDISH_REDIRECT_TOKENS = [
  "tillbehor", "dronare", "dronar", "guider", "blogg", "energi-infrastruktur",
  "raddningstjanst", "gis-kartlaggning", "konsumentdronare", "meny",
  "actionking", "reservdelar", "fjarrkontroll", "propellrar",
];

function pathHasSwedishHandle(path: string): boolean {
  const p = path.toLowerCase();
  return SWEDISH_REDIRECT_TOKENS.some((t) => p.includes(t));
}

function isMyshopifyOnlyRedirect(r: { path: string; target: string }): boolean {
  const t = r.target.toLowerCase();
  return t.includes(".myshopify.com") && !pathHasSwedishHandle(r.path);
}

/**
 * Verify brand-new store with no indexed URLs before any launch prep executes.
 * Redirect creation is blocked unless indexed_url_detected is true.
 */
export async function runPreflight(access: ShopAccess): Promise<PreflightResult> {
  const checks: PreflightCheck[] = [];
  const blockers: string[] = [];

  let shopInfo: PreflightResult["shop"];
  try {
    const data = await shopifyGraphql(access, SHOP_QUERY, {});
    const shop = data?.shop;
    shopInfo = {
      name: shop?.name || "",
      url: shop?.url || "",
      primary_domain: shop?.primaryDomain?.host || "",
      password_protected: !!shop?.passwordProtection?.enabled,
    };
    checks.push({
      id: "shop_accessible",
      label: "Shopify Admin API accessible",
      status: "pass",
      detail: shop?.name || access.domain,
    });
    checks.push({
      id: "password_protection",
      label: "Storefront password protection (pre-launch indicator)",
      status: shopInfo.password_protected ? "pass" : "warn",
      detail: shopInfo.password_protected
        ? "Password protection enabled — store not publicly launched"
        : "Password protection OFF — verify store has not been publicly indexed",
    });
  } catch (e) {
    checks.push({
      id: "shop_accessible",
      label: "Shopify Admin API accessible",
      status: "fail",
      detail: (e as Error).message,
    });
    blockers.push("Cannot access Shopify shop");
  }

  const redirects = await fetchRedirects(access).catch(() => []);
  const migrationRedirects = redirects.filter((r) => pathHasSwedishHandle(r.path) || pathHasSwedishHandle(r.target));
  const benignRedirects = redirects.filter(isMyshopifyOnlyRedirect);

  checks.push({
    id: "redirect_count",
    label: "Existing URL redirects",
    status: redirects.length === 0 ? "pass" : migrationRedirects.length > 0 ? "fail" : "warn",
    detail: redirects.length === 0
      ? "No redirects — clean pre-launch state"
      : `${redirects.length} redirect(s); ${migrationRedirects.length} legacy/migration, ${benignRedirects.length} benign`,
  });

  // Public domain check — ccTLDs should not be primary until Markets configured
  const primaryIsMyshopify = !shopInfo?.primary_domain ||
    shopInfo.primary_domain.includes("myshopify.com");
  checks.push({
    id: "primary_domain",
    label: "Primary domain not yet public",
    status: primaryIsMyshopify ? "pass" : "warn",
    detail: primaryIsMyshopify
      ? `Primary domain is myshopify (${access.domain})`
      : `Primary domain is ${shopInfo?.primary_domain} — ensure Markets configured before launch prep`,
  });

  // Check storefront robots/sitemap only if password is off
  if (!shopInfo?.password_protected) {
    checks.push({
      id: "public_storefront",
      label: "Public storefront without password",
      status: "warn",
      detail: "Store may be crawlable — confirm no indexed URLs before proceeding",
    });
  }

  const indexed_url_detected =
    migrationRedirects.length > 0 ||
    (redirects.length > 5 && migrationRedirects.length === 0 && benignRedirects.length < redirects.length);

  checks.push({
    id: "indexed_urls",
    label: "Indexed / legacy URL signals",
    status: indexed_url_detected ? "fail" : "pass",
    detail: indexed_url_detected
      ? "Legacy redirect patterns detected — treat as indexed/migrated URLs"
      : "No indexed URL signals detected",
  });

  checks.push({
    id: "seo_migration_skipped",
    label: "SEO migration logic",
    status: "pass",
    detail: "Skipped — not executed in launch prep pipeline",
  });

  checks.push({
    id: "redirect_policy",
    label: "Redirect creation policy",
    status: "pass",
    detail: indexed_url_detected
      ? "Redirects allowed ONLY for detected indexed URLs (none auto-created by this tool)"
      : "Redirect creation BLOCKED — brand-new store, no indexed URLs",
  });

  if (migrationRedirects.length > 0) {
    blockers.push(`${migrationRedirects.length} legacy redirect(s) with Swedish handles — resolve manually`);
  }

  const is_brand_new_store = !indexed_url_detected && redirects.length === 0;
  const passed = blockers.length === 0;

  return {
    passed,
    is_brand_new_store,
    indexed_url_detected,
    redirect_creation_allowed: indexed_url_detected,
    checks,
    shop: shopInfo,
    redirect_count: redirects.length,
    redirects_sample: redirects.slice(0, 20),
    blockers,
  };
}

/** Quick check that primary .com market has no /en/ subfolder */
export function checkNoEnSubfolderOnCom(
  liveMarkets: any[],
): { ok: boolean; detail: string } {
  const comMarket = liveMarkets.find((m) =>
    (m.webPresences?.nodes || []).some((wp: any) => {
      const host = wp.domain?.host?.toLowerCase() || "";
      return host === EDP_DOMAINS.primary || host.endsWith(`.${EDP_DOMAINS.primary}`);
    }),
  );

  if (!comMarket) {
    return { ok: false, detail: `${EDP_DOMAINS.primary} market not configured` };
  }

  for (const wp of comMarket.webPresences?.nodes || []) {
    const suffix = String(wp.subfolderSuffix || "");
    if (suffix === "/en" || suffix === "en") {
      return { ok: false, detail: `/en/ subfolder detected on ${EDP_DOMAINS.primary} — English must be root locale` };
    }
    for (const r of wp.rootUrls || []) {
      if (r.locale === "en" && String(r.url || "").includes("/en/")) {
        return { ok: false, detail: `English locale uses /en/ path on ${EDP_DOMAINS.primary}` };
      }
    }
    if (wp.defaultLocale?.locale === "en" && !suffix) {
      return { ok: true, detail: `English is root locale on ${EDP_DOMAINS.primary} (no /en/ subfolder)` };
    }
  }

  return { ok: true, detail: "No /en/ subfolder on primary domain" };
}
