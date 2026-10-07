import React, { useState } from "react";
import {
  Truck,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  Navigation,
  ShieldCheck,
  KeyRound,
  FileText,
  AlertCircle,
  Radio,
  Calendar,
  Layers,
  ChevronRight,
} from "lucide-react";
import type { TelematicsVehicle, TripStage } from "../types/telematics.types";
import Badge from "@/shared/components/ui/Badge";
import Button from "@/shared/components/ui/Button";
import { DigitalTransitPassModal } from "@/features/dispatch-management/components/DigitalTransitPassModal";
import { createDigitalTransitPass } from "@/features/dispatch-management/service/transitPassService";

export interface CustomerConsignmentTrackerProps {
  vehicles: TelematicsVehicle[];
  selectedVehicleId?: string;
  onSelectVehicle?: (vehicle: TelematicsVehicle) => void;
  className?: string;
}

const STAGES: {
  key: TripStage;
  label: string;
  subtext: string;
  icon: React.ElementType;
}[] = [
  {
    key: "Sand Reach",
    label: "Sand Reach",
    subtext: "Allotment & Tare/Gross Weighment Scale",
    icon: Layers,
  },
  {
    key: "Vehicle Started",
    label: "Vehicle Started",
    subtext: "RFID Gate-Out Clearance & Waybill Issued",
    icon: Truck,
  },
  {
    key: "In Transit",
    label: "In Transit",
    subtext: "Cruising along Authorized Geofence Corridor",
    icon: Navigation,
  },
  {
    key: "Near Destination",
    label: "Near Destination",
    subtext: "Approaching drop-off zone (< 3 km radius)",
    icon: MapPin,
  },
  {
    key: "Delivered",
    label: "Delivered",
    subtext: "Sand Offloaded & 4-Digit Handover OTP Verified",
    icon: CheckCircle2,
  },
];

const STAGE_ORDER: Record<TripStage, number> = {
  "Sand Reach": 1,
  "Vehicle Started": 2,
  "In Transit": 3,
  "Near Destination": 4,
  "Delivered": 5,
};


