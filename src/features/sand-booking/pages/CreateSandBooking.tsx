import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  ShieldCheck,
  Calculator,
  Warehouse,
  Truck,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  AlertTriangle,
  Info,
  CheckCircle2,
  User,
  Home,
  Building2,
  Landmark,
  Scale,
  FileText,
  DollarSign,
  HelpCircle,
} from "lucide-react";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import Card from "@/shared/components/layout/Card/Card";
import Button from "@/shared/components/ui/Button";
import Badge from "@/shared/components/ui/Badge";
import Modal, { ModalFooter } from "@/shared/components/ui/Modal/Modal";
import { useStatusModal } from "@/config/theme/StatusModalContext";
import { routes } from "@/app/routes/routeConfig";
import { inputBase, inputNormal } from "@/shared/components/ui/Forms/inputStyles";
import { calculateSlabTransportationCharges } from "../data/transportTariffSlabsData";
import type {
  DeliveryType,
  CustomerCategory,
  SandType,
  BookingPurpose,
  BookingUnit,
  TransportMode,
} from "../types";
import "../styles/sandBooking.css";

// Official Base Rates per MT by Sand Type (Minor Mineral Tariff Notification)
const SAND_TYPE_RATES: Record<string, { baseRatePerMt: number; description: string; bestFor: string }> = {
  "Coarse Sand": {
    baseRatePerMt: 475,
    description: "Standard Coarse River Sand (Zone II / III)",
    bestFor: "RCC Columns, Foundations & Structural Slabs",
  },
  "Fine Sand": {
    baseRatePerMt: 520,
    description: "Screened Fine Plastering Sand (< 1.5mm)",
    bestFor: "Internal & External Wall Plastering and Brickwork",
  },
  "Medium Concrete Sand": {
    baseRatePerMt: 490,
    description: "Washed Medium Concrete Sand (Zone II)",
    bestFor: "Beams, Lintels, Precast & General Concrete Work",
  },
  "Gravel Mix Sand": {
    baseRatePerMt: 450,
    description: "High density River Gravel-Sand Blend",
    bestFor: "Road Subbase, Plinth Fill & Paving Subgrade",
  },
  "Manufactured / M-Sand": {
    baseRatePerMt: 420,
    description: "Eco-Friendly Crushed Granitic Sand (VSI)",
    bestFor: "High-Strength RMC Batching & Pavements",
  },
  "Filter Bed Sand": {
    baseRatePerMt: 560,
    description: "Uniform Silica Filtration Grade Sand",
    bestFor: "Water Treatment Plants & Drainage Filter Beds",
  },
};

// Official Districts
const DISTRICT_LIST = [
  "Raipur",
  "Durg",
  "Bilaspur",
  "Rajnandgaon",
  "Korba",
  "Raigarh",
  "Dhamtari",
  "Mahasamund",
  "Bastar",
  "Surguja",
  "Janjgir-Champa",
  "Balod",
  "Bemetara",
];

