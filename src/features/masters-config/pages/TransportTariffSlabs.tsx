import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Truck,
  Plus,
  Edit2,
  FileText,
  Printer,
  Search,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Scale,
  Gauge,
  Navigation,
  Download,
  IndianRupee,
  Calendar,
  Layers,
  Check,
  RefreshCw,
} from "lucide-react";
import Card from "@/shared/components/layout/Card/Card";
import Button from "@/shared/components/ui/Button";
import Badge from "@/shared/components/ui/Badge";
import Modal, { ModalFooter } from "@/shared/components/ui/Modal/Modal";
import Tabs from "@/shared/components/ui/Tabs";
import { routes } from "@/app/routes/routeConfig";
import {
  STATUTORY_TRANSPORT_SLABS,
  type TransportKmSlab,
  calculateSlabTransportationCharges,
} from "@/features/sand-booking/data/transportTariffSlabsData";

export const TransportTariffSlabs: React.FC = () => {
  const navigate = useNavigate();
  const [slabs, setSlabs] = useState<TransportKmSlab[]>(STATUTORY_TRANSPORT_SLABS);
  const [activeTab, setActiveTab] = useState<"slabs" | "calculator" | "vehicles" | "terrain">("slabs");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingSlab, setEditingSlab] = useState<TransportKmSlab | null>(null);
  const [isGazetteModalOpen, setIsGazetteModalOpen] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Live Calculator State
  const [calcDistance, setCalcDistance] = useState<number>(18.5);
  const [calcQuantity, setCalcQuantity] = useState<number>(10);
  const [calcTransportMode, setCalcTransportMode] = useState<string>("Department-arranged transport");
  const [calcVehicleType, setCalcVehicleType] = useState<string>("2-Axle Tipper (10 MT)");

  // Filtered Slabs
  const filteredSlabs = useMemo(() => {
    return slabs.filter(
      (s) =>
        s.slabName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.slabCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [slabs, searchTerm]);

  // Tabs Config
  const tabsConfig = useMemo(
    () => [
      {
        key: "slabs",
        label: `Fixed KM Slabs (${slabs.length})`,
        icon: SlidersHorizontal,
      },
      {
        key: "calculator",
        label: "Live Slab & Payment Calculator",
        icon: Sparkles,
      },
      {
        key: "vehicles",
        label: "Vehicle Category Multipliers",
        icon: Truck,
      },
      {
        key: "terrain",
        label: "Terrain & District Factors",
        icon: Navigation,
      },
    ],
    [slabs.length]
  );

  // Calculator Result
  const calculationResult = useMemo(() => {
    return calculateSlabTransportationCharges(calcDistance, calcQuantity, calcTransportMode);
  }, [calcDistance, calcQuantity, calcTransportMode]);

  // Save Slab Changes
  const handleSaveSlab = () => {
    if (!editingSlab) return;
    setSlabs((prev) => prev.map((s) => (s.id === editingSlab.id ? editingSlab : s)));
    setIsEditModalOpen(false);
    setSuccessToast(`Tariff slab "${editingSlab.slabCode}" updated successfully!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {successToast && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-200 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-200 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 text-slate-900 dark:text-white shadow-2xs border border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20 flex items-center gap-1.5">
                <SlidersHorizontal size={14} className="text-primary" />
                Statutory Gazette Tariff Schedule
              </span>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-semibold rounded-full border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-600" />
                CG-MIN-TRF-2026/089-A Enforced
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              KM-Wise Fixed Transportation Charges Slab Master
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm leading-relaxed">
              Standardized statutory distance-based freight slabs for sand delivery across Chhattisgarh. Order booking payments automatically apply these fixed slabs to compute exact logistics charges based on actual travel kilometers from depot to delivery site.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Button
              variant="primary"
              onClick={() => {
                setActiveTab("calculator");
              }}
              icon={<Sparkles size={16} />}
              className="font-semibold px-5 py-2.5 shadow-xs"
            >
              Test in Calculator
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsGazetteModalOpen(true)}
              icon={<FileText size={16} />}
              className="text-xs"
            >
              Gazette Notification
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(routes.createBooking.path)}
              icon={<ArrowRight size={16} />}
              className="text-xs"
            >
              New Sand Booking
            </Button>
          </div>
        </div>

        {/* 4 Summary Stats Cards */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <Card className="p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Active Distance Slabs</span>
              <Layers size={16} className="text-blue-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{slabs.length}</span>
              <span className="text-xs font-semibold text-emerald-600">0 to &gt;100 KM</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Full state coverage</div>
          </Card>

          <Card className="p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Fixed Base Range</span>
              <IndianRupee size={16} className="text-primary" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">₹350 - ₹2,300</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Depot flag down base</div>
          </Card>

          <Card className="p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Per-KM Distance Rate</span>
              <Gauge size={16} className="text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">₹16 - ₹35</span>
              <span className="text-xs text-slate-500">/ KM</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Slab-graduated tariff</div>
          </Card>

          <Card className="p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Order Auto-Calculation</span>
              <CheckCircle2 size={16} className="text-teal-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-teal-600 dark:text-teal-400">100%</span>
              <span className="text-xs font-semibold text-teal-600">Active</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Applied on actual KM entry</div>
          </Card>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="overflow-x-auto pb-1 lg:pb-0">
          <Tabs tabs={tabsConfig} activeTab={activeTab} onChange={(key) => setActiveTab(key as any)} />
        </div>

        {activeTab === "slabs" && (
          <div className="relative">
            <Search size={14} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search KM slabs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-2xs w-60"
            />
          </div>
        )}
      </div>

      {/* ── TAB 1: FIXED KM SLABS TABLE ─────────────────────────────────── */}
      {activeTab === "slabs" && (
        <div className="space-y-4">
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-200">
              <ShieldCheck size={18} className="text-primary shrink-0" />
              <div>
                <span className="font-bold">Automated Order Freight Rule:</span> When citizen sand orders specify destination distance, the system matches the exact distance against the bounds below and adds statutory freight charges into the final payment summary.
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const printWindow = window.open("", "_blank");
                if (printWindow) {
                  printWindow.document.write(`
                    <html><head><title>Statutory Transport KM Slabs</title>
                    <style>body{font-family:sans-serif;padding:20px;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ccc;padding:8px;font-size:12px;text-align:left;} th{background:#f4f4f4;}</style>
                    </head><body>
                    <h2>Government of Chhattisgarh - Directorate of Geology & Mining</h2>
                    <h3>Official Mineral Transportation Charges Fixed KM Slabs</h3>
                    <table><thead><tr><th>Slab Code</th><th>Distance Range (KM)</th><th>Fixed Base (₹)</th><th>Rate/KM (₹)</th><th>Rate/MT/KM (₹)</th><th>Min Guarantee (₹)</th><th>Loading Fee (₹)</th><th>Gazette Ref</th><th>Status</th></tr></thead>
                    <tbody>${slabs.map(s => `<tr><td>${s.slabCode}</td><td>${s.minKm} - ${s.maxKm} KM</td><td>₹${s.fixedBaseRate}</td><td>₹${s.ratePerKm}</td><td>₹${s.ratePerMtPerKm}</td><td>₹${s.minFixedCharge}</td><td>₹${s.loadingUnloadingFee}</td><td>${s.gazetteRef}</td><td>${s.status}</td></tr>`).join("")}</tbody></table>
                    </body></html>
                  `);
                  printWindow.document.close();
                  printWindow.print();
                }
              }}
              icon={<Printer size={14} />}
              className="shrink-0 bg-white dark:bg-slate-800 text-xs font-semibold"
            >
              Export Gazette Schedule
            </Button>
          </div>

          <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Slab Code & Zone Name</th>
                  <th className="py-3.5 px-4 text-center">Distance Bounds (KM)</th>
                  <th className="py-3.5 px-4">Fixed Base Charge (₹)</th>
                  <th className="py-3.5 px-4">Distance Rate (₹/KM)</th>
                  <th className="py-3.5 px-4">Weight Factor (₹/MT/KM)</th>
                  <th className="py-3.5 px-4">Min Guarantee (₹)</th>
                  <th className="py-3.5 px-4">Loading / Toll Allowance</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                {filteredSlabs.map((slab) => (
                  <tr key={slab.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span className="font-mono px-2 py-0.5 rounded bg-primary/10 text-primary text-[11px]">
                          {slab.slabCode}
                        </span>
                        <span>{slab.slabName}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 max-w-[240px] truncate">{slab.description}</div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-extrabold rounded-md text-xs border border-blue-200 dark:border-blue-800">
                        {slab.minKm} - {slab.maxKm} KM
                      </span>
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      ₹ {slab.fixedBaseRate.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 font-extrabold text-emerald-600 dark:text-emerald-400">
                      ₹ {slab.ratePerKm.toFixed(2)} <span className="text-[10px] font-normal text-slate-400">/ KM</span>
                    </td>

                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      ₹ {slab.ratePerMtPerKm.toFixed(2)} <span className="text-[10px] text-slate-400">/ MT / KM</span>
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                      ₹ {slab.minFixedCharge.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-[11px] text-slate-600 dark:text-slate-400">
                      <div>Loading: ₹{slab.loadingUnloadingFee}</div>
                      {slab.tollAllowance > 0 && <div>Toll: ₹{slab.tollAllowance}</div>}
                    </td>

                    <td className="py-3 px-4">
                      <Badge variant="success">Active</Badge>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => {
                            setCalcDistance(Math.round((slab.minKm + slab.maxKm) / 2));
                            setActiveTab("calculator");
                          }}
                          className="text-primary font-bold text-xs"
                        >
                          Simulate
                        </Button>
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => {
                            setEditingSlab({ ...slab });
                            setIsEditModalOpen(true);
                          }}
                          icon={<Edit2 size={12} />}
                          className="text-xs"
                        >
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: LIVE SLAB & PAYMENT CALCULATOR ───────────────────────── */}
      {activeTab === "calculator" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles size={18} className="text-primary" />
                Live Distance-Slab Calculation & Order Payment Simulator
              </h3>
              <Badge variant="primary">Actual KM Matcher</Badge>
            </div>
            <p className="text-xs text-slate-500">
              Enter any delivery distance in kilometers and sand tonnage to see exactly which statutory slab is selected and how the transportation charge is calculated for citizen order billing.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Actual Delivery Distance (in KM):</span>
                  <span className="text-primary font-black text-base">{calcDistance} KM</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="120"
                  step="0.5"
                  value={calcDistance}
                  onChange={(e) => setCalcDistance(parseFloat(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>1 KM (Local)</span>
                  <span>25 KM (Inter-mandal)</span>
                  <span>50 KM (Arterial)</span>
                  <span>120 KM (Long Haul)</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Sand Quantity (MT)</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={calcQuantity}
                  onChange={(e) => setCalcQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-2xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Logistics Transport Mode</label>
                <select
                  value={calcTransportMode}
                  onChange={(e) => setCalcTransportMode(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-2xs"
                >
                  <option value="Department-arranged transport">Department-arranged Transport (Slab Tariff)</option>
                  <option value="Own vehicle, if permitted">Customer Own Vehicle (Zero Dept Logistics)</option>
                </select>
              </div>
            </div>

            {/* Matched Slab Banner */}
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Matched Statutory KM Slab</span>
                <span className="font-mono font-bold text-primary text-xs">{calculationResult.slab.slabCode}</span>
              </div>
              <div className="text-base font-extrabold text-slate-900 dark:text-white">
                {calculationResult.slab.slabName}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300">
                Covers delivery destinations between <strong>{calculationResult.slab.minKm} KM</strong> and <strong>{calculationResult.slab.maxKm} KM</strong> from source sand stockyard.
              </div>
            </div>

            {/* Calculation Formula Walkthrough */}
            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-800 dark:text-white">Mathematical Computation Walkthrough:</div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-[11px] space-y-1.5 text-slate-800 dark:text-slate-200 leading-relaxed">
                <div>1. Fixed Base Handling Charge = ₹{calculationResult.fixedBaseRate}</div>
                <div>2. Distance Running Charge = {calcDistance} KM × ₹{calculationResult.slab.ratePerKm}/KM = ₹{calculationResult.distanceCharge}</div>
                <div>3. Weight-Distance Factor = {calcQuantity} MT × {calcDistance} KM × ₹{calculationResult.slab.ratePerMtPerKm}/MT/KM = ₹{calculationResult.weightDistanceCharge}</div>
                <div>4. Depot Loading & Toll Allowance = ₹{calculationResult.loadingUnloadingFee + calculationResult.tollAllowance}</div>
                <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800 font-bold text-primary">
                  = Gross Calculated Transport Charge: ₹{calculationResult.finalTransportCharge.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Output Order Payment Preview */}
          <Card className="p-5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs space-y-4 self-start">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="font-bold text-xs text-slate-900 dark:text-white">Order Payment Preview</div>
              <Badge variant="success">Slab Verified</Badge>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Sand Base Amount (10 MT @ ₹475):</span>
                <span className="font-bold text-slate-900 dark:text-white">₹ 4,750</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Statutory Mineral Cess (₹117/MT):</span>
                <span className="font-bold text-slate-900 dark:text-white">₹ 1,170</span>
              </div>
              <div className="flex justify-between font-bold text-primary bg-primary/5 p-2 rounded-lg border border-primary/20">
                <span>Transport Charge ({calcDistance} KM):</span>
                <span className="font-mono text-sm">₹ {calculationResult.finalTransportCharge.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>GST (5% on Subtotal):</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  ₹ {Math.round((4750 + 1170 + calculationResult.finalTransportCharge) * 0.05).toLocaleString()}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">Total Order Payable:</span>
                <span className="font-black text-2xl text-primary font-mono">
                  ₹ {(Math.round((4750 + 1170 + calculationResult.finalTransportCharge) * 1.05)).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-[11px] text-emerald-900 dark:text-emerald-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-600" />
                Automatic Order Billing Linkage
              </div>
              <p>When citizens book sand via the portal, the exact same calculation formula determines the transportation line item on the invoice.</p>
            </div>

            <Button
              variant="primary"
              onClick={() => navigate(routes.createBooking.path)}
              icon={<ArrowRight size={14} />}
              className="w-full text-xs font-bold"
            >
              Test in Real Sand Booking
            </Button>
          </Card>
        </div>
      )}

      {/* ── TAB 3: VEHICLE CATEGORY MULTIPLIERS ───────────────────────── */}
      {activeTab === "vehicles" && (
        <div className="space-y-4">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Truck size={16} className="text-primary" />
              Vehicle Fleet Category Rate Multipliers
            </h3>
            <p>
              Different vehicle capacities have statutory operational multiplier adjustments applied on top of the base distance slabs to account for vehicle payload capacity and fuel consumption curves.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">Tractor-Trailer</span>
                <Badge variant="info">5 MT</Badge>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">1.00x <span className="text-xs font-normal text-slate-500">Base Slab</span></div>
              <div className="text-xs text-slate-500">Suitable for local domestic deliveries up to 15 KM.</div>
            </Card>

            <Card className="p-5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">2-Axle Tipper</span>
                <Badge variant="success">10 MT</Badge>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">1.25x <span className="text-xs font-normal text-slate-500">Base Slab</span></div>
              <div className="text-xs text-slate-500">Standard commercial tipper for intra-district transit.</div>
            </Card>

            <Card className="p-5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">3-Axle Tipper</span>
                <Badge variant="warning">18 MT</Badge>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">1.65x <span className="text-xs font-normal text-slate-500">Base Slab</span></div>
              <div className="text-xs text-slate-500">Heavy multi-axle carrier for infrastructure projects.</div>
            </Card>

            <Card className="p-5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">4-Axle Heavy</span>
                <Badge variant="primary">28 MT</Badge>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">2.20x <span className="text-xs font-normal text-slate-500">Base Slab</span></div>
              <div className="text-xs text-slate-500">Bulk inter-district statutory freight corridor fleet.</div>
            </Card>
          </div>
        </div>
      )}

      {/* ── TAB 4: TERRAIN & DISTRICT FACTORS ─────────────────────────── */}
      {activeTab === "terrain" && (
        <div className="space-y-4">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Navigation size={16} className="text-primary" />
              District Terrain & Gradient Multipliers
            </h3>
            <p>
              Under Rule 14 of the State Sand Policy, hilly and forest mining sectors have special approved terrain loading factors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
              <div className="font-bold text-sm text-slate-900 dark:text-white">Standard Plains (Raipur / Durg / Bilaspur)</div>
              <div className="text-xl font-black text-emerald-600">1.00x <span className="text-xs font-normal text-slate-500">Standard</span></div>
              <p className="text-xs text-slate-500">Flat terrain arterial roads with standard fuel and toll index.</p>
            </Card>

            <Card className="p-5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
              <div className="font-bold text-sm text-slate-900 dark:text-white">Semi-Hilly (Rajnandgaon / Korba / Raigarh)</div>
              <div className="text-xl font-black text-amber-600">1.10x <span className="text-xs font-normal text-slate-500">Terrain Factor</span></div>
              <p className="text-xs text-slate-500">Ghat sections and undulating plateau corridors.</p>
            </Card>

            <Card className="p-5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
              <div className="font-bold text-sm text-slate-900 dark:text-white">Tribal & Forest Zone (Bastar / Surguja / Dantewada)</div>
              <div className="text-xl font-black text-primary">1.20x <span className="text-xs font-normal text-slate-500">Special Zone</span></div>
              <p className="text-xs text-slate-500">Remote reach access with forest checkpost clearances.</p>
            </Card>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT KM SLAB ───────────────────────────────────────── */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Statutory Tariff Slab • ${editingSlab?.slabCode || ""}`}
        size="md"
      >
        {editingSlab && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Slab Name</label>
                <input
                  type="text"
                  value={editingSlab.slabName}
                  onChange={(e) => setEditingSlab({ ...editingSlab, slabName: e.target.value })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Fixed Base Rate (₹)</label>
                <input
                  type="number"
                  value={editingSlab.fixedBaseRate}
                  onChange={(e) => setEditingSlab({ ...editingSlab, fixedBaseRate: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Rate per KM (₹/KM)</label>
                <input
                  type="number"
                  step="0.5"
                  value={editingSlab.ratePerKm}
                  onChange={(e) => setEditingSlab({ ...editingSlab, ratePerKm: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs font-bold text-emerald-600"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Weight Factor (₹/MT/KM)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editingSlab.ratePerMtPerKm}
                  onChange={(e) => setEditingSlab({ ...editingSlab, ratePerMtPerKm: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Min Guarantee (₹)</label>
                <input
                  type="number"
                  value={editingSlab.minFixedCharge}
                  onChange={(e) => setEditingSlab({ ...editingSlab, minFixedCharge: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Loading Fee (₹)</label>
                <input
                  type="number"
                  value={editingSlab.loadingUnloadingFee}
                  onChange={(e) => setEditingSlab({ ...editingSlab, loadingUnloadingFee: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Gazette Description</label>
              <textarea
                rows={2}
                value={editingSlab.description}
                onChange={(e) => setEditingSlab({ ...editingSlab, description: e.target.value })}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs"
              />
            </div>

            <ModalFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveSlab} icon={<Check size={14} />}>
                Save Slab Changes
              </Button>
            </ModalFooter>
          </div>
        )}
      </Modal>

      {/* ── MODAL: GAZETTE NOTIFICATION SCHEDULE ───────────────────────── */}
      <Modal
        isOpen={isGazetteModalOpen}
        onClose={() => setIsGazetteModalOpen(false)}
        title="Official State Gazette Tariff Notification"
        size="lg"
      >
        <div className="space-y-4 text-xs font-sans">
          <div className="text-center pb-3 border-b border-slate-200 dark:border-slate-700 space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Government of Chhattisgarh</div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white">Directorate of Geology & Mining</div>
            <div className="text-xs font-semibold text-primary">
              Order No. CG-MIN-TRF-2026/089-A: Fixation of Mineral Logistics Distance Slabs
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
            In exercise of the powers conferred by Section 15 of the Mines and Minerals (Development and Regulation) Act and Rule 22 of the Chhattisgarh Minor Mineral Rules, 2026, the State Government hereby prescribes the official KM-wise fixed calculation slabs for all department-arranged sand transportation across registered reach stockyards and consumer delivery hubs.
          </div>

          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-[11px]">
                <tr>
                  <th className="p-2.5">Slab</th>
                  <th className="p-2.5">Range (KM)</th>
                  <th className="p-2.5">Base (₹)</th>
                  <th className="p-2.5">Rate/KM</th>
                  <th className="p-2.5">Rate/MT/KM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {slabs.map((s) => (
                  <tr key={s.id}>
                    <td className="p-2 font-bold font-mono">{s.slabCode}</td>
                    <td className="p-2">{s.minKm} - {s.maxKm} KM</td>
                    <td className="p-2 font-bold">₹{s.fixedBaseRate}</td>
                    <td className="p-2 text-emerald-600 font-bold">₹{s.ratePerKm}/KM</td>
                    <td className="p-2">₹{s.ratePerMtPerKm}/MT/KM</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ModalFooter>
            <Button variant="outline" onClick={() => setIsGazetteModalOpen(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={() => window.print()} icon={<Printer size={14} />}>
              Print Gazette
            </Button>
          </ModalFooter>
        </div>
      </Modal>
    </div>
  );
};

export default TransportTariffSlabs;
