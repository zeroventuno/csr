import { randomUUID } from "crypto";
import { supabaseAdmin } from "./supabase";
import type {
  DB,
  Location,
  News,
  Course,
  EventItem,
  Media,
} from "./types";

/* ===================== Mappers (snake_case -> camelCase) ===================== */

export function mapLocation(r: any): Location {
  return {
    id: r.id,
    name: r.name,
    address: r.address,
    hours: r.hours,
    phone: r.phone,
    email: r.email || "",
    pool: r.pool,
    mapsEmbed: r.maps_embed || undefined,
    nuotoLibero: r.nuoto_libero || "",
    nuotoLiberoPdf: r.nuoto_libero_pdf || "",
  };
}

export function mapNews(r: any): News {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    category: r.category,
    locationIds: r.location_ids || [],
    excerpt: r.excerpt || "",
    content: r.content || "",
    coverImage: r.cover_image || "",
    icon: r.icon,
    author: r.author,
    published: !!r.published,
    date: typeof r.date === "string" ? r.date.slice(0, 10) : r.date,
    createdAt: r.created_at,
  };
}

export function mapCourse(r: any): Course {
  return {
    id: r.id,
    categoryId: r.category_id,
    name: r.name,
    age: r.age,
    schedule: r.schedule,
    price: r.price,
    priceNote: r.price_note || "",
    instructor: r.instructor,
    locationIds: r.location_ids || [],
    createdAt: r.created_at,
  };
}

export function mapEvent(r: any): EventItem {
  return {
    id: r.id,
    title: r.title,
    date: typeof r.date === "string" ? r.date.slice(0, 10) : r.date,
    time: r.time,
    endTime: r.end_time || "",
    locationIds: r.location_ids || [],
    description: r.description || "",
    image: r.image || "",
    poolId: r.pool_id || "",
    laneIds: r.lane_ids || [],
    createdAt: r.created_at,
  };
}

export function mapMedia(r: any): Media {
  return {
    id: r.id,
    name: r.name,
    url: r.url,
    type: r.type,
    size: r.size,
    createdAt: r.created_at,
  };
}

/* ===================== Reads ===================== */

export async function getLocations(): Promise<Location[]> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("locations")
    .select("*")
    .order("sort", { ascending: true });
  if (error) throw error;
  return (data || []).map(mapLocation);
}

export async function getNews(): Promise<News[]> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("news")
    .select("*")
    .order("date", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapNews);
}

export async function getCourses(): Promise<Course[]> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("courses")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []).map(mapCourse);
}

export async function getEvents(): Promise<EventItem[]> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("events")
    .select("*")
    .order("date", { ascending: true });
  if (error) throw error;
  return (data || []).map(mapEvent);
}

export async function getMedia(): Promise<Media[]> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("media")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapMedia);
}

/** Carica tutte le collezioni in parallelo (comodo per le pagine). */
export async function getDB(): Promise<DB> {
  const [locations, news, courses, events, media] = await Promise.all([
    getLocations(),
    getNews(),
    getCourses(),
    getEvents(),
    getMedia(),
  ]);
  return { locations, news, courses, events, media };
}

export async function getNewsBySlug(slug: string): Promise<News | null> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("news")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? mapNews(data) : null;
}

/* ===================== Utils ===================== */

export function uid(prefix = ""): string {
  return prefix + randomUUID().slice(0, 8);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
}
