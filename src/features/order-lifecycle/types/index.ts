// Standard Order Status Lifecycle Types (18 Sequential Stages + 6 Exception Statuses)

export type StandardOrderStatus =
  | "Draft"
  | "Booking Submitted"
  | "Payment Pending"
  | "Payment Success"
  | "Order Confirmed"
  | "Vehicle Allocation Pending"
  | "Vehicle Allocated"
  | "Driver Accepted"
  | "Pickup Pending"
  | "Vehicle at Sand Reach"
  | "Loading in Progress"
  | "Loaded / Pickup Completed"
  | "Transit Pass Generated"
  | "In Transit"
  | "Reached Delivery Location"
  | "OTP Verification"
  | "Delivered"
  | "Order Closed";

export type ExceptionOrderStatus =
  | "Cancelled"
  | "Payment Failed"
  | "Vehicle Rejected"
  | "Vehicle Reallocation Pending"
  | "Delivery Failed"
  | "Order On Hold";

// Backward-compatible alias union to preserve existing database records and tests
export type LegacyOrderStatus =
  | "Booked"
  | "Booking Confirmed"
  | "Paid"
  | "Vehicle Assigned"
  | "Order Accepted"
  | "Order Rejected"
  | "Loading at Stockyard"
  | "Dispatched"
  | "Trip Completed"
  | "Closed";

export type OrderStatus = StandardOrderStatus | ExceptionOrderStatus | LegacyOrderStatus;

export type OrderPhase =
  | "Booking & Initiation"
  | "Payment & Settlement"
  | "Vehicle Allocation"
  | "Sand Reach & Loading"
  | "Dispatch & Transit"
  | "Delivery & Handover"
  | "Exception & Resolution";

export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: string;
  updatedBy?: string;
  changedBy?: string;
  notes?: string;
  actorRole?: string;
  role?: string;
}

export interface StatusMetadata {
  status: OrderStatus;
  canonicalStatus: StandardOrderStatus | ExceptionOrderStatus;
  stepNumber: number | null; // 1 to 18 for standard stages, null for exception statuses
  isException: boolean;
  phase: OrderPhase;
  label: string;
  shortLabel: string;
  description: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  iconName: string;
  allowedNext: (StandardOrderStatus | ExceptionOrderStatus)[];
  allowedExceptions: ExceptionOrderStatus[];
}
