import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { DispatchItem } from "../types";

export const dispatchApi = createApi({
  reducerPath: "dispatchApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/dispatch",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Dispatch"],
  endpoints: (builder) => ({
    getDispatches: builder.query<DispatchItem[], void>({
      query: () => "/trips",
      providesTags: ["Dispatch"],
    }),
    getDispatchById: builder.query<DispatchItem, string>({
      query: (id) => `/trips/${id}`,
      providesTags: (_res, _err, id) => [{ type: "Dispatch", id }],
    }),
    authorizeDispatch: builder.mutation<DispatchItem, Partial<DispatchItem>>({
      query: (body) => ({
        url: "/authorize",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Dispatch"],
    }),
    assignVehicleToTrip: builder.mutation<
      DispatchItem,
      { dispatchId: string; vehicleNumber: string; driverName: string; driverMobile: string }
    >({
      query: ({ dispatchId, ...body }) => ({
        url: `/trips/${dispatchId}/assign-vehicle`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Dispatch"],
    }),
    confirmLoading: builder.mutation<
      DispatchItem,
      { dispatchId: string; weighbridgeSlipNumber: string; grossWeightKg: number }
    >({
      query: ({ dispatchId, ...body }) => ({
        url: `/trips/${dispatchId}/confirm-loading`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Dispatch"],
    }),
    gateOutDispatch: builder.mutation<DispatchItem, { dispatchId: string; ePassNumber: string }>({
      query: ({ dispatchId, ...body }) => ({
        url: `/trips/${dispatchId}/gate-out`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Dispatch"],
    }),
    cancelDispatch: builder.mutation<DispatchItem, { dispatchId: string; reason: string }>({
      query: ({ dispatchId, ...body }) => ({
        url: `/trips/${dispatchId}/cancel`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Dispatch"],
    }),
  }),
});

export const {
  useGetDispatchesQuery,
  useGetDispatchByIdQuery,
  useAuthorizeDispatchMutation,
  useAssignVehicleToTripMutation,
  useConfirmLoadingMutation,
  useGateOutDispatchMutation,
  useCancelDispatchMutation,
} = dispatchApi;
