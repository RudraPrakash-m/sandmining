import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DashboardFilterState, DateRangePreset } from "../types";

const initialState: DashboardFilterState = {
  selectedDistrict: "ALL",
  dateRange: "today",
  customStartDate: undefined,
  customEndDate: undefined,
  searchQuery: "",
  activeAlertTab: "recent",
};

export const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setSelectedDistrict: (state, action: PayloadAction<string>) => {
      state.selectedDistrict = action.payload;
    },
    setDateRange: (state, action: PayloadAction<DateRangePreset>) => {
      state.dateRange = action.payload;
    },
    setCustomDateRange: (
      state,
      action: PayloadAction<{ startDate: string; endDate: string }>
    ) => {
      state.dateRange = "custom";
      state.customStartDate = action.payload.startDate;
      state.customEndDate = action.payload.endDate;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setActiveAlertTab: (state, action: PayloadAction<"recent" | "illegal">) => {
      state.activeAlertTab = action.payload;
    },
    resetDashboardFilters: (state) => {
      state.selectedDistrict = "ALL";
      state.dateRange = "today";
      state.customStartDate = undefined;
      state.customEndDate = undefined;
      state.searchQuery = "";
      state.activeAlertTab = "recent";
    },
  },
});

export const {
  setSelectedDistrict,
  setDateRange,
  setCustomDateRange,
  setSearchQuery,
  setActiveAlertTab,
  resetDashboardFilters,
} = dashboardSlice.actions;

export const selectDashboardDistrict = (state: { dashboard: DashboardFilterState }) =>
  state.dashboard.selectedDistrict;
export const selectDashboardDateRange = (state: { dashboard: DashboardFilterState }) =>
  state.dashboard.dateRange;
export const selectDashboardFilterState = (state: { dashboard: DashboardFilterState }) =>
  state.dashboard;

export default dashboardSlice.reducer;
