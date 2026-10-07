import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Pickaxe,
  Building2,
  Truck,
  IndianRupee,
  CheckCircle2,
  CircleDot,
  Send,
  Bell,
  ArrowUpRight,
  MapPin,
  Filter,
  Calendar,
  AlertTriangle,
  ShieldAlert,
  SlidersHorizontal,
  TrendingUp,
  Activity,
  Layers,
  Clock,
  Eye,
  Check,
  X,
  Radio,
} from "lucide-react";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import { routes } from "@/app/routes/routeConfig";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import {
  setSelectedDistrict,
  setDateRange,
  selectDashboardDistrict,
  selectDashboardDateRange,
  resetDashboardFilters,
} from "../slice/dashboardSlice";
import {
  DistrictSandAvailabilityMap,
  DistrictFinancialBarChart,
  MonthlySalesTrendChart,
  DistrictSandUtilizationTable,
} from "../components";
import {
  CHHATTISGARH_DISTRICT_INVENTORY,
  DistrictAvailabilityService,
} from "../services/districtAvailabilityService";
import type {
  DistrictMapData,
  DateRangePreset,
  RecentAlertItem,
  IllegalMiningAlertItem,
  RevenueTrendPoint,
  BookingDispatchTrendPoint,
  DistrictUtilizationItem,
} from "../types";
import "../styles/dashboard.css";

