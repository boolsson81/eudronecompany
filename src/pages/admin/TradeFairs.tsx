// Inköp → Mässor & Events — dashboard och mässlista.
//
// Sidan ska svara på "vilka mässor är värda att besöka?" innan den svarar på
// "när går de?". Därför sorteras listan på Opportunity Score som standard, och
// kostnaden per mässa står bredvid poängen i stället för i en detaljvy.

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  EVENT_CATEGORIES,
  EVENT_PRIORITIES,
  EVENT_PRIORITY_BY_ID,
} from "@/data/tradeFairTaxonomy";
import { loadDashboardCounts, useEvents, type ResolvedEvent } from "@/lib/tradeFairDb";
import { computeKpis } from "@/lib/tradeFairKpis";
import {
  AttendanceBadge,
  BackendMissingNotice,
  EmptyState,
  EUR,
  EventDates,
  KpiCard,
  PriorityBadge,
  StatusBadge,
  VerificationBadge,
  daysUntil,
} from "@/components/tradefairs/TradeFairBits";

type SortKey = "score" | "date" | "cost";

export default function TradeFairs() {
  const { events, loading, backendAvailable } = useEvents();
  const [counts, setCounts] = useState<Awaited<ReturnType<typeof loadDashboardCounts>>>(null);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [priority, setPriority] = useState("all");
  const [country, setCountry] = useState("all");
  const [sort, setSort] = useState<SortKey>("score");
  const [showNotRelevant, setShowNotRelevant] = useState(false);
  const [onlyUpcoming, setOnlyUpcoming] = useState(false);

  useEffect(() => {
    if (backendAvailable === false) return;
    void loadDashboardCounts().then(setCounts).catch(() => setCounts(null));
  }, [backendAvailable]);

  const countries = useMemo(
    () => Array.from(new Set(events.map((e) => e.country).filter(Boolean))).sort((a, b) => a.localeCompare(b, "sv")),
    [events],
  );

  const kpis = useMemo(() => computeKpis(events), [events]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const today = new Date().toISOString().slice(0, 10);

    const rows = events.filter((e) => {
      // D visas bara när användaren aktivt begär det (spec § Event Priority).
      if (!showNotRelevant && !(EVENT_PRIORITY_BY_ID.get(e.priority)?.inDefaultList ?? true)) return false;
      if (priority !== "all" && e.priority !== priority) return false;
      if (category !== "all" && !e.categories.includes(category as never)) return false;
      if (country !== "all" && e.country !== country) return false;
      if (onlyUpcoming && e.endDate !== null && e.endDate < today) return false;
      if (!q) return true;
      return [e.name, e.organizer, e.city, e.country, e.venue, e.whyRelevant, ...e.topics, ...e.targetIndustries]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });

    return rows.sort((a, b) => {
      if (sort === "cost") return a.totalEstimatedCostValue - b.totalEstimatedCostValue;
      if (sort === "date") {
        if (a.startDate && b.startDate) return a.startDate.localeCompare(b.startDate);
        if (a.startDate) return -1;
        if (b.startDate) return 1;
      }
      return b.opportunityScoreValue - a.opportunityScoreValue;
    });
  }, [events, query, category, priority, country, sort, showNotRelevant, onlyUpcoming]);

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 py-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Mässor &amp; Events</h1>
        <p className="text-sm text-muted-foreground">
          Vilka mässor EU Drone Company bör besöka för att hitta nya produkter, leverantörer och
          affärspartners — och vad de kostar.
        </p>
      </header>

      {backendAvailable === false && <BackendMissingNotice />}

      <section className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <KpiCard label="Upcoming Events" value={kpis.upcoming} hint="Mässor med datum framåt" />
        <KpiCard label="This Year" value={kpis.thisYear} hint={`Bekräftade datum ${kpis.year}`} />
        <KpiCard label="High Priority" value={kpis.highPriority} hint="Prioritet A" />
        <KpiCard label="Planned Visits" value={kpis.plannedVisits} hint="Beslutade besök" />
        <KpiCard
          label="Supplier Meetings"
          value={counts?.supplierMeetings ?? 0}
          hint={counts ? "Bokade eller efterfrågade" : "Kräver mässtabellerna"}
          unavailable={!counts}
        />
        <KpiCard
          label="New Suppliers"
          value={counts?.newSuppliers ?? 0}
          hint={counts ? "Utställare utan koppling till leverantörsregistret" : "Kräver mässtabellerna"}
          unavailable={!counts}
        />
        <KpiCard
          label="Follow-ups"
          value={counts?.openFollowUps ?? 0}
          hint={counts ? "Öppna eller pågående" : "Kräver mässtabellerna"}
          unavailable={!counts}
        />
        <KpiCard
          label="Estimated Event Cost"
          value={`${kpis.plannedCost.toLocaleString("sv-SE")} EUR`}
          hint="Planerade besök, per person"
        />
      </section>

      <section className="space-y-3 rounded-lg border bg-card p-3 sm:p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-1 lg:col-span-2">
            <Label htmlFor="tf-search" className="text-xs">
              Sök
            </Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="tf-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Mässa, stad, arrangör, LiDAR, inspection…"
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Kategori</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla kategorier</SelectItem>
                {EVENT_CATEGORIES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Prioritet</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla prioriteter</SelectItem>
                {EVENT_PRIORITIES.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Land</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla länder</SelectItem>
                {countries.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Label className="text-xs">Sortera</Label>
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="h-8 w-[190px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">Opportunity Score</SelectItem>
                <SelectItem value="date">Datum</SelectItem>
                <SelectItem value="cost">Kostnad</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center gap-2 text-xs">
            <Checkbox checked={onlyUpcoming} onCheckedChange={(v) => setOnlyUpcoming(v === true)} />
            Bara kommande
          </label>
          <label className="flex items-center gap-2 text-xs">
            <Checkbox checked={showNotRelevant} onCheckedChange={(v) => setShowNotRelevant(v === true)} />
            Visa D – Not Relevant
          </label>
          <Button variant="outline" size="sm" className="ml-auto gap-2" disabled title="Byggs i fas 4">
            <Sparkles className="h-3.5 w-3.5" />
            AI Discover Events
          </Button>
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState>Ingen mässa matchar filtret.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mässa</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Plats</TableHead>
                <TableHead>Prioritet</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-right">Kostnad</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((event) => (
                <EventRow key={event.slug} event={event} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Datum utan officiell bekräftelse står som <strong>Datum TBC</strong> och status{" "}
        <strong>Obekräftad</strong> — de hittas aldrig på. Källpolicyn står i{" "}
        <code className="rounded bg-muted px-1 py-0.5">docs/TRADE_FAIR_MODULE.md</code>.
      </p>
    </div>
  );
}

function EventRow({ event }: { event: ResolvedEvent }) {
  const days = daysUntil(event.startDate);
  return (
    <TableRow>
      <TableCell className="max-w-[26rem]">
        <Link to={`/admin/trade-fairs/${event.slug}`} className="font-medium hover:underline">
          {event.name}
        </Link>
        <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{event.whyRelevant}</div>
        <div className="mt-1 flex flex-wrap gap-1">
          {event.topics.slice(0, 5).map((t) => (
            <span key={t} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {t}
            </span>
          ))}
        </div>
      </TableCell>
      <TableCell className="whitespace-nowrap text-sm">
        <EventDates startDate={event.startDate} endDate={event.endDate} />
        {days !== null && days >= 0 && (
          <div className="text-xs text-muted-foreground">om {days} dagar</div>
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap text-sm">
        {event.city ? `${event.city}, ` : ""}
        {event.country}
        {event.venue && <div className="text-xs text-muted-foreground">{event.venue}</div>}
      </TableCell>
      <TableCell>
        <div className="flex flex-col items-start gap-1">
          <PriorityBadge priority={event.priority} />
          <AttendanceBadge plan={event.attendancePlan} />
        </div>
      </TableCell>
      <TableCell className="text-right text-lg font-semibold tabular-nums">
        {event.opportunityScoreValue}
      </TableCell>
      <TableCell className="text-right text-sm">
        <EUR amount={event.totalEstimatedCostValue} />
      </TableCell>
      <TableCell>
        <div className="flex flex-col items-start gap-1">
          <StatusBadge status={event.status} />
          <VerificationBadge verification={event.verification} />
        </div>
      </TableCell>
    </TableRow>
  );
}
