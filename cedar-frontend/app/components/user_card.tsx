import { PenLine } from "lucide-react";
import React from "react";
import { Roles, User } from "../utils/types";
import clsx from "clsx";
import { useDispatch } from "react-redux";
import {
  setCurrentlyEditing,
  toggleUserEditor,
} from "../store/slices/userSlice";

interface Params {
  user: User;
}

function UserCard({ user }: Params) {
  const dispatch = useDispatch();
  return (
    <div className="border border-foreground/10 flex items-center rounded-xl p-4 gap-x-3 bg-background/5 relative">
      <button
        onClick={() => {
          dispatch(toggleUserEditor());
          dispatch(setCurrentlyEditing(user));
          dispatch(setCurrentlyEditing({ role: user.role }));
        }}
      >
        <PenLine className="absolute right-5 top-5 h-4 text-accent/50 hover:text-accent w-4 cursor-pointer" />
      </button>
      <div className="min-h-12 h-12 min-w-12 w-12 rounded-full bg-gray-200"></div>
      <div className="space-y-1">
        <h2 className="font-semibold">
          {user.lastname + " " + user.firstname}
        </h2>
        <div className="flex justify-between text-xs gap-x-4">
          <p
            className={clsx(
              "text-foreground/50 font-semibold",
              user.role == Roles.ADMIN
                ? "text-accent/60"
                : user.role == Roles.SUPERUSER && "text-yellow-500/60"
            )}
          >
            {user.role}
          </p>
        </div>
      </div>
    </div>
  );
}

export default UserCard;
