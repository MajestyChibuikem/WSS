"use client";
import React, { useEffect, useState } from "react";
import TableRow from "../components/table_row";
import {
  dropdownItems,
  wineCategories,
  wineInventory,
} from "../utils/mock_data";
import { DollarSign, LoaderCircle, Search, Wine } from "lucide-react";
import Dropdown from "../components/dropdown";
import NewWineSideBar from "../components/new_wine_sidebar";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { toggleWineEditor, updateAction } from "../store/slices/wineSlice";
import CheckboxSelector from "../components/checkbox_selector";
import {
  clearFilter,
  filterInventory,
  updateInventoryFilter,
} from "../store/slices/inventorySlice";
import { useGetWinesQuery } from "../store/slices/apiSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import Empty from "../components/empty";
import { Actions, Wine as IWine } from "../utils/types";

function Page() {
  const [data, setData] = useState<IWine[]>();
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

  const { data: wineData, error, isLoading } = useGetWinesQuery();
  const categoryArr: string[] = Object.values(selectedItems).map(
    (item) => item.content
  );

  useEffect(() => {
    console.log("filtered: ", inventory.filteredData);
    if (inventory.filteredData.length > 0) {
      setData(inventory.filteredData);
    } else if (wineData && wineData.wines.length > 0) {
      setData(wineData.wines);
    }
  }, [wineData, inventory.filteredData]);

  console.log("categories: ", categoryArr);

  if (isLoading)
    return (
      <div className="h-[85vh] w-full flex justify-center items-center">
        <LoaderCircle className="text-wBrand-accent animate-spin stroke-wBrand-accent h-10 w-10" />
      </div>
    );
  if (error) return <p>Error fetching wines</p>;

  return (
    <div className="">
      {showWineEditor && <NewWineSideBar />}
      <div className="flex items-start h-[4rem] bg-wBrand-background sticky px-10 w-[100vw]  top-[5rem]">
        <div className="w-[calc(25rem)] flex items-baseline justify-between">
          <h1 className="text-2xl font-medium">Inventory</h1>
          <p className="border border-wBrand-foreground/20 px-3 text-sm rounded-full py-1">
            1078{" "}
            <span className="text-xs text-gray-300">wines in available</span>
          </p>
        </div>

        <div className="flex justify-between items-center pl-9 w-[calc(100vw-22rem)]">
          <div className="flex w-[70%] gap-5">
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
            {wineData && (
              <button
                onClick={() => {
                  dispatch(filterInventory({ wines: wineData.wines }));
                }}
                className="px-5 py-2 h-full bg-wBrand-accent text-wBrand-background rounded-xl"
              >
                Search
              </button>
            )}
          </div>

          <div className="">
            <button
              onClick={() => {
                dispatch(toggleWineEditor());
                dispatch(dispatch(updateAction(Actions.CREATE)));
              }}
              className="px-5 py-2 bg-wBrand-accent text-wBrand-background rounded-xl"
            >
              Add Product
            </button>
          </div>
        </div>
      </div>
      <div className="flex w-[100vw]">
        <div className="w-[25rem] h-[100vh]">
          <div className="fixed w-[24rem] h-[calc(100vh-9rem)] top-[9rem] p-10 pr-0 pt-0 left-0">
            <div className="rounded-lg space-y-8 pb-10 overflow-y-auto relative bg-wBrand-background_light/60 h-full">
              {wineData && wineData.wines.length != 0 && (
                <div className="bg-wBrand-background_light gap-4 px-10 h-[5.5rem] flex items-center w-full justify-center sticky top-0">
                  <button
                    onClick={() =>
                      dispatch(
                        filterInventory({
                          wines: wineData.wines,
                          categories: categoryArr,
                        })
                      )
                    }
                    className="px-5 py-2 bg-wBrand-accent w-full text-wBrand-background rounded-xl"
                  >
                    Filter
                  </button>
                  <button
                    onClick={() => dispatch(clearFilter())}
                    className="px-5 py-2 border border-white/40 w-full text-white rounded-xl"
                  >
                    Reset
                  </button>
                </div>
              )}
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
                      onChange={(e) =>
                        dispatch(
                          updateInventoryFilter({
                            price_range: {
                              min: (e.target.value as unknown) as number,
                              max: inventoryFilter.price_range.max,
                            },
                          })
                        )
                      }
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
                      onChange={(e) =>
                        dispatch(
                          updateInventoryFilter({
                            price_range: {
                              min: inventoryFilter.price_range.min,
                              max: (e.target.value as unknown) as number,
                            },
                          })
                        )
                      }
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
                        className="p-3"
                        onClick={() =>
                          dispatch(
                            updateInventoryFilter({ sort_by: item.value })
                          )
                        }
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
                      onChange={(e) =>
                        dispatch(
                          updateInventoryFilter({
                            abv_range: {
                              min: (e.target.value as unknown) as number,
                              max: inventoryFilter.abv_range.max,
                            },
                          })
                        )
                      }
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
                      onChange={(e) =>
                        dispatch(
                          updateInventoryFilter({
                            abv_range: {
                              min: inventoryFilter.abv_range.min,
                              max: (e.target.value as unknown) as number,
                            },
                          })
                        )
                      }
                      className="outline-none min-h-full pl-4 bg-transparent w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="px-8 w-[calc(100vw-25rem)]">
          <div className="space-y-2">
            {!data ? (
              <Empty
                info={
                  "there seems to currently be an issue with the server... Try again later"
                }
              />
            ) : (
              data &&
              data.map((wine, idx) => (
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
