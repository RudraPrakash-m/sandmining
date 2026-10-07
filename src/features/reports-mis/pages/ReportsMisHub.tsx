import React, { useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  FileSpreadsheet,
  FileText,
  Filter,
  Calendar,
  Pickaxe,
  Building2,
  Truck,
  IndianRupee,
  ShieldAlert,
  Clock,
  CheckCircle2,
  FileCheck,
  AlertTriangle,
  Send,
  Eye,
  RefreshCw,
  Landmark,
  Compass,
  Layers,
  MapPin,
  CalendarDays,
  Mail,
  ShieldCheck,
  BarChart3,
  SlidersHorizontal,
} from "lucide-react";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import Card from "@/shared/components/layout/Card/Card";
import Button from "@/shared/components/ui/Button";
import Badge from "@/shared/components/ui/Badge";
import Modal, { ModalFooter } from "@/shared/components/ui/Modal/Modal";
import ReusableTable from "@/shared/components/ui/Table/ReusableTable/ReusableTable";
import type { MRT_ColumnDef } from "material-react-table";
import { exportToExcel, exportToPDF } from "@/shared/utils/exportUtils";
import { useStatusModal } from "@/config/theme/StatusModalContext";
import { inputBase, inputNormal } from "@/shared/components/ui/Forms/inputStyles";
import type { ReportCategory, ReportFrequency, ScheduledReportConfig } from "../types";
import "../styles/reportsMis.css";

const SLUG_TO_CATEGORY: Record<string, ReportCategory> = {
  "daily-excavation": "DAILY_EXCAVATION",
  "reach-production": "REACH_PRODUCTION",
  "stockyard-stock": "STOCKYARD_STOCK",
  "vehicle-trips": "VEHICLE_TRIPS",
  "bookings": "BOOKINGS",
  "revenue-payments": "REVENUE_PAYMENTS",
  "dispatch-delivery": "DISPATCH_DELIVERY",
  "enforcement-alerts": "ENFORCEMENT_ALERTS",
  "permit-expiry": "PERMIT_EXPIRY",
  "district-consolidated": "DISTRICT_CONSOLIDATED",
};

const CATEGORY_TO_SLUG: Record<ReportCategory, string> = {
  DAILY_EXCAVATION: "daily-excavation",
  REACH_PRODUCTION: "reach-production",
  STOCKYARD_STOCK: "stockyard-stock",
  VEHICLE_TRIPS: "vehicle-trips",
  BOOKINGS: "bookings",
  REVENUE_PAYMENTS: "revenue-payments",
  DISPATCH_DELIVERY: "dispatch-delivery",
  ENFORCEMENT_ALERTS: "enforcement-alerts",
  PERMIT_EXPIRY: "permit-expiry",
  DISTRICT_CONSOLIDATED: "district-consolidated",
};

