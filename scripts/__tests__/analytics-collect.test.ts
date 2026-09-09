import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  buildMeasurementProtocolBody,
  clientIpFrom,
  measurementProtocolUrl,
  parseCollectBody,
  sanitizeParams,
} from "../../api/_lib/measurementProtocol";
import { CONSENT_STORAGE_KEY } from "../../src/lib/consent";

/**
 * `/api/collect` är öppen mot internet och relärar vidare till GA4 med vår
 * api_secret. Testerna vaktar att bara välformade händelser släpps igenom, och
 * att samtyckesnyckeln är densamma i index.html som i koden.
 */

const validBody = () => ({
  client_id: "123456789.1699999999",
  session_id: "1699999999",
  events: [{ name: "page_view", params: { page_path: "/kommersiella-dronare" } }],
});

describe("parseCollectBody", () => {
  it("släpper igenom en välformad händelse", () => {
    const result = parseCollectBody(validBody());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.payload.client_id).toBe("123456789.1699999999");
    expect(result.payload.events[0].params.page_path).toBe("/kommersiella-dronare");
  });

  it("tar emot body som JSON-sträng", () => {
    expect(parseCollectBody(JSON.stringify(validBody())).ok).toBe(true);
  });

  it.each([
    ["trasig JSON", "{nope"],
    ["saknat client_id", { events: [{ name: "page_view" }] }],
    ["client_id i fel form", { ...validBody(), client_id: "kaka" }],
    ["session_id som inte är siffror", { ...validBody(), session_id: "abc" }],
    ["tomma events", { ...validBody(), events: [] }],
    ["events som inte är en lista", { ...validBody(), events: "page_view" }],
    ["händelsenamn med bindestreck", { ...validBody(), events: [{ name: "page-view" }] }],
    ["händelsenamn som börjar med siffra", { ...validBody(), events: [{ name: "1st" }] }],
  ])("avvisar %s", (_label, body) => {
    expect(parseCollectBody(body).ok).toBe(false);
  });

  it("avvisar fler än fem händelser i samma anrop", () => {
    const events = Array.from({ length: 6 }, () => ({ name: "page_view", params: {} }));
    expect(parseCollectBody({ ...validBody(), events }).ok).toBe(false);
  });
});

describe("sanitizeParams", () => {
  it("kastar värden som GA4 inte tar emot", () => {
    const clean = sanitizeParams({
      page_path: "/a",
      count: 3,
      flag: true,
      nested: { a: 1 },
      list: [1, 2],
      empty: "",
      missing: undefined,
      "ogiltig-nyckel": "x",
    });
    expect(clean).toEqual({ page_path: "/a", count: 3, flag: true });
  });

  it("kapar långa strängar till 500 tecken", () => {
    const clean = sanitizeParams({ page_title: "x".repeat(900) });
    expect(clean.page_title).toHaveLength(500);
  });

  it("tar högst 25 parametrar", () => {
    const many = Object.fromEntries(Array.from({ length: 40 }, (_, i) => [`p${i}`, i]));
    expect(Object.keys(sanitizeParams(many))).toHaveLength(25);
  });
});

describe("buildMeasurementProtocolBody", () => {
  it("lägger session_id och engagement_time_msec på varje händelse", () => {
    const parsed = parseCollectBody(validBody());
    if (!parsed.ok) throw new Error(parsed.error);

    const body = buildMeasurementProtocolBody(parsed.payload, {
      ip: "203.0.113.7",
      userAgent: "Mozilla/5.0",
    }) as Record<string, any>;

    expect(body.client_id).toBe("123456789.1699999999");
    expect(body.ip_override).toBe("203.0.113.7");
    expect(body.user_agent).toBe("Mozilla/5.0");
    expect(body.events[0].params.session_id).toBe("1699999999");
    expect(body.events[0].params.engagement_time_msec).toBe(1);
  });

  it("utelämnar ip och user_agent när de saknas", () => {
    const parsed = parseCollectBody({ ...validBody(), session_id: undefined });
    if (!parsed.ok) throw new Error(parsed.error);

    const body = buildMeasurementProtocolBody(parsed.payload) as Record<string, any>;
    expect(body).not.toHaveProperty("ip_override");
    expect(body).not.toHaveProperty("user_agent");
    expect(body.events[0].params).not.toHaveProperty("session_id");
  });
});

