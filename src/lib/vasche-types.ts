// Tipi e costanti condivisi per il sistema di disponibilità corsie (client + server).

export type Pace = "lenta" | "media" | "rapida";

export const PACES: { id: Pace; label: string; icon: string }[] = [
  { id: "lenta", label: "Lenta", icon: "ph-person-simple-walk" },
  { id: "media", label: "Media", icon: "ph-person-simple-swim" },
  { id: "rapida", label: "Veloce", icon: "ph-lightning" },
];

export function paceLabel(p: Pace): string {
  return PACES.find((x) => x.id === p)?.label || p;
}
export function paceIcon(p: Pace): string {
  return PACES.find((x) => x.id === p)?.icon || "ph-waves";
}

/** Etichetta della piscina ("Externa" o "Interna · Lato A"). */
export function poolLabel(name: string, side: string | null): string {
  return side ? `${name} · Lato ${side}` : name;
}

/* ---- Disponibilità pubblica (aggregata) ---- */
export interface PaceAvail {
  pace: Pace;
  free: number;
  total: number;
}
export interface PoolAvail {
  id: string;
  name: string;
  lengthMeters: number;
  side: string | null;
  paces: PaceAvail[];
  free: number;
  total: number;
}
export interface AvailabilitySnapshot {
  pools: PoolAvail[];
  updatedAt: string; // ISO
  ok: boolean; // false se le tabelle non esistono ancora
}

/* ---- Dati dettagliati recepção (admin) ---- */
export interface LaneDetail {
  id: string;
  poolName: string;
  side: string | null;
  laneNumber: number;
  pace: Pace;
  capacity: number;
  active: number;
}
export interface ReceptionPool {
  id: string;
  name: string;
  side: string | null;
  lanes: LaneDetail[];
}
export interface ReceptionSnapshot {
  pools: ReceptionPool[];
  totalInWater: number;
  updatedAt: string;
  ok: boolean;
}

/* ---- Risultato check-in ---- */
export interface CheckinResult {
  ok: boolean;
  error?: string;
  checkinId?: string;
  poolName?: string;
  side?: string | null;
  laneNumber?: number;
  pace?: Pace;
  active?: number;
  capacity?: number;
}