// ── District Map Coordinate Data (Chhattisgarh River Basins) ────────
const DISTRICT_MAP_DATA: DistrictMapData[] = [
  {
    id: "dist-1",
    name: "Raipur (Mahanadi Basin)",
    code: "RPR",
    stockLabel: "18.5k",
    stockMt: 18450,
    status: "High",
    fillColor: "#bbf7d0",
    hoverColor: "#86efac",
    path: "M 80,105 C 80,75 110,50 145,45 C 168,42 188,52 200,68 C 190,88 175,102 155,115 C 128,125 102,120 80,105 Z",
    labelX: 140,
    labelY: 80,
    activeReaches: 34,
    todayDispatchMt: 2450,
    totalPermits: 42,
    complianceRatePct: 98.2,
  },
  {
    id: "dist-2",
    name: "Durg (Shivnath Valley)",
    code: "DRG",
    stockLabel: "14.2k",
    stockMt: 14200,
    status: "High",
    fillColor: "#bbf7d0",
    hoverColor: "#86efac",
    path: "M 200,68 C 220,55 260,60 288,75 C 305,85 298,105 278,118 C 248,125 212,115 198,100 C 192,88 196,78 200,68 Z",
    labelX: 245,
    labelY: 90,
    activeReaches: 22,
    todayDispatchMt: 1800,
    totalPermits: 28,
    complianceRatePct: 96.5,
  },
  {
    id: "dist-3",
    name: "Bilaspur (Arpa Basin)",
    code: "BSP",
    stockLabel: "5.2k",
    stockMt: 5200,
    status: "Low",
    fillColor: "#fecdd3",
    hoverColor: "#fca5a5",
    path: "M 155,115 C 175,102 198,100 212,115 C 248,125 240,140 232,152 C 205,160 170,162 145,150 C 140,135 148,122 155,115 Z",
    labelX: 185,
    labelY: 134,
    activeReaches: 12,
    todayDispatchMt: 750,
    totalPermits: 16,
    complianceRatePct: 91.0,
  },
  {
    id: "dist-4",
    name: "Korba (Hasdeo Reach)",
    code: "KRB",
    stockLabel: "16.8k",
    stockMt: 16800,
    status: "High",
    fillColor: "#bbf7d0",
    hoverColor: "#86efac",
    path: "M 80,105 C 102,120 128,125 145,150 C 120,165 90,165 60,150 C 45,135 55,115 80,105 Z",
    labelX: 95,
    labelY: 130,
    activeReaches: 28,
    todayDispatchMt: 2100,
    totalPermits: 35,
    complianceRatePct: 97.4,
  },
  {
    id: "dist-5",
    name: "Rajnandgaon (Border Reach)",
    code: "RJN",
    stockLabel: "7.1k",
    stockMt: 7100,
    status: "Low",
    fillColor: "#fecdd3",
    hoverColor: "#fca5a5",
    path: "M 60,150 C 90,165 120,165 115,185 C 95,200 65,195 45,180 C 35,165 45,155 60,150 Z",
    labelX: 78,
    labelY: 175,
    activeReaches: 14,
    todayDispatchMt: 920,
    totalPermits: 18,
    complianceRatePct: 93.8,
  },
  {
    id: "dist-6",
    name: "Raigarh (Kelo Basin)",
    code: "RGH",
    stockLabel: "12.4k",
    stockMt: 12400,
    status: "Medium",
    fillColor: "#fef08a",
    hoverColor: "#fde047",
    path: "M 232,152 C 240,140 248,125 278,118 C 298,135 305,155 285,175 C 255,180 220,172 232,152 Z",
    labelX: 262,
    labelY: 152,
    activeReaches: 20,
    todayDispatchMt: 1600,
    totalPermits: 24,
    complianceRatePct: 95.0,
  },
  {
    id: "dist-7",
    name: "Dhamtari (Gangrel Basin)",
    code: "DMT",
    stockLabel: "9.3k",
    stockMt: 9300,
    status: "Medium",
    fillColor: "#fef08a",
    hoverColor: "#fde047",
    path: "M 288,75 C 318,90 335,115 325,140 C 305,155 298,135 278,118 C 298,105 305,85 288,75 Z",
    labelX: 305,
    labelY: 118,
    activeReaches: 15,
    todayDispatchMt: 1100,
    totalPermits: 20,
    complianceRatePct: 94.2,
  },
  {
    id: "dist-8",
    name: "Janjgir-Champa (Confluence)",
    code: "JJC",
    stockLabel: "15.6k",
    stockMt: 15600,
    status: "High",
    fillColor: "#bbf7d0",
    hoverColor: "#86efac",
    path: "M 145,150 C 170,162 205,160 232,152 C 220,172 225,180 225,195 C 208,215 168,220 138,208 C 115,185 120,165 145,150 Z",
    labelX: 175,
    labelY: 185,
    activeReaches: 26,
    todayDispatchMt: 2200,
    totalPermits: 31,
    complianceRatePct: 97.9,
  },
  {
    id: "dist-9",
    name: "Bastar (Indravati Basin)",
    code: "BST",
    stockLabel: "24.2k",
    stockMt: 24200,
    status: "High",
    fillColor: "#60a5fa",
    hoverColor: "#3b82f6",
    path: "M 138,208 C 168,220 208,215 185,250 C 165,278 128,280 110,255 C 105,235 115,215 138,208 Z",
    labelX: 148,
    labelY: 248,
    activeReaches: 38,
    todayDispatchMt: 3200,
    totalPermits: 46,
    complianceRatePct: 99.1,
  },
];

// ── Revenue Trend Data (Daily & Period Comparison) ──────────────────
const REVENUE_TREND_DATA: RevenueTrendPoint[] = [
  { period: "01 Sep", revenueCr: 1.45, targetCr: 1.30, royaltyCollectedCr: 0.42 },
  { period: "02 Sep", revenueCr: 1.62, targetCr: 1.35, royaltyCollectedCr: 0.48 },
  { period: "03 Sep", revenueCr: 1.58, targetCr: 1.40, royaltyCollectedCr: 0.45 },
  { period: "04 Sep", revenueCr: 1.74, targetCr: 1.45, royaltyCollectedCr: 0.52 },
  { period: "05 Sep", revenueCr: 1.69, targetCr: 1.50, royaltyCollectedCr: 0.50 },
  { period: "06 Sep", revenueCr: 1.81, targetCr: 1.55, royaltyCollectedCr: 0.55 },
  { period: "07 Sep (Today)", revenueCr: 1.84, targetCr: 1.60, royaltyCollectedCr: 0.58 },
];

