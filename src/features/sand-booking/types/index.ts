import type { SandBooking } from "@/features/shared-simulation/types";

export type { SandBooking };

export type SandType =
  | "Coarse Sand"
  | "Fine Sand"
  | "Coarse River Sand"
  | "Fine Plastering Sand"
  | "Medium Concrete Sand"
  | "Gravel Mix Sand"
  | "Manufactured / M-Sand"
  | "Filter Bed Sand";

export type BookingPurpose = "Domestic" | "Commercial" | "Government Work";

export type BookingUnit = "MT" | "Cubic Meter";

export type DeliveryType = "Regular Delivery" | "Bulk Order" | "Doorstep Express";

export type { CustomerCategory } from "@/features/shared-simulation/types";

export type TransportMode = "Department-arranged transport" | "Own vehicle, if permitted";

export type TransportOption =
  | "Department-arranged transport"
  | "Own vehicle, if permitted"
  | "Government Logistics"
  | "Government Empanelled Logistics"
  | "Customer Own Vehicle"
  | "Customer Own Vehicle / Self-Pickup"
  | "Heavy Multiaxle Fleet";

export interface TariffBreakdown {
  basePricePerMt: number;
  sandAmount: number;
  royaltyAmount: number;
  dmfCess: number;
  envSurcharge: number;
  transportCharges: number;
  gstAmount: number;
  totalAmount: number;
}

export interface SandAvailabilityCheck {
  stockyardId: string;
  stockyardName: string;
  availableQuantityMt: number;
  requestedQuantityMt: number;
  isAvailable: boolean;
  maxAllowablePerOrder: number;
}

export interface SandBookingFilters {
  search?: string;
  sandType?: string;
  paymentStatus?: string;
  bookingStatus?: string;
  stockyardId?: string;
}
