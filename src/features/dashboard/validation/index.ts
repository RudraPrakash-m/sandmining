import { z } from "zod";

export const dashboardFilterSchema = z.object({
  selectedDistrict: z.string().default("ALL"),
  dateRange: z.enum(["today", "last7days", "monthToDate", "custom"]).default("today"),
  customStartDate: z.string().optional(),
  customEndDate: z.string().optional(),
  searchQuery: z.string().default(""),
  activeAlertTab: z.enum(["recent", "illegal"]).default("recent"),
});

export const dashboardExportSchema = z.object({
  format: z.enum(["csv", "excel", "pdf"]),
  district: z.string().default("ALL"),
  dateRange: z.enum(["today", "last7days", "monthToDate", "custom"]),
  includeCharts: z.boolean().default(true),
  includeAlerts: z.boolean().default(true),
});

export type DashboardFilterFormValues = z.infer<typeof dashboardFilterSchema>;
export type DashboardExportFormValues = z.infer<typeof dashboardExportSchema>;
