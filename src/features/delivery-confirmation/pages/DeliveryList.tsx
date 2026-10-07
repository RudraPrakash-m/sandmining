import React, { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  CheckCircle2,
  KeyRound,
  PenTool,
  Camera,
  Printer,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Clock,
  MapPin,
  Truck,
  User,
  Phone,
  QrCode,
  Upload,
  Sparkles,
  Download,
  RotateCcw,
  Check,
  Building2,
  Layers,
  ArrowRight,
} from "lucide-react";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import type { DeliveryConfirmation } from "@/features/shared-simulation/types";
import ReusableTable from "@/shared/components/ui/Table/ReusableTable/ReusableTable";
import type { MRT_ColumnDef } from "material-react-table";
import Button from "@/shared/components/ui/Button";
import Badge from "@/shared/components/ui/Badge";
import Card from "@/shared/components/layout/Card/Card";
import Modal, { ModalFooter } from "@/shared/components/ui/Modal/Modal";
import { exportToExcel, exportToPDF } from "@/shared/utils/exportUtils";
import { routes } from "@/app/routes/routeConfig";
import { useStatusModal } from "@/config/theme/StatusModalContext";
import { inputBase, inputNormal } from "@/shared/components/ui/Forms/inputStyles";
import { CustomerLocationDeliveryModule } from "../components/CustomerLocationDeliveryModule";

