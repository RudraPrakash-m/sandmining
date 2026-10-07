import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { FieldInspectionLog } from "../types";

interface FieldOfficerState {
  inspections: FieldInspectionLog[];
  isOnline: boolean;
  activeTab: "scan" | "weigh" | "incident" | "history";
  currentCheckpost: string;
}

const initialState: FieldOfficerState = {
  inspections: [],
  isOnline: true,
  activeTab: "scan",
  currentCheckpost: "Checkpost Mandir Hasaud (NH-53, Raipur)",
};

export const fieldOfficerSlice = createSlice({
  name: "fieldOfficer",
  initialState,
  reducers: {
    setInspections: (state, action: PayloadAction<FieldInspectionLog[]>) => {
      state.inspections = action.payload;
    },
    addInspection: (state, action: PayloadAction<FieldInspectionLog>) => {
      state.inspections = [action.payload, ...state.inspections];
    },
    toggleOnlineStatus: (state) => {
      state.isOnline = !state.isOnline;
    },
    setActiveTab: (state, action: PayloadAction<"scan" | "weigh" | "incident" | "history">) => {
      state.activeTab = action.payload;
    },
    setCurrentCheckpost: (state, action: PayloadAction<string>) => {
      state.currentCheckpost = action.payload;
    },
  },
});

export const {
  setInspections,
  addInspection,
  toggleOnlineStatus,
  setActiveTab,
  setCurrentCheckpost,
} = fieldOfficerSlice.actions;

export default fieldOfficerSlice.reducer;