describe("measurementProtocolUrl", () => {
  it("bygger produktions- och debugadressen", () => {
    expect(measurementProtocolUrl("G-TEST", "hemlig")).toBe(
      "https://www.google-analytics.com/mp/collect?measurement_id=G-TEST&api_secret=hemlig",
    );
    expect(measurementProtocolUrl("G-TEST", "hemlig", true)).toContain("/debug/mp/collect");
  });
});

describe("clientIpFrom", () => {
  it("tar första adressen i kedjan", () => {
    expect(clientIpFrom("203.0.113.7, 70.41.3.18")).toBe("203.0.113.7");
    expect(clientIpFrom(["203.0.113.7"])).toBe("203.0.113.7");
    expect(clientIpFrom(undefined)).toBeUndefined();
    expect(clientIpFrom("")).toBeUndefined();
  });
});

describe("samtyckesnyckeln", () => {
  it("är densamma i index.html som i consent.ts", () => {
    const html = readFileSync("index.html", "utf-8");
    expect(html).toContain(`localStorage.getItem('${CONSENT_STORAGE_KEY}')`);
  });

  it("laddar inte gtag.js innan samtycke", () => {
    const html = readFileSync("index.html", "utf-8");
    expect(html).not.toContain("googletagmanager.com/gtag/js");
    expect(html).toContain("gtag('consent', 'default'");
  });
});

describe("/api/collect", () => {
  async function call(
    body: unknown,
    { method = "POST", secret = "hemlig" }: { method?: string; secret?: string | null } = {},
  ) {
    const calls: { url: string; init: RequestInit }[] = [];
    const originalFetch = globalThis.fetch;
    const originalSecret = process.env.GA4_API_SECRET;

    globalThis.fetch = ((url: string, init: RequestInit) => {
      calls.push({ url, init });
      return Promise.resolve(new Response(null, { status: 204 }));
    }) as typeof fetch;

    if (secret === null) delete process.env.GA4_API_SECRET;
    else process.env.GA4_API_SECRET = secret;

    const sent: { status?: number; body?: unknown; headers: Record<string, string> } = { headers: {} };
    const res: any = {
      status(code: number) {
        sent.status = code;
        return res;
      },
      json(payload: unknown) {
        sent.body = payload;
      },
      setHeader(name: string, value: string) {
        sent.headers[name] = value;
      },
      end() {},
    };

    try {
      const { default: handler } = await import("../../api/collect");
      await handler({ method, body, headers: { "x-forwarded-for": "203.0.113.7, 70.41.3.18" } }, res);
    } finally {
      globalThis.fetch = originalFetch;
      if (originalSecret === undefined) delete process.env.GA4_API_SECRET;
      else process.env.GA4_API_SECRET = originalSecret;
    }

    return { sent, calls };
  }

  it("relärar en giltig händelse till GA4 med besökarens ip", async () => {
    const { sent, calls } = await call(validBody());

    expect(sent.status).toBe(204);
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toContain("api_secret=hemlig");

    const forwarded = JSON.parse(calls[0].init.body as string);
    expect(forwarded.ip_override).toBe("203.0.113.7");
    expect(forwarded.events[0].name).toBe("page_view");
  });

  it("svarar 400 och skickar ingenting vidare på skräp", async () => {
    const { sent, calls } = await call({ client_id: "kaka", events: [] });
    expect(sent.status).toBe(400);
    expect(calls).toHaveLength(0);
  });

  it("svarar 405 på GET", async () => {
    const { sent, calls } = await call(validBody(), { method: "GET" });
    expect(sent.status).toBe(405);
    expect(sent.headers.Allow).toBe("POST");
    expect(calls).toHaveLength(0);
  });

  it("tiger still utan GA4_API_SECRET i stället för att fela", async () => {
    const { sent, calls } = await call(validBody(), { secret: null });
    expect(sent.status).toBe(204);
    expect(calls).toHaveLength(0);
  });
});
