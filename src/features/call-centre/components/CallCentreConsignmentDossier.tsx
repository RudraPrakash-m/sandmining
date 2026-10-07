import React from "react";
import {
  FileText,
  Truck,
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Lock,
  MessageSquare,
  Sparkles,
  Layers,
  CheckCircle2,
  Navigation,
  Radio,
  PhoneForwarded,
  DollarSign,
  Scale,
  KeyRound,
  FileSpreadsheet,
} from "lucide-react";
import type {
  SandBooking,
  DeliveryConfirmation,
  Vehicle,
  VehicleTelemetry,
  GrievanceTicket,
  OrderStatus,
} from "@/features/shared-simulation/types";
import { OrderLifecycleCard, OrderStatusBadge } from "@/features/order-lifecycle";
import Card from "@/shared/components/layout/Card/Card";
import Button from "@/shared/components/ui/Button";
import Badge from "@/shared/components/ui/Badge";

export interface CallCentreConsignmentDossierProps {
  booking: SandBooking;
  delivery?: DeliveryConfirmation;
  vehicle?: Vehicle;
  telemetry?: VehicleTelemetry;
  complaints: GrievanceTicket[];
  isCallCentreRole: boolean;
  onOpenComplaintModal: () => void;
  onOpenRemarksModal: () => void;
  onOpenEscalationModal: () => void;
  onOpenHistoryModal: () => void;
  onUpdateStatus?: (newStatus: OrderStatus, reason?: string) => void;
}

