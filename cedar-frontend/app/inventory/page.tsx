"use client";
import React from "react";
import TableRow from "../components/table_row";
import {
  dropdownItems,
  wineCategories,
  wineInventory,
} from "../utils/mock_data";
import { DollarSign, Search, Wine } from "lucide-react";
import Dropdown from "../components/dropdown";
import NewWineSideBar from "../components/new_wine_sidebar";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { toggleWineEditor, updateAction } from "../store/slices/wineSlice";
import CheckboxSelector from "../components/checkbox_selector";
import { updateInventoryFilter } from "../store/slices/inventorySlice";
import { useGetWinesQuery } from "../store/slices/apiSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import Empty from "../components/empty";
import { Actions } from "../utils/types";

function Page() {
  const showWineEditor = useSelector(
    (state: RootState) => state.winer.show_wine_editor
  );
  const inventoryFilter = useSelector(
    (state: RootState) => state.inventory.inventoryFilter
  );
  const dispatch = useDispatch();

  const { data: wineData, error, isLoading } = useGetWinesQuery();

  console.log("wines", wineData, wineData?.wines.length);

  if (isLoading) return <p>Loading...</p>;
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

        <div className="flex justify-between items-center px-10 w-[calc(100vw-22rem)]">
          <div className="icon-input">
            <Search className="h-4" />
            <input
              type="text"
              className="outline-none h-full bg-transparent w-full"
            />
          </div>

          <div>
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
            <div className="rounded-lg space-y-8 pt-10 overflow-y-auto relative bg-wBrand-background_light/60 h-full">
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
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {dropdownItems.map((item, idx) => (
                      <SelectItem key={idx} value={item.value.toString()}>
                        {item.content}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Dropdown id="inventory_abv_range" items={dropdownItems} />
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
              <div className="bg-wBrand-background_light px-10 h-[5.5rem] flex items-center w-full justify-center sticky bottom-0">
                <button className="px-5 py-2 bg-wBrand-accent w-full text-wBrand-background rounded-xl">
                  Filter
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="px-8 w-[calc(100vw-25rem)]">
          <div className="space-y-2">
            {!wineData ? (
              <Empty
                info={
                  "there seems to currently be an issue with the server... Try again later"
                }
              />
            ) : wineData.wines.length == 0 ? (
              <Empty info={"Inventory is currently empty."} />
            ) : (
              wineData.wines.map((wine, idx) => (
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
