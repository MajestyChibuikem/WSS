"use client";
import {
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  ChevronDown,
  LoaderCircle,
  Plus,
} from "lucide-react";
import { wineInventory } from "./utils/mock_data";
import TableRowDashboard from "./components/table_row_dashboard";
import { useEffect, useState } from "react";
import { DatePickerWithRange } from "./components/range_calendar";
import {
  useCompareSalesQuery,
  useGetAllLogsQuery,
  useGetInventoryValueQuery,
  useGetRevenueQuery,
  useGetStockByCategoryQuery,
  useGetTopWinesQuery,
  useGetTotalWineStockQuery,
  useGetUsersQuery,
  useGetWinesQuery,
} from "./store/slices/apiSlice";
import { RootState } from "./store";
import { useDispatch, useSelector } from "react-redux";
import {
  calculateRevenueChange,
  convertGrowthFactorToPercentage,
  formatDecimal,
  formatNumber,
  getInitials,
  getRoleEnum,
} from "./utils/helpers";
import { toast } from "react-toastify";
import { updateAction } from "./store/slices/wineSlice";
import { toggleUserEditor } from "./store/slices/userSlice";
import { Actions, Roles } from "./utils/types";
import NewUserSideBar from "./components/new_user_sidebar";
import { setActivities } from "./store/slices/activitySlice";
import ActionRowCard from "./components/action_row_card";

