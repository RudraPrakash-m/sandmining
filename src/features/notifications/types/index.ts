export type SmsStageKey =
  | "REGISTRATION_OTP"
  | "BOOKING_CONFIRMATION"
  | "PAYMENT_SUCCESS"
  | "ORDER_ID"
  | "VEHICLE_ALLOCATION"
  | "VEHICLE_NUMBER"
  | "DRIVER_DETAILS"
  | "DELIVERY_OTP"
  | "DELIVERY_CONFIRMATION"
  | "CANCELLATION_FAILURE";

export type SmsDeliveryStatus = "Delivered" | "Sent" | "Failed" | "Queued";

export type TelecomCarrier =
  | "Airtel DLT Gateway"
  | "Jio Telecom DLT"
  | "BSNL National NIC SMS"
  | "Vi Enterprise DLT";

export interface SmsStageMetadata {
  orderId?: string;
  bookingId?: string;
  recipientName?: string;
  recipientMobile?: string;
  recipientRole?: string;
  otpCode?: string;
  quantityMt?: number;
  amountRs?: number;
  txnId?: string;
  stockyardName?: string;
  vehicleNumber?: string;
  vehicleType?: string;
  capacityMt?: number;
  driverName?: string;
  driverMobile?: string;
  ePassNumber?: string;
  trackingUrl?: string;
  receiptNumber?: string;
  cancellationReason?: string;
  refundAmount?: number;
  refundRef?: string;
  tentativeDeliveryTime?: string;
  destinationAddress?: string;
  deliveryTimestamp?: string;
}

export interface CustomerSmsNotification {
  id: string;
  smsRefId: string;
  stage: SmsStageKey;
  stageNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  stageName: string;
  orderId?: string;
  bookingId?: string;
  recipientName: string;
  recipientMobile: string;
  recipientRole?: string;
  messageText: string;
  senderHeader: string; // e.g., "TS-SSMMS" or "TG-SAND"
  dltTemplateId: string; // Statutory TRAI DLT Template ID
  status: SmsDeliveryStatus;
  dispatchedAt: string;
  deliveredAt?: string;
  carrierRoute: TelecomCarrier;
  telecomMessageId: string;
  deliveryAckCode?: string;
  metadata?: SmsStageMetadata;
}

export interface SmsStageConfig {
  key: SmsStageKey;
  stageNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  name: string;
  category: "Citizen Onboarding" | "Booking & Commerce" | "Logistics & Allocation" | "Transit & Delivery" | "Exception & Refund";
  dltTemplateId: string;
  senderHeader: string;
  description: string;
  manualReference: string;
  color: string;
  bgLight: string;
  textColor: string;
}

