import React from "react";
import {
  Truck,
  MapPin,
  Gauge,
  Route as RouteIcon,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Phone,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Building,
} from "lucide-react";
import type { TelematicsVehicle } from "../types/telematics.types";

export interface SelectedVehicleDetailsCardProps {
  vehicle: TelematicsVehicle;
  className?: string;
}

export const SelectedVehicleDetailsCard: React.FC<SelectedVehicleDetailsCardProps> = ({
  vehicle,
  className = "",
}) => {
  const getStatusBadge = (status: string, stage?: string) => {
    switch (status) {
      case "In Transit":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
            In Transit {stage ? `(${stage})` : ""}
          </span>
        );
      case "Near Destination":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            Near Destination (&lt; 3km)
          </span>
        );
      case "Delivered":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 size={12} /> Delivered (Trip Closed)
          </span>
        );
      case "Idle":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            At Sand Reach / Idle
          </span>
        );
      case "Exception":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <AlertTriangle size={12} /> Exception / Deviation
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            Cancelled Trip
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const getDotColor = (status: string) => {
    switch (status) {
      case "In Transit":
      case "Delivered":
        return "text-emerald-500";
      case "Near Destination":
        return "text-blue-500";
      case "Idle":
        return "text-amber-500";
      case "Exception":
        return "text-rose-500";
      default:
        return "text-slate-400";
    }
  };

  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs p-5 space-y-4 ${className}`}
    >
      {/* ── Section Title & Top Metadata ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Truck size={18} className="text-blue-600 dark:text-blue-400" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Admin & SRO Telematics Live Dossier
          </h3>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
            AIS-140 GPS Feed
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Badge */}
          {getStatusBadge(vehicle.status, vehicle.tripStage)}

          {/* Delay Status Indicator */}
          {vehicle.delayMinutes > 0 ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
              <Clock size={11} /> Delay: +{vehicle.delayMinutes} mins
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <CheckCircle2 size={11} /> On Schedule
            </span>
          )}
        </div>
      </div>

      {/* ── Mandatory 7 Telematics Vectors Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* 1. Vehicle Identification & Plate */}
        <div className="p-3 bg-slate-50 dark:bg-gray-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Vehicle & Driver
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-base leading-none ${getDotColor(vehicle.status)}`}>●</span>
            <span className="text-sm font-black font-mono text-slate-900 dark:text-white tracking-tight">
              {vehicle.vehicleNumber}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
            {vehicle.driverName}
          </p>
          <a
            href={`tel:${vehicle.driverPhone}`}
            className="text-[11px] text-blue-600 dark:text-blue-400 font-mono flex items-center gap-1 hover:underline"
          >
            <Phone size={10} /> {vehicle.driverPhone}
          </a>
        </div>

        {/* 2. Current Vehicle Location */}
        <div className="p-3 bg-slate-50 dark:bg-gray-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Current Vehicle Location
          </span>
          <p className="text-xs font-bold text-slate-900 dark:text-white flex items-start gap-1">
            <MapPin size={13} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{vehicle.location}</span>
          </p>
          <p className="text-[10px] font-mono text-slate-500">
            {vehicle.coordinates.lat.toFixed(4)}° N, {vehicle.coordinates.lng.toFixed(4)}° E • {vehicle.speedKmH} km/h
          </p>
        </div>

        {/* 3. Trip Start Time & Reach Origin */}
        <div className="p-3 bg-slate-50 dark:bg-gray-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Trip Start Time & Reach
          </span>
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-900 dark:text-white">
            <Clock size={12} className="text-[#c2410c]" />
            <span>{vehicle.tripStartTime || "10 Sep 2026, 10:45 AM"}</span>
          </div>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate flex items-center gap-1">
            <Building size={12} className="text-slate-400 shrink-0" />
            {vehicle.sandReachName || "Mahanadi Reach 01"}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">Weighment & Gate-Out Logged</span>
        </div>

        {/* 4. Delivery Location & Destination */}
        <div className="p-3 bg-slate-50 dark:bg-gray-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Delivery Location (Destination)
          </span>
          <p className="text-xs font-bold text-slate-900 dark:text-white flex items-start gap-1">
            <MapPin size={13} className="text-rose-500 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{vehicle.deliveryLocation || vehicle.destination}</span>
          </p>
          <p className="text-[10px] text-slate-500">
            Customer: <span className="font-semibold text-slate-700 dark:text-slate-300">{vehicle.customerName || "Rameshwar Sahu"}</span>
          </p>
        </div>
      </div>

      {/* ── Route & Corridor Strip ── */}
      <div className="p-3 bg-slate-50/70 dark:bg-gray-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <RouteIcon size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Authorized Freight Corridor
            </span>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {vehicle.route}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono shrink-0">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Mineral Payload</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {vehicle.netWeightTons || 28.5} MT ({vehicle.mineralType || "River Sand"})
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block uppercase">ETA / Arrival</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {vehicle.eta || "28 mins"}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Geofence Compliance</span>
            <span
              className={`font-bold ${
                vehicle.geofenceStatus === "Normal"
                  ? "text-emerald-600"
                  : "text-rose-600"
              }`}
            >
              {vehicle.geofenceStatus}
            </span>
          </div>
        </div>
      </div>

      {/* ── Cancellation Banner (Only when status === "Cancelled") ── */}
      {vehicle.status === "Cancelled" && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-300 dark:border-rose-800 text-xs space-y-1">
          <p className="font-black text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
            <AlertCircle size={15} /> Trip Cancellation & Enforcement Audit Log
          </p>
          <p className="text-rose-800 dark:text-rose-400">
            {vehicle.cancellationReason || "Trip cancelled by enforcement authority or transport breakdown."}
          </p>
        </div>
      )}

      {/* ── Completion Banner (Only when status === "Delivered") ── */}
      {vehicle.status === "Delivered" && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-300 dark:border-emerald-800 text-xs space-y-1">
          <p className="font-black text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 size={15} /> Trip Completed & Verified
          </p>
          <p className="text-emerald-800 dark:text-emerald-400">
            Delivered successfully at {vehicle.completedTime || "10:40 AM"}. Handover authenticated via OTP {vehicle.deliveryOtp || "5821"}.
          </p>
        </div>
      )}
    </div>
  );
};

