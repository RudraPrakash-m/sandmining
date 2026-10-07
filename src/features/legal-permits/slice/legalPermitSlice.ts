import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { MiningPermit, PermitStatus, InspectionStatus } from "../types";

interface LegalPermitState {
  selectedPermit: MiningPermit | null;
  filterStatus: PermitStatus | "ALL";
  filterInspectionStatus: InspectionStatus | "ALL";
  searchQuery: string;
  isDetailModalOpen: boolean;
  isRenewModalOpen: boolean;
  isVerifyModalOpen: boolean;
  isSuspendModalOpen: boolean;
}

const initialState: LegalPermitState = {
  selectedPermit: null,
  filterStatus: "ALL",
  filterInspectionStatus: "ALL",
  searchQuery: "",
  isDetailModalOpen: false,
  isRenewModalOpen: false,
  isVerifyModalOpen: false,
  isSuspendModalOpen: false,
};

export const legalPermitSlice = createSlice({
  name: "legalPermit",
  initialState,
  reducers: {
    setSelectedPermit: (state, action: PayloadAction<MiningPermit | null>) => {
      state.selectedPermit = action.payload;
    },
    setFilterStatus: (state, action: PayloadAction<PermitStatus | "ALL">) => {
      state.filterStatus = action.payload;
    },
    setFilterInspectionStatus: (
      state,
      action: PayloadAction<InspectionStatus | "ALL">
    ) => {
      state.filterInspectionStatus = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    openDetailModal: (state, action: PayloadAction<MiningPermit>) => {
      state.selectedPermit = action.payload;
      state.isDetailModalOpen = true;
    },
    closeDetailModal: (state) => {
      state.isDetailModalOpen = false;
    },
    openRenewModal: (state, action: PayloadAction<MiningPermit>) => {
      state.selectedPermit = action.payload;
      state.isRenewModalOpen = true;
    },
    closeRenewModal: (state) => {
      state.isRenewModalOpen = false;
    },
    openVerifyModal: (state, action: PayloadAction<MiningPermit>) => {
      state.selectedPermit = action.payload;
      state.isVerifyModalOpen = true;
    },
    closeVerifyModal: (state) => {
      state.isVerifyModalOpen = false;
    },
    openSuspendModal: (state, action: PayloadAction<MiningPermit>) => {
      state.selectedPermit = action.payload;
      state.isSuspendModalOpen = true;
    },
    closeSuspendModal: (state) => {
      state.isSuspendModalOpen = false;
    },
    resetPermitFilters: (state) => {
      state.filterStatus = "ALL";
      state.filterInspectionStatus = "ALL";
      state.searchQuery = "";
    },
  },
});

export const {
  setSelectedPermit,
  setFilterStatus,
  setFilterInspectionStatus,
  setSearchQuery,
  openDetailModal,
  closeDetailModal,
  openRenewModal,
  closeRenewModal,
  openVerifyModal,
  closeVerifyModal,
  openSuspendModal,
  closeSuspendModal,
  resetPermitFilters,
} = legalPermitSlice.actions;

export const selectLegalPermitState = (state: { legalPermit: LegalPermitState }) =>
  state.legalPermit;

export default legalPermitSlice.reducer;
