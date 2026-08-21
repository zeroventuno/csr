"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CAL_META, type CalendarEntry } from "@/lib/blocks-types";
import { formatDayMonth } from "@/lib/format";

const WEEK = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
const MONTHS = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];

const pad = (n: number) => String(n).padStart(2, "0");

/** Ultimo giorno coperto da una voce (le chiusure durano più giorni). */
function entryEnd(e: CalendarEntry): string {
  return e.dateTo && e.dateTo > e.date ? e.dateTo : e.date;
}

export default function CalendarView({ entries }: { entries: CalendarEntry[] }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const byDay = useMemo(() => {
    const m = new Map<string, CalendarEntry[]>();
    const push = (date: string, e: CalendarEntry) => {
      const arr = m.get(date) || [];
      arr.push(e);
      m.set(date, arr);
    };
    entries.forEach((e) => {
      const end = entryEnd(e);
      if (end === e.date) {
        push(e.date, e);
        return;
      }
      // voce su più giorni: segnala ogni giorno dell'intervallo
      const [y, mo, d] = e.date.split("-").map(Number);
      const cur = new Date(Date.UTC(y, mo - 1, d));
      let guard = 0;
      while (cur.toISOString().slice(0, 10) <= end && guard++ < 400) {
        push(cur.toISOString().slice(0, 10), e);
        cur.setUTCDate(cur.getUTCDate() + 1);
      }
    });
    return m;
  }, [entries]);

  const cells = useMemo(() => {
    const firstDow = (new Date(year, month, 1).getDay() + 6) % 7;
    const days = new Date(year, month + 1, 0).getDate();
    const arr: (string | null)[] = [];
    for (let i = 0; i < firstDow; i++) arr.push(null);
    for (let d = 1; d <= days; d++)
      arr.push(`${year}-${pad(month + 1)}-${pad(d)}`);
    return arr;
  }, [year, month]);

  const monthEntries = useMemo(() => {
    const first = `${year}-${pad(month + 1)}-01`;
    const last = `${year}-${pad(month + 1)}-${pad(
      new Date(year, month + 1, 0).getDate()
    )}`;
    // include anche le voci su più giorni che si sovrappongono al mese
    return entries
      .filter((e) => e.date <= last && entryEnd(e) >= first)
      .sort((a, b) =>
        `${a.date} ${a.time || ""}` < `${b.date} ${b.time || ""}` ? -1 : 1
      );
  }, [entries, year, month]);

  const prev = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };
  const next = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
      {/* calendar grid */}
      <div className="rounded-[20px] border border-border bg-surface p-6 shadow-csr">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[24px] text-text">
            {MONTHS[month]} {year}
          </h3>
          <div className="flex gap-1.5">
            <button
              onClick={prev}
              className="grid h-9 w-9 place-items-center rounded-[9px] border border-border bg-surface-2 text-text transition hover:border-aqua"
            >
              <i className="ph ph-caret-left" />
            </button>
            <button
              onClick={next}
              className="grid h-9 w-9 place-items-center rounded-[9px] border border-border bg-surface-2 text-text transition hover:border-aqua"
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
          {cells.map((date, i) =>
            date === null ? (
              <div key={`e${i}`} />
            ) : (
              <div
                key={date}
                className="flex aspect-square flex-col gap-1 rounded-[9px] border p-1.5"
                style={{
                  borderColor:
                    date === todayStr ? "var(--aqua)" : "var(--border)",
                  background:
                    date === todayStr ? "rgba(0,180,216,.07)" : "var(--surface-2)",
                }}
              >
                <span className="text-[11.5px] font-semibold text-text">
                  {Number(date.split("-")[2])}
                </span>
                <div className="flex flex-wrap gap-0.5">
                  {(byDay.get(date) || []).slice(0, 4).map((e, k) => (
                    <span
                      key={k}
                      title={e.title}
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: CAL_META[e.type].color }}
                    />
                  ))}
                </div>
              </div>
            )
          )}
        </div>
        {/* legend */}
        <div className="mt-4 flex flex-wrap gap-4">
          {(["blocco", "chiusura", "evento", "avviso"] as const).map((t) => (
            <span
              key={t}
              className="flex items-center gap-1.5 text-[12px] text-muted"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: CAL_META[t].color }}
              />
              {CAL_META[t].label}
            </span>
          ))}
        </div>
      </div>

      {/* month list */}
      <div className="rounded-[20px] border border-border bg-surface p-6 shadow-csr">
        <h3 className="mb-4 text-[20px] text-text">In {MONTHS[month]}</h3>
        {monthEntries.length === 0 ? (
          <p className="text-muted">Nessun appuntamento questo mese.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {monthEntries.map((e, i) => {
              const meta = CAL_META[e.type];
              const inner = (
                <div className="flex gap-3">
                  <span
                    className="grid h-10 w-10 flex-none place-items-center rounded-[11px] text-lg text-white"
                    style={{ background: meta.color }}
                  >
                    <i className={`ph ${e.icon}`} />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[14.5px] font-semibold text-text">
                      {e.title}
                    </div>
                    <div className="text-[12.5px] text-muted">
                      {formatDayMonth(e.date)}
                      {entryEnd(e) !== e.date
                        ? ` – ${formatDayMonth(entryEnd(e))}`
                        : ""}
                      {e.time ? ` · ${e.time}` : ""}
                      {e.endTime ? `–${e.endTime}` : ""}
                      {e.subtitle ? ` · ${e.subtitle}` : ""}
                    </div>
                  </div>
                </div>
              );
              return e.href ? (
                <Link
                  key={i}
                  href={e.href}
                  className="rounded-[13px] border border-border bg-surface-2 p-3 transition hover:border-aqua"
                >
                  {inner}
                </Link>
              ) : (
                <div
                  key={i}
                  className="rounded-[13px] border border-border bg-surface-2 p-3"
                >
                  {inner}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
