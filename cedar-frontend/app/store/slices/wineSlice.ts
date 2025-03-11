import { Actions, DropdownItem, Wine } from "@/app/utils/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface WineState {
  show_wine_editor: boolean;
  currentlyEditing: Wine | null;
  currentWineCategory?: DropdownItem<Actions>;
  action_type: Actions | null;
}

const initialState: WineState = {
  show_wine_editor: false,
  currentlyEditing: null,
  action_type: null,
};

const wineSlice = createSlice({
  name: "winer",
  initialState,
  reducers: {
    toggleWineEditor: (state) => {
      state.show_wine_editor = !state.show_wine_editor;
    },
    closeWineEditor: (state) => {
      state.show_wine_editor = false;
    },
    setCurrentWineCategory: (
      state: WineState,
      action: PayloadAction<DropdownItem<Actions>>
    ) => {
      state.currentWineCategory = action.payload;
    },
    setCurrentlyEditing: (
      state: WineState,
      action: PayloadAction<Partial<Wine>>
    ) => {
      if (!state.currentlyEditing) {
        state.currentlyEditing = {} as Wine; // Initialize if null
      }
      state.currentlyEditing = { ...state.currentlyEditing, ...action.payload };
    },
    updateAction: (state: WineState, action: PayloadAction<Actions>) => {
      state.action_type = action.payload;
    },
    clearCurrentlyEditing: (state) => {
      state.currentlyEditing = null;
    },
  },
});

export const {
  toggleWineEditor,
  closeWineEditor,
  setCurrentlyEditing,
  updateAction,
  clearCurrentlyEditing,
  setCurrentWineCategory,
} = wineSlice.actions;
export default wineSlice.reducer;
