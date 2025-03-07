import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Wine } from "@/app/utils/types";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "http://127.0.0.1:5000" }),
  endpoints: (builder) => ({
    getWines: builder.query<Wine[], void>({
      query: () => "/wines",
    }),
    getWineById: builder.query<Wine, number>({
      query: (id) => `/wines/${id}`,
    }),
    getCartItems: builder.query<{ items: Wine[] }, void>({
      query: () => "/cart",
    }),
    addToCart: builder.mutation<void, { wineId: number }>({
      query: ({ wineId }) => ({
        url: "/cart",
        method: "POST",
        body: { wineId },
      }),
    }),
    login: builder.mutation<
      { token: string },
      { username: string; password: string }
    >({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
  }),
});

export const {
  useGetWinesQuery,
  useGetWineByIdQuery,
  useGetCartItemsQuery,
  useAddToCartMutation,
  useLoginMutation,
} = apiSlice;
export default apiSlice;
