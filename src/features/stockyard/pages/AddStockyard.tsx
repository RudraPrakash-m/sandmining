import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, ArrowLeft, Layers, Scale, ShieldCheck } from "lucide-react";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import Card from "@/shared/components/layout/Card/Card";
import Button from "@/shared/components/ui/Button";
import { useStatusModal } from "@/config/theme/StatusModalContext";
import { routes } from "@/app/routes/routeConfig";
import { inputBase, inputNormal } from "@/shared/components/ui/Forms/inputStyles";
import { useAppDispatch } from "@/app/store/hooks";
import { addStockyard } from "../slice/stockyardSlice";
import type { Stockyard, SandType, StockyardStatus } from "../types";
import "../styles/stockyard.css";

const CG_DISTRICTS = [
  "Raipur",
  "Bilaspur",
  "Durg",
  "Korba",
  "Bastar",
  "Rajnandgaon",
  "Janjgir-Champa",
  "Raigarh",
  "Balod",
  "Bemetara",
  "Kabirdham",
  "Mahasamund",
  "Dhamtari",
  "Gariaband",
  "Baloda Bazar",
  "Mungeli",
  "Surajpur",
  "Surguja",
  "Balrampur",
  "Koriya",
  "Jashpur",
  "Kanker",
  "Kondagaon",
  "Narayanpur",
  "Bijapur",
  "Dantewada",
  "Sukma",
  "Gaurela-Pendra-Marwahi",
  "Khairagarh-Chhuikhadan-Gandai",
  "Mohla-Manpur-Ambagarh Chowki",
  "Sarangarh-Bilaigarh",
  "Shakti",
  "Manendragarh-Chirmiri-Bharatpur",
];

