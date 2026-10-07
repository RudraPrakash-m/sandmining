import type {
  SmsStageKey,
  CustomerSmsNotification,
  SmsStageMetadata,
  TelecomCarrier,
} from "../types";
import { SMS_STAGES_CONFIG } from "../types";

export interface SmsTemplateDefinition {
  stage: SmsStageKey;
  templatePattern: string;
  generateText: (params: {
    customerName?: string;
    mobile?: string;
    bookingId?: string;
    orderId?: string;
    otp?: string;
    quantityMt?: number;
    stockyardName?: string;
    totalAmount?: number;
    txnId?: string;
    orderDate?: string;
    destinationAddress?: string;
    tentativeDelivery?: string;
    vehicleNumber?: string;
    vehicleType?: string;
    driverName?: string;
    driverMobile?: string;
    ePassNumber?: string;
    trackingUrl?: string;
    deliveryTimestamp?: string;
    receiptNumber?: string;
    receiptUrl?: string;
    cancellationReason?: string;
    refundAmount?: number;
    refundRef?: string;
  }) => string;
}

export const TELANGANA_SSMMS_TEMPLATES: Record<SmsStageKey, SmsTemplateDefinition> = {
  // Stage 1: Registration/OTP
  REGISTRATION_OTP: {
    stage: "REGISTRATION_OTP",
    templatePattern:
      "Dear Citizen, your OTP for SSMMS registration is {#var#}. Valid for 10 mins. Please do not share this OTP with anyone. - TSMDC, Govt of Telangana",
    generateText: (p) =>
      `Dear Citizen, your OTP for SSMMS registration is ${p.otp || "4921"}. Valid for 10 mins. Please do not share this OTP with anyone. - TSMDC, Govt of Telangana`,
  },

  // Stage 2: Booking Confirmation
  BOOKING_CONFIRMATION: {
    stage: "BOOKING_CONFIRMATION",
    templatePattern:
      "Dear {#var#}, your Sand Booking {#var#} for {#var#} MT from {#var#} has been registered. Please complete online payment within 60 mins to confirm order. - TSMDC, Govt of Telangana",
    generateText: (p) =>
      `Dear ${p.customerName || "Citizen"}, your Sand Booking ${p.bookingId || "BKG-2026-901"} for ${p.quantityMt || 10} MT from ${p.stockyardName || "Sand Reach Stockyard"} has been registered. Please complete online payment within 60 mins to confirm order. - TSMDC, Govt of Telangana`,
  },

  // Stage 3: Payment Success
  PAYMENT_SUCCESS: {
    stage: "PAYMENT_SUCCESS",
    templatePattern:
      "Payment of Rs. {#var#} for Sand Booking {#var#} is SUCCESSFUL (Txn Ref: {#var#}). Royalty, DMF & Transport included. Permanent Order ID generating. - TSMDC, Govt of Telangana",
    generateText: (p) =>
      `Payment of Rs. ${p.totalAmount ? p.totalAmount.toLocaleString("en-IN") : "7,255"} for Sand Booking ${p.bookingId || "BKG-2026-901"} is SUCCESSFUL (Txn Ref: ${p.txnId || "TXN-UPI-981240"}). Royalty, DMF & Transport included. Permanent Order ID generating. - TSMDC, Govt of Telangana`,
  },

  // Stage 4: Order ID
  ORDER_ID: {
    stage: "ORDER_ID",
    templatePattern:
      "Dear {#var#}, your permanent Sand Order ID {#var#} is confirmed against Booking {#var#}. Destination: {#var#}. Track status at sand.telangana.gov.in. - TSMDC, Govt of Telangana",
    generateText: (p) =>
      `Dear ${p.customerName || "Citizen"}, your permanent Sand Order ID ${p.orderId || "SMMS-ORD-2026-8801"} is confirmed against Booking ${p.bookingId || "BKG-2026-901"}. Destination: ${p.destinationAddress || "Registered Site"}. Track status at sand.telangana.gov.in. - TSMDC, Govt of Telangana`,
  },

  // Stage 5: Vehicle Allocation
  VEHICLE_ALLOCATION: {
    stage: "VEHICLE_ALLOCATION",
    templatePattern:
      "Sand Order {#var#}: Vehicle allocated via automated FIFO queue from {#var#}. Tentative Delivery: {#var#}. Loading in progress. - TSMDC, Govt of Telangana",
    generateText: (p) =>
      `Sand Order ${p.orderId || "SMMS-ORD-2026-8801"}: Vehicle allocated via automated FIFO queue from ${p.stockyardName || "Central Stockyard"}. Tentative Delivery: ${p.tentativeDelivery || "Today within 3-5 Hours"}. Loading in progress. - TSMDC, Govt of Telangana`,
  },

  // Stage 6: Vehicle Number
  VEHICLE_NUMBER: {
    stage: "VEHICLE_NUMBER",
    templatePattern:
      "Sand Order {#var#}: Assigned Vehicle Number is {#var#} ({#var#}). Net payload {#var#} MT sand weighed and verified at weighbridge. - TSMDC, Govt of Telangana",
    generateText: (p) =>
      `Sand Order ${p.orderId || "SMMS-ORD-2026-8801"}: Assigned Vehicle Number is ${p.vehicleNumber || "CG-04-TX-2341"} (${p.vehicleType || "10 MT Tipper"}). Net payload ${p.quantityMt || 10} MT sand weighed and verified at weighbridge. - TSMDC, Govt of Telangana`,
  },

  // Stage 7: Driver Details
  DRIVER_DETAILS: {
    stage: "DRIVER_DETAILS",
    templatePattern:
      "Sand Order {#var#}: Consignment en route! Driver: {#var#}, Mobile: {#var#}. Live GPS Tracking & Digital Waybill ({#var#}): {#var#} - TSMDC, Govt of Telangana",
    generateText: (p) =>
      `Sand Order ${p.orderId || "SMMS-ORD-2026-8801"}: Consignment en route! Driver: ${p.driverName || "Venkat Sahu"}, Mobile: ${p.driverMobile || "+91 98261 22341"}. Live GPS Tracking & Digital Waybill (${p.ePassNumber || "EPASS-2026-1049"}): ${p.trackingUrl || "https://sand.telangana.gov.in/track/8801"} - TSMDC, Govt of Telangana`,
  },

  // Stage 8: Delivery OTP
  DELIVERY_OTP: {
    stage: "DELIVERY_OTP",
    templatePattern:
      "CRITICAL: Sand Delivery OTP for Order {#var#} is {#var#}. Physically inspect sand unloading ({#var#} MT) BEFORE sharing this OTP with driver. - TSMDC, Govt of Telangana",
    generateText: (p) =>
      `CRITICAL: Sand Delivery OTP for Order ${p.orderId || "SMMS-ORD-2026-8801"} is ${p.otp || "7834"}. Physically inspect sand unloading (${p.quantityMt || 10} MT) BEFORE sharing this OTP with driver. - TSMDC, Govt of Telangana`,
  },

  // Stage 9: Delivery Confirmation
  DELIVERY_CONFIRMATION: {
    stage: "DELIVERY_CONFIRMATION",
    templatePattern:
      "Dear {#var#}, Sand Order {#var#} ({#var#} MT) successfully DELIVERED & closed at {#var#}. Download POD & Form-VIII Receipt: {#var#}. Thank you. - TSMDC, Govt of Telangana",
    generateText: (p) =>
      `Dear ${p.customerName || "Citizen"}, Sand Order ${p.orderId || "SMMS-ORD-2026-8801"} (${p.quantityMt || 10} MT) successfully DELIVERED & closed at ${p.deliveryTimestamp || "2026-10-03 16:30"}. Download POD & Form-VIII Receipt: ${p.receiptUrl || "https://sand.telangana.gov.in/pod/RCPT-8801"}. Thank you. - TSMDC, Govt of Telangana`,
  },

  // Stage 10: Cancellation/Failure
  CANCELLATION_FAILURE: {
    stage: "CANCELLATION_FAILURE",
    templatePattern:
      "Notice: Sand Order {#var#} CANCELLED. Reason: {#var#}. Refund of Rs. {#var#} initiated (Ref: {#var#}, TAT: 3-5 bank days). Helpdesk: 1800-425-4567. - TSMDC, Govt of Telangana",
    generateText: (p) =>
      `Notice: Sand Order ${p.orderId || "SMMS-ORD-2026-8790"} CANCELLED. Reason: ${p.cancellationReason || "Stockyard quota unavailable / Citizen request"}. Refund of Rs. ${p.refundAmount ? p.refundAmount.toLocaleString("en-IN") : "7,255"} initiated (Ref: ${p.refundRef || "RFND-TG-99120"}, TAT: 3-5 bank days). Helpdesk: 1800-425-4567. - TSMDC, Govt of Telangana`,
  },
};

