// Eventprofil. Svarar, i den ordningen, på: bör vi åka hit, vilka finns där,
// vilka måste vi träffa, vad ska vi leta efter, vad kostar det, och vad fick vi ut.

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Check,
  CheckSquare,
  ExternalLink,
  Loader2,
  MapPin,
  Square,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePersistedTab } from "@/hooks/usePersistedTab";
import {
  ATTENDANCE_PLAN_LABEL,
  EVENT_CATEGORY_BY_ID,
  NOTIFICATION_OFFSETS_BEFORE_DAYS,
  PREP_CHECKLIST,
  PREP_GROUP_LABEL,
  VERIFICATION_LABEL,
  type AttendancePlan,
} from "@/data/tradeFairTaxonomy";
import {
  TRADEFAIR_TABLES,
  ensureEventRow,
  listForEvent,
  loadSuppliers,
  setPrepItem,
  updateEvent,
  useEvents,
  type ResolvedEvent,
  type SupplierOption,
} from "@/lib/tradeFairDb";
import { recommendEvent } from "@/lib/tradeFairRecommendation";
import {
  AttendanceBadge,
  BackendMissingNotice,
  EUR,
  EventDates,
  PriorityBadge,
  ScoreBreakdownTable,
  ScoreDial,
  StatusBadge,
  VerificationBadge,
  VerdictBadge,
  daysUntil,
} from "@/components/tradefairs/TradeFairBits";
import ExhibitorsTab from "@/components/tradefairs/ExhibitorsTab";
import MeetingsTab from "@/components/tradefairs/MeetingsTab";
import { AgendaTab, WishlistTab } from "@/components/tradefairs/PlanningTabs";
import { CostsTab, FollowUpsTab, ReportTab } from "@/components/tradefairs/ResultsTabs";
import ResearchDialog from "@/components/tradefairs/ResearchDialog";

