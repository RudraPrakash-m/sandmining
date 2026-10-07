import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ArrowLeft, ShieldCheck, Mail, Phone, MapPin, Building2, Lock, Check } from "lucide-react";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import Card from "@/shared/components/layout/Card/Card";
import Button from "@/shared/components/ui/Button";
import { useStatusModal } from "@/config/theme/StatusModalContext";
import { routes } from "@/app/routes/routeConfig";
import { inputBase, inputNormal } from "@/shared/components/ui/Forms/inputStyles";
import type { UserStatus } from "../types";

const ALL_AVAILABLE_PERMISSIONS = [
  "SUPER_ADMIN",
  "APPROVE_REACH",
  "ISSUE_PERMIT",
  "APPROVE_EXCAVATION",
  "CAPTURE_TARE",
  "PRINT_WB_SLIP",
  "GENERATE_EPASS",
  "MONITOR_GPS_DISPATCH",
  "CONFIRM_POD_DELIVERY",
  "SEIZE_VEHICLE",
  "ISSUE_CHALLAN",
  "CHECKPOST_INSPECT",
  "LOG_VIOLATION",
  "MANAGE_TICKETS",
  "RESPOND_CITIZENS",
  "ESCALATE_COLLECTOR",
  "RECONCILE_REVENUE",
  "AUDIT_ROYALTY",
  "EXPORT_MIS",
  "SYSTEM_CONFIG",
];

export const AddUserRole: React.FC = () => {
  const { addUser } = useSandMining();
  const { showSuccess, showError } = useStatusModal();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    employeeId: `CG-MIN-00${Math.floor(Math.random() * 90) + 10}`,
    fullName: "S. K. Verma",
    department: "District Mining Office",
    email: "sk.verma@mining.cg.gov.in",
    mobile: "+91 98261 44550",
    role: "District Mining Officer",
    designation: "Assistant Director of Mines",
    district: "Raipur",
    mandal: "Raipur Urban",
    mfaEnabled: true,
    status: "Active" as UserStatus,
    permissions: ["INSPECT_SITES", "VERIFY_WEIGHMENT", "ISSUE_NOTICES", "APPROVE_EXCAVATION"],
  });

  const togglePermission = (perm: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.department.trim()) {
      showError("Please enter all required user profile fields.");
      return;
    }

    addUser({
      employeeId: formData.employeeId,
      fullName: formData.fullName,
      department: formData.department,
      email: formData.email,
      mobile: formData.mobile,
      role: formData.role,
      designation: formData.designation,
      district: formData.district,
      mandal: formData.mandal,
      mfaEnabled: formData.mfaEnabled,
      status: formData.status,
      lastLogin: "Never",
      loginAttempts: 0,
      permissions: formData.permissions,
    });

    showSuccess(`User account ${formData.fullName} (${formData.employeeId}) created with role ${formData.role}!`);
    navigate(routes.userRoles.path);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* ── Page Header ── */}
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="outline"
          icon={<ArrowLeft size={15} />}
          onClick={() => navigate(routes.userRoles.path)}
        >
          Back to Users
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users size={20} className="text-primary" />
            Create Government User Account & Assign RBAC Role
          </h1>
          <p className="text-xs text-gray-500">
            Provision state mining official accounts, department tagging, and granular module access control
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card
          title="User Account & Department Profile"
          subtitle="All created accounts enforce 2-Factor Authentication and Maker-Checker auditing"
          action={
            <Button action="save" type="submit">
              Provision User Account
            </Button>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            {/* Employee ID */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Employee / User ID *
              </label>
              <input
                type="text"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className={`${inputBase} ${inputNormal} font-mono font-bold`}
                required
              />
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. S. K. Verma"
                className={`${inputBase} ${inputNormal}`}
                required
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                <Building2 size={13} className="text-gray-400" />
                Department / Cell *
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className={`${inputBase} ${inputNormal}`}
              >
                <option value="Directorate of Geology & Mining">Directorate of Geology & Mining</option>
                <option value="District Mining Office">District Mining Office</option>
                <option value="Enforcement Flying Squad">Enforcement Flying Squad</option>
                <option value="Citizen Grievance & Helpdesk">Citizen Grievance & Helpdesk</option>
                <option value="Transport & Logistics Control">Transport & Logistics Control</option>
                <option value="Finance & Accounts">Finance & Accounts</option>
              </select>
            </div>

            {/* Official Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                <Mail size={13} className="text-gray-400" />
                Official Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="officer@mining.cg.gov.in"
                className={`${inputBase} ${inputNormal}`}
                required
              />
            </div>

            {/* Mobile Contact */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                <Phone size={13} className="text-gray-400" />
                Mobile Number (for SMS & 2FA) *
              </label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="+91 98261 44550"
                className={`${inputBase} ${inputNormal}`}
                required
              />
            </div>

            {/* Assigned Role */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                <ShieldCheck size={13} className="text-gray-400" />
                Assigned RBAC Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className={`${inputBase} ${inputNormal}`}
              >
                <option value="State Mining Administrator">State Mining Administrator</option>
                <option value="District Mining Officer">District Mining Officer</option>
                <option value="Call Centre">Call Centre Executive</option>
                <option value="Flying Squad Officer">Flying Squad Officer</option>
                <option value="Helpdesk Desk Officer">Helpdesk Desk Officer</option>
                <option value="Weighbridge Operator">Weighbridge Operator</option>
                <option value="Finance & Audit Officer">Finance & Audit Officer</option>
                <option value="Stockyard Supervisor">Stockyard Supervisor</option>
              </select>
            </div>

            {/* Official Designation */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Official Designation
              </label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g. Assistant Director of Mines"
                className={`${inputBase} ${inputNormal}`}
              />
            </div>

            {/* District Jurisdiction */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                <MapPin size={13} className="text-gray-400" />
                District Jurisdiction *
              </label>
              <select
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className={`${inputBase} ${inputNormal}`}
              >
                <option value="Raipur">Raipur</option>
                <option value="Durg">Durg</option>
                <option value="Bilaspur">Bilaspur</option>
                <option value="Korba">Korba</option>
                <option value="Rajnandgaon">Rajnandgaon</option>
                <option value="Jagdalpur">Jagdalpur</option>
              </select>
            </div>

            {/* MFA Option */}
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="mfaToggle"
                checked={formData.mfaEnabled}
                onChange={(e) => setFormData({ ...formData, mfaEnabled: e.target.checked })}
                className="h-4 w-4 rounded text-primary focus:ring-primary"
              />
              <label htmlFor="mfaToggle" className="text-xs text-gray-700 dark:text-gray-300 font-semibold cursor-pointer">
                Enforce Multi-Factor Authentication (SMS OTP on login)
              </label>
            </div>

            {/* Granular Permissions Checklist */}
            <div className="sm:col-span-2 md:col-span-3">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                <Lock size={13} className="text-primary" />
                Granular Module Permissions ({formData.permissions.length} active)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-52 overflow-y-auto p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                {ALL_AVAILABLE_PERMISSIONS.map((perm) => {
                  const isChecked = formData.permissions.includes(perm);
                  return (
                    <button
                      key={perm}
                      type="button"
                      onClick={() => togglePermission(perm)}
                      className={`flex items-center gap-1.5 p-1.5 rounded text-left text-xs transition-colors cursor-pointer ${
                        isChecked
                          ? "bg-primary/10 border border-primary/30 text-primary font-bold"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      <input type="checkbox" checked={isChecked} onChange={() => {}} className="h-3.5 w-3.5 rounded text-primary" />
                      <span className="font-mono text-[10px] truncate">{perm}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default AddUserRole;
