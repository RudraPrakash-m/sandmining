import React, { useState } from "react";
import { Plus, Minus, Layers, AlertTriangle, MapPin, Truck } from "lucide-react";
import type { TelematicsVehicle } from "../types/telematics.types";

export interface GpsTrackingMapCanvasProps {
  vehicles: TelematicsVehicle[];
  selectedVehicleId: string;
  onSelectVehicle: (v: TelematicsVehicle) => void;
  className?: string;
}

export const GpsTrackingMapCanvas: React.FC<GpsTrackingMapCanvasProps> = ({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  className = "",
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mapStyle, setMapStyle] = useState<"terrain" | "satellite">("terrain");

  const handleZoomIn = () => setZoomLevel((z) => Math.min(Number((z + 0.2).toFixed(1)), 2.0));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(Number((z - 0.2).toFixed(1)), 0.8));

  // Dedicated vehicles from the reference screenshot mapped to Chhattisgarh
  const vehicle1 = vehicles.find((v) => v.vehicleNumber === "CG 04 HA 4321") || vehicles[0];
  const vehicle2 = vehicles.find((v) => v.vehicleNumber === "CG 10 BD 7890") || vehicles[1];
  const vehicle3 = vehicles.find((v) => v.vehicleNumber === "CG 07 EF 2468") || vehicles[3];

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-border-color shadow-sm select-none min-h-[500px] h-[550px] bg-[#dbe8d4] dark:bg-slate-950 ${className}`}
      style={{
        backgroundImage:
          mapStyle === "terrain"
            ? `radial-gradient(#c7dbc0 1.2px, transparent 1.2px), radial-gradient(#d4e3cc 1.2px, #dbe8d4 1.2px)`
            : `radial-gradient(#334155 1px, transparent 1px), radial-gradient(#1e293b 1px, #0f172a 1px)`,
        backgroundSize: "28px 28px",
        backgroundPosition: "0 0, 14px 14px",
      }}
    >
      {/* ── Top-Left North Compass ── */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <div className="w-9 h-9 rounded-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xs border border-slate-200 dark:border-slate-800 shadow-md flex flex-col items-center justify-center">
          <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300 font-sans leading-none -mt-0.5">
            N
          </span>
          <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[6px] border-b-primary -rotate-180 -mt-0.5" />
        </div>
      </div>

      {/* ── Bottom-Left Map Controls Toolbar ── */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-1.5">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-border-color shadow-md overflow-hidden flex flex-col">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-8 h-8 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors border-b border-border-color cursor-pointer"
            title="Zoom In"
          >
            <Plus size={15} />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-8 h-8 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <Minus size={15} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMapStyle((s) => (s === "terrain" ? "satellite" : "terrain"))}
          className="w-8 h-8 bg-white dark:bg-gray-900 rounded-xl border border-border-color shadow-md flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          title="Toggle Map Style"
        >
          <Layers size={15} />
        </button>
      </div>

      {/* ── Bottom-Right Floating Map Legend ── */}
      <div className="absolute bottom-4 right-4 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl border border-border-color p-3 shadow-lg max-w-[200px] text-xs">
        <div className="space-y-2">
          {/* Item 1: Vehicle Route */}
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-0.5 bg-emerald-600 rounded-full" />
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
              Vehicle Route
            </span>
          </div>

          {/* Item 2: Geofence Corridor */}
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-2.5 bg-rose-100 dark:bg-rose-950/60 border border-dashed border-rose-500 rounded-xs" />
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
              Geofence Corridor
            </span>
          </div>

          {/* Item 3: Mining Zone */}
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-2.5 bg-purple-100 dark:bg-purple-950/60 border border-dashed border-purple-500 rounded-xs" />
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
              Mining Zone
            </span>
          </div>

          {/* Item 4: River */}
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-1 bg-sky-500 rounded-full" />
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
              River
            </span>
          </div>

          {/* Item 5: Alert / Exception */}
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold">
              !
            </div>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
              Alert / Exception
            </span>
          </div>
        </div>
      </div>

      {/* ── Main SVG Map Rendering Layer ── */}
      <div
        className="w-full h-full flex items-center justify-center transition-transform duration-300 ease-out"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        <svg
          viewBox="0 0 700 480"
          className="w-full h-full"
          style={{ overflow: "visible" }}
        >
          <defs>
            {/* Red radar halo pulsing for exception vehicle */}
            <radialGradient id="telematicsAlertHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#e11d48" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#e11d48" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#e11d48" stopOpacity="0" />
            </radialGradient>

            {/* Pattern for geofence corridor diagonal stripes */}
            <pattern
              id="geofenceStripe"
              width="8"
              height="8"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="0" x2="0" y2="8" stroke="#f43f5e" strokeWidth="1.2" strokeOpacity="0.3" />
            </pattern>
          </defs>

          {/* ── Topography Elevation / Forest Areas (Chhattisgarh Relief) ── */}
          <g id="terrain-relief" opacity="0.35">
            <path
              d="M 20 40 Q 140 20, 220 90 T 360 80 T 540 40 L 700 80 L 700 0 L 0 0 Z"
              fill="#c0d7b5"
            />
            <path
              d="M 0 340 Q 120 280, 200 380 T 400 440 L 700 480 L 0 480 Z"
              fill="#c6dbbc"
            />
            <path
              d="M 500 120 Q 620 180, 680 120 L 700 240 L 580 280 Z"
              fill="#c3d8b8"
            />
          </g>

          {/* ── Highway Network (Chhattisgarh Road corridors) ── */}
          <g id="road-network">
            {/* NH53 (Durg - Raipur - Arang Freight Corridor) */}
            <path
              d="M 40 180 Q 200 140, 360 170 T 680 180"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="3"
              strokeDasharray="6,3"
            />
            {/* NH130 (Raipur - Simga - Bilaspur Expressway) */}
            <path
              d="M 340 50 L 340 160 Q 380 210, 440 240"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2.5"
              strokeDasharray="5,3"
            />
            {/* NH30 (Raipur - Dhamtari - Kanker Corridor) */}
            <path
              d="M 440 240 Q 520 340, 640 460"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2.5"
              strokeDasharray="5,3"
            />
            {/* Secondary Connectors */}
            <path
              d="M 120 100 Q 240 180, 360 210 T 600 320"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </g>

          {/* ── River Network: Mahanadi & Shivnath River Basins ── */}
          <g id="river-system">
            {/* Mahanadi River Main Stream */}
            <path
              d="M 0 360 Q 80 340, 160 320 T 260 270 T 360 220 T 480 160 T 620 140 L 700 160 L 700 210 Q 580 190, 460 220 T 340 300 T 200 370 T 0 410 Z"
              fill="#7dd3fc"
              opacity="0.8"
            />
            {/* Shivnath / Hasdeo River Inflow */}
            <path
              d="M 600 0 Q 560 60, 520 120 L 480 160"
              fill="none"
              stroke="#7dd3fc"
              strokeWidth="6"
              strokeLinecap="round"
              opacity="0.85"
            />
            {/* River Label */}
            <text
              x="250"
              y="235"
              fill="#0284c7"
              fontSize="12"
              fontWeight="bold"
              fontStyle="italic"
              transform="rotate(-18 250 235)"
            >
              Mahanadi River (Chhattisgarh)
            </text>
          </g>

          {/* ── Purple Shaded Mining Zone 1 (Mahanadi Reach RP-01) ── */}
          <g id="mining-zone-1">
            <polygon
              points="80,180 140,150 220,180 230,240 150,290 85,260"
              fill="#8b5cf6"
              fillOpacity="0.16"
              stroke="#7c3aed"
              strokeWidth="2"
              strokeDasharray="6,4"
            />
            {/* Purple Zone Pin & Label */}
            <g transform="translate(150, 205)">
              <circle cx="0" cy="0" r="10" fill="#7c3aed" />
              <MapPin x="-6" y="-6" size="12" className="text-white fill-white" />
              <text
                x="0"
                y="18"
                textAnchor="middle"
                fill="#6d28d9"
                fontSize="11"
                fontWeight="bold"
              >
                Mining Zone 1 (Reach RP-01)
              </text>
            </g>
          </g>

          {/* ── Red Shaded Geofence Corridor A (Mahanadi Arang Buffer) ── */}
          <g id="geofence-corridor-a">
            {/* Shaded Buffer Zone */}
            <path
              d="M 140 360 Q 180 340, 250 330 T 380 250 T 440 230 L 440 265 Q 380 280, 260 365 T 140 395 Z"
              fill="url(#geofenceStripe)"
              stroke="#ef4444"
              strokeWidth="1.8"
              strokeDasharray="5,4"
            />
            <path
              d="M 140 360 Q 180 340, 250 330 T 380 250 T 440 230"
              fill="none"
              stroke="#ef4444"
              strokeWidth="1.8"
              strokeDasharray="5,4"
            />
            <path
              d="M 140 395 Q 260 365, 380 280 T 440 265"
              fill="none"
              stroke="#ef4444"
              strokeWidth="1.8"
              strokeDasharray="5,4"
            />
            {/* Curved Label along Corridor */}
            <text
              x="240"
              y="330"
              fill="#dc2626"
              fontSize="12"
              fontWeight="bold"
              transform="rotate(-24 240 330)"
            >
              Geofence Corridor A (Arang)
            </text>
          </g>

          {/* ── Green Approved Vehicle Route Polyline ── */}
          <g id="vehicle-route">
            {/* Route segment from Mining Zone to River Bridge */}
            <path
              d="M 180 160 Q 230 160, 280 160 T 340 160 L 380 210 L 440 240"
              fill="none"
              stroke="#16a34a"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Route segment through Corridor */}
            <path
              d="M 184 340 Q 230 330, 290 320 T 440 240"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2.5"
              strokeDasharray="4,3"
            />
          </g>

          {/* ── Geographic Chhattisgarh City / Place Labels & Highway Badges ── */}
          <g id="map-labels" pointerEvents="none">
            {/* Durg / Bhilai (West) */}
            <text x="175" y="115" fill="#334155" fontSize="13" fontWeight="bold">
              Durg
            </text>

            {/* Raipur (Central) */}
            <text x="375" y="105" fill="#0f172a" fontSize="14" fontWeight="black">
              Raipur
            </text>

            {/* Bilaspur (North East) */}
            <text x="560" y="175" fill="#334155" fontSize="13" fontWeight="bold">
              Bilaspur
            </text>

            {/* Dhamtari / Bastar (South East) */}
            <text x="575" y="235" fill="#334155" fontSize="13" fontWeight="bold">
              Dhamtari
            </text>

            {/* Highway Badge NH53 */}
            <g transform="translate(510, 105)">
              <rect x="0" y="0" width="36" height="15" rx="3" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
              <text x="18" y="11" textAnchor="middle" fill="#78350f" fontSize="9" fontWeight="bold">
                NH53
              </text>
            </g>

            {/* Highway Badge NH53 (Durg) */}
            <g transform="translate(70, 295)">
              <rect x="0" y="0" width="36" height="15" rx="3" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
              <text x="18" y="11" textAnchor="middle" fill="#78350f" fontSize="9" fontWeight="bold">
                NH53
              </text>
            </g>

            {/* Highway Badge NH130 (Bilaspur) */}
            <g transform="translate(510, 375)">
              <rect x="0" y="0" width="40" height="15" rx="3" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
              <text x="20" y="11" textAnchor="middle" fill="#78350f" fontSize="9" fontWeight="bold">
                NH130
              </text>
            </g>
          </g>

          {/* ── Interactive Live Moving Vehicle Markers & Badges ── */}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* VEHICLE 1 (Green) - CG 04 HA 4321 near Arang/Raipur */}
          {/* ───────────────────────────────────────────────────────────── */}
          <g
            id="vehicle-cg-04-ha-4321"
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => onSelectVehicle(vehicle1)}
          >
            {/* Green Truck Pin Circle */}
            <g transform="translate(340, 150)">
              <circle
                cx="0"
                cy="0"
                r="16"
                fill="#16a34a"
                stroke="#ffffff"
                strokeWidth="2.5"
                className="drop-shadow-md"
              />
              <Truck x="-7" y="-7" size="14" className="text-white fill-white" />
            </g>

            {/* Floating Info Tooltip Badge */}
            <g transform="translate(365, 132)">
              {/* Badge Background */}
              <rect
                x="0"
                y="0"
                width="98"
                height="32"
                rx="6"
                fill="#ffffff"
                stroke="#cbd5e1"
                strokeWidth="1"
                className="drop-shadow-md"
              />
              {/* Green Header Pill */}
              <rect x="0" y="0" width="98" height="17" rx="5" fill="#16a34a" />
              <text
                x="49"
                y="12"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="9.5"
                fontWeight="bold"
                letterSpacing="0.3"
              >
                CG 04 HA 4321
              </text>
              {/* Speed Text */}
              <text
                x="49"
                y="27"
                textAnchor="middle"
                fill="#334155"
                fontSize="9"
                fontWeight="bold"
              >
                62 km/h
              </text>
            </g>
          </g>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* VEHICLE 2 (Blue) - CG 10 BD 7890 near Bilaspur */}
          {/* ───────────────────────────────────────────────────────────── */}
          <g
            id="vehicle-cg-10-bd-7890"
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => onSelectVehicle(vehicle2)}
          >
            {/* Blue Truck Pin Circle */}
            <g transform="translate(440, 240)">
              <circle
                cx="0"
                cy="0"
                r="16"
                fill="#2563eb"
                stroke="#ffffff"
                strokeWidth="2.5"
                className="drop-shadow-md"
              />
              <Truck x="-7" y="-7" size="14" className="text-white fill-white" />
            </g>

            {/* Floating Info Tooltip Badge */}
            <g transform="translate(465, 222)">
              <rect
                x="0"
                y="0"
                width="98"
                height="32"
                rx="6"
                fill="#ffffff"
                stroke="#cbd5e1"
                strokeWidth="1"
                className="drop-shadow-md"
              />
              {/* Blue Header Pill */}
              <rect x="0" y="0" width="98" height="17" rx="5" fill="#2563eb" />
              <text
                x="49"
                y="12"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="9.5"
                fontWeight="bold"
                letterSpacing="0.3"
              >
                CG 10 BD 7890
              </text>
              {/* Speed Text */}
              <text
                x="49"
                y="27"
                textAnchor="middle"
                fill="#334155"
                fontSize="9"
                fontWeight="bold"
              >
                48 km/h
              </text>
            </g>
          </g>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* VEHICLE 3 (Red Exception) - CG 07 EF 2468 in Geofence Corridor A */}
          {/* ───────────────────────────────────────────────────────────── */}
          <g
            id="vehicle-cg-07-ef-2468"
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => onSelectVehicle(vehicle3)}
          >
            {/* Pulsing Red Radar Rings */}
            <circle
              cx="184"
              cy="340"
              r="34"
              fill="url(#telematicsAlertHalo)"
              className="animate-ping"
              style={{ animationDuration: "3s" }}
            />
            <circle
              cx="184"
              cy="340"
              r="26"
              fill="none"
              stroke="#ef4444"
              strokeWidth="1.5"
              strokeDasharray="4,3"
              opacity="0.75"
            />

            {/* Red Truck Pin Circle */}
            <g transform="translate(184, 340)">
              <circle
                cx="0"
                cy="0"
                r="16"
                fill="#dc2626"
                stroke="#ffffff"
                strokeWidth="2.5"
                className="drop-shadow-md"
              />
              <Truck x="-7" y="-7" size="14" className="text-white fill-white" />

              {/* Red Warning Exclamation Badge on top */}
              <g transform="translate(0, -18)">
                <circle cx="0" cy="0" r="7" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
                <text x="0" y="3.5" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="black">
                  !
                </text>
              </g>
            </g>

            {/* Floating Info Tooltip Badge */}
            <g transform="translate(208, 318)">
              <rect
                x="0"
                y="0"
                width="98"
                height="32"
                rx="6"
                fill="#ffffff"
                stroke="#fca5a5"
                strokeWidth="1"
                className="drop-shadow-md"
              />
              {/* Red Header Pill */}
              <rect x="0" y="0" width="98" height="17" rx="5" fill="#dc2626" />
              <text
                x="49"
                y="12"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="9.5"
                fontWeight="bold"
                letterSpacing="0.3"
              >
                CG 07 EF 2468
              </text>
              {/* Speed 0 km/h Text */}
              <text
                x="49"
                y="27"
                textAnchor="middle"
                fill="#dc2626"
                fontSize="9"
                fontWeight="bold"
              >
                0 km/h
              </text>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
};
