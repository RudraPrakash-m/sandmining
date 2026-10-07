export type WeighbridgeStatus =
  | "Verified"
  | "Captured"
  | "Gross Captured"
  | "Tare Captured"
  | "Pending Reweigh"
  | "Flagged Overload"
  | "Duplicate Blocked";

export interface WeighbridgeRecord {
  id: string;
  weighbridgeId: string;
  weighbridgeName: string;
  slipNumber: string;
  vehicleNumber: string;
  vehicleRtoType?: string;
  driverName?: string;
  driverMobile?: string;
  tareWeightKg: number;
  grossWeightKg: number;
  netSandWeightMt: number;
  dateTime: string;
  bookingId: string;
  ePassId: string;
  stockyardId: string;
  stockyardName: string;
  operatorName: string;
  operatorId?: string;
  status: WeighbridgeStatus;
  photoUrl?: string;
  anprPlateConfidence?: number;
  anprSnapshotUrl?: string;
  overloadVarianceKg?: number;
  isOverloaded?: boolean;
  remarks?: string;
}

export interface CaptureWeightFormData {
  weighbridgeId: string;
  vehicleNumber: string;
  bookingId: string;
  ePassId: string;
  stockyardId: string;
  tareWeightKg: number;
  grossWeightKg: number;
  operatorName: string;
  remarks?: string;
}

export interface WeighbridgeStats {
  todayTotalSlips: number;
  todayNetSandTonnageMt: number;
  activeScales: number;
  flaggedOverloads: number;
}
