import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Truck,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  Navigation,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  QrCode,
  DollarSign,
  Smartphone,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Layers,
  Phone,
  User,
  Scale,
  FileText,
  Radio,
  Send,
  RefreshCw,
  LogOut,
  Map,
  Compass,
  AlertTriangle,
  Award,
} from "lucide-react";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import type { SandBooking, Vehicle, AllocationRecord } from "@/features/shared-simulation/types";
import Card from "@/shared/components/layout/Card/Card";
import Button from "@/shared/components/ui/Button";
import Badge from "@/shared/components/ui/Badge";
import Modal, { ModalFooter } from "@/shared/components/ui/Modal/Modal";
import { routes } from "@/app/routes/routeConfig";
import { CustomerLocationDeliveryModule } from "@/features/delivery-confirmation";
import { normalizeOrderStatus, OrderStatusBadge } from "@/features/order-lifecycle";

export const DriverDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    vehicles,
    bookings,
    allocations,
    driverAcceptOrder,
    driverRejectOrder,
    driverStartPickup,
    driverConfirmStockyardLoad,
    driverStartTransit,
    driverDeliverAndVerifyOtp,
    setActiveRole,
  } = useSandMining();

  // Active Driver / Vehicle Selection
  const [selectedVehicleNum, setSelectedVehicleNum] = useState<string>("CG-04-TX-2341");

  // Modals & Action States
  const [selectedBookingForAction, setSelectedBookingForAction] = useState<SandBooking | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [isNavigateModalOpen, setIsNavigateModalOpen] = useState<boolean>(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState<boolean>(false);
  const [isEPassModalOpen, setIsEPassModalOpen] = useState<boolean>(false);

  // Form inputs
  const [rejectionReason, setRejectionReason] = useState<string>("Vehicle Maintenance Required");
  const [customRejectionText, setCustomRejectionText] = useState<string>("");
  const [customerOtpInput, setCustomerOtpInput] = useState<string>("");
  const [otpError, setOtpError] = useState<string>("");
  const [tripSuccessNotice, setTripSuccessNotice] = useState<string>("");
  const [rejectionAlertNotice, setRejectionAlertNotice] = useState<string>("");

  // Navigation simulation steps (Stockyard vs Customer)
  const [navTarget, setNavTarget] = useState<"stockyard" | "customer">("stockyard");

  // Current selected vehicle
  const currentVehicle: Vehicle = useMemo(() => {
    return (
      vehicles.find((v) => v.vehicleNumber === selectedVehicleNum) ||
      vehicles[0] || {
        id: "VEH-001",
        vehicleNumber: "CG-04-TX-2341",
        ownerName: "Chhattisgarh Logistics Transport",
        driverName: "Venkat Sahu",
        mobile: "+91 98261 22341",
        vehicleType: "2-Axle Tipper (10 MT)",
        capacityMt: 10,
        rcNumber: "RC-CG04-2022-8819",
        fitnessValidityDate: "2027-04-30",
        insuranceValidityDate: "2027-02-15",
        gpsDeviceId: "TELTONIKA-FMB920-88190",
        fastagRfidRef: "NPCI-FT-9921004123",
        status: "Verified",
        isBlacklisted: false,
        assignedDistrict: "Raipur",
        assignedArea: "Mandir Hasaud / Mahanadi Sector",
        queueStatus: "Available / In Queue",
        queuePosition: 1,
        totalTripsCompleted: 48,
      }
    );
  }, [vehicles, selectedVehicleNum]);

  // Bookings associated with this vehicle or driver
  const vehicleBookings = useMemo(() => {
    return bookings.filter(
      (b) =>
        b.assignedVehicleNumber === currentVehicle.vehicleNumber ||
        b.assignedDriverName === currentVehicle.driverName ||
        (b.driverRejectionReason && b.driverRejectionReason.includes(currentVehicle.vehicleNumber))
    );
  }, [bookings, currentVehicle]);

  // Active / Current trip order
  const activeOrder = useMemo(() => {
    return (
      bookings.find((b) => {
        if (b.assignedVehicleNumber !== currentVehicle.vehicleNumber) return false;
        const s = normalizeOrderStatus(b.bookingStatus);
        return (
          s === "Vehicle Allocated" ||
          s === "Driver Accepted" ||
          s === "Pickup Pending" ||
          s === "Vehicle at Sand Reach" ||
          s === "Loading in Progress" ||
          s === "Loaded / Pickup Completed" ||
          s === "Transit Pass Generated" ||
          s === "In Transit" ||
          s === "Reached Delivery Location" ||
          s === "OTP Verification" ||
          s === "Delivered"
        );
      }) || null
    );
  }, [bookings, currentVehicle]);

  // Metric KPIs
  const metrics = useMemo(() => {
    const newAssignedOrders = vehicleBookings.filter((b) => {
      const s = normalizeOrderStatus(b.bookingStatus);
      return (
        (s === "Vehicle Allocated" || b.bookingStatus === "Vehicle Assigned") &&
        b.driverAcceptanceStatus !== "Accepted" &&
        b.driverAcceptanceStatus !== "Rejected"
      );
    });
    const acceptedOrders = vehicleBookings.filter((b) => {
      const s = normalizeOrderStatus(b.bookingStatus);
      return (
        b.driverAcceptanceStatus === "Accepted" ||
        s === "Driver Accepted" ||
        s === "Pickup Pending" ||
        s === "Vehicle at Sand Reach" ||
        s === "Loading in Progress" ||
        s === "Loaded / Pickup Completed" ||
        s === "Transit Pass Generated" ||
        s === "In Transit" ||
        s === "Reached Delivery Location" ||
        s === "OTP Verification" ||
        s === "Delivered" ||
        s === "Order Closed"
      );
    });
    const rejectedOrders = bookings.filter(
      (b) => b.driverRejectionReason && b.driverRejectionReason.includes(currentVehicle.vehicleNumber)
    );
    const pickupPendingOrders = vehicleBookings.filter((b) => {
      const s = normalizeOrderStatus(b.bookingStatus);
      return (
        s === "Driver Accepted" ||
        s === "Pickup Pending" ||
        s === "Vehicle at Sand Reach" ||
        s === "Loading in Progress"
      );
    });
    const inTransitOrders = vehicleBookings.filter((b) => {
      const s = normalizeOrderStatus(b.bookingStatus);
      return (
        s === "Loaded / Pickup Completed" ||
        s === "Transit Pass Generated" ||
        s === "In Transit" ||
        s === "Reached Delivery Location"
      );
    });
    const deliveredPendingOtp = vehicleBookings.filter((b) => {
      const s = normalizeOrderStatus(b.bookingStatus);
      return s === "OTP Verification" || s === "Delivered";
    });
    const completedTrips = vehicleBookings.filter((b) => {
      const s = normalizeOrderStatus(b.bookingStatus);
      return (
        s === "Order Closed" ||
        (s === "Delivered" && b.assignedVehicleNumber === currentVehicle.vehicleNumber)
      );
    });

    // Earnings calculation (₹ 150 - ₹ 200 / MT or transportCharges)
    const baseEarnings = (currentVehicle.totalTripsCompleted || 0) * (currentVehicle.capacityMt * 160);
    const activeEarnings = vehicleBookings
      .filter((b) => {
        const s = normalizeOrderStatus(b.bookingStatus);
        return s === "Order Closed" || b.bookingStatus === "Trip Completed";
      })
      .reduce((sum, b) => sum + (b.transportCharges || b.quantityMt * 180), 0);

    const totalEarnings = baseEarnings + activeEarnings;
    const nextQueuePosition = currentVehicle.queueStatus === "Available / In Queue" ? currentVehicle.queuePosition || 1 : "On Delivery";

    return {
      newOrdersCount: newAssignedOrders.length,
      assignedCount: vehicleBookings.filter((b) => b.assignedVehicleNumber === currentVehicle.vehicleNumber).length,
      acceptedCount: acceptedOrders.length,
      rejectedCount: rejectedOrders.length,
      pickupPendingCount: pickupPendingOrders.length,
      inTransitCount: inTransitOrders.length,
      deliveredCount: deliveredPendingOtp.length,
      completedTripsCount: currentVehicle.totalTripsCompleted || completedTrips.length,
      totalEarnings,
      nextQueuePosition,
    };
  }, [vehicleBookings, bookings, currentVehicle]);

  // Handle Accept Order
  const handleAccept = (order: SandBooking) => {
    const ok = driverAcceptOrder(order.orderId, currentVehicle.vehicleNumber);
    if (ok) {
      setTripSuccessNotice(`Order ${order.orderId} accepted! Proceed to navigate to ${order.sourceStockyardName} for pickup.`);
      setSelectedBookingForAction(order);
    }
  };

  // Handle Reject Order & Automatic Reallocation
  const handleConfirmReject = () => {
    if (!selectedBookingForAction) return;

    const finalReason = rejectionReason === "Other" ? customRejectionText || "Driver Unavailable" : rejectionReason;
    const result = driverRejectOrder(selectedBookingForAction.orderId, currentVehicle.vehicleNumber, finalReason);

    setIsRejectModalOpen(false);
    setSelectedBookingForAction(null);
    setRejectionAlertNotice(result.message);
  };

  // Handle Navigate to Reach / Stockyard
  const handleOpenNavigate = (order: SandBooking, target: "stockyard" | "customer") => {
    setSelectedBookingForAction(order);
    setNavTarget(target);
    setIsNavigateModalOpen(true);
  };

  // Handle Start Pickup
  const handleStartPickupAction = (order: SandBooking) => {
    driverStartPickup(order.orderId);
    setTripSuccessNotice(`Pickup journey initiated to ${order.sourceStockyardName}.`);
  };

  // Handle Loading & Weighbridge Confirmation
  const handleConfirmLoadAction = (order: SandBooking) => {
    driverConfirmStockyardLoad(order.orderId);
    setTripSuccessNotice(`Sand loading & weighbridge tare/gross verified at ${order.sourceStockyardName}. Transit e-Pass generated!`);
  };

  // Handle Start Delivery Journey
  const handleStartTransitAction = (order: SandBooking) => {
    driverStartTransit(order.orderId);
    setTripSuccessNotice(`Vehicle dispatched on transit route to ${order.destinationAddress}. GPS Corridor active.`);
  };

  // Handle Arrived at Customer Site
  const handleArrivedAtDestination = (order: SandBooking) => {
    setSelectedBookingForAction(order);
    setIsOtpModalOpen(true);
    setOtpError("");
    setCustomerOtpInput("");
  };

  // Handle Customer OTP Verification & Trip Completion
  const handleVerifyOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForAction) return;

    if (!customerOtpInput.trim() || customerOtpInput.length !== 4) {
      setOtpError("Please enter valid 4-digit Customer Delivery OTP.");
      return;
    }

    if (customerOtpInput !== "7834") {
      setOtpError("Invalid OTP entered. Please request customer's SMS OTP (Demo OTP: 7834).");
      return;
    }

    const success = driverDeliverAndVerifyOtp(selectedBookingForAction.orderId, customerOtpInput);
    if (success) {
      setIsOtpModalOpen(false);
      setTripSuccessNotice(
        `🎉 Delivery Successfully Completed! Customer OTP verified. Transport payment of ₹ ${(
          selectedBookingForAction.transportCharges || selectedBookingForAction.quantityMt * 180
        ).toLocaleString()} credited to driver wallet. Vehicle released to FIFO Queue.`
      );
      setSelectedBookingForAction(null);
    } else {
      setOtpError("Failed to verify delivery OTP. Please retry.");
    }
  };

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Header Profile Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 text-slate-900 dark:text-white border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="size-13 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl border border-emerald-200 dark:border-emerald-800/60 shrink-0">
            <Truck size={26} />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                {currentVehicle.driverName}
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-semibold rounded-full border border-emerald-200 dark:border-emerald-800">
                  {currentVehicle.vehicleNumber}
                </span>
              </span>
              <Badge variant="success">Active Commercial Transporter</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 font-mono text-slate-700 dark:text-slate-300">
                <Smartphone size={13} className="text-emerald-600 dark:text-emerald-400" />
                {currentVehicle.mobile}
              </span>
              <span>•</span>
              <span>
                Capacity: <strong className="text-slate-700 dark:text-slate-200">{currentVehicle.capacityMt} MT</strong> ({currentVehicle.vehicleType})
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin size={13} className="text-rose-500" />
                District: <strong className="text-slate-700 dark:text-slate-200">{currentVehicle.assignedDistrict || "Raipur"}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Driver Switcher & Logout */}
        <div className="flex flex-wrap items-center gap-3 self-end md:self-center">
          <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-1.5 flex items-center gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] pl-1.5 font-medium">Switch Operator:</span>
            <select
              value={selectedVehicleNum}
              onChange={(e) => setSelectedVehicleNum(e.target.value)}
              className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
            >
              {vehicles
                .filter((v) => !v.isBlacklisted)
                .map((v) => (
                  <option key={v.id} value={v.vehicleNumber}>
                    {v.driverName} ({v.vehicleNumber} - {v.vehicleType})
                  </option>
                ))}
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setActiveRole("Super Admin");
              navigate("/login");
            }}
            icon={<LogOut size={14} />}
            className="text-xs"
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Notifications and Alerts */}
      {tripSuccessNotice && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
            <span>{tripSuccessNotice}</span>
          </div>
          <button onClick={() => setTripSuccessNotice("")} className="text-xs font-bold hover:underline">
            ✕
          </button>
        </div>
      )}

      {rejectionAlertNotice && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-900 dark:text-amber-300 text-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle size={18} className="text-amber-500 shrink-0" />
            <span>{rejectionAlertNotice}</span>
          </div>
          <button onClick={() => setRejectionAlertNotice("")} className="text-xs font-bold hover:underline">
            ✕
          </button>
        </div>
      )}

      {/* Driver Dashboard Metric KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <Card className="p-3.5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-[10px] font-bold uppercase">
            <span>New Orders</span>
            <AlertCircle size={14} className="text-rose-500" />
          </div>
          <div className="mt-1 text-2xl font-black text-rose-600 dark:text-rose-400">
            {metrics.newOrdersCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Assigned Offers</div>
        </Card>

        <Card className="p-3.5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-[10px] font-bold uppercase">
            <span>Pickup Pending</span>
            <Clock size={14} className="text-amber-500" />
          </div>
          <div className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">
            {metrics.pickupPendingCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Heading to Reach</div>
        </Card>

        <Card className="p-3.5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-[10px] font-bold uppercase">
            <span>In Transit</span>
            <Navigation size={14} className="text-blue-500" />
          </div>
          <div className="mt-1 text-2xl font-black text-blue-600 dark:text-blue-400">
            {metrics.inTransitCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">En Route Delivery</div>
        </Card>

        <Card className="p-3.5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-[10px] font-bold uppercase">
            <span>Completed Trips</span>
            <CheckCircle2 size={14} className="text-emerald-500" />
          </div>
          <div className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {metrics.completedTripsCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">POD Verified</div>
        </Card>

        <Card className="p-3.5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-[10px] font-bold uppercase">
            <span>Total Earnings</span>
            <DollarSign size={14} className="text-purple-500" />
          </div>
          <div className="mt-1 text-xl font-black text-purple-600 dark:text-purple-400">
            ₹ {metrics.totalEarnings.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Transport Charges</div>
        </Card>

        <Card
          onClick={() => navigate(routes.vehicleQueue.path)}
          className="p-3.5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer hover:border-emerald-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 text-[10px] font-bold uppercase">
            <span>Next Queue Turn</span>
            <Sparkles size={14} className="text-emerald-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-1 text-xl font-black text-emerald-600 dark:text-emerald-400">
            {typeof metrics.nextQueuePosition === "number" ? `Rank #${metrics.nextQueuePosition}` : metrics.nextQueuePosition}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center justify-between">
            <span>FIFO District Turn</span>
            <span className="text-[9px] underline">View Board →</span>
          </div>
        </Card>
      </div>

      {/* ── ACTIVE / PENDING TRIP WORKFLOW BANNER ── */}
      {activeOrder ? (
        <Card className="p-6 bg-gradient-to-br from-emerald-950/20 via-white to-emerald-900/10 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 border-2 border-emerald-500/40 shadow-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-4 border-b border-slate-200 dark:border-slate-700">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 text-xs font-extrabold rounded-md font-mono">
                  ACTIVE ORDER: {activeOrder.orderId}
                </span>
                <OrderStatusBadge status={activeOrder.bookingStatus} size="sm" />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1.5">
                {activeOrder.quantityMt} MT {activeOrder.sandType} Delivery
              </h2>
              <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3 mt-1">
                <span>
                  Customer: <strong>{activeOrder.customerName}</strong> ({activeOrder.customerMobile})
                </span>
                <span>•</span>
                <span>
                  Est. Transport Fare: <strong>₹ {(activeOrder.transportCharges || activeOrder.quantityMt * 180).toLocaleString()}</strong>
                </span>
              </div>
            </div>

            {/* Step Pipeline Visualization */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                  activeOrder.bookingStatus === "Vehicle Assigned"
                    ? "bg-amber-500 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                }`}
              >
                1. Accept Offer
              </span>
              <ArrowRight size={14} className="text-slate-400" />
              <span
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                  activeOrder.bookingStatus === "Order Accepted" || activeOrder.bookingStatus === "Pickup Pending"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                }`}
              >
                2. Navigate & Pickup
              </span>
              <ArrowRight size={14} className="text-slate-400" />
              <span
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                  activeOrder.bookingStatus === "In Transit" || activeOrder.bookingStatus === "Dispatched"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                }`}
              >
                3. Transit
              </span>
              <ArrowRight size={14} className="text-slate-400" />
              <span
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                  activeOrder.bookingStatus === "Delivered" || activeOrder.bookingStatus === "Trip Completed"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                }`}
              >
                4. Customer OTP (POD)
              </span>
            </div>
          </div>

          {/* ── Sand Reach Pickup Process Sub-Pipeline (Requirement 10) ── */}
          <div className="mt-4 p-3.5 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-blue-600" />
                Reach Pickup Lifecycle: Vehicle Arrived ➔ Verification ➔ Loading ➔ Photo+GPS ➔ Pickup Confirmed
              </span>
              <Badge variant="primary">
                {activeOrder.bookingStatus === "Order Accepted"
                  ? "Pickup Pending"
                  : activeOrder.bookingStatus === "Loading at Stockyard"
                  ? "Loading at Reach"
                  : activeOrder.bookingStatus === "In Transit" || activeOrder.bookingStatus === "Dispatched"
                  ? "Pickup Completed"
                  : activeOrder.bookingStatus}
              </Badge>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center text-[10px]">
              <div className={`p-1.5 rounded-lg font-bold border ${activeOrder.bookingStatus !== "Vehicle Assigned" ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300" : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200"}`}>
                1. Vehicle Arrived
              </div>
              <div className={`p-1.5 rounded-lg font-bold border ${activeOrder.bookingStatus === "Loading at Stockyard" || activeOrder.bookingStatus === "In Transit" || activeOrder.bookingStatus === "Delivered" ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300" : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200"}`}>
                2. Vehicle Verified
              </div>
              <div className={`p-1.5 rounded-lg font-bold border ${activeOrder.bookingStatus === "Loading at Stockyard" || activeOrder.bookingStatus === "In Transit" || activeOrder.bookingStatus === "Delivered" ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300" : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200"}`}>
                3. Qty Verified
              </div>
              <div className={`p-1.5 rounded-lg font-bold border ${activeOrder.bookingStatus === "Loading at Stockyard" ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-400 animate-pulse" : activeOrder.bookingStatus === "In Transit" || activeOrder.bookingStatus === "Delivered" ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300" : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200"}`}>
                4. Sand Loading
              </div>
              <div className={`p-1.5 rounded-lg font-bold border ${activeOrder.bookingStatus === "In Transit" || activeOrder.bookingStatus === "Delivered" ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300" : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200"}`}>
                5. Photo + GPS
              </div>
              <div className={`p-1.5 rounded-lg font-bold border ${activeOrder.bookingStatus === "In Transit" || activeOrder.bookingStatus === "Delivered" ? "bg-emerald-600 text-white border-emerald-700 shadow-xs" : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200"}`}>
                6. Pickup Confirmed
              </div>
            </div>
          </div>

          {/* Workflow Action Buttons for Active Order */}
          <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <MapPin size={15} className="text-rose-500" />
                Pickup & Drop Route Coordinates
              </div>
              <div className="space-y-1.5 pt-1 text-slate-600 dark:text-slate-300">
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Pickup Source Reach: </span>
                  <strong>{activeOrder.sourceStockyardName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Delivery Destination: </span>
                  <strong>{activeOrder.destinationAddress}</strong> ({activeOrder.destinationDistrict || "Raipur"})
                </div>
              </div>
            </div>

            {/* Contextual Action Trigger */}
            <div className="flex flex-col justify-center gap-2.5">
              {(normalizeOrderStatus(activeOrder.bookingStatus) === "Vehicle Allocated" || activeOrder.bookingStatus === "Vehicle Assigned") && (
                <div className="flex items-center gap-3">
                  <Button
                    variant="primary"
                    onClick={() => handleAccept(activeOrder)}
                    icon={<CheckCircle2 size={16} />}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 shadow-md"
                  >
                    Accept Order Offer
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      setSelectedBookingForAction(activeOrder);
                      setIsRejectModalOpen(true);
                    }}
                    icon={<XCircle size={16} />}
                    className="flex-1 font-bold py-3"
                  >
                    Reject Order
                  </Button>
                </div>
              )}

              {(normalizeOrderStatus(activeOrder.bookingStatus) === "Driver Accepted" ||
                normalizeOrderStatus(activeOrder.bookingStatus) === "Pickup Pending") && (
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <Button
                    variant="primary"
                    onClick={() => handleOpenNavigate(activeOrder, "stockyard")}
                    icon={<Compass size={16} />}
                    className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5"
                  >
                    Navigate to Sand Reach
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleStartPickupAction(activeOrder)}
                    icon={<Clock size={16} />}
                    className="w-full sm:w-auto text-xs py-2.5"
                  >
                    Vehicle Arrived at Reach
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => handleConfirmLoadAction(activeOrder)}
                    icon={<Scale size={16} />}
                    className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2.5"
                  >
                    Confirm Loading & Weighment
                  </Button>
                </div>
              )}

              {(normalizeOrderStatus(activeOrder.bookingStatus) === "Vehicle at Sand Reach" ||
                normalizeOrderStatus(activeOrder.bookingStatus) === "Loading in Progress" ||
                normalizeOrderStatus(activeOrder.bookingStatus) === "Loaded / Pickup Completed" ||
                activeOrder.bookingStatus === "Loading at Stockyard") && (
                <div className="flex items-center gap-3">
                  <Button
                    variant="primary"
                    onClick={() => handleStartTransitAction(activeOrder)}
                    icon={<Navigation size={16} />}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 shadow-md"
                  >
                    Start Delivery Journey (Transit Pass Generated)
                  </Button>
                </div>
              )}

              {(normalizeOrderStatus(activeOrder.bookingStatus) === "Transit Pass Generated" ||
                normalizeOrderStatus(activeOrder.bookingStatus) === "In Transit" ||
                normalizeOrderStatus(activeOrder.bookingStatus) === "Reached Delivery Location" ||
                activeOrder.bookingStatus === "Dispatched") && (
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleOpenNavigate(activeOrder, "customer")}
                    icon={<Compass size={16} />}
                    className="flex-1 text-xs py-3"
                  >
                    Navigate to Customer Site
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => handleArrivedAtDestination(activeOrder)}
                    icon={<KeyRound size={16} />}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 shadow-md"
                  >
                    Arrived • Enter Customer OTP
                  </Button>
                </div>
              )}

              {(normalizeOrderStatus(activeOrder.bookingStatus) === "OTP Verification" ||
                normalizeOrderStatus(activeOrder.bookingStatus) === "Delivered" ||
                activeOrder.bookingStatus === "Delivered") && (
                <Button
                  variant="primary"
                  onClick={() => handleArrivedAtDestination(activeOrder)}
                  icon={<KeyRound size={16} />}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 shadow-md"
                >
                  Verify Customer Delivery OTP (Demo: 7834)
                </Button>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 text-center space-y-2 shadow-xs">
          <div className="size-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            Vehicle Available in FIFO Queue (Rank #{currentVehicle.queuePosition || 1})
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Your vehicle <strong>{currentVehicle.vehicleNumber}</strong> is active in the {currentVehicle.assignedDistrict} district queue. The next paid sand order will be automatically offered to you.
          </p>
        </div>
      )}

      {/* ── COMPLETE ORDER HISTORY / TRIP LOG TABLE ── */}
      <Card title="Driver Assigned Orders & Trip Ledger" icon={FileText}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Sand Specs & Quantity</th>
                <th className="py-3 px-4">Pickup Stockyard</th>
                <th className="py-3 px-4">Delivery Destination</th>
                <th className="py-3 px-4">Customer Contact</th>
                <th className="py-3 px-4">Transport Fare</th>
                <th className="py-3 px-4">Trip Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
              {vehicleBookings.map((bkg) => {
                const isRejected = bkg.driverRejectionReason && bkg.driverRejectionReason.includes(currentVehicle.vehicleNumber);

                return (
                  <tr key={bkg.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white font-mono">{bkg.orderId}</div>
                      <div className="text-[10px] text-slate-400">{bkg.createdAt}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-emerald-600 dark:text-emerald-400">{bkg.quantityMt} MT</div>
                      <div className="text-[11px] text-slate-500">{bkg.sandType}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{bkg.sourceStockyardName}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                        <MapPin size={12} className="text-rose-500" />
                        {bkg.destinationDistrict || "Raipur"}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[170px]">
                        {bkg.destinationAddress}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{bkg.customerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{bkg.customerMobile}</div>
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      ₹ {(bkg.transportCharges || bkg.quantityMt * 180).toLocaleString()}
                    </td>

                    <td className="py-3 px-4">
                      {isRejected ? (
                        <Badge variant="danger">Rejected by Driver</Badge>
                      ) : bkg.bookingStatus === "Trip Completed" || bkg.bookingStatus === "Delivered" ? (
                        <Badge variant="success">Completed</Badge>
                      ) : bkg.bookingStatus === "In Transit" ? (
                        <Badge variant="warning">In Transit</Badge>
                      ) : bkg.bookingStatus === "Vehicle Assigned" ? (
                        <Badge variant="info">New Offer</Badge>
                      ) : (
                        <Badge variant="secondary">{bkg.bookingStatus}</Badge>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => {
                            setSelectedBookingForAction(bkg);
                            setIsDetailModalOpen(true);
                          }}
                          icon={<FileText size={13} />}
                          className="text-xs"
                        >
                          Details
                        </Button>

                        {bkg.bookingStatus === "Vehicle Assigned" && !isRejected && (
                          <>
                            <Button
                              variant="primary"
                              size="xs"
                              onClick={() => handleAccept(bkg)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold"
                            >
                              Accept
                            </Button>
                            <Button
                              variant="danger"
                              size="xs"
                              onClick={() => {
                                setSelectedBookingForAction(bkg);
                                setIsRejectModalOpen(true);
                              }}
                              className="text-[11px]"
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── MODAL 1: ORDER DETAILS BREAKDOWN ── */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Order Details • ${selectedBookingForAction?.orderId || ""}`}
        size="md"
      >
        {selectedBookingForAction && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Customer</span>
                <div className="font-bold text-slate-900 dark:text-white">{selectedBookingForAction.customerName}</div>
                <div className="text-[11px] text-slate-500 font-mono">{selectedBookingForAction.customerMobile}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Transport Fare</span>
                <div className="font-black text-emerald-600 text-base">
                  ₹ {(selectedBookingForAction.transportCharges || selectedBookingForAction.quantityMt * 180).toLocaleString()}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Payload Quantity</span>
                <div className="font-bold text-slate-900 dark:text-white">
                  {selectedBookingForAction.quantityMt} MT ({selectedBookingForAction.sandType})
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Pickup Stockyard</span>
                <div className="font-bold text-slate-900 dark:text-white">
                  {selectedBookingForAction.sourceStockyardName}
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Delivery Address</span>
                <div className="font-semibold text-slate-900 dark:text-white">
                  {selectedBookingForAction.destinationAddress}
                </div>
              </div>
            </div>

            <ModalFooter>
              <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
            </ModalFooter>
          </div>
        )}
      </Modal>

      {/* ── MODAL 2: REJECT ORDER & AUTOMATIC REALLOCATION RULE ── */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Sand Order Assignment"
        size="md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-900 dark:text-rose-200 flex items-start gap-2.5">
            <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Automated Reallocation Business Rule:</span>
              <p className="text-[11px] text-rose-800 dark:text-rose-300 mt-0.5">
                Upon rejection, the system will instantly release this order back to the automated allocation engine and assign it to the next eligible registered tractor/vehicle in the FIFO queue.
              </p>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              Reason for Rejection *
            </label>
            <select
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="Vehicle Maintenance Required">Vehicle / Tractor Mechanical Breakdown</option>
              <option value="Driver Duty Shift Ended">Driver Duty Shift / Hours Completed</option>
              <option value="Destination Area Inaccessible">Destination Road Restricted / Inaccessible</option>
              <option value="Overweight / Capacity Constraint">Payload Exceeds Safe Bridge Clearance</option>
              <option value="Other">Other Reason (Write in notes)</option>
            </select>
          </div>

          {rejectionReason === "Other" && (
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                Explain Reason *
              </label>
              <textarea
                value={customRejectionText}
                onChange={(e) => setCustomRejectionText(e.target.value)}
                placeholder="State reason for rejecting allocation..."
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                rows={3}
              ></textarea>
            </div>
          )}

          <ModalFooter>
            <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmReject}
              icon={<XCircle size={14} />}
              className="font-bold"
            >
              Confirm Rejection & Reallocate Order
            </Button>
          </ModalFooter>
        </div>
      </Modal>

      {/* ── MODAL 3: TURN-BY-TURN REACH / CUSTOMER NAVIGATION SIMULATOR ── */}
      <Modal
        isOpen={isNavigateModalOpen}
        onClose={() => setIsNavigateModalOpen(false)}
        title={
          navTarget === "stockyard"
            ? `Navigate to Pickup Reach: ${selectedBookingForAction?.sourceStockyardName || ""}`
            : `Navigate to Delivery Site: ${selectedBookingForAction?.destinationAddress || ""}`
        }
        size="lg"
      >
        <div className="space-y-4 text-xs">
          {/* Simulated Map Visual */}
          <div className="relative h-64 bg-slate-900 rounded-xl overflow-hidden border border-slate-700 flex items-center justify-center p-4 text-white">
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-emerald-950 opacity-90"></div>

            <div className="relative z-10 text-center space-y-3">
              <div className="size-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30 animate-pulse">
                <Navigation size={24} />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-white">
                  {navTarget === "stockyard"
                    ? `Heading to ${selectedBookingForAction?.sourceStockyardName}`
                    : `Delivering to ${selectedBookingForAction?.destinationAddress}`}
                </h4>
                <p className="text-slate-300 text-xs">
                  Optimal Distance: <strong>14.2 km</strong> • Estimated Travel Time: <strong>25 Mins</strong>
                </p>
                <div className="text-[10px] text-emerald-400 font-mono pt-1">
                  GPS Telemetry AIS-140 Pinging • Geofence Corridor Clean
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Customer Contact</span>
              <div className="font-bold text-slate-900 dark:text-white">{selectedBookingForAction?.customerName}</div>
              <div className="text-[11px] text-slate-500 font-mono">{selectedBookingForAction?.customerMobile}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Target ETA</span>
              <div className="font-bold text-emerald-600">Within 30 Minutes</div>
            </div>
          </div>

          <ModalFooter>
            <Button variant="outline" onClick={() => setIsNavigateModalOpen(false)}>
              Close Navigation
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setIsNavigateModalOpen(false);
                if (navTarget === "stockyard" && selectedBookingForAction) {
                  handleStartPickupAction(selectedBookingForAction);
                } else if (navTarget === "customer" && selectedBookingForAction) {
                  handleArrivedAtDestination(selectedBookingForAction);
                }
              }}
              icon={<CheckCircle2 size={14} />}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              {navTarget === "stockyard" ? "Confirm Arrival at Reach" : "Confirm Arrival at Destination"}
            </Button>
          </ModalFooter>
        </div>
      </Modal>

      {/* ── MODAL 4: CUSTOMER LOCATION DELIVERY MODULE (5-STEP PROTOCOL & 8 DELIVERABLES) ── */}
      <Modal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        title="Delivery Module at Customer Location (POD Handover Protocol)"
        size="xl"
      >
        <div className="pt-1">
          <CustomerLocationDeliveryModule
            initialOrderId={selectedBookingForAction?.orderId || selectedBookingForAction?.id}
            showSelector={false}
            compact={true}
            onDeliveryCompleted={() => {
              setTripSuccessNotice(
                `🎉 Delivery Confirmed & Trip Completed! Customer OTP verified. Transport payment credited to driver wallet. Vehicle released to FIFO Queue rank #1.`
              );
              setTimeout(() => {
                setIsOtpModalOpen(false);
                setSelectedBookingForAction(null);
              }, 1200);
            }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default DriverDashboard;
