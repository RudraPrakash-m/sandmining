import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { PaymentTransaction, ProcessPaymentPayload, PaymentRefundPayload } from "../types";

export const paymentApi = createApi({
  reducerPath: "paymentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/payment",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["PaymentTransaction", "TreasuryReconciliation"],
  endpoints: (builder) => ({
    getPayments: builder.query<PaymentTransaction[], void>({
      query: () => "/transactions",
      providesTags: ["PaymentTransaction"],
    }),
    getPaymentById: builder.query<PaymentTransaction, string>({
      query: (id) => `/transactions/${id}`,
      providesTags: (_res, _err, id) => [{ type: "PaymentTransaction", id }],
    }),
    processPayment: builder.mutation<PaymentTransaction, ProcessPaymentPayload>({
      query: (body) => ({
        url: "/process",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PaymentTransaction", "TreasuryReconciliation"],
    }),
    retryPayment: builder.mutation<PaymentTransaction, { transactionId: string; paymentMode: string }>({
      query: (body) => ({
        url: "/retry",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PaymentTransaction"],
    }),
    refundPayment: builder.mutation<PaymentTransaction, PaymentRefundPayload>({
      query: (body) => ({
        url: "/refund",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PaymentTransaction", "TreasuryReconciliation"],
    }),
    reconcileTransactions: builder.mutation<{ reconciledCount: number; status: string }, void>({
      query: () => ({
        url: "/reconcile",
        method: "POST",
      }),
      invalidatesTags: ["PaymentTransaction", "TreasuryReconciliation"],
    }),
  }),
});

export const {
  useGetPaymentsQuery,
  useGetPaymentByIdQuery,
  useProcessPaymentMutation,
  useRetryPaymentMutation,
  useRefundPaymentMutation,
  useReconcileTransactionsMutation,
} = paymentApi;
