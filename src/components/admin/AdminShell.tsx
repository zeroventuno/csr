"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { Role } from "@/lib/types";
import { logoutAction } from "@/lib/actions";
import ThemeToggle from "@/components/ThemeToggle";

const NAV = [
  { id: "dash", href: "/admin", label: "Dashboard", icon: "ph-squares-four" },
  { id: "news", href: "/admin/news", label: "News", icon: "ph-newspaper", badgeKey: "news" },
  { id: "courses", href: "/admin/courses", label: "Corsi", icon: "ph-person-simple-swim", badgeKey: "courses" },
  { id: "events", href: "/admin/events", label: "Eventi", icon: "ph-calendar-dots", badgeKey: "events" },
  { id: "vasche", href: "/admin/vasche", label: "Disponibilità Vasche", icon: "ph-swimming-pool" },
  { id: "calendario", href: "/admin/calendario", label: "Calendario / Blocchi", icon: "ph-calendar-check" },
  { id: "loc", href: "/admin/locations", label: "Sedi", icon: "ph-map-pin" },
  { id: "media", href: "/admin/media", label: "Media Library", icon: "ph-images" },
];

const TITLES: Record<string, [string, string]> = {
  "/admin": ["Dashboard", "Panoramica generale del centro"],
  "/admin/news": ["Gestione News", "Crea, modifica e pubblica articoli"],
  "/admin/courses": ["Gestione Corsi", "CRUD dei corsi e delle attività"],
  "/admin/events": ["Gestione Eventi", "Calendario e creazione eventi"],
  "/admin/vasche": ["Disponibilità Vasche", "Check-in corsie in tempo reale"],
  "/admin/calendario": ["Calendario / Blocchi", "Blocchi corsie (water polo, eventi…)"],
  "/admin/locations": ["Gestione Sedi", "Informazioni delle 5 piscine"],
  "/admin/media": ["Media Library", "Carica e organizza i file"],
};

