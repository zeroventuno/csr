import { getDB } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const db = await getDB();
  const today = new Date().toISOString().slice(0, 10);

  const publishedCount = db.news.filter((n) => n.published).length;
  const upcomingEvents = db.events.filter((e) => e.date >= today).length;

  const stats = [
    { label: "News pubblicate", value: publishedCount, icon: "ph-newspaper" },
    { label: "Eventi in arrivo", value: upcomingEvents, icon: "ph-calendar-dots" },
    { label: "Corsi attivi", value: db.courses.length, icon: "ph-person-simple-swim" },
    { label: "Sedi attive", value: db.locations.length, icon: "ph-map-pin" },
  ];

  // "Iscrizioni per sede" — usiamo il n. di corsi per sede come proxy.
  const perLoc = db.locations.map((l) => ({
    name: l.name,
    courses: db.courses.filter((c) => c.locationId === l.id).length,
    news: db.news.filter((n) => n.locationId === l.id).length,
    events: db.events.filter((e) => e.locationId === l.id).length,
  }));
  const maxCourses = Math.max(1, ...perLoc.map((p) => p.courses));

  const activity = [...db.news]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 5)
    .map((n) => ({
      icon: n.published ? "ph-newspaper" : "ph-pencil-simple",
      who: n.author,
      what: n.published
        ? `ha pubblicato “${n.title}”`
        : `ha salvato la bozza “${n.title}”`,
      when: formatDate(n.date),
    }));

  return (
    <div>
      {/* STAT CARDS */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-[16px] border border-border bg-surface p-5 transition hover:-translate-y-0.5 hover:shadow-csr"
          >
            <div className="flex items-center justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-[12px] bg-surface-2 text-[22px] text-aqua">
                <i className={`ph ${s.icon}`} />
              </span>
            </div>
            <div className="head mt-3.5 text-[40px] font-extrabold leading-[0.9] text-text">
              {s.value}
            </div>
            <div className="mt-1 text-[13.5px] text-muted">{s.label}</div>
          </div>
        ))}
      </div>

      {/* CHART + ACTIVITY */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-[16px] border border-border bg-surface p-[22px]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-[21px] text-text">Corsi per sede</h3>
              <div className="text-[12.5px] text-muted">Distribuzione attuale</div>
            </div>
            <span className="flex items-center gap-1.5 text-[12.5px] text-muted">
              <i className="ph ph-chart-bar text-aqua" />
              {db.courses.length} corsi totali
            </span>
          </div>
          <div className="flex h-[200px] items-end gap-[18px] pt-2.5">
            {perLoc.map((p) => (
              <div
                key={p.name}
                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                <div className="text-xs font-bold text-text">{p.courses}</div>
                <div
                  className="w-full max-w-[54px] rounded-t-[8px] bg-gradient-to-b from-aqua to-blue"
                  style={{ height: `${(p.courses / maxCourses) * 100}%` }}
                />
                <div className="text-xs text-muted">{p.name}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[16px] border border-border bg-surface p-[22px]">
          <h3 className="mb-3.5 text-[21px] text-text">Attività recente</h3>
          <div className="flex flex-col gap-0.5">
            {activity.map((a, i) => (
              <div
                key={i}
                className="flex gap-3 border-b border-border py-2.5 last:border-0"
              >
                <span className="grid h-[34px] w-[34px] flex-none place-items-center rounded-[9px] bg-surface-2 text-base text-aqua">
                  <i className={`ph ${a.icon}`} />
                </span>
                <div className="min-w-0">
                  <div className="text-[13.5px] leading-[1.35] text-text">
                    <b className="font-bold">{a.who}</b> {a.what}
                  </div>
                  <div className="mt-0.5 text-[11.5px] text-muted">{a.when}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PER-LOCATION OVERVIEW */}
      <div className="mt-4 rounded-[16px] border border-border bg-surface p-[22px]">
        <h3 className="mb-4 text-[21px] text-text">Panoramica per sede</h3>
        <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 lg:grid-cols-5">
          {perLoc.map((l) => (
            <div
              key={l.name}
              className="rounded-[13px] border border-border bg-surface-2 p-4"
            >
              <div className="flex items-center gap-[7px] text-[15px] font-bold text-text">
                <i className="ph ph-map-pin text-aqua" />
                {l.name}
              </div>
              <div className="mt-3 flex justify-between text-[12.5px] text-muted">
                <span>News</span>
                <b className="text-text">{l.news}</b>
              </div>
              <div className="mt-1.5 flex justify-between text-[12.5px] text-muted">
                <span>Corsi</span>
                <b className="text-text">{l.courses}</b>
              </div>
              <div className="mt-1.5 flex justify-between text-[12.5px] text-muted">
                <span>Eventi</span>
                <b className="text-text">{l.events}</b>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
