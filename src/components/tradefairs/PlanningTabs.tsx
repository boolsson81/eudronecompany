// My Event Plan (agenda) och Purchasing Wishlist. Båda hör till förberedelsen:
// agendan svarar på "var ska jag vara när", inköpslistan på "vad ska jag leta
// efter medan jag är där".

import { useMemo, useState } from "react";
import { Clock, List, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  WISHLIST_PRIORITY_LABEL,
  WISHLIST_SUGGESTIONS,
  type WishlistPriority,
} from "@/data/tradeFairTaxonomy";
import { TRADEFAIR_TABLES, type ResolvedEvent, type SupplierOption } from "@/lib/tradeFairDb";
import { useEventRows } from "./useEventRows";
import { EmptyState, EUR } from "./TradeFairBits";
import type { MeetingRow } from "./MeetingsTab";

/* ─────────────────────────────── Agenda ─────────────────────────────── */

interface AgendaRow {
  id: string;
  item_date: string;
  start_time: string;
  end_time: string | null;
  title: string;
  location: string | null;
  kind: string;
  meeting_id: string | null;
}

const AGENDA_KINDS: { id: string; label: string }[] = [
  { id: "meeting", label: "Möte" },
  { id: "travel", label: "Resa" },
  { id: "break", label: "Paus / lunch" },
  { id: "exploration", label: "Fri vandring" },
  { id: "followup", label: "Uppföljning" },
  { id: "other", label: "Övrigt" },
];

const KIND_TONE: Record<string, string> = {
  meeting: "border-l-primary",
  travel: "border-l-sky-500",
  break: "border-l-muted-foreground/40",
  exploration: "border-l-amber-500",
  followup: "border-l-emerald-500",
  other: "border-l-border",
};

