import { describe, expect, it } from "vitest";
import {
  buildConversionsApiBody,
  conversionsApiUrl,
  parseCollectMetaBody,
  sanitizeCustomData,
} from "../../api/_lib/metaConversionsApi";

/**
 * `/api/collect-meta` är öppen mot internet och reläar vidare till Metas
 * Conversions API med vår access-token. Testerna vaktar att bara välformade
 * händelser släpps igenom.
 */

const validBody = () => ({
  event_name: "PageView",
  event_id: "abc123",
  event_source_url: "https://eudronecompany.se/kommersiella-dronare",
  fbp: "fb.1.1699999999.123456789",
  custom_data: { content_name: "M350 RTK" },
});

describe("parseCollectMetaBody", () => {
  it("släpper igenom en välformad händelse", () => {
    const result = parseCollectMetaBody(validBody());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.payload.event_name).toBe("PageView");
    expect(result.payload.fbp).toBe("fb.1.1699999999.123456789");
  });

  it("tar emot body som JSON-sträng", () => {
    expect(parseCollectMetaBody(JSON.stringify(validBody())).ok).toBe(true);
  });

  it.each([
    ["trasig JSON", "{nope"],
    ["saknat event_name", { custom_data: {} }],
    ["händelsenamn med bindestreck", { event_name: "page-view" }],
    ["händelsenamn som börjar med siffra", { event_name: "1st" }],
    ["ogiltigt event_id", { event_name: "PageView", event_id: "har mellanslag" }],
  ])("avvisar %s", (_label, body) => {
    expect(parseCollectMetaBody(body).ok).toBe(false);
  });
});

describe("sanitizeCustomData", () => {
  it("kastar värden Meta inte tar emot och kapar listor", () => {
    const clean = sanitizeCustomData({
      content_name: "M350 RTK",
      value: 3,
      flag: true,
      nested: { a: 1 },
      content_ids: ["m350-rtk", 42, "extra"],
      empty: "",
      missing: undefined,
      "ogiltig-nyckel": "x",
    });
    expect(clean).toEqual({
      content_name: "M350 RTK",
      value: 3,
      flag: true,
      content_ids: ["m350-rtk", "extra"],
    });
  });
});

describe("buildConversionsApiBody", () => {
  it("bygger ett event med user_data och custom_data", () => {
    const parsed = parseCollectMetaBody(validBody());
    if (!parsed.ok) throw new Error(parsed.error);

    const body = buildConversionsApiBody(parsed.payload, {
      ip: "203.0.113.7",
      userAgent: "Mozilla/5.0",
    }) as { data: Record<string, any>[] };

    const event = body.data[0];
    expect(event.event_name).toBe("PageView");
    expect(event.action_source).toBe("website");
    expect(event.event_id).toBe("abc123");
    expect(event.user_data.client_ip_address).toBe("203.0.113.7");
    expect(event.user_data.client_user_agent).toBe("Mozilla/5.0");
    expect(event.user_data.fbp).toBe("fb.1.1699999999.123456789");
    expect(event.custom_data.content_name).toBe("M350 RTK");
  });

  it("utelämnar custom_data när den är tom", () => {
    const parsed = parseCollectMetaBody({ event_name: "PageView" });
    if (!parsed.ok) throw new Error(parsed.error);

    const body = buildConversionsApiBody(parsed.payload) as { data: Record<string, any>[] };
    expect(body.data[0]).not.toHaveProperty("custom_data");
    expect(body.data[0]).not.toHaveProperty("event_id");
  });
});

describe("conversionsApiUrl", () => {
  it("bygger produktionsadressen, valfritt med testEventCode", () => {
    expect(conversionsApiUrl("123", "hemlig")).toBe(
      "https://graph.facebook.com/v21.0/123/events?access_token=hemlig",
    );
    expect(conversionsApiUrl("123", "hemlig", "TEST1234")).toContain("test_event_code=TEST1234");
  });
});

describe("/api/collect-meta", () => {
  async function call(
    body: unknown,
    {
      method = "POST",
      pixelId = "123",
      token = "hemlig",
    }: { method?: string; pixelId?: string | null; token?: string | null } = {},
  ) {
    const calls: { url: string; init: RequestInit }[] = [];
    const originalFetch = globalThis.fetch;
    const originalPixelId = process.env.META_PIXEL_ID;
    const originalToken = process.env.META_CONVERSIONS_API_TOKEN;

    globalThis.fetch = ((url: string, init: RequestInit) => {
      calls.push({ url, init });
      return Promise.resolve(new Response(null, { status: 200 }));
    }) as typeof fetch;

    if (pixelId === null) delete process.env.META_PIXEL_ID;
    else process.env.META_PIXEL_ID = pixelId;
    if (token === null) delete process.env.META_CONVERSIONS_API_TOKEN;
    else process.env.META_CONVERSIONS_API_TOKEN = token;

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
      const { default: handler } = await import("../../api/collect-meta");
      await handler({ method, body, headers: { "x-forwarded-for": "203.0.113.7, 70.41.3.18" } }, res);
    } finally {
      globalThis.fetch = originalFetch;
      if (originalPixelId === undefined) delete process.env.META_PIXEL_ID;
      else process.env.META_PIXEL_ID = originalPixelId;
      if (originalToken === undefined) delete process.env.META_CONVERSIONS_API_TOKEN;
      else process.env.META_CONVERSIONS_API_TOKEN = originalToken;
    }

    return { sent, calls };
  }

  it("relärar en giltig händelse till Meta CAPI med besökarens ip", async () => {
    const { sent, calls } = await call(validBody());

    expect(sent.status).toBe(204);
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toContain("access_token=hemlig");
    expect(calls[0].url).toContain("/123/events");

    const forwarded = JSON.parse(calls[0].init.body as string);
    expect(forwarded.data[0].user_data.client_ip_address).toBe("203.0.113.7");
    expect(forwarded.data[0].event_name).toBe("PageView");
  });

  it("svarar 400 och skickar ingenting vidare på skräp", async () => {
    const { sent, calls } = await call({ event_name: "page-view" });
    expect(sent.status).toBe(400);
    expect(calls).toHaveLength(0);
  });

  it("svarar 405 på GET", async () => {
    const { sent, calls } = await call(validBody(), { method: "GET" });
    expect(sent.status).toBe(405);
    expect(sent.headers.Allow).toBe("POST");
    expect(calls).toHaveLength(0);
  });

  it("tiger still utan META_PIXEL_ID eller META_CONVERSIONS_API_TOKEN i stället för att fela", async () => {
    const { sent, calls } = await call(validBody(), { pixelId: null });
    expect(sent.status).toBe(204);
    expect(calls).toHaveLength(0);
  });
});
