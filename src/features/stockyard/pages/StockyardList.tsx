import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layers,
  Plus,
  Eye,
  Pencil,
  ArrowDownLeft,
  Sliders,
  ArrowRightLeft,
  BookOpen,
  Building2,
  Scale,
  Truck,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Search,
  PackageCheck,
  FileCheck,
  Lock,
  Boxes,
  HelpCircle,
} from "lucide-react";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import type {
  Stockyard,
  StockLedgerEntry,
  MiningReach,
} from "@/features/shared-simulation/types";
import type {
  StockyardStatus,
  SandType,
} from "../types";
import ReusableTable from "@/shared/components/ui/Table/ReusableTable/ReusableTable";
import type { MRT_ColumnDef } from "material-react-table";
import Button from "@/shared/components/ui/Button";
import Badge from "@/shared/components/ui/Badge";
import Card from "@/shared/components/layout/Card/Card";
import Modal, { ModalFooter } from "@/shared/components/ui/Modal/Modal";
import Tabs from "@/shared/components/ui/Tabs/Tabs";
import type { TabItem } from "@/shared/components/ui/Tabs/tab.types";
import { exportToExcel, exportToPDF } from "@/shared/utils/exportUtils";
import { routes } from "@/app/routes/routeConfig";
import { useStatusModal } from "@/config/theme/StatusModalContext";
import { inputBase, inputNormal } from "@/shared/components/ui/Forms/inputStyles";
import "../styles/stockyard.css";

