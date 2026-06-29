-- ============================================================
--  Centro Sportivo Roero — Schema + dati iniziali (Supabase)
--  Esegui questo file nel SQL Editor del tuo progetto Supabase.
--  Modello multi-sede: news/courses/events hanno `location_ids text[]`
--  (vuoto = "tutte le sedi").
-- ============================================================

-- ---------- TABELLE ----------

create table if not exists public.locations (
  id          text primary key,
  name        text not null,
  address     text not null,
  hours       text not null,
  phone       text not null,
  pool        int  not null default 0,
  maps_embed  text,
  sort        int  not null default 0
);

create table if not exists public.news (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        text not null,
  category     text not null,
  location_ids text[] not null default '{}',
  excerpt      text default '',
  content      text default '',
  cover_image  text,
  icon         text not null default 'ph-newspaper',
  author       text not null default 'Redazione',
  published    boolean not null default true,
  date         date not null default current_date,
  created_at   timestamptz not null default now()
);

create table if not exists public.courses (
  id           uuid primary key default gen_random_uuid(),
  category_id  text not null,
  name         text not null,
  age          text default '',
  schedule     text default '',
  price        text default '',
  price_note   text default '',
  instructor   text default '',
  location_ids text[] not null default '{}',
  created_at   timestamptz not null default now()
);

create table if not exists public.events (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  date         date not null,
  time         text default '',
  location_ids text[] not null default '{}',
  description  text default '',
  image        text,
  created_at   timestamptz not null default now()
);

create table if not exists public.media (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  url          text not null,
  type         text not null default 'other',
  size         text default '',
  storage_path text,
  created_at   timestamptz not null default now()
);

-- ---------- RLS ----------
-- Abilitata senza policy: il client anonimo non vede nulla,
-- mentre la service role (usata solo lato server) bypassa la RLS.

alter table public.locations enable row level security;
alter table public.news      enable row level security;
alter table public.courses   enable row level security;
alter table public.events    enable row level security;
alter table public.media     enable row level security;

-- ---------- STORAGE ----------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- ============================================================
--  DATI INIZIALI
-- ============================================================

