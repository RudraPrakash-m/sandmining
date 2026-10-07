import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  FieldInspectionLog,
  VerifyPassPayload,
  SpotWeighPayload,
  QuickViolationPayload,
} from "../types";

export const fieldOfficerApi = createApi({
  reducerPath: "fieldOfficerApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/field-officer",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["FieldInspection"],
  endpoints: (builder) => ({
    getTodayInspections: builder.query<FieldInspectionLog[], void>({
      query: () => "/inspections/today",
      providesTags: ["FieldInspection"],
    }),
    verifyEPass: builder.mutation<{ isValid: boolean; details: any }, VerifyPassPayload>({
      query: (body) => ({
        url: "/verify-epass",
        method: "POST",
        body,
      }),
    }),
    submitSpotWeighment: builder.mutation<FieldInspectionLog, SpotWeighPayload>({
      query: (body) => ({
        url: "/spot-weigh",
        method: "POST",
        body,
      }),
      invalidatesTags: ["FieldInspection"],
    }),
    reportQuickViolation: builder.mutation<{ alertId: string; success: boolean }, QuickViolationPayload>({
      query: (body) => ({
        url: "/report-violation",
        method: "POST",
        body,
      }),
      invalidatesTags: ["FieldInspection"],
    }),
  }),
});

export const {
  useGetTodayInspectionsQuery,
  useVerifyEPassMutation,
  useSubmitSpotWeighmentMutation,
  useReportQuickViolationMutation,
} = fieldOfficerApi;
