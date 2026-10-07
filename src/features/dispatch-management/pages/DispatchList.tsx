import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Send,
  Plus,
  Eye,
  Truck,
  PackageCheck,
  QrCode,
  Ban,
  CheckCircle2,
  Clock,
  MapPin,
  FileText,
  Radio,
  Printer,
  ShieldCheck,
  CreditCard,
  Building2,
  Scale,
  Camera,
  AlertTriangle,
} from "lucide-react";
import type { DispatchItem, DispatchStatus, GpsSignalStatus } from "../types";
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
  assignVehicleAndDriver,
  confirmLoadingAndWeighment,
  generateEPassForTrip,
  generateTransitPass,
  gateOutDispatchTrip,
  cancelDispatchTrip,
} from "../slice/dispatchSlice";
import { inputBase, inputNormal } from "@/shared/components/ui/Forms/inputStyles";
import type { TransitPassRecord } from "../types";
import { createDigitalTransitPass } from "../service/transitPassService";
import { DigitalTransitPassModal } from "../components/DigitalTransitPassModal";
import { Lock } from "lucide-react";
import "../styles/dispatch.css";

export const DispatchList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showSuccess, showError, showWarning } = useStatusModal();

  const dispatches = useAppSelector((state) => state.dispatch?.dispatches || []);
  const vehicles = useAppSelector((state) => state.vehicle?.vehicles || []);
  const drivers = useAppSelector((state) => state.vehicle?.drivers || []);

  // Modal State Management
  const [selectedDispatch, setSelectedDispatch] = useState<DispatchItem | null>(null);
  const [selectedTransitPassRecord, setSelectedTransitPassRecord] = useState<TransitPassRecord | null>(null);
  const [isDigitalTransitPassModalOpen, setIsDigitalTransitPassModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);
  const [isEPassModalOpen, setIsEPassModalOpen] = useState(false);
  const [isGateOutModalOpen, setIsGateOutModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isQrScannerModalOpen, setIsQrScannerModalOpen] = useState(false);

  // Form states for modals
  const [assignVehicleNum, setAssignVehicleNum] = useState("CG-04-TX-2341");
  const [assignDriverName, setAssignDriverName] = useState("Dharmendra Sahu");
  const [assignDriverMobile, setAssignDriverMobile] = useState("9826190012");

  const [loadingSlipNumber, setLoadingSlipNumber] = useState("WB-SLIP-2026-9901");
  const [loadingGrossKg, setLoadingGrossKg] = useState(24400);
  const [loadingTareKg, setLoadingTareKg] = useState(8400);

  const [cancelReasonInput, setCancelReasonInput] = useState(
    "Customer requested delivery schedule postponement to next shift."
  );

  // Status Badges
  const getDispatchStatusBadge = (status: DispatchStatus) => {
    switch (status) {
      case "Pending Assignment":
        return <Badge variant="warning">Pending Assignment</Badge>;
      case "Vehicle Assigned":
        return <Badge variant="info">Vehicle Assigned</Badge>;
      case "Loading in Progress":
        return <Badge variant="warning">Loading in Progress</Badge>;
      case "Weighed & Cleared":
        return <Badge variant="primary">Weighed & Cleared</Badge>;
      case "Ready for Dispatch":
        return <Badge variant="success">Ready for Dispatch</Badge>;
      case "Dispatched (In Transit)":
        return <Badge variant="success">In Transit</Badge>;
      case "Delivered":
        return <Badge variant="secondary">Delivered</Badge>;
      case "Cancelled":
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getGpsStatusBadge = (status: GpsSignalStatus) => {
    switch (status) {
      case "Signal Healthy":
        return <Badge variant="success">Signal Healthy</Badge>;
      case "Deviation Alert":
        return <Badge variant="danger">Deviation Alert</Badge>;
      case "Offline":
        return <Badge variant="secondary">Offline</Badge>;
      case "Geofence Breach":
        return <Badge variant="danger">Geofence Breach</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // KPIs
  const stats = useMemo(() => {
    const totalDispatches = dispatches.length;
    const inTransit = dispatches.filter((d) => d.dispatchStatus === "Dispatched (In Transit)").length;
    const readyForGateOut = dispatches.filter(
      (d) => d.dispatchStatus === "Ready for Dispatch" || d.dispatchStatus === "Weighed & Cleared"
    ).length;
    const pendingAssignment = dispatches.filter((d) => d.dispatchStatus === "Pending Assignment").length;
    const totalTonnage = dispatches
      .filter((d) => d.dispatchStatus !== "Cancelled")
      .reduce((sum, d) => sum + d.quantityMt, 0);

    return {
      totalDispatches,
      inTransit,
      readyForGateOut,
      pendingAssignment,
      totalTonnage,
    };
  }, [dispatches]);

  // Handlers
  const handleConfirmAssign = () => {
    if (!selectedDispatch) return;

    // Business rule: Validate vehicle and driver
    const selectedVeh = vehicles.find((v) => v.vehicleNumber === assignVehicleNum);
    if (selectedVeh && selectedVeh.isBlacklisted) {
      showError("Cannot assign blacklisted vehicle! Please select a verified commercial truck.");
      return;
    }

    dispatch(
      assignVehicleAndDriver({
        dispatchId: selectedDispatch.id,
        vehicleNumber: assignVehicleNum,
        driverName: assignDriverName,
        driverMobile: assignDriverMobile,
      })
    );
    showSuccess(`Vehicle ${assignVehicleNum} & Driver ${assignDriverName} assigned to Dispatch ${selectedDispatch.dispatchId}!`);
    setIsAssignModalOpen(false);
  };

  const handleConfirmLoading = () => {
    if (!selectedDispatch) return;
    if (loadingGrossKg <= loadingTareKg) {
      showError("Gross loaded weight must strictly exceed tare weight.");
      return;
    }

    dispatch(
      confirmLoadingAndWeighment({
        dispatchId: selectedDispatch.id,
        weighbridgeSlipNumber: loadingSlipNumber,
        grossWeightKg: Number(loadingGrossKg),
        tareWeightKg: Number(loadingTareKg),
      })
    );
    showSuccess(`Loading & weighment verified for ${selectedDispatch.dispatchId}. Weight slip: ${loadingSlipNumber}.`);
    setIsLoadingModalOpen(false);
  };

  const handleGenerateEPass = (item?: DispatchItem) => {
    const target = item || selectedDispatch;
    if (!target) return;

    // Business rule: Check payment & stock
    if (!target.isPaymentVerified) {
      showError("Cannot generate Transit Pass: Booking payment is not yet verified / authorized.");
      return;
    }

    const orderId = target.orderId || target.bookingId;
    const newPass = createDigitalTransitPass({
      orderId,
      vehicleNumber: target.vehicleNumber,
      driverName: target.driverName,
      driverMobile: target.driverMobile,
      driverLicense: target.driverLicense || "CG-04-DL-2020-001",
      sandReach: {
        reachId: target.sandReachId || "RCH-CG-04",
        reachName: target.sandReachName || "Mahanadi Riverbed Reach-04",
        riverStream: "Mahanadi River",
        district: "Raipur",
      },
      sourceStockyard: target.stockyardName,
      destination: target.destination,
      quantityMt: target.quantityMt,
      sandType: target.sandType,
      customerDetails: {
        name: target.customerName,
        mobile: target.customerMobile,
        category: target.customerCategory || "Commercial Builder",
        deliveryAddress: target.destination,
      },
      weighbridgeSlipNumber: target.weighbridgeSlipNumber,
      tareWeightKg: target.tareWeightKg || 8400,
      grossWeightKg: target.grossWeightKg || Math.round(8400 + target.quantityMt * 1000),
      gpsTrackingRef: {
        deviceImei: target.gpsImei || "AIS140-CG-04-8891",
        corridorGeofence: `Corridor: ${target.stockyardName} to ${target.destination}`,
      },
      validityHours: 8,
      officerName: "S. K. Verma",
      officerId: "SRO-RAIPUR-004",
      designation: "Sand Reach Officer (SRO)",
    });

    dispatch(generateTransitPass(newPass));
    setSelectedDispatch({
      ...target,
      ePassNumber: newPass.transitPassNumber,
      transitPassNumber: newPass.transitPassNumber,
      dispatchStatus: "Ready for Dispatch",
      isLocked: true,
      securityHash: newPass.securityHash,
    });
    setSelectedTransitPassRecord(newPass);
    setIsDigitalTransitPassModalOpen(true);
    showSuccess(
      `Digital Transit Pass ${newPass.transitPassNumber} sealed with SHA-256 hash! Unauthorized editing is permanently locked.`
    );
  };

  const handleOpenTransitPassView = (item: DispatchItem) => {
    const pass = createDigitalTransitPass({
      orderId: item.orderId || item.bookingId,
      vehicleNumber: item.vehicleNumber,
      driverName: item.driverName,
      driverMobile: item.driverMobile,
      driverLicense: item.driverLicense || "CG-04-DL-2020-001",
      sandReach: {
        reachId: item.sandReachId || "RCH-CG-04",
        reachName: item.sandReachName || "Mahanadi Riverbed Reach-04",
        riverStream: "Mahanadi River",
        district: "Raipur",
      },
      sourceStockyard: item.stockyardName,
      destination: item.destination,
      quantityMt: item.quantityMt,
      sandType: item.sandType,
      customerDetails: {
        name: item.customerName,
        mobile: item.customerMobile,
        category: item.customerCategory || "Commercial Builder",
        deliveryAddress: item.destination,
      },
      weighbridgeSlipNumber: item.weighbridgeSlipNumber,
      tareWeightKg: item.tareWeightKg || 8400,
      grossWeightKg: item.grossWeightKg || Math.round(8400 + item.quantityMt * 1000),
      gpsTrackingRef: {
        deviceImei: item.gpsImei || "AIS140-CG-04-8891",
        corridorGeofence: `Corridor: ${item.stockyardName} to ${item.destination}`,
      },
      validityHours: 8,
    });
    setSelectedTransitPassRecord(pass);
    setIsDigitalTransitPassModalOpen(true);
  };


  const handleConfirmGateOut = () => {
    if (!selectedDispatch) return;

    // Validation: Check Authorization & GPS
    if (!selectedDispatch.isPaymentVerified) {
      showError("Dispatch denied: Booking payment is not verified.");
      return;
    }
    if (!selectedDispatch.isVehicleVerified) {
      showWarning("Warning: Vehicle authorization clearance must be re-checked before gate out.");
    }

    dispatch(
      gateOutDispatchTrip({
        dispatchId: selectedDispatch.id,
      })
    );
    showSuccess(`Truck ${selectedDispatch.vehicleNumber} cleared for Gate-Out Dispatch (e-Pass: ${selectedDispatch.ePassNumber})!`);
    setIsGateOutModalOpen(false);
  };

  const handleConfirmCancel = () => {
    if (!selectedDispatch) return;
    if (!cancelReasonInput.trim()) {
      showError("Please provide a mandatory cancellation reason.");
      return;
    }

    dispatch(
      cancelDispatchTrip({
        dispatchId: selectedDispatch.id,
        reason: cancelReasonInput.trim(),
      })
    );
    showSuccess(`Dispatch trip ${selectedDispatch.dispatchId} cancelled.`);
    setIsCancelModalOpen(false);
  };

  // Table Columns Definition (Clean Minimal Single-Line Format)
  const columns = useMemo<MRT_ColumnDef<DispatchItem>[]>(
    () => [
      {
        accessorKey: "dispatchId",
        header: "Dispatch ID",
        size: 140,
        Cell: ({ row }) => (
          <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
            {row.original.dispatchId}
          </span>
        ),
      },
      {
        accessorKey: "bookingId",
        header: "Booking ID",
        size: 130,
        Cell: ({ row }) => (
          <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
            {row.original.bookingId}
          </span>
        ),
      },
      {
        accessorKey: "vehicleNumber",
        header: "Vehicle",
        size: 130,
        Cell: ({ row }) => (
          <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
            {row.original.vehicleNumber || "Unassigned"}
          </span>
        ),
      },
      {
        accessorKey: "driverName",
        header: "Driver",
        size: 140,
        Cell: ({ row }) => (
          <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate block" title={row.original.driverName}>
            {row.original.driverName || "Pending"}
          </span>
        ),
      },
      {
        accessorKey: "stockyardName",
        header: "Stockyard",
        size: 160,
        Cell: ({ row }) => (
          <span className="text-xs text-slate-700 dark:text-slate-300 truncate block max-w-[150px]" title={row.original.stockyardName}>
            {row.original.stockyardName}
          </span>
        ),
      },
      {
        accessorKey: "quantityMt",
        header: "Quantity",
        size: 100,
        Cell: ({ row }) => (
          <span className="text-xs font-mono font-bold text-orange-600 dark:text-orange-400">
            {row.original.quantityMt.toFixed(1)} MT
          </span>
        ),
      },
      {
        accessorKey: "weighbridgeSlipNumber",
        header: "Weighbridge Slip",
        size: 140,
        Cell: ({ row }) => (
          <span className="text-xs font-mono text-slate-600 dark:text-slate-400 truncate block" title={row.original.weighbridgeSlipNumber}>
            {row.original.weighbridgeSlipNumber}
          </span>
        ),
      },
      {
        accessorKey: "loadingTime",
        header: "Loading Time",
        size: 130,
        Cell: ({ row }) => (
          <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
            {row.original.loadingTime}
          </span>
        ),
      },
      {
        accessorKey: "destination",
        header: "Destination",
        size: 170,
        Cell: ({ row }) => (
          <span className="text-xs text-slate-600 dark:text-slate-400 truncate block max-w-[160px]" title={row.original.destination}>
            {row.original.destination}
          </span>
        ),
      },
      {
        accessorKey: "ePassNumber",
        header: "Transit Pass / e-Pass",
        size: 160,
        Cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <span
              className="text-xs font-mono font-semibold text-purple-600 dark:text-purple-400 truncate block cursor-pointer hover:underline"
              title={row.original.transitPassNumber || row.original.ePassNumber}
              onClick={() => handleOpenTransitPassView(row.original)}
            >
              {row.original.transitPassNumber || row.original.ePassNumber}
            </span>
            {row.original.isLocked && (
              <span title="Locked: Digital Transit Pass issued with SHA-256 seal. Editing is disabled.">
                <Lock size={12} className="text-amber-500 shrink-0" />
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "gpsStatus",
        header: "GPS Status",
        size: 130,
        Cell: ({ row }) => getGpsStatusBadge(row.original.gpsStatus),
      },
      {
        accessorKey: "dispatchStatus",
        header: "Dispatch Status",
        size: 150,
        Cell: ({ row }) => getDispatchStatusBadge(row.original.dispatchStatus),
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
              Total Dispatches
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats.totalDispatches}{" "}
              <span className="text-sm font-semibold text-slate-500">Trips</span>
            </h3>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
              {stats.totalTonnage.toFixed(1)} MT Sand Handled
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <Truck size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active In Transit
            </p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {stats.inTransit}{" "}
              <span className="text-sm font-semibold text-slate-500">Vehicles</span>
            </h3>
            <p className="text-[11px] text-emerald-600 mt-0.5">Live AIS-140 GPS Active</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Radio size={22} className="animate-pulse" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Ready for Gate-Out
            </p>
            <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
              {stats.readyForGateOut}{" "}
              <span className="text-sm font-semibold text-slate-500">Loaded</span>
            </h3>
            <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5">
              Weighment & e-Pass Issued
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Allocation
            </p>
            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {stats.pendingAssignment}{" "}
              <span className="text-sm font-semibold text-slate-500">Bookings</span>
            </h3>
            <p className="text-[11px] text-amber-600 mt-0.5">Awaiting Vehicle Assignment</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock size={22} />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <Card
        title="Sand Dispatch & Fleet Gate-Out Management"
        icon={Send}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              icon={<Truck size={14} />}
              onClick={() => {
                if (dispatches[0]) {
                  setSelectedDispatch(dispatches[0]);
                  setIsAssignModalOpen(true);
                }
              }}
            >
              Assign Vehicle
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={<PackageCheck size={14} />}
              onClick={() => {
                if (dispatches[0]) {
                  setSelectedDispatch(dispatches[0]);
                  setIsLoadingModalOpen(true);
                }
              }}
            >
              Confirm Loading
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={<QrCode size={14} />}
              onClick={() => setIsQrScannerModalOpen(true)}
            >
              QR Scanner
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={<Plus size={15} />}
              onClick={() => navigate(routes.authorizeDispatch.path)}
            >
              New Dispatch
            </Button>
          </div>
        }
      >
        <ReusableTable
          columns={columns}
          data={dispatches}
          enableExport={true}
          exportFileName="dispatch_management_records"
          onExportExcel={(rows) => exportToExcel(exportCols, rows, "dispatch_management_records")}
          onExportPDF={(rows) => exportToPDF(exportCols, rows, "dispatch_management_records", "Dispatch Registry")}
          enableRowActions={true}
          renderRowActions={({ row }) => {
            const item = row.original;
            const isDelivered = item.dispatchStatus === "Delivered";
            const isCancelled = item.dispatchStatus === "Cancelled";
            const isLocked = Boolean(item.isLocked || item.transitPassNumber);
            const canAssign = !isLocked && (item.dispatchStatus === "Pending Assignment" || item.dispatchStatus === "Vehicle Assigned");
            const canLoad = !isLocked && (item.dispatchStatus === "Vehicle Assigned" || item.dispatchStatus === "Loading in Progress");
            const canEPass = item.dispatchStatus === "Weighed & Cleared" || item.dispatchStatus === "Ready for Dispatch" || item.dispatchStatus === "Dispatched (In Transit)";
            const canGateOut = item.dispatchStatus === "Ready for Dispatch" || item.dispatchStatus === "Weighed & Cleared";
            const canCancel = !isDelivered && !isCancelled && !isLocked;

            return (
              <div className="flex items-center gap-1.5 justify-center">
                {/* 1. View Dispatch Dossier (Always Enabled) */}
                <button
                  type="button"
                  title="View Dispatch Details & e-Pass Dossier"
                  onClick={() => {
                    setSelectedDispatch(item);
                    setIsDetailModalOpen(true);
                  }}
                  className="w-7 h-7 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Eye size={14} />
                </button>

                {/* 1.5 View Official Digital Transit Pass / Waybill */}
                <button
                  type="button"
                  title="View Sealed Official Digital Transit Pass / Waybill"
                  onClick={() => handleOpenTransitPassView(item)}
                  className="w-7 h-7 rounded-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ShieldCheck size={14} />
                </button>

                {/* 2. Assign / Reassign Vehicle */}
                <button
                  type="button"
                  title={canAssign ? "Assign / Reassign Commercial Vehicle" : "Vehicle allocation locked for active/completed trip"}
                  disabled={!canAssign}
                  onClick={() => {
                    if (canAssign) {
                      setSelectedDispatch(item);
                      setAssignVehicleNum(item.vehicleNumber || vehicles[0]?.vehicleNumber || "CG-04-TX-2341");
                      setAssignDriverName(item.driverName || drivers[0]?.name || "Dharmendra Sahu");
                      setAssignDriverMobile(item.driverMobile || drivers[0]?.mobile || "9826190012");
                      setIsAssignModalOpen(true);
                    }
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    canAssign
                      ? "bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-600 dark:text-purple-400 cursor-pointer"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                  }`}
                >
                  <Truck size={13} />
                </button>

                {/* 3. Confirm Loading & Weighment */}
                <button
                  type="button"
                  title={canLoad ? "Confirm Sand Loading & Weighment Slip" : "Loading confirmation not available in current state"}
                  disabled={!canLoad}
                  onClick={() => {
                    if (canLoad) {
                      setSelectedDispatch(item);
                      setLoadingSlipNumber(item.weighbridgeSlipNumber.startsWith("PENDING") ? `WB-SLIP-2026-${Math.floor(Math.random() * 9000) + 1000}` : item.weighbridgeSlipNumber);
                      setLoadingGrossKg(item.grossWeightKg || 24400);
                      setLoadingTareKg(item.tareWeightKg || 8400);
                      setIsLoadingModalOpen(true);
                    }
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    canLoad
                      ? "bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-600 dark:text-amber-400 cursor-pointer"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                  }`}
                >
                  <PackageCheck size={14} />
                </button>

                {/* 4. Generate e-Pass & View QR Code */}
                <button
                  type="button"
                  title={canEPass ? "Generate / View Digital e-Pass & QR Code" : "Complete loading and weighment to issue e-Pass"}
                  disabled={!canEPass}
                  onClick={() => {
                    if (canEPass) {
                      if (item.ePassNumber.startsWith("PENDING")) {
                        handleGenerateEPass(item);
                      }
                      setSelectedDispatch(item);
                      setIsEPassModalOpen(true);
                    }
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    canEPass
                      ? "bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-600 dark:text-purple-400 cursor-pointer"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                  }`}
                >
                  <QrCode size={14} />
                </button>

                {/* 5. Gate-Out Dispatch Clearance */}
                <button
                  type="button"
                  title={canGateOut ? "Authorize Gate-Out Dispatch" : "Truck not ready for gate-out clearance"}
                  disabled={!canGateOut}
                  onClick={() => {
                    if (canGateOut) {
                      setSelectedDispatch(item);
                      setIsGateOutModalOpen(true);
                    }
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    canGateOut
                      ? "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 cursor-pointer"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                  }`}
                >
                  <Send size={13} />
                </button>

                {/* 6. Cancel Dispatch Trip */}
                <button
                  type="button"
                  title={canCancel ? "Cancel Dispatch Trip" : "Cannot cancel delivered or already cancelled trip"}
                  disabled={!canCancel}
                  onClick={() => {
                    if (canCancel) {
                      setSelectedDispatch(item);
                      setIsCancelModalOpen(true);
                    }
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    canCancel
                      ? "bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 cursor-pointer"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                  }`}
                >
                  <Ban size={14} />
                </button>
              </div>
            );
          }}
        />
      </Card>

      {/* ── 1. VIEW DISPATCH DETAILS MODAL ── */}
      {selectedDispatch && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Dispatch Dossier – ${selectedDispatch.dispatchId}`}
          subtitle={`Booking Reference: ${selectedDispatch.bookingId} • ${selectedDispatch.stockyardName}`}
          size="2xl"
          footer={
            <ModalFooter
              onClose={() => setIsDetailModalOpen(false)}
              showConfirm={false}
              cancelText="Close"
            />
          }
        >
          <div className="space-y-4 text-sm">
            {/* Validation / Authorization Banner */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <CreditCard className="text-emerald-600" size={16} />
                <div>
                  <p className="text-[11px] text-slate-500 font-semibold">Payment Status</p>
                  <span className="text-xs font-bold text-emerald-600">
                    {selectedDispatch.isPaymentVerified ? "Authorized & Paid" : "Pending Payment"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="text-blue-600" size={16} />
                <div>
                  <p className="text-[11px] text-slate-500 font-semibold">Stockyard Quota</p>
                  <span className="text-xs font-bold text-blue-600">
                    {selectedDispatch.isStockVerified ? "Stock Reserved" : "Quota Low"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-purple-600" size={16} />
                <div>
                  <p className="text-[11px] text-slate-500 font-semibold">Vehicle & Driver</p>
                  <span className="text-xs font-bold text-purple-600">
                    {selectedDispatch.isVehicleVerified ? "Verified & Active" : "Unverified"}
                  </span>
                </div>
              </div>
            </div>

            {/* Trip Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-500 font-semibold">Dispatch ID</p>
                <p className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                  {selectedDispatch.dispatchId}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-semibold">Booking ID</p>
                <p className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {selectedDispatch.bookingId}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-semibold">Customer / Consignee</p>
                <p className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">
                  {selectedDispatch.customerName} ({selectedDispatch.customerMobile})
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-semibold">Vehicle Number</p>
                <p className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedDispatch.vehicleNumber || "Unassigned"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-semibold">Driver Details</p>
                <p className="text-xs text-slate-800 dark:text-slate-200 mt-0.5">
                  {selectedDispatch.driverName} • {selectedDispatch.driverMobile}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-semibold">Sand Grade & Quantity</p>
                <p className="text-xs font-bold text-orange-600 dark:text-orange-400 mt-0.5">
                  {selectedDispatch.sandType} – {selectedDispatch.quantityMt} MT
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-semibold">Weighbridge Slip</p>
                <p className="text-xs font-mono text-slate-700 dark:text-slate-300 mt-0.5">
                  {selectedDispatch.weighbridgeSlipNumber}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-semibold">Tare / Gross Weight</p>
                <p className="text-xs font-mono text-slate-700 dark:text-slate-300 mt-0.5">
                  {selectedDispatch.tareWeightKg ? `${selectedDispatch.tareWeightKg} kg / ${selectedDispatch.grossWeightKg} kg` : "Pending Weighment"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-semibold">Loading Time</p>
                <p className="text-xs font-mono text-slate-700 dark:text-slate-300 mt-0.5">
                  {selectedDispatch.loadingTime}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs text-slate-500 font-semibold">Delivery Destination</p>
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1">
                  <MapPin size={13} className="text-rose-500" /> {selectedDispatch.destination}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-semibold">GPS Telemetry Status</p>
                <div className="mt-0.5 flex items-center gap-1.5">
                  {getGpsStatusBadge(selectedDispatch.gpsStatus)}
                  {selectedDispatch.gpsImei && (
                    <span className="text-[10px] font-mono text-slate-400">({selectedDispatch.gpsImei})</span>
                  )}
                </div>
              </div>
            </div>

            {selectedDispatch.currentLocation && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <Radio size={14} className="animate-pulse text-emerald-600" /> Live AIS-140 GPS Feed
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {selectedDispatch.currentLocation}
                  </p>
                </div>
                <Badge variant="success">Online</Badge>
              </div>
            )}

            {selectedDispatch.cancelReason && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl">
                <p className="text-xs font-bold text-rose-800 dark:text-rose-300">Cancellation Reason</p>
                <p className="text-xs text-rose-700 dark:text-rose-400 mt-0.5">{selectedDispatch.cancelReason}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ── 2. ASSIGN VEHICLE & DRIVER MODAL ── */}
      {selectedDispatch && (
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          title={`Assign Vehicle & Driver – ${selectedDispatch.dispatchId}`}
          subtitle="One active assignment per vehicle rule and commercial driving license validation"
          size="lg"
          footer={
            <ModalFooter
              onClose={() => setIsAssignModalOpen(false)}
              onConfirm={handleConfirmAssign}
              confirmText="Confirm Assignment"
              cancelText="Cancel"
            />
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Commercial Vehicle *
                </label>
                <select
                  value={assignVehicleNum}
                  onChange={(e) => {
                    setAssignVehicleNum(e.target.value);
                    const matchedDriver = drivers.find((d) => d.assignedVehicleNumber === e.target.value);
                    if (matchedDriver) {
                      setAssignDriverName(matchedDriver.name);
                      setAssignDriverMobile(matchedDriver.mobile);
                    }
                  }}
                  className={`${inputBase} ${inputNormal} font-mono`}
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.vehicleNumber} disabled={v.isBlacklisted}>
                      {v.vehicleNumber} ({v.vehicleType} • {v.ownerName}) {v.isBlacklisted ? " - [BLACKLISTED]" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Assigned Commercial Driver *
                </label>
                <input
                  type="text"
                  value={assignDriverName}
                  onChange={(e) => setAssignDriverName(e.target.value)}
                  className={`${inputBase} ${inputNormal}`}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Driver Mobile Number *
                </label>
                <input
                  type="tel"
                  value={assignDriverMobile}
                  onChange={(e) => setAssignDriverMobile(e.target.value)}
                  className={`${inputBase} ${inputNormal} font-mono`}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Allocated Payload Volume
                </label>
                <input
                  type="text"
                  value={`${selectedDispatch.quantityMt} MT (${selectedDispatch.sandType})`}
                  readOnly
                  className={`${inputBase} ${inputNormal} bg-slate-100 dark:bg-slate-800 font-mono font-bold text-orange-600`}
                />
              </div>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl">
              <p className="text-xs font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                <ShieldCheck size={14} /> Statutory Vehicle Clearance
              </p>
              <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">
                Assigning this vehicle will pair the AIS-140 GPS device and automatically reserve stock at {selectedDispatch.stockyardName}.
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* ── 3. CONFIRM LOADING & WEIGHMENT MODAL ── */}
      {selectedDispatch && (
        <Modal
          isOpen={isLoadingModalOpen}
          onClose={() => setIsLoadingModalOpen(false)}
          title={`Confirm Loading & Weighment – ${selectedDispatch.dispatchId}`}
          subtitle={`Vehicle: ${selectedDispatch.vehicleNumber || "CG-04-TX-2341"} • Stockyard: ${selectedDispatch.stockyardName}`}
          size="lg"
          footer={
            <ModalFooter
              onClose={() => setIsLoadingModalOpen(false)}
              onConfirm={handleConfirmLoading}
              confirmText="Confirm Loading & Weights"
              cancelText="Cancel"
            />
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Weighbridge Slip Ref *
                </label>
                <input
                  type="text"
                  value={loadingSlipNumber}
                  onChange={(e) => setLoadingSlipNumber(e.target.value)}
                  className={`${inputBase} ${inputNormal} font-mono`}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tare Weight (kg) *
                </label>
                <input
                  type="number"
                  value={loadingTareKg}
                  onChange={(e) => setLoadingTareKg(Number(e.target.value))}
                  className={`${inputBase} ${inputNormal} font-mono`}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Gross Loaded Weight (kg) *
                </label>
                <input
                  type="number"
                  value={loadingGrossKg}
                  onChange={(e) => setLoadingGrossKg(Number(e.target.value))}
                  className={`${inputBase} ${inputNormal} font-mono`}
                  required
                />
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Net Calculated Payload</p>
                <p className="text-xs text-slate-500 font-mono">
                  {loadingGrossKg} kg − {loadingTareKg} kg = {Math.max(0, loadingGrossKg - loadingTareKg)} kg
                </p>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-orange-600 font-mono">
                  {((Math.max(0, loadingGrossKg - loadingTareKg)) / 1000).toFixed(2)} MT
                </span>
                <p className="text-[10px] text-slate-400">Target: {selectedDispatch.quantityMt} MT</p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── 4. DIGITAL E-PASS & QR CODE MODAL ── */}
      {selectedDispatch && (
        <Modal
          isOpen={isEPassModalOpen}
          onClose={() => setIsEPassModalOpen(false)}
          title={`Digital e-Pass & QR Code – ${selectedDispatch.ePassNumber}`}
          subtitle="Statutory electronic transit pass issued under Chhattisgarh Mineral Rules"
          size="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="sm"
                icon={<Printer size={14} />}
                onClick={() => showSuccess(`Printing physical e-Pass transit slip ${selectedDispatch.ePassNumber}...`)}
              >
                Print Transit Slip
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsEPassModalOpen(false)}
              >
                Done
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="p-4 bg-white dark:bg-slate-900 border-2 border-dashed border-purple-300 dark:border-purple-800 rounded-2xl flex flex-col md:flex-row items-center gap-6">
              {/* Mock Scannable 2D QR Code */}
              <div className="flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-xl shadow-inner w-44 h-44 shrink-0">
                <QrCode size={120} className="text-slate-900" />
                <span className="text-[9px] font-mono text-slate-500 mt-1">SCAN FOR FIELD VERIFICATION</span>
              </div>

              {/* Transit Slip Summary */}
              <div className="flex-1 space-y-2 text-xs">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500 font-semibold">e-Pass Number:</span>
                  <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{selectedDispatch.ePassNumber}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500 font-semibold">Vehicle & Driver:</span>
                  <span className="font-mono font-bold">{selectedDispatch.vehicleNumber} ({selectedDispatch.driverName})</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500 font-semibold">Mineral Grade & Qty:</span>
                  <span className="font-bold text-orange-600">{selectedDispatch.sandType} • {selectedDispatch.quantityMt} MT</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500 font-semibold">Source Stockyard:</span>
                  <span>{selectedDispatch.stockyardName}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500 font-semibold">Destination:</span>
                  <span className="truncate max-w-[200px]" title={selectedDispatch.destination}>{selectedDispatch.destination}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500 font-semibold">Valid Till:</span>
                  <span className="font-mono font-semibold text-emerald-600">2026-03-10 18:00 (24h Transit Window)</span>
                </div>
              </div>
            </div>

            <div className="dispatch-barcode-box rounded-lg opacity-80" />
          </div>
        </Modal>
      )}

      {/* ── 5. GATE-OUT DISPATCH CLEARANCE MODAL ── */}
      {selectedDispatch && (
        <Modal
          isOpen={isGateOutModalOpen}
          onClose={() => setIsGateOutModalOpen(false)}
          title={`Gate-Out Dispatch Clearance – ${selectedDispatch.dispatchId}`}
          subtitle="Final checkpost validation: Payment, stock deduction, and AIS-140 GPS pairing"
          size="lg"
          footer={
            <ModalFooter
              onClose={() => setIsGateOutModalOpen(false)}
              onConfirm={handleConfirmGateOut}
              confirmText="Authorize Gate-Out Dispatch"
              cancelText="Cancel"
            />
          }
        >
          <div className="space-y-4 text-sm">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2">
              <h4 className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-600" /> All Pre-Dispatch Statutory Checks Passed
              </h4>
              <ul className="text-xs text-emerald-800 dark:text-emerald-300 space-y-1 list-disc pl-4">
                <li>Consignee payment verified (Transaction: {selectedDispatch.paymentRef || "PAY-VALIDATED"}).</li>
                <li>Stockyard inventory reserved and deducted ({selectedDispatch.quantityMt} MT).</li>
                <li>Digital e-Pass active: <strong>{selectedDispatch.ePassNumber}</strong>.</li>
                <li>Vehicle {selectedDispatch.vehicleNumber} AIS-140 GPS stream is currently <strong>Signal Healthy</strong>.</li>
              </ul>
            </div>

            <p className="text-xs text-slate-500">
              Upon gate-out confirmation, SMS dispatch notifications will be transmitted to customer <strong>{selectedDispatch.customerMobile}</strong> with live tracking URL and delivery OTP challenge.
            </p>
          </div>
        </Modal>
      )}

      {/* ── 6. CANCEL DISPATCH TRIP MODAL ── */}
      {selectedDispatch && (
        <Modal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          title={`Cancel Dispatch Trip – ${selectedDispatch.dispatchId}`}
          subtitle="Mandatory reason required for audit log and quota restoration"
          size="md"
          footer={
            <ModalFooter
              onClose={() => setIsCancelModalOpen(false)}
              onConfirm={handleConfirmCancel}
              confirmText="Confirm Cancellation"
              cancelText="Abort"
            />
          }
        >
          <div className="space-y-3">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-2.5">
              <AlertTriangle className="text-rose-600 shrink-0 mt-0.5" size={16} />
              <p className="text-xs text-rose-800 dark:text-rose-300">
                Cancelling this trip will revoke the e-Pass (if generated), restore stock balance to {selectedDispatch.stockyardName}, and log this event in the state mineral compliance ledger.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Cancellation Reason *
              </label>
              <textarea
                rows={3}
                value={cancelReasonInput}
                onChange={(e) => setCancelReasonInput(e.target.value)}
                className={`${inputBase} ${inputNormal}`}
                placeholder="State specific operational or customer reason..."
                required
              />
            </div>
          </div>
        </Modal>
      )}

      {/* ── QR SCANNER MODAL ── */}
      <Modal
        isOpen={isQrScannerModalOpen}
        onClose={() => setIsQrScannerModalOpen(false)}
        title="Checkpost QR Code Scanner"
        subtitle="Verify e-Pass digital signatures and vehicle authorization"
        size="md"
        footer={
          <ModalFooter
            onClose={() => setIsQrScannerModalOpen(false)}
            showConfirm={false}
            cancelText="Close Scanner"
          />
        }
      >
        <div className="flex flex-col items-center justify-center p-6 bg-slate-950 text-white rounded-2xl relative overflow-hidden">
          <div className="w-48 h-48 border-2 border-emerald-500 rounded-2xl relative flex items-center justify-center bg-slate-900/60">
            <Camera size={40} className="text-slate-500 animate-pulse" />
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_8px_#10b981] animate-bounce" />
          </div>
          <p className="text-xs text-slate-300 mt-4 text-center">
            Align e-Pass printed QR or driver mobile pass within the frame for real-time field authorization.
          </p>
        </div>
      </Modal>

      {/* ── DIGITAL TRANSIT PASS / WAYBILL OFFICIAL MODAL ── */}
      {selectedTransitPassRecord && (
        <DigitalTransitPassModal
          isOpen={isDigitalTransitPassModalOpen}
          onClose={() => setIsDigitalTransitPassModalOpen(false)}
          transitPass={selectedTransitPassRecord}
        />
      )}
    </div>
  );
};

export default DispatchList;

