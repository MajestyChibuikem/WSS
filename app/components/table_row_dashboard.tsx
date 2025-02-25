import React from "react";
import { Wine } from "../utils/mock_data";

interface Params {
  wine: Wine;
}

function TableRowDashboard({ wine }: Params) {
  return (
    <div className="flex w-full rounded-xl bg-background_light/60 space-x-24 justify-between p-4">
      <div className="space-y-2">
        <h2 className="text-sm font-medium">{wine.name}</h2>
        <div className="text-gray-400 flex items-center gap-2 text-[0.5rem]">
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

      <div className="flex items-center border-l border-l-foreground/30 text-xs px-6 gap-x-14">
        <div className="space-y-2">
          <p className="text-[0.5rem] text-gray-300">PRICE</p>
          <p>N{wine.price}</p>
        </div>
        <div className="space-y-2">
          <p className="text-[0.5rem] text-gray-300">CATEGORY</p>
          <p>{wine.category}</p>
        </div>
      </div>
    </div>
  );
}

export default TableRowDashboard;
