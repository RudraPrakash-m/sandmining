import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { GrievanceTicket, GrievanceFilters, GrievanceStatus } from "../types";

interface GrievanceState {
  grievances: GrievanceTicket[];
  selectedGrievance: GrievanceTicket | null;
  filters: GrievanceFilters;
  isLoading: boolean;
  error: string | null;
}

const initialState: GrievanceState = {
  grievances: [],
  selectedGrievance: null,
  filters: {
    search: "",
    status: "All",
    category: "All",
    priority: "All",
  },
  isLoading: false,
  error: null,
};

export const grievanceSlice = createSlice({
  name: "grievance",
  initialState,
  reducers: {
    setGrievances: (state, action: PayloadAction<GrievanceTicket[]>) => {
      state.grievances = action.payload;
    },
    setSelectedGrievance: (state, action: PayloadAction<GrievanceTicket | null>) => {
      state.selectedGrievance = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<GrievanceFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    updateTicketStatus: (
      state,
      action: PayloadAction<{ id: string; status: GrievanceStatus; remarks?: string }>
    ) => {
      const idx = state.grievances.findIndex((g) => g.id === action.payload.id);
      if (idx !== -1) {
        state.grievances[idx].status = action.payload.status;
        if (action.payload.remarks) {
          state.grievances[idx].resolutionRemarks = action.payload.remarks;
        }
      }
    },
    clearSelectedGrievance: (state) => {
      state.selectedGrievance = null;
    },
  },
});

export const {
  setGrievances,
  setSelectedGrievance,
  setFilters,
  updateTicketStatus,
  clearSelectedGrievance,
} = grievanceSlice.actions;

export default grievanceSlice.reducer;
