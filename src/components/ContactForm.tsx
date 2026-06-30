"use client";

import { useState } from "react";
import { sendContact } from "@/lib/contact";

const inputCls =
  "mt-2 h-[50px] w-full rounded-[12px] border border-border bg-surface px-4 text-[15px] text-text outline-none focus:border-aqua";
const labelCls =
  "text-[12.5px] font-bold uppercase tracking-[0.05em] text-muted";

export default function ContactForm({
  locations,
  defaultSede,
}: {
  locations: { id: string; name: string }[];
  defaultSede?: string;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    sedeId: defaultSede || locations[0]?.id || "",
    message: "",
    consent: false,
    website: "",
  });
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: string, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const r = await sendContact(form);
    setPending(false);
    if (r.ok) setDone(true);
    else setError(r.error || "Errore. Riprova.");
  }

  if (done) {
    return (
      <div className="rounded-[20px] border border-border bg-surface p-9 text-center shadow-csr">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green text-3xl text-white">
          <i className="ph-fill ph-check" />
        </span>
        <h3 className="head mt-5 text-[28px] text-text">Messaggio inviato!</h3>
        <p className="mt-2 text-muted">
          Grazie per averci scritto. La segreteria ti risponderà al più presto.
        </p>
        <button
          onClick={() => {
            setDone(false);
            setForm((f) => ({ ...f, message: "" }));
          }}
          className="mt-6 inline-flex h-12 items-center gap-2 rounded-[12px] border border-border bg-surface px-6 font-semibold text-text transition hover:border-aqua"
        >
          <i className="ph ph-arrow-counter-clockwise" /> Invia un altro messaggio
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-[20px] border border-border bg-surface p-7 shadow-csr md:p-8"
    >
      {/* honeypot */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={form.website}
        onChange={(e) => set("website", e.target.value)}
        className="hidden"
        aria-hidden="true"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Nome e cognome *</label>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Email *</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            required
            className={inputCls}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Telefono</label>
          <input
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Sede da contattare *</label>
          <select
            value={form.sedeId}
            onChange={(e) => set("sedeId", e.target.value)}
            className={inputCls}
          >
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label className={labelCls}>Messaggio *</label>
        <textarea
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          required
          rows={5}
          className="mt-2 w-full rounded-[12px] border border-border bg-surface px-4 py-3 text-[15px] text-text outline-none focus:border-aqua"
        />
      </div>

      <label className="mt-4 flex items-start gap-2.5 text-[13px] text-muted">
        <input
          type="checkbox"
          checked={form.consent}
          onChange={(e) => set("consent", e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-aqua"
        />
        <span>
          Acconsento al trattamento dei miei dati per essere ricontattato, come
          indicato nella{" "}
          <a href="#" className="font-semibold text-aqua">
            Privacy Policy
          </a>
          . *
        </span>
      </label>

      {error && (
        <div
          className="mt-4 flex items-center gap-2.5 rounded-[12px] border px-4 py-3 text-sm font-medium text-red"
          style={{
            borderColor: "rgba(214,72,92,.4)",
            background: "rgba(214,72,92,.1)",
          }}
        >
          <i className="ph ph-warning-circle text-lg" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-5 flex h-[52px] w-full items-center justify-center gap-2 rounded-[12px] bg-aqua text-[16px] font-bold text-[#06121F] transition hover:-translate-y-0.5 disabled:opacity-70"
      >
        <i className={`ph ${pending ? "ph-spinner" : "ph-paper-plane-tilt"}`} />
        {pending ? "Invio…" : "Invia messaggio"}
      </button>
    </form>
  );
}
