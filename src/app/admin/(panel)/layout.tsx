import AdminShell from "@/components/admin/AdminShell";
import { requireSession } from "@/lib/session";
import { getDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const db = await getDB();
  const counts = {
    news: db.news.length,
    courses: db.courses.length,
    events: db.events.length,
  };

  return (
    <AdminShell role={session.role} counts={counts}>
      {children}
    </AdminShell>
  );
}
