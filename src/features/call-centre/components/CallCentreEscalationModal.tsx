import React, { useState } from "react";
import { PhoneForwarded, AlertTriangle, ShieldAlert, Check } from "lucide-react";
import type { SandBooking } from "@/features/shared-simulation/types";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import Modal from "@/shared/components/ui/Modal/Modal";
import Button from "@/shared/components/ui/Button";
import { useStatusModal } from "@/config/theme/StatusModalContext";
import { inputBase, inputNormal } from "@/shared/components/ui/Forms/inputStyles";

export interface CallCentreEscalationModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: SandBooking;
}

export const CallCentreEscalationModal: React.FC<CallCentreEscalationModalProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  const { raiseGrievance, createAlert } = useSandMining();
  const { showSuccess, showError } = useStatusModal();

  const [escalationTarget, setEscalationTarget] = useState<string>("District Mining Officer (DMO)");
  const [urgencyReason, setUrgencyReason] = useState<string>(
    "Vehicle delayed by over 4 hours beyond statutory transit pass validity. Telematics shows stationary status outside authorized stockyard route."
  );
  const [flagEnforcementSquad, setFlagEnforcementSquad] = useState<boolean>(true);

  const handleEscalate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urgencyReason.trim()) {
      showError("Please explain reason for emergency escalation.");
      return;
    }

    // 1. Raise / Escalate formal grievance
    raiseGrievance({
      ticketId: `ESC-DMO-${Date.now().toString().slice(-4)}`,
      customerName: booking.customerName,
      customerMobile: booking.customerMobile,
      category: "Delayed Delivery",
      bookingOrderId: booking.orderId,
      description: `[ESCALATED TO ${escalationTarget}] ${urgencyReason.trim()}`,
      location: booking.destinationAddress || "Raipur Corridor",
      priority: "Urgent",
      assignedOfficer: escalationTarget,
      slaRemainingHours: 2,
      status: "Escalated to District Collector",
      escalationLevel: escalationTarget,
      escalationReason: urgencyReason.trim(),
    });

    // 2. If flagged, dispatch alert to enforcement
    if (flagEnforcementSquad) {
      createAlert({
        alertId: `ALT-ESC-${Date.now().toString().slice(-4)}`,
        location: booking.destinationAddress || "Raipur District Corridor",
        vehicleNumber: booking.assignedVehicleNumber || "CG-04-TX-2341",
        alertType: "Route Deviation",
        dateTime: new Date().toISOString().replace("T", " ").substring(0, 16),
        evidencePhotoUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb180c5f7?w=600&auto=format&fit=crop&q=80",
        assignedOfficer: "Flying Squad Raipur Unit",
        severity: "Critical",
        actionStatus: "New Alert",
        caseNotes: `Call Centre Emergency Escalation: Transit delay on Order ${booking.orderId} (Vehicle ${booking.assignedVehicleNumber}). Caller reported extended halt.`,
      });
    }

    showSuccess(`🚨 Urgent Escalation Dispatched to ${escalationTarget}! Flying squad notified.`);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Escalate Delayed Delivery (Emergency Dispatch)"
      subtitle={`Flag critical transit delay for Order ${booking.orderId}`}
      size="md"
      footer={null}
    >
      <form onSubmit={handleEscalate} className="space-y-4 pt-1 text-xs">
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-xl text-rose-950 dark:text-rose-200 space-y-1">
          <span className="font-bold flex items-center gap-1.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertTriangle size={15} /> High-Priority Administrative Escalation
          </span>
          <p className="text-[11px] text-rose-800 dark:text-rose-300">
            This action instantly triggers an administrative dispatch notification and sets the ticket SLA to <strong>2 Hours</strong>.
          </p>
        </div>

        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
            Escalation Authority *
          </label>
          <select
            value={escalationTarget}
            onChange={(e) => setEscalationTarget(e.target.value)}
            className={`${inputBase} ${inputNormal} text-xs font-semibold`}
          >
            <option value="District Mining Officer (DMO)">District Mining Officer (DMO) - Raipur</option>
            <option value="District Collector">District Collector / Magistrate Sand Grievance Cell</option>
            <option value="Enforcement Flying Squad">State Mining Flying Squad & Checkpost Nodal</option>
            <option value="State Sand Nodal Officer">State Sand Nodal Director (DGM Raipur)</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
            Urgency / Escalation Statement *
          </label>
          <textarea
            rows={3}
            value={urgencyReason}
            onChange={(e) => setUrgencyReason(e.target.value)}
            className={`${inputBase} ${inputNormal} text-xs`}
            placeholder="Specify reason for priority escalation..."
            required
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
          <input
            type="checkbox"
            checked={flagEnforcementSquad}
            onChange={(e) => setFlagEnforcementSquad(e.target.checked)}
            className="size-4 text-rose-600 rounded"
          />
          <div>
            <span className="font-bold text-slate-900 dark:text-white block">
              Flag GPS Route Deviation to Flying Squad
            </span>
            <span className="text-[11px] text-slate-500">
              Immediately alerts highway checkposts along the corridor.
            </span>
          </div>
        </label>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            type="submit"
            icon={<PhoneForwarded size={14} />}
            className="font-bold"
          >
            Dispatch Emergency Escalation
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CallCentreEscalationModal;
