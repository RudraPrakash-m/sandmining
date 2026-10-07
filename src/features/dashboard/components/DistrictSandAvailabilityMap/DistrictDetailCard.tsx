import React from "react";
import type { DistrictAvailabilityData } from "./map.types";
import { AVAILABILITY_LEVEL_STYLES } from "../../services/districtAvailabilityService";
import {
  Pickaxe,
  Truck,
  CheckCircle2,
  Waves,
  MapPin,
  TrendingUp,
  X,
  Building2,
  Info,
  Layers,
} from "lucide-react";

export interface DistrictDetailCardProps {
  district: DistrictAvailabilityData | null;
  stateSummary: {
    totalDistricts: number;
    totalAvailableQuantityMt: number;
    totalActiveSources: number;
    totalDailyDispatchMt: number;
    avgCompliance: number;
  };
  onClearSelection: () => void;
  onApplyDistrictFilter?: (districtId: string) => void;
  onSelectDistrictById?: (districtId: string) => void;
}

export const DistrictDetailCard: React.FC<DistrictDetailCardProps> = ({
  district,
  stateSummary,
  onClearSelection,
  onApplyDistrictFilter,
}) => {
  if (!district) {
    return (
      <div className="flex flex-col justify-between h-full bg-[#FAF5EE]/70 dark:bg-gray-800/40 rounded-xl p-4 border border-amber-900/15">
        <div>
          {/* Header */}
          <div className="flex items-center gap-2.5 pb-3 border-b border-border-color">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              <Building2 size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                State Spatial Overview
              </h4>
              <p className="text-[11px] text-slate-500">
                Chhattisgarh Sand Mining Inventory
              </p>
            </div>
          </div>

          {/* 4 Core Primary Metric Cards */}
          <div className="grid grid-cols-2 gap-2.5 my-3">
            <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-border-color shadow-2xs">
              <p className="text-[11px] text-slate-500 font-medium">Total Reserves</p>
              <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                {(stateSummary.totalAvailableQuantityMt / 100000).toFixed(2)} L MT
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                {stateSummary.totalAvailableQuantityMt.toLocaleString()} MT
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-border-color shadow-2xs">
              <p className="text-[11px] text-slate-500 font-medium">Active Sources</p>
              <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                {stateSummary.totalActiveSources}
              </p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                Across {stateSummary.totalDistricts} Districts
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-border-color shadow-2xs">
              <p className="text-[11px] text-slate-500 font-medium">Daily Dispatch</p>
              <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                {stateSummary.totalDailyDispatchMt.toLocaleString()} MT
              </p>
              <p className="text-[10px] text-emerald-600 font-medium mt-0.5">
                Active Vehicle Pipeline
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-border-color shadow-2xs">
              <p className="text-[11px] text-slate-500 font-medium">Avg Compliance</p>
              <p className="text-lg font-black text-emerald-600 tracking-tight mt-0.5">
                {stateSummary.avgCompliance}%
              </p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                Environmental & Toll
              </p>
            </div>
          </div>

          {/* Quick Spatial Highlights */}
          <div className="bg-white dark:bg-gray-900 p-2.5 rounded-lg border border-border-color text-xs space-y-1.5 mb-2">
            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Waves size={12} className="text-primary" />
              <span>Major River Basin Distribution</span>
            </p>
            <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600 dark:text-slate-300">
              <div className="flex justify-between bg-[#FAF5EE]/60 dark:bg-gray-800/40 px-2 py-1 rounded">
                <span>Mahanadi Basin:</span>
                <span className="font-bold text-primary">15 Districts</span>
              </div>
              <div className="flex justify-between bg-[#FAF5EE]/60 dark:bg-gray-800/40 px-2 py-1 rounded">
                <span>Godavari Basin:</span>
                <span className="font-bold text-primary">7 Districts</span>
              </div>
              <div className="flex justify-between bg-[#FAF5EE]/60 dark:bg-gray-800/40 px-2 py-1 rounded">
                <span>Son / Ganga Basin:</span>
                <span className="font-bold text-primary">5 Districts</span>
              </div>
              <div className="flex justify-between bg-[#FAF5EE]/60 dark:bg-gray-800/40 px-2 py-1 rounded">
                <span>Brahmani / Narmada:</span>
                <span className="font-bold text-primary">2 Districts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Informational Prompt */}
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white dark:bg-gray-900 border border-border-color text-slate-600 dark:text-slate-400 text-xs mt-2">
          <Info size={15} className="text-primary shrink-0" />
          <span>Click any district on the map to inspect spatial sand inventory & details.</span>
        </div>
      </div>
    );
  }

  const style = AVAILABILITY_LEVEL_STYLES[district.availabilityLevel];
  const maxBenchmarkQty = 300000;
  const pctOfMax = Math.min(100, Math.round((district.availableQuantityMt / maxBenchmarkQty) * 100));

  return (
    <div className="flex flex-col justify-between h-full bg-[#FAF5EE]/80 dark:bg-gray-800/50 rounded-xl p-4 border border-amber-900/20 shadow-2xs transition-all">
      <div>
        {/* District Title & Dismiss */}
        <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-border-color">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {district.districtName}
              </h4>
              <span className="text-xs px-1.5 py-0.5 rounded-md font-mono font-bold bg-white dark:bg-gray-900 text-slate-700 dark:text-slate-300 border border-border-color">
                {district.districtCode}
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <Waves size={12} className="text-primary" />
              <span>{district.riverBasin}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClearSelection}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-white dark:hover:bg-gray-900 transition-colors cursor-pointer"
            title="Clear District Selection"
          >
            <X size={16} />
          </button>
        </div>

        {/* Availability Status Banner */}
        <div className="my-2.5 p-2 rounded-lg bg-white dark:bg-gray-900 border border-border-color flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Availability Level
            </p>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-0.5">
              {style.label}
            </p>
          </div>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-md border ${style.bgBadge} ${style.borderBadge}`}
          >
            {district.availabilityLevel.replace("_", " ")}
          </span>
        </div>

        {/* Quantity Progress */}
        <div className="bg-white dark:bg-gray-900 p-2.5 rounded-lg border border-border-color mb-2.5">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-500 font-medium">Estimated Available Sand</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {district.availableQuantityMt.toLocaleString()} MT
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-gray-800 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pctOfMax}%`,
                backgroundColor: style.fillColor,
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
            <span>0 MT</span>
            <span>Capacity Benchmark: 300K MT</span>
          </div>
        </div>

        {/* Metric Grid */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="bg-white dark:bg-gray-900 p-2 rounded-lg border border-border-color">
            <p className="text-[10px] text-slate-500 flex items-center gap-1">
              <Pickaxe size={11} className="text-primary" />
              <span>Active Sources</span>
            </p>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {district.activeSources}{" "}
              <span className="text-[10px] font-normal text-slate-400">
                / {district.totalReaches} Reaches
              </span>
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 p-2 rounded-lg border border-border-color">
            <p className="text-[10px] text-slate-500 flex items-center gap-1">
              <Truck size={11} className="text-primary" />
              <span>Today Dispatch</span>
            </p>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {district.dailyDispatchMt.toLocaleString()} MT
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 p-2 rounded-lg border border-border-color col-span-2 flex items-center justify-between">
            <p className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span>Compliance Rate</span>
            </p>
            <span className="text-xs font-bold text-emerald-600">
              {district.complianceRatePct}%
            </span>
          </div>
        </div>
      </div>

      {/* Actions to filter dashboard and explore drill-down */}
      <div className="space-y-2 mt-2">
        <button
          type="button"
          onClick={() => {
            if (onApplyDistrictFilter) onApplyDistrictFilter(district.id);
            const el = document.getElementById("district-drilldown-section");
            el?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-lg bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition-colors cursor-pointer"
        >
          <Pickaxe size={13} />
          <span>Explore District Drill-Down & Reaches</span>
        </button>

        {onApplyDistrictFilter && (
          <button
            type="button"
            onClick={() => onApplyDistrictFilter(district.id)}
            className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 px-3 rounded-lg bg-white dark:bg-gray-900 hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-700 dark:text-slate-300 border border-border-color transition-colors cursor-pointer"
          >
            <TrendingUp size={13} className="text-primary" />
            <span>Filter Full Dashboard</span>
          </button>
        )}
      </div>
    </div>
  );
};
