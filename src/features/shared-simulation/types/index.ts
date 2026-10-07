import type { OrderStatus, StatusHistoryEntry } from "@/features/order-lifecycle/types";
export type { OrderStatus, StatusHistoryEntry };

export type GrievanceCategory =
  | "Delivery Delay"
  | "Vehicle Not Arrived"
  | "Wrong Quantity"
  | "Payment Issue"
  | "Vehicle/Driver Issue"
  | "Sand Quality Issue"
  | "Booking Issue"
  | "OTP Issue"
  | "Other"
  | "Delayed Delivery"
  | "Pricing / Tariff Dispute"
  | "Weighbridge Discrepancy"
  | "Driver Behavior"
  | "Transit Theft / Diversion"
  | "e-Pass Fraud";

export type GrievancePriority = "Low" | "Medium" | "High" | "Critical" | "Urgent";

export type GrievanceStageKey =
  | "CUSTOMER"
  | "COMPLAINT_REGISTRATION"
  | "CALL_CENTRE_OFFICER"
  | "ASSIGNED"
  | "ACTION_TAKEN"
  | "RESOLVED"
  | "CUSTOMER_CONFIRMATION";

export type GrievanceStatus =
  | "Complaint Registered"
  | "Open"
  | "Call Centre Review"
  | "Assigned"
  | "In Progress"
  | "Action Taken"
  | "Escalated to District Collector"
  | "Resolved"
  | "Customer Confirmed"
  | "Closed"
  | "Reopened";

export type UserRole =
  | "Citizen / Customer"
  | "Vehicle Owner"
  | "Driver"
  | "SRO – Sand Reach Officer"
  | "Sand Reach Operator"
  | "Call Centre Operator"
  | "District Officer"
  | "State Admin"
  | "Finance / Payment Officer"
  | "Mining Department / Monitoring Officer"
  | "Super Admin"
  | "State Administrator"
  | "District Mining Officer"
  | "Mining Department Officer"
  | "Sand Reach Officer (SRO)"
  | "Weighbridge Operator"
  | "Stockyard Incharge"
  | "Enforcement Officer"
  | "Call Centre"
  | "Citizen"
  | "Contractor / Transporter"
  | "Vehicle Owner / Driver";

export type ReachSourceType =
  | "Riverbed (In-stream Perennial)"
  | "De-siltation Reservoir / Dam"
  | "Sand Bar / Floodplain"
  | "Pattaland / Agricultural Sand Area"
  | "Canal De-siltation Reach"
  | string;

export interface MiningReach {
  id: string;
  reachId: string;
  reachName: string;
  district: string;
  block?: string;
  mandal: string;
  village: string;
  riverStream: string;
  sourceType: ReachSourceType;
  sandType:
    | "Coarse Sand"
    | "Coarse River Sand"
    | "Fine Sand"
    | "Fine Plastering Sand"
    | "Medium Concrete Sand"
    | "Gravel Sand"
    | string;
  approvedQuantityMt: number;
  permittedQuantityMt: number;
  availableQuantityMt: number;
  currentStockMt: number;
  excavatedQuantityMt: number;
  reservedQuantityMt?: number;
  dispatchedQuantityMt?: number;
  deliveredQuantityMt?: number;
  balanceQuantityMt?: number;
  validityStartDate: string;
  validityEndDate: string;
  status: "Draft" | "Under Verification" | "Approved" | "Active Operations" | "On Hold" | "Suspended" | "Expired" | string;
  responsibleOfficer: string;
  responsibleOfficerContact?: string;
  responsibleOfficerDesignation?: string;
  latitude: number;
  longitude: number;
  gpsCoordinates?: string;
  geofenceRadiusMeters?: number;
  areaVolume: string;
  linkedStockyardId: string;
  linkedStockyardName?: string;
  environmentalClearanceRef: string;
  documentsCount: number;
  electronicMonitoringEnabled?: boolean;
  cctvSurveillanceLive?: boolean;
}

