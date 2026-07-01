"use client";

import { fieldLabel, fieldInput } from "./SlideOver";
import { paceLabel, type Pace } from "@/lib/vasche-types";

export interface PoolWithLanes {
  id: string;
  label: string;
  lanes: { id: string; laneNumber: number; pace: Pace }[];
}

/** Selettore vasca + corsie specifiche, riusato da blocchi ed eventi. */
export default function PoolLanePicker({
  pools,
  poolId,
  laneIds,
  onChangePool,
  onChangeLanes,
}: {
  pools: PoolWithLanes[];
  poolId: string;
  laneIds: string[];
  onChangePool: (poolId: string) => void;
  onChangeLanes: (laneIds: string[]) => void;
}) {
  const curPool = pools.find((p) => p.id === poolId);

  function toggleLane(id: string) {
    onChangeLanes(
      laneIds.includes(id) ? laneIds.filter((x) => x !== id) : [...laneIds, id]
    );
  }

  return (
    <>
      <div>
        <label className={fieldLabel}>Vasca</label>
        <select
          value={poolId}
          onChange={(e) => onChangePool(e.target.value)}
          className={fieldInput}
        >
          <option value="">— nessuna —</option>
          {pools.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {curPool && (
        <div>
          <label className={fieldLabel}>Corsie occupate</label>
          <div className="mt-[7px] flex flex-wrap gap-2">
            {curPool.lanes.map((l) => {
              const on = laneIds.includes(l.id);
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => toggleLane(l.id)}
                  className="flex h-[42px] items-center gap-1.5 rounded-[10px] border px-3 text-[13px] font-semibold transition"
                  style={{
                    background: on ? "var(--aqua)" : "var(--surface-2)",
                    color: on ? "#06121F" : "var(--text)",
                    borderColor: on ? "var(--aqua)" : "var(--border)",
                  }}
                >
                  <i className={`ph ${on ? "ph-check-circle" : "ph-circle"}`} />
                  Corsia {l.laneNumber}
                  <span className="opacity-70">· {paceLabel(l.pace)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
