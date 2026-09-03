import { describe, expect, it } from "vitest";
import {
  TRADE_FAIR_EVENTS,
  getEventBySlug,
  opportunityScore,
  scoreRaw,
  totalEstimatedCost,
  upcomingEvents,
} from "../../src/data/tradeFairEvents";
import {
  EVENT_CATEGORY_BY_ID,
  EVENT_TOPICS,
  EXHIBITOR_FILTERS,
  SCORE_FACTORS,
  SCORE_RAW_MAX,
} from "../../src/data/tradeFairTaxonomy";
import { daysUntil, formatDateRange } from "../../src/lib/tradeFairDates";
import { computeKpis } from "../../src/lib/tradeFairKpis";
import { resolveEvents } from "../../src/lib/tradeFairCatalog";

describe("TRADE_FAIR_EVENTS", () => {
  it("has unique slugs", () => {
    const slugs = TRADE_FAIR_EVENTS.map((e) => e.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("covers the events the purchasing brief asked for", () => {
    const slugs = TRADE_FAIR_EVENTS.map((e) => e.slug);
    for (const expected of [
      "intergeo-2026",
      "xponential-europe-2027",
      "commercial-uav-expo-europe",
      "amsterdam-drone-week",
      "dronex-2026",
      "dronitaly",
      "auvsi-xponential",
      "commercial-uav-expo-usa",
      "drone-world-congress",
      "paris-air-show",
      "dsei",
      "eurosatory",
      "idex",
      "drone-show-korea",
    ]) {
      expect(slugs).toContain(expected);
    }
  });

  it("never carries a date without confirming it", () => {
    for (const event of TRADE_FAIR_EVENTS) {
      if (event.dateStatus === "tbc") {
        // "Do not invent the date" — TBC får inte ha datum, och statusen ska följa med.
        expect(event.startDate, event.slug).toBeNull();
        expect(event.endDate, event.slug).toBeNull();
        expect(event.status, event.slug).not.toBe("confirmed");
      } else {
        expect(event.startDate, event.slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(event.endDate, event.slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(event.endDate! >= event.startDate!, event.slug).toBe(true);
      }
    }
  });

  it("only marks an event verified when a source is named", () => {
    for (const event of TRADE_FAIR_EVENTS) {
      if (event.verification === "verified") {
        expect(event.source.length, event.slug).toBeGreaterThan(20);
        // Ett verifierat event har antingen ett bekräftat datum eller ett
        // bekräftat besked om att det inte blir av.
        expect(
          event.dateStatus === "confirmed" || event.status === "cancelled",
          event.slug,
        ).toBe(true);
      }
      expect(event.lastResearched, event.slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("keeps a cancelled event out of the default list and off the plan", () => {
    for (const event of TRADE_FAIR_EVENTS.filter((e) => e.status === "cancelled")) {
      expect(event.priority, event.slug).toBe("D");
      expect(event.attendancePlan, event.slug).toBe("not-attending");
      expect(event.notes.length, event.slug).toBeGreaterThan(20);
    }
  });

  it("uses categories and topics that exist in the taxonomy", () => {
    for (const event of TRADE_FAIR_EVENTS) {
      expect(event.categories.length, event.slug).toBeGreaterThan(0);
      for (const category of event.categories) {
        expect(EVENT_CATEGORY_BY_ID.has(category), `${event.slug}: ${category}`).toBe(true);
      }
      for (const topic of event.topics) {
        expect(EVENT_TOPICS, `${event.slug}: ${topic}`).toContain(topic);
      }
    }
  });

  it("tags known exhibitors with filters the intelligence view offers", () => {
    for (const event of TRADE_FAIR_EVENTS) {
      for (const exhibitor of event.knownExhibitors) {
        expect(exhibitor.tags.length, exhibitor.name).toBeGreaterThan(0);
        for (const tag of exhibitor.tags) {
          expect(EXHIBITOR_FILTERS as readonly string[], `${exhibitor.name}: ${tag}`).toContain(tag);
        }
      }
    }
  });

  it("keeps every score factor inside its weight", () => {
    for (const event of TRADE_FAIR_EVENTS) {
      for (const factor of SCORE_FACTORS) {
        const value = event.score[factor.id];
        expect(value, `${event.slug}: ${factor.id}`).toBeGreaterThanOrEqual(0);
        expect(value, `${event.slug}: ${factor.id}`).toBeLessThanOrEqual(factor.max);
      }
      expect(opportunityScore(event.score), event.slug).toBeLessThanOrEqual(100);
    }
  });

  it("scores the A-events above the B-events", () => {
    const worstA = Math.min(
      ...TRADE_FAIR_EVENTS.filter((e) => e.priority === "A").map((e) => opportunityScore(e.score)),
    );
    const bestB = Math.max(
      ...TRADE_FAIR_EVENTS.filter((e) => e.priority === "B").map((e) => opportunityScore(e.score)),
    );
    expect(worstA).toBeGreaterThanOrEqual(bestB);
  });

  it("stays close to the relevance the brief stated", () => {
    for (const event of TRADE_FAIR_EVENTS) {
      const drift = Math.abs(opportunityScore(event.score) - event.statedRelevance);
      expect(drift, `${event.slug} drev ${drift} poäng`).toBeLessThanOrEqual(5);
    }
  });
});

describe("opportunityScore", () => {
  it("scales the 95-point weighting to 0–100", () => {
    expect(SCORE_RAW_MAX).toBe(95);
    const full = Object.fromEntries(SCORE_FACTORS.map((f) => [f.id, f.max])) as never;
    expect(scoreRaw(full)).toBe(95);
    expect(opportunityScore(full)).toBe(100);
  });

  it("clamps values outside a factor's weight", () => {
    const over = Object.fromEntries(SCORE_FACTORS.map((f) => [f.id, f.max + 50])) as never;
    expect(opportunityScore(over)).toBe(100);
  });

  it("gives INTERGEO the top score", () => {
    const intergeo = getEventBySlug("intergeo-2026");
    expect(intergeo).toBeDefined();
    expect(opportunityScore(intergeo!.score)).toBe(100);
  });
});

describe("totalEstimatedCost", () => {
  it("sums the four planning buckets", () => {
    expect(totalEstimatedCost({ travel: 320, accommodation: 660, ticket: 100, other: 220 })).toBe(1300);
  });

  it("makes the European A-events cheaper than the intercontinental ones", () => {
    const intergeo = totalEstimatedCost(getEventBySlug("intergeo-2026")!.costs);
    const auvsi = totalEstimatedCost(getEventBySlug("auvsi-xponential")!.costs);
    expect(intergeo).toBeLessThan(auvsi);
  });
});

describe("upcomingEvents", () => {
  it("drops events that have already ended and keeps TBC ones", () => {
    const from = new Date("2026-10-01T00:00:00Z");
    const slugs = upcomingEvents(from).map((e) => e.slug);
    expect(slugs).not.toContain("intergeo-2026");
    expect(slugs).not.toContain("dronex-2026");
    expect(slugs).toContain("xponential-europe-2027");
    expect(slugs).toContain("dronitaly");
  });

  it("sorts dated events before undated ones", () => {
    const events = upcomingEvents(new Date("2026-09-03T00:00:00Z"));
    const firstUndated = events.findIndex((e) => e.startDate === null);
    const lastDated = events.map((e) => e.startDate !== null).lastIndexOf(true);
    expect(firstUndated).toBeGreaterThan(lastDated);
  });
});

describe("resolveEvents", () => {
  it("returns the catalogue untouched when the database is empty", () => {
    const resolved = resolveEvents([]);
    expect(resolved).toHaveLength(TRADE_FAIR_EVENTS.length);
    expect(resolved.every((e) => e.eventId === null)).toBe(true);
    expect(resolved.find((e) => e.slug === "intergeo-2026")!.opportunityScoreValue).toBe(100);
  });

  it("lets a database row override the catalogue", () => {
    const resolved = resolveEvents([
      { id: "row-1", slug: "dronitaly", attendance_plan: "planned", city: "Milano" },
    ]);
    const dronitaly = resolved.find((e) => e.slug === "dronitaly")!;
    expect(dronitaly.eventId).toBe("row-1");
    expect(dronitaly.attendancePlan).toBe("planned");
    expect(dronitaly.city).toBe("Milano");
  });

  it("keeps curated values when the row leaves the column empty", () => {
    const resolved = resolveEvents([
      { id: "row-2", slug: "intergeo-2026", city: null, topics: [], venue: "" },
    ]);
    const intergeo = resolved.find((e) => e.slug === "intergeo-2026")!;
    expect(intergeo.city).toBe("München");
    expect(intergeo.venue).toBe("Messe München");
    expect(intergeo.topics.length).toBeGreaterThan(0);
  });

  it("adds rows that have no catalogue entry", () => {
    const resolved = resolveEvents([
      { id: "row-3", slug: "ai-discovered-fair", name: "Nyupptäckt mässa", country: "Spanien" },
    ]);
    const found = resolved.find((e) => e.slug === "ai-discovered-fair")!;
    expect(found.fromDatabaseOnly).toBe(true);
    expect(found.name).toBe("Nyupptäckt mässa");
    expect(found.opportunityScoreValue).toBe(0);
  });
});

describe("computeKpis", () => {
  const now = new Date("2026-09-03T00:00:00Z");

  it("counts upcoming and current-year events from confirmed dates only", () => {
    const events = resolveEvents([]);
    const kpis = computeKpis(events, now);
    expect(kpis.year).toBe(2026);
    // Härlett ur katalogen i stället för hårdkodat: siffran ändras varje gång ett
    // TBC-event får ett datum, och testet ska fånga fel räkning, inte ny research.
    const dated = events.filter((e) => e.status !== "cancelled" && e.startDate !== null);
    expect(kpis.upcoming).toBe(dated.filter((e) => e.startDate! >= "2026-09-03").length);
    expect(kpis.thisYear).toBe(dated.filter((e) => e.startDate!.startsWith("2026")).length);
    expect(kpis.highPriority).toBe(events.filter((e) => e.priority === "A").length);
  });

  it("leaves the cancelled event out of every count", () => {
    const events = resolveEvents([]);
    const kpis = computeKpis(events, now);
    const cancelled = events.filter((e) => e.status === "cancelled");
    expect(cancelled.length).toBeGreaterThan(0);
    // Commercial UAV Expo Europe är inställd — den får varken räknas som kommande
    // eller som ett planerat besök.
    expect(kpis.upcoming + kpis.thisYear).toBeLessThan(events.length);
    for (const event of cancelled) {
      expect(event.attendancePlan).toBe("not-attending");
    }
  });

  it("sums the cost of the events we decided to attend", () => {
    const kpis = computeKpis(resolveEvents([]), now);
    const intergeo = getEventBySlug("intergeo-2026")!;
    expect(kpis.plannedVisits).toBe(1);
    expect(kpis.plannedCost).toBe(totalEstimatedCost(intergeo.costs));
  });

  it("follows a decision made in the database", () => {
    const kpis = computeKpis(resolveEvents([{ id: "r", slug: "dronex-2026", attendance_plan: "planned" }]), now);
    expect(kpis.plannedVisits).toBe(2);
  });
});

describe("date helpers", () => {
  it("collapses a same-month range", () => {
    expect(formatDateRange("2026-09-15", "2026-09-17")).toBe("15–17 sep 2026");
  });

  it("spells out a range that crosses a month", () => {
    expect(formatDateRange("2027-04-28", "2027-05-02")).toBe("28 apr – 2 maj 2027");
  });

  it("renders a single day", () => {
    expect(formatDateRange("2026-09-29", "2026-09-29")).toBe("29 sep 2026");
  });

  it("counts days to the event and returns null without a date", () => {
    expect(daysUntil("2026-09-15", new Date("2026-09-03T22:00:00Z"))).toBe(12);
    expect(daysUntil("2026-09-01", new Date("2026-09-03T00:00:00Z"))).toBe(-2);
    expect(daysUntil(null)).toBeNull();
  });
});
