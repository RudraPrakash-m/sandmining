import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldAlert,
  ArrowLeft,
  Paperclip,
  MapPin,
  Truck,
  Compass,
  AlertTriangle,
  User,
  FileText,
  Calendar,
} from "lucide-react";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import Card from "@/shared/components/layout/Card/Card";
import Button from "@/shared/components/ui/Button";
import { useStatusModal } from "@/config/theme/StatusModalContext";
import { routes } from "@/app/routes/routeConfig";
import { inputBase, inputNormal } from "@/shared/components/ui/Forms/inputStyles";
import type { AlertType, SeverityLevel } from "../types";

export const AddEnforcementAlert: React.FC = () => {
  const { createAlert, reaches, vehicles } = useSandMining();
  const { showSuccess, showError } = useStatusModal();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    alertId: `ENF-ALT-2026-0${Math.floor(Math.random() * 90) + 10}`,
    alertType: "Illegal Excavation" as AlertType,
    location: "Mahanadi River Floodplain Buffer Zone (21.251° N, 81.630° E)",
    vehicleNumber: "CG-10-CK-9912",
    reachId: reaches[0]?.id || "RCH-001",
    reachName: reaches[0]?.reachName || "Mahanadi Basin Reach Alpha",
    assignedOfficer: "Mining Inspector P. Chandrakar (Flying Squad)",
    severity: "Critical" as SeverityLevel,
    evidencePhotoUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb180c5f7?w=600&auto=format&fit=crop&q=80",
    caseNotes: "Unauthorized night-time machinery movement detected by satellite telemetry outside sanctioned river perimeter.",
  });

  const handleReachChange = (reachId: string) => {
    const r = reaches.find((item) => item.id === reachId);
    setFormData({
      ...formData,
      reachId,
      reachName: r?.reachName || "Selected Mining Reach",
    });
  };

  const handleFileSimulate = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        evidencePhotoUrl: URL.createObjectURL(file),
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.location.trim() || !formData.caseNotes.trim()) {
      showError("Please enter all required incident parameters.");
      return;
    }

    createAlert({
      alertId: formData.alertId,
      alertType: formData.alertType,
      location: formData.location,
      vehicleNumber: formData.vehicleNumber,
      reachId: formData.reachId,
      reachName: formData.reachName,
      assignedOfficer: formData.assignedOfficer,
      severity: formData.severity,
      evidencePhotoUrl: formData.evidencePhotoUrl,
      dateTime: new Date().toISOString().replace("T", " ").substring(0, 16),
      actionStatus: "Squad Assigned",
      caseNotes: formData.caseNotes,
    });

    showSuccess(`Enforcement Alert ${formData.alertId} logged! Flying Squad deployed for physical interception.`);
    navigate(routes.enforcement.path);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* ── Page Header ── */}
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="outline"
          icon={<ArrowLeft size={15} />}
          onClick={() => navigate(routes.enforcement.path)}
        >
          Back to Alerts
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldAlert size={20} className="text-red-600" />
            Raise Anti-Illegal Mining Incident Alert
          </h1>
          <p className="text-xs text-gray-500">
            Immediate dispatch of enforcement flying squad, vehicle interception, and statutory audit logging
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card
          title="Incident Parameters & Violation Record"
          subtitle="All violation alerts create immutable logs per Section 21 of the MMDR Act"
          action={
            <Button action="save" type="submit">
              Raise Alert & Dispatch Squad
            </Button>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            {/* Alert ID */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Alert ID (Auto-Generated)
              </label>
              <input
                type="text"
                value={formData.alertId}
                disabled
                className={`${inputBase} bg-gray-100 dark:bg-gray-800 font-mono font-bold text-red-600 cursor-not-allowed`}
              />
            </div>

            {/* Violation Classification */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                <AlertTriangle size={13} className="text-amber-500" />
                Violation Classification *
              </label>
              <select
                value={formData.alertType}
                onChange={(e) => setFormData({ ...formData, alertType: e.target.value as AlertType })}
                className={`${inputBase} ${inputNormal}`}
              >
                <option value="Illegal Excavation">Illegal Excavation</option>
                <option value="Route Deviation">Route Deviation</option>
                <option value="Geofence Breach">Geofence Breach</option>
                <option value="Overloading">Overloading</option>
                <option value="Unregistered Vehicle">Unregistered Vehicle</option>
                <option value="Expired e-Pass">Expired e-Pass</option>
                <option value="Night-time Mining">Night-time Mining</option>
                <option value="Weighbridge Bypass">Weighbridge Bypass</option>
              </select>
            </div>

            {/* Severity Level */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                <ShieldAlert size={13} className="text-red-500" />
                Severity Level *
              </label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value as SeverityLevel })}
                className={`${inputBase} ${inputNormal}`}
              >
                <option value="Critical">Critical (Immediate Intercept)</option>
                <option value="High">High (Patrol Priority)</option>
                <option value="Moderate">Moderate (Audit Review)</option>
              </select>
            </div>

            {/* Mining Reach / Sector */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                <Compass size={13} className="text-gray-400" />
                Mining Reach / Sector *
              </label>
              <select
                value={formData.reachId}
                onChange={(e) => handleReachChange(e.target.value)}
                className={`${inputBase} ${inputNormal}`}
              >
                {reaches.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.reachName} ({r.district})
                  </option>
                ))}
                <option value="UNLEASED_STRETCH">Non-Leased / Uncharted Riverbed</option>
              </select>
            </div>

            {/* Suspect Vehicle Registration # */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                <Truck size={13} className="text-gray-400" />
                Suspect Vehicle Registration #
              </label>
              <input
                type="text"
                value={formData.vehicleNumber}
                onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                placeholder="e.g. CG-10-CK-9912 or Tractor ID"
                className={`${inputBase} ${inputNormal} font-mono uppercase`}
              />
            </div>

            {/* Assigned Officer / Squad */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                <User size={13} className="text-gray-400" />
                Assigned Squad / Patrol Officer
              </label>
              <input
                type="text"
                value={formData.assignedOfficer}
                onChange={(e) => setFormData({ ...formData, assignedOfficer: e.target.value })}
                placeholder="e.g. Mining Inspector P. Chandrakar"
                className={`${inputBase} ${inputNormal}`}
              />
            </div>

            {/* Incident Location / Coordinates */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                <MapPin size={13} className="text-red-500" />
                Incident Location & GPS Coordinates *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Mahanadi River Floodplain (21.251° N, 81.630° E)"
                className={`${inputBase} ${inputNormal}`}
                required
              />
            </div>

            {/* Evidence Photo Upload */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                <Paperclip size={13} className="text-gray-400" />
                Geotagged Photographic Proof
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSimulate}
                className="block w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer"
              />
            </div>

            {/* Detailed Case Notes */}
            <div className="sm:col-span-2 md:col-span-3">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                <FileText size={13} className="text-gray-400" />
                Field Evidence, Interception Log & Observation Notes *
              </label>
              <textarea
                rows={4}
                value={formData.caseNotes}
                onChange={(e) => setFormData({ ...formData, caseNotes: e.target.value })}
                placeholder="Provide detailed incident facts, telemetry timestamps, observed machinery, and flying squad instructions..."
                className={`${inputBase} ${inputNormal}`}
                required
              />
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default AddEnforcementAlert;
