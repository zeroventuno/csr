// Tipi condivisi per blocchi corsie e calendario (client + server).

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

export type CalendarType = "blocco" | "evento" | "avviso";

export interface CalendarEntry {
  type: CalendarType;
  date: string; // YYYY-MM-DD
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
};
