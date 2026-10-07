import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { SystemUser, UserFilters, UserStatus } from "../types";

interface UserRoleState {
  users: SystemUser[];
  selectedUser: SystemUser | null;
  filters: UserFilters;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserRoleState = {
  users: [],
  selectedUser: null,
  filters: {
    search: "",
    role: "All",
    department: "All",
    district: "All",
    status: "All",
  },
  isLoading: false,
  error: null,
};

export const userRoleSlice = createSlice({
  name: "userRole",
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<SystemUser[]>) => {
      state.users = action.payload;
    },
    setSelectedUser: (state, action: PayloadAction<SystemUser | null>) => {
      state.selectedUser = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<UserFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    updateUserStatusInSlice: (
      state,
      action: PayloadAction<{ id: string; status: UserStatus }>
    ) => {
      const idx = state.users.findIndex((u) => u.id === action.payload.id);
      if (idx !== -1) {
        state.users[idx].status = action.payload.status;
      }
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
  },
});

export const {
  setUsers,
  setSelectedUser,
  setFilters,
  updateUserStatusInSlice,
  clearSelectedUser,
} = userRoleSlice.actions;

export default userRoleSlice.reducer;
