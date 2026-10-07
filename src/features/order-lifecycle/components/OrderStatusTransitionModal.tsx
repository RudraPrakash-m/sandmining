import React, { useState } from "react";
import {
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  FileText,
  User,
  X,
} from "lucide-react";
import type { OrderStatus, SandBooking } from "@/features/shared-simulation/types";
import {
  getOrderStatusMetadata,
  getNextAvailableStatuses,
  ORDER_LIFECYCLE_SEQUENCE,
  EXCEPTION_STATUSES,
  normalizeOrderStatus,
} from "../services/orderStatusEngine";
import { OrderStatusBadge } from "./OrderStatusBadge";
import Modal, { ModalFooter } from "@/shared/components/ui/Modal/Modal";
import Button from "@/shared/components/ui/Button";
import { useStatusModal } from "@/config/theme/StatusModalContext";

interface OrderStatusTransitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: SandBooking;
  onConfirmTransition: (newStatus: OrderStatus, reason?: string) => void;
}

export const OrderStatusTransitionModal: React.FC<OrderStatusTransitionModalProps> = ({
  isOpen,
  onClose,
  booking,
  onConfirmTransition,
}) => {
  const { showSuccess, showError } = useStatusModal();
  const currentCanonical = normalizeOrderStatus(booking.bookingStatus);
  const currentMeta = getOrderStatusMetadata(currentCanonical);
  const allowedNext = getNextAvailableStatuses(currentCanonical);

  const [selectedTarget, setSelectedTarget] = useState<OrderStatus | "">(
    allowedNext[0] || ""
  );
  const [transitionNotes, setTransitionNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTarget) {
      showError("Please select a target status to proceed.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onConfirmTransition(selectedTarget as OrderStatus, transitionNotes);
      showSuccess(`Order ${booking.orderId} successfully transitioned to "${selectedTarget}"!`);
      setIsSubmitting(false);
      onClose();
    }, 300);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order Status Transition Engine - ${booking.orderId}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Order Dossier Summary Strip */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Order ID</span>
            <p className="font-mono font-bold text-sm text-primary dark:text-sky-400">
              {booking.orderId}
            </p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Citizen / Consumer</span>
            <p className="font-bold text-slate-800 dark:text-slate-200">
              {booking.customerName} ({booking.customerMobile})
            </p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Payload / Reach</span>
            <p className="font-medium text-slate-700 dark:text-slate-300">
              {booking.quantityMt} MT • {booking.sourceStockyardName}
            </p>
          </div>
        </div>

        {/* Current State Indicator */}
        <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Current Active Status
            </span>
            <div className="mt-1">
              <OrderStatusBadge status={currentCanonical} size="lg" />
            </div>
          </div>
          <ArrowRight size={20} className="text-slate-400 shrink-0" />
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Target State
            </span>
            <div className="mt-1">
              {selectedTarget ? (
                <OrderStatusBadge status={selectedTarget} size="lg" />
              ) : (
                <span className="text-slate-400 italic">Select next state</span>
              )}
            </div>
          </div>
        </div>

        {/* Allowed Finite State Machine Next Transitions */}
        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
            Recommended Next Step (per Telangana SSMMS Standard Engine):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {allowedNext.map((targetStatus) => {
              const meta = getOrderStatusMetadata(targetStatus);
              const isSelected = selectedTarget === targetStatus;

              return (
                <div
                  key={targetStatus}
                  onClick={() => setSelectedTarget(targetStatus as OrderStatus)}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? "ring-2 ring-primary border-primary bg-primary/5 shadow-xs"
                      : "hover:bg-slate-50 dark:hover:bg-gray-800 border-slate-200 dark:border-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <OrderStatusBadge status={targetStatus} size="sm" />
                    {meta.isException && (
                      <span className="text-[9px] font-bold text-red-600 dark:text-red-400">
                        Exception
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                    {meta.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* All Other Standard Stages (Override / Manual Administrative advance) */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Manual Override (Select any stage in the 18-step pipeline or exception):
          </label>
          <select
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value as OrderStatus)}
            className="w-full text-xs bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-lg p-2 text-slate-800 dark:text-slate-200"
          >
            <optgroup label="Standard Sequential Stages (1 to 18)">
              {ORDER_LIFECYCLE_SEQUENCE.map((s, idx) => (
                <option key={s} value={s}>
                  Step {idx + 1}: {s}
                </option>
              ))}
            </optgroup>
            <optgroup label="Standard Exception Statuses">
              {EXCEPTION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  [Exception] {s}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Transition Reason / Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
            Transition Remarks & Audit Notes:
          </label>
          <textarea
            rows={2}
            value={transitionNotes}
            onChange={(e) => setTransitionNotes(e.target.value)}
            placeholder="E.g., Weighbridge slip WB-9051 verified, loaded with 10 MT sand..."
            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-primary"
          />
        </div>

        <ModalFooter>
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            disabled={!selectedTarget || isSubmitting}
            icon={isSubmitting ? <RotateCcw size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
          >
            Confirm & Transition Status
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
