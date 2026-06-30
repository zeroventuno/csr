"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Location } from "@/lib/types";
import { getPublicAvailability } from "@/lib/vasche";
import type { AvailabilitySnapshot } from "@/lib/vasche-types";
import { getNextNotice } from "@/lib/blocks";
import { CAL_META, type CalendarEntry } from "@/lib/blocks-types";
import { formatDayMonth } from "@/lib/format";

function ago(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 10) return "ora";
  if (s < 60) return `${s} sec fa`;
  return `${Math.floor(s / 60)} min fa`;
}

export default function LocationSwitcher({
  locations,
}: {
  locations: Location[];
}) {
  const [active, setActive] = useState(0);
  const [avail, setAvail] = useState<AvailabilitySnapshot | null>(null);
  const [notice, setNotice] = useState<CalendarEntry | null>(null);
  const [fetchedAt, setFetchedAt] = useState(Date.now());
  const [, setTick] = useState(0);

  const loc = locations[active] || locations[0];
  const locId = loc?.id;

  // prossimo avviso datato (evento/blocco) per la sede attiva
  useEffect(() => {
    if (!locId) return;
    let alive = true;
    setNotice(null);
    getNextNotice(locId)
      .then((n) => alive && setNotice(n))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [locId]);

  // Disponibilità reale (sistema corsie) per la sede attiva — polling 20s.
  useEffect(() => {
    if (!locId) return;
    let alive = true;
    setAvail(null);
    const run = async () => {
      try {
        const s = await getPublicAvailability(locId);
        if (alive) {
          setAvail(s);
          setFetchedAt(Date.now());
        }
      } catch {
        /* mantiene fallback statico */
      }
    };
    run();
    const iv = setInterval(run, 20000);
    const tick = setInterval(() => alive && setTick((t) => t + 1), 5000);
    return () => {
      alive = false;
      clearInterval(iv);
      clearInterval(tick);
    };
  }, [locId]);

  if (!loc) return null;

  const live =
    avail && avail.ok && avail.pools.length > 0 ? avail : null;
  const totalFree = live
    ? live.pools.reduce((s, p) => s + p.free, 0)
    : 0;
  const totalCap = live ? live.pools.reduce((s, p) => s + p.total, 0) : 0;
  const freePct = totalCap > 0 ? Math.round((totalFree / totalCap) * 100) : 0;

  return (
    <section id="info" className="relative z-10 mx-auto -mt-[44px] max-w-site px-6">
      <div className="overflow-hidden rounded-[20px] border border-border bg-surface shadow-csr">
        {/* pills */}
        <div className="flex gap-2 overflow-x-auto border-b border-border p-3.5">
          {locations.map((l, i) => {
            const on = i === active;
            return (
              <button
                key={l.id}
                onClick={() => setActive(i)}
                className="flex h-11 flex-none items-center gap-2 rounded-[11px] border px-5 text-[15px] font-bold transition hover:-translate-y-0.5"
                style={{
                  background: on ? "var(--aqua)" : "transparent",
                  color: on ? "#06121F" : "var(--text)",
                  borderColor: on ? "var(--aqua)" : "var(--border)",
                }}
              >
                <i className="ph ph-map-pin" />
                {l.name}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-px bg-border lg:grid-cols-[1.1fr_1fr_1fr]">
          {/* pool availability */}
          <div className="bg-surface px-[26px] py-6">
            {live ? (
              <>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aqua opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-aqua" />
                  </span>
                  Corsie libere · in tempo reale
                </div>
                <div className="mt-3.5 flex items-end gap-3.5">
                  <div className="head text-[54px] font-extrabold leading-[0.9] text-text">
                    {totalFree}
                  </div>
                  <div className="pb-2 text-[13px] text-muted">
                    posti liberi
                    <br />
                    su {totalCap} totali
                  </div>
                </div>
                <div className="mt-4 h-2.5 overflow-hidden rounded-md bg-bg">
                  <div
                    className="h-full rounded-md bg-gradient-to-r from-blue to-aqua transition-[width] duration-500"
                    style={{ width: `${freePct}%` }}
                  />
                </div>
                <Link
                  href={`/sedi/${loc.id}`}
                  className="mt-2.5 inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-muted transition hover:text-aqua"
                >
                  aggiornato {ago(Date.now() - fetchedAt)} · dettagli
                  <i className="ph ph-arrow-right" />
                </Link>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                  <i className="ph ph-drop text-aqua" />
                  Disponibilità Vasche
                </div>
                <div className="mt-3.5 flex items-end gap-3.5">
                  <div className="head text-[54px] font-extrabold leading-[0.9] text-text">
                    {loc.pool}
                    <span className="text-2xl text-muted">%</span>
                  </div>
                  <div className="pb-2 text-[13px] text-muted">
                    posti liberi
                    <br />
                    indicativo
                  </div>
                </div>
                <div className="mt-4 h-2.5 overflow-hidden rounded-md bg-bg">
                  <div
                    className="h-full rounded-md bg-gradient-to-r from-blue to-aqua transition-[width] duration-500"
                    style={{ width: `${loc.pool}%` }}
                  />
                </div>
                <Link
                  href={`/sedi/${loc.id}`}
                  className="mt-2.5 inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-muted transition hover:text-aqua"
                >
                  Pagina della sede
                  <i className="ph ph-arrow-right" />
                </Link>
              </>
            )}
          </div>

          {/* hours */}
          <div className="bg-surface px-[26px] py-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
              <i className="ph ph-clock text-aqua" />
              Orari di Apertura
            </div>
            <div className="mt-3.5 text-[15px] leading-[1.8] text-text">
              {loc.hours}
            </div>
            {notice && (
              <Link
                href={notice.href || `/sedi/${loc.id}#calendario`}
                className="mt-3 flex items-start gap-2 rounded-[11px] border px-3 py-2 transition hover:border-aqua"
                style={{ borderColor: "var(--border)" }}
              >
                <i
                  className={`ph ${notice.icon} mt-0.5`}
                  style={{ color: CAL_META[notice.type].color }}
                />
                <span className="text-[12.5px] leading-[1.35] text-text">
                  <b>{formatDayMonth(notice.date)}</b>
                  {notice.time ? `, ${notice.time}` : ""} — {notice.title}
                </span>
              </Link>
            )}
          </div>

          {/* contact */}
          <div className="bg-surface px-[26px] py-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
              <i className="ph ph-map-pin text-aqua" />
              {loc.name}
            </div>
            <div className="mt-3.5 text-[15px] leading-[1.6] text-text">
              {loc.address}
            </div>
            <a
              href={`tel:${loc.phone.replace(/\s/g, "")}`}
              className="mt-3.5 inline-flex items-center gap-2 text-base font-bold text-aqua transition hover:opacity-80"
            >
              <i className="ph ph-phone" />
              {loc.phone}
            </a>
            {loc.email && (
              <a
                href={`mailto:${loc.email}`}
                className="mt-2 flex items-center gap-2 break-all text-[13px] font-medium text-muted transition hover:text-aqua"
              >
                <i className="ph ph-envelope-simple" />
                {loc.email}
              </a>
            )}
            <Link
              href={`/sedi/${loc.id}`}
              className="mt-3 flex items-center gap-1.5 text-[13px] font-semibold text-muted transition hover:text-aqua"
            >
              Pagina della sede
              <i className="ph ph-arrow-right" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
