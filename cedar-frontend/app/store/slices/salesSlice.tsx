import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { isAfter, isBefore, parseISO } from "date-fns";

export interface Sale {
  id: number;
  username: string;
  action: string;
  invoiceId: number | null;
  date: string;
  total: string;
  items: string[];
  message: string;
  ipAddress: string;
}

interface FilterState {
  dateRange: { start: string; end: string };
  username: string;
  item: string;
  actions: string[];
  categories: string[];
  priceRange: { min: number; max: number };
}

interface SalesState {
  sales: Sale[];
  filteredSales: Sale[];
  filters: Partial<FilterState>;
}

const initialState: SalesState = {
  sales: [],
  filteredSales: [],
  filters: {
    priceRange: { min: 0, max: Number.POSITIVE_INFINITY },
  },
};

// Slice definition
const salesSlice = createSlice({
  name: "sales",
  initialState,
  reducers: {
    setSales: (state, action) => {
      state.sales = action.payload.map(
        (sale: {
          id: string;
          acting_username: string;
          action: string;
          invoice: {
            id: string;
            date: string;
            total_amount: any;
            total: any;
            items: any[];
          };
          timestamp: string;
          message: string;
          ip_address: string;
        }) => ({
          id: sale.id,
          username: sale.acting_username || "N/A",
          action: sale.action,
          invoiceId: sale.invoice?.id || null,
          date: sale.invoice?.date || sale.timestamp,
          total: sale.invoice?.total_amount
            ? sale.invoice?.total_amount
            : sale.invoice?.total
            ? sale.invoice?.total
            : "0.00",
          items: sale.invoice?.items
            ? sale.invoice.items.map(
                (item) => `${item.wine_name} (${item.quantity})`
              )
            : [],
          message: sale.message,
          ipAddress: sale.ip_address,
        })
      );

      state.filteredSales = state.sales;
    },

    setSalesFilters: (state, action: PayloadAction<Partial<FilterState>>) => {
      state.filters = { ...state.filters, ...action.payload };
      // Automatically apply filters when updating filters
      salesSlice.caseReducers.applyFilters(state);
    },

    applyFilters: (state) => {
      state.filteredSales = state.sales.filter((sale) => {
        const {
          dateRange,
          username,
          item,
          actions,
          categories,
        } = state.filters;

        // Username filter (case-insensitive)
        if (
          username &&
          !sale.username.toLowerCase().includes(username.toLowerCase())
        ) {
          return false;
        }

        // Date range filter
        if (dateRange) {
          const saleDate = parseISO(sale.date);
          const startDate = parseISO(dateRange.start);
          const endDate = parseISO(dateRange.end);

          if (isBefore(saleDate, startDate) || isAfter(saleDate, endDate)) {
            return false;
          }
        }

        // Price range filter
        if (state.filters.priceRange) {
          const totalAmount = parseFloat(sale.total);
          if (
            totalAmount < state.filters.priceRange.min ||
            totalAmount > state.filters.priceRange.max
          ) {
            return false;
          }
        }

        return true;
      });
    },

    clearFilters: (state) => {
      state.filters = {};
      state.filteredSales = state.sales;
    },
  },
});

export const {
  setSales,
  setSalesFilters,
  applyFilters,
  clearFilters,
} = salesSlice.actions;
export default salesSlice.reducer;
