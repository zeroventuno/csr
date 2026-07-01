"use server";

import { supabaseAdmin } from "./supabase";
import { getSession } from "./session";
import { getDB } from "./db";
import { matchesLocation } from "./loc";
import { poolLabel } from "./vasche-types";
import type { LaneBlock, BlockInput, CalendarEntry } from "./blocks-types";

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

/** Aggrega blocchi + eventi + news (avvisi) della sede per il calendario. */
export async function getCalendarEntries(
  locationId: string = DEFAULT_LOCATION
): Promise<CalendarEntry[]> {
  const [db, allBlocks] = await Promise.all([getDB(), getBlocks(locationId)]);
  // i blocchi generati da un evento sono già rappresentati dalla voce "evento" qui sotto
  const blocks = allBlocks.filter((b) => !b.eventId);
  const entries: CalendarEntry[] = [];

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
  const [db, allBlocks] = await Promise.all([getDB(), getBlocks(locationId)]);
  const blocks = allBlocks.filter((b) => !b.eventId);

  const candidates: CalendarEntry[] = [];
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
