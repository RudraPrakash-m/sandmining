import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Pickaxe,
  Plus,
  Eye,
  Pencil,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  MapPin,
  FileText,
  Upload,
  Layers,
  ShieldCheck,
  ExternalLink,
  Calendar,
  Check,
  Radio,
  Video,
  UserCheck,
  Database,
  TrendingUp,
  AlertTriangle,
  Compass,
} from "lucide-react";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import type { MiningReach } from "@/features/shared-simulation/types";
import ReusableTable from "@/shared/components/ui/Table/ReusableTable/ReusableTable";
import type { MRT_ColumnDef } from "material-react-table";
import Button from "@/shared/components/ui/Button";
import Badge from "@/shared/components/ui/Badge";
import Card from "@/shared/components/layout/Card/Card";
import Modal, { ModalFooter } from "@/shared/components/ui/Modal/Modal";
import { useStatusModal } from "@/config/theme/StatusModalContext";
import { exportToExcel, exportToPDF } from "@/shared/utils/exportUtils";
import { routes } from "@/app/routes/routeConfig";
import "../styles/miningReach.css";

export const MiningReachList: React.FC = () => {
  const { reaches, updateReachStatus, stockyards } = useSandMining();
  const { showSuccess } = useStatusModal();
  const navigate = useNavigate();

  const [selectedReach, setSelectedReach] = useState<MiningReach | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<MiningReach["status"] | null>(null);

  // Key KPI Aggregations
  const stats = useMemo(() => {
    const total = reaches.length;
    const approved = reaches.filter((r) => r.status === "Approved").length;
    const totalApprovedMt = reaches.reduce((acc, r) => acc + (r.approvedQuantityMt || r.permittedQuantityMt || 0), 0);
    const totalAvailableMt = reaches.reduce((acc, r) => acc + (r.availableQuantityMt ?? (r.permittedQuantityMt - r.excavatedQuantityMt)), 0);
    const totalStockMt = reaches.reduce((acc, r) => acc + (r.currentStockMt || 0), 0);
    const monitoredReaches = reaches.filter((r) => r.electronicMonitoringEnabled !== false).length;

    return {
      total,
      approved,
      totalApprovedMt,
      totalAvailableMt,
      totalStockMt,
      monitoredReaches,
    };
  }, [reaches]);

  const handleStatusChange = (reach: MiningReach, action: MiningReach["status"]) => {
    setSelectedReach(reach);
    setPendingAction(action);
    setIsConfirmModalOpen(true);
  };

  const confirmStatusChange = () => {
    if (selectedReach && pendingAction) {
      updateReachStatus(selectedReach.id, pendingAction);
      showSuccess(`Reach ${selectedReach.reachId} marked as ${pendingAction}.`);
      setIsConfirmModalOpen(false);
      setSelectedReach(null);
    }
  };

  const getStatusBadge = (status: MiningReach["status"]) => {
    const map: Record<string, "success" | "warning" | "danger" | "secondary"> = {
      Approved: "success",
      "Active Operations": "success",
      "Under Verification": "warning",
      Draft: "secondary",
      "On Hold": "warning",
      Suspended: "danger",
      Expired: "secondary",
    };
    return <Badge variant={map[status] || "secondary"}>{status}</Badge>;
  };

  // Complete columns covering all 14 Sand Reach Master Specification Fields
  const columns: MRT_ColumnDef<MiningReach>[] = useMemo(
    () => [
      {
        accessorKey: "reachId",
        header: "Reach ID",
        size: 130,
        Cell: ({ row }) => (
          <div>
            <span className="font-mono font-bold text-blue-700 dark:text-blue-400 text-xs">
              {row.original.reachId}
            </span>
            {row.original.electronicMonitoringEnabled && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                <Radio size={10} className="animate-pulse" /> E-Monitored
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "reachName",
        header: "Reach Name",
        size: 190,
        Cell: ({ row }) => (
          <div>
            <span className="font-bold text-gray-900 dark:text-white text-xs block">
              {row.original.reachName}
            </span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              {row.original.riverStream}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "district",
        header: "District / Mandal / Village",
        size: 200,
        Cell: ({ row }) => (
          <div className="text-xs text-gray-800 dark:text-gray-200">
            <div className="font-semibold text-gray-900 dark:text-white">
              {row.original.district}
            </div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400">
              Block/Mandal: {row.original.block || row.original.mandal} • {row.original.village}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "sourceType",
        header: "Source Type",
        size: 160,
        Cell: ({ row }) => (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40">
            {row.original.sourceType || "Riverbed (In-stream)"}
          </span>
        ),
      },
      {
        accessorKey: "sandType",
        header: "Sand Type",
        size: 150,
        Cell: ({ row }) => (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40">
            {row.original.sandType || "Coarse River Sand"}
          </span>
        ),
      },
      {
        accessorKey: "approvedQuantityMt",
        header: "Approved Qty",
        size: 130,
        Cell: ({ row }) => {
          const qty = row.original.approvedQuantityMt || row.original.permittedQuantityMt;
          return (
            <span className="font-bold text-xs text-gray-900 dark:text-white">
              {qty?.toLocaleString()} MT
            </span>
          );
        },
      },
      {
        accessorKey: "availableQuantityMt",
        header: "Available Qty",
        size: 130,
        Cell: ({ row }) => {
          const avail = row.original.availableQuantityMt ?? (row.original.permittedQuantityMt - row.original.excavatedQuantityMt);
          return (
            <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
              {avail?.toLocaleString()} MT
            </span>
          );
        },
      },
      {
        accessorKey: "currentStockMt",
        header: "Current Stock",
        size: 130,
        Cell: ({ row }) => (
          <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400">
            {(row.original.currentStockMt || 0).toLocaleString()} MT
          </span>
        ),
      },
      {
        accessorKey: "responsibleOfficer",
        header: "Responsible Officer",
        size: 180,
        Cell: ({ row }) => (
          <div className="text-xs">
            <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
              <UserCheck size={12} className="text-blue-500" />
              {row.original.responsibleOfficer || "Nodal Mining Inspector"}
            </p>
            {row.original.responsibleOfficerContact && (
              <p className="text-[10px] text-gray-500 font-mono">
                {row.original.responsibleOfficerContact}
              </p>
            )}
          </div>
        ),
      },
      {
        accessorKey: "gpsCoordinates",
        header: "GPS Coordinates",
        size: 160,
        Cell: ({ row }) => (
          <button
            type="button"
            onClick={() => {
              setSelectedReach(row.original);
              setIsMapModalOpen(true);
            }}
            className="text-xs font-mono text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <MapPin size={12} className="text-rose-500" />
            <span>
              {row.original.gpsCoordinates || `${row.original.latitude.toFixed(4)}° N, ${row.original.longitude.toFixed(4)}° E`}
            </span>
          </button>
        ),
      },
      {
        accessorKey: "validityDates",
        header: "Validity",
        size: 160,
        Cell: ({ row }) => (
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {row.original.validityStartDate} to {row.original.validityEndDate}
          </span>
        ),
      },
      {
        accessorKey: "documentsCount",
        header: "Documents",
        size: 120,
        Cell: ({ row }) => (
          <button
            type="button"
            onClick={() => {
              setSelectedReach(row.original);
              setIsDocModalOpen(true);
            }}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <FileText size={13} />
            <span>{row.original.documentsCount || 3} Files</span>
          </button>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 130,
        Cell: ({ row }) => getStatusBadge(row.original.status),
      },
    ],
    []
  );

  const exportCols = columns.map((c) => ({
    accessorKey: c.accessorKey as string,
    header: c.header as string,
  }));

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header Info & TGMD Model Notice */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-amber-600/10 via-blue-600/10 to-indigo-600/10 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/40">
        <div>
          <div className="flex items-center gap-2">
            <Pickaxe className="text-amber-600 dark:text-amber-400" size={22} />
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              Sand Reach Master Management
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-300">
              TGMD Council Model
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Electronic documentation, GPS geofenced sand-bearing extraction reaches, quota accounting, and stockyard linkages.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={<MapPin size={14} />}
            onClick={() => navigate(routes.gisMap.path)}
          >
            GIS Live Map
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={<Plus size={15} />}
            onClick={() => navigate(routes.addMiningReach.path)}
          >
            Register Sand Reach
          </Button>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-gray-800 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Total Reaches</span>
            <Layers size={16} className="text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</span>
            <span className="text-xs text-emerald-600 font-medium">({stats.approved} Active)</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Approved Quota</span>
            <TrendingUp size={16} className="text-amber-500" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-amber-600">{stats.totalApprovedMt.toLocaleString()}</span>
            <span className="text-[11px] text-gray-500 ml-1">MT</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Available Balance</span>
            <Database size={16} className="text-emerald-500" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-emerald-600">{stats.totalAvailableMt.toLocaleString()}</span>
            <span className="text-[11px] text-gray-500 ml-1">MT</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Current Stock</span>
            <Pickaxe size={16} className="text-indigo-500" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-indigo-600">{stats.totalStockMt.toLocaleString()}</span>
            <span className="text-[11px] text-gray-500 ml-1">MT at Apron</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>E-Monitoring & CCTV</span>
            <Radio size={16} className="text-emerald-500 animate-pulse" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">{stats.monitoredReaches} / {stats.total}</span>
            <span className="text-[10px] text-emerald-600 font-semibold">Live GPS</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <Card
        title="Sand Reach Master Directory"
        icon={Layers}
        subtitle="Sanctioned Sand Bearings & Quarries (TGMD Council Specification)"
        action={
          <Button
            size="sm"
            variant="primary"
            icon={<Plus size={15} />}
            onClick={() => navigate(routes.addMiningReach.path)}
          >
            Add Sand Reach
          </Button>
        }
      >
        <ReusableTable
          columns={columns}
          data={reaches}
          enableExport={true}
          exportFileName="sand_reach_master_records"
          onExportExcel={(rows) => exportToExcel(exportCols, rows, "sand_reach_master_records")}
          onExportPDF={(rows) => exportToPDF(exportCols, rows, "sand_reach_master_records", "Sand Reach Master Directory")}
          enableRowActions={true}
          renderRowActions={({ row }) => {
            const reach = row.original;
            const isApproved = reach.status === "Approved" || reach.status === "Active Operations";
            const isOnHold = reach.status === "On Hold";
            const isSuspendedOrExpired = reach.status === "Suspended" || reach.status === "Expired";
            const canEdit = !isSuspendedOrExpired;
            const canApprove = reach.status === "Draft" || reach.status === "Under Verification";
            const canHold = isApproved;

            return (
              <div className="flex items-center gap-1.5 justify-center">
                {/* 1. View Details (Always Enabled) */}
                <button
                  type="button"
                  title="View Full Sand Reach Master Dossier"
                  onClick={() => {
                    setSelectedReach(reach);
                    setIsDetailModalOpen(true);
                  }}
                  className="w-7 h-7 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Eye size={14} />
                </button>

                {/* 2. Edit Reach */}
                <button
                  type="button"
                  title={canEdit ? "Edit Sand Reach" : "Editing disabled for suspended/expired reaches"}
                  disabled={!canEdit}
                  onClick={() => {
                    if (canEdit) navigate(routes.addMiningReach.path);
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    canEdit
                      ? "bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-600 dark:text-amber-400 cursor-pointer"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                  }`}
                >
                  <Pencil size={14} />
                </button>

                {/* 3. Upload Documents */}
                <button
                  type="button"
                  title={!isSuspendedOrExpired ? "Statutory Documents & Clearances" : "Upload disabled"}
                  disabled={isSuspendedOrExpired}
                  onClick={() => {
                    if (!isSuspendedOrExpired) {
                      setSelectedReach(reach);
                      setIsDocModalOpen(true);
                    }
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    !isSuspendedOrExpired
                      ? "bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-600 dark:text-purple-400 cursor-pointer"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                  }`}
                >
                  <Upload size={14} />
                </button>

                {/* 4. View Map */}
                <button
                  type="button"
                  title="View GPS Geofence & Boundary"
                  onClick={() => {
                    setSelectedReach(reach);
                    setIsMapModalOpen(true);
                  }}
                  className="w-7 h-7 rounded-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <MapPin size={14} />
                </button>

                {/* 5. Approve Action */}
                <button
                  type="button"
                  title={canApprove ? "Approve Sand Reach" : isApproved ? "Reach is already approved" : "Approval not available"}
                  disabled={!canApprove}
                  onClick={() => {
                    if (canApprove) handleStatusChange(reach, "Approved");
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    canApprove
                      ? "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 cursor-pointer"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                  }`}
                >
                  <CheckCircle2 size={14} />
                </button>

                {/* 6. Hold / Resume Action */}
                {isOnHold ? (
                  <button
                    type="button"
                    title="Resume Sand Reach Operations"
                    onClick={() => handleStatusChange(reach, "Approved")}
                    className="w-7 h-7 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <PlayCircle size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    title={canHold ? "Hold Sand Reach Operations" : "Hold only available for active reaches"}
                    disabled={!canHold}
                    onClick={() => {
                      if (canHold) handleStatusChange(reach, "On Hold");
                    }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                      canHold
                        ? "bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 cursor-pointer"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                    }`}
                  >
                    <PauseCircle size={14} />
                  </button>
                )}
              </div>
            );
          }}
        />
      </Card>

      {/* ── DETAIL MODAL (ALL 14 SPECIFICATION FIELDS) ── */}
      {selectedReach && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Sand Reach Master: ${selectedReach.reachName}`}
          subtitle={`Reach ID: ${selectedReach.reachId} • TGMD Council Electronic Monitoring`}
          size="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-500 font-medium">
                  {selectedReach.electronicMonitoringEnabled ? "🟢 Telemetry Live" : "⚪ Offline"}
                </span>
              </div>
              <Button size="sm" variant="primary" onClick={() => setIsDetailModalOpen(false)}>
                Close Dossier
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
            {/* Reach Master 14 Core Fields Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">1. Reach ID</p>
                <p className="font-mono font-bold text-blue-600 text-sm mt-0.5">{selectedReach.reachId}</p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">2. Reach Name</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{selectedReach.reachName}</p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">3. District</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{selectedReach.district}</p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">4. Block / Mandal</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{selectedReach.block || selectedReach.mandal}</p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">5. Village</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{selectedReach.village}</p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">6. Source Type</p>
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded font-semibold text-[11px] bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300">
                  {selectedReach.sourceType || "Riverbed (In-stream Perennial)"}
                </span>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">7. Sand Type</p>
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded font-semibold text-[11px] bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 border border-blue-300">
                  {selectedReach.sandType || "Coarse River Sand"}
                </span>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">8. Approved Quantity</p>
                <p className="font-bold text-blue-700 dark:text-blue-400 text-sm mt-0.5">
                  {(selectedReach.approvedQuantityMt || selectedReach.permittedQuantityMt)?.toLocaleString()} MT
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">9. Available Quantity</p>
                <p className="font-bold text-emerald-600 text-sm mt-0.5">
                  {(selectedReach.availableQuantityMt ?? (selectedReach.permittedQuantityMt - selectedReach.excavatedQuantityMt))?.toLocaleString()} MT
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">10. Current Stock</p>
                <p className="font-bold text-indigo-600 text-sm mt-0.5">
                  {(selectedReach.currentStockMt || 0)?.toLocaleString()} MT
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">11. Status</p>
                <div className="mt-0.5">{getStatusBadge(selectedReach.status)}</div>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">12. Validity Period</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  {selectedReach.validityStartDate} to {selectedReach.validityEndDate}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">13. Responsible Officer</p>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedReach.responsibleOfficer || "Er. Rameshwar Sharma"}
                </p>
                <p className="text-[10px] text-slate-500">
                  {selectedReach.responsibleOfficerDesignation || "Assistant Director / Mining Officer"}
                </p>
                {selectedReach.responsibleOfficerContact && (
                  <p className="text-[10px] text-blue-600 font-mono">
                    {selectedReach.responsibleOfficerContact}
                  </p>
                )}
              </div>

              <div className="col-span-2">
                <p className="text-[10px] uppercase font-bold text-slate-400">14. GPS Coordinates & Geofence</p>
                <p className="font-mono font-semibold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1.5">
                  <MapPin size={13} className="text-rose-500" />
                  {selectedReach.gpsCoordinates || `${selectedReach.latitude.toFixed(4)}° N, ${selectedReach.longitude.toFixed(4)}° E`}
                  <span className="text-[10px] font-sans font-normal text-slate-500">
                    (Radius: {selectedReach.geofenceRadiusMeters || 400}m)
                  </span>
                </p>
              </div>

              <div className="col-span-2 sm:col-span-3 pt-2 border-t border-slate-200/60 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Environmental Clearance (EC) Reference</p>
                  <p className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {selectedReach.environmentalClearanceRef}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Linked Sand Stockyard / Depot</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {selectedReach.linkedStockyardName || selectedReach.linkedStockyardId || "Central Depot Hub"}
                  </p>
                </div>
              </div>
            </div>

            {/* Telangana TGMD Council Compliance Banner */}
            <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-100 dark:border-blue-900">
              <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-200 mb-1">
                <ShieldCheck size={16} className="text-blue-600" />
                <span>TGMD Council Distinction: Sand-Bearing Reach vs Stockyard</span>
              </div>
              <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
                Under the Telangana State Sand Mining Management Framework (TGMD Council), this sand reach is designated as an <strong>in-stream extraction quarry</strong> with electronic transit pass generation, automated weighbridge integration, and real-time CCTV monitoring. It feeds into linked secondary stockyards for buffer storage and retail vehicle dispatch.
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* ── GEOFENCE / MAP MODAL ── */}
      {selectedReach && (
        <Modal
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          title={`GPS Geofence Perimeter: ${selectedReach.reachName}`}
          subtitle={`Reach ID: ${selectedReach.reachId} • River Basin: ${selectedReach.riverStream}`}
          size="md"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] text-slate-500">Live Satellite & Drone Geofenced Boundary</span>
              <Button
                size="sm"
                variant="outline"
                icon={<ExternalLink size={13} />}
                onClick={() => {
                  setIsMapModalOpen(false);
                  navigate(routes.gisMap.path);
                }}
              >
                Open Full GIS Map
              </Button>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="reach-geofence-box p-4 rounded-2xl space-y-2 text-slate-800 dark:text-slate-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <Compass size={16} className="text-blue-600" />
                  {selectedReach.riverStream} ({selectedReach.district})
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white flex items-center gap-1">
                  <Radio size={10} className="animate-pulse" /> Geofence Active
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Official GPS Centroid: <strong className="font-mono text-slate-900 dark:text-white">{selectedReach.latitude.toFixed(4)}° N, {selectedReach.longitude.toFixed(4)}° E</strong> (Buffer Radius: {selectedReach.geofenceRadiusMeters || 450}m)
              </p>
              <div className="grid grid-cols-2 gap-2 font-mono text-[11px] pt-1">
                <div className="p-2 bg-white/80 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                  P1 (North Boundary): {selectedReach.latitude.toFixed(4)}° N, {selectedReach.longitude.toFixed(4)}° E
                </div>
                <div className="p-2 bg-white/80 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                  P2 (East Bank): {(selectedReach.latitude + 0.004).toFixed(4)}° N, {(selectedReach.longitude + 0.005).toFixed(4)}° E
                </div>
                <div className="p-2 bg-white/80 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                  P3 (South Loading Apron): {(selectedReach.latitude - 0.003).toFixed(4)}° N, {(selectedReach.longitude + 0.004).toFixed(4)}° E
                </div>
                <div className="p-2 bg-white/80 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                  P4 (West Approach Road): {(selectedReach.latitude - 0.002).toFixed(4)}° N, {(selectedReach.longitude - 0.003).toFixed(4)}° E
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video size={16} className="text-emerald-600" />
                <span className="text-[11px] font-semibold text-emerald-900 dark:text-emerald-200">
                  ANPR & CCTV Surveillance at Exit Weighbridge
                </span>
              </div>
              <Badge variant="success">Operational</Badge>
            </div>
          </div>
        </Modal>
      )}

      {/* ── DOCUMENTS MODAL ── */}
      {selectedReach && (
        <Modal
          isOpen={isDocModalOpen}
          onClose={() => setIsDocModalOpen(false)}
          title={`Electronic Documentation & Clearances`}
          subtitle={`Reach Code: ${selectedReach.reachId} • ${selectedReach.reachName}`}
          size="md"
          footer={
            <div className="flex items-center justify-end w-full">
              <Button size="sm" variant="primary" onClick={() => setIsDocModalOpen(false)}>
                Done
              </Button>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="space-y-2">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileText size={18} className="text-red-500" />
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      SEIAA Environmental Clearance (EC) Certificate
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {selectedReach.environmentalClearanceRef} • 2.4 MB PDF
                    </p>
                  </div>
                </div>
                <Badge variant="success">Verified</Badge>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileText size={18} className="text-blue-500" />
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      Approved Progressive Mining & Replenishment Plan
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      PLAN-TGMD-REACH-2026 • 4.8 MB PDF
                    </p>
                  </div>
                </div>
                <Badge variant="success">Verified</Badge>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileText size={18} className="text-emerald-500" />
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      Consent to Operate (CTO) - State Pollution Control Board
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      CTO/SPCB/AIR-WATER/2026 • 1.6 MB PDF
                    </p>
                  </div>
                </div>
                <Badge variant="success">Verified</Badge>
              </div>
            </div>

            <div className="doc-upload-zone p-4 rounded-xl text-center cursor-pointer border border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 transition-colors">
              <Upload size={20} className="mx-auto text-blue-500 mb-1" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                Click to upload additional statutory NOCs, Bathymetric reports, or Geo-tagged site photos
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Max size 25MB (PDF, PNG, JPG)</p>
            </div>
          </div>
        </Modal>
      )}

      {/* ── WORKFLOW STATUS CONFIRMATION MODAL ── */}
      {selectedReach && pendingAction && (
        <Modal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          title={`Confirm Reach Status Change`}
          size="sm"
          footer={
            <ModalFooter
              onClose={() => setIsConfirmModalOpen(false)}
              onConfirm={confirmStatusChange}
              confirmText={`Confirm ${pendingAction}`}
            />
          }
        >
          <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 py-1">
            <p>
              Are you sure you want to change the status of Reach{" "}
              <strong className="text-slate-900 dark:text-white font-mono">
                {selectedReach.reachId} ({selectedReach.reachName})
              </strong>{" "}
              to <strong className="text-blue-600 font-bold">{pendingAction}</strong>?
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MiningReachList;
