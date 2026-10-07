import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  SystemUser,
  CreateUserPayload,
  AssignRolePayload,
  ResetPasswordPayload,
} from "../types";

export const userRoleApi = createApi({
  reducerPath: "userRoleApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/users-roles",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["SystemUser"],
  endpoints: (builder) => ({
    getUsers: builder.query<SystemUser[], void>({
      query: () => "/list",
      providesTags: ["SystemUser"],
    }),
    getUserById: builder.query<SystemUser, string>({
      query: (id) => `/${id}`,
      providesTags: (_res, _err, id) => [{ type: "SystemUser", id }],
    }),
    createUser: builder.mutation<SystemUser, CreateUserPayload>({
      query: (body) => ({
        url: "/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["SystemUser"],
    }),
    assignRole: builder.mutation<SystemUser, AssignRolePayload>({
      query: (body) => ({
        url: "/assign-role",
        method: "POST",
        body,
      }),
      invalidatesTags: ["SystemUser"],
    }),
    resetPassword: builder.mutation<{ tempToken: string; success: boolean }, ResetPasswordPayload>({
      query: (body) => ({
        url: "/reset-password",
        method: "POST",
        body,
      }),
      invalidatesTags: ["SystemUser"],
    }),
    toggleStatus: builder.mutation<SystemUser, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["SystemUser"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useAssignRoleMutation,
  useResetPasswordMutation,
  useToggleStatusMutation,
} = userRoleApi;
