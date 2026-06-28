import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CoursesBrowser, { type Cat } from "@/components/courses/CoursesBrowser";
import { getDB } from "@/lib/db";
import { CATEGORIES } from "@/lib/categories";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Corsi & Attività — Centro Sportivo Roero",
};

export default async function CorsiPage({
  searchParams,
}: {
  searchParams: { cat?: string };
}) {
  const db = await getDB();
  const locName = (id: string) =>
    db.locations.find((l) => l.id === id)?.name || id;

  const categories: Cat[] = CATEGORIES.map((c) => ({
    id: c.id,
    icon: c.icon,
    title: c.title,
    age: c.age,
    intro: c.intro,
    sessions: db.courses
      .filter((co) => co.categoryId === c.id)
      .map((co) => ({
        name: co.name,
        instructor: co.instructor,
        schedule: co.schedule,
        price: co.price,
        priceNote: co.priceNote,
        locationName: locName(co.locationId),
      })),
  }));

  return (
    <>
      <Header active="corsi" />

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
            Corsi &amp; Attività
          </span>
          <h1
            className="mt-2 text-white"
            style={{ fontSize: "clamp(44px,7vw,84px)" }}
          >
            Trova il tuo corso
          </h1>
          <p className="mt-3 max-w-[580px] text-lg leading-[1.5] text-white/85">
            Dal primo tuffo dei più piccoli all&apos;agonismo federale. Otto
            programmi pensati per ogni età e obiettivo.
          </p>
        </div>
      </section>

      <CoursesBrowser categories={categories} initialCat={searchParams.cat} />

      <Footer locations={db.locations} />
    </>
  );
}
