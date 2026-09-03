// KPI-korten på mässdashboarden. Fristående från vyn så att räkningen går att
// testa — det är den enda platsen där "planerat besök" blir till en budgetsiffra.

import type { ResolvedEvent } from "@/lib/tradeFairCatalog";

export interface TradeFairKpis {
  year: number;
  upcoming: number;
  thisYear: number;
  highPriority: number;
  plannedVisits: number;
  /** Summa beräknad kostnad för de mässor vi beslutat besöka, per person. */
  plannedCost: number;
}

export function computeKpis(events: ResolvedEvent[], now: Date = new Date()): TradeFairKpis {
  const today = now.toISOString().slice(0, 10);
  const year = now.getUTCFullYear();
  const live = events.filter((e) => e.status !== "cancelled");

  const planned = events.filter((e) => e.attendancePlan === "planned");

  return {
    year,
    upcoming: live.filter((e) => e.startDate !== null && e.startDate >= today).length,
    thisYear: live.filter((e) => e.startDate !== null && e.startDate.startsWith(String(year))).length,
    highPriority: events.filter((e) => e.priority === "A").length,
    plannedVisits: planned.length,
    plannedCost: planned.reduce((sum, e) => sum + e.totalEstimatedCostValue, 0),
  };
}