export default function Home() {
  const dispatch = useDispatch();
  const calendarRange = useSelector(
    (state: RootState) => state.stats.calendarRanges["dashboard_date_range"]
  );
  const {
    data: revenueData,
    error: revenueErr,
    isLoading: loadingRevenue,
  } = useGetRevenueQuery({
    start_date: calendarRange.period1_start_date,
    end_date: calendarRange.period1_end_date,
  });
  const {
    data: stockCategoryData,
    error: stockCategoryErr,
    isLoading: loadingStockCategory,
  } = useGetStockByCategoryQuery();
  const {
    data: totalWineStock,
    error: totalWineStockErr,
    isLoading: loadingTotalWineStock,
  } = useGetTotalWineStockQuery();
  const {
    data: compareSales,
    error: compareSalesErr,
    isLoading: loadingcompareSales,
  } = useCompareSalesQuery();

  const {
    data: totalStock,
    error: totalStockErr,
    isLoading: loadingTotalStock,
  } = useGetTotalWineStockQuery();

  const {
    data: userData,
    error: userDataErr,
    isLoading: userDataLoading,
  } = useGetUsersQuery();

  const {
    data: topWinesData,
    isLoading: loadingTopWines,
    error: topWinesErr,
  } = useGetTopWinesQuery();

  const defaultWine = {
    name: "N/A",
    total_revenue: "N/A",
    percentage_change: "N/A",
  };

  const topWines = [
    ...(topWinesData || []),
    defaultWine,
    defaultWine,
    defaultWine,
  ].slice(0, 3);

  const { data: wineData, error, isLoading } = useGetWinesQuery();
  const {
    data: inventoryValueData,
    error: inventoryValueErr,
    isLoading: loadingInventoryValue,
  } = useGetInventoryValueQuery();

  const {
    data: allLogs,
    error: allLogsError,
    isLoading: logsIsLoading,
  } = useGetAllLogsQuery({});

  const activities = useSelector(
    (state: RootState) => state.activity.activities
  );

  useEffect(() => {
    if (allLogs) {
      dispatch(setActivities(allLogs));
    }
  }, [JSON.stringify(allLogs)]);

  const userRole = getRoleEnum(
    localStorage.getItem("wineryUserRole")?.toLowerCase() ?? ""
  );

  if (error) {
    console.log("Couldn't fetch wine at this time");
  }

  if (topWinesErr) {
    console.log("Couldn't fetch top wines at this time");
  }

  if (inventoryValueErr) {
    console.log("Couldn't fetch wine at this time");
  }

  if (userRole == Roles.ADMIN && allLogsError) {
    console.log("Couldn't fetch inventory value at this time");
  }

  if (userRole == Roles.ADMIN && userDataErr) {
    console.log("Couldn't fetch users at this time");
  }

  if (totalStockErr) {
    console.log("Couldn't fetch total stock price");
  }

  const showUserEditor = useSelector(
    (state: RootState) => state.users.show_user_editor
  );

  if (
    isLoading ||
    logsIsLoading ||
    userDataLoading ||
    loadingTotalStock ||
    loadingInventoryValue ||
    loadingTopWines
  )
    return (
      <div className="h-[85vh] gap-4 w-full flex justify-center items-center">
        <LoaderCircle className="text-wBrand-accent animate-spin h-10 w-10" />
      </div>
    );

  return (
    <main className="w-[100vw] px-10 space-y-8 py-6 overflow-y-auto h-[calc(100vh-5rem)]">
      {showUserEditor && <NewUserSideBar />}
      {userRole == Roles.ADMIN && (
        <section className="flex gap-x-2 text-xs xl:pt-10 items-center">
          <button
            onClick={() => {
              dispatch(updateAction(Actions.CREATE));
              dispatch(toggleUserEditor());
            }}
            className="h-7 w-7 rounded-full flex items-center justify-center border border-wBrand-accent/50"
          >
            <Plus className="h-4 w-4 stroke-wBrand-accent" />
          </button>
          {userData?.users.map((user) => (
            <button className="flex gap-x-2 py-1 px-1 pr-3 items-center rounded-full border border-wBrand-foreground/10">
              <div className="p-1 flex items-center justify-center rounded-full bg-wBrand-accent text-xs">
                {getInitials(user.username)}
              </div>
              <p>{user.username}</p>
            </button>
          ))}

          {/* <button className="flex gap-x-2 h-8 px-2 pr-3 items-center rounded-full border border-wBrand-foreground/10">
          <div className="h-5 w-5 rounded-full bg-white"></div>
          <p>Alice Rice</p>
        </button> */}
        </section>
      )}

      <section className="w-full">
        <div className="flex justify-between">
          {/* <h1 className="text-2xl font-medium text-wBrand-foreground/20">Dashboard</h1> */}
          <div></div>
          {/* <div className="relative w-max">
            <DatePickerWithRange
              period1={false}
              triggerClassname="h-7 text-xs rounded-full px-3 bg-gray-400/30 items-center justify-center flex"
              uniqueKey="dashboard_date_range"
            />
          </div> */}
        </div>
      </section>

      <section className="flex flex-col xl:flex-row gap-20 justify-between items-center">
        <div className="space-y-2 text-center xl:text-left">
          <h3 className="font-medium">Revenue</h3>
          <div className="flex items-center gap-4">
            {revenueData && revenueData.revenue !== undefined && (
              <h4 className="text-4xl font-semibold">
                {revenueData.revenue &&
                  formatDecimal(
                    revenueData.revenue as number
                  ).formatted.toString()}
                <span className="text-wBrand-foreground/40">
                  .
                  {revenueData.revenue &&
                    formatDecimal(
                      revenueData.revenue as number
                    ).decimal.toString()}
                </span>
              </h4>
            )}

            <div className="flex gap-x-1">
              <div className="h-5 text-xs flex items-center px-1 rounded-full bg-wBrand-accent text-black w-max">
                {compareSales &&
                compareSales.percentage_change &&
                compareSales.percentage_change > 0 ? (
                  <ArrowUpNarrowWide className="h-3 w-3" />
                ) : (
                  <ArrowDownNarrowWide className="h-3 w-3" />
                )}
                {compareSales && compareSales.growth_factor && (
                  <p>
                    {(compareSales.percentage_change as number).toString()}%
                  </p>
                )}
              </div>
              {revenueData &&
                revenueData.revenue &&
                compareSales &&
                compareSales.growth_factor && (
                  <div className="h-5 text-xs flex items-center px-1 rounded-full bg-wBrand-accent text-black w-max">
                    {formatDecimal(
                      ((compareSales.current_month_sales as number) -
                        compareSales.previous_month_sales) as number
                    ).formatted.toString()}
                  </div>
                )}
            </div>
          </div>
          <div className="text-xs font-medium flex gap-1 text-gray-400 items-center">
            {revenueData &&
              revenueData.revenue &&
              compareSales &&
              compareSales.growth_factor && (
                <p>
                  vs. prev.{" "}
                  {formatDecimal(
                    compareSales.previous_month_sales as number
                  ).formatted.toString()}{" "}
                </p>
              )}
            <p>of last month</p>
            {/* <div className="flex w-max items-center">
              <DatePickerWithRange
                period1={true}
                triggerClassname="flex w-max h-6 text-xs"
                className="border-none"
                uniqueKey="dashboard_date_range"
              />
              <ChevronDown className="h-4" />
            </div> */}
          </div>
        </div>

        <div className="flex gap-x-4">
          <div className="relative w-max">
            <div className="w-[13rem] h-[6rem] flex flex-col justify-center border relative z-10 border-wBrand-foreground/30 bg-wBrand-background rounded-xl p-3 space-y-1">
              <h5 className="text-xs text-gray-400 font-medium">
                Total bottles in stock
              </h5>
              <h4 className="text-xl font-semibold">
                {totalWineStock && totalWineStock.total_stock}
              </h4>
              <div className="flex justify-between text-xs gap-2 text-gray-300 overflow-x-auto">
                {stockCategoryData &&
                  Object.entries(stockCategoryData.stock_by_category).map(
                    ([category, value]) => (
                      <div key={category} className="flex gap-x-1">
                        <p>{category}: </p>
                        <p>
                          {
                            //@ts-ignore
                            formatNumber(parseFloat(value))
                          }
                        </p>
                      </div>
                    )
                  )}
              </div>
            </div>
            <div className="w-[11.3rem] h-[4rem] -top-2 translate-x-[50%] right-[50%] absolute rounded-xl bg-wBrand-foreground/10"></div>
          </div>

          <div className="relative w-max">
            <div className="w-[13rem] h-[6rem] flex flex-col justify-center border relative z-10 border-wBrand-foreground/30 bg-wBrand-background rounded-xl p-3 space-y-1">
              <h5 className="text-xs text-gray-400 font-medium">
                Total Value of Inventory
              </h5>
              <h4 className="text-xl font-semibold">
                {
                  formatDecimal(
                    //@ts-ignore
                    Object.values(inventoryValueData).reduce(
                      //@ts-ignore
                      (sum, value) => sum + parseFloat(value),
                      0
                    )
                  ).formatted
                }
              </h4>
              <div className="flex justify-between text-xs gap-2 text-gray-300 overflow-x-auto">
                {inventoryValueData &&
                  Object.entries(inventoryValueData).map(
                    ([category, value]) => (
                      <div key={category} className="flex gap-x-1">
                        <p>{category}: </p>
                        <p>
                          {
                            //@ts-ignore
                            formatNumber(parseFloat(value))
                          }
                        </p>
                      </div>
                    )
                  )}
              </div>
            </div>
            <div className="w-[11.3rem] h-[4rem] -top-2 translate-x-[50%] right-[50%] absolute rounded-xl bg-wBrand-foreground/10"></div>
          </div>

          <div className="relative">
            <h3 className=" font-medium absolute -top-8 text-wBrand-foreground/80">
              Top Bestsellers
            </h3>
            <div className="flex gap-x-2">
              {topWines.map((wine, index) => (
                <div
                  key={index}
                  className={`h-[6rem] w-[6rem] text-xs rounded-xl flex flex-col justify-center items-center p-1 gap-y-2 ${
                    index === 0
                      ? "bg-wBrand-accent/10"
                      : index === 1
                      ? "bg-gray-300/10"
                      : "bg-wBrand-background border border-wBrand-foreground/20"
                  }`}
                >
                  <h4 className="text-sm text-nowrap">
                    {wine.name.length > 10
                      ? `${wine.name.slice(0, 10)}...`
                      : wine.name}
                  </h4>
                  <p className="rounded-full px-2 py-1 w-max border border-wBrand-foreground/30">
                    {wine.total_revenue !== "N/A"
                      ? `${formatNumber(
                          wine.total_revenue as number
                        ).toLocaleString()}`
                      : "N/A"}
                  </p>
                  <p>
                    {wine.percentage_change !== "N/A"
                      ? `+${wine.percentage_change}%`
                      : "N/A"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* <section className="py-3">
        <div className="p-1 bg-gray-300/5 mx-auto w-max relative rounded-full flex gap-4">
          <div className="flex justify-between w-max bg-wBrand-background rounded-full items-center p-1 px-2 gap-x-20">
            <div className="flex gap-3 items-center">
              <div className="h-5 w-5 rounded-full bg-white"></div>
              <h4 className="text-sm font-medium">N109,000</h4>
            </div>
            <p className="text-gray-300/40 text-xs">32.82%</p>
          </div>
          <div className="flex justify-between w-max bg-wBrand-background rounded-full items-center p-1 px-2 gap-x-20">
            <div className="flex gap-3 items-center">
              <div className="h-5 w-5 rounded-full bg-white"></div>
              <h4 className="text-sm font-medium">N109,000</h4>
            </div>
            <p className="text-gray-300/40 text-xs">32.82%</p>
          </div>
          <div className="flex justify-between w-max bg-wBrand-background rounded-full items-center p-1 px-2 gap-x-20">
            <div className="flex gap-3 items-center">
              <div className="h-5 w-5 rounded-full bg-white"></div>
              <h4 className="text-sm font-medium">N109,000</h4>
            </div>
            <p className="text-gray-300/40 text-xs">32.82%</p>
          </div>
          <div className="flex justify-between w-max bg-wBrand-background rounded-full items-center p-1 px-2 gap-x-20">
            <div className="flex gap-3 items-center">
              <div className="h-5 w-5 rounded-full bg-white"></div>
              <h4 className="text-sm font-medium">N109,000</h4>
            </div>
            <p className="text-gray-300/40 text-xs">32.82%</p>
          </div>
        </div>
      </section> */}

      <section className="flex gap-10 pt-10">
        <div className="w-[50%] space-y-4">
          <h3 className="text-xl font-medium">Inventory</h3>
          <div className="space-y-4">
            {wineData &&
              wineData?.wines
                .slice(0, 5)
                .map((wine, idx) => (
                  <TableRowDashboard key={idx} wine={wine} />
                ))}
          </div>
        </div>
        <div className="w-[50%] space-y-4">
          <h3 className="text-xl font-medium">Latest Activity</h3>
          <div className="grid grid-cols-2 gap-6 gap-y-4">
            {activities.slice(0, 10).map((activity, idx) => (
              <ActionRowCard key={idx} activity={activity} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
