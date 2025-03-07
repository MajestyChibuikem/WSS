import { Ellipsis, ShoppingBasket, Trash } from "lucide-react";
import React, { useEffect } from "react";
import { actionDropdownItems } from "../utils/mock_data";
import { Actions, Wine } from "../utils/types";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import {
  DropdownState,
  toggleDropdown,
  updateToggleItem,
} from "../store/slices/dropdownSlice";
import {
  addToCart,
  decrementCartItemQuantity,
  incrementCartItemQuantity,
  removeFromCart,
} from "../store/slices/inventorySlice";

interface Params {
  wine: Wine;
  id: string;
}

function TableRow({ wine, id }: Params) {
  const dispatch = useDispatch();
  const dropdown = useSelector(
    (state: RootState) =>
      (state.dropdown as DropdownState<Actions>).dropdowns[id]
  );
  const inventoryCart = useSelector((state: RootState) => state.inventory.cart);

  return (
    // <div className="flex text-sm rounded-xl items-center p-3 px-5 w-full justify-between gap-x-8">
    //   <div className="flex w-[25%]">
    //     <h2>Wine title</h2>
    //   </div>
    //   <div className="flex justify-center w-[20%]">
    //     <p>wine category</p>
    //   </div>
    //   <div className="flex justify-center w-[15%]">
    //     <p>10</p>
    //   </div>
    //   <div className="flex justify-center w-[10%]">
    //     <p>N100,000</p>
    //   </div>
    //   <div className="flex justify-center w-[25%]">
    //     <button className="text-sm flex items-center gap-2 p-4 justify-center h-[1.5rem] bg-accent/60 text-foreground rounded-lg">
    //       <ShoppingBasket className="h-4" />
    //       <p>Add to cart</p>
    //     </button>
    //   </div>
    //   <div className="flex justify-center w-[10%]">
    //     <button className="text-sm flex items-center gap-2 p-4 justify-center h-[1.5rem] rounded-lg">
    //       <Ellipsis className="h-4" />
    //     </button>
    //   </div>
    // </div>
    <div className="flex w-full rounded-xl bg-background_light/60 space-x-24 justify-between p-4">
      <div className="space-y-2">
        <h2 className="text-base font-medium">{wine.name}</h2>
        <div className="text-gray-400 flex items-center gap-2 text-xs">
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

      <div className="flex items-center border-l border-l-foreground/30 text-sm px-6 gap-x-14">
        <div className="space-y-2">
          <p className="text-xs text-gray-300">PRICE</p>
          <p>N{wine.price}</p>
        </div>
        <div className="space-y-2">
          <p className="text-xs text-gray-300">CATEGORY</p>
          <p>{wine.category}</p>
        </div>
        <div className="space-y-2">
          {!inventoryCart.some((item) => item.id === wine.id) && (
            <button
              onClick={() => dispatch(toggleDropdown(id))}
              className="text-sm flex items-center relative gap-2 w-[8.4rem] justify-center h-8 border-2 border-foreground/40 rounded-lg"
            >
              <Ellipsis className="h-4" />
              {dropdown && dropdown.show && (
                <div className="w-full absolute bg-background z-10 p-2 space-y-1 rounded-xl border border-foreground/20 top-7 shadow-xl">
                  {actionDropdownItems.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(
                          updateToggleItem({
                            id,
                            item,
                          })
                        );
                      }}
                      className="flex gap-3 p-3 hover:bg-background_light/70 rounded-lg cursor-pointer"
                    >
                      {item.icon}
                      <p className="text-foreground/80 font-medium">
                        {item.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </button>
          )}

          {!inventoryCart.some((item) => item.id === wine.id) && (
            <button
              onClick={() => dispatch(addToCart(wine))}
              className="text-sm flex items-center gap-2 w-[8.4rem] justify-center h-8 bg-accent/80 text-background rounded-lg"
            >
              <ShoppingBasket className="h-4" />
              <p>Add to cart</p>
            </button>
          )}
          {inventoryCart.some((item) => item.id === wine.id) && (
            <div className="space-y-4 text-sm w-[8.4rem] flex flex-col justify-center">
              <div className="flex border border-foreground/30 overflow-clip space-x-2 w-full h-8 justify-between items-center rounded-lg">
                <button
                  onClick={() => dispatch(decrementCartItemQuantity(wine.id))}
                  className="h-8 w-8 hover:bg-foreground/10"
                >
                  -
                </button>
                <div className="">
                  {inventoryCart.find((item) => item.id == wine.id)?.quantity}
                </div>
                <button
                  onClick={() => dispatch(incrementCartItemQuantity(wine.id))}
                  className="h-8 w-8 hover:bg-foreground/10"
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
          )}
        </div>
      </div>
    </div>
  );
}

export default TableRow;
