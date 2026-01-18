"use client";
import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  DollarSign,
  Filter,
  LoaderCircle,
  User,
  X,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import SalesTableRow from "../components/sales_table_row";
import { useSales } from "../hooks/useSales";
import { setSales, setSalesFilters } from "../store/slices/salesSlice";
import { useUserSales } from "../hooks/useUserSales";
import { getRoleEnum } from "../utils/helpers";
import { Roles } from "../utils/types";
import clsx from "clsx";
import { SalesPageSkeleton } from "../components/skeleton";

function Page() {
  const { sales: data, loading, pagination, fetchSales } = useSales();
  const [onlyToday, setOnlyToday] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const {
    sales: userSalesData,
    loading: loadingUserSales,
    pagination: userSalesPagination,
    fetchSales: fetchUserSales,
  } = useUserSales();
  const dispatch = useDispatch();
  const { filteredSales, filters: salesFilter } = useSelector(
    (state: RootState) => state.sales
  );

  const userRole = getRoleEnum(
    localStorage.getItem("wineryUserRole")?.toLowerCase() ?? ""
  );

  const isAdmin = userRole && userRole == Roles.ADMIN ? true : false;
  const isSuperuser = userRole && userRole == Roles.SUPER_USER ? true : false;

  useEffect(() => {
    if (isAdmin || isSuperuser) {
      dispatch(setSales(data));
    } else if (!isAdmin) {
      dispatch(setSales(userSalesData));
    }
  }, [data, isAdmin]);

  const [currentPage, setCurrentPage] = useState(1);

  const handleNextPage = () => {
    if (isAdmin && currentPage < pagination.totalPages) {
      setCurrentPage((prev) => prev + 1);
      fetchSales(currentPage + 1);
      return;
    }
    if (!isAdmin && currentPage < userSalesPagination.totalPages) {
      setCurrentPage((prev) => prev + 1);
      fetchUserSales(currentPage + 1);
    }
  };

  const calendarRange = useSelector(
    (state: RootState) => state.stats.calendarRanges["sales_date_range"]
  );

  useEffect(() => {
    if (onlyToday) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      dispatch(
        setSalesFilters({
          dateRange: {
            start: today.toISOString(),
            end: endOfToday.toISOString(),
          },
        })
      );
    } else {
      console.log("calendarRange: ", calendarRange);
      dispatch(
        setSalesFilters({
          dateRange: {
            start: "1970-01-01",
            end: "2100-01-01",
          },
        })
      );
    }
  }, [onlyToday, calendarRange]);

  useEffect(() => {
    if (!calendarRange) return;
    dispatch(
      setSalesFilters({
        dateRange: {
          start: calendarRange.period1_start_date,
          end: calendarRange.period1_end_date,
        },
      })
    );
  }, [calendarRange]);

  const handlePrevPage = () => {
    if (isAdmin && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      fetchSales(currentPage - 1);
    }
    if (!isAdmin && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      fetchUserSales(currentPage - 1);
    }
  };

  return (
    <div className="w-full px-4 lg:px-10">
      <div className="flex items-center justify-between sticky top-0 h-[4rem] bg-wBrand-background z-10">
        <h1 className="text-xl lg:text-2xl font-medium">Sales</h1>
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
                  FILTER BY USER
                </p>
                <div className="text-sm">
                  <div className="flex w-full rounded-xl border border-wBrand-foreground/20 overflow-clip bg-wBrand-background/40">
                    <div className="border-r bg-wBrand-background border-wBrand-foreground/20 p-3">
                      <User className="h-4" />
                    </div>
                    <input
                      type="text"
                      value={salesFilter.username}
                      onChange={(e) =>
                        dispatch(setSalesFilters({ username: e.target.value }))
                      }
                      placeholder="ENTER USER NAME"
                      className="outline-none min-h-full pl-4 bg-transparent w-full"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4 px-6">
                <p className="text-xs text-wBrand-foreground/60 font-medium">
                  PRICE RANGE
                </p>
                <div className="text-sm">
                  <div className="flex w-full rounded-xl border border-wBrand-foreground/20 overflow-clip bg-wBrand-background/40">
                    <div className="border-r bg-wBrand-background border-wBrand-foreground/20 p-3">
                      <DollarSign className="h-4" />
                    </div>
                    <input
                      type="number"
                      placeholder="MIN PRICE"
                      value={
                        salesFilter.priceRange && salesFilter.priceRange.min
                      }
                      onChange={(e) => {
                        dispatch(
                          setSalesFilters({
                            priceRange: {
                              min: (e.target.value as unknown) as number,
                              max: salesFilter.priceRange
                                ? salesFilter.priceRange.max
                                : Number.POSITIVE_INFINITY,
                            },
                          })
                        );
                      }}
                      className="outline-none min-h-full pl-4 bg-transparent w-full"
                    />
                  </div>
                  <div className="h-5 border w-0 ml-6 bg-wBrand-foreground/30 border-wBrand-foreground/5" />
                  <div className="flex w-full rounded-xl bg-wBrand-background/40 border border-wBrand-foreground/20 overflow-clip">
                    <div className="border-r bg-wBrand-background border-wBrand-foreground/20 p-3">
                      <DollarSign className="h-4" />
                    </div>
                    <input
                      type="number"
                      placeholder="MAX PRICE"
                      value={
                        salesFilter.priceRange && salesFilter.priceRange.max
                      }
                      onChange={(e) => {
                        dispatch(
                          setSalesFilters({
                            priceRange: {
                              min: salesFilter.priceRange
                                ? salesFilter.priceRange.min
                                : 0,
                              max:
                                e.target.value.toString() == ""
                                  ? Number.POSITIVE_INFINITY
                                  : ((e.target.value as unknown) as number),
                            },
                          })
                        );
                      }}
                      className="outline-none min-h-full pl-4 bg-transparent w-full"
                    />
                  </div>
                </div>
                <label className="space-y-4 px-4 flex group-checked:border-wBrand-accent cursor-pointer w-full rounded-xl bg-wBrand-background/40 border border-wBrand-foreground/20 overflow-clip py-3">
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={onlyToday}
                      onChange={(e) => setOnlyToday(e.target.checked)}
                      className="accent-wBrand-accent group bg-none checked:bg-wBrand-accent cursor-pointer border border-wBrand-accent rounded-md outline-none appearance-none size-5"
                    />
                    <span className="pl-2 cursor-pointer">
                      Show only today's sales
                    </span>
                  </label>
                </label>
              </div>

            </div>
          </div>
        </div>

        {/* Sales list */}
        <div className="flex-1 min-h-[calc(100vh-11rem)] overflow-y-auto pb-20">
          {loading || loadingUserSales ? (
            <SalesPageSkeleton />
          ) : (
            <div className="space-y-3">
              {/* Table header - hidden on mobile */}
              <div className="hidden sm:flex w-full gap-x-6 max-w-full bg-wBrand-background_light/60 text-wBrand-accent text-xs p-3 font-semibold sticky top-0 px-4 lg:px-8 rounded-xl">
                <div className="w-[10%] text-left">ID</div>
                <div className="w-[30%]">ITEM</div>
                <div className="w-[20%]">BY</div>
                <div className="w-[20%]">DATE</div>
                <div className="w-[10%] text-right">COST</div>
                <div className="w-[10%] text-center">RECEIPT</div>
              </div>
              {filteredSales.length == 0 && (
                <div className="w-full flex items-center justify-center text-xl lg:text-2xl font-semibold text-wBrand-accent/20 h-[30vh]">
                  <p>You haven't made any sales yet</p>
                </div>
              )}
              {filteredSales.map((sales, idx) => (
                <SalesTableRow sales={sales} key={idx} />
              ))}
            </div>
          )}
          {/* <div className="flex justify-end items-center space-x-4 mt-4">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-wBrand-accent rounded-xl disabled:opacity-50"
            >
              <ArrowLeft className="h-3" />
            </button>
            <span className="text-white">
              Page {currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === pagination.totalPages}
              className="px-2 py-2 rounded-xl bg-wBrand-accent disabled:opacity-50"
            >
              <ArrowRight className="h-3" />
            </button>
          </div> */}
        </div>
      </section>
    </div>
  );
}

export default Page;
