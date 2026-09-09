/**
 * Serverside-relä till GA4.
 *
 * Ligger på egen domän, så blockerare som stoppar googletagmanager.com kommer
 * inte åt den. `src/lib/analytics.ts` skickar hit bara när gtag.js inte gick
 * att ladda — en händelse går alltid en väg, aldrig båda.
 *
 * Kräver `GA4_API_SECRET` (Vercel → Settings → Environment Variables). Utan den
 * svarar endpointen 204 och släpper händelsen, så en glömd variabel aldrig
 * fäller sidan.
 */

import {
  buildMeasurementProtocolBody,
  clientIpFrom,
  isParseFailure,
  measurementProtocolUrl,
  parseCollectBody,
} from "./_lib/measurementProtocol";

const DEFAULT_MEASUREMENT_ID = "G-G5KGZ4RKSD";

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

  const apiSecret = process.env.GA4_API_SECRET;
  const measurementId = process.env.GA4_MEASUREMENT_ID || DEFAULT_MEASUREMENT_ID;
  if (!apiSecret) {
    res.status(204).end();
    return;
  }

  const parsed = parseCollectBody(req.body);
  if (isParseFailure(parsed)) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const userAgent = req.headers["user-agent"];
  const body = buildMeasurementProtocolBody(parsed.payload, {
    ip: clientIpFrom(req.headers["x-forwarded-for"]),
    userAgent: Array.isArray(userAgent) ? userAgent[0] : userAgent,
  });

  try {
    await fetch(measurementProtocolUrl(measurementId, apiSecret), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    // GA4 kvitterar ändå inte träffar. Att svara med fel hit skulle bara ge
    // besökaren en röd rad i konsolen utan att rädda mätvärdet.
  }

  res.status(204).end();
}
