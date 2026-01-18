"use client";
import React from "react";
import { Product } from "../utils/types";
import { Package, Trash } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import {
  decrementCartItemQuantity,
  incrementCartItemQuantity,
  removeFromCart,
} from "../store/slices/inventorySlice";
import { formatDecimal } from "../utils/helpers";
import Image from "next/image";

interface Params {
  product: Product;
  quantity: number;
}

function CartCard({ product, quantity }: Params) {
  const dispatch = useDispatch();
  const inventoryCart = useSelector((state: RootState) => state.inventory.cart);

  return (
    <div className="flex w-full justify-between items-center p-4 gap-4">
      {/* Product image and info */}
      <div className="flex items-center gap-4 w-full sm:w-[50%]">
        {/* Product image */}
        <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-wBrand-background_light overflow-hidden flex items-center justify-center">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              width={64}
              height={64}
              className="object-cover w-full h-full"
            />
          ) : (
            <Package className="h-8 w-8 text-wBrand-foreground/20" />
          )}
        </div>
        <div className="space-y-1 min-w-0 flex-1">
          <h2 className="font-medium truncate">{product.name}</h2>
          <div className="text-gray-400 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            <p>
              STOCK:{" "}
              <span className="text-gray-200">{product.in_stock}</span>
            </p>
            <div className="h-1 w-1 rounded-full bg-gray-400 hidden sm:block" />
            <p className="hidden sm:block">
              ABV: <span className="text-gray-200">{product.abv}%</span>
            </p>
            <div className="h-1 w-1 rounded-full bg-gray-400 hidden sm:block" />
            <p className="hidden sm:block">
              <span className="text-gray-200">{product.category}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Quantity controls */}
      <div className="hidden sm:flex w-[25%] justify-center">
        <div className="space-y-2 text-sm w-[8.4rem] flex flex-col justify-center">
          <div className="flex border border-wBrand-foreground/30 overflow-clip w-full h-8 justify-between items-center rounded-lg">
            <button
              onClick={() => dispatch(decrementCartItemQuantity(product.id))}
              className="h-8 w-8 hover:bg-wBrand-foreground/10"
            >
              -
            </button>
            <div>
              {inventoryCart.find((item) => item.id == product.id)?.quantity}
            </div>
            <button
              onClick={() => dispatch(incrementCartItemQuantity(product.id))}
              className="h-8 w-8 hover:bg-wBrand-foreground/10"
            >
              +
            </button>
          </div>
          <button
            onClick={() => dispatch(removeFromCart(product.id))}
            className="space-x-2 w-full flex justify-center items-center text-red-400 hover:text-red-300"
          >
            <Trash className="h-4" />
            <p>Remove</p>
          </button>
        </div>
      </div>

      {/* Price */}
      <div className="hidden sm:flex w-[25%] justify-end">
        <p className="text-lg font-medium">{formatDecimal(product.price * quantity).formatted}</p>
      </div>

      {/* Mobile: quantity + price + remove */}
      <div className="sm:hidden flex flex-col items-end gap-2">
        <p className="font-medium">{formatDecimal(product.price * quantity).formatted}</p>
        <div className="flex border border-wBrand-foreground/30 overflow-clip h-8 justify-between items-center rounded-lg">
          <button
            onClick={() => dispatch(decrementCartItemQuantity(product.id))}
            className="h-8 w-8 hover:bg-wBrand-foreground/10"
          >
            -
          </button>
          <div className="px-2">
            {inventoryCart.find((item) => item.id == product.id)?.quantity}
          </div>
          <button
            onClick={() => dispatch(incrementCartItemQuantity(product.id))}
            className="h-8 w-8 hover:bg-wBrand-foreground/10"
          >
            +
          </button>
        </div>
        <button
          onClick={() => dispatch(removeFromCart(product.id))}
          className="text-xs text-red-400 hover:text-red-300"
        >
          <Trash className="h-4" />
        </button>
      </div>
    </div>
  );
}

export default CartCard;
