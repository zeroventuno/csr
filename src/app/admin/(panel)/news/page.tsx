import NewsManager, { type NewsRow } from "@/components/admin/NewsManager";
import { getDB } from "@/lib/db";
import { getSession } from "@/lib/session";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminNewsPage() {
  const session = await getSession();
  const db = await getDB();
  const locName = (id: string) =>
    id === "all" ? "Tutte" : db.locations.find((l) => l.id === id)?.name || id;

  const rows: NewsRow[] = [...db.news]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map((n) => ({
      id: n.id,
      title: n.title,
      category: n.category,
      locationId: n.locationId,
      locationName: locName(n.locationId),
      date: n.date,
      dateLabel: formatDate(n.date),
      author: n.author,
      published: n.published,
      excerpt: n.excerpt,
      content: n.content,
      coverImage: n.coverImage || undefined,
    }));

  const locations = db.locations.map((l) => ({ id: l.id, name: l.name }));

  return (
    <NewsManager rows={rows} locations={locations} role={session!.role} />
  );
}
