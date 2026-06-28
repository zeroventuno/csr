import EventsManager, { type EventRow } from "@/components/admin/EventsManager";
import { getDB } from "@/lib/db";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const session = await getSession();
  const db = await getDB();
  const locName = (id: string) =>
    db.locations.find((l) => l.id === id)?.name || id;

  const rows: EventRow[] = [...db.events]
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((e) => ({
      id: e.id,
      title: e.title,
      date: e.date,
      time: e.time,
      locationId: e.locationId,
      locationName: locName(e.locationId),
      description: e.description,
      image: e.image || undefined,
    }));

  const locations = db.locations.map((l) => ({ id: l.id, name: l.name }));

  return (
    <EventsManager rows={rows} locations={locations} role={session!.role} />
  );
}
