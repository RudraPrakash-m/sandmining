import type {
  GrievanceTicket,
  GrievanceCommunication,
  GrievanceCategory,
  GrievancePriority,
  GrievanceStageKey,
  GrievanceStatus,
} from "@/features/shared-simulation/types";

export type {
  GrievanceTicket,
  GrievanceCommunication,
  GrievanceCategory,
  GrievancePriority,
  GrievanceStageKey,
  GrievanceStatus,
};

export const COMPLAINT_CATEGORIES: GrievanceCategory[] = [
  "Delivery Delay",
  "Vehicle Not Arrived",
  "Wrong Quantity",
  "Payment Issue",
  "Vehicle/Driver Issue",
  "Sand Quality Issue",
  "Booking Issue",
  "OTP Issue",
  "Other",
];

export interface ComplaintStageConfig {
  stageNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  stageKey: GrievanceStageKey;
  name: string;
  shortDesc: string;
  badgeVariant: "primary" | "secondary" | "success" | "warning" | "danger" | "info";
  actorRole: string;
}

export const COMPLAINT_STAGES: Record<number, ComplaintStageConfig> = {
  1: {
    stageNumber: 1,
    stageKey: "CUSTOMER",
    name: "Customer",
    shortDesc: "Citizen reports complaint via Portal/App/1800 Helpline",
    badgeVariant: "secondary",
    actorRole: "Complainant Citizen",
  },
  2: {
    stageNumber: 2,
    stageKey: "COMPLAINT_REGISTRATION",
    name: "Complaint Registration",
    shortDesc: "Ticket ID generated & SLA countdown started with SMS token",
    badgeVariant: "warning",
    actorRole: "System Auto-Ingest",
  },
  3: {
    stageNumber: 3,
    stageKey: "CALL_CENTRE_OFFICER",
    name: "Call Centre/Officer",
    shortDesc: "Toll-Free Helpdesk / Grievance Officer review & triage",
    badgeVariant: "info",
    actorRole: "Call Centre Desk Officer",
  },
  4: {
    stageNumber: 4,
    stageKey: "ASSIGNED",
    name: "Assigned",
    shortDesc: "Delegated to District Sand Officer / Depot Incharge",
    badgeVariant: "primary",
    actorRole: "District Mining Officer",
  },
  5: {
    stageNumber: 5,
    stageKey: "ACTION_TAKEN",
    name: "Action Taken",
    shortDesc: "Field inspection, weighment audit or disciplinary action",
    badgeVariant: "warning",
    actorRole: "Enforcement / Depot Officer",
  },
  6: {
    stageNumber: 6,
    stageKey: "RESOLVED",
    name: "Resolved",
    shortDesc: "Remedy executed, refund/re-delivery logged, OTP sent",
    badgeVariant: "success",
    actorRole: "Grievance Redressal Officer",
  },
  7: {
    stageNumber: 7,
    stageKey: "CUSTOMER_CONFIRMATION",
    name: "Customer Confirmation",
    shortDesc: "Citizen OTP verification, rating & formal sign-off",
    badgeVariant: "success",
    actorRole: "Complainant Citizen",
  },
};

export interface RaiseGrievancePayload {
  ticketId?: string;
  customerName: string;
  customerMobile: string;
  category: GrievanceCategory;
  bookingOrderId: string;
  description: string;
  location: string;
  priority: GrievancePriority;
  assignedOfficer?: string;
  slaRemainingHours?: number;
  intakeChannel?: "Customer Portal" | "Citizen Mobile App" | "Toll-Free 1800 Call Centre" | "Officer Desk";
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface ReviewCallCentrePayload {
  ticketId: string;
  callCentreNotes: string;
  callCentreAgent?: string;
  priority?: GrievancePriority;
}

export interface AssignOfficerPayload {
  ticketId: string;
  officerName: string;
  department?: string;
  remarks?: string;
}

export interface ActionTakenPayload {
  ticketId: string;
  actionTakenDetails: string;
  actionTakenBy: string;
  remedyType?: string;
}

export interface ResolveGrievancePayload {
  ticketId: string;
  resolutionRemarks: string;
  remedyType?: string;
}

export interface CustomerConfirmationPayload {
  ticketId: string;
  customerOtp: string;
  customerFeedbackScore?: number;
  customerFeedbackComments?: string;
  isSatisfied: boolean;
}

export interface RespondGrievancePayload {
  ticketId: string;
  message: string;
  author: string;
  role: string;
  isInternal: boolean;
  attachmentUrl?: string;
}

export interface EscalateGrievancePayload {
  ticketId: string;
  escalationLevel: string;
  reason: string;
}

export interface CloseGrievancePayload {
  ticketId: string;
  resolutionRemarks: string;
  feedbackScore?: number;
}

export interface ReopenGrievancePayload {
  ticketId: string;
  reason: string;
}

export interface GrievanceFilters {
  search?: string;
  stage?: number | "All";
  status?: GrievanceStatus | "All";
  category?: GrievanceCategory | "All";
  priority?: GrievancePriority | "All";
}
