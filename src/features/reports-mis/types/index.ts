export type ReportCategory =
  | "DAILY_EXCAVATION"
  | "REACH_PRODUCTION"
  | "STOCKYARD_STOCK"
  | "VEHICLE_TRIPS"
  | "BOOKINGS"
  | "REVENUE_PAYMENTS"
  | "DISPATCH_DELIVERY"
  | "ENFORCEMENT_ALERTS"
  | "PERMIT_EXPIRY"
  | "DISTRICT_CONSOLIDATED";

export type ReportFrequency = "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Annual";

export interface ReportFilterCriteria {
  dateRangePreset: "Today" | "This Week" | "This Month" | "Current Quarter" | "FY 2025-26" | "Custom";
  startDate?: string;
  endDate?: string;
  district: string;
  reachId?: string;
  stockyardId?: string;
  statusFilter?: string;
}

export interface ScheduledReportConfig {
  id: string;
  reportCategory: ReportCategory;
  frequency: ReportFrequency;
  recipientEmails: string[];
  exportFormat: "Excel" | "PDF" | "Both";
  isActive: boolean;
  scheduledTime: string;
  department: string;
}

export interface ReachProductionReportItem {
  reachId: string;
  reachName: string;
  district: string;
  leaseHolder: string;
  permittedQuotaMt: number;
  extractedQuantityMt: number;
  balanceQuotaMt: number;
  royaltyPayable: number;
  status: string;
}

export interface PermitClearanceReportItem {
  permitId: string;
  leaseHolder: string;
  reachName: string;
  district: string;
  clearanceType: "Environmental Clearance (EC)" | "Consent to Operate (CTO)" | "Mining Lease (ML)" | "Gram Panchayat NOC";
  validUntil: string;
  daysRemaining: number;
  complianceStatus: "Active" | "Expiring Soon" | "Expired" | "Suspended";
}

export interface DistrictConsolidatedMisItem {
  district: string;
  activeReaches: number;
  stockyardsCount: number;
  totalExcavationMt: number;
  totalDispatchedMt: number;
  grossRevenue: number;
  royaltyCollected: number;
  enforcementAlerts: number;
  compliancePercentage: number;
}
