import React, { useState, useMemo } from "react";
import {
  BarChart3,
  Layers,
} from "lucide-react";
import type { FinancialMetricTab, DistrictFinancialMetric } from "../types";

interface DistrictFinancialBarChartProps {
  selectedDistrictId?: string | null;
  onSelectDistrict?: (districtId: string) => void;
}

// ── Realistic District Financial Dataset across Chhattisgarh ──────────
const DISTRICT_FINANCIAL_DATA: DistrictFinancialMetric[] = [
  {
    districtId: "dist-1",
    districtName: "Raipur",
    districtCode: "RPR",
    salesLakhs: 845.5,
    royaltyLakhs: 236.7,
    netCollectionLakhs: 608.8,
    growthPct: 14.8,
  },
  {
    districtId: "dist-2",
    districtName: "Durg",
    districtCode: "DRG",
    salesLakhs: 712.0,
    royaltyLakhs: 199.3,
    netCollectionLakhs: 512.7,
    growthPct: 11.2,
  },
  {
    districtId: "dist-3",
    districtName: "Bilaspur",
    districtCode: "BSP",
    salesLakhs: 620.4,
    royaltyLakhs: 173.7,
    netCollectionLakhs: 446.7,
    growthPct: 9.5,
  },
  {
    districtId: "dist-4",
    districtName: "Korba",
    districtCode: "KRB",
    salesLakhs: 540.8,
    royaltyLakhs: 151.4,
    netCollectionLakhs: 389.4,
    growthPct: 16.4,
  },
  {
    districtId: "dist-6",
    districtName: "Raigarh",
    districtCode: "RGH",
    salesLakhs: 485.2,
    royaltyLakhs: 135.8,
    netCollectionLakhs: 349.4,
    growthPct: 8.7,
  },
  {
    districtId: "dist-8",
    districtName: "Janjgir",
    districtCode: "JJC",
    salesLakhs: 430.6,
    royaltyLakhs: 120.5,
    netCollectionLakhs: 310.1,
    growthPct: 12.1,
  },
  {
    districtId: "dist-7",
    districtName: "Dhamtari",
    districtCode: "DMT",
    salesLakhs: 365.0,
    royaltyLakhs: 102.2,
    netCollectionLakhs: 262.8,
    growthPct: 7.4,
  },
  {
    districtId: "dist-9",
    districtName: "Bastar",
    districtCode: "BST",
    salesLakhs: 310.5,
    royaltyLakhs: 86.9,
    netCollectionLakhs: 223.6,
    growthPct: 18.2,
  },
  {
    districtId: "dist-14",
    districtName: "Baloda Bazar",
    districtCode: "BBA",
    salesLakhs: 295.2,
    royaltyLakhs: 82.6,
    netCollectionLakhs: 212.6,
    growthPct: 6.9,
  },
  {
    districtId: "dist-5",
    districtName: "Rajnandgaon",
    districtCode: "RJN",
    salesLakhs: 245.0,
    royaltyLakhs: 68.6,
    netCollectionLakhs: 176.4,
    growthPct: 5.8,
  },
];

const TAB_CONFIG: Record<
  FinancialMetricTab,
  {
    label: string;
    barGradient: string;
    barHover: string;
    accentColor: string;
    dotColor: string;
    getValue: (d: DistrictFinancialMetric) => number;
  }
> = {
  sales: {
    label: "Sales",
    barGradient: "from-blue-600 to-indigo-600",
    barHover: "from-blue-500 to-indigo-500",
    accentColor: "#2563eb",
    dotColor: "bg-blue-600",
    getValue: (d) => d.salesLakhs,
  },
  royalty: {
    label: "Royalty Collection",
    barGradient: "from-emerald-600 to-teal-600",
    barHover: "from-emerald-500 to-teal-500",
    accentColor: "#059669",
    dotColor: "bg-emerald-600",
    getValue: (d) => d.royaltyLakhs,
  },
  net: {
    label: "Net Collection",
    barGradient: "from-purple-600 to-indigo-600",
    barHover: "from-purple-500 to-indigo-500",
    accentColor: "#7c3aed",
    dotColor: "bg-purple-600",
    getValue: (d) => d.netCollectionLakhs,
  },
};

