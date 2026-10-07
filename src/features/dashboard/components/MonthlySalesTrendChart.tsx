import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  Info,
} from "lucide-react";
import type { MonthlySalesDataPoint } from "../types";

// ── 12-Month Financial Year Sand Sales Data across Chhattisgarh ─────
const MONTHLY_SALES_DATA: MonthlySalesDataPoint[] = [
  { month: "Apr", salesCr: 3.85, volumeMt: 38500, targetCr: 3.5, growthPct: 10.2 },
  { month: "May", salesCr: 4.92, volumeMt: 49200, targetCr: 4.2, growthPct: 27.8 }, // Peak Pre-monsoon
  { month: "Jun", salesCr: 4.40, volumeMt: 44000, targetCr: 4.0, growthPct: -10.5 },
  { month: "Jul", salesCr: 2.10, volumeMt: 21000, targetCr: 2.5, growthPct: -52.2 }, // Monsoon low
  { month: "Aug", salesCr: 1.85, volumeMt: 18500, targetCr: 2.2, growthPct: -11.9 }, // Peak Monsoon
  { month: "Sep", salesCr: 3.15, volumeMt: 31500, targetCr: 3.0, growthPct: 70.2 }, // Post-monsoon opening
  { month: "Oct", salesCr: 4.30, volumeMt: 43000, targetCr: 4.1, growthPct: 36.5 },
  { month: "Nov", salesCr: 4.85, volumeMt: 48500, targetCr: 4.5, growthPct: 12.8 },
  { month: "Dec", salesCr: 5.10, volumeMt: 51000, targetCr: 4.8, growthPct: 5.1 },
  { month: "Jan", salesCr: 5.35, volumeMt: 53500, targetCr: 5.0, growthPct: 4.9 },
  { month: "Feb", salesCr: 5.60, volumeMt: 56000, targetCr: 5.2, growthPct: 4.7 },
  { month: "Mar", salesCr: 6.20, volumeMt: 62000, targetCr: 5.8, growthPct: 10.7 }, // Year-end high
];

