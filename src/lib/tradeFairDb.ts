// @ts-nocheck -- Otypad Supabase-klient: de genererade typerna underhålls i digitalsignal-repot.
//
// Datalagret för Inköp → Mässor & Events.
//
// Två lager, med avsikt:
//   1. Katalogen i src/data/tradeFairEvents.ts är den granskade referensdatan.
//      Den finns alltid och gör att modulen är användbar direkt.
//   2. Tabellerna i docs/migrations/20260903220000_tradefair_events.sql håller
//      allt inköparen skriver. De körs från digitalsignal-repot (AGENTS.md), och
//      tills de finns svarar PostgREST 42P01. Då slås skrivning av i UI:t i
//      stället för att sidan kraschar — `useTradeFairBackend` exponerar det som
//      `available: false`.

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EDP_SHOP_ID } from "@/lib/edpShop";
import { resolveEvents, type EventOverride, type ResolvedEvent } from "@/lib/tradeFairCatalog";

export { resolveEvents };
export type { EventOverride, ResolvedEvent };

/** Tabellerna modulen äger. Ordningen speglar migreringen. */
export const TRADEFAIR_TABLES = {
  events: "tradefair_events",
  exhibitors: "tradefair_exhibitors",
  meetings: "tradefair_meetings",
  products: "tradefair_products",
  wishlist: "tradefair_wishlist_items",
  agenda: "tradefair_agenda_items",
  prep: "tradefair_prep",
  costs: "tradefair_costs",
  followups: "tradefair_followups",
  reports: "tradefair_reports",
} as const;

export type TradeFairTable = (typeof TRADEFAIR_TABLES)[keyof typeof TRADEFAIR_TABLES];

/** PostgREST-koden för "relation does not exist". */
const UNDEFINED_TABLE = "42P01";

export function isMissingTable(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code;
  const message = (error as { message?: string } | null)?.message ?? "";
  return code === UNDEFINED_TABLE || /does not exist/i.test(message);
}

/* ─────────────────────── Tillgänglighet ─────────────────────── */

type BackendState = { available: boolean | null; checking: boolean };

let cachedAvailability: boolean | null = null;

/**
 * Frågar en gång per sidladdning om tabellerna finns. Svaret cachas — det
 * ändras inte mitt i en session, och varje vy ska inte betala för en probe.
 */