export interface MiningPermit {
  id: string;
  permitNumber: string;
  holderAgency: string;
  reachId: string;
  reachName: string;
  approvedQuantityMt: number;
  excavatedQuantityMt: number;
  remainingQuotaMt: number;
  startDate: string;
  endDate: string;
  royaltyPerMt: number;
  clearanceDocs: string[];
  conditions: string;
  inspectionStatus: "Verified" | "Pending Inspection" | "Requires Clarification";
  status: "Active" | "Under Verification" | "Renewed" | "Suspended" | "Expired";
  dmfPerMt?: number;
  securityDepositRs?: number;
}

export interface ExcavationRecord {
  id: string;
  excavationSlipNo?: string;
  // 1. Sand Reach
  reachId: string;
  reachName: string;
  district?: string;
  riverName?: string;
  // 2. Extraction Date
  extractionDate?: string;
  dateTime: string;
  // 3. Extraction Quantity
  extractionQuantityMt?: number;
  excavatedQuantityMt: number;
  // 4. Vehicle/Tractor Number
  vehicleNumber?: string;
  equipmentRegNo?: string;
  machineryEquipment?: string;
  // 5. Operator
  operatorName: string;
  operatorLicense?: string;
  // 6. Source Location
  sourceLocation?: string;
  // 7. GPS Location
  gpsCoordinates?: string;
  geoLocation: string;
  latitude?: number;
  longitude?: number;
  isWithinGeofence?: boolean;
  // 8. Loading Quantity
  loadingQuantityMt?: number;
  // 9. Loading Time
  loadingTime?: string;
  shift?: "Morning (06:00 - 14:00)" | "Afternoon (14:00 - 22:00)" | "Night (22:00 - 06:00)" | string;
  // 10. Photo
  photoEvidenceUrl: string;
  photoTimestamp?: string;
  // 11. Officer Verification
  officerVerification?: {
    verifiedBy: string;
    designation: string;
    contactNumber?: string;
    status: "Verified" | "Pending" | "Rejected";
    verificationDate?: string;
    verificationNotes?: string;
  };
  verifiedBy?: string;
  approvedBy?: string;
  // 12. Remarks
  remarks: string;
  permitQuotaUsedMt?: number;
  remainingQuotaMt?: number;
  approvedQuotaMt?: number;
  status: "Draft" | "Submitted" | "Under Verification" | "Verified" | "Approved" | "Rejected" | string;
}

export interface Stockyard {
  id: string;
  stockyardId: string;
  name: string;
  district: string;
  location: string;
  sandType: "Coarse River Sand" | "Medium Concrete Sand" | "Fine Plastering Sand" | "Gravel Sand" | string;
  openingStockMt: number;
  receivedMt: number;
  dispatchedMt: number;
  closingStockMt: number;
  capacityMt: number;
  totalCapacityMt?: number;
  availableQuantityMt: number;
  approvedQuantityMt?: number;
  extractedQuantityMt?: number;
  reservedQuantityMt?: number;
  dispatchedQuantityMt?: number;
  deliveredQuantityMt?: number;
  balanceQuantityMt?: number;
  linkedWeighbridgeId: string;
  linkedWeighbridgeName?: string;
  managerName?: string;
  contactNumber?: string;
  status: "Active" | "At Capacity" | "Maintenance" | "Closed" | "Low Stock Warning" | "Stock Depleted" | string;
}

export interface StockLedgerEntry {
  id: string;
  dateTime: string;
  stockyardId: string;
  stockyardName: string;
  transactionType: "INWARD_EXCAVATION" | "OUTWARD_DISPATCH" | "BOOKING_RESERVED" | "DELIVERY_COMPLETED" | "ADJUSTMENT" | "TRANSFER_IN" | "TRANSFER_OUT" | string;
  quantityMt: number;
  previousStockMt: number;
  newStockMt: number;
  referenceId: string;
  authorizedBy: string;
  remarks: string;
  approvalStatus?: "Approved" | "Pending Approval" | "Rejected";
}

