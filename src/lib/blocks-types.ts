// Tipi condivisi per blocchi corsie, chiusure e calendario (client + server).

export interface LaneBlock {
  id: string;
  locationId: string;
  poolId: string;
  poolLabel: string;
  laneIds: string[];
  laneNumbers: number[];
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  title: string;
  note: string;
  newsSlug: string;
  eventId: string | null; // se impostato, il blocco è generato da un evento (non gestibile qui)
}

export interface BlockInput {
  id?: string;
  locationId: string;
  poolId: string;
  laneIds: string[];
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  note: string;
  newsSlug: string;
}

/* ===================== CHIUSURE ===================== */

/** Chiusura di una vasca (o dell'intera sede) per un intervallo di giorni. */
export interface Closure {
  id: string;
  locationId: string;
  poolId: string | null; // null = tutta la sede
  poolLabel: string; // "Tutta la sede" quando poolId è null
  dateFrom: string; // YYYY-MM-DD (inclusa)
  dateTo: string; // YYYY-MM-DD (inclusa)
  title: string;
  note: string;
  published: boolean;
}

export interface ClosureInput {
  id?: string;
  locationId: string;
  poolId: string | null;
  dateFrom: string;
  dateTo: string;
  title: string;
  note: string;
  published: boolean;
}

export const WHOLE_LOCATION_LABEL = "Tutta la sede";

export type ClosureStatus = "bozza" | "attiva" | "programmata" | "conclusa";

export const CLOSURE_STATUS_META: Record<
  ClosureStatus,
  { label: string; color: string }
> = {
  bozza: { label: "Bozza", color: "var(--muted)" },
  attiva: { label: "In corso", color: "var(--red)" },
  programmata: { label: "Programmata", color: "var(--amber)" },
  conclusa: { label: "Conclusa", color: "var(--muted)" },
};

/** Stato di una chiusura rispetto a una data (YYYY-MM-DD). */
export function closureStatus(
  c: { dateFrom: string; dateTo: string; published: boolean },
  today: string
): ClosureStatus {
  if (!c.published) return "bozza";
  if (today < c.dateFrom) return "programmata";
  if (today > c.dateTo) return "conclusa";
  return "attiva";
}

/* ===================== CALENDARIO ===================== */

export type CalendarType = "blocco" | "evento" | "avviso" | "chiusura";

export interface CalendarEntry {
  type: CalendarType;
  date: string; // YYYY-MM-DD (inizio)
  dateTo?: string; // YYYY-MM-DD (fine inclusa) per le voci su più giorni
  time?: string; // HH:MM
  endTime?: string; // HH:MM
  title: string;
  subtitle?: string;
  href?: string;
  icon: string;
}

export const CAL_META: Record<
  CalendarType,
  { label: string; color: string; icon: string }
> = {
  blocco: { label: "Blocco corsie", color: "var(--red)", icon: "ph-prohibit" },
  evento: { label: "Evento", color: "var(--aqua)", icon: "ph-calendar-dots" },
  avviso: { label: "Avviso", color: "var(--amber)", icon: "ph-megaphone" },
  chiusura: {
    label: "Chiusura",
    color: "var(--red)",
    icon: "ph-warning-octagon",
  },
};
