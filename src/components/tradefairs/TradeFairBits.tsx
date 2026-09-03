// Små delade byggstenar för Mässor & Events. Ligger samlade för att listvyn och
// eventprofilen ska rita prioritet, status och poäng likadant.

import { Link } from "react-router-dom";
import { AlertTriangle, CalendarClock, CheckCircle2, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ATTENDANCE_PLAN_LABEL,
  EVENT_PRIORITY_BY_ID,
  EVENT_STATUS_LABEL,
  EXHIBITOR_PRIORITY_BY_ID,
  MEETING_STATUS_BY_ID,
  SCORE_FACTORS,
  SCORE_RAW_MAX,
  VERIFICATION_LABEL,
  type EventPriority,
  type EventStatus,
  type ExhibitorPriority,
  type MeetingStatus,
  type ScoreBreakdown,
  type VerificationStatus,
} from "@/data/tradeFairTaxonomy";
import { scoreRaw } from "@/data/tradeFairEvents";
import { daysUntil, formatDateRange } from "@/lib/tradeFairDates";

const PILL = "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium";

export function PriorityBadge({ priority }: { priority: EventPriority }) {
  const def = EVENT_PRIORITY_BY_ID.get(priority);
  if (!def) return null;
  return (
    <span className={cn(PILL, def.badgeClass)} title={def.description}>
      {def.label}
    </span>
  );
}

export function ExhibitorPriorityBadge({ priority }: { priority: ExhibitorPriority }) {
  const def = EXHIBITOR_PRIORITY_BY_ID.get(priority);
  if (!def) return null;
  return (
    <span className={cn(PILL, def.badgeClass)} title={def.description}>
      {def.label}
    </span>
  );
}

export function MeetingStatusBadge({ status }: { status: MeetingStatus }) {
  const def = MEETING_STATUS_BY_ID.get(status);
  if (!def) return null;
  return <span className={cn(PILL, def.badgeClass)}>{def.label}</span>;
}

export function StatusBadge({ status }: { status: EventStatus }) {
  const tone =
    status === "confirmed"
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
      : status === "cancelled"
        ? "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30"
        : "bg-muted text-muted-foreground border-border";
  return <span className={cn(PILL, tone)}>{EVENT_STATUS_LABEL[status]}</span>;
}

export function VerificationBadge({ verification }: { verification: VerificationStatus }) {
  const Icon = verification === "verified" ? CheckCircle2 : verification === "needs-review" ? AlertTriangle : HelpCircle;
  const tone =
    verification === "verified"
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
      : verification === "needs-review"
        ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
        : "bg-muted text-muted-foreground border-border";
  return (
    <span className={cn(PILL, tone)} title={VERIFICATION_LABEL[verification]}>
      <Icon className="h-3 w-3" />
      {verification === "verified" ? "Verifierad" : verification === "needs-review" ? "Kontrollera" : "Ej verifierad"}
    </span>
  );
}

export function AttendanceBadge({ plan }: { plan: keyof typeof ATTENDANCE_PLAN_LABEL }) {
  const tone =
    plan === "planned" || plan === "attended"
      ? "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30"
      : "bg-muted text-muted-foreground border-border";
  return <span className={cn(PILL, tone)}>{ATTENDANCE_PLAN_LABEL[plan]}</span>;
}

/** Datumsträng, eller "Datum TBC" när nästa upplaga inte är annonserad. */
export function EventDates({
  startDate,
  endDate,
  className,
}: {
  startDate: string | null;
  endDate: string | null;
  className?: string;
}) {
  if (!startDate) {
    return (
      <span className={cn("inline-flex items-center gap-1 text-muted-foreground", className)}>
        <CalendarClock className="h-3.5 w-3.5" />
        Datum TBC
      </span>
    );
  }
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
      {formatDateRange(startDate, endDate)}
    </span>
  );
}

export function ScoreDial({ value, className }: { value: number; className?: string }) {
  const tone =
    value >= 85 ? "text-emerald-600 dark:text-emerald-400" : value >= 70 ? "text-sky-600 dark:text-sky-400" : "text-muted-foreground";
  return (
    <div className={cn("flex items-baseline gap-1", className)}>
      <span className={cn("text-2xl font-semibold tabular-nums", tone)}>{value}</span>
      <span className="text-xs text-muted-foreground">/ 100</span>
    </div>
  );
}

/** Poängen uppdelad per faktor, så att talet går att ifrågasätta. */
export function ScoreBreakdownTable({ score }: { score: ScoreBreakdown }) {
  const raw = scoreRaw(score);
  return (
    <div className="space-y-1.5">
      {SCORE_FACTORS.map((factor) => {
        const value = score[factor.id] ?? 0;
        const pct = factor.max === 0 ? 0 : (value / factor.max) * 100;
        return (
          <div key={factor.id} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1">
            <div className="text-xs" title={factor.help}>
              {factor.label}
            </div>
            <div className="text-xs tabular-nums text-muted-foreground">
              {value} / {factor.max}
            </div>
            <div className="col-span-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary/70" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
      <div className="flex justify-between border-t pt-2 text-xs font-medium">
        <span>Råpoäng</span>
        <span className="tabular-nums">
          {raw} / {SCORE_RAW_MAX}
        </span>
      </div>
      <p className="text-[11px] leading-snug text-muted-foreground">
        De åtta vikterna summerar till {SCORE_RAW_MAX}, inte 100. Opportunity Score är råpoängen
        skalad till 0–100 så att talet betyder det det heter.
      </p>
    </div>
  );
}

export function KpiCard({
  label,
  value,
  hint,
  to,
  unavailable,
}: {
  label: string;
  value: string | number;
  hint?: string;
  to?: string;
  unavailable?: boolean;
}) {
  const body = (
    <div className="rounded-lg border bg-card p-3 transition-colors hover:border-foreground/20 sm:p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">
        {unavailable ? <span className="text-muted-foreground">–</span> : value}
      </div>
      {hint && <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{hint}</div>}
    </div>
  );
  return to ? (
    <Link to={to} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}

export function EUR({ amount }: { amount: number }) {
  return <span className="tabular-nums">{amount.toLocaleString("sv-SE")} EUR</span>;
}

export { daysUntil, formatDateRange };

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">{children}</div>;
}

/** Banner som förklarar att skrivning kräver migreringen. */
export function BackendMissingNotice({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="space-y-1">
        <p className="font-medium">Skrivning är avstängd — mässtabellerna finns inte i databasen ännu.</p>
        {!compact && (
          <p className="leading-snug">
            Mässkatalogen, poängen och kostnadsberäkningen fungerar ändå. Utställare, möten, agenda,
            inköpslista, kostnadsutfall, uppföljningar och rapporter kräver migreringen i{" "}
            <code className="rounded bg-black/10 px-1 py-0.5 dark:bg-white/10">
              docs/migrations/20260903120000_tradefair_events.sql
            </code>
            , som körs från digitalsignal-repot.
          </p>
        )}
      </div>
    </div>
  );
}
