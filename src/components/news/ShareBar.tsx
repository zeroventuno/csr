"use client";

import { useState } from "react";

export default function ShareBar({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const url = typeof window !== "undefined" ? window.location.href : "";
  const enc = encodeURIComponent(url);
  const encT = encodeURIComponent(title);

  const links = [
    { icon: "ph-facebook-logo", name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc}` },
    { icon: "ph-whatsapp-logo", name: "WhatsApp", href: `https://wa.me/?text=${encT}%20${enc}` },
    { icon: "ph-x-logo", name: "X", href: `https://twitter.com/intent/tweet?text=${encT}&url=${enc}` },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <div className="mt-10 flex flex-wrap items-center gap-3.5 border-t border-border pt-6">
      <span className="text-[15px] font-bold text-text">Condividi:</span>
      {links.map((s) => (
        <a
          key={s.name}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.name}
          className="grid h-11 w-11 place-items-center rounded-[11px] border border-border bg-surface text-[19px] text-text transition hover:-translate-y-0.5 hover:text-aqua"
        >
          <i className={`ph ${s.icon}`} />
        </a>
      ))}
      <button
        onClick={copy}
        aria-label="Copia link"
        className="grid h-11 w-11 place-items-center rounded-[11px] border border-border bg-surface text-[19px] text-text transition hover:-translate-y-0.5 hover:text-aqua"
      >
        <i className={`ph ${copied ? "ph-check" : "ph-link"}`} />
      </button>
      {copied && <span className="text-sm text-green">Link copiato!</span>}
    </div>
  );
}
