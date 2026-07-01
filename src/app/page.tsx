import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import Reveal from "@/components/Reveal";
import Hero from "@/components/home/Hero";
import LocationSwitcher from "@/components/home/LocationSwitcher";
import { getDB } from "@/lib/db";
import { CATEGORIES } from "@/lib/categories";
import { formatDayMonth } from "@/lib/format";
import { locationLabel } from "@/lib/loc";

export const dynamic = "force-dynamic";

const PARTNERS = [
  { icon: "ph-medal", name: "FIN" },
  { icon: "ph-shield-check", name: "CONI" },
  { icon: "ph-drop", name: "AquaTech" },
  { icon: "ph-buildings", name: "Comune Cuneo" },
  { icon: "ph-leaf", name: "EcoPool" },
  { icon: "ph-heartbeat", name: "SaluteSport" },
];

export default async function HomePage() {
  const db = await getDB();

  const published = db.news
    .filter((n) => n.published)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const featured = published[0];
  const sideNews = published.slice(1, 4);

  return (
    <>
      <Header active="home" />
      <Hero />
      <LocationSwitcher locations={db.locations} />

      {/* ===== COURSES GRID ===== */}
      <section className="mx-auto max-w-site px-6 pb-6 pt-24">
        <Reveal className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <span className="text-sm font-bold uppercase tracking-[0.12em] text-aqua">
              I nostri corsi
            </span>
            <h2
              className="mt-2 text-text"
              style={{ fontSize: "clamp(36px,5vw,58px)" }}
            >
              Un&apos;attività per ogni età
            </h2>
          </div>
          <Link
            href="/corsi"
            className="flex items-center gap-2 text-base font-bold text-text transition hover:text-aqua"
          >
            Tutti i corsi
            <i className="ph ph-arrow-right" />
          </Link>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Reveal key={c.id}>
              <Link
                href={`/corsi?cat=${c.id}`}
                className="group flex h-full flex-col gap-3.5 rounded-[18px] border border-border bg-surface p-6 transition duration-300 hover:-translate-y-1.5 hover:border-aqua hover:shadow-csr"
              >
                <span className="grid h-[54px] w-[54px] place-items-center rounded-[14px] bg-bg text-[28px] text-aqua">
                  <i className={`ph ${c.icon}`} />
                </span>
                <div>
                  <h3 className="text-2xl text-text">{c.title}</h3>
                  <span className="mt-1.5 inline-block rounded-md bg-badge px-[9px] py-[3px] text-xs font-semibold text-badge-text">
                    {c.age}
                  </span>
                </div>
                <p className="flex-1 text-sm leading-[1.55] text-muted">
                  {c.shortDesc}
                </p>
                <span className="flex items-center gap-[7px] text-sm font-bold text-aqua">
                  Scopri
                  <i className="ph ph-arrow-right" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== NEWS & EVENTS ===== */}
      <section className="mx-auto max-w-site px-6 py-20">
        <Reveal className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <span className="text-sm font-bold uppercase tracking-[0.12em] text-aqua">
              News &amp; Eventi
            </span>
            <h2
              className="mt-2 text-text"
              style={{ fontSize: "clamp(36px,5vw,58px)" }}
            >
              Ultime dal Centro
            </h2>
          </div>
          <Link
            href="/news"
            className="flex items-center gap-2 text-base font-bold text-text transition hover:text-aqua"
          >
            Tutte le news
            <i className="ph ph-arrow-right" />
          </Link>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-[18px] lg:grid-cols-[1.5fr_1fr]">
          {featured && (
            <Reveal>
              <Link
                href={`/news/${featured.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-border bg-surface transition duration-300 hover:-translate-y-1.5 hover:border-aqua hover:shadow-csr"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-blue to-aqua">
                  {featured.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={featured.coverImage}
                      alt={featured.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <>
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage:
                            "repeating-linear-gradient(125deg,rgba(255,255,255,.08) 0 2px,transparent 2px 24px)",
                        }}
                      />
                      <div className="absolute inset-0 grid place-items-center text-[90px] text-white/60">
                        <i className={`ph ${featured.icon}`} />
                      </div>
                    </>
                  )}
                  <span className="absolute left-4 top-4 rounded-lg bg-aqua px-3 py-[5px] text-xs font-bold uppercase text-[#06121F]">
                    {featured.category}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-[26px]">
                  <div className="flex gap-3.5 text-[13px] font-medium text-muted">
                    <span>
                      <i className="ph ph-calendar-blank" />{" "}
                      {formatDayMonth(featured.date)} {featured.date.slice(0, 4)}
                    </span>
                    <span>
                      <i className="ph ph-map-pin" />{" "}
                      {locationLabel(featured.locationIds, db.locations)}
                    </span>
                  </div>
                  <h3 className="text-[32px] leading-[1.05] text-text">
                    {featured.title}
                  </h3>
                  <p className="flex-1 text-[15px] leading-[1.6] text-muted">
                    {featured.excerpt}
                  </p>
                  <span className="flex items-center gap-[7px] font-bold text-aqua">
                    Leggi l&apos;articolo
                    <i className="ph ph-arrow-right" />
                  </span>
                </div>
              </Link>
            </Reveal>
          )}

          <div className="flex flex-col gap-[18px]">
            {sideNews.map((n) => (
              <Reveal key={n.id} className="flex-1">
                <Link
                  href={`/news/${n.slug}`}
                  className="group flex h-full gap-4 rounded-[16px] border border-border bg-surface p-4 transition duration-300 hover:-translate-y-1.5 hover:border-aqua hover:shadow-csr"
                >
                  <span className="grid w-[92px] flex-none place-items-center self-stretch rounded-[12px] bg-gradient-to-br from-blue to-aqua text-[32px] text-white/70">
                    <i className={`ph ${n.icon}`} />
                  </span>
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <span className="text-[11px] font-bold tracking-[0.06em] text-aqua">
                      {n.category.toUpperCase()} · {formatDayMonth(n.date)}
                    </span>
                    <h4 className="text-xl leading-[1.1] text-text">{n.title}</h4>
                    <p className="text-[13px] leading-[1.5] text-muted">
                      {n.excerpt}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SOCIAL PROOF ===== */}
      <Reveal as="section" className="mx-auto max-w-site px-6 pb-10 pt-6">
        <p className="text-center text-[13px] font-semibold uppercase tracking-[0.1em] text-muted">
          Partner &amp; Federazioni
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-10 opacity-65">
          {PARTNERS.map((p) => (
            <span
              key={p.name}
              className="head flex items-center gap-[9px] text-2xl font-bold text-muted"
            >
              <i className={`ph ${p.icon} text-[26px]`} />
              {p.name}
            </span>
          ))}
        </div>
      </Reveal>

      {/* ===== APP STRIP ===== */}
      <section className="mx-auto my-10 max-w-site px-6">
        <Reveal className="relative grid grid-cols-1 items-center gap-8 overflow-hidden rounded-[24px] bg-gradient-to-br from-blue-deep to-blue p-12 lg:grid-cols-[1.4fr_1fr]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(120deg,rgba(255,255,255,.04) 0 2px,transparent 2px 28px)",
            }}
          />
          <div className="relative z-[2]">
            <h2
              className="leading-[1.02] text-white"
              style={{ fontSize: "clamp(32px,4.4vw,52px)" }}
            >
              Il Centro nel
              <br />
              tuo telefono
            </h2>
            <p className="mt-3.5 max-w-[440px] text-[17px] leading-[1.55] text-white/85">
              Prenota le lezioni, controlla la disponibilità vasche in tempo
              reale e ricevi gli avvisi della tua piscina. Gratis su iOS e
              Android.
            </p>
            <div className="mt-7 flex flex-wrap gap-3.5">
              <a
                href="#"
                className="flex h-[54px] items-center gap-2.5 rounded-[13px] bg-white px-[22px] text-[15px] font-bold text-blue-deep transition hover:-translate-y-0.5"
              >
                <i className="ph-fill ph-apple-logo text-2xl" />
                App Store
              </a>
              <a
                href="#"
                className="flex h-[54px] items-center gap-2.5 rounded-[13px] border border-white/30 bg-white/15 px-[22px] text-[15px] font-bold text-white transition hover:-translate-y-0.5"
              >
                <i className="ph-fill ph-google-play-logo text-[22px]" />
                Google Play
              </a>
            </div>
          </div>
          <div className="relative z-[2] flex justify-center">
            <div className="grid h-[260px] w-[180px] animate-float-slow place-items-center rounded-[28px] border-[7px] border-white/20 bg-white/5 text-white/50">
              <i className="ph ph-device-mobile text-[64px]" />
            </div>
          </div>
        </Reveal>
      </section>

      <Footer locations={db.locations} />
      <CookieBanner />
    </>
  );
}
