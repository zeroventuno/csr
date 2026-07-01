"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin, MEDIA_BUCKET } from "./supabase";
import { slugify, uid } from "./db";
import { getSession } from "./session";
import { SESSION_COOKIE, createToken, COOKIE_MAX_AGE } from "./auth";
import type {
  Category,
  Media,
  NewsInput,
  CourseInput,
  EventInput,
  LocationInput,
} from "./types";

function revalidatePublic() {
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/corsi");
}
function revalidateAdmin() {
  revalidatePath("/admin");
  revalidatePath("/admin/news");
  revalidatePath("/admin/courses");
  revalidatePath("/admin/events");
  revalidatePath("/admin/locations");
  revalidatePath("/admin/media");
}

async function requireAdmin() {
  const s = await getSession();
  if (!s || s.role !== "admin") {
    throw new Error("Operazione riservata agli amministratori.");
  }
}

/* ===================== AUTH ===================== */

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") || "");
  const from = String(formData.get("from") || "/admin");

  const adminPw = process.env.ADMIN_PASSWORD || "roero-admin";
  const editorPw = process.env.EDITOR_PASSWORD || "roero-editor";

  let role: "admin" | "editor" | null = null;
  if (password && password === adminPw) role = "admin";
  else if (password && password === editorPw) role = "editor";

  if (!role) {
    redirect(
      "/admin/login?error=1" + (from ? `&from=${encodeURIComponent(from)}` : "")
    );
  }

  const token = await createToken(role);
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  redirect(from && from.startsWith("/admin") ? from : "/admin");
}

export async function logoutAction() {
  cookies().delete(SESSION_COOKIE);
  redirect("/admin/login");
}

/* ===================== NEWS ===================== */

const ICON_BY_CATEGORY: Record<Category, string> = {
  Corsi: "ph-graduation-cap",
  Eventi: "ph-waves",
  Avvisi: "ph-megaphone",
  Comunicati: "ph-file-text",
};

export async function saveNews(input: NewsInput) {
  const session = await getSession();
  if (!session) throw new Error("Non autenticato.");
  const sb = supabaseAdmin();

  if (input.id) {
    const { error } = await sb
      .from("news")
      .update({
        title: input.title,
        category: input.category,
        location_ids: input.locationIds,
        excerpt: input.excerpt,
        content: input.content,
        cover_image: input.coverImage || null,
        published: input.published,
        date: input.date,
        icon: ICON_BY_CATEGORY[input.category],
      })
      .eq("id", input.id);
    if (error) throw error;
  } else {
    let slug = slugify(input.title) || uid();
    const { data: existing } = await sb
      .from("news")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (existing) slug = `${slug}-${uid().slice(0, 4)}`;

    const { error } = await sb.from("news").insert({
      slug,
      title: input.title,
      category: input.category,
      location_ids: input.locationIds,
      excerpt: input.excerpt,
      content: input.content,
      cover_image: input.coverImage || null,
      icon: ICON_BY_CATEGORY[input.category],
      author: session.role === "admin" ? "Amministratore" : "Editor",
      published: input.published,
      date: input.date,
    });
    if (error) throw error;
  }

  revalidatePublic();
  revalidateAdmin();
}

export async function toggleNewsPublished(id: string) {
  const session = await getSession();
  if (!session) throw new Error("Non autenticato.");
  const sb = supabaseAdmin();
  const { data } = await sb
    .from("news")
    .select("published")
    .eq("id", id)
    .maybeSingle();
  if (data) {
    const { error } = await sb
      .from("news")
      .update({ published: !data.published })
      .eq("id", id);
    if (error) throw error;
    revalidatePublic();
    revalidateAdmin();
  }
}

export async function deleteNews(id: string) {
  await requireAdmin();
  const sb = supabaseAdmin();
  const { error } = await sb.from("news").delete().eq("id", id);
  if (error) throw error;
  revalidatePublic();
  revalidateAdmin();
}

/* ===================== COURSES ===================== */

export async function saveCourse(input: CourseInput) {
  const session = await getSession();
  if (!session) throw new Error("Non autenticato.");
  const sb = supabaseAdmin();

  const row = {
    category_id: input.categoryId,
    name: input.name,
    age: input.age,
    schedule: input.schedule,
    price: input.price,
    price_note: input.priceNote,
    instructor: input.instructor,
    location_ids: input.locationIds,
  };

  if (input.id) {
    const { error } = await sb.from("courses").update(row).eq("id", input.id);
    if (error) throw error;
  } else {
    const { error } = await sb.from("courses").insert(row);
    if (error) throw error;
  }
  revalidatePublic();
  revalidateAdmin();
}

export async function deleteCourse(id: string) {
  await requireAdmin();
  const sb = supabaseAdmin();
  const { error } = await sb.from("courses").delete().eq("id", id);
  if (error) throw error;
  revalidatePublic();
  revalidateAdmin();
}

