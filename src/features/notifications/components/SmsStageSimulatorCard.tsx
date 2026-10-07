import React, { useState } from "react";
import {
  Send,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Truck,
  CreditCard,
  FileText,
  KeyRound,
  ShieldCheck,
  UserCheck,
  PackageCheck,
  XCircle,
  Info,
} from "lucide-react";
import type { SmsStageKey } from "../types";
import { SMS_STAGES_CONFIG } from "../types";
import Card from "@/shared/components/layout/Card/Card";
import Button from "@/shared/components/ui/Button";
import Badge from "@/shared/components/ui/Badge";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import { useStatusModal } from "@/config/theme/StatusModalContext";

const STAGE_ICONS: Record<SmsStageKey, React.ComponentType<{ size?: number; className?: string }>> = {
  REGISTRATION_OTP: UserCheck,
  BOOKING_CONFIRMATION: FileText,
  PAYMENT_SUCCESS: CreditCard,
  ORDER_ID: FileText,
  VEHICLE_ALLOCATION: Truck,
  VEHICLE_NUMBER: Truck,
  DRIVER_DETAILS: UserCheck,
  DELIVERY_OTP: KeyRound,
  DELIVERY_CONFIRMATION: PackageCheck,
  CANCELLATION_FAILURE: XCircle,
};

interface SmsStageSimulatorCardProps {
  onStageTriggered?: (stage: SmsStageKey) => void;
  selectedOrderId?: string;
  onSelectOrder?: (orderId: string) => void;
}

export const SmsStageSimulatorCard: React.FC<SmsStageSimulatorCardProps> = ({
  onStageTriggered,
  selectedOrderId,
  onSelectOrder,
}) => {
  const { bookings, dispatchCustomerSms } = useSandMining();
  const { showSuccess, showError } = useStatusModal();

  const [targetOrderId, setTargetOrderId] = useState<string>(selectedOrderId || "SMMS-ORD-2026-8801");
  const [isSimulatingAll, setIsSimulatingAll] = useState(false);
  const [activeTriggerStage, setActiveTriggerStage] = useState<SmsStageKey | null>(null);

  // Available orders for simulation
  const availableOrders = bookings.slice(0, 5);

  const handleTriggerStage = (stage: SmsStageKey) => {
    setActiveTriggerStage(stage);
    const targetBooking = bookings.find((b) => b.orderId === targetOrderId || b.id === targetOrderId);

    try {
      const result = dispatchCustomerSms(stage, targetBooking?.id || targetOrderId, {
        orderId: targetBooking?.orderId || targetOrderId,
        recipientName: targetBooking?.customerName || "Narayana Sahu",
        recipientMobile: targetBooking?.customerMobile || "+91 98260 12345",
        quantityMt: targetBooking?.quantityMt || 10,
        stockyardName: targetBooking?.sourceStockyardName || "Raipur Central Sand Stockyard",
      });

      showSuccess(`Stage ${result.stageNumber}: ${result.stageName} SMS triggered successfully to ${result.recipientMobile}!`);
      onStageTriggered?.(stage);
    } catch (err: any) {
      showError(`Simulation failed: ${err.message || "Unknown error"}`);
    } finally {
      setTimeout(() => setActiveTriggerStage(null), 600);
    }
  };

  // Run all 10 stages sequentially in rapid demo mode
  const handleRunFullPipeline = async () => {
    setIsSimulatingAll(true);
    const stages: SmsStageKey[] = [
      "REGISTRATION_OTP",
      "BOOKING_CONFIRMATION",
      "PAYMENT_SUCCESS",
      "ORDER_ID",
      "VEHICLE_ALLOCATION",
      "VEHICLE_NUMBER",
      "DRIVER_DETAILS",
      "DELIVERY_OTP",
      "DELIVERY_CONFIRMATION",
    ];

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      setActiveTriggerStage(stage);
      dispatchCustomerSms(stage, targetOrderId);
      await new Promise((resolve) => setTimeout(resolve, 350));
    }

    setIsSimulatingAll(false);
    setActiveTriggerStage(null);
    showSuccess("All 9 Positive Lifecycle Customer SMS stages dispatched successfully!");
  };

  const stageList: SmsStageKey[] = [
    "REGISTRATION_OTP",
    "BOOKING_CONFIRMATION",
    "PAYMENT_SUCCESS",
    "ORDER_ID",
    "VEHICLE_ALLOCATION",
    "VEHICLE_NUMBER",
    "DRIVER_DETAILS",
    "DELIVERY_OTP",
    "DELIVERY_CONFIRMATION",
    "CANCELLATION_FAILURE",
  ];

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-border-color dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-black dark:text-white">
              10-Stage Telangana SSMMS Automated SMS Console
            </h3>
            <Badge variant="primary" size="sm">
              MANDATORY 10 STAGES
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Trigger individual customer SMS stages to verify DLT templates, gateway routing, and citizen phone experience.
          </p>
        </div>

        {/* Order Selector & Quick Full Pipeline Trigger */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <select
            value={targetOrderId}
            onChange={(e) => {
              setTargetOrderId(e.target.value);
              onSelectOrder?.(e.target.value);
            }}
            className="text-xs bg-slate-100 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 font-medium"
          >
            {availableOrders.map((b) => (
              <option key={b.orderId} value={b.orderId}>
                {b.orderId} ({b.customerName.split(" ")[0]} - {b.quantityMt} MT)
              </option>
            ))}
          </select>

          <Button
            size="sm"
            variant="primary"
            onClick={handleRunFullPipeline}
            disabled={isSimulatingAll}
            className="text-xs shadow-sm shrink-0"
          >
            <Sparkles size={14} className={isSimulatingAll ? "animate-spin" : ""} />
            {isSimulatingAll ? "Simulating..." : "Auto-Run Full Life Cycle"}
          </Button>
        </div>
      </div>

      {/* 10 Stage Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {stageList.map((stageKey) => {
          const config = SMS_STAGES_CONFIG[stageKey];
          const IconComponent = STAGE_ICONS[stageKey];
          const isTriggering = activeTriggerStage === stageKey;

          return (
            <div
              key={stageKey}
              className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${config.bgLight} ${
                isTriggering ? "ring-2 ring-primary scale-[1.02]" : "hover:border-slate-400 dark:hover:border-gray-600"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="size-6 rounded-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 flex items-center justify-center text-xs font-black text-slate-800 dark:text-slate-200">
                    {config.stageNumber}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                    {config.category.split(" ")[0]}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 mb-1">
                  <IconComponent size={14} className={config.textColor} />
                  <h4 className={`text-xs font-bold ${config.textColor}`}>
                    {config.name}
                  </h4>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-snug mb-3">
                  {config.description}
                </p>
              </div>

              <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                <span className="text-[9.5px] font-mono text-slate-400">
                  {config.dltTemplateId.slice(-6)}
                </span>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => handleTriggerStage(stageKey)}
                  disabled={isSimulatingAll}
                  className="text-[11px] font-semibold py-1 px-2.5 bg-white dark:bg-gray-900 shadow-2xs hover:bg-slate-50"
                >
                  <Send size={11} className="mr-1 text-primary" />
                  Trigger SMS
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