export function AgendaTab({ event, writable }: { event: ResolvedEvent; writable: boolean }) {
  const api = useEventRows<AgendaRow>(TRADEFAIR_TABLES.agenda, event, writable, [
    { column: "item_date" },
    { column: "start_time" },
  ]);
  const meetings = useEventRows<MeetingRow>(TRADEFAIR_TABLES.meetings, event, writable, [
    { column: "meeting_date" },
    { column: "start_time" },
  ]);
  const [view, setView] = useState<"timeline" | "list">("timeline");
  const [draft, setDraft] = useState({
    item_date: event.startDate ?? "",
    start_time: "",
    title: "",
    location: "",
    kind: "other",
  });

  /** Grupperar per dag så att en flerdagarsmässa inte blir en enda lång kolumn. */
  const byDay = useMemo(() => {
    const map = new Map<string, AgendaRow[]>();
    for (const row of api.rows) {
      const list = map.get(row.item_date) ?? [];
      list.push(row);
      map.set(row.item_date, list);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [api.rows]);

  /** Möten som inte redan står i agendan — importeras med ett klick. */
  const unscheduled = meetings.rows.filter(
    (m) => m.meeting_date && m.start_time && !api.rows.some((a) => a.meeting_id === m.id),
  );

  const submit = async () => {
    if (!draft.title.trim() || !draft.item_date || !draft.start_time) return;
    await api.add({
      item_date: draft.item_date,
      start_time: draft.start_time,
      title: draft.title.trim(),
      location: draft.location.trim() || null,
      kind: draft.kind,
    });
    setDraft((d) => ({ ...d, title: "", location: "", start_time: "" }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1 rounded-md border p-0.5">
          {(["timeline", "list"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={cn(
                "inline-flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors",
                view === v ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {v === "timeline" ? <Clock className="h-3.5 w-3.5" /> : <List className="h-3.5 w-3.5" />}
              {v === "timeline" ? "Tidslinje" : "Lista"}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{api.rows.length} punkter</p>
      </div>

      {writable && unscheduled.length > 0 && (
        <div className="rounded-lg border border-dashed p-3">
          <div className="text-xs font-medium">Planerade möten som inte står i agendan</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {unscheduled.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() =>
                  void api.add({
                    item_date: m.meeting_date,
                    start_time: m.start_time,
                    title: m.contact_name || "Leverantörsmöte",
                    location: m.booth ? `Monter ${m.booth}` : null,
                    kind: "meeting",
                    meeting_id: m.id,
                  })
                }
                className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs hover:border-foreground/40"
              >
                <Plus className="h-3 w-3" />
                {m.start_time?.slice(0, 5)} {m.contact_name || "Möte"}
              </button>
            ))}
          </div>
        </div>
      )}

      {writable && (
        <div className="grid items-end gap-2 rounded-lg border bg-muted/30 p-3 sm:grid-cols-6">
          <div className="space-y-1">
            <Label className="text-xs">Datum</Label>
            <Input
              type="date"
              value={draft.item_date}
              min={event.startDate ?? undefined}
              max={event.endDate ?? undefined}
              onChange={(e) => setDraft((d) => ({ ...d, item_date: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Tid</Label>
            <Input
              type="time"
              value={draft.start_time}
              onChange={(e) => setDraft((d) => ({ ...d, start_time: e.target.value }))}
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label className="text-xs">Punkt</Label>
            <Input
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              placeholder="Ankomst, lunch, fri vandring…"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Typ</Label>
            <Select value={draft.kind} onValueChange={(v) => setDraft((d) => ({ ...d, kind: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AGENDA_KINDS.map((k) => (
                  <SelectItem key={k.id} value={k.id}>
                    {k.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => void submit()} disabled={!draft.title.trim() || !draft.item_date || !draft.start_time}>
            Lägg till
          </Button>
        </div>
      )}

      {api.loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : byDay.length === 0 ? (
        <EmptyState>Ingen agenda skapad ännu.</EmptyState>
      ) : (
        byDay.map(([day, items]) => (
          <div key={day} className="space-y-2">
            <h4 className="text-sm font-medium">{day}</h4>
            <div className={view === "timeline" ? "space-y-1" : "divide-y rounded-lg border"}>
              {items.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm",
                    view === "timeline" && cn("rounded-r-lg border-l-4 bg-card", KIND_TONE[item.kind] ?? KIND_TONE.other),
                  )}
                >
                  <span className="w-12 shrink-0 tabular-nums text-muted-foreground">
                    {item.start_time.slice(0, 5)}
                  </span>
                  <span className="flex-1">
                    {item.title}
                    {item.location && <span className="ml-2 text-xs text-muted-foreground">{item.location}</span>}
                  </span>
                  {writable && (
                    <Button variant="ghost" size="sm" onClick={() => void api.remove(item.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <p className="text-xs text-muted-foreground">
        Kalenderexport till Google Calendar och Outlook är förberedd i schemat
        (<code className="rounded bg-muted px-1 py-0.5">calendar_provider</code>,{" "}
        <code className="rounded bg-muted px-1 py-0.5">calendar_event_id</code>) men inte byggd —
        se fas 3 i docs/TRADE_FAIR_MODULE.md.
      </p>
    </div>
  );
}

/* ─────────────────────────── Purchasing Wishlist ─────────────────────────── */

interface WishlistRow {
  id: string;
  title: string;
  category: string | null;
  supplier_id: string | null;
  priority: WishlistPriority;
  target_price: number | null;
  target_margin: number | null;
  notes: string | null;
}

export function WishlistTab({
  event,
  writable,
  suppliers,
}: {
  event: ResolvedEvent;
  writable: boolean;
  suppliers: SupplierOption[];
}) {
  const api = useEventRows<WishlistRow>(TRADEFAIR_TABLES.wishlist, event, writable, [{ column: "priority" }]);
  const [title, setTitle] = useState("");

  const supplierById = useMemo(() => new Map(suppliers.map((s) => [s.id, s])), [suppliers]);
  const missing = WISHLIST_SUGGESTIONS.filter(
    (s) => !api.rows.some((r) => r.title.toLowerCase() === s.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Vad vi behöver sourca. Listan är det inköparen går igenom monter för monter — och det som
        gör rapporten efteråt mätbar.
      </p>

      {writable && (
        <>
          <div className="flex flex-wrap items-end gap-2 rounded-lg border bg-muted/30 p-3">
            <div className="min-w-[16rem] flex-1 space-y-1">
              <Label className="text-xs">Lägg till behov</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && title.trim()) {
                    void api.add({ title: title.trim(), priority: "should-source" });
                    setTitle("");
                  }
                }}
                placeholder="t.ex. Enterprise LiDAR under 3 kg"
              />
            </div>
            <Button
              disabled={!title.trim()}
              className="gap-2"
              onClick={() => {
                void api.add({ title: title.trim(), priority: "should-source" });
                setTitle("");
              }}
            >
              <Plus className="h-4 w-4" />
              Lägg till
            </Button>
          </div>

          {missing.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {missing.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void api.add({ title: s, priority: "should-source" })}
                  className="inline-flex items-center gap-1 rounded-full border border-dashed px-2 py-0.5 text-xs text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                >
                  <Plus className="h-3 w-3" />
                  {s}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {api.loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : api.rows.length === 0 ? (
        <EmptyState>Ingen inköpslista skapad för mässan ännu.</EmptyState>
      ) : (
        <div className="space-y-2">
          {api.rows.map((row) => (
            <div key={row.id} className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
              <div className="min-w-[12rem] flex-1">
                <div className="text-sm font-medium">{row.title}</div>
                {row.supplier_id && (
                  <div className="text-xs text-muted-foreground">
                    {supplierById.get(row.supplier_id)?.name ?? "Kopplad leverantör"}
                  </div>
                )}
              </div>

              {writable ? (
                <>
                  <Select value={row.priority} onValueChange={(v) => void api.patch(row.id, { priority: v })}>
                    <SelectTrigger className="h-8 w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(WISHLIST_PRIORITY_LABEL).map(([id, label]) => (
                        <SelectItem key={id} value={id}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-1">
                    <Label className="text-[11px] text-muted-foreground">Målpris</Label>
                    <Input
                      type="number"
                      defaultValue={row.target_price ?? ""}
                      className="h-8 w-24"
                      onBlur={(e) => {
                        const value = e.target.value === "" ? null : Number(e.target.value);
                        if (value !== row.target_price) void api.patch(row.id, { target_price: value });
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Label className="text-[11px] text-muted-foreground">Marginal %</Label>
                    <Input
                      type="number"
                      defaultValue={row.target_margin ?? ""}
                      className="h-8 w-20"
                      onBlur={(e) => {
                        const value = e.target.value === "" ? null : Number(e.target.value);
                        if (value !== row.target_margin) void api.patch(row.id, { target_margin: value });
                      }}
                    />
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => void api.remove(row.id)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </>
              ) : (
                <div className="text-xs text-muted-foreground">
                  {WISHLIST_PRIORITY_LABEL[row.priority]}
                  {row.target_price !== null && (
                    <>
                      {" · målpris "}
                      <EUR amount={row.target_price} />
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
