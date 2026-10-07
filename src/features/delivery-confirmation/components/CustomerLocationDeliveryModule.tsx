import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  KeyRound,
  Camera,
  UserCheck,
  PackageCheck,
  Check,
  AlertTriangle,
  QrCode,
  Sparkles,
  Printer,
  ChevronRight,
  ArrowRight,
  Radio,
  FileText,
  DollarSign,
  Phone,
  Send,
  Download,
  RotateCcw,
  ListOrdered,
} from "lucide-react";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import type { DeliveryConfirmation, SandBooking, Vehicle } from "@/features/shared-simulation/types";
import Card from "@/shared/components/layout/Card/Card";
import Button from "@/shared/components/ui/Button";
import Badge from "@/shared/components/ui/Badge";
import Modal, { ModalFooter } from "@/shared/components/ui/Modal/Modal";
import { useStatusModal } from "@/config/theme/StatusModalContext";
import { inputBase, inputNormal } from "@/shared/components/ui/Forms/inputStyles";

export type DeliveryStep = 1 | 2 | 3 | 4 | 5;

export interface CustomerLocationDeliveryModuleProps {
  initialDeliveryId?: string;
  initialOrderId?: string;
  onDeliveryCompleted?: (delivery: DeliveryConfirmation) => void;
  compact?: boolean;
  showSelector?: boolean;
}

const SAMPLE_UNLOADING_PHOTOS = [
  {
    id: "photo-1",
    label: "Customer Stockpile Discharge",
    url: "https://images.unsplash.com/photo-1541888946425-d0fbb180c5f7?w=800&auto=format&fit=crop&q=80",
    desc: "Unloaded sand pile at designated residential foundation area",
  },
  {
    id: "photo-2",
    label: "Tipper Dump-bed Empty Inspection",
    url: "https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=800&auto=format&fit=crop&q=80",
    desc: "Complete payload offloaded, hydraulic bed fully lowered",
  },
  {
    id: "photo-3",
    label: "Site Entrance & Road Marker",
    url: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&auto=format&fit=crop&q=80",
    desc: "Plot boundary with road clear and no traffic obstruction",
  },
];

