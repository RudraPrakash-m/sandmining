import React, { useState } from "react";
import { Truck, Clock, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import type { TelematicsVehicle, TripCategory } from "../types/telematics.types";

export interface LiveVehiclesTableProps {
  vehicles: TelematicsVehicle[];
  selectedVehicleId: string;
  onSelectVehicle: (v: TelematicsVehicle) => void;
  className?: string;
}

export const LiveVehiclesTable: React.FC<LiveVehiclesTableProps> = ({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  className = "",
}) => {
  const [filterCategory, setFilterCategory] = useState<TripCategory | "All">("Active");

  const filteredVehicles = vehicles.filter((v) => {
    if (filterCategory === "All") return true;
    return v.tripCategory === filterCategory;
  });

  const getStatusBadge = (v: TelematicsVehicle) => {
    if (v.tripCategory === "Cancelled") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <XCircle size={10} /> Cancelled
        </span>
      );
    }
    if (v.tripCategory === "Completed" || v.status === "Delivered") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
          <CheckCircle2 size={10} /> Delivered
        </span>
      );
    }
    if (v.status === "Exception") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
          <AlertCircle size={10} /> Breach
        </span>
      );
    }
    if (v.status === "Near Destination") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300">
          Near Dest
        </span>
      );
    }
    if (v.status === "In Transit") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
          In Transit
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
        At Reach
      </span>
    );
  };

  const getVehicleDotColor = (v: TelematicsVehicle) => {
    if (v.tripCategory === "Cancelled") return "text-slate-400";
    if (v.status === "In Transit" || v.status === "Delivered") return "text-emerald-500";
    if (v.status === "Near Destination") return "text-blue-500";
    if (v.status === "Exception") return "text-rose-500";
    return "text-amber-500";
  };

  const activeCount = vehicles.filter((v) => v.tripCategory === "Active").length;
  const completedCount = vehicles.filter((v) => v.tripCategory === "Completed").length;
  const cancelledCount = vehicles.filter((v) => v.tripCategory === "Cancelled").length;

  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden flex flex-col ${className}`}
    >
      {/* ── Card Header ── */}
      <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck size={16} className="text-blue-600 dark:text-blue-400" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Fleet Transit Registry</h2>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {filteredVehicles.length} of {vehicles.length} Trucks
        </span>
      </div>

      {/* ── Category Filter Tabs (Active / Completed / Cancelled / All) ── */}
      <div className="flex items-center gap-1 p-2 bg-slate-50 dark:bg-gray-800/40 border-b border-slate-200 dark:border-slate-800 text-[11px] overflow-x-auto">
        <button
          type="button"
          onClick={() => setFilterCategory("Active")}
          className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
            filterCategory === "Active"
              ? "bg-[#c2410c] text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-gray-700"
          }`}
        >
          Active Trips ({activeCount})
        </button>
        <button
          type="button"
          onClick={() => setFilterCategory("Completed")}
          className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
            filterCategory === "Completed"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-gray-700"
          }`}
        >
          Completed ({completedCount})
        </button>
        <button
          type="button"
          onClick={() => setFilterCategory("Cancelled")}
          className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
            filterCategory === "Cancelled"
              ? "bg-slate-700 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-gray-700"
          }`}
        >
          Cancelled ({cancelledCount})
        </button>
        <button
          type="button"
          onClick={() => setFilterCategory("All")}
          className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ml-auto ${
            filterCategory === "All"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
              : "text-slate-500 hover:bg-slate-200 dark:hover:bg-gray-700"
          }`}
        >
          All Fleet
        </button>
      </div>

      {/* ── Table Header ── */}
      <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-gray-800/30">
        <div className="col-span-5">Vehicle & Order</div>
        <div className="col-span-3">Departure</div>
        <div className="col-span-2">Delay</div>
        <div className="col-span-2 text-right">Status</div>
      </div>

      {/* ── Table Rows ── */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/60 overflow-y-auto max-h-[320px] custom-scrollbar-thin">
        {filteredVehicles.map((v) => {
          const isSelected = v.id === selectedVehicleId;
          const dotColor = getVehicleDotColor(v);

          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onSelectVehicle(v)}
              className={`w-full text-left grid grid-cols-12 gap-2 px-3 py-2.5 items-center transition-colors cursor-pointer text-xs ${
                isSelected
                  ? "bg-orange-50/80 dark:bg-orange-950/30 border-l-3 border-[#c2410c] font-medium"
                  : "hover:bg-slate-50 dark:hover:bg-gray-800/60"
              }`}
            >
              {/* Vehicle No & Order ID */}
              <div className="col-span-5 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[9px] ${dotColor}`}>●</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white truncate">
                    {v.vehicleNumber}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 block truncate pl-3">
                  {v.orderId || v.bookingId || "ORD-CG"} • {v.netWeightTons || 25} MT
                </span>
              </div>

              {/* Departure Time */}
              <div className="col-span-3 text-[10px] font-mono text-slate-600 dark:text-slate-300 truncate">
                {v.tripStartTime ? v.tripStartTime.slice(-8) : "10:45 AM"}
              </div>

              {/* Delay status */}
              <div className="col-span-2 text-[10px] font-mono">
                {v.delayMinutes > 0 ? (
                  <span className="font-bold text-rose-600 dark:text-rose-400 truncate block">
                    +{v.delayMinutes}m
                  </span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold truncate block">
                    0m
                  </span>
                )}
              </div>

              {/* Status */}
              <div className="col-span-2 flex justify-end">
                {getStatusBadge(v)}
              </div>
            </button>
          );
        })}

        {filteredVehicles.length === 0 && (
          <div className="p-6 text-center text-xs text-slate-400">
            No trips found in this category.
          </div>
        )}
      </div>
    </div>
  );
};

