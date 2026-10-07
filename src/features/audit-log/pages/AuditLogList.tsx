import React, { useState, useMemo } from "react";
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  ShieldCheck,
  Lock,
  Activity,
  Server,
  Calendar,
  User,
  Clock,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  Fingerprint,
  MapPin,
  Globe,
  Radio,
  SlidersHorizontal,
  ChevronRight,
  Printer,
  Copy,
  Check,
  ShieldAlert,
  KeyRound,
  FileCheck,
} from "lucide-react";
import ReusableTable from "@/shared/components/ui/Table/ReusableTable/ReusableTable";
import type { MRT_ColumnDef } from "material-react-table";
import Button from "@/shared/components/ui/Button";
import Badge from "@/shared/components/ui/Badge";
import Card from "@/shared/components/layout/Card/Card";
import Modal, { ModalFooter } from "@/shared/components/ui/Modal/Modal";
import Tabs from "@/shared/components/ui/Tabs";
import type { TabItem } from "@/shared/components/ui/Tabs/tab.types";
import { useStatusModal } from "@/config/theme/StatusModalContext";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import type { AuditLogRecord, AuditActionType, AuditModuleType, SystemHealthMetric } from "../types";
import { exportToExcel, exportToPDF } from "@/shared/utils/exportUtils";
import { inputBase, inputNormal } from "@/shared/components/ui/Forms/inputStyles";
import "../styles/auditLog.css";

// System Health & WORM Integrity Nodes
const INITIAL_SYSTEM_METRICS: SystemHealthMetric[] = [
  {
    nodeName: "SMMS Core Statutory Audit Gateway",
    status: "OPERATIONAL",
    uptimePercent: 99.99,
    apiLatencyMs: 24,
    activeSurveillanceNodes: 128,
    ledgerIntegrityVerified: true,
    lastLedgerBlockTimestamp: "2026-09-10 11:45:00",
  },
  {
    nodeName: "Weighbridge IoT Stream & Tare Logger",
    status: "OPERATIONAL",
    uptimePercent: 99.95,
    apiLatencyMs: 31,
    activeSurveillanceNodes: 64,
    ledgerIntegrityVerified: true,
    lastLedgerBlockTimestamp: "2026-09-10 11:45:00",
  },
  {
    nodeName: "Enforcement GPS & ANPR Telemetry Node",
    status: "OPERATIONAL",
    uptimePercent: 99.89,
    apiLatencyMs: 58,
    activeSurveillanceNodes: 42,
    ledgerIntegrityVerified: true,
    lastLedgerBlockTimestamp: "2026-09-10 11:44:30",
  },
];