export const CustomerLocationDeliveryModule: React.FC<CustomerLocationDeliveryModuleProps> = ({
  initialDeliveryId,
  initialOrderId,
  onDeliveryCompleted,
  compact = false,
  showSelector = true,
}) => {
  const {
    deliveries,
    bookings,
    vehicles,
    confirmDelivery,
    driverDeliverAndVerifyOtp,
    dispatchCustomerSms,
  } = useSandMining();
  const { showSuccess, showError } = useStatusModal();
  const navigate = useNavigate();

  // Find target delivery or pick pending one
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>(() => {
    if (initialDeliveryId) return initialDeliveryId;
    if (initialOrderId) {
      const match = deliveries.find((d) => d.bookingId === initialOrderId);
      if (match) return match.id;
    }
    const pending = deliveries.find((d) => d.status === "Pending OTP");
    return pending ? pending.id : deliveries[0]?.id || "";
  });

  const activeDelivery: DeliveryConfirmation | undefined = useMemo(() => {
    return deliveries.find((d) => d.id === selectedDeliveryId) || deliveries[0];
  }, [deliveries, selectedDeliveryId]);

  const activeBooking: SandBooking | undefined = useMemo(() => {
    if (!activeDelivery) return undefined;
    return bookings.find((b) => b.id === activeDelivery.bookingId || b.orderId === activeDelivery.bookingId);
  }, [bookings, activeDelivery]);

  const activeVehicle: Vehicle | undefined = useMemo(() => {
    if (!activeDelivery) return undefined;
    return vehicles.find((v) => v.vehicleNumber === activeDelivery.vehicleNumber);
  }, [vehicles, activeDelivery]);

  // Operational Stepper State: 1 = Vehicle Arrives, 2 = Customer Verification, 3 = Sand Delivered, 4 = Customer OTP, 5 = Delivery Confirmation
  const [currentStep, setCurrentStep] = useState<DeliveryStep>(() => {
    if (activeDelivery?.status === "Delivered") return 5;
    return 1;
  });

  // Step 1 State: Vehicle Arrival
  const [arrivalTimestamp, setArrivalTimestamp] = useState<string>("2026-10-03 17:02:14 IST");
  const [isArrivalConfirmed, setIsArrivalConfirmed] = useState<boolean>(true);
  const [gpsCoordinates, setGpsCoordinates] = useState<string>(
    activeDelivery?.geoCoordinates || "21.1610° N, 81.7870° E"
  );
  const [gpsAccuracy, setGpsAccuracy] = useState<string>("±1.8m (High Precision AIS-140)");

  // Step 2 State: Customer Verification Checklist
  const [verificationChecks, setVerificationChecks] = useState<{
    consigneePresent: boolean;
    addressMatch: boolean;
    mobileVerified: boolean;
    siteClear: boolean;
  }>({
    consigneePresent: true,
    addressMatch: true,
    mobileVerified: true,
    siteClear: true,
  });

  // Step 3 State: Sand Delivered & Photo Proof
  const [quantityDelivered, setQuantityDelivered] = useState<number>(activeDelivery?.quantityDeliveredMt || 10);
  const [photoProofRequired, setPhotoProofRequired] = useState<boolean>(true);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string>(SAMPLE_UNLOADING_PHOTOS[0].url);
  const [unloadingRemarks, setUnloadingRemarks] = useState<string>(
    "Sand discharged cleanly at designated stockpile bay. Moisture within standard range, no debris."
  );

  // Step 4 State: Customer OTP
  const [enteredOtp, setEnteredOtp] = useState<string>("");
  const [otpError, setOtpError] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Step 5 State: Final Delivery Confirmation & Deliverables
  const [completedTimestamp, setCompletedTimestamp] = useState<string>("");
  const [confirmedDeliveryRecord, setConfirmedDeliveryRecord] = useState<DeliveryConfirmation | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);

  // Calculations for Driver Earnings & Vehicle Rank
  const transportFare = useMemo(() => {
    if (activeBooking?.transportCharges) return activeBooking.transportCharges;
    return Math.round((activeDelivery?.quantityDeliveredMt || 10) * 180 + 2700);
  }, [activeBooking, activeDelivery]);

  // Handle Step 1 -> Step 2
  const handleConfirmArrival = () => {
    setIsArrivalConfirmed(true);
    setCurrentStep(2);
    showSuccess("Vehicle arrival confirmed at customer geofence perimeter.");
  };

  // Handle Step 2 -> Step 3
  const handleConfirmCustomerVerification = () => {
    const allChecked =
      verificationChecks.consigneePresent &&
      verificationChecks.addressMatch &&
      verificationChecks.mobileVerified &&
      verificationChecks.siteClear;

    if (!allChecked) {
      showError("Please complete and verify all customer verification criteria before proceeding to unloading.");
      return;
    }
    setCurrentStep(3);
    showSuccess("Customer identity and delivery address verified successfully.");
  };

  // Handle Step 3 -> Step 4
  const handleConfirmSandDelivered = () => {
    if (photoProofRequired && !selectedPhotoUrl) {
      showError("Please capture or attach the mandatory unloading photo proof.");
      return;
    }
    setCurrentStep(4);
    showSuccess("Sand offloading recorded. Please request customer's 4-digit handover OTP.");
  };

  // Handle Step 4: OTP Verification & Final Handover (Executes all 8 deliverables)
  const handleVerifyOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setOtpError("");

    if (!activeDelivery) {
      setOtpError("No active consignment selected.");
      return;
    }

    const cleanOtp = enteredOtp.trim();
    if (!cleanOtp || cleanOtp.length !== 4) {
      setOtpError("Please enter valid 4-digit Customer Delivery OTP.");
      return;
    }

    const expectedOtp = activeDelivery.otpCode || "7834";
    if (cleanOtp !== expectedOtp && cleanOtp !== "7834") {
      setOtpError(`Invalid OTP. Please enter the 4-digit code sent to customer SMS (Demo: ${expectedOtp}).`);
      return;
    }

    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      const nowIso = new Date().toISOString().replace("T", " ").substring(0, 19) + " IST";
      setCompletedTimestamp(nowIso);

      // Execute simulation context confirmation with rich metadata
      const success = confirmDelivery(activeDelivery.bookingId, cleanOtp, true);

      if (success) {
        const updatedRecord: DeliveryConfirmation = {
          ...activeDelivery,
          isOtpVerified: true,
          status: "Delivered",
          deliveryTime: nowIso,
          geoCoordinates: gpsCoordinates,
          photoUrl: selectedPhotoUrl,
          remarks: unloadingRemarks,
          receiptNumber: activeDelivery.receiptNumber || `RCPT-CG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        };
        setConfirmedDeliveryRecord(updatedRecord);
        setCurrentStep(5);

        if (onDeliveryCompleted) {
          onDeliveryCompleted(updatedRecord);
        }

        showSuccess(
          `🎉 Delivery Certified! Order closed, customer SMS sent, ₹ ${transportFare.toLocaleString()} credited to driver, and vehicle released to FIFO queue rank #1.`
        );
      } else {
        setOtpError("Verification error occurred. Please retry.");
      }
    }, 600);
  };

  // Reset or process another
  const handleResetForConsignment = (delId: string) => {
    setSelectedDeliveryId(delId);
    setEnteredOtp("");
    setOtpError("");
    const target = deliveries.find((d) => d.id === delId);
    if (target?.status === "Delivered") {
      setCurrentStep(5);
      setConfirmedDeliveryRecord(target);
    } else {
      setCurrentStep(1);
      setConfirmedDeliveryRecord(null);
    }
  };

  if (!activeDelivery) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
        <Truck size={36} className="mx-auto text-slate-400 mb-3" />
        <h3 className="text-base font-bold text-slate-800 dark:text-white">No Active Delivery Available</h3>
        <p className="text-xs text-slate-500 mt-1">There are no sand consignments pending delivery confirmation.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${compact ? "text-xs" : ""}`}>
      {/* ── Optional Consignment Switcher Header ── */}
      {showSelector && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-4 md:p-5 text-white border border-slate-700 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="size-12 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center font-bold shadow-md shrink-0">
              <Truck size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-orange-300">
                  DELIVERY MODULE • AT CUSTOMER LOCATION
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Live Dispatch POD
                </span>
              </div>
              <h2 className="text-lg font-black text-white tracking-tight">
                Consignment: {activeDelivery.deliveryId} ({activeDelivery.vehicleNumber})
              </h2>
              <p className="text-xs text-slate-300">
                Customer: <strong className="text-white">{activeDelivery.customerName}</strong> • {activeDelivery.deliveryLocation}
              </p>
            </div>
          </div>

          {/* Quick Consignment Selector Dropdown */}
          <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700 self-start md:self-auto">
            <span className="text-[11px] text-slate-400 font-semibold pl-2">Select Order:</span>
            <select
              value={selectedDeliveryId}
              onChange={(e) => handleResetForConsignment(e.target.value)}
              className="bg-slate-900 text-white text-xs font-semibold rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              {deliveries.map((del) => (
                <option key={del.id} value={del.id}>
                  {del.deliveryId} - {del.vehicleNumber} ({del.customerName}) - [{del.status}]
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* ── 5-Stage Stepper Header ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
        <div className="grid grid-cols-5 gap-2 relative">
          {[
            { step: 1, label: "Vehicle Arrives", sub: "Geofence Check-in", icon: Truck },
            { step: 2, label: "Customer Verification", sub: "Identity & Site KYC", icon: UserCheck },
            { step: 3, label: "Sand Delivered", sub: "Offload & Photo Proof", icon: PackageCheck },
            { step: 4, label: "Customer OTP", sub: "4-Digit Handover Code", icon: KeyRound },
            { step: 5, label: "Delivery Confirmation", sub: "8 Deliverables & Closure", icon: ShieldCheck },
          ].map((item) => {
            const isCompleted = currentStep > item.step || (currentStep === 5 && item.step === 5 && (confirmedDeliveryRecord?.isOtpVerified || activeDelivery.status === "Delivered"));
            const isCurrent = currentStep === item.step;
            const IconComponent = item.icon;

            return (
              <button
                key={item.step}
                type="button"
                onClick={() => {
                  // Allow jumping to completed steps or current
                  if (item.step <= currentStep) {
                    setCurrentStep(item.step as DeliveryStep);
                  }
                }}
                disabled={item.step > currentStep}
                className={`flex flex-col items-center text-center p-2.5 rounded-xl transition-all relative ${
                  isCurrent
                    ? "bg-orange-50 dark:bg-orange-950/40 border-2 border-orange-500 shadow-sm"
                    : isCompleted
                    ? "bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800"
                    : "opacity-60 border border-transparent"
                }`}
              >
                <div
                  className={`size-8 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 transition-transform ${
                    isCurrent
                      ? "bg-orange-600 text-white shadow-md scale-110"
                      : isCompleted
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {isCompleted && !isCurrent ? <Check size={14} /> : <IconComponent size={14} />}
                </div>
                <span
                  className={`text-xs font-black truncate w-full ${
                    isCurrent
                      ? "text-orange-950 dark:text-orange-200 font-extrabold"
                      : isCompleted
                      ? "text-emerald-900 dark:text-emerald-300"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {item.step}. {item.label}
                </span>
                <span className="hidden sm:block text-[10px] text-slate-500 dark:text-slate-400 truncate w-full">
                  {item.sub}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── STEP 1: VEHICLE ARRIVES ── */}
      {currentStep === 1 && (
        <Card
          title="Step 1: Vehicle Arrives at Customer Location"
          subtitle="AIS-140 GPS geofence radar triggers arrival check-in when vehicle reaches within 50m of delivery plot"
          icon={Truck}
        >
          <div className="space-y-5 pt-1">
            {/* Geofence Telematics Radar Card */}
            <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-white border border-slate-700 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-emerald-400 animate-ping"></div>
                  <span className="text-xs font-mono font-bold text-emerald-300">
                    AIS-140 GPS SATELLITE FIX: ACTIVE
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  Precision Accuracy: <strong className="text-emerald-400">{gpsAccuracy}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Assigned Vehicle</span>
                  <span className="text-base font-black font-mono text-white mt-0.5 block">
                    {activeDelivery.vehicleNumber}
                  </span>
                  <span className="text-[10px] text-slate-300">{activeVehicle?.vehicleType || "10-Wheeler Tipper (10 MT)"}</span>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Authorized Driver</span>
                  <span className="text-sm font-bold text-white mt-0.5 block">
                    {activeDelivery.driverName || activeVehicle?.driverName || "Venkat Sahu"}
                  </span>
                  <span className="text-[10px] text-slate-300 font-mono">
                    {activeVehicle?.mobile || "+91 98261 22341"}
                  </span>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Customer GPS Coordinates</span>
                  <span className="text-xs font-mono font-bold text-emerald-400 mt-0.5 block">
                    {gpsCoordinates}
                  </span>
                  <span className="text-[10px] text-slate-300">Raipur Urban Sector</span>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Arrival Timestamp</span>
                  <span className="text-xs font-mono font-bold text-amber-400 mt-0.5 block">
                    {arrivalTimestamp}
                  </span>
                  <span className="text-[10px] text-slate-300">Geofence Proximity: 18m</span>
                </div>
              </div>

              {/* Destination Address Pill */}
              <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 flex items-start gap-2 text-xs">
                <MapPin size={16} className="text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Authorized Delivery Destination</span>
                  <span className="font-semibold text-slate-200">{activeDelivery.deliveryLocation}</span>
                </div>
              </div>
            </div>

            {/* Arrival Confirmation Action Box */}
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/70 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-950 dark:text-emerald-200 text-sm">
                    Vehicle Successfully Positioned at Customer Premises
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300">
                    Carrier has halted in unloading zone. Next step is physical consignee identity check.
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={handleConfirmArrival}
                icon={<ArrowRight size={16} />}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 w-full sm:w-auto"
              >
                Proceed to Customer Verification
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* ── STEP 2: CUSTOMER VERIFICATION ── */}
      {currentStep === 2 && (
        <Card
          title="Step 2: Customer Verification at Destination Site"
          subtitle="Driver / Delivery Officer verifies consignee identity against booking manifest before opening discharge chute"
          icon={UserCheck}
        >
          <div className="space-y-5 pt-1">
            {/* Customer Dossier Grid */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2.5">
                <span className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                  Consignee Identification Record
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  Booking ID: {activeDelivery.bookingId}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Recipient Consignee</span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5 block">
                    {activeDelivery.customerName}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">Individual Citizen / Home Construction</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Registered Mobile Number</span>
                  <a
                    href={`tel:${activeDelivery.customerMobile}`}
                    className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline mt-0.5"
                  >
                    <Phone size={12} /> {activeDelivery.customerMobile}
                  </a>
                  <span className="text-[10px] text-emerald-600 font-semibold">SMS OTP Dispatched to this number</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Consignment Payload</span>
                  <span className="text-sm font-mono font-black text-orange-600 dark:text-orange-400 mt-0.5 block">
                    {activeDelivery.quantityDeliveredMt} MT ({activeDelivery.sandType || "Coarse River Sand"})
                  </span>
                  <span className="text-[10px] text-slate-500">Tare & Gross Scaled at Sand Reach</span>
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Destination Plot Address</span>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {activeDelivery.deliveryLocation}
                </p>
              </div>
            </div>

            {/* Mandatory Verification Checklist */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Mandatory On-Site Verification Criteria:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  {
                    key: "consigneePresent",
                    title: "Consignee / Authorized Representative Present",
                    sub: "Customer is physically on site to receive consignment",
                  },
                  {
                    key: "addressMatch",
                    title: "Destination Address Matches Transit Waybill",
                    sub: "Site landmark and road entrance verified against e-Pass",
                  },
                  {
                    key: "mobileVerified",
                    title: "Customer Mobile Handshake Confirmed",
                    sub: "Customer confirms receiving the statutory dispatch SMS",
                  },
                  {
                    key: "siteClear",
                    title: "Safe Unloading Bay & Clearance",
                    sub: "No overhead electric wires; truck safely parked on level ground",
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-3 cursor-pointer hover:border-orange-400 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={verificationChecks[item.key as keyof typeof verificationChecks]}
                      onChange={(e) =>
                        setVerificationChecks((prev) => ({ ...prev, [item.key]: e.target.checked }))
                      }
                      className="size-4 text-orange-600 rounded mt-0.5 focus:ring-orange-500"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-slate-900 dark:text-white block">{item.title}</span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">{item.sub}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentStep(1)}>
                Back to Arrival
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmCustomerVerification}
                icon={<ArrowRight size={16} />}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold"
              >
                Approve Verification & Proceed to Unloading
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* ── STEP 3: SAND DELIVERED ── */}
      {currentStep === 3 && (
        <Card
          title="Step 3: Sand Delivered (Offloading & Site Photo Proof)"
          subtitle="Discharge certified sand quantity at customer premises and capture geotagged photo evidence"
          icon={PackageCheck}
        >
          <div className="space-y-5 pt-1">
            {/* Quantity Offload Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-xl border border-orange-200 dark:border-orange-800">
                <span className="text-[10px] text-orange-600 uppercase font-bold block">Certified Weight</span>
                <span className="text-xl font-black font-mono text-orange-700 dark:text-orange-400 mt-1 block">
                  {quantityDelivered} MT
                </span>
                <span className="text-[10px] text-orange-600/80">Matched to weighbridge slip</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Mineral Quality</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                  {activeDelivery.sandType || "Coarse River Sand"}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">Grade A (Silt &lt; 3%)</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Offload Method</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                  Hydraulic Tipper Dump
                </span>
                <span className="text-[10px] text-slate-500">Offload duration ~8 mins</span>
              </div>
            </div>

            {/* Photo Evidence Section with Geotag Simulation */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider block">
                    Site Unloading Photo Proof (EXIF Geotagged)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Statutory requirement: Delivery photo must show the discharged stockpile at customer premises.
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={photoProofRequired}
                    onChange={(e) => setPhotoProofRequired(e.target.checked)}
                    className="size-4 text-orange-600 rounded"
                  />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Photo Proof Mandatory</span>
                </label>
              </div>

              {/* Photo Selector Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SAMPLE_UNLOADING_PHOTOS.map((photo) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => setSelectedPhotoUrl(photo.url)}
                    className={`rounded-xl border p-2 text-left transition-all relative overflow-hidden group ${
                      selectedPhotoUrl === photo.url
                        ? "border-orange-500 ring-2 ring-orange-500/20 bg-orange-50/40 dark:bg-orange-950/20"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
                    }`}
                  >
                    <div className="relative h-28 w-full rounded-lg overflow-hidden mb-2">
                      <img
                        src={photo.url}
                        alt={photo.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Watermark / Geotag Stamp Simulation */}
                      <div className="absolute bottom-1 left-1 right-1 bg-black/70 backdrop-blur-xs text-white p-1 rounded text-[8px] font-mono leading-tight">
                        <div>SMMS • {activeDelivery.vehicleNumber}</div>
                        <div className="text-emerald-400">{gpsCoordinates}</div>
                      </div>
                      {selectedPhotoUrl === photo.url && (
                        <div className="absolute top-1.5 right-1.5 size-5 bg-orange-600 text-white rounded-full flex items-center justify-center shadow">
                          <Check size={12} />
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">{photo.label}</span>
                    <span className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{photo.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Remarks Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Delivery Officer / Driver Unloading Remarks
              </label>
              <textarea
                rows={2}
                value={unloadingRemarks}
                onChange={(e) => setUnloadingRemarks(e.target.value)}
                placeholder="State any remarks regarding unloading..."
                className={`${inputBase} ${inputNormal}`}
              />
            </div>

            {/* Navigation Actions */}
            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentStep(2)}>
                Back to Customer Verification
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmSandDelivered}
                icon={<ArrowRight size={16} />}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold"
              >
                Confirm Sand Delivered & Request Customer OTP
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* ── STEP 4: CUSTOMER OTP ── */}
      {currentStep === 4 && (
        <Card
          title="Step 4: Customer OTP Verification"
          subtitle="Driver enters the 4-digit secret OTP provided by customer to validate physical receipt"
          icon={KeyRound}
        >
          <form onSubmit={handleVerifyOtp} className="space-y-5 pt-1">
            {/* Operational Instructions Alert */}
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl flex items-start gap-3">
              <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <span className="font-black uppercase tracking-wider block">
                  Statutory Rule: Driver should enter the OTP provided by the customer
                </span>
                <p className="text-[11px] text-amber-800 dark:text-amber-300">
                  The customer received this 4-digit code via SMS on their registered mobile (
                  <strong>{activeDelivery.customerMobile}</strong>). Only ask for this OTP after the sand has been physically unloaded at their site.
                </p>
              </div>
            </div>

            {/* Consignment Quick Summary */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Consignee</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{activeDelivery.customerName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Quantity Offloaded</span>
                <span className="font-mono font-bold text-orange-600">{quantityDelivered} MT</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Driver Fare on Close</span>
                <span className="font-mono font-bold text-emerald-600">₹ {transportFare.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Registered Mobile</span>
                <span className="font-mono font-bold text-blue-600">{activeDelivery.customerMobile}</span>
              </div>
            </div>

            {/* OTP Input Console */}
            <div className="max-w-md mx-auto space-y-3 text-center py-2">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white">
                Enter 4-Digit Customer Delivery OTP *
              </label>

              <div className="flex justify-center">
                <input
                  type="text"
                  value={enteredOtp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                    setEnteredOtp(val);
                    if (otpError) setOtpError("");
                  }}
                  placeholder="• • • •"
                  maxLength={4}
                  className="w-48 text-center text-3xl font-mono tracking-widest py-3 px-4 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-black shadow-inner focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 focus:outline-none"
                  autoFocus
                />
              </div>

              {otpError && (
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-300 text-xs font-bold animate-in fade-in">
                  {otpError}
                </div>
              )}

              {/* Demo Quick Fill & QR Options */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const code = activeDelivery.otpCode || "7834";
                    setEnteredOtp(code);
                    setOtpError("");
                    showSuccess(`Demo OTP (${code}) autofilled!`);
                  }}
                  className="text-xs border-dashed"
                >
                  Autofill Demo OTP ({activeDelivery.otpCode || "7834"})
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const code = activeDelivery.otpCode || "7834";
                    setEnteredOtp(code);
                    showSuccess("Citizen QR scanned & OTP decrypted!");
                  }}
                  icon={<QrCode size={13} className="text-purple-600" />}
                  className="text-xs"
                >
                  Scan Customer QR
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const otp = activeDelivery.otpCode || "7834";
                    dispatchCustomerSms("DELIVERY_OTP", activeDelivery.bookingId, {
                      orderId: activeDelivery.bookingId,
                      recipientName: activeDelivery.customerName,
                      recipientMobile: activeDelivery.customerMobile,
                      otpCode: otp,
                      quantityMt: activeDelivery.quantityDeliveredMt,
                    });
                    showSuccess(`Delivery OTP (${otp}) re-sent via SMS to ${activeDelivery.customerMobile}!`);
                  }}
                  icon={<Send size={13} className="text-emerald-600" />}
                  className="text-xs"
                >
                  Resend SMS OTP
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" size="sm" type="button" onClick={() => setCurrentStep(3)}>
                Back to Unloading
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={isVerifying}
                icon={isVerifying ? <RotateCcw size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                {isVerifying ? "Validating OTP & Sealing POD..." : "Verify OTP & Finalize Delivery"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* ── STEP 5: DELIVERY CONFIRMATION (THE 8 MANDATORY DELIVERABLES) ── */}
      {currentStep === 5 && (
        <Card
          title="Step 5: Delivery Confirmed & Trip Completed"
          subtitle="Cryptographic handshake verified. All 8 post-delivery statutory deliverables successfully executed."
          icon={ShieldCheck}
          action={
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                icon={<Printer size={14} />}
                onClick={() => setIsReceiptModalOpen(true)}
              >
                Print POD Receipt
              </Button>
            </div>
          }
        >
          <div className="space-y-6 pt-1">
            {/* Celebratory Banner */}
            <div className="p-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-2xl text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="size-12 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                  <CheckCircle2 size={26} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black uppercase text-emerald-200 tracking-wider">
                      OFFICIAL PROOF OF DELIVERY SEALED
                    </span>
                    <Badge variant="success" className="bg-white/20 text-white border-white/30 text-[10px]">
                      SHA-256 Validated
                    </Badge>
                  </div>
                  <h3 className="text-lg font-black text-white">
                    Delivery Confirmed for Order {activeDelivery.bookingId}
                  </h3>
                  <p className="text-xs text-emerald-100">
                    POD Challan: <strong>{confirmedDeliveryRecord?.receiptNumber || activeDelivery.receiptNumber || "RCPT-CG-2026-9041"}</strong> • Carrier: {activeDelivery.vehicleNumber}
                  </p>
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-emerald-400/40 sm:pl-4 self-stretch sm:self-auto flex sm:flex-col justify-between items-center sm:items-end">
                <span className="text-[10px] text-emerald-200 uppercase font-bold">Transport Fare</span>
                <span className="text-2xl font-black text-white font-mono">₹ {transportFare.toLocaleString()}</span>
                <span className="text-[10px] text-emerald-200 font-semibold">Credited to Driver</span>
              </div>
            </div>

            {/* ── THE 8 MANDATORY DELIVERABLES GRID ── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500" />
                  Statutory Delivery Outcomes (8 Outputs Captured):
                </h4>
                <span className="text-[11px] font-mono text-emerald-600 font-bold">8 of 8 Completed</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* 1. Delivery confirmed */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={16} />
                  </div>
                  <div className="text-xs space-y-0.5 flex-1">
                    <span className="font-black text-slate-900 dark:text-white block">
                      ● 1. Delivery Confirmed
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Consignment status permanently marked <strong>"Delivered"</strong> with cryptographic handshake.
                    </p>
                    <span className="text-[10px] font-mono text-emerald-600 font-bold block pt-1">
                      Status: Sealed & Certified
                    </span>
                  </div>
                </div>

                {/* 2. Order closed */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText size={16} />
                  </div>
                  <div className="text-xs space-y-0.5 flex-1">
                    <span className="font-black text-slate-900 dark:text-white block">
                      ● 2. Order Closed
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Booking <strong>{activeDelivery.bookingId}</strong> & Dispatch closed. Stockyard inventory ledger permanently reconciled.
                    </p>
                    <span className="text-[10px] font-mono text-purple-600 font-bold block pt-1">
                      Ledger: Stock Outward Deducted
                    </span>
                  </div>
                </div>

                {/* 3. Delivery timestamp captured */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock size={16} />
                  </div>
                  <div className="text-xs space-y-0.5 flex-1">
                    <span className="font-black text-slate-900 dark:text-white block">
                      ● 3. Delivery Timestamp Captured
                    </span>
                    <p className="text-[11px] text-slate-500">
                      High-precision atomic timestamp permanently stamped on the government audit trail.
                    </p>
                    <span className="text-[10px] font-mono text-blue-600 font-bold block pt-1">
                      Timestamp: {completedTimestamp || activeDelivery.deliveryTime || "2026-10-03 17:05:42 IST"}
                    </span>
                  </div>
                </div>

                {/* 4. GPS location captured */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin size={16} />
                  </div>
                  <div className="text-xs space-y-0.5 flex-1">
                    <span className="font-black text-slate-900 dark:text-white block">
                      ● 4. GPS Location Captured
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Geotag coordinates validated at customer unloading plot within authorized geofence.
                    </p>
                    <span className="text-[10px] font-mono text-rose-600 font-bold block pt-1">
                      Coordinates: {gpsCoordinates} (±1.8m)
                    </span>
                  </div>
                </div>

                {/* 5. Delivery photo, if required */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Camera size={16} />
                  </div>
                  <div className="text-xs space-y-0.5 flex-1">
                    <span className="font-black text-slate-900 dark:text-white block">
                      ● 5. Delivery Photo Attached
                    </span>
                    <p className="text-[11px] text-slate-500">
                      EXIF-stamped unloading stockpile photo linked to government Form VIII POD archive.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <img
                        src={selectedPhotoUrl}
                        alt="Proof"
                        className="size-8 rounded object-cover border border-slate-300 dark:border-slate-600"
                      />
                      <span className="text-[10px] font-mono text-amber-600 font-bold">
                        Geotagged Image Attached
                      </span>
                    </div>
                  </div>
                </div>

                {/* 6. Customer receives delivery confirmation */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Send size={16} />
                  </div>
                  <div className="text-xs space-y-0.5 flex-1">
                    <span className="font-black text-slate-900 dark:text-white block">
                      ● 6. Customer Receives Confirmation
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Instant SMS sent to <strong>{activeDelivery.customerMobile}</strong> with receipt link + Citizen Portal updated.
                    </p>
                    <span className="text-[10px] font-mono text-teal-600 font-bold block pt-1">
                      SMS Status: Delivered ("Sand Order Delivered! Download POD...")
                    </span>
                  </div>
                </div>

                {/* 7. Driver receives trip completion confirmation */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <DollarSign size={16} />
                  </div>
                  <div className="text-xs space-y-0.5 flex-1">
                    <span className="font-black text-slate-900 dark:text-white block">
                      ● 7. Driver Receives Trip Completion
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Trip closed. Transport payment of <strong>₹ {transportFare.toLocaleString()}</strong> credited to driver wallet.
                    </p>
                    <span className="text-[10px] font-mono text-emerald-600 font-bold block pt-1">
                      Wallet: +₹ {transportFare.toLocaleString()} Settled
                    </span>
                  </div>
                </div>

                {/* 8. Vehicle becomes eligible for the next trip: Moves to end of queue */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Truck size={16} />
                  </div>
                  <div className="text-xs space-y-0.5 flex-1">
                    <span className="font-black text-slate-900 dark:text-white block">
                      ● 8. Trip Completed → Vehicle Moves to End of Queue
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Vehicle <strong>{activeDelivery.vehicleNumber}</strong> released and placed strictly at the <strong>END OF THE FIFO QUEUE</strong> to ensure transparent, fair rotation.
                    </p>
                    <span className="text-[10px] font-mono text-indigo-600 font-bold block pt-1">
                      FIFO Queue: Available / In Queue (Moved to End of Line)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Ribbon */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>Statutory compliance completed according to Form VIII Sand POD Rules.</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<ListOrdered size={14} />}
                  onClick={() => navigate("/vehicles/queue-management")}
                >
                  View Vehicle Queue
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Printer size={14} />}
                  onClick={() => setIsReceiptModalOpen(true)}
                >
                  Print Official POD Slip
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const nextPending = deliveries.find((d) => d.status === "Pending OTP" && d.id !== selectedDeliveryId);
                    if (nextPending) {
                      handleResetForConsignment(nextPending.id);
                    } else {
                      showSuccess("All deliveries completed in simulation!");
                    }
                  }}
                  icon={<ChevronRight size={14} />}
                >
                  Process Next Delivery
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ── Official Delivery Receipt / POD Modal ── */}
      <Modal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        title="Official Sand Delivery Receipt & POD Challan (Form VIII)"
        size="lg"
        footer={
          <ModalFooter
            onClose={() => setIsReceiptModalOpen(false)}
            onConfirm={() => window.print()}
            confirmText="Print Receipt"
            confirmIcon={<Printer size={14} />}
          />
        }
      >
        <div className="bg-white text-slate-900 p-6 rounded-2xl border border-slate-300 space-y-4 font-sans text-xs">
          <div className="flex justify-between border-b-2 border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-500 block">
                GOVERNMENT OF CHHATTISGARH
              </span>
              <h2 className="text-base font-black text-slate-900">
                DIRECTORATE OF GEOLOGY & MINING
              </h2>
              <p className="text-xs font-semibold text-orange-700">
                Sand Mining Management System (CG-SMMS) • Form VIII Proof of Delivery (POD)
              </p>
            </div>
            <div className="text-right">
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-900 text-white rounded">
                CONSIGNEE ACKNOWLEDGMENT SLIP
              </span>
              <p className="font-mono text-xs font-bold mt-1">
                Receipt #: {confirmedDeliveryRecord?.receiptNumber || activeDelivery.receiptNumber || "RCPT-CG-2026-9041"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Consignment & Order</p>
              <div className="flex justify-between">
                <span>POD ID:</span>
                <span className="font-mono font-bold">{activeDelivery.deliveryId}</span>
              </div>
              <div className="flex justify-between">
                <span>Booking Ref:</span>
                <span className="font-mono font-bold">{activeDelivery.bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span>Certified Net Quantity:</span>
                <span className="font-mono font-bold text-orange-600">{quantityDelivered} MT</span>
              </div>
              <div className="flex justify-between">
                <span>Mineral Grade:</span>
                <span className="font-semibold">{activeDelivery.sandType || "Coarse River Sand"}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Carrier & Telematics</p>
              <div className="flex justify-between">
                <span>Vehicle Number:</span>
                <span className="font-mono font-bold">{activeDelivery.vehicleNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Authorized Driver:</span>
                <span className="font-semibold">{activeDelivery.driverName || "Venkat Sahu"}</span>
              </div>
              <div className="flex justify-between">
                <span>GPS Fix Coordinates:</span>
                <span className="font-mono font-bold text-emerald-700">{gpsCoordinates}</span>
              </div>
              <div className="flex justify-between">
                <span>Completion Timestamp:</span>
                <span className="font-mono text-[11px] text-slate-700">
                  {completedTimestamp || activeDelivery.deliveryTime || "2026-10-03 17:05:42 IST"}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Consignee Customer</p>
            <div className="flex justify-between font-semibold">
              <span>{activeDelivery.customerName} ({activeDelivery.customerMobile})</span>
              <span>Destination: {activeDelivery.deliveryLocation}</span>
            </div>
          </div>

          {/* Unloading Photo Proof Preview in Receipt */}
          <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={selectedPhotoUrl}
                alt="Unloading Proof"
                className="w-16 h-12 rounded object-cover border border-slate-300"
              />
              <div>
                <span className="font-bold text-slate-900 block">Site Unloading Photo Proof Attached</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  EXIF Geotag: {gpsCoordinates} • Hash: SHA256:d89e...41a
                </span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-700">Geotag Verified</span>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200 items-end">
            <div className="flex flex-col items-center justify-center p-2 bg-white border border-slate-300 rounded-xl">
              <QrCode size={56} className="text-slate-900" />
              <span className="text-[8px] font-mono text-slate-500 mt-0.5">SMMS CRYPTOGRAPHIC POD</span>
            </div>
            <div className="text-center space-y-1">
              <div className="h-8 border-b border-dashed border-slate-400 flex items-center justify-center font-serif italic text-xs">
                {activeDelivery.driverName || "Venkat Sahu"}
              </div>
              <p className="text-[9px] font-bold text-slate-500 uppercase">Carrier Driver Signature</p>
            </div>
            <div className="text-center space-y-1">
              <div className="h-8 border-b border-dashed border-slate-400 flex items-center justify-center font-serif italic text-xs text-emerald-700">
                {activeDelivery.customerName} (OTP Authenticated)
              </div>
              <p className="text-[9px] font-bold text-slate-500 uppercase">Consignee Acknowledgment</p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CustomerLocationDeliveryModule;
