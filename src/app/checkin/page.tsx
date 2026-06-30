import CheckinFlow from "@/components/vasche/CheckinFlow";
import { getPublicAvailability } from "@/lib/vasche";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Check-in Corsie — Centro Sportivo Roero",
};

export default async function CheckinPage() {
  const snap = await getPublicAvailability("cuneo");
  const pools = snap.pools.map((p) => ({
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

  return <CheckinFlow pools={pools} />;
}
