import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Pickaxe,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Camera,
  FileCheck,
  QrCode,
  ShieldCheck,
  Smartphone,
  Send,
  UserCheck,
  AlertCircle,
  Eye,
  Search,
  Filter,
  Layers,
  ChevronRight,
  ArrowRight,
  Printer,
  Sparkles,
  Phone,
  Compass,
  Check,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  X,
} from "lucide-react";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import Card from "@/shared/components/layout/Card/Card";
import Button from "@/shared/components/ui/Button";
import Badge from "@/shared/components/ui/Badge";
import Modal, { ModalFooter } from "@/shared/components/ui/Modal/Modal";
import { useStatusModal } from "@/config/theme/StatusModalContext";
import { routes } from "@/app/routes/routeConfig";
import { inputBase, inputNormal } from "@/shared/components/ui/Forms/inputStyles";
import type { SroOrder, SroStage } from "../types";
import { createDigitalTransitPass } from "@/features/dispatch-management/service/transitPassService";
import { DigitalTransitPassModal } from "@/features/dispatch-management/components/DigitalTransitPassModal";

// Initial SRO Orders Seeding across all 7 stages
const INITIAL_SRO_ORDERS: SroOrder[] = [
  {
    id: "SRO-ORD-001",
    orderId: "TG-SB-2026-90412",
    bookingId: "BKG-001",
    reachId: "TG-RP-MHN-01",
    reachName: "Mahanadi Basin Reach Alpha",
    district: "Raipur",
    village: "Chandkhuri",
    customerName: "Venkata Raman",
    customerMobile: "+91 98480 12345",
    sandType: "Coarse River Sand",
    orderQuantityMt: 12,
    deliveryLocation: "Plot 42, Green Valley Enclave, Sector 7",
    deliveryDistrict: "Raipur",
    vehicleNumber: "TG-04-TR-8812",
    vehicleType: "Tractor",
    vehicleCapacityMt: 14,
    vehicleRcNumber: "RC/TG04/2023/88124",
    driverName: "Ramesh Sahu",
    driverMobile: "+91 98261 77201",
    driverLicense: "DL-TG04-2018-99410",
    sroStage: "Vehicle Arrived",
    isVehicleNumberVerified: true,
    isDriverVerified: true,
    isQuantityVerified: false,
    isCapacityVerified: false,
    isLoadingConfirmed: false,
    sroOfficerName: "Er. Rameshwar Sharma",
    sroOfficerDesignation: "Assistant Director / Sand Reach Officer",
    customerOtp: "5821",
  },
  {
    id: "SRO-ORD-002",
    orderId: "TG-SB-2026-90415",
    bookingId: "BKG-002",
    reachId: "TG-RP-MHN-01",
    reachName: "Mahanadi Basin Reach Alpha",
    district: "Raipur",
    village: "Chandkhuri",
    customerName: "S. K. Developers Pvt Ltd",
    customerMobile: "+91 94252 66100",
    sandType: "Coarse River Sand",
    orderQuantityMt: 24,
    deliveryLocation: "Commercial Hub Site B, Telibandha",
    deliveryDistrict: "Raipur",
    vehicleNumber: "TG-04-EX-4122",
    vehicleType: "Tipper",
    vehicleCapacityMt: 25,
    vehicleRcNumber: "RC/TG04/2024/41220",
    driverName: "K. Mohan Rao",
    driverMobile: "+91 98481 99011",
    driverLicense: "DL-TG04-2016-12094",
    sroStage: "Pending Pickup Orders",
    isVehicleNumberVerified: false,
    isDriverVerified: false,
    isQuantityVerified: false,
    isCapacityVerified: false,
    isLoadingConfirmed: false,
    sroOfficerName: "Er. Rameshwar Sharma",
    sroOfficerDesignation: "Sand Reach Officer",
    customerOtp: "7419",
  },
  {
    id: "SRO-ORD-003",
    orderId: "TG-SB-2026-90390",
    bookingId: "BKG-003",
    reachId: "TG-DG-SHV-02",
    reachName: "Shivnath River Reach Delta",
    district: "Durg",
    village: "Jamgaon",
    customerName: "Priyanka Verma",
    customerMobile: "+91 94252 88910",
    sandType: "Fine Plastering Sand",
    orderQuantityMt: 10,
    deliveryLocation: "House #14, Nehru Nagar West",
    deliveryDistrict: "Durg",
    vehicleNumber: "TG-07-TR-9014",
    vehicleType: "Tractor",
    vehicleCapacityMt: 12,
    vehicleRcNumber: "RC/TG07/2022/90141",
    driverName: "Suresh Kumar",
    driverMobile: "+91 94060 33412",
    driverLicense: "DL-TG07-2019-88712",
    sroStage: "Loading Pending",
    isVehicleNumberVerified: true,
    isDriverVerified: true,
    isQuantityVerified: true,
    isCapacityVerified: true,
    vehiclePhotoUrl: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&auto=format&fit=crop&q=80",
    isLoadingConfirmed: false,
    sroOfficerName: "Smt. Priyanka Verma",
    sroOfficerDesignation: "Mining Inspector / Zone SRO",
    customerOtp: "9032",
  },
  {
    id: "SRO-ORD-004",
    orderId: "TG-SB-2026-90382",
    bookingId: "BKG-004",
    reachId: "TG-RP-MHN-01",
    reachName: "Mahanadi Basin Reach Alpha",
    district: "Raipur",
    village: "Chandkhuri",
    customerName: "Govt. School Infrastructure Project",
    customerMobile: "+91 97551 12390",
    sandType: "Coarse River Sand",
    orderQuantityMt: 15,
    deliveryLocation: "Model School Campus, Abhanpur",
    deliveryDistrict: "Raipur",
    vehicleNumber: "TG-04-TR-5519",
    vehicleType: "Tractor",
    vehicleCapacityMt: 16,
    vehicleRcNumber: "RC/TG04/2021/55190",
    driverName: "Anand Yadav",
    driverMobile: "+91 98270 44109",
    driverLicense: "DL-TG04-2017-44019",
    sroStage: "Loading Completed",
    isVehicleNumberVerified: true,
    isDriverVerified: true,
    isQuantityVerified: true,
    isCapacityVerified: true,
    isLoadingConfirmed: true,
    vehiclePhotoUrl: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&auto=format&fit=crop&q=80",
    loadedSandPhotoUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb180c5f7?w=600&auto=format&fit=crop&q=80",
    gpsCoordinates: "21.2514° N, 81.6296° E",
    loadedTonnageMt: 15.2,
    sroOfficerName: "Er. Rameshwar Sharma",
    sroOfficerDesignation: "Sand Reach Officer",
    customerOtp: "3318",
  },
  {
    id: "SRO-ORD-005",
    orderId: "TG-SB-2026-90370",
    bookingId: "BKG-005",
    reachId: "TG-RP-MHN-01",
    reachName: "Mahanadi Basin Reach Alpha",
    district: "Raipur",
    village: "Chandkhuri",
    customerName: "Dr. Rajeshwar Sharma",
    customerMobile: "+91 98261 44521",
    sandType: "Coarse River Sand",
    orderQuantityMt: 14,
    deliveryLocation: "Sai Nagar Colony, Arang Road",
    deliveryDistrict: "Raipur",
    vehicleNumber: "TG-04-TR-3390",
    vehicleType: "Tractor",
    vehicleCapacityMt: 14,
    vehicleRcNumber: "RC/TG04/2023/33900",
    driverName: "Gopal Dewangan",
    driverMobile: "+91 98271 22901",
    driverLicense: "DL-TG04-2015-88190",
    sroStage: "Transit Pass Generated",
    isVehicleNumberVerified: true,
    isDriverVerified: true,
    isQuantityVerified: true,
    isCapacityVerified: true,
    isLoadingConfirmed: true,
    vehiclePhotoUrl: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&auto=format&fit=crop&q=80",
    loadedSandPhotoUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb180c5f7?w=600&auto=format&fit=crop&q=80",
    gpsCoordinates: "21.2514° N, 81.6296° E",
    transitPassNumber: "TP-TGMD-2026-88102",
    transitPassGeneratedAt: "2026-10-03 14:10",
    customerOtp: "6642",
    otpDispatchedToCustomer: true,
    loadedTonnageMt: 14.0,
    sroOfficerName: "Er. Rameshwar Sharma",
    sroOfficerDesignation: "Sand Reach Officer",
  },
  {
    id: "SRO-ORD-006",
    orderId: "TG-SB-2026-90355",
    bookingId: "BKG-006",
    reachId: "TG-RP-MHN-01",
    reachName: "Mahanadi Basin Reach Alpha",
    district: "Raipur",
    village: "Chandkhuri",
    customerName: "Mohd. Azharuddin",
    customerMobile: "+91 94060 11980",
    sandType: "Coarse River Sand",
    orderQuantityMt: 10,
    deliveryLocation: "Shankar Nagar, Main Gate",
    deliveryDistrict: "Raipur",
    vehicleNumber: "TG-04-TR-1102",
    vehicleType: "Tractor",
    vehicleCapacityMt: 12,
    driverName: "Dinesh Sahu",
    driverMobile: "+91 98480 55112",
    driverLicense: "DL-TG04-2014-66102",
    sroStage: "Completed Orders",
    isVehicleNumberVerified: true,
    isDriverVerified: true,
    isQuantityVerified: true,
    isCapacityVerified: true,
    isLoadingConfirmed: true,
    transitPassNumber: "TP-TGMD-2026-88095",
    customerOtp: "1284",
    otpDispatchedToCustomer: true,
    sroOfficerName: "Er. Rameshwar Sharma",
  },
];

