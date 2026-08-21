import { formatDate } from "@/lib/format";

/**
 * Avviso di chiusura (vasca o intera sede) per un periodo di giorni.
 * Componente "condiviso": nessun hook, così è utilizzabile sia da server
 * component (pagina sede) sia da client component (LocationSwitcher).
 */
export default function ClosureBanner({
  title,
  note,
  dateFrom,
  dateTo,
  scopeLabel,
  upcoming = false,
  compact = false,
}: {
  title: string;
  note?: string;
  dateFrom: string;
  dateTo: string;
  /** "Tutta la sede" oppure l'etichetta della vasca */
  scopeLabel: string;
  /** true = non ancora iniziata (chiusura programmata) */
  upcoming?: boolean;
  compact?: boolean;
}) {
  const color = upcoming ? "var(--amber)" : "var(--red)";
  const tint = upcoming ? "rgba(240,173,78,.10)" : "rgba(214,72,92,.10)";
  const kicker = upcoming ? "Chiusura programmata" : "Chiusura in corso";
  const when =
    dateFrom === dateTo
      ? `il ${formatDate(dateFrom)}`
      : `dal ${formatDate(dateFrom)} al ${formatDate(dateTo)}`;

  return (
    <div
      className={`flex gap-3.5 rounded-[16px] border ${compact ? "p-3.5" : "p-5"}`}
      style={{ borderColor: color, background: tint }}
    >
      <span
        className={`grid flex-none place-items-center rounded-[12px] text-white ${
          compact ? "h-9 w-9 text-lg" : "h-11 w-11 text-xl"
        }`}
        style={{ background: color }}
      >
        <i className="ph-fill ph-warning-octagon" />
      </span>
      <div className="min-w-0">
        <div
          className="text-[11.5px] font-bold uppercase tracking-[0.09em]"
          style={{ color }}
        >
          {kicker} · {scopeLabel}
        </div>
        <div
          className={`mt-0.5 font-bold text-text ${
            compact ? "text-[15px]" : "text-[18px]"
          }`}
        >
          {title}
        </div>
        <div className="mt-0.5 text-[13.5px] font-semibold text-text">
          {upcoming ? "Sarà chiusa" : "Chiusa"} {when}
        </div>
        {note ? (
          <p className="mt-1.5 text-[13px] leading-[1.5] text-muted">{note}</p>
        ) : null}
      </div>
    </div>
  );
}