// ── Booking vs Dispatch Trend Data ─────────────────────────────────
const BOOKING_DISPATCH_TREND_DATA: BookingDispatchTrendPoint[] = [
  { timeOrDate: "06:00 AM", bookings: 180, dispatches: 95, transitActive: 45 },
  { timeOrDate: "09:00 AM", bookings: 420, dispatches: 310, transitActive: 88 },
  { timeOrDate: "12:00 PM", bookings: 780, dispatches: 610, transitActive: 134 },
  { timeOrDate: "03:00 PM", bookings: 1040, dispatches: 820, transitActive: 156 },
  { timeOrDate: "05:00 PM", bookings: 1245, dispatches: 980, transitActive: 156 },
];

// ── Recent Operational Alerts ──────────────────────────────────────
const RECENT_ALERTS: RecentAlertItem[] = [
  {
    id: "ALT-701",
    title: "Weighbridge Gross Tare Discrepancy",
    message: "Vehicle CG 04 TX 2341 recorded +2.4 MT variance over permitted payload at Raipur Depot #02.",
    timestamp: "12 mins ago",
    severity: "high",
    category: "weighbridge",
    district: "Raipur",
    referenceId: "WB-9921",
    actionRequired: "Re-weigh & Hold Transit E-Pass",
  },
  {
    id: "ALT-702",
    title: "E-Transit Permit Expiry Alert",
    message: "Permit #EPASS-8819 for Vehicle CG 07 TH 7721 is expiring in 25 mins while 14 km from delivery destination.",
    timestamp: "28 mins ago",
    severity: "medium",
    category: "e-transit",
    district: "Durg",
    referenceId: "EPASS-8819",
    actionRequired: "Driver Notification Sent",
  },
  {
    id: "ALT-703",
    title: "Telematics Route Deviation",
    message: "Sand Carrier CG 04 HB 4410 deviated 3.8 km from approved NH-53 transport corridor.",
    timestamp: "45 mins ago",
    severity: "high",
    category: "telematics",
    district: "Bilaspur",
    referenceId: "TRIP-3091",
    actionRequired: "Enforcement Team Alerted",
  },
  {
    id: "ALT-704",
    title: "Payment Gateway Reconciliation Cleared",
    message: "Bulk citizen online bookings batch #BKG-CG-0909 auto-reconciled with SBI Treasury.",
    timestamp: "1.2 hrs ago",
    severity: "low",
    category: "payment",
    district: "State HQ",
    referenceId: "TREAS-092",
  },
];

// ── Illegal Mining & Enforcement Alerts ─────────────────────────────
const ILLEGAL_MINING_ALERTS: IllegalMiningAlertItem[] = [
  {
    id: "ILG-101",
    reachName: "Arpa River Sand Sandbar #04",
    district: "Bilaspur",
    violationType: "Geofence Breach",
    detectedAt: "35 mins ago",
    severity: "critical",
    coordinates: "22.0797° N, 82.1409° E",
    investigationStatus: "Officer Assigned",
    assignedOfficer: "R. K. Verma (Mining Inspector)",
    sensorTriggerId: "GEOF-BLS-04",
  },
  {
    id: "ILG-102",
    reachName: "Hasdeo Basin Reach #12",
    district: "Korba",
    violationType: "Unregistered Heavy Machinery",
    detectedAt: "1.5 hrs ago",
    severity: "critical",
    coordinates: "22.3595° N, 82.7501° E",
    investigationStatus: "Pending Dispatch",
    assignedOfficer: "A. P. Sharma (Sub-Divisional Officer)",
    sensorTriggerId: "CAM-AI-KRB-88",
  },
  {
    id: "ILG-103",
    reachName: "Shivnath Sand Ghat Sector B",
    district: "Durg",
    violationType: "Night Excavation Violation",
    detectedAt: "03:42 AM Today",
    severity: "high",
    coordinates: "21.1904° N, 81.2849° E",
    investigationStatus: "Under Review",
    assignedOfficer: "S. K. Dewangan (Enforcement Officer)",
    sensorTriggerId: "THERMAL-DRG-02",
  },
];

