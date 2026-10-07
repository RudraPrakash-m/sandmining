import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  GrievanceTicket,
  RaiseGrievancePayload,
  AssignOfficerPayload,
  RespondGrievancePayload,
  EscalateGrievancePayload,
  CloseGrievancePayload,
  ReopenGrievancePayload,
} from "../types";

export const grievanceApi = createApi({
  reducerPath: "grievanceApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/grievances",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Grievance"],
  endpoints: (builder) => ({
    getGrievances: builder.query<GrievanceTicket[], void>({
      query: () => "/list",
      providesTags: ["Grievance"],
    }),
    getGrievanceById: builder.query<GrievanceTicket, string>({
      query: (id) => `/${id}`,
      providesTags: (_res, _err, id) => [{ type: "Grievance", id }],
    }),
    raiseGrievance: builder.mutation<GrievanceTicket, RaiseGrievancePayload>({
      query: (body) => ({
        url: "/raise",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Grievance"],
    }),
    assignOfficer: builder.mutation<GrievanceTicket, AssignOfficerPayload>({
      query: (body) => ({
        url: "/assign",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Grievance"],
    }),
    respondGrievance: builder.mutation<GrievanceTicket, RespondGrievancePayload>({
      query: (body) => ({
        url: "/respond",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Grievance"],
    }),
    escalateGrievance: builder.mutation<GrievanceTicket, EscalateGrievancePayload>({
      query: (body) => ({
        url: "/escalate",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Grievance"],
    }),
    closeGrievance: builder.mutation<GrievanceTicket, CloseGrievancePayload>({
      query: (body) => ({
        url: "/close",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Grievance"],
    }),
    reopenGrievance: builder.mutation<GrievanceTicket, ReopenGrievancePayload>({
      query: (body) => ({
        url: "/reopen",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Grievance"],
    }),
  }),
});

export const {
  useGetGrievancesQuery,
  useGetGrievanceByIdQuery,
  useRaiseGrievanceMutation,
  useAssignOfficerMutation,
  useRespondGrievanceMutation,
  useEscalateGrievanceMutation,
  useCloseGrievanceMutation,
  useReopenGrievanceMutation,
} = grievanceApi;
