import React from "react";
import {
  Pickaxe,
  Building2,
  Layers,
  Calendar,
  IndianRupee,
  Clock,
  CheckCircle2,
  Truck,
  Navigation,
  CheckCheck,
  AlertTriangle,
  XCircle,
  MessageSquare,
  BarChart3,
  TrendingUp,
  Radio,
  ArrowUpRight,
  ShieldAlert,
} from "lucide-react";
import type { AdminRealTimeKpiData } from "../types";
import Card from "@/shared/components/layout/Card/Card";
import Badge from "@/shared/components/ui/Badge";

interface RealTimeKpiGridProps {
  kpis: AdminRealTimeKpiData;
  onKpiClick?: (kpiKey: string) => void;
  onOpenUtilization?: () => void;
}

export const RealTimeKpiGrid: React.FC<RealTimeKpiGridProps> = ({
  kpis,
  onKpiClick,
  onOpenUtilization,
}) => {
  return (
    <div className="space-y-4">
      {/* ── LIVE TELEMETRY CONTROL BAR ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 px-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="size-8.5 rounded-xl bg-orange-100 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800/60 text-[#c2410c] dark:text-orange-400 flex items-center justify-center shrink-0 shadow-2xs">
            <Radio size={16} className="animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider block text-slate-900 dark:text-white">
              Real-Time Surveillance & Operations Ledger
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
              Surveillance Engine Active • AIS-140 GPS Corridor Telematics • Weighbridge Auto-Tare Feed
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1.5 shadow-2xs">
            <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
            16 Mandatory KPIs Monitored Live
          </span>
        </div>
      </div>

      {/* ── 16 KEY KPIS ORGANIZED INTO 4 THEMATIC CLUSTERS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {/* ── CLUSTER A: SAND REACH & MINERAL STOCK ── */}

        {/* 1. Total Sand Reaches */}
        <div
          onClick={() => onKpiClick?.("totalReaches")}
          className="p-4 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all cursor-pointer group hover:border-orange-400 dark:hover:border-orange-500 relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Pickaxe size={14} className="text-amber-500" />
              1. Total Sand Reaches
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
              33 Dists
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {kpis.totalSandReaches}
            </div>
            <span className="text-xs text-slate-400 font-medium">Reaches</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Riverbed + De-siltation</span>
            <span className="text-emerald-600 font-semibold">+6 New FY26</span>
          </div>
        </div>

        {/* 2. Active Sand Reaches */}
        <div
          onClick={() => onKpiClick?.("activeReaches")}
          className="p-4 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all cursor-pointer group hover:border-emerald-400 dark:hover:border-emerald-500 relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Building2 size={14} className="text-emerald-500" />
              2. Active Sand Reaches
            </span>
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {kpis.activeSandReaches}
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {Math.round((kpis.activeSandReaches / (kpis.totalSandReaches || 1)) * 100)}% Oper.
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>CCTV & Scales Verified</span>
            <span className="text-slate-400 font-mono">Live Mining</span>
          </div>
        </div>

        {/* 3. Total Available Sand */}
        <div
          onClick={() => onKpiClick?.("availableStock")}
          className="p-4 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all cursor-pointer group hover:border-amber-400 dark:hover:border-amber-500 relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Layers size={14} className="text-orange-500" />
              3. Total Available Sand
            </span>
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 rounded">
              Formula Stock
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
              {(kpis.totalAvailableSandMt / 1000).toFixed(1)}k <span className="text-xs font-normal">MT</span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {kpis.totalAvailableSandMt.toLocaleString()} MT
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Opening + Extracted − Dispatched</span>
            <span className="text-emerald-600 font-semibold">Healthy</span>
          </div>
        </div>

        {/* ── CLUSTER B: ORDERS & FINANCIAL REAL-TIME KPIS ── */}

        {/* 4. Today’s Bookings */}
        <div
          onClick={() => onKpiClick?.("todayBookings")}
          className="p-4 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all cursor-pointer group hover:border-blue-400 dark:hover:border-blue-500 relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-blue-500" />
              4. Today’s Bookings
            </span>
            <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.5 rounded">
              Online + Portal
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400">
              {kpis.todayBookingsCount.toLocaleString()}
            </div>
            <span className="text-xs font-mono text-slate-500 font-bold">
              {kpis.todayBookingsMt.toLocaleString()} MT
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Citizen + Contractors</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
              <TrendingUp size={11} /> +14.2% DoD
            </span>
          </div>
        </div>

        {/* 5. Today’s Revenue */}
        <div
          onClick={() => onKpiClick?.("todayRevenue")}
          className="p-4 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all cursor-pointer group hover:border-emerald-400 dark:hover:border-emerald-500 relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <IndianRupee size={14} className="text-emerald-500" />
              5. Today’s Revenue
            </span>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
              Treasury
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              ₹ {(kpis.todayRevenueRs / 10000000).toFixed(2)} Cr
            </div>
            <span className="text-xs font-mono text-slate-400">
              ₹ {kpis.todayRevenueRs.toLocaleString()}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Royalty + DMF + GST</span>
            <span className="text-emerald-600 font-semibold">Reconciled</span>
          </div>
        </div>

        {/* 6. Pending Payments */}
        <div
          onClick={() => onKpiClick?.("pendingPayments")}
          className="p-4 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all cursor-pointer group hover:border-amber-400 dark:hover:border-amber-500 relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-amber-500" />
              6. Pending Payments
            </span>
            <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 rounded">
              Challan Active
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
              {kpis.pendingPaymentsCount}
            </div>
            <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-300">
              ₹ {(kpis.pendingPaymentsRs / 100000).toFixed(2)} Lakh
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Awaiting Payment Gateway</span>
            <span className="text-slate-400">SBI e-Pay / UPI</span>
          </div>
        </div>

        {/* 7. Confirmed Orders */}
        <div
          onClick={() => onKpiClick?.("confirmedOrders")}
          className="p-4 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all cursor-pointer group hover:border-purple-400 dark:hover:border-purple-500 relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-purple-500" />
              7. Confirmed Orders
            </span>
            <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 dark:bg-purple-950/50 px-1.5 py-0.5 rounded">
              Paid / Valid
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-black font-mono text-purple-600 dark:text-purple-400">
              {kpis.confirmedOrdersCount.toLocaleString()}
            </div>
            <span className="text-xs text-purple-600 dark:text-purple-400 font-bold">
              Ready for Queue
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Payment Verified</span>
            <span className="text-emerald-600 font-semibold">100% Guaranteed</span>
          </div>
        </div>

        {/* ── CLUSTER C: TRANSPORT & FLEET REAL-TIME KPIS ── */}

        {/* 8. Vehicles Available */}
        <div
          onClick={() => onKpiClick?.("vehiclesAvailable")}
          className="p-4 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all cursor-pointer group hover:border-emerald-400 dark:hover:border-emerald-500 relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Truck size={14} className="text-emerald-500" />
              8. Vehicles Available
            </span>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
              FIFO Queue
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {kpis.vehiclesAvailableCount}
            </div>
            <span className="text-xs text-slate-400 font-medium">In Queue</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Tippers + Tractors</span>
            <span className="text-emerald-600 font-semibold">Avg Wait 24m</span>
          </div>
        </div>

        {/* 9. Vehicles on Trip */}
        <div
          onClick={() => onKpiClick?.("vehiclesOnTrip")}
          className="p-4 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all cursor-pointer group hover:border-indigo-400 dark:hover:border-indigo-500 relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Navigation size={14} className="text-indigo-500" />
              9. Vehicles on Trip
            </span>
            <span className="size-2 rounded-full bg-indigo-500 animate-ping" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">
              {kpis.vehiclesOnTripCount}
            </div>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">
              Active Fleet
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>En Route Pickup / Drop</span>
            <span className="text-slate-400 font-mono">GPS Monitored</span>
          </div>
        </div>

        {/* ── CLUSTER D: CONSIGNMENT & MOVEMENT PIPELINE KPIS ── */}

        {/* 10. Pickup Pending */}
        <div
          onClick={() => onKpiClick?.("pickupPending")}
          className="p-4 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all cursor-pointer group hover:border-amber-400 dark:hover:border-amber-500 relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-amber-500" />
              10. Pickup Pending
            </span>
            <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 rounded">
              Reach Loading
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
              {kpis.pickupPendingCount}
            </div>
            <span className="text-xs text-slate-400 font-medium">Consignments</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Heading to Sand Reach</span>
            <span className="text-amber-600 font-semibold">Weighing Queue</span>
          </div>
        </div>

        {/* 11. In Transit */}
        <div
          onClick={() => onKpiClick?.("inTransit")}
          className="p-4 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all cursor-pointer group hover:border-blue-400 dark:hover:border-blue-500 relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Truck size={14} className="text-blue-500" />
              11. In Transit
            </span>
            <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/60 px-1.5 py-0.5 rounded">
              e-Pass Active
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400">
              {kpis.inTransitCount}
            </div>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">
              Corridor Flow
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Pass Validated + Geotagged</span>
            <span className="text-emerald-600 font-semibold">Green Corridor</span>
          </div>
        </div>

        {/* 12. Delivered */}
        <div
          onClick={() => onKpiClick?.("delivered")}
          className="p-4 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all cursor-pointer group hover:border-emerald-400 dark:hover:border-emerald-500 relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <CheckCheck size={14} className="text-emerald-500" />
              12. Delivered
            </span>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
              POD Closed
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {kpis.deliveredCount.toLocaleString()}
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              OTP Verified
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Consignee Handover Closed</span>
            <span className="text-emerald-600 font-semibold">100% Geotagged</span>
          </div>
        </div>

        {/* ── CLUSTER E: EXCEPTIONS & SURVEILLANCE KPIS ── */}

        {/* 13. Delayed Deliveries */}
        <div
          onClick={() => onKpiClick?.("delayedDeliveries")}
          className="p-4 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all cursor-pointer group hover:border-rose-400 dark:hover:border-rose-500 relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-rose-500" />
              13. Delayed Deliveries
            </span>
            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/60 px-1.5 py-0.5 rounded">
              Over ETA
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-black font-mono text-rose-600 dark:text-rose-400">
              {kpis.delayedDeliveriesCount}
            </div>
            <span className="text-xs text-rose-600 dark:text-rose-400 font-bold">
              Flagged
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Traffic / Breakdown</span>
            <span className="text-rose-600 font-semibold">Call Centre Esc.</span>
          </div>
        </div>

        {/* 14. Cancelled Orders */}
        <div
          onClick={() => onKpiClick?.("cancelledOrders")}
          className="p-4 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all cursor-pointer group hover:border-rose-400 dark:hover:border-rose-500 relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <XCircle size={14} className="text-rose-500" />
              14. Cancelled Orders
            </span>
            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
              Refunds
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-black font-mono text-slate-700 dark:text-slate-300">
              {kpis.cancelledOrdersCount}
            </div>
            <span className="text-xs text-slate-400 font-medium">Orders</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Customer Withdrawal / Out of Stock</span>
            <span className="text-slate-400">Auto-Reconciled</span>
          </div>
        </div>

        {/* 15. Complaints */}
        <div
          onClick={() => onKpiClick?.("complaints")}
          className="p-4 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all cursor-pointer group hover:border-purple-400 dark:hover:border-purple-500 relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <MessageSquare size={14} className="text-purple-500" />
              15. Complaints
            </span>
            <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 px-1.5 py-0.5 rounded">
              Grievances
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-black font-mono text-purple-600 dark:text-purple-400">
              {kpis.complaintsTotalCount}
            </div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
              {kpis.complaintsOpenCount} Unresolved
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Citizen Tele-Desk + Portal</span>
            <span className="text-emerald-600 font-semibold">SLA 4 Hrs</span>
          </div>
        </div>

        {/* 16. District-wise Sand Utilization */}
        <div
          onClick={onOpenUtilization}
          className="p-4 bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-orange-100 text-xs font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <BarChart3 size={14} className="text-white" />
              16. Sand Utilization
            </span>
            <span className="text-[10px] font-black bg-white/20 px-1.5 py-0.5 rounded text-white backdrop-blur-xs flex items-center gap-0.5">
              Inspect <ArrowUpRight size={10} />
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-black font-mono text-white">
              78.4%
            </div>
            <span className="text-xs font-bold text-orange-100">
              State Avg Rate
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-orange-100">
            <span>District-wise Matrix</span>
            <span className="font-bold underline text-white">Click to View Table</span>
          </div>
        </div>
      </div>
    </div>
  );
};
