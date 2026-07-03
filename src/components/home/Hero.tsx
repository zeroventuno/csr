"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

// bolle decorative del hero (posizione, dimensione, tempi)
const BUBBLES = [
  { left: "8%", size: 10, delay: 0, dur: 12 },
  { left: "21%", size: 6, delay: 3.5, dur: 14 },
  { left: "34%", size: 13, delay: 6, dur: 11 },
  { left: "52%", size: 8, delay: 1.5, dur: 13 },
  { left: "67%", size: 11, delay: 5, dur: 15 },
  { left: "81%", size: 7, delay: 2.5, dur: 12 },
  { left: "93%", size: 9, delay: 7.5, dur: 13 },
];

export default function Hero() {
  const bgRef = useRef<HTMLDivElement>(null);
  const ovRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || window.pageYOffset;
      if (bgRef.current) {
        bgRef.current.style.transform = `translateY(${y * 0.4}px)`;
      }
      if (ovRef.current) {
        ovRef.current.style.opacity = String(Math.max(0, 1 - y / 560));
        ovRef.current.style.transform = `translateY(${y * 0.16}px)`;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="relative flex min-h-[560px] items-center overflow-hidden h-[calc(100svh-72px)]">
      <div
        ref={bgRef}
        className="absolute -inset-x-[2%] -inset-y-[6%] overflow-hidden bg-blue-deep will-change-transform"
      >
        {/* zoom lento (Ken Burns) su un layer interno, separato dal parallax */}
        <div
          className="hero-zoom absolute inset-0"
          style={{
            backgroundImage: "url('/hero.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center 30%",
          }}
        />
      </div>

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg,rgba(6,18,31,.82),rgba(6,18,31,.45) 55%,rgba(6,18,31,.2))",
        }}
      />

      {/* bolle che salgono */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
      >
        {BUBBLES.map((b, i) => (
          <span
            key={i}
            className="bubble"
            style={{
              left: b.left,
              width: b.size,
              height: b.size,
              animationDuration: `${b.dur}s`,
              animationDelay: `${b.delay}s`,
            }}
          />
        ))}
      </div>

      {/* onda di raccordo con la pagina */}
      <svg
        aria-hidden="true"
        className="absolute bottom-[-1px] left-0 z-[1] h-[70px] w-full"
        viewBox="0 0 1440 70"
        preserveAspectRatio="none"
      >
        <path
          d="M0,42 C180,66 360,14 560,28 C760,42 900,64 1100,52 C1240,44 1360,26 1440,38 L1440,71 L0,71 Z"
          fill="var(--bg)"
        />
      </svg>

      <div
        ref={ovRef}
        className="relative z-[2] mx-auto w-full max-w-site px-6 will-change-transform"
      >
        <div className="max-w-[660px]">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/30 px-3.5 py-[7px] text-[13px] font-semibold tracking-[0.04em] text-white backdrop-blur-[6px]">
            <span className="h-[7px] w-[7px] animate-pulseDot rounded-full bg-aqua" />
            5 piscine nel cuore del Roero
          </span>
          <h1
            className="mt-[22px] font-extrabold text-white"
            style={{
              fontSize: "clamp(56px,9vw,128px)",
              textShadow: "0 4px 30px rgba(0,0,0,.3)",
            }}
          >
            Nuota.<span className="text-shimmer"> Cresci.</span> Vivi.
          </h1>
          <p
            className="mt-[22px] max-w-[520px] font-normal leading-[1.5] text-white/90"
            style={{ fontSize: "clamp(17px,2vw,22px)" }}
          >
            Corsi per ogni età, agonismo, acquagym e benessere. Dal primo tuffo
            dei più piccoli alle gare federali.
          </p>
          <div className="mt-9 flex flex-wrap gap-3.5">
            <Link
              href="/corsi"
              className="btn-shine flex h-14 items-center gap-[9px] rounded-[13px] bg-aqua px-7 text-base font-bold text-[#06121F] transition hover:-translate-y-0.5"
              style={{ boxShadow: "0 12px 36px rgba(0,180,216,.36)" }}
            >
              Scopri i Corsi
              <i className="ph ph-arrow-right" />
            </Link>
            <a
              href="#info"
              className="flex h-14 items-center gap-[9px] rounded-[13px] border border-white/35 bg-white/10 px-[26px] text-base font-semibold text-white backdrop-blur-[6px] transition hover:-translate-y-0.5"
            >
              <i className="ph ph-clock" />
              Orari &amp; Prezzi
            </a>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[22px] left-1/2 z-[2] -translate-x-1/2 animate-float text-[26px] text-white/70">
        <i className="ph ph-caret-down" />
      </div>
    </section>
  );
}