export const CreateSandBooking: React.FC = () => {
  const { stockyards, citizens, createBooking } = useSandMining();
  const { showSuccess, showError } = useStatusModal();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Selected registered citizen state
  const defaultCit = citizens[0];
  const [selectedCitizenId, setSelectedCitizenId] = useState<string>(defaultCit?.id || "CIT-001");
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);

  // ── 1. Purpose & Customer Fields ──────────────────────────────────────────
  const [purpose, setPurpose] = useState<BookingPurpose>("Domestic");
  const [customerName, setCustomerName] = useState(defaultCit?.name || "Narayana Sahu");
  const [customerMobile, setCustomerMobile] = useState(defaultCit?.mobile || "+91 98260 12345");
  const [customerType, setCustomerType] = useState<CustomerCategory>(defaultCit?.customerType || "Domestic");

  // ── 2. Sand Type, Quantity & Unit ────────────────────────────────────────
  const [sandType, setSandType] = useState<string>("Coarse Sand");
  const [unit, setUnit] = useState<BookingUnit>("MT");
  const [inputQuantity, setInputQuantity] = useState<number>(16);

  // Density factor: 1 Cubic Meter of Sand ≈ 1.60 MT
  const DENSITY_FACTOR = 1.6;
  const quantityMt = useMemo(() => {
    if (unit === "Cubic Meter") {
      return Math.round(inputQuantity * DENSITY_FACTOR * 10) / 10;
    }
    return inputQuantity;
  }, [inputQuantity, unit]);

  // ── 3. Delivery District, Location & Address ──────────────────────────────
  const [deliveryDistrict, setDeliveryDistrict] = useState(defaultCit?.district || "Raipur");
  const [deliveryLocation, setDeliveryLocation] = useState(
    defaultCit?.preferredDeliveryLocation || "Sector 24 Main Road Gate 2, near Water Tank"
  );
  const [destinationAddress, setDestinationAddress] = useState(
    defaultCit?.address || defaultCit?.deliveryAddress || "Plot 45, Sector 24, Naya Raipur"
  );
  const [sourceStockyardId, setSourceStockyardId] = useState(stockyards[0]?.id || "STK-001");
  const [distanceKm, setDistanceKm] = useState<number>(22);

  // ── 4. Delivery Date, Time & Vehicle / Transport Mode ─────────────────────
  const [preferredDate, setPreferredDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [preferredTimeSlot, setPreferredTimeSlot] = useState("Morning (06:00 AM - 11:00 AM)");

  const [transportMode, setTransportMode] = useState<TransportMode>("Department-arranged transport");
  const [ownVehicleNumber, setOwnVehicleNumber] = useState("CG-04-TX-9988");
  const [ownDriverName, setOwnDriverName] = useState("Rameshwar Sahu");
  const [ownDriverLicense, setOwnDriverLicense] = useState("DL-CG04-2021-99812");

  // Stockyard inspection modal
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);

  // Stockyard selection
  const selectedStockyard = useMemo(() => {
    return (
      stockyards.find((s) => s.id === sourceStockyardId) ||
      stockyards[0] || {
        id: "STK-001",
        name: "Raipur Central Sand Stockyard",
        availableQuantityMt: 4200,
        totalCapacityMt: 15000,
        location: "Mandir Hasaud Bypass, Raipur",
        district: "Raipur",
      }
    );
  }, [stockyards, sourceStockyardId]);

  // Filter stockyards by chosen delivery district or nearby
  const recommendedStockyards = useMemo(() => {
    const matched = stockyards.filter(
      (s) => s.district.toLowerCase() === deliveryDistrict.toLowerCase()
    );
    return matched.length > 0 ? matched : stockyards;
  }, [stockyards, deliveryDistrict]);

  // Check if customer is registered in system
  const matchedCitizen = useMemo(() => {
    const cleanMobile = customerMobile.replace(/\D/g, "");
    return citizens.find(
      (c) =>
        c.id === selectedCitizenId ||
        (cleanMobile.length >= 10 && c.mobile.replace(/\D/g, "").includes(cleanMobile)) ||
        (customerName.trim() && c.name.toLowerCase() === customerName.trim().toLowerCase())
    );
  }, [citizens, selectedCitizenId, customerMobile, customerName]);

  const handleCitizenSelect = (citizenId: string) => {
    setSelectedCitizenId(citizenId);
    const cit = citizens.find((c) => c.id === citizenId);
    if (cit) {
      setCustomerName(cit.name);
      setCustomerMobile(cit.mobile);
      if (cit.customerType.includes("Commercial")) setPurpose("Commercial");
      else if (cit.customerType.includes("Govt") || cit.customerType.includes("Institutional")) setPurpose("Government Work");
      else setPurpose("Domestic");
      setCustomerType(cit.customerType);
      setDestinationAddress(cit.address || cit.deliveryAddress || destinationAddress);
      setDeliveryDistrict(cit.district || deliveryDistrict);
      if (cit.preferredDeliveryLocation) setDeliveryLocation(cit.preferredDeliveryLocation);
    }
  };

  // ── Telangana Sand Bazaar Automated Pricing Calculation Formula ─────────
  // Formula: Sand Quantity × Applicable Sand Rate + Transport Charges + Applicable Statutory Charges = Total Payable Amount
  const tariff = useMemo(() => {
    const currentRateInfo = SAND_TYPE_RATES[sandType] || { baseRatePerMt: 475 };
    const baseRatePerMt = currentRateInfo.baseRatePerMt;

    // 1. Sand Amount = Sand Quantity (MT) × Applicable Sand Rate
    const sandAmount = Math.round(baseRatePerMt * quantityMt);

    // 2. Transport Charges based on Statutory KM-Wise Fixed Slabs
    const slabCalc = calculateSlabTransportationCharges(distanceKm, quantityMt, transportMode);
    const transportCharges = slabCalc.finalTransportCharge;

    // 3. Applicable Statutory Charges (Statutory Mineral Cess under State Policy)
    const royaltyRate = 85; // ₹85/MT Mineral Royalty
    const dmfRate = 17; // ₹17/MT District Mineral Foundation (20% of Royalty)
    const envSurchargeRate = 15; // ₹15/MT Environmental Remediation Cess

    const royaltyAmount = Math.round(royaltyRate * quantityMt);
    const dmfCess = Math.round(dmfRate * quantityMt);
    const envSurcharge = Math.round(envSurchargeRate * quantityMt);
    const statutoryChargesTotal = royaltyAmount + dmfCess + envSurcharge;

    // 4. GST: 5% on (Sand Amount + Transport + Statutory Charges)
    const subtotal = sandAmount + transportCharges + statutoryChargesTotal;
    const gstAmount = Math.round(subtotal * 0.05);

    // 5. Total Payable Amount
    const totalAmount = subtotal + gstAmount;

    return {
      baseRatePerMt,
      sandAmount,
      distanceKm,
      transportCharges,
      slabCalc,
      royaltyAmount,
      dmfCess,
      envSurcharge,
      statutoryChargesTotal,
      gstAmount,
      totalAmount,
    };
  }, [sandType, quantityMt, transportMode, distanceKm]);

  // Real-time stock availability check
  const isStockAvailable = (selectedStockyard?.availableQuantityMt ?? 0) >= quantityMt;

  // Actions
  const handleCheckAvailability = () => {
    if (!isStockAvailable) {
      showError(
        `Insufficient Stock! Selected stockyard "${selectedStockyard.name}" currently holds ${selectedStockyard.availableQuantityMt} MT, which is less than requested ${quantityMt} MT.`
      );
    } else {
      showSuccess(
        `Stock Verified! "${selectedStockyard.name}" has ${selectedStockyard.availableQuantityMt} MT available for immediate allocation.`
      );
      setIsAvailabilityModalOpen(true);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!customerName.trim() || !customerMobile.trim()) {
        showError("Please enter customer name and valid mobile number.");
        return;
      }
      if (!matchedCitizen) {
        setIsRegistrationModalOpen(true);
        showError("Customer Registration Required: You must complete customer registration & OTP verification before placing a sand booking.");
        return;
      }
      if (inputQuantity <= 0) {
        showError("Please enter a valid sand quantity.");
        return;
      }
      if (purpose === "Domestic" && quantityMt > 50) {
        showError("Domestic quota limit is 50 MT per single order. Please adjust quantity or select Commercial purpose.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!destinationAddress.trim() || !deliveryLocation.trim()) {
        showError("Please enter complete delivery address and preferred delivery location.");
        return;
      }
      if (!isStockAvailable) {
        showError(
          `Requested ${quantityMt} MT exceeds available stockpile (${selectedStockyard.availableQuantityMt} MT) at ${selectedStockyard.name}. Please adjust quantity or choose another depot.`
        );
        return;
      }
      setStep(3);
    }
  };

  const handleCompleteBooking = () => {
    if (!isStockAvailable) {
      showError("Cannot finalize booking: requested quantity exceeds available stockyard balance.");
      return;
    }

    const bookingId = createBooking({
      customerName,
      customerMobile,
      customerType,
      purpose,
      sandType,
      quantityMt,
      quantityInUnit: inputQuantity,
      unit,
      sourceStockyardId: selectedStockyard.id,
      sourceStockyardName: selectedStockyard.name,
      destinationAddress,
      destinationDistrict: deliveryDistrict,
      deliveryDistrict,
      deliveryLocation,
      preferredDeliveryDate: preferredDate,
      preferredDeliveryTime: preferredTimeSlot,
      transportOption: transportMode,
      transportMode,
      ownVehicleNumber: transportMode === "Own vehicle, if permitted" ? ownVehicleNumber : undefined,
      ownDriverName: transportMode === "Own vehicle, if permitted" ? ownDriverName : undefined,
      basePricePerMt: tariff.baseRatePerMt,
      sandAmount: tariff.sandAmount,
      royaltyAmount: tariff.royaltyAmount,
      dmfCess: tariff.dmfCess,
      envSurcharge: tariff.envSurcharge,
      statutoryChargesTotal: tariff.statutoryChargesTotal,
      transportCharges: tariff.transportCharges,
      gstAmount: tariff.gstAmount,
      totalAmount: tariff.totalAmount,
    });

    showSuccess(`Booking created! Redirecting to secure Payment Gateway...`);
    // Direct to payment settlement gateway with bookingId
    navigate(`/process-payment?bookingId=${bookingId}`);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            icon={<ArrowLeft size={15} />}
            onClick={() => navigate(routes.sandBooking.path)}
          >
            Back to Bookings
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Telangana Sand Bazaar Model
              </span>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Online Sand Booking Wizard
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Redesigned around actual delivery requirements with automated transparent tariff and transport calculation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={<Warehouse size={14} />}
            onClick={handleCheckAvailability}
          >
            Check Stock Availability
          </Button>
        </div>
      </div>

      {/* ── Telangana Pricing Formula Banner ─────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calculator size={18} className="text-amber-200" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-200">
              Statutory Automated Pricing Formula (Telangana Model)
            </span>
          </div>
          <p className="font-mono text-xs sm:text-sm font-black text-white">
            (Sand Quantity × Applicable Sand Rate) + Transport Charges + Statutory Charges = Total Payable Amount
          </p>
        </div>
        <div className="shrink-0 bg-white/10 backdrop-blur-xs px-4 py-2 rounded-xl border border-white/20 text-right">
          <span className="text-[10px] uppercase font-bold text-amber-200 block">Current Live Estimate</span>
          <span className="text-lg font-black font-mono">₹ {tariff.totalAmount.toLocaleString()}</span>
        </div>
      </div>

      {/* Stepper Navigation */}
      <div className="flex items-center justify-between max-w-xl mx-auto py-2 text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`size-7 rounded-full flex items-center justify-center font-bold text-xs ${
              step >= 1 ? "bg-orange-600 text-white shadow-sm" : "bg-slate-200 dark:bg-slate-800 text-slate-600"
            }`}
          >
            1
          </span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">Purpose & Quantity</span>
        </div>
        <div className="h-0.5 w-12 bg-slate-300 dark:bg-slate-700" />
        <div className="flex items-center gap-2">
          <span
            className={`size-7 rounded-full flex items-center justify-center font-bold text-xs ${
              step >= 2 ? "bg-orange-600 text-white shadow-sm" : "bg-slate-200 dark:bg-slate-800 text-slate-600"
            }`}
          >
            2
          </span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">Delivery Site & Transport</span>
        </div>
        <div className="h-0.5 w-12 bg-slate-300 dark:bg-slate-700" />
        <div className="flex items-center gap-2">
          <span
            className={`size-7 rounded-full flex items-center justify-center font-bold text-xs ${
              step >= 3 ? "bg-orange-600 text-white shadow-sm" : "bg-slate-200 dark:bg-slate-800 text-slate-600"
            }`}
          >
            3
          </span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">Tariff Breakdown & Payment</span>
        </div>
      </div>

      {/* Main Booking Container */}
      <div className="max-w-4xl mx-auto">
        
        {/* ── STEP 1: PURPOSE, QUANTITY & CUSTOMER ───────────── */}
        {step === 1 && (
          <Card
            title="Step 1: Booking Purpose, Quantity & Verified Customer"
            subtitle="Configure delivery requirement, select purpose quota, and enter required tonnage or volume"
          >
            <div className="space-y-6 pt-1 text-xs">
              
              {/* Registered Customer Quick Selector & Lookup */}
              <div className="p-3.5 bg-slate-50 dark:bg-gray-800/60 rounded-2xl border border-border-color space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                    <User size={15} className="text-primary" />
                    Customer Verification & Selection (Registration Required):
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-xs shrink-0"
                    onClick={() => navigate(`${routes.citizenRegistration.path}?from=booking`)}
                  >
                    + Register New Customer
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {citizens.slice(0, 6).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleCitizenSelect(c.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        selectedCitizenId === c.id || (matchedCitizen && matchedCitizen.id === c.id)
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs"
                          : "border-border-color bg-white dark:bg-gray-900 text-slate-700 dark:text-slate-300 hover:border-slate-400"
                      }`}
                    >
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="truncate font-semibold">{c.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">{c.customerType?.split(" ")[0]}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{c.mobile}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Verified Customer Status Pill */}
              {matchedCitizen ? (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span className="text-xs">
                      <strong>Registered & Verified Customer:</strong> {matchedCitizen.name} ({matchedCitizen.id}) • {matchedCitizen.customerType}
                    </span>
                  </div>
                  <Badge variant="success" className="text-[10px] shrink-0">
                    OTP & KYC Verified ✓
                  </Badge>
                </div>
              ) : (
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-200">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-xs">Customer Registration Required</p>
                      <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                        As per State Mineral Rules 2026, customer registration & OTP verification must be completed before placing a booking.
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    className="shrink-0"
                    onClick={() => navigate(`${routes.citizenRegistration.path}?from=booking`)}
                  >
                    Register Customer Now
                  </Button>
                </div>
              )}

              {/* Customer Name & Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Customer / Entity Name *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className={`${inputBase} ${inputNormal}`}
                    placeholder="e.g. Narayana Sahu"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Customer Mobile Number (for OTP & e-Pass) *
                  </label>
                  <input
                    type="tel"
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value)}
                    className={`${inputBase} ${inputNormal} font-mono font-semibold`}
                    placeholder="+91 98260 12345"
                    required
                  />
                </div>
              </div>

              {/* ── Required Field 1: Purpose ─────────────────────────────── */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-800 dark:text-slate-200 text-xs">
                  Booking Purpose *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Domestic */}
                  <div
                    onClick={() => setPurpose("Domestic")}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      purpose === "Domestic"
                        ? "border-primary bg-primary/10 shadow-xs"
                        : "border-border-color bg-slate-50/50 dark:bg-gray-800/40 hover:border-slate-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs">
                        <Home size={16} className="text-primary" />
                        Domestic
                      </div>
                      <input
                        type="radio"
                        name="purpose"
                        checked={purpose === "Domestic"}
                        onChange={() => setPurpose("Domestic")}
                        className="text-primary focus:ring-primary accent-[#c2410c]"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Individual home construction, personal repairs & PM Awas. (Quota: ≤ 50 MT)
                    </p>
                  </div>

                  {/* Commercial */}
                  <div
                    onClick={() => setPurpose("Commercial")}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      purpose === "Commercial"
                        ? "border-primary bg-primary/10 shadow-xs"
                        : "border-border-color bg-slate-50/50 dark:bg-gray-800/40 hover:border-slate-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs">
                        <Building2 size={16} className="text-amber-600" />
                        Commercial
                      </div>
                      <input
                        type="radio"
                        name="purpose"
                        checked={purpose === "Commercial"}
                        onChange={() => setPurpose("Commercial")}
                        className="text-primary focus:ring-primary accent-[#c2410c]"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Builders, commercial complexes, real estate developers & RMC batching plants.
                    </p>
                  </div>

                  {/* Government Work */}
                  <div
                    onClick={() => setPurpose("Government Work")}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      purpose === "Government Work"
                        ? "border-primary bg-primary/10 shadow-xs"
                        : "border-border-color bg-slate-50/50 dark:bg-gray-800/40 hover:border-slate-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs">
                        <Landmark size={16} className="text-blue-600" />
                        Government Work
                      </div>
                      <input
                        type="radio"
                        name="purpose"
                        checked={purpose === "Government Work"}
                        onChange={() => setPurpose("Government Work")}
                        className="text-primary focus:ring-primary accent-[#c2410c]"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      PWD, CPWD, NHAI, state highways, irrigation & municipal infrastructure projects.
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Required Field 2 & 3: Quantity & Unit (MT / Cubic Meter) ── */}
              <div className="p-4 bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/60 rounded-2xl space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  {/* Unit Selector */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 text-xs">
                      Measurement Unit *
                    </label>
                    <div className="flex rounded-xl border border-border-color overflow-hidden bg-white dark:bg-gray-900">
                      <button
                        type="button"
                        onClick={() => setUnit("MT")}
                        className={`flex-1 py-2 text-xs font-bold transition-colors ${
                          unit === "MT"
                            ? "bg-primary text-white"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        MT (Metric Tonne)
                      </button>
                      <button
                        type="button"
                        onClick={() => setUnit("Cubic Meter")}
                        className={`flex-1 py-2 text-xs font-bold transition-colors ${
                          unit === "Cubic Meter"
                            ? "bg-primary text-white"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        Cubic Meter (m³)
                      </button>
                    </div>
                  </div>

                  {/* Required Quantity Input */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 text-xs">
                      Required Quantity ({unit}) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={purpose === "Domestic" ? 50 : 500}
                      step={unit === "Cubic Meter" ? "0.5" : "1"}
                      value={inputQuantity}
                      onChange={(e) => setInputQuantity(Math.max(1, Number(e.target.value)))}
                      className={`${inputBase} ${inputNormal} font-mono font-bold text-orange-600 text-sm`}
                      required
                    />
                  </div>

                  {/* Density Conversion & Effective Tonnage Display */}
                  <div className="p-2.5 bg-white dark:bg-gray-900 rounded-xl border border-border-color text-[11px] space-y-1">
                    <div className="flex justify-between text-slate-500">
                      <span>Standard Sand Density:</span>
                      <span className="font-mono font-bold">1.60 MT / m³</span>
                    </div>
                    <div className="flex justify-between text-slate-900 dark:text-white font-bold">
                      <span>Effective Tonnage:</span>
                      <span className="font-mono text-orange-600 dark:text-orange-400">{quantityMt} MT</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-orange-200/50 dark:border-orange-800/40">
                  <span>
                    {purpose === "Domestic"
                      ? "ℹ️ Permitted Domestic Quota: 1 to 50 MT per registered property."
                      : "ℹ️ Bulk commercial & government allotments subject to stockyard balance."}
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Base Sand Value: ₹ {tariff.sandAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Bottom Step 1 Action */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                <div className="text-xs text-slate-500">
                  Telangana Formula Base: <strong>₹ {tariff.sandAmount.toLocaleString()}</strong> (Excl. Transport & Taxes)
                </div>
                <Button variant="primary" icon={<ArrowRight size={15} />} onClick={handleNext}>
                  Next: Delivery Site & Transport
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* ── STEP 2: DELIVERY SITE, STOCKYARD & TRANSPORT MODE ────────── */}
        {step === 2 && (
          <Card
            title="Step 2: Delivery Location Hierarchy, Depots & Vehicle Transport Mode"
            subtitle="Specify destination delivery address, date/time slot, and department or own vehicle transport"
          >
            <div className="space-y-6 pt-1 text-xs">
              
              {/* ── Required Field 5, 6 & 7: District, Delivery Location & Address ── */}
              <div className="space-y-4">
                <div className="border-b border-border-color pb-2 flex items-center gap-2">
                  <MapPin size={16} className="text-primary" />
                  <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                    Delivery Destination & Site Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Delivery District *
                    </label>
                    <select
                      value={deliveryDistrict}
                      onChange={(e) => setDeliveryDistrict(e.target.value)}
                      className={`${inputBase} ${inputNormal} font-semibold`}
                    >
                      {DISTRICT_LIST.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Delivery Location / Specific Landmark *
                    </label>
                    <input
                      type="text"
                      value={deliveryLocation}
                      onChange={(e) => setDeliveryLocation(e.target.value)}
                      placeholder="e.g. Sector 24 Main Road Gate 2, near Water Tank"
                      className={`${inputBase} ${inputNormal} font-semibold`}
                      required
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Exact unloading point / landmark used for driver routing and GPS geofencing.
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Complete Delivery / Construction Site Address *
                  </label>
                  <textarea
                    rows={2}
                    value={destinationAddress}
                    onChange={(e) => setDestinationAddress(e.target.value)}
                    placeholder="Plot / House No., Street, Construction Site, Village/Town, Pincode..."
                    className={`${inputBase} ${inputNormal}`}
                    required
                  />
                </div>
              </div>

              {/* ── Origin Stockyard Depot Selection ─────────────────────── */}
              <div className="space-y-3">
                <div className="border-b border-border-color pb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Warehouse size={16} className="text-primary" />
                    <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                      Source Stockyard / Sand Depot Allocation
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-500">Closest authorized government stockpile</span>
                </div>

                {/* ⛔ Automated Booking Blocking High-Alert Card if Stock is Insufficient */}
                {!isStockAvailable && (
                  <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-500 rounded-2xl space-y-3 animate-in fade-in">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-rose-500 text-white rounded-xl shrink-0 mt-0.5">
                        <AlertTriangle size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-rose-900 dark:text-rose-200 text-sm">
                            ⛔ Booking Automatically Blocked: Insufficient Stock
                          </h4>
                          <Badge variant="danger" className="text-[10px]">
                            Depot Stock Depleted
                          </Badge>
                        </div>
                        <p className="text-xs text-rose-700 dark:text-rose-300 mt-1 leading-relaxed">
                          Selected Depot <strong>{selectedStockyard.name}</strong> currently has only{" "}
                          <strong className="font-mono text-rose-950 dark:text-rose-100">{selectedStockyard.availableQuantityMt} MT</strong> available stock, which cannot fulfill your requested booking of{" "}
                          <strong className="font-mono text-rose-950 dark:text-rose-100">{quantityMt} MT</strong> ({sandType}).
                        </p>
                      </div>
                    </div>

                    {stockyards.filter((s) => s.id !== selectedStockyard.id && s.availableQuantityMt >= quantityMt).length > 0 && (
                      <div className="pt-2 border-t border-rose-200 dark:border-rose-900/60">
                        <p className="text-[11px] font-bold text-rose-900 dark:text-rose-200 mb-2">
                          💡 Alternative Depots with Sufficient Available Stock:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {stockyards
                            .filter((s) => s.id !== selectedStockyard.id && s.availableQuantityMt >= quantityMt)
                            .slice(0, 4)
                            .map((alt) => (
                              <button
                                key={alt.id}
                                type="button"
                                onClick={() => setSourceStockyardId(alt.id)}
                                className="flex items-center justify-between p-2.5 bg-white dark:bg-gray-900 border border-emerald-400 dark:border-emerald-600 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all text-left cursor-pointer"
                              >
                                <div>
                                  <p className="font-bold text-xs text-slate-900 dark:text-white">{alt.name}</p>
                                  <p className="text-[10px] text-slate-500">{alt.district} • {alt.location}</p>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400 block">
                                    {alt.availableQuantityMt.toLocaleString()} MT
                                  </span>
                                  <span className="text-[9px] font-semibold text-emerald-700 dark:text-emerald-300 underline">Switch Here →</span>
                                </div>
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recommendedStockyards.slice(0, 4).map((yard) => {
                    const hasStock = yard.availableQuantityMt >= quantityMt;
                    return (
                      <div
                        key={yard.id}
                        onClick={() => setSourceStockyardId(yard.id)}
                        className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                          sourceStockyardId === yard.id
                            ? hasStock
                              ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-xs"
                              : "border-rose-500 bg-rose-50/40 dark:bg-rose-950/20 shadow-xs"
                            : "border-border-color bg-white dark:bg-gray-900 hover:border-slate-400"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-xs">{yard.name}</h4>
                            <p className="text-[11px] text-slate-500">{yard.location} ({yard.district})</p>
                          </div>
                          <Badge variant={hasStock ? "success" : "danger"} className="text-[10px]">
                            {hasStock ? "Stock Available" : "Stock Shortage"}
                          </Badge>
                        </div>
                        <div className="mt-2.5 flex justify-between font-mono text-[11px] pt-2 border-t border-border-color">
                          <span className="text-slate-500">Available Balance:</span>
                          <span className={`font-bold ${hasStock ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                            {yard.availableQuantityMt.toLocaleString()} MT
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Required Field 8: Vehicle / Transport Mode ────────────── */}
              <div className="space-y-3">
                <div className="border-b border-border-color pb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck size={16} className="text-primary" />
                    <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                      Vehicle / Transport Mode *
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-500">Select logistics arrangement</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Department-arranged Transport */}
                  <div
                    onClick={() => setTransportMode("Department-arranged transport")}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      transportMode === "Department-arranged transport"
                        ? "border-primary bg-primary/10 shadow-xs"
                        : "border-border-color bg-slate-50/50 dark:bg-gray-800/40 hover:border-slate-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs">
                        <Truck size={18} className="text-primary" />
                        Department-Arranged Transport
                      </div>
                      <input
                        type="radio"
                        name="transportMode"
                        checked={transportMode === "Department-arranged transport"}
                        onChange={() => setTransportMode("Department-arranged transport")}
                        className="text-primary focus:ring-primary accent-[#c2410c]"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                      Government empanelled GPS-tracked tippers with real-time transit telemetry and doorstep OTP delivery.
                    </p>
                    <div className="mt-2.5 text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300 flex flex-wrap items-center justify-between gap-1.5">
                      <span>
                        Calculated Logistics Fee: <span className="text-primary font-bold">₹ {tariff.transportCharges.toLocaleString()}</span> ({distanceKm} km)
                      </span>
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">
                        {tariff.slabCalc.slab.slabCode} ({tariff.slabCalc.slab.minKm}-{tariff.slabCalc.slab.maxKm} KM Slab)
                      </span>
                    </div>
                  </div>

                  {/* Own Vehicle, if Permitted */}
                  <div
                    onClick={() => setTransportMode("Own vehicle, if permitted")}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      transportMode === "Own vehicle, if permitted"
                        ? "border-primary bg-primary/10 shadow-xs"
                        : "border-border-color bg-slate-50/50 dark:bg-gray-800/40 hover:border-slate-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs">
                        <Scale size={18} className="text-emerald-600" />
                        Own Vehicle, If Permitted (Self-Pickup)
                      </div>
                      <input
                        type="radio"
                        name="transportMode"
                        checked={transportMode === "Own vehicle, if permitted"}
                        onChange={() => setTransportMode("Own vehicle, if permitted")}
                        className="text-primary focus:ring-primary accent-[#c2410c]"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                      Self-lifting permit with buyer-arranged vehicle. Electronic weighbridge gate-pass issued directly at depot.
                    </p>
                    <div className="mt-2.5 text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      Logistics Charge: ₹0 (Zero Department Transport Charge)
                    </div>
                  </div>
                </div>

                {/* Own Vehicle Details (If Own Vehicle selected) */}
                {transportMode === "Own vehicle, if permitted" && (
                  <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Own Vehicle Registration No. *
                      </label>
                      <input
                        type="text"
                        value={ownVehicleNumber}
                        onChange={(e) => setOwnVehicleNumber(e.target.value.toUpperCase())}
                        placeholder="e.g. CG-04-TX-9988"
                        className={`${inputBase} ${inputNormal} font-mono font-bold uppercase`}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Driver Name *
                      </label>
                      <input
                        type="text"
                        value={ownDriverName}
                        onChange={(e) => setOwnDriverName(e.target.value)}
                        placeholder="e.g. Rameshwar Sahu"
                        className={`${inputBase} ${inputNormal}`}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Driver License No. *
                      </label>
                      <input
                        type="text"
                        value={ownDriverLicense}
                        onChange={(e) => setOwnDriverLicense(e.target.value.toUpperCase())}
                        placeholder="e.g. DL-CG04-2021-99812"
                        className={`${inputBase} ${inputNormal} font-mono uppercase`}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Distance Slider (for Department transport) */}
                {transportMode === "Department-arranged transport" && (
                  <div className="p-3 bg-slate-50 dark:bg-gray-800/60 rounded-xl border border-border-color space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Haulage Distance from {selectedStockyard.name}:
                      </span>
                      <span className="font-mono font-bold text-primary">{distanceKm} Kilometers</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="120"
                      value={distanceKm}
                      onChange={(e) => setDistanceKm(Number(e.target.value))}
                      className="w-full accent-[#c2410c] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>5 km (Local)</span>
                      <span>50 km</span>
                      <span>120 km (Inter-District)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Required Field 9: Preferred Delivery Date & Time Slot ─── */}
              <div className="space-y-3">
                <div className="border-b border-border-color pb-2 flex items-center gap-2">
                  <Calendar size={16} className="text-primary" />
                  <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                    Preferred Delivery Schedule & Time Slot
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Preferred Delivery Date *
                    </label>
                    <input
                      type="date"
                      value={preferredDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className={`${inputBase} ${inputNormal} font-semibold`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Preferred Delivery Time Window *
                    </label>
                    <select
                      value={preferredTimeSlot}
                      onChange={(e) => setPreferredTimeSlot(e.target.value)}
                      className={`${inputBase} ${inputNormal} font-semibold`}
                    >
                      <option value="Morning (06:00 AM - 11:00 AM)">Morning (06:00 AM - 11:00 AM)</option>
                      <option value="Afternoon (11:00 AM - 04:00 PM)">Afternoon (11:00 AM - 04:00 PM)</option>
                      <option value="Evening (04:00 PM - 08:00 PM)">Evening (04:00 PM - 08:00 PM)</option>
                      <option value="Any Time (Standard Operational Dispatch)">Any Time (Standard Operational Dispatch)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 2 Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                <Button variant="outline" icon={<ArrowLeft size={15} />} onClick={() => setStep(1)}>
                  Back: Purpose & Quantity
                </Button>
                <Button variant="primary" icon={<ArrowRight size={15} />} onClick={handleNext}>
                  Next: Automatic Tariff Breakdown
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* ── STEP 3: AUTOMATED TELANGANA TARIFF BREAKDOWN & INVOICE ────── */}
        {step === 3 && (
          <Card
            title="Step 3: Automated Tariff Calculation & Pre-Payment Summary"
            subtitle="Full statutory transparent invoice based on Telangana Sand Bazaar model"
          >
            <div className="space-y-6 pt-1 text-xs">
              
              {/* Order Overview Summary Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-gray-800/60 rounded-2xl border border-border-color">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Customer</span>
                  <span className="font-bold text-slate-900 dark:text-white truncate block">{customerName}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{customerMobile}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Purpose & Grade</span>
                  <span className="font-bold text-slate-900 dark:text-white block">{purpose}</span>
                  <span className="text-[10px] text-primary font-semibold">{sandType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Quantity Allotted</span>
                  <span className="font-bold text-orange-600 font-mono text-sm block">
                    {inputQuantity} {unit} ({quantityMt} MT)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Transport Mode</span>
                  <span className="font-bold text-slate-900 dark:text-white block truncate">{transportMode}</span>
                  <span className="text-[10px] text-slate-500">{preferredDate} ({preferredTimeSlot.split(" ")[0]})</span>
                </div>
              </div>

              {/* ── Mathematical Tariff Calculation Table (Telangana Model) ── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-border-color pb-2">
                  <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
                    <FileText size={16} className="text-primary" />
                    Automated Statutory Invoice Breakdown
                  </h3>
                  <Badge variant="primary" className="text-[10px]">
                    State Approved Minor Mineral Tariffs
                  </Badge>
                </div>

                <div className="rounded-2xl border border-border-color overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-slate-300 font-bold border-b border-border-color">
                      <tr>
                        <th className="p-3">Component / Statutory Head</th>
                        <th className="p-3 text-center">Rate / Parameter</th>
                        <th className="p-3 text-center">Quantity</th>
                        <th className="p-3 text-right">Payable Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color font-medium text-slate-700 dark:text-slate-300">
                      {/* 1. Base Sand Rate */}
                      <tr className="bg-white dark:bg-gray-900">
                        <td className="p-3">
                          <span className="font-bold text-slate-900 dark:text-white block">
                            1. Sand Base Cost ({sandType})
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Regulated stockyard pit-head rate
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono">
                          ₹ {tariff.baseRatePerMt} / MT
                        </td>
                        <td className="p-3 text-center font-mono">{quantityMt} MT</td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                          ₹ {tariff.sandAmount.toLocaleString()}
                        </td>
                      </tr>

                      {/* 2. Transport Charges */}
                      <tr className="bg-slate-50/50 dark:bg-gray-900/50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white block">
                              2. Transport & Logistics Freight
                            </span>
                            {transportMode === "Department-arranged transport" && (
                              <Badge variant="primary" className="text-[9px]">
                                {tariff.slabCalc.slab.slabCode} ({tariff.slabCalc.slab.minKm}-{tariff.slabCalc.slab.maxKm} KM)
                              </Badge>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {transportMode === "Department-arranged transport"
                              ? `Fixed Slab: Base ₹${tariff.slabCalc.slab.fixedBaseRate} + (${distanceKm} km × ₹${tariff.slabCalc.slab.ratePerKm}/km) + (${quantityMt} MT × ${distanceKm} km × ₹${tariff.slabCalc.slab.ratePerMtPerKm})`
                              : "Self-lift buyer vehicle arrangement (zero dept charge)"}
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono">
                          {transportMode === "Department-arranged transport"
                            ? `₹${tariff.slabCalc.slab.ratePerKm}/km slab`
                            : "₹0 (Self-Lift)"}
                        </td>
                        <td className="p-3 text-center font-mono">{distanceKm} km</td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                          ₹ {tariff.transportCharges.toLocaleString()}
                        </td>
                      </tr>

                      {/* 3. Applicable Statutory Charges */}
                      <tr className="bg-white dark:bg-gray-900">
                        <td className="p-3">
                          <span className="font-bold text-slate-900 dark:text-white block">
                            3. State Mineral Royalty & DMF Cess
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Royalty (₹85/MT) + DMF (₹17/MT) + Env Surcharge (₹15/MT)
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono">₹117 / MT</td>
                        <td className="p-3 text-center font-mono">{quantityMt} MT</td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                          ₹ {tariff.statutoryChargesTotal.toLocaleString()}
                        </td>
                      </tr>

                      {/* 4. GST */}
                      <tr className="bg-slate-50/50 dark:bg-gray-900/50">
                        <td className="p-3">
                          <span className="font-bold text-slate-900 dark:text-white block">
                            4. Applicable GST (5%)
                          </span>
                          <span className="text-[10px] text-slate-400">
                            CGST (2.5%) + SGST (2.5%) on Mineral Supply & Logistics
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono">5.00%</td>
                        <td className="p-3 text-center font-mono">-</td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                          ₹ {tariff.gstAmount.toLocaleString()}
                        </td>
                      </tr>

                      {/* TOTAL ROW */}
                      <tr className="bg-orange-50 dark:bg-orange-950/40 border-t-2 border-orange-300 dark:border-orange-800 text-sm">
                        <td colSpan={3} className="p-3.5 font-black text-slate-900 dark:text-white uppercase tracking-wider">
                          Total Payable Amount:
                        </td>
                        <td className="p-3.5 text-right font-mono font-black text-orange-600 dark:text-orange-400 text-base">
                          ₹ {tariff.totalAmount.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Statutory Confirmation Notice */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-start gap-3">
                <ShieldCheck size={22} className="text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                  <span className="font-bold">Automated Treasury Clearance:</span> Once payment is processed, the system automatically allocates physical stock from <strong>{selectedStockyard.name}</strong>, generates a dynamic QR-coded e-Pass transit slip, and alerts the weighbridge terminal.
                </div>
              </div>

              {/* Step 3 Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <Button variant="outline" icon={<ArrowLeft size={15} />} onClick={() => setStep(2)}>
                  Back: Delivery Site & Transport
                </Button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="primary"
                    icon={<CreditCard size={16} />}
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700"
                    onClick={handleCompleteBooking}
                  >
                    Proceed to Payment Gateway (₹ {tariff.totalAmount.toLocaleString()})
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* ── Availability Check Modal ─────────────────────────────────── */}
      <Modal
        isOpen={isAvailabilityModalOpen}
        onClose={() => setIsAvailabilityModalOpen(false)}
        title="Stockyard Stockpile Availability Inspection"
        size="md"
        footer={
          <ModalFooter
            onClose={() => setIsAvailabilityModalOpen(false)}
            showConfirm={false}
            cancelText="Close Inspection"
          />
        }
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
            <CheckCircle2 size={32} className="text-emerald-600 shrink-0" />
            <div>
              <h4 className="font-bold text-emerald-950 dark:text-emerald-200 text-sm">Stock Available</h4>
              <p className="text-emerald-700 dark:text-emerald-300 mt-0.5">
                {selectedStockyard.name} currently has <strong>{selectedStockyard.availableQuantityMt} MT</strong> available.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 font-mono">
            <div>
              <span className="text-slate-500 text-[10px] block font-sans font-semibold">REQUESTED TONNAGE</span>
              <span className="text-base font-bold text-orange-600">{quantityMt} MT</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block font-sans font-semibold">DEPOT STOCK BALANCE</span>
              <span className="text-base font-bold text-emerald-600">{selectedStockyard.availableQuantityMt} MT</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block font-sans font-semibold">TOTAL YARD CAPACITY</span>
              <span className="text-sm font-bold">{selectedStockyard.totalCapacityMt || 15000} MT</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block font-sans font-semibold">DEPOT LOCATION</span>
              <span className="text-xs font-sans font-medium text-slate-700 dark:text-slate-300">{selectedStockyard.location}</span>
            </div>
          </div>
        </div>
      </Modal>

      {/* ── Registration Required Enforcement Modal ──────────────────── */}
      <Modal
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
        title="Customer Registration Required Before Booking"
        size="md"
        footer={
          <ModalFooter
            onClose={() => setIsRegistrationModalOpen(false)}
            onConfirm={() => {
              setIsRegistrationModalOpen(false);
              navigate(`${routes.citizenRegistration.path}?from=booking`);
            }}
            confirmText="Register Customer Now"
            cancelText="Close"
          />
        }
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 flex items-start gap-3">
            <AlertTriangle size={28} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-950 dark:text-amber-200 text-sm">
                Mandatory Customer Registration Notice
              </h4>
              <p className="text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">
                As per Chhattisgarh Minor Mineral Rules 2026, sand booking requires a verified customer profile with valid Aadhaar/Identity details, delivery site geotagging, and OTP verification.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-gray-800/60 rounded-xl border border-border-color space-y-2">
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              Why is registration required?
            </p>
            <ul className="list-disc list-inside text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
              <li>Statutory mineral quota allocation & anti-black marketing tracking</li>
              <li>Automated SMS e-Pass generation and computerized weighbridge transit gate pass</li>
              <li>Real-time GPS vehicle telematics & delivery OTP confirmation</li>
            </ul>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-slate-500 text-[11px]">Already have another registered profile?</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsRegistrationModalOpen(false);
                if (citizens[0]) handleCitizenSelect(citizens[0].id);
              }}
            >
              Use Pre-Registered Demo Profile
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CreateSandBooking;
