export type PermitStatus =
  | "Active"
  | "Under Verification"
  | "Renewed"
  | "Suspended"
  | "Expired";

export type InspectionStatus =
  | "Verified"
  | "Inspection Due"
  | "Non-Compliant"
  | "Pending Review";

export interface ClearanceDocument {
  id: string;
  name: string;
  docNumber: string;
  fileSize: string;
  issueDate: string;
  validUntil: string;
  status: "Verified" | "Pending Review";
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
  inspectionStatus: InspectionStatus;
  status: PermitStatus;
  lastInspectedDate?: string;
  inspectingOfficer?: string;
  dmfPerMt?: number;
  securityDepositRs?: number;
}

export interface PermitFilterParams {
  status?: PermitStatus | "ALL";
  inspectionStatus?: InspectionStatus | "ALL";
  searchQuery?: string;
}

export interface CreatePermitFormState {
  permitNumber: string;
  holderAgency: string;
  reachId: string;
  reachName: string;
  approvedQuantityMt: number;
  startDate: string;
  endDate: string;
  royaltyPerMt: number;
  conditions: string;
  dmfPerMt: number;
  securityDepositRs: number;
  clearanceDocs: string[];
}

export interface RenewPermitPayload {
  permitId: string;
  extendedEndDate: string;
  additionalQuotaMt: number;
  royaltyFeeAdjusted: number;
  renewalRemarks: string;
}
