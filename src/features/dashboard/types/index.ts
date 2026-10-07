export type DateRangePreset = "today" | "last7days" | "monthToDate" | "custom";

export interface DashboardKpiSummary {
  activeReaches: number;
  activeReachesTrendPct: number;
  todayExcavationMt: number;
  todayExcavationTrendPct: number;
  availableStockMt: number;
  availableStockTrendPct: number;
  todayBookings: number;
  todayBookingsTrendPct: number;
  todayDispatches: number;
  todayDispatchesTrendPct: number;
  vehiclesInTransit: number;
  deliveredToday: number;
  todayRevenueCr: number;
  todayRevenueTrendPct: number;
  totalDistrictsCovered: number;
}

export interface DistrictMapData {
  id: string;
  name: string;
  code: string;
  stockLabel: string;
  stockMt: number;
  status: "High" | "Medium" | "Low";
  fillColor: string;
  hoverColor: string;
  path: string;
  labelX: number;
  labelY: number;
  activeReaches: number;
  todayDispatchMt: number;
  totalPermits: number;
  complianceRatePct: number;
}

export interface RevenueTrendPoint {
  period: string;
  revenueCr: number;
  targetCr: number;
  royaltyCollectedCr: number;
}

export interface BookingDispatchTrendPoint {
  timeOrDate: string;
  bookings: number;
  dispatches: number;
  transitActive: number;
}

export type AlertSeverity = "low" | "medium" | "high" | "critical";

export interface RecentAlertItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  severity: AlertSeverity;
  category: "weighbridge" | "e-transit" | "payment" | "telematics";
  district: string;
  referenceId?: string;
  actionRequired?: string;
}

export interface IllegalMiningAlertItem {
  id: string;
  reachName: string;
  district: string;
  violationType: "Geofence Breach" | "Night Excavation Violation" | "Unregistered Heavy Machinery" | "Overdepth Dredging";
  detectedAt: string;
  severity: "critical" | "high";
  coordinates: string;
  investigationStatus: "Pending Dispatch" | "Officer Assigned" | "Under Review" | "Resolved";
  assignedOfficer?: string;
  sensorTriggerId: string;
}

export interface DashboardFilterState {
  selectedDistrict: string; // "ALL" or district id
  dateRange: DateRangePreset;
  customStartDate?: string;
  customEndDate?: string;
  searchQuery: string;
  activeAlertTab: "recent" | "illegal";
}

export type ExportFormat = "csv" | "excel" | "pdf";

export type FinancialMetricTab = "sales" | "royalty" | "net";

export interface DistrictFinancialMetric {
  districtId: string;
  districtName: string;
  districtCode: string;
  salesLakhs: number;
  royaltyLakhs: number;
  netCollectionLakhs: number;
  growthPct: number;
}

export interface MonthlySalesDataPoint {
  month: string;
  salesCr: number;
  volumeMt: number;
  targetCr: number;
  growthPct: number;
}

// ── 6-Level Hierarchical Drill-down Engine Types ─────────────────────────
export type DrillDownLevel = "state" | "district" | "reach" | "order" | "vehicle" | "delivery";

export interface DrillDownState {
  level: DrillDownLevel;
  stateName: string;
  selectedDistrictId?: string;
  selectedReachId?: string;
  selectedOrderId?: string;
  selectedVehicleNumber?: string;
  selectedDeliveryId?: string;
}

// ── 16 Key KPIs Data Model ──────────────────────────────────────────────
export interface AdminRealTimeKpiData {
  totalSandReaches: number;
  activeSandReaches: number;
  totalAvailableSandMt: number;
  todayBookingsCount: number;
  todayBookingsMt: number;
  todayRevenueRs: number;
  pendingPaymentsCount: number;
  pendingPaymentsRs: number;
  confirmedOrdersCount: number;
  vehiclesAvailableCount: number;
  vehiclesOnTripCount: number;
  pickupPendingCount: number;
  inTransitCount: number;
  deliveredCount: number;
  delayedDeliveriesCount: number;
  cancelledOrdersCount: number;
  complaintsTotalCount: number;
  complaintsOpenCount: number;
}

// ── District-wise Sand Utilization Model ─────────────────────────────────
export interface DistrictUtilizationItem {
  id: string;
  districtName: string;
  districtCode: string;
  riverBasin: string;
  totalReaches: number;
  activeReaches: number;
  approvedQuotaMt: number;
  excavatedMt: number;
  dispatchedMt: number;
  availableStockMt: number;
  utilizationRatePct: number;
  complianceRatePct: number;
  status: "Optimal" | "Near Quota" | "Low Utilization";
}


