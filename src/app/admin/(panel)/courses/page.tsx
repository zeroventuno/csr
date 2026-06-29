import CoursesManager, { type CourseRow } from "@/components/admin/CoursesManager";
import { getDB } from "@/lib/db";
import { getSession } from "@/lib/session";
import { getCategory } from "@/lib/categories";
import { locationLabel } from "@/lib/loc";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const session = await getSession();
  const db = await getDB();

  const rows: CourseRow[] = db.courses.map((c) => {
    const cat = getCategory(c.categoryId);
    return {
      id: c.id,
      categoryId: c.categoryId,
      categoryTitle: cat?.title || c.categoryId,
      icon: cat?.icon || "ph-person-simple-swim",
      name: c.name,
      age: c.age,
      schedule: c.schedule,
      price: c.price,
      priceNote: c.priceNote,
      instructor: c.instructor,
      locationIds: c.locationIds,
      locationLabel: locationLabel(c.locationIds, db.locations),
    };
  });

  const locations = db.locations.map((l) => ({ id: l.id, name: l.name }));

  return (
    <CoursesManager rows={rows} locations={locations} role={session!.role} />
  );
}
