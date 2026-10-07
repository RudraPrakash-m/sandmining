import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Scale, ArrowLeft, RefreshCw, CheckCircle2, Camera, AlertTriangle } from "lucide-react";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import Card from "@/shared/components/layout/Card/Card";
import Button from "@/shared/components/ui/Button";
import { useStatusModal } from "@/config/theme/StatusModalContext";
import { routes } from "@/app/routes/routeConfig";
import { inputBase, inputNormal } from "@/shared/components/ui/Forms/inputStyles";
import { useAppDispatch } from "@/app/store/hooks";
import { addRecord } from "../slice/weighbridgeSlice";
import type { WeighbridgeRecord } from "../types";
import "../styles/weighbridge.css";

export const CaptureWeighbridgeSlip: React.FC = () => {
  const { vehicles, bookings, stockyards } = useSandMining();
  const { showSuccess, showError } = useStatusModal();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [weighbridgeId, setWeighbridgeId] = useState("WB-CG-001");
  const [vehicleNumber, setVehicleNumber] = useState(vehicles[0]?.vehicleNumber || "CG-04-TX-2341");
  const [bookingId, setBookingId] = useState(bookings[0]?.id || "BKG-CG-2026-0941");
  const [stockyardId, setStockyardId] = useState(stockyards[0]?.stockyardId || "STK-CG-001");
  const [tareWeightKg, setTareWeightKg] = useState(8400);
  const [grossWeightKg, setGrossWeightKg] = useState(24400);
  const [operatorName, setOperatorName] = useState("V. N. Dewangan");
  const [remarks, setRemarks] = useState("Automated optical weight reading recorded.");

  const netSandMt = Math.max(0, (grossWeightKg - tareWeightKg) / 1000);
  const isOverload = netSandMt > 20.0;

  const handleFetchSensorWeight = () => {
    const simulatedTare = 8400 + Math.floor(Math.random() * 40 - 20);
    const simulatedGross = simulatedTare + 16000;
    setTareWeightKg(simulatedTare);
    setGrossWeightKg(simulatedGross);
    showSuccess("Electronic load cell sensor readings polled from digital scale.");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (grossWeightKg <= tareWeightKg) {
      showError("Gross loaded weight must strictly exceed empty tare weight.");
      return;
    }

    const slipNumber = `WB-SLIP-2026-${Math.floor(Math.random() * 9000) + 1000}`;
    const targetStockyard = stockyards.find((s) => s.stockyardId === stockyardId || s.id === stockyardId);

    const newRecord: WeighbridgeRecord = {
      id: `WBR-${Date.now()}`,
      weighbridgeId,
      weighbridgeName: "Arang Digital Automated Weighbridge WB-01",
      slipNumber,
      vehicleNumber,
      vehicleRtoType: "10-Wheeler Heavy Commercial (GVW 28T)",
      driverName: "Dharmendra Sahu",
      driverMobile: "9826190012",
      tareWeightKg: Number(tareWeightKg),
      grossWeightKg: Number(grossWeightKg),
      netSandWeightMt: Number(netSandMt.toFixed(2)),
      dateTime: new Date().toISOString().replace("T", " ").substring(0, 16),
      bookingId,
      ePassId: `EPASS-CG-2026-${Math.floor(Math.random() * 9000) + 1000}`,
      stockyardId,
      stockyardName: targetStockyard?.name || "Raipur Central River Stockyard",
      operatorName,
      status: isOverload ? "Flagged Overload" : "Verified",
      photoUrl: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop&q=80",
      anprPlateConfidence: 99.4,
      isOverloaded: isOverload,
      remarks,
    };

    dispatch(addRecord(newRecord));
    showSuccess(
      `Weigh slip ${slipNumber} recorded successfully: Net sand weight ${netSandMt.toFixed(2)} MT!`
    );
    navigate(routes.weighbridge.path);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="outline"
          icon={<ArrowLeft size={15} />}
          onClick={() => navigate(routes.weighbridge.path)}
        >
          Back to Weighbridge Slips
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Capture Electronic Weight Slip
          </h1>
          <p className="text-xs text-gray-500">
            Automated sensor reading, vehicle tare deduction & digital net sand certification
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Controls */}
          <div className="lg:col-span-2 space-y-4">
            <Card
              title="Weighing Parameters & Vehicle Assignment"
              icon={Scale}
              subtitle="Linked with e-Pass & Booking authorization"
              action={
                <Button action="save" type="submit">
                  Generate Weigh Slip
                </Button>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Weighbridge Scale Location *
                  </label>
                  <select
                    value={weighbridgeId}
                    onChange={(e) => setWeighbridgeId(e.target.value)}
                    className={`${inputBase} ${inputNormal}`}
                  >
                    <option value="WB-CG-001">WB-CG-001 (Arang Scale 01)</option>
                    <option value="WB-CG-002">WB-CG-002 (Koni Scale 02)</option>
                    <option value="WB-CG-003">WB-CG-003 (Pulgaon Scale 03)</option>
                    <option value="WB-CG-004">WB-CG-004 (Darri Scale 04)</option>
                    <option value="WB-CG-005">WB-CG-005 (Indravati Scale 05)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Origin Sand Stockyard *
                  </label>
                  <select
                    value={stockyardId}
                    onChange={(e) => setStockyardId(e.target.value)}
                    className={`${inputBase} ${inputNormal}`}
                  >
                    {stockyards.map((s) => (
                      <option key={s.id} value={s.stockyardId}>
                        {s.name} ({s.district})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Vehicle Number (Plate) *
                  </label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className={`${inputBase} ${inputNormal} font-mono font-bold`}
                    placeholder="CG-04-TX-2341"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Booking Reference ID *
                  </label>
                  <input
                    type="text"
                    value={bookingId}
                    onChange={(e) => setBookingId(e.target.value)}
                    className={`${inputBase} ${inputNormal} font-mono`}
                    placeholder="BKG-CG-2026-0941"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Empty Tare Weight (kg) *
                    </label>
                    <button
                      type="button"
                      onClick={handleFetchSensorWeight}
                      className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <RefreshCw size={11} /> Poll Scale
                    </button>
                  </div>
                  <input
                    type="number"
                    value={tareWeightKg}
                    onChange={(e) => setTareWeightKg(Number(e.target.value))}
                    className={`${inputBase} ${inputNormal} font-bold`}
                    min={2000}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Loaded Gross Weight (kg) *
                  </label>
                  <input
                    type="number"
                    value={grossWeightKg}
                    onChange={(e) => setGrossWeightKg(Number(e.target.value))}
                    className={`${inputBase} ${inputNormal} font-bold text-orange-600`}
                    min={tareWeightKg + 100}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Duty Operator Name *
                  </label>
                  <input
                    type="text"
                    value={operatorName}
                    onChange={(e) => setOperatorName(e.target.value)}
                    className={`${inputBase} ${inputNormal}`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Weighment Inspection Notes
                  </label>
                  <input
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className={`${inputBase} ${inputNormal}`}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* LCD Live Sensor Telemetry */}
          <div className="space-y-4">
            <Card title="Live Scale Telemetry" icon={Scale}>
              <div className="space-y-3 pt-1">
                <div className="weighbridge-display-lcd space-y-2">
                  <div className="flex justify-between items-center text-xs border-b border-slate-700 pb-1.5">
                    <span className="text-slate-400">Scale Status:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 size={12} /> ONLINE & CALIBRATED
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Gross Loaded:</span>
                    <span className="font-bold text-white">{grossWeightKg.toLocaleString()} kg</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Tare Unladen:</span>
                    <span className="font-bold text-amber-400">
                      -{tareWeightKg.toLocaleString()} kg
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                    <span className="text-xs uppercase font-bold text-slate-300">Net Sand:</span>
                    <span className="text-xl font-black text-emerald-400 font-mono">
                      {netSandMt.toFixed(2)} MT
                    </span>
                  </div>
                </div>

                {isOverload && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                    <AlertTriangle size={16} className="shrink-0 text-rose-600" />
                    <span>Warning: Net sand exceeds booked allocation limit!</span>
                  </div>
                )}
              </div>
            </Card>

            <Card title="ANPR Camera Optical Verification" icon={Camera}>
              <div className="space-y-2 pt-1 text-xs">
                <div className="anpr-snapshot-frame">
                  <img
                    src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop&q=80"
                    alt="Vehicle ANPR"
                    className="w-full h-32 object-cover"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>ANPR Confidence:</span>
                  <span className="font-mono font-bold text-emerald-600">99.4% (CG-04-TX-2341)</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CaptureWeighbridgeSlip;
