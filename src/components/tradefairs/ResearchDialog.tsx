// Granskningssteget mellan AI-researchen och katalogen.
//
// Inget sparas av sig självt. Inköparen ser vad modellen hittade, vad guarden
// kastade och vilken källa som påstås — och trycker själv på spara. Det är
// avsikten med hela flödet: AI:n får leta, människan får godkänna.

import { useState } from "react";
import { AlertTriangle, ExternalLink, Loader2, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { EDP_SHOP_ID } from "@/lib/edpShop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  guardResearchResponse,
  researchErrorText,
  toEventRow,
  type ResearchedEvent,
} from "@/lib/tradeFairResearch";
import { TRADEFAIR_TABLES, type ResolvedEvent } from "@/lib/tradeFairDb";
import { EmptyState } from "./TradeFairBits";

type Mode = { action: "discover"; known: string[] } | { action: "research"; event: ResolvedEvent };


export default function ResearchDialog({
  mode,
  writable,
  onSaved,
}: {
  mode: Mode;
  /** Utan mässtabellerna går det att leta, men inte att spara fyndet. */
  writable: boolean;
  onSaved?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ResearchedEvent[] | null>(null);
  const [savingSlug, setSavingSlug] = useState<string | null>(null);

  const isDiscover = mode.action === "discover";

  const run = async () => {
    setRunning(true);
    setResults(null);
    try {
      const body = isDiscover
        ? { action: "discover", shop_id: EDP_SHOP_ID, query: query.trim() || undefined, known: mode.known }
        : {
            action: "research",
            shop_id: EDP_SHOP_ID,
            event: {
              name: mode.event.name,
              country: mode.event.country,
              city: mode.event.city,
              website: mode.event.website,
              startDate: mode.event.startDate,
            },
          };

      const { data, error } = await supabase.functions.invoke("tradefair-research", { body });
      if (error) throw error;

      const guarded = guardResearchResponse(data);
      setResults(guarded);
      if (guarded.length === 0) toast.info("Researchen gav inget som gick att granska.");
    } catch (err) {
      toast.error(researchErrorText(err));
    } finally {
      setRunning(false);
    }
  };

  const save = async (event: ResearchedEvent) => {
    setSavingSlug(event.name);
    try {
      const { error } = await supabase
        .from(TRADEFAIR_TABLES.events)
        .upsert(toEventRow(event, EDP_SHOP_ID), { onConflict: "shop_id,slug" });
      if (error) throw error;
      toast.success(`${event.name} sparad som kandidat att granska.`);
      onSaved?.();
    } catch (err) {
      toast.error((err as { message?: string }).message ?? "Kunde inte spara.");
    } finally {
      setSavingSlug(null);
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" className="gap-2" onClick={() => setOpen(true)}>
        <Sparkles className="h-3.5 w-3.5" />
        {isDiscover ? "AI Discover Events" : "AI Research Event"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isDiscover ? "Hitta nya mässor" : `Researcha ${mode.event.name}`}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {isDiscover && (
              <div className="space-y-1">
                <Label htmlFor="research-query" className="text-xs">
                  Vad ska letas efter?
                </Label>
                <Input
                  id="research-query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Europeiska mässor 2027 för enterprise-drönare, LiDAR och payloads"
                />
              </div>
            )}

            <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="leading-snug">
                Ingenting sparas automatiskt. Fynd läggs in som kandidater med prioritet C och
                status «Behöver kontrolleras», och datum tas bara med när researchen anger dem som
                bekräftade. Stäm alltid av mot arrangörens egen sida innan något får stå som
                verifierat.
              </p>
            </div>

            <Button onClick={() => void run()} disabled={running} className="gap-2">
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {running ? "Söker…" : "Kör research"}
            </Button>

            {results !== null &&
              (results.length === 0 ? (
                <EmptyState>Researchen gav inget som gick att granska.</EmptyState>
              ) : (
                <div className="space-y-3">
                  {results.map((event) => (
                    <ResultCard
                      key={event.name}
                      event={event}
                      writable={writable}
                      saving={savingSlug === event.name}
                      onSave={() => void save(event)}
                    />
                  ))}
                </div>
              ))}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Stäng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ResultCard({
  event,
  writable,
  saving,
  onSave,
}: {
  event: ResearchedEvent;
  writable: boolean;
  saving: boolean;
  onSave: () => void;
}) {
  return (
    <div className="space-y-2 rounded-lg border p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="font-medium">{event.name}</div>
          <div className="text-xs text-muted-foreground">
            {[event.city, event.country, event.venue].filter(Boolean).join(", ") || "Plats okänd"}
            {" · "}
            {event.startDate ? `${event.startDate} – ${event.endDate ?? event.startDate}` : "Datum TBC"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm tabular-nums text-muted-foreground">
            {event.estimatedRelevance}/100
          </span>
          {writable && (
            <Button size="sm" variant="outline" className="gap-1" disabled={saving} onClick={onSave}>
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Spara
            </Button>
          )}
        </div>
      </div>

      {event.whyRelevant && <p className="text-xs text-muted-foreground">{event.whyRelevant}</p>}

      {event.topics.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {event.topics.map((t) => (
            <span key={t} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {t}
            </span>
          ))}
        </div>
      )}

      {event.relevantExhibitors.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Uppgivna utställare: {event.relevantExhibitors.join(", ")}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
        {event.website && (
          <a
            href={event.website}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            Webbplats
          </a>
        )}
        {event.source && <span>Källa: {event.source}</span>}
      </div>

      {event.dropped.length > 0 && (
        <div className="rounded border border-dashed p-2 text-[11px] text-muted-foreground">
          <span className="font-medium">Kastat av granskningen:</span> {event.dropped.join("; ")}.
        </div>
      )}
    </div>
  );
}
