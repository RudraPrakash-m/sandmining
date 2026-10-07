import type { PaymentTransaction } from "@/features/shared-simulation/types";

export type { PaymentTransaction };

export type PaymentMode =
  | "UPI / QR"
  | "Net Banking"
  | "Debit / Credit Card"
  | "Treasury Challan";

export type PaymentStatus =
  | "Success"
  | "Pending"
  | "Failed"
  | "Reconciled"
  | "Refunded";

export interface ProcessPaymentPayload {
  bookingId: string;
  orderId: string;
  customerName: string;
  quantityMt?: number;
  sandType?: string;
  sandAmount?: number;
  paymentMode: PaymentMode;
  totalAmount: number;
  bankOrUpiRef?: string;
  dmfCess?: number;
  envSurcharge?: number;
}

export interface PaymentRefundPayload {
  transactionId: string;
  bookingId: string;
  refundAmount: number;
  reason: string;
  authorizedBy: string;
}

export interface PaymentFilters {
  search?: string;
  paymentMode?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
}
