import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "@/app/routes/routeConfig";
import {
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

export interface GisAlertHubOverlayProps {
  onSelectAlertCategory?: (category: string) => void;
  className?: string;
}

export const GisAlertHubOverlay: React.FC<GisAlertHubOverlayProps> = ({
  onSelectAlertCategory,
  className = "",
}) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);

  const alertCategories = [
    {
      id: "illegal",
      title: "Illegal Mining",
      count: 2,
      dotColor: "bg-red-500",
    },
    {
      id: "over-extraction",
      title: "Over-extraction",
      count: 1,
      dotColor: "bg-amber-500",
    },
    {
      id: "deviation",
      title: "Vehicle Deviation",
      count: 4,
      dotColor: "bg-yellow-400",
    },
  ];

  return (
    <div
      className={`bg-white dark:bg-gray-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-lg text-xs select-none w-64 transition-all ${className}`}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950/70 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle size={15} />
          </div>
          <span className="font-bold text-xs text-slate-900 dark:text-white">
            Exception & Alert Hub
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
            3
          </span>
          <button
            type="button"
            onClick={() => setIsExpanded((e) => !e)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* ── Alert Categories List ───────────────────────────── */}
      {isExpanded && (
        <div className="pt-2.5 space-y-2">
          {alertCategories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectAlertCategory && onSelectAlertCategory(cat.id)}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer text-xs"
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${cat.dotColor}`} />
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {cat.title}
                </span>
              </div>

              <div className="flex items-center gap-1 text-slate-400">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {cat.count}
                </span>
                <ChevronRight size={13} />
              </div>
            </div>
          ))}

          {/* Footer Link */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => navigate(routes.enforcement.path)}
              className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>View All Alerts</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
