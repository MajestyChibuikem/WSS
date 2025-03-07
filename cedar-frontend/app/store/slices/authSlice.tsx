import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/app/store";

interface User {
  username: string;
  password: string;
  role: string;
}

interface ValidationErrors {
  username?: string;
  password?: string;
}

interface AuthState {
  user: User;
  isAuthenticated: boolean;
  validationErrors: ValidationErrors; // Stores validation errors separately
}

const initialState: AuthState = {
  user: {
    username: "",
    password: "",
    role: "",
  },
  isAuthenticated: false,
  validationErrors: {},
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.validationErrors = {}; // Clear errors on successful login
    },

    loginFailure: (state, action: PayloadAction<ValidationErrors>) => {
      state.validationErrors = action.payload; // Store validation errors
    },

    logout: (state) => {
      state.user = { username: "", password: "", role: "" };
      state.isAuthenticated = false;
      state.validationErrors = {};
    },

    clearValidationErrors: (state) => {
      state.validationErrors = {};
    },

    updateUserField: (
      state,
      action: PayloadAction<{ field: keyof User; value: string }>
    ) => {
      state.user[action.payload.field] = action.payload.value;
    },

    validateUserInput: (state) => {
      const errors: ValidationErrors = {};

      if (state.user.username.length < 4) {
        errors.username = "Username must be at least 6 characters long.";
      }
      if (state.user.password.length < 8) {
        errors.password = "Password must be at least 8 characters long.";
      }

      state.validationErrors = errors;
    },
  },
});

export const {
  loginSuccess,
  loginFailure,
  logout,
  clearValidationErrors,
  updateUserField,
  validateUserInput,
} = authSlice.actions;

export default authSlice.reducer;

// Selectors for easy access
export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectValidationErrors = (state: RootState) =>
  state.auth.validationErrors;
