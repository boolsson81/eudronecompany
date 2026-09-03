// Efter mässan: kostnader och ROI, eventrapporten och uppföljningarna.
//
// ROI räknas på det som faktiskt går att belägga — offerter, ordrar, avtal —
// mot verkliga kostnader när de finns och budget när de inte gör det.

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  COST_TYPES,
  COST_TYPE_LABEL,
  FOLLOWUP_STATUS_LABEL,
  NOTIFICATION_OFFSETS_AFTER_DAYS,
  type CostType,
  type FollowUpStatus,
} from "@/data/tradeFairTaxonomy";
import {
  TRADEFAIR_TABLES,
  ensureEventRow,
  insertRow,
  listForEvent,
  updateRow,
  type ResolvedEvent,
  type SupplierOption,
} from "@/lib/tradeFairDb";
import { useEventRows, errorText } from "./useEventRows";
import { EmptyState, EUR } from "./TradeFairBits";

/* ────────────────────────────── Kostnader & ROI ────────────────────────────── */

interface CostRow {
  id: string;
  cost_type: CostType;
  label: string | null;
  estimated_cost: number | null;
  actual_cost: number | null;
}

interface ReportRow {
  id: string;
  summary: string | null;
  opportunities: string | null;
  results: string | null;
  new_suppliers: number;
  new_reseller_agreements: number;
  new_products: number;
  quotes_requested: number;
  orders_placed: number;
  strategic_partnerships: number;
  estimated_value: number | null;
  actual_value: number | null;
  roi_notes: string | null;
}

