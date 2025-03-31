"use client";
import React, { useEffect, useState } from "react";
import TableRow from "../components/table_row";
import { dropdownItems, wineCategories } from "../utils/mock_data";
import {
  DollarSign,
  LoaderCircle,
  Search,
  ShoppingBasketIcon,
  Wine,
} from "lucide-react";
import NewWineSideBar from "../components/new_wine_sidebar";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { toggleWineEditor, updateAction } from "../store/slices/wineSlice";
import CheckboxSelector from "../components/checkbox_selector";
import {
  clearFilter,
  setWineData,
  updateInventoryFilter,
} from "../store/slices/inventorySlice";
import {
  useGetTotalWineStockQuery,
  useGetWinesQuery,
} from "../store/slices/apiSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import Empty from "../components/empty";
import { Actions, Wine as IWine, Roles } from "../utils/types";
import { getRoleEnum } from "../utils/helpers";
import { toast } from "react-toastify";
import clsx from "clsx";
import { useRouter } from "next/navigation";

function Page() {
  const router = useRouter();
  const showWineEditor = useSelector(
    (state: RootState) => state.winer.show_wine_editor
  );
  const inventoryFilter = useSelector(
    (state: RootState) => state.inventory.inventoryFilter
  );
  const selectedItems = useSelector(
    (state: RootState) =>
      state.checkboxSelector.selectors["inventory_product_category"]?.items ||
      {}
  );
  const inventory = useSelector((state: RootState) => state.inventory);
  const dispatch = useDispatch();
  const categoryArr = Object.values(selectedItems).map((item) => item.content);

  const { data: wineData, error, isLoading } = useGetWinesQuery();

  useEffect(() => {
    if (wineData && wineData.wines) {
      dispatch(setWineData(wineData.wines));
    }
  }, [wineData]);

  useEffect(() => {
    if (categoryArr.length === 0 && inventoryFilter.categories?.length) {
      dispatch(clearFilter());
    } else if (categoryArr.length > 0) {
      const prevCategories = inventoryFilter.categories || [];
      if (JSON.stringify(prevCategories) !== JSON.stringify(categoryArr)) {
        dispatch(updateInventoryFilter({ categories: categoryArr }));
      }
    }
  }, [categoryArr, inventoryFilter.categories, dispatch]);

  const {
    data: totalWineStock,
    error: totalWineStockErr,
    isLoading: loadingTotalWineStock,
  } = useGetTotalWineStockQuery();

  if (isLoading || loadingTotalWineStock)
    return (
      <div className="h-[85vh] w-full flex justify-center items-center">
        <LoaderCircle className="text-wBrand-accent animate-spin stroke-wBrand-accent h-10 w-10" />
      </div>
    );
  if (error) {
    toast.error("Couldn't fetch total stock price");
    return <p>Error fetching wines</p>;
  }

  if (totalWineStockErr) {
    toast.error("Couldn't fetch wine stock currently");
  }

  const userRole = getRoleEnum(
    localStorage.getItem("wineryUserRole")?.toLowerCase() ?? ""
  );

  return (
    <div className="">
      {showWineEditor && <NewWineSideBar />}
      <div className="flex items-start h-[4rem] bg-wBrand-background sticky px-10 w-[100vw]  top-[5rem]">
        <div className="w-[calc(25rem)] flex items-baseline justify-between">
          <h1 className="text-2xl font-medium">Inventory</h1>
          <p className="border border-wBrand-foreground/20 px-3 text-sm rounded-full py-1">
            {totalWineStock && totalWineStock.total_stock}{" "}
            <span className="text-xs text-gray-300">wines in available</span>
          </p>
        </div>

        <div className="flex justify-between items-center pl-9 w-[calc(100vw-22rem)]">
          <div className="flex w-[70%] gap-5">
            {wineData && (
              <div className="icon-input w-full">
                <Search className="h-4" />
                <input
                  type="text"
                  value={inventoryFilter.name}
                  onChange={(e) =>
                    dispatch(updateInventoryFilter({ name: e.target.value }))
                  }
                  className="outline-none h-full bg-transparent w-full"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {userRole !== Roles.STAFF && (
              <button
                onClick={() => {
                  dispatch(toggleWineEditor());
                  dispatch(dispatch(updateAction(Actions.CREATE)));
                }}
                className="px-5 py-2 bg-wBrand-accent text-nowrap text-wBrand-background rounded-xl"
              >
                Add Wine
              </button>
            )}

            <button
              disabled={inventory.cart.length == 0}
              onClick={() => router.push("/cart")}
              className={clsx(
                "px-4 py-2 border rounded-xl h-full relative",
                inventory.cart.length > 0
                  ? "border-wBrand-accent text-wBrand-accent"
                  : "border-gray-50/30 text-gray-50/30"
              )}
            >
              <ShoppingBasketIcon className="h-5" />
              <div
                className={clsx(
                  "size-5 flex items-center -top-1 -right-1 justify-center font-bold rounded-full absolute",
                  inventory.cart.length > 0
                    ? "bg-wBrand-accent text-wBrand-background"
                    : "bg-gray-800 text-gray-600"
                )}
              >
                <p className="text-xs">{inventory.cart.length}</p>
              </div>
            </button>
          </div>
        </div>
      </div>
      <div className="flex w-[100vw]">
        <div className="w-[25rem] h-[100vh]">
          <div className="fixed w-[24rem] h-[calc(100vh-9rem)] top-[9rem] p-10 pr-0 pt-0 left-0">
            <div className="rounded-lg space-y-8 py-10 overflow-y-auto relative bg-wBrand-background_light/60 h-full">
              <div className="space-y-4 px-6">
                <p className="text-xs text-wBrand-foreground/60 font-medium">
                  PRODUCT CATEGORY
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {wineCategories.map((category, idx) => (
                    <CheckboxSelector
                      key={idx}
                      id="inventory_product_category"
                      item={category}
                      idx={idx}
                    />
                  ))}
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
                      value={inventoryFilter.price_range.min}
                      onChange={(e) => {
                        dispatch(
                          updateInventoryFilter({
                            price_range: {
                              min: (e.target.value as unknown) as number,
                              max: inventoryFilter.price_range.max,
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
                      value={inventoryFilter.price_range.max}
                      onChange={(e) => {
                        dispatch(
                          updateInventoryFilter({
                            price_range: {
                              min: inventoryFilter.price_range.min,
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
              </div>
              <div className="text-sm relative space-y-4 px-6">
                <p className="text-xs text-wBrand-foreground/60 font-medium">
                  SORT ORDER
                </p>
                <Select>
                  <SelectTrigger className="w-full p-3 h-max outline-none rounded-xl">
                    <SelectValue placeholder={inventoryFilter.sort_by} />
                  </SelectTrigger>
                  <SelectContent className="bg-wBrand-background mt-2">
                    {dropdownItems.map((item, idx) => (
                      <SelectItem
                        className="p-3 cursor-pointer"
                        onClick={() => {
                          dispatch(
                            updateInventoryFilter({ sort_by: item.value })
                          );
                        }}
                        key={idx}
                        value={item.value.toString()}
                      >
                        {item.content}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* <Dropdown id="inventory_abv_range" items={dropdownItems} /> */}
              </div>
              <div className="space-y-4 px-6">
                <p className="text-xs text-wBrand-foreground/60 font-medium">
                  ABV RANGE
                </p>
                <div className="text-sm">
                  <div className="flex w-full rounded-xl border border-wBrand-foreground/20 overflow-clip bg-wBrand-background/40">
                    <div className="border-r bg-wBrand-background border-wBrand-foreground/20 p-3">
                      <Wine className="h-4" />
                    </div>
                    <input
                      type="number"
                      placeholder="MIN ABV"
                      value={inventoryFilter.abv_range.min}
                      onChange={(e) => {
                        dispatch(
                          updateInventoryFilter({
                            abv_range: {
                              min: (e.target.value as unknown) as number,
                              max: inventoryFilter.abv_range.max,
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
                      <Wine className="h-4" />
                    </div>
                    <input
                      type="number"
                      placeholder="MAX ABV"
                      value={inventoryFilter.abv_range.max}
                      onChange={(e) => {
                        dispatch(
                          updateInventoryFilter({
                            abv_range: {
                              min: inventoryFilter.abv_range.min,
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
              </div>
            </div>
          </div>
        </div>
        <div className="px-8 w-[calc(100vw-25rem)] h-[calc(100vh-11rem)] pb-10 overflow-y-auto">
          <div className="space-y-2">
            {!inventory.filteredData ? (
              <Empty
                info={
                  "there seems to currently be an issue with the server... Try again later"
                }
              />
            ) : (
              inventory.filteredData &&
              inventory.filteredData.map((wine, idx) => (
                <TableRow
                  id={"inventory_wine_card_" + idx}
                  key={idx}
                  wine={wine}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
