"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SlideOver, { fieldLabel, fieldInput, fieldArea } from "./SlideOver";
import {
  saveNews,
  deleteNews,
  toggleNewsPublished,
  uploadMedia,
} from "@/lib/actions";
import type { Category, Role, NewsInput } from "@/lib/types";

export interface NewsRow {
  id: string;
  title: string;
  category: Category;
  locationId: string;
  locationName: string;
  date: string;
  dateLabel: string;
  author: string;
  published: boolean;
  excerpt: string;
  content: string;
  coverImage?: string;
}

const CATS: Category[] = ["Corsi", "Eventi", "Avvisi", "Comunicati"];
const FILTERS = ["Tutte", "Pubblicati", "Bozze"] as const;

const RT_TOOLS = [
  { name: "Grassetto", icon: "ph-text-b", cmd: "bold" },
  { name: "Corsivo", icon: "ph-text-italic", cmd: "italic" },
  { name: "Sottolineato", icon: "ph-text-underline", cmd: "underline" },
  { name: "Titolo", icon: "ph-text-h-two", cmd: "formatBlock", val: "H2" },
  { name: "Elenco", icon: "ph-list-bullets", cmd: "insertUnorderedList" },
  { name: "Elenco numerato", icon: "ph-list-numbers", cmd: "insertOrderedList" },
  { name: "Link", icon: "ph-link", cmd: "createLink", val: "__prompt__" },
  { name: "Citazione", icon: "ph-quotes", cmd: "formatBlock", val: "BLOCKQUOTE" },
];

const emptyForm = {
  id: undefined as string | undefined,
  title: "",
  category: "Eventi" as Category,
  locationId: "all",
  excerpt: "",
  date: new Date().toISOString().slice(0, 10),
  coverImage: "",
  published: true,
};

