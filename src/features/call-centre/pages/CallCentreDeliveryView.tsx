import React, { useState, useMemo } from "react";
import {
  Headset,
  Phone,
  Search,
  Truck,
  ShieldCheck,
  AlertCircle,
  Clock,
  MessageSquare,
  Lock,
  Sparkles,
  PhoneCall,
  UserCheck,
  PhoneForwarded,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import type { SandBooking, DeliveryConfirmation, Vehicle, VehicleTelemetry, GrievanceTicket, UserRole } from "@/features/shared-simulation/types";
import Card from "@/shared/components/layout/Card/Card";
import Button from "@/shared/components/ui/Button";
import Badge from "@/shared/components/ui/Badge";
import { CallCentreSearchConsole } from "../components/CallCentreSearchConsole";
import { CallCentreConsignmentDossier } from "../components/CallCentreConsignmentDossier";
import { CallCentreComplaintModal } from "../components/CallCentreComplaintModal";
import { CallCentreRemarksModal } from "../components/CallCentreRemarksModal";
import { CallCentreEscalationModal } from "../components/CallCentreEscalationModal";
import { CallCentreComplaintHistory } from "../components/CallCentreComplaintHistory";
import type { SearchCriteriaType } from "../types";

export const CallCentreDeliveryView: React.FC = () => {
  const {
    bookings,
    deliveries,
    vehicles,
    telemetry,
    grievances,
    activeRole,
    setActiveRole,
    updateOrderStatus,
  } = useSandMining();

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>("ORD-CG-2026-8801");
  const [searchType, setSearchType] = useState<SearchCriteriaType>("all");

  // Selected Order
  const [selectedOrderId, setSelectedOrderId] = useState<string>("ORD-CG-2026-8801");

  // Modals state
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState<boolean>(false);
  const [isRemarksModalOpen, setIsRemarksModalOpen] = useState<boolean>(false);
  const [isEscalationModalOpen, setIsEscalationModalOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);

  // Filter matching bookings
  const filteredBookings = useMemo(() => {
    if (!searchQuery.trim()) return bookings;
    const q = searchQuery.trim().toLowerCase();

    return bookings.filter((b) => {
      const matchOrderId = b.orderId.toLowerCase().includes(q) || b.id.toLowerCase().includes(q);
      const matchMobile = b.customerMobile.replace(/\D/g, "").includes(q.replace(/\D/g, ""));
      const matchVehicle = (b.assignedVehicleNumber || "").toLowerCase().includes(q);
      const matchCustomer = b.customerName.toLowerCase().includes(q);

      if (searchType === "orderId") return matchOrderId;
      if (searchType === "mobileNumber") return matchMobile;
      if (searchType === "vehicleNumber") return matchVehicle;
      return matchOrderId || matchMobile || matchVehicle || matchCustomer;
    });
  }, [bookings, searchQuery, searchType]);

  // Active Selected Booking
  const activeBooking: SandBooking = useMemo(() => {
    return (
      bookings.find((b) => b.orderId === selectedOrderId || b.id === selectedOrderId) ||
      filteredBookings[0] ||
      bookings[0]
    );
  }, [bookings, selectedOrderId, filteredBookings]);

  // Associated records for active booking
  const activeDelivery: DeliveryConfirmation | undefined = useMemo(() => {
    return deliveries.find(
      (d) => d.bookingId === activeBooking.id || d.bookingId === activeBooking.orderId
    );
  }, [deliveries, activeBooking]);

  const activeVehicle: Vehicle | undefined = useMemo(() => {
    return vehicles.find(
      (v) => v.vehicleNumber === activeBooking.assignedVehicleNumber || (activeDelivery && v.vehicleNumber === activeDelivery.vehicleNumber)
    );
  }, [vehicles, activeBooking, activeDelivery]);

  const activeTelemetry: VehicleTelemetry | undefined = useMemo(() => {
    return telemetry.find(
      (t) => t.vehicleNumber === activeBooking.assignedVehicleNumber || (activeDelivery && t.vehicleNumber === activeDelivery.vehicleNumber)
    );
  }, [telemetry, activeBooking, activeDelivery]);

  const activeComplaints: GrievanceTicket[] = useMemo(() => {
    return grievances.filter(
      (g) =>
        g.bookingOrderId === activeBooking.orderId ||
        g.bookingOrderId === activeBooking.id ||
        (g.customerMobile && g.customerMobile === activeBooking.customerMobile)
    );
  }, [grievances, activeBooking]);

  // Check if role is strictly Call Centre
  const isCallCentreRole = activeRole === "Call Centre";

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-200">
      {/* ── TOP TELEPHONY & CALL CENTRE BRANDING HEADER ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 text-slate-900 dark:text-white border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="size-13 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-xl border border-orange-200 dark:border-orange-800/60 shrink-0">
            <Headset size={26} />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                Call Centre – Delivery Updation & Citizen Tele-Desk
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                Toll-Free: 1800-233-SAND
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2">
              <span>Integrated Citizen Grievance, Live Telematics Enquiry & Transit Delay Escalation Console</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-medium flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Inbound Lines Healthy
              </span>
            </p>
          </div>
        </div>

        {/* Quick Role Elevation Switcher */}
        <div className="flex flex-wrap items-center gap-3 self-end md:self-center">
          <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-1.5 flex items-center gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] pl-1.5 font-medium">Active Operating Role:</span>
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value as UserRole)}
              className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 shadow-2xs"
            >
              <option value="Call Centre">Call Centre Operator (Restricted)</option>
              <option value="Super Admin">Super Admin (Full Administrative Override)</option>
              <option value="District Mining Officer">District Mining Officer</option>
              <option value="Enforcement Officer">Enforcement Officer</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── CALL CENTRE KPI TELEPHONY METRICS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase">
            <span>Inbound Calls Today</span>
            <PhoneCall size={14} className="text-orange-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">142</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">98.2% Answered &lt; 15s</div>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase">
            <span>Active En Route</span>
            <Truck size={14} className="text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {deliveries.filter((d) => d.status === "Pending OTP").length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Consignments in Transit</div>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase">
            <span>Active Escalations</span>
            <AlertCircle size={14} className="text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {grievances.filter((g) => g.status === "Escalated to District Collector" || g.priority === "Urgent").length}
          </div>
          <div className="text-[10px] text-rose-600 font-semibold mt-0.5">Under Immediate Review</div>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase">
            <span>Average Resolution</span>
            <Clock size={14} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">2.4m</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Avg Inquiry Duration</div>
        </div>
      </div>

      {/* ── 1. FAST OMNISEARCH CONSOLE ── */}
      <CallCentreSearchConsole
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchType={searchType}
        onSearchTypeChange={setSearchType}
        onQuickSelect={(val, type) => {
          setSearchQuery(val);
          setSearchType(type);
          const target = bookings.find(
            (b) =>
              b.orderId === val ||
              b.id === val ||
              b.customerMobile.includes(val) ||
              b.assignedVehicleNumber === val
          );
          if (target) setSelectedOrderId(target.orderId);
        }}
        totalResults={filteredBookings.length}
      />

      {/* ── SEARCH RESULTS BAR (IF MULTIPLE MATCHES) ── */}
      {filteredBookings.length > 1 && (
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-400 font-bold uppercase text-[10px] shrink-0 pl-1">
            Matching Orders ({filteredBookings.length}):
          </span>
          {filteredBookings.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setSelectedOrderId(b.orderId)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all shrink-0 ${
                selectedOrderId === b.orderId
                  ? "bg-orange-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-orange-400"
              }`}
            >
              {b.orderId} • {b.customerName} ({b.assignedVehicleNumber || "Vehicle"})
            </button>
          ))}
        </div>
      )}

      {/* ── 2. CONSIGNMENT 360° DOSSIER & SECURITY MATRIX ── */}
      <CallCentreConsignmentDossier
        booking={activeBooking}
        delivery={activeDelivery}
        vehicle={activeVehicle}
        telemetry={activeTelemetry}
        complaints={activeComplaints}
        isCallCentreRole={isCallCentreRole}
        onOpenComplaintModal={() => setIsComplaintModalOpen(true)}
        onOpenRemarksModal={() => setIsRemarksModalOpen(true)}
        onOpenEscalationModal={() => setIsEscalationModalOpen(true)}
        onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
        onUpdateStatus={(newStatus, reason) => {
          updateOrderStatus(
            activeBooking.id,
            newStatus,
            reason,
            isCallCentreRole ? "call_centre" : "admin"
          );
        }}
      />

      {/* ── MODAL 1: REGISTER CUSTOMER COMPLAINT ── */}
      {isComplaintModalOpen && (
        <CallCentreComplaintModal
          isOpen={isComplaintModalOpen}
          onClose={() => setIsComplaintModalOpen(false)}
          booking={activeBooking}
        />
      )}

      {/* ── MODAL 2: UPDATE PERMITTED DELIVERY REMARKS ── */}
      {isRemarksModalOpen && (
        <CallCentreRemarksModal
          isOpen={isRemarksModalOpen}
          onClose={() => setIsRemarksModalOpen(false)}
          booking={activeBooking}
          delivery={activeDelivery}
        />
      )}

      {/* ── MODAL 3: ESCALATE DELAYED DELIVERY ── */}
      {isEscalationModalOpen && (
        <CallCentreEscalationModal
          isOpen={isEscalationModalOpen}
          onClose={() => setIsEscalationModalOpen(false)}
          booking={activeBooking}
        />
      )}

      {/* ── MODAL 4: VIEW PREVIOUS COMPLAINTS ── */}
      {isHistoryModalOpen && (
        <CallCentreComplaintHistory
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          complaints={activeComplaints}
          customerName={activeBooking.customerName}
          orderId={activeBooking.orderId}
        />
      )}
    </div>
  );
};

export default CallCentreDeliveryView;