export const CallCentreConsignmentDossier: React.FC<CallCentreConsignmentDossierProps> = ({
  booking,
  delivery,
  vehicle,
  telemetry,
  complaints,
  isCallCentreRole,
  onOpenComplaintModal,
  onOpenRemarksModal,
  onOpenEscalationModal,
  onOpenHistoryModal,
  onUpdateStatus,
}) => {
  // Compute transit stage
  const currentStage = delivery?.status === "Delivered"
    ? "Delivered"
    : booking.bookingStatus === "In Transit"
    ? "In Transit"
    : booking.bookingStatus === "Loading at Stockyard"
    ? "Sand Reach"
    : booking.bookingStatus === "Dispatched"
    ? "Vehicle Started"
    : "Near Destination";

  // Compute realistic ETA and Distance
  const isDelivered = delivery?.status === "Delivered" || booking.bookingStatus === "Delivered";
  const remainingDist = isDelivered ? 0 : 8.4;
  const etaText = isDelivered ? "Delivered at Site" : "Today, 05:45 PM (~22 Mins)";

  return (
    <div className="space-y-6">
      {/* ── SECURITY ENFORCEMENT BANNER (CRITICAL RBAC RULE) ── */}
      <div className={`p-4 rounded-2xl border text-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isCallCentreRole
          ? "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200"
          : "bg-purple-500/10 border-purple-500/30 text-purple-900 dark:text-purple-200"
      }`}>
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <Lock size={18} />
          </div>
          <div>
            <span className="font-black uppercase tracking-wider block">
              RBAC Governance Policy: {isCallCentreRole ? "Call Centre Operator (Restricted Permissions)" : "Elevated Administrative Mode"}
            </span>
            <p className="text-[11px] mt-0.5 text-amber-800 dark:text-amber-300">
              {isCallCentreRole ? (
                <>
                  Call Centre is permitted to <strong>query status</strong>, <strong>log delivery remarks</strong>, and <strong>escalate complaints</strong>. Critical transaction records (Payment, Quantity, Allocation, OTP, POD Confirmation) are strictly <strong>read-only & immutable</strong>.
                </>
              ) : (
                <>
                  Operating under administrative credentials. All overrides must adhere to the State Sand Mining audit policy.
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          <Badge variant={isCallCentreRole ? "warning" : "primary"} className="font-mono text-xs">
            {isCallCentreRole ? "Read-Only Core Ledger" : "Admin Override Enabled"}
          </Badge>
        </div>
      </div>

      {/* ── ACTION HUB (COMPLAINT, REMARKS, ESCALATE, HISTORY) ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white">
            Call Centre Actions:
          </span>
          <span className="text-xs text-slate-500 font-mono">Order #{booking.orderId}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Register Complaint */}
          <Button
            size="sm"
            variant="outline"
            icon={<MessageSquare size={13} className="text-rose-500" />}
            onClick={onOpenComplaintModal}
            className="text-xs font-bold border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40"
          >
            Register Complaint
          </Button>

          {/* Update Permitted Delivery Remarks */}
          <Button
            size="sm"
            variant="outline"
            icon={<FileText size={13} className="text-blue-500" />}
            onClick={onOpenRemarksModal}
            className="text-xs font-bold border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40"
          >
            Update Delivery Remarks
          </Button>

          {/* Escalate Delayed Delivery */}
          <Button
            size="sm"
            variant="danger"
            icon={<PhoneForwarded size={13} />}
            onClick={onOpenEscalationModal}
            className="text-xs font-bold"
          >
            Escalate Delayed Delivery
          </Button>

          {/* View Previous Complaints */}
          <Button
            size="sm"
            variant="outline"
            icon={<Clock size={13} className="text-purple-500" />}
            onClick={onOpenHistoryModal}
            className="text-xs font-bold"
          >
            View Complaints ({complaints.length})
          </Button>
        </div>
      </div>

      {/* ── ORDER STATUS LIFECYCLE ENGINE CARD ── */}
      <OrderLifecycleCard
        booking={booking}
        onUpdateStatus={onUpdateStatus}
        canAdvance={!isCallCentreRole}
      />

      {/* ── 4 CORE 360° OPERATIONAL INSPECTION TILES ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ── TILE 1: VIEW BOOKING STATUS ── */}
        <Card
          title="1. Booking Status & Consignee Manifest"
          subtitle="Customer purchase order details and verified delivery destination"
          icon={FileText}
        >
          <div className="space-y-4 pt-1 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Booking Order ID</span>
                <span className="font-mono font-black text-sm text-purple-600 dark:text-purple-400 block mt-0.5">
                  {booking.orderId}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Ref: {booking.id}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Order Lifecycle Status</span>
                <div className="mt-1">
                  <OrderStatusBadge status={booking.bookingStatus} size="sm" />
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Consignee Customer</span>
                <span className="font-bold text-slate-900 dark:text-white block mt-0.5">
                  {booking.customerName}
                </span>
                <span className="text-[10px] text-slate-500">{booking.customerType || "Individual Citizen"}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Customer Mobile</span>
                <a
                  href={`tel:${booking.customerMobile}`}
                  className="font-mono font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline mt-0.5"
                >
                  <Phone size={12} /> {booking.customerMobile}
                </a>
                <span className="text-[10px] text-emerald-600 font-semibold">SMS Handshake Verified</span>
              </div>

              <div className="col-span-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Destination Plot Location</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-start gap-1 mt-0.5">
                  <MapPin size={13} className="text-rose-500 shrink-0 mt-0.5" />
                  <span>{booking.destinationAddress || booking.deliveryLocation || "VIP Road, Raipur"}</span>
                </p>
                <span className="text-[10px] text-slate-500 block pl-4">
                  District: {booking.destinationDistrict || "Raipur"}
                </span>
              </div>
            </div>

            {/* Mineral & Stockyard Info */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50/70 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Source Sand Reach</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                  {booking.sourceStockyardName || "Mandir Hasaud Reach #04"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Booking Date & Time</span>
                <span className="font-mono text-slate-700 dark:text-slate-300 block mt-0.5">
                  {booking.createdAt || "2026-10-03 10:15 IST"}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* ── TILE 2: VIEW VEHICLE STATUS ── */}
        <Card
          title="2. Vehicle Status & Live Telematics"
          subtitle="Commercial transporter registration, driver contact & AIS-140 GPS ping"
          icon={Truck}
        >
          <div className="space-y-4 pt-1 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Carrier Vehicle No.</span>
                <span className="font-mono font-black text-sm text-slate-900 dark:text-white block mt-0.5">
                  {booking.assignedVehicleNumber || vehicle?.vehicleNumber || "CG-04-TX-2341"}
                </span>
                <span className="text-[10px] text-slate-500">{vehicle?.vehicleType || "10-Wheeler Tipper (10 MT)"}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Vehicle Operating State</span>
                <div className="mt-1">
                  <Badge variant="success">Verified & Active</Badge>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 block mt-0.5">
                  Queue: {vehicle?.queueStatus || "Assigned on Trip"}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Authorized Driver</span>
                <span className="font-bold text-slate-900 dark:text-white block mt-0.5">
                  {booking.assignedDriverName || vehicle?.driverName || "Venkat Sahu"}
                </span>
                <a
                  href={`tel:${vehicle?.mobile || "+91 98261 22341"}`}
                  className="font-mono font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline mt-0.5"
                >
                  <Phone size={11} /> {vehicle?.mobile || "+91 98261 22341"}
                </a>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">AIS-140 GPS Telemetry</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <Radio size={14} className="text-emerald-500 animate-pulse" />
                  <span className="font-mono text-emerald-600 font-bold">Signal Active</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Speed: {telemetry?.speedKmH || 42} km/h</span>
              </div>

              <div className="col-span-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Current GPS Fix & Geofence</span>
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-mono mt-0.5">
                  <span>Coordinates: {delivery?.geoCoordinates || "21.1610° N, 81.7870° E"}</span>
                  <span className="text-emerald-600 font-bold">Corridor Clean</span>
                </div>
              </div>
            </div>

            {/* Quick Driver Communication Pill */}
            <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-blue-950 dark:text-blue-200 block">Direct Driver Assist Hotline</span>
                <span className="text-[11px] text-blue-800 dark:text-blue-300">
                  Call driver directly to convey consignee access instructions or landmark notes.
                </span>
              </div>
              <a
                href={`tel:${vehicle?.mobile || "+91 98261 22341"}`}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shrink-0"
              >
                <Phone size={13} /> Call Driver
              </a>
            </div>
          </div>
        </Card>

        {/* ── TILE 3: VIEW DELIVERY STATUS (5-STAGE TRACKER) ── */}
        <Card
          title="3. Delivery Status (5-Stage Transit Pipeline)"
          subtitle="Physical consignment movement stages from river reach to consignee site"
          icon={Navigation}
        >
          <div className="space-y-4 pt-1 text-xs">
            {/* 5-Stage Stepper Ribbon */}
            <div className="grid grid-cols-5 gap-1.5 text-center">
              {[
                { stage: "Sand Reach", label: "Reach", sub: "Weighed", done: true },
                { stage: "Vehicle Started", label: "Started", sub: "Gate-Out", done: true },
                { stage: "In Transit", label: "Transit", sub: "On Route", done: true },
                { stage: "Near Destination", label: "Near Site", sub: "< 3 km", done: currentStage === "Near Destination" || isDelivered },
                { stage: "Delivered", label: "Delivered", sub: "POD Closed", done: isDelivered },
              ].map((s, idx) => (
                <div
                  key={s.stage}
                  className={`p-2 rounded-xl border transition-all ${
                    s.done
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200"
                      : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-400"
                  }`}
                >
                  <div
                    className={`size-6 rounded-full mx-auto flex items-center justify-center font-bold text-[10px] mb-1 ${
                      s.done ? "bg-emerald-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                    }`}
                  >
                    {s.done ? "✓" : idx + 1}
                  </div>
                  <span className="font-black block truncate text-[11px]">{s.label}</span>
                  <span className="text-[9px] block text-slate-500 truncate">{s.sub}</span>
                </div>
              ))}
            </div>

            {/* Delivery Timestamp & Location Dossier */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Current Transit State:</span>
                <span className="font-extrabold text-orange-600 dark:text-orange-400">{currentStage}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Waybill Departure Time</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">16:40 IST (Gate-out)</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Proof of Delivery (POD) Ref</span>
                  <span className="font-mono font-bold text-purple-600">
                    {delivery?.deliveryId || "POD-PENDING-CLOSURE"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* ── TILE 4: VIEW EXPECTED DELIVERY (ETA) ── */}
        <Card
          title="4. Expected Delivery (ETA) & Corridor Intelligence"
          subtitle="Real-time estimated time of arrival calculated from telematics speed & distance"
          icon={Clock}
        >
          <div className="space-y-4 pt-1 text-xs">
            {/* Highlighted Big ETA Tile */}
            <div className="p-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl text-white shadow-md flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-100 block">
                  Calculated Arrival Window (ETA)
                </span>
                <h3 className="text-xl font-black font-mono mt-0.5">{etaText}</h3>
                <p className="text-xs text-orange-100 mt-0.5">
                  Remaining Distance: <strong>{remainingDist} km</strong> • Corridor Flow: <strong>Optimal</strong>
                </p>
              </div>

              <div className="size-12 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                <Clock size={24} className="text-white" />
              </div>
            </div>

            {/* Transit Route Specs */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Route Congestion</span>
                <span className="font-bold text-emerald-600 block mt-0.5">Green / Normal Flow</span>
                <span className="text-[10px] text-slate-500">No reported road diversions</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Transit Pass Validity</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">Valid till 22:40 IST</span>
                <span className="text-[10px] text-emerald-600 font-semibold">Corridor Time Healthy</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ── CRITICAL TRANSACTION DATA LOCK MATRIX (READ-ONLY FOR CALL CENTRE) ── */}
      <Card
        title="Critical Transaction Ledger (Security Protected Data)"
        subtitle="Call Centre operators cannot manually alter these core parameters without verified administrative elevation"
        icon={Lock}
      >
        <div className="space-y-4 pt-1 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
            {/* 1. Payment */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 relative">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-bold uppercase">1. Payment</span>
                <Lock size={12} className="text-amber-500" />
              </div>
              <span className="text-base font-black font-mono text-slate-900 dark:text-white block">
                ₹ {(booking.totalAmount || 11480).toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                Status: {booking.paymentStatus || "Paid"}
              </span>
              <span className="text-[9px] text-slate-500 block mt-1 leading-tight">
                🔒 Immutable tariff. No refund or modification permitted by Call Centre.
              </span>
            </div>

            {/* 2. Quantity */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 relative">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-bold uppercase">2. Quantity (MT)</span>
                <Lock size={12} className="text-amber-500" />
              </div>
              <span className="text-base font-black font-mono text-orange-600 dark:text-orange-400 block">
                {booking.quantityMt} MT
              </span>
              <span className="text-[10px] text-slate-700 dark:text-slate-300 font-semibold block mt-0.5">
                {booking.sandType || "Coarse River Sand"}
              </span>
              <span className="text-[9px] text-slate-500 block mt-1 leading-tight">
                🔒 Weighbridge certified. Weight slip locked to reach tare/gross scales.
              </span>
            </div>

            {/* 3. Vehicle Allocation */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 relative">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-bold uppercase">3. Vehicle Allocation</span>
                <Lock size={12} className="text-amber-500" />
              </div>
              <span className="text-sm font-mono font-bold text-slate-900 dark:text-white block">
                {booking.assignedVehicleNumber || "CG-04-TX-2341"}
              </span>
              <span className="text-[10px] text-purple-600 font-bold block mt-0.5">
                FIFO Queue Algorithm
              </span>
              <span className="text-[9px] text-slate-500 block mt-1 leading-tight">
                🔒 Carrier assigned by automated engine. Manual switch prohibited.
              </span>
            </div>

            {/* 4. Customer OTP */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 relative">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-bold uppercase">4. Customer OTP</span>
                <Lock size={12} className="text-amber-500" />
              </div>
              <span className="text-base font-black font-mono text-slate-400 block">
                •••• [PROTECTED]
              </span>
              <span className="text-[10px] text-amber-600 font-bold block mt-0.5">
                Dispatched to SMS
              </span>
              <span className="text-[9px] text-slate-500 block mt-1 leading-tight">
                🔒 Statutory OTP sent to citizen. Call Centre cannot view or forge OTP.
              </span>
            </div>

            {/* 5. Delivery Confirmation */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 relative">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-bold uppercase">5. Delivery Confirmation</span>
                <Lock size={12} className="text-amber-500" />
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white block">
                {delivery?.status || "Pending POD"}
              </span>
              <span className="text-[10px] text-indigo-600 font-bold block mt-0.5">
                Driver On-Site Handover
              </span>
              <span className="text-[9px] text-slate-500 block mt-1 leading-tight">
                🔒 Physical OTP & geotag check-in required. Cannot be force-closed.
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CallCentreConsignmentDossier;
