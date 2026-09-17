/**
 * Validering och payload-bygge för Metas Conversions API.
 *
 * Ligger separat från `api/collect-meta.ts` för att kunna enhetstestas utan
 * att någon HTTP-server startas. Endpointen är öppen mot internet, så allt
 * som kommer in behandlas som opålitligt: bara kända fält och former släpps
 * vidare.
 */

export const CAPI_ENDPOINT_BASE = "https://graph.facebook.com/v21.0";

const EVENT_NAME = /^[A-Za-z][A-Za-z0-9_]{0,39}$/;
const EVENT_ID = /^[\w.-]{1,100}$/;
const MAX_STRING_LENGTH = 500;
const MAX_CONTENT_IDS = 25;

export interface CollectMetaPayload {
  event_name: string;
  event_id?: string;
  event_source_url?: string;
  fbp?: string;
  fbc?: string;
  custom_data: Record<string, unknown>;
}

export interface ParseSuccess {
  ok: true;
  payload: CollectMetaPayload;
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

function cleanString(value: unknown, maxLength = MAX_STRING_LENGTH): string | undefined {
  if (typeof value !== "string" || value.length === 0) return undefined;
  return value.slice(0, maxLength);
}

/** Läser och validerar det klienten skickade. Body får vara objekt eller JSON-sträng. */
export function parseCollectMetaBody(raw: unknown): ParseResult {
  let body = raw;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return { ok: false, error: "body is not valid JSON" };
    }
  }
  if (!isRecord(body)) return { ok: false, error: "body must be an object" };

  if (typeof body.event_name !== "string" || !EVENT_NAME.test(body.event_name)) {
    return { ok: false, error: "invalid event_name" };
  }
  if (body.event_id !== undefined && (typeof body.event_id !== "string" || !EVENT_ID.test(body.event_id))) {
    return { ok: false, error: "invalid event_id" };
  }

  return {
    ok: true,
    payload: {
      event_name: body.event_name,
      event_id: cleanString(body.event_id, 100),
      event_source_url: cleanString(body.event_source_url, 2000),
      fbp: cleanString(body.fbp, 200),
      fbc: cleanString(body.fbc, 200),
      custom_data: sanitizeCustomData(body.custom_data),
    },
  };
}

/** Släpper igenom skalära värden och listor av strängar, kapar resten. */
export function sanitizeCustomData(raw: unknown): Record<string, unknown> {
  if (!isRecord(raw)) return {};
  const clean: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(raw)) {
    if (!/^[A-Za-z][A-Za-z0-9_]{0,39}$/.test(key)) continue;

    if (typeof value === "string") {
      if (value.length > 0) clean[key] = value.slice(0, MAX_STRING_LENGTH);
    } else if (typeof value === "number" && Number.isFinite(value)) {
      clean[key] = value;
    } else if (typeof value === "boolean") {
      clean[key] = value;
    } else if (Array.isArray(value)) {
      const ids = value.filter((entry): entry is string => typeof entry === "string").slice(0, MAX_CONTENT_IDS);
      if (ids.length > 0) clean[key] = ids;
    }
    // undefined, null och andra objekt faller bort.
  }

  return clean;
}

export interface RequestContext {
  /** Besökarens ip, inte serverns. */
  ip?: string;
  userAgent?: string;
}

/**
 * Bygger kroppen som skickas till Metas Conversions API. `action_source`
 * måste vara "website" för att händelsen ska kunna matchas mot pixel-data.
 */
export function buildConversionsApiBody(
  payload: CollectMetaPayload,
  context: RequestContext = {},
): Record<string, unknown> {
  const userData: Record<string, unknown> = {};
  if (context.ip) userData.client_ip_address = context.ip;
  if (context.userAgent) userData.client_user_agent = context.userAgent;
  if (payload.fbp) userData.fbp = payload.fbp;
  if (payload.fbc) userData.fbc = payload.fbc;

  return {
    data: [
      {
        event_name: payload.event_name,
        event_time: Math.floor(Date.now() / 1000),
        action_source: "website",
        ...(payload.event_id ? { event_id: payload.event_id } : {}),
        ...(payload.event_source_url ? { event_source_url: payload.event_source_url } : {}),
        user_data: userData,
        ...(Object.keys(payload.custom_data).length > 0 ? { custom_data: payload.custom_data } : {}),
      },
    ],
  };
}

export function conversionsApiUrl(pixelId: string, accessToken: string, testEventCode?: string): string {
  const query = new URLSearchParams({ access_token: accessToken });
  if (testEventCode) query.set("test_event_code", testEventCode);
  return `${CAPI_ENDPOINT_BASE}/${pixelId}/events?${query.toString()}`;
}
