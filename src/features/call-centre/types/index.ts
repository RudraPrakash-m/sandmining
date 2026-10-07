import type {
  SandBooking,
  Vehicle,
  DeliveryConfirmation,
  GrievanceTicket,
  VehicleTelemetry,
} from "@/features/shared-simulation/types";

export type SearchCriteriaType = "orderId" | "mobileNumber" | "vehicleNumber" | "all";

export interface CallCentreSearchFilters {
  query: string;
  type: SearchCriteriaType;
}

export interface CallCentreConsignmentResult {
  booking: SandBooking;
  delivery?: DeliveryConfirmation;
  vehicle?: Vehicle;
  telemetry?: VehicleTelemetry;
  complaints: GrievanceTicket[];
  computedEta: string;
  remainingDistanceKm: number;
  trafficStatus: "Normal" | "Minor Congestion" | "Major Delay / Halt" | "Corridor Clear";
  deliveryRemarksHistory: string[];
}

export interface CallCentreComplaintPayload {
  orderId: string;
  customerName: string;
  customerMobile: string;
  category:
    | "Delayed Delivery"
    | "Sand Quality Issue"
    | "Pricing / Tariff Dispute"
    | "Weighbridge Discrepancy"
    | "Driver Behavior"
    | "Transit Theft / Diversion"
    | "e-Pass Fraud";
  priority: "Urgent" | "High" | "Medium" | "Low";
  description: string;
  callerRemarks?: string;
}

export interface CallCentreRemarksPayload {
  orderId: string;
  deliveryId?: string;
  remarks: string;
  callerCategory: "Customer Inquiry" | "Address Landmark Direction" | "Driver Update" | "Unloading Access Note" | "Other";
}

export interface CallCentreEscalationPayload {
  orderId: string;
  ticketId?: string;
  escalationLevel: "District Mining Officer (DMO)" | "District Collector" | "Enforcement Flying Squad" | "State Sand Nodal Officer";
  urgencyReason: string;
  targetResponseHours: number;
}
