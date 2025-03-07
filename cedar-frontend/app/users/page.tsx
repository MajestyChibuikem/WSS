"use client";
import React from "react";
import UserCard from "../components/user_card";
import NewUserSideBar from "../components/new_user_sidebar";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { toggleUserEditor } from "../store/slices/userSlice";
import { mockUsers } from "../utils/mock_data";

function Page() {
  const dispatch = useDispatch();
  const showUserEditor = useSelector(
    (state: RootState) => state.users.show_user_editor
  );
  return (
    <div className="px-10 w-[100vw]">
      {showUserEditor && <NewUserSideBar />}
      <div className="flex items-center justify-between">
        <h1 className="py-8 pl-2 text-2xl font-medium">Users</h1>
        <button
          onClick={() => dispatch(toggleUserEditor())}
          className="px-5 py-2 font-medium bg-accent text-background rounded-xl"
        >
          Add Product
        </button>
      </div>
      <div className="grid grid-cols-4 gap-5 w-full">
        {mockUsers.map((user, idx) => (
          <UserCard key={idx} user={user} />
        ))}
      </div>
    </div>
  );
}

export default Page;
