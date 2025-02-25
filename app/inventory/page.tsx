import React from "react";
import TableRow from "../components/table_row";
import { wineCategories, wineInventory } from "../utils/mock_data";
import { ArrowDownAZ, ArrowUpAZ, DollarSign, Search, Wine } from "lucide-react";
import Dropdown from "../components/dropdown";

function Page() {
  return (
    <div className="">
      <div className="flex items-start h-[4rem] bg-background sticky px-10 w-[100vw]  top-[5rem]">
        <div className="w-[calc(25rem)] flex items-baseline justify-between">
          <h1 className="text-2xl font-medium">Inventory</h1>
          <p className="border border-foreground/20 px-3 text-sm rounded-full py-1">
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
            <button className="px-5 py-2 bg-accent text-background rounded-xl">
              Add Product
            </button>
          </div>
        </div>
      </div>
      <div className="flex w-[100vw]">
        <div className="w-[25rem] h-[100vh]">
          <div className="fixed w-[24rem] h-[calc(100vh-9rem)] top-[9rem] p-10 pr-0 pt-0 left-0">
            <div className="p-6 rounded-lg space-y-8 bg-background_light/60 h-full">
              <div className="space-y-4">
                <p className="text-xs text-foreground/60 font-medium">
                  PRODUCT CATEGORY
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {wineCategories.map((category, idx) => (
                    <button
                      key={idx}
                      className="border text-sm border-foreground/20 rounded-xl px-3 py-2 flex justify-between items-center"
                    >
                      <p>{category}</p>
                      <p className="p-1 px-2 text-xs bg-foreground/10 rounded-lg">
                        1078
                      </p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-xs text-foreground/60 font-medium">
                  PRICE RANGE
                </p>
                <div className="text-sm">
                  <div className="flex w-full rounded-xl border border-foreground/20 overflow-clip bg-background/40">
                    <div className="border-r bg-background border-foreground/20 p-3">
                      <DollarSign className="h-4" />
                    </div>
                    <input
                      type="number"
                      placeholder="MIN PRICE"
                      className="outline-none min-h-full pl-4 bg-transparent w-full"
                    />
                  </div>
                  <div className="h-5 border w-0 ml-6 bg-foreground/30 border-foreground/5" />
                  <div className="flex w-full rounded-xl bg-background/40 border border-foreground/20 overflow-clip">
                    <div className="border-r bg-background border-foreground/20 p-3">
                      <DollarSign className="h-4" />
                    </div>
                    <input
                      type="number"
                      placeholder="MAX PRICE"
                      className="outline-none min-h-full pl-4 bg-transparent w-full"
                    />
                  </div>
                </div>
              </div>
              <Dropdown />
              <div className="space-y-4">
                <p className="text-xs text-foreground/60 font-medium">
                  ABV RANGE
                </p>
                <div className="text-sm">
                  <div className="flex w-full rounded-xl border border-foreground/20 overflow-clip bg-background/40">
                    <div className="border-r bg-background border-foreground/20 p-3">
                      <Wine className="h-4" />
                    </div>
                    <input
                      type="number"
                      placeholder="MIN ABV"
                      className="outline-none min-h-full pl-4 bg-transparent w-full"
                    />
                  </div>
                  <div className="h-5 border w-0 ml-6 bg-foreground/30 border-foreground/5" />
                  <div className="flex w-full rounded-xl bg-background/40 border border-foreground/20 overflow-clip">
                    <div className="border-r bg-background border-foreground/20 p-3">
                      <Wine className="h-4" />
                    </div>
                    <input
                      type="number"
                      placeholder="MAX ABV"
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
            {wineInventory.map((wine, idx) => (
              <TableRow key={idx} wine={wine} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
