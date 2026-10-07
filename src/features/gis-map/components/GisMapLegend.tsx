import React, { useState } from "react";
import { Layers, ChevronUp, ChevronDown, Truck, AlertTriangle } from "lucide-react";

export interface GisMapLegendProps {
  className?: string;
}

export const GisMapLegend: React.FC<GisMapLegendProps> = ({ className = "" }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div
      className={`bg-white dark:bg-gray-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-lg text-xs select-none w-60 transition-all ${className}`}
      role="region"
      aria-label="GIS Map Legend"
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-slate-700 dark:text-slate-300" />
          <span className="font-bold text-xs text-slate-900 dark:text-white">
            Map Legend
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded((e) => !e)}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        >
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* ── Legend Items List ───────────────────────────────── */}
      {isExpanded && (
        <div className="pt-2.5 space-y-2.5 text-[11px] text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2.5">
            <span className="w-3.5 h-3.5 rounded-xs bg-emerald-600 shadow-2xs shrink-0" />
            <span className="font-medium text-slate-800 dark:text-slate-200">
              Approved Mining Reach
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 rounded-xs bg-orange-400/80 border border-orange-500 border-dashed shrink-0" />
            <span className="font-medium text-slate-800 dark:text-slate-200">
              Restricted / Forest Zone
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="w-4 h-0.5 bg-blue-500 rounded shrink-0" />
            <span className="font-medium text-slate-800 dark:text-slate-200">
              River / Drainage Stream
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-orange-500 shadow-2xs shrink-0" />
            <span className="font-medium text-slate-800 dark:text-slate-200">
              Sand Stockyard
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Truck size={14} className="text-blue-600 shrink-0" />
            <span className="font-medium text-slate-800 dark:text-slate-200">
              Live Vehicle Telematics
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <AlertTriangle size={14} className="text-red-600 shrink-0" />
            <span className="font-medium text-red-600 dark:text-red-400 font-bold">
              Illegal Mining Alert
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
