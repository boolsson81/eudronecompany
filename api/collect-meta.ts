/**
 * Serverside-relä till Metas Conversions API.
 *
 * Ligger på egen domän, så blockerare som stoppar connect.facebook.net inte
 * kommer åt den. `src/lib/metaPixel.ts` skickar hit bara när fbevents.js inte
 * gick att ladda — en händelse går alltid en väg, aldrig båda.
 *
 * Kräver `META_PIXEL_ID` och `META_CONVERSIONS_API_TOKEN` (Vercel →
 * Settings → Environment Variables). Utan dem svarar endpointen 204 och
 * släpper händelsen, så en glömd variabel aldrig fäller sidan.
 */

import { clientIpFrom } from "./_lib/measurementProtocol";
import {
  buildConversionsApiBody,
  conversionsApiUrl,
  isParseFailure,
  parseCollectMetaBody,
} from "./_lib/metaConversionsApi";

type ApiRequest = {
  method?: string;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
};

type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
  end: () => void;
};

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "method not allowed" });
    return;
  }

  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CONVERSIONS_API_TOKEN;
  if (!pixelId || !accessToken) {
    res.status(204).end();
    return;
  }

  const parsed = parseCollectMetaBody(req.body);
  if (isParseFailure(parsed)) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const userAgent = req.headers["user-agent"];
  const body = buildConversionsApiBody(parsed.payload, {
    ip: clientIpFrom(req.headers["x-forwarded-for"]),
    userAgent: Array.isArray(userAgent) ? userAgent[0] : userAgent,
  });

  try {
    await fetch(conversionsApiUrl(pixelId, accessToken, process.env.META_TEST_EVENT_CODE), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    // Meta kvitterar ändå inte träffar. Att svara med fel hit skulle bara ge
    // besökaren en röd rad i konsolen utan att rädda mätvärdet.
  }

  res.status(204).end();
}
