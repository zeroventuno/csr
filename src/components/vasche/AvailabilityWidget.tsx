"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getPublicAvailability } from "@/lib/vasche";
import {
  paceIcon,
  paceLabel,
  poolLabel,
  type AvailabilitySnapshot,
} from "@/lib/vasche-types";

const REFRESH_MS = 20000;

function agoLabel(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 10) return "ora";
  if (s < 60) return `${s} sec fa`;
  const m = Math.floor(s / 60);
  return `${m} min fa`;
}

export default function AvailabilityWidget({
  locationId,
}: {
  locationId: string;
}) {
  const [snap, setSnap] = useState<AvailabilitySnapshot | null>(null);
  const [fetchedAt, setFetchedAt] = useState<number>(Date.now());
  const [, setTick] = useState(0);
  const loadingRef = useRef(false);

  const load = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      const s = await getPublicAvailability(locationId);
      setSnap(s);
      setFetchedAt(Date.now());
    } catch {
      /* mantiene l'ultimo snapshot */
    } finally {
      loadingRef.current = false;
    }
  }, [locationId]);

  useEffect(() => {
    load();
    const iv = setInterval(load, REFRESH_MS);
    const tick = setInterval(() => setTick((t) => t + 1), 5000);
    return () => {
      clearInterval(iv);
      clearInterval(tick);
    };
  }, [load]);

  // niente da mostrare se il sistema non è attivo o non ci sono vasche
  if (snap && (!snap.ok || snap.pools.length === 0)) return null;

  return (
    <section className="mx-auto max-w-site px-6 pb-6">
      <div className="rounded-[20px] border border-border bg-surface p-7 shadow-csr md:p-9">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-aqua">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aqua opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-aqua" />
              </span>
              In tempo reale
            </span>
            <h2 className="mt-1.5 text-[34px] text-text">Disponibilità corsie</h2>
          </div>
          <div className="flex items-center gap-3 text-[13px] text-muted">
            <span>
              <i className="ph ph-clock-countdown" />{" "}
              aggiornato {agoLabel(Date.now() - fetchedAt)}
            </span>
            <button
              onClick={load}
              aria-label="Aggiorna"
              className="grid h-9 w-9 place-items-center rounded-[10px] border border-border bg-surface-2 text-text transition hover:border-aqua"
            >
              <i className="ph ph-arrows-clockwise" />
            </button>
          </div>
        </div>

        {!snap ? (
          <div className="mt-6 text-muted">Caricamento…</div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {snap.pools.map((p) => (
              <div
                key={p.id}
                className="rounded-[16px] border border-border bg-surface-2 p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="head text-[20px] font-bold text-text">
                    {poolLabel(p.name, p.side)}
                  </div>
                  <span className="rounded-[6px] bg-bg px-2 py-0.5 text-[11px] font-bold text-muted">
                    {p.lengthMeters}m
                  </span>
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  {p.paces.map((pc) => {
                    const full = pc.free <= 0;
                    return (
                      <div
                        key={pc.pace}
                        className="flex items-center justify-between rounded-[11px] border px-3 py-2.5"
                        style={{
                          borderColor: full ? "var(--red)" : "var(--border)",
                          background: full ? "rgba(214,72,92,.08)" : "var(--surface)",
                        }}
                      >
                        <span className="flex items-center gap-2 text-[14px] font-semibold text-text">
                          <i className={`ph ${paceIcon(pc.pace)} text-aqua`} />
                          {paceLabel(pc.pace)}
                        </span>
                        <span
                          className="flex items-center gap-1.5 text-[13px] font-bold"
                          style={{ color: full ? "var(--red)" : "var(--green)" }}
                        >
                          {full ? (
                            "Completo"
                          ) : (
                            <>
                              <span className="head text-[20px] leading-none">
                                {pc.free}
                              </span>
                              <span className="text-muted">/ {pc.total} liberi</span>
                            </>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="mt-5 text-[12px] text-muted">
          I posti si riferiscono al nuoto libero/allenamento nelle corsie dedicate.
          Le lezioni con orario fisso non sono incluse.
        </p>
      </div>
    </section>
  );
}