export interface WeighbridgeRecord {
  id: string;
  weighbridgeId: string;
  weighbridgeName: string;
  slipNumber: string;
  vehicleNumber: string;
  tareWeightKg: number;
  grossWeightKg: number;
  netSandWeightMt: number;
  dateTime: string;
  bookingId: string;
  ePassId: string;
  stockyardId: string;
  operatorName: string;
  status: "Captured" | "Verified" | "Flagged Mismatch" | "Duplicate Blocked";
  photoUrl: string;
}

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  ownerName: string;
  driverName: string;
  mobile: string;
  vehicleType:
    | "2-Axle Tipper (10 MT)"
    | "3-Axle Tipper (18 MT)"
    | "4-Axle Heavy (28 MT)"
    | "Tractor-Trailer (5 MT)"
    | "6-Wheeler Tipper (10 MT)"
    | "10-Wheeler Heavy Commercial (16 MT)"
    | "12-Wheeler Multi-Axle (24 MT)"
    | "14-Wheeler Heavy Carrier (30 MT)"
    | string;
  capacityMt: number;
  rcNumber: string;
  fitnessValidityDate: string;
  insuranceValidityDate: string;
  pucValidityDate?: string;
  gpsDeviceId: string;
  fastagRfidRef: string;
  status: "Verified" | "Pending Verification" | "Expired Docs" | "Blacklisted" | string;
  isBlacklisted: boolean;
  blacklistReason?: string;
  // Automatic Allocation fields (TSMIV Model)
  assignedDistrict?: string;
  assignedArea?: string;
  queueStatus?:
    | "Available / In Queue"
    | "Assigned on Trip"
    | "Loading at Stockyard"
    | "In Transit"
    | "Under Maintenance"
    | "Offline / Rest"
    | string;
  queuePosition?: number;
  queueJoinedAt?: string;
  lastTripCompletedAt?: string;
  totalTripsCompleted?: number;
  activeTripId?: string | null;
  currentOrderId?: string | null;
  lastCompletedTripId?: string | null;
  lastCompletedTripOrder?: string | null;
  lastCompletedTripDestination?: string | null;
  driverStatus?: "Active" | "Inactive" | "On Leave" | "Assigned on Trip" | string;
}

export interface EligibilityChecklist {
  isRegistered: boolean;
  isActiveStatus: boolean;
  hasApprovedCapacity: boolean;
  isDriverActive: boolean;
  isAssignedDistrictMatch: boolean;
  isVehicleAvailable: boolean;
  isPreviousTripCompleted: boolean;
  hasNoActiveDelivery: boolean;
  isCapacityOptimal: boolean;
}

export interface AllocationRecord {
  id: string;
  allocationId: string;
  bookingId: string;
  orderId: string;
  vehicleId: string;
  vehicleNumber: string;
  vehicleType: string;
  capacityMt: number;
  driverName: string;
  driverMobile: string;
  customerName: string;
  customerMobile: string;
  quantityMt: number;
  sandType: string;
  sourceStockyardId: string;
  sourceStockyardName: string;
  deliveryDistrict: string;
  destinationAddress: string;
  allocationTime: string;
  fifoQueueRank: number;
  eligibilityChecklist: EligibilityChecklist;
  driverNotificationSent: boolean;
  notificationTimestamp: string;
  notificationSmsContent: string;
  allocationStatus: "Allocated" | "Dispatched" | "Delivered" | "Rejected";
}

export interface VehicleTripPayment {
  id: string;
  tripId: string;
  orderId: string;
  allocationId?: string;
  vehicleId: string;
  vehicleNumber: string;
  vehicleType: string;
  transporterName: string;
  driverName: string;
  driverMobile: string;
  bankAccountMasked: string;
  ifscCode: string;
  sourceStockyard: string;
  destinationAddress: string;
  destinationDistrict: string;
  distanceKm: number;
  ratePerKm: number;
  baseCharge: number;
  loadingAllowance: number;
  grossAmount: number;
  tdsDeduction: number;
  welfareCess: number;
  netPayableAmount: number;
  paymentStatus: "Pending Verification" | "Approved" | "Paid / Settled (DBT)" | "On Hold";
  tripDate: string;
  paymentReference?: string;
  utrNumber?: string;
  settledAt?: string;
  gpsTrackedDistanceKm?: number;
  routeComplianceScore?: number;
}

export interface VehiclePaymentSummary {
  vehicleNumber: string;
  ownerName: string;
  vehicleType: string;
  district: string;
  totalTrips: number;
  totalKmTravelled: number;
  averageRatePerKm: number;
  totalGrossPayable: number;
  totalDeductions: number;
  totalNetPayable: number;
  paidAmount: number;
  pendingAmount: number;
  paymentStatus: "All Settled" | "Pending Payout" | "Partially Settled" | "Under Audit";
  lastPayoutDate?: string;
  lastUtrRef?: string;
}

