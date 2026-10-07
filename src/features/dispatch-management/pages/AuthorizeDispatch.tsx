import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send, ArrowLeft, ShieldCheck, Lock, QrCode } from "lucide-react";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import Card from "@/shared/components/layout/Card/Card";
import Button from "@/shared/components/ui/Button";
import { useStatusModal } from "@/config/theme/StatusModalContext";
import { routes } from "@/app/routes/routeConfig";
import { inputBase, inputNormal } from "@/shared/components/ui/Forms/inputStyles";
import { useAppDispatch } from "@/app/store/hooks";
import { addDispatch, generateTransitPass } from "../slice/dispatchSlice";
import type { DispatchItem, TransitPassRecord } from "../types";
import { createDigitalTransitPass } from "../service/transitPassService";
import { DigitalTransitPassModal } from "../components/DigitalTransitPassModal";

export const AuthorizeDispatch: React.FC = () => {
  const { bookings, vehicles, drivers, reaches, assignVehicleAndDispatch } = useSandMining();
  const { showSuccess, showError } = useStatusModal();
  const navigate = useNavigate();
  const reduxDispatch = useAppDispatch();

  // Paid bookings awaiting dispatch
  const paidBookings = bookings.filter((b) => b.paymentStatus === "Paid" && b.bookingStatus !== "Delivered" && b.bookingStatus !== "Order Closed");
  const defaultBooking = paidBookings[0] || bookings[0];

  const [selectedBookingId, setSelectedBookingId] = useState(defaultBooking?.id || "");
  const [vehicleNumber, setVehicleNumber] = useState(vehicles[0]?.vehicleNumber || "CG-04-TX-2341");
  const [driverName, setDriverName] = useState(drivers[0]?.name || "Dharmendra Sahu");
  const [selectedReachId, setSelectedReachId] = useState(reaches[0]?.reachId || "RCH-CG-04");

  // Checklist states
  const [chkPaymentVerified, setChkPaymentVerified] = useState(true);
  const [chkWeightVerified, setChkWeightVerified] = useState(true);
  const [chkGpsOperational, setChkGpsOperational] = useState(true);

  // Generated Transit Pass modal state
  const [generatedPass, setGeneratedPass] = useState<TransitPassRecord | null>(null);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  const currentBooking = bookings.find((b) => b.id === selectedBookingId) || defaultBooking;
  const currentReach = reaches.find((r) => r.reachId === selectedReachId) || reaches[0] || {
    reachId: "RCH-CG-04",
    reachName: "Mahanadi Riverbed Reach-04",
    riverStream: "Mahanadi River",
    district: "Raipur",
  };

  const handleAuthorize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chkPaymentVerified || !chkWeightVerified || !chkGpsOperational) {
      showError("All 3 pre-dispatch security checks must be satisfied.");
      return;
    }

    if (!selectedBookingId) {
      showError("Please select an approved booking.");
      return;
    }

    const assignedDriver = drivers.find((d) => d.name === driverName);
    const orderId = currentBooking?.orderId || "BKG-CG-2026-0941";
    const weighbridgeSlip = `WB-SLIP-2026-${Math.floor(Math.random() * 9000) + 1000}`;
    const destination = currentBooking?.destinationAddress || "Raipur District Area";
    const quantity = currentBooking?.quantityMt || 16.0;

    // Create the immutable, tamper-proof Digital Transit Pass / Waybill
    const newTransitPass = createDigitalTransitPass({
      orderId,
      vehicleNumber,
      driverName,
      driverMobile: assignedDriver?.mobile || "9826190012",
      driverLicense: assignedDriver?.licenseNumber || "CG-04-DL-2020-001",
      sandReach: {
        reachId: currentReach.reachId,
        reachName: currentReach.reachName,
        riverStream: currentReach.riverStream,
        district: currentReach.district,
      },
      sourceStockyard: currentBooking?.sourceStockyardName || currentReach.reachName,
      destination,
      destinationCoordinates: { lat: 21.1612, lng: 81.7891 },
      quantityMt: quantity,
      sandType: currentBooking?.sandType || "Coarse River Sand",
      customerDetails: {
        name: currentBooking?.customerName || "Consignee Buyer",
        mobile: currentBooking?.customerMobile || "9826011223",
        category: (currentBooking?.customerType as string) || "Individual Citizen",
        deliveryAddress: destination,
      },
      validityHours: 8,
      weighbridgeSlipNumber: weighbridgeSlip,
      tareWeightKg: 8400,
      grossWeightKg: Math.round(8400 + quantity * 1000),
      gpsTrackingRef: {
        deviceImei: `AIS140-CG-${vehicleNumber.replace(/[^A-Z0-9]/g, "").slice(-6)}`,
        corridorGeofence: `Mandir Hasaud / ${currentReach.reachName} to ${destination}`,
      },
      officerName: "S. K. Verma",
      officerId: "SRO-RAIPUR-004",
      designation: "Sand Reach Officer (SRO)",
      remarks: "Authorized gate-out dispatch with verified e-Pass and live telematics.",
    });

    const newDispatchItem: DispatchItem = {
      id: `DISP-${Date.now()}`,
      dispatchId: `DISP-CG-2026-${Math.floor(Math.random() * 9000) + 1000}`,
      bookingId: orderId,
      orderId: orderId,
      customerName: currentBooking?.customerName || "Consignee",
      customerMobile: currentBooking?.customerMobile || "9826011223",
      customerCategory: (currentBooking?.customerType as string) || "Citizen",
      vehicleNumber: vehicleNumber,
      driverName: driverName,
      driverMobile: assignedDriver?.mobile || "9826190012",
      driverLicense: assignedDriver?.licenseNumber || "CG-04-DL-2020-001",
      sandReachId: currentReach.reachId,
      sandReachName: currentReach.reachName,
      stockyardId: currentBooking?.sourceStockyardId || "STK-CG-001",
      stockyardName: currentBooking?.sourceStockyardName || "Mandir Hasaud Central Stockyard",
      sandType: currentBooking?.sandType || "Coarse River Sand",
      quantityMt: quantity,
      weighbridgeSlipNumber: weighbridgeSlip,
      loadingTime: new Date().toISOString().replace("T", " ").substring(0, 16),
      dispatchTime: new Date().toISOString().replace("T", " ").substring(0, 16),
      destination,
      ePassNumber: newTransitPass.transitPassNumber,
      transitPassNumber: newTransitPass.transitPassNumber,
      validUntil: newTransitPass.validUntil,
      gpsStatus: "Signal Healthy",
      gpsImei: newTransitPass.gpsImei,
      dispatchStatus: "Dispatched (In Transit)",
      isPaymentVerified: true,
      paymentRef: `PAY-TXN-${Date.now().toString().slice(-6)}`,
      isStockVerified: true,
      isVehicleVerified: true,
      isLocked: true, // Permanent lock prevents unauthorized editing after generation
      securityHash: newTransitPass.securityHash,
      remarks: "Authorized gate-out dispatch with verified Transit Pass and live telematics.",
    };

    reduxDispatch(addDispatch(newDispatchItem));
    reduxDispatch(generateTransitPass(newTransitPass));

    if (assignVehicleAndDispatch) {
      assignVehicleAndDispatch(selectedBookingId, vehicleNumber, driverName);
    }

    setGeneratedPass(newTransitPass);
    setIsPassModalOpen(true);
    showSuccess(
      `Digital Transit Pass ${newTransitPass.transitPassNumber} successfully generated & sealed with SHA-256 hash! Editing is permanently locked.`
    );
  };


  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="outline"
          icon={<ArrowLeft size={15} />}
          onClick={() => navigate(routes.dispatchManagement.path)}
        >
          Back to Dispatches
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Gate-Out Loading & Dispatch Authorization</h1>
          <p className="text-xs text-gray-500">Release digital e-Pass, verify weighbridge slip, and activate GPS telematics</p>
        </div>
      </div>

      <form onSubmit={handleAuthorize}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 space-y-4">
            <Card
              title="Trip Assignment & Vehicle Pairing"
              subtitle="Pair paid booking order with verified transport vehicle & authorized driver"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Select Paid Booking *
                  </label>
                  <select
                    value={selectedBookingId}
                    onChange={(e) => setSelectedBookingId(e.target.value)}
                    className={`${inputBase} ${inputNormal}`}
                  >
                    {bookings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.orderId} - {b.customerName} ({b.quantityMt} MT) [{b.paymentStatus}]
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Assign Transport Tipper *
                  </label>
                  <select
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className={`${inputBase} ${inputNormal} font-mono`}
                  >
                    {vehicles.filter((v) => !v.isBlacklisted).map((v) => (
                      <option key={v.id} value={v.vehicleNumber}>
                        {v.vehicleNumber} ({v.vehicleType})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Assign Certified Driver *
                  </label>
                  <select
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className={`${inputBase} ${inputNormal}`}
                  >
                    {drivers.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name} ({d.mobile})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Assigned Stockyard Gate
                  </label>
                  <input
                    type="text"
                    value={currentBooking?.sourceStockyardName || "Rajahmundry Central Stockyard"}
                    readOnly
                    className={`${inputBase} ${inputNormal} bg-gray-100 dark:bg-gray-800`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Origin Sand Reach / Quarry *
                  </label>
                  <select
                    value={selectedReachId}
                    onChange={(e) => setSelectedReachId(e.target.value)}
                    className={`${inputBase} ${inputNormal}`}
                  >
                    {reaches.map((r) => (
                      <option key={r.reachId} value={r.reachId}>
                        {r.reachName} ({r.district}) - {r.riverStream || "River Basin"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            {/* Statutory Gate Checklist */}
            <Card title="Pre-Dispatch Verification Checklist">
              <div className="space-y-3 pt-2 text-xs">
                <label className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-border-color dark:border-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={chkPaymentVerified}
                    onChange={(e) => setChkPaymentVerified(e.target.checked)}
                    className="size-4 text-orange-600 rounded"
                  />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">1. Treasury Payment Cleared</p>
                    <p className="text-[11px] text-gray-500">
                      Payment of ₹ {currentBooking?.totalAmount.toLocaleString()} verified in state bank escrow
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-border-color dark:border-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={chkWeightVerified}
                    onChange={(e) => setChkWeightVerified(e.target.checked)}
                    className="size-4 text-orange-600 rounded"
                  />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">2. Electronic Weighbridge Slip Verified</p>
                    <p className="text-[11px] text-gray-500">
                      Net sand payload ({currentBooking?.quantityMt} MT) cross-matched with tare weight
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-border-color dark:border-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={chkGpsOperational}
                    onChange={(e) => setChkGpsOperational(e.target.checked)}
                    className="size-4 text-orange-600 rounded"
                  />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">3. Vehicle GPS Device Healthy & Online</p>
                    <p className="text-[11px] text-gray-500">Live ping received from paired AIS-140 telematics unit</p>
                  </div>
                </label>
              </div>
            </Card>

            {/* Anti-Tamper Security Lock Notice */}
            <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl flex items-start gap-2.5 text-xs text-purple-900 dark:text-purple-200">
              <Lock size={16} className="text-purple-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Statutory Immutability Guarantee</span>
                <span className="text-[11px] text-purple-700 dark:text-purple-300">
                  Upon authorization, a tamper-proof Digital Transit Pass / Waybill will be sealed with a SHA-256 cryptographic signature. Post-issuance editing is strictly disabled by state protocol.
                </span>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              icon={<ShieldCheck size={18} />}
              className="w-full justify-center font-bold py-3 text-sm shadow-md"
            >
              Generate & Lock Digital Transit Pass / Waybill
            </Button>
          </div>

          {/* Consignment Specs */}
          <div>
            <Card title="Consignment Summary">
              {currentBooking ? (
                <div className="space-y-3 pt-1 text-xs">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl space-y-1.5 border border-border-color dark:border-gray-700">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Order:</span>
                      <span className="font-mono font-bold">{currentBooking.orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Customer:</span>
                      <span className="font-bold">{currentBooking.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Grade:</span>
                      <span>{currentBooking.sandType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Quantity:</span>
                      <span className="font-mono font-bold text-orange-600">{currentBooking.quantityMt} MT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sand Reach:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{currentReach.reachName}</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-gray-600 dark:text-gray-400">
                    <span className="text-gray-500 font-medium">Delivery Destination:</span>
                    <p className="text-gray-900 dark:text-white font-semibold">{currentBooking.destinationAddress}</p>
                  </div>
                </div>
              ) : null}
            </Card>
          </div>
        </div>
      </form>

      {/* Official Digital Transit Pass / Waybill Modal */}
      {generatedPass && (
        <DigitalTransitPassModal
          isOpen={isPassModalOpen}
          onClose={() => {
            setIsPassModalOpen(false);
            navigate(routes.dispatchManagement.path);
          }}
          transitPass={generatedPass}
        />
      )}
    </div>
  );
};

export default AuthorizeDispatch;

