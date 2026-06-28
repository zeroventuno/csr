# Centro Sportivo Roero — Sito Web

Sito completo e funzionale per il Centro Sportivo Roero (5 piscine nel Cuneese/Roero).

**Stack:** Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS
**Database:** Supabase (Postgres) · **Upload file:** Supabase Storage
**Hosting consigliato:** Vercel (free) + GitHub

---

## A) Configurare Supabase (una volta sola)

1. Crea un progetto su <https://supabase.com> (piano free).
2. Apri **SQL Editor** → **New query**, incolla tutto il contenuto di
   [`supabase/schema.sql`](supabase/schema.sql) e premi **Run**.
   Questo crea le tabelle, i dati di esempio e il bucket `media` (pubblico).
3. Vai in **Project Settings → API** e copia:
   - **Project URL** → `SUPABASE_URL`
   - **service_role** key (sezione *Project API keys*) → `SUPABASE_SERVICE_ROLE_KEY`
     (⚠️ è una chiave segreta: va usata solo lato server, mai nel browser).

## B) Eseguire in locale

Richiede **Node.js 18.18+** (consigliato 20 LTS) da <https://nodejs.org>.

1. Crea il file `.env.local` (copia da `.env.example`) e compila:

   ```
   SUPABASE_URL=https://xxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
   ADMIN_PASSWORD=roero-admin
   EDITOR_PASSWORD=roero-editor
   AUTH_SECRET=una-stringa-lunga-e-casuale
   ```

2. Installa e avvia:

   ```bash
   npm install
   npm run dev
   ```

   - Sito: <http://localhost:3000>
   - Area riservata: <http://localhost:3000/admin>

## C) Pubblicare su GitHub + Vercel

1. **GitHub** — crea un repository e carica la cartella `roero-site/`:

   ```bash
   cd roero-site
   git init
   git add .
   git commit -m "Sito Centro Sportivo Roero"
   git branch -M main
   git remote add origin https://github.com/TUO-UTENTE/roero-site.git
   git push -u origin main
   ```

   > Il file `.env.local` NON viene caricato (è in `.gitignore`): le password
   > restano fuori dal repository.

2. **Vercel** — su <https://vercel.com>: *Add New → Project → Import* del repo GitHub.
   - Framework: **Next.js** (rilevato in automatico).
   - In **Environment Variables** aggiungi le stesse 5 variabili del punto B
     (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`,
     `EDITOR_PASSWORD`, `AUTH_SECRET`).
   - **Deploy**. Ad ogni `git push` Vercel ripubblica automaticamente.

---

## Credenziali area riservata

| Ruolo  | Password (default) | Permessi                                  |
| ------ | ------------------ | ----------------------------------------- |
| Admin  | `roero-admin`      | Accesso completo, incluse le eliminazioni |
| Editor | `roero-editor`     | Crea e modifica, **non** può eliminare    |

> ⚠️ Cambia le password e `AUTH_SECRET` prima di andare online.

## Cosa è funzionale

- Pannello admin protetto da password (cookie firmato, ruoli Admin/Editor).
- **News**: CRUD, editor rich-text, immagine di copertina (Supabase Storage),
  pubblicato/bozza, categoria e sede. Le news pubblicate appaiono subito sul sito.
- **Corsi**: CRUD; compaiono nella pagina pubblica "Corsi" raggruppati per categoria.
- **Eventi**: calendario navigabile + lista, creazione/modifica/eliminazione.
- **Sedi**: indirizzo, orari, telefono, % disponibilità vasche, embed Google Maps.
- **Media Library**: upload (drag & drop) su Supabase Storage, anteprima ed eliminazione.
- Tema chiaro/scuro, banner cookie GDPR, animazioni allo scroll, hero parallax,
  layout responsive mobile-first.

## Struttura

```
src/
  app/            Pagine pubbliche + admin (App Router)
  components/     Header, Footer, Hero, manager admin, ecc.
  lib/
    supabase.ts   Client Supabase (service role, solo server)
    db.ts         Query di lettura + mapper
    actions.ts    Server actions (CRUD + auth + upload)
    auth.ts       Sessione firmata (HMAC, Web Crypto)
  middleware.ts   Protegge /admin
supabase/
  schema.sql      Schema + dati iniziali + bucket storage
```

## Note

- Tutto l'accesso al database avviene lato server con la **service role**; la RLS è
  abilitata e blocca l'accesso anonimo diretto alle tabelle.
- I file `.dc.html` nella cartella superiore sono i mockup di design originali (riferimento).
