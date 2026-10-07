import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { AuditLogRecord, AuditLogFilterPayload, SystemHealthMetric } from "../types";

export const auditLogApi = createApi({
  reducerPath: "auditLogApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/audit-monitoring",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["AuditLog", "SystemHealth"],
  endpoints: (builder) => ({
    getAuditLogs: builder.query<AuditLogRecord[], AuditLogFilterPayload | void>({
      query: (params) => ({
        url: "/logs",
        params: params || {},
      }),
      providesTags: ["AuditLog"],
    }),
    getAuditLogById: builder.query<AuditLogRecord, string>({
      query: (id) => `/logs/${id}`,
      providesTags: (_res, _err, id) => [{ type: "AuditLog", id }],
    }),
    getSystemHealthMetrics: builder.query<SystemHealthMetric[], void>({
      query: () => "/system-health",
      providesTags: ["SystemHealth"],
    }),
    verifyLedgerIntegrity: builder.mutation<{ verified: boolean; hashChainValid: boolean; totalBlocks: number }, void>({
      query: () => ({
        url: "/verify-integrity",
        method: "POST",
      }),
    }),
    generateAuditExport: builder.mutation<{ downloadUrl: string; exportToken: string }, { format: string; filters: AuditLogFilterPayload }>({
      query: (body) => ({
        url: "/export-archive",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetAuditLogsQuery,
  useGetAuditLogByIdQuery,
  useGetSystemHealthMetricsQuery,
  useVerifyLedgerIntegrityMutation,
  useGenerateAuditExportMutation,
} = auditLogApi;