export interface DriverNotification {
  id: string;
  allocationId: string;
  orderId: string;
  driverName: string;
  driverMobile: string;
  vehicleNumber: string;
  pickupStockyard: string;
  sandQuantityMt: number;
  sandType: string;
  destinationAddress: string;
  customerName: string;
  customerMobile: string;
  dispatchedAt: string;
  message: string;
  status: "Delivered (SMS)" | "Acknowledged" | "Pending";
}

export interface Driver {
  id: string;
  driverId: string;
  name: string;
  mobile: string;
  licenseNumber: string;
  licenseValidityDate: string;
  assignedVehicleNumber: string;
  address: string;
  status: "Active" | "Assigned on Trip" | "Pending Verification" | "License Expired" | "Inactive" | "Suspended";
  trainingVerified: boolean;
}

export type CustomerCategory =
  | "Domestic"
  | "Individual Citizen (Home Construction)"
  | "Commercial"
  | "Commercial Builder"
  | "Commercial Builder / Developer"
  | "Government / Institutional"
  | "Govt Contractor"
  | "Govt Contractor / PWD"
  | "Infrastructure Entity";

export interface CitizenUser {
  id: string;
  name: string;
  mobile: string;
  email: string;
  username?: string;
  password?: string;
  district: string;
  mandal: string;
  tehsilMandal?: string;
  village: string;
  villageCity?: string;
  address: string;
  deliveryAddress?: string;
  preferredDeliveryLocation?: string;
  pincode?: string;
  customerType: CustomerCategory;
  aadhaarNumber?: string;
  identityType?: string;
  idKycRef: string;
  isKycVerified: boolean;
  isOtpVerified?: boolean;
  registeredDate: string;
}

export interface SandBooking {
  id: string;
  orderId: string;
  customerName: string;
  customerMobile: string;
  customerType: CustomerCategory;
  purpose?: "Domestic" | "Commercial" | "Government Work" | string;
  sandType:
    | "Coarse Sand"
    | "Coarse River Sand"
    | "Fine Sand"
    | "Fine Plastering Sand"
    | "Medium Concrete Sand"
    | "Gravel Mix Sand"
    | "Manufactured / M-Sand"
    | "Filter Bed Sand"
    | string;
  quantityMt: number;
  quantityInUnit?: number;
  unit?: "MT" | "Cubic Meter";
  sourceStockyardId: string;
  sourceStockyardName: string;
  destinationAddress: string;
  destinationDistrict: string;
  deliveryDistrict?: string;
  deliveryLocation?: string;
  preferredDeliveryDate: string;
  preferredDeliveryTime?: string;
  transportOption:
    | "Government Logistics"
    | "Government Empanelled Logistics"
    | "Department-arranged transport"
    | "Customer Own Vehicle"
    | "Customer Own Vehicle / Self-Pickup"
    | "Own vehicle, if permitted"
    | "Heavy Multiaxle Fleet"
    | string;
  transportMode?: "Department-arranged transport" | "Own vehicle, if permitted" | string;
  ownVehicleNumber?: string;
  ownDriverName?: string;
  basePricePerMt: number;
  sandAmount: number;
  royaltyAmount: number;
  dmfCess: number;
  envSurcharge?: number;
  statutoryChargesTotal?: number;
  transportCharges: number;
  gstAmount: number;
  totalAmount: number;
  paymentStatus: "Payment Pending" | "Paid" | "Failed" | "Refunded";
  bookingStatus: OrderStatus;
  statusHistory?: StatusHistoryEntry[];
  assignedVehicleNumber?: string;
  assignedDriverName?: string;
  driverAcceptanceStatus?: "Pending Offer" | "Accepted" | "Rejected" | string;
  driverRejectionReason?: string;
  driverRejectedAt?: string;
  pickupStartTime?: string;
  pickupCompletedTime?: string;
  transitStartTime?: string;
  deliveredTime?: string;
  transportEarningsRs?: number;
  ePassId?: string;
  paymentRefNumber?: string;
  createdAt: string;
}

