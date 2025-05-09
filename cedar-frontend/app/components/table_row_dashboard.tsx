import React from "react";
import { Product } from "../utils/types";

interface Params {
  product: Product;
}

function TableRowDashboard({ product }: Params) {
  return (
    <div className="flex w-full rounded-xl bg-wBrand-background_light/60 space-x-24 justify-between p-4 py-4">
      <div className="space-y-2">
        <h2 className="text-sm font-medium">{product.name}</h2>
        <div className="text-gray-400 flex items-center gap-2 text-[0.5rem]">
          <p>
            ID: <span className="text-gray-200">#{product.id}</span>
          </p>
          <div className="h-1 w-1 rounded-full bg-gray-400" />
          <p>
            NO IN STOCK:{" "}
            <span className="text-gray-200">{product.in_stock}</span>
          </p>
          {/* <div className="h-1 w-1 rounded-full bg-gray-400" />
          <p>
            ABV: <span className="text-gray-200">{product.abv}%</span>
          </p> */}
          {/* <div className="h-1 w-1 rounded-full bg-gray-400" />
          <p>
            BOTTLE SIZE:{" "}
            <span className="text-gray-200">{product.bottle_size}ML</span>
          </p> */}
        </div>
      </div>

      <div className="flex items-center border-l border-l-wBrand-foreground/30 text-xs px-6 gap-x-14">
        <div className="space-y-2">
          <p className="text-[0.5rem] text-gray-300">PRICE</p>
          <p>N{product.price}</p>
        </div>
        <div className="space-y-2">
          <p className="text-[0.5rem] text-gray-300">CATEGORY</p>
          <p>{product.category}</p>
        </div>
      </div>
    </div>
  );
}

export default TableRowDashboard;
