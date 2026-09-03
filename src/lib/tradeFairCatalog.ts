// Katalogen sammanslagen med databasens överlagringar. Ren logik, utan
// Supabase-klienten, så att sammanslagningen går att testa i Node.

import {
  TRADE_FAIR_EVENTS,
  opportunityScore,
  sortByDate,
  totalEstimatedCost,
  type TradeFairEvent,
} from "@/data/tradeFairEvents";

/** En rad ur tradefair_events. Alla fält utom slug är valfria överlagringar. */
export interface EventOverride {
  id: string;
  slug: string;
  [key: string]: unknown;
}

/** Katalogpost berikad med databasens id och eventuella överlagringar. */
export interface ResolvedEvent extends TradeFairEvent {
  /** uuid när eventet finns i databasen, annars null. Krävs för att skriva. */
  eventId: string | null;
  /** true när posten bara finns i databasen (t.ex. upptäckt av AI Discover). */
  fromDatabaseOnly: boolean;
  opportunityScoreValue: number;
  totalEstimatedCostValue: number;
}

const CAMEL_FROM_SNAKE: Record<string, keyof TradeFairEvent> = {
  name: "name",
  organizer: "organizer",
  country: "country",
  city: "city",
  venue: "venue",
  start_date: "startDate",
  end_date: "endDate",
  date_status: "dateStatus",
  website: "website",
  categories: "categories",
  topics: "topics",
  target_industries: "targetIndustries",
  priority: "priority",
  status: "status",
  attendance_plan: "attendancePlan",
  expected_exhibitors: "expectedExhibitors",
  expected_visitors: "expectedVisitors",
  why_relevant: "whyRelevant",
  score: "score",
  notes: "notes",
  source: "source",
  verification: "verification",
  last_researched: "lastResearched",
};

function applyOverride(base: TradeFairEvent, row: EventOverride): TradeFairEvent {
  const merged: TradeFairEvent = { ...base };
  for (const [column, field] of Object.entries(CAMEL_FROM_SNAKE)) {
    const value = row[column];
    // Bara satta värden överlagrar. null i databasen betyder "inte ifyllt här",
    // inte "radera katalogvärdet" — annars tappar vi kurerad data vid första skrivning.
    if (value === undefined || value === null) continue;
    if (value === "") continue;
    if (Array.isArray(value) && value.length === 0) continue;
    if (typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0) continue;
    (merged as unknown as Record<string, unknown>)[field] = value;
  }
  return merged;
}

/** Fallback när en rad i databasen inte har någon motsvarighet i katalogen. */
function eventFromRow(row: EventOverride): TradeFairEvent {
  const empty: TradeFairEvent = {
    slug: row.slug,
    name: (row.name as string) ?? row.slug,
    organizer: "",
    country: "",
    city: "",
    venue: "",
    startDate: null,
    endDate: null,
    dateStatus: "tbc",
    website: "",
    categories: [],
    topics: [],
    targetIndustries: [],
    priority: "C",
    status: "unconfirmed",
    attendancePlan: "considering",
    expectedExhibitors: null,
    expectedVisitors: null,
    whyRelevant: "",
    score: {
      supplierRelevance: 0,
      productRelevance: 0,
      enterpriseUavRelevance: 0,
      payloadRelevance: 0,
      resellerOpportunities: 0,
      serviceOpportunities: 0,
      networking: 0,
      geographicValue: 0,
    },
    statedRelevance: 0,
    costs: { travel: 0, accommodation: 0, ticket: 0, other: 0 },
    knownExhibitors: [],
    verification: "unverified",
    source: "",
    lastResearched: "",
    notes: "",
  };
  return applyOverride(empty, row);
}

export function resolveEvents(rows: EventOverride[]): ResolvedEvent[] {
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  const resolved: ResolvedEvent[] = TRADE_FAIR_EVENTS.map((base) => {
    const row = bySlug.get(base.slug);
    const merged = row ? applyOverride(base, row) : base;
    bySlug.delete(base.slug);
    return decorate(merged, row?.id ?? null, false);
  });

  for (const row of bySlug.values()) {
    resolved.push(decorate(eventFromRow(row), row.id, true));
  }

  return resolved.sort(sortByDate);
}

function decorate(event: TradeFairEvent, eventId: string | null, fromDatabaseOnly: boolean): ResolvedEvent {
  return {
    ...event,
    eventId,
    fromDatabaseOnly,
    opportunityScoreValue: opportunityScore(event.score),
    totalEstimatedCostValue: totalEstimatedCost(event.costs),
  };
}

