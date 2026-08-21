"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SlideOver, { fieldLabel, fieldInput, fieldArea } from "./SlideOver";
import { saveClosure, deleteClosure } from "@/lib/blocks";
import {
  closureStatus,
  CLOSURE_STATUS_META,
  WHOLE_LOCATION_LABEL,
  type Closure,
  type ClosureInput,
} from "@/lib/blocks-types";
import { formatDateRange } from "@/lib/format";

export interface PoolOption {
  id: string;
  label: string;
}

/** Data odierna nel fuso Europe/Rome (YYYY-MM-DD). */
function romeToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export default function ClosureManager({
  closures,
  locations,
  poolsByLocation,
  role,
}: {
  closures: Closure[];
  locations: { id: string; name: string }[];
  poolsByLocation: Record<string, PoolOption[]>;
  role: string;
}) {
  const router = useRouter();
  const isAdmin = role === "admin";
  const today = romeToday();

  const empty: ClosureInput = {
    id: undefined,
    locationId: locations[0]?.id || "cuneo",
    poolId: null,
    dateFrom: today,
    dateTo: today,
    title: "",
    note: "",
    published: true,
  };

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ClosureInput>(empty);
  const [pending, setPending] = useState(false);

  const locName = (id: string) =>
    locations.find((l) => l.id === id)?.name || id;
  const pools = poolsByLocation[form.locationId] || [];

  function openNew() {
    setForm(empty);
    setOpen(true);
  }
  function openEdit(c: Closure) {
    setForm({
      id: c.id,
      locationId: c.locationId,
      poolId: c.poolId,
      dateFrom: c.dateFrom,
      dateTo: c.dateTo,
      title: c.title,
      note: c.note,
      published: c.published,
    });
    setOpen(true);
  }

  async function save() {
    if (!form.title.trim())
      return alert("Inserisci un titolo (es. Manutenzione programmata).");
    if (form.dateTo < form.dateFrom)
      return alert("La data di fine non può precedere quella di inizio.");
    setPending(true);
    try {
      const r = await saveClosure(form);
      if (!r.ok) {
        alert(r.error || "Errore durante il salvataggio.");
        return;
      }
      setOpen(false);
      router.refresh();
    } catch (e: any) {
      alert(e?.message || "Errore durante il salvataggio.");
    } finally {
      setPending(false);
    }
  }

  async function onDelete(id: string, title: string) {
    if (!confirm(`Eliminare la chiusura "${title}"?`)) return;
    try {
      const r = await deleteClosure(id);
      if (!r.ok) {
        alert(r.error || "Errore.");
        return;
      }
      router.refresh();
    } catch (e: any) {
      alert(e?.message || "Errore.");
    }
  }

  return (
    <div>
      <div className="mb-[18px] flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-[640px] text-[13.5px] text-muted">
          Le chiusure coprono più giorni (manutenzione, svuotamento vasca,
          ferie). Una vasca chiusa non risulta mai &laquo;libera&raquo;: sparisce
          dalla disponibilità pubblica, blocca il check-in e viene annunciata
          sulla pagina della sede e in home.
        </p>
        <button
          onClick={openNew}
          className="flex h-[42px] items-center gap-2 rounded-[11px] bg-aqua px-[18px] text-sm font-bold text-[#06121F] transition hover:-translate-y-0.5"
        >
          <i className="ph ph-plus-circle text-lg" /> Nuova chiusura
        </button>
      </div>

      <div className="overflow-hidden rounded-[16px] border border-border bg-surface">
        <div className="hidden grid-cols-[1.1fr_1.4fr_1.2fr_auto] gap-3.5 border-b border-border bg-surface-2 px-5 py-3.5 text-[11.5px] font-bold uppercase tracking-[0.06em] text-muted md:grid">
          <span>Periodo</span>
          <span>Motivo</span>
          <span>Sede / vasca</span>
          <span>Azioni</span>
        </div>
        {closures.length === 0 ? (
          <div className="p-12 text-center text-muted">
            Nessuna chiusura registrata.
          </div>
        ) : (
          closures.map((c) => {
            const st = closureStatus(c, today);
            const meta = CLOSURE_STATUS_META[st];
            return (
              <div
                key={c.id}
                className="grid grid-cols-1 items-center gap-3.5 border-b border-border px-5 py-[15px] last:border-0 hover:bg-surface-2 md:grid-cols-[1.1fr_1.4fr_1.2fr_auto]"
              >
                <div className="text-[14px] text-text">
                  <div className="font-semibold">
                    {formatDateRange(c.dateFrom, c.dateTo)}
                  </div>
                  <span
                    className="mt-1 inline-flex items-center gap-1 rounded-[6px] px-2 py-0.5 text-[11px] font-bold uppercase text-white"
                    style={{ background: meta.color }}
                  >
                    {meta.label}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[14.5px] font-semibold text-text">
                    <i className="ph-fill ph-warning-octagon text-red" />
                    {c.title}
                  </div>
                  {c.note && (
                    <div className="mt-0.5 line-clamp-2 text-[12.5px] text-muted">
                      {c.note}
                    </div>
                  )}
                </div>
                <div className="text-[13px] text-muted">
                  {locName(c.locationId)}
                  <br />
                  <span className="text-text">{c.poolLabel}</span>
                </div>
                <div className="flex gap-1.5 justify-self-start md:justify-self-end">
                  <button
                    onClick={() => openEdit(c)}
                    aria-label="Modifica"
                    className="grid h-[34px] w-[34px] place-items-center rounded-[9px] border border-border bg-surface text-[15px] text-text transition hover:border-aqua"
                  >
                    <i className="ph ph-pencil-simple" />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => onDelete(c.id, c.title)}
                      aria-label="Elimina"
                      className="grid h-[34px] w-[34px] place-items-center rounded-[9px] border border-border bg-surface text-[15px] text-red transition hover:border-red"
                    >
                      <i className="ph ph-trash" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <SlideOver
        open={open}
        onClose={() => setOpen(false)}
        title={form.id ? "Modifica chiusura" : "Nuova chiusura"}
        subtitle="Chiude una vasca o l'intera sede per un periodo di giorni"
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
          <label className={fieldLabel}>Titolo / motivo *</label>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Es. Manutenzione programmata"
            className={fieldInput}
          />
        </div>

        <div>
          <label className={fieldLabel}>Sede *</label>
          <select
            value={form.locationId}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                locationId: e.target.value,
                poolId: null, // le vasche cambiano con la sede
              }))
            }
            className={fieldInput}
          >
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={fieldLabel}>Che cosa chiude *</label>
          <select
            value={form.poolId || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, poolId: e.target.value || null }))
            }
            className={fieldInput}
          >
            <option value="">{WHOLE_LOCATION_LABEL}</option>
            {pools.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <div className="mt-1.5 text-[11.5px] text-muted">
            {pools.length === 0
              ? "Questa sede non ha vasche configurate: la chiusura riguarda tutta la sede."
              : form.poolId
              ? "Chiude solo questa vasca: le altre restano disponibili."
              : "Chiude l'intera sede: tutte le vasche risultano chiuse."}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div>
            <label className={fieldLabel}>Dal *</label>
            <input
              type="date"
              value={form.dateFrom}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  dateFrom: e.target.value,
                  dateTo: f.dateTo < e.target.value ? e.target.value : f.dateTo,
                }))
              }
              className={fieldInput}
            />
          </div>
          <div>
            <label className={fieldLabel}>Al * (incluso)</label>
            <input
              type="date"
              value={form.dateTo}
              min={form.dateFrom}
              onChange={(e) => setForm((f) => ({ ...f, dateTo: e.target.value }))}
              className={fieldInput}
            />
          </div>
        </div>

        <div>
          <label className={fieldLabel}>Note (opzionale)</label>
          <textarea
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            rows={3}
            placeholder="Es. Riapertura prevista lunedì 15. Le lezioni sono sospese."
            className={fieldArea}
          />
        </div>

        <div>
          <label className={fieldLabel}>Visibilità</label>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, published: !f.published }))}
            className="mt-[7px] flex h-[42px] items-center gap-2 rounded-[10px] border px-3.5 text-[13.5px] font-semibold transition"
            style={{
              background: form.published ? "var(--aqua)" : "var(--surface-2)",
              color: form.published ? "#06121F" : "var(--text)",
              borderColor: form.published ? "var(--aqua)" : "var(--border)",
            }}
          >
            <i
              className={`ph ${
                form.published ? "ph-check-circle" : "ph-eye-slash"
              }`}
            />
            {form.published ? "Pubblicata" : "Bozza (non visibile)"}
          </button>
          <div className="mt-1.5 text-[11.5px] text-muted">
            Solo le chiusure pubblicate compaiono sul sito e bloccano il
            check-in.
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
