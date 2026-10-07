import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ExcavationRecord, AddExcavationFormData, ExcavationStatus } from "../types";

export const excavationApi = createApi({
  reducerPath: "excavationApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Excavation"],
  endpoints: (builder) => ({
    getExcavationList: builder.query<ExcavationRecord[], void>({
      query: () => "/excavations",
      providesTags: ["Excavation"],
    }),
    getExcavationById: builder.query<ExcavationRecord, string>({
      query: (id) => `/excavations/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Excavation", id }],
    }),
    createExcavation: builder.mutation<ExcavationRecord, AddExcavationFormData>({
      query: (body) => ({
        url: "/excavations",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Excavation"],
    }),
    updateExcavationStatus: builder.mutation<
      ExcavationRecord,
      { id: string; status: ExcavationStatus; remarks?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/excavations/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Excavation"],
    }),
    uploadPhotoEvidence: builder.mutation<
      { photoUrl: string; timestamp: string; location: string },
      FormData
    >({
      query: (formData) => ({
        url: "/excavations/upload-evidence",
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const {
  useGetExcavationListQuery,
  useGetExcavationByIdQuery,
  useCreateExcavationMutation,
  useUpdateExcavationStatusMutation,
  useUploadPhotoEvidenceMutation,
} = excavationApi;
