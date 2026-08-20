// Shared Shopify Admin API client for all DigitalSignal edge functions.
// Handles credential lookup, GraphQL + REST, retries on 429/THROTTLED, and
// optional request logging to public.shopify_api_log.
//
// Usage:
//   import { getShopifyContext, shopifyGraphQL, shopifyRest } from "../_shared/shopify-client.ts";
//   const ctx = await getShopifyContext({ shopId });
//   const data = await shopifyGraphQL(ctx, `{ shop { name } }`);

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const SHOPIFY_API_VERSION = "2025-07";

export interface ShopifyContext {
  shopDomain: string;
  accessToken: string;
  shopId: string | null;
  source: "app_install" | "integrations" | "env";
  /** Function name used in api log */
  fnName?: string;
}

export interface GetContextOptions {
  shopId?: string | null;
  shopDomain?: string | null;
  fnName?: string;
}

function getServiceClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(supabaseUrl, serviceRole);
}

export async function getShopifyContext(opts: GetContextOptions = {}): Promise<ShopifyContext> {
  const supabase = getServiceClient();

  // 1. Try app installation (preferred for OAuth app)
  if (opts.shopId || opts.shopDomain) {
    let q = supabase
      .from("shopify_app_installations")
      .select("shop_id, shopify_domain, access_token")
      .not("access_token", "is", null)
      .is("uninstalled_at", null);
    if (opts.shopId) q = q.eq("shop_id", opts.shopId);
    if (opts.shopDomain) q = q.eq("shopify_domain", opts.shopDomain);
    const { data: install } = await q.maybeSingle();
    if (install?.access_token && install.shopify_domain) {
      return {
        shopDomain: install.shopify_domain,
        accessToken: install.access_token,
        shopId: install.shop_id ?? null,
        source: "app_install",
        fnName: opts.fnName,
      };
    }
  }

  // 2. Fall back to "integrations" table (custom-app tokens)
  if (opts.shopId) {
    const { data: integ } = await supabase
      .from("integrations")
      .select("config, shop_id")
      .eq("integration_type", "shopify")
      .eq("status", "connected")
      .eq("shop_id", opts.shopId)
      .maybeSingle();
    const cfg = (integ?.config ?? {}) as Record<string, any>;
    if (cfg.store_domain && cfg.access_token) {
      return {
        shopDomain: cfg.store_domain,
        accessToken: cfg.access_token,
        shopId: opts.shopId,
        source: "integrations",
        fnName: opts.fnName,
      };
    }
  }

  // 3. Fall back to env (single-tenant legacy)
  const envDomain = Deno.env.get("SHOPIFY_STORE_DOMAIN");
  const envToken = Deno.env.get("EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN");
  if (envDomain && envToken) {
    return {
      shopDomain: envDomain,
      accessToken: envToken,
      shopId: opts.shopId ?? null,
      source: "env",
      fnName: opts.fnName,
    };
  }

  throw new Error(
    `No Shopify credentials found (shopId=${opts.shopId ?? "?"}, shopDomain=${opts.shopDomain ?? "?"})`
  );
}

async function logApiCall(entry: {
  ctx: ShopifyContext;
  method: string;
  kind: "graphql" | "rest";
  endpoint: string;
  operation?: string;
  status: number;
  ok: boolean;
  durationMs: number;
  retries: number;
  requestId?: string;
  queryCost?: number;
  throttle?: { available?: number; maximum?: number; restoreRate?: number };
  errorMessage?: string;
  userErrors?: unknown;
}) {
  try {
    const supabase = getServiceClient();
    await supabase.from("shopify_api_log").insert({
      shop_id: entry.ctx.shopId,
      shop_domain: entry.ctx.shopDomain,
      function_name: entry.ctx.fnName ?? null,
      method: entry.method,
      api_kind: entry.kind,
      api_version: SHOPIFY_API_VERSION,
      endpoint: entry.endpoint,
      operation: entry.operation ?? null,
      status: entry.status,
      ok: entry.ok,
      duration_ms: entry.durationMs,
      retries: entry.retries,
      request_id: entry.requestId ?? null,
      query_cost: entry.queryCost ?? null,
      throttle_available: entry.throttle?.available ?? null,
      throttle_maximum: entry.throttle?.maximum ?? null,
      throttle_restore_rate: entry.throttle?.restoreRate ?? null,
      error_message: entry.errorMessage ?? null,
      user_errors: entry.userErrors ?? null,
    });
  } catch (e) {
    console.error("[shopify-client] failed to log api call", e);
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface GraphQLOptions {
  operationName?: string;
  /** max retries on THROTTLED / 429 / 5xx (default 4) */
  maxRetries?: number;
  /** skip writing to shopify_api_log */
  skipLog?: boolean;
}

export class ShopifyApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = "ShopifyApiError";
  }
}

