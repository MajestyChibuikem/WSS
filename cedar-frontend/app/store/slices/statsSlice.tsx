import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface StatsState {
  calendarRange: { start_date: string; end_date: string };
}

const initialState: StatsState = {
  calendarRange: { start_date: "", end_date: "" },
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
