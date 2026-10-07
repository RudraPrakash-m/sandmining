import React, { useState, useMemo } from "react";
import {
  BarChart3,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  MapPin,
  Layers,
  CheckCircle2,
  ChevronRight,
  Download,
} from "lucide-react";
import type { DistrictUtilizationItem } from "../types";
import Card from "@/shared/components/layout/Card/Card";
import Button from "@/shared/components/ui/Button";
import Badge from "@/shared/components/ui/Badge";

interface DistrictSandUtilizationTableProps {
  districts: DistrictUtilizationItem[];
  onDrillDownToDistrict: (districtId: string) => void;
}

export const DistrictSandUtilizationTable: React.FC<DistrictSandUtilizationTableProps> = ({
  districts,
  onDrillDownToDistrict,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBasin, setSelectedBasin] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"utilization" | "dispatched" | "name">("utilization");

  // Extract unique river basins
  const basins = useMemo(() => {
    const set = new Set<string>();
    districts.forEach((d) => set.add(d.riverBasin));
    return ["ALL", ...Array.from(set)];
  }, [districts]);

  // Filtered & sorted records
  const filteredDistricts = useMemo(() => {
    let result = districts.filter((d) => {
      const matchSearch =
        d.districtName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.districtCode.toLowerCase().includes(searchQuery.toLowerCase());
      const matchBasin = selectedBasin === "ALL" || d.riverBasin === selectedBasin;
      return matchSearch && matchBasin;
    });

    result.sort((a, b) => {
      if (sortBy === "utilization") return b.utilizationRatePct - a.utilizationRatePct;
      if (sortBy === "dispatched") return b.dispatchedMt - a.dispatchedMt;
      return a.districtName.localeCompare(b.districtName);
    });

    return result;
  }, [districts, searchQuery, selectedBasin, sortBy]);

  // Aggregated totals
  const aggregates = useMemo(() => {
    const totalQuota = filteredDistricts.reduce((sum, d) => sum + d.approvedQuotaMt, 0);
    const totalDispatched = filteredDistricts.reduce((sum, d) => sum + d.dispatchedMt, 0);
    const totalAvailable = filteredDistricts.reduce((sum, d) => sum + d.availableStockMt, 0);
    const avgUtil = totalQuota > 0 ? (totalDispatched / totalQuota) * 100 : 0;
    return { totalQuota, totalDispatched, totalAvailable, avgUtil };
  }, [filteredDistricts]);

  return (
    <Card className="p-4 sm:p-5">
      {/* ── HEADER & FILTERS ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border-color dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
            <BarChart3 size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              District-wise Sand Utilization Ledger
              <Badge variant="primary" className="text-xs">
                {filteredDistricts.length} Districts
              </Badge>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              State mining quotas, environmental allocation, dispatched tonnages, and utilization efficiency.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative min-w-[180px]">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {/* Basin Dropdown */}
          <select
            value={selectedBasin}
            onChange={(e) => setSelectedBasin(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-orange-500"
          >
            {basins.map((b) => (
              <option key={b} value={b}>
                {b === "ALL" ? "All River Basins" : b}
              </option>
            ))}
          </select>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-orange-500"
          >
            <option value="utilization">Sort by Utilization %</option>
            <option value="dispatched">Sort by Dispatched MT</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* ── AGGREGATE SUMMARY STRIP ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Approved Quota</span>
          <span className="text-base font-black font-mono text-slate-900 dark:text-white">
            {(aggregates.totalQuota / 1000).toFixed(1)}k <span className="text-xs font-normal">MT</span>
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Dispatched</span>
          <span className="text-base font-black font-mono text-blue-600 dark:text-blue-400">
            {(aggregates.totalDispatched / 1000).toFixed(1)}k <span className="text-xs font-normal">MT</span>
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Available in Pit / Stock</span>
          <span className="text-base font-black font-mono text-amber-600 dark:text-amber-400">
            {(aggregates.totalAvailable / 1000).toFixed(1)}k <span className="text-xs font-normal">MT</span>
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase block">State Average Utilization</span>
          <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
            {aggregates.avgUtil.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* ── TABLE VIEW ── */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
              <th className="py-3 px-3.5">District</th>
              <th className="py-3 px-3">River Basin</th>
              <th className="py-3 px-3 text-center">Active Reaches</th>
              <th className="py-3 px-3 text-right">Quota (MT)</th>
              <th className="py-3 px-3 text-right">Dispatched (MT)</th>
              <th className="py-3 px-3 text-right">Available (MT)</th>
              <th className="py-3 px-3 min-w-[170px]">Utilization Rate</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-3.5 text-center">Drill Down</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
            {filteredDistricts.map((item) => {
              const util = item.utilizationRatePct;
              const barColor =
                util >= 80 ? "bg-emerald-500" : util >= 50 ? "bg-amber-500" : "bg-blue-500";
              const statusVariant =
                item.status === "Optimal"
                  ? "success"
                  : item.status === "Near Quota"
                  ? "warning"
                  : "secondary";

              return (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  <td className="py-3 px-3.5 font-bold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-orange-500 shrink-0" />
                      <span>{item.districtName}</span>
                      <span className="font-mono text-[10px] font-normal text-slate-400">
                        ({item.districtCode})
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                    {item.riverBasin}
                  </td>

                  <td className="py-3 px-3 text-center font-mono">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {item.activeReaches}
                    </span>
                    <span className="text-slate-400 text-[10px]"> / {item.totalReaches}</span>
                  </td>

                  <td className="py-3 px-3 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {item.approvedQuotaMt.toLocaleString()}
                  </td>

                  <td className="py-3 px-3 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                    {item.dispatchedMt.toLocaleString()}
                  </td>

                  <td className="py-3 px-3 text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                    {item.availableStockMt.toLocaleString()}
                  </td>

                  <td className="py-3 px-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {util.toFixed(1)}%
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {((item.dispatchedMt / (item.approvedQuotaMt || 1)) * 100).toFixed(0)}% Quota
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden border border-slate-200 dark:border-gray-700">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                          style={{ width: `${Math.min(util, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-center">
                    <Badge variant={statusVariant} className="text-[10px]">
                      {item.status}
                    </Badge>
                  </td>

                  <td className="py-3 px-3.5 text-center">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => onDrillDownToDistrict(item.id)}
                      className="text-xs font-bold gap-1 hover:border-orange-500 hover:text-orange-600"
                    >
                      Drill Down
                      <ChevronRight size={12} />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
