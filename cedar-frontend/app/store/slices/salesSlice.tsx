import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { isAfter, isBefore, parseISO } from "date-fns";

type SaleItem = {
  product_name: string;
  quantity: number;
  product_id: number;
  price: string;
};

export interface Sale {
  id: number;
  username: string;
  action: string;
  invoiceId: number | null;
  date: string;
  total: string;
  items: SaleItem[];
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
          items: sale.invoice?.items ? sale.invoice.items : [],
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
          priceRange,
        } = state.filters;

        // 🛑 Check if sale data is valid
        // if (!sale) return false;

        // ✅ Username filter (case-insensitive)
        if (
          username &&
          sale.username &&
          !sale.username.toLowerCase().includes(username.toLowerCase())
        ) {
          return false;
        }

        // ✅ Date range filter (avoid parsing null)
        if (dateRange?.start && dateRange?.end) {
          const saleDate = parseISO(sale.date);
          const startDate = parseISO(dateRange.start);
          const endDate = parseISO(dateRange.end);

          if (isBefore(saleDate, startDate) || isAfter(saleDate, endDate)) {
            return false;
          }
        }

        // ✅ Price range filter (ensure valid numbers)
        if (priceRange) {
          const totalAmount = parseFloat(sale.total);
          if (isNaN(totalAmount)) return false;

          if (totalAmount < priceRange.min || totalAmount > priceRange.max) {
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
