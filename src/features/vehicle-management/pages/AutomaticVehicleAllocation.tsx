import React, { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Truck,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  FileText,
  MessageSquare,
  ShieldCheck,
  Send,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  X,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  Radio,
  Share2,
  Printer,
  Smartphone,
  ExternalLink,
  Layers,
  ListOrdered,
  CreditCard,
  Receipt,
  DollarSign,
  Gauge,
} from "lucide-react";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import type { Vehicle, SandBooking, AllocationRecord, DriverNotification, EligibilityChecklist } from "@/features/shared-simulation/types";
import Card from "@/shared/components/layout/Card/Card";
import Button from "@/shared/components/ui/Button";
import Badge from "@/shared/components/ui/Badge";
import Modal, { ModalFooter } from "@/shared/components/ui/Modal/Modal";
import Tabs from "@/shared/components/ui/Tabs";
import { routes } from "@/app/routes/routeConfig";
import { TsmivVehiclePaymentSection } from "../components/TsmivVehiclePaymentSection";

export const AutomaticVehicleAllocation: React.FC = () => {
  const navigate = useNavigate();
  const {
    vehicles,
    drivers,
    bookings,
    allocations,
    driverNotifications,
    evaluateVehicleEligibility,
    getEligibleVehiclesForBooking,
    getFifoQueue,
    runAutoAllocation,
    acknowledgeDriverNotification,
  } = useSandMining();

  // Active Tab
  const [activeTab, setActiveTab] = useState<"queue" | "pending-orders" | "allocations" | "sms-feed" | "payments">("queue");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("All Districts");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("All Types");

  // Modals
  const [isEngineModalOpen, setIsEngineModalOpen] = useState<boolean>(false);
  const [isEligibilityModalOpen, setIsEligibilityModalOpen] = useState<boolean>(false);
  const [selectedBookingForEval, setSelectedBookingForEval] = useState<SandBooking | null>(null);
  const [isSlipModalOpen, setIsSlipModalOpen] = useState<boolean>(false);
  const [selectedAllocation, setSelectedAllocation] = useState<AllocationRecord | null>(null);

  // Engine Execution Animation State
  const [engineStep, setEngineStep] = useState<number>(0);
  const [engineResults, setEngineResults] = useState<{ allocatedCount: number; allocations: AllocationRecord[]; message: string } | null>(null);

  // Auto-scroll ref for TSMIV Payment Section
  const paymentSectionRef = useRef<HTMLDivElement | null>(null);

  const handleGoToPayments = () => {
    setActiveTab("payments");
    setTimeout(() => {
      paymentSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  // Districts
  const districts = ["All Districts", "Raipur", "Durg", "Bilaspur", "Rajnandgaon"];

  // Vehicle Type Categories
  const vehicleTypes = [
    "All Types",
    "Tractor-Trailer (5 MT)",
    "2-Axle Tipper (10 MT)",
    "3-Axle Tipper (18 MT)",
    "4-Axle Heavy (28 MT)",
  ];

  // Filtered FIFO Queue
  const fifoQueue = useMemo(() => {
    let list = getFifoQueue(selectedDistrict);
    if (selectedTypeFilter !== "All Types") {
      list = list.filter((v) => v.vehicleType === selectedTypeFilter);
    }
    return list;
  }, [getFifoQueue, selectedDistrict, selectedTypeFilter, vehicles]);

  // Unallocated confirmed orders requiring vehicle allocation
  const pendingOrders = useMemo(() => {
    return bookings.filter(
      (b) =>
        !b.assignedVehicleNumber &&
        (b.bookingStatus === "Booking Confirmed" ||
          b.bookingStatus === "Paid" ||
          b.bookingStatus === "Booked" ||
          b.bookingStatus === "Order Confirmed" ||
          b.bookingStatus === "Vehicle Allocation Pending" ||
          b.bookingStatus === "Vehicle Reallocation Pending") &&
        !b.transportOption?.toLowerCase().includes("own vehicle") &&
        !b.transportOption?.toLowerCase().includes("self-pickup")
    );
  }, [bookings]);

  // Main Tabs Configuration
  const mainTabsConfig = useMemo(
    () => [
      {
        key: "queue",
        label: `Live FIFO Queue (${fifoQueue.length})`,
        icon: Clock,
      },
      {
        key: "pending-orders",
        label: `Orders Awaiting Allocation (${pendingOrders.length})`,
        icon: AlertCircle,
      },
      {
        key: "allocations",
        label: `Allocation Audit Log (${allocations.length})`,
        icon: FileText,
      },
      {
        key: "sms-feed",
        label: `Driver SMS Dispatch (${driverNotifications.length})`,
        icon: MessageSquare,
      },
      {
        key: "payments",
        label: "TSMIV Vehicle Payments",
        icon: CreditCard,
      },
    ],
    [fifoQueue.length, pendingOrders.length, allocations.length, driverNotifications.length]
  );

  // KPIs
  const totalVehiclesCount = vehicles.length;
  const verifiedVehiclesCount = vehicles.filter((v) => v.status === "Verified" && !v.isBlacklisted).length;
  const availableQueueCount = vehicles.filter((v) => v.queueStatus === "Available / In Queue" && !v.isBlacklisted).length;
  const assignedOnTripCount = vehicles.filter((v) => v.queueStatus === "In Transit" || v.queueStatus === "Assigned on Trip").length;
  const totalTractorsCount = vehicles.filter((v) => v.vehicleType?.toLowerCase().includes("tractor")).length;

  // Handle Run Engine Execution
  const handleStartAutoAllocation = (targetBookingId?: string) => {
    setIsEngineModalOpen(true);
    setEngineStep(1);
    setEngineResults(null);

    // Simulated multi-stage visual pipeline
    setTimeout(() => {
      setEngineStep(2); // Filtering Eligible Pool
    }, 700);

    setTimeout(() => {
      setEngineStep(3); // Matching FIFO Queue
    }, 1400);

    setTimeout(() => {
      const result = runAutoAllocation(targetBookingId);
      setEngineResults(result);
      setEngineStep(4); // Completed & SMS Dispatched
    }, 2100);
  };

  const handleInspectEligibility = (bkg: SandBooking) => {
    setSelectedBookingForEval(bkg);
    setIsEligibilityModalOpen(true);
  };

  const handleViewSlip = (alloc: AllocationRecord) => {
    setSelectedAllocation(alloc);
    setIsSlipModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner with TSMIV Reference */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 text-slate-900 dark:text-white shadow-2xs border border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-semibold rounded-full border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1.5 shadow-2xs">
                <Cpu size={14} className="text-emerald-600 dark:text-emerald-400" />
                Automatic Queue Engine Active
              </span>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 text-xs font-semibold rounded-full border border-blue-200 dark:border-blue-800/60 flex items-center gap-1.5 shadow-2xs">
                <ShieldCheck size={14} className="text-blue-600 dark:text-blue-400" />
                Telangana TSMIV Model (CSI-SIGeGov)
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Automated Vehicle Allocation & FIFO Queue
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm leading-relaxed">
              Transparent, non-discretionary vehicle and tractor assignment for sand dispatch. Eligible registered vehicles are placed into a verified FIFO queue by district and auto-allocated to paid bookings with real-time SMS driver dispatch.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Button
              variant="primary"
              onClick={() => handleStartAutoAllocation()}
              icon={<Cpu size={18} className="animate-spin" />}
              className="font-semibold px-6 py-2.5 shadow-xs"
            >
              Run Auto-Allocation Engine
            </Button>
            <Button
              variant="outline"
              onClick={handleGoToPayments}
              icon={<CreditCard size={16} className="text-emerald-600" />}
              className="text-xs font-bold border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300"
            >
              TSMIV Payments (₹)
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(routes.vehicleQueue.path)}
              icon={<ListOrdered size={16} />}
              className="text-xs"
            >
              Vehicle Queue
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(routes.vehicles.path)}
              icon={<Truck size={16} />}
              className="text-xs"
            >
              Fleet Master
            </Button>
          </div>
        </div>

        {/* 5-Step Allocation & Settlement Pipeline Graphic */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-3">
            <div className="size-9 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-200 dark:border-blue-800">
              1
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Step 1</div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white">Eligible Vehicle Pool</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">9-Point Criteria Verification</div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-3">
            <div className="size-9 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-200 dark:border-emerald-800">
              2
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Step 2</div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white">FIFO Queue Order</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">First-In-First-Out Turn</div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-3">
            <div className="size-9 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 flex items-center justify-center font-bold text-sm shrink-0 border border-amber-200 dark:border-amber-800">
              3
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Step 3</div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white">Automated Allocation</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Capacity & District Matched</div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-3">
            <div className="size-9 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 flex items-center justify-center font-bold text-sm shrink-0 border border-purple-200 dark:border-purple-800">
              4
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Step 4</div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white">Driver Notification</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Real-time SMS & GPS Trip Init</div>
            </div>
          </div>

          <div className="bg-emerald-50/80 dark:bg-emerald-950/40 rounded-xl p-3.5 border border-emerald-300 dark:border-emerald-800 flex items-center gap-3">
            <div className="size-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
              5
            </div>
            <div>
              <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Step 5</div>
              <div className="text-xs font-bold text-emerald-950 dark:text-emerald-100">TSMIV Payment</div>
              <div className="text-[10px] text-emerald-700 dark:text-emerald-400">Per-KM Tariff & DBT Payout</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <Card className="p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Registered Fleet</span>
            <Truck size={16} className="text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{totalVehiclesCount}</span>
            <span className="text-[11px] text-emerald-600 font-semibold">{verifiedVehiclesCount} Verified</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Includes {totalTractorsCount} Tractors</div>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Available in Queue</span>
            <Clock size={16} className="text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{availableQueueCount}</span>
            <span className="text-[11px] text-slate-500">FIFO Ready</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Next up for auto-assignment</div>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Assigned / In Transit</span>
            <Radio size={16} className="text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{assignedOnTripCount}</span>
            <span className="text-[11px] text-slate-500">On Delivery</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Cycles to queue upon POD</div>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Awaiting Allocation</span>
            <AlertCircle size={16} className="text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{pendingOrders.length}</span>
            <span className="text-[11px] text-slate-500">Confirmed Orders</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Pending vehicle matching</div>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Allocations Made</span>
            <CheckCircle2 size={16} className="text-purple-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400">{allocations.length}</span>
            <span className="text-[11px] text-slate-500">Audit Logs</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{driverNotifications.length} SMS Dispatched</div>
        </Card>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="overflow-x-auto pb-1 lg:pb-0">
          <Tabs
            tabs={mainTabsConfig}
            activeTab={activeTab}
            onChange={(key) => setActiveTab(key as any)}
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5 self-start lg:self-auto shrink-0">
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Filter size={13} />
            <span>Filter Queue:</span>
          </div>

          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-2xs"
          >
            {districts.map((d) => (
              <option key={d} value={d}>
                {d === "All Districts" ? "All Districts" : `District: ${d}`}
              </option>
            ))}
          </select>

          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-2xs"
          >
            {vehicleTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── TAB 1: LIVE FIFO QUEUE ── */}
      {activeTab === "queue" && (
        <div className="space-y-4">
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-emerald-900 dark:text-emerald-200">
              <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold">FIFO Queue Ranking Principle:</span> Vehicles are strictly ordered by check-in time and last trip completion timestamp. When an order is processed, the vehicle at <strong className="text-emerald-700 dark:text-emerald-300">Rank #1</strong> matching the required capacity and district is automatically allocated.
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStartAutoAllocation()}
              icon={<Sparkles size={14} className="text-emerald-600" />}
              className="shrink-0 bg-white dark:bg-slate-800 border-emerald-300 text-emerald-700 hover:bg-emerald-100 text-xs font-bold"
            >
              Allocate Available
            </Button>
          </div>

          <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Queue Rank</th>
                  <th className="py-3 px-4">Vehicle Details</th>
                  <th className="py-3 px-4">Capacity & Type</th>
                  <th className="py-3 px-4">Driver & Mobile</th>
                  <th className="py-3 px-4">District & Operational Area</th>
                  <th className="py-3 px-4">Trip History</th>
                  <th className="py-3 px-4">Queue Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                {fifoQueue.map((veh, index) => {
                  const isTopRank = veh.queueStatus === "Available / In Queue" && index === 0;
                  const isTractor = veh.vehicleType?.toLowerCase().includes("tractor");

                  return (
                    <tr
                      key={veh.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors ${
                        isTopRank ? "bg-emerald-50/50 dark:bg-emerald-950/20" : ""
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`size-7 rounded-full flex items-center justify-center font-black text-xs shadow-xs ${
                              isTopRank
                                ? "bg-emerald-600 text-white ring-2 ring-emerald-400"
                                : veh.queueStatus === "Available / In Queue"
                                ? "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                            }`}
                          >
                            #{veh.queuePosition || index + 1}
                          </span>
                          {isTopRank && (
                            <span className="text-[10px] font-bold uppercase text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded">
                              Next
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {veh.vehicleNumber}
                          {isTractor && (
                            <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-800">
                              Tractor
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-normal truncate max-w-[160px]">
                          {veh.ownerName}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {veh.capacityMt} MT Payload
                        </div>
                        <div className="text-[11px] text-slate-500">{veh.vehicleType}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{veh.driverName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{veh.mobile}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <MapPin size={12} className="text-emerald-600" />
                          {veh.assignedDistrict || "Raipur"}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[170px]">
                          {veh.assignedArea || "Mandir Hasaud"}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-800 dark:text-slate-200 font-semibold">
                          {veh.totalTripsCompleted || 0} Trips
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Last: {veh.lastTripCompletedAt || "Today 07:00"}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {veh.queueStatus === "Available / In Queue" ? (
                          <Badge variant="success">Available in Queue</Badge>
                        ) : veh.queueStatus === "In Transit" || veh.queueStatus === "Assigned on Trip" ? (
                          <Badge variant="warning">On Delivery Trip</Badge>
                        ) : veh.queueStatus === "Loading at Stockyard" ? (
                          <Badge variant="primary">Loading Sand</Badge>
                        ) : (
                          <Badge variant="secondary">{veh.queueStatus || "Offline"}</Badge>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => {
                            if (pendingOrders.length > 0) {
                              handleInspectEligibility(pendingOrders[0]);
                            } else {
                              handleInspectEligibility(bookings[0]);
                            }
                          }}
                          className="text-emerald-600 hover:text-emerald-700 text-xs font-semibold"
                        >
                          Check Matrix
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: ORDERS AWAITING ALLOCATION ── */}
      {activeTab === "pending-orders" && (
        <div className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200">
              <AlertCircle size={18} className="text-amber-600 shrink-0" />
              <div>
                <span className="font-bold">Pending Department-Arranged Orders:</span> The orders below have paid and confirmed status and are ready for automated FIFO matching to registered vehicles & tractors.
              </div>
            </div>
            {pendingOrders.length > 0 && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleStartAutoAllocation()}
                icon={<Cpu size={14} />}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0"
              >
                Auto-Allocate All ({pendingOrders.length})
              </Button>
            )}
          </div>

          {pendingOrders.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="size-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">All Orders Currently Allocated</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                There are no unassigned confirmed orders waiting in the queue. New citizen bookings will automatically populate here upon payment.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(routes.sandBooking.path)}
                className="text-xs font-semibold"
              >
                View Sand Booking Registry
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Order ID & Date</th>
                    <th className="py-3 px-4">Customer Details</th>
                    <th className="py-3 px-4">Quantity & Sand Type</th>
                    <th className="py-3 px-4">Delivery District & Address</th>
                    <th className="py-3 px-4">Source Stockyard</th>
                    <th className="py-3 px-4">Transport Mode</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                  {pendingOrders.map((bkg) => (
                    <tr key={bkg.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{bkg.orderId}</div>
                        <div className="text-[11px] text-slate-500">{bkg.createdAt}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{bkg.customerName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{bkg.customerMobile}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-emerald-600 dark:text-emerald-400">
                          {bkg.quantityMt} MT ({bkg.unit || "MT"})
                        </div>
                        <div className="text-[11px] text-slate-500">{bkg.sandType}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                          <MapPin size={12} className="text-rose-500" />
                          {bkg.destinationDistrict || bkg.deliveryDistrict || "Raipur"}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                          {bkg.destinationAddress}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{bkg.sourceStockyardName}</div>
                      </td>

                      <td className="py-3 px-4">
                        <Badge variant="info">Dept. Logistics (Auto FIFO)</Badge>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleInspectEligibility(bkg)}
                            icon={<SlidersHorizontal size={13} />}
                            className="text-xs"
                          >
                            9-Point Check
                          </Button>
                          <Button
                            variant="primary"
                            size="xs"
                            onClick={() => handleStartAutoAllocation(bkg.id)}
                            icon={<Cpu size={13} />}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                          >
                            Auto-Allocate
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: ALLOCATION AUDIT LOG & HISTORY ── */}
      {activeTab === "allocations" && (
        <div className="space-y-4">
          <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Allocation ID</th>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Allocated Vehicle & Driver</th>
                  <th className="py-3 px-4">FIFO Rank at Match</th>
                  <th className="py-3 px-4">Quantity & Sand Type</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Eligibility Audit</th>
                  <th className="py-3 px-4">SMS Status</th>
                  <th className="py-3 px-4 text-right">Slip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                {allocations.map((alloc) => (
                  <tr key={alloc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white font-mono">{alloc.allocationId}</div>
                      <div className="text-[10px] text-slate-400">{alloc.allocationTime}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-emerald-600 dark:text-emerald-400">{alloc.orderId}</div>
                      <div className="text-[11px] text-slate-500">{alloc.customerName}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Truck size={13} className="text-blue-500" />
                        {alloc.vehicleNumber}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {alloc.driverName} ({alloc.driverMobile})
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold rounded-md text-[11px] border border-emerald-300">
                        FIFO Rank #{alloc.fifoQueueRank || 1}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{alloc.quantityMt} MT</div>
                      <div className="text-[11px] text-slate-500">{alloc.sandType}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{alloc.deliveryDistrict}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[160px]">
                        {alloc.destinationAddress}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-300">
                        <CheckCircle2 size={12} /> 9/9 Checks Passed
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-300 text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-300">
                        <Send size={11} /> Sent (SMS)
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleViewSlip(alloc)}
                        icon={<Eye size={13} />}
                        className="text-xs font-semibold"
                      >
                        View Slip
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 4: DRIVER NOTIFICATION DISPATCH BOARD ── */}
      {activeTab === "sms-feed" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <MessageSquare size={16} className="text-emerald-600" />
              Automated SMS Dispatch Log (Real-time GSM Simulator)
            </h3>
            <p className="text-xs text-slate-500">
              When an order is auto-allocated, an instant SMS alert is dispatched to the registered driver containing loading stockyard coordinates, order tonnage, and delivery destination.
            </p>

            <div className="space-y-3 pt-2">
              {driverNotifications.map((notif) => (
                <Card key={notif.id} className="p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center shrink-0">
                        <Smartphone size={16} />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                          <span>Driver: {notif.driverName}</span>
                          <span className="font-mono text-slate-500 text-[11px]">({notif.driverMobile})</span>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 text-[10px] font-bold rounded">
                            {notif.vehicleNumber}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">{notif.dispatchedAt} • GSM Gateway Delivered</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          notif.status === "Acknowledged"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-blue-100 text-blue-800 border border-blue-300"
                        }`}
                      >
                        {notif.status}
                      </span>
                      {notif.status !== "Acknowledged" && (
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => acknowledgeDriverNotification(notif.id)}
                          className="text-[10px] py-0.5 px-2"
                        >
                          Simulate Ack
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* SMS Payload Bubble */}
                  <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900/70 rounded-lg border border-slate-200/80 dark:border-slate-700/80 text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed">
                    {notif.message}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Smartphone Simulator Mockup */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 border-4 border-slate-700 shadow-2xl space-y-4 max-w-sm mx-auto self-start">
            <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1 font-bold">
                <Radio size={12} className="text-emerald-400 animate-pulse" />
                <span>CG-SMMS-GOV SMS</span>
              </div>
              <div>Live 5G</div>
            </div>

            <div className="text-center py-2">
              <div className="size-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-1 border border-emerald-500/30">
                <Truck size={20} />
              </div>
              <div className="text-xs font-bold">SMMS Dispatch Notification</div>
              <div className="text-[10px] text-slate-400">Telangana TSMIV Automated Protocol</div>
            </div>

            <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 text-xs space-y-2 leading-relaxed">
              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">SMS Payload Sample</div>
              <p className="text-slate-200 text-xs">
                &quot;SMMS ORDER ALLOCATED: Vehicle CG-04-TX-2341 assigned to Order SMMS-ORD-2026-8801. Report to Raipur Central Sand Stockyard for 10 MT Coarse Sand loading. Delivery: Shankar Nagar, Raipur. Customer: Narayana Sahu (+91 98260 12345).&quot;
              </p>
            </div>

            <div className="pt-2 text-center text-[10px] text-slate-500">
              Department of Mineral Resources, Chhattisgarh
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: TSMIV VEHICLE TRANSPORT PAYMENTS (PER-KM) ── */}
      {activeTab === "payments" && (
        <div ref={paymentSectionRef} id="tsmiv-payment-section" className="scroll-mt-6">
          <TsmivVehiclePaymentSection
            vehicles={vehicles}
            allocations={allocations}
            selectedDistrict={selectedDistrict}
          />
        </div>
      )}

      {/* ── MODAL 1: INTERACTIVE 9-POINT ELIGIBILITY MATRIX ── */}
      <Modal
        isOpen={isEligibilityModalOpen}
        onClose={() => setIsEligibilityModalOpen(false)}
        title={`9-Point Vehicle Eligibility Audit • Order ${selectedBookingForEval?.orderId || ""}`}
        size="xl"
      >
        <div className="space-y-4 text-xs">
          {selectedBookingForEval && (
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Customer</span>
                <div className="font-bold text-slate-900 dark:text-white">{selectedBookingForEval.customerName}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Required Qty</span>
                <div className="font-bold text-emerald-600">{selectedBookingForEval.quantityMt} MT</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Destination District</span>
                <div className="font-bold text-slate-900 dark:text-white">
                  {selectedBookingForEval.destinationDistrict || "Raipur"}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Pickup Stockyard</span>
                <div className="font-bold text-slate-900 dark:text-white">
                  {selectedBookingForEval.sourceStockyardName}
                </div>
              </div>
            </div>
          )}

          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Evaluation of Registered Fleet Candidates (FIFO Order):
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {selectedBookingForEval &&
              getEligibleVehiclesForBooking(selectedBookingForEval).map(({ vehicle, checklist, isEligible, reason }, idx) => (
                <div
                  key={vehicle.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isEligible
                      ? "bg-white dark:bg-slate-800 border-emerald-300 dark:border-emerald-700 shadow-xs"
                      : "bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-75"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="size-6 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-black text-xs flex items-center justify-center">
                        #{vehicle.queuePosition || idx + 1}
                      </span>
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {vehicle.vehicleNumber}
                      </span>
                      <span className="text-xs text-slate-500">({vehicle.vehicleType})</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Cap: {vehicle.capacityMt} MT
                      </span>
                    </div>

                    <div>
                      {isEligible ? (
                        <Badge variant="success">Eligible • Rank #{vehicle.queuePosition || idx + 1}</Badge>
                      ) : (
                        <Badge variant="danger">Ineligible</Badge>
                      )}
                    </div>
                  </div>

                  {/* 9 Criteria Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2.5 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      {checklist.isRegistered ? (
                        <Check size={13} className="text-emerald-600 font-bold" />
                      ) : (
                        <X size={13} className="text-rose-600 font-bold" />
                      )}
                      <span>1. Registered Vehicle</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {checklist.isActiveStatus ? (
                        <Check size={13} className="text-emerald-600 font-bold" />
                      ) : (
                        <X size={13} className="text-rose-600 font-bold" />
                      )}
                      <span>2. Active Verified Status</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {checklist.hasApprovedCapacity ? (
                        <Check size={13} className="text-emerald-600 font-bold" />
                      ) : (
                        <X size={13} className="text-rose-600 font-bold" />
                      )}
                      <span>3. Approved Capacity</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {checklist.isDriverActive ? (
                        <Check size={13} className="text-emerald-600 font-bold" />
                      ) : (
                        <X size={13} className="text-rose-600 font-bold" />
                      )}
                      <span>4. Driver/Owner Active</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {checklist.isAssignedDistrictMatch ? (
                        <Check size={13} className="text-emerald-600 font-bold" />
                      ) : (
                        <X size={13} className="text-rose-600 font-bold" />
                      )}
                      <span>5. District/Area Match</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {checklist.isVehicleAvailable ? (
                        <Check size={13} className="text-emerald-600 font-bold" />
                      ) : (
                        <X size={13} className="text-rose-600 font-bold" />
                      )}
                      <span>6. Vehicle Available</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {checklist.isPreviousTripCompleted ? (
                        <Check size={13} className="text-emerald-600 font-bold" />
                      ) : (
                        <X size={13} className="text-rose-600 font-bold" />
                      )}
                      <span>7. Previous Trip Closed</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {checklist.hasNoActiveDelivery ? (
                        <Check size={13} className="text-emerald-600 font-bold" />
                      ) : (
                        <X size={13} className="text-rose-600 font-bold" />
                      )}
                      <span>8. No Active Delivery</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {checklist.isCapacityOptimal ? (
                        <Check size={13} className="text-emerald-600 font-bold" />
                      ) : (
                        <X size={13} className="text-rose-600 font-bold" />
                      )}
                      <span>9. Optimal Payload Match</span>
                    </div>
                  </div>

                  {!isEligible && (
                    <div className="mt-2 text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                      Reason: {reason}
                    </div>
                  )}
                </div>
              ))}
          </div>

          <ModalFooter>
            <Button variant="outline" onClick={() => setIsEligibilityModalOpen(false)}>
              Close Audit
            </Button>
            {selectedBookingForEval && (
              <Button
                variant="primary"
                onClick={() => {
                  setIsEligibilityModalOpen(false);
                  handleStartAutoAllocation(selectedBookingForEval.id);
                }}
                icon={<Cpu size={14} />}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Auto-Allocate Now
              </Button>
            )}
          </ModalFooter>
        </div>
      </Modal>

      {/* ── MODAL 2: LIVE ENGINE SIMULATION STEP-BY-STEP ── */}
      <Modal
        isOpen={isEngineModalOpen}
        onClose={() => setIsEngineModalOpen(false)}
        title="Automated Allocation Queue Engine Processing"
        size="lg"
      >
        <div className="space-y-6 text-xs py-2">
          {/* Progress Animation */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>TSMIV Algorithm Execution</span>
              <span>{engineStep === 4 ? "100% Complete" : `${engineStep * 25}%`}</span>
            </div>
            <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(engineStep * 25, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Stepper Display */}
          <div className="space-y-3">
            <div
              className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                engineStep >= 1
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                  : "bg-slate-50 dark:bg-slate-900 border-slate-200 text-slate-400"
              }`}
            >
              {engineStep > 1 ? (
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              ) : engineStep === 1 ? (
                <RefreshCw size={18} className="text-emerald-600 animate-spin shrink-0" />
              ) : (
                <div className="size-4.5 rounded-full border border-slate-300 shrink-0"></div>
              )}
              <div>
                <div className="font-bold text-xs">Stage 1: Scanning Unallocated Confirmed Bookings</div>
                <div className="text-[10px] text-slate-500">Checking citizen & government sand orders needing transport</div>
              </div>
            </div>

            <div
              className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                engineStep >= 2
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                  : "bg-slate-50 dark:bg-slate-900 border-slate-200 text-slate-400"
              }`}
            >
              {engineStep > 2 ? (
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              ) : engineStep === 2 ? (
                <RefreshCw size={18} className="text-emerald-600 animate-spin shrink-0" />
              ) : (
                <div className="size-4.5 rounded-full border border-slate-300 shrink-0"></div>
              )}
              <div>
                <div className="font-bold text-xs">Stage 2: Evaluating 9 Vehicle Eligibility Rules</div>
                <div className="text-[10px] text-slate-500">Verifying RC, Active Status, Payload, DL, District & Availability</div>
              </div>
            </div>

            <div
              className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                engineStep >= 3
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                  : "bg-slate-50 dark:bg-slate-900 border-slate-200 text-slate-400"
              }`}
            >
              {engineStep > 3 ? (
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              ) : engineStep === 3 ? (
                <RefreshCw size={18} className="text-emerald-600 animate-spin shrink-0" />
              ) : (
                <div className="size-4.5 rounded-full border border-slate-300 shrink-0"></div>
              )}
              <div>
                <div className="font-bold text-xs">Stage 3: FIFO Queue Priority Resolution</div>
                <div className="text-[10px] text-slate-500">Assigning vehicle with earliest check-in & longest idle completion time</div>
              </div>
            </div>

            <div
              className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                engineStep >= 4
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                  : "bg-slate-50 dark:bg-slate-900 border-slate-200 text-slate-400"
              }`}
            >
              {engineStep === 4 ? (
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              ) : (
                <div className="size-4.5 rounded-full border border-slate-300 shrink-0"></div>
              )}
              <div>
                <div className="font-bold text-xs">Stage 4: e-Allocation Created & Driver SMS Dispatched</div>
                <div className="text-[10px] text-slate-500">Order moved to Vehicle Assigned status and SMS sent to driver phone</div>
              </div>
            </div>
          </div>

          {/* Result Output */}
          {engineStep === 4 && engineResults && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl border border-emerald-300 dark:border-emerald-700 space-y-2 text-xs">
              <div className="font-bold text-emerald-900 dark:text-emerald-200 text-sm flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600" />
                {engineResults.message}
              </div>
              {engineResults.allocations.length > 0 && (
                <div className="pt-2 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                  {engineResults.allocations.map((a) => (
                    <div key={a.id} className="flex items-center justify-between bg-white dark:bg-slate-800 p-2 rounded border border-emerald-200 dark:border-emerald-800">
                      <span>
                        Order <strong>{a.orderId}</strong> allocated to <strong>{a.vehicleNumber}</strong> ({a.driverName})
                      </span>
                      <span className="font-bold text-emerald-600">FIFO Rank #{a.fifoQueueRank}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <ModalFooter>
            <Button variant="primary" onClick={() => setIsEngineModalOpen(false)}>
              Close & View Queue
            </Button>
          </ModalFooter>
        </div>
      </Modal>

      {/* ── MODAL 3: OFFICIAL ALLOCATION SLIP ── */}
      <Modal
        isOpen={isSlipModalOpen}
        onClose={() => setIsSlipModalOpen(false)}
        title="Official State Sand Allocation Slip"
        size="lg"
      >
        {selectedAllocation && (
          <div className="space-y-4 text-xs font-sans">
            {/* Header */}
            <div className="text-center pb-3 border-b border-slate-200 dark:border-slate-700 space-y-1">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Government of Chhattisgarh</div>
              <div className="text-base font-extrabold text-slate-900 dark:text-white">Directorate of Geology & Mining</div>
              <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                Automated Sand Transport Allocation Order (TSMIV Module)
              </div>
            </div>

            {/* Meta Grid */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Allocation Number</span>
                <div className="font-bold text-slate-900 dark:text-white font-mono">{selectedAllocation.allocationId}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Booking Order ID</span>
                <div className="font-bold text-emerald-600 font-mono">{selectedAllocation.orderId}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Allocated Vehicle</span>
                <div className="font-bold text-slate-900 dark:text-white">{selectedAllocation.vehicleNumber}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Driver Name & Mobile</span>
                <div className="font-bold text-slate-900 dark:text-white">
                  {selectedAllocation.driverName} ({selectedAllocation.driverMobile})
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Sand Quantity & Type</span>
                <div className="font-bold text-slate-900 dark:text-white">
                  {selectedAllocation.quantityMt} MT • {selectedAllocation.sandType}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Pickup Stockyard</span>
                <div className="font-bold text-slate-900 dark:text-white">{selectedAllocation.sourceStockyardName}</div>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Destination Address</span>
                <div className="font-semibold text-slate-900 dark:text-white">{selectedAllocation.destinationAddress}</div>
              </div>
            </div>

            {/* Driver SMS Preview */}
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 space-y-1">
              <span className="text-[10px] font-bold text-blue-900 dark:text-blue-300 uppercase">
                Simulated Driver SMS Dispatch:
              </span>
              <p className="font-mono text-[11px] text-blue-950 dark:text-blue-200 leading-relaxed">
                {selectedAllocation.notificationSmsContent}
              </p>
            </div>

            <ModalFooter>
              <Button variant="outline" onClick={() => setIsSlipModalOpen(false)}>
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => window.print()}
                icon={<Printer size={14} />}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Print Slip
              </Button>
            </ModalFooter>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AutomaticVehicleAllocation;
