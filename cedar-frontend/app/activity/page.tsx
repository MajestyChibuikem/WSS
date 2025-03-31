"use client";
import React, { useEffect } from "react";
import ActionTableRow from "../components/action_table_row";
import { DollarSign, LoaderCircle, User } from "lucide-react";
import { actions } from "../utils/mock_data";
import { DatePickerWithRange } from "../components/range_calendar";
import { useGetAllLogsQuery } from "../store/slices/apiSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import {
  applyFilters,
  clearFilters,
  setActivities,
  setFilters,
} from "../store/slices/activitySlice";
import CheckboxSelector from "../components/checkbox_selector";

function Page() {
  const { data: allLogs, error: allLogsError, isLoading } = useGetAllLogsQuery(
    {}
  );

  const dispatch = useDispatch();
  const { activities, filteredActivities } = useSelector(
    (state: RootState) => state.activity
  );

  useEffect(() => {
    allLogs && dispatch(setActivities(allLogs));
  }, [allLogs]);

  const activityFilter = useSelector(
    (state: RootState) => state.activity.filters
  );
  const selectedItems = useSelector(
    (state: RootState) =>
      state.checkboxSelector.selectors["action_category"]?.items || {}
  );
  const calendarRange = useSelector(
    (state: RootState) => state.stats.calendarRanges["activity_date_range"]
  );

  const categoryArr: string[] = Object.values(selectedItems).map(
    (item) => item.content
  );

  useEffect(() => {
    dispatch(
      setFilters({
        dateRange: {
          start: calendarRange.period1_start_date,
          end: calendarRange.period1_end_date,
        },
      })
    );
  }, [calendarRange]);

  useEffect(() => {
    if (categoryArr.length === 0 && activityFilter.categories?.length) {
      dispatch(clearFilters());
    } else if (categoryArr.length > 0) {
      const prevCategories = activityFilter.categories || [];
      if (JSON.stringify(prevCategories) !== JSON.stringify(categoryArr)) {
        dispatch(setFilters({ categories: categoryArr }));
      }
    }
  }, [categoryArr, activityFilter.categories, dispatch]);

  if (isLoading)
    return (
      <div className="h-[85vh] w-full flex justify-center items-center">
        <LoaderCircle className="text-wBrand-accent animate-spin stroke-wBrand-accent h-10 w-10" />
      </div>
    );

  return (
    <div className="w-[100vw] px-10">
      <h1 className="text-2xl font-medium sticky top-[5rem] h-[4rem] items-center flex bg-wBrand-background">
        Activity Log
      </h1>
      <section className="w-full flex">
        <div className="w-[25rem] h-[100vh]">
          <div className="fixed w-[24rem] h-[calc(100vh-9rem)] top-[9rem] p-10 pr-0 pt-0 left-0">
            <div className="rounded-lg space-y-8 py-10 overflow-y-auto relative bg-wBrand-background_light/60 h-full">
              <div className="space-y-4 px-6">
                <p className="text-xs text-wBrand-foreground/60 font-medium">
                  FILTER BY ACTIONS
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {actions.map((category, idx) => (
                    <CheckboxSelector
                      key={idx}
                      id="action_category"
                      item={{ content: category }}
                      idx={idx}
                    />
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
                      onChange={(e) =>
                        dispatch(setFilters({ item: e.target.value }))
                      }
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
                  uniqueKey="activity_date_range"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="w-[calc(100vw-25rem)] h-[calc(100vh-11rem)] overflow-y-auto right-0">
          <div className="space-y-3">
            <div className="flex w-full max-w-full bg-wBrand-background_light/60 text-wBrand-accent text-xs p-3 font-semibold sticky top-0 px-8 rounded-xl">
              <div className="w-[10%] text-left">ID</div>
              <div className="w-[40%] ">ITEM</div>
              <div className="w-[20%] ">BY</div>
              <div className="w-[20%] ">DATE</div>
              <div className="w-[10%] text-right">ACTION</div>
            </div>
            {filteredActivities.map((activity, idx) => (
              <ActionTableRow key={idx} activity={activity} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Page;
