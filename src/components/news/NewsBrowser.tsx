"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Category } from "@/lib/types";
import { matchesLocation } from "@/lib/loc";

export interface NewsCard {
  slug: string;
  title: string;
  category: Category;
  locationIds: string[];
  locationLabel: string;
  date: string; // gia' formattata
  excerpt: string;
  icon: string;
  coverImage?: string;
}

const CATS = ["Tutte", "Corsi", "Eventi", "Avvisi", "Comunicati"] as const;
const PER_PAGE = 9;

export default function NewsBrowser({
  items,
  locations,
}: {
  items: NewsCard[];
  locations: { id: string; name: string }[];
}) {
  const [cat, setCat] = useState<string>("Tutte");
  const [loc, setLoc] = useState<string>("Tutte");
  const [page, setPage] = useState(1);

  const locFilters = useMemo(
    () => [{ id: "Tutte", name: "Tutte" }, ...locations],
    [locations]
  );

  const filtered = useMemo(
    () =>
      items.filter(
        (n) =>
          (cat === "Tutte" || n.category === cat) &&
          (loc === "Tutte" || matchesLocation(n.locationIds, loc))
      ),
    [items, cat, loc]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (safePage - 1) * PER_PAGE,
    safePage * PER_PAGE
  );

  const chip = (active: boolean) => ({
    background: active ? "var(--aqua)" : "var(--surface)",
    color: active ? "#06121F" : "var(--text)",
    borderColor: active ? "var(--aqua)" : "var(--border)",
  });

  return (
    <>
      {/* FILTERS */}
      <section className="mx-auto max-w-site px-6 pt-7">
        <div className="flex flex-col gap-3.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="mr-1 text-xs font-bold uppercase tracking-[0.08em] text-muted">
              Categoria
            </span>
            {CATS.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setCat(c);
                  setPage(1);
                }}
                className="h-[38px] rounded-[10px] border px-4 text-sm font-semibold transition hover:-translate-y-0.5"
                style={chip(cat === c)}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="mr-1 text-xs font-bold uppercase tracking-[0.08em] text-muted">
              Sede
            </span>
            {locFilters.map((l) => (
              <button
                key={l.id}
                onClick={() => {
                  setLoc(l.id);
                  setPage(1);
                }}
                className="h-[38px] rounded-[10px] border px-4 text-sm font-semibold transition hover:-translate-y-0.5"
                style={chip(loc === l.id)}
              >
                {l.name}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-[22px] flex items-center justify-between border-b border-border pb-3.5">
          <span className="text-sm text-muted">
            {filtered.length} articoli trovati
          </span>
          <span className="flex items-center gap-[7px] text-sm text-muted">
            <i className="ph ph-funnel" />
            Più recenti
          </span>
        </div>
      </section>

      {/* GRID */}
      <section className="mx-auto max-w-site px-6 pb-5 pt-7">
        {pageItems.length === 0 ? (
          <div className="rounded-[18px] border border-border bg-surface p-16 text-center text-muted">
            <i className="ph ph-binoculars mb-3 block text-4xl text-aqua" />
            Nessun articolo trovato per i filtri selezionati.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((n) => (
              <Link
                key={n.slug}
                href={`/news/${n.slug}`}
                className="group flex flex-col overflow-hidden rounded-[18px] border border-border bg-surface transition duration-300 hover:-translate-y-1.5 hover:border-aqua hover:shadow-csr"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-blue to-aqua">
                  {n.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={n.coverImage}
                      alt={n.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <>
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage:
                            "repeating-linear-gradient(120deg,rgba(255,255,255,.08) 0 2px,transparent 2px 22px)",
                        }}
                      />
                      <div className="absolute inset-0 grid place-items-center text-[56px] text-white/55">
                        <i className={`ph ${n.icon}`} />
                      </div>
                    </>
                  )}
                  <span className="absolute left-3.5 top-3.5 rounded-[7px] bg-aqua px-[11px] py-[5px] text-[11px] font-bold uppercase tracking-[0.04em] text-[#06121F]">
                    {n.category}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-[9px] p-5">
                  <div className="flex gap-3.5 text-[12.5px] font-medium text-muted">
                    <span>
                      <i className="ph ph-calendar-blank" /> {n.date}
                    </span>
                    <span>
                      <i className="ph ph-map-pin" /> {n.locationLabel}
                    </span>
                  </div>
                  <h3 className="text-[23px] leading-[1.08] text-text">
                    {n.title}
                  </h3>
                  <p className="flex-1 text-sm leading-[1.55] text-muted">
                    {n.excerpt}
                  </p>
                  <span className="flex items-center gap-[7px] text-sm font-bold text-aqua">
                    Leggi tutto
                    <i className="ph ph-arrow-right" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <section className="mx-auto flex max-w-site justify-center px-6 pb-[70px] pt-5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="grid h-11 w-11 place-items-center rounded-[11px] border border-border bg-surface text-muted disabled:opacity-40"
            >
              <i className="ph ph-caret-left" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className="h-11 w-11 rounded-[11px] border font-bold transition hover:-translate-y-0.5"
                style={chip(safePage === p)}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="grid h-11 w-11 place-items-center rounded-[11px] border border-border bg-surface text-text disabled:opacity-40"
            >
              <i className="ph ph-caret-right" />
            </button>
          </div>
        </section>
      )}
    </>
  );
}
