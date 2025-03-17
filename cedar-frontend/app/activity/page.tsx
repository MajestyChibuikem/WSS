"use client";
import React, { useEffect } from "react";
import ActionTableRow from "../components/action_table_row";
import { DollarSign, LoaderCircle, User } from "lucide-react";
import { actions } from "../utils/mock_data";
import { DatePickerWithRange } from "../components/range_calendar";
import { useGetAllLogsQuery } from "../store/slices/apiSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { setActivities, setFilters } from "../store/slices/activitySlice";

function Page() {
  const { data: allLogs, error: allLogsError, isLoading } = useGetAllLogsQuery(
    {}
  );

  // console.log("logs: ", allLogs);

  const dispatch = useDispatch();
  const activities = useSelector(
    (state: RootState) => state.activity.activities
  );

  useEffect(() => {
    allLogs && dispatch(setActivities(allLogs));
  }, [allLogs]);

  // useEffect(() => {
  //   console.log("activities: ", activities);
  // }, [activities]);

  if (isLoading)
    return (
      <div className="h-[85vh] w-full flex justify-center items-center">
        <LoaderCircle className="text-wBrand-accent animate-spin stroke-wBrand-accent h-10 w-10" />
      </div>
    );

  return (
    <div className="w-[100vw] px-10 space-y-10">
      <h1 className="text-2xl font-medium">Activity Log</h1>
      <section className="w-full flex">
        <div className="w-[25rem] h-[100vh]">
          <div className="fixed w-[24rem] h-[calc(100vh-9rem)] top-[9rem] p-10 pr-0 pt-0 left-0">
            <div className="rounded-lg space-y-8 pb-10 overflow-y-auto relative bg-wBrand-background_light/60 h-full">
              <div className="bg-wBrand-background_light gap-4 px-10 h-[5.5rem] flex items-center w-full justify-center sticky top-0">
                <button className="px-5 py-2 bg-wBrand-accent w-full text-wBrand-background rounded-xl">
                  Filter
                </button>
                <button className="px-5 py-2 border border-white/40 w-full text-white rounded-xl">
                  Reset
                </button>
              </div>
              <div className="space-y-4 px-6">
                <p className="text-xs text-wBrand-foreground/60 font-medium">
                  ACTIONS
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {actions.map((category, idx) => (
                    <button
                      key={idx}
                      className="border text-xs border-wBrand-foreground/20 rounded-xl px-3 py-2 flex justify-between text-left items-center"
                    >
                      <p>{category}</p>
                      <p className="p-1 px-2 text-xs bg-wBrand-foreground/10 rounded-lg">
                        1078
                      </p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4 px-6">
                <p className="text-xs text-wBrand-foreground/60 font-medium">
                  FILTER BY USER
                </p>
                <div className="text-sm">
                  <div className="flex w-full rounded-xl border border-wBrand-foreground/20 overflow-clip bg-wBrand-background/40">
                    <div className="border-r bg-wBrand-background border-wBrand-foreground/20 p-3">
                      <User className="h-4" />
                    </div>
                    <input
                      type="text"
                      onChange={(e) =>
                        dispatch(setFilters({ username: e.target.value }))
                      }
                      placeholder="ENTER USER NAME"
                      className="outline-none min-h-full pl-4 bg-transparent w-full"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4 px-6">
                <p className="text-xs text-wBrand-foreground/60 font-medium">
                  FILTER BY ITEM
                </p>
                <div className="text-sm">
                  <div className="flex w-full rounded-xl border border-wBrand-foreground/20 overflow-clip bg-wBrand-background/40">
                    <div className="border-r bg-wBrand-background border-wBrand-foreground/20 p-3">
                      <User className="h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="ENTER ITEM NAME"
                      className="outline-none min-h-full pl-4 bg-transparent w-full"
                    />
                  </div>
                </div>
              </div>
              <div className="relative w-max px-6 space-y-4">
                <p className="text-xs text-wBrand-foreground/60 font-medium">
                  FILTER BY DATE RANGE
                </p>
                <DatePickerWithRange
                  period1={true}
                  className="!w-full bg-transparent"
                  triggerClassname="h-max text-xs bg-wBrand-background/40 rounded-xl px-4 py-3 !w-full border border-wBrand-foreground/20 items-center justify-center flex"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="w-[calc(100vw-25rem)]">
          {/* <div className="grid grid-cols-5 text-xs py-2 px-4 bg-wBrand-accent/10 text-gray-300 rounded-full w-full">
            <p>ITEM ID</p>
            <p>ITEM NAME</p>
            <p>ACTION</p>
            <p>USER</p>
            <p>DATE</p>
          </div> */}
          <div className="grid grid-cols-3 gap-4">
            {activities.map((activity, idx) => (
              <ActionTableRow key={idx} activity={activity} />
            ))}

            {/* <ActionTableRow />
            <ActionTableRow />
            <ActionTableRow />
            <ActionTableRow />
            <ActionTableRow />
            <ActionTableRow /> */}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Page;
