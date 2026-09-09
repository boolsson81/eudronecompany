/**
 * Validering och payload-bygge för GA4:s Measurement Protocol.
 *
 * Ligger separat från `api/collect.ts` för att kunna enhetstestas utan att
 * någon HTTP-server startas. Endpointen är öppen mot internet, så allt som
 * kommer in behandlas som opålitligt: bara kända fält och former släpps vidare.
 */

export const GA4_ENDPOINT = "https://www.google-analytics.com/mp/collect";
export const GA4_DEBUG_ENDPOINT = "https://www.google-analytics.com/debug/mp/collect";

export const MAX_EVENTS_PER_REQUEST = 5;
export const MAX_PARAMS_PER_EVENT = 25;
export const MAX_STRING_LENGTH = 500;

/** GA4 avvisar egna händelsenamn som inte matchar det här. */
const EVENT_NAME = /^[A-Za-z][A-Za-z0-9_]{0,39}$/;
const CLIENT_ID = /^\d{1,20}\.\d{1,20}$/;
const SESSION_ID = /^\d{1,20}$/;

export interface CollectEvent {
  name: string;
  params: Record<string, string | number | boolean>;
}

export interface CollectPayload {
  client_id: string;
  session_id?: string;
  events: CollectEvent[];
}

export interface ParseSuccess {
  ok: true;
  payload: CollectPayload;
}

export interface ParseFailure {
  ok: false;
  error: string;
}

export type ParseResult = ParseSuccess | ParseFailure;

/** Typvakt i stället för `!result.ok` — projektet kör utan strictNullChecks,
 *  och då smalnar tsc inte av unionen på ett booleskt fält. */
export function isParseFailure(result: ParseResult): result is ParseFailure {
  return !result.ok;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Läser och validerar det klienten skickade. Body får vara objekt eller JSON-sträng. */
export function parseCollectBody(raw: unknown): ParseResult {
  let body = raw;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return { ok: false, error: "body is not valid JSON" };
    }
  }
  if (!isRecord(body)) return { ok: false, error: "body must be an object" };

  const clientId = body.client_id;
  if (typeof clientId !== "string" || !CLIENT_ID.test(clientId)) {
    return { ok: false, error: "client_id must look like <number>.<number>" };
  }

  const sessionId = body.session_id;
  if (sessionId !== undefined && (typeof sessionId !== "string" || !SESSION_ID.test(sessionId))) {
    return { ok: false, error: "session_id must be a numeric string" };
  }

  if (!Array.isArray(body.events) || body.events.length === 0) {
    return { ok: false, error: "events must be a non-empty array" };
  }
  if (body.events.length > MAX_EVENTS_PER_REQUEST) {
    return { ok: false, error: `at most ${MAX_EVENTS_PER_REQUEST} events per request` };
  }

  const events: CollectEvent[] = [];
  for (const candidate of body.events) {
    if (!isRecord(candidate)) return { ok: false, error: "each event must be an object" };
    if (typeof candidate.name !== "string" || !EVENT_NAME.test(candidate.name)) {
      return { ok: false, error: `invalid event name: ${String(candidate.name)}` };
    }
    if (candidate.params !== undefined && !isRecord(candidate.params)) {
      return { ok: false, error: "event params must be an object" };
    }
    events.push({ name: candidate.name, params: sanitizeParams(candidate.params) });
  }

  return {
    ok: true,
    payload: { client_id: clientId, session_id: sessionId as string | undefined, events },
  };
}

/** Släpper igenom skalära värden, kapar strängar och kastar resten. */
export function sanitizeParams(raw: unknown): Record<string, string | number | boolean> {
  if (!isRecord(raw)) return {};
  const clean: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(raw)) {
    if (Object.keys(clean).length >= MAX_PARAMS_PER_EVENT) break;
    if (!/^[A-Za-z][A-Za-z0-9_]{0,39}$/.test(key)) continue;

    if (typeof value === "string") {
      if (value.length > 0) clean[key] = value.slice(0, MAX_STRING_LENGTH);
    } else if (typeof value === "number" && Number.isFinite(value)) {
      clean[key] = value;
    } else if (typeof value === "boolean") {
      clean[key] = value;
    }
    // undefined, null, objekt och arrayer faller bort.
  }

  return clean;
}

export interface RequestContext {
  /** Besökarens ip, inte serverns — annars hamnar all geodata på Vercel. */
  ip?: string;
  userAgent?: string;
}

/**
 * Bygger kroppen som skickas till GA4. `session_id` och `engagement_time_msec`
 * måste ligga på varje händelse, annars räknas den inte in i någon session.
 */
export function buildMeasurementProtocolBody(
  payload: CollectPayload,
  context: RequestContext = {},
): Record<string, unknown> {
  return {
    client_id: payload.client_id,
    timestamp_micros: String(Date.now() * 1000),
    ...(context.ip ? { ip_override: context.ip } : {}),
    ...(context.userAgent ? { user_agent: context.userAgent } : {}),
    events: payload.events.map((event) => ({
      name: event.name,
      params: {
        ...event.params,
        ...(payload.session_id ? { session_id: payload.session_id } : {}),
        engagement_time_msec: 1,
      },
    })),
  };
}

export function measurementProtocolUrl(
  measurementId: string,
  apiSecret: string,
  debug = false,
): string {
  const base = debug ? GA4_DEBUG_ENDPOINT : GA4_ENDPOINT;
  const query = new URLSearchParams({ measurement_id: measurementId, api_secret: apiSecret });
  return `${base}?${query.toString()}`;
}

/** Första adressen i X-Forwarded-For är klientens; resten är proxyled. */
export function clientIpFrom(forwardedFor: string | string[] | undefined): string | undefined {
  const header = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
  const first = header?.split(",")[0]?.trim();
  return first && first.length > 0 ? first : undefined;
}
