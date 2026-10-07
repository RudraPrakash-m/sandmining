import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  Stockyard,
  StockLedgerEntry,
  AddStockyardFormData,
  StockAdjustmentData,
  StockTransferData,
} from "../types";

export const stockyardApi = createApi({
  reducerPath: "stockyardApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Stockyard", "StockLedger"],
  endpoints: (builder) => ({
    getStockyardList: builder.query<Stockyard[], void>({
      query: () => "/stockyards",
      providesTags: ["Stockyard"],
    }),
    getStockyardById: builder.query<Stockyard, string>({
      query: (id) => `/stockyards/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Stockyard", id }],
    }),
    createStockyard: builder.mutation<Stockyard, AddStockyardFormData>({
      query: (body) => ({
        url: "/stockyards",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Stockyard"],
    }),
    updateStockyard: builder.mutation<
      Stockyard,
      { id: string; data: Partial<AddStockyardFormData> }
    >({
      query: ({ id, data }) => ({
        url: `/stockyards/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Stockyard"],
    }),
    getStockLedger: builder.query<StockLedgerEntry[], string | undefined>({
      query: (stockyardId) =>
        stockyardId ? `/stockyards/${stockyardId}/ledger` : "/stockyards/ledger",
      providesTags: ["StockLedger"],
    }),
    adjustStock: builder.mutation<StockLedgerEntry, StockAdjustmentData>({
      query: (body) => ({
        url: "/stockyards/adjust",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Stockyard", "StockLedger"],
    }),
    transferStock: builder.mutation<StockLedgerEntry, StockTransferData>({
      query: (body) => ({
        url: "/stockyards/transfer",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Stockyard", "StockLedger"],
    }),
  }),
});

export const {
  useGetStockyardListQuery,
  useGetStockyardByIdQuery,
  useCreateStockyardMutation,
  useUpdateStockyardMutation,
  useGetStockLedgerQuery,
  useAdjustStockMutation,
  useTransferStockMutation,
} = stockyardApi;
