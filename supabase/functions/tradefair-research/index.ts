// AI-research för Inköp → Mässor & Events (uppdragets § 16 och § 17).
//
// Funktionen HITTAR uppgifter. Den GODKÄNNER dem aldrig. Svaret går tillbaka
// till klienten, som kör det genom guarden i src/lib/tradeFairResearch.ts innan
// något sparas — och där tvingas allt till `needs-review`. Skälet står i
// docs/TRADE_FAIR_MODULE.md § Research Source Policy: ett mässdatum som inte är
// bekräftat av arrangören får inte se bekräftat ut, hur säker en modell än låter.
//
// Prompten bor här och inte hos klienten. En funktion som vidarebefordrar fritt
// formulerade meddelanden till gatewayen är både en injektionsyta och ett sätt
// att bränna AI-krediter på annat än mässresearch.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireShopAccess, jsonResponse, errorResponse, jsonHeaders } from "../_shared/shopify-auth.ts";
import { callLovableAiGateway, AiGatewayError } from "../_shared/aiUsageLog.ts";

const FUNCTION_NAME = "tradefair-research";
const MODEL = "google/gemini-2.5-flash";

/** Gemensam regel för båda anropen. Datum är det som brukar hittas på. */
const DATE_RULE = [
  "Dates: only fill startDate/endDate when the organiser's own website or the venue's",
  "official calendar states them. If you are not certain, return null for both and",
  "\"tbc\" for dateStatus. Never estimate, never infer from previous years, never",
  "return a date range you have not seen published. A missing date is a correct answer.",
  "Always name the source you used in `source`.",
].join(" ");

const SHARED_SHAPE = `Return JSON only, no prose. Every object uses this shape:
{
  "name": string,
  "organizer": string | null,
  "country": string | null,
  "city": string | null,
  "venue": string | null,
  "startDate": "YYYY-MM-DD" | null,
  "endDate": "YYYY-MM-DD" | null,
  "dateStatus": "confirmed" | "tbc",
  "website": string | null,
  "categories": string[],
  "topics": string[],
  "targetIndustries": string[],
  "whyRelevant": string,
  "relevantExhibitors": string[],
  "estimatedRelevance": number,
  "source": string
}`;

const BUYER_CONTEXT = [
  "You are researching for EU Drone Company, a European reseller and service provider",
  "for enterprise UAV platforms and payloads. Their buyers source LiDAR, thermal and",
  "EO/IR payloads, RTK modules, heavy-lift platforms, docks, batteries and spare parts.",
  "They currently buy through distributors and sourcing agents, not direct from",
  "manufacturers, so a fair is valuable when the manufacturers themselves exhibit.",
  "Relevance is scored 0-100 from the buyer's point of view, not the fair's size.",
].join(" ");

interface DiscoverInput {
  action: "discover";
  shop_id: string;
  /** Fritext från inköparen, t.ex. «europeiska mässor 2027 för LiDAR och UAV». */
  query?: string;
  /** Slugs vi redan har, så modellen slipper föreslå dem igen. */
  known?: string[];
}

interface ResearchInput {
  action: "research";
  shop_id: string;
  event: {
    name: string;
    country?: string | null;
    city?: string | null;
    website?: string | null;
    startDate?: string | null;
  };
}

type Input = DiscoverInput | ResearchInput;

function discoverMessages(input: DiscoverInput) {
  const known = (input.known ?? []).slice(0, 60).join(", ");
  const ask =
    input.query?.trim() ||
    "European trade fairs relevant to enterprise drones, LiDAR, surveying, UAV payloads, robotics and industrial inspection.";

  return [
    { role: "system", content: `${BUYER_CONTEXT} ${DATE_RULE}` },
    {
      role: "user",
      content: [
        `Find trade fairs matching: ${ask}`,
        known ? `Skip fairs already in our catalogue: ${known}.` : "",
        "Return at most 10, strongest first.",
        SHARED_SHAPE,
        'Wrap the array as {"events": [...]}.',
      ]
        .filter(Boolean)
        .join("\n\n"),
    },
  ];
}

function researchMessages(input: ResearchInput) {
  const facts = [
    `Name: ${input.event.name}`,
    input.event.city ? `City: ${input.event.city}` : "",
    input.event.country ? `Country: ${input.event.country}` : "",
    input.event.website ? `Website we have: ${input.event.website}` : "",
    input.event.startDate ? `Date we have: ${input.event.startDate}` : "Date we have: none",
  ]
    .filter(Boolean)
    .join("\n");

  return [
    { role: "system", content: `${BUYER_CONTEXT} ${DATE_RULE}` },
    {
      role: "user",
      content: [
        "Research this trade fair against the organiser's official website, its exhibitor",
        "directory and its conference programme. Report what those sources say — not what",
        "you remember.",
        facts,
        "In `relevantExhibitors`, list only exhibitors you found in the official directory.",
        "Return an empty array if the directory is not published yet. Do not list companies",
        "that merely seem likely to attend.",
        SHARED_SHAPE,
        'Wrap the single result as {"events": [ ... ]}.',
      ].join("\n\n"),
    },
  ];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: jsonHeaders });

  try {
    const input = (await req.json()) as Input;
    if (input.action !== "discover" && input.action !== "research") {
      return errorResponse(new Error("action must be 'discover' or 'research'"), 400);
    }

    // Krediterna är delade med DigitalSignal. Bara den som faktiskt har butiken
    // får spendera dem.
    const { userId, shopId } = await requireShopAccess(req, input.shop_id);

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return errorResponse(new Error("LOVABLE_API_KEY is not configured"), 500);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const messages =
      input.action === "discover" ? discoverMessages(input) : researchMessages(input);

    const data = await callLovableAiGateway(supabase, {
      functionName: FUNCTION_NAME,
      apiKey,
      model: MODEL,
      shopId,
      body: { messages, response_format: { type: "json_object" } },
      metadata: { action: input.action, userId },
    });

    const content = data?.choices?.[0]?.message?.content ?? "";
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      // Rådata går tillbaka ändå — klienten visar den hellre än att svälja svaret.
      return jsonResponse({ action: input.action, events: [], raw: content, parseError: true });
    }

    const events = Array.isArray((parsed as { events?: unknown }).events)
      ? (parsed as { events: unknown[] }).events
      : [];

    return jsonResponse({
      action: input.action,
      events,
      model: MODEL,
      researchedAt: new Date().toISOString(),
    });
  } catch (err) {
    if (err instanceof AiGatewayError) {
      return errorResponse(err, err.status === 402 ? 402 : err.status === 429 ? 429 : 502);
    }
    const message = err instanceof Error ? err.message : String(err);
    const status = message.includes("Unauthorized")
      ? 401
      : message.includes("Forbidden")
        ? 403
        : 400;
    return errorResponse(err, status);
  }
});
