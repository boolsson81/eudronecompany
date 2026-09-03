// Delad laddnings-/skrivlogik för eventets barnrader. Alla flikar i
// eventprofilen ser likadana ut mot databasen: hämta, lägg till, ändra, ta bort,
// och gör ingenting alls om tabellerna inte finns.

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  deleteRow,
  ensureEventRow,
  insertRow,
  isMissingTable,
  listForEvent,
  updateRow,
  type ResolvedEvent,
  type TradeFairTable,
} from "@/lib/tradeFairDb";

export interface EventRowsApi<T> {
  rows: T[];
  loading: boolean;
  /** false när tabellerna saknas — flikarna visar då läsläge. */
  writable: boolean;
  add: (values: Record<string, unknown>) => Promise<void>;
  patch: (id: string, values: Record<string, unknown>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  reload: () => void;
}

export function useEventRows<T extends { id: string }>(
  table: TradeFairTable,
  event: ResolvedEvent,
  writable: boolean,
  orderBy?: { column: string; ascending?: boolean }[],
): EventRowsApi<T> {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventId, setEventId] = useState<string | null>(event.eventId);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    setEventId(event.eventId);
  }, [event.eventId]);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      setLoading(true);
      try {
        const data = await listForEvent<T>(table, eventId, orderBy);
        if (mounted) setRows(data);
      } catch (error) {
        if (!isMissingTable(error)) toast.error(errorText(error));
        if (mounted) setRows([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // orderBy skickas som literal per anropsplats; jämförs därför på innehåll.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, eventId, nonce, JSON.stringify(orderBy)]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  /** Eventet skrivs in i databasen först när något faktiskt sparas på det. */
  const resolveEventId = useCallback(async () => {
    if (eventId) return eventId;
    const id = await ensureEventRow(event);
    setEventId(id);
    return id;
  }, [event, eventId]);

  const add = useCallback(
    async (values: Record<string, unknown>) => {
      try {
        const id = await resolveEventId();
        await insertRow(table, { event_id: id, ...values });
        reload();
      } catch (error) {
        toast.error(errorText(error));
      }
    },
    [table, resolveEventId, reload],
  );

  const patch = useCallback(
    async (id: string, values: Record<string, unknown>) => {
      // Optimistiskt: raden är redan ritad, och en statusändring ska inte blinka.
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...values } : r)));
      try {
        await updateRow(table, id, values);
      } catch (error) {
        toast.error(errorText(error));
        reload();
      }
    },
    [table, reload],
  );

  const remove = useCallback(
    async (id: string) => {
      setRows((prev) => prev.filter((r) => r.id !== id));
      try {
        await deleteRow(table, id);
      } catch (error) {
        toast.error(errorText(error));
        reload();
      }
    },
    [table, reload],
  );

  return { rows, loading, writable, add, patch, remove, reload };
}

export function errorText(error: unknown): string {
  const message = (error as { message?: string } | null)?.message;
  return message ? `Kunde inte spara: ${message}` : "Kunde inte spara.";
}
