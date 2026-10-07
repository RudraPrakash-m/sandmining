import React from "react";
import type { GisLayerKey, GisLayerConfig, GisSearchResultItem } from "../types/gis.types";
import { GisMapSearch } from "./GisMapSearch";
import {
  Layers,
  Pickaxe,
  ShieldAlert,
  Waves,
  Building2,
  Truck,
  AlertTriangle,
  Check,
} from "lucide-react";

export interface GisLayerControlsProps {
  layers: Record<GisLayerKey, GisLayerConfig>;
  onToggleLayer: (key: GisLayerKey) => void;
  onSelectResult?: (result: GisSearchResultItem) => void;
  className?: string;
}

export const GisLayerControls: React.FC<GisLayerControlsProps> = ({
  layers,
  onToggleLayer,
  className = "",
}) => {
  const getLayerDetails = (key: GisLayerKey) => {
    switch (key) {
      case "REACHES":
        return {
          icon: <Pickaxe size={14} className="text-emerald-700 dark:text-emerald-400" />,
          checkboxBg: "bg-emerald-600",
          borderActive: "border-emerald-300 text-emerald-950 dark:border-emerald-700 dark:text-emerald-100",
          countBadge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
        };
      case "RESTRICTED":
        return {
          icon: <ShieldAlert size={14} className="text-orange-600 dark:text-orange-400" />,
          checkboxBg: "bg-orange-500",
          borderActive: "border-orange-300 text-orange-950 dark:border-orange-700 dark:text-orange-100",
          countBadge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
        };
      case "RIVERS":
        return {
          icon: <Waves size={14} className="text-blue-600 dark:text-blue-400" />,
          checkboxBg: "bg-blue-600",
          borderActive: "border-blue-300 text-blue-950 dark:border-blue-700 dark:text-blue-100",
          countBadge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
        };
      case "STOCKYARDS":
        return {
          icon: <Building2 size={14} className="text-amber-600 dark:text-amber-400" />,
          checkboxBg: "bg-amber-500",
          borderActive: "border-amber-300 text-amber-950 dark:border-amber-700 dark:text-amber-100",
          countBadge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
        };
      case "VEHICLES":
        return {
          icon: <Truck size={14} className="text-blue-600 dark:text-blue-400" />,
          checkboxBg: "bg-blue-600",
          borderActive: "border-blue-300 text-blue-950 dark:border-blue-700 dark:text-blue-100",
          countBadge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
        };
      case "ALERTS":
        return {
          icon: <AlertTriangle size={14} className="text-rose-600 dark:text-rose-400" />,
          checkboxBg: "bg-rose-600",
          borderActive: "border-rose-300 text-rose-950 dark:border-rose-700 dark:text-rose-100",
          countBadge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
        };
    }
  };

  return (
    <div
      className={`flex items-center gap-2 xl:gap-3 p-2.5 rounded-2xl bg-white dark:bg-gray-900 border border-border-color shadow-2xs overflow-x-auto custom-scrollbar-thin select-none ${className}`}
    >
      {/* ── Left Map Layers Title ── */}
      <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-bold text-slate-800 dark:text-slate-100 pr-2.5 sm:pr-3 border-r border-border-color shrink-0">
        <Layers size={15} className="text-slate-700 dark:text-slate-300 shrink-0" />
        <span className="text-xs sm:text-sm font-bold whitespace-nowrap">Map Layers</span>
      </div>

      {/* ── All 6 Map Layer Buttons in One Line ── */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-1 justify-between min-w-0">
        {(Object.keys(layers) as GisLayerKey[]).map((key) => {
          const layer = layers[key];
          const details = getLayerDetails(key);

          return (
            <button
              key={key}
              type="button"
              onClick={() => onToggleLayer(key)}
              className={`flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl text-[11px] 2xl:text-xs font-semibold transition-all cursor-pointer whitespace-nowrap select-none bg-white dark:bg-gray-900 border ${
                layer.visible
                  ? `${details.borderActive} shadow-2xs`
                  : "border-slate-200 text-slate-400 dark:border-gray-800 dark:text-slate-500 opacity-60 hover:opacity-100"
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-colors shrink-0 ${
                  layer.visible ? details.checkboxBg : "bg-slate-200 dark:bg-gray-700"
                }`}
              >
                {layer.visible && <Check size={10} className="text-white stroke-[3]" />}
              </div>

              <span className="font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                {layer.label}
              </span>

              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${details.countBadge}`}
              >
                {layer.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

