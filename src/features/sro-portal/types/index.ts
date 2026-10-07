export type SroStage =
  | "Pending Pickup Orders"
  | "Vehicle Arrived"
  | "Vehicle Verified"
  | "Loading Pending"
  | "Loading Completed"
  | "Transit Pass Generated"
  | "Completed Orders";

export interface SroOrder {
  id: string;
  orderId: string;
  bookingId: string;
  reachId: string;
  reachName: string;
  district: string;
  village: string;
  customerName: string;
  customerMobile: string;
  sandType: string;
  orderQuantityMt: number;
  deliveryLocation: string;
  deliveryDistrict: string;
  vehicleNumber: string;
  vehicleType: "Tractor" | "Tipper" | "Heavy Multi-Axle Truck" | string;
  vehicleCapacityMt: number;
  vehicleRcNumber?: string;
  driverName: string;
  driverMobile: string;
  driverLicense: string;
  driverPhotoUrl?: string;
  sroStage: SroStage;
  // SRO Verification Data
  isVehicleNumberVerified: boolean;
  isDriverVerified: boolean;
  isQuantityVerified: boolean;
  isCapacityVerified: boolean;
  vehiclePhotoUrl?: string;
  loadedSandPhotoUrl?: string;
  gpsCoordinates?: string;
  isLoadingConfirmed: boolean;
  transitPassNumber?: string;
  transitPassGeneratedAt?: string;
  customerOtp?: string;
  otpDispatchedToCustomer?: boolean;
  loadedTonnageMt?: number;
  sroOfficerName: string;
  sroOfficerDesignation?: string;
  verifiedAt?: string;
  remarks?: string;
}

export interface SroVerificationStepProgress {
  stepIndex: number;
  stepName: string;
  isCompleted: boolean;
}
