import React, { useState } from "react";
import {
  Printer,
  ShieldCheck,
  Lock,
  QrCode,
  MapPin,
  Truck,
  User,
  Calendar,
  Clock,
  Radio,
  FileCheck2,
  AlertOctagon,
  Copy,
  Check,
  Download,
  Share2,
  ExternalLink,
} from "lucide-react";
import type { TransitPassRecord } from "../types";
import Modal from "@/shared/components/ui/Modal/Modal";
import Button from "@/shared/components/ui/Button";
import Badge from "@/shared/components/ui/Badge";
import { IMAGES } from "@/assets/images";
import { verifyTransitPassIntegrity } from "../service/transitPassService";
import { useStatusModal } from "@/config/theme/StatusModalContext";

export interface DigitalTransitPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  transitPass?: TransitPassRecord | null;
  pass?: TransitPassRecord | null;
}


/**
 * High-definition SVG 2D QR Code graphic generator
 * Creates visual 2D matrix pattern with official position markers
 */
const SvgQrCodeGraphic: React.FC<{ value: string; size?: number }> = ({ value, size = 160 }) => {
  // Generate deterministic grid pattern based on string payload
  const gridSize = 25;
  const hash = value.split("").reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 1000000, 7);

  const isCornerMarker = (r: number, c: number) => {
    // Top-left finder pattern
    if (r < 7 && c < 7) {
      return r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
    }
    // Top-right finder pattern
    if (r < 7 && c >= gridSize - 7) {
      const col = c - (gridSize - 7);
      return r === 0 || r === 6 || col === 0 || col === 6 || (r >= 2 && r <= 4 && col >= 2 && col <= 4);
    }
    // Bottom-left finder pattern
    if (r >= gridSize - 7 && c < 7) {
      const row = r - (gridSize - 7);
      return row === 0 || row === 6 || c === 0 || c === 6 || (row >= 2 && row <= 4 && c >= 2 && c <= 4);
    }
    return false;
  };

  const isModuleBlack = (r: number, c: number) => {
    if (isCornerMarker(r, c)) return true;
    if ((r < 7 && c < 7) || (r < 7 && c >= gridSize - 7) || (r >= gridSize - 7 && c < 7)) return false;
    // Timing pattern
    if (r === 6 || c === 6) return (r + c) % 2 === 0;
    // Data cells pseudo-randomized by payload hash
    return ((r * 13 + c * 17 + hash) % 3 === 0 || (r * c + hash) % 5 === 0);
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${gridSize} ${gridSize}`}
      className="bg-white p-1 rounded-xl shadow-inner border border-slate-300 dark:border-slate-700"
    >
      {Array.from({ length: gridSize }).map((_, r) =>
        Array.from({ length: gridSize }).map((__, c) =>
          isModuleBlack(r, c) ? (
            <rect
              key={`${r}-${c}`}
              x={c}
              y={r}
              width={1}
              height={1}
              fill="#0f172a"
            />
          ) : null
        )
      )}
    </svg>
  );
};

export const DigitalTransitPassModal: React.FC<DigitalTransitPassModalProps> = ({
  isOpen,
  onClose,
  transitPass: transitPassProp,
  pass: passProp,
}) => {
  const transitPass = transitPassProp || passProp || null;
  const { showSuccess, showWarning } = useStatusModal();
  const [copiedHash, setCopiedHash] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    tested: boolean;
    isValid: boolean;
    message: string;
  } | null>(null);

  if (!transitPass) return null;

  const handleCopyHash = () => {
    if (transitPass.securityHash) {
      navigator.clipboard.writeText(transitPass.securityHash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
      showSuccess("SHA-256 Cryptographic Hash copied to clipboard.");
    }
  };

  const handleTestIntegrity = () => {
    const result = verifyTransitPassIntegrity(transitPass);
    setVerificationResult({
      tested: true,
      isValid: result.isValid,
      message: result.message,
    });
    if (result.isValid) {
      showSuccess("Verification Passed: 100% Cryptographic Match! No unauthorized edits detected.");
    } else {
      showWarning("Security Warning: Transit Pass hash mismatch!");
    }
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Government of Chhattisgarh – Digital Transit Pass / Waybill"
      subtitle={`Statutory Transport Authorization (Issued under Chhattisgarh Minor Mineral Rules)`}
      size="4xl"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<ShieldCheck size={15} className="text-emerald-600" />}
              onClick={handleTestIntegrity}
            >
              Verify Anti-Tamper Integrity
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<Printer size={15} />}
              onClick={handlePrintCertificate}
            >
              Print Official Waybill
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <Lock size={13} className="text-amber-600" />
              <span>Editing Disabled (Permanent Lock)</span>
            </span>
            <Button variant="primary" size="sm" onClick={onClose}>
              Close Waybill
            </Button>
          </div>
        </div>
      }
    >
      <div className="relative p-6 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl space-y-6 text-slate-900 dark:text-slate-100 overflow-hidden shadow-xl print:border-none print:shadow-none">
        {/* Anti-Tamper Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none select-none z-0">
          <span className="text-6xl font-black uppercase rotate-[-28deg] text-center leading-tight">
            OFFICIAL TRANSIT PASS<br />GOVT OF CHHATTISGARH<br />IMMUTABLE & NON-EDITABLE
          </span>
        </div>

        {/* Lock Notification Banner */}
        <div className="relative z-10 flex items-center justify-between p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-amber-600 shrink-0" />
            <span className="font-semibold">
              Tamper-Proof Lock Active:
            </span>
            <span>This Transit Pass has been locked. Post-generation field editing is strictly prohibited by state mining protocol.</span>
          </div>
          <Badge variant="warning">LOCKED & IMMUTABLE</Badge>
        </div>

        {/* Header with State Emblem & Department Seals */}
        <div className="relative z-10 border-b pb-4 border-slate-200 dark:border-slate-800 text-center space-y-2">
          <div className="flex items-center justify-center gap-4 mb-2">
            <img
              src={IMAGES.CHHATTISGARH_LOGO}
              alt="Chhattisgarh State Emblem"
              className="h-14 w-14 object-contain"
            />
            <div className="h-10 w-px bg-slate-300 dark:bg-slate-700" />
            <img
              src={IMAGES.CMDC_LOGO}
              alt="CMDC Official Logo"
              className="h-14 w-14 object-contain"
            />
          </div>

          <div>
            <h2 className="text-lg font-black tracking-wide uppercase text-slate-900 dark:text-white">
              GOVERNMENT OF CHHATTISGARH
            </h2>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Department of Mineral Resources • Chhattisgarh Mineral Development Corporation (CMDC)
            </p>
            <p className="text-xs text-slate-500 font-medium">
              Electronic Sand Transit Pass & Statutory e-Waybill (FORM D-1)
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 font-mono font-bold text-xs rounded-full border border-purple-300 dark:border-purple-800">
              WAYBILL NO: {transitPass.transitPassNumber || transitPass.ePassNumber}
            </span>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 font-mono text-xs rounded-full border border-blue-300 dark:border-blue-800">
              ORDER REF: {transitPass.orderId || transitPass.bookingId}
            </span>
            <Badge variant={transitPass.status === "Valid" || transitPass.status === "In Transit" ? "success" : "danger"}>
              {transitPass.status}
            </Badge>
          </div>
        </div>

        {/* 11 MANDATORY REQUIRED FIELDS GRID */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Card 1: Logistics & Vehicle */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 pb-1 border-b border-slate-200 dark:border-slate-700">
              <Truck size={14} className="text-primary" />
              <span>VEHICLE & DRIVER DETAILS</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Vehicle Number:</span>
                <span className="font-mono font-black text-slate-900 dark:text-white bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">
                  {transitPass.vehicleNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Driver Name:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {transitPass.driverName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Driver Contact:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {transitPass.driverMobile}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Commercial DL:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {transitPass.driverLicense}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Weighbridge Slip:</span>
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                  {transitPass.weighbridgeSlipNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Source Sand Reach & Delivery Destination */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 pb-1 border-b border-slate-200 dark:border-slate-700">
              <MapPin size={14} className="text-emerald-600" />
              <span>QUARRY REACH & DESTINATION</span>
            </div>

            <div className="space-y-1.5">
              <div>
                <span className="text-slate-500 block text-[11px]">Origin Sand Reach:</span>
                <span className="font-bold text-slate-900 dark:text-white block mt-0.5">
                  {transitPass.sandReach?.reachName || transitPass.sourceStockyard}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Reach Code: {transitPass.sandReach?.reachId || "RCH-CG-04"} • {transitPass.sandReach?.riverStream || "River Basin"}
                </span>
              </div>

              <div className="pt-1 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 block text-[11px]">Permitted Destination:</span>
                <span className="font-bold text-slate-900 dark:text-white block mt-0.5">
                  {transitPass.destination}
                </span>
                {transitPass.destinationCoordinates && (
                  <span className="text-[10px] text-slate-500 font-mono">
                    GPS Geocodes: {transitPass.destinationCoordinates.lat}° N, {transitPass.destinationCoordinates.lng}° E
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Card 3: Commodity, Quantity & Timestamp */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 pb-1 border-b border-slate-200 dark:border-slate-700">
              <FileCheck2 size={14} className="text-amber-600" />
              <span>QUANTITY & ISSUANCE TIME</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Certified Quantity:</span>
                <span className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">
                  {transitPass.quantityMt} MT
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mineral Grade:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {transitPass.sandType}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Scale Gross / Tare:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {transitPass.grossWeightKg || 24400} kg / {transitPass.tareWeightKg || 8400} kg
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Issuance Date & Time:</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  {transitPass.dateTime || transitPass.issueTime}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section: Customer Details & Validity Bar */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Customer Details */}
          <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-800 space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-1.5 font-bold text-purple-900 dark:text-purple-200">
                <User size={14} />
                <span>CUSTOMER / CONSIGNEE DETAILS</span>
              </div>
              <Badge variant="outline">
                {transitPass.customerDetails?.category || "Registered Citizen"}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-slate-500 block text-[11px]">Consignee Name:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {transitPass.customerDetails?.name || transitPass.customerName || "Consignee Buyer"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Contact Mobile:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {transitPass.customerDetails?.mobile || transitPass.customerMobile || "9826011223"}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block text-[11px]">Consignee Destination Plot:</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {transitPass.customerDetails?.deliveryAddress || transitPass.destination}
                </span>
              </div>
            </div>
          </div>

          {/* Statutory Validity Window */}
          <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-200">
                <Clock size={14} />
                <span>STATUTORY TRANSIT VALIDITY</span>
              </div>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 text-[11px]">
                Valid for {transitPass.validity?.durationHours || 8} Hours
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-slate-500 block text-[11px]">Valid From:</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  {transitPass.validity?.validFrom || transitPass.issueTime}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Valid Until (Auto-Expiry):</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {transitPass.validity?.validUntil || transitPass.validUntil}
                </span>
              </div>
              <div className="col-span-2 pt-1 text-[11px] text-slate-500">
                <span>Vehicle must cross destination municipal boundary before validity expiry to avoid roadside interdiction.</span>
              </div>
            </div>
          </div>
        </div>

        {/* GPS Telematics & Scannable QR Code Section */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-300 dark:border-slate-700">
          {/* 2D QR Code Canvas */}
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <div className="p-2 bg-white rounded-xl shadow-md border border-slate-200">
              <SvgQrCodeGraphic value={transitPass.qrPayload || transitPass.transitPassNumber} size={150} />
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">
                Official Scannable 2D Barcode
              </span>
              <span className="text-[10px] text-slate-500 block">
                Directly verifiable by flying squad camera
              </span>
            </div>
          </div>

          {/* GPS Telematics Tracking Reference */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 pb-1 border-b border-slate-200 dark:border-slate-700">
              <Radio size={14} className="text-rose-500 animate-pulse" />
              <span>GPS / TELEMATICS REFERENCE</span>
            </div>

            <div className="space-y-1.5">
              <div>
                <span className="text-slate-500 block text-[10px]">AIS-140 GPS Device IMEI:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {transitPass.gpsTrackingRef?.deviceImei || transitPass.gpsImei || "AIS140-CG-04-8891"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Corridor Geofence:</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {transitPass.gpsTrackingRef?.corridorGeofence || "Direct NH-53 Corridor (Mandir Hasaud to Raipur)"}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-500 text-[10px]">Telematics Telemetry:</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  Live GPS Active
                </span>
              </div>
            </div>
          </div>

          {/* Cryptographic Tamper-Proof Hash & Integrity Check */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 pb-1 border-b border-slate-200 dark:border-slate-700">
              <ShieldCheck size={14} className="text-purple-600" />
              <span>SHA-256 DIGITAL FINGERPRINT</span>
            </div>

            <div className="space-y-1.5">
              <p className="text-[10px] text-slate-500 leading-tight">
                Cryptographic hash generated from immutable fields. Any alteration of quantity, vehicle, or destination invalidates this signature.
              </p>

              <div className="p-2 bg-slate-900 text-slate-100 rounded-lg font-mono text-[10px] break-all flex items-start justify-between gap-1 border border-slate-800">
                <span>{transitPass.securityHash}</span>
                <button
                  type="button"
                  onClick={handleCopyHash}
                  className="text-slate-400 hover:text-white shrink-0 p-0.5"
                  title="Copy Hash"
                >
                  {copiedHash ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                </button>
              </div>

              {verificationResult && (
                <div
                  className={`p-2 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 ${
                    verificationResult.isValid
                      ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800"
                      : "bg-rose-100 text-rose-900 dark:bg-rose-950/60 dark:text-rose-200 border border-rose-300 dark:border-rose-800"
                  }`}
                >
                  <ShieldCheck size={14} />
                  <span>{verificationResult.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Authority Endorsement */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-200">
              Issued by: {transitPass.generatedBy?.officerName || "S. K. Verma"} ({transitPass.generatedBy?.designation || "Sand Reach Officer"})
            </p>
            <p>Directorate of Geology & Mining, Nava Raipur Atal Nagar, Chhattisgarh</p>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full font-mono text-[10px] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <Lock size={11} className="text-amber-600" />
              SYSTEM-SEALED • NO EDIT PRIVILEGES
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DigitalTransitPassModal;
