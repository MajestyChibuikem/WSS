import { Actions, DropdownItem, Product } from "@/app/utils/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ProductState {
  show_product_editor: boolean;
  currentlyEditing: Product | null;
  currentProductCategory?: DropdownItem<Actions>;
  action_type: Actions | null;
}

const initialState: ProductState = {
  show_product_editor: false,
  currentlyEditing: null,
  action_type: null,
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    toggleProductEditor: (state) => {
      state.show_product_editor = !state.show_product_editor;
    },
    closeProductEditor: (state) => {
      state.show_product_editor = false;
    },
    setCurrentProductCategory: (
      state: ProductState,
      action: PayloadAction<DropdownItem<Actions>>
    ) => {
      state.currentProductCategory = action.payload;
    },
    setCurrentlyEditing: (
      state: ProductState,
      action: PayloadAction<Partial<Product>>
    ) => {
      if (!state.currentlyEditing) {
        state.currentlyEditing = {} as Product; // Initialize if null
      }
      state.currentlyEditing = { ...state.currentlyEditing, ...action.payload };
    },
    updateAction: (state: ProductState, action: PayloadAction<Actions>) => {
      state.action_type = action.payload;
    },
    clearCurrentlyEditing: (state) => {
      state.currentlyEditing = null;
    },
  },
});

export const {
  toggleProductEditor,
  closeProductEditor,
  setCurrentlyEditing,
  updateAction,
  clearCurrentlyEditing,
  setCurrentProductCategory,
} = productSlice.actions;
export default productSlice.reducer;
