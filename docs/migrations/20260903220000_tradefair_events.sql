-- Inköp → Mässor & Events — normaliserat schema.
--
-- SPEGLING. DigitalSignal är källan: filen ligger som
-- boolsson81/digitalsignal:supabase/migrations/20260903220000_tradefair_events.sql
-- och körs därifrån med `supabase db push`, eftersom databasen delas (AGENTS.md).
-- Kopian finns här för att schemat ska gå att läsa bredvid koden som använder det.
-- Ändra i digitalsignal först, spegla hit sedan.
--
-- Så länge tabellerna saknas faller modulen tillbaka på katalogen i
-- src/data/tradeFairEvents.ts och visar en banner om att skrivning är avstängd.
--
-- Namngivning: prefixet `tradefair_` i stället för spec:ens `events`/`event_*`.
-- `events` är för generiskt i en delad databas med 1 200+ migreringar.
--
--   spec                | tabell
--   events              | tradefair_events
--   event_exhibitors    | tradefair_exhibitors
--   event_meetings      | tradefair_meetings
--   event_products      | tradefair_products
--   event_costs         | tradefair_costs
--   event_followups     | tradefair_followups
--   event_reports       | tradefair_reports
--   (tillägg)           | tradefair_wishlist_items, tradefair_agenda_items, tradefair_prep
--
-- Scoping: shop_id, precis som public.suppliers. RLS-policyn är kopierad därifrån
-- så att behörigheten blir densamma som för leverantörsregistret.

begin;

/* ─────────────────────────────── events ─────────────────────────────── */

create table if not exists public.tradefair_events (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  -- Matchar slug i src/data/tradeFairEvents.ts. Rader här kompletterar och
  -- åsidosätter katalogen; AI-upptäckta event får en ny slug.
  slug text not null,
  name text not null,
  organizer text,
  country text,
  city text,
  venue text,
  start_date date,
  end_date date,
  date_status text not null default 'tbc' check (date_status in ('confirmed', 'tbc')),
  website text,
  categories text[] not null default '{}',
  topics text[] not null default '{}',
  target_industries text[] not null default '{}',
  priority text not null default 'C' check (priority in ('A', 'B', 'C', 'D')),
  status text not null default 'unconfirmed'
    check (status in ('confirmed', 'unconfirmed', 'cancelled', 'past')),
  attendance_plan text not null default 'considering'
    check (attendance_plan in ('planned', 'considering', 'not-attending', 'attended')),
  expected_exhibitors integer,
  expected_visitors integer,
  why_relevant text,
  -- De åtta faktorerna ur SCORE_FACTORS, som {"supplierRelevance": 25, ...}.
  score jsonb not null default '{}'::jsonb,
  opportunity_score integer check (opportunity_score between 0 and 100),
  notes text,
  source text,
  verification text not null default 'unverified'
    check (verification in ('verified', 'unverified', 'needs-review')),
  verified_at timestamptz,
  last_researched date,
  -- Sätts av AI Discover/Research. Rådata sparas för granskning innan den blir sanning.
  research_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (shop_id, slug)
);

/* ────────────────────────────── exhibitors ────────────────────────────── */

