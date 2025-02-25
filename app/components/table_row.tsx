import { Ellipsis, ShoppingBasket } from "lucide-react";
import React from "react";
import { Wine } from "../utils/mock_data";

interface Params {
  wine: Wine;
}

function TableRow({ wine }: Params) {
  return (
    // <div className="flex text-sm rounded-xl items-center p-3 px-5 w-full justify-between gap-x-8">
    //   <div className="flex w-[25%]">
    //     <h2>Wine title</h2>
    //   </div>
    //   <div className="flex justify-center w-[20%]">
    //     <p>wine category</p>
    //   </div>
    //   <div className="flex justify-center w-[15%]">
    //     <p>10</p>
    //   </div>
    //   <div className="flex justify-center w-[10%]">
    //     <p>N100,000</p>
    //   </div>
    //   <div className="flex justify-center w-[25%]">
    //     <button className="text-sm flex items-center gap-2 p-4 justify-center h-[1.5rem] bg-accent/60 text-foreground rounded-lg">
    //       <ShoppingBasket className="h-4" />
    //       <p>Add to cart</p>
    //     </button>
    //   </div>
    //   <div className="flex justify-center w-[10%]">
    //     <button className="text-sm flex items-center gap-2 p-4 justify-center h-[1.5rem] rounded-lg">
    //       <Ellipsis className="h-4" />
    //     </button>
    //   </div>
    // </div>
    <div className="flex w-full rounded-xl bg-background_light/60 space-x-24 justify-between p-4">
      <div className="space-y-2">
        <h2 className="text-base font-medium">{wine.name}</h2>
        <div className="text-gray-400 flex items-center gap-2 text-xs">
          <p>
            ID: <span className="text-gray-200">#{wine.id}</span>
          </p>
          <div className="h-1 w-1 rounded-full bg-gray-400" />
          <p>
            NO IN STOCK: <span className="text-gray-200">{wine.inStock}</span>
          </p>
          <div className="h-1 w-1 rounded-full bg-gray-400" />
          <p>
            ABV: <span className="text-gray-200">{wine.abv}%</span>
          </p>
          <div className="h-1 w-1 rounded-full bg-gray-400" />
          <p>
            BOTTLE SIZE:{" "}
            <span className="text-gray-200">{wine.bottleSize}ML</span>
          </p>
        </div>
      </div>

      <div className="flex items-center border-l border-l-foreground/30 text-sm px-6 gap-x-14">
        <div className="space-y-2">
          <p className="text-xs text-gray-300">PRICE</p>
          <p>N{wine.price}</p>
        </div>
        <div className="space-y-2">
          <p className="text-xs text-gray-300">CATEGORY</p>
          <p>{wine.category}</p>
        </div>
        <div className="space-y-2">
          <button className="text-sm flex items-center gap-2 w-[8.4rem] justify-center h-[1.5rem] border-2 border-foreground/40 rounded-lg">
            <Ellipsis className="h-4" />
          </button>
          <button className="text-sm flex items-center gap-2 w-[8.4rem] justify-center h-[1.5rem] bg-accent/80 text-background rounded-lg">
            <ShoppingBasket className="h-4" />
            <p>Add to cart</p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default TableRow;
