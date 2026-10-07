import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  ReportCategory,
  ReportFilterCriteria,
  ScheduledReportConfig,
  DistrictConsolidatedMisItem,
} from "../types";

export const reportsMisApi = createApi({
  reducerPath: "reportsMisApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/reports-mis",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["MISReport", "ScheduledReport"],
  endpoints: (builder) => ({
    getReportData: builder.query<any[], { category: ReportCategory; filters: ReportFilterCriteria }>({
      query: ({ category, filters }) => ({
        url: `/${category.toLowerCase()}`,
        params: filters,
      }),
      providesTags: ["MISReport"],
    }),
    getDistrictConsolidatedMis: builder.query<DistrictConsolidatedMisItem[], void>({
      query: () => "/consolidated-mis",
      providesTags: ["MISReport"],
    }),
    getScheduledReports: builder.query<ScheduledReportConfig[], void>({
      query: () => "/scheduled",
      providesTags: ["ScheduledReport"],
    }),
    createScheduledReport: builder.mutation<ScheduledReportConfig, Omit<ScheduledReportConfig, "id">>({
      query: (body) => ({
        url: "/schedule",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ScheduledReport"],
    }),
  }),
});

export const {
  useGetReportDataQuery,
  useGetDistrictConsolidatedMisQuery,
  useGetScheduledReportsQuery,
  useCreateScheduledReportMutation,
} = reportsMisApi;
