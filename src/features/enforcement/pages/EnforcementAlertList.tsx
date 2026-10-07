import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  UserCheck,
  FileSearch,
  Ban,
  CheckCircle2,
  PlusCircle,
  ShieldAlert,
  AlertTriangle,
  FileText,
  MapPin,
  Truck,
  Calendar,
  DollarSign,
  Paperclip,
  ExternalLink,
  RefreshCw,
  Download,
  Printer,
  Compass,
  Gavel,
  ShieldCheck,
  Landmark,
} from "lucide-react";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import type { EnforcementAlert } from "@/features/shared-simulation/types";
import ReusableTable from "@/shared/components/ui/Table/ReusableTable/ReusableTable";
import type { MRT_ColumnDef } from "material-react-table";
import Button from "@/shared/components/ui/Button";
import Badge from "@/shared/components/ui/Badge";
import Card from "@/shared/components/layout/Card/Card";
import Modal, { ModalFooter } from "@/shared/components/ui/Modal/Modal";
import DialogModal from "@/shared/components/ui/DialogModal";
import { useStatusModal } from "@/config/theme/StatusModalContext";
import { exportToExcel, exportToPDF } from "@/shared/utils/exportUtils";
import { routes } from "@/app/routes/routeConfig";
import { inputBase, inputNormal } from "@/shared/components/ui/Forms/inputStyles";
import "../styles/enforcement.css";

