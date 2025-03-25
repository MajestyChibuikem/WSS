import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { parseISO, isAfter, isBefore } from "date-fns";

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
  dateRange?: { start: string; end: string };
  username?: string;
  item?: string;
  actions?: string[];
  categories?: string[]; // New filter field
}

interface SalesState {
  sales: Sale[];
  filteredSales: Sale[];
  filters: Partial<FilterState>;
}

const initialState: SalesState = {
  sales: [],
  filteredSales: [],
  filters: {},
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
          invoice: { id: string; date: string; total: any; items: any[] };
          timestamp: string;
          message: string;
          ip_address: string;
        }) => ({
          id: sale.id,
          username: sale.acting_username || "N/A",
          action: sale.action,
          invoiceId: sale.invoice?.id || null,
          date: sale.invoice?.date || sale.timestamp,
          total: sale.invoice?.total || "0.00",
          items: sale.invoice?.items
            ? sale.invoice.items.map(
                (item) => `${item.wine_name} (${item.quantity})`
              )
            : [],
          message: sale.message,
          ipAddress: sale.ip_address,
        })
      );
    },

    setFilters: (state, action: PayloadAction<Partial<FilterState>>) => {
      state.filters = { ...state.filters, ...action.payload };
      // Automatically apply filters when updating filters
      salesSlice.caseReducers.applyFilters(state);
    },

    applyFilters: (state) => {},

    clearFilters: (state) => {
      state.filters = {};
      state.filteredSales = state.sales;
    },
  },
});

export const {
  setSales,
  setFilters,
  applyFilters,
  clearFilters,
} = salesSlice.actions;
export default salesSlice.reducer;