export function useTradeFairBackend(): BackendState {
  const [available, setAvailable] = useState<boolean | null>(cachedAvailability);
  const [checking, setChecking] = useState(cachedAvailability === null);

  useEffect(() => {
    if (cachedAvailability !== null) return;
    let mounted = true;
    void (async () => {
      const { error } = await supabase.from(TRADEFAIR_TABLES.events).select("id").limit(1);
      const ok = !error || !isMissingTable(error);
      cachedAvailability = ok;
      if (mounted) {
        setAvailable(ok);
        setChecking(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return { available, checking };
}

/**
 * Hela mässlistan: katalogen, överlagrad med databasen där den finns.
 * Fungerar utan databas — då är varje `eventId` null och skrivning avstängd.
 */
export function useEvents(): {
  events: ResolvedEvent[];
  loading: boolean;
  backendAvailable: boolean | null;
  reload: () => void;
} {
  const { available, checking } = useTradeFairBackend();
  const [rows, setRows] = useState<EventOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (checking) return;
    let mounted = true;
    void (async () => {
      if (available === false) {
        if (mounted) {
          setRows([]);
          setLoading(false);
        }
        return;
      }
      const { data, error } = await supabase
        .from(TRADEFAIR_TABLES.events)
        .select("*")
        .eq("shop_id", EDP_SHOP_ID);
      if (!mounted) return;
      setRows(error ? [] : ((data ?? []) as EventOverride[]));
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [available, checking, nonce]);

  const events = useMemo(() => resolveEvents(rows), [rows]);
  const reload = useCallback(() => setNonce((n) => n + 1), []);

  return { events, loading: loading || checking, backendAvailable: available, reload };
}

/**
 * Ser till att eventet finns som rad i databasen och returnerar dess id.
 * Anropas första gången inköparen skriver något på ett katalogevent — poängen
 * är att katalogen inte ska behöva speglas in i förväg.
 */
export async function ensureEventRow(event: ResolvedEvent): Promise<string> {
  if (event.eventId) return event.eventId;

  const { data, error } = await supabase
    .from(TRADEFAIR_TABLES.events)
    .upsert(
      {
        shop_id: EDP_SHOP_ID,
        slug: event.slug,
        name: event.name,
        organizer: event.organizer || null,
        country: event.country || null,
        city: event.city || null,
        venue: event.venue || null,
        start_date: event.startDate,
        end_date: event.endDate,
        date_status: event.dateStatus,
        website: event.website || null,
        categories: event.categories,
        topics: event.topics,
        target_industries: event.targetIndustries,
        priority: event.priority,
        status: event.status,
        attendance_plan: event.attendancePlan,
        expected_exhibitors: event.expectedExhibitors,
        expected_visitors: event.expectedVisitors,
        why_relevant: event.whyRelevant || null,
        score: event.score,
        opportunity_score: event.opportunityScoreValue,
        source: event.source || null,
        verification: event.verification,
        last_researched: event.lastResearched || null,
        notes: event.notes || null,
      },
      { onConflict: "shop_id,slug" },
    )
    .select("id")
    .single();

  if (error) throw error;
  return (data as { id: string }).id;
}

export async function updateEvent(eventId: string, patch: Record<string, unknown>): Promise<void> {
  const { error } = await supabase.from(TRADEFAIR_TABLES.events).update(patch).eq("id", eventId);
  if (error) throw error;
}

/* ─────────────────────── Generiska barnrader ─────────────────────── */

/**
 * Hämtar barnrader för ett event. Returnerar tom lista när eventet inte har
 * någon rad i databasen ännu, eller när tabellerna saknas.
 */
export async function listForEvent<T = Record<string, unknown>>(
  table: TradeFairTable,
  eventId: string | null,
  orderBy?: { column: string; ascending?: boolean }[],
): Promise<T[]> {
  if (!eventId) return [];
  let query = supabase.from(table).select("*").eq("event_id", eventId);
  for (const o of orderBy ?? []) {
    query = query.order(o.column, { ascending: o.ascending ?? true, nullsFirst: false });
  }
  const { data, error } = await query;
  if (error) {
    if (isMissingTable(error)) return [];
    throw error;
  }
  return (data ?? []) as T[];
}

export async function insertRow<T = Record<string, unknown>>(
  table: TradeFairTable,
  values: Record<string, unknown>,
): Promise<T> {
  const { data, error } = await supabase
    .from(table)
    .insert({ shop_id: EDP_SHOP_ID, ...values })
    .select("*")
    .single();
  if (error) throw error;
  return data as T;
}

export async function updateRow(
  table: TradeFairTable,
  id: string,
  patch: Record<string, unknown>,
): Promise<void> {
  const { error } = await supabase.from(table).update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteRow(table: TradeFairTable, id: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
}

/** Upsert av en checklistpunkt. Unikt index på (event_id, item_id). */
export async function setPrepItem(eventId: string, itemId: string, done: boolean): Promise<void> {
  const { error } = await supabase.from(TRADEFAIR_TABLES.prep).upsert(
    {
      shop_id: EDP_SHOP_ID,
      event_id: eventId,
      item_id: itemId,
      done,
      done_at: done ? new Date().toISOString() : null,
    },
    { onConflict: "event_id,item_id" },
  );
  if (error) throw error;
}

/* ─────────────────────── Tvärsnitt för dashboarden ─────────────────────── */

export interface DashboardCounts {
  supplierMeetings: number;
  newSuppliers: number;
  openFollowUps: number;
}

/**
 * Räknar det som inte går att härleda ur katalogen. Faller tillbaka på nollor
 * när tabellerna saknas — KPI-korten visar då att siffran kräver databasen.
 */
export async function loadDashboardCounts(): Promise<DashboardCounts | null> {
  const count = async (table: TradeFairTable, apply: (q: any) => any) => {
    const { count: n, error } = await apply(
      supabase.from(table).select("id", { count: "exact", head: true }).eq("shop_id", EDP_SHOP_ID),
    );
    if (error) throw error;
    return n ?? 0;
  };

  try {
    const [supplierMeetings, newSuppliers, openFollowUps] = await Promise.all([
      count(TRADEFAIR_TABLES.meetings, (q) => q.in("status", ["requested", "confirmed", "rescheduled"])),
      count(TRADEFAIR_TABLES.exhibitors, (q) => q.is("supplier_id", null).neq("priority", "competitor")),
      count(TRADEFAIR_TABLES.followups, (q) => q.in("status", ["open", "in-progress"])),
    ]);
    return { supplierMeetings, newSuppliers, openFollowUps };
  } catch (error) {
    if (isMissingTable(error)) return null;
    throw error;
  }
}

/** Leverantörsregistret, för kopplingen utställare → supplier. */
export interface SupplierOption {
  id: string;
  name: string;
  code: string | null;
  website: string | null;
  is_active: boolean;
}

export async function loadSuppliers(): Promise<SupplierOption[]> {
  const { data, error } = await supabase
    .from("suppliers")
    .select("id, name, code, website, is_active")
    .eq("shop_id", EDP_SHOP_ID)
    .order("name");
  if (error) {
    if (isMissingTable(error)) return [];
    throw error;
  }
  return (data ?? []) as SupplierOption[];
}
