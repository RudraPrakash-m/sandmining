import { z } from "zod";

export const weighbridgeCaptureSchema = z.object({
  weighbridgeId: z.string().min(1, "Weighbridge scale selection is required"),
  vehicleNumber: z
    .string()
    .min(5, "Valid vehicle registration plate is required")
    .regex(/^[A-Z]{2}[-\s]?[0-9]{1,2}[-\s]?[A-Z]{1,3}[-\s]?[0-9]{4}$/i, "Format: CG-04-TX-2341"),
  bookingId: z.string().min(1, "Booking reference is required"),
  ePassId: z.string().min(1, "e-Pass identifier is required"),
  stockyardId: z.string().min(1, "Origin stockyard is required"),
  tareWeightKg: z
    .number()
    .positive("Tare weight must be positive")
    .min(2000, "Tare weight too low for commercial transport vehicle")
    .max(25000, "Tare weight exceeds reasonable truck unladen weight"),
  grossWeightKg: z
    .number()
    .positive("Gross weight must be positive"),
  operatorName: z.string().min(2, "Weighbridge operator name is required"),
  remarks: z.string().max(300, "Remarks too long").optional(),
}).refine((data) => data.grossWeightKg > data.tareWeightKg, {
  message: "Gross loaded weight must strictly exceed tare empty weight",
  path: ["grossWeightKg"],
});

export type WeighbridgeCaptureSchemaType = z.infer<typeof weighbridgeCaptureSchema>;
