"use client";

import { useEffect, useState } from "react";

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem("csr-cookie") !== "ok") setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem("csr-cookie", "ok");
    } catch {}
  };

  if (!show) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[80] flex justify-center p-4">
      <div className="pointer-events-auto flex w-full max-w-[760px] flex-wrap items-center gap-[18px] rounded-[18px] border border-border bg-surface p-[22px] shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <span className="text-3xl text-aqua">
          <i className="ph ph-cookie" />
        </span>
        <div className="min-w-[240px] flex-1">
          <h4 className="text-lg text-text">Rispettiamo la tua privacy</h4>
          <p className="mt-1 text-[13px] leading-relaxed text-muted">
            Usiamo cookie tecnici e, previo consenso, cookie analitici per
            migliorare l&apos;esperienza. Consulta la{" "}
            <a href="#" className="font-semibold text-aqua">
              Cookie Policy
            </a>
            .
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={dismiss}
            className="h-11 rounded-[11px] border border-border bg-surface px-[18px] font-semibold text-text transition hover:-translate-y-0.5"
          >
            Solo necessari
          </button>
          <button
            onClick={dismiss}
            className="h-11 rounded-[11px] bg-aqua px-5 font-bold text-[#06121F] transition hover:-translate-y-0.5"
          >
            Accetta tutti
          </button>
        </div>
      </div>
    </div>
  );
}