export function CostsTab({ event, writable }: { event: ResolvedEvent; writable: boolean }) {
  const api = useEventRows<CostRow>(TRADEFAIR_TABLES.costs, event, writable, [{ column: "cost_type" }]);
  const [type, setType] = useState<CostType>("travel");
  const [amount, setAmount] = useState("");

  /** Budget ur katalogen. Ligger kvar som referens även när utfall finns. */
  const planned = useMemo(
    () => [
      { type: "travel" as CostType, amount: event.costs.travel },
      { type: "hotel" as CostType, amount: event.costs.accommodation },
      { type: "ticket" as CostType, amount: event.costs.ticket },
      { type: "other" as CostType, amount: event.costs.other },
    ],
    [event.costs],
  );

  const estimated = api.rows.reduce((sum, r) => sum + (r.estimated_cost ?? 0), 0);
  const actual = api.rows.reduce((sum, r) => sum + (r.actual_cost ?? 0), 0);
  const budget = event.totalEstimatedCostValue;

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-3">
        <SummaryTile label="Budget (katalog)" value={budget} />
        <SummaryTile label="Beräknat (registrerat)" value={estimated} />
        <SummaryTile label="Utfall" value={actual} muted={actual === 0} />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kostnadsslag</TableHead>
              <TableHead className="text-right">Budget</TableHead>
              <TableHead className="text-right">Beräknat</TableHead>
              <TableHead className="text-right">Utfall</TableHead>
              {writable && <TableHead className="w-10" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {planned.map((p) => (
              <TableRow key={`planned-${p.type}`} className="text-muted-foreground">
                <TableCell className="text-sm">{COST_TYPE_LABEL[p.type]} (planering)</TableCell>
                <TableCell className="text-right text-sm">
                  <EUR amount={p.amount} />
                </TableCell>
                <TableCell className="text-right">–</TableCell>
                <TableCell className="text-right">–</TableCell>
                {writable && <TableCell />}
              </TableRow>
            ))}
            {api.rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="text-sm">
                  {COST_TYPE_LABEL[row.cost_type]}
                  {row.label && <span className="ml-1 text-xs text-muted-foreground">{row.label}</span>}
                </TableCell>
                <TableCell className="text-right">–</TableCell>
                <TableCell className="text-right text-sm">
                  {row.estimated_cost !== null ? <EUR amount={row.estimated_cost} /> : "–"}
                </TableCell>
                <TableCell className="text-right">
                  {writable ? (
                    <Input
                      type="number"
                      defaultValue={row.actual_cost ?? ""}
                      className="ml-auto h-8 w-28 text-right"
                      onBlur={(e) => {
                        const value = e.target.value === "" ? null : Number(e.target.value);
                        if (value !== row.actual_cost) void api.patch(row.id, { actual_cost: value });
                      }}
                    />
                  ) : row.actual_cost !== null ? (
                    <EUR amount={row.actual_cost} />
                  ) : (
                    "–"
                  )}
                </TableCell>
                {writable && (
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => void api.remove(row.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {writable && (
        <div className="flex flex-wrap items-end gap-2 rounded-lg border bg-muted/30 p-3">
          <div className="space-y-1">
            <Label className="text-xs">Kostnadsslag</Label>
            <Select value={type} onValueChange={(v) => setType(v as CostType)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COST_TYPES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Beräknad kostnad (EUR)</Label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-36" />
          </div>
          <Button
            className="gap-2"
            disabled={amount === ""}
            onClick={() => {
              void api.add({ cost_type: type, estimated_cost: Number(amount) });
              setAmount("");
            }}
          >
            <Plus className="h-4 w-4" />
            Lägg till
          </Button>
        </div>
      )}
    </div>
  );
}

function SummaryTile({ label, value, muted }: { label: string; value: number; muted?: boolean }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-1 text-xl font-semibold ${muted ? "text-muted-foreground" : ""}`}>
        <EUR amount={value} />
      </div>
    </div>
  );
}

/* ─────────────────────────────── Eventrapport ─────────────────────────────── */

const RESULT_FIELDS: { key: keyof ReportRow; label: string }[] = [
  { key: "new_suppliers", label: "Nya leverantörer" },
  { key: "new_reseller_agreements", label: "Nya återförsäljaravtal" },
  { key: "new_products", label: "Nya produkter" },
  { key: "quotes_requested", label: "Offerter begärda" },
  { key: "orders_placed", label: "Lagda ordrar" },
  { key: "strategic_partnerships", label: "Strategiska partnerskap" },
];

export function ReportTab({ event, writable }: { event: ResolvedEvent; writable: boolean }) {
  const [report, setReport] = useState<ReportRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Partial<ReportRow>>({});

  useEffect(() => {
    let mounted = true;
    void (async () => {
      const rows = await listForEvent<ReportRow>(TRADEFAIR_TABLES.reports, event.eventId);
      if (!mounted) return;
      setReport(rows[0] ?? null);
      setDraft(rows[0] ?? {});
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [event.eventId]);

  const costsBudget = event.totalEstimatedCostValue;
  const value = draft.actual_value ?? draft.estimated_value ?? 0;
  const roi = costsBudget > 0 ? Math.round(((value - costsBudget) / costsBudget) * 100) : null;

  const save = async () => {
    setSaving(true);
    try {
      const eventId = await ensureEventRow(event);
      const payload = {
        summary: draft.summary ?? null,
        opportunities: draft.opportunities ?? null,
        results: draft.results ?? null,
        roi_notes: draft.roi_notes ?? null,
        estimated_value: draft.estimated_value ?? null,
        actual_value: draft.actual_value ?? null,
        ...Object.fromEntries(RESULT_FIELDS.map((f) => [f.key, Number(draft[f.key] ?? 0)])),
      };
      if (report) {
        await updateRow(TRADEFAIR_TABLES.reports, report.id, payload);
      } else {
        const created = await insertRow<ReportRow>(TRADEFAIR_TABLES.reports, { event_id: eventId, ...payload });
        setReport(created);
      }
      toast.success("Rapport sparad");
    } catch (error) {
      toast.error(errorText(error));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryTile label="Kostnad" value={costsBudget} />
        <SummaryTile label="Värde av utfallet" value={value} muted={value === 0} />
        <div className="rounded-lg border bg-card p-3">
          <div className="text-xs text-muted-foreground">
            {draft.actual_value != null ? "Actual ROI" : "Estimated ROI"}
          </div>
          <div className="mt-1 text-xl font-semibold tabular-nums">
            {roi === null || value === 0 ? <span className="text-muted-foreground">–</span> : `${roi} %`}
          </div>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {RESULT_FIELDS.map((field) => (
          <div key={String(field.key)} className="space-y-1">
            <Label className="text-xs">{field.label}</Label>
            <Input
              type="number"
              min={0}
              disabled={!writable}
              value={String(draft[field.key] ?? 0)}
              onChange={(e) => setDraft((d) => ({ ...d, [field.key]: Number(e.target.value) }))}
            />
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-xs">Uppskattat värde (EUR)</Label>
          <Input
            type="number"
            disabled={!writable}
            value={draft.estimated_value ?? ""}
            onChange={(e) =>
              setDraft((d) => ({ ...d, estimated_value: e.target.value === "" ? null : Number(e.target.value) }))
            }
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Verkligt värde (EUR)</Label>
          <Input
            type="number"
            disabled={!writable}
            value={draft.actual_value ?? ""}
            onChange={(e) =>
              setDraft((d) => ({ ...d, actual_value: e.target.value === "" ? null : Number(e.target.value) }))
            }
          />
        </div>
      </div>

      {(
        [
          ["summary", "Sammanfattning"],
          ["opportunities", "Inköpsmöjligheter — produkter vi hittade"],
          ["results", "Leverantörsmöjligheter — nya leverantörer"],
          ["roi_notes", "ROI-kommentar"],
        ] as const
      ).map(([key, label]) => (
        <div key={key} className="space-y-1">
          <Label className="text-xs">{label}</Label>
          <Textarea
            rows={3}
            disabled={!writable}
            value={(draft[key] as string | null) ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
          />
        </div>
      ))}

      {writable && (
        <Button onClick={() => void save()} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Spara rapport
        </Button>
      )}
    </div>
  );
}

/* ─────────────────────────────── Uppföljningar ─────────────────────────────── */

interface FollowUpRow {
  id: string;
  title: string;
  supplier_id: string | null;
  contact_name: string | null;
  due_date: string | null;
  status: FollowUpStatus;
  notes: string | null;
}

export function FollowUpsTab({
  event,
  writable,
  suppliers,
}: {
  event: ResolvedEvent;
  writable: boolean;
  suppliers: SupplierOption[];
}) {
  const api = useEventRows<FollowUpRow>(TRADEFAIR_TABLES.followups, event, writable, [
    { column: "status" },
    { column: "due_date" },
  ]);
  const [title, setTitle] = useState("");
  const [supplierId, setSupplierId] = useState("none");
  const [dueDate, setDueDate] = useState("");

  const supplierById = useMemo(() => new Map(suppliers.map((s) => [s.id, s])), [suppliers]);

  /** Förslag på förfallodatum enligt notifieringsschemat efter mässan. */
  const suggestedDates = useMemo(() => {
    if (!event.endDate) return [];
    const end = Date.parse(`${event.endDate}T00:00:00Z`);
    return NOTIFICATION_OFFSETS_AFTER_DAYS.map((days) => ({
      days,
      date: new Date(end + days * 86_400_000).toISOString().slice(0, 10),
    }));
  }, [event.endDate]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        En mässa som inte följs upp är en kostnad, inte en investering. Uppföljningarna driver
        KPI:n på dashboarden.
      </p>

      {writable && (
        <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-[14rem] flex-1 space-y-1">
              <Label className="text-xs">Uppföljning</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="t.ex. Följ upp offert från YellowScan"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Leverantör</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ingen koppling</SelectItem>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Förfaller</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-40" />
            </div>
            <Button
              className="gap-2"
              disabled={!title.trim()}
              onClick={() => {
                void api.add({
                  title: title.trim(),
                  supplier_id: supplierId === "none" ? null : supplierId,
                  due_date: dueDate || null,
                  status: "open",
                });
                setTitle("");
                setDueDate("");
              }}
            >
              <Plus className="h-4 w-4" />
              Lägg till
            </Button>
          </div>
          {suggestedDates.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              Förslag efter mässan:
              {suggestedDates.map((s) => (
                <button
                  key={s.days}
                  type="button"
                  onClick={() => setDueDate(s.date)}
                  className="rounded-full border px-2 py-0.5 hover:border-foreground/40 hover:text-foreground"
                >
                  +{s.days} d ({s.date})
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {api.loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : api.rows.length === 0 ? (
        <EmptyState>Inga uppföljningar registrerade.</EmptyState>
      ) : (
        <div className="space-y-2">
          {api.rows.map((row) => (
            <div key={row.id} className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
              <div className="min-w-[12rem] flex-1">
                <div className="text-sm font-medium">{row.title}</div>
                <div className="text-xs text-muted-foreground">
                  {[
                    row.supplier_id ? (supplierById.get(row.supplier_id)?.name ?? "Leverantör") : null,
                    row.due_date ? `förfaller ${row.due_date}` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "Inget datum satt"}
                </div>
              </div>
              {writable ? (
                <>
                  <Select value={row.status} onValueChange={(v) => void api.patch(row.id, { status: v })}>
                    <SelectTrigger className="h-8 w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(FOLLOWUP_STATUS_LABEL).map(([id, label]) => (
                        <SelectItem key={id} value={id}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="sm" onClick={() => void api.remove(row.id)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">{FOLLOWUP_STATUS_LABEL[row.status]}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
