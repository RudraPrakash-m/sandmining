import { z } from "zod";

export const authorizeDispatchSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  stockyardId: z.string().min(1, "Stockyard origin is required"),
  vehicleNumber: z
    .string()
    .min(5, "Vehicle registration plate is required")
    .regex(/^[A-Z]{2}[-\s]?[0-9]{1,2}[-\s]?[A-Z]{1,3}[-\s]?[0-9]{4}$/i, "Format: CG-04-TX-2341"),
  driverName: z.string().min(2, "Driver name is required"),
  driverMobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"),
  sandType: z.string().min(1, "Sand type is required"),
  quantityMt: z
    .number()
    .positive("Quantity must be greater than 0")
    .max(50, "Quantity cannot exceed maximum truck payload"),
  weighbridgeSlipNumber: z.string().min(1, "Weighbridge slip reference is required"),
  destination: z.string().min(3, "Delivery destination address is required"),
  remarks: z.string().max(250, "Remarks too long").optional(),
});

export const assignVehicleSchema = z.object({
  dispatchId: z.string().min(1, "Dispatch ID is required"),
  vehicleNumber: z.string().min(5, "Vehicle number is required"),
  driverName: z.string().min(2, "Driver name is required"),
  driverMobile: z.string().regex(/^[6-9]\d{9}$/, "Valid 10-digit mobile is required"),
});

export const cancelDispatchSchema = z.object({
  dispatchId: z.string().min(1, "Dispatch ID is required"),
  reason: z.string().min(10, "Cancellation reason must be at least 10 characters"),
});

export type AuthorizeDispatchSchemaType = z.infer<typeof authorizeDispatchSchema>;