-- ---------- LOCATIONS ----------
insert into public.locations (id, name, address, hours, phone, pool, maps_embed, sort) values
  ('cuneo', 'Cuneo', $$Via dello Sport 12, Cuneo (CN)$$, $$Lun–Ven 6:30–22:00 · Sab 8:00–20:00 · Dom 9:00–13:00$$, '+39 0171 123 456', 78, $$https://www.google.com/maps?q=Via%20dello%20Sport%2012%2C%20Cuneo&output=embed$$, 1),
  ('alba', 'Alba', $$Corso Piave 45, Alba (CN)$$, $$Lun–Ven 7:00–22:00 · Sab 8:00–19:00 · Dom chiuso$$, '+39 0173 234 567', 62, $$https://www.google.com/maps?q=Corso%20Piave%2045%2C%20Alba%20CN&output=embed$$, 2),
  ('savigliano', 'Savigliano', $$Via Torino 88, Savigliano (CN)$$, $$Lun–Ven 6:30–21:30 · Sab 9:00–18:00 · Dom 9:00–12:00$$, '+39 0172 345 678', 45, $$https://www.google.com/maps?q=Via%20Torino%2088%2C%20Savigliano%20CN&output=embed$$, 3),
  ('sommariva', 'Sommariva Perno', $$Piazza Marconi 3, Sommariva Perno (CN)$$, $$Lun–Ven 8:00–21:00 · Sab 9:00–17:00 · Dom chiuso$$, '+39 0172 456 789', 30, $$https://www.google.com/maps?q=Piazza%20Marconi%203%2C%20Sommariva%20Perno%20CN&output=embed$$, 4),
  ('asti', 'Asti', $$Via Alfieri 21, Asti (AT)$$, $$Lun–Ven 7:00–22:00 · Sab 8:00–20:00 · Dom 9:00–13:00$$, '+39 0141 567 890', 90, $$https://www.google.com/maps?q=Via%20Alfieri%2021%2C%20Asti&output=embed$$, 5)
on conflict (id) do nothing;

-- ---------- NEWS  (location_ids vuoto = tutte le sedi) ----------
insert into public.news (slug, title, category, location_ids, excerpt, content, icon, author, published, date) values
  ('campionati-regionali-estivi-podio', $$Campionati Regionali Estivi: il Roero sale sul podio$$, 'Eventi', array['cuneo'], $$I nostri atleti conquistano 14 medaglie ai Regionali di categoria. Un weekend memorabile che premia mesi di lavoro in vasca.$$,
    $html$<p class="lead">Quattordici medaglie, tre titoli regionali e una squadra che cresce gara dopo gara: il bilancio dei Campionati Regionali Estivi premia mesi di lavoro in vasca.</p>
<p>Si sono conclusi nel weekend i Campionati Regionali Estivi di categoria, ospitati dalla piscina olimpionica di Torino. La rappresentativa del Centro Sportivo Roero ha schierato 22 atleti provenienti dalle cinque sedi, conquistando un bottino di tutto rispetto e confermando la crescita costante del settore agonistico.</p>
<h2>Un weekend da incorniciare</h2>
<p>Le gare hanno regalato emozioni fin dalle batterie del mattino. Particolarmente brillanti le prove nei 100 e 200 stile libero, dove i nostri portacolori hanno migliorato i primati personali in oltre venti occasioni.</p>
<ul>
<li>3 ori nei 100 rana e 200 misti categoria Ragazzi</li>
<li>5 argenti distribuiti tra dorso e stile libero</li>
<li>6 bronzi, con due staffette sul podio</li>
</ul>
<p>«È il risultato di un gruppo che lavora con serietà e passione» — ha commentato il direttore tecnico. «Questi ragazzi sono la dimostrazione che con costanza e divertimento si arriva lontano.»</p>
<h2>Ora lo sguardo all'autunno</h2>
<p>Archiviata la stagione estiva, il gruppo agonistico è già al lavoro per la preparazione invernale. Le iscrizioni ai corsi e alle selezioni per la squadra agonistica sono aperte in tutte le sedi.</p>$html$,
    'ph-trophy', 'Marta R.', true, '2026-06-24'),
  ('chiusura-estiva-piscina-alba', $$Chiusura estiva della piscina di Alba$$, 'Avvisi', array['alba'], $$La vasca resterà chiusa dal 4 al 18 agosto per manutenzione programmata.$$,
    $html$<p>La piscina di Alba resterà chiusa dal 4 al 18 agosto 2026 per gli interventi di manutenzione ordinaria programmata.</p><p>Maggiori dettagli saranno pubblicati a breve sui canali ufficiali del Centro Sportivo Roero.</p>$html$,
    'ph-megaphone', 'Luca D.', true, '2026-06-22'),
  ('iscrizioni-corsi-autunnali', $$Aperte le iscrizioni ai corsi autunnali$$, 'Corsi', '{}', $$Prenota ora: i gruppi si completano rapidamente in tutte le sedi.$$,
    $html$<p>Sono aperte le iscrizioni ai corsi autunnali in tutte le cinque sedi. I posti sono limitati e i gruppi si completano rapidamente.</p>$html$,
    'ph-graduation-cap', 'Sara F.', true, '2026-06-18'),
  ('open-day-acquaticita-savigliano', $$Open Day acquaticità per i più piccoli$$, 'Eventi', array['savigliano'], $$Sabato 5 luglio prova gratuita di mininuoto e babynuoto.$$,
    $html$<p>Sabato 5 luglio la sede di Savigliano ospita un Open Day dedicato ai più piccoli, con prove gratuite di mininuoto e babynuoto.</p>$html$,
    'ph-waves', 'Andrea R.', true, '2026-06-12'),
  ('nuovi-orari-nuoto-libero-asti', $$Nuovi orari di nuoto libero ad Asti$$, 'Comunicati', array['asti'], $$Da luglio fasce serali estese fino alle 22:30 nei giorni feriali.$$,
    $html$<p>Da luglio la sede di Asti estende le fasce serali di nuoto libero fino alle 22:30 nei giorni feriali.</p>$html$,
    'ph-file-text', 'Andrea R.', true, '2026-06-08'),
  ('vacanza-sportiva-2026-programma', $$Vacanza Sportiva 2026: programma estivo$$, 'Corsi', array['cuneo'], $$Centri estivi tra nuoto, giochi d'acqua e attività all'aperto per 6–14 anni.$$,
    $html$<p>Il programma della Vacanza Sportiva 2026 propone centri estivi tra nuoto, giochi d'acqua e attività all'aperto per bambini e ragazzi dai 6 ai 14 anni.</p>$html$,
    'ph-sun', 'Sara F.', true, '2026-06-03'),
  ('giornata-benessere-acqua', $$Giornata del benessere in acqua$$, 'Eventi', array['sommariva'], $$Sessioni gratuite di acquagym dolce dedicate agli over 60.$$,
    $html$<p>La sede di Sommariva Perno organizza una giornata del benessere con sessioni gratuite di acquagym dolce dedicate agli over 60.</p>$html$,
    'ph-heartbeat', 'Marta R.', true, '2026-05-28'),
  ('manutenzione-impianto-riscaldamento', $$Manutenzione impianto di riscaldamento$$, 'Avvisi', array['savigliano'], $$Possibili variazioni della temperatura vasca nella settimana.$$,
    $html$<p>Sono in corso interventi sull'impianto di riscaldamento della sede di Savigliano. Sono possibili lievi variazioni della temperatura della vasca durante la settimana.</p>$html$,
    'ph-megaphone', 'Luca D.', true, '2026-05-20'),
  ('affiliazione-fin-2026-27', $$Affiliazione confermata con la FIN per il 2026/27$$, 'Comunicati', '{}', $$Il Centro rinnova la collaborazione con la Federazione Italiana Nuoto.$$,
    $html$<p>Il Centro Sportivo Roero rinnova l'affiliazione con la Federazione Italiana Nuoto per la stagione 2026/27, confermando il proprio impegno nel settore agonistico e didattico.</p>$html$,
    'ph-medal', 'Marta R.', true, '2026-05-14')
on conflict (slug) do nothing;

-- ---------- COURSES ----------
insert into public.courses (category_id, name, age, schedule, price, price_note, instructor, location_ids) values
  ('babynuoto', $$Piccoli Pesci$$, '3-36 mesi', $$Sab 10:00–10:45$$, '€75', $$/mese · 4 lezioni$$, 'Giulia Berra', array['cuneo']),
  ('babynuoto', $$Acquaticità 0-1$$, '3-36 mesi', $$Mer 16:30–17:15$$, '€75', $$/mese · 4 lezioni$$, 'Marco Olivero', array['alba']),
  ('mininuoto', $$Mini A (3-4 anni)$$, '3-4 anni', 'Lun/Gio 17:00', '€68', $$/mese · 8 lezioni$$, 'Sara Ferrero', array['alba']),
  ('mininuoto', $$Mini B (4-5 anni)$$, '4-5 anni', 'Mar/Ven 17:00', '€68', $$/mese · 8 lezioni$$, 'Sara Ferrero', array['savigliano']),
  ('nuoto-bambini', $$Principianti$$, '6-13 anni', 'Lun/Mer 17:30', '€62', $$/mese · 8 lezioni$$, 'Luca Demaria', array['cuneo']),
  ('nuoto-bambini', $$Avanzati$$, '6-13 anni', 'Mar/Gio 18:30', '€62', $$/mese · 8 lezioni$$, 'Luca Demaria', array['cuneo']),
  ('nuoto-bambini', $$Perfezionamento$$, '6-13 anni', 'Ven 18:00 + Sab 11:00', '€70', $$/mese · 8 lezioni$$, 'Elena Bosio', array['asti']),
  ('nuoto-adulti', $$Base$$, '14+', 'Lun/Mer 20:00', '€58', $$/mese · 8 lezioni$$, 'Andrea Rossi', array['savigliano']),
  ('nuoto-adulti', $$Intermedio$$, '14+', 'Mar/Gio 19:00', '€58', $$/mese · 8 lezioni$$, 'Andrea Rossi', array['cuneo']),
  ('acquagym', $$Acquagym Tonic$$, 'Adulti', 'Lun/Mer 19:30', '€55', $$/mese · 8 lezioni$$, 'Chiara Viglietti', array['asti']),
  ('acquagym', $$Acquagym Soft 60+$$, 'Adulti', 'Mar/Gio 10:30', '€50', $$/mese · 8 lezioni$$, 'Chiara Viglietti', array['sommariva']),
  ('agonistica', $$Esordienti$$, 'Su selezione', '3x settimana', '€95', '/mese', 'D.T. Paolo Conti', array['cuneo']),
  ('agonistica', $$Ragazzi/Juniores$$, 'Su selezione', '5x settimana', '€120', '/mese', 'D.T. Paolo Conti', array['cuneo']),
  ('speciali', $$Nuoto Inclusivo$$, 'Tutte le età', $$Sab 15:00–16:00$$, 'Su richiesta', 'convenzioni ASL', 'Staff dedicato', array['cuneo']),
  ('speciali', $$Riabilitazione in acqua$$, 'Tutte le età', 'Su appuntamento', 'Su richiesta', 'individuale', 'Fisioterapista', array['alba']),
  ('vacanza', $$Settimana Full$$, '6-14 anni', $$Lun–Ven 8:00–17:00$$, '€140', '/settimana', 'Staff estivo', array['cuneo']),
  ('vacanza', $$Settimana Mattino$$, '6-14 anni', $$Lun–Ven 8:00–13:00$$, '€95', '/settimana', 'Staff estivo', array['savigliano']);

-- ---------- EVENTS ----------
insert into public.events (title, date, time, location_ids, description) values
  ($$Open Day acquaticità$$, '2026-07-05', '10:00', array['savigliano'], $$Prova gratuita di mininuoto e babynuoto per i più piccoli.$$),
  ($$Meeting nuoto giovanile$$, '2026-07-12', '09:30', array['cuneo'], $$Meeting di categoria con le società del territorio.$$),
  ($$Giornata benessere 60+$$, '2026-07-18', '16:00', array['sommariva'], $$Sessioni di acquagym dolce dedicate agli over 60.$$),
  ($$Saggio fine corso$$, '2026-07-24', '18:00', array['alba'], $$Saggio conclusivo dei corsi di nuoto bambini.$$),
  ($$Selezioni squadra agonistica$$, '2026-07-28', '17:30', array['cuneo'], $$Selezioni per la squadra agonistica stagione 2026/27.$$);

-- Fine.
