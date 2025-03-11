"use client";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Dropdown from "./dropdown";
import { usersDropdownItems } from "../utils/mock_data";
import {
  closeUserEditor,
  setCurrentlyEditing,
} from "../store/slices/userSlice";
import { RootState } from "../store";
import { updateToggleItem } from "../store/slices/dropdownSlice";
import { Actions, DropdownItem, Roles } from "../utils/types";
import { useCreateUserMutation } from "../store/slices/apiSlice";
import clsx from "clsx";

function NewUserSideBar() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.users);
  const dropdown = useSelector(
    (state: RootState) => state.dropdown.dropdowns["user_roles_dropdown"]
  );

  const [createUser] = useCreateUserMutation();

  const handleSubmit = async () => {
    if (
      user.currentlyEditing &&
      dropdown.item &&
      user.action_type == Actions.CREATE
    ) {
      const is_admin = dropdown.item?.value == Roles.ADMIN;
      console.log("in here");
      console.log(
        user.currentlyEditing,
        dropdown.item.value as string,
        user.action_type
      );
      try {
        const response = await createUser({
          username: user.currentlyEditing.username,
          password: user.currentlyEditing.password,
          is_admin,
          roles: [dropdown.item.value as string],
        });
        console.log("response: ", response); //impement response for 409(confilict user already exists) and 200 created successfully
      } catch {
        console.log("couldnt create user");
      }
    }
  };

  return (
    <div className="fixed w-[100vw] h-[100vh] bg-black/45 top-0 right-0 z-20">
      <div className="h-full w-[25rem] bg-wBrand-background fixed top-0 right-0 p-6 space-y-8">
        <h1 className="text-2xl font-semibold mt-8">Add new user</h1>
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-xs text-wBrand-foreground/60 font-medium">
              USER NAME
            </p>
            <div className="text-sm">
              <input
                type="text"
                onChange={(e) =>
                  dispatch(setCurrentlyEditing({ username: e.target.value }))
                }
                value={user.currentlyEditing?.username}
                placeholder="Enter firstname"
                className="outline-none rounded-xl h-11 border border-wBrand-foreground/20 overflow-clip bg-wBrand-background/40 pl-4 w-full"
              />
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-xs text-wBrand-foreground/60 font-medium">
              PASSWORD
            </p>
            <div className="text-sm">
              <input
                type="password"
                onChange={(e) =>
                  dispatch(setCurrentlyEditing({ password: e.target.value }))
                }
                value={user.currentlyEditing?.password}
                placeholder="Enter password"
                className="outline-none rounded-xl h-11 border border-wBrand-foreground/20 overflow-clip bg-wBrand-background/40 pl-4 w-full"
              />
            </div>
          </div>
          <div className="space-y-4 relative">
            <p className="text-xs text-wBrand-foreground/60 font-medium">
              ROLE
            </p>
            <Dropdown
              className="text-sm h-11 p-0 pl-4"
              id={"user_roles_dropdown"}
              items={usersDropdownItems}
            />
          </div>
        </div>
        <div className="w-full flex gap-4 justify-end">
          <button
            onClick={() => dispatch(closeUserEditor())}
            className="py-2 px-5 text-sm border duration-700 border-wBrand-accent/30 hover:border-wBrand-accent font-semibold rounded-lg text-wBrand-accent/30 hover:text-wBrand-accent"
          >
            Close
          </button>
          <button
            disabled={
              user.action_type !== Actions.CREATE &&
              user.action_type !== Actions.UPDATE
            }
            onClick={handleSubmit}
            className={clsx(
              "py-2 px-5 text-sm bg-wBrand-accent font-semibold rounded-lg text-wBrand-background",
              user.action_type !== Actions.CREATE &&
                user.action_type !== Actions.UPDATE &&
                "bg-gray-700"
            )}
          >
            {user.action_type == Actions.CREATE
              ? "Add user"
              : user.action_type == Actions.UPDATE && "Update user"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewUserSideBar;
