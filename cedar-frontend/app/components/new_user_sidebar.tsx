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
import { DropdownItem, Roles } from "../utils/types";

function NewUserSideBar() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.users);
  const dropdown = useSelector(
    (state: RootState) => state.dropdown.dropdowns["user_roles_dropdown"]
  );

  return (
    <div className="fixed w-[100vw] h-[100vh] bg-black/45 top-0 right-0 z-20">
      <div className="h-full w-[25rem] bg-background fixed top-0 right-0 p-6 space-y-8">
        <h1 className="text-2xl font-semibold mt-8">Add new user</h1>
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-xs text-foreground/60 font-medium">USER NAME</p>
            <div className="flex gap-3">
              <div className="text-sm">
                <input
                  type="text"
                  onChange={(e) =>
                    dispatch(setCurrentlyEditing({ firstname: e.target.value }))
                  }
                  value={user.currentlyEditing.firstname}
                  placeholder="Enter firstname"
                  className="outline-none rounded-xl h-11 border border-foreground/20 overflow-clip bg-background/40 pl-4 w-full"
                />
              </div>
              <div className="text-sm">
                <input
                  type="text"
                  onChange={(e) =>
                    dispatch(setCurrentlyEditing({ lastname: e.target.value }))
                  }
                  value={user.currentlyEditing.lastname}
                  placeholder="Enter lastname"
                  className="outline-none rounded-xl h-11 border border-foreground/20 overflow-clip bg-background/40 pl-4 w-full"
                />
              </div>
            </div>
          </div>
          <div className="space-y-4 relative">
            <p className="text-xs text-foreground/60 font-medium">ROLE</p>
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
            className="py-2 px-5 text-sm border duration-700 border-accent/30 hover:border-accent font-semibold rounded-lg text-accent/30 hover:text-accent"
          >
            Close
          </button>
          <button className="py-2 px-5 text-sm bg-accent font-semibold rounded-lg text-background">
            Add user
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewUserSideBar;