export interface PaymentTransaction {
  id: string;
  transactionId: string;
  bookingId: string;
  orderId: string;
  customerName: string;
  customerMobile?: string;
  quantityMt?: number;
  sandType?: string;
  deliveryLocation?: string;
  destinationAddress?: string;
  bookingDateTime?: string;
  sandAmount: number;
  royalty: number;
  royaltyAmount?: number;
  dmfCess?: number;
  envSurcharge?: number;
  gstTax: number;
  gstAmount?: number;
  transportCharges: number;
  totalAmount: number;
  paymentMode: "UPI / QR" | "Net Banking" | "Debit / Credit Card" | "Treasury Challan" | string;
  paymentStatus: "Success" | "Pending" | "Payment Pending" | "Paid" | "Failed" | "Reconciled" | "Refunded";
  transactionTime: string;
  bankSettlementRef?: string;
  paymentRefNumber?: string;
  smsDispatched?: boolean;
  challanNumber?: string;
  receiptNumber?: string;
  failureReason?: string;
}

export interface DispatchTrip {
  id: string;
  dispatchId: string;
  bookingId: string;
  vehicleNumber: string;
  driverName: string;
  driverMobile: string;
  stockyardId: string;
  stockyardName: string;
  quantityMt: number;
  weighbridgeSlipNumber: string;
  loadingTime: string;
  destination: string;
  ePassNumber: string;
  gpsStatus: "Signal Healthy" | "Deviation Alert" | "Offline" | "Geofence Breach";
  dispatchStatus: "Ready for Loading" | "Weighed & Cleared" | "Dispatched" | "In Transit" | "Delivered" | "Trip Closed" | "Cancelled";
}

export interface DigitalEPass {
  id: string;
  ePassNumber: string;
  transitPassNumber?: string;
  orderId?: string;
  bookingId: string;
  vehicleNumber: string;
  driverName: string;
  driverMobile?: string;
  driverLicense?: string;
  sandReachId?: string;
  sandReachName?: string;
  quantityMt: number;
  sandType?: string;
  sourceStockyard: string;
  destinationAddress: string;
  customerName?: string;
  customerMobile?: string;
  customerCategory?: string;
  issueTime: string;
  validityExpiryTime: string;
  validUntil?: string;
  qrPayload: string;
  gpsImei?: string;
  weighbridgeSlipNumber?: string;
  securityHash?: string;
  isLocked?: boolean;
  status: "Active" | "Verified on Route" | "Expired" | "Closed / Redeemed" | "Revoked";
}

export interface VehicleTelemetry {
  id?: string;
  vehicleNumber: string;
  driverName: string;
  dispatchId: string;
  currentLat: number;
  currentLng: number;
  latitude?: number;
  longitude?: number;
  speedKmH: number;
  source: string;
  destination: string;
  eta: string;
  heading?: string;
  ignitionStatus?: string;
  geofenceStatus: "Inside Authorized Corridor" | "Route Deviation Detected" | "Unauthorized Halt" | "Geofence Breach" | string;
  tripStatus: "In Transit" | "Stationary" | "Approaching Destination" | "Delivered" | string;
  lastGpsPing: string;
  lastPingTime?: string;
  routePath: [number, number][];
}

export interface DeliveryConfirmation {
  id: string;
  deliveryId: string;
  bookingId: string;
  vehicleNumber: string;
  driverName?: string;
  quantityDeliveredMt: number;
  sandType?: string;
  deliveryTime: string;
  deliveryLocation: string;
  geoCoordinates?: string;
  customerName: string;
  customerMobile: string;
  otpCode: string;
  isOtpVerified: boolean;
  signatureCaptured: boolean;
  signatureDataUrl?: string;
  photoUrl: string;
  remarks: string;
  status: "Delivered" | "Pending OTP" | "Failed";
  receiptNumber?: string;
}

export interface EnforcementCaseHistoryItem {
  id: string;
  timestamp: string;
  officer: string;
  action: string;
  notes: string;
  penaltyAmount?: number;
}