export const CustomerConsignmentTracker: React.FC<CustomerConsignmentTrackerProps> = ({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  className = "",
}) => {
  // Filter vehicles that belong to customer orders
  const customerVehicles = vehicles.filter((v) => v.orderId);
  const initialVehicle =
    customerVehicles.find((v) => v.id === selectedVehicleId || v.vehicleNumber === selectedVehicleId) ||
    customerVehicles[0] ||
    vehicles[0];

  const [activeVehicle, setActiveVehicle] = useState<TelematicsVehicle>(initialVehicle);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  const handleVehicleChange = (id: string) => {
    const v = customerVehicles.find((veh) => veh.id === id);
    if (v) {
      setActiveVehicle(v);
      if (onSelectVehicle) onSelectVehicle(v);
    }
  };

  const currentStageIndex = STAGE_ORDER[activeVehicle.tripStage] || 3;

  return (
    <div className={`space-y-5 animate-in fade-in duration-200 ${className}`}>
      {/* ── 1. Top Consignment Selector & Header ──────────────────────── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#c2410c]/10 text-[#c2410c] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-[#c2410c]/20 uppercase tracking-wider">
              Citizen / Buyer Portal • Live Consignment Telematics
            </span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-xs text-slate-500 font-medium">Telangana CSI-SIGeGov Standard</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Navigation size={22} className="text-[#c2410c]" />
            Live Consignment & Transit Tracker
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time satellite telematics for your booked mineral order with statutory milestone verification
          </p>
        </div>

        {/* Consignment Dropdown Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
            Select Order:
          </label>
          <select
            value={activeVehicle.id}
            onChange={(e) => handleVehicleChange(e.target.value)}
            className="text-xs font-mono font-bold bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#c2410c] cursor-pointer"
          >
            {customerVehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.orderId || v.vehicleNumber} – {v.vehicleNumber} ({v.tripStage})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── 2. The Statutory 5-Stage Customer Tracking Pipeline ─────────── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Consignment Progress Pipeline
            </span>
            <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
              Order {activeVehicle.orderId || "ORD-CG-2026-8801"} • {activeVehicle.mineralType || "Coarse River Sand"} ({activeVehicle.netWeightTons || 28.5} MT)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                activeVehicle.tripStage === "Delivered"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300"
                  : activeVehicle.tripStage === "Near Destination"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 animate-pulse"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300"
              }`}
            >
              Current Status: {activeVehicle.tripStage}
            </span>

            {activeVehicle.delayMinutes > 0 ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 flex items-center gap-1">
                <AlertCircle size={12} /> Delay: +{activeVehicle.delayMinutes} mins
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 size={12} /> On Schedule
              </span>
            )}
          </div>
        </div>

        {/* 5-Step Horizontal Graphical Visualizer */}
        <div className="relative pt-2 pb-4">
          {/* Background Connecting Line */}
          <div className="hidden md:block absolute top-1/2 left-8 right-8 h-1 -translate-y-6 bg-slate-200 dark:bg-gray-800 z-0" />

          {/* Progress Active Connecting Line */}
          <div
            className="hidden md:block absolute top-1/2 left-8 h-1 -translate-y-6 bg-gradient-to-r from-emerald-500 via-[#c2410c] to-blue-500 transition-all duration-700 z-0"
            style={{
              width: `${Math.min(100, Math.max(0, ((currentStageIndex - 1) / (STAGES.length - 1)) * 90))}%`,
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
            {STAGES.map((stage, idx) => {
              const stageNum = idx + 1;
              const isPast = stageNum < currentStageIndex;
              const isCurrent = stageNum === currentStageIndex;
              const isFuture = stageNum > currentStageIndex;
              const Icon = stage.icon;

              let timestampText = "";
              if (stage.key === "Sand Reach") timestampText = activeVehicle.stageTimestamps?.sandReach || "10:15 AM";
              if (stage.key === "Vehicle Started") timestampText = activeVehicle.stageTimestamps?.vehicleStarted || (stageNum <= currentStageIndex ? "10:45 AM" : "");
              if (stage.key === "In Transit") timestampText = activeVehicle.stageTimestamps?.inTransit || (stageNum <= currentStageIndex ? "11:00 AM" : "");
              if (stage.key === "Near Destination") timestampText = activeVehicle.stageTimestamps?.nearDestination || (stageNum <= currentStageIndex ? "11:25 AM" : "");
              if (stage.key === "Delivered") timestampText = activeVehicle.stageTimestamps?.delivered || (activeVehicle.completedTime ? activeVehicle.completedTime.slice(-8) : "");

              return (
                <div
                  key={stage.key}
                  className={`flex flex-col items-center text-center p-3.5 rounded-2xl transition-all ${
                    isCurrent
                      ? "bg-gradient-to-b from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/40 border-2 border-[#c2410c] shadow-md scale-102"
                      : isPast
                      ? "bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800/60"
                      : "bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-slate-700/60 opacity-60"
                  }`}
                >
                  {/* Step Bubble Indicator */}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all mb-2.5 shadow-sm ${
                      isPast
                        ? "bg-emerald-600 text-white"
                        : isCurrent
                        ? "bg-[#c2410c] text-white ring-4 ring-orange-200 dark:ring-orange-900/60 animate-bounce"
                        : "bg-slate-200 dark:bg-gray-700 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {isPast ? <CheckCircle2 size={24} /> : <Icon size={22} />}
                  </div>

                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-0.5">
                    Stage 0{stageNum}
                  </span>

                  <h4
                    className={`text-xs font-black ${
                      isCurrent
                        ? "text-[#c2410c] dark:text-orange-400"
                        : isPast
                        ? "text-emerald-800 dark:text-emerald-300"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {stage.label}
                  </h4>

                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-tight">
                    {stage.subtext}
                  </p>

                  {timestampText && (
                    <div className="mt-2 pt-1.5 border-t border-slate-200 dark:border-slate-700 w-full flex items-center justify-center gap-1 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300">
                      <Clock size={11} className="text-[#c2410c]" />
                      <span>{timestampText}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Current Stage Instruction Alert */}
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3 ${
            activeVehicle.tripStage === "Delivered"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
              : activeVehicle.tripStage === "Near Destination"
              ? "bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-200"
              : "bg-orange-50 dark:bg-orange-950/40 border-orange-300 dark:border-orange-800 text-orange-900 dark:text-orange-200"
          }`}
        >
          <Radio size={20} className="shrink-0 mt-0.5 animate-pulse text-[#c2410c]" />
          <div className="text-xs space-y-1">
            <span className="font-black uppercase tracking-wider block">
              Active Consignment Directive: {activeVehicle.tripStage}
            </span>
            {activeVehicle.tripStage === "Sand Reach" && (
              <p>
                Your vehicle <strong>{activeVehicle.vehicleNumber}</strong> is currently at{" "}
                <strong>{activeVehicle.sandReachName}</strong>. Loading of {activeVehicle.netWeightTons} MT sand
                and weighment slip generation is underway.
              </p>
            )}
            {activeVehicle.tripStage === "Vehicle Started" && (
              <p>
                Vehicle <strong>{activeVehicle.vehicleNumber}</strong> has cleared the reach RFID gate-out scanner
                at {activeVehicle.tripStartTime}. The statutory Transit Pass has been sealed with an immutable SHA-256 seal.
              </p>
            )}
            {activeVehicle.tripStage === "In Transit" && (
              <p>
                Vehicle <strong>{activeVehicle.vehicleNumber}</strong> is in transit on the authorized geofenced corridor.
                Current speed: <strong>{activeVehicle.speedKmH} km/h</strong>. Estimated arrival:{" "}
                <strong>{activeVehicle.eta}</strong>.
              </p>
            )}
            {activeVehicle.tripStage === "Near Destination" && (
              <p className="font-bold">
                Truck is approaching within 3 km of your site ({activeVehicle.deliveryLocation})! Please ensure the
                unloading bay is clear and prepare your 4-digit Delivery Handover OTP.
              </p>
            )}
            {activeVehicle.tripStage === "Delivered" && (
              <p>
                Consignment successfully delivered at {activeVehicle.completedTime || "10:40 AM"}! Physical handover was
                authenticated using OTP {activeVehicle.deliveryOtp}. Trip has been marked closed.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. Split Metrics: Trip Info & Handover OTP Card ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (8 cols): Carrier & Logistics Dossier */}
        <div className="lg:col-span-8 bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck size={18} className="text-[#c2410c]" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Assigned Carrier & Telematics Dossier
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Last Ping: {activeVehicle.lastGpsPing}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
            {/* Vehicle Number */}
            <div className="p-3 bg-slate-50 dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Transport Carrier</span>
              <span className="text-base font-black font-mono text-slate-900 dark:text-white mt-0.5 block">
                {activeVehicle.vehicleNumber}
              </span>
              <span className="text-[10px] text-slate-500">10-Wheeler Tipper • Verified</span>
            </div>

            {/* Driver Details */}
            <div className="p-3 bg-slate-50 dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Authorized Driver</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block truncate">
                {activeVehicle.driverName}
              </span>
              <a
                href={`tel:${activeVehicle.driverPhone}`}
                className="text-[11px] text-blue-600 dark:text-blue-400 font-mono font-bold flex items-center gap-1 hover:underline mt-0.5"
              >
                <Phone size={11} /> {activeVehicle.driverPhone}
              </a>
            </div>

            {/* Trip Start Time */}
            <div className="p-3 bg-slate-50 dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Trip Departure</span>
              <span className="text-sm font-mono font-bold text-slate-900 dark:text-white mt-0.5 block">
                {activeVehicle.tripStartTime}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">Gate-Out Cleared</span>
            </div>

            {/* Source Reach */}
            <div className="p-3 bg-slate-50 dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-slate-700 sm:col-span-2 md:col-span-1">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Sand Reach of Origin</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                {activeVehicle.sandReachName}
              </span>
              <span className="text-[10px] font-mono text-slate-400">ID: {activeVehicle.sandReachId || "RCH-CG-001"}</span>
            </div>

            {/* Permitted Destination */}
            <div className="p-3 bg-slate-50 dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-slate-700 sm:col-span-2">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Delivery Location</span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 flex items-start gap-1">
                <MapPin size={13} className="text-rose-500 shrink-0 mt-0.5" />
                <span className="line-clamp-1">{activeVehicle.deliveryLocation}</span>
              </p>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Authorized Corridor: {activeVehicle.route}
              </span>
            </div>
          </div>

          {/* Action Ribbon: View Waybill & Live Route */}
          <div className="pt-2 flex items-center justify-between flex-wrap gap-2 border-t border-slate-200 dark:border-slate-800">
            <Button
              size="sm"
              variant="outline"
              icon={<ShieldCheck size={15} className="text-[#c2410c]" />}
              onClick={() => setIsPassModalOpen(true)}
              className="text-xs font-bold"
            >
              View Official Transit Pass / Waybill
            </Button>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
              <span>AIS-140 GPS:</span>
              <Badge variant="success">Active Signal</Badge>
              <span>Speed: {activeVehicle.speedKmH} km/h</span>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): 4-Digit Handover Delivery OTP or Delivery Confirmation */}
        <div
          className={`lg:col-span-4 rounded-2xl border-2 p-5 shadow-2xs space-y-4 flex flex-col justify-between ${
            activeVehicle.tripStage === "Delivered"
              ? "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-emerald-950/40 border-emerald-300 dark:border-emerald-800"
              : "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-orange-950/30 border-dashed border-amber-300 dark:border-amber-800"
          }`}
        >
          {activeVehicle.tripStage === "Delivered" ? (
            <>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-emerald-600" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
                    Delivery Confirmed & Closed
                  </h3>
                </div>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                  Consignment successfully verified via Customer OTP <strong>{activeVehicle.deliveryOtp || "5821"}</strong>. Statutory Form VIII POD recorded.
                </p>
              </div>

              <div className="text-center py-3 bg-white/90 dark:bg-gray-800/90 rounded-2xl border border-emerald-200 dark:border-emerald-700/60 shadow-inner">
                <span className="text-sm font-bold font-mono text-emerald-700 dark:text-emerald-400 block">
                  POD Certified • Trip Closed
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 mt-0.5 block">
                  Timestamp: {activeVehicle.completedTime || "17:05 IST"} • GPS Verified
                </span>
              </div>

              <div className="p-3 bg-emerald-100/60 dark:bg-emerald-950/60 rounded-xl border border-emerald-300 dark:border-emerald-800 text-[11px] text-emerald-900 dark:text-emerald-200 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <ShieldCheck size={13} className="shrink-0 text-emerald-600" /> Official SMS Dispatched:
                </p>
                <p className="text-[10px] leading-tight text-emerald-800 dark:text-emerald-300">
                  Delivery acknowledgment confirmation sent to registered mobile <strong>{activeVehicle.customerPhone || "+91 98271 88401"}</strong>.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <KeyRound size={20} className="text-amber-600" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-200">
                    Delivery Handover OTP
                  </h3>
                </div>
                <p className="text-[11px] text-amber-800 dark:text-amber-300">
                  Statutory 4-digit code dispatched to your registered mobile (<strong>{activeVehicle.customerPhone || "+91 98271 88401"}</strong>).
                </p>
              </div>

              <div className="text-center py-4 bg-white/90 dark:bg-gray-800/90 rounded-2xl border border-amber-200 dark:border-amber-700/60 shadow-inner">
                <span className="text-3xl font-black font-mono tracking-widest text-[#c2410c] dark:text-orange-400 block">
                  {activeVehicle.deliveryOtp || "5821"}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 mt-1 block">
                  Secret Handover Verification Code
                </span>
              </div>

              <div className="p-3 bg-amber-100/60 dark:bg-amber-950/60 rounded-xl border border-amber-300 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <AlertCircle size={13} className="shrink-0" /> Important Security Warning:
                </p>
                <p className="text-[10px] leading-tight text-amber-800 dark:text-amber-300">
                  Share this OTP with the driver <strong>only after</strong> the sand is physically unloaded and
                  verified at your premises. Once confirmed, the consignment is closed and royalty is settled.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── 4. Official Transit Pass Modal Integration ─────────────────── */}
      <DigitalTransitPassModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        transitPass={createDigitalTransitPass({
          orderId: activeVehicle.orderId || "ORD-CG-2026-8801",
          vehicleNumber: activeVehicle.vehicleNumber,
          driverName: activeVehicle.driverName,
          driverMobile: activeVehicle.driverPhone,
          sandReach: {
            reachId: activeVehicle.sandReachId || "RCH-CG-001",
            reachName: activeVehicle.sandReachName,
            district: "Raipur",
            riverName: "Mahanadi River",
          },
          sourceStockyard: activeVehicle.sandReachName,
          destination: activeVehicle.deliveryLocation,
          quantityMt: activeVehicle.netWeightTons || 28.5,
          sandType: activeVehicle.mineralType || "Coarse River Sand",
          customerDetails: {
            name: activeVehicle.customerName || "Rameshwar Sahu",
            mobile: activeVehicle.customerPhone || "+91 98271 88401",
            category: "Citizen Buyer",
            deliveryAddress: activeVehicle.deliveryLocation,
          },
          validityHours: 8,
          gpsTrackingRef: {
            deviceImei: `AIS140-CG-${activeVehicle.vehicleNumber.replace(/[^A-Z0-9]/g, "").slice(-6)}`,
            corridorGeofence: `Authorized corridor: ${activeVehicle.route}`,
          },
        })}
      />
    </div>
  );
};

export default CustomerConsignmentTracker;
