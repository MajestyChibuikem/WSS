import React from "react";
import { Product } from "../utils/types";
import { Package } from "lucide-react";
import Image from "next/image";
import { formatDecimal } from "../utils/helpers";
import { StockBadge, StockIndicator } from "./stock_badge";

interface Params {
  product: Product;
}

function TableRowDashboard({ product }: Params) {
  return (
    <div className="flex w-full rounded-xl bg-wBrand-background_light/60 gap-4 justify-between p-3 lg:p-4">
      <div className="flex items-center gap-3">
        {/* Product image */}
        <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-wBrand-background overflow-hidden flex items-center justify-center">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              width={40}
              height={40}
              className="object-cover w-full h-full"
            />
          ) : (
            <Package className="h-5 w-5 text-wBrand-foreground/20" />
          )}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium truncate max-w-[100px] lg:max-w-none">{product.name}</h2>
            <StockBadge stock={product.in_stock ?? 0} showLabel={false} className="hidden sm:flex" />
          </div>
          <div className="text-gray-400 flex items-center gap-2 text-[0.6rem]">
            <p>
              ID: <span className="text-gray-200">#{product.id}</span>
            </p>
            <div className="h-1 w-1 rounded-full bg-gray-400" />
            <StockIndicator stock={product.in_stock ?? 0} />
          </div>
        </div>
      </div>

      <div className="flex items-center border-l border-l-wBrand-foreground/30 text-xs pl-4 lg:px-6 gap-x-4 lg:gap-x-14">
        <div className="space-y-1">
          <p className="text-[0.5rem] text-gray-300">PRICE</p>
          <p>{formatDecimal(Number(product.price)).formatted}</p>
        </div>
        <div className="space-y-1 hidden sm:block">
          <p className="text-[0.5rem] text-gray-300">CATEGORY</p>
          <p>{product.category}</p>
        </div>
      </div>
    </div>
  );
}

export default TableRowDashboard;
