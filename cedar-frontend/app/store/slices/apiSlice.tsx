import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { User, Wine } from "@/app/utils/types";

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
    getRevenue: builder.query<
      { revenue: number },
      { start_date: string; end_date: string }
    >({
      query: ({ start_date, end_date }) => ({
        url: "/revenue",
        method: "GET",
        body: { start_date, end_date },
      }),
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

    // Delete Wine
    deleteWine: builder.mutation<{ message: string }, { wine_id: number }>({
      query: ({ wine_id }) => ({
        url: `/wine/${wine_id}`,
        method: "PUT",
      }),
    }),

    // Compare sales between two time periods
    compareSales: builder.query<
      { message: string },
      { start_date: string; end_date: string }
    >({
      query: ({ start_date, end_date }) => ({
        url: "/compare-sales",
        method: "GET",
        body: { start_date, end_date },
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
} = apiSlice;

export default apiSlice;
