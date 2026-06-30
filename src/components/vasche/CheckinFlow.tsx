"use client";

import { useEffect, useState } from "react";
import { checkin, checkout } from "@/lib/vasche";
import { PACES, poolLabel, type Pace, type CheckinResult } from "@/lib/vasche-types";

interface PoolLite {
  id: string;
  name: string;
  side: string | null;
  lengthMeters: number;
}

type Step = "pool" | "pace" | "confirm" | "success" | "error";

export default function CheckinFlow({ pools }: { pools: PoolLite[] }) {
  const [step, setStep] = useState<Step>("pool");
  const [pool, setPool] = useState<PoolLite | null>(null);
  const [pace, setPace] = useState<Pace | null>(null);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<CheckinResult | null>(null);

  function reset() {
    setStep("pool");
    setPool(null);
    setPace(null);
    setResult(null);
  }

  // auto-reset dopo successo (kiosk condiviso)
  useEffect(() => {
    if (step !== "success") return;
    const t = setTimeout(reset, 25000);
    return () => clearTimeout(t);
  }, [step]);

  async function confirm() {
    if (!pool || !pace) return;
    setPending(true);
    const r = await checkin(pool.id, pace);
    setPending(false);
    setResult(r);
    setStep(r.ok ? "success" : "error");
  }

  async function doCheckout() {
    if (result?.checkinId) await checkout(result.checkinId);
    reset();
  }

  const tile =
    "flex flex-col items-center justify-center gap-3 rounded-[24px] border-2 bg-white/[0.06] p-8 text-white transition active:scale-[0.98]";

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-deep to-blue px-6 py-8 text-white">
      {/* header */}
      <div className="mx-auto flex w-full max-w-[760px] items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-[12px] bg-gradient-to-br from-blue to-aqua text-2xl">
            <i className="ph-fill ph-waves" />
          </span>
          <div className="leading-tight">
            <div className="head text-xl font-bold">CENTRO SPORTIVO ROERO</div>
            <div className="text-[11px] tracking-[0.2em] text-aqua-soft">
              CHECK-IN CORSIE
            </div>
          </div>
        </div>
        {step !== "pool" && step !== "success" && (
          <button
            onClick={() => (step === "pace" ? setStep("pool") : setStep("pace"))}
            className="flex items-center gap-2 rounded-[12px] border border-white/30 px-4 py-2.5 text-sm font-semibold"
          >
            <i className="ph ph-arrow-left" /> Indietro
          </button>
        )}
      </div>

      <div className="mx-auto flex w-full max-w-[760px] flex-1 flex-col justify-center py-8">
        {/* STEP 1 — PISCINA */}
        {step === "pool" && (
          <div>
            <Stepline n={1} t="Scegli la vasca" />
            <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {pools.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setPool(p);
                    setStep("pace");
                  }}
                  className={`${tile} border-white/25`}
                >
                  <i className="ph ph-swimming-pool text-5xl text-aqua-soft" />
                  <span className="head text-2xl font-bold">
                    {poolLabel(p.name, p.side)}
                  </span>
                  <span className="text-sm text-white/70">{p.lengthMeters} metri</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2 — RITMO */}
        {step === "pace" && (
          <div>
            <Stepline n={2} t="Scegli il ritmo" />
            <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {PACES.map((pc) => (
                <button
                  key={pc.id}
                  onClick={() => {
                    setPace(pc.id);
                    setStep("confirm");
                  }}
                  className={`${tile} border-white/25`}
                >
                  <i className={`ph ${pc.icon} text-5xl text-aqua-soft`} />
                  <span className="head text-2xl font-bold">{pc.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3 — CONFERMA */}
        {step === "confirm" && pool && pace && (
          <div className="text-center">
            <Stepline n={3} t="Conferma l'ingresso" center />
            <div className="mx-auto mt-8 max-w-[460px] rounded-[24px] border border-white/20 bg-white/[0.06] p-8">
              <div className="text-white/70">Vasca</div>
              <div className="head text-3xl font-extrabold">
                {poolLabel(pool.name, pool.side)} · {pool.lengthMeters}m
              </div>
              <div className="mt-5 text-white/70">Ritmo</div>
              <div className="head text-3xl font-extrabold text-aqua-soft">
                {PACES.find((x) => x.id === pace)?.label}
              </div>
              <p className="mt-5 text-sm text-white/60">
                La corsia con più posti liberi verrà assegnata automaticamente.
              </p>
            </div>
            <button
              onClick={confirm}
              disabled={pending}
              className="mx-auto mt-7 flex h-16 w-full max-w-[460px] items-center justify-center gap-3 rounded-[16px] bg-aqua text-xl font-bold text-[#06121F] transition active:scale-[0.98] disabled:opacity-70"
            >
              <i className={`ph ${pending ? "ph-spinner" : "ph-check-circle"} text-2xl`} />
              {pending ? "Assegnazione…" : "Conferma ingresso"}
            </button>
          </div>
        )}

        {/* SUCCESSO */}
        {step === "success" && result?.ok && (
          <div className="text-center">
            <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-green text-5xl text-white">
              <i className="ph-fill ph-check" />
            </div>
            <h1 className="head mt-6 text-5xl font-extrabold">Sei in acqua!</h1>
            <div className="mx-auto mt-6 max-w-[460px] rounded-[24px] border border-white/20 bg-white/[0.06] p-8">
              <div className="text-white/70">La tua corsia</div>
              <div className="head text-[64px] font-extrabold leading-none text-aqua-soft">
                {result.laneNumber}
              </div>
              <div className="mt-2 text-lg">
                {poolLabel(result.poolName!, result.side ?? null)} ·{" "}
                {PACES.find((x) => x.id === result.pace)?.label}
              </div>
              <div className="mt-3 inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm">
                {result.active}/{result.capacity} in corsia
              </div>
            </div>
            <div className="mx-auto mt-7 flex w-full max-w-[460px] flex-col gap-3">
              <button
                onClick={doCheckout}
                className="flex h-14 items-center justify-center gap-2 rounded-[16px] border border-white/30 bg-white/[0.06] text-lg font-bold"
              >
                <i className="ph ph-sign-out" /> Registra uscita
              </button>
              <button
                onClick={reset}
                className="flex h-14 items-center justify-center gap-2 rounded-[16px] bg-aqua text-lg font-bold text-[#06121F]"
              >
                <i className="ph ph-plus" /> Nuovo ingresso
              </button>
            </div>
          </div>
        )}

        {/* ERRORE / COMPLETO */}
        {step === "error" && (
          <div className="text-center">
            <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-red text-5xl text-white">
              <i className="ph ph-x" />
            </div>
            <h1 className="head mt-6 text-4xl font-extrabold">Non disponibile</h1>
            <p className="mx-auto mt-3 max-w-[420px] text-white/80">
              {result?.error || "Riprova."}
            </p>
            <button
              onClick={reset}
              className="mx-auto mt-7 flex h-14 w-full max-w-[460px] items-center justify-center gap-2 rounded-[16px] bg-aqua text-lg font-bold text-[#06121F]"
            >
              <i className="ph ph-arrow-counter-clockwise" /> Ricomincia
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Stepline({ n, t, center }: { n: number; t: string; center?: boolean }) {
  return (
    <div className={center ? "text-center" : ""}>
      <span className="text-sm font-bold uppercase tracking-[0.16em] text-aqua-soft">
        Passo {n} di 3
      </span>
      <h1 className="head mt-1 text-4xl font-extrabold sm:text-5xl">{t}</h1>
    </div>
  );
}
