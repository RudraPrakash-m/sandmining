import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LifeBuoy,
  ArrowLeft,
  Paperclip,
  Clock,
  ShieldCheck,
  User,
  Phone,
  MapPin,
  Tag,
  Headphones,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import Card from "@/shared/components/layout/Card/Card";
import Button from "@/shared/components/ui/Button";
import Badge from "@/shared/components/ui/Badge";
import { useStatusModal } from "@/config/theme/StatusModalContext";
import { routes } from "@/app/routes/routeConfig";
import { inputBase, inputNormal } from "@/shared/components/ui/Forms/inputStyles";
import type { GrievanceCategory, GrievancePriority } from "../types";
import { COMPLAINT_CATEGORIES, COMPLAINT_STAGES } from "../types";

export const RaiseGrievanceTicket: React.FC = () => {
  const { raiseGrievance, bookings } = useSandMining();
  const { showSuccess, showError } = useStatusModal();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    ticketId: `GRV-2026-5${Math.floor(Math.random() * 900) + 100}`,
    customerName: "A. Narayana Murthy",
    customerMobile: "+91 98491 12345",
    category: "Delivery Delay" as GrievanceCategory,
    intakeChannel: "Customer Portal" as "Customer Portal" | "Citizen Mobile App" | "Toll-Free 1800 Call Centre" | "Officer Desk",
    bookingOrderId: bookings[0]?.orderId || "SMMS-ORD-2026-8801",
    description: "Trip was dispatched at 10:20 AM but vehicle has stopped outside designated route. Customer waiting at site with unloading labor.",
    location: "Raipur Urban (Tatibandh)",
    priority: "High" as GrievancePriority,
    assignedOfficer: "G. Vijaya Kumar (Transport Cell)",
    slaRemainingHours: 24,
    attachmentUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80",
    attachmentName: "transit_delay_evidence.pdf",
  });

  const handlePriorityChange = (priority: GrievancePriority) => {
    let sla = 48;
    if (priority === "Urgent") sla = 12;
    else if (priority === "High") sla = 24;
    else if (priority === "Medium") sla = 48;
    else if (priority === "Low") sla = 72;

    setFormData({
      ...formData,
      priority,
      slaRemainingHours: sla,
    });
  };

  const handleFileSimulate = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        attachmentName: file.name,
        attachmentUrl: URL.createObjectURL(file),
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.description.trim() || !formData.location.trim()) {
      showError("Please enter all required grievance fields.");
      return;
    }

    const created = raiseGrievance(formData);
    showSuccess(
      `Grievance Ticket ${created.ticketId} successfully registered! Routed through the 7-stage statutory lifecycle with ${formData.slaRemainingHours}h SLA guarantee.`
    );
    navigate(routes.grievance.path);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            icon={<ArrowLeft size={15} />}
            onClick={() => navigate(routes.grievance.path)}
          >
            Back to Grievances
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <LifeBuoy size={20} className="text-primary" />
              Register Citizen Complaint / Grievance Ticket
            </h1>
            <p className="text-xs text-gray-500">
              Statutory 7-Stage Public Service Guarantee: Customer → Complaint Registration → Call Centre/Officer → Assigned → Action Taken → Resolved → Customer Confirmation
            </p>
          </div>
        </div>
      </div>

      {/* 7-Stage Visual Lifecycle Banner */}
      <div className="p-4 bg-gradient-to-r from-amber-500/10 via-sky-500/10 to-emerald-500/10 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-2">
          <Clock size={14} className="text-primary" />
          Statutory 7-Stage Complaint Resolution Lifecycle
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {Object.values(COMPLAINT_STAGES).map((stg) => (
            <div
              key={stg.stageNumber}
              className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between ${
                stg.stageNumber === 2
                  ? "bg-amber-500/15 border-amber-500 text-amber-900 dark:text-amber-200 font-bold ring-1 ring-amber-500"
                  : "bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-black text-[10px] opacity-70">STAGE {stg.stageNumber}</span>
                {stg.stageNumber === 2 && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-500 text-white rounded">
                    Active Step
                  </span>
                )}
              </div>
              <div className="font-bold text-slate-900 dark:text-white text-[11px] truncate">{stg.name}</div>
              <div className="text-[10px] text-slate-500 truncate mt-0.5">{stg.actorRole}</div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card
          title="Citizen Complaint Intake Form"
          subtitle="All complaints receive statutory SMS tracking token, SLA escalation timer, and multi-tier verification"
          action={
            <Button action="save" type="submit">
              Register Grievance Ticket
            </Button>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            {/* System Generated Ticket ID */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Ticket ID (Auto-Generated)
              </label>
              <input
                type="text"
                value={formData.ticketId}
                disabled
                className={`${inputBase} bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed font-mono font-semibold`}
              />
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                <User size={13} className="text-gray-400" />
                Complainant Full Name *
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="Enter complainant name"
                className={`${inputBase} ${inputNormal}`}
                required
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                <Phone size={13} className="text-gray-400" />
                Mobile Number (for SMS & Handover OTP) *
              </label>
              <input
                type="tel"
                value={formData.customerMobile}
                onChange={(e) => setFormData({ ...formData, customerMobile: e.target.value })}
                placeholder="+91 98491 12345"
                className={`${inputBase} ${inputNormal}`}
                required
              />
            </div>

            {/* Category - 9 Statutory Categories */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                <Tag size={13} className="text-primary" />
                Complaint Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as GrievanceCategory })}
                className={`${inputBase} ${inputNormal} font-semibold`}
              >
                {COMPLAINT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Intake Channel */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                <Headphones size={13} className="text-sky-500" />
                Complaint Intake Channel *
              </label>
              <select
                value={formData.intakeChannel}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    intakeChannel: e.target.value as typeof formData.intakeChannel,
                  })
                }
                className={`${inputBase} ${inputNormal}`}
              >
                <option value="Customer Portal">Customer Web Portal</option>
                <option value="Citizen Mobile App">Citizen Mobile App (Android/iOS)</option>
                <option value="Toll-Free 1800 Call Centre">Toll-Free 1800 Helpline Desk</option>
                <option value="Officer Desk">District Sand Officer In-Person Desk</option>
              </select>
            </div>

            {/* Related Booking / Order ID */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Related Order / Booking Ref *
              </label>
              <select
                value={formData.bookingOrderId}
                onChange={(e) => setFormData({ ...formData, bookingOrderId: e.target.value })}
                className={`${inputBase} ${inputNormal}`}
              >
                {bookings.map((b) => (
                  <option key={b.id} value={b.orderId}>
                    {b.orderId} – {b.customerName} ({b.quantityMt} MT)
                  </option>
                ))}
                <option value="GENERAL_INQUIRY">None / General Sand Supply Inquiry</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                <MapPin size={13} className="text-gray-400" />
                Incident Location / District *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Raipur Urban, Durg, Bilaspur"
                className={`${inputBase} ${inputNormal}`}
                required
              />
            </div>

            {/* Priority & SLA Guarantee */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                <Clock size={13} className="text-gray-400" />
                Priority & Statutory SLA Guarantee *
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handlePriorityChange(e.target.value as GrievancePriority)}
                className={`${inputBase} ${inputNormal}`}
              >
                <option value="Urgent">Urgent (12 Hours SLA Escalation)</option>
                <option value="High">High (24 Hours SLA Escalation)</option>
                <option value="Medium">Medium (48 Hours SLA Escalation)</option>
                <option value="Low">Low (72 Hours SLA Escalation)</option>
              </select>
            </div>

            {/* Initial Assigned Officer */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                <ShieldCheck size={13} className="text-gray-400" />
                Assigned Desk / Officer
              </label>
              <input
                type="text"
                value={formData.assignedOfficer}
                onChange={(e) => setFormData({ ...formData, assignedOfficer: e.target.value })}
                className={`${inputBase} ${inputNormal}`}
              />
            </div>

            {/* File Attachment Upload */}
            <div className="sm:col-span-2 md:col-span-3">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                <Paperclip size={13} className="text-gray-400" />
                Attachment Evidence (Weighbridge Slip / Quality Photo / GPS Snapshot)
              </label>
              <input
                type="file"
                onChange={handleFileSimulate}
                className="block w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
              {formData.attachmentName && (
                <p className="text-[11px] text-emerald-600 mt-1 truncate">
                  Attached: {formData.attachmentName}
                </p>
              )}
            </div>

            {/* Detailed Description */}
            <div className="sm:col-span-2 md:col-span-3">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Complaint Statement & Detailed Facts *
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide detailed description of the complaint: vehicle location, tare weight shortfall, driver demands, silt percentage, payment UTR..."
                className={`${inputBase} ${inputNormal}`}
                required
              />
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default RaiseGrievanceTicket;
