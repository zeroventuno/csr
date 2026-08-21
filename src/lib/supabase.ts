import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Client Supabase lato server (service role): bypassa la RLS.
// NON va mai importato in un componente client — solo server components,
// server actions e route handlers.

let _client: SupabaseClient | null = null;
let _fresh: SupabaseClient | null = null;

function credentials(): { url: string; serviceKey: string } {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Variabili d'ambiente Supabase mancanti. Imposta SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY in .env.local (e nelle env di Vercel)."
    );
  }
  return { url, serviceKey };
}

export function supabaseAdmin(): SupabaseClient {
  if (_client) return _client;
  const { url, serviceKey } = credentials();
  _client = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}

/**
 * Come supabaseAdmin(), ma ogni lettura salta la Data Cache di Next.js
 * (`cache: "no-store"`). Da usare per i dati che devono essere sempre
 * aggiornati al secondo: quando la segreteria pubblica una chiusura deve
 * comparire subito sul sito, non alla scadenza di una cache.
 */
export function supabaseFresh(): SupabaseClient {
  if (_fresh) return _fresh;
  const { url, serviceKey } = credentials();
  _fresh = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) =>
        fetch(input, { ...(init || {}), cache: "no-store" }),
    },
  });
  return _fresh;
}

export const MEDIA_BUCKET = "media";