export const MonthlySalesTrendChart: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { maxSales, peakMonth } = useMemo(() => {
    let max = 0;
    let peak = MONTHLY_SALES_DATA[0];

    MONTHLY_SALES_DATA.forEach((d) => {
      if (d.salesCr > max) {
        max = d.salesCr;
        peak = d;
      }
    });

    const ceiling = Math.ceil(max * 1.15);
    return {
      maxSales: Math.max(ceiling, 7),
      peakMonth: peak,
    };
  }, []);

  // SVG dimensions for vector curve
  const width = 600;
  const height = 230;
  const paddingLeft = 42;
  const paddingRight = 16;
  const paddingTop = 22;
  const paddingBottom = 32;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Compute (x, y) coordinates for all 12 points
  const points = useMemo(() => {
    return MONTHLY_SALES_DATA.map((item, index) => {
      const x = paddingLeft + (index / (MONTHLY_SALES_DATA.length - 1)) * chartWidth;
      const y = paddingTop + chartHeight - (item.salesCr / maxSales) * chartHeight;
      return { x, y, ...item };
    });
  }, [chartWidth, chartHeight, maxSales]);

  // Generate smooth cubic Bézier curve path (Catmull-Rom to Bézier)
  const linePath = useMemo(() => {
    if (points.length === 0) return "";
    let d = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 >= points.length ? points.length - 1 : i + 2];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;

      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }, [points]);

  // Area path below curve for gradient fill
  const areaPath = useMemo(() => {
    if (points.length === 0) return "";
    const bottomY = paddingTop + chartHeight;
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [linePath, points, chartHeight]);

  // Y-axis ticks
  const yAxisTicks = useMemo(() => {
    const step = maxSales / 4;
    return [0, step, step * 2, step * 3, maxSales].map((val) => Number(val.toFixed(1)));
  }, [maxSales]);

  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between h-full">
      {/* ── 1. Clean One-Line Header ───────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/70 text-primary flex items-center justify-center shrink-0">
              <TrendingUp size={17} />
            </div>
            <h2 className="text-sm sm:text-[15px] font-bold text-slate-900 dark:text-white truncate">
              Monthly Sales Trend
            </h2>
            <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800">
              FY 2025-26
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-primary font-semibold shrink-0">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-[11px]">Actual Sales (₹ Cr)</span>
          </div>
        </div>

        {/* ── 2. Clean SVG Curve Line Chart ─────────────────────────── */}
        <div className="relative w-full overflow-hidden pt-5 pb-1">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-56 select-none"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Primary Area Gradient */}
              <linearGradient id="cleanSalesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c2410c" stopOpacity="0.25" />
                <stop offset="65%" stopColor="#ea580c" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#fb923c" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Background Gridlines & Y-Axis Labels */}
            {yAxisTicks.map((tick) => {
              const y = paddingTop + chartHeight - (tick / maxSales) * chartHeight;
              return (
                <g key={tick}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke="currentColor"
                    className="text-slate-100 dark:text-slate-800"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 3.5}
                    textAnchor="end"
                    className="text-[11px] font-mono fill-slate-400 dark:fill-slate-500"
                  >
                    {tick === 0 ? "₹0" : `₹${tick}Cr`}
                  </text>
                </g>
              );
            })}

            {/* Filled Area Under Curve */}
            <path d={areaPath} fill="url(#cleanSalesGradient)" />

            {/* The Main Curved Line */}
            <path
              d={linePath}
              fill="none"
              stroke="#c2410c"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Hover Vertical Guide Line */}
            {activePoint && (
              <line
                x1={activePoint.x}
                y1={paddingTop}
                x2={activePoint.x}
                y2={paddingTop + chartHeight}
                stroke="#c2410c"
                strokeWidth="1.2"
                strokeDasharray="3 3"
                opacity="0.6"
              />
            )}

            {/* Interactive Points & X-Axis Month Labels */}
            {points.map((p, index) => {
              const isHovered = hoveredIndex === index;
              const isPeak = p.month === peakMonth.month;

              return (
                <g
                  key={p.month}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <rect
                    x={p.x - 18}
                    y={paddingTop}
                    width={36}
                    height={chartHeight + paddingBottom}
                    fill="transparent"
                  />

                  {/* Dot on Line */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered ? "5.5" : isPeak ? "4.5" : "3"}
                    fill={isPeak ? "#c2410c" : isHovered ? "#9a3412" : "#ffffff"}
                    stroke="#c2410c"
                    strokeWidth={isPeak || isHovered ? "2.5" : "2"}
                    className="transition-all duration-150"
                  />

                  {/* X-Axis Month Label */}
                  <text
                    x={p.x}
                    y={height - 6}
                    textAnchor="middle"
                    className={`text-[11px] font-semibold transition-colors ${
                      isHovered
                        ? "fill-primary font-bold"
                        : "fill-slate-500 dark:fill-slate-400"
                    }`}
                  >
                    {p.month}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* ── 3. Clean Single-Line Footer ────────────────────────────── */}
      <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        {activePoint ? (
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <span className="font-bold text-primary">{activePoint.month}:</span>
            <span>
              Revenue: <strong className="text-slate-900 dark:text-white font-bold">₹{activePoint.salesCr.toFixed(2)} Cr</strong>
            </span>
            <span className="text-slate-400 text-[11px]">
              ({activePoint.volumeMt.toLocaleString()} MT)
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                activePoint.growthPct >= 0
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
              }`}
            >
              {activePoint.growthPct >= 0 ? `+${activePoint.growthPct}%` : `${activePoint.growthPct}%`} MoM
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
            <Info size={13} className="text-slate-400" />
            <span>Monsoon regulatory break observed during Jul - Aug</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span>Target Fulfilled:</span>
          <span className="font-bold text-emerald-600">106.4%</span>
        </div>
      </div>
    </div>
  );
};

export default MonthlySalesTrendChart;
