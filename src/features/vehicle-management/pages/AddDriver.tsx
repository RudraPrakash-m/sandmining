import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserCheck, ArrowLeft, Award } from "lucide-react";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import Card from "@/shared/components/layout/Card/Card";
import Button from "@/shared/components/ui/Button";
import { useStatusModal } from "@/config/theme/StatusModalContext";
import { routes } from "@/app/routes/routeConfig";
import { inputBase, inputNormal } from "@/shared/components/ui/Forms/inputStyles";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { addDriver as addDriverRedux } from "../slice/vehicleSlice";
import type { Driver, DriverStatus } from "../types";

export const AddDriver: React.FC = () => {
  const dispatch = useAppDispatch();
  const reduxVehicles = useAppSelector((state) => state.vehicle?.vehicles || []);
  const { addDriver: addDriverContext, vehicles: ctxVehicles } = useSandMining();
  const { showSuccess, showError, showWarning } = useStatusModal();
  const navigate = useNavigate();

  const availableVehicles = reduxVehicles.length > 0 ? reduxVehicles : ctxVehicles;

  const [formData, setFormData] = useState({
    driverId: `DRV-CG-RPR-${Math.floor(Math.random() * 900) + 100}`,
    name: "",
    mobile: "98260",
    licenseNumber: "CG-04-DL-2022-",
    licenseValidityDate: "2031-12-31",
    assignedVehicleNumber: availableVehicles[0]?.vehicleNumber || "CG-04-TX-2341",
    address: "",
    aadhaarNumber: "",
    emergencyContact: "",
    bloodGroup: "O+",
    status: "Active" as DriverStatus,
    trainingVerified: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.licenseNumber.trim() || !formData.mobile.trim()) {
      showError("Please enter Driver Name, Mobile Number, and Commercial Driving License.");
      return;
    }

    // Business rule: License Expiry Validation
    const today = new Date().toISOString().split("T")[0];
    const isExpired = formData.licenseValidityDate <= today;
    let finalStatus = formData.status;
    if (isExpired) {
      finalStatus = "License Expired";
      showWarning("Warning: The entered license validity date is in the past. Driver marked as License Expired.");
    }

    const newDriver: Driver = {
      id: `DRV-${Date.now()}`,
      driverId: formData.driverId,
      name: formData.name.trim(),
      mobile: formData.mobile.trim(),
      licenseNumber: formData.licenseNumber.trim(),
      licenseValidityDate: formData.licenseValidityDate,
      assignedVehicleNumber: formData.assignedVehicleNumber,
      address: formData.address.trim() || "Raipur District, Chhattisgarh",
      status: finalStatus,
      trainingVerified: formData.trainingVerified,
      trainingDate: formData.trainingVerified ? today : undefined,
      aadhaarNumber: formData.aadhaarNumber.trim() || undefined,
      emergencyContact: formData.emergencyContact.trim() || undefined,
      bloodGroup: formData.bloodGroup,
    };

    // Dispatch to Redux Store
    dispatch(addDriverRedux(newDriver));

    // Also sync context if present
    if (addDriverContext) {
      addDriverContext({
        driverId: newDriver.driverId,
        name: newDriver.name,
        mobile: newDriver.mobile,
        licenseNumber: newDriver.licenseNumber,
        licenseValidityDate: newDriver.licenseValidityDate,
        assignedVehicleNumber: newDriver.assignedVehicleNumber,
        address: newDriver.address,
        status: newDriver.status,
        trainingVerified: newDriver.trainingVerified,
      });
    }

    showSuccess(`Driver ${newDriver.name} (${newDriver.driverId}) registered and authorized for sand transport!`);
    navigate(routes.drivers.path);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="outline"
          icon={<ArrowLeft size={15} />}
          onClick={() => navigate(routes.drivers.path)}
        >
          Back to Drivers
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Register Commercial Driver</h1>
          <p className="text-xs text-gray-500">Maintain driver identity, Sarathi DL authorization & safety induction</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card
          title="Driver Identity & Statutory Authorization"
          subtitle="One active assignment per vehicle rule and license verification"
          icon={UserCheck}
          action={
            <Button action="save" type="submit">
              Save & Authorize Driver
            </Button>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Driver System ID
              </label>
              <input
                type="text"
                value={formData.driverId}
                readOnly
                className={`${inputBase} ${inputNormal} bg-gray-100 dark:bg-gray-800 font-mono font-bold text-blue-600 dark:text-blue-400`}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Driver Full Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Dharmendra Sahu"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`${inputBase} ${inputNormal}`}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Mobile Number (Linked with OTP) *
              </label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className={`${inputBase} ${inputNormal} font-mono`}
                placeholder="10 digit mobile"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Heavy Commercial License # (Sarathi DL) *
              </label>
              <input
                type="text"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                className={`${inputBase} ${inputNormal} font-mono uppercase`}
                placeholder="CG-04-DL-YYYY-XXXX"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                License Validity Date *
              </label>
              <input
                type="date"
                value={formData.licenseValidityDate}
                onChange={(e) => setFormData({ ...formData, licenseValidityDate: e.target.value })}
                className={`${inputBase} ${inputNormal} font-mono`}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Vehicle Mapping (Active Assignment)
              </label>
              <select
                value={formData.assignedVehicleNumber}
                onChange={(e) => setFormData({ ...formData, assignedVehicleNumber: e.target.value })}
                className={`${inputBase} ${inputNormal} font-mono`}
              >
                {availableVehicles.map((v) => (
                  <option key={v.id} value={v.vehicleNumber}>
                    {v.vehicleNumber} ({v.ownerName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Aadhaar Number / Biometric UID
              </label>
              <input
                type="text"
                placeholder="12-digit Aadhaar UID"
                maxLength={12}
                value={formData.aadhaarNumber}
                onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                className={`${inputBase} ${inputNormal} font-mono`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Emergency Contact Number
              </label>
              <input
                type="tel"
                placeholder="Relative / Next of Kin"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                className={`${inputBase} ${inputNormal} font-mono`}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Residential Address (Village / Ward / District)
              </label>
              <input
                type="text"
                placeholder="e.g. Village Mandir Hasaud, Raipur, Chhattisgarh 492101"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className={`${inputBase} ${inputNormal}`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Initial Authorization Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as DriverStatus })}
                className={`${inputBase} ${inputNormal}`}
              >
                <option value="Active">Active (Ready for Haulage)</option>
                <option value="Pending Verification">Pending Verification</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>

            {/* Training & Verification Checkbox */}
            <div className="sm:col-span-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 mt-2">
              <div className="flex items-start gap-3">
                <input
                  id="safetyInduction"
                  type="checkbox"
                  checked={formData.trainingVerified}
                  onChange={(e) => setFormData({ ...formData, trainingVerified: e.target.checked })}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="safetyInduction" className="cursor-pointer">
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <Award size={14} /> Riverbed Environmental Safety Induction Completed
                  </span>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                    Driver has completed the standard riverbed sand loading safety module, eco-compliance training, and biometric verification badge.
                  </p>
                </label>
              </div>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default AddDriver;
