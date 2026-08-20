import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export type ShopAccess = { domain: string; token: string; apiVersion: string };

function normalizeDomain(input?: string | null): string {
  return String(input || "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/+$/, "").split("/")[0];
}

function getServiceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

/**
 * Fetches the OAuth installation access_token for a given shop domain.
 * This is the PRIMARY auth source for EU Drone Company / DigitalSignal —
 * the env token (`atkn_…` / legacy `shpat_…`) is only a last-resort fallback.
 */
async function fetchInstallToken(shopDomain: string): Promise<string | null> {
  try {
    const supabase = getServiceClient();
    const { data } = await supabase
      .from("shopify_app_installations")
      .select("access_token")
      .eq("shopify_domain", shopDomain)
      .is("uninstalled_at", null)
      .not("access_token", "is", null)
      .maybeSingle();
    const tok = (data?.access_token || "").trim();
    return tok.length > 0 ? tok : null;
  } catch (_) {
    return null;
  }
}

function envFallbackFor(shop: any): { token: string | null; domain: string | null } {
  const n = String(shop?.shop_name || shop?.label || "").toLowerCase();
  const d = String(shop?.shop_domain || shop?.primary_domain || "").toLowerCase();
  if (n.includes("eudrone") || d.includes("ya1xhg-x6") || d.includes("eudrone")) {
    return { token: Deno.env.get("EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN") || null, domain: "ya1xhg-x6.myshopify.com" };
  }
  if (n.includes("actionking") || d.includes("actionking") || d.includes("bvy0b8") || d.includes("actinking")) {
    return { token: Deno.env.get("EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN") || null, domain: Deno.env.get("SHOPIFY_STORE_DOMAIN") || null };
  }
  return { token: null, domain: null };
}

function candidateVersions(preferred?: string | null): string[] {
  return Array.from(new Set([preferred, "2025-10", "2025-07", "unstable"].filter(Boolean) as string[]));
}

export async function resolveShopAccess(shop: any): Promise<ShopAccess> {
  const env = envFallbackFor(shop);
  const primaryDomain = normalizeDomain(env.domain || shop?.shop_domain);

  // Priority order:
  //   1. OAuth install token from shopify_app_installations (by env-mapped domain)
  //   2. OAuth install token from shopify_app_installations (by shop.shop_domain)
  //   3. Token stored directly on `shop.access_token` row (legacy custom app)
  //   4. Env token (atkn_/shpat_) — last resort
  const installTokenPrimary = primaryDomain ? await fetchInstallToken(primaryDomain) : null;
  const fallbackDomain = normalizeDomain(shop?.shop_domain);
  const installTokenFallback =
    fallbackDomain && fallbackDomain !== primaryDomain ? await fetchInstallToken(fallbackDomain) : null;

  const candidates = [
    { domain: primaryDomain, token: installTokenPrimary, source: "oauth_install" },
    { domain: fallbackDomain, token: installTokenFallback, source: "oauth_install" },
    { domain: fallbackDomain, token: shop?.access_token, source: "shop_row" },
    { domain: primaryDomain, token: env.token, source: "env" },
  ].filter((x, i, arr) =>
    x.domain && x.token &&
    arr.findIndex((y) => y.domain === x.domain && y.token === x.token) === i
  );

  let last = "no_candidates";
  for (const c of candidates) {
    for (const apiVersion of candidateVersions(shop?.api_version)) {
      const r = await fetch(`https://${c.domain}/admin/api/${apiVersion}/shop.json`, {
        headers: { "X-Shopify-Access-Token": c.token!, Accept: "application/json" },
      });
      if (r.ok) {
        console.log(`[cloner-shopify-access] ok via ${c.source} domain=${c.domain} v=${apiVersion}`);
        return { domain: c.domain, token: c.token!, apiVersion };
      }
      last = `${c.source} ${c.domain} v${apiVersion} -> ${r.status}: ${(await r.text()).slice(0, 160)}`;
      console.warn(`[cloner-shopify-access] ${last}`);
    }
  }
  throw new Error(`shopify_access_failed: ${last}`);
}

export async function shopifyGraphql(
  access: ShopAccess,
  query: string,
  variables: Record<string, unknown> = {},
) {
  let attempt = 0;
  while (true) {
    const r = await fetch(`https://${access.domain}/admin/api/${access.apiVersion}/graphql.json`, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": access.token,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });
    const text = await r.text();
    const json = text ? (() => { try { return JSON.parse(text); } catch { return { raw: text }; } })() : {};
    if (r.status === 429) {
      attempt++;
      if (attempt > 5) throw new Error("shopify_rate_limited");
      await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
      continue;
    }
    if (!r.ok) throw new Error(`shopify ${r.status}: ${text.slice(0, 500)}`);
    if (json.errors?.length) throw new Error(`shopify_graphql: ${JSON.stringify(json.errors).slice(0, 500)}`);
    return json.data;
  }
}

export async function shopifyRest(
  access: ShopAccess,
  method: string,
  path: string,
  body?: unknown,
) {
  const r = await fetch(`https://${access.domain}/admin/api/${access.apiVersion}/${path}`, {
    method,
    headers: {
      "X-Shopify-Access-Token": access.token,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  const json = text ? (() => { try { return JSON.parse(text); } catch { return { raw: text }; } })() : {};
  if (!r.ok) throw new Error(`shopify_rest ${r.status}: ${text.slice(0, 500)}`);
  return json;
}

export function productGid(targetId: string | null | undefined): string | null {
  if (!targetId) return null;
  const s = String(targetId).trim();
  if (!s) return null;
  if (s.startsWith("gid://shopify/Product/")) return s;
  const numeric = s.replace(/^Product\//, "").replace(/^product:/i, "");
  return `gid://shopify/Product/${numeric}`;
}

export function pageGid(targetId: string | null | undefined): string | null {
  if (!targetId) return null;
  const s = String(targetId).trim();
  if (!s) return null;
  if (s.startsWith("gid://shopify/Page/")) return s;
  return `gid://shopify/Page/${s.replace(/^Page\//, "")}`;
}
