import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  FileSpreadsheet,
  Printer,
  ShieldCheck,
  Building2,
  Download,
  IndianRupee,
  Truck,
  Warehouse,
  Percent,
  RefreshCw,
  Eye,
  Ban,
  FileText,
  Clock,
  Sparkles,
  Layers,
  Calendar,
} from "lucide-react";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import Card from "@/shared/components/layout/Card/Card";
import Button from "@/shared/components/ui/Button";
import Badge from "@/shared/components/ui/Badge";
import Modal, { ModalFooter } from "@/shared/components/ui/Modal/Modal";
import ReusableTable from "@/shared/components/ui/Table/ReusableTable/ReusableTable";
import type { MRT_ColumnDef } from "material-react-table";
import { exportToExcel, exportToPDF } from "@/shared/utils/exportUtils";
import { useStatusModal } from "@/config/theme/StatusModalContext";
import "../styles/payment.css";

interface DistrictRevenueRecord {
  id: string;
  district: string;
  stockyardsCount: number;
  totalTonnageMt: number;
  tripsCount: number;
  grossSales: number;
  royalty: number;
  taxesAndCess: number;
  transportCharges: number;
  refunds: number;
  netCollection: number;
  gatewaySettlement: number;
  pendingReconciliation: number;
  status: "100% Reconciled" | "Pending Reconciliation" | "Variance Flagged";
  exceptionsCount: number;
}

const INITIAL_DISTRICT_REVENUE: DistrictRevenueRecord[] = [
  {
    id: "DIST-01",
    district: "Raipur",
    stockyardsCount: 4,
    totalTonnageMt: 18450,
    tripsCount: 1150,
    grossSales: 8450000,
    royalty: 1568250,
    taxesAndCess: 735000,
    transportCharges: 1475000,
    refunds: 0,
    netCollection: 6975000,
    gatewaySettlement: 8450000,
    pendingReconciliation: 0,
    status: "100% Reconciled",
    exceptionsCount: 0,
  },
  {
    id: "DIST-02",
    district: "Durg",
    stockyardsCount: 3,
    totalTonnageMt: 19800,
    tripsCount: 1240,
    grossSales: 9240000,
    royalty: 1683000,
    taxesAndCess: 803880,
    transportCharges: 1613000,
    refunds: 0,
    netCollection: 7627000,
    gatewaySettlement: 9240000,
    pendingReconciliation: 0,
    status: "100% Reconciled",
    exceptionsCount: 0,
  },
  {
    id: "DIST-03",
    district: "Bilaspur",
    stockyardsCount: 3,
    totalTonnageMt: 9200,
    tripsCount: 575,
    grossSales: 4210000,
    royalty: 782000,
    taxesAndCess: 366270,
    transportCharges: 735000,
    refunds: 0,
    netCollection: 3475000,
    gatewaySettlement: 4202312,
    pendingReconciliation: 7688,
    status: "Pending Reconciliation",
    exceptionsCount: 1,
  },
  {
    id: "DIST-04",
    district: "Korba",
    stockyardsCount: 2,
    totalTonnageMt: 8450,
    tripsCount: 530,
    grossSales: 3890000,
    royalty: 718250,
    taxesAndCess: 338430,
    transportCharges: 680000,
    refunds: 0,
    netCollection: 3210000,
    gatewaySettlement: 3890000,
    pendingReconciliation: 0,
    status: "100% Reconciled",
    exceptionsCount: 0,
  },
  {
    id: "DIST-05",
    district: "Bastar",
    stockyardsCount: 2,
    totalTonnageMt: 4100,
    tripsCount: 260,
    grossSales: 1890000,
    royalty: 348500,
    taxesAndCess: 164430,
    transportCharges: 330000,
    refunds: 6388,
    netCollection: 1553612,
    gatewaySettlement: 1890000,
    pendingReconciliation: 0,
    status: "100% Reconciled",
    exceptionsCount: 1,
  },
  {
    id: "DIST-06",
    district: "Janjgir-Champa",
    stockyardsCount: 2,
    totalTonnageMt: 3950,
    tripsCount: 245,
    grossSales: 1780000,
    royalty: 335750,
    taxesAndCess: 154860,
    transportCharges: 310000,
    refunds: 0,
    netCollection: 1470000,
    gatewaySettlement: 1780000,
    pendingReconciliation: 0,
    status: "100% Reconciled",
    exceptionsCount: 0,
  },
];

