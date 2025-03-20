import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { format, parseISO, isAfter, isBefore } from "date-fns";

export interface Activity {
  id: number;
  acting_username: string;
  action: string;
  timestamp: string; // ISO format string
  user_id?: number | null;
  user_agent?: string | null;
  message: string;
  affected_name: string;
}

interface FilterState {
  dateRange?: { start: string; end: string };
  username?: string;
  item?: string;
  actions?: string[];
}

interface ActivityState {
  activities: Activity[];
  filteredActivities: Activity[];
  filters: Partial<FilterState>;
}

const initialState: ActivityState = {
  activities: [],
  filteredActivities: [],
  filters: {},
};

// Helper function to format action names
const formatActionName = (action: string) => {
  return action.replace(/_SUCCESS$/, "").replace(/_/g, " ");
};

// Slice definition
const activitySlice = createSlice({
  name: "activity",
  initialState,
  reducers: {
    setActivities: (state, action: PayloadAction<Activity[]>) => {
      state.activities = action.payload
        .filter((activity) =>
          [
            "UPDATE_USER_SUCCESS",
            "DELETE_USER_SUCCESS",
            "CREATE_USER_SUCCESS",
            "ADD_WINE_SUCCESS",
            "UPDATE_WINE_SUCCESS",
            "DELETE_WINE_SUCCESS",
          ].includes(activity.action)
        )
        .map((activity) => ({
          ...activity,
          action: formatActionName(activity.action),
          timestamp: activity.timestamp, // Store timestamp as is
        }));

      state.filteredActivities = state.activities;
    },

    setFilters: (state, action: PayloadAction<Partial<FilterState>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    applyFilters: (state) => {
      state.filteredActivities = state.activities.filter((activity) => {
        const { dateRange, username, actions } = state.filters;
        console.log("dateRange: ", dateRange);

        // Convert timestamp to Date object for filtering
        const activityDate = parseISO(activity.timestamp);

        // Date Range Filter
        if (dateRange?.start && dateRange?.end) {
          const startDate = parseISO(dateRange.start);
          const endDate = parseISO(dateRange.end);

          if (
            isBefore(activityDate, startDate) ||
            isAfter(activityDate, endDate)
          ) {
            return false;
          }
        }

        // Username Filter
        if (username) {
          if (
            !activity.user_id ||
            activity.user_id.toString() !== username.toString()
          ) {
            return false;
          }
        }

        // Actions Filter (Case Insensitive)
        if (actions && actions.length > 0) {
          if (
            !actions.some(
              (action) => action.toLowerCase() === activity.action.toLowerCase()
            )
          ) {
            return false;
          }
        }

        return true;
      });
    },

    clearFilters: (state) => {
      state.filters = {};
      state.filteredActivities = state.activities;
    },
  },
});

export const {
  setActivities,
  setFilters,
  applyFilters,
  clearFilters,
} = activitySlice.actions;
export default activitySlice.reducer;
