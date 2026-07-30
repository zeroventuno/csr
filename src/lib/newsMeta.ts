import type { Category } from "./types";

// Icona di fallback per categoria news (usata quando manca un'immagine di copertina).
export const ICON_BY_CATEGORY: Record<Category, string> = {
  Corsi: "ph-graduation-cap",
  Eventi: "ph-waves",
  Avvisi: "ph-megaphone",
  Comunicati: "ph-file-text",
  Sport: "ph-trophy",
};
