"use client";
import React from "react";
import UserCard from "../components/user_card";
import NewUserSideBar from "../components/new_user_sidebar";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { toggleUserEditor, updateAction } from "../store/slices/userSlice";
import { mockUsers } from "../utils/mock_data";
import { useGetUsersQuery } from "../store/slices/apiSlice";
import Empty from "../components/empty";
import { Actions } from "../utils/types";

function Page() {
  const dispatch = useDispatch();
  const showUserEditor = useSelector(
    (state: RootState) => state.users.show_user_editor
  );

  const { data: userData, error, isLoading } = useGetUsersQuery();

  console.log("users", userData);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error fetching wines</p>;

  return (
    <div className="px-10 w-[100vw]">
      {showUserEditor && <NewUserSideBar />}
      <div className="flex items-center justify-between">
        <h1 className="py-8 pl-2 text-2xl font-medium">Users</h1>
        <button
          onClick={() => {
            dispatch(updateAction(Actions.CREATE));
            dispatch(toggleUserEditor());
          }}
          className="px-5 py-2 font-medium bg-accent text-background rounded-xl"
        >
          Add User
        </button>
      </div>
      <div className="grid grid-cols-4 gap-5 w-full">
        {!userData ? (
          <Empty
            info={
              "there seems to currently be an issue with the server... Try again later"
            }
          />
        ) : userData.users.length == 0 ? (
          <Empty info={"There seems to be no available users right now."} />
        ) : (
          userData.users.map((user, idx) => <UserCard key={idx} user={user} />)
        )}
      </div>
    </div>
  );
}

export default Page;
