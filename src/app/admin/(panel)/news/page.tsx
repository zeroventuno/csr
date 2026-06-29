import NewsManager, { type NewsRow } from "@/components/admin/NewsManager";
import { getDB } from "@/lib/db";
import { getSession } from "@/lib/session";
import { formatDate } from "@/lib/format";
import { locationLabel } from "@/lib/loc";

export const dynamic = "force-dynamic";

export default async function AdminNewsPage() {
  const session = await getSession();
  const db = await getDB();

  const rows: NewsRow[] = [...db.news]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map((n) => ({
      id: n.id,
      title: n.title,
      category: n.category,
      locationIds: n.locationIds,
      locationLabel: locationLabel(n.locationIds, db.locations),
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
