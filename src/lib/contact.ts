"use server";

import { getDB } from "./db";

export interface ContactInput {
  name: string;
  email: string;
  phone?: string;
  sedeId: string;
  message: string;
  consent: boolean;
  website?: string; // honeypot anti-spam (deve restare vuoto)
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sendContact(
  input: ContactInput
): Promise<{ ok: boolean; error?: string }> {
  // Honeypot: se compilato è un bot → fingiamo successo e scartiamo.
  if (input.website && input.website.trim() !== "") return { ok: true };

  if (!input.name?.trim() || !input.email?.trim() || !input.message?.trim()) {
    return { ok: false, error: "Compila nome, email e messaggio." };
  }
  if (!EMAIL_RE.test(input.email.trim())) {
    return { ok: false, error: "Inserisci un indirizzo email valido." };
  }
  if (!input.consent) {
    return { ok: false, error: "È necessario accettare l'informativa privacy." };
  }

  const url = process.env.N8N_CONTACT_WEBHOOK_URL;
  if (!url) {
    return {
      ok: false,
      error:
        "Il modulo non è ancora configurato. Scrivi direttamente alla segreteria via email.",
    };
  }

  // Risolve la sede scelta (per instradare l'email lato n8n).
  let sede: { id: string; name: string; email: string } | null = null;
  try {
    const db = await getDB();
    const l = db.locations.find((x) => x.id === input.sedeId);
    if (l) sede = { id: l.id, name: l.name, email: l.email };
  } catch {
    /* se il DB non risponde, inviamo comunque con sedeId grezzo */
  }

  const payload = {
    source: "sito-web-contatti",
    submittedAt: new Date().toISOString(),
    sede: sede || { id: input.sedeId, name: input.sedeId, email: "" },
    contact: {
      name: input.name.trim(),
      email: input.email.trim(),
      phone: input.phone?.trim() || "",
    },
    message: input.message.trim(),
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    if (!res.ok) {
      return { ok: false, error: "Invio non riuscito. Riprova più tardi." };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Invio non riuscito. Controlla la connessione." };
  }
}
