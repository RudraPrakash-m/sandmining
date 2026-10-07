import { z } from "zod";

export const auditFilterSchema = z.object({
  searchQuery: z.string().optional(),
  module: z.string().default("ALL"),
  action: z.string().default("ALL"),
  userRole: z.string().default("ALL"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  ipAddress: z.string().optional(),
});

export const auditExportSchema = z.object({
  format: z.enum(["CSV", "EXCEL", "PDF", "JSON"]).default("EXCEL"),
  includeStateDiffs: z.boolean().default(true),
  cryptographicSignatureRequired: z.boolean().default(true),
  authorizedBy: z.string().min(3, "Authorizing auditor ID required for export"),
});

export const integrityCheckSchema = z.object({
  ledgerBlockId: z.string().min(1, "Block ID required"),
  verifySha256Chain: z.boolean().default(true),
});

export type AuditFilterSchemaType = z.infer<typeof auditFilterSchema>;
export type AuditExportSchemaType = z.infer<typeof auditExportSchema>;
export type IntegrityCheckSchemaType = z.infer<typeof integrityCheckSchema>;
