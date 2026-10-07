import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { MiningReachStatus, MiningReach } from "../types";

interface MiningReachState {
  selectedDistrict: string;
  selectedStatus: MiningReachStatus | "ALL";
  searchQuery: string;
  selectedReach: MiningReach | null;
  isMapModalOpen: boolean;
  isDocModalOpen: boolean;
  isConfirmModalOpen: boolean;
  pendingStatusAction: MiningReachStatus | null;
}

const initialState: MiningReachState = {
  selectedDistrict: "ALL",
  selectedStatus: "ALL",
  searchQuery: "",
  selectedReach: null,
  isMapModalOpen: false,
  isDocModalOpen: false,
  isConfirmModalOpen: false,
  pendingStatusAction: null,
};

export const miningReachSlice = createSlice({
  name: "miningReach",
  initialState,
  reducers: {
    setFilterDistrict: (state, action: PayloadAction<string>) => {
      state.selectedDistrict = action.payload;
    },
    setFilterStatus: (state, action: PayloadAction<MiningReachStatus | "ALL">) => {
      state.selectedStatus = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedReach: (state, action: PayloadAction<MiningReach | null>) => {
      state.selectedReach = action.payload;
    },
    openMapModal: (state, action: PayloadAction<MiningReach>) => {
      state.selectedReach = action.payload;
      state.isMapModalOpen = true;
    },
    closeMapModal: (state) => {
      state.isMapModalOpen = false;
    },
    openDocModal: (state, action: PayloadAction<MiningReach>) => {
      state.selectedReach = action.payload;
      state.isDocModalOpen = true;
    },
    closeDocModal: (state) => {
      state.isDocModalOpen = false;
    },
    openConfirmStatusModal: (
      state,
      action: PayloadAction<{ reach: MiningReach; newStatus: MiningReachStatus }>
    ) => {
      state.selectedReach = action.payload.reach;
      state.pendingStatusAction = action.payload.newStatus;
      state.isConfirmModalOpen = true;
    },
    closeConfirmStatusModal: (state) => {
      state.isConfirmModalOpen = false;
      state.pendingStatusAction = null;
    },
    resetMiningReachFilters: (state) => {
      state.selectedDistrict = "ALL";
      state.selectedStatus = "ALL";
      state.searchQuery = "";
    },
  },
});

export const {
  setFilterDistrict,
  setFilterStatus,
  setSearchQuery,
  setSelectedReach,
  openMapModal,
  closeMapModal,
  openDocModal,
  closeDocModal,
  openConfirmStatusModal,
  closeConfirmStatusModal,
  resetMiningReachFilters,
} = miningReachSlice.actions;

export const selectMiningReachState = (state: { miningReach: MiningReachState }) =>
  state.miningReach;

export default miningReachSlice.reducer;
