import { createApi, type BaseQueryFn } from "@reduxjs/toolkit/query/react";
import type { AxiosRequestConfig, AxiosError } from "axios";
import apiClient from "@/services/api/apiClient";
import type {
  MiningPermit,
  PermitFilterParams,
  RenewPermitPayload,
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

export const legalPermitApi = createApi({
  reducerPath: "legalPermitApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["LegalPermits", "PermitDetail"],
  endpoints: (builder) => ({
    getPermits: builder.query<MiningPermit[], PermitFilterParams | void>({
      query: (params) => ({
        url: "/api/legal-permits",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["LegalPermits"],
    }),
    getPermitById: builder.query<MiningPermit, string>({
      query: (id) => ({
        url: `/api/legal-permits/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "PermitDetail", id }],
    }),
    createPermit: builder.mutation<MiningPermit, Partial<MiningPermit>>({
      query: (body) => ({
        url: "/api/legal-permits",
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["LegalPermits"],
    }),
    verifyPermit: builder.mutation<
      MiningPermit,
      { id: string; inspectionStatus: string; inspectingOfficer: string; remarks: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/api/legal-permits/${id}/verify`,
        method: "POST",
        data: body,
      }),
      invalidatesTags: (_result, _error, { id }) => ["LegalPermits", { type: "PermitDetail", id }],
    }),
    approvePermit: builder.mutation<MiningPermit, { id: string; approverRemarks?: string }>({
      query: ({ id, approverRemarks }) => ({
        url: `/api/legal-permits/${id}/approve`,
        method: "PATCH",
        data: { approverRemarks },
      }),
      invalidatesTags: (_result, _error, { id }) => ["LegalPermits", { type: "PermitDetail", id }],
    }),
    renewPermit: builder.mutation<MiningPermit, RenewPermitPayload>({
      query: ({ permitId, ...body }) => ({
        url: `/api/legal-permits/${permitId}/renew`,
        method: "POST",
        data: body,
      }),
      invalidatesTags: (_result, _error, { permitId }) => [
        "LegalPermits",
        { type: "PermitDetail", id: permitId },
      ],
    }),
    suspendPermit: builder.mutation<MiningPermit, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/api/legal-permits/${id}/suspend`,
        method: "PATCH",
        data: { reason },
      }),
      invalidatesTags: (_result, _error, { id }) => ["LegalPermits", { type: "PermitDetail", id }],
    }),
  }),
});

export const {
  useGetPermitsQuery,
  useGetPermitByIdQuery,
  useCreatePermitMutation,
  useVerifyPermitMutation,
  useApprovePermitMutation,
  useRenewPermitMutation,
  useSuspendPermitMutation,
} = legalPermitApi;