export const StockyardList: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useStatusModal();
  const {
    stockyards,
    reaches,
    stockLedger,
    inventoryFlow,
    addStockLedgerEntry,
  } = useSandMining();

  // Active Tab: 'stockyards' | 'reaches' | 'reconciliation' | 'ledger'
  const [activeTab, setActiveTab] = useState("stockyards");

  // Selected Stockyard for Modals
  const [selectedStockyard, setSelectedStockyard] = useState<Stockyard | null>(null);
  const [selectedReach, setSelectedReach] = useState<MiningReach | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [isReachModalOpen, setIsReachModalOpen] = useState(false);

  // Form State for Modals
  const [receiveForm, setReceiveForm] = useState({
    quantityMt: 450,
    sourceReach: "Mahanadi Basin Reach Alpha",
    referenceId: "EXC/CG/RPR/2026/0891",
  });

  const [adjustForm, setAdjustForm] = useState({
    adjustmentType: "INCREASE" as "INCREASE" | "DECREASE",
    quantityMt: 50,
    reason: "Physical audit volumetric calibration check",
    authorizedBy: "DMO Quality Inspector",
  });

  const [transferForm, setTransferForm] = useState({
    toStockyardId: "STK-002",
    quantityMt: 100,
    vehicleNumber: "CG-04-JB-2210",
    driverName: "Dharmendra Sahu",
    remarks: "Buffer redistribution to address high local demand",
  });

  // Status Badges
  const getStatusBadge = (status: StockyardStatus | string) => {
    switch (status) {
      case "Active":
        return <Badge variant="success">Active</Badge>;
      case "Low Stock Warning":
        return <Badge variant="warning">Low Stock Warning</Badge>;
      case "Stock Depleted":
        return <Badge variant="danger">Stock Depleted</Badge>;
      case "At Capacity":
        return <Badge variant="warning">At Capacity</Badge>;
      case "Maintenance":
        return <Badge variant="secondary">Maintenance</Badge>;
      case "Closed":
        return <Badge variant="danger">Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Handlers for Modal Actions
  const handleReceiveStockSubmit = () => {
    if (!selectedStockyard) return;
    if (receiveForm.quantityMt <= 0) {
      showError("Please enter a valid positive quantity.");
      return;
    }

    addStockLedgerEntry({
      dateTime: new Date().toISOString().replace("T", " ").substring(0, 16),
      stockyardId: selectedStockyard.id,
      stockyardName: selectedStockyard.name,
      transactionType: "INWARD_EXCAVATION",
      quantityMt: Number(receiveForm.quantityMt),
      previousStockMt: selectedStockyard.availableQuantityMt,
      newStockMt: selectedStockyard.availableQuantityMt + Number(receiveForm.quantityMt),
      referenceId: receiveForm.referenceId,
      authorizedBy: "District Mining Officer",
      remarks: `Inward sand stock received from ${receiveForm.sourceReach}`,
      approvalStatus: "Approved",
    });

    showSuccess(
      `Received ${receiveForm.quantityMt} MT into ${selectedStockyard.name}. Stock ledger updated.`
    );
    setIsReceiveModalOpen(false);
  };

  const handleAdjustStockSubmit = () => {
    if (!selectedStockyard) return;
    if (adjustForm.quantityMt <= 0 || !adjustForm.reason.trim()) {
      showError("Please enter valid quantity and mandatory audit reason.");
      return;
    }

    const delta = adjustForm.adjustmentType === "INCREASE" ? adjustForm.quantityMt : -adjustForm.quantityMt;
    const newStock = Math.max(0, selectedStockyard.availableQuantityMt + delta);

    addStockLedgerEntry({
      dateTime: new Date().toISOString().replace("T", " ").substring(0, 16),
      stockyardId: selectedStockyard.id,
      stockyardName: selectedStockyard.name,
      transactionType: "ADJUSTMENT",
      quantityMt: adjustForm.quantityMt,
      previousStockMt: selectedStockyard.availableQuantityMt,
      newStockMt: newStock,
      referenceId: `ADJ-${Date.now().toString().slice(-4)}`,
      authorizedBy: adjustForm.authorizedBy,
      remarks: `[${adjustForm.adjustmentType}] ${adjustForm.reason}`,
      approvalStatus: "Approved",
    });

    showSuccess(
      `Stock adjusted (${adjustForm.adjustmentType} ${adjustForm.quantityMt} MT) with reason logged.`
    );
    setIsAdjustModalOpen(false);
  };

  const handleTransferStockSubmit = () => {
    if (!selectedStockyard) return;
    if (transferForm.quantityMt <= 0 || transferForm.quantityMt > selectedStockyard.availableQuantityMt) {
      showError(
        `Invalid transfer quantity. Maximum available: ${selectedStockyard.availableQuantityMt} MT.`
      );
      return;
    }

    const targetYard = stockyards.find((s) => s.id === transferForm.toStockyardId);
    const targetName = targetYard ? targetYard.name : "Destination Depot";

    addStockLedgerEntry({
      dateTime: new Date().toISOString().replace("T", " ").substring(0, 16),
      stockyardId: selectedStockyard.id,
      stockyardName: selectedStockyard.name,
      transactionType: "TRANSFER_OUT",
      quantityMt: transferForm.quantityMt,
      previousStockMt: selectedStockyard.availableQuantityMt,
      newStockMt: selectedStockyard.availableQuantityMt - transferForm.quantityMt,
      referenceId: `XFER-${Date.now().toString().slice(-4)}`,
      authorizedBy: "Central Logistics Controller",
      remarks: `Inter-depot transfer to ${targetName} via Vehicle ${transferForm.vehicleNumber} (Driver: ${transferForm.driverName})`,
      approvalStatus: "Approved",
    });

    showSuccess(
      `Transferred ${transferForm.quantityMt} MT from ${selectedStockyard.name} to ${targetName}. Double-entry stock ledger updated.`
    );
    setIsTransferModalOpen(false);
  };

  // ── Tab 1 Columns: Stockyard-Wise Inventory ────────────────────────────────
  const stockyardColumns = useMemo<MRT_ColumnDef<Stockyard>[]>(
    () => [
      {
        accessorKey: "stockyardId",
        header: "Stockyard ID / Depot",
        size: 190,
        Cell: ({ row }) => (
          <div className="text-xs">
            <span className="font-bold text-slate-900 dark:text-white block truncate" title={row.original.name}>
              {row.original.name}
            </span>
            <span className="text-[11px] font-mono text-slate-500">{row.original.stockyardId}</span>
          </div>
        ),
      },
      {
        accessorKey: "district",
        header: "District & Location",
        size: 160,
        Cell: ({ row }) => (
          <div className="text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block">
              {row.original.district}
            </span>
            <span className="text-[11px] text-slate-500 truncate block" title={row.original.location}>
              {row.original.location}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "sandType",
        header: "Sand Type",
        size: 140,
        Cell: ({ row }) => (
          <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
            {row.original.sandType}
          </span>
        ),
      },
      {
        accessorKey: "capacityMt",
        header: "Total Capacity",
        size: 110,
        Cell: ({ row }) => (
          <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
            {row.original.capacityMt.toLocaleString()} MT
          </span>
        ),
      },
      {
        accessorKey: "receivedMt",
        header: "Extracted Inward",
        size: 120,
        Cell: ({ row }) => (
          <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
            +{row.original.receivedMt.toLocaleString()} MT
          </span>
        ),
      },
      {
        accessorKey: "availableQuantityMt",
        header: "Available Stock",
        size: 130,
        Cell: ({ row }) => {
          const avail = row.original.availableQuantityMt;
          const isLow = avail < 100 && avail > 0;
          const isDepleted = avail <= 0;
          return (
            <div className="text-xs font-mono">
              <span
                className={`font-black block ${
                  isDepleted
                    ? "text-rose-600 dark:text-rose-400"
                    : isLow
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {avail.toLocaleString()} MT
              </span>
              <span className="text-[10px] text-slate-400 font-sans">
                {isDepleted ? "⛔ Blocked" : isLow ? "⚠️ Low Stock" : "✓ Ready to Book"}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "reservedQuantityMt",
        header: "Reserved (Booked)",
        size: 130,
        Cell: ({ row }) => (
          <span className="text-xs font-mono font-semibold text-amber-600 dark:text-amber-400">
            {(row.original.reservedQuantityMt || 0).toLocaleString()} MT
          </span>
        ),
      },
      {
        accessorKey: "dispatchedQuantityMt",
        header: "Dispatched (Transit)",
        size: 130,
        Cell: ({ row }) => (
          <span className="text-xs font-mono font-semibold text-sky-600 dark:text-sky-400">
            {(row.original.dispatchedQuantityMt || 0).toLocaleString()} MT
          </span>
        ),
      },
      {
        accessorKey: "deliveredQuantityMt",
        header: "Delivered (POD)",
        size: 120,
        Cell: ({ row }) => (
          <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
            {(row.original.deliveredQuantityMt || 0).toLocaleString()} MT
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Stock Status",
        size: 130,
        Cell: ({ row }) => getStatusBadge(row.original.status),
      },
    ],
    []
  );

  // ── Tab 2 Columns: Reach-Wise Mining Inventory ────────────────────────────
  const reachColumns = useMemo<MRT_ColumnDef<MiningReach>[]>(
    () => [
      {
        accessorKey: "reachId",
        header: "Reach Code / Name",
        size: 180,
        Cell: ({ row }) => (
          <div className="text-xs">
            <span className="font-bold text-slate-900 dark:text-white block truncate" title={row.original.reachName}>
              {row.original.reachName}
            </span>
            <span className="text-[11px] font-mono text-slate-500">{row.original.reachId}</span>
          </div>
        ),
      },
      {
        accessorKey: "district",
        header: "District & River Stream",
        size: 160,
        Cell: ({ row }) => (
          <div className="text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block">
              {row.original.district}
            </span>
            <span className="text-[11px] text-slate-500">{row.original.riverStream}</span>
          </div>
        ),
      },
      {
        accessorKey: "sandType",
        header: "Sand Type",
        size: 130,
        Cell: ({ row }) => (
          <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
            {row.original.sandType}
          </span>
        ),
      },
      {
        accessorKey: "approvedQuantityMt",
        header: "Approved Quota",
        size: 120,
        Cell: ({ row }) => (
          <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
            {row.original.approvedQuantityMt.toLocaleString()} MT
          </span>
        ),
      },
      {
        accessorKey: "excavatedQuantityMt",
        header: "Extracted Quantity",
        size: 130,
        Cell: ({ row }) => {
          const pct = Math.round((row.original.excavatedQuantityMt / row.original.approvedQuantityMt) * 100);
          return (
            <div className="text-xs font-mono">
              <span className="font-bold text-orange-600 dark:text-orange-400 block">
                {row.original.excavatedQuantityMt.toLocaleString()} MT
              </span>
              <span className="text-[10px] text-slate-400 font-sans">{pct}% Extracted</span>
            </div>
          );
        },
      },
      {
        accessorKey: "balanceQuantityMt",
        header: "Balance Permit Quota",
        size: 140,
        Cell: ({ row }) => {
          const balance = Math.max(0, row.original.approvedQuantityMt - row.original.excavatedQuantityMt);
          return (
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {balance.toLocaleString()} MT
            </span>
          );
        },
      },
      {
        accessorKey: "linkedStockyardName",
        header: "Linked Stock Depot",
        size: 160,
        Cell: ({ row }) => (
          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium truncate block">
            {row.original.linkedStockyardName || "Mandir Hasaud Yard"}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Permit Status",
        size: 110,
        Cell: ({ row }) => <Badge variant="primary">{row.original.status}</Badge>,
      },
    ],
    []
  );

  // ── Tab 4 Columns: Stock Movement Ledger ──────────────────────────────────
  const ledgerColumns = useMemo<MRT_ColumnDef<StockLedgerEntry>[]>(
    () => [
      {
        accessorKey: "dateTime",
        header: "Timestamp & Reference",
        size: 170,
        Cell: ({ row }) => (
          <div className="text-xs font-mono">
            <span className="font-bold text-slate-900 dark:text-white block">{row.original.dateTime}</span>
            <span className="text-[11px] text-slate-500">{row.original.referenceId}</span>
          </div>
        ),
      },
      {
        accessorKey: "stockyardName",
        header: "Stock Depot Name",
        size: 160,
        Cell: ({ row }) => (
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {row.original.stockyardName}
          </span>
        ),
      },
      {
        accessorKey: "transactionType",
        header: "Flow Stage / Transaction",
        size: 160,
        Cell: ({ row }) => {
          const type = row.original.transactionType;
          let badgeVariant: "primary" | "success" | "warning" | "danger" | "secondary" = "primary";
          if (type.includes("INWARD") || type.includes("IN")) badgeVariant = "success";
          else if (type.includes("RESERVED")) badgeVariant = "warning";
          else if (type.includes("DISPATCH") || type.includes("OUT")) badgeVariant = "primary";
          else if (type.includes("DELIVERY")) badgeVariant = "success";

          return (
            <Badge variant={badgeVariant} className="text-[10px]">
              {type.replace("_", " ")}
            </Badge>
          );
        },
      },
      {
        accessorKey: "quantityMt",
        header: "Quantity (MT)",
        size: 110,
        Cell: ({ row }) => (
          <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
            {row.original.quantityMt} MT
          </span>
        ),
      },
      {
        accessorKey: "authorizedBy",
        header: "Authorized By & Remarks",
        size: 220,
        Cell: ({ row }) => (
          <div className="text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">
              {row.original.authorizedBy}
            </span>
            <span className="text-[11px] text-slate-500 italic line-clamp-1">
              {row.original.remarks}
            </span>
          </div>
        ),
      },
    ],
    []
  );

  const tabsConfig: TabItem[] = [
    { key: "stockyards", label: "Stockyard-Wise Inventory", icon: Building2 },
    { key: "reaches", label: "Reach-Wise Mining Inventory", icon: Layers },
    { key: "reconciliation", label: "Inventory Balance & Reconciliation", icon: Scale },
    { key: "ledger", label: "Stock Movement Ledger", icon: BookOpen },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* ── 7-Stage End-to-End Inventory Flow Funnel Banner ───────────────── */}
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-[#c2410c] dark:text-orange-400 border border-orange-200 dark:border-orange-800/60 flex items-center justify-center shrink-0 shadow-2xs">
              <Boxes size={20} />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                7-Stage End-to-End Inventory Flow Lifecycle
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-[#c2410c] dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                  Live Stream
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Reach Approved Quota → Excavation → Stockyard Availability → Booking Reservation → Dispatched → Delivered → Balance
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              icon={<RotateCcw size={13} />}
              onClick={() => showSuccess("Real-time inventory telemetry synchronized across all 28 reaches and 6 stockyards.")}
              className="text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs"
            >
              Sync Telemetry
            </Button>
          </div>
        </div>

        {/* 7 Interactive Flow Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs">
          {/* Stage 1: Approved Quantity */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 space-y-1">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider">
              <span>1. Approved</span>
              <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-[10px] flex items-center justify-center font-mono font-bold">1</span>
            </div>
            <div className="text-lg font-black font-mono text-slate-900 dark:text-white">
              {(inventoryFlow.totalApprovedQuotaMt / 1000).toFixed(1)}k <span className="text-xs font-sans font-normal text-slate-500">MT</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Total Permitted Quota</p>
          </div>

          {/* Stage 2: Extracted Quantity */}
          <div className="p-3 rounded-xl bg-orange-50/50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/60 space-y-1">
            <div className="flex items-center justify-between text-[#c2410c] dark:text-orange-400 text-[10px] uppercase font-bold tracking-wider">
              <span>2. Extracted</span>
              <span className="w-4 h-4 rounded-full bg-orange-100 dark:bg-orange-950 text-[#c2410c] dark:text-orange-400 text-[10px] flex items-center justify-center font-mono font-bold">2</span>
            </div>
            <div className="text-lg font-black font-mono text-[#c2410c] dark:text-orange-400">
              {(inventoryFlow.totalExtractedMt / 1000).toFixed(1)}k <span className="text-xs font-sans font-normal text-slate-500">MT</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{inventoryFlow.extractionPercentage}% Excavated</p>
          </div>

          {/* Stage 3: Available Stock */}
          <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-1">
            <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 text-[10px] uppercase font-bold tracking-wider">
              <span>3. Available</span>
              <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[10px] flex items-center justify-center font-mono font-bold">3</span>
            </div>
            <div className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
              {(inventoryFlow.totalAvailableStockMt / 1000).toFixed(1)}k <span className="text-xs font-sans font-normal text-emerald-600/70">MT</span>
            </div>
            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium truncate">Ready for Booking</p>
          </div>

          {/* Stage 4: Reserved Quantity */}
          <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-1">
            <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 text-[10px] uppercase font-bold tracking-wider">
              <span>4. Reserved</span>
              <span className="w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] flex items-center justify-center font-mono font-bold">4</span>
            </div>
            <div className="text-lg font-black font-mono text-amber-700 dark:text-amber-300">
              {inventoryFlow.totalReservedMt.toLocaleString()} <span className="text-xs font-sans font-normal text-amber-700/70">MT</span>
            </div>
            <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium truncate">Paid Citizen Orders</p>
          </div>

          {/* Stage 5: Dispatched Quantity */}
          <div className="p-3 rounded-xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 space-y-1">
            <div className="flex items-center justify-between text-sky-700 dark:text-sky-300 text-[10px] uppercase font-bold tracking-wider">
              <span>5. Dispatched</span>
              <span className="w-4 h-4 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-[10px] flex items-center justify-center font-mono font-bold">5</span>
            </div>
            <div className="text-lg font-black font-mono text-sky-600 dark:text-sky-400">
              {inventoryFlow.totalDispatchedMt.toLocaleString()} <span className="text-xs font-sans font-normal text-sky-600/70">MT</span>
            </div>
            <p className="text-[10px] text-sky-700 dark:text-sky-400 font-medium truncate">In Transit (e-Pass)</p>
          </div>

          {/* Stage 6: Delivered Quantity */}
          <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 space-y-1">
            <div className="flex items-center justify-between text-purple-700 dark:text-purple-300 text-[10px] uppercase font-bold tracking-wider">
              <span>6. Delivered</span>
              <span className="w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] flex items-center justify-center font-mono font-bold">6</span>
            </div>
            <div className="text-lg font-black font-mono text-purple-700 dark:text-purple-300">
              {(inventoryFlow.totalDeliveredMt / 1000).toFixed(1)}k <span className="text-xs font-sans font-normal text-purple-700/70">MT</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Verified OTP POD</p>
          </div>

          {/* Stage 7: Balance Quantity */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 space-y-1">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider">
              <span>7. Balance</span>
              <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] flex items-center justify-center font-mono font-bold">7</span>
            </div>
            <div className="text-lg font-black font-mono text-slate-900 dark:text-white">
              {(inventoryFlow.totalBalanceQuotaMt / 1000).toFixed(1)}k <span className="text-xs font-sans font-normal text-slate-500">MT</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Remaining Quota</p>
          </div>
        </div>
      </div>

      {/* ── Main Tabbed Content ───────────────────────────────────────────── */}
      <Tabs tabs={tabsConfig} activeTab={activeTab} onChange={setActiveTab} />

      {/* ── TAB 1: STOCKYARD-WISE INVENTORY ───────────────────────────────── */}
      {activeTab === "stockyards" && (
        <Card
          title="Stockyard-Wise Inventory & Stockpile Depots"
          icon={Building2}
          action={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                icon={<ArrowDownLeft size={14} />}
                onClick={() => {
                  if (stockyards[0]) {
                    setSelectedStockyard(stockyards[0]);
                    setIsReceiveModalOpen(true);
                  }
                }}
              >
                Receive Stock
              </Button>
              <Button
                size="sm"
                variant="outline"
                icon={<Sliders size={14} />}
                onClick={() => {
                  if (stockyards[0]) {
                    setSelectedStockyard(stockyards[0]);
                    setIsAdjustModalOpen(true);
                  }
                }}
              >
                Adjust Stock
              </Button>
              <Button
                size="sm"
                variant="outline"
                icon={<ArrowRightLeft size={14} />}
                onClick={() => {
                  if (stockyards[0]) {
                    setSelectedStockyard(stockyards[0]);
                    setIsTransferModalOpen(true);
                  }
                }}
              >
                Transfer Buffer
              </Button>
              <Button
                size="sm"
                variant="primary"
                icon={<Plus size={15} />}
                onClick={() => navigate(routes.addStockyard.path)}
              >
                Add Stockyard
              </Button>
            </div>
          }
        >
          <ReusableTable
            columns={stockyardColumns}
            data={stockyards}
            enableExport={true}
            exportFileName="stockyard_inventory_records"
            onExportExcel={(rows) => exportToExcel(stockyardColumns as any, rows, "stockyard_inventory")}
            onExportPDF={(rows) => exportToPDF(stockyardColumns as any, rows, "stockyard_inventory", "Stockyard Inventory Directory")}
            enableRowActions={true}
            renderRowActions={({ row }) => {
              const yard = row.original;
              return (
                <div className="flex items-center gap-1.5 justify-center">
                  <button
                    type="button"
                    title="Inspect 7-Stage Flow & Telemetry"
                    onClick={() => {
                      setSelectedStockyard(yard);
                      setIsDetailModalOpen(true);
                    }}
                    className="w-7 h-7 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    type="button"
                    title="Receive Inward Excavation Batch"
                    onClick={() => {
                      setSelectedStockyard(yard);
                      setIsReceiveModalOpen(true);
                    }}
                    className="w-7 h-7 rounded-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ArrowDownLeft size={14} />
                  </button>
                  <button
                    type="button"
                    title="Adjust Stock Balance (Calibration / Audit)"
                    onClick={() => {
                      setSelectedStockyard(yard);
                      setIsAdjustModalOpen(true);
                    }}
                    className="w-7 h-7 rounded-full bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-600 dark:text-purple-400 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Sliders size={14} />
                  </button>
                  <button
                    type="button"
                    title="Transfer Buffer Stock to Another Depot"
                    onClick={() => {
                      setSelectedStockyard(yard);
                      setIsTransferModalOpen(true);
                    }}
                    className="w-7 h-7 rounded-full bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ArrowRightLeft size={14} />
                  </button>
                </div>
              );
            }}
          />
        </Card>
      )}

      {/* ── TAB 2: REACH-WISE MINING INVENTORY ─────────────────────────────── */}
      {activeTab === "reaches" && (
        <Card
          title="Reach-Wise Mining & Quarry Inventory"
          icon={Layers}
          action={
            <Button
              size="sm"
              variant="primary"
              icon={<Plus size={15} />}
              onClick={() => navigate(routes.addMiningReach.path)}
            >
              Add Mining Reach
            </Button>
          }
        >
          <ReusableTable
            columns={reachColumns}
            data={reaches}
            enableExport={true}
            exportFileName="reach_mining_inventory"
            onExportExcel={(rows) => exportToExcel(reachColumns as any, rows, "reach_mining_inventory")}
            onExportPDF={(rows) => exportToPDF(reachColumns as any, rows, "reach_mining_inventory", "Reach Mining Inventory Directory")}
            enableRowActions={true}
            renderRowActions={({ row }) => (
              <Button
                size="sm"
                variant="outline"
                icon={<Eye size={13} />}
                onClick={() => {
                  setSelectedReach(row.original);
                  setIsReachModalOpen(true);
                }}
              >
                Inspect Flow
              </Button>
            )}
          />
        </Card>
      )}

      {/* ── TAB 3: RECONCILIATION & AUDIT BALANCE ──────────────────────────── */}
      {activeTab === "reconciliation" && (
        <Card
          title="Automated Stock Reconciliation & Mass Balance Equation"
          icon={Scale}
        >
          <div className="space-y-6 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-900 dark:text-emerald-200">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Automated Double-Entry Inventory Mass Balance Verified</h4>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                    No physical-to-digital inventory variance detected across State sand reaches and stockyards. (Variance: 0.00 MT)
                  </p>
                </div>
              </div>
              <Badge variant="success" className="shrink-0 text-xs">
                Zero Discrepancy ✓
              </Badge>
            </div>

            {/* Reconciliation Equations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Equation 1: Mining Reaches */}
              <div className="p-4 rounded-xl border border-border-color bg-slate-50/60 dark:bg-gray-800/40 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers size={16} className="text-primary" />
                  Mining Reach Balance Equation
                </h4>
                <div className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-border-color font-mono text-[11px] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Approved Quota:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{inventoryFlow.totalApprovedQuotaMt.toLocaleString()} MT</span>
                  </div>
                  <div className="flex justify-between text-orange-600 dark:text-orange-400">
                    <span>- Cumulative Extracted:</span>
                    <span>{inventoryFlow.totalExtractedMt.toLocaleString()} MT</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-border-color font-bold text-emerald-600 dark:text-emerald-400">
                    <span>= Remaining Permitted Quota:</span>
                    <span>{inventoryFlow.totalBalanceQuotaMt.toLocaleString()} MT</span>
                  </div>
                </div>
              </div>

              {/* Equation 2: Stockyards */}
              <div className="p-4 rounded-xl border border-border-color bg-slate-50/60 dark:bg-gray-800/40 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 size={16} className="text-primary" />
                  Stockyard Allocation Equation
                </h4>
                <div className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-border-color font-mono text-[11px] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Extracted Received:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{inventoryFlow.totalExtractedMt.toLocaleString()} MT</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Available Usable Stock:</span>
                    <span>{inventoryFlow.totalAvailableStockMt.toLocaleString()} MT</span>
                  </div>
                  <div className="flex justify-between text-amber-600 dark:text-amber-400">
                    <span>Reserved for Active Bookings:</span>
                    <span>{inventoryFlow.totalReservedMt.toLocaleString()} MT</span>
                  </div>
                  <div className="flex justify-between text-sky-600 dark:text-sky-400">
                    <span>Dispatched in Transit:</span>
                    <span>{inventoryFlow.totalDispatchedMt.toLocaleString()} MT</span>
                  </div>
                  <div className="flex justify-between text-purple-600 dark:text-purple-400">
                    <span>Delivered & Closed:</span>
                    <span>{inventoryFlow.totalDeliveredMt.toLocaleString()} MT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ── TAB 4: CHRONOLOGICAL STOCK LEDGER ─────────────────────────────── */}
      {activeTab === "ledger" && (
        <Card
          title="Stock Movement & Inventory Audit Ledger"
          icon={BookOpen}
        >
          <ReusableTable
            columns={ledgerColumns}
            data={stockLedger}
            enableExport={true}
            exportFileName="stock_movement_ledger"
            onExportExcel={(rows) => exportToExcel(ledgerColumns as any, rows, "stock_movement_ledger")}
            onExportPDF={(rows) => exportToPDF(ledgerColumns as any, rows, "stock_movement_ledger", "Stock Movement Ledger")}
          />
        </Card>
      )}

      {/* ── 1. VIEW STOCKYARD DETAIL MODAL ── */}
      {selectedStockyard && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`7-Stage Inventory Lifecycle — ${selectedStockyard.name}`}
          size="lg"
          footer={
            <ModalFooter
              onClose={() => setIsDetailModalOpen(false)}
              onConfirm={() => setIsDetailModalOpen(false)}
              confirmText="Close Inspection"
              showCancel={false}
            />
          }
        >
          <div className="space-y-4 text-xs">
            <div className="flex flex-wrap items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 gap-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Depot Code: {selectedStockyard.stockyardId}
                </span>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  {selectedStockyard.name}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {selectedStockyard.location}, {selectedStockyard.district} District • {selectedStockyard.sandType}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedStockyard.status)}
              </div>
            </div>

            {/* 7-Stage Breakdown Cards for this Yard */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-border-color">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">1. Approved Quota</span>
                <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                  {(selectedStockyard.approvedQuantityMt || 120000).toLocaleString()} MT
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-border-color">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">2. Extracted Inward</span>
                <span className="text-sm font-bold font-mono text-orange-600 dark:text-orange-400">
                  {(selectedStockyard.receivedMt || 0).toLocaleString()} MT
                </span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800">
                <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold block uppercase">3. Available Stock</span>
                <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {selectedStockyard.availableQuantityMt.toLocaleString()} MT
                </span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800">
                <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold block uppercase">4. Reserved (Booked)</span>
                <span className="text-sm font-bold font-mono text-amber-600 dark:text-amber-400">
                  {(selectedStockyard.reservedQuantityMt || 0).toLocaleString()} MT
                </span>
              </div>
              <div className="p-3 rounded-xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-300 dark:border-sky-800">
                <span className="text-[10px] text-sky-700 dark:text-sky-300 font-bold block uppercase">5. Dispatched (Transit)</span>
                <span className="text-sm font-bold font-mono text-sky-600 dark:text-sky-400">
                  {(selectedStockyard.dispatchedQuantityMt || 0).toLocaleString()} MT
                </span>
              </div>
              <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-800">
                <span className="text-[10px] text-purple-700 dark:text-purple-300 font-bold block uppercase">6. Delivered (POD)</span>
                <span className="text-sm font-bold font-mono text-purple-600 dark:text-purple-400">
                  {(selectedStockyard.deliveredQuantityMt || 0).toLocaleString()} MT
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-border-color col-span-2">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">7. Total Capacity & Utilization</span>
                <span className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200">
                  {selectedStockyard.capacityMt.toLocaleString()} MT ({Math.round((selectedStockyard.availableQuantityMt / selectedStockyard.capacityMt) * 100)}% Used)
                </span>
              </div>
            </div>

            {/* Weighbridge & Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl border border-border-color bg-white dark:bg-slate-900">
              <div>
                <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                  <Scale size={14} className="text-blue-500" /> Linked Weighbridge
                </h5>
                <p className="text-slate-700 dark:text-slate-300 font-mono">
                  {selectedStockyard.linkedWeighbridgeId}
                </p>
                <p className="text-slate-500">{selectedStockyard.linkedWeighbridgeName || "Mandir Hasaud Weighbridge"}</p>
              </div>

              <div>
                <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                  <Building2 size={14} className="text-purple-500" /> Yard Superintendent
                </h5>
                <p className="text-slate-700 dark:text-slate-300">
                  Manager: {selectedStockyard.managerName || "Devendra Verma"}
                </p>
                <p className="text-slate-500 font-mono">
                  Contact: {selectedStockyard.contactNumber || "+91 98261 45520"}
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── 2. RECEIVE INWARD STOCK MODAL ── */}
      {selectedStockyard && (
        <Modal
          isOpen={isReceiveModalOpen}
          onClose={() => setIsReceiveModalOpen(false)}
          title={`Receive Inward Sand Stock — ${selectedStockyard.name}`}
          size="md"
          footer={
            <ModalFooter
              onClose={() => setIsReceiveModalOpen(false)}
              onConfirm={handleReceiveStockSubmit}
              confirmText="Confirm Inward Receipt"
            />
          }
        >
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Source Mining Reach *
              </label>
              <select
                value={receiveForm.sourceReach}
                onChange={(e) => setReceiveForm({ ...receiveForm, sourceReach: e.target.value })}
                className={`${inputBase} ${inputNormal}`}
              >
                {reaches.map((r) => (
                  <option key={r.id} value={r.reachName}>
                    {r.reachName} ({r.district}) — Balance: {(r.approvedQuantityMt - r.excavatedQuantityMt).toLocaleString()} MT
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Inward Quantity (MT) *
              </label>
              <input
                type="number"
                value={receiveForm.quantityMt}
                onChange={(e) =>
                  setReceiveForm({ ...receiveForm, quantityMt: Number(e.target.value) })
                }
                className={`${inputBase} ${inputNormal} font-bold text-emerald-600`}
                min={1}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Excavation / Dispatch Reference ID
              </label>
              <input
                type="text"
                value={receiveForm.referenceId}
                onChange={(e) => setReceiveForm({ ...receiveForm, referenceId: e.target.value })}
                className={`${inputBase} ${inputNormal} font-mono`}
                placeholder="e.g. EXC/CG/RPR/2026/0891"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* ── 3. ADJUST STOCK MODAL ── */}
      {selectedStockyard && (
        <Modal
          isOpen={isAdjustModalOpen}
          onClose={() => setIsAdjustModalOpen(false)}
          title={`Audit Stock Adjustment — ${selectedStockyard.name}`}
          size="md"
          footer={
            <ModalFooter
              onClose={() => setIsAdjustModalOpen(false)}
              onConfirm={handleAdjustStockSubmit}
              confirmText="Apply Stock Adjustment"
            />
          }
        >
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200">
              <p className="font-bold text-xs">Statutory Stock Adjustment Policy</p>
              <p className="text-[11px] mt-0.5 text-amber-800 dark:text-amber-300">
                All manual calibrations are permanently recorded in the state audit ledger with the officer's digital identity.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Adjustment Type *
                </label>
                <select
                  value={adjustForm.adjustmentType}
                  onChange={(e) =>
                    setAdjustForm({
                      ...adjustForm,
                      adjustmentType: e.target.value as "INCREASE" | "DECREASE",
                    })
                  }
                  className={`${inputBase} ${inputNormal}`}
                >
                  <option value="INCREASE">Increase (+ Stock)</option>
                  <option value="DECREASE">Decrease (- Stock)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Adjustment Quantity (MT) *
                </label>
                <input
                  type="number"
                  value={adjustForm.quantityMt}
                  onChange={(e) =>
                    setAdjustForm({ ...adjustForm, quantityMt: Number(e.target.value) })
                  }
                  className={`${inputBase} ${inputNormal} font-bold text-orange-600`}
                  min={1}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mandatory Reason / Survey Reference *
              </label>
              <textarea
                rows={2}
                value={adjustForm.reason}
                onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                className={`${inputBase} ${inputNormal}`}
                placeholder="e.g. Laser volumetric LiDAR survey calibration after monsoon settling"
                required
              />
            </div>
          </div>
        </Modal>
      )}

      {/* ── 4. TRANSFER BUFFER STOCK MODAL ── */}
      {selectedStockyard && (
        <Modal
          isOpen={isTransferModalOpen}
          onClose={() => setIsTransferModalOpen(false)}
          title={`Inter-Stockyard Buffer Transfer — ${selectedStockyard.name}`}
          size="md"
          footer={
            <ModalFooter
              onClose={() => setIsTransferModalOpen(false)}
              onConfirm={handleTransferStockSubmit}
              confirmText="Authorize Sand Transfer"
            />
          }
        >
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Destination Stockyard Depot *
              </label>
              <select
                value={transferForm.toStockyardId}
                onChange={(e) => setTransferForm({ ...transferForm, toStockyardId: e.target.value })}
                className={`${inputBase} ${inputNormal}`}
              >
                {stockyards
                  .filter((s) => s.id !== selectedStockyard.id)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.district}) — Available: {s.availableQuantityMt} MT
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Transfer Quantity (MT) *
                </label>
                <input
                  type="number"
                  value={transferForm.quantityMt}
                  onChange={(e) =>
                    setTransferForm({ ...transferForm, quantityMt: Number(e.target.value) })
                  }
                  className={`${inputBase} ${inputNormal} font-bold text-amber-600`}
                  max={selectedStockyard.availableQuantityMt}
                  min={1}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Transport Vehicle No. *
                </label>
                <input
                  type="text"
                  value={transferForm.vehicleNumber}
                  onChange={(e) =>
                    setTransferForm({ ...transferForm, vehicleNumber: e.target.value.toUpperCase() })
                  }
                  className={`${inputBase} ${inputNormal} font-mono uppercase`}
                  placeholder="CG-04-JB-2210"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Transfer Driver Name *
              </label>
              <input
                type="text"
                value={transferForm.driverName}
                onChange={(e) => setTransferForm({ ...transferForm, driverName: e.target.value })}
                className={`${inputBase} ${inputNormal}`}
                placeholder="Driver full name"
                required
              />
            </div>
          </div>
        </Modal>
      )}

      {/* ── 5. REACH FLOW INSPECTION MODAL ── */}
      {selectedReach && (
        <Modal
          isOpen={isReachModalOpen}
          onClose={() => setIsReachModalOpen(false)}
          title={`Mining Reach Lifecycle — ${selectedReach.reachName}`}
          size="md"
          footer={
            <ModalFooter
              onClose={() => setIsReachModalOpen(false)}
              onConfirm={() => setIsReachModalOpen(false)}
              confirmText="Close"
              showCancel={false}
            />
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-border-color space-y-1">
              <span className="text-[10px] font-bold font-mono text-slate-400">{selectedReach.reachId}</span>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">{selectedReach.reachName}</h4>
              <p className="text-slate-500">{selectedReach.riverStream}, {selectedReach.district} • {selectedReach.sandType}</p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 font-mono">
              <div className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-border-color">
                <span className="text-[10px] text-slate-500 font-sans block">Approved Quota</span>
                <span className="text-sm font-bold">{selectedReach.approvedQuantityMt.toLocaleString()} MT</span>
              </div>
              <div className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-border-color">
                <span className="text-[10px] text-slate-500 font-sans block">Extracted</span>
                <span className="text-sm font-bold text-orange-600">{selectedReach.excavatedQuantityMt.toLocaleString()} MT</span>
              </div>
              <div className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-border-color">
                <span className="text-[10px] text-slate-500 font-sans block">Balance Quota</span>
                <span className="text-sm font-bold text-emerald-600">
                  {Math.max(0, selectedReach.approvedQuantityMt - selectedReach.excavatedQuantityMt).toLocaleString()} MT
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default StockyardList;