export const EnforcementAlertList: React.FC = () => {
  const {
    alerts,
    assignEnforcementOfficer,
    investigateEnforcementAlert,
    blockAndSeizeVehicle,
    closeEnforcementCase,
  } = useSandMining();
  const { showSuccess, showError } = useStatusModal();
  const navigate = useNavigate();

  // Active Modals state
  const [selectedAlert, setSelectedAlert] = useState<EnforcementAlert | null>(null);
  const [assignModalAlert, setAssignModalAlert] = useState<EnforcementAlert | null>(null);
  const [investigateModalAlert, setInvestigateModalAlert] = useState<EnforcementAlert | null>(null);
  const [seizureModalAlert, setSeizureModalAlert] = useState<EnforcementAlert | null>(null);
  const [closeCaseModalAlert, setCloseCaseModalAlert] = useState<EnforcementAlert | null>(null);

  // Form states inside modals
  const [assignedOfficerName, setAssignedOfficerName] = useState("");
  const [squadName, setSquadName] = useState("District Flying Squad (Special Taskforce)");

  const [inspectionNotes, setInspectionNotes] = useState("");
  const [inspectionStatus, setInspectionStatus] = useState<EnforcementAlert["actionStatus"]>("Under Investigation");
  const [penaltyLeviedAmount, setPenaltyLeviedAmount] = useState<number>(25000);

  const [seizureOrderNumber, setSeizureOrderNumber] = useState("");
  const [firNumber, setFirNumber] = useState("");
  const [seizureRemarks, setSeizureRemarks] = useState("");

  const [closeResolutionRemarks, setCloseResolutionRemarks] = useState("");
  const [closePenaltyAmount, setClosePenaltyAmount] = useState<number>(0);

  // Metrics
  const totalAlerts = alerts.length;
  const activeAlerts = alerts.filter(
    (a) => a.actionStatus === "New Alert" || a.actionStatus === "Squad Assigned" || a.actionStatus === "Under Investigation"
  ).length;
  const seizedVehiclesCount = alerts.filter((a) => a.actionStatus === "Vehicle Seized").length;
  const totalPenaltiesAmount = alerts.reduce((acc, curr) => acc + (curr.penaltyAmount || 0), 0);

  const severityVariant: Record<string, any> = {
    Critical: "danger",
    High: "warning",
    Moderate: "info",
  };

  const actionVariant: Record<string, any> = {
    "New Alert": "secondary",
    "Squad Assigned": "warning",
    "Under Investigation": "info",
    "Vehicle Seized": "danger",
    "Penalty Levied": "primary",
    Closed: "success",
  };

  const columns: MRT_ColumnDef<EnforcementAlert>[] = [
    {
      accessorKey: "alertId",
      header: "Alert ID",
      size: 130,
      Cell: ({ row }) => (
        <button
          type="button"
          onClick={() => setSelectedAlert(row.original)}
          className="text-left font-mono text-xs font-bold text-red-600 dark:text-red-400 hover:underline"
          title="Click to view full case dossier"
        >
          {row.original.alertId}
        </button>
      ),
    },
    {
      accessorKey: "location",
      header: "Location",
      size: 200,
      Cell: ({ row }) => (
        <span className="text-xs flex items-center gap-1.5 text-gray-800 dark:text-gray-200">
          <MapPin size={13} className="text-red-500 shrink-0" />
          <span className="truncate max-w-[180px]" title={row.original.location}>
            {row.original.location}
          </span>
        </span>
      ),
    },
    {
      accessorKey: "reachName",
      header: "Reach",
      size: 160,
      Cell: ({ row }) => (
        <span className="text-xs font-medium text-primary flex items-center gap-1">
          <Compass size={12} className="text-primary shrink-0" />
          <span className="truncate max-w-[140px]" title={row.original.reachName || row.original.reachId}>
            {row.original.reachName || row.original.reachId || "Non-Leased Stretch"}
          </span>
        </span>
      ),
    },
    {
      accessorKey: "vehicleNumber",
      header: "Vehicle",
      size: 140,
      Cell: ({ row }) => (
        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-gray-800 dark:text-gray-200">
          <Truck size={13} className="text-gray-400 shrink-0" />
          <span>{row.original.vehicleNumber || "N/A"}</span>
        </div>
      ),
    },
    {
      accessorKey: "alertType",
      header: "Alert Type",
      size: 160,
      Cell: ({ row }) => (
        <div>
          <span className="font-semibold text-xs text-gray-900 dark:text-white block">
            {row.original.alertType}
          </span>
          <Badge
            variant={severityVariant[row.original.severity] || "secondary"}
            className="mt-0.5 text-[10px]"
          >
            {row.original.severity}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "dateTime",
      header: "Date/Time",
      size: 130,
      Cell: ({ row }) => (
        <span className="font-mono text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
          <Calendar size={12} className="text-gray-400 shrink-0" />
          {row.original.dateTime}
        </span>
      ),
    },
    {
      accessorKey: "evidencePhotoUrl",
      header: "Evidence/Photo",
      size: 140,
      Cell: ({ row }) =>
        row.original.evidencePhotoUrl ? (
          <button
            type="button"
            onClick={() => setSelectedAlert(row.original)}
            className="flex items-center gap-1.5 p-1 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-red-400 transition-colors cursor-pointer"
            title="Click to view full photo evidence"
          >
            <img
              src={row.original.evidencePhotoUrl}
              alt="Evidence thumbnail"
              className="w-7 h-7 rounded object-cover border border-gray-300 dark:border-gray-600"
            />
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5">
              <Paperclip size={10} /> View
            </span>
          </button>
        ) : (
          <span className="text-xs text-gray-400 italic">No Attachment</span>
        ),
    },
    {
      accessorKey: "assignedOfficer",
      header: "Officer",
      size: 180,
      Cell: ({ row }) => (
        <span className="text-xs font-medium text-gray-900 dark:text-white block truncate max-w-[170px]" title={row.original.assignedOfficer}>
          {row.original.assignedOfficer || "Unassigned"}
        </span>
      ),
    },
    {
      accessorKey: "actionStatus",
      header: "Action/Status",
      size: 160,
      Cell: ({ row }) => (
        <div>
          <Badge variant={actionVariant[row.original.actionStatus] || "secondary"}>
            {row.original.actionStatus}
          </Badge>
          {row.original.penaltyAmount ? (
            <span className="block text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
              ₹ {row.original.penaltyAmount.toLocaleString()}
            </span>
          ) : null}
        </div>
      ),
    },
  ];

  const exportCols = [
    { accessorKey: "alertId", header: "Alert ID" },
    { accessorKey: "location", header: "Location" },
    { accessorKey: "reachName", header: "Reach" },
    { accessorKey: "vehicleNumber", header: "Vehicle" },
    { accessorKey: "alertType", header: "Alert Type" },
    { accessorKey: "dateTime", header: "Date/Time" },
    { accessorKey: "assignedOfficer", header: "Officer" },
    { accessorKey: "actionStatus", header: "Action/Status" },
  ];

  // Condition rules for all 5 row actions
  const canAssign = (a: EnforcementAlert) => a.actionStatus !== "Closed" && a.actionStatus !== "Vehicle Seized";
  const canInvestigate = (a: EnforcementAlert) => a.actionStatus !== "Closed";
  const canBlock = (a: EnforcementAlert) =>
    a.actionStatus !== "Vehicle Seized" && a.actionStatus !== "Closed" && !!a.vehicleNumber;
  const canClose = (a: EnforcementAlert) => a.actionStatus !== "Closed";

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="text-red-600" size={24} />
            Enforcement / Illegal Mining Monitoring
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Detect and investigate illegal excavation, satellite geofence violations, transit diversions, and vehicle seizures.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={14} />}
            onClick={() => exportToExcel(exportCols, alerts, "SMMS_Enforcement_Alerts")}
          >
            Export Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Printer size={14} />}
            onClick={() => exportToPDF(exportCols, alerts, "SMMS_Enforcement_Alerts", "Enforcement / Anti-Illegal Mining")}
          >
            Export PDF
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<PlusCircle size={15} />}
            onClick={() => navigate(routes.addEnforcementAlert.path)}
          >
            Create Alert
          </Button>
        </div>
      </div>

      {/* ── Top KPI Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Interceptions</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalAlerts}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Logged across river basins</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
            <FileText size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Investigations</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{activeAlerts}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Flying squads deployed</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center">
            <AlertTriangle size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Vehicles Impounded</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{seizedVehiclesCount}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Seized per MMDR Act Sec 21</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 flex items-center justify-center">
            <Gavel size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Penalties Levied</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              ₹ {totalPenaltiesAmount.toLocaleString()}
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">Credited to DMF Trust Fund</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
            <Landmark size={20} />
          </div>
        </div>
      </div>

      {/* ── Main Ledger Table wrapped in Reusable Card ── */}
      <Card
        title="Anti-Illegal Mining Incidents & Interception Registry"
        subtitle="Live registry of illegal mining alerts, GPS route deviations, vehicle seizures, and statutory penalties"
        icon={ShieldAlert}
        action={
          <Button
            size="sm"
            variant="outline"
            icon={<RefreshCw size={13} />}
            onClick={() => showSuccess("Enforcement alerts re-synchronized with GIS central radar.")}
          >
            Refresh
          </Button>
        }
      >
        <ReusableTable
          columns={columns}
          data={alerts}
          exportFileName="SMMS_Enforcement_Alerts"
          onExportExcel={(rows) => exportToExcel(exportCols, rows, "SMMS_Enforcement_Alerts")}
          onExportPDF={(rows) => exportToPDF(exportCols, rows, "SMMS_Enforcement_Alerts", "Enforcement / Anti-Illegal Mining")}
          enableRowActions
          renderRowActions={({ row }) => {
            const a = row.original;
            const assignOk = canAssign(a);
            const investigateOk = canInvestigate(a);
            const blockOk = canBlock(a);
            const closeOk = canClose(a);

            return (
              <div className="flex items-center gap-1">
                {/* 1. View Case & Evidence Dossier */}
                <button
                  type="button"
                  title="View Case Dossier, Geotagged Evidence & Audit History"
                  onClick={() => setSelectedAlert(a)}
                  className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 transition-colors cursor-pointer"
                >
                  <Eye size={16} />
                </button>

                {/* 2. Assign Officer */}
                <button
                  type="button"
                  disabled={!assignOk}
                  title={assignOk ? "Assign Flying Squad / Patrol Officer" : "Case is finalized or closed"}
                  onClick={() => {
                    if (assignOk) {
                      setAssignedOfficerName(a.assignedOfficer || "Mining Inspector P. Chandrakar");
                      setAssignModalAlert(a);
                    }
                  }}
                  className={`p-1.5 rounded transition-colors ${
                    assignOk
                      ? "hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 cursor-pointer"
                      : "opacity-40 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <UserCheck size={16} />
                </button>

                {/* 3. Investigate / Field Notes */}
                <button
                  type="button"
                  disabled={!investigateOk}
                  title={investigateOk ? "Record Field Inspection & Investigation Notes" : "Case is closed for investigation"}
                  onClick={() => {
                    if (investigateOk) {
                      setInspectionNotes(a.caseNotes || "");
                      setInspectionStatus(a.actionStatus === "New Alert" ? "Under Investigation" : a.actionStatus);
                      setPenaltyLeviedAmount(a.penaltyAmount || 25000);
                      setInvestigateModalAlert(a);
                    }
                  }}
                  className={`p-1.5 rounded transition-colors ${
                    investigateOk
                      ? "hover:bg-purple-50 dark:hover:bg-purple-900/30 text-purple-600 cursor-pointer"
                      : "opacity-40 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <FileSearch size={16} />
                </button>

                {/* 4. Block Vehicle / Seizure Order */}
                <button
                  type="button"
                  disabled={!blockOk}
                  title={
                    !a.vehicleNumber
                      ? "No vehicle tagged to block"
                      : a.actionStatus === "Vehicle Seized"
                      ? "Vehicle already seized"
                      : !blockOk
                      ? "Case closed"
                      : "Issue Vehicle Seizure Order & Blacklist"
                  }
                  onClick={() => {
                    if (blockOk) {
                      setSeizureOrderNumber(`SEIZE-CG-2026-${Math.floor(Math.random() * 9000) + 1000}`);
                      setFirNumber(`FIR-MIN-2026-${Math.floor(Math.random() * 900) + 100}`);
                      setSeizureRemarks(
                        `Vehicle ${a.vehicleNumber} impounded per Section 21(4) MMDR Act for illegal transport.`
                      );
                      setSeizureModalAlert(a);
                    }
                  }}
                  className={`p-1.5 rounded transition-colors ${
                    blockOk
                      ? "hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 cursor-pointer"
                      : "opacity-40 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <Ban size={16} />
                </button>

                {/* 5. Close Case */}
                <button
                  type="button"
                  disabled={!closeOk}
                  title={closeOk ? "Close Enforcement Case & Record Final Resolution" : "Case is already closed"}
                  onClick={() => {
                    if (closeOk) {
                      setCloseResolutionRemarks(
                        a.caseNotes || "Field inquiry completed, fine collected, and spot verification cleared."
                      );
                      setClosePenaltyAmount(a.penaltyAmount || 0);
                      setCloseCaseModalAlert(a);
                    }
                  }}
                  className={`p-1.5 rounded transition-colors ${
                    closeOk
                      ? "hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-600 cursor-pointer"
                      : "opacity-40 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <CheckCircle2 size={16} />
                </button>
              </div>
            );
          }}
        />
      </Card>

      {/* ── 1. Modal: View Case Dossier & Complete History ── */}
      <Modal
        isOpen={!!selectedAlert}
        onClose={() => setSelectedAlert(null)}
        title={`Enforcement Case Dossier – ${selectedAlert?.alertId}`}
        size="lg"
      >
        {selectedAlert && (
          <div className="space-y-5 text-sm">
            {/* Top Status Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-red-600">{selectedAlert.alertId}</span>
                <Badge variant={actionVariant[selectedAlert.actionStatus] || "secondary"}>
                  {selectedAlert.actionStatus}
                </Badge>
                <Badge variant={severityVariant[selectedAlert.severity] || "secondary"}>
                  {selectedAlert.severity} Severity
                </Badge>
              </div>
              <div className="text-xs text-gray-500 font-medium">
                Timestamp: <span className="font-mono text-gray-900 dark:text-white">{selectedAlert.dateTime}</span>
              </div>
            </div>

            {/* Incident Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500">Violation Classification</p>
                <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{selectedAlert.alertType}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Suspect Vehicle / Machine</p>
                <p className="font-mono font-bold text-gray-900 dark:text-white mt-0.5">
                  {selectedAlert.vehicleNumber || "Unidentified / None"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Mining Reach / Sector</p>
                <p className="font-medium text-primary mt-0.5">
                  {selectedAlert.reachName || selectedAlert.reachId || "Non-Leased Riverbed"}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs text-gray-500">Geographic Coordinates / Location</p>
                <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1 mt-0.5">
                  <MapPin size={13} className="text-red-500 shrink-0" />
                  {selectedAlert.location}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Assigned Squad Officer</p>
                <p className="font-semibold text-gray-900 dark:text-white mt-0.5">
                  {selectedAlert.assignedOfficer || "Unassigned"}
                </p>
              </div>
            </div>

            {/* Legal / Seizure Details if present */}
            {(selectedAlert.seizureOrderNumber || selectedAlert.firNumber || selectedAlert.penaltyAmount) && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 text-xs space-y-1">
                <p className="font-bold text-red-800 dark:text-red-300 flex items-center gap-1.5">
                  <Gavel size={14} /> Statutory Legal Orders & Penalties Levied
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1.5 text-gray-800 dark:text-gray-200">
                  {selectedAlert.seizureOrderNumber && (
                    <p>
                      <span className="text-gray-500">Seizure Order:</span>{" "}
                      <span className="font-mono font-bold">{selectedAlert.seizureOrderNumber}</span>
                    </p>
                  )}
                  {selectedAlert.firNumber && (
                    <p>
                      <span className="text-gray-500">FIR #:</span>{" "}
                      <span className="font-mono font-bold">{selectedAlert.firNumber}</span>
                    </p>
                  )}
                  {selectedAlert.penaltyAmount && (
                    <p>
                      <span className="text-gray-500">Penalty Levied:</span>{" "}
                      <span className="font-bold text-emerald-600">₹ {selectedAlert.penaltyAmount.toLocaleString()}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Observation Notes */}
            <div className="bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Incident Observation & Facts
              </p>
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{selectedAlert.caseNotes}</p>
            </div>

            {/* Geotagged Evidence Photo */}
            {selectedAlert.evidencePhotoUrl && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Geotagged Photographic Evidence
                </p>
                <div className="enforcement-evidence-frame border border-gray-200 dark:border-gray-700">
                  <img
                    src={selectedAlert.evidencePhotoUrl}
                    alt="Geotagged Evidence"
                    className="w-full h-52 object-cover"
                  />
                </div>
              </div>
            )}

            {/* Complete Case History & Audit Trail */}
            <div>
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-primary" />
                Case History & Authorized Audit Log (Immutable)
              </h3>
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {selectedAlert.caseHistory && selectedAlert.caseHistory.length > 0 ? (
                  selectedAlert.caseHistory.map((ch) => (
                    <div
                      key={ch.id}
                      className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 font-bold rounded text-[10px]">
                            {ch.action}
                          </span>
                          <span className="text-gray-500 font-normal">by {ch.officer}</span>
                        </span>
                        <span className="text-[11px] text-gray-400 font-mono">{ch.timestamp}</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mt-1">{ch.notes}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">No case history logged yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedAlert(null)}>
            Close Dossier
          </Button>
        </ModalFooter>
      </Modal>

      {/* ── 2. Modal: Assign Officer / Flying Squad ── */}
      <Modal
        isOpen={!!assignModalAlert}
        onClose={() => setAssignModalAlert(null)}
        title={`Assign Officer / Squad – ${assignModalAlert?.alertId}`}
      >
        {assignModalAlert && (
          <div className="space-y-4 text-sm">
            <p className="text-xs text-gray-500">
              Deploy a dedicated flying squad or district patrol officer to execute physical interception and site inspection.
            </p>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Officer Name & Rank *
              </label>
              <input
                type="text"
                value={assignedOfficerName}
                onChange={(e) => setAssignedOfficerName(e.target.value)}
                placeholder="e.g. Mining Inspector P. Chandrakar"
                className={`${inputBase} ${inputNormal}`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Patrol Unit / Squad
              </label>
              <select
                value={squadName}
                onChange={(e) => setSquadName(e.target.value)}
                className={`${inputBase} ${inputNormal}`}
              >
                <option value="District Flying Squad (Special Taskforce)">District Flying Squad (Special Taskforce)</option>
                <option value="State Mining Enforcement Cell">State Mining Enforcement Cell</option>
                <option value="River Basin Mobile Intercept Unit #4">River Basin Mobile Intercept Unit #4</option>
                <option value="Joint Police & Mining Taskforce">Joint Police & Mining Taskforce</option>
              </select>
            </div>
          </div>
        )}
        <ModalFooter>
          <Button variant="outline" onClick={() => setAssignModalAlert(null)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={<UserCheck size={15} />}
            onClick={() => {
              if (!assignedOfficerName.trim()) {
                showError("Please enter officer name");
                return;
              }
              if (assignModalAlert) {
                assignEnforcementOfficer(
                  assignModalAlert.id,
                  `${assignedOfficerName} (${squadName})`
                );
                showSuccess(`Alert ${assignModalAlert.alertId} assigned to ${assignedOfficerName}`);
                setAssignModalAlert(null);
              }
            }}
          >
            Deploy & Assign
          </Button>
        </ModalFooter>
      </Modal>

      {/* ── 3. Modal: Investigate / Record Field Inspection ── */}
      <Modal
        isOpen={!!investigateModalAlert}
        onClose={() => setInvestigateModalAlert(null)}
        title={`Record Investigation – ${investigateModalAlert?.alertId}`}
      >
        {investigateModalAlert && (
          <div className="space-y-4 text-sm">
            <p className="text-xs text-gray-500">
              Update case findings, inspection measurements, and statutory fine amounts per MMDR Act guidelines.
            </p>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Investigation Status
              </label>
              <select
                value={inspectionStatus}
                onChange={(e) => setInspectionStatus(e.target.value as any)}
                className={`${inputBase} ${inputNormal}`}
              >
                <option value="Under Investigation">Under Investigation</option>
                <option value="Penalty Levied">Penalty Levied</option>
                <option value="Squad Assigned">Squad Assigned</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Field Inspection & Observation Report *
              </label>
              <textarea
                rows={4}
                value={inspectionNotes}
                onChange={(e) => setInspectionNotes(e.target.value)}
                placeholder="Enter physical inspection details, GPS coordinates verification, or weighbridge slip audit..."
                className={`${inputBase} ${inputNormal}`}
              />
            </div>
            {inspectionStatus === "Penalty Levied" && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Penalty Amount (₹)
                </label>
                <input
                  type="number"
                  value={penaltyLeviedAmount}
                  onChange={(e) => setPenaltyLeviedAmount(Number(e.target.value))}
                  className={`${inputBase} ${inputNormal}`}
                />
              </div>
            )}
          </div>
        )}
        <ModalFooter>
          <Button variant="outline" onClick={() => setInvestigateModalAlert(null)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={<FileSearch size={15} />}
            onClick={() => {
              if (!inspectionNotes.trim()) {
                showError("Please enter inspection notes");
                return;
              }
              if (investigateModalAlert) {
                investigateEnforcementAlert(
                  investigateModalAlert.id,
                  inspectionNotes,
                  inspectionStatus,
                  inspectionStatus === "Penalty Levied" ? penaltyLeviedAmount : undefined
                );
                showSuccess(`Investigation updated for case ${investigateModalAlert.alertId}`);
                setInvestigateModalAlert(null);
              }
            }}
          >
            Save Findings
          </Button>
        </ModalFooter>
      </Modal>

      {/* ── 4. Modal: Issue Vehicle Seizure Order & Blacklist ── */}
      <Modal
        isOpen={!!seizureModalAlert}
        onClose={() => setSeizureModalAlert(null)}
        title={`Issue Vehicle Seizure Order – ${seizureModalAlert?.alertId}`}
      >
        {seizureModalAlert && (
          <div className="space-y-4 text-sm">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-700 dark:text-red-300">
              <p className="font-bold flex items-center gap-1.5">
                <Gavel size={14} /> Section 21(4) MMDR Act Seizure
              </p>
              <p className="mt-1">
                Executing seizure will blacklist vehicle <strong>{seizureModalAlert.vehicleNumber}</strong> in the state
                registry and prevent future e-Pass generation across all stockyards.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Seizure Order # *
                </label>
                <input
                  type="text"
                  value={seizureOrderNumber}
                  onChange={(e) => setSeizureOrderNumber(e.target.value)}
                  className={`${inputBase} ${inputNormal} font-mono`}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Police FIR # *
                </label>
                <input
                  type="text"
                  value={firNumber}
                  onChange={(e) => setFirNumber(e.target.value)}
                  className={`${inputBase} ${inputNormal} font-mono`}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Seizure Justification & Legal Basis *
              </label>
              <textarea
                rows={3}
                value={seizureRemarks}
                onChange={(e) => setSeizureRemarks(e.target.value)}
                className={`${inputBase} ${inputNormal}`}
              />
            </div>
          </div>
        )}
        <ModalFooter>
          <Button variant="outline" onClick={() => setSeizureModalAlert(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            icon={<Ban size={15} />}
            onClick={() => {
              if (!seizureOrderNumber.trim() || !firNumber.trim()) {
                showError("Please enter seizure order and FIR numbers");
                return;
              }
              if (seizureModalAlert) {
                blockAndSeizeVehicle(
                  seizureModalAlert.id,
                  seizureOrderNumber,
                  firNumber,
                  50000
                );
                showSuccess(
                  `Vehicle ${seizureModalAlert.vehicleNumber} seized and blacklisted under Order #${seizureOrderNumber}`
                );
                setSeizureModalAlert(null);
              }
            }}
          >
            Seize & Blacklist
          </Button>
        </ModalFooter>
      </Modal>

      {/* ── 5. Modal: Close Case ── */}
      <Modal
        isOpen={!!closeCaseModalAlert}
        onClose={() => setCloseCaseModalAlert(null)}
        title={`Close Enforcement Case – ${closeCaseModalAlert?.alertId}`}
      >
        {closeCaseModalAlert && (
          <div className="space-y-4 text-sm">
            <p className="text-xs text-gray-500">
              Provide formal case conclusion remarks, compound penalty fee settlement reference, and finalize this case file.
            </p>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Settled / Compounded Penalty Amount (₹)
              </label>
              <input
                type="number"
                value={closePenaltyAmount}
                onChange={(e) => setClosePenaltyAmount(Number(e.target.value))}
                className={`${inputBase} ${inputNormal}`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Final Case Resolution Remarks *
              </label>
              <textarea
                rows={4}
                value={closeResolutionRemarks}
                onChange={(e) => setCloseResolutionRemarks(e.target.value)}
                placeholder="Describe final judgment, compounding challan clearance, or court disposal..."
                className={`${inputBase} ${inputNormal}`}
              />
            </div>
          </div>
        )}
        <ModalFooter>
          <Button variant="outline" onClick={() => setCloseCaseModalAlert(null)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={<CheckCircle2 size={15} />}
            onClick={() => {
              if (!closeResolutionRemarks.trim()) {
                showError("Please enter resolution remarks before closing");
                return;
              }
              if (closeCaseModalAlert) {
                closeEnforcementCase(
                  closeCaseModalAlert.id,
                  closeResolutionRemarks,
                  closePenaltyAmount
                );
                showSuccess(`Case ${closeCaseModalAlert.alertId} officially closed.`);
                setCloseCaseModalAlert(null);
              }
            }}
          >
            Finalize & Close Case
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default EnforcementAlertList;
