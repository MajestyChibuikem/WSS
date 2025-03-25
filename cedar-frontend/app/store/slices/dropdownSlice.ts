import { DropdownItem } from "@/app/utils/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Dropdown<T> {
  show: boolean;
  active: DropdownItem<T> | null;
  items: Array<DropdownItem<T>> | null;
}

export interface DropdownState<T> {
  dropdowns: Record<string, Dropdown<T>>;
}

const createInitialState = <T>(): DropdownState<T> => ({
  dropdowns: {},
});

const dropdownSlice = createSlice({
  name: "dropdown",
  initialState: createInitialState<unknown>(),
  reducers: {
    // Toggle visibility of dropdown by ID, closing all other dropdowns
    toggleDropdown: <T>(
      state: DropdownState<T>,
      action: PayloadAction<string>
    ) => {
      const id = action.payload;

      // Close all other dropdowns
      Object.keys(state.dropdowns).forEach((key) => {
        if (key !== id) {
          state.dropdowns[key].show = false;
        }
      });

      // Toggle the selected dropdown
      state.dropdowns[id] = {
        show: !state.dropdowns[id]?.show,
        items: state.dropdowns[id]?.items ?? null,
        active: state.dropdowns[id]?.active ?? null,
      };
    },

    // Update dropdown item
    updateToggleItem: <T>(
      state: DropdownState<T>,
      action: PayloadAction<{ id: string; item: DropdownItem<T> }>
    ) => {
      const { id, item } = action.payload;
      if (!state.dropdowns[id]) {
        state.dropdowns[id] = { show: false, items: null, active: null };
      }

      state.dropdowns[id].items?.forEach((currentItem) => {
        currentItem == item
          ? (currentItem.active = true)
          : (currentItem.active = false);
      });
    },
  },
});

export const { toggleDropdown, updateToggleItem } = dropdownSlice.actions;
export default dropdownSlice.reducer;
