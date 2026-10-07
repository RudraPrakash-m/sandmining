import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { PaymentTransaction, PaymentFilters } from "../types";

interface PaymentState {
  payments: PaymentTransaction[];
  selectedPayment: PaymentTransaction | null;
  filters: PaymentFilters;
  isLoading: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  payments: [],
  selectedPayment: null,
  filters: {
    search: "",
    paymentMode: "All",
    paymentStatus: "All",
  },
  isLoading: false,
  error: null,
};

export const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    setPayments: (state, action: PayloadAction<PaymentTransaction[]>) => {
      state.payments = action.payload;
    },
    setSelectedPayment: (state, action: PayloadAction<PaymentTransaction | null>) => {
      state.selectedPayment = action.payload;
    },
    setPaymentFilters: (state, action: PayloadAction<Partial<PaymentFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearSelectedPayment: (state) => {
      state.selectedPayment = null;
    },
  },
});

export const {
  setPayments,
  setSelectedPayment,
  setPaymentFilters,
  clearSelectedPayment,
} = paymentSlice.actions;

export default paymentSlice.reducer;