export const DistrictFinancialBarChart: React.FC<DistrictFinancialBarChartProps> = ({
  selectedDistrictId,
  onSelectDistrict,
}) => {
  const [activeTab, setActiveTab] = useState<FinancialMetricTab>("sales");
  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictFinancialMetric | null>(null);

  const currentTabConfig = TAB_CONFIG[activeTab];

  // Calculate totals and maximums for scaling
  const { totalAmount, maxAmount } = useMemo(() => {
    let total = 0;
    let max = 0;

    DISTRICT_FINANCIAL_DATA.forEach((item) => {
      const val = currentTabConfig.getValue(item);
      total += val;
      if (val > max) max = val;
    });

    const roundedCeiling = Math.ceil((max * 1.15) / 100) * 100;
    return {
      totalAmount: total,
      maxAmount: Math.max(roundedCeiling, 100),
    };
  }, [currentTabConfig]);

  // Generate 5 evenly spaced Y-axis ticks
  const yTicks = useMemo(() => {
    const step = maxAmount / 4;
    return [0, step, step * 2, step * 3, maxAmount].map((v) => Math.round(v));
  }, [maxAmount]);

  const formatCurrency = (valLakhs: number) => {
    if (valLakhs >= 100) {
      return `₹${(valLakhs / 100).toFixed(2)} Cr`;
    }
    return `₹${valLakhs.toFixed(1)} L`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between h-full min-w-0">
      {/* ── 1. Header & Tab Switcher ──────────────────────────────── */}
      <div>
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <BarChart3 size={17} />
            </div>
            <h2 className="text-sm sm:text-[15px] font-bold text-slate-900 dark:text-white">
              District-Wise Financial Performance
            </h2>
          </div>

          {/* 3 Tab Switcher on the next line */}
          <div className="mt-2.5">
            <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200/80 dark:border-slate-700 text-xs">
              {(["sales", "royalty", "net"] as FinancialMetricTab[]).map((tabKey) => {
                const cfg = TAB_CONFIG[tabKey];
                const isActive = activeTab === tabKey;
                return (
                  <button
                    key={tabKey}
                    type="button"
                    onClick={() => setActiveTab(tabKey)}
                    className={`px-2.5 py-1 font-semibold rounded-md transition-all text-xs cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-bold"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
                    <span>{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── 2. Clean Vertical Bar Chart Area ────────────────────────── */}
        <div className="relative pt-6 pb-2 min-w-0">
          <div className="flex min-w-0">
            {/* Y-Axis Labels (Left) */}
            <div className="w-11 shrink-0 flex flex-col justify-between text-right pr-2 text-[11px] font-mono text-slate-400 dark:text-slate-500 h-56 py-0.5 select-none">
              {[...yTicks].reverse().map((tick) => (
                <span key={tick} className="leading-none">
                  {tick === 0 ? "₹0" : `₹${tick}L`}
                </span>
              ))}
            </div>

            {/* Bars & Gridlines Canvas */}
            <div className="flex-1 min-w-0 relative h-56 flex flex-col justify-end">
              {/* Horizontal Background Gridlines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none py-0.5">
                {yTicks.map((tick) => (
                  <div
                    key={tick}
                    className="w-full border-b border-slate-100 dark:border-slate-800"
                  />
                ))}
              </div>

              {/* Vertical Bars Container */}
              <div className="relative z-10 w-full h-full flex items-end justify-between gap-1 px-0.5">
                {DISTRICT_FINANCIAL_DATA.map((dist) => {
                  const val = currentTabConfig.getValue(dist);
                  const heightPercent = Math.min(Math.max((val / maxAmount) * 100, 3), 100);
                  const isHovered = hoveredDistrict?.districtId === dist.districtId;
                  const isSelected =
                    selectedDistrictId === dist.districtId ||
                    (selectedDistrictId && selectedDistrictId.toLowerCase().includes(dist.districtName.toLowerCase()));

                  return (
                    <div
                      key={dist.districtId}
                      className="flex-1 min-w-0 h-full flex flex-col justify-end items-center group cursor-pointer"
                      onMouseEnter={() => setHoveredDistrict(dist)}
                      onMouseLeave={() => setHoveredDistrict(null)}
                      onClick={() => onSelectDistrict && onSelectDistrict(dist.districtId)}
                    >
                      <div className="w-full max-w-[30px] flex flex-col items-center justify-end h-full">
                        {/* Hover Amount Label */}
                        <div
                          className={`mb-1.5 transition-opacity duration-150 text-[10px] font-mono font-bold px-1 py-0.5 rounded bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md pointer-events-none whitespace-nowrap z-20 ${
                            isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95 hidden sm:block"
                          }`}
                        >
                          {val >= 100 ? `${(val / 100).toFixed(1)}Cr` : `${val.toFixed(0)}L`}
                        </div>

                        {/* Clean Vertical Bar */}
                        <div
                          className={`w-full rounded-t-md bg-gradient-to-t transition-all duration-200 ${
                            isHovered
                              ? currentTabConfig.barHover + " shadow-sm brightness-105"
                              : currentTabConfig.barGradient
                          } ${
                            isSelected
                              ? "ring-2 ring-primary ring-offset-2 dark:ring-offset-slate-900"
                              : selectedDistrictId && selectedDistrictId !== "ALL"
                              ? "opacity-35"
                              : "opacity-95"
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* X-Axis Labels (Districts) */}
          <div className="flex pl-11 pt-2.5 min-w-0">
            <div className="w-full flex justify-between gap-1 px-0.5 min-w-0">
              {DISTRICT_FINANCIAL_DATA.map((dist) => {
                const isHovered = hoveredDistrict?.districtId === dist.districtId;
                const isSelected =
                  selectedDistrictId === dist.districtId ||
                  (selectedDistrictId && selectedDistrictId.toLowerCase().includes(dist.districtName.toLowerCase()));

                return (
                  <div
                    key={dist.districtId}
                    className="flex-1 min-w-0 text-center cursor-pointer px-0.5"
                    onMouseEnter={() => setHoveredDistrict(dist)}
                    onMouseLeave={() => setHoveredDistrict(null)}
                    onClick={() => onSelectDistrict && onSelectDistrict(dist.districtId)}
                  >
                    <p
                      className={`text-[10px] sm:text-[11px] font-semibold truncate block w-full transition-colors ${
                        isHovered || isSelected
                          ? "text-primary dark:text-primary font-bold"
                          : "text-slate-600 dark:text-slate-400"
                      }`}
                      title={dist.districtName}
                    >
                      {dist.districtName}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Clean Footer Info Bar ───────────────────────────────── */}
      <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        {hoveredDistrict ? (
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <span className="font-bold text-primary">{hoveredDistrict.districtName}:</span>
            <span>
              {currentTabConfig.label}:{" "}
              <strong className="text-slate-900 dark:text-white font-bold">
                {formatCurrency(currentTabConfig.getValue(hoveredDistrict))}
              </strong>
            </span>
            <span className="text-slate-400 text-[11px]">
              ({((currentTabConfig.getValue(hoveredDistrict) / totalAmount) * 100).toFixed(1)}% of state total)
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
            <Layers size={13} className="text-slate-400" />
            <span>Hover on any bar to inspect district financial realization</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Statutory Target Met</span>
        </div>
      </div>
    </div>
  );
};

export default DistrictFinancialBarChart;
