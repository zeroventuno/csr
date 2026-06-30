import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import { getDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Contatti — Centro Sportivo Roero",
};

export default async function ContattiPage() {
  const db = await getDB();
  const locations = db.locations.map((l) => ({ id: l.id, name: l.name }));

  return (
    <>
      <Header active="contatti" />

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
            Contatti
          </span>
          <h1
            className="mt-2 text-white"
            style={{ fontSize: "clamp(44px,7vw,84px)" }}
          >
            Scrivici
          </h1>
          <p className="mt-3 max-w-[560px] text-lg leading-[1.5] text-white/85">
            Hai una domanda sui corsi, gli orari o le iscrizioni? Scegli la sede e
            scrivi alla segreteria: ti risponderemo al più presto.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-site px-6 py-14">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.3fr_1fr]">
          <ContactForm locations={locations} />

          <div className="flex flex-col gap-4">
            <h2 className="text-[26px] text-text">Le nostre sedi</h2>
            {db.locations.map((l) => (
              <div
                key={l.id}
                className="rounded-[16px] border border-border bg-surface p-5"
              >
                <div className="head text-[20px] font-bold text-text">
                  {l.name}
                </div>
                <div className="mt-2.5 flex flex-col gap-1.5 text-[14px] text-text">
                  <span className="flex gap-2.5">
                    <i className="ph ph-map-pin mt-0.5 text-aqua" />
                    {l.address}
                  </span>
                  <a
                    href={`tel:${l.phone.replace(/\s/g, "")}`}
                    className="flex gap-2.5 transition hover:text-aqua"
                  >
                    <i className="ph ph-phone mt-0.5 text-aqua" />
                    {l.phone}
                  </a>
                  {l.email && (
                    <a
                      href={`mailto:${l.email}`}
                      className="flex gap-2.5 break-all transition hover:text-aqua"
                    >
                      <i className="ph ph-envelope-simple mt-0.5 text-aqua" />
                      {l.email}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer locations={db.locations} />
    </>
  );
}
