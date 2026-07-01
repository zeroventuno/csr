"use server";

import { getDB } from "./db";
import { formatDateLong } from "./format";

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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Email HTML brandizzata (compatibile con i client email: tabelle + CSS inline). */
function buildContactEmailHtml(input: {
  sedeName: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  submittedAt: string;
}): string {
  const name = escapeHtml(input.name);
  const email = escapeHtml(input.email);
  const phone = escapeHtml(input.phone || "—");
  const sedeName = escapeHtml(input.sedeName);
  const message = escapeHtml(input.message).replace(/\n/g, "<br>");
  const dateLabel = escapeHtml(formatDateLong(input.submittedAt.slice(0, 10)));

  return `<!DOCTYPE html>
<html lang="it">
<body style="margin:0;padding:0;background:#F4F6F8;font-family:Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F6F8;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:20px;overflow:hidden;border:1px solid rgba(13,59,102,0.12);">

<!-- header -->
<tr>
<td style="background:linear-gradient(120deg,#0A2E50,#0D3B66);padding:28px 32px;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="width:40px;height:40px;background:linear-gradient(135deg,#0D3B66,#00B4D8);border-radius:11px;text-align:center;vertical-align:middle;font-size:20px;">🌊</td>
<td style="padding-left:12px;color:#FFFFFF;font-size:19px;font-weight:700;letter-spacing:0.01em;">CENTRO SPORTIVO ROERO</td>
</tr></table>
<div style="margin-top:14px;display:inline-block;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.3);border-radius:100px;padding:6px 14px;color:#FFFFFF;font-size:12.5px;font-weight:600;">
Nuovo messaggio dal modulo contatti
</div>
</td>
</tr>

<!-- body -->
<tr>
<td style="padding:32px;">
<div style="display:inline-block;background:#7DDDEF;color:#0D3B66;font-weight:700;font-size:12.5px;padding:5px 12px;border-radius:8px;margin-bottom:18px;">
SEDE: ${sedeName.toUpperCase()}
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:6px;">
<tr>
<td style="padding:10px 0;border-bottom:1px solid #EEF1F4;color:#5A6B7A;font-size:12.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;width:110px;vertical-align:top;">Nome</td>
<td style="padding:10px 0;border-bottom:1px solid #EEF1F4;color:#0C2233;font-size:15px;">${name}</td>
</tr>
<tr>
<td style="padding:10px 0;border-bottom:1px solid #EEF1F4;color:#5A6B7A;font-size:12.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;vertical-align:top;">Email</td>
<td style="padding:10px 0;border-bottom:1px solid #EEF1F4;color:#0C2233;font-size:15px;"><a href="mailto:${email}" style="color:#0D3B66;text-decoration:none;font-weight:600;">${email}</a></td>
</tr>
<tr>
<td style="padding:10px 0;border-bottom:1px solid #EEF1F4;color:#5A6B7A;font-size:12.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;vertical-align:top;">Telefono</td>
<td style="padding:10px 0;border-bottom:1px solid #EEF1F4;color:#0C2233;font-size:15px;">${phone}</td>
</tr>
</table>

<div style="margin-top:20px;color:#5A6B7A;font-size:12.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">Messaggio</div>
<div style="margin-top:8px;background:#F4F6F8;border-radius:14px;padding:18px 20px;color:#0C2233;font-size:15px;line-height:1.6;">
${message}
</div>

<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:26px;">
<tr><td style="background:#00B4D8;border-radius:12px;">
<a href="mailto:${email}" style="display:inline-block;padding:13px 24px;color:#06121F;font-size:14.5px;font-weight:700;text-decoration:none;">Rispondi a ${name}</a>
</td></tr>
</table>
</td>
</tr>

<!-- footer -->
<tr>
<td style="padding:20px 32px;background:#F7F9FB;border-top:1px solid #EEF1F4;">
<p style="margin:0;color:#5A6B7A;font-size:12px;line-height:1.5;">
Ricevuto il ${dateLabel} tramite il modulo contatti di
<a href="https://centrosportivoroero.it" style="color:#0D3B66;">centrosportivoroero.it</a>.
</p>
</td>
</tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

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

  const submittedAt = new Date().toISOString();
  const contact = {
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone?.trim() || "",
  };
  const message = input.message.trim();
  const sedeResolved = sede || { id: input.sedeId, name: input.sedeId, email: "" };

  const payload = {
    source: "sito-web-contatti",
    submittedAt,
    sede: sedeResolved,
    contact,
    message,
    messageHtml: buildContactEmailHtml({
      sedeName: sedeResolved.name,
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      message,
      submittedAt,
    }),
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
