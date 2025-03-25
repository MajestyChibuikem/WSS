"use client";
import React from "react";
import CartCard from "../components/cart_card";
import { wineInventory } from "../utils/mock_data";
import { DollarSign, Mail } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { clearCart, getCartTotal } from "../store/slices/inventorySlice";
import { useCheckoutMutation } from "../store/slices/apiSlice";
import clsx from "clsx";
import { toast } from "react-toastify";

function Page() {
  const dispatch = useDispatch();
  const inventoryCart = useSelector((state: RootState) => state.inventory);
  const { total, discountedTotal } = useSelector(getCartTotal);
  const [checkout, { isLoading, error }] = useCheckoutMutation();

  const handleCheckout = async () => {
    toast("Checking out cart items...");
    const items: Array<{ item: { id: number }; number_sold: number }> = [];
    inventoryCart.cart.forEach((item) => {
      items.push({
        item: { id: item.id },
        number_sold: item.quantity,
      });
    });
    if (items.length == 0) return;
    try {
      const response = await checkout({
        items,
        total_amount: discountedTotal,
      }).unwrap();

      dispatch(clearCart());
      toast.success("Checkout successful");
    } catch (err) {
      toast.error("Couldn't checkout at the moment try again later");
      console.error("Checkout failed:", err);
    }
  };

  return (
    <div className="px-10 w-full overflow-y-auto h-[calc(100vh-5rem)]">
      <h1 className="text-3xl py-8 pl-2 font-semibold">Cart</h1>
      <div className="flex space-x-16">
        <section className="w-[60vw] space-y-2  divide-y divide-wBrand-foreground/5">
          <div className="flex w-full justify-between text-sm text-wBrand-foreground/70 items-center p-4 py-2">
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
            <div className="w-full flex items-center justify-center text-2xl font-semibold text-wBrand-accent/20 h-[30vh]">
              <p>Cart is currently empty</p>
            </div>
          )}
          {inventoryCart.cart.map((wine, idx) => (
            <CartCard key={idx} wine={wine} />
          ))}
        </section>

        <section className="w-[30vw] border space-y-6 p-6 rounded-xl border-wBrand-foreground/30">
          <div className="space-y-4">
            <h2 className="font-medium">Your Order</h2>
            <div className="text-sm font-light space-y-2">
              {inventoryCart.cart.length == 0 && (
                <p className="text-gray-500 font-semibold">cart is empty</p>
              )}
              {inventoryCart.cart.map((wine, idx) => (
                <div className="flex justify-between text-wBrand-foreground/70">
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
          {/* <div className="space-y-4">
            <h2 className="font-medium">Discount Code</h2>
            <div className="text-sm flex gap-4">
              <div className="flex w-full rounded-xl border border-wBrand-foreground/20 overflow-clip bg-wBrand-background/40">
                <div className="border-r bg-wBrand-background border-wBrand-foreground/20 p-3">
                  <DollarSign className="h-4" />
                </div>
                <input
                  type="number"
                  placeholder="ENTER DISCOUNT"
                  className="outline-none min-h-full pl-4 bg-transparent w-full"
                />
              </div>
              <button className="px-5 py-2 font-semibold bg-wBrand-accent text-wBrand-background rounded-xl">
                Apply
              </button>
            </div>
          </div> */}
          <div className="space-y-4">
            <h2 className="font-medium">Customer Email</h2>
            <div>
              <div className="text-sm flex">
                <div className="flex w-full rounded-xl border border-wBrand-foreground/20 overflow-clip bg-wBrand-background/40">
                  <div className="border-r bg-wBrand-background border-wBrand-foreground/20 p-3">
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
          <div className="border-t border-wBrand-foreground/10 pt-3 space-y-2">
            {/* <div className="flex justify-between text-wBrand-foreground/70">
              <h3>Subtotal</h3>
              <p className="text-lg text-wBrand-foreground">N{total}</p>
            </div> */}
            {/* <div className="flex justify-between text-wBrand-foreground/70">
              <h3>Discount</h3>
              <p>-N{inventoryCart.discount}</p>
            </div> */}
          </div>
          <div className="flex justify-between text-wBrand-foreground  border-t-wBrand-foreground/10">
            <h3>Grand total</h3>
            <p className="text-xl font-medium">N{discountedTotal}</p>
          </div>
          <button
            onClick={handleCheckout}
            disabled={inventoryCart.cart.length == 0 || isLoading}
            className={clsx(
              "px-5 py-2 font-semibold bg-wBrand-accent w-full rounded-xl",
              inventoryCart.cart.length == 0 || isLoading
                ? "bg-gray-600"
                : "text-wBrand-background"
            )}
          >
            Checkout Now
          </button>
        </section>
      </div>
    </div>
  );
}

export default Page;
