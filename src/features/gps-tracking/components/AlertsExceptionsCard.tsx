import React from "react";
import { Bell, AlertTriangle, AlertCircle, Info } from "lucide-react";
import type { TelematicsAlert } from "../types/telematics.types";

export interface AlertsExceptionsCardProps {
  alerts: TelematicsAlert[];
  onSelectAlert?: (a: TelematicsAlert) => void;
  className?: string;
}

export const AlertsExceptionsCard: React.FC<AlertsExceptionsCardProps> = ({
  alerts,
  onSelectAlert,
  className = "",
}) => {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle size={15} className="text-rose-600 dark:text-rose-400 shrink-0" />;
      case "warning":
        return <AlertCircle size={15} className="text-amber-600 dark:text-amber-400 shrink-0" />;
      default:
        return <Info size={15} className="text-blue-600 dark:text-blue-400 shrink-0" />;
    }
  };

  const getTagBadge = (tag: string, severity: string) => {
    switch (severity) {
      case "critical":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            {tag}
          </span>
        );
      case "warning":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            {tag}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            {tag}
          </span>
        );
    }
  };

  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-2xl border border-border-color shadow-2xs overflow-hidden flex flex-col ${className}`}
    >
      {/* ── Card Header ── */}
      <div className="p-3.5 border-b border-border-color flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-rose-600 dark:text-rose-400" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Alerts & Exceptions
          </h2>
        </div>
        <button
          type="button"
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* ── Alerts List ── */}
      <div className="divide-y divide-border-color">
        {alerts.map((a) => (
          <div
            key={a.id}
            onClick={() => onSelectAlert && onSelectAlert(a)}
            className="p-3.5 hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 min-w-0">
                {getSeverityIcon(a.severity)}
                <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                  {a.vehicleNumber}
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-400 font-mono shrink-0">
                {a.time}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 pl-6">
              {a.title}
            </p>

            <div className="pl-6">
              {getTagBadge(a.tag, a.severity)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
