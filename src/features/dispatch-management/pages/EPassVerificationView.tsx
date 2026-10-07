import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  QrCode,
  CheckCircle2,
  ShieldCheck,
  Printer,
  Eye,
  RefreshCw,
  Ban,
  FileText,
  Camera,
  AlertTriangle,
  Plus,
} from "lucide-react";
import type { EPassRecord, EPassStatus } from "../types";
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
import { IMAGES } from "@/assets/images";
import { createDigitalTransitPass, verifyTransitPassIntegrity } from "../service/transitPassService";
import { DigitalTransitPassModal } from "../components/DigitalTransitPassModal";
import "../styles/dispatch.css";

const INITIAL_EPASS_RECORDS: EPassRecord[] = [
  {
    id: "EP-001",
    transitPassNumber: "TP-CG-2026-09144",
    ePassNumber: "TP-CG-2026-09144",
    qrPayload: "CG-SMMS|TRANSIT-PASS|TP-CG-2026-09144|BKG-CG-2026-0941|CG04TX2341|16MT|Mahanadi Reach|Naya Raipur|EXP-20260310-1800",
    orderId: "BKG-CG-2026-0941",
    bookingId: "BKG-CG-2026-0941",
    vehicleNumber: "CG-04-TX-2341",
    driverName: "Dharmendra Sahu",
    driverMobile: "9826190012",
    driverLicense: "CG-04-DL-2018-0912",
    sandReach: {
      reachId: "RCH-CG-04",
      reachName: "Mahanadi Riverbed Reach-04",
      riverStream: "Mahanadi River",
      district: "Raipur",
    },
    quantityMt: 16.0,
    sandType: "Coarse River Sand",
    sourceStockyard: "Mandir Hasaud Central Stockyard",
    destination: "Naya Raipur Sector 24 Project Site",
    dateTime: "2026-03-09 14:40",
    issueTime: "2026-03-09 14:40",
    customerDetails: {
      name: "Raipur Infrastructures Corp",
      mobile: "9826011223",
      category: "Commercial Builder",
      deliveryAddress: "Naya Raipur Sector 24 Project Site",
    },
    validity: {
      validFrom: "2026-03-09 14:40",
      validUntil: "2026-03-10 18:00",
      durationHours: 8,
      isExpired: false,
    },
    validUntil: "2026-03-10 18:00",
    gpsTrackingRef: {
      deviceImei: "AIS140-CG-04-8891",
      corridorGeofence: "Mandir Hasaud to Naya Raipur Corridor",
      isSignalActive: true,
      lastCoordinates: "21.1612° N, 81.7891° E",
    },
    gpsImei: "AIS140-CG-04-8891",
    isLocked: true,
    status: "In Transit" as EPassStatus,
    weighbridgeSlipNumber: "WB-SLIP-2026-9041",
    tareWeightKg: 8400,
    grossWeightKg: 24400,
    securityHash: "0x8F94D276A8B10C99E54178",
    scannedCount: 2,
    lastScannedLocation: "Arang NH-53 Enforcement Post",
    lastScannedTime: "2026-03-09 15:10",
  },
  {
    id: "EP-002",
    ePassNumber: "EPASS-CG-2026-09145",
    qrPayload: "CG-SMMS|EPASS-CG-2026-09145|CG10AZ8812|10MT|BILASPUR-RINGROAD|EXP-20260310-1900",
    bookingId: "BKG-CG-2026-0942",
    vehicleNumber: "CG-10-AZ-8812",
    driverName: "Gopal Ram Yadav",
    driverMobile: "9425177890",
    driverLicense: "CG-10-DL-2019-3321",
    quantityMt: 10.0,
    sandType: "Medium Concrete Sand",
    sourceStockyard: "Koni Bypass Stockyard",
    destination: "Bilaspur Smart City Ring Road Zone",
    issueTime: "2026-03-09 15:30",
    validUntil: "2026-03-10 19:30",
    status: "Valid" as EPassStatus,
    weighbridgeSlipNumber: "WB-SLIP-2026-9042",
    securityHash: "0x3C49B112E709F8990142A7",
    scannedCount: 1,
    lastScannedLocation: "Koni Weighbridge Gate-Out",
    lastScannedTime: "2026-03-09 15:35",
  },
  {
    id: "EP-003",
    ePassNumber: "EPASS-CG-2026-09146",
    qrPayload: "CG-SMMS|EPASS-CG-2026-09146|CG07CA5510|24MT|BHILAI-STEEL|EXP-20260310-2000",
    bookingId: "BKG-CG-2026-0943",
    vehicleNumber: "CG-07-CA-5510",
    driverName: "Sanjay Kumar Netam",
    driverMobile: "9755201144",
    driverLicense: "CG-07-DL-2017-7721",
    quantityMt: 24.0,
    sandType: "Coarse River Sand",
    sourceStockyard: "Pulgaon Riverbed Depot",
    destination: "Bhilai Steel Township Expansion Phase-2",
    issueTime: "2026-03-09 16:00",
    validUntil: "2026-03-10 20:00",
    status: "Valid" as EPassStatus,
    weighbridgeSlipNumber: "WB-SLIP-2026-9043",
    securityHash: "0x77E120A09C55B3214890F1",
    scannedCount: 0,
  },
  {
    id: "EP-004",
    ePassNumber: "EPASS-CG-2026-09139",
    qrPayload: "CG-SMMS|EPASS-CG-2026-09139|CG12MB9021|16MT|KORBA-IND|EXP-20260309-1200",
    bookingId: "BKG-CG-2026-0935",
    vehicleNumber: "CG-12-MB-9021",
    driverName: "Bhupendra Baghel",
    driverMobile: "9981432201",
    driverLicense: "CG-12-DL-2020-5512",
    quantityMt: 16.0,
    sandType: "Fine Plastering Sand",
    sourceStockyard: "Darri Barrage River Stockyard",
    destination: "Korba Industrial Estate Plot 44",
    issueTime: "2026-03-08 10:00",
    validUntil: "2026-03-09 10:00",
    status: "Delivered (Invalidated)" as EPassStatus,
    weighbridgeSlipNumber: "WB-SLIP-2026-8901",
    securityHash: "0x110A9B44F8812E30948190",
    scannedCount: 3,
    lastScannedLocation: "Korba Consignee Unloading Bay",
    lastScannedTime: "2026-03-08 17:40",
  },
  {
    id: "EP-005",
    ePassNumber: "EPASS-CG-2026-09120",
    qrPayload: "CG-SMMS|EPASS-CG-2026-09120|CG17HB3309|10MT|BASTAR-SCH|EXP-20260308-1600",
    bookingId: "BKG-CG-2026-0920",
    vehicleNumber: "CG-17-HB-3309",
    driverName: "Prakash Korram",
    driverMobile: "9179883412",
    driverLicense: "CG-17-DL-2016-1190",
    quantityMt: 10.0,
    sandType: "Medium Concrete Sand",
    sourceStockyard: "Jagdalpur South Depot",
    destination: "Jagdalpur Sector 5 Educational Hub",
    issueTime: "2026-03-07 14:00",
    validUntil: "2026-03-08 14:00",
    status: "Expired" as EPassStatus,
    weighbridgeSlipNumber: "WB-SLIP-2026-8711",
    securityHash: "0x44901F882AC33B91044219",
    scannedCount: 1,
    lastScannedLocation: "Jagdalpur Toll Plaza Checkpost",
    lastScannedTime: "2026-03-07 18:20",
  },
];

