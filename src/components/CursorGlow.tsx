"use client";

import { useEffect, useRef } from "react";

// Alone luminoso che segue il cursore (solo puntatori "fine", niente touch).
// Si ingrandisce leggermente sugli elementi interattivi. Decorativo puro.
export default function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const el = ref.current;
    if (!fine || reduced || !el) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;
    let scale = 1;
    let tScale = 1;
    let shown = false;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!shown) {
        shown = true;
        el.style.opacity = "1";
      }
      const t = e.target as Element | null;
      tScale =
        t &&
        typeof t.closest === "function" &&
        t.closest("a,button,[role=button],input,select,textarea,label")
          ? 1.55
          : 1;
    };
    const onLeave = () => {
      shown = false;
      el.style.opacity = "0";
    };
    const loop = () => {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      scale += (tScale - scale) * 0.12;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return <div ref={ref} aria-hidden="true" className="cursor-glow" />;
}
