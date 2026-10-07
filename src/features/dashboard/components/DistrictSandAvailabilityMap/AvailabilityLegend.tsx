import React from "react";
import type { SandAvailabilityLevel } from "./map.types";
import { AVAILABILITY_LEVEL_STYLES } from "../../services/districtAvailabilityService";
import { Layers } from "lucide-react";

export interface AvailabilityLegendProps {
  levelCounts?: Record<SandAvailabilityLevel, number>;
  className?: string;
}

const ORDERED_LEVELS: SandAvailabilityLevel[] = [
  "VERY_LOW",
  "LOW",
  "MODERATE",
  "HIGH",
  "VERY_HIGH",
];

export const AvailabilityLegend: React.FC<AvailabilityLegendProps> = ({
  levelCounts,
  className = "",
}) => {
  return (
    <div
      className={`bg-white/95 dark:bg-gray-900/95 backdrop-blur-xs border border-amber-900/15 dark:border-slate-700 rounded-lg p-2.5 shadow-md text-xs select-none max-w-[170px] ${className}`}
      role="region"
      aria-label="Sand Availability Heat Map Legend"
    >
      <div className="flex items-center gap-1.5 font-bold text-[11px] text-slate-800 dark:text-slate-100 pb-1.5 mb-1.5 border-b border-border-color">
        <Layers size={12} className="text-primary" />
        <span>Availability Scale</span>
      </div>

      <div className="space-y-1">
        {ORDERED_LEVELS.map((lvl) => {
          const style = AVAILABILITY_LEVEL_STYLES[lvl];
          const count = levelCounts ? levelCounts[lvl] : undefined;

          return (
            <div
              key={lvl}
              className="flex items-center justify-between gap-1.5 text-[10px] text-slate-600 dark:text-slate-300"
              title={`${style.label}: ${style.rangeDescription}`}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-2xs shrink-0 border border-black/10 shadow-2xs"
                  style={{ backgroundColor: style.fillColor }}
                />
                <span className="font-medium whitespace-nowrap">
                  {lvl.replace("_", " ")}
                </span>
              </div>
              {count !== undefined && (
                <span className="text-slate-400 font-mono text-[9px]">
                  {count}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
