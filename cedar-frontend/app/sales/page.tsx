"use client";
import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  DollarSign,
  LoaderCircle,
  User,
} from "lucide-react";
import { DatePickerWithRange } from "../components/range_calendar";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import SalesTableRow from "../components/sales_table_row";
import { useSales } from "../hooks/useSales";
import { setSales, setSalesFilters } from "../store/slices/salesSlice";
import { useUserSales } from "../hooks/useUserSales";
import { getRoleEnum } from "../utils/helpers";
import { Roles } from "../utils/types";

function Page() {
  const { sales: data, loading, pagination, fetchSales } = useSales();
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

  useEffect(() => {
    if (isAdmin) {
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

  if (loading || loadingUserSales)
    return (
      <div className="h-[85vh] w-full flex justify-center items-center">
        <LoaderCircle className="text-wBrand-accent animate-spin stroke-wBrand-accent h-10 w-10" />
      </div>
    );

  return (
    <div className="w-[100vw] px-10">
      <h1 className="text-2xl font-medium sticky top-[5rem] h-[4rem] items-center flex bg-wBrand-background">
        Sales
      </h1>
      <section className="w-full flex">
        <div className="w-[25rem] h-[100vh]">
          <div className="fixed w-[24rem] h-[calc(100vh-9rem)] top-[9rem] p-10 pr-0 pt-0 left-0">
            <div className="rounded-lg space-y-8 py-10 overflow-y-auto relative bg-wBrand-background_light/60 h-full">
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
                              max: (e.target.value as unknown) as number,
                            },
                          })
                        );
                      }}
                      className="outline-none min-h-full pl-4 bg-transparent w-full"
                    />
                  </div>
                </div>
              </div>
              {/* <div className="relative w-max px-6 space-y-4">
                <p className="text-xs text-wBrand-foreground/60 font-medium">
                  FILTER BY DATE RANGE
                </p>
                <DatePickerWithRange
                  period1={true}
                  className="!w-full bg-transparent"
                  triggerClassname="h-max text-xs bg-wBrand-background/40 rounded-xl px-4 py-3 !w-full border border-wBrand-foreground/20 items-center justify-center flex"
                  uniqueKey="sales_date_range"
                />
              </div> */}
            </div>
          </div>
        </div>
        <div className="w-[calc(100vw-25rem)] h-[calc(100vh-11rem)] overflow-y-auto pb-20">
          <div className="space-y-3">
            <div className="flex w-full gap-x-6 max-w-full bg-wBrand-background_light/60 text-wBrand-accent text-xs p-3 font-semibold sticky top-0 px-8 rounded-xl">
              <div className="w-[10%] text-left">ID</div>
              <div className="w-[40%] ">ITEM</div>
              <div className="w-[20%] ">BY</div>
              <div className="w-[20%] ">DATE</div>
              <div className="w-[10%] text-right">COST</div>
            </div>
            {filteredSales.length == 0 && (
              <div className="w-full flex items-center justify-center text-2xl font-semibold text-wBrand-accent/20 h-[30vh]">
                <p>You haven't made any sales yet</p>
              </div>
            )}
            {filteredSales.map((sales, idx) => (
              <SalesTableRow sales={sales} key={idx} />
            ))}
          </div>
          <div className="flex justify-end items-center space-x-4 mt-4">
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
          </div>
        </div>
      </section>
    </div>
  );
}

export default Page;