export const RevenueReconciliationView: React.FC = () => {
  const { payments, stockyards } = useSandMining();
  const { showSuccess, showError } = useStatusModal();

  const [districtData, setDistrictData] = useState<DistrictRevenueRecord[]>(INITIAL_DISTRICT_REVENUE);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictRevenueRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isExceptionModalOpen, setIsExceptionModalOpen] = useState(false);
  const [isReconcileBatchModalOpen, setIsReconcileBatchModalOpen] = useState(false);
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
  const [isReconciling, setIsReconciling] = useState(false);

  // Aggregated Financial Totals across all districts
  const totals = useMemo(() => {
    const grossSandSales = districtData.reduce((acc, curr) => acc + curr.grossSales, 0);
    const royalty = districtData.reduce((acc, curr) => acc + curr.royalty, 0);
    const taxesAndCharges = districtData.reduce((acc, curr) => acc + curr.taxesAndCess, 0);
    const transportCharges = districtData.reduce((acc, curr) => acc + curr.transportCharges, 0);
    const refunds = districtData.reduce((acc, curr) => acc + curr.refunds, 0);
    const netCollection = districtData.reduce((acc, curr) => acc + curr.netCollection, 0);
    const gatewaySettlement = districtData.reduce((acc, curr) => acc + curr.gatewaySettlement, 0);
    const pendingReconciliation = districtData.reduce((acc, curr) => acc + curr.pendingReconciliation, 0);
    const totalTonnage = districtData.reduce((acc, curr) => acc + curr.totalTonnageMt, 0);
    const totalTrips = districtData.reduce((acc, curr) => acc + curr.tripsCount, 0);

    return {
      grossSandSales,
      royalty,
      taxesAndCharges,
      transportCharges,
      refunds,
      netCollection,
      gatewaySettlement,
      pendingReconciliation,
      totalTonnage,
      totalTrips,
    };
  }, [districtData]);

  // Actions
  const handleTriggerReconciliation = () => {
    setIsReconciling(true);
    setTimeout(() => {
      setDistrictData((prev) =>
        prev.map((d) => ({
          ...d,
          pendingReconciliation: 0,
          gatewaySettlement: d.grossSales,
          status: "100% Reconciled",
        }))
      );
      setIsReconciling(false);
      setIsReconcileBatchModalOpen(false);
      showSuccess("Daily Cyber Treasury & ERP Settlement Complete! All pending receipts reconciled.");
    }, 1200);
  };

  const handleReconcileSingleDistrict = (dist: DistrictRevenueRecord) => {
    setDistrictData((prev) =>
      prev.map((d) =>
        d.id === dist.id
          ? { ...d, pendingReconciliation: 0, gatewaySettlement: d.grossSales, status: "100% Reconciled" }
          : d
      )
    );
    showSuccess(`Treasury reconciliation complete for District ${dist.district}!`);
  };

  // Table Columns Definition
  const columns: MRT_ColumnDef<DistrictRevenueRecord>[] = useMemo(
    () => [
      {
        accessorKey: "district",
        header: "District",
        size: 140,
        Cell: ({ row }) => (
          <button
            onClick={() => {
              setSelectedDistrict(row.original);
              setIsDetailModalOpen(true);
            }}
            className="font-bold text-xs text-slate-900 dark:text-white hover:underline text-left"
            title="Click to inspect district revenue dossier"
          >
            {row.original.district}
          </button>
        ),
      },
      {
        accessorKey: "totalTonnageMt",
        header: "Stock Movement",
        size: 150,
        Cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-mono text-xs font-bold text-orange-600">
              {row.original.totalTonnageMt.toLocaleString()} MT
            </span>
            <span className="text-[10px] text-slate-500">
              {row.original.tripsCount} Trips • {row.original.stockyardsCount} Stockyards
            </span>
          </div>
        ),
      },
      {
        accessorKey: "grossSales",
        header: "Gross Sales (₹)",
        size: 140,
        Cell: ({ row }) => (
          <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
            {row.original.grossSales.toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: "royalty",
        header: "Royalty (₹)",
        size: 130,
        Cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-orange-600">
            {row.original.royalty.toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: "taxesAndCess",
        header: "Taxes & Cess (₹)",
        size: 130,
        Cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            {row.original.taxesAndCess.toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: "transportCharges",
        header: "Transport (₹)",
        size: 130,
        Cell: ({ row }) => (
          <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
            {row.original.transportCharges.toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: "refunds",
        header: "Refunds (₹)",
        size: 120,
        Cell: ({ row }) => (
          <span
            className={`font-mono text-xs font-semibold ${
              row.original.refunds > 0 ? "text-rose-600" : "text-slate-400"
            }`}
          >
            {row.original.refunds > 0 ? row.original.refunds.toLocaleString() : "0"}
          </span>
        ),
      },
      {
        accessorKey: "netCollection",
        header: "Net Collection (₹)",
        size: 140,
        Cell: ({ row }) => (
          <span className="font-mono text-xs font-black text-emerald-600 dark:text-emerald-400">
            {row.original.netCollection.toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Settlement Status",
        size: 160,
        Cell: ({ row }) => {
          if (row.original.status === "100% Reconciled") {
            return <Badge variant="success">100% Reconciled</Badge>;
          }
          if (row.original.status === "Pending Reconciliation") {
            return <Badge variant="warning">Pending (₹{row.original.pendingReconciliation})</Badge>;
          }
          return <Badge variant="danger">{row.original.status}</Badge>;
        },
      },
    ],
    []
  );

  const exportCols = columns
    .filter((c) => c.accessorKey)
    .map((c) => ({ accessorKey: c.accessorKey as string, header: c.header as string }));

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Revenue & Reconciliation Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monitor money collected versus transactions, bank gateway settlement, statutory tax remittance, and physical stockyard movement.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={<Download size={14} />}
            onClick={() => exportToExcel(exportCols, districtData, "SMMS_Revenue_Reconciliation")}
          >
            Export Excel
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon={<Printer size={14} />}
            onClick={() =>
              exportToPDF(
                exportCols,
                districtData,
                "SMMS_Revenue_Reconciliation",
                "State Mineral Revenue & Treasury Reconciliation Statement"
              )
            }
          >
            Export PDF
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon={<AlertTriangle size={14} />}
            onClick={() => setIsExceptionModalOpen(true)}
          >
            View Exceptions
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={<RefreshCw size={14} className={isReconciling ? "animate-spin" : ""} />}
            onClick={() => setIsReconcileBatchModalOpen(true)}
          >
            Reconcile Treasury
          </Button>
        </div>
      </div>

      {/* ── 8 Core Financial KPI Cards (Covering all specification items) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Gross Sand Sales */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Sand Sales</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              ₹ {(totals.grossSandSales / 100000).toFixed(2)} Lakhs
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5 font-mono">{totals.totalTonnage.toLocaleString()} MT Sand Discharged</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <TrendingUp size={22} />
          </div>
        </div>

        {/* 2. State Mineral Royalty */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">State Royalty (₹85/MT)</p>
            <h3 className="text-2xl font-black text-orange-600 dark:text-orange-400 mt-1">
              ₹ {(totals.royalty / 100000).toFixed(2)} Lakhs
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Credited to Major Head 0853</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <ShieldCheck size={22} />
          </div>
        </div>

        {/* 3. Taxes & Statutory Cess */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Taxes & Cess (GST + DMF)</p>
            <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
              ₹ {(totals.taxesAndCharges / 100000).toFixed(2)} Lakhs
            </h3>
            <p className="text-[11px] text-indigo-600 mt-0.5">GST 5% & DMF 20%</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Percent size={22} />
          </div>
        </div>

        {/* 4. Transport Freight */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Transport Charges</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              ₹ {(totals.transportCharges / 100000).toFixed(2)} Lakhs
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5 font-mono">{totals.totalTrips.toLocaleString()} Commercial Trips</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Truck size={22} />
          </div>
        </div>

        {/* 5. Refunds & Reversals */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Authorized Refunds</p>
            <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
              ₹ {totals.refunds.toLocaleString()}
            </h3>
            <p className="text-[11px] text-rose-600 mt-0.5">Reversed to Consignee VPA</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <Ban size={22} />
          </div>
        </div>

        {/* 6. Net Government Collection */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Realized Collection</p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              ₹ {(totals.netCollection / 100000).toFixed(2)} Lakhs
            </h3>
            <p className="text-[11px] text-emerald-600 mt-0.5 font-semibold">Net of Transport & Refunds</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <IndianRupee size={22} />
          </div>
        </div>

        {/* 7. Payment Gateway Settlement */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gateway Settlement</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              ₹ {(totals.gatewaySettlement / 100000).toFixed(2)} Lakhs
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Cyber Treasury Bank Batch</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Building2 size={22} />
          </div>
        </div>

        {/* 8. Pending Reconciliation */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Reconciliation</p>
            <h3
              className={`text-2xl font-black mt-1 ${
                totals.pendingReconciliation > 0
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              ₹ {totals.pendingReconciliation.toLocaleString()}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {totals.pendingReconciliation > 0 ? "1 Transaction Pending" : "100% Balanced & Reconciled"}
            </p>
          </div>
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center ${
              totals.pendingReconciliation > 0
                ? "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
                : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            <Clock size={22} />
          </div>
        </div>
      </div>

      {/* ── Main District-wise Revenue Reconciliation Ledger ── */}
      <Card
        title="District-Wise Revenue Realization & Statutory Reconciliation Ledger"
        icon={FileText}
        action={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              icon={<RotateCcw size={13} />}
              onClick={() => {
                setDistrictData(INITIAL_DISTRICT_REVENUE);
                showSuccess("Revenue reconciliation ledger re-synchronized.");
              }}
            >
              Refresh
            </Button>
          </div>
        }
      >
        <ReusableTable
          columns={columns}
          data={districtData}
          exportFileName="SMMS_District_Revenue"
          onExportExcel={(rows) => exportToExcel(exportCols, rows, "SMMS_District_Revenue")}
          onExportPDF={(rows) =>
            exportToPDF(
              exportCols,
              rows,
              "SMMS_District_Revenue",
              "District-Wise Revenue Realization & Statutory Reconciliation"
            )
          }
          enableRowActions
          renderRowActions={({ row }) => {
            const isFullyReconciled = row.original.status === "100% Reconciled";
            const hasExceptions = row.original.exceptionsCount > 0;

            return (
              <div className="flex items-center gap-1">
                {/* 1. View District Revenue Dossier (Always Enabled) */}
                <button
                  title="View District Revenue Breakdown & Stock Movement"
                  onClick={() => {
                    setSelectedDistrict(row.original);
                    setIsDetailModalOpen(true);
                  }}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-slate-600 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors"
                >
                  <Eye size={14} />
                </button>

                {/* 2. Trigger Reconcile for District (Enabled if pending, Disabled if 100% reconciled) */}
                <button
                  title={
                    isFullyReconciled
                      ? "District is 100% reconciled with State Cyber Treasury"
                      : `Reconcile District ${row.original.district} (Pending: ₹${row.original.pendingReconciliation})`
                  }
                  disabled={isFullyReconciled}
                  onClick={() => handleReconcileSingleDistrict(row.original)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    isFullyReconciled
                      ? "text-emerald-600 dark:text-emerald-400 cursor-not-allowed opacity-40"
                      : "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50"
                  }`}
                >
                  <RotateCcw size={14} />
                </button>

                {/* 3. View Exceptions (Enabled if exceptions exist, Disabled if clean) */}
                <button
                  title={
                    hasExceptions
                      ? `Inspect ${row.original.exceptionsCount} Audit Discrepancies / Refund Claims`
                      : "No reconciliation exceptions in this district"
                  }
                  disabled={!hasExceptions}
                  onClick={() => {
                    setSelectedDistrict(row.original);
                    setIsExceptionModalOpen(true);
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    hasExceptions
                      ? "text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                      : "text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-40"
                  }`}
                >
                  <AlertTriangle size={14} />
                </button>

                {/* 4. Print District Treasury Statement (Always Enabled) */}
                <button
                  title="Print Form VI District Revenue Realization Statement"
                  onClick={() => {
                    setSelectedDistrict(row.original);
                    setIsStatementModalOpen(true);
                  }}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                >
                  <Printer size={14} />
                </button>
              </div>
            );
          }}
        />
      </Card>

      {/* ── MODAL 1: BATCH TREASURY & ERP RECONCILIATION ── */}
      <Modal
        isOpen={isReconcileBatchModalOpen}
        onClose={() => setIsReconcileBatchModalOpen(false)}
        title="Automated Cyber Treasury & ERP Reconciliation"
        subtitle="Cross-verify state treasury payment receipts against weighbridge gate-out tonnage"
        size="md"
        footer={null}
      >
        <div className="space-y-4 pt-1 text-xs">
          <div className="p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600">
                <RefreshCw size={20} className={isReconciling ? "animate-spin" : ""} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  Statewide Cyber Treasury Batch Sync
                </h4>
                <p className="text-[11px] text-slate-500">
                  Target: Major Head 0853 & District Mineral Foundations (DMF)
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 font-mono">
            <div>
              <span className="text-slate-500 font-sans text-[10px] block">TOTAL PENDING CLEARANCE</span>
              <span className="text-base font-bold text-amber-600">₹ {totals.pendingReconciliation.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-500 font-sans text-[10px] block">MATCHED GATEWAY BALANCE</span>
              <span className="text-base font-bold text-emerald-600">₹ {totals.gatewaySettlement.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-500 font-sans text-[10px] block">CROSS-MATCHED TONNAGE</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{totals.totalTonnage.toLocaleString()} MT</span>
            </div>
            <div>
              <span className="text-slate-500 font-sans text-[10px] block">COMMERCIAL TRIPS</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{totals.totalTrips.toLocaleString()} Trips</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            Reconciliation verifies bank UTR settlement codes, electronic transit e-Pass tonnage, and weighbridge gross-tare ledger balances.
          </p>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" onClick={() => setIsReconcileBatchModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={isReconciling}
              icon={<ShieldCheck size={14} />}
              onClick={handleTriggerReconciliation}
            >
              Execute Reconciliation
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── MODAL 2: REVENUE DISCREPANCIES & EXCEPTIONS AUDIT ── */}
      <Modal
        isOpen={isExceptionModalOpen}
        onClose={() => setIsExceptionModalOpen(false)}
        title="Reconciliation Audit & Exceptions Log"
        subtitle="Flagged variances, refund claims, and gateway dropped transactions"
        size="lg"
        footer={
          <ModalFooter
            onClose={() => setIsExceptionModalOpen(false)}
            showConfirm={false}
            cancelText="Close Exceptions Log"
          />
        }
      >
        <div className="space-y-4 pt-1 text-xs">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-2.5 text-rose-800 dark:text-rose-300">
            <AlertTriangle size={16} className="shrink-0 mt-0.5 text-rose-600" />
            <div>
              <span className="font-bold">2 Audit Exceptions Identified Across Statewide Ledger:</span>
              <p className="text-[11px] mt-0.5">
                All exceptions must be reconciled before monthly treasury accounts closure.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {/* Exception 1 */}
            <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-amber-600">Bilaspur District • BKG-CG-2026-0942</span>
                <Badge variant="warning">Pending Gateway Callback</Badge>
              </div>
              <p className="text-slate-700 dark:text-slate-300">
                Amount: <strong>₹ 7,688</strong> • Citizen Sunita Verma attempted card transaction; bank settlement token awaiting 2-way handshake.
              </p>
              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>UTR: HDFC-CG-Pending</span>
                <span>Action: Auto-poll callback queued</span>
              </div>
            </div>

            {/* Exception 2 */}
            <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-blue-600">Bastar District • BKG-CG-2026-0925</span>
                <Badge variant="info">Authorized Refund Reversal</Badge>
              </div>
              <p className="text-slate-700 dark:text-slate-300">
                Amount: <strong>₹ 6,388</strong> • Order cancelled by Bastar Development Authority prior to pithead dispatch. Treasury refund voucher issued.
              </p>
              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>Refund Ref: REF-TREASURY-09912</span>
                <span>Action: Reconciled in Net Realization</span>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* ── MODAL 3: DISTRICT REVENUE DOSSIER ── */}
      {selectedDistrict && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`District Revenue & Stock Dossier – ${selectedDistrict.district}`}
          subtitle="Itemized statutory mineral royalty, cess realizations, and physical stockyard movement"
          size="lg"
          footer={
            <ModalFooter
              onClose={() => setIsDetailModalOpen(false)}
              onConfirm={() => {
                setIsDetailModalOpen(false);
                setIsStatementModalOpen(true);
              }}
              confirmText="Print Statement"
              confirmIcon={<Printer size={14} />}
            />
          }
        >
          <div className="space-y-4 pt-1 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 font-mono">
              <div>
                <span className="text-slate-500 font-sans text-[10px] block">DISTRICT</span>
                <span className="font-bold text-purple-600 text-sm">{selectedDistrict.district}</span>
              </div>
              <div>
                <span className="text-slate-500 font-sans text-[10px] block">ACTIVE DEPOTS</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedDistrict.stockyardsCount} Yards</span>
              </div>
              <div>
                <span className="text-slate-500 font-sans text-[10px] block">SAND DISCHARGED</span>
                <span className="font-bold text-orange-600 text-sm">{selectedDistrict.totalTonnageMt.toLocaleString()} MT</span>
              </div>
              <div>
                <span className="text-slate-500 font-sans text-[10px] block">STATUS</span>
                <Badge variant={selectedDistrict.status === "100% Reconciled" ? "success" : "warning"}>
                  {selectedDistrict.status}
                </Badge>
              </div>
            </div>

            {/* Financial Headings Breakdown */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 font-bold flex justify-between">
                <span>Statutory Realization Heads</span>
                <span>Amount (₹)</span>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-slate-800 p-1">
                <div className="p-2 flex justify-between">
                  <span>1. Gross Sand Sales Realized</span>
                  <span className="font-mono font-bold">₹ {selectedDistrict.grossSales.toLocaleString()}</span>
                </div>
                <div className="p-2 flex justify-between">
                  <span>2. State Mineral Royalty (@ ₹85/MT)</span>
                  <span className="font-mono font-bold text-orange-600">₹ {selectedDistrict.royalty.toLocaleString()}</span>
                </div>
                <div className="p-2 flex justify-between">
                  <span>3. GST & District Mineral Foundation (DMF)</span>
                  <span className="font-mono font-semibold text-indigo-600">₹ {selectedDistrict.taxesAndCess.toLocaleString()}</span>
                </div>
                <div className="p-2 flex justify-between">
                  <span>4. Empanelled Transport Freight</span>
                  <span className="font-mono font-semibold">₹ {selectedDistrict.transportCharges.toLocaleString()}</span>
                </div>
                <div className="p-2 flex justify-between">
                  <span>5. Authorized Refunds / Reversals</span>
                  <span className="font-mono font-semibold text-rose-600">
                    {selectedDistrict.refunds > 0 ? `- ₹ ${selectedDistrict.refunds.toLocaleString()}` : "₹ 0"}
                  </span>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 font-bold flex justify-between text-sm">
                  <span>Net Government Realization</span>
                  <span className="font-mono text-emerald-700 dark:text-emerald-300">
                    ₹ {selectedDistrict.netCollection.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── MODAL 4: PRINTABLE STATUTORY STATEMENT ── */}
      {selectedDistrict && (
        <Modal
          isOpen={isStatementModalOpen}
          onClose={() => setIsStatementModalOpen(false)}
          title="Official Mineral Revenue Realization Statement"
          subtitle="Directorate of Geology & Mining – Government of Chhattisgarh"
          size="lg"
          footer={
            <ModalFooter
              onClose={() => setIsStatementModalOpen(false)}
              onConfirm={() => window.print()}
              confirmText="Print Statement"
              confirmIcon={<Printer size={14} />}
            />
          }
        >
          <div className="bg-white text-slate-900 p-6 rounded-2xl border border-slate-300 space-y-4 font-sans text-xs">
            {/* Header */}
            <div className="flex justify-between border-b-2 border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-500 block">
                  GOVERNMENT OF CHHATTISGARH
                </span>
                <h2 className="text-base font-black text-slate-900">DIRECTORATE OF GEOLOGY & MINING</h2>
                <p className="text-xs font-semibold text-purple-700">
                  Sand Mining Management System (CG-SMMS) • Form VI (District Revenue Statement)
                </p>
              </div>
              <div className="text-right">
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-900 text-white rounded">
                  OFFICIAL AUDIT STATEMENT
                </span>
                <p className="font-mono text-xs font-bold mt-1">District: {selectedDistrict.district}</p>
                <p className="text-[10px] text-slate-500 font-mono">Statement Date: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Physical Stock Movement</p>
                <div className="flex justify-between"><span>Active Sand Depots:</span><span className="font-bold">{selectedDistrict.stockyardsCount}</span></div>
                <div className="flex justify-between"><span>Total Sand Dispatched:</span><span className="font-mono font-bold text-orange-600">{selectedDistrict.totalTonnageMt.toLocaleString()} MT</span></div>
                <div className="flex justify-between"><span>Completed e-Pass Trips:</span><span className="font-mono font-bold">{selectedDistrict.tripsCount}</span></div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Treasury Clearance</p>
                <div className="flex justify-between"><span>Gateway Settlement:</span><span className="font-mono font-bold">₹ {selectedDistrict.gatewaySettlement.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Pending Variance:</span><span className="font-mono font-bold text-emerald-700">₹ {selectedDistrict.pendingReconciliation.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Audit Status:</span><span className="font-bold text-emerald-700 uppercase">{selectedDistrict.status}</span></div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1 border border-slate-200">
              <div className="flex justify-between"><span>Gross Sand Sales:</span><span className="font-mono font-bold">₹ {selectedDistrict.grossSales.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Statutory Royalty Remitted:</span><span className="font-mono font-bold text-orange-600">₹ {selectedDistrict.royalty.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>GST & DMF Realization:</span><span className="font-mono font-semibold">₹ {selectedDistrict.taxesAndCess.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Transport Freight Disbursed:</span><span className="font-mono font-semibold">₹ {selectedDistrict.transportCharges.toLocaleString()}</span></div>
              <div className="flex justify-between font-bold text-sm pt-1 border-t border-slate-300 text-emerald-800">
                <span>NET CONSOLIDATED REALIZATION:</span>
                <span className="font-mono">₹ {selectedDistrict.netCollection.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default RevenueReconciliationView;
