import React from "react";
import { Activity } from "../store/slices/activitySlice";
import { ArrowRight } from "lucide-react";
import { truncateText } from "../utils/helpers";

function ActionRowCard({ activity }: { activity: Activity }) {
  return (
    <div>
      <div className="rounded-xl bg-wBrand-background_light/60 p-4 space-y-1">
        <div className="flex gap-2 items-center">
          <h3 className="text-xs text-green-400/50 font-medium">
            {activity.action}
          </h3>
          <ArrowRight className="size-3" />
          <h2 className="capitalize">
            {(activity.affected_name &&
              truncateText(activity.affected_name, 8)) ??
              "N/A"}
          </h2>
        </div>
        <div className="text-xs flex gap-3 text-gray-400">
          <p>#{activity.id}</p>
          <p>
            {(activity.acting_username &&
              truncateText(activity.acting_username, 6)) ??
              "N/A"}
          </p>
          <p>{activity.timestamp}</p>
        </div>
      </div>
    </div>
  );
}

export default ActionRowCard;