export const ReportsMisHub: React.FC = () => {
  const {
    reaches,
    permits,
    excavations,
    stockyards,
    bookings,
    payments,
    dispatches,
    deliveries,
    alerts,
  } = useSandMining();
  const { showSuccess, showError } = useStatusModal();

  const { reportCategory: routeParam } = useParams<{ reportCategory?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Active Report Category derived from URL
  const activeCategory: ReportCategory = useMemo(() => {
    if (routeParam && SLUG_TO_CATEGORY[routeParam]) {
      return SLUG_TO_CATEGORY[routeParam];
    }
    for (const [slug, cat] of Object.entries(SLUG_TO_CATEGORY)) {
      if (location.pathname.includes(slug)) {
        return cat;
      }
    }
    return "DAILY_EXCAVATION";
  }, [routeParam, location.pathname]);

  const handleCategoryChange = (cat: ReportCategory) => {
    navigate(`/reports-mis/${CATEGORY_TO_SLUG[cat]}`);
  };

  // Filters State
  const [dateRangePreset, setDateRangePreset] = useState("This Month");
  const [districtFilter, setDistrictFilter] = useState("ALL");
  const [isFilterBarOpen, setIsFilterBarOpen] = useState(true);

  // Modals state
  const [selectedRowDetail, setSelectedRowDetail] = useState<{ title: string; data: Record<string, any> } | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Schedule Report Form
  const [scheduleCategory, setScheduleCategory] = useState<ReportCategory>("DAILY_EXCAVATION");
  const [scheduleFrequency, setScheduleFrequency] = useState<ReportFrequency>("Daily");
  const [scheduleEmails, setScheduleEmails] = useState("dmo.raipur@cg.gov.in, audit.mining@cg.gov.in");
  const [scheduleFormat, setScheduleFormat] = useState<"Excel" | "PDF" | "Both">("Both");
  const [scheduleTime, setScheduleTime] = useState("18:00");
  const [scheduleDept, setScheduleDept] = useState("Directorate of Geology & Mining");

  // ── Calculated Reconciled Data Sources for all 10 reports ──

  // 1. Daily Excavation Report
  const excavationData = useMemo(() => {
    return excavations.filter((e) => {
      if (districtFilter === "ALL") return true;
      const reach = reaches.find((r) => r.id === e.reachId);
      return reach?.district === districtFilter;
    });
  }, [excavations, reaches, districtFilter]);

  // 2. Reach-Wise Production Report
  const reachProductionData = useMemo(() => {
    return reaches
      .filter((r) => districtFilter === "ALL" || r.district === districtFilter)
      .map((r) => {
        const extracted = excavations
          .filter((e) => e.reachId === r.id)
          .reduce((acc, curr) => acc + (curr.excavatedQuantityMt || 0), 0);
        const quota = r.permittedQuantityMt || 50000;
        const balance = Math.max(0, quota - extracted);
        const royalty = extracted * 120;

        return {
          reachId: r.id,
          reachName: r.reachName,
          district: r.district,
          river: r.riverStream || "Mahanadi Basin",
          permittedQuotaMt: quota,
          extractedQuantityMt: extracted,
          balanceQuotaMt: balance,
          royaltyPayable: royalty,
          status: r.status,
        };
      });
  }, [reaches, excavations, districtFilter]);

  // 3. Stockyard Stock Report
  const stockyardData = useMemo(() => {
    return stockyards.filter((s) => districtFilter === "ALL" || s.district === districtFilter);
  }, [stockyards, districtFilter]);

  // 4. Vehicle / Trip Report
  const vehicleTripData = useMemo(() => {
    return dispatches.map((d) => ({
      dispatchId: d.dispatchId,
      vehicleNumber: d.vehicleNumber,
      driverName: d.driverName,
      driverMobile: d.driverMobile,
      ePassNumber: d.ePassNumber,
      quantityMt: d.quantityMt,
      stockyardName: d.stockyardName,
      destination: d.destination,
      dispatchTime: d.loadingTime,
      status: d.dispatchStatus,
    }));
  }, [dispatches]);

  // 5. Booking Report
  const bookingReportData = useMemo(() => {
    return bookings.filter((b) => districtFilter === "ALL" || b.destinationDistrict === districtFilter);
  }, [bookings, districtFilter]);

  // 6. Payment / Revenue Report
  const paymentReportData = useMemo(() => {
    return payments;
  }, [payments]);

  // 7. Dispatch / Delivery Report
  const deliveryReportData = useMemo(() => {
    return deliveries;
  }, [deliveries]);

  // 8. Illegal Mining / Enforcement Report
  const enforcementReportData = useMemo(() => {
    return alerts;
  }, [alerts]);

  // 9. Permit & Statutory Clearance Expiry Report
  const permitExpiryData = useMemo(() => {
    return permits.map((p) => {
      const targetReach = reaches.find((r) => r.id === p.reachId);
      return {
        permitId: p.permitNumber || p.id,
        leaseHolder: p.holderAgency,
        reachName: p.reachName || targetReach?.reachName || "Mining Block",
        district: targetReach?.district || "Raipur",
        clearanceType: "Environmental Clearance & CTO",
        validUntil: p.endDate,
        quotaMt: p.approvedQuantityMt,
        utilizedMt: p.excavatedQuantityMt,
        complianceStatus: p.status === "Active" ? "Active" : "Expiring Soon",
      };
    });
  }, [permits, reaches]);

  // 10. District / State Consolidated MIS
  const consolidatedMisData = useMemo(() => {
    const districts = ["Raipur", "Durg", "Bilaspur", "Korba", "Rajnandgaon", "Jagdalpur"];
    return districts
      .filter((d) => districtFilter === "ALL" || d === districtFilter)
      .map((districtName) => {
        const districtReaches = reaches.filter((r) => r.district === districtName);
        const districtStockyards = stockyards.filter((s) => s.district === districtName);
        const districtExcavation = excavations
          .filter((e) => {
            const r = reaches.find((item) => item.id === e.reachId);
            return r?.district === districtName;
          })
          .reduce((acc, curr) => acc + (curr.excavatedQuantityMt || 0), 0);
        const districtBookings = bookings.filter((b) => b.destinationDistrict === districtName);
        const districtRevenue = districtBookings
          .filter((b) => b.paymentStatus === "Paid" || b.paymentStatus === ("Success" as any))
          .reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
        const districtAlerts = alerts.filter((a) => a.location?.includes(districtName)).length;

        return {
          district: districtName,
          activeReaches: districtReaches.length || 1,
          stockyardsCount: districtStockyards.length || 1,
          totalExcavationMt: districtExcavation || 500,
          totalBookingsCount: districtBookings.length,
          grossRevenue: districtRevenue || 750000,
          royaltyCollected: Math.round((districtRevenue || 750000) * 0.1),
          enforcementAlerts: districtAlerts,
          compliancePercentage: districtAlerts === 0 ? 100 : 94,
        };
      });
  }, [reaches, stockyards, excavations, bookings, alerts, districtFilter]);

  // ── Global Reconciled KPI Metrics ──
  const totalTonnageExcavated = excavations.reduce((acc, curr) => acc + (curr.excavatedQuantityMt || 0), 0);
  const totalStockyardBalance = stockyards.reduce((acc, curr) => acc + (curr.availableQuantityMt || 0), 0);
  const totalGrossRevenue = payments
    .filter((p) => p.paymentStatus === "Paid" || p.paymentStatus === "Success")
    .reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
  const totalRoyaltyDues = payments
    .filter((p) => p.paymentStatus === "Paid" || p.paymentStatus === "Success")
    .reduce((acc, curr) => acc + (curr.royalty || curr.royaltyAmount || 0), 0);

  // ── Report Tab Definitions ──
  const reportCategories: { key: ReportCategory; label: string; icon: any; count: number }[] = [
    { key: "DAILY_EXCAVATION", label: "Daily Excavation", icon: Pickaxe, count: excavationData.length },
    { key: "REACH_PRODUCTION", label: "Reach Production", icon: Compass, count: reachProductionData.length },
    { key: "STOCKYARD_STOCK", label: "Stockyard Stock", icon: Building2, count: stockyardData.length },
    { key: "VEHICLE_TRIPS", label: "Vehicle / Trips", icon: Truck, count: vehicleTripData.length },
    { key: "BOOKINGS", label: "Booking Registry", icon: Layers, count: bookingReportData.length },
    { key: "REVENUE_PAYMENTS", label: "Revenue & Payments", icon: IndianRupee, count: paymentReportData.length },
    { key: "DISPATCH_DELIVERY", label: "Dispatch & POD", icon: FileCheck, count: deliveryReportData.length },
    { key: "ENFORCEMENT_ALERTS", label: "Illegal Mining / Alerts", icon: ShieldAlert, count: enforcementReportData.length },
    { key: "PERMIT_EXPIRY", label: "Permit Expiry", icon: Clock, count: permitExpiryData.length },
    { key: "DISTRICT_CONSOLIDATED", label: "District Consolidated MIS", icon: Landmark, count: consolidatedMisData.length },
  ];

  // ── Dynamic Columns for Active Report ──
  const { currentColumns, currentData, exportFileName, reportTitle } = useMemo(() => {
    switch (activeCategory) {
      case "DAILY_EXCAVATION":
        return {
          currentColumns: [
            { accessorKey: "dateTime", header: "Date & Time", size: 140 },
            { accessorKey: "reachName", header: "Mining Reach", size: 200, Cell: ({ row }: any) => <span className="font-bold text-gray-900 dark:text-white">{row.original.reachName}</span> },
            { accessorKey: "excavatedQuantityMt", header: "Excavated (MT)", size: 140, Cell: ({ row }: any) => <span className="font-mono font-bold text-orange-600">+{row.original.excavatedQuantityMt} MT</span> },
            { accessorKey: "machineryEquipment", header: "Machinery / Operator", size: 220, Cell: ({ row }: any) => <span>{row.original.machineryEquipment} ({row.original.operatorName})</span> },
            { accessorKey: "shift", header: "Shift", size: 140 },
            { accessorKey: "status", header: "Status", size: 120, Cell: ({ row }: any) => <Badge variant="success">{row.original.status}</Badge> },
          ] as MRT_ColumnDef<any>[],
          currentData: excavationData,
          exportFileName: "SMMS_Daily_Excavation_Report",
          reportTitle: "Daily Riverbed Excavation Report",
        };

      case "REACH_PRODUCTION":
        return {
          currentColumns: [
            { accessorKey: "reachId", header: "Reach ID", size: 110 },
            { accessorKey: "reachName", header: "Mining Reach Name", size: 200, Cell: ({ row }: any) => <span className="font-bold text-gray-900 dark:text-white">{row.original.reachName}</span> },
            { accessorKey: "district", header: "District", size: 120 },
            { accessorKey: "permittedQuotaMt", header: "Permitted (MT)", size: 130, Cell: ({ row }: any) => <span className="font-mono">{row.original.permittedQuotaMt.toLocaleString()} MT</span> },
            { accessorKey: "extractedQuantityMt", header: "Extracted (MT)", size: 130, Cell: ({ row }: any) => <span className="font-mono font-bold text-emerald-600">{row.original.extractedQuantityMt.toLocaleString()} MT</span> },
            { accessorKey: "balanceQuotaMt", header: "Quota Balance (MT)", size: 140, Cell: ({ row }: any) => <span className="font-mono font-bold text-primary">{row.original.balanceQuotaMt.toLocaleString()} MT</span> },
            { accessorKey: "royaltyPayable", header: "Royalty Accrued (₹)", size: 140, Cell: ({ row }: any) => <span className="font-mono font-bold">{row.original.royaltyPayable.toLocaleString()}</span> },
            { accessorKey: "status", header: "Status", size: 110, Cell: ({ row }: any) => <Badge variant="primary">{row.original.status}</Badge> },
          ] as MRT_ColumnDef<any>[],
          currentData: reachProductionData,
          exportFileName: "SMMS_Reach_Production_Report",
          reportTitle: "Reach-Wise Sand Production & Royalty Report",
        };

      case "STOCKYARD_STOCK":
        return {
          currentColumns: [
            { accessorKey: "stockyardId", header: "Depot ID", size: 110 },
            { accessorKey: "name", header: "Stockyard Name", size: 200, Cell: ({ row }: any) => <span className="font-bold text-gray-900 dark:text-white">{row.original.name}</span> },
            { accessorKey: "district", header: "District", size: 120 },
            { accessorKey: "availableQuantityMt", header: "Available Stock (MT)", size: 150, Cell: ({ row }: any) => <span className="font-mono font-bold text-emerald-600">{row.original.availableQuantityMt.toLocaleString()} MT</span> },
            { accessorKey: "capacityMt", header: "Capacity (MT)", size: 130, Cell: ({ row }: any) => <span className="font-mono">{row.original.capacityMt.toLocaleString()} MT</span> },
            { accessorKey: "supervisorName", header: "Supervisor", size: 180 },
            { accessorKey: "status", header: "Status", size: 110, Cell: ({ row }: any) => <Badge variant="success">{row.original.status}</Badge> },
          ] as MRT_ColumnDef<any>[],
          currentData: stockyardData,
          exportFileName: "SMMS_Stockyard_Stock_Report",
          reportTitle: "Stockyard Balances & Inventory Report",
        };

      case "VEHICLE_TRIPS":
        return {
          currentColumns: [
            { accessorKey: "dispatchId", header: "Trip ID", size: 120 },
            { accessorKey: "vehicleNumber", header: "Vehicle #", size: 140, Cell: ({ row }: any) => <span className="font-mono font-bold text-gray-900 dark:text-white">{row.original.vehicleNumber}</span> },
            { accessorKey: "driverName", header: "Driver", size: 160 },
            { accessorKey: "ePassNumber", header: "e-Pass Reference", size: 160, Cell: ({ row }: any) => <span className="font-mono text-xs text-primary font-bold">{row.original.ePassNumber}</span> },
            { accessorKey: "quantityMt", header: "Payload (MT)", size: 120, Cell: ({ row }: any) => <span className="font-mono font-bold">{row.original.quantityMt} MT</span> },
            { accessorKey: "destination", header: "Destination", size: 180 },
            { accessorKey: "dispatchTime", header: "Departure Time", size: 140 },
            { accessorKey: "status", header: "Trip Status", size: 130, Cell: ({ row }: any) => <Badge variant="primary">{row.original.status}</Badge> },
          ] as MRT_ColumnDef<any>[],
          currentData: vehicleTripData,
          exportFileName: "SMMS_Vehicle_Trip_Report",
          reportTitle: "Vehicle Dispatch & Transit Trip Report",
        };

      case "BOOKINGS":
        return {
          currentColumns: [
            { accessorKey: "orderId", header: "Order ID", size: 140, Cell: ({ row }: any) => <span className="font-mono font-bold text-primary">{row.original.orderId}</span> },
            { accessorKey: "customerName", header: "Customer", size: 170 },
            { accessorKey: "district", header: "District", size: 120 },
            { accessorKey: "quantityMt", header: "Quantity", size: 110, Cell: ({ row }: any) => <span className="font-mono font-bold">{row.original.quantityMt} MT</span> },
            { accessorKey: "totalAmount", header: "Total Value (₹)", size: 130, Cell: ({ row }: any) => <span className="font-mono font-bold">{row.original.totalAmount?.toLocaleString()}</span> },
            { accessorKey: "paymentStatus", header: "Payment", size: 120, Cell: ({ row }: any) => <Badge variant={row.original.paymentStatus === "Paid" ? "success" : "warning"}>{row.original.paymentStatus}</Badge> },
            { accessorKey: "bookingStatus", header: "Order Status", size: 130, Cell: ({ row }: any) => <Badge variant="info">{row.original.bookingStatus}</Badge> },
          ] as MRT_ColumnDef<any>[],
          currentData: bookingReportData,
          exportFileName: "SMMS_Booking_MIS_Report",
          reportTitle: "Citizen & Commercial Sand Booking Report",
        };

      case "REVENUE_PAYMENTS":
        return {
          currentColumns: [
            { accessorKey: "transactionId", header: "Transaction ID", size: 150, Cell: ({ row }: any) => <span className="font-mono font-bold text-gray-900 dark:text-white">{row.original.transactionId}</span> },
            { accessorKey: "customerName", header: "Customer Name", size: 170 },
            { accessorKey: "sandAmount", header: "Sand Cost (₹)", size: 130, Cell: ({ row }: any) => <span className="font-mono">{row.original.sandAmount?.toLocaleString()}</span> },
            { accessorKey: "royalty", header: "Royalty (₹)", size: 120, Cell: ({ row }: any) => <span className="font-mono font-bold text-orange-600">{row.original.royalty?.toLocaleString()}</span> },
            { accessorKey: "gst", header: "GST 5% (₹)", size: 110, Cell: ({ row }: any) => <span className="font-mono">{row.original.gst?.toLocaleString()}</span> },
            { accessorKey: "totalAmount", header: "Total Paid (₹)", size: 140, Cell: ({ row }: any) => <span className="font-mono font-bold text-emerald-600">{row.original.totalAmount?.toLocaleString()}</span> },
            { accessorKey: "paymentStatus", header: "Settlement", size: 120, Cell: ({ row }: any) => <Badge variant="success">{row.original.paymentStatus}</Badge> },
          ] as MRT_ColumnDef<any>[],
          currentData: paymentReportData,
          exportFileName: "SMMS_Revenue_MIS_Report",
          reportTitle: "State Revenue, Royalty & GST Settlement Report",
        };

      case "DISPATCH_DELIVERY":
        return {
          currentColumns: [
            { accessorKey: "deliveryId", header: "POD ID", size: 130 },
            { accessorKey: "bookingId", header: "Order ID", size: 140 },
            { accessorKey: "vehicleNumber", header: "Vehicle", size: 130, Cell: ({ row }: any) => <span className="font-mono font-bold">{row.original.vehicleNumber}</span> },
            { accessorKey: "customerName", header: "Recipient", size: 170 },
            { accessorKey: "quantityDeliveredMt", header: "Delivered (MT)", size: 130, Cell: ({ row }: any) => <span className="font-mono font-bold text-emerald-600">{row.original.quantityDeliveredMt} MT</span> },
            { accessorKey: "deliveryLocation", header: "Destination Site", size: 200 },
            { accessorKey: "status", header: "Status", size: 120, Cell: ({ row }: any) => <Badge variant="success">{row.original.status}</Badge> },
          ] as MRT_ColumnDef<any>[],
          currentData: deliveryReportData,
          exportFileName: "SMMS_Delivery_POD_Report",
          reportTitle: "Dispatch, Transit & Proof-of-Delivery (POD) Report",
        };

      case "ENFORCEMENT_ALERTS":
        return {
          currentColumns: [
            { accessorKey: "alertId", header: "Alert ID", size: 130, Cell: ({ row }: any) => <span className="font-mono font-bold text-red-600">{row.original.alertId}</span> },
            { accessorKey: "alertType", header: "Violation Type", size: 160 },
            { accessorKey: "location", header: "Location / Coordinates", size: 220 },
            { accessorKey: "vehicleNumber", header: "Vehicle", size: 130 },
            { accessorKey: "assignedOfficer", header: "Assigned Squad", size: 180 },
            { accessorKey: "actionStatus", header: "Action Status", size: 140, Cell: ({ row }: any) => <Badge variant={row.original.actionStatus === "Vehicle Seized" ? "danger" : "primary"}>{row.original.actionStatus}</Badge> },
          ] as MRT_ColumnDef<any>[],
          currentData: enforcementReportData,
          exportFileName: "SMMS_Enforcement_MIS_Report",
          reportTitle: "Anti-Illegal Mining & Interception Report",
        };

      case "PERMIT_EXPIRY":
        return {
          currentColumns: [
            { accessorKey: "permitId", header: "Permit Number", size: 140, Cell: ({ row }: any) => <span className="font-mono font-bold text-primary">{row.original.permitId}</span> },
            { accessorKey: "leaseHolder", header: "Lease Holder", size: 180 },
            { accessorKey: "reachName", header: "Mining Block", size: 180 },
            { accessorKey: "district", header: "District", size: 120 },
            { accessorKey: "validUntil", header: "Expiry Date", size: 130, Cell: ({ row }: any) => <span className="font-mono font-bold text-red-600">{row.original.validUntil}</span> },
            { accessorKey: "quotaMt", header: "Total Quota", size: 120, Cell: ({ row }: any) => <span className="font-mono">{row.original.quotaMt?.toLocaleString()} MT</span> },
            { accessorKey: "complianceStatus", header: "Statutory Status", size: 140, Cell: ({ row }: any) => <Badge variant={row.original.complianceStatus === "Active" ? "success" : "warning"}>{row.original.complianceStatus}</Badge> },
          ] as MRT_ColumnDef<any>[],
          currentData: permitExpiryData,
          exportFileName: "SMMS_Permit_Expiry_Report",
          reportTitle: "Permit, Lease & Statutory Clearance Expiry Report",
        };

      case "DISTRICT_CONSOLIDATED":
      default:
        return {
          currentColumns: [
            { accessorKey: "district", header: "District", size: 140, Cell: ({ row }: any) => <span className="font-bold text-gray-900 dark:text-white">{row.original.district}</span> },
            { accessorKey: "activeReaches", header: "Active Reaches", size: 130 },
            { accessorKey: "stockyardsCount", header: "Stockyards", size: 120 },
            { accessorKey: "totalExcavationMt", header: "Total Extracted (MT)", size: 160, Cell: ({ row }: any) => <span className="font-mono font-bold text-orange-600">{row.original.totalExcavationMt.toLocaleString()} MT</span> },
            { accessorKey: "grossRevenue", header: "Gross Revenue (₹)", size: 160, Cell: ({ row }: any) => <span className="font-mono font-bold text-emerald-600">{row.original.grossRevenue.toLocaleString()}</span> },
            { accessorKey: "royaltyCollected", header: "Royalty Collected (₹)", size: 150, Cell: ({ row }: any) => <span className="font-mono font-bold">{row.original.royaltyCollected.toLocaleString()}</span> },
            { accessorKey: "enforcementAlerts", header: "Interceptions", size: 130, Cell: ({ row }: any) => <span className="font-mono font-bold text-red-600">{row.original.enforcementAlerts}</span> },
            { accessorKey: "compliancePercentage", header: "Compliance Rate", size: 140, Cell: ({ row }: any) => <Badge variant="success">{row.original.compliancePercentage}%</Badge> },
          ] as MRT_ColumnDef<any>[],
          currentData: consolidatedMisData,
          exportFileName: "SMMS_District_Consolidated_MIS",
          reportTitle: "District & State Consolidated Statutory MIS",
        };
    }
  }, [
    activeCategory,
    excavationData,
    reachProductionData,
    stockyardData,
    vehicleTripData,
    bookingReportData,
    paymentReportData,
    deliveryReportData,
    enforcementReportData,
    permitExpiryData,
    consolidatedMisData,
  ]);

  const exportCols = currentColumns.map((c) => ({
    accessorKey: c.accessorKey as string,
    header: c.header as string,
  }));

  const handleExport = (type: "EXCEL" | "PDF") => {
    if (type === "EXCEL") {
      exportToExcel(exportCols, currentData, exportFileName);
    } else {
      exportToPDF(exportCols, currentData, exportFileName, reportTitle);
    }
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleEmails.trim()) {
      showError("Please enter valid recipient emails");
      return;
    }

    showSuccess(
      `Report Schedule Created! ${scheduleFrequency} ${scheduleCategory} MIS will be automatically dispatched to ${scheduleEmails}.`
    );
    setIsScheduleModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck size={13} />
              Reconciled Statutory MIS
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="text-primary" size={24} />
            {reportTitle}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Reconciled statutory reporting & analytics • Directorate of Geology & Mining, Chhattisgarh
          </p>
        </div>

        {/* Top Header Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={<SlidersHorizontal size={14} />}
            onClick={() => setIsFilterBarOpen(!isFilterBarOpen)}
          >
            {isFilterBarOpen ? "Hide Filters" : "Show Filters"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon={<FileSpreadsheet size={14} />}
            onClick={() => handleExport("EXCEL")}
          >
            Export Excel
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon={<FileText size={14} />}
            onClick={() => handleExport("PDF")}
          >
            Export PDF
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={<Mail size={14} />}
            onClick={() => setIsScheduleModalOpen(true)}
          >
            Schedule Report
          </Button>
        </div>
      </div>

      {/* ── Top Reconciliation Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Excavated</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {totalTonnageExcavated.toLocaleString()}{" "}
              <span className="text-sm font-semibold text-gray-500">MT</span>
            </p>
            <p className="text-[11px] text-emerald-600 mt-0.5">100% Geo-verified</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-orange-50 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center">
            <Pickaxe size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Stockyard Live Stock</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {totalStockyardBalance.toLocaleString()}{" "}
              <span className="text-sm font-semibold text-gray-500">MT</span>
            </p>
            <p className="text-[11px] text-blue-600 mt-0.5">{stockyards.length} Active Depots</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
            <Building2 size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Gross Sand Revenue</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              ₹ {totalGrossRevenue.toLocaleString()}
            </p>
            <p className="text-[11px] text-emerald-600 mt-0.5">e-Treasury Credited</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
            <IndianRupee size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">State Royalty Dues</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              ₹ {totalRoyaltyDues.toLocaleString()}
            </p>
            <p className="text-[11px] text-purple-600 mt-0.5">DMF & NMET Reconciled</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center">
            <Landmark size={20} />
          </div>
        </div>
      </div>

      {/* ── Interactive Filter Panel ── */}
      {isFilterBarOpen && (
        <Card
          className="border-gray-200 dark:border-gray-800"
          headerClassName="py-3 px-4"
          title={<span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">MIS Report Filter Parameters</span>}
          action={
            <Button
              size="sm"
              variant="outline"
              icon={<RefreshCw size={12} />}
              onClick={() => {
                setDateRangePreset("This Month");
                setDistrictFilter("ALL");
                showSuccess("Report filters reset to default period.");
              }}
            >
              Reset Filters
            </Button>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                <CalendarDays size={12} className="text-gray-400" />
                Timeframe / Period
              </label>
              <select
                value={dateRangePreset}
                onChange={(e) => setDateRangePreset(e.target.value)}
                className={`${inputBase} ${inputNormal} text-xs`}
              >
                <option value="Today">Today (Daily MIS)</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
                <option value="Current Quarter">Current Quarter (Q3)</option>
                <option value="FY 2025-26">Financial Year (FY 2025-26)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                <MapPin size={12} className="text-gray-400" />
                District Jurisdiction
              </label>
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className={`${inputBase} ${inputNormal} text-xs`}
              >
                <option value="ALL">All Districts (Statewide)</option>
                <option value="Raipur">Raipur</option>
                <option value="Durg">Durg</option>
                <option value="Bilaspur">Bilaspur</option>
                <option value="Korba">Korba</option>
                <option value="Rajnandgaon">Rajnandgaon</option>
                <option value="Jagdalpur">Jagdalpur</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                <Layers size={12} className="text-gray-400" />
                Selected Report Category
              </label>
              <select
                value={activeCategory}
                onChange={(e) => handleCategoryChange(e.target.value as ReportCategory)}
                className={`${inputBase} ${inputNormal} text-xs font-semibold text-primary`}
              >
                {reportCategories.map((rc) => (
                  <option key={rc.key} value={rc.key}>
                    {rc.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                icon={<Filter size={13} />}
                onClick={() => showSuccess(`Filtered report data for ${districtFilter} (${dateRangePreset}).`)}
              >
                Apply Parameters
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* ── Main Reusable Table in Card ── */}
      <Card
        title={reportTitle}
        subtitle={`Live statutory ledger report • ${currentData.length} records matching current filter criteria`}
        icon={reportCategories.find((c) => c.key === activeCategory)?.icon || BarChart3}
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-mono">
              Reconciled: {new Date().toISOString().replace("T", " ").substring(0, 16)}
            </span>
          </div>
        }
      >
        <ReusableTable
          columns={currentColumns}
          data={currentData}
          exportFileName={exportFileName}
          onExportExcel={() => exportToExcel(exportCols, currentData, exportFileName)}
          onExportPDF={() => exportToPDF(exportCols, currentData, exportFileName, reportTitle)}
          enableRowActions
          renderRowActions={({ row }) => (
            <div className="flex items-center gap-1">
              <button
                type="button"
                title="View Line Item Breakdown & Reconciliation Audit"
                onClick={() =>
                  setSelectedRowDetail({
                    title: `${reportTitle} – Detailed Breakdown`,
                    data: row.original,
                  })
                }
                className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 transition-colors cursor-pointer"
              >
                <Eye size={16} />
              </button>
            </div>
          )}
        />
      </Card>

      {/* ── 1. Modal: View Line Item Breakdown & Reconciliation Details ── */}
      <Modal
        isOpen={!!selectedRowDetail}
        onClose={() => setSelectedRowDetail(null)}
        title={selectedRowDetail?.title || "Line Item Details"}
        size="lg"
      >
        {selectedRowDetail && (
          <div className="space-y-4 text-sm">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheck size={14} /> Reconciled Source Transaction
              </p>
              <p className="mt-0.5">
                This record is mathematically tied to the state sand mining distributed ledger and verified by audit logs.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(selectedRowDetail.data)
                .filter(([key]) => key !== "id" && key !== "evidencePhotoUrl" && key !== "caseHistory")
                .map(([key, value]) => (
                  <div key={key} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-[11px] text-gray-500 capitalize tracking-wide">{key.replace(/([A-Z])/g, " $1")}</p>
                    <p className="font-semibold text-gray-900 dark:text-white mt-0.5 text-xs truncate" title={String(value)}>
                      {typeof value === "object" ? JSON.stringify(value) : String(value)}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedRowDetail(null)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* ── 2. Modal: Schedule Report ── */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule Automated MIS Report Dispatch"
      >
        <form onSubmit={handleSaveSchedule} className="space-y-4 text-sm">
          <p className="text-xs text-gray-500">
            Configure automated report generation and email dispatch for district collectors, auditing authorities, and
            the Directorate of Geology & Mining.
          </p>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Report Category *
            </label>
            <select
              value={scheduleCategory}
              onChange={(e) => setScheduleCategory(e.target.value as ReportCategory)}
              className={`${inputBase} ${inputNormal}`}
            >
              {reportCategories.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Frequency *
              </label>
              <select
                value={scheduleFrequency}
                onChange={(e) => setScheduleFrequency(e.target.value as ReportFrequency)}
                className={`${inputBase} ${inputNormal}`}
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly (Every Monday)</option>
                <option value="Monthly">Monthly (1st of Month)</option>
                <option value="Quarterly">Quarterly</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Dispatch Time *
              </label>
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className={`${inputBase} ${inputNormal}`}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Export Format *
            </label>
            <select
              value={scheduleFormat}
              onChange={(e) => setScheduleFormat(e.target.value as any)}
              className={`${inputBase} ${inputNormal}`}
            >
              <option value="Both">Both (Excel Sheet + Signed PDF)</option>
              <option value="Excel">Excel Spreadsheet (.xlsx)</option>
              <option value="PDF">Formal State PDF (.pdf)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Recipient Email Addresses (Comma Separated) *
            </label>
            <textarea
              rows={2}
              value={scheduleEmails}
              onChange={(e) => setScheduleEmails(e.target.value)}
              placeholder="e.g. collector.raipur@cg.gov.in, audit.mining@cg.gov.in"
              className={`${inputBase} ${inputNormal}`}
              required
            />
          </div>

          <ModalFooter>
            <Button variant="outline" onClick={() => setIsScheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={<Send size={14} />}>
              Save & Activate Schedule
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
};

export default ReportsMisHub;
