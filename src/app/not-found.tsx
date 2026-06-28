import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-center">
      <span className="grid h-20 w-20 place-items-center rounded-[20px] bg-gradient-to-br from-blue to-aqua text-4xl text-white">
        <i className="ph ph-wave-sine" />
      </span>
      <h1 className="mt-6 text-[64px] text-text">404</h1>
      <p className="mt-1 max-w-[420px] text-muted">
        La pagina che cerchi non esiste o è stata spostata.
      </p>
      <Link
        href="/"
        className="mt-6 flex h-12 items-center gap-2 rounded-[12px] bg-aqua px-6 font-bold text-[#06121F] transition hover:-translate-y-0.5"
      >
        <i className="ph ph-house" />
        Torna alla home
      </Link>
    </div>
  );
}