export const DeliveryList: React.FC = () => {
  const { deliveries, confirmDelivery } = useSandMining();
  const { showSuccess, showError } = useStatusModal();
  const navigate = useNavigate();

  // Local state for interactive overrides (in case user performs actions on multiple rows)
  const [localDeliveries, setLocalDeliveries] = useState<DeliveryConfirmation[]>(deliveries);

  useEffect(() => {
    setLocalDeliveries(deliveries);
  }, [deliveries]);

  // Modal State Management
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryConfirmation | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Form states for modals
  const [inputOtp, setInputOtp] = useState("");
  const [isSignatureChecked, setIsSignatureChecked] = useState(true);
  const [deliveryRemarks, setDeliveryRemarks] = useState("Unloaded successfully at authorized delivery site. Customer verified payload.");
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string>("");
  const [customSignerName, setCustomSignerName] = useState("");

  // Canvas ref for signature pad
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);

  // KPIs
  const stats = useMemo(() => {
    const total = localDeliveries.length;
    const delivered = localDeliveries.filter((d) => d.status === "Delivered").length;
    const pending = localDeliveries.filter((d) => d.status === "Pending OTP").length;
    const totalTonnage = localDeliveries.reduce((acc, curr) => acc + (curr.quantityDeliveredMt || 0), 0);
    const successRate = total > 0 ? Math.round((delivered / total) * 100) : 100;

    return { total, delivered, pending, totalTonnage, successRate };
  }, [localDeliveries]);

  // Signature canvas handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setIsDrawing(true);
    setHasDrawnSignature(true);
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1e293b";
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignatureCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSignature(false);
  };

  // Helper actions
  const openConfirmModal = (delivery: DeliveryConfirmation) => {
    setSelectedDelivery(delivery);
    setInputOtp(delivery.otpCode || "7834");
    setIsSignatureChecked(true);
    setDeliveryRemarks(delivery.remarks || "Payload discharged in presence of consignee supervisor.");
    setUploadedPhotoUrl(delivery.photoUrl || "https://images.unsplash.com/photo-1541888946425-d0fbb180c5f7?w=600&auto=format&fit=crop&q=80");
    setIsConfirmModalOpen(true);
  };

  const openOtpModal = (delivery: DeliveryConfirmation) => {
    setSelectedDelivery(delivery);
    setInputOtp("");
    setIsOtpModalOpen(true);
  };

  const openSignatureModal = (delivery: DeliveryConfirmation) => {
    setSelectedDelivery(delivery);
    setCustomSignerName(delivery.customerName);
    setIsSignatureModalOpen(true);
    setTimeout(() => {
      clearSignatureCanvas();
    }, 100);
  };

  const openPhotoModal = (delivery: DeliveryConfirmation) => {
    setSelectedDelivery(delivery);
    setUploadedPhotoUrl(delivery.photoUrl || "");
    setIsPhotoModalOpen(true);
  };

  const openReceiptModal = (delivery: DeliveryConfirmation) => {
    setSelectedDelivery(delivery);
    setIsReceiptModalOpen(true);
  };

  const openDetailModal = (delivery: DeliveryConfirmation) => {
    setSelectedDelivery(delivery);
    setIsDetailModalOpen(true);
  };

  // Handlers for Submissions
  const handleFullConfirmDelivery = () => {
    if (!selectedDelivery) return;

    if (!inputOtp.trim()) {
      showError("Please enter the 4-digit customer handover OTP.");
      return;
    }

    if (inputOtp.trim() !== selectedDelivery.otpCode && inputOtp.trim() !== "7834") {
      showError(`Invalid OTP. For demonstration, use ${selectedDelivery.otpCode || "7834"}.`);
      return;
    }

    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    confirmDelivery(selectedDelivery.bookingId, inputOtp.trim(), true);

    setLocalDeliveries((prev) =>
      prev.map((d) =>
        d.id === selectedDelivery.id
          ? {
              ...d,
              isOtpVerified: true,
              signatureCaptured: true,
              photoUrl: uploadedPhotoUrl || "https://images.unsplash.com/photo-1541888946425-d0fbb180c5f7?w=600&auto=format&fit=crop&q=80",
              deliveryTime: now,
              status: "Delivered",
              remarks: deliveryRemarks,
            }
          : d
      )
    );

    showSuccess(`POD Verified & Certified! Trip for vehicle ${selectedDelivery.vehicleNumber} successfully closed.`);
    setIsConfirmModalOpen(false);
  };

  const handleVerifyOtpOnly = () => {
    if (!selectedDelivery) return;
    if (inputOtp.trim() !== selectedDelivery.otpCode && inputOtp.trim() !== "7834") {
      showError(`Invalid OTP code entered. Authorized demo OTP is ${selectedDelivery.otpCode || "7834"}.`);
      return;
    }

    setLocalDeliveries((prev) =>
      prev.map((d) => (d.id === selectedDelivery.id ? { ...d, isOtpVerified: true } : d))
    );
    showSuccess(`Customer OTP Verified for ${selectedDelivery.deliveryId}! Cryptographic handshake successful.`);
    setIsOtpModalOpen(false);
  };

  const handleSaveSignature = () => {
    if (!selectedDelivery) return;
    const canvas = canvasRef.current;
    let dataUrl = "";
    if (canvas && hasDrawnSignature) {
      dataUrl = canvas.toDataURL("image/png");
    }

    setLocalDeliveries((prev) =>
      prev.map((d) =>
        d.id === selectedDelivery.id
          ? {
              ...d,
              signatureCaptured: true,
              signatureDataUrl: dataUrl || d.signatureDataUrl,
            }
          : d
      )
    );
    showSuccess(`Digital signature captured and sealed for ${selectedDelivery.customerName}.`);
    setIsSignatureModalOpen(false);
  };

  const handleSavePhoto = () => {
    if (!selectedDelivery) return;
    const samplePhoto =
      uploadedPhotoUrl ||
      "https://images.unsplash.com/photo-1541888946425-d0fbb180c5f7?w=600&auto=format&fit=crop&q=80";

    setLocalDeliveries((prev) =>
      prev.map((d) =>
        d.id === selectedDelivery.id
          ? {
              ...d,
              photoUrl: samplePhoto,
            }
          : d
      )
    );
    showSuccess(`Unloading site photo geotagged and attached to ${selectedDelivery.deliveryId}.`);
    setIsPhotoModalOpen(false);
  };

  // Status Badge Helper
  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case "Delivered":
        return <Badge variant="success">Delivered & Closed</Badge>;
      case "Pending OTP":
        return <Badge variant="warning">Pending OTP / POD</Badge>;
      case "Failed":
        return <Badge variant="danger">Delivery Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Table Columns Definition
  const columns: MRT_ColumnDef<DeliveryConfirmation>[] = useMemo(
    () => [
      {
        accessorKey: "deliveryId",
        header: "Delivery ID",
        size: 150,
        Cell: ({ row }) => (
          <button
            onClick={() => openDetailModal(row.original)}
            className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 text-left"
            title="Click to view full POD dossier"
          >
            <ShieldCheck size={13} className="text-purple-500 shrink-0" />
            <span className="truncate">{row.original.deliveryId}</span>
          </button>
        ),
      },
      {
        accessorKey: "bookingId",
        header: "Booking ID",
        size: 140,
        Cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
            {row.original.bookingId}
          </span>
        ),
      },
      {
        accessorKey: "vehicleNumber",
        header: "Vehicle & Driver",
        size: 180,
        Cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
              {row.original.vehicleNumber}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {row.original.driverName || "Commercial Carrier"}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "customerName",
        header: "Customer",
        size: 190,
        Cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
              {row.original.customerName}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              {row.original.customerMobile}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "quantityDeliveredMt",
        header: "Quantity",
        size: 140,
        Cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-mono text-xs font-bold text-orange-600 dark:text-orange-400">
              {row.original.quantityDeliveredMt} MT
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
              {row.original.sandType || "Ordinary River Sand"}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "deliveryLocation",
        header: "Delivery Time & Location",
        size: 240,
        Cell: ({ row }) => (
          <div className="flex flex-col max-w-[220px]">
            <span
              className="text-xs text-slate-800 dark:text-slate-200 truncate font-medium"
              title={row.original.deliveryLocation}
            >
              {row.original.deliveryLocation}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
              <Clock size={10} className="shrink-0" />
              <span className="truncate">{row.original.deliveryTime}</span>
            </span>
          </div>
        ),
      },
      {
        accessorKey: "isOtpVerified",
        header: "OTP / QR Verify",
        size: 140,
        Cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            {row.original.isOtpVerified ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 size={12} className="text-emerald-500" />
                OTP Verified
              </span>
            ) : (
              <button
                onClick={() => openOtpModal(row.original)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors"
                title={`Click to verify OTP (Demo: ${row.original.otpCode || "7834"})`}
              >
                <KeyRound size={12} className="text-amber-500" />
                Pending ({row.original.otpCode || "7834"})
              </button>
            )}
          </div>
        ),
      },
      {
        id: "proofArtifacts",
        header: "Signature / Photo",
        size: 150,
        Cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => openSignatureModal(row.original)}
              title={row.original.signatureCaptured ? "Signature Verified" : "Capture Signature"}
              className={`p-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                row.original.signatureCaptured
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-purple-50 hover:text-purple-600"
              }`}
            >
              <PenTool size={11} />
              <span className="text-[10px]">{row.original.signatureCaptured ? "Signed" : "Sign"}</span>
            </button>

            <button
              onClick={() => openPhotoModal(row.original)}
              title={row.original.photoUrl ? "View Site Photo" : "Upload Site Photo"}
              className={`p-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                row.original.photoUrl
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              <Camera size={11} />
              <span className="text-[10px]">{row.original.photoUrl ? "Photo" : "Upload"}</span>
            </button>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Trip Status",
        size: 150,
        Cell: ({ row }) => getDeliveryStatusBadge(row.original.status),
      },
    ],
    []
  );

  const exportCols = columns
    .filter((c) => c.accessorKey)
    .map((c) => ({ accessorKey: c.accessorKey as string, header: c.header as string }));

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Delivery & Proof of Delivery (POD)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Confirm final delivery, validate cryptographic customer OTP/QR, record digital signatures & geotagged photos, and certify trip closure.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={<Download size={14} />}
            onClick={() => exportToExcel(exportCols, localDeliveries, "SMMS_Delivery_POD_Ledger")}
          >
            Export Excel
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon={<Printer size={14} />}
            onClick={() => exportToPDF(exportCols, localDeliveries, "SMMS_Delivery_POD_Ledger", "State Sand Delivery & Proof of Delivery Ledger")}
          >
            Export PDF
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={<CheckCircle2 size={14} />}
            onClick={() => {
              const pending = localDeliveries.find((d) => d.status === "Pending OTP") || localDeliveries[0];
              if (pending) {
                openConfirmModal(pending);
              } else {
                showError("No pending deliveries available for closure.");
              }
            }}
          >
            Confirm Delivery (POD)
          </Button>
        </div>
      </div>

      {/* ── Top KPI Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Consignments</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats.total}{" "}
              <span className="text-sm font-semibold text-slate-500">({stats.totalTonnage} MT)</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Dispatched Sand Loads</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Truck size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Delivered & Closed</p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {stats.delivered}{" "}
              <span className="text-sm font-semibold text-slate-500">PODs</span>
            </h3>
            <p className="text-[11px] text-emerald-600 mt-0.5">Trips Terminated with OTP</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Awaiting Handover</p>
            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {stats.pending}{" "}
              <span className="text-sm font-semibold text-slate-500">Pending</span>
            </h3>
            <p className="text-[11px] text-amber-600 mt-0.5">En Route / At Gate</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Authentication Rate</p>
            <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
              {stats.successRate}%
            </h3>
            <p className="text-[11px] text-blue-600 mt-0.5">Tamper-Proof Geotagged POD</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Sparkles size={22} />
          </div>
        </div>
      </div>

      {/* ── Main POD Ledger Table ── */}
      <Card
        title="Statewide Proof of Delivery (POD) & Consignment Handover Ledger"
        icon={FileText}
        action={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              icon={<RotateCcw size={13} />}
              onClick={() => {
                setLocalDeliveries(deliveries);
                showSuccess("Delivery ledger re-synchronized.");
              }}
            >
              Refresh
            </Button>
          </div>
        }
      >
        <ReusableTable
          columns={columns}
          data={localDeliveries}
          exportFileName="SMMS_Deliveries_POD"
          onExportExcel={(rows) => exportToExcel(exportCols, rows, "SMMS_Deliveries_POD")}
          onExportPDF={(rows) => exportToPDF(exportCols, rows, "SMMS_Deliveries_POD", "Proof of Delivery Ledger")}
          enableRowActions
          renderRowActions={({ row }) => {
            const isDelivered = row.original.status === "Delivered";
            const isOtpVerified = row.original.isOtpVerified;
            const isSignatureCaptured = row.original.signatureCaptured;
            const hasPhoto = Boolean(row.original.photoUrl);

            return (
              <div className="flex items-center gap-1">
                {/* 1. View POD Full Audit (Always Enabled) */}
                <button
                  title="View POD Details & Consignment Lifecycle"
                  onClick={() => openDetailModal(row.original)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-slate-600 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors"
                >
                  <Eye size={14} />
                </button>

                {/* 2. Confirm Delivery (Enabled if not delivered, Disabled if already delivered) */}
                <button
                  title={
                    isDelivered
                      ? "Delivery Certified & Trip Closed"
                      : "Confirm Delivery & Certify Handover (Close Trip)"
                  }
                  disabled={isDelivered}
                  onClick={() => openConfirmModal(row.original)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    isDelivered
                      ? "text-emerald-600 dark:text-emerald-400 cursor-not-allowed opacity-50"
                      : "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50"
                  }`}
                >
                  <CheckCircle2 size={14} />
                </button>

                {/* 3. Capture OTP / QR (Enabled if pending OTP, Disabled if verified) */}
                <button
                  title={
                    isOtpVerified
                      ? `OTP Verified (${row.original.otpCode || "7834"})`
                      : "Capture Customer Handover OTP / Scan Citizen QR"
                  }
                  disabled={isOtpVerified}
                  onClick={() => openOtpModal(row.original)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    isOtpVerified
                      ? "text-emerald-600 dark:text-emerald-400 cursor-not-allowed opacity-50"
                      : "text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/50"
                  }`}
                >
                  <KeyRound size={14} />
                </button>

                {/* 4. Capture Signature (Always Enabled to view or sign) */}
                <button
                  title={
                    isSignatureCaptured
                      ? "View / Update Digital Signature"
                      : "Capture Customer Digital Signature"
                  }
                  onClick={() => openSignatureModal(row.original)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    isSignatureCaptured
                      ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                      : "text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/50"
                  }`}
                >
                  <PenTool size={14} />
                </button>

                {/* 5. Upload Site Photo (Always Enabled to view or upload) */}
                <button
                  title={
                    hasPhoto
                      ? "View Attached Geotagged Site Photo"
                      : "Upload / Capture Geotagged Unloading Photo"
                  }
                  onClick={() => openPhotoModal(row.original)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    hasPhoto
                      ? "text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                      : "text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                  }`}
                >
                  <Camera size={14} />
                </button>

                {/* 6. Print Delivery Receipt (Always Enabled) */}
                <button
                  title="Print Official POD Receipt / Delivery Challan"
                  onClick={() => openReceiptModal(row.original)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                >
                  <Printer size={14} />
                </button>
              </div>
            );
          }}
        />
      </Card>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL 1: CONFIRM DELIVERY & MULTI-FACTOR POD (CLOSE TRIP) ──────── */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL 1: INTERACTIVE 5-STEP CUSTOMER LOCATION DELIVERY MODULE ── */}
      {selectedDelivery && (
        <Modal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          title={`Delivery Module: ${selectedDelivery.deliveryId} (${selectedDelivery.vehicleNumber})`}
          subtitle="At customer location: Vehicle Arrives → Customer Verification → Sand Delivered → Customer OTP → Delivery Confirmation"
          size="xl"
          footer={null}
        >
          <div className="pt-1">
            <CustomerLocationDeliveryModule
              initialDeliveryId={selectedDelivery.id}
              showSelector={false}
              compact={true}
              onDeliveryCompleted={(updated) => {
                setLocalDeliveries((prev) =>
                  prev.map((d) => (d.id === updated.id ? updated : d))
                );
              }}
            />
          </div>
        </Modal>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL 2: CAPTURE OTP / SCAN QR ─────────────────────────────────── */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {selectedDelivery && (
        <Modal
          isOpen={isOtpModalOpen}
          onClose={() => setIsOtpModalOpen(false)}
          title="Customer Handover OTP & QR Authentication"
          subtitle={`Authenticate delivery recipient for ${selectedDelivery.deliveryId}`}
          size="md"
          footer={null}
        >
          <div className="space-y-4 pt-1 text-xs">
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800/60">
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-300 mx-auto mb-2 shadow-inner">
                <KeyRound size={26} />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                SMS Verification Code
              </h4>
              <p className="text-slate-500 mt-1">
                Enter the OTP sent to <strong>{selectedDelivery.customerName}</strong> ({selectedDelivery.customerMobile}).
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                4-Digit Handover OTP *
              </label>
              <input
                type="text"
                value={inputOtp}
                onChange={(e) => setInputOtp(e.target.value)}
                placeholder="Enter 4-digit OTP (e.g. 7834)"
                className={`${inputBase} ${inputNormal} text-center font-mono font-black text-xl tracking-[0.4em]`}
                maxLength={6}
                autoFocus
              />
              <div className="flex justify-between items-center mt-2 text-[11px] text-slate-500">
                <span>Demo Code: <strong>{selectedDelivery.otpCode || "7834"}</strong></span>
                <button
                  type="button"
                  onClick={() => setInputOtp(selectedDelivery.otpCode || "7834")}
                  className="text-purple-600 hover:underline font-semibold"
                >
                  Quick Fill
                </button>
              </div>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="flex-shrink mx-4 text-slate-400 text-[10px] uppercase font-semibold">Or Scan Citizen QR</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <QrCode size={24} className="text-slate-700 dark:text-slate-300" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-xs">Citizen Mobile App QR</p>
                  <p className="text-[10px] text-slate-500">Scan QR from citizen order screen</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setInputOtp(selectedDelivery.otpCode || "7834");
                  showSuccess("QR Decoded: Authenticated Customer Token.");
                }}
              >
                Scan Token
              </Button>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" onClick={() => setIsOtpModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" icon={<CheckCircle2 size={14} />} onClick={handleVerifyOtpOnly}>
                Verify OTP
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL 3: DIGITAL SIGNATURE PAD ─────────────────────────────────── */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {selectedDelivery && (
        <Modal
          isOpen={isSignatureModalOpen}
          onClose={() => setIsSignatureModalOpen(false)}
          title="Customer Digital Signature Capture"
          subtitle={`Recipient signature acknowledgment for ${selectedDelivery.deliveryId}`}
          size="md"
          footer={null}
        >
          <div className="space-y-4 pt-1 text-xs">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-slate-500 block">Authorized Signatory</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {selectedDelivery.customerName}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200">
                Touchscreen / Mouse Pad
              </span>
            </div>

            {/* Signature Canvas */}
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-2 bg-white dark:bg-slate-950 relative">
              <canvas
                ref={canvasRef}
                width={440}
                height={160}
                className="w-full h-40 bg-white dark:bg-slate-900 rounded-xl cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              {!hasDrawnSignature && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400">
                  <PenTool size={24} className="mb-1 opacity-50" />
                  <span className="text-xs">Draw signature here with pen or finger</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-500">
              <span>Security Stamp: SHA-256 Cryptographic Hash</span>
              <button
                type="button"
                onClick={clearSignatureCanvas}
                className="text-rose-600 hover:underline font-semibold flex items-center gap-1"
              >
                <RotateCcw size={11} /> Clear Pad
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" onClick={() => setIsSignatureModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                icon={<Check size={14} />}
                onClick={handleSaveSignature}
              >
                Seal & Save Signature
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL 4: UPLOAD SITE & UNLOADING PHOTO ─────────────────────────── */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {selectedDelivery && (
        <Modal
          isOpen={isPhotoModalOpen}
          onClose={() => setIsPhotoModalOpen(false)}
          title="Consignment Unloading Site Photo"
          subtitle={`Geotagged physical unloading verification for ${selectedDelivery.deliveryId}`}
          size="md"
          footer={null}
        >
          <div className="space-y-4 pt-1 text-xs">
            {/* Photo Preview Container */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 aspect-video flex items-center justify-center">
              {uploadedPhotoUrl || selectedDelivery.photoUrl ? (
                <img
                  src={uploadedPhotoUrl || selectedDelivery.photoUrl}
                  alt="Delivery Unloading Site"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                  <Camera size={38} className="text-slate-500 mb-2 animate-pulse" />
                  <p className="font-semibold text-slate-300">No site photo attached yet</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Capture sand stockpiling or tipper discharge at consignee site.
                  </p>
                </div>
              )}

              {/* Watermark overlay */}
              <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-md rounded-lg p-2 text-white font-mono text-[10px] space-y-0.5">
                <div className="flex justify-between">
                  <span>GPS: {selectedDelivery.geoCoordinates || "21.1610° N, 81.7870° E"}</span>
                  <span>ACCURACY: ±2.4m</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>VEHICLE: {selectedDelivery.vehicleNumber}</span>
                  <span>TIME: {new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            {/* Quick Sample Selector */}
            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 text-xs">
                Select / Upload Proof Image:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    name: "Stockpile Silo",
                    url: "https://images.unsplash.com/photo-1541888946425-d0fbb180c5f7?w=600&auto=format&fit=crop&q=80",
                  },
                  {
                    name: "Tipper Unloading",
                    url: "https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=600&auto=format&fit=crop&q=80",
                  },
                  {
                    name: "Site Gate",
                    url: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&auto=format&fit=crop&q=80",
                  },
                ].map((sample) => (
                  <button
                    key={sample.name}
                    type="button"
                    onClick={() => setUploadedPhotoUrl(sample.url)}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      (uploadedPhotoUrl || selectedDelivery.photoUrl) === sample.url
                        ? "border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                    }`}
                  >
                    <div className="text-[11px]">{sample.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" onClick={() => setIsPhotoModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" icon={<Upload size={14} />} onClick={handleSavePhoto}>
                Confirm & Geotag Photo
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL 5: PRINT OFFICIAL DELIVERY RECEIPT / POD CHALLAN ─────────── */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {selectedDelivery && (
        <Modal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          title="Official Sand Delivery Receipt & POD Challan"
          subtitle="Directorate of Geology & Mining – Government of Chhattisgarh"
          size="lg"
          footer={
            <ModalFooter
              onClose={() => setIsReceiptModalOpen(false)}
              onConfirm={() => {
                window.print();
              }}
              confirmText="Print Delivery Receipt"
              confirmIcon={<Printer size={14} />}
            />
          }
        >
          <div className="bg-white text-slate-900 p-6 rounded-2xl border border-slate-300 shadow-sm space-y-5 font-sans">
            {/* Receipt Header */}
            <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                  GOVERNMENT OF CHHATTISGARH
                </span>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  DIRECTORATE OF GEOLOGY & MINING
                </h2>
                <p className="text-xs font-semibold text-purple-700">
                  Sand Mining Management System (CG-SMMS) • Form VIII (Final POD)
                </p>
              </div>

              <div className="flex flex-col items-end">
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-900 text-white rounded">
                  ORIGINAL CONSIGNEE SLIP
                </span>
                <span className="font-mono text-xs font-bold text-slate-700 mt-1">
                  Receipt #: {selectedDelivery.receiptNumber || `RCPT-CG-2026-${selectedDelivery.deliveryId.slice(-4)}`}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Date: {selectedDelivery.deliveryTime !== "Pending Delivery" ? selectedDelivery.deliveryTime : new Date().toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Consignment Grid Specs */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] font-bold text-slate-500 uppercase">1. Consignment References</p>
                <div className="flex justify-between">
                  <span className="text-slate-600">POD Record ID:</span>
                  <span className="font-mono font-bold">{selectedDelivery.deliveryId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Booking Order Ref:</span>
                  <span className="font-mono font-bold">{selectedDelivery.bookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Sand Mineral Type:</span>
                  <span className="font-bold">{selectedDelivery.sandType || "River Sand"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Net Quantity Handed Over:</span>
                  <span className="font-mono font-black text-orange-600 text-sm">
                    {selectedDelivery.quantityDeliveredMt} MT
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] font-bold text-slate-500 uppercase">2. Logistics & Carrier</p>
                <div className="flex justify-between">
                  <span className="text-slate-600">Vehicle Registration:</span>
                  <span className="font-mono font-bold">{selectedDelivery.vehicleNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Designated Driver:</span>
                  <span className="font-bold">{selectedDelivery.driverName || "Dharmendra Sahu"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Delivery Geotag:</span>
                  <span className="font-mono font-bold text-emerald-700">{selectedDelivery.geoCoordinates || "21.1610° N, 81.7870° E"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Trip Closure Status:</span>
                  <span className="font-bold text-emerald-700 uppercase">Certified & Closed</span>
                </div>
              </div>
            </div>

            {/* Recipient & Site */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase">3. Consignee / Delivery Destination</p>
              <div className="flex justify-between font-medium">
                <span>Recipient Name: <strong>{selectedDelivery.customerName}</strong></span>
                <span>Contact: <strong className="font-mono">{selectedDelivery.customerMobile}</strong></span>
              </div>
              <p className="text-slate-700">
                Site Address: <strong>{selectedDelivery.deliveryLocation}</strong>
              </p>
            </div>

            {/* Verification Signature & QR Box */}
            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-200 items-end">
              <div className="flex flex-col items-center justify-center p-2 bg-white border border-slate-300 rounded-xl">
                <QrCode size={64} className="text-slate-900" />
                <span className="text-[8px] font-mono text-slate-500 mt-0.5">SMMS CRYPTOGRAPHIC POD</span>
              </div>

              <div className="text-center space-y-1">
                <div className="h-10 border-b border-dashed border-slate-400 flex items-center justify-center">
                  <span className="font-serif italic text-sm font-bold text-slate-700">
                    {selectedDelivery.driverName || "Dharmendra Sahu"}
                  </span>
                </div>
                <p className="text-[9px] font-bold text-slate-500 uppercase">Carrier Driver Signature</p>
              </div>

              <div className="text-center space-y-1">
                <div className="h-10 border-b border-dashed border-slate-400 flex items-center justify-center">
                  <span className="font-serif italic text-sm font-bold text-emerald-700">
                    {selectedDelivery.customerName} (OTP Verified)
                  </span>
                </div>
                <p className="text-[9px] font-bold text-slate-500 uppercase">Consignee Acknowledgment Seal</p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL 6: DETAILED POD AUDIT DOSSIER ─────────────────────────────── */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {selectedDelivery && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Proof of Delivery Audit Dossier – ${selectedDelivery.deliveryId}`}
          subtitle="Complete lifecycle traceability and chain of custody"
          size="lg"
          footer={
            <ModalFooter
              onClose={() => setIsDetailModalOpen(false)}
              onConfirm={() => openReceiptModal(selectedDelivery)}
              confirmText="Print Receipt"
              confirmIcon={<Printer size={14} />}
            />
          }
        >
          <div className="space-y-4 pt-1 text-xs">
            {/* Timeline progression */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Layers size={14} className="text-purple-600" />
                Chain of Custody & Consignment Lifecycle
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-emerald-300">
                  <span className="text-[10px] font-bold text-emerald-600 block">STEP 1</span>
                  <span className="font-semibold text-slate-900 dark:text-white text-xs">Weighbridge Out</span>
                  <span className="text-[10px] text-slate-500 block">Gross - Tare Certified</span>
                </div>
                <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-emerald-300">
                  <span className="text-[10px] font-bold text-emerald-600 block">STEP 2</span>
                  <span className="font-semibold text-slate-900 dark:text-white text-xs">e-Pass Transit</span>
                  <span className="text-[10px] text-slate-500 block">GPS Corridor Tracked</span>
                </div>
                <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-emerald-300">
                  <span className="text-[10px] font-bold text-emerald-600 block">STEP 3</span>
                  <span className="font-semibold text-slate-900 dark:text-white text-xs">OTP Handover</span>
                  <span className="text-[10px] text-slate-500 block">4-Digit Citizen Auth</span>
                </div>
                <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30">
                  <span className="text-[10px] font-bold text-emerald-600 block">STEP 4</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300 text-xs">Trip Closed</span>
                  <span className="text-[10px] text-emerald-600 block">Stock Deducted</span>
                </div>
              </div>
            </div>

            {/* Audit key-values */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-slate-500 block">Delivery ID</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedDelivery.deliveryId}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Booking Reference</span>
                <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{selectedDelivery.bookingId}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Vehicle Registration</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedDelivery.vehicleNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Consignee Customer</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedDelivery.customerName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Customer Mobile</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedDelivery.customerMobile}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Quantity Delivered</span>
                <span className="font-mono font-bold text-orange-600">{selectedDelivery.quantityDeliveredMt} MT</span>
              </div>
              <div>
                <span className="text-slate-500 block">Geotag Coordinates</span>
                <span className="font-mono font-bold text-emerald-600">{selectedDelivery.geoCoordinates || "21.1610° N, 81.7870° E"}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Handover OTP Status</span>
                <span className="font-bold text-emerald-600">
                  {selectedDelivery.isOtpVerified ? "Verified (Match)" : `Pending Code: ${selectedDelivery.otpCode || "7834"}`}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Digital Signature</span>
                <span className="font-bold text-emerald-600">
                  {selectedDelivery.signatureCaptured ? "Captured & SHA-256 Stamped" : "Pending Signature"}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-3">
                <span className="text-slate-500 block">Destination Site Address</span>
                <span className="font-medium text-slate-900 dark:text-white">{selectedDelivery.deliveryLocation}</span>
              </div>
              <div className="col-span-2 sm:col-span-3">
                <span className="text-slate-500 block">Delivery Officer Remarks</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{selectedDelivery.remarks}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DeliveryList;
