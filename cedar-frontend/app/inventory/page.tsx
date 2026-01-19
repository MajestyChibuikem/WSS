"use client";
import React, { useEffect, useState } from "react";
import TableRow from "../components/table_row";
import { dropdownItems, productCategories, SortOrder } from "../utils/mock_data";
import {
  DollarSign,
  Filter,
  ForkKnifeCrossed,
  LoaderCircle,
  Search,
  ShoppingBasketIcon,
  Wine,
  X,
} from "lucide-react";
import NewWineSideBar from "../components/new_product_sidebar";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import {
  toggleProductEditor,
  updateAction,
} from "../store/slices/productSlice";
import {
  clearFilter,
  setProductData,
  updateInventoryFilter,
} from "../store/slices/inventorySlice";
import {
  useGetProductsQuery,
  useGetTotalProductStockQuery,
} from "../store/slices/apiSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import Empty from "../components/empty";
import { Actions, Product as IProduct, Roles } from "../utils/types";
import { getRoleEnum } from "../utils/helpers";
import { toast } from "react-toastify";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { InventoryPageSkeleton } from "../components/skeleton";

function Page() {
  const router = useRouter();
  const [filterOpen, setFilterOpen] = useState(false);
  const showWineEditor = useSelector(
    (state: RootState) => state.products.show_product_editor
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

  const { data: productData, error, isLoading } = useGetProductsQuery();

  useEffect(() => {
    if (productData && productData.products) {
      dispatch(setProductData(productData.products));
    }
  }, [productData]);

  const {
    data: totalWineStock,
    error: totalWineStockErr,
    isLoading: loadingTotalWineStock,
  } = useGetTotalProductStockQuery();

  if (totalWineStockErr) {
    toast.error("Couldn't fetch product stock currently");
  }

  const userRole = getRoleEnum(
    localStorage.getItem("wineryUserRole")?.toLowerCase() ?? ""
  );

  return (
    <div className="min-h-screen">
      {showWineEditor && <NewWineSideBar />}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 bg-wBrand-background sticky px-4 lg:px-10 py-4 top-0 z-10">
        <div className="flex items-center justify-between lg:w-auto">
          <div className="flex items-baseline gap-4">
            <h1 className="text-xl lg:text-2xl font-medium">Inventory</h1>
            <p className="border border-wBrand-foreground/20 px-2 lg:px-3 text-xs lg:text-sm rounded-full py-1">
              {totalWineStock && totalWineStock.total_stock}{" "}
              <span className="text-xs text-gray-300 hidden sm:inline">products</span>
            </p>
          </div>

          {/* Mobile filter button */}
          <button
            onClick={() => setFilterOpen(true)}
            className="lg:hidden p-2 border border-wBrand-foreground/20 rounded-lg"
          >
            <Filter className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col sm:flex-row gap-3 lg:pl-9">
          <div className="flex-1">
            {productData && (
              <div className="icon-input w-full">
                <Search className="h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
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
            {userRole !== Roles.STAFF && userRole !== Roles.SUPER_USER && (
              <button
                onClick={() => {
                  dispatch(toggleProductEditor());
                  dispatch(dispatch(updateAction(Actions.CREATE)));
                }}
                className="px-4 lg:px-5 py-2 bg-wBrand-accent text-nowrap text-sm text-wBrand-background rounded-xl"
              >
                Add product
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

      {/* Mobile filter overlay */}
      {filterOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setFilterOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex">
        {/* Sidebar - hidden on mobile by default */}
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
                  PRODUCT CATEGORY
                </p>
                <div className="text-sm">
                  <div className="flex w-full rounded-xl border border-wBrand-foreground/20 overflow-clip bg-wBrand-background/40">
                    <div className="border-r bg-wBrand-background border-wBrand-foreground/20 p-3">
                      <ForkKnifeCrossed className="h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="ENTER PRODUCT CATEGORY"
                      value={inventoryFilter.categories}
                      onChange={(e) => {
                        dispatch(
                          updateInventoryFilter({
                            categories: e.target.value,
                          })
                        );
                      }}
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
                <Select
                  value={inventoryFilter.sort_by}
                  onValueChange={(value) => {
                    dispatch(
                      updateInventoryFilter({ sort_by: value as SortOrder })
                    );
                  }}
                >
                  <SelectTrigger className="w-full p-3 h-max outline-none rounded-xl">
                    <SelectValue placeholder="Select order" />
                  </SelectTrigger>
                  <SelectContent className="bg-wBrand-background mt-2">
                    {dropdownItems.map((item, idx) => (
                      <SelectItem
                        className="p-3 cursor-pointer"
                        key={idx}
                        value={item.value.toString()}
                      >
                        {item.content}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Product list */}
        <div className="flex-1 px-4 lg:px-8 pb-10">
          <div className="space-y-2">
            {isLoading || loadingTotalWineStock ? (
              <InventoryPageSkeleton />
            ) : error ? (
              <Empty
                info={
                  "There seems to currently be an issue with the server... Try again later"
                }
              />
            ) : !inventory.filteredData ? (
              <Empty
                info={
                  "There seems to currently be an issue with the server... Try again later"
                }
              />
            ) : inventory.filteredData.length == 0 ? (
              <Empty
                info={
                  "Inventory is currently empty, please add some products to begin sales"
                }
              />
            ) : (
              inventory.filteredData &&
              inventory.filteredData.map((product, idx) => (
                <TableRow
                  id={"inventory_product_card_" + idx}
                  key={idx}
                  product={product}
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
