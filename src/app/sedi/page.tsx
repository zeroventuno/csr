import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getDB } from "@/lib/db";
import { matchesLocation } from "@/lib/loc";
import { getPublicAvailability } from "@/lib/vasche";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Le nostre sedi — Centro Sportivo Roero",
};

export default async function SediPage() {
  const db = await getDB();

  const availability = await Promise.all(
    db.locations.map((l) => getPublicAvailability(l.id))
  );

  const cards = db.locations.map((l, i) => {
    const snap = availability[i];
    // le vasche chiuse non entrano nel calcolo: mai "100% libero" a piscina chiusa
    const openPools = snap.ok ? snap.pools.filter((p) => !p.closed) : [];
    const closedPools = snap.ok ? snap.pools.filter((p) => p.closed) : [];
    const closed =
      snap.locationClosed ||
      (snap.ok && snap.pools.length > 0 && openPools.length === 0);

    let freePct: number | null = null;
    if (snap.ok && !closed && openPools.length > 0) {
      const total = openPools.reduce((s, p) => s + p.total, 0);
      const free = openPools.reduce((s, p) => s + p.free, 0);
      if (total > 0) freePct = Math.round((free / total) * 100);
    }
    return {
      ...l,
      courses: db.courses.filter((c) => matchesLocation(c.locationIds, l.id)).length,
      news: db.news.filter((n) => n.published && matchesLocation(n.locationIds, l.id)).length,
      freePct,
      closed,
      closureTitle:
        snap.closure?.title || closedPools[0]?.closure?.title || "",
      partialClosure: !closed && closedPools.length > 0,
    };
  });

  return (
    <>
      <Header active="sedi" />

      <section className="relative overflow-hidden bg-gradient-to-br from-blue-deep to-blue">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(120deg,rgba(255,255,255,.04) 0 2px,transparent 2px 26px)",
          }}
        />
        <div className="relative mx-auto max-w-site px-6 pb-[60px] pt-14">
          <span className="text-sm font-bold uppercase tracking-[0.12em] text-aqua-soft">
            Le nostre piscine
          </span>
          <h1
            className="mt-2 text-white"
            style={{ fontSize: "clamp(44px,7vw,84px)" }}
          >
            Cinque sedi nel Roero
          </h1>
          <p className="mt-3 max-w-[560px] text-lg leading-[1.5] text-white/85">
            Scopri orari, contatti, corsi e novità di ciascuna piscina. Scegli la
            sede più vicina a te.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-site px-6 py-14">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((l) => (
            <Link
              key={l.id}
              href={`/sedi/${l.id}`}
              className="card-shine group flex flex-col overflow-hidden rounded-[20px] border border-border bg-surface transition duration-300 hover:-translate-y-1.5 hover:border-aqua hover:shadow-csr"
            >
              <div className="relative h-[150px] bg-gradient-to-br from-blue to-aqua">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(120deg,rgba(255,255,255,.1) 0 2px,transparent 2px 22px)",
                  }}
                />
                <div className="absolute inset-0 grid place-items-center text-5xl text-white/70">
                  <i className="ph-fill ph-waves" />
                </div>
                <span className="absolute bottom-3 left-4 head text-[26px] font-extrabold text-white">
                  {l.name}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-6">
                <div className="flex gap-2.5 text-[14px] text-text">
                  <i className="ph ph-map-pin mt-0.5 text-aqua" />
                  <span>{l.address}</span>
                </div>
                <div className="flex gap-2.5 text-[14px] text-muted">
                  <i className="ph ph-clock mt-0.5 text-aqua" />
                  <span>{l.hours}</span>
                </div>
                <div className="mt-1 flex items-center gap-4 text-[13px] text-muted">
                  <span className="flex items-center gap-1.5">
                    <i className="ph ph-person-simple-swim text-aqua" />
                    {l.courses} corsi
                  </span>
                  <span className="flex items-center gap-1.5">
                    <i className="ph ph-newspaper text-aqua" />
                    {l.news} news
                  </span>
                  {l.closed ? (
                    <span className="flex items-center gap-1.5 font-bold text-red">
                      <i className="ph-fill ph-warning-octagon" />
                      Chiusa
                    </span>
                  ) : (
                    l.freePct !== null && (
                      <span className="flex items-center gap-1.5">
                        <i className="ph ph-drop text-aqua" />
                        {l.freePct}% libero
                      </span>
                    )
                  )}
                </div>
                {(l.closed || l.partialClosure) && (
                  <div
                    className="flex items-start gap-2 rounded-[11px] border px-3 py-2 text-[12.5px] font-semibold leading-[1.4] text-text"
                    style={{
                      borderColor: "var(--red)",
                      background: "rgba(214,72,92,.08)",
                    }}
                  >
                    <i className="ph-fill ph-warning-octagon mt-0.5 text-red" />
                    <span>
                      {l.closed ? "Sede chiusa" : "Vasca chiusa"}
                      {l.closureTitle ? ` — ${l.closureTitle}` : ""}
                    </span>
                  </div>
                )}
                <span className="mt-2 flex items-center gap-2 text-sm font-bold text-aqua">
                  Vai alla sede
                  <i className="ph ph-arrow-right transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer locations={db.locations} />
    </>
  );
}
