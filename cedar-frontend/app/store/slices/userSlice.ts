import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Roles, User } from "@/app/utils/types";
import { mockUsers } from "@/app/utils/mock_data";

interface UserSlice {
  show_user_editor: boolean;
  users: User[];
  currentlyEditing: User; // Track the user being edited
}

const initialState: UserSlice = {
  show_user_editor: false,
  users: mockUsers,
  currentlyEditing: {
    firstname: "",
    lastname: "",
    role: Roles.STAFF,
  },
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
      state.currentlyEditing = {
        firstname: "",
        lastname: "",
        role: Roles.STAFF,
      };
    },

    // ✅ Set the user being edited
    setCurrentlyEditing: (state, action: PayloadAction<Partial<User>>) => {
      if (!state.currentlyEditing) {
        state.currentlyEditing = {} as User; // Initialize if null
      }
      state.currentlyEditing = { ...state.currentlyEditing, ...action.payload };
    },

    // ✅ Update user details using `currentlyEditing`
    updateUser: (state, action: PayloadAction<User>) => {
      if (state.currentlyEditing) {
        const index = state.users.findIndex(
          (u) =>
            u.firstname === state.currentlyEditing?.firstname &&
            u.lastname === state.currentlyEditing?.lastname
        );
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        state.currentlyEditing = {
          firstname: "",
          lastname: "",
          role: Roles.STAFF,
        }; // Reset after updating
      }
    },

    // ✅ Delete user by index
    deleteUser: (state, action: PayloadAction<number>) => {
      state.users = state.users.filter((_, i) => i !== action.payload);
    },

    // ✅ Clear currently editing user (for cancel or reset)
    clearCurrentlyEditing: (state) => {
      state.currentlyEditing = {
        firstname: "",
        lastname: "",
        role: Roles.STAFF,
      };
    },
  },
});

export const {
  toggleUserEditor,
  closeUserEditor,
  setCurrentlyEditing,
  updateUser,
  deleteUser,
  clearCurrentlyEditing,
} = userSlice.actions;
export default userSlice.reducer;
