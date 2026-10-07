import { createApi, type BaseQueryFn } from "@reduxjs/toolkit/query/react";
import type { AxiosRequestConfig, AxiosError } from "axios";
import apiClient from "@/services/api/apiClient";
import type {
  DashboardKpiSummary,
  DistrictMapData,
  RevenueTrendPoint,
  BookingDispatchTrendPoint,
  RecentAlertItem,
  IllegalMiningAlertItem,
  ExportFormat,
} from "../types";

const axiosBaseQuery =
  (): BaseQueryFn<
    {
      url: string;
      method: AxiosRequestConfig["method"];
      data?: AxiosRequestConfig["data"];
      params?: AxiosRequestConfig["params"];
    },
    unknown,
    unknown
  > =>
  async ({ url, method, data, params }) => {
    try {
      const result = await apiClient.request({
        url,
        method,
        data,
        params,
      });
      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError as AxiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["DashboardKpis", "DistrictMap", "RevenueTrend", "Trends", "Alerts"],
  endpoints: (builder) => ({
    getDashboardKpis: builder.query<
      DashboardKpiSummary,
      { district?: string; dateRange?: string }
    >({
      query: (params) => ({
        url: "/api/dashboard/kpis",
        method: "GET",
        params,
      }),
      providesTags: ["DashboardKpis"],
    }),
    getDistrictMapData: builder.query<DistrictMapData[], { filter?: string }>({
      query: (params) => ({
        url: "/api/dashboard/district-map",
        method: "GET",
        params,
      }),
      providesTags: ["DistrictMap"],
    }),
    getRevenueTrend: builder.query<
      RevenueTrendPoint[],
      { district?: string; period?: string }
    >({
      query: (params) => ({
        url: "/api/dashboard/revenue-trend",
        method: "GET",
        params,
      }),
      providesTags: ["RevenueTrend"],
    }),
    getBookingDispatchTrend: builder.query<
      BookingDispatchTrendPoint[],
      { district?: string; dateRange?: string }
    >({
      query: (params) => ({
        url: "/api/dashboard/booking-dispatch-trend",
        method: "GET",
        params,
      }),
      providesTags: ["Trends"],
    }),
    getRecentAlerts: builder.query<RecentAlertItem[], { district?: string }>({
      query: (params) => ({
        url: "/api/dashboard/recent-alerts",
        method: "GET",
        params,
      }),
      providesTags: ["Alerts"],
    }),
    getIllegalMiningAlerts: builder.query<
      IllegalMiningAlertItem[],
      { district?: string }
    >({
      query: (params) => ({
        url: "/api/dashboard/illegal-mining-alerts",
        method: "GET",
        params,
      }),
      providesTags: ["Alerts"],
    }),
    exportDashboardReport: builder.mutation<
      { downloadUrl: string; filename: string },
      { format: ExportFormat; district?: string; dateRange?: string }
    >({
      query: (body) => ({
        url: "/api/dashboard/export",
        method: "POST",
        data: body,
      }),
    }),
  }),
});

export const {
  useGetDashboardKpisQuery,
  useGetDistrictMapDataQuery,
  useGetRevenueTrendQuery,
  useGetBookingDispatchTrendQuery,
  useGetRecentAlertsQuery,
  useGetIllegalMiningAlertsQuery,
  useExportDashboardReportMutation,
} = dashboardApi;
