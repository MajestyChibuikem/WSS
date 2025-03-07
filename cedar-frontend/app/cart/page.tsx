"use client";
import React from "react";
import CartCard from "../components/cart_card";
import { wineInventory } from "../utils/mock_data";
import { DollarSign, Mail } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { getCartTotal } from "../store/slices/inventorySlice";

function Page() {
  const dispatch = useDispatch();
  const inventoryCart = useSelector((state: RootState) => state.inventory);
  const { total, discountedTotal } = useSelector(getCartTotal);

  return (
    <div className="px-10">
      <h1 className="text-3xl py-8 pl-2 font-semibold">Cart</h1>
      <div className="flex space-x-16">
        <section className="w-[60vw] space-y-2  divide-y divide-foreground/5">
          <div className="flex w-full justify-between text-sm text-foreground/70 items-center p-4 py-2">
            <div className="w-[50%]">
              <h2 className="font-medium">WINE</h2>
            </div>

            <div className="text-sm w-[25%] flex justify-center">
              <h2 className="font-medium">QUANTITY</h2>
            </div>

            <div className="w-[25%] flex justify-end">
              <h2 className="font-medium">PRICE</h2>
            </div>
          </div>
          {inventoryCart.cart.length == 0 && (
            <div className="w-full flex items-center justify-center text-2xl font-semibold text-accent/20 h-[30vh]">
              <p>Cart is currently empty</p>
            </div>
          )}
          {inventoryCart.cart.map((wine, idx) => (
            <CartCard key={idx} wine={wine} />
          ))}
        </section>

        <section className="w-[30vw] border space-y-6 p-6 rounded-xl border-foreground/30">
          <div className="space-y-4">
            <h2 className="font-medium">Your Order</h2>
            <div className="text-sm font-light space-y-2">
              {inventoryCart.cart.length == 0 && (
                <p className="text-gray-500 font-semibold">cart is empty</p>
              )}
              {inventoryCart.cart.map((wine, idx) => (
                <div className="flex justify-between text-foreground/70">
                  <p key={idx}>{wine.name}</p>
                  <p key={idx} className="text-base font-medium">
                    <span className="text-xs font-medium text-white/50">
                      x{wine.quantity}
                    </span>{" "}
                    N{wine.price}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="font-medium">Discount Code</h2>
            <div className="text-sm flex gap-4">
              <div className="flex w-full rounded-xl border border-foreground/20 overflow-clip bg-background/40">
                <div className="border-r bg-background border-foreground/20 p-3">
                  <DollarSign className="h-4" />
                </div>
                <input
                  type="number"
                  placeholder="ENTER DISCOUNT"
                  className="outline-none min-h-full pl-4 bg-transparent w-full"
                />
              </div>
              <button className="px-5 py-2 font-semibold bg-accent text-background rounded-xl">
                Apply
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="font-medium">Customer Email</h2>
            <div>
              <div className="text-sm flex">
                <div className="flex w-full rounded-xl border border-foreground/20 overflow-clip bg-background/40">
                  <div className="border-r bg-background border-foreground/20 p-3">
                    <Mail className="h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="ENTER EMAIL"
                    className="outline-none min-h-full pl-4 bg-transparent w-full"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-foreground/10 pt-5 space-y-2">
            <div className="flex justify-between text-foreground/70">
              <h3>Subtotal</h3>
              <p className="text-lg text-foreground">N{total}</p>
            </div>
            <div className="flex justify-between text-foreground/70">
              <h3>Discount</h3>
              <p>-N{inventoryCart.discount}</p>
            </div>
          </div>
          <div className="flex justify-between text-foreground border-t pt-5 border-t-foreground/10">
            <h3>Grand total</h3>
            <p className="text-xl font-medium">N{discountedTotal}</p>
          </div>
          <button className="px-5 py-2 font-semibold bg-accent w-full text-background rounded-xl">
            Checkout Now
          </button>
        </section>
      </div>
    </div>
  );
}

export default Page;
