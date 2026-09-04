import { describe, expect, it } from "vitest";
import { resolveEvents } from "../../src/lib/tradeFairCatalog";
import {
  coveredSourcingGaps,
  recommendAll,
  recommendEvent,
  VERDICT_LABEL,
  type Verdict,
} from "../../src/lib/tradeFairRecommendation";
import { SOURCING_GAPS, EVENT_TOPICS, WISHLIST_SUGGESTIONS } from "../../src/data/tradeFairTaxonomy";

const NOW = new Date("2026-09-03T00:00:00Z");
const events = resolveEvents([]);
const bySlug = (slug: string) => {
  const event = events.find((e) => e.slug === slug);
  if (!event) throw new Error(`saknar ${slug}`);
  return event;
};

describe("SOURCING_GAPS", () => {
  it("kartlägger varje behov på inköpslistan", () => {
    for (const gap of WISHLIST_SUGGESTIONS) {
      expect(SOURCING_GAPS[gap], gap).toBeDefined();
      expect(SOURCING_GAPS[gap].topics.length, gap).toBeGreaterThan(0);
    }
  });

  it("pekar bara på ämnen som finns i taxonomin", () => {
    for (const [gap, { topics }] of Object.entries(SOURCING_GAPS)) {
      for (const topic of topics) {
        expect(EVENT_TOPICS, `${gap}: ${topic}`).toContain(topic);
      }
    }
  });

  it("håller förbrukningsvarorna åtskilda från de strategiska behoven", () => {
    // Batterier och propellrar går att köpa av vilken distributör som helst.
    // Klassas de som strategiska lyfter varje drönarmässa ett steg för inget.
    expect(SOURCING_GAPS["Drone batteries"].tier).toBe("commodity");
    expect(SOURCING_GAPS.Propellers.tier).toBe("commodity");
    expect(SOURCING_GAPS["Enterprise LiDAR"].tier).toBe("strategic");
    expect(SOURCING_GAPS["Thermal payload"].tier).toBe("strategic");
  });
});

describe("coveredSourcingGaps", () => {
  it("hittar LiDAR- och termikbehoven på INTERGEO", () => {
    const covered = coveredSourcingGaps(bySlug("intergeo-2026"));
    expect(covered).toContain("Enterprise LiDAR");
    expect(covered).toContain("Thermal payload");
    expect(covered).toContain("RTK module");
  });

  it("hittar inga LiDAR-behov på en ren försvarsmässa", () => {
    expect(coveredSourcingGaps(bySlug("idex"))).not.toContain("Enterprise LiDAR");
  });
});

