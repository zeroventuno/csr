-- ============================================================
--  Centro Sportivo Roero — Disponibilità raias (vasche)
--  Esegui nel SQL Editor di Supabase DOPO schema.sql.
--  Modello: pools -> lanes -> checkins. Espirazione "a tempo di lettura"
--  (un checkin è attivo se status='ativo' AND expires_at > now()).
-- ============================================================

create table if not exists public.pools (
  id            uuid primary key default gen_random_uuid(),
  location_id   text not null references public.locations(id) on delete cascade,
  name          text not null,            -- "Externa" / "Interna"
  length_meters int  not null,            -- 50 / 25
  side          text,                     -- "A" / "B" / null
  sort          int  not null default 0
);

create table if not exists public.lanes (
  id            uuid primary key default gen_random_uuid(),
  pool_id       uuid not null references public.pools(id) on delete cascade,
  lane_number   int  not null,
  pace          text not null,            -- "lenta" / "media" / "rapida"
  max_capacity  int  not null default 5
);

create table if not exists public.checkins (
  id             uuid primary key default gen_random_uuid(),
  lane_id        uuid not null references public.lanes(id) on delete cascade,
  checked_in_at  timestamptz not null default now(),
  checked_out_at timestamptz,
  expires_at     timestamptz not null default (now() + interval '1 hour'),
  status         text not null default 'ativo',  -- ativo / checkout_manual / expirado
  source         text not null default 'kiosk'   -- kiosk / admin
);

create index if not exists checkins_lane_active_idx
  on public.checkins (lane_id) where status = 'ativo';
create index if not exists checkins_expires_idx
  on public.checkins (expires_at) where status = 'ativo';

-- blocchi corsie (es. water polo): riservano corsie in una fascia oraria
create table if not exists public.lane_blocks (
  id          uuid primary key default gen_random_uuid(),
  location_id text not null references public.locations(id) on delete cascade,
  pool_id     uuid not null references public.pools(id) on delete cascade,
  lane_ids    uuid[] not null default '{}',
  block_date  date not null,
  start_time  time not null,
  end_time    time not null,
  title       text not null,
  note        text not null default '',
  news_slug   text not null default '',
  created_at  timestamptz not null default now()
);
create index if not exists lane_blocks_loc_date_idx
  on public.lane_blocks (location_id, block_date);

alter table public.pools       enable row level security;
alter table public.lanes       enable row level security;
alter table public.checkins    enable row level security;
alter table public.lane_blocks enable row level security;

-- ---------- SEED (sede Cuneo: 4 esterne + 8 interne A + 8 interne B = 20) ----------
-- idempotente: non duplica le vasche se eseguito più volte
insert into public.pools (location_id, name, length_meters, side, sort)
select v.location_id, v.name, v.length_meters, v.side, v.sort
from (values
  ('cuneo', 'Externa', 50, null::text, 1),
  ('cuneo', 'Interna', 25, 'A', 2),
  ('cuneo', 'Interna', 25, 'B', 3)
) as v(location_id, name, length_meters, side, sort)
where not exists (
  select 1 from public.pools p
  where p.location_id = v.location_id and p.name = v.name
    and p.side is not distinct from v.side
);

-- Esterna 50m — 4 corsie
insert into public.lanes (pool_id, lane_number, pace, max_capacity)
select p.id, v.n, v.pace, 5
from public.pools p,
  (values (1,'lenta'),(2,'media'),(3,'media'),(4,'rapida')) as v(n, pace)
where p.location_id='cuneo' and p.name='Externa' and p.side is null
  and not exists (select 1 from public.lanes l where l.pool_id = p.id);

-- Interna Lato A — 8 corsie
insert into public.lanes (pool_id, lane_number, pace, max_capacity)
select p.id, v.n, v.pace, 5
from public.pools p,
  (values (1,'lenta'),(2,'lenta'),(3,'media'),(4,'media'),(5,'media'),(6,'media'),(7,'rapida'),(8,'rapida')) as v(n, pace)
where p.location_id='cuneo' and p.name='Interna' and p.side='A'
  and not exists (select 1 from public.lanes l where l.pool_id = p.id);

-- Interna Lato B — 8 corsie
insert into public.lanes (pool_id, lane_number, pace, max_capacity)
select p.id, v.n, v.pace, 5
from public.pools p,
  (values (1,'lenta'),(2,'lenta'),(3,'media'),(4,'media'),(5,'media'),(6,'media'),(7,'rapida'),(8,'rapida')) as v(n, pace)
where p.location_id='cuneo' and p.name='Interna' and p.side='B'
  and not exists (select 1 from public.lanes l where l.pool_id = p.id);

-- Fine.
