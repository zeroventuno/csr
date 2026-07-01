"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SlideOver, { fieldLabel, fieldInput, fieldArea } from "./SlideOver";
import PoolLanePicker, { type PoolWithLanes } from "./PoolLanePicker";
import { saveBlock, deleteBlock } from "@/lib/blocks";
import type { LaneBlock, BlockInput } from "@/lib/blocks-types";
import { formatDate } from "@/lib/format";

export default function BlockManager({
  blocks,
  pools,
  newsOptions,
  role,
}: {
  blocks: LaneBlock[];
  pools: PoolWithLanes[];
  newsOptions: { slug: string; title: string }[];
  role: string;
}) {
  const router = useRouter();
  const isAdmin = role === "admin";
  const today = new Date().toISOString().slice(0, 10);

  const empty: BlockInput = {
    id: undefined,
    locationId: "cuneo",
    poolId: pools[0]?.id || "",
    laneIds: [],
    date: today,
    startTime: "18:00",
    endTime: "21:00",
    title: "",
    note: "",
    newsSlug: "",
  };

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<BlockInput>(empty);
  const [pending, setPending] = useState(false);

  function openNew() {
    setForm({ ...empty, poolId: pools[0]?.id || "" });
    setOpen(true);
  }
  function openEdit(b: LaneBlock) {
    setForm({
      id: b.id,
      locationId: b.locationId,
      poolId: b.poolId,
      laneIds: b.laneIds,
      date: b.date,
      startTime: b.startTime,
      endTime: b.endTime,
      title: b.title,
      note: b.note,
      newsSlug: b.newsSlug,
    });
    setOpen(true);
  }

  async function save() {
    if (!form.title.trim()) return alert("Inserisci un titolo (es. Water polo).");
    if (form.laneIds.length === 0) return alert("Seleziona almeno una corsia.");
    if (form.endTime <= form.startTime)
      return alert("L'orario di fine deve essere dopo l'inizio.");
    setPending(true);
    try {
      await saveBlock(form);
      setOpen(false);
      router.refresh();
    } catch (e: any) {
      alert(e?.message || "Errore durante il salvataggio.");
    } finally {
      setPending(false);
    }
  }
  async function onDelete(id: string, title: string) {
    if (!confirm(`Eliminare il blocco "${title}"?`)) return;
    try {
      await deleteBlock(id);
      router.refresh();
    } catch (e: any) {
      alert(e?.message || "Errore.");
    }
  }

  return (
    <div>
      <div className="mb-[18px] flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-[640px] text-[13.5px] text-muted">
          I blocchi riservano corsie a eventi (es. water polo): durante la finestra
          le corsie escono dalla disponibilità pubblica e il kiosk non le assegna.
        </p>
        <button
          onClick={openNew}
          className="flex h-[42px] items-center gap-2 rounded-[11px] bg-aqua px-[18px] text-sm font-bold text-[#06121F] transition hover:-translate-y-0.5"
        >
          <i className="ph ph-plus-circle text-lg" /> Nuovo blocco
        </button>
      </div>

      <div className="overflow-hidden rounded-[16px] border border-border bg-surface">
        <div className="hidden grid-cols-[1fr_1.4fr_1.2fr_auto] gap-3.5 border-b border-border bg-surface-2 px-5 py-3.5 text-[11.5px] font-bold uppercase tracking-[0.06em] text-muted md:grid">
          <span>Quando</span>
          <span>Evento</span>
          <span>Vasca / corsie</span>
          <span>Azioni</span>
        </div>
        {blocks.length === 0 ? (
          <div className="p-12 text-center text-muted">
            Nessun blocco programmato.
          </div>
        ) : (
          blocks.map((b) => (
            <div
              key={b.id}
              className="grid grid-cols-1 items-center gap-3.5 border-b border-border px-5 py-[15px] last:border-0 hover:bg-surface-2 md:grid-cols-[1fr_1.4fr_1.2fr_auto]"
            >
              <div className="text-[14px] text-text">
                <div className="font-semibold">{formatDate(b.date)}</div>
                <div className="text-[12.5px] text-muted">
                  {b.startTime}–{b.endTime}
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[14.5px] font-semibold text-text">
                  <i className="ph ph-prohibit text-red" />
                  {b.title}
                </div>
                {b.newsSlug && (
                  <div className="text-[12px] text-aqua">news: {b.newsSlug}</div>
                )}
              </div>
              <div className="text-[13px] text-muted">
                {b.poolLabel}
                <br />
                <span className="text-text">
                  corsie {b.laneNumbers.join(", ") || "—"}
                </span>
              </div>
              <div className="flex gap-1.5 justify-self-start md:justify-self-end">
                <button
                  onClick={() => openEdit(b)}
                  aria-label="Modifica"
                  className="grid h-[34px] w-[34px] place-items-center rounded-[9px] border border-border bg-surface text-[15px] text-text transition hover:border-aqua"
                >
                  <i className="ph ph-pencil-simple" />
                </button>
                {isAdmin && (
                  <button
                    onClick={() => onDelete(b.id, b.title)}
                    aria-label="Elimina"
                    className="grid h-[34px] w-[34px] place-items-center rounded-[9px] border border-border bg-surface text-[15px] text-red transition hover:border-red"
                  >
                    <i className="ph ph-trash" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <SlideOver
        open={open}
        onClose={() => setOpen(false)}
        title={form.id ? "Modifica blocco" : "Nuovo blocco corsie"}
        subtitle="Riserva delle corsie per un evento in una fascia oraria"
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
            placeholder="Es. Partita di Water Polo"
            className={fieldInput}
          />
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          <div>
            <label className={fieldLabel}>Data *</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className={fieldInput}
            />
          </div>
          <div>
            <label className={fieldLabel}>Dalle *</label>
            <input
              type="time"
              value={form.startTime}
              onChange={(e) =>
                setForm((f) => ({ ...f, startTime: e.target.value }))
              }
              className={fieldInput}
            />
          </div>
          <div>
            <label className={fieldLabel}>Alle *</label>
            <input
              type="time"
              value={form.endTime}
              onChange={(e) =>
                setForm((f) => ({ ...f, endTime: e.target.value }))
              }
              className={fieldInput}
            />
          </div>
        </div>

        <PoolLanePicker
          pools={pools}
          poolId={form.poolId}
          laneIds={form.laneIds}
          onChangePool={(poolId) => setForm((f) => ({ ...f, poolId, laneIds: [] }))}
          onChangeLanes={(laneIds) => setForm((f) => ({ ...f, laneIds }))}
        />

        <div>
          <label className={fieldLabel}>News collegata (opzionale)</label>
          <select
            value={form.newsSlug}
            onChange={(e) =>
              setForm((f) => ({ ...f, newsSlug: e.target.value }))
            }
            className={fieldInput}
          >
            <option value="">— nessuna —</option>
            {newsOptions.map((n) => (
              <option key={n.slug} value={n.slug}>
                {n.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={fieldLabel}>Note (opzionale)</label>
          <textarea
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            rows={2}
            className={fieldArea}
          />
        </div>
      </SlideOver>
    </div>
  );
}
