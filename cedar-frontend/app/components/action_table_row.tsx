import React from "react";
import { Activity } from "../store/slices/activitySlice";
import { format, parseISO } from "date-fns";

function ActionTableRow({ activity }: { activity: Activity }) {
  return (
    <div>
      <div className="flex w-full max-w-full bg-wBrand-background_light/60 p-4 px-8 text-sm text-white rounded-xl">
        <div className="w-[10%] flex items-center text-left">{activity.id}</div>
        <div className="w-[40%] flex items-center">
          {activity.affected_name ?? "N/A"}
        </div>
        <div className="w-[20%] flex items-center">
          {activity.acting_username ?? "N/A"}
        </div>
        <div className="w-[10%] flex items-center">
          {format(parseISO(activity.timestamp), "do MMM yy, h:mma")}
        </div>
        <div className="w-[20%] flex items-center justify-end text-right">
          {activity.action.toUpperCase()}
        </div>
      </div>
    </div>
  );
}

export default ActionTableRow;
