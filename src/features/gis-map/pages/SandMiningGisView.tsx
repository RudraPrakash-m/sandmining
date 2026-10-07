import React, { useState, useMemo } from "react";
import {
  GisMapCanvas,
  GisLayerControls,
  GisMapSearch,
} from "../components";
import {
  GisSpatialDataService,
} from "../services/gisSpatialDataService";
import type {
  GisLayerKey,
  GisLayerConfig,
  SelectedGisItemType,
  GisSearchResultItem,
} from "../types/gis.types";
import {
  Search,
  Pickaxe,
  Building2,
  Truck,
  AlertTriangle,
  ArrowUp,
} from "lucide-react";
import "../styles/gisMap.css";

export const SandMiningGisView: React.FC = () => {
  // ── 1. Spatial Layer State ───────────────────────────────────────────
  const [layers, setLayers] = useState<Record<GisLayerKey, GisLayerConfig>>({
    REACHES: {
      key: "REACHES",
      label: "Mining Reaches",
      description: "Approved legal sand mining zones",
      color: "#16a34a",
      count: GisSpatialDataService.getAllReaches().length,
      visible: true,
      iconName: "Pickaxe",
    },
    RESTRICTED: {
      key: "RESTRICTED",
      label: "Restricted Zones",
      description: "Wildlife & eco-sensitive non-mining areas",
      color: "#dc2626",
      count: GisSpatialDataService.getAllRestrictedZones().length,
      visible: true,
      iconName: "ShieldAlert",
    },
    RIVERS: {
      key: "RIVERS",
      label: "Rivers / Streams",
      description: "Mahanadi, Shivnath, Hasdeo & Indravati river systems",
      color: "#0284c7",
      count: GisSpatialDataService.getAllRivers().length,
      visible: true,
      iconName: "Waves",
    },
    STOCKYARDS: {
      key: "STOCKYARDS",
      label: "Stockyards",
      description: "Central government sand depots",
      color: "#f59e0b",
      count: GisSpatialDataService.getAllStockyards().length,
      visible: true,
      iconName: "Building2",
    },
    VEHICLES: {
      key: "VEHICLES",
      label: "Live Vehicles",
      description: "Active transport GPS telemetry",
      color: "#2563eb",
      count: GisSpatialDataService.getAllLiveVehicles().length,
      visible: true,
      iconName: "Truck",
    },
    ALERTS: {
      key: "ALERTS",
      label: "Illegal Alerts",
      description: "Surveillance violations & checkpost breaches",
      color: "#e11d48",
      count: GisSpatialDataService.getAllAlerts().length,
      visible: true,
      iconName: "AlertTriangle",
    },
  });

  // Selected object state
  const [selectedItem, setSelectedItem] = useState<{
    type: SelectedGisItemType;
    rawItem: any;
  } | null>(null);

  const toggleLayer = (key: GisLayerKey) => {
    setLayers((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        visible: !prev[key].visible,
      },
    }));
  };

  const handleSelectSearchResult = (result: GisSearchResultItem) => {
    // Automatically turn on the relevant layer if it was hidden
    if (result.type === "REACH") {
      setLayers((prev) => ({ ...prev, REACHES: { ...prev.REACHES, visible: true } }));
      setSelectedItem({ type: "REACH", rawItem: result.rawItem });
    } else if (result.type === "STOCKYARD") {
      setLayers((prev) => ({ ...prev, STOCKYARDS: { ...prev.STOCKYARDS, visible: true } }));
      setSelectedItem({ type: "STOCKYARD", rawItem: result.rawItem });
    } else if (result.type === "VEHICLE") {
      setLayers((prev) => ({ ...prev, VEHICLES: { ...prev.VEHICLES, visible: true } }));
      setSelectedItem({ type: "VEHICLE", rawItem: result.rawItem });
    } else if (result.type === "ALERT") {
      setLayers((prev) => ({ ...prev, ALERTS: { ...prev.ALERTS, visible: true } }));
      setSelectedItem({ type: "ALERT", rawItem: result.rawItem });
    } else if (result.type === "RESTRICTED") {
      setLayers((prev) => ({ ...prev, RESTRICTED: { ...prev.RESTRICTED, visible: true } }));
      setSelectedItem({ type: "RESTRICTED", rawItem: result.rawItem });
    }
  };

  // Layer data
  const allReaches = useMemo(() => GisSpatialDataService.getAllReaches(), []);
  const allRestrictedZones = useMemo(() => GisSpatialDataService.getAllRestrictedZones(), []);
  const allRivers = useMemo(() => GisSpatialDataService.getAllRivers(), []);
  const allStockyards = useMemo(() => GisSpatialDataService.getAllStockyards(), []);
  const allVehicles = useMemo(() => GisSpatialDataService.getAllLiveVehicles(), []);
  const allAlerts = useMemo(() => GisSpatialDataService.getAllAlerts(), []);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* ── 1. Top 4 KPI Metric Cards (Directly After Breadcrumb) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Approved Mining Reach */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-border-color shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Pickaxe size={22} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                7
              </p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                Approved Mining Reach
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <ArrowUp size={12} />
            <span>2</span>
          </span>
        </div>

        {/* Card 2: Stockyards */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-border-color shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/70 text-orange-700 dark:text-orange-400 flex items-center justify-center shrink-0">
              <Building2 size={22} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                5
              </p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                Stockyards
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <ArrowUp size={12} />
            <span>1</span>
          </span>
        </div>

        {/* Card 3: Live Vehicles In Transit */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-border-color shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Truck size={22} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                4
              </p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                Live Vehicles In Transit
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <ArrowUp size={12} />
            <span>1</span>
          </span>
        </div>

        {/* Card 4: Critical Breaches */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-border-color shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle size={22} />
            </div>
            <div>
              <p className="text-2xl font-black text-rose-600 tracking-tight leading-none">
                3
              </p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                Critical Breaches
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <ArrowUp size={12} />
            <span>1</span>
          </span>
        </div>
      </div>

      {/* ── 2. Search Field Bar Above Map Layers ────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-gray-900 p-3 rounded-2xl border border-border-color shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center shrink-0">
            <Search size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              Spatial Reach & Asset Locator
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Search approved reaches, stockyards, vehicles, or breach alerts across Chhattisgarh
            </p>
          </div>
        </div>
        <div className="w-full sm:w-80 md:w-96 shrink-0">
          <GisMapSearch
            onSelectResult={handleSelectSearchResult}
            placeholder="Search reach by name, ID, river, district..."
          />
        </div>
      </div>

      {/* ── 3. All Map Layers on One Line ──────────────────────── */}
      <GisLayerControls
        layers={layers}
        onToggleLayer={toggleLayer}
      />

      {/* ── 4. Full-Width Master GIS Map Canvas ────────────────── */}
      <div className="relative">
        <GisMapCanvas
          layers={layers}
          reaches={allReaches}
          restrictedZones={allRestrictedZones}
          rivers={allRivers}
          stockyards={allStockyards}
          vehicles={allVehicles}
          alerts={allAlerts}
          selectedItem={selectedItem}
          onSelectItem={setSelectedItem}
        />
      </div>
    </div>
  );
};
export default SandMiningGisView;
