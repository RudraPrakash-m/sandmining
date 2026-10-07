import { z } from "zod";

export const createPermitSchema = z.object({
  permitNumber: z.string().min(3, "Permit number is required"),
  holderAgency: z.string().min(3, "Permit Holder / Agency name is required"),
  reachId: z.string().min(1, "Mining Reach is required"),
  approvedQuantityMt: z.coerce.number().min(100, "Approved quantity must be at least 100 MT"),
  startDate: z.string().min(1, "Start Date is required"),
  endDate: z.string().min(1, "End Date is required"),
  royaltyPerMt: z.coerce.number().min(0, "Royalty rate cannot be negative"),
  conditions: z.string().min(5, "Statutory mining conditions are required"),
  dmfPerMt: z.coerce.number().min(0).default(25),
  securityDepositRs: z.coerce.number().min(0).default(500000),
}).refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  {
    message: "Expiry End Date must be after Start Date",
    path: ["endDate"],
  }
);

export const renewPermitSchema = z.object({
  permitId: z.string(),
  extendedEndDate: z.string().min(1, "Extended End Date is required"),
  additionalQuotaMt: z.coerce.number().min(0, "Additional quota must be 0 or more"),
  renewalRemarks: z.string().min(3, "Renewal remarks are required"),
});

export const verifyPermitInspectionSchema = z.object({
  permitId: z.string(),
  inspectionStatus: z.enum(["Verified", "Inspection Due", "Non-Compliant", "Pending Review"]),
  inspectingOfficer: z.string().min(3, "Inspecting Officer Name is required"),
  remarks: z.string().min(3, "Inspection observations are required"),
});

export type CreatePermitFormValues = z.infer<typeof createPermitSchema>;
export type RenewPermitFormValues = z.infer<typeof renewPermitSchema>;
export type VerifyPermitInspectionValues = z.infer<typeof verifyPermitInspectionSchema>;