export async function shopifyGraphQL<T = any>(
  ctx: ShopifyContext,
  query: string,
  variables?: Record<string, unknown>,
  options: GraphQLOptions = {}
): Promise<T> {
  const endpoint = `https://${ctx.shopDomain}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;
  const maxRetries = options.maxRetries ?? 4;
  const opName = options.operationName ?? query.match(/(?:query|mutation)\s+(\w+)/)?.[1] ?? null;

  let retries = 0;
  const started = Date.now();

  while (true) {
    const resp = await fetch(endpoint, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": ctx.accessToken,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ query, variables: variables ?? {} }),
    });

    const requestId = resp.headers.get("x-request-id") ?? undefined;
    const text = await resp.text();
    let body: any = null;
    try { body = text ? JSON.parse(text) : null; } catch { /* keep null */ }
    const cost = body?.extensions?.cost;
    const throttle = cost?.throttleStatus;

    const transientStatus = resp.status === 429 || resp.status >= 500;
    const throttled =
      Array.isArray(body?.errors) &&
      body.errors.some((e: any) => e?.extensions?.code === "THROTTLED");

    if ((transientStatus || throttled) && retries < maxRetries) {
      const backoff = Math.min(2000 * Math.pow(2, retries), 16_000) + Math.random() * 500;
      retries++;
      await sleep(backoff);
      continue;
    }

    const userErrors =
      body?.data && typeof body.data === "object"
        ? Object.values(body.data).flatMap((v: any) => v?.userErrors ?? [])
        : [];
    const hasUserErrors = userErrors.length > 0;
    const ok = resp.ok && !body?.errors && !hasUserErrors;

    if (!options.skipLog) {
      await logApiCall({
        ctx,
        method: "POST",
        kind: "graphql",
        endpoint,
        operation: opName ?? undefined,
        status: resp.status,
        ok,
        durationMs: Date.now() - started,
        retries,
        requestId,
        queryCost: cost?.actualQueryCost,
        throttle: throttle
          ? {
              available: throttle.currentlyAvailable,
              maximum: throttle.maximumAvailable,
              restoreRate: throttle.restoreRate,
            }
          : undefined,
        errorMessage:
          body?.errors?.map((e: any) => e.message).join("; ") ??
          (hasUserErrors ? userErrors.map((u: any) => u?.message).join("; ") : undefined),
        userErrors: hasUserErrors ? userErrors : undefined,
      });
    }

    if (!resp.ok) {
      throw new ShopifyApiError(`Shopify GraphQL ${resp.status}: ${text.slice(0, 500)}`, resp.status, body);
    }
    if (body?.errors) {
      throw new ShopifyApiError(
        `Shopify GraphQL errors: ${body.errors.map((e: any) => e.message).join("; ")}`,
        resp.status,
        body.errors
      );
    }
    return body?.data as T;
  }
}

export interface RestOptions {
  query?: Record<string, string | number | undefined>;
  body?: unknown;
  maxRetries?: number;
  skipLog?: boolean;
}

export async function shopifyRest<T = any>(
  ctx: ShopifyContext,
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  options: RestOptions = {}
): Promise<T> {
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  const base = `https://${ctx.shopDomain}/admin/api/${SHOPIFY_API_VERSION}/${normalizedPath}`;
  let url = base;
  if (options.query) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(options.query)) {
      if (v !== undefined && v !== null) qs.set(k, String(v));
    }
    const s = qs.toString();
    if (s) url += (url.includes("?") ? "&" : "?") + s;
  }

  const maxRetries = options.maxRetries ?? 4;
  let retries = 0;
  const started = Date.now();

  while (true) {
    const resp = await fetch(url, {
      method,
      headers: {
        "X-Shopify-Access-Token": ctx.accessToken,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });

    const requestId = resp.headers.get("x-request-id") ?? undefined;
    const callLimit = resp.headers.get("x-shopify-shop-api-call-limit") ?? undefined;
    const text = await resp.text();
    let body: any = null;
    try { body = text ? JSON.parse(text) : null; } catch { /* keep raw */ }

    const transient = resp.status === 429 || resp.status >= 500;
    if (transient && retries < maxRetries) {
      const retryAfter = Number(resp.headers.get("retry-after") ?? "0");
      const backoff = retryAfter > 0
        ? retryAfter * 1000
        : Math.min(1000 * Math.pow(2, retries), 16_000) + Math.random() * 500;
      retries++;
      await sleep(backoff);
      continue;
    }

    const ok = resp.ok;
    let throttle: { available?: number; maximum?: number } | undefined;
    if (callLimit && callLimit.includes("/")) {
      const [used, max] = callLimit.split("/").map((n) => Number(n));
      throttle = { available: max - used, maximum: max };
    }

    if (!options.skipLog) {
      await logApiCall({
        ctx,
        method,
        kind: "rest",
        endpoint: normalizedPath,
        status: resp.status,
        ok,
        durationMs: Date.now() - started,
        retries,
        requestId,
        throttle,
        errorMessage: ok ? undefined : (body?.errors ? JSON.stringify(body.errors) : text.slice(0, 500)),
      });
    }

    if (!ok) {
      throw new ShopifyApiError(
        `Shopify REST ${method} ${normalizedPath} ${resp.status}: ${text.slice(0, 500)}`,
        resp.status,
        body
      );
    }
    return body as T;
  }
}

/** Throws if GraphQL response contains userErrors on the named mutation field. */
export function assertNoUserErrors(data: any, mutationField: string): void {
  const node = data?.[mutationField];
  const errs: any[] = node?.userErrors ?? [];
  if (errs.length) {
    throw new ShopifyApiError(
      `${mutationField} userErrors: ${errs.map((e) => `${(e.field ?? []).join(".")}: ${e.message}`).join("; ")}`,
      400,
      errs
    );
  }
}
