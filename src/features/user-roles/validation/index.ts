import { z } from "zod";

export const createUserSchema = z.object({
  employeeId: z.string().min(3, "Employee ID must be at least 3 characters"),
  fullName: z.string().min(2, "Full name is required"),
  department: z.string().min(2, "Department is required"),
  email: z.string().email("Invalid official email address"),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
  role: z.string().min(2, "Role selection is required"),
  designation: z.string().min(2, "Designation is required"),
  district: z.string().min(2, "District jurisdiction is required"),
  mandal: z.string().min(2, "Mandal/Block is required"),
  mfaEnabled: z.boolean().default(true),
  status: z.enum(["Active", "Inactive", "Suspended", "Password Reset Required"]).default("Active"),
  permissions: z.array(z.string()).min(1, "At least one module permission must be assigned"),
});

export const assignRoleSchema = z.object({
  role: z.string().min(2, "Role is required"),
  department: z.string().optional(),
  permissions: z.array(z.string()).min(1, "At least one permission is required"),
  makerCheckerApproval: z.boolean().optional(),
});

export const resetPasswordSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  sendSmsNotification: z.boolean().default(true),
  forceResetOnLogin: z.boolean().default(true),
});

export type CreateUserSchemaType = z.infer<typeof createUserSchema>;
export type AssignRoleSchemaType = z.infer<typeof assignRoleSchema>;
export type ResetPasswordSchemaType = z.infer<typeof resetPasswordSchema>;
