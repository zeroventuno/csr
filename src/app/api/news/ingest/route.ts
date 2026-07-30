import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { slugify, uid } from "@/lib/db";
import { ICON_BY_CATEGORY } from "@/lib/newsMeta";
import type { Category } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_CATEGORIES: Category[] = [
  "Corsi",
  "Eventi",
  "Avvisi",
  "Comunicati",
  "Sport",
];

function checkAuth(req: Request): boolean {
  const expected = process.env.NEWS_INGEST_TOKEN;
  if (!expected) return false; // non configurato: nega sempre

  const header = req.headers.get("authorization") || "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!provided) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function isValidUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const title = String(body.title || "").trim();
  const excerpt = String(body.excerpt || "").trim();
  const contentHtml = String(body.contentHtml || "").trim();
  const sourceName = String(body.sourceName || "").trim();
  const sourceUrl = String(body.sourceUrl || "").trim();
  const coverImage = String(body.coverImage || "").trim();
  const categoryRaw = String(body.category || "Sport").trim();
  const category = (VALID_CATEGORIES as string[]).includes(categoryRaw)
    ? (categoryRaw as Category)
    : "Sport";

  const missing: string[] = [];
  if (!title) missing.push("title");
  if (!excerpt) missing.push("excerpt");
  if (!contentHtml) missing.push("contentHtml");
  if (!sourceName) missing.push("sourceName");
  if (!sourceUrl) missing.push("sourceUrl");
  if (missing.length) {
    return NextResponse.json(
      { ok: false, error: "missing_fields", missing },
      { status: 400 }
    );
  }
  if (!isValidUrl(sourceUrl)) {
    return NextResponse.json(
      { ok: false, error: "invalid_source_url" },
      { status: 400 }
    );
  }
  if (title.length > 200 || excerpt.length > 500) {
    return NextResponse.json(
      { ok: false, error: "field_too_long" },
      { status: 400 }
    );
  }

  const sb = supabaseAdmin();

  // dedupe: non creare due volte la stessa fonte
  const { data: existing } = await sb
    .from("news")
    .select("id, slug")
    .eq("source_url", sourceUrl)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({
      ok: true,
      duplicate: true,
      id: existing.id,
      slug: existing.slug,
    });
  }

  let slug = slugify(title) || uid("n_");
  const { data: slugClash } = await sb
    .from("news")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (slugClash) slug = `${slug}-${uid().slice(0, 4)}`;

  const row = {
    slug,
    title,
    category,
    location_ids: [], // "tutte le sedi": notizia di rassegna sportiva generale
    excerpt,
    content: contentHtml,
    cover_image: coverImage || null,
    icon: ICON_BY_CATEGORY[category],
    author: "Rassegna Stampa",
    published: false, // entra sempre come bozza: revisione umana prima della pubblicazione
    date: new Date().toISOString().slice(0, 10),
    source_name: sourceName,
    source_url: sourceUrl,
  };

  const { data: inserted, error } = await sb
    .from("news")
    .insert(row)
    .select("id, slug")
    .single();

  if (error) {
    return NextResponse.json(
      { ok: false, error: "db_error", detail: error.message },
      { status: 500 }
    );
  }

  revalidatePath("/admin/news");
  revalidatePath("/admin");

  return NextResponse.json({
    ok: true,
    duplicate: false,
    id: inserted.id,
    slug: inserted.slug,
  });
}
