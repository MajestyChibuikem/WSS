"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Dropdown from "./dropdown";
import { usersDropdownItems } from "../utils/mock_data";
import {
  closeUserEditor,
  setCurrentlyEditing,
  toggleUserEditor,
} from "../store/slices/userSlice";
import { RootState } from "../store";
import { Actions, Roles } from "../utils/types";
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
} from "../store/slices/apiSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import clsx from "clsx";
import { toast } from "react-toastify";

function NewUserSideBar() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.users);
  const dropdown = useSelector(
    (state: RootState) => state.dropdown.dropdowns["user_roles_dropdown"]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({
    username: false,
    password: false,
    role: false,
  });

  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const validateForm = () => {
    const errors = {
      username: !user.currentlyEditing?.username,
      password: !user.currentlyEditing?.password,
      role: !user.currentlyEditing?.roles?.length,
    };
    setFormErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsLoading(true);

    try {
      if (user.currentlyEditing && user.action_type === Actions.CREATE) {
        const response = await createUser({
          username: user.currentlyEditing.username,
          password: user.currentlyEditing.password,
          is_admin: user.currentlyEditing.roles[0] === Roles.ADMIN,
          roles: [user.currentlyEditing.roles[0].toLowerCase()],
        }).unwrap();

        toast.success("User created successfully!");
        dispatch(closeUserEditor());
      } else if (user.currentlyEditing && user.action_type === Actions.UPDATE) {
        const response = await updateUser({
          username: user.currentlyEditing.username,
          password: user.currentlyEditing.password,
          is_admin: user.currentlyEditing.roles[0] === Roles.ADMIN,
          roles: [user.currentlyEditing.roles[0].toLowerCase()],
          id: user.currentlyEditing.id,
        }).unwrap();

        toast.success("User updated successfully!");
      } else if (user.currentlyEditing && user.action_type === Actions.DELETE) {
        const response = await deleteUser(user.currentlyEditing.id).unwrap();
        toast.success("User deleted successfully!");
        dispatch(toggleUserEditor());
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage =
        (error as any).data?.message || "Couldn't complete the operation";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed w-[100vw] h-[100vh] bg-black/45 top-0 right-0 z-20">
      <div className="h-full w-[25rem] bg-wBrand-background fixed top-0 right-0 p-6 space-y-8">
        <h1 className="text-2xl font-semibold mt-8">{user.action_type} user</h1>
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-xs text-wBrand-foreground/60 font-medium">
              USER NAME{" "}
              {formErrors.username && <span className="text-red-500">*</span>}
            </p>
            <div className="text-sm">
              <input
                type="text"
                onChange={(e) =>
                  dispatch(setCurrentlyEditing({ username: e.target.value }))
                }
                value={user.currentlyEditing?.username || ""}
                placeholder="Enter username"
                className={`outline-none rounded-xl h-11 border ${
                  formErrors.username
                    ? "border-red-500"
                    : "border-wBrand-foreground/20"
                } overflow-clip bg-wBrand-background/40 pl-4 w-full`}
              />
              {formErrors.username && (
                <p className="text-red-500 text-xs mt-1">
                  Username is required
                </p>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-xs text-wBrand-foreground/60 font-medium">
              PASSWORD{" "}
              {formErrors.password && <span className="text-red-500">*</span>}
            </p>
            <div className="text-sm">
              <input
                type="password"
                onChange={(e) =>
                  dispatch(setCurrentlyEditing({ password: e.target.value }))
                }
                value={user.currentlyEditing?.password || ""}
                placeholder="Enter password"
                className={`outline-none rounded-xl h-11 border ${
                  formErrors.password
                    ? "border-red-500"
                    : "border-wBrand-foreground/20"
                } overflow-clip bg-wBrand-background/40 pl-4 w-full`}
              />
              {formErrors.password && (
                <p className="text-red-500 text-xs mt-1">
                  Password is required
                </p>
              )}
            </div>
          </div>
          <div className="space-y-4 relative">
            <p className="text-xs text-wBrand-foreground/60 font-medium">
              ROLE {formErrors.role && <span className="text-red-500">*</span>}
            </p>
            <Select
              value={user.currentlyEditing?.roles?.[0]?.toLowerCase() || ""}
              onValueChange={(value) => {
                dispatch(
                  setCurrentlyEditing({
                    roles: [value.toUpperCase()],
                  })
                );
              }}
            >
              <SelectTrigger
                className={`w-full rounded-xl h-max p-3 ${
                  formErrors.role ? "border-red-500" : ""
                }`}
              >
                <SelectValue placeholder="Select user role" />
              </SelectTrigger>
              <SelectContent className="bg-wBrand-background mt-2 rounded-xl">
                {usersDropdownItems.map((item, idx) => (
                  <SelectItem
                    className="p-3"
                    key={idx}
                    value={item.value.toString()}
                  >
                    {item.content}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.role && (
              <p className="text-red-500 text-xs mt-1">Role is required</p>
            )}
          </div>
        </div>
        <div className="w-full flex gap-4 justify-end">
          <button
            onClick={() => dispatch(closeUserEditor())}
            className="py-2 px-5 text-sm border duration-700 border-wBrand-accent/30 hover:border-wBrand-accent font-semibold rounded-lg text-wBrand-accent/30 hover:text-wBrand-accent"
            disabled={isLoading}
          >
            Close
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={clsx(
              "py-2 px-5 text-sm bg-wBrand-accent font-semibold rounded-lg",
              isLoading ? "bg-gray-700" : "text-wBrand-background"
            )}
          >
            {isLoading ? "Processing..." : `${user.action_type} user`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewUserSideBar;