export const SMS_STAGES_CONFIG: Record<SmsStageKey, SmsStageConfig> = {
  REGISTRATION_OTP: {
    key: "REGISTRATION_OTP",
    stageNumber: 1,
    name: "Registration / OTP",
    category: "Citizen Onboarding",
    dltTemplateId: "DLT-1107168923401",
    senderHeader: "TG-SSMMS",
    description: "Citizen/consumer registration mobile verification OTP",
    manualReference: "Telangana SSMMS Manual Sec 2.1: Citizen Onboarding & Mobile KYC",
    color: "#6366f1",
    bgLight: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800",
    textColor: "text-indigo-700 dark:text-indigo-300",
  },
  BOOKING_CONFIRMATION: {
    key: "BOOKING_CONFIRMATION",
    stageNumber: 2,
    name: "Booking Confirmation",
    category: "Booking & Commerce",
    dltTemplateId: "DLT-1107168923402",
    senderHeader: "TG-SSMMS",
    description: "Online booking submitted & quota reserved awaiting payment",
    manualReference: "Telangana SSMMS Manual Sec 3.2: Online Sand Booking Registration",
    color: "#0284c7",
    bgLight: "bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800",
    textColor: "text-sky-700 dark:text-sky-300",
  },
  PAYMENT_SUCCESS: {
    key: "PAYMENT_SUCCESS",
    stageNumber: 3,
    name: "Payment Success",
    category: "Booking & Commerce",
    dltTemplateId: "DLT-1107168923403",
    senderHeader: "TG-SSMMS",
    description: "Payment received with mineral cess, DMF, and transport charges",
    manualReference: "Telangana SSMMS Manual Sec 3.5: Gateway Settlement & Revenue Receipt",
    color: "#16a34a",
    bgLight: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
    textColor: "text-emerald-700 dark:text-emerald-300",
  },
  ORDER_ID: {
    key: "ORDER_ID",
    stageNumber: 4,
    name: "Order ID",
    category: "Booking & Commerce",
    dltTemplateId: "DLT-1107168923404",
    senderHeader: "TG-SSMMS",
    description: "Statutory Order ID confirmed with portal tracking link",
    manualReference: "Telangana SSMMS Manual Sec 4.1: Statutory Order Allotment",
    color: "#0d9488",
    bgLight: "bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800",
    textColor: "text-teal-700 dark:text-teal-300",
  },
  VEHICLE_ALLOCATION: {
    key: "VEHICLE_ALLOCATION",
    stageNumber: 5,
    name: "Vehicle Allocation",
    category: "Logistics & Allocation",
    dltTemplateId: "DLT-1107168923405",
    senderHeader: "TG-SSMMS",
    description: "Automated FIFO queue allocated vehicle & tentative delivery window",
    manualReference: "Telangana SSMMS Manual Sec 5.2: Automated FIFO Vehicle Allotment",
    color: "#ca8a04",
    bgLight: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
    textColor: "text-amber-700 dark:text-amber-300",
  },
  VEHICLE_NUMBER: {
    key: "VEHICLE_NUMBER",
    stageNumber: 6,
    name: "Vehicle Number",
    category: "Logistics & Allocation",
    dltTemplateId: "DLT-1107168923406",
    senderHeader: "TG-SSMMS",
    description: "Stockyard weighment verified, assigned registration number sent",
    manualReference: "Telangana SSMMS Manual Sec 5.6: Weighbridge Gate-out & Vehicle Tagging",
    color: "#d97706",
    bgLight: "bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800",
    textColor: "text-orange-700 dark:text-orange-300",
  },
  DRIVER_DETAILS: {
    key: "DRIVER_DETAILS",
    stageNumber: 7,
    name: "Driver Details",
    category: "Transit & Delivery",
    dltTemplateId: "DLT-1107168923407",
    senderHeader: "TG-SSMMS",
    description: "Driver name, phone, Digital Transit Pass & live GPS tracking link",
    manualReference: "Telangana SSMMS Manual Sec 6.3: Consignment In-Transit Dispatch",
    color: "#2563eb",
    bgLight: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800",
    textColor: "text-blue-700 dark:text-blue-300",
  },
  DELIVERY_OTP: {
    key: "DELIVERY_OTP",
    stageNumber: 8,
    name: "Delivery OTP",
    category: "Transit & Delivery",
    dltTemplateId: "DLT-1107168923408",
    senderHeader: "TG-SSMMS",
    description: "4-Digit Handover OTP triggered when vehicle arrives at customer site",
    manualReference: "Telangana SSMMS Manual Sec 7.1: Geofence Arrival & Customer OTP Handover",
    color: "#e11d48",
    bgLight: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800",
    textColor: "text-rose-700 dark:text-rose-300",
  },
  DELIVERY_CONFIRMATION: {
    key: "DELIVERY_CONFIRMATION",
    stageNumber: 9,
    name: "Delivery Confirmation",
    category: "Transit & Delivery",
    dltTemplateId: "DLT-1107168923409",
    senderHeader: "TG-SSMMS",
    description: "Trip POD certified, order closed, Form-VIII receipt link provided",
    manualReference: "Telangana SSMMS Manual Sec 7.4: Digital Proof of Delivery & Order Closure",
    color: "#059669",
    bgLight: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
    textColor: "text-emerald-700 dark:text-emerald-300",
  },
  CANCELLATION_FAILURE: {
    key: "CANCELLATION_FAILURE",
    stageNumber: 10,
    name: "Cancellation / Failure",
    category: "Exception & Refund",
    dltTemplateId: "DLT-1107168923410",
    senderHeader: "TG-SSMMS",
    description: "Order cancelled or vehicle trip failed, refund ref & timeline notified",
    manualReference: "Telangana SSMMS Manual Sec 8.2: Order Reversal & Treasury Refund",
    color: "#dc2626",
    bgLight: "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800",
    textColor: "text-red-700 dark:text-red-300",
  },
};
