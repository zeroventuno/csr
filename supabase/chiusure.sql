-- ============================================================
--  Centro Sportivo Roero — Chiusure (periodi di chiusura)
--  Esegui nel SQL Editor di Supabase DOPO schema.sql e vasche.sql.
--
--  A differenza di lane_blocks (blocco di singole corsie in una
--  fascia oraria di UN giorno), una "chiusura" copre un intervallo
--  di giorni interi: manutenzione, svuotamento vasca, ferie…
--
--  pool_id = NULL  ->  è chiusa TUTTA la sede
--  pool_id valorizzato -> è chiusa solo quella vasca
--
--  Lo script è idempotente: può essere rieseguito senza effetti
--  collaterali. NON inserisce dati di esempio: il sito è in
--  produzione e una chiusura finta ingannerebbe i visitatori.
-- ============================================================

create table if not exists public.closures (
  id          uuid primary key default gen_random_uuid(),
  location_id text not null references public.locations(id) on delete cascade,
  pool_id     uuid references public.pools(id) on delete cascade, -- null = tutta la sede
  date_from   date not null,
  date_to     date not null,          -- inclusiva
  title       text not null,          -- es. "Manutenzione programmata"
  note        text not null default '',
  published   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- colonne aggiunte in modo difensivo (se la tabella esistesse già parziale)
alter table public.closures add column if not exists location_id text;
alter table public.closures add column if not exists pool_id     uuid;
alter table public.closures add column if not exists date_from   date;
alter table public.closures add column if not exists date_to     date;
alter table public.closures add column if not exists title       text;
alter table public.closures add column if not exists note        text not null default '';
alter table public.closures add column if not exists published   boolean not null default true;
alter table public.closures add column if not exists created_at  timestamptz not null default now();

create index if not exists closures_loc_range_idx
  on public.closures (location_id, date_from, date_to);
create index if not exists closures_pool_idx
  on public.closures (pool_id) where pool_id is not null;

-- Solo service-role (come tutte le altre tabelle del progetto): RLS attiva
-- e nessuna policy, quindi le chiavi anon non vedono nulla.
alter table public.closures enable row level security;

-- Fine.
