import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CheckboxSelector<T = any> {
  items: Record<string, T>; // Store selected items using a Record for quick lookup
}

// State with multiple selectors (each identified by an ID)
interface CheckboxSelectorState {
  selectors: Record<string, CheckboxSelector>;
}

const initialState: CheckboxSelectorState = { selectors: {} };

const checkboxSelectorSlice = createSlice({
  name: "checkbox_selector",
  initialState,
  reducers: {
    // Toggle an item: add if missing, remove if present
    toggleCheckboxSelectorItem: <T>(
      state: CheckboxSelectorState,
      action: PayloadAction<{ selectorId: string; itemId: string; item: T }>
    ) => {
      const { selectorId, itemId, item } = action.payload;

      if (!state.selectors[selectorId]) {
        state.selectors[selectorId] = { items: {} };
      }

      const items = state.selectors[selectorId].items;

      if (items[itemId]) {
        // Remove the item if it's already selected
        delete items[itemId];
      } else {
        // Add the item if it's not selected
        items[itemId] = item;
      }
    },

    // Clear all selected items for a given selector
    clearCheckboxSelector: (state, action: PayloadAction<string>) => {
      const selectorId = action.payload;
      if (state.selectors[selectorId]) {
        state.selectors[selectorId].items = {};
      }
    },
  },
});

export const {
  toggleCheckboxSelectorItem,
  clearCheckboxSelector,
} = checkboxSelectorSlice.actions;
export default checkboxSelectorSlice.reducer;
