import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShareBar from "@/components/news/ShareBar";
import { getDB } from "@/lib/db";
import { formatDateLong, formatDayMonth } from "@/lib/format";
import { locationNames } from "@/lib/loc";

export const dynamic = "force-dynamic";

export default async function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const db = await getDB();
  const article = db.news.find((n) => n.slug === params.slug && n.published);
  if (!article) notFound();

  const articleLocations = locationNames(article.locationIds, db.locations).join(" · ");

  const related = db.news
    .filter((n) => n.published && n.id !== article.id)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 3);

  return (
    <>
      <Header active="news" />

      {/* HERO */}
      <section className="relative flex h-[clamp(340px,52vh,520px)] items-end overflow-hidden">
        {article.coverImage ? (
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.coverImage}
              alt={article.title}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(125deg,var(--blue-deep),var(--blue) 60%,#062035)",
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(118deg,rgba(255,255,255,.05) 0 2px,transparent 2px 26px)",
              }}
            />
            <div
              className="absolute inset-0 grid place-items-center text-white opacity-[0.18]"
              style={{ fontSize: "min(40vh,300px)" }}
            >
              <i className={`ph ${article.icon}`} />
            </div>
          </div>
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(0deg,rgba(6,18,31,.85),rgba(6,18,31,.1))",
          }}
        />
        <div className="relative mx-auto w-full max-w-[820px] px-6 pb-10">
          <Link
            href="/news"
            className="mb-4 inline-flex items-center gap-[7px] text-sm font-semibold text-white/85 transition hover:-translate-y-0.5"
          >
            <i className="ph ph-arrow-left" />
            Torna alle news
          </Link>
          <div className="mb-3.5 flex items-center gap-2.5">
            <span className="rounded-lg bg-aqua px-3 py-[5px] text-xs font-bold uppercase tracking-[0.04em] text-[#06121F]">
              {article.category}
            </span>
            <span className="text-[13px] text-white/80">
              <i className="ph ph-calendar-blank" /> {formatDateLong(article.date)}
            </span>
            <span className="text-[13px] text-white/80">
              <i className="ph ph-map-pin" /> {articleLocations}
            </span>
          </div>
          <h1
            className="text-white"
            style={{
              fontSize: "clamp(34px,5.4vw,60px)",
              textShadow: "0 3px 24px rgba(0,0,0,.3)",
            }}
          >
            {article.title}
          </h1>
        </div>
      </section>

      {/* BODY */}
      <section className="mx-auto max-w-[1100px] px-6 pb-16 pt-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_280px]">
          <article className="prose">
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
            <ShareBar title={article.title} />
          </article>

          <aside className="flex flex-col gap-5 self-start md:sticky md:top-24">
            <div className="rounded-[16px] border border-border bg-surface p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-blue to-aqua text-[22px] text-white">
                  <i className="ph ph-user" />
                </span>
                <div>
                  <div className="text-[15px] font-bold text-text">
                    Redazione CSR
                  </div>
                  <div className="text-[12.5px] text-muted">Ufficio Stampa</div>
                </div>
              </div>
            </div>
            <div className="rounded-[16px] bg-gradient-to-br from-blue-deep to-blue p-[22px] text-white">
              <h3 className="text-2xl">Vuoi gareggiare con noi?</h3>
              <p className="mt-2 text-sm leading-[1.5] text-white/85">
                Scopri le selezioni per la squadra agonistica.
              </p>
              <Link
                href="/corsi?cat=agonistica"
                className="mt-4 flex h-[46px] items-center justify-center gap-2 rounded-[11px] bg-aqua text-sm font-bold text-[#06121F] transition hover:-translate-y-0.5"
              >
                Scopri di più
                <i className="ph ph-arrow-right" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* RELATED */}
      {related.length > 0 && (
        <section className="mx-auto max-w-[1100px] px-6 pb-[70px]">
          <h2 className="mb-5 text-[34px] text-text">Articoli correlati</h2>
          <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-3">
            {related.map((n) => (
              <Link
                key={n.id}
                href={`/news/${n.slug}`}
                className="group overflow-hidden rounded-[16px] border border-border bg-surface transition duration-300 hover:-translate-y-1.5 hover:border-aqua hover:shadow-csr"
              >
                <div className="relative aspect-[16/10] bg-gradient-to-br from-blue to-aqua">
                  {n.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={n.coverImage}
                      alt={n.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <>
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage:
                            "repeating-linear-gradient(120deg,rgba(255,255,255,.08) 0 2px,transparent 2px 22px)",
                        }}
                      />
                      <div className="absolute inset-0 grid place-items-center text-[44px] text-white/55">
                        <i className={`ph ${n.icon}`} />
                      </div>
                    </>
                  )}
                </div>
                <div className="p-4">
                  <span className="text-[11px] font-bold tracking-[0.06em] text-aqua">
                    {n.category.toUpperCase()} · {formatDayMonth(n.date)}
                  </span>
                  <h4 className="mt-1.5 text-[19px] leading-[1.15] text-text">
                    {n.title}
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Footer locations={db.locations} />
    </>
  );
}
