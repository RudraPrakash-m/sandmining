import type { EnforcementAlert, EnforcementCaseHistoryItem } from "@/features/shared-simulation/types";

export type { EnforcementAlert, EnforcementCaseHistoryItem };

export type AlertType =
  | "Illegal Excavation"
  | "Route Deviation"
  | "Geofence Breach"
  | "Overloading"
  | "Unregistered Vehicle"
  | "Expired e-Pass"
  | "Night-time Mining"
  | "Weighbridge Bypass";

export type SeverityLevel = "Critical" | "High" | "Moderate";

export type EnforcementActionStatus =
  | "New Alert"
  | "Squad Assigned"
  | "Under Investigation"
  | "Vehicle Seized"
  | "Penalty Levied"
  | "Closed";

export interface CreateEnforcementAlertPayload {
  alertId: string;
  location: string;
  reachId?: string;
  reachName?: string;
  vehicleNumber?: string;
  alertType: AlertType;
  dateTime: string;
  evidencePhotoUrl: string;
  assignedOfficer: string;
  severity: SeverityLevel;
  actionStatus: EnforcementActionStatus;
  caseNotes: string;
}

export interface AssignOfficerPayload {
  alertId: string;
  officerName: string;
  squadName?: string;
  remarks?: string;
}

export interface InvestigateAlertPayload {
  alertId: string;
  inspectionNotes: string;
  status?: EnforcementActionStatus;
  penaltyAmount?: number;
  firNumber?: string;
}

export interface SeizeVehiclePayload {
  alertId: string;
  vehicleNumber?: string;
  seizureOrderNumber: string;
  firNumber?: string;
  penaltyAmount?: number;
  seizureRemarks: string;
}

export interface CloseCasePayload {
  alertId: string;
  resolutionRemarks: string;
  penaltyPaidAmount?: number;
}

export interface EnforcementFilters {
  search?: string;
  status?: EnforcementActionStatus | "All";
  severity?: SeverityLevel | "All";
  alertType?: AlertType | "All";
}
