import { z } from "zod";

export const miningReachFormSchema = z.object({
  reachId: z.string().min(3, "Reach ID is required"),
  reachName: z.string().min(3, "Reach Name must have at least 3 characters"),
  district: z.string().min(1, "District is required"),
  mandal: z.string().min(1, "Mandal/Tehsil is required"),
  village: z.string().min(1, "Village is required"),
  riverStream: z.string().min(1, "River/Stream is required"),
  latitude: z.coerce.number().min(15, "Invalid Latitude for Chhattisgarh").max(25, "Invalid Latitude for Chhattisgarh"),
  longitude: z.coerce.number().min(78, "Invalid Longitude for Chhattisgarh").max(85, "Invalid Longitude for Chhattisgarh"),
  areaHectares: z.coerce.number().positive("Area must be positive"),
  permittedQuantityMt: z.coerce.number().min(100, "Permitted Quantity must be at least 100 MT"),
  validityStartDate: z.string().min(1, "Start Date is required"),
  validityEndDate: z.string().min(1, "End Date is required"),
  linkedStockyardId: z.string().min(1, "Linked Stockyard is required"),
  environmentalClearanceRef: z.string().min(3, "Environmental Clearance Reference is required"),
  cteCtoRef: z.string().optional(),
}).refine(
  (data) => new Date(data.validityEndDate) > new Date(data.validityStartDate),
  {
    message: "End Date must be after Start Date",
    path: ["validityEndDate"],
  }
);

export const reachStatusUpdateSchema = z.object({
  reachId: z.string(),
  newStatus: z.enum([
    "Draft",
    "Under Verification",
    "Approved",
    "On Hold",
    "Suspended",
    "Expired",
  ]),
  remarks: z.string().optional(),
});

export type MiningReachFormValues = z.infer<typeof miningReachFormSchema>;
export type ReachStatusUpdateValues = z.infer<typeof reachStatusUpdateSchema>;
