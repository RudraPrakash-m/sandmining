import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  UserCheck,
  KeyRound,
  Ban,
  CheckCircle2,
  PlusCircle,
  ShieldAlert,
  Users,
  Building2,
  MapPin,
  Clock,
  ShieldCheck,
  RefreshCw,
  Download,
  Printer,
  Key,
  Lock,
  Mail,
  Phone,
  Check,
} from "lucide-react";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import type { SystemUser } from "@/features/shared-simulation/types";
import ReusableTable from "@/shared/components/ui/Table/ReusableTable/ReusableTable";
import type { MRT_ColumnDef } from "material-react-table";
import Button from "@/shared/components/ui/Button";
import Badge from "@/shared/components/ui/Badge";
import Card from "@/shared/components/layout/Card/Card";
import Modal, { ModalFooter } from "@/shared/components/ui/Modal/Modal";
import DialogModal from "@/shared/components/ui/DialogModal";
import { useStatusModal } from "@/config/theme/StatusModalContext";
import { exportToExcel, exportToPDF } from "@/shared/utils/exportUtils";
import { routes } from "@/app/routes/routeConfig";
import { inputBase, inputNormal } from "@/shared/components/ui/Forms/inputStyles";
import "../styles/userRoles.css";

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

export const UserList: React.FC = () => {
  const {
    systemUsers,
    toggleUserStatus,
    updateUserRoleAndPermissions,
    resetUserPassword,
  } = useSandMining();
  const { showSuccess, showError } = useStatusModal();
  const navigate = useNavigate();

  // Active Modals state
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [assignRoleModalUser, setAssignRoleModalUser] = useState<SystemUser | null>(null);
  const [resetPwdModalUser, setResetPwdModalUser] = useState<SystemUser | null>(null);
  const [statusToggleUser, setStatusToggleUser] = useState<SystemUser | null>(null);

  // Form states inside Assign Role modal
  const [assignedRole, setAssignedRole] = useState("");
  const [assignedDept, setAssignedDept] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [makerCheckerApproval, setMakerCheckerApproval] = useState(true);

  // Form states inside Reset Password modal
  const [sendSmsNotification, setSendSmsNotification] = useState(true);
  const [generatedTempToken, setGeneratedTempToken] = useState<string | null>(null);

  // Metrics
  const totalUsers = systemUsers.length;
  const activeUsers = systemUsers.filter((u) => u.status === "Active").length;
  const mfaEnabledCount = systemUsers.filter((u) => u.mfaEnabled).length;
  const suspendedCount = systemUsers.filter((u) => u.status === "Suspended" || u.status === "Inactive").length;

  const statusVariant: Record<string, any> = {
    Active: "success",
    Inactive: "secondary",
    Suspended: "danger",
    "Password Reset Required": "warning",
  };

  const columns: MRT_ColumnDef<SystemUser>[] = [
    {
      accessorKey: "employeeId",
      header: "User ID",
      size: 130,
      Cell: ({ row }) => (
        <button
          type="button"
          onClick={() => setSelectedUser(row.original)}
          className="text-left font-mono text-xs font-bold text-primary hover:underline"
          title="Click to view full user security dossier"
        >
          {row.original.employeeId}
        </button>
      ),
    },
    {
      accessorKey: "fullName",
      header: "Name",
      size: 180,
      Cell: ({ row }) => (
        <div>
          <span className="font-semibold text-gray-900 dark:text-white block text-xs">
            {row.original.fullName}
          </span>
          <span className="text-[11px] text-gray-500">{row.original.email}</span>
        </div>
      ),
    },
    {
      accessorKey: "department",
      header: "Department",
      size: 180,
      Cell: ({ row }) => (
        <span className="text-xs text-gray-800 dark:text-gray-200 flex items-center gap-1">
          <Building2 size={12} className="text-gray-400 shrink-0" />
          <span className="truncate max-w-[160px]" title={row.original.department}>
            {row.original.department || "Directorate of Mining"}
          </span>
        </span>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      size: 180,
      Cell: ({ row }) => (
        <div>
          <span className="font-medium text-xs text-gray-900 dark:text-white block">
            {row.original.role}
          </span>
          <span className="text-[11px] text-gray-500">{row.original.designation}</span>
        </div>
      ),
    },
    {
      accessorKey: "district",
      header: "District",
      size: 120,
      Cell: ({ row }) => (
        <span className="text-xs flex items-center gap-1 text-gray-700 dark:text-gray-300">
          <MapPin size={12} className="text-gray-400 shrink-0" />
          {row.original.district}
        </span>
      ),
    },
    {
      accessorKey: "permissions",
      header: "Permissions",
      size: 200,
      Cell: ({ row }) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {row.original.permissions?.slice(0, 2).map((perm: string) => (
            <span
              key={perm}
              className="px-1.5 py-0.5 text-[9px] font-bold bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300 rounded"
            >
              {perm}
            </span>
          ))}
          {row.original.permissions?.length > 2 && (
            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded">
              +{row.original.permissions.length - 2} more
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      size: 160,
      Cell: ({ row }) => (
        <Badge variant={statusVariant[row.original.status] || "secondary"}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "lastLogin",
      header: "Last login",
      size: 140,
      Cell: ({ row }) => (
        <span className="font-mono text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
          <Clock size={12} className="text-gray-400 shrink-0" />
          {row.original.lastLogin || "Never"}
        </span>
      ),
    },
  ];

  const exportCols = [
    { accessorKey: "employeeId", header: "User ID" },
    { accessorKey: "fullName", header: "Name" },
    { accessorKey: "department", header: "Department" },
    { accessorKey: "role", header: "Role" },
    { accessorKey: "district", header: "District" },
    { accessorKey: "status", header: "Status" },
    { accessorKey: "lastLogin", header: "Last Login" },
  ];

  // Condition rules for all 4 row actions
  const canAssignRole = (u: SystemUser) => u.status !== "Suspended";
  const canResetPassword = (u: SystemUser) => u.status !== "Password Reset Required";
  const canToggleActive = (_u: SystemUser) => true;

  const togglePermissionSelection = (perm: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="text-primary" size={24} />
            User, Role & Access Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Control module permissions, role-based access control (RBAC), multi-factor authentication, and maker-checker approval policies.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={14} />}
            onClick={() => exportToExcel(exportCols, systemUsers, "SMMS_User_Registry")}
          >
            Export Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Printer size={14} />}
            onClick={() => exportToPDF(exportCols, systemUsers, "SMMS_User_Registry", "User, Role & Access Management")}
          >
            Export PDF
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<PlusCircle size={15} />}
            onClick={() => navigate(routes.addUserRole.path)}
          >
            Add User
          </Button>
        </div>
      </div>

      {/* ── Top KPI Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total User Accounts</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalUsers}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Across all mining cells</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
            <Users size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Authorized</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{activeUsers}</p>
            <p className="text-[11px] text-emerald-600 mt-0.5">RBAC policy enforced</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">MFA Protected</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{mfaEnabledCount}</p>
            <p className="text-[11px] text-purple-600 mt-0.5">2-Factor OTP verified</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Suspended / Inactive</p>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{suspendedCount}</p>
            <p className="text-[11px] text-rose-600 mt-0.5">Access locked by admin</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 flex items-center justify-center">
            <ShieldAlert size={20} />
          </div>
        </div>
      </div>

      {/* ── Main User Table wrapped in Reusable Card ── */}
      <Card
        title="Authorized Users & Role-Based Access Ledger"
        subtitle="Granular permissions, Department tagging, Maker-Checker authorization policies, and security audit trail"
        icon={Users}
        action={
          <Button
            size="sm"
            variant="outline"
            icon={<RefreshCw size={13} />}
            onClick={() => showSuccess("User directory and token states refreshed.")}
          >
            Refresh
          </Button>
        }
      >
        <ReusableTable
          columns={columns}
          data={systemUsers}
          exportFileName="SMMS_System_Users"
          onExportExcel={(rows) => exportToExcel(exportCols, rows, "SMMS_System_Users")}
          onExportPDF={(rows) => exportToPDF(exportCols, rows, "SMMS_System_Users", "User Management")}
          enableRowActions
          renderRowActions={({ row }) => {
            const u = row.original;
            const assignOk = canAssignRole(u);
            const resetOk = canResetPassword(u);
            const toggleOk = canToggleActive(u);

            return (
              <div className="flex items-center gap-1">
                {/* 1. View User Security Dossier */}
                <button
                  type="button"
                  title="View User Profile & Access Privileges Dossier"
                  onClick={() => setSelectedUser(u)}
                  className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 transition-colors cursor-pointer"
                >
                  <Eye size={16} />
                </button>

                {/* 2. Assign Role & Permissions */}
                <button
                  type="button"
                  disabled={!assignOk}
                  title={
                    assignOk
                      ? "Assign Role & Modify Module Permissions"
                      : "Cannot modify permissions of suspended user"
                  }
                  onClick={() => {
                    if (assignOk) {
                      setAssignedRole(u.role);
                      setAssignedDept(u.department || "Directorate of Mining");
                      setSelectedPermissions(u.permissions || []);
                      setAssignRoleModalUser(u);
                    }
                  }}
                  className={`p-1.5 rounded transition-colors ${
                    assignOk
                      ? "hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 cursor-pointer"
                      : "opacity-40 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <Key size={16} />
                </button>

                {/* 3. Reset Password */}
                <button
                  type="button"
                  disabled={!resetOk}
                  title={
                    resetOk
                      ? "Trigger Secure Password Reset & Access Token"
                      : "Temporary reset token already pending user login"
                  }
                  onClick={() => {
                    if (resetOk) {
                      setGeneratedTempToken(null);
                      setResetPwdModalUser(u);
                    }
                  }}
                  className={`p-1.5 rounded transition-colors ${
                    resetOk
                      ? "hover:bg-amber-50 dark:hover:bg-amber-900/30 text-amber-600 cursor-pointer"
                      : "opacity-40 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <KeyRound size={16} />
                </button>

                {/* 4. Activate / Deactivate Toggle */}
                <button
                  type="button"
                  disabled={!toggleOk}
                  title={u.status === "Active" ? "Deactivate / Suspend User" : "Activate User Account"}
                  onClick={() => setStatusToggleUser(u)}
                  className={`p-1.5 rounded transition-colors ${
                    u.status === "Active"
                      ? "hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-600 cursor-pointer"
                      : "hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-600 cursor-pointer"
                  }`}
                >
                  <Ban size={16} />
                </button>
              </div>
            );
          }}
        />
      </Card>

      {/* ── 1. Modal: View User Security Dossier ── */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title={`User Security Dossier – ${selectedUser?.fullName}`}
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-5 text-sm">
            {/* Top Badge Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-primary">{selectedUser.employeeId}</span>
                <Badge variant={statusVariant[selectedUser.status] || "secondary"}>
                  {selectedUser.status}
                </Badge>
                <Badge variant={selectedUser.mfaEnabled ? "success" : "warning"}>
                  MFA: {selectedUser.mfaEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <div className="text-xs text-gray-500 font-medium">
                Last Login: <span className="font-mono text-gray-900 dark:text-white">{selectedUser.lastLogin || "Never"}</span>
              </div>
            </div>

            {/* Profile Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500">Full Name</p>
                <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{selectedUser.fullName}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Official Email</p>
                <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1 mt-0.5">
                  <Mail size={12} className="text-gray-400" />
                  {selectedUser.email}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Mobile Contact</p>
                <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1 mt-0.5">
                  <Phone size={12} className="text-gray-400" />
                  {selectedUser.mobile}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Department</p>
                <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{selectedUser.department}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Assigned Role</p>
                <p className="font-semibold text-primary mt-0.5">{selectedUser.role}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Designation</p>
                <p className="font-medium text-gray-900 dark:text-white mt-0.5">{selectedUser.designation}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">District Jurisdiction</p>
                <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1 mt-0.5">
                  <MapPin size={12} className="text-gray-400" />
                  {selectedUser.district} ({selectedUser.mandal})
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Failed Login Attempts</p>
                <p className="font-mono font-bold text-gray-900 dark:text-white mt-0.5">
                  {selectedUser.loginAttempts}
                </p>
              </div>
            </div>

            {/* Granular Permissions */}
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Lock size={14} className="text-primary" />
                Assigned RBAC Module Permissions
              </p>
              <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                {selectedUser.permissions?.map((p: string) => (
                  <span
                    key={p}
                    className="px-2.5 py-1 text-xs font-mono font-bold bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300 rounded-md border border-orange-200 dark:border-orange-800/60 flex items-center gap-1"
                  >
                    <Check size={11} /> {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedUser(null)}>
            Close Dossier
          </Button>
        </ModalFooter>
      </Modal>

      {/* ── 2. Modal: Assign Role & Modify Permissions ── */}
      <Modal
        isOpen={!!assignRoleModalUser}
        onClose={() => setAssignRoleModalUser(null)}
        title={`Assign Role & Permissions – ${assignRoleModalUser?.fullName}`}
        size="lg"
      >
        {assignRoleModalUser && (
          <div className="space-y-4 text-sm">
            <p className="text-xs text-gray-500">
              Configure Role-Based Access Control (RBAC) and module-level write/approve permissions for employee{" "}
              <strong>{assignRoleModalUser.employeeId}</strong>.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Assigned System Role *
                </label>
                <select
                  value={assignedRole}
                  onChange={(e) => setAssignedRole(e.target.value)}
                  className={`${inputBase} ${inputNormal}`}
                >
                  <option value="State Mining Administrator">State Mining Administrator</option>
                  <option value="District Mining Officer">District Mining Officer</option>
                  <option value="Flying Squad Officer">Flying Squad Officer</option>
                  <option value="Helpdesk Desk Officer">Helpdesk Desk Officer</option>
                  <option value="Weighbridge Operator">Weighbridge Operator</option>
                  <option value="Finance & Audit Officer">Finance & Audit Officer</option>
                  <option value="Stockyard Supervisor">Stockyard Supervisor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Department
                </label>
                <input
                  type="text"
                  value={assignedDept}
                  onChange={(e) => setAssignedDept(e.target.value)}
                  className={`${inputBase} ${inputNormal}`}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Granular Module Permissions ({selectedPermissions.length} selected)
                </label>
                <button
                  type="button"
                  onClick={() => setSelectedPermissions(ALL_AVAILABLE_PERMISSIONS)}
                  className="text-[11px] text-primary hover:underline font-semibold"
                >
                  Select All
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                {ALL_AVAILABLE_PERMISSIONS.map((perm) => {
                  const isChecked = selectedPermissions.includes(perm);
                  return (
                    <button
                      key={perm}
                      type="button"
                      onClick={() => togglePermissionSelection(perm)}
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

            <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
              <input
                type="checkbox"
                id="makerCheckerCheck"
                checked={makerCheckerApproval}
                onChange={(e) => setMakerCheckerApproval(e.target.checked)}
                className="h-4 w-4 rounded text-primary focus:ring-primary"
              />
              <label htmlFor="makerCheckerCheck" className="text-xs text-amber-900 dark:text-amber-200 font-semibold cursor-pointer">
                Enforce Maker-Checker approval workflow for sensitive mining permits & seizure orders
              </label>
            </div>
          </div>
        )}
        <ModalFooter>
          <Button variant="outline" onClick={() => setAssignRoleModalUser(null)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={<UserCheck size={14} />}
            onClick={() => {
              if (assignRoleModalUser) {
                updateUserRoleAndPermissions(
                  assignRoleModalUser.id,
                  assignedRole,
                  selectedPermissions,
                  assignedDept
                );
                showSuccess(`Roles & permissions updated for ${assignRoleModalUser.fullName}`);
                setAssignRoleModalUser(null);
              }
            }}
          >
            Save Role Permissions
          </Button>
        </ModalFooter>
      </Modal>

      {/* ── 3. Modal: Reset Password & Issue Access Token ── */}
      <Modal
        isOpen={!!resetPwdModalUser}
        onClose={() => setResetPwdModalUser(null)}
        title={`Reset Password – ${resetPwdModalUser?.fullName}`}
      >
        {resetPwdModalUser && (
          <div className="space-y-4 text-sm">
            <p className="text-xs text-gray-500">
              Generate a temporary one-time password (OTP token) and require user to set a fresh password upon next login.
            </p>

            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border text-xs space-y-1">
              <p>
                <span className="text-gray-500">Employee:</span>{" "}
                <span className="font-bold text-gray-900 dark:text-white">{resetPwdModalUser.fullName}</span>
              </p>
              <p>
                <span className="text-gray-500">Email:</span> {resetPwdModalUser.email}
              </p>
              <p>
                <span className="text-gray-500">Mobile:</span> {resetPwdModalUser.mobile}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="smsNotifyCheck"
                checked={sendSmsNotification}
                onChange={(e) => setSendSmsNotification(e.target.checked)}
                className="h-4 w-4 rounded text-primary focus:ring-primary"
              />
              <label htmlFor="smsNotifyCheck" className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                Send temporary access token via SMS to {resetPwdModalUser.mobile}
              </label>
            </div>

            {generatedTempToken && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-lg text-center">
                <p className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold mb-1">
                  Temporary Access Token Generated:
                </p>
                <p className="text-lg font-mono font-bold text-emerald-700 dark:text-emerald-300 tracking-wider">
                  {generatedTempToken}
                </p>
                <p className="text-[10px] text-gray-500 mt-1">Valid for 15 minutes</p>
              </div>
            )}
          </div>
        )}
        <ModalFooter>
          <Button variant="outline" onClick={() => setResetPwdModalUser(null)}>
            Close
          </Button>
          {!generatedTempToken && (
            <Button
              variant="primary"
              icon={<KeyRound size={14} />}
              onClick={() => {
                if (resetPwdModalUser) {
                  const token = resetUserPassword(resetPwdModalUser.id);
                  setGeneratedTempToken(token);
                  showSuccess(`Password reset token generated for ${resetPwdModalUser.fullName}`);
                }
              }}
            >
              Generate Reset Token
            </Button>
          )}
        </ModalFooter>
      </Modal>

      {/* ── 4. DialogModal: Confirm User Status Toggle ── */}
      <DialogModal
        isOpen={!!statusToggleUser}
        onClose={() => setStatusToggleUser(null)}
        title={statusToggleUser?.status === "Active" ? "Deactivate User Account" : "Activate User Account"}
        message={`Are you sure you want to change account status for ${statusToggleUser?.fullName} (${statusToggleUser?.employeeId}) to ${
          statusToggleUser?.status === "Active" ? "Inactive" : "Active"
        }?`}
        onConfirm={() => {
          if (statusToggleUser) {
            toggleUserStatus(statusToggleUser.id);
            showSuccess(`User ${statusToggleUser.fullName} status updated.`);
            setStatusToggleUser(null);
          }
        }}
        confirmText={statusToggleUser?.status === "Active" ? "Deactivate" : "Activate"}
        cancelText="Cancel"
        variant={statusToggleUser?.status === "Active" ? "danger" : "primary"}
      />
    </div>
  );
};

export default UserList;
