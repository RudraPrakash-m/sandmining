import React, { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CreditCard,
  QrCode,
  Building,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  Lock,
  Download,
  Printer,
  FileText,
  Smartphone,
  Check,
  Clock,
  Sparkles,
  MapPin,
  Truck,
  ExternalLink,
  Copy,
  Receipt,
  RotateCcw,
} from "lucide-react";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import Card from "@/shared/components/layout/Card/Card";
import Button from "@/shared/components/ui/Button";
import Badge from "@/shared/components/ui/Badge";
import { useStatusModal } from "@/config/theme/StatusModalContext";
import { routes } from "@/app/routes/routeConfig";
import { exportToPDF } from "@/shared/utils/exportUtils";
import { inputBase, inputNormal } from "@/shared/components/ui/Forms/inputStyles";
import type { PaymentTransaction } from "@/features/shared-simulation/types";

export const ProcessPayment: React.FC = () => {
  const { bookings, payments, processPayment } = useSandMining();
  const { showSuccess, showError } = useStatusModal();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const targetBookingId = queryParams.get("bookingId");

  // Find targeted or latest pending booking
  const targetBooking = useMemo(() => {
    if (targetBookingId) {
      return (
        bookings.find((b) => b.id === targetBookingId || b.orderId === targetBookingId) ||
        bookings[0]
      );
    }
    return bookings.find((b) => b.paymentStatus === "Payment Pending") || bookings[0];
  }, [bookings, targetBookingId]);

  // Payment Form State
  const [paymentMode, setPaymentMode] = useState<
    "UPI / QR" | "Net Banking" | "Debit / Credit Card" | "Treasury Challan"
  >("UPI / QR");
  const [selectedBank, setSelectedBank] = useState("State Bank of India (SBI)");
  const [upiId, setUpiId] = useState("customer@oksbi");
  const [cardNumber, setCardNumber] = useState("4532 •••• •••• 8912");
  const [cardExpiry, setCardExpiry] = useState("08/29");
  const [cardCvv, setCardCvv] = useState("892");

  // Gateway Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [generatedTxn, setGeneratedTxn] = useState<PaymentTransaction | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [copiedTxnId, setCopiedTxnId] = useState(false);

  // Trigger Payment Processing
  const handlePayNow = () => {
    if (!targetBooking) {
      showError("No active booking order found for payment.");
      return;
    }

    setIsProcessing(true);

    // Simulate Payment Gateway Network Call (1.2 seconds)
    setTimeout(() => {
      const ok = processPayment(targetBooking.id, paymentMode);
      setIsProcessing(false);

      if (ok) {
        // Find newly created transaction in store or compute it
        const latestTxn = payments.find((p) => p.bookingId === targetBooking.id || p.orderId === targetBooking.orderId) || {
          id: `PAY-${Date.now()}`,
          transactionId: `TXN-${paymentMode.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-8)}`,
          bookingId: targetBooking.id,
          orderId: targetBooking.orderId,
          customerName: targetBooking.customerName,
          customerMobile: targetBooking.customerMobile,
          quantityMt: targetBooking.quantityMt,
          sandType: targetBooking.sandType,
          deliveryLocation: targetBooking.deliveryLocation || targetBooking.destinationAddress,
          destinationAddress: targetBooking.destinationAddress,
          bookingDateTime: new Date().toISOString().replace("T", " ").substring(0, 16),
          sandAmount: targetBooking.sandAmount,
          royalty: targetBooking.royaltyAmount,
          royaltyAmount: targetBooking.royaltyAmount,
          dmfCess: targetBooking.dmfCess,
          envSurcharge: targetBooking.envSurcharge || Math.round(15 * targetBooking.quantityMt),
          gstTax: targetBooking.gstAmount,
          gstAmount: targetBooking.gstAmount,
          transportCharges: targetBooking.transportCharges,
          totalAmount: targetBooking.totalAmount,
          paymentMode,
          paymentStatus: "Success",
          transactionTime: new Date().toISOString().replace("T", " ").substring(0, 16),
          paymentRefNumber: `PAY-REF-2026-${Math.floor(10000000 + Math.random() * 90000000)}`,
          bankSettlementRef: `SBI-REC-${Math.floor(1000000 + Math.random() * 9000000)}`,
          receiptNumber: `REC-SMMS-${Date.now().toString().slice(-6)}`,
          smsDispatched: true,
        };

        setGeneratedTxn(latestTxn);
        setPaymentCompleted(true);
        showSuccess(
          `Payment of ₹ ${targetBooking.totalAmount.toLocaleString()} Confirmed! SMS receipt sent to ${targetBooking.customerMobile}.`
        );
      } else {
        showError("Payment gateway processing failed. Please try another payment mode.");
      }
    }, 1200);
  };

  // Copy helper
  const handleCopy = (text: string, type: "order" | "txn") => {
    navigator.clipboard.writeText(text);
    if (type === "order") {
      setCopiedOrderId(true);
      setTimeout(() => setCopiedOrderId(false), 2000);
    } else {
      setCopiedTxnId(true);
      setTimeout(() => setCopiedTxnId(false), 2000);
    }
  };

  // Print Receipt handler
  const handlePrintReceipt = () => {
    window.print();
  };

  // Download PDF Receipt handler
  const handleDownloadPdf = () => {
    if (!targetBooking) return;
    const exportColumns = [
      { key: "item", header: "Particulars / Head", format: (v: any) => v },
      { key: "details", header: "Details", format: (v: any) => v },
      { key: "amount", header: "Amount (₹)", format: (v: any) => v },
    ];
    const exportData = [
      { item: "Order ID", details: targetBooking.orderId, amount: "-" },
      { item: "Customer Details", details: `${targetBooking.customerName} (${targetBooking.customerMobile})`, amount: "-" },
      { item: "Mineral Grade & Qty", details: `${targetBooking.quantityMt} MT (${targetBooking.sandType})`, amount: `₹ ${targetBooking.sandAmount.toLocaleString()}` },
      { item: "Transport & Logistics", details: targetBooking.transportOption || targetBooking.transportMode, amount: `₹ ${targetBooking.transportCharges.toLocaleString()}` },
      { item: "Statutory Royalty & Cess", details: "State Royalty (₹85/MT) + DMF (20%) + Env Cess", amount: `₹ ${(targetBooking.royaltyAmount + targetBooking.dmfCess + (targetBooking.envSurcharge || Math.round(15 * targetBooking.quantityMt))).toLocaleString()}` },
      { item: "Goods & Services Tax (GST 5%)", details: "CGST (2.5%) + SGST (2.5%)", amount: `₹ ${targetBooking.gstAmount.toLocaleString()}` },
      { item: "Total Paid Amount", details: `Paid via ${paymentMode} (Ref: ${generatedTxn?.paymentRefNumber || targetBooking.paymentRefNumber || "PAY-REF-2026-881920"})`, amount: `₹ ${targetBooking.totalAmount.toLocaleString()}` },
    ];
    exportToPDF(
      exportColumns,
      exportData,
      `SMMS_Payment_Receipt_${targetBooking.orderId}`,
      `Statutory Sand Mining Payment Receipt - ${targetBooking.orderId}`
    );
  };

  if (!targetBooking) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-gray-500 text-sm">No booking order pending payment.</p>
        <Button onClick={() => navigate(routes.createBooking.path)}>
          Create New Sand Booking
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200 pb-12">
      {/* ── Top Header Navigation ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            icon={<ArrowLeft size={15} />}
            onClick={() => navigate(routes.sandBooking.path)}
          >
            Back to Bookings
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Module 4: Payment Gateway
              </span>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {paymentCompleted ? "Booking Confirmed & Payment Receipt" : "Statutory Payment Gateway Checkout"}
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {paymentCompleted
                ? "Payment successfully reconciled with State Treasury. Booking confirmed & SMS receipt dispatched."
                : "Confirm Booking → Payment Gateway → Successful Payment → Order ID Generation"}
            </p>
          </div>
        </div>

        {paymentCompleted && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              icon={<Printer size={14} />}
              onClick={handlePrintReceipt}
            >
              Print Receipt
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={<Download size={14} />}
              onClick={handleDownloadPdf}
            >
              Download PDF Receipt
            </Button>
          </div>
        )}
      </div>

      {/* ── Status Lifecycle Tracker ─────────────────────────────────── */}
      <div className="p-3.5 bg-white dark:bg-gray-900 rounded-2xl border border-border-color shadow-2xs">
        <div className="flex items-center justify-between max-w-2xl mx-auto text-xs">
          {/* 1. Payment Pending */}
          <div className="flex items-center gap-2">
            <span
              className={`size-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                !paymentCompleted
                  ? "bg-amber-500 text-white ring-2 ring-amber-200"
                  : "bg-emerald-500 text-white"
              }`}
            >
              {paymentCompleted ? "✓" : "1"}
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Payment Pending</span>
          </div>

          <div className="h-0.5 w-12 sm:w-20 bg-slate-300 dark:bg-slate-700" />

          {/* 2. Payment Success */}
          <div className="flex items-center gap-2">
            <span
              className={`size-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                paymentCompleted
                  ? "bg-emerald-500 text-white ring-2 ring-emerald-200"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-500"
              }`}
            >
              {paymentCompleted ? "✓" : "2"}
            </span>
            <span
              className={`font-semibold ${
                paymentCompleted ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-500"
              }`}
            >
              Payment Success
            </span>
          </div>

          <div className="h-0.5 w-12 sm:w-20 bg-slate-300 dark:bg-slate-700" />

          {/* 3. Booking Confirmed */}
          <div className="flex items-center gap-2">
            <span
              className={`size-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                paymentCompleted
                  ? "bg-primary text-white shadow-xs ring-2 ring-orange-200"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-500"
              }`}
            >
              {paymentCompleted ? "✓" : "3"}
            </span>
            <span
              className={`font-semibold ${
                paymentCompleted ? "text-primary font-black" : "text-slate-500"
              }`}
            >
              Booking Confirmed
            </span>
          </div>
        </div>
      </div>

      {/* ── CASE A: PAYMENT COMPLETED SUCCESS & CONFIRMATION VIEW ──────── */}
      {paymentCompleted && (
        <div className="space-y-6 max-w-4xl mx-auto animate-in zoom-in-95 duration-200">
          
          {/* Top Success Hero Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs">
                  <CheckCircle2 size={30} />
                </div>
                <div>
                  <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10.5px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Status: Booking Confirmed
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold mt-1 tracking-tight text-slate-900 dark:text-white">
                    Payment Successful & Order Placed!
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Your river sand booking has been confirmed and registered in the Central State Sand Mining Ledger.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/70 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-right shrink-0">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Total Amount Paid</span>
                <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">₹ {targetBooking.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* ── Customer SMS Dispatched Notification Simulator ──────────── */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border-2 border-indigo-200 dark:border-indigo-800/70 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-bold text-xs">
                <Smartphone size={16} className="text-indigo-600 dark:text-indigo-400" />
                <span>Statutory SMS Confirmation Dispatched to Customer</span>
              </div>
              <Badge variant="primary" className="text-[10px] bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                SMS Delivered ✓
              </Badge>
            </div>

            <div className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-indigo-100 dark:border-indigo-900 font-mono text-xs text-slate-800 dark:text-slate-200 leading-relaxed shadow-2xs">
              <p>
                <strong>📱 [Govt of Chhattisgarh - SMMS]:</strong> Dear {targetBooking.customerName}, your sand booking (<strong>Order ID: {targetBooking.orderId}</strong>) for {targetBooking.quantityMt} MT {targetBooking.sandType} is <strong>CONFIRMED</strong>. Payment Ref: <strong>{generatedTxn?.paymentRefNumber || targetBooking.paymentRefNumber || "PAY-REF-2026-881920"}</strong> of ₹{targetBooking.totalAmount.toLocaleString()} received successfully via {paymentMode}. Allocation Depot: {targetBooking.sourceStockyardName}. Track delivery & download e-Pass at: <u>sandportal.cg.gov.in</u>
              </p>
            </div>
          </div>

          {/* ── Generated Booking Details Card (All Required Fields) ───── */}
          <Card title="Official Booking & Payment Details">
            <div className="space-y-4 pt-1 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-gray-800/60 rounded-2xl border border-border-color">
                {/* 1. Order ID */}
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">● Order ID</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono font-black text-sm text-primary">{targetBooking.orderId}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(targetBooking.orderId, "order")}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-gray-700 rounded text-slate-500"
                      title="Copy Order ID"
                    >
                      {copiedOrderId ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                {/* 2. Booking Date & Time */}
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">● Booking Date & Time</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white mt-0.5 block">
                    {targetBooking.createdAt || new Date().toISOString().replace("T", " ").substring(0, 16)}
                  </span>
                </div>

                {/* 3. Booking Status */}
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">● Booking Status</span>
                  <div className="mt-0.5">
                    <Badge variant="success" className="text-xs font-bold px-2.5 py-0.5">
                      ✓ Booking Confirmed
                    </Badge>
                  </div>
                </div>

                {/* 4. Customer Details */}
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">● Customer Details</span>
                  <span className="font-bold text-slate-900 dark:text-white block truncate">{targetBooking.customerName}</span>
                  <span className="font-mono text-slate-500">{targetBooking.customerMobile}</span>
                  <span className="text-[10px] text-primary block mt-0.5 font-semibold">{targetBooking.purpose || targetBooking.customerType}</span>
                </div>

                {/* 5. Sand Quantity & Type */}
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">● Sand Type & Quantity</span>
                  <span className="font-bold text-slate-900 dark:text-white block">{targetBooking.sandType}</span>
                  <span className="font-mono font-bold text-orange-600 text-sm block">
                    {targetBooking.quantityMt} MT {targetBooking.unit ? `(${targetBooking.quantityInUnit || targetBooking.quantityMt} ${targetBooking.unit})` : ""}
                  </span>
                </div>

                {/* 6. Payment Reference Number */}
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">● Payment Reference #</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 text-xs">
                      {generatedTxn?.paymentRefNumber || targetBooking.paymentRefNumber || "PAY-REF-2026-881920"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(generatedTxn?.paymentRefNumber || "PAY-REF-2026-881920", "txn")}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-gray-700 rounded text-slate-500"
                      title="Copy Reference"
                    >
                      {copiedTxnId ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block">Mode: {paymentMode}</span>
                </div>

                {/* 7. Delivery Location & Complete Address */}
                <div className="sm:col-span-2">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">● Delivery Location & Site Address</span>
                  <span className="font-medium text-slate-900 dark:text-white block">
                    {targetBooking.destinationAddress}
                  </span>
                  {targetBooking.deliveryLocation && (
                    <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                      <strong>Landmark:</strong> {targetBooking.deliveryLocation} ({targetBooking.destinationDistrict || "Raipur"})
                    </span>
                  )}
                </div>

                {/* 8. Amount Paid */}
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">● Amount Paid</span>
                  <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 block">
                    ₹ {targetBooking.totalAmount.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Payment Status: Success ✓</span>
                </div>
              </div>

              {/* Itemized Statutory Receipt Breakdown Table */}
              <div className="rounded-2xl border border-border-color overflow-hidden">
                <div className="p-3 bg-slate-100 dark:bg-gray-800 flex justify-between items-center font-bold">
                  <span className="flex items-center gap-1.5">
                    <Receipt size={14} className="text-primary" />
                    Statutory Payment Voucher & Receipt Breakdown
                  </span>
                  <span className="font-mono text-emerald-600">Settled to Treasury</span>
                </div>
                <table className="w-full text-xs text-left">
                  <tbody className="divide-y divide-border-color font-medium">
                    <tr className="bg-white dark:bg-gray-900">
                      <td className="p-3 text-slate-700 dark:text-slate-300">
                        1. Mineral Base Cost ({targetBooking.quantityMt} MT {targetBooking.sandType})
                      </td>
                      <td className="p-3 text-right font-mono font-semibold text-slate-900 dark:text-white">
                        ₹ {targetBooking.sandAmount.toLocaleString()}
                      </td>
                    </tr>
                    <tr className="bg-slate-50/50 dark:bg-gray-900/50">
                      <td className="p-3 text-slate-700 dark:text-slate-300">
                        2. Transport Freight ({targetBooking.transportOption || targetBooking.transportMode})
                      </td>
                      <td className="p-3 text-right font-mono font-semibold text-slate-900 dark:text-white">
                        ₹ {targetBooking.transportCharges.toLocaleString()}
                      </td>
                    </tr>
                    <tr className="bg-white dark:bg-gray-900">
                      <td className="p-3 text-slate-700 dark:text-slate-300">
                        3. Statutory State Royalty (₹85/MT) & District Mineral Foundation (DMF Cess 20%) + Env Surcharge
                      </td>
                      <td className="p-3 text-right font-mono font-semibold text-slate-900 dark:text-white">
                        ₹ {(targetBooking.royaltyAmount + targetBooking.dmfCess + (targetBooking.envSurcharge || Math.round(15 * targetBooking.quantityMt))).toLocaleString()}
                      </td>
                    </tr>
                    <tr className="bg-slate-50/50 dark:bg-gray-900/50">
                      <td className="p-3 text-slate-700 dark:text-slate-300">
                        4. Goods & Services Tax (GST 5%)
                      </td>
                      <td className="p-3 text-right font-mono font-semibold text-slate-900 dark:text-white">
                        ₹ {targetBooking.gstAmount.toLocaleString()}
                      </td>
                    </tr>
                    <tr className="bg-emerald-50 dark:bg-emerald-950/40 font-bold text-sm">
                      <td className="p-3.5 text-slate-900 dark:text-white">TOTAL AMOUNT PAID:</td>
                      <td className="p-3.5 text-right font-mono text-emerald-700 dark:text-emerald-300 font-black">
                        ₹ {targetBooking.totalAmount.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Action Buttons for Next Steps */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border-color">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => navigate(routes.citizenMyOrders.path)}
                >
                  Go to My Orders & Live e-Pass
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="md"
                    icon={<RotateCcw size={14} />}
                    onClick={() => navigate(routes.createBooking.path)}
                  >
                    Place Another Booking
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    icon={<Download size={15} />}
                    onClick={handleDownloadPdf}
                  >
                    Download Official Receipt (PDF)
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── CASE B: PAYMENT GATEWAY CHECKOUT VIEW ─────────────────────── */}
      {!paymentCompleted && (
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Columns: Payment Method Selection */}
          <div className="lg:col-span-2 space-y-4">
            <Card title="Select Payment Mode">
              <div className="space-y-3 pt-2 text-xs">
                
                {/* 1. Instant UPI / QR */}
                <label
                  onClick={() => setPaymentMode("UPI / QR")}
                  className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMode === "UPI / QR"
                      ? "bg-orange-50/70 dark:bg-orange-950/40 border-primary text-slate-900 dark:text-white shadow-xs"
                      : "bg-slate-50/50 dark:bg-gray-800/40 border-border-color hover:border-slate-400"
                  }`}
                >
                  <div className="p-2 rounded-xl bg-orange-500/10 text-primary shrink-0 mt-0.5">
                    <QrCode size={22} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-xs">Instant UPI & Dynamic QR Code (Fastest)</p>
                      <input
                        type="radio"
                        name="paymentMode"
                        checked={paymentMode === "UPI / QR"}
                        onChange={() => setPaymentMode("UPI / QR")}
                        className="text-primary focus:ring-primary accent-[#c2410c]"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Scan using Google Pay, PhonePe, Paytm, BHIM or any UPI 2.0 app with instant treasury verification.
                    </p>

                    {paymentMode === "UPI / QR" && (
                      <div className="mt-3 p-3 bg-white dark:bg-gray-900 rounded-xl border border-orange-200 dark:border-orange-800/60 flex items-center gap-3">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border text-[10px] font-mono font-bold text-center">
                          [DYNAMIC QR CODE]
                        </div>
                        <div className="flex-1 space-y-1">
                          <label className="block text-[10px] text-slate-500 font-bold">Virtual Payment Address (VPA)</label>
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="username@upi"
                            className={`${inputBase} ${inputNormal} font-mono`}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </label>

                {/* 2. Net Banking */}
                <label
                  onClick={() => setPaymentMode("Net Banking")}
                  className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMode === "Net Banking"
                      ? "bg-orange-50/70 dark:bg-orange-950/40 border-primary text-slate-900 dark:text-white shadow-xs"
                      : "bg-slate-50/50 dark:bg-gray-800/40 border-border-color hover:border-slate-400"
                  }`}
                >
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 shrink-0 mt-0.5">
                    <Building size={22} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-xs">Retail & Corporate Internet Banking</p>
                      <input
                        type="radio"
                        name="paymentMode"
                        checked={paymentMode === "Net Banking"}
                        onChange={() => setPaymentMode("Net Banking")}
                        className="text-primary focus:ring-primary accent-[#c2410c]"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Direct integration with SBI, HDFC, ICICI, PNB, Chhattisgarh Rajya Gramin Bank & 54 scheduled banks.
                    </p>

                    {paymentMode === "Net Banking" && (
                      <div className="mt-3">
                        <select
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className={`${inputBase} ${inputNormal} font-semibold`}
                        >
                          <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                          <option value="HDFC Bank">HDFC Bank</option>
                          <option value="ICICI Bank">ICICI Bank</option>
                          <option value="Punjab National Bank (PNB)">Punjab National Bank (PNB)</option>
                          <option value="Chhattisgarh Rajya Gramin Bank">Chhattisgarh Rajya Gramin Bank</option>
                          <option value="Bank of Baroda">Bank of Baroda</option>
                          <option value="Axis Bank">Axis Bank</option>
                        </select>
                      </div>
                    )}
                  </div>
                </label>

                {/* 3. Debit / Credit Card */}
                <label
                  onClick={() => setPaymentMode("Debit / Credit Card")}
                  className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMode === "Debit / Credit Card"
                      ? "bg-orange-50/70 dark:bg-orange-950/40 border-primary text-slate-900 dark:text-white shadow-xs"
                      : "bg-slate-50/50 dark:bg-gray-800/40 border-border-color hover:border-slate-400"
                  }`}
                >
                  <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 shrink-0 mt-0.5">
                    <CreditCard size={22} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-xs">Debit / Credit Card (RuPay / Visa / MasterCard)</p>
                      <input
                        type="radio"
                        name="paymentMode"
                        checked={paymentMode === "Debit / Credit Card"}
                        onChange={() => setPaymentMode("Debit / Credit Card")}
                        className="text-primary focus:ring-primary accent-[#c2410c]"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Zero surcharge on RuPay Debit Cards under Digital India Initiative.
                    </p>

                    {paymentMode === "Debit / Credit Card" && (
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <div className="col-span-3">
                          <label className="block text-[10px] text-slate-500 font-bold mb-1">Card Number</label>
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className={`${inputBase} ${inputNormal} font-mono`}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold mb-1">Expiry Date</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className={`${inputBase} ${inputNormal} font-mono text-center`}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold mb-1">CVV / CVC</label>
                          <input
                            type="password"
                            maxLength={3}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            className={`${inputBase} ${inputNormal} font-mono text-center`}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </label>

                {/* 4. Treasury e-Challan */}
                <label
                  onClick={() => setPaymentMode("Treasury Challan")}
                  className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMode === "Treasury Challan"
                      ? "bg-orange-50/70 dark:bg-orange-950/40 border-primary text-slate-900 dark:text-white shadow-xs"
                      : "bg-slate-50/50 dark:bg-gray-800/40 border-border-color hover:border-slate-400"
                  }`}
                >
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 shrink-0 mt-0.5">
                    <FileText size={22} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-xs">State Cyber Treasury e-Challan / NEFT / RTGS</p>
                      <input
                        type="radio"
                        name="paymentMode"
                        checked={paymentMode === "Treasury Challan"}
                        onChange={() => setPaymentMode("Treasury Challan")}
                        className="text-primary focus:ring-primary accent-[#c2410c]"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Generate official Head of Account 0853 e-Challan for bank counter remittance or treasury portal.
                    </p>
                  </div>
                </label>
              </div>
            </Card>

            {/* Pay Now Button */}
            <Button
              variant="primary"
              loading={isProcessing}
              onClick={handlePayNow}
              icon={<Lock size={16} />}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 text-sm shadow-md"
            >
              Authorize & Pay ₹ {targetBooking.totalAmount.toLocaleString()}
            </Button>
          </div>

          {/* Right 1 Column: Order Summary & Itemized Breakdown */}
          <div className="space-y-4">
            <Card title="Pre-Payment Order Summary">
              <div className="space-y-3.5 pt-1 text-xs">
                
                {/* Order Meta Header */}
                <div className="p-3 bg-slate-50 dark:bg-gray-800/60 rounded-xl space-y-2 border border-border-color">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Order ID:</span>
                    <span className="font-mono font-bold text-primary">{targetBooking.orderId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Customer:</span>
                    <span className="font-bold text-slate-900 dark:text-white truncate">{targetBooking.customerName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Mobile:</span>
                    <span className="font-mono">{targetBooking.customerMobile}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Purpose:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{targetBooking.purpose || targetBooking.customerType}</span>
                  </div>
                </div>

                {/* Material & Logistics */}
                <div className="space-y-2 py-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mineral Grade:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{targetBooking.sandType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tonnage:</span>
                    <span className="font-mono font-bold text-orange-600">{targetBooking.quantityMt} MT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Origin Depot:</span>
                    <span className="font-medium truncate max-w-[160px] text-right">{targetBooking.sourceStockyardName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Delivery Site:</span>
                    <span className="font-medium truncate max-w-[160px] text-right" title={targetBooking.destinationAddress}>
                      {targetBooking.destinationAddress}
                    </span>
                  </div>
                </div>

                {/* Telangana Pricing Itemized Breakdown */}
                <div className="space-y-1.5 pt-2 border-t border-border-color">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>1. Base Sand Material:</span>
                    <span className="font-mono">₹ {targetBooking.sandAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>2. Transport Freight:</span>
                    <span className="font-mono">₹ {targetBooking.transportCharges.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>3. State Royalty & DMF Cess:</span>
                    <span className="font-mono">
                      ₹ {(targetBooking.royaltyAmount + targetBooking.dmfCess + (targetBooking.envSurcharge || Math.round(15 * targetBooking.quantityMt))).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>4. Applicable GST (5%):</span>
                    <span className="font-mono">₹ {targetBooking.gstAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-emerald-600 pt-2 border-t border-border-color">
                    <span>TOTAL AMOUNT:</span>
                    <span className="font-mono">₹ {targetBooking.totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-[11px] text-emerald-800 dark:text-emerald-300">
                  <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                  <span>Integrated with State Mining Revenue Head & Treasury Escrow</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessPayment;
