import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { SandBooking, SandAvailabilityCheck } from "../types";

export const sandBookingApi = createApi({
  reducerPath: "sandBookingApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/booking",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["SandBooking", "StockAvailability"],
  endpoints: (builder) => ({
    getBookings: builder.query<SandBooking[], void>({
      query: () => "/all",
      providesTags: ["SandBooking"],
    }),
    getBookingById: builder.query<SandBooking, string>({
      query: (id) => `/${id}`,
      providesTags: (_res, _err, id) => [{ type: "SandBooking", id }],
    }),
    checkStockAvailability: builder.query<
      SandAvailabilityCheck,
      { stockyardId: string; quantityMt: number }
    >({
      query: ({ stockyardId, quantityMt }) =>
        `/availability?stockyardId=${stockyardId}&quantity=${quantityMt}`,
      providesTags: ["StockAvailability"],
    }),
    createSandBooking: builder.mutation<SandBooking, Partial<SandBooking>>({
      query: (body) => ({
        url: "/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["SandBooking", "StockAvailability"],
    }),
    cancelBooking: builder.mutation<SandBooking, { bookingId: string; reason: string }>({
      query: ({ bookingId, ...body }) => ({
        url: `/${bookingId}/cancel`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["SandBooking"],
    }),
  }),
});

export const {
  useGetBookingsQuery,
  useGetBookingByIdQuery,
  useCheckStockAvailabilityQuery,
  useCreateSandBookingMutation,
  useCancelBookingMutation,
} = sandBookingApi;