export default function TradeFairEvent() {
  const { slug = "" } = useParams();
  const { events, loading, backendAvailable } = useEvents();
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [tab, setTab] = usePersistedTab("tradefair.event.tab", "overview");

  const event = useMemo(() => events.find((e) => e.slug === slug), [events, slug]);
  const writable = backendAvailable === true;

  useEffect(() => {
    if (!writable) return;
    void loadSuppliers().then(setSuppliers).catch(() => setSuppliers([]));
  }, [writable]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-3xl space-y-3 px-4 py-10 text-center">
        <h1 className="text-lg font-semibold">Mässan finns inte</h1>
        <p className="text-sm text-muted-foreground">Ingen mässa med sökvägen «{slug}».</p>
        <Button asChild variant="outline">
          <Link to="/admin/trade-fairs">Tillbaka till listan</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 py-6">
      <Link
        to="/admin/trade-fairs"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Mässor &amp; Events
      </Link>

      <EventHeader event={event} writable={writable} />

      {!writable && <BackendMissingNotice />}

      <Tabs persistKey={null} value={tab} onValueChange={setTab} className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="inline-flex w-max">
            <TabsTrigger value="overview">Översikt</TabsTrigger>
            <TabsTrigger value="exhibitors">Utställare</TabsTrigger>
            <TabsTrigger value="meetings">Möten</TabsTrigger>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
            <TabsTrigger value="wishlist">Inköpslista</TabsTrigger>
            <TabsTrigger value="costs">Kostnader</TabsTrigger>
            <TabsTrigger value="report">Rapport &amp; ROI</TabsTrigger>
            <TabsTrigger value="followups">Uppföljning</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview">
          <OverviewTab event={event} writable={writable} />
        </TabsContent>
        <TabsContent value="exhibitors">
          <ExhibitorsTab event={event} writable={writable} suppliers={suppliers} />
        </TabsContent>
        <TabsContent value="meetings">
          <MeetingsTab event={event} writable={writable} suppliers={suppliers} />
        </TabsContent>
        <TabsContent value="agenda">
          <AgendaTab event={event} writable={writable} />
        </TabsContent>
        <TabsContent value="wishlist">
          <WishlistTab event={event} writable={writable} suppliers={suppliers} />
        </TabsContent>
        <TabsContent value="costs">
          <CostsTab event={event} writable={writable} />
        </TabsContent>
        <TabsContent value="report">
          <ReportTab event={event} writable={writable} />
        </TabsContent>
        <TabsContent value="followups">
          <FollowUpsTab event={event} writable={writable} suppliers={suppliers} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EventHeader({ event, writable }: { event: ResolvedEvent; writable: boolean }) {
  const [plan, setPlan] = useState<AttendancePlan>(event.attendancePlan);
  const [saving, setSaving] = useState(false);
  const days = daysUntil(event.startDate);

  const changePlan = async (next: AttendancePlan) => {
    const previous = plan;
    setPlan(next);
    setSaving(true);
    try {
      const eventId = await ensureEventRow(event);
      await updateEvent(eventId, { attendance_plan: next });
      toast.success(`Beslut sparat: ${ATTENDANCE_PLAN_LABEL[next]}`);
    } catch (error) {
      setPlan(previous);
      toast.error((error as { message?: string }).message ?? "Kunde inte spara beslutet.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <header className="space-y-3 rounded-lg border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">{event.name}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <EventDates startDate={event.startDate} endDate={event.endDate} />
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {[event.venue, event.city, event.country].filter(Boolean).join(", ")}
            </span>
            {event.organizer && (
              <span className="inline-flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                {event.organizer}
              </span>
            )}
            {event.website && (
              <a
                href={event.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-foreground hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Officiell webbplats
              </a>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <PriorityBadge priority={event.priority} />
            <StatusBadge status={event.status} />
            <VerificationBadge verification={event.verification} />
            {!writable && <AttendanceBadge plan={plan} />}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Opportunity Score</div>
            <ScoreDial value={event.opportunityScoreValue} className="justify-end" />
          </div>
          {writable && (
            <Select value={plan} onValueChange={(v) => void changePlan(v as AttendancePlan)} disabled={saving}>
              <SelectTrigger className="h-8 w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ATTENDANCE_PLAN_LABEL).map(([id, label]) => (
                  <SelectItem key={id} value={id}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <div className="text-right text-xs text-muted-foreground">
            Beräknad kostnad <EUR amount={event.totalEstimatedCostValue} /> / person
          </div>
        </div>
      </div>

      {days !== null && days >= 0 && (
        <NotificationStrip days={days} />
      )}
    </header>
  );
}

/** Visar var i notifieringsschemat mässan befinner sig (30/14/7/1 dagar). */
function NotificationStrip({ days }: { days: number }) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-t pt-3 text-xs text-muted-foreground">
      <span>Om {days} dagar.</span>
      {NOTIFICATION_OFFSETS_BEFORE_DAYS.map((offset) => (
        <span
          key={offset}
          className={
            days <= offset
              ? "rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-amber-800 dark:text-amber-300"
              : "rounded-full border px-2 py-0.5"
          }
        >
          {offset} d
        </span>
      ))}
      <span className="text-[11px]">Påminnelser byggs i fas 3 — markeringen visar var vi står.</span>
    </div>
  );
}


/**
 * «Bör vi åka?» — uppdragets § 27. Motiveringen står bredvid omdömet, eftersom
 * ett omdöme utan skäl inte går att invända mot.
 */
function RecommendationCard({ event }: { event: ResolvedEvent }) {
  const advice = useMemo(() => recommendEvent(event), [event]);

  return (
    <section className="space-y-3 rounded-lg border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-medium">Bör vi åka?</h2>
        <VerdictBadge verdict={advice.verdict} />
      </div>
      <p className="text-sm">{advice.headline}</p>

      {advice.reasons.length > 0 && (
        <ul className="space-y-1">
          {advice.reasons.map((reason) => (
            <li key={reason} className="flex gap-2 text-xs text-muted-foreground">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      )}

      {advice.warnings.length > 0 && (
        <ul className="space-y-1 border-t pt-2">
          {advice.warnings.map((warning) => (
            <li key={warning} className="flex gap-2 text-xs text-muted-foreground">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>{warning}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="text-[11px] leading-snug text-muted-foreground">
        Bedömningen är regelbaserad och läser poängen, datumet, kostnaden och vilka sourcingbehov
        mässans ämnesområden täcker. Den vet ingenting om utställarlistan.
      </p>
    </section>
  );
}

function OverviewTab({ event, writable }: { event: ResolvedEvent; writable: boolean }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <RecommendationCard event={event} />

        <section className="space-y-2 rounded-lg border bg-card p-4">
          <h2 className="text-sm font-medium">Varför mässan är relevant för EU Drone Company</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {event.whyRelevant || "Ingen motivering skriven ännu."}
          </p>
        </section>

        <section className="space-y-3 rounded-lg border bg-card p-4">
          <h2 className="text-sm font-medium">Kategorier och målbranscher</h2>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {event.categories.map((id) => (
                <span key={id} className="rounded-full border px-2 py-0.5 text-xs">
                  {EVENT_CATEGORY_BY_ID.get(id)?.label ?? id}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {event.topics.map((t) => (
                <span key={t} className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                  {t}
                </span>
              ))}
            </div>
            {event.targetIndustries.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Målbranscher: {event.targetIndustries.join(", ")}
              </p>
            )}
          </div>
        </section>

        <PrepChecklist event={event} writable={writable} />

        <section className="space-y-2 rounded-lg border bg-card p-4 text-xs text-muted-foreground">
          <h2 className="text-sm font-medium text-foreground">Källa och verifiering</h2>
          <p>{VERIFICATION_LABEL[event.verification]}.</p>
          {event.source && <p>{event.source}</p>}
          {event.lastResearched && <p>Senast researchad: {event.lastResearched}</p>}
          {event.notes && <p className="border-t pt-2">{event.notes}</p>}
          <div className="flex gap-2 pt-1">
            <ResearchDialog mode={{ action: "research", event }} writable={writable} />
          </div>
        </section>
      </div>

      <div className="space-y-4">
        <section className="space-y-3 rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Opportunity Score</h2>
            <ScoreDial value={event.opportunityScoreValue} />
          </div>
          <ScoreBreakdownTable score={event.score} />
          {event.statedRelevance > 0 && event.statedRelevance !== event.opportunityScoreValue && (
            <p className="text-[11px] text-muted-foreground">
              Ursprunglig bedömning i uppdraget: {event.statedRelevance}/100. Skillnaden kommer av att
              poängen här räknas ur faktorerna ovan i stället för att sättas som ett tal.
            </p>
          )}
        </section>

        <section className="space-y-2 rounded-lg border bg-card p-4">
          <h2 className="text-sm font-medium">Nyckeltal</h2>
          <dl className="space-y-1 text-sm">
            <Row label="Utställare" value={event.expectedExhibitors?.toLocaleString("sv-SE") ?? "Ej publicerat"} />
            <Row label="Besökare" value={event.expectedVisitors?.toLocaleString("sv-SE") ?? "Ej publicerat"} />
            <Row label="Resa" value={`${event.costs.travel.toLocaleString("sv-SE")} EUR`} />
            <Row label="Boende" value={`${event.costs.accommodation.toLocaleString("sv-SE")} EUR`} />
            <Row label="Biljett" value={`${event.costs.ticket.toLocaleString("sv-SE")} EUR`} />
            <Row label="Övrigt" value={`${event.costs.other.toLocaleString("sv-SE")} EUR`} />
            <Row
              label="Totalt / person"
              value={`${event.totalEstimatedCostValue.toLocaleString("sv-SE")} EUR`}
              strong
            />
          </dl>
        </section>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-3 ${strong ? "border-t pt-1 font-medium" : ""}`}>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}

interface PrepRow {
  id: string;
  item_id: string;
  done: boolean;
}

function PrepChecklist({ event, writable }: { event: ResolvedEvent; writable: boolean }) {
  const [done, setDone] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      const rows = await listForEvent<PrepRow>(TRADEFAIR_TABLES.prep, event.eventId);
      if (!mounted) return;
      setDone(new Set(rows.filter((r) => r.done).map((r) => r.item_id)));
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [event.eventId]);

  const toggle = async (itemId: string) => {
    const next = new Set(done);
    const value = !next.has(itemId);
    if (value) next.add(itemId);
    else next.delete(itemId);
    setDone(next);
    try {
      const eventId = await ensureEventRow(event);
      await setPrepItem(eventId, itemId, value);
    } catch (error) {
      setDone(done);
      toast.error((error as { message?: string }).message ?? "Kunde inte spara checklistan.");
    }
  };

  const groups = ["research", "meetings", "purchasing", "logistics"] as const;

  return (
    <section className="space-y-3 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">Before Event</h2>
        <span className="text-xs text-muted-foreground">
          {loading ? "…" : `${done.size} / ${PREP_CHECKLIST.length} klara`}
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {groups.map((group) => (
          <div key={group} className="space-y-1">
            <h3 className="text-xs font-medium text-muted-foreground">{PREP_GROUP_LABEL[group]}</h3>
            {PREP_CHECKLIST.filter((i) => i.group === group).map((item) => {
              const checked = done.has(item.id);
              const Icon = checked ? CheckSquare : Square;
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={!writable}
                  onClick={() => void toggle(item.id)}
                  className="flex w-full items-center gap-2 rounded px-1 py-0.5 text-left text-sm transition-colors hover:bg-muted/50 disabled:cursor-default disabled:hover:bg-transparent"
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${checked ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}
                  />
                  <span className={checked ? "text-muted-foreground line-through" : ""}>{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
