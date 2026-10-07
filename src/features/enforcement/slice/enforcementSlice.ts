import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { EnforcementAlert, EnforcementFilters, EnforcementActionStatus } from "../types";

interface EnforcementState {
  alerts: EnforcementAlert[];
  selectedAlert: EnforcementAlert | null;
  filters: EnforcementFilters;
  isLoading: boolean;
  error: string | null;
}

const initialState: EnforcementState = {
  alerts: [],
  selectedAlert: null,
  filters: {
    search: "",
    status: "All",
    severity: "All",
    alertType: "All",
  },
  isLoading: false,
  error: null,
};

export const enforcementSlice = createSlice({
  name: "enforcement",
  initialState,
  reducers: {
    setAlerts: (state, action: PayloadAction<EnforcementAlert[]>) => {
      state.alerts = action.payload;
    },
    setSelectedAlert: (state, action: PayloadAction<EnforcementAlert | null>) => {
      state.selectedAlert = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<EnforcementFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    updateAlertStatusInSlice: (
      state,
      action: PayloadAction<{ id: string; status: EnforcementActionStatus }>
    ) => {
      const idx = state.alerts.findIndex((a) => a.id === action.payload.id);
      if (idx !== -1) {
        state.alerts[idx].actionStatus = action.payload.status;
      }
    },
    clearSelectedAlert: (state) => {
      state.selectedAlert = null;
    },
  },
});

export const {
  setAlerts,
  setSelectedAlert,
  setFilters,
  updateAlertStatusInSlice,
  clearSelectedAlert,
} = enforcementSlice.actions;

export default enforcementSlice.reducer;