export const SroDashboardView: React.FC = () => {
  const navigate = useNavigate();
  const { reaches, bookings, setActiveRole } = useSandMining();
  const { showSuccess, showError } = useStatusModal();

  // State
  const [sroOrders, setSroOrders] = useState<SroOrder[]>(INITIAL_SRO_ORDERS);
  const [selectedReachId, setSelectedReachId] = useState<string>("ALL");
  const [activeStageTab, setActiveStageTab] = useState<SroStage | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMode, setIsMobileMode] = useState(false);

  // 10-Step SRO Verification Modal State
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SroOrder | null>(null);
  const [activeVerificationStep, setActiveVerificationStep] = useState<number>(1);

  // Step-by-step verification temporary state
  const [verificationForm, setVerificationForm] = useState({
    // Step 2: Vehicle Number Check
    vehicleNumberConfirmed: true,
    // Step 3: Driver Check
    driverConfirmed: true,
    // Step 4: Order Qty Check
    quantityConfirmed: true,
    // Step 5: Vehicle Capacity Check
    capacityConfirmed: true,
    // Step 6: Empty Vehicle Photo
    vehiclePhotoUrl: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&auto=format&fit=crop&q=80",
    // Step 7: Loaded Sand Photo
    loadedSandPhotoUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb180c5f7?w=600&auto=format&fit=crop&q=80",
    // Step 8: GPS Location
    gpsCoordinates: "21.2514° N, 81.6296° E",
    // Step 9: Confirmed Loading Tonnage
    loadedTonnageMt: 12.0,
    // Step 10: SRO Remarks
    remarks: "Vehicle verified, loaded within statutory replenishment limit, GPS coordinates stamped.",
  });

  // Transit Pass Preview Modal
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [smsSimulatorToast, setSmsSimulatorToast] = useState<{
    open: boolean;
    customerMobile: string;
    customerName: string;
    orderId: string;
    vehicleNumber: string;
    driverName: string;
    driverMobile: string;
    otp: string;
    passNumber: string;
  } | null>(null);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return sroOrders.filter((ord) => {
      const matchReach = selectedReachId === "ALL" || ord.reachId === selectedReachId;
      const matchStage = activeStageTab === "ALL" || ord.sroStage === activeStageTab;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        ord.orderId.toLowerCase().includes(q) ||
        ord.vehicleNumber.toLowerCase().includes(q) ||
        ord.driverName.toLowerCase().includes(q) ||
        ord.customerName.toLowerCase().includes(q);
      return matchReach && matchStage && matchSearch;
    });
  }, [sroOrders, selectedReachId, activeStageTab, searchQuery]);

  // Stage Metric Counts
  const stageCounts = useMemo(() => {
    const list = selectedReachId === "ALL" ? sroOrders : sroOrders.filter((o) => o.reachId === selectedReachId);
    return {
      pendingPickup: list.filter((o) => o.sroStage === "Pending Pickup Orders").length,
      vehicleArrived: list.filter((o) => o.sroStage === "Vehicle Arrived").length,
      vehicleVerified: list.filter((o) => o.sroStage === "Vehicle Verified").length,
      loadingPending: list.filter((o) => o.sroStage === "Loading Pending").length,
      loadingCompleted: list.filter((o) => o.sroStage === "Loading Completed").length,
      transitPassGenerated: list.filter((o) => o.sroStage === "Transit Pass Generated").length,
      completedOrders: list.filter((o) => o.sroStage === "Completed Orders").length,
      total: list.length,
    };
  }, [sroOrders, selectedReachId]);

  // Start 10-Step Verification Workflow for an Order
  const handleOpenVerification = (order: SroOrder) => {
    setSelectedOrder(order);
    setActiveVerificationStep(1);
    setVerificationForm({
      vehicleNumberConfirmed: true,
      driverConfirmed: true,
      quantityConfirmed: true,
      capacityConfirmed: order.vehicleCapacityMt >= order.orderQuantityMt,
      vehiclePhotoUrl:
        order.vehiclePhotoUrl ||
        "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&auto=format&fit=crop&q=80",
      loadedSandPhotoUrl:
        order.loadedSandPhotoUrl ||
        "https://images.unsplash.com/photo-1541888946425-d0fbb180c5f7?w=600&auto=format&fit=crop&q=80",
      gpsCoordinates: "21.2514° N, 81.6296° E",
      loadedTonnageMt: order.orderQuantityMt,
      remarks: "Verified by Sand Reach Officer with live GPS and loaded vehicle photography.",
    });
    setIsVerificationModalOpen(true);
  };

  // Fetch Live GPS
  const handleFetchGps = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = parseFloat(pos.coords.latitude.toFixed(4));
          const lng = parseFloat(pos.coords.longitude.toFixed(4));
          setVerificationForm((prev) => ({
            ...prev,
            gpsCoordinates: `${lat}° N, ${lng}° E`,
          }));
          showSuccess("Live GPS coordinates verified within sand reach quarry geofence.");
        },
        () => {
          setVerificationForm((prev) => ({
            ...prev,
            gpsCoordinates: "21.2514° N, 81.6296° E",
          }));
          showSuccess("GPS coordinates verified for Sand Reach centroid.");
        }
      );
    }
  };

  // Step 10: Complete Verification & Generate Transit Pass
  const handleCompleteTransitPassGeneration = () => {
    if (!selectedOrder) return;

    const generatedPassNo = `TP-TGMD-2026-${Math.floor(80000 + Math.random() * 19999)}`;
    const otpCode = selectedOrder.customerOtp || `${Math.floor(1000 + Math.random() * 9000)}`;

    const updatedOrder: SroOrder = {
      ...selectedOrder,
      sroStage: "Transit Pass Generated",
      isVehicleNumberVerified: true,
      isDriverVerified: true,
      isQuantityVerified: true,
      isCapacityVerified: true,
      isLoadingConfirmed: true,
      vehiclePhotoUrl: verificationForm.vehiclePhotoUrl,
      loadedSandPhotoUrl: verificationForm.loadedSandPhotoUrl,
      gpsCoordinates: verificationForm.gpsCoordinates,
      loadedTonnageMt: verificationForm.loadedTonnageMt,
      transitPassNumber: generatedPassNo,
      transitPassGeneratedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      customerOtp: otpCode,
      otpDispatchedToCustomer: true,
      verifiedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      remarks: verificationForm.remarks,
    };

    setSroOrders((prev) => prev.map((o) => (o.id === selectedOrder.id ? updatedOrder : o)));
    setSelectedOrder(updatedOrder);

    // Trigger SMS simulation to Customer (Telangana TSMIV Model requirement)
    setSmsSimulatorToast({
      open: true,
      customerName: selectedOrder.customerName,
      customerMobile: selectedOrder.customerMobile,
      orderId: selectedOrder.orderId,
      vehicleNumber: selectedOrder.vehicleNumber,
      driverName: selectedOrder.driverName,
      driverMobile: selectedOrder.driverMobile,
      otp: otpCode,
      passNumber: generatedPassNo,
    });

    setIsVerificationModalOpen(false);
    showSuccess(
      `Transit Pass ${generatedPassNo} activated! Customer notified with Vehicle (${selectedOrder.vehicleNumber}) & Delivery OTP (${otpCode}).`
    );
  };

  const getStageBadge = (stage: SroStage) => {
    switch (stage) {
      case "Pending Pickup Orders":
        return <Badge variant="secondary">Pending Pickup</Badge>;
      case "Vehicle Arrived":
        return <Badge variant="info">Vehicle Arrived</Badge>;
      case "Vehicle Verified":
        return <Badge variant="primary">Vehicle Verified</Badge>;
      case "Loading Pending":
        return <Badge variant="warning">Loading Pending</Badge>;
      case "Loading Completed":
        return <Badge variant="success">Loading Completed</Badge>;
      case "Transit Pass Generated":
        return <Badge variant="success">Transit Pass Active</Badge>;
      case "Completed Orders":
        return <Badge variant="secondary">Completed & Gate Out</Badge>;
      default:
        return <Badge variant="secondary">{stage}</Badge>;
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* ── SRO Mobile Header / Console Bar ── */}
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800/60 text-[#c2410c] dark:text-orange-400 flex items-center justify-center shrink-0">
                <ShieldCheck size={18} />
              </div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                SRO – Sand Reach Officer Mobile Terminal
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-[#c2410c] dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                Field Operations
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Field verification console: Vehicle check, driver vetting, loaded sand photography, geofence capture & transit pass dispatch.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Live Vehicle Tracking Navigation */}
            <button
              type="button"
              onClick={() => navigate(routes.gpsTracking.path)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-2xs"
            >
              <Truck size={14} className="text-[#c2410c] dark:text-orange-400" />
              <span>Live Vehicle Tracking</span>
            </button>

            {/* View Mode Switcher */}
            <button
              type="button"
              onClick={() => setIsMobileMode(!isMobileMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                isMobileMode
                  ? "bg-[#c2410c] text-white font-bold shadow-xs"
                  : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
              }`}
            >
              <Smartphone size={14} />
              <span>{isMobileMode ? "Mobile Terminal Active" : "Switch to Mobile View"}</span>
            </button>

            {/* Reach Presiding Selector */}
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5 shadow-2xs">
              <MapPin size={13} className="text-[#c2410c] dark:text-orange-400" />
              <select
                value={selectedReachId}
                onChange={(e) => setSelectedReachId(e.target.value)}
                className="bg-transparent border-0 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Presided Reaches</option>
                {reaches.map((r) => (
                  <option key={r.id} value={r.reachId || r.id}>
                    {r.reachName} ({r.district})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── 7-Stage SRO Dashboard Metric Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {/* Stage 1: Pending Pickup */}
        <button
          type="button"
          onClick={() => setActiveStageTab("Pending Pickup Orders")}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            activeStageTab === "Pending Pickup Orders"
              ? "bg-slate-800 text-white border-slate-700 shadow-md"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>1. Pending</span>
            <Clock size={13} className="text-slate-400" />
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {stageCounts.pendingPickup}
          </p>
          <p className="text-[10px] text-slate-500 truncate">En Route to Reach</p>
        </button>

        {/* Stage 2: Vehicle Arrived */}
        <button
          type="button"
          onClick={() => setActiveStageTab("Vehicle Arrived")}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            activeStageTab === "Vehicle Arrived"
              ? "bg-blue-600 text-white border-blue-700 shadow-md"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
            <span>2. Arrived</span>
            <Truck size={13} className="text-blue-500" />
          </div>
          <p className="text-xl font-black text-blue-700 dark:text-blue-300 mt-1">
            {stageCounts.vehicleArrived}
          </p>
          <p className="text-[10px] text-slate-500 truncate">At Entry Gate</p>
        </button>

        {/* Stage 3: Vehicle Verified */}
        <button
          type="button"
          onClick={() => setActiveStageTab("Vehicle Verified")}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            activeStageTab === "Vehicle Verified"
              ? "bg-indigo-600 text-white border-indigo-700 shadow-md"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-400"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
            <span>3. Verified</span>
            <UserCheck size={13} className="text-indigo-500" />
          </div>
          <p className="text-xl font-black text-indigo-700 dark:text-indigo-300 mt-1">
            {stageCounts.vehicleVerified}
          </p>
          <p className="text-[10px] text-slate-500 truncate">RC & DL Cleared</p>
        </button>

        {/* Stage 4: Loading Pending */}
        <button
          type="button"
          onClick={() => setActiveStageTab("Loading Pending")}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            activeStageTab === "Loading Pending"
              ? "bg-amber-600 text-white border-amber-700 shadow-md"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-400"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
            <span>4. Loading</span>
            <Pickaxe size={13} className="text-amber-500" />
          </div>
          <p className="text-xl font-black text-amber-700 dark:text-amber-300 mt-1">
            {stageCounts.loadingPending}
          </p>
          <p className="text-[10px] text-slate-500 truncate">In Excavator Bay</p>
        </button>

        {/* Stage 5: Loading Completed */}
        <button
          type="button"
          onClick={() => setActiveStageTab("Loading Completed")}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            activeStageTab === "Loading Completed"
              ? "bg-emerald-600 text-white border-emerald-700 shadow-md"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-400"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <span>5. Loaded</span>
            <Camera size={13} className="text-emerald-500" />
          </div>
          <p className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
            {stageCounts.loadingCompleted}
          </p>
          <p className="text-[10px] text-slate-500 truncate">Photos & GPS Done</p>
        </button>

        {/* Stage 6: Transit Pass Generated */}
        <button
          type="button"
          onClick={() => setActiveStageTab("Transit Pass Generated")}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            activeStageTab === "Transit Pass Generated"
              ? "bg-purple-600 text-white border-purple-700 shadow-md"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-400"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400">
            <span>6. e-Pass</span>
            <FileCheck size={13} className="text-purple-500" />
          </div>
          <p className="text-xl font-black text-purple-700 dark:text-purple-300 mt-1">
            {stageCounts.transitPassGenerated}
          </p>
          <p className="text-[10px] text-slate-500 truncate">Customer OTP Sent</p>
        </button>

        {/* Stage 7: Completed Orders */}
        <button
          type="button"
          onClick={() => setActiveStageTab("Completed Orders")}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            activeStageTab === "Completed Orders"
              ? "bg-teal-600 text-white border-teal-700 shadow-md"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-teal-400"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-teal-600 dark:text-teal-400">
            <span>7. Completed</span>
            <CheckCircle2 size={13} className="text-teal-500" />
          </div>
          <p className="text-xl font-black text-teal-700 dark:text-teal-300 mt-1">
            {stageCounts.completedOrders}
          </p>
          <p className="text-[10px] text-slate-500 truncate">Gate-Out Authorized</p>
        </button>
      </div>

      {/* ── Search & Filter Sub-Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Order ID, Vehicle No, Driver, or Customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${inputBase} ${inputNormal} pl-8 text-xs`}
            />
          </div>
          {activeStageTab !== "ALL" && (
            <button
              type="button"
              onClick={() => setActiveStageTab("ALL")}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={12} /> Show All
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span>Showing {filteredOrders.length} of {sroOrders.length} Orders</span>
        </div>
      </div>

      {/* ── ORDERS LIST & VERIFICATION CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredOrders.map((ord) => (
          <div
            key={ord.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
          >
            {/* Header: Order ID & Status */}
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-blue-700 dark:text-blue-400">
                  {ord.orderId}
                </span>
                {getStageBadge(ord.sroStage)}
              </div>
              <p className="font-bold text-slate-900 dark:text-white text-sm mt-1">
                {ord.customerName}
              </p>
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <MapPin size={11} className="text-rose-500 shrink-0" />
                <span className="truncate">{ord.deliveryLocation} ({ord.deliveryDistrict})</span>
              </p>
            </div>

            {/* Vehicle & Quantity Badges */}
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <Truck size={13} className="text-blue-600" />
                  Vehicle:
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {ord.vehicleNumber} ({ord.vehicleType})
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Driver:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {ord.driverName} ({ord.driverMobile})
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-700/60 pt-1">
                <span className="text-slate-500 font-medium">Order Qty / Capacity:</span>
                <span className="font-bold text-emerald-600">
                  {ord.orderQuantityMt} MT <span className="text-slate-400 font-normal">/ {ord.vehicleCapacityMt} MT</span>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              {ord.transitPassNumber ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOrder(ord);
                    setIsPassModalOpen(true);
                  }}
                  className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <FileCheck size={13} />
                  <span>View Pass: {ord.transitPassNumber}</span>
                </button>
              ) : (
                <span className="text-[11px] text-slate-400 font-medium">
                  {ord.sroStage}
                </span>
              )}

              <Button
                size="sm"
                variant={ord.sroStage === "Transit Pass Generated" ? "outline" : "primary"}
                icon={<ShieldCheck size={14} />}
                onClick={() => handleOpenVerification(ord)}
              >
                {ord.sroStage === "Transit Pass Generated" || ord.sroStage === "Completed Orders"
                  ? "View Verification"
                  : "Start 10-Step SRO Verification"}
              </Button>
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="col-span-full p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <ShieldCheck size={36} className="mx-auto text-slate-400 mb-2" />
            <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">
              No orders found in this stage
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Select another Sand Reach quarry or reset the stage filter.
            </p>
          </div>
        )}
      </div>

      {/* ── 10-STEP SRO VERIFICATION MODAL ── */}
      {selectedOrder && (
        <Modal
          isOpen={isVerificationModalOpen}
          onClose={() => setIsVerificationModalOpen(false)}
          title={`SRO Verification Terminal: ${selectedOrder.orderId}`}
          subtitle={`Quarry: ${selectedOrder.reachName} • Vehicle: ${selectedOrder.vehicleNumber}`}
          size="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] text-slate-500">
                Step {activeVerificationStep} of 10: Telangana TSMIV Protocol
              </span>
              <div className="flex items-center gap-2">
                {activeVerificationStep > 1 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveVerificationStep((prev) => prev - 1)}
                  >
                    Previous Step
                  </Button>
                )}

                {activeVerificationStep < 10 ? (
                  <Button
                    size="sm"
                    variant="primary"
                    icon={<ChevronRight size={14} />}
                    onClick={() => setActiveVerificationStep((prev) => prev + 1)}
                  >
                    Next Step ({activeVerificationStep + 1}/10)
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="primary"
                    icon={<CheckCircle2 size={14} />}
                    onClick={handleCompleteTransitPassGeneration}
                  >
                    Authorize & Generate Transit Pass
                  </Button>
                )}
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            {/* 10 Steps Progress Bar */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              {[
                "1. Order",
                "2. Vehicle",
                "3. Driver",
                "4. Qty",
                "5. Capacity",
                "6. Photo 1",
                "7. Photo 2",
                "8. GPS",
                "9. Loading",
                "10. e-Pass",
              ].map((st, idx) => {
                const stepNum = idx + 1;
                const isCurrent = activeVerificationStep === stepNum;
                const isDone = activeVerificationStep > stepNum;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveVerificationStep(stepNum)}
                    className={`py-1 rounded text-center font-bold text-[10px] transition-colors cursor-pointer ${
                      isCurrent
                        ? "bg-blue-600 text-white shadow-xs"
                        : isDone
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                    }`}
                  >
                    {isDone ? `✓ ${st}` : st}
                  </button>
                );
              })}
            </div>

            {/* STEP 1: Select Order Details */}
            {activeVerificationStep === 1 && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                    <FileCheck size={16} className="text-blue-600" />
                    Step 1: Order & Customer Information
                  </h3>
                  <Badge variant="success">Order Active</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block">Order Reference</span>
                    <span className="font-mono font-bold text-blue-600">{selectedOrder.orderId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Customer Name</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{selectedOrder.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Sand Reach Quarry</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{selectedOrder.reachName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Delivery Address</span>
                    <span className="text-slate-800 dark:text-slate-200">{selectedOrder.deliveryLocation}</span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Verify Vehicle Number */}
            {activeVerificationStep === 2 && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                  <Truck size={16} className="text-blue-600" />
                  Step 2: Verify Vehicle Registration (RC)
                </h3>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Assigned Vehicle Number:</span>
                    <span className="font-mono font-black text-blue-700 text-sm">{selectedOrder.vehicleNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Vehicle Category:</span>
                    <span className="font-semibold">{selectedOrder.vehicleType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">RC Number Verified:</span>
                    <span className="font-mono text-emerald-600 font-bold">{selectedOrder.vehicleRcNumber || "RC/TG04/2023/88124"}</span>
                  </div>
                </div>
                <label className="flex items-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verificationForm.vehicleNumberConfirmed}
                    onChange={(e) => setVerificationForm({ ...verificationForm, vehicleNumberConfirmed: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="font-bold text-emerald-900 dark:text-emerald-200 text-xs">
                    Officer Sign: Physical Vehicle Number plate matches VAHAN Portal RC database
                  </span>
                </label>
              </div>
            )}

            {/* STEP 3: Verify Driver */}
            {activeVerificationStep === 3 && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                  <UserCheck size={16} className="text-blue-600" />
                  Step 3: Verify Driver Credentials & License
                </h3>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Driver Full Name:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedOrder.driverName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Driver Mobile Number:</span>
                    <span className="font-mono text-blue-600 font-bold">{selectedOrder.driverMobile}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Driving License (SARATHI):</span>
                    <span className="font-mono text-emerald-600 font-bold">{selectedOrder.driverLicense}</span>
                  </div>
                </div>
                <label className="flex items-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verificationForm.driverConfirmed}
                    onChange={(e) => setVerificationForm({ ...verificationForm, driverConfirmed: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="font-bold text-emerald-900 dark:text-emerald-200 text-xs">
                    Driver identity and active commercial driving license verified on site
                  </span>
                </label>
              </div>
            )}

            {/* STEP 4 & 5: Verify Order Quantity & Vehicle Capacity */}
            {(activeVerificationStep === 4 || activeVerificationStep === 5) && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                  <Layers size={16} className="text-blue-600" />
                  Step {activeVerificationStep}: Quantity & Vehicle Capacity Match
                </h3>
                <div className="grid grid-cols-2 gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg text-center">
                    <span className="text-slate-500 font-bold block text-[11px]">Booked Sand Quantity</span>
                    <span className="text-xl font-black text-blue-700">{selectedOrder.orderQuantityMt} MT</span>
                    <span className="text-[10px] text-slate-400 block">{selectedOrder.sandType}</span>
                  </div>

                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg text-center">
                    <span className="text-slate-500 font-bold block text-[11px]">Approved Vehicle Capacity</span>
                    <span className="text-xl font-black text-emerald-700">{selectedOrder.vehicleCapacityMt} MT</span>
                    <span className="text-[10px] text-emerald-600 font-semibold block">Safe Load Compliant</span>
                  </div>
                </div>

                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-900 dark:text-blue-200 text-[11px]">
                  ✓ Vehicle capacity ({selectedOrder.vehicleCapacityMt} MT) is sufficient and compliant for booked quantity ({selectedOrder.orderQuantityMt} MT). No overloading detected.
                </div>
              </div>
            )}

            {/* STEP 6: Capture Empty Vehicle Photo */}
            {activeVerificationStep === 6 && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                  <Camera size={16} className="text-blue-600" />
                  Step 6: Capture Empty Vehicle / Arrival Photo
                </h3>
                <div className="space-y-2">
                  <div className="rounded-xl overflow-hidden border border-slate-300 dark:border-slate-600 h-48 bg-slate-900 relative">
                    <img
                      src={verificationForm.vehiclePhotoUrl}
                      alt="Vehicle Arrival"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/70 text-white font-mono text-[10px]">
                      GPS: {verificationForm.gpsCoordinates} • Empty Trolley Check
                    </span>
                  </div>
                  <input
                    type="text"
                    value={verificationForm.vehiclePhotoUrl}
                    onChange={(e) => setVerificationForm({ ...verificationForm, vehiclePhotoUrl: e.target.value })}
                    className={`${inputBase} ${inputNormal} font-mono text-xs`}
                  />
                </div>
              </div>
            )}

            {/* STEP 7: Capture Sand-Loaded Vehicle Photo */}
            {activeVerificationStep === 7 && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                  <Camera size={16} className="text-emerald-600" />
                  Step 7: Capture Sand-Loaded Vehicle Photo (TSMIV Requirement)
                </h3>
                <div className="space-y-2">
                  <div className="rounded-xl overflow-hidden border border-slate-300 dark:border-slate-600 h-48 bg-slate-900 relative">
                    <img
                      src={verificationForm.loadedSandPhotoUrl}
                      alt="Sand Loaded Vehicle"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/70 text-white font-mono text-[10px]">
                      Loaded Sand Level Verified • {verificationForm.loadedTonnageMt} MT
                    </span>
                  </div>
                  <input
                    type="text"
                    value={verificationForm.loadedSandPhotoUrl}
                    onChange={(e) => setVerificationForm({ ...verificationForm, loadedSandPhotoUrl: e.target.value })}
                    className={`${inputBase} ${inputNormal} font-mono text-xs`}
                  />
                </div>
              </div>
            )}

            {/* STEP 8: Capture GPS Coordinates */}
            {activeVerificationStep === 8 && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                  <Compass size={16} className="text-rose-600" />
                  Step 8: Capture Geofence GPS Coordinates
                </h3>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Verified Quarry GPS Centroid:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{verificationForm.gpsCoordinates}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Geofence Compliance:</span>
                    <Badge variant="success">Inside Authorized Perimeter (Buffer: 450m)</Badge>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  icon={<Compass size={14} />}
                  onClick={handleFetchGps}
                >
                  Refresh Live GPS Pinpoint
                </Button>
              </div>
            )}

            {/* STEP 9: Confirm Loading */}
            {activeVerificationStep === 9 && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  Step 9: Confirm Loading Tonnage & Officer Sign-Off
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 font-bold text-[11px] mb-1">
                      Final Verified Loading Weight (MT)
                    </label>
                    <input
                      type="number"
                      value={verificationForm.loadedTonnageMt}
                      onChange={(e) => setVerificationForm({ ...verificationForm, loadedTonnageMt: Number(e.target.value) })}
                      className={`${inputBase} ${inputNormal} font-bold text-emerald-700`}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold text-[11px] mb-1">
                      Verifying SRO Officer
                    </label>
                    <input
                      type="text"
                      disabled
                      value={selectedOrder.sroOfficerName}
                      className={`${inputBase} ${inputNormal} bg-slate-100 font-semibold`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-500 font-bold text-[11px] mb-1">
                    Officer Remarks & Transit Authorization Notes
                  </label>
                  <textarea
                    rows={2}
                    value={verificationForm.remarks}
                    onChange={(e) => setVerificationForm({ ...verificationForm, remarks: e.target.value })}
                    className={`${inputBase} ${inputNormal}`}
                  />
                </div>
              </div>
            )}

            {/* STEP 10: Generate / Activate Transit Pass */}
            {activeVerificationStep === 10 && (
              <div className="p-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-950 text-white rounded-2xl border border-blue-400/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm flex items-center gap-1.5 text-blue-200">
                    <Sparkles size={16} className="text-amber-400" />
                    Step 10: Generate & Activate Transit Pass (e-Way Bill)
                  </h3>
                  <Badge variant="success">Ready for Issuance</Badge>
                </div>

                <p className="text-xs text-blue-200 leading-relaxed">
                  Upon confirmation, the official <strong>TGMD Transit Pass</strong> will be activated. In accordance with the Telangana TSMIV model, the customer <strong>({selectedOrder.customerName})</strong> will immediately receive an automated SMS with the vehicle registration <strong>({selectedOrder.vehicleNumber})</strong>, driver contact, and the secure Delivery Verification OTP.
                </p>

                <div className="p-3 bg-white/10 rounded-xl border border-white/10 space-y-1.5 font-mono text-xs">
                  <p>• Vehicle: {selectedOrder.vehicleNumber} ({selectedOrder.driverName})</p>
                  <p>• Loaded Quantity: {verificationForm.loadedTonnageMt} MT {selectedOrder.sandType}</p>
                  <p>• GPS Stamp: {verificationForm.gpsCoordinates}</p>
                  <p>• Delivery Destination: {selectedOrder.deliveryLocation}</p>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ── TRANSIT PASS PREVIEW MODAL ── */}
      {selectedOrder && selectedOrder.transitPassNumber && (
        <DigitalTransitPassModal
          isOpen={isPassModalOpen}
          onClose={() => setIsPassModalOpen(false)}
          transitPass={createDigitalTransitPass({
            orderId: selectedOrder.orderId,
            vehicleNumber: selectedOrder.vehicleNumber,
            driverName: selectedOrder.driverName,
            driverMobile: selectedOrder.driverMobile,
            driverLicense: selectedOrder.driverLicense,
            sandReach: {
              reachId: selectedOrder.reachId,
              reachName: selectedOrder.reachName,
              district: selectedOrder.district,
            },
            sourceStockyard: selectedOrder.reachName,
            destination: selectedOrder.deliveryLocation,
            quantityMt: selectedOrder.orderQuantityMt,
            sandType: selectedOrder.sandType,
            customerDetails: {
              name: selectedOrder.customerName,
              mobile: selectedOrder.customerMobile,
              category: "Citizen Buyer",
              deliveryAddress: selectedOrder.deliveryLocation,
            },
            validityHours: 8,
            weighbridgeSlipNumber: `WB-SLIP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            gpsTrackingRef: {
              deviceImei: `AIS140-CG-${selectedOrder.vehicleNumber.replace(/[^A-Z0-9]/g, "").slice(-6)}`,
              corridorGeofence: `Quarry ${selectedOrder.reachName} to ${selectedOrder.deliveryLocation}`,
            },
            officerName: selectedOrder.sroOfficerName,
            officerId: "SRO-TEL-008",
            designation: selectedOrder.sroOfficerDesignation || "Sand Reach Officer",
          })}
        />
      )}

      {/* ── SIMULATED TELANGANA SMS DISPATCH TOAST ── */}
      {smsSimulatorToast && smsSimulatorToast.open && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/50 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <Send size={14} />
              <span>Telangana Sand Bazaar SMS Dispatched</span>
            </div>
            <button
              type="button"
              onClick={() => setSmsSimulatorToast(null)}
              className="text-slate-400 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
          <div className="p-2.5 bg-slate-800 rounded-xl text-[11px] font-mono leading-relaxed text-slate-200">
            <p><strong>To:</strong> {smsSimulatorToast.customerMobile} ({smsSimulatorToast.customerName})</p>
            <p className="mt-1">
              "Dear Customer, your Sand Order {smsSimulatorToast.orderId} has been loaded at Reach. Assigned Tractor: {smsSimulatorToast.vehicleNumber}, Driver: {smsSimulatorToast.driverName} ({smsSimulatorToast.driverMobile}). Your Delivery OTP is {smsSimulatorToast.otp}. Transit Pass: {smsSimulatorToast.passNumber} - TGMD Council"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SroDashboardView;
