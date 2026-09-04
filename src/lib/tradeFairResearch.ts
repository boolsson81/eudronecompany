// Guarden mellan AI-researchen och mässkatalogen.
//
// Edge-funktionen `tradefair-research` hittar uppgifter. Ingenting den säger får
// bli sanning på egen hand. Den här modulen står emellan och tvingar in svaret i
// källpolicyn (docs/TRADE_FAIR_MODULE.md § Research Source Policy):
//
//   • Ett resultat är alltid `needs-review`. Modellen får inte verifiera sig själv.
//   • Ett datum utan bekräftat läge kastas. Hellre «Datum TBC» än ett påhittat datum.
//   • Kategorier och ämnen som inte finns i taxonomin kastas, så filtren fortsätter
//     att fungera och en påhittad kategori inte tyst blir ett nytt begrepp.
//   • Rådata sparas orört i `research_payload` så att en människa kan se vad
//     modellen faktiskt sa, inte bara vad guarden släppte igenom.
//
// Modulen är avsiktligt paranoid: den läser fält för fält i stället för att lita
// på formen, eftersom indata kommer från en språkmodell.

import {
  EVENT_CATEGORIES,
  EVENT_TOPICS,
  type EventCategoryId,
} from "@/data/tradeFairTaxonomy";

const CATEGORY_IDS = new Set<string>(EVENT_CATEGORIES.map((c) => c.id));
const TOPICS = new Set<string>(EVENT_TOPICS);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Ett granskat researchresultat, redo att visas — inte att spara som sanning. */
export interface ResearchedEvent {
  name: string;
  organizer: string | null;
  country: string | null;
  city: string | null;
  venue: string | null;
  startDate: string | null;
  endDate: string | null;
  dateStatus: "confirmed" | "tbc";
  website: string | null;
  categories: EventCategoryId[];
  topics: string[];
  targetIndustries: string[];
  whyRelevant: string;
  relevantExhibitors: string[];
  estimatedRelevance: number;
  source: string;
  /** Alltid "needs-review". Fältet finns för att göra det synligt, inte valbart. */
  verification: "needs-review";
  /** Vad guarden kastade, så att granskaren ser att något togs bort. */
  dropped: string[];
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function strList(value: unknown, allowed?: Set<string>, limit = 30): { kept: string[]; dropped: string[] } {
  if (!Array.isArray(value)) return { kept: [], dropped: [] };
  const kept: string[] = [];
  const dropped: string[] = [];
  for (const entry of value.slice(0, limit)) {
    const text = str(entry);
    if (!text) continue;
    if (allowed && !allowed.has(text)) dropped.push(text);
    else if (!kept.includes(text)) kept.push(text);
  }
  return { kept, dropped };
}

function httpsUrl(value: unknown): string | null {
  const text = str(value);
  if (!text) return null;
  try {
    const url = new URL(text);
    // Bara http(s). En modell som returnerar javascript: eller data: ska inte
    // kunna få den strängen renderad som en länk.
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

/**
 * Granskar ett enskilt resultat. Returnerar null när det inte ens har ett namn —
 * en post utan namn går inte att granska och ska inte visas.
 */
export function guardResearchedEvent(raw: unknown): ResearchedEvent | null {
  if (typeof raw !== "object" || raw === null) return null;
  const input = raw as Record<string, unknown>;

  const name = str(input.name);
  if (!name) return null;

  const dropped: string[] = [];

  const categories = strList(input.categories, CATEGORY_IDS);
  dropped.push(...categories.dropped.map((c) => `kategori «${c}» finns inte i taxonomin`));

  const topics = strList(input.topics, TOPICS);
  dropped.push(...topics.dropped.map((t) => `ämne «${t}» finns inte i taxonomin`));

  const industries = strList(input.targetIndustries);
  const exhibitors = strList(input.relevantExhibitors, undefined, 50);

  // Datumen: bara ISO-format, bara när modellen själv säger «confirmed», och
  // bara när slutet inte ligger före starten.
  const claimedConfirmed = str(input.dateStatus) === "confirmed";
  let startDate = str(input.startDate);
  let endDate = str(input.endDate);

  if (startDate && !ISO_DATE.test(startDate)) {
    dropped.push(`startdatum «${startDate}» är inte ett ISO-datum`);
    startDate = null;
  }
  if (endDate && !ISO_DATE.test(endDate)) {
    dropped.push(`slutdatum «${endDate}» är inte ett ISO-datum`);
    endDate = null;
  }
  if (startDate && endDate && endDate < startDate) {
    dropped.push("slutdatum låg före startdatum");
    startDate = null;
    endDate = null;
  }
  if (!claimedConfirmed && (startDate || endDate)) {
    dropped.push("datum angavs utan att vara bekräftat");
    startDate = null;
    endDate = null;
  }

  const relevance = typeof input.estimatedRelevance === "number" && Number.isFinite(input.estimatedRelevance)
    ? Math.round(Math.min(Math.max(input.estimatedRelevance, 0), 100))
    : 0;

  const website = httpsUrl(input.website);
  if (input.website && !website) dropped.push("webbadressen gick inte att tolka");

  return {
    name,
    organizer: str(input.organizer),
    country: str(input.country),
    city: str(input.city),
    venue: str(input.venue),
    startDate,
    endDate,
    dateStatus: startDate !== null ? "confirmed" : "tbc",
    website,
    categories: categories.kept as EventCategoryId[],
    topics: topics.kept,
    targetIndustries: industries.kept,
    whyRelevant: str(input.whyRelevant) ?? "",
    relevantExhibitors: exhibitors.kept,
    estimatedRelevance: relevance,
    source: str(input.source) ?? "",
    // Aldrig något annat. Modellen får inte verifiera sig själv.
    verification: "needs-review",
    dropped,
  };
}

export function guardResearchResponse(payload: unknown): ResearchedEvent[] {
  const events = (payload as { events?: unknown } | null)?.events;
  if (!Array.isArray(events)) return [];
  return events.map(guardResearchedEvent).filter((e): e is ResearchedEvent => e !== null);
}

/** Slug ur ett mässnamn. Används när ett fynd sparas som eget event. */
export function slugifyEventName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/**
 * Raden som skrivs till `tradefair_events` när inköparen sparar ett fynd.
 * Priority C och verification needs-review — ett fynd är en kandidat att granska,
 * inte en mässa vi bestämt något om.
 */
export function toEventRow(event: ResearchedEvent, shopId: string): Record<string, unknown> {
  return {
    shop_id: shopId,
    slug: slugifyEventName(event.name),
    name: event.name,
    organizer: event.organizer,
    country: event.country,
    city: event.city,
    venue: event.venue,
    start_date: event.startDate,
    end_date: event.endDate,
    date_status: event.dateStatus,
    website: event.website,
    categories: event.categories,
    topics: event.topics,
    target_industries: event.targetIndustries,
    priority: "C",
    status: event.dateStatus === "confirmed" ? "confirmed" : "unconfirmed",
    attendance_plan: "considering",
    why_relevant: event.whyRelevant,
    source: event.source,
    verification: "needs-review",
    last_researched: new Date().toISOString().slice(0, 10),
    research_payload: event as unknown as Record<string, unknown>,
  };
}
