import type { DeliveryConfirmation } from "@/features/shared-simulation/types";

export type { DeliveryConfirmation };

export type DeliveryStatus = "Delivered" | "Pending OTP" | "Failed";

export interface ConfirmDeliveryPayload {
  deliveryId: string;
  bookingId: string;
  otpCode: string;
  signatureCaptured: boolean;
  signatureDataUrl?: string;
  photoUrl?: string;
  remarks?: string;
  deliveryTime?: string;
  geoCoordinates?: string;
}

export interface DeliveryFilters {
  search?: string;
  status?: DeliveryStatus | "All";
  startDate?: string;
  endDate?: string;
}
