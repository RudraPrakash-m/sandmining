import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { WeighbridgeRecord, CaptureWeightFormData, WeighbridgeStatus } from "../types";

export const weighbridgeApi = createApi({
  reducerPath: "weighbridgeApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["WeighbridgeSlip"],
  endpoints: (builder) => ({
    getWeighbridgeSlips: builder.query<WeighbridgeRecord[], void>({
      query: () => "/weighbridge/slips",
      providesTags: ["WeighbridgeSlip"],
    }),
    getWeighbridgeSlipById: builder.query<WeighbridgeRecord, string>({
      query: (id) => `/weighbridge/slips/${id}`,
      providesTags: (_result, _error, id) => [{ type: "WeighbridgeSlip", id }],
    }),
    captureWeightSlip: builder.mutation<WeighbridgeRecord, CaptureWeightFormData>({
      query: (body) => ({
        url: "/weighbridge/slips",
        method: "POST",
        body,
      }),
      invalidatesTags: ["WeighbridgeSlip"],
    }),
    updateSlipStatus: builder.mutation<
      WeighbridgeRecord,
      { id: string; status: WeighbridgeStatus; remarks?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/weighbridge/slips/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["WeighbridgeSlip"],
    }),
    fetchIoTScaleReading: builder.query<
      { scaleId: string; liveWeightKg: number; isStable: boolean; timestamp: string },
      string
    >({
      query: (scaleId) => `/weighbridge/iot/${scaleId}/live`,
    }),
  }),
});

export const {
  useGetWeighbridgeSlipsQuery,
  useGetWeighbridgeSlipByIdQuery,
  useCaptureWeightSlipMutation,
  useUpdateSlipStatusMutation,
  useFetchIoTScaleReadingQuery,
} = weighbridgeApi;
