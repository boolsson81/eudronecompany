// Central logging + call helpers for every Gemini call in this codebase, so
// it's possible to see which edge function is actually draining AI balance.
//
// Two Gemini paths exist here and are recorded under `provider`:
//   'lovable_gateway' - https://ai.gateway.lovable.dev (LOVABLE_API_KEY)
//   'gemini_direct'   - generativelanguage.googleapis.com (GEMINI_API_KEY),
//                        used by call sites that need a model or feature the
//                        gateway's OpenAI-compatibility shim doesn't support
//
// Usage - simple call sites (OpenAI-compatible chat completions via the
// gateway) can replace their raw fetch() with callLovableAiGateway(), which
// logs the outcome and throws the same AI_CREDITS_EXHAUSTED / rate-limit
// errors callers already handle:
//
//   const data = await callLovableAiGateway(supabase, {
//     functionName: "my-function",
//     apiKey: LOVABLE_API_KEY,
//     model: "google/gemini-2.5-flash",
//     body: { messages: [...], tools: [...] },
//     shopId,
//   });
//
// Call sites with their own retry/backoff/quota-parsing logic (e.g. direct
// Gemini calls) shouldn't be restructured around this wrapper - instead call
// logAiUsage() directly next to the existing fetch, once the outcome
// (success/error/tokens) is known.

export type AiProvider = "lovable_gateway" | "gemini_direct";
export type AiUsageStatus = "success" | "error" | "rate_limited" | "credits_exhausted";

export interface AiUsageLogEntry {
  functionName: string;
  provider: AiProvider;
  model: string;
  shopId?: string | null;
  tenantId?: string | null;
  status: AiUsageStatus;
  promptTokens?: number | null;
  completionTokens?: number | null;
  totalTokens?: number | null;
  durationMs?: number | null;
  errorMessage?: string | null;
  metadata?: Record<string, unknown>;
}

// Approximate USD per 1M tokens. These are illustrative placeholders, NOT
// pulled from a live pricing source - verify against the current Lovable AI
// Gateway / Google Gemini pricing before relying on estimated_cost_usd for
// real billing or margin decisions. Unrecognized models get a null cost
// rather than a guessed one.
const MODEL_PRICING_USD_PER_1M_TOKENS: Record<string, { input: number; output: number }> = {
  "google/gemini-2.5-flash": { input: 0.30, output: 2.50 },
  "google/gemini-2.5-flash-lite": { input: 0.10, output: 0.40 },
  "google/gemini-2.5-pro": { input: 1.25, output: 10.00 },
  "gemini-flash-latest": { input: 0.30, output: 2.50 },
  "gemini-2.5-flash": { input: 0.30, output: 2.50 },
  "gemini-2.5-flash-lite": { input: 0.10, output: 0.40 },
};

function estimateCostUsd(
  model: string,
  promptTokens?: number | null,
  completionTokens?: number | null,
): number | null {
  const pricing = MODEL_PRICING_USD_PER_1M_TOKENS[model];
  if (!pricing || promptTokens == null || completionTokens == null) return null;
  return (promptTokens / 1_000_000) * pricing.input + (completionTokens / 1_000_000) * pricing.output;
}

// deno-lint-ignore no-explicit-any
type SupabaseClient = any;

// Best-effort: a logging failure must never break the caller's AI call, so
// every error here is caught and only logged to the console.
export async function logAiUsage(supabase: SupabaseClient, entry: AiUsageLogEntry): Promise<void> {
  try {
    const cost = estimateCostUsd(entry.model, entry.promptTokens, entry.completionTokens);
    const { error } = await supabase.from("ai_usage_log").insert({
      function_name: entry.functionName,
      provider: entry.provider,
      model: entry.model,
      shop_id: entry.shopId ?? null,
      tenant_id: entry.tenantId ?? null,
      status: entry.status,
      prompt_tokens: entry.promptTokens ?? null,
      completion_tokens: entry.completionTokens ?? null,
      total_tokens: entry.totalTokens ?? null,
      estimated_cost_usd: cost,
      duration_ms: entry.durationMs ?? null,
      error_message: entry.errorMessage?.slice(0, 500) ?? null,
      metadata: entry.metadata ?? {},
    });
    if (error) {
      console.error(`[ai-usage-log] insert failed for ${entry.functionName}:`, error.message);
    }
  } catch (err) {
    console.error(`[ai-usage-log] insert threw for ${entry.functionName}:`, err instanceof Error ? err.message : err);
  }
}

function statusForHttpError(httpStatus: number): AiUsageStatus {
  if (httpStatus === 402) return "credits_exhausted";
  if (httpStatus === 429) return "rate_limited";
  return "error";
}

export class AiGatewayError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AiGatewayError";
    this.status = status;
  }
}

export interface CallLovableAiGatewayParams {
  functionName: string;
  apiKey: string;
  model: string;
  // Full OpenAI-compatible chat-completions body minus `model` (that comes
  // from the `model` param above, so the same value is used for the request
  // and the log).
  body: Record<string, unknown>;
  shopId?: string | null;
  tenantId?: string | null;
  metadata?: Record<string, unknown>;
}

// Drop-in replacement for the
//   fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {...})
// block repeated across most edge functions. Logs every call - success,
// rate limit, credits exhausted, or other error - to ai_usage_log and
// returns the parsed JSON response on success.
export async function callLovableAiGateway(
  supabase: SupabaseClient,
  params: CallLovableAiGatewayParams,
  // deno-lint-ignore no-explicit-any
): Promise<any> {
  const { functionName, apiKey, model, body, shopId, tenantId, metadata } = params;
  const started = Date.now();

  let response: Response;
  try {
    response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, model }),
    });
  } catch (err) {
    await logAiUsage(supabase, {
      functionName,
      provider: "lovable_gateway",
      model,
      shopId,
      tenantId,
      status: "error",
      durationMs: Date.now() - started,
      errorMessage: err instanceof Error ? err.message : String(err),
      metadata,
    });
    throw err;
  }

  const durationMs = Date.now() - started;

  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    await logAiUsage(supabase, {
      functionName,
      provider: "lovable_gateway",
      model,
      shopId,
      tenantId,
      status: statusForHttpError(response.status),
      durationMs,
      errorMessage: `HTTP ${response.status}: ${bodyText.slice(0, 300)}`,
      metadata,
    });
    if (response.status === 402) throw new AiGatewayError("AI_CREDITS_EXHAUSTED", 402);
    if (response.status === 429) throw new AiGatewayError("Rate limit", 429);
    throw new AiGatewayError(`AI gateway error: ${response.status} ${bodyText.slice(0, 200)}`, response.status);
  }

  const data = await response.json();
  await logAiUsage(supabase, {
    functionName,
    provider: "lovable_gateway",
    model,
    shopId,
    tenantId,
    status: "success",
    durationMs,
    promptTokens: data.usage?.prompt_tokens ?? null,
    completionTokens: data.usage?.completion_tokens ?? null,
    totalTokens: data.usage?.total_tokens ?? null,
    metadata,
  });

  return data;
}
