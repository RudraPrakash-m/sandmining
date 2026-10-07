import React from "react";
import { Truck, AlertTriangle } from "lucide-react";
import { RIVER_BASIN_OPTIONS } from "../services/telematicsMockService";

export interface TelematicsKpiHeaderProps {
  selectedBasin: string;
  onSelectBasin: (basin: string) => void;
  kpiCounts: {
    total: number;
    inTransit: number;
    idle: number;
    exception: number;
  };
}

export const TelematicsKpiHeader: React.FC<TelematicsKpiHeaderProps> = ({
  selectedBasin,
  onSelectBasin,
  kpiCounts,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
      {/* ── Left Filter by River Basin ──────────────────────── */}
      <div className="md:col-span-3 bg-white dark:bg-gray-900 p-3 rounded-2xl border border-border-color shadow-2xs">
        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
          Filter by River Basin
        </label>
        <div className="relative">
          <select
            value={selectedBasin}
            onChange={(e) => onSelectBasin(e.target.value)}
            className="w-full bg-slate-50 dark:bg-gray-800/80 border border-border-color rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none pr-8"
          >
            {RIVER_BASIN_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.name} ({opt.vehicleCount})
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
            ▼
          </div>
        </div>
      </div>

      {/* ── 4 KPI Metric Cards in a Row ──────────────────────── */}
      <div className="md:col-span-9 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Card 1: Total Vehicles */}
        <div className="bg-white dark:bg-gray-900 p-3 rounded-2xl border border-border-color shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Truck size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-tight">
              Total Vehicles
            </p>
            <p className="text-xl font-black text-slate-900 dark:text-white leading-tight mt-0.5">
              {kpiCounts.total}
            </p>
          </div>
        </div>

        {/* Card 2: In Transit */}
        <div className="bg-white dark:bg-gray-900 p-3 rounded-2xl border border-border-color shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Truck size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-tight">
              In Transit
            </p>
            <p className="text-xl font-black text-slate-900 dark:text-white leading-tight mt-0.5">
              {kpiCounts.inTransit}
            </p>
          </div>
        </div>

        {/* Card 3: Idle */}
        <div className="bg-white dark:bg-gray-900 p-3 rounded-2xl border border-border-color shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Truck size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-tight">
              Idle
            </p>
            <p className="text-xl font-black text-slate-900 dark:text-white leading-tight mt-0.5">
              {kpiCounts.idle}
            </p>
          </div>
        </div>

        {/* Card 4: Exception */}
        <div className="bg-white dark:bg-gray-900 p-3 rounded-2xl border border-border-color shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-tight">
              Exception
            </p>
            <p className="text-xl font-black text-rose-600 dark:text-rose-400 leading-tight mt-0.5">
              {kpiCounts.exception}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
