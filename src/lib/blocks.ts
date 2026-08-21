"use server";

import { supabaseAdmin, supabaseFresh } from "./supabase";
import { getSession } from "./session";
import { getDB } from "./db";
import { matchesLocation } from "./loc";
import { poolLabel } from "./vasche-types";
import type {
  LaneBlock,
  BlockInput,
  CalendarEntry,
  Closure,
  ClosureInput,
} from "./blocks-types";
import { WHOLE_LOCATION_LABEL } from "./blocks-types";

const DEFAULT_LOCATION = "cuneo";

/** Data e ora correnti nel fuso Europe/Rome come stringhe (YYYY-MM-DD, HH:MM). */
function romeNow(): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value || "";
  let hour = get("hour");
  if (hour === "24") hour = "00";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${hour}:${get("minute")}`,
  };
}

/** Somma (o sottrae) giorni a una data YYYY-MM-DD, senza sorprese di fuso. */
function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

/**
 * Messaggio d'errore leggibile: distingue "la tabella non esiste ancora"
 * (migrazione non applicata) da un errore reale.
 */
function friendlyError(e: any, fallback: string): string {
  const code = String(e?.code || "");
  const msg = String(e?.message || "");
  if (
    code === "42P01" ||
    code === "PGRST205" ||
    /schema cache|does not exist|relation .* does not exist/i.test(msg)
  ) {
    return "Le chiusure non sono ancora attive sul database: esegui supabase/chiusure.sql nel SQL Editor di Supabase.";
  }
  return msg || fallback;
}

/** ID delle corsie attualmente bloccate per la sede (usato da vasche.ts). */
export async function activeBlockedLaneIds(
  locationId: string
): Promise<string[]> {
  try {
    const sb = supabaseAdmin();
    const { date, time } = romeNow();
    const { data, error } = await sb
      .from("lane_blocks")
      .select("lane_ids,start_time,end_time")
      .eq("location_id", locationId)
      .eq("block_date", date);
    if (error) throw error;
    const set = new Set<string>();
    (data || []).forEach((b: any) => {
      const st = String(b.start_time || "").slice(0, 5);
      const et = String(b.end_time || "").slice(0, 5);
      if (time >= st && time < et)
        (b.lane_ids || []).forEach((id: string) => set.add(id));
    });
    return [...set];
  } catch {
    return [];
  }
}

/** Blocchi della sede (risolti con label vasca e numeri corsia). */
export async function getBlocks(
  locationId: string = DEFAULT_LOCATION
): Promise<LaneBlock[]> {
  try {
    const sb = supabaseAdmin();
    const [{ data: blocks }, { data: pools }, { data: lanes }] =
      await Promise.all([
        sb
          .from("lane_blocks")
          .select("*")
          .eq("location_id", locationId)
          .order("block_date", { ascending: true })
          .order("start_time", { ascending: true }),
        sb.from("pools").select("id,name,side").eq("location_id", locationId),
        sb.from("lanes").select("id,pool_id,lane_number"),
      ]);

    const poolMap = new Map(
      (pools || []).map((p: any) => [p.id, poolLabel(p.name, p.side)])
    );
    const laneNum = new Map((lanes || []).map((l: any) => [l.id, l.lane_number]));

    return (blocks || []).map((b: any) => ({
      id: b.id,
      locationId: b.location_id,
      poolId: b.pool_id,
      poolLabel: poolMap.get(b.pool_id) || "—",
      laneIds: b.lane_ids || [],
      laneNumbers: (b.lane_ids || [])
        .map((id: string) => laneNum.get(id))
        .filter((n: any) => n != null)
        .sort((a: number, b2: number) => a - b2),
      date: typeof b.block_date === "string" ? b.block_date.slice(0, 10) : b.block_date,
      startTime: String(b.start_time || "").slice(0, 5),
      endTime: String(b.end_time || "").slice(0, 5),
      title: b.title,
      note: b.note || "",
      newsSlug: b.news_slug || "",
      eventId: b.event_id || null,
    }));
  } catch {
    return [];
  }
}

/** Solo i blocchi creati manualmente (non generati da un evento). */
export async function getManualBlocks(
  locationId: string = DEFAULT_LOCATION
): Promise<LaneBlock[]> {
  const blocks = await getBlocks(locationId);
  return blocks.filter((b) => !b.eventId);
}

export async function saveBlock(input: BlockInput) {
  const session = await getSession();
  if (!session) throw new Error("Non autenticato.");
  const sb = supabaseAdmin();
  const row = {
    location_id: input.locationId,
    pool_id: input.poolId,
    lane_ids: input.laneIds,
    block_date: input.date,
    start_time: input.startTime,
    end_time: input.endTime,
    title: input.title,
    note: input.note || "",
    news_slug: input.newsSlug || "",
  };
  if (input.id) {
    const { error } = await sb.from("lane_blocks").update(row).eq("id", input.id);
    if (error) throw error;
  } else {
    const { error } = await sb.from("lane_blocks").insert(row);
    if (error) throw error;
  }
}

export async function deleteBlock(id: string) {
  const session = await getSession();
  if (!session) throw new Error("Non autenticato.");
  const sb = supabaseAdmin();
  const { error } = await sb.from("lane_blocks").delete().eq("id", id);
  if (error) throw error;
}

/* ===================== CHIUSURE (periodi di più giorni) ===================== */
/*
 * Tutte le letture sono "a prova di migrazione mancante": se la tabella
 * public.closures non esiste ancora restituiscono un elenco vuoto e il sito
 * continua a funzionare esattamente come prima.
 */

const CLOSURE_COLS = "id,location_id,pool_id,date_from,date_to,title,note,published";

function isoDate(v: any): string {
  return typeof v === "string" ? v.slice(0, 10) : String(v ?? "");
}

/** Risolve le etichette delle vasche e normalizza le righe. */
async function mapClosures(
  sb: ReturnType<typeof supabaseAdmin>,
  rows: any[]
): Promise<Closure[]> {
  const poolIds = [
    ...new Set(rows.map((r) => r.pool_id).filter(Boolean)),
  ] as string[];

  const labels = new Map<string, string>();
  if (poolIds.length > 0) {
    const { data: pools } = await sb
      .from("pools")
      .select("id,name,side")
      .in("id", poolIds);
    (pools || []).forEach((p: any) =>
      labels.set(p.id, poolLabel(p.name, p.side))
    );
  }

  return rows.map((r) => ({
    id: r.id,
    locationId: r.location_id,
    poolId: r.pool_id || null,
    poolLabel: r.pool_id
      ? labels.get(r.pool_id) || "Vasca"
      : WHOLE_LOCATION_LABEL,
    dateFrom: isoDate(r.date_from),
    dateTo: isoDate(r.date_to),
    title: r.title || "",
    note: r.note || "",
    published: !!r.published,
  }));
}

/** Chiusure pubblicate attive OGGI (fuso Europe/Rome), estremi inclusi. */
export async function activeClosures(locationId?: string): Promise<Closure[]> {
  try {
    const sb = supabaseFresh();
    const today = romeNow().date;
    let q = sb
      .from("closures")
      .select(CLOSURE_COLS)
      .eq("published", true)
      .lte("date_from", today)
      .gte("date_to", today);
    if (locationId) q = q.eq("location_id", locationId);
    const { data, error } = await q.order("date_from", { ascending: true });
    if (error) throw error;
    return await mapClosures(sb, data || []);
  } catch {
    return [];
  }
}

/** Chiusure pubblicate che iniziano nei prossimi `withinDays` giorni. */
export async function upcomingClosures(
  locationId?: string,
  withinDays: number = 60
): Promise<Closure[]> {
  try {
    const sb = supabaseFresh();
    const today = romeNow().date;
    let q = sb
      .from("closures")
      .select(CLOSURE_COLS)
      .eq("published", true)
      .gt("date_from", today)
      .lte("date_from", addDays(today, withinDays));
    if (locationId) q = q.eq("location_id", locationId);
    const { data, error } = await q.order("date_from", { ascending: true });
    if (error) throw error;
    return await mapClosures(sb, data || []);
  } catch {
    return [];
  }
}

/** Tutte le chiusure (admin): le più recenti per prime. */
export async function getClosures(locationId?: string): Promise<Closure[]> {
  try {
    const sb = supabaseFresh();
    let q = sb.from("closures").select(CLOSURE_COLS);
    if (locationId) q = q.eq("location_id", locationId);
    const { data, error } = await q.order("date_from", { ascending: false });
    if (error) throw error;
    return await mapClosures(sb, data || []);
  } catch {
    return [];
  }
}

/** Chiusure pubblicate non ancora concluse (per calendario e avvisi). */
async function currentAndFutureClosures(
  locationId?: string
): Promise<Closure[]> {
  try {
    const sb = supabaseFresh();
    const today = romeNow().date;
    let q = sb
      .from("closures")
      .select(CLOSURE_COLS)
      .eq("published", true)
      .gte("date_to", today);
    if (locationId) q = q.eq("location_id", locationId);
    const { data, error } = await q.order("date_from", { ascending: true });
    if (error) throw error;
    return await mapClosures(sb, data || []);
  } catch {
    return [];
  }
}

export async function saveClosure(
  input: ClosureInput
): Promise<{ ok: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Non autenticato." };

  const title = (input.title || "").trim();
  if (!title) return { ok: false, error: "Inserisci un titolo per la chiusura." };
  if (!input.locationId) return { ok: false, error: "Seleziona una sede." };
  if (!input.dateFrom || !input.dateTo)
    return { ok: false, error: "Indica data di inizio e di fine." };
  if (input.dateTo < input.dateFrom)
    return {
      ok: false,
      error: "La data di fine non può precedere quella di inizio.",
    };

  try {
    const sb = supabaseFresh();
    const row = {
      location_id: input.locationId,
      pool_id: input.poolId || null,
      date_from: input.dateFrom,
      date_to: input.dateTo,
      title,
      note: input.note || "",
      published: !!input.published,
    };
    if (input.id) {
      const { error } = await sb.from("closures").update(row).eq("id", input.id);
      if (error) throw error;
    } else {
      const { error } = await sb.from("closures").insert(row);
      if (error) throw error;
    }
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: friendlyError(e, "Errore durante il salvataggio.") };
  }
}

export async function deleteClosure(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Non autenticato." };
  try {
    const sb = supabaseFresh();
    const { error } = await sb.from("closures").delete().eq("id", id);
    if (error) throw error;
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: friendlyError(e, "Errore durante l'eliminazione.") };
  }
}

/** Voce di calendario corrispondente a una chiusura. */
function closureEntry(c: Closure): CalendarEntry {
  return {
    type: "chiusura",
    date: c.dateFrom,
    dateTo: c.dateTo,
    title: c.title,
    subtitle: c.poolLabel,
    href: `/sedi/${c.locationId}`,
    icon: "ph-warning-octagon",
  };
}

/** Aggrega blocchi + eventi + news (avvisi) della sede per il calendario. */
export async function getCalendarEntries(
  locationId: string = DEFAULT_LOCATION
): Promise<CalendarEntry[]> {
  const [db, allBlocks, closures] = await Promise.all([
    getDB(),
    getBlocks(locationId),
    getClosures(locationId),
  ]);
  // i blocchi generati da un evento sono già rappresentati dalla voce "evento" qui sotto
  const blocks = allBlocks.filter((b) => !b.eventId);
  const entries: CalendarEntry[] = [];

  // le chiusure occupano un intervallo di giorni: una sola voce con dateTo
  closures
    .filter((c) => c.published)
    .forEach((c) => entries.push(closureEntry(c)));

  blocks.forEach((b) => {
    entries.push({
      type: "blocco",
      date: b.date,
      time: b.startTime,
      endTime: b.endTime,
      title: b.title,
      subtitle:
        b.poolLabel +
        (b.laneNumbers.length ? ` · corsie ${b.laneNumbers.join(", ")}` : ""),
      href: b.newsSlug ? `/news/${b.newsSlug}` : undefined,
      icon: "ph-prohibit",
    });
  });

  db.events
    .filter((e) => matchesLocation(e.locationIds, locationId))
    .forEach((e) => {
      entries.push({
        type: "evento",
        date: e.date,
        time: e.time,
        title: e.title,
        subtitle: e.description || "Evento",
        icon: "ph-calendar-dots",
      });
    });

  db.news
    .filter((n) => n.published && matchesLocation(n.locationIds, locationId))
    .forEach((n) => {
      entries.push({
        type: "avviso",
        date: n.date,
        title: n.title,
        subtitle: n.category,
        href: `/news/${n.slug}`,
        icon: "ph-megaphone",
      });
    });

  return entries;
}

/** Prossimo avviso datato (blocco o evento) per la home/pagina sede. */
export async function getNextNotice(
  locationId: string = DEFAULT_LOCATION
): Promise<CalendarEntry | null> {
  const { date: today, time: now } = romeNow();
  const [db, allBlocks, closures] = await Promise.all([
    getDB(),
    getBlocks(locationId),
    currentAndFutureClosures(locationId),
  ]);
  const blocks = allBlocks.filter((b) => !b.eventId);

  // Una chiusura in corso è l'informazione più importante per chi sta per
  // mettersi in auto: ha la precedenza su qualsiasi altro avviso datato.
  const active = closures.find(
    (c) => c.dateFrom <= today && c.dateTo >= today
  );
  if (active) return closureEntry(active);

  const candidates: CalendarEntry[] = [];
  closures
    .filter((c) => c.dateFrom > today)
    .forEach((c) => candidates.push(closureEntry(c)));
  blocks.forEach((b) => {
    // futuro, oppure oggi non ancora finito
    if (b.date > today || (b.date === today && b.endTime > now)) {
      candidates.push({
        type: "blocco",
        date: b.date,
        time: b.startTime,
        endTime: b.endTime,
        title: b.title,
        subtitle: b.poolLabel,
        href: b.newsSlug ? `/news/${b.newsSlug}` : `/sedi/${locationId}`,
        icon: "ph-prohibit",
      });
    }
  });
  db.events
    .filter((e) => matchesLocation(e.locationIds, locationId) && e.date >= today)
    .forEach((e) => {
      candidates.push({
        type: "evento",
        date: e.date,
        time: e.time,
        title: e.title,
        href: `/sedi/${locationId}`,
        icon: "ph-calendar-dots",
      });
    });

  candidates.sort((a, b) => {
    const ka = `${a.date} ${a.time || "00:00"}`;
    const kb = `${b.date} ${b.time || "00:00"}`;
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  });
  return candidates[0] || null;
}
