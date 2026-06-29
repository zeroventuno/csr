import EventsManager, { type EventRow } from "@/components/admin/EventsManager";
import { getDB } from "@/lib/db";
import { getSession } from "@/lib/session";
import { locationLabel } from "@/lib/loc";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const session = await getSession();
  const db = await getDB();

  const rows: EventRow[] = [...db.events]
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((e) => ({
      id: e.id,
      title: e.title,
      date: e.date,
      time: e.time,
      locationIds: e.locationIds,
      locationLabel: locationLabel(e.locationIds, db.locations),
      description: e.description,
      image: e.image || undefined,
    }));

  const locations = db.locations.map((l) => ({ id: l.id, name: l.name }));

  return (
    <EventsManager rows={rows} locations={locations} role={session!.role} />
  );
}
