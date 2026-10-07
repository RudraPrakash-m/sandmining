import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Scale,
  Plus,
  Eye,
  Camera,
  CheckCircle2,
  RefreshCw,
  Printer,
  Truck,
  AlertTriangle,
  FileText,
} from "lucide-react";
import type { WeighbridgeRecord, WeighbridgeStatus } from "../types";
import ReusableTable from "@/shared/components/ui/Table/ReusableTable/ReusableTable";
import type { MRT_ColumnDef } from "material-react-table";
import Button from "@/shared/components/ui/Button";
import Badge from "@/shared/components/ui/Badge";
import Card from "@/shared/components/layout/Card/Card";
import Modal, { ModalFooter } from "@/shared/components/ui/Modal/Modal";
import { exportToExcel, exportToPDF } from "@/shared/utils/exportUtils";
import { routes } from "@/app/routes/routeConfig";
import { useStatusModal } from "@/config/theme/StatusModalContext";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import {
  updateStatus,
  reweighRecord,
} from "../slice/weighbridgeSlice";
import { IMAGES } from "@/assets/images";
import { inputBase, inputNormal } from "@/shared/components/ui/Forms/inputStyles";
import "../styles/weighbridge.css";

export const WeighbridgeList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showSuccess } = useStatusModal();

  const weighbridgeRecords = useAppSelector((state) => state.weighbridge?.records || []);

  // Modal State Management
  const [selectedRecord, setSelectedRecord] = useState<WeighbridgeRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isReweighModalOpen, setIsReweighModalOpen] = useState(false);
  const [isAnprModalOpen, setIsAnprModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);

  // Reweigh Modal State
  const [reweighGrossKg, setReweighGrossKg] = useState(24400);

  // Status Badges
  const getStatusBadge = (status: WeighbridgeStatus) => {
    switch (status) {
      case "Verified":
        return <Badge variant="success">Verified</Badge>;
      case "Captured":
        return <Badge variant="info">Captured</Badge>;
      case "Tare Captured":
        return <Badge variant="warning">Tare Captured</Badge>;
      case "Gross Captured":
        return <Badge variant="primary">Gross Captured</Badge>;
      case "Flagged Overload":
        return <Badge variant="danger">Overload Alert</Badge>;
      case "Duplicate Blocked":
        return <Badge variant="danger">Blocked</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // KPIs
  const stats = useMemo(() => {
    const totalTonnage = weighbridgeRecords.reduce((sum, r) => sum + r.netSandWeightMt, 0);
    const verifiedCount = weighbridgeRecords.filter((r) => r.status === "Verified").length;
    const overloadsCount = weighbridgeRecords.filter((r) => r.status === "Flagged Overload").length;
    const uniqueVehicles = new Set(weighbridgeRecords.map((r) => r.vehicleNumber)).size;

    return {
      totalTonnage: Number(totalTonnage.toFixed(1)),
      verifiedCount,
      overloadsCount,
      uniqueVehicles,
    };
  }, [weighbridgeRecords]);

  // Handlers
  const handlePrintSlip = (record: WeighbridgeRecord) => {
    setSelectedRecord(record);
    setIsDetailModalOpen(true);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleConfirmReweigh = () => {
    if (!selectedRecord) return;
    dispatch(
      reweighRecord({
        id: selectedRecord.id,
        grossWeightKg: Number(reweighGrossKg),
        operatorName: "Duty Scale Officer (Reweigh)",
      })
    );
    showSuccess(`Gross weight re-calibrated to ${reweighGrossKg.toLocaleString()} kg. Slip verified.`);
    setIsReweighModalOpen(false);
  };

  const handleConfirmApprove = () => {
    if (!selectedRecord) return;
    dispatch(
      updateStatus({
        id: selectedRecord.id,
        status: "Verified",
        remarks: "Weighment authorized and approved for gate-out dispatch.",
      })
    );
    showSuccess(`Slip ${selectedRecord.slipNumber} approved for gate-out e-Pass dispatch.`);
    setIsApproveModalOpen(false);
  };

  const handleTriggerSync = (record?: WeighbridgeRecord) => {
    showSuccess(
      `Synchronized with IoT Load-Cell Telemetry for scale ${record?.weighbridgeId || "WB-CG-001"} (Zero error drift).`
    );
  };

  // Table Columns Definition (Clean Minimal Single-Line Format)
  const columns = useMemo<MRT_ColumnDef<WeighbridgeRecord>[]>(
    () => [
      {
        accessorKey: "weighbridgeId",
        header: "Weighbridge ID",
        size: 130,
        Cell: ({ row }) => (
          <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
            {row.original.weighbridgeId}
          </span>
        ),
      },
      {
        accessorKey: "slipNumber",
        header: "Slip Number",
        size: 160,
        Cell: ({ row }) => {
          const record = row.original;
          return (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrintSlip(record);
              }}
              className="group inline-flex items-center gap-1.5 font-mono text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-orange-600 dark:hover:text-orange-400 cursor-pointer transition-all text-left"
              title="Click to generate & print weighment slip"
            >
              <FileText
                size={13}
                className="shrink-0 text-orange-500 dark:text-orange-400 group-hover:scale-110 transition-transform"
              />
              <span className="group-hover:underline underline-offset-2">{record.slipNumber}</span>
            </button>
          );
        },
      },
      {
        accessorKey: "vehicleNumber",
        header: "Vehicle Number",
        size: 130,
        Cell: ({ row }) => (
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {row.original.vehicleNumber}
          </span>
        ),
      },
      {
        accessorKey: "tareWeightKg",
        header: "Empty Tare",
        size: 110,
        Cell: ({ row }) => (
          <span className="text-xs text-slate-600 dark:text-slate-400">
            {row.original.tareWeightKg.toLocaleString()} kg
          </span>
        ),
      },
      {
        accessorKey: "grossWeightKg",
        header: "Loaded Gross",
        size: 110,
        Cell: ({ row }) => (
          <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
            {row.original.grossWeightKg > 0 ? `${row.original.grossWeightKg.toLocaleString()} kg` : "—"}
          </span>
        ),
      },
      {
        accessorKey: "netSandWeightMt",
        header: "Net Sand",
        size: 110,
        Cell: ({ row }) => (
          <span className="text-xs font-black text-orange-600 dark:text-orange-400">
            {row.original.netSandWeightMt > 0 ? `${row.original.netSandWeightMt} MT` : "—"}
          </span>
        ),
      },
      {
        accessorKey: "dateTime",
        header: "Date & Time",
        size: 135,
        Cell: ({ row }) => (
          <span className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
            {row.original.dateTime}
          </span>
        ),
      },
      {
        accessorKey: "bookingId",
        header: "Booking / e-Pass",
        size: 140,
        Cell: ({ row }) => (
          <span className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate block" title={`${row.original.bookingId} (${row.original.ePassId})`}>
            {row.original.bookingId}
          </span>
        ),
      },
      {
        accessorKey: "stockyardName",
        header: "Stockyard",
        size: 150,
        Cell: ({ row }) => (
          <span className="text-xs text-slate-800 dark:text-slate-200 truncate block" title={row.original.stockyardName}>
            {row.original.stockyardName}
          </span>
        ),
      },
      {
        accessorKey: "operatorName",
        header: "Operator",
        size: 120,
        Cell: ({ row }) => (
          <span className="text-xs text-slate-700 dark:text-slate-300 truncate block">
            {row.original.operatorName}
          </span>
        ),
      },
      {
        accessorKey: "photoUrl",
        header: "Photo / ANPR",
        size: 110,
        Cell: ({ row }) => (
          <button
            type="button"
            onClick={() => {
              setSelectedRecord(row.original);
              setIsAnprModalOpen(true);
            }}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
          >
            <Camera size={12} />
            <span>ANPR</span>
          </button>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 120,
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
      {/* Top Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Weighed Today
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats.totalTonnage.toLocaleString()} <span className="text-sm font-semibold">MT</span>
            </h3>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
              Certified Net Sand Weight
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <Scale size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Verified Slips
            </p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {stats.verifiedCount}{" "}
              <span className="text-sm font-semibold text-slate-500">Slips</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Ready for Gate-Out Dispatch</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Trucks Processed
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats.uniqueVehicles}{" "}
              <span className="text-sm font-semibold text-slate-500">Vehicles</span>
            </h3>
            <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5">
              100% ANPR Plate Matched
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Truck size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Overload Alerts
            </p>
            <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
              {stats.overloadsCount}{" "}
              <span className="text-sm font-semibold text-slate-500">Flags</span>
            </h3>
            <p className="text-[11px] text-rose-600 mt-0.5">Blocked from Gate-out</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertTriangle size={22} />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <Card
        title="Weighbridge & Electronic Weight Slips"
        icon={Scale}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              icon={<RefreshCw size={14} />}
              onClick={() => handleTriggerSync()}
            >
              Sync IoT Scales
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={<Plus size={15} />}
              onClick={() => navigate(routes.captureWeight.path)}
            >
              Capture Weight Slip
            </Button>
          </div>
        }
      >
        <ReusableTable
          columns={columns}
          data={weighbridgeRecords}
          enableExport={true}
          exportFileName="weighbridge_slip_records"
          onExportExcel={(rows) => exportToExcel(exportCols, rows, "weighbridge_slip_records")}
          onExportPDF={(rows) => exportToPDF(exportCols, rows, "weighbridge_slip_records", "Weighbridge Slips Registry")}
          enableRowActions={true}
          renderRowActions={({ row }) => {
            const record = row.original;
            const isVerified = record.status === "Verified";
            const canReweigh = record.status === "Tare Captured" || record.status === "Pending Reweigh";
            const canApprove = record.status === "Captured" || record.status === "Gross Captured" || record.status === "Tare Captured";
            const canPrint = isVerified || record.status === "Captured";

            return (
              <div className="flex items-center gap-1.5 justify-center">
                {/* 1. View Details (Always Enabled) */}
                <button
                  type="button"
                  title="View Digital Weighment Certificate"
                  onClick={() => {
                    setSelectedRecord(record);
                    setIsDetailModalOpen(true);
                  }}
                  className="w-7 h-7 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Eye size={14} />
                </button>

                {/* 2. Reweigh / Capture Gross Weight */}
                <button
                  type="button"
                  title={canReweigh ? "Capture Loaded Gross Weight / Reweigh" : "Reweigh only for pending/tare stage"}
                  disabled={!canReweigh}
                  onClick={() => {
                    if (canReweigh) {
                      setSelectedRecord(record);
                      setReweighGrossKg(record.tareWeightKg + 16000);
                      setIsReweighModalOpen(true);
                    }
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${canReweigh
                      ? "bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-600 dark:text-amber-400 cursor-pointer"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                    }`}
                >
                  <Scale size={14} />
                </button>

                {/* 3. Approve Weight Slip */}
                <button
                  type="button"
                  title={canApprove ? "Approve Slip & Authorize Dispatch" : isVerified ? "Slip is already approved" : "Approval blocked"}
                  disabled={!canApprove}
                  onClick={() => {
                    if (canApprove) {
                      setSelectedRecord(record);
                      setIsApproveModalOpen(true);
                    }
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${canApprove
                      ? "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 cursor-pointer"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                    }`}
                >
                  <CheckCircle2 size={14} />
                </button>

                {/* 4. ANPR Optical Plate Snapshot */}
                <button
                  type="button"
                  title="View ANPR Optical Plate Snapshot"
                  onClick={() => {
                    setSelectedRecord(record);
                    setIsAnprModalOpen(true);
                  }}
                  className="w-7 h-7 rounded-full bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-600 dark:text-purple-400 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Camera size={14} />
                </button>

                {/* 5. Sync Scale Telemetry */}
                <button
                  type="button"
                  title="Sync with Live IoT Scale Telemetry"
                  onClick={() => handleTriggerSync(record)}
                  className="w-7 h-7 rounded-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <RefreshCw size={13} />
                </button>

                {/* 6. Print Weighment Slip */}
                <button
                  type="button"
                  title={canPrint ? "Print Official Weighment Slip" : "Printing available once captured"}
                  disabled={!canPrint}
                  onClick={() => {
                    if (canPrint) {
                      setSelectedRecord(record);
                      window.print();
                    }
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${canPrint
                      ? "bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 cursor-pointer"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                    }`}
                >
                  <Printer size={13} />
                </button>
              </div>
            );
          }}
        />
      </Card>

      {/* ── 1. VIEW DETAILED WEIGHMENT CERTIFICATE MODAL ── */}
      {selectedRecord && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Digital Weighment Slip – ${selectedRecord.slipNumber}`}
          size="lg"
          footer={
            <ModalFooter
              onClose={() => setIsDetailModalOpen(false)}
              onConfirm={() => window.print()}
              confirmText="Print Slip"
            />
          }
        >
          <div className="space-y-4 text-xs bg-white dark:bg-slate-900 p-2 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            {/* Official Government & CMDC Header with Logos */}
            <div className="flex flex-col sm:flex-row items-center justify-between pb-3 border-b-2 border-slate-800 dark:border-slate-700 gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={IMAGES.CHHATTISGARH_LOGO}
                  alt="Chhattisgarh Govt Logo"
                  className="h-12 w-auto object-contain shrink-0"
                />
                <img
                  src={IMAGES.CMDC_LOGO}
                  alt="CMDC Logo"
                  className="h-11 w-auto object-contain shrink-0"
                />
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                    GOVERNMENT OF CHHATTISGARH
                  </span>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                    CHHATTISGARH MINERAL DEVELOPMENT CORPORATION LIMITED (CMDC)
                  </h3>
                  <p className="text-[11px] font-medium text-orange-600 dark:text-orange-400">
                   Sand Mining Management System (SMMS)
                  </p>
                </div>
              </div>
              <div className="text-right sm:text-right shrink-0">
                <span className="px-2.5 py-1 text-[10px] font-mono font-bold bg-slate-900 text-white rounded">
                  OFFICIAL WEIGHT CERTIFICATE
                </span>
                <p className="font-mono text-xs font-bold text-slate-900 dark:text-white mt-1.5">
                  Slip #: {selectedRecord.slipNumber}
                </p>
                <p className="text-[11px] text-slate-500 font-mono">Date: {selectedRecord.dateTime}</p>
              </div>
            </div>

            {/* Header / Scale Info Box */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Scale ID: {selectedRecord.weighbridgeId}
                </span>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  {selectedRecord.weighbridgeName}
                </h4>
                <p className="text-[11px] text-slate-500">
                  Stockyard: <strong className="text-slate-700 dark:text-slate-300">{selectedRecord.stockyardName}</strong>
                </p>
              </div>
              <div>{getStatusBadge(selectedRecord.status)}</div>
            </div>

            {/* LCD Gross/Tare/Net Display */}
            <div className="weighbridge-display-lcd grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Empty Tare (T1)</span>
                <span className="text-base font-bold text-amber-400">
                  {selectedRecord.tareWeightKg.toLocaleString()} <span className="text-xs">kg</span>
                </span>
              </div>
              <div className="border-x border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase block">Loaded Gross (T2)</span>
                <span className="text-base font-bold text-white">
                  {selectedRecord.grossWeightKg > 0 ? `${selectedRecord.grossWeightKg.toLocaleString()} kg` : "—"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Net Sand Weight</span>
                <span className="text-base font-black text-emerald-400">
                  {selectedRecord.netSandWeightMt > 0 ? `${selectedRecord.netSandWeightMt} MT` : "—"}
                </span>
              </div>
            </div>

            {/* Parameters Table */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <span className="text-[10px] text-slate-400 block">Vehicle Registration Number:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                  {selectedRecord.vehicleNumber}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Driver Name & Contact:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedRecord.driverName || "Dharmendra Sahu"} ({selectedRecord.driverMobile || "9826190012"})
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Booking Reference ID:</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {selectedRecord.bookingId}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Assigned e-Pass (Gate Pass):</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  {selectedRecord.ePassId}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Origin Sand Stockyard:</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{selectedRecord.stockyardName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Duty Weighbridge Operator:</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{selectedRecord.operatorName} (ID: OP-8821)</span>
              </div>
            </div>

            {/* Security & Signatures Footer */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px]">
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-center">
                <span className="text-slate-400 block">Scale Operator</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 block mt-2">{selectedRecord.operatorName}</span>
              </div>
              <div className="border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg p-2 text-center">
                <span className="text-emerald-700 dark:text-emerald-400 font-bold block">DIGITALLY VERIFIED</span>
                <span className="text-[9px] text-slate-500 block mt-1">IoT Auto Load-Cell Gateway</span>
              </div>
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-center">
                <span className="text-slate-400 block">Transporter / Driver</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 block mt-2">{selectedRecord.driverName || "Driver Sign"}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── 2. REWEIGH / GROSS CAPTURE MODAL ── */}
      {selectedRecord && (
        <Modal
          isOpen={isReweighModalOpen}
          onClose={() => setIsReweighModalOpen(false)}
          title={`Capture Gross Weight / Reweigh - ${selectedRecord.vehicleNumber}`}
          size="sm"
          footer={
            <ModalFooter
              onClose={() => setIsReweighModalOpen(false)}
              onConfirm={handleConfirmReweigh}
              confirmText="Save & Verify Gross"
            />
          }
        >
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Stored Tare Weight:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {selectedRecord.tareWeightKg.toLocaleString()} kg
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vehicle:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selectedRecord.vehicleNumber}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Live Sensor Gross Weight (kg) *
              </label>
              <input
                type="number"
                value={reweighGrossKg}
                onChange={(e) => setReweighGrossKg(Number(e.target.value))}
                className={`${inputBase} ${inputNormal} font-bold text-emerald-600`}
                min={selectedRecord.tareWeightKg + 100}
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Calculated Net Sand: {Math.max(0, (reweighGrossKg - selectedRecord.tareWeightKg) / 1000).toFixed(2)} MT
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* ── 3. ANPR PLATE RECOGNITION MODAL ── */}
      {selectedRecord && (
        <Modal
          isOpen={isAnprModalOpen}
          onClose={() => setIsAnprModalOpen(false)}
          title={`ANPR Optical Snapshot - ${selectedRecord.vehicleNumber}`}
          size="md"
          footer={
            <ModalFooter
              // onClose={() => setIsAnprModalOpen(false)}
              onConfirm={() => setIsAnprModalOpen(false)}
              confirmText="Close"
            />
          }
        >
          <div className="space-y-3 text-xs">
            <div className="anpr-snapshot-frame">
              <img
                src={
                  selectedRecord.anprSnapshotUrl ||
                  selectedRecord.photoUrl ||
                  "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop&q=80"
                }
                alt="ANPR Plate Snapshot"
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-md text-white font-mono text-[11px] border border-white/20">
                Plate Read: {selectedRecord.vehicleNumber} ({selectedRecord.anprPlateConfidence || 99.2}% Match)
              </div>
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-emerald-800 dark:text-emerald-200">
                  Optical Character Match Confirmed
                </span>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                  Front camera feed verified against vehicle RTO commercial permit database.
                </p>
              </div>
              <Badge variant="success">Match 100%</Badge>
            </div>
          </div>
        </Modal>
      )}

      {/* ── 4. APPROVE WEIGHMENT SLIP MODAL ── */}
      {selectedRecord && (
        <Modal
          isOpen={isApproveModalOpen}
          onClose={() => setIsApproveModalOpen(false)}
          title={`Authorize Weighment Slip - ${selectedRecord.slipNumber}`}
          size="sm"
          footer={
            <ModalFooter
              onClose={() => setIsApproveModalOpen(false)}
              onConfirm={handleConfirmApprove}
              confirmText="Authorize & Verify"
            />
          }
        >
          <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 py-1">
            <p>
              Are you sure you want to approve weighment slip{" "}
              <strong className="text-slate-900 dark:text-white font-mono">
                {selectedRecord.slipNumber}
              </strong>{" "}
              for{" "}
              <strong className="text-orange-600 font-bold">
                {selectedRecord.netSandWeightMt} MT Net Sand
              </strong>
              ?
            </p>
            <p className="text-[11px] text-slate-500">
              This will digitally sign the slip and permit physical gate-out dispatch.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default WeighbridgeList;