export default function AdminShell({
  role,
  counts,
  children,
}: {
  role: Role;
  counts: Record<string, number>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobOpen, setMobOpen] = useState(false);
  const isAdmin = role === "admin";
  const [title, sub] = TITLES[pathname] || TITLES["/admin"];

  return (
    <div className="admin" data-mob-open={mobOpen ? "1" : "0"}>
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <aside
          className={`fixed inset-y-0 left-0 z-[90] flex h-screen w-[248px] flex-none flex-col bg-sidebar transition-transform md:sticky md:top-0 md:translate-x-0 ${
            mobOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <div className="flex items-center gap-[11px] border-b border-white/10 px-[18px] py-5">
            <span className="grid h-[38px] w-[38px] place-items-center rounded-[10px] bg-gradient-to-br from-blue to-aqua text-xl text-white">
              <i className="ph-fill ph-waves" />
            </span>
            <div className="leading-[1.1]">
              <div className="head text-[17px] font-bold text-white">
                ROERO ADMIN
              </div>
              <div className="text-[10px] tracking-[0.2em] text-aqua">
                BACK-OFFICE
              </div>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-[3px] overflow-y-auto p-3">
            <div className="px-3 pb-1.5 pt-2.5 text-[10px] font-bold tracking-[0.14em] text-white/40">
              GESTIONE
            </div>
            {NAV.map((n) => {
              const on = pathname === n.href;
              const badge = n.badgeKey ? counts[n.badgeKey] : undefined;
              return (
                <Link
                  key={n.id}
                  href={n.href}
                  onClick={() => setMobOpen(false)}
                  className="flex items-center gap-3 rounded-[10px] px-3 py-[11px] text-[14.5px] transition hover:bg-white/[0.06] hover:text-white"
                  style={{
                    background: on ? "rgba(0,180,216,.16)" : "transparent",
                    color: on ? "#fff" : "var(--sidebar-text)",
                    fontWeight: on ? 700 : 500,
                  }}
                >
                  <i className={`ph ${n.icon} text-[19px]`} />
                  {n.label}
                  {badge !== undefined && (
                    <span className="ml-auto rounded-[20px] bg-aqua px-[7px] text-[11px] font-bold text-[#06121F]">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="px-3 pb-1.5 pt-4 text-[10px] font-bold tracking-[0.14em] text-white/40">
              SISTEMA
            </div>
            {isAdmin && (
              <span className="flex cursor-default items-center gap-3 rounded-[10px] px-3 py-[11px] text-[14.5px] font-medium text-sidebar-text">
                <i className="ph ph-users-three text-[19px]" />
                Utenti
              </span>
            )}
            <span className="flex cursor-default items-center gap-3 rounded-[10px] px-3 py-[11px] text-[14.5px] font-medium text-sidebar-text">
              <i className="ph ph-gear text-[19px]" />
              Impostazioni
            </span>
          </nav>

          <div className="border-t border-white/10 p-3.5">
            <div className="flex items-center gap-2.5 rounded-[12px] bg-white/5 p-3">
              <span className="grid h-[38px] w-[38px] place-items-center rounded-full bg-gradient-to-br from-blue to-aqua font-bold text-white">
                {isAdmin ? "AD" : "ED"}
              </span>
              <div className="min-w-0 leading-tight">
                <div className="truncate text-[13.5px] font-semibold text-white">
                  {isAdmin ? "Amministratore" : "Editor"}
                </div>
                <div className="text-[11px] font-semibold text-aqua">
                  {isAdmin ? "Accesso completo" : "Accesso limitato"}
                </div>
              </div>
              <form action={logoutAction} className="ml-auto">
                <button
                  aria-label="Esci"
                  className="text-lg text-white/60 transition hover:text-white"
                >
                  <i className="ph ph-sign-out" />
                </button>
              </form>
            </div>
          </div>
        </aside>

        {/* backdrop mobile */}
        {mobOpen && (
          <div
            onClick={() => setMobOpen(false)}
            className="fixed inset-0 z-[80] bg-black/40 md:hidden"
          />
        )}

        {/* MAIN */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-50 flex h-[68px] items-center gap-4 border-b border-border bg-surface px-6">
            <button
              onClick={() => setMobOpen((v) => !v)}
              aria-label="Menu"
              className="grid h-10 w-10 place-items-center rounded-[10px] border border-border bg-surface text-[19px] text-text md:hidden"
            >
              <i className="ph ph-list" />
            </button>
            <div>
              <h1 className="text-[25px] text-text">{title}</h1>
              <div className="mt-px text-[12.5px] text-muted">{sub}</div>
            </div>
            <div className="ml-auto flex items-center gap-2.5">
              <div className="hidden h-[42px] min-w-[200px] items-center gap-2 rounded-[11px] border border-border bg-surface-2 px-3.5 text-muted sm:flex">
                <i className="ph ph-magnifying-glass" />
                <span className="text-[13.5px]">Cerca…</span>
              </div>
              <span
                className="flex h-[34px] items-center rounded-[8px] px-3 text-[12.5px] font-bold"
                style={{ background: "var(--aqua)", color: "#06121F" }}
              >
                {isAdmin ? "Admin" : "Editor"}
              </span>
              <ThemeToggle className="grid h-[42px] w-[42px] place-items-center rounded-[11px] border border-border bg-surface-2 text-lg text-text" />
              <button
                aria-label="Notifiche"
                className="relative grid h-[42px] w-[42px] place-items-center rounded-[11px] border border-border bg-surface-2 text-lg text-text"
              >
                <i className="ph ph-bell" />
                <span className="absolute right-[9px] top-2 h-2 w-2 rounded-full border-2 border-surface bg-red" />
              </button>
            </div>
          </header>

          <main className="flex-1 px-6 pb-16 pt-7">{children}</main>
        </div>
      </div>
    </div>
  );
}
