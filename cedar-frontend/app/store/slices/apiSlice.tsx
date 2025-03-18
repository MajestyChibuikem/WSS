import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { User, Wine } from "@/app/utils/types";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://127.0.0.1:5000",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("wineryAuthToken");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // Login
    login: builder.mutation<
      { token: string; roles: string[]; is_admin: boolean },
      { username: string; password: string }
    >({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),

    // Create User
    createUser: builder.mutation<
      { message: string; user_id: number; roles: string[] },
      { username: string; password: string; is_admin: boolean; roles: string[] }
    >({
      query: (body) => ({
        url: "/auth/create_user",
        method: "POST",
        body,
      }),
    }),

    // Logout
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),

    // Get All Users (Admin Only)
    getUsers: builder.query<
      {
        users: User[];
      },
      void
    >({
      query: () => "/auth/users",
    }),

    // Get User by ID (Admin Only)
    getUserById: builder.query<
      {
        user: {
          id: number;
          username: string;
          created_at: string;
          is_admin: boolean;
          roles: string[];
        };
      },
      number
    >({
      query: (user_id) => `/auth/user/${user_id}`,
    }),

    updateUser: builder.mutation<
      {
        message: string;
        user: {
          id: number;
          username: string;
          is_admin: boolean;
          roles: string | string[];
        };
      },
      {
        userId: number;
        username?: string;
        password?: string;
        is_admin?: boolean;
        roles?: string | string[];
      }
    >({
      query: ({ userId, ...updateData }) => ({
        url: `/users/${userId}`,
        method: "PUT",
        body: updateData,
      }),
      transformResponse: (response: any) => response, // Optional: Modify response if needed
      transformErrorResponse: (error: any) => error.data, // Optional: Extract meaningful error data
    }),

    // Update User Roles (Admin Only)
    updateUserRoles: builder.mutation<
      { message: string; roles: string[] },
      { user_id: number; roles: string[] }
    >({
      query: ({ user_id, roles }) => ({
        url: `/auth/user/${user_id}/roles`,
        method: "PUT",
        body: { roles },
      }),
    }),

    // Delete User (Admin Only)
    deleteUser: builder.mutation<{ message: string }, number>({
      query: (user_id) => ({
        url: `/auth/user/${user_id}`,
        method: "DELETE",
      }),
    }),

    // Fetch all wines
    getWines: builder.query<{ wines: [] }, void>({
      query: () => "/wine/all",
    }),

    // Add Wine
    addWine: builder.mutation<
      { message: string; wine: Wine },
      {
        name: string;
        abv: number;
        price: number;
        category: string;
        bottle_size: number;
        in_stock?: number;
      }
    >({
      query: (body) => ({
        url: "/wine/add",
        method: "POST",
        body,
      }),
    }),

    // Update Wine
    updateWine: builder.mutation<
      { message: string; wine: Wine },
      {
        wine_id: number;
        name?: string;
        abv?: number;
        price?: number;
        category?: string;
        bottle_size?: number;
        in_stock?: number;
      }
    >({
      query: ({ wine_id, ...body }) => ({
        url: `/wine/${wine_id}`,
        method: "PUT",
        body,
      }),
    }),

    checkToken: builder.query<
      { message: string; expires_at: string | null },
      void
    >({
      query: () => ({
        url: "/auth/check-token",
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("wineryAuthToken")}`,
        },
      }),
      transformResponse: (response: {
        message: string;
        expires_at: string;
      }) => ({
        message: response?.message || "Invalid token",
        expires_at: response?.expires_at || null,
      }),
      transformErrorResponse: (response) => ({
        message: "Invalid token",
        expires_at: null,
      }),
    }),

    // Delete Wine
    deleteWine: builder.mutation<{ message: string }, { wine_id: number }>({
      query: ({ wine_id }) => ({
        url: `/wine/${wine_id}`,
        method: "DELETE",
      }),
    }),

    // Get Inventory Value
    getInventoryValue: builder.query<{ [category: string]: number }, void>({
      query: () => "/wine/inventory-value",
      transformErrorResponse: (response) => ({
        message: "Error while fetching inventory value",
      }),
    }),

    // Get User Sales by ID
    getUserSales: builder.query<
      { user_id: number; total_sales: number },
      number
    >({
      query: (userId) => `/wine/user-sales/${userId}`,
      transformErrorResponse: (response) => ({
        message:
          response.status === 404
            ? "User not found"
            : "Error fetching user sales",
      }),
    }),

    // Compare Sales Between Two Periods
    compareSales: builder.query<
      { percentage_change: number },
      {
        period1_start: string;
        period1_end: string;
        period2_start: string;
        period2_end: string;
      }
    >({
      query: ({ period1_start, period1_end, period2_start, period2_end }) => ({
        url: `/wine/compare-sales?period1_start=${period1_start}&period1_end=${period1_end}&period2_start=${period2_start}&period2_end=${period2_end}`,
        method: "GET",
      }),
      transformErrorResponse: () => ({
        message: "Error fetching sales comparison data",
      }),
    }),

    // Get Revenue for a Given Date Range
    getRevenue: builder.query<any, { start_date: string; end_date: string }>({
      query: ({ start_date, end_date }) => ({
        url: `/wine/revenue?start_date=${start_date}&end_date=${end_date}`,
        method: "GET",
      }),
      transformErrorResponse: () => ({
        message: "Error fetching revenue data",
      }),
    }),

    // Get Stock by Category
    getStockByCategory: builder.query<
      { stock_by_category: Record<string, number> },
      void
    >({
      query: () => "/wine/stock-by-category",
      transformErrorResponse: (response) => ({
        message: "Error fetching stock by category",
      }),
    }),

    // Get Total Wine Stock
    getTotalWineStock: builder.query<{ total_stock: number }, void>({
      query: () => "/wine/total_stock",
      transformErrorResponse: (response) => ({
        message: "Error fetching total stock",
      }),
    }),

    getAllLogs: builder.query({
      query: () => "/logs/logs",
    }),

    getUserLogs: builder.query({
      query: (userId) => `logs/user/${userId}`,
    }),

    getLogsByAction: builder.query({
      query: (action) => `logs/action/${action}`,
    }),

    checkout: builder.mutation<
      { message: string; invoice_id: number },
      {
        items: { item: { id: number }; number_sold: number }[];
        total_amount: number;
      }
    >({
      query: (body) => ({
        url: "/checkout",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useCreateUserMutation,
  useLogoutMutation,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserRolesMutation,
  useDeleteUserMutation,
  useGetWinesQuery,
  useGetTotalWineStockQuery,
  useGetStockByCategoryQuery,
  useGetRevenueQuery,
  useCompareSalesQuery,
  useAddWineMutation,
  useUpdateWineMutation,
  useDeleteWineMutation,
  useCheckTokenQuery,
  useGetUserSalesQuery,
  useGetInventoryValueQuery,
  useUpdateUserMutation,
  useGetAllLogsQuery,
  useCheckoutMutation,
} = apiSlice;

export default apiSlice;
