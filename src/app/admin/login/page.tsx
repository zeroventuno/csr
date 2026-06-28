import Link from "next/link";
import { loginAction } from "@/lib/actions";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = { title: "Area Riservata — Centro Sportivo Roero" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; from?: string };
}) {
  // Se già autenticato, vai alla dashboard.
  const session = await getSession();
  if (session) redirect("/admin");

  const from = searchParams.from || "/admin";
  const hasError = searchParams.error === "1";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-deep to-blue px-6">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(120deg,rgba(255,255,255,.04) 0 2px,transparent 2px 26px)",
        }}
      />
      <div className="relative w-full max-w-[420px] rounded-[22px] border border-white/10 bg-surface p-8 shadow-[0_30px_80px_rgba(0,0,0,0.4)]">
        <Link href="/" className="flex items-center gap-[11px]">
          <span className="grid h-10 w-10 place-items-center rounded-[11px] bg-gradient-to-br from-blue to-aqua text-[22px] text-white">
            <i className="ph-fill ph-waves" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="head text-[19px] text-text">ROERO ADMIN</span>
            <span className="text-[10px] font-bold tracking-[0.2em] text-aqua">
              BACK-OFFICE
            </span>
          </span>
        </Link>

        <h1 className="mt-7 text-[30px] text-text">Area Riservata</h1>
        <p className="mt-1 text-sm text-muted">
          Accedi per gestire news, corsi ed eventi.
        </p>

        {hasError && (
          <div
            className="mt-5 flex items-center gap-2.5 rounded-[12px] border px-4 py-3 text-sm font-medium text-red"
            style={{
              borderColor: "rgba(214,72,92,.4)",
              background: "rgba(214,72,92,.1)",
            }}
          >
            <i className="ph ph-warning-circle text-lg" />
            Password non corretta. Riprova.
          </div>
        )}

        <form action={loginAction} className="mt-5 flex flex-col gap-4">
          <input type="hidden" name="from" value={from} />
          <div>
            <label className="text-[12.5px] font-bold uppercase tracking-[0.05em] text-muted">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              autoFocus
              placeholder="••••••••"
              className="mt-2 h-[50px] w-full rounded-[12px] border border-border bg-surface-2 px-4 text-[15px] text-text outline-none focus:border-aqua"
            />
          </div>
          <button
            type="submit"
            className="flex h-[50px] items-center justify-center gap-2 rounded-[12px] bg-aqua text-[15px] font-bold text-[#06121F] transition hover:-translate-y-0.5"
          >
            <i className="ph ph-sign-in" />
            Accedi
          </button>
        </form>

        <div className="mt-6 rounded-[12px] border border-border bg-surface-2 p-3.5 text-[12.5px] leading-relaxed text-muted">
          <div className="mb-1 font-bold text-text">
            <i className="ph ph-info text-aqua" /> Credenziali di prova
          </div>
          Admin: <code className="text-aqua">roero-admin</code> · Editor:{" "}
          <code className="text-aqua">roero-editor</code>
          <br />
          Modificale nel file <code>.env.local</code>.
        </div>

        <Link
          href="/"
          className="mt-5 flex items-center justify-center gap-1.5 text-sm font-semibold text-muted transition hover:text-aqua"
        >
          <i className="ph ph-arrow-left" />
          Torna al sito
        </Link>
      </div>
    </div>
  );
}
