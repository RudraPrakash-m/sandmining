import React from "react";
import {
  Search,
  Phone,
  Truck,
  Hash,
  Sparkles,
  RotateCcw,
  Headset,
} from "lucide-react";
import Button from "@/shared/components/ui/Button";
import { inputBase, inputNormal } from "@/shared/components/ui/Forms/inputStyles";
import type { SearchCriteriaType } from "../types";

export interface CallCentreSearchConsoleProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchType: SearchCriteriaType;
  onSearchTypeChange: (type: SearchCriteriaType) => void;
  onQuickSelect: (query: string, type: SearchCriteriaType) => void;
  totalResults: number;
}

export const CallCentreSearchConsole: React.FC<CallCentreSearchConsoleProps> = ({
  searchQuery,
  onSearchChange,
  searchType,
  onSearchTypeChange,
  onQuickSelect,
  totalResults,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 md:p-5 shadow-xs space-y-4">
      {/* Criteria Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
            <Search size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Instant Consignment Lookup Console
            </h3>
            <p className="text-[11px] text-slate-500">
              Query real-time database across Order ID, Consignee Mobile, or Commercial Vehicle Number
            </p>
          </div>
        </div>

        {/* Tab Switchers */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {[
            { id: "all", label: "All Fields", icon: Search },
            { id: "orderId", label: "Order ID", icon: Hash },
            { id: "mobileNumber", label: "Mobile No.", icon: Phone },
            { id: "vehicleNumber", label: "Vehicle No.", icon: Truck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = searchType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSearchTypeChange(tab.id as SearchCriteriaType)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon size={12} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Omnisearch Input Field */}
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
          {searchType === "orderId" && <Hash size={18} className="text-orange-500" />}
          {searchType === "mobileNumber" && <Phone size={18} className="text-blue-500" />}
          {searchType === "vehicleNumber" && <Truck size={18} className="text-emerald-500" />}
          {searchType === "all" && <Search size={18} className="text-purple-500" />}
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={
            searchType === "orderId"
              ? "Enter Order ID (e.g. ORD-CG-2026-8801, BKG-001)..."
              : searchType === "mobileNumber"
              ? "Enter Customer Mobile Number (e.g. 9827188401, 9826122341)..."
              : searchType === "vehicleNumber"
              ? "Enter Vehicle Number (e.g. CG-04-TX-2341, CG-04-MB-5512)..."
              : "Search by Order ID, Customer Mobile, or Vehicle Number..."
          }
          className={`${inputBase} ${inputNormal} pl-11 pr-24 py-3 text-sm font-semibold tracking-wide rounded-xl`}
          autoFocus
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md"
          >
            Clear
          </button>
        )}
      </div>

      {/* Quick Demo Filter Chips */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Sparkles size={12} className="text-amber-500" />
            Quick One-Click Test Cases:
          </span>

          <button
            type="button"
            onClick={() => onQuickSelect("ORD-CG-2026-8801", "orderId")}
            className="px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 text-[11px] font-mono font-bold hover:bg-orange-100 transition-colors"
          >
            # ORD-CG-2026-8801 (In Transit)
          </button>

          <button
            type="button"
            onClick={() => onQuickSelect("9827188401", "mobileNumber")}
            className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-mono font-bold hover:bg-blue-100 transition-colors"
          >
            📞 +91 98271 88401 (Vikramaditya)
          </button>

          <button
            type="button"
            onClick={() => onQuickSelect("CG-04-TX-2341", "vehicleNumber")}
            className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-mono font-bold hover:bg-emerald-100 transition-colors"
          >
            🚚 CG-04-TX-2341 (Tipper)
          </button>

          <button
            type="button"
            onClick={() => onQuickSelect("BKG-002", "orderId")}
            className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[11px] font-mono font-bold hover:bg-purple-100 transition-colors"
          >
            # BKG-002 (Near Destination)
          </button>
        </div>

        <div className="text-[11px] font-bold text-slate-500">
          Showing <strong>{totalResults}</strong> matching consignment{totalResults === 1 ? "" : "s"}
        </div>
      </div>
    </div>
  );
};

export default CallCentreSearchConsole;
