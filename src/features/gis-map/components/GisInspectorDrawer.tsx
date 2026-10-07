import React from "react";
import { useNavigate } from "react-router-dom";
import type { SelectedGisItemType } from "../types/gis.types";
import { routes } from "@/app/routes/routeConfig";
import {
  Pickaxe,
  Building2,
  Truck,
  AlertTriangle,
  ShieldAlert,
  Waves,
  MapPin,
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Gauge,
  Compass,
} from "lucide-react";

export interface GisInspectorDrawerProps {
  selectedItem: {
    type: SelectedGisItemType;
    rawItem: any;
  } | null;
  onClose: () => void;
  className?: string;
}

export const GisInspectorDrawer: React.FC<GisInspectorDrawerProps> = ({
  selectedItem,
  onClose,
  className = "",
}) => {
  const navigate = useNavigate();

  if (!selectedItem) return null;

  const { type, rawItem } = selectedItem;

  const renderContent = () => {
    switch (type) {
      case "REACH":
        return (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-border-color">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60">
                  <Pickaxe size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {rawItem.reachName}
                  </h4>
                  <p className="text-xs text-slate-500 font-mono">{rawItem.reachId}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {rawItem.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-[#FAF5EE] dark:bg-gray-800/60 border border-amber-900/10">
                <span className="text-slate-500 text-[10px]">District & River</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {rawItem.district} • {rawItem.riverStream}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-[#FAF5EE] dark:bg-gray-800/60 border border-amber-900/10">
                <span className="text-slate-500 text-[10px]">EC Clearance Ref</span>
                <p className="font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                  {rawItem.environmentalClearanceRef}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-[#FAF5EE] dark:bg-gray-800/60 border border-amber-900/10">
                <span className="text-slate-500 text-[10px]">Permitted Quota</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {rawItem.permittedQuantityMt.toLocaleString()} MT
                </p>
              </div>
              <div className="p-2 rounded-lg bg-[#FAF5EE] dark:bg-gray-800/60 border border-amber-900/10">
                <span className="text-slate-500 text-[10px]">Excavated to Date</span>
                <p className="font-bold text-primary mt-0.5">
                  {rawItem.excavatedQuantityMt.toLocaleString()} MT
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate(routes.miningReach.path)}
              className="w-full mt-2 inline-flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors cursor-pointer"
            >
              <span>View Full Reach Permit</span>
              <ExternalLink size={13} />
            </button>
          </div>
        );

      case "STOCKYARD":
        return (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-border-color">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60">
                  <Building2 size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {rawItem.name}
                  </h4>
                  <p className="text-xs text-slate-500 font-mono">{rawItem.stockyardId}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                {rawItem.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-[#FAF5EE] dark:bg-gray-800/60 border border-amber-900/10 col-span-2">
                <span className="text-slate-500 text-[10px]">Depot Location</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {rawItem.location} ({rawItem.district})
                </p>
              </div>
              <div className="p-2 rounded-lg bg-[#FAF5EE] dark:bg-gray-800/60 border border-amber-900/10">
                <span className="text-slate-500 text-[10px]">Available Stock</span>
                <p className="font-bold text-primary mt-0.5 text-sm">
                  {rawItem.availableQuantityMt.toLocaleString()} MT
                </p>
              </div>
              <div className="p-2 rounded-lg bg-[#FAF5EE] dark:bg-gray-800/60 border border-amber-900/10">
                <span className="text-slate-500 text-[10px]">Storage Capacity</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5 text-sm">
                  {rawItem.capacityMt.toLocaleString()} MT
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate(routes.stockyard.path)}
              className="w-full mt-2 inline-flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors cursor-pointer"
            >
              <span>View Stockyard Ledger</span>
              <ExternalLink size={13} />
            </button>
          </div>
        );

      case "VEHICLE":
        return (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-border-color">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60">
                  <Truck size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {rawItem.vehicleNumber}
                  </h4>
                  <p className="text-xs text-slate-500">Driver: {rawItem.driverName}</p>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${rawItem.geofenceStatus === "Normal Route"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                  }`}
              >
                {rawItem.geofenceStatus}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-[#FAF5EE] dark:bg-gray-800/60 border border-amber-900/10">
                <span className="text-slate-500 text-[10px] flex items-center gap-1">
                  <Gauge size={11} className="text-blue-600" />
                  <span>GPS Speed</span>
                </span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {rawItem.speedKmH} km/h
                </p>
              </div>
              <div className="p-2 rounded-lg bg-[#FAF5EE] dark:bg-gray-800/60 border border-amber-900/10">
                <span className="text-slate-500 text-[10px] flex items-center gap-1">
                  <Clock size={11} className="text-blue-600" />
                  <span>ETA to Depot</span>
                </span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {rawItem.eta}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-[#FAF5EE] dark:bg-gray-800/60 border border-amber-900/10 col-span-2">
                <span className="text-slate-500 text-[10px]">Transit Corridor</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {rawItem.sourceReachName} → {rawItem.destinationDepot}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate(routes.dispatchManagement.path)}
              className="w-full mt-2 inline-flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors cursor-pointer"
            >
              <span>Track Dispatch Trip</span>
              <ExternalLink size={13} />
            </button>
          </div>
        );

      case "ALERT":
        return (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-border-color">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/60">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {rawItem.alertId}
                  </h4>
                  <p className="text-xs text-rose-600 font-bold uppercase">{rawItem.severity} Severity</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                {rawItem.investigationStatus}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/60">
                <span className="text-slate-500 text-[10px]">Violation Type</span>
                <p className="font-bold text-rose-950 dark:text-rose-200 mt-0.5">
                  {rawItem.violationType}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-[#FAF5EE] dark:bg-gray-800/60 border border-amber-900/10">
                  <span className="text-slate-500 text-[10px]">Location</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {rawItem.reachName} ({rawItem.district})
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-[#FAF5EE] dark:bg-gray-800/60 border border-amber-900/10">
                  <span className="text-slate-500 text-[10px]">Sensor Trigger</span>
                  <p className="font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {rawItem.sensorTriggerId}
                  </p>
                </div>
              </div>

              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 text-amber-900 dark:text-amber-200 text-[11px]">
                <strong>Action Required:</strong> {rawItem.actionRequired}
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate(routes.enforcement.path)}
              className="w-full mt-2 inline-flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
            >
              <span>Investigate Alert</span>
              <ExternalLink size={13} />
            </button>
          </div>
        );

      case "RESTRICTED":
        return (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-border-color">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60">
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {rawItem.zoneName}
                  </h4>
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
                    Prohibited Mining Boundary
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#FAF5EE] dark:bg-gray-800/60 border border-amber-900/10">
                <span className="text-slate-500 text-[10px]">Restriction Reason</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {rawItem.reason}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FAF5EE] dark:bg-gray-800/60 border border-amber-900/10">
                <span className="text-slate-500 text-[10px]">Legal Mandate</span>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
                  {rawItem.ruleCitation}
                </p>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-white dark:bg-gray-900 border border-border-color text-[11px]">
                <span className="text-slate-500">Buffer Radius:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{rawItem.bufferRadiusKm} km</span>
              </div>
            </div>
          </div>
        );

      case "DISTRICT":
        return (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-border-color">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {rawItem.districtName} District
                  </h4>
                  <p className="text-xs text-slate-500 font-mono">{rawItem.districtCode} • {rawItem.riverBasin}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-[#FAF5EE] dark:bg-gray-800/60 border border-amber-900/10">
                <span className="text-slate-500 text-[10px]">Available Reserves</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5 text-sm">
                  {rawItem.availableQuantityMt.toLocaleString()} MT
                </p>
              </div>
              <div className="p-2 rounded-lg bg-[#FAF5EE] dark:bg-gray-800/60 border border-amber-900/10">
                <span className="text-slate-500 text-[10px]">Active Sources</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5 text-sm">
                  {rawItem.activeSources} Reaches
                </p>
              </div>
              <div className="p-2 rounded-lg bg-[#FAF5EE] dark:bg-gray-800/60 border border-amber-900/10">
                <span className="text-slate-500 text-[10px]">Today Dispatch</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {rawItem.dailyDispatchMt.toLocaleString()} MT
                </p>
              </div>
              <div className="p-2 rounded-lg bg-[#FAF5EE] dark:bg-gray-800/60 border border-amber-900/10">
                <span className="text-slate-500 text-[10px]">Compliance</span>
                <p className="font-bold text-emerald-600 mt-0.5">
                  {rawItem.complianceRatePct}%
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-border-color rounded-xl p-4 shadow-xl text-xs select-none max-w-sm w-full ${className}`}
    >
      <div className="flex justify-end mb-1">
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          title="Close Inspector"
        >
          <X size={16} />
        </button>
      </div>
      {renderContent()}
    </div>
  );
};
