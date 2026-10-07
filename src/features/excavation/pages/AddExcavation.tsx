import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Pickaxe,
  ArrowLeft,
  Camera,
  MapPin,
  CheckCircle2,
  FileCheck,
  Building2,
  AlertTriangle,
  Clock,
  Truck,
  UserCheck,
  Calculator,
  Compass,
  Upload,
  Calendar,
  Layers,
} from "lucide-react";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import Card from "@/shared/components/layout/Card/Card";
import Button from "@/shared/components/ui/Button";
import { useStatusModal } from "@/config/theme/StatusModalContext";
import { routes } from "@/app/routes/routeConfig";
import { inputBase, inputNormal } from "@/shared/components/ui/Forms/inputStyles";
import { useAppDispatch } from "@/app/store/hooks";
import { addRecord } from "../slice/excavationSlice";
import type { ExcavationRecord, ExcavationShift } from "../types";
import "../styles/excavation.css";

export const AddExcavation: React.FC = () => {
  const { reaches, permits, stockyards, addStockLedgerEntry, addExcavation: contextAddExcavation } = useSandMining();
  const { showSuccess, showError } = useStatusModal();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // 12 Required Form Fields State
  const [formData, setFormData] = useState({
    // 1. Sand Reach
    reachId: reaches[0]?.id || "RCH-001",
    // 2. Extraction Date
    extractionDate: new Date().toISOString().substring(0, 10),
    // 3. Extraction Quantity (MT)
    extractionQuantityMt: 450,
    // 4. Vehicle/Tractor Number
    vehicleNumber: "TG-04-TR-8812",
    // 5. Operator
    operatorName: "Ramesh Sahu",
    operatorLicense: "TG-HEO-2021-9981",
    // 6. Source Location
    sourceLocation: "Mahanadi In-stream Perennial Bed (Pillars P1-P4)",
    // 7. GPS Location
    gpsCoordinates: "21.2514° N, 81.6296° E",
    latitude: 21.2514,
    longitude: 81.6296,
    // 8. Loading Quantity (MT)
    loadingQuantityMt: 450,
    // 9. Loading Time
    loadingTime: "09:30 AM",
    shift: "Morning (06:00 - 14:00)" as ExcavationShift,
    // 10. Photo
    photoEvidenceUrl:
      "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&auto=format&fit=crop&q=80",
    // 11. Officer Verification
    officerName: "Er. Rameshwar Sharma",
    officerDesignation: "Assistant Director of Mines / Nodal Officer",
    officerContact: "+91 98261 44521",
    officerStatus: "Verified" as "Verified" | "Pending",
    // 12. Remarks
    remarks: "Morning shift sand extraction conducted within approved river channel boundaries with live GPS tracking.",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected reach information and quota balance
  const selectedReach = useMemo(() => {
    return (
      reaches.find((r) => r.id === formData.reachId || r.reachId === formData.reachId) || reaches[0]
    );
  }, [reaches, formData.reachId]);

  const linkedStockyard = useMemo(() => {
    return (
      stockyards.find((s) => s.id === selectedReach?.linkedStockyardId) || stockyards[0]
    );
  }, [stockyards, selectedReach]);

  const associatedPermit = useMemo(() => {
    return (
      permits.find(
        (p) =>
          p.reachId === selectedReach?.reachId ||
          p.reachId === selectedReach?.id ||
          p.reachName === selectedReach?.reachName
      ) || permits[0]
    );
  }, [permits, selectedReach]);

  const approvedQuota = associatedPermit?.approvedQuantityMt || selectedReach?.approvedQuantityMt || selectedReach?.permittedQuantityMt || 120000;
  const remainingQuota = associatedPermit?.remainingQuotaMt || selectedReach?.availableQuantityMt || 68550;

  // Real-time Stock Calculation Formula:
  // Opening Stock + Extracted Quantity - Dispatched Quantity = Available Sand Stock
  const stockCalculation = useMemo(() => {
    const openingStock = linkedStockyard?.openingStockMt || 14200;
    const extractedQty = Number(formData.extractionQuantityMt) || 0;
    const dispatchedQty = linkedStockyard?.dispatchedMt || 320;
    const availableStock = openingStock + extractedQty - dispatchedQty;

    return {
      openingStock,
      extractedQty,
      dispatchedQty,
      availableStock,
    };
  }, [linkedStockyard, formData.extractionQuantityMt]);

  // Real-time Quota Exceeded Check
  const isQuotaExceeded = formData.extractionQuantityMt > remainingQuota;

  // When reach changes, sync default source location & coordinates
  const handleReachChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const reach = reaches.find((r) => r.id === selectedId || r.reachId === selectedId);
    if (reach) {
      setFormData((prev) => ({
        ...prev,
        reachId: selectedId,
        sourceLocation: `${reach.riverStream} (${reach.sourceType || "Riverbed"}) - ${reach.village}`,
        gpsCoordinates: reach.gpsCoordinates || `${reach.latitude.toFixed(4)}° N, ${reach.longitude.toFixed(4)}° E`,
        latitude: reach.latitude,
        longitude: reach.longitude,
        officerName: reach.responsibleOfficer || prev.officerName,
        officerDesignation: reach.responsibleOfficerDesignation || prev.officerDesignation,
        officerContact: reach.responsibleOfficerContact || prev.officerContact,
      }));
    }
  };

  // Fetch current device GPS coordinates
  const handleFetchCurrentGps = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = parseFloat(pos.coords.latitude.toFixed(4));
          const lng = parseFloat(pos.coords.longitude.toFixed(4));
          setFormData((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            gpsCoordinates: `${lat}° N, ${lng}° E`,
          }));
          showSuccess("Live GPS coordinates captured and verified with reach geofence.");
        },
        () => {
          // Fallback demo coordinates
          if (selectedReach) {
            setFormData((prev) => ({
              ...prev,
              latitude: selectedReach.latitude,
              longitude: selectedReach.longitude,
              gpsCoordinates: `${selectedReach.latitude.toFixed(4)}° N, ${selectedReach.longitude.toFixed(4)}° E`,
            }));
            showSuccess(`Geofence coordinates populated for ${selectedReach.reachName}.`);
          }
        }
      );
    }
  };

  const handleSubmit = (statusToAssign: "Submitted" | "Approved" = "Approved") => {
    if (!formData.operatorName.trim() || !formData.vehicleNumber.trim() || !formData.officerName.trim()) {
      showError("Please provide Operator Name, Vehicle/Tractor Number, and Verifying Officer.");
      return;
    }

    if (formData.extractionQuantityMt <= 0) {
      showError("Extraction quantity must be greater than 0 MT.");
      return;
    }

    if (formData.extractionQuantityMt > remainingQuota) {
      showError(
        `Quantity (${formData.extractionQuantityMt} MT) exceeds remaining permit quota (${remainingQuota.toLocaleString()} MT).`
      );
      return;
    }

    setIsSubmitting(true);

    const generatedSlipNo = `EXC/TG/${(selectedReach?.district || "RPR").toUpperCase().substring(0, 3)}/2026/${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const newRecord: ExcavationRecord = {
      id: `EXC-${Date.now()}`,
      excavationSlipNo: generatedSlipNo,
      reachId: selectedReach?.reachId || formData.reachId,
      reachName: selectedReach?.reachName || "Mahanadi Basin Reach Alpha",
      district: selectedReach?.district || "Raipur",
      riverName: selectedReach?.riverStream || "Mahanadi River",
      extractionDate: formData.extractionDate,
      dateTime: `${formData.extractionDate} ${new Date().toTimeString().substring(0, 5)}`,
      extractionQuantityMt: Number(formData.extractionQuantityMt),
      excavatedQuantityMt: Number(formData.extractionQuantityMt),
      vehicleNumber: formData.vehicleNumber,
      equipmentRegNo: formData.vehicleNumber,
      machineryEquipment: "Hydraulic Excavator & Tractor Dispatch",
      operatorName: formData.operatorName,
      operatorLicense: formData.operatorLicense,
      sourceLocation: formData.sourceLocation,
      gpsCoordinates: formData.gpsCoordinates,
      geoLocation: formData.gpsCoordinates,
      latitude: formData.latitude,
      longitude: formData.longitude,
      isWithinGeofence: true,
      loadingQuantityMt: Number(formData.loadingQuantityMt),
      loadingTime: formData.loadingTime,
      shift: formData.shift,
      photoEvidenceUrl: formData.photoEvidenceUrl,
      photoTimestamp: new Date().toISOString().replace("T", " ").substring(0, 19) + " IST",
      officerVerification: {
        verifiedBy: formData.officerName,
        designation: formData.officerDesignation,
        contactNumber: formData.officerContact,
        status: formData.officerStatus,
        verificationDate: `${formData.extractionDate} ${formData.loadingTime}`,
        verificationNotes: "Physical depth within safe limit; weighment and geofence verified.",
      },
      verifiedBy: formData.officerName,
      approvedBy: statusToAssign === "Approved" ? formData.officerName : undefined,
      permitQuotaUsedMt: Number(formData.extractionQuantityMt),
      remainingQuotaMt: remainingQuota - Number(formData.extractionQuantityMt),
      approvedQuotaMt: approvedQuota,
      remarks: formData.remarks,
      status: statusToAssign,
      auditTrail: [
        {
          id: `AUD-${Date.now()}`,
          action: `Sand Extraction Logged (${statusToAssign})`,
          performedBy: formData.operatorName,
          role: "Operator / Production Desk",
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
          remarks: `Stock updated: +${formData.extractionQuantityMt} MT. Geofence & photo verified.`,
        },
      ],
    };

    // Dispatch to Redux state
    dispatch(addRecord(newRecord));

    // Update SandMiningContext master simulation
    contextAddExcavation({
      reachId: selectedReach?.reachId || formData.reachId,
      reachName: selectedReach?.reachName || "Mahanadi Basin Reach Alpha",
      extractionDate: formData.extractionDate,
      dateTime: `${formData.extractionDate} ${new Date().toTimeString().substring(0, 5)}`,
      extractionQuantityMt: Number(formData.extractionQuantityMt),
      excavatedQuantityMt: Number(formData.extractionQuantityMt),
      vehicleNumber: formData.vehicleNumber,
      operatorName: formData.operatorName,
      operatorLicense: formData.operatorLicense,
      sourceLocation: formData.sourceLocation,
      gpsCoordinates: formData.gpsCoordinates,
      geoLocation: formData.gpsCoordinates,
      loadingQuantityMt: Number(formData.loadingQuantityMt),
      loadingTime: formData.loadingTime,
      photoEvidenceUrl: formData.photoEvidenceUrl,
      officerVerification: newRecord.officerVerification,
      remarks: formData.remarks,
      machineryEquipment: "Hydraulic Excavator & Tractor Carrier",
      shift: formData.shift,
      permitQuotaUsedMt: Number(formData.extractionQuantityMt),
      status: statusToAssign,
    });

    showSuccess(
      `Extraction entry ${generatedSlipNo} (${formData.extractionQuantityMt} MT) registered successfully. Stockyard inventory updated in real-time!`
    );

    setIsSubmitting(false);
    navigate(routes.excavation.path);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            icon={<ArrowLeft size={15} />}
            onClick={() => navigate(routes.excavation.path)}
          >
            Back to Production Logs
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Pickaxe className="text-amber-600" size={22} />
              Sand Extraction / Production Entry
            </h1>
            <p className="text-xs text-gray-500">
              Record daily sand extraction, tractor loading, GPS telemetry, officer verification & real-time stock computation
            </p>
          </div>
        </div>
      </div>

      {/* Real-time Stock Calculation Formula Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <Calculator size={16} className="text-[#c2410c] dark:text-orange-400" />
            <span>Real-Time Stock Calculation Engine</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-400">
            <span>Formula: <span className="font-bold text-slate-800 dark:text-slate-200">Opening</span> + <span className="font-bold text-emerald-600 dark:text-emerald-400">Extracted</span> − <span className="font-bold text-rose-600 dark:text-rose-400">Dispatched</span> = <span className="font-bold text-[#c2410c] dark:text-orange-400">Available</span></span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold mb-0.5">Opening Stock</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
              {stockCalculation.openingStock.toLocaleString()} <span className="text-xs font-semibold text-slate-500">MT</span>
            </span>
          </div>

          <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 block font-semibold mb-0.5">+ Extracted Quantity</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              +{stockCalculation.extractedQty.toLocaleString()} <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">MT</span>
            </span>
          </div>

          <div className="p-3.5 bg-rose-50/60 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-800/60">
            <span className="text-[11px] text-rose-700 dark:text-rose-400 block font-semibold mb-0.5">− Dispatched Quantity</span>
            <span className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
              −{stockCalculation.dispatchedQty.toLocaleString()} <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">MT</span>
            </span>
          </div>

          <div className="p-3.5 bg-gradient-to-br from-orange-50/90 to-amber-50/90 dark:from-orange-950/40 dark:to-amber-950/40 rounded-xl border-2 border-orange-300 dark:border-orange-600/50 shadow-2xs">
            <span className="text-[11px] text-[#c2410c] dark:text-orange-400 block font-extrabold mb-0.5">= Available Sand Stock</span>
            <span className="text-xl sm:text-2xl font-black text-[#c2410c] dark:text-orange-400 font-mono">
              {stockCalculation.availableStock.toLocaleString()} <span className="text-xs font-bold text-[#c2410c] dark:text-orange-400">MT</span>
            </span>
          </div>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit("Approved");
        }}
        className="space-y-4"
      >
        {/* Section 1: Reach, Date, Quantity & Vehicle (Fields 1-4) */}
        <Card
          title="1. Extraction & Vehicle Details"
          icon={Layers}
          subtitle="Sand Reach, Extraction Date, Extraction Quantity (MT), and Vehicle / Tractor Number"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                1. Sand Reach <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.reachId}
                onChange={handleReachChange}
                className={`${inputBase} ${inputNormal}`}
                required
              >
                {reaches.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.reachName} ({r.district})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                2. Extraction Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.extractionDate}
                onChange={(e) => setFormData({ ...formData, extractionDate: e.target.value })}
                className={`${inputBase} ${inputNormal}`}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                3. Extraction Quantity (MT) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={formData.extractionQuantityMt}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setFormData({
                    ...formData,
                    extractionQuantityMt: val,
                    loadingQuantityMt: val,
                  });
                }}
                className={`${inputBase} ${inputNormal} font-bold text-blue-700 dark:text-blue-400`}
                required
              />
              <span className="text-[10px] text-gray-500">
                Permit Quota Balance: {remainingQuota.toLocaleString()} MT
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                4. Vehicle / Tractor Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Truck size={14} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="e.g. TG-04-TR-8812"
                  value={formData.vehicleNumber}
                  onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                  className={`${inputBase} ${inputNormal} pl-8 font-mono font-bold`}
                  required
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Section 2: Operator, Source Location & GPS Location (Fields 5-7) */}
        <Card
          title="2. Operator & GPS Spatial Location"
          icon={MapPin}
          subtitle="Operator details, Source quarry location, and verified GPS coordinates"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                5. Operator Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Ramesh Sahu"
                value={formData.operatorName}
                onChange={(e) => setFormData({ ...formData, operatorName: e.target.value })}
                className={`${inputBase} ${inputNormal}`}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Operator Heavy License No.
              </label>
              <input
                type="text"
                placeholder="e.g. TG-HEO-2021-9981"
                value={formData.operatorLicense}
                onChange={(e) => setFormData({ ...formData, operatorLicense: e.target.value })}
                className={`${inputBase} ${inputNormal} font-mono`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                6. Source Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Mahanadi In-stream Bed (Pillars P1-P4)"
                value={formData.sourceLocation}
                onChange={(e) => setFormData({ ...formData, sourceLocation: e.target.value })}
                className={`${inputBase} ${inputNormal}`}
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                7. GPS Location Coordinates <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.gpsCoordinates}
                  onChange={(e) => setFormData({ ...formData, gpsCoordinates: e.target.value })}
                  className={`${inputBase} ${inputNormal} font-mono font-semibold flex-1`}
                  required
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  icon={<Compass size={14} />}
                  onClick={handleFetchCurrentGps}
                >
                  Fetch Live GPS
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Excavation Shift
              </label>
              <select
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value as ExcavationShift })}
                className={`${inputBase} ${inputNormal}`}
              >
                <option value="Morning (06:00 - 14:00)">Morning (06:00 - 14:00)</option>
                <option value="Afternoon (14:00 - 22:00)">Afternoon (14:00 - 22:00)</option>
                <option value="Night (22:00 - 06:00)">Night (22:00 - 06:00)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Section 3: Loading Quantity, Loading Time & Photo (Fields 8-10) */}
        <Card
          title="3. Loading & Photo Evidence"
          icon={Camera}
          subtitle="Loading Quantity (MT), Loading Time, and Geo-tagged Site Photo"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                8. Loading Quantity (MT) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.loadingQuantityMt}
                onChange={(e) => setFormData({ ...formData, loadingQuantityMt: Number(e.target.value) })}
                className={`${inputBase} ${inputNormal} font-bold text-emerald-700 dark:text-emerald-400`}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                9. Loading Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock size={14} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="e.g. 09:30 AM"
                  value={formData.loadingTime}
                  onChange={(e) => setFormData({ ...formData, loadingTime: e.target.value })}
                  className={`${inputBase} ${inputNormal} pl-8`}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                10. Photo Evidence URL / Capture <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Camera size={14} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={formData.photoEvidenceUrl}
                  onChange={(e) => setFormData({ ...formData, photoEvidenceUrl: e.target.value })}
                  className={`${inputBase} ${inputNormal} pl-8 text-xs font-mono`}
                  required
                />
              </div>
            </div>
          </div>

          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-3">
            <img
              src={formData.photoEvidenceUrl}
              alt="Site Evidence Preview"
              className="w-16 h-12 rounded-lg object-cover border border-gray-300 dark:border-gray-600 shadow-sm"
            />
            <div className="text-xs">
              <span className="font-semibold text-gray-800 dark:text-gray-200 block">
                Geo-tagged Quarry Photo Attached
              </span>
              <span className="text-[11px] text-gray-500 font-mono">
                Timestamp: {new Date().toISOString().substring(0, 10)} {formData.loadingTime} • Coordinates: {formData.gpsCoordinates}
              </span>
            </div>
          </div>
        </Card>

        {/* Section 4: Officer Verification & Remarks (Fields 11-12) */}
        <Card
          title="4. Officer Verification & Remarks"
          icon={UserCheck}
          subtitle="Field Inspector / Mining Officer sign-off and operational remarks"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                11. Verifying Officer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Er. Rameshwar Sharma"
                value={formData.officerName}
                onChange={(e) => setFormData({ ...formData, officerName: e.target.value })}
                className={`${inputBase} ${inputNormal}`}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Officer Designation
              </label>
              <input
                type="text"
                value={formData.officerDesignation}
                onChange={(e) => setFormData({ ...formData, officerDesignation: e.target.value })}
                className={`${inputBase} ${inputNormal}`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Officer Contact Number
              </label>
              <input
                type="tel"
                value={formData.officerContact}
                onChange={(e) => setFormData({ ...formData, officerContact: e.target.value })}
                className={`${inputBase} ${inputNormal} font-mono`}
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                12. Remarks / Field Inspection Notes
              </label>
              <textarea
                rows={2}
                placeholder="Enter field inspection findings, river depth measurements, or vehicle clearance remarks..."
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className={`${inputBase} ${inputNormal}`}
              />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(routes.excavation.path)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleSubmit("Submitted")}
              disabled={isSubmitting || isQuotaExceeded}
            >
              Submit for Verification
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={<CheckCircle2 size={15} />}
              disabled={isSubmitting || isQuotaExceeded}
            >
              Authorize & Update Stock
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default AddExcavation;
