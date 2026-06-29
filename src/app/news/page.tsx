import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsBrowser, { type NewsCard } from "@/components/news/NewsBrowser";
import { getDB } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { locationLabel } from "@/lib/loc";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "News & Eventi — Centro Sportivo Roero",
};

export default async function NewsPage() {
  const db = await getDB();

  const items: NewsCard[] = db.news
    .filter((n) => n.published)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map((n) => ({
      slug: n.slug,
      title: n.title,
      category: n.category,
      locationIds: n.locationIds,
      locationLabel: locationLabel(n.locationIds, db.locations),
      date: formatDate(n.date),
      excerpt: n.excerpt,
      icon: n.icon,
      coverImage: n.coverImage || undefined,
    }));

  const locations = db.locations.map((l) => ({ id: l.id, name: l.name }));

  return (
    <>
      <Header active="news" />

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
            Magazine
          </span>
          <h1
            className="mt-2 text-white"
            style={{ fontSize: "clamp(44px,7vw,84px)" }}
          >
            News &amp; Eventi
          </h1>
          <p className="mt-3 max-w-[560px] text-lg leading-[1.5] text-white/85">
            Tutte le novità, gli avvisi e gli appuntamenti delle nostre cinque
            piscine.
          </p>
        </div>
      </section>

      <NewsBrowser items={items} locations={locations} />

      <Footer locations={db.locations} />
    </>
  );
}
