export type VehicleStatus =
  | "Verified"
  | "Pending Verification"
  | "Expired Docs"
  | "Blacklisted";

export type VehicleType =
  | "6-Wheeler Tipper (10 MT)"
  | "10-Wheeler Heavy Commercial (16 MT)"
  | "12-Wheeler Multi-Axle (24 MT)"
  | "14-Wheeler Heavy Carrier (30 MT)"
  | "Tractor-Trailer (5 MT)";

export type DriverStatus =
  | "Active"
  | "Assigned on Trip"
  | "Pending Verification"
  | "License Expired"
  | "Suspended";

export interface ComplianceDoc {
  id: string;
  name: string;
  docNumber: string;
  validUntil: string;
  status: "Valid" | "Expiring Soon" | "Expired";
  fileUrl?: string;
}

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  ownerName: string;
  ownerMobile?: string;
  driverName: string;
  driverLicense?: string;
  mobile: string;
  vehicleType: VehicleType;
  capacityMt: number;
  rcNumber: string;
  permitNumber?: string;
  gpsDeviceId: string;
  gpsProvider?: string;
  isGpsOnline?: boolean;
  fastagRfidRef: string;
  insuranceValidityDate: string;
  fitnessValidityDate: string;
  pucValidityDate?: string;
  status: VehicleStatus;
  isBlacklisted: boolean;
  blacklistReason?: string;
  registeredDate?: string;
  photoUrl?: string;
  documents?: ComplianceDoc[];
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
  status: DriverStatus;
  trainingVerified: boolean;
  trainingDate?: string;
  aadhaarNumber?: string;
  emergencyContact?: string;
  bloodGroup?: string;
}

export interface AddDriverFormData {
  name: string;
  mobile: string;
  licenseNumber: string;
  licenseValidityDate: string;
  assignedVehicleNumber: string;
  address: string;
  trainingVerified: boolean;
  aadhaarNumber?: string;
  emergencyContact?: string;
  status: DriverStatus;
}

export interface RegisterVehicleFormData {
  vehicleNumber: string;
  ownerName: string;
  ownerMobile?: string;
  driverName: string;
  driverLicense?: string;
  mobile: string;
  vehicleType: VehicleType;
  capacityMt: number;
  rcNumber: string;
  permitNumber?: string;
  gpsDeviceId: string;
  fastagRfidRef: string;
  insuranceValidityDate: string;
  fitnessValidityDate: string;
  pucValidityDate?: string;
  photoUrl?: string;
  status: VehicleStatus;
}

export interface VehicleStats {
  totalRegistered: number;
  verifiedCount: number;
  pendingCount: number;
  blacklistedCount: number;
  activeGpsUnits: number;
}

export interface DriverStats {
  totalDrivers: number;
  activeDrivers: number;
  verifiedTraining: number;
  pendingVerification: number;
}