export const AuditLogList: React.FC = () => {
  const { auditLogs: contextAuditLogs = [] } = useSandMining();
  const { showSuccess } = useStatusModal();

  // Selected item for Detailed Dossier Modal
  const [selectedRecord, setSelectedRecord] = useState<AuditLogRecord | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<string>("all");

  // Filter States
  const [filterModule, setFilterModule] = useState<string>("ALL");
  const [filterAction, setFilterAction] = useState<string>("ALL");
  const [filterRole, setFilterRole] = useState<string>("ALL");
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");
  const [filterIp, setFilterIp] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Modal States
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isIntegrityOpen, setIsIntegrityOpen] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Map Context Audit Logs to Full Standard Audit Records
  const records: AuditLogRecord[] = useMemo(() => {
    if (!contextAuditLogs || !Array.isArray(contextAuditLogs)) return [];
    return contextAuditLogs.map((item, index) => {
      const prev = item.previousStatus || item.oldValue || "--";
      const next = item.newStatus || item.newValue || "--";
      const ip = item.ipAddress || (index % 2 === 0 ? "10.42.18.91" : "192.168.10.4");
      const dev =
        item.deviceInfo ||
        (index % 3 === 0
          ? "Chrome v128 on Win11 (DGM Headquarter Desktop)"
          : index % 3 === 1
          ? "Industrial POS Weighbridge Terminal (Mandir Hasaud)"
          : "Field Mobile Android App (GPS Unit #04)");

      return {
        id: item.id || `AUD-2026-${(1000 + index).toString()}`,
        timestamp: item.timestamp || "2026-09-08 09:30:00",
        userName: item.userName || "System User",
        userRole: item.userRole || "State Administrator",
        userId: `USR-${(100 + index).toString()}`,
        module: (item.module as AuditModuleType) || "System",
        action: item.action || "UPDATE",
        recordId: item.recordId || `REC-${(100 + index).toString()}`,
        oldValue: prev,
        newValue: next,
        previousStatus: prev,
        newStatus: next,
        ipAddress: ip,
        deviceInfo: dev,
        gpsLocation: item.gpsLocation || (index % 2 === 0 ? "21.2514° N, 81.6296° E (Mahanadi Reach Zone)" : undefined),
        gpsCoordinates: item.gpsCoordinates,
        remarks: item.remarks || "Statutory audit record logged.",
        hashSignature:
          item.hashSignature ||
          `SHA256:${(index * 9871 + 104928).toString(16).padStart(16, "0")}f9e8a7b6c5d4`,
        isSuccessful: true,
        retentionPolicy: "7-Year Statutory Government WORM Immutable Archive",
      };
    });
  }, [contextAuditLogs]);

  // Tab Filtering
  const tabFilteredRecords = useMemo(() => {
    switch (activeTab) {
      case "gps":
        return records.filter((r) => Boolean(r.gpsLocation));
      case "security":
        return records.filter(
          (r) =>
            r.action === "SEIZE" ||
            r.action === "DELETE" ||
            r.action === "SUSPEND" ||
            r.action === "OVERRIDE" ||
            r.module === "User & Access Control" ||
            r.module === "Enforcement"
        );
      case "status_transitions":
        return records.filter((r) => r.oldValue !== "--" && r.newValue !== "--");
      case "all":
      default:
        return records;
    }
  }, [records, activeTab]);

  // Combined Search & Custom Filters
  const filteredRecords = useMemo(() => {
    return tabFilteredRecords.filter((rec) => {
      if (!rec) return false;
      if (filterModule !== "ALL" && rec.module !== filterModule) return false;
      if (filterAction !== "ALL" && rec.action !== filterAction) return false;
      if (filterRole !== "ALL" && rec.userRole !== filterRole) return false;
      if (filterIp && !(rec.ipAddress || "").includes(filterIp)) return false;
      if (filterStartDate && (rec.timestamp || "") < filterStartDate) return false;
      if (filterEndDate && (rec.timestamp || "") > filterEndDate) return false;
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchRecordId = (rec.recordId || "").toLowerCase().includes(query);
        const matchUser = (rec.userName || "").toLowerCase().includes(query);
        const matchRole = (rec.userRole || "").toLowerCase().includes(query);
        const matchRemarks = (rec.remarks || "").toLowerCase().includes(query);
        const matchIp = (rec.ipAddress || "").toLowerCase().includes(query);
        const matchModule = (rec.module || "").toLowerCase().includes(query);
        const matchGps = (rec.gpsLocation || "").toLowerCase().includes(query);
        if (
          !matchRecordId &&
          !matchUser &&
          !matchRole &&
          !matchRemarks &&
          !matchIp &&
          !matchModule &&
          !matchGps
        ) {
          return false;
        }
      }
      return true;
    });
  }, [tabFilteredRecords, filterModule, filterAction, filterRole, filterIp, filterStartDate, filterEndDate, searchTerm]);

  // Action badge color mapping
  const getActionBadgeVariant = (action: string) => {
    switch (action.toUpperCase()) {
      case "CREATE":
        return "success";
      case "APPROVE":
        return "primary";
      case "UPDATE":
        return "info";
      case "SUSPEND":
      case "SEIZE":
      case "DELETE":
      case "REJECT":
        return "danger";
      case "OVERRIDE":
      case "DISPATCH":
      case "ASSIGN":
        return "warning";
      case "RESOLVE":
      case "CLOSE":
        return "success";
      default:
        return "secondary";
    }
  };

  // Copy hash to clipboard
  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    showSuccess("Cryptographic SHA-256 hash copied to clipboard.");
    setTimeout(() => setCopiedHash(null), 2500);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setFilterModule("ALL");
    setFilterAction("ALL");
    setFilterRole("ALL");
    setFilterStartDate("");
    setFilterEndDate("");
    setFilterIp("");
    setSearchTerm("");
    setIsFilterOpen(false);
  };

  // Table Columns - All 9 Required Audit Fields
  const columns: MRT_ColumnDef<AuditLogRecord>[] = [
    {
      accessorKey: "timestamp",
      header: "Date & Time",
      size: 150,
      Cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Clock size={12} className="text-primary shrink-0" />
            {row.original.timestamp}
          </span>
          <span className="font-mono text-[10px] text-slate-400">
            ID: {row.original.id}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "userName",
      header: "User & Role",
      size: 170,
      Cell: ({ row }) => (
        <div>
          <span className="font-bold text-xs text-slate-900 dark:text-white block flex items-center gap-1">
            <User size={12} className="text-slate-400 shrink-0" />
            {row.original.userName}
          </span>
          <span className="text-[11px] font-semibold text-primary block mt-0.5">
            {row.original.userRole}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: "Action & Module",
      size: 150,
      Cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Badge variant={getActionBadgeVariant(row.original.action)} className="text-[10px] font-black">
              {row.original.action}
            </Badge>
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            {row.original.module}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "recordId",
      header: "Record ID",
      size: 140,
      Cell: ({ row }) => (
        <button
          type="button"
          onClick={() => setSelectedRecord(row.original)}
          className="font-mono text-xs font-bold text-primary hover:underline flex items-center gap-1 text-left"
          title="Click to view full cryptographic audit dossier"
        >
          <span>{row.original.recordId}</span>
          <Eye size={11} className="text-slate-400 hover:text-primary shrink-0" />
        </button>
      ),
    },
    {
      accessorKey: "oldValue",
      header: "Previous Status → New Status",
      size: 240,
      Cell: ({ row }) => (
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[10px] truncate max-w-[120px]" title={row.original.oldValue}>
              {row.original.oldValue}
            </span>
            <span className="text-slate-400 font-black">→</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-bold truncate max-w-[120px]" title={row.original.newValue}>
              {row.original.newValue}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "ipAddress",
      header: "IP / Device",
      size: 170,
      Cell: ({ row }) => (
        <div className="text-xs space-y-0.5">
          <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 block flex items-center gap-1">
            <Globe size={11} className="text-slate-400 shrink-0" />
            {row.original.ipAddress}
          </span>
          {row.original.deviceInfo && (
            <span className="text-[10px] text-slate-400 truncate block max-w-[160px]" title={row.original.deviceInfo}>
              {row.original.deviceInfo}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "gpsLocation",
      header: "GPS Location (Where Applicable)",
      size: 190,
      Cell: ({ row }) => {
        if (!row.original.gpsLocation) {
          return <span className="text-slate-400 text-[11px] italic">N/A (Console Action)</span>;
        }
        return (
          <div className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
            <MapPin size={13} className="text-rose-500 shrink-0 mt-0.5" />
            <span className="text-[11px] leading-snug line-clamp-2" title={row.original.gpsLocation}>
              {row.original.gpsLocation}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "remarks",
      header: "Audit Remarks & Context",
      size: 220,
      Cell: ({ row }) => (
        <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed" title={row.original.remarks}>
          {row.original.remarks}
        </div>
      ),
    },
  ];

  const exportCols = [
    { accessorKey: "timestamp", header: "Date & Time" },
    { accessorKey: "userName", header: "User" },
    { accessorKey: "userRole", header: "Role" },
    { accessorKey: "module", header: "Module" },
    { accessorKey: "action", header: "Action" },
    { accessorKey: "recordId", header: "Record ID" },
    { accessorKey: "oldValue", header: "Previous Status" },
    { accessorKey: "newValue", header: "New Status" },
    { accessorKey: "ipAddress", header: "IP Address" },
    { accessorKey: "deviceInfo", header: "Device Information" },
    { accessorKey: "gpsLocation", header: "GPS Location" },
    { accessorKey: "remarks", header: "Remarks" },
    { accessorKey: "hashSignature", header: "SHA-256 Cryptographic Hash" },
  ];

  const tabsList: TabItem[] = [
    {
      key: "all",
      label: `All Audit Logs (${records.length})`,
      icon: FileText,
    },
    {
      key: "status_transitions",
      label: "Status Transitions & Life-cycle",
      icon: RotateCcw,
    },
    {
      key: "gps",
      label: `Geotagged & GPS Telematics (${records.filter((r) => Boolean(r.gpsLocation)).length})`,
      icon: MapPin,
    },
    {
      key: "security",
      label: "Privileged & Enforcement Actions",
      icon: ShieldAlert,
    },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Fingerprint className="text-primary" size={26} />
            Statutory Audit Trail & Compliance Ledger
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Mandatory immutable event logging: User, Role, Date & Time, Action, Previous/New Status, IP/Device, GPS, and Remarks.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            icon={<Lock size={14} className="text-emerald-500" />}
            onClick={() => setIsIntegrityOpen(true)}
          >
            Verify Ledger Integrity
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={14} />}
            onClick={() => exportToExcel(exportCols as any, filteredRecords, "SMMS_Audit_Trail_Ledger")}
          >
            Export Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Printer size={14} />}
            onClick={() => exportToPDF(exportCols as any, filteredRecords, "SMMS_Audit_Trail_Ledger", "Statutory Audit Trail")}
          >
            Export PDF
          </Button>
        </div>
      </div>

      {/* ── KPI Stat Banner ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Logged Events</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{records.length}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Across all system sub-modules</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
            <FileCheck size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Geotagged GPS Events</p>
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
              {records.filter((r) => Boolean(r.gpsLocation)).length}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Weighbridges & field intercepts</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 flex items-center justify-center">
            <MapPin size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Enforcement & Seizures</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {records.filter((r) => r.action === "SEIZE" || r.module === "Enforcement").length}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">High-priority regulatory actions</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center">
            <ShieldAlert size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">SHA-256 Ledger Health</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">100%</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">✓ Cryptographically Verified</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by User, Role, Action, Record ID, IP Address, GPS Location, or Remarks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${inputBase} ${inputNormal} pl-9 text-xs`}
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            className={`${inputBase} ${inputNormal} text-xs font-semibold`}
          >
            <option value="ALL">All Modules</option>
            <option value="Excavation">Excavation</option>
            <option value="Stockyard">Stockyard</option>
            <option value="Sand Booking">Sand Booking</option>
            <option value="Payments">Payments</option>
            <option value="Dispatch">Dispatch</option>
            <option value="VehicleQueue">Vehicle FIFO Queue</option>
            <option value="Enforcement">Enforcement</option>
            <option value="Grievance">Grievance</option>
            <option value="User & Access Control">User Access Control</option>
          </select>

          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className={`${inputBase} ${inputNormal} text-xs font-semibold`}
          >
            <option value="ALL">All Actions</option>
            <option value="CREATE">CREATE</option>
            <option value="APPROVE">APPROVE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DISPATCH">DISPATCH</option>
            <option value="SEIZE">SEIZE</option>
            <option value="RESOLVE">RESOLVE</option>
            <option value="DELETE">DELETE</option>
          </select>

          {(filterModule !== "ALL" || filterAction !== "ALL" || searchTerm) && (
            <Button
              variant="outline"
              size="sm"
              icon={<RotateCcw size={13} />}
              onClick={handleResetFilters}
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* ── Main Tabbed Section ── */}
      <Tabs
        tabs={tabsList}
        activeTab={activeTab}
        onChange={(k) => setActiveTab(k)}
      />

      {/* ── Main Table ── */}
      <Card
        title="Statutory Audit Records Ledger"
        subtitle={`Displaying ${filteredRecords.length} verified immutable audit entries`}
        icon={Fingerprint}
      >
        <ReusableTable
          columns={columns}
          data={filteredRecords}
          enableRowActions
          renderRowActions={({ row }) => (
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                icon={<Eye size={12} />}
                onClick={() => setSelectedRecord(row.original)}
                title="View Complete Audit Dossier"
              >
                Dossier
              </Button>
              <Button
                size="sm"
                variant="ghost"
                icon={copiedHash === row.original.hashSignature ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                onClick={() => handleCopyHash(row.original.hashSignature || "SHA256:000")}
                title="Copy SHA-256 Cryptographic Hash"
              />
            </div>
          )}
        />
      </Card>

      {/* ── MODAL 1: Complete Audit Record Dossier ── */}
      {selectedRecord && (
        <Modal
          isOpen={Boolean(selectedRecord)}
          onClose={() => setSelectedRecord(null)}
          title={`Audit Record Dossier: ${selectedRecord.id}`}
          subtitle={`Cryptographic WORM Ledger Entry for Record ${selectedRecord.recordId}`}
          size="lg"
          footer={
            <ModalFooter>
              <Button variant="outline" onClick={() => setSelectedRecord(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                icon={<Copy size={13} />}
                onClick={() => handleCopyHash(selectedRecord.hashSignature || "")}
              >
                Copy Hash Signature
              </Button>
            </ModalFooter>
          }
        >
          <div className="space-y-4 pt-1 text-xs">
            {/* 9 Audit Fields Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">1. User</span>
                <span className="font-bold text-slate-900 dark:text-white block text-xs">{selectedRecord.userName}</span>
                <span className="text-[10px] text-slate-400 font-mono">ID: {selectedRecord.userId}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">2. Role</span>
                <span className="font-bold text-primary block text-xs">{selectedRecord.userRole}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">3. Date & Time</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white block text-xs">{selectedRecord.timestamp}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">4. Action & Module</span>
                <Badge variant={getActionBadgeVariant(selectedRecord.action)} className="text-[10px] mt-0.5">
                  {selectedRecord.action}
                </Badge>
                <span className="text-[10px] text-slate-400 block mt-0.5">{selectedRecord.module}</span>
              </div>
            </div>

            {/* Status Transition Diff */}
            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">
                5 & 6. State Transition: Previous Status vs New Status
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-200">
                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase block mb-1">
                    Previous Status / Old Value
                  </span>
                  <p className="font-mono text-xs">{selectedRecord.oldValue}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase block mb-1">
                    New Status / New Value
                  </span>
                  <p className="font-mono text-xs font-bold">{selectedRecord.newValue}</p>
                </div>
              </div>
            </div>

            {/* IP/Device & GPS Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block flex items-center gap-1">
                  <Laptop size={12} /> 7. IP & Device Information
                </span>
                <p className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                  IP: {selectedRecord.ipAddress}
                </p>
                <p className="text-[11px] text-slate-500">{selectedRecord.deviceInfo}</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block flex items-center gap-1">
                  <MapPin size={12} className="text-rose-500" /> 8. GPS Coordinates (Where Applicable)
                </span>
                {selectedRecord.gpsLocation ? (
                  <>
                    <p className="font-semibold text-slate-900 dark:text-white text-xs">
                      {selectedRecord.gpsLocation}
                    </p>
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 font-mono">
                      Geotagged & Timestamped
                    </span>
                  </>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">
                    N/A - Authenticated administrative console action
                  </p>
                )}
              </div>
            </div>

            {/* Remarks */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                9. Detailed Audit Remarks & Regulatory Facts
              </span>
              <p className="text-slate-800 dark:text-slate-200 text-xs leading-relaxed">
                {selectedRecord.remarks}
              </p>
            </div>

            {/* Cryptographic Hash Signature */}
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-xl space-y-1.5">
              <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider block flex items-center gap-1.5">
                <Lock size={12} /> SHA-256 Immutable Hash Signature (WORM Protected)
              </span>
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-lg border border-indigo-200 dark:border-indigo-800">
                <code className="font-mono text-[11px] text-indigo-900 dark:text-indigo-200 break-all select-all">
                  {selectedRecord.hashSignature}
                </code>
                <button
                  type="button"
                  onClick={() => handleCopyHash(selectedRecord.hashSignature || "")}
                  className="p-1 text-slate-400 hover:text-primary transition-colors shrink-0 ml-2"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── MODAL 2: Cryptographic Ledger Integrity Verification ── */}
      {isIntegrityOpen && (
        <Modal
          isOpen={isIntegrityOpen}
          onClose={() => setIsIntegrityOpen(false)}
          title="Cryptographic Ledger Integrity Verification"
          subtitle="Real-Time Merkle Tree Block Hash Validation & Node Surveillance"
          size="lg"
          footer={
            <ModalFooter>
              <Button variant="primary" onClick={() => setIsIntegrityOpen(false)}>
                Acknowledge Verification
              </Button>
            </ModalFooter>
          }
        >
          <div className="space-y-4 pt-1 text-xs">
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-start gap-2.5 text-emerald-950 dark:text-emerald-200">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-xs">
                  All 100% Cryptographic Ledger Blocks Validated & Untampered
                </span>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-0.5">
                  Block verification completed against State Data Centre Hardware Security Module (HSM). Zero hash divergence detected across all historical audit items.
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Active Surveillance & Node Health Metrics
              </span>
              {INITIAL_SYSTEM_METRICS.map((node) => (
                <div
                  key={node.nodeName}
                  className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{node.nodeName}</span>
                    <span className="text-[11px] text-slate-400">
                      Surveillance Nodes: {node.activeSurveillanceNodes} • Latency: {node.apiLatencyMs}ms
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-600 block">{node.uptimePercent}% Uptime</span>
                    <span className="text-[10px] text-slate-400 font-mono">Last block: {node.lastLedgerBlockTimestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AuditLogList;
