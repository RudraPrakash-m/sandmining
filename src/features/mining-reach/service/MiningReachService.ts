import { createApi, type BaseQueryFn } from "@reduxjs/toolkit/query/react";
import type { AxiosRequestConfig, AxiosError } from "axios";
import apiClient from "@/services/api/apiClient";
import type { MiningReach, MiningReachStatus, ReachFilterParams, ReachDocument } from "../types";

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

export const miningReachApi = createApi({
  reducerPath: "miningReachApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["MiningReaches", "ReachDetail"],
  endpoints: (builder) => ({
    getMiningReaches: builder.query<MiningReach[], ReachFilterParams | void>({
      query: (params) => ({
        url: "/api/mining-reaches",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["MiningReaches"],
    }),
    getMiningReachById: builder.query<MiningReach, string>({
      query: (id) => ({
        url: `/api/mining-reaches/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "ReachDetail", id }],
    }),
    createMiningReach: builder.mutation<MiningReach, Partial<MiningReach>>({
      query: (body) => ({
        url: "/api/mining-reaches",
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["MiningReaches"],
    }),
    updateMiningReach: builder.mutation<MiningReach, { id: string; data: Partial<MiningReach> }>({
      query: ({ id, data }) => ({
        url: `/api/mining-reaches/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (_result, _error, { id }) => ["MiningReaches", { type: "ReachDetail", id }],
    }),
    updateMiningReachStatus: builder.mutation<
      MiningReach,
      { id: string; status: MiningReachStatus; remarks?: string }
    >({
      query: ({ id, status, remarks }) => ({
        url: `/api/mining-reaches/${id}/status`,
        method: "PATCH",
        data: { status, remarks },
      }),
      invalidatesTags: (_result, _error, { id }) => ["MiningReaches", { type: "ReachDetail", id }],
    }),
    uploadReachDocument: builder.mutation<
      ReachDocument,
      { reachId: string; document: FormData }
    >({
      query: ({ reachId, document }) => ({
        url: `/api/mining-reaches/${reachId}/documents`,
        method: "POST",
        data: document,
      }),
      invalidatesTags: (_result, _error, { reachId }) => [{ type: "ReachDetail", id: reachId }],
    }),
  }),
});

export const {
  useGetMiningReachesQuery,
  useGetMiningReachByIdQuery,
  useCreateMiningReachMutation,
  useUpdateMiningReachMutation,
  useUpdateMiningReachStatusMutation,
  useUploadReachDocumentMutation,
} = miningReachApi;
