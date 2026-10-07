import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  CreditCard,
  Printer,
  RotateCcw,
  Ban,
  ShieldCheck,
  Download,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Lock,
  QrCode,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import type { PaymentTransaction } from "@/features/shared-simulation/types";
import ReusableTable from "@/shared/components/ui/Table/ReusableTable/ReusableTable";
import type { MRT_ColumnDef } from "material-react-table";
import Button from "@/shared/components/ui/Button";
import Badge from "@/shared/components/ui/Badge";
import Card from "@/shared/components/layout/Card/Card";
import Modal, { ModalFooter } from "@/shared/components/ui/Modal/Modal";
import { exportToExcel, exportToPDF } from "@/shared/utils/exportUtils";
import { routes } from "@/app/routes/routeConfig";
import { useStatusModal } from "@/config/theme/StatusModalContext";
import { inputBase, inputNormal } from "@/shared/components/ui/Forms/inputStyles";
import "../styles/payment.css";

export const PaymentTransactionList: React.FC = () => {
  const { payments } = useSandMining();
  const { showSuccess, showError } = useStatusModal();
  const navigate = useNavigate();

  const [localPayments, setLocalPayments] = useState<PaymentTransaction[]>(payments);
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [isRetryModalOpen, setIsRetryModalOpen] = useState(false);

  // Refund Form State
  const [refundReason, setRefundReason] = useState("Consignee authorized order cancellation prior to dispatch.");
  const [authorizingOfficer, setAuthorizingOfficer] = useState("Assistant Director (Mining Treasury)");

  // Status Badge Variants
  const statusVariant: Record<string, any> = {
    Success: "success",
    Pending: "warning",
    Failed: "danger",
    Refunded: "info",
    Reconciled: "success",
    "Payment Pending": "warning",
    "Challan Generated": "primary",
  };

  // KPIs
  const stats = useMemo(() => {
    const totalTransactions = localPayments.length;
    const successfulTxns = localPayments.filter(
      (p) => p.paymentStatus === "Success" || p.paymentStatus === "Reconciled"
    );
    const totalCollected = successfulTxns.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
    const totalRoyalty = successfulTxns.reduce(
      (acc, curr) => acc + (curr.royaltyAmount || curr.royalty || 0),
      0
    );
    const pendingCount = localPayments.filter(
      (p) => p.paymentStatus === "Pending" || p.paymentStatus === "Payment Pending"
    ).length;
    const failedCount = localPayments.filter((p) => p.paymentStatus === "Failed").length;

    return {
      totalTransactions,
      totalCollected,
      totalRoyalty,
      pendingCount,
      failedCount,
    };
  }, [localPayments]);

  // Action Handlers
  const handleOpenReceipt = (txn: PaymentTransaction) => {
    setSelectedTransaction(txn);
    setIsReceiptModalOpen(true);
  };

  const handleOpenDetail = (txn: PaymentTransaction) => {
    setSelectedTransaction(txn);
    setIsDetailModalOpen(true);
  };

  const handleOpenRefund = (txn: PaymentTransaction) => {
    setSelectedTransaction(txn);
    setIsRefundModalOpen(true);
  };

  const handleOpenRetry = (txn: PaymentTransaction) => {
    setSelectedTransaction(txn);
    setIsRetryModalOpen(true);
  };

  const handleConfirmRefund = () => {
    if (!selectedTransaction) return;
    if (!refundReason.trim()) {
      showError("Please provide an official refund authorization reason.");
      return;
    }

    setLocalPayments((prev) =>
      prev.map((p) =>
        p.id === selectedTransaction.id
          ? {
              ...p,
              paymentStatus: "Refunded",
              failureReason: `Refunded ₹${selectedTransaction.totalAmount}: ${refundReason} (Auth: ${authorizingOfficer})`,
            }
          : p
      )
    );

    showSuccess(
      `Refund of ₹ ${selectedTransaction.totalAmount.toLocaleString()} authorized for ${selectedTransaction.bookingId}. Reconciled with State Treasury.`
    );
    setIsRefundModalOpen(false);
  };

  const handleExecuteRetry = () => {
    if (!selectedTransaction) return;

    setLocalPayments((prev) =>
      prev.map((p) =>
        p.id === selectedTransaction.id
          ? {
              ...p,
              paymentStatus: "Success",
              bankSettlementRef: `RETRY-SETTLED-${Date.now().toString().slice(-6)}`,
              transactionTime: new Date().toISOString().replace("T", " ").substring(0, 16),
            }
          : p
      )
    );

    showSuccess(`Payment Retry Successful for ${selectedTransaction.transactionId}! Transaction settled.`);
    setIsRetryModalOpen(false);
  };

  // Columns definition
  const columns: MRT_ColumnDef<PaymentTransaction>[] = useMemo(
    () => [
      {
        accessorKey: "transactionId",
        header: "Transaction ID",
        size: 190,
        Cell: ({ row }) => (
          <button
            onClick={() => handleOpenDetail(row.original)}
            className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 text-left"
            title="Click to inspect payment dossier"
          >
            <ShieldCheck size={13} className="text-emerald-500 shrink-0" />
            <span className="truncate">{row.original.transactionId}</span>
          </button>
        ),
      },
      {
        accessorKey: "bookingId",
        header: "Booking ID",
        size: 140,
        Cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-purple-600 dark:text-purple-400">
            {row.original.bookingId}
          </span>
        ),
      },
      {
        accessorKey: "customerName",
        header: "Customer",
        size: 180,
        Cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
              {row.original.customerName}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              {row.original.customerMobile || "+91 98260 12345"}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "sandAmount",
        header: "Sand Amount & Weight",
        size: 170,
        Cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-mono text-xs font-bold text-orange-600">
              {row.original.quantityMt || 10} MT Sand
            </span>
            <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
              ₹ {row.original.sandAmount.toLocaleString()} ({row.original.sandType || "River Sand"})
            </span>
          </div>
        ),
      },
      {
        accessorKey: "royalty",
        header: "Royalty (₹)",
        size: 110,
        Cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-orange-600">
            {(row.original.royaltyAmount || row.original.royalty).toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: "totalAmount",
        header: "Total Paid (₹)",
        size: 130,
        Cell: ({ row }) => (
          <span className="font-mono text-xs font-black text-slate-900 dark:text-white">
            {row.original.totalAmount.toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: "paymentMode",
        header: "Payment Mode",
        size: 140,
        Cell: ({ row }) => (
          <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
            {row.original.paymentMode}
          </span>
        ),
      },
      {
        accessorKey: "transactionTime",
        header: "Settlement Time",
        size: 140,
        Cell: ({ row }) => (
          <span className="font-mono text-[11px] text-slate-500">
            {row.original.transactionTime}
          </span>
        ),
      },
      {
        accessorKey: "paymentStatus",
        header: "Payment Status",
        size: 140,
        Cell: ({ row }) => (
          <Badge variant={statusVariant[row.original.paymentStatus] || "secondary"}>
            {row.original.paymentStatus}
          </Badge>
        ),
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
            Payment & Receipt Ledger
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Collect, verify and reconcile statutory mineral royalty, DMF cess, transport levies, and treasury receipt challans.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={<Download size={14} />}
            onClick={() => exportToExcel(exportCols, localPayments, "SMMS_Payment_Ledger")}
          >
            Export Excel
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon={<Printer size={14} />}
            onClick={() => exportToPDF(exportCols, localPayments, "SMMS_Payment_Ledger", "State Mineral Payment & Treasury Ledger")}
          >
            Export PDF
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={<CreditCard size={14} />}
            onClick={() => navigate("/process-payment")}
          >
            Process Gateway Checkout
          </Button>
        </div>
      </div>

      {/* ── Top KPI Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Collections</p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              ₹ {stats.totalCollected.toLocaleString()}
            </h3>
            <p className="text-[11px] text-emerald-600 mt-0.5">100% Treasury Reconciled</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">State Mineral Royalty</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              ₹ {stats.totalRoyalty.toLocaleString()}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Remitted to Consolidated Fund</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <ShieldCheck size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Settlement</p>
            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {stats.pendingCount}{" "}
              <span className="text-sm font-semibold text-slate-500">Orders</span>
            </h3>
            <p className="text-[11px] text-amber-600 mt-0.5">Awaiting Citizen Payment</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Failed / Gateway Drops</p>
            <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
              {stats.failedCount}{" "}
              <span className="text-sm font-semibold text-slate-500">Alerts</span>
            </h3>
            <p className="text-[11px] text-rose-600 mt-0.5">Eligible for Auto-Retry</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertTriangle size={22} />
          </div>
        </div>
      </div>

      {/* ── Main Transactions Table ── */}
      <Card
        title="Statewide Payment Transactions & Statutory Invoicing Ledger"
        icon={FileText}
        action={
          <Button
            size="sm"
            variant="outline"
            icon={<RotateCcw size={13} />}
            onClick={() => {
              setLocalPayments(payments);
              showSuccess("Payment transaction ledger re-synchronized.");
            }}
          >
            Refresh
          </Button>
        }
      >
        <ReusableTable
          columns={columns}
          data={localPayments}
          exportFileName="SMMS_Payments"
          onExportExcel={(rows) => exportToExcel(exportCols, rows, "SMMS_Payments")}
          onExportPDF={(rows) => exportToPDF(exportCols, rows, "SMMS_Payments", "Payment Transactions")}
          enableRowActions
          renderRowActions={({ row }) => {
            const isSuccess =
              row.original.paymentStatus === "Success" ||
              row.original.paymentStatus === "Reconciled";
            const isPending =
              row.original.paymentStatus === "Pending" ||
              row.original.paymentStatus === "Payment Pending";
            const isFailed = row.original.paymentStatus === "Failed";
            const isRefunded = row.original.paymentStatus === "Refunded";

            return (
              <div className="flex items-center gap-1">
                {/* 1. View Transaction Dossier (Always Enabled) */}
                <button
                  title="View Itemized Payment Breakdown & Treasury Receipt"
                  onClick={() => handleOpenDetail(row.original)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                >
                  <Eye size={14} />
                </button>

                {/* 2. Pay Now (Enabled if Pending, Disabled otherwise) */}
                <button
                  title={
                    isPending
                      ? "Pay Now / Complete Transaction"
                      : "Transaction already processed"
                  }
                  disabled={!isPending}
                  onClick={() => navigate("/process-payment")}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    isPending
                      ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                      : "text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-40"
                  }`}
                >
                  <CreditCard size={14} />
                </button>

                {/* 3. Retry (Enabled if Failed, Disabled otherwise) */}
                <button
                  title={
                    isFailed
                      ? "Retry Failed Payment via Alternate Gateway"
                      : "Retry only applicable for failed transactions"
                  }
                  disabled={!isFailed}
                  onClick={() => handleOpenRetry(row.original)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    isFailed
                      ? "text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                      : "text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-40"
                  }`}
                >
                  <RotateCcw size={14} />
                </button>

                {/* 4. Generate / Print Official Receipt (Enabled if Success, Disabled otherwise) */}
                <button
                  title={
                    isSuccess
                      ? "Generate & Print Official Form V Treasury Receipt"
                      : "Receipt generated only for successful transactions"
                  }
                  disabled={!isSuccess}
                  onClick={() => handleOpenReceipt(row.original)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    isSuccess
                      ? "text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/50"
                      : "text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-40"
                  }`}
                >
                  <Printer size={14} />
                </button>

                {/* 5. Refund / Cancel Authorized (Enabled if Success & not refunded, Disabled otherwise) */}
                <button
                  title={
                    isSuccess
                      ? "Authorize Cancellation & Treasury Refund"
                      : isRefunded
                      ? "Transaction already refunded"
                      : "Refund only available for settled payments"
                  }
                  disabled={!isSuccess}
                  onClick={() => handleOpenRefund(row.original)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    isSuccess
                      ? "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50"
                      : "text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-40"
                  }`}
                >
                  <Ban size={14} />
                </button>
              </div>
            );
          }}
        />
      </Card>

      {/* ── MODAL 1: VIEW PAYMENT DOSSIER ── */}
      {selectedTransaction && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Payment Transaction Dossier – ${selectedTransaction.transactionId}`}
          subtitle="Itemized statutory tariff breakdown, gateway confirmation, and treasury accounting"
          size="lg"
          footer={
            <ModalFooter
              onClose={() => setIsDetailModalOpen(false)}
              onConfirm={() => {
                setIsDetailModalOpen(false);
                setIsReceiptModalOpen(true);
              }}
              confirmText="Generate Official Receipt"
              confirmIcon={<Printer size={14} />}
            />
          }
        >
          <div className="space-y-4 pt-1 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 font-mono">
              <div>
                <span className="text-slate-500 font-sans text-[10px] block">TRANSACTION ID</span>
                <span className="font-bold text-emerald-600 text-xs">{selectedTransaction.transactionId}</span>
              </div>
              <div>
                <span className="text-slate-500 font-sans text-[10px] block">BOOKING REF</span>
                <span className="font-bold text-purple-600 text-xs">{selectedTransaction.bookingId}</span>
              </div>
              <div>
                <span className="text-slate-500 font-sans text-[10px] block">PAYMENT MODE</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{selectedTransaction.paymentMode}</span>
              </div>
              <div>
                <span className="text-slate-500 font-sans text-[10px] block">GATEWAY STATUS</span>
                <Badge variant={statusVariant[selectedTransaction.paymentStatus] || "secondary"}>
                  {selectedTransaction.paymentStatus}
                </Badge>
              </div>
            </div>

            {/* Consignment Itemized Charges */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 font-bold flex justify-between">
                <span>Approved Statutory Headings</span>
                <span>Amount (₹)</span>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-slate-800 p-1">
                <div className="p-2 flex justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                      Base Mineral Cost ({selectedTransaction.quantityMt || 10} MT Sand Weight)
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Mineral Grade: {selectedTransaction.sandType || "Coarse River Sand"}
                    </span>
                  </div>
                  <span className="font-mono font-semibold">₹ {selectedTransaction.sandAmount.toLocaleString()}</span>
                </div>

                <div className="p-2 flex justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                      State Mineral Royalty (₹85/MT × {selectedTransaction.quantityMt || 10} MT)
                    </span>
                    <span className="text-[10px] text-slate-500">Credited to Major Head 0853</span>
                  </div>
                  <span className="font-mono font-semibold text-orange-600">
                    ₹ {(selectedTransaction.royaltyAmount || selectedTransaction.royalty).toLocaleString()}
                  </span>
                </div>

                <div className="p-2 flex justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">District Mineral Foundation (DMF) Cess (20%)</span>
                    <span className="text-[10px] text-slate-500">District trust fund</span>
                  </div>
                  <span className="font-mono font-semibold">₹ {(selectedTransaction.dmfCess || 272).toLocaleString()}</span>
                </div>

                <div className="p-2 flex justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">Logistics / Freight Service Charge</span>
                    <span className="text-[10px] text-slate-500">Empanelled transport freight</span>
                  </div>
                  <span className="font-mono font-semibold">₹ {selectedTransaction.transportCharges.toLocaleString()}</span>
                </div>

                <div className="p-2 flex justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">Goods & Services Tax (GST 5%)</span>
                    <span className="text-[10px] text-slate-500">CGST + SGST statutory tax</span>
                  </div>
                  <span className="font-mono font-semibold">₹ {(selectedTransaction.gstAmount || selectedTransaction.gstTax).toLocaleString()}</span>
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 font-bold flex justify-between text-sm">
                  <span>Gross Reconciled Amount</span>
                  <span className="font-mono text-emerald-700 dark:text-emerald-300">
                    ₹ {selectedTransaction.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-500 block font-semibold">Banking & Treasury Reconciliation Audit</span>
              <div className="flex justify-between font-mono text-[11px]">
                <span>Settlement Reference: <strong>{selectedTransaction.bankSettlementRef}</strong></span>
                <span>Challan #: <strong>{selectedTransaction.challanNumber || "CHL-CG-2026-8801"}</strong></span>
              </div>
              {selectedTransaction.failureReason && (
                <p className="text-rose-600 font-semibold mt-1">Audit Notes: {selectedTransaction.failureReason}</p>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ── MODAL 2: PRINTABLE OFFICIAL TREASURY RECEIPT ── */}
      {selectedTransaction && (
        <Modal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          title="Official Mineral Sale Treasury Receipt & Invoicing Challan"
          subtitle="Directorate of Geology & Mining – Government of Chhattisgarh"
          size="lg"
          footer={
            <ModalFooter
              onClose={() => setIsReceiptModalOpen(false)}
              onConfirm={() => window.print()}
              confirmText="Print Treasury Receipt"
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
                <p className="text-xs font-semibold text-emerald-700">
                  Sand Mining Management System (CG-SMMS) • Form V (Official Tax Invoice)
                </p>
              </div>
              <div className="text-right">
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-900 text-white rounded">
                  TREASURY RECEIPT
                </span>
                <p className="font-mono text-xs font-bold mt-1">
                  Receipt #: {selectedTransaction.receiptNumber || `RCPT-CG-2026-${selectedTransaction.transactionId.slice(-4)}`}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">Date: {selectedTransaction.transactionTime}</p>
              </div>
            </div>

            {/* Consignment Specs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Customer & Mineral Allotment</p>
                <div className="flex justify-between"><span>Customer Name:</span><span className="font-bold">{selectedTransaction.customerName}</span></div>
                <div className="flex justify-between"><span>Booking Order ID:</span><span className="font-mono font-bold">{selectedTransaction.bookingId}</span></div>
                <div className="flex justify-between"><span>Sand Weight (Tonnage):</span><span className="font-mono font-bold text-orange-600">{selectedTransaction.quantityMt || 10} MT ({selectedTransaction.sandType || "River Sand"})</span></div>
                <div className="flex justify-between"><span>Payment Mode:</span><span className="font-semibold">{selectedTransaction.paymentMode}</span></div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Treasury Clearance</p>
                <div className="flex justify-between"><span>Txn Reference:</span><span className="font-mono font-bold">{selectedTransaction.transactionId}</span></div>
                <div className="flex justify-between"><span>Bank Settlement:</span><span className="font-mono">{selectedTransaction.bankSettlementRef}</span></div>
                <div className="flex justify-between"><span>Challan #:</span><span className="font-mono font-bold">{selectedTransaction.challanNumber || "CHL-CG-2026-8801"}</span></div>
              </div>
            </div>

            {/* Itemized summary */}
            <div className="p-3 bg-slate-50 rounded-xl space-y-1 border border-slate-200">
              <div className="flex justify-between"><span>1. Pithead Mineral Cost ({selectedTransaction.quantityMt || 10} MT):</span><span className="font-mono font-semibold">₹ {selectedTransaction.sandAmount.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>2. Statutory State Royalty (₹85/MT):</span><span className="font-mono font-semibold">₹ {(selectedTransaction.royaltyAmount || selectedTransaction.royalty).toLocaleString()}</span></div>
              <div className="flex justify-between"><span>3. District Mineral Foundation (DMF):</span><span className="font-mono font-semibold">₹ {(selectedTransaction.dmfCess || 272).toLocaleString()}</span></div>
              <div className="flex justify-between"><span>4. Transportation / Freight:</span><span className="font-mono font-semibold">₹ {selectedTransaction.transportCharges.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>5. GST (5%):</span><span className="font-mono font-semibold">₹ {(selectedTransaction.gstAmount || selectedTransaction.gstTax).toLocaleString()}</span></div>
              <div className="flex justify-between font-bold text-sm pt-1 border-t border-slate-300 text-emerald-800">
                <span>TOTAL AMOUNT PAID:</span>
                <span className="font-mono">₹ {selectedTransaction.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Signature & QR Stamp */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200 items-end">
              <div className="flex flex-col items-center justify-center p-2 bg-white border border-slate-300 rounded-xl">
                <QrCode size={56} className="text-slate-900" />
                <span className="text-[8px] font-mono text-slate-500 mt-0.5">TREASURY VERIFIED QR</span>
              </div>
              <div className="text-center space-y-1">
                <div className="h-8 border-b border-dashed border-slate-400 flex items-center justify-center font-mono text-[10px] text-slate-500">
                  DIGITAL SEAL: 0x89F4...291B
                </div>
                <p className="text-[9px] font-bold text-slate-500 uppercase">State Cyber Treasury</p>
              </div>
              <div className="text-center space-y-1">
                <div className="h-8 border-b border-dashed border-slate-400 flex items-center justify-center font-serif italic text-xs text-emerald-700">
                  Officer P. Chandrakar
                </div>
                <p className="text-[9px] font-bold text-slate-500 uppercase">Authorized Officer</p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── MODAL 3: REFUND / CANCEL AUTHORIZATION ── */}
      {selectedTransaction && (
        <Modal
          isOpen={isRefundModalOpen}
          onClose={() => setIsRefundModalOpen(false)}
          title={`Authorize Cancellation & Refund – ${selectedTransaction.transactionId}`}
          subtitle="Official Treasury refund remittal to source customer bank/UPI"
          size="md"
          footer={null}
        >
          <div className="space-y-4 pt-1 text-xs">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-300">
              <p className="font-bold">Refund Amount: ₹ {selectedTransaction.totalAmount.toLocaleString()}</p>
              <p className="text-[11px] mt-0.5">
                Funds will be reversed to <strong>{selectedTransaction.customerName}</strong> via {selectedTransaction.paymentMode}.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Official Cancellation & Refund Reason *
              </label>
              <textarea
                rows={2}
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className={`${inputBase} ${inputNormal}`}
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Authorizing Mining / Treasury Officer *
              </label>
              <input
                type="text"
                value={authorizingOfficer}
                onChange={(e) => setAuthorizingOfficer(e.target.value)}
                className={`${inputBase} ${inputNormal}`}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" onClick={() => setIsRefundModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" icon={<Ban size={14} />} onClick={handleConfirmRefund}>
                Confirm Treasury Refund
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── MODAL 4: RETRY FAILED PAYMENT ── */}
      {selectedTransaction && (
        <Modal
          isOpen={isRetryModalOpen}
          onClose={() => setIsRetryModalOpen(false)}
          title={`Retry Payment – ${selectedTransaction.transactionId}`}
          subtitle="Re-initiate statutory transaction with secondary payment gateway"
          size="md"
          footer={null}
        >
          <div className="space-y-4 pt-1 text-xs">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-300">
              <p className="font-bold">Previous Failure Reason:</p>
              <p className="text-[11px] mt-0.5">{selectedTransaction.failureReason || "Gateway connection timeout"}</p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between font-bold text-sm">
                <span>Amount to Settle:</span>
                <span className="font-mono text-emerald-600">₹ {selectedTransaction.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" onClick={() => setIsRetryModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" icon={<RotateCcw size={14} />} onClick={handleExecuteRetry}>
                Re-attempt Gateway Settlement
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PaymentTransactionList;
