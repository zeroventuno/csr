import EventsManager, { type EventRow } from "@/components/admin/EventsManager";
import { getDB } from "@/lib/db";
import { getSession } from "@/lib/session";
import { locationLabel } from "@/lib/loc";
import { getPoolsWithLanes } from "@/lib/vasche";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const session = await getSession();
  const [db, pools] = await Promise.all([getDB(), getPoolsWithLanes("cuneo")]);

  const poolMap = new Map(pools.map((p) => [p.id, p]));

  const rows: EventRow[] = [...db.events]
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((e) => {
      const pool = e.poolId ? poolMap.get(e.poolId) : undefined;
      const laneNumbers = pool
        ? e.laneIds
            .map((id) => pool.lanes.find((l) => l.id === id)?.laneNumber)
            .filter((n): n is number => n != null)
            .sort((a, b) => a - b)
        : [];
      return {
        id: e.id,
        title: e.title,
        date: e.date,
        time: e.time,
        endTime: e.endTime,
        locationIds: e.locationIds,
        locationLabel: locationLabel(e.locationIds, db.locations),
        description: e.description,
        image: e.image || undefined,
        poolId: e.poolId,
        laneIds: e.laneIds,
        blockLabel:
          pool && laneNumbers.length
            ? `${pool.label} · corsie ${laneNumbers.join(", ")}`
            : "",
      };
    });

  const locations = db.locations.map((l) => ({ id: l.id, name: l.name }));

  return (
    <EventsManager
      rows={rows}
      locations={locations}
      pools={pools}
      role={session!.role}
    />
  );
}
