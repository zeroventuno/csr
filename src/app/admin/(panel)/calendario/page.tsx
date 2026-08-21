import BlockManager from "@/components/admin/BlockManager";
import ClosureManager, {
  type PoolOption,
} from "@/components/admin/ClosureManager";
import { getManualBlocks, getClosures } from "@/lib/blocks";
import { getPoolsWithLanes } from "@/lib/vasche";
import { getDB } from "@/lib/db";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminCalendarioPage() {
  const session = await getSession();
  const [blocks, pools, db, closures] = await Promise.all([
    getManualBlocks("cuneo"),
    getPoolsWithLanes("cuneo"),
    getDB(),
    getClosures(),
  ]);

  // le chiusure possono riguardare qualsiasi sede: servono le vasche di tutte
  const poolLists = await Promise.all(
    db.locations.map((l) => getPoolsWithLanes(l.id))
  );
  const poolsByLocation: Record<string, PoolOption[]> = {};
  db.locations.forEach((l, i) => {
    poolsByLocation[l.id] = poolLists[i].map((p) => ({
      id: p.id,
      label: p.label,
    }));
  });

  const newsOptions = [...db.news]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map((n) => ({ slug: n.slug, title: n.title }));

  return (
    <div className="flex flex-col gap-10">
      <section>
        <div className="mb-4">
          <h2 className="text-[24px] text-text">Blocchi corsie</h2>
          <p className="text-[13px] text-muted">
            Riservano alcune corsie in una fascia oraria di un singolo giorno.
          </p>
        </div>
        <BlockManager
          blocks={blocks}
          pools={pools}
          newsOptions={newsOptions}
          role={session!.role}
        />
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-[24px] text-text">Chiusure</h2>
          <p className="text-[13px] text-muted">
            Chiudono una vasca o l&apos;intera sede per un periodo di giorni.
          </p>
        </div>
        <ClosureManager
          closures={closures}
          locations={db.locations.map((l) => ({ id: l.id, name: l.name }))}
          poolsByLocation={poolsByLocation}
          role={session!.role}
        />
      </section>
    </div>
  );
}
