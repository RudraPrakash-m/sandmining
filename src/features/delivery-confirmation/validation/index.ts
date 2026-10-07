import { z } from "zod";

export const confirmDeliverySchema = z.object({
  deliveryId: z.string().min(1, "Delivery ID is required"),
  bookingId: z.string().min(1, "Booking ID is required"),
  otpCode: z
    .string()
    .min(4, "OTP must be at least 4 digits")
    .max(6, "OTP cannot exceed 6 digits")
    .regex(/^\d+$/, "OTP must contain numbers only"),
  signatureCaptured: z
    .boolean()
    .refine((val) => val === true, "Customer digital signature is required for POD certification"),
  photoUrl: z.string().optional(),
  remarks: z.string().max(500, "Remarks cannot exceed 500 characters").optional(),
});

export type ConfirmDeliverySchemaType = z.infer<typeof confirmDeliverySchema>;
