import LocationsManager, { type LocRow } from "@/components/admin/LocationsManager";
import { getDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminLocationsPage() {
  const db = await getDB();
  const rows: LocRow[] = db.locations.map((l) => ({
    id: l.id,
    name: l.name,
    address: l.address,
    hours: l.hours,
    phone: l.phone,
    pool: l.pool,
    mapsEmbed: l.mapsEmbed,
  }));
  return <LocationsManager rows={rows} />;
}
