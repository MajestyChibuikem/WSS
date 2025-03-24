import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { subDays, format, subMonths } from "date-fns";

const today = new Date();

interface StatsState {
  calendarRanges: Record<
    string,
    {
      period1_start_date: string;
      period1_end_date: string;
      period2_start_date: string; // Optional for "activity_date_range"
      period2_end_date: string; // Optional for "activity_date_range"
    }
  >;
}

const initialState: StatsState = {
  calendarRanges: {
    activity_date_range: {
      period1_start_date: format(subDays(today, 12), "yyyy-MM-dd"),
      period1_end_date: format(today, "yyyy-MM-dd"),
      period2_start_date: format(subDays(today, 60), "yyyy-MM-dd"),
      period2_end_date: format(subDays(today, 30), "yyyy-MM-dd"),
    },
    dashboard_date_range: {
      period1_start_date: format(subMonths(new Date(), 2), "yyyy-MM-dd"),
      period1_end_date: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
      period2_start_date: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
      period2_end_date: format(new Date(), "yyyy-MM-dd"),
    },
  },
};

const statsSlice = createSlice({
  name: "stats",
  initialState,
  reducers: {
    setStatsState: (
      state,
      action: PayloadAction<{
        key: string;
        data: Partial<StatsState["calendarRanges"][string]>;
      }>
    ) => {
      const { key, data } = action.payload;
      state.calendarRanges[key] = {
        ...state.calendarRanges[key],
        ...data,
      };
    },
  },
});

export const { setStatsState } = statsSlice.actions;
export default statsSlice.reducer;
