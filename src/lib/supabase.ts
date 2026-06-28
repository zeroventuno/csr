import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Client Supabase lato server (service role): bypassa la RLS.
// NON va mai importato in un componente client — solo server components,
// server actions e route handlers.

let _client: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Variabili d'ambiente Supabase mancanti. Imposta SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY in .env.local (e nelle env di Vercel)."
    );
  }

  _client = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}

export const MEDIA_BUCKET = "media";
