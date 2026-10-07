import React, { useState } from "react";
import { FileText, Check, Phone, Info } from "lucide-react";
import type { SandBooking, DeliveryConfirmation } from "@/features/shared-simulation/types";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import Modal from "@/shared/components/ui/Modal/Modal";
import Button from "@/shared/components/ui/Button";
import { useStatusModal } from "@/config/theme/StatusModalContext";
import { inputBase, inputNormal } from "@/shared/components/ui/Forms/inputStyles";

export interface CallCentreRemarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: SandBooking;
  delivery?: DeliveryConfirmation;
}

export const CallCentreRemarksModal: React.FC<CallCentreRemarksModalProps> = ({
  isOpen,
  onClose,
  booking,
  delivery,
}) => {
  const { updateDeliveryRemarks } = useSandMining();
  const { showSuccess, showError } = useStatusModal();

  const [category, setCategory] = useState<string>("Landmark / Access Direction");
  const [remarksText, setRemarksText] = useState<string>(
    "Customer called: site gate key is with security guard; requested driver call 5 mins prior to unloading."
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remarksText.trim()) {
      showError("Please enter valid delivery remarks.");
      return;
    }

    const targetId = delivery?.id || booking.id;
    const fullNote = `[${category}] ${remarksText.trim()}`;
    updateDeliveryRemarks(targetId, fullNote, "Call Centre Executive");

    showSuccess("Permitted delivery remarks logged to consignment audit record.");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Permitted Delivery Remarks"
      subtitle={`Append operational remarks for Order ${booking.orderId} (Vehicle: ${booking.assignedVehicleNumber || "Assigned"})`}
      size="md"
      footer={null}
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1 text-xs">
        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-900 dark:text-blue-200 space-y-1">
          <span className="font-bold flex items-center gap-1.5 text-xs text-blue-700 dark:text-blue-300">
            <Info size={14} /> Permitted Operational Update:
          </span>
          <p className="text-[11px] text-blue-800 dark:text-blue-300">
            Remarks will be visible on the driver mobile dashboard and the dispatch delivery ledger. This action will not modify financial or volumetric records.
          </p>
        </div>

        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
            Remarks Classification *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`${inputBase} ${inputNormal} text-xs font-semibold`}
          >
            <option value="Landmark / Access Direction">Landmark / Access Direction (Road/Gate info)</option>
            <option value="Consignee Time Preference">Consignee Timing Preference (Call before arrival)</option>
            <option value="Site Contact Delegation">Site Contact Delegation (Alternative phone number)</option>
            <option value="Unloading Bay Instructions">Unloading Bay Instructions (Rear yard / front dump)</option>
            <option value="General Call Center Query">General Citizen Inquiry Note</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
            Delivery Officer / Driver Instructions *
          </label>
          <textarea
            rows={3}
            value={remarksText}
            onChange={(e) => setRemarksText(e.target.value)}
            className={`${inputBase} ${inputNormal} text-xs`}
            placeholder="Type instructions conveyed by the consignee..."
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            icon={<Check size={14} />}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
          >
            Save Remarks to Order
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CallCentreRemarksModal;
