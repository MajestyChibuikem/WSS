import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { subMonths, subDays, startOfMonth, format } from "date-fns";

const today = new Date();

interface StatsState {
  calendarRange: {
    period1_start_date: string;
    period2_start_date: string;
    period1_end_date: string;
    period2_end_date: string;
  };
}

const initialState: StatsState = {
  calendarRange: {
    period1_start_date: format(subMonths(today, 1), "yyyy-MM-dd"), // 1 month befor today
    period1_end_date: format(today, "yyyy-MM-dd"), // Today
    period2_start_date: format(subMonths(today, 2), "yyyy-MM-dd"), // 2 months before today
    period2_end_date: format(subMonths(today, 3), "yyyy-MM-dd"), // 3 months before today
  },
};
const statsSlice = createSlice({
  name: "stats",
  initialState,
  reducers: {
    setStatsState: (state, action: PayloadAction<Partial<StatsState>>) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { setStatsState } = statsSlice.actions;
export default statsSlice.reducer;
