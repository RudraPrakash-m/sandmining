import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  TelematicsKpiHeader,
  GpsTrackingMapCanvas,
  LiveVehiclesTable,
  AlertsExceptionsCard,
  SelectedVehicleDetailsCard,
  CustomerConsignmentTracker,
} from "../components";
import { TelematicsDataService } from "../services/telematicsMockService";
import type { TelematicsVehicle, TelematicsAlert } from "../types/telematics.types";
import { Calendar, Radio, Shield, User, Navigation, Eye, CheckCircle2 } from "lucide-react";

export const LiveGpsTrackingView: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialView = searchParams.get("view") === "customer" ? "customer" : "admin";
  const initialVehicleParam = searchParams.get("vehicle") || searchParams.get("orderId");

  const [activePerspective, setActivePerspective] = useState<"admin" | "customer">(initialView);
  const [selectedBasin, setSelectedBasin] = useState("all");

  const allVehicles = useMemo(() => TelematicsDataService.getAllVehicles(), []);
  const allAlerts = useMemo(() => TelematicsDataService.getAlerts(), []);
  const kpiCounts = useMemo(() => TelematicsDataService.getKpiCounts(), []);

  const defaultVehicle = useMemo(() => {
    if (initialVehicleParam) {
      const match = TelematicsDataService.getVehicleById(initialVehicleParam);
      if (match) return match;
    }
    return allVehicles[0];
  }, [allVehicles, initialVehicleParam]);

  const [selectedVehicle, setSelectedVehicle] = useState<TelematicsVehicle>(defaultVehicle);

  useEffect(() => {
    if (initialVehicleParam) {
      const match = TelematicsDataService.getVehicleById(initialVehicleParam);
      if (match) setSelectedVehicle(match);
    }
  }, [initialVehicleParam]);

  const handleSelectVehicle = (vehicle: TelematicsVehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleSelectAlert = (alert: TelematicsAlert) => {
    const linkedVehicle = allVehicles.find((v) => v.vehicleNumber === alert.vehicleNumber);
    if (linkedVehicle) {
      setSelectedVehicle(linkedVehicle);
    }
  };

  const handlePerspectiveChange = (persp: "admin" | "customer") => {
    setActivePerspective(persp);
    setSearchParams({ view: persp, vehicle: selectedVehicle.vehicleNumber });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* ── 1. Top Title & Live Status Bar ──────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#c2410c]/10 text-[#c2410c] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-[#c2410c]/20 uppercase tracking-wider">
              Screen 12 • Live Vehicle Tracking
            </span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-xs text-slate-500 font-medium">
              Telangana Reference Model (CSI-SIGeGov Standard)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Live Vehicle Telematics & Corridor Tracking
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            AIS-140 GPS-based transit monitoring, corridor geofencing & 5-stage customer consignment progress
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap">
          {/* Dual Perspective Toggle: Admin / SRO vs Customer */}
          <div className="flex items-center bg-slate-100 dark:bg-gray-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => handlePerspectiveChange("admin")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activePerspective === "admin"
                  ? "bg-[#c2410c] text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Shield size={14} />
              <span>Admin / SRO Monitor</span>
            </button>

            <button
              type="button"
              onClick={() => handlePerspectiveChange("customer")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activePerspective === "customer"
                  ? "bg-[#c2410c] text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <User size={14} />
              <span>Customer Tracker</span>
            </button>
          </div>

          {/* Live Pulse Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>AIS-140 GPS Active</span>
          </div>
        </div>
      </div>

      {/* ── 2. VIEW 1: CUSTOMER 5-STAGE TRACKING CONSOLE ───────── */}
      {activePerspective === "customer" && (
        <div className="space-y-4">
          <CustomerConsignmentTracker
            vehicles={allVehicles}
            selectedVehicleId={selectedVehicle.id}
            onSelectVehicle={handleSelectVehicle}
          />

          {/* Customer Live Map Canvas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Navigation size={14} className="text-[#c2410c]" /> Live Satellite Transit Route
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                Tracking Vehicle: <strong className="text-slate-800 dark:text-slate-200">{selectedVehicle.vehicleNumber}</strong>
              </span>
            </div>

            <GpsTrackingMapCanvas
              vehicles={allVehicles}
              selectedVehicleId={selectedVehicle.id}
              onSelectVehicle={handleSelectVehicle}
            />
          </div>
        </div>
      )}

      {/* ── 3. VIEW 2: ADMIN & SRO COMMAND MONITOR ──────────────── */}
      {activePerspective === "admin" && (
        <div className="space-y-4">
          {/* Filter by River Basin + 4 KPI Stat Badges */}
          <TelematicsKpiHeader
            selectedBasin={selectedBasin}
            onSelectBasin={setSelectedBasin}
            kpiCounts={kpiCounts}
          />

          {/* Main Split Grid: Live Map Canvas + Right Data Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Column (8 cols): Interactive Map Canvas & Bottom Details */}
            <div className="lg:col-span-8 space-y-4">
              {/* Real-time Map Canvas */}
              <GpsTrackingMapCanvas
                vehicles={allVehicles}
                selectedVehicleId={selectedVehicle.id}
                onSelectVehicle={handleSelectVehicle}
              />

              {/* Selected Vehicle Comprehensive Details Strip (Location, Start Time, Status, Delivery Loc, Route, Delay) */}
              <SelectedVehicleDetailsCard vehicle={selectedVehicle} />
            </div>

            {/* Right Column (4 cols): Live Vehicles Table (Active / Completed / Cancelled) & Alerts */}
            <div className="lg:col-span-4 space-y-4">
              {/* Live Vehicles Table with Category Tabs */}
              <LiveVehiclesTable
                vehicles={allVehicles}
                selectedVehicleId={selectedVehicle.id}
                onSelectVehicle={handleSelectVehicle}
              />

              {/* Alerts & Exceptions Card */}
              <AlertsExceptionsCard
                alerts={allAlerts}
                onSelectAlert={handleSelectAlert}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveGpsTrackingView;

