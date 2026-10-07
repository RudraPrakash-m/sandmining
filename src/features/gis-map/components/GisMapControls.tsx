import React from "react";
import {
  Plus,
  Minus,
  Crosshair,
  Maximize2,
  Minimize2,
  Map,
  Globe,
} from "lucide-react";

export interface GisMapControlsProps {
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  className?: string;
}

export const GisMapControls: React.FC<GisMapControlsProps> = ({
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onReset,
  isFullscreen,
  onToggleFullscreen,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center bg-white dark:bg-gray-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-lg p-1.5 gap-1 select-none ${className}`}
    >
      <button
        type="button"
        onClick={onZoomIn}
        title="Zoom In"
        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        aria-label="Zoom In"
      >
        <Plus size={16} />
      </button>

      <button
        type="button"
        onClick={onZoomOut}
        title="Zoom Out"
        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        aria-label="Zoom Out"
      >
        <Minus size={16} />
      </button>

      <button
        type="button"
        onClick={onReset}
        title="Locate & Center"
        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        aria-label="Locate Center"
      >
        <Crosshair size={16} />
      </button>

      <button
        type="button"
        onClick={onToggleFullscreen}
        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Map"}
        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        aria-label="Toggle Fullscreen"
      >
        {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
      </button>

      <div className="w-5 h-px bg-slate-200 dark:bg-slate-800 my-1" />

      <button
        type="button"
        title="Map Style"
        className="w-8 h-8 rounded-xl flex items-center justify-center text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
        aria-label="Map Style"
      >
        <Map size={15} />
      </button>

      <button
        type="button"
        title="Terrain Mode"
        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        aria-label="Terrain Mode"
      >
        <Globe size={15} />
      </button>
    </div>
  );
};
