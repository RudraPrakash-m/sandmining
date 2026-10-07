import React, { useState, useMemo } from "react";
import {
  MapPin,
  Building2,
  Pickaxe,
  FileText,
  Truck,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  Navigation,
  KeyRound,
  Radio,
  Clock,
  Layers,
  Phone,
  User,
  ShieldCheck,
  Scale,
  QrCode,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  Compass,
  FileCheck,
  Eye,
  Camera,
  X,
} from "lucide-react";
import type {
  DrillDownLevel,
  DrillDownState,
  DistrictUtilizationItem,
} from "../types";
import type {
  SandBooking,
  MiningReach,
  Vehicle,
  DeliveryConfirmation,
  VehicleTelemetry,
} from "@/features/shared-simulation/types";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import { OrderStatusBadge, OrderStatusStepper } from "@/features/order-lifecycle";
import Card from "@/shared/components/layout/Card/Card";
import Button from "@/shared/components/ui/Button";
import Badge from "@/shared/components/ui/Badge";

interface DashboardHierarchicalDrillDownProps {
  districts: DistrictUtilizationItem[];
  initialDistrictId?: string;
  onClose?: () => void;
}

export const DashboardHierarchicalDrillDown: React.FC<DashboardHierarchicalDrillDownProps> = ({
  districts,
  initialDistrictId,
  onClose,
}) => {
  const {
    reaches,
    bookings,
    vehicles,
    deliveries,
    telemetry,
  } = useSandMining();

  // ── Hierarchical Drill-down State ──────────────────────────────
  const [drillState, setDrillState] = useState<DrillDownState>({
    level: initialDistrictId && initialDistrictId !== "ALL" ? "district" : "state",
    stateName: "Chhattisgarh State",
    selectedDistrictId: initialDistrictId && initialDistrictId !== "ALL" ? initialDistrictId : "dist-raipur",
    selectedReachId: "TG-RP-MHN-01",
    selectedOrderId: "SMMS-ORD-2026-8801",
    selectedVehicleNumber: "CG-04-TX-2341",
    selectedDeliveryId: "DEL-2026-9041",
  });

  // Sync with initialDistrictId when changed
  React.useEffect(() => {
    if (initialDistrictId && initialDistrictId !== "ALL") {
      setDrillState((prev) => ({
        ...prev,
        level: "district",
        selectedDistrictId: initialDistrictId,
      }));
    }
  }, [initialDistrictId]);

  // Selected Entities
  const currentDistrict = useMemo(() => {
    return (
      districts.find((d) => d.id === drillState.selectedDistrictId) ||
      districts.find((d) => d.districtName.toLowerCase().includes("raipur")) ||
      districts[0]
    );
  }, [districts, drillState.selectedDistrictId]);

  const currentDistrictReaches = useMemo(() => {
    const list = reaches.filter((r) =>
      r.district.toLowerCase().includes(currentDistrict.districtName.toLowerCase())
    );
    return list.length > 0 ? list : reaches;
  }, [reaches, currentDistrict]);

  const currentReach = useMemo(() => {
    return (
      reaches.find((r) => r.reachId === drillState.selectedReachId || r.id === drillState.selectedReachId) ||
      currentDistrictReaches[0] ||
      reaches[0]
    );
  }, [reaches, currentDistrictReaches, drillState.selectedReachId]);

  const currentReachBookings = useMemo(() => {
    const list = bookings.filter(
      (b) =>
        b.sourceStockyardName.toLowerCase().includes(currentReach.reachName.toLowerCase()) ||
        b.sourceStockyardId === currentReach.linkedStockyardId ||
        b.destinationDistrict?.toLowerCase() === currentReach.district.toLowerCase()
    );
    return list.length > 0 ? list : bookings;
  }, [bookings, currentReach]);

  const currentOrder = useMemo(() => {
    return (
      bookings.find((b) => b.orderId === drillState.selectedOrderId || b.id === drillState.selectedOrderId) ||
      currentReachBookings[0] ||
      bookings[0]
    );
  }, [bookings, currentReachBookings, drillState.selectedOrderId]);

  const currentVehicle = useMemo(() => {
    const vehNum = currentOrder.assignedVehicleNumber || drillState.selectedVehicleNumber;
    return (
      vehicles.find((v) => v.vehicleNumber === vehNum) ||
      vehicles[0] || {
        id: "veh-001",
        vehicleNumber: "CG-04-TX-2341",
        vehicleType: "10-Wheeler Heavy Tipper (10 MT)",
        driverName: "Venkat Sahu",
        mobile: "+91 98260 12345",
        capacityMt: 10,
        queueStatus: "Assigned on Trip",
        queuePosition: 1,
        totalTripsCompleted: 42,
      }
    );
  }, [vehicles, currentOrder, drillState.selectedVehicleNumber]);

  const currentTelemetry = useMemo(() => {
    const found = telemetry.find((t) => t.vehicleNumber === currentVehicle.vehicleNumber);
    return {
      id: found?.id || "tel-001",
      vehicleNumber: currentVehicle.vehicleNumber,
      speedKmH: found?.speedKmH ?? 42,
      latitude: typeof found?.latitude === "number" ? found.latitude : (Number(found?.latitude) || 21.2514),
      longitude: typeof found?.longitude === "number" ? found.longitude : (Number(found?.longitude) || 81.6296),
      heading: found?.heading || "NE (45°)",
      ignitionStatus: found?.ignitionStatus || "ON",
      geofenceStatus: found?.geofenceStatus || "Inside NH-53 Corridor",
      lastPingTime: found?.lastPingTime || "Just now (Live)",
    };
  }, [telemetry, currentVehicle]);

  const currentDelivery = useMemo(() => {
    return (
      deliveries.find(
        (d) => d.bookingId === currentOrder.id || d.bookingId === currentOrder.orderId
      ) || {
        id: "del-001",
        deliveryId: "DEL-2026-9041",
        bookingId: currentOrder.id,
        vehicleNumber: currentVehicle.vehicleNumber,
        driverName: currentVehicle.driverName,
        customerName: currentOrder.customerName,
        customerMobile: currentOrder.customerMobile,
        status: currentOrder.bookingStatus === "Delivered" || currentOrder.bookingStatus === "Order Closed" ? "Delivered" : "In Transit",
        deliveryTime: "2026-09-08 17:35",
        isOtpVerified: true,
        geoCoordinates: "21.1610° N, 81.7870° E",
        remarks: "Consignee received 10 MT coarse river sand. Site access unobstructed.",
        photoUrl: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=400&q=80",
        signatureCaptured: true,
        receiptNumber: "RCPT-CG-2026-8801",
      }
    );
  }, [deliveries, currentOrder, currentVehicle]);

  // ── Navigation Handlers ─────────────────────────────────────────
  const goToLevel = (level: DrillDownLevel) => {
    setDrillState((prev) => ({ ...prev, level }));
  };

  const selectDistrict = (districtId: string) => {
    setDrillState((prev) => ({
      ...prev,
      selectedDistrictId: districtId,
      level: "district",
    }));
  };

  const selectReach = (reachId: string) => {
    setDrillState((prev) => ({
      ...prev,
      selectedReachId: reachId,
      level: "reach",
    }));
  };

  const selectOrder = (orderId: string) => {
    const bkg = bookings.find((b) => b.orderId === orderId || b.id === orderId);
    setDrillState((prev) => ({
      ...prev,
      selectedOrderId: orderId,
      selectedVehicleNumber: bkg?.assignedVehicleNumber || prev.selectedVehicleNumber,
      level: "order",
    }));
  };

  const selectVehicle = (vehicleNumber: string) => {
    setDrillState((prev) => ({
      ...prev,
      selectedVehicleNumber: vehicleNumber,
      level: "vehicle",
    }));
  };

  const selectDelivery = (deliveryId: string) => {
    setDrillState((prev) => ({
      ...prev,
      selectedDeliveryId: deliveryId,
      level: "delivery",
    }));
  };

  const resetToState = () => {
    setDrillState((prev) => ({
      ...prev,
      level: "state",
    }));
  };

  // ── Step metadata ──────────────────────────────────────────────
  const LEVEL_STEPS: { level: DrillDownLevel; num: number; label: string; icon: any }[] = [
    { level: "state", num: 1, label: "State", icon: Building2 },
    { level: "district", num: 2, label: "District", icon: MapPin },
    { level: "reach", num: 3, label: "Sand Reach", icon: Pickaxe },
    { level: "order", num: 4, label: "Order", icon: FileText },
    { level: "vehicle", num: 5, label: "Vehicle", icon: Truck },
    { level: "delivery", num: 6, label: "Delivery", icon: CheckCircle2 },
  ];

  const currentLevelIndex = LEVEL_STEPS.findIndex((s) => s.level === drillState.level);

  return (
    <Card className="p-4 sm:p-6 shadow-md border-slate-200 dark:border-slate-800">
      {/* ── TOP HEADER & BREADCRUMB STRIP ── */}
      <div className="space-y-3 pb-4 border-b border-border-color dark:border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                Hierarchical Drill-down Engine
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Level {currentLevelIndex + 1} of 6
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
              State → District → Sand Reach → Order → Vehicle → Delivery
            </h2>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {drillState.level !== "state" && (
              <Button
                size="xs"
                variant="outline"
                onClick={resetToState}
                icon={<RotateCcw size={12} />}
                className="text-xs"
              >
                Reset to State
              </Button>
            )}
            {onClose && (
              <Button
                size="xs"
                variant="ghost"
                onClick={onClose}
                icon={<X size={14} />}
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                title="Close Drill-Down View"
              >
                Close View
              </Button>
            )}
          </div>
        </div>

        {/* ── 6-LEVEL STEPPER BREADCRUMB STRIP ── */}
        <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          {LEVEL_STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isActive = s.level === drillState.level;
            const isCompleted = idx < currentLevelIndex;

            return (
              <React.Fragment key={s.level}>
                <button
                  type="button"
                  onClick={() => goToLevel(s.level)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-orange-600 text-white shadow-xs"
                      : isCompleted
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <span
                    className={`size-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                      isActive
                        ? "bg-white text-orange-600"
                        : isCompleted
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-300 dark:bg-slate-700 text-slate-600"
                    }`}
                  >
                    {isCompleted ? "✓" : s.num}
                  </span>
                  <Icon size={13} />
                  <span>{s.label}</span>
                </button>

                {idx < LEVEL_STEPS.length - 1 && (
                  <ChevronRight size={14} className="text-slate-400 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Dynamic Context Breadcrumb Sub-label */}
        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-850 p-2 rounded-lg flex items-center gap-1.5 overflow-x-auto">
          <span className="font-bold text-slate-700 dark:text-slate-200">Active Path:</span>
          <span className="cursor-pointer hover:underline text-primary" onClick={() => goToLevel("state")}>
            Chhattisgarh
          </span>
          <span>/</span>
          <span className="cursor-pointer hover:underline text-primary" onClick={() => goToLevel("district")}>
            {currentDistrict.districtName}
          </span>
          <span>/</span>
          <span className="cursor-pointer hover:underline text-primary" onClick={() => goToLevel("reach")}>
            {currentReach.reachName}
          </span>
          <span>/</span>
          <span className="cursor-pointer hover:underline text-primary" onClick={() => goToLevel("order")}>
            {currentOrder.orderId}
          </span>
          <span>/</span>
          <span className="cursor-pointer hover:underline text-primary" onClick={() => goToLevel("vehicle")}>
            {currentVehicle.vehicleNumber}
          </span>
          <span>/</span>
          <span className="font-bold text-emerald-600">
            {currentDelivery.deliveryId}
          </span>
        </div>
      </div>

      {/* ── DYNAMIC VIEW RENDERER PER DRILL-DOWN LEVEL ── */}
      <div className="pt-4">
        {/* ========================================================= */}
        {/* LEVEL 1: STATE VIEW (CHHATTISGARH STATE OVERVIEW)          */}
        {/* ========================================================= */}
        {drillState.level === "state" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 size={16} className="text-orange-500" />
                  State Overview: Chhattisgarh (33 Districts)
                </h3>
                <p className="text-xs text-slate-500">
                  Select any district below to drill down into active sand reaches, local quotas, and stockyards.
                </p>
              </div>
            </div>

            {/* State Grid of Districts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {districts.map((d) => (
                <div
                  key={d.id}
                  onClick={() => selectDistrict(d.id)}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-orange-500 dark:hover:border-orange-500 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-orange-500" />
                      <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-orange-600">
                        {d.districtName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">({d.districtCode})</span>
                    </div>
                    <Badge variant={d.status === "Optimal" ? "success" : "warning"} className="text-[10px]">
                      {(Number(d.utilizationRatePct) || 0).toFixed(0)}% Utilized
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs py-2">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Active Reaches</span>
                      <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                        {d.activeReaches} of {d.totalReaches}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Available Stock</span>
                      <span className="font-bold font-mono text-amber-600 dark:text-amber-400">
                        {d.availableStockMt.toLocaleString()} MT
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-orange-600 font-semibold group-hover:underline">
                    <span>Drill into {d.districtName}</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* LEVEL 2: DISTRICT VIEW                                    */}
        {/* ========================================================= */}
        {drillState.level === "district" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* District Dossier Header */}
            <div className="p-4 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent rounded-2xl border border-orange-200 dark:border-orange-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                  {currentDistrict.districtCode}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {currentDistrict.districtName} District Portal
                  </h3>
                  <span className="text-xs text-slate-600 dark:text-slate-300">
                    River Basin: <strong>{currentDistrict.riverBasin}</strong> • Compliance: <strong>{currentDistrict.complianceRatePct}%</strong>
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="text-[10px] text-slate-400 uppercase block">Dispatched Tonnage</span>
                  <span className="font-mono font-bold text-blue-600 text-sm">
                    {currentDistrict.dispatchedMt.toLocaleString()} MT
                  </span>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="text-[10px] text-slate-400 uppercase block">Available Stock</span>
                  <span className="font-mono font-bold text-amber-600 text-sm">
                    {currentDistrict.availableStockMt.toLocaleString()} MT
                  </span>
                </div>
              </div>
            </div>

            {/* List of Sand Reaches in this District */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Pickaxe size={14} className="text-amber-500" />
                  Sand Reaches in {currentDistrict.districtName} ({currentDistrictReaches.length})
                </h4>
                <span className="text-xs text-slate-400">Click any reach to drill into its order queue</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {currentDistrictReaches.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => selectReach(r.reachId || r.id)}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-amber-500 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="font-mono text-[10px] text-primary block">{r.reachId}</span>
                        <h5 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-amber-600">
                          {r.reachName}
                        </h5>
                      </div>
                      <Badge variant={r.status === "Approved" ? "success" : "warning"} className="text-[10px]">
                        {r.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs py-2">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block">Mineral Grade</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{r.sandType}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block">Current Stock</span>
                        <span className="font-mono font-bold text-amber-600">
                          {(r.currentStockMt || 32000).toLocaleString()} MT
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-amber-600 font-semibold group-hover:underline">
                      <span>Drill into Sand Reach</span>
                      <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* LEVEL 3: SAND REACH VIEW                                  */}
        {/* ========================================================= */}
        {drillState.level === "reach" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Reach Details Dossier */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Reach ID & Name</span>
                <p className="font-mono font-bold text-primary text-sm mt-0.5">{currentReach.reachId}</p>
                <h4 className="font-black text-slate-900 dark:text-white text-base mt-0.5">{currentReach.reachName}</h4>
                <span className="text-slate-500 font-medium">{currentReach.riverStream} ({currentReach.district})</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Mining Specs & Clearances</span>
                <div className="mt-1 space-y-1">
                  <span className="block font-semibold text-slate-800 dark:text-slate-200">
                    Volume: {currentReach.areaVolume || "14.5 Hectares / 1,20,000 MT"}
                  </span>
                  <span className="block text-slate-500">
                    EC: {currentReach.environmentalClearanceRef || "EC/SEIAA/TG/MIN/2025/1109"}
                  </span>
                  <span className="block text-emerald-600 font-bold">
                    GPS: {currentReach.gpsCoordinates || "21.2514° N, 81.6296° E"}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Weighbridge & Surveillance</span>
                <div className="mt-1 space-y-1 font-semibold">
                  <div className="flex items-center gap-1.5 text-emerald-600">
                    <Radio size={12} className="animate-pulse" />
                    <span>Live Tare Weighbridge Feed</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-blue-600">
                    <Camera size={12} />
                    <span>CCTV Surveillance Live (4 Cams)</span>
                  </div>
                  <span className="text-slate-500 block">Stockyard: {currentReach.linkedStockyardName}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Nodal Mining Officer</span>
                <div className="mt-1 space-y-0.5">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {currentReach.responsibleOfficer}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {currentReach.responsibleOfficerDesignation}
                  </span>
                  <a
                    href={`tel:${currentReach.responsibleOfficerContact}`}
                    className="font-mono text-blue-600 font-bold hover:underline block pt-1"
                  >
                    <Phone size={11} className="inline mr-1" />
                    {currentReach.responsibleOfficerContact}
                  </a>
                </div>
              </div>
            </div>

            {/* Orders Originating from this Reach */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <FileText size={14} className="text-blue-500" />
                  Active Consignment Orders Linked to this Reach ({currentReachBookings.length})
                </h4>
                <span className="text-xs text-slate-400">Click any order to inspect lifecycle pipeline</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Order ID</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Quantity</th>
                      <th className="py-2.5 px-3">Destination</th>
                      <th className="py-2.5 px-3">Carrier Vehicle</th>
                      <th className="py-2.5 px-3">Order Status</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                    {currentReachBookings.map((b) => (
                      <tr
                        key={b.id}
                        onClick={() => selectOrder(b.orderId)}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                      >
                        <td className="py-2.5 px-3 font-mono font-bold text-primary">{b.orderId}</td>
                        <td className="py-2.5 px-3 text-slate-900 dark:text-white font-bold">{b.customerName}</td>
                        <td className="py-2.5 px-3 font-mono">{b.quantityMt} MT ({b.sandType})</td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 truncate max-w-[180px]">
                          {b.destinationAddress}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                          {b.assignedVehicleNumber || "Awaiting Allocation"}
                        </td>
                        <td className="py-2.5 px-3">
                          <OrderStatusBadge status={b.bookingStatus} size="sm" />
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <Button size="xs" variant="primary" className="text-xs">
                            Drill Order →
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* LEVEL 4: ORDER VIEW                                       */}
        {/* ========================================================= */}
        {drillState.level === "order" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Order Dossier Bar */}
            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Order Identification</span>
                <h4 className="font-mono font-black text-lg text-primary mt-0.5">{currentOrder.orderId}</h4>
                <span className="text-slate-500 font-mono">Ref ID: {currentOrder.id}</span>
                <div className="mt-1">
                  <OrderStatusBadge status={currentOrder.bookingStatus} size="sm" />
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Citizen / Consignee</span>
                <span className="font-bold text-slate-900 dark:text-white block mt-0.5 text-sm">
                  {currentOrder.customerName}
                </span>
                <a
                  href={`tel:${currentOrder.customerMobile}`}
                  className="font-mono font-bold text-blue-600 hover:underline block"
                >
                  <Phone size={11} className="inline mr-1" />
                  {currentOrder.customerMobile}
                </a>
                <span className="text-slate-500 text-[11px] block mt-0.5">{currentOrder.destinationAddress}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Mineral & Financials</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white block mt-0.5">
                  {currentOrder.quantityMt} MT • {currentOrder.sandType}
                </span>
                <span className="text-base font-black font-mono text-orange-600 dark:text-orange-400 block">
                  ₹ {currentOrder.totalAmount.toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">
                  Status: {currentOrder.paymentStatus} (Receipt: {currentOrder.ePassId || "EPASS-1049"})
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Assigned Carrier</span>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 mt-1">
                  <span className="font-mono font-black text-sm text-slate-900 dark:text-white block">
                    {currentOrder.assignedVehicleNumber || "CG-04-TX-2341"}
                  </span>
                  <span className="text-slate-500 text-[11px] block">
                    Driver: {currentOrder.assignedDriverName || "Venkat Sahu"}
                  </span>
                  <Button
                    size="xs"
                    variant="primary"
                    onClick={() => selectVehicle(currentOrder.assignedVehicleNumber || "CG-04-TX-2341")}
                    className="w-full mt-2 text-xs font-bold"
                  >
                    Drill into Vehicle Telematics →
                  </Button>
                </div>
              </div>
            </div>

            {/* Standard 18-step Order Status Stepper */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Order Lifecycle Engine (18-Stage FSM Pipeline)
              </h4>
              <OrderStatusStepper currentStatus={currentOrder.bookingStatus} />
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* LEVEL 5: VEHICLE VIEW                                     */}
        {/* ========================================================= */}
        {drillState.level === "vehicle" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Vehicle Telematics Dossier */}
            <div className="p-5 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl border border-slate-700 shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-black shadow-md">
                    <Truck size={24} />
                  </div>
                  <div>
                    <span className="font-mono text-2xl font-black tracking-tight text-white block">
                      {currentVehicle.vehicleNumber}
                    </span>
                    <span className="text-xs text-blue-300">
                      {currentVehicle.vehicleType} • FIFO Queue Position: <strong>#{currentVehicle.queuePosition || 1}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                    <Radio size={14} className="animate-pulse" />
                    AIS-140 GPS Active
                  </span>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => selectDelivery(currentDelivery.deliveryId)}
                    className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700"
                  >
                    Drill into Delivery Confirmation →
                  </Button>
                </div>
              </div>

              {/* Real-time Telematics Gauges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Telemetry Speed</span>
                  <span className="text-xl font-mono font-black text-emerald-400">
                    {currentTelemetry.speedKmH} km/h
                  </span>
                  <span className="text-[10px] text-slate-300 block">Cruising Safe</span>
                </div>

                <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Geofence Corridor</span>
                  <span className="text-sm font-bold text-blue-300 block truncate">
                    {currentTelemetry.geofenceStatus}
                  </span>
                  <span className="text-[10px] text-emerald-400 block">Corridor Clean</span>
                </div>

                <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">GPS Coordinates</span>
                  <span className="text-xs font-mono font-bold text-slate-200 block truncate">
                    {(Number(currentTelemetry.latitude) || 21.2514).toFixed(4)}° N, {(Number(currentTelemetry.longitude) || 81.6296).toFixed(4)}° E
                  </span>
                  <span className="text-[10px] text-slate-400 block">{currentTelemetry.lastPingTime}</span>
                </div>

                <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Authorized Driver</span>
                  <span className="font-bold text-white block truncate">{currentVehicle.driverName}</span>
                  <a href={`tel:${currentVehicle.mobile}`} className="font-mono text-blue-300 hover:underline text-xs">
                    {currentVehicle.mobile}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* LEVEL 6: DELIVERY VIEW                                    */}
        {/* ========================================================= */}
        {drillState.level === "delivery" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Delivery Confirmation Dossier */}
            <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border-2 border-emerald-500/40 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-md">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 uppercase font-bold">Proof of Delivery (POD) Dossier</span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white font-mono">
                      {currentDelivery.deliveryId}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="success" className="text-xs font-bold px-3 py-1">
                    ✓ Handover Verified via Customer OTP
                  </Badge>
                </div>
              </div>

              {/* Delivery Parameters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">1. Customer Handover</span>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{currentDelivery.customerName}</p>
                  <p className="font-mono text-slate-600 dark:text-slate-300">{currentDelivery.customerMobile}</p>
                  <span className="text-[11px] text-emerald-600 font-semibold block">OTP: 7834 (Verified)</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">2. Geotag & Coordinates</span>
                  <p className="font-mono font-bold text-slate-900 dark:text-white">{currentDelivery.geoCoordinates}</p>
                  <p className="text-slate-500">Timestamp: {currentDelivery.deliveryTime}</p>
                  <span className="text-[11px] text-emerald-600 font-semibold block">Geofence Site Radius: Inside 12m</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">3. Statutory Receipt</span>
                  <p className="font-mono font-bold text-purple-600">{currentDelivery.receiptNumber}</p>
                  <p className="text-slate-500">Carrier: {currentDelivery.vehicleNumber}</p>
                  <span className="text-[11px] text-slate-500 block truncate">Notes: {currentDelivery.remarks}</span>
                </div>
              </div>

              {/* Final Summary Strip */}
              <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-emerald-950 dark:text-emerald-200 font-semibold">
                  Consignment successfully delivered and closed in central SMMS ledger. Vehicle eligible for next FIFO trip.
                </span>
                <Button size="xs" variant="outline" onClick={resetToState} className="text-xs font-bold shrink-0">
                  Return to State Overview
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
