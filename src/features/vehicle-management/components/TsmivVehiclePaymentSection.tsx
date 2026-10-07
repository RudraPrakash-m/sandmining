import React, { useState, useMemo } from "react";
import {
  Truck,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  FileText,
  Printer,
  Search,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  Gauge,
  Sparkles,
  ArrowUpRight,
  CheckCheck,
  ShieldCheck,
  Receipt,
  PlusCircle,
  IndianRupee,
  Navigation,
} from "lucide-react";
import Card from "@/shared/components/layout/Card/Card";
import Button from "@/shared/components/ui/Button";
import Badge from "@/shared/components/ui/Badge";
import Modal, { ModalFooter } from "@/shared/components/ui/Modal/Modal";
import Tabs from "@/shared/components/ui/Tabs";
import type { Vehicle, AllocationRecord, VehicleTripPayment, VehiclePaymentSummary } from "@/features/shared-simulation/types";

// TSMIV Statutory Per-KM Tariff Matrix (Telangana / Chhattisgarh Model)
export const TSMIV_RATE_MATRIX: Record<string, { baseFare: number; perKmRate: number; minKm: number; loadingAllowance: number }> = {
  "Tractor-Trailer (5 MT)": {
    baseFare: 250,
    perKmRate: 28,
    minKm: 5,
    loadingAllowance: 150,
  },
  "2-Axle Tipper (10 MT)": {
    baseFare: 450,
    perKmRate: 42,
    minKm: 5,
    loadingAllowance: 250,
  },
  "3-Axle Tipper (18 MT)": {
    baseFare: 750,
    perKmRate: 65,
    minKm: 10,
    loadingAllowance: 350,
  },
  "4-Axle Heavy (28 MT)": {
    baseFare: 1100,
    perKmRate: 95,
    minKm: 10,
    loadingAllowance: 500,
  },
};

