import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  CreditCard,
  Plus,
  ShoppingCart,
  CheckCircle2,
  Clock,
  Truck,
  Warehouse,
  Printer,
  FileText,
  RotateCcw,
  Sparkles,
  Download,
  ShieldCheck,
  Building2,
  Calendar,
  AlertTriangle,
  MapPin,
  Cpu,
} from "lucide-react";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import type { SandBooking } from "@/features/shared-simulation/types";
import ReusableTable from "@/shared/components/ui/Table/ReusableTable/ReusableTable";
import type { MRT_ColumnDef } from "material-react-table";
import Button from "@/shared/components/ui/Button";
import Badge from "@/shared/components/ui/Badge";
import Card from "@/shared/components/layout/Card/Card";
import Modal, { ModalFooter } from "@/shared/components/ui/Modal/Modal";
import { exportToExcel, exportToPDF } from "@/shared/utils/exportUtils";
import { routes } from "@/app/routes/routeConfig";
import { useStatusModal } from "@/config/theme/StatusModalContext";
import "../styles/sandBooking.css";

export const SandBookingList: React.FC = () => {
  const { bookings, stockyards } = useSandMining();
  const { showSuccess, showError } = useStatusModal();
  const navigate = useNavigate();

  const [selectedBooking, setSelectedBooking] = useState<SandBooking | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isChallanModalOpen, setIsChallanModalOpen] = useState(false);

  // Status Badge Variants
  const bookingVariant: Record<string, any> = {
    Draft: "secondary",
    Booked: "primary",
    Paid: "success",
    "Vehicle Assigned": "warning",
    Dispatched: "primary",
    Delivered: "success",
    Closed: "secondary",
  };

  const payVariant: Record<string, any> = {
    "Payment Pending": "warning",
    Paid: "success",
    Failed: "danger",
    Refunded: "secondary",
  };

  // KPIs
  const stats = useMemo(() => {
    const totalOrders = bookings.length;
    const totalTonnage = bookings.reduce((acc, curr) => acc + (curr.quantityMt || 0), 0);
    const paidCount = bookings.filter((b) => b.paymentStatus === "Paid").length;
    const pendingPaymentCount = bookings.filter((b) => b.paymentStatus === "Payment Pending").length;
    const grossRevenue = bookings
      .filter((b) => b.paymentStatus === "Paid")
      .reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

    return { totalOrders, totalTonnage, paidCount, pendingPaymentCount, grossRevenue };
  }, [bookings]);

  // Columns definition
  const columns: MRT_ColumnDef<SandBooking>[] = useMemo(
    () => [
      {
        accessorKey: "orderId",
        header: "Order ID",
        size: 160,
        Cell: ({ row }) => (
          <button
            onClick={() => {
              setSelectedBooking(row.original);
              setIsDetailModalOpen(true);
            }}
            className="font-mono text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 text-left"
            title="Click to view order details"
          >
            <ShoppingCart size={13} className="shrink-0 text-orange-500" />
            <span>{row.original.orderId}</span>
          </button>
        ),
      },
      {
        accessorKey: "customerName",
        header: "Customer",
        size: 190,
        Cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
              {row.original.customerName}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              {row.original.customerMobile}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "sandType",
        header: "Sand Grade & Qty",
        size: 180,
        Cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-mono text-xs font-bold text-orange-600">
              {row.original.quantityMt} MT
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {row.original.sandType}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "sourceStockyardName",
        header: "Source Stockyard",
        size: 200,
        Cell: ({ row }) => (
          <span className="text-xs text-slate-800 dark:text-slate-200 truncate font-medium block">
            {row.original.sourceStockyardName}
          </span>
        ),
      },
      {
        accessorKey: "destinationAddress",
        header: "Destination Site",
        size: 220,
        Cell: ({ row }) => (
          <span
            className="text-xs text-slate-700 dark:text-slate-300 truncate font-medium block"
            title={row.original.destinationAddress}
          >
            {row.original.destinationAddress}
          </span>
        ),
      },
      {
        accessorKey: "preferredDeliveryDate",
        header: "Delivery Date",
        size: 130,
        Cell: ({ row }) => (
          <span className="font-mono text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Calendar size={11} className="text-slate-400 shrink-0" />
            {row.original.preferredDeliveryDate}
          </span>
        ),
      },
      {
        accessorKey: "totalAmount",
        header: "Total Charges (₹)",
        size: 150,
        Cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
              {row.original.totalAmount.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500">Includes GST & Royalty</span>
          </div>
        ),
      },
      {
        accessorKey: "paymentStatus",
        header: "Payment",
        size: 140,
        Cell: ({ row }) => (
          <Badge variant={payVariant[row.original.paymentStatus] || "secondary"}>
            {row.original.paymentStatus}
          </Badge>
        ),
      },
      {
        accessorKey: "bookingStatus",
        header: "Booking Status",
        size: 150,
        Cell: ({ row }) => (
          <Badge variant={bookingVariant[row.original.bookingStatus] || "secondary"}>
            {row.original.bookingStatus}
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
            Online Sand Booking Orders
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Citizen, builder and contractor online sand purchase requisitions, statutory tariff calculations, and payment tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={<Download size={14} />}
            onClick={() => exportToExcel(exportCols, bookings, "SMMS_Sand_Bookings")}
          >
            Export Excel
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon={<Printer size={14} />}
            onClick={() => exportToPDF(exportCols, bookings, "SMMS_Sand_Bookings", "State Online Sand Bookings")}
          >
            Export PDF
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon={<Cpu size={14} className="text-emerald-600" />}
            className="border-emerald-500/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 font-bold"
            onClick={() => navigate(routes.automaticAllocation.path)}
          >
            Auto Allocation (FIFO)
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={<Plus size={14} />}
            onClick={() => navigate(routes.createBooking.path)}
          >
            New Sand Booking
          </Button>
        </div>
      </div>

      {/* ── Top KPI Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Orders</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats.totalOrders}{" "}
              <span className="text-sm font-semibold text-slate-500">({stats.totalTonnage} MT)</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Active Sand Allocations</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <ShoppingCart size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Settled & Paid</p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {stats.paidCount}{" "}
              <span className="text-sm font-semibold text-slate-500">Orders</span>
            </h3>
            <p className="text-[11px] text-emerald-600 mt-0.5">₹ {stats.grossRevenue.toLocaleString()}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Awaiting Payment</p>
            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {stats.pendingPaymentCount}{" "}
              <span className="text-sm font-semibold text-slate-500">Pending</span>
            </h3>
            <p className="text-[11px] text-amber-600 mt-0.5">Payment Gateway Action</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stockyard Coverage</p>
            <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
              {stockyards.length}{" "}
              <span className="text-sm font-semibold text-slate-500">Depots</span>
            </h3>
            <p className="text-[11px] text-blue-600 mt-0.5">Integrated Live Balance</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Warehouse size={22} />
          </div>
        </div>
      </div>

      {/* ── Main Ledger Table ── */}
      <Card
        title="Statewide Sand Order & Reservation Ledger"
        icon={FileText}
        action={
          <Button
            size="sm"
            variant="outline"
            icon={<RotateCcw size={13} />}
            onClick={() => showSuccess("Sand booking ledger re-synchronized.")}
          >
            Refresh
          </Button>
        }
      >
        <ReusableTable
          columns={columns}
          data={bookings}
          exportFileName="SMMS_Sand_Bookings"
          onExportExcel={(rows) => exportToExcel(exportCols, rows, "SMMS_Sand_Bookings")}
          onExportPDF={(rows) => exportToPDF(exportCols, rows, "SMMS_Sand_Bookings", "Sand Booking Orders")}
          enableRowActions
          renderRowActions={({ row }) => {
            const isPaymentPending = row.original.paymentStatus === "Payment Pending";
            const isPaid = row.original.paymentStatus === "Paid";
            const isDispatched = row.original.bookingStatus === "Dispatched";
            const isVehicleAssigned = row.original.bookingStatus === "Vehicle Assigned";
            const isDelivered = row.original.bookingStatus === "Delivered";
            const canAuthorizeDispatch = isPaid && !isDispatched && !isDelivered;
            const canTrackGps = isDispatched || isVehicleAssigned;
            const canViewPod = isDispatched || isDelivered;

            return (
              <div className="flex items-center gap-1">
                {/* 1. View Order Details (Always Enabled) */}
                <button
                  title="View Full Booking Breakdown & Tariff"
                  onClick={() => {
                    setSelectedBooking(row.original);
                    setIsDetailModalOpen(true);
                  }}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-slate-600 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/50 transition-colors"
                >
                  <Eye size={14} />
                </button>

                {/* 2. Process Payment (Enabled if Pending, Disabled if Paid) */}
                <button
                  title={
                    isPaymentPending
                      ? "Process Statutory Payment / Proceed to Gateway"
                      : "Payment Already Settled & Confirmed"
                  }
                  disabled={!isPaymentPending}
                  onClick={() => navigate("/process-payment")}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    isPaymentPending
                      ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                      : "text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-40"
                  }`}
                >
                  <CreditCard size={14} />
                </button>

                {/* 2.5 Auto Vehicle Allocation (FIFO - TSMIV) */}
                {isPaid && !isVehicleAssigned && !isDispatched && !isDelivered && (
                  <button
                    title="Auto-Allocate Vehicle via FIFO Queue (TSMIV Model)"
                    onClick={() => navigate(routes.automaticAllocation.path)}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                  >
                    <Cpu size={14} />
                  </button>
                )}

                {/* 3. Authorize Dispatch (Enabled if Paid & not dispatched, Disabled otherwise) */}
                <button
                  title={
                    canAuthorizeDispatch
                      ? "Authorize Dispatch & Assign Vehicle"
                      : isDispatched
                      ? "Consignment already authorized & dispatched"
                      : isDelivered
                      ? "Consignment delivered and closed"
                      : "Requires paid order before dispatch authorization"
                  }
                  disabled={!canAuthorizeDispatch}
                  onClick={() => navigate(routes.authorizeDispatch.path)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    canAuthorizeDispatch
                      ? "text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/50"
                      : "text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-40"
                  }`}
                >
                  <Truck size={14} />
                </button>

                {/* 4. Live GPS / Telematics Tracking (Enabled if Dispatched, Disabled otherwise) */}
                <button
                  title={
                    canTrackGps
                      ? "Track Live Vehicle GPS & Geofence Corridor"
                      : "GPS Tracking available once vehicle is dispatched"
                  }
                  disabled={!canTrackGps}
                  onClick={() => navigate(routes.gpsTracking.path)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    canTrackGps
                      ? "text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                      : "text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-40"
                  }`}
                >
                  <MapPin size={14} />
                </button>

                {/* 5. Print Booking Requisition Slip (Always Enabled) */}
                <button
                  title="Print Form V Booking Requisition Slip"
                  onClick={() => {
                    setSelectedBooking(row.original);
                    setIsChallanModalOpen(true);
                  }}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-slate-600 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors"
                >
                  <Printer size={14} />
                </button>

                {/* 6. Proof of Delivery / Handover (Enabled if Dispatched or Delivered) */}
                <button
                  title={
                    canViewPod
                      ? isDelivered
                        ? "View Certified Proof of Delivery (POD)"
                        : "Confirm Customer Proof of Delivery (POD)"
                      : "POD available once consignment is dispatched"
                  }
                  disabled={!canViewPod}
                  onClick={() => navigate(routes.deliveryConfirmation.path)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    canViewPod
                      ? isDelivered
                        ? "text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/50"
                        : "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50"
                      : "text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-40"
                  }`}
                >
                  <ShieldCheck size={14} />
                </button>
              </div>
            );
          }}
        />
      </Card>

      {/* ── Order Details Modal ── */}
      {selectedBooking && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Sand Booking Order Dossier – ${selectedBooking.orderId}`}
          subtitle="Complete itemized statutory tariff, consumer information, and fulfillment status"
          size="lg"
          footer={
            <ModalFooter
              onClose={() => setIsDetailModalOpen(false)}
              onConfirm={() => {
                setIsDetailModalOpen(false);
                setIsChallanModalOpen(true);
              }}
              confirmText="Print Order Slip"
              confirmIcon={<Printer size={14} />}
            />
          }
        >
          <div className="space-y-4 pt-1 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-slate-500 block">Order ID</span>
                <span className="font-mono font-bold text-orange-600 text-sm">{selectedBooking.orderId}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Customer Name</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedBooking.customerName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Customer Mobile</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedBooking.customerMobile}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Purpose & Category</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">
                  {selectedBooking.purpose || selectedBooking.customerType}
                </span>
              </div>
            </div>

            {/* Consignment & Logistics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-slate-500 block">Sand Mineral Grade</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedBooking.sandType}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Allotted Quantity</span>
                <span className="font-mono font-bold text-orange-600">
                  {selectedBooking.quantityInUnit ? `${selectedBooking.quantityInUnit} ${selectedBooking.unit || "MT"}` : `${selectedBooking.quantityMt} MT`}
                  {selectedBooking.unit === "Cubic Meter" && ` (${selectedBooking.quantityMt} MT)`}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Origin Stockyard</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">
                  {selectedBooking.sourceStockyardName}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Transport Mode</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">
                  {selectedBooking.transportMode || selectedBooking.transportOption}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Preferred Schedule</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                  {selectedBooking.preferredDeliveryDate} {selectedBooking.preferredDeliveryTime && `(${selectedBooking.preferredDeliveryTime.split(" ")[0]})`}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-3">
                <span className="text-slate-500 block">Delivery Site & Landmark</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {selectedBooking.destinationAddress}
                  {selectedBooking.deliveryLocation && ` (Landmark: ${selectedBooking.deliveryLocation})`}
                </span>
              </div>
            </div>

            {/* Telangana Automated Tariff Formula & Breakdown */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <div className="p-2.5 bg-slate-100 dark:bg-slate-800 font-bold flex justify-between items-center text-xs">
                <span>Statutory Tariff Breakdown (Telangana Sand Bazaar Model)</span>
                <span className="font-mono text-primary font-bold">₹ {selectedBooking.totalAmount.toLocaleString()}</span>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-slate-800 text-xs p-1">
                <div className="p-2 flex justify-between">
                  <span>1. Base Sand Amount ({selectedBooking.quantityMt} MT @ ₹{selectedBooking.basePricePerMt || 475}/MT)</span>
                  <span className="font-mono font-semibold">₹ {selectedBooking.sandAmount.toLocaleString()}</span>
                </div>
                <div className="p-2 flex justify-between">
                  <span>2. Transport & Haulage Freight ({selectedBooking.transportMode || selectedBooking.transportOption})</span>
                  <span className="font-mono font-semibold">₹ {selectedBooking.transportCharges.toLocaleString()}</span>
                </div>
                <div className="p-2 flex justify-between">
                  <span>3. Statutory Royalty (₹85/MT) & DMF Cess (₹17/MT) + Env Surcharge (₹15/MT)</span>
                  <span className="font-mono font-semibold">
                    ₹ {(selectedBooking.royaltyAmount + selectedBooking.dmfCess + (selectedBooking.envSurcharge || Math.round(15 * selectedBooking.quantityMt))).toLocaleString()}
                  </span>
                </div>
                <div className="p-2 flex justify-between">
                  <span>4. Goods & Services Tax (GST 5%)</span>
                  <span className="font-mono font-semibold">₹ {selectedBooking.gstAmount.toLocaleString()}</span>
                </div>
                <div className="p-2.5 bg-orange-50 dark:bg-orange-950/40 font-bold flex justify-between text-sm">
                  <span>Total Payable Amount</span>
                  <span className="font-mono text-orange-700 dark:text-orange-300 font-black">
                    ₹ {selectedBooking.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Printable Order Challan Modal ── */}
      {selectedBooking && (
        <Modal
          isOpen={isChallanModalOpen}
          onClose={() => setIsChallanModalOpen(false)}
          title="Print Sand Booking Requisition Slip"
          size="lg"
          footer={
            <ModalFooter
              onClose={() => setIsChallanModalOpen(false)}
              onConfirm={() => window.print()}
              confirmText="Print Challan Slip"
              confirmIcon={<Printer size={14} />}
            />
          }
        >
          <div className="bg-white text-slate-900 p-6 rounded-2xl border border-slate-300 space-y-4 font-sans text-xs">
            <div className="flex justify-between border-b-2 border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-500 block">
                  GOVERNMENT OF CHHATTISGARH
                </span>
                <h2 className="text-base font-black text-slate-900">
                  DIRECTORATE OF GEOLOGY & MINING
                </h2>
                <p className="text-xs font-semibold text-orange-600">
                  Sand Mining Management System (CG-SMMS) • Form V (Booking Requisition)
                </p>
              </div>
              <div className="text-right">
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-900 text-white rounded">
                  OFFICIAL REQUISITION
                </span>
                <p className="font-mono text-xs font-bold mt-1">Order #: {selectedBooking.orderId}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Customer & Delivery</p>
                <div className="flex justify-between"><span>Name:</span><span className="font-bold">{selectedBooking.customerName}</span></div>
                <div className="flex justify-between"><span>Mobile:</span><span className="font-mono">{selectedBooking.customerMobile}</span></div>
                <div className="flex justify-between"><span>Site:</span><span className="font-medium">{selectedBooking.destinationAddress}</span></div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Mineral Allotment</p>
                <div className="flex justify-between"><span>Grade:</span><span className="font-bold">{selectedBooking.sandType}</span></div>
                <div className="flex justify-between"><span>Tonnage:</span><span className="font-mono font-bold text-orange-600">{selectedBooking.quantityMt} MT</span></div>
                <div className="flex justify-between"><span>Depot:</span><span className="font-medium">{selectedBooking.sourceStockyardName}</span></div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <div className="flex justify-between font-bold text-sm">
                <span>Total Amount Payable:</span>
                <span className="font-mono text-purple-700">₹ {selectedBooking.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment Status:</span>
                <span className="font-bold text-emerald-700 uppercase">{selectedBooking.paymentStatus}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SandBookingList;
