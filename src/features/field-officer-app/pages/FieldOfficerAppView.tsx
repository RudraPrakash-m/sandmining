import React, { useState } from "react";
import {
  QrCode,
  Scale,
  AlertOctagon,
  Navigation,
  Camera,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  FileCheck,
  Pickaxe,
  SlidersHorizontal,
} from "lucide-react";
import Button from "@/shared/components/ui/Button";
import Badge from "@/shared/components/ui/Badge";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import { useStatusModal } from "@/config/theme/StatusModalContext";
import { inputBase, inputNormal } from "@/shared/components/ui/Forms/inputStyles";
import type {
  ReachInspectionData,
  PermitVerificationData,
  ExcavationEntryData,
  PhotoEvidenceItem,
  WeighbridgeVerificationData,
  IllegalMiningAlertData,
  OfflineSyncQueueItem,
  GeoLocationStamp,
} from "../types";
import "../styles/fieldOfficer.css";

export const FieldOfficerAppView: React.FC = () => {
  const { createAlert } = useSandMining();
  const { showSuccess, showError, showWarning } = useStatusModal();

  // ── 1. Global Field Officer Device State ─────────────────────────────
  const [isSyncing, setIsSyncing] = useState(false);

  const [activeTab, setActiveTab] = useState<
    "reach" | "permit" | "excavation" | "scan" | "weigh" | "photo" | "incident" | "sync"
  >("reach");

  // ── 2. Live GPS Location State ───────────────────────────────────────
  const [gpsLocation, setGpsLocation] = useState<GeoLocationStamp>({
    latitude: 21.1945,
    longitude: 81.9685,
    accuracyMeters: 2.8,
    locationName: "Mahanadi Reach RP-01, Arang, Raipur District",
    timestamp: "10 Sep 2026, 11:32:45 AM",
    isWithinGeofence: true,
  });
  const [isGpsCapturing, setIsGpsCapturing] = useState(false);

  // ── 3. Offline Sync Queue State ──────────────────────────────────────
  const [syncQueue, setSyncQueue] = useState<OfflineSyncQueueItem[]>([
    {
      id: "SYNC-01",
      type: "REACH_INSPECTION",
      summary: "Mahanadi Reach RP-01 Morning Audit (Boundary verified)",
      createdAt: "10 Sep 2026, 10:15 AM",
      payload: { reachId: "CG-RP-MAH-01", status: "Compliant" },
      syncStatus: "Pending",
    },
    {
      id: "SYNC-02",
      type: "QR_SCAN",
      summary: "Vehicle CG 04 HA 4321 e-Pass verification",
      createdAt: "10 Sep 2026, 10:45 AM",
      payload: { passNumber: "EPASS-2026-1049", result: "Cleared" },
      syncStatus: "Pending",
    },
  ]);

  // ── 4. Reach Inspection State ────────────────────────────────────────
  const [reachInspection, setReachInspection] = useState<ReachInspectionData>({
    reachId: "CG-RP-MAH-01",
    reachName: "Mahanadi Sand Reach 01",
    district: "Raipur",
    riverStream: "Mahanadi River",
    inspectionDate: "2026-09-10",
    inspectorName: "Inspector R. Verma",
    boundaryPillarsIntact: true,
    depthMarkersVerified: true,
    maxPermissibleDepthM: 3.0,
    measuredDepthM: 2.2,
    waterDepthSafetyCompliant: true,
    cctvFunctional: true,
    poclainsActive: 2,
    tippersActive: 6,
    environmentalComplianceStatus: "Compliant",
    remarks: "All 4 boundary GPS pillars are intact. Riverbed depth is within statutory 3.0m limit.",
  });

  // ── 5. Permit Verification State ─────────────────────────────────────
  const [searchPermitId, setSearchPermitId] = useState("PRM-CG-2026-0881");
  const [verifiedPermit, setVerifiedPermit] = useState<PermitVerificationData | null>({
    permitId: "PRM-CG-2026-0881",
    contractorName: "Chhattisgarh Riverbed Mining Infra Ltd.",
    reachId: "CG-RP-MAH-01",
    reachName: "Mahanadi Sand Reach 01",
    district: "Raipur",
    validFrom: "01 Jan 2026",
    validTo: "31 Dec 2026",
    approvedQuotaMt: 250000,
    excavatedSoFarMt: 142800,
    balanceQuotaMt: 107200,
    royaltyPaidStatus: "Paid & Verified",
    environmentalClearanceRef: "EC/SEIAA/CG/MIN/2025/1104",
    isValid: true,
  });

  // ── 6. Excavation Entry State ────────────────────────────────────────
  const [excavationEntry, setExcavationEntry] = useState<ExcavationEntryData>({
    entryId: "EXC-2026-0910-01",
    reachId: "CG-RP-MAH-01",
    entryDate: "2026-09-10",
    shift: "Morning (06:00 - 14:00)",
    poclainsDeployed: 2,
    excavationDepthM: 2.2,
    excavatedVolumeMt: 420,
    dailyTargetMt: 500,
    cumulativeExcavatedMt: 143220,
    supervisorName: "S. K. Dewangan",
    gpsCoordinates: "21.1945° N, 81.9685° E",
    isSynced: true,
  });

  // ── 7. Vehicle / QR Scan State ───────────────────────────────────────
  const [scannedCode, setScannedCode] = useState("EPASS-2026-1049");
  const [verifiedPass, setVerifiedPass] = useState<any>({
    ePassNumber: "EPASS-2026-1049",
    vehicleNumber: "CG 04 HA 4321",
    quantityMt: 28.5,
    driverName: "Rameshwar Sahu",
    driverMobile: "+91 98271 88401",
    source: "Mahanadi Reach RP-01",
    destination: "Raipur Central Depot",
    slipNumber: "WB-SLIP-2026-9041",
    validUntil: "10 Sep 2026, 16:30 PM",
    status: "Active",
    isValid: true,
  });

  // ── 8. Weighbridge Spot Verification State ───────────────────────────
  const [weighSlipNumber, setWeighSlipNumber] = useState("WB-SLIP-2026-9041");
  const [weighVehicle, setWeighVehicle] = useState("CG 04 HA 4321");
  const [spotGrossMt, setSpotGrossMt] = useState("34.5");
  const [spotTareMt, setSpotTareMt] = useState("6.0");
  const [weighResult, setWeighResult] = useState<WeighbridgeVerificationData | null>({
    slipSerialNumber: "WB-SLIP-2026-9041",
    vehicleNumber: "CG 04 HA 4321",
    ePassNumber: "EPASS-2026-1049",
    weighbridgeName: "Arang Integrated Toll & Weighbridge #02",
    grossWeightMt: 34.5,
    tareWeightMt: 6.0,
    netWeightMt: 28.5,
    permissibleNetMt: 28.5,
    overloadMt: 0,
    isOverloaded: false,
    penaltyAmountInr: 0,
    weighmentTime: "10 Sep 2026, 11:20 AM",
    operatorId: "WB-OP-08",
  });

  // ── 9. Photo / Video Evidence State ──────────────────────────────────
  const [photoTitle, setPhotoTitle] = useState("Boundary Pillar #4 Intactness Verification");
  const [photoCategory, setPhotoCategory] = useState<PhotoEvidenceItem["category"]>("Reach Boundary");
  const [photoEvidenceList, setPhotoEvidenceList] = useState<PhotoEvidenceItem[]>([
    {
      id: "PHT-101",
      title: "Pillar #4 Geotagged Reach Marker",
      category: "Reach Boundary",
      timestamp: "10 Sep 2026, 10:12 AM",
      gpsCoordinates: "21.1945° N, 81.9685° E",
      locationName: "Mahanadi Sector 3 Reach",
      officerId: "OFF-CG-882",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1541888946425-d0fbb180c5f7?w=600&auto=format&fit=crop&q=80",
      fileSizeKb: 1420,
    },
    {
      id: "PHT-102",
      title: "Riverbed Depth Scale Reading 2.2m",
      category: "Depth Gauge",
      timestamp: "10 Sep 2026, 10:28 AM",
      gpsCoordinates: "21.1950° N, 81.9692° E",
      locationName: "Mahanadi Channel Central",
      officerId: "OFF-CG-882",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=600&auto=format&fit=crop&q=80",
      fileSizeKb: 1840,
    },
  ]);

  // ── 10. Incident / Illegal Mining Alert State ─────────────────────────
  const [incidentData, setIncidentData] = useState<IllegalMiningAlertData>({
    alertId: "ENF-ALT-2026-091",
    violationType: "Illegal Excavation",
    severity: "Critical",
    location: "Mahanadi Riverbed Sector 7 (Arang Buffer Zone)",
    coordinates: "21.1820° N, 81.8950° E",
    suspectVehicleNumber: "CG 07 EF 2468",
    suspectMachinery: "1x Unregistered Hydraulic Poclain + 2x Tippers",
    estimatedVolumeMt: 85,
    officerNotes:
      "Unauthorized mechanical dredging observed beyond permissible boundary line outside designated reach daylight hours.",
    reportedAt: "10 Sep 2026, 11:30 AM",
    actionStatus: "Radar Transmitted",
  });

  // ── ACTIONS & HANDLERS ───────────────────────────────────────────────

  // 1. Capture GPS
  const handleCaptureGps = () => {
    setIsGpsCapturing(true);
    setTimeout(() => {
      const now = new Date();
      setGpsLocation({
        latitude: Number((21.1945 + (Math.random() - 0.5) * 0.002).toFixed(5)),
        longitude: Number((81.9685 + (Math.random() - 0.5) * 0.002).toFixed(5)),
        accuracyMeters: Number((2.1 + Math.random() * 1.5).toFixed(1)),
        locationName: "Mahanadi Reach RP-01, Arang, Raipur District",
        timestamp: `${now.toLocaleDateString("en-GB")} ${now.toLocaleTimeString()}`,
        isWithinGeofence: true,
      });
      setIsGpsCapturing(false);
      showSuccess("GPS coordinates locked with satellite fix (Accuracy: ±2.4m)!");
    }, 600);
  };

  // 2. Submit Reach Inspection
  const handleSubmitReachInspection = (e: React.FormEvent) => {
    e.preventDefault();
    const item: OfflineSyncQueueItem = {
      id: `SYNC-${Date.now().toString().slice(-4)}`,
      type: "REACH_INSPECTION",
      summary: `Inspection submitted for ${reachInspection.reachName} (${reachInspection.environmentalComplianceStatus})`,
      createdAt: new Date().toLocaleTimeString(),
      payload: reachInspection,
      syncStatus: "Synced",
    };

    setSyncQueue((prev) => [item, ...prev]);
    showSuccess(`Reach Inspection for "${reachInspection.reachName}" submitted and synchronized with Central Mining Portal!`);
  };

  // 3. Verify Permit
  const handleVerifyPermit = () => {
    if (searchPermitId.trim().toUpperCase() === "PRM-CG-2026-0881") {
      setVerifiedPermit({
        permitId: "PRM-CG-2026-0881",
        contractorName: "Chhattisgarh Riverbed Mining Infra Ltd.",
        reachId: "CG-RP-MAH-01",
        reachName: "Mahanadi Sand Reach 01",
        district: "Raipur",
        validFrom: "01 Jan 2026",
        validTo: "31 Dec 2026",
        approvedQuotaMt: 250000,
        excavatedSoFarMt: 142800,
        balanceQuotaMt: 107200,
        royaltyPaidStatus: "Paid & Verified",
        environmentalClearanceRef: "EC/SEIAA/CG/MIN/2025/1104",
        isValid: true,
      });
      showSuccess(`Permit ${searchPermitId} verified! Balance sand quota: 107,200 MT.`);
    } else {
      setVerifiedPermit(null);
      showError(`Permit "${searchPermitId}" not recognized or expired. Verify original mining lease certificate.`);
    }
  };

  // 4. Submit Excavation Entry
  const handleSubmitExcavation = (e: React.FormEvent) => {
    e.preventDefault();
    if (excavationEntry.excavationDepthM > 3.0) {
      showWarning("Warning: Excavation depth exceeds statutory 3.0m environmental threshold!");
    }

    const item: OfflineSyncQueueItem = {
      id: `SYNC-${Date.now().toString().slice(-4)}`,
      type: "EXCAVATION_ENTRY",
      summary: `Daily excavation entry: ${excavationEntry.excavatedVolumeMt} MT (Depth: ${excavationEntry.excavationDepthM}m)`,
      createdAt: new Date().toLocaleTimeString(),
      payload: excavationEntry,
      syncStatus: "Synced",
    };

    setSyncQueue((prev) => [item, ...prev]);
    showSuccess(`Excavation entry ${excavationEntry.entryId} logged and transmitted to State Sand Ledger!`);
  };

  // 5. Scan QR & Verify e-Pass
  const handleVerifyQR = () => {
    const code = scannedCode.trim().toUpperCase();
    if (code === "EPASS-2026-1049" || code === "EPASS-CG-2026-1049") {
      setVerifiedPass({
        ePassNumber: "EPASS-2026-1049",
        vehicleNumber: "CG 04 HA 4321",
        quantityMt: 28.5,
        driverName: "Rameshwar Sahu",
        driverMobile: "+91 98271 88401",
        source: "Mahanadi Reach RP-01",
        destination: "Raipur Central Depot",
        slipNumber: "WB-SLIP-2026-9041",
        validUntil: "10 Sep 2026, 16:30 PM",
        status: "Active",
        isValid: true,
      });
      showSuccess("Digital e-Pass QR verified! Vehicle cleared for transit.");
    } else {
      setVerifiedPass(null);
      showError(`QR scan failed: e-Pass "${scannedCode}" invalid or unrecorded. Intercept vehicle immediately!`);
    }
  };

  // 6. Spot Weighment Check
  const handleCalculateWeighment = () => {
    const gross = parseFloat(spotGrossMt) || 0;
    const tare = parseFloat(spotTareMt) || 0;
    const net = Number((gross - tare).toFixed(2));
    const allowed = 28.5;
    const isOver = net > allowed;
    const overload = isOver ? Number((net - allowed).toFixed(2)) : 0;
    const penalty = isOver ? overload * 5000 + 10000 : 0;

    setWeighResult({
      slipSerialNumber: weighSlipNumber,
      vehicleNumber: weighVehicle,
      ePassNumber: scannedCode,
      weighbridgeName: "Arang Integrated Checkpost Scale",
      grossWeightMt: gross,
      tareWeightMt: tare,
      netWeightMt: net,
      permissibleNetMt: allowed,
      overloadMt: overload,
      isOverloaded: isOver,
      penaltyAmountInr: penalty,
      weighmentTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      operatorId: "INSP-VERMA",
    });

    if (isOver) {
      showError(`Overload breach! Net weight ${net} MT exceeds e-Pass limit by ${overload} MT. Statutory penalty: ₹${penalty.toLocaleString("en-IN")}`);
    } else {
      showSuccess(`Spot weighment within tolerance (Net: ${net} MT). Clearance pass issued.`);
    }
  };

  // 7. Capture Photo Evidence
  const handleCapturePhoto = () => {
    const newPhoto: PhotoEvidenceItem = {
      id: `PHT-${Date.now().toString().slice(-4)}`,
      title: photoTitle || "Geotagged Field Inspection Photo",
      category: photoCategory,
      timestamp: gpsLocation.timestamp,
      gpsCoordinates: `${gpsLocation.latitude.toFixed(4)}° N, ${gpsLocation.longitude.toFixed(4)}° E`,
      locationName: gpsLocation.locationName,
      officerId: "OFF-CG-882",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1541888946425-d0fbb180c5f7?w=600&auto=format&fit=crop&q=80",
      fileSizeKb: 1560,
    };

    setPhotoEvidenceList((prev) => [newPhoto, ...prev]);
    showSuccess(`Geo-tagged evidence photo captured with GPS watermark: [${newPhoto.gpsCoordinates}]!`);
  };

  // 8. Raise Illegal Mining Alert
  const handleRaiseAlert = (e: React.FormEvent) => {
    e.preventDefault();
    createAlert({
      alertId: incidentData.alertId,
      alertType: incidentData.violationType as any,
      location: incidentData.location,
      vehicleNumber: incidentData.suspectVehicleNumber || "Unregistered",
      assignedOfficer: "Inspector Rajesh Verma (Flying Squad)",
      severity: incidentData.severity,
      evidencePhotoUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb180c5f7?w=600&auto=format&fit=crop&q=80",
      dateTime: new Date().toISOString().replace("T", " ").substring(0, 16),
      actionStatus: "Squad Assigned",
      caseNotes: incidentData.officerNotes,
    });

    const queueItem: OfflineSyncQueueItem = {
      id: `SYNC-ALT-${Date.now().toString().slice(-4)}`,
      type: "ALERT",
      summary: `Critical Alert: ${incidentData.violationType} at ${incidentData.location}`,
      createdAt: new Date().toLocaleTimeString(),
      payload: incidentData,
      syncStatus: "Synced",
    };

    setSyncQueue((prev) => [queueItem, ...prev]);
    showSuccess(`🚨 Critical Enforcement Alert ${incidentData.alertId} broadcast to Central Command & Flying Squad!`);
  };

  // 9. Sync Offline Queue
  const handleSyncNow = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setSyncQueue((prev) => prev.map((item) => ({ ...item, syncStatus: "Synced" })));
      setIsSyncing(false);
      showSuccess("All offline inspection records synchronized successfully with conflict resolution!");
    }, 900);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* ── Top Header & Field Officer Operational Ribbon ──────── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border-color shadow-2xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-primary/10 text-primary text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Field Officer Operations
            </span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Reach, Stockyard & Enforcement Terminal
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Field Officer Mobile Operations Hub
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Officer: <span className="font-bold text-slate-700 dark:text-slate-200">Inspector R. Verma</span> (Flying Squad) • Assigned: <span className="font-semibold text-slate-700 dark:text-slate-200">Mahanadi Basin Checkpost #CG-M-08</span>
          </p>
        </div>

        {/* Status Actions: GPS Lock & Sync */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Live GPS Lock Indicator */}
          <button
            type="button"
            onClick={handleCaptureGps}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border-color bg-slate-50 dark:bg-gray-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Click to capture fresh GPS fix"
          >
            <Navigation size={14} className={isGpsCapturing ? "text-primary animate-spin" : "text-emerald-500"} />
            <div className="text-left">
              <span className="block text-[10px] text-slate-400 leading-tight">GPS Location (±{gpsLocation.accuracyMeters}m)</span>
              <span className="font-mono text-[11px] font-bold">{gpsLocation.latitude.toFixed(4)}° N, {gpsLocation.longitude.toFixed(4)}° E</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded font-bold ml-1">
              Lock
            </span>
          </button>

          {/* Sync Queue Action */}
          <Button
            size="sm"
            variant={syncQueue.some((i) => i.syncStatus === "Pending") ? "primary" : "outline"}
            icon={<RefreshCw size={13} className={isSyncing ? "animate-spin" : ""} />}
            onClick={handleSyncNow}
            disabled={isSyncing}
          >
            {isSyncing ? "Syncing..." : `Sync (${syncQueue.filter((i) => i.syncStatus === "Pending").length})`}
          </Button>
        </div>
      </div>

      {/* ── Key Operational Modules Tab Navigation ─────────────── */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white dark:bg-gray-900 rounded-2xl border border-border-color shadow-2xs overflow-x-auto custom-scrollbar-thin select-none">
        <button
          type="button"
          onClick={() => setActiveTab("reach")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "reach"
              ? "bg-primary text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-800"
          }`}
        >
          <Pickaxe size={14} />
          <span>Reach Inspection</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("permit")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "permit"
              ? "bg-primary text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-800"
          }`}
        >
          <FileCheck size={14} />
          <span>Permit Verification</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("excavation")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "excavation"
              ? "bg-primary text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-800"
          }`}
        >
          <SlidersHorizontal size={14} />
          <span>Excavation Entry</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("scan")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "scan"
              ? "bg-primary text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-800"
          }`}
        >
          <QrCode size={14} />
          <span>Vehicle / QR Scan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("weigh")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "weigh"
              ? "bg-primary text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-800"
          }`}
        >
          <Scale size={14} />
          <span>Weighbridge Verification</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("photo")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "photo"
              ? "bg-primary text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-800"
          }`}
        >
          <Camera size={14} />
          <span>Photo Evidence</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("incident")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "incident"
              ? "bg-rose-600 text-white shadow-xs"
              : "text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
          }`}
        >
          <AlertOctagon size={14} />
          <span>Incident / Alert</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("sync")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ml-auto ${
            activeTab === "sync"
              ? "bg-slate-800 text-white shadow-xs"
              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-800"
          }`}
        >
          <Clock size={14} />
          <span>Offline Queue ({syncQueue.length})</span>
        </button>
      </div>

      {/* ── TAB 1: Reach Inspection ─────────────────────────────── */}
      {activeTab === "reach" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 bg-white dark:bg-gray-900 rounded-2xl border border-border-color shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border-color pb-3">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Pickaxe size={18} className="text-primary" />
                  Reach On-Site Audit & Safety Verification
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Verify statutory riverbed boundary pillars, excavation depth limits, and water safety standards
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                {reachInspection.reachId}
              </span>
            </div>

            <form onSubmit={handleSubmitReachInspection} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Select Mining Reach
                  </label>
                  <select
                    value={reachInspection.reachId}
                    onChange={(e) =>
                      setReachInspection((prev) => ({
                        ...prev,
                        reachId: e.target.value,
                        reachName: e.target.value === "CG-RP-MAH-01" ? "Mahanadi Sand Reach 01" : "Shivnath Reach Delta",
                      }))
                    }
                    className={`${inputBase} ${inputNormal} text-xs font-bold`}
                  >
                    <option value="CG-RP-MAH-01">CG-RP-MAH-01 (Mahanadi Reach 01, Raipur)</option>
                    <option value="CG-DG-SHV-02">CG-DG-SHV-02 (Shivnath Delta, Durg)</option>
                    <option value="CG-KB-HSD-04">CG-KB-HSD-04 (Hasdeo Reach 05, Korba)</option>
                    <option value="CG-BP-ARP-03">CG-BP-ARP-03 (Arpa Quarry Block B, Bilaspur)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    River Stream / Basin
                  </label>
                  <input
                    type="text"
                    value={reachInspection.riverStream}
                    disabled
                    className={`${inputBase} ${inputNormal} bg-slate-50 dark:bg-gray-800 text-xs text-slate-500`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Inspector Name
                  </label>
                  <input
                    type="text"
                    value={reachInspection.inspectorName}
                    onChange={(e) => setReachInspection({ ...reachInspection, inspectorName: e.target.value })}
                    className={`${inputBase} ${inputNormal} text-xs font-semibold`}
                  />
                </div>
              </div>

              {/* Checkboxes for Physical Inspection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-gray-800/60 rounded-xl border border-border-color">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reachInspection.boundaryPillarsIntact}
                    onChange={(e) => setReachInspection({ ...reachInspection, boundaryPillarsIntact: e.target.checked })}
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    All 4 GPS Boundary Pillars Intact & Painted
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reachInspection.depthMarkersVerified}
                    onChange={(e) => setReachInspection({ ...reachInspection, depthMarkersVerified: e.target.checked })}
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Depth Gauge Markers Clearly Visible in Riverbed
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reachInspection.waterDepthSafetyCompliant}
                    onChange={(e) =>
                      setReachInspection({ ...reachInspection, waterDepthSafetyCompliant: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Water Table & Slope Safety Compliant (No in-stream dredging)
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reachInspection.cctvFunctional}
                    onChange={(e) => setReachInspection({ ...reachInspection, cctvFunctional: e.target.checked })}
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Solar CCTV Surveillance Feed Transmitting
                  </span>
                </label>
              </div>

              {/* Machinery & Depth Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Measured Depth (m)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={reachInspection.measuredDepthM}
                    onChange={(e) =>
                      setReachInspection({ ...reachInspection, measuredDepthM: parseFloat(e.target.value) || 0 })
                    }
                    className={`${inputBase} ${inputNormal} text-xs font-mono font-bold ${
                      reachInspection.measuredDepthM > 3.0 ? "border-rose-500 text-rose-600" : ""
                    }`}
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">Max limit: 3.0m</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Active Excavators / Poclains
                  </label>
                  <input
                    type="number"
                    value={reachInspection.poclainsActive}
                    onChange={(e) =>
                      setReachInspection({ ...reachInspection, poclainsActive: parseInt(e.target.value) || 0 })
                    }
                    className={`${inputBase} ${inputNormal} text-xs font-mono`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tippers In Loading Queue
                  </label>
                  <input
                    type="number"
                    value={reachInspection.tippersActive}
                    onChange={(e) =>
                      setReachInspection({ ...reachInspection, tippersActive: parseInt(e.target.value) || 0 })
                    }
                    className={`${inputBase} ${inputNormal} text-xs font-mono`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Compliance Verdict
                  </label>
                  <select
                    value={reachInspection.environmentalComplianceStatus}
                    onChange={(e) =>
                      setReachInspection({
                        ...reachInspection,
                        environmentalComplianceStatus: e.target.value as any,
                      })
                    }
                    className={`${inputBase} ${inputNormal} text-xs font-bold`}
                  >
                    <option value="Compliant">Compliant</option>
                    <option value="Minor Violation">Minor Violation</option>
                    <option value="Severe Breach">Severe Breach</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Inspector Field Remarks
                </label>
                <textarea
                  rows={2}
                  value={reachInspection.remarks}
                  onChange={(e) => setReachInspection({ ...reachInspection, remarks: e.target.value })}
                  placeholder="Observation notes, environmental clearance cross-checks..."
                  className={`${inputBase} ${inputNormal} text-xs`}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border-color">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={<Camera size={14} />}
                  onClick={() => setActiveTab("photo")}
                >
                  Capture Geotagged Photo
                </Button>

                <Button type="submit" variant="primary" size="sm" icon={<CheckCircle2 size={14} />}>
                  Submit Inspection
                </Button>
              </div>
            </form>
          </div>

          {/* Right Summary Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border-color shadow-2xs p-4 space-y-3 text-xs">
              <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] border-b border-border-color pb-2">
                Active Location Geofence
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Reach ID:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{reachInspection.reachId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Coordinates:</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{gpsLocation.latitude.toFixed(4)}° N, {gpsLocation.longitude.toFixed(4)}° E</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Geofence Status:</span>
                  <Badge variant="success">Inside Authorized Polygon</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Max River Depth:</span>
                  <span className="font-bold text-emerald-600">3.00 Metres</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: Permit Verification ─────────────────────────── */}
      {activeTab === "permit" && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border-color shadow-2xs p-5 space-y-4">
          <div className="border-b border-border-color pb-3">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck size={18} className="text-primary" />
              Mining Lease Permit & Quota Verification
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Validate statutory permit numbers, approved mineral volume quotas, and SEIAA clearance certificates
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 max-w-md">
            <input
              type="text"
              value={searchPermitId}
              onChange={(e) => setSearchPermitId(e.target.value)}
              placeholder="Enter Permit # (e.g. PRM-CG-2026-0881)"
              className={`${inputBase} ${inputNormal} font-mono text-xs uppercase font-bold`}
            />
            <Button variant="primary" size="sm" icon={<Search size={14} />} onClick={handleVerifyPermit}>
              Verify Permit
            </Button>
          </div>

          {verifiedPermit && (
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 dark:bg-emerald-950/30 dark:border-emerald-800 text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800 pb-2">
                <div>
                  <span className="font-mono font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                    {verifiedPermit.permitId}
                  </span>
                  <p className="text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold">
                    {verifiedPermit.contractorName}
                  </p>
                </div>
                <Badge variant="success">Active Lease Granted</Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-700 dark:text-slate-300">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Approved Quota</span>
                  <span className="font-black text-slate-900 dark:text-white text-sm">{verifiedPermit.approvedQuotaMt.toLocaleString()} MT</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Excavated So Far</span>
                  <span className="font-black text-slate-900 dark:text-white text-sm">{verifiedPermit.excavatedSoFarMt.toLocaleString()} MT</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Balance Quota</span>
                  <span className="font-black text-emerald-600 text-sm">{verifiedPermit.balanceQuotaMt.toLocaleString()} MT</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Royalty Status</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">{verifiedPermit.royaltyPaidStatus}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800 flex justify-between text-[11px] text-slate-500">
                <span>EC Reference: {verifiedPermit.environmentalClearanceRef}</span>
                <span>Validity: {verifiedPermit.validFrom} to {verifiedPermit.validTo}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: Excavation Entry ─────────────────────────────── */}
      {activeTab === "excavation" && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border-color shadow-2xs p-5 space-y-4">
          <div className="border-b border-border-color pb-3">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <SlidersHorizontal size={18} className="text-primary" />
              Daily Riverbed Excavation Entry
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Log machinery deployment, sand volume mined, and pit depth measurements per shift
            </p>
          </div>

          <form onSubmit={handleSubmitExcavation} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Shift Timing
                </label>
                <select
                  value={excavationEntry.shift}
                  onChange={(e) => setExcavationEntry({ ...excavationEntry, shift: e.target.value as any })}
                  className={`${inputBase} ${inputNormal} text-xs font-bold`}
                >
                  <option value="Morning (06:00 - 14:00)">Morning (06:00 - 14:00)</option>
                  <option value="Evening (14:00 - 22:00)">Evening (14:00 - 22:00)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Excavators Deployed
                </label>
                <input
                  type="number"
                  value={excavationEntry.poclainsDeployed}
                  onChange={(e) => setExcavationEntry({ ...excavationEntry, poclainsDeployed: parseInt(e.target.value) || 0 })}
                  className={`${inputBase} ${inputNormal} text-xs font-mono font-bold`}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Excavated Volume (MT)
                </label>
                <input
                  type="number"
                  value={excavationEntry.excavatedVolumeMt}
                  onChange={(e) => setExcavationEntry({ ...excavationEntry, excavatedVolumeMt: parseFloat(e.target.value) || 0 })}
                  className={`${inputBase} ${inputNormal} text-xs font-mono font-bold`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Measured Riverbed Depth (m)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={excavationEntry.excavationDepthM}
                  onChange={(e) => setExcavationEntry({ ...excavationEntry, excavationDepthM: parseFloat(e.target.value) || 0 })}
                  className={`${inputBase} ${inputNormal} text-xs font-mono font-bold`}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Supervisor Name
                </label>
                <input
                  type="text"
                  value={excavationEntry.supervisorName}
                  onChange={(e) => setExcavationEntry({ ...excavationEntry, supervisorName: e.target.value })}
                  className={`${inputBase} ${inputNormal} text-xs`}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  GPS Location Tag
                </label>
                <input
                  type="text"
                  value={gpsLocation.latitude.toFixed(4) + "° N, " + gpsLocation.longitude.toFixed(4) + "° E"}
                  disabled
                  className={`${inputBase} ${inputNormal} bg-slate-50 dark:bg-gray-800 text-xs text-slate-500 font-mono`}
                />
              </div>
            </div>

            <Button type="submit" variant="primary" size="sm" icon={<CheckCircle2 size={14} />}>
              Submit Shift Excavation Record
            </Button>
          </form>
        </div>
      )}

      {/* ── TAB 4: Vehicle / QR Scan ────────────────────────────── */}
      {activeTab === "scan" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7 bg-white dark:bg-gray-900 rounded-2xl border border-border-color shadow-2xs p-5 space-y-4">
            <div className="border-b border-border-color pb-3">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <QrCode size={18} className="text-primary" />
                Vehicle e-Pass Optical Scanner
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Scan QR code printed on transit e-Pass or enter registration number for digital authorization
              </p>
            </div>

            <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 dark:bg-primary/10 p-6 text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                <QrCode size={28} />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">QR Code Optical Scanner Active</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Point terminal camera at driver e-Pass slip</p>

              <div className="mt-3 flex gap-2 max-w-sm mx-auto">
                <input
                  type="text"
                  value={scannedCode}
                  onChange={(e) => setScannedCode(e.target.value)}
                  placeholder="Enter e-Pass # (e.g. EPASS-2026-1049)"
                  className={`${inputBase} ${inputNormal} font-mono text-center text-xs uppercase font-bold`}
                />
                <Button variant="primary" size="sm" icon={<QrCode size={14} />} onClick={handleVerifyQR}>
                  Scan QR
                </Button>
              </div>
            </div>

            {verifiedPass && (
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 dark:bg-emerald-950/30 dark:border-emerald-800 text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800 pb-2">
                  <span className="font-mono font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                    {verifiedPass.ePassNumber}
                  </span>
                  <Badge variant="success">Cleared for Transit</Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                  <p><span className="text-slate-500">Vehicle:</span> <span className="font-mono font-bold">{verifiedPass.vehicleNumber}</span></p>
                  <p><span className="text-slate-500">Quantity:</span> <span className="font-bold">{verifiedPass.quantityMt} MT</span></p>
                  <p><span className="text-slate-500">Driver:</span> {verifiedPass.driverName} ({verifiedPass.driverMobile})</p>
                  <p><span className="text-slate-500">Destination:</span> {verifiedPass.destination}</p>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border-color shadow-2xs p-4 space-y-2 text-xs">
              <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] border-b border-border-color pb-2">
                Quick Test Codes
              </h3>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setScannedCode("EPASS-2026-1049")}
                  className="w-full text-left p-2 rounded-lg bg-slate-50 dark:bg-gray-800 hover:bg-slate-100 font-mono text-xs flex justify-between cursor-pointer"
                >
                  <span>EPASS-2026-1049</span>
                  <span className="text-emerald-600 font-bold">Valid (CG 04 HA 4321)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setScannedCode("EPASS-2026-9999")}
                  className="w-full text-left p-2 rounded-lg bg-slate-50 dark:bg-gray-800 hover:bg-slate-100 font-mono text-xs flex justify-between cursor-pointer"
                >
                  <span>EPASS-2026-9999</span>
                  <span className="text-rose-600 font-bold">Counterfeit / Expired</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: Weighbridge Verification ─────────────────────── */}
      {activeTab === "weigh" && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border-color shadow-2xs p-5 space-y-4">
          <div className="border-b border-border-color pb-3">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Scale size={18} className="text-primary" />
              Weighbridge Slip & Spot Weight Verification
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cross-examine computerized gross/tare weighment slips against permitted road payload limits
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Slip Serial #</label>
              <input
                type="text"
                value={weighSlipNumber}
                onChange={(e) => setWeighSlipNumber(e.target.value)}
                className={`${inputBase} ${inputNormal} font-mono text-xs uppercase`}
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Vehicle #</label>
              <input
                type="text"
                value={weighVehicle}
                onChange={(e) => setWeighVehicle(e.target.value)}
                className={`${inputBase} ${inputNormal} font-mono text-xs uppercase font-bold`}
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Gross Weight (MT)</label>
              <input
                type="number"
                step="0.1"
                value={spotGrossMt}
                onChange={(e) => setSpotGrossMt(e.target.value)}
                className={`${inputBase} ${inputNormal} text-xs font-mono font-bold`}
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tare Weight (MT)</label>
              <input
                type="number"
                step="0.1"
                value={spotTareMt}
                onChange={(e) => setSpotTareMt(e.target.value)}
                className={`${inputBase} ${inputNormal} text-xs font-mono font-bold`}
              />
            </div>
          </div>

          <Button variant="primary" size="sm" icon={<Scale size={14} />} onClick={handleCalculateWeighment}>
            Compute Net Weight & Verify Compliance
          </Button>

          {weighResult && (
            <div
              className={`p-4 rounded-xl border text-xs space-y-2 ${
                weighResult.isOverloaded
                  ? "bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800 text-rose-900 dark:text-rose-200"
                  : "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className="text-sm">Net Weight: {weighResult.netWeightMt} MT</span>
                <Badge variant={weighResult.isOverloaded ? "danger" : "success"}>
                  {weighResult.isOverloaded ? `OVERLOAD (+${weighResult.overloadMt} MT)` : "PERMISSIBLE PAYLOAD"}
                </Badge>
              </div>
              <p className="text-[11px]">
                Permissible Limit: {weighResult.permissibleNetMt} MT | Gross: {weighResult.grossWeightMt} MT | Tare: {weighResult.tareWeightMt} MT
              </p>
              {weighResult.isOverloaded && (
                <p className="font-bold text-rose-700 dark:text-rose-300 pt-1 border-t border-rose-200">
                  Statutory Overloading Penalty Assessed: ₹{weighResult.penaltyAmountInr.toLocaleString("en-IN")}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 6: Photo / Video Evidence ───────────────────────── */}
      {activeTab === "photo" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5 bg-white dark:bg-gray-900 rounded-2xl border border-border-color shadow-2xs p-5 space-y-4">
            <div className="border-b border-border-color pb-3">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Camera size={18} className="text-primary" />
                Geo-Tagged Photo Capture
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Camera captures automatically stamped with satellite coordinates, timestamp & reach watermark
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Evidence Title</label>
                <input
                  type="text"
                  value={photoTitle}
                  onChange={(e) => setPhotoTitle(e.target.value)}
                  className={`${inputBase} ${inputNormal} text-xs`}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select
                  value={photoCategory}
                  onChange={(e) => setPhotoCategory(e.target.value as any)}
                  className={`${inputBase} ${inputNormal} text-xs font-bold`}
                >
                  <option value="Reach Boundary">Reach Boundary</option>
                  <option value="Depth Gauge">Depth Gauge</option>
                  <option value="Vehicle Overload">Vehicle Overload</option>
                  <option value="Illegal Trenching">Illegal Trenching</option>
                  <option value="Weigh Slip">Weigh Slip</option>
                </select>
              </div>

              {/* Watermark Preview Card */}
              <div className="p-3 bg-slate-900 text-white rounded-xl text-[10px] space-y-1 font-mono">
                <p className="text-amber-400 font-bold">AUTOMATIC WATERMARK EMBEDDED:</p>
                <p>LAT/LNG: {gpsLocation.latitude.toFixed(4)}° N, {gpsLocation.longitude.toFixed(4)}° E</p>
                <p>TIMESTAMP: {gpsLocation.timestamp}</p>
                <p>OFFICER: INSP-R-VERMA (OFF-CG-882)</p>
              </div>

              <Button
                type="button"
                variant="primary"
                size="sm"
                className="w-full"
                icon={<Camera size={15} />}
                onClick={handleCapturePhoto}
              >
                Capture Photo
              </Button>
            </div>
          </div>

          {/* Evidence Locker Gallery */}
          <div className="lg:col-span-7 bg-white dark:bg-gray-900 rounded-2xl border border-border-color shadow-2xs p-5 space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] border-b border-border-color pb-2">
              Captured Evidence Locker ({photoEvidenceList.length})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {photoEvidenceList.map((photo) => (
                <div key={photo.id} className="rounded-xl border border-border-color overflow-hidden bg-slate-50 dark:bg-gray-800">
                  <div className="relative h-32 bg-slate-900">
                    <img src={photo.thumbnailUrl} alt={photo.title} className="w-full h-full object-cover" />
                    <div className="absolute bottom-1 left-1 right-1 bg-slate-950/80 backdrop-blur-xs text-[9px] text-white px-2 py-0.5 rounded font-mono truncate">
                      {photo.gpsCoordinates} • {photo.timestamp}
                    </div>
                  </div>
                  <div className="p-2.5 text-xs">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{photo.title}</p>
                    <div className="flex justify-between items-center mt-1 text-[10px] text-slate-400">
                      <span className="font-semibold text-primary">{photo.category}</span>
                      <span>{(photo.fileSizeKb / 1024).toFixed(1)} MB</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 7: Incident / Illegal Mining Alert ──────────────── */}
      {activeTab === "incident" && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border-color shadow-2xs p-5 space-y-4">
          <div className="border-b border-border-color pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertOctagon size={18} />
                Rapid Enforcement & Illegal Mining Breach Alert
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Immediately trigger enforcement violation to Central Enforcement Radar & Dispatch Flying Squads
              </p>
            </div>
            <Badge variant="danger">High Priority Dispatch</Badge>
          </div>

          <form onSubmit={handleRaiseAlert} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Violation Type</label>
                <select
                  value={incidentData.violationType}
                  onChange={(e) => setIncidentData({ ...incidentData, violationType: e.target.value as any })}
                  className={`${inputBase} ${inputNormal} text-xs font-bold`}
                >
                  <option value="Illegal Excavation">Illegal Excavation</option>
                  <option value="Unregistered Vehicle / Tractor">Unregistered Vehicle / Tractor</option>
                  <option value="Night Mining Breach">Night Mining Breach</option>
                  <option value="Riverbed Deep Trenching">Riverbed Deep Trenching</option>
                  <option value="Counterfeit e-Pass">Counterfeit e-Pass</option>
                  <option value="Overloading">Overloading</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Severity Level</label>
                <select
                  value={incidentData.severity}
                  onChange={(e) => setIncidentData({ ...incidentData, severity: e.target.value as any })}
                  className={`${inputBase} ${inputNormal} text-xs font-bold`}
                >
                  <option value="Critical">Critical (Immediate Interception)</option>
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Severity</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Suspect Vehicle / Tipper #</label>
                <input
                  type="text"
                  value={incidentData.suspectVehicleNumber}
                  onChange={(e) => setIncidentData({ ...incidentData, suspectVehicleNumber: e.target.value })}
                  placeholder="e.g. CG 07 EF 2468"
                  className={`${inputBase} ${inputNormal} font-mono uppercase text-xs font-bold`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Breach Location</label>
                <input
                  type="text"
                  value={incidentData.location}
                  onChange={(e) => setIncidentData({ ...incidentData, location: e.target.value })}
                  className={`${inputBase} ${inputNormal} text-xs`}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Machinery / Equipment Involved</label>
                <input
                  type="text"
                  value={incidentData.suspectMachinery}
                  onChange={(e) => setIncidentData({ ...incidentData, suspectMachinery: e.target.value })}
                  className={`${inputBase} ${inputNormal} text-xs`}
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Enforcement Officer Notes</label>
              <textarea
                rows={3}
                value={incidentData.officerNotes}
                onChange={(e) => setIncidentData({ ...incidentData, officerNotes: e.target.value })}
                className={`${inputBase} ${inputNormal} text-xs`}
                required
              />
            </div>

            <Button type="submit" variant="danger" size="sm" icon={<AlertOctagon size={14} />}>
              Raise Alert
            </Button>
          </form>
        </div>
      )}

      {/* ── TAB 8: Offline Sync Queue ───────────────────────────── */}
      {activeTab === "sync" && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border-color shadow-2xs p-5 space-y-4">
          <div className="border-b border-border-color pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Clock size={18} className="text-primary" />
                Offline-First Sync Queue & Conflict Resolution
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audits, scan results, and inspection logs stored in local storage cache during remote reach low connectivity
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              icon={<RefreshCw size={13} className={isSyncing ? "animate-spin" : ""} />}
              onClick={handleSyncNow}
              disabled={isSyncing}
            >
              {isSyncing ? "Syncing..." : "Sync All Now"}
            </Button>
          </div>

          <div className="divide-y divide-border-color">
            {syncQueue.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{item.id}</span>
                    <span className="text-[10px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded">
                      {item.type}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">({item.createdAt})</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5">{item.summary}</p>
                </div>
                <Badge variant={item.syncStatus === "Synced" ? "success" : "warning"}>
                  {item.syncStatus}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldOfficerAppView;
