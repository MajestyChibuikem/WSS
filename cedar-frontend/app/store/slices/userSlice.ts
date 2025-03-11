import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Actions, Roles, User } from "@/app/utils/types";

interface UserSlice {
  show_user_editor: boolean;
  action_type: Actions | null;
  currentlyEditing: (User & { password: string }) | null; // Track the user being edited
}

const initialState: UserSlice = {
  show_user_editor: false,
  action_type: null,
  currentlyEditing: null,
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    toggleUserEditor: (state) => {
      state.show_user_editor = !state.show_user_editor;
    },

    closeUserEditor: (state) => {
      state.show_user_editor = false;
      state.currentlyEditing = null;
    },

    updateAction: (state: UserSlice, action: PayloadAction<Actions>) => {
      state.action_type = action.payload;
    },

    // ✅ Set the user being edited
    setCurrentlyEditing: (
      state,
      action: PayloadAction<Partial<User & { password: string }>>
    ) => {
      if (!state.currentlyEditing) {
        state.currentlyEditing = {} as User & { password: string }; // Initialize if null
      }
      state.currentlyEditing = { ...state.currentlyEditing, ...action.payload };
    },

    // // ✅ Update user details using `currentlyEditing`
    // updateUser: (state, action: PayloadAction<User>) => {
    //   if (state.currentlyEditing) {
    //     const index = state.users.findIndex(
    //       (u) => u.username === state.currentlyEditing?.username
    //     );
    //     if (index !== -1) {
    //       state.users[index] = action.payload;
    //     }
    //     state.currentlyEditing = null; // Reset after updating
    //   }
    // },

    // // ✅ Delete user by index
    // deleteUser: (state, action: PayloadAction<number>) => {
    //   state.users = state.users.filter((_, i) => i !== action.payload);
    // },

    // ✅ Clear currently editing user (for cancel or reset)
    clearCurrentlyEditing: (state) => {
      state.currentlyEditing = null;
    },
  },
});

export const {
  toggleUserEditor,
  closeUserEditor,
  setCurrentlyEditing,
  clearCurrentlyEditing,
  updateAction,
} = userSlice.actions;
export default userSlice.reducer;
