import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Vehicle, RegisterVehicleFormData, VehicleStatus } from "../types";

export const vehicleApi = createApi({
  reducerPath: "vehicleApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Vehicle"],
  endpoints: (builder) => ({
    getVehicles: builder.query<Vehicle[], void>({
      query: () => "/vehicles",
      providesTags: ["Vehicle"],
    }),
    getVehicleById: builder.query<Vehicle, string>({
      query: (id) => `/vehicles/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Vehicle", id }],
    }),
    registerVehicle: builder.mutation<Vehicle, RegisterVehicleFormData>({
      query: (body) => ({
        url: "/vehicles",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Vehicle"],
    }),
    updateVehicleStatus: builder.mutation<
      Vehicle,
      { id: string; status: VehicleStatus; isBlacklisted?: boolean; blacklistReason?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/vehicles/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Vehicle"],
    }),
    assignGpsDevice: builder.mutation<
      Vehicle,
      { id: string; gpsDeviceId: string; gpsProvider?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/vehicles/${id}/gps`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Vehicle"],
    }),
  }),
});

export const {
  useGetVehiclesQuery,
  useGetVehicleByIdQuery,
  useRegisterVehicleMutation,
  useUpdateVehicleStatusMutation,
  useAssignGpsDeviceMutation,
} = vehicleApi;