export const StateAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const selectedDistrict = useAppSelector(selectDashboardDistrict);
  const selectedDateRange = useAppSelector(selectDashboardDateRange);
  const {
    reaches,
    stockyards,
    excavations,
    dispatches,
    bookings,
    vehicles,
    grievances,
    alerts,
  } = useSandMining();

  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictMapData | null>(null);
  const [selectedMapDistrict, setSelectedMapDistrict] = useState<DistrictMapData | null>(null);
  const [activeAlertTab, setActiveAlertTab] = useState<"recent" | "illegal">("recent");
  const [investigationModalItem, setInvestigationModalItem] = useState<IllegalMiningAlertItem | null>(null);

  // ── Real-Time Dynamic Stock Calculation Formula ───────────────────
  // Opening Stock + Extracted Quantity - Dispatched Quantity = Available Sand Stock
  const liveStockEquation = useMemo(() => {
    let relevantStockyards = stockyards;
    let relevantExcavations = excavations;
    let relevantDispatches = dispatches;

    if (selectedDistrict !== "ALL") {
      const distName =
        CHHATTISGARH_DISTRICT_INVENTORY.find((d) => d.id === selectedDistrict)?.districtName ||
        DISTRICT_MAP_DATA.find((d) => d.id === selectedDistrict)?.name;

      if (distName) {
        relevantStockyards = stockyards.filter((s) => s.district?.toLowerCase().includes(distName.toLowerCase()));
        relevantExcavations = excavations.filter((e) => e.district?.toLowerCase().includes(distName.toLowerCase()));
      }
    }

    const openingStockMt = relevantStockyards.reduce((acc, s) => acc + (s.openingStockMt || 0), 0) || (selectedDistrict === "ALL" ? 58000 : 14200);
    const extractedQtyMt = relevantExcavations.reduce((acc, e) => acc + (e.extractionQuantityMt || e.excavatedQuantityMt || 0), 0) || (selectedDistrict === "ALL" ? 18450 : 450);
    const dispatchedQtyMt = relevantStockyards.reduce((acc, s) => acc + (s.dispatchedMt || 0), 0) || (selectedDistrict === "ALL" ? 12400 : 320);
    const availableSandStockMt = openingStockMt + extractedQtyMt - dispatchedQtyMt;

    return {
      openingStockMt,
      extractedQtyMt,
      dispatchedQtyMt,
      availableSandStockMt,
    };
  }, [stockyards, excavations, dispatches, selectedDistrict]);

  // ── Filter Calculations Based on District Selection ───────────────
  const filteredMetrics = useMemo(() => {
    if (selectedDistrict === "ALL") {
      return {
        activeReaches: reaches.filter((r) => r.status === "Approved" || r.status === "Active Operations").length || 128,
        todayExcavationMt: liveStockEquation.extractedQtyMt,
        availableStockMt: liveStockEquation.availableSandStockMt,
        todayBookings: bookings.length || 1245,
        todayDispatches: dispatches.length || 980,
        vehiclesInTransit: 156,
        deliveredToday: 824,
        todayRevenueCr: 1.84,
      };
    }
    const dist =
      CHHATTISGARH_DISTRICT_INVENTORY.find((d) => d.id === selectedDistrict) ||
      DISTRICT_MAP_DATA.find((d) => d.id === selectedDistrict);

    if (!dist) {
      return {
        activeReaches: 128,
        todayExcavationMt: liveStockEquation.extractedQtyMt,
        availableStockMt: liveStockEquation.availableSandStockMt,
        todayBookings: 1245,
        todayDispatches: 980,
        vehiclesInTransit: 156,
        deliveredToday: 824,
        todayRevenueCr: 1.84,
      };
    }

    const activeReaches = "activeSources" in dist ? dist.activeSources : dist.activeReaches;
    const dailyDispatch = "dailyDispatchMt" in dist ? dist.dailyDispatchMt : dist.todayDispatchMt;

    return {
      activeReaches: activeReaches,
      todayExcavationMt: liveStockEquation.extractedQtyMt,
      availableStockMt: liveStockEquation.availableSandStockMt,
      todayBookings: Math.round(activeReaches * 14.2),
      todayDispatches: Math.round(dailyDispatch / 2.5),
      vehiclesInTransit: Math.round(activeReaches * 1.8),
      deliveredToday: Math.round(dailyDispatch / 3.1),
      todayRevenueCr: Number((liveStockEquation.availableSandStockMt * 0.000035 + 0.18).toFixed(2)),
    };
  }, [selectedDistrict, liveStockEquation, reaches, bookings, dispatches]);


  // ── District-wise Sand Utilization List ──
  const districtUtilizationList: DistrictUtilizationItem[] = useMemo(() => {
    return CHHATTISGARH_DISTRICT_INVENTORY.map((d) => {
      const quota = d.availableQuantityMt * 1.35;
      const dispatched = d.dailyDispatchMt * 28;
      const excavated = d.availableQuantityMt * 0.9;
      const available = d.availableQuantityMt;
      const utilRate = quota > 0 ? (dispatched / quota) * 100 : 75;
      return {
        id: d.id,
        districtName: d.districtName,
        districtCode: d.districtCode,
        riverBasin: d.riverBasin,
        totalReaches: d.totalReaches,
        activeReaches: d.activeSources,
        approvedQuotaMt: Math.round(quota),
        excavatedMt: Math.round(excavated),
        dispatchedMt: Math.round(dispatched),
        availableStockMt: Math.round(available),
        utilizationRatePct: Number(utilRate.toFixed(1)),
        complianceRatePct: d.complianceRatePct,
        status: utilRate > 85 ? "Near Quota" : utilRate < 50 ? "Low Utilization" : "Optimal",
      };
    });
  }, []);

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    dispatch(setSelectedDistrict(val));
    if (val === "ALL") {
      setSelectedMapDistrict(null);
    } else {
      const found =
        DISTRICT_MAP_DATA.find((d) => d.id === val) ||
        (CHHATTISGARH_DISTRICT_INVENTORY.find((d) => d.id === val) as any);
      if (found) setSelectedMapDistrict(found);
    }
  };

  const handleDateRangeChange = (preset: DateRangePreset) => {
    dispatch(setDateRange(preset));
  };

  const maxRevenue = Math.max(...REVENUE_TREND_DATA.map((d) => Math.max(d.revenueCr, d.targetCr)));
  const maxVolume = Math.max(...BOOKING_DISPATCH_TREND_DATA.map((d) => Math.max(d.bookings, d.dispatches)));

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* ── TOP ACTION BAR: Title, District Filter, Date Range, Export, Reconciliation ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Dashboard
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Telematics
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Directorate of Geology & Mining • Chhattisgarh State Central Control & Surveillance
            </p>
          </div>

          {/* Action Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* District Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs">
              <MapPin size={14} className="text-primary shrink-0" />
              <select
                value={selectedDistrict}
                onChange={handleDistrictChange}
                className="bg-transparent border-0 font-semibold text-slate-800 dark:text-slate-200 focus:ring-0 focus:outline-none cursor-pointer pr-2 text-xs"
              >
                <option value="ALL">All Districts (State Overview)</option>
                {CHHATTISGARH_DISTRICT_INVENTORY.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.districtName} ({d.districtCode} - {d.riverBasin})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Selector */}
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 text-xs">
              {(
                [
                  { key: "today", label: "Today" },
                  { key: "last7days", label: "7 Days" },
                  { key: "monthToDate", label: "MTD" },
                ] as { key: DateRangePreset; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleDateRangeChange(tab.key)}
                  className={`px-2.5 py-1 font-semibold rounded-lg transition-all text-xs cursor-pointer ${selectedDateRange === tab.key
                    ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-2xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── REAL-TIME STOCK CALCULATION FORMULA ENGINE ─────────────────── */}
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-[#c2410c] animate-pulse" />
            <span className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white">
              Real-Time State Sand Stock Calculation Engine
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 text-[#c2410c] dark:text-orange-400 uppercase tracking-wider">
              Live Stock Ledger
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-300">
            <span>Formula: <span className="font-bold text-slate-800 dark:text-slate-200">Opening Stock</span> + <span className="font-bold text-emerald-600 dark:text-emerald-400">Extracted</span> − <span className="font-bold text-rose-600 dark:text-rose-400">Dispatched</span> = <span className="font-bold text-[#c2410c] dark:text-orange-400">Available Stock</span></span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-center">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold mb-0.5">Opening Stock</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
              {liveStockEquation.openingStockMt.toLocaleString()} <span className="text-xs font-semibold text-slate-500">MT</span>
            </span>
          </div>

          <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 block font-semibold mb-0.5">+ Extracted Quantity</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              +{liveStockEquation.extractedQtyMt.toLocaleString()} <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">MT</span>
            </span>
          </div>

          <div className="p-3.5 bg-rose-50/60 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-800/60">
            <span className="text-[11px] text-rose-700 dark:text-rose-400 block font-semibold mb-0.5">− Dispatched Quantity</span>
            <span className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
              −{liveStockEquation.dispatchedQtyMt.toLocaleString()} <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">MT</span>
            </span>
          </div>

          <div className="p-3.5 bg-gradient-to-br from-orange-50/90 to-amber-50/90 dark:from-orange-950/40 dark:to-amber-950/40 rounded-xl border-2 border-orange-300 dark:border-orange-600/50 shadow-2xs">
            <span className="text-[11px] text-[#c2410c] dark:text-orange-400 block font-extrabold mb-0.5">= Available Sand Stock</span>
            <span className="text-xl sm:text-2xl font-black text-[#c2410c] dark:text-orange-400 font-mono">
              {liveStockEquation.availableSandStockMt.toLocaleString()} <span className="text-xs font-bold text-[#c2410c] dark:text-orange-400">MT</span>
            </span>
          </div>
        </div>
      </div>


      {/* ── MIDDLE SECTION: District-wise Sand Availability Heat Map ── */}
      <DistrictSandAvailabilityMap
        selectedDistrictId={selectedDistrict === "ALL" ? null : selectedDistrict}
        onSelectDistrict={(dist) => {
          if (dist) {
            dispatch(setSelectedDistrict(dist.id));
            setSelectedMapDistrict(dist as any);
          } else {
            dispatch(setSelectedDistrict("ALL"));
            setSelectedMapDistrict(null);
          }
        }}
      />

      {/* ── DISTRICT-WISE SAND UTILIZATION MATRIX (KPI 16) ── */}
      <div id="district-utilization-section">
        <DistrictSandUtilizationTable
          districts={districtUtilizationList}
          onDrillDownToDistrict={(distId) => {
            dispatch(setSelectedDistrict(distId));
            const found = DISTRICT_MAP_DATA.find((d) => d.id === distId);
            if (found) setSelectedMapDistrict(found);
          }}
        />
      </div>

      {/* ── FINANCIAL & SALES PERFORMANCE ANALYTICS: District Financial Bar Chart & Monthly Sales Trend Line Graph ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* District Wise Financial Chart with 3 Tabs (6 cols) */}
        <div className="lg:col-span-6">
          <DistrictFinancialBarChart
            selectedDistrictId={selectedDistrict === "ALL" ? null : selectedDistrict}
            onSelectDistrict={(distId) => {
              if (selectedDistrict === distId) {
                dispatch(setSelectedDistrict("ALL"));
              } else {
                dispatch(setSelectedDistrict(distId));
              }
            }}
          />
        </div>

        {/* Monthly Sales Trend Line Graph (6 cols) */}
        <div className="lg:col-span-6">
          <MonthlySalesTrendChart />
        </div>
      </div>

      {/* ── OPERATIONAL SECTION: Compact Exception & Alert Hub + Live Telematics Status ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Exception & Alert Hub (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4.5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/50">
                  <ShieldAlert size={16} />
                </div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Exception & Alert Hub
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                  3 Critical
                </span>
              </div>

              {/* Alert Category Tabs */}
              <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveAlertTab("recent")}
                  className={`px-2.5 py-1 font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${activeAlertTab === "recent"
                    ? "bg-white dark:bg-slate-900 text-primary shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                >
                  <Bell size={12} />
                  <span>Recent ({RECENT_ALERTS.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveAlertTab("illegal")}
                  className={`px-2.5 py-1 font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${activeAlertTab === "illegal"
                    ? "bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-400 shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                >
                  <AlertTriangle size={12} className="text-rose-500" />
                  <span>Enforcement ({ILLEGAL_MINING_ALERTS.length})</span>
                </button>
              </div>
            </div>

            {/* Tab 1: Recent Operational Alerts (Compact List) */}
            {activeAlertTab === "recent" && (
              <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar-thin pr-1">
                {RECENT_ALERTS.map((alt) => (
                  <div
                    key={alt.id}
                    className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 text-xs flex items-start justify-between gap-2 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${alt.severity === "high"
                          ? "bg-rose-500"
                          : alt.severity === "medium"
                            ? "bg-amber-500"
                            : "bg-blue-500"
                          }`}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                            {alt.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate mt-0.5">
                          {alt.message}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex flex-col items-end gap-1">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {alt.timestamp}
                      </span>
                      {alt.actionRequired && (
                        <span className="text-[9px] font-semibold text-rose-700 dark:text-rose-400 px-1.5 py-0.5 bg-rose-50 dark:bg-rose-950/60 rounded border border-rose-200/60">
                          {alt.actionRequired}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 2: Illegal Mining & Enforcement Alerts (Compact List) */}
            {activeAlertTab === "illegal" && (
              <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar-thin pr-1">
                {ILLEGAL_MINING_ALERTS.map((ilg) => (
                  <div
                    key={ilg.id}
                    className="p-2.5 rounded-xl border border-rose-200/70 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 text-xs flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-rose-900 dark:text-rose-200 truncate">
                          {ilg.violationType}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-600 text-white">
                          {ilg.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate mt-0.5">
                        {ilg.reachName} ({ilg.district}) • {ilg.sensorTriggerId}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setInvestigationModalItem(ilg)}
                      className="shrink-0 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      Investigate
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <button
              type="button"
              onClick={() => navigate(routes.enforcement.path)}
              className="text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Enforcement Center</span>
              <ArrowUpRight size={13} />
            </button>
            <span className="text-[10px] font-mono text-slate-400">Sync: Live Kafka Stream</span>
          </div>
        </div>

        {/* Live Surveillance & Operational Telematics Status (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4.5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50">
                  <Radio size={16} />
                </div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Operational Surveillance
                </h2>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
                Live Feed
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2 rounded-lg bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300">Vehicles in Transit</span>
                <span className="font-bold text-slate-900 dark:text-white">{filteredMetrics.vehiclesInTransit} Active GPS</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300">Today Delivered</span>
                <span className="font-bold text-emerald-600">{filteredMetrics.deliveredToday} Dispatches (99.8%)</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300">Active Mining Leases</span>
                <span className="font-bold text-slate-900 dark:text-white">{filteredMetrics.activeReaches} Operational Reaches</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => navigate(routes.dispatchManagement.path)}
              className="text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Dispatch Pipeline</span>
              <ArrowUpRight size={13} />
            </button>
            <span className="text-[10px] text-slate-400 font-mono">Geofence: Active</span>
          </div>
        </div>
      </div>

      {/* ── LOWER ANALYTICS: Revenue Trend & Booking / Dispatch Velocity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Revenue Trend Visual (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-purple-600 dark:text-purple-400" />
                <span>Revenue Performance Trend</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daily collection vs State Target (₹ Cr)
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-semibold">
              <span className="flex items-center gap-1.5 text-purple-700 dark:text-purple-400">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                Actual Rev
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                Target
              </span>
            </div>
          </div>

          {/* Bar / Progress Trend Grid */}
          <div className="space-y-3 pt-2">
            {REVENUE_TREND_DATA.map((item) => {
              const actualPct = (item.revenueCr / maxRevenue) * 100;
              const targetPct = (item.targetCr / maxRevenue) * 100;

              return (
                <div key={item.period} className="text-xs">
                  <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    <span>{item.period}</span>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="font-bold text-purple-700 dark:text-purple-400">
                        ₹ {item.revenueCr.toFixed(2)} Cr
                      </span>
                      <span className="text-slate-400">(Target: ₹ {item.targetCr.toFixed(2)} Cr)</span>
                    </div>
                  </div>
                  <div className="relative w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    {/* Target marker */}
                    <div
                      className="absolute top-0 bottom-0 bg-slate-300 dark:bg-slate-700 opacity-60 rounded-full"
                      style={{ width: `${targetPct}%` }}
                    />
                    {/* Actual Revenue Bar */}
                    <div
                      className="absolute top-0 bottom-0 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full transition-all duration-500 shadow-xs"
                      style={{ width: `${actualPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Booking vs Dispatch Trend Visual (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity size={18} className="text-primary" />
                <span>Booking vs Dispatch Velocity</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hourly transaction throughput & vehicle loading pipeline
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-semibold">
              <span className="flex items-center gap-1.5 text-orange-700 dark:text-orange-400">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                Bookings
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                Dispatches
              </span>
            </div>
          </div>

          {/* Comparative Volume Bars */}
          <div className="space-y-3.5 pt-2">
            {BOOKING_DISPATCH_TREND_DATA.map((d) => {
              const bookPct = (d.bookings / maxVolume) * 100;
              const dispPct = (d.dispatches / maxVolume) * 100;

              return (
                <div key={d.timeOrDate} className="text-xs">
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                    <span>{d.timeOrDate}</span>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="text-blue-600 font-bold">{d.bookings} Bookings</span>
                      <span className="text-emerald-600 font-bold">{d.dispatches} Dispatched</span>
                      <span className="text-slate-400 font-mono">({d.transitActive} In Transit)</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {/* Booking Bar */}
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${bookPct}%` }}
                      />
                    </div>
                    {/* Dispatch Bar */}
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${dispPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── BUSINESS RULE RECONCILIATION SUMMARY ─────────────────────────── */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-blue-950 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <h3 className="font-bold text-sm">
              Ledger Reconciliation Status: 100% Synchronized
            </h3>
            <p className="text-xs text-slate-300">
              Excavation (18,450 MT) = Dispatched (980 Triaxles / 16,800 MT) + Stockyard Buffer Addition (1,650 MT)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(routes.revenueReconciliation.path)}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-colors cursor-pointer"
          >
            Audit Reconciliation Ledger
          </button>
        </div>
      </div>

      {/* ── INVESTIGATION MODAL FOR ILLEGAL MINING ALERTS ───────────────── */}
      {investigationModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert size={20} className="text-rose-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Enforcement Action Dispatch
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInvestigationModalItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 space-y-1">
                <p className="font-bold text-rose-900 dark:text-rose-200">
                  Violation: {investigationModalItem.violationType}
                </p>
                <p>Reach / Location: {investigationModalItem.reachName}</p>
                <p>District: {investigationModalItem.district}</p>
                <p className="font-mono text-[11px]">GPS Coordinates: {investigationModalItem.coordinates}</p>
                <p>Sensor / Surveillance ID: {investigationModalItem.sensorTriggerId}</p>
              </div>

              <p className="text-slate-500 pt-1">
                Select quick enforcement response to immediately freeze mining permits and deploy the nearest field flying squad:
              </p>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    alert(`Dispatched Flying Squad to ${investigationModalItem.coordinates}. Reach quarantined.`);
                    setInvestigationModalItem(null);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs cursor-pointer text-left flex items-center justify-between"
                >
                  <span>1. Dispatch Flying Squad & Halt Reach E-Pass</span>
                  <ArrowUpRight size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate(routes.gisMap.path);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer text-left flex items-center justify-between"
                >
                  <span>2. View Drone / Live Satellite Geofence in GIS</span>
                  <MapPin size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StateAdminDashboard;
