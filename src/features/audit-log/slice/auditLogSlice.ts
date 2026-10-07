import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuditLogRecord, AuditActionType, AuditModuleType } from "../types";

interface AuditLogState {
  searchQuery: string;
  selectedModule: AuditModuleType | "ALL";
  selectedAction: AuditActionType | "ALL";
  selectedUserRole: string | "ALL";
  startDate: string;
  endDate: string;
  ipFilter: string;
  selectedRecord: AuditLogRecord | null;
  isFilterModalOpen: boolean;
  isViewModalOpen: boolean;
  isExportModalOpen: boolean;
  isIntegrityModalOpen: boolean;
}

const initialState: AuditLogState = {
  searchQuery: "",
  selectedModule: "ALL",
  selectedAction: "ALL",
  selectedUserRole: "ALL",
  startDate: "",
  endDate: "",
  ipFilter: "",
  selectedRecord: null,
  isFilterModalOpen: false,
  isViewModalOpen: false,
  isExportModalOpen: false,
  isIntegrityModalOpen: false,
};

export const auditLogSlice = createSlice({
  name: "auditLog",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedModule: (state, action: PayloadAction<AuditModuleType | "ALL">) => {
      state.selectedModule = action.payload;
    },
    setSelectedAction: (state, action: PayloadAction<AuditActionType | "ALL">) => {
      state.selectedAction = action.payload;
    },
    setSelectedUserRole: (state, action: PayloadAction<string | "ALL">) => {
      state.selectedUserRole = action.payload;
    },
    setDateRange: (state, action: PayloadAction<{ startDate: string; endDate: string }>) => {
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;
    },
    setIpFilter: (state, action: PayloadAction<string>) => {
      state.ipFilter = action.payload;
    },
    setSelectedRecord: (state, action: PayloadAction<AuditLogRecord | null>) => {
      state.selectedRecord = action.payload;
    },
    setFilterModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isFilterModalOpen = action.payload;
    },
    setViewModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isViewModalOpen = action.payload;
    },
    setExportModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isExportModalOpen = action.payload;
    },
    setIntegrityModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isIntegrityModalOpen = action.payload;
    },
    resetFilters: (state) => {
      state.searchQuery = "";
      state.selectedModule = "ALL";
      state.selectedAction = "ALL";
      state.selectedUserRole = "ALL";
      state.startDate = "";
      state.endDate = "";
      state.ipFilter = "";
    },
  },
});

export const {
  setSearchQuery,
  setSelectedModule,
  setSelectedAction,
  setSelectedUserRole,
  setDateRange,
  setIpFilter,
  setSelectedRecord,
  setFilterModalOpen,
  setViewModalOpen,
  setExportModalOpen,
  setIntegrityModalOpen,
  resetFilters,
} = auditLogSlice.actions;

export default auditLogSlice.reducer;
