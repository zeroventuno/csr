const MESI_ABBR = [
  "Gen", "Feb", "Mar", "Apr", "Mag", "Giu",
  "Lug", "Ago", "Set", "Ott", "Nov", "Dic",
];

const MESI = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];

function parse(iso: string): Date {
  // accetta "YYYY-MM-DD" o ISO completo
  const d = new Date(iso.length <= 10 ? iso + "T00:00:00" : iso);
  return d;
}

/** "24 Giu 2026" */
export function formatDate(iso: string): string {
  const d = parse(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${MESI_ABBR[d.getMonth()]} ${d.getFullYear()}`;
}

/** "24 Giugno 2026" */
export function formatDateLong(iso: string): string {
  const d = parse(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${MESI[d.getMonth()]} ${d.getFullYear()}`;
}

/** "24 Giu" */
export function formatDayMonth(iso: string): string {
  const d = parse(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${MESI_ABBR[d.getMonth()]}`;
}

export function dayNumber(iso: string): string {
  const d = parse(iso);
  return String(d.getDate()).padStart(2, "0");
}

export function monthAbbr(iso: string): string {
  const d = parse(iso);
  return MESI_ABBR[d.getMonth()];
}
