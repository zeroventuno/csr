"use client";

import Link from "next/link";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

const NAV = [
  { key: "home", label: "Home", href: "/" },
  { key: "corsi", label: "Corsi", href: "/corsi" },
  { key: "news", label: "News", href: "/news" },
  { key: "chi", label: "Chi Siamo", href: "/#info" },
  { key: "contatti", label: "Contatti", href: "/#contatti" },
];

export default function Header({ active = "home" }: { active?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[60] border-b border-border backdrop-blur-[14px] backdrop-saturate-150 bg-[var(--header-bg)]">
      <div className="mx-auto flex h-[72px] max-w-site items-center gap-7 px-6">
        <Link href="/" className="flex items-center gap-[11px]">
          <span className="grid h-10 w-10 place-items-center rounded-[11px] bg-gradient-to-br from-blue to-aqua text-[22px] text-white">
            <i className="ph-fill ph-waves" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="head text-[21px] text-text tracking-[0.01em]">
              CENTRO SPORTIVO
            </span>
            <span className="text-[11px] font-bold tracking-[0.32em] text-aqua">
              R O E R O
            </span>
          </span>
        </Link>

        <nav className="ml-3.5 hidden gap-[26px] md:flex">
          {NAV.map((n) => (
            <Link
              key={n.key}
              href={n.href}
              className={`text-[15px] transition hover:text-aqua ${
                active === n.key
                  ? "font-semibold text-aqua"
                  : "font-medium text-text"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/admin"
            className="hidden h-[42px] items-center gap-[7px] rounded-[11px] border border-border bg-surface px-3.5 text-sm font-semibold text-text transition hover:-translate-y-0.5 md:flex"
          >
            <i className="ph ph-lock-key" />
            Area Riservata
          </Link>
          <Link
            href="/corsi"
            className="flex h-[42px] items-center gap-[7px] rounded-[11px] bg-aqua px-[18px] text-sm font-bold text-[#06121F] transition hover:-translate-y-0.5"
          >
            Iscriviti
            <i className="ph ph-arrow-right" />
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            className="grid h-[42px] w-[42px] place-items-center rounded-[11px] border border-border bg-surface text-xl text-text md:hidden"
          >
            <i className="ph ph-list" />
          </button>
        </div>
      </div>

      {open && (
        <div className="flex flex-col gap-1 border-t border-border bg-surface px-6 pb-[18px] pt-2.5 md:hidden">
          {NAV.map((n) => (
            <Link
              key={n.key}
              href={n.href}
              onClick={() => setOpen(false)}
              className={`rounded-lg px-2 py-3 font-medium ${
                active === n.key ? "text-aqua" : "text-text"
              }`}
            >
              {n.label}
            </Link>
          ))}
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className="rounded-lg px-2 py-3 font-medium text-text"
          >
            Area Riservata
          </Link>
        </div>
      )}
    </header>
  );
}
