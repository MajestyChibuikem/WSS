import { SortOrder } from "@/app/utils/mock_data";
import { Wine } from "@/app/utils/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/app/store";

interface InventoryState {
  filteredData: Wine[];
  productData: Wine[];
  inventoryFilter: {
    name: string;
    categories: string[];
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
    name: "",
    categories: [],
    sort_by: SortOrder.ASC,
    price_range: { min: 0, max: Number.POSITIVE_INFINITY },
    abv_range: { min: 0, max: Number.POSITIVE_INFINITY },
    bottle_size: { min: 0, max: Number.POSITIVE_INFINITY },
  },
  filteredData: [],
  discount: 0,
  cart: [],
  productData: [],
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
      inventorySlice.caseReducers.filterInventory(state);
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

    setWineData: (state, action: PayloadAction<Wine[]>) => {
      state.productData = action.payload;
      state.filteredData = state.productData;
    },

    // ✅ Initial remove from cart (removes item completely)
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.cart = state.cart.filter((item) => item.id !== action.payload);
    },

    clearCart: (state) => {
      state.cart = [];
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

    filterInventory: (state) => {
      state.filteredData = state.productData.filter((product) => {
        const {
          name,
          categories,
          sort_by,
          price_range,
          abv_range,
          bottle_size,
        } = state.inventoryFilter;

        // Name filter (fuzzy search)
        if (name.trim()) {
          const regex = new RegExp(name.split("").join(".*"), "i");
          if (!regex.test(product.name)) {
            return false;
          }
        }

        // Categories filter
        if (categories.length > 0) {
          if (!categories.includes(product.category)) {
            return false;
          }
        }

        // Price range filter
        if (
          product.price < price_range.min ||
          product.price > price_range.max
        ) {
          return false;
        }

        // ABV range filter
        if (product.abv < abv_range.min || product.abv > abv_range.max) {
          return false;
        }

        // Bottle size filter
        if (
          product.bottle_size < bottle_size.min ||
          product.bottle_size > bottle_size.max
        ) {
          return false;
        }

        return true;
      });

      // Sorting by price
      state.filteredData.sort((a, b) => {
        return state.inventoryFilter.sort_by === SortOrder.ASC
          ? a.price - b.price
          : b.price - a.price;
      });
    },

    resetInventoryFilter: (state) => {
      state.filteredData = state.productData;
    },

    clearFilter: (state) => {
      state.inventoryFilter = {
        name: "",
        categories: [],
        sort_by: SortOrder.ASC,
        price_range: { min: 0, max: Infinity },
        abv_range: { min: 0, max: Infinity },
        bottle_size: { min: 0, max: Infinity },
      };
      state.filteredData = state.productData;
    },
  },
});

export const {
  updateInventoryFilter,
  addToCart,
  removeFromCart,
  incrementCartItemQuantity,
  decrementCartItemQuantity,
  filterInventory,
  clearFilter,
  clearCart,
  resetInventoryFilter,
  setWineData,
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
