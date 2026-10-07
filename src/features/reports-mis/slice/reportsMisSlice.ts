import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ReportCategory, ReportFilterCriteria, ScheduledReportConfig } from "../types";

interface ReportsMisState {
  activeCategory: ReportCategory;
  filters: ReportFilterCriteria;
  scheduledReports: ScheduledReportConfig[];
  isFilterDrawerOpen: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: ReportsMisState = {
  activeCategory: "DAILY_EXCAVATION",
  filters: {
    dateRangePreset: "This Month",
    district: "ALL",
  },
  scheduledReports: [],
  isFilterDrawerOpen: false,
  isLoading: false,
  error: null,
};

export const reportsMisSlice = createSlice({
  name: "reportsMis",
  initialState,
  reducers: {
    setActiveCategory: (state, action: PayloadAction<ReportCategory>) => {
      state.activeCategory = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<ReportFilterCriteria>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    toggleFilterDrawer: (state) => {
      state.isFilterDrawerOpen = !state.isFilterDrawerOpen;
    },
    setScheduledReports: (state, action: PayloadAction<ScheduledReportConfig[]>) => {
      state.scheduledReports = action.payload;
    },
    addScheduledReport: (state, action: PayloadAction<ScheduledReportConfig>) => {
      state.scheduledReports = [action.payload, ...state.scheduledReports];
    },
  },
});

export const {
  setActiveCategory,
  setFilters,
  toggleFilterDrawer,
  setScheduledReports,
  addScheduledReport,
} = reportsMisSlice.actions;

export default reportsMisSlice.reducer;
