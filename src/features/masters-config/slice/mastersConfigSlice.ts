import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { MasterCategory } from "../types";

interface MastersConfigState {
  selectedCategory: MasterCategory;
  searchQuery: string;
  statusFilter: "ALL" | "Active" | "Pending Approval" | "Inactive";
  selectedMasterItem: any | null;
  isAddModalOpen: boolean;
  isEditModalOpen: boolean;
  isApproveModalOpen: boolean;
  isDeactivateModalOpen: boolean;
  isImportModalOpen: boolean;
  isAuditModalOpen: boolean;
}

const initialState: MastersConfigState = {
  selectedCategory: "DISTRICT_MANDAL",
  searchQuery: "",
  statusFilter: "ALL",
  selectedMasterItem: null,
  isAddModalOpen: false,
  isEditModalOpen: false,
  isApproveModalOpen: false,
  isDeactivateModalOpen: false,
  isImportModalOpen: false,
  isAuditModalOpen: false,
};

export const mastersConfigSlice = createSlice({
  name: "mastersConfig",
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<MasterCategory>) => {
      state.selectedCategory = action.payload;
      state.selectedMasterItem = null;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setStatusFilter: (
      state,
      action: PayloadAction<"ALL" | "Active" | "Pending Approval" | "Inactive">
    ) => {
      state.statusFilter = action.payload;
    },
    setSelectedMasterItem: (state, action: PayloadAction<any | null>) => {
      state.selectedMasterItem = action.payload;
    },
    setAddModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isAddModalOpen = action.payload;
    },
    setEditModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isEditModalOpen = action.payload;
    },
    setApproveModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isApproveModalOpen = action.payload;
    },
    setDeactivateModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isDeactivateModalOpen = action.payload;
    },
    setImportModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isImportModalOpen = action.payload;
    },
    setAuditModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isAuditModalOpen = action.payload;
    },
    resetFilters: (state) => {
      state.searchQuery = "";
      state.statusFilter = "ALL";
    },
  },
});

export const {
  setSelectedCategory,
  setSearchQuery,
  setStatusFilter,
  setSelectedMasterItem,
  setAddModalOpen,
  setEditModalOpen,
  setApproveModalOpen,
  setDeactivateModalOpen,
  setImportModalOpen,
  setAuditModalOpen,
  resetFilters,
} = mastersConfigSlice.actions;

export default mastersConfigSlice.reducer;