const CARRIER_ROUTES: TelecomCarrier[] = [
  "Airtel DLT Gateway",
  "Jio Telecom DLT",
  "BSNL National NIC SMS",
  "Vi Enterprise DLT",
];

export function buildCustomerSms(
  stage: SmsStageKey,
  params: {
    orderId?: string;
    bookingId?: string;
    recipientName: string;
    recipientMobile: string;
    recipientRole?: string;
    otpCode?: string;
    quantityMt?: number;
    amountRs?: number;
    txnId?: string;
    stockyardName?: string;
    destinationAddress?: string;
    tentativeDeliveryTime?: string;
    vehicleNumber?: string;
    vehicleType?: string;
    capacityMt?: number;
    driverName?: string;
    driverMobile?: string;
    ePassNumber?: string;
    trackingUrl?: string;
    deliveryTimestamp?: string;
    receiptNumber?: string;
    cancellationReason?: string;
    refundAmount?: number;
    refundRef?: string;
  }
): CustomerSmsNotification {
  const config = SMS_STAGES_CONFIG[stage];
  const template = TELANGANA_SSMMS_TEMPLATES[stage];

  const nowIso = new Date().toISOString().replace("T", " ").substring(0, 16);
  const randomSerial = Math.floor(10000 + Math.random() * 90000);
  const carrier = CARRIER_ROUTES[Math.floor(Math.random() * CARRIER_ROUTES.length)];

  const messageText = template.generateText({
    customerName: params.recipientName,
    mobile: params.recipientMobile,
    bookingId: params.bookingId,
    orderId: params.orderId,
    otp: params.otpCode || "7834",
    quantityMt: params.quantityMt || 10,
    stockyardName: params.stockyardName || "Central Sand Reach Stockyard",
    totalAmount: params.amountRs,
    txnId: params.txnId,
    orderDate: nowIso.substring(0, 10),
    destinationAddress: params.destinationAddress,
    tentativeDelivery: params.tentativeDeliveryTime || "Today within 3-4 Hours",
    vehicleNumber: params.vehicleNumber,
    vehicleType: params.vehicleType,
    driverName: params.driverName,
    driverMobile: params.driverMobile,
    ePassNumber: params.ePassNumber,
    trackingUrl: params.trackingUrl || `https://sand.telangana.gov.in/track/${params.orderId || "8801"}`,
    deliveryTimestamp: params.deliveryTimestamp || nowIso,
    receiptNumber: params.receiptNumber || `RCPT-TG-${randomSerial}`,
    receiptUrl: `https://sand.telangana.gov.in/pod/RCPT-${randomSerial}`,
    cancellationReason: params.cancellationReason,
    refundAmount: params.refundAmount,
    refundRef: params.refundRef,
  });

  const metadata: SmsStageMetadata = {
    otpCode: params.otpCode,
    quantityMt: params.quantityMt,
    amountRs: params.amountRs,
    txnId: params.txnId,
    stockyardName: params.stockyardName,
    vehicleNumber: params.vehicleNumber,
    vehicleType: params.vehicleType,
    capacityMt: params.capacityMt,
    driverName: params.driverName,
    driverMobile: params.driverMobile,
    ePassNumber: params.ePassNumber,
    trackingUrl: params.trackingUrl,
    receiptNumber: params.receiptNumber,
    cancellationReason: params.cancellationReason,
    refundAmount: params.refundAmount,
    refundRef: params.refundRef,
    tentativeDeliveryTime: params.tentativeDeliveryTime,
    destinationAddress: params.destinationAddress,
  };

  return {
    id: `SMS-${Date.now()}-${randomSerial}`,
    smsRefId: `SMS-TG-2026-${randomSerial}`,
    stage,
    stageNumber: config.stageNumber,
    stageName: config.name,
    orderId: params.orderId,
    bookingId: params.bookingId,
    recipientName: params.recipientName,
    recipientMobile: params.recipientMobile,
    recipientRole: params.recipientRole || "Citizen",
    messageText,
    senderHeader: config.senderHeader,
    dltTemplateId: config.dltTemplateId,
    status: "Delivered",
    dispatchedAt: nowIso,
    deliveredAt: nowIso,
    carrierRoute: carrier,
    telecomMessageId: `MSG-${carrier.substring(0, 3).toUpperCase()}-${Math.floor(1000000 + Math.random() * 9000000)}`,
    deliveryAckCode: "DELIVRD_000_TRAI_OK",
    metadata,
  };
}
