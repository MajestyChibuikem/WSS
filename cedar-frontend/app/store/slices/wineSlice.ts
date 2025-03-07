import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface WineState {
  show_wine_editor: boolean;
}

const initialState: WineState = { show_wine_editor: false };

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
  },
});

export const { toggleWineEditor, closeWineEditor } = wineSlice.actions;
export default wineSlice.reducer;