/* ===================== EVENTS ===================== */

export async function saveEvent(input: EventInput) {
  const session = await getSession();
  if (!session) throw new Error("Non autenticato.");
  const sb = supabaseAdmin();

  const row = {
    title: input.title,
    date: input.date,
    time: input.time,
    end_time: input.endTime || null,
    location_ids: input.locationIds,
    description: input.description,
    image: input.image || null,
    pool_id: input.poolId || null,
    lane_ids: input.laneIds || [],
  };

  let eventId = input.id;
  if (eventId) {
    const { error } = await sb.from("events").update(row).eq("id", eventId);
    if (error) throw error;
  } else {
    const { data, error } = await sb
      .from("events")
      .insert(row)
      .select("id")
      .single();
    if (error) throw error;
    eventId = data.id;
  }

  await syncEventLaneBlock(sb, eventId!, input);

  revalidatePublic();
  revalidateAdmin();
}

/** Crea/aggiorna/rimuove il blocco corsie collegato a un evento. */
async function syncEventLaneBlock(
  sb: ReturnType<typeof supabaseAdmin>,
  eventId: string,
  input: EventInput
) {
  const blocking = !!input.poolId && input.laneIds.length > 0 && !!input.endTime;

  if (!blocking) {
    await sb.from("lane_blocks").delete().eq("event_id", eventId);
    return;
  }

  const { data: pool } = await sb
    .from("pools")
    .select("location_id")
    .eq("id", input.poolId)
    .maybeSingle();
  if (!pool) return;

  const blockRow = {
    location_id: pool.location_id,
    pool_id: input.poolId,
    lane_ids: input.laneIds,
    block_date: input.date,
    start_time: input.time,
    end_time: input.endTime,
    title: input.title,
    note: input.description || "",
    news_slug: "",
    event_id: eventId,
  };

  const { data: existing } = await sb
    .from("lane_blocks")
    .select("id")
    .eq("event_id", eventId)
    .maybeSingle();

  if (existing) {
    await sb.from("lane_blocks").update(blockRow).eq("id", existing.id);
  } else {
    await sb.from("lane_blocks").insert(blockRow);
  }
}

export async function deleteEvent(id: string) {
  await requireAdmin();
  const sb = supabaseAdmin();
  const { error } = await sb.from("events").delete().eq("id", id);
  if (error) throw error;
  revalidatePublic();
  revalidateAdmin();
}

/* ===================== LOCATIONS ===================== */

export async function saveLocation(input: LocationInput) {
  const session = await getSession();
  if (!session) throw new Error("Non autenticato.");
  const sb = supabaseAdmin();
  const { error } = await sb
    .from("locations")
    .update({
      name: input.name,
      address: input.address,
      hours: input.hours,
      phone: input.phone,
      email: input.email || "",
      pool: Math.max(0, Math.min(100, Number(input.pool) || 0)),
      maps_embed: input.mapsEmbed || null,
      nuoto_libero: input.nuotoLibero || "",
      nuoto_libero_pdf: input.nuotoLiberoPdf || "",
    })
    .eq("id", input.id);
  if (error) throw error;
  revalidatePublic();
  revalidateAdmin();
}

/* ===================== MEDIA ===================== */

const TYPE_BY_EXT: Record<string, Media["type"]> = {
  jpg: "image", jpeg: "image", png: "image", gif: "image", webp: "image", svg: "image",
  mp4: "video", webm: "video", mov: "video",
  pdf: "pdf",
  doc: "doc", docx: "doc", txt: "doc",
};

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function uploadMedia(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Non autenticato.");

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) throw new Error("Nessun file selezionato.");

  const sb = supabaseAdmin();
  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const safeBase = slugify(file.name.replace(/\.[^.]+$/, "")) || "file";
  const path = `${safeBase}-${uid()}.${ext}`;

  const arrayBuf = await file.arrayBuffer();
  const { error: upErr } = await sb.storage
    .from(MEDIA_BUCKET)
    .upload(path, arrayBuf, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
  if (upErr) throw upErr;

  const {
    data: { publicUrl },
  } = sb.storage.from(MEDIA_BUCKET).getPublicUrl(path);

  const { error: insErr } = await sb.from("media").insert({
    name: file.name,
    url: publicUrl,
    type: TYPE_BY_EXT[ext] || "other",
    size: humanSize(file.size),
    storage_path: path,
  });
  if (insErr) throw insErr;

  revalidateAdmin();
  return publicUrl;
}

export async function deleteMedia(id: string) {
  await requireAdmin();
  const sb = supabaseAdmin();

  const { data } = await sb
    .from("media")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();

  if (data?.storage_path) {
    await sb.storage.from(MEDIA_BUCKET).remove([data.storage_path]);
  }

  const { error } = await sb.from("media").delete().eq("id", id);
  if (error) throw error;
  revalidateAdmin();
}
