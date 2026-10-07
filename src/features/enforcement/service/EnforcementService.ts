import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  EnforcementAlert,
  CreateEnforcementAlertPayload,
  AssignOfficerPayload,
  InvestigateAlertPayload,
  SeizeVehiclePayload,
  CloseCasePayload,
} from "../types";

export const enforcementApi = createApi({
  reducerPath: "enforcementApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/enforcement",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["EnforcementAlert"],
  endpoints: (builder) => ({
    getAlerts: builder.query<EnforcementAlert[], void>({
      query: () => "/alerts",
      providesTags: ["EnforcementAlert"],
    }),
    getAlertById: builder.query<EnforcementAlert, string>({
      query: (id) => `/${id}`,
      providesTags: (_res, _err, id) => [{ type: "EnforcementAlert", id }],
    }),
    createAlert: builder.mutation<EnforcementAlert, CreateEnforcementAlertPayload>({
      query: (body) => ({
        url: "/alerts/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["EnforcementAlert"],
    }),
    assignOfficer: builder.mutation<EnforcementAlert, AssignOfficerPayload>({
      query: (body) => ({
        url: "/alerts/assign-officer",
        method: "POST",
        body,
      }),
      invalidatesTags: ["EnforcementAlert"],
    }),
    investigateAlert: builder.mutation<EnforcementAlert, InvestigateAlertPayload>({
      query: (body) => ({
        url: "/alerts/investigate",
        method: "POST",
        body,
      }),
      invalidatesTags: ["EnforcementAlert"],
    }),
    seizeVehicle: builder.mutation<EnforcementAlert, SeizeVehiclePayload>({
      query: (body) => ({
        url: "/alerts/seize-vehicle",
        method: "POST",
        body,
      }),
      invalidatesTags: ["EnforcementAlert"],
    }),
    closeCase: builder.mutation<EnforcementAlert, CloseCasePayload>({
      query: (body) => ({
        url: "/alerts/close-case",
        method: "POST",
        body,
      }),
      invalidatesTags: ["EnforcementAlert"],
    }),
  }),
});

export const {
  useGetAlertsQuery,
  useGetAlertByIdQuery,
  useCreateAlertMutation,
  useAssignOfficerMutation,
  useInvestigateAlertMutation,
  useSeizeVehicleMutation,
  useCloseCaseMutation,
} = enforcementApi;