export const AddStockyard: React.FC = () => {
  const { weighbridges } = useSandMining();
  const { showSuccess, showError } = useStatusModal();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState({
    stockyardId: `STK-CG-00${Math.floor(Math.random() * 90) + 10}`,
    name: "",
    district: "Raipur",
    location: "",
    sandType: "Coarse River Sand" as SandType,
    capacityMt: 15000,
    openingStockMt: 5000,
    linkedWeighbridgeId: weighbridges[0]?.weighbridgeId || "WB-CG-001",
    managerName: "Devendra Verma",
    contactNumber: "9826145520",
    status: "Active" as StockyardStatus,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.location.trim()) {
      showError("Please enter Stockyard Name and Specific Location / Landmark.");
      return;
    }

    if (formData.capacityMt <= 0) {
      showError("Storage capacity must be greater than 0 MT.");
      return;
    }

    if (formData.openingStockMt > formData.capacityMt) {
      showError("Opening stock cannot exceed total storage capacity.");
      return;
    }

    const linkedWb = weighbridges.find(
      (w) => w.id === formData.linkedWeighbridgeId || w.weighbridgeId === formData.linkedWeighbridgeId
    );

    const newStockyard: Stockyard = {
      id: `STK-${Date.now()}`,
      stockyardId: formData.stockyardId,
      name: formData.name,
      district: formData.district,
      location: formData.location,
      sandType: formData.sandType,
      openingStockMt: Number(formData.openingStockMt),
      receivedMt: 0,
      dispatchedMt: 0,
      closingStockMt: Number(formData.openingStockMt),
      capacityMt: Number(formData.capacityMt),
      availableQuantityMt: Number(formData.openingStockMt),
      linkedWeighbridgeId: formData.linkedWeighbridgeId,
      linkedWeighbridgeName: linkedWb?.weighbridgeName || "Automated In-Motion Weighbridge",
      managerName: formData.managerName,
      contactNumber: formData.contactNumber,
      status: formData.status,
    };

    dispatch(addStockyard(newStockyard));
    showSuccess(
      `Stockyard ${formData.name} (${formData.stockyardId}) registered successfully and linked to ${formData.linkedWeighbridgeId}!`
    );
    navigate(routes.stockyard.path);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="outline"
          icon={<ArrowLeft size={15} />}
          onClick={() => navigate(routes.stockyard.path)}
        >
          Back to Stockyards
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Register Sand Stockyard / Depot
          </h1>
          <p className="text-xs text-gray-500">
            Establish authorized sand stocking point with automated weighbridge gate
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Parameters */}
          <div className="lg:col-span-2 space-y-4">
            <Card
              title="Stockyard Facility Parameters"
              icon={Building2}
              subtitle="Establish physical storage capacity limits and weighbridge integration"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Stockyard ID (System)
                  </label>
                  <input
                    type="text"
                    value={formData.stockyardId}
                    readOnly
                    className={`${inputBase} ${inputNormal} bg-gray-100 dark:bg-gray-800 font-mono`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Stockyard Facility Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`${inputBase} ${inputNormal}`}
                    placeholder="e.g. Raipur Central River Stockyard Lot-A"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    District Jurisdiction *
                  </label>
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className={`${inputBase} ${inputNormal}`}
                  >
                    {CG_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Location / Landmark Address *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className={`${inputBase} ${inputNormal}`}
                    placeholder="e.g. Arang Riverbed Sector 4, NH-53"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Primary Sand Grade *
                  </label>
                  <select
                    value={formData.sandType}
                    onChange={(e) =>
                      setFormData({ ...formData, sandType: e.target.value as SandType })
                    }
                    className={`${inputBase} ${inputNormal}`}
                  >
                    <option value="Coarse River Sand">Coarse River Sand</option>
                    <option value="Medium Concrete Sand">Medium Concrete Sand</option>
                    <option value="Fine Plastering Sand">Fine Plastering Sand</option>
                    <option value="Gravel Sand">Gravel Sand</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Max Capacity (MT) *
                  </label>
                  <input
                    type="number"
                    value={formData.capacityMt}
                    onChange={(e) =>
                      setFormData({ ...formData, capacityMt: Number(e.target.value) })
                    }
                    className={`${inputBase} ${inputNormal} font-bold`}
                    min={100}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Initial Opening Stock (MT) *
                  </label>
                  <input
                    type="number"
                    value={formData.openingStockMt}
                    onChange={(e) =>
                      setFormData({ ...formData, openingStockMt: Number(e.target.value) })
                    }
                    className={`${inputBase} ${inputNormal} font-bold text-orange-600`}
                    min={0}
                    max={formData.capacityMt}
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Linked Automated Weighbridge *
                  </label>
                  <select
                    value={formData.linkedWeighbridgeId}
                    onChange={(e) =>
                      setFormData({ ...formData, linkedWeighbridgeId: e.target.value })
                    }
                    className={`${inputBase} ${inputNormal}`}
                  >
                    {weighbridges.map((wb) => (
                      <option key={wb.id} value={wb.weighbridgeId}>
                        {wb.weighbridgeId} — {wb.weighbridgeName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Operational Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as StockyardStatus })
                    }
                    className={`${inputBase} ${inputNormal}`}
                  >
                    <option value="Active">Active</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>
            </Card>

            <Card
              title="Depot In-Charge & Security"
              icon={ShieldCheck}
              subtitle="Contact person responsible for physical audit compliance"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Yard Manager Name
                  </label>
                  <input
                    type="text"
                    value={formData.managerName}
                    onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                    className={`${inputBase} ${inputNormal}`}
                    placeholder="e.g. Devendra Verma"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Manager Contact Mobile No.
                  </label>
                  <input
                    type="tel"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    className={`${inputBase} ${inputNormal} font-mono`}
                    placeholder="9826145520"
                    maxLength={10}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Capacity Preview Sidebar */}
          <div className="space-y-4">
            <Card title="Capacity & Fill Rate" icon={Layers}>
              <div className="space-y-3 pt-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Total Capacity:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                    {formData.capacityMt.toLocaleString()} MT
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Opening Stock:</span>
                  <span className="font-bold text-orange-600 dark:text-orange-400 font-mono">
                    {formData.openingStockMt.toLocaleString()} MT
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Available Free Space:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {Math.max(0, formData.capacityMt - formData.openingStockMt).toLocaleString()} MT
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Fill Level:
                    </span>
                    <span className="font-bold font-mono text-sm text-slate-900 dark:text-white">
                      {formData.capacityMt > 0
                        ? Math.round((formData.openingStockMt / formData.capacityMt) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="stock-capacity-pill">
                    <div
                      className="stock-capacity-fill bg-emerald-500"
                      style={{
                        width: `${Math.min(
                          100,
                          formData.capacityMt > 0
                            ? (formData.openingStockMt / formData.capacityMt) * 100
                            : 0
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded-xl space-y-2 text-xs text-blue-800 dark:text-blue-300">
              <div className="flex items-center gap-1.5 font-bold">
                <Scale size={15} /> Automated Stock Ledger Rules
              </div>
              <p className="text-[11px] leading-relaxed">
                Every dispatch and incoming excavation will automatically balance this stockyard's double-entry inventory ledger.
              </p>
            </div>

            <Button action="save" type="submit" className="w-full justify-center">
              Register Stockyard
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddStockyard;
