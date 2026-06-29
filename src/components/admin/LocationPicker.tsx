"use client";

import { fieldLabel } from "./SlideOver";

// Selettore multi-sede. value vuoto = "Tutte le sedi".
export default function LocationPicker({
  value,
  locations,
  onChange,
  label = "Sedi collegate",
}: {
  value: string[];
  locations: { id: string; name: string }[];
  onChange: (ids: string[]) => void;
  label?: string;
}) {
  const all = value.length === 0;

  const toggle = (id: string) => {
    if (value.includes(id)) onChange(value.filter((x) => x !== id));
    else onChange([...value, id]);
  };

  const chip = (active: boolean) => ({
    background: active ? "var(--aqua)" : "var(--surface-2)",
    color: active ? "#06121F" : "var(--text)",
    borderColor: active ? "var(--aqua)" : "var(--border)",
  });

  return (
    <div>
      <label className={fieldLabel}>{label}</label>
      <div className="mt-[7px] flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange([])}
          className="flex h-[38px] items-center gap-1.5 rounded-[10px] border px-3.5 text-[13.5px] font-semibold transition hover:-translate-y-0.5"
          style={chip(all)}
        >
          <i className={`ph ${all ? "ph-check-circle" : "ph-globe"}`} />
          Tutte le sedi
        </button>
        {locations.map((l) => {
          const on = value.includes(l.id);
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => toggle(l.id)}
              className="flex h-[38px] items-center gap-1.5 rounded-[10px] border px-3.5 text-[13.5px] font-semibold transition hover:-translate-y-0.5"
              style={chip(on)}
            >
              <i className={`ph ${on ? "ph-check-circle" : "ph-map-pin"}`} />
              {l.name}
            </button>
          );
        })}
      </div>
      <div className="mt-1.5 text-[11.5px] text-muted">
        {all
          ? "Visibile su tutte le sedi e nelle relative pagine."
          : `Collegata a ${value.length} ${value.length === 1 ? "sede" : "sedi"}.`}
      </div>
    </div>
  );
}
