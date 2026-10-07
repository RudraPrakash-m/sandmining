export type FieldInspectionResult =
  | "Cleared"
  | "Overloaded"
  | "Counterfeit Pass"
  | "Route Deviation"
  | "Seized"
  | "Boundary Violation"
  | "Excess Depth";

export interface GeoLocationStamp {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  locationName: string;
  timestamp: string;
  isWithinGeofence: boolean;
}

export interface ReachInspectionData {
  reachId: string;
  reachName: string;
  district: string;
  riverStream: string;
  inspectionDate: string;
  inspectorName: string;
  boundaryPillarsIntact: boolean;
  depthMarkersVerified: boolean;
  maxPermissibleDepthM: number;
  measuredDepthM: number;
  waterDepthSafetyCompliant: boolean;
  cctvFunctional: boolean;
  poclainsActive: number;
  tippersActive: number;
  environmentalComplianceStatus: "Compliant" | "Minor Violation" | "Severe Breach";
  remarks: string;
  evidencePhotoUrl?: string;
}

export interface PermitVerificationData {
  permitId: string;
  contractorName: string;
  reachId: string;
  reachName: string;
  district: string;
  validFrom: string;
  validTo: string;
  approvedQuotaMt: number;
  excavatedSoFarMt: number;
  balanceQuotaMt: number;
  royaltyPaidStatus: "Paid & Verified" | "Arrears Due" | "Over-Quota Breach";
  environmentalClearanceRef: string;
  isValid: boolean;
}

export interface ExcavationEntryData {
  entryId: string;
  reachId: string;
  entryDate: string;
  shift: "Morning (06:00 - 14:00)" | "Evening (14:00 - 22:00)";
  poclainsDeployed: number;
  excavationDepthM: number;
  excavatedVolumeMt: number;
  dailyTargetMt: number;
  cumulativeExcavatedMt: number;
  supervisorName: string;
  gpsCoordinates: string;
  isSynced: boolean;
}

export interface PhotoEvidenceItem {
  id: string;
  title: string;
  category: "Reach Boundary" | "Depth Gauge" | "Vehicle Overload" | "Illegal Trenching" | "Weigh Slip";
  timestamp: string;
  gpsCoordinates: string;
  locationName: string;
  officerId: string;
  thumbnailUrl: string;
  fileSizeKb: number;
}

export interface WeighbridgeVerificationData {
  slipSerialNumber: string;
  vehicleNumber: string;
  ePassNumber: string;
  weighbridgeName: string;
  grossWeightMt: number;
  tareWeightMt: number;
  netWeightMt: number;
  permissibleNetMt: number;
  overloadMt: number;
  isOverloaded: boolean;
  penaltyAmountInr: number;
  weighmentTime: string;
  operatorId: string;
}

export interface IllegalMiningAlertData {
  alertId: string;
  violationType:
  | "Illegal Excavation"
  | "Unregistered Vehicle / Tractor"
  | "Night Mining Breach"
  | "Riverbed Deep Trenching"
  | "Counterfeit e-Pass"
  | "Overloading";
  severity: "Critical" | "High" | "Medium" | "Moderate";
  location: string;
  coordinates: string;
  suspectVehicleNumber?: string;
  suspectMachinery?: string;
  estimatedVolumeMt?: number;
  officerNotes: string;
  evidencePhotoUrl?: string;
  reportedAt: string;
  actionStatus: "Logged Locally" | "Squad Dispatched" | "Radar Transmitted";
}

export interface OfflineSyncQueueItem {
  id: string;
  type: "REACH_INSPECTION" | "EXCAVATION_ENTRY" | "QR_SCAN" | "WEIGHMENT" | "ALERT";
  summary: string;
  createdAt: string;
  payload: any;
  syncStatus: "Pending" | "Synced" | "Conflict";
}

export interface FieldInspectionLog {
  id: string;
  timestamp: string;
  vehicleNumber: string;
  ePassNumber: string;
  result: FieldInspectionResult;
  location: string;
  measuredWeightMt?: number;
  allowedWeightMt?: number;
  isSynced: boolean;
  notes?: string;
}

export interface VerifyPassPayload {
  ePassNumber: string;
  qrData?: string;
  location?: string;
}

export interface SpotWeighPayload {
  vehicleNumber: string;
  ePassNumber: string;
  grossWeightMt: number;
  tareWeightMt?: number;
  location: string;
  notes?: string;
}

export interface QuickViolationPayload {
  alertType: string;
  location: string;
  suspectVehicleNumber?: string;
  severity: "Critical" | "High" | "Medium" | "Moderate";
  notes?: string;
  photoUrl?: string;
}
