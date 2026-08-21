import CheckinFlow from "@/components/vasche/CheckinFlow";
import { getPublicAvailability } from "@/lib/vasche";
import { poolLabel } from "@/lib/vasche-types";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Check-in Corsie — Centro Sportivo Roero",
};

function rangeLabel(from: string, to: string): string {
  return from === to
    ? `il ${formatDate(from)}`
    : `dal ${formatDate(from)} al ${formatDate(to)}`;
}

export default async function CheckinPage() {
  const snap = await getPublicAvailability("cuneo");

  // le vasche chiuse non possono essere scelte
  const openPools = snap.pools.filter((p) => !p.closed);
  const closedPools = snap.pools.filter((p) => p.closed);
  const blockingClosure =
    snap.closure || (closedPools.length > 0 ? closedPools[0].closure : null);

  // sede chiusa (o tutte le vasche chiuse): il flusso si ferma qui
  if (
    snap.ok &&
    snap.pools.length > 0 &&
    openPools.length === 0 &&
    blockingClosure
  ) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-deep to-blue px-6 text-center text-white">
        <i className="ph-fill ph-warning-octagon mb-4 text-6xl text-red" />
        <h1 className="head text-4xl font-extrabold">
          {blockingClosure.wholeLocation ? "Sede chiusa" : "Vasche chiuse"}
        </h1>
        <p className="mt-3 max-w-[460px] text-lg text-white/90">
          {blockingClosure.title}
        </p>
        <p className="mt-1.5 max-w-[460px] text-white/75">
          Chiusa {rangeLabel(blockingClosure.dateFrom, blockingClosure.dateTo)}.
        </p>
        {blockingClosure.note && (
          <p className="mt-3 max-w-[460px] text-sm text-white/70">
            {blockingClosure.note}
          </p>
        )}
        <p className="mt-6 max-w-[460px] text-sm text-white/70">
          Il check-in non è disponibile durante la chiusura. Per informazioni
          rivolgiti alla segreteria.
        </p>
      </div>
    );
  }

  const pools = openPools.map((p) => ({
    id: p.id,
    name: p.name,
    side: p.side,
    lengthMeters: p.lengthMeters,
  }));

  if (!snap.ok || pools.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-deep to-blue px-6 text-center text-white">
        <i className="ph ph-wrench mb-4 text-5xl text-aqua-soft" />
        <h1 className="head text-3xl font-bold">Sistema non ancora attivo</h1>
        <p className="mt-2 max-w-[420px] text-white/80">
          Il check-in delle corsie sarà disponibile a breve. Rivolgiti alla
          segreteria.
        </p>
      </div>
    );
  }

  // chiusura parziale: avvisa, ma il check-in resta possibile sulle altre vasche
  const closedNotice =
    closedPools.length > 0
      ? `${closedPools
          .map((p) => poolLabel(p.name, p.side))
          .join(", ")} ${closedPools.length === 1 ? "chiusa" : "chiuse"}${
          closedPools[0].closure ? ` — ${closedPools[0].closure.title}` : ""
        }`
      : "";

  return <CheckinFlow pools={pools} closedNotice={closedNotice} />;
}
