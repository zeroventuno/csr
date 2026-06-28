"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadMedia, deleteMedia } from "@/lib/actions";
import type { Media, Role } from "@/lib/types";

const ICON_BY_TYPE: Record<Media["type"], string> = {
  image: "ph-image",
  video: "ph-video",
  pdf: "ph-file-pdf",
  doc: "ph-file-doc",
  other: "ph-file",
};

export default function MediaManager({
  items,
  role,
}: {
  items: Media[];
  role: Role;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const isAdmin = role === "admin";

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;
    setBusy(true);
    try {
      for (const file of list) {
        const fd = new FormData();
        fd.append("file", file);
        await uploadMedia(fd);
      }
      router.refresh();
    } catch (err: any) {
      alert(err?.message || "Errore durante il caricamento.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function onDelete(id: string, name: string) {
    if (!confirm(`Eliminare "${name}"?`)) return;
    try {
      await deleteMedia(id);
      router.refresh();
    } catch (err: any) {
      alert(err?.message || "Errore durante l'eliminazione.");
    }
  }

  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && uploadFiles(e.target.files)}
      />

      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          if (e.dataTransfer.files) uploadFiles(e.dataTransfer.files);
        }}
        className="mb-[18px] cursor-pointer rounded-[16px] border-2 border-dashed bg-surface p-[34px] text-center transition"
        style={{ borderColor: drag ? "var(--aqua)" : "var(--border)" }}
      >
        <span className="inline-grid h-[60px] w-[60px] place-items-center rounded-[16px] bg-surface-2 text-3xl text-aqua">
          <i className={`ph ${busy ? "ph-spinner" : "ph-cloud-arrow-up"}`} />
        </span>
        <div className="head mt-3 text-2xl font-bold text-text">
          {busy ? "Caricamento in corso…" : "Trascina i file qui"}
        </div>
        <div className="mt-1 text-[13.5px] text-muted">
          oppure <span className="font-bold text-aqua">sfoglia</span> · JPG, PNG,
          PDF, MP4 — max 12MB
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-[16px] border border-border bg-surface p-12 text-center text-muted">
          Nessun file caricato.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
          {items.map((m) => (
            <div
              key={m.id}
              className="group relative overflow-hidden rounded-[13px] border border-border bg-surface transition hover:-translate-y-0.5 hover:shadow-csr"
            >
              <div className="relative grid aspect-square place-items-center bg-gradient-to-br from-blue to-aqua text-3xl text-white/70">
                {m.type === "image" && m.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.url}
                    alt={m.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <i className={`ph ${ICON_BY_TYPE[m.type]}`} />
                )}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-[rgba(6,18,31,.55)] opacity-0 transition group-hover:opacity-100">
                  {m.url && (
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Visualizza"
                      className="grid h-[34px] w-[34px] place-items-center rounded-[9px] bg-white/90 text-[15px] text-blue-deep"
                    >
                      <i className="ph ph-eye" />
                    </a>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => onDelete(m.id, m.name)}
                      aria-label="Elimina"
                      className="grid h-[34px] w-[34px] place-items-center rounded-[9px] bg-white/90 text-[15px] text-red"
                    >
                      <i className="ph ph-trash" />
                    </button>
                  )}
                </div>
              </div>
              <div className="px-[11px] py-[9px]">
                <div className="truncate text-xs text-text">{m.name}</div>
                <div className="text-[10.5px] text-muted">{m.size}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