// Initial Initialized Trip Payments
export const INITIAL_VEHICLE_PAYMENTS: VehicleTripPayment[] = [
  {
    id: "VPAY-001",
    tripId: "TRIP-2026-8801",
    orderId: "SMMS-ORD-2026-8801",
    allocationId: "ALLOC-2026-0081",
    vehicleId: "VEH-001",
    vehicleNumber: "CG-04-TX-2341",
    vehicleType: "2-Axle Tipper (10 MT)",
    transporterName: "Venkat Sahu Logistics",
    driverName: "Venkat Sahu",
    driverMobile: "+91 98261 22341",
    bankAccountMasked: "••••••••4812",
    ifscCode: "SBIN0004128",
    sourceStockyard: "Raipur Central Sand Stockyard",
    destinationAddress: "Plot 45, Shankar Nagar, Raipur",
    destinationDistrict: "Raipur",
    distanceKm: 18.5,
    ratePerKm: 42,
    baseCharge: 450,
    loadingAllowance: 250,
    grossAmount: 1477,
    tdsDeduction: 30,
    welfareCess: 15,
    netPayableAmount: 1432,
    paymentStatus: "Paid / Settled (DBT)",
    tripDate: "2026-09-08 11:30",
    paymentReference: "DBT-CGSMMS-20260908-0194",
    utrNumber: "UTR260908889104",
    settledAt: "2026-09-08 14:15",
    gpsTrackedDistanceKm: 18.3,
    routeComplianceScore: 99.1,
  },
  {
    id: "VPAY-002",
    tripId: "TRIP-2026-8802",
    orderId: "SMMS-ORD-2026-8802",
    allocationId: "ALLOC-2026-0082",
    vehicleId: "VEH-002",
    vehicleNumber: "CG-04-TR-1102",
    vehicleType: "Tractor-Trailer (5 MT)",
    transporterName: "Kisan Rural Transport Union",
    driverName: "Ramswaroop Yadav",
    driverMobile: "+91 94251 88990",
    bankAccountMasked: "••••••••9941",
    ifscCode: "CBIN0281140",
    sourceStockyard: "Kharun River Reach Stockyard #2",
    destinationAddress: "Gram Panchayat Arang Village",
    destinationDistrict: "Raipur",
    distanceKm: 24.0,
    ratePerKm: 28,
    baseCharge: 250,
    loadingAllowance: 150,
    grossAmount: 1072,
    tdsDeduction: 21,
    welfareCess: 11,
    netPayableAmount: 1040,
    paymentStatus: "Paid / Settled (DBT)",
    tripDate: "2026-09-08 13:10",
    paymentReference: "DBT-CGSMMS-20260908-0288",
    utrNumber: "UTR260908992015",
    settledAt: "2026-09-08 15:45",
    gpsTrackedDistanceKm: 24.2,
    routeComplianceScore: 98.4,
  },
  {
    id: "VPAY-003",
    tripId: "TRIP-2026-8803",
    orderId: "SMMS-ORD-2026-8803",
    allocationId: "ALLOC-2026-0083",
    vehicleId: "VEH-003",
    vehicleNumber: "CG-07-TH-7721",
    vehicleType: "3-Axle Tipper (18 MT)",
    transporterName: "Chhattisgarh Heavy Haul Fleet",
    driverName: "S. K. Patel",
    driverMobile: "+91 94252 77210",
    bankAccountMasked: "••••••••7721",
    ifscCode: "PUNB0182700",
    sourceStockyard: "Durg-Patan De-siltation Sand Depot",
    destinationAddress: "Bhilai Steel Township Sector 6",
    destinationDistrict: "Durg",
    distanceKm: 38.5,
    ratePerKm: 65,
    baseCharge: 750,
    loadingAllowance: 350,
    grossAmount: 3603,
    tdsDeduction: 72,
    welfareCess: 36,
    netPayableAmount: 3495,
    paymentStatus: "Approved",
    tripDate: "2026-09-08 14:20",
    paymentReference: "PENDING-DBT-BATCH-04",
    gpsTrackedDistanceKm: 38.0,
    routeComplianceScore: 97.8,
  },
  {
    id: "VPAY-004",
    tripId: "TRIP-2026-8804",
    orderId: "SMMS-ORD-2026-8804",
    allocationId: "ALLOC-2026-0084",
    vehicleId: "VEH-004",
    vehicleNumber: "CG-07-TR-4509",
    vehicleType: "Tractor-Trailer (5 MT)",
    transporterName: "Durg Gramin Tractor Seva",
    driverName: "Gendlal Nishad",
    driverMobile: "+91 97551 22340",
    bankAccountMasked: "••••••••4509",
    ifscCode: "BKID0009102",
    sourceStockyard: "Durg-Patan De-siltation Sand Depot",
    destinationAddress: "Patan Ward 3, Civil Hospital Site",
    destinationDistrict: "Durg",
    distanceKm: 12.0,
    ratePerKm: 28,
    baseCharge: 250,
    loadingAllowance: 150,
    grossAmount: 736,
    tdsDeduction: 15,
    welfareCess: 7,
    netPayableAmount: 714,
    paymentStatus: "Approved",
    tripDate: "2026-09-08 15:05",
    paymentReference: "PENDING-DBT-BATCH-04",
    gpsTrackedDistanceKm: 12.1,
    routeComplianceScore: 100.0,
  },
  {
    id: "VPAY-005",
    tripId: "TRIP-2026-8805",
    orderId: "SMMS-ORD-2026-8805",
    allocationId: "ALLOC-2026-0085",
    vehicleId: "VEH-005",
    vehicleNumber: "CG-04-MB-3390",
    vehicleType: "4-Axle Heavy (28 MT)",
    transporterName: "Mahanadi Infrastructure Haulage",
    driverName: "T. Chandrakar",
    driverMobile: "+91 98263 33901",
    bankAccountMasked: "••••••••3390",
    ifscCode: "HDFC0001092",
    sourceStockyard: "Bilaspur Arpa River Sand Hub",
    destinationAddress: "NH-130 Flyover Construction Yard",
    destinationDistrict: "Bilaspur",
    distanceKm: 52.0,
    ratePerKm: 95,
    baseCharge: 1100,
    loadingAllowance: 500,
    grossAmount: 6540,
    tdsDeduction: 131,
    welfareCess: 65,
    netPayableAmount: 6344,
    paymentStatus: "Pending Verification",
    tripDate: "2026-09-08 16:00",
    paymentReference: "UNVERIFIED-EPASS-4412",
    gpsTrackedDistanceKm: 51.7,
    routeComplianceScore: 96.5,
  },
  {
    id: "VPAY-006",
    tripId: "TRIP-2026-8806",
    orderId: "SMMS-ORD-2026-8806",
    allocationId: "ALLOC-2026-0086",
    vehicleId: "VEH-006",
    vehicleNumber: "CG-04-TC-8891",
    vehicleType: "2-Axle Tipper (10 MT)",
    transporterName: "Mahamaya Logistics Co.",
    driverName: "R. K. Verma",
    driverMobile: "+91 98264 88912",
    bankAccountMasked: "••••••••8891",
    ifscCode: "ICIC0000889",
    sourceStockyard: "Raipur Central Sand Stockyard",
    destinationAddress: "Naya Raipur Smart City Sector 24",
    destinationDistrict: "Raipur",
    distanceKm: 31.0,
    ratePerKm: 42,
    baseCharge: 450,
    loadingAllowance: 250,
    grossAmount: 2002,
    tdsDeduction: 40,
    welfareCess: 20,
    netPayableAmount: 1942,
    paymentStatus: "Paid / Settled (DBT)",
    tripDate: "2026-09-08 16:40",
    paymentReference: "DBT-CGSMMS-20260908-0419",
    utrNumber: "UTR260908441920",
    settledAt: "2026-09-08 18:00",
    gpsTrackedDistanceKm: 30.8,
    routeComplianceScore: 99.4,
  },
  {
    id: "VPAY-007",
    tripId: "TRIP-2026-8807",
    orderId: "SMMS-ORD-2026-8807",
    allocationId: "ALLOC-2026-0087",
    vehicleId: "VEH-007",
    vehicleNumber: "CG-04-TR-6510",
    vehicleType: "Tractor-Trailer (5 MT)",
    transporterName: "Kisan Rural Transport Union",
    driverName: "Dinesh Kumar",
    driverMobile: "+91 94254 65101",
    bankAccountMasked: "••••••••6510",
    ifscCode: "CBIN0281140",
    sourceStockyard: "Kharun River Reach Stockyard #2",
    destinationAddress: "Abhanpur Basti Sand Depot",
    destinationDistrict: "Raipur",
    distanceKm: 16.5,
    ratePerKm: 28,
    baseCharge: 250,
    loadingAllowance: 150,
    grossAmount: 862,
    tdsDeduction: 17,
    welfareCess: 9,
    netPayableAmount: 836,
    paymentStatus: "Pending Verification",
    tripDate: "2026-09-08 17:15",
    paymentReference: "UNVERIFIED-EPASS-4418",
    gpsTrackedDistanceKm: 16.2,
    routeComplianceScore: 98.9,
  },
];

interface TsmivVehiclePaymentSectionProps {
  vehicles: Vehicle[];
  allocations: AllocationRecord[];
  selectedDistrict: string;
}

