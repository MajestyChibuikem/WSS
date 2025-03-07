import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import counterReducer from "./slices/counterSlice";
import wineReducer from "./slices/wineSlice";
import dropdownReducer from "./slices/dropdownSlice";
import checkboxSelectorReducer from "./slices/checkboxSelectorSlice";
import inventoryReducer from "./slices/inventorySlice";
import userReducer from "./slices/userSlice";
import authReducer from "./slices/authSlice";
import { apiSlice } from "./slices/apiSlice"; // Import the RTK Query API

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    winer: wineReducer,
    dropdown: dropdownReducer,
    checkboxSelector: checkboxSelectorReducer,
    inventory: inventoryReducer,
    users: userReducer,
    auth: authReducer,

    [apiSlice.reducerPath]: apiSlice.reducer, // ✅ Add the RTK Query reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware), // ✅ Add the RTK Query middleware
});

// Types for better TypeScript support
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Custom hooks for use in components
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
