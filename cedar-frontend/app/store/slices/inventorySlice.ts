import { SortOrder } from "@/app/utils/mock_data";
import { Wine } from "@/app/utils/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/app/store";

interface InventoryState {
  filteredData: Wine[];
  inventoryFilter: {
    name: string;
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
    name: "",
    productCategory: "",
    sort_by: SortOrder.ASC,
    price_range: { min: 0, max: Infinity },
    abv_range: { min: 0, max: Infinity },
    bottle_size: { min: 0, max: Infinity },
  },
  filteredData: [],
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

    filterInventory: (
      state,
      action: PayloadAction<{ wines: Wine[]; categories?: string[] }>
    ) => {
      const { inventoryFilter } = state;
      let { wines: filtered, categories } = action.payload;

      console.log("Original wine list: ", filtered);
      console.log("Filtering categories: ", categories);

      // Apply category filter (if categories array is not empty)
      if (categories && categories.length > 0) {
        filtered = filtered.filter(
          (wine) => categories && categories.includes(wine.category)
        );
      }

      // Apply name filter (if set)
      if (inventoryFilter.name?.trim()) {
        const nameFilter = inventoryFilter.name.toLowerCase();
        filtered = filtered.filter((wine) => {
          const wineName = wine.name.toLowerCase();

          // Check if every character in the input exists somewhere in the wine name
          return nameFilter.split("").every((char) => wineName.includes(char));
        });
      }
      // Apply price range filter
      filtered = filtered.filter(
        (wine) =>
          wine.price >= inventoryFilter.price_range.min &&
          wine.price <= (inventoryFilter.price_range.max || Infinity)
      );

      // Apply ABV range filter
      filtered = filtered.filter(
        (wine) =>
          wine.abv >= inventoryFilter.abv_range.min &&
          wine.abv <= (inventoryFilter.abv_range.max || Infinity)
      );

      // Apply bottle size filter
      filtered = filtered.filter(
        (wine) =>
          wine.bottle_size >= inventoryFilter.bottle_size.min &&
          wine.bottle_size <= (inventoryFilter.bottle_size.max || Infinity)
      );

      // Apply sorting
      filtered.sort((a, b) => {
        if (inventoryFilter.sort_by === SortOrder.ASC) {
          return a.price - b.price;
        }
        return b.price - a.price;
      });

      console.log("Filtered wine list: ", filtered);

      state.filteredData = filtered;
      state.inventoryFilter.name = "";
    },

    clearFilter: (state) => {
      state.inventoryFilter = {
        name: "",
        productCategory: "",
        sort_by: SortOrder.ASC,
        price_range: { min: 0, max: Infinity },
        abv_range: { min: 0, max: Infinity },
        bottle_size: { min: 0, max: Infinity },
      };
      state.filteredData = [];
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
