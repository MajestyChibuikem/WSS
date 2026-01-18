"use client";
import React, { useEffect, useState } from "react";
import ActionTableRow from "../components/action_table_row";
import { DollarSign, Filter, LoaderCircle, User, X } from "lucide-react";
import { actions } from "../utils/mock_data";
import { DatePickerWithRange } from "../components/range_calendar";
import { useGetAllLogsQuery } from "../store/slices/apiSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import {
  clearFilters,
  setActivities,
  setFilters,
} from "../store/slices/activitySlice";
import CheckboxSelector from "../components/checkbox_selector";
import clsx from "clsx";
import { SalesPageSkeleton } from "../components/skeleton";

function Page() {
  const [filterOpen, setFilterOpen] = useState(false);
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

  return (
    <div className="w-full px-4 lg:px-10">
      <div className="flex items-center justify-between sticky top-0 h-[4rem] bg-wBrand-background z-10">
        <h1 className="text-xl lg:text-2xl font-medium">Activity Log</h1>
        <button
          onClick={() => setFilterOpen(true)}
          className="lg:hidden p-2 border border-wBrand-foreground/20 rounded-lg"
        >
          <Filter className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile filter overlay */}
      {filterOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setFilterOpen(false)}
        />
      )}

      <section className="w-full flex">
        {/* Sidebar */}
        <div
          className={clsx(
            "fixed lg:relative z-50 lg:z-auto",
            "w-[85vw] sm:w-[320px] lg:w-[320px] xl:w-[380px]",
            "h-full lg:h-auto",
            "top-0 left-0",
            "transform transition-transform duration-300 lg:transform-none",
            filterOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <div className="lg:fixed lg:w-[300px] xl:w-[360px] lg:h-[calc(100vh-9rem)] lg:top-[9rem] lg:left-0 lg:p-10 lg:pr-0 lg:pt-0 h-full">
            <div className="rounded-none lg:rounded-lg space-y-8 py-10 overflow-y-auto relative bg-wBrand-background lg:bg-wBrand-background_light/60 h-full">
              {/* Mobile header */}
              <div className="flex items-center justify-between px-6 lg:hidden">
                <h2 className="text-lg font-medium">Filters</h2>
                <button onClick={() => setFilterOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
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

        {/* Activity list */}
        <div className="flex-1 min-h-[calc(100vh-11rem)] overflow-y-auto pb-20">
          {isLoading ? (
            <SalesPageSkeleton />
          ) : (
            <div className="space-y-3">
              {/* Table header - hidden on mobile */}
              <div className="hidden sm:flex w-full max-w-full bg-wBrand-background_light/60 text-wBrand-accent text-xs p-3 font-semibold sticky top-0 px-4 lg:px-8 rounded-xl">
                <div className="w-[10%] text-left">ID</div>
                <div className="w-[40%]">ITEM</div>
                <div className="w-[20%]">BY</div>
                <div className="w-[20%]">DATE</div>
                <div className="w-[10%] text-right">ACTION</div>
              </div>
              {filteredActivities.length === 0 && (
                <div className="w-full flex items-center justify-center text-xl lg:text-2xl font-semibold text-wBrand-accent/20 h-[30vh]">
                  <p>No activity logs found</p>
                </div>
              )}
              {filteredActivities.map((activity, idx) => (
                <ActionTableRow key={idx} activity={activity} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Page;
