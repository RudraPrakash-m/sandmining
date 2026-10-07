import { z } from "zod";

export const processPaymentSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  orderId: z.string().min(1, "Order ID is required"),
  paymentMode: z.enum([
    "UPI / QR",
    "Net Banking",
    "Debit / Credit Card",
    "Treasury Challan",
  ]),
  totalAmount: z.number().positive("Total amount must be greater than zero"),
  bankOrUpiRef: z.string().optional(),
});

export const paymentRefundSchema = z.object({
  transactionId: z.string().min(1, "Transaction ID is required"),
  bookingId: z.string().min(1, "Booking ID is required"),
  refundAmount: z.number().positive("Refund amount must be positive"),
  reason: z.string().min(5, "Please provide a valid cancellation/refund reason"),
  authorizedBy: z.string().min(2, "Authorizing officer name is required"),
});

export type ProcessPaymentSchemaType = z.infer<typeof processPaymentSchema>;
export type PaymentRefundSchemaType = z.infer<typeof paymentRefundSchema>;
