export type ExcavationShift =
  | "Morning (06:00 - 14:00)"
  | "Afternoon (14:00 - 22:00)"
  | "Night (22:00 - 06:00)";

export type ExcavationStatus =
  | "Draft"
  | "Submitted"
  | "Under Verification"
  | "Approved"
  | "Rejected";

export interface ExcavationAuditEntry {
  id: string;
  action: string;
  performedBy: string;
  role: string;
  timestamp: string;
  remarks?: string;
}

export interface ExcavationRecord {
  id: string;
  excavationSlipNo: string;
  // 1. Sand Reach
  reachId: string;
  reachName: string;
  district: string;
  riverName?: string;
  // 2. Extraction Date
  extractionDate: string;
  dateTime: string;
  // 3. Extraction Quantity
  extractionQuantityMt: number;
  excavatedQuantityMt: number;
  // 4. Vehicle/Tractor Number
  vehicleNumber: string;
  equipmentRegNo?: string;
  machineryEquipment?: string;
  // 5. Operator
  operatorName: string;
  operatorLicense?: string;
  // 6. Source Location
  sourceLocation: string;
  // 7. GPS Location
  gpsCoordinates: string;
  geoLocation: string;
  latitude: number;
  longitude: number;
  isWithinGeofence: boolean;
  // 8. Loading Quantity
  loadingQuantityMt: number;
  // 9. Loading Time
  loadingTime: string;
  shift?: ExcavationShift;
  // 10. Photo
  photoEvidenceUrl: string;
  photoTimestamp?: string;
  // 11. Officer Verification
  officerVerification: {
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
  // System Quota Tracking & Status
  permitQuotaUsedMt?: number;
  remainingQuotaMt?: number;
  approvedQuotaMt?: number;
  status: ExcavationStatus;
  auditTrail?: ExcavationAuditEntry[];
}

export interface AddExcavationFormData {
  reachId: string;
  extractionDate: string;
  extractionQuantityMt: number;
  vehicleNumber: string;
  operatorName: string;
  operatorLicense?: string;
  sourceLocation: string;
  gpsCoordinates: string;
  loadingQuantityMt: number;
  loadingTime: string;
  photoEvidenceUrl: string;
  officerName: string;
  officerDesignation: string;
  officerContact?: string;
  remarks: string;
  shift?: ExcavationShift;
}

export interface StockCalculationSummary {
  openingStockMt: number;
  extractedQuantityMt: number;
  dispatchedQuantityMt: number;
  availableSandStockMt: number;
}
