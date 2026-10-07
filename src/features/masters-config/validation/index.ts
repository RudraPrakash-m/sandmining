import { z } from "zod";

/**
 * Validation rule per specification:
 * "Master changes require authorization and effective date."
 */
const baseMasterFields = {
  authorizedBy: z.string().min(3, "Authorizing Officer ID/Name is required"),
  effectiveDate: z.string().min(1, "Effective Date is required"),
  status: z.enum(["Active", "Pending Approval", "Inactive"]).default("Pending Approval"),
};

export const districtMandalSchema = z.object({
  ...baseMasterFields,
  code: z.string().min(2, "Jurisdiction code is required"),
  district: z.string().min(2, "District name is required"),
  mandal: z.string().min(2, "Mandal/Tehsil name is required"),
  village: z.string().min(2, "Village/Panchayat name is required"),
});

export const riverReachSchema = z.object({
  ...baseMasterFields,
  reachCode: z.string().min(2, "Reach code is required"),
  reachName: z.string().min(2, "Reach/Block name is required"),
  riverBasin: z.string().min(2, "River basin is required"),
  district: z.string().min(2, "District is required"),
  permittedAnnualQuotaMt: z.number().positive("Permitted annual quota must be greater than 0"),
});

export const sandTypeSchema = z.object({
  ...baseMasterFields,
  sandCode: z.string().min(2, "Sand code is required"),
  sandType: z.string().min(2, "Sand type/grade name is required"),
  specification: z.string().min(2, "Granular/IS Specification is required"),
  densityTonsPerCum: z.number().positive("Density (MT/m³) must be positive"),
});

export const stockyardSchema = z.object({
  ...baseMasterFields,
  stockyardCode: z.string().min(2, "Stockyard code is required"),
  name: z.string().min(2, "Stockyard name is required"),
  district: z.string().min(2, "District is required"),
  capacityMt: z.number().positive("Capacity in MT must be positive"),
  supervisor: z.string().min(2, "Supervisor name is required"),
});

export const vehicleCapacitySchema = z.object({
  ...baseMasterFields,
  categoryCode: z.string().min(2, "Vehicle category code is required"),
  categoryName: z.string().min(2, "Vehicle category name is required"),
  axlesCount: z.number().int().min(2, "Axle count must be at least 2"),
  maxGvwMt: z.number().positive("Max GVW in MT must be positive"),
  maxSandPayloadMt: z.number().positive("Max Sand Payload MT must be positive"),
  minTareMt: z.number().positive("Min Tare MT must be positive"),
  overloadTolerancePercent: z.number().min(0).max(25, "Overload buffer must be between 0% and 25%"),
});

export const chargesTariffSchema = z.object({
  ...baseMasterFields,
  tariffCode: z.string().min(2, "Tariff code is required"),
  sandType: z.string().min(2, "Sand type is required"),
  basePricePerMt: z.number().min(0, "Base price cannot be negative"),
  royaltyPerMt: z.number().min(0, "Royalty cannot be negative"),
  dmfCessPercent: z.number().min(0).max(100, "DMF Cess % must be valid"),
  loadingChargePerMt: z.number().min(0, "Loading charge cannot be negative"),
  transportPerKmPerMt: z.number().min(0, "Transport rate cannot be negative"),
});

export const statusCodeSchema = z.object({
  ...baseMasterFields,
  moduleName: z.string().min(2, "Module name is required"),
  statusCode: z.string().min(2, "Status code is required"),
  statusLabel: z.string().min(2, "Status label is required"),
  description: z.string().min(3, "Description is required"),
  colorVariant: z.enum(["primary", "success", "warning", "danger", "info", "secondary"]).default("primary"),
});

export const alertThresholdSchema = z.object({
  ...baseMasterFields,
  thresholdCode: z.string().min(2, "Threshold code is required"),
  parameterName: z.string().min(2, "Parameter name is required"),
  module: z.string().min(2, "Module is required"),
  triggerCondition: z.string().min(2, "Trigger condition is required"),
  thresholdValue: z.string().min(1, "Threshold value is required"),
  severityLevel: z.enum(["Critical", "High", "Moderate"]).default("Moderate"),
});

export const departmentSchema = z.object({
  ...baseMasterFields,
  departmentCode: z.string().min(2, "Department code is required"),
  name: z.string().min(2, "Department name is required"),
  nodalOfficer: z.string().min(2, "Nodal Officer name is required"),
  contactEmail: z.string().email("Valid official email required"),
  contactMobile: z.string().min(10, "Mobile number must be at least 10 digits"),
});

export const masterApprovalSchema = z.object({
  id: z.string().min(1, "Master record ID is required"),
  category: z.string().min(1, "Master category is required"),
  approverOfficerId: z.string().min(3, "Authorizing Approver ID is required"),
  approvalRemarks: z.string().min(3, "Approval remarks required"),
  effectiveDate: z.string().min(1, "Confirmed effective date is required"),
});

export const masterImportSchema = z.object({
  category: z.string().min(1, "Category is required"),
  authorizedBy: z.string().min(3, "Authorizing officer ID is required"),
  effectiveDate: z.string().min(1, "Effective date is required"),
  fileFormat: z.enum(["CSV", "JSON", "XLSX"]).default("CSV"),
  dataPayload: z.string().min(5, "Raw data or file payload is required"),
});

export type DistrictMandalSchemaType = z.infer<typeof districtMandalSchema>;
export type RiverReachSchemaType = z.infer<typeof riverReachSchema>;
export type SandTypeSchemaType = z.infer<typeof sandTypeSchema>;
export type StockyardSchemaType = z.infer<typeof stockyardSchema>;
export type VehicleCapacitySchemaType = z.infer<typeof vehicleCapacitySchema>;
export type ChargesTariffSchemaType = z.infer<typeof chargesTariffSchema>;
export type StatusCodeSchemaType = z.infer<typeof statusCodeSchema>;
export type AlertThresholdSchemaType = z.infer<typeof alertThresholdSchema>;
export type DepartmentSchemaType = z.infer<typeof departmentSchema>;
export type MasterApprovalSchemaType = z.infer<typeof masterApprovalSchema>;
export type MasterImportSchemaType = z.infer<typeof masterImportSchema>;
