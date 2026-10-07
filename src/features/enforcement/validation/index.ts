import { z } from "zod";

export const createEnforcementAlertSchema = z.object({
  alertId: z.string().min(1, "Alert ID is required"),
  location: z.string().min(3, "Location or GPS coordinates are required"),
  reachId: z.string().optional(),
  reachName: z.string().optional(),
  vehicleNumber: z.string().optional(),
  alertType: z.enum([
    "Illegal Excavation",
    "Route Deviation",
    "Geofence Breach",
    "Overloading",
    "Unregistered Vehicle",
    "Expired e-Pass",
    "Night-time Mining",
    "Weighbridge Bypass",
  ]),
  dateTime: z.string().min(1, "Date and time are required"),
  evidencePhotoUrl: z.string().min(1, "Evidence photo or document is required"),
  assignedOfficer: z.string().min(2, "Assigned officer/squad is required"),
  severity: z.enum(["Critical", "High", "Moderate"]),
  actionStatus: z.enum([
    "New Alert",
    "Squad Assigned",
    "Under Investigation",
    "Vehicle Seized",
    "Penalty Levied",
    "Closed",
  ]),
  caseNotes: z.string().min(10, "Detailed incident observation notes must be at least 10 characters"),
});

export const assignOfficerSchema = z.object({
  officerName: z.string().min(2, "Officer or Squad name is required"),
  squadName: z.string().optional(),
  remarks: z.string().optional(),
});

export const investigateAlertSchema = z.object({
  inspectionNotes: z.string().min(5, "Inspection notes must be at least 5 characters"),
  penaltyAmount: z.number().min(0).optional(),
  firNumber: z.string().optional(),
});

export const seizeVehicleSchema = z.object({
  seizureOrderNumber: z.string().min(1, "Seizure order number is required"),
  firNumber: z.string().optional(),
  penaltyAmount: z.number().min(0).optional(),
  seizureRemarks: z.string().min(5, "Seizure remarks must be at least 5 characters"),
});

export const closeCaseSchema = z.object({
  resolutionRemarks: z.string().min(5, "Resolution remarks must be at least 5 characters"),
  penaltyPaidAmount: z.number().min(0).optional(),
});

export type CreateEnforcementAlertSchemaType = z.infer<typeof createEnforcementAlertSchema>;
export type AssignOfficerSchemaType = z.infer<typeof assignOfficerSchema>;
export type InvestigateAlertSchemaType = z.infer<typeof investigateAlertSchema>;
export type SeizeVehicleSchemaType = z.infer<typeof seizeVehicleSchema>;
export type CloseCaseSchemaType = z.infer<typeof closeCaseSchema>;
