import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { DeliveryConfirmation, DeliveryFilters } from "../types";

interface DeliveryState {
  deliveries: DeliveryConfirmation[];
  selectedDelivery: DeliveryConfirmation | null;
  filters: DeliveryFilters;
  isLoading: boolean;
  error: string | null;
}

const initialState: DeliveryState = {
  deliveries: [],
  selectedDelivery: null,
  filters: {
    search: "",
    status: "All",
  },
  isLoading: false,
  error: null,
};

export const deliverySlice = createSlice({
  name: "delivery",
  initialState,
  reducers: {
    setDeliveries: (state, action: PayloadAction<DeliveryConfirmation[]>) => {
      state.deliveries = action.payload;
    },
    setSelectedDelivery: (state, action: PayloadAction<DeliveryConfirmation | null>) => {
      state.selectedDelivery = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<DeliveryFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    updateDeliveryStatus: (
      state,
      action: PayloadAction<{ id: string; status: "Delivered" | "Pending OTP" | "Failed" }>
    ) => {
      const idx = state.deliveries.findIndex((d) => d.id === action.payload.id);
      if (idx !== -1) {
        state.deliveries[idx].status = action.payload.status;
      }
    },
    clearSelectedDelivery: (state) => {
      state.selectedDelivery = null;
    },
  },
});

export const {
  setDeliveries,
  setSelectedDelivery,
  setFilters,
  updateDeliveryStatus,
  clearSelectedDelivery,
} = deliverySlice.actions;

export default deliverySlice.reducer;
