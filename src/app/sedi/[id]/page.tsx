import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getDB } from "@/lib/db";
import { CATEGORIES } from "@/lib/categories";
import { matchesLocation } from "@/lib/loc";
import { formatDate, dayNumber, monthAbbr } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}) {
  return { title: `Sede di ${params.id} — Centro Sportivo Roero` };
}

export default async function SedePage({ params }: { params: { id: string } }) {
  const db = await getDB();
  const loc = db.locations.find((l) => l.id === params.id);
  if (!loc) notFound();

  const news = db.news
    .filter((n) => n.published && matchesLocation(n.locationIds, loc.id))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 6);

  const today = new Date().toISOString().slice(0, 10);
  const events = db.events
    .filter((e) => matchesLocation(e.locationIds, loc.id) && e.date >= today)
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .slice(0, 6);

  const courseCats = CATEGORIES.map((c) => ({
    ...c,
    sessions: db.courses.filter(
      (co) => co.categoryId === c.id && matchesLocation(co.locationIds, loc.id)
    ),
  })).filter((c) => c.sessions.length > 0);

  return (
    <>
      <Header active="sedi" />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-deep to-blue">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(120deg,rgba(255,255,255,.04) 0 2px,transparent 2px 26px)",
          }}
        />
        <div className="relative mx-auto max-w-site px-6 pb-12 pt-12">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-white/70">
            <Link href="/sedi" className="transition hover:text-aqua">
              Sedi
            </Link>
            <i className="ph ph-caret-right text-[11px]" />
            <span className="text-aqua-soft">{loc.name}</span>
          </div>
          <h1
            className="mt-3 text-white"
            style={{ fontSize: "clamp(44px,7vw,80px)" }}
          >
            Piscina di {loc.name}
          </h1>
          <div className="mt-4 flex flex-wrap gap-x-7 gap-y-2 text-[15px] text-white/85">
            <span className="flex items-center gap-2">
              <i className="ph ph-map-pin text-aqua-soft" />
              {loc.address}
            </span>
            <a
              href={`tel:${loc.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-2 transition hover:text-aqua"
            >
              <i className="ph ph-phone text-aqua-soft" />
              {loc.phone}
            </a>
          </div>
          <div className="mt-7 flex flex-wrap gap-3.5">
            <Link
              href={`/corsi?sede=${loc.id}`}
              className="flex h-12 items-center gap-2 rounded-[12px] bg-aqua px-6 text-[15px] font-bold text-[#06121F] transition hover:-translate-y-0.5"
            >
              Corsi di questa sede
              <i className="ph ph-arrow-right" />
            </Link>
            <a
              href="#contatti-sede"
              className="flex h-12 items-center gap-2 rounded-[12px] border border-white/35 bg-white/10 px-6 text-[15px] font-semibold text-white transition hover:-translate-y-0.5"
            >
              <i className="ph ph-info" />
              Orari &amp; Info
            </a>
          </div>
        </div>
      </section>

      {/* INFO + MAP */}
      <section id="contatti-sede" className="mx-auto max-w-site px-6 py-14">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.1fr]">
          {/* info card */}
          <div className="rounded-[20px] border border-border bg-surface p-7 shadow-csr">
            <h2 className="text-[28px] text-text">Informazioni</h2>
            <div className="mt-5 flex flex-col gap-4">
              <div className="flex gap-3 text-[15px] text-text">
                <i className="ph ph-map-pin mt-0.5 text-xl text-aqua" />
                <span>{loc.address}</span>
              </div>
              <div className="flex gap-3 text-[15px] text-text">
                <i className="ph ph-clock mt-0.5 text-xl text-aqua" />
                <span>{loc.hours}</span>
              </div>
              <div className="flex gap-3 text-[15px] text-text">
                <i className="ph ph-phone mt-0.5 text-xl text-aqua" />
                <a
                  href={`tel:${loc.phone.replace(/\s/g, "")}`}
                  className="font-semibold text-aqua"
                >
                  {loc.phone}
                </a>
              </div>
            </div>

            {/* pool availability */}
            <div className="mt-6 rounded-[14px] border border-border bg-surface-2 p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                <i className="ph ph-drop text-aqua" />
                Disponibilità Vasche
              </div>
              <div className="mt-2.5 flex items-end gap-3">
                <div className="head text-[44px] font-extrabold leading-none text-text">
                  {loc.pool}
                  <span className="text-xl text-muted">%</span>
                </div>
                <div className="pb-1.5 text-[13px] text-muted">
                  posti liberi · tempo reale
                </div>
              </div>
              <div className="mt-3 h-2.5 overflow-hidden rounded-md bg-bg">
                <div
                  className="h-full rounded-md bg-gradient-to-r from-blue to-aqua"
                  style={{ width: `${loc.pool}%` }}
                />
              </div>
            </div>
          </div>

          {/* map */}
          <div className="min-h-[320px] overflow-hidden rounded-[20px] border border-border bg-surface shadow-csr">
            {loc.mapsEmbed ? (
              <iframe
                src={loc.mapsEmbed}
                title={`Mappa ${loc.name}`}
                className="h-full min-h-[320px] w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="grid h-full min-h-[320px] place-items-center bg-gradient-to-br from-blue to-aqua text-5xl text-white/70">
                <i className="ph ph-map-trifold" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CORSI */}
      <section className="mx-auto max-w-site px-6 pb-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-sm font-bold uppercase tracking-[0.12em] text-aqua">
              Corsi
            </span>
            <h2 className="mt-1.5 text-[34px] text-text">
              Corsi a {loc.name}
            </h2>
          </div>
          <Link
            href={`/corsi?sede=${loc.id}`}
            className="flex items-center gap-2 text-[15px] font-bold text-text transition hover:text-aqua"
          >
            Tutti i corsi
            <i className="ph ph-arrow-right" />
          </Link>
        </div>

        {courseCats.length === 0 ? (
          <p className="mt-6 rounded-[16px] border border-border bg-surface p-8 text-center text-muted">
            Nessun corso attivo in questa sede al momento.
          </p>
        ) : (
          <div className="mt-6 flex flex-col gap-7">
            {courseCats.map((c) => (
              <div key={c.id}>
                <div className="mb-3 flex items-center gap-2.5">
                  <span className="grid h-10 w-10 place-items-center rounded-[11px] bg-bg text-xl text-aqua">
                    <i className={`ph ${c.icon}`} />
                  </span>
                  <h3 className="text-[22px] text-text">{c.title}</h3>
                  <span className="rounded-[6px] bg-aqua-soft px-2 py-0.5 text-[11px] font-bold text-blue">
                    {c.age}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {c.sessions.map((s) => (
                    <div
                      key={s.id}
                      className="rounded-[14px] border border-border bg-surface p-4 transition hover:border-aqua hover:shadow-csr"
                    >
                      <div className="head text-[18px] font-bold text-text">
                        {s.name}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-[12.5px] text-muted">
                        <i className="ph ph-user-circle" />
                        {s.instructor}
                      </div>
                      <div className="mt-2 flex items-center gap-1.5 text-[13px] text-text">
                        <i className="ph ph-calendar-dots text-aqua" />
                        {s.schedule}
                      </div>
                      <div className="mt-2 flex items-baseline gap-1.5">
                        <span className="head text-[20px] font-extrabold text-text">
                          {s.price}
                        </span>
                        <span className="text-[11px] text-muted">
                          {s.priceNote}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* NEWS */}
      <section className="mx-auto max-w-site px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-sm font-bold uppercase tracking-[0.12em] text-aqua">
              News
            </span>
            <h2 className="mt-1.5 text-[34px] text-text">
              Novità da {loc.name}
            </h2>
          </div>
          <Link
            href="/news"
            className="flex items-center gap-2 text-[15px] font-bold text-text transition hover:text-aqua"
          >
            Tutte le news
            <i className="ph ph-arrow-right" />
          </Link>
        </div>

        {news.length === 0 ? (
          <p className="mt-6 rounded-[16px] border border-border bg-surface p-8 text-center text-muted">
            Nessuna notizia per questa sede al momento.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((n) => (
              <Link
                key={n.id}
                href={`/news/${n.slug}`}
                className="group flex flex-col overflow-hidden rounded-[18px] border border-border bg-surface transition duration-300 hover:-translate-y-1.5 hover:border-aqua hover:shadow-csr"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-blue to-aqua">
                  {n.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={n.coverImage}
                      alt={n.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-[52px] text-white/55">
                      <i className={`ph ${n.icon}`} />
                    </div>
                  )}
                  <span className="absolute left-3.5 top-3.5 rounded-[7px] bg-aqua px-[11px] py-[5px] text-[11px] font-bold uppercase text-[#06121F]">
                    {n.category}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <span className="text-[12.5px] font-medium text-muted">
                    <i className="ph ph-calendar-blank" /> {formatDate(n.date)}
                  </span>
                  <h3 className="text-[21px] leading-[1.1] text-text">
                    {n.title}
                  </h3>
                  <p className="flex-1 text-sm leading-[1.55] text-muted">
                    {n.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* EVENTI */}
      {events.length > 0 && (
        <section className="mx-auto max-w-site px-6 pb-16">
          <span className="text-sm font-bold uppercase tracking-[0.12em] text-aqua">
            Eventi
          </span>
          <h2 className="mb-6 mt-1.5 text-[34px] text-text">
            Prossimi appuntamenti
          </h2>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => (
              <div
                key={e.id}
                className="flex items-center gap-4 rounded-[16px] border border-border bg-surface p-4"
              >
                <div className="flex-none text-center" style={{ width: 56 }}>
                  <div className="head text-[28px] font-extrabold leading-none text-aqua">
                    {dayNumber(e.date)}
                  </div>
                  <div className="text-[11px] uppercase text-muted">
                    {monthAbbr(e.date)}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-[15px] font-semibold text-text">
                    {e.title}
                  </div>
                  <div className="mt-0.5 text-[12.5px] text-muted">
                    <i className="ph ph-clock" /> {e.time}
                    {e.description ? ` · ${e.description}` : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <Footer locations={db.locations} />
    </>
  );
}
