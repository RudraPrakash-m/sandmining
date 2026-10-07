import { z } from "zod";

export const stockyardSchema = z.object({
  name: z.string().min(3, "Stockyard Name must be at least 3 characters").max(100),
  district: z.string().min(1, "District is required"),
  location: z.string().min(3, "Location / Landmark is required"),
  sandType: z.enum([
    "Coarse River Sand",
    "Medium Concrete Sand",
    "Fine Plastering Sand",
    "Gravel Sand",
  ]),
  openingStockMt: z
    .number()
    .min(0, "Opening stock cannot be negative"),
  capacityMt: z
    .number()
    .positive("Capacity must be greater than 0"),
  linkedWeighbridgeId: z.string().min(1, "Linked weighbridge is required"),
  managerName: z.string().optional(),
  contactNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number")
    .optional()
    .or(z.literal("")),
  status: z.enum(["Active", "At Capacity", "Maintenance", "Closed"]),
});

export const stockAdjustmentSchema = z.object({
  stockyardId: z.string().min(1, "Stockyard is required"),
  adjustmentType: z.enum(["INCREASE", "DECREASE"]),
  quantityMt: z.number().positive("Quantity must be greater than 0"),
  reason: z.string().min(10, "Adjustment reason must be at least 10 characters (physical audit reference, settling loss, etc.)"),
  authorizedBy: z.string().min(2, "Authorizing officer name is required"),
});

export const stockTransferSchema = z.object({
  fromStockyardId: z.string().min(1, "Source stockyard is required"),
  toStockyardId: z.string().min(1, "Destination stockyard is required"),
  sandType: z.enum([
    "Coarse River Sand",
    "Medium Concrete Sand",
    "Fine Plastering Sand",
    "Gravel Sand",
  ]),
  quantityMt: z.number().positive("Transfer quantity must be greater than 0"),
  vehicleNumber: z.string().min(6, "Valid transport vehicle number is required"),
  driverName: z.string().min(2, "Driver name is required"),
  remarks: z.string().optional(),
});

export type StockyardSchemaType = z.infer<typeof stockyardSchema>;
export type StockAdjustmentSchemaType = z.infer<typeof stockAdjustmentSchema>;
export type StockTransferSchemaType = z.infer<typeof stockTransferSchema>;
