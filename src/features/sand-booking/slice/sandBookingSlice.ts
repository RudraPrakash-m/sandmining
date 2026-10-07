import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { SandBooking, SandBookingFilters } from "../types";

interface SandBookingState {
  bookings: SandBooking[];
  selectedBooking: SandBooking | null;
  filters: SandBookingFilters;
  isLoading: boolean;
  error: string | null;
}

const initialState: SandBookingState = {
  bookings: [],
  selectedBooking: null,
  filters: {
    search: "",
    sandType: "All",
    paymentStatus: "All",
    bookingStatus: "All",
  },
  isLoading: false,
  error: null,
};

export const sandBookingSlice = createSlice({
  name: "sandBooking",
  initialState,
  reducers: {
    setBookings: (state, action: PayloadAction<SandBooking[]>) => {
      state.bookings = action.payload;
    },
    setSelectedBooking: (state, action: PayloadAction<SandBooking | null>) => {
      state.selectedBooking = action.payload;
    },
    setBookingFilters: (state, action: PayloadAction<Partial<SandBookingFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearSelectedBooking: (state) => {
      state.selectedBooking = null;
    },
  },
});

export const {
  setBookings,
  setSelectedBooking,
  setBookingFilters,
  clearSelectedBooking,
} = sandBookingSlice.actions;

export default sandBookingSlice.reducer;
