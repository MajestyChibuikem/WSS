import { Delete, PenLine, Trash } from "lucide-react";
import React from "react";
import { Actions, Roles, User } from "../utils/types";
import clsx from "clsx";
import { useDispatch } from "react-redux";
import {
  setCurrentlyEditing,
  toggleUserEditor,
  updateAction,
} from "../store/slices/userSlice";
import { getInitials, truncateText } from "../utils/helpers";

interface Params {
  user: User;
}

function UserCard({ user }: Params) {
  const dispatch = useDispatch();
  return (
    <div className="border border-wBrand-foreground/10 flex items-center rounded-xl p-4 gap-x-3 bg-wBrand-background/5 relative">
      <div className="min-h-12 h-12 min-w-12 w-12 rounded-full flex items-center justify-center bg-wBrand-accent">
        {getInitials(user.username)}
      </div>
      <div className="space-y-1">
        <h2 className="font-semibold uppercase">
          {truncateText(user.username, 10)}
        </h2>
        <div className="flex justify-between text-xs gap-x-4">
          <p
            className={clsx(
              "text-wBrand-foreground/50 font-semibold uppercase",
              user.roles[0] == Roles.ADMIN
                ? "text-wBrand-accent/60"
                : user.roles[0] == Roles.SUPER_USER && "text-yellow-500/60"
            )}
          >
            {...user.roles}
          </p>
        </div>
      </div>
      <button
        onClick={() => {
          dispatch(toggleUserEditor());
          dispatch(setCurrentlyEditing(user));
          dispatch(setCurrentlyEditing({ roles: user.roles }));
          dispatch(updateAction(Actions.UPDATE));
        }}
      >
        <PenLine className="absolute right-12 top-5 h-4 text-wBrand-accent/50 hover:text-wBrand-accent w-4 cursor-pointer" />
      </button>
      <button
        onClick={() => {
          dispatch(toggleUserEditor());
          dispatch(setCurrentlyEditing(user));
          dispatch(setCurrentlyEditing({ roles: user.roles }));
          dispatch(updateAction(Actions.DELETE));
        }}
      >
        <Trash className="absolute right-5 top-5 h-4 text-red-600/50 hover:text-red-600 w-4 cursor-pointer" />
      </button>
    </div>
  );
}

export default UserCard;
