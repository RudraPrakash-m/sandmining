export type MiningReachStatus =
  | "Draft"
  | "Under Verification"
  | "Approved"
  | "Active Operations"
  | "On Hold"
  | "Suspended"
  | "Expired"
  | string;

export type ReachSourceType =
  | "Riverbed (In-stream Perennial)"
  | "De-siltation Reservoir / Dam"
  | "Sand Bar / Floodplain"
  | "Pattaland / Agricultural Sand Area"
  | "Canal De-siltation Reach"
  | string;

export interface ReachDocument {
  id: string;
  docType: "Environmental Clearance (EC)" | "Mining Plan Approval" | "Consent to Operate (CTO)" | "Site Geotag Photos" | "Revenue NOC";
  docNumber: string;
  issueDate: string;
  validUntil: string;
  fileName: string;
  fileSize: string;
  status: "Verified" | "Pending Review" | "Uploaded";
}

export interface MiningReach {
  id: string;
  reachId: string;
  reachName: string;
  district: string;
  block?: string;
  mandal: string; // Block / Mandal / Tehsil
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
  validityStartDate: string;
  validityEndDate: string;
  status: MiningReachStatus;
  responsibleOfficer: string;
  responsibleOfficerContact?: string;
  responsibleOfficerDesignation?: string;
  latitude: number;
  longitude: number;
  gpsCoordinates?: string;
  geofenceRadiusMeters?: number;
  areaVolume: string; // e.g. "12.5 Hectares / 1,00,000 MT"
  linkedStockyardId: string;
  linkedStockyardName?: string;
  environmentalClearanceRef: string;
  documentsCount: number;
  documents?: ReachDocument[];
  approvedBy?: string;
  approvedDate?: string;
  electronicMonitoringEnabled?: boolean;
  cctvSurveillanceLive?: boolean;
}

export interface ReachFilterParams {
  district?: string;
  status?: MiningReachStatus | "ALL";
  searchQuery?: string;
  sourceType?: string;
  sandType?: string;
}

export interface AddReachFormState {
  reachId: string;
  reachName: string;
  district: string;
  block?: string;
  mandal: string;
  village: string;
  riverStream: string;
  sourceType: ReachSourceType;
  sandType: string;
  latitude: number;
  longitude: number;
  areaHectares: number;
  approvedQuantityMt: number;
  permittedQuantityMt: number;
  currentStockMt?: number;
  responsibleOfficer: string;
  responsibleOfficerContact?: string;
  validityStartDate: string;
  validityEndDate: string;
  linkedStockyardId: string;
  environmentalClearanceRef: string;
  cteCtoRef?: string;
  electronicMonitoringEnabled?: boolean;
}
