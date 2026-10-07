import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Plus,
  Eye,
  CheckCircle2,
  Truck,
  Award,
  UserX,
  UserCheck,
  Pencil,
  GraduationCap,
  Building2,
  AlertTriangle,
  Check,
} from "lucide-react";
import type { Driver, DriverStatus } from "../types";
import ReusableTable from "@/shared/components/ui/Table/ReusableTable/ReusableTable";
import type { MRT_ColumnDef } from "material-react-table";
import Button from "@/shared/components/ui/Button";
import Badge from "@/shared/components/ui/Badge";
import Card from "@/shared/components/layout/Card/Card";
import Modal, { ModalFooter } from "@/shared/components/ui/Modal/Modal";
import { exportToExcel, exportToPDF } from "@/shared/utils/exportUtils";
import { routes } from "@/app/routes/routeConfig";
import { useStatusModal } from "@/config/theme/StatusModalContext";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import {
  verifyDriver,
  mapDriverVehicle,
  toggleDriverStatus,
  verifyDriverTraining,
} from "../slice/vehicleSlice";
import { inputBase, inputNormal } from "@/shared/components/ui/Forms/inputStyles";
import "../styles/vehicle.css";

export const DriverList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showSuccess } = useStatusModal();

  const drivers = useAppSelector((state) => state.vehicle?.drivers || []);
  const vehicles = useAppSelector((state) => state.vehicle?.vehicles || []);

  // Modal State Management
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);

  // Form states for modals
  const [selectedVehicleNumber, setSelectedVehicleNumber] = useState("CG-04-TX-2341");
  const [trainingDateInput, setTrainingDateInput] = useState("2026-03-09");
  const [deactivateReason, setDeactivateReason] = useState(
    "Temporary suspension: Driver reported non-compliance during loading."
  );

  // Status Badges
  const getStatusBadge = (status: DriverStatus) => {
    switch (status) {
      case "Active":
        return <Badge variant="success">Active</Badge>;
      case "Assigned on Trip":
        return <Badge variant="info">On Trip</Badge>;
      case "Pending Verification":
        return <Badge variant="warning">Pending Verification</Badge>;
      case "License Expired":
        return <Badge variant="secondary">License Expired</Badge>;
      case "Suspended":
        return <Badge variant="danger">Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // KPIs
  const stats = useMemo(() => {
    const totalDrivers = drivers.length;
    const activeCount = drivers.filter((d) => d.status === "Active" || d.status === "Assigned on Trip").length;
    const trainedCount = drivers.filter((d) => d.trainingVerified).length;
    const pendingCount = drivers.filter((d) => d.status === "Pending Verification").length;

    return {
      totalDrivers,
      activeCount,
      trainedCount,
      pendingCount,
    };
  }, [drivers]);

  // Handlers
  const handleConfirmVerification = () => {
    if (!selectedDriver) return;
    dispatch(verifyDriver(selectedDriver.id));
    showSuccess(`Driver ${selectedDriver.name} license verified & authorized for sand transport!`);
    setIsVerifyModalOpen(false);
  };

  const handleConfirmMapVehicle = () => {
    if (!selectedDriver) return;
    dispatch(
      mapDriverVehicle({
        driverId: selectedDriver.id,
        vehicleNumber: selectedVehicleNumber,
      })
    );
    showSuccess(`Driver ${selectedDriver.name} mapped to vehicle ${selectedVehicleNumber}!`);
    setIsMapModalOpen(false);
  };

  const handleConfirmTraining = () => {
    if (!selectedDriver) return;
    dispatch(
      verifyDriverTraining({
        driverId: selectedDriver.id,
        trainingDate: trainingDateInput,
      })
    );
    showSuccess(`Safety Induction & Biometric verification recorded for ${selectedDriver.name}!`);
    setIsTrainingModalOpen(false);
  };

  const handleConfirmToggleStatus = () => {
    if (!selectedDriver) return;
    const nextStatus: DriverStatus = selectedDriver.status === "Suspended" ? "Active" : "Suspended";
    dispatch(
      toggleDriverStatus({
        driverId: selectedDriver.id,
        targetStatus: nextStatus,
      })
    );
    showSuccess(
      `Driver ${selectedDriver.name} is now marked as ${nextStatus}.`
    );
    setIsDeactivateModalOpen(false);
  };

  // Table Columns Definition (Clean Minimal Single-Line Format)
  const columns = useMemo<MRT_ColumnDef<Driver>[]>(
    () => [
      {
        accessorKey: "driverId",
        header: "Driver ID",
        size: 140,
        Cell: ({ row }) => (
          <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
            {row.original.driverId}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: "Name",
        size: 150,
        Cell: ({ row }) => (
          <span className="text-xs font-semibold text-slate-900 dark:text-white truncate block" title={row.original.name}>
            {row.original.name}
          </span>
        ),
      },
      {
        accessorKey: "mobile",
        header: "Mobile",
        size: 120,
        Cell: ({ row }) => (
          <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
            {row.original.mobile}
          </span>
        ),
      },
      {
        accessorKey: "licenseNumber",
        header: "License Number / Validity",
        size: 170,
        Cell: ({ row }) => (
          <span className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate block" title={`${row.original.licenseNumber} (Valid: ${row.original.licenseValidityDate})`}>
            {row.original.licenseNumber}
          </span>
        ),
      },
      {
        accessorKey: "assignedVehicleNumber",
        header: "Vehicle Mapping",
        size: 140,
        Cell: ({ row }) => (
          <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200">
            {row.original.assignedVehicleNumber || "Unassigned"}
          </span>
        ),
      },
      {
        accessorKey: "address",
        header: "Address",
        size: 180,
        Cell: ({ row }) => (
          <span className="text-xs text-slate-600 dark:text-slate-400 truncate block max-w-[170px]" title={row.original.address}>
            {row.original.address}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 130,
        Cell: ({ row }) => getStatusBadge(row.original.status),
      },
      {
        accessorKey: "trainingVerified",
        header: "Training / Verification",
        size: 130,
        Cell: ({ row }) =>
          row.original.trainingVerified ? (
            <Badge variant="success">Verified</Badge>
          ) : (
            <Badge variant="warning">Pending</Badge>
          ),
      },
    ],
    []
  );

  const exportCols = columns.map((c) => ({
    accessorKey: c.accessorKey as string,
    header: c.header as string,
  }));

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Enrolled Drivers
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats.totalDrivers}{" "}
              <span className="text-sm font-semibold text-slate-500">Drivers</span>
            </h3>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
              Authorized for Sand Haulage
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <Users size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active on Duty
            </p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {stats.activeCount}{" "}
              <span className="text-sm font-semibold text-slate-500">Operators</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Vehicle Paired & Active</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Safety Certified
            </p>
            <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
              {stats.trainedCount}{" "}
              <span className="text-sm font-semibold text-slate-500">Trained</span>
            </h3>
            <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5">
              Riverbed Safety Induction Done
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <GraduationCap size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Verification
            </p>
            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {stats.pendingCount}{" "}
              <span className="text-sm font-semibold text-slate-500">Awaiting</span>
            </h3>
            <p className="text-[11px] text-amber-600 mt-0.5">DL Authentication Required</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <AlertTriangle size={22} />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <Card
        title="Driver Directory & Biometric Authorization"
        icon={Users}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              icon={<Truck size={14} />}
              onClick={() => {
                if (drivers[0]) {
                  setSelectedDriver(drivers[0]);
                  setIsMapModalOpen(true);
                }
              }}
            >
              Map Vehicle
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={<Award size={14} />}
              onClick={() => {
                if (drivers[0]) {
                  setSelectedDriver(drivers[0]);
                  setIsTrainingModalOpen(true);
                }
              }}
            >
              Safety Training
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={<Plus size={15} />}
              onClick={() => navigate(routes.addDriver.path)}
            >
              Add Driver
            </Button>
          </div>
        }
      >
        <ReusableTable
          columns={columns}
          data={drivers}
          enableExport={true}
          exportFileName="driver_registry_records"
          onExportExcel={(rows) => exportToExcel(exportCols, rows, "driver_registry_records")}
          onExportPDF={(rows) => exportToPDF(exportCols, rows, "driver_registry_records", "Driver Directory")}
          enableRowActions={true}
          renderRowActions={({ row }) => {
            const driver = row.original;
            const isSuspended = driver.status === "Suspended";
            const isPendingVerification = driver.status === "Pending Verification";
            const canVerify = isPendingVerification;
            const canMapVehicle = !isSuspended && driver.status !== "License Expired";
            const canEdit = !isSuspended;

            return (
              <div className="flex items-center gap-1.5 justify-center">
                {/* 1. View Details (Always Enabled) */}
                <button
                  type="button"
                  title="View Driver Profile"
                  onClick={() => {
                    setSelectedDriver(driver);
                    setIsDetailModalOpen(true);
                  }}
                  className="w-7 h-7 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Eye size={14} />
                </button>

                {/* 2. Verify Driver */}
                <button
                  type="button"
                  title={canVerify ? "Verify DL & Authorize Driver" : "Driver already verified"}
                  disabled={!canVerify}
                  onClick={() => {
                    if (canVerify) {
                      setSelectedDriver(driver);
                      setIsVerifyModalOpen(true);
                    }
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    canVerify
                      ? "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 cursor-pointer"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                  }`}
                >
                  <CheckCircle2 size={14} />
                </button>

                {/* 3. Map / Reassign Vehicle */}
                <button
                  type="button"
                  title={canMapVehicle ? "Map / Reassign Transport Vehicle" : "Vehicle mapping disabled for suspended driver"}
                  disabled={!canMapVehicle}
                  onClick={() => {
                    if (canMapVehicle) {
                      setSelectedDriver(driver);
                      setSelectedVehicleNumber(driver.assignedVehicleNumber || vehicles[0]?.vehicleNumber || "CG-04-TX-2341");
                      setIsMapModalOpen(true);
                    }
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    canMapVehicle
                      ? "bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-600 dark:text-purple-400 cursor-pointer"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                  }`}
                >
                  <Truck size={13} />
                </button>

                {/* 4. Safety Training & Verification */}
                <button
                  type="button"
                  title="Verify Safety Induction & Biometric Badge"
                  onClick={() => {
                    setSelectedDriver(driver);
                    setIsTrainingModalOpen(true);
                  }}
                  className="w-7 h-7 rounded-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Award size={14} />
                </button>

                {/* 5. Activate / Deactivate (Toggle Status) */}
                <button
                  type="button"
                  title={isSuspended ? "Reactivate Driver" : "Deactivate / Suspend Driver"}
                  onClick={() => {
                    setSelectedDriver(driver);
                    setIsDeactivateModalOpen(true);
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                    isSuspended
                      ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                      : "bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
                  }`}
                >
                  {isSuspended ? <UserCheck size={14} /> : <UserX size={14} />}
                </button>

                {/* 6. Edit Driver Profile */}
                <button
                  type="button"
                  title={canEdit ? "Edit Driver Details" : "Cannot edit suspended driver"}
                  disabled={!canEdit}
                  onClick={() => {
                    if (canEdit) navigate(routes.addDriver.path);
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    canEdit
                      ? "bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 cursor-pointer"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                  }`}
                >
                  <Pencil size={13} />
                </button>
              </div>
            );
          }}
        />
      </Card>

      {/* ── 1. VIEW DRIVER PROFILE MODAL ── */}
      {selectedDriver && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Driver Identity – ${selectedDriver.name}`}
          size="lg"
          footer={
            <ModalFooter
              // onClose={() => setIsDetailModalOpen(false)}
              onConfirm={() => setIsDetailModalOpen(false)}
              confirmText="Close"
            />
          }
        >
          <div className="space-y-4 text-xs">
            <div className="flex flex-wrap items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Driver Badge: {selectedDriver.driverId}
                </span>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  {selectedDriver.name}
                </h4>
                <p className="text-[11px] text-slate-500 font-mono">
                  DL: {selectedDriver.licenseNumber} • Mobile: {selectedDriver.mobile}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedDriver.status)}
                {selectedDriver.trainingVerified && (
                  <Badge variant="success">Induction Certified</Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 font-semibold block">Mapped Vehicle</span>
                <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                  {selectedDriver.assignedVehicleNumber || "None"}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40">
                <span className="text-[10px] text-emerald-600 font-semibold block">DL Valid Until</span>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 block mt-0.5">
                  {selectedDriver.licenseValidityDate}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40">
                <span className="text-[10px] text-blue-600 font-semibold block">Blood Group</span>
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300 block mt-0.5">
                  {selectedDriver.bloodGroup || "O+"}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/40">
                <span className="text-[10px] text-purple-600 font-semibold block">Emergency Contact</span>
                <span className="text-xs font-bold font-mono text-purple-700 dark:text-purple-300 block mt-0.5">
                  {selectedDriver.emergencyContact || "9826112244"}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <h5 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Building2 size={14} className="text-blue-500" /> Residential & KYC Address
              </h5>
              <p className="text-slate-700 dark:text-slate-300">{selectedDriver.address}</p>
            </div>
          </div>
        </Modal>
      )}

      {/* ── 2. MAP VEHICLE MODAL ── */}
      {selectedDriver && (
        <Modal
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          title={`Map Vehicle Assignment – ${selectedDriver.name}`}
          size="md"
          footer={
            <ModalFooter
              onClose={() => setIsMapModalOpen(false)}
              onConfirm={handleConfirmMapVehicle}
              confirmText="Confirm Vehicle Mapping"
            />
          }
        >
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Select Authorized Transport Truck *
              </label>
              <select
                value={selectedVehicleNumber}
                onChange={(e) => setSelectedVehicleNumber(e.target.value)}
                className={`${inputBase} ${inputNormal}`}
              >
                {vehicles
                  .filter((v) => !v.isBlacklisted)
                  .map((v) => (
                    <option key={v.id} value={v.vehicleNumber}>
                      {v.vehicleNumber} — {v.vehicleType} ({v.ownerName})
                    </option>
                  ))}
              </select>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-blue-700 dark:text-blue-300 text-[11px] flex items-center gap-2">
              <Truck size={15} />
              <span>
                Enforcing One Active Assignment Policy: The driver will be mapped exclusively to this truck for all active e-Pass dispatches.
              </span>
            </div>
          </div>
        </Modal>
      )}

      {/* ── 3. SAFETY TRAINING MODAL ── */}
      {selectedDriver && (
        <Modal
          isOpen={isTrainingModalOpen}
          onClose={() => setIsTrainingModalOpen(false)}
          title={`Safety Induction & Biometric Badge – ${selectedDriver.name}`}
          size="sm"
          footer={
            <ModalFooter
              onClose={() => setIsTrainingModalOpen(false)}
              onConfirm={handleConfirmTraining}
              confirmText="Certify & Verify"
            />
          }
        >
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Induction Completion Date *
              </label>
              <input
                type="date"
                value={trainingDateInput}
                onChange={(e) => setTrainingDateInput(e.target.value)}
                className={`${inputBase} ${inputNormal}`}
                required
              />
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-[11px] flex items-center gap-2">
              <Award size={16} className="shrink-0 text-emerald-600" />
              <span>
                Certifies that driver completed riverbed environmental protocols, overloading guidelines, and speed safety checks.
              </span>
            </div>
          </div>
        </Modal>
      )}

      {/* ── 4. ACTIVATE / DEACTIVATE MODAL ── */}
      {selectedDriver && (
        <Modal
          isOpen={isDeactivateModalOpen}
          onClose={() => setIsDeactivateModalOpen(false)}
          title={
            selectedDriver.status === "Suspended"
              ? `Reactivate Driver – ${selectedDriver.name}`
              : `Suspend Driver – ${selectedDriver.name}`
          }
          size="sm"
          footer={
            <ModalFooter
              onClose={() => setIsDeactivateModalOpen(false)}
              onConfirm={handleConfirmToggleStatus}
              confirmText={selectedDriver.status === "Suspended" ? "Reactivate" : "Confirm Suspension"}
            />
          }
        >
          <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
            <p>
              {selectedDriver.status === "Suspended"
                ? `Reactivate driver ${selectedDriver.name}? Driver will be restored to active duty for sand transport.`
                : `Are you sure you want to suspend driver ${selectedDriver.name}? The driver will be immediately blocked from all active trips and dispatch queues.`}
            </p>

            {selectedDriver.status !== "Suspended" && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Suspension Reason *
                </label>
                <textarea
                  rows={2}
                  value={deactivateReason}
                  onChange={(e) => setDeactivateReason(e.target.value)}
                  className={`${inputBase} ${inputNormal}`}
                  placeholder="Specify violation or suspension reason..."
                  required
                />
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ── 5. VERIFY DRIVER CLEARANCE MODAL ── */}
      {selectedDriver && (
        <Modal
          isOpen={isVerifyModalOpen}
          onClose={() => setIsVerifyModalOpen(false)}
          title={`Verify Driver License – ${selectedDriver.name}`}
          size="sm"
          footer={
            <ModalFooter
              onClose={() => setIsVerifyModalOpen(false)}
              onConfirm={handleConfirmVerification}
              confirmText="Approve & Verify"
            />
          }
        >
          <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 py-1">
            <p>
              Confirm commercial driving license{" "}
              <strong className="text-slate-900 dark:text-white font-mono">
                {selectedDriver.licenseNumber}
              </strong>{" "}
              for{" "}
              <strong className="text-blue-600 font-bold">{selectedDriver.name}</strong>?
            </p>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-700 dark:text-emerald-300 text-[11px] flex items-center gap-1.5">
              <Check size={14} /> Approving will activate the driver for dispatch queues across all active stockyards.
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DriverList;
