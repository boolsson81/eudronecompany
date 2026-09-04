// «Vilka mässor bör EU Drone Company besöka?» — uppdragets § 27.
//
// Reglerna är avsiktligt explicita i stället för en modellfråga. Ett inköpsbeslut
// som kostar en resa och tre dagar ska gå att ifrågasätta rad för rad, och
// uppdraget kräver att motiveringen alltid följer med. En AI-variant kan senare
// förfina bedömningen, men då mot den här stegen som utgångsläge — inte i
// stället för den.
//
// Motorn läser bara sådant vi faktiskt vet: poängen, datumet, kostnaden,
// statusen och vilka sourcingbehov mässans ämnesområden täcker. Den gissar
// aldrig om utställarlistan.

import { SOURCING_GAPS, WISHLIST_SUGGESTIONS, type SourcingTier } from "@/data/tradeFairTaxonomy";
import type { ResolvedEvent } from "@/lib/tradeFairCatalog";
import { daysUntil } from "@/lib/tradeFairDates";

export type Verdict = "must-attend" | "recommended" | "optional" | "skip";

export const VERDICT_LABEL: Record<Verdict, string> = {
  "must-attend": "Must Attend",
  recommended: "Recommended",
  optional: "Optional",
  skip: "Skip",
};

export const VERDICT_BADGE: Record<Verdict, string> = {
  "must-attend": "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  recommended: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30",
  optional: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  skip: "bg-muted text-muted-foreground border-border",
};

/** Stegen, svagast först. Modifierare flyttar ett steg i taget. */
const LADDER: Verdict[] = ["skip", "optional", "recommended", "must-attend"];

function step(verdict: Verdict, delta: number): Verdict {
  const index = LADDER.indexOf(verdict);
  return LADDER[Math.min(Math.max(index + delta, 0), LADDER.length - 1)];
}

/**
 * Möten bokas normalt 4–6 veckor i förväg. Under 21 dagar är det sent, under
 * 7 dagar hinner en montertid sällan bekräftas alls.
 */
const LEAD_TIME_TIGHT_DAYS = 21;
const LEAD_TIME_TOO_LATE_DAYS = 7;

/**
 * Under den här poängen betyder ett par träffar på inköpslistan ingenting —
 * poängen har redan sagt att mässan är svag, och varje drönarmässa har någon
 * form av tunglyft och dockor.
 */
const GAP_UPGRADE_MIN_SCORE = 70;

export interface RecommendationInput {
  /** Sourcingbehov att matcha mot mässans ämnen. Default: den stående listan. */
  sourcingGaps?: readonly string[];
  /** Kostnadstak per resa och person i EUR. Utan tak vägs kostnaden inte in. */
  budgetPerTrip?: number;
  now?: Date;
}

export interface Recommendation {
  verdict: Verdict;
  /** En mening som räcker i en tabellrad. */
  headline: string;
  /** Vad som talar för. */
  reasons: string[];
  /** Vad som talar emot, eller måste kontrolleras först. */
  warnings: string[];
  /** Sourcingbehov mässans ämnen täcker. */
  coveredGaps: string[];
  /** Delmängden som är svår att fylla på annat håll — den som väger. */
  strategicGaps: string[];
  leadTimeDays: number | null;
}

/** Vilka av behoven som mässans ämnesområden svarar mot. */
export function coveredSourcingGaps(
  event: ResolvedEvent,
  gaps: readonly string[] = WISHLIST_SUGGESTIONS,
  tier?: SourcingTier,
): string[] {
  const topics = new Set(event.topics);
  return gaps.filter((gap) => {
    const definition = SOURCING_GAPS[gap];
    if (!definition) return false;
    if (tier !== undefined && definition.tier !== tier) return false;
    return definition.topics.some((topic) => topics.has(topic));
  });
}