export const TsmivVehiclePaymentSection: React.FC<TsmivVehiclePaymentSectionProps> = ({
  vehicles,
  allocations,
  selectedDistrict,
}) => {
  const [payments, setPayments] = useState<VehicleTripPayment[]>(INITIAL_VEHICLE_PAYMENTS);
  const [activeSubTab, setActiveSubTab] = useState<"summary" | "trips" | "rate-matrix" | "calculator">("summary");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All Statuses");
  const [vehicleFilter, setVehicleFilter] = useState<string>("All Vehicles");

  // Modals
  const [selectedVoucher, setSelectedVoucher] = useState<VehicleTripPayment | null>(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState<boolean>(false);
  const [isNewTripModalOpen, setIsNewTripModalOpen] = useState<boolean>(false);
  const [payoutSuccessMessage, setPayoutSuccessMessage] = useState<string | null>(null);

  // Calculator Form State
  const [calcVehicleType, setCalcVehicleType] = useState<string>("2-Axle Tipper (10 MT)");
  const [calcDistanceKm, setCalcDistanceKm] = useState<number>(25);
  const [calcVehicleNumber, setCalcVehicleNumber] = useState<string>("CG-04-TX-2341");
  const [calcTransporter, setCalcTransporter] = useState<string>("Venkat Sahu Logistics");
  const [calcSource, setCalcSource] = useState<string>("Raipur Central Sand Stockyard");
  const [calcDestination, setCalcDestination] = useState<string>("Pandri Cloth Market, Raipur");

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return payments.filter((item) => {
      const matchDistrict =
        selectedDistrict === "All Districts" ||
        item.destinationDistrict.toLowerCase() === selectedDistrict.toLowerCase();
      const matchStatus = statusFilter === "All Statuses" || item.paymentStatus === statusFilter;
      const matchVehicle = vehicleFilter === "All Vehicles" || item.vehicleNumber === vehicleFilter;
      const matchSearch =
        searchTerm === "" ||
        item.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tripId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.transporterName.toLowerCase().includes(searchTerm.toLowerCase());

      return matchDistrict && matchStatus && matchVehicle && matchSearch;
    });
  }, [payments, selectedDistrict, statusFilter, vehicleFilter, searchTerm]);

  // Vehicle-Wise Rollup Summary
  const vehicleSummaries = useMemo<VehiclePaymentSummary[]>(() => {
    const map = new Map<string, VehiclePaymentSummary>();

    // Seed map with registered vehicles
    vehicles.forEach((v) => {
      if (selectedDistrict !== "All Districts" && v.assignedDistrict !== selectedDistrict) {
        return;
      }
      map.set(v.vehicleNumber, {
        vehicleNumber: v.vehicleNumber,
        ownerName: v.ownerName || "Registered Transporter",
        vehicleType: v.vehicleType || "Commercial Tipper",
        district: v.assignedDistrict || "Raipur",
        totalTrips: 0,
        totalKmTravelled: 0,
        averageRatePerKm: 0,
        totalGrossPayable: 0,
        totalDeductions: 0,
        totalNetPayable: 0,
        paidAmount: 0,
        pendingAmount: 0,
        paymentStatus: "All Settled",
      });
    });

    // Aggregate from payment trips
    payments.forEach((p) => {
      let rec = map.get(p.vehicleNumber);
      if (!rec) {
        rec = {
          vehicleNumber: p.vehicleNumber,
          ownerName: p.transporterName,
          vehicleType: p.vehicleType,
          district: p.destinationDistrict || "Raipur",
          totalTrips: 0,
          totalKmTravelled: 0,
          averageRatePerKm: p.ratePerKm,
          totalGrossPayable: 0,
          totalDeductions: 0,
          totalNetPayable: 0,
          paidAmount: 0,
          pendingAmount: 0,
          paymentStatus: "Pending Payout",
        };
        map.set(p.vehicleNumber, rec);
      }

      rec.totalTrips += 1;
      rec.totalKmTravelled = Number((rec.totalKmTravelled + p.distanceKm).toFixed(1));
      rec.totalGrossPayable += p.grossAmount;
      rec.totalDeductions += p.tdsDeduction + p.welfareCess;
      rec.totalNetPayable += p.netPayableAmount;

      if (p.paymentStatus === "Paid / Settled (DBT)") {
        rec.paidAmount += p.netPayableAmount;
        rec.lastPayoutDate = p.settledAt || p.tripDate;
        rec.lastUtrRef = p.utrNumber;
      } else {
        rec.pendingAmount += p.netPayableAmount;
      }
    });

    // Compute status and avg rate for each
    const list: VehiclePaymentSummary[] = [];
    map.forEach((item) => {
      if (item.totalTrips > 0) {
        item.averageRatePerKm = Number(
          ((item.totalGrossPayable - item.totalTrips * 300) / (item.totalKmTravelled || 1)).toFixed(2)
        );
        if (item.averageRatePerKm <= 0) item.averageRatePerKm = 38;

        if (item.pendingAmount === 0 && item.paidAmount > 0) {
          item.paymentStatus = "All Settled";
        } else if (item.paidAmount > 0 && item.pendingAmount > 0) {
          item.paymentStatus = "Partially Settled";
        } else if (item.pendingAmount > 0) {
          item.paymentStatus = "Pending Payout";
        } else {
          item.paymentStatus = "All Settled";
        }
        list.push(item);
      }
    });

    return list.sort((a, b) => b.totalNetPayable - a.totalNetPayable);
  }, [vehicles, payments, selectedDistrict]);

  // Overall Financial KPIs
  const totalFleetKm = useMemo(() => {
    return Number(payments.reduce((acc, curr) => acc + curr.distanceKm, 0).toFixed(1));
  }, [payments]);

  const totalGrossDisbursed = useMemo(() => {
    return payments.reduce((acc, curr) => acc + curr.grossAmount, 0);
  }, [payments]);

  const totalNetSettled = useMemo(() => {
    return payments
      .filter((p) => p.paymentStatus === "Paid / Settled (DBT)")
      .reduce((acc, curr) => acc + curr.netPayableAmount, 0);
  }, [payments]);

  const totalPendingPayout = useMemo(() => {
    return payments
      .filter((p) => p.paymentStatus !== "Paid / Settled (DBT)")
      .reduce((acc, curr) => acc + curr.netPayableAmount, 0);
  }, [payments]);

  const totalTdsDeducted = useMemo(() => {
    return payments.reduce((acc, curr) => acc + curr.tdsDeduction + curr.welfareCess, 0);
  }, [payments]);

  // Action: Single DBT Payout Release
  const handleReleaseDbtPayout = (paymentId: string) => {
    const utr = `UTR${new Date().toISOString().slice(2, 10).replace(/-/g, "")}${Math.floor(
      100000 + Math.random() * 900000
    )}`;
    const now = new Date().toISOString().slice(0, 16).replace("T", " ");

    setPayments((prev) =>
      prev.map((p) =>
        p.id === paymentId
          ? {
              ...p,
              paymentStatus: "Paid / Settled (DBT)",
              utrNumber: utr,
              settledAt: now,
              paymentReference: `DBT-CGSMMS-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(
                1000 + Math.random() * 9000
              )}`,
            }
          : p
      )
    );

    setPayoutSuccessMessage(`DBT Payment of ₹${payments.find((p) => p.id === paymentId)?.netPayableAmount.toLocaleString()} successfully credited via Direct Bank Transfer (UTR: ${utr})!`);
    setTimeout(() => setPayoutSuccessMessage(null), 5000);
  };

  // Action: Bulk DBT Release for all Approved
  const handleBulkReleaseApproved = () => {
    const approvedCount = payments.filter((p) => p.paymentStatus === "Approved").length;
    if (approvedCount === 0) return;

    const now = new Date().toISOString().slice(0, 16).replace("T", " ");
    setPayments((prev) =>
      prev.map((p) => {
        if (p.paymentStatus === "Approved") {
          const utr = `UTR${new Date().toISOString().slice(2, 10).replace(/-/g, "")}${Math.floor(
            100000 + Math.random() * 900000
          )}`;
          return {
            ...p,
            paymentStatus: "Paid / Settled (DBT)",
            utrNumber: utr,
            settledAt: now,
            paymentReference: `DBT-CGSMMS-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(
              1000 + Math.random() * 9000
            )}`,
          };
        }
        return p;
      })
    );

    setPayoutSuccessMessage(`Batch DBT Payout executed! ${approvedCount} transport claims settled to bank accounts.`);
    setTimeout(() => setPayoutSuccessMessage(null), 5000);
  };

  // Action: View Voucher
  const handleOpenVoucher = (p: VehicleTripPayment) => {
    setSelectedVoucher(p);
    setIsVoucherModalOpen(true);
  };

  // Action: Calculator / Add Simulated Trip
  const calculatedValues = useMemo(() => {
    const rateInfo = TSMIV_RATE_MATRIX[calcVehicleType] || {
      baseFare: 450,
      perKmRate: 42,
      minKm: 5,
      loadingAllowance: 250,
    };
    const distanceCharge = Math.max(calcDistanceKm, rateInfo.minKm) * rateInfo.perKmRate;
    const gross = rateInfo.baseFare + distanceCharge + rateInfo.loadingAllowance;
    const tds = Math.round(gross * 0.02);
    const welfare = Math.round(gross * 0.01);
    const net = gross - tds - welfare;

    return {
      baseFare: rateInfo.baseFare,
      perKmRate: rateInfo.perKmRate,
      distanceCharge,
      loadingAllowance: rateInfo.loadingAllowance,
      gross,
      tds,
      welfare,
      net,
    };
  }, [calcVehicleType, calcDistanceKm]);

  const handleAddNewSimulatedTrip = () => {
    const newId = `VPAY-00${payments.length + 1}`;
    const newTripId = `TRIP-2026-${8800 + payments.length + 1}`;
    const newOrderId = `SMMS-ORD-2026-${8800 + payments.length + 1}`;
    const now = new Date().toISOString().slice(0, 16).replace("T", " ");

    const newPayment: VehicleTripPayment = {
      id: newId,
      tripId: newTripId,
      orderId: newOrderId,
      vehicleId: "VEH-SIM",
      vehicleNumber: calcVehicleNumber,
      vehicleType: calcVehicleType,
      transporterName: calcTransporter,
      driverName: "Assigned Driver",
      driverMobile: "+91 98260 00000",
      bankAccountMasked: "••••••••1100",
      ifscCode: "SBIN0001234",
      sourceStockyard: calcSource,
      destinationAddress: calcDestination,
      destinationDistrict: selectedDistrict === "All Districts" ? "Raipur" : selectedDistrict,
      distanceKm: calcDistanceKm,
      ratePerKm: calculatedValues.perKmRate,
      baseCharge: calculatedValues.baseFare,
      loadingAllowance: calculatedValues.loadingAllowance,
      grossAmount: calculatedValues.gross,
      tdsDeduction: calculatedValues.tds,
      welfareCess: calculatedValues.welfare,
      netPayableAmount: calculatedValues.net,
      paymentStatus: "Approved",
      tripDate: now,
      paymentReference: "PENDING-DBT-NEW",
      gpsTrackedDistanceKm: calcDistanceKm,
      routeComplianceScore: 99.5,
    };

    setPayments((prev) => [newPayment, ...prev]);
    setIsNewTripModalOpen(false);
    setActiveSubTab("trips");
    setPayoutSuccessMessage(`New trip ${newTripId} logged with ${calcDistanceKm} KM and ₹${calculatedValues.net.toLocaleString()} transport payment added!`);
    setTimeout(() => setPayoutSuccessMessage(null), 5000);
  };

  // Sub-Tabs Configuration
  const paymentSubTabsConfig = useMemo(
    () => [
      {
        key: "summary",
        label: `Vehicle Summary (${vehicleSummaries.length})`,
        icon: Truck,
      },
      {
        key: "trips",
        label: `Trip Payment Ledger (${filteredPayments.length})`,
        icon: Receipt,
      },
      {
        key: "rate-matrix",
        label: "Statutory Tariff Matrix",
        icon: SlidersHorizontal,
      },
      {
        key: "calculator",
        label: "Distance & Rate Calculator",
        icon: Sparkles,
      },
    ],
    [vehicleSummaries.length, filteredPayments.length]
  );

  return (
    <div className="space-y-6">
      {/* Payout Success Toast Notification */}
      {payoutSuccessMessage && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCheck size={18} className="text-emerald-200 shrink-0" />
            <span>{payoutSuccessMessage}</span>
          </div>
          <button
            onClick={() => setPayoutSuccessMessage(null)}
            className="text-emerald-200 hover:text-white text-xs font-bold px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Module Overview Header Card (Matching Portal Theme) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 text-slate-900 dark:text-white shadow-2xs border border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-semibold rounded-full border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1.5 shadow-2xs">
                <CreditCard size={14} className="text-emerald-600 dark:text-emerald-400" />
                TSMIV Automated Vehicle Payout Engine
              </span>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 text-xs font-semibold rounded-full border border-blue-200 dark:border-blue-800/60 flex items-center gap-1.5 shadow-2xs">
                <Navigation size={14} className="text-blue-600 dark:text-blue-400" />
                AIS-140 GPS Distance Certified
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Vehicle-Wise Transport Payment & Per-KM Tariff Settlement
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm leading-relaxed">
              Transparent per-KM calculation and direct bank payout (DBT) to registered vehicle owners and tractor operators. Calculates dynamic transport tariff based on GPS odometer verification, statutory vehicle category rates, and automatic TDS tax deduction.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Button
              variant="primary"
              onClick={handleBulkReleaseApproved}
              icon={<CheckCheck size={16} />}
              className="font-semibold px-5 py-2.5 shadow-xs"
            >
              Release Approved DBT Batch
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsNewTripModalOpen(true)}
              icon={<PlusCircle size={16} />}
              className="text-xs"
            >
              Simulate Trip Payment
            </Button>
          </div>
        </div>

        {/* 5 Financial Summary Metric Cards */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 md:grid-cols-5 gap-3.5">
          <Card className="p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Total Fleet Distance</span>
              <Gauge size={16} className="text-blue-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{totalFleetKm.toLocaleString()}</span>
              <span className="text-xs font-semibold text-slate-500">KM</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Across {payments.length} dispatched trips</div>
          </Card>

          <Card className="p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Total Gross Tariff</span>
              <IndianRupee size={16} className="text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">₹{totalGrossDisbursed.toLocaleString()}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Statutory per-KM tariff</div>
          </Card>

          <Card className="p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Direct DBT Settled</span>
              <CheckCircle2 size={16} className="text-teal-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-teal-600 dark:text-teal-400">₹{totalNetSettled.toLocaleString()}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Credited to Transporter Bank</div>
          </Card>

          <Card className="p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Pending Payout</span>
              <Clock size={16} className="text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">₹{totalPendingPayout.toLocaleString()}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Awaiting Treasury Disbursal</div>
          </Card>

          <Card className="p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs col-span-2 md:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Tax Deductions</span>
              <ShieldCheck size={16} className="text-purple-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-purple-600 dark:text-purple-400">₹{totalTdsDeducted.toLocaleString()}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">2% Sec 194C + 1% Cess</div>
          </Card>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="overflow-x-auto pb-1 lg:pb-0">
          <Tabs
            tabs={paymentSubTabsConfig}
            activeTab={activeSubTab}
            onChange={(key) => setActiveSubTab(key as any)}
          />
        </div>

        {/* Global Search and Filters */}
        <div className="flex items-center gap-2.5 self-start lg:self-auto shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search vehicle, driver, trip..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs pl-8 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-2xs w-48 sm:w-56"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-2xs"
          >
            <option value="All Statuses">All Statuses</option>
            <option value="Paid / Settled (DBT)">Paid / Settled (DBT)</option>
            <option value="Approved">Approved for Payout</option>
            <option value="Pending Verification">Pending Verification</option>
          </select>
        </div>
      </div>

      {/* ── SUB-TAB 1: VEHICLE-WISE ROLLUP PAYMENT SUMMARY ── */}
      {activeSubTab === "summary" && (
        <div className="space-y-4">
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-emerald-900 dark:text-emerald-200">
              <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold">Vehicle-Wise Cumulative Settlement:</span> Aggregate overview of completed delivery trips, total KM distance tracked via GPS, cumulative earnings, and bank settlement status for each registered haulier and tractor.
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const printWindow = window.open("", "_blank");
                if (printWindow) {
                  printWindow.document.write(`
                    <html><head><title>Vehicle-Wise Payment Summary</title>
                    <style>body{font-family:sans-serif;padding:20px;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ccc;padding:8px;font-size:12px;text-align:left;} th{background:#f4f4f4;}</style>
                    </head><body>
                    <h2>Government of Chhattisgarh - Mineral Resources Department</h2>
                    <h3>TSMIV Vehicle Transport Payment Summary • ${selectedDistrict}</h3>
                    <table><thead><tr><th>Vehicle No</th><th>Owner/Transporter</th><th>Type</th><th>Trips</th><th>Total KM</th><th>Gross (₹)</th><th>Net Payable (₹)</th><th>Settled (₹)</th><th>Pending (₹)</th><th>Status</th></tr></thead>
                    <tbody>${vehicleSummaries.map(s => `<tr><td>${s.vehicleNumber}</td><td>${s.ownerName}</td><td>${s.vehicleType}</td><td>${s.totalTrips}</td><td>${s.totalKmTravelled} KM</td><td>₹${s.totalGrossPayable}</td><td>₹${s.totalNetPayable}</td><td>₹${s.paidAmount}</td><td>₹${s.pendingAmount}</td><td>${s.paymentStatus}</td></tr>`).join("")}</tbody></table>
                    </body></html>
                  `);
                  printWindow.document.close();
                  printWindow.print();
                }
              }}
              icon={<Printer size={14} />}
              className="shrink-0 bg-white dark:bg-slate-800 text-xs font-semibold"
            >
              Export Summary
            </Button>
          </div>

          <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Vehicle & Owner</th>
                  <th className="py-3 px-4">Vehicle Type & District</th>
                  <th className="py-3 px-4 text-center">Completed Trips</th>
                  <th className="py-3 px-4 text-center">Total Distance (KM)</th>
                  <th className="py-3 px-4">Gross Payable (₹)</th>
                  <th className="py-3 px-4">Net Payable (₹)</th>
                  <th className="py-3 px-4">Settled DBT (₹)</th>
                  <th className="py-3 px-4">Pending (₹)</th>
                  <th className="py-3 px-4">Payment Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                {vehicleSummaries.map((summary) => (
                  <tr key={summary.vehicleNumber} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Truck size={14} className="text-blue-500" />
                        {summary.vehicleNumber}
                      </div>
                      <div className="text-[11px] text-slate-500">{summary.ownerName}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{summary.vehicleType}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <MapPin size={11} className="text-rose-500" /> {summary.district}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-full text-xs">
                        {summary.totalTrips} Trips
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-1">
                        <Gauge size={13} />
                        {summary.totalKmTravelled} KM
                      </div>
                      <div className="text-[10px] text-slate-400">Avg {summary.totalTrips > 0 ? (summary.totalKmTravelled / summary.totalTrips).toFixed(1) : 0} KM/trip</div>
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                      ₹{summary.totalGrossPayable.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 font-black text-emerald-600 dark:text-emerald-400">
                      ₹{summary.totalNetPayable.toLocaleString()}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-teal-600 dark:text-teal-400">₹{summary.paidAmount.toLocaleString()}</div>
                      {summary.lastUtrRef && (
                        <div className="text-[9px] text-slate-400 font-mono">Last UTR: {summary.lastUtrRef.slice(-6)}</div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className={`font-bold ${summary.pendingAmount > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-400"}`}>
                        ₹{summary.pendingAmount.toLocaleString()}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {summary.paymentStatus === "All Settled" ? (
                        <Badge variant="success">All Settled</Badge>
                      ) : summary.paymentStatus === "Partially Settled" ? (
                        <Badge variant="info">Partially Settled</Badge>
                      ) : (
                        <Badge variant="warning">Pending Payout</Badge>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => {
                            setSearchTerm(summary.vehicleNumber);
                            setActiveSubTab("trips");
                          }}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          View Trips
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── SUB-TAB 2: DETAILED TRIP PAYMENT LEDGER ── */}
      {activeSubTab === "trips" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 dark:text-slate-300">Trip Payment Ledger:</span>
              <span className="text-slate-500">Showing {filteredPayments.length} trip transaction records</span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
                className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-200 focus:outline-none"
              >
                <option value="All Vehicles">All Vehicles</option>
                {Array.from(new Set(payments.map((p) => p.vehicleNumber))).map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>

              <Button
                variant="outline"
                size="xs"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("All Statuses");
                  setVehicleFilter("All Vehicles");
                }}
                icon={<RefreshCw size={12} />}
                className="text-xs font-semibold"
              >
                Reset
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Trip & Order ID</th>
                  <th className="py-3 px-4">Vehicle & Driver</th>
                  <th className="py-3 px-4">Trip Route & Stockyard</th>
                  <th className="py-3 px-4 text-center">Distance (KM)</th>
                  <th className="py-3 px-4 text-center">Rate / KM</th>
                  <th className="py-3 px-4">Base & Allowances</th>
                  <th className="py-3 px-4">Gross Tariff</th>
                  <th className="py-3 px-4">TDS & Cess</th>
                  <th className="py-3 px-4">Net Payable (₹)</th>
                  <th className="py-3 px-4">Payment Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                {filteredPayments.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white font-mono">{item.tripId}</div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400">{item.orderId}</div>
                      <div className="text-[10px] text-slate-400">{item.tripDate}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        <Truck size={13} className="text-blue-500" />
                        {item.vehicleNumber}
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300">{item.driverName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{item.transporterName}</div>
                    </td>

                    <td className="py-3 px-4 max-w-[200px]">
                      <div className="font-semibold text-slate-900 dark:text-white truncate" title={item.sourceStockyard}>
                        {item.sourceStockyard}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 truncate" title={item.destinationAddress}>
                        <ArrowUpRight size={11} className="text-rose-500 shrink-0" />
                        {item.destinationAddress}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-extrabold rounded-md text-xs border border-indigo-200 dark:border-indigo-800">
                        {item.distanceKm} KM
                      </span>
                      {item.routeComplianceScore && (
                        <div className="text-[9px] text-emerald-600 font-bold mt-0.5">
                          {item.routeComplianceScore}% GPS match
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-slate-800 dark:text-slate-200">₹{item.ratePerKm}/KM</span>
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-[11px]">
                      <div>Base: ₹{item.baseCharge}</div>
                      <div>Allowance: ₹{item.loadingAllowance}</div>
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      ₹{item.grossAmount.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-rose-600 dark:text-rose-400 text-[11px]">
                      -₹{(item.tdsDeduction + item.welfareCess).toLocaleString()}
                      <div className="text-[9px] text-slate-400">(TDS ₹{item.tdsDeduction} + Cess ₹{item.welfareCess})</div>
                    </td>

                    <td className="py-3 px-4 font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      ₹{item.netPayableAmount.toLocaleString()}
                    </td>

                    <td className="py-3 px-4">
                      {item.paymentStatus === "Paid / Settled (DBT)" ? (
                        <div>
                          <Badge variant="success">Paid (DBT)</Badge>
                          <div className="text-[9px] text-slate-400 font-mono mt-0.5">{item.utrNumber}</div>
                        </div>
                      ) : item.paymentStatus === "Approved" ? (
                        <Badge variant="info">Approved</Badge>
                      ) : (
                        <Badge variant="warning">Pending Verification</Badge>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleOpenVoucher(item)}
                          icon={<Eye size={12} />}
                          className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                        >
                          Voucher
                        </Button>

                        {item.paymentStatus !== "Paid / Settled (DBT)" && (
                          <Button
                            variant="primary"
                            size="xs"
                            onClick={() => handleReleaseDbtPayout(item.id)}
                            icon={<CreditCard size={12} />}
                            className="text-xs font-bold"
                          >
                            Pay DBT
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── SUB-TAB 3: STATUTORY PER-KM TARIFF MATRIX ── */}
      {activeSubTab === "rate-matrix" && (
        <div className="space-y-4">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-emerald-600" />
              Statutory Gazette Rate Structure for Mineral Logistics
            </h3>
            <p>
              Under the State Sand Mining and Transportation Rules, vehicle haulage payments are computed strictly by approved vehicle classification rates per kilometer. Overloading is strictly prohibited and disqualified from tariff claim.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(TSMIV_RATE_MATRIX).map(([vehicleType, rate]) => (
              <Card key={vehicleType} className="p-5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">{vehicleType}</span>
                  <Truck size={18} className="text-emerald-600" />
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold uppercase tracking-wider">Applicable Per-KM Tariff</div>
                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                    ₹{rate.perKmRate}<span className="text-xs font-normal"> / KM</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-700">
                  <div className="flex justify-between pt-1 text-slate-600 dark:text-slate-300">
                    <span>Base Fare / Flag Down:</span>
                    <span className="font-bold text-slate-900 dark:text-white">₹{rate.baseFare}</span>
                  </div>
                  <div className="flex justify-between pt-1 text-slate-600 dark:text-slate-300">
                    <span>Min Distance Billed:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{rate.minKm} KM</span>
                  </div>
                  <div className="flex justify-between pt-1 text-slate-600 dark:text-slate-300">
                    <span>Loading Allowance:</span>
                    <span className="font-bold text-slate-900 dark:text-white">₹{rate.loadingAllowance}</span>
                  </div>
                  <div className="flex justify-between pt-1 text-slate-600 dark:text-slate-300">
                    <span>Statutory TDS Deduction:</span>
                    <span className="font-bold text-rose-600">2% Sec 194C</span>
                  </div>
                  <div className="flex justify-between pt-1 text-slate-600 dark:text-slate-300">
                    <span>Mining Welfare Cess:</span>
                    <span className="font-bold text-rose-600">1% Cess</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCalcVehicleType(vehicleType);
                    setActiveSubTab("calculator");
                  }}
                  icon={<Sparkles size={13} />}
                  className="w-full text-xs font-bold text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                >
                  Test in Calculator
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── SUB-TAB 4: LIVE DISTANCE & RATE CALCULATOR ── */}
      {activeSubTab === "calculator" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles size={18} className="text-emerald-600" />
              Interactive TSMIV Transport Payment Calculator
            </h3>
            <p className="text-xs text-slate-500">
              Select vehicle tier, enter the GPS trip distance in kilometers, and test the dynamic payment breakdown before releasing DBT funds.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Vehicle Category & Payload</label>
                <select
                  value={calcVehicleType}
                  onChange={(e) => setCalcVehicleType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500"
                >
                  {Object.keys(TSMIV_RATE_MATRIX).map((v) => (
                    <option key={v} value={v}>
                      {v} (₹{TSMIV_RATE_MATRIX[v].perKmRate}/KM)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>GPS Tracked Distance (KM)</span>
                  <span className="text-emerald-600 font-extrabold">{calcDistanceKm} KM</span>
                </label>
                <input
                  type="range"
                  min="2"
                  max="120"
                  step="0.5"
                  value={calcDistanceKm}
                  onChange={(e) => setCalcDistanceKm(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Min: 2 KM</span>
                  <span>50 KM</span>
                  <span>Max: 120 KM</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Vehicle Number</label>
                <input
                  type="text"
                  value={calcVehicleNumber}
                  onChange={(e) => setCalcVehicleNumber(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Transporter / Fleet Owner</label>
                <input
                  type="text"
                  value={calcTransporter}
                  onChange={(e) => setCalcTransporter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Source Stockyard</label>
                <input
                  type="text"
                  value={calcSource}
                  onChange={(e) => setCalcSource(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Delivery Destination</label>
                <input
                  type="text"
                  value={calcDestination}
                  onChange={(e) => setCalcDestination(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-3">
              <Button
                variant="primary"
                onClick={handleAddNewSimulatedTrip}
                icon={<PlusCircle size={15} />}
                className="font-semibold text-xs"
              >
                Add Trip & Save to Ledger
              </Button>
            </div>
          </div>

          {/* Calculator Output Bill Card (Clean Theme Card) */}
          <Card className="p-5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs space-y-4 self-start">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="font-bold text-xs text-slate-900 dark:text-white">Payment Breakdown Estimation</div>
              <Badge variant="success">TSMIV Compliant</Badge>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Base Charge:</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{calculatedValues.baseFare}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Distance Charge ({calcDistanceKm} KM × ₹{calculatedValues.perKmRate}):</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{calculatedValues.distanceCharge.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Loading / Unloading Allowance:</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{calculatedValues.loadingAllowance}</span>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between font-bold text-slate-800 dark:text-slate-200">
                <span>Gross Transport Tariff:</span>
                <span className="text-emerald-600 dark:text-emerald-400">₹{calculatedValues.gross.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-rose-600 dark:text-rose-400 text-[11px]">
                <span>- Statutory TDS (2% Sec 194C):</span>
                <span>-₹{calculatedValues.tds}</span>
              </div>
              <div className="flex justify-between text-rose-600 dark:text-rose-400 text-[11px]">
                <span>- Labor Welfare Cess (1%):</span>
                <span>-₹{calculatedValues.welfare}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">Net Payable Amount:</span>
                <span className="font-black text-2xl text-emerald-600 dark:text-emerald-400">
                  ₹{calculatedValues.net.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
              <div className="font-semibold text-slate-900 dark:text-white">Direct Benefit Transfer (DBT):</div>
              <p>Credited within 24 hours of digital POD & Weighbridge slip closing.</p>
            </div>
          </Card>
        </div>
      )}

      {/* ── MODAL: OFFICIAL TSMIV PAYMENT VOUCHER / SLIP ── */}
      <Modal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
        title="Official State Mineral Transport Payment Voucher"
        size="lg"
      >
        {selectedVoucher && (
          <div className="space-y-4 text-xs font-sans">
            {/* Header */}
            <div className="text-center pb-3 border-b border-slate-200 dark:border-slate-700 space-y-1">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Government of Chhattisgarh</div>
              <div className="text-base font-extrabold text-slate-900 dark:text-white">Directorate of Geology & Mining</div>
              <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                TSMIV Vehicle Transport Tariff Voucher (Direct Bank Transfer)
              </div>
            </div>

            {/* Voucher Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Voucher ID</span>
                <div className="font-bold text-slate-900 dark:text-white font-mono">{selectedVoucher.id}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Trip ID</span>
                <div className="font-bold text-emerald-600 font-mono">{selectedVoucher.tripId}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Booking Order</span>
                <div className="font-bold text-slate-900 dark:text-white font-mono">{selectedVoucher.orderId}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Trip Date</span>
                <div className="font-semibold text-slate-800 dark:text-slate-200">{selectedVoucher.tripDate}</div>
              </div>
            </div>

            {/* Vehicle & Beneficiary Details */}
            <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="font-bold text-slate-800 dark:text-white text-xs border-b border-slate-100 dark:border-slate-700 pb-1.5 flex items-center gap-1.5">
                <Truck size={14} className="text-blue-500" />
                Vehicle & Transporter DBT Beneficiary
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Vehicle Number</span>
                  <div className="font-extrabold text-slate-900 dark:text-white">{selectedVoucher.vehicleNumber}</div>
                  <div className="text-[10px] text-slate-500">{selectedVoucher.vehicleType}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Beneficiary / Owner</span>
                  <div className="font-bold text-slate-900 dark:text-white">{selectedVoucher.transporterName}</div>
                  <div className="text-[10px] text-slate-500">{selectedVoucher.driverName} ({selectedVoucher.driverMobile})</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Bank Account (DBT)</span>
                  <div className="font-mono font-bold text-slate-900 dark:text-white">{selectedVoucher.bankAccountMasked}</div>
                  <div className="text-[10px] text-slate-500">IFSC: {selectedVoucher.ifscCode}</div>
                </div>
              </div>
            </div>

            {/* Route & Distance Analysis */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="font-bold text-slate-800 dark:text-white text-xs flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Navigation size={14} className="text-indigo-500" />
                  Route & Distance Verification
                </span>
                <Badge variant="success">{selectedVoucher.routeComplianceScore || 99}% GPS Geofence Compliant</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Loading Stockyard</span>
                  <div className="font-semibold text-slate-900 dark:text-white">{selectedVoucher.sourceStockyard}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Delivery Address</span>
                  <div className="font-semibold text-slate-900 dark:text-white">{selectedVoucher.destinationAddress}</div>
                </div>
              </div>
            </div>

            {/* Financial Computation Table */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="py-2.5 px-3">Tariff Component</th>
                    <th className="py-2.5 px-3">Calculation Basis</th>
                    <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  <tr>
                    <td className="py-2 px-3">Base Haulage Fare</td>
                    <td className="py-2 px-3 text-slate-500">Statutory flag down charge</td>
                    <td className="py-2 px-3 text-right font-bold">₹{selectedVoucher.baseCharge}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">Distance Tariff</td>
                    <td className="py-2 px-3 text-slate-500">
                      {selectedVoucher.distanceKm} KM @ ₹{selectedVoucher.ratePerKm}/KM
                    </td>
                    <td className="py-2 px-3 text-right font-bold">
                      ₹{(selectedVoucher.distanceKm * selectedVoucher.ratePerKm).toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">Loading & Transit Allowance</td>
                    <td className="py-2 px-3 text-slate-500">Fixed statutory depot allowance</td>
                    <td className="py-2 px-3 text-right font-bold">₹{selectedVoucher.loadingAllowance}</td>
                  </tr>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 font-bold">
                    <td className="py-2 px-3 text-slate-900 dark:text-white">Gross Transport Charge</td>
                    <td className="py-2 px-3 text-slate-500">Before statutory deductions</td>
                    <td className="py-2 px-3 text-right text-slate-900 dark:text-white">
                      ₹{selectedVoucher.grossAmount.toLocaleString()}
                    </td>
                  </tr>
                  <tr className="text-rose-600 dark:text-rose-400 text-[11px]">
                    <td className="py-1.5 px-3">TDS Deduction (Sec 194C)</td>
                    <td className="py-1.5 px-3">2% of Gross</td>
                    <td className="py-1.5 px-3 text-right">-₹{selectedVoucher.tdsDeduction}</td>
                  </tr>
                  <tr className="text-rose-600 dark:text-rose-400 text-[11px]">
                    <td className="py-1.5 px-3">Mining Welfare Cess</td>
                    <td className="py-1.5 px-3">1% of Gross</td>
                    <td className="py-1.5 px-3 text-right">-₹{selectedVoucher.welfareCess}</td>
                  </tr>
                  <tr className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-black text-sm">
                    <td className="py-2.5 px-3">Total Net Payable (DBT)</td>
                    <td className="py-2.5 px-3 text-xs font-normal">Direct Bank Transfer</td>
                    <td className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400">
                      ₹{selectedVoucher.netPayableAmount.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* DBT Settlement Info */}
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-300 dark:border-emerald-800 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-emerald-900 dark:text-emerald-200">Payment Status: </span>
                <span className="font-extrabold text-emerald-700 dark:text-emerald-300">{selectedVoucher.paymentStatus}</span>
                {selectedVoucher.utrNumber && (
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    UTR No: {selectedVoucher.utrNumber} • Settled on {selectedVoucher.settledAt}
                  </div>
                )}
              </div>
              <ShieldCheck size={24} className="text-emerald-600" />
            </div>

            <ModalFooter>
              <Button variant="outline" onClick={() => setIsVoucherModalOpen(false)}>
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => window.print()}
                icon={<Printer size={14} />}
                className="font-bold"
              >
                Print Voucher
              </Button>
            </ModalFooter>
          </div>
        )}
      </Modal>
    </div>
  );
};
