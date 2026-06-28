"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const t = document.documentElement.getAttribute("data-theme");
    setTheme(t === "dark" ? "dark" : "light");
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("csr-theme", next);
    } catch {}
  };

  return (
    <button
      onClick={toggle}
      aria-label="Cambia tema"
      className={
        className ||
        "grid h-[42px] w-[42px] place-items-center rounded-[11px] border border-border bg-surface text-text text-lg transition hover:-translate-y-0.5"
      }
    >
      <i className={`ph ${theme === "light" ? "ph-moon" : "ph-sun"}`} />
    </button>
  );
}
