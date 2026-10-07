import type { SystemUser } from "@/features/shared-simulation/types";

export type { SystemUser };

export type UserStatus = "Active" | "Inactive" | "Suspended" | "Password Reset Required";

export interface CreateUserPayload {
  employeeId: string;
  fullName: string;
  department: string;
  email: string;
  mobile: string;
  role: string;
  designation: string;
  district: string;
  mandal: string;
  mfaEnabled: boolean;
  status: UserStatus;
  permissions: string[];
}

export interface AssignRolePayload {
  userId: string;
  role: string;
  department?: string;
  permissions: string[];
  makerCheckerApproval?: boolean;
}

export interface ResetPasswordPayload {
  userId: string;
  sendSmsNotification: boolean;
  forceResetOnLogin: boolean;
}

export interface UserFilters {
  search?: string;
  role?: string | "All";
  department?: string | "All";
  district?: string | "All";
  status?: UserStatus | "All";
}
