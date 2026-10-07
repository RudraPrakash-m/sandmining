import React, { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type {
  DistrictAvailabilityData,
  DistrictSandAvailabilityMapProps,
  RiverBasin,
} from "./map.types";
import {
  DistrictAvailabilityService,
} from "../../services/districtAvailabilityService";
import { DistrictMapSvg } from "./DistrictMapSvg";
import { DistrictDetailCard } from "./DistrictDetailCard";
import { AvailabilityLegend } from "./AvailabilityLegend";
import { routes } from "@/app/routes/routeConfig";
import {
  MapPin,
  RotateCcw,
  Waves,
  ArrowUpRight,
} from "lucide-react";

export const DistrictSandAvailabilityMap: React.FC<DistrictSandAvailabilityMapProps> = ({
  districtsData,
  selectedDistrictId = null,
  onSelectDistrict,
  className = "",
}) => {
  const navigate = useNavigate();

  // Use provided data or baseline inventory
  const allDistricts = useMemo(() => {
    return districtsData && districtsData.length > 0
      ? districtsData
      : DistrictAvailabilityService.getAllDistricts();
  }, [districtsData]);

  // Selected district state
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(
    selectedDistrictId || null
  );

  // Sync with prop when changed from outside
  React.useEffect(() => {
    if (selectedDistrictId !== undefined) {
      setInternalSelectedId(selectedDistrictId);
    }
  }, [selectedDistrictId]);

  // Hover state
  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictAvailabilityData | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Basin filter state
  const [activeBasin, setActiveBasin] = useState<RiverBasin>("All Basins");

  const availableBasins: RiverBasin[] = [
    "All Basins",
    "Mahanadi Basin",
    "Godavari / Indravati Basin",
    "Son / Ganga Basin",
    "Brahmani Basin",
    "Narmada Basin",
  ];

  // Summary statistics
  const summary = useMemo(() => {
    return DistrictAvailabilityService.getInventorySummary(allDistricts);
  }, [allDistricts]);

  // Current selected district object
  const activeSelectedDistrict = useMemo(() => {
    if (!internalSelectedId) return null;
    return (
      allDistricts.find((d) => d.id === internalSelectedId || d.svgPathId === internalSelectedId) ||
      null
    );
  }, [allDistricts, internalSelectedId]);

  const handleDistrictClick = (dist: DistrictAvailabilityData) => {
    const newId = internalSelectedId === dist.id ? null : dist.id;
    setInternalSelectedId(newId);
    if (onSelectDistrict) {
      onSelectDistrict(newId ? dist : null);
    }
  };

  const handleMouseEnter = (
    dist: DistrictAvailabilityData,
    evt: React.MouseEvent<SVGPathElement>
  ) => {
    setHoveredDistrict(dist);
    if (mapContainerRef.current) {
      const rect = mapContainerRef.current.getBoundingClientRect();
      const x = Math.min(evt.clientX - rect.left + 12, rect.width - 250);
      const y = Math.min(evt.clientY - rect.top + 12, rect.height - 130);
      setTooltipPos({ x, y });
    }
  };

  const handleMouseMove = (evt: React.MouseEvent<HTMLDivElement>) => {
    if (hoveredDistrict && mapContainerRef.current) {
      const rect = mapContainerRef.current.getBoundingClientRect();
      const x = Math.min(evt.clientX - rect.left + 12, rect.width - 250);
      const y = Math.min(evt.clientY - rect.top + 12, rect.height - 130);
      setTooltipPos({ x, y });
    }
  };

  const handleMouseLeave = () => {
    setHoveredDistrict(null);
    setTooltipPos(null);
  };

  const handleClearSelection = () => {
    setInternalSelectedId(null);
    if (onSelectDistrict) {
      onSelectDistrict(null);
    }
  };

  return (
    <div
      className={`bg-white dark:bg-gray-900 border border-border-color rounded-2xl shadow-2xs p-5 transition-all ${className}`}
    >
      {/* ── 1. Header ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <MapPin size={18} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              District-Wise Sand Availability
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Interactive spatial inventory by Chhattisgarh river basins
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          {internalSelectedId && (
            <button
              type="button"
              onClick={handleClearSelection}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-700 dark:text-slate-300 font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>Reset District</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate(routes.gisMap.path)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FAF5EE] hover:bg-orange-100/70 dark:bg-gray-800 dark:hover:bg-gray-700 border border-amber-900/15 text-primary text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>Full GIS Map</span>
            <ArrowUpRight size={13} />
          </button>
        </div>
      </div>

      {/* ── 2. River Basin Filter (Moved to the Top of the Map Area) ── */}
      <div className="pt-2.5 pb-3.5 border-t border-border-color flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0">
          <Waves size={14} className="text-primary" />
          <span>Filter by River Basin:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {availableBasins.map((basin) => {
            const isActive = activeBasin === basin;
            return (
              <button
                key={basin}
                type="button"
                onClick={() => setActiveBasin(basin)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary text-white shadow-xs font-bold"
                    : "bg-[#FAF5EE] text-slate-700 hover:bg-orange-100/60 dark:bg-gray-800 dark:text-slate-300 border border-amber-900/10"
                }`}
              >
                {basin}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3. Main Map + Overview Section ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
        {/* Map Canvas (7 cols on lg) */}
        <div
          ref={mapContainerRef}
          onMouseMove={handleMouseMove}
          className="lg:col-span-7 relative flex items-center justify-center p-3 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-slate-100 dark:border-slate-800 min-h-[440px] max-h-[540px] overflow-hidden"
        >
          <DistrictMapSvg
            districts={allDistricts}
            selectedDistrictId={internalSelectedId}
            hoveredDistrictId={hoveredDistrict ? hoveredDistrict.id : null}
            activeBasinFilter={activeBasin}
            onDistrictClick={handleDistrictClick}
            onDistrictMouseEnter={handleMouseEnter}
            onDistrictMouseLeave={handleMouseLeave}
          />

          {/* ── Floating Legend Inside Map Box (Bottom-Right Corner) ── */}
          <div className="absolute bottom-3 right-3 z-10 pointer-events-auto">
            <AvailabilityLegend levelCounts={summary.levelCounts} />
          </div>

          {/* ── Hover Tooltip Card ─────────────────────────── */}
          {hoveredDistrict && tooltipPos && (
            <div
              className="absolute z-30 pointer-events-none transition-transform duration-75 bg-slate-900/95 dark:bg-black/95 text-white p-3 rounded-xl shadow-xl border border-slate-700/80 backdrop-blur-xs max-w-[240px]"
              style={{
                left: `${tooltipPos.x}px`,
                top: `${tooltipPos.y}px`,
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-sm text-orange-400">
                  {hoveredDistrict.districtName}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-sm font-bold bg-white/10 text-slate-300">
                  {hoveredDistrict.districtCode}
                </span>
              </div>

              <p className="text-[11px] text-slate-300 flex items-center gap-1 mt-0.5">
                <Waves size={10} className="text-primary" />
                <span>{hoveredDistrict.riverBasin}</span>
              </p>

              <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Availability:</span>
                  <span className="font-bold text-white">
                    {hoveredDistrict.availabilityLevel.replace("_", " ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Estimated Quantity:</span>
                  <span className="font-bold text-white">
                    {hoveredDistrict.availableQuantityMt.toLocaleString()} MT
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Sand Sources:</span>
                  <span className="font-bold text-emerald-400">
                    {hoveredDistrict.activeSources} Reaches
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* State Spatial Overview / District Detail Card (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col">
          <DistrictDetailCard
            district={activeSelectedDistrict}
            stateSummary={{
              totalDistricts: summary.totalDistricts,
              totalAvailableQuantityMt: summary.totalAvailableQuantityMt,
              totalActiveSources: summary.totalActiveSources,
              totalDailyDispatchMt: summary.totalDailyDispatchMt,
              avgCompliance: summary.avgCompliance,
            }}
            onClearSelection={handleClearSelection}
            onApplyDistrictFilter={(districtId) => {
              if (onSelectDistrict && activeSelectedDistrict) {
                onSelectDistrict(activeSelectedDistrict);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};
