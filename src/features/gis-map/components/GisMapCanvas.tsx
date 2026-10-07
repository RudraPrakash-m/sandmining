import React, { useState, useRef } from "react";
import type {
  GisLayerKey,
  GisLayerConfig,
  GisMiningReachPoint,
  GisRestrictedZone,
  GisRiverPath,
  GisStockyardPoint,
  GisLiveVehiclePoint,
  GisEnforcementAlertPoint,
  SelectedGisItemType,
} from "../types/gis.types";
import { CHHATTISGARH_SVG_PATHS } from "../../dashboard/components/DistrictSandAvailabilityMap/DistrictMapSvg";
import { CHHATTISGARH_DISTRICT_INVENTORY } from "../../dashboard/services/districtAvailabilityService";
import { GisMapLegend } from "./GisMapLegend";
import { GisMapControls } from "./GisMapControls";
import { GisAlertHubOverlay } from "./GisAlertHubOverlay";
import { GisInspectorDrawer } from "./GisInspectorDrawer";
import { Compass, Truck, AlertTriangle } from "lucide-react";

export interface GisMapCanvasProps {
  layers: Record<GisLayerKey, GisLayerConfig>;
  reaches: GisMiningReachPoint[];
  restrictedZones: GisRestrictedZone[];
  rivers: GisRiverPath[];
  stockyards: GisStockyardPoint[];
  vehicles: GisLiveVehiclePoint[];
  alerts: GisEnforcementAlertPoint[];
  selectedItem: { type: SelectedGisItemType; rawItem: any } | null;
  onSelectItem: (item: { type: SelectedGisItemType; rawItem: any } | null) => void;
  className?: string;
}

