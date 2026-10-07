import React, { useState } from "react";
import { MessageSquare, AlertCircle, ShieldCheck, Check } from "lucide-react";
import type { SandBooking, GrievanceCategory, GrievancePriority } from "@/features/shared-simulation/types";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import Modal, { ModalFooter } from "@/shared/components/ui/Modal/Modal";
import Button from "@/shared/components/ui/Button";
import { useStatusModal } from "@/config/theme/StatusModalContext";
import { inputBase, inputNormal } from "@/shared/components/ui/Forms/inputStyles";

export interface CallCentreComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: SandBooking;
}

export const CallCentreComplaintModal: React.FC<CallCentreComplaintModalProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  const { raiseGrievance } = useSandMining();
  const { showSuccess, showError } = useStatusModal();

  const [category, setCategory] = useState<GrievanceCategory>("Delayed Delivery");
  const [priority, setPriority] = useState<GrievancePriority>("High");
  const [description, setDescription] = useState<string>(
    "Customer called stating delivery vehicle has not arrived within the estimated arrival window. Requesting immediate route telemetry update."
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      showError("Please enter complaint description provided by the customer.");
      return;
    }

    const slaHours = priority === "Urgent" ? 2 : priority === "High" ? 4 : 8;

    raiseGrievance({
      ticketId: `GRV-CC-${Date.now().toString().slice(-5)}`,
      customerName: booking.customerName,
      customerMobile: booking.customerMobile,
      category,
      bookingOrderId: booking.orderId,
      description: description.trim(),
      location: booking.destinationAddress || booking.deliveryLocation || "Raipur District",
      priority,
      assignedOfficer: "District Sand Grievance Cell",
      slaRemainingHours: slaHours,
      intakeChannel: "Toll-Free 1800 Call Centre",
      status: "Call Centre Review",
      stage: 3,
      stageName: "Call Centre/Officer",
    });

    showSuccess(`Customer complaint ticket registered successfully with ${slaHours}h SLA.`);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register Customer Complaint / Inbound Ticket"
      subtitle={`Lodging official grievance linked to Order ${booking.orderId}`}
      size="md"
      footer={null}
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1 text-xs">
        <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-950 dark:text-rose-200 space-y-1">
          <span className="font-bold flex items-center gap-1.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle size={14} /> Citizen Toll-Free Desk Intimation:
          </span>
          <p className="text-[11px] text-rose-800 dark:text-rose-300">
            Tickets are routed to the District Sand Officer with strict government SLA tracking.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
              Complaint Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as GrievanceCategory)}
              className={`${inputBase} ${inputNormal} text-xs font-semibold`}
            >
              <option value="Delivery Delay">Delivery Delay (Vehicle Late)</option>
              <option value="Vehicle Not Arrived">Vehicle Not Arrived</option>
              <option value="Wrong Quantity">Wrong Quantity / Weighbridge Shortage</option>
              <option value="Payment Issue">Payment Issue / Double Debit</option>
              <option value="Vehicle/Driver Issue">Vehicle/Driver Issue / Misbehavior</option>
              <option value="Sand Quality Issue">Sand Quality Issue / Clay Silt Excess</option>
              <option value="Booking Issue">Booking Issue / Quota Tariff</option>
              <option value="OTP Issue">OTP Issue / Delivery Handover Token</option>
              <option value="Other">Other / Form-VIII & General Inquiry</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
              Complaint Priority / SLA *
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as GrievancePriority)}
              className={`${inputBase} ${inputNormal} text-xs font-semibold`}
            >
              <option value="Urgent">Urgent (2 Hours SLA Response)</option>
              <option value="High">High (4 Hours SLA Response)</option>
              <option value="Medium">Medium (8 Hours SLA Response)</option>
              <option value="Low">Low (24 Hours SLA Response)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
            Customer Statement / Issue Description *
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${inputBase} ${inputNormal} text-xs`}
            placeholder="Record the exact issue reported by the citizen..."
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            type="submit"
            icon={<Check size={14} />}
            className="font-bold"
          >
            Submit Complaint Ticket
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CallCentreComplaintModal;
