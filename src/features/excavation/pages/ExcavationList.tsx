import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Pickaxe,
  Plus,
  Eye,
  Pencil,
  Camera,
  CheckCircle2,
  MapPin,
  Download,
  History,
  Check,
  Building2,
  Calendar,
  Layers,
  Upload,
  Clock,
  Truck,
  UserCheck,
  Calculator,
  Compass,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import type { ExcavationRecord, ExcavationStatus } from "../types";
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
  addRecord,
} from "../slice/excavationSlice";
import "../styles/excavation.css";

export const ExcavationList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showSuccess } = useStatusModal();
  const { reaches, stockyards, addStockLedgerEntry } = useSandMining();

  // Get records from Redux state
  const excavationRecords = useAppSelector((state) => state.excavation?.records || []);

  // Modal State Management
  const [selectedRecord, setSelectedRecord] = useState<ExcavationRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<ExcavationStatus | null>(null);

  // Status Badges
  const getStatusBadge = (status: ExcavationStatus) => {
    switch (status) {
      case "Approved":
        return <Badge variant="success">Approved</Badge>;
      case "Under Verification":
        return <Badge variant="info">Under Verification</Badge>;
      case "Submitted":
        return <Badge variant="warning">Submitted</Badge>;
      case "Draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "Rejected":
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Real-time Stock Calculation Formula (Aggregate Across State Stockyards)
  // Opening Stock + Extracted Quantity - Dispatched Quantity = Available Sand Stock
  const stockCalculation = useMemo(() => {
    const totalOpeningStockMt = stockyards.reduce((acc, s) => acc + (s.openingStockMt || 0), 0) || 58000;
    const totalExtractedMt = excavationRecords.reduce(
      (acc, r) => acc + (r.extractionQuantityMt || r.excavatedQuantityMt || 0),
      0
    );
    const totalDispatchedMt = stockyards.reduce((acc, s) => acc + (s.dispatchedMt || 0), 0) || 12400;
    const totalAvailableSandStockMt = totalOpeningStockMt + totalExtractedMt - totalDispatchedMt;

    return {
      totalOpeningStockMt,
      totalExtractedMt,
      totalDispatchedMt,
      totalAvailableSandStockMt,
    };
  }, [stockyards, excavationRecords]);

  // Handle Workflow Status Updates
  const handleInitiateStatusChange = (record: ExcavationRecord, status: ExcavationStatus) => {
    setSelectedRecord(record);
    setPendingStatus(status);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmStatusChange = () => {
    if (!selectedRecord || !pendingStatus) return;

    dispatch(
      updateStatus({
        id: selectedRecord.id,
        status: pendingStatus,
        remarks: `Excavation log ${selectedRecord.excavationSlipNo} approved by State/District Mining Control Desk.`,
        user: "State Mining Admin",
      })
    );

    // Inward stockward integration when approved
    if (pendingStatus === "Approved") {
      addStockLedgerEntry({
        dateTime: new Date().toISOString().replace("T", " ").substring(0, 16),
        stockyardId: "STK-001",
        stockyardName: "Raipur Central Sand Stockyard",
        transactionType: "INWARD_EXCAVATION",
        quantityMt: selectedRecord.extractionQuantityMt || selectedRecord.excavatedQuantityMt,
        previousStockMt: 14200,
        newStockMt: 14200 + (selectedRecord.extractionQuantityMt || selectedRecord.excavatedQuantityMt),
        referenceId: selectedRecord.excavationSlipNo,
        authorizedBy: "DMO Raipur",
        remarks: `Direct river excavation receipt from ${selectedRecord.reachName}`,
      });
    }

    showSuccess(
      `Excavation log ${selectedRecord.excavationSlipNo} marked as ${pendingStatus} successfully.`
    );
    setIsConfirmModalOpen(false);
    setSelectedRecord(null);
    setPendingStatus(null);
  };

  // Table Columns Definition Covering All 12 Fields
  const columns = useMemo<MRT_ColumnDef<ExcavationRecord>[]>(
    () => [
      {
        accessorKey: "reachName",
        header: "1. Sand Reach",
        size: 190,
        Cell: ({ row }) => (
          <div>
            <span className="font-bold text-gray-900 dark:text-white text-xs block">
              {row.original.reachName}
            </span>
            <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400">
              {row.original.reachId}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "extractionDate",
        header: "2. Extraction Date",
        size: 130,
        Cell: ({ row }) => (
          <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
            {row.original.extractionDate || row.original.dateTime?.substring(0, 10)}
          </span>
        ),
      },
      {
        accessorKey: "extractionQuantityMt",
        header: "3. Extraction Qty",
        size: 130,
        Cell: ({ row }) => {
          const qty = row.original.extractionQuantityMt || row.original.excavatedQuantityMt;
          return (
            <span className="font-bold text-xs text-blue-700 dark:text-blue-400">
              {qty?.toLocaleString()} MT
            </span>
          );
        },
      },
      {
        accessorKey: "vehicleNumber",
        header: "4. Vehicle/Tractor",
        size: 140,
        Cell: ({ row }) => (
          <span className="font-mono font-bold text-xs text-gray-900 dark:text-white flex items-center gap-1">
            <Truck size={12} className="text-gray-400" />
            {row.original.vehicleNumber || row.original.equipmentRegNo || "TG-04-TR-8812"}
          </span>
        ),
      },
      {
        accessorKey: "operatorName",
        header: "5. Operator",
        size: 140,
        Cell: ({ row }) => (
          <span className="text-xs font-medium text-gray-900 dark:text-white">
            {row.original.operatorName}
          </span>
        ),
      },
      {
        accessorKey: "sourceLocation",
        header: "6. Source Location",
        size: 170,
        Cell: ({ row }) => (
          <span className="text-[11px] text-gray-600 dark:text-gray-400 truncate max-w-[160px] inline-block" title={row.original.sourceLocation}>
            {row.original.sourceLocation || row.original.riverName || "Riverbed Extraction"}
          </span>
        ),
      },
      {
        accessorKey: "gpsCoordinates",
        header: "7. GPS Location",
        size: 150,
        Cell: ({ row }) => (
          <button
            type="button"
            onClick={() => {
              setSelectedRecord(row.original);
              setIsMapModalOpen(true);
            }}
            className="text-xs font-mono text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <MapPin size={12} className="text-rose-500" />
            <span>{row.original.gpsCoordinates || row.original.geoLocation}</span>
          </button>
        ),
      },
      {
        accessorKey: "loadingQuantityMt",
        header: "8. Loading Qty",
        size: 120,
        Cell: ({ row }) => (
          <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
            {(row.original.loadingQuantityMt || row.original.excavatedQuantityMt)?.toLocaleString()} MT
          </span>
        ),
      },
      {
        accessorKey: "loadingTime",
        header: "9. Loading Time",
        size: 110,
        Cell: ({ row }) => (
          <span className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1">
            <Clock size={11} className="text-gray-400" />
            {row.original.loadingTime || "09:30 AM"}
          </span>
        ),
      },
      {
        accessorKey: "photoEvidenceUrl",
        header: "10. Photo",
        size: 100,
        Cell: ({ row }) => (
          <button
            type="button"
            onClick={() => {
              setSelectedRecord(row.original);
              setIsPhotoModalOpen(true);
            }}
            className="p-1 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 hover:bg-blue-100 flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
          >
            <Camera size={13} />
            <span>View</span>
          </button>
        ),
      },
      {
        accessorKey: "officerVerification",
        header: "11. Officer Verify",
        size: 160,
        Cell: ({ row }) => {
          const officer = row.original.officerVerification?.verifiedBy || row.original.verifiedBy || "Er. Rameshwar Sharma";
          const isVerified = row.original.officerVerification?.status === "Verified" || row.original.status === "Approved";
          return (
            <div className="text-xs">
              <div className="flex items-center gap-1 font-semibold text-gray-900 dark:text-white">
                <UserCheck size={12} className={isVerified ? "text-emerald-500" : "text-amber-500"} />
                <span className="truncate">{officer}</span>
              </div>
              <span className={`text-[10px] font-bold ${isVerified ? "text-emerald-600" : "text-amber-600"}`}>
                {isVerified ? "Verified (Signed)" : "Pending Review"}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "remarks",
        header: "12. Remarks",
        size: 170,
        Cell: ({ row }) => (
          <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-[160px] inline-block" title={row.original.remarks}>
            {row.original.remarks}
          </span>
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
      {/* Header Info Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800/60 text-[#c2410c] dark:text-orange-400 flex items-center justify-center shrink-0">
              <Pickaxe size={18} />
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              Sand Extraction & Production Management
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-[#c2410c] dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
              Quarry Production Log
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time excavation entry with tractor loading logs, geofence verification, officer sign-off & stock reconciliation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            icon={<Plus size={15} />}
            onClick={() => navigate(routes.addExcavation.path)}
          >
            New Extraction Entry
          </Button>
        </div>
      </div>

      {/* Real-time Stock Calculation Formula Banner */}
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-[#c2410c] animate-pulse" />
            <span className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <Calculator size={15} className="text-[#c2410c]" />
              Real-Time State Sand Stock Equation
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 text-[#c2410c] dark:text-orange-400 uppercase tracking-wider">
              Live Equation
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-300">
            <span>Formula: <span className="font-bold text-slate-800 dark:text-slate-200">Opening Stock</span> + <span className="font-bold text-emerald-600 dark:text-emerald-400">Extracted</span> − <span className="font-bold text-rose-600 dark:text-rose-400">Dispatched</span> = <span className="font-bold text-[#c2410c] dark:text-orange-400">Available Stock</span></span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold mb-0.5">Opening Stock</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
              {stockCalculation.totalOpeningStockMt.toLocaleString()} <span className="text-xs font-semibold text-slate-500">MT</span>
            </span>
          </div>

          <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 block font-semibold mb-0.5">+ Extracted Quantity</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              +{stockCalculation.totalExtractedMt.toLocaleString()} <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">MT</span>
            </span>
          </div>

          <div className="p-3.5 bg-rose-50/60 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-800/60">
            <span className="text-[11px] text-rose-700 dark:text-rose-400 block font-semibold mb-0.5">− Dispatched Quantity</span>
            <span className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
              −{stockCalculation.totalDispatchedMt.toLocaleString()} <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">MT</span>
            </span>
          </div>

          <div className="p-3.5 bg-gradient-to-br from-orange-50/90 to-amber-50/90 dark:from-orange-950/40 dark:to-amber-950/40 rounded-xl border-2 border-orange-300 dark:border-orange-600/50 shadow-2xs">
            <span className="text-[11px] text-[#c2410c] dark:text-orange-400 block font-extrabold mb-0.5">= Available Sand Stock</span>
            <span className="text-xl sm:text-2xl font-black text-[#c2410c] dark:text-orange-400 font-mono">
              {stockCalculation.totalAvailableSandStockMt.toLocaleString()} <span className="text-xs font-bold text-[#c2410c] dark:text-orange-400">MT</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <Card
        title="Extraction & Production Registry"
        icon={Layers}
        subtitle="12-Field Statutory Production Log with Real-time Stock Ledger Linkage"
        action={
          <Button
            size="sm"
            variant="primary"
            icon={<Plus size={15} />}
            onClick={() => navigate(routes.addExcavation.path)}
          >
            Record Sand Extraction
          </Button>
        }
      >
        <ReusableTable
          columns={columns}
          data={excavationRecords}
          enableExport={true}
          exportFileName="sand_extraction_production_records"
          onExportExcel={(rows) => exportToExcel(exportCols, rows, "sand_extraction_production_records")}
          onExportPDF={(rows) => exportToPDF(exportCols, rows, "sand_extraction_production_records", "Sand Extraction / Production Registry")}
          enableRowActions={true}
          renderRowActions={({ row }) => {
            const record = row.original;
            const canApprove = record.status === "Submitted" || record.status === "Under Verification";

            return (
              <div className="flex items-center gap-1.5 justify-center">
                {/* 1. View Full Details */}
                <button
                  type="button"
                  title="View Full Extraction Dossier"
                  onClick={() => {
                    setSelectedRecord(record);
                    setIsDetailModalOpen(true);
                  }}
                  className="w-7 h-7 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Eye size={14} />
                </button>

                {/* 2. View Photo Evidence */}
                <button
                  type="button"
                  title="View Geo-Tagged Photo"
                  onClick={() => {
                    setSelectedRecord(record);
                    setIsPhotoModalOpen(true);
                  }}
                  className="w-7 h-7 rounded-full bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-600 dark:text-purple-400 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Camera size={14} />
                </button>

                {/* 3. View GPS Map */}
                <button
                  type="button"
                  title="View GPS Geofence Centroid"
                  onClick={() => {
                    setSelectedRecord(record);
                    setIsMapModalOpen(true);
                  }}
                  className="w-7 h-7 rounded-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <MapPin size={14} />
                </button>

                {/* 4. Approve / Verify */}
                {canApprove && (
                  <button
                    type="button"
                    title="Officer Sign-Off & Approve"
                    onClick={() => handleInitiateStatusChange(record, "Approved")}
                    className="w-7 h-7 rounded-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <CheckCircle2 size={14} />
                  </button>
                )}
              </div>
            );
          }}
        />
      </Card>

      {/* ── DETAIL MODAL (ALL 12 EXTRACTION FIELDS) ── */}
      {selectedRecord && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Extraction Slip: ${selectedRecord.excavationSlipNo}`}
          subtitle={`Sand Reach: ${selectedRecord.reachName} (${selectedRecord.reachId})`}
          size="lg"
          footer={
            <div className="flex items-center justify-end w-full">
              <Button size="sm" variant="primary" onClick={() => setIsDetailModalOpen(false)}>
                Close Details
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">1. Sand Reach</p>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedRecord.reachName}</p>
                <p className="font-mono text-[10px] text-blue-600">{selectedRecord.reachId}</p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">2. Extraction Date & Time</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  {selectedRecord.extractionDate || selectedRecord.dateTime}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">3. Extraction Quantity</p>
                <p className="font-bold text-blue-700 dark:text-blue-400 text-sm mt-0.5">
                  {(selectedRecord.extractionQuantityMt || selectedRecord.excavatedQuantityMt)?.toLocaleString()} MT
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">4. Vehicle / Tractor Number</p>
                <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedRecord.vehicleNumber || selectedRecord.equipmentRegNo || "TG-04-TR-8812"}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">5. Operator Name</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  {selectedRecord.operatorName}
                </p>
                {selectedRecord.operatorLicense && (
                  <p className="text-[10px] font-mono text-slate-500">{selectedRecord.operatorLicense}</p>
                )}
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">6. Source Location</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  {selectedRecord.sourceLocation || selectedRecord.riverName || "Riverbed Reach"}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">7. GPS Coordinates</p>
                <p className="font-mono font-semibold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1">
                  <MapPin size={12} className="text-rose-500" />
                  {selectedRecord.gpsCoordinates || selectedRecord.geoLocation}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">8. Loading Quantity</p>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">
                  {(selectedRecord.loadingQuantityMt || selectedRecord.excavatedQuantityMt)?.toLocaleString()} MT
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">9. Loading Time & Shift</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  {selectedRecord.loadingTime || "09:30 AM"} ({selectedRecord.shift || "Morning Shift"})
                </p>
              </div>

              <div className="col-span-2 sm:col-span-3 pt-2 border-t border-slate-200/60 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">11. Officer Verification Sign-Off</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1.5">
                    <UserCheck size={14} className="text-emerald-600" />
                    {selectedRecord.officerVerification?.verifiedBy || selectedRecord.verifiedBy || "Er. Rameshwar Sharma"}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {selectedRecord.officerVerification?.designation || "Assistant Director of Mines / Nodal Officer"}
                  </p>
                  {selectedRecord.officerVerification?.verificationNotes && (
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 font-medium italic">
                      "{selectedRecord.officerVerification.verificationNotes}"
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">12. Remarks / Field Notes</p>
                  <p className="text-slate-800 dark:text-slate-200 mt-0.5 leading-relaxed">
                    {selectedRecord.remarks}
                  </p>
                </div>
              </div>
            </div>

            {/* Photo preview in detail modal */}
            {selectedRecord.photoEvidenceUrl && (
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center gap-4">
                <img
                  src={selectedRecord.photoEvidenceUrl}
                  alt="Site Evidence"
                  className="w-24 h-16 rounded-lg object-cover border border-slate-300 dark:border-slate-600"
                />
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    10. Geo-Tagged Quarry Photo Evidence
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Captured at {selectedRecord.gpsCoordinates || selectedRecord.geoLocation} • Live GPS Verified
                  </p>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ── PHOTO EVIDENCE MODAL ── */}
      {selectedRecord && (
        <Modal
          isOpen={isPhotoModalOpen}
          onClose={() => setIsPhotoModalOpen(false)}
          title={`10. Geo-Tagged Photo Evidence`}
          subtitle={`Quarry: ${selectedRecord.reachName} • Vehicle: ${selectedRecord.vehicleNumber || "TG-04-TR-8812"}`}
          size="md"
          footer={
            <div className="flex items-center justify-end w-full">
              <Button size="sm" variant="primary" onClick={() => setIsPhotoModalOpen(false)}>
                Close Preview
              </Button>
            </div>
          }
        >
          <div className="space-y-3">
            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md">
              <img
                src={selectedRecord.photoEvidenceUrl}
                alt="Quarry Site Evidence"
                className="w-full h-64 object-cover"
              />
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs space-y-1 font-mono">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>GPS Centroid:</strong> {selectedRecord.gpsCoordinates || selectedRecord.geoLocation}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Capture Time:</strong> {selectedRecord.extractionDate} {selectedRecord.loadingTime}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Operator:</strong> {selectedRecord.operatorName}
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* ── GPS LOCATION MODAL ── */}
      {selectedRecord && (
        <Modal
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          title={`7. GPS Quarry Centroid & Geofence`}
          subtitle={`Reach: ${selectedRecord.reachName} (${selectedRecord.reachId})`}
          size="md"
          footer={
            <div className="flex items-center justify-end w-full">
              <Button size="sm" variant="primary" onClick={() => setIsMapModalOpen(false)}>
                Close Map
              </Button>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <Compass size={16} className="text-blue-600" />
                  {selectedRecord.sourceLocation || selectedRecord.riverName}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                  Geofenced In-Bounds
                </span>
              </div>
              <p className="font-mono text-slate-800 dark:text-slate-200">
                <strong>Lat / Long:</strong> {selectedRecord.gpsCoordinates || selectedRecord.geoLocation}
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                Vehicle {selectedRecord.vehicleNumber || "TG-04-TR-8812"} verified within authorized 450m riverbed boundary at loading time.
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* ── CONFIRM STATUS MODAL ── */}
      {selectedRecord && pendingStatus && (
        <Modal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          title={`Officer Verification Sign-Off`}
          size="sm"
          footer={
            <ModalFooter
              onClose={() => setIsConfirmModalOpen(false)}
              onConfirm={handleConfirmStatusChange}
              confirmText={`Authorize ${pendingStatus}`}
            />
          }
        >
          <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 py-1">
            <p>
              Sign off and approve sand extraction entry{" "}
              <strong className="text-slate-900 dark:text-white font-mono">
                {selectedRecord.excavationSlipNo}
              </strong>{" "}
              for{" "}
              <strong className="text-blue-600 font-bold">
                {(selectedRecord.extractionQuantityMt || selectedRecord.excavatedQuantityMt)} MT
              </strong>
              ?
            </p>
            <p className="text-[11px] text-gray-500">
              This will automatically credit the linked stockyard inventory and update the state sand stock calculation in real time.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ExcavationList;
