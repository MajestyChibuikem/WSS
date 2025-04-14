"use client";
import React, { useState } from "react";
import CartCard from "../components/cart_card";
import { wineInventory } from "../utils/mock_data";
import { DollarSign, Mail } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { clearCart, getCartTotal } from "../store/slices/inventorySlice";
import { useCheckoutMutation } from "../store/slices/apiSlice";
import clsx from "clsx";
import { toast } from "react-toastify";
import { formatDecimal } from "../utils/helpers";

function Page() {
  const dispatch = useDispatch();
  const inventoryCart = useSelector((state: RootState) => state.inventory);
  const { total, discountedTotal } = useSelector(getCartTotal);
  const [checkout, { isLoading, error }] = useCheckoutMutation();
  const [showConfirmation, setShowConfirmation] = useState(false);

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
      setShowConfirmation(false);
    } catch (err) {
      toast.error("Couldn't checkout at the moment try again later");
      console.error("Checkout failed:", err);
      setShowConfirmation(false);
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
          {inventoryCart.cart.map((product, idx) => (
            <CartCard key={idx} product={product} quantity={product.quantity} />
          ))}
        </section>

        {showConfirmation && (
          <section className="fixed top-0 right-0 z-50 h-full w-full bg-black/70 flex justify-center items-center">
            <div className="w-[32rem] border border-wBrand-accent/30 shadow-xl p-5 px-6 bg-wBrand-background space-y-10 rounded-2xl">
              <h1 className="text-2xl font-medium">
                Are you sure you want to checkout wines?
              </h1>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="border border-wBrand-accent text-sm px-6 py-2 rounded-lg"
                >
                  No
                </button>
                <button
                  onClick={handleCheckout}
                  className="bg-wBrand-accent px-6 py-2 text-sm rounded-lg"
                >
                  Yes
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="w-[30vw] border space-y-6 p-6 rounded-xl border-wBrand-foreground/30">
          <div className="space-y-4">
            <h2 className="font-medium">Your Order</h2>
            <div className="text-sm font-light space-y-2">
              {inventoryCart.cart.length == 0 && (
                <p className="text-gray-500 font-semibold">cart is empty</p>
              )}
              {inventoryCart.cart.map((product, idx) => (
                <div className="flex justify-between text-wBrand-foreground/70">
                  <p key={idx}>{product.name}</p>
                  <p key={idx} className="text-base font-medium">
                    <span className="text-xs font-medium text-white/50">
                      x{product.quantity}
                    </span>{" "}
                    {formatDecimal(product.price).formatted}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-baseline text-wBrand-foreground  border-t-wBrand-foreground/10">
            <h3>Grand total</h3>
            <p className="text-3xl font-medium">
              {formatDecimal(discountedTotal).formatted}
            </p>
          </div>
          <button
            disabled={inventoryCart.cart.length == 0 || isLoading}
            onClick={() => setShowConfirmation(true)}
            className={clsx(
              "px-5 py-2 font-semibold w-full rounded-xl",
              inventoryCart.cart.length == 0 || isLoading
                ? "bg-gray-600"
                : "bg-wBrand-accent"
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
