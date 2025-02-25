import React from "react";
import { Wine } from "../utils/mock_data";
import { Trash } from "lucide-react";

interface Params {
  wine: Wine;
}

function CartCard({ wine }: Params) {
  return (
    <div className="flex w-full justify-between items-center p-4">
      <div className="space-y-2">
        <h2 className="font-medium">{wine.name}</h2>
        <div className="text-gray-400 flex items-center gap-2 text-xs">
          <p>
            NO IN STOCK: <span className="text-gray-200">{wine.inStock}</span>
          </p>
          <div className="h-1 w-1 rounded-full bg-gray-400" />
          <p>
            ABV: <span className="text-gray-200">{wine.abv}%</span>
          </p>
          <div className="h-1 w-1 rounded-full bg-gray-400" />
          <p>
            CATEGORY: <span className="text-gray-200">{wine.category}</span>
          </p>
        </div>
      </div>

      <div className="space-y-4 text-sm">
        <div className="flex border border-foreground/30 overflow-clip h-8 justify-between items-center rounded-lg">
          <button className="h-8 w-8 hover:bg-foreground/10">-</button>
          <div className="">1</div>
          <button className="h-8 w-8 hover:bg-foreground/10">+</button>
        </div>
        <button className="space-x-2 flex items-center">
          <Trash className="h-4" />
          <p>Remove</p>
        </button>
      </div>

      <div className="space-y-2">
        <p>N{wine.price}</p>
      </div>
    </div>
  );
}

export default CartCard;
