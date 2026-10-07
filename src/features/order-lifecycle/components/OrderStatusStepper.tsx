import React from "react";
import {
  Check,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  PauseCircle,
  RotateCcw,
  AlertOctagon,
  ArrowRight,
  Info,
} from "lucide-react";
import type { OrderStatus, StandardOrderStatus, ExceptionOrderStatus } from "../types";
import {
  ORDER_LIFECYCLE_SEQUENCE,
  EXCEPTION_STATUSES,
  getOrderStatusMetadata,
  normalizeOrderStatus,
  getOrderProgressPercent,
} from "../services/orderStatusEngine";
import { OrderStatusBadge } from "./OrderStatusBadge";

interface OrderStatusStepperProps {
  currentStatus: OrderStatus | string;
  onSelectStatus?: (status: OrderStatus) => void;
  compact?: boolean;
}

export const OrderStatusStepper: React.FC<OrderStatusStepperProps> = ({
  currentStatus,
  onSelectStatus,
  compact = false,
}) => {
  const canonical = normalizeOrderStatus(currentStatus);
  const currentMeta = getOrderStatusMetadata(canonical);
  const progressPercent = getOrderProgressPercent(canonical);
  const currentStep = currentMeta.stepNumber; // null if exception

  // Phase groupings of the 18 steps
  const PHASES = [
    { title: "1. Booking", range: [1, 2], steps: ORDER_LIFECYCLE_SEQUENCE.slice(0, 2) },
    { title: "2. Payment", range: [3, 5], steps: ORDER_LIFECYCLE_SEQUENCE.slice(2, 5) },
    { title: "3. Allocation", range: [6, 8], steps: ORDER_LIFECYCLE_SEQUENCE.slice(5, 8) },
    { title: "4. Sand Reach", range: [9, 12], steps: ORDER_LIFECYCLE_SEQUENCE.slice(8, 12) },
    { title: "5. Transit", range: [13, 15], steps: ORDER_LIFECYCLE_SEQUENCE.slice(12, 15) },
    { title: "6. Delivery", range: [16, 18], steps: ORDER_LIFECYCLE_SEQUENCE.slice(15, 18) },
  ];

  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border-color dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
              Standard Order Status Lifecycle
            </span>
            <OrderStatusBadge status={canonical} size="md" />
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            {currentMeta.description}
          </p>
        </div>

        {/* Overall Completion Percentage */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">
              Lifecycle Progress
            </span>
            <span className="text-sm font-black text-slate-900 dark:text-white">
              {progressPercent}%
            </span>
          </div>
          <div className="w-24 sm:w-28 h-2.5 bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-gray-700">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                currentMeta.isException ? "bg-red-500" : "bg-emerald-500"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Exception Status Banner (if currently in an exception state) */}
      {currentMeta.isException && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-start justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" size={18} />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-red-900 dark:text-red-200">
                  Exception State Active: {currentMeta.label}
                </h4>
                <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-100">
                  REQUIRES ACTION
                </span>
              </div>
              <p className="text-[11px] text-red-700 dark:text-red-300 mt-0.5">
                {currentMeta.description} Standard sequential pipeline paused until exception is resolved.
              </p>
            </div>
          </div>

          {currentMeta.allowedNext.length > 0 && (
            <div className="text-right shrink-0">
              <span className="text-[10px] text-red-600 dark:text-red-400 font-bold block">
                Allowed Recovery:
              </span>
              <div className="flex items-center gap-1 mt-1 justify-end">
                {currentMeta.allowedNext.map((nextStatus) => (
                  <button
                    key={nextStatus}
                    type="button"
                    onClick={() => onSelectStatus?.(nextStatus)}
                    className="px-2 py-1 rounded bg-white dark:bg-gray-900 border border-red-300 dark:border-red-800 text-[10px] font-bold text-red-700 dark:text-red-300 hover:bg-red-100 cursor-pointer shadow-2xs"
                  >
                    Resume to {nextStatus}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 18 Sequential Stages - Phase Groups */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          {PHASES.map((phase) => {
            const isPhaseActive = currentStep !== null && currentStep >= phase.range[0] && currentStep <= phase.range[1];
            const isPhaseCompleted = currentStep !== null && currentStep > phase.range[1];

            return (
              <div
                key={phase.title}
                className={`p-2.5 rounded-xl border transition-all ${
                  isPhaseActive
                    ? "bg-primary/5 border-primary dark:border-primary/60 shadow-xs"
                    : isPhaseCompleted
                    ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40"
                    : "bg-slate-50/60 dark:bg-gray-800/40 border-slate-200 dark:border-gray-800"
                }`}
              >
                <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-black/5 dark:border-white/5">
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                    {phase.title}
                  </span>
                  {isPhaseCompleted ? (
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                  ) : isPhaseActive ? (
                    <span className="size-2 rounded-full bg-primary animate-ping" />
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  {phase.steps.map((stepStatus) => {
                    const stepMeta = getOrderStatusMetadata(stepStatus);
                    const stepNum = stepMeta.stepNumber!;
                    const isStepCurrent = canonical === stepStatus;
                    const isStepDone = currentStep !== null && currentStep > stepNum;
                    const isStepPending = currentStep === null || currentStep < stepNum;

                    return (
                      <div
                        key={stepStatus}
                        onClick={() => onSelectStatus?.(stepStatus)}
                        className={`p-1.5 rounded-lg text-xs flex items-center gap-2 transition-all cursor-pointer ${
                          isStepCurrent
                            ? "bg-primary text-white font-bold shadow-xs ring-1 ring-primary"
                            : isStepDone
                            ? "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-medium"
                            : "hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-500 dark:text-slate-400"
                        }`}
                        title={`${stepNum}. ${stepStatus} - Click to simulate transition`}
                      >
                        <span
                          className={`size-4.5 rounded-full flex items-center justify-center text-[9.5px] font-black shrink-0 ${
                            isStepCurrent
                              ? "bg-white text-primary"
                              : isStepDone
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-200 dark:bg-gray-700 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {isStepDone ? <Check size={10} /> : stepNum}
                        </span>
                        <span className="truncate text-[11px] leading-tight flex-1">
                          {stepStatus}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* 6 Exception Statuses Reference Strip */}
        <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-gray-800/40 border border-slate-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <AlertTriangle size={13} className="text-amber-500" />
              Standard Exception Statuses (Non-Sequential / Failure Handling):
            </span>
            <span className="text-[10px] text-slate-400">Click any exception status to inspect or simulate</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {EXCEPTION_STATUSES.map((exc) => {
              const excMeta = getOrderStatusMetadata(exc);
              const isActive = canonical === exc;

              return (
                <button
                  key={exc}
                  type="button"
                  onClick={() => onSelectStatus?.(exc)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? "ring-2 ring-red-500 scale-105 shadow-sm"
                      : "opacity-80 hover:opacity-100"
                  } ${excMeta.bgColor} ${excMeta.textColor} ${excMeta.borderColor}`}
                >
                  <span className="size-2 rounded-full" style={{ backgroundColor: excMeta.color }} />
                  {exc}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