describe("recommendEvent", () => {
  it("avfärdar en inställd mässa utan att väga poängen", () => {
    const rec = recommendEvent(bySlug("commercial-uav-expo-europe"), { now: NOW });
    expect(rec.verdict).toBe("skip");
    expect(rec.headline).toMatch(/Inställd/);
    expect(rec.reasons).toHaveLength(0);
  });

  it("avfärdar en mässa som redan varit", () => {
    const rec = recommendEvent(bySlug("commercial-uav-expo-usa"), { now: new Date("2026-09-10T00:00:00Z") });
    expect(rec.verdict).toBe("skip");
    expect(rec.headline).toMatch(/genomförd/);
  });

  it("säger att en mässa pågår i stället för att kalla den kort varsel", () => {
    const rec = recommendEvent(bySlug("commercial-uav-expo-usa"), { now: NOW });
    expect(rec.leadTimeDays).toBeLessThan(0);
    expect(rec.headline).toMatch(/Pågår redan/);
    expect(rec.warnings.join(" ")).toMatch(/pågår redan/i);
  });

  it("sätter INTERGEO till Must Attend och säger varför", () => {
    const rec = recommendEvent(bySlug("intergeo-2026"), { now: NOW });
    expect(rec.verdict).toBe("must-attend");
    expect(rec.reasons.join(" ")).toMatch(/Opportunity Score 100/);
    expect(rec.reasons.join(" ")).toMatch(/strategiska sourcingbehov/);
    expect(rec.strategicGaps.length).toBeGreaterThanOrEqual(2);
  });

  it("varnar för kort varsel men behåller omdömet över en vecka", () => {
    const rec = recommendEvent(bySlug("intergeo-2026"), { now: new Date("2026-09-01T00:00:00Z") });
    expect(rec.leadTimeDays).toBe(14);
    expect(rec.warnings.join(" ")).toMatch(/4–6 veckor/);
    expect(rec.verdict).toBe("must-attend");
  });

  it("sänker omdömet när det är för sent att boka möten", () => {
    const late = recommendEvent(bySlug("intergeo-2026"), { now: new Date("2026-09-12T00:00:00Z") });
    expect(late.leadTimeDays).toBe(3);
    expect(late.verdict).toBe("recommended");
    expect(late.warnings.join(" ")).toMatch(/drop-in/);
  });

  it("sänker omdömet för ett obekräftat datum", () => {
    const rec = recommendEvent(bySlug("amsterdam-drone-week"), { now: NOW });
    expect(rec.warnings.join(" ")).toMatch(/inte bekräftat/);
    // Poängen 89 räcker till Recommended; TBC drar ner det ett steg.
    expect(rec.verdict).toBe("optional");
  });

  it("låter inte sourcingtäckning skapa ett Must Attend", () => {
    // DroneX har 85 poäng och täcker två strategiska behov. Höjningen stannar
    // vid Recommended — Must Attend ska poängen bära själv.
    const rec = recommendEvent(bySlug("dronex-2026"), { now: NOW });
    expect(rec.strategicGaps.length).toBeGreaterThanOrEqual(2);
    expect(rec.verdict).toBe("recommended");
  });

  it("höjer inte en svag mässa på generisk drönartäckning", () => {
    // Drone Show Korea täcker tunglyft och dockor som varje drönarmässa gör,
    // men 65 poäng säger redan att den är svag.
    const rec = recommendEvent(bySlug("drone-show-korea"), { now: NOW });
    expect(rec.verdict).toBe("optional");
  });

  it("sänker omdömet när kostnaden spränger taket", () => {
    const utan = recommendEvent(bySlug("auvsi-xponential"), { now: NOW });
    const med = recommendEvent(bySlug("auvsi-xponential"), { now: NOW, budgetPerTrip: 1500 });
    expect(med.verdict).not.toBe(utan.verdict);
    expect(med.warnings.join(" ")).toMatch(/överstiger taket/);
  });

  it("håller ett tak som rymmer resan utanför bedömningen", () => {
    const rec = recommendEvent(bySlug("intergeo-2026"), { now: NOW, budgetPerTrip: 5000 });
    expect(rec.warnings.join(" ")).not.toMatch(/överstiger taket/);
  });

  it("flaggar overifierade uppgifter", () => {
    expect(recommendEvent(bySlug("eurosatory"), { now: NOW }).warnings.join(" ")).toMatch(
      /inte verifierade/,
    );
    expect(recommendEvent(bySlug("intergeo-2026"), { now: NOW }).warnings.join(" ")).not.toMatch(
      /inte verifierade/,
    );
  });

  it("säger alltid något, oavsett utfall", () => {
    for (const event of events) {
      const rec = recommendEvent(event, { now: NOW });
      expect(rec.headline.length, event.slug).toBeGreaterThan(0);
      expect(VERDICT_LABEL[rec.verdict], event.slug).toBeDefined();
      // Ett omdöme utan motivering eller invändning vore ett påstående utan grund.
      expect(rec.reasons.length + rec.warnings.length, event.slug).toBeGreaterThan(0);
    }
  });

  it("låter beslutet synas i rubriken när det är fattat", () => {
    expect(recommendEvent(bySlug("intergeo-2026"), { now: NOW }).headline).toMatch(/beslutat/);
  });
});

describe("recommendAll", () => {
  it("sorterar starkaste rekommendation först", () => {
    const ranked = recommendAll(events, { now: NOW });
    const order: Verdict[] = ["must-attend", "recommended", "optional", "skip"];
    let last = 0;
    for (const { recommendation } of ranked) {
      const index = order.indexOf(recommendation.verdict);
      expect(index).toBeGreaterThanOrEqual(last);
      last = index;
    }
  });

  it("sätter INTERGEO först och den inställda mässan sist", () => {
    const ranked = recommendAll(events, { now: NOW });
    expect(ranked[0].event.slug).toBe("intergeo-2026");
    expect(ranked[ranked.length - 1].recommendation.verdict).toBe("skip");
  });

  it("ger bara Must Attend till de bekräftade A-mässorna", () => {
    const must = recommendAll(events, { now: NOW })
      .filter((r) => r.recommendation.verdict === "must-attend")
      .map((r) => r.event.slug);
    expect(must).toEqual(["intergeo-2026", "xponential-europe-2027"]);
  });
});
