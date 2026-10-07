import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Package,
  ArrowLeft,
  Truck,
  QrCode,
  Download,
  KeyRound,
  CheckCircle2,
  Clock,
  MapPin,
  Search,
  Receipt,
  MessageSquare,
  HelpCircle,
  Building2,
  CreditCard,
  Plus,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Send,
  LogOut,
  Sparkles,
  Phone,
  Calendar,
} from "lucide-react";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import Button from "@/shared/components/ui/Button";
import Badge from "@/shared/components/ui/Badge";
import Modal, { ModalFooter } from "@/shared/components/ui/Modal/Modal";
import { useStatusModal } from "@/config/theme/StatusModalContext";
import { routes } from "@/app/routes/routeConfig";
import { inputBase, inputNormal } from "@/shared/components/ui/Forms/inputStyles";
import { clearAuth } from "@/features/auth/slice/authSlice";
import { IMAGES } from "@/assets/images/images";
import DigitalTransitPassModal from "@/features/dispatch-management/components/DigitalTransitPassModal";
import { toTransitPassRecord } from "@/features/dispatch-management/service/transitPassService";
import CustomerConsignmentTracker from "@/features/gps-tracking/components/CustomerConsignmentTracker";
import { TelematicsDataService } from "@/features/gps-tracking/services/telematicsMockService";
import { OrderStatusBadge, normalizeOrderStatus } from "@/features/order-lifecycle";