export interface EnforcementAlert {
  id: string;
  alertId: string;
  location: string;
  reachId?: string;
  reachName?: string;
  vehicleNumber?: string;
  alertType: "Illegal Excavation" | "Route Deviation" | "Geofence Breach" | "Overloading" | "Unregistered Vehicle" | "Expired e-Pass" | "Night-time Mining" | "Weighbridge Bypass";
  dateTime: string;
  evidencePhotoUrl: string;
  assignedOfficer: string;
  severity: "High" | "Critical" | "Moderate" | "Medium";
  actionStatus: "New Alert" | "Squad Assigned" | "Under Investigation" | "Vehicle Seized" | "Penalty Levied" | "Closed";
  caseNotes: string;
  penaltyAmount?: number;
  firNumber?: string;
  seizureOrderNumber?: string;
  caseHistory?: EnforcementCaseHistoryItem[];
}

export interface GrievanceCommunication {
  id: string;
  author: string;
  role: string;
  message: string;
  timestamp: string;
  isInternal?: boolean;
  attachmentUrl?: string;
}

export interface GrievanceTicket {
  id: string;
  ticketId: string;
  customerName: string;
  customerMobile: string;
  category: GrievanceCategory;
  bookingOrderId: string;
  description: string;
  location: string;
  priority: GrievancePriority;
  assignedOfficer: string;
  slaRemainingHours: number;
  status: GrievanceStatus;
  stage: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  stageName:
    | "Customer"
    | "Complaint Registration"
    | "Call Centre/Officer"
    | "Assigned"
    | "Action Taken"
    | "Resolved"
    | "Customer Confirmation";
  intakeChannel?: "Customer Portal" | "Citizen Mobile App" | "Toll-Free 1800 Call Centre" | "Officer Desk";
  callCentreNotes?: string;
  callCentreAgent?: string;
  actionTakenDetails?: string;
  actionTakenBy?: string;
  actionTakenAt?: string;
  remedyType?: string;
  customerOtp?: string;
  customerConfirmationStatus?: "Pending Confirmation" | "Confirmed Satisfied" | "Disputed & Reopened";
  customerFeedbackScore?: number;
  customerFeedbackComments?: string;
  confirmedAt?: string;
  resolutionRemarks?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  escalationLevel?: string;
  escalationReason?: string;
  reopenReason?: string;
  communicationHistory?: GrievanceCommunication[];
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string; // Date & Time
  userName: string; // User
  userRole: UserRole | string; // Role
  module: "Mining Reach" | "Permits" | "Excavation" | "Stockyard" | "Weighbridge" | "Vehicle" | "VehicleQueue" | "Driver" | "Citizens" | "Payments" | "Grievance" | "Dispatch" | "e-Pass" | "TransitPass" | "Enforcement" | "Masters" | "System Monitoring" | "User & Access Control" | "System" | string;
  action: "CREATE" | "APPROVE" | "UPDATE" | "SUSPEND" | "DISPATCH" | "DELETE" | "SEIZE" | "CANCEL" | "GENERATE" | "REJECT" | "RESOLVE" | "ASSIGN" | "CLOSE" | "REOPEN" | string; // Action
  recordId: string;
  oldValue: string; // Previous Status
  newValue: string; // New Status
  previousStatus?: string;
  newStatus?: string;
  ipAddress: string; // IP
  deviceInfo?: string; // Device
  gpsLocation?: string; // GPS, where applicable
  gpsCoordinates?: string;
  remarks: string; // Remarks
  hashSignature?: string;
}

export interface MasterDistrict {
  id: string;
  name: string;
  state: string;
  activeReaches: number;
  activeStockyards: number;
}

export interface SandTariff {
  id: string;
  sandType: string;
  basePricePerMt: number;
  royaltyPerMt: number;
  dmfCessPercent: number;
  loadingChargePerMt: number;
  transportPerKmPerMt: number;
  effectiveDate: string;
}

export interface SystemUser {
  id: string;
  employeeId: string;
  fullName: string;
  department: string;
  email: string;
  mobile: string;
  role: string;
  designation: string;
  district: string;
  mandal: string;
  mfaEnabled: boolean;
  status: "Active" | "Inactive" | "Suspended" | "Password Reset Required";
  lastLogin: string;
  loginAttempts: number;
  permissions: string[];
}

export type { CustomerSmsNotification, SmsStageKey, SmsDeliveryStatus } from "@/features/notifications/types";
export type {
  StandardOrderStatus,
  ExceptionOrderStatus,
  StatusMetadata,
} from "@/features/order-lifecycle/types";

