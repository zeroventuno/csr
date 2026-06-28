import Link from "next/link";
import type { Location } from "@/lib/types";

const SOCIALS = [
  { icon: "ph-instagram-logo", name: "Instagram" },
  { icon: "ph-facebook-logo", name: "Facebook" },
  { icon: "ph-youtube-logo", name: "YouTube" },
  { icon: "ph-whatsapp-logo", name: "WhatsApp" },
];

export default function Footer({ locations = [] }: { locations?: Location[] }) {
  return (
    <footer className="mt-10 bg-blue-deep text-white/80">
      <div className="mx-auto grid max-w-site grid-cols-1 gap-10 px-6 pb-7 pt-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <div className="flex items-center gap-[11px]">
            <span className="grid h-10 w-10 place-items-center rounded-[11px] bg-gradient-to-br from-blue to-aqua text-[22px] text-white">
              <i className="ph-fill ph-waves" />
            </span>
            <span className="head text-[21px] text-white">
              CENTRO SPORTIVO ROERO
            </span>
          </div>
          <p className="mt-4 max-w-[300px] text-sm leading-relaxed">
            Sport, crescita e benessere in acqua dal 1998. Cinque piscine al
            servizio del territorio del Roero e del Cuneese.
          </p>
          <div className="mt-5 flex gap-2.5">
            {SOCIALS.map((s) => (
              <a
                key={s.name}
                href="#"
                aria-label={s.name}
                className="grid h-[42px] w-[42px] place-items-center rounded-[11px] bg-white/10 text-[19px] text-white transition hover:-translate-y-0.5"
              >
                <i className={`ph ${s.icon}`} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-[17px] uppercase tracking-[0.04em] text-white">
            Sedi
          </h4>
          <div className="mt-4 flex flex-col gap-[9px] text-sm">
            {(locations.length
              ? locations
              : [
                  { id: "cuneo", name: "Cuneo" },
                  { id: "alba", name: "Alba" },
                  { id: "savigliano", name: "Savigliano" },
                  { id: "sommariva", name: "Sommariva Perno" },
                  { id: "asti", name: "Asti" },
                ]
            ).map((l) => (
              <Link key={l.id} href="/#info" className="transition hover:text-aqua">
                {l.name}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-[17px] uppercase tracking-[0.04em] text-white">
            Link Utili
          </h4>
          <div className="mt-4 flex flex-col gap-[9px] text-sm">
            <Link href="/corsi" className="transition hover:text-aqua">
              Corsi &amp; Attività
            </Link>
            <Link href="/news" className="transition hover:text-aqua">
              News &amp; Eventi
            </Link>
            <Link href="/#info" className="transition hover:text-aqua">
              Chi Siamo
            </Link>
            <Link href="/admin" className="transition hover:text-aqua">
              Area Riservata
            </Link>
          </div>
        </div>

        <div id="contatti">
          <h4 className="text-[17px] uppercase tracking-[0.04em] text-white">
            Contatti
          </h4>
          <div className="mt-4 flex flex-col gap-2.5 text-sm">
            <span className="flex gap-[9px]">
              <i className="ph ph-phone text-aqua" />
              +39 0171 123 456
            </span>
            <span className="flex gap-[9px]">
              <i className="ph ph-envelope-simple text-aqua" />
              info@centrosportivoroero.it
            </span>
            <span className="flex gap-[9px]">
              <i className="ph ph-map-pin text-aqua" />
              Via dello Sport 12, Cuneo
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-site flex-wrap items-center justify-between gap-3.5 px-6 py-[18px] text-[13px] text-white/60">
          <span>© 2026 Centro Sportivo Roero S.S.D. · P.IVA 02345670041</span>
          <div className="flex flex-wrap gap-5">
            <a href="#" className="transition hover:text-aqua">
              Privacy Policy
            </a>
            <a href="#" className="transition hover:text-aqua">
              Cookie Policy
            </a>
            <a href="#" className="transition hover:text-aqua">
              Termini di Servizio
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
