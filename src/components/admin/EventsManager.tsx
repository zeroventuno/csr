"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import SlideOver, { fieldLabel, fieldInput, fieldArea } from "./SlideOver";
import { saveEvent, deleteEvent } from "@/lib/actions";
import type { Role, EventInput } from "@/lib/types";

export interface EventRow {
  id: string;
  title: string;
  date: string; // ISO YYYY-MM-DD
  time: string;
  locationId: string;
  locationName: string;
  description: string;
  image?: string;
}

const WEEK = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
const MONTHS = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];
const MON_ABBR = [
  "Gen", "Feb", "Mar", "Apr", "Mag", "Giu",
  "Lug", "Ago", "Set", "Ott", "Nov", "Dic",
];

function iso(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export default function EventsManager({
  rows,
  locations,
  role,
}: {
  rows: EventRow[];
  locations: { id: string; name: string }[];
  role: Role;
}) {
  const router = useRouter();
  const isAdmin = role === "admin";

  const firstEventDate = rows[0]?.date;
  const init = firstEventDate ? new Date(firstEventDate + "T00:00:00") : new Date();
  const [year, setYear] = useState(init.getFullYear());
  const [month, setMonth] = useState(init.getMonth());

  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const emptyForm: EventInput = {
    id: undefined,
    title: "",
    date: iso(year, month, 1),
    time: "10:00",
    locationId: locations[0]?.id || "cuneo",
    description: "",
    image: "",
  };
  const [form, setForm] = useState<EventInput>(emptyForm);

  const eventDays = useMemo(() => {
    const set = new Set<number>();
    rows.forEach((e) => {
      const d = new Date(e.date + "T00:00:00");
      if (d.getFullYear() === year && d.getMonth() === month)
        set.add(d.getDate());
    });
    return set;
  }, [rows, year, month]);

  const cells = useMemo(() => {
    const firstDow = (new Date(year, month, 1).getDay() + 6) % 7; // Mon-based
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const arr: (number | null)[] = [];
    for (let i = 0; i < firstDow; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    return arr;
  }, [year, month]);

  const upcoming = useMemo(
    () => [...rows].sort((a, b) => (a.date < b.date ? -1 : 1)),
    [rows]
  );

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  }

  function openNew(day?: number) {
    setForm({
      ...emptyForm,
      date: iso(year, month, day || 1),
      locationId: locations[0]?.id || "cuneo",
    });
    setOpen(true);
  }
  function openEdit(e: EventRow) {
    setForm({
      id: e.id,
      title: e.title,
      date: e.date,
      time: e.time,
      locationId: e.locationId,
      description: e.description,
      image: e.image || "",
    });
    setOpen(true);
  }

  async function save() {
    if (!form.title.trim()) {
      alert("Inserisci il titolo dell'evento.");
      return;
    }
    setPending(true);
    try {
      await saveEvent(form);
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      alert(err?.message || "Errore durante il salvataggio.");
    } finally {
      setPending(false);
    }
  }

  async function onDelete(id: string, title: string) {
    if (!confirm(`Eliminare l'evento "${title}"?`)) return;
    try {
      await deleteEvent(id);
      router.refresh();
    } catch (err: any) {
      alert(err?.message || "Errore durante l'eliminazione.");
    }
  }

  const set = (k: keyof EventInput, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.7fr_1fr]">
      {/* CALENDAR */}
      <div className="rounded-[16px] border border-border bg-surface p-[22px]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[22px] text-text">
            {MONTHS[month]} {year}
          </h3>
          <div className="flex gap-1.5">
            <button
              onClick={prevMonth}
              className="grid h-9 w-9 place-items-center rounded-[9px] border border-border bg-surface-2 text-text"
            >
              <i className="ph ph-caret-left" />
            </button>
            <button
              onClick={nextMonth}
              className="grid h-9 w-9 place-items-center rounded-[9px] border border-border bg-surface-2 text-text"
            >
              <i className="ph ph-caret-right" />
            </button>
          </div>
        </div>
        <div className="mb-1.5 grid grid-cols-7 gap-1.5">
          {WEEK.map((d) => (
            <div
              key={d}
              className="py-1 text-center text-[11.5px] font-bold text-muted"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((d, i) =>
            d === null ? (
              <div key={`e${i}`} />
            ) : (
              <button
                key={d}
                onClick={() => openNew(d)}
                className="flex aspect-square flex-col gap-[3px] rounded-[9px] border border-border p-1.5 text-left transition hover:border-aqua"
                style={{
                  background: eventDays.has(d)
                    ? "rgba(0,180,216,.08)"
                    : "var(--surface-2)",
                }}
              >
                <span className="text-xs font-semibold text-text">{d}</span>
                {eventDays.has(d) && (
                  <span className="h-[5px] rounded-[3px] bg-aqua" />
                )}
              </button>
            )
          )}
        </div>
      </div>

      {/* LIST */}
      <div className="rounded-[16px] border border-border bg-surface p-[22px]">
        <div className="mb-3.5 flex items-center justify-between">
          <h3 className="text-[22px] text-text">Prossimi eventi</h3>
          <button
            onClick={() => openNew()}
            className="flex h-9 items-center gap-1.5 rounded-[9px] bg-aqua px-3 text-[13px] font-bold text-[#06121F]"
          >
            <i className="ph ph-plus" />
            Nuovo
          </button>
        </div>
        <div className="flex flex-col gap-2.5">
          {upcoming.length === 0 ? (
            <div className="py-8 text-center text-muted">Nessun evento.</div>
          ) : (
            upcoming.map((e) => {
              const d = new Date(e.date + "T00:00:00");
              return (
                <div
                  key={e.id}
                  className="group flex items-center gap-3 rounded-[13px] border border-border bg-surface-2 p-3.5"
                >
                  <div className="flex-none text-center" style={{ width: 52 }}>
                    <div className="head text-[26px] font-extrabold leading-none text-aqua">
                      {String(d.getDate()).padStart(2, "0")}
                    </div>
                    <div className="text-[11px] uppercase text-muted">
                      {MON_ABBR[d.getMonth()]}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14.5px] font-semibold text-text">
                      {e.title}
                    </div>
                    <div className="mt-0.5 text-xs text-muted">
                      <i className="ph ph-clock" /> {e.time} ·{" "}
                      <i className="ph ph-map-pin" /> {e.locationName}
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => openEdit(e)}
                      aria-label="Modifica"
                      className="grid h-8 w-8 place-items-center rounded-[8px] border border-border bg-surface text-sm text-text transition hover:border-aqua"
                    >
                      <i className="ph ph-pencil-simple" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => onDelete(e.id, e.title)}
                        aria-label="Elimina"
                        className="grid h-8 w-8 place-items-center rounded-[8px] border border-border bg-surface text-sm text-red transition hover:border-red"
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
      </div>

      <SlideOver
        open={open}
        onClose={() => setOpen(false)}
        title={form.id ? "Modifica evento" : "Nuovo evento"}
        subtitle="Data, ora, sede e descrizione"
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
          <label className={fieldLabel}>Titolo</label>
          <input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Es. Open Day acquaticità"
            className={fieldInput}
          />
        </div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          <div>
            <label className={fieldLabel}>Data</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              className={fieldInput}
            />
          </div>
          <div>
            <label className={fieldLabel}>Ora</label>
            <input
              type="time"
              value={form.time}
              onChange={(e) => set("time", e.target.value)}
              className={fieldInput}
            />
          </div>
          <div>
            <label className={fieldLabel}>Sede</label>
            <select
              value={form.locationId}
              onChange={(e) => set("locationId", e.target.value)}
              className={fieldInput}
            >
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className={fieldLabel}>Descrizione</label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={4}
            placeholder="Dettagli dell'evento"
            className={fieldArea}
          />
        </div>
      </SlideOver>
    </div>
  );
}
