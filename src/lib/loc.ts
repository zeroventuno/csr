// Helper puri per la logica multi-sede (usabili sia client che server).
// Convenzione: location_ids vuoto = "tutte le sedi".

export interface LocLite {
  id: string;
  name: string;
}

/** Un item appartiene alla sede `locId`? (vuoto = tutte le sedi) */
export function matchesLocation(ids: string[], locId: string): boolean {
  return !ids || ids.length === 0 || ids.includes(locId);
}

/** Etichetta breve per le card/tabelle. */
export function locationLabel(ids: string[], locations: LocLite[]): string {
  if (!ids || ids.length === 0) return "Tutte le sedi";
  const names = ids
    .map((id) => locations.find((l) => l.id === id)?.name || id)
    .filter(Boolean);
  if (names.length === 0) return "Tutte le sedi";
  if (names.length <= 2) return names.join(" · ");
  return `${names[0]} +${names.length - 1}`;
}

/** Lista completa dei nomi delle sedi collegate (per i dettagli). */
export function locationNames(ids: string[], locations: LocLite[]): string[] {
  if (!ids || ids.length === 0) return ["Tutte le sedi"];
  return ids.map((id) => locations.find((l) => l.id === id)?.name || id);
}
