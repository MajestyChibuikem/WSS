import { SortOrder } from "@/app/utils/mock_data";
import { Wine } from "@/app/utils/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/app/store";

interface InventoryState {
  inventoryFilter: {
    productCategory: string;
    sort_by: SortOrder;
    price_range: { min: number; max: number };
    abv_range: { min: number; max: number };
    bottle_size: { min: number; max: number };
  };
  discount: number;
  cart: (Wine & { quantity: number })[]; // Ensure items have a quantity
}

const initialState: InventoryState = {
  inventoryFilter: {
    productCategory: "",
    sort_by: 0,
    price_range: { min: 0, max: 0 },
    abv_range: { min: 0, max: 0 },
    bottle_size: { min: 0, max: 0 },
  },
  discount: 0,
  cart: [],
};

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    updateInventoryFilter: (
      state,
      action: PayloadAction<Partial<InventoryState["inventoryFilter"]>>
    ) => {
      state.inventoryFilter = { ...state.inventoryFilter, ...action.payload };
    },

    // ✅ Initial add to cart (adds new item with quantity 1)
    addToCart: (state, action: PayloadAction<Wine>) => {
      const existingItem = state.cart.find(
        (item) => item.id === action.payload.id
      );
      if (!existingItem) {
        state.cart.push({ ...action.payload, quantity: 1 });
      }
    },

    // ✅ Initial remove from cart (removes item completely)
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.cart = state.cart.filter((item) => item.id !== action.payload);
    },

    // ✅ Increment quantity of an existing cart item
    incrementCartItemQuantity: (state, action: PayloadAction<number>) => {
      const item = state.cart.find((item) => item.id === action.payload);
      if (item) {
        item.quantity += 1;
      }
    },

    // ✅ Decrement quantity of an existing cart item (without removing completely)
    decrementCartItemQuantity: (state, action: PayloadAction<number>) => {
      const item = state.cart.find((item) => item.id === action.payload);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
      }
    },
  },
});

export const {
  updateInventoryFilter,
  addToCart,
  removeFromCart,
  incrementCartItemQuantity,
  decrementCartItemQuantity,
} = inventorySlice.actions;
export default inventorySlice.reducer;

// inventory selectors
export const getCartTotal = createSelector(
  (state: RootState) => state.inventory.cart,
  (state: RootState) => state.inventory.discount,
  (cart, discount) => {
    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const discountedTotal = total * (1 - discount / 100);
    return { total, discountedTotal };
  }
);
