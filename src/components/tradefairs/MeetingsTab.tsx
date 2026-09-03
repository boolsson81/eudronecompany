// Meeting Planner. Ett möte är ett inköpstillfälle, inte en kalenderpost — därför
// är mötesmålen (återförsäljaravtal, MOQ, marginal, reservdelar …) obligatoriska
// att välja bland och syns i listan.

import { useMemo, useState } from "react";
import { CalendarPlus, Loader2, Plus, Trash2 } from "lucide-react";
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
import { cn } from "@/lib/utils";
import {
  MEETING_OBJECTIVES,
  MEETING_STATUSES,
  MEETING_TYPE_LABEL,
  type MeetingStatus,
} from "@/data/tradeFairTaxonomy";
import { TRADEFAIR_TABLES, type ResolvedEvent, type SupplierOption } from "@/lib/tradeFairDb";
import { useEventRows } from "./useEventRows";
import { EmptyState, MeetingStatusBadge } from "./TradeFairBits";

export interface MeetingRow {
  id: string;
  supplier_id: string | null;
  contact_name: string | null;
  contact_email: string | null;
  meeting_date: string | null;
  start_time: string | null;
  booth: string | null;
  hall: string | null;
  meeting_type: string | null;
  objectives: string[] | null;
  status: MeetingStatus;
  notes: string | null;
}

const EMPTY_DRAFT = {
  supplier_id: "none",
  contact_name: "",
  meeting_date: "",
  start_time: "",
  booth: "",
  meeting_type: "booth",
  objectives: [] as string[],
  notes: "",
};

export default function MeetingsTab({
  event,
  writable,
  suppliers,
}: {
  event: ResolvedEvent;
  writable: boolean;
  suppliers: SupplierOption[];
}) {
  const api = useEventRows<MeetingRow>(TRADEFAIR_TABLES.meetings, event, writable, [
    { column: "meeting_date" },
    { column: "start_time" },
  ]);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const supplierById = useMemo(() => new Map(suppliers.map((s) => [s.id, s])), [suppliers]);

  const submit = async () => {
    if (!draft.contact_name.trim() && draft.supplier_id === "none") return;
    setSaving(true);
    await api.add({
      supplier_id: draft.supplier_id === "none" ? null : draft.supplier_id,
      contact_name: draft.contact_name.trim() || null,
      meeting_date: draft.meeting_date || event.startDate,
      start_time: draft.start_time || null,
      booth: draft.booth.trim() || null,
      meeting_type: draft.meeting_type,
      objectives: draft.objectives,
      notes: draft.notes.trim() || null,
      status: "requested",
    });
    setDraft(EMPTY_DRAFT);
    setOpen(false);
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {api.rows.length} möten · {api.rows.filter((m) => m.status === "confirmed").length} bekräftade
        </p>
        {writable && (
          <Button size="sm" className="gap-2" onClick={() => setOpen((v) => !v)}>
            <Plus className="h-4 w-4" />
            Planera möte
          </Button>
        )}
      </div>

      {writable && open && (
        <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <Label className="text-xs">Leverantör</Label>
              <Select value={draft.supplier_id} onValueChange={(v) => setDraft((d) => ({ ...d, supplier_id: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ny / okänd leverantör</SelectItem>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Kontakt</Label>
              <Input
                value={draft.contact_name}
                onChange={(e) => setDraft((d) => ({ ...d, contact_name: e.target.value }))}
                placeholder="Namn eller företag"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Datum</Label>
              <Input
                type="date"
                value={draft.meeting_date}
                min={event.startDate ?? undefined}
                max={event.endDate ?? undefined}
                onChange={(e) => setDraft((d) => ({ ...d, meeting_date: e.target.value }))}
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
            <div className="space-y-1">
              <Label className="text-xs">Monter / hall</Label>
              <Input
                value={draft.booth}
                onChange={(e) => setDraft((d) => ({ ...d, booth: e.target.value }))}
                placeholder="B5.221"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Mötestyp</Label>
              <Select value={draft.meeting_type} onValueChange={(v) => setDraft((d) => ({ ...d, meeting_type: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MEETING_TYPE_LABEL).map(([id, label]) => (
                    <SelectItem key={id} value={id}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Mål med mötet</Label>
            <div className="flex flex-wrap gap-1">
              {MEETING_OBJECTIVES.map((objective) => {
                const active = draft.objectives.includes(objective);
                return (
                  <button
                    key={objective}
                    type="button"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        objectives: active
                          ? d.objectives.filter((o) => o !== objective)
                          : [...d.objectives, objective],
                      }))
                    }
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-xs transition-colors",
                      active ? "border-primary bg-primary/10 text-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {objective}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Anteckningar</Label>
            <Textarea
              rows={2}
              value={draft.notes}
              onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
              placeholder="Vad vill vi ha svar på? Vilka volymer? Vilket pris?"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={() => void submit()} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarPlus className="h-4 w-4" />}
              Spara möte
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Avbryt
            </Button>
          </div>
        </div>
      )}

      {api.loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : api.rows.length === 0 ? (
        <EmptyState>Inga möten planerade för mässan ännu.</EmptyState>
      ) : (
        <div className="space-y-2">
          {api.rows.map((meeting) => (
            <div key={meeting.id} className="rounded-lg border p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="font-medium">
                    {meeting.supplier_id ? (supplierById.get(meeting.supplier_id)?.name ?? "Leverantör") : meeting.contact_name || "Möte"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {[
                      meeting.meeting_date,
                      meeting.start_time?.slice(0, 5),
                      meeting.booth ? `Monter ${meeting.booth}` : null,
                      meeting.meeting_type ? MEETING_TYPE_LABEL[meeting.meeting_type as keyof typeof MEETING_TYPE_LABEL] : null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "Tid ej satt"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {writable ? (
                    <Select value={meeting.status} onValueChange={(v) => void api.patch(meeting.id, { status: v })}>
                      <SelectTrigger className="h-8 w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MEETING_STATUSES.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <MeetingStatusBadge status={meeting.status} />
                  )}
                  {writable && (
                    <Button variant="ghost" size="sm" onClick={() => void api.remove(meeting.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              </div>
              {(meeting.objectives ?? []).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {(meeting.objectives ?? []).map((o) => (
                    <span key={o} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      {o}
                    </span>
                  ))}
                </div>
              )}
              {meeting.notes && <p className="mt-2 text-xs text-muted-foreground">{meeting.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
