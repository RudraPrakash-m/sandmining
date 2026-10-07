import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { DeliveryConfirmation, ConfirmDeliveryPayload } from "../types";

export const deliveryApi = createApi({
  reducerPath: "deliveryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/delivery",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Delivery"],
  endpoints: (builder) => ({
    getDeliveries: builder.query<DeliveryConfirmation[], void>({
      query: () => "/ledger",
      providesTags: ["Delivery"],
    }),
    getDeliveryById: builder.query<DeliveryConfirmation, string>({
      query: (id) => `/${id}`,
      providesTags: (_res, _err, id) => [{ type: "Delivery", id }],
    }),
    confirmDelivery: builder.mutation<DeliveryConfirmation, ConfirmDeliveryPayload>({
      query: (body) => ({
        url: "/confirm",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Delivery"],
    }),
    verifyOtp: builder.mutation<{ success: boolean; message: string }, { deliveryId: string; otpCode: string }>({
      query: (body) => ({
        url: "/verify-otp",
        method: "POST",
        body,
      }),
    }),
    uploadPodEvidence: builder.mutation<
      { photoUrl: string },
      { deliveryId: string; formData: FormData }
    >({
      query: ({ deliveryId, formData }) => ({
        url: `/${deliveryId}/evidence-photo`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Delivery"],
    }),
  }),
});

export const {
  useGetDeliveriesQuery,
  useGetDeliveryByIdQuery,
  useConfirmDeliveryMutation,
  useVerifyOtpMutation,
  useUploadPodEvidenceMutation,
} = deliveryApi;
