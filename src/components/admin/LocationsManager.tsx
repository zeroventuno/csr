"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SlideOver, { fieldLabel, fieldInput, fieldArea } from "./SlideOver";
import { saveLocation } from "@/lib/actions";
import type { LocationInput } from "@/lib/types";

export interface LocRow {
  id: string;
  name: string;
  address: string;
  hours: string;
  phone: string;
  email: string;
  pool: number;
  mapsEmbed?: string;
  nuotoLibero: string;
  nuotoLiberoPdf: string;
}

export default function LocationsManager({ rows }: { rows: LocRow[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState<LocationInput>({
    id: "",
    name: "",
    address: "",
    hours: "",
    phone: "",
    email: "",
    pool: 0,
    mapsEmbed: "",
    nuotoLibero: "",
    nuotoLiberoPdf: "",
  });

  function openEdit(l: LocRow) {
    setForm({
      id: l.id,
      name: l.name,
      address: l.address,
      hours: l.hours,
      phone: l.phone,
      email: l.email || "",
      pool: l.pool,
      mapsEmbed: l.mapsEmbed || "",
      nuotoLibero: l.nuotoLibero || "",
      nuotoLiberoPdf: l.nuotoLiberoPdf || "",
    });
    setOpen(true);
  }

  async function save() {
    setPending(true);
    try {
      await saveLocation(form);
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      alert(err?.message || "Errore durante il salvataggio.");
    } finally {
      setPending(false);
    }
  }

  const set = (k: keyof LocationInput, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {rows.map((l) => (
        <div
          key={l.id}
          className="overflow-hidden rounded-[16px] border border-border bg-surface"
        >
          <div className="relative h-[140px] bg-gradient-to-br from-blue to-aqua">
            {l.mapsEmbed ? (
              <iframe
                src={l.mapsEmbed}
                title={`Mappa ${l.name}`}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center text-4xl text-white/70">
                <i className="ph ph-map-trifold" />
              </div>
            )}
          </div>
          <div className="p-[18px]">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl text-text">{l.name}</h3>
              <button
                onClick={() => openEdit(l)}
                className="flex h-[34px] items-center gap-1.5 rounded-[9px] border border-border bg-surface-2 px-3 text-[13px] font-semibold text-text transition hover:border-aqua"
              >
                <i className="ph ph-pencil-simple" />
                Modifica
              </button>
            </div>
            <div className="mt-3.5 flex flex-col gap-2.5">
              <div className="flex gap-2.5 text-[13.5px] text-text">
                <i className="ph ph-map-pin text-[17px] text-aqua" />
                {l.address}
              </div>
              <div className="flex gap-2.5 text-[13.5px] text-text">
                <i className="ph ph-clock text-[17px] text-aqua" />
                {l.hours}
              </div>
              <div className="flex gap-2.5 text-[13.5px] text-text">
                <i className="ph ph-phone text-[17px] text-aqua" />
                {l.phone}
              </div>
              {l.email && (
                <div className="flex gap-2.5 break-all text-[13.5px] text-text">
                  <i className="ph ph-envelope-simple text-[17px] text-aqua" />
                  {l.email}
                </div>
              )}
              <div className="flex items-center gap-2.5 text-[13.5px] text-text">
                <i className="ph ph-drop text-[17px] text-aqua" />
                Disponibilità vasche: <b>{l.pool}%</b>
              </div>
            </div>
          </div>
        </div>
      ))}

      <SlideOver
        open={open}
        onClose={() => setOpen(false)}
        title={`Modifica sede — ${form.name}`}
        subtitle="Indirizzo, orari, contatti e mappa"
        footer={
          <>
            <button
              onClick={() => setOpen(false)}
              className="ml-auto h-11 rounded-[11px] border border-border bg-surface px-[18px] font-semibold text-text"
            >
              Annulla
            </button>
            <button
              onClick={save}
              disabled={pending}
              className="flex h-11 items-center gap-2 rounded-[11px] bg-aqua px-5 font-bold text-[#06121F] disabled:opacity-60"
            >
              <i className={`ph ${pending ? "ph-spinner" : "ph-check"}`} />
              {pending ? "Salvataggio…" : "Salva"}
            </button>
          </>
        }
      >
        <div>
          <label className={fieldLabel}>Nome sede</label>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className={fieldInput}
          />
        </div>
        <div>
          <label className={fieldLabel}>Indirizzo</label>
          <input
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            className={fieldInput}
          />
        </div>
        <div>
          <label className={fieldLabel}>Orari</label>
          <input
            value={form.hours}
            onChange={(e) => set("hours", e.target.value)}
            className={fieldInput}
          />
        </div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div>
            <label className={fieldLabel}>Telefono</label>
            <input
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              className={fieldInput}
            />
          </div>
          <div>
            <label className={fieldLabel}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="info...@centrosportivoroero.it"
              className={fieldInput}
            />
          </div>
        </div>
        <div>
          <label className={fieldLabel}>Disponibilità vasche (%)</label>
          <input
            type="number"
            min={0}
            max={100}
            value={form.pool}
            onChange={(e) => set("pool", Number(e.target.value))}
            className={fieldInput}
          />
        </div>
        <div>
          <label className={fieldLabel}>URL embed Google Maps</label>
          <textarea
            value={form.mapsEmbed}
            onChange={(e) => set("mapsEmbed", e.target.value)}
            rows={2}
            placeholder="https://www.google.com/maps?q=...&output=embed"
            className={fieldArea}
          />
        </div>

        <div className="mt-2 border-t border-border pt-4">
          <div className="text-[13px] font-bold uppercase tracking-[0.05em] text-aqua">
            <i className="ph ph-waves" /> Nuoto Libero — Orari &amp; Tariffe
          </div>
          <p className="mt-1 text-[12px] text-muted">
            Contenuto della sezione (accetta HTML: titoli &lt;h3&gt;, tabelle
            &lt;table&gt;, elenchi &lt;ul&gt;, note con &lt;p class=&quot;nl-note&quot;&gt;).
          </p>
        </div>
        <div>
          <label className={fieldLabel}>Contenuto (HTML)</label>
          <textarea
            value={form.nuotoLibero}
            onChange={(e) => set("nuotoLibero", e.target.value)}
            rows={8}
            placeholder="<h3>Orari…</h3><table>…</table>"
            className={`${fieldArea} font-mono text-[13px]`}
          />
        </div>
        <div>
          <label className={fieldLabel}>URL del PDF scaricabile</label>
          <input
            value={form.nuotoLiberoPdf}
            onChange={(e) => set("nuotoLiberoPdf", e.target.value)}
            placeholder="/nuoto-libero-....pdf  oppure  https://…"
            className={fieldInput}
          />
        </div>
      </SlideOver>
    </div>
  );
}
