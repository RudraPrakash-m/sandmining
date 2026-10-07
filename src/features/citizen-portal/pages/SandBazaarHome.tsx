import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  MapPin,
  Truck,
  Calculator,
  ShieldCheck,
  PhoneCall,
  FileText,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import Card from "@/shared/components/layout/Card/Card";
import Button from "@/shared/components/ui/Button";
import Badge from "@/shared/components/ui/Badge";
import { routes } from "@/app/routes/routeConfig";

export const SandBazaarHome: React.FC = () => {
  const { stockyards, setActiveRole } = useSandMining();
  const navigate = useNavigate();

  const [selectedDistrict, setSelectedDistrict] = useState("Raipur");
  const [calcQty, setCalcQty] = useState(10);
  const [calcDistance, setCalcDistance] = useState(25);
  const [trackOrderId, setTrackOrderId] = useState("");

  const filteredYards = stockyards.filter(
    (s) => s.district.toLowerCase() === selectedDistrict.toLowerCase()
  );

  // Dynamic Price Estimator
  const baseRate = 475;
  const royalty = 85;
  const dmf = 17;
  const transport = calcDistance * 8.5 * calcQty;
  const subTotal = (baseRate + royalty + dmf) * calcQty + transport;
  const gst = Math.round(subTotal * 0.05);
  const estimatedTotal = subTotal + gst;

  const handleTrack = () => {
    navigate(routes.citizenMyOrders.path);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-3">
          <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Public Citizen Sand Bazaar
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Order Government Certified River Sand at Regulated Tariffs
          </h1>
          <p className="text-xs sm:text-sm text-orange-100">
            Transparent online booking, automated electronic weighbridge certification, real-time GPS transit tracking, and doorstep delivery OTP verification.
          </p>
          <div className="flex items-center gap-3 pt-2 flex-wrap">
            <Button
              size="lg"
              variant="primary"
              className="bg-slate-950 hover:bg-slate-900 text-white font-bold"
              icon={<ShoppingCart size={18} />}
              onClick={() => {
                setActiveRole("Super Admin");
                navigate(routes.createBooking.path);
              }}
            >
              Book Sand Online Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10"
              onClick={() => navigate(routes.citizenRegistration.path)}
            >
              New Citizen KYC Onboarding
            </Button>
          </div>
        </div>
      </div>

      {/* 3 Columns: Check Availability + Live Tariff Estimator + Track My Order */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Check Available Stock */}
        <div>
          <Card
            title="Check Stockyard Availability"
            subtitle="Live inventory in authorized government depots"
          >
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Select Delivery District
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-border-color dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                >
                  <option value="Raipur">Raipur</option>
                  <option value="Durg">Durg</option>
                  <option value="Bilaspur">Bilaspur</option>
                  <option value="Rajnandgaon">Rajnandgaon</option>
                  <option value="Korba">Korba</option>
                  <option value="Raigarh">Raigarh</option>
                  <option value="Dhamtari">Dhamtari</option>
                  <option value="Janjgir-Champa">Janjgir-Champa</option>
                  <option value="Bastar">Bastar</option>
                  <option value="Surguja">Surguja</option>
                </select>
              </div>

              <div className="space-y-2.5">
                {filteredYards.length > 0 ? (
                  filteredYards.map((y) => (
                    <div
                      key={y.id}
                      className="p-3 rounded-xl border border-border-color dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 text-xs"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{y.name}</p>
                          <p className="text-[11px] text-gray-500">{y.sandType}</p>
                        </div>
                        <Badge variant="primary" className="text-[10px]">
                          Available
                        </Badge>
                      </div>
                      <div className="mt-2 flex justify-between font-mono text-[11px] text-gray-700 dark:text-gray-300">
                        <span>Current Stock:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {y.availableQuantityMt.toLocaleString()} MT
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 py-3">No active stockyards found in this district.</p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* 2. Transparent Rate Calculator */}
        <div>
          <Card
            title="Instant Tariff & Cost Estimator"
            subtitle="Regulated base price, royalty, DMF cess & transport"
          >
            <div className="space-y-3 pt-1 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Sand Quantity (MT)</label>
                  <input
                    type="number"
                    value={calcQty}
                    onChange={(e) => setCalcQty(Math.max(1, Number(e.target.value)))}
                    className="w-full p-2 text-xs rounded-xl border border-border-color dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Distance from Yard (km)</label>
                  <input
                    type="number"
                    value={calcDistance}
                    onChange={(e) => setCalcDistance(Math.max(1, Number(e.target.value)))}
                    className="w-full p-2 text-xs rounded-xl border border-border-color dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl space-y-1.5 border border-border-color dark:border-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-500">Base Material ({calcQty} MT @ ₹475):</span>
                  <span className="font-mono">₹ {(baseRate * calcQty).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">State Royalty ({calcQty} MT @ ₹85):</span>
                  <span className="font-mono">₹ {(royalty * calcQty).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">District Mineral Fund (DMF):</span>
                  <span className="font-mono">₹ {(dmf * calcQty).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Transport Logistics ({calcDistance} km):</span>
                  <span className="font-mono">₹ {transport.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">GST (5%):</span>
                  <span className="font-mono">₹ {gst.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-orange-600 dark:text-orange-400 pt-1.5 border-t border-gray-200 dark:border-gray-700">
                  <span>ESTIMATED PAYABLE:</span>
                  <span>₹ {estimatedTotal.toLocaleString()}</span>
                </div>
              </div>

              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  setActiveRole("Citizen");
                  navigate(routes.createBooking.path);
                }}
              >
                Proceed to Book at This Rate
              </Button>
            </div>
          </Card>
        </div>

        {/* 3. Track My Order */}
        <div>
          <Card
            title="Track Consignment / e-Pass"
            subtitle="Live status lookup by Order ID or Registered Mobile"
          >
            <div className="space-y-3 pt-1 text-xs">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Enter Order # or Mobile</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. SMMS-ORD-2026-8801"
                    value={trackOrderId}
                    onChange={(e) => setTrackOrderId(e.target.value)}
                    className="flex-1 p-2 text-xs rounded-xl border border-border-color dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-mono"
                  />
                  <Button size="sm" variant="primary" onClick={handleTrack}>
                    Track
                  </Button>
                </div>
              </div>

              {/* Sample Quick Track preview */}
              <div className="p-3.5 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300">
                    SMMS-ORD-2026-8801
                  </span>
                  <Badge variant="primary" className="text-[10px]">
                    In Transit
                  </Badge>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Vehicle: <strong>CG-04-TX-2341</strong> (10 MT Coarse Sand)
                </p>
                <p className="text-gray-500 text-[11px]">
                  Estimated Arrival: <strong>14 Minutes</strong> • Delivery OTP: <strong>7834</strong>
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs"
                  onClick={() => navigate(routes.citizenMyOrders.path)}
                >
                  View Full Live Telematics & e-Pass
                </Button>
              </div>

              <div className="pt-2 border-t border-border-color dark:border-gray-800">
                <p className="text-[11px] text-gray-500 font-medium mb-1 flex items-center gap-1">
                  <HelpCircle size={13} className="text-orange-500" />
                  Need Help or Have a Grievance?
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full text-xs text-orange-600"
                  onClick={() => navigate(routes.raiseGrievance.path)}
                >
                  File Public Service Complaint
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SandBazaarHome;