export const GisMapCanvas: React.FC<GisMapCanvasProps> = ({
  layers,
  reaches,
  restrictedZones,
  rivers,
  stockyards,
  vehicles,
  alerts,
  selectedItem,
  onSelectItem,
  className = "",
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredDistrictName, setHoveredDistrictName] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const districtByPath = React.useMemo(() => {
    const map = new Map<string, any>();
    CHHATTISGARH_DISTRICT_INVENTORY.forEach((d) => map.set(d.svgPathId, d));
    return map;
  }, []);

  const handleZoomIn = () => setZoomLevel((z) => Math.min(Number((z + 0.2).toFixed(2)), 2.2));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(Number((z - 0.2).toFixed(2)), 0.8));
  const handleReset = () => setZoomLevel(1);

  const handleDistrictHover = (e: React.MouseEvent<SVGPathElement>, districtName: string) => {
    setHoveredDistrictName(districtName);
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = Math.min(e.clientX - rect.left + 12, rect.width - 120);
      const y = Math.min(e.clientY - rect.top + 12, rect.height - 40);
      setTooltipPos({ x, y });
    }
  };

  return (
    <div
      ref={canvasRef}
      className={`relative w-full overflow-hidden bg-[#F0F2EA] dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm select-none flex items-center justify-center ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none bg-slate-950" : "min-h-[620px] h-[660px]"
      } ${className}`}
      style={{
        backgroundImage: `radial-gradient(#dbe3d3 1px, transparent 1px), radial-gradient(#e8ede2 1px, #F0F2EA 1px)`,
        backgroundSize: "24px 24px",
        backgroundPosition: "0 0, 12px 12px",
      }}
    >
      {/* ── Top-Left North Compass Indicator ────────────────── */}
      <div className="absolute top-5 left-5 z-20 pointer-events-none">
        <div className="w-9 h-9 rounded-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xs border border-slate-200 dark:border-slate-800 shadow-md flex flex-col items-center justify-center">
          <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300 font-sans leading-none -mt-0.5">N</span>
          <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[6px] border-b-primary -rotate-180 -mt-0.5" />
        </div>
      </div>

      {/* ── Top-Right Map Controls Toolbar ──────────────────── */}
      <div className="absolute top-5 right-5 z-20">
        <GisMapControls
          zoomLevel={zoomLevel}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onReset={handleReset}
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => setIsFullscreen((f) => !f)}
        />
      </div>

      {/* ── Left Floating Exception & Alert Hub Overlay ─────── */}
      <div className="absolute top-18 left-5 z-20 pointer-events-auto">
        <GisAlertHubOverlay
          onSelectAlertCategory={(cat) => {
            const firstAlert = alerts[0];
            if (firstAlert) onSelectItem({ type: "ALERT", rawItem: firstAlert });
          }}
        />
      </div>

      {/* ── Bottom-Right Floating Map Legend ─────────────────── */}
      <div className="absolute bottom-5 right-5 z-20 pointer-events-auto">
        <GisMapLegend />
      </div>

      {/* ── Bottom-Left Distance Scale Bar ───────────────────── */}
      <div className="absolute bottom-5 left-5 z-20 pointer-events-none">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xs px-2.5 py-1 rounded border border-slate-200/80 dark:border-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-mono shadow-2xs">
          <div className="flex justify-between w-32 border-b border-slate-800 dark:border-slate-300 pb-0.5 mb-0.5">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>100 km</span>
          </div>
          <div className="flex justify-between text-[8px] text-slate-400">
            <span>|</span>
            <span>|</span>
            <span>|</span>
            <span>|</span>
          </div>
        </div>
      </div>

      {/* ── Floating Inspector Drawer (When Item Selected) ───── */}
      {selectedItem && (
        <div className="absolute top-5 left-72 z-30 pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-150">
          <GisInspectorDrawer
            selectedItem={selectedItem}
            onClose={() => onSelectItem(null)}
          />
        </div>
      )}

      {/* ── Main SVG Map Canvas ─────────────────────────────── */}
      <div
        className="w-full h-full flex items-center justify-center transition-transform duration-300 ease-out"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 333.20218 545.45056"
          className="w-full h-full max-h-[600px] drop-shadow-lg"
          style={{ overflow: "visible" }}
        >
          <defs>
            {/* Eco-sensitive restriction pattern */}
            <pattern
              id="restrictedHatch"
              width="6"
              height="6"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="0" x2="0" y2="6" stroke="#ea580c" strokeWidth="1.2" strokeOpacity="0.6" />
            </pattern>
            {/* Alert Halo Radial Gradient */}
            <radialGradient id="alertHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#e11d48" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#e11d48" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#e11d48" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* ── Layer 0: Authentic Chhattisgarh District Boundaries ── */}
          <g id="cg-districts-layer" transform="translate(199.10704,123.89195)">
            {Object.entries(CHHATTISGARH_SVG_PATHS).map(([pathId, d]) => {
              const district = districtByPath.get(pathId);
              const isHovered = hoveredDistrictName === district?.districtName;
              const isDistrictSelected =
                selectedItem?.type === "DISTRICT" && selectedItem.rawItem?.districtName === district?.districtName;

              return (
                <path
                  key={pathId}
                  id={pathId}
                  d={d}
                  fill={isDistrictSelected ? "#FDE8D8" : isHovered ? "#F8EFE4" : "#F7F2EB"}
                  stroke={isDistrictSelected ? "#C2410C" : isHovered ? "#B45309" : "#DDD4C7"}
                  strokeWidth={isDistrictSelected ? 1.4 : isHovered ? 1.1 : 0.65}
                  strokeLinejoin="round"
                  className="cursor-pointer transition-colors duration-150 outline-none"
                  onMouseEnter={(e) => {
                    if (district) handleDistrictHover(e, district.districtName);
                  }}
                  onMouseLeave={() => setHoveredDistrictName(null)}
                  onClick={() => {
                    if (district) onSelectItem({ type: "DISTRICT", rawItem: district });
                  }}
                />
              );
            })}
          </g>

          {/* ── Layer 3: Rivers & Drainage Streams ─────────────── */}
          {layers.RIVERS.visible && (
            <g id="gis-rivers-layer" pointerEvents="stroke">
              {rivers.map((riv) => (
                <g key={riv.id} className="cursor-pointer" onClick={() => onSelectItem({ type: "RIVER", rawItem: riv })}>
                  {/* Subtle water glow border */}
                  <path
                    d={riv.pathD}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="4"
                    strokeOpacity="0.5"
                    strokeLinecap="round"
                  />
                  {/* Main river core line */}
                  <path
                    d={riv.pathD}
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* River Label */}
                  <text
                    x={riv.labelX}
                    y={riv.labelY}
                    fontSize="7"
                    fontWeight="bold"
                    fill="#0369a1"
                    className="select-none pointer-events-none font-sans"
                    style={{ textShadow: "0 1px 2px rgba(255,255,255,0.95)" }}
                  >
                    {riv.riverName}
                  </text>
                </g>
              ))}
            </g>
          )}

          {/* ── Layer 2: Restricted / Forest Zones ─────────────── */}
          {layers.RESTRICTED.visible && (
            <g id="gis-restricted-layer">
              {restrictedZones.map((zone) => (
                <g
                  key={zone.id}
                  className="cursor-pointer"
                  onClick={() => onSelectItem({ type: "RESTRICTED", rawItem: zone })}
                >
                  <circle
                    cx={zone.svgX}
                    cy={zone.svgY}
                    r={zone.radiusSvg}
                    fill="url(#restrictedHatch)"
                    stroke="#f97316"
                    strokeWidth="1.2"
                    strokeDasharray="3 2"
                    className="transition-all hover:stroke-width-2"
                  />
                  <circle cx={zone.svgX} cy={zone.svgY} r="3.5" fill="#ea580c" stroke="#ffffff" strokeWidth="0.8" />
                </g>
              ))}
            </g>
          )}

          {/* ── Layer 1: Approved Mining Reaches (Corridors & Pins) ── */}
          {layers.REACHES.visible && (
            <g id="gis-reaches-layer">
              {/* Highlighted green river reach corridors */}
              <path
                d="M 120,305 L 126,312"
                stroke="#16a34a"
                strokeWidth="5.5"
                strokeLinecap="round"
                opacity="0.85"
              />
              <path
                d="M 170,170 L 180,175"
                stroke="#16a34a"
                strokeWidth="5.5"
                strokeLinecap="round"
                opacity="0.85"
              />
              <path
                d="M 112,442 L 120,448"
                stroke="#16a34a"
                strokeWidth="5.5"
                strokeLinecap="round"
                opacity="0.85"
              />

              {reaches.map((rch) => {
                const isSelected = selectedItem?.type === "REACH" && selectedItem.rawItem?.id === rch.id;
                return (
                  <g
                    key={rch.id}
                    className="cursor-pointer gis-interactive-marker"
                    onClick={() => onSelectItem({ type: "REACH", rawItem: rch })}
                  >
                    {isSelected && (
                      <circle cx={rch.svgX} cy={rch.svgY} r="10" fill="none" stroke="#16a34a" strokeWidth="1.8" className="animate-ping opacity-75" />
                    )}
                    <circle cx={rch.svgX} cy={rch.svgY} r="5" fill="#16a34a" stroke="#ffffff" strokeWidth="1.2" />
                    <circle cx={rch.svgX} cy={rch.svgY} r="2" fill="#ffffff" />
                  </g>
                );
              })}
            </g>
          )}

          {/* ── Layer 4: Sand Stockyards ───────────────────────── */}
          {layers.STOCKYARDS.visible && (
            <g id="gis-stockyards-layer">
              {stockyards.map((stk) => {
                const isSelected = selectedItem?.type === "STOCKYARD" && selectedItem.rawItem?.id === stk.id;
                return (
                  <g
                    key={stk.id}
                    className="cursor-pointer gis-interactive-marker"
                    onClick={() => onSelectItem({ type: "STOCKYARD", rawItem: stk })}
                  >
                    {isSelected && (
                      <circle cx={stk.svgX} cy={stk.svgY} r="8" fill="none" stroke="#f97316" strokeWidth="1.5" className="animate-ping opacity-75" />
                    )}
                    <circle cx={stk.svgX} cy={stk.svgY} r="4.5" fill="#f97316" stroke="#ffffff" strokeWidth="1" />
                  </g>
                );
              })}
            </g>
          )}

          {/* ── Layer 5: Live Transport Vehicles ───────────────── */}
          {layers.VEHICLES.visible && (
            <g id="gis-vehicles-layer">
              {vehicles.map((veh) => {
                const isSelected = selectedItem?.type === "VEHICLE" && selectedItem.rawItem?.id === veh.id;
                return (
                  <g
                    key={veh.id}
                    className="cursor-pointer gis-interactive-marker"
                    onClick={() => onSelectItem({ type: "VEHICLE", rawItem: veh })}
                  >
                    <rect
                      x={veh.svgX - 4.5}
                      y={veh.svgY - 4.5}
                      width="9"
                      height="9"
                      rx="2.5"
                      fill="#2563eb"
                      stroke="#ffffff"
                      strokeWidth="1.2"
                      className="drop-shadow-sm"
                    />
                    <path
                      d={`M ${veh.svgX - 2.5} ${veh.svgY} L ${veh.svgX + 2.5} ${veh.svgY}`}
                      stroke="#ffffff"
                      strokeWidth="1"
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* ── Layer 6: Illegal Mining Alerts (With Soft Glowing Halo) ── */}
          {layers.ALERTS.visible && (
            <g id="gis-alerts-layer">
              {alerts.map((alt) => {
                return (
                  <g
                    key={alt.id}
                    className="cursor-pointer gis-interactive-marker"
                    onClick={() => onSelectItem({ type: "ALERT", rawItem: alt })}
                  >
                    {/* Concentric Soft Red Glowing Halo */}
                    <circle
                      cx={alt.svgX}
                      cy={alt.svgY}
                      r="16"
                      fill="url(#alertHalo)"
                      className="animate-pulse"
                    />
                    <circle
                      cx={alt.svgX}
                      cy={alt.svgY}
                      r="9"
                      fill="#fee2e2"
                      stroke="#f87171"
                      strokeWidth="0.8"
                      strokeDasharray="2 1.5"
                    />
                    {/* Red Warning Triangle Badge */}
                    <polygon
                      points={`${alt.svgX},${alt.svgY - 5.5} ${alt.svgX - 5},${alt.svgY + 4} ${alt.svgX + 5},${alt.svgY + 4}`}
                      fill="#dc2626"
                      stroke="#ffffff"
                      strokeWidth="0.8"
                    />
                    <circle cx={alt.svgX} cy={alt.svgY + 1.5} r="0.8" fill="#ffffff" />
                  </g>
                );
              })}
            </g>
          )}

          {/* ── Map City / Region Labels ───────────────────────── */}
          <g id="cg-city-labels" className="pointer-events-none select-none font-sans">
            <text x="160" y="95" fontSize="7.5" fontWeight="600" fill="#64748b">Kanker</text>
            <text x="180" y="160" fontSize="7.5" fontWeight="600" fill="#64748b">Bilaspur</text>
            <text x="150" y="180" fontSize="8" fontWeight="bold" fill="#334155">Raipur</text>
            <text x="125" y="220" fontSize="7.5" fontWeight="600" fill="#64748b">Durg</text>
            <text x="125" y="340" fontSize="7.5" fontWeight="600" fill="#64748b">Bastar</text>
            <text x="128" y="415" fontSize="7.5" fontWeight="600" fill="#64748b">Jagdalpur</text>
          </g>
        </svg>
      </div>

      {/* ── District Hover Tooltip ──────────────────────────── */}
      {hoveredDistrictName && tooltipPos && !selectedItem && (
        <div
          className="absolute z-30 pointer-events-none bg-slate-900/95 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-xl border border-slate-700 backdrop-blur-xs"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
          }}
        >
          {hoveredDistrictName}
        </div>
      )}
    </div>
  );
};
