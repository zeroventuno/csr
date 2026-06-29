"use client";

import { useState } from "react";
import Link from "next/link";
import type { Location } from "@/lib/types";

export default function LocationSwitcher({
  locations,
}: {
  locations: Location[];
}) {
  const [active, setActive] = useState(0);
  const loc = locations[active] || locations[0];
  if (!loc) return null;

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
                aggiornato in tempo reale
              </div>
            </div>
            <div className="mt-4 h-2.5 overflow-hidden rounded-md bg-bg">
              <div
                className="h-full rounded-md bg-gradient-to-r from-blue to-aqua transition-[width] duration-500"
                style={{ width: `${loc.pool}%` }}
              />
            </div>
            <div className="mt-2.5 font-mono text-[11px] text-muted">
              [ widget live · src: pool-availability/{loc.id} ]
            </div>
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
