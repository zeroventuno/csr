"use client";

import { useState } from "react";
import { matchesLocation } from "@/lib/loc";

export interface Session {
  name: string;
  instructor: string;
  schedule: string;
  price: string;
  priceNote: string;
  locationIds: string[];
  locationLabel: string;
}
export interface Cat {
  id: string;
  icon: string;
  title: string;
  age: string;
  intro: string;
  sessions: Session[];
}

const FAQ = [
  {
    q: "Come funziona l’iscrizione?",
    a: "L’iscrizione si effettua online o in segreteria. È richiesto un certificato medico di idoneità all’attività sportiva non agonistica.",
  },
  {
    q: "Posso fare una lezione di prova?",
    a: "Sì, è possibile prenotare una lezione di prova gratuita per la maggior parte dei corsi, salvo disponibilità di posti.",
  },
  {
    q: "Cosa devo portare?",
    a: "Costume, cuffia obbligatoria, accappatoio e ciabatte. La cuffia è acquistabile anche in reception.",
  },
  {
    q: "Sono previsti sconti famiglia?",
    a: "Sì, applichiamo uno sconto del 10% dal secondo iscritto dello stesso nucleo familiare.",
  },
];

export default function CoursesBrowser({
  categories,
  locations,
  initialCat,
  initialSede,
}: {
  categories: Cat[];
  locations: { id: string; name: string }[];
  initialCat?: string;
  initialSede?: string;
}) {
  const initialIndex = Math.max(
    0,
    categories.findIndex((c) => c.id === initialCat)
  );
  const [tab, setTab] = useState(initialIndex === -1 ? 0 : initialIndex);
  const [faq, setFaq] = useState(0);
  const [sede, setSede] = useState<string>(
    initialSede && locations.some((l) => l.id === initialSede)
      ? initialSede
      : "Tutte"
  );

  const cur = categories[tab] || categories[0];
  const curSessions =
    sede === "Tutte"
      ? cur.sessions
      : cur.sessions.filter((s) => matchesLocation(s.locationIds, sede));

  return (
    <section className="mx-auto max-w-site px-6 pb-20 pt-10">
      <div className="grid grid-cols-1 gap-9 lg:grid-cols-[260px_1fr]">
        {/* TAB NAV */}
        <nav className="flex flex-row gap-1.5 overflow-x-auto lg:sticky lg:top-24 lg:flex-col lg:self-start lg:overflow-visible">
          {categories.map((c, i) => {
            const on = i === tab;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setTab(i);
                  setFaq(0);
                }}
                className="flex flex-none items-center gap-3 rounded-[12px] border px-[15px] py-[13px] text-left text-[15px] font-semibold transition hover:-translate-y-0.5"
                style={{
                  background: on ? "var(--aqua)" : "var(--surface)",
                  color: on ? "#06121F" : "var(--text)",
                  borderColor: on ? "var(--aqua)" : "var(--border)",
                }}
              >
                <i className={`ph ${c.icon} text-xl`} />
                {c.title}
              </button>
            );
          })}
        </nav>

        {/* DETAIL */}
        <div>
          <div className="flex flex-wrap items-start gap-5 rounded-[20px] border border-border bg-surface p-7">
            <span className="grid h-16 w-16 place-items-center rounded-[16px] bg-bg text-[34px] text-aqua">
              <i className={`ph ${cur.icon}`} />
            </span>
            <div className="min-w-[220px] flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-[36px] text-text">{cur.title}</h2>
                <span className="rounded-[7px] bg-aqua-soft px-[11px] py-1 text-xs font-bold text-blue">
                  {cur.age}
                </span>
              </div>
              <p className="mt-2.5 max-w-[620px] text-base leading-[1.6] text-muted">
                {cur.intro}
              </p>
            </div>
            <a
              href="mailto:info@centrosportivoroero.it?subject=Iscrizione%20corso"
              className="flex h-[50px] items-center gap-2 whitespace-nowrap rounded-[12px] bg-aqua px-[22px] text-[15px] font-bold text-[#06121F] transition hover:-translate-y-0.5"
            >
              Iscriviti ora
              <i className="ph ph-arrow-right" />
            </a>
          </div>

          {/* SEDE FILTER */}
          <div className="mt-[18px] flex flex-wrap items-center gap-2">
            <span className="mr-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-muted">
              <i className="ph ph-map-pin" />
              Sede
            </span>
            {[{ id: "Tutte", name: "Tutte" }, ...locations].map((l) => {
              const on = sede === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => setSede(l.id)}
                  className="h-[34px] rounded-[10px] border px-3.5 text-[13px] font-semibold transition hover:-translate-y-0.5"
                  style={{
                    background: on ? "var(--aqua)" : "var(--surface)",
                    color: on ? "#06121F" : "var(--text)",
                    borderColor: on ? "var(--aqua)" : "var(--border)",
                  }}
                >
                  {l.name}
                </button>
              );
            })}
          </div>

          {/* SESSIONS */}
          <div className="mt-3.5 flex flex-col gap-3">
            {curSessions.length === 0 ? (
              <div className="rounded-[16px] border border-border bg-surface p-8 text-center text-muted">
                Nessuna sessione per questa categoria nella sede selezionata.
              </div>
            ) : (
              curSessions.map((s, i) => (
                <div
                  key={i}
                  className="grid grid-cols-1 items-center gap-5 rounded-[16px] border border-border bg-surface px-[22px] py-5 transition duration-300 hover:border-aqua hover:shadow-csr md:grid-cols-[1.4fr_1fr_1fr_auto]"
                >
                  <div>
                    <div className="head text-[21px] font-bold text-text">
                      {s.name}
                    </div>
                    <div className="mt-[3px] flex items-center gap-1.5 text-[13px] text-muted">
                      <i className="ph ph-user-circle" />
                      {s.instructor} · {s.locationLabel}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text">
                    <i className="ph ph-calendar-dots text-aqua" />
                    {s.schedule}
                  </div>
                  <div>
                    <div className="head text-[26px] font-extrabold text-text">
                      {s.price}
                    </div>
                    <div className="text-xs text-muted">{s.priceNote}</div>
                  </div>
                  <a
                    href={`mailto:info@centrosportivoroero.it?subject=${encodeURIComponent(
                      "Prenotazione " + s.name
                    )}`}
                    className="flex h-11 items-center justify-self-start gap-[7px] rounded-[11px] border border-border bg-bg px-[18px] text-sm font-bold text-text transition hover:-translate-y-0.5 md:justify-self-end"
                  >
                    Prenota
                    <i className="ph ph-arrow-right" />
                  </a>
                </div>
              ))
            )}
          </div>

          {/* FAQ */}
          <h3 className="mb-3.5 mt-[42px] text-[28px] text-text">
            Domande frequenti
          </h3>
          <div className="flex flex-col gap-2.5">
            {FAQ.map((f, i) => {
              const open = faq === i;
              return (
                <div
                  key={i}
                  className="overflow-hidden rounded-[14px] border border-border bg-surface"
                >
                  <button
                    onClick={() => setFaq(open ? -1 : i)}
                    className="flex w-full items-center justify-between gap-3.5 px-5 py-[18px] text-left text-base font-semibold text-text"
                  >
                    {f.q}
                    <i
                      className={`ph ${
                        open ? "ph-minus" : "ph-plus"
                      } flex-none text-xl text-aqua`}
                    />
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-300"
                    style={{
                      maxHeight: open ? "240px" : "0px",
                      opacity: open ? 1 : 0,
                    }}
                  >
                    <p className="px-5 pb-[18px] text-[15px] leading-[1.6] text-muted">
                      {f.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
