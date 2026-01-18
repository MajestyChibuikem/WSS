"use client";
import React, { useState } from "react";
import CartCard from "../components/cart_card";
import { Percent, Tag } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import {
  clearCart,
  getCartTotal,
  setDiscount,
  toggleTax,
  TAX_RATE,
} from "../store/slices/inventorySlice";
import { useCheckoutMutation } from "../store/slices/apiSlice";
import clsx from "clsx";
import { toast } from "react-toastify";
import { formatDecimal } from "../utils/helpers";
import Receipt from "../components/receipt";

function Page() {
  const dispatch = useDispatch();
  const inventoryCart = useSelector((state: RootState) => state.inventory);
  const {
    subtotal,
    discountAmount,
    discountPercent,
    taxAmount,
    taxEnabled,
    total,
    discountedTotal,
  } = useSelector(getCartTotal);
  const [discountInput, setDiscountInput] = useState("");
  const [checkout, { isLoading, error }] = useCheckoutMutation();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<null | {
    transactionId: string;
    date: string;
    time: string;
    total: string;
    cartItems: Array<{
      id: number;
      name: string;
      price: number;
      quantity: number;
    }>;
    status: "Successful" | "Pending" | "Failed";
  }>(null);

  const handleCheckout = async () => {
    toast("Checking out cart items...");
    const items = inventoryCart.cart.map((item) => ({
      item: { id: item.id },
      number_sold: item.quantity,
    }));
    if (items.length === 0) return;

    try {
      const response = await checkout({
        items,
        total_amount: discountedTotal,
      }).unwrap();

      const now = new Date();
      const receipt = {
        transactionId: String(response?.invoice_id) ?? `TX${Date.now()}`,
        date: now.toISOString().split("T")[0],
        time: now.toTimeString().split(" ")[0],
        cartItems: inventoryCart.cart,
        total: `${formatDecimal(discountedTotal).formatted}`,
        status: "Successful" as const,
      };

      setReceiptData(receipt);
      setShowConfirmation(false);
      dispatch(clearCart());
      toast.success("Checkout successful");
      setShowReceipt(true);
    } catch (err) {
      toast.error("Couldn't checkout at the moment. Try again later.");
      console.error("Checkout failed:", err);
    }
  };

  return (
    <div className="px-4 lg:px-10 w-full overflow-y-auto h-[calc(100vh-5rem)]">
      <h1 className="text-2xl lg:text-3xl py-6 lg:py-8 font-semibold">Cart</h1>
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-16">
        {/* Cart items */}
        <section className="flex-1 space-y-2 divide-y divide-wBrand-foreground/5">
          {/* Header - hidden on mobile */}
          <div className="hidden sm:flex w-full justify-between text-sm text-wBrand-foreground/70 items-center p-4 py-2">
            <div className="w-[50%]">
              <h2 className="font-medium">PRODUCT</h2>
            </div>
            <div className="text-sm w-[25%] flex justify-center">
              <h2 className="font-medium">QUANTITY</h2>
            </div>
            <div className="w-[25%] flex justify-end">
              <h2 className="font-medium">PRICE</h2>
            </div>
          </div>
          {inventoryCart.cart.length == 0 && (
            <div className="w-full flex items-center justify-center text-xl lg:text-2xl font-semibold text-wBrand-accent/20 h-[30vh]">
              <p>Cart is currently empty</p>
            </div>
          )}
          {inventoryCart.cart.map((product, idx) => (
            <CartCard key={idx} product={product} quantity={product.quantity} />
          ))}
        </section>

        {/* Confirmation Modal */}
        {showConfirmation && (
          <section className="fixed inset-0 z-50 bg-black/70 flex justify-center items-center p-4">
            <div className="w-full max-w-md border border-wBrand-accent/30 shadow-xl p-5 px-6 bg-wBrand-background space-y-10 rounded-2xl">
              <h1 className="text-xl lg:text-2xl font-medium">
                Are you sure you want to checkout products?
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

        {/* Receipt Modal */}
        {receiptData && (
          <section
            onClick={() => setReceiptData(null)}
            className="fixed inset-0 bg-wBrand-background/90 z-20 flex justify-center items-start pt-[10%] p-4 overflow-y-auto"
          >
            <Receipt {...receiptData} />
          </section>
        )}

        {/* Order Summary */}
        <section className="w-full lg:w-80 xl:w-96 border space-y-4 p-6 rounded-xl border-wBrand-foreground/30 h-fit sticky top-4">
          <div className="space-y-3">
            <h2 className="font-medium">Your Order</h2>
            <div className="text-sm font-light space-y-2 max-h-48 overflow-y-auto">
              {inventoryCart.cart.length == 0 && (
                <p className="text-gray-500 font-semibold">Cart is empty</p>
              )}
              {inventoryCart.cart.map((product, idx) => (
                <div key={idx} className="flex justify-between text-wBrand-foreground/70">
                  <p className="truncate flex-1 mr-2">{product.name}</p>
                  <p className="text-base font-medium whitespace-nowrap">
                    <span className="text-xs font-medium text-white/50">
                      x{product.quantity}
                    </span>{" "}
                    {formatDecimal(product.price * product.quantity).formatted}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Discount Input */}
          <div className="space-y-2 border-t border-wBrand-foreground/10 pt-4">
            <label className="text-xs text-gray-400 flex items-center gap-1">
              <Tag className="h-3 w-3" />
              DISCOUNT CODE
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                max="100"
                placeholder="Enter %"
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
                className="flex-1 bg-wBrand-background_light border border-wBrand-foreground/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-wBrand-accent"
              />
              <button
                onClick={() => {
                  const value = parseFloat(discountInput);
                  if (!isNaN(value)) {
                    dispatch(setDiscount(value));
                    toast.success(`Discount of ${value}% applied`);
                  }
                }}
                className="px-4 py-2 bg-wBrand-accent/20 text-wBrand-accent text-sm rounded-lg hover:bg-wBrand-accent/30"
              >
                Apply
              </button>
            </div>
            {discountPercent > 0 && (
              <button
                onClick={() => {
                  dispatch(setDiscount(0));
                  setDiscountInput("");
                  toast.info("Discount removed");
                }}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Remove discount
              </button>
            )}
          </div>

          {/* Tax Toggle */}
          <div className="flex items-center justify-between py-2">
            <label className="text-sm text-gray-400 flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Include VAT ({(TAX_RATE * 100).toFixed(1)}%)
            </label>
            <button
              onClick={() => dispatch(toggleTax())}
              className={clsx(
                "w-12 h-6 rounded-full transition-colors relative",
                taxEnabled ? "bg-wBrand-accent" : "bg-gray-600"
              )}
            >
              <div
                className={clsx(
                  "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                  taxEnabled ? "translate-x-7" : "translate-x-1"
                )}
              />
            </button>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2 border-t border-wBrand-foreground/10 pt-4 text-sm">
            <div className="flex justify-between text-wBrand-foreground/60">
              <span>Subtotal</span>
              <span>{formatDecimal(subtotal).formatted}</span>
            </div>
            {discountPercent > 0 && (
              <div className="flex justify-between text-green-400">
                <span>Discount ({discountPercent}%)</span>
                <span>-{formatDecimal(discountAmount).formatted}</span>
              </div>
            )}
            {taxEnabled && (
              <div className="flex justify-between text-wBrand-foreground/60">
                <span>VAT ({(TAX_RATE * 100).toFixed(1)}%)</span>
                <span>{formatDecimal(taxAmount).formatted}</span>
              </div>
            )}
          </div>

          {/* Grand Total */}
          <div className="flex justify-between items-baseline text-wBrand-foreground border-t border-wBrand-foreground/10 pt-4">
            <h3>Grand total</h3>
            <p className="text-2xl lg:text-3xl font-medium">
              {formatDecimal(total).formatted}
            </p>
          </div>

          <button
            disabled={inventoryCart.cart.length == 0 || isLoading}
            onClick={() => setShowConfirmation(true)}
            className={clsx(
              "px-5 py-3 font-semibold w-full rounded-xl text-wBrand-background",
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
