"use server";

import { supabaseAdmin } from "./supabase";
import { getSession } from "./session";
import { activeBlockedLaneIds } from "./blocks";
import type {
  Pace,
  AvailabilitySnapshot,
  PoolAvail,
  PaceAvail,
  ReceptionSnapshot,
  ReceptionPool,
  LaneDetail,
  CheckinResult,
} from "./vasche-types";
import { PACES, poolLabel } from "./vasche-types";

const DEFAULT_LOCATION = "cuneo";

interface PoolRow {
  id: string;
  name: string;
  length_meters: number;
  side: string | null;
  sort: number;
}
interface LaneRow {
  id: string;
  pool_id: string;
  lane_number: number;
  pace: Pace;
  max_capacity: number;
}

/** Conta i checkin effettivamente attivi (status ativo e non scaduti) per corsia. */
async function activeByLane(
  sb: ReturnType<typeof supabaseAdmin>,
  laneIds: string[]
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (laneIds.length === 0) return counts;
  const nowIso = new Date().toISOString();
  const { data, error } = await sb
    .from("checkins")
    .select("lane_id")
    .in("lane_id", laneIds)
    .eq("status", "ativo")
    .gt("expires_at", nowIso);
  if (error) throw error;
  (data || []).forEach((r: { lane_id: string }) => {
    counts.set(r.lane_id, (counts.get(r.lane_id) || 0) + 1);
  });
  return counts;
}

async function loadPoolsAndLanes(locationId: string) {
  const sb = supabaseAdmin();
  const { data: pools, error: pErr } = await sb
    .from("pools")
    .select("*")
    .eq("location_id", locationId)
    .order("sort", { ascending: true });
  if (pErr) throw pErr;
  const poolRows = (pools || []) as PoolRow[];
  const poolIds = poolRows.map((p) => p.id);

  let laneRows: LaneRow[] = [];
  if (poolIds.length > 0) {
    const { data: lanes, error: lErr } = await sb
      .from("lanes")
      .select("*")
      .in("pool_id", poolIds)
      .order("lane_number", { ascending: true });
    if (lErr) throw lErr;
    laneRows = (lanes || []) as LaneRow[];
  }
  return { sb, poolRows, laneRows };
}

/** Vasche con le rispettive corsie (per l'admin: creazione blocchi). */
export async function getPoolsWithLanes(locationId: string = DEFAULT_LOCATION) {
  try {
    const { poolRows, laneRows } = await loadPoolsAndLanes(locationId);
    return poolRows.map((p) => ({
      id: p.id,
      label: poolLabel(p.name, p.side),
      lanes: laneRows
        .filter((l) => l.pool_id === p.id)
        .map((l) => ({ id: l.id, laneNumber: l.lane_number, pace: l.pace })),
    }));
  } catch {
    return [];
  }
}

/* ===================== DISPONIBILITÀ PUBBLICA ===================== */

export async function getPublicAvailability(
  locationId: string = DEFAULT_LOCATION
): Promise<AvailabilitySnapshot> {
  try {
    const { sb, poolRows, laneRows } = await loadPoolsAndLanes(locationId);
    const counts = await activeByLane(
      sb,
      laneRows.map((l) => l.id)
    );
    const blocked = new Set(await activeBlockedLaneIds(locationId));

    const pools: PoolAvail[] = poolRows.map((p) => {
      // le corsie bloccate ora non contano nella disponibilità
      const lanes = laneRows.filter(
        (l) => l.pool_id === p.id && !blocked.has(l.id)
      );
      const paces: PaceAvail[] = PACES.map((pc) => {
        const ls = lanes.filter((l) => l.pace === pc.id);
        const total = ls.reduce((s, l) => s + l.max_capacity, 0);
        const occ = ls.reduce((s, l) => s + (counts.get(l.id) || 0), 0);
        return { pace: pc.id, free: Math.max(0, total - occ), total };
      }).filter((x) => x.total > 0);
      const total = lanes.reduce((s, l) => s + l.max_capacity, 0);
      const occ = lanes.reduce((s, l) => s + (counts.get(l.id) || 0), 0);
      return {
        id: p.id,
        name: p.name,
        lengthMeters: p.length_meters,
        side: p.side,
        paces,
        free: Math.max(0, total - occ),
        total,
      };
    });

    return { pools, updatedAt: new Date().toISOString(), ok: true };
  } catch {
    return { pools: [], updatedAt: new Date().toISOString(), ok: false };
  }
}

/* ===================== CHECK-IN (kiosk) ===================== */

