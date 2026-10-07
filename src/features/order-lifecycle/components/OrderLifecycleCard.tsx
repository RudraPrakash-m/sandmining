import React, { useState } from "react";
import {
  Layers,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronRight,
} from "lucide-react";
import type { OrderStatus, SandBooking } from "@/features/shared-simulation/types";
import {
  getOrderStatusMetadata,
  getNextAvailableStatuses,
  normalizeOrderStatus,
} from "../services/orderStatusEngine";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderStatusStepper } from "./OrderStatusStepper";
import { OrderStatusTransitionModal } from "./OrderStatusTransitionModal";
import Card from "@/shared/components/layout/Card/Card";
import Button from "@/shared/components/ui/Button";

interface OrderLifecycleCardProps {
  booking: SandBooking;
  onUpdateStatus?: (newStatus: OrderStatus, reason?: string) => void;
  canAdvance?: boolean;
}

export const OrderLifecycleCard: React.FC<OrderLifecycleCardProps> = ({
  booking,
  onUpdateStatus,
  canAdvance = true,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const canonical = normalizeOrderStatus(booking.bookingStatus);
  const meta = getOrderStatusMetadata(canonical);
  const nextStatuses = getNextAvailableStatuses(canonical);

  const handleQuickNext = (nextStatus: OrderStatus) => {
    onUpdateStatus?.(nextStatus, `Transitioned via Standard Lifecycle Engine to ${nextStatus}`);
  };

  return (
    <Card className="p-4 sm:p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-border-color dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="size-8.5 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Layers size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-black dark:text-white flex items-center gap-2">
              Order Status Lifecycle Engine
              <OrderStatusBadge status={canonical} size="sm" />
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Standard 18-step sequential pipeline with automated finite-state machine (FSM) validation.
            </p>
          </div>
        </div>

        {canAdvance && (
          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            {nextStatuses.length > 0 && !meta.isException && (
              <Button
                size="xs"
                variant="primary"
                onClick={() => handleQuickNext(nextStatuses[0])}
                className="text-xs shadow-2xs"
              >
                Advance to {nextStatuses[0]}
                <ArrowRight size={12} className="ml-1" />
              </Button>
            )}

            <Button
              size="xs"
              variant="outline"
              onClick={() => setIsModalOpen(true)}
              className="text-xs"
            >
              Transition Engine...
            </Button>
          </div>
        )}
      </div>

      {/* Stepper View */}
      <OrderStatusStepper
        currentStatus={canonical}
        onSelectStatus={(status) => {
          if (canAdvance) {
            onUpdateStatus?.(status, `Manual simulation transition to ${status}`);
          }
        }}
      />

      {/* Modal */}
      {isModalOpen && (
        <OrderStatusTransitionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          booking={booking}
          onConfirmTransition={(newStatus, reason) => {
            onUpdateStatus?.(newStatus, reason);
          }}
        />
      )}
    </Card>
  );
};
