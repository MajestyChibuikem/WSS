import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { format } from "date-fns";

export interface Activity {
  id: number;
  acting_username: string;
  action: string;
  timestamp: string;
  user_id?: number | null;
  user_agent?: string | null;
  message: string;
  affected_name: string;
}

interface FilterState {
  dateRange?: { start: string; end: string };
  username?: string;
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

// Helper function to format timestamp
const formatTimestamp = (timestamp: string) => {
  return format(new Date(timestamp), "dd/MM/yy");
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
          timestamp: formatTimestamp(activity.timestamp),
        }));

      state.filteredActivities = state.activities;
    },

    // Only updates the filter criteria
    setFilters: (state, action: PayloadAction<Partial<FilterState>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Applies the stored filter criteria to the activities list
    applyFilters: (state) => {
      state.filteredActivities = state.activities.filter((activity) => {
        const { dateRange, username, actions } = state.filters;

        // Date Range Filter
        if (dateRange?.start && dateRange?.end) {
          const activityDate = new Date(activity.timestamp);
          const startDate = new Date(dateRange.start);
          const endDate = new Date(dateRange.end);
          if (activityDate < startDate || activityDate > endDate) {
            return false;
          }
        }

        // Username Filter (Assuming `user_id` can be mapped to a username)
        if (username) {
          if (!activity.user_id || activity.user_id.toString() !== username) {
            return false;
          }
        }

        // Actions Filter
        if (actions && actions.length > 0) {
          if (!actions.includes(activity.action)) {
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
