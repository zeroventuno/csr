"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getReceptionData, adminAdjust } from "@/lib/vasche";
import {
  paceLabel,
  poolLabel,
  type ReceptionSnapshot,
} from "@/lib/vasche-types";

const REFRESH_MS = 10000;

export default function ReceptionPanel() {
  const [snap, setSnap] = useState<ReceptionSnapshot | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const loadingRef = useRef(false);

  const load = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      setSnap(await getReceptionData("cuneo"));
    } catch {
      /* keep */
    } finally {
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    load();
    const iv = setInterval(load, REFRESH_MS);
    return () => clearInterval(iv);
  }, [load]);

  async function adjust(laneId: string, delta: 1 | -1) {
    setBusy(laneId + delta);
    const r = await adminAdjust(laneId, delta);
    if (!r.ok && r.error) alert(r.error);
    await load();
    setBusy(null);
  }

  if (snap && !snap.ok) {
    return (
      <div className="rounded-[16px] border border-border bg-surface p-12 text-center text-muted">
        <i className="ph ph-wrench mb-2 block text-3xl text-aqua" />
        Il sistema corsie non è ancora configurato (esegui{" "}
        <code>supabase/vasche.sql</code>).
      </div>
    );
  }

  const barColor = (ratio: number) =>
    ratio >= 1 ? "var(--red)" : ratio >= 0.6 ? "var(--amber)" : "var(--green)";

  return (
    <div>
      {/* summary */}
      <div className="mb-5 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3 rounded-[16px] border border-border bg-surface px-5 py-4">
          <span className="grid h-12 w-12 place-items-center rounded-[12px] bg-surface-2 text-2xl text-aqua">
            <i className="ph ph-users" />
          </span>
          <div>
            <div className="head text-[32px] font-extrabold leading-none text-text">
              {snap?.totalInWater ?? "—"}
            </div>
            <div className="text-[12.5px] text-muted">persone in acqua</div>
          </div>
        </div>
        <div className="text-[13px] text-muted">
          <i className="ph ph-arrows-clockwise" /> aggiornamento automatico ogni 10s
        </div>
        <a
          href="/checkin"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex h-10 items-center gap-2 rounded-[11px] border border-border bg-surface px-4 text-sm font-semibold text-text transition hover:border-aqua"
        >
          <i className="ph ph-device-tablet" /> Apri kiosk check-in
        </a>
      </div>

      {!snap ? (
        <div className="text-muted">Caricamento…</div>
      ) : (
        <div className="flex flex-col gap-5">
          {snap.pools.map((pool) => (
            <div
              key={pool.id}
              className="rounded-[16px] border border-border bg-surface p-5"
            >
              <h3 className="mb-4 flex items-center gap-2 text-[20px] text-text">
                <i className="ph ph-swimming-pool text-aqua" />
                {poolLabel(pool.name, pool.side)}
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {pool.lanes.map((l) => {
                  const ratio = l.capacity ? l.active / l.capacity : 0;
                  return (
                    <div
                      key={l.id}
                      className="rounded-[13px] border border-border bg-surface-2 p-3.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-bg head text-[16px] font-extrabold text-text">
                            {l.laneNumber}
                          </span>
                          <span className="text-[12px] font-semibold uppercase tracking-[0.05em] text-muted">
                            {paceLabel(l.pace)}
                          </span>
                        </span>
                        <span className="head text-[18px] font-extrabold text-text">
                          {l.active}/{l.capacity}
                        </span>
                      </div>
                      <div className="mt-2.5 h-2 overflow-hidden rounded-md bg-bg">
                        <div
                          className="h-full rounded-md transition-all"
                          style={{
                            width: `${Math.min(100, ratio * 100)}%`,
                            background: barColor(ratio),
                          }}
                        />
                      </div>
                      <div className="mt-2.5 flex gap-2">
                        <button
                          onClick={() => adjust(l.id, -1)}
                          disabled={l.active <= 0 || busy === l.id + -1}
                          aria-label="Rimuovi"
                          className="grid h-9 flex-1 place-items-center rounded-[9px] border border-border bg-surface text-text transition hover:border-aqua disabled:opacity-40"
                        >
                          <i className="ph ph-minus" />
                        </button>
                        <button
                          onClick={() => adjust(l.id, 1)}
                          disabled={l.active >= l.capacity || busy === l.id + 1}
                          aria-label="Aggiungi"
                          className="grid h-9 flex-1 place-items-center rounded-[9px] border border-border bg-surface text-text transition hover:border-aqua disabled:opacity-40"
                        >
                          <i className="ph ph-plus" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
