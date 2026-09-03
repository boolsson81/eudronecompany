// Exhibitor Intelligence: vilka leverantörer finns på mässan, vilka måste vi
// träffa, och vilka av dem har vi redan i leverantörsregistret.

import { useMemo, useState } from "react";
import { ExternalLink, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  EXHIBITOR_FILTERS,
  EXHIBITOR_PRIORITIES,
  type ExhibitorPriority,
} from "@/data/tradeFairTaxonomy";
import { TRADEFAIR_TABLES, type ResolvedEvent, type SupplierOption } from "@/lib/tradeFairDb";
import { useEventRows } from "./useEventRows";
import { EmptyState, ExhibitorPriorityBadge } from "./TradeFairBits";

interface ExhibitorRow {
  id: string;
  name: string;
  booth: string | null;
  hall: string | null;
  priority: ExhibitorPriority;
  tags: string[] | null;
  supplier_id: string | null;
  website: string | null;
  notes: string | null;
}

export default function ExhibitorsTab({
  event,
  writable,
  suppliers,
}: {
  event: ResolvedEvent;
  writable: boolean;
  suppliers: SupplierOption[];
}) {
  const api = useEventRows<ExhibitorRow>(TRADEFAIR_TABLES.exhibitors, event, writable, [
    { column: "priority" },
    { column: "name" },
  ]);
  const [filter, setFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [draftName, setDraftName] = useState("");
  const [draftTags, setDraftTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const supplierById = useMemo(() => new Map(suppliers.map((s) => [s.id, s])), [suppliers]);

  const visible = useMemo(
    () =>
      api.rows.filter((row) => {
        if (priorityFilter !== "all" && row.priority !== priorityFilter) return false;
        if (filter !== "all" && !(row.tags ?? []).includes(filter)) return false;
        return true;
      }),
    [api.rows, filter, priorityFilter],
  );

  const submit = async () => {
    const name = draftName.trim();
    if (!name) return;
    setSaving(true);
    await api.add({ name, tags: draftTags, priority: "research" });
    setDraftName("");
    setDraftTags([]);
    setSaving(false);
  };

  /** Katalogens kandidater — läggs till med ett klick i stället för att skrivas av. */
  const suggestions = event.knownExhibitors.filter(
    (candidate) => !api.rows.some((row) => row.name.toLowerCase() === candidate.name.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Filtrera på område</Label>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="h-9 w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla områden</SelectItem>
              {EXHIBITOR_FILTERS.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Prioritet</Label>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="h-9 w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla prioriteter</SelectItem>
              {EXHIBITOR_PRIORITIES.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="ml-auto text-xs text-muted-foreground">
          {visible.length} av {api.rows.length} utställare
        </div>
      </div>

      {writable && (
        <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-[16rem] flex-1 space-y-1">
              <Label htmlFor="exh-name" className="text-xs">
                Lägg till utställare
              </Label>
              <Input
                id="exh-name"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void submit();
                }}
                placeholder="t.ex. YellowScan"
              />
            </div>
            <Button onClick={() => void submit()} disabled={!draftName.trim() || saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Lägg till
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {EXHIBITOR_FILTERS.map((tag) => {
              const active = draftTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() =>
                    setDraftTags((prev) => (active ? prev.filter((t) => t !== tag) : [...prev, tag]))
                  }
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-xs transition-colors",
                    active ? "border-primary bg-primary/10 text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {writable && suggestions.length > 0 && (
        <div className="rounded-lg border border-dashed p-3">
          <div className="text-xs font-medium">Kandidater ur katalogen</div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Ostämda mot den officiella utställarkatalogen — bekräfta innan möten bokas.
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {suggestions.map((candidate) => (
              <button
                key={candidate.name}
                type="button"
                title={candidate.note}
                onClick={() =>
                  void api.add({ name: candidate.name, tags: candidate.tags, priority: "research", notes: candidate.note })
                }
                className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs hover:border-foreground/40"
              >
                <Plus className="h-3 w-3" />
                {candidate.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {api.loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : visible.length === 0 ? (
        <EmptyState>
          {api.rows.length === 0
            ? "Inga utställare registrerade för mässan ännu."
            : "Ingen utställare matchar filtret."}
        </EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utställare</TableHead>
                <TableHead>Område</TableHead>
                <TableHead>Monter</TableHead>
                <TableHead>Prioritet</TableHead>
                <TableHead>Leverantör</TableHead>
                {writable && <TableHead className="w-10" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="font-medium">{row.name}</div>
                    {row.notes && <div className="text-xs text-muted-foreground">{row.notes}</div>}
                    {row.website && (
                      <a
                        href={row.website}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Webbplats
                      </a>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(row.tags ?? []).map((t) => (
                        <span key={t} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {t}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm">
                    {writable ? (
                      <div className="flex gap-1">
                        <Input
                          defaultValue={row.hall ?? ""}
                          placeholder="Hall"
                          className="h-8 w-16"
                          onBlur={(e) => {
                            const value = e.target.value.trim() || null;
                            if (value !== (row.hall ?? null)) void api.patch(row.id, { hall: value });
                          }}
                        />
                        <Input
                          defaultValue={row.booth ?? ""}
                          placeholder="Monter"
                          className="h-8 w-20"
                          onBlur={(e) => {
                            const value = e.target.value.trim() || null;
                            if (value !== (row.booth ?? null)) void api.patch(row.id, { booth: value });
                          }}
                        />
                      </div>
                    ) : (
                      [row.hall, row.booth].filter(Boolean).join(" · ") || "–"
                    )}
                  </TableCell>
                  <TableCell>
                    {writable ? (
                      <Select
                        value={row.priority}
                        onValueChange={(v) => void api.patch(row.id, { priority: v })}
                      >
                        <SelectTrigger className="h-8 w-[170px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {EXHIBITOR_PRIORITIES.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <ExhibitorPriorityBadge priority={row.priority} />
                    )}
                  </TableCell>
                  <TableCell>
                    {writable ? (
                      <Select
                        value={row.supplier_id ?? "none"}
                        onValueChange={(v) => void api.patch(row.id, { supplier_id: v === "none" ? null : v })}
                      >
                        <SelectTrigger className="h-8 w-[190px]">
                          <SelectValue placeholder="Ej kopplad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Ej kopplad — ny leverantör</SelectItem>
                          {suppliers.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {row.supplier_id ? (supplierById.get(row.supplier_id)?.name ?? "Kopplad") : "Ny leverantör"}
                      </span>
                    )}
                  </TableCell>
                  {writable && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          void api.remove(row.id);
                          toast.success(`${row.name} borttagen`);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
