import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ListOrdered,
  Truck,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  FileText,
  ShieldCheck,
  Search,
  RefreshCw,
  Sparkles,
  Phone,
  PackageCheck,
  Check,
  Info,
  ExternalLink,
  CornerDownRight,
  TrendingUp,
} from "lucide-react";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import type { Vehicle, SandBooking } from "@/features/shared-simulation/types";
import Card from "@/shared/components/layout/Card/Card";
import Button from "@/shared/components/ui/Button";
import Badge from "@/shared/components/ui/Badge";
import Modal, { ModalFooter } from "@/shared/components/ui/Modal/Modal";
import { routes } from "@/app/routes/routeConfig";

export const VehicleQueueManagement: React.FC = () => {
  const navigate = useNavigate();
  const {
    vehicles,
    bookings,
    runAutoAllocation,
    confirmDelivery,
    moveVehicleToEndOfQueue,
    reorderFifoQueue,
  } = useSandMining();

  // Filters & Search
  const [selectedDistrict, setSelectedDistrict] = useState<string>("All Districts");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("All Types");
  const [statusFilter, setStatusFilter] = useState<"all" | "in-queue" | "on-trip" | "offline">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals & Active Selections
  const [selectedOrderForView, setSelectedOrderForView] = useState<SandBooking | null>(null);
  const [selectedVehicleForPod, setSelectedVehicleForPod] = useState<Vehicle | null>(null);
  const [podOtpInput, setPodOtpInput] = useState<string>("7834");
  const [isPodModalOpen, setIsPodModalOpen] = useState<boolean>(false);
  const [successBannerMessage, setSuccessBannerMessage] = useState<string | null>(null);

  // Simulation Feedback Animation State
  const [recentlyMovedVehicleNumber, setRecentlyMovedVehicleNumber] = useState<string | null>(null);

  // Districts
  const districts = ["All Districts", "Raipur", "Durg", "Bilaspur", "Rajnandgaon", "Korba"];

  // Vehicle Types
  const vehicleTypes = [
    "All Types",
    "Tractor-Trailer (5 MT)",
    "2-Axle Tipper (10 MT)",
    "3-Axle Tipper (18 MT)",
    "4-Axle Heavy (28 MT)",
  ];

  // Helper to find active order for a vehicle
  const getActiveOrderForVehicle = (veh: Vehicle): SandBooking | undefined => {
    if (veh.currentOrderId) {
      const match = bookings.find((b) => b.orderId === veh.currentOrderId || b.id === veh.currentOrderId);
      if (match) return match;
    }
    return bookings.find(
      (b) =>
        b.assignedVehicleNumber === veh.vehicleNumber &&
        b.bookingStatus !== "Delivered" &&
        b.bookingStatus !== "Order Closed" &&
        b.bookingStatus !== "Cancelled"
    );
  };

  // Sort & Filter Vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles
      .filter((v) => {
        // District filter
        if (selectedDistrict !== "All Districts" && v.assignedDistrict && v.assignedDistrict !== selectedDistrict) {
          return false;
        }
        // Vehicle type filter
        if (selectedTypeFilter !== "All Types" && v.vehicleType !== selectedTypeFilter) {
          return false;
        }
        // Status filter
        if (statusFilter === "in-queue" && v.queueStatus !== "Available / In Queue") {
          return false;
        }
        if (statusFilter === "on-trip" && v.queueStatus !== "In Transit" && v.queueStatus !== "Assigned on Trip" && v.queueStatus !== "Loading at Stockyard") {
          return false;
        }
        if (statusFilter === "offline" && v.queueStatus !== "Offline / Rest" && v.queueStatus !== "Under Maintenance" && !v.isBlacklisted) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchVeh = v.vehicleNumber.toLowerCase().includes(q);
          const matchOwner = v.ownerName.toLowerCase().includes(q);
          const matchDriver = v.driverName.toLowerCase().includes(q);
          const matchOrder = v.currentOrderId?.toLowerCase().includes(q) || v.lastCompletedTripOrder?.toLowerCase().includes(q);
          if (!matchVeh && !matchOwner && !matchDriver && !matchOrder) return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Priority 1: Available in Queue first, strictly sorted by FIFO queue position
        const aInQueue = a.queueStatus === "Available / In Queue" ? 0 : 1;
        const bInQueue = b.queueStatus === "Available / In Queue" ? 0 : 1;
        if (aInQueue !== bInQueue) return aInQueue - bInQueue;

        if (aInQueue === 0 && bInQueue === 0) {
          const aPos = a.queuePosition ?? 999;
          const bPos = b.queuePosition ?? 999;
          if (aPos !== bPos) return aPos - bPos;
          return (a.queueJoinedAt || "").localeCompare(b.queueJoinedAt || "");
        }

        // Priority 2: On-trip vehicles
        const aOnTrip = a.queueStatus === "In Transit" || a.queueStatus === "Assigned on Trip" ? 0 : 1;
        const bOnTrip = b.queueStatus === "In Transit" || b.queueStatus === "Assigned on Trip" ? 0 : 1;
        if (aOnTrip !== bOnTrip) return aOnTrip - bOnTrip;

        return a.vehicleNumber.localeCompare(b.vehicleNumber);
      });
  }, [vehicles, selectedDistrict, selectedTypeFilter, statusFilter, searchQuery, bookings]);

  // FIFO Queue Specific Metrics
  const inQueueVehicles = useMemo(() => {
    return vehicles.filter((v) => v.queueStatus === "Available / In Queue" && !v.isBlacklisted);
  }, [vehicles]);

  const onTripVehicles = useMemo(() => {
    return vehicles.filter(
      (v) => v.queueStatus === "In Transit" || v.queueStatus === "Assigned on Trip" || v.queueStatus === "Loading at Stockyard"
    );
  }, [vehicles]);

  const topRankVehicle = useMemo(() => {
    const sorted = [...inQueueVehicles].sort((a, b) => (a.queuePosition ?? 999) - (b.queuePosition ?? 999));
    return sorted.length > 0 ? sorted[0] : null;
  }, [inQueueVehicles]);

  // Handle Complete POD & Move to End of Queue
  const handleOpenPodModal = (veh: Vehicle) => {
    setSelectedVehicleForPod(veh);
    setPodOtpInput("7834");
    setIsPodModalOpen(true);
  };

  const handleConfirmPodAndRotateQueue = () => {
    if (!selectedVehicleForPod) return;

    const activeOrder = getActiveOrderForVehicle(selectedVehicleForPod);
    const bookingId = activeOrder?.id || activeOrder?.orderId || "BKG-001";

    // Call confirmDelivery from context (which moves vehicle to end of queue!)
    confirmDelivery(bookingId, podOtpInput, true, {
      photoUrl: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80",
      geoCoordinates: "21.2514° N, 81.6296° E (Shankar Nagar Site)",
      remarks: "Delivered sand confirmed by citizen OTP. Vehicle moved to end of FIFO queue.",
    });

    const vehNum = selectedVehicleForPod.vehicleNumber;
    setRecentlyMovedVehicleNumber(vehNum);
    setSuccessBannerMessage(
      `Trip Completed! Vehicle ${vehNum} successfully verified via customer OTP and automatically moved to the END of the FIFO queue.`
    );

    setIsPodModalOpen(false);
    setSelectedVehicleForPod(null);

    // Clear highlight after 6 seconds
    setTimeout(() => {
      setRecentlyMovedVehicleNumber(null);
    }, 6000);
  };

  // Administrative Manual Move to End of Queue
  const handleAdminMoveToEnd = (veh: Vehicle) => {
    moveVehicleToEndOfQueue(veh.vehicleNumber, "Manual administrative rotation to end of FIFO queue.");
    setRecentlyMovedVehicleNumber(veh.vehicleNumber);
    setSuccessBannerMessage(`Vehicle ${veh.vehicleNumber} has been placed at the END of the queue.`);
    setTimeout(() => {
      setRecentlyMovedVehicleNumber(null);
    }, 5000);
  };

  return (
    <div className="space-y-6 pb-14">
      {/* ── Top Header Banner ── */}
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl p-5 md:p-6 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[11px] font-bold rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 shadow-2xs">
                <ListOrdered size={13} className="animate-pulse text-emerald-600" />
                Live FIFO Queue Active
              </span>
              <span className="px-2.5 py-0.5 bg-orange-50 text-[#c2410c] dark:bg-orange-950/60 dark:text-orange-300 text-[11px] font-semibold rounded-full border border-orange-200 dark:border-orange-800 flex items-center gap-1.5 shadow-2xs">
                <ShieldCheck size={13} />
                Transparent Allocation Model
              </span>
              <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 text-[11px] font-semibold rounded-full border border-amber-200 dark:border-amber-800 flex items-center gap-1.5 shadow-2xs">
                <TrendingUp size={13} />
                Trip Completed → Moves to End of Queue
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Vehicle Queue Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed">
              Real-time FIFO queue monitoring ensuring absolute transparency in sand transport allocation. Registered tippers and tractors advance strictly in turn. When a trip is completed with customer delivery OTP, the vehicle is released and automatically moves to the end of the queue.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            <Button
              variant="primary"
              onClick={() => {
                const res = runAutoAllocation();
                setSuccessBannerMessage(res.message);
              }}
              icon={<Sparkles size={15} />}
              className="px-4 py-2 font-bold shadow-2xs"
            >
              Run Auto-Allocation
            </Button>
            <Button
              variant="outline"
              onClick={() => reorderFifoQueue(selectedDistrict)}
              icon={<RefreshCw size={14} />}
              className="text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs shadow-2xs"
            >
              Sync Queue
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(routes.automaticAllocation.path)}
              icon={<ExternalLink size={14} />}
              className="text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs shadow-2xs"
            >
              Allocation Engine
            </Button>
          </div>
        </div>

        {/* ── FIFO Allocation Transparency Principle Bar ── */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-slate-50 dark:bg-slate-800/70 rounded-xl p-3 border border-slate-200 dark:border-slate-700/80 flex items-start gap-2.5">
            <div className="size-7 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              1
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Strict FIFO Order</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">Position calculated strictly by queue entry / return timestamp.</div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/70 rounded-xl p-3 border border-slate-200 dark:border-slate-700/80 flex items-start gap-2.5">
            <div className="size-7 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              2
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Rank #1 Dispatched</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">Next paid order automatically pairs with top queue vehicle.</div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/70 rounded-xl p-3 border border-slate-200 dark:border-slate-700/80 flex items-start gap-2.5">
            <div className="size-7 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              3
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Trip Completed → End of Queue</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">On successful delivery OTP, vehicle moves to end of line.</div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/70 rounded-xl p-3 border border-slate-200 dark:border-slate-700/80 flex items-start gap-2.5">
            <div className="size-7 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              4
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Tamper-Proof Audit</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">Zero discretion or manual queue jumps permitted.</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Success / Rotation Alert Banner ── */}
      {successBannerMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl p-4 flex items-center justify-between gap-4 text-emerald-900 dark:text-emerald-200 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-3 text-xs md:text-sm font-semibold">
            <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{successBannerMessage}</span>
          </div>
          <button
            onClick={() => setSuccessBannerMessage(null)}
            className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 text-xs font-bold shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <Card className="p-3.5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Fleet
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{vehicles.length}</span>
            <span className="text-[11px] text-slate-500">Registered</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">AIS-140 GPS Fitted</div>
        </Card>

        <Card className="p-3.5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs ring-1 ring-emerald-500/20">
          <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <Clock size={12} />
            In Queue (Ready)
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{inQueueVehicles.length}</span>
            <span className="text-[11px] text-emerald-700 font-semibold">FIFO Active</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Awaiting Dispatches</div>
        </Card>

        <Card className="p-3.5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs border-l-4 border-l-emerald-500">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Top Next Up (#1)
          </div>
          <div className="mt-1 font-mono font-black text-sm text-emerald-600 dark:text-emerald-400 truncate">
            {topRankVehicle ? topRankVehicle.vehicleNumber : "None in Queue"}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 truncate">
            {topRankVehicle ? `${topRankVehicle.capacityMt} MT • ${topRankVehicle.driverName}` : "No vehicle ready"}
          </div>
        </Card>

        <Card className="p-3.5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <Truck size={12} />
            Active on Trip
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{onTripVehicles.length}</span>
            <span className="text-[11px] text-amber-700 font-medium">In Transit</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Pending Delivery OTP</div>
        </Card>

        <Card className="p-3.5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Avg. Queue Dwell
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 dark:text-white">1h 15m</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-medium mt-1">Rapid Turnover</div>
        </Card>

        <Card className="p-3.5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
            Total Trips Today
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400">128</span>
            <span className="text-[11px] text-slate-500">Deliveries</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Rotated to End</div>
        </Card>
      </div>

      {/* ── Filters & Search Control Bar ── */}
      <Card className="p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                statusFilter === "all"
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs"
                  : "bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              All Fleet ({vehicles.length})
            </button>
            <button
              onClick={() => setStatusFilter("in-queue")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                statusFilter === "in-queue"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              <Clock size={13} />
              In Queue ({inQueueVehicles.length})
            </button>
            <button
              onClick={() => setStatusFilter("on-trip")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                statusFilter === "on-trip"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              <Truck size={13} />
              On Trip ({onTripVehicles.length})
            </button>
            <button
              onClick={() => setStatusFilter("offline")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                statusFilter === "offline"
                  ? "bg-slate-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              Offline / Maint ({vehicles.length - inQueueVehicles.length - onTripVehicles.length})
            </button>
          </div>

          {/* Dropdown Filters & Search */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            <div className="relative w-full sm:w-56">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search vehicle, driver, order..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              {vehicleTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* ── MAIN VEHICLE QUEUE MANAGEMENT TABLE (Exact Columns Required) ── */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Live FIFO Queue Table
            </span>
            <span className="text-[11px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full font-bold">
              {filteredVehicles.length} Vehicles Displayed
            </span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Info size={13} className="text-emerald-600" />
            <span>Top Rank vehicle is picked automatically for next paid sand consignment.</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">Vehicle</th>
                <th className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">Owner/Driver</th>
                <th className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">Status</th>
                <th className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">Queue Position</th>
                <th className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">Current Order</th>
                <th className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">Last Completed Trip</th>
                <th className="py-3.5 px-4 font-extrabold text-right text-slate-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Truck size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="font-semibold text-sm">No vehicles match the selected criteria</p>
                    <p className="text-xs text-slate-400 mt-1">Try clearing filters or search term.</p>
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((veh) => {
                  const isTopRank = veh.queueStatus === "Available / In Queue" && (veh.queuePosition === 1 || (!veh.queuePosition && inQueueVehicles[0]?.id === veh.id));
                  const isTractor = veh.vehicleType?.toLowerCase().includes("tractor");
                  const activeOrder = getActiveOrderForVehicle(veh);
                  const isRecentlyMoved = recentlyMovedVehicleNumber === veh.vehicleNumber;

                  return (
                    <tr
                      key={veh.id}
                      className={`transition-colors ${
                        isRecentlyMoved
                          ? "bg-emerald-100/70 dark:bg-emerald-950/40 ring-2 ring-emerald-500"
                          : isTopRank
                          ? "bg-emerald-50/60 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                          : "hover:bg-slate-50/80 dark:hover:bg-slate-700/40"
                      }`}
                    >
                      {/* ── 1. VEHICLE ── */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-slate-900 dark:text-white text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-600">
                              {veh.vehicleNumber}
                            </span>
                            {isTractor && (
                              <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-800">
                                Tractor
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold">
                            {veh.vehicleType} • <span className="text-emerald-700 dark:text-emerald-400">{veh.capacityMt} MT</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              AIS-140 Live
                            </span>
                            <span>•</span>
                            <span className="truncate max-w-[130px]">{veh.assignedDistrict || "Raipur"}</span>
                          </div>
                        </div>
                      </td>

                      {/* ── 2. OWNER / DRIVER ── */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex flex-col gap-0.5">
                          <div className="font-bold text-slate-900 dark:text-white text-xs">
                            {veh.driverName}
                          </div>
                          <div className="text-[11px] text-slate-600 dark:text-slate-400 truncate max-w-[160px]">
                            Owner: <span className="font-medium">{veh.ownerName}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 mt-0.5">
                            <Phone size={10} className="text-slate-400" />
                            {veh.mobile}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            RC: {veh.rcNumber}
                          </div>
                        </div>
                      </td>

                      {/* ── 3. STATUS ── */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex flex-col gap-1">
                          {veh.queueStatus === "Available / In Queue" ? (
                            <Badge variant="success" className="w-fit text-[11px] font-bold flex items-center gap-1 shadow-xs">
                              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Available in Queue
                            </Badge>
                          ) : veh.queueStatus === "In Transit" || veh.queueStatus === "Assigned on Trip" ? (
                            <Badge variant="warning" className="w-fit text-[11px] font-bold flex items-center gap-1 shadow-xs">
                              <Truck size={12} className="animate-bounce" />
                              In Transit (On Trip)
                            </Badge>
                          ) : veh.queueStatus === "Loading at Stockyard" ? (
                            <Badge variant="primary" className="w-fit text-[11px] font-bold">
                              Loading at Reach
                            </Badge>
                          ) : veh.isBlacklisted ? (
                            <Badge variant="danger" className="w-fit text-[11px] font-bold">
                              Blacklisted
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="w-fit text-[11px]">
                              {veh.queueStatus || "Offline / Rest"}
                            </Badge>
                          )}
                          <div className="text-[10px] text-slate-400">
                            {veh.queueStatus === "Available / In Queue"
                              ? "Ready for auto-allocation"
                              : veh.queueStatus === "In Transit"
                              ? "En route to delivery site"
                              : veh.driverStatus || "Operational"}
                          </div>
                        </div>
                      </td>

                      {/* ── 4. QUEUE POSITION ── */}
                      <td className="py-3.5 px-4 align-top">
                        {veh.queueStatus === "Available / In Queue" ? (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`size-7 rounded-full flex items-center justify-center font-black text-xs shadow-xs ${
                                  isTopRank
                                    ? "bg-emerald-600 text-white ring-2 ring-emerald-400 ring-offset-1"
                                    : "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                                }`}
                              >
                                #{veh.queuePosition || 1}
                              </span>
                              {isTopRank ? (
                                <span className="text-[10px] font-extrabold uppercase text-emerald-800 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                                  👑 Next in Line
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold text-slate-500">
                                  Queue Rank
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Joined: {veh.queueJoinedAt ? veh.queueJoinedAt.split(" ")[1] || veh.queueJoinedAt : "08:00 AM"}
                            </div>
                          </div>
                        ) : veh.queueStatus === "In Transit" || veh.queueStatus === "Assigned on Trip" ? (
                          <div className="text-slate-400 text-xs">
                            <span className="font-bold text-slate-600 dark:text-slate-300">—</span>
                            <div className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold mt-0.5">
                              On Active Trip
                            </div>
                            <div className="text-[9px] text-slate-400">
                              Moves to End of Queue on POD
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">— (Offline)</span>
                        )}
                      </td>

                      {/* ── 5. CURRENT ORDER ── */}
                      <td className="py-3.5 px-4 align-top">
                        {activeOrder ? (
                          <div className="flex flex-col gap-1 max-w-[210px]">
                            <button
                              onClick={() => setSelectedOrderForView(activeOrder)}
                              className="font-bold text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-left"
                            >
                              <FileText size={12} />
                              {activeOrder.orderId}
                            </button>
                            <div className="text-[11px] text-slate-700 dark:text-slate-200 font-medium truncate">
                              {activeOrder.customerName}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                              <MapPin size={10} className="shrink-0 text-emerald-600" />
                              {activeOrder.destinationAddress}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {activeOrder.quantityMt} MT
                              </span>{" "}
                              • {activeOrder.sandType}
                            </div>
                            {/* Quick POD Trigger Button */}
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => handleOpenPodModal(veh)}
                              icon={<PackageCheck size={12} className="text-emerald-600" />}
                              className="mt-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 text-[10px] font-bold py-1 w-fit"
                            >
                              Simulate POD Delivery
                            </Button>
                          </div>
                        ) : (
                          <div className="text-slate-400 text-xs">
                            <span className="text-[11px] text-slate-500 italic">None</span>
                            <div className="text-[10px] text-slate-400 mt-0.5">Waiting in Queue</div>
                          </div>
                        )}
                      </td>

                      {/* ── 6. LAST COMPLETED TRIP ── */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex flex-col gap-1 max-w-[200px]">
                          <div className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                            <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                            {veh.lastCompletedTripOrder || veh.lastCompletedTripId || "SMMS-ORD-PREV"}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Completed:{" "}
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {veh.lastTripCompletedAt || "Today 07:00"}
                            </span>
                          </div>
                          {veh.lastCompletedTripDestination && (
                            <div className="text-[10px] text-slate-500 truncate">
                              To: {veh.lastCompletedTripDestination}
                            </div>
                          )}
                          <div className="mt-0.5">
                            <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded">
                              {veh.totalTripsCompleted || 0} Trips Done
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* ── 7. ACTIONS ── */}
                      <td className="py-3.5 px-4 align-top text-right">
                        <div className="flex flex-col items-end gap-1.5">
                          {activeOrder ? (
                            <Button
                              variant="primary"
                              size="xs"
                              onClick={() => handleOpenPodModal(veh)}
                              icon={<Check size={12} />}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold"
                            >
                              Complete Trip
                            </Button>
                          ) : veh.queueStatus === "Available / In Queue" ? (
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => handleAdminMoveToEnd(veh)}
                              icon={<CornerDownRight size={11} />}
                              className="text-slate-600 hover:text-slate-900 border-slate-300 text-[10px]"
                              title="Move vehicle to end of queue"
                            >
                              Move to End
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => navigate(routes.vehicles.path)}
                              className="text-slate-500 text-[10px]"
                            >
                              Inspect Docs
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL: SIMULATE POD DELIVERY & MOVE TO END OF QUEUE ── */}
      {isPodModalOpen && selectedVehicleForPod && (
        <Modal
          isOpen={isPodModalOpen}
          onClose={() => setIsPodModalOpen(false)}
          title={`Simulate Successful Delivery & Queue Move: ${selectedVehicleForPod.vehicleNumber}`}
          size="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-xl text-amber-900 dark:text-amber-200">
              <div className="font-bold flex items-center gap-1.5 mb-1">
                <Info size={15} />
                FIFO Queue Rule Enforcement
              </div>
              <p>
                <strong>Specification:</strong> When customer delivery OTP is verified, the trip completes, the order closes, and this vehicle{" "}
                <span className="underline font-bold text-amber-950 dark:text-amber-100">
                  immediately moves to the END of the FIFO queue
                </span>{" "}
                to give waiting drivers their transparent turn.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Vehicle Number</span>
                <div className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                  {selectedVehicleForPod.vehicleNumber}
                </div>
                <div className="text-[11px] text-slate-500">{selectedVehicleForPod.vehicleType}</div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Driver Name</span>
                <div className="font-bold text-slate-900 dark:text-white text-sm">
                  {selectedVehicleForPod.driverName}
                </div>
                <div className="font-mono text-[11px] text-slate-500">{selectedVehicleForPod.mobile}</div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Current Order</span>
                <div className="font-bold text-blue-600 dark:text-blue-400">
                  {getActiveOrderForVehicle(selectedVehicleForPod)?.orderId || selectedVehicleForPod.currentOrderId || "SMMS-ORD-2026-8801"}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Delivery Destination</span>
                <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {getActiveOrderForVehicle(selectedVehicleForPod)?.destinationAddress || "Shankar Nagar, Raipur"}
                </div>
              </div>
            </div>

            {/* OTP Entry */}
            <div className="space-y-2">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Customer Delivery OTP Verification (Simulated Code: 7834)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={podOtpInput}
                  onChange={(e) => setPodOtpInput(e.target.value)}
                  placeholder="Enter 4-digit OTP"
                  className="px-3 py-2 font-mono font-bold text-base tracking-widest bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden w-40 text-center"
                />
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={14} /> Valid OTP Ready
                </span>
              </div>
            </div>

            {/* Geotag & Photo Metadata */}
            <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-between text-[11px]">
              <div>
                <div className="font-bold text-slate-800 dark:text-slate-200">GPS Coordinates Captured:</div>
                <div className="font-mono text-slate-500">21.2514° N, 81.6296° E (Timestamp: {new Date().toLocaleTimeString()})</div>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold rounded">
                Tamper-Proof Geofence OK
              </span>
            </div>

            <ModalFooter>
              <Button variant="ghost" onClick={() => setIsPodModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmPodAndRotateQueue}
                icon={<TrendingUp size={16} />}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              >
                Confirm Delivery & Move Vehicle to End of Queue
              </Button>
            </ModalFooter>
          </div>
        </Modal>
      )}

      {/* ── MODAL: VIEW ORDER DETAILS ── */}
      {selectedOrderForView && (
        <Modal
          isOpen={!!selectedOrderForView}
          onClose={() => setSelectedOrderForView(null)}
          title={`Order Manifest: ${selectedOrderForView.orderId}`}
          size="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Customer</span>
                <div className="font-bold text-slate-900 dark:text-white">{selectedOrderForView.customerName}</div>
                <div className="font-mono text-slate-500">{selectedOrderForView.customerMobile}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Sand Consignment</span>
                <div className="font-bold text-emerald-600">{selectedOrderForView.quantityMt} MT</div>
                <div className="text-slate-500">{selectedOrderForView.sandType}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Source Stockyard</span>
                <div className="font-semibold text-slate-800 dark:text-slate-200">{selectedOrderForView.sourceStockyardName}</div>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Delivery Destination</span>
                <div className="font-medium text-slate-800 dark:text-slate-200">{selectedOrderForView.destinationAddress}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Order Status</span>
                <div>
                  <Badge variant="primary">{selectedOrderForView.bookingStatus}</Badge>
                </div>
              </div>
            </div>

            <ModalFooter>
              <Button variant="ghost" onClick={() => setSelectedOrderForView(null)}>
                Close
              </Button>
            </ModalFooter>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default VehicleQueueManagement;
