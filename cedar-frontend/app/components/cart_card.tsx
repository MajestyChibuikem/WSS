"use client";
import React from "react";
import { Wine } from "../utils/types";
import { Trash } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import {
  decrementCartItemQuantity,
  incrementCartItemQuantity,
  removeFromCart,
} from "../store/slices/inventorySlice";
import { formatDecimal } from "../utils/helpers";

interface Params {
  wine: Wine;
  quantity: number;
}

function CartCard({ wine, quantity }: Params) {
  const dispatch = useDispatch();
  const inventoryCart = useSelector((state: RootState) => state.inventory.cart);

  return (
    <div className="flex w-full justify-between items-center p-4">
      <div className="space-y-2 w-[50%]">
        <h2 className="font-medium">{wine.name}</h2>
        <div className="text-gray-400 flex items-center gap-2 text-xs">
          <p>
            NO IN STOCK: <span className="text-gray-200">{wine.in_stock}</span>
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

      <div className="w-[25%] flex justify-center">
        <div className="space-y-4 text-sm w-[8.4rem] flex flex-col justify-center">
          <div className="flex border border-wBrand-foreground/30 overflow-clip space-x-2 w-full h-8 justify-between items-center rounded-lg">
            <button
              onClick={() => dispatch(decrementCartItemQuantity(wine.id))}
              className="h-8 w-8 hover:bg-wBrand-foreground/10"
            >
              -
            </button>
            <div className="">
              {inventoryCart.find((item) => item.id == wine.id)?.quantity}
            </div>
            <button
              onClick={() => dispatch(incrementCartItemQuantity(wine.id))}
              className="h-8 w-8 hover:bg-wBrand-foreground/10"
            >
              +
            </button>
          </div>
          <button
            onClick={() => dispatch(removeFromCart(wine.id))}
            className="space-x-2 w-full flex justify-center items-center"
          >
            <Trash className="h-4" />
            <p>Remove</p>
          </button>
        </div>
      </div>

      <div className="space-y-2 w-[25%] flex justify-end">
        <p>{formatDecimal(wine.price * quantity).formatted}</p>
      </div>
    </div>
  );
}

export default CartCard;