export const CitizenMyOrders: React.FC = () => {
  const { bookings, epasses, deliveries, createBooking, createGrievance } = useSandMining() as any;
  const { showSuccess, showError } = useStatusModal();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Active Hub Tab
  const [activeTab, setActiveTab] = useState<
    "orders" | "availability" | "tracking" | "stockyards" | "grievance" | "faqs"
  >("orders");

  // Filter state for My Orders
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals state
  const [selectedEPass, setSelectedEPass] = useState<any | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState<any | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // New Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingSandType, setBookingSandType] = useState("Coarse River Sand");
  const [bookingQty, setBookingQty] = useState(25);
  const [bookingStockyard, setBookingStockyard] = useState("Raipur Central Sand Stockyard");
  const [bookingAddress, setBookingAddress] = useState("Plot 14-B, Sector 7, Nava Raipur, Chhattisgarh - 492001");
  const [paymentMethod, setPaymentMethod] = useState("UPI / QR Code");

  // Pay Now Modal State
  const [payingBooking, setPayingBooking] = useState<any | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  // Availability Inquiry State
  const [calcDistrict, setCalcDistrict] = useState("Raipur");
  const [calcSandType, setCalcSandType] = useState("Coarse River Sand");
  const [calcQty, setCalcQty] = useState(25);

  // Quick Grievance State
  const [grievanceOrderRef, setGrievanceOrderRef] = useState("ORD-CG-2026-8801");
  const [grievanceCategory, setGrievanceCategory] = useState("Transit Delay");
  const [grievanceDesc, setGrievanceDesc] = useState("");

  // Rate calculations
  const baseRatePerMt = calcSandType === "Coarse River Sand" ? 420 : calcSandType === "Fine Plastering Sand" ? 480 : 390;
  const royaltyPerMt = 120;
  const deliveryPerMt = 160;
  const totalRatePerMt = baseRatePerMt + royaltyPerMt + deliveryPerMt;
  const totalEstimateInr = totalRatePerMt * calcQty * 1.05; // 5% GST

  // Booking calculations
  const newBookingBaseRate = bookingSandType === "Coarse River Sand" ? 420 : bookingSandType === "Fine Plastering Sand" ? 480 : 390;
  const newBookingTotalPerMt = newBookingBaseRate + royaltyPerMt + deliveryPerMt;
  const newBookingTotalAmount = Math.round(newBookingTotalPerMt * bookingQty * 1.05);

  const handleSignOut = () => {
    localStorage.removeItem("smms_user_role");
    dispatch(clearAuth());
    navigate(routes.login.path, { replace: true });
  };

  const handleCreateNewBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (bookingQty > 50) {
      showError("Maximum permissible quota per household construction is 50 Metric Tons (MT).");
      return;
    }

    const orderNumber = `ORD-CG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBookingObj = {
      id: `BK-${Date.now().toString().slice(-4)}`,
      orderId: orderNumber,
      customerName: "Rameshwar Sahu",
      customerMobile: "+91 98271 88401",
      customerType: "Individual Citizen",
      sandType: bookingSandType,
      quantityMt: bookingQty,
      sourceStockyardName: bookingStockyard,
      destinationAddress: bookingAddress,
      totalAmount: newBookingTotalAmount,
      paymentStatus: "Paid Online",
      bookingStatus: "Paid",
      assignedVehicleNumber: "CG 04 HA 4321",
      createdAt: new Date().toISOString().split("T")[0],
    };

    if (createBooking) {
      createBooking(newBookingObj);
    }

    setIsBookingModalOpen(false);
    showSuccess(`Order #${orderNumber} successfully booked and paid via ${paymentMethod}! Your digital e-Pass is being generated.`);
    setActiveTab("orders");
  };

  const handlePayNowSubmit = () => {
    if (payingBooking) {
      showSuccess(`Payment of ₹${payingBooking.totalAmount.toLocaleString()} completed successfully for Order #${payingBooking.orderId}!`);
      setIsPayModalOpen(false);
      setPayingBooking(null);
    }
  };

  const handleRaiseGrievanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grievanceDesc.trim()) {
      showError("Please describe your complaint or issue.");
      return;
    }

    if (createGrievance) {
      createGrievance({
        ticketId: `GRV-CIT-${Date.now().toString().slice(-4)}`,
        citizenName: "Rameshwar Sahu",
        mobile: "+91 98271 88401",
        category: grievanceCategory,
        relatedOrderRef: grievanceOrderRef,
        description: grievanceDesc,
        status: "Open",
        priority: "High",
        createdAt: new Date().toLocaleDateString("en-GB"),
      });
    }

    showSuccess(`Grievance ticket registered for Order #${grievanceOrderRef}. An enforcement desk officer has been assigned!`);
    setGrievanceDesc("");
  };

  const filteredBookings = bookings.filter((b: any) => {
    if (statusFilter === "ALL") return true;
    const isClosed = b.bookingStatus === "Delivered" || b.bookingStatus === "Order Closed";
    if (statusFilter === "ACTIVE") return !isClosed;
    if (statusFilter === "DELIVERED") return isClosed;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* ── State Government Official Top Banner ─────────────────── */}
      <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-4 sm:px-8 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <img
            src={IMAGES.CHHATTISGARH_LOGO}
            alt="State Emblem of Chhattisgarh"
            className="h-10 w-10 sm:h-11 sm:w-11 object-contain drop-shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">
                Department of Mines & Geology
              </span>
              <span className="bg-[#c2410c]/10 text-[#c2410c] text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-[#c2410c]/20 uppercase">
                Citizen Portal
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">
              Government of Chhattisgarh • Sand Mining Management System (CG-SMMS)
            </p>
          </div>
        </div>

        {/* User Badge & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Rameshwar Sahu</span>
            <span className="text-[10px] text-emerald-600 font-bold">Verified Citizen (Aadhaar KYC)</span>
          </div>

          <Button
            size="sm"
            variant="outline"
            icon={<LogOut size={14} />}
            onClick={handleSignOut}
            className="border-slate-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 text-xs cursor-pointer"
          >
            Sign Out
          </Button>
        </div>
      </header>

      {/* ── Main Container ───────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-5">
        {/* ── Top Header Card with Actions ───────────────────────── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Public Facing View • Screen 26
              </span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Direct Public Booking, Transparency & GPS Telematics
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Citizen Sand Dashboard & Consignment Hub
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Authorized Quota Limit: <span className="font-bold text-slate-800 dark:text-slate-200">50.0 MT</span> • Available Balance: <span className="font-black text-emerald-600">25.0 MT</span> • Rate Benchmark: <span className="font-semibold text-slate-700 dark:text-slate-300">₹ 420/MT</span>
            </p>
          </div>

          {/* Direct Action Buttons: Book | Pay | Track | Download | Raise Complaint */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="primary"
              icon={<Plus size={15} />}
              onClick={() => setIsBookingModalOpen(true)}
              className="bg-gradient-to-r from-[#b44607] to-[#c2410c] hover:from-[#9a3412] hover:to-[#b44607] text-white font-bold shadow-sm"
            >
              New Booking
            </Button>

            <Button
              size="sm"
              variant="outline"
              icon={<Truck size={14} />}
              onClick={() => setActiveTab("tracking")}
            >
              Track Vehicle
            </Button>

            <Button
              size="sm"
              variant="outline"
              icon={<Receipt size={14} />}
              onClick={() => {
                if (bookings.length > 0) {
                  setSelectedInvoiceBooking(bookings[0]);
                  setIsInvoiceModalOpen(true);
                }
              }}
            >
              Download Receipt
            </Button>

            <Button
              size="sm"
              variant="outline"
              icon={<MessageSquare size={14} />}
              onClick={() => setActiveTab("grievance")}
            >
              Raise Complaint
            </Button>
          </div>
        </div>

        {/* ── Citizen Dashboard Overview KPI Cards ──────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs">
            <div className="flex justify-between items-center text-slate-500 mb-1 text-xs">
              <span className="font-semibold">Subsidized Quota Remaining</span>
              <ShieldCheck size={16} className="text-emerald-500" />
            </div>
            <div className="text-xl font-black text-emerald-600">25.0 MT</div>
            <div className="w-full bg-slate-100 dark:bg-gray-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: "50%" }} />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">50.0 MT Standard Household Quota</span>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs">
            <div className="flex justify-between items-center text-slate-500 mb-1 text-xs">
              <span className="font-semibold">My Consignments</span>
              <Package size={16} className="text-[#c2410c]" />
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{bookings.length} Bookings</div>
            <span className="text-[10px] text-emerald-600 font-semibold mt-2 block">100% Computerized e-Passes</span>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs">
            <div className="flex justify-between items-center text-slate-500 mb-1 text-xs">
              <span className="font-semibold">In-Transit Delivery</span>
              <Truck size={16} className="text-orange-500" />
            </div>
            <div className="text-xl font-black text-orange-600">1 Tipper Active</div>
            <span className="text-[10px] text-slate-400 mt-2 block font-mono">CG 04 HA 4321 (ETA: ~32 mins)</span>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs">
            <div className="flex justify-between items-center text-slate-500 mb-1 text-xs">
              <span className="font-semibold">Total Payments</span>
              <CreditCard size={16} className="text-blue-500" />
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              ₹ {bookings.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0).toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400 mt-2 block">Official GST Invoices Available</span>
          </div>
        </div>

        {/* ── Tab Navigation Bar ───────────────────────────────────── */}
        <div className="flex items-center gap-1.5 p-1.5 bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-x-auto select-none">
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === "orders"
              ? "bg-[#c2410c] text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-800"
              }`}
          >
            <Package size={14} />
            <span>My Orders ({bookings.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("availability")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === "availability"
              ? "bg-[#c2410c] text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-800"
              }`}
          >
            <Search size={14} />
            <span>Check Availability & Rates</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tracking")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === "tracking"
              ? "bg-[#c2410c] text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-800"
              }`}
          >
            <Truck size={14} />
            <span>Track Vehicle</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("stockyards")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === "stockyards"
              ? "bg-[#c2410c] text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-800"
              }`}
          >
            <Building2 size={14} />
            <span>Sand Bazaar & Stockyards</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("grievance")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === "grievance"
              ? "bg-[#c2410c] text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-800"
              }`}
          >
            <MessageSquare size={14} />
            <span>Grievance & Support</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("faqs")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ml-auto ${activeTab === "faqs"
              ? "bg-slate-800 text-white shadow-xs"
              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-800"
              }`}
          >
            <HelpCircle size={14} />
            <span>FAQs</span>
          </button>
        </div>

        {/* ── TAB 1: My Orders & Consignments ─────────────────────── */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            {/* Status Filter Bar */}
            <div className="flex items-center justify-between gap-3 bg-white dark:bg-gray-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Filter:</span>
                <button
                  type="button"
                  onClick={() => setStatusFilter("ALL")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${statusFilter === "ALL" ? "bg-[#c2410c] text-white" : "bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-slate-400"
                    }`}
                >
                  All Orders ({bookings.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("ACTIVE")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${statusFilter === "ACTIVE" ? "bg-amber-600 text-white" : "bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-slate-400"
                    }`}
                >
                  Active In-Transit
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("DELIVERED")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${statusFilter === "DELIVERED" ? "bg-emerald-600 text-white" : "bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-slate-400"
                    }`}
                >
                  Delivered Consignments
                </button>
              </div>

              <span className="text-[11px] text-slate-400 font-mono">Showing {filteredBookings.length} orders</span>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {filteredBookings.map((b: any) => {
                const pass = epasses.find((ep: any) => ep.bookingId === b.id);
                const del = deliveries.find((d: any) => d.bookingId === b.id);
                const isPaid = b.paymentStatus === "Paid" || b.paymentStatus === "Paid Online";

                return (
                  <div
                    key={b.id}
                    className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap border-b border-slate-200 dark:border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-base text-slate-900 dark:text-white">{b.orderId}</span>
                          <OrderStatusBadge status={b.bookingStatus} size="sm" />
                          <span className="text-xs font-medium text-slate-500">• {b.sandType} ({b.quantityMt} MT)</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Booked on: {b.createdAt} • Stockyard: <span className="font-semibold text-slate-700 dark:text-slate-300">{b.sourceStockyardName}</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-mono font-black text-orange-600 dark:text-orange-400">
                          ₹ {b.totalAmount.toLocaleString()}
                        </span>
                        <p className={`text-[11px] font-semibold flex items-center justify-end gap-1 ${isPaid ? "text-emerald-600" : "text-amber-600"}`}>
                          <CheckCircle2 size={12} /> {b.paymentStatus}
                        </p>
                      </div>
                    </div>

                    {/* ── Pickup & Vehicle Dispatch Details (Telangana TSMIV Model) ── */}
                    {b.assignedVehicleNumber && (
                      <div className="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 rounded-2xl border border-blue-200 dark:border-blue-800 space-y-2.5">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                            <Truck size={15} className="text-blue-600" />
                            Assigned Transport Carrier & Delivery Schedule
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                            Pickup Completed • En Route
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                          {/* Vehicle No */}
                          <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-blue-100 dark:border-blue-900/50">
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">Vehicle Number</span>
                            <span className="font-mono font-black text-slate-900 dark:text-white text-sm">
                              {b.assignedVehicleNumber}
                            </span>
                            <span className="text-[10px] text-slate-500 block">Tractor Carrier</span>
                          </div>

                          {/* Driver Info */}
                          <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-blue-100 dark:border-blue-900/50">
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">Driver Details</span>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {b.assignedDriverName || "Ramesh Sahu"}
                            </span>
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono font-semibold flex items-center gap-1">
                              <Phone size={10} /> +91 98261 77201
                            </span>
                          </div>

                          {/* Expected Delivery Info */}
                          <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-blue-100 dark:border-blue-900/50">
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">Expected Delivery (ETA)</span>
                            <span className="font-bold text-emerald-600 text-sm block flex items-center gap-1">
                              <Clock size={12} /> ~25 - 35 Mins
                            </span>
                            <span className="text-[10px] text-slate-500 block">Distance: ~14.2 km from Reach</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Stepper Pipeline Flow */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                      <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 size={16} className="mx-auto text-emerald-600 mb-1" />
                        <p className="font-bold text-emerald-800 dark:text-emerald-300">1. Booked & Paid</p>
                        <span className="text-[10px] text-slate-500">{b.quantityMt} MT Sand</span>
                      </div>

                      <div className={`p-2.5 rounded-xl border ${b.assignedVehicleNumber ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800" : "bg-slate-50 dark:bg-gray-800 border-slate-200 dark:border-slate-800"}`}>
                        <CheckCircle2 size={16} className={`mx-auto mb-1 ${b.assignedVehicleNumber ? "text-emerald-600" : "text-slate-400"}`} />
                        <p className="font-bold">2. Auto Allocation</p>
                        <span className="text-[10px] text-slate-500">{b.assignedVehicleNumber ? "FIFO Allocated" : "In Queue"}</span>
                      </div>

                      <div className={`p-2.5 rounded-xl border ${b.assignedVehicleNumber ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800" : "bg-slate-50 dark:bg-gray-800 border-slate-200 dark:border-slate-800"}`}>
                        <Truck size={16} className={`mx-auto mb-1 ${b.assignedVehicleNumber ? "text-emerald-600" : "text-slate-400"}`} />
                        <p className="font-bold">3. Reach Pickup</p>
                        <span className="text-[10px] text-slate-500">{b.assignedVehicleNumber ? "Pickup Completed" : "Pending Pickup"}</span>
                      </div>

                      <div className={`p-2.5 rounded-xl border ${b.bookingStatus === "Dispatched" || b.bookingStatus === "In Transit" || b.bookingStatus === "Delivered" ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800" : "bg-slate-50 dark:bg-gray-800 border-slate-200 dark:border-slate-800"}`}>
                        <QrCode size={16} className={`mx-auto mb-1 ${pass || b.assignedVehicleNumber ? "text-emerald-600" : "text-slate-400"}`} />
                        <p className="font-bold">4. In Transit</p>
                        <span className="text-[10px] text-slate-500">{pass ? pass.ePassNumber : "Active GPS Route"}</span>
                      </div>

                      <div className={`p-2.5 rounded-xl border ${b.bookingStatus === "Delivered" || b.bookingStatus === "Order Closed" ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800" : "bg-slate-50 dark:bg-gray-800 border-slate-200 dark:border-slate-800"}`}>
                        <CheckCircle2 size={16} className={`mx-auto mb-1 ${b.bookingStatus === "Delivered" || b.bookingStatus === "Order Closed" ? "text-emerald-600" : "text-slate-400"}`} />
                        <p className="font-bold">5. Delivered</p>
                        <span className="text-[10px] text-slate-500">{b.bookingStatus === "Delivered" || b.bookingStatus === "Order Closed" ? "Trip Closed" : "Pending OTP Verification"}</span>
                      </div>
                    </div>

                    {/* Delivery Handover OTP & Action Ribbon */}
                    <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
                      {b.bookingStatus !== "Delivered" && b.bookingStatus !== "Order Closed" ? (
                        <div className="flex items-center gap-2.5 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-2xl border border-amber-300 dark:border-amber-800">
                          <KeyRound size={22} className="text-amber-600 shrink-0" />
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 block">
                              Delivery Verification OTP (SMS Sent to {b.customerMobile || "+91 98271 88401"})
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xl font-black font-mono tracking-widest text-amber-900 dark:text-amber-200">
                                {del?.otpCode || "5821"}
                              </span>
                              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                                (Share with driver only upon unloading sand at destination)
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 size={14} /> Consignment successfully delivered and certified with OTP verification.
                        </p>
                      )}

                      <div className="flex items-center gap-2 flex-wrap">
                        {!isPaid && (
                          <Button
                            size="sm"
                            variant="primary"
                            icon={<CreditCard size={14} />}
                            onClick={() => {
                              setPayingBooking(b);
                              setIsPayModalOpen(true);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                          >
                            Pay Now
                          </Button>
                        )}

                        {pass && (
                          <Button
                            size="sm"
                            variant="outline"
                            icon={<QrCode size={14} />}
                            onClick={() => {
                              setSelectedEPass(pass);
                              setIsQrModalOpen(true);
                            }}
                          >
                            View Transit Pass
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          icon={<Receipt size={14} />}
                          onClick={() => {
                            setSelectedInvoiceBooking(b);
                            setIsInvoiceModalOpen(true);
                          }}
                        >
                          Download Receipt
                        </Button>

                        <Button
                          size="sm"
                          variant="primary"
                          icon={<Truck size={14} />}
                          onClick={() => setActiveTab("tracking")}
                        >
                          Track Vehicle
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB 2: Check Availability & Rates ────────────────────── */}
        {activeTab === "availability" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-6 bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs p-5 space-y-4">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Search size={18} className="text-[#c2410c]" />
                  Live Sand Availability & Price Calculator
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Official statutory price per Metric Ton (MT) under Chhattisgarh State Sand Policy
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Delivery District</label>
                  <select
                    value={calcDistrict}
                    onChange={(e) => setCalcDistrict(e.target.value)}
                    className={`${inputBase} ${inputNormal} font-semibold`}
                  >
                    <option value="Raipur">Raipur (Mahanadi River Basin)</option>
                    <option value="Durg">Durg (Shivnath Basin)</option>
                    <option value="Bilaspur">Bilaspur (Arpa Basin)</option>
                    <option value="Korba">Korba (Hasdeo Basin)</option>
                    <option value="Dhamtari">Dhamtari (Mahanadi Upper Reach)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Sand Variety</label>
                  <select
                    value={calcSandType}
                    onChange={(e) => setCalcSandType(e.target.value)}
                    className={`${inputBase} ${inputNormal} font-semibold`}
                  >
                    <option value="Coarse River Sand">Coarse River Sand (Concrete / Slab)</option>
                    <option value="Fine Plastering Sand">Fine Plastering Sand (Wall Finishing)</option>
                    <option value="Medium Concrete Sand">Medium Concrete Sand (Brick Masonry)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Required Quantity (MT)</label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={calcQty}
                    onChange={(e) => setCalcQty(Math.min(50, Math.max(5, parseInt(e.target.value) || 5)))}
                    className={`${inputBase} ${inputNormal} font-mono font-bold text-sm`}
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">Maximum quota per household construction: 50 MT</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl border border-orange-200 dark:border-orange-800 p-5 space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] border-b border-orange-200 dark:border-orange-800 pb-2">
                Government Transparent Price Breakdown
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Base Mineral Value ({calcQty} MT × ₹{baseRatePerMt}/MT):</span>
                  <span className="font-mono font-bold">₹ {(calcQty * baseRatePerMt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Statutory State Royalty & DMF ({calcQty} MT × ₹{royaltyPerMt}/MT):</span>
                  <span className="font-mono font-bold">₹ {(calcQty * royaltyPerMt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Standard Transit Freight to {calcDistrict}:</span>
                  <span className="font-mono font-bold">₹ {(calcQty * deliveryPerMt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-300">CGST + SGST (5%):</span>
                  <span className="font-mono font-bold">₹ {Math.round(calcQty * totalRatePerMt * 0.05).toLocaleString()}</span>
                </div>

                <div className="pt-3 border-t border-orange-200 dark:border-orange-800 flex justify-between items-center text-sm font-black">
                  <span className="text-slate-900 dark:text-white">Estimated All-Inclusive Total:</span>
                  <span className="text-[#c2410c] text-lg font-mono">₹ {Math.round(totalEstimateInr).toLocaleString()}</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                className="w-full bg-gradient-to-r from-[#b44607] to-[#c2410c] text-white font-bold"
                icon={<Plus size={15} />}
                onClick={() => {
                  setBookingSandType(calcSandType);
                  setBookingQty(calcQty);
                  setIsBookingModalOpen(true);
                }}
              >
                Proceed to Book this Load
              </Button>
            </div>
          </div>
        )}

        {/* ── TAB 3: Track Vehicle (Live Telematics & 5-Stage Customer Pipeline) ───────────────── */}
        {activeTab === "tracking" && (
          <div className="space-y-4">
            <CustomerConsignmentTracker
              vehicles={TelematicsDataService.getAllVehicles()}
            />
          </div>
        )}


        {/* ── TAB 4: Sand Bazaar & Stockyards ──────────────────────── */}
        {activeTab === "stockyards" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                id: "STK-RP-01",
                name: "Raipur Central Sand Stockyard",
                district: "Raipur",
                capacity: "45,000 MT",
                available: "18,400 MT",
                rate: "₹ 420/MT",
                manager: "S. K. Verma (+91 98270 11223)",
                status: "Operational",
              },
              {
                id: "STK-DG-02",
                name: "Durg Shivnath Basin Depot",
                district: "Durg",
                capacity: "35,000 MT",
                available: "12,200 MT",
                rate: "₹ 390/MT",
                manager: "P. R. Sharma (+91 98271 22334)",
                status: "Operational",
              },
              {
                id: "STK-BP-03",
                name: "Bilaspur North Quarry Depot",
                district: "Bilaspur",
                capacity: "30,000 MT",
                available: "9,800 MT",
                rate: "₹ 410/MT",
                manager: "A. K. Mishra (+91 98272 33445)",
                status: "Operational",
              },
            ].map((yard) => (
              <div
                key={yard.id}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs p-4 space-y-3 text-xs"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{yard.name}</h3>
                    <span className="text-[10px] text-[#c2410c] font-mono font-semibold">{yard.id} • {yard.district}</span>
                  </div>
                  <Badge variant="success">{yard.status}</Badge>
                </div>

                <div className="space-y-1 text-slate-600 dark:text-slate-300">
                  <p>Available Stock: <span className="font-bold text-emerald-600">{yard.available}</span> (of {yard.capacity})</p>
                  <p>Base Rate: <span className="font-bold text-slate-900 dark:text-white">{yard.rate}</span></p>
                  <p className="text-[11px] text-slate-400">Manager: {yard.manager}</p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setBookingStockyard(yard.name);
                    setIsBookingModalOpen(true);
                  }}
                >
                  Book from this Stockyard
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* ── TAB 5: Grievance & Support ──────────────────── */}
        {activeTab === "grievance" && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs p-5 space-y-4 max-w-2xl">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare size={18} className="text-[#c2410c]" />
                Citizen Grievance & Delivery Assistance Desk
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Submit complaints regarding transit delays, quality mismatch, or overcharging for immediate resolution
              </p>
            </div>

            <form onSubmit={handleRaiseGrievanceSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Related Order Reference #</label>
                <input
                  type="text"
                  value={grievanceOrderRef}
                  onChange={(e) => setGrievanceOrderRef(e.target.value)}
                  className={`${inputBase} ${inputNormal} font-mono uppercase font-bold`}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Complaint Category</label>
                <select
                  value={grievanceCategory}
                  onChange={(e) => setGrievanceCategory(e.target.value)}
                  className={`${inputBase} ${inputNormal} font-semibold`}
                >
                  <option value="Transit Delay">Transit Delay / Tipper Not Arrived</option>
                  <option value="Quality Mismatch">Sand Quality / Grain Size Mismatch</option>
                  <option value="Overcharging Claim">Driver Overcharging Dispute</option>
                  <option value="Payment Gateway">Payment Settlement Inconsistency</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Description & Incident Notes</label>
                <textarea
                  rows={3}
                  value={grievanceDesc}
                  onChange={(e) => setGrievanceDesc(e.target.value)}
                  placeholder="Describe your issue with date, time, and driver details..."
                  className={`${inputBase} ${inputNormal}`}
                  required
                />
              </div>

              <Button type="submit" variant="primary" size="sm" icon={<Send size={14} />} className="bg-[#c2410c] text-white">
                Submit Grievance Ticket
              </Button>
            </form>
          </div>
        )}

        {/* ── TAB 6: Frequently Asked Questions (FAQs) ─────────────── */}
        {activeTab === "faqs" && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs p-5 space-y-3 text-xs">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <HelpCircle size={18} className="text-[#c2410c]" />
              Frequently Asked Questions (FAQs)
            </h2>

            <div className="space-y-2">
              {[
                {
                  q: "What is the maximum sand quota an individual citizen can book?",
                  a: "Under the Chhattisgarh Minor Mineral Policy 2026, an individual citizen can book up to 50 Metric Tons (MT) per household construction project verified against their Aadhaar Virtual ID.",
                },
                {
                  q: "How do I verify the authenticity of the delivery tipper?",
                  a: "Every authorized tipper generates a digital e-Pass with a tamper-proof QR code. You can cross-examine the vehicle registration plate and driver name in the Live Vehicle Tracking tab.",
                },
                {
                  q: "What should I do upon sand delivery at my construction site?",
                  a: "Once the sand is offloaded at your plot, provide the 4-digit Delivery Handover OTP to the driver to formally certify the delivery and close the transit pass.",
                },
                {
                  q: "How can I download the official Tax Invoice & GST Receipt?",
                  a: "Click 'Download Receipt' next to your order in the My Orders tab to print or save the computerized government transit bill.",
                },
              ].map((faq, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <p className="font-bold text-slate-900 dark:text-white">{faq.q}</p>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── Modal 1: New Booking Modal ────────────────────────────── */}
      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        title="Book Sand Consignment"
        subtitle="Direct citizen allocation under Chhattisgarh State Sand Policy (Max 50 MT quota)"
        size="lg"
      >
        <form onSubmit={handleCreateNewBooking} className="space-y-4 text-xs bg-white dark:bg-gray-900 p-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Sand Variety</label>
              <select
                value={bookingSandType}
                onChange={(e) => setBookingSandType(e.target.value)}
                className={`${inputBase} ${inputNormal} font-semibold`}
              >
                <option value="Coarse River Sand">Coarse River Sand (₹420/MT)</option>
                <option value="Fine Plastering Sand">Fine Plastering Sand (₹480/MT)</option>
                <option value="Medium Concrete Sand">Medium Concrete Sand (₹390/MT)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Quantity in Metric Tons (MT)</label>
              <input
                type="number"
                min="5"
                max="50"
                value={bookingQty}
                onChange={(e) => setBookingQty(Math.min(50, Math.max(5, parseInt(e.target.value) || 5)))}
                className={`${inputBase} ${inputNormal} font-mono font-bold`}
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Permitted Quota Balance: 25 MT</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Source Stockyard Depot</label>
              <select
                value={bookingStockyard}
                onChange={(e) => setBookingStockyard(e.target.value)}
                className={`${inputBase} ${inputNormal} font-semibold`}
              >
                <option value="Raipur Central Sand Stockyard">Raipur Central Sand Stockyard</option>
                <option value="Durg Shivnath Basin Depot">Durg Shivnath Basin Depot</option>
                <option value="Bilaspur North Quarry Depot">Bilaspur North Quarry Depot</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className={`${inputBase} ${inputNormal} font-semibold`}
              >
                <option value="UPI / QR Code">UPI / QR Code (Instant Settlement)</option>
                <option value="Net Banking">Net Banking (Treasury Gateway)</option>
                <option value="Debit / Credit Card">Debit / Credit Card</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Delivery Destination Address</label>
            <input
              type="text"
              value={bookingAddress}
              onChange={(e) => setBookingAddress(e.target.value)}
              className={`${inputBase} ${inputNormal}`}
              required
            />
          </div>

          {/* Pricing Breakdown Summary */}
          <div className="bg-orange-50 dark:bg-orange-950/30 p-3 rounded-xl border border-orange-200 dark:border-orange-800 space-y-1.5 font-mono">
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Mineral Value ({bookingQty} MT × ₹{newBookingBaseRate}):</span>
              <span>₹ {(bookingQty * newBookingBaseRate).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Royalty + DMF + Freight ({bookingQty} MT × ₹280):</span>
              <span>₹ {(bookingQty * 280).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>GST (5%):</span>
              <span>₹ {Math.round(bookingQty * newBookingTotalPerMt * 0.05).toLocaleString()}</span>
            </div>
            <div className="pt-1.5 border-t border-orange-200 dark:border-orange-800 flex justify-between font-black text-sm text-slate-900 dark:text-white">
              <span>Total Payable Amount:</span>
              <span className="text-[#c2410c]">₹ {newBookingTotalAmount.toLocaleString()}</span>
            </div>
          </div>

          <ModalFooter
            onClose={() => setIsBookingModalOpen(false)}
            onConfirm={() => { }}
            confirmText="Pay & Confirm Booking"
            cancelText="Cancel"
          />
        </form>
      </Modal>

      {/* ── Modal 2: Pay Now Settlement Modal ──────────────────────── */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="Complete Sand Order Payment"
        subtitle={payingBooking ? `Order ${payingBooking.orderId} • ₹${payingBooking.totalAmount.toLocaleString()}` : "Payment"}
        size="md"
        footer={
          <ModalFooter
            onClose={() => setIsPayModalOpen(false)}
            onConfirm={handlePayNowSubmit}
            confirmText="Authorize Payment"
            cancelText="Cancel"
          />
        }
      >
        {payingBooking && (
          <div className="space-y-3 text-xs bg-white dark:bg-gray-900 p-2 font-mono">
            <div className="p-3 bg-slate-50 dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Order ID:</span>
                <span className="font-bold text-[#c2410c]">{payingBooking.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Quantity & Sand:</span>
                <span className="font-bold">{payingBooking.quantityMt} MT ({payingBooking.sandType})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Payable:</span>
                <span className="font-bold text-slate-900 dark:text-white">₹ {payingBooking.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 space-y-1">
              <p className="font-bold">Government Secure Payment Gateway</p>
              <p className="text-[11px]">Instant settlement via SBI ePay / CG Treasury with immediate computer generated e-Pass.</p>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Modal 3: Official Digital Transit Pass / Waybill Modal ──────────────────────── */}
      <DigitalTransitPassModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        pass={selectedEPass ? toTransitPassRecord(selectedEPass) : null}
      />

      {/* ── Modal 4: Official Tax Invoice Modal ────────────────────── */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Official Sand Allotment & Royalty Tax Invoice"
        subtitle="Department of Mines and Geology • Government of Chhattisgarh"
        size="md"
        footer={<ModalFooter onClose={() => setIsInvoiceModalOpen(false)} onConfirm={() => window.print()} confirmText="Print Tax Invoice" cancelText="Close" />}
      >
        {selectedInvoiceBooking && (
          <div className="space-y-3 text-xs bg-white dark:bg-gray-900 p-2 font-mono">
            <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-2">
              <p className="font-black text-sm text-slate-900 dark:text-white">CHHATTISGARH STATE MINERAL DEVELOPMENT CORP.</p>
              <p className="text-[10px] text-slate-500">Sand Mining Management System (CG-SMMS)</p>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Invoice / Order #:</span>
                <span className="font-bold text-[#c2410c]">{selectedInvoiceBooking.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span>Citizen Name:</span>
                <span className="font-bold">{selectedInvoiceBooking.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Quantity:</span>
                <span className="font-bold">{selectedInvoiceBooking.quantityMt} MT ({selectedInvoiceBooking.sandType})</span>
              </div>
              <div className="flex justify-between">
                <span>Stockyard:</span>
                <span>{selectedInvoiceBooking.sourceStockyardName}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <span className="text-emerald-600 font-bold">{selectedInvoiceBooking.paymentStatus}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between font-black text-sm text-slate-900 dark:text-white">
              <span>Total Paid:</span>
              <span className="text-[#c2410c]">₹ {selectedInvoiceBooking.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CitizenMyOrders;
