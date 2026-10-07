export type AuditActionType =
  | "CREATE"
  | "APPROVE"
  | "UPDATE"
  | "SUSPEND"
  | "DISPATCH"
  | "DELETE"
  | "SEIZE"
  | "OVERRIDE"
  | "LOGIN"
  | "EXPORT"
  | "REJECT";

export type AuditModuleType =
  | "Mining Reach"
  | "Permits"
  | "Excavation"
  | "Stockyard"
  | "Weighbridge"
  | "Vehicle"
  | "Driver"
  | "Citizens"
  | "Payments"
  | "Grievance"
  | "Dispatch"
  | "e-Pass"
  | "Enforcement"
  | "Masters"
  | "System Monitoring"
  | "User & Access Control"
  | "System";

export interface AuditLogRecord {
  id: string;
  timestamp: string; // Date & Time
  userName: string; // User
  userRole: string; // Role
  userId?: string;
  module: AuditModuleType;
  action: AuditActionType | string; // Action
  recordId: string;
  oldValue: string; // Previous Status
  newValue: string; // New Status
  previousStatus?: string;
  newStatus?: string;
  ipAddress: string; // IP Address
  deviceInfo?: string; // Device
  gpsLocation?: string; // GPS, where applicable
  gpsCoordinates?: string;
  remarks: string; // Remarks
  hashSignature?: string;
  isSuccessful?: boolean;
  retentionPolicy?: string;
}

export interface AuditLogFilterPayload {
  searchQuery?: string;
  module?: AuditModuleType | "ALL";
  action?: AuditActionType | "ALL";
  userRole?: string | "ALL";
  startDate?: string;
  endDate?: string;
  ipAddress?: string;
}

export interface SystemHealthMetric {
  nodeName: string;
  status: "OPERATIONAL" | "DEGRADED" | "CRITICAL";
  uptimePercent: number;
  apiLatencyMs: number;
  activeSurveillanceNodes: number;
  ledgerIntegrityVerified: boolean;
  lastLedgerBlockTimestamp: string;
}