export async function checkin(
  poolId: string,
  pace: Pace
): Promise<CheckinResult> {
  try {
    const sb = supabaseAdmin();
    const { data: pool } = await sb
      .from("pools")
      .select("*")
      .eq("id", poolId)
      .maybeSingle();
    if (!pool) return { ok: false, error: "Vasca non trovata." };

    const { data: lanes, error: lErr } = await sb
      .from("lanes")
      .select("*")
      .eq("pool_id", poolId)
      .eq("pace", pace)
      .order("lane_number", { ascending: true });
    if (lErr) throw lErr;
    const allLanes = (lanes || []) as LaneRow[];
    if (allLanes.length === 0)
      return { ok: false, error: "Nessuna corsia per questo ritmo." };

    // esclude le corsie bloccate ora (es. water polo)
    const blocked = new Set(await activeBlockedLaneIds(pool.location_id));
    const laneRows = allLanes.filter((l) => !blocked.has(l.id));
    if (laneRows.length === 0)
      return {
        ok: false,
        error: "Corsie occupate da un evento in questo orario.",
      };

    const counts = await activeByLane(
      sb,
      laneRows.map((l) => l.id)
    );

    // corsia con minor occupazione che abbia ancora posto
    let best: LaneRow | null = null;
    let bestActive = Infinity;
    for (const l of laneRows) {
      const a = counts.get(l.id) || 0;
      if (a < l.max_capacity && a < bestActive) {
        best = l;
        bestActive = a;
      }
    }
    if (!best)
      return {
        ok: false,
        error: "Tutte le corsie di questo ritmo sono al completo.",
      };

    const { data: ins, error: iErr } = await sb
      .from("checkins")
      .insert({ lane_id: best.id, status: "ativo", source: "kiosk" })
      .select("id")
      .single();
    if (iErr) throw iErr;

    return {
      ok: true,
      checkinId: ins.id,
      poolName: pool.name,
      side: pool.side,
      laneNumber: best.lane_number,
      pace,
      active: bestActive + 1,
      capacity: best.max_capacity,
    };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Errore durante il check-in." };
  }
}

export async function checkout(checkinId: string): Promise<{ ok: boolean }> {
  try {
    const sb = supabaseAdmin();
    await sb
      .from("checkins")
      .update({ status: "checkout_manual", checked_out_at: new Date().toISOString() })
      .eq("id", checkinId)
      .eq("status", "ativo");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

/* ===================== RECEPÇÃO (admin) ===================== */

export async function getReceptionData(
  locationId: string = DEFAULT_LOCATION
): Promise<ReceptionSnapshot> {
  const session = await getSession();
  if (!session) return { pools: [], totalInWater: 0, updatedAt: new Date().toISOString(), ok: false };

  try {
    const { sb, poolRows, laneRows } = await loadPoolsAndLanes(locationId);
    const counts = await activeByLane(
      sb,
      laneRows.map((l) => l.id)
    );
    const blocked = new Set(await activeBlockedLaneIds(locationId));
    let totalInWater = 0;

    const pools: ReceptionPool[] = poolRows.map((p) => {
      const lanes: LaneDetail[] = laneRows
        .filter((l) => l.pool_id === p.id)
        .map((l) => {
          const active = counts.get(l.id) || 0;
          totalInWater += active;
          return {
            id: l.id,
            poolName: p.name,
            side: p.side,
            laneNumber: l.lane_number,
            pace: l.pace,
            capacity: l.max_capacity,
            active,
            blocked: blocked.has(l.id),
          };
        });
      return { id: p.id, name: p.name, side: p.side, lanes };
    });

    return { pools, totalInWater, updatedAt: new Date().toISOString(), ok: true };
  } catch {
    return { pools: [], totalInWater: 0, updatedAt: new Date().toISOString(), ok: false };
  }
}

/** Override manuale: delta +1 aggiunge una persona, -1 libera la più recente. */
export async function adminAdjust(
  laneId: string,
  delta: 1 | -1
): Promise<{ ok: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Non autenticato." };
  try {
    const sb = supabaseAdmin();
    if (delta === 1) {
      const { data: lane } = await sb
        .from("lanes")
        .select("max_capacity")
        .eq("id", laneId)
        .maybeSingle();
      if (!lane) return { ok: false, error: "Corsia non trovata." };
      const counts = await activeByLane(sb, [laneId]);
      if ((counts.get(laneId) || 0) >= lane.max_capacity)
        return { ok: false, error: "Corsia al completo." };
      await sb
        .from("checkins")
        .insert({ lane_id: laneId, status: "ativo", source: "admin" });
    } else {
      const nowIso = new Date().toISOString();
      const { data: rows } = await sb
        .from("checkins")
        .select("id")
        .eq("lane_id", laneId)
        .eq("status", "ativo")
        .gt("expires_at", nowIso)
        .order("checked_in_at", { ascending: false })
        .limit(1);
      const target = rows && rows[0];
      if (target) {
        await sb
          .from("checkins")
          .update({ status: "checkout_manual", checked_out_at: nowIso })
          .eq("id", target.id);
      }
    }
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Errore." };
  }
}
