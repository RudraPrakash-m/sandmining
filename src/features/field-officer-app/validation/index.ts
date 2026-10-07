import { z } from "zod";

export const verifyPassSchema = z.object({
  ePassNumber: z.string().min(1, "e-Pass number or QR code scan is required"),
  vehicleNumber: z.string().optional(),
});

export const spotWeighSchema = z.object({
  vehicleNumber: z.string().min(3, "Vehicle registration number is required"),
  grossWeightMt: z.number().min(0.1, "Gross weight must be greater than 0"),
  tareWeightMt: z.number().min(0.1, "Tare weight must be greater than 0"),
});

export const quickViolationSchema = z.object({
  violationType: z.string().min(1, "Violation type is required"),
  vehicleNumber: z.string().min(3, "Vehicle number is required"),
  location: z.string().min(3, "Location is required"),
  notes: z.string().min(5, "Incident observation notes must be at least 5 characters"),
});

export type VerifyPassSchemaType = z.infer<typeof verifyPassSchema>;
export type SpotWeighSchemaType = z.infer<typeof spotWeighSchema>;
export type QuickViolationSchemaType = z.infer<typeof quickViolationSchema>;