export function recommendEvent(event: ResolvedEvent, input: RecommendationInput = {}): Recommendation {
  const now = input.now ?? new Date();
  const gaps = input.sourcingGaps ?? WISHLIST_SUGGESTIONS;
  const today = now.toISOString().slice(0, 10);
  const leadTimeDays = daysUntil(event.startDate, now);
  const coveredGaps = coveredSourcingGaps(event, gaps);
  const strategicGaps = coveredSourcingGaps(event, gaps, "strategic");

  const reasons: string[] = [];
  const warnings: string[] = [];

  // Hårda utfall först. En inställd eller passerad mässa är inget att väga.
  if (event.status === "cancelled") {
    return {
      verdict: "skip",
      headline: "Inställd av arrangören.",
      reasons: [],
      warnings: ["Mässan blir inte av. Ingen ersättare är annonserad."],
      coveredGaps,
      strategicGaps: coveredSourcingGaps(event, gaps, "strategic"),
      leadTimeDays,
    };
  }

  if (event.endDate !== null && event.endDate < today) {
    return {
      verdict: "skip",
      headline: "Redan genomförd — vänta på nästa upplaga.",
      reasons: [],
      warnings: ["Datum för nästa upplaga är inte inlagda."],
      coveredGaps,
      strategicGaps: coveredSourcingGaps(event, gaps, "strategic"),
      leadTimeDays,
    };
  }

  // Poängen sätter utgångsläget; allt annat flyttar det.
  const score = event.opportunityScoreValue;
  let verdict: Verdict =
    score >= 90 ? "must-attend" : score >= 75 ? "recommended" : score >= 60 ? "optional" : "skip";
  reasons.push(`Opportunity Score ${score} av 100.`);

  if (event.priority === "D") {
    verdict = "skip";
    warnings.push("Klassad som D – Not Relevant.");
  }

  // Ett strategiskt behov som mässan svarar mot kan lyfta ett omdöme — men bara
  // till Recommended. Must Attend ska poängen stå för på egen hand, annars kan
  // en medelmåttig mässa klättra hela vägen på generisk drönartäckning.
  if (strategicGaps.length >= 2 && score >= GAP_UPGRADE_MIN_SCORE) {
    const raised = step(verdict, 1);
    verdict = LADDER.indexOf(raised) > LADDER.indexOf("recommended") ? verdict : raised;
    reasons.push(`Täcker ${strategicGaps.length} strategiska sourcingbehov: ${strategicGaps.join(", ")}.`);
  } else if (strategicGaps.length > 0) {
    reasons.push(`Täcker ${strategicGaps.join(" och ")}.`);
  } else {
    warnings.push("Svarar inte mot något av de strategiska sourcingbehoven på inköpslistan.");
  }

  const commodityGaps = coveredGaps.filter((gap) => !strategicGaps.includes(gap));
  if (commodityGaps.length > 0) {
    reasons.push(`Även förbrukningsvaror: ${commodityGaps.join(", ")}. Motiverar ingen resa i sig.`);
  }

  if (event.score.supplierRelevance >= 20) {
    reasons.push("Hög täthet av tillverkare och leverantörer.");
  }

  // Ett obekräftat datum går inte att budgetera, hur bra mässan än är.
  if (event.dateStatus === "tbc") {
    verdict = step(verdict, -1);
    warnings.push("Datum är inte bekräftat — mässan går inte att budgetera eller boka möten till.");
  } else if (leadTimeDays !== null) {
    if (leadTimeDays < 0) {
      warnings.push("Mässan pågår redan. Kvar är drop-in och det som går att hinna med.");
    } else if (leadTimeDays < LEAD_TIME_TOO_LATE_DAYS) {
      verdict = step(verdict, -1);
      warnings.push(
        `Bara ${leadTimeDays} dagar kvar. Montertider hinner sällan bekräftas — räkna med drop-in.`,
      );
    } else if (leadTimeDays < LEAD_TIME_TIGHT_DAYS) {
      warnings.push(`${leadTimeDays} dagar kvar. Möten bokas normalt 4–6 veckor i förväg.`);
    }
  }

  if (input.budgetPerTrip !== undefined && event.totalEstimatedCostValue > input.budgetPerTrip) {
    verdict = step(verdict, -1);
    warnings.push(
      `Beräknad kostnad ${event.totalEstimatedCostValue.toLocaleString("sv-SE")} EUR överstiger taket ${input.budgetPerTrip.toLocaleString("sv-SE")} EUR.`,
    );
  }

  if (event.verification !== "verified") {
    warnings.push("Uppgifterna är inte verifierade mot officiell källa.");
  }

  return {
    verdict,
    headline: headlineFor(verdict, event, strategicGaps, leadTimeDays),
    reasons,
    warnings,
    coveredGaps,
    strategicGaps,
    leadTimeDays,
  };
}

function headlineFor(
  verdict: Verdict,
  event: ResolvedEvent,
  coveredGaps: string[],
  leadTimeDays: number | null,
): string {
  if (event.attendancePlan === "planned") return "Besök redan beslutat.";
  if (event.attendancePlan === "attended") return "Redan besökt — följ upp kontakterna.";
  // Har mässan öppnat är frågan inte längre om vi ska åka.
  if (leadTimeDays !== null && leadTimeDays < 0) return "Pågår redan. Res bara om någon kan åka i dag.";

  switch (verdict) {
    case "must-attend":
      return coveredGaps.length > 0
        ? `Åk. Här finns ${coveredGaps.slice(0, 2).join(" och ")}.`
        : "Åk. Högsta relevans för sortimentet.";
    case "recommended":
      return "Värd resan om budgeten räcker.";
    case "optional":
      return "Bevaka. Åk om något annat för dit ändå.";
    case "skip":
      return "Lägg inte resan här.";
  }
}

/** Bedömer hela listan. Sorterar starkaste rekommendation först. */
export function recommendAll(
  events: ResolvedEvent[],
  input: RecommendationInput = {},
): { event: ResolvedEvent; recommendation: Recommendation }[] {
  return events
    .map((event) => ({ event, recommendation: recommendEvent(event, input) }))
    .sort((a, b) => {
      const rank = LADDER.indexOf(b.recommendation.verdict) - LADDER.indexOf(a.recommendation.verdict);
      if (rank !== 0) return rank;
      return b.event.opportunityScoreValue - a.event.opportunityScoreValue;
    });
}
