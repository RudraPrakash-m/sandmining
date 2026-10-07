import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  MasterCategory,
  MasterDistrictMandalItem,
  MasterRiverReachItem,
  MasterSandTypeItem,
  MasterStockyardItem,
  MasterVehicleCapacityItem,
  MasterTariffItem,
  MasterStatusCodeItem,
  MasterAlertThresholdItem,
  MasterDepartmentItem,
} from "../types";

export interface MasterApprovalPayload {
  id: string;
  category: MasterCategory;
  approverOfficerId: string;
  approvalRemarks: string;
  effectiveDate: string;
}

export interface MasterDeactivatePayload {
  id: string;
  category: MasterCategory;
  authorizedBy: string;
  effectiveDate: string;
  status: "Active" | "Inactive";
}

export interface MasterImportPayload {
  category: MasterCategory;
  authorizedBy: string;
  effectiveDate: string;
  fileFormat: string;
  records: any[];
}

export const mastersConfigApi = createApi({
  reducerPath: "mastersConfigApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/masters-config",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["MasterData"],
  endpoints: (builder) => ({
    getMastersByCategory: builder.query<any[], { category: MasterCategory }>({
      query: ({ category }) => `/category/${category}`,
      providesTags: ["MasterData"],
    }),
    createMasterItem: builder.mutation<any, { category: MasterCategory; data: any }>({
      query: (body) => ({
        url: "/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["MasterData"],
    }),
    updateMasterItem: builder.mutation<any, { category: MasterCategory; id: string; data: any }>({
      query: ({ id, category, data }) => ({
        url: `/${category}/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["MasterData"],
    }),
    approveMasterItem: builder.mutation<any, MasterApprovalPayload>({
      query: (body) => ({
        url: "/approve",
        method: "POST",
        body,
      }),
      invalidatesTags: ["MasterData"],
    }),
    toggleMasterStatus: builder.mutation<any, MasterDeactivatePayload>({
      query: (body) => ({
        url: "/toggle-status",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["MasterData"],
    }),
    importMasterData: builder.mutation<{ importedCount: number; success: boolean }, MasterImportPayload>({
      query: (body) => ({
        url: "/import",
        method: "POST",
        body,
      }),
      invalidatesTags: ["MasterData"],
    }),
  }),
});

export const {
  useGetMastersByCategoryQuery,
  useCreateMasterItemMutation,
  useUpdateMasterItemMutation,
  useApproveMasterItemMutation,
  useToggleMasterStatusMutation,
  useImportMasterDataMutation,
} = mastersConfigApi;