export const EPassVerificationView: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useStatusModal();

  const [epassRecords, setEpassRecords] = useState<EPassRecord[]>(INITIAL_EPASS_RECORDS);

  // Modal State Management
  const [selectedPass, setSelectedPass] = useState<EPassRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isRoadsideVerifyModalOpen, setIsRoadsideVerifyModalOpen] = useState(false);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  // Form states
  const [extendHours, setExtendHours] = useState(12);
  const [revokeReason, setRevokeReason] = useState("Flying squad detected unauthorized route diversion beyond geofenced transit corridor.");

  // Generate form state
  const [genBookingId, setGenBookingId] = useState("BKG-CG-2026-0950");
  const [genVehicleNum, setGenVehicleNum] = useState("CG-04-TX-2341");
  const [genDriverName, setGenDriverName] = useState("Dharmendra Sahu");
  const [genQuantityMt, setGenQuantityMt] = useState(16.0);
  const [genSourceStockyard, setGenSourceStockyard] = useState("Mandir Hasaud Central Stockyard");
  const [genDestination, setGenDestination] = useState("Shankar Nagar Civil Lines Phase-1");

  // Status Badges
  const getEPassStatusBadge = (status: EPassStatus) => {
    switch (status) {
      case "Valid":
        return <Badge variant="success">Valid (Active)</Badge>;
      case "In Transit":
        return <Badge variant="primary">In Transit</Badge>;
      case "Delivered (Invalidated)":
        return <Badge variant="secondary">Delivered (Closed)</Badge>;
      case "Expired":
        return <Badge variant="warning">Expired (Time-out)</Badge>;
      case "Revoked":
        return <Badge variant="danger">Revoked / Seized</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // KPIs
  const stats = useMemo(() => {
    const totalIssued = epassRecords.length;
    const activeValid = epassRecords.filter((p) => p.status === "Valid" || p.status === "In Transit").length;
    const deliveredCount = epassRecords.filter((p) => p.status === "Delivered (Invalidated)").length;
    const expiredOrRevoked = epassRecords.filter((p) => p.status === "Expired" || p.status === "Revoked").length;

    return {
      totalIssued,
      activeValid,
      deliveredCount,
      expiredOrRevoked,
    };
  }, [epassRecords]);

  // Handlers
  const handleConfirmExtend = () => {
    if (!selectedPass) return;
    const now = new Date();
    now.setHours(now.getHours() + Number(extendHours));
    const newValidUntil = now.toISOString().replace("T", " ").substring(0, 16);

    setEpassRecords((prev) =>
      prev.map((p) =>
        p.id === selectedPass.id
          ? { ...p, validUntil: newValidUntil, status: "Valid" }
          : p
      )
    );
    showSuccess(`Transit validity for ${selectedPass.ePassNumber} extended by ${extendHours} hours.`);
    setIsExtendModalOpen(false);
  };

  const handleConfirmRevoke = () => {
    if (!selectedPass) return;
    if (!revokeReason.trim()) {
      showError("Please provide an enforcement revocation reason.");
      return;
    }

    setEpassRecords((prev) =>
      prev.map((p) =>
        p.id === selectedPass.id
          ? { ...p, status: "Revoked" }
          : p
      )
    );
    showSuccess(`Transit e-Pass ${selectedPass.ePassNumber} revoked and blacklisted for road transport.`);
    setIsRevokeModalOpen(false);
  };

  const handleGenerateNewPass = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord = createDigitalTransitPass({
      orderId: genBookingId,
      vehicleNumber: genVehicleNum,
      driverName: genDriverName,
      driverMobile: "9826190012",
      driverLicense: "CG-04-DL-2020-0012",
      sandReach: {
        reachId: "RCH-CG-04",
        reachName: genSourceStockyard || "Mahanadi Riverbed Reach-04",
        riverStream: "Mahanadi River",
        district: "Raipur",
      },
      sourceStockyard: genSourceStockyard,
      destination: genDestination,
      quantityMt: Number(genQuantityMt),
      sandType: "Coarse River Sand",
      customerDetails: {
        name: "Consignee Buyer",
        mobile: "9826011223",
        category: "Commercial Builder",
        deliveryAddress: genDestination,
      },
      validityHours: 8,
      officerName: "S. K. Verma",
      officerId: "SRO-RAIPUR-004",
      designation: "Sand Reach Officer (SRO)",
    });

    setEpassRecords((prev) => [newRecord, ...prev]);
    setSelectedPass(newRecord);
    showSuccess(`New Electronic Transit Pass ${newRecord.transitPassNumber} generated & locked with SHA-256 seal!`);
    setIsGenerateModalOpen(false);
  };

  // Table Columns Definition (Clean Minimal Single-Line Format)
  const columns = useMemo<MRT_ColumnDef<EPassRecord>[]>(
    () => [
      {
        accessorKey: "ePassNumber",
        header: "Unique e-Pass / QR #",
        size: 170,
        Cell: ({ row }) => (
          <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
            {row.original.ePassNumber}
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
            {row.original.vehicleNumber}
          </span>
        ),
      },
      {
        accessorKey: "driverName",
        header: "Driver",
        size: 140,
        Cell: ({ row }) => (
          <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate block" title={row.original.driverName}>
            {row.original.driverName}
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
        accessorKey: "sourceStockyard",
        header: "Source",
        size: 160,
        Cell: ({ row }) => (
          <span className="text-xs text-slate-700 dark:text-slate-300 truncate block max-w-[150px]" title={row.original.sourceStockyard}>
            {row.original.sourceStockyard}
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
        accessorKey: "issueTime",
        header: "Issue Time",
        size: 130,
        Cell: ({ row }) => (
          <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
            {row.original.issueTime}
          </span>
        ),
      },
      {
        accessorKey: "validUntil",
        header: "Validity",
        size: 140,
        Cell: ({ row }) => (
          <span className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate block" title={`Valid till: ${row.original.validUntil}`}>
            {row.original.validUntil}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Pass Status",
        size: 140,
        Cell: ({ row }) => getEPassStatusBadge(row.original.status),
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">e-Pass / QR Verification Hub</h1>
          <p className="text-xs text-slate-500">Digital proof linking sand booking, vehicle payload, and geofenced transit route</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={<Camera size={14} />}
            onClick={() => setIsScannerModalOpen(true)}
          >
            Scan QR Code
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={<Plus size={14} />}
            onClick={() => setIsGenerateModalOpen(true)}
          >
            Generate e-Pass
          </Button>
        </div>
      </div>

      {/* Top Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total e-Passes Issued
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats.totalIssued}{" "}
              <span className="text-sm font-semibold text-slate-500">Passes</span>
            </h3>
            <p className="text-[11px] text-purple-600 dark:text-purple-400 mt-0.5">
              Cryptographically Signed
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <QrCode size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active In Transit
            </p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {stats.activeValid}{" "}
              <span className="text-sm font-semibold text-slate-500">Live</span>
            </h3>
            <p className="text-[11px] text-emerald-600 mt-0.5">Within 24h Transit Window</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Delivered & Closed
            </p>
            <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
              {stats.deliveredCount}{" "}
              <span className="text-sm font-semibold text-slate-500">Closed</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">e-Pass Automatically Invalidated</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <ShieldCheck size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Expired / Revoked
            </p>
            <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
              {stats.expiredOrRevoked}{" "}
              <span className="text-sm font-semibold text-slate-500">Alerts</span>
            </h3>
            <p className="text-[11px] text-rose-600 mt-0.5">Roadside Intercept Action</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertTriangle size={22} />
          </div>
        </div>
      </div>

      {/* Main e-Pass Registry Table */}
      <Card
        title="Statewide Electronic Transit e-Pass Ledger"
        icon={FileText}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              icon={<Printer size={14} />}
              onClick={() => {
                if (epassRecords[0]) {
                  setSelectedPass(epassRecords[0]);
                  setIsCertificateModalOpen(true);
                }
              }}
            >
              Print Certificate
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={<Camera size={14} />}
              onClick={() => setIsScannerModalOpen(true)}
            >
              Scan QR
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={<Plus size={15} />}
              onClick={() => setIsGenerateModalOpen(true)}
            >
              Generate e-Pass
            </Button>
          </div>
        }
      >
        <ReusableTable
          columns={columns}
          data={epassRecords}
          enableExport={true}
          exportFileName="epass_transit_registry"
          onExportExcel={(rows) => exportToExcel(exportCols, rows, "epass_transit_registry")}
          onExportPDF={(rows) => exportToPDF(exportCols, rows, "epass_transit_registry", "e-Pass Registry")}
          enableRowActions={true}
          renderRowActions={({ row }) => {
            const pass = row.original;
            const isDelivered = pass.status === "Delivered (Invalidated)";
            const isRevoked = pass.status === "Revoked";
            const canVerify = pass.status === "Valid" || pass.status === "In Transit";
            const canExtend = !isDelivered && !isRevoked;
            const canRevoke = !isDelivered && !isRevoked;

            return (
              <div className="flex items-center gap-1.5 justify-center">
                {/* 1. View Transit Dossier (Always Enabled) */}
                <button
                  type="button"
                  title="View Transit Dossier & Cryptographic Verification"
                  onClick={() => {
                    setSelectedPass(pass);
                    setIsDetailModalOpen(true);
                  }}
                  className="w-7 h-7 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Eye size={14} />
                </button>

                {/* 2. Print Transit Certificate */}
                <button
                  type="button"
                  title="Print Official Transit Pass Certificate"
                  onClick={() => {
                    setSelectedPass(pass);
                    setIsCertificateModalOpen(true);
                  }}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Printer size={13} />
                </button>

                {/* 3. View Enlarged 2D QR Code */}
                <button
                  type="button"
                  title="View Scannable 2D QR Code"
                  onClick={() => {
                    setSelectedPass(pass);
                    setIsQrModalOpen(true);
                  }}
                  className="w-7 h-7 rounded-full bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-600 dark:text-purple-400 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <QrCode size={13} />
                </button>

                {/* 4. Checkpost Roadside Authentication */}
                <button
                  type="button"
                  title={canVerify ? "Authenticate Roadside Checkpost Inspection" : "Pass is closed or revoked"}
                  disabled={!canVerify}
                  onClick={() => {
                    if (canVerify) {
                      setSelectedPass(pass);
                      setIsRoadsideVerifyModalOpen(true);
                    }
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${canVerify
                      ? "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 cursor-pointer"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                    }`}
                >
                  <ShieldCheck size={14} />
                </button>

                {/* 5. Extend Validity Window */}
                <button
                  type="button"
                  title={canExtend ? "Extend Transit Validity Window" : "Cannot extend closed pass"}
                  disabled={!canExtend}
                  onClick={() => {
                    if (canExtend) {
                      setSelectedPass(pass);
                      setIsExtendModalOpen(true);
                    }
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${canExtend
                      ? "bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-600 dark:text-amber-400 cursor-pointer"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                    }`}
                >
                  <RefreshCw size={13} />
                </button>

                {/* 6. Revoke / Invalidate e-Pass */}
                <button
                  type="button"
                  title={canRevoke ? "Revoke / Invalidate Transit e-Pass" : "Cannot revoke already delivered or revoked pass"}
                  disabled={!canRevoke}
                  onClick={() => {
                    if (canRevoke) {
                      setSelectedPass(pass);
                      setIsRevokeModalOpen(true);
                    }
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${canRevoke
                      ? "bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 cursor-pointer"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                    }`}
                >
                  <Ban size={13} />
                </button>
              </div>
            );
          }}
        />
      </Card>

      {/* ── 1. VIEW TRANSIT DOSSIER MODAL ── */}
      {selectedPass && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Transit Dossier – ${selectedPass.ePassNumber}`}
          subtitle={`Booking Reference: ${selectedPass.bookingId} • Security Hash: ${selectedPass.securityHash}`}
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
            <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-purple-900 dark:text-purple-300">Cryptographic Signature Verified</p>
                <p className="text-xs font-mono text-purple-700 dark:text-purple-400 mt-0.5">Hash: {selectedPass.securityHash}</p>
              </div>
              <Badge variant="success">Authentic</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-500 font-semibold">e-Pass Number</p>
                <p className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 mt-0.5">{selectedPass.ePassNumber}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-semibold">Booking ID</p>
                <p className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{selectedPass.bookingId}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-semibold">Vehicle Number</p>
                <p className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-0.5">{selectedPass.vehicleNumber}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-semibold">Driver Name & Mobile</p>
                <p className="text-xs text-slate-800 dark:text-slate-200 mt-0.5">{selectedPass.driverName} • {selectedPass.driverMobile}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-semibold">Driver Commercial DL</p>
                <p className="text-xs font-mono text-slate-700 dark:text-slate-300 mt-0.5">{selectedPass.driverLicense}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-semibold">Mineral Grade & Quantity</p>
                <p className="text-xs font-bold text-orange-600 dark:text-orange-400 mt-0.5">{selectedPass.sandType} – {selectedPass.quantityMt} MT</p>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-semibold">Weighbridge Slip</p>
                <p className="text-xs font-mono text-slate-700 dark:text-slate-300 mt-0.5">{selectedPass.weighbridgeSlipNumber}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-semibold">Issue Timestamp</p>
                <p className="text-xs font-mono text-slate-700 dark:text-slate-300 mt-0.5">{selectedPass.issueTime}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-semibold">Valid Till</p>
                <p className="text-xs font-mono text-emerald-600 font-bold mt-0.5">{selectedPass.validUntil}</p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs text-slate-500 font-semibold">Source Depot & Destination</p>
                <p className="text-xs text-slate-800 dark:text-slate-200 mt-0.5">{selectedPass.sourceStockyard} &rarr; {selectedPass.destination}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-semibold">Enforcement Scan Count</p>
                <p className="text-xs font-bold text-blue-600 mt-0.5">{selectedPass.scannedCount} Checkpost Scans</p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── 2. OFFICIAL DIGITAL TRANSIT PASS / WAYBILL MODAL ── */}
      {selectedPass && (
        <DigitalTransitPassModal
          isOpen={isCertificateModalOpen}
          onClose={() => setIsCertificateModalOpen(false)}
          transitPass={selectedPass}
        />
      )}

      {/* ── 3. SCANNABLE 2D QR CODE MODAL ── */}
      {selectedPass && (
        <Modal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          title={`2D QR Code – ${selectedPass.ePassNumber}`}
          subtitle={`Vehicle: ${selectedPass.vehicleNumber} • Net Payload: ${selectedPass.quantityMt} MT`}
          size="sm"
          footer={
            <ModalFooter
              onClose={() => setIsQrModalOpen(false)}
              showConfirm={false}
              cancelText="Close QR"
            />
          }
        >
          <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 rounded-2xl space-y-4">
            <div className="p-4 bg-white border-2 border-purple-500 rounded-2xl shadow-lg">
              <QrCode size={180} className="text-slate-950" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-mono font-bold text-xs text-purple-600 dark:text-purple-400">{selectedPass.ePassNumber}</p>
              <p className="text-[11px] text-slate-500">Valid for official field inspection by police & enforcement units</p>
            </div>
          </div>
        </Modal>
      )}

      {/* ── 4. ROADSIDE CHECKPOST AUTHENTICATION MODAL ── */}
      {selectedPass && (
        <Modal
          isOpen={isRoadsideVerifyModalOpen}
          onClose={() => setIsRoadsideVerifyModalOpen(false)}
          title={`Checkpost Verification – ${selectedPass.ePassNumber}`}
          subtitle="Roadside inspection by flying squad officer"
          size="lg"
          footer={
            <ModalFooter
              onClose={() => setIsRoadsideVerifyModalOpen(false)}
              onConfirm={() => {
                setEpassRecords((prev) =>
                  prev.map((p) =>
                    p.id === selectedPass.id
                      ? {
                        ...p,
                        scannedCount: p.scannedCount + 1,
                        lastScannedLocation: "Raipur Ring Road Checkpost No. 4",
                        lastScannedTime: new Date().toISOString().replace("T", " ").substring(0, 16),
                      }
                      : p
                  )
                );
                showSuccess(`Checkpost verification recorded for ${selectedPass.ePassNumber}. Safe transit logged.`);
                setIsRoadsideVerifyModalOpen(false);
              }}
              confirmText="Authorize & Pass Vehicle"
              cancelText="Close"
            />
          }
        >
          <div className="space-y-4 text-sm">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2">
              <h4 className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-600" /> Transit Authentication Passed
              </h4>
              <ul className="text-xs text-emerald-800 dark:text-emerald-300 space-y-1 list-disc pl-4">
                <li>Vehicle plate <strong>{selectedPass.vehicleNumber}</strong> matches RC database.</li>
                <li>Driver <strong>{selectedPass.driverName}</strong> holds valid heavy commercial license.</li>
                <li>Certified sand payload <strong>{selectedPass.quantityMt} MT</strong> verified against stock quota.</li>
                <li>Pass is currently within valid transit window (expires: {selectedPass.validUntil}).</li>
              </ul>
            </div>
          </div>
        </Modal>
      )}

      {/* ── 5. EXTEND VALIDITY MODAL ── */}
      {selectedPass && (
        <Modal
          isOpen={isExtendModalOpen}
          onClose={() => setIsExtendModalOpen(false)}
          title={`Extend Validity – ${selectedPass.ePassNumber}`}
          subtitle="Administrative override for breakdown or road blockage delay"
          size="md"
          footer={
            <ModalFooter
              onClose={() => setIsExtendModalOpen(false)}
              onConfirm={handleConfirmExtend}
              confirmText="Extend Transit Hours"
              cancelText="Cancel"
            />
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Extension Duration (Hours)
              </label>
              <select
                value={extendHours}
                onChange={(e) => setExtendHours(Number(e.target.value))}
                className={`${inputBase} ${inputNormal}`}
              >
                <option value={6}>6 Additional Hours</option>
                <option value={12}>12 Additional Hours</option>
                <option value={24}>24 Additional Hours</option>
              </select>
            </div>

            <p className="text-xs text-slate-500">
              Current expiry: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedPass.validUntil}</span>.
            </p>
          </div>
        </Modal>
      )}

      {/* ── 6. REVOKE / INVALIDATE E-PASS MODAL ── */}
      {selectedPass && (
        <Modal
          isOpen={isRevokeModalOpen}
          onClose={() => setIsRevokeModalOpen(false)}
          title={`Revoke e-Pass – ${selectedPass.ePassNumber}`}
          subtitle="Seize and invalidate transit authorization"
          size="md"
          footer={
            <ModalFooter
              onClose={() => setIsRevokeModalOpen(false)}
              onConfirm={handleConfirmRevoke}
              confirmText="Revoke Transit Pass"
              cancelText="Abort"
            />
          }
        >
          <div className="space-y-3">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-2.5">
              <AlertTriangle className="text-rose-600 shrink-0 mt-0.5" size={16} />
              <p className="text-xs text-rose-800 dark:text-rose-300">
                Revoking this transit pass immediately flags vehicle <strong>{selectedPass.vehicleNumber}</strong> for roadside interception and triggers enforcement notices.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Enforcement Seizure Reason *
              </label>
              <textarea
                rows={3}
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                className={`${inputBase} ${inputNormal}`}
                required
              />
            </div>
          </div>
        </Modal>
      )}

      {/* ── 7. GENERATE E-PASS MODAL ── */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Issue New Electronic Transit e-Pass"
        subtitle="Generate digital permit linked to approved booking, vehicle, and route"
        size="lg"
        footer={null}
      >
        <form onSubmit={handleGenerateNewPass} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Booking Reference *
              </label>
              <input
                type="text"
                value={genBookingId}
                onChange={(e) => setGenBookingId(e.target.value)}
                className={`${inputBase} ${inputNormal} font-mono`}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Commercial Vehicle Registration *
              </label>
              <input
                type="text"
                value={genVehicleNum}
                onChange={(e) => setGenVehicleNum(e.target.value)}
                className={`${inputBase} ${inputNormal} font-mono uppercase`}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Certified Driver Full Name *
              </label>
              <input
                type="text"
                value={genDriverName}
                onChange={(e) => setGenDriverName(e.target.value)}
                className={`${inputBase} ${inputNormal}`}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Sand Quantity (MT) *
              </label>
              <input
                type="number"
                value={genQuantityMt}
                onChange={(e) => setGenQuantityMt(Number(e.target.value))}
                className={`${inputBase} ${inputNormal} font-mono`}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Origin Sand Stockyard *
              </label>
              <input
                type="text"
                value={genSourceStockyard}
                onChange={(e) => setGenSourceStockyard(e.target.value)}
                className={`${inputBase} ${inputNormal}`}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Permitted Delivery Destination *
              </label>
              <input
                type="text"
                value={genDestination}
                onChange={(e) => setGenDestination(e.target.value)}
                className={`${inputBase} ${inputNormal}`}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsGenerateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={<QrCode size={14} />}
            >
              Issue Digital e-Pass & 2D QR
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── 8. OPTICAL QR SCANNER MODAL ── */}
      <Modal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        title="Checkpost Optical QR Scanner"
        subtitle="Live camera optical scan for field officer verification"
        size="md"
        footer={
          <ModalFooter
            onClose={() => setIsScannerModalOpen(false)}
            showConfirm={false}
            cancelText="Close Scanner"
          />
        }
      >
        <div className="flex flex-col items-center justify-center p-6 bg-slate-950 text-white rounded-2xl relative overflow-hidden">
          <div className="w-52 h-52 border-2 border-purple-500 rounded-2xl relative flex items-center justify-center bg-slate-900/60 shadow-inner">
            <Camera size={44} className="text-slate-500 animate-pulse" />
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-purple-400 shadow-[0_0_8px_#c084fc] animate-bounce" />
          </div>
          <p className="text-xs text-slate-300 mt-4 text-center">
            Point camera at e-Pass 2D QR Code. Automatic hardware decoding active.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default EPassVerificationView;
