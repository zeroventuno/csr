"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SlideOver, { fieldLabel, fieldInput } from "./SlideOver";
import LocationPicker from "./LocationPicker";
import { saveCourse, deleteCourse } from "@/lib/actions";
import { CATEGORIES } from "@/lib/categories";
import type { Role, CourseInput } from "@/lib/types";

export interface CourseRow {
  id: string;
  categoryId: string;
  categoryTitle: string;
  icon: string;
  name: string;
  age: string;
  schedule: string;
  price: string;
  priceNote: string;
  instructor: string;
  locationIds: string[];
  locationLabel: string;
}

const emptyForm: CourseInput = {
  id: undefined,
  categoryId: CATEGORIES[0].id,
  name: "",
  age: "",
  schedule: "",
  price: "",
  priceNote: "",
  instructor: "",
  locationIds: [],
};

export default function CoursesManager({
  rows,
  locations,
  role,
}: {
  rows: CourseRow[];
  locations: { id: string; name: string }[];
  role: Role;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CourseInput>(emptyForm);
  const [pending, setPending] = useState(false);
  const isAdmin = role === "admin";

  function openNew() {
    setForm({ ...emptyForm, locationIds: [] });
    setOpen(true);
  }
  function openEdit(r: CourseRow) {
    setForm({
      id: r.id,
      categoryId: r.categoryId,
      name: r.name,
      age: r.age,
      schedule: r.schedule,
      price: r.price,
      priceNote: r.priceNote,
      instructor: r.instructor,
      locationIds: r.locationIds,
    });
    setOpen(true);
  }

  async function save() {
    if (!form.name.trim()) {
      alert("Inserisci il nome del corso.");
      return;
    }
    setPending(true);
    try {
      await saveCourse(form);
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      alert(err?.message || "Errore durante il salvataggio.");
    } finally {
      setPending(false);
    }
  }

  async function onDelete(id: string, name: string) {
    if (!confirm(`Eliminare il corso "${name}"?`)) return;
    try {
      await deleteCourse(id);
      router.refresh();
    } catch (err: any) {
      alert(err?.message || "Errore durante l'eliminazione.");
    }
  }

  const set = (k: keyof CourseInput, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="mb-[18px] flex justify-end">
        <button
          onClick={openNew}
          className="flex h-[42px] items-center gap-2 rounded-[11px] bg-aqua px-[18px] text-sm font-bold text-[#06121F] transition hover:-translate-y-0.5"
        >
          <i className="ph ph-plus-circle text-lg" />
          Nuovo corso
        </button>
      </div>

      <div className="overflow-hidden rounded-[16px] border border-border bg-surface">
        <div className="hidden grid-cols-[2fr_1fr_1.4fr_1fr_1fr_auto] gap-3.5 border-b border-border bg-surface-2 px-5 py-3.5 text-[11.5px] font-bold uppercase tracking-[0.06em] text-muted md:grid">
          <span>Corso</span>
          <span>Età</span>
          <span>Orario</span>
          <span>Prezzo</span>
          <span>Sede</span>
          <span>Azioni</span>
        </div>

        {rows.length === 0 ? (
          <div className="p-12 text-center text-muted">Nessun corso presente.</div>
        ) : (
          rows.map((r) => (
            <div
              key={r.id}
              className="grid grid-cols-1 items-center gap-3.5 border-b border-border px-5 py-[15px] transition last:border-0 hover:bg-surface-2 md:grid-cols-[2fr_1fr_1.4fr_1fr_1fr_auto]"
            >
              <div className="flex items-center gap-2.5 text-[14.5px] font-semibold text-text">
                <span className="grid h-[34px] w-[34px] flex-none place-items-center rounded-[9px] bg-surface-2 text-aqua">
                  <i className={`ph ${r.icon}`} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate">{r.name}</span>
                  <span className="text-xs font-normal text-muted">
                    {r.categoryTitle} · {r.instructor}
                  </span>
                </span>
              </div>
              <span className="text-[13px] text-muted">{r.age}</span>
              <span className="text-[13px] text-text">{r.schedule}</span>
              <span className="head text-lg font-extrabold text-text">
                {r.price}
              </span>
              <span className="text-[13px] text-muted">{r.locationLabel}</span>
              <div className="flex gap-1.5 justify-self-start md:justify-self-end">
                <button
                  onClick={() => openEdit(r)}
                  aria-label="Modifica"
                  className="grid h-[34px] w-[34px] place-items-center rounded-[9px] border border-border bg-surface text-[15px] text-text transition hover:border-aqua"
                >
                  <i className="ph ph-pencil-simple" />
                </button>
                {isAdmin && (
                  <button
                    onClick={() => onDelete(r.id, r.name)}
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
        title={form.id ? "Modifica corso" : "Nuovo corso"}
        subtitle="Definisci categoria, orario, prezzo e sede"
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
          <label className={fieldLabel}>Categoria</label>
          <select
            value={form.categoryId}
            onChange={(e) => set("categoryId", e.target.value)}
            className={fieldInput}
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
        <LocationPicker
          value={form.locationIds}
          locations={locations}
          onChange={(ids) => setForm((f) => ({ ...f, locationIds: ids }))}
        />
        <div>
          <label className={fieldLabel}>Nome del corso</label>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Es. Mininuoto A"
            className={fieldInput}
          />
        </div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div>
            <label className={fieldLabel}>Fascia d&apos;età</label>
            <input
              value={form.age}
              onChange={(e) => set("age", e.target.value)}
              placeholder="Es. 3-5 anni"
              className={fieldInput}
            />
          </div>
          <div>
            <label className={fieldLabel}>Istruttore</label>
            <input
              value={form.instructor}
              onChange={(e) => set("instructor", e.target.value)}
              placeholder="Nome istruttore"
              className={fieldInput}
            />
          </div>
        </div>
        <div>
          <label className={fieldLabel}>Orario</label>
          <input
            value={form.schedule}
            onChange={(e) => set("schedule", e.target.value)}
            placeholder="Es. Lun/Mer 17:30"
            className={fieldInput}
          />
        </div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div>
            <label className={fieldLabel}>Prezzo</label>
            <input
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
              placeholder="Es. €68"
              className={fieldInput}
            />
          </div>
          <div>
            <label className={fieldLabel}>Nota prezzo</label>
            <input
              value={form.priceNote}
              onChange={(e) => set("priceNote", e.target.value)}
              placeholder="Es. /mese · 8 lezioni"
              className={fieldInput}
            />
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