export default function NewsManager({
  rows,
  locations,
  role,
}: {
  rows: NewsRow[];
  locations: { id: string; name: string }[];
  role: Role;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Tutte");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [initialContent, setInitialContent] = useState("");
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const isAdmin = role === "admin";

  const locOptions = [{ id: "all", name: "Tutte le sedi" }, ...locations];

  useEffect(() => {
    if (open && editorRef.current) {
      editorRef.current.innerHTML = initialContent;
    }
  }, [open, initialContent]);

  const filtered = rows.filter((r) =>
    filter === "Tutte"
      ? true
      : filter === "Pubblicati"
      ? r.published
      : !r.published
  );

  function openNew() {
    setForm(emptyForm);
    setInitialContent("<p></p>");
    setOpen(true);
  }
  function openEdit(r: NewsRow) {
    setForm({
      id: r.id,
      title: r.title,
      category: r.category,
      locationId: r.locationId,
      excerpt: r.excerpt,
      date: r.date,
      coverImage: r.coverImage || "",
      published: r.published,
    });
    setInitialContent(r.content || "<p></p>");
    setOpen(true);
  }

  function exec(cmd: string, val?: string) {
    editorRef.current?.focus();
    let value = val;
    if (val === "__prompt__") {
      value = window.prompt("URL del link:", "https://") || undefined;
      if (!value) return;
    }
    document.execCommand(cmd, false, value || undefined);
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const url = await uploadMedia(fd);
      setForm((f) => ({ ...f, coverImage: url }));
    } catch (err: any) {
      alert(err?.message || "Errore durante il caricamento.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function save() {
    if (!form.title.trim()) {
      alert("Inserisci un titolo.");
      return;
    }
    setPending(true);
    try {
      const payload: NewsInput = {
        id: form.id,
        title: form.title.trim(),
        category: form.category,
        locationId: form.locationId,
        excerpt: form.excerpt,
        content: editorRef.current?.innerHTML || "",
        coverImage: form.coverImage,
        published: form.published,
        date: form.date,
      };
      await saveNews(payload);
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      alert(err?.message || "Errore durante il salvataggio.");
    } finally {
      setPending(false);
    }
  }

  async function onToggle(id: string) {
    await toggleNewsPublished(id);
    router.refresh();
  }

  async function onDelete(id: string, title: string) {
    if (!confirm(`Eliminare definitivamente "${title}"?`)) return;
    try {
      await deleteNews(id);
      router.refresh();
    } catch (err: any) {
      alert(err?.message || "Errore durante l'eliminazione.");
    }
  }

  return (
    <div>
      <div className="mb-[18px] flex flex-wrap items-center justify-between gap-3.5">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const on = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="h-[38px] rounded-[10px] border px-3.5 text-[13.5px] font-semibold"
                style={{
                  background: on ? "var(--aqua)" : "var(--surface)",
                  color: on ? "#06121F" : "var(--text)",
                  borderColor: on ? "var(--aqua)" : "var(--border)",
                }}
              >
                {f}
              </button>
            );
          })}
        </div>
        <button
          onClick={openNew}
          className="flex h-[42px] items-center gap-2 rounded-[11px] bg-aqua px-[18px] text-sm font-bold text-[#06121F] transition hover:-translate-y-0.5"
        >
          <i className="ph ph-plus-circle text-lg" />
          Nuovo articolo
        </button>
      </div>

      <div className="overflow-hidden rounded-[16px] border border-border bg-surface">
        <div className="hidden grid-cols-[2.4fr_1fr_1fr_1fr_auto] gap-3.5 border-b border-border bg-surface-2 px-5 py-3.5 text-[11.5px] font-bold uppercase tracking-[0.06em] text-muted md:grid">
          <span>Titolo</span>
          <span>Categoria</span>
          <span>Sede</span>
          <span>Stato</span>
          <span>Azioni</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center text-muted">
            Nessun articolo per questo filtro.
          </div>
        ) : (
          filtered.map((r) => (
            <div
              key={r.id}
              className="grid grid-cols-1 items-center gap-3.5 border-b border-border px-5 py-[15px] transition last:border-0 hover:bg-surface-2 md:grid-cols-[2.4fr_1fr_1fr_1fr_auto]"
            >
              <div className="min-w-0">
                <div className="truncate text-[14.5px] font-semibold text-text">
                  {r.title}
                </div>
                <div className="mt-0.5 text-xs text-muted">
                  <i className="ph ph-calendar-blank" /> {r.dateLabel} · {r.author}
                </div>
              </div>
              <span className="justify-self-start rounded-[6px] bg-aqua-soft px-[9px] py-[3px] text-[12.5px] font-semibold text-blue">
                {r.category}
              </span>
              <span className="text-[13.5px] text-muted">{r.locationName}</span>
              <button
                onClick={() => onToggle(r.id)}
                className="flex h-7 items-center gap-1.5 justify-self-start rounded-[20px] px-2.5 text-xs font-bold"
                style={{
                  background: r.published
                    ? "rgba(31,157,107,.14)"
                    : "rgba(217,138,31,.16)",
                  color: r.published ? "var(--green)" : "var(--amber)",
                }}
              >
                <span className="h-[7px] w-[7px] rounded-full bg-current" />
                {r.published ? "Pubblicato" : "Bozza"}
              </button>
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
                    onClick={() => onDelete(r.id, r.title)}
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

      {/* EDITOR SLIDE-OVER */}
      <SlideOver
        open={open}
        onClose={() => setOpen(false)}
        title={form.id ? "Modifica articolo" : "Nuovo articolo"}
        subtitle="Compila i campi e pubblica o salva come bozza"
        footer={
          <>
            <div className="mr-auto flex items-center gap-2.5 text-[13.5px] text-text">
              <button
                onClick={() => setForm((f) => ({ ...f, published: !f.published }))}
                aria-label="Pubblica"
                className="relative h-[26px] w-[46px] rounded-[20px] transition"
                style={{
                  background: form.published ? "var(--green)" : "var(--border)",
                }}
              >
                <span
                  className="absolute top-[3px] h-5 w-5 rounded-full bg-white transition-all"
                  style={{ left: form.published ? "23px" : "3px" }}
                />
              </button>
              {form.published ? "Pubblica subito" : "Salva come bozza"}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="h-11 rounded-[11px] border border-border bg-surface px-[18px] font-semibold text-text"
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
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Titolo dell'articolo"
            className={fieldInput}
          />
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          <div>
            <label className={fieldLabel}>Categoria</label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value as Category }))
              }
              className={fieldInput}
            >
              {CATS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={fieldLabel}>Sede</label>
            <select
              value={form.locationId}
              onChange={(e) =>
                setForm((f) => ({ ...f, locationId: e.target.value }))
              }
              className={fieldInput}
            >
              {locOptions.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={fieldLabel}>Data</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className={fieldInput}
            />
          </div>
        </div>

        <div>
          <label className={fieldLabel}>Estratto</label>
          <textarea
            value={form.excerpt}
            onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
            rows={2}
            placeholder="Breve riassunto mostrato nelle anteprime"
            className={fieldArea}
          />
        </div>

        <div>
          <label className={fieldLabel}>Immagine di copertina</label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={onFile}
            className="hidden"
          />
          {form.coverImage ? (
            <div className="mt-[7px] overflow-hidden rounded-[12px] border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.coverImage}
                alt="copertina"
                className="h-40 w-full object-cover"
              />
              <div className="flex items-center justify-between bg-surface-2 px-3 py-2 text-xs text-muted">
                <span className="truncate">{form.coverImage}</span>
                <button
                  onClick={() => setForm((f) => ({ ...f, coverImage: "" }))}
                  className="font-semibold text-red"
                >
                  Rimuovi
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="mt-[7px] w-full rounded-[12px] border-2 border-dashed border-border bg-surface-2 px-4 py-5 text-center text-muted transition hover:border-aqua disabled:opacity-60"
            >
              <i className="ph ph-image text-[26px] text-aqua" />
              <div className="mt-1.5 text-[13px]">
                {uploading ? "Caricamento…" : "Carica un'immagine"}
              </div>
            </button>
          )}
        </div>

        <div>
          <label className={fieldLabel}>Contenuto</label>
          <div className="mt-[7px] overflow-hidden rounded-[12px] border border-border bg-surface-2">
            <div className="flex flex-wrap gap-0.5 border-b border-border p-2">
              {RT_TOOLS.map((t) => (
                <button
                  key={t.name}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    exec(t.cmd, t.val);
                  }}
                  aria-label={t.name}
                  title={t.name}
                  className="grid h-[34px] w-[34px] place-items-center rounded-[8px] text-base text-text transition hover:bg-border"
                >
                  <i className={`ph ${t.icon}`} />
                </button>
              ))}
            </div>
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              data-placeholder="Scrivi qui il contenuto dell'articolo…"
              className="min-h-[180px] px-3.5 py-3.5 text-[15px] leading-[1.6] text-text outline-none [&_h2]:my-2 [&_h2]:text-2xl [&_h2]:font-bold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-2 [&_blockquote]:border-aqua [&_blockquote]:pl-3 [&_blockquote]:italic"
            />
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
