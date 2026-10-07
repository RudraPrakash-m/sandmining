import React, { useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Truck,
  Plus,
  Eye,
  CheckCircle2,
  Navigation,
  FileText,
  ShieldAlert,
  Pencil,
  AlertTriangle,
  Radio,
  Building2,
  CreditCard,
  Ban,
  Check,
  Camera,
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Sparkles,
  Cpu,
  ListOrdered,
} from "lucide-react";
import type { Vehicle, VehicleStatus } from "../types";
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
  toggleBlacklist,
  verifyVehicle,
  assignGps,
  updateVehiclePhoto,
} from "../slice/vehicleSlice";
import { inputBase, inputNormal } from "@/shared/components/ui/Forms/inputStyles";
import "../styles/vehicle.css";

export const VehicleList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showSuccess, showError } = useStatusModal();

  const vehicles = useAppSelector((state) => state.vehicle?.vehicles || []);

  // Modal State Management
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isGpsModalOpen, setIsGpsModalOpen] = useState(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [isBlacklistModalOpen, setIsBlacklistModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // Photo Upload States
  const [photoInputUrl, setPhotoInputUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Preset sample vehicle photos
  const PRESET_VEHICLE_PHOTOS = [
    {
      name: "Tata Signa Tipper (10 MT)",
      url: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop&q=80",
    },
    {
      name: "Commercial Heavy Dumper (16 MT)",
      url: "https://images.unsplash.com/photo-1586191582156-f83141f23719?w=600&auto=format&fit=crop&q=80",
    },
    {
      name: "Multi-Axle Sand Carrier (24 MT)",
      url: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=600&auto=format&fit=crop&q=80",
    },
  ];

  // Form states for modals
  const [gpsImeiInput, setGpsImeiInput] = useState("AIS140-CG-04-9988");
  const [gpsProviderInput, setGpsProviderInput] = useState("Trimble Telematics India");
  const [blacklistReasonInput, setBlacklistReasonInput] = useState(
    "Flagged by Flying Squad: Operating outside designated dispatch corridor."
  );

  // Status Badges
  const getStatusBadge = (status: VehicleStatus) => {
    switch (status) {
      case "Verified":
        return <Badge variant="success">Verified</Badge>;
      case "Pending Verification":
        return <Badge variant="warning">Pending Verification</Badge>;
      case "Expired Docs":
        return <Badge variant="secondary">Expired Docs</Badge>;
      case "Blacklisted":
        return <Badge variant="danger">Blacklisted</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // KPIs
  const stats = useMemo(() => {
    const totalRegistered = vehicles.length;
    const verifiedCount = vehicles.filter((v) => v.status === "Verified").length;
    const pendingCount = vehicles.filter((v) => v.status === "Pending Verification").length;
    const blacklistedCount = vehicles.filter((v) => v.isBlacklisted).length;
    const onlineGpsCount = vehicles.filter((v) => v.isGpsOnline).length;

    return {
      totalRegistered,
      verifiedCount,
      pendingCount,
      blacklistedCount,
      onlineGpsCount,
    };
  }, [vehicles]);

  // Photo handlers
  const handleOpenPhotoModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setPhotoInputUrl(vehicle.photoUrl || "");
    setIsPhotoModalOpen(true);
  };

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      showError("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setPhotoInputUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleSavePhoto = () => {
    if (!selectedVehicle) return;
    dispatch(
      updateVehiclePhoto({
        id: selectedVehicle.id,
        photoUrl: photoInputUrl,
      })
    );
    showSuccess(`Vehicle photo updated for ${selectedVehicle.vehicleNumber}!`);
    setIsPhotoModalOpen(false);
  };

  // Modal submit handlers
  const handleConfirmVerification = () => {
    if (!selectedVehicle) return;
    dispatch(verifyVehicle(selectedVehicle.id));
    showSuccess(`Vehicle ${selectedVehicle.vehicleNumber} documents verified & cleared for dispatch!`);
    setIsVerifyModalOpen(false);
  };

  const handleConfirmGpsAssign = () => {
    if (!selectedVehicle) return;
    if (!gpsImeiInput.trim()) {
      showError("Please provide valid AIS-140 GPS Device IMEI.");
      return;
    }
    dispatch(
      assignGps({
        id: selectedVehicle.id,
        gpsDeviceId: gpsImeiInput,
        gpsProvider: gpsProviderInput,
      })
    );
    showSuccess(`GPS Device ${gpsImeiInput} assigned to ${selectedVehicle.vehicleNumber} and live telemetry verified!`);
    setIsGpsModalOpen(false);
  };

  const handleConfirmBlacklistToggle = () => {
    if (!selectedVehicle) return;
    dispatch(
      toggleBlacklist({
        id: selectedVehicle.id,
        reason: blacklistReasonInput,
      })
    );
    showSuccess(
      `Vehicle ${selectedVehicle.vehicleNumber} ${
        selectedVehicle.isBlacklisted ? "unblocked and restored to fleet." : "blacklisted and blocked from sand dispatch."
      }`
    );
    setIsBlacklistModalOpen(false);
  };

  // Table Columns Definition (Clean Minimal Single-Line Format)
  const columns = useMemo<MRT_ColumnDef<Vehicle>[]>(
    () => [
      {
        accessorKey: "vehicleNumber",
        header: "Vehicle Number",
        size: 140,
        Cell: ({ row }) => (
          <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
            {row.original.vehicleNumber}
          </span>
        ),
      },
      {
        accessorKey: "ownerName",
        header: "Owner",
        size: 160,
        Cell: ({ row }) => (
          <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate block" title={row.original.ownerName}>
            {row.original.ownerName}
          </span>
        ),
      },
      {
        accessorKey: "driverName",
        header: "Driver",
        size: 130,
        Cell: ({ row }) => (
          <span className="text-xs text-slate-700 dark:text-slate-300 truncate block">
            {row.original.driverName}
          </span>
        ),
      },
      {
        accessorKey: "mobile",
        header: "Mobile",
        size: 115,
        Cell: ({ row }) => (
          <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
            {row.original.mobile}
          </span>
        ),
      },
      {
        accessorKey: "capacityMt",
        header: "Capacity",
        size: 95,
        Cell: ({ row }) => (
          <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
            {row.original.capacityMt} MT
          </span>
        ),
      },
      {
        accessorKey: "rcNumber",
        header: "RC / Permit Details",
        size: 160,
        Cell: ({ row }) => (
          <span className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate block" title={`${row.original.rcNumber} (${row.original.permitNumber || "Commercial"})`}>
            {row.original.rcNumber}
          </span>
        ),
      },
      {
        accessorKey: "gpsDeviceId",
        header: "GPS Device ID",
        size: 140,
        Cell: ({ row }) => (
          <div className="flex items-center gap-1 text-xs font-mono text-slate-700 dark:text-slate-300">
            <span
              className={`gps-ping-indicator ${
                row.original.isGpsOnline ? "bg-emerald-500" : "bg-slate-400"
              }`}
            />
            <span className="truncate" title={row.original.gpsDeviceId}>{row.original.gpsDeviceId}</span>
          </div>
        ),
      },
      {
        accessorKey: "fastagRfidRef",
        header: "HSRP / FASTag Ref",
        size: 140,
        Cell: ({ row }) => (
          <span className="text-xs font-mono text-blue-600 dark:text-blue-400 truncate block" title={row.original.fastagRfidRef}>
            {row.original.fastagRfidRef}
          </span>
        ),
      },
      {
        accessorKey: "fitnessValidityDate",
        header: "Fitness / Insurance Valid",
        size: 155,
        Cell: ({ row }) => (
          <span className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
            Fit: {row.original.fitnessValidityDate}
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
        accessorKey: "isBlacklisted",
        header: "Blacklisted Flag",
        size: 120,
        Cell: ({ row }) =>
          row.original.isBlacklisted ? (
            <Badge variant="danger">Blacklisted</Badge>
          ) : (
            <Badge variant="success">Clear</Badge>
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
              Total Fleet Strength
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats.totalRegistered}{" "}
              <span className="text-sm font-semibold text-slate-500">Trucks</span>
            </h3>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
              Across Commercial RTO Categories
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <Truck size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Verified & Dispatch Ready
            </p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {stats.verifiedCount}{" "}
              <span className="text-sm font-semibold text-slate-500">Vehicles</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Valid Fitness & Insurance</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Online AIS-140 GPS
            </p>
            <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
              {stats.onlineGpsCount}{" "}
              <span className="text-sm font-semibold text-slate-500">Pinging</span>
            </h3>
            <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5">
              Live Route Telemetry Active
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Radio size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Enforcement Blocked
            </p>
            <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
              {stats.blacklistedCount}{" "}
              <span className="text-sm font-semibold text-slate-500">Blacklisted</span>
            </h3>
            <p className="text-[11px] text-rose-600 mt-0.5">Blocked from e-Pass Assignment</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <ShieldAlert size={22} />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <Card
        title="Sand Transport Vehicle Registry"
        icon={Truck}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              icon={<Navigation size={14} />}
              onClick={() => {
                if (vehicles[0]) {
                  setSelectedVehicle(vehicles[0]);
                  setIsGpsModalOpen(true);
                }
              }}
            >
              Assign GPS
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={<FileText size={14} />}
              onClick={() => {
                if (vehicles[0]) {
                  setSelectedVehicle(vehicles[0]);
                  setIsDocsModalOpen(true);
                }
              }}
            >
              View Documents
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={<ListOrdered size={14} className="text-emerald-600" />}
              className="border-emerald-500/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 font-bold"
              onClick={() => navigate(routes.vehicleQueue.path)}
            >
              Vehicle Queue
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={<Cpu size={14} className="text-emerald-600" />}
              className="border-emerald-500/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 font-bold"
              onClick={() => navigate(routes.automaticAllocation.path)}
            >
              FIFO Allocation Queue
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={<Plus size={15} />}
              onClick={() => navigate(routes.registerVehicle.path)}
            >
              Register Vehicle
            </Button>
          </div>
        }
      >
        <ReusableTable
          columns={columns}
          data={vehicles}
          enableExport={true}
          exportFileName="sand_transport_vehicles"
          onExportExcel={(rows) => exportToExcel(exportCols, rows, "sand_transport_vehicles")}
          onExportPDF={(rows) => exportToPDF(exportCols, rows, "sand_transport_vehicles", "Vehicle Fleet Registry")}
          enableRowActions={true}
          renderRowActions={({ row }) => {
            const vehicle = row.original;
            const isBlacklisted = vehicle.isBlacklisted;
            const isPendingVerification = vehicle.status === "Pending Verification";
            const canVerify = isPendingVerification;
            const canAssignGps = !isBlacklisted;
            const canEdit = !isBlacklisted;

            return (
              <div className="flex items-center gap-1.5 justify-center">
                {/* 1. View Details (Always Enabled) */}
                <button
                  type="button"
                  title="View Vehicle Profile & Telemetry"
                  onClick={() => {
                    setSelectedVehicle(vehicle);
                    setIsDetailModalOpen(true);
                  }}
                  className="w-7 h-7 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Eye size={14} />
                </button>

                {/* 2. Upload / View Photo */}
                <button
                  type="button"
                  title="Upload / Change Vehicle Photo"
                  onClick={() => handleOpenPhotoModal(vehicle)}
                  className="w-7 h-7 rounded-full bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Camera size={13} />
                </button>

                {/* 3. Verify Vehicle & RC */}
                <button
                  type="button"
                  title={canVerify ? "Verify Vehicle & Clearance for Dispatch" : "Already verified"}
                  disabled={!canVerify}
                  onClick={() => {
                    if (canVerify) {
                      setSelectedVehicle(vehicle);
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

                {/* 4. Assign / Calibrate GPS Device */}
                <button
                  type="button"
                  title={canAssignGps ? "Assign / Calibrate AIS-140 GPS Device" : "GPS disabled for blacklisted vehicle"}
                  disabled={!canAssignGps}
                  onClick={() => {
                    if (canAssignGps) {
                      setSelectedVehicle(vehicle);
                      setGpsImeiInput(vehicle.gpsDeviceId || "AIS140-CG-04-9988");
                      setIsGpsModalOpen(true);
                    }
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    canAssignGps
                      ? "bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-600 dark:text-purple-400 cursor-pointer"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                  }`}
                >
                  <Navigation size={13} />
                </button>

                {/* 5. View Compliance Documents */}
                <button
                  type="button"
                  title="View RC, Fitness, Insurance & PUC Documents"
                  onClick={() => {
                    setSelectedVehicle(vehicle);
                    setIsDocsModalOpen(true);
                  }}
                  className="w-7 h-7 rounded-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <FileText size={13} />
                </button>

                {/* 6. Block / Unblock (Blacklist Control) */}
                <button
                  type="button"
                  title={isBlacklisted ? "Unblock / Restore Vehicle" : "Blacklist Vehicle (Enforcement Action)"}
                  onClick={() => {
                    setSelectedVehicle(vehicle);
                    setIsBlacklistModalOpen(true);
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                    isBlacklisted
                      ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                      : "bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
                  }`}
                >
                  {isBlacklisted ? <ShieldAlert size={14} /> : <Ban size={14} />}
                </button>

                {/* 7. Edit Vehicle Parameters */}
                <button
                  type="button"
                  title={canEdit ? "Edit Vehicle Details" : "Cannot edit blacklisted vehicle"}
                  disabled={!canEdit}
                  onClick={() => {
                    if (canEdit) navigate(routes.registerVehicle.path);
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

      {/* ── 1. VIEW VEHICLE PROFILE MODAL ── */}
      {selectedVehicle && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Vehicle Profile – ${selectedVehicle.vehicleNumber}`}
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
            {/* Vehicle Header with Photo */}
            <div className="flex flex-col sm:flex-row gap-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="relative w-full sm:w-36 h-28 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 border border-slate-300 dark:border-slate-600 group shadow-sm">
                {selectedVehicle.photoUrl ? (
                  <img
                    src={selectedVehicle.photoUrl}
                    alt={selectedVehicle.vehicleNumber}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-slate-400 gap-1">
                    <Truck size={30} />
                    <span className="text-[10px] font-medium">No Photo</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleOpenPhotoModal(selectedVehicle);
                  }}
                  className="absolute bottom-1.5 right-1.5 px-2 py-1 rounded bg-slate-900/80 hover:bg-slate-950 text-white text-[10px] font-medium flex items-center gap-1 shadow transition-all cursor-pointer backdrop-blur-xs"
                  title="Upload or Change Photo"
                >
                  <Camera size={11} /> {selectedVehicle.photoUrl ? "Change" : "Upload"}
                </button>
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      Registration Plate
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base font-mono">
                      {selectedVehicle.vehicleNumber}
                    </h4>
                    <p className="text-[11px] text-slate-500">{selectedVehicle.vehicleType}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedVehicle.status)}
                    {selectedVehicle.isBlacklisted && <Badge variant="danger">Blocked</Badge>}
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 mt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                  <span>Registered: {selectedVehicle.registeredDate || "2026-01-10"}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      handleOpenPhotoModal(selectedVehicle);
                    }}
                    className="text-orange-600 dark:text-orange-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Camera size={12} /> Manage Vehicle Photo
                  </button>
                </div>
              </div>
            </div>

            {selectedVehicle.isBlacklisted && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle size={16} className="shrink-0 text-rose-600" />
                <span>
                  <strong>Blacklist Reason:</strong> {selectedVehicle.blacklistReason}
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-orange-50/60 dark:bg-orange-950/30 border border-orange-200/60 dark:border-orange-900/40">
                <span className="text-[10px] text-orange-600 font-semibold block">Payload Capacity</span>
                <span className="text-sm font-black text-orange-700 dark:text-orange-300">
                  {selectedVehicle.capacityMt} MT
                </span>
              </div>
              <div className="p-3 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40">
                <span className="text-[10px] text-blue-600 font-semibold block">GPS Telemetry</span>
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300 block mt-0.5">
                  {selectedVehicle.isGpsOnline ? "Live Online" : "Offline"}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40">
                <span className="text-[10px] text-emerald-600 font-semibold block">Fitness Valid Until</span>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 block mt-0.5">
                  {selectedVehicle.fitnessValidityDate}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/40">
                <span className="text-[10px] text-purple-600 font-semibold block">Insurance Valid Until</span>
                <span className="text-xs font-bold text-purple-700 dark:text-purple-300 block mt-0.5">
                  {selectedVehicle.insuranceValidityDate}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div>
                <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                  <Building2 size={14} className="text-blue-500" /> Ownership & RC Details
                </h5>
                <p className="text-slate-700 dark:text-slate-300">
                  Owner: <span className="font-semibold">{selectedVehicle.ownerName}</span>
                </p>
                <p className="text-slate-500 font-mono">RC No: {selectedVehicle.rcNumber}</p>
                <p className="text-slate-500 font-mono">FASTag Ref: {selectedVehicle.fastagRfidRef}</p>
              </div>

              <div>
                <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                  <CreditCard size={14} className="text-purple-500" /> Driver & GPS Assignment
                </h5>
                <p className="text-slate-700 dark:text-slate-300">
                  Driver: <span className="font-semibold">{selectedVehicle.driverName}</span>
                </p>
                <p className="text-slate-500 font-mono">Mobile: {selectedVehicle.mobile}</p>
                <p className="text-slate-500 font-mono">GPS IMEI: {selectedVehicle.gpsDeviceId}</p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── 2. ASSIGN GPS MODAL ── */}
      {selectedVehicle && (
        <Modal
          isOpen={isGpsModalOpen}
          onClose={() => setIsGpsModalOpen(false)}
          title={`Assign / Calibrate AIS-140 GPS – ${selectedVehicle.vehicleNumber}`}
          size="md"
          footer={
            <ModalFooter
              onClose={() => setIsGpsModalOpen(false)}
              onConfirm={handleConfirmGpsAssign}
              confirmText="Link & Verify Telemetry"
            />
          }
        >
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                AIS-140 Certified GPS Tracker IMEI *
              </label>
              <input
                type="text"
                value={gpsImeiInput}
                onChange={(e) => setGpsImeiInput(e.target.value)}
                className={`${inputBase} ${inputNormal} font-mono`}
                placeholder="AIS140-CG-04-9988"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Telematics Provider
              </label>
              <select
                value={gpsProviderInput}
                onChange={(e) => setGpsProviderInput(e.target.value)}
                className={`${inputBase} ${inputNormal}`}
              >
                <option value="Trimble Telematics India">Trimble Telematics India</option>
                <option value="Minda iConnect">Minda iConnect</option>
                <option value="Autocop TrackPro">Autocop TrackPro</option>
                <option value="Sensel Telematics">Sensel Telematics</option>
              </select>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-blue-700 dark:text-blue-300 text-[11px] flex items-center gap-2">
              <Radio size={14} className="animate-pulse text-blue-600" />
              <span>Live signal test will verify geolocation and geo-fence alerts on state GIS.</span>
            </div>
          </div>
        </Modal>
      )}

      {/* ── 3. VIEW DOCUMENTS MODAL ── */}
      {selectedVehicle && (
        <Modal
          isOpen={isDocsModalOpen}
          onClose={() => setIsDocsModalOpen(false)}
          title={`Statutory Compliance Documents – ${selectedVehicle.vehicleNumber}`}
          size="md"
          footer={
            <ModalFooter
              onClose={() => setIsDocsModalOpen(false)}
              onConfirm={() => setIsDocsModalOpen(false)}
              confirmText="Done"
            />
          }
        >
          <div className="space-y-2 text-xs">
            {(selectedVehicle.documents || [
              {
                id: "D1",
                name: "RC Book (Registration Certificate)",
                docNumber: selectedVehicle.rcNumber,
                validUntil: "2036-05-20",
                status: "Valid",
              },
              {
                id: "D2",
                name: "Commercial Fitness Certificate",
                docNumber: "FIT/RTO/2026/0991",
                validUntil: selectedVehicle.fitnessValidityDate,
                status: "Valid",
              },
              {
                id: "D3",
                name: "Comprehensive Commercial Insurance",
                docNumber: "INS/COMM/2026/4401",
                validUntil: selectedVehicle.insuranceValidityDate,
                status: "Valid",
              },
            ]).map((doc) => (
              <div
                key={doc.id}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{doc.name}</p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Ref: {doc.docNumber} • Valid till: {doc.validUntil}
                  </p>
                </div>
                <Badge variant={doc.status === "Valid" ? "success" : "warning"}>{doc.status}</Badge>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* ── 4. BLOCK / UNBLOCK BLACKLIST MODAL ── */}
      {selectedVehicle && (
        <Modal
          isOpen={isBlacklistModalOpen}
          onClose={() => setIsBlacklistModalOpen(false)}
          title={
            selectedVehicle.isBlacklisted
              ? `Restore Vehicle – ${selectedVehicle.vehicleNumber}`
              : `Blacklist Vehicle – ${selectedVehicle.vehicleNumber}`
          }
          size="sm"
          footer={
            <ModalFooter
              onClose={() => setIsBlacklistModalOpen(false)}
              onConfirm={handleConfirmBlacklistToggle}
              confirmText={selectedVehicle.isBlacklisted ? "Remove Blacklist" : "Confirm Blacklist"}
            />
          }
        >
          <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
            <p>
              {selectedVehicle.isBlacklisted
                ? `Restore vehicle ${selectedVehicle.vehicleNumber} to active fleet? Vehicle will be re-enabled for sand transport bookings.`
                : `Are you sure you want to blacklist vehicle ${selectedVehicle.vehicleNumber}? The vehicle will be immediately blocked from all sand bookings and weighbridge gate-outs.`}
            </p>

            {!selectedVehicle.isBlacklisted && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Enforcement Justification / Reason *
                </label>
                <textarea
                  rows={2}
                  value={blacklistReasonInput}
                  onChange={(e) => setBlacklistReasonInput(e.target.value)}
                  className={`${inputBase} ${inputNormal}`}
                  placeholder="State violation notes or enforcement squad report..."
                  required
                />
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ── 5. VERIFY VEHICLE MODAL ── */}
      {selectedVehicle && (
        <Modal
          isOpen={isVerifyModalOpen}
          onClose={() => setIsVerifyModalOpen(false)}
          title={`Verify Vehicle Clearance – ${selectedVehicle.vehicleNumber}`}
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
              Confirm that RC, commercial fitness, FASTag RFID, and driver license have been verified for vehicle{" "}
              <strong className="text-slate-900 dark:text-white font-mono">
                {selectedVehicle.vehicleNumber}
              </strong>
              ?
            </p>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-700 dark:text-emerald-300 text-[11px] flex items-center gap-1.5">
              <Check size={14} /> Approving will allow the vehicle to receive e-Pass dispatches across all active stockyards.
            </div>
          </div>
        </Modal>
      )}

      {/* ── 6. UPLOAD VEHICLE PHOTO MODAL ── */}
      {selectedVehicle && (
        <Modal
          isOpen={isPhotoModalOpen}
          onClose={() => setIsPhotoModalOpen(false)}
          title={`Upload Vehicle Photo – ${selectedVehicle.vehicleNumber}`}
          size="md"
          footer={
            <ModalFooter
              onClose={() => setIsPhotoModalOpen(false)}
              onConfirm={handleSavePhoto}
              confirmText="Save Vehicle Photo"
            />
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/40 rounded-xl text-amber-800 dark:text-amber-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
                <span>
                  Vehicle: <strong className="font-mono">{selectedVehicle.vehicleNumber}</strong> ({selectedVehicle.vehicleType})
                </span>
              </div>
              <Badge variant={selectedVehicle.status === "Verified" ? "success" : "warning"}>
                {selectedVehicle.status}
              </Badge>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept="image/*"
              className="hidden"
            />

            {/* Photo Preview / Dropzone */}
            {photoInputUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-900 group shadow-md">
                <img
                  src={photoInputUrl}
                  alt="Vehicle Preview"
                  className="w-full h-56 object-cover object-center"
                />
                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1.5 rounded-lg bg-black/75 hover:bg-black text-white text-[11px] font-medium flex items-center gap-1 backdrop-blur-xs transition-colors cursor-pointer shadow"
                    title="Change Photo"
                  >
                    <UploadCloud size={13} /> Replace
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoInputUrl("")}
                    className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer shadow"
                    title="Remove Photo"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded font-mono">
                  Active Photo Preview
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                  isDragging
                    ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30 text-orange-600"
                    : "border-slate-300 dark:border-slate-700 hover:border-orange-500/70 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                  <UploadCloud size={24} />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                    Click to browse or drag and drop vehicle photo
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Supports PNG, JPG, JPEG, WEBP (Max 10MB)
                  </p>
                </div>
                <Button size="sm" variant="outline" className="mt-1 pointer-events-none">
                  <Camera size={13} className="mr-1.5" /> Choose from Device
                </Button>
              </div>
            )}

            {/* Direct Image URL input */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Or enter Web Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={photoInputUrl}
                  onChange={(e) => setPhotoInputUrl(e.target.value)}
                  placeholder="https://example.com/vehicle-photo.jpg"
                  className={`${inputBase} ${inputNormal} flex-1 text-xs`}
                />
                {photoInputUrl && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPhotoInputUrl("")}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Presets / Sample Fleet Photos */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-2">
                <Sparkles size={12} className="text-orange-500" /> Or pick standard transport fleet sample:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_VEHICLE_PHOTOS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPhotoInputUrl(preset.url)}
                    className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-500 p-1 bg-white dark:bg-slate-800 text-left transition-all cursor-pointer"
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-16 object-cover rounded"
                    />
                    <p className="text-[10px] font-medium text-slate-700 dark:text-slate-300 mt-1 truncate">
                      {preset.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default VehicleList;

