export type DispatchStatus =
  | "Pending Assignment"
  | "Vehicle Assigned"
  | "Loading in Progress"
  | "Weighed & Cleared"
  | "Ready for Dispatch"
  | "Dispatched (In Transit)"
  | "Delivered"
  | "Cancelled";

export type GpsSignalStatus =
  | "Signal Healthy"
  | "Deviation Alert"
  | "Offline"
  | "Geofence Breach";

export interface DispatchItem {
  id: string;
  dispatchId: string;
  bookingId: string;
  orderId?: string;
  customerName: string;
  customerMobile: string;
  customerCategory?: string;
  vehicleNumber: string;
  driverName: string;
  driverMobile: string;
  driverLicense?: string;
  sandReachId?: string;
  sandReachName?: string;
  stockyardId: string;
  stockyardName: string;
  sandType: string;
  quantityMt: number;
  weighbridgeSlipNumber: string;
  tareWeightKg?: number;
  grossWeightKg?: number;
  loadingTime: string;
  dispatchTime?: string;
  destination: string;
  destinationCoordinates?: {
    lat: number;
    lng: number;
  };
  ePassNumber: string;
  transitPassNumber?: string;
  validUntil?: string;
  validityHours?: number;
  qrCodeUrl?: string;
  gpsStatus: GpsSignalStatus;
  gpsImei?: string;
  currentLocation?: string;
  dispatchStatus: DispatchStatus;
  isPaymentVerified: boolean;
  paymentRef?: string;
  isStockVerified: boolean;
  isVehicleVerified: boolean;
  isLocked?: boolean;
  securityHash?: string;
  cancelReason?: string;
  remarks?: string;
}

export interface AuthorizeDispatchFormData {
  bookingId: string;
  stockyardId: string;
  sandReachId?: string;
  sandReachName?: string;
  vehicleNumber: string;
  driverName: string;
  driverMobile: string;
  sandType: string;
  quantityMt: number;
  weighbridgeSlipNumber: string;
  destination: string;
  remarks?: string;
}

export interface DispatchStats {
  totalDispatches: number;
  inTransit: number;
  deliveredToday: number;
  pendingGateOut: number;
  totalTonnageDispatched: number;
}

export type EPassStatus =
  | "Valid"
  | "In Transit"
  | "Delivered (Invalidated)"
  | "Expired"
  | "Revoked";

export interface SandReachDetails {
  reachId: string;
  reachName: string;
  riverStream?: string;
  riverName?: string;
  district?: string;
}

export interface CustomerDetails {
  name: string;
  mobile: string;
  category?: string;
  deliveryAddress?: string;
}

export interface TransitValidity {
  validFrom: string;
  validUntil: string;
  durationHours: number;
  isExpired?: boolean;
}

export interface GpsTrackingReference {
  deviceImei: string;
  trackingUrl?: string;
  corridorGeofence?: string;
  isSignalActive?: boolean;
  lastCoordinates?: string;
  speedKmH?: number;
}

export interface TransitPassRecord {
  id: string;
  transitPassNumber?: string;
  ePassNumber: string;
  orderId?: string;
  bookingId: string;
  vehicleNumber: string;
  driverName: string;
  driverMobile: string;
  driverLicense: string;
  sandReach?: SandReachDetails;
  sourceStockyard: string;
  destination: string;
  destinationCoordinates?: {
    lat: number;
    lng: number;
  };
  quantityMt: number;
  sandType: string;
  dateTime?: string;
  issueTime: string;
  customerDetails?: CustomerDetails;
  customerName?: string;
  customerMobile?: string;
  validity?: TransitValidity;
  validUntil: string;
  qrPayload: string;
  gpsTrackingRef?: GpsTrackingReference;
  gpsImei?: string;
  weighbridgeSlipNumber: string;
  tareWeightKg?: number;
  grossWeightKg?: number;
  securityHash?: string;
  isLocked?: boolean;
  status: EPassStatus;
  scannedCount?: number;
  lastScannedLocation?: string;
  lastScannedTime?: string;
  generatedBy?: {
    officerName: string;
    officerId: string;
    designation: string;
  };
  remarks?: string;
}

export type EPassRecord = TransitPassRecord;


