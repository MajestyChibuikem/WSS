"use client";
import React from "react";
import UserCard from "../components/user_card";
import NewUserSideBar from "../components/new_user_sidebar";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { toggleUserEditor, updateAction } from "../store/slices/userSlice";
import {
  useGetUserByIdQuery,
  useGetUsersQuery,
} from "../store/slices/apiSlice";
import Empty from "../components/empty";
import { Actions, Roles } from "../utils/types";
import { getRoleEnum } from "../utils/helpers";
import { UsersPageSkeleton } from "../components/skeleton";

function Page() {
  const dispatch = useDispatch();
  const showUserEditor = useSelector(
    (state: RootState) => state.users.show_user_editor
  );

  const userId = Number(localStorage.getItem("wineryUserId")) ?? 0;

  const { data: userData, error, isLoading } = useGetUsersQuery();
  const {
    data: singleUserData,
    error: singleUserDataErr,
    isLoading: loadingSingleUser,
  } = useGetUserByIdQuery(userId);

  const userRole = getRoleEnum(
    localStorage.getItem("wineryUserRole")?.toLowerCase() ?? ""
  );

  if (error && singleUserDataErr) return <p>Error fetching users</p>;
  if (isLoading || loadingSingleUser)
    return (
      <div className="px-4 lg:px-10 w-full overflow-y-auto h-[calc(100vh-5rem)]">
        <div className="flex items-center justify-between py-6 lg:py-8">
          <h1 className="text-2xl lg:text-3xl font-semibold">Users</h1>
        </div>
        <UsersPageSkeleton />
      </div>
    );

  return (
    <div className="px-4 lg:px-10 w-full overflow-y-auto h-[calc(100vh-5rem)]">
      {showUserEditor && <NewUserSideBar />}
      <div className="flex items-center justify-between py-6 lg:py-8">
        <h1 className="text-2xl lg:text-3xl font-semibold">Users</h1>
        {userRole == Roles.ADMIN && (
          <button
            onClick={() => {
              dispatch(updateAction(Actions.CREATE));
              dispatch(toggleUserEditor());
            }}
            className="px-4 lg:px-5 py-2 text-sm lg:text-base font-medium bg-wBrand-accent text-wBrand-background rounded-xl"
          >
            Add User
          </button>
        )}
      </div>
      <div>
        {!userData && !singleUserData ? (
          <Empty
            info={
              "there seems to currently be an issue with the server... Try again later"
            }
          />
        ) : userData && userData.users.length == 0 && !singleUserData?.user ? (
          <Empty info={"There seems to be no available users right now."} />
        ) : !userData && singleUserData?.user ? (
          <UserCard user={singleUserData.user} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5 w-full">
            {userData &&
              userData.users.map((user, idx) => (
                <UserCard key={idx} user={user} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Page;
