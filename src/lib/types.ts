export type Category = "Corsi" | "Eventi" | "Avvisi" | "Comunicati";

export type Role = "admin" | "editor";

export interface Location {
  id: string;
  name: string;
  address: string;
  hours: string;
  phone: string;
  email: string;
  pool: number; // % posti liberi (widget disponibilita')
  mapsEmbed?: string; // URL src per iframe Google Maps
}

export interface News {
  id: string;
  slug: string;
  title: string;
  category: Category;
  locationIds: string[]; // ids sedi collegate; vuoto = tutte le sedi
  excerpt: string;
  content: string; // HTML
  coverImage?: string; // url immagine di copertina
  icon: string; // classe phosphor (fallback quando manca l'immagine)
  author: string;
  published: boolean;
  date: string; // ISO date (data di pubblicazione)
  createdAt: string;
}

export interface Course {
  id: string;
  categoryId: string; // riferimento a CATEGORIES in lib/categories
  name: string;
  age: string;
  schedule: string;
  price: string;
  priceNote: string;
  instructor: string;
  locationIds: string[]; // ids sedi collegate; vuoto = tutte le sedi
  createdAt: string;
}

export interface EventItem {
  id: string;
  title: string;
  date: string; // ISO date
  time: string;
  locationIds: string[]; // ids sedi collegate; vuoto = tutte le sedi
  description: string;
  image?: string;
  createdAt: string;
}

export interface Media {
  id: string;
  name: string;
  url: string;
  type: "image" | "video" | "pdf" | "doc" | "other";
  size: string;
  createdAt: string;
}

export interface DB {
  locations: Location[];
  news: News[];
  courses: Course[];
  events: EventItem[];
  media: Media[];
}

/* ===== Input types per le server actions (CRUD) ===== */

export interface NewsInput {
  id?: string;
  title: string;
  category: Category;
  locationIds: string[];
  excerpt: string;
  content: string;
  coverImage?: string;
  published: boolean;
  date: string;
}

export interface CourseInput {
  id?: string;
  categoryId: string;
  name: string;
  age: string;
  schedule: string;
  price: string;
  priceNote: string;
  instructor: string;
  locationIds: string[];
}

export interface EventInput {
  id?: string;
  title: string;
  date: string;
  time: string;
  locationIds: string[];
  description: string;
  image?: string;
}

export interface LocationInput {
  id: string;
  name: string;
  address: string;
  hours: string;
  phone: string;
  email: string;
  pool: number;
  mapsEmbed?: string;
}
