import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Truck, ArrowLeft, Radio, ShieldCheck, FileText, CheckCircle2 } from "lucide-react";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import Card from "@/shared/components/layout/Card/Card";
import Button from "@/shared/components/ui/Button";
import { useStatusModal } from "@/config/theme/StatusModalContext";
import { routes } from "@/app/routes/routeConfig";
import { inputBase, inputNormal } from "@/shared/components/ui/Forms/inputStyles";
import { useAppDispatch } from "@/app/store/hooks";
import { addVehicle } from "../slice/vehicleSlice";
import type { Vehicle, VehicleType, VehicleStatus } from "../types";
import "../styles/vehicle.css";

export const RegisterVehicle: React.FC = () => {
  const { drivers } = useSandMining();
  const { showSuccess, showError } = useStatusModal();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState({
    vehicleNumber: "CG-04-TX-9988",
    ownerName: "",
    ownerMobile: "9826112233",
    driverName: drivers[0]?.name || "Venkat Sahu",
    driverLicense: "CG-04-DL-2020-0988",
    mobile: "9826000123",
    vehicleType: "10-Wheeler Heavy Commercial (16 MT)" as VehicleType,
    capacityMt: 16.0,
    rcNumber: "RC/CG04/2022/100412",
    permitNumber: "PERM/CG/RPR/COMM/884",
    gpsDeviceId: `AIS140-CG-${Math.floor(Math.random() * 9000) + 1000}`,
    fastagRfidRef: `FASTAG-ICICI-${Math.floor(Math.random() * 9000000) + 1000000}`,
    fitnessValidityDate: "2027-12-31",
    insuranceValidityDate: "2027-11-15",
    pucValidityDate: "2026-12-31",
    status: "Verified" as VehicleStatus,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ownerName.trim() || !formData.vehicleNumber.trim()) {
      showError("Please enter Owner Name and Vehicle Registration Plate.");
      return;
    }

    if (formData.capacityMt <= 0) {
      showError("Payload capacity must be greater than 0 MT.");
      return;
    }

    const newVehicle: Vehicle = {
      id: `VEH-${Date.now()}`,
      vehicleNumber: formData.vehicleNumber.toUpperCase(),
      ownerName: formData.ownerName,
      ownerMobile: formData.ownerMobile,
      driverName: formData.driverName,
      driverLicense: formData.driverLicense,
      mobile: formData.mobile,
      vehicleType: formData.vehicleType,
      capacityMt: Number(formData.capacityMt),
      rcNumber: formData.rcNumber,
      permitNumber: formData.permitNumber,
      gpsDeviceId: formData.gpsDeviceId,
      gpsProvider: "Trimble Telematics India",
      isGpsOnline: true,
      fastagRfidRef: formData.fastagRfidRef,
      fitnessValidityDate: formData.fitnessValidityDate,
      insuranceValidityDate: formData.insuranceValidityDate,
      pucValidityDate: formData.pucValidityDate,
      status: formData.status,
      isBlacklisted: false,
      registeredDate: new Date().toISOString().substring(0, 10),
      documents: [
        {
          id: `DOC-${Date.now()}-1`,
          name: "RC Book (Registration Certificate)",
          docNumber: formData.rcNumber,
          validUntil: "2037-05-20",
          status: "Valid",
        },
        {
          id: `DOC-${Date.now()}-2`,
          name: "Commercial Fitness Certificate",
          docNumber: `FIT/RTO/${formData.vehicleNumber.substring(0, 4)}/2026`,
          validUntil: formData.fitnessValidityDate,
          status: "Valid",
        },
        {
          id: `DOC-${Date.now()}-3`,
          name: "Commercial Insurance Certificate",
          docNumber: `INS/COMM/2026/${Math.floor(1000 + Math.random() * 9000)}`,
          validUntil: formData.insuranceValidityDate,
          status: "Valid",
        },
      ],
    };

    dispatch(addVehicle(newVehicle));
    showSuccess(
      `Vehicle ${newVehicle.vehicleNumber} registered and verified with AIS-140 GPS tracker!`
    );
    navigate(routes.vehicles.path);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="outline"
          icon={<ArrowLeft size={15} />}
          onClick={() => navigate(routes.vehicles.path)}
        >
          Back to Fleet
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Register Sand Transport Vehicle
          </h1>
          <p className="text-xs text-gray-500">
            Mandatory GPS device mapping, RC fitness check, and FASTag integration
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Controls */}
          <div className="lg:col-span-2 space-y-4">
            <Card
              title="Vehicle & Telematics Identification"
              icon={Truck}
              subtitle="All commercial sand tippers must undergo electronic inspection before assignment"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Vehicle Number (Plate) *
                  </label>
                  <input
                    type="text"
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                    className={`${inputBase} ${inputNormal} font-mono font-bold uppercase`}
                    placeholder="CG-04-TX-9988"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Vehicle Registered Owner Name *
                  </label>
                  <input
                    type="text"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className={`${inputBase} ${inputNormal}`}
                    placeholder="e.g. Shree Ganesh Sand Logistics LLP"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Owner Contact Mobile
                  </label>
                  <input
                    type="tel"
                    value={formData.ownerMobile}
                    onChange={(e) => setFormData({ ...formData, ownerMobile: e.target.value })}
                    className={`${inputBase} ${inputNormal} font-mono`}
                    placeholder="9826112233"
                    maxLength={10}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Designated Driver *
                  </label>
                  <input
                    type="text"
                    value={formData.driverName}
                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                    className={`${inputBase} ${inputNormal}`}
                    placeholder="e.g. Venkat Sahu"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Driver Mobile Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className={`${inputBase} ${inputNormal} font-mono`}
                    placeholder="9826000123"
                    maxLength={10}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Driver Heavy License No. *
                  </label>
                  <input
                    type="text"
                    value={formData.driverLicense}
                    onChange={(e) => setFormData({ ...formData, driverLicense: e.target.value })}
                    className={`${inputBase} ${inputNormal} font-mono`}
                    placeholder="CG-04-DL-2020-0988"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Commercial Vehicle Category *
                  </label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) =>
                      setFormData({ ...formData, vehicleType: e.target.value as VehicleType })
                    }
                    className={`${inputBase} ${inputNormal}`}
                  >
                    <option value="6-Wheeler Tipper (10 MT)">6-Wheeler Tipper (10 MT)</option>
                    <option value="10-Wheeler Heavy Commercial (16 MT)">
                      10-Wheeler Heavy Commercial (16 MT)
                    </option>
                    <option value="12-Wheeler Multi-Axle (24 MT)">
                      12-Wheeler Multi-Axle (24 MT)
                    </option>
                    <option value="14-Wheeler Heavy Carrier (30 MT)">
                      14-Wheeler Heavy Carrier (30 MT)
                    </option>
                    <option value="Tractor-Trailer (5 MT)">Tractor-Trailer (5 MT)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Payload Capacity (MT) *
                  </label>
                  <input
                    type="number"
                    value={formData.capacityMt}
                    onChange={(e) => setFormData({ ...formData, capacityMt: Number(e.target.value) })}
                    className={`${inputBase} ${inputNormal} font-bold text-orange-600`}
                    min={1}
                    max={50}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    RC Registration Number *
                  </label>
                  <input
                    type="text"
                    value={formData.rcNumber}
                    onChange={(e) => setFormData({ ...formData, rcNumber: e.target.value })}
                    className={`${inputBase} ${inputNormal} font-mono`}
                    placeholder="RC/CG04/2022/100412"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    AIS-140 GPS Device IMEI *
                  </label>
                  <input
                    type="text"
                    value={formData.gpsDeviceId}
                    onChange={(e) => setFormData({ ...formData, gpsDeviceId: e.target.value })}
                    className={`${inputBase} ${inputNormal} font-mono`}
                    placeholder="AIS140-CG-04-9988"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    HSRP / FASTag RFID Reference *
                  </label>
                  <input
                    type="text"
                    value={formData.fastagRfidRef}
                    onChange={(e) => setFormData({ ...formData, fastagRfidRef: e.target.value })}
                    className={`${inputBase} ${inputNormal} font-mono`}
                    placeholder="FASTAG-ICICI-9921448"
                    required
                  />
                </div>
              </div>
            </Card>

            <Card
              title="Statutory Document Validity"
              icon={FileText}
              subtitle="Ensures only compliant trucks receive transport e-Pass permits"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Fitness Validity Date *
                  </label>
                  <input
                    type="date"
                    value={formData.fitnessValidityDate}
                    onChange={(e) =>
                      setFormData({ ...formData, fitnessValidityDate: e.target.value })
                    }
                    className={`${inputBase} ${inputNormal}`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Insurance Validity Date *
                  </label>
                  <input
                    type="date"
                    value={formData.insuranceValidityDate}
                    onChange={(e) =>
                      setFormData({ ...formData, insuranceValidityDate: e.target.value })
                    }
                    className={`${inputBase} ${inputNormal}`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    PUC Validity Date
                  </label>
                  <input
                    type="date"
                    value={formData.pucValidityDate}
                    onChange={(e) => setFormData({ ...formData, pucValidityDate: e.target.value })}
                    className={`${inputBase} ${inputNormal}`}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Verification & Pairing Preview */}
          <div className="space-y-4">
            <Card title="Compliance Preview" icon={ShieldCheck}>
              <div className="space-y-3 pt-1 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Plate:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {formData.vehicleNumber}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Gross Payload:</span>
                    <span className="font-bold text-orange-600 dark:text-orange-400">
                      {formData.capacityMt} MT
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">GPS Status:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <Radio size={12} /> AIS-140 Linked
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-[11px] flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                  <span>
                    Valid for all online sand bookings across authorized Chhattisgarh river reaches.
                  </span>
                </div>
              </div>
            </Card>

            <Button action="save" type="submit" className="w-full justify-center">
              Register & Verify Vehicle
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RegisterVehicle;