create table if not exists public.tradefair_exhibitors (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  event_id uuid not null references public.tradefair_events(id) on delete cascade,
  -- Kopplingen till leverantörsregistret. null tills utställaren lagts upp där.
  supplier_id uuid references public.suppliers(id) on delete set null,
  -- Namnet som det står i utställarkatalogen, även när supplier_id är satt.
  name text not null,
  booth text,
  hall text,
  priority text not null default 'research'
    check (priority in ('must-meet', 'high-priority', 'interesting', 'existing-supplier', 'competitor', 'research')),
  -- Ur EXHIBITOR_FILTERS: UAV, LiDAR, Thermal, Mapping, Survey, Sensors,
  -- Components, Software, Service, Distributor, OEM.
  tags text[] not null default '{}',
  status text,
  website text,
  notes text,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tradefair_exhibitors_event_idx on public.tradefair_exhibitors (event_id);
create index if not exists tradefair_exhibitors_supplier_idx on public.tradefair_exhibitors (supplier_id);

/* ─────────────────────────────── meetings ─────────────────────────────── */

create table if not exists public.tradefair_meetings (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  event_id uuid not null references public.tradefair_events(id) on delete cascade,
  exhibitor_id uuid references public.tradefair_exhibitors(id) on delete set null,
  supplier_id uuid references public.suppliers(id) on delete set null,
  -- Fritext tills kontakten finns i CRM:et; contact_id fylls i när den gör det.
  contact_name text,
  contact_email text,
  contact_id uuid,
  meeting_date date,
  start_time time,
  end_time time,
  booth text,
  hall text,
  location text,
  meeting_type text
    check (meeting_type is null or meeting_type in ('booth', 'conference-room', 'dinner', 'demo', 'walk-up')),
  -- Flerval ur MEETING_OBJECTIVES.
  objectives text[] not null default '{}',
  status text not null default 'requested'
    check (status in ('requested', 'confirmed', 'rescheduled', 'completed', 'cancelled')),
  outcome text,
  notes text,
  -- Förberedd för kalenderexport (fas 3). Fylls när mötet synkats.
  calendar_provider text check (calendar_provider is null or calendar_provider in ('google', 'outlook')),
  calendar_event_id text,
  calendar_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tradefair_meetings_event_idx on public.tradefair_meetings (event_id, meeting_date, start_time);

/* ──────────────────────── produkter & inköpslista ──────────────────────── */

-- Produkter som upptäckts på mässan, kopplade till utställare och leverantör.
create table if not exists public.tradefair_products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  event_id uuid not null references public.tradefair_events(id) on delete cascade,
  exhibitor_id uuid references public.tradefair_exhibitors(id) on delete set null,
  supplier_id uuid references public.suppliers(id) on delete set null,
  meeting_id uuid references public.tradefair_meetings(id) on delete set null,
  -- Länk till butiksprodukten när den väl lagts upp.
  product_id uuid,
  name text not null,
  category text,
  -- Vad möjligheten är: sourcing, återförsäljaravtal, offert, prisjämförelse …
  opportunity text,
  quote_requested boolean not null default false,
  target_price numeric(12, 2),
  target_margin numeric(5, 2),
  currency text not null default 'EUR',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tradefair_products_event_idx on public.tradefair_products (event_id);

-- Purchasing Wishlist: vad vi ska leta efter *inför* mässan.
create table if not exists public.tradefair_wishlist_items (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  event_id uuid not null references public.tradefair_events(id) on delete cascade,
  title text not null,
  category text,
  supplier_id uuid references public.suppliers(id) on delete set null,
  product_id uuid,
  priority text not null default 'should-source'
    check (priority in ('must-source', 'should-source', 'nice-to-have')),
  target_price numeric(12, 2),
  target_margin numeric(5, 2),
  currency text not null default 'EUR',
  -- Sätts när något hittades som svarar mot behovet.
  fulfilled_by_product_id uuid references public.tradefair_products(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tradefair_wishlist_event_idx on public.tradefair_wishlist_items (event_id);

/* ─────────────────────────── agenda & förberedelse ─────────────────────────── */

-- My Event Plan: dagens tidslinje. Möten läggs in som rader med meeting_id satt,
-- resten (ankomst, lunch, fri vandring) som fristående rader.
create table if not exists public.tradefair_agenda_items (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  event_id uuid not null references public.tradefair_events(id) on delete cascade,
  meeting_id uuid references public.tradefair_meetings(id) on delete cascade,
  -- Vems agenda. null = delad.
  user_id uuid references auth.users(id) on delete cascade,
  item_date date not null,
  start_time time not null,
  end_time time,
  title text not null,
  location text,
  kind text not null default 'other'
    check (kind in ('meeting', 'travel', 'break', 'exploration', 'followup', 'other')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tradefair_agenda_event_idx on public.tradefair_agenda_items (event_id, item_date, start_time);

-- Before Event-checklistan. En rad per bockad punkt; id:t är PREP_CHECKLIST[].id.
create table if not exists public.tradefair_prep (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  event_id uuid not null references public.tradefair_events(id) on delete cascade,
  item_id text not null,
  done boolean not null default false,
  done_at timestamptz,
  done_by uuid references auth.users(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, item_id)
);

/* ──────────────────────────── kostnader & ROI ──────────────────────────── */

create table if not exists public.tradefair_costs (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  event_id uuid not null references public.tradefair_events(id) on delete cascade,
  cost_type text not null
    check (cost_type in ('ticket', 'travel', 'hotel', 'food', 'local-transport', 'other')),
  label text,
  estimated_cost numeric(12, 2),
  actual_cost numeric(12, 2),
  currency text not null default 'EUR',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tradefair_costs_event_idx on public.tradefair_costs (event_id);

/* ─────────────────────────────── uppföljning ─────────────────────────────── */

create table if not exists public.tradefair_followups (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  event_id uuid not null references public.tradefair_events(id) on delete cascade,
  exhibitor_id uuid references public.tradefair_exhibitors(id) on delete set null,
  supplier_id uuid references public.suppliers(id) on delete set null,
  meeting_id uuid references public.tradefair_meetings(id) on delete set null,
  contact_id uuid,
  contact_name text,
  title text not null,
  due_date date,
  status text not null default 'open' check (status in ('open', 'in-progress', 'done', 'dropped')),
  assigned_to uuid references auth.users(id) on delete set null,
  -- Vilket notifieringssteg som redan skickats (30/14/7/1 dagar).
  notified_offsets integer[] not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tradefair_followups_due_idx on public.tradefair_followups (shop_id, status, due_date);

/* ──────────────────────────────── rapport ──────────────────────────────── */

create table if not exists public.tradefair_reports (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  event_id uuid not null references public.tradefair_events(id) on delete cascade,
  summary text,
  opportunities text,
  results text,
  -- Utfall som räknas in i ROI: nya leverantörer, avtal, offerter, ordrar.
  new_suppliers integer not null default 0,
  new_reseller_agreements integer not null default 0,
  new_products integer not null default 0,
  quotes_requested integer not null default 0,
  orders_placed integer not null default 0,
  strategic_partnerships integer not null default 0,
  -- Uppskattat värde av utfallet, i samma valuta som kostnaderna.
  estimated_value numeric(12, 2),
  actual_value numeric(12, 2),
  currency text not null default 'EUR',
  roi_notes text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id)
);

/* ─────────────────────────────── RLS ─────────────────────────────── */

-- Samma villkor som public.suppliers: åtkomst för den vars profil hör till
-- samma tenant som butiken raden pekar på.
do $$
declare
  t text;
begin
  foreach t in array array[
    'tradefair_events',
    'tradefair_exhibitors',
    'tradefair_meetings',
    'tradefair_products',
    'tradefair_wishlist_items',
    'tradefair_agenda_items',
    'tradefair_prep',
    'tradefair_costs',
    'tradefair_followups',
    'tradefair_reports'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);

    execute format($f$
      create policy "Users can view %1$s for their shops"
        on public.%1$I for select
        using (exists (
          select 1 from public.shops s
          join public.profiles p on p.tenant_id = s.tenant_id
          where s.id = %1$I.shop_id and p.user_id = auth.uid()
        ))
    $f$, t);

    execute format($f$
      create policy "Users can insert %1$s for their shops"
        on public.%1$I for insert
        with check (exists (
          select 1 from public.shops s
          join public.profiles p on p.tenant_id = s.tenant_id
          where s.id = %1$I.shop_id and p.user_id = auth.uid()
        ))
    $f$, t);

    execute format($f$
      create policy "Users can update %1$s for their shops"
        on public.%1$I for update
        using (exists (
          select 1 from public.shops s
          join public.profiles p on p.tenant_id = s.tenant_id
          where s.id = %1$I.shop_id and p.user_id = auth.uid()
        ))
    $f$, t);

    execute format($f$
      create policy "Users can delete %1$s for their shops"
        on public.%1$I for delete
        using (exists (
          select 1 from public.shops s
          join public.profiles p on p.tenant_id = s.tenant_id
          where s.id = %1$I.shop_id and p.user_id = auth.uid()
        ))
    $f$, t);

    execute format(
      'create trigger update_%1$s_updated_at before update on public.%1$I
         for each row execute function public.update_updated_at_column()', t);
  end loop;
end
$$;

commit;
