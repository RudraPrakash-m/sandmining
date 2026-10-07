import { z } from "zod";

export const raiseGrievanceSchema = z.object({
  customerName: z.string().min(2, "Customer name must be at least 2 characters"),
  customerMobile: z
    .string()
    .min(10, "Mobile number must be at least 10 digits")
    .regex(/^[+]?[\d\s-]+$/, "Invalid phone number format"),
  category: z.enum([
    "Delayed Delivery",
    "Sand Quality Issue",
    "Pricing / Tariff Dispute",
    "Weighbridge Discrepancy",
    "Driver Behavior",
    "Transit Theft / Diversion",
    "e-Pass Fraud",
  ]),
  bookingOrderId: z.string().min(1, "Booking/Order ID is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(2, "Location is required"),
  priority: z.enum(["Urgent", "High", "Medium", "Low"]),
  assignedOfficer: z.string().optional(),
  attachmentUrl: z.string().optional(),
  attachmentName: z.string().optional(),
});

export const assignOfficerSchema = z.object({
  officerName: z.string().min(2, "Officer name is required"),
  department: z.string().optional(),
  remarks: z.string().optional(),
});

export const respondGrievanceSchema = z.object({
  message: z.string().min(5, "Response message must be at least 5 characters"),
  isInternal: z.boolean().default(false),
});

export const escalateGrievanceSchema = z.object({
  escalationLevel: z.string().min(2, "Escalation target authority is required"),
  reason: z.string().min(10, "Escalation reason must be at least 10 characters"),
});

export const closeGrievanceSchema = z.object({
  resolutionRemarks: z.string().min(5, "Resolution remarks must be at least 5 characters"),
});

export const reopenGrievanceSchema = z.object({
  reason: z.string().min(5, "Reopen justification must be at least 5 characters"),
});

export type RaiseGrievanceSchemaType = z.infer<typeof raiseGrievanceSchema>;
export type AssignOfficerSchemaType = z.infer<typeof assignOfficerSchema>;
export type RespondGrievanceSchemaType = z.infer<typeof respondGrievanceSchema>;
export type EscalateGrievanceSchemaType = z.infer<typeof escalateGrievanceSchema>;
export type CloseGrievanceSchemaType = z.infer<typeof closeGrievanceSchema>;
export type ReopenGrievanceSchemaType = z.infer<typeof reopenGrievanceSchema>;
