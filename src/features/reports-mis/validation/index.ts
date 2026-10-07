import { z } from "zod";

export const filterCriteriaSchema = z.object({
  dateRangePreset: z.enum(["Today", "This Week", "This Month", "Current Quarter", "FY 2025-26", "Custom"]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  district: z.string().default("ALL"),
  reachId: z.string().optional(),
  stockyardId: z.string().optional(),
  statusFilter: z.string().optional(),
});

export const scheduleReportSchema = z.object({
  reportCategory: z.enum([
    "DAILY_EXCAVATION",
    "REACH_PRODUCTION",
    "STOCKYARD_STOCK",
    "VEHICLE_TRIPS",
    "BOOKINGS",
    "REVENUE_PAYMENTS",
    "DISPATCH_DELIVERY",
    "ENFORCEMENT_ALERTS",
    "PERMIT_EXPIRY",
    "DISTRICT_CONSOLIDATED",
  ]),
  frequency: z.enum(["Daily", "Weekly", "Monthly", "Quarterly", "Annual"]),
  recipientEmails: z.string().min(5, "At least one valid recipient email is required"),
  exportFormat: z.enum(["Excel", "PDF", "Both"]),
  scheduledTime: z.string().min(1, "Scheduled delivery time is required"),
  department: z.string().min(2, "Department name is required"),
});

export type FilterCriteriaSchemaType = z.infer<typeof filterCriteriaSchema>;
export type ScheduleReportSchemaType = z.infer<typeof scheduleReportSchema>;
