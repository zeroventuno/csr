import BlockManager from "@/components/admin/BlockManager";
import { getBlocks } from "@/lib/blocks";
import { getPoolsWithLanes } from "@/lib/vasche";
import { getDB } from "@/lib/db";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminCalendarioPage() {
  const session = await getSession();
  const [blocks, pools, db] = await Promise.all([
    getBlocks("cuneo"),
    getPoolsWithLanes("cuneo"),
    getDB(),
  ]);

  const newsOptions = [...db.news]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map((n) => ({ slug: n.slug, title: n.title }));

  return (
    <BlockManager
      blocks={blocks}
      pools={pools}
      newsOptions={newsOptions}
      role={session!.role}
    />
  );
}
