import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import counterReducer from "./slices/counterSlice";
import productReducer from "./slices/productSlice";
import dropdownReducer from "./slices/dropdownSlice";
import checkboxSelectorReducer from "./slices/checkboxSelectorSlice";
import inventoryReducer from "./slices/inventorySlice";
import userReducer from "./slices/userSlice";
import authReducer from "./slices/authSlice";
import statsReducer from "./slices/statsSlice";
import activityReducer from "./slices/activitySlice";
import { apiSlice } from "./slices/apiSlice"; // Import the RTK Query API
import salesReducer from "./slices/salesSlice";

const appReducer = combineReducers({
  counter: counterReducer,
  products: productReducer,
  dropdown: dropdownReducer,
  checkboxSelector: checkboxSelectorReducer,
  inventory: inventoryReducer,
  stats: statsReducer,
  users: userReducer,
  auth: authReducer,
  activity: activityReducer,
  sales: salesReducer,

  [apiSlice.reducerPath]: apiSlice.reducer,
});

const rootReducer = (state: any, action: any) => {
  if (action.type === "RESET_APP") {
    const { routing } = state;
    state = { routing };
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export const resetApp = () => ({ type: "RESET_APP" });

// Types for better TypeScript support
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Custom hooks for use in components
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
