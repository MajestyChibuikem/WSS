import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Wine } from "@/app/utils/types";

// Base query with authorization setup
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://127.0.0.1:5000",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("authToken");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // Login
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

    // 🔹 NEW: Get all wines
    getWines: builder.query<Wine[], void>({
      query: () => "/wine",
    }),

    // Fetch total wine stock
    getTotalWineStock: builder.query<{ total_stock: number }, void>({
      query: () => "/wine/total_stock",
    }),

    // Fetch stock by category
    getStockByCategory: builder.query<
      { stock_by_category: Record<string, number> },
      void
    >({
      query: () => "/wine/stock_by_category",
    }),

    // Get revenue within a specified time period
    getRevenue: builder.mutation<
      { revenue: number },
      { start_date: string; end_date: string }
    >({
      query: (body) => ({
        url: "/revenue",
        method: "POST",
        body,
      }),
    }),

    // Compare sales between two time periods
    compareSales: builder.mutation<
      { message: string },
      { start_date: string; end_date: string }
    >({
      query: (body) => ({
        url: "/compare-sales",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useGetWinesQuery, // 🔹 Added this
  useGetTotalWineStockQuery,
  useGetStockByCategoryQuery,
  useGetRevenueMutation,
  useCompareSalesMutation,
} = apiSlice;

export default apiSlice;
